import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración inicial de la tabla
    const tablaTutores = new GenericTable(
        'solicitudes_tutor_externo',
        'tabla-tutor',
        ['ID', 'Cedula_Tutor', 'Nombre_Tutor', 'Cedula_Solicitante', 'Nombre_Estudiante', 'Estado', 'Fecha_Solicitud'],
        ['Fecha_Solicitud', 'Nombre_Tutor', 'Nombre_Estudiante', 'Estado']
    );

    // 2. Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // 3. Variables para paginación y búsqueda
    const buscarInput = document.querySelector('#buscar-input-tutor');
    const estatusSelect = document.querySelector('#estatus-select-tutor');
    const botonBuscar = document.querySelector('.btn-buscar-tutor');
    const btnReajustar = document.querySelector('.btn-reajustar-tutor');
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

    // 5. Función para aplicar estilos de estatus (versión corregida)
    const aplicarEstilosEstatus = (filas) => {
        const elementos = filas || document.querySelectorAll('#tabla-tutor tbody tr');
        
        elementos.forEach(row => {
            const estatusCell = row.cells[3];
            if (estatusCell) {
                // Obtenemos el valor original del estado del atributo data-estado
                const estadoReal = row.getAttribute('data-estado') || 
                                 estatusCell.textContent.replace(/<[^>]*>/g, '').trim().toLowerCase();
                
                let claseEstatus = '';
                let textoEstatus = '';
                
                switch(estadoReal) {
                    case 'tutor-por-aprobar':
                        claseEstatus = 'tutor-por-aprobar';
                        textoEstatus = 'Tutor por Aprobar';
                        break;
                    case 'tutor-aprobado':
                        claseEstatus = 'tutor-aprobado';
                        textoEstatus = 'Tutor Aprobado';
                        break;
                    case 'tutor-rechazado':
                        claseEstatus = 'tutor-rechazado';
                        textoEstatus = 'Tutor Rechazado';
                        break;
                    default:
                        claseEstatus = '';
                        textoEstatus = estadoReal;
                }
                
                // Guardamos el estado real en un atributo por si necesitamos usarlo después
                row.setAttribute('data-estado', estadoReal);
                estatusCell.innerHTML = `<span class="estatus-circulo ${claseEstatus}"></span> ${textoEstatus}`;
            }
        });
    };

    // 6. Función para clonar filas originales (versión corregida)
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-tutor tbody tr');
        filasOriginales = Array.from(filas).map(fila => {
            const clone = fila.cloneNode(true);
            // Extraemos el estado real del atributo data o del contenido limpio de la celda
            const estadoReal = fila.getAttribute('data-estado') || 
                             fila.cells[3].textContent.replace(/<[^>]*>/g, '').trim().toLowerCase();
            clone.setAttribute('data-estado', estadoReal);
            return clone;
        });
    };

    // 7. Función para filtrar la tabla (versión corregida)
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estatusSeleccionado = estatusSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-tutor tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(filaOriginal => {
            const fecha = filaOriginal.cells[0].textContent.toLowerCase();
            const tutor = filaOriginal.cells[1].textContent.toLowerCase();
            const estudiante = filaOriginal.cells[2].textContent.toLowerCase();
            const estadoReal = filaOriginal.getAttribute('data-estado').toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                fecha.includes(textoBusqueda) || 
                tutor.includes(textoBusqueda) || 
                estudiante.includes(textoBusqueda);
            
            const coincideEstatus = estatusSeleccionado === '' || 
                estadoReal.includes(estatusSeleccionado);

            if (coincideBusqueda && coincideEstatus) {
                const nuevaFila = filaOriginal.cloneNode(true);
                tbody.appendChild(nuevaFila);
            }
        });

        // Aplicamos los estilos solo a las filas filtradas
        aplicarEstilosEstatus(tbody.querySelectorAll('tr'));
        actualizarPaginacion();
        tablaTutores.asignarEventosEditarEliminar();
    };

    // 8. Funciones de paginación
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-tutor tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-tutor').textContent =
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-tutor',
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
        const filas = document.querySelectorAll('#tabla-tutor tbody tr');
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

    document.querySelector('.pagina-anterior-tutor').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-tutor').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // 10. Sobrescribir cargarDatos para formateo adicional
    const originalCargarDatos = tablaTutores.cargarDatos.bind(tablaTutores);
    tablaTutores.cargarDatos = async function() {
        await originalCargarDatos();
        
        document.querySelectorAll('#tabla-tutor tbody tr').forEach(row => {
            const celdas = row.cells;
            celdas[0].textContent = formatDate(celdas[0].textContent);
        });
        
        aplicarEstilosEstatus();
        clonarFilasOriginales();
        actualizarPaginacion();
    };

    // 11. Modificar el método actualizarTabla en GenericTable para incluir datos adicionales (versión corregida)
    const originalActualizarTabla = tablaTutores.actualizarTabla.bind(tablaTutores);
    tablaTutores.actualizarTabla = function(datos) {
        originalActualizarTabla(datos);
        
        // Agregar atributos data-* a las filas para tener acceso a todos los datos
        const filas = document.querySelectorAll(`#${this.tableId} tbody tr`);
        datos.forEach((item, index) => {
            if (filas[index]) {
                filas[index].setAttribute('data-id', item[this.columns[0]]);
                filas[index].setAttribute('data-cedula-tutor', item.Cedula_Tutor || '');
                filas[index].setAttribute('data-cedula-solicitante', item.Cedula_Solicitante || '');
                filas[index].setAttribute('data-fecha-solicitud', item.Fecha_Solicitud || '');
                // Guardamos el estado original en un atributo data
                filas[index].setAttribute('data-estado', item.Estado || '');
            }
        });
        
        // Aplicamos los estilos después de actualizar
        aplicarEstilosEstatus();
    };

    // 12. Método para editar - Versión corregida
    tablaTutores.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarTutorModal');
        if (!editarModal) {
            console.error('No se encontró el modal de edición');
            return;
        }

        const editarForm = document.getElementById('editar-tutor-modal-form');
        if (!editarForm) {
            console.error('No se encontró el formulario de edición');
            return;
        }

        // Obtener la fila completa con los datos adicionales
        const fila = document.querySelector(`#tabla-tutor tr[data-id="${id}"]`);
        if (!fila) {
            console.error('No se encontró la fila con ID:', id);
            return;
        }

        // Llenar el formulario con todos los campos
        document.getElementById('editar-cedula-tutor').value = fila.getAttribute('data-cedula-tutor') || '';
        document.getElementById('editar-nombre-tutor').value = datos[1] || ''; // Nombre_Tutor
        document.getElementById('editar-cedula-solicitante').value = fila.getAttribute('data-cedula-solicitante') || '';
        document.getElementById('editar-nombre-estudiante').value = datos[2] || ''; // Nombre_Estudiante
        
        // Formatear fecha correctamente
        const fechaSolicitud = fila.getAttribute('data-fecha-solicitud');
        const fecha = fechaSolicitud ? new Date(fechaSolicitud) : new Date();
        document.getElementById('editar-fecha-solicitud').valueAsDate = fecha;
        
        document.getElementById('editar-estatus').value = (datos[3] || 'tutor-por-aprobar').toLowerCase();

        // Mostrar el modal
        editarModal.style.display = 'block';

        // Configurar el evento submit
        const handleSubmit = async (event) => {
            event.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const newEstado = document.getElementById('editar-estatus').value;
                const oldEstado = (datos[3] || '').toLowerCase();

                // If approving, use the dedicated endpoint that auto-creates the investigation
                if (newEstado === 'tutor-aprobado' && oldEstado !== 'tutor-aprobado') {
                    const response = await fetch(`/api/solicitudes/aceptar-externa/${id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        const err = await response.json().catch(() => ({}));
                        throw new Error(err.message || 'Error al aprobar la solicitud');
                    }
                    const result = await response.json();
                    await tablaTutores.cargarDatos();
                    editarModal.style.display = 'none';
                    alert(`Solicitud aprobada. Trabajo de investigación #${result.investigacionId} creado automáticamente.`);
                    return;
                }

                const response = await fetch(`/api/solicitudes_tutor_externo/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Cedula_Tutor: document.getElementById('editar-cedula-tutor').value,
                        Nombre_Tutor: document.getElementById('editar-nombre-tutor').value,
                        Cedula_Solicitante: document.getElementById('editar-cedula-solicitante').value,
                        Nombre_Estudiante: document.getElementById('editar-nombre-estudiante').value,
                        Fecha_Solicitud: document.getElementById('editar-fecha-solicitud').value,
                        Estado: document.getElementById('editar-estatus').value
                    }),
                });

                if (!response.ok) throw new Error('Error al editar el tutor externo');
                
                await tablaTutores.cargarDatos();
                editarModal.style.display = 'none';
                alert('Tutor externo actualizado correctamente');
            } catch (error) {
                console.error('Error al editar:', error);
                alert(`Error al editar: ${error.message}`);
            }
        };

        editarForm.onsubmit = handleSubmit;

        // Cerrar modal
        const closeModal = () => {
            editarModal.style.display = 'none';
            editarForm.onsubmit = null;
        };

        editarModal.querySelector('.close').addEventListener('click', closeModal);
        document.getElementById('cancelar-editar-tutor-modal').addEventListener('click', closeModal);
    };

    // 13. Método para eliminar
    tablaTutores.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarTutorModal');
        if (!eliminarModal) {
            console.error('Modal de eliminación no encontrado');
            return;
        }

        eliminarModal.style.display = 'block';

        const handleEliminar = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/solicitudes_tutor_externo/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el tutor externo');
                
                eliminarModal.style.display = 'none';
                await tablaTutores.cargarDatos();
                alert('Tutor externo eliminado correctamente');
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al eliminar: ${error.message}`);
            }
        };

        // Configurar botón de aceptar
        const btnAceptar = document.getElementById('btn-aceptar-eliminar-tutor');
        if (btnAceptar) {
            btnAceptar.onclick = handleEliminar;
        }

        // Configurar cierre del modal
        const closeModal = () => {
            eliminarModal.style.display = 'none';
        };

        const closeButton = eliminarModal.querySelector('.eliminar-close');
        if (closeButton) {
            closeButton.onclick = closeModal;
        }

        const cancelButton = document.getElementById('btn-cancelar-eliminar-tutor');
        if (cancelButton) {
            cancelButton.onclick = closeModal;
        }
    };

    // 14. Agregar nuevo tutor externo
    const agregarModal = document.getElementById('agregarTutorModal');
    const agregarForm = document.getElementById('agregar-tutor-modal-form');

    if (agregarModal && agregarForm) {
        document.getElementById('btn-agregar-tutor').addEventListener('click', () => {
            agregarModal.style.display = 'block';
        });

        agregarForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/solicitudes_tutor_externo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Cedula_Tutor: document.getElementById('agregar-cedula-tutor').value,
                        Nombre_Tutor: document.getElementById('agregar-nombre-tutor').value,
                        Cedula_Solicitante: document.getElementById('agregar-cedula-solicitante').value,
                        Nombre_Estudiante: document.getElementById('agregar-nombre-estudiante').value,
                        Fecha_Solicitud: document.getElementById('agregar-fecha-solicitud').value,
                        Estado: document.getElementById('agregar-estatus').value
                    }),
                });

                if (!response.ok) throw new Error('Error al agregar el tutor externo');

                await tablaTutores.cargarDatos();
                agregarForm.reset();
                agregarModal.style.display = 'none';
                alert('Tutor externo agregado correctamente');
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al agregar: ${error.message}`);
            }
        });

        // Cerrar modal de agregar
        agregarModal.querySelector('.agregar-close').addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });

        document.getElementById('cancelar-agregar-tutor-modal').addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });
    }

    // 15. Inicializar la tabla
    tablaTutores.cargarDatos().then(() => {
        console.log('Tabla de tutores externos cargada correctamente');
    }).catch(error => {
        console.error('Error al cargar la tabla:', error);
    });
});