const getToken = () => localStorage.getItem('token');
const MEMBRETE_PATH = '../img/logoredu.png';

document.addEventListener('DOMContentLoaded', () => {
    const inputCedula = document.getElementById('buscar-cedula');
    const selectPeriodo = document.getElementById('buscar-periodo');
    const btnBuscar = document.getElementById('btn-buscar-retiro');
    const container = document.getElementById('tabla-retiro-container');

    async function cargarPeriodos() {
        try {
            const token = getToken();
            const resp = await fetch('/api/periodo_academico', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) return;
            const periodos = await resp.json();
            periodos.sort((a, b) => b.Periodo_Academico.localeCompare(a.Periodo_Academico));
            selectPeriodo.innerHTML = '<option value="">Todos los períodos</option>';
            periodos.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.Periodo_Academico;
                opt.textContent = p.Periodo_Academico;
                selectPeriodo.appendChild(opt);
            });
        } catch (e) {
            console.error('Error cargando periodos:', e);
        }
    }

    async function buscarEstudiante() {
        const cedula = inputCedula.value.trim();
        if (!cedula) {
            container.innerHTML = '<p style="color:#888;">Ingrese una cédula para buscar.</p>';
            return;
        }

        const periodo = selectPeriodo.value;
        const token = getToken();
        container.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Buscando...</p>';

        try {
            const resp = await fetch(`/api/administrativo/buscar-retiro?cedula=${encodeURIComponent(cedula)}&periodo=${encodeURIComponent(periodo)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) {
                const err = await resp.json();
                container.innerHTML = `<p style="color:#dc3545;">${err.message || 'Error al buscar'}</p>`;
                return;
            }
            const data = await resp.json();
            renderResultados(data);
        } catch (e) {
            console.error('Error:', e);
            container.innerHTML = '<p style="color:#dc3545;">Error de conexión.</p>';
        }
    }

    function renderResultados(data) {
        const { estudiante, materias, inscripcion } = data;

        let html = `
        <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:16px;">
            <h3 style="margin:0 0 8px 0;"><i class="fas fa-user-graduate"></i> ${estudiante.Nombres} ${estudiante.Apellidos}</h3>
            <p style="margin:2px 0;color:#555;">Cédula: ${estudiante.Cedula} | Carrera: ${estudiante.Carrera || '—'} | Período: ${inscripcion.Periodo_Academico}</p>
        </div>`;

        if (materias.length === 0) {
            html += '<p style="color:#888;">No tiene materias inscritas en este período.</p>';
            container.innerHTML = html;
            return;
        }

        html += `
        <table class="crud-table" style="width:100%;border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="padding:8px;text-align:left;border-bottom:2px solid #003DA5;">Asignatura</th>
                    <th style="padding:8px;text-align:left;border-bottom:2px solid #003DA5;">Sección</th>
                    <th style="padding:8px;text-align:left;border-bottom:2px solid #003DA5;">Estado</th>
                    <th style="padding:8px;text-align:center;border-bottom:2px solid #003DA5;">Acción</th>
                </tr>
            </thead>
            <tbody>
        `;

        materias.forEach(m => {
            const puedeRetirar = m.Estado !== 'Retirado' && m.Estado !== 'Retirada';
            html += `
            <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;">${m.Asignatura || m.Codigo_Asignatura || '—'}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${m.Seccion || '—'}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${m.Estado || 'Activo'}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
                    ${puedeRetirar
                        ? `<button class="btn-accion btn-retirar" data-id="${m.ID}" style="background:#dc3545;" title="Retirar materia"><i class="fas fa-ban"></i></button>`
                        : '<span style="color:#888;">Retirado</span>'
                    }
                </td>
            </tr>`;
        });

        html += `
            </tbody>
        </table>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
            <button id="btn-retirar-todas" class="login-button" style="background:#dc3545;padding:8px 20px;"><i class="fas fa-ban"></i> Retirar Todas</button>
            <button id="btn-generar-reporte" class="login-button" style="background:#0d6efd;padding:8px 20px;"><i class="fa-solid fa-file-pdf"></i> Generar Reporte</button>
        </div>`;

        container.innerHTML = html;

    document.querySelectorAll('.btn-retirar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            if (confirm('¿Está seguro de retirar esta materia?')) {
                retirarMateria(estudiante.Cedula, id, inscripcion.Periodo_Academico);
            }
        });
    });

        document.getElementById('btn-retirar-todas').addEventListener('click', () => {
            if (confirm('¿Está seguro de retirar TODAS las materias de este período?')) {
                retirarTodas(estudiante.Cedula, inscripcion.Periodo_Academico, materias);
            }
        });

        document.getElementById('btn-generar-reporte').addEventListener('click', () => {
            generarPDFRetiro(estudiante, inscripcion, materias);
        });
    }

    async function retirarMateria(cedula, id, periodo, materias) {
        const token = getToken();
        try {
            const resp = await fetch('/api/administrativo/retirar-materia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cedula_estudiante: cedula, id_materia: id, periodo_academico: periodo })
            });
            const data = await resp.json();
            if (resp.ok) {
                alert('Materia retirada exitosamente');
                buscarEstudiante();
            } else {
                alert(data.message || 'Error al retirar materia');
            }
        } catch (e) {
            console.error('Error:', e);
            alert('Error de conexión');
        }
    }

    async function retirarTodas(cedula, periodo, materias) {
        const token = getToken();
        try {
            const resp = await fetch('/api/administrativo/retirar-todas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cedula_estudiante: cedula, periodo_academico: periodo })
            });
            const data = await resp.json();
            if (resp.ok) {
                alert(`Retiradas ${data.retiradas} materias exitosamente`);
                buscarEstudiante();
            } else {
                alert(data.message || 'Error al retirar materias');
            }
        } catch (e) {
            console.error('Error:', e);
            alert('Error de conexión');
        }
    }

    function generarPDFRetiro(estudiante, inscripcion, materias) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const img = new Image();
        img.src = MEMBRETE_PATH;
        doc.addImage(img, 'PNG', 14, 10, 40, 15);

        doc.setFontSize(18);
        doc.setTextColor(0, 80, 160);
        doc.text('Red Estudiantil Universitaria', 60, 20);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text('Reporte de Retiro de Materias', 60, 28);

        const folio = `RET-${inscripcion.Periodo_Academico}-${estudiante.Cedula}`;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Folio: ${folio}`, 150, 20);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 150, 27);

        doc.setDrawColor(0, 80, 160);
        doc.line(14, 35, 196, 35);

        doc.setFontSize(11);
        doc.text('DATOS DEL ESTUDIANTE', 14, 45);
        doc.setFontSize(10);
        doc.text(`Cédula: ${estudiante.Cedula}`, 14, 53);
        doc.text(`Nombre: ${estudiante.Nombres} ${estudiante.Apellidos}`, 14, 60);
        doc.text(`Carrera: ${estudiante.Carrera || '—'}`, 14, 67);
        doc.text(`Período: ${inscripcion.Periodo_Academico}`, 14, 74);

        doc.setDrawColor(200);
        doc.line(14, 81, 196, 81);

        doc.setFontSize(11);
        doc.text('MATERIAS RETIRADAS', 14, 91);

        const activas = materias.filter(m => m.Estado !== 'Retirado' && m.Estado !== 'Retirada');
        const retiradas = materias.filter(m => m.Estado === 'Retirado' || m.Estado === 'Retirada');

        let y = 100;
        doc.setFontSize(10);
        if (activas.length > 0) {
            doc.text('Materias Activas:', 14, y);
            y += 7;
            activas.forEach(m => {
                doc.text(`  • ${m.Asignatura || m.Codigo_Asignatura || '—'} (Sección: ${m.Seccion || '—'})`, 18, y);
                y += 6;
            });
        } else {
            doc.text('No hay materias activas.', 14, y);
            y += 7;
        }

        y += 5;
        if (retiradas.length > 0) {
            doc.text('Materias Retiradas:', 14, y);
            y += 7;
            retiradas.forEach(m => {
                doc.text(`  • ${m.Asignatura || m.Codigo_Asignatura || '—'} (Sección: ${m.Seccion || '—'})`, 18, y);
                y += 6;
            });
        }

        y = Math.max(y + 10, 240);
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text('Red Estudiantil Universitaria "REU"', 14, y);
        doc.text('Documento generado automáticamente por REU System.', 14, y + 6);

        doc.save(`reporte-retiro-${folio}.pdf`);
    }

    btnBuscar.addEventListener('click', buscarEstudiante);
    inputCedula.addEventListener('keyup', e => { if (e.key === 'Enter') buscarEstudiante(); });

    cargarPeriodos();
});
