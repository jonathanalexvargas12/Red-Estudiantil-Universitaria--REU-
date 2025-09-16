import GenericTable from './genericTable.js';

// Configuración del membrete
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

// Para desplegar los criterios de filtrado 
const btnFiltrar = document.querySelector('.boton-crud-calificaciones:first-child'); 
const filtrosBusqueda = document.querySelector('.filtros-busqueda-calificaciones');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', async () => {
    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // Función para cargar datos en un select
    async function cargarSelect(url, selectId, valueField, textField, placeholder = 'Seleccione una opción') {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error en la respuesta');

            const data = await response.json();
            const select = document.getElementById(selectId);
            
            // Limpiar select completamente
            select.innerHTML = '';
            
            // Agregar opción placeholder (no disabled para que sea seleccionable)
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = placeholder;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            if (data.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay datos disponibles';
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

            // Asegurarse que el select no esté disabled
            select.disabled = false;

        } catch (error) {
            console.error(`Error cargando ${selectId}:`, error);
            const select = document.getElementById(selectId);
            select.innerHTML = '';
            
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Error cargando datos';
            select.appendChild(option);
            
            // Asegurarse que el select no esté disabled incluso en caso de error
            select.disabled = false;
        }
    }

    // Cargar datos para selects (filtros y modal)
    async function cargarDatosParaSelects() {
        try {
            await Promise.all([
                cargarSelect('/api/periodo_academico', 'periodo-select', 'Periodo_Academico', 'Periodo_Academico', 'Todos los periodos'),
                cargarSelect('/api/asignaturas', 'asignatura-select', 'Codigo_Asignatura', 'Nombre_Asignatura', 'Todas las asignaturas')
            ]);
            
            // Asegurarse explícitamente que los selects no estén disabled
            document.getElementById('periodo-select').disabled = false;
            document.getElementById('asignatura-select').disabled = false;

        } catch (error) {
            console.error('Error cargando datos para selects:', error);
        }
    }

    // Resto del código permanece igual...
    // [Aquí iría todo el resto del código exactamente igual que en la versión anterior]
    // Solo hemos modificado la función cargarSelect y cargarDatosParaSelects

    // Instanciar la tabla genérica para calificaciones
    const tablaCalificaciones = new GenericTable(
        'calificaciones', 
        'tabla-calificaciones', 
        [
            'ID', 'Cedula_Estudiante', 'Nombre_Estudiante', 'Carrera', 'Trayecto', 
            'Sem/Trim', 'Seccion', 'Unidad_Curricular', 'Cedula_Docente', 
            'Nombre_Docente', 'Estado', 'Calificacion_Numerica', 
            'Calificacion_Cualitativa', 'Periodo_Academico'
        ], 
        [
            'ID', 'Periodo_Academico', 'Unidad_Curricular', 'Seccion', 'Nombre_Docente',
            'Nombre_Estudiante', 'Calificacion_Numerica'
        ] 
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
        doc.text('Reporte Completo de Calificaciones', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // 3. Fecha de generación
        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(8);
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;

        // 4. Configuración de columnas (columnas seleccionadas para mostrar)
        const columnConfig = [
            { header: '#', dataKey: 'ID', width: 10 },
            { header: 'Estudiante', dataKey: 'Nombre_Estudiante', width: 30 },
            { header: 'Carrera', dataKey: 'Carrera', width: 20 },
            { header: 'Trayecto', dataKey: 'Trayecto', width: 15 },
            { header: 'Sem/Trim', dataKey: 'Sem/Trim', width: 15 },
            { header: 'Sección', dataKey: 'Seccion', width: 15 },
            { header: 'Unidad Curricular', dataKey: 'Unidad_Curricular', width: 30 },
            { header: 'Docente', dataKey: 'Nombre_Docente', width: 30 },
            { header: 'Estado', dataKey: 'Estado', width: 20 },
            { header: 'Calif. Numérica', dataKey: 'Calificacion_Numerica', width: 20 },
            { header: 'Calif. Cualitativa', dataKey: 'Calificacion_Cualitativa', width: 25 },
            { header: 'Periodo Académico', dataKey: 'Periodo_Academico', width: 25 }
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
                
                // Formatear calificaciones numéricas para mejor legibilidad
                if (col.dataKey === 'Calificacion_Numerica') {
                    cellContent = parseFloat(cellContent).toFixed(2);
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
    const btnGenerarPDF = document.querySelector('.boton-crud-calificaciones:last-child');
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', async () => {
            btnGenerarPDF.disabled = true;
            btnGenerarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/calificaciones', {
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
    const buscarInput = document.querySelector('.buscar-input-calificaciones');
    const botonBuscar = document.querySelector('.botones-filtro-calificaciones button:first-child');
    const btnReajustar = document.querySelector('.botones-filtro-calificaciones button:last-child');
    const periodoSelect = document.getElementById('periodo-select');
    const asignaturaSelect = document.getElementById('asignatura-select');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-calificaciones tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const periodoFiltro = periodoSelect.value;
        const asignaturaFiltro = asignaturaSelect.value;
        const tbody = document.querySelector('#tabla-calificaciones tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const estudiante = fila.cells[5].textContent.toLowerCase();
            const docente = fila.cells[4].textContent.toLowerCase();
            const periodo = fila.cells[1].textContent;
            const asignatura = fila.cells[2].textContent;
            
            const coincideBusqueda = textoBusqueda === '' || 
                                  estudiante.includes(textoBusqueda) || 
                                  docente.includes(textoBusqueda);

            const coincidePeriodo = periodoFiltro === '' || periodo === periodoFiltro;
            const coincideAsignatura = asignaturaFiltro === '' || asignatura === asignaturaFiltro;

            if (coincideBusqueda && coincidePeriodo && coincideAsignatura) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Reasignar eventos y actualizar paginación
        tablaCalificaciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        periodoSelect.value = '';
        asignaturaSelect.value = '';
        const tbody = document.querySelector('#tabla-calificaciones tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        tablaCalificaciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-calificaciones tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-calificaciones').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        // Reasignar eventos para las filas visibles
        tablaCalificaciones.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-calificaciones');
        const nextButton = document.querySelector('.pagina-siguiente-calificaciones');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-calificaciones');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-calificaciones');
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
        const filas = document.querySelectorAll('#tabla-calificaciones tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior-calificaciones').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-calificaciones').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Métodos para editar
    tablaCalificaciones.onEditar = async (id, datos) => {
        const editarModal = document.getElementById('editarModal');
        const editarForm = document.getElementById('editar-modal-form');

        // Cargar opciones para los selects del modal de edición
        await Promise.all([
            cargarSelect('/api/periodo_academico', 'editar-periodo', 'Periodo_Academico', 'Periodo_Academico', 'Seleccione periodo'),
            cargarSelect('/api/asignaturas', 'editar-asignatura', 'Codigo_Asignatura', 'Nombre_Asignatura', 'Seleccione asignatura'),
            cargarSelect('/api/secciones', 'editar-seccion', 'Codigo_Seccion', 'Codigo_Seccion', 'Seleccione sección')
        ]);

        // Precargar los datos en el formulario
        const periodoSelect = editarForm.querySelector('#editar-periodo');
        const asignaturaSelect = editarForm.querySelector('#editar-asignatura');
        const seccionSelect = editarForm.querySelector('#editar-seccion');
        const profesorInput = editarForm.querySelector('#editar-profesor');
        const estudianteInput = editarForm.querySelector('#editar-estudiante');
        const notaInput = editarForm.querySelector('#editar-nota');

        // Establecer valores seleccionados
        periodoSelect.value = datos[1];  // Periodo_Academico
        asignaturaSelect.value = datos[2];  // Unidad_Curricular
        seccionSelect.value = datos[3];  // Seccion
        profesorInput.value = datos[4];  // Nombre_Docente
        estudianteInput.value = datos[5];  // Nombre_Estudiante
        notaInput.value = datos[6];  // Calificacion_Numerica

        editarModal.style.display = 'block';

        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            const nuevosDatos = {
                Periodo_Academico: periodoSelect.value,
                Unidad_Curricular: asignaturaSelect.value,
                Seccion: seccionSelect.value,
                Nombre_Docente: profesorInput.value,
                Nombre_Estudiante: estudianteInput.value,
                Calificacion_Numerica: parseFloat(notaInput.value),
                Calificacion_Cualitativa: parseFloat(notaInput.value) >= 10 ? 'Aprobado' : 'Reprobado'
            };

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/calificaciones/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevosDatos),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                tablaCalificaciones.cargarDatos().then(() => {
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
    tablaCalificaciones.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarModal');
        eliminarModal.style.display = 'block';

        const btnAceptarEliminar = document.getElementById('btn-aceptar-eliminar');
        const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
        const eliminarClose = document.querySelector('.eliminar-close');

        const eliminarRegistro = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/calificaciones/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                tablaCalificaciones.cargarDatos().then(() => {
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
    const inicializar = async () => {
        try {
            await cargarDatosParaSelects();
            await tablaCalificaciones.cargarDatos();
            clonarFilasOriginales();
            actualizarPaginacion();
        } catch (error) {
            console.error('Error en inicialización:', error);
            const tbody = document.querySelector('#tabla-calificaciones tbody');
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Error al cargar los datos</td></tr>';
        }
    };

    inicializar();
});