import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para horas
    const tablaHoras = new GenericTable(
        'horas',
        'tabla-horas',
        ['Desde', 'Hasta'], // Columnas en BD
        ['Desde', 'Hasta']  // Columnas a mostrar
    );

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Variables para paginación y búsqueda
    const buscarDesdeInput = document.querySelector('.buscar-hora-desde');
    const buscarHastaInput = document.querySelector('.buscar-hora-hasta');
    const botonBuscar = document.querySelector('.btn-buscar-horas');
    const btnReajustar = document.querySelector('.btn-reajustar-horas');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para formatear la hora
    const formatTimeForComparison = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    // Clonar filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-horas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Filtrar tabla por rango de horas (MODIFICADO para coincidencia exacta en ambas columnas)
    const filtrarTabla = () => {
        const horaDesde = formatTimeForComparison(buscarDesdeInput.value);
        const horaHasta = formatTimeForComparison(buscarHastaInput.value);
        const tbody = document.querySelector('#tabla-horas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const desde = formatTimeForComparison(fila.cells[0].textContent);
            const hasta = formatTimeForComparison(fila.cells[1].textContent);

            // Coincidencia EXACTA en ambas columnas
            const coincideDesde = horaDesde === '' || desde === horaDesde;
            const coincideHasta = horaHasta === '' || hasta === horaHasta;

            if (coincideDesde && coincideHasta) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        tablaHoras.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Mostrar filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-horas tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-horas').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        tablaHoras.asignarEventosEditarEliminar();
    };

    // Actualizar botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-horas');
        const nextButton = document.querySelector('.pagina-siguiente-horas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-horas');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-horas');
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

    // Actualizar paginación
    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-horas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarDesdeInput.value = '';
        buscarHastaInput.value = '';
        const tbody = document.querySelector('#tabla-horas tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        tablaHoras.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    document.querySelector('.pagina-anterior-horas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-horas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Métodos para editar y eliminar
    tablaHoras.onEditar = (desde, datos) => {
        const editarModal = document.getElementById('editarHoraModal');
        const editarForm = document.getElementById('editar-hora-modal-form');

        document.getElementById('editar-hora-desde').value = datos[0];
        document.getElementById('editar-hora-hasta').value = datos[1];

        editarModal.style.display = 'block';

        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Desde: document.getElementById('editar-hora-desde').value,
                Hasta: document.getElementById('editar-hora-hasta').value
            };

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                // Verificar si ya existe OTRO registro con el mismo par exacto
                const responseCheck = await fetch('/api/horas', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!responseCheck.ok) throw new Error('Error al verificar horas existentes');
                
                const horasExistentes = await responseCheck.json();
                const existeDuplicadoExacto = horasExistentes.some(hora => 
                    hora.Desde === nuevosDatos.Desde && 
                    hora.Hasta === nuevosDatos.Hasta &&
                    hora.Desde !== desde // Excluimos el registro actual
                );

                if (existeDuplicadoExacto) {
                    alert('Ya existe otro registro con exactamente el mismo horario (Desde y Hasta)');
                    return;
                }

                const response = await fetch(`/api/horas/${encodeURIComponent(desde)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevosDatos),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                tablaHoras.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
                alert('Error al editar: ' + error.message);
            }
        };

        const editarClose = document.querySelector('.close');
        if (editarClose) editarClose.addEventListener('click', () => editarModal.style.display = 'none');
        
        const cancelarEditar = document.getElementById('cancelar-editar-hora-modal');
        if (cancelarEditar) cancelarEditar.addEventListener('click', () => editarModal.style.display = 'none');
    };

    tablaHoras.onEliminar = (desde) => {
        const eliminarModal = document.getElementById('eliminarHoraModal');
        eliminarModal.style.display = 'block';

        document.getElementById('btn-aceptar-eliminar-hora').onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/horas/${encodeURIComponent(desde)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                eliminarModal.style.display = 'none';
                tablaHoras.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
            } catch (error) {
                console.error('Error:', error);
            }
        };

        document.querySelector('.eliminar-close')?.addEventListener('click', () => eliminarModal.style.display = 'none');
        document.getElementById('btn-cancelar-eliminar-hora')?.addEventListener('click', () => eliminarModal.style.display = 'none');
    };

    // Agregar nueva hora
    document.getElementById('btn-agregar-hora').addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarHoraModal');
        if (agregarModal) {
            agregarModal.style.display = 'block';
            document.getElementById('agregar-hora-desde').value = '';
            document.getElementById('agregar-hora-hasta').value = '';
        }
    });

    document.getElementById('agregar-hora-modal-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const horaDesde = document.getElementById('agregar-hora-desde').value;
        const horaHasta = document.getElementById('agregar-hora-hasta').value;

        if (!horaDesde || !horaHasta) {
            alert('Por favor ingrese ambas horas');
            return;
        }

        if (horaDesde >= horaHasta) {
            alert('La hora "Desde" debe ser menor que la hora "Hasta"');
            return;
        }

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Verificar si ya existe un registro con el mismo par exacto Desde-Hasta
            const responseCheck = await fetch('/api/horas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!responseCheck.ok) throw new Error('Error al obtener las horas existentes');
            
            const horasExistentes = await responseCheck.json();
            
            // Buscamos si existe un registro con el MISMO PAR EXACTO
            const existeDuplicadoExacto = horasExistentes.some(hora => 
                hora.Desde === horaDesde && hora.Hasta === horaHasta
            );

            if (existeDuplicadoExacto) {
                alert('Ya existe un registro con exactamente el mismo horario (Desde y Hasta)');
                return;
            }

            // Si no existe duplicado exacto, procedemos a crear el nuevo registro
            const createResponse = await fetch('/api/horas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    Desde: horaDesde, 
                    Hasta: horaHasta 
                }),
            });

            if (!createResponse.ok) throw new Error('Error al agregar la hora');
            
            tablaHoras.cargarDatos().then(() => {
                clonarFilasOriginales();
                actualizarPaginacion();
            });

            document.getElementById('agregarHoraModal').style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar la hora: ' + error.message);
        }
    });

    // Cerrar modales
    document.querySelector('.agregar-close')?.addEventListener('click', () => {
        document.getElementById('agregarHoraModal').style.display = 'none';
    });

    // Evento para el botón cancelar del modal de agregar
    document.getElementById('cancelar-agregar-hora-modal')?.addEventListener('click', () => {
        document.getElementById('agregarHoraModal').style.display = 'none';
    });

    // Inicialización
    tablaHoras.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});