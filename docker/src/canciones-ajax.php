<?php
require_once __DIR__ . '/lib/sesion.php';
require_once __DIR__ . '/lib/acceso.php';
require_once __DIR__ . '/lib/almacen-json.php';

requireLogin();
$usuario = usuarioActual();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Catálogo con AJAX</title>
    <meta name="csrf-token" content="<?= htmlspecialchars($_SESSION['csrf'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #ffffff;
            color: #222222;
            line-height: 1.4;
            padding: 20px;
            max-width: 900px;
            margin: 0 auto;
        }

        h1 {
            font-size: 1.5rem;
            margin-bottom: 5px;
        }

        .nav-bar {
            margin: 10px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
        }

        .nav-bar a {
            color: #0056b3;
            text-decoration: none;
            margin-right: 12px;
        }

        .nav-bar a:hover {
            text-decoration: underline;
        }

        #mensaje-estado {
            display: none;
            margin: 12px 0;
            padding: 8px 12px;
            border-radius: 3px;
            font-size: 0.95rem;
        }

        #mensaje-estado.visible {
            display: block;
        }

        .mensaje-exito {
            background-color: #e6f4ea;
            border: 1px solid #34a853;
            color: #137333;
        }

        .mensaje-error {
            background-color: #fce8e6;
            border: 1px solid #ea4335;
            color: #c5221f;
        }

        .mensaje-info {
            background-color: #e8f0fe;
            border: 1px solid #4285f4;
            color: #1a73e8;
        }

        fieldset {
            border: 1px solid #cccccc;
            padding: 14px 18px;
            margin-bottom: 22px;
            background-color: #fafafa;
        }

        legend {
            font-weight: bold;
            padding: 0 6px;
        }

        .form-row {
            margin-bottom: 10px;
        }

        label {
            display: inline-block;
            width: 140px;
            font-size: 0.9rem;
            font-weight: bold;
            vertical-align: middle;
        }

        input[type="text"],
        input[type="number"],
        select {
            padding: 5px 8px;
            font-size: 0.9rem;
            border: 1px solid #999;
            width: 280px;
            box-sizing: border-box;
        }

        input[type="number"] {
            width: 120px;
        }

        .btn-group {
            margin-top: 14px;
            margin-left: 140px;
        }

        button {
            padding: 6px 14px;
            font-size: 0.9rem;
            cursor: pointer;
            border: 1px solid #777;
            background-color: #e9e9e9;
        }

        button:hover:not(:disabled) {
            background-color: #dcdcdc;
        }

        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 0.9rem;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 6px 10px;
            text-align: left;
        }

        th {
            background-color: #eee;
        }

        tr:nth-child(even) {
            background-color: #fbfbfb;
        }

        .td-empty {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 18px;
        }

        .btn-sm {
            padding: 3px 8px;
            font-size: 0.8rem;
            margin-right: 4px;
        }
    </style>
</head>
<body>

    <h1>Gestión de Canciones con AJAX</h1>
    
    <div class="nav-bar">
        Usuario: <strong><?= htmlspecialchars($usuario ?? 'Invitado') ?></strong> |
        <a href="home.php">Volver al Jukebox (Home)</a> |
        <a href="canciones.php">CRUD Clásico (con recarga)</a> |
        <a href="logout.php" style="color: #a00;">Cerrar sesión</a>
    </div>

    <!-- Área de estado para notificaciones accesibles -->
    <div id="mensaje-estado" role="status" aria-live="polite"></div>

    <!-- Formulario para Alta y Edición -->
    <fieldset>
        <legend id="formulario-titulo">
            <span>Añadir canción</span>
            <span id="badge-modo" style="display:none; color: #b45309; font-weight: normal;"> - [Modo Edición]</span>
        </legend>

        <form id="formulario-cancion">
            <input type="hidden" id="cancion-id" name="id" value="">

            <div class="form-row">
                <label for="campo-title">Título:</label>
                <input type="text" id="campo-title" name="title" required maxlength="80">
            </div>

            <div class="form-row">
                <label for="campo-artist">Artista:</label>
                <input type="text" id="campo-artist" name="artist" required maxlength="80">
            </div>

            <div class="form-row">
                <label for="campo-category">Categoría:</label>
                <select id="campo-category" name="category" required>
                    <option value="">-- Seleccionar categoría --</option>
                    <?php foreach (CATEGORIAS_VALIDAS as $cat): ?>
                        <option value="<?= htmlspecialchars($cat) ?>"><?= htmlspecialchars($cat) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-row">
                <label for="campo-duration">Duración (segundos):</label>
                <input type="number" id="campo-duration" name="duration" min="1" max="1800" step="1" required>
            </div>

            <div class="form-row">
                <label for="campo-src">Archivo de audio:</label>
                <select id="campo-src" name="src" required>
                    <option value="">-- Seleccionar archivo local --</option>
                    <?php foreach (AUDIOS_VALIDOS as $audio): ?>
                        <option value="<?= htmlspecialchars($audio) ?>"><?= htmlspecialchars($audio) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="btn-group">
                <button type="submit" id="btn-submit">Añadir canción</button>
                <button type="button" id="btn-cancelar" style="display:none;">Cancelar</button>
            </div>
        </form>
    </fieldset>

    <!-- Listado dinámico del catálogo -->
    <h3>Catálogo de canciones</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 40px;">ID</th>
                <th>Título</th>
                <th>Artista</th>
                <th>Categoría</th>
                <th style="width: 80px;">Duración</th>
                <th>Audio</th>
                <th style="width: 130px;">Acciones</th>
            </tr>
        </thead>
        <tbody id="tabla-canciones-body">
            <!-- Filas añadidas por catalogo-ajax.js -->
        </tbody>
    </table>

    <script src="scripts/catalogo-ajax.js" defer></script>
</body>
</html>
