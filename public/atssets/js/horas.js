document.addEventListener('DOMContentLoaded', () => {
    const tablaHoras = document.getElementById('tabla-horas').getElementsByTagName('tbody')[0];
    const buscarDesdeInput = document.getElementById('hora-desde');
    const buscarHastaInput = document.getElementById('hora-hasta');
    const botonBuscar = document.querySelector('.btn-buscar-horas');
    const btnReajustar = document.querySelector('.btn-reajustar-horas');

    let filasOriginales = Array.from(tablaHoras.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaHoras.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const horaDesde = buscarDesdeInput.value;
        const horaHasta = buscarHastaInput.value;
        tablaHoras.innerHTML = '';

        filasOriginales.forEach(fila => {
            const desde = fila.cells[1].textContent; // Hora desde
            const hasta = fila.cells[2].textContent; // Hora hasta

            const coincideDesde = horaDesde === '' || desde >= horaDesde;
            const coincideHasta = horaHasta === '' || hasta <= horaHasta;

            if (coincideDesde && coincideHasta) {
                tablaHoras.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarDesdeInput.value = '';
        buscarHastaInput.value = '';
        tablaHoras.innerHTML = '';
        filasOriginales.forEach(fila => tablaHoras.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Paginación
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaHoras.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaHoras.rows.length; i++) {
            tablaHoras.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaHoras.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-horas').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-horas');
        const nextButton = document.querySelector('.pagina-siguiente-horas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-horas');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-horas');
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

    document.querySelector('.pagina-anterior-horas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-horas').addEventListener('click', () => {
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
    const agregarModal = document.getElementById("agregarHoraModal");
    const agregarModalForm = document.getElementById("agregar-hora-modal-form");
    const agregarSpan = document.getElementsByClassName("agregar-close")[0];
    const cancelarAgregarModal = document.getElementById("cancelar-agregar-hora-modal");
    const btnAgregar = document.getElementById("btn-agregar-hora");

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
            <td>${tablaHoras.rows.length + 1}</td>
            <td>${document.getElementById("agregar-hora-desde").value}</td>
            <td>${document.getElementById("agregar-hora-hasta").value}</td>
            <td>
                <i class="fas fa-edit accion-icono editar-icono-hora" title="Editar"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono-hora" title="Eliminar"></i>
            </td>
        `;
        tablaHoras.appendChild(nuevaFila);
        agregarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de agregar
        asignarEventosModal(); // Reasignar eventos después de agregar
    });

    // Ventana modal de eliminar
    const eliminarModal = document.getElementById("eliminarHoraModal");
    const btnEliminar = document.querySelectorAll(".eliminar-icono-hora");
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
    document.getElementById("btn-aceptar-eliminar-hora").onclick = function() {
        if (filaEliminar) {
            filaEliminar.remove(); // Eliminar la fila
        }
        eliminarModal.style.display = "none"; // Cierra la ventana modal
        actualizarPaginacion(); // Actualizar paginación después de eliminar
    }

    // Evento para el botón de cancelar eliminación
    document.getElementById("btn-cancelar-eliminar-hora").onclick = function() {
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
    const editarModal = document.getElementById("editarHoraModal");
    const editarModalForm = document.getElementById("editar-hora-modal-form");
    let filaEditar;

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("editar-icono-hora")) {
            filaEditar = event.target.closest('tr');
            document.getElementById("editar-hora-desde").value = filaEditar.cells[1].textContent;
            document.getElementById("editar-hora-hasta").value = filaEditar.cells[2].textContent;
            editarModal.style.display = "block";
        }
    });

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        filaEditar.cells[1].textContent = document.getElementById("editar-hora-desde").value;
        filaEditar.cells[2].textContent = document.getElementById("editar-hora-hasta").value;
        editarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de editar
    });

    const cancelarEditarModal = document.getElementById("cancelar-editar-hora-modal");
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