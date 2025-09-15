// Para desplegar los criterios de filtrado 

const btnFiltrar = document.querySelector('.boton-crud-estudiantes:first-child'); 
const filtrosBusqueda = document.querySelector('.filtros-busqueda-estudiantes');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});


// Para buscar coincidencias con el filtro
document.addEventListener('DOMContentLoaded', () => {
    const tablaEstudiantes = document.getElementById('tabla-estudiantes').getElementsByTagName('tbody')[0];
    const buscarInputEstudiantes = document.querySelector('.buscar-input-estudiantes');
    const estadoSelectEstudiantes = document.querySelector('.estado-select');
    const botonBuscarEstudiantes = document.querySelector('.botones-filtro-estudiantes .boton-filtro-estudiantes:first-child');
    const btnReajustarEstudiantes = document.querySelector('.botones-filtro-estudiantes .boton-filtro-estudiantes:last-child');

    let filasOriginalesEstudiantes = Array.from(tablaEstudiantes.rows);

    function guardarFilasOriginalesEstudiantes() {
        filasOriginalesEstudiantes = Array.from(tablaEstudiantes.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginalesEstudiantes();

    function filtrarTablaEstudiantes() {
        const textoBusquedaEstudiantes = buscarInputEstudiantes.value.toLowerCase();
        const estadoSeleccionadoEstudiantes = estadoSelectEstudiantes.value.toLowerCase();

        tablaEstudiantes.innerHTML = '';

        filasOriginalesEstudiantes.forEach(fila => {
            const cedula = fila.cells[0].textContent.toLowerCase();
            const apellidos = fila.cells[1].textContent.toLowerCase();
            const nombres = fila.cells[2].textContent.toLowerCase();
            const codigo = fila.cells[3].textContent.toLowerCase();
            const pensum = fila.cells[4].querySelector('i').classList.contains('pensum-asignado') ? 'asignado' : 'pendiente';
            const estado = fila.cells[5].querySelector('i').classList.contains('estado-regular') ? 'regular' : 'nuevo-ingreso';

            const coincideBusqueda = textoBusquedaEstudiantes === '' ||
                                     cedula.includes(textoBusquedaEstudiantes) ||
                                     apellidos.includes(textoBusquedaEstudiantes) ||
                                     nombres.includes(textoBusquedaEstudiantes) ||
                                     codigo.includes(textoBusquedaEstudiantes);

            const coincideEstado = estadoSeleccionadoEstudiantes === '' || estado === estadoSeleccionadoEstudiantes;

            if (coincideBusqueda && coincideEstado) {
                tablaEstudiantes.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacionEstudiantes();
        asignarEventosModalEstudiantes(); // Reasignar eventos después de filtrar
    }

    botonBuscarEstudiantes.addEventListener('click', filtrarTablaEstudiantes);

    btnReajustarEstudiantes.addEventListener('click', () => {
        buscarInputEstudiantes.value = '';
        estadoSelectEstudiantes.selectedIndex = 0;
        tablaEstudiantes.innerHTML = '';
        filasOriginalesEstudiantes.forEach(fila => tablaEstudiantes.appendChild(fila.cloneNode(true)));
        actualizarPaginacionEstudiantes(); // Reiniciar la paginación después de reajustar
        asignarEventosModalEstudiantes(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPageEstudiantes = 5; // Número de filas por página
    let currentPageEstudiantes = 1; // Página actual
    let totalRowsEstudiantes = 0; // Total de filas
    let totalPagesEstudiantes = 0; // Total de páginas

    function updateRowCountEstudiantes() {
        totalRowsEstudiantes = tablaEstudiantes.rows.length; // Total de filas
        totalPagesEstudiantes = Math.ceil(totalRowsEstudiantes / rowsPerPageEstudiantes); // Total de páginas
    }

    function displayRowsEstudiantes(page) {
        const start = (page - 1) * rowsPerPageEstudiantes;
        const end = start + rowsPerPageEstudiantes;

        // Ocultar todas las filas
        for (let i = 0; i < tablaEstudiantes.rows.length; i++) {
            tablaEstudiantes.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRowsEstudiantes; i++) {
            tablaEstudiantes.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-estudiantes').textContent = `${start + 1}-${Math.min(end, totalRowsEstudiantes)} de ${totalRowsEstudiantes}`;
    }

    function updatePaginationButtonsEstudiantes() {
        const prevButton = document.querySelector('.pagina-anterior-estudiantes');
        const nextButton = document.querySelector('.pagina-siguiente-estudiantes');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-estudiantes');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPageEstudiantes === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPageEstudiantes === totalPagesEstudiantes;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPagesEstudiantes; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-estudiantes');
            button.textContent = i;
            button.classList.toggle('activo', i === currentPageEstudiantes); // Marcar el botón activo

            // Agregar evento de clic para cambiar de página
            button.addEventListener('click', () => {
                currentPageEstudiantes = i;
                displayRowsEstudiantes(currentPageEstudiantes);
                updatePaginationButtonsEstudiantes();
            });

            pageButtonsContainer.appendChild(button);
        }
    }

    function actualizarPaginacionEstudiantes() {
        updateRowCountEstudiantes(); // Actualizar el conteo de filas
        currentPageEstudiantes = 1; // Reiniciar a la primera página
        displayRowsEstudiantes(currentPageEstudiantes); // Mostrar las filas de la primera página
        updatePaginationButtonsEstudiantes(); // Actualizar los botones de paginación
    }

    document.querySelector('.pagina-anterior-estudiantes').addEventListener('click', () => {
        if (currentPageEstudiantes > 1) {
            currentPageEstudiantes--;
            displayRowsEstudiantes(currentPageEstudiantes);
            updatePaginationButtonsEstudiantes();
        }
    });

    document.querySelector('.pagina-siguiente-estudiantes').addEventListener('click', () => {
        if (currentPageEstudiantes < totalPagesEstudiantes) {
            currentPageEstudiantes++;
            displayRowsEstudiantes(currentPageEstudiantes);
            updatePaginationButtonsEstudiantes();
        }
    });

    // Inicializar la paginación
    actualizarPaginacionEstudiantes();
});

// Función para reasignar eventos de las ventanas modales
function asignarEventosModalEstudiantes() {
    // Ventana modal "Editar"
    const editarModalEstudiantes = document.getElementById("editarModalEstudiantes");
    const editarModalFormEstudiantes = document.getElementById("editar-modal-form-estudiantes");
    const spanEditarEstudiantes = document.querySelector("#editarModalEstudiantes .close");
    const cancelarEditarModalEstudiantes = document.getElementById("cancelar-editar-modal-estudiantes");
    let filaActualEstudiantes;

    // Reasignar eventos de edición
    const editIconsEstudiantes = document.querySelectorAll(".fa-edit");
    editIconsEstudiantes.forEach(icon => {
        icon.removeEventListener("click", handleEditClickEstudiantes); // Eliminar eventos anteriores
        icon.addEventListener("click", handleEditClickEstudiantes); // Reasignar eventos
    });

    function handleEditClickEstudiantes(event) {
        editarModalEstudiantes.style.display = "block";
        filaActualEstudiantes = event.target.closest("tr");
        populateModalEstudiantes(filaActualEstudiantes);
    }

    spanEditarEstudiantes.onclick = function() {
        editarModalEstudiantes.style.display = "none";
    }
    cancelarEditarModalEstudiantes.onclick = function(){
        editarModalEstudiantes.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == editarModalEstudiantes) {
            editarModalEstudiantes.style.display = "none";
        }
    }

    function populateModalEstudiantes(row) {
        const cells = row.querySelectorAll("td");
        document.getElementById("editar-cedula-estudiante").value = cells[0].textContent;
        document.getElementById("editar-apellidos-estudiante").value = cells[1].textContent;
        document.getElementById("editar-nombres-estudiante").value = cells[2].textContent;
        document.getElementById("editar-codigo-estudiante").value = cells[3].textContent;
        document.getElementById("editar-pensum-estudiante").value = cells[4].querySelector('i').classList.contains('pensum-asignado') ? 'asignado' : 'pendiente';
        document.getElementById("editar-estado-estudiante").value = cells[5].querySelector('i').classList.contains('estado-regular') ? 'regular' : 'nuevo-ingreso';
    }

    editarModalFormEstudiantes.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActualEstudiantes.querySelectorAll("td");
        cells[0].textContent = document.getElementById("editar-cedula-estudiante").value;
        cells[1].textContent = document.getElementById("editar-apellidos-estudiante").value;
        cells[2].textContent = document.getElementById("editar-nombres-estudiante").value;
        cells[3].textContent = document.getElementById("editar-codigo-estudiante").value;
        const pensumValue = document.getElementById("editar-pensum-estudiante").value;
        cells[4].innerHTML = `<i class="fas fa-circle pensum-${pensumValue}" title="Pensum ${pensumValue.charAt(0).toUpperCase() + pensumValue.slice(1)}"></i>`;
        const estadoValue = document.getElementById("editar-estado-estudiante").value;
        cells[5].innerHTML = `<i class="fas fa-circle estado-${estadoValue}" title="${estadoValue.charAt(0).toUpperCase() + estadoValue.slice(1)}"></i>`;
        editarModalEstudiantes.style.display = "none";
        actualizarPaginacionEstudiantes(); // Actualizar paginación después de editar
        asignarEventosModalEstudiantes(); // Reasignar eventos después de editar
    });

    // Ventana modal de "Eliminar"
    const eliminarModalEstudiantes = document.getElementById("eliminarModalEstudiantes");
    const btnEliminarEstudiantes = document.querySelectorAll(".fa-trash");
    const spanCerrarEliminarEstudiantes = document.querySelector("#eliminarModalEstudiantes .eliminar-close");
    const btnAceptarEliminarEstudiantes = document.getElementById("btn-aceptar-eliminar-estudiantes");
    const btnCancelarEliminarEstudiantes = document.getElementById("btn-cancelar-eliminar-estudiantes");
    let filaEliminarEstudiantes;

    btnEliminarEstudiantes.forEach(btn => {
        btn.addEventListener("click", () => {
            eliminarModalEstudiantes.style.display = "block";
            filaEliminarEstudiantes = btn.closest('tr');
        });
    });

    spanCerrarEliminarEstudiantes.onclick = function() {
        eliminarModalEstudiantes.style.display = "none";
    }

    btnCancelarEliminarEstudiantes.onclick = function() {
        eliminarModalEstudiantes.style.display = "none";
    }

    btnAceptarEliminarEstudiantes.onclick = function() {
        if (filaEliminarEstudiantes) {
            filaEliminarEstudiantes.remove(); // Eliminar la fila
        }
        eliminarModalEstudiantes.style.display = "none";
        actualizarPaginacionEstudiantes(); // Actualizar paginación después de eliminar
        asignarEventosModalEstudiantes(); // Reasignar eventos después de eliminar
    }

    window.onclick = function(event) {
        if (event.target == eliminarModalEstudiantes) {
            eliminarModalEstudiantes.style.display = "none";
        }
    }
}

// Llamar a la función para asignar eventos inicialmente
asignarEventosModalEstudiantes();