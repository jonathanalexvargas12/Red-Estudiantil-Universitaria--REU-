// Para desplegar los criterios de filtrado 

const btnFiltrar = document.querySelector('.boton-crud-calificaciones:first-child'); 
const filtrosBusqueda = document.querySelector('.filtros-busqueda-calificaciones');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

// Para buscar coincidencias con el filtro
document.addEventListener('DOMContentLoaded', () => {
    const tablaCalificaciones = document.getElementById('tabla-calificaciones').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-calificaciones');
    const periodoSelect = document.querySelector('.periodo-select');
    const asignaturaSelect = document.querySelector('.asignatura-select');
    const botonBuscar = document.querySelector('.botones-filtro-calificaciones .boton-filtro-calificaciones');
    const btnReajustar = document.querySelector('.botones-filtro-calificaciones .boton-filtro-calificaciones:last-child');

    let filasOriginales = Array.from(tablaCalificaciones.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaCalificaciones.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const periodoSeleccionado = periodoSelect.value.toLowerCase();
        const asignaturaSeleccionada = asignaturaSelect.value.toLowerCase();

        tablaCalificaciones.innerHTML = '';

        filasOriginales.forEach(fila => {
            const periodo = fila.cells[1].textContent.toLowerCase();
            const asignatura = fila.cells[2].textContent.toLowerCase();
            const seccion = fila.cells[3].textContent.toLowerCase();
            const profesor = fila.cells[4].textContent.toLowerCase();
            const estudiante = fila.cells[5].textContent.toLowerCase();
            const nota = fila.cells[6].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' ||
                                     periodo.includes(textoBusqueda) ||
                                     asignatura.includes(textoBusqueda) ||
                                     seccion.includes(textoBusqueda) ||
                                     profesor.includes(textoBusqueda) ||
                                     estudiante.includes(textoBusqueda) ||
                                     nota.includes(textoBusqueda);

            const coincidePeriodo = periodoSeleccionado === '' || periodo === periodoSeleccionado;
            const coincideAsignatura = asignaturaSeleccionada === '' || asignatura === asignaturaSeleccionada;

            if (coincideBusqueda && coincidePeriodo && coincideAsignatura) {
                tablaCalificaciones.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        periodoSelect.selectedIndex = 0;
        asignaturaSelect.selectedIndex = 0;
        tablaCalificaciones.innerHTML = '';
        filasOriginales.forEach(fila => tablaCalificaciones.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaCalificaciones.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaCalificaciones.rows.length; i++) {
            tablaCalificaciones.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaCalificaciones.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-calificaciones').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-calificaciones');
        const nextButton = document.querySelector('.pagina-siguiente-calificaciones');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-calificaciones');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-calificaciones');
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

    document.querySelector('.pagina-anterior-calificaciones').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-calificaciones').addEventListener('click', () => {
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
    // Ventana modal "Editar"
    const editarModal = document.getElementById("editarModal");
    const editarModalForm = document.getElementById("editar-modal-form");
    const spanEditar = document.querySelector("#editarModal .close");
    const cancelarEditarModal = document.getElementById("cancelar-editar-modal");
    let filaActual;

    // Reasignar eventos de edición
    const editIcons = document.querySelectorAll(".fa-edit");
    editIcons.forEach(icon => {
        icon.removeEventListener("click", handleEditClick); // Eliminar eventos anteriores
        icon.addEventListener("click", handleEditClick); // Reasignar eventos
    });

    function handleEditClick(event) {
        editarModal.style.display = "block";
        filaActual = event.target.closest("tr");
        populateModal(filaActual);
    }

    spanEditar.onclick = function() {
        editarModal.style.display = "none";
    }
    cancelarEditarModal.onclick = function(){
        editarModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == editarModal) {
            editarModal.style.display = "none";
        }
    }

    function populateModal(row) {
        const cells = row.querySelectorAll("td");
        document.getElementById("editar-periodo").value = cells[1].textContent;
        document.getElementById("editar-asignatura").value = cells[2].textContent;
        document.getElementById("editar-seccion").value = cells[3].textContent;
        document.getElementById("editar-profesor").value = cells[4].textContent;
        document.getElementById("editar-estudiante").value = cells[5].textContent;
        document.getElementById("editar-nota").value = cells[6].textContent;
    }

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActual.querySelectorAll("td");
        cells[1].textContent = document.getElementById("editar-periodo").value;
        cells[2].textContent = document.getElementById("editar-asignatura").value;
        cells[3].textContent = document.getElementById("editar-seccion").value;
        cells[4].textContent = document.getElementById("editar-profesor").value;
        cells[5].textContent = document.getElementById("editar-estudiante").value;
        cells[6].textContent = document.getElementById("editar-nota").value;
        editarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de editar
        asignarEventosModal(); // Reasignar eventos después de editar
    });

    // Ventana modal de "Eliminar"
    const eliminarModal = document.getElementById("eliminarModal");
    const btnEliminar = document.querySelectorAll(".fa-trash");
    const spanCerrarEliminar = document.querySelector("#eliminarModal .eliminar-close");
    const btnAceptarEliminar = document.getElementById("btn-aceptar-eliminar");
    const btnCancelarEliminar = document.getElementById("btn-cancelar-eliminar");
    let filaEliminar;

    btnEliminar.forEach(btn => {
        btn.addEventListener("click", () => {
            eliminarModal.style.display = "block";
            filaEliminar = btn.closest('tr');
        });
    });

    spanCerrarEliminar.onclick = function() {
        eliminarModal.style.display = "none";
    }

    btnCancelarEliminar.onclick = function() {
        eliminarModal.style.display = "none";
    }

    btnAceptarEliminar.onclick = function() {
        if (filaEliminar) {
            filaEliminar.remove(); // Eliminar la fila
        }
        eliminarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de eliminar
        asignarEventosModal(); // Reasignar eventos después de eliminar
    }

    window.onclick = function(event) {
        if (event.target == eliminarModal) {
            eliminarModal.style.display = "none";
        }
    }
}

// Llamar a la función para asignar eventos inicialmente
asignarEventosModal();