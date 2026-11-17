# Bloque 20: Entrega, Guion de Demostración y Defensa Técnica (RA2)

## 1. Guion Paso a Paso para la Demostración Técnica

Este guion describe el recorrido completo para defender la práctica ante el evaluador sin necesidad de corregir archivos en directo:

1. **Paso 1 · Acceso y Contexto:**
   - Abrir el navegador en `http://localhost:8091/login.php`.
   - Iniciar sesión con la cuenta de prueba `admin` / `admin123`.
   - Mostrar la pantalla principal (`home.php`).
   - *Explicación verbal:* Explicar que se conserva el entorno multiservicio de la Etapa 1 en el puerto 8091 con persistencia en `/var/www/data/canciones.json`. La Etapa 2 añade la capa asíncrona mediante `fetch` y la API REST `api/catalogo.php`.
2. **Paso 2 · Demostración de Alta en vivo (sin recargas):**
   - Navegar a `canciones-ajax.php` con la pestaña **Red (Network)** de las DevTools abierta, filtrando por `Fetch/XHR`.
   - Rellenar el formulario con una canción de prueba y pulsar *"Añadir canción"*.
   - Señalar en DevTools la petición `POST api/catalogo.php?action=create`, la cabecera `Content-Type: application/json`, el token `X-CSRF-Token`, el cuerpo JSON enviado y la respuesta **`HTTP 201 Created`**.
   - Mostrar que la tabla añade la fila instantáneamente sin ninguna navegación de tipo `Document` y que el formulario se vacía solo tras la confirmación del servidor.
3. **Paso 3 · Edición y Estabilidad de Identificadores:**
   - Pulsar *"Editar"* en una canción: mostrar cómo el formulario cambia a *"Editando: ..."*, el botón cambia a *"Guardar cambios"*, aparece *"Cancelar"* y el foco se coloca en el título.
   - Modificar el título y pulsar *"Guardar cambios"*. Señalar la respuesta `HTTP 200 OK` y destacar que el **`id` original se ha conservado**.
   - Pulsar *"Eliminar"* en una fila intermedia y aceptar el cuadro de confirmación nativo: demostrar que la ficha desaparece y que **las fichas restantes no se renumeran**.
4. **Paso 4 · Comprobación de Validaciones y Rechazo Seguro:**
   - Intentar guardar una duración negativa (`-30`): mostrar el mensaje de error `422 Unprocessable Entity` y evidenciar que los campos del formulario se conservan para permitir la corrección.
5. **Paso 5 · Interoperabilidad y Cierre de Sesión:**
   - Abrir en otra pestaña el CRUD clásico (`canciones.php`): comprobar que refleja exactamente las mismas canciones.
   - Regresar a `home.php`: escuchar la pista autorizada cargada dinámicamente en el reproductor.
   - Pulsar *"Cerrar sesión"* e intentar realizar una consulta directa a `api/catalogo.php?action=list`: mostrar el rechazo **`401 Unauthorized`** en formato JSON.

---

## 2. Respuestas a las Preguntas Clave de Evaluación

### ¿Dónde se ejecuta PHP?
**Respuesta:** PHP se ejecuta estrictamente en el **servidor web** (dentro del contenedor Docker). El navegador cliente jamás ejecuta PHP ni tiene acceso directo a los archivos PHP ni al directorio privado de datos (`/var/www/data`). El navegador únicamente ejecuta JavaScript y recibe el texto procesado (HTML o JSON) que PHP emite a través de HTTP.

### ¿Qué hace `await`?
**Respuesta:** Dentro de una función declarada como `async`, la palabra clave `await` pausa de forma no bloqueante la ejecución lineal de esa función específica hasta que la Promesa asociada se resuelve o se rechaza. Permite escribir código asíncrono con una sintaxis limpia y secuencial similar a la síncrona, sin bloquear el hilo principal de renderizado de la interfaz ni congelar el navegador.

