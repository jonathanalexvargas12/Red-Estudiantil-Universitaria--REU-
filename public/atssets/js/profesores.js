import GenericTable from './genericTable.js';

// Para desplegar los criterios de filtrado 
const btnFiltrar = document.querySelector('.boton-crud-profesores:first-child'); 
const filtrosBusqueda = document.querySelector('.filtros-busqueda-profesores');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para profesores
    const tablaProfesores = new GenericTable(
        'docentes', // Nombre de la tabla en la base de datos
        'tabla-profesores', // ID de la tabla HTML
        ['Cedula', 'Usuario', 'Nombres', 'Apellidos', 'Estado_Docente', 'Tipo', 'Fecha_Registro', 'Codigo_Carnet', 'Telefono_1', 'Telefono_2', 'Correo'], // Todas las columnas
        ['Cedula', 'Apellidos', 'Nombres', 'Tipo', 'Estado_Docente', 'Telefono_1', 'Telefono_2', 'Correo', 'Codigo_Carnet'] // Columnas a mostrar en la tabla HTML
    );

    // Función para generar el carnet PDF con diálogo de guardado nativo
    const generarCarnetPDF = (profesor) => {
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
                   .text('Carnet Docente', 43, 15, { align: 'center' });

                // Foto del profesor
                const userImg = new Image();
                userImg.src = '../img/mis-datos.png';
                userImg.onload = () => {
                    doc.addImage(userImg, 'PNG', 33, 20, 20, 20);

                    // Datos del profesor
                    doc.setFont('helvetica', 'bold')
                       .setFontSize(10)
                       .setTextColor(0, 0, 0)
                       .text(`${profesor.Nombres} ${profesor.Apellidos}`, 43, 45, { 
                           align: 'center', 
                           maxWidth: 80 
                       });

                    doc.setFont('helvetica', 'normal')
                       .setFontSize(8)
                       .setTextColor(51, 51, 51)
                       .text(`C.I.: ${profesor.Cedula}`, 43, 49, { align: 'center' });

                    doc.setFont('helvetica', 'italic')
                       .setTextColor(0, 86, 179)
                       .text('PROFESOR', 43, 53, { align: 'center' });

                    doc.setFont('helvetica', 'bold')
                       .setFontSize(8)
                       .setTextColor(0, 86, 179) 
                       .text(`Serial: ${profesor.Codigo_Carnet || 'N/A'}`, 43, 56, { align: 'center' });

                    // Generar el Blob del PDF
                    const pdfBlob = doc.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    
                    // Crear enlace temporal para el diálogo de guardado
                    const downloadLink = document.createElement('a');
                    downloadLink.href = pdfUrl;
                    downloadLink.download = `carnet_profesor_${profesor.Codigo_Carnet || profesor.Cedula}.pdf`;
                    
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

    // Implementación del evento para el carnet de profesor
    tablaProfesores.onCarnetProfesor = async (cedula) => {
        try {
            const filas = document.querySelectorAll('#tabla-profesores tbody tr');
            let profesor = null;

            for (const fila of filas) {
                if (fila.cells[0].textContent.trim() === cedula) {
                    profesor = {
                        Cedula: cedula,
                        Apellidos: fila.cells[1].textContent.trim(),
                        Nombres: fila.cells[2].textContent.trim(),
                        Codigo_Carnet: fila.cells[8]?.textContent.trim() || ''
                    };
                    break;
                }
            }

            if (!profesor) throw new Error("No se encontraron datos del profesor");

            await generarCarnetPDF(profesor);
            
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
    const buscarInput = document.querySelector('.buscar-input-profesores');
    const botonBuscar = document.querySelector('.boton-filtro-profesores:first-child');
    const btnReajustar = document.querySelector('.boton-filtro-profesores:last-child');
    const tipoSelect = document.querySelector('.tipo-select');
    const estadoSelect = document.querySelector('.estado-profesores-select');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para formatear el contenido de las celdas especiales
    const formatearCeldasEspeciales = () => {
        const filas = document.querySelectorAll('#tabla-profesores tbody tr');
        
        filas.forEach(fila => {
            // Formatear Tipo (columna 3 en la tabla mostrada)
            const tipoCell = fila.cells[3];
            const tipoValue = tipoCell.textContent.trim().toLowerCase();
            
            // Solo actualizar si el contenido no es el icono correcto
            const currentTipoIcon = tipoCell.querySelector('i');
            if (!currentTipoIcon || 
                (tipoValue === 'normal' && !currentTipoIcon.classList.contains('tipo-normal')) ||
                (tipoValue === 'virtual' && !currentTipoIcon.classList.contains('tipo-virtual'))) {
                
                if (tipoValue === 'normal') {
                    tipoCell.innerHTML = '<i class="fas fa-circle tipo-normal" title="Profesor Normal"></i>';
                } else if (tipoValue === 'virtual') {
                    tipoCell.innerHTML = '<i class="fas fa-circle tipo-virtual" title="Profesor Virtual"></i>';
                }
            }

            // Formatear Estado_Docente (columna 4 en la tabla mostrada)
            const estadoCell = fila.cells[4];
            const estadoValue = estadoCell.textContent.trim().toLowerCase();
            
            // Solo actualizar si el contenido no es el icono correcto
            const currentEstadoIcon = estadoCell.querySelector('i');
            if (!currentEstadoIcon || 
                (estadoValue === 'activo' && !currentEstadoIcon.classList.contains('estado-activo')) ||
                (estadoValue === 'inactivo' && !currentEstadoIcon.classList.contains('estado-inactivo'))) {
                
                if (estadoValue === 'activo') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-activo" title="Activo"></i>';
                } else if (estadoValue === 'inactivo') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-inactivo" title="Inactivo"></i>';
                }
            }
        });
    };

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-profesores tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tipoFiltro = tipoSelect.value.toLowerCase();
        const estadoFiltro = estadoSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-profesores tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const cedula = fila.cells[0].textContent.toLowerCase();
            const apellidos = fila.cells[1].textContent.toLowerCase();
            const nombres = fila.cells[2].textContent.toLowerCase();
            
            // Obtener el tipo real del texto (no del icono)
            const tipoCell = fila.cells[3];
            let tipoValue = '';
            const tipoIcon = tipoCell.querySelector('i');
            if (tipoIcon) {
                if (tipoIcon.classList.contains('tipo-normal')) {
                    tipoValue = 'normal';
                } else if (tipoIcon.classList.contains('tipo-virtual')) {
                    tipoValue = 'virtual';
                }
            } else {
                tipoValue = tipoCell.textContent.trim().toLowerCase();
            }
            
            // Obtener el estado real del texto (no del icono)
            const estadoCell = fila.cells[4];
            let estadoValue = '';
            const estadoIcon = estadoCell.querySelector('i');
            if (estadoIcon) {
                if (estadoIcon.classList.contains('estado-activo')) {
                    estadoValue = 'activo';
                } else if (estadoIcon.classList.contains('estado-inactivo')) {
                    estadoValue = 'inactivo';
                }
            } else {
                estadoValue = estadoCell.textContent.trim().toLowerCase();
            }

            const coincideBusqueda = textoBusqueda === '' || 
                                  cedula.includes(textoBusqueda) || 
                                  apellidos.includes(textoBusqueda) || 
                                  nombres.includes(textoBusqueda);

            const coincideTipo = tipoFiltro === '' || tipoValue === tipoFiltro;
            const coincideEstado = estadoFiltro === '' || estadoValue === estadoFiltro;

            if (coincideBusqueda && coincideTipo && coincideEstado) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        tablaProfesores.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        tipoSelect.value = '';
        estadoSelect.value = '';
        const tbody = document.querySelector('#tabla-profesores tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        tablaProfesores.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-profesores tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-profesores').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        // Reasignar eventos para las filas visibles
        formatearCeldasEspeciales();
        tablaProfesores.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-profesores');
        const nextButton = document.querySelector('.pagina-siguiente-profesores');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-profesores');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-profesores');
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
        const filas = document.querySelectorAll('#tabla-profesores tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior-profesores').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-profesores').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Métodos para editar
    tablaProfesores.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarModal');
        const editarForm = document.getElementById('editar-modal-form');

        const inputs = editarForm.querySelectorAll('input, select');
        inputs[0].value = datos[0]; // Cedula
        inputs[1].value = datos[1]; // Apellidos
        inputs[2].value = datos[2]; // Nombres
        inputs[3].value = datos[3].toLowerCase(); // Tipo (ya formateado)
        inputs[4].value = datos[4].toLowerCase(); // Estado (ya formateado)

        editarModal.style.display = 'block';

        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Cedula: inputs[0].value,
                Apellidos: inputs[1].value,
                Nombres: inputs[2].value,
                Tipo: inputs[3].value,
                Estado_Docente: inputs[4].value
            };

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/docentes/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevosDatos),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                tablaProfesores.cargarDatos().then(() => {
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

        const cancelarEditar = document.getElementById('cancelar-editar-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

    // Métodos para eliminar
    tablaProfesores.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar');
        const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
        const eliminarClose = document.querySelector('.eliminar-close');

        const eliminarRegistro = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/docentes/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                tablaProfesores.cargarDatos().then(() => {
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

    // Evento para mostrar/ocultar filtros
    const btnFiltrar = document.querySelector('.boton-crud-profesores:first-child');
    const filtrosContainer = document.querySelector('.filtros-busqueda-profesores');
    
    btnFiltrar.addEventListener('click', () => {
        filtrosContainer.classList.toggle('oculto');
    });

    // Inicialización
    tablaProfesores.cargarDatos().then(() => {
        formatearCeldasEspeciales();
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});