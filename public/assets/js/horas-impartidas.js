import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

// Configuración del membrete - Cambia esta ruta por la correcta
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

const btnFiltrar = document.querySelector('.boton-crud-horas-impartidas:first-child'); 
const filtrosBusqueda = document.querySelector('.filtros-busqueda-horas-impartidas');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    const tablaHorasImpartidas = new GenericTable(
        'horas',
        'tabla-horas-impartidas',
        ['#', 'Periodo', 'Asignatura', 'Seccion', 'Profesor', 'N° de horas impartidas'],
        ['Periodo_Academico', 'Asignatura', 'Seccion']
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
        doc.text('Reporte de Horas Impartidas', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // 3. Fecha de generación
        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(8);
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;

        // 4. Configuración de columnas
        const columnConfig = [
            { header: '#', dataKey: 'id', width: 10 },
            { header: 'Periodo', dataKey: 'periodo', width: 25 },
            { header: 'Asignatura', dataKey: 'asignatura', width: 30 },
            { header: 'Sección', dataKey: 'seccion', width: 20 },
            { header: 'Profesor', dataKey: 'profesor', width: 40 },
            { header: 'Horas Impartidas', dataKey: 'horas', width: 25 }
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
                
                // Formatear horas para mostrar 1 decimal
                if (col.dataKey === 'horas') {
                    cellContent = parseFloat(cellContent).toFixed(1);
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
        const nombreArchivo = `Reporte-Horas-Impartidas-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;
        
        return { doc, nombreArchivo };
    };

    // Evento para el botón de generar PDF
    const btnGenerarPDF = document.getElementById('boton-crud-horas-impartidas');
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', async () => {
            btnGenerarPDF.disabled = true;
            btnGenerarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

            try {
                // Obtener datos de la tabla actual (filas visibles)
                const filas = document.querySelectorAll('#tabla-horas-impartidas tbody tr:not([style*="display: none"])');
                const datos = Array.from(filas).map(fila => {
                    return {
                        id: fila.cells[0].textContent,
                        periodo: fila.cells[1].textContent,
                        asignatura: fila.cells[2].textContent,
                        seccion: fila.cells[3].textContent,
                        profesor: fila.cells[4].textContent,
                        horas: fila.cells[5].textContent
                    };
                });

                if (datos.length === 0) {
                    throw new Error('No hay datos para generar el reporte');
                }

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

    // Elementos de filtrado
    const buscarInput = document.querySelector('.buscar-input-horas-impartidas');
    const periodoSelect = document.querySelector('.periodo-select');
    const asignaturaSelect = document.querySelector('.asignatura-select');
    const botonBuscar = document.querySelector('.boton-filtro-horas-impartidas:first-child');
    const btnReajustar = document.querySelector('.boton-filtro-horas-impartidas:last-child');
    
    // Configuración de paginación
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Preparar selects
    const prepararSelect = (selectElement) => {
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        selectElement.selectedIndex = 0;
    };

    // Cargar opciones para los selects
    const cargarOpcionesSelects = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Cargar Periodos Académicos
            const selectPeriodoFiltro = document.querySelector('.periodo-select');
            prepararSelect(selectPeriodoFiltro);
            
            const resPeriodos = await fetch('/api/periodo_academico', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const periodos = await resPeriodos.json();
            periodos.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.Periodo_Academico;
                option.textContent = periodo.Periodo_Academico;
                selectPeriodoFiltro.appendChild(option);
            });

            // Cargar Asignaturas
            const selectAsignaturaFiltro = document.querySelector('.asignatura-select');
            prepararSelect(selectAsignaturaFiltro);
            
            const resAsignaturas = await fetch('/api/asignaturas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const asignaturas = await resAsignaturas.json();
            asignaturas.forEach(asignatura => {
                const option = document.createElement('option');
                option.value = asignatura.Codigo_Asignatura;
                option.textContent = asignatura.Codigo_Asignatura;
                selectAsignaturaFiltro.appendChild(option);
            });

        } catch (error) {
            console.error('Error cargando opciones:', error);
        }
    };

    // Clonar filas originales para filtrado
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-horas-impartidas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Calcular horas impartidas
    const calcularHorasImpartidas = (desde, hasta) => {
        if (!desde || !hasta) return 0;
        
        const [horaDesde, minDesde] = desde.split(':').map(Number);
        const [horaHasta, minHasta] = hasta.split(':').map(Number);
        
        const totalMinutos = (horaHasta * 60 + minHasta) - (horaDesde * 60 + minDesde);
        return totalMinutos / 60; // Convertir a horas
    };

    // Filtrar tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const periodoSeleccionado = periodoSelect.value;
        const asignaturaSeleccionada = asignaturaSelect.value;
        
        const tbody = document.querySelector('#tabla-horas-impartidas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const periodo = fila.cells[1].textContent;
            const asignatura = fila.cells[2].textContent;
            const profesor = fila.cells[4].textContent.toLowerCase();
            
            const coincideTexto = textoBusqueda === '' || profesor.includes(textoBusqueda);
            const coincidePeriodo = periodoSeleccionado === '' || periodo === periodoSeleccionado;
            const coincideAsignatura = asignaturaSeleccionada === '' || asignatura === asignaturaSeleccionada;
            
            if (coincideTexto && coincidePeriodo && coincideAsignatura) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
    };

    // Mostrar filas según la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-horas-impartidas tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-horas-impartidas').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    // Actualizar botones de paginación
    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-horas-impartidas',
            paginaActual: currentPage,
            totalPaginas: totalPages,
            alCambiarPagina: (pagina) => {
                currentPage = pagina;
                displayRows(currentPage);
                updatePaginationButtons();
            }
        });
    };

    // Actualizar paginación
    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-horas-impartidas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de filtrado
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        periodoSelect.selectedIndex = 0;
        asignaturaSelect.selectedIndex = 0;
        const tbody = document.querySelector('#tabla-horas-impartidas tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        actualizarPaginacion();
    });

    // Eventos de paginación
    document.querySelector('.pagina-anterior-horas-impartidas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-horas-impartidas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Estado de fuente de datos: 'planificado' (horas) o 'real' (asistencia)
    let fuenteActual = 'planificado';

    // Botón de toggle de fuente
    const btnToggleFuente = document.createElement('button');
    btnToggleFuente.className = 'boton-crud-horas-impartidas';
    btnToggleFuente.innerHTML = '<i class="fas fa-calendar-check"></i> Ver Horas Reales';
    document.querySelector('.cabecera-crud-horas-impartidas')?.appendChild(btnToggleFuente);

    btnToggleFuente.addEventListener('click', () => {
        if (fuenteActual === 'planificado') {
            fuenteActual = 'real';
            btnToggleFuente.innerHTML = '<i class="fas fa-calendar"></i> Ver Planificado';
            cargarDatosReales();
        } else {
            fuenteActual = 'planificado';
            btnToggleFuente.innerHTML = '<i class="fas fa-calendar-check"></i> Ver Horas Reales';
            cargarDatosHoras();
        }
    });

    const cargarDatosReales = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/asistencia/reporte', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al obtener reporte de asistencia');

            const datos = await response.json();
            const tbody = document.querySelector('#tabla-horas-impartidas tbody');
            tbody.innerHTML = '';

            if (datos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay datos de asistencia registrados</td></tr>';
                actualizarPaginacion();
                return;
            }

            datos.forEach((item, index) => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.Periodo_Academico}</td>
                    <td>${item.Asignatura}</td>
                    <td>${item.Seccion}</td>
                    <td>${item.Docente_Nombre}</td>
                    <td>${item.Horas_Decimal ? parseFloat(item.Horas_Decimal).toFixed(1) : '0.0'}</td>
                `;
                tbody.appendChild(fila);
            });

            clonarFilasOriginales();
            actualizarPaginacion();
        } catch (error) {
            console.error('Error cargando datos reales:', error);
            if (fuenteActual === 'real') {
                fuenteActual = 'planificado';
                btnToggleFuente.innerHTML = '<i class="fas fa-calendar-check"></i> Ver Horas Reales';
                cargarDatosHoras();
            }
        }
    };

    // Función para cargar y procesar datos de horas (planificado)
    const cargarDatosHoras = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const [resHoras, resAsignaturas] = await Promise.all([
                fetch('/api/horas', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/docente_asignatura', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!resHoras.ok) throw new Error('Error al obtener las horas');
            if (!resAsignaturas.ok) throw new Error('Error al obtener asignaturas');

            const horas = await resHoras.json();
            const asignaturas = await resAsignaturas.json();
            const tbody = document.querySelector('#tabla-horas-impartidas tbody');
            tbody.innerHTML = '';

            // Calcular total de horas por docente
            const horasPorDocente = {};
            const nombreDocente = {};
            horas.forEach(hora => {
                if (hora.Docente_Cedula) {
                    if (!horasPorDocente[hora.Docente_Cedula]) horasPorDocente[hora.Docente_Cedula] = 0;
                    horasPorDocente[hora.Docente_Cedula] += calcularHorasImpartidas(hora.Desde, hora.Hasta);
                    if (!nombreDocente[hora.Docente_Cedula]) {
                        nombreDocente[hora.Docente_Cedula] = hora.Docente || hora.Docente_Nombre_Completo || hora.Docente_Cedula;
                    }
                }
            });

            // Generar filas: una por asignatura docente, con las horas totales del docente
            const asignaturasAgrupadas = {};
            asignaturas.forEach(asig => {
                if (!asig.Docente_Cedula) return;
                const key = `${asig.Docente_Cedula}|${asig.Periodo_Academico}|${asig.Asignatura}|${asig.Seccion}`;
                if (!asignaturasAgrupadas[key]) {
                    asignaturasAgrupadas[key] = {
                        periodo: asig.Periodo_Academico || '',
                        asignatura: asig.Asignatura || '',
                        seccion: asig.Seccion != null ? asig.Seccion : '',
                        profesor: nombreDocente[asig.Docente_Cedula] || asig.Docente_Nombre || asig.Docente_Cedula,
                        horas: horasPorDocente[asig.Docente_Cedula] || 0
                    };
                }
            });

            const grupos = Object.values(asignaturasAgrupadas);
            grupos.forEach((grupo, index) => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${grupo.periodo}</td>
                    <td>${grupo.asignatura}</td>
                    <td>${grupo.seccion}</td>
                    <td>${grupo.profesor}</td>
                    <td>${grupo.horas.toFixed(1)}</td>
                `;
                tbody.appendChild(fila);
            });

            if (grupos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay datos de horas planificadas</td></tr>';
            }

            clonarFilasOriginales();
            actualizarPaginacion();
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    };

    // Inicializar la tabla
    cargarOpcionesSelects().then(() => {
        cargarDatosHoras();
    });
});