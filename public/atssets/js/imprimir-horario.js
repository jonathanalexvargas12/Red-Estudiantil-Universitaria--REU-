import GenericTable from './genericTable.js';

// Configuración del membrete - Cambia esta ruta por la correcta
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

document.addEventListener('DOMContentLoaded', () => {
    const tablaHorario = new GenericTable(
        'horas',
        'tabla-horario',
        ['Desde', 'Hasta', 'Dias', 'Turno', 'Carrera', 'Pensum', 'Periodo_Academico', 'Seccion', 'Nivel', 'Asignatura', 'Docente'],
        ['Desde', 'Hasta', 'Dias', 'Turno', 'Carrera', 'Pensum', 'Periodo_Academico', 'Seccion', 'Nivel', 'Asignatura', 'Docente'],
        { disableEdit: true, disableDelete: true }
    );

    const getToken = () => localStorage.getItem('token');

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

    // Función para generar el PDF completo del horario
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
        doc.text('Reporte Completo de Horarios', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // 3. Fecha de generación
        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(8);
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;

        // 4. Configuración de columnas (todas las columnas de la base de datos)
        const columnConfig = [
            { header: 'Desde', dataKey: 'Desde', width: 15 },
            { header: 'Hasta', dataKey: 'Hasta', width: 15 },
            { header: 'Días', dataKey: 'Dias', width: 60 },
            { header: 'Turno', dataKey: 'Turno', width: 15 },
            { header: 'Carrera', dataKey: 'Carrera', width: 20 },
            { header: 'Pensum', dataKey: 'Pensum', width: 20 },
            { header: 'Periodo', dataKey: 'Periodo_Academico', width: 15 },
            { header: 'Sección', dataKey: 'Seccion', width: 15 },
            { header: 'Nivel', dataKey: 'Nivel', width: 20 },
            { header: 'Asignatura', dataKey: 'Asignatura', width: 25 },
            { header: 'Docente', dataKey: 'Docente', width: 25 }
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
        const nombreArchivo = `Reporte-Horarios-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;
        
        return { doc, nombreArchivo };
    };

    // Evento para el botón de generar PDF
    const btnGenerarPDF = document.getElementById('boton-crud-horario');
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', async () => {
            btnGenerarPDF.disabled = true;
            btnGenerarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/horas', {
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
                btnGenerarPDF.innerHTML = '<i class="fas fa-file-pdf"></i> Reporte';
            }
        });
    }

    // Función para generar el PDF del horario agrupado por Carrera, Seccion, Periodo_Academico y Nivel
    const generarHorarioPDF = async (grupo, registrosGrupo) => {
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
        doc.text(
            `Horario de Clases - ${grupo.Carrera} Sección ${grupo.Seccion} Periodo ${grupo.Periodo_Academico} Nivel ${grupo.Nivel}`,
            pageWidth / 2,
            yPos,
            { align: 'center' }
        );
        yPos += 8;

        // 3. Fecha de generación
        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(8);
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;

        // 4. Configuración de columnas
        const columnConfig = [
            { header: 'Desde', dataKey: 'Desde', width: 15 },
            { header: 'Hasta', dataKey: 'Hasta', width: 15 },
            { header: 'Días', dataKey: 'Dias', width: 60 },
            { header: 'Turno', dataKey: 'Turno', width: 15 },
            { header: 'Asignatura', dataKey: 'Asignatura', width: 25 },
            { header: 'Docente', dataKey: 'Docente', width: 30 },
            { header: 'Nivel', dataKey: 'Nivel', width: 25 }
        ];

        // Calcular el ancho total de la tabla
        const tableWidth = columnConfig.reduce((sum, col) => sum + col.width, 0);
        const startX = (pageWidth - tableWidth) / 2;
        let currentX = startX;

        // 5. Dibujar encabezados
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40);

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

        // 6. Contenido de la tabla
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(0);

        registrosGrupo.forEach((item, index) => {
            if (yPos > doc.internal.pageSize.getHeight() - 10) {
                doc.addPage('landscape');
                yPos = 15;
            }
            currentX = startX;
            let maxCellHeight = 0;
            columnConfig.forEach((col, colIndex) => {
                let cellContent = item[col.dataKey]?.toString() || '';
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

        // Generar nombre de archivo con carrera, sección, periodo y nivel
        const nombreArchivo = `Horario-${grupo.Carrera}-${grupo.Seccion}-${grupo.Periodo_Academico}-${grupo.Nivel}-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;

        return { doc, nombreArchivo };
    };

    // Implementación del evento para imprimir horario agrupado
    tablaHorario.onImprimirHorario = async (desde) => {
        try {
            // Obtener la fila que disparó el evento
            const filas = document.querySelectorAll('#tabla-horario tbody tr');
            let registroSeleccionado = null;

            for (const fila of filas) {
                if (fila.cells[0].textContent.trim() === desde) {
                    registroSeleccionado = {
                        Desde: fila.cells[0].textContent.trim(),
                        Hasta: fila.cells[1].textContent.trim(),
                        Dias: fila.cells[2].textContent.trim(),
                        Turno: fila.cells[3].textContent.trim(),
                        Carrera: fila.cells[4].textContent.trim(),
                        Pensum: fila.cells[5].textContent.trim(),
                        Periodo_Academico: fila.cells[6].textContent.trim(),
                        Seccion: fila.cells[7].textContent.trim(),
                        Nivel: fila.cells[8].textContent.trim(),
                        Asignatura: fila.cells[9].textContent.trim(),
                        Docente: fila.cells[10].textContent.trim()
                    };
                    break;
                }
            }

            if (!registroSeleccionado) throw new Error("No se encontró el registro seleccionado");

            // Obtener todos los registros para buscar coincidencias
            let registrosAdicionales = [];
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/horas', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    registrosAdicionales = await response.json();
                }
            } catch (error) {
                console.warn('Error al obtener registros adicionales:', error);
            }

            // Filtrar todos los registros que coincidan en Carrera, Seccion, Periodo_Academico y Nivel
            const registrosGrupo = registrosAdicionales.filter(r =>
                r.Carrera === registroSeleccionado.Carrera &&
                r.Seccion === registroSeleccionado.Seccion &&
                r.Periodo_Academico === registroSeleccionado.Periodo_Academico &&
                r.Nivel === registroSeleccionado.Nivel
            );

            // Si el registro seleccionado no está en el grupo, lo agregamos al inicio
            if (!registrosGrupo.some(r =>
                r.Desde === registroSeleccionado.Desde &&
                r.Hasta === registroSeleccionado.Hasta &&
                r.Asignatura === registroSeleccionado.Asignatura
            )) {
                registrosGrupo.unshift(registroSeleccionado);
            }

            // Generar el PDF con el grupo de registros
            const { doc, nombreArchivo } = await generarHorarioPDF(
                registroSeleccionado,
                registrosGrupo
            );

            // Crear enlace de descarga con nombre personalizado
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);

            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);

            tablaHorario.cargarDatos().then(() => {
                clonarFilasOriginales();
                actualizarPaginacion();
            });

        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el horario: ' + error.message);
        }
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-horario');
    const botonBuscar = document.querySelector('.btn-buscar-horario');
    const btnReajustar = document.querySelector('.btn-reajustar-horario');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-horario tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    const filtrarTabla = () => {
        const terminoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-horario tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const textoFila = Array.from(fila.cells)
                .map(celda => celda.textContent.toLowerCase())
                .join(' ');

            if (textoFila.includes(terminoBusqueda)) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
    };

    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-horario tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-horario').textContent =
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    // Actualizar botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-horario');
        const nextButton = document.querySelector('.pagina-siguiente-horario');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-horario');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-horario');
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
        const filas = document.querySelectorAll('#tabla-horario tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-horario tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        actualizarPaginacion();
    });

    document.querySelector('.pagina-anterior-horario').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-horario').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Cargar datos iniciales
    tablaHorario.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});