import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

// Configuración del membrete - Cambia esta ruta por la correcta
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

// Para desplegar los criterios de filtrado 
const btnFiltrar = document.querySelector('.boton-crud-estudiantes:first-child'); 
const filtrosBusqueda = document.querySelector('.filtros-busqueda-estudiantes');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para estudiantes
    const tablaEstudiantes = new GenericTable(
        'estudiantes', // Nombre de la tabla en la base de datos
        'tabla-estudiantes', // ID de la tabla HTML
        ['Cedula', 'Usuario', 'Nombres', 'Apellidos', 'Carrera', 'Estado_Pensum', 'Estado', 'Telefono_1', 'Telefono_2', 'Correo', 'Codigo_Carnet'], // Todas las columnas
        ['Cedula', 'Apellidos', 'Nombres', 'Carrera', 'Estado_Pensum', 'Estado', 'Telefono_1', 'Telefono_2', 'Correo', 'Codigo_Carnet'] // Columnas a mostrar en la tabla HTML
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
        doc.text('Reporte Completo de Estudiantes', pageWidth / 2, yPos, { align: 'center' });
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
            { header: 'Apellidos', dataKey: 'Apellidos', width: 25 },
            { header: 'Nombres', dataKey: 'Nombres', width: 25 },
            { header: 'Carrera', dataKey: 'Carrera', width: 20 },
            { header: 'Estado Pensum', dataKey: 'Estado_Pensum', width: 25 },
            { header: 'Estado', dataKey: 'Estado', width: 20 },
            { header: 'Teléfono 1', dataKey: 'Telefono_1', width: 20 },
            { header: 'Teléfono 2', dataKey: 'Telefono_2', width: 20 },
            { header: 'Correo', dataKey: 'Correo', width: 30 },
            { header: 'Código Carnet', dataKey: 'Codigo_Carnet', width: 25 }
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
                if (col.dataKey === 'Estado_Pensum') {
                    cellContent = cellContent === 'asignado' ? 'Asignado' : 'Pendiente';
                }
                
                if (col.dataKey === 'Estado') {
                    cellContent = cellContent === 'regular' ? 'Regular' : 
                                 cellContent === 'nuevo-ingreso' ? 'Nuevo Ingreso' : cellContent;
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
        const nombreArchivo = `Reporte-Estudiantes-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;
        
        return { doc, nombreArchivo };
    };

    // Evento para el botón de generar PDF
    const btnGenerarPDF = document.getElementById('boton-crud-estudiantes');
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', async () => {
            btnGenerarPDF.disabled = true;
            btnGenerarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/estudiantes', {
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

    // Función para generar la ficha del estudiante en PDF
    const generarFichaPDF = (estudiante) => {
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
                doc.text('Ficha del Estudiante', pageWidth / 2, yPos, { align: 'center' });
                yPos += 10;

                // 3. Información del estudiante
                doc.setFontSize(10);
                doc.setTextColor(0);

                // Datos personales
                doc.setFont('helvetica', 'bold');
                doc.text('Datos Personales:', margin, yPos);
                yPos += 7;

                doc.setFont('helvetica', 'normal');
                doc.text(`• Cédula: ${estudiante.Cedula || 'N/A'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Nombres: ${estudiante.Nombres || 'N/A'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Apellidos: ${estudiante.Apellidos || 'N/A'}`, margin, yPos);
                yPos += 10;

                // Datos académicos
                doc.setFont('helvetica', 'bold');
                doc.text('Datos Académicos:', margin, yPos);
                yPos += 7;

                doc.setFont('helvetica', 'normal');
                doc.text(`• Carrera: ${estudiante.Carrera || 'N/A'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Estado Pensum: ${estudiante.Estado_Pensum === 'asignado' ? 'Asignado' : 'Pendiente'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Estado: ${estudiante.Estado === 'regular' ? 'Regular' : 'Nuevo Ingreso'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Código de Carnet: ${estudiante.Codigo_Carnet || 'N/A'}`, margin, yPos);
                yPos += 10;

                // Datos de contacto
                doc.setFont('helvetica', 'bold');
                doc.text('Datos de Contacto:', margin, yPos);
                yPos += 7;

                doc.setFont('helvetica', 'normal');
                doc.text(`• Teléfono 1: ${estudiante.Telefono_1 || 'N/A'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Teléfono 2: ${estudiante.Telefono_2 || 'N/A'}`, margin, yPos);
                yPos += 5;
                doc.text(`• Correo: ${estudiante.Correo || 'N/A'}`, margin, yPos);
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
                downloadLink.download = `ficha_estudiante_${estudiante.Cedula}.pdf`;
                
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

    // Implementación del evento para la ficha del estudiante
    tablaEstudiantes.onFichaEstudiante = async (cedula) => {
        try {
            const filas = document.querySelectorAll('#tabla-estudiantes tbody tr');
            let estudiante = null;

            for (const fila of filas) {
                if (fila.cells[0].textContent.trim() === cedula) {
                    estudiante = {
                        Cedula: cedula,
                        Apellidos: fila.cells[1].textContent.trim(),
                        Nombres: fila.cells[2].textContent.trim(),
                        Carrera: fila.cells[3].textContent.trim(),
                        Estado_Pensum: fila.cells[4].textContent.trim().toLowerCase(),
                        Estado: fila.cells[5].textContent.trim().toLowerCase(),
                        Telefono_1: fila.cells[6]?.textContent.trim() || '',
                        Telefono_2: fila.cells[7]?.textContent.trim() || '',
                        Correo: fila.cells[8]?.textContent.trim() || '',
                        Codigo_Carnet: fila.cells[9]?.textContent.trim() || ''
                    };
                    break;
                }
            }

            if (!estudiante) throw new Error("No se encontraron datos del estudiante");

            await generarFichaPDF(estudiante);
            
        } catch (error) {
            console.error('Error al generar ficha:', error);
            alert(`Error: ${error.message}`);
        }
    };

    // Función para generar el carnet PDF con diálogo de guardado nativo
    const generarCarnetPDF = (estudiante) => {
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
                   .text('Carnet Estudiantil', 42.5, 45, { align: 'center' });

                // Foto del estudiante
                const userImg = new Image();
                userImg.src = '../img/mis-datos.png';
                userImg.onload = () => {
                    doc.addImage(userImg, 'PNG', 27.5, 50, 30, 30);

                    // Datos del estudiante
                    doc.setFont('helvetica', 'bold')
                       .setFontSize(12)
                       .setTextColor(0, 0, 0)
                       .text(`${estudiante.Nombres} ${estudiante.Apellidos}`, 42.5, 85, { 
                           align: 'center', 
                           maxWidth: 70 
                       });

                    doc.setFont('helvetica', 'normal')
                       .setFontSize(10)
                       .setTextColor(51, 51, 51)
                       .text(`C.I.: ${estudiante.Cedula}`, 42.5, 90, { align: 'center' });

                    doc.setFont('helvetica', 'italic')
                       .setTextColor(0, 86, 179)
                       .text('ESTUDIANTE', 42.5, 95, { align: 'center' });

                    doc.setFont('helvetica', 'bold')
                       .setFontSize(10)
                       .setTextColor(0, 86, 179) 
                       .text(`Serial: ${estudiante.Codigo_Carnet || 'N/A'}`, 42.5, 100, { align: 'center' });

                    // Generar el Blob del PDF
                    const pdfBlob = doc.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    
                    // Crear enlace temporal para el diálogo de guardado
                    const downloadLink = document.createElement('a');
                    downloadLink.href = pdfUrl;
                    downloadLink.download = `carnet_estudiante_${estudiante.Codigo_Carnet || estudiante.Cedula}.pdf`;
                    
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

    // Implementación del evento para el carnet de estudiante
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
                        Codigo_Carnet: fila.cells[9]?.textContent.trim() || ''
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
            // CORRECCIÓN: Índices actualizados para Estado_Pensum (4) y Estado (5)
            const pensumCell = fila.cells[4]; // Estado_Pensum
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

            // CORRECCIÓN: Índices actualizados para Estado (5)
            const estadoCell = fila.cells[5]; // Estado
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

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estadoFiltro = estadoSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-estudiantes tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const cedula = fila.cells[0].textContent.toLowerCase();
            const apellidos = fila.cells[1].textContent.toLowerCase();
            const nombres = fila.cells[2].textContent.toLowerCase();
            
            // CORRECCIÓN: Índice actualizado para Estado (5)
            const estadoCell = fila.cells[5]; 
            let estadoValue = '';
            const estadoIcon = estadoCell.querySelector('i');
            if (estadoIcon) {
                if (estadoIcon.classList.contains('estado-regular')) {
                    estadoValue = 'regular';
                } else if (estadoIcon.classList.contains('estado-nuevo-ingreso')) {
                    estadoValue = 'nuevo-ingreso';
                }
            } else {
                estadoValue = estadoCell.textContent.trim().toLowerCase();
            }

            const coincideBusqueda = textoBusqueda === '' || 
                                  cedula.includes(textoBusqueda) || 
                                  apellidos.includes(textoBusqueda) || 
                                  nombres.includes(textoBusqueda);

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
        renderizarPaginacion({
            sufijo: '-estudiantes',
            paginaActual: currentPage,
            totalPaginas: totalPages,
            alCambiarPagina: (pagina) => {
                currentPage = pagina;
                displayRows(currentPage);
                updatePaginationButtons();
            }
        });
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
    tablaEstudiantes.onEditar = (id, datos, item) => {
        const editarModal = document.getElementById('editarModalEstudiantes');
        const editarForm = document.getElementById('editar-modal-form-estudiantes');

        // Cargar carreras antes de abrir el modal
        cargarCarreras().then(() => {
            const inputs = editarForm.querySelectorAll('input, select');
            inputs[0].value = item.Cedula || datos[0] || '';
            inputs[1].value = item.Apellidos || datos[1] || '';
            inputs[2].value = item.Nombres || datos[2] || '';
            
            // Establecer la carrera actual del estudiante
            const carreraActual = item.Carrera || '';
            const selectCarrera = document.getElementById('editar-carrera-estudiante');
            if (selectCarrera) {
                selectCarrera.value = carreraActual;
            }
            
            inputs[4].value = item.Estado_Pensum || '';
            inputs[5].value = item.Estado || '';

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

    // Métodos para eliminar
    tablaEstudiantes.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar');
        const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
        const eliminarClose = document.querySelector('.eliminar-close');

        const eliminarRegistro = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/estudiantes/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                tablaEstudiantes.cargarDatos().then(() => {
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

    // Cargar carreras al iniciar la página
    cargarCarreras();

        // Inicialización
    tablaEstudiantes.cargarDatos().then(() => {
        formatearCeldasEspeciales();
        clonarFilasOriginales(); 
        actualizarPaginacion();
    });
});