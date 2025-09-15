// Para desplegar los criterios de filtrado 

const btnFiltrar = document.querySelector('.boton-crud-profesores:first-child'); 
const filtrosBusqueda = document.querySelector('.filtros-busqueda-profesores');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

// Para buscar coincidencias con el filtro
document.addEventListener('DOMContentLoaded', () => {
    const tablaProfesores = document.getElementById('tabla-profesores').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-profesores');
    const tipoSelect = document.querySelector('.tipo-select');
    const estadoSelect = document.querySelector('.estado-profesores-select');
    const botonBuscar = document.querySelector('.botones-filtro-profesores .boton-filtro-profesores');
    const btnReajustar = document.querySelector('.botones-filtro-profesores .boton-filtro-profesores:last-child');

    let filasOriginales = Array.from(tablaProfesores.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaProfesores.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tipoSeleccionado = tipoSelect.value.toLowerCase();
        const estadoSeleccionado = estadoSelect.value.toLowerCase();

        tablaProfesores.innerHTML = '';

        filasOriginales.forEach(fila => {
            const cedula = fila.cells[1].textContent.toLowerCase();
            const apellidos = fila.cells[2].textContent.toLowerCase();
            const nombres = fila.cells[3].textContent.toLowerCase();
            const codigo = fila.cells[4].textContent.toLowerCase();
            const tipo = fila.cells[5].querySelector('i').classList.contains('tipo-normal') ? 'normal' : 'virtual';
            const estado = fila.cells[6].querySelector('i').classList.contains('estado-activo') ? 'activo' : 'inactivo';

            const coincideBusqueda = textoBusqueda === '' ||
                                     cedula.includes(textoBusqueda) ||
                                     apellidos.includes(textoBusqueda) ||
                                     nombres.includes(textoBusqueda) ||
                                     codigo.includes(textoBusqueda);

            const coincideTipo = tipoSeleccionado === '' || tipo === tipoSeleccionado;
            const coincideEstado = estadoSeleccionado === '' || estado === estadoSeleccionado;

            if (coincideBusqueda && coincideTipo && coincideEstado) {
                tablaProfesores.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        tipoSelect.selectedIndex = 0;
        estadoSelect.selectedIndex = 0;
        tablaProfesores.innerHTML = '';
        filasOriginales.forEach(fila => tablaProfesores.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaProfesores.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaProfesores.rows.length; i++) {
            tablaProfesores.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaProfesores.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-profesores').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-profesores');
        const nextButton = document.querySelector('.pagina-siguiente-profesores');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-profesores');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-profesores');
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

    document.querySelector('.pagina-anterior-profesores').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-profesores').addEventListener('click', () => {
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
        document.getElementById("editar-cedula").value = cells[1].textContent;
        document.getElementById("editar-apellidos").value = cells[2].textContent;
        document.getElementById("editar-nombres").value = cells[3].textContent;
        document.getElementById("editar-codigo").value = cells[4].textContent;
        document.getElementById("editar-tipo").value = cells[5].querySelector('i').classList.contains('tipo-normal') ? 'normal' : 'virtual';
        document.getElementById("editar-estado").value = cells[6].querySelector('i').classList.contains('estado-activo') ? 'activo' : 'inactivo';
    }

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActual.querySelectorAll("td");
        cells[1].textContent = document.getElementById("editar-cedula").value;
        cells[2].textContent = document.getElementById("editar-apellidos").value;
        cells[3].textContent = document.getElementById("editar-nombres").value;
        cells[4].textContent = document.getElementById("editar-codigo").value;
        cells[5].innerHTML = `<i class="fas fa-circle ${document.getElementById("editar-tipo").value === 'normal' ? 'tipo-normal' : 'tipo-virtual'}" title="${document.getElementById("editar-tipo").value === 'normal' ? 'Profesor Normal' : 'Profesor Virtual'}"></i>`;
        cells[6].innerHTML = `<i class="fas fa-circle ${document.getElementById("editar-estado").value === 'activo' ? 'estado-activo' : 'estado-inactivo'}" title="${document.getElementById("editar-estado").value === 'activo' ? 'Activo' : 'Inactivo'}"></i>`;
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