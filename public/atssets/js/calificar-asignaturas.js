import GenericTable from './genericTable.js';

// Configuración del membrete - Cambia esta ruta por la correcta
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

// Para que se desplieguen los filtros de búsqueda
const btnFiltrarCalificar = document.getElementById('btn-filtrar-calificar');
const filtrosBusquedaCalificar = document.getElementById('filtros-busqueda-calificar');

btnFiltrarCalificar.addEventListener('click', () => {
    filtrosBusquedaCalificar.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para calificaciones
    const tablaCalificaciones = new GenericTable(
        'estudiantes_asignatura',
        'tabla-calificar',
        ['ID', 'Estudiante_Cedula', 'Estudiante_Nombre', 'Asignatura', 'Seccion', 'Estado', 'Periodo_Academico', 'Nota', 'Nota_Definitiva'],
        ['Periodo_Academico', 'Asignatura', 'Seccion', 'Estudiante_Cedula', 'Estudiante_Nombre', 'Nota', 'Nota_Definitiva', 'Estado'],
        { disableEdit: false, disableDelete: true } // Solo mostrar icono de editar
    );

    // Función para obtener el token JWT
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
        doc.text('Reporte Completo de Calificaciones', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // 3. Fecha de generación
        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(8);
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;

        // 4. Configuración de columnas
        const columnConfig = [
            { header: 'Periodo Académico', dataKey: 'Periodo_Academico', width: 30 },
            { header: 'Asignatura', dataKey: 'Asignatura', width: 30 },
            { header: 'Sección', dataKey: 'Seccion', width: 15 },
            { header: 'Cédula Estudiante', dataKey: 'Estudiante_Cedula', width: 30 },
            { header: 'Nombre Estudiante', dataKey: 'Estudiante_Nombre', width: 35 },
            { header: 'Nota', dataKey: 'Nota', width: 15 },
            { header: 'Nota Definitiva', dataKey: 'Nota_Definitiva', width: 25 },
            { header: 'Estado', dataKey: 'Estado', width: 20 }
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
                if (col.dataKey === 'Estado') {
                    cellContent = cellContent === 'asistente' ? 'Asistente' : 
                                 cellContent === 'inasistente' ? 'Inasistente' : 
                                 cellContent === 'cargando notas' ? 'Cargando Notas' : cellContent;
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
        const nombreArchivo = `Reporte-Calificaciones-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;
        
        return { doc, nombreArchivo };
    };

    // Evento para el botón de generar PDF
    const btnGenerarPDF = document.getElementById('btn-ver-reporte-calificar');
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', async () => {
            btnGenerarPDF.disabled = true;
            btnGenerarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/estudiantes_asignatura', {
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

    // Variables para la paginación y búsqueda
    const buscarInput = document.getElementById('buscar-input-calificar');
    const botonBuscar = document.querySelector('.btn-buscar-calificar');
    const btnReajustar = document.getElementById('btn-reajustar-calificar');
    const periodoSelect = document.getElementById('periodo-select-calificar');
    const asignaturaSelect = document.getElementById('asignatura-select-calificar');
    const seccionSelect = document.getElementById('seccion-select-calificar');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para formatear el estado con iconos
    const formatearEstados = () => {
        const filas = document.querySelectorAll('#tabla-calificar tbody tr');
        
        filas.forEach(fila => {
            const estadoCell = fila.cells[7]; // Columna de Estado (índice 7)
            const estadoValue = estadoCell.textContent.trim().toLowerCase();
            
            if (estadoValue === 'asistente') {
                estadoCell.innerHTML = '<span class="estado-circulo estado-asistente"></span> Asistente';
            } else if (estadoValue === 'inasistente') {
                estadoCell.innerHTML = '<span class="estado-circulo estado-inasistente"></span> Inasistente';
            } else if (estadoValue === 'cargando notas') {
                estadoCell.innerHTML = '<span class="estado-circulo estado-cargando"></span> Cargando Notas';
            }
        });
    };

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-calificar tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
        console.log('Filas originales clonadas:', filasOriginales.length);
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const periodoFiltro = periodoSelect.value.toLowerCase();
        const asignaturaFiltro = asignaturaSelect.value.toLowerCase();
        const seccionFiltro = seccionSelect.value.toLowerCase();
        
        const tbody = document.querySelector('#tabla-calificar tbody');
        tbody.innerHTML = '';

        if (filasOriginales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No hay datos disponibles</td></tr>';
            return;
        }

        filasOriginales.forEach(fila => {
            const periodo = fila.cells[0].textContent.toLowerCase();
            const asignatura = fila.cells[1].textContent.toLowerCase();
            const seccion = fila.cells[2].textContent.toLowerCase();
            const cedula = fila.cells[3].textContent.toLowerCase();
            const estudiante = fila.cells[4].textContent.toLowerCase();
            
            // Obtener el estado real (del icono o texto)
            const estadoCell = fila.cells[7];
            let estadoValue = '';
            const estadoIcon = estadoCell.querySelector('.estado-circulo');
            
            if (estadoIcon) {
                if (estadoIcon.classList.contains('estado-asistente')) {
                    estadoValue = 'asistente';
                } else if (estadoIcon.classList.contains('estado-inasistente')) {
                    estadoValue = 'inasistente';
                } else if (estadoIcon.classList.contains('estado-cargando')) {
                    estadoValue = 'cargando notas';
                }
            } else {
                estadoValue = estadoCell.textContent.trim().toLowerCase();
            }

            const coincideBusqueda = textoBusqueda === '' || 
                                  estudiante.includes(textoBusqueda) || 
                                  cedula.includes(textoBusqueda);
            
            const coincidePeriodo = periodoFiltro === '' || periodo === periodoFiltro;
            const coincideAsignatura = asignaturaFiltro === '' || asignatura === asignaturaFiltro;
            const coincideSeccion = seccionFiltro === '' || seccion === seccionFiltro;

            if (coincideBusqueda && coincidePeriodo && coincideAsignatura && coincideSeccion) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Mostrar mensaje si no hay resultados
        if (tbody.children.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No se encontraron resultados</td></tr>';
        }

        formatearEstados();
        tablaCalificaciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Eventos de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);
    
    // Evento de reajuste
    btnReajustar.addEventListener('click', () => {
        console.log('Reajustando tabla...');
        buscarInput.value = '';
        periodoSelect.value = '';
        asignaturaSelect.value = '';
        seccionSelect.value = '';
        
        const tbody = document.querySelector('#tabla-calificar tbody');
        tbody.innerHTML = '';
        
        if (filasOriginales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No hay datos disponibles</td></tr>';
            return;
        }
        
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        formatearEstados();
        tablaCalificaciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-calificar tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-calificar').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        formatearEstados();
        tablaCalificaciones.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-calificar');
        const nextButton = document.querySelector('.pagina-siguiente-calificar');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-calificar');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-calificar');
            if (i === currentPage) {
                button.classList.add('activo');
            }
            button.textContent = i;
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
        const filas = document.querySelectorAll('#tabla-calificar tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = Math.min(currentPage, totalPages);
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Función para cargar datos en un select
    async function cargarSelect(url, selectId, valueField, textField) {
        try {
            const token = getToken();
            if (!token) throw new Error('Token no encontrado');

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error en la respuesta');

            const data = await response.json();
            const select = document.getElementById(selectId);
            
            // Limpiar select manteniendo las opciones iniciales (placeholder y "Todos/Todas")
            while (select.options.length > 2) {
                select.remove(2);
            }

            if (data.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay datos disponibles';
                option.disabled = true;
                select.appendChild(option);
                return;
            }

            // Agregar nuevas opciones
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField] || item[valueField];
                select.appendChild(option);
            });

        } catch (error) {
            console.error(`Error cargando ${selectId}:`, error);
            const select = document.getElementById(selectId);
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Error cargando datos';
            option.disabled = true;
            select.appendChild(option);
        }
    }

    // Cargar datos para selects (filtros y modal)
    async function cargarDatosParaSelects() {
        try {
            await Promise.all([
                cargarSelect('/api/periodo_academico', 'periodo-select-calificar', 'Periodo_Academico', 'Periodo_Academico'),
                cargarSelect('/api/asignaturas', 'asignatura-select-calificar', 'Codigo_Asignatura', 'Codigo_Asignatura'),
                cargarSelect('/api/secciones', 'seccion-select-calificar', 'Codigo_Seccion', 'Codigo_Seccion'),
                cargarSelect('/api/periodo_academico', 'editar-periodo', 'Periodo_Academico', 'Periodo_Academico'),
                cargarSelect('/api/asignaturas', 'editar-asignatura', 'Codigo_Asignatura', 'Codigo_Asignatura'),
                cargarSelect('/api/secciones', 'editar-seccion', 'Codigo_Seccion', 'Codigo_Seccion')
            ]);
        } catch (error) {
            console.error('Error cargando datos para selects:', error);
        }
    }

    // Manejador para editar
    tablaCalificaciones.onEditar = async (id, datos) => {
        console.log('Iniciando edición para ID:', id);
        
        const modal = document.getElementById('editarCalificacionModal');
        if (!modal) {
            console.error('Modal de edición no encontrado');
            return;
        }
        
        // Mostrar el modal inmediatamente
        modal.style.display = 'block';

        try {
            // Cargar datos para los selects
            await cargarDatosParaSelects();

            // Llenar el formulario - Asegurando el orden correcto de los datos
            document.getElementById('editar-periodo').value = datos[0]; // Periodo_Academico
            document.getElementById('editar-asignatura').value = datos[1]; // Asignatura
            document.getElementById('editar-seccion').value = datos[2]; // Seccion
            document.getElementById('editar-cedula-estudiante').value = datos[3]; // Estudiante_Cedula
            document.getElementById('editar-estudiante').value = datos[4]; // Estudiante_Nombre
            document.getElementById('editar-nota').value = datos[5]; // Nota
            document.getElementById('editar-nota-definitiva').value = datos[6]; // Nota_Definitiva
            document.getElementById('editar-estado').value = datos[7]; // Estado

            console.log('Formulario de edición llenado correctamente');
        } catch (error) {
            console.error('Error al preparar el modal de edición:', error);
            modal.style.display = 'none';
            alert('Error al preparar los datos para editar');
        }

        // Configurar el submit del formulario
        const form = document.getElementById('editar-calificacion-modal-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/estudiantes_asignatura/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Periodo_Academico: document.getElementById('editar-periodo').value,
                        Asignatura: document.getElementById('editar-asignatura').value,
                        Seccion: document.getElementById('editar-seccion').value,
                        Estudiante_Cedula: document.getElementById('editar-cedula-estudiante').value,
                        Estudiante_Nombre: document.getElementById('editar-estudiante').value,
                        Nota: document.getElementById('editar-nota').value,
                        Nota_Definitiva: document.getElementById('editar-nota-definitiva').value,
                        Estado: document.getElementById('editar-estado').value
                    }),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                
                await tablaCalificaciones.cargarDatos();
                clonarFilasOriginales();
                actualizarPaginacion();
                modal.style.display = 'none';
            } catch (error) {
                console.error('Error al editar:', error);
                alert(`Error al editar: ${error.message}`);
            }
        };

        // Configurar cierre del modal
        const closeElements = [
            document.querySelector('#editarCalificacionModal .close'),
            document.getElementById('cancelar-editar-calificacion-modal')
        ];
        
        closeElements.forEach(el => {
            if (el) el.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        });
    };

    // Inicialización
    const inicializar = async () => {
        try {
            await cargarDatosParaSelects();
            await tablaCalificaciones.cargarDatos();
            formatearEstados();
            clonarFilasOriginales();
            actualizarPaginacion();
        } catch (error) {
            console.error('Error en inicialización:', error);
            const tbody = document.querySelector('#tabla-calificar tbody');
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: red;">Error al cargar los datos</td></tr>';
        }
    };

    inicializar();
});