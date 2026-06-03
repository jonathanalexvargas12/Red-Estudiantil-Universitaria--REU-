import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para secciones (sin opción de edición)
    const tablaSecciones = new GenericTable(
        'secciones', // Nombre de la tabla en la base de datos
        'tabla-secciones', // ID de la tabla HTML
        ['Codigo_Seccion'], // Todas las columnas
        ['Codigo_Seccion'], // Columnas a mostrar
        true // Deshabilitar función de edición
    );

    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-secciones');
    const botonBuscar = document.querySelector('.btn-buscar-secciones');
    const btnReajustar = document.querySelector('.btn-reajustar-secciones');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-secciones tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-secciones tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const codigo = fila.cells[0].textContent.toLowerCase();
            if (textoBusqueda === '' || codigo.includes(textoBusqueda)) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
    };

    // Eventos de búsqueda y reajuste
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-secciones tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-secciones tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-secciones').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-secciones',
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
        const filas = document.querySelectorAll('#tabla-secciones tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
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

    // Método para eliminar
    tablaSecciones.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarSeccionModal');
        eliminarModal.style.display = 'block';

        document.getElementById('btn-aceptar-eliminar-seccion').onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/secciones/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                eliminarModal.style.display = 'none';
                tablaSecciones.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
            } catch (error) {
                console.error('Error:', error);
            }
        };

        // Cerrar modal
        document.querySelector('.eliminar-close').addEventListener('click', () => {
            eliminarModal.style.display = 'none';
        });
        document.getElementById('btn-cancelar-eliminar-seccion').addEventListener('click', () => {
            eliminarModal.style.display = 'none';
        });
    };

    // Evento para agregar nueva sección
    document.getElementById('btn-agregar-seccion').addEventListener('click', () => {
        document.getElementById('agregarSeccionModal').style.display = 'block';
    });

    // Evento para el formulario de agregar
    document.getElementById('agregar-seccion-modal-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const codigo = document.getElementById('agregar-nombre-seccion').value;

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/secciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ Codigo_Seccion: codigo }),
            });

            if (!response.ok) throw new Error('Error al agregar la sección');

            tablaSecciones.cargarDatos().then(() => {
                clonarFilasOriginales();
                actualizarPaginacion();
            });

            document.getElementById('agregarSeccionModal').style.display = 'none';
            event.target.reset();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Cerrar modal de agregar
    document.querySelector('.agregar-close').addEventListener('click', () => {
        document.getElementById('agregarSeccionModal').style.display = 'none';
        document.getElementById('agregar-seccion-modal-form').reset();
    });
    document.getElementById('cancelar-agregar-seccion-modal').addEventListener('click', () => {
        document.getElementById('agregarSeccionModal').style.display = 'none';
        document.getElementById('agregar-seccion-modal-form').reset();
    });

    // Inicialización
    tablaSecciones.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});