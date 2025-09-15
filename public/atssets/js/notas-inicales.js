import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para calificaciones
    const tablaCalificaciones = new GenericTable(
        'calificaciones', // Nombre de la tabla en la base de datos
        'tabla-notas', // ID de la tabla HTML
        ['ID', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Carrera', 'Trayecto', 'Sem/Trim', 'Seccion', 'Unidad_Curricular', 'Cedula_Docente', 'Nombre_Docente', 'Estado', 'Calificacion_Numerica', 'Calificacion_Cualitativa', 'Periodo_Academico'], // Todas las columnas
        ['Periodo_Academico', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Unidad_Curricular', 'Calificacion_Numerica', 'Calificacion_Cualitativa', 'Nombre_Docente'] // Columnas a mostrar
    );

    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-notas');
    const botonBuscar = document.querySelector('.btn-buscar-notas');
    const btnReajustar = document.querySelector('.btn-reajustar-notas');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para cargar los periodos académicos
    const cargarPeriodosAcademicos = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/periodo_academico', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar periodos académicos');

            const data = await response.json();
            const agregarSelect = document.getElementById('agregar-periodo');

            // Limpiar select
            agregarSelect.innerHTML = '<option value="">Seleccione un periodo</option>';

            if (data.length === 0) {
                agregarSelect.innerHTML = '<option value="">No hay periodos disponibles</option>';
                return;
            }

            // Llenar select con los periodos académicos
            data.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.Periodo_Academico;
                option.textContent = periodo.Periodo_Academico;
                agregarSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar periodos académicos:', error);
            document.getElementById('agregar-periodo').innerHTML = '<option value="">Error al cargar periodos</option>';
        }
    };

    // Función para cargar las asignaturas
    const cargarAsignaturas = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/asignaturas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar asignaturas');

            const data = await response.json();
            const agregarSelect = document.getElementById('agregar-asignatura');

            // Limpiar select
            agregarSelect.innerHTML = '<option value="">Seleccione una asignatura</option>';

            if (data.length === 0) {
                agregarSelect.innerHTML = '<option value="">No hay asignaturas disponibles</option>';
                return;
            }

            // Llenar select con las asignaturas (usando Codigo_Asignatura)
            data.forEach(asignatura => {
                const option = document.createElement('option');
                option.value = asignatura.Codigo_Asignatura;
                option.textContent = asignatura.Codigo_Asignatura;
                agregarSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar asignaturas:', error);
            document.getElementById('agregar-asignatura').innerHTML = '<option value="">Error al cargar asignaturas</option>';
        }
    };

    // Función para formatear el contenido de las celdas especiales
    const formatearCeldasEspeciales = () => {
        const filas = document.querySelectorAll('#tabla-notas tbody tr');
        
        filas.forEach(fila => {
            // Formatear Calificacion_Cualitativa (columna 5 en la tabla mostrada)
            const calificacionCell = fila.cells[5];
            const calificacionValue = calificacionCell.textContent.trim().toLowerCase();
            
            if (calificacionValue === 'aprobado') {
                calificacionCell.innerHTML = '<span class="estado-nota-aprobado">Aprobado</span>';
            } else if (calificacionValue === 'reprobado') {
                calificacionCell.innerHTML = '<span class="estado-nota-reprobado">Reprobado</span>';
            }
        });
    };

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-notas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-notas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const periodo = fila.cells[0].textContent.toLowerCase();
            const cedula = fila.cells[1].textContent.toLowerCase();
            const estudiante = fila.cells[2].textContent.toLowerCase();
            const asignatura = fila.cells[3].textContent.toLowerCase();
            const calificacion = fila.cells[4].textContent.toLowerCase();
            const calificacionCualitativa = fila.cells[5].textContent.toLowerCase();
            const docente = fila.cells[6].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                                  periodo.includes(textoBusqueda) || 
                                  cedula.includes(textoBusqueda) || 
                                  estudiante.includes(textoBusqueda) || 
                                  asignatura.includes(textoBusqueda) || 
                                  calificacion.includes(textoBusqueda) || 
                                  calificacionCualitativa.includes(textoBusqueda) || 
                                  docente.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-notas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-notas tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-notas').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        // Reasignar eventos para las filas visibles
        formatearCeldasEspeciales();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-notas');
        const nextButton = document.querySelector('.pagina-siguiente-notas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-notas');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-notas');
            button.textContent = i;
            button.classList.toggle('activo', i === currentPage);

            button.addEventListener('click', () => {
                currentPage = i;
                displayRows(currentPage);
                updatePaginationButtons();
            });

            pageButtonsContainer.appendChild(button);
        }
    };

    // Función para actualizar la paginación
    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-notas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior-notas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-notas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Métodos para agregar - MODIFICADO PARA QUE EL MODAL NO SE MUESTRE POR DEFECTO
    document.getElementById('btn-agregar-nota').addEventListener('click', () => {
        const agregarNotasModal = document.getElementById('agregarNotaModal');
        agregarNotasModal.style.display = 'block';

        // Limpiar el formulario
        document.getElementById('agregar-periodo').value = '';
        document.getElementById('agregar-cedula-estudiante').value = '';
        document.getElementById('agregar-estudiante').value = '';
        document.getElementById('agregar-asignatura').value = '';
        document.getElementById('agregar-calificacion').value = '';
        document.getElementById('agregar-calificacion-cualitativa').value = 'aprobado';
        document.getElementById('agregar-usuario-responsable').value = '';
    });

    document.getElementById('agregar-nota-modal-form').onsubmit = async (event) => {
        event.preventDefault();
        
        const nuevaCalificacion = {
            Periodo_Academico: document.getElementById('agregar-periodo').value,
            Cedula_Estudiante: document.getElementById('agregar-cedula-estudiante').value,
            Nombre_Estudiante: document.getElementById('agregar-estudiante').value,
            Unidad_Curricular: document.getElementById('agregar-asignatura').value,
            Calificacion_Numerica: document.getElementById('agregar-calificacion').value,
            Calificacion_Cualitativa: document.getElementById('agregar-calificacion-cualitativa').value,
            Nombre_Docente: document.getElementById('agregar-usuario-responsable').value
        };

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/calificaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(nuevaCalificacion),
            });

            if (!response.ok) throw new Error('Error al agregar la calificación');
            
            // Cerrar modal y recargar datos
            document.getElementById('agregarNotaModal').style.display = 'none';
            tablaCalificaciones.cargarDatos().then(() => {
                formatearCeldasEspeciales();
                clonarFilasOriginales();
                actualizarPaginacion();
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Métodos para eliminar
    tablaCalificaciones.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarNotaModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar-nota');
        const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar-nota');
        const eliminarClose = document.querySelector('.eliminar-close');

        const eliminarRegistro = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/calificaciones/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                tablaCalificaciones.cargarDatos().then(() => {
                    formatearCeldasEspeciales();
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
            } catch (error) {
                console.error('Error:', error);
            } finally {
                eliminarModal.style.display = 'none';
            }
        };

        btnAceptarEliminar.onclick = eliminarRegistro;
        btnCancelarEliminar.onclick = () => eliminarModal.style.display = 'none';
        eliminarClose.onclick = () => eliminarModal.style.display = 'none';
    };

    // Eventos para cerrar modales
    document.querySelector('.agregar-close').addEventListener('click', () => {
        document.getElementById('agregarNotaModal').style.display = 'none';
    });

    document.getElementById('cancelar-agregar-nota-modal').addEventListener('click', () => {
        document.getElementById('agregarNotaModal').style.display = 'none';
    });

    // Inicialización - Asegurarse de que el modal esté oculto al cargar
    document.getElementById('agregarNotaModal').style.display = 'none';
    document.getElementById('eliminarNotaModal').style.display = 'none';

    tablaCalificaciones.cargarDatos().then(() => {
        formatearCeldasEspeciales();
        clonarFilasOriginales();
        actualizarPaginacion();
    });

    // Cargar datos necesarios para los selects
    cargarPeriodosAcademicos();
    cargarAsignaturas();
});