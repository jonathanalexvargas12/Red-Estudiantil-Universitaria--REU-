import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración inicial de la tabla
    const tablaPeriodos = new GenericTable(
        'periodo_academico',
        'tabla-periodos',
        ['Periodo_Academico', 'Limite_UC', 'Inicio', 'Final', 'Estado'],
        ['Periodo_Academico', 'Limite_UC', 'Inicio', 'Final', 'Estado']
    );

    // 2. Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // 3. Variables para paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-periodos');
    const estatusSelect = document.querySelector('.filtro-estatus-periodos');
    const botonBuscar = document.querySelector('.btn-buscar-periodos');
    const btnReajustar = document.querySelector('.btn-reajustar-periodos');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // 4. Función para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString || dateString === 'undefined') return '';
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return dateString;
        return dateObj.toLocaleDateString('es-ES');
    };

    // 5. Función para aplicar estilos de estatus
    const aplicarEstilosEstatus = () => {
        document.querySelectorAll('#tabla-periodos tbody tr').forEach(row => {
            const estatusCell = row.cells[4];
            if (estatusCell) {
                const estatus = estatusCell.textContent.trim().toLowerCase();
                estatusCell.className = `estatus-periodo ${estatus}`;
                estatusCell.innerHTML = `<span class="circulo-estatus"></span>${
                    estatus === 'cursando' ? 'Cursando' : 'Cerrado'
                }`;
            }
        });
    };

    // 6. Función para clonar filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-periodos tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // 7. Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estatusSeleccionado = estatusSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-periodos tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const periodo = fila.cells[0].textContent.toLowerCase();
            const limiteUC = fila.cells[1].textContent.toLowerCase();
            const estatus = fila.cells[4].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                periodo.includes(textoBusqueda) || 
                limiteUC.includes(textoBusqueda);
            
            const coincideEstatus = estatusSeleccionado === '' || 
                estatus.includes(estatusSeleccionado);

            if (coincideBusqueda && coincideEstatus) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        aplicarEstilosEstatus();
        actualizarPaginacion();
        tablaPeriodos.asignarEventosEditarEliminar();
    };

    // 8. Funciones de paginación
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-periodos tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-periodos').textContent =
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-periodos',
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
        const filas = document.querySelectorAll('#tabla-periodos tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // 9. Eventos de búsqueda y paginación
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estatusSelect.selectedIndex = 0;
        filtrarTabla();
    });

    document.querySelector('.pagina-anterior-periodos').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-periodos').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // 10. Sobrescribir cargarDatos para formateo adicional
    const originalCargarDatos = tablaPeriodos.cargarDatos.bind(tablaPeriodos);
    tablaPeriodos.cargarDatos = async function() {
        await originalCargarDatos();
        
        document.querySelectorAll('#tabla-periodos tbody tr').forEach(row => {
            const celdas = row.cells;
            celdas[2].textContent = formatDate(celdas[2].textContent);
            celdas[3].textContent = formatDate(celdas[3].textContent);
        });
        
        aplicarEstilosEstatus();
        clonarFilasOriginales();
        actualizarPaginacion();
    };

    // 11. Método para editar - Implementación basada en el código funcional
    tablaPeriodos.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarPeriodoModal');
        const editarForm = document.getElementById('editar-periodo-modal-form');
        const inputs = editarForm.querySelectorAll('input');
        const select = editarForm.querySelector('select');

        // Llenar el formulario con los datos actuales
        inputs[0].value = datos[0]; // Periodo_Academico
        inputs[1].value = datos[1]; // Limite_UC
        inputs[2].value = datos[2].split('T')[0]; // Inicio
        inputs[3].value = datos[3].split('T')[0]; // Final
        select.value = datos[4].toLowerCase(); // Estado

        editarModal.style.display = 'block';

        // Guardar cambios
        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/periodo_academico/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Periodo_Academico: inputs[0].value,
                        Limite_UC: inputs[1].value,
                        Inicio: inputs[2].value,
                        Final: inputs[3].value,
                        Estado: select.value
                    }),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                
                await tablaPeriodos.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
                
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al editar: ${error.message}`);
            }
        };

        // Cerrar modal
        document.querySelector('.close').addEventListener('click', () => {
            editarModal.style.display = 'none';
        });
        document.getElementById('cancelar-editar-periodo-modal').addEventListener('click', () => {
            editarModal.style.display = 'none';
        });
    };

    // 12. Método para eliminar - Implementación basada en el código funcional
    tablaPeriodos.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarPeriodoModal');
        eliminarModal.style.display = 'block';

        document.getElementById('btn-aceptar-eliminar-periodo').onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/periodo_academico/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                
                eliminarModal.style.display = 'none';
                await tablaPeriodos.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al eliminar: ${error.message}`);
            }
        };

        // Cerrar modal
        document.querySelector('.eliminar-close').addEventListener('click', () => {
            eliminarModal.style.display = 'none';
        });
        document.getElementById('btn-cancelar-eliminar-periodo').addEventListener('click', () => {
            eliminarModal.style.display = 'none';
        });
    };

    // 13. Agregar nuevo periodo
    document.getElementById('btn-agregar-periodo').addEventListener('click', () => {
        document.getElementById('agregarPeriodoModal').style.display = 'block';
    });

    const agregarForm = document.getElementById('agregar-periodo-modal-form');
    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/periodo_academico', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Periodo_Academico: document.getElementById('agregar-nombre-periodo').value,
                    Limite_UC: document.getElementById('agregar-limite-uc').value,
                    Inicio: document.getElementById('agregar-fecha-inicio').value,
                    Final: document.getElementById('agregar-fecha-fin').value,
                    Estado: document.getElementById('agregar-estatus').value
                }),
            });

            if (!response.ok) throw new Error('Error al agregar el periodo');

            await tablaPeriodos.cargarDatos();
            clonarFilasOriginales();
            actualizarPaginacion();
            
            agregarForm.reset();
            document.getElementById('agregarPeriodoModal').style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert(`Error al agregar: ${error.message}`);
        }
    });

    // Cerrar modal de agregar
    document.querySelector('.agregar-close').addEventListener('click', () => {
        document.getElementById('agregarPeriodoModal').style.display = 'none';
        agregarForm.reset();
    });
    document.getElementById('cancelar-agregar-periodo-modal').addEventListener('click', () => {
        document.getElementById('agregarPeriodoModal').style.display = 'none';
        agregarForm.reset();
    });

    // 14. Inicializar la tabla
    tablaPeriodos.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});