import GenericTable from './genericTable.js';

// Para desplegar los criterios de filtrado del CRUD
const btnFiltrar = document.getElementById('btn-filtrar');
const filtrosBusqueda = document.getElementById('filtros-busqueda');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para inscripciones
    const tablaInscripciones = new GenericTable(
        'estudiante_periodo_academico', // Nombre de la tabla en la base de datos
        'tabla-inscripciones', // ID de la tabla HTML
        ['ID', 'Cedula_Estudiante', 'Estado', 'Periodo_Academico', 'Carrera', 'Pago', 'Monto_Pago', 'Moneda', 'Modalidad_Pago', 'Entidad_Bancaria', 'Numero_Transferencia', 'Fecha_Pago', 'Fecha_Registro'], // Todas las columnas
        ['Cedula_Estudiante', 'Carrera', 'Periodo_Academico', 'Fecha_Registro', 'Estado', 'Pago'] // Columnas a mostrar en la tabla HTML
    );

    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('#buscar-input');
    const botonBuscar = document.querySelector('.botones-filtro button:first-child');
    const btnReajustar = document.querySelector('#btn-reajustar');
    const estadoSelect = document.querySelector('#estado-select');
    const pagoSelect = document.querySelector('#pago-select');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para cargar los periodos académicos desde la base de datos
    async function cargarPeriodosAcademicos() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/periodo_academico', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener los periodos académicos');

            const periodos = await response.json();
            const selectPeriodo = document.getElementById('edit-periodo');
            const selectPeriodoAgregar = document.getElementById('nuevo-periodo');
            
            // Limpiar los selects
            selectPeriodo.innerHTML = '<option value="">Seleccione un periodo</option>';
            selectPeriodoAgregar.innerHTML = '<option value="">Seleccione un periodo</option>';

            if (periodos.length === 0) {
                selectPeriodo.innerHTML = '<option value="">No hay periodos registrados</option>';
                selectPeriodoAgregar.innerHTML = '<option value="">No hay periodos registrados</option>';
                return;
            }

            // Agregar las opciones de periodo
            periodos.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.Periodo_Academico;
                option.textContent = periodo.Periodo_Academico;
                selectPeriodo.appendChild(option.cloneNode(true));
                selectPeriodoAgregar.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar periodos académicos:', error);
            const selectPeriodo = document.getElementById('edit-periodo');
            const selectPeriodoAgregar = document.getElementById('nuevo-periodo');
            selectPeriodo.innerHTML = '<option value="">Error al cargar periodos</option>';
            selectPeriodoAgregar.innerHTML = '<option value="">Error al cargar periodos</option>';
        }
    }

    // Función para cargar las carreras desde la base de datos
    async function cargarCarreras() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/carreras', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener las carreras');

            const carreras = await response.json();
            const selectCarrera = document.getElementById('edit-carrera');
            const selectCarreraAgregar = document.getElementById('nueva-carrera');
            
            // Limpiar los selects
            selectCarrera.innerHTML = '<option value="">Seleccione una carrera</option>';
            selectCarreraAgregar.innerHTML = '<option value="">Seleccione una carrera</option>';

            if (carreras.length === 0) {
                selectCarrera.innerHTML = '<option value="">No hay carreras registradas</option>';
                selectCarreraAgregar.innerHTML = '<option value="">No hay carreras registradas</option>';
                return;
            }

            // Agregar las opciones de carrera
            carreras.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera.Codigo_Carrera;
                option.textContent = carrera.Codigo_Carrera;
                selectCarrera.appendChild(option.cloneNode(true));
                selectCarreraAgregar.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar carreras:', error);
            const selectCarrera = document.getElementById('edit-carrera');
            const selectCarreraAgregar = document.getElementById('nueva-carrera');
            selectCarrera.innerHTML = '<option value="">Error al cargar carreras</option>';
            selectCarreraAgregar.innerHTML = '<option value="">Error al cargar carreras</option>';
        }
    }

    // Función para formatear el contenido de las celdas especiales
    const formatearCeldasEspeciales = () => {
        const filas = document.querySelectorAll('#tabla-inscripciones tbody tr');
        
        filas.forEach(fila => {
            // Formatear Estado (columna 4 en la tabla mostrada)
            const estadoCell = fila.cells[4];
            const estadoValue = estadoCell.textContent.trim().toLowerCase();
            
            // Solo actualizar si el contenido no es el icono correcto
            const currentEstadoIcon = estadoCell.querySelector('i');
            if (!currentEstadoIcon || 
                (estadoValue === 'activo' && !currentEstadoIcon.classList.contains('estado-activo')) ||
                (estadoValue === 'inactivo' && !currentEstadoIcon.classList.contains('estado-inactivo')) ||
                (estadoValue === 'rechazado' && !currentEstadoIcon.classList.contains('estado-rechazado'))) {
                
                if (estadoValue === 'activo') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-activo" title="Activo"></i>';
                } else if (estadoValue === 'inactivo') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-inactivo" title="Inactivo"></i>';
                } else if (estadoValue === 'rechazado') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-rechazado" title="Rechazado"></i>';
                }
            }

            // Formatear Pago (columna 5 en la tabla mostrada)
            const pagoCell = fila.cells[5];
            const pagoValue = pagoCell.textContent.trim().toLowerCase();
            
            // Solo actualizar si el contenido no es el icono correcto
            const currentPagoIcon = pagoCell.querySelector('i');
            if (!currentPagoIcon || 
                (pagoValue.includes('realizado') && !currentPagoIcon.classList.contains('pago-realizado')) ||
                (pagoValue.includes('pendiente') && !currentPagoIcon.classList.contains('pago-pendiente'))) {
                
                if (pagoValue.includes('realizado')) {
                    pagoCell.innerHTML = '<i class="fas fa-check pago-realizado" title="Pago Realizado"></i>';
                } else if (pagoValue.includes('pendiente')) {
                    pagoCell.innerHTML = '<i class="fas fa-times pago-pendiente" title="Pago Pendiente"></i>';
                }
            }
        });
    };

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-inscripciones tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estadoFiltro = estadoSelect.value.toLowerCase();
        const pagoFiltro = pagoSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-inscripciones tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const cedula = fila.cells[0].textContent.toLowerCase();
            const carrera = fila.cells[1].textContent.toLowerCase();
            const periodo = fila.cells[2].textContent.toLowerCase();
            
            // Obtener el estado real del texto (no del icono)
            const estadoCell = fila.cells[4];
            let estadoValue = '';
            
            // Verificar si tiene un icono para determinar el estado
            const estadoIcon = estadoCell.querySelector('i');
            if (estadoIcon) {
                if (estadoIcon.classList.contains('estado-activo')) {
                    estadoValue = 'activo';
                } else if (estadoIcon.classList.contains('estado-inactivo')) {
                    estadoValue = 'inactivo';
                } else if (estadoIcon.classList.contains('estado-rechazado')) {
                    estadoValue = 'rechazado';
                }
            } else {
                // Si no hay icono, usar el texto directamente
                estadoValue = estadoCell.textContent.trim().toLowerCase();
            }

            // Obtener el estado de pago real del texto (no del icono)
            const pagoCell = fila.cells[5];
            let pagoValue = '';
            
            // Verificar si tiene un icono para determinar el pago
            const pagoIcon = pagoCell.querySelector('i');
            if (pagoIcon) {
                if (pagoIcon.classList.contains('pago-realizado')) {
                    pagoValue = 'realizado';
                } else if (pagoIcon.classList.contains('pago-pendiente')) {
                    pagoValue = 'pendiente';
                }
            } else {
                // Si no hay icono, usar el texto directamente
                pagoValue = pagoCell.textContent.trim().toLowerCase();
            }

            const coincideBusqueda = textoBusqueda === '' || 
                                  cedula.includes(textoBusqueda) || 
                                  carrera.includes(textoBusqueda) || 
                                  periodo.includes(textoBusqueda);

            const coincideEstado = estadoFiltro === '' || estadoValue === estadoFiltro;
            const coincidePago = pagoFiltro === '' || pagoValue === pagoFiltro;

            if (coincideBusqueda && coincideEstado && coincidePago) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        tablaInscripciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estadoSelect.value = '';
        pagoSelect.value = '';
        const tbody = document.querySelector('#tabla-inscripciones tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        tablaInscripciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-inscripciones tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        // Reasignar eventos para las filas visibles
        formatearCeldasEspeciales();
        tablaInscripciones.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior');
        const nextButton = document.querySelector('.pagina-siguiente');
        const pageButtonsContainer = document.querySelector('.numeros-pagina');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina');
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
        const filas = document.querySelectorAll('#tabla-inscripciones tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Métodos para editar
    tablaInscripciones.onEditar = (id, datos) => {
        const editarModal = document.getElementById('myModal');
        const editarForm = document.getElementById('modal-form');

        // Cargar carreras y periodos antes de abrir el modal
        Promise.all([cargarCarreras(), cargarPeriodosAcademicos()]).then(() => {
            document.getElementById('edit-id').value = id;
            document.getElementById('edit-cedula').value = datos[0]; // Cedula_Estudiante
            document.getElementById('edit-estado').value = datos[1]; // Estado
            
            // Establecer el periodo académico actual
            const periodoActual = datos[2]; // Periodo_Academico
            const selectPeriodo = document.getElementById('edit-periodo');
            if (selectPeriodo) {
                setTimeout(() => {
                    selectPeriodo.value = periodoActual;
                }, 100);
            }
            
            // Establecer la carrera actual
            const carreraActual = datos[3]; // Carrera
            const selectCarrera = document.getElementById('edit-carrera');
            if (selectCarrera) {
                setTimeout(() => {
                    selectCarrera.value = carreraActual;
                }, 100);
            }
            
            // Establecer el estado de pago
            const pagoCell = datos[4]; // Pago
            const pagoValue = pagoCell.includes('realizado') ? 'realizado' : 'pendiente';
            document.getElementById('edit-pago').value = pagoValue;
            
            // Si hay datos adicionales, establecerlos
            if (datos.length > 5) {
                document.getElementById('edit-monto-pago').value = datos[5] || ''; // Monto_Pago
                document.getElementById('edit-moneda').value = datos[6] || 'Bs'; // Moneda
                document.getElementById('edit-modalidad-pago').value = datos[7] || ''; // Modalidad_Pago
                document.getElementById('edit-entidad-bancaria').value = datos[8] || ''; // Entidad_Bancaria
                document.getElementById('edit-numero-transferencia').value = datos[9] || ''; // Numero_Transferencia
                document.getElementById('edit-fecha-pago').value = datos[10] || ''; // Fecha_Pago
                document.getElementById('edit-fecha-registro').value = datos[11] || ''; // Fecha_Registro
            }

            editarModal.style.display = 'block';

            editarForm.onsubmit = async (event) => {
                event.preventDefault();
                const nuevosDatos = {
                    Cedula_Estudiante: document.getElementById('edit-cedula').value,
                    Estado: document.getElementById('edit-estado').value,
                    Periodo_Academico: document.getElementById('edit-periodo').value,
                    Carrera: document.getElementById('edit-carrera').value,
                    Pago: document.getElementById('edit-pago').value,
                    Monto_Pago: document.getElementById('edit-monto-pago').value,
                    Moneda: document.getElementById('edit-moneda').value,
                    Modalidad_Pago: document.getElementById('edit-modalidad-pago').value,
                    Entidad_Bancaria: document.getElementById('edit-entidad-bancaria').value,
                    Numero_Transferencia: document.getElementById('edit-numero-transferencia').value,
                    Fecha_Pago: document.getElementById('edit-fecha-pago').value,
                    Fecha_Registro: document.getElementById('edit-fecha-registro').value
                };

                try {
                    const token = getToken();
                    if (!token) throw new Error('No se encontró el token JWT');

                    const response = await fetch(`/api/estudiante_periodo_academico/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(nuevosDatos),
                    });

                    if (!response.ok) throw new Error('Error al editar el registro');
                    tablaInscripciones.cargarDatos().then(() => {
                        formatearCeldasEspeciales();
                        clonarFilasOriginales();
                        actualizarPaginacion();
                    });
                    editarModal.style.display = 'none';
                } catch (error) {
                    console.error('Error:', error);
                    alert(`Error al editar: ${error.message}`);
                }
            };
        });

        const editarClose = document.querySelector('.close');
        if (editarClose) {
            editarClose.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }

        const cancelarEditar = document.getElementById('cancelar-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

    // Método para eliminar - IMPLEMENTACIÓN MEJORADA
    tablaInscripciones.onEliminar = (id) => {
        const modalAnular = document.getElementById('modalAnular');
        modalAnular.style.display = 'block';

        const btnAceptar = document.getElementById('btn-aceptar-anular');
        const btnCancelar = document.getElementById('btn-cancelar-anular');

        // Limpiar eventos anteriores para evitar duplicados
        btnAceptar.replaceWith(btnAceptar.cloneNode(true));
        btnCancelar.replaceWith(btnCancelar.cloneNode(true));
        
        const nuevoBtnAceptar = document.getElementById('btn-aceptar-anular');
        const nuevoBtnCancelar = document.getElementById('btn-cancelar-anular');

        const eliminarRegistro = async () => {
            try {
                const token = getToken();
                if (!token) {
                    throw new Error('No se encontró el token JWT');
                }

                console.log('Intentando eliminar registro con ID:', id); // Depuración

                const response = await fetch(`/api/estudiante_periodo_academico/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar el registro');
                }

                // Recargar datos y actualizar interfaz
                await tablaInscripciones.cargarDatos();
                formatearCeldasEspeciales();
                clonarFilasOriginales();
                actualizarPaginacion();
                
                // Mostrar notificación de éxito
                alert('Registro eliminado correctamente');
                
                modalAnular.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
                // Mostrar error al usuario
                alert(`Error al eliminar: ${error.message}`);
            }
        };

        nuevoBtnAceptar.addEventListener('click', eliminarRegistro);
        nuevoBtnCancelar.addEventListener('click', () => {
            modalAnular.style.display = 'none';
        });

        const closeAnular = document.querySelector('.close-anular');
        if (closeAnular) {
            closeAnular.addEventListener('click', () => {
                modalAnular.style.display = 'none';
            });
        }
    };

    // Evento para el botón de agregar - IMPLEMENTACIÓN MEJORADA
    document.getElementById('btn-agregar').addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarModal');
        const agregarForm = document.getElementById('agregar-modal-form');

        // Cargar carreras y periodos antes de abrir el modal
        Promise.all([cargarCarreras(), cargarPeriodosAcademicos()]).then(() => {
            // Limpiar el formulario antes de mostrar el modal
            agregarForm.reset();
            agregarModal.style.display = 'block';

            // Configurar la fecha actual como valor por defecto
            const fechaActual = new Date().toISOString().split('T')[0];
            document.getElementById('nueva-fecha-registro').value = fechaActual;
            document.getElementById('nueva-fecha-pago').value = fechaActual;

            agregarForm.onsubmit = async (event) => {
                event.preventDefault();
                
                // Validar campos requeridos
                const cedula = document.getElementById('nueva-cedula').value;
                const periodo = document.getElementById('nuevo-periodo').value;
                const carrera = document.getElementById('nueva-carrera').value;
                
                if (!cedula || !periodo || !carrera) {
                    alert('Por favor complete todos los campos requeridos');
                    return;
                }

                const nuevosDatos = {
                    Cedula_Estudiante: cedula,
                    Estado: document.getElementById('nuevo-estado').value || 'activo',
                    Periodo_Academico: periodo,
                    Carrera: carrera,
                    Pago: document.getElementById('nuevo-pago').value || 'pendiente',
                    Monto_Pago: document.getElementById('nuevo-monto-pago').value || 0,
                    Moneda: document.getElementById('nueva-moneda').value || 'Bs',
                    Modalidad_Pago: document.getElementById('nueva-modalidad-pago').value || '',
                    Entidad_Bancaria: document.getElementById('nueva-entidad-bancaria').value || '',
                    Numero_Transferencia: document.getElementById('nuevo-numero-transferencia').value || '',
                    Fecha_Pago: document.getElementById('nueva-fecha-pago').value || null,
                    Fecha_Registro: document.getElementById('nueva-fecha-registro').value || fechaActual
                };

                try {
                    const token = getToken();
                    if (!token) {
                        throw new Error('No se encontró el token JWT');
                    }

                    console.log('Datos a enviar:', nuevosDatos); // Para depuración

                    const response = await fetch('/api/estudiante_periodo_academico', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(nuevosDatos),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Error al agregar el registro');
                    }

                    // Recargar datos y actualizar interfaz
                    await tablaInscripciones.cargarDatos();
                    formatearCeldasEspeciales();
                    clonarFilasOriginales();
                    actualizarPaginacion();
                    
                    // Mostrar notificación de éxito
                    alert('Registro agregado correctamente');
                    
                    // Cerrar modal y limpiar formulario
                    agregarModal.style.display = 'none';
                    agregarForm.reset();
                } catch (error) {
                    console.error('Error al agregar registro:', error);
                    // Mostrar error detallado al usuario
                    alert(`Error al agregar: ${error.message}`);
                }
            };
        });

        // Manejar cierre del modal
        const agregarClose = document.querySelector('.agregar-close');
        if (agregarClose) {
            agregarClose.addEventListener('click', () => {
                agregarModal.style.display = 'none';
                agregarForm.reset();
            });
        }

        const cancelarAgregar = document.getElementById('cancelar-agregar-modal');
        if (cancelarAgregar) {
            cancelarAgregar.addEventListener('click', () => {
                agregarModal.style.display = 'none';
                agregarForm.reset();
            });
        }
    });

    // Evento para mostrar/ocultar filtros
    const btnFiltrar = document.getElementById('btn-filtrar');
    const filtrosContainer = document.getElementById('filtros-busqueda');
    
    btnFiltrar.addEventListener('click', () => {
        filtrosContainer.classList.toggle('oculto');
    });

    // Cargar carreras y periodos al iniciar la página
    cargarCarreras();
    cargarPeriodosAcademicos();

    // Inicialización
    tablaInscripciones.cargarDatos().then(() => {
        formatearCeldasEspeciales();
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});