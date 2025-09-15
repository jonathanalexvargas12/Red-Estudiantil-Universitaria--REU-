import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para aulas:
    // - 'aulas' es el nombre de la tabla en la BD.
    // - 'tabla-aulas' es el id de la tabla en el HTML.
    // - El arreglo de columnas corresponde a los campos en la BD (por ejemplo: Nombre y Capacidad).
    // - El arreglo de columnas a mostrar se usa para desplegar la información (en este caso, igual que las columnas de BD).
    const tablaAulas = new GenericTable(
        'aulas', // <-- Nombre de la tabla en la BD 
        'tabla-aulas', // ID de la tabla en el HTML
        ['Nombre_Aula', 'Capacidad'], // <-- Aqui se mencionan todas las columnas de la tabla en la base de datos
        ['Nombre_Aula', 'Capacidad'] // <-- Aqui se mencionan que columnas de la tabla se muestran en el frontend (en orden)
    );
    // Función para obtener el token JWT desde el localStorage
    const getToken = () => localStorage.getItem('token');

    // Variables para paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-aulas');
    const botonBuscar = document.querySelector('.btn-buscar-aulas');
    const btnReajustar = document.querySelector('.btn-reajustar-aulas');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar las filas originales de la tabla (para luego filtrarlas)
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-aulas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla según el texto de búsqueda
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-aulas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const nombre = fila.cells[0].textContent.toLowerCase();
            const capacidad = fila.cells[1].textContent.toLowerCase();
            // Se busca en el nombre o en la capacidad (si el usuario escribe números, se comparará en formato texto)
            if (
                textoBusqueda === '' ||
                nombre.includes(textoBusqueda) ||
                capacidad.includes(textoBusqueda)
            ) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });
        actualizarPaginacion();
    };

    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-aulas tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        actualizarPaginacion();
    });

    // Función para mostrar las filas correspondientes a la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-aulas tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });
        document.querySelector('.info-paginacion-aulas').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-aulas');
        const nextButton = document.querySelector('.pagina-siguiente-aulas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-aulas');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-aulas');
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

    // Función para actualizar la paginación (número total de filas y páginas)
    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-aulas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    document.querySelector('.pagina-anterior-aulas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-aulas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Cargar los datos iniciales de la tabla y configurar la paginación
    tablaAulas.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });

    // Sobrescribir el método onEditar para abrir y manejar el modal de edición
    tablaAulas.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarAulaModal');
        const editarForm = document.getElementById('editar-aula-modal-form');
        const inputs = editarForm.querySelectorAll('input');
        // Suponemos que 'datos' es un array [Nombre, Capacidad]
        inputs[0].value = datos[0];
        inputs[1].value = datos[1];

        editarModal.style.display = 'block';

        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Nombre_Aula: inputs[0].value, // <-- Aqui es muy importante mencionar las columnas tal cual en la base de datos
                Capacidad: inputs[1].value
            };

            try {
                const token = getToken();
                if (!token) throw new Error('Token JWT no encontrado');

                const response = await fetch(`/api/aulas/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevosDatos)
                });

                if (!response.ok) throw new Error('Error al editar el registro');

                tablaAulas.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
            }
        };

        // Cerrar modal con la "X" o el botón de cancelar
        const editarClose = editarModal.querySelector('.close');
        if (editarClose) {
            editarClose.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
        const cancelarEditar = document.getElementById('cancelar-editar-aula-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

    // Sobrescribir el método onEliminar para el modal de eliminación
    tablaAulas.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarAulaModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar-aula');
        btnAceptarEliminar.onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('Token JWT no encontrado');

                const response = await fetch(`/api/aulas/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Error al eliminar el registro');

                eliminarModal.style.display = 'none';
                tablaAulas.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const eliminarClose = eliminarModal.querySelector('.eliminar-close');
        if (eliminarClose) {
            eliminarClose.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }
        const cancelarEliminar = document.getElementById('btn-cancelar-eliminar-aula');
        if (cancelarEliminar) {
            cancelarEliminar.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }
    };

    // Evento para abrir el modal de agregar aula
    const btnAgregar = document.getElementById('btn-agregar-aula');
    btnAgregar.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarAulaModal');
        if (agregarModal) {
            agregarModal.style.display = 'block';
        } else {
            console.error('Modal de agregar aula no encontrado: agregarAulaModal');
        }
    });

    // Manejo del formulario de agregar aula
    const agregarForm = document.getElementById('agregar-aula-modal-form');
    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nombre = document.getElementById('agregar-nombre-aula').value;
        const capacidad = document.getElementById('agregar-capacidad-aula').value;

        try {
            const token = getToken();
            if (!token) throw new Error('Token JWT no encontrado');

            const response = await fetch('/api/aulas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Nombre_Aula: nombre, // <-- Aqui es muy importante mencionar las columnas tal cual en la base de datos
                    Capacidad: capacidad
                })
            });
            if (!response.ok) throw new Error('Error al agregar el aula');

            tablaAulas.cargarDatos().then(() => {
                clonarFilasOriginales();
                actualizarPaginacion();
            });

            const agregarModal = document.getElementById('agregarAulaModal');
            if (agregarModal) {
                agregarModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Cerrar modal de agregar aula
    const agregarClose = document.querySelector('.agregar-close');
    agregarClose.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarAulaModal');
        if (agregarModal) {
            agregarModal.style.display = 'none';
        }
    });
});
