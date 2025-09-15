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
        return localStorage.getItem('token'); // Asegúrate de que el token se guarde aquí después del login
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

            const coincideBusqueda = textoBusqueda === '' || codigoAsignatura.includes(textoBusqueda) || nombreAsignatura.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true)); // Agregar fila si coincide
            }
        });

        // Reasignar eventos y actualizar paginación
        tablaAsignaturas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-asignaturas tbody');
        tbody.innerHTML = ''; // Limpiar la tabla

        // Restaurar las filas originales
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        tablaAsignaturas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-asignaturas tbody tr');

        filas.forEach((fila, index) => {
            if (index >= start && index < end) {
                fila.style.display = ''; // Mostrar fila
            } else {
                fila.style.display = 'none'; // Ocultar fila
            }
        });

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-asignaturas').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        // Reasignar eventos para las filas visibles
        tablaAsignaturas.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-asignaturas');
        const nextButton = document.querySelector('.pagina-siguiente-asignaturas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-asignaturas');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-asignaturas');
            button.textContent = i;
            button.classList.toggle('activo', i === currentPage); // Marcar el botón activo

            // Agregar evento de clic para cambiar de página
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
        currentPage = 1; // Reiniciar a la primera página
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Evento para el botón de página anterior
    document.querySelector('.pagina-anterior-asignaturas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Evento para el botón de página siguiente
    document.querySelector('.pagina-siguiente-asignaturas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicializar la paginación después de cargar los datos
    tablaAsignaturas.cargarDatos().then(() => {
        clonarFilasOriginales(); // Clonar las filas originales
        actualizarPaginacion(); // Inicializar la paginación
    });

    // Sobrescribir los métodos onEditar y onEliminar
    tablaAsignaturas.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarAsignaturaModal');
        const editarForm = document.getElementById('editar-asignatura-modal-form');

        // Llenar el modal con los datos actuales
        const inputs = editarForm.querySelectorAll('input');
        inputs.forEach((input, index) => {
            input.value = datos[index];
        });

        editarModal.style.display = 'block';

        // Guardar cambios
        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {};
            inputs.forEach((input, index) => {
                nuevosDatos[tablaAsignaturas.columns[index]] = input.value;
            });

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
                    clonarFilasOriginales(); // Clonar las filas originales
                    actualizarPaginacion(); // Actualizar la paginación
                });
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
            }
        };

        // Evento para cerrar el modal al hacer clic en la "X"
        const editarClose = document.querySelector('.close');
        if (editarClose) {
            editarClose.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }

        // Evento para cerrar el modal al hacer clic en "Cancelar"
        const cancelarEditar = document.getElementById('cancelar-editar-asignatura-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

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
                    clonarFilasOriginales(); // Clonar las filas originales
                    actualizarPaginacion(); // Actualizar la paginación
                });
            } catch (error) {
                console.error('Error:', error);
            }
        };

        // Evento para cerrar el modal al hacer clic en la "X"
        const eliminarClose = document.querySelector('.eliminar-close');
        if (eliminarClose) {
            eliminarClose.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }

        // Evento para cerrar el modal al hacer clic en "Cancelar"
        const cancelarEliminar = document.getElementById('btn-cancelar-eliminar-asignatura');
        if (cancelarEliminar) {
            cancelarEliminar.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }
    };

    // Evento para el botón de agregar asignatura (MANTENIENDO LA VERSIÓN ORIGINAL)
    const btnAgregar = document.getElementById('btn-agregar-asignatura');
    btnAgregar.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarAsignaturaModal');
        if (agregarModal) {
            agregarModal.style.display = 'block';
        } else {
            console.error('Modal de agregar no encontrado: agregarAsignaturaModal');
        }
    });

    // Evento para el formulario de agregar (MANTENIENDO LA VERSIÓN ORIGINAL)
    const agregarForm = document.getElementById('agregar-asignatura-modal-form');
    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Obtener los valores de los campos del formulario
        const codigo = document.getElementById('agregar-codigo-asignatura').value;
        const nombre = document.getElementById('agregar-nombre-asignatura').value;
        const carrera = document.getElementById('agregar-carrera').value;
        const trayecto = document.getElementById('agregar-trayecto').value;
        const semTrim = document.getElementById('agregar-sem-trim').value;
        const valorUC = document.getElementById('agregar-valor-uc').value;

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Enviar la solicitud POST al servidor con todos los campos
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

            // Recargar la tabla después de agregar
            tablaAsignaturas.cargarDatos().then(() => {
                clonarFilasOriginales(); // Clonar las filas originales
                actualizarPaginacion(); // Actualizar la paginación
            });

            // Cerrar el modal
            const agregarModal = document.getElementById('agregarAsignaturaModal');
            if (agregarModal) {
                agregarModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Evento para cerrar el modal de agregar (MANTENIENDO LA VERSIÓN ORIGINAL)
    const agregarClose = document.querySelector('.agregar-close');
    agregarClose.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarAsignaturaModal');
        if (agregarModal) {
            agregarModal.style.display = 'none';
        }
    });
});