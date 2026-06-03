import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

const btnFiltrarBitacora = document.getElementById('btn-filtrar-bitacora');
const filtrosBusquedaBitacora = document.getElementById('filtros-busqueda-bitacora');

btnFiltrarBitacora.addEventListener('click', () => {
    filtrosBusquedaBitacora.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    const tablaBitacora = new GenericTable(
        'bitacora',
        'tabla-bitacora',
        ['ID', 'Fecha', 'Hora', 'IP', 'Usuario_ID', 'Accion', 'Modulo', 'Registro_ID', 'Detalles'],
        ['ID', 'Fecha', 'Hora', 'IP', 'Usuario_ID', 'Accion', 'Modulo'],
        { disableEdit: true, disableDelete: true }
    );

    const getToken = () => localStorage.getItem('token');

    const buscarInput = document.querySelector('.buscar-input-bitacora');
    const botonBuscar = document.querySelector('.btn-buscar-bitacora');
    const btnReajustar = document.querySelector('.btn-reajustar-bitacora');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-bitacora tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-bitacora tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const id = fila.cells[0]?.textContent.toLowerCase() || '';
            const fecha = fila.cells[1]?.textContent.toLowerCase() || '';
            const hora = fila.cells[2]?.textContent.toLowerCase() || '';
            const ip = fila.cells[3]?.textContent.toLowerCase() || '';
            const usuario = fila.cells[4]?.textContent.toLowerCase() || '';
            const accion = fila.cells[5]?.textContent.toLowerCase() || '';
            const modulo = fila.cells[6]?.textContent.toLowerCase() || '';

            const coincideBusqueda = textoBusqueda === '' ||
                                  id.includes(textoBusqueda) ||
                                  fecha.includes(textoBusqueda) ||
                                  hora.includes(textoBusqueda) ||
                                  ip.includes(textoBusqueda) ||
                                  usuario.includes(textoBusqueda) ||
                                  accion.includes(textoBusqueda) ||
                                  modulo.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
    };

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

    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-bitacora',
            paginaActual: currentPage,
            totalPaginas: totalPages,
            alCambiarPagina: (pagina) => {
                currentPage = pagina;
                displayRows(currentPage);
                updatePaginationButtons();
            }
        });
    };

    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-bitacora tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

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

    const formatearFechaParaNombre = (fecha) => {
        const d = new Date(fecha);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const generarPDF = async (datos) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let yPos = 15;

        const imgMembrete = await cargarImagen(MEMBRETE_IMAGE_PATH);
        if (imgMembrete) {
            const imgWidth = 100;
            const imgHeight = (imgMembrete.height * imgWidth) / imgMembrete.width;
            const xPos = (pageWidth - imgWidth) / 2;

            doc.addImage(imgMembrete, 'JPEG', xPos, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 5;
        }

        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text('Reporte de Bitácora', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(10);
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 10;

        const columnConfig = [
            { header: 'ID', dataKey: 'ID', width: 12 },
            { header: 'Fecha', dataKey: 'Fecha', width: 30 },
            { header: 'Hora', dataKey: 'Hora', width: 18 },
            { header: 'IP', dataKey: 'IP', width: 30 },
            { header: 'Usuario', dataKey: 'Usuario_ID', width: 22 },
            { header: 'Acción', dataKey: 'Accion', width: 30 },
            { header: 'Módulo', dataKey: 'Modulo', width: 25 }
        ];

        const startX = margin;
        let currentX = startX;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40);

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

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0);

        datos.forEach((item) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 15;
            }

            currentX = startX;
            let maxCellHeight = 10;

            columnConfig.forEach((col) => {
                const cellContent = item[col.dataKey]?.toString() || '';
                const textLines = doc.splitTextToSize(cellContent, col.width - 2);

                doc.setDrawColor(200);
                doc.setLineWidth(0.1);
                doc.line(currentX, yPos, currentX, yPos + maxCellHeight);

                doc.text(textLines, currentX + 1, yPos + 3, {
                    maxWidth: col.width - 2,
                    align: 'left',
                    baseline: 'top'
                });

                if (col === columnConfig[columnConfig.length - 1]) {
                    doc.line(currentX + col.width, yPos, currentX + col.width, yPos + maxCellHeight);
                }

                currentX += col.width;
            });

            doc.line(startX, yPos, currentX, yPos);
            doc.line(startX, yPos + maxCellHeight, currentX, yPos + maxCellHeight);

            yPos += maxCellHeight;
        });

        const nombreArchivo = `Reporte-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;
        return { doc, nombreArchivo };
    };

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

            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);

            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);

        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el reporte: ' + error.message);
        } finally {
            btnGenerarPDF.disabled = false;
            btnGenerarPDF.innerHTML = '<i class="fas fa-file-pdf"></i> Ver Reporte';
        }
    });

    // Modal de Detalles
    const modalDetalle = document.getElementById('modal-detalle-bitacora');
    const closeDetalle = document.getElementById('close-detalle-bitacora');
    const btnCerrarDetalle = document.getElementById('btn-cerrar-detalle');

    const abrirDetalle = (id) => {
        const item = tablaBitacora._storedData[id];
        if (!item) return;

        document.getElementById('detalle-id').textContent = item.ID || 'Sin datos';
        document.getElementById('detalle-fecha').textContent = item.Fecha || 'Sin datos';
        document.getElementById('detalle-hora').textContent = item.Hora || 'Sin datos';
        document.getElementById('detalle-ip').textContent = item.IP || 'Sin datos';
        document.getElementById('detalle-usuario').textContent = item.Usuario_ID || 'Sin datos';
        document.getElementById('detalle-accion').textContent = item.Accion || 'Sin datos';
        document.getElementById('detalle-modulo').textContent = item.Modulo || 'Sin datos';
        document.getElementById('detalle-registro-id').textContent = item.Registro_ID || 'Sin datos';

        const detallesEl = document.getElementById('detalle-detalles');
        detallesEl.textContent = item.Detalles || 'Sin datos';

        modalDetalle.style.display = 'block';
    };

    tablaBitacora.onDetalleBitacora = abrirDetalle;

    closeDetalle.onclick = () => { modalDetalle.style.display = 'none'; };
    btnCerrarDetalle.onclick = () => { modalDetalle.style.display = 'none'; };

    window.addEventListener('click', (e) => {
        if (e.target === modalDetalle) modalDetalle.style.display = 'none';
    });

    // Inicialización
    tablaBitacora.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});
