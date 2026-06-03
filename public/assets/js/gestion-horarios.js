import { renderizarPaginacion } from './paginacion.js';

const MEMBRETE_IMAGE_PATH = '../img/logoredu.png';
const getToken = () => localStorage.getItem('token');

let todosLosDatos = [];
let grupos = [];
let currentPage = 1;
const rowsPerPage = 5;
let totalRows = 0;
let totalPages = 0;
let grupoActivo = null;
let contextoAgregar = null;
let idAEliminar = null;
let datosFiltrados = [];

const ROL = localStorage.getItem('role');
let userData = {};
try { userData = JSON.parse(localStorage.getItem('userData') || '{}'); } catch (e) {}
const esRolLectura = () => ROL === 'Docente' || ROL === 'Estudiante';

document.addEventListener('DOMContentLoaded', () => {
    mostrarBadgeRol();

    cargarOpcionesSelects().then(() => {
        if (ROL === 'Docente') aplicarFiltroDocente();
        else if (ROL === 'Estudiante') aplicarFiltroEstudiante();
        cargarDatos();
    });

    document.getElementById('btn-agregar-horario').addEventListener('click', () => abrirModalAgregar(null));
    document.getElementById('btn-agregar-en-grupo').addEventListener('click', () => {
        if (grupoActivo) abrirModalAgregar(grupoActivo);
    });
    document.getElementById('btn-imprimir-grupo').addEventListener('click', () => {
        if (grupoActivo) generarPDF(grupoActivo);
    });
    document.querySelector('.detalle-close').addEventListener('click', cerrarDetalle);
    document.getElementById('detalle-grupo').addEventListener('click', (e) => {
        if (e.target === document.getElementById('detalle-grupo')) cerrarDetalle();
    });

    document.getElementById('agregar-hora-desde').addEventListener('change', () => autoCalcularTurno('agregar'));
    document.getElementById('editar-hora-desde').addEventListener('change', () => autoCalcularTurno('editar'));

    document.querySelector('.btn-buscar-gestion').addEventListener('click', filtrarGrupos);
    document.querySelector('.btn-reajustar-gestion').addEventListener('click', reajustarFiltros);
    document.getElementById('filtro-busqueda').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filtrarGrupos();
    });

    document.querySelector('.pagina-anterior-gestion').addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; mostrarPagina(); actualizarPaginacion(); }
    });
    document.querySelector('.pagina-siguiente-gestion').addEventListener('click', () => {
        if (currentPage < totalPages) { currentPage++; mostrarPagina(); actualizarPaginacion(); }
    });

    if (esRolLectura()) {
        const btn = document.getElementById('btn-agregar-horario');
        if (btn) btn.style.display = 'none';
    }

    configurarModalAgregar();
    configurarModalEditar();
    configurarModalEliminar();
    configurarCierresModal();
});

function configurarCierresModal() {
    document.querySelector('.agregar-close').addEventListener('click', () => {
        document.getElementById('agregarHoraModal').style.display = 'none';
        contextoAgregar = null;
    });
    document.getElementById('cancelar-agregar-hora-modal').addEventListener('click', () => {
        document.getElementById('agregarHoraModal').style.display = 'none';
        contextoAgregar = null;
    });
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('editarHoraModal').style.display = 'none';
    });
    document.getElementById('cancelar-editar-hora-modal').addEventListener('click', () => {
        document.getElementById('editarHoraModal').style.display = 'none';
    });
    document.querySelector('.eliminar-close').addEventListener('click', () => {
        document.getElementById('eliminarHoraModal').style.display = 'none';
    });
    document.getElementById('btn-cancelar-eliminar-hora').addEventListener('click', () => {
        document.getElementById('eliminarHoraModal').style.display = 'none';
    });
}

function prepararSelect(sel) {
    while (sel.options.length > 1) sel.remove(1);
    sel.selectedIndex = 0;
}

