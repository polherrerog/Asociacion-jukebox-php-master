<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/sesion.php';
require_once __DIR__ . '/../lib/almacen-json.php';

function responderJson(int $codigo, array $datos, array $cabeceras = []): void
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    foreach ($cabeceras as $nombre => $valor) {
        header("{$nombre}: {$valor}");
    }
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function filtrarParaApi(array $canciones): array
{
    return array_values(array_map(function ($c) {
        return [
            'id' => (int) ($c['id'] ?? 0),
            'title' => (string) ($c['title'] ?? $c['titulo'] ?? ''),
            'artist' => (string) ($c['artist'] ?? $c['artista'] ?? ''),
            'category' => (string) ($c['category'] ?? $c['genero'] ?? ''),
            'duration' => (int) ($c['duration'] ?? $c['duracion'] ?? 0),
            'src' => (string) ($c['src'] ?? '')
        ];
    }, $canciones));
}

// 1. Control de Acceso: Sesión activa
if (empty($_SESSION['login']) || $_SESSION['login'] !== true) {
    responderJson(401, [
        'ok' => false,
        'error' => 'Debes iniciar sesión.'
    ]);
}

// 2. Control de Acción (action)
$action = $_GET['action'] ?? 'list';
if (!is_string($action)) {
    responderJson(400, [
        'ok' => false,
        'error' => 'El parámetro action debe ser una cadena de texto.'
    ]);
}

$accionesPermitidas = ['list', 'create', 'update', 'delete'];
if (!in_array($action, $accionesPermitidas, true)) {
    responderJson(400, [
        'ok' => false,
        'error' => "Acción desconocida: '{$action}'."
    ]);
}

// 3. Operación de consulta: list (solo GET)
if ($action === 'list') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        responderJson(405, [
            'ok' => false,
            'error' => 'Método no permitido para esa acción; use GET.'
        ], ['Allow' => 'GET']);
    }

    try {
        $canciones = leerCanciones();
        responderJson(200, [
            'ok' => true,
            'data' => filtrarParaApi($canciones)
        ]);
    } catch (Throwable $e) {
        error_log("Error en catalogo.php list: " . $e->getMessage());
        responderJson(500, [
            'ok' => false,
            'error' => 'No se puede leer o guardar el catálogo.'
        ]);
    }
}

// 4. Operaciones que modifican datos: create, update, delete (solo POST)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(405, [
        'ok' => false,
        'error' => "Método no permitido para esa acción; use POST."
    ], ['Allow' => 'POST']);
}

// Verificación CSRF Token
$csrfRecibido = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
$csrfSesion = $_SESSION['csrf'] ?? null;

if (!is_string($csrfRecibido) || !is_string($csrfSesion) || !hash_equals($csrfSesion, $csrfRecibido)) {
    responderJson(403, [
        'ok' => false,
        'error' => 'Token de protección ausente o incorrecto.'
    ]);
}

// Verificación Content-Type
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$tipoMime = strtolower(trim(explode(';', $contentType)[0]));
if ($tipoMime !== 'application/json') {
    responderJson(415, [
        'ok' => false,
        'error' => 'El cuerpo no se envía como application/json.'
    ]);
}

// Lectura y decodificación de JSON
$cuerpoRaw = file_get_contents('php://input');
if ($cuerpoRaw === false || trim($cuerpoRaw) === '') {
    responderJson(400, [
        'ok' => false,
        'error' => 'JSON mal escrito o cuerpo vacío.'
    ]);
}

// Eliminar marca de orden de bytes (BOM UTF-8) si viene presente
$cuerpoRaw = preg_replace('/^\xEF\xBB\xBF/', '', trim($cuerpoRaw));

