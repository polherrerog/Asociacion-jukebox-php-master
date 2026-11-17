<?php
require_once __DIR__ . '/../lib/almacen-json.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

try {
    $canciones = leerCanciones();
    echo json_encode(array_values($canciones), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se puede leer el catálogo de canciones.'], JSON_UNESCAPED_UNICODE);
}
