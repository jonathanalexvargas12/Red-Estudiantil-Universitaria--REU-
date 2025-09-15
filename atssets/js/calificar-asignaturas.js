// Para que se desplieguen los filtros de búsqueda
const btnFiltrarCalificar = document.getElementById('btn-filtrar-calificar');
const filtrosBusquedaCalificar = document.getElementById('filtros-busqueda-calificar');

btnFiltrarCalificar.addEventListener('click', () => {
    filtrosBusquedaCalificar.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    const tablaCalificar = document.getElementById('tabla-calificar').getElementsByTagName('tbody')[0];
    const buscarInput = document.getElementById('buscar-input-calificar');
    const periodoSelect = document.getElementById('periodo-select-calificar');
    const asignaturaSelect = document.getElementById('asignatura-select-calificar');
    const seccionSelect = document.getElementById('seccion-select-calificar');
    const botonBuscar = document.querySelector('.btn-buscar-calificar');
    const btnReajustar = document.getElementById('btn-reajustar-calificar');

    let filasOriginales = Array.from(tablaCalificar.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaCalificar.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const periodoSeleccionado = periodoSelect.value.toLowerCase();
        const asignaturaSeleccionada = asignaturaSelect.value.toLowerCase();
        const seccionSeleccionada = seccionSelect.value.toLowerCase();

        tablaCalificar.innerHTML = '';

        filasOriginales.forEach(fila => {
            const periodo = fila.cells[0].textContent.toLowerCase();
            const asignatura = fila.cells[1].textContent.toLowerCase();
            const seccion = fila.cells[2].textContent.toLowerCase();
            const estudiante = fila.cells[3].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' ||
                                     estudiante.includes(textoBusqueda);

            const coincidePeriodo = periodoSeleccionado === '' || periodo.includes(periodoSeleccionado);
            const coincideAsignatura = asignaturaSeleccionada === '' || 
                                       (asignaturaSeleccionada === 'mat101' && asignatura.includes('matematicas i')) || 
                                       (asignaturaSeleccionada === 'fis101' && asignatura.includes('fisica i')) ||
                                       (asignaturaSeleccionada === 'matematicas i' && asignatura.includes('matematicas i')) ||
                                       (asignaturaSeleccionada === 'fisica i' && asignatura.includes('fisica i'));
            const coincideSeccion = seccionSeleccionada === '' || seccion.includes(seccionSeleccionada);

            if (coincideBusqueda && coincidePeriodo && coincideAsignatura && coincideSeccion) {
                tablaCalificar.appendChild(fila.cloneNode(true));
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
        seccionSelect.selectedIndex = 0;
        tablaCalificar.innerHTML = '';
        filasOriginales.forEach(fila => tablaCalificar.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaCalificar.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaCalificar.rows.length; i++) {
            tablaCalificar.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaCalificar.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-calificar').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-calificar');
        const nextButton = document.querySelector('.pagina-siguiente-calificar');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-calificar');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-calificar');
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

    document.querySelector('.pagina-anterior-calificar').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-calificar').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicializar la paginación
    actualizarPaginacion();

    // Asignar eventos a la ventana modal de edición
    asignarEventosModal();
});

function asignarEventosModal() {
    const editarModal = document.getElementById("editarCalificacionModal");
    const editarModalForm = document.getElementById("editar-calificacion-modal-form");
    const span = document.getElementsByClassName("close")[0];
    const cancelarEditarModal = document.getElementById("cancelar-editar-calificacion-modal");
    let filaActual;

    // Reasignar eventos de edición
    const editIcons = document.querySelectorAll(".editar-icono");
    editIcons.forEach(icon => {
        icon.removeEventListener("click", handleEditClick); // Eliminar eventos anteriores
        icon.addEventListener("click", handleEditClick); // Reasignar eventos
    });

    function handleEditClick(event) {
        editarModal.style.display = "block";
        filaActual = event.target.closest("tr");
        populateModal(filaActual);
    }

    span.onclick = function() {
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
        document.getElementById("editar-periodo").value = cells[0].textContent;
        document.getElementById("editar-asignatura").value = cells[1].textContent === 'Matematicas I' ? 'mat101' : 'fis101';
        document.getElementById("editar-seccion").value = cells[2].textContent;
        document.getElementById("editar-estudiante").value = cells[3].textContent;
        document.getElementById("editar-nota").value = cells[4].textContent;
        document.getElementById("editar-nota-definitiva").value = cells[5].textContent;
        document.getElementById("editar-estado").value = cells[6].textContent.includes('Asistente') ? 'asistente' : 
                                                          cells[6].textContent.includes('Inasistente') ? 'inasistente' : 'cargando';
    }

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActual.querySelectorAll("td");
        cells[0].textContent = document.getElementById("editar-periodo").value;
        cells[1].textContent = document.getElementById("editar-asignatura").value === 'mat101' ? 'Matematicas I' : 'Fisica I';
        cells[2].textContent = document.getElementById("editar-seccion").value;
        cells[3].textContent = document.getElementById("editar-estudiante").value;
        cells[4].textContent = document.getElementById("editar-nota").value;
        cells[5].textContent = document.getElementById("editar-nota-definitiva").value;
        const estado = document.getElementById("editar-estado").value;
        cells[6].innerHTML = `<span class="estado-circulo estado-${estado}"></span> ${estado.charAt(0).toUpperCase() + estado.slice(1)}`;
        editarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de editar
        asignarEventosModal(); // Reasignar eventos después de editar
    });
}

// Llamar a la función para asignar eventos inicialmente
asignarEventosModal();