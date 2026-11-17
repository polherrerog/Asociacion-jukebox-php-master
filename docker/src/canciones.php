<?php
require_once __DIR__ . '/lib/sesion.php';
require_once __DIR__ . '/lib/almacen-json.php';
require_once __DIR__ . '/lib/acceso.php';

requireLogin();
$canciones = leerCanciones();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Listado de Canciones - CRUD Clásico</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #ffffff;
            color: #222222;
            padding: 20px;
            max-width: 800px;
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

        ul {
            list-style: none;
            padding: 0;
        }

        li {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        li:nth-child(even) {
            background-color: #fcfcfc;
        }

        .actions a {
            margin-left: 8px;
            text-decoration: none;
            font-size: 0.9rem;
        }

        .actions a.edit {
            color: #0056b3;
        }

        .actions a.delete {
            color: #b00;
        }

        .btn-add {
            display: inline-block;
            margin: 12px 0;
            padding: 6px 12px;
            background: #e9e9e9;
            border: 1px solid #777;
            color: #000;
            text-decoration: none;
            font-size: 0.9rem;
        }

        .btn-add:hover {
            background: #ddd;
        }
    </style>
</head>
<body>

    <h1>Gestión de Canciones (CRUD Clásico)</h1>

    <div class="nav-bar">
        <a href="home.php">← Volver al Jukebox</a> | 
        <a href="canciones-ajax.php" style="font-weight: bold;">Ir a Gestión con AJAX</a> | 
        <a href="logout.php" style="color: #a00;">Cerrar sesión</a>
    </div>

    <p><a href="cancion-nueva.php" class="btn-add">+ Añadir nueva canción</a></p>

    <ul>
        <?php if (empty($canciones)): ?>
            <li style="color: #666; font-style: italic;">Todavía no hay canciones registradas.</li>
        <?php else: ?>
            <?php foreach ($canciones as $cancion): ?>
                <li>
                    <div>
                        <strong>#<?= (int)$cancion['id'] ?> <?= htmlspecialchars($cancion['title'] ?? $cancion['titulo'] ?? '') ?></strong> 
                        <span style="color: #555;">- <?= htmlspecialchars($cancion['artist'] ?? $cancion['artista'] ?? '') ?> (<?= (int)($cancion['duration'] ?? $cancion['duracion'] ?? 0) ?> s) [<?= htmlspecialchars($cancion['category'] ?? $cancion['genero'] ?? '') ?>]</span>
                    </div>
                    <div class="actions">
                        <a href="cancion-editar.php?id=<?= (int)$cancion['id'] ?>" class="edit">Editar</a>
                        <a href="cancion-eliminar.php?id=<?= (int)$cancion['id'] ?>" class="delete" onclick="return confirm('¿Eliminar esta canción?');">Eliminar</a>
                    </div>
                </li>
            <?php endforeach; ?>
        <?php endif; ?>
    </ul>

</body>
</html>
