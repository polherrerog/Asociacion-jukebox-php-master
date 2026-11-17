// Script alternativo: genera DOCUMENTACION_RA2_NUEVO.docx desde el backup (sin tocar DOCUMENTACION.docx)
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const BACKUP_FILE = path.resolve(__dirname, 'DOCUMENTACION_RA1_ORIGINAL.docx');
const OUTPUT_FILE = path.resolve(__dirname, 'DOCUMENTACION_RA2_NUEVO.docx');
const CAPTURAS_DIR = path.resolve(__dirname, 'docs', 'capturas');

if (!fs.existsSync(BACKUP_FILE)) {
    console.error('[ERROR] No se encuentra DOCUMENTACION_RA1_ORIGINAL.docx');
    process.exit(1);
}

// Copiar backup al nuevo archivo de salida
fs.copyFileSync(BACKUP_FILE, OUTPUT_FILE);
console.log(`[OK] Copiado ${BACKUP_FILE} -> ${OUTPUT_FILE}`);

const zip = new AdmZip(OUTPUT_FILE);
let docXml = zip.readAsText('word/document.xml');
let relsXml = zip.readAsText('word/_rels/document.xml.rels');

// Lista de capturas que insertaremos
const imageFiles = [
    { file: 'bloque-13-docker-compose.png', caption: 'Captura 13.1: Servicios levantados con Docker Compose en el puerto 8091 y contenedor healthy' },
    { file: 'bloque-13-estructura.png', caption: 'Captura 13.2: Nueva estructura del proyecto en Visual Studio Code con archivos añadidos para RA2' },
    { file: 'bloque-14-recorrido-peticion.png', caption: 'Captura 14.1: Diagrama de arquitectura del flujo asíncrono entre Navegador (JS), Servidor (PHP) y Almacén Privado' },
    { file: 'bloque-14-contrato-api.png', caption: 'Captura 14.2: Especificación del contrato de operaciones, parámetros, métodos y códigos HTTP' },
    { file: 'bloque-15-error-401-sin-sesion.png', caption: 'Captura 15.1: Inspección en Network mostrando rechazo HTTP 401 Unauthorized y JSON sin sesión' },
    { file: 'bloque-15-respuesta-200-ok.png', caption: 'Captura 15.2: Respuesta HTTP 200 OK con colección de canciones serializada con array_values()' },
    { file: 'bloque-15-tabla-renderizada.png', caption: 'Captura 15.3: Tabla dinámica generada con DOM seguro (textContent y replaceChildren) sin XSS' },
    { file: 'bloque-16-error-403-csrf.png', caption: 'Captura 16.1: Petición POST rechazada con HTTP 403 Forbidden al omitir el token X-CSRF-Token' },
    { file: 'bloque-16-validacion-422.png', caption: 'Captura 16.2: Validación del servidor con HTTP 422 Unprocessable Entity ante duración errónea' },
    { file: 'bloque-16-alta-exitosa-201.png', caption: 'Captura 16.3: Alta confirmada con HTTP 201 Created y actualización instantánea sin recarga' },
    { file: 'bloque-17-modo-edicion.png', caption: 'Captura 17.1: Formulario adaptado a Modo Edición con foco activo y botón Cancelar' },
    { file: 'bloque-18-dialogo-confirmacion.png', caption: 'Captura 18.1: Diálogo de confirmación nativo indicando el nombre de la canción antes de borrar' },
    { file: 'bloque-18-eliminacion-id-estable.png', caption: 'Captura 18.2: Demostración de identificadores estables tras eliminar una ficha intermedia' },
    { file: 'bloque-19-jukebox-reproductor.png', caption: 'Captura 19.1: Jukebox interactivo en la Home reproduciendo audio sincronizado con api/canciones.php' },
    { file: 'bloque-19-matriz-pruebas-ra2.png', caption: 'Captura 19.2: Matriz completa de pruebas de calidad y fallos en RA2 con todos los estados en OK' }
];

