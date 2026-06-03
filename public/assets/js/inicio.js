document.addEventListener('DOMContentLoaded', () => {
    const getToken = () => localStorage.getItem('token');

    async function cargarDashboard() {
        const token = getToken();
        if (!token) return;
        try {
            const resp = await fetch('/api/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error('Error al cargar dashboard');
            const data = await resp.json();
            renderDashboard(data);
        } catch (error) {
            console.error('Dashboard error:', error);
        }
    }

    function renderDashboard(data) {
        const grid = document.getElementById('dashboard-grid');

        // Remove loading card
        const loadingCard = document.getElementById('loading-card');
        if (loadingCard) loadingCard.remove();

        // Insert 6 KPI cards before the first nav card
        const firstNav = grid.querySelector('.card');
        const kpiCards = [
            { icon: 'fa-clock', label: 'Sesiones Planificadas', value: data.totalSesiones },
            { icon: 'fa-chalkboard-user', label: 'Docentes Activos', value: data.docentesActivos },
            { icon: 'fa-user-graduate', label: 'Estudiantes (Período)', value: data.estudiantesPeriodo },
            { icon: 'fa-book', label: 'Ofertas Activas', value: data.ofertasActivas },
            { icon: 'fa-flask', label: 'Trabajos Investigación', value: data.trabajosInvestigacion },
            { icon: 'fa-pen', label: 'Calificaciones Pendientes', value: data.calificacionesPendientes },
        ];

        const kpiLinks = {
            'Sesiones Planificadas': 'gestion-horarios.html',
            'Docentes Activos': 'profesores.html',
            'Estudiantes (Período)': 'inscripciones.html',
            'Ofertas Activas': 'ofertas.html',
            'Trabajos Investigación': 'trabajos-investigacion.html',
            'Calificaciones Pendientes': 'calificar-asignaturas.html',
        };

        kpiCards.forEach(c => {
            const a = document.createElement('a');
            a.className = 'dashboard-card';
            a.href = kpiLinks[c.label] || '#';
            a.innerHTML = `
                <div class="card-icon"><i class="fas ${c.icon}"></i></div>
                <div class="card-value">${c.value}</div>
                <div class="card-label">${c.label}</div>
            `;
            grid.insertBefore(a, firstNav);
        });

        // Update nav card counts
        document.getElementById('card-inscripciones-cobrar-count').textContent = data.inscripcionesPendientesPago || '0';

        // --- Legacy bar indicators ---
        const contCalif = document.getElementById('contador-calificaciones');
        const contInsc = document.getElementById('contador-inscripciones-pendientes');
        if (contCalif) contCalif.textContent = data.calificacionesPendientes;
        if (contInsc) contInsc.textContent = data.estudiantesPeriodo;

        const barH = 200;
        const totalCalif = Math.max(data.totalCalificaciones || 1, 1);
        const pendPct = data.calificacionesPendientes / totalCalif;
        const barCalifPend = document.querySelector('#grafico-calificaciones .barra-pendiente');
        if (barCalifPend) barCalifPend.style.height = Math.round(pendPct * barH) + 'px';

        const totalEpa = Math.max(data.estudiantesActivos || 1, 1);
        const epaPct = (data.estudiantesPeriodo || 0) / totalEpa;
        const barEpaPend = document.querySelector('#grafico-inscripciones-pendientes .barra-pendiente');
        if (barEpaPend) barEpaPend.style.height = Math.round(epaPct * barH) + 'px';

        // --- Estudiantes por Carrera chart ---
        const chartContainer = document.getElementById('chart-estudiantes-carrera');
        const carreras = data.estudiantesPorCarrera || [];
        if (chartContainer) {
            if (carreras.length === 0) {
                chartContainer.innerHTML = '<p style="color:#888;width:100%;text-align:center;">No hay datos</p>';
            } else {
                const maxVal = Math.max(...carreras.map(c => c.cantidad), 1);
                const maxHeight = 160;
                chartContainer.innerHTML = carreras.map(c => {
                    const h = Math.round((c.cantidad / maxVal) * maxHeight);
                    const colors = ['#0d6efd','#198754','#fd7e14','#6f42c1','#dc3545','#20c997','#ffc107','#0dcaf0'];
                    const color = colors[carreras.indexOf(c) % colors.length];
                    return `
                        <div class="bar-item">
                            <div class="bar-value">${c.cantidad}</div>
                            <div class="bar" style="height:${Math.max(h, 4)}px;background:${color};"></div>
                            <div class="bar-label">${c.carrera}</div>
                        </div>
                    `;
                }).join('');
            }
        }

        // --- Estudiantes sin Carrera Asignada ---
        const sinCarreraContainer = document.getElementById('chart-estudiantes-sin-carrera');
        if (sinCarreraContainer) {
            const sinCarrera = data.estudiantesSinCarrera || 0;
            const total = data.totalEstudiantes || 1;
            const pct = total > 0 ? Math.round((sinCarrera / total) * 100) : 0;
            sinCarreraContainer.innerHTML = `
                <div class="sin-carrera-number">${sinCarrera}</div>
                <div class="sin-carrera-label">de ${total} estudiantes totales (${pct}%)</div>
                <div class="sin-carrera-bar-wrap">
                    <div class="sin-carrera-bar-fill" style="width:${pct}%"></div>
                </div>
            `;
        }
    }

    cargarDashboard();
});
