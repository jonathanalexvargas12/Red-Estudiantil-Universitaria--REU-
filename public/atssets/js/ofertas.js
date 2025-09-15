// Para que se desplieguen los filtros de busqueda

const btnFiltrarOfertas = document.getElementById('btn-filtrar-ofertas');
const filtrosBusquedaOfertas = document.getElementById('filtros-busqueda-ofertas');

btnFiltrarOfertas.addEventListener('click', () => {
    filtrosBusquedaOfertas.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    const tablaOfertas = document.getElementById('tabla-ofertas').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-ofertas');
    const estadoSelect = document.querySelector('.select-estado-ofertas');
    const periodoSelect = document.querySelector('.select-periodo-ofertas');
    const carreraSelect = document.querySelector('.select-carrera-ofertas');
    const botonBuscar = document.querySelector('.btn-buscar-ofertas');
    const btnReajustar = document.querySelector('.btn-reajustar-ofertas');

    let filasOriginales = Array.from(tablaOfertas.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaOfertas.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
    const textoBusqueda = buscarInput.value.toLowerCase();
    const estadoSeleccionado = estadoSelect.value.toLowerCase();
    const periodoSeleccionado = periodoSelect.value.toLowerCase();
    const carreraSeleccionada = carreraSelect.value.toLowerCase();

    tablaOfertas.innerHTML = '';

    filasOriginales.forEach(fila => {
        const carrera = fila.cells[0].textContent.toLowerCase();
        const pensum = fila.cells[1].textContent.toLowerCase();
        const periodo = fila.cells[2].textContent.toLowerCase();
        const nivel = fila.cells[3].textContent.toLowerCase();
        const asignatura = fila.cells[4].textContent.toLowerCase();
        const seccion = fila.cells[5].textContent.toLowerCase();
        const profesor = fila.cells[6].textContent.toLowerCase();
        const alumnos = fila.cells[7].textContent.toLowerCase();
        const clases = fila.cells[8].textContent.toLowerCase();
        const estado = fila.cells[9]; 

        const coincideBusqueda = textoBusqueda === '' ||
                                 carrera.includes(textoBusqueda) ||
                                 pensum.includes(textoBusqueda) ||
                                 periodo.includes(textoBusqueda) ||
                                 nivel.includes(textoBusqueda) ||
                                 asignatura.includes(textoBusqueda) ||
                                 seccion.includes(textoBusqueda) ||
                                 profesor.includes(textoBusqueda) ||
                                 alumnos.includes(textoBusqueda) ||
                                 clases.includes(textoBusqueda);

        const coincideEstado = estadoSeleccionado === '' || estado.classList.contains(estadoSeleccionado); // Cambiar a classList.contains
        const coincidePeriodo = periodoSeleccionado === '' || periodo.includes(periodoSeleccionado);
        const coincideCarrera = carreraSeleccionada === '' || carrera.includes(carreraSeleccionada);

        if (coincideBusqueda && coincideEstado && coincidePeriodo && coincideCarrera) {
            tablaOfertas.appendChild(fila.cloneNode(true));
        }
    });

    actualizarPaginacion();
    asignarEventosModal(); // Reasignar eventos después de filtrar
}

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estadoSelect.selectedIndex = 0;
        periodoSelect.selectedIndex = 0;
        carreraSelect.selectedIndex = 0;
        tablaOfertas.innerHTML = '';
        filasOriginales.forEach(fila => tablaOfertas.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaOfertas.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaOfertas.rows.length; i++) {
            tablaOfertas.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaOfertas.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-ofertas').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-ofertas');
        const nextButton = document.querySelector('.pagina-siguiente-ofertas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-ofertas');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-ofertas');
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

    document.querySelector('.pagina-anterior-ofertas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-ofertas').addEventListener('click', () => {
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
    const agregarModal = document.getElementById("agregarOfertaModal");
    const agregarModalForm = document.getElementById("agregar-oferta-modal-form");
    const agregarSpan = document.getElementsByClassName("agregar-close")[0];
    const cancelarAgregarModal = document.getElementById("cancelar-agregar-oferta-modal");
    const btnAgregar = document.getElementById("btn-agregar-oferta");

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
            <td>${document.getElementById("agregar-carrera").value}</td>
            <td>${document.getElementById("agregar-pensum").value}</td>
            <td>${document.getElementById("agregar-periodo").value}</td>
            <td>${document.getElementById("agregar-nivel").value}</td>
            <td>${document.getElementById("agregar-asignatura").value}</td>
            <td>${document.getElementById("agregar-seccion").value}</td>
            <td>${document.getElementById("agregar-profesor").value}</td>
            <td>${document.getElementById("agregar-alumnos").value}</td>
            <td><i class="fa-solid fa-chalkboard"></i>(${document.getElementById("agregar-clases").value})</td>
            <td class="estatus-oferta ${document.getElementById("agregar-estado").value}"><span class="circulo-estatus"></span>${document.getElementById("agregar-estado").value === 'correcta' ? 'Cargada Correctamente' : 'Cargada Incorrectamente'}</td>
            <td>
                <i class="fas fa-edit accion-icono editar-icono-oferta" title="Editar"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono-oferta" title="Eliminar"></i>
            </td>
        `;
        tablaOfertas.appendChild(nuevaFila);
        agregarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de agregar
        asignarEventosModal(); // Reasignar eventos después de agregar
    });

    // Ventana modal "Editar"
    const editarModal = document.getElementById("editarOfertaModal");
    const editarModalForm = document.getElementById("editar-oferta-modal-form");
    const span = document.getElementsByClassName("close")[0];
    const cancelarEditarModal = document.getElementById("cancelar-editar-oferta-modal");
    let filaActual;

    // Reasignar eventos de edición
    const editIcons = document.querySelectorAll(".editar-icono-oferta");
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
        document.getElementById("editar-carrera").value = cells[0].textContent;
        document.getElementById("editar-pensum").value = cells[1].textContent;
        document.getElementById("editar-periodo").value = cells[2].textContent;
        document.getElementById("editar-nivel").value = cells[3].textContent;
        document.getElementById("editar-asignatura").value = cells[4].textContent;
        document.getElementById("editar-seccion").value = cells[5].textContent;
        document.getElementById("editar-profesor").value = cells[6].textContent;
        document.getElementById("editar-alumnos").value = cells[7].textContent;
        document.getElementById("editar-clases").value = cells[8].textContent.match(/\d+/)[0];
        document.getElementById("editar-estado").value = cells[9].classList.contains('correcta') ? 'correcta' : 'incorrecta';
    }

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActual.querySelectorAll("td");
        cells[0].textContent = document.getElementById("editar-carrera").value;
        cells[1].textContent = document.getElementById("editar-pensum").value;
        cells[2].textContent = document.getElementById("editar-periodo").value;
        cells[3].textContent = document.getElementById("editar-nivel").value;
        cells[4].textContent = document.getElementById("editar-asignatura").value;
        cells[5].textContent = document.getElementById("editar-seccion").value;
        cells[6].textContent = document.getElementById("editar-profesor").value;
        cells[7].textContent = document.getElementById("editar-alumnos").value;
        cells[8].innerHTML = `<i class="fa-solid fa-chalkboard"></i>(${document.getElementById("editar-clases").value})`;
        const estado = document.getElementById("editar-estado").value;
        cells[9].innerHTML = `<span class="circulo-estatus"></span>${estado === 'correcta' ? 'Cargada Correctamente' : 'Cargada Incorrectamente'}`;
        cells[9].className = `estatus-oferta ${estado}`;
        editarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de editar
        asignarEventosModal(); // Reasignar eventos después de editar
    });

    // Ventana modal de eliminar
    const eliminarModal = document.getElementById("eliminarOfertaModal");
    const btnEliminar = document.querySelectorAll(".eliminar-icono-oferta");
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
    document.getElementById("btn-aceptar-eliminar-oferta").onclick = function() {
        if (filaEliminar) {
            filaEliminar.remove(); // Eliminar la fila
        }
        eliminarModal.style.display = "none"; // Cierra la ventana modal
        actualizarPaginacion(); // Actualizar paginación después de eliminar
        asignarEventosModal(); // Reasignar eventos después de eliminar
    }

    // Evento para el botón de cancelar eliminación
    document.getElementById("btn-cancelar-eliminar-oferta").onclick = function() {
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