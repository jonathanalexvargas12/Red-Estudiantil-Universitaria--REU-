import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para pensum
    const tablaPensum = new GenericTable(
        'pensum', // Nombre de la tabla en la base de datos
        'tabla-pensum', // ID de la tabla HTML
        ['Codigo_Pensum', 'Nombre_Pensum', 'Num_Asignatura', 'Estado_Pensum'], // Todas las columnas
        ['Codigo_Pensum', 'Nombre_Pensum', 'Num_Asignatura', 'Estado_Pensum'] // Columnas a mostrar
    );

    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-pensum');
    const botonBuscar = document.querySelector('.btn-buscar-pensum');
    const btnReajustar = document.querySelector('.btn-reajustar-pensum');
    const filtroEstado = document.querySelector('.filtro-estado-pensum');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para formatear el estado con iconos (VERSIÓN CORREGIDA)
    const formatearEstado = (estado) => {
        const estadoLower = estado.toLowerCase();
        
        if (estadoLower === 'activo') {
            return '<i class="fas fa-circle estado-pensum-activo" title="Activo"></i>';
        } 
        else if (estadoLower === 'inactivo') {
            return '<i class="fas fa-circle estado-pensum-inactivo" title="Inactivo"></i>';
        }
        else {
            // Por defecto, mostrar como inactivo si el estado no es reconocido
            return '<i class="fas fa-circle estado-pensum-inactivo" title="Estado desconocido"></i>';
        }
    };

    // Función para formatear el número de asignaturas
    const formatearAsignaturas = (num) => {
        return `<i class="fas fa-book"></i> (${num})`;
    };

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-pensum tbody tr');
        filasOriginales = Array.from(filas).map(fila => {
            const clone = fila.cloneNode(true);
            // Guardar el estado original para filtros
            clone.dataset.estado = fila.cells[3].querySelector('i')?.getAttribute('title')?.toLowerCase() || '';
            return clone;
        });
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estadoFiltro = filtroEstado.value.toLowerCase();
        const tbody = document.querySelector('#tabla-pensum tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const codigo = fila.cells[0].textContent.toLowerCase();
            const nombre = fila.cells[1].textContent.toLowerCase();
            const estado = fila.dataset.estado;

            const coincideBusqueda = textoBusqueda === '' || 
                                  codigo.includes(textoBusqueda) || 
                                  nombre.includes(textoBusqueda);

            const coincideEstado = estadoFiltro === '' || estado === estadoFiltro;

            if (coincideBusqueda && coincideEstado) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Reasignar eventos y actualizar paginación
        tablaPensum.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        filtroEstado.value = '';
        const tbody = document.querySelector('#tabla-pensum tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        tablaPensum.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-pensum tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-pensum').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        // Reasignar eventos para las filas visibles
        tablaPensum.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-pensum');
        const nextButton = document.querySelector('.pagina-siguiente-pensum');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-pensum');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-pensum');
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
        const filas = document.querySelectorAll('#tabla-pensum tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior-pensum').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-pensum').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicialización
    tablaPensum.cargarDatos().then(() => {
        // Formatear los datos después de cargarlos
        const filas = document.querySelectorAll('#tabla-pensum tbody tr');
        filas.forEach(fila => {
            // Formatear estado
            const estado = fila.cells[3].textContent.trim();
            fila.cells[3].innerHTML = formatearEstado(estado);
            
            // Formatear asignaturas
            const numAsignaturas = fila.cells[2].textContent.trim();
            fila.cells[2].innerHTML = formatearAsignaturas(numAsignaturas);
        });
        
        clonarFilasOriginales();
        actualizarPaginacion();
    });

    // Métodos para editar y eliminar
    tablaPensum.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarPensumModal');
        const editarForm = document.getElementById('editar-pensum-modal-form');

        // Llenar el formulario con los datos actuales
        document.getElementById('editar-codigo-pensum').value = datos[0]; // Codigo_Pensum
        document.getElementById('editar-nombre-pensum').value = datos[1]; // Nombre_Pensum
        document.getElementById('editar-asignaturas').value = datos[2]; // Num_Asignatura
        document.getElementById('editar-estado-pensum').value = datos[3].toLowerCase(); // Estado_Pensum

        editarModal.style.display = 'block';

        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Codigo_Pensum: document.getElementById('editar-codigo-pensum').value,
                Nombre_Pensum: document.getElementById('editar-nombre-pensum').value,
                Num_Asignatura: document.getElementById('editar-asignaturas').value,
                Estado_Pensum: document.getElementById('editar-estado-pensum').value
            };

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/pensum/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevosDatos),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                
                tablaPensum.cargarDatos().then(() => {
                    // Formatear los datos después de cargarlos
                    const filas = document.querySelectorAll('#tabla-pensum tbody tr');
                    filas.forEach(fila => {
                        // Formatear estado
                        const estado = fila.cells[3].textContent.trim();
                        fila.cells[3].innerHTML = formatearEstado(estado);
                        
                        // Formatear asignaturas
                        const numAsignaturas = fila.cells[2].textContent.trim();
                        fila.cells[2].innerHTML = formatearAsignaturas(numAsignaturas);
                    });
                    
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
                
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const editarClose = document.querySelector('#editarPensumModal .close');
        if (editarClose) {
            editarClose.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }

        const cancelarEditar = document.getElementById('cancelar-editar-pensum-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

    tablaPensum.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarPensumModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar-pensum');
        btnAceptarEliminar.onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/pensum/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                eliminarModal.style.display = 'none';
                tablaPensum.cargarDatos().then(() => {
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

        const cancelarEliminar = document.getElementById('btn-cancelar-eliminar-pensum');
        if (cancelarEliminar) {
            cancelarEliminar.addEventListener('click', () => {
                eliminarModal.style.display = 'none';
            });
        }
    };

    // Evento para el botón de agregar pensum
    const btnAgregar = document.getElementById('btn-agregar-pensum');
    btnAgregar.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarPensumModal');
        if (agregarModal) {
            agregarModal.style.display = 'block';
        } else {
            console.error('Modal de agregar no encontrado: agregarPensumModal');
        }
    });

    // Evento para el formulario de agregar
    const agregarForm = document.getElementById('agregar-pensum-modal-form');
    agregarForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/pensum', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Codigo_Pensum: document.getElementById('agregar-codigo-pensum').value,
                    Nombre_Pensum: document.getElementById('agregar-nombre-pensum').value,
                    Num_Asignatura: document.getElementById('agregar-asignaturas').value,
                    Estado_Pensum: document.getElementById('agregar-estado-pensum').value
                }),
            });

            if (!response.ok) throw new Error('Error al agregar el pensum');

            tablaPensum.cargarDatos().then(() => {
                // Formatear los datos después de cargarlos
                const filas = document.querySelectorAll('#tabla-pensum tbody tr');
                filas.forEach(fila => {
                    // Formatear estado
                    const estado = fila.cells[3].textContent.trim();
                    fila.cells[3].innerHTML = formatearEstado(estado);
                    
                    // Formatear asignaturas
                    const numAsignaturas = fila.cells[2].textContent.trim();
                    fila.cells[2].innerHTML = formatearAsignaturas(numAsignaturas);
                });
                
                clonarFilasOriginales();
                actualizarPaginacion();
            });

            const agregarModal = document.getElementById('agregarPensumModal');
            if (agregarModal) {
                agregarModal.style.display = 'none';
                agregarForm.reset();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Evento para cerrar el modal de agregar
    const agregarClose = document.querySelector('#agregarPensumModal .agregar-close');
    agregarClose.addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarPensumModal');
        if (agregarModal) {
            agregarModal.style.display = 'none';
            document.getElementById('agregar-pensum-modal-form').reset();
        }
    });

    // Evento para cancelar agregar
    const cancelarAgregar = document.getElementById('cancelar-agregar-pensum-modal');
    if (cancelarAgregar) {
        cancelarAgregar.addEventListener('click', () => {
            const agregarModal = document.getElementById('agregarPensumModal');
            if (agregarModal) {
                agregarModal.style.display = 'none';
                document.getElementById('agregar-pensum-modal-form').reset();
            }
        });
    }
});