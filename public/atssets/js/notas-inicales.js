import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración inicial de la tabla (sin opción de editar)
    const tablaNotas = new GenericTable(
        'calificaciones',
        'tabla-notas',
        ['Periodo_Academico', 'Nombre_Estudiante', 'Unidad_Curricular', 'Calificacion_Numerica', 'Calificacion_Cualitativa', 'Nombre_Docente'],
        ['Periodo', 'Estudiante', 'Asignatura', 'Calificación', 'Calificación Cualitativa', 'Usuario Responsable'],
        false // Deshabilitar edición
    );

    // 2. Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // 3. Variables para paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-notas');
    const botonBuscar = document.querySelector('.btn-buscar-notas');
    const btnReajustar = document.querySelector('.btn-reajustar-notas');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // 4. Función para aplicar estilos de calificación cualitativa
    const aplicarEstilosCalificacion = () => {
        document.querySelectorAll('#tabla-notas tbody tr').forEach(row => {
            const calificacionCell = row.cells[4];
            if (calificacionCell) {
                const calificacion = calificacionCell.textContent.trim().toLowerCase();
                calificacionCell.className = `calificacion-cualitativa ${calificacion}`;
                calificacionCell.innerHTML = `<span class="circulo-estatus"></span>${
                    calificacion === 'aprobado' ? 'Aprobado' : 'Reprobado'
                }`;
            }
        });
    };

    // 5. Función para clonar filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-notas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // 6. Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-notas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const periodo = fila.cells[0].textContent.toLowerCase();
            const estudiante = fila.cells[1].textContent.toLowerCase();
            const asignatura = fila.cells[2].textContent.toLowerCase();
            const calificacion = fila.cells[3].textContent.toLowerCase();
            const docente = fila.cells[5].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                periodo.includes(textoBusqueda) || 
                estudiante.includes(textoBusqueda) ||
                asignatura.includes(textoBusqueda) ||
                calificacion.includes(textoBusqueda) ||
                docente.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        aplicarEstilosCalificacion();
        actualizarPaginacion();
        tablaNotas.asignarEventosEliminar(); // Solo asignar eventos de eliminar
    };

    // 7. Funciones de paginación
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-notas tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-notas').textContent =
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

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

    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-notas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // 8. Eventos de búsqueda y paginación
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        filtrarTabla();
    });

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

    // 9. Función para cargar datos en selects dinámicos
    const cargarSelectsDinamicos = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Cargar periodos académicos
            const periodosResponse = await fetch('/api/periodo_academico', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const periodos = await periodosResponse.json();
            const selectPeriodo = document.getElementById('agregar-periodo');
            periodos.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.Periodo_Academico;
                option.textContent = periodo.Periodo_Academico;
                selectPeriodo.appendChild(option);
            });

            // Cargar estudiantes
            const estudiantesResponse = await fetch('/api/estudiantes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const estudiantes = await estudiantesResponse.json();
            const selectEstudiante = document.getElementById('agregar-estudiante');
            estudiantes.forEach(estudiante => {
                const option = document.createElement('option');
                option.value = estudiante.Cedula;
                option.textContent = `${estudiante.Nombres} ${estudiante.Apellidos} (${estudiante.Cedula})`;
                selectEstudiante.appendChild(option);
            });

            // Cargar asignaturas
            const asignaturasResponse = await fetch('/api/asignaturas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const asignaturas = await asignaturasResponse.json();
            const selectAsignatura = document.getElementById('agregar-asignatura');
            asignaturas.forEach(asignatura => {
                const option = document.createElement('option');
                option.value = asignatura.Codigo_Asignatura;
                option.textContent = asignatura.Codigo_Asignatura;
                selectAsignatura.appendChild(option);
            });

            // Cargar docentes (usuarios responsables)
            const docentesResponse = await fetch('/api/docentes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const docentes = await docentesResponse.json();
            const selectDocente = document.getElementById('agregar-usuario-responsable');
            docentes.forEach(docente => {
                const option = document.createElement('option');
                option.value = docente.Cedula;
                option.textContent = `${docente.Nombres} ${docente.Apellidos} (${docente.Cedula})`;
                selectDocente.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar selects dinámicos:', error);
        }
    };

    // 10. Sobrescribir cargarDatos para formateo adicional
    const originalCargarDatos = tablaNotas.cargarDatos.bind(tablaNotas);
    tablaNotas.cargarDatos = async function() {
        await originalCargarDatos();
        
        aplicarEstilosCalificacion();
        clonarFilasOriginales();
        actualizarPaginacion();
    };

    // 11. Método para eliminar (simplificado)
    tablaNotas.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarNotaModal');
        eliminarModal.style.display = 'block';

        document.getElementById('btn-aceptar-eliminar-nota').onclick = async () => {
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
                
                eliminarModal.style.display = 'none';
                await tablaNotas.cargarDatos();
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
        document.getElementById('btn-cancelar-eliminar-nota').addEventListener('click', () => {
            eliminarModal.style.display = 'none';
        });
    };

    // 12. Agregar nueva nota
    document.getElementById('btn-agregar-nota').addEventListener('click', () => {
        document.getElementById('agregarNotaModal').style.display = 'block';
    });

    const agregarForm = document.getElementById('agregar-nota-modal-form');
    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Obtener valores de los selects
            const estudianteSeleccionado = document.getElementById('agregar-estudiante').value;
            const asignaturaSeleccionada = document.getElementById('agregar-asignatura').value;
            const docenteSeleccionado = document.getElementById('agregar-usuario-responsable').value;

            const response = await fetch('/api/calificaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Periodo_Academico: document.getElementById('agregar-periodo').value,
                    Cedula_Estudiante: estudianteSeleccionado,
                    Unidad_Curricular: asignaturaSeleccionada,
                    Calificacion_Numerica: document.getElementById('agregar-calificacion').value,
                    Calificacion_Cualitativa: document.getElementById('agregar-calificacion-cualitativa').value,
                    Cedula_Docente: docenteSeleccionado
                }),
            });

            if (!response.ok) throw new Error('Error al agregar la nota');

            await tablaNotas.cargarDatos();
            clonarFilasOriginales();
            actualizarPaginacion();
            
            agregarForm.reset();
            document.getElementById('agregarNotaModal').style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert(`Error al agregar: ${error.message}`);
        }
    });

    // Cerrar modal de agregar
    document.querySelector('.agregar-close').addEventListener('click', () => {
        document.getElementById('agregarNotaModal').style.display = 'none';
        agregarForm.reset();
    });
    document.getElementById('cancelar-agregar-nota-modal').addEventListener('click', () => {
        document.getElementById('agregarNotaModal').style.display = 'none';
        agregarForm.reset();
    });

    // 13. Inicializar la tabla y los selects dinámicos
    Promise.all([
        tablaNotas.cargarDatos(),
        cargarSelectsDinamicos()
    ]).then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});