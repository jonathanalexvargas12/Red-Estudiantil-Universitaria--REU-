import { renderizarPaginacion } from './paginacion.js';

const MEMBRETE_PATH = '../img/logoredu.png';

const getToken = () => localStorage.getItem('token');
let datosOriginales = [];
let currentPage = 1;
let totalPages = 1;
const rowsPerPage = 5;

async function cargarPendientes() {
    const token = getToken();
    if (!token) return;
    try {
        const resp = await fetch('/api/administrativo/inscripciones-pendientes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Error al cargar');
        datosOriginales = await resp.json();
        document.getElementById('total-pendientes').textContent =
            `Pendientes: ${datosOriginales.length}`;
        aplicarFiltros();
    } catch (e) {
        console.error('Error:', e);
        document.getElementById('tabla-cobros-body').innerHTML =
            '<tr><td colspan="10">Error al cargar datos</td></tr>';
    }
}

function actualizarPaginacion() {
    renderizarPaginacion({
        sufijo: '',
        paginaActual: currentPage,
        totalPaginas: totalPages,
        alCambiarPagina: (pagina) => {
            currentPage = pagina;
            renderTabla(datosFiltrados);
            actualizarPaginacion();
        }
    });
    const total = datosFiltrados.length;
    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, total);
    document.querySelector('.info-paginacion').textContent =
        total > 0 ? `${start + 1}-${end} de ${total}` : '';
}

let datosFiltrados = [];

function aplicarFiltros() {
    const filtroTexto = (document.getElementById('buscar-input').value || '').toLowerCase();
    const filtroPago = document.getElementById('pago-select').value;

    let data = datosOriginales;

    if (filtroTexto) {
        data = data.filter(r =>
            (r.Estudiante_Nombre || '').toLowerCase().includes(filtroTexto) ||
            (r.Cedula_Estudiante || '').includes(filtroTexto) ||
            (r.Carrera || '').toLowerCase().includes(filtroTexto) ||
            (r.Periodo_Academico || '').includes(filtroTexto)
        );
    }
    if (filtroPago) {
        data = data.filter(r => r.Pago === filtroPago);
    }

    datosFiltrados = data;
    totalPages = Math.ceil(data.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = 1;

    renderTabla(data);
    actualizarPaginacion();
}

function renderTabla(data) {
    const tbody = document.getElementById('tabla-cobros-body');
    const start = (currentPage - 1) * rowsPerPage;
    const page = data.slice(start, start + rowsPerPage);

    if (page.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#888;">No hay registros</td></tr>';
        return;
    }

    tbody.innerHTML = page.map(r => {
        const pagoClass = r.Pago === 'Aprobado' ? 'pago-realizado' :
                          r.Pago === 'Procesando' ? 'pago-procesando' : 'pago-pendiente';
        const pagoIcon = r.Pago === 'Aprobado' ? 'fa-check-circle' :
                         r.Pago === 'Procesando' ? 'fa-clock' : 'fa-hourglass';
        const accion = r.Pago === 'Aprobado'
            ? `<button class="btn-accion btn-pdf" data-id="${r.ID}" title="Descargar recibo"><i class="fa-solid fa-file-pdf"></i></button>`
            : `<button class="btn-accion btn-conciliar" data-id='${JSON.stringify(r).replace(/'/g, "&#39;")}' title="Conciliar"><i class="fa-solid fa-hand-holding-dollar"></i></button>`;
        const monto = r.Monto_Pago != null && r.Monto_Pago != 0 ? parseFloat(r.Monto_Pago).toFixed(2) : '—';
        return `<tr>
            <td>${r.ID}</td>
            <td>${r.Estudiante_Nombre || '—'}</td>
            <td>${r.Cedula_Estudiante}</td>
            <td>${r.Carrera || '—'}</td>
            <td>${r.Periodo_Academico}</td>
            <td>${monto}</td>
            <td>${r.Moneda || '—'}</td>
            <td class="${pagoClass}"><i class="fas ${pagoIcon}"></i> ${r.Pago}</td>
            <td>${r.Fecha_Registro ? new Date(r.Fecha_Registro).toLocaleDateString('es-ES') : '—'}</td>
            <td>${accion}</td>
        </tr>`;
    }).join('');

    document.querySelectorAll('.btn-conciliar').forEach(btn => {
        btn.addEventListener('click', () => {
            const data = JSON.parse(btn.dataset.id);
            abrirModalConciliar(data);
        });
    });

    document.querySelectorAll('.btn-pdf').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const row = datosOriginales.find(r => r.ID === id);
            if (row) generarReciboPDF(row);
        });
    });
}

function abrirModalConciliar(data) {
    document.getElementById('conciliar-id').value = data.ID;
    document.getElementById('conciliar-estudiante').textContent = data.Estudiante_Nombre || '—';
    document.getElementById('conciliar-cedula').textContent = data.Cedula_Estudiante;
    document.getElementById('conciliar-periodo').textContent = data.Periodo_Academico;
    document.getElementById('conciliar-monto').textContent =
        `${data.Monto_Pago ? parseFloat(data.Monto_Pago).toFixed(2) : '0.00'} ${data.Moneda || 'Bs'}`;
    document.getElementById('campo-monto').value = data.Monto_Pago || 0;
    document.getElementById('campo-metodo').value = '';
    document.getElementById('campo-referencia').value = '';
    document.getElementById('modal-conciliar').style.display = 'flex';
}

