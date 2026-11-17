// ============================================================================
// scripts/catalogo-ajax.js - Gestión asíncrona del catálogo con Fetch y JSON
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const metaCsrf = document.querySelector('meta[name="csrf-token"]');
    const csrfToken = metaCsrf ? metaCsrf.getAttribute('content') : '';

    const formulario = document.getElementById('formulario-cancion');
    const inputId = document.getElementById('cancion-id');
    const inputTitle = document.getElementById('campo-title');
    const inputArtist = document.getElementById('campo-artist');
    const selectCategory = document.getElementById('campo-category');
    const inputDuration = document.getElementById('campo-duration');
    const selectSrc = document.getElementById('campo-src');

    const tituloFormulario = document.getElementById('formulario-titulo');
    const badgeModo = document.getElementById('badge-modo');
    const btnSubmit = document.getElementById('btn-submit');
    const btnCancelar = document.getElementById('btn-cancelar');

    const tablaBody = document.getElementById('tabla-canciones-body');
    const mensajeEstado = document.getElementById('mensaje-estado');

    // Estado local
    let canciones = [];
    let operacionEnCurso = false;
    let modoEdicion = false;

    // ------------------------------------------------------------------------
    // Notificaciones accesibles para el usuario
    // ------------------------------------------------------------------------
    function mostrarMensaje(tipo, texto) {
        mensajeEstado.className = 'visible mensaje-' + tipo;
        mensajeEstado.textContent = texto;
    }

    function limpiarMensaje() {
        mensajeEstado.className = '';
        mensajeEstado.textContent = '';
    }

    // ------------------------------------------------------------------------
    // Bloqueo de controles para evitar doble envío (concurrencia en la interfaz)
    // ------------------------------------------------------------------------
    function bloquearControles(bloquear) {
        operacionEnCurso = bloquear;
        btnSubmit.disabled = bloquear;
        btnCancelar.disabled = bloquear;
        inputTitle.disabled = bloquear;
        inputArtist.disabled = bloquear;
        selectCategory.disabled = bloquear;
        inputDuration.disabled = bloquear;
        selectSrc.disabled = bloquear;

        const botonesAccion = tablaBody.querySelectorAll('button');
        botonesAccion.forEach(btn => btn.disabled = bloquear);
    }

    // ------------------------------------------------------------------------
    // Función común para peticiones a la API
    // ------------------------------------------------------------------------
    async function solicitarApi(action, metodo = 'GET', datos = null) {
        const url = `api/catalogo.php?action=${encodeURIComponent(action)}`;
        const opciones = {
            method: metodo,
            headers: {}
        };

        if (metodo === 'POST') {
            opciones.headers['Content-Type'] = 'application/json';
            opciones.headers['X-CSRF-Token'] = csrfToken;
            if (datos !== null) {
                opciones.body = JSON.stringify(datos);
            }
        }

        let respuesta;
        try {
            respuesta = await fetch(url, opciones);
        } catch (falloRed) {
            throw new Error('Error de red o conexión perdida. Comprueba el estado del servidor.');
        }

        let contenido;
        try {
            contenido = await respuesta.json();
        } catch (falloJson) {
            throw new Error(`El servidor respondió con formato inesperado (HTTP ${respuesta.status}).`);
        }

        if (!respuesta.ok || contenido.ok !== true) {
            const errorMsg = contenido && contenido.error ? contenido.error : `Error en la operación (HTTP ${respuesta.status}).`;
            throw new Error(errorMsg);
        }

        return contenido;
    }

    // ------------------------------------------------------------------------
    // Renderizado seguro de la tabla con DOM nativo (XSS Prevention)
    // ------------------------------------------------------------------------
    function renderizarCanciones(lista) {
        canciones = Array.isArray(lista) ? lista : [];
        tablaBody.replaceChildren();

        if (canciones.length === 0) {
            const filaVacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');
            celdaVacia.colSpan = 7;
            celdaVacia.className = 'td-empty';
            celdaVacia.textContent = 'Todavía no hay canciones en el catálogo.';
            filaVacia.append(celdaVacia);
            tablaBody.append(filaVacia);
            return;
        }

        canciones.forEach(cancion => {
            const fila = document.createElement('tr');

            const celdaId = document.createElement('td');
            celdaId.textContent = String(cancion.id);

            const celdaTitulo = document.createElement('td');
            celdaTitulo.textContent = cancion.title;

            const celdaArtista = document.createElement('td');
            celdaArtista.textContent = cancion.artist;

            const celdaCategoria = document.createElement('td');
            celdaCategoria.textContent = cancion.category;

            const celdaDuracion = document.createElement('td');
            celdaDuracion.textContent = `${cancion.duration} s`;

            const celdaAudio = document.createElement('td');
            celdaAudio.textContent = cancion.src;

            const celdaAcciones = document.createElement('td');

            // Botón Editar
            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn-sm';
            btnEditar.textContent = 'Editar';
            btnEditar.dataset.id = String(cancion.id);
            btnEditar.addEventListener('click', () => iniciarEdicion(cancion.id));

            // Botón Eliminar
            const btnEliminar = document.createElement('button');
            btnEliminar.type = 'button';
            btnEliminar.className = 'btn-sm';
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.dataset.id = String(cancion.id);
            btnEliminar.addEventListener('click', () => eliminarCancion(cancion.id));

            celdaAcciones.append(btnEditar, btnEliminar);

            fila.append(
                celdaId,
                celdaTitulo,
                celdaArtista,
                celdaCategoria,
                celdaDuracion,
                celdaAudio,
                celdaAcciones
            );

            tablaBody.append(fila);
        });
    }

    // ------------------------------------------------------------------------
    // Carga inicial del catálogo mediante GET
    // ------------------------------------------------------------------------
    async function cargarCatalogo() {
        mostrarMensaje('info', 'Cargando catálogo...');
        try {
            const respuesta = await solicitarApi('list', 'GET');
            if (Array.isArray(respuesta.data)) {
                renderizarCanciones(respuesta.data);
                limpiarMensaje();
            } else {
                throw new Error('La respuesta recibida no contiene una lista válida.');
            }
        } catch (error) {
            mostrarMensaje('error', error.message);
        }
    }

    // ------------------------------------------------------------------------
    // Flujo de Edición: Preparación y Cancelación
    // ------------------------------------------------------------------------
    function iniciarEdicion(id) {
        if (operacionEnCurso) return;

        const idNum = Number(id);
        const elegida = canciones.find(c => c.id === idNum);
        if (!elegida) {
            mostrarMensaje('error', 'No se encontró la canción en memoria.');
            return;
        }

        modoEdicion = true;
        inputId.value = String(elegida.id);
        inputTitle.value = elegida.title;
        inputArtist.value = elegida.artist;
        selectCategory.value = elegida.category;
        inputDuration.value = elegida.duration;
        selectSrc.value = elegida.src;

        if (badgeModo) badgeModo.style.display = 'inline';
        const spanTexto = (tituloFormulario && tituloFormulario.querySelector('span:first-child')) || tituloFormulario;
        if (spanTexto) spanTexto.textContent = `Editando: ${elegida.title}`;

        btnSubmit.textContent = 'Guardar cambios';
        btnCancelar.style.display = 'inline-block';

        mostrarMensaje('info', `Editando canción #${elegida.id} ("${elegida.title}").`);
        inputTitle.focus();
    }

    function cancelarEdicion() {
        modoEdicion = false;
        formulario.reset();
        inputId.value = '';

        if (badgeModo) badgeModo.style.display = 'none';
        const spanTexto = (tituloFormulario && tituloFormulario.querySelector('span:first-child')) || tituloFormulario;
        if (spanTexto) spanTexto.textContent = 'Añadir canción';

        btnSubmit.textContent = 'Añadir canción';
        btnCancelar.style.display = 'none';

        limpiarMensaje();
        inputTitle.focus();
    }

    btnCancelar.addEventListener('click', () => {
        cancelarEdicion();
    });

    // ------------------------------------------------------------------------
    // Flujo de Alta y Edición mediante Submit
    // ------------------------------------------------------------------------
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (operacionEnCurso) return;
        if (!formulario.reportValidity()) return;

        const title = inputTitle.value.trim();
        const artist = inputArtist.value.trim();
        const category = selectCategory.value;
        const duration = Number(inputDuration.value);
        const src = selectSrc.value;

        bloquearControles(true);

        try {
            if (modoEdicion) {
                mostrarMensaje('info', 'Guardando cambios...');
                const id = Number(inputId.value);
                const datos = { id, title, artist, category, duration, src };
                const respuesta = await solicitarApi('update', 'POST', datos);

                renderizarCanciones(respuesta.data);
                cancelarEdicion();
                mostrarMensaje('exito', 'Cambios guardados.');
            } else {
                mostrarMensaje('info', 'Guardando nueva canción...');
                const datos = { title, artist, category, duration, src };
                const respuesta = await solicitarApi('create', 'POST', datos);

                renderizarCanciones(respuesta.data);
                formulario.reset();
                mostrarMensaje('exito', 'Canción añadida.');
            }
        } catch (error) {
            // Se conservan los datos del formulario ante error
            mostrarMensaje('error', error.message);
        } finally {
            bloquearControles(false);
        }
    });

    // ------------------------------------------------------------------------
    // Flujo de Eliminación de una canción
    // ------------------------------------------------------------------------
    async function eliminarCancion(id) {
        if (operacionEnCurso) return;

        const idNum = Number(id);
        const cancion = canciones.find(c => c.id === idNum);
        const nombre = cancion ? cancion.title : `canción #${idNum}`;

        const confirmar = window.confirm(`¿Seguro que deseas eliminar la canción "${nombre}"?`);
        if (!confirmar) {
            return;
        }

        bloquearControles(true);
        mostrarMensaje('info', `Eliminando "${nombre}"...`);

        try {
            const respuesta = await solicitarApi('delete', 'POST', { id: idNum });

            if (modoEdicion && Number(inputId.value) === idNum) {
                cancelarEdicion();
            }

            renderizarCanciones(respuesta.data);
            mostrarMensaje('exito', `Canción "${nombre}" eliminada correctamente.`);
        } catch (error) {
            mostrarMensaje('error', error.message);
        } finally {
            bloquearControles(false);
        }
    }

    // Carga inicial
    cargarCatalogo();
});
