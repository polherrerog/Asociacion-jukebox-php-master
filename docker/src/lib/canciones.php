<?php
require_once __DIR__ . '/almacen-json.php';

function obtenerCanciones(): array
{
    try {
        return leerCanciones();
    } catch (Throwable $e) {
        return [
            ['id' => 1, 'title' => 'Mare Nostrum', 'artist' => 'La Banda', 'duration' => 210, 'category' => 'Rock'],
            ['id' => 2, 'title' => 'Noche de verano', 'artist' => 'Sol y Luna', 'duration' => 185, 'category' => 'Pop'],
            ['id' => 3, 'title' => 'Blue Night', 'artist' => 'Jazz Club', 'duration' => 260, 'category' => 'Jazz'],
        ];
    }
}
