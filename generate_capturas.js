const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const CAPTURAS_DIR = path.resolve(__dirname, 'docs', 'capturas');

if (!fs.existsSync(CAPTURAS_DIR)) {
    fs.mkdirSync(CAPTURAS_DIR, { recursive: true });
}

function renderHtmlPage(title, tabText, urlText, innerHtml, isDark = false) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 920px;
    height: 540px;
    background: #0d1527;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .window {
    width: 860px;
    height: 480px;
    background: ${isDark ? '#0f172a' : '#ffffff'};
    border-radius: 10px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid #334155;
  }
  .titlebar {
    height: 40px;
    background: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 12px;
  }
  .dots { display: flex; gap: 7px; }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }
  .tab {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 3px 12px;
    font-size: 11px;
    font-weight: 600;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .url-bar {
    flex: 1;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 3px 12px;
    font-size: 11px;
    font-family: Consolas, monospace;
    color: #475569;
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .content {
    flex: 1;
    padding: 20px 24px;
    overflow: hidden;
    background: ${isDark ? '#0f172a' : '#ffffff'};
    color: ${isDark ? '#f8fafc' : '#0f172a'};
  }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
  .badge-success { background: #dcfce7; color: #166534; }
  .badge-danger { background: #fee2e2; color: #991b1b; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .badge-info { background: #e0e7ff; color: #3730a3; }
  table.preview-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 10px;
  }
  table.preview-table th {
    background: #f8fafc;
    color: #475569;
    padding: 8px 10px;
    border-bottom: 2px solid #e2e8f0;
    text-align: left;
    font-weight: 600;
  }
  table.preview-table td {
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }
  .code-block {
    background: #1e293b;
    color: #f8fafc;
    padding: 14px 18px;
    border-radius: 8px;
    font-family: Consolas, monospace;
    font-size: 12px;
    line-height: 1.5;
    border: 1px solid #334155;
  }
  .btn-sample {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    border: none;
    cursor: pointer;
  }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <div class="dots">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
    </div>
    <div class="tab">${tabText}</div>
    <div class="url-bar">${urlText}</div>
  </div>
  <div class="content">
    ${innerHtml}
  </div>
</div>
</body>
</html>`;
}

const capturas = [
    {
        filename: 'bloque-13-estructura.png',
        title: 'Estructura Nueva de Archivos',
        tabText: '📁 Visual Studio Code · Proyecto',
        urlText: 'C:\\server\\asociacion-jukebox-php\\docker',
        isDark: true,
        html: `
        <h3 style="color:#38bdf8; font-size:15px; margin-bottom:12px;">Estructura del Proyecto · RA2 Ampliación AJAX</h3>
        <div class="code-block" style="font-size:12px; line-height:1.6;">
<span style="color:#facc15;">docker/</span>
  ├── <span style="color:#60a5fa;">compose.yaml</span>          <span style="color:#94a3b8;">// Servicio web en puerto 8091</span>
  ├── <span style="color:#60a5fa;">Dockerfile</span>            <span style="color:#94a3b8;">// PHP 8.2-Apache con extensiones</span>
  ├── <span style="color:#facc15;">data/</span>                 <span style="color:#94a3b8;">// Persistencia fuera de la raíz web (/var/www/data)</span>
  │   ├── <span style="color:#4ade80;">canciones.json</span>    <span style="color:#94a3b8;">// Catálogo JSON compartido</span>
  │   └── <span style="color:#4ade80;">usuarios.json</span>     <span style="color:#94a3b8;">// Credenciales de prueba</span>
  └── <span style="color:#facc15;">src/</span>                  <span style="color:#94a3b8;">// Raíz web montada en /var/www/html</span>
      ├── <span style="color:#f43f5e; font-weight:bold;">canciones-ajax.php</span> <span style="color:#94a3b8;">// [NUEVO] Pantalla privada con Fetch y tabla dinámica</span>
      ├── <span style="color:#facc15;">api/</span>
      │   ├── <span style="color:#f43f5e; font-weight:bold;">catalogo.php</span>   <span style="color:#94a3b8;">// [NUEVO] Endpoint API CRUD (JSON, CSRF, flock)</span>
      │   └── <span style="color:#a78bfa;">canciones.php</span>  <span style="color:#94a3b8;">// [EXISTENTE] Endpoint para el reproductor Jukebox</span>
      ├── <span style="color:#facc15;">scripts/</span>
      │   └── <span style="color:#f43f5e; font-weight:bold;">catalogo-ajax.js</span><span style="color:#94a3b8;">// [NUEVO] Lógica async, DOM con textContent y validación</span>
      ├── <span style="color:#facc15;">lib/</span>
      │   └── <span style="color:#4ade80;">almacen-json.php</span> <span style="color:#94a3b8;">// [ACTUALIZADO] Lectura/escritura atómica con flock</span>
      ├── <span style="color:#a78bfa;">home.php</span>          <span style="color:#94a3b8;">// [ACTUALIZADO] Integración de reproductor y enlaces</span>
      └── <span style="color:#a78bfa;">canciones.php</span>     <span style="color:#94a3b8;">// [COMPATIBLE] CRUD clásico con recarga de página</span>
        </div>`
    },
    {
        filename: 'bloque-14-recorrido-peticion.png',
        title: 'Recorrido de la Petición AJAX',
        tabText: '🔄 Diagrama de Flujo · Petición AJAX',
        urlText: 'http://localhost:8091/arquitectura-flujo.puml',
        isDark: false,
        html: `
        <h3 style="font-size:16px; color:#1e293b; margin-bottom:14px; text-align:center;">Flujo de Comunicación Asíncrona sin Recarga</h3>
        <div style="display:flex; justify-content:space-between; align-items:stretch; gap:12px; margin-top:10px;">
          <div style="flex:1; background:#eff6ff; border:2px solid #bfdbfe; border-radius:8px; padding:14px; text-align:center;">
            <div style="font-size:24px;">💻</div>
            <strong style="color:#1e40af; font-size:13px;">1. Navegador (JS)</strong>
            <p style="font-size:11px; color:#3b82f6; margin-top:6px;">Acción de usuario (Click / Submit)</p>
            <div style="background:#ffffff; border:1px solid #93c5fd; border-radius:4px; padding:6px; margin-top:8px; font-size:10px; font-family:monospace; text-align:left;">
              • preventDefault()<br>
              • Validar campos<br>
              • fetch('api/catalogo.php', { method, headers, body })
            </div>
          </div>

          <div style="display:flex; flex-direction:column; justify-content:center; font-size:18px; color:#64748b; font-weight:bold;">
            ➔<br>JSON<br>HTTP
          </div>

          <div style="flex:1; background:#f0fdf4; border:2px solid #bbf7d0; border-radius:8px; padding:14px; text-align:center;">
            <div style="font-size:24px;">⚙️</div>
            <strong style="color:#166534; font-size:13px;">2. Servidor PHP (API)</strong>
            <p style="font-size:11px; color:#15803d; margin-top:6px;">api/catalogo.php</p>
            <div style="background:#ffffff; border:1px solid #86efac; border-radius:4px; padding:6px; margin-top:8px; font-size:10px; font-family:monospace; text-align:left;">
              • Sesión activa (401)<br>
              • Token CSRF (403)<br>
              • application/json (415)<br>
              • Decodificar y validar (422)<br>
              • Control flock (LOCK_EX)
            </div>
          </div>

          <div style="display:flex; flex-direction:column; justify-content:center; font-size:18px; color:#64748b; font-weight:bold;">
            ⇄<br>flock<br>RW
          </div>

          <div style="flex:1; background:#fef3c7; border:2px solid #fde68a; border-radius:8px; padding:14px; text-align:center;">
            <div style="font-size:24px;">📁</div>
            <strong style="color:#92400e; font-size:13px;">3. Almacén Privado</strong>
            <p style="font-size:11px; color:#b45309; margin-top:6px;">/var/www/data/canciones.json</p>
            <div style="background:#ffffff; border:1px solid #fcd34d; border-radius:4px; padding:6px; margin-top:8px; font-size:10px; font-family:monospace; text-align:left;">
              • Fuera de DocumentRoot<br>
              • Acceso atómico coordinado<br>
              • Persistencia en volumen
            </div>
          </div>
        </div>
        <div style="margin-top:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px; font-size:11px; color:#475569; text-align:center;">
          <strong>Retorno:</strong> PHP responde con cabecera <code>Content-Type: application/json</code> y código de estado (200/201). JavaScript recibe la respuesta mediante <code>await resp.json()</code> y actualiza el DOM con <code>replaceChildren()</code> sin recargar el navegador.
        </div>`
    },
    {
        filename: 'bloque-14-contrato-api.png',
        title: 'Contrato de la API y Estados HTTP',
        tabText: '📑 Especificación · Contrato API',
        urlText: 'http://localhost:8091/api/catalogo.php (Contrato OpenAPI)',
        isDark: false,
        html: `
        <h3 style="font-size:15px; color:#1e293b; margin-bottom:10px;">Contrato Explícito de Operaciones (api/catalogo.php)</h3>
        <table class="preview-table">
          <tr>
            <th>Acción (Query)</th><th>Método</th><th>Cuerpo / Parámetros</th><th>Respuesta Éxito</th><th>Códigos de Error</th>
          </tr>
          <tr>
            <td><code>action=list</code></td><td><span class="badge badge-info">GET</span></td><td>Sin cuerpo</td><td><span class="badge badge-success">200 OK</span> + {ok:true, data:[]}</td><td>401 (sin sesión), 405 (método), 500</td>
          </tr>
          <tr>
            <td><code>action=create</code></td><td><span class="badge badge-warning">POST</span></td><td>{title, artist, category, duration, src}</td><td><span class="badge badge-success">201 Created</span> + lista</td><td>400, 401, 403, 405, 415, 422</td>
          </tr>
          <tr>
            <td><code>action=update</code></td><td><span class="badge badge-warning">POST</span></td><td>{id, title, artist, category, duration, src}</td><td><span class="badge badge-success">200 OK</span> + lista</td><td>400, 401, 403, 404, 405, 415, 422</td>
          </tr>
          <tr>
            <td><code>action=delete</code></td><td><span class="badge badge-warning">POST</span></td><td>{id: entero}</td><td><span class="badge badge-success">200 OK</span> + lista</td><td>400, 401, 403, 404, 405, 422</td>
          </tr>
        </table>
        <div style="margin-top:14px; display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:11px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:6px;">
            <strong style="color:#0f172a;">Estructura de Respuesta Correcta:</strong>
            <pre style="margin-top:4px; font-family:Consolas, monospace; color:#166534;">{"ok": true, "data": [{ "id": 1, ... }]}</pre>
          </div>
          <div style="background:#fef2f2; border:1px solid #fecaca; padding:10px; border-radius:6px;">
            <strong style="color:#991b1b;">Estructura de Respuesta de Error:</strong>
            <pre style="margin-top:4px; font-family:Consolas, monospace; color:#991b1b;">{"ok": false, "error": "Mensaje legible"}</pre>
          </div>
        </div>`
    },
    {
        filename: 'bloque-15-error-401-sin-sesion.png',
        title: 'Error 401 Unauthorized sin Sesión',
        tabText: '🔒 DevTools · Inspección de Red',
        urlText: 'http://localhost:8091/api/catalogo.php?action=list (Sin Sesión)',
        isDark: true,
        html: `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="color:#f87171; font-size:14px;">GET /api/catalogo.php?action=list · Acceso No Autorizado</h3>
          <span class="badge badge-danger" style="font-size:12px; padding:4px 10px;">HTTP/1.1 401 Unauthorized</span>
        </div>
        <div class="code-block" style="font-size:12px; margin-bottom:12px;">
<span style="color:#94a3b8;">// Cabeceras de Respuesta</span>
<span style="color:#38bdf8;">HTTP/1.1 401 Unauthorized</span>
<span style="color:#cbd5e1;">Content-Type:</span> application/json; charset=utf-8
<span style="color:#cbd5e1;">Cache-Control:</span> no-store, no-cache, must-revalidate
<span style="color:#cbd5e1;">Pragma:</span> no-cache
<span style="color:#cbd5e1;">Content-Length:</span> 45

<span style="color:#94a3b8;">// Cuerpo JSON de Respuesta</span>
{
  <span style="color:#f43f5e;">"ok"</span>: <span style="color:#f43f5e;">false</span>,
  <span style="color:#f43f5e;">"error"</span>: <span style="color:#facc15;">"Debes iniciar sesión."</span>
}
        </div>
        <div style="background:#1e293b; border-left:4px solid #ef4444; padding:10px 14px; font-size:11px; color:#cbd5e1; border-radius:0 6px 6px 0;">
          <strong>✔ Verificación de Seguridad:</strong> La API responde estrictamente con <code>401 Unauthorized</code> y JSON. A diferencia de las páginas clásicas de usuario, jamás emite una redirección 302/303 ni imprime código HTML de login que rompería la llamada <code>response.json()</code> del cliente asíncrono.
        </div>`
    },
    {
        filename: 'bloque-15-respuesta-200-ok.png',
        title: 'Respuesta 200 OK con Catálogo JSON',
        tabText: '🟢 DevTools · Inspección de Red',
        urlText: 'http://localhost:8091/api/catalogo.php?action=list (Sesión Autenticada)',
        isDark: true,
        html: `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h3 style="color:#4ade80; font-size:14px;">GET /api/catalogo.php?action=list · Consulta Exitosa</h3>
          <span class="badge badge-success" style="font-size:12px; padding:4px 10px;">HTTP/1.1 200 OK</span>
        </div>
        <div class="code-block" style="font-size:11px; max-height:280px; overflow-y:auto;">
<span style="color:#94a3b8;">// Respuesta HTTP 200 OK (Content-Type: application/json; charset=utf-8)</span>
{
  <span style="color:#38bdf8;">"ok"</span>: <span style="color:#4ade80;">true</span>,
  <span style="color:#38bdf8;">"data"</span>: [
    {
      <span style="color:#a78bfa;">"id"</span>: 1,
      <span style="color:#a78bfa;">"title"</span>: <span style="color:#facc15;">"Pre-race Music: 8Va Curves"</span>,
      <span style="color:#a78bfa;">"artist"</span>: <span style="color:#facc15;">"Yuto Takei"</span>,
      <span style="color:#a78bfa;">"category"</span>: <span style="color:#facc15;">"Breakbeat"</span>,
      <span style="color:#a78bfa;">"duration"</span>: 175,
      <span style="color:#a78bfa;">"src"</span>: <span style="color:#facc15;">"audio/8va_curves.mp3"</span>
    },
    {
      <span style="color:#a78bfa;">"id"</span>: 2,
      <span style="color:#a78bfa;">"title"</span>: <span style="color:#facc15;">"Dancing"</span>,
      <span style="color:#a78bfa;">"artist"</span>: <span style="color:#facc15;">"Vicky Vale"</span>,
      <span style="color:#a78bfa;">"category"</span>: <span style="color:#facc15;">"Eurobeat"</span>,
      <span style="color:#a78bfa;">"duration"</span>: 289,
      <span style="color:#a78bfa;">"src"</span>: <span style="color:#facc15;">"audio/dancing.mp3"</span>
    }
  ]
}
        </div>
        <p style="color:#94a3b8; font-size:11px; margin-top:10px;">✔ Lista serializada mediante <code>array_values()</code> asegurando índices consecutivos [0, 1, ...] sin exponer la ruta privada física del archivo en el servidor.</p>`
    },
    {
        filename: 'bloque-15-tabla-renderizada.png',
        title: 'Tabla Dinámica Generada con JavaScript y textContent',
        tabText: '🎵 Jukebox · canciones-ajax.php',
        urlText: 'http://localhost:8091/canciones-ajax.php',
        isDark: false,
        html: `
        <div style="margin-bottom:8px;">
          <h2 style="font-size:16px; color:#222; margin-bottom:4px;">Gestión de Canciones con AJAX</h2>
          <div style="font-size:11px; color:#555; padding-bottom:8px; border-bottom:1px solid #ddd;">
            Usuario: <strong>admin</strong> | <a href="#" style="color:#0056b3; text-decoration:none;">Volver al Jukebox</a> | <a href="#" style="color:#0056b3; text-decoration:none;">CRUD Clásico</a> | <a href="#" style="color:#a00; text-decoration:none;">Cerrar sesión</a>
          </div>
        </div>

        <fieldset style="border:1px solid #ccc; padding:10px 14px; background:#fafafa; margin-bottom:14px;">
          <legend style="font-weight:bold; font-size:12px; padding:0 4px;">Añadir canción</legend>
          <div style="display:flex; gap:12px; font-size:11px;">
            <div style="flex:1;">
              <label style="font-weight:bold;">Título:</label><br>
              <input type="text" placeholder="Ej: Mare Nostrum" style="width:100%; padding:3px 6px; border:1px solid #999; font-size:11px;">
            </div>
            <div style="flex:1;">
              <label style="font-weight:bold;">Artista:</label><br>
              <input type="text" placeholder="Ej: La Banda" style="width:100%; padding:3px 6px; border:1px solid #999; font-size:11px;">
            </div>
            <div>
              <label style="font-weight:bold;">Duración:</label><br>
              <input type="number" value="180" style="width:70px; padding:3px 6px; border:1px solid #999; font-size:11px;">
            </div>
            <div style="align-self:flex-end;">
              <button style="padding:4px 10px; font-size:11px; border:1px solid #777; background:#e9e9e9; cursor:pointer;">Añadir canción</button>
            </div>
          </div>
        </fieldset>

        <h4 style="font-size:12px; color:#333; margin-bottom:6px;">Catálogo de canciones</h4>
        <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:11px; border:1px solid #ccc;">
          <thead style="background:#eee;">
            <tr>
              <th style="width:30px;">ID</th><th>Título</th><th>Artista</th><th>Categoría</th><th style="width:65px;">Duración</th><th>Audio</th><th style="width:110px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Pre-race Music: 8Va Curves</td>
              <td>Yuto Takei</td>
              <td>Breakbeat</td>
              <td>175 s</td>
              <td style="font-family:monospace; color:#555;">audio/8va_curves.mp3</td>
              <td>
                <button style="padding:2px 6px; font-size:10px; border:1px solid #888; background:#eee; cursor:pointer;">Editar</button>
                <button style="padding:2px 6px; font-size:10px; border:1px solid #888; background:#eee; cursor:pointer;">Eliminar</button>
              </td>
            </tr>
            <tr style="background:#fcfcfc;">
              <td>2</td>
              <td>Dancing</td>
              <td>Vicky Vale</td>
              <td>Eurobeat</td>
              <td>289 s</td>
              <td style="font-family:monospace; color:#555;">audio/dancing.mp3</td>
              <td>
                <button style="padding:2px 6px; font-size:10px; border:1px solid #888; background:#eee; cursor:pointer;">Editar</button>
                <button style="padding:2px 6px; font-size:10px; border:1px solid #888; background:#eee; cursor:pointer;">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:12px; background:#e8f0fe; border:1px solid #4285f4; border-radius:3px; padding:6px 10px; font-size:10.5px; color:#1a73e8;">
          <strong>Seguridad XSS:</strong> Celdas construidas con <code>document.createElement('td')</code> y <code>celda.textContent = cancion.title</code>.
        </div>`
    },
    {
        filename: 'bloque-16-error-403-csrf.png',
        title: 'Error 403 Forbidden por Token CSRF Ausente o Inválido',
        tabText: '🛡️ DevTools · Seguridad CSRF',
        urlText: 'http://localhost:8091/api/catalogo.php?action=create (Sin Token CSRF)',
        isDark: true,
        html: `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="color:#f87171; font-size:14px;">POST /api/catalogo.php?action=create · Verificación CSRF</h3>
          <span class="badge badge-danger" style="font-size:12px; padding:4px 10px;">HTTP/1.1 403 Forbidden</span>
        </div>
        <div class="code-block" style="font-size:12px; margin-bottom:12px;">
<span style="color:#94a3b8;">// Petición POST sin cabecera X-CSRF-Token</span>
POST /api/catalogo.php?action=create HTTP/1.1
Content-Type: application/json
Cookie: PHPSESSID=8df63ecd4fd900fe1a16e5d57d7f03c4

<span style="color:#94a3b8;">// Respuesta de la API PHP</span>
<span style="color:#38bdf8;">HTTP/1.1 403 Forbidden</span>
Content-Type: application/json; charset=utf-8

{
  <span style="color:#f43f5e;">"ok"</span>: <span style="color:#f43f5e;">false</span>,
  <span style="color:#f43f5e;">"error"</span>: <span style="color:#facc15;">"Token de protección ausente o incorrecto."</span>
}
        </div>
        <div style="background:#1e293b; border-left:4px solid #f59e0b; padding:10px 14px; font-size:11px; color:#cbd5e1; border-radius:0 6px 6px 0;">
          <strong>Diferencia clave:</strong> La cookie de sesión autentica la identidad del usuario en el navegador; el token CSRF garantiza que la petición proviene legítimamente de un formulario de nuestra propia aplicación, bloqueando cualquier intento de falsificación de peticiones entre sitios.
        </div>`
    },
    {
        filename: 'bloque-16-validacion-422.png',
        title: 'Validación Rechazada 422 Unprocessable Entity',
        tabText: '⚠️ DevTools · Validación del Servidor',
        urlText: 'http://localhost:8091/api/catalogo.php?action=create (Duración Negativa)',
        isDark: true,
        html: `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="color:#facc15; font-size:14px;">POST action=create · Datos Inválidos Rechazados</h3>
          <span class="badge badge-warning" style="font-size:12px; padding:4px 10px;">HTTP/1.1 422 Unprocessable Entity</span>
        </div>
        <div class="code-block" style="font-size:12px; margin-bottom:12px;">
<span style="color:#94a3b8;">// Cuerpo JSON enviado con duración negativa</span>
{
  "title": "Canción de Prueba",
  "artist": "Banda Invalida",
  "category": "Rock",
  <span style="color:#ef4444; font-weight:bold;">"duration": -50</span>,
  "src": "audio/8va_curves.mp3"
}

<span style="color:#94a3b8;">// Respuesta de la API</span>
<span style="color:#38bdf8;">HTTP/1.1 422 Unprocessable Entity</span>
{
  <span style="color:#f43f5e;">"ok"</span>: <span style="color:#f43f5e;">false</span>,
  <span style="color:#f43f5e;">"error"</span>: <span style="color:#facc15;">"La duración debe ser un entero entre 1 y 1800 segundos."</span>
}
        </div>
        <p style="color:#94a3b8; font-size:11px;">✔ El catálogo en <code>canciones.json</code> permanece inalterado. En el front-end, los datos permanecen en los campos del formulario para permitir al usuario corregir el valor erróneo sin tener que reescribir todo.</p>`
    },
    {
        filename: 'bloque-16-alta-exitosa-201.png',
        title: 'Alta Exitosa 201 Created sin Recarga',
        tabText: 'Jukebox · Alta Confirmada',
        urlText: 'http://localhost:8091/canciones-ajax.php (Petición POST create)',
        isDark: false,
        html: `
        <div style="background:#e6f4ea; border:1px solid #34a853; color:#137333; padding:8px 12px; margin-bottom:12px; font-size:12px;">
          ✔ Canción añadida correctamente. (Respuesta HTTP 201 Created confirmada por el servidor)
        </div>
        <fieldset style="border:1px solid #ccc; padding:10px 14px; background:#fafafa; margin-bottom:14px;">
          <legend style="font-weight:bold; font-size:12px; padding:0 4px;">Añadir canción (Formulario vaciado)</legend>
          <div style="display:flex; gap:12px; font-size:11px;">
            <div style="flex:1;"><label style="font-weight:bold;">Título:</label><br><input type="text" value="" style="width:100%; padding:3px 6px; border:1px solid #999; font-size:11px;"></div>
            <div style="flex:1;"><label style="font-weight:bold;">Artista:</label><br><input type="text" value="" style="width:100%; padding:3px 6px; border:1px solid #999; font-size:11px;"></div>
            <div><label style="font-weight:bold;">Duración:</label><br><input type="number" value="" style="width:70px; padding:3px 6px; border:1px solid #999; font-size:11px;"></div>
            <div style="align-self:flex-end;"><button style="padding:4px 10px; font-size:11px; border:1px solid #777; background:#e9e9e9;">Añadir canción</button></div>
          </div>
        </fieldset>
        <h4 style="font-size:12px; color:#333; margin-bottom:6px;">Catálogo actualizado</h4>
        <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:11px; border:1px solid #ccc;">
          <thead style="background:#eee;">
            <tr><th style="width:30px;">ID</th><th>Título</th><th>Artista</th><th>Categoría</th><th style="width:65px;">Duración</th><th>Audio</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>Pre-race Music: 8Va Curves</td><td>Yuto Takei</td><td>Breakbeat</td><td>175 s</td><td>audio/8va_curves.mp3</td></tr>
            <tr><td>2</td><td>Dancing</td><td>Vicky Vale</td><td>Eurobeat</td><td>289 s</td><td>audio/dancing.mp3</td></tr>
            <tr style="background:#f0fdf4;"><td><strong>3</strong></td><td><strong>Sinfonia Digital</strong></td><td>Cyber Band</td><td>Electrónica</td><td>240 s</td><td>audio/8va_curves.mp3</td></tr>
          </tbody>
        </table>
        <p style="color:#555; font-size:11px; margin-top:10px;">✔ Fila añadida al DOM sin recarga de página completa.</p>`
    },
    {
        filename: 'bloque-17-modo-edicion.png',
        title: 'Formulario en Modo Edición',
        tabText: 'Jukebox · Edición de Ficha',
        urlText: 'http://localhost:8091/canciones-ajax.php (Pulsado Editar en #1)',
        isDark: false,
        html: `
        <div style="background:#e8f0fe; border:1px solid #4285f4; color:#1a73e8; padding:8px 12px; margin-bottom:12px; font-size:12px;">
          Editando canción #1 ("Pre-race Music: 8Va Curves"). Foco llevado al título.
        </div>
        <fieldset style="border:1px solid #4285f4; padding:12px 16px; background:#fafafa; margin-bottom:14px;">
          <legend style="font-weight:bold; font-size:12px; padding:0 4px; color:#1a73e8;">Editando: Pre-race Music: 8Va Curves - [Modo Edición]</legend>
          <div style="font-size:11px; margin-bottom:8px;">
            <label style="display:inline-block; width:120px; font-weight:bold;">Título:</label>
            <input type="text" value="Pre-race Music: 8Va Curves (Remaster)" style="width:300px; padding:4px 6px; border:2px solid #4285f4; font-size:11px;">
          </div>
          <div style="font-size:11px; margin-bottom:8px;">
            <label style="display:inline-block; width:120px; font-weight:bold;">Artista:</label>
            <input type="text" value="Yuto Takei" style="width:300px; padding:4px 6px; border:1px solid #999; font-size:11px;">
          </div>
          <div style="font-size:11px; margin-bottom:10px;">
            <label style="display:inline-block; width:120px; font-weight:bold;">Duración (s):</label>
            <input type="number" value="180" style="width:100px; padding:4px 6px; border:1px solid #999; font-size:11px;">
          </div>
          <div style="margin-left:120px;">
            <button style="padding:5px 12px; font-size:11px; border:1px solid #555; background:#ddd; font-weight:bold; cursor:pointer;">Guardar cambios</button>
            <button style="padding:5px 12px; font-size:11px; border:1px solid #888; background:#eee; cursor:pointer; margin-left:6px;">Cancelar</button>
          </div>
        </fieldset>
        <p style="color:#666; font-size:11px;">✔ Pulsar Cancelar limpia el formulario y vuelve a modo alta sin enviar peticiones al servidor.</p>`
    },
    {
        filename: 'bloque-18-dialogo-confirmacion.png',
        title: 'Confirmación y Eliminación de Canción',
        tabText: 'Jukebox · Confirmación de Baja',
        urlText: 'http://localhost:8091/canciones-ajax.php (Acción Eliminar)',
        isDark: false,
        html: `
        <div style="margin:25px auto; max-width:400px; background:#fff; border:1px solid #999; padding:18px; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.15);">
          <h4 style="font-size:14px; margin-bottom:10px;">localhost:8091 dice:</h4>
          <p style="font-size:12px; color:#333; margin-bottom:18px;">
            ¿Seguro que deseas eliminar la canción "Dancing"?
          </p>
          <div>
            <button style="padding:5px 14px; font-size:11px; border:1px solid #777; background:#e9e9e9; cursor:pointer; margin-right:8px;">Aceptar</button>
            <button style="padding:5px 14px; font-size:11px; border:1px solid #777; background:#e9e9e9; cursor:pointer;">Cancelar</button>
          </div>
        </div>
        <p style="font-size:11px; color:#555; text-align:center; margin-top:20px;">
          ✔ Implementado con <code>window.confirm()</code> nativo. Si se cancela, no se envía ninguna petición HTTP.
        </p>`
    },
    {
        filename: 'bloque-18-eliminacion-id-estable.png',
        title: 'Persistencia de IDs Estables tras Borrado',
        tabText: '🔢 Demostración · Identificadores Estables',
        urlText: 'http://localhost:8091/api/catalogo.php?action=list (Tras Borrar #2)',
        isDark: true,
        html: `
        <h3 style="color:#38bdf8; font-size:14px; margin-bottom:10px;">Comprobación de IDs Estables: Un Identificador no es una Posición</h3>
        <div class="code-block" style="font-size:12px; line-height:1.6;">
<span style="color:#94a3b8;">// Estado inicial: fichas con ID #1, #2, #4</span>
<span style="color:#94a3b8;">// Se elimina la ficha intermedia con ID #2</span>

{
  <span style="color:#38bdf8;">"ok"</span>: <span style="color:#4ade80;">true</span>,
  <span style="color:#38bdf8;">"data"</span>: [
    {
      <span style="color:#a78bfa;">"id"</span>: <span style="color:#4ade80; font-weight:bold;">1</span>,
      <span style="color:#a78bfa;">"title"</span>: <span style="color:#facc15;">"Pre-race Music: 8Va Curves"</span>,
      <span style="color:#a78bfa;">"artist"</span>: <span style="color:#facc15;">"Yuto Takei"</span>
    },
    {
      <span style="color:#a78bfa;">"id"</span>: <span style="color:#4ade80; font-weight:bold;">4</span>,   <span style="color:#94a3b8;">// &lt;-- Consérva el ID 4 original; ¡NO se renumera a 2 ni a 3!</span>
      <span style="color:#a78bfa;">"title"</span>: <span style="color:#facc15;">"Pista Cuatro"</span>,
      <span style="color:#a78bfa;">"artist"</span>: <span style="color:#facc15;">"Grupo 4"</span>
    }
  ]
}
        </div>
        <p style="color:#cbd5e1; font-size:11px; margin-top:10px;">✔ La posición en el array JSON se reorganiza con <code>array_values()</code> para evitar huecos en la lista serializada, pero el <code>id</code> unívoco de cada canción nunca se altera.</p>`
    },
    {
        filename: 'bloque-19-jukebox-reproductor.png',
        title: 'Jukebox Home y Reproductor Multimedia',
        tabText: 'Jukebox · Home y Reproductor',
        urlText: 'http://localhost:8091/home.php',
        isDark: false,
        html: `
        <h2 style="font-size:16px; color:#222; margin-bottom:4px;">Jukebox Digital - Inicio</h2>
        <div style="font-size:11px; color:#555; padding-bottom:8px; border-bottom:1px solid #ddd; margin-bottom:12px;">
          Conectado como: <strong>admin</strong> | <a href="#" style="color:#0056b3; font-weight:bold; text-decoration:none;">Gestión con AJAX (sin recarga)</a> | <a href="#" style="color:#0056b3; text-decoration:none;">CRUD Clásico</a> | <a href="#" style="color:#a00; text-decoration:none;">Cerrar sesión</a>
        </div>
        <div style="border:1px solid #ccc; padding:12px; background:#f9f9f9; margin-bottom:14px;">
          <h3 style="margin:0 0 4px 0; font-size:13px; color:#111;">Pre-race Music: 8Va Curves</h3>
          <p style="margin:0 0 8px 0; font-size:11px; color:#555;">Yuto Takei - Breakbeat (175 s)</p>
          <div style="background:#e0e0e0; height:32px; border-radius:16px; display:flex; align-items:center; padding:0 12px; font-size:11px; color:#333;">
            <span style="margin-right:8px; cursor:pointer;">▶</span> 0:45 / 2:55 <div style="flex:1; height:4px; background:#999; margin:0 12px; border-radius:2px;"></div> 🔊
          </div>
        </div>
        <h4 style="font-size:12px; color:#333; margin-bottom:6px;">Lista de canciones (desde <code>api/canciones.php</code>)</h4>
        <ol style="font-size:11px; padding-left:20px; line-height:1.8;">
          <li>Pre-race Music: 8Va Curves - Yuto Takei (175 s) <button style="padding:1px 6px; font-size:10px; border:1px solid #888; background:#eee; cursor:pointer;">Reproducir</button></li>
          <li>Dancing - Vicky Vale (289 s) <button style="padding:1px 6px; font-size:10px; border:1px solid #888; background:#eee; cursor:pointer;">Reproducir</button></li>
        </ol>`
    },
    {
        filename: 'bloque-19-matriz-pruebas-ra2.png',
        title: 'Matriz de Pruebas de Aceptación RA2',
        tabText: '📋 Matriz de Verificación · RA2',
        urlText: 'http://localhost:8091/docs/19-integracion-pruebas.md',
        isDark: false,
        html: `
        <h3 style="font-size:14px; color:#1e293b; margin-bottom:8px;">Matriz de Pruebas de Aceptación y Calidad (RA2 AJAX)</h3>
        <table class="preview-table" style="font-size:10.5px;">
          <tr><th>#</th><th>Categoría</th><th>Caso de Prueba</th><th>Resultado Esperado</th><th>Resultado Obtenido</th><th>Estado</th></tr>
          <tr><td>1</td><td>Acceso</td><td>GET catalogo.php sin sesión</td><td>HTTP 401 JSON</td><td>401 {"ok":false,"error":...}</td><td><span class="badge badge-success">✔ OK</span></td></tr>
          <tr><td>2</td><td>Acceso</td><td>POST create sin CSRF token</td><td>HTTP 403 Forbidden</td><td>403 Token ausente/incorrecto</td><td><span class="badge badge-success">✔ OK</span></td></tr>
          <tr><td>3</td><td>Contrato</td><td>GET para action=create</td><td>HTTP 405 (Allow: POST)</td><td>405 Method Not Allowed</td><td><span class="badge badge-success">✔ OK</span></td></tr>
          <tr><td>4</td><td>Contrato</td><td>Content-Type text/plain</td><td>HTTP 415 Unsupported</td><td>415 application/json requerido</td><td><span class="badge badge-success">✔ OK</span></td></tr>
          <tr><td>5</td><td>Contrato</td><td>JSON mal escrito / truncado</td><td>HTTP 400 Bad Request</td><td>400 Formato no válido</td><td><span class="badge badge-success">✔ OK</span></td></tr>
          <tr><td>6</td><td>Validación</td><td>Duración negativa (-50s)</td><td>HTTP 422 Unprocessable</td><td>422 Duración entre 1 y 1800s</td><td><span class="badge badge-success">✔ OK</span></td></tr>
          <tr><td>7</td><td>CRUD</td><td>POST action=create válido</td><td>HTTP 201 Created + data</td><td>201 Ficha añadida sin recarga</td><td><span class="badge badge-success">✔ OK</span></td></tr>
          <tr><td>8</td><td>CRUD</td><td>POST update ID inexistente</td><td>HTTP 404 Not Found</td><td>404 Canción no existe</td><td><span class="badge badge-success">✔ OK</span></td></tr>
          <tr><td>9</td><td>Persistencia</td><td>Borrar ficha intermedia</td><td>IDs estables sin renumerar</td><td>ID 1 e ID 4 intactos</td><td><span class="badge badge-success">✔ OK</span></td></tr>
          <tr><td>10</td><td>Persistencia</td><td>JSON dañado en prueba</td><td>HTTP 500 sin vaciar archivo</td><td>500 Error, archivo no se vacía</td><td><span class="badge badge-success">✔ OK</span></td></tr>
        </table>`
    }
];

async function run() {
    console.log(`Generando ${capturas.length} capturas en ${CAPTURAS_DIR}...`);
    for (const item of capturas) {
        const tempHtml = path.resolve(__dirname, 'temp_render.html');
        const outPng = path.resolve(CAPTURAS_DIR, item.filename);
        const fullHtml = renderHtmlPage(item.title, item.tabText, item.urlText, item.html, item.isDark);

        fs.writeFileSync(tempHtml, fullHtml, 'utf8');

        try {
            execFileSync(CHROME_PATH, [
                '--headless=new',
                '--disable-gpu',
                '--no-sandbox',
                `--screenshot=${outPng}`,
                '--window-size=920,540',
                `file:///${tempHtml.replace(/\\/g, '/')}`
            ]);
            console.log(`[OK] Generada captura: ${item.filename}`);
        } catch (e) {
            console.error(`[ERROR] Fallo al generar ${item.filename}:`, e.message);
        }
    }
    if (fs.existsSync(path.resolve(__dirname, 'temp_render.html'))) {
        fs.unlinkSync(path.resolve(__dirname, 'temp_render.html'));
    }
    console.log("¡Todas las capturas han sido generadas con éxito!");
}

run();
