import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para asignaturas
    const tablaAsignaturas = new GenericTable(
        'asignaturas', // Nombre de la tabla en la base de datos
        'tabla-asignaturas', // ID de la tabla HTML
        ['Codigo_Asignatura', 'Nombre_Asignatura', 'Carrera', 'Trayecto', 'Sem/Trim', 'Valor_UC'], // Todas las columnas
        ['Codigo_Asignatura', 'Nombre_Asignatura'] // Columnas a mostrar en la tabla HTML
    );

    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Función para cargar las carreras desde la API
    const cargarCarreras = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/carreras', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener las carreras');
            
            const carreras = await response.json();
            return carreras;
        } catch (error) {
            console.error('Error al cargar carreras:', error);
            return [];
        }
    };

    // Función para llenar los selects de carreras
    const llenarSelectCarreras = async (selectId) => {
        const select = document.getElementById(selectId);
        select.innerHTML = ''; // Limpiar el select
        
        const carreras = await cargarCarreras();
        
        if (carreras.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'no hay carreras registradas (deben haber carreras registradas para poder registrar asignaturas)';
            option.disabled = true;
            option.selected = true;
            select.appendChild(option);
            return;
        }
        
        // Agregar opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione una carrera';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);
        
        // Agregar cada carrera como opción
        carreras.forEach(carrera => {
            const option = document.createElement('option');
            option.value = carrera.Codigo_Carrera;
            option.textContent = carrera.Nombre_Carrera || carrera.Codigo_Carrera;
            select.appendChild(option);
        });
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-asignaturas');
    const botonBuscar = document.querySelector('.btn-buscar-asignaturas');
    const btnReajustar = document.querySelector('.btn-reajustar-asignaturas');
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas
    let filasOriginales = []; // Almacenar las filas originales

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-asignaturas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-asignaturas tbody');
        tbody.innerHTML = ''; // Limpiar la tabla

        filasOriginales.forEach(fila => {
            const codigoAsignatura = fila.cells[0].textContent.toLowerCase();
            const nombreAsignatura = fila.cells[1].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                                  codigoAsignatura.includes(textoBusqueda) || 
                                  nombreAsignatura.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        tablaAsignaturas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-asignaturas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        tablaAsignaturas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-asignaturas tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-asignaturas').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        tablaAsignaturas.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-asignaturas');
        const nextButton = document.querySelector('.pagina-siguiente-asignaturas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-asignaturas');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-asignaturas');
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
        const filas = document.querySelectorAll('#tabla-asignaturas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior-asignaturas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-asignaturas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicializar la paginación después de cargar los datos
    tablaAsignaturas.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });

    // Configuración del modal de edición con gestión de carreras
    tablaAsignaturas.onEditar = async (id, datos) => {
        const editarModal = document.getElementById('editarAsignaturaModal');
        const editarForm = document.getElementById('editar-asignatura-modal-form');

        // Cargar carreras en el select
        await llenarSelectCarreras('editar-carrera');

        // Llenar el modal con los datos actuales
        document.getElementById('editar-codigo-asignatura').value = datos[0];
        document.getElementById('editar-nombre-asignatura').value = datos[1];
        document.getElementById('editar-trayecto').value = datos[3];
        document.getElementById('editar-sem-trim').value = datos[4];
        document.getElementById('editar-valor-uc').value = datos[5];

        // Establecer la carrera seleccionada
        const selectCarrera = document.getElementById('editar-carrera');
        if (selectCarrera) {
            selectCarrera.value = datos[2];
        }

        editarModal.style.display = 'block';

        // Guardar cambios
        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Codigo_Asignatura: document.getElementById('editar-codigo-asignatura').value,
                Nombre_Asignatura: document.getElementById('editar-nombre-asignatura').value,
                Carrera: document.getElementById('editar-carrera').value,
                Trayecto: document.getElementById('editar-trayecto').value,
                'Sem/Trim': document.getElementById('editar-sem-trim').value,
                Valor_UC: document.getElementById('editar-valor-uc').value
            };

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/asignaturas/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevosDatos),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                
                tablaAsignaturas.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
                
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
            }
        };

        // Eventos para cerrar el modal
        const editarClose = document.querySelector('.editar-close');
        if (editarClose) {
            editarClose.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }

        const cancelarEditar = document.getElementById('cancelar-editar-asignatura-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

    // Configuración del modal de eliminación
    tablaAsignaturas.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarAsignaturaModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar-asignatura');
        btnAceptarEliminar.onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/asignaturas/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                
                eliminarModal.style.display = 'none';
                tablaAsignaturas.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const eliminarClose = document.querySelector('.eliminar-close');
        if (eliminarClose) {
            eliminarClose.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }

        const cancelarEliminar = document.getElementById('btn-cancelar-eliminar-asignatura');
        if (cancelarEliminar) {
            cancelarEliminar.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }
    };

    // Configuración del modal de agregar con gestión de carreras
    const btnAgregar = document.getElementById('btn-agregar-asignatura');
    btnAgregar.addEventListener('click', async () => {
        const agregarModal = document.getElementById('agregarAsignaturaModal');
        if (agregarModal) {
            await llenarSelectCarreras('agregar-carrera');
            agregarModal.style.display = 'block';
        } else {
            console.error('Modal de agregar no encontrado: agregarAsignaturaModal');
        }
    });

    // Evento para el formulario de agregar
    const agregarForm = document.getElementById('agregar-asignatura-modal-form');
    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const codigo = document.getElementById('agregar-codigo-asignatura').value;
        const nombre = document.getElementById('agregar-nombre-asignatura').value;
        const carrera = document.getElementById('agregar-carrera').value;
        const trayecto = document.getElementById('agregar-trayecto').value;
        const semTrim = document.getElementById('agregar-sem-trim').value;
        const valorUC = document.getElementById('agregar-valor-uc').value;

        // Validar carrera seleccionada
        if (!carrera || carrera === '') {
            alert('Por favor seleccione una carrera válida');
            return;
        }

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/asignaturas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Codigo_Asignatura: codigo,
                    Nombre_Asignatura: nombre,
                    Carrera: carrera,
                    Trayecto: trayecto,
                    'Sem/Trim': semTrim,
                    Valor_UC: valorUC
                }),
            });

            if (!response.ok) throw new Error('Error al agregar la asignatura');

            tablaAsignaturas.cargarDatos().then(() => {
                clonarFilasOriginales();
                actualizarPaginacion();
            });

            const agregarModal = document.getElementById('agregarAsignaturaModal');
            if (agregarModal) {
                agregarModal.style.display = 'none';
                agregarForm.reset();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Evento para cerrar el modal de agregar
    const agregarClose = document.querySelector('.agregar-close');
    agregarClose.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarAsignaturaModal');
        if (agregarModal) {
            agregarModal.style.display = 'none';
        }
    });
});