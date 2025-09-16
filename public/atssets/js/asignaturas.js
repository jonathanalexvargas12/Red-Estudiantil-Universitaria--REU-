import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para asignaturas
    const tablaAsignaturas = new GenericTable(
        'asignaturas',
        'tabla-asignaturas',
        ['Codigo_Asignatura', 'Nombre_Asignatura', 'Carrera', 'Trayecto', 'Sem/Trim', 'Valor_UC'],
        ['Codigo_Asignatura', 'Nombre_Asignatura']
    );

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Función para cargar las carreras desde la API
    const cargarCarreras = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/carreras', {
                headers: {'Authorization': `Bearer ${token}`}
            });

            if (!response.ok) throw new Error('Error al obtener las carreras');
            const data = await response.json();
            
            // Filtrar duplicados por Codigo_Carrera
            const carrerasUnicas = [];
            const codigosVistos = new Set();
            
            data.forEach(carrera => {
                if (!codigosVistos.has(carrera.Codigo_Carrera)) {
                    codigosVistos.add(carrera.Codigo_Carrera);
                    carrerasUnicas.push(carrera);
                }
            });
            
            return carrerasUnicas;
        } catch (error) {
            console.error('Error al cargar carreras:', error);
            return [];
        }
    };

    // Función para llenar los selects de carreras sin duplicados
    const llenarSelectCarreras = async (selectId) => {
        const select = document.getElementById(selectId);
        if (!select) {
            console.error(`Elemento con ID ${selectId} no encontrado`);
            return;
        }

        // Guardar el valor actual seleccionado
        const valorActual = select.value;
        
        // Limpiar completamente el select
        select.innerHTML = '';
        
        // Agregar opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione una carrera';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // Obtener carreras únicas desde la API
        const carreras = await cargarCarreras();
        
        if (carreras.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay carreras registradas';
            option.disabled = true;
            select.appendChild(option);
            return;
        }

        // Agregar carreras al select
        carreras.forEach(carrera => {
            const option = document.createElement('option');
            option.value = carrera.Codigo_Carrera;
            option.textContent = carrera.Nombre_Carrera || carrera.Codigo_Carrera;
            select.appendChild(option);
        });

        // Restaurar el valor seleccionado si existe
        if (valorActual && Array.from(select.options).some(opt => opt.value === valorActual)) {
            select.value = valorActual;
        }
    };

    // Variables para paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-asignaturas');
    const botonBuscar = document.querySelector('.btn-buscar-asignaturas');
    const btnReajustar = document.querySelector('.btn-reajustar-asignaturas');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-asignaturas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-asignaturas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const codigo = fila.cells[0].textContent.toLowerCase();
            const nombre = fila.cells[1].textContent.toLowerCase();

            if (textoBusqueda === '' || codigo.includes(textoBusqueda) || nombre.includes(textoBusqueda)) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        tablaAsignaturas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Eventos de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-asignaturas tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        tablaAsignaturas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Funciones para paginación
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

    // Inicializar paginación
    tablaAsignaturas.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });

    // Configuración del modal de edición
    tablaAsignaturas.onEditar = async (id, datos) => {
        const editarModal = document.getElementById('editarAsignaturaModal');
        const editarForm = document.getElementById('editar-asignatura-modal-form');

        // Cargar carreras sin duplicados
        await llenarSelectCarreras('editar-carrera');

        // Llenar campos del formulario
        document.getElementById('editar-codigo-asignatura').value = datos.Codigo_Asignatura || datos[0] || '';
        document.getElementById('editar-nombre-asignatura').value = datos.Nombre_Asignatura || datos[1] || '';
        document.getElementById('editar-trayecto').value = datos.Trayecto || datos[3] || '';
        document.getElementById('editar-sem-trim').value = datos['Sem/Trim'] || datos[4] || '';
        document.getElementById('editar-valor-uc').value = datos.Valor_UC || datos[5] || '';

        // Establecer la carrera seleccionada
        const selectCarrera = document.getElementById('editar-carrera');
        if (selectCarrera) {
            selectCarrera.value = datos.Carrera || datos[2] || '';
        }

        // Mostrar modal
        editarModal.style.display = 'block';

        // Función para cerrar el modal
        const cancelarEditar = document.getElementById('cancelar-editar-asignatura-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }

        // Cerrar al hacer clic fuera del modal
        const clickOutside = (event) => {
            if (event.target === editarModal) {
                cerrarModal();
            }
        };
        window.addEventListener('click', clickOutside);

        // Guardar cambios
        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Codigo_Asignatura: document.getElementById('editar-codigo-asignatura').value,
                Nombre_Asignatura: document.getElementById('editar-nombre-asignatura').value,
                Carrera: selectCarrera.value,
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
                
                await tablaAsignaturas.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
                
                cerrarModal();
            } catch (error) {
                console.error('Error:', error);
            }
        };
    };

    // Configuración del modal de eliminación
    tablaAsignaturas.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarAsignaturaModal');
        eliminarModal.style.display = 'block';

        const cerrarModal = () => {
            eliminarModal.style.display = 'none';
            document.querySelector('.eliminar-close').removeEventListener('click', cerrarModal);
            document.getElementById('btn-cancelar-eliminar-asignatura').removeEventListener('click', cerrarModal);
        };

        document.querySelector('.eliminar-close').addEventListener('click', cerrarModal);
        document.getElementById('btn-cancelar-eliminar-asignatura').addEventListener('click', cerrarModal);

        document.getElementById('btn-aceptar-eliminar-asignatura').onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/asignaturas/${id}`, {
                    method: 'DELETE',
                    headers: {'Authorization': `Bearer ${token}`},
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                
                cerrarModal();
                await tablaAsignaturas.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
            } catch (error) {
                console.error('Error:', error);
            }
        };
    };

    // Configuración del modal de agregar
    const btnAgregar = document.getElementById('btn-agregar-asignatura');
    btnAgregar.addEventListener('click', async () => {
        const agregarModal = document.getElementById('agregarAsignaturaModal');
        if (agregarModal) {
            // Cargar carreras sin duplicados
            await llenarSelectCarreras('agregar-carrera');
            agregarModal.style.display = 'block';

            const cerrarModal = () => {
                agregarModal.style.display = 'none';
                document.querySelector('.agregar-close').removeEventListener('click', cerrarModal);
                document.getElementById('cancelar-agregar-asignatura-modal').removeEventListener('click', cerrarModal);
            };

            document.querySelector('.agregar-close').addEventListener('click', cerrarModal);
            document.getElementById('cancelar-agregar-asignatura-modal').addEventListener('click', cerrarModal);
        }
    });

    // Evento para el formulario de agregar
    document.getElementById('agregar-asignatura-modal-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = {
            Codigo_Asignatura: document.getElementById('agregar-codigo-asignatura').value,
            Nombre_Asignatura: document.getElementById('agregar-nombre-asignatura').value,
            Carrera: document.getElementById('agregar-carrera').value,
            Trayecto: document.getElementById('agregar-trayecto').value,
            'Sem/Trim': document.getElementById('agregar-sem-trim').value,
            Valor_UC: document.getElementById('agregar-valor-uc').value
        };

        if (!formData.Carrera) {
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
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Error al agregar la asignatura');

            await tablaAsignaturas.cargarDatos();
            clonarFilasOriginales();
            actualizarPaginacion();

            document.getElementById('agregarAsignaturaModal').style.display = 'none';
            event.target.reset();
        } catch (error) {
            console.error('Error:', error);
        }
    });
});