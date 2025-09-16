import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para notas
    const tablaNotas = new GenericTable(
        'calificaciones', // Nombre de la tabla en la base de datos
        'tabla-notas', // ID de la tabla HTML
        ['ID', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Carrera', 'Trayecto', 'Sem/Trim', 'Seccion', 
         'Unidad_Curricular', 'Cedula_Docente', 'Nombre_Docente', 'Estado', 'Calificacion_Numerica', 
         'Calificacion_Cualitativa', 'Periodo_Academico'], // Todas las columnas
        ['Periodo_Academico', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Unidad_Curricular', 
         'Calificacion_Numerica', 'Calificacion_Cualitativa', 'Nombre_Docente'], // Columnas a mostrar
        true
    );

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-notas');
    const botonBuscar = document.querySelector('.btn-buscar-notas');
    const btnReajustar = document.querySelector('.btn-reajustar-notas');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para formatear las calificaciones cualitativas
    const formatearCalificaciones = () => {
        const filas = document.querySelectorAll('#tabla-notas tbody tr');
        
        filas.forEach(fila => {
            const calificacionCell = fila.cells[5]; // Columna de Calificación Cualitativa
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

        formatearCalificaciones();
        actualizarPaginacion();
    };

    // Eventos de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-notas tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        formatearCalificaciones();
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
        
        formatearCalificaciones();
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
            if (i === currentPage) button.classList.add('activo');
            
            button.addEventListener('click', () => {
                currentPage = i;
                displayRows(currentPage);
                updatePaginationButtons();
            });
            
            pageButtonsContainer.appendChild(button);
        }
    };

    // Función para cargar datos en selects
    const cargarSelect = async (url, selectId, valueField, textField) => {
        try {
            const token = getToken();
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al cargar datos');

            const data = await response.json();
            const select = document.getElementById(selectId);
            
            // Limpiar select manteniendo la primera opción
            while (select.options.length > 1) {
                select.remove(1);
            }

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
    };

    // Cargar datos para los selects
    const cargarDatosSelects = async () => {
        await Promise.all([
            cargarSelect('/api/periodo_academico', 'agregar-periodo', 'Periodo_Academico', 'Periodo_Academico'),
            cargarSelect('/api/asignaturas', 'agregar-asignatura', 'Codigo_Asignatura', 'Codigo_Asignatura'),
            cargarSelect('/api/carreras', 'agregar-carrera', 'Codigo_Carrera', 'Nombre_Carrera')
        ]);
    };

    // Validar campos numéricos
    const validarCamposNumericos = () => {
        const trayecto = document.getElementById('agregar-trayecto').value.trim();
        const semTrim = document.getElementById('agregar-sem-trim').value.trim();
        
        // Validar que sean números
        if (isNaN(trayecto)) {
            alert('El trayecto debe ser un valor numérico');
            return false;
        }
        
        if (isNaN(semTrim)) {
            alert('El semestre/trimestre debe ser un valor numérico');
            return false;
        }
        
        // Validar rangos
        if (trayecto < 1 || trayecto > 4) {
            alert('El trayecto debe estar entre 1 y 4');
            return false;
        }
        
        if (semTrim < 1 || semTrim > 6) {
            alert('El semestre/trimestre debe estar entre 1 y 3');
            return false;
        }
        
        return true;
    };

    // Manejador para agregar notas
    document.getElementById('btn-agregar-nota').addEventListener('click', () => {
        const modal = document.getElementById('agregarNotasModal');
        modal.style.display = 'block';
        
        // Limpiar formulario
        document.getElementById('agregar-nota-modal-form').reset();
        
        // Rellenar automáticamente los campos del docente
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const docente = JSON.parse(userData);
                document.getElementById('agregar-cedula-docente').value = docente.cedula || '';
                document.getElementById('agregar-usuario-responsable').value = docente.nombre || 'Docente no identificado';
            }
        } catch (error) {
            console.error('Error al cargar datos del docente:', error);
        }
        
        cargarDatosSelects();
    });

    // Formulario para agregar notas
    document.getElementById('agregar-nota-modal-form').onsubmit = async (e) => {
        e.preventDefault();
        
        // Validar campos numéricos
        if (!validarCamposNumericos()) return;
        
        // Validar que se haya seleccionado una carrera
        if (document.getElementById('agregar-carrera').value === '') {
            alert('Por favor seleccione una carrera');
            return;
        }

        // Obtener datos del formulario
        const nuevaNota = {
            Periodo_Academico: document.getElementById('agregar-periodo').value,
            Cedula_Estudiante: document.getElementById('agregar-cedula-estudiante').value,
            Nombre_Estudiante: document.getElementById('agregar-estudiante').value,
            Carrera: document.getElementById('agregar-carrera').value,
            Trayecto: document.getElementById('agregar-trayecto').value,
            'Sem/Trim': document.getElementById('agregar-sem-trim').value,
            Seccion: document.getElementById('agregar-seccion').value,
            Unidad_Curricular: document.getElementById('agregar-asignatura').value,
            Cedula_Docente: document.getElementById('agregar-cedula-docente').value,
            Nombre_Docente: document.getElementById('agregar-usuario-responsable').value,
            Estado: document.getElementById('agregar-estado').value,
            Calificacion_Numerica: document.getElementById('agregar-calificacion').value,
            Calificacion_Cualitativa: document.getElementById('agregar-calificacion-cualitativa').value
        };

        try {
            const token = getToken();
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch('/api/calificaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(nuevaNota)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar nota');
            }

            document.getElementById('agregarNotasModal').style.display = 'none';
            await tablaNotas.cargarDatos();
            clonarFilasOriginales();
            actualizarPaginacion();
            
            alert('Nota agregada exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar nota: ' + error.message);
        }
    };

    // Manejador para eliminar notas
    tablaNotas.onEliminar = (id) => {
        const modal = document.getElementById('eliminarNotaModal');
        modal.style.display = 'block';

        document.getElementById('btn-aceptar-eliminar-nota').onclick = async () => {
            try {
                const token = getToken();
                const response = await fetch(`/api/calificaciones/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Error al eliminar nota');

                modal.style.display = 'none';
                await tablaNotas.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
                
                alert('Nota eliminada exitosamente');
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar nota: ' + error.message);
            }
        };

        document.getElementById('btn-cancelar-eliminar-nota').onclick = () => {
            modal.style.display = 'none';
        };

        document.querySelector('.eliminar-close').onclick = () => {
            modal.style.display = 'none';
        };
    };

    // Cerrar modales
    document.querySelector('.agregar-close').addEventListener('click', () => {
        document.getElementById('agregarNotasModal').style.display = 'none';
    });

    document.getElementById('cancelar-agregar-nota-modal').addEventListener('click', () => {
        document.getElementById('agregarNotasModal').style.display = 'none';
    });

    // Inicialización
    const inicializar = async () => {
        try {
            await cargarDatosSelects();
            await tablaNotas.cargarDatos();
            formatearCalificaciones();
            clonarFilasOriginales();
            actualizarPaginacion();
        } catch (error) {
            console.error('Error en inicialización:', error);
            alert('Error al cargar los datos iniciales');
        }
    };

    inicializar();
});