function cerrarModalConciliar() {
    document.getElementById('modal-conciliar').style.display = 'none';
}

async function aprobarPago() {
    const id = document.getElementById('conciliar-id').value;
    const monto = document.getElementById('campo-monto').value;
    const metodo = document.getElementById('campo-metodo').value;
    const referencia = document.getElementById('campo-referencia').value;

    if (!monto || parseFloat(monto) <= 0) {
        alert('Ingrese un monto válido');
        return;
    }
    if (!metodo) {
        alert('Seleccione un método de pago');
        return;
    }

    const token = getToken();
    try {
        const resp = await fetch(`/api/administrativo/registrar-pago/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ referencia, metodo_pago: metodo, monto_confirmado: parseFloat(monto) })
        });
        if (!resp.ok) throw new Error('Error al registrar pago');
        const data = await resp.json();

        cerrarModalConciliar();
        mostrarRecibo(id, datosOriginales.find(r => r.ID == id));
        cargarPendientes();
    } catch (e) {
        console.error('Error:', e);
        alert('Error al registrar el pago');
    }
}

function mostrarRecibo(id, data) {
    document.getElementById('recibo-detalle').textContent =
        `Recibo generado para ${data.Estudiante_Nombre || 'el estudiante'} - Periodo ${data.Periodo_Academico}`;
    document.getElementById('modal-recibo').style.display = 'flex';

    document.getElementById('btn-descargar-recibo').onclick = () => {
        const row = datosOriginales.find(r => r.ID == id);
        if (row) generarReciboPDF(row);
    };
}

function cerrarModalRecibo() {
    document.getElementById('modal-recibo').style.display = 'none';
}

function generarReciboPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const img = new Image();
    img.src = MEMBRETE_PATH;
    doc.addImage(img, 'PNG', 14, 10, 40, 15);

    doc.setFontSize(18);
    doc.setTextColor(0, 80, 160);
    doc.text('Red Estudiantil Universitaria', 60, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('REU System - Recibo de Pago', 60, 27);

    const folio = `REC-${data.Periodo_Academico}-${String(data.ID).padStart(4, '0')}`;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Nro. Recibo: ${folio}`, 150, 20);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 150, 27);

    doc.setDrawColor(0, 80, 160);
    doc.line(14, 32, 196, 32);

    // Datos del estudiante
    doc.setFontSize(11);
    doc.text('DATOS DEL ESTUDIANTE', 14, 42);
    doc.setFontSize(10);
    doc.text(`Cédula: ${data.Cedula_Estudiante}`, 14, 50);
    doc.text(`Nombre: ${data.Estudiante_Nombre || '—'}`, 14, 57);
    doc.text(`Carrera: ${data.Carrera || '—'}`, 14, 64);
    doc.text(`Período: ${data.Periodo_Academico}`, 14, 71);

    doc.setDrawColor(200);
    doc.line(14, 78, 196, 78);

    // Detalle del pago
    doc.setFontSize(11);
    doc.text('DETALLE DEL PAGO', 14, 88);
    doc.setFontSize(10);
    doc.text(`Concepto: Inscripción Regular - ${data.Periodo_Academico}`, 14, 96);
    doc.text(`Monto: ${data.Monto_Pago ? parseFloat(data.Monto_Pago).toFixed(2) : '0.00'} ${data.Moneda || 'Bs'}`, 14, 103);
    doc.text(`Método: ${data.Modalidad_Pago || '—'}`, 14, 110);
    doc.text(`Referencia: ${data.Numero_Transferencia || '—'}`, 14, 117);

    doc.setDrawColor(200);
    doc.line(14, 124, 196, 124);

    // Estado
    const y = 140;
    doc.setFontSize(26);
    doc.setTextColor(46, 160, 67);
    doc.text('PROCESADO / ESTADO: SOLVENTE', 14, y);

    doc.setFontSize(10);
    doc.setTextColor(150);
    const now = new Date();
    doc.text(`Emitido: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}`, 14, y + 10);

    // Firma
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Red Estudiantil Universitaria "REU"', 14, 270);
    doc.text('Este documento es un comprobante oficial de pago.', 14, 276);

    doc.save(`recibo-${folio}.pdf`);
}

document.addEventListener('DOMContentLoaded', () => {
    cargarPendientes();

    document.getElementById('btn-buscar').addEventListener('click', () => {
        currentPage = 1;
        aplicarFiltros();
    });

    document.getElementById('btn-reajustar').addEventListener('click', () => {
        document.getElementById('buscar-input').value = '';
        document.getElementById('pago-select').value = '';
        currentPage = 1;
        aplicarFiltros();
    });

    document.getElementById('buscar-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            aplicarFiltros();
        }
    });

    document.getElementById('pago-select').addEventListener('change', () => {
        currentPage = 1;
        aplicarFiltros();
    });

    document.getElementById('btn-aprobar-pago').addEventListener('click', aprobarPago);
    document.getElementById('modal-close-conciliar').addEventListener('click', cerrarModalConciliar);
    document.getElementById('modal-close-recibo').addEventListener('click', cerrarModalRecibo);
    document.getElementById('btn-cerrar-recibo').addEventListener('click', cerrarModalRecibo);

    document.getElementById('modal-conciliar').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) cerrarModalConciliar();
    });
    document.getElementById('modal-recibo').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) cerrarModalRecibo();
    });
});
