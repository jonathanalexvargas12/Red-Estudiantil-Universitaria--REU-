document.addEventListener('DOMContentLoaded', () => {
    const tablaAulas = document.getElementById('tabla-aulas').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-aulas');
    const botonBuscar = document.querySelector('.btn-buscar-aulas');
    const btnReajustar = document.querySelector('.btn-reajustar-aulas');

    let filasOriginales = Array.from(tablaAulas.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaAulas.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        tablaAulas.innerHTML = '';

        filasOriginales.forEach(fila => {
            const nombreAula = fila.cells[0].textContent.toLowerCase();
            const capacidadAula = fila.cells[1].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                                    nombreAula.includes(textoBusqueda) || 
                                    capacidadAula.includes(textoBusqueda);

            if (coincideBusqueda) {
                tablaAulas.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        tablaAulas.innerHTML = '';
        filasOriginales.forEach(fila => tablaAulas.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
 });

    // Paginación
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaAulas.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaAulas.rows.length; i++) {
            tablaAulas.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaAulas.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-aulas').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-aulas');
        const nextButton = document.querySelector('.pagina-siguiente-aulas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-aulas');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-aulas');
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

    document.querySelector('.pagina-anterior-aulas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-aulas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicializar la paginación
    actualizarPaginacion();

    // Asignar eventos a los modales
    asignarEventosModal();
});

function asignarEventosModal() {
    const agregarModal = document.getElementById("agregarAulaModal");
    const agregarModalForm = document.getElementById("agregar-aula-modal-form");
    const agregarSpan = document.getElementsByClassName("agregar-close")[0];
    const cancelarAgregarModal = document.getElementById("cancelar-agregar-aula-modal");
    const btnAgregar = document.getElementById("btn-agregar-aula");

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
            <td>${document.getElementById("agregar-nombre-aula").value}</td>
            <td>${document.getElementById("agregar-capacidad-aula").value}</td>
            <td>
                <i class="fas fa-edit accion-icono editar-icono-aula" title="Editar"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono-aula" title="Eliminar"></i>
            </td>
        `;
        tablaAulas.appendChild(nuevaFila);
        agregarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de agregar
        asignarEventosModal(); // Reasignar eventos después de agregar
    });

    // Ventana modal de eliminar
    const eliminarModal = document.getElementById("eliminarAulaModal");
    let filaEliminar;

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("eliminar-icono-aula")) {
            eliminarModal.style.display = "block";
            filaEliminar = event.target.closest('tr'); // Almacena la fila que se va a eliminar
        }
    });

    // Evento para el botón de aceptar eliminación
    document.getElementById("btn-aceptar-eliminar-aula").onclick = function() {
        if (filaEliminar) {
            filaEliminar.remove(); // Eliminar la fila
        }
        eliminarModal.style.display = "none"; // Cierra la ventana modal
        actualizarPaginacion(); // Actualizar paginación después de eliminar
    }

    // Evento para el botón de cancelar eliminación
    document.getElementById("btn-cancelar-eliminar-aula").onclick = function() {
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
    const editarModal = document.getElementById("editarAulaModal");
    const editarModalForm = document.getElementById("editar-aula-modal-form");
    let filaEditar;

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("editar-icono-aula")) {
            filaEditar = event.target.closest('tr');
            document.getElementById("editar-nombre-aula").value = filaEditar.cells[0].textContent;
            document.getElementById("editar-capacidad-aula").value = filaEditar.cells[1].textContent;
            editarModal.style.display = "block";
        }
    });

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        filaEditar.cells[0].textContent = document.getElementById("editar-nombre-aula").value;
        filaEditar.cells[1].textContent = document.getElementById("editar-capacidad-aula").value;
        editarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de editar
    });

    const cancelarEditarModal = document.getElementById("cancelar-editar-aula-modal");
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