// Encontrar el último rId
let highestId = 50;
const relMatches = relsXml.match(/Id="rId(\d+)"/g) || [];
relMatches.forEach(m => {
    const num = parseInt(m.replace(/[^\d]/g, ''), 10);
    if (num > highestId) highestId = num;
});

const imageMap = {};
let newRels = '';

imageFiles.forEach((item, index) => {
    const fullPath = path.join(CAPTURAS_DIR, item.file);
    if (!fs.existsSync(fullPath)) {
        console.warn(`[WARN] Imagen no encontrada: ${fullPath}`);
        return;
    }
    const rId = `rId${++highestId}`;
    const mediaName = `media/ra2_image_${index + 1}.png`;
    
    // Añadir al zip
    const imgData = fs.readFileSync(fullPath);
    zip.addFile(`word/${mediaName}`, imgData);

    newRels += `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${mediaName}"/>`;
    imageMap[item.file] = { rId, caption: item.caption, docPrId: 3000 + index };
    console.log(`[OK] Imagen añadida: ${item.file} (${rId})`);
});

// Actualizar relsXml
relsXml = relsXml.replace('</Relationships>', `${newRels}</Relationships>`);
zip.updateFile('word/_rels/document.xml.rels', Buffer.from(relsXml, 'utf8'));

// Helper para crear XML de Word
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function p(text, options = {}) {
    let rPr = '';
    if (options.bold) rPr += '<w:b/>';
    if (options.italic) rPr += '<w:i/>';
    if (options.color) rPr += `<w:color w:val="${options.color}"/>`;
    if (options.size) rPr += `<w:sz w:val="${options.size}"/>`;

    let pPr = '';
    if (options.heading === 1) pPr += '<w:pStyle w:val="Ttulo1"/>';
    else if (options.heading === 2) pPr += '<w:pStyle w:val="Ttulo2"/>';
    else if (options.heading === 3) pPr += '<w:pStyle w:val="Ttulo3"/>';

    if (options.align) pPr += `<w:jc w:val="${options.align}"/>`;

    return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ''}<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function pImage(filename) {
    const imgInfo = imageMap[filename];
    if (!imgInfo) return '';

    return `
    <w:p>
        <w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="60"/></w:pPr>
        <w:r>
            <w:drawing>
                <wp:inline distT="0" distB="0" distL="0" distR="0">
                    <wp:extent cx="5200000" cy="3052173"/>
                    <wp:effectExtent l="0" t="0" r="0" b="0"/>
                    <wp:docPr id="${imgInfo.docPrId}" name="${escapeXml(filename)}"/>
                    <wp:cNvGraphicFramePr>
                        <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                    </wp:cNvGraphicFramePr>
                    <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                <pic:nvPicPr>
                                    <pic:cNvPr id="${imgInfo.docPrId}" name="${escapeXml(filename)}"/>
                                    <pic:cNvPicPr/>
                                </pic:nvPicPr>
                                <pic:blipFill>
                                    <a:blip r:embed="${imgInfo.rId}"/>
                                    <a:stretch><a:fillRect/></a:stretch>
                                </pic:blipFill>
                                <pic:spPr>
                                    <a:xfrm><a:off x="0" y="0"/><a:ext cx="5200000" cy="3052173"/></a:xfrm>
                                    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                                </pic:spPr>
                            </pic:pic>
                        </a:graphicData>
                    </a:graphic>
                </wp:inline>
            </w:drawing>
        </w:r>
    </w:p>
    <w:p>
        <w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="160"/></w:pPr>
        <w:r>
            <w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr>
            <w:t xml:space="preserve">${escapeXml(imgInfo.caption)}</w:t>
        </w:r>
    </w:p>`;
}

// Construir la sección RA2 completa
let ra2Xml = '';

