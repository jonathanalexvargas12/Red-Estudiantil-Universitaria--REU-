document.addEventListener('DOMContentLoaded', () => {
    const tablaAsignaturas = document.getElementById('tabla-asignaturas').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-asignaturas');
    const botonBuscar = document.querySelector('.btn-buscar-asignaturas');
    const btnReajustar = document.querySelector('.btn-reajustar-asignaturas');

    let filasOriginales = Array.from(tablaAsignaturas.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaAsignaturas.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        tablaAsignaturas.innerHTML = '';

        filasOriginales.forEach(fila => {
            const codigoAsignatura = fila.cells[0].textContent.toLowerCase();
            const nombreAsignatura = fila.cells[1].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || codigoAsignatura.includes(textoBusqueda) || nombreAsignatura.includes(textoBusqueda);

            if (coincideBusqueda) {
                tablaAsignaturas.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        tablaAsignaturas.innerHTML = '';
        filasOriginales.forEach(fila => tablaAsignaturas.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Paginación
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaAsignaturas.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaAsignaturas.rows.length; i++) {
            tablaAsignaturas.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaAsignaturas.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-asignaturas').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-asignaturas');
        const nextButton = document.querySelector('.pagina-siguiente-asignaturas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-asignaturas');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-asignaturas');
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

    document.querySelector('.pagina-anterior-asignaturas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-asignaturas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicializar la paginación
    actualizarPaginacion();
});

function asignarEventosModal() {
    // Ventana modal de "Agregar"
    const agregarModal = document.getElementById("agregarAsignaturaModal");
    const agregarModalForm = document.getElementById("agregar-asignatura-modal-form");
    const agregarSpan = document.getElementsByClassName("agregar-close")[0];
    const cancelarAgregarModal = document.getElementById("cancelar-agregar-asignatura-modal");
    const btnAgregar = document.getElementById("btn-agregar-asignatura");

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
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td>${document.getElementById("agregar-codigo-asignatura").value}</td>
            <td>${document.getElementById("agregar-nombre-asignatura").value}</td>
            <td>
                <i class="fas fa-edit accion-icono editar-icono-asignatura" title="Editar"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono-asignatura" title="Eliminar"></i>
            </td>
        `;
        tablaAsignaturas.appendChild(nuevaFila);
        agregarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de agregar
        asignarEventosModal(); // Reasignar eventos después de agregar
    });

    // Ventana modal "Editar"
    const editarModal = document.getElementById("editarAsignaturaModal");
    const editarModalForm = document.getElementById("editar-asignatura-modal-form");
    const span = document.getElementsByClassName("close")[0];
    const cancelarEditarModal = document.getElementById("cancelar-editar-asignatura-modal");
    let filaActual;

    // Reasignar eventos de edición
    const editIcons = document.querySelectorAll(".editar-icono-asignatura");
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
        document.getElementById("editar-codigo-asignatura").value = cells[0].textContent;
        document.getElementById("editar-nombre-asignatura").value = cells[1].textContent;
    }

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActual.querySelectorAll("td");
        cells[0].textContent = document.getElementById("editar-codigo-asignatura").value;
        cells[1].textContent = document.getElementById("editar-nombre-asignatura").value;
        editarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de editar
        asignarEventosModal(); // Reasignar eventos después de editar
    });

    // Ventana modal de eliminar
    const eliminarModal = document.getElementById("eliminarAsignaturaModal");
    const btnEliminar = document.querySelectorAll(".eliminar-icono-asignatura");
    let filaEliminar;

    btnEliminar.forEach(btn => {
        btn.removeEventListener("click", handleEliminarClick); // Eliminar eventos anteriores
        btn.addEventListener("click", handleEliminarClick); // Reasignar eventos
    });

    function handleEliminarClick(event) {
        eliminarModal.style.display = "block";
        filaEliminar = event.target.closest('tr'); // Almacena la fila que se va a eliminar
    }

    // Evento para el botón de aceptar eliminación
    document.getElementById("btn-aceptar-eliminar-asignatura").onclick = function() {
        if (filaEliminar) {
            filaEliminar.remove(); // Eliminar la fila
        }
        eliminarModal.style.display = "none"; // Cierra la ventana modal
        actualizarPaginacion(); // Actualizar paginación después de eliminar
        asignarEventosModal(); // Reasignar eventos después de eliminar
    }

    // Evento para el botón de cancelar eliminación
    document.getElementById("btn-cancelar-eliminar-asignatura").onclick = function() {
        eliminarModal.style.display = "none"; // Cierra la ventana modal
    }

    // Evento para la "X" de la ventana modal de eliminar
    const eliminarSpan = document.getElementsByClassName("eliminar-close")[0]; // Asegúrate de que este elemento exista
    eliminarSpan.onclick = function() {
        eliminarModal.style.display = "none"; // Cierra la ventana modal
    }

    // Cerrar el modal al hacer clic fuera de él
    window.onclick = function(event) {
        if (event.target == eliminarModal) {
            eliminarModal.style.display = "none";
        }
    }
}

// Llamar a la función para asignar eventos inicialmente
asignarEventosModal();