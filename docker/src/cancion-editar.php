<?php
require_once __DIR__ . '/lib/sesion.php';
require_once __DIR__ . '/lib/almacen-json.php';
require_once __DIR__ . '/lib/acceso.php';

requireLogin();

$id = (int) ($_GET['id'] ?? $_POST['id'] ?? 0);
$canciones = leerCanciones();
$cancion = null;
foreach ($canciones as $item) {
    if ((int) $item['id'] === $id) {
        $cancion = $item;
        break;
    }
}

if ($cancion === null) {
    header('Location: canciones.php');
    exit;
}

$mensaje = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $artist = trim($_POST['artist'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $duration = (int) ($_POST['duration'] ?? 0);
    $src = trim($_POST['src'] ?? '');

    if ($title === '' || mb_strlen($title) > 80) {
        $mensaje = 'El título no puede estar vacío ni superar los 80 caracteres.';
    } elseif ($artist === '' || mb_strlen($artist) > 80) {
        $mensaje = 'El artista no puede estar vacío ni superar los 80 caracteres.';
    } elseif (!in_array($category, CATEGORIAS_VALIDAS, true)) {
        $mensaje = 'La categoría seleccionada no es válida.';
    } elseif ($duration < 1 || $duration > 1800) {
        $mensaje = 'La duración debe estar entre 1 y 1800 segundos.';
    } elseif (!in_array($src, AUDIOS_VALIDOS, true)) {
        $mensaje = 'El archivo de audio no pertenece a la lista autorizada.';
    } else {
        try {
            $resultado = actualizarCancion($id, $title, $artist, $category, $duration, $src);
            if ($resultado === null) {
                $mensaje = 'La canción ya no existe en el catálogo.';
            } else {
                header('Location: canciones.php');
                exit;
            }
        } catch (Throwable $e) {
            $mensaje = 'Error al actualizar: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Editar Canción · Clásico</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 24px; color: #1e293b; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .form-group { margin-bottom: 14px; }
        label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 0.9rem; }
        input, select { width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
        button { background: #4f46e5; color: white; padding: 10px 16px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .error { background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 6px; margin-bottom: 14px; }
        a { color: #4f46e5; text-decoration: none; }
    </style>
</head>
<body>
<div class="container">
    <h1>Editar canción #<?= (int)$cancion['id'] ?> (Clásico)</h1>
    <?php if ($mensaje !== ''): ?>
        <div class="error"><?= htmlspecialchars($mensaje) ?></div>
    <?php endif; ?>
    <form method="post">
        <input type="hidden" name="id" value="<?= (int)$cancion['id'] ?>">
        <div class="form-group">
            <label for="title">Título:</label>
            <input type="text" id="title" name="title" required maxlength="80" value="<?= htmlspecialchars($cancion['title'] ?? '') ?>">
        </div>
        <div class="form-group">
            <label for="artist">Artista:</label>
            <input type="text" id="artist" name="artist" required maxlength="80" value="<?= htmlspecialchars($cancion['artist'] ?? '') ?>">
        </div>
        <div class="form-group">
            <label for="category">Categoría:</label>
            <select id="category" name="category" required>
                <?php foreach (CATEGORIAS_VALIDAS as $cat): ?>
                    <option value="<?= htmlspecialchars($cat) ?>" <?= ($cancion['category'] ?? '') === $cat ? 'selected' : '' ?>>
                        <?= htmlspecialchars($cat) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="form-group">
            <label for="duration">Duración (segundos):</label>
            <input type="number" id="duration" name="duration" min="1" max="1800" step="1" required value="<?= (int)($cancion['duration'] ?? 0) ?>">
        </div>
        <div class="form-group">
            <label for="src">Audio autorizado:</label>
            <select id="src" name="src" required>
                <?php foreach (AUDIOS_VALIDOS as $aud): ?>
                    <option value="<?= htmlspecialchars($aud) ?>" <?= ($cancion['src'] ?? '') === $aud ? 'selected' : '' ?>>
                        <?= htmlspecialchars($aud) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <button type="submit">Guardar cambios</button>
        <p style="margin-top: 14px;"><a href="canciones.php">← Cancelar y volver</a></p>
    </form>
</div>
</body>
</html>
