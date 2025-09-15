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
    const estadoSelect = document.querySelector('.filtro-estado-pensum');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para cargar los códigos de carrera en los selects
    const cargarCodigosCarrera = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/carreras', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar códigos de carrera');

            const data = await response.json();
            const agregarSelect = document.getElementById('agregar-codigo-pensum');
            const editarSelect = document.getElementById('editar-codigo-pensum');

            // Limpiar selects
            agregarSelect.innerHTML = '<option value="">Seleccione un código</option>';
            editarSelect.innerHTML = '<option value="">Seleccione un código</option>';

            if (data.length === 0) {
                agregarSelect.innerHTML = '<option value="">No hay datos cargados</option>';
                editarSelect.innerHTML = '<option value="">No hay datos cargados</option>';
                return;
            }

            // Llenar selects con los códigos de carrera
            data.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera.Codigo_Carrera;
                option.textContent = carrera.Codigo_Carrera;

                agregarSelect.appendChild(option.cloneNode(true));
                editarSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar códigos de carrera:', error);
            const agregarSelect = document.getElementById('agregar-codigo-pensum');
            const editarSelect = document.getElementById('editar-codigo-pensum');
            agregarSelect.innerHTML = '<option value="">Error al cargar datos</option>';
            editarSelect.innerHTML = '<option value="">Error al cargar datos</option>';
        }
    };

    // Función para formatear el contenido de las celdas especiales
    const formatearCeldasEspeciales = () => {
        const filas = document.querySelectorAll('#tabla-pensum tbody tr');
        
        filas.forEach(fila => {
            // Formatear Estado_Pensum (columna 3 en la tabla mostrada)
            const estadoCell = fila.cells[3];
            const estadoValue = estadoCell.textContent.trim().toLowerCase();
            
            // Solo actualizar si el contenido no es el icono correcto
            const currentEstadoIcon = estadoCell.querySelector('i');
            if (!currentEstadoIcon || 
                (estadoValue === 'activo' && !currentEstadoIcon.classList.contains('estado-pensum-activo')) ||
                (estadoValue === 'inactivo' && !currentEstadoIcon.classList.contains('estado-pensum-inactivo'))) {
                
                if (estadoValue === 'activo') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-pensum-activo" title="Activo"><span class="estado-circulo-pensum"></span></i>';
                } else if (estadoValue === 'inactivo') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-pensum-inactivo" title="Inactivo"><span class="estado-circulo-pensum"></span></i>';
                }
            }
        });
    };

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-pensum tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estadoFiltro = estadoSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-pensum tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const codigo = fila.cells[0].textContent.toLowerCase();
            const nombre = fila.cells[1].textContent.toLowerCase();
            const asignaturas = fila.cells[2].textContent.toLowerCase();
            
            // Obtener el estado real del texto (no del icono)
            const estadoCell = fila.cells[3];
            let estadoValue = '';
            const estadoIcon = estadoCell.querySelector('i');
            if (estadoIcon) {
                if (estadoIcon.classList.contains('estado-pensum-activo')) {
                    estadoValue = 'activo';
                } else if (estadoIcon.classList.contains('estado-pensum-inactivo')) {
                    estadoValue = 'inactivo';
                }
            } else {
                estadoValue = estadoCell.textContent.trim().toLowerCase();
            }

            const coincideBusqueda = textoBusqueda === '' || 
                                  codigo.includes(textoBusqueda) || 
                                  nombre.includes(textoBusqueda) || 
                                  asignaturas.includes(textoBusqueda);

            const coincideEstado = estadoFiltro === '' || estadoValue === estadoFiltro;

            if (coincideBusqueda && coincideEstado) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        tablaPensum.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estadoSelect.value = '';
        const tbody = document.querySelector('#tabla-pensum tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
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
        formatearCeldasEspeciales();
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

    // Métodos para agregar
    document.getElementById('btn-agregar-pensum').addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarPensumModal');
        agregarModal.style.display = 'block';

        // Limpiar el formulario
        document.getElementById('agregar-nombre-pensum').value = '';
        document.getElementById('agregar-asignaturas').value = '';
        document.getElementById('agregar-estado-pensum').value = 'activo';
    });

    document.getElementById('agregar-pensum-modal-form').onsubmit = async (event) => {
        event.preventDefault();
        
        const nuevoPensum = {
            Codigo_Pensum: document.getElementById('agregar-codigo-pensum').value,
            Nombre_Pensum: document.getElementById('agregar-nombre-pensum').value,
            Num_Asignatura: document.getElementById('agregar-asignaturas').value,
            Estado_Pensum: document.getElementById('agregar-estado-pensum').value
        };

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/pensum', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(nuevoPensum),
            });

            if (!response.ok) throw new Error('Error al agregar el pensum');
            
            // Cerrar modal y recargar datos
            document.getElementById('agregarPensumModal').style.display = 'none';
            tablaPensum.cargarDatos().then(() => {
                formatearCeldasEspeciales();
                clonarFilasOriginales();
                actualizarPaginacion();
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Métodos para editar
    tablaPensum.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarPensumModal');
        const editarForm = document.getElementById('editar-pensum-modal-form');

        const inputs = editarForm.querySelectorAll('input, select');
        inputs[0].value = datos[0]; // Codigo_Pensum
        inputs[1].value = datos[1]; // Nombre_Pensum
        inputs[2].value = datos[2]; // Num_Asignatura
        inputs[3].value = datos[3].toLowerCase(); // Estado_Pensum

        editarModal.style.display = 'block';

        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Codigo_Pensum: inputs[0].value,
                Nombre_Pensum: inputs[1].value,
                Num_Asignatura: inputs[2].value,
                Estado_Pensum: inputs[3].value
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
                    formatearCeldasEspeciales();
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const editarClose = document.querySelector('.close');
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

    // Métodos para eliminar
    tablaPensum.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarPensumModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar-pensum');
        const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar-pensum');
        const eliminarClose = document.querySelector('.eliminar-close');

        const eliminarRegistro = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/pensum/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                tablaPensum.cargarDatos().then(() => {
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
        document.getElementById('agregarPensumModal').style.display = 'none';
    });

    document.getElementById('cancelar-agregar-pensum-modal').addEventListener('click', () => {
        document.getElementById('agregarPensumModal').style.display = 'none';
    });

    // Inicialización
    tablaPensum.cargarDatos().then(() => {
        formatearCeldasEspeciales();
        clonarFilasOriginales();
        actualizarPaginacion();
    });

    // Cargar códigos de carrera en los selects
    cargarCodigosCarrera();
});