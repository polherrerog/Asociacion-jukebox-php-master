<?php

const CATEGORIAS_VALIDAS = ['Breakbeat', 'Eurobeat', 'Rock', 'Pop', 'Jazz', 'Electrónica', 'Clásica'];
const AUDIOS_VALIDOS = ['audio/8va_curves.mp3', 'audio/dancing.mp3', 'audio/StormTrap.mp3'];

function getRutaCanciones(): string
{
    $rutaContenedor = '/var/www/data/canciones.json';
    if (file_exists($rutaContenedor) || is_dir('/var/www/data')) {
        return $rutaContenedor;
    }
    return dirname(__DIR__, 2) . '/data/canciones.json';
}

function normalizarCancion(array $item): array
{
    $id = (int) ($item['id'] ?? 0);
    $title = (string) ($item['title'] ?? $item['titulo'] ?? '');
    $artist = (string) ($item['artist'] ?? $item['artista'] ?? '');
    $category = (string) ($item['category'] ?? $item['genero'] ?? 'Sin clasificar');
    $duration = (int) ($item['duration'] ?? $item['duracion'] ?? 0);
    $src = (string) ($item['src'] ?? '');

    return [
        'id' => $id,
        'title' => $title,
        'artist' => $artist,
        'category' => $category,
        'duration' => $duration,
        'src' => $src,
        'titulo' => $title,
        'artista' => $artist,
        'genero' => $category,
        'duracion' => $duration
    ];
}

function leerJson(string $ruta): array
{
    if (!file_exists($ruta)) {
        return [];
    }

    $fp = @fopen($ruta, 'rb');
    if (!$fp) {
        throw new RuntimeException("No se puede abrir el archivo para lectura: {$ruta}");
    }

    flock($fp, LOCK_SH);
    $contenido = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    if ($contenido === false) {
        throw new RuntimeException("Fallo al leer el contenido del archivo: {$ruta}");
    }

    if (trim($contenido) === '') {
        return [];
    }

    try {
        $datos = json_decode($contenido, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        throw new RuntimeException("Archivo JSON dañado o con sintaxis inválida: " . $e->getMessage());
    }

    if (!is_array($datos)) {
        throw new RuntimeException("El contenido JSON no representa una lista válida.");
    }

    return $datos;
}

function guardarJson(string $ruta, array $datos): bool
{
    $directorio = dirname($ruta);
    if (!is_dir($directorio)) {
        mkdir($directorio, 0777, true);
    }

    $fp = @fopen($ruta, 'c+');
    if (!$fp) {
        return false;
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }

    ftruncate($fp, 0);
    rewind($fp);
    $contenido = json_encode(array_values($datos), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $escrito = fwrite($fp, $contenido . PHP_EOL);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    return $escrito !== false;
}

function transaccionCatalogo(callable $operacion): array
{
    $ruta = getRutaCanciones();
    $directorio = dirname($ruta);
    if (!is_dir($directorio)) {
        mkdir($directorio, 0777, true);
    }

    $fp = @fopen($ruta, 'c+');
    if (!$fp) {
        throw new RuntimeException("No se puede acceder al almacén de canciones.");
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        throw new RuntimeException("No se pudo obtener el bloqueo exclusivo del archivo.");
    }

    try {
        $contenido = stream_get_contents($fp);
        if ($contenido === false) {
            throw new RuntimeException("Error al leer el archivo durante el bloqueo.");
        }

        if (trim($contenido) === '') {
            $canciones = [];
        } else {
            try {
                $canciones = json_decode($contenido, true, 512, JSON_THROW_ON_ERROR);
                if (!is_array($canciones)) {
                    $canciones = [];
                }
            } catch (JsonException $e) {
                throw new RuntimeException("El archivo contiene JSON dañado: " . $e->getMessage());
            }
        }

        $resultado = $operacion($canciones);
        if ($resultado === false || $resultado === null) {
            return [false, []];
        }

        $cancionesGuardar = array_values($resultado);
        ftruncate($fp, 0);
        rewind($fp);
        $json = json_encode($cancionesGuardar, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $escrito = fwrite($fp, $json . PHP_EOL);
        fflush($fp);

        if ($escrito === false) {
            throw new RuntimeException("Error al escribir los datos protegidos.");
        }

        return [true, $cancionesGuardar];
    } finally {
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}

function leerCanciones(): array
{
    $ruta = getRutaCanciones();
    $datos = leerJson($ruta);
    return array_map('normalizarCancion', $datos);
}

function crearCancion(string $title, string $artist, string $category, int $duration, string $src): array
{
    [$ok, $lista] = transaccionCatalogo(function (array $canciones) use ($title, $artist, $category, $duration, $src) {
        $nuevoId = 1;
        if (!empty($canciones)) {
            $ids = array_map(fn($c) => (int) ($c['id'] ?? 0), $canciones);
            $nuevoId = max($ids) + 1;
        }

        $cancion = normalizarCancion([
            'id' => $nuevoId,
            'title' => $title,
            'artist' => $artist,
            'category' => $category,
            'duration' => $duration,
            'src' => $src
        ]);

        $canciones[] = $cancion;
        return $canciones;
    });

    if (!$ok) {
        throw new RuntimeException("No se pudo crear la canción en el catálogo.");
    }

    return array_map('normalizarCancion', $lista);
}

function actualizarCancion(int $id, string $title, string $artist, string $category, int $duration, string $src): ?array
{
    $encontrada = false;
    [$ok, $lista] = transaccionCatalogo(function (array $canciones) use ($id, $title, $artist, $category, $duration, $src, &$encontrada) {
        foreach ($canciones as $idx => $cancion) {
            if ((int) ($cancion['id'] ?? 0) === $id) {
                $encontrada = true;
                $canciones[$idx] = normalizarCancion([
                    'id' => $id,
                    'title' => $title,
                    'artist' => $artist,
                    'category' => $category,
                    'duration' => $duration,
                    'src' => $src
                ]);
                return $canciones;
            }
        }
        return false;
    });

    if (!$encontrada) {
        return null;
    }

    return array_map('normalizarCancion', $lista);
}

function eliminarCancion(int $id): ?array
{
    $encontrada = false;
    [$ok, $lista] = transaccionCatalogo(function (array $canciones) use ($id, &$encontrada) {
        $resultado = [];
        foreach ($canciones as $cancion) {
            if ((int) ($cancion['id'] ?? 0) === $id) {
                $encontrada = true;
            } else {
                $resultado[] = $cancion;
            }
        }
        if (!$encontrada) {
            return false;
        }
        return array_values($resultado);
    });

    if (!$encontrada) {
        return null;
    }

    return array_map('normalizarCancion', $lista);
}
