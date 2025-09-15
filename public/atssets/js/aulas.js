import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para aulas
    const tablaAulas = new GenericTable(
        'aulas', // Nombre de la tabla en la base de datos
        'tabla-aulas', // ID de la tabla HTML
        ['Nombre', 'Capacidad'], // Todas las columnas
        ['Nombre', 'Capacidad'] // Columnas a mostrar en la tabla HTML
    );

    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token'); // Asegúrate de que el token se guarde aquí después del login
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-aulas');
    const botonBuscar = document.querySelector('.btn-buscar-aulas');
    const btnReajustar = document.querySelector('.btn-reajustar-aulas');
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas
    let filasOriginales = []; // Almacenar las filas originales

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-aulas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-aulas tbody');
        tbody.innerHTML = ''; // Limpiar la tabla

        filasOriginales.forEach(fila => {
            const nombreAula = fila.cells[0].textContent.toLowerCase();
            const capacidadAula = fila.cells[1].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || nombreAula.includes(textoBusqueda) || capacidadAula.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true)); // Agregar fila si coincide
            }
        });

        // Reiniciar la paginación después de filtrar
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-aulas tbody');
        tbody.innerHTML = ''; // Limpiar la tabla

        // Restaurar las filas originales
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reiniciar la paginación
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-aulas tbody tr');

        filas.forEach((fila, index) => {
            if (index >= start && index < end) {
                fila.style.display = ''; // Mostrar fila
            } else {
                fila.style.display = 'none'; // Ocultar fila
            }
        });

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-aulas').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-aulas');
        const nextButton = document.querySelector('.pagina-siguiente-aulas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-aulas');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-aulas');
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
        const filas = document.querySelectorAll('#tabla-aulas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1; // Reiniciar a la primera página
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Evento para el botón de página anterior
    document.querySelector('.pagina-anterior-aulas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Evento para el botón de página siguiente
    document.querySelector('.pagina-siguiente-aulas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicializar la paginación después de cargar los datos
    tablaAulas.cargarDatos().then(() => {
        clonarFilasOriginales(); // Clonar las filas originales
        actualizarPaginacion(); // Inicializar la paginación
    });

    // Sobrescribir los métodos onEditar y onEliminar
    tablaAulas.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarAulaModal');
        const editarForm = document.getElementById('editar-aula-modal-form');

        // Llenar el modal con los datos actuales
        const inputs = editarForm.querySelectorAll('input');
        inputs.forEach((input, index) => {
            input.value = datos[index];
        });

        editarModal.style.display = 'block';

        // Guardar cambios
        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Nombre: document.getElementById('editar-nombre-aula').value,
                Capacidad: document.getElementById('editar-capacidad-aula').value
            };

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/aulas/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevosDatos),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                tablaAulas.cargarDatos().then(() => {
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
        const cancelarEditar = document.getElementById('cancelar-editar-aula-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

    tablaAulas.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarAulaModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar-aula');
        btnAceptarEliminar.onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/aulas/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                eliminarModal.style.display = 'none';
                tablaAulas.cargarDatos().then(() => {
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
        const cancelarEliminar = document.getElementById('btn-cancelar-eliminar-aula');
        if (cancelarEliminar) {
            cancelarEliminar.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }
    };

    // Evento para el botón de agregar aula
    const btnAgregar = document.getElementById('btn-agregar-aula');
    btnAgregar.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarAulaModal');
        if (agregarModal) {
            agregarModal.style.display = 'block';
        } else {
            console.error('Modal de agregar no encontrado: agregarAulaModal');
        }
    });

    // Evento para el formulario de agregar
    const agregarForm = document.getElementById('agregar-aula-modal-form');
    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Obtener los valores de los campos del formulario
        const nombre = document.getElementById('agregar-nombre-aula').value;
        const capacidad = document.getElementById('agregar-capacidad-aula').value;

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Enviar la solicitud POST al servidor con todos los campos
            const response = await fetch('/api/aulas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Nombre: nombre,
                    Capacidad: capacidad
                }),
            });

            if (!response.ok) throw new Error('Error al agregar el aula');

            // Recargar la tabla después de agregar
            tablaAulas.cargarDatos().then(() => {
                clonarFilasOriginales(); // Clonar las filas originales
                actualizarPaginacion(); // Actualizar la paginación
            });

            // Cerrar el modal
            const agregarModal = document.getElementById('agregarAulaModal');
            if (agregarModal) {
                agregarModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Evento para cerrar el modal de agregar
    const agregarClose = document.querySelector('.agregar-close');
    agregarClose.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarAulaModal');
        if (agregarModal) {
            agregarModal.style.display = 'none';
        }
    });
});