async function cargarOpcionesSelects() {
    try {
        const token = getToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        const [resCarreras, resPensums, resPeriodos, resSecciones, resNiveles, resAsignaturas, resDocentes] = await Promise.all([
            fetch('/api/carreras', { headers }),
            fetch('/api/pensum', { headers }),
            fetch('/api/periodo_academico', { headers }),
            fetch('/api/secciones', { headers }),
            fetch('/api/nivel_pensum', { headers }),
            fetch('/api/asignaturas', { headers }),
            fetch('/api/docentes', { headers })
        ]);

        const carreras = await resCarreras.json();
        const pensums = await resPensums.json();
        const periodos = await resPeriodos.json();
        const secciones = await resSecciones.json();
        const niveles = await resNiveles.json();
        const asignaturas = await resAsignaturas.json();
        const docentes = await resDocentes.json();

        const pares = [
            ['agregar-carrera', 'editar-carrera', 'filtro-carrera', carreras, 'Codigo_Carrera', 'Codigo_Carrera'],
            ['agregar-pensum', 'editar-pensum', null, pensums, 'Codigo_Pensum', 'Nombre_Pensum'],
            ['agregar-periodo-academico', 'editar-periodo-academico', 'filtro-periodo', periodos, 'Periodo_Academico', 'Periodo_Academico'],
            ['agregar-seccion', 'editar-seccion', null, secciones, 'Codigo_Seccion', 'Codigo_Seccion'],
            ['agregar-nivel', 'editar-nivel', null, niveles, 'Nombre_Nivel', 'Nombre_Nivel'],
            ['agregar-asignatura', 'editar-asignatura', null, asignaturas, 'Codigo_Asignatura', 'Codigo_Asignatura'],
            ['agregar-docente', 'editar-docente', 'filtro-docente', docentes, 'Cedula', (d) => `${d.Nombres} ${d.Apellidos}`]
        ];

        pares.forEach(([idAdd, idEdit, idFilter, data, valueKey, labelKey]) => {
            if (idAdd) {
                const selAdd = document.getElementById(idAdd);
                if (selAdd) { prepararSelect(selAdd); poblarSelect(selAdd, data, valueKey, labelKey); }
            }
            if (idEdit) {
                const selEdit = document.getElementById(idEdit);
                if (selEdit) { prepararSelect(selEdit); poblarSelect(selEdit, data, valueKey, labelKey); }
            }
            if (idFilter) {
                const selFilter = document.getElementById(idFilter);
                if (selFilter) { prepararSelect(selFilter); poblarSelect(selFilter, data, valueKey, labelKey); }
            }
        });

        if (window.refreshTS) refreshTS('#filtro-carrera, #filtro-periodo, #filtro-docente, #agregar-carrera, #agregar-periodo-academico, #agregar-seccion, #agregar-nivel, #agregar-asignatura, #agregar-docente, #agregar-pensum, #editar-carrera, #editar-periodo-academico, #editar-seccion, #editar-nivel, #editar-asignatura, #editar-docente, #editar-pensum');

        const selectsTurno = ['agregar-turno', 'editar-turno'];
        selectsTurno.forEach(id => {
            const sel = document.getElementById(id);
            if (sel) {
                prepararSelect(sel);
                ['Mañana', 'Tarde', 'Noche'].forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t;
                    opt.textContent = t;
                    sel.appendChild(opt);
                });
            }
        });

    } catch (error) {
        console.error('Error cargando opciones:', error);
    }
}

function poblarSelect(select, data, valueKey, labelKey) {
    data.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item[valueKey];
        opt.textContent = typeof labelKey === 'function' ? labelKey(item) : item[labelKey];
        select.appendChild(opt);
    });
}

async function cargarDatos() {
    try {
        const token = getToken();
        const response = await fetch('/api/horas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar datos');
        todosLosDatos = await response.json();
        procesarDatos();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos');
    }
}

function procesarDatos() {
    agrupar(todosLosDatos);
}

