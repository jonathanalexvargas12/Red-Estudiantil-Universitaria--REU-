import GenericTable from './genericTable.js';

// Para desplegar los criterios de filtrado 
const btnFiltrar = document.querySelector('.boton-crud-estudiantes:first-child'); 
const filtrosBusqueda = document.querySelector('.filtros-busqueda-estudiantes');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para estudiantes con el orden de columnas solicitado
    const tablaEstudiantes = new GenericTable(
        'estudiantes',
        'tabla-estudiantes',
        ['Cedula', 'Usuario', 'Nombres', 'Apellidos', 'Carrera', 'Estado_Pensum', 'Estado', 'Codigo_Carnet'],
        ['Cedula', 'Apellidos', 'Nombres', 'Estado_Pensum', 'Estado', 'Codigo_Carnet'] // Orden html
    );

    // Función para generar el carnet PDF con diálogo de guardado nativo
    const generarCarnetPDF = (estudiante) => {
        return new Promise((resolve) => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [86, 60]
            });

            // Diseño del carnet (fondo)
            doc.setFillColor(0, 86, 179);
            doc.rect(0, 0, 86, 60, 'F');
            doc.setFillColor(255, 255, 255);
            doc.rect(3, 3, 80, 54, 'F');

            // Logo
            const logoImg = new Image();
            logoImg.src = '../img/logoredu.png';
            logoImg.onload = () => {
                doc.addImage(logoImg, 'PNG', 10, 8, 15, 15);

                // Textos del carnet
                doc.setFont('helvetica', 'bold')
                   .setFontSize(10)
                   .setTextColor(0, 86, 179)
                   .text('UNIVERSIDAD REU', 43, 10, { align: 'center' });

                doc.setFont('helvetica', 'normal')
                   .setFontSize(8)
                   .setTextColor(51, 51, 51)
                   .text('Carnet Estudiantil', 43, 15, { align: 'center' });

                // Foto del estudiante
                const userImg = new Image();
                userImg.src = '../img/mis-datos.png';
                userImg.onload = () => {
                    doc.addImage(userImg, 'PNG', 33, 20, 20, 20);

                    // Datos del estudiante
                    doc.setFont('helvetica', 'bold')
                       .setFontSize(10)
                       .setTextColor(0, 0, 0)
                       .text(`${estudiante.Nombres} ${estudiante.Apellidos}`, 43, 45, { 
                           align: 'center', 
                           maxWidth: 80 
                       });

                    doc.setFont('helvetica', 'normal')
                       .setFontSize(8)
                       .setTextColor(51, 51, 51)
                       .text(`C.I.: ${estudiante.Cedula}`, 43, 49, { align: 'center' });

                    doc.setFont('helvetica', 'italic')
                       .setTextColor(0, 86, 179)
                       .text('ESTUDIANTE', 43, 53, { align: 'center' });

                    doc.setFont('helvetica', 'bold')
                       .setFontSize(8)
                       .setTextColor(0, 86, 179) 
                       .text(`Serial: ${estudiante.Codigo_Carnet || 'N/A'}`, 43, 56, { align: 'center' });

                    // Generar el Blob del PDF
                    const pdfBlob = doc.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    
                    // Crear enlace temporal para el diálogo de guardado
                    const downloadLink = document.createElement('a');
                    downloadLink.href = pdfUrl;
                    downloadLink.download = `carnet_${estudiante.Codigo_Carnet || estudiante.Cedula}.pdf`;
                    
                    // Adjuntar y hacer click para mostrar el diálogo
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    
                    // Limpieza después de 100ms
                    setTimeout(() => {
                        document.body.removeChild(downloadLink);
                        window.URL.revokeObjectURL(pdfUrl);
                        resolve();
                    }, 100);
                };
            };
        });
    };

    // Implementación del evento para el carnet (con el nuevo orden de columnas)
    tablaEstudiantes.onCarnetEstudiante = async (cedula) => {
        try {
            const filas = document.querySelectorAll('#tabla-estudiantes tbody tr');
            let estudiante = null;

            for (const fila of filas) {
                if (fila.cells[0].textContent.trim() === cedula) {
                    estudiante = {
                        Cedula: cedula,
                        Apellidos: fila.cells[1].textContent.trim(),
                        Nombres: fila.cells[2].textContent.trim(),
                        Estado_Pensum: fila.cells[3].textContent.trim(),
                        Estado: fila.cells[4].textContent.trim(),
                        Codigo_Carnet: fila.cells[5].textContent.trim()
                    };
                    break;
                }
            }

            if (!estudiante) throw new Error("No se encontraron datos del estudiante");

            await generarCarnetPDF(estudiante);
            
        } catch (error) {
            console.error('Error al generar carnet:', error);
            alert(`Error: ${error.message}`);
        }
    };


    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-estudiantes');
    const botonBuscar = document.querySelector('.boton-filtro-estudiantes:first-child');
    const btnReajustar = document.querySelector('.boton-filtro-estudiantes:last-child');
    const estadoSelect = document.querySelector('.estado-select');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

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
            const selectCarrera = document.getElementById('editar-carrera-estudiante');
            
            // Limpiar el select
            selectCarrera.innerHTML = '<option value="">Seleccione una carrera</option>';

            if (carreras.length === 0) {
                selectCarrera.innerHTML = '<option value="">No hay carreras registradas</option>';
                return;
            }

            // Agregar las opciones de carrera
            carreras.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera.Codigo_Carrera;
                option.textContent = carrera.Codigo_Carrera;
                selectCarrera.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar carreras:', error);
            const selectCarrera = document.getElementById('editar-carrera-estudiante');
            selectCarrera.innerHTML = '<option value="">Error al cargar carreras</option>';
        }
    }

    // Función para formatear el contenido de las celdas especiales
    const formatearCeldasEspeciales = () => {
        const filas = document.querySelectorAll('#tabla-estudiantes tbody tr');
        
        filas.forEach(fila => {
            // Formatear Estado_Pensum (columna 3 en la tabla mostrada)
            const pensumCell = fila.cells[3];
            const pensumValue = pensumCell.textContent.trim().toLowerCase();
            
            // Solo actualizar si el contenido no es el icono correcto
            const currentPensumIcon = pensumCell.querySelector('i');
            if (!currentPensumIcon || 
                (pensumValue === 'asignado' && !currentPensumIcon.classList.contains('pensum-asignado')) ||
                (pensumValue === 'pendiente' && !currentPensumIcon.classList.contains('pensum-pendiente'))) {
                
                if (pensumValue === 'asignado') {
                    pensumCell.innerHTML = '<i class="fas fa-circle pensum-asignado" title="Pensum Asignado"></i>';
                } else if (pensumValue === 'pendiente') {
                    pensumCell.innerHTML = '<i class="fas fa-circle pensum-pendiente" title="Pensum Pendiente"></i>';
                }
            }

            // Formatear Estado (columna 4 en la tabla mostrada)
            const estadoCell = fila.cells[4];
            const estadoValue = estadoCell.textContent.trim().toLowerCase();
            
            // Solo actualizar si el contenido no es el icono correcto
            const currentEstadoIcon = estadoCell.querySelector('i');
            if (!currentEstadoIcon || 
                (estadoValue === 'regular' && !currentEstadoIcon.classList.contains('estado-regular')) ||
                (estadoValue === 'nuevo-ingreso' && !currentEstadoIcon.classList.contains('estado-nuevo-ingreso'))) {
                
                if (estadoValue === 'regular') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-regular" title="Estudiante Regular"></i>';
                } else if (estadoValue === 'nuevo-ingreso') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-nuevo-ingreso" title="Nuevo Ingreso"></i>';
                }
            }
        });
    };

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-estudiantes tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla - CORREGIDA
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estadoFiltro = estadoSelect.value.toLowerCase(); // Convertir a minúsculas para comparación
        const tbody = document.querySelector('#tabla-estudiantes tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const cedula = fila.cells[0].textContent.toLowerCase();
            const apellidos = fila.cells[1].textContent.toLowerCase();
            const nombres = fila.cells[2].textContent.toLowerCase();
            
            // Obtener el estado real del texto (no del icono)
            const estadoCell = fila.cells[4];
            let estadoValue = '';
            
            // Verificar si tiene un icono para determinar el estado
            const estadoIcon = estadoCell.querySelector('i');
            if (estadoIcon) {
                if (estadoIcon.classList.contains('estado-regular')) {
                    estadoValue = 'regular';
                } else if (estadoIcon.classList.contains('estado-nuevo-ingreso')) {
                    estadoValue = 'nuevo-ingreso';
                }
            } else {
                // Si no hay icono, usar el texto directamente
                estadoValue = estadoCell.textContent.trim().toLowerCase();
            }

            const coincideBusqueda = textoBusqueda === '' || 
                                  cedula.includes(textoBusqueda) || 
                                  apellidos.includes(textoBusqueda) || 
                                  nombres.includes(textoBusqueda);

            // Comparar ambos valores en minúsculas
            const coincideEstado = estadoFiltro === '' || estadoValue === estadoFiltro;

            if (coincideBusqueda && coincideEstado) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        tablaEstudiantes.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estadoSelect.value = '';
        const tbody = document.querySelector('#tabla-estudiantes tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        tablaEstudiantes.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-estudiantes tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-estudiantes').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        // Reasignar eventos para las filas visibles
        formatearCeldasEspeciales();
        tablaEstudiantes.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-estudiantes');
        const nextButton = document.querySelector('.pagina-siguiente-estudiantes');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-estudiantes');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-estudiantes');
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
        const filas = document.querySelectorAll('#tabla-estudiantes tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior-estudiantes').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-estudiantes').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Métodos para editar
    tablaEstudiantes.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarModalEstudiantes');
        const editarForm = document.getElementById('editar-modal-form-estudiantes');

        // Cargar carreras antes de abrir el modal
        cargarCarreras().then(() => {
            const inputs = editarForm.querySelectorAll('input, select');
            inputs[0].value = datos[0]; // Cedula
            inputs[1].value = datos[1]; // Apellidos
            inputs[2].value = datos[2]; // Nombres
            
            // Establecer la carrera actual del estudiante
            const carreraActual = datos[4]; // Carrera está en la posición 4 de los datos
            const selectCarrera = document.getElementById('editar-carrera-estudiante');
            if (selectCarrera) {
                setTimeout(() => {
                    selectCarrera.value = carreraActual;
                }, 100);
            }
            
            inputs[4].value = datos[5]; // Estado_Pensum (posición 5)
            inputs[5].value = datos[6]; // Estado (posición 6)

            editarModal.style.display = 'block';

            editarForm.onsubmit = async (event) => {
                event.preventDefault();
                const nuevosDatos = {
                    Cedula: inputs[0].value,
                    Apellidos: inputs[1].value,
                    Nombres: inputs[2].value,
                    Carrera: document.getElementById('editar-carrera-estudiante').value,
                    Estado_Pensum: inputs[4].value,
                    Estado: inputs[5].value
                };

                try {
                    const token = getToken();
                    if (!token) throw new Error('No se encontró el token JWT');

                    const response = await fetch(`/api/estudiantes/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(nuevosDatos),
                    });

                    if (!response.ok) throw new Error('Error al editar el registro');
                    tablaEstudiantes.cargarDatos().then(() => {
                        formatearCeldasEspeciales();
                        clonarFilasOriginales();
                        actualizarPaginacion();
                    });
                    editarModal.style.display = 'none';
                } catch (error) {
                    console.error('Error:', error);
                }
            };
        });

        const editarClose = document.querySelector('.close');
        if (editarClose) {
            editarClose.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }

        const cancelarEditar = document.getElementById('cancelar-editar-modal-estudiantes');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

    // Evento para mostrar/ocultar filtros
    const btnFiltrar = document.querySelector('.boton-crud-estudiantes:first-child');
    const filtrosContainer = document.querySelector('.filtros-busqueda-estudiantes');
    
    btnFiltrar.addEventListener('click', () => {
        filtrosContainer.classList.toggle('oculto');
    });

    // Cargar carreras al iniciar la página
    cargarCarreras();

    // Inicialización
    tablaEstudiantes.cargarDatos().then(() => {
        formatearCeldasEspeciales();
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});