ra2Xml += p('SECCIÓN RA2: GESTIÓN DE CATÁLOGO MUSICAL CON AJAX Y FETCH (BLOQUES 13 A 20)', { heading: 1 });
ra2Xml += p('Propósito y Alcance del Encargo:', { bold: true });
ra2Xml += p('El cliente de la asociación musical solicitó evolucionar la plataforma para que los usuarios autenticados puedan gestionar las canciones (consultar, añadir, editar y eliminar) de forma inmediata en una misma pantalla sin recargas de página completas. Para ello, se amplió la arquitectura existente construyendo un cliente asíncrono en JavaScript basado en Fetch y un nuevo endpoint API REST en PHP que se comunica en formato JSON y coordina transacciones atómicas seguras sobre el catálogo privado.');

ra2Xml += p('Bloque 13: Preparación del Entorno y Nueva Estructura', { heading: 2 });
ra2Xml += p('Se continuó el desarrollo en la Etapa 2 ejecutando el entorno multiservicio en el puerto 8091. La configuración de compose.yaml monta la raíz web en /var/www/html y el almacenamiento privado en /var/www/data, asegurando que los archivos JSON con datos reales queden inaccesibles a peticiones HTTP directas desde el exterior.');
ra2Xml += pImage('bloque-13-docker-compose.png');
ra2Xml += pImage('bloque-13-estructura.png');

ra2Xml += p('Bloque 14: Arquitectura de Peticiones y Contrato de la API', { heading: 2 });
ra2Xml += p('Se diseñó el recorrido completo de la petición: Acción del usuario en la interfaz → Intercepción con e.preventDefault() → Despacho asíncrono con fetch() → Procesamiento y validación en api/catalogo.php → Transacción atómica coordinada mediante flock() sobre canciones.json → Respuesta JSON serializada → Renderizado reactivo en el DOM con textContent y replaceChildren().');
ra2Xml += pImage('bloque-14-recorrido-peticion.png');
ra2Xml += p('Contrato de Operaciones de api/catalogo.php:', { bold: true });
ra2Xml += p('• GET api/catalogo.php?action=list: Consulta de canciones. Responde 200 OK con {ok: true, data: []}.');
ra2Xml += p('• POST api/catalogo.php?action=create: Alta de ficha. Envía title, artist, category, duration, src. Responde 201 Created.');
ra2Xml += p('• POST api/catalogo.php?action=update: Edición de ficha. Envía id y los 5 campos. Responde 200 OK.');
ra2Xml += p('• POST api/catalogo.php?action=delete: Eliminación. Envía id. Responde 200 OK.');
ra2Xml += pImage('bloque-14-contrato-api.png');
ra2Xml += p('Diferencia de Control de Acceso entre la Página Privada y la API:', { bold: true });
ra2Xml += p('Una página HTML privada redirige a los humanos al login mediante HTTP 302/303 cuando no hay sesión. La API jamás debe emitir HTML ni redirecciones, ya que rompería la llamada response.json() del cliente JavaScript; por tanto, la API responde estrictamente con HTTP 401 Unauthorized y un cuerpo JSON explicativo.');

ra2Xml += p('Bloque 15: Consulta Asíncrona y Tabla Fiable en el DOM', { heading: 2 });
ra2Xml += p('En api/catalogo.php se implementó la acción list restringida a GET. La lectura se ejecuta con bloqueo compartido flock(LOCK_SH). Si el archivo estuviese dañado, se emite un error 500 sin vaciar el catálogo.');
ra2Xml += pImage('bloque-15-error-401-sin-sesion.png');
ra2Xml += pImage('bloque-15-respuesta-200-ok.png');
ra2Xml += p('En el cliente (catalogo-ajax.js), la función async cargarCatalogo() consume la API. Para prevenir inyecciones de código malicioso (XSS), las celdas se construyen mediante document.createElement("td") asignando celda.textContent = cancion.title. Se evita cualquier concatenación de HTML con innerHTML.');
ra2Xml += pImage('bloque-15-tabla-renderizada.png');