async function refrescarDatos() {
    const grupoSnapshot = grupoActivo ? { ...grupoActivo } : null;
    try {
        const token = getToken();
        const response = await fetch('/api/horas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar datos');
        todosLosDatos = await response.json();
        procesarDatos();
        if (grupoSnapshot) {
            const grupoActualizado = grupos.find(g =>
                g.Carrera === grupoSnapshot.Carrera &&
                g.Seccion === grupoSnapshot.Seccion &&
                g.Periodo_Academico === grupoSnapshot.Periodo_Academico &&
                g.Nivel === grupoSnapshot.Nivel &&
                g.Docente_Cedula === grupoSnapshot.Docente_Cedula
            );
            if (grupoActualizado && grupoActualizado.registros.length > 0) {
                mostrarDetalle(grupoActualizado);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos');
    }
}

function agrupar(datos) {
    const mapa = {};
    datos.forEach(item => {
        const carrera = item.Carrera || 'Sin asignar';
        const seccion = item.Seccion != null ? String(item.Seccion) : 'Sin asignar';
        const periodo = item.Periodo_Academico || 'Sin asignar';
        const nivel = item.Nivel || 'Sin asignar';
        const docenteCedula = item.Docente_Cedula || '';
        const docente = item.Docente || 'Sin asignar';
        const clave = `${carrera}|${seccion}|${periodo}|${nivel}|${docenteCedula}`;
        if (!mapa[clave]) {
            mapa[clave] = {
                Carrera: carrera,
                Seccion: seccion,
                Periodo_Academico: periodo,
                Nivel: nivel,
                Docente: docente,
                Docente_Cedula: docenteCedula,
                registros: []
            };
        }
        mapa[clave].registros.push(item);
    });

    grupos = Object.values(mapa);
    datosFiltrados = [...grupos];
    aplicarFiltros();
}

function aplicarFiltros() {
    const texto = document.getElementById('filtro-busqueda').value.toLowerCase().trim();
    const carreraFiltro = document.getElementById('filtro-carrera').value;
    const periodoFiltro = document.getElementById('filtro-periodo').value;
    const docenteFiltro = document.getElementById('filtro-docente').value;

    datosFiltrados = grupos.filter(g => {
        if (carreraFiltro && g.Carrera !== carreraFiltro) return false;
        if (periodoFiltro && g.Periodo_Academico !== periodoFiltro) return false;
        if (docenteFiltro && g.Docente_Cedula !== docenteFiltro) return false;
        if (texto) {
            const busqueda = `${g.Carrera} ${g.Seccion} ${g.Periodo_Academico} ${g.Nivel} ${g.Docente}`.toLowerCase();
            if (!busqueda.includes(texto)) return false;
        }
        return true;
    });

    cerrarDetalle();
    currentPage = 1;
    renderizarTabla();
}

function renderizarTabla() {
    const tbody = document.querySelector('#tabla-gestion tbody');
    tbody.innerHTML = '';

    totalRows = datosFiltrados.length;
    totalPages = Math.ceil(totalRows / rowsPerPage);
    if (totalPages === 0) totalPages = 1;

    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, totalRows);
    const pageData = datosFiltrados.slice(start, end);

    pageData.forEach(grupo => {
        const tr = document.createElement('tr');

        const tdCarrera = document.createElement('td');
        tdCarrera.textContent = grupo.Carrera;
        tr.appendChild(tdCarrera);

        const tdSeccion = document.createElement('td');
        tdSeccion.textContent = grupo.Seccion;
        tr.appendChild(tdSeccion);

        const tdPeriodo = document.createElement('td');
        tdPeriodo.textContent = grupo.Periodo_Academico;
        tr.appendChild(tdPeriodo);

        const tdNivel = document.createElement('td');
        tdNivel.textContent = grupo.Nivel;
        tr.appendChild(tdNivel);

        const tdDocente = document.createElement('td');
        tdDocente.textContent = grupo.Docente;
        tr.appendChild(tdDocente);

        const tdCount = document.createElement('td');
        tdCount.textContent = `${grupo.registros.length} registro(s)`;
        tr.appendChild(tdCount);

        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'acciones-cell';

        const iconoVer = document.createElement('i');
        iconoVer.className = 'fa-solid fa-eye accion-icono';
        iconoVer.title = 'Ver detalles';
        iconoVer.addEventListener('click', () => mostrarDetalle(grupo));
        tdAcciones.appendChild(iconoVer);

        const iconoPDF = document.createElement('i');
        iconoPDF.className = 'fa-solid fa-file-pdf accion-icono';
        iconoPDF.title = 'Imprimir PDF';
        iconoPDF.addEventListener('click', () => generarPDF(grupo));
        tdAcciones.appendChild(iconoPDF);

        tr.appendChild(tdAcciones);
        tbody.appendChild(tr);
    });

    actualizarInfoPaginacion();
    renderizarPaginacion({
        sufijo: '-gestion',
        paginaActual: currentPage,
        totalPaginas: totalPages,
        alCambiarPagina: (pag) => {
            currentPage = pag;
            renderizarTabla();
        }
    });
}

function actualizarInfoPaginacion() {
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, totalRows);
    const info = document.querySelector('.info-paginacion-gestion');
    if (info) {
        info.textContent = totalRows > 0 ? `${start}-${end} de ${totalRows}` : '0 registros';
    }
}

