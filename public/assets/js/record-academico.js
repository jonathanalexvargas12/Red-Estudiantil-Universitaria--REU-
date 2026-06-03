import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

// Configuración del membrete - Cambia esta ruta por la correcta
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

document.addEventListener('DOMContentLoaded', () => {
    const tablaRecord = new GenericTable(
        'calificaciones',
        'tabla-record',
        ['ID', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Carrera', 'Trayecto', 'Sem/Trim', 'Seccion', 
         'Unidad_Curricular', 'Cedula_Docente', 'Nombre_Docente', 'Estado', 'Calificacion_Numerica', 
         'Calificacion_Cualitativa', 'Periodo_Academico'],
        ['Cedula_Estudiante', 'Nombre_Estudiante'], // Columnas visibles en la tabla
        {
            disableEdit: true,
            disableDelete: true
        }
    );

    // Sobrescribir el método para no generar acciones
    tablaRecord.generarAccionesHTML = function() {
        return '';
    };

    const getToken = () => localStorage.getItem('token');

    const buscarInput = document.querySelector('.buscar-input-record');
    const botonBuscar = document.querySelector('.btn-buscar-record');
    const btnReajustar = document.querySelector('.btn-reajustar-record');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];
    let datosCompletos = []; // Almacenará todos los datos completos para el PDF

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

    // --- NUEVO: Función para volver a enlazar los eventos de los enlaces de cédula ---
    const reactivarEnlacesCedula = () => {
        const filas = document.querySelectorAll('#tabla-record tbody tr');
        filas.forEach(fila => {
            const celdaCedula = fila.cells[0];
            if (!celdaCedula) return;
            const enlace = celdaCedula.querySelector('a');
            if (enlace && !enlace.dataset.evento) {
                const cedula = enlace.textContent.trim();
                // Buscar datos del estudiante en datosCompletos
                const estudiante = datosCompletos.find(item => item.Cedula_Estudiante === cedula);
                if (estudiante) {
                    enlace.addEventListener('click', (e) => {
                        e.preventDefault();
                        generarPDF(cedula, estudiante.Nombre_Estudiante, estudiante.Carrera);
                    });
                    // Tooltip
                    enlace.addEventListener('mouseover', () => {
                        if (enlace.querySelector('.tooltip')) return;
                        const tooltip = document.createElement('span');
                        tooltip.className = 'tooltip';
                        tooltip.textContent = 'Generar Record Académico';
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

    // Almacena los datos completos y clona las filas visibles
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-record tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-record tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const celdas = Array.from(fila.cells).map(cell => cell.textContent.toLowerCase());
            const coincide = celdas.some(celda => celda.includes(textoBusqueda));
            if (coincide) tbody.appendChild(fila.cloneNode(true));
        });

        reactivarEnlacesCedula(); // <-- Reactivar los enlaces después de filtrar
        actualizarPaginacion();
    };

    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-record tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        reactivarEnlacesCedula(); // <-- Reactivar los enlaces después de reajustar
        actualizarPaginacion();
    });

    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-record tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-record').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-record',
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
        const filas = document.querySelectorAll('#tabla-record tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    const generarPDF = async (cedula, nombre, carrera) => {
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
            const imgWidth = 50;
            const imgHeight = (imgMembrete.height * imgWidth) / imgMembrete.width;
            const xPos = (pageWidth - imgWidth) / 2;
            
            doc.addImage(imgMembrete, 'JPEG', xPos, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10;
        }

        // 2. Título del documento
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text('Récord Académico del Estudiante', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // 3. Información del estudiante
        doc.setFontSize(10);
        doc.setTextColor(0);

        // Datos del estudiante
        doc.setFont('helvetica', 'bold');
        doc.text('Datos del Estudiante:', margin, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.text(`• Cédula: ${cedula}`, margin, yPos);
        yPos += 5;
        doc.text(`• Nombre: ${nombre}`, margin, yPos);
        yPos += 5;
        doc.text(`• Carrera: ${carrera || 'No especificada'}`, margin, yPos);
        yPos += 10;

        // 4. Fecha de generación
        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(8);
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 10;

        // 5. Configuración de columnas para el récord académico
        const columnConfig = [
            { header: 'Unidad Curricular', dataKey: 'Unidad_Curricular', width: 40 },
            { header: 'Trayecto', dataKey: 'Trayecto', width: 15 },
            { header: 'Sem/Trim', dataKey: 'Sem/Trim', width: 15 },
            { header: 'Sección', dataKey: 'Seccion', width: 15 },
            { header: 'Calificación', dataKey: 'Calificacion_Numerica', width: 20 },
            { header: 'Cualitativa', dataKey: 'Calificacion_Cualitativa', width: 25 }
        ];

        // Filtrar los datos completos por la cédula del estudiante
        const datosEstudiante = datosCompletos.filter(item => item.Cedula_Estudiante === cedula);
        
        // Agrupar por período académico
        const periodos = {};
        datosEstudiante.forEach(item => {
            const periodo = item.Periodo_Academico || 'Sin período asignado';
            if (!periodos[periodo]) {
                periodos[periodo] = [];
            }
            periodos[periodo].push(item);
        });

        // Ordenar los períodos cronológicamente (asumiendo que el formato permite ordenación)
        const periodosOrdenados = Object.keys(periodos).sort();

        // Generar sección para cada período
        for (const periodo of periodosOrdenados) {
            // Verificar si necesitamos nueva página
            if (yPos > doc.internal.pageSize.getHeight() - 50) {
                doc.addPage();
                yPos = 15;
            }

            // Título del período
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(`Período Académico: ${periodo}`, margin, yPos);
            yPos += 8;

            // Calcular el ancho total de la tabla
            const tableWidth = columnConfig.reduce((sum, col) => sum + col.width, 0);
            
            // Calcular el punto de inicio X para centrar la tabla
            const startX = (pageWidth - tableWidth) / 2;
            let currentX = startX;

            // Dibujar tabla con bordes (centrada)
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

            // Contenido de la tabla para este período
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(0);

            periodos[periodo].forEach((item, index) => {
                if (yPos > doc.internal.pageSize.getHeight() - 10) {
                    doc.addPage();
                    yPos = 15;
                }

                currentX = startX;
                let maxCellHeight = 0;

                columnConfig.forEach((col, colIndex) => {
                    let cellContent = item[col.dataKey]?.toString() || '';
                    
                    // Formatear calificaciones numéricas
                    if (col.dataKey === 'Calificacion_Numerica') {
                        const nota = parseFloat(cellContent);
                        if (!isNaN(nota)) {
                            if (nota >= 10) {
                                doc.setTextColor(0, 128, 0); // Verde para aprobado
                            } else {
                                doc.setTextColor(255, 0, 0); // Rojo para reprobado
                            }
                        }
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

                    // Restaurar color negro para el siguiente texto
                    doc.setTextColor(0, 0, 0);

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

            // Espacio entre períodos
            yPos += 10;
        }

        // Generar nombre de archivo
        const nombreArchivo = `Record_Academico_${cedula}_${nombre.replace(/\s+/g, '_')}.pdf`;
        
        // Guardar el PDF
        doc.save(nombreArchivo);
    };

    // Cargar todos los datos y agrupar por cédula
    const ROL = localStorage.getItem('role');
    let userData = {};
    try { userData = JSON.parse(localStorage.getItem('userData') || '{}'); } catch (e) {}

    const agruparPorCedula = (datos) => {
        // Estudiante: solo ve su propio récord
        if (ROL === 'Estudiante' && userData.Cedula) {
            datos = datos.filter(item => item.Cedula_Estudiante === userData.Cedula);
        }

        const tbody = document.querySelector('#tabla-record tbody');
        tbody.innerHTML = '';

        datosCompletos = datos;

        // Agrupar por cédula
        const estudiantes = {};
        datos.forEach(item => {
            const cedula = item.Cedula_Estudiante;
            if (!estudiantes[cedula]) {
                estudiantes[cedula] = {
                    nombre: item.Nombre_Estudiante,
                    carrera: item.Carrera,
                    count: 0
                };
            }
            estudiantes[cedula].count++;
        });

        // Crear una fila por cada estudiante (solo con cédula y nombre)
        Object.entries(estudiantes).forEach(([cedula, { nombre, carrera, count }]) => {
            const fila = document.createElement('tr');

            // Celda de cédula con enlace
            const celdaCedula = document.createElement('td');
            const enlace = document.createElement('a');
            enlace.href = '#';
            enlace.textContent = cedula;
            enlace.title = 'Generar Record Académico'; // Mensaje flotante
            
            // Agregar tooltip
            enlace.addEventListener('mouseover', () => {
                if (enlace.querySelector('.tooltip')) return;
                const tooltip = document.createElement('span');
                tooltip.className = 'tooltip';
                tooltip.textContent = 'Generar Record Académico';
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
                generarPDF(cedula, nombre, carrera);
            });
            celdaCedula.appendChild(enlace);
            fila.appendChild(celdaCedula);

            // Celda de nombre (sin enlace)
            const celdaNombre = document.createElement('td');
            celdaNombre.textContent = nombre;
            fila.appendChild(celdaNombre);

            // Celda opcional para mostrar cantidad de registros
            const celdaCount = document.createElement('td');
            celdaCount.textContent = `(${count} registros)`;
            fila.appendChild(celdaCount);

            tbody.appendChild(fila);
        });

        clonarFilasOriginales();
        reactivarEnlacesCedula(); // <-- Reactivar los enlaces al cargar/agrupar
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
            const datos = await tablaRecord.obtenerDatosCompletos();
            agruparPorCedula(datos);
        } catch (error) {
            console.error('Error en inicialización:', error);
            alert('Error al cargar los datos iniciales');
        }
    };

    // Paginación
    document.querySelector('.pagina-anterior-record').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-record').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    inicializar();
});