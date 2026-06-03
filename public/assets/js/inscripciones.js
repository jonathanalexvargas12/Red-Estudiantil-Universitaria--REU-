import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

// Configuración del membrete - Cambia esta ruta por la correcta
const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';

// Para desplegar los criterios de filtrado del CRUD
const btnFiltrar = document.getElementById('btn-filtrar');
const filtrosBusqueda = document.getElementById('filtros-busqueda');

btnFiltrar.addEventListener('click', () => {
    filtrosBusqueda.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para inscripciones con las nuevas columnas
    const tablaInscripciones = new GenericTable(
        'estudiante_periodo_academico', // Nombre de la tabla en la base de datos
        'tabla-inscripciones', // ID de la tabla HTML
        ['ID', 'Cedula_Estudiante', 'Estado', 'Periodo_Academico', 'Carrera', 'Pago', 'Monto_Pago', 'Moneda', 'Modalidad_Pago', 'Entidad_Bancaria', 'Numero_Transferencia', 'Fecha_Pago', 'Fecha_Registro', 'Nivel_Pensum', 'Turno'], // Todas las columnas
        ['Cedula_Estudiante', 'Carrera', 'Periodo_Academico', 'Fecha_Registro', 'Estado', 'Pago'] // Columnas a mostrar en la tabla HTML
    );

    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('#buscar-input');
    const botonBuscar = document.querySelector('.botones-filtro button:first-child');
    const btnReajustar = document.querySelector('#btn-reajustar');
    const estadoSelect = document.querySelector('#estado-select');
    const pagoSelect = document.querySelector('#pago-select');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para cargar los periodos académicos desde la base de datos
    async function cargarPeriodosAcademicos() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/periodo_academico', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener los periodos académicos');

            const periodos = await response.json();
            const selectPeriodo = document.getElementById('edit-periodo');
            const selectPeriodoAgregar = document.getElementById('nuevo-periodo');
            
            // Limpiar los selects
            selectPeriodo.innerHTML = '<option value="">Seleccione un periodo</option>';
            selectPeriodoAgregar.innerHTML = '<option value="">Seleccione un periodo</option>';

            if (periodos.length === 0) {
                selectPeriodo.innerHTML = '<option value="">No hay periodos registrados</option>';
                selectPeriodoAgregar.innerHTML = '<option value="">No hay periodos registrados</option>';
                return;
            }

            // Agregar las opciones de periodo
            periodos.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.Periodo_Academico;
                option.textContent = periodo.Periodo_Academico;
                selectPeriodo.appendChild(option.cloneNode(true));
                selectPeriodoAgregar.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar periodos académicos:', error);
            const selectPeriodo = document.getElementById('edit-periodo');
            const selectPeriodoAgregar = document.getElementById('nuevo-periodo');
            selectPeriodo.innerHTML = '<option value="">Error al cargar periodos</option>';
            selectPeriodoAgregar.innerHTML = '<option value="">Error al cargar periodos</option>';
        }
    }

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
            const selectCarrera = document.getElementById('edit-carrera');
            const selectCarreraAgregar = document.getElementById('nueva-carrera');
            
            // Limpiar los selects
            selectCarrera.innerHTML = '<option value="">Seleccione una carrera</option>';
            selectCarreraAgregar.innerHTML = '<option value="">Seleccione una carrera</option>';

            if (carreras.length === 0) {
                selectCarrera.innerHTML = '<option value="">No hay carreras registradas</option>';
                selectCarreraAgregar.innerHTML = '<option value="">No hay carreras registradas</option>';
                return;
            }

            // Agregar las opciones de carrera
            carreras.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera.Codigo_Carrera;
                option.textContent = carrera.Codigo_Carrera;
                selectCarrera.appendChild(option.cloneNode(true));
                selectCarreraAgregar.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar carreras:', error);
            const selectCarrera = document.getElementById('edit-carrera');
            const selectCarreraAgregar = document.getElementById('nueva-carrera');
            selectCarrera.innerHTML = '<option value="">Error al cargar carreras</option>';
            selectCarreraAgregar.innerHTML = '<option value="">Error al cargar carreras</option>';
        }
    }

    // Función para formatear el contenido de las celdas especiales
    const formatearCeldasEspeciales = () => {
        const filas = document.querySelectorAll('#tabla-inscripciones tbody tr');
        
        filas.forEach(fila => {
            // Formatear Estado (columna 4 en la tabla mostrada)
            const estadoCell = fila.cells[4];
            const estadoValue = estadoCell.textContent.trim().toLowerCase();
            
            // Solo actualizar si el contenido no es el icono correcto
            const currentEstadoIcon = estadoCell.querySelector('i');
            if (!currentEstadoIcon || 
                (estadoValue === 'activo' && !currentEstadoIcon.classList.contains('estado-activo')) ||
                (estadoValue === 'inactivo' && !currentEstadoIcon.classList.contains('estado-inactivo')) ||
                (estadoValue === 'rechazado' && !currentEstadoIcon.classList.contains('estado-rechazado'))) {
                
                if (estadoValue === 'activo') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-activo" title="Activo"></i>';
                } else if (estadoValue === 'inactivo') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-inactivo" title="Inactivo"></i>';
                } else if (estadoValue === 'rechazado') {
                    estadoCell.innerHTML = '<i class="fas fa-circle estado-rechazado" title="Rechazado"></i>';
                }
            }

            // Formatear Pago (columna 5 en la tabla mostrada)
            const pagoCell = fila.cells[5];
            const pagoValue = pagoCell.textContent.trim().toLowerCase();
            
            // Solo actualizar si el contenido no es el icono correcto
            const currentPagoIcon = pagoCell.querySelector('i');
            if (!currentPagoIcon || 
                (pagoValue.includes('realizado') && !currentPagoIcon.classList.contains('pago-realizado')) ||
                (pagoValue.includes('pendiente') && !currentPagoIcon.classList.contains('pago-pendiente'))) {
                
                if (pagoValue.includes('realizado')) {
                    pagoCell.innerHTML = '<i class="fas fa-check pago-realizado" title="Pago Realizado"></i>';
                } else if (pagoValue.includes('pendiente')) {
                    pagoCell.innerHTML = '<i class="fas fa-times pago-pendiente" title="Pago Pendiente"></i>';
                }
            }
        });
    };

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-inscripciones tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estadoFiltro = estadoSelect.value.toLowerCase();
        const pagoFiltro = pagoSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-inscripciones tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const cedula = fila.cells[0].textContent.toLowerCase();
            const carrera = fila.cells[1].textContent.toLowerCase();
            const periodo = fila.cells[2].textContent.toLowerCase();
            const nivelPensum = fila.cells[6]?.textContent.toLowerCase() || '';
            const turno = fila.cells[7]?.textContent.toLowerCase() || '';
            
            // Obtener el estado real del texto (no del icono)
            const estadoCell = fila.cells[4];
            let estadoValue = '';
            
            // Verificar si tiene un icono para determinar el estado
            const estadoIcon = estadoCell.querySelector('i');
            if (estadoIcon) {
                if (estadoIcon.classList.contains('estado-activo')) {
                    estadoValue = 'activo';
                } else if (estadoIcon.classList.contains('estado-inactivo')) {
                    estadoValue = 'inactivo';
                } else if (estadoIcon.classList.contains('estado-rechazado')) {
                    estadoValue = 'rechazado';
                }
            } else {
                // Si no hay icono, usar el texto directamente
                estadoValue = estadoCell.textContent.trim().toLowerCase();
            }

            // Obtener el estado de pago real del texto (no del icono)
            const pagoCell = fila.cells[5];
            let pagoValue = '';
            
            // Verificar si tiene un icono para determinar el pago
            const pagoIcon = pagoCell.querySelector('i');
            if (pagoIcon) {
                if (pagoIcon.classList.contains('pago-realizado')) {
                    pagoValue = 'realizado';
                } else if (pagoIcon.classList.contains('pago-pendiente')) {
                    pagoValue = 'pendiente';
                }
            } else {
                // Si no hay icono, usar el texto directamente
                pagoValue = pagoCell.textContent.trim().toLowerCase();
            }

            const coincideBusqueda = textoBusqueda === '' || 
                                  cedula.includes(textoBusqueda) || 
                                  carrera.includes(textoBusqueda) || 
                                  periodo.includes(textoBusqueda) ||
                                  nivelPensum.includes(textoBusqueda) ||
                                  turno.includes(textoBusqueda);

            const coincideEstado = estadoFiltro === '' || estadoValue === estadoFiltro;
            const coincidePago = pagoFiltro === '' || pagoValue === pagoFiltro;

            if (coincideBusqueda && coincideEstado && coincidePago) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        tablaInscripciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estadoSelect.value = '';
        pagoSelect.value = '';
        const tbody = document.querySelector('#tabla-inscripciones tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));

        // Reasignar eventos y actualizar paginación
        formatearCeldasEspeciales();
        tablaInscripciones.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-inscripciones tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        // Reasignar eventos para las filas visibles
        formatearCeldasEspeciales();
        tablaInscripciones.asignarEventosEditarEliminar();
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '',
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
        const filas = document.querySelectorAll('#tabla-inscripciones tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente').addEventListener('click', () => {
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

    // Función para generar el PDF adaptada para inscripciones con todas las columnas
    const generarPDF = async (datos) => {
        const { jsPDF } = window.jspdf;
        // Usar orientación landscape para que quepan más columnas
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10; // Reducir margen para aprovechar más espacio
        let yPos = 15;

        // 1. Cargar y agregar el membrete
        const imgMembrete = await cargarImagen(MEMBRETE_IMAGE_PATH);
        if (imgMembrete) {
            const imgWidth = 80; // Reducir tamaño del logo
            const imgHeight = (imgMembrete.height * imgWidth) / imgMembrete.width;
            const xPos = (pageWidth - imgWidth) / 2;
            
            doc.addImage(imgMembrete, 'JPEG', xPos, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 5;
        }

        // 2. Título del reporte
        doc.setFontSize(14); // Reducir tamaño de fuente
        doc.setTextColor(40);
        doc.text('Reporte Completo de Inscripciones', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // 3. Fecha de generación
        const fechaGeneracion = new Date();
        const fechaFormateada = fechaGeneracion.toLocaleDateString();
        doc.setFontSize(8); // Reducir tamaño de fuente
        doc.text(`Generado el: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;

        // 4. Configuración de columnas para inscripciones (todas las columnas)
        const columnConfig = [
            { header: 'ID', dataKey: 'ID', width: 7 },
            { header: 'Cédula', dataKey: 'Cedula_Estudiante', width: 18 },
            { header: 'Estado', dataKey: 'Estado', width: 18 },
            { header: 'Periodo', dataKey: 'Periodo_Academico', width: 18 },
            { header: 'Carrera', dataKey: 'Carrera', width: 18 },
            { header: 'Pago', dataKey: 'Pago', width: 18 },
            { header: 'Monto', dataKey: 'Monto_Pago', width: 18 },
            { header: 'Moneda', dataKey: 'Moneda', width: 18 },
            { header: 'Modalidad Pago', dataKey: 'Modalidad_Pago', width: 22},
            { header: 'Entidad Bancaria', dataKey: 'Entidad_Bancaria', width: 22 },
            { header: 'N° Transferencia', dataKey: 'Numero_Transferencia', width: 22 },
            { header: 'Fecha Pago', dataKey: 'Fecha_Pago', width: 22 },
            { header: 'Fecha Registro', dataKey: 'Fecha_Registro', width: 22 },
            { header: 'Nivel Pensum', dataKey: 'Nivel_Pensum', width: 22 },
            { header: 'Turno', dataKey: 'Turno', width: 20 }
        ];

        // 5. Dibujar tabla con bordes
        const startX = margin;
        let currentX = startX;

        // Estilo para encabezados
        doc.setFontSize(6); // Reducir tamaño de fuente
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40);

        // Dibujar encabezados con bordes
        columnConfig.forEach((col, index) => {
            doc.setFillColor(240, 240, 240);
            doc.rect(currentX, yPos, col.width, 7.5, 'F'); // Reducir altura de fila
            doc.text(col.header, currentX + col.width / 2, yPos + 5, { 
                align: 'center',
                maxWidth: col.width - 2 // Ajustar texto al ancho de columna
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
        doc.setFontSize(6); 
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
                
                // Formatear estados y pagos para que sean más legibles
                if (col.dataKey === 'Estado') {
                    cellContent = cellContent === 'activo' ? 'Activo' : 
                                cellContent === 'inactivo' ? 'Inactivo' : 
                                cellContent === 'rechazado' ? 'Rechazado' : cellContent;
                }
                
                if (col.dataKey === 'Pago') {
                    cellContent = cellContent.includes('realizado') ? 'Realizado' : 'Pendiente';
                }

                const textLines = doc.splitTextToSize(cellContent, col.width - 4);
                const cellHeight = Math.max(8, textLines.length * 5); // Reducir altura de celda

                doc.setDrawColor(200);
                doc.setLineWidth(0.1);
                doc.line(currentX, yPos, currentX, yPos + cellHeight);

                doc.text(textLines, currentX + 1, yPos + 3, { // Ajustar posición del texto
                    maxWidth: col.width - 2,
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
        const nombreArchivo = `Reporte-Completo-Inscripciones-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;
        
        return { doc, nombreArchivo };
    };

    // Evento para el botón de generar PDF
    const btnGenerarPDF = document.getElementById('btn-reporte');
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', async () => {
            btnGenerarPDF.disabled = true;
            btnGenerarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/estudiante_periodo_academico', {
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

    // Métodos para editar
    tablaInscripciones.onEditar = (id, datos, item) => {
        const editarModal = document.getElementById('myModal');
        const editarForm = document.getElementById('modal-form');

        if (!item) {
            console.error('No se encontraron datos del registro');
            return;
        }

        const asignarValorSelect = (selectId, valor) => {
            const select = document.getElementById(selectId);
            if (!select) return;
            if (!valor) { select.selectedIndex = 0; return; }
            if ([...select.options].some(o => o.value === valor)) {
                select.value = valor;
            } else {
                const opt = document.createElement('option');
                opt.value = valor;
                opt.textContent = valor;
                select.appendChild(opt);
                select.value = valor;
            }
        };

        // Cargar carreras y periodos antes de abrir el modal
        Promise.all([cargarCarreras(), cargarPeriodosAcademicos()]).then(() => {
            if (window.refreshTS) refreshTS('#edit-periodo, #edit-carrera');
            document.getElementById('edit-id').value = id;
            document.getElementById('edit-cedula').value = item.Cedula_Estudiante || '';
            asignarValorSelect('edit-estado', item.Estado || '');
            asignarValorSelect('edit-periodo', item.Periodo_Academico || '');
            asignarValorSelect('edit-carrera', item.Carrera || '');
            asignarValorSelect('edit-nivel-pensum', item.Nivel_Pensum || '');
            asignarValorSelect('edit-turno', item.Turno || '');
            asignarValorSelect('edit-pago', item.Pago === 'realizado' || item.Pago === 'Realizado' ? 'realizado' : 'pendiente');
            asignarValorSelect('edit-moneda', item.Moneda || 'Bs');
            asignarValorSelect('edit-modalidad-pago', item.Modalidad_Pago || '');
            document.getElementById('edit-monto-pago').value = item.Monto_Pago || '';
            asignarValorSelect('edit-entidad-bancaria', item.Entidad_Bancaria || '');
            document.getElementById('edit-numero-transferencia').value = item.Numero_Transferencia || '';
            document.getElementById('edit-fecha-pago').value = item.Fecha_Pago || '';
            document.getElementById('edit-fecha-registro').value = item.Fecha_Registro || '';

            editarModal.style.display = 'block';

            editarForm.onsubmit = async (event) => {
                event.preventDefault();
                const nuevosDatos = {
                    Cedula_Estudiante: document.getElementById('edit-cedula').value,
                    Estado: document.getElementById('edit-estado').value,
                    Periodo_Academico: document.getElementById('edit-periodo').value,
                    Carrera: document.getElementById('edit-carrera').value,
                    Pago: document.getElementById('edit-pago').value,
                    Monto_Pago: document.getElementById('edit-monto-pago').value,
                    Moneda: document.getElementById('edit-moneda').value,
                    Modalidad_Pago: document.getElementById('edit-modalidad-pago').value,
                    Entidad_Bancaria: document.getElementById('edit-entidad-bancaria').value,
                    Numero_Transferencia: document.getElementById('edit-numero-transferencia').value,
                    Fecha_Pago: document.getElementById('edit-fecha-pago').value,
                    Fecha_Registro: document.getElementById('edit-fecha-registro').value,
                    Nivel_Pensum: document.getElementById('edit-nivel-pensum').value,
                    Turno: document.getElementById('edit-turno').value
                };

                try {
                    const token = getToken();
                    if (!token) throw new Error('No se encontró el token JWT');

                    const response = await fetch(`/api/estudiante_periodo_academico/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(nuevosDatos),
                    });

                    if (!response.ok) throw new Error('Error al editar el registro');
                    tablaInscripciones.cargarDatos().then(() => {
                        formatearCeldasEspeciales();
                        clonarFilasOriginales();
                        actualizarPaginacion();
                    });
                    editarModal.style.display = 'none';
                } catch (error) {
                    console.error('Error:', error);
                    alert(`Error al editar: ${error.message}`);
                }
            };
        });

        const editarClose = document.querySelector('.close');
        if (editarClose) {
            editarClose.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }

        const cancelarEditar = document.getElementById('cancelar-modal');
        if (cancelarEditar) {
            cancelarEditar.addEventListener('click', () => {
                editarModal.style.display = 'none';
            });
        }
    };

    // Método para eliminar - IMPLEMENTACIÓN MEJORADA
    tablaInscripciones.onEliminar = (id) => {
        const modalAnular = document.getElementById('modalAnular');
        modalAnular.style.display = 'block';

        const btnAceptar = document.getElementById('btn-aceptar-anular');
        const btnCancelar = document.getElementById('btn-cancelar-anular');

        // Limpiar eventos anteriores para evitar duplicados
        btnAceptar.replaceWith(btnAceptar.cloneNode(true));
        btnCancelar.replaceWith(btnCancelar.cloneNode(true));
        
        const nuevoBtnAceptar = document.getElementById('btn-aceptar-anular');
        const nuevoBtnCancelar = document.getElementById('btn-cancelar-anular');

        const eliminarRegistro = async () => {
            try {
                const token = getToken();
                if (!token) {
                    throw new Error('No se encontró el token JWT');
                }

                console.log('Intentando eliminar registro con ID:', id); // Depuración

                const response = await fetch(`/api/estudiante_periodo_academico/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar el registro');
                }

                // Recargar datos y actualizar interfaz
                await tablaInscripciones.cargarDatos();
                formatearCeldasEspeciales();
                clonarFilasOriginales();
                actualizarPaginacion();
                
                // Mostrar notificación de éxito
                alert('Registro eliminado correctamente');
                
                modalAnular.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
                // Mostrar error al usuario
                alert(`Error al eliminar: ${error.message}`);
            }
        };

        nuevoBtnAceptar.addEventListener('click', eliminarRegistro);
        nuevoBtnCancelar.addEventListener('click', () => {
            modalAnular.style.display = 'none';
        });

        const closeAnular = document.querySelector('.close-anular');
        if (closeAnular) {
            closeAnular.addEventListener('click', () => {
                modalAnular.style.display = 'none';
            });
        }
    };

    // Función helper para enviar inscripción completa
    const enviarInscripcionCompleta = async (datosBase, materiasIds, token, form) => {
        try {
            const body = { ...datosBase, Materias: materiasIds };
            const response = await fetch('/api/inscripcion-completa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Error al completar inscripción');
            }
            const result = await response.json();
            await tablaInscripciones.cargarDatos();
            formatearCeldasEspeciales();
            clonarFilasOriginales();
            actualizarPaginacion();
            form.reset();
            alert(result.message);
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    };

    // Evento para el botón de agregar - IMPLEMENTACIÓN MEJORADA
    document.getElementById('btn-agregar').addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarModal');
        const agregarForm = document.getElementById('agregar-modal-form');

        // Cargar carreras y periodos antes de abrir el modal
        Promise.all([cargarCarreras(), cargarPeriodosAcademicos()]).then(() => {
            if (window.refreshTS) refreshTS('#nuevo-periodo, #nueva-carrera');
            // Limpiar el formulario antes de mostrar el modal
            agregarForm.reset();
            agregarModal.style.display = 'block';

            // Configurar la fecha actual como valor por defecto
            const fechaActual = new Date().toISOString().split('T')[0];
            document.getElementById('nueva-fecha-registro').value = fechaActual;
            document.getElementById('nueva-fecha-pago').value = fechaActual;

            agregarForm.onsubmit = async (event) => {
                event.preventDefault();
                
                const cedula = document.getElementById('nueva-cedula').value;
                const periodo = document.getElementById('nuevo-periodo').value;
                const carrera = document.getElementById('nueva-carrera').value;
                
                if (!cedula || !periodo || !carrera) {
                    alert('Por favor complete todos los campos requeridos');
                    return;
                }

                const nuevosDatos = {
                    Cedula_Estudiante: cedula,
                    Estado: document.getElementById('nuevo-estado').value || 'activo',
                    Periodo_Academico: periodo,
                    Carrera: carrera,
                    Pago: document.getElementById('nuevo-pago').value || 'pendiente',
                    Monto_Pago: document.getElementById('nuevo-monto-pago').value || 0,
                    Moneda: document.getElementById('nueva-moneda').value || 'Bs',
                    Modalidad_Pago: document.getElementById('nueva-modalidad-pago').value || '',
                    Entidad_Bancaria: document.getElementById('nueva-entidad-bancaria').value || '',
                    Numero_Transferencia: document.getElementById('nuevo-numero-transferencia').value || '',
                    Fecha_Pago: document.getElementById('nueva-fecha-pago').value || null,
                    Nivel_Pensum: document.getElementById('nuevo-nivel-pensum').value || '',
                    Turno: document.getElementById('nuevo-turno').value || ''
                };

                try {
                    const token = getToken();
                    if (!token) throw new Error('No se encontró el token JWT');

                    // Fetch available materias
                    const materiasResp = await fetch(
                        `/api/inscripcion/materias-disponibles?carrera=${encodeURIComponent(carrera)}&periodo=${encodeURIComponent(periodo)}`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    if (!materiasResp.ok) throw new Error('Error al consultar materias disponibles');
                    const materias = await materiasResp.json();

                    // Fill materia modal info
                    document.getElementById('materias-estudiante').textContent = `${nuevosDatos.Cedula_Estudiante}`;
                    document.getElementById('materias-cedula').textContent = nuevosDatos.Cedula_Estudiante;
                    document.getElementById('materias-periodo').textContent = periodo;
                    document.getElementById('materias-carrera').textContent = carrera;

                    const lista = document.getElementById('materias-lista');
                    lista.innerHTML = '';
                    if (materias.length === 0) {
                        lista.innerHTML = '<p>No hay materias disponibles para esta carrera y período.</p>';
                    } else {
                        materias.forEach(m => {
                            const div = document.createElement('div');
                            div.style = 'margin:5px 0;padding:5px;border-bottom:1px solid #eee;';
                            div.innerHTML = `
                                <label style="cursor:pointer;">
                                    <input type="checkbox" class="materia-checkbox" value="${m.ID}" checked>
                                    <strong>${m.Nombre_Asignatura || m.Asignatura}</strong>
                                    - Docente: ${m.Docente_Nombre || 'Sin asignar'}
                                    - Sección: ${m.Seccion || 'N/A'}
                                </label>`;
                            lista.appendChild(div);
                        });
                    }

                    agregarModal.style.display = 'none';

                    const materiasModal = document.getElementById('materiasModal');
                    materiasModal.style.display = 'block';

                    // Remove old listeners by cloning
                    const btnConfirmar = document.getElementById('btn-confirmar-materias');
                    const btnSaltar = document.getElementById('btn-saltar-materias');
                    const newConfirmar = btnConfirmar.cloneNode(true);
                    const newSaltar = btnSaltar.cloneNode(true);
                    btnConfirmar.parentNode.replaceChild(newConfirmar, btnConfirmar);
                    btnSaltar.parentNode.replaceChild(newSaltar, btnSaltar);

                    document.getElementById('btn-confirmar-materias').onclick = async () => {
                        const checks = document.querySelectorAll('.materia-checkbox:checked');
                        const materiasIds = Array.from(checks).map(c => c.value);
                        await enviarInscripcionCompleta(nuevosDatos, materiasIds, token, agregarForm);
                        materiasModal.style.display = 'none';
                    };

                    document.getElementById('btn-saltar-materias').onclick = async () => {
                        await enviarInscripcionCompleta(nuevosDatos, [], token, agregarForm);
                        materiasModal.style.display = 'none';
                    };

                    const closeMaterias = document.querySelector('.close-materias');
                    if (closeMaterias) {
                        closeMaterias.onclick = () => { materiasModal.style.display = 'none'; };
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert(`Error: ${error.message}`);
                }
            };
        });

        // Manejar cierre del modal
        const agregarClose = document.querySelector('.agregar-close');
        if (agregarClose) {
            agregarClose.addEventListener('click', () => {
                agregarModal.style.display = 'none';
                agregarForm.reset();
            });
        }

        const cancelarAgregar = document.getElementById('cancelar-agregar-modal');
        if (cancelarAgregar) {
            cancelarAgregar.addEventListener('click', () => {
                agregarModal.style.display = 'none';
                agregarForm.reset();
            });
        }
    });

    // Cargar carreras y periodos al iniciar la página
    cargarCarreras();
    cargarPeriodosAcademicos();
    setTimeout(() => { if (window.refreshTS) refreshTS('#edit-periodo, #edit-carrera, #nuevo-periodo, #nueva-carrera'); }, 300);

    // Inicialización
    tablaInscripciones.cargarDatos().then(() => {
        formatearCeldasEspeciales();
        clonarFilasOriginales();
        actualizarPaginacion();
    });
});