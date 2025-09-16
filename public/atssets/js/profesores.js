import GenericTable from './genericTable.js';

// Configuración del membrete - Cambia esta ruta por la correcta
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

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

    // Función para cargar imagen de manera asíncrona
    const cargarImagen = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn('No se pudo cargar la imagen del membrete:', url);
                resolve(null);
            };
            img.src = url;
        });
    };

    // Función para formatear fecha como YYYY-MM-DD
    const formatearFechaParaNombre = (fecha) => {
        const d = new Date(fecha);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Función para generar el PDF con todas las columnas y tabla centrada
    const generarPDF = async (datos) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;
        let yPos = 15;

        // 1. Cargar y agregar el membrete
        const imgMembrete = await cargarImagen(MEMBRETE_IMAGE_PATH);
        if (imgMembrete) {
            const imgWidth = 80;
            const imgHeight = (imgMembrete.height * imgWidth) / imgMembrete.width;
            const xPos = (pageWidth - imgWidth) / 2;
            
            doc.addImage(imgMembrete, 'JPEG', xPos, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 5;
        }

        // 2. Título del reporte
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text('Reporte Completo de Profesores', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // 3. Fecha de generación
        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(8);
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;

        // 4. Configuración de columnas (todas las columnas de la base de datos)
        const columnConfig = [
            { header: 'Cédula', dataKey: 'Cedula', width: 20 },
            { header: 'Usuario', dataKey: 'Usuario', width: 20 },
            { header: 'Nombres', dataKey: 'Nombres', width: 25 },
            { header: 'Apellidos', dataKey: 'Apellidos', width: 25 },
            { header: 'Estado Docente', dataKey: 'Estado_Docente', width: 25 },
            { header: 'Tipo', dataKey: 'Tipo', width: 20 },
            { header: 'Fecha Registro', dataKey: 'Fecha_Registro', width: 40 },
            { header: 'Código Carnet', dataKey: 'Codigo_Carnet', width: 25 },
            { header: 'Teléfono 1', dataKey: 'Telefono_1', width: 20 },
            { header: 'Teléfono 2', dataKey: 'Telefono_2', width: 20 },
            { header: 'Correo', dataKey: 'Correo', width: 30 }
        ];

        // Calcular el ancho total de la tabla
        const tableWidth = columnConfig.reduce((sum, col) => sum + col.width, 0);
        
        // Calcular el punto de inicio X para centrar la tabla
        const startX = (pageWidth - tableWidth) / 2;
        let currentX = startX;

        // 5. Dibujar tabla con bordes (centrada)
        // Estilo para encabezados
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40);

        // Dibujar encabezados con bordes
        columnConfig.forEach((col, index) => {
            doc.setFillColor(240, 240, 240);
            doc.rect(currentX, yPos, col.width, 8, 'F');
            doc.text(col.header, currentX + col.width / 2, yPos + 5, { 
                align: 'center',
                maxWidth: col.width - 2
            });
            doc.setDrawColor(200);
            doc.setLineWidth(0.1);
            doc.line(currentX, yPos, currentX, yPos + 8);
            
            if (index === columnConfig.length - 1) {
                doc.line(currentX + col.width, yPos, currentX + col.width, yPos + 8);
            }
            
            currentX += col.width;
        });

        doc.line(startX, yPos, currentX, yPos);
        doc.line(startX, yPos + 8, currentX, yPos + 8);
        yPos += 8;

        // Contenido de la tabla
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(0);

        datos.forEach((item, index) => {
            if (yPos > doc.internal.pageSize.getHeight() - 10) {
                doc.addPage('landscape');
                yPos = 15;
            }

            currentX = startX;
            let maxCellHeight = 0;

            columnConfig.forEach((col, colIndex) => {
                let cellContent = item[col.dataKey]?.toString() || '';
                
                // Formatear estados para mejor legibilidad
                if (col.dataKey === 'Estado_Docente') {
                    cellContent = cellContent === 'activo' ? 'Activo' : 'Inactivo';
                }
                
                if (col.dataKey === 'Tipo') {
                    cellContent = cellContent === 'normal' ? 'Normal' : 'Virtual';
                }

                const textLines = doc.splitTextToSize(cellContent, col.width - 2);
                const cellHeight = Math.max(8, textLines.length * 4);

                doc.setDrawColor(200);
                doc.setLineWidth(0.1);
                doc.line(currentX, yPos, currentX, yPos + cellHeight);

                doc.text(textLines, currentX + col.width / 2, yPos + 3, { 
                    align: 'center',
                    maxWidth: col.width - 2,
                    baseline: 'top'
                });

                if (colIndex === columnConfig.length - 1) {
                    doc.line(currentX + col.width, yPos, currentX + col.width, yPos + cellHeight);
                }

                currentX += col.width;
                maxCellHeight = Math.max(maxCellHeight, cellHeight);
            });

            doc.line(startX, yPos, currentX, yPos);
            doc.line(startX, yPos + maxCellHeight, currentX, yPos + maxCellHeight);
            
            yPos += maxCellHeight;
        });

        // Generar nombre de archivo con fecha
        const nombreArchivo = `Reporte-Profesores-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;
        
        return { doc, nombreArchivo };
    };

    // Evento para el botón de generar PDF
    const btnGenerarPDF = document.getElementById('boton-crud-profesores');
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', async () => {
            btnGenerarPDF.disabled = true;
            btnGenerarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/docentes', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Error al obtener datos para el reporte');
                const datos = await response.json();

                const { doc, nombreArchivo } = await generarPDF(datos);
                
                // Crear enlace de descarga con nombre personalizado
                const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                
                const a = document.createElement('a');
                a.href = pdfUrl;
                a.download = nombreArchivo;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Liberar memoria
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
                
            } catch (error) {
                console.error('Error al generar PDF:', error);
                alert('Error al generar el reporte: ' + error.message);
            } finally {
                btnGenerarPDF.disabled = false;
                btnGenerarPDF.innerHTML = '<i class="fas fa-file-pdf"></i> Ver Reporte';
            }
        });
    }

    // Función para generar la ficha del profesor en PDF
    const generarFichaPDF = (profesor) => {
        return new Promise((resolve) => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            let yPos = 15;

            // 1. Cargar y agregar el membrete
            const imgMembrete = new Image();
            imgMembrete.src = MEMBRETE_IMAGE_PATH;
            imgMembrete.onload = () => {
                const imgWidth = 50;
                const imgHeight = (imgMembrete.height * imgWidth) / imgMembrete.width;
                const xPos = (pageWidth - imgWidth) / 2;
                
                doc.addImage(imgMembrete, 'JPEG', xPos, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 10;

                // 2. Título del documento
                doc.setFontSize(16);
                doc.setTextColor(40);
                doc.text('Ficha del Profesor', pageWidth / 2, yPos, { align: 'center' });
                yPos += 10;

                // 3. Información del profesor
                doc.setFontSize(10);
                doc.setTextColor(0);

                // Datos personales
                doc.setFont('helvetica', 'bold');
                doc.text('Datos Personales:', margin, yPos);
                yPos += 7;

                doc.setFont('helvetica', 'normal');
                doc.text(`• Cédula: ${profesor.Cedula || 'N/A'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Nombres: ${profesor.Nombres || 'N/A'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Apellidos: ${profesor.Apellidos || 'N/A'}`, margin, yPos);
                yPos += 10;

                // Datos académicos
                doc.setFont('helvetica', 'bold');
                doc.text('Datos Académicos:', margin, yPos);
                yPos += 7;

                doc.setFont('helvetica', 'normal');
                doc.text(`• Tipo: ${profesor.Tipo === 'normal' ? 'Normal' : 'Virtual'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Estado: ${profesor.Estado_Docente === 'activo' ? 'Activo' : 'Inactivo'}`, margin, yPos);
                yPos += 5;
            
                doc.text(`• Código de Carnet: ${profesor.Codigo_Carnet || 'N/A'}`, margin, yPos);
                yPos += 10;

                // Datos de contacto
                doc.setFont('helvetica', 'bold');
                doc.text('Datos de Contacto:', margin, yPos);
                yPos += 7;

                doc.setFont('helvetica', 'normal');
                doc.text(`• Teléfono 1: ${profesor.Telefono_1 || 'N/A'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Teléfono 2: ${profesor.Telefono_2 || 'N/A'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Correo: ${profesor.Correo || 'N/A'}`, margin, yPos);
                yPos += 10;

                // Fecha de generación
                doc.setFontSize(8);
                doc.text(`Generado el: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });

                // Generar el Blob del PDF
                const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                
                // Crear enlace temporal para el diálogo de guardado
                const downloadLink = document.createElement('a');
                downloadLink.href = pdfUrl;
                downloadLink.download = `ficha_profesor_${profesor.Cedula}.pdf`;
                
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
        });
    };

    // Implementación del evento para la ficha del profesor
    tablaProfesores.onFichaProfesor = async (cedula) => {
        try {
            const filas = document.querySelectorAll('#tabla-profesores tbody tr');
            let profesor = null;

            for (const fila of filas) {
                if (fila.cells[0].textContent.trim() === cedula) {
                    profesor = {
                        Cedula: cedula,
                        Apellidos: fila.cells[1].textContent.trim(),
                        Nombres: fila.cells[2].textContent.trim(),
                        Tipo: fila.cells[3].textContent.trim().toLowerCase(),
                        Estado_Docente: fila.cells[4].textContent.trim().toLowerCase(),
                        Telefono_1: fila.cells[5]?.textContent.trim() || '',
                        Telefono_2: fila.cells[6]?.textContent.trim() || '',
                        Correo: fila.cells[7]?.textContent.trim() || '',
                        Codigo_Carnet: fila.cells[8]?.textContent.trim() || '',
                        Fecha_Registro: '' // Este dato no está en la tabla mostrada, se puede obtener de otra manera si es necesario
                    };
                    break;
                }
            }

            if (!profesor) throw new Error("No se encontraron datos del profesor");

            await generarFichaPDF(profesor);
            
        } catch (error) {
            console.error('Error al generar ficha:', error);
            alert(`Error: ${error.message}`);
        }
    };

    // Función para generar el carnet PDF con diálogo de guardado nativo
       const generarCarnetPDF = (profesor) => {
        return new Promise((resolve) => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [85, 120] // Tamaño vertical rectangular
            });

            // Bordes redondeados
            doc.setDrawColor(0, 86, 179);
            doc.setLineWidth(1);
            doc.roundedRect(5, 5, 75, 110, 5, 5, 'S');

            // Logo centrado en la parte superior
            const logoImg = new Image();
            logoImg.src = '../img/logoredu.ico';
            logoImg.onload = () => {
                doc.addImage(logoImg, 'PNG', 30, 10, 25, 25);

                // Textos del carnet
                doc.setFont('helvetica', 'bold')
                   .setFontSize(12)
                   .setTextColor(0, 86, 179)
                   .text('UNIVERSIDAD REU', 42.5, 40, { align: 'center' });

                doc.setFont('helvetica', 'normal')
                   .setFontSize(10)
                   .setTextColor(51, 51, 51)
                   .text('Carnet Docente', 42.5, 45, { align: 'center' });

                // Foto del docente
                const userImg = new Image();
                userImg.src = '../img/mis-datos.png';
                userImg.onload = () => {
                    doc.addImage(userImg, 'PNG', 27.5, 50, 30, 30);

                    // Datos del docente
                    doc.setFont('helvetica', 'bold')
                       .setFontSize(12)
                       .setTextColor(0, 0, 0)
                       .text(`${profesor.Nombres} ${profesor.Apellidos}`, 42.5, 85, { 
                           align: 'center', 
                           maxWidth: 70 
                       });

                    doc.setFont('helvetica', 'normal')
                       .setFontSize(10)
                       .setTextColor(51, 51, 51)
                       .text(`C.I.: ${profesor.Cedula}`, 42.5, 90, { align: 'center' });

                    doc.setFont('helvetica', 'italic')
                       .setTextColor(0, 86, 179)
                       .text('PROFESOR', 42.5, 95, { align: 'center' });

                    doc.setFont('helvetica', 'bold')
                       .setFontSize(10)
                       .setTextColor(0, 86, 179) 
                       .text(`Serial: ${profesor.Codigo_Carnet || 'N/A'}`, 42.5, 100, { align: 'center' });

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

    // Inicialización
    tablaProfesores.cargarDatos().then(() => {
        formatearCeldasEspeciales();
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});