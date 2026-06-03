import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para aulas
    const tablaAulas = new GenericTable(
        'aulas', // Nombre de la tabla en la base de datos
        'tabla-aulas', // ID de la tabla HTML
        ['Nombre_Aula', 'Capacidad'], // Todas las columnas
        ['Nombre_Aula', 'Capacidad'] // Columnas a mostrar en la tabla HTML
    );

    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-aulas');
    const botonBuscar = document.querySelector('.btn-buscar-aulas');
    const btnReajustar = document.querySelector('.btn-reajustar-aulas');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-aulas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-aulas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const nombre = fila.cells[0].textContent.toLowerCase();
            const capacidad = fila.cells[1].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                                  nombre.includes(textoBusqueda) || 
                                  capacidad.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Reasignar eventos y actualizar paginación
        tablaAulas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-aulas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        tablaAulas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-aulas tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-aulas').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        // Reasignar eventos para las filas visibles
        tablaAulas.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-aulas',
            paginaActual: currentPage,
            totalPaginas: totalPages,
            alCambiarPagina: (pagina) => {
                currentPage = pagina;
                displayRows(currentPage);
                updatePaginationButtons();
            }
        });
    };

    // Función para actualizar la paginación
    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-aulas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
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

    // Inicialización
    tablaAulas.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });

    // Métodos para editar y eliminar
    tablaAulas.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarAulaModal');
        const editarForm = document.getElementById('editar-aula-modal-form');

        const inputs = editarForm.querySelectorAll('input');
        inputs[0].value = datos[0];
        inputs[1].value = datos[1];

        editarModal.style.display = 'block';

        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Nombre_Aula: inputs[0].value,
                Capacidad: inputs[1].value
            };

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/aulas/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevosDatos),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                tablaAulas.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const editarClose = document.querySelector('.close');
        if (editarClose) {
            editarClose.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }

        const cancelarEditar = document.getElementById('cancelar-editar-aula-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

    tablaAulas.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarAulaModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar-aula');
        btnAceptarEliminar.onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/aulas/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                eliminarModal.style.display = 'none';
                tablaAulas.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const eliminarClose = document.querySelector('.eliminar-close');
        if (eliminarClose) {
            eliminarClose.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }

        const cancelarEliminar = document.getElementById('btn-cancelar-eliminar-aula');
        if (cancelarEliminar) {
            cancelarEliminar.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }
    };

    // Evento para el botón de agregar aula
    const btnAgregar = document.getElementById('btn-agregar-aula');
    btnAgregar.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarAulaModal');
        if (agregarModal) {
            agregarModal.style.display = 'block';
        } else {
            console.error('Modal de agregar no encontrado: agregarAulaModal');
        }
    });

    // Evento para el formulario de agregar
    const agregarForm = document.getElementById('agregar-aula-modal-form');
    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = document.getElementById('agregar-nombre-aula').value;
        const capacidad = document.getElementById('agregar-capacidad-aula').value;

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/aulas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Nombre_Aula: nombre,
                    Capacidad: capacidad
                }),
            });

            if (!response.ok) throw new Error('Error al agregar el aula');

            tablaAulas.cargarDatos().then(() => {
                clonarFilasOriginales();
                actualizarPaginacion();
            });

            const agregarModal = document.getElementById('agregarAulaModal');
            if (agregarModal) {
                agregarModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Evento para cerrar el modal de agregar
    const agregarClose = document.querySelector('.agregar-close');
    agregarClose.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarAulaModal');
        if (agregarModal) {
            agregarModal.style.display = 'none';
        }
    });
});