function mostrarPagina() {
    renderizarTabla();
}

function actualizarPaginacion() {
    renderizarPaginacion({
        sufijo: '-gestion',
        paginaActual: currentPage,
        totalPaginas: totalPages,
        alCambiarPagina: (pag) => {
            currentPage = pag;
            renderizarTabla();
        }
    });
}

function filtrarGrupos() {
    aplicarFiltros();
}

function reajustarFiltros() {
    document.getElementById('filtro-carrera').selectedIndex = 0;
    document.getElementById('filtro-periodo').selectedIndex = 0;
    if (!document.getElementById('filtro-docente').disabled) {
        document.getElementById('filtro-docente').selectedIndex = 0;
    }
    document.getElementById('filtro-busqueda').value = '';
    aplicarFiltros();
}

function mostrarDetalle(grupo) {
    grupoActivo = grupo;
    const detalleDiv = document.getElementById('detalle-grupo');
    const titulo = document.getElementById('detalle-titulo');
    titulo.textContent = `${grupo.Carrera} | Secci\u00f3n ${grupo.Seccion} | ${grupo.Periodo_Academico} | ${grupo.Nivel} | ${grupo.Docente}`;

    const tbody = document.querySelector('#tabla-detalle-grupo tbody');
    tbody.innerHTML = '';

    grupo.registros.forEach(item => {
        const tr = document.createElement('tr');

        const tdDesde = document.createElement('td');
        tdDesde.textContent = item.Desde || '';
        tr.appendChild(tdDesde);

        const tdHasta = document.createElement('td');
        tdHasta.textContent = item.Hasta || '';
        tr.appendChild(tdHasta);

        const tdDias = document.createElement('td');
        tdDias.textContent = item.Dias || '';
        tr.appendChild(tdDias);

        const tdTurno = document.createElement('td');
        tdTurno.textContent = item.Turno || '';
        tr.appendChild(tdTurno);

        const tdAsignatura = document.createElement('td');
        tdAsignatura.textContent = item.Asignatura || '';
        tr.appendChild(tdAsignatura);

        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'acciones-cell';

        if (esRolLectura()) {
            tdAcciones.innerHTML = '<span class="sin-acciones">—</span>';
        } else {
            const iconoEditar = document.createElement('i');
            iconoEditar.className = 'fas fa-edit accion-icono';
            iconoEditar.title = 'Editar';
            iconoEditar.addEventListener('click', () => abrirModalEditar(item));
            tdAcciones.appendChild(iconoEditar);

            const iconoEliminar = document.createElement('i');
            iconoEliminar.className = 'fas fa-trash-alt accion-icono';
            iconoEliminar.title = 'Eliminar';
            iconoEliminar.addEventListener('click', () => abrirModalEliminar(item.ID));
            tdAcciones.appendChild(iconoEliminar);
        }

        tr.appendChild(tdAcciones);
        tbody.appendChild(tr);
    });

    const btnAgregarEnGrupo = document.getElementById('btn-agregar-en-grupo');
    if (btnAgregarEnGrupo) btnAgregarEnGrupo.style.display = esRolLectura() ? 'none' : '';

    detalleDiv.style.display = 'block';
    detalleDiv.classList.remove('cerrando');
}

function mostrarBadgeRol() {
    const badge = document.getElementById('rol-badge');
    if (!badge) return;
    if (ROL === 'Docente') {
        badge.textContent = 'Modo Docente';
        badge.className = 'rol-badge docente';
    } else if (ROL === 'Estudiante') {
        badge.textContent = 'Modo Estudiante';
        badge.className = 'rol-badge estudiante';
    }
}

function aplicarFiltroDocente() {
    const cedula = userData.Cedula || '';
    if (!cedula) return;
    const sel = document.getElementById('filtro-docente');
    if (!sel) return;
    for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === cedula) {
            sel.selectedIndex = i;
            sel.disabled = true;
            sel.title = 'Filtro bloqueado — mostrando tus horarios';
            break;
        }
    }
}

