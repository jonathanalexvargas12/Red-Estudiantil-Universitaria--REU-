import GenericTable from './genericTable.js';

// Configuración del membrete - Cambia esta ruta por la correcta
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

document.addEventListener('DOMContentLoaded', () => {
    const tablaHorario = new GenericTable(
        'horas',
        'tabla-horario',
        ['Desde', 'Hasta', 'Dias', 'Turno', 'Carrera', 'Pensum', 'Periodo_Academico', 'Seccion', 'Nivel', 'Asignatura', 'Docente'],
        ['Carrera', 'Seccion', 'Periodo_Academico', 'Nivel'], // Columnas visibles en la tabla
        { disableEdit: true, disableDelete: true }
    );

    // Sobrescribir el método para no generar acciones
    tablaHorario.generarAccionesHTML = function() {
        return '';
    };

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

    // --- NUEVO: Función para volver a enlazar los eventos de los enlaces ---
    const reactivarEnlaces = () => {
        const filas = document.querySelectorAll('#tabla-horario tbody tr');
        filas.forEach(fila => {
            const celdaCarrera = fila.cells[0];
            if (!celdaCarrera) return;
            const enlace = celdaCarrera.querySelector('a');
            if (enlace && !enlace.dataset.evento) {
                const carrera = enlace.textContent.trim();
                // Buscar datos del grupo en datosCompletos
                const grupo = datosCompletos.find(item => 
                    item.Carrera === carrera && 
                    item.Seccion === fila.cells[1].textContent.trim() &&
                    item.Periodo_Academico === fila.cells[2].textContent.trim() &&
                    item.Nivel === fila.cells[3].textContent.trim()
                );
                
                if (grupo) {
                    enlace.addEventListener('click', (e) => {
                        e.preventDefault();
                        generarHorarioPDF(grupo);
                    });
                    // Tooltip
                    enlace.addEventListener('mouseover', () => {
                        if (enlace.querySelector('.tooltip')) return;
                        const tooltip = document.createElement('span');
                        tooltip.className = 'tooltip';
                        tooltip.textContent = 'Generar Horario';
                        tooltip.style.position = 'absolute';
                        tooltip.style.backgroundColor = '#333';
                        tooltip.style.color = '#fff';
                        tooltip.style.padding = '5px';
                        tooltip.style.borderRadius = '3px';
                        tooltip.style.fontSize = '12px';
                        tooltip.style.zIndex = '1000';
                        tooltip.style.marginTop = '-30px';
                        tooltip.style.marginLeft = '10px';
                        enlace.appendChild(tooltip);

                        enlace.addEventListener('mouseout', () => {
                            if (enlace.contains(tooltip)) {
                                enlace.removeChild(tooltip);
                            }
                        }, { once: true });
                    });
                    enlace.dataset.evento = "true";
                }
            }
        });
    };
    // -------------------------------------------------------------------------------

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-horario');
    const botonBuscar = document.querySelector('.btn-buscar-horario');
    const btnReajustar = document.querySelector('.btn-reajustar-horario');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];
    let datosCompletos = []; // Almacenará todos los datos completos para el PDF

    // Almacena los datos completos y clona las filas visibles
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-horario tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-horario tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const celdas = Array.from(fila.cells).map(cell => cell.textContent.toLowerCase());
            const coincide = celdas.some(celda => celda.includes(textoBusqueda));
            if (coincide) tbody.appendChild(fila.cloneNode(true));
        });

        reactivarEnlaces(); // <-- Reactivar los enlaces después de filtrar
        actualizarPaginacion();
    };

    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-horario tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        reactivarEnlaces(); // <-- Reactivar los enlaces después de reajustar
        actualizarPaginacion();
    });

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
            if (i === currentPage) button.classList.add('activo');

            button.addEventListener('click', () => {
                currentPage = i;
                displayRows(currentPage);
                updatePaginationButtons();
            });

            pageButtonsContainer.appendChild(button);
        }
    };

    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-horario tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Función para generar el PDF del horario agrupado por Carrera, Seccion, Periodo_Academico y Nivel
    const generarHorarioPDF = async (grupo) => {
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

        // Filtrar los registros que pertenecen a este grupo
        const registrosGrupo = datosCompletos.filter(item => 
            item.Carrera === grupo.Carrera &&
            item.Seccion === grupo.Seccion &&
            item.Periodo_Academico === grupo.Periodo_Academico &&
            item.Nivel === grupo.Nivel
        );

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
    };

    // Agrupar los datos por Carrera, Seccion, Periodo_Academico y Nivel
    const agruparPorSeccionCarrera = (datos) => {
        const tbody = document.querySelector('#tabla-horario tbody');
        tbody.innerHTML = '';

        datosCompletos = datos;

        // Agrupar por Carrera, Seccion, Periodo_Academico y Nivel
        const grupos = {};
        datos.forEach(item => {
            const clave = `${item.Carrera}_${item.Seccion}_${item.Periodo_Academico}_${item.Nivel}`;
            if (!grupos[clave]) {
                grupos[clave] = {
                    Carrera: item.Carrera,
                    Seccion: item.Seccion,
                    Periodo_Academico: item.Periodo_Academico,
                    Nivel: item.Nivel,
                    count: 0
                };
            }
            grupos[clave].count++;
        });

        // Crear una fila por cada grupo
        Object.values(grupos).forEach(grupo => {
            const fila = document.createElement('tr');

            // Celda de Carrera con enlace
            const celdaCarrera = document.createElement('td');
            const enlace = document.createElement('a');
            enlace.href = '#';
            enlace.textContent = grupo.Carrera;
            enlace.title = 'Generar Horario';
            
            // Agregar tooltip
            enlace.addEventListener('mouseover', () => {
                if (enlace.querySelector('.tooltip')) return;
                const tooltip = document.createElement('span');
                tooltip.className = 'tooltip';
                tooltip.textContent = 'Generar Horario';
                tooltip.style.position = 'absolute';
                tooltip.style.backgroundColor = '#333';
                tooltip.style.color = '#fff';
                tooltip.style.padding = '5px';
                tooltip.style.borderRadius = '3px';
                tooltip.style.fontSize = '12px';
                tooltip.style.zIndex = '1000';
                tooltip.style.marginTop = '-30px';
                tooltip.style.marginLeft = '10px';
                enlace.appendChild(tooltip);

                enlace.addEventListener('mouseout', () => {
                    if (enlace.contains(tooltip)) {
                        enlace.removeChild(tooltip);
                    }
                }, { once: true });
            });

            enlace.addEventListener('click', (e) => {
                e.preventDefault();
                generarHorarioPDF(grupo);
            });
            celdaCarrera.appendChild(enlace);
            fila.appendChild(celdaCarrera);

            // Celdas de Seccion, Periodo_Academico y Nivel (sin enlace)
            const celdaSeccion = document.createElement('td');
            celdaSeccion.textContent = grupo.Seccion;
            fila.appendChild(celdaSeccion);

            const celdaPeriodo = document.createElement('td');
            celdaPeriodo.textContent = grupo.Periodo_Academico;
            fila.appendChild(celdaPeriodo);

            const celdaNivel = document.createElement('td');
            celdaNivel.textContent = grupo.Nivel;
            fila.appendChild(celdaNivel);

            // Celda opcional para mostrar cantidad de registros
            const celdaCount = document.createElement('td');
            celdaCount.textContent = `(${grupo.count} registros)`;
            fila.appendChild(celdaCount);

            tbody.appendChild(fila);
        });

        clonarFilasOriginales();
        reactivarEnlaces(); // <-- Reactivar los enlaces al cargar/agrupar
        actualizarPaginacion();
    };

    // Método para obtener todos los datos (debe estar implementado en GenericTable)
    GenericTable.prototype.obtenerDatosCompletos = async function() {
        try {
            // Usar tableName en vez de endpoint para compatibilidad
            const response = await fetch(`/api/${this.tableName}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (!response.ok) throw new Error('Error al obtener datos');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener datos completos:', error);
            throw error;
        }
    };

    // Inicializar agrupación y paginación
    const inicializar = async () => {
        try {
            const datos = await tablaHorario.obtenerDatosCompletos();
            agruparPorSeccionCarrera(datos);
        } catch (error) {
            console.error('Error en inicialización:', error);
            alert('Error al cargar los datos iniciales');
        }
    };

    // Paginación
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

    inicializar();
});