try {
    $objeto = json_decode($cuerpoRaw, false, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    responderJson(400, [
        'ok' => false,
        'error' => 'JSON mal escrito o formato no válido.'
    ]);
}

if (!is_object($objeto)) {
    responderJson(400, [
        'ok' => false,
        'error' => 'Se esperaba un objeto JSON.'
    ]);
}

$datos = get_object_vars($objeto);

// 5. Ejecución según acción
try {
    if ($action === 'create') {
        // Validación de tipos y valores
        if (!isset($datos['title']) || !is_string($datos['title'])) {
            responderJson(422, ['ok' => false, 'error' => 'El título debe ser una cadena de texto.']);
        }
        $title = trim($datos['title']);
        if ($title === '' || mb_strlen($title) > 80) {
            responderJson(422, ['ok' => false, 'error' => 'El título no puede estar vacío ni superar los 80 caracteres.']);
        }

        if (!isset($datos['artist']) || !is_string($datos['artist'])) {
            responderJson(422, ['ok' => false, 'error' => 'El artista debe ser una cadena de texto.']);
        }
        $artist = trim($datos['artist']);
        if ($artist === '' || mb_strlen($artist) > 80) {
            responderJson(422, ['ok' => false, 'error' => 'El artista no puede estar vacío ni superar los 80 caracteres.']);
        }

        if (!isset($datos['category']) || !is_string($datos['category'])) {
            responderJson(422, ['ok' => false, 'error' => 'La categoría debe ser una cadena de texto.']);
        }
        $category = trim($datos['category']);
        if (!in_array($category, CATEGORIAS_VALIDAS, true)) {
            responderJson(422, ['ok' => false, 'error' => 'Categoría no admitida en el catálogo.']);
        }

        if (!isset($datos['duration']) || !is_int($datos['duration'])) {
            responderJson(422, ['ok' => false, 'error' => 'La duración debe ser un entero entre 1 y 1800 segundos.']);
        }
        $duration = $datos['duration'];
        if ($duration < 1 || $duration > 1800) {
            responderJson(422, ['ok' => false, 'error' => 'La duración debe ser un entero entre 1 y 1800 segundos.']);
        }

        if (!isset($datos['src']) || !is_string($datos['src'])) {
            responderJson(422, ['ok' => false, 'error' => 'La ruta de audio debe ser una cadena de texto.']);
        }
        $src = trim($datos['src']);
        if (!in_array($src, AUDIOS_VALIDOS, true)) {
            responderJson(422, ['ok' => false, 'error' => 'El archivo de audio no pertenece a la lista local autorizada.']);
        }

        $listaActualizada = crearCancion($title, $artist, $category, $duration, $src);
        responderJson(201, [
            'ok' => true,
            'data' => filtrarParaApi($listaActualizada)
        ]);
    }

    if ($action === 'update') {
        if (!isset($datos['id']) || !is_int($datos['id']) || $datos['id'] <= 0) {
            responderJson(422, ['ok' => false, 'error' => 'El identificador (id) debe ser un entero positivo.']);
        }
        $id = $datos['id'];

        if (!isset($datos['title']) || !is_string($datos['title'])) {
            responderJson(422, ['ok' => false, 'error' => 'El título debe ser una cadena de texto.']);
        }
        $title = trim($datos['title']);
        if ($title === '' || mb_strlen($title) > 80) {
            responderJson(422, ['ok' => false, 'error' => 'El título no puede estar vacío ni superar los 80 caracteres.']);
        }

        if (!isset($datos['artist']) || !is_string($datos['artist'])) {
            responderJson(422, ['ok' => false, 'error' => 'El artista debe ser una cadena de texto.']);
        }
        $artist = trim($datos['artist']);
        if ($artist === '' || mb_strlen($artist) > 80) {
            responderJson(422, ['ok' => false, 'error' => 'El artista no puede estar vacío ni superar los 80 caracteres.']);
        }

        if (!isset($datos['category']) || !is_string($datos['category'])) {
            responderJson(422, ['ok' => false, 'error' => 'La categoría debe ser una cadena de texto.']);
        }
        $category = trim($datos['category']);
        if (!in_array($category, CATEGORIAS_VALIDAS, true)) {
            responderJson(422, ['ok' => false, 'error' => 'Categoría no admitida en el catálogo.']);
        }

        if (!isset($datos['duration']) || !is_int($datos['duration'])) {
            responderJson(422, ['ok' => false, 'error' => 'La duración debe ser un entero entre 1 y 1800 segundos.']);
        }
        $duration = $datos['duration'];
        if ($duration < 1 || $duration > 1800) {
            responderJson(422, ['ok' => false, 'error' => 'La duración debe ser un entero entre 1 y 1800 segundos.']);
        }

        if (!isset($datos['src']) || !is_string($datos['src'])) {
            responderJson(422, ['ok' => false, 'error' => 'La ruta de audio debe ser una cadena de texto.']);
        }
        $src = trim($datos['src']);
        if (!in_array($src, AUDIOS_VALIDOS, true)) {
            responderJson(422, ['ok' => false, 'error' => 'El archivo de audio no pertenece a la lista local autorizada.']);
        }

        $listaActualizada = actualizarCancion($id, $title, $artist, $category, $duration, $src);
        if ($listaActualizada === null) {
            responderJson(404, [
                'ok' => false,
                'error' => 'La canción no existe.'
            ]);
        }

        responderJson(200, [
            'ok' => true,
            'data' => filtrarParaApi($listaActualizada)
        ]);
    }

    if ($action === 'delete') {
        if (!isset($datos['id']) || !is_int($datos['id']) || $datos['id'] <= 0) {
            responderJson(422, ['ok' => false, 'error' => 'El identificador (id) debe ser un entero positivo.']);
        }
        $id = $datos['id'];

        $listaActualizada = eliminarCancion($id);
        if ($listaActualizada === null) {
            responderJson(404, [
                'ok' => false,
                'error' => 'La canción no existe.'
            ]);
        }

        responderJson(200, [
            'ok' => true,
            'data' => filtrarParaApi($listaActualizada)
        ]);
    }
} catch (Throwable $e) {
    error_log("Error en catalogo.php operación {$action}: " . $e->getMessage());
    responderJson(500, [
        'ok' => false,
        'error' => 'No se puede leer o guardar el catálogo.'
    ]);
}