async function aplicarFiltroEstudiante() {
    const cedula = userData.Cedula || '';
    if (!cedula) return;
    try {
        const token = getToken();
        const resp = await fetch('/api/estudiantes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) return;
        const estudiantes = await resp.json();
        const estudiante = Array.isArray(estudiantes)
            ? estudiantes.find(e => e.Cedula === cedula)
            : null;
        if (estudiante && estudiante.Carrera) {
            asginarValorSelect('filtro-carrera', estudiante.Carrera);
        }
    } catch (e) {
        console.warn('No se pudo aplicar filtro de estudiante:', e);
    }
}

function cerrarDetalle() {
    grupoActivo = null;
    document.getElementById('detalle-grupo').style.display = 'none';
}

async function cargarImagen(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => { console.warn('No se pudo cargar la imagen:', url); resolve(null); };
        img.src = url;
    });
}

function formatearFechaParaNombre(fecha) {
    const d = new Date(fecha);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function generarPDF(grupo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yPos = 15;

    const imgMembrete = await cargarImagen(MEMBRETE_IMAGE_PATH);
    if (imgMembrete) {
        const imgWidth = 80;
        const imgHeight = (imgMembrete.height * imgWidth) / imgMembrete.width;
        const xPos = (pageWidth - imgWidth) / 2;
        doc.addImage(imgMembrete, 'JPEG', xPos, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 5;
    }

    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(
        `Horario de Clases - ${grupo.Carrera} Secci\u00f3n ${grupo.Seccion} Periodo ${grupo.Periodo_Academico} Nivel ${grupo.Nivel}`,
        pageWidth / 2, yPos, { align: 'center' }
    );
    yPos += 8;

    const fechaGeneracion = new Date();
    doc.setFontSize(8);
    doc.text(`Generado el: ${fechaGeneracion.toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;

    doc.setFontSize(9);
    doc.text(`Docente: ${grupo.Docente}`, margin, yPos);
    yPos += 8;

    const columnConfig = [
        { header: 'Desde', dataKey: 'Desde', width: 16 },
        { header: 'Hasta', dataKey: 'Hasta', width: 16 },
        { header: 'D\u00edas', dataKey: 'Dias', width: 55 },
        { header: 'Turno', dataKey: 'Turno', width: 16 },
        { header: 'Asignatura', dataKey: 'Asignatura', width: 30 },
        { header: 'Docente', dataKey: 'Docente', width: 35 },
        { header: 'Nivel', dataKey: 'Nivel', width: 25 }
    ];

    const tableWidth = columnConfig.reduce((sum, col) => sum + col.width, 0);
    const startX = (pageWidth - tableWidth) / 2;
    let currentX = startX;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);

    columnConfig.forEach((col, index) => {
        doc.setFillColor(240, 240, 240);
        doc.rect(currentX, yPos, col.width, 8, 'F');
        doc.text(col.header, currentX + col.width / 2, yPos + 5, { align: 'center', maxWidth: col.width - 2 });
        doc.setDrawColor(200);
        doc.setLineWidth(0.1);
        doc.line(currentX, yPos, currentX, yPos + 8);
        if (index === columnConfig.length - 1) doc.line(currentX + col.width, yPos, currentX + col.width, yPos + 8);
        currentX += col.width;
    });

    doc.line(startX, yPos, currentX, yPos);
    doc.line(startX, yPos + 8, currentX, yPos + 8);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0);

    const registros = grupo.registros;
    registros.forEach(item => {
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
                align: 'center', maxWidth: col.width - 2, baseline: 'top'
            });

            if (colIndex === columnConfig.length - 1) doc.line(currentX + col.width, yPos, currentX + col.width, yPos + cellHeight);
            currentX += col.width;
            maxCellHeight = Math.max(maxCellHeight, cellHeight);
        });
        doc.line(startX, yPos, currentX, yPos);
        doc.line(startX, yPos + maxCellHeight, currentX, yPos + maxCellHeight);
        yPos += maxCellHeight;
    });

    const nombreArchivo = `Horario-${grupo.Carrera}-${grupo.Seccion}-${grupo.Periodo_Academico}-${grupo.Nivel}-${formatearFechaParaNombre(fechaGeneracion)}.pdf`;

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
}

function abrirModalAgregar(contextoGrupo) {
    const modal = document.getElementById('agregarHoraModal');
    contextoAgregar = contextoGrupo;

    document.getElementById('agregar-hora-desde').value = '';
    document.getElementById('agregar-hora-hasta').value = '';
    document.querySelectorAll('#agregar-hora-modal-form input[name="agregar-dias[]"]').forEach(cb => cb.checked = false);
    document.getElementById('agregar-turno').selectedIndex = 0;
    document.getElementById('agregar-pensum').selectedIndex = 0;
    document.getElementById('agregar-asignatura').selectedIndex = 0;

    if (contextoGrupo) {
        asginarValorSelect('agregar-carrera', contextoGrupo.Carrera);
        asginarValorSelect('agregar-seccion', contextoGrupo.Seccion);
        asginarValorSelect('agregar-periodo-academico', contextoGrupo.Periodo_Academico);
        asginarValorSelect('agregar-nivel', contextoGrupo.Nivel);
        asginarValorSelect('agregar-docente', contextoGrupo.Docente_Cedula);
    } else {
        document.getElementById('agregar-carrera').selectedIndex = 0;
        document.getElementById('agregar-seccion').selectedIndex = 0;
        document.getElementById('agregar-periodo-academico').selectedIndex = 0;
        document.getElementById('agregar-nivel').selectedIndex = 0;
        document.getElementById('agregar-docente').selectedIndex = 0;
    }

    modal.style.display = 'block';
}

function asginarValorSelect(id, valor) {
    const sel = document.getElementById(id);
    if (!sel || !valor) return;
    for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value.trim().toLowerCase() === valor.toString().trim().toLowerCase()) {
            sel.selectedIndex = i;
            return;
        }
    }
}

function autoCalcularTurno(prefix) {
    const desde = document.getElementById(`${prefix}-hora-desde`).value;
    const select = document.getElementById(`${prefix}-turno`);
    if (!desde || !select) return;
    if (select.value !== '') return;
    const hora = parseInt(desde.split(':')[0], 10);
    let turno = '';
    if (hora >= 6 && hora < 12) turno = 'Mañana';
    else if (hora >= 12 && hora < 18) turno = 'Tarde';
    else turno = 'Noche';
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === turno) {
            select.selectedIndex = i;
            break;
        }
    }
}

function autoCalcularTurnoSync(desde) {
    if (!desde) return '';
    const hora = parseInt(desde.split(':')[0], 10);
    if (hora >= 6 && hora < 12) return 'Mañana';
    if (hora >= 12 && hora < 18) return 'Tarde';
    return 'Noche';
}

function setSelectValue(id, value) {
    const sel = document.getElementById(id);
    if (!sel) return;
    for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === value) {
            sel.selectedIndex = i;
            break;
        }
    }
}

function configurarModalAgregar() {
    document.getElementById('agregar-hora-modal-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const horaDesde = document.getElementById('agregar-hora-desde').value;
        const horaHasta = document.getElementById('agregar-hora-hasta').value;
        const diasCheckboxes = Array.from(document.querySelectorAll('#agregar-hora-modal-form input[name="agregar-dias[]"]:checked'));
        const dias = diasCheckboxes.map(cb => cb.value).join(',');
        const turno = document.getElementById('agregar-turno').value;
        const pensum = document.getElementById('agregar-pensum').value;
        const asignatura = document.getElementById('agregar-asignatura').value;

        const carrera = contextoAgregar ? contextoAgregar.Carrera : document.getElementById('agregar-carrera').value;
        const periodoAcademico = contextoAgregar ? contextoAgregar.Periodo_Academico : document.getElementById('agregar-periodo-academico').value;
        const seccion = contextoAgregar ? contextoAgregar.Seccion : document.getElementById('agregar-seccion').value;
        const nivel = contextoAgregar ? contextoAgregar.Nivel : document.getElementById('agregar-nivel').value || null;
        const docenteCedula = contextoAgregar ? contextoAgregar.Docente_Cedula : document.getElementById('agregar-docente').value;

        if (!horaDesde || !horaHasta) { alert('Por favor ingrese ambas horas'); return; }
        if (horaDesde >= horaHasta) { alert('La hora "Desde" debe ser menor que la hora "Hasta"'); return; }
        if (!dias) { alert('Por favor seleccione al menos un d\u00eda'); return; }
        if (!carrera || !periodoAcademico || !seccion || !asignatura || !docenteCedula) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }
        const turnoFinal = turno || autoCalcularTurnoSync(horaDesde);

        try {
            const token = getToken();
            const response = await fetch('/api/horas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    Desde: horaDesde, Hasta: horaHasta, Dias: dias, Turno: turnoFinal,
                    Carrera: carrera, Pensum: pensum || null, Periodo_Academico: periodoAcademico,
                    Seccion: seccion, Nivel: nivel || null, Asignatura: asignatura, Docente_Cedula: docenteCedula
                })
            });

            if (!response.ok) throw new Error('Error al agregar la hora');
            document.getElementById('agregarHoraModal').style.display = 'none';
            contextoAgregar = null;
            await refrescarDatos();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar la hora: ' + error.message);
        }
    });
}

function abrirModalEditar(item) {
    const modal = document.getElementById('editarHoraModal');
    document.getElementById('editar-hora-desde').value = item.Desde || '';
    document.getElementById('editar-hora-hasta').value = item.Hasta || '';

    const diasSeleccionados = item.Dias ? item.Dias.split(',') : [];
    document.querySelectorAll('#editar-hora-modal-form input[name="editar-dias[]"]').forEach(cb => {
        cb.checked = diasSeleccionados.includes(cb.value);
    });

    setSelectValue('editar-turno', item.Turno || '');
    setSelectValue('editar-carrera', item.Carrera || '');
    setSelectValue('editar-pensum', item.Pensum || '');
    setSelectValue('editar-periodo-academico', item.Periodo_Academico || '');
    setSelectValue('editar-seccion', item.Seccion != null ? String(item.Seccion) : '');
    setSelectValue('editar-nivel', item.Nivel || '');
    setSelectValue('editar-asignatura', item.Asignatura || '');
    setSelectValue('editar-docente', item.Docente_Cedula || '');

    document.getElementById('editar-hora-modal-form').onsubmit = async (event) => {
        event.preventDefault();

        const diasCheckboxes = Array.from(document.querySelectorAll('#editar-hora-modal-form input[name="editar-dias[]"]:checked'));
        const dias = diasCheckboxes.map(cb => cb.value).join(',');
        const turnoEdit = document.getElementById('editar-turno').value;
        const desdeEdit = document.getElementById('editar-hora-desde').value;
        const turnoFinalEdit = turnoEdit || autoCalcularTurnoSync(desdeEdit);

        const nuevosDatos = {
            Desde: desdeEdit,
            Hasta: document.getElementById('editar-hora-hasta').value,
            Dias: dias,
            Turno: turnoFinalEdit,
            Carrera: document.getElementById('editar-carrera').value,
            Pensum: document.getElementById('editar-pensum').value || null,
            Periodo_Academico: document.getElementById('editar-periodo-academico').value,
            Seccion: document.getElementById('editar-seccion').value,
            Nivel: document.getElementById('editar-nivel').value || null,
            Asignatura: document.getElementById('editar-asignatura').value,
            Docente_Cedula: document.getElementById('editar-docente').value
        };

        try {
            const token = getToken();
            const response = await fetch(`/api/horas/${encodeURIComponent(item.ID)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(nuevosDatos)
            });

            if (!response.ok) throw new Error('Error al editar el registro');
            modal.style.display = 'none';
            await refrescarDatos();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al editar: ' + error.message);
        }
    };

    modal.style.display = 'block';
}

function configurarModalEditar() {
}

function abrirModalEliminar(id) {
    idAEliminar = id;
    document.getElementById('eliminarHoraModal').style.display = 'block';
}

function configurarModalEliminar() {
    document.getElementById('btn-aceptar-eliminar-hora').addEventListener('click', async () => {
        if (!idAEliminar) return;
        try {
            const token = getToken();
            const response = await fetch(`/api/horas/${encodeURIComponent(idAEliminar)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al eliminar el registro');
            document.getElementById('eliminarHoraModal').style.display = 'none';
            idAEliminar = null;
            await refrescarDatos();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar');
        }
    });
}
