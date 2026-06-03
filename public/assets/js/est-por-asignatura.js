import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para estudiantes por asignatura
    const tablaEstudiantesAsignatura = new GenericTable(
        'calificaciones', // Nombre de la tabla en la base de datos (misma tabla que notas)
        'tabla-estudiante-asignatura', // ID de la tabla HTML
        ['ID', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Carrera', 'Trayecto', 'Sem/Trim', 'Seccion', 
         'Unidad_Curricular', 'Cedula_Docente', 'Nombre_Docente', 'Estado', 'Calificacion_Numerica', 
         'Calificacion_Cualitativa', 'Periodo_Academico'], // Todas las columnas disponibles
        ['Unidad_Curricular', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Carrera', 
         'Sem/Trim', 'Seccion'], // Columnas a mostrar
            {
            disableEdit: true,
            disableDelete: true
        }
         );

      // Sobrescribir el método para no generar acciones
    tablaEstudiantesAsignatura.generarAccionesHTML = function() {
        return '';
    };
    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-estudiante-asignatura');
    const botonBuscar = document.querySelector('.btn-buscar-estudiante-asignatura');
    const btnReajustar = document.querySelector('.btn-reajustar-estudiante-asignatura');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-estudiante-asignatura tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-estudiante-asignatura tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const asignatura = fila.cells[0].textContent.toLowerCase();
            const cedula = fila.cells[1].textContent.toLowerCase();
            const estudiante = fila.cells[2].textContent.toLowerCase();
            const carrera = fila.cells[3].textContent.toLowerCase();
            const semTrim = fila.cells[4].textContent.toLowerCase();
            const seccion = fila.cells[5].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                                  asignatura.includes(textoBusqueda) || 
                                  cedula.includes(textoBusqueda) || 
                                  estudiante.includes(textoBusqueda) || 
                                  carrera.includes(textoBusqueda) || 
                                  semTrim.includes(textoBusqueda) || 
                                  seccion.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
    };

    // Eventos de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-estudiante-asignatura tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-estudiante-asignatura tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-estudiante-asignatura').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    // Función para actualizar la paginación
    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-estudiante-asignatura tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-estudiante-asignatura',
            paginaActual: currentPage,
            totalPaginas: totalPages,
            alCambiarPagina: (pagina) => {
                currentPage = pagina;
                displayRows(currentPage);
                updatePaginationButtons();
            }
        });
    };

    // Función para cargar datos en selects (si es necesario para filtros adicionales)
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

    // Inicialización
    const inicializar = async () => {
        try {
            // Si necesitas cargar filtros adicionales, puedes hacerlo aquí
            // await cargarSelect('/api/asignaturas', 'filtro-asignatura', 'Codigo_Asignatura', 'Nombre_Asignatura');
            
            await tablaEstudiantesAsignatura.cargarDatos();
            clonarFilasOriginales();
            actualizarPaginacion();
        } catch (error) {
            console.error('Error en inicialización:', error);
            alert('Error al cargar los datos iniciales');
        }
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior-estudiante-asignatura').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-estudiante-asignatura').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Iniciar la aplicación
    inicializar();
});