document.addEventListener('DOMContentLoaded', () => {
    const tablaSecciones = document.getElementById('tabla-secciones').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-secciones');
    const botonBuscar = document.querySelector('.btn-buscar-secciones');
    const btnReajustar = document.querySelector('.btn-reajustar-secciones');

    let filasOriginales = Array.from(tablaSecciones.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaSecciones.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estatusSeleccionado = document.querySelector('.filtro-estatus-periodos').value;
        tablaPeriodos.innerHTML = ''; // Limpiar la tabla
    
        filasOriginales.forEach(fila => {
            const nombrePeriodo = fila.cells[1].textContent.toLowerCase();
            
            // Obtener el texto del estatus, ignorando los elementos HTML dentro de la celda (por ejemplo, <span>)
            const estatusPeriodo = fila.cells[5].textContent.trim().toLowerCase();
    
            // Filtrar por nombre (búsqueda) y estatus
            const coincideBusqueda = textoBusqueda === '' || nombrePeriodo.includes(textoBusqueda);
            const coincideEstatus = estatusSeleccionado === '' || estatusPeriodo.includes(estatusSeleccionado.toLowerCase());
    
            if (coincideBusqueda && coincideEstatus) {
                tablaPeriodos.appendChild(fila.cloneNode(true));
            }
        });
    
        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }
    

    // Paginación
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaSecciones.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaSecciones.rows.length; i++) {
            tablaSecciones.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaSecciones.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-secciones').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-secciones');
        const nextButton = document.querySelector('.pagina-siguiente-secciones');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-secciones');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-secciones');
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

    document.querySelector('.pagina-anterior-secciones').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-secciones').addEventListener('click', () => {
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
    const agregarModal = document.getElementById("agregarSeccionModal");
    const agregarModalForm = document.getElementById("agregar-seccion-modal-form");
    const agregarSpan = document.getElementsByClassName("agregar-close")[0];
    const cancelarAgregarModal = document.getElementById("cancelar-agregar-seccion-modal");
    const btnAgregar = document.getElementById("btn-agregar-seccion");

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
            <td>${document.getElementById("agregar-nombre-seccion").value}</td>
            <td>
                <i class="fas fa-edit accion-icono editar-icono-seccion" title="Editar"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono-seccion" title="Eliminar"></i>
            </td>
        `;
        tablaSecciones.appendChild(nuevaFila);
        agregarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de agregar
        asignarEventosModal(); // Reasignar eventos después de agregar
    });

    // Ventana modal de eliminar
    const eliminarModal = document.getElementById("eliminarSeccionModal");
    const btnEliminar = document.querySelectorAll(".eliminar-icono-seccion");
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
    document.getElementById("btn-aceptar-eliminar-seccion").onclick = function() {
        if (filaEliminar) {
            filaEliminar.remove(); // Eliminar la fila
        }
        eliminarModal.style.display = "none"; // Cierra la ventana modal
        actualizarPaginacion(); // Actualizar paginación después de eliminar
    }

    // Evento para el botón de cancelar eliminación
    document.getElementById("btn-cancelar-eliminar-seccion").onclick = function() {
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

    // Ventana modal de editar
    const editarModal = document.getElementById("editarSeccionModal");
    const editarModalForm = document.getElementById("editar-seccion-modal-form");
    let filaEditar;

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("editar-icono-seccion")) {
            filaEditar = event.target.closest('tr');
            document.getElementById("editar-nombre-seccion").value = filaEditar.cells[0].textContent;
            editarModal.style.display = "block";
        }
    });

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        filaEditar.cells[0].textContent = document.getElementById("editar-nombre-seccion").value;
        editarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de editar
    });

    const cancelarEditarModal = document.getElementById("cancelar-editar-seccion-modal");
    cancelarEditarModal.onclick = function() {
        editarModal.style.display = "none"; // Cierra la ventana modal
    }

    const editarSpan = document.getElementsByClassName("close")[0]; // Asegúrate de que este elemento exista
    editarSpan.onclick = function() {
        editarModal.style.display = "none"; // Cierra la ventana modal
    }

    // Cerrar el modal al hacer clic fuera de él
    window.onclick = function(event) {
        if (event.target == editarModal) {
            editarModal.style.display = "none";
        }
    }
}

// Llamar a la función para asignar eventos inicialmente
asignarEventosModal();