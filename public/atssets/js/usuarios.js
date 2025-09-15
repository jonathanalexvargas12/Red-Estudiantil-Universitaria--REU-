document.addEventListener('DOMContentLoaded', () => {
    const tablaUsuarios = document.getElementById('tabla-usuarios').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-usuarios');
    const estadoSelect = document.querySelector('.select-estado-usuarios');
    const ordenarSelect = document.querySelector('.select-ordenar-usuarios');
    const ordenRadio = document.querySelectorAll('input[name="orden"]');
    const botonBuscar = document.querySelector('.btn-buscar-usuarios');
    const btnReajustar = document.querySelector('.btn-reajustar-usuarios');

    let filasOriginales = Array.from(tablaUsuarios.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaUsuarios.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estadoSeleccionado = estadoSelect.value.toLowerCase();
        const ordenarPor = ordenarSelect.value.toLowerCase();
        const orden = document.querySelector('input[name="orden"]:checked').value;

        tablaUsuarios.innerHTML = '';

        filasOriginales.forEach(fila => {
            const cedula = fila.cells[1].textContent.toLowerCase();
            const nombres = fila.cells[2].textContent.toLowerCase();
            const apellidos = fila.cells[3].textContent.toLowerCase();
            const pensum = fila.cells[4].querySelector('i').classList.contains('pensum-asignado') ? 'asignado' : 'no asignado';
            const estado = fila.cells[5].querySelector('i').classList.contains('estado-habilitado') ? 'habilitado' : 'deshabilitado';

            const coincideBusqueda = textoBusqueda === '' ||
                                     cedula.includes(textoBusqueda) ||
                                     nombres.includes(textoBusqueda) ||
                                     apellidos.includes(textoBusqueda);

            const coincideEstado = estadoSeleccionado === '' || estado === estadoSeleccionado;

            if (coincideBusqueda && coincideEstado) {
                tablaUsuarios.appendChild(fila.cloneNode(true));
            }
        });

        // Ordenar la tabla
        if (ordenarPor !== '') {
            const filasFiltradas = Array.from(tablaUsuarios.rows);
            filasFiltradas.sort((a, b) => {
                const valorA = a.cells[ordenarPor === 'cedula' ? 1 : ordenarPor === 'nombre' ? 2 : 3].textContent.toLowerCase();
                const valorB = b.cells[ordenarPor === 'cedula' ? 1 : ordenarPor === 'nombre' ? 2 : 3].textContent.toLowerCase();
                if (ordenarPor === 'cedula') {
                    return orden === 'ascendente' ? parseInt(valorA) - parseInt(valorB) : parseInt(valorB) - parseInt(valorA);
                } else {
                    return orden === 'ascendente' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
                }
            });

            tablaUsuarios.innerHTML = '';
            filasFiltradas.forEach(fila => tablaUsuarios.appendChild(fila));
        }

        actualizarPaginacion();
        asignarEventosModal(); // Reasignar eventos después de filtrar
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estadoSelect.selectedIndex = 0;
        ordenarSelect.selectedIndex = 0;
        ordenRadio[0].checked = true; // Restablecer a orden ascendente
        tablaUsuarios.innerHTML = '';
        filasOriginales.forEach(fila => tablaUsuarios.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosModal(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaUsuarios.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaUsuarios.rows.length; i++) {
            tablaUsuarios.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaUsuarios.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-usuarios').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-usuarios');
        const nextButton = document.querySelector('.pagina-siguiente-usuarios');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-usuarios');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-usuarios');
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

    document.querySelector('.pagina-anterior-usuarios').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-usuarios').addEventListener('click', () => {
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
    // Ventana modal de "Agregar"
    const agregarModal = document.getElementById("agregarModal");
    const agregarModalForm = document.getElementById("agregar-modal-form");
    const agregarSpan = document.getElementsByClassName("agregar-close")[0];
    const cancelarAgregarModal = document.getElementById("cancelar-agregar-modal");
    const btnAgregar = document.getElementById("btn-agregar-usuarios");

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
            <td>${tablaUsuarios.rows.length + 1}</td>
            <td>${document.getElementById("nueva-cedula").value}</td>
            <td>${document.getElementById("nuevos-nombres").value}</td>
            <td>${document.getElementById("nuevos-apellidos").value}</td>
            <td><i class="fas fa-circle ${document.getElementById("nuevo-pensum").value === 'asignado' ? 'pensum-asignado' : 'pensum-no-asignado'}" title="${document.getElementById("nuevo-pensum").value === 'asignado' ? 'Asignado' : 'No Asignado'}"></i></td>
            <td><i class="fas fa-circle ${document.getElementById("nuevo-estado").value === 'habilitado' ? 'estado-habilitado' : 'estado-deshabilitado'}" title="${document.getElementById("nuevo-estado").value === 'habilitado' ? 'Habilitado' : 'Deshabilitado'}"></i></td>
            <td>
                <i class="fas fa-edit accion-icono editar-icono-usuario" title="Editar"></i>
                <i class="fas fa-key accion-icono cambiar-contrasena-icono-usuario" title="Cambiar Contraseña"></i>
                <i class="fas fa-trash-alt accion-icono anular-icono-usuario" title="Anular"></i>
            </td>
        `;
        tablaUsuarios.appendChild(nuevaFila);
        agregarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de agregar
        asignarEventosModal(); // Reasignar eventos después de agregar
    });

    // Ventana modal "Editar"
    const editarModal = document.getElementById("editarModal");
    const editarModalForm = document.getElementById("modal-form");
    const spanEditar = document.querySelector("#editarModal .close");
    const cancelarEditarModal = document.getElementById("cancelar-modal");
    let filaActual;

    // Reasignar eventos de edición
    const editIcons = document.querySelectorAll(".editar-icono-usuario");
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
        document.getElementById("cedula").value = cells[1].textContent;
        document.getElementById("nombres").value = cells[2].textContent;
        document.getElementById("apellidos").value = cells[3].textContent;
        document.getElementById("pensum").value = cells[4].querySelector('i').classList.contains('pensum-asignado') ? 'asignado' : 'no asignado';
        document.getElementById("estado").value = cells[5].querySelector('i').classList.contains('estado-habilitado') ? 'habilitado' : 'deshabilitado';
    }

    editarModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cells = filaActual.querySelectorAll("td");
        cells[1].textContent = document.getElementById("cedula").value;
        cells[2].textContent = document.getElementById("nombres").value;
        cells[3].textContent = document.getElementById("apellidos").value;
        cells[4].innerHTML = `<i class="fas fa-circle ${document.getElementById("pensum").value === 'asignado' ? 'pensum-asignado' : 'pensum-no-asignado'}" title="${document.getElementById("pensum").value === 'asignado' ? 'Asignado' : 'No Asignado'}"></i>`;
        cells[5].innerHTML = `<i class="fas fa-circle ${document.getElementById("estado").value === 'habilitado' ? 'estado-habilitado' : 'estado-deshabilitado'}" title="${document.getElementById("estado").value === 'habilitado' ? 'Habilitado' : 'Deshabilitado'}"></i>`;
        editarModal.style.display = "none";
        actualizarPaginacion(); // Actualizar paginación después de editar
        asignarEventosModal(); // Reasignar eventos después de editar
    });

    // Ventana modal de "Cambiar Contraseña"
    const cambiarContrasenaModal = document.getElementById("cambiarContrasenaModal");
    const cambiarContrasenaForm = document.getElementById("cambiar-contrasena-form");
    const spanCambiarContrasena = document.querySelector("#cambiarContrasenaModal .close");
    const cancelarCambiarContrasena = document.getElementById("cancelar-cambiar-contrasena");
    const cambiarContrasenaIcons = document.querySelectorAll(".cambiar-contrasena-icono-usuario");

    cambiarContrasenaIcons.forEach(icon => {
        icon.addEventListener("click", () => {
            cambiarContrasenaModal.style.display = "block";
        });
    });

    spanCambiarContrasena.onclick = function() {
        cambiarContrasenaModal.style.display = "none";
    }
    cancelarCambiarContrasena.onclick = function(){
        cambiarContrasenaModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == cambiarContrasenaModal) {
            cambiarContrasenaModal.style.display = "none";
        }
    }

    cambiarContrasenaForm.addEventListener('submit', (event) => {
        event.preventDefault();
        cambiarContrasenaModal.style.display = "none";
    });

    // Ventana modal de "Anular"
const modalAnular = document.getElementById("modalAnular");
const btnAnular = document.querySelectorAll(".anular-icono-usuario");
const spanCerrarAnular = document.getElementsByClassName("close-anular")[0];
const btnAceptarAnular = document.getElementById("btn-aceptar-anular");
const btnCancelarAnular = document.getElementById("btn-cancelar-anular");
let filaAnular;

btnAnular.forEach(btn => {
    btn.addEventListener("click", () => {
        modalAnular.style.display = "block";
        filaAnular = btn.closest('tr');
    });
});

spanCerrarAnular.onclick = function() {
    modalAnular.style.display = "none";
}

btnCancelarAnular.onclick = function() {
    modalAnular.style.display = "none";
}

btnAceptarAnular.onclick = function() {
    if (filaAnular) {
        // Seleccionar específicamente el ícono de la columna de estado
        const estadoIcono = filaAnular.querySelector('td:nth-child(6) .fa-circle');
        if (estadoIcono) {
            estadoIcono.classList.remove('estado-habilitado', 'estado-deshabilitado');
            estadoIcono.classList.add('estado-anulado');
            estadoIcono.setAttribute('title', 'Anulado');
        }
    }
    modalAnular.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modalAnular) {
        modalAnular.style.display = "none";
    }
}
}

// Llamar a la función para asignar eventos inicialmente
asignarEventosModal();