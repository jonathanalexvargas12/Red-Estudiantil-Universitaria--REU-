document.addEventListener('DOMContentLoaded', () => {
    const tablaSolicitudes = document.getElementById('tabla-solicitudes').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-solicitudes');
    const estatusSelect = document.querySelector('.estatus-select-solicitudes');
    const botonBuscar = document.querySelector('.btn-buscar-solicitudes');
    const btnReajustar = document.querySelector('.btn-reajustar-solicitudes');

    let filasOriginales = Array.from(tablaSolicitudes.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaSolicitudes.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estatusSeleccionado = estatusSelect.value.toLowerCase();
    
        tablaSolicitudes.innerHTML = ''; // Limpiar la tabla
    
        filasOriginales.forEach(fila => {
            const fechaSolicitud = fila.cells[1].textContent.toLowerCase();
            const tutorSolicitado = fila.cells[2].textContent.toLowerCase();
            const solicitadoPor = fila.cells[3].textContent.toLowerCase();
            const estatusCelda = fila.cells[4].querySelector('.estatus-circulo'); // Obtener el span del estatus
    
            // Verificar si coincide con la búsqueda
            const coincideBusqueda = textoBusqueda === '' ||
                                     fechaSolicitud.includes(textoBusqueda) ||
                                     tutorSolicitado.includes(textoBusqueda) ||
                                     solicitadoPor.includes(textoBusqueda);
    
            // Verificar si coincide con el estado seleccionado
            const coincideEstatus = estatusSeleccionado === '' || 
                                    (estatusCelda && estatusCelda.classList.contains(estatusSeleccionado));
    
            // Si coincide con ambos criterios, agregar la fila a la tabla
            if (coincideBusqueda && coincideEstatus) {
                tablaSolicitudes.appendChild(fila.cloneNode(true));
            }
        });
    
        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estatusSelect.selectedIndex = 0;
        tablaSolicitudes.innerHTML = '';
        filasOriginales.forEach(fila => tablaSolicitudes.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaSolicitudes.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaSolicitudes.rows.length; i++) {
            tablaSolicitudes.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaSolicitudes.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-tutoria').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-tutoria');
        const nextButton = document.querySelector('.pagina-siguiente-tutoria');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-tutoria');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-tutoria');
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

    document.querySelector('.pagina-anterior-tutoria').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-tutoria').addEventListener('click', () => {
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
    const agregarModal = document.getElementById("agregarModal");
    const agregarModalForm = document.getElementById("agregar-modal-form");
    const agregarSpan = document.getElementsByClassName("agregar-close")[0];
    const cancelarAgregarModal = document.getElementById("cancelar-agregar-modal");
    const btnAgregar = document.getElementById("btn-agregar-solicitud");

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
            <td>${tablaSolicitudes.rows.length + 1}</td>
            <td>${document.getElementById("agregar-fecha-solicitud").value}</td>
            <td>${document.getElementById("agregar-tutor-solicitado").value}</td>
            <td>${document.getElementById("agregar-solicitado-por").value}</td>
            <td><span class="estatus-circulo ${document.getElementById("agregar-estatus").value}"></span> ${document.getElementById("agregar-estatus").options[document.getElementById("agregar-estatus").selectedIndex].text}</td>
            <td>
                <i class="fas fa-edit accion-icono editar-icono" title="Editar"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono" title="Eliminar"></i>
            </td>
        `;
        tablaSolicitudes.appendChild(nuevaFila);
        agregarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de agregar
        asignarEventosModal(); // Reasignar eventos después de agregar
    });

    // Ventana modal "Editar"
    const editarModal = document.getElementById("editarModal");
    const editarModalForm = document.getElementById("editar-modal-form");
    const span = document.getElementsByClassName("close")[0];
    const cancelarEditarModal = document.getElementById("cancelar-editar-modal");
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
        document.getElementById("editar-fecha-solicitud").value = cells[1].textContent;
        document.getElementById("editar-tutor-solicitado").value = cells[2].textContent;
        document.getElementById("editar-solicitado-por").value = cells[3].textContent;

        // Establecer el estado en el select
        const estatus = cells[4].classList[1]; // Obtener la clase del estado
        document.getElementById("editar-estatus").value = estatus; // Establecer el valor del select
    }

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActual.querySelectorAll("td");
        cells[1].textContent = document.getElementById("editar-fecha-solicitud").value;
        cells[2].textContent = document.getElementById("editar-tutor-solicitado").value;
        cells[3].textContent = document.getElementById("editar-solicitado-por").value;
        const estatus = document.getElementById("editar-estatus").value;
        cells[4].innerHTML = `<span class="estatus-circulo ${estatus}"></span> ${document.getElementById("editar-estatus").options[document.getElementById("editar-estatus").selectedIndex].text}`;
        editarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de editar
        asignarEventosModal(); // Reasignar eventos después de editar
    });

    // Ventana modal de eliminar
    const eliminarModal = document.getElementById("eliminarModal");
    const btnEliminar = document.querySelectorAll(".eliminar-icono");
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
    document.getElementById("btn-aceptar-eliminar").onclick = function() {
        if (filaEliminar) {
            filaEliminar.remove(); // Eliminar la fila
        }
        eliminarModal.style.display = "none"; // Cierra la ventana modal
        actualizarPaginacion(); // Actualizar paginación después de eliminar
        asignarEventosModal(); // Reasignar eventos después de eliminar
    }

    // Evento para el botón de cancelar eliminación
    document.getElementById("btn-cancelar-eliminar").onclick = function() {
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