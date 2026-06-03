const MEMBRETE_PATH = '../img/logoredu.png';
const getToken = () => localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', function() {
    const carreraSelect = document.getElementById('carrera-orden-merito');
    const pensumSelect = document.getElementById('pensum-orden-merito');
    const periodoSelect = document.getElementById('periodo-orden-merito');
    const generarBtn = document.querySelector('.contenedor-orden-merito__boton');
    const resultadoDiv = document.getElementById('resultado-orden-merito');

    async function cargarCarreras() {
        try {
            const token = getToken();
            if (!token) throw new Error('No autorizado');
            const resp = await fetch('/api/carreras', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error('Error');
            const carreras = await resp.json();
            carreraSelect.innerHTML = '<option value="" disabled selected>Seleccione una Carrera</option>';
            carreras.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.Codigo_Carrera;
                opt.textContent = c.Nombre_Carrera;
                carreraSelect.appendChild(opt);
            });
        } catch (e) {
            console.error('Error cargando carreras:', e);
        }
    }

    async function cargarPensums() {
        try {
            const token = getToken();
            if (!token) throw new Error('No autorizado');
            const resp = await fetch('/api/pensum', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error('Error');
            const pensums = await resp.json();
            pensumSelect.innerHTML = '<option value="" disabled selected>Seleccione un Pensum</option>';
            pensums.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.Codigo_Pensum;
                opt.textContent = p.Nombre_Pensum;
                pensumSelect.appendChild(opt);
            });
            pensumSelect.disabled = false;
        } catch (e) {
            console.error('Error cargando pensums:', e);
        }
    }

    async function cargarPeriodos() {
        try {
            const token = getToken();
            if (!token) throw new Error('No autorizado');
            const resp = await fetch('/api/periodo_academico', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error('Error');
            const periodos = await resp.json();
            periodoSelect.innerHTML = '<option value="" disabled selected>Seleccione un Período</option>';
            periodos.sort((a, b) => b.Periodo_Academico.localeCompare(a.Periodo_Academico));
            periodos.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.Periodo_Academico;
                opt.textContent = p.Periodo_Academico;
                periodoSelect.appendChild(opt);
            });
        } catch (e) {
            console.error('Error cargando periodos:', e);
        }
    }

    function mostrarMensaje(texto, tipo) {
        resultadoDiv.innerHTML = `<p style="color:${tipo === 'error' ? '#dc3545' : '#28a745'};margin-top:12px;">${texto}</p>`;
    }

    generarBtn.addEventListener('click', async function() {
        const carrera = carreraSelect.value;
        const pensum = pensumSelect.value;
        const periodo = periodoSelect.value;

        if (!carrera || !periodo) {
            mostrarMensaje('Seleccione Carrera, Pensum y Período', 'error');
            return;
        }

        const carreraNombre = carreraSelect.options[carreraSelect.selectedIndex].text;
        const pensumNombre = pensumSelect.value ? pensumSelect.options[pensumSelect.selectedIndex].text : '';
        const periodoNombre = periodoSelect.options[periodoSelect.selectedIndex].text;

        generarBtn.disabled = true;
        generarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

        try {
            const token = getToken();
            const resp = await fetch('/api/administrativo/orden-merito', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ carrera, pensum, periodo })
            });

            if (!resp.ok) throw new Error('Error del servidor');
            const data = await resp.json();

            if (data.ranking.length === 0) {
                mostrarMensaje('No hay datos de calificaciones para los filtros seleccionados.', 'error');
                return;
            }

            generarPDF(data.ranking, carreraNombre, periodoNombre);
            mostrarMensaje(`Orden de mérito generada: ${data.total} estudiantes`, 'success');
        } catch (e) {
            console.error('Error:', e);
            mostrarMensaje('Error al generar la orden de mérito', 'error');
        } finally {
            generarBtn.disabled = false;
            generarBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Generar Orden de Mérito';
        }
    });

    function generarPDF(ranking, carrera, periodo) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');
        const pageW = 297;

        const img = new Image();
        img.src = MEMBRETE_PATH;
        doc.addImage(img, 'PNG', 14, 10, 40, 15);

        doc.setFontSize(18);
        doc.setTextColor(0, 80, 160);
        doc.text('Red Estudiantil Universitaria', 60, 20);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text('Orden de Mérito Académico', 60, 28);

        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Carrera: ${carrera}`, 200, 20);
        doc.text(`Período: ${periodo}`, 200, 27);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 200, 34);

        doc.setDrawColor(0, 80, 160);
        doc.line(14, 38, pageW - 14, 38);

        const headers = [['#', 'Cédula', 'Estudiante', 'Carrera', 'Período', 'Promedio', 'Materias']];
        const body = ranking.map(r => [
            r.posicion,
            r.cedula,
            r.nombre,
            r.carrera,
            r.periodo,
            r.promedio.toFixed(2),
            String(r.materias)
        ]);

        doc.autoTable({
            head: headers,
            body: body,
            startY: 45,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 61, 165],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [240, 244, 250]
            },
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            columns: [
                { header: '#', dataKey: 0 },
                { header: 'Cédula', dataKey: 1 },
                { header: 'Estudiante', dataKey: 2 },
                { header: 'Carrera', dataKey: 3 },
                { header: 'Período', dataKey: 4 },
                { header: 'Promedio', dataKey: 5 },
                { header: 'Materias', dataKey: 6 }
            ]
        });

        const finalY = doc.lastAutoTable.finalY || 240;
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text('Red Estudiantil Universitaria "REU"', 14, finalY + 15);
        doc.text('Documento generado automáticamente por REU System.', 14, finalY + 21);

        doc.save(`orden-merito-${carrera}-${periodo}.pdf`);
    }

    cargarCarreras();
    cargarPensums();
    cargarPeriodos();
});
