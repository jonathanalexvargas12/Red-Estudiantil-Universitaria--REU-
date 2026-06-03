import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para carreras
    const tablaCarreras = new GenericTable(
        'carreras',
        'tabla-carreras',
        ['Codigo_Carrera', 'Nombre_Carrera', 'Tipo', 'Estado', 'Total_UC'],
        ['Codigo_Carrera', 'Nombre_Carrera']
    );

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Variables para paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-carreras');
    const botonBuscar = document.querySelector('.btn-buscar-carreras');
    const btnReajustar = document.querySelector('.btn-reajustar-carreras');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-carreras tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-carreras tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const codigo = fila.cells[0].textContent.toLowerCase();
            const nombre = fila.cells[1].textContent.toLowerCase();

            if (textoBusqueda === '' || codigo.includes(textoBusqueda) || nombre.includes(textoBusqueda)) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        tablaCarreras.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Funciones de paginación
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-carreras tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-carreras').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-carreras',
            paginaActual: currentPage,
            totalPaginas: totalPages,
            alCambiarPagina: (pagina) => {
                currentPage = pagina;
                displayRows(currentPage);
                updatePaginationButtons();
            }
        });
    };

    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-carreras tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = Math.min(currentPage, totalPages);
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de búsqueda y paginación
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        filtrarTabla();
    });

    document.querySelector('.pagina-anterior-carreras').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-carreras').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Función para abrir modal de agregar con selects en estado inicial
    const abrirModalAgregar = () => {
        const agregarModal = document.getElementById('agregarCarreraModal');
        const agregarForm = document.getElementById('agregar-carrera-modal-form');
        
        agregarForm.reset();
        document.getElementById('agregar-tipo-carrera').value = '';
        document.getElementById('agregar-estado-carrera').value = '';
        agregarModal.style.display = 'block';
    };

    // Evento para agregar carrera
    document.getElementById('btn-agregar-carrera').addEventListener('click', abrirModalAgregar);

    // Evento para formulario de agregar
    document.getElementById('agregar-carrera-modal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tipo = document.getElementById('agregar-tipo-carrera').value;
        const estado = document.getElementById('agregar-estado-carrera').value;
        
        if (!tipo || !estado) {
            alert('Debe seleccionar tanto el Tipo como el Estado de la carrera');
            return;
        }

        try {
            const response = await fetch('/api/carreras', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    Codigo_Carrera: document.getElementById('agregar-codigo-carrera').value,
                    Nombre_Carrera: document.getElementById('agregar-nombre-carrera').value,
                    Tipo: tipo,
                    Estado: estado,
                    Total_UC: parseInt(document.getElementById('agregar-total-uc-carrera').value)
                })
            });

            if (!response.ok) throw new Error(await response.text());

            await tablaCarreras.cargarDatos();
            clonarFilasOriginales();
            actualizarPaginacion();
            document.getElementById('agregarCarreraModal').style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar carrera: ' + error.message);
        }
    });

    // Método para editar (con select de tipo implementado)
    tablaCarreras.onEditar = (id, datos, item) => {
        const editarModal = document.getElementById('editarCarreraModal');
        const editarForm = document.getElementById('editar-carrera-modal-form');

        // Configurar select de tipo en el modal de editar
        const tipoSelect = document.getElementById('editar-tipo-carrera');
        tipoSelect.innerHTML = `
            <option value="" disabled ${!item.Tipo ? 'selected' : ''}>Elija el tipo</option>
            <option value="Trimestral" ${item.Tipo === 'Trimestral' ? 'selected' : ''}>Trimestral</option>
            <option value="Semestral" ${item.Tipo === 'Semestral' ? 'selected' : ''}>Semestral</option>
        `;

        // Configurar select de estado
        const estadoSelect = document.getElementById('editar-estado-carrera');
        estadoSelect.innerHTML = `
            <option value="" disabled ${!item.Estado ? 'selected' : ''}>Elija el estado</option>
            <option value="Activa" ${item.Estado === 'Activa' ? 'selected' : ''}>Activa</option>
            <option value="Inactiva" ${item.Estado === 'Inactiva' ? 'selected' : ''}>Inactiva</option>
        `;

        // Establecer otros valores
        document.getElementById('editar-codigo-carrera').value = item.Codigo_Carrera || '';
        document.getElementById('editar-nombre-carrera').value = item.Nombre_Carrera || '';
        document.getElementById('editar-total-uc-carrera').value = item.Total_UC || '';

        editarModal.style.display = 'block';

        editarForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const tipo = tipoSelect.value;
            const estado = estadoSelect.value;
            
            if (!tipo || !estado) {
                alert('Debe seleccionar tanto el Tipo como el Estado de la carrera');
                return;
            }

            try {
                const response = await fetch(`/api/carreras/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({
                        Codigo_Carrera: document.getElementById('editar-codigo-carrera').value,
                        Nombre_Carrera: document.getElementById('editar-nombre-carrera').value,
                        Tipo: tipo,
                        Estado: estado,
                        Total_UC: parseInt(document.getElementById('editar-total-uc-carrera').value)
                    })
                });

                if (!response.ok) throw new Error(await response.text());

                await tablaCarreras.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
                alert('Error al editar carrera: ' + error.message);
            }
        };

        // Cerrar modal
        document.querySelector('#editarCarreraModal .close').addEventListener('click', () => {
            editarModal.style.display = 'none';
        });
        document.getElementById('cancelar-editar-carrera-modal').addEventListener('click', () => {
            editarModal.style.display = 'none';
        });
    };

    // Método para eliminar
    tablaCarreras.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarCarreraModal');
        eliminarModal.style.display = 'block';

        document.getElementById('btn-aceptar-eliminar-carrera').onclick = async () => {
            try {
                const response = await fetch(`/api/carreras/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                });

                if (!response.ok) throw new Error(await response.text());

                await tablaCarreras.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
                eliminarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar carrera: ' + error.message);
            }
        };

        // Cerrar modal
        document.querySelector('#eliminarCarreraModal .eliminar-close').addEventListener('click', () => {
            eliminarModal.style.display = 'none';
        });
        document.getElementById('btn-cancelar-eliminar-carrera').addEventListener('click', () => {
            eliminarModal.style.display = 'none';
        });
    };

    // Cerrar modal de agregar
    document.querySelector('#agregarCarreraModal .agregar-close').addEventListener('click', () => {
        document.getElementById('agregarCarreraModal').style.display = 'none';
    });
    document.getElementById('cancelar-agregar-carrera-modal').addEventListener('click', () => {
        document.getElementById('agregarCarreraModal').style.display = 'none';
    });

    // Inicialización
    tablaCarreras.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});