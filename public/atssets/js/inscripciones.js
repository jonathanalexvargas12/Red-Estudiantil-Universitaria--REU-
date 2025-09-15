// Para desplegar los criterios de filtrado del CRUD
const btnFiltrar = document.getElementById('btn-filtrar');
const filtrosBusqueda = document.getElementById('filtros-busqueda');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

// Para buscar coincidencias con el filtro
document.addEventListener('DOMContentLoaded', () => {
    const tablaInscripciones = document.getElementById('tabla-inscripciones').getElementsByTagName('tbody')[0];
    const buscarInput = document.getElementById('buscar-input');
    const periodoSelect = document.getElementById('periodo-select');
    const estadoSelect = document.getElementById('estado-select');
    const pagoSelect = document.getElementById('pago-select');
    const botonBuscar = document.querySelector('.botones-filtro .boton-filtro');
    const btnReajustar = document.getElementById('btn-reajustar');

    let filasOriginales = Array.from(tablaInscripciones.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaInscripciones.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const periodoSeleccionado = periodoSelect.value;
        const estadoSeleccionado = estadoSelect.value;
        const pagoSeleccionado = pagoSelect.value;

        tablaInscripciones.innerHTML = '';

        filasOriginales.forEach(fila => {
            const cedula = fila.cells[1].textContent.toLowerCase();
            const nombres = fila.cells[2].textContent.toLowerCase();
            const apellidos = fila.cells[3].textContent.toLowerCase();
            const carrera = fila.cells[4].textContent.toLowerCase();
            const periodo = fila.cells[6].textContent;

            // Obtener el estado usando la función mejorada
            const estado = obtenerEstado(fila);

            const pago = fila.cells[9].querySelector('i').classList.contains('pago-realizado') ? 'realizado' : 'pendiente';

            const coincideBusqueda = textoBusqueda === '' ||
                                     cedula.includes(textoBusqueda) ||
                                     nombres.includes(textoBusqueda) ||
                                     apellidos.includes(textoBusqueda) ||
                                     carrera.includes(textoBusqueda);
            const coincidePeriodo = periodoSeleccionado === '' || periodo === periodoSeleccionado;
            const coincideEstado = estadoSeleccionado === '' || estado === estadoSeleccionado;
            const coincidePago = pagoSeleccionado === '' || pago === pagoSeleccionado;

            if (coincideBusqueda && coincidePeriodo && coincideEstado && coincidePago) {
                tablaInscripciones.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }

    // Función para obtener el estado de forma segura
    function obtenerEstado(fila) {
        const icono = fila.cells[8].querySelector('i');
        if (!icono) return 'desconocido'; // Manejar el caso donde no hay icono

        const clasesEstado = ['estado-activo', 'estado-rechazado', 'estado-inactivo'];
        const claseEncontrada = clasesEstado.find(clase => icono.classList.contains(clase));
        return claseEncontrada ? claseEncontrada.replace('estado-', '') : 'desconocido';
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        periodoSelect.selectedIndex = 0;
        estadoSelect.selectedIndex = 0;
        pagoSelect.selectedIndex = 0;
        tablaInscripciones.innerHTML = '';
        filasOriginales.forEach(fila => tablaInscripciones.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Para restablecer los criterios de filtrado del CRUD
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        periodoSelect.selectedIndex = 0; 
        estadoSelect.selectedIndex = 0;
        pagoSelect.selectedIndex = 0;
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas
    const table = document.getElementById('tabla-inscripciones');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    function updateRowCount() {
        totalRows = rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < rows.length; i++) {
            rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior');
        const nextButton = document.querySelector('.pagina-siguiente');
        const pageButtonsContainer = document.querySelector('.numeros-pagina');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina');
            button.textContent = i;
            button.classList.toggle('activo', i === currentPage); // Marcar el botón activo

            // Agregar evento de clic para cambiar de página
            button.addEventListener('click', () => {
                currentPage = i;
                displayRows(currentPage);
                updatePaginationButtons();
            });

            pageButtonsContainer.appendChild(button);
        }
    }

    function actualizarPaginacion() {
        updateRowCount(); // Actualizar el conteo de filas
        currentPage = 1; // Reiniciar a la primera página
        displayRows(currentPage); // Mostrar las filas de la primera página
        updatePaginationButtons(); // Actualizar los botones de paginación
    }

    document.querySelector('.pagina-anterior').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicializar la paginación
    actualizarPaginacion();
});

// Función para reasignar eventos de las ventanas modales
function asignarEventosModal() {
    // Ventana modal de "Agregar"
    const agregarModal = document.getElementById("agregarModal");
    const agregarModalForm = document.getElementById("agregar-modal-form");
    const agregarSpan = document.getElementsByClassName("agregar-close")[0];
    const cancelarAgregarModal = document.getElementById("cancelar-agregar-modal");
    const btnAgregar = document.getElementById("btn-agregar");

    btnAgregar.addEventListener("click", () => {
        agregarModal.style.display = "block";
    });

    agregarSpan.onclick = function() {
        agregarModal.style.display = "none";
    }
    cancelarAgregarModal.onclick = function(){
        agregarModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == agregarModal) {
            agregarModal.style.display = "none";
        }
    }

    agregarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        agregarModal.style.display = "none";
    });

    // Ventana modal "Editar"
    const modal = document.getElementById("myModal");
    const modalForm = document.getElementById("modal-form");
    const span = document.getElementsByClassName("close")[0];
    const cancelarModal = document.getElementById("cancelar-modal");
    const editIcons = document.querySelectorAll(".fa-edit");
    let currentRow;

    // Reasignar eventos de edición
    editIcons.forEach(icon => {
        icon.removeEventListener("click", handleEditClick); // Eliminar eventos anteriores
        icon.addEventListener("click", handleEditClick); // Reasignar eventos
    });

    function handleEditClick(event) {
        modal.style.display = "block";
        currentRow = event.target.closest("tr");
        populateModal(currentRow);
    }

    span.onclick = function() {
        modal.style.display = "none";
    }
    cancelarModal.onclick = function(){
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function populateModal(row) {
        const cells = row.querySelectorAll("td");
        document.getElementById("cedula").value = cells[1].textContent;
        document.getElementById("nombres").value = cells[2].textContent;
        document.getElementById("apellidos").value = cells[3].textContent;
        document.getElementById("carrera").value = cells[4].textContent;
        document.getElementById("pensum").value = cells[5].textContent;
        document.getElementById("periodo").value = cells[6].textContent;
        document.getElementById("fecha").value = formatDate(cells[7].textContent);

        // Usar la función obtenerEstado para el modal de edición también
        document.getElementById("estado").value = obtenerEstado(row);

        document.getElementById("pago").value = cells[9].querySelector("i").classList.contains("pago-realizado") ? "realizado" : "pendiente";
    }

    function formatDate(dateString) {
        const parts = dateString.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    modalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = currentRow.querySelectorAll("td");
        cells[1].textContent = document.getElementById("cedula").value;
        cells[2].textContent = document.getElementById("nombres").value;
        cells[3].textContent = document.getElementById("apellidos").value;
        cells[4].textContent = document.getElementById("carrera").value;
        cells[5].textContent = document.getElementById("pensum").value;
        cells[6].textContent = document.getElementById("periodo").value;
        formatDate(cells[7].textContent).textContent = document.getElementById("fecha").value;

        const estadoIcon = cells[8].querySelector("i");
        if (estadoIcon) {
            estadoIcon.classList.remove("estado-activo", "estado-inactivo", "estado-rechazado");
            if (document.getElementById("estado").value === "activo") {
                estadoIcon.classList.add("estado-activo");
            } else if (document.getElementById("estado").value === "inactivo") {
                estadoIcon.classList.add("estado-inactivo");
            } else if (document.getElementById("estado").value === "rechazado") {
                estadoIcon.classList.add("estado-rechazado");
            }
        }

        // Manejo del icono de pago (CAMBIO CLAVE)
        const pagoIcon = cells[9].querySelector("i");
        if (pagoIcon) {
            let nuevoIconoPago = document.createElement('i'); // Crear un nuevo elemento <i>
            nuevoIconoPago.title = document.getElementById("pago").value === "realizado" ? "Pago Realizado" : "Pago Pendiente"; // Establecer el título

            if (document.getElementById("pago").value === "realizado") {
                nuevoIconoPago.classList.add("fas", "fa-check", "pago-realizado"); // Clases para "Pago Realizado"
            } else {
                nuevoIconoPago.classList.add("fas", "fa-times", "pago-pendiente"); // Clases para "Pago Pendiente"
            }

            cells[9].replaceChild(nuevoIconoPago, pagoIcon); // Reemplazar el icono antiguo con el nuevo
        }

        modal.style.display = "none";
    });

    // Ventana modal de anular el CRUD
    const modalAnular = document.getElementById("modalAnular");
    const btnAnular = document.querySelectorAll(".fa-ban");
    const spanCerrarAnular = document.getElementsByClassName("close-anular")[0];
    let filaAnular; // Variable para almacenar la fila que se va a anular

    // Reasignar eventos de anulación
    btnAnular.forEach(btn => {
        btn.removeEventListener("click", handleAnularClick); // Eliminar eventos anteriores
        btn.addEventListener("click", handleAnularClick); // Reasignar eventos
    });

    function handleAnularClick(event) {
        modalAnular.style.display = "block";
        filaAnular = event.target.closest('tr'); // Almacena la fila que se va a anular
    }

    spanCerrarAnular.onclick = function() {
        modalAnular.style.display = "none";
    }

    document.getElementById("btn-cancelar-anular").onclick = function() {
        modalAnular.style.display = "none";
    }

    document.getElementById("btn-aceptar-anular").onclick = function() {
        if (filaAnular) {
            const estadoIcono = filaAnular.querySelector('.fa-circle'); // Encuentra el icono de estado en la fila
            estadoIcono.classList.remove('estado-activo', 'estado-inactivo'); // Elimina las clases de estado anteriores
            estadoIcono.classList.add('estado-anulado'); // Añade la clase de estado anulado
            estadoIcono.setAttribute('title', 'Anulado'); // Cambia el título del icono
        }
        modalAnular.style.display = "none"; // Cierra la ventana modal
    }

    window.onclick = function(event) {
        if (event.target == modalAnular) {
            modalAnular.style.display = "none";
        }
    }
}

// Llamar a la función para asignar eventos inicialmente
asignarEventosModal();