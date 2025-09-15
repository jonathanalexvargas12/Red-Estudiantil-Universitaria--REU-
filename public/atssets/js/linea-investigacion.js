import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para calificaciones
    const tablaCalificaciones = new GenericTable(
        'calificaciones',
        'tabla-calificaciones',
        ['ID', 'Periodo_Academico', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Unidad_Curricular', 
         'Calificacion_Numerica', 'Calificacion_Cualitativa', 'Cedula_Docente', 'Nombre_Docente'],
        ['Periodo_Academico', 'Nombre_Estudiante', 'Unidad_Curricular', 'Calificacion_Numerica', 'Calificacion_Cualitativa', 'Nombre_Docente']
    );

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-calificaciones');
    const botonBuscar = document.querySelector('.btn-buscar-calificaciones');
    const btnReajustar = document.querySelector('.btn-reajustar-calificaciones');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-calificaciones tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-calificaciones tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const periodo = fila.cells[0].textContent.toLowerCase();
            const estudiante = fila.cells[1].textContent.toLowerCase();
            const asignatura = fila.cells[2].textContent.toLowerCase();
            const calificacion = fila.cells[3].textContent.toLowerCase();
            const cualitativa = fila.cells[4].textContent.toLowerCase();
            const docente = fila.cells[5].textContent.toLowerCase();

            if (textoBusqueda === '' || 
                periodo.includes(textoBusqueda) || 
                estudiante.includes(textoBusqueda) || 
                asignatura.includes(textoBusqueda) || 
                calificacion.includes(textoBusqueda) || 
                cualitativa.includes(textoBusqueda) || 
                docente.includes(textoBusqueda)) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        tablaCalificaciones.asignarEventosEliminar();
        actualizarPaginacion();
    };

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-calificaciones tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-calificaciones').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        tablaCalificaciones.asignarEventosEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-calificaciones');
        const nextButton = document.querySelector('.pagina-siguiente-calificaciones');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-calificaciones');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-calificaciones');
            if (i === currentPage) {
                button.classList.add('activo');
            }
            button.textContent = i;
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
        const filas = document.querySelectorAll('#tabla-calificaciones tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = Math.min(currentPage, totalPages);
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Función para cargar select con manejo de errores y formateo
    async function cargarSelect(url, selectId, valueField, textField, formatter = null) {
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
                option.textContent = 'No se encontraron datos registrados';
                option.disabled = true;
                select.appendChild(option);
                return;
            }

            // Agregar nuevas opciones con formateo
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = formatter ? formatter(item) : (item[textField] || item[valueField]);
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

    // Función para cargar estudiantes con formato "Nombres Apellidos (Cédula)"
    async function cargarEstudiantes() {
        try {
            const token = getToken();
            if (!token) throw new Error('Token no encontrado');

            const response = await fetch('/api/estudiantes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error cargando estudiantes');

            const estudiantes = await response.json();
            const select = document.getElementById('agregar-estudiante');
            
            // Limpiar select
            select.innerHTML = '<option value="" disabled selected>Seleccione un estudiante</option>';
            
            if (estudiantes.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay estudiantes registrados';
                option.disabled = true;
                select.appendChild(option);
                return;
            }

            // Llenar select con formato
            estudiantes.forEach(est => {
                const option = document.createElement('option');
                option.value = est.Cedula;
                option.textContent = `${est.Nombres} ${est.Apellidos} (${est.Cedula})`;
                select.appendChild(option);
            });

        } catch (error) {
            console.error('Error cargando estudiantes:', error);
            const select = document.getElementById('agregar-estudiante');
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Error cargando estudiantes';
            option.disabled = true;
            select.appendChild(option);
        }
    }

    // Función para cargar docentes con formato "Nombres Apellidos (Cédula)"
    async function cargarDocentes() {
        try {
            const token = getToken();
            if (!token) throw new Error('Token no encontrado');

            const response = await fetch('/api/docentes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error cargando docentes');

            const docentes = await response.json();
            const select = document.getElementById('agregar-docente');
            
            // Limpiar select
            select.innerHTML = '<option value="" disabled selected>Seleccione un docente</option>';
            
            if (docentes.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay docentes registrados';
                option.disabled = true;
                select.appendChild(option);
                return;
            }

            // Llenar select con formato
            docentes.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.Cedula;
                option.textContent = `${doc.Nombres} ${doc.Apellidos} (${doc.Cedula})`;
                select.appendChild(option);
            });

        } catch (error) {
            console.error('Error cargando docentes:', error);
            const select = document.getElementById('agregar-docente');
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Error cargando docentes';
            option.disabled = true;
            select.appendChild(option);
        }
    }

    // Cargar datos para modal de agregar
    async function cargarDatosAgregar() {
        await Promise.all([
            cargarSelect('/api/periodo_academico', 'agregar-periodo', 'Periodo_Academico', 'Periodo_Academico'),
            cargarSelect('/api/asignaturas', 'agregar-asignatura', 'Codigo_Asignatura', 'Nombre_Asignatura', 
                (asig) => `${asig.Nombre_Asignatura} (${asig.Codigo_Asignatura})`),
            cargarEstudiantes(),
            cargarDocentes()
        ]);
    }

    // Manejador para eliminar
    tablaCalificaciones.onEliminar = (id) => {
        const modal = document.getElementById('eliminarCalificacionModal');
        modal.style.display = 'block';

        document.getElementById('btn-aceptar-eliminar-calificacion').onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/calificaciones/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                modal.style.display = 'none';
                tablaCalificaciones.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al eliminar la calificación: ${error.message}`);
            }
        };

        const eliminarClose = document.querySelector('.eliminar-close');
        if (eliminarClose) {
            eliminarClose.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        const cancelarEliminar = document.getElementById('btn-cancelar-eliminar-calificacion');
        if (cancelarEliminar) {
            cancelarEliminar.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    };

    // Agregar nueva calificación
    const agregarForm = document.getElementById('agregar-calificacion-modal-form');
    const agregarModal = document.getElementById('agregarCalificacionModal');

    document.getElementById('btn-agregar-calificacion').addEventListener('click', async () => {
        await cargarDatosAgregar();
        agregarModal.style.display = 'block';
    });

    agregarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Validar campos requeridos
            const calificacionNumerica = parseFloat(document.getElementById('agregar-calificacion').value);
            if (isNaN(calificacionNumerica)) {
                throw new Error('La calificación debe ser un número válido');
            }

            // Obtener datos de los selects
            const estudianteSelect = document.getElementById('agregar-estudiante');
            const asignaturaSelect = document.getElementById('agregar-asignatura');
            const docenteSelect = document.getElementById('agregar-docente');
            
            // Validar selecciones
            if (!estudianteSelect.value || !asignaturaSelect.value || !docenteSelect.value) {
                throw new Error('Todos los campos son obligatorios');
            }

            // Obtener nombres completos
            const nombreEstudiante = estudianteSelect.options[estudianteSelect.selectedIndex].text.split(' (')[0];
            const nombreAsignatura = asignaturaSelect.options[asignaturaSelect.selectedIndex].text.split(' (')[0];
            const nombreDocente = docenteSelect.options[docenteSelect.selectedIndex].text.split(' (')[0];

            const response = await fetch('/api/calificaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Periodo_Academico: document.getElementById('agregar-periodo').value,
                    Cedula_Estudiante: estudianteSelect.value,
                    Nombre_Estudiante: nombreEstudiante,
                    Unidad_Curricular: asignaturaSelect.options[asignaturaSelect.selectedIndex].text,
                    Calificacion_Numerica: calificacionNumerica,
                    Calificacion_Cualitativa: document.getElementById('agregar-calificacion-cualitativa').value,
                    Cedula_Docente: docenteSelect.value,
                    Nombre_Docente: nombreDocente,
                    Estado: 'Activo'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar la calificación');
            }

            // Mostrar feedback al usuario
            alert('Calificación agregada correctamente');
            
            // Cerrar modal y resetear formulario
            agregarModal.style.display = 'none';
            agregarForm.reset();

            // Actualizar la tabla
            await tablaCalificaciones.cargarDatos();
            clonarFilasOriginales();
            actualizarPaginacion();

        } catch (error) {
            console.error('Error al agregar calificación:', error);
            alert(`Error: ${error.message}\n\nPor favor, verifique los datos e intente nuevamente.`);
        }
    });
    
    // Cerrar modal de agregar
    const agregarClose = document.querySelector('.agregar-close');
    agregarClose.addEventListener('click', () => {
        agregarModal.style.display = 'none';
        agregarForm.reset();
    });

    const cancelarAgregar = document.getElementById('cancelar-agregar-calificacion-modal');
    if (cancelarAgregar) {
        cancelarAgregar.addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });
    }

    // Eventos de búsqueda y reajuste
    botonBuscar.addEventListener('click', filtrarTabla);
    
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-calificaciones tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        tablaCalificaciones.asignarEventosEliminar();
        actualizarPaginacion();
    });

    // Evento para búsqueda al presionar Enter
    buscarInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filtrarTabla();
        }
    });

    // Eventos de paginación
    document.querySelector('.pagina-anterior-calificaciones').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-calificaciones').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicialización
    tablaCalificaciones.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    }); 
});