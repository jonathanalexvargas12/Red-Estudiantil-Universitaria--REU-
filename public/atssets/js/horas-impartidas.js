// Para desplegar los criterios de filtrado 

const btnFiltrar = document.querySelector('.boton-crud-horas-impartidas:first-child'); 
const filtrosBusqueda = document.querySelector('.filtros-busqueda-horas-impartidas');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

// Para desplegar los criterios de filtrado del CRUD
const btnFiltrarHoras = document.querySelector('.boton-crud-horas-impartidas');
const filtrosBusquedaHoras = document.querySelector('.filtros-busqueda-horas-impartidas');

btnFiltrarHoras.addEventListener('click', () => {
    filtrosBusquedaHoras.classList.toggle('oculto');
});

// Para buscar coincidencias con el filtro
document.addEventListener('DOMContentLoaded', () => {
    const tablaHorasImpartidas = document.getElementById('tabla-horas-impartidas').getElementsByTagName('tbody')[0];
    const buscarInputHoras = document.querySelector('.buscar-input-horas-impartidas');
    const periodoSelectHoras = document.querySelector('.periodo-select');
    const asignaturaSelectHoras = document.querySelector('.asignatura-select');
    const botonBuscarHoras = document.querySelector('.botones-filtro-horas-impartidas .boton-filtro-horas-impartidas');
    const btnReajustarHoras = document.querySelector('.botones-filtro-horas-impartidas .boton-filtro-horas-impartidas:last-child');

    let filasOriginalesHoras = Array.from(tablaHorasImpartidas.rows);

    function guardarFilasOriginalesHoras() {
        filasOriginalesHoras = Array.from(tablaHorasImpartidas.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginalesHoras();

    function filtrarTablaHoras() {
        const textoBusquedaHoras = buscarInputHoras.value.toLowerCase();
        const periodoSeleccionadoHoras = periodoSelectHoras.value.toLowerCase();
        const asignaturaSeleccionadaHoras = asignaturaSelectHoras.value.toLowerCase();

        tablaHorasImpartidas.innerHTML = '';

        filasOriginalesHoras.forEach(fila => {
            const periodo = fila.cells[1].textContent.toLowerCase();
            const asignatura = fila.cells[2].textContent.toLowerCase();
            const seccion = fila.cells[3].textContent.toLowerCase();
            const profesor = fila.cells[4].textContent.toLowerCase();
            const horas = fila.cells[5].textContent.toLowerCase();

            const coincideBusqueda = textoBusquedaHoras === '' ||
                                     periodo.includes(textoBusquedaHoras) ||
                                     asignatura.includes(textoBusquedaHoras) ||
                                     seccion.includes(textoBusquedaHoras) ||
                                     profesor.includes(textoBusquedaHoras) ||
                                     horas.includes(textoBusquedaHoras);

            const coincidePeriodo = periodoSeleccionadoHoras === '' || periodo === periodoSeleccionadoHoras;
            const coincideAsignatura = asignaturaSeleccionadaHoras === '' || asignatura === asignaturaSeleccionadaHoras;

            if (coincideBusqueda && coincidePeriodo && coincideAsignatura) {
                tablaHorasImpartidas.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacionHoras();
        asignarEventosModalHoras(); // Reasignar eventos después de filtrar
    }

    botonBuscarHoras.addEventListener('click', filtrarTablaHoras);

    btnReajustarHoras.addEventListener('click', () => {
        buscarInputHoras.value = '';
        periodoSelectHoras.selectedIndex = 0;
        asignaturaSelectHoras.selectedIndex = 0;
        tablaHorasImpartidas.innerHTML = '';
        filasOriginalesHoras.forEach(fila => tablaHorasImpartidas.appendChild(fila.cloneNode(true)));
        actualizarPaginacionHoras(); // Reiniciar la paginación después de reajustar
        asignarEventosModalHoras(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPageHoras = 5; // Número de filas por página
    let currentPageHoras = 1; // Página actual
    let totalRowsHoras = 0; // Total de filas
    let totalPagesHoras = 0; // Total de páginas

    function updateRowCountHoras() {
        totalRowsHoras = tablaHorasImpartidas.rows.length; // Total de filas
        totalPagesHoras = Math.ceil(totalRowsHoras / rowsPerPageHoras); // Total de páginas
    }

    function displayRowsHoras(page) {
        const start = (page - 1) * rowsPerPageHoras;
        const end = start + rowsPerPageHoras;

        // Ocultar todas las filas
        for (let i = 0; i < tablaHorasImpartidas.rows.length; i++) {
            tablaHorasImpartidas.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRowsHoras; i++) {
            tablaHorasImpartidas.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-horas-impartidas').textContent = `${start + 1}-${Math.min(end, totalRowsHoras)} de ${totalRowsHoras}`;
    }

    function updatePaginationButtonsHoras() {
        const prevButton = document.querySelector('.pagina-anterior-horas-impartidas');
        const nextButton = document.querySelector('.pagina-siguiente-horas-impartidas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-horas-impartidas');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPageHoras === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPageHoras === totalPagesHoras;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPagesHoras; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-horas-impartidas');
            button.textContent = i;
            button.classList.toggle('activo', i === currentPageHoras); // Marcar el botón activo

            // Agregar evento de clic para cambiar de página
            button.addEventListener('click', () => {
                currentPageHoras = i;
                displayRowsHoras(currentPageHoras);
                updatePaginationButtonsHoras();
            });

            pageButtonsContainer.appendChild(button);
        }
    }

    function actualizarPaginacionHoras() {
        updateRowCountHoras(); // Actualizar el conteo de filas
        currentPageHoras = 1; // Reiniciar a la primera página
        displayRowsHoras(currentPageHoras); // Mostrar las filas de la primera página
        updatePaginationButtonsHoras(); // Actualizar los botones de paginación
    }

    document.querySelector('.pagina-anterior-horas-impartidas').addEventListener('click', () => {
        if (currentPageHoras > 1) {
            currentPageHoras--;
            displayRowsHoras(currentPageHoras);
            updatePaginationButtonsHoras();
        }
    });

    document.querySelector('.pagina-siguiente-horas-impartidas').addEventListener('click', () => {
        if (currentPageHoras < totalPagesHoras) {
            currentPageHoras++;
            displayRowsHoras(currentPageHoras);
            updatePaginationButtonsHoras();
        }
    });

    // Inicializar la paginación
    actualizarPaginacionHoras();
});

// Función para reasignar eventos de las ventanas modales
function asignarEventosModalHoras() {
    // Ventana modal "Editar"
    const editarModalHoras = document.getElementById("editarModalHoras");
    const editarModalFormHoras = document.getElementById("editar-modal-form-horas");
    const spanEditarHoras = document.querySelector("#editarModalHoras .close");
    const cancelarEditarModalHoras = document.getElementById("cancelar-editar-modal-horas");
    let filaActualHoras;

    // Reasignar eventos de edición
    const editIconsHoras = document.querySelectorAll(".fa-edit");
    editIconsHoras.forEach(icon => {
        icon.removeEventListener("click", handleEditClickHoras); // Eliminar eventos anteriores
        icon.addEventListener("click", handleEditClickHoras); // Reasignar eventos
    });

    function handleEditClickHoras(event) {
        editarModalHoras.style.display = "block";
        filaActualHoras = event.target.closest("tr");
        populateModalHoras(filaActualHoras);
    }

    spanEditarHoras.onclick = function() {
        editarModalHoras.style.display = "none";
    }
    cancelarEditarModalHoras.onclick = function(){
        editarModalHoras.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == editarModalHoras) {
            editarModalHoras.style.display = "none";
        }
    }

    function populateModalHoras(row) {
        const cells = row.querySelectorAll("td");
        document.getElementById("editar-periodo-horas").value = cells[1].textContent;
        document.getElementById("editar-asignatura-horas").value = cells[2].textContent;
        document.getElementById("editar-seccion-horas").value = cells[3].textContent;
        document.getElementById("editar-profesor-horas").value = cells[4].textContent;
        document.getElementById("editar-horas-horas").value = cells[5].textContent;
    }

    editarModalFormHoras.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActualHoras.querySelectorAll("td");
        cells[1].textContent = document.getElementById("editar-periodo-horas").value;
        cells[2].textContent = document.getElementById("editar-asignatura-horas").value;
        cells[3].textContent = document.getElementById("editar-seccion-horas").value;
        cells[4].textContent = document.getElementById("editar-profesor-horas").value;
        cells[5].textContent = document.getElementById("editar-horas-horas").value;
        editarModalHoras.style.display = "none";
        actualizarPaginacionHoras(); // Actualizar paginación después de editar
        asignarEventosModalHoras(); // Reasignar eventos después de editar
    });

    // Ventana modal de "Eliminar"
    const eliminarModalHoras = document.getElementById("eliminarModalHoras");
    const btnEliminarHoras = document.querySelectorAll(".fa-trash");
    const spanCerrarEliminarHoras = document.querySelector("#eliminarModalHoras .eliminar-close");
    const btnAceptarEliminarHoras = document.getElementById("btn-aceptar-eliminar-horas");
    const btnCancelarEliminarHoras = document.getElementById("btn-cancelar-eliminar-horas");
    let filaEliminarHoras;

    btnEliminarHoras.forEach(btn => {
        btn.addEventListener("click", () => {
            eliminarModalHoras.style.display = "block";
            filaEliminarHoras = btn.closest('tr');
        });
    });

    spanCerrarEliminarHoras.onclick = function() {
        eliminarModalHoras.style.display = "none";
    }

    btnCancelarEliminarHoras.onclick = function() {
        eliminarModalHoras.style.display = "none";
    }

    btnAceptarEliminarHoras.onclick = function() {
        if (filaEliminarHoras) {
            filaEliminarHoras.remove(); // Eliminar la fila
        }
        eliminarModalHoras.style.display = "none";
        actualizarPaginacionHoras(); // Actualizar paginación después de eliminar
        asignarEventosModalHoras(); // Reasignar eventos después de eliminar
    }

    window.onclick = function(event) {
        if (event.target == eliminarModalHoras) {
            eliminarModalHoras.style.display = "none";
        }
    }
}

// Llamar a la función para asignar eventos inicialmente
asignarEventosModalHoras();