### ¿Por qué `response.ok` no es lo mismo que `contenido.ok`?
**Respuesta:** 
- `response.ok` es una propiedad estándar del navegador (API Fetch) que evalúa si el código de estado HTTP recibido se encuentra entre 200 y 299. Si el servidor responde con un error 404 o 500, la promesa de `fetch` no falla por sí sola y `response.ok` vale `false`.
- `contenido.ok` es una propiedad de nuestro contrato de datos en formato JSON (`{ "ok": true, "data": ... }`). Representa si la lógica de negocio en el backend consideró la operación exitosa. Es necesario validar ambos para garantizar un control robusto de fallos.

### ¿Por qué se valida de nuevo en el servidor si ya se valida en JavaScript?
**Respuesta:** Porque el entorno del navegador está bajo el control total del cliente. Un usuario o atacante puede deshabilitar JavaScript, modificar el DOM con las herramientas de desarrollador o saltarse la interfaz enviando peticiones HTTP arbitrarias mediante `curl`, Postman o scripts maliciosos. La validación en el cliente solo mejora la experiencia de usuario (UX); la validación en el servidor es el único mecanismo real de **seguridad e integridad de datos**.

### ¿Qué diferencia hay entre una cookie de sesión y un token CSRF?
**Respuesta:** 
- La **cookie de sesión** (`PHPSESSID`) autentica la identidad del usuario y es enviada automáticamente por el navegador en cada solicitud HTTP hacia el mismo dominio.
- El **token CSRF** es un secreto criptográfico impredecible generado en la sesión que debe ser incrustado deliberadamente por el código de la aplicación (en una metaetiqueta o campo oculto) y enviado en una cabecera (`X-CSRF-Token`). Protege contra ataques donde un sitio malicioso induce al navegador a emitir una petición ilegítima aprovechando la presencia automática de la cookie de sesión.

### ¿Por qué el `id` no es el número de fila?
**Respuesta:** Porque el número de fila es una posición temporal y relativa en el árbol visual del DOM o en el array en memoria, la cual cambia inevitablemente cuando se ordenan, filtran o eliminan elementos. El `id` es un identificador unívoco e inmutable asignado por el servidor que define la identidad de la entidad a lo largo de todo su ciclo de vida. Si se utilizara el índice de fila, al borrar la fila 2, la fila 3 pasaría a ser la 2 y cualquier edición posterior modificaría la canción equivocada.

---

## 3. Autoevaluación del Prototipo

### Lo que funciona al 100%
- Arquitectura asíncrona completa: operaciones `list`, `create`, `update` y `delete` con actualización reactiva del DOM mediante `fetch` sin recargar la página.
- Seguridad completa: control estricto de sesión (401), protección CSRF con tokens comparados con `hash_equals` (403), validación de tipos y rangos de datos (422) y control de tipo de medio (415).
- Integridad en concurrencia: bloqueos atómicos compartidos y exclusivos mediante `flock` que evitan la corrupción del archivo JSON compartido.
- Prevención de XSS mediante uso riguroso de `textContent` y `replaceChildren()`.
- Convivencia e interoperabilidad total con el CRUD clásico y el reproductor multimedia de la home.

### Limitaciones que conserva el prototipo
- El almacenamiento sigue basándose en un archivo JSON en disco coordinado por `flock`. Aunque previene colisiones locales, no sustituye a un sistema gestor de bases de datos relacionales (RDBMS) para altas cargas transaccionales concurrentes.
- El reproductor de la home no implementa WebSockets ni Server-Sent Events (SSE); por tanto, si se añade una canción desde AJAX, el reproductor debe refrescar su lista para reproducir la nueva pista (requisito contemplado explícitamente en el enunciado).

### Lo que puedo explicar sin leer código
- El ciclo de vida de una petición HTTP asíncrona, desde el evento del DOM hasta el retorno del JSON.
- Cómo interactúan las cabeceras HTTP, los códigos de estado y la serialización JSON.
- Por qué un fallo en el servidor no debe limpiar el formulario del usuario y cómo se evitan las condiciones de carrera con deshabilitación de controles.
- La diferencia fundamental entre identidad (`id`) y posición en un array.