ra2Xml += p('Bloque 16: Alta Segura, Validación de Datos y Protección CSRF', { heading: 2 });
ra2Xml += p('Para proteger las peticiones de modificación ante ataques CSRF (Cross-Site Request Forgery), canciones-ajax.php publica el token generado en la sesión dentro de una etiqueta <meta name="csrf-token">. JavaScript incluye este valor en la cabecera personalizada X-CSRF-Token en cada llamada POST, y PHP lo verifica con hash_equals().');
ra2Xml += pImage('bloque-16-error-403-csrf.png');
ra2Xml += p('Validación Exhaustiva en Servidor:', { bold: true });
ra2Xml += p('PHP lee el cuerpo desde php://input, verifica Content-Type application/json (415), decodifica con JSON_THROW_ON_ERROR (400) y comprueba tipos y reglas de negocio: título y artista obligatorios hasta 80 caracteres, categorías admitidas, duración entera entre 1 y 1800 segundos y archivo de audio en la lista autorizada. Si los valores fallan, se responde con HTTP 422 Unprocessable Entity.');
ra2Xml += pImage('bloque-16-validacion-422.png');
ra2Xml += p('Al confirmar el alta con 201 Created, el servidor asigna el ID unívoco bajo flock(LOCK_EX), la tabla añade la fila sin recarga y solo entonces se limpia el formulario. La interfaz deshabilita los controles durante la petición para impedir dobles envíos concurrentes.');
ra2Xml += pImage('bloque-16-alta-exitosa-201.png');

ra2Xml += p('Bloque 17: Edición Manteniendo la Identidad de la Ficha', { heading: 2 });
ra2Xml += p('Al pulsar Editar, se localiza la canción por su ID numérico en memoria local (no por índice de fila). El formulario pasa a Modo Edición, cambia el título a "Editando: ...", activa el botón "Guardar cambios", muestra "Cancelar" y coloca el foco en el título.');
ra2Xml += pImage('bloque-17-modo-edicion.png');
ra2Xml += p('Al enviar (action=update), PHP comprueba la existencia de la canción en la transacción protegida. Si otra pestaña la hubiese borrado, responde 404 Not Found sin duplicarla. Si existe, actualiza sus campos conservando inalterado su ID original y responde 200 OK.');

ra2Xml += p('Bloque 18: Eliminación con Confirmación e Identificadores Estables', { heading: 2 });
ra2Xml += p('Al pulsar Eliminar, se solicita confirmación con window.confirm mostrando el título de la canción. Si el usuario cancela, no se envía ninguna llamada de red.');
ra2Xml += pImage('bloque-18-dialogo-confirmacion.png');
ra2Xml += p('Regla de Oro: Un identificador no es una posición. Si el catálogo tiene las canciones con ID 1, 2 y 4, y se elimina la 2, permanecen la 1 y la 4. La canción 4 jamás se renumera a 2 ni a 3. Se reindexa el array con array_values() para la lista JSON, pero los IDs permanecen inmutables. Asimismo, eliminar la ficha no borra el archivo MP3 del disco (no se usa unlink).');
ra2Xml += pImage('bloque-18-eliminacion-id-estable.png');

ra2Xml += p('Bloque 19: Integración Completa y Matriz Exhaustiva de Pruebas', { heading: 2 });
ra2Xml += p('Se conectaron home.php, el CRUD clásico de canciones.php y la gestión asíncrona canciones-ajax.php compartiendo el mismo almacén. El reproductor Jukebox en la Home consume api/canciones.php y reproduce los audios autorizados.');
ra2Xml += pImage('bloque-19-jukebox-reproductor.png');
ra2Xml += pImage('bloque-19-matriz-pruebas-ra2.png');
ra2Xml += p('Dificultad Resuelta: Diagnóstico del UTF-8 BOM en Windows:', { bold: true });
ra2Xml += p('Durante las pruebas de envío POST en consola, se detectó un rechazo 400 Bad Request en peticiones aparentemente válidas. Al inspeccionar el flujo binario con bin2hex(), se descubrió que Windows enviaba el prefijo EF BB BF (Byte Order Mark). PHP consideraba este encabezado como un error de sintaxis JSON. Se solventó en api/catalogo.php eliminando la marca mediante preg_replace("/^\\xEF\\xBB\\xBF/", "", trim($cuerpoRaw)), asegurando compatibilidad universal.');

