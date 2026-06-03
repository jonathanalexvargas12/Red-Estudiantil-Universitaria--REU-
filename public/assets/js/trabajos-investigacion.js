import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

// Para que se desplieguen los filtros
const btnFiltrarInvestigaciones = document.getElementById('btn-filtrar-investigaciones');
const filtrosBusquedaInvestigaciones = document.getElementById('filtros-busqueda-investigaciones');

btnFiltrarInvestigaciones.addEventListener('click', () => {
    filtrosBusquedaInvestigaciones.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para trabajos de investigación
    const tablaInvestigaciones = new GenericTable(
        'trabajo_investigacion',
        'tabla-investigaciones',
        ['ID', 'Nombre_Investigacion', 'Carrera', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Tutor_Cedula', 'Tutor_Nombre', 'Area_Interes', 'Periodo_Academico', 'Estado', 'ID_Solicitud'],
        ['Tutor_Nombre', 'Tutor_Cedula', 'Nombre_Estudiante', 'Cedula_Estudiante', 'Carrera', 'Periodo_Academico', 'Estado', 'Nombre_Investigacion', 'Area_Interes']
    );

    const originalActualizarTablaInv = tablaInvestigaciones.actualizarTabla.bind(tablaInvestigaciones);
    tablaInvestigaciones.actualizarTabla = function(datos) {
        originalActualizarTablaInv(datos);
        const filas = document.querySelectorAll('#tabla-investigaciones tbody tr');
        datos.forEach((item, index) => {
            if (filas[index]) {
                filas[index].setAttribute('data-id-solicitud', item.ID_Solicitud || '');
                const accionesCell = filas[index].querySelector('.acciones-cell');
                if (!accionesCell) return;
                const idSolicitud = item.ID_Solicitud;
                const newCell = document.createElement('td');
                if (idSolicitud && idSolicitud !== 'null' && idSolicitud !== '') {
                    newCell.innerHTML = '<span class="badge badge-solicitud">Solicitud</span>';
                } else {
                    newCell.innerHTML = '<span class="badge badge-directo">Directo</span>';
                }
                filas[index].insertBefore(newCell, accionesCell);
            }
        });
    };

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Variables para la paginación y búsqueda
    const buscarInput = document.getElementById('buscar-input-investigaciones');
    const botonBuscar = document.querySelector('.btn-buscar-investigaciones');
    const btnReajustar = document.getElementById('btn-reajustar-investigaciones');
    const estadoSelect = document.getElementById('estatus-select-investigaciones');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para formatear el estado con iconos
    const formatearEstados = () => {
        const filas = document.querySelectorAll('#tabla-investigaciones tbody tr');
        
        filas.forEach(fila => {
            const estadoCell = fila.cells[6]; // Columna de Estado (ajustado por nueva columna)
            const estadoValue = estadoCell.textContent.trim().toLowerCase();
            
            if (estadoValue === 'en progreso') {
                estadoCell.innerHTML = '<span class="estatus-circulo en-progreso"></span> En progreso';
            } else if (estadoValue === 'aprobado') {
                estadoCell.innerHTML = '<span class="estatus-circulo aprobado"></span> Aprobado';
            } else if (estadoValue === 'reprobado') {
                estadoCell.innerHTML = '<span class="estatus-circulo reprobado"></span> Reprobado';
            }
        });
    };

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-investigaciones tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estadoFiltro = estadoSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-investigaciones tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const tutor = fila.cells[0].textContent.toLowerCase();
            const tutorCedula = fila.cells[1].textContent.toLowerCase();
            const estudiante = fila.cells[2].textContent.toLowerCase();
            const cedula = fila.cells[3].textContent.toLowerCase();
            const carrera = fila.cells[4].textContent.toLowerCase();
            const periodo = fila.cells[5].textContent.toLowerCase();
            const nombreInvestigacion = fila.cells[7].textContent.toLowerCase();
            const areaInteres = fila.cells[8].textContent.toLowerCase();
            
            // Obtener el estado real (del icono o texto)
            const estadoCell = fila.cells[6];
            let estadoValue = '';
            const estadoIcon = estadoCell.querySelector('.estatus-circulo');
            
            if (estadoIcon) {
                if (estadoIcon.classList.contains('en-progreso')) {
                    estadoValue = 'en progreso';
                } else if (estadoIcon.classList.contains('aprobado')) {
                    estadoValue = 'aprobado';
                } else if (estadoIcon.classList.contains('reprobado')) {
                    estadoValue = 'reprobado';
                }
            } else {
                estadoValue = estadoCell.textContent.trim().toLowerCase();
            }

            const coincideBusqueda = textoBusqueda === '' || 
                                  tutor.includes(textoBusqueda) || 
                                  tutorCedula.includes(textoBusqueda) ||
                                  estudiante.includes(textoBusqueda) || 
                                  cedula.includes(textoBusqueda) || 
                                  carrera.includes(textoBusqueda) || 
                                  periodo.includes(textoBusqueda) ||
                                  nombreInvestigacion.includes(textoBusqueda) ||
                                  areaInteres.includes(textoBusqueda);

            const coincideEstado = estadoFiltro === '' || estadoValue === estadoFiltro;

            if (coincideBusqueda && coincideEstado) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        formatearEstados();
        tablaInvestigaciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Eventos de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estadoSelect.value = '';
        const tbody = document.querySelector('#tabla-investigaciones tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        formatearEstados();
        tablaInvestigaciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-investigaciones tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-investigaciones').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        formatearEstados();
        tablaInvestigaciones.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-investigaciones',
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
        const filas = document.querySelectorAll('#tabla-investigaciones tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = Math.min(currentPage, totalPages);
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Función para cargar datos en un select
    async function cargarSelect(url, selectId, valueField, textField) {
        try {
            const token = getToken();
            if (!token) throw new Error('Token no encontrado');

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error en la respuesta');

            const data = await response.json();
            const select = document.getElementById(selectId);
            
            // Limpiar select manteniendo la primera opción
            while (select.options.length > 1) {
                select.remove(1);
            }

            if (data.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay datos disponibles';
                option.disabled = true;
                select.appendChild(option);
                return;
            }

            // Agregar nuevas opciones
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField] || item[valueField];
                select.appendChild(option);
            });

        } catch (error) {
            console.error(`Error cargando ${selectId}:`, error);
            const select = document.getElementById(selectId);
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Error cargando datos';
            option.disabled = true;
            select.appendChild(option);
        }
    }

    // Cargar datos para modales
    async function cargarDatosParaModales() {
        try {
            await Promise.all([
                cargarSelect('/api/carreras', 'agregar-carrera', 'Codigo_Carrera', 'Codigo_Carrera'),
                cargarSelect('/api/periodo_academico', 'agregar-periodo-academico', 'Periodo_Academico', 'Periodo_Academico'),
                cargarSelect('/api/carreras', 'editar-carrera', 'Codigo_Carrera', 'Codigo_Carrera'),
                cargarSelect('/api/periodo_academico', 'editar-periodo-academico', 'Periodo_Academico', 'Periodo_Academico')
            ]);
        } catch (error) {
            console.error('Error cargando datos para modales:', error);
        }
    }

    // Manejador para editar - Versión optimizada
    tablaInvestigaciones.onEditar = async (id, datos) => {
        console.log('Iniciando edición para ID:', id);
        
        const modal = document.getElementById('editarModal');
        if (!modal) {
            console.error('Modal de edición no encontrado');
            return;
        }
        
        // Mostrar el modal inmediatamente
        modal.style.display = 'block';

        try {
            // Cargar datos para los selects
            await cargarDatosParaModales();

            // Llenar el formulario - Asegurando el orden correcto de los datos
            document.getElementById('editar-id').value = id;
            document.getElementById('editar-tutor-nombre').value = datos[0]; // Tutor_Nombre
            document.getElementById('editar-tutor-cedula').value = datos[1]; // Tutor_Cedula
            document.getElementById('editar-nombre-estudiante').value = datos[2]; // Nombre_Estudiante
            document.getElementById('editar-cedula-estudiante').value = datos[3]; // Cedula_Estudiante
            document.getElementById('editar-carrera').value = datos[4]; // Carrera
            document.getElementById('editar-periodo-academico').value = datos[5]; // Periodo_Academico
            document.getElementById('editar-estado').value = datos[6]; // Estado
            document.getElementById('editar-nombre-investigacion').value = datos[7]; // Nombre_Investigacion
            document.getElementById('editar-area-interes').value = datos[8]; // Area_Interes

            console.log('Formulario de edición llenado correctamente');
        } catch (error) {
            console.error('Error al preparar el modal de edición:', error);
            modal.style.display = 'none';
            alert('Error al preparar los datos para editar');
        }

        // Configurar el submit del formulario
        const form = document.getElementById('editar-modal-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/trabajo_investigacion/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Tutor_Nombre: document.getElementById('editar-tutor-nombre').value,
                        Tutor_Cedula: document.getElementById('editar-tutor-cedula').value,
                        Nombre_Estudiante: document.getElementById('editar-nombre-estudiante').value,
                        Cedula_Estudiante: document.getElementById('editar-cedula-estudiante').value,
                        Carrera: document.getElementById('editar-carrera').value,
                        Periodo_Academico: document.getElementById('editar-periodo-academico').value,
                        Estado: document.getElementById('editar-estado').value,
                        Nombre_Investigacion: document.getElementById('editar-nombre-investigacion').value,
                        Area_Interes: document.getElementById('editar-area-interes').value
                    }),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                
                await tablaInvestigaciones.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
                modal.style.display = 'none';
            } catch (error) {
                console.error('Error al editar:', error);
                alert(`Error al editar: ${error.message}`);
            }
        };

        // Configurar cierre del modal
        const closeElements = [
            document.querySelector('#editarModal .close'),
            document.getElementById('cancelar-editar-modal')
        ];
        
        closeElements.forEach(el => {
            if (el) el.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        });
    };

    // Manejador para eliminar
    tablaInvestigaciones.onEliminar = (id) => {
        const modal = document.getElementById('eliminarModal');
        modal.style.display = 'block';

        const btnAceptar = document.getElementById('btn-aceptar-eliminar');
        const btnCancelar = document.getElementById('btn-cancelar-eliminar');

        // Limpiar eventos anteriores
        btnAceptar.replaceWith(btnAceptar.cloneNode(true));
        btnCancelar.replaceWith(btnCancelar.cloneNode(true));
        
        const nuevoBtnAceptar = document.getElementById('btn-aceptar-eliminar');
        const nuevoBtnCancelar = document.getElementById('btn-cancelar-eliminar');

        nuevoBtnAceptar.onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/trabajo_investigacion/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                
                await tablaInvestigaciones.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
                modal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al eliminar: ${error.message}`);
            }
        };

        nuevoBtnCancelar.onclick = () => {
            modal.style.display = 'none';
        };

        const eliminarClose = document.querySelector('.eliminar-close');
        if (eliminarClose) {
            eliminarClose.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    };

    // Agregar nueva investigación
    const agregarForm = document.getElementById('agregar-modal-form');
    const agregarModal = document.getElementById('agregarModal');

    document.getElementById('btn-agregar-investigacion').addEventListener('click', async () => {
        try {
            await cargarDatosParaModales();
            agregarModal.style.display = 'block';
        } catch (error) {
            console.error('Error al preparar modal de agregar:', error);
        }
    });

    agregarForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/trabajo_investigacion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Tutor_Nombre: document.getElementById('agregar-tutor-nombre').value,
                    Tutor_Cedula: document.getElementById('agregar-tutor-cedula').value,
                    Nombre_Estudiante: document.getElementById('agregar-nombre-estudiante').value,
                    Cedula_Estudiante: document.getElementById('agregar-cedula-estudiante').value,
                    Carrera: document.getElementById('agregar-carrera').value,
                    Periodo_Academico: document.getElementById('agregar-periodo-academico').value,
                    Estado: document.getElementById('agregar-estado').value,
                    Nombre_Investigacion: document.getElementById('agregar-nombre-investigacion').value,
                    Area_Interes: document.getElementById('agregar-area-interes').value
                }),
            });

            if (!response.ok) throw new Error('Error al agregar la investigación');

            await tablaInvestigaciones.cargarDatos();
            clonarFilasOriginales();
            actualizarPaginacion();

            agregarModal.style.display = 'none';
            agregarForm.reset();
        } catch (error) {
            console.error('Error:', error);
            alert(`Error al agregar: ${error.message}`);
        }
    };

    // Cerrar modal de agregar
    const agregarClose = document.querySelector('.agregar-close');
    if (agregarClose) {
        agregarClose.addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });
    }

    const cancelarAgregar = document.getElementById('cancelar-agregar-modal');
    if (cancelarAgregar) {
        cancelarAgregar.addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });
    }

    // Inicialización
    tablaInvestigaciones.cargarDatos().then(() => {
        formatearEstados();
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});