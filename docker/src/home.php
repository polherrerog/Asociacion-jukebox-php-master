<?php
require_once __DIR__ . '/lib/sesion.php';
require_once __DIR__ . '/lib/acceso.php';

requireLogin();
$usuario = usuarioActual();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jukebox - Reproductor y Home</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #ffffff;
            color: #222222;
            line-height: 1.4;
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

        .player-box {
            border: 1px solid #ccc;
            padding: 15px;
            background-color: #f9f9f9;
            margin: 15px 0 20px 0;
        }

        .player-box h2 {
            margin: 0 0 5px 0;
            font-size: 1.2rem;
        }

        .player-box p {
            margin: 0 0 10px 0;
            color: #555;
            font-size: 0.95rem;
        }

        audio {
            width: 100%;
        }

        ol {
            padding-left: 20px;
        }

        li {
            padding: 4px 0;
        }

        button.btn-play {
            padding: 2px 8px;
            font-size: 0.8rem;
            margin-left: 8px;
            cursor: pointer;
        }
    </style>
</head>
<body>

    <h1>Jukebox Digital - Inicio</h1>

    <div class="nav-bar">
        Conectado como: <strong><?= htmlspecialchars($usuario ?? 'Usuario') ?></strong> |
        <a href="canciones-ajax.php" style="font-weight: bold;">Gestión con AJAX (sin recarga)</a> |
        <a href="canciones.php">CRUD Clásico (con recarga)</a> |
        <a href="logout.php" style="color: #a00;">Cerrar sesión</a>
    </div>

    <div class="player-box">
        <h2 id="track-title">Selecciona una canción</h2>
        <p id="track-artist">Reproductor listo</p>
        <audio id="audio-player" controls preload="metadata"></audio>
    </div>

    <h3>Lista de canciones disponibles (desde <code>api/canciones.php</code>)</h3>
    <ol id="playlist-list">
        <li>Cargando canciones...</li>
    </ol>

    <script>
    document.addEventListener('DOMContentLoaded', async () => {
        const audioPlayer = document.getElementById('audio-player');
        const trackTitle = document.getElementById('track-title');
        const trackArtist = document.getElementById('track-artist');
        const playlistList = document.getElementById('playlist-list');

        let songs = [];

        try {
            const resp = await fetch('api/canciones.php');
            if (!resp.ok) throw new Error('Error al cargar api/canciones.php');
            songs = await resp.json();

            playlistList.replaceChildren();

            if (!Array.isArray(songs) || songs.length === 0) {
                playlistList.innerHTML = '<li>No hay canciones registradas en el catálogo.</li>';
                return;
            }

            songs.forEach((song, idx) => {
                const li = document.createElement('li');
                
                const title = song.title || song.titulo;
                const artist = song.artist || song.artista;
                const duration = song.duration || song.duracion;

                li.textContent = `${title} - ${artist} (${duration} s) `;

                const btnPlay = document.createElement('button');
                btnPlay.type = 'button';
                btnPlay.className = 'btn-play';
                btnPlay.textContent = 'Reproducir';
                btnPlay.addEventListener('click', () => {
                    trackTitle.textContent = title;
                    trackArtist.textContent = artist;
                    audioPlayer.src = song.src;
                    audioPlayer.play().catch(() => {});
                });

                li.append(btnPlay);
                playlistList.append(li);
            });

            // Cargar primera canción por defecto si existe
            if (songs.length > 0) {
                const first = songs[0];
                trackTitle.textContent = first.title || first.titulo;
                trackArtist.textContent = first.artist || first.artista;
                audioPlayer.src = first.src;
            }
        } catch (e) {
            playlistList.innerHTML = `<li>Error de carga: ${e.message}</li>`;
        }
    });
    </script>

</body>
</html>
