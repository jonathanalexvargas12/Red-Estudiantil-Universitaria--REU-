import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración inicial de la tabla
    const tablaSolicitudes = new GenericTable(
        'solicitudes_tutor_interno',
        'tabla-solicitudes',
        ['ID', 'Cedula_Docente', 'Nombre_Docente', 'Cedula_Solicitante', 'Nombre_Estudiante', 'Estado', 'Fecha_Solicitud'],
        ['Fecha_Solicitud', 'Nombre_Docente', 'Nombre_Estudiante', 'Estado']
    );

    // 2. Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // 3. Variables para paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-solicitudes');
    const estatusSelect = document.querySelector('.estatus-select-solicitudes');
    const botonBuscar = document.querySelector('.btn-buscar-solicitudes');
    const btnReajustar = document.querySelector('.btn-reajustar-solicitudes');
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

    // 5. Función para aplicar estilos de estatus (versión definitiva)
    const aplicarEstilosEstatus = (filas) => {
        const elementos = filas || document.querySelectorAll('#tabla-solicitudes tbody tr');
        
        elementos.forEach(row => {
            const estatusCell = row.cells[3];
            if (estatusCell) {
                // Obtenemos el valor original del estado del atributo data-estado
                const estadoReal = row.getAttribute('data-estado') || 
                                 estatusCell.textContent.replace(/<[^>]*>/g, '').trim().toLowerCase();
                
                let claseEstatus = '';
                let textoEstatus = '';
                
                switch(estadoReal) {
                    case 'solicitud-aceptada':
                        claseEstatus = 'solicitud-aceptada';
                        textoEstatus = 'Solicitud Aceptada';
                        break;
                    case 'solicitud-enviada':
                        claseEstatus = 'solicitud-enviada';
                        textoEstatus = 'Solicitud Enviada';
                        break;
                    case 'solicitud-rechazada':
                        claseEstatus = 'solicitud-rechazada';
                        textoEstatus = 'Solicitud Rechazada';
                        break;
                    case 'solicitud-caducada':
                        claseEstatus = 'solicitud-caducada';
                        textoEstatus = 'Solicitud Caducada';
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

    // 6. Función para clonar filas originales (versión definitiva)
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-solicitudes tbody tr');
        filasOriginales = Array.from(filas).map(fila => {
            const clone = fila.cloneNode(true);
            // Extraemos el estado real del atributo data o del contenido limpio de la celda
            const estadoReal = fila.getAttribute('data-estado') || 
                             fila.cells[3].textContent.replace(/<[^>]*>/g, '').trim().toLowerCase();
            clone.setAttribute('data-estado', estadoReal);
            return clone;
        });
    };

    // 7. Función para filtrar la tabla (versión definitiva)
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estatusSeleccionado = estatusSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-solicitudes tbody');
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
        tablaSolicitudes.asignarEventosEditarEliminar();
    };

    // 8. Funciones de paginación
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-solicitudes tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-tutoria').textContent =
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-tutoria',
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
        const filas = document.querySelectorAll('#tabla-solicitudes tbody tr');
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

    document.querySelector('.pagina-anterior-tutoria').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-tutoria').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // 10. Sobrescribir cargarDatos para formateo adicional
    const originalCargarDatos = tablaSolicitudes.cargarDatos.bind(tablaSolicitudes);
    tablaSolicitudes.cargarDatos = async function() {
        await originalCargarDatos();
        
        document.querySelectorAll('#tabla-solicitudes tbody tr').forEach(row => {
            const celdas = row.cells;
            celdas[0].textContent = formatDate(celdas[0].textContent);
        });
        
        aplicarEstilosEstatus();
        clonarFilasOriginales();
        actualizarPaginacion();
    };

    // 11. Modificar el método actualizarTabla en GenericTable para incluir datos adicionales (versión definitiva)
    const originalActualizarTabla = tablaSolicitudes.actualizarTabla.bind(tablaSolicitudes);
    tablaSolicitudes.actualizarTabla = function(datos) {
        originalActualizarTabla(datos);
        
        // Agregar atributos data-* a las filas para tener acceso a todos los datos
        const filas = document.querySelectorAll(`#${this.tableId} tbody tr`);
        datos.forEach((item, index) => {
            if (filas[index]) {
                filas[index].setAttribute('data-id', item[this.columns[0]]);
                filas[index].setAttribute('data-cedula-docente', item.Cedula_Docente || '');
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
    tablaSolicitudes.onEditar = (id, datos) => {
        console.log('Editando solicitud ID:', id, 'Datos:', datos);
        
        const editarModal = document.getElementById('editarModal');
        if (!editarModal) {
            console.error('No se encontró el modal de edición');
            return;
        }

        const editarForm = document.getElementById('editar-modal-form');
        if (!editarForm) {
            console.error('No se encontró el formulario de edición');
            return;
        }

        // Obtener la fila completa con los datos adicionales
        const fila = document.querySelector(`#tabla-solicitudes tr[data-id="${id}"]`);
        if (!fila) {
            console.error('No se encontró la fila con ID:', id);
            return;
        }

        // Extraer los valores necesarios
        const cedulaDocente = fila.getAttribute('data-cedula-docente') || '';
        const cedulaSolicitante = fila.getAttribute('data-cedula-solicitante') || '';
        const fechaSolicitud = fila.getAttribute('data-fecha-solicitud') || '';
        
        // Los datos visibles vienen en el parámetro 'datos'
        const nombreDocente = datos[1] || ''; // Segundo elemento en displayColumns
        const nombreEstudiante = datos[2] || ''; // Tercer elemento
        const estado = datos[3] || 'solicitud-enviada'; // Cuarto elemento

        // Llenar el formulario
        document.getElementById('editar-cedula-docente').value = cedulaDocente;
        document.getElementById('editar-nombre-docente').value = nombreDocente;
        document.getElementById('editar-cedula-solicitante').value = cedulaSolicitante;
        document.getElementById('editar-nombre-estudiante').value = nombreEstudiante;
        
        // Formatear fecha correctamente
        const fecha = fechaSolicitud ? new Date(fechaSolicitud) : new Date();
        document.getElementById('editar-fecha-solicitud').valueAsDate = fecha;
        
        document.getElementById('editar-estatus').value = estado.toLowerCase();

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

                // If accepting, use the dedicated endpoint that auto-creates the investigation
                if (newEstado === 'solicitud-aceptada' && oldEstado !== 'solicitud-aceptada') {
                    const response = await fetch(`/api/solicitudes/aceptar-interna/${id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        const err = await response.json().catch(() => ({}));
                        throw new Error(err.message || 'Error al aceptar la solicitud');
                    }
                    const result = await response.json();
                    await tablaSolicitudes.cargarDatos();
                    editarModal.style.display = 'none';
                    alert(`Solicitud aceptada. Trabajo de investigación #${result.investigacionId} creado automáticamente.`);
                    return;
                }

                const response = await fetch(`/api/solicitudes_tutor_interno/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Cedula_Docente: document.getElementById('editar-cedula-docente').value,
                        Nombre_Docente: document.getElementById('editar-nombre-docente').value,
                        Cedula_Solicitante: document.getElementById('editar-cedula-solicitante').value,
                        Nombre_Estudiante: document.getElementById('editar-nombre-estudiante').value,
                        Fecha_Solicitud: document.getElementById('editar-fecha-solicitud').value,
                        Estado: document.getElementById('editar-estatus').value
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Error al editar la solicitud');
                }
                
                await tablaSolicitudes.cargarDatos();
                editarModal.style.display = 'none';
                alert('Solicitud actualizada correctamente');
            } catch (error) {
                console.error('Error al editar:', error);
                alert(`Error al editar: ${error.message}`);
            }
        };

        // Configurar el evento solo una vez
        editarForm.onsubmit = handleSubmit;

        // Cerrar modal
        const closeModal = () => {
            editarModal.style.display = 'none';
            editarForm.onsubmit = null;
        };

        editarModal.querySelector('.close').addEventListener('click', closeModal);
        document.getElementById('cancelar-editar-modal').addEventListener('click', closeModal);
    };

    // 13. Método para eliminar
    tablaSolicitudes.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarModal');
        if (!eliminarModal) {
            console.error('Modal de eliminación no encontrado');
            return;
        }

        eliminarModal.style.display = 'block';

        const handleEliminar = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/solicitudes_tutor_interno/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar la solicitud');
                
                eliminarModal.style.display = 'none';
                await tablaSolicitudes.cargarDatos();
                alert('Solicitud eliminada correctamente');
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al eliminar: ${error.message}`);
            }
        };

        // Configurar botón de aceptar
        const btnAceptar = document.getElementById('btn-aceptar-eliminar');
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

        const cancelButton = document.getElementById('btn-cancelar-eliminar');
        if (cancelButton) {
            cancelButton.onclick = closeModal;
        }
    };

    // 14. Agregar nueva solicitud
    const agregarModal = document.getElementById('agregarModal');
    const agregarForm = document.getElementById('agregar-modal-form');

    if (agregarModal && agregarForm) {
        document.getElementById('btn-agregar-solicitud').addEventListener('click', () => {
            agregarModal.style.display = 'block';
        });

        agregarForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/solicitudes_tutor_interno', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Cedula_Docente: document.getElementById('agregar-cedula-docente').value,
                        Nombre_Docente: document.getElementById('agregar-nombre-docente').value,
                        Cedula_Solicitante: document.getElementById('agregar-cedula-solicitante').value,
                        Nombre_Estudiante: document.getElementById('agregar-nombre-estudiante').value,
                        Fecha_Solicitud: document.getElementById('agregar-fecha-solicitud').value,
                        Estado: document.getElementById('agregar-estatus').value
                    }),
                });

                if (!response.ok) throw new Error('Error al agregar la solicitud');

                await tablaSolicitudes.cargarDatos();
                agregarForm.reset();
                agregarModal.style.display = 'none';
                alert('Solicitud agregada correctamente');
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

        document.getElementById('cancelar-agregar-modal').addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });
    }

    // 15. Inicializar la tabla
    tablaSolicitudes.cargarDatos().then(() => {
        console.log('Tabla de solicitudes cargada correctamente');
    }).catch(error => {
        console.error('Error al cargar la tabla:', error);
    });
});