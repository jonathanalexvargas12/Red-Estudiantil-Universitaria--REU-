import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para líneas de investigación
    const tablaLineas = new GenericTable(
        'trabajo_investigacion',
        'tabla-lineas-investigacion',
        ['ID', 'Nombre_Investigacion', 'Carrera', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Tutor_Cedula', 'Tutor_Nombre', 'Area_Interes', 'Periodo_Academico'],
        ['Nombre_Investigacion', 'Area_Interes']
    );

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.crud-lineas-investigacion__buscar-input');
    const botonBuscar = document.querySelector('.crud-lineas-investigacion__btn-buscar');
    const btnReajustar = document.querySelector('.crud-lineas-investigacion__btn-reajustar');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-lineas-investigacion tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-lineas-investigacion tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const nombre = fila.cells[1].textContent.toLowerCase();
            const area = fila.cells[2].textContent.toLowerCase();

            if (textoBusqueda === '' || nombre.includes(textoBusqueda) || area.includes(textoBusqueda)) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        tablaLineas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Eventos de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-lineas-investigacion tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        tablaLineas.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-lineas-investigacion tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.crud-lineas-investigacion__info-paginacion').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        tablaLineas.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.crud-lineas-investigacion__pagina-anterior');
        const nextButton = document.querySelector('.crud-lineas-investigacion__pagina-siguiente');
        const pageButtonsContainer = document.querySelector('.crud-lineas-investigacion__numeros-pagina');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('crud-lineas-investigacion__numero-pagina');
            if (i === currentPage) {
                button.classList.add('crud-lineas-investigacion__numero-pagina--activo');
            }
            button.textContent = i;
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
        const filas = document.querySelectorAll('#tabla-lineas-investigacion tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = Math.min(currentPage, totalPages);
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Función para cargar datos en un select con manejo de errores
    async function cargarSelect(url, selectId, valueField, textField) {
        try {
            const token = getToken();
            if (!token) throw new Error('Token no encontrado');

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error en la respuesta');

            const data = await response.json();
            const select = document.getElementById(selectId);
            
            // Limpiar select manteniendo la primera opción
            while (select.options.length > 1) {
                select.remove(1);
            }

            if (data.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No se encontraron datos registrados';
                option.disabled = true;
                select.appendChild(option);
                return;
            }

            // Agregar nuevas opciones
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
    }

    // Función para sincronizar selects de estudiante
    async function cargarEstudiantes(modalType = 'agregar') {
        try {
            const token = getToken();
            if (!token) throw new Error('Token no encontrado');

            const response = await fetch('/api/estudiantes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error cargando estudiantes');

            const estudiantes = await response.json();
            const selectNombre = document.getElementById(`${modalType}-nombre-estudiante`);
            const selectCedula = document.getElementById(`${modalType}-cedula-estudiante`);
            
            // Limpiar selects
            selectNombre.innerHTML = '<option value="" disabled selected>Seleccione un estudiante</option>';
            selectCedula.innerHTML = '<option value="" disabled selected>Seleccione una cédula</option>';
            
            if (estudiantes.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay estudiantes registrados';
                option.disabled = true;
                selectNombre.appendChild(option.cloneNode(true));
                selectCedula.appendChild(option);
                return;
            }

            // Llenar selects
            estudiantes.forEach(est => {
                const optionNombre = document.createElement('option');
                optionNombre.value = est.Cedula;
                optionNombre.textContent = est.Nombres;
                selectNombre.appendChild(optionNombre);

                const optionCedula = document.createElement('option');
                optionCedula.value = est.Cedula;
                optionCedula.textContent = est.Cedula;
                selectCedula.appendChild(optionCedula);
            });

            // Sincronización
            selectNombre.addEventListener('change', () => {
                selectCedula.value = selectNombre.value;
            });

            selectCedula.addEventListener('change', () => {
                selectNombre.value = selectCedula.value;
            });

        } catch (error) {
            console.error('Error cargando estudiantes:', error);
            const selectNombre = document.getElementById(`${modalType}-nombre-estudiante`);
            const selectCedula = document.getElementById(`${modalType}-cedula-estudiante`);
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Error cargando estudiantes';
            option.disabled = true;
            selectNombre.appendChild(option.cloneNode(true));
            selectCedula.appendChild(option);
        }
    }

    // Cargar datos para modal de agregar
    async function cargarDatosAgregar() {
        await Promise.all([
            cargarSelect('/api/carreras', 'agregar-carrera', 'Codigo_Carrera', 'Nombre_Carrera'),
            cargarSelect('/api/periodo_academico', 'agregar-periodo', 'Periodo_Academico', 'Periodo_Academico'),
            cargarEstudiantes('agregar')
        ]);
    }

    // Cargar datos para modal de editar
    async function cargarDatosEditar() {
        await Promise.all([
            cargarSelect('/api/carreras', 'editar-carrera', 'Codigo_Carrera', 'Nombre_Carrera'),
            cargarSelect('/api/periodo_academico', 'editar-periodo', 'Periodo_Academico', 'Periodo_Academico'),
            cargarEstudiantes('editar')
        ]);
    }

    // Manejador para editar con todos los campos
    tablaLineas.onEditar = async (id, datos) => {
        const modal = document.getElementById('editarLineaModal');
        const form = document.getElementById('editar-linea-modal-form');

        // Cargar datos primero
        await cargarDatosEditar();

        // Llenar todos los campos del formulario
        document.getElementById('editar-nombre-linea').value = datos[0]; // Nombre_Investigacion
        document.getElementById('editar-area-interes').value = datos[1]; // Area_Interes
        document.getElementById('editar-carrera').value = datos[2]; // Carrera
        document.getElementById('editar-cedula-estudiante').value = datos[3]; // Cedula_Estudiante
        document.getElementById('editar-nombre-estudiante').value = datos[3]; // Usamos la cédula como value
        document.getElementById('editar-tutor-cedula').value = datos[5]; // Tutor_Cedula
        document.getElementById('editar-tutor-nombre').value = datos[6]; // Tutor_Nombre
        document.getElementById('editar-periodo').value = datos[7]; // Periodo_Academico

        modal.style.display = 'block';

        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/trabajo_investigacion/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Nombre_Investigacion: document.getElementById('editar-nombre-linea').value,
                        Area_Interes: document.getElementById('editar-area-interes').value,
                        Carrera: document.getElementById('editar-carrera').value,
                        Cedula_Estudiante: document.getElementById('editar-cedula-estudiante').value,
                        Nombre_Estudiante: document.getElementById('editar-nombre-estudiante').options[
                            document.getElementById('editar-nombre-estudiante').selectedIndex
                        ].text,
                        Tutor_Cedula: document.getElementById('editar-tutor-cedula').value,
                        Tutor_Nombre: document.getElementById('editar-tutor-nombre').value,
                        Periodo_Academico: document.getElementById('editar-periodo').value
                    }),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                
                tablaLineas.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
                modal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
            }
        };

        // Cerrar modal
        const closeElements = [
            document.querySelector('.close'),
            document.getElementById('cancelar-editar-linea-modal')
        ];
        
        closeElements.forEach(el => {
            if (el) el.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        });
    };

    // Manejador para eliminar
    tablaLineas.onEliminar = (id) => {
        const modal = document.getElementById('eliminarLineaModal');
        modal.style.display = 'block';

        document.getElementById('btn-aceptar-eliminar-linea').onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/trabajo_investigacion/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                modal.style.display = 'none';
                tablaLineas.cargarDatos().then(() => {
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
                modal.style.display = 'none';
            });
        }

        const cancelarEliminar = document.getElementById('btn-cancelar-eliminar-linea');
        if (cancelarEliminar) {
            cancelarEliminar.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    };

    // Agregar nueva línea con todos los campos
    const agregarForm = document.getElementById('agregar-linea-modal-form');
    const agregarModal = document.getElementById('agregarLineaModal');

    document.getElementById('btn-agregar-linea-investigacion').addEventListener('click', async () => {
        await cargarDatosAgregar();
        agregarModal.style.display = 'block';
    });

    agregarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/trabajo_investigacion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Nombre_Investigacion: document.getElementById('agregar-nombre-linea').value,
                    Area_Interes: document.getElementById('agregar-area-interes').value,
                    Carrera: document.getElementById('agregar-carrera').value,
                    Cedula_Estudiante: document.getElementById('agregar-cedula-estudiante').value,
                    Nombre_Estudiante: document.getElementById('agregar-nombre-estudiante').options[
                        document.getElementById('agregar-nombre-estudiante').selectedIndex
                    ].text,
                    Tutor_Cedula: document.getElementById('agregar-tutor-cedula').value,
                    Tutor_Nombre: document.getElementById('agregar-tutor-nombre').value,
                    Periodo_Academico: document.getElementById('agregar-periodo').value
                }),
            });

            if (!response.ok) throw new Error('Error al agregar la línea de investigación');

            tablaLineas.cargarDatos().then(() => {
                clonarFilasOriginales();
                actualizarPaginacion();
            });

            agregarModal.style.display = 'none';
            agregarForm.reset();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Cerrar modal de agregar
    const agregarClose = document.querySelector('.agregar-close');
    agregarClose.addEventListener('click', () => {
        agregarModal.style.display = 'none';
        agregarForm.reset();
    });

    const cancelarAgregar = document.getElementById('cancelar-agregar-linea-modal');
    if (cancelarAgregar) {
        cancelarAgregar.addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });
    }

    // Inicialización
    tablaLineas.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});