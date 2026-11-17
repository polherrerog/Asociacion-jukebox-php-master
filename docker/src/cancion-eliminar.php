<?php
require_once __DIR__ . '/lib/sesion.php';
require_once __DIR__ . '/lib/almacen-json.php';
require_once __DIR__ . '/lib/acceso.php';

requireLogin();
$id = (int) ($_POST['id'] ?? $_GET['id'] ?? 0);

if ($id > 0) {
    try {
        eliminarCancion($id);
    } catch (Throwable $e) {
        error_log("Error al eliminar en clásico: " . $e->getMessage());
    }
}

header('Location: canciones.php');
exit;