ra2Xml += p('Bloque 20: Respuestas para la Defensa Técnica y Autoevaluación', { heading: 2 });
ra2Xml += p('1. ¿Dónde se ejecuta PHP? Se ejecuta exclusivamente en el servidor dentro del contenedor Docker. El navegador cliente jamás interpreta código PHP ni accede a /var/www/data; solo ejecuta JavaScript y procesa HTML o JSON recibido.', { bold: true });
ra2Xml += p('2. ¿Qué hace await? Pausa la ejecución secuencial de una función async de forma no bloqueante hasta que la Promesa se resuelve, permitiendo esperar respuestas HTTP o decodificaciones JSON sin congelar la interfaz ni el hilo principal.', { bold: true });
ra2Xml += p('3. ¿Por qué response.ok no es lo mismo que contenido.ok? response.ok es la propiedad nativa de Fetch que comprueba códigos HTTP 200-299. contenido.ok es el atributo de nuestra aplicación. Un 404 o 500 no hace que fetch falle por sí solo, requiriendo validar ambos.', { bold: true });
ra2Xml += p('4. ¿Por qué se valida de nuevo en el servidor? Porque el cliente es un entorno modificable y vulnerable a manipulaciones externas (DevTools, scripts, curl). La validación en cliente es ergonomía de usuario; la validación en backend es seguridad e integridad de datos.', { bold: true });
ra2Xml += p('5. ¿Qué diferencia hay entre la cookie de sesión y el token CSRF? La cookie se transmite automáticamente por el navegador en cada petición al mismo dominio. El token CSRF es un secreto dinámico inyectado manualmente por la aplicación que previene que sitios de terceros ejecuten peticiones forzadas en nombre de un usuario autenticado.', { bold: true });
ra2Xml += p('6. ¿Por qué el ID no es el número de fila? Porque el número de fila es una posición visual transitoria que cambia al ordenar, filtrar o eliminar. El ID es un identificador unívoco e inmutable que preserva la identidad del registro en la base de datos o archivo JSON.', { bold: true });
ra2Xml += p('Autoevaluación del Prototipo:', { bold: true });
ra2Xml += p('El sistema cumple al 100% con los requerimientos de la RA2: CRUD completo mediante Fetch y JSON sin recargas, validaciones estrictas, seguridad CSRF, concurrencia protegida con flock, prevención de XSS y coexistencia con el reproductor y CRUD clásico. Como limitación conservada, el almacenamiento se gestiona en archivo JSON plano (útil para prototipado educativo pero no escalable a nivel empresarial frente a un RDBMS con transacciones ACID distribuidas). Todo el flujo y decisiones técnicas pueden explicarse con soltura de manera conceptual sin depender de leer líneas de código.');

// Insertar antes del cierre de body
const lastSectPrIdx = docXml.lastIndexOf('<w:sectPr');
if (lastSectPrIdx !== -1) {
    docXml = docXml.substring(0, lastSectPrIdx) + ra2Xml + docXml.substring(lastSectPrIdx);
} else {
    docXml = docXml.replace('</w:body>', `${ra2Xml}</w:body>`);
}

zip.updateFile('word/document.xml', Buffer.from(docXml, 'utf8'));
zip.writeZip(OUTPUT_FILE);

const stats = fs.statSync(OUTPUT_FILE);
console.log(`[EXITO] Generado ${OUTPUT_FILE} (${Math.round(stats.size/1024)}KB)`);
console.log(`[INFO] Puedes renombrar este archivo a DOCUMENTACION.docx cuando cierres Word`);
