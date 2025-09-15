document.addEventListener('DOMContentLoaded', () => {
    const tablaPeriodos = document.getElementById('tabla-periodos').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-periodos');
    const estatusSelect = document.querySelector('.filtro-estatus-periodos');
    const botonBuscar = document.querySelector('.btn-buscar-periodos');
    const btnReajustar = document.querySelector('.btn-reajustar-periodos');

    let filasOriginales = Array.from(tablaPeriodos.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaPeriodos.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estatusSeleccionado = estatusSelect.value.toLowerCase();

        tablaPeriodos.innerHTML = '';

        filasOriginales.forEach(fila => {
            const nombrePeriodo = fila.cells[1].textContent.toLowerCase();
            const limiteUC = fila.cells[2].textContent.toLowerCase();
            const fechaInicio = fila.cells[3].textContent.toLowerCase();
            const fechaFin = fila.cells[4].textContent.toLowerCase();
            const estatus = fila.cells[5].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' ||
                                     nombrePeriodo.includes(textoBusqueda) ||
                                     limiteUC.includes(textoBusqueda) ||
                                     fechaInicio.includes(textoBusqueda) ||
                                     fechaFin.includes(textoBusqueda);
            const coincideEstatus = estatusSeleccionado === '' || estatus.includes(estatusSeleccionado);

            if (coincideBusqueda && coincideEstatus) {
                tablaPeriodos.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estatusSelect.selectedIndex = 0;
        tablaPeriodos.innerHTML = '';
        filasOriginales.forEach(fila => tablaPeriodos.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaPeriodos.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaPeriodos.rows.length; i++) {
            tablaPeriodos.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaPeriodos.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-periodos').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-periodos');
        const nextButton = document.querySelector('.pagina-siguiente-periodos');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-periodos');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-periodos');
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

    document.querySelector('.pagina-anterior-periodos').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-periodos').addEventListener('click', () => {
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
    const agregarModal = document.getElementById("agregarPeriodoModal");
    const agregarModalForm = document.getElementById("agregar-periodo-modal-form");
    const agregarSpan = document.getElementsByClassName("agregar-close")[0];
    const cancelarAgregarModal = document.getElementById("cancelar-agregar-periodo-modal");
    const btnAgregar = document.getElementById("btn-agregar-periodo");

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
            <td>${tablaPeriodos.rows.length + 1}</td>
            <td>${document.getElementById("agregar-nombre-periodo").value}</td>
            <td>${document.getElementById("agregar-limite-uc").value}</td>
            <td>${document.getElementById("agregar-fecha-inicio").value}</td>
            <td>${document.getElementById("agregar-fecha-fin").value}</td>
            <td class="estatus-periodo ${document.getElementById("agregar-estatus").value}"><span class="circulo-estatus"></span>${document.getElementById("agregar-estatus").value.charAt(0).toUpperCase() + document.getElementById("agregar-estatus").value.slice(1)}</td>
            <td>
                <i class="fas fa-edit accion-icono editar-icono-periodo" title="Editar"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono-periodo" title="Eliminar"></i>
            </td>
        `;
        tablaPeriodos.appendChild(nuevaFila);
        agregarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de agregar
        asignarEventosModal(); // Reasignar eventos después de agregar
    });

    // Ventana modal "Editar"
    const editarModal = document.getElementById("editarPeriodoModal");
    const editarModalForm = document.getElementById("editar-periodo-modal-form");
    const span = editarModal.querySelector(".close"); // Selector más específico
    const cancelarEditarModal = document.getElementById("cancelar-editar-periodo-modal");
    let filaActual;

    // Reasignar eventos de edición
    const editIcons = document.querySelectorAll(".editar-icono-periodo");
    editIcons.forEach(icon => {
        icon.removeEventListener("click", handleEditClick); // Eliminar eventos anteriores
        icon.addEventListener("click", handleEditClick); // Reasignar eventos
    });

    function handleEditClick(event) {
        editarModal.style.display = "block";
        filaActual = event.target.closest("tr");
        populateModal(filaActual);
    }

    span.onclick = function () {
        editarModal.style.display = "none";
    }
    cancelarEditarModal.onclick = function () {
        editarModal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == editarModal) {
            editarModal.style.display = "none";
        }
    }

    function populateModal(row) {
        const cells = row.querySelectorAll("td");
        document.getElementById("editar-nombre-periodo").value = cells[1].textContent;
        document.getElementById("editar-limite-uc").value = cells[2].textContent;
        document.getElementById("editar-fecha-inicio").value = cells[3].textContent;
        document.getElementById("editar-fecha-fin").value = cells[4].textContent;
        const estatusActual = cells[5].textContent.trim().toLowerCase(); // Obtener estatus actual y limpiar espacios
        document.getElementById("editar-estatus").value = estatusActual;
    }

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActual.querySelectorAll("td");
        cells[1].textContent = document.getElementById("editar-nombre-periodo").value;
        cells[2].textContent = document.getElementById("editar-limite-uc").value;
        cells[3].textContent = document.getElementById("editar-fecha-inicio").value;
        cells[4].textContent = document.getElementById("editar-fecha-fin").value;
        const nuevoEstatus = document.getElementById("editar-estatus").value;

        // Actualizar la clase del estatus
        cells[5].className = `estatus-periodo ${nuevoEstatus}`; // Actualizar la clase
        cells[5].innerHTML = `<span class="circulo-estatus"></span>${nuevoEstatus.charAt(0).toUpperCase() + nuevoEstatus.slice(1)}`; // Actualizar el texto

        editarModal.style.display = "none";
        actualizarPaginacion();
        asignarEventosModal();
    });

    // Ventana modal de eliminar
    const eliminarModal = document.getElementById("eliminarPeriodoModal");
    const btnEliminar = document.querySelectorAll(".eliminar-icono-periodo");
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
    document.getElementById("btn-aceptar-eliminar-periodo").onclick = function() {
        if (filaEliminar) {
            filaEliminar.remove(); // Eliminar la fila
        }
        eliminarModal.style.display = "none"; // Cierra la ventana modal
        actualizarPaginacion(); // Actualizar paginación después de eliminar
        asignarEventosModal(); // Reasignar eventos después de eliminar
    }

    // Evento para el botón de cancelar eliminación
    document.getElementById("btn-cancelar-eliminar-periodo").onclick = function() {
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