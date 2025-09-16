import GenericTable from './genericTable.js';

// Configuración del membrete - Cambia esta ruta por la correcta
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

// Para que se desplieguen los filtros de búsqueda
const btnFiltrarBitacora = document.getElementById('btn-filtrar-bitacora');
const filtrosBusquedaBitacora = document.getElementById('filtros-busqueda-bitacora');

btnFiltrarBitacora.addEventListener('click', () => {
    filtrosBusquedaBitacora.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para bitácora
    const tablaBitacora = new GenericTable(
        'bitacora',
        'tabla-bitacora',
        ['ID', 'Fecha', 'Hora', 'IP', 'Usuario_ID', 'Accion', 'Fecha_Registro'],
        ['ID', 'Fecha', 'Hora', 'IP', 'Usuario_ID', 'Accion'],
        { disableEdit: true, disableDelete: true }
    );

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Variables para paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-bitacora');
    const botonBuscar = document.querySelector('.btn-buscar-bitacora');
    const btnReajustar = document.querySelector('.btn-reajustar-bitacora');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-bitacora tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-bitacora tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const id = fila.cells[0].textContent.toLowerCase();
            const fecha = fila.cells[1].textContent.toLowerCase();
            const hora = fila.cells[2].textContent.toLowerCase();
            const ip = fila.cells[3].textContent.toLowerCase();
            const usuario = fila.cells[4].textContent.toLowerCase();
            const accion = fila.cells[5].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                                  id.includes(textoBusqueda) || 
                                  fecha.includes(textoBusqueda) ||
                                  hora.includes(textoBusqueda) ||
                                  ip.includes(textoBusqueda) ||
                                  usuario.includes(textoBusqueda) ||
                                  accion.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
    };

    // Mostrar filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-bitacora tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-bitacora').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    // Actualizar botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-bitacora');
        const nextButton = document.querySelector('.pagina-siguiente-bitacora');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-bitacora');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-bitacora');
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
        const filas = document.querySelectorAll('#tabla-bitacora tbody tr');
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
        const tbody = document.querySelector('#tabla-bitacora tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        actualizarPaginacion();
    });

    document.querySelector('.pagina-anterior-bitacora').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-bitacora').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

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

    // Función para generar el PDF
    const generarPDF = async (datos) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let yPos = 15;

        // 1. Cargar y agregar el membrete
        const imgMembrete = await cargarImagen(MEMBRETE_IMAGE_PATH);
        if (imgMembrete) {
            const imgWidth = 100;
            const imgHeight = (imgMembrete.height * imgWidth) / imgMembrete.width;
            const xPos = (pageWidth - imgWidth) / 2;
            
            doc.addImage(imgMembrete, 'JPEG', xPos, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 5;
        }

        // 2. Título del reporte
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text('Reporte de Bitácora', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        // 3. Fecha de generación
        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(10);
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 10;

        // 4. Configuración de columnas (Aumenté el ancho de la columna Fecha a 35mm)
        const columnConfig = [
            { header: 'ID', dataKey: 'ID', width: 15 },
            { header: 'Fecha', dataKey: 'Fecha', width: 55 },  
            { header: 'Hora', dataKey: 'Hora', width: 20 },
            { header: 'IP', dataKey: 'IP', width: 30 },
            { header: 'Usuario ID', dataKey: 'Usuario_ID', width: 25 },
            { header: 'Acción', dataKey: 'Accion', width: 40 }  // Reducido de 75 a 70 para compensar
        ];

        // 5. Dibujar tabla con bordes
        const startX = margin;
        let currentX = startX;

        // Estilo para encabezados
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40);

        // Dibujar encabezados con bordes
        columnConfig.forEach((col, index) => {
            doc.setFillColor(240, 240, 240);
            doc.rect(currentX, yPos, col.width, 10, 'F');
            doc.text(col.header, currentX + col.width / 2, yPos + 7, { align: 'center' });
            doc.setDrawColor(200);
            doc.setLineWidth(0.2);
            doc.line(currentX, yPos, currentX, yPos + 10);
            
            if (index === columnConfig.length - 1) {
                doc.line(currentX + col.width, yPos, currentX + col.width, yPos + 10);
            }
            
            currentX += col.width;
        });

        doc.line(startX, yPos, currentX, yPos);
        doc.line(startX, yPos + 10, currentX, yPos + 10);
        yPos += 10;

        // Contenido de la tabla
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0);

        datos.forEach((item, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 15;
            }

            currentX = startX;
            let maxCellHeight = 0;

            columnConfig.forEach((col, colIndex) => {
                const cellContent = item[col.dataKey]?.toString() || '';
                const textLines = doc.splitTextToSize(cellContent, col.width - 2);
                const cellHeight = Math.max(10, textLines.length * 10);

                doc.setDrawColor(200);
                doc.setLineWidth(0.1);
                doc.line(currentX, yPos, currentX, yPos + cellHeight);

                doc.text(textLines, currentX + 2, yPos + 5, {
                    maxWidth: col.width - 4,
                    align: 'left',
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
        const nombreArchivo = `Reporte-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;
        
        return { doc, nombreArchivo };
    };

    // Evento para el botón de generar PDF
    const btnGenerarPDF = document.getElementById('btn-generar-pdf-bitacora');
    btnGenerarPDF.addEventListener('click', async () => {
        btnGenerarPDF.disabled = true;
        btnGenerarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/bitacora', {
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

    // Inicialización
    tablaBitacora.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
        
        // Ocultar columna de acciones
        const accionesHeader = document.querySelector('#tabla-bitacora thead tr th:nth-child(7)');
        const accionesCells = document.querySelectorAll('#tabla-bitacora tbody tr td:nth-child(7)');
        
        if (accionesHeader) accionesHeader.style.display = 'none';
        accionesCells.forEach(cell => cell.style.display = 'none');
    });
});