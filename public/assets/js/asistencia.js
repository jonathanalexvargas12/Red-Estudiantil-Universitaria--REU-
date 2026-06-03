const getToken = () => localStorage.getItem('token');

const getDecodedToken = () => {
    const token = getToken();
    if (!token) return null;
    try {
        return jwt_decode(token);
    } catch (e) {
        return null;
    }
};

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

document.addEventListener('DOMContentLoaded', async () => {
    const decoded = getDecodedToken();
    if (!decoded) return;

    const fechaActual = new Date();
    document.getElementById('fecha-actual').textContent = fechaActual.toLocaleDateString('es-ES');
    document.getElementById('dia-actual').textContent = diasSemana[fechaActual.getDay()];

    let docenteCedula = decoded.id;
    let docenteNombre = '';

    try {
        const res = await fetch('/api/docentes', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const docentes = await res.json();
        const docente = docentes.find(d => d.Cedula === docenteCedula || d.Usuario === docenteCedula);
        if (docente) {
            docenteCedula = docente.Cedula;
            docenteNombre = `${docente.Nombres} ${docente.Apellidos}`;
            document.getElementById('docente-nombre').textContent = docenteNombre;
        } else {
            document.getElementById('docente-nombre').textContent = docenteCedula;
        }
    } catch (e) {
        document.getElementById('docente-nombre').textContent = docenteCedula;
    }

    const cargarHorario = async () => {
        try {
            const res = await fetch(`/api/asistencia/horario-hoy/${docenteCedula}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!res.ok) throw new Error('Error al cargar horario');
            const horario = await res.json();
            const tbody = document.querySelector('#tabla-asistencia tbody');
            tbody.innerHTML = '';

            if (horario.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No tiene clases programadas para hoy</td></tr>';
                document.querySelector('.info-paginacion-asistencia').textContent = '0 registros';
                return;
            }

            horario.forEach(item => {
                const fila = document.createElement('tr');
                const fechaStr = fechaActual.toISOString().split('T')[0];

                fila.innerHTML = `
                    <td>${item.Desde || '--:--'}</td>
                    <td>${item.Hasta || '--:--'}</td>
                    <td>${item.Nombre_Asignatura || item.Asignatura}</td>
                    <td>${item.Seccion}</td>
                    <td class="estado-asistencia" data-verificado="false">Pendiente</td>
                    <td><button class="btn-marcar-asistencia" data-desde="${item.Desde}" data-asignatura="${item.Asignatura}" data-seccion="${item.Seccion}">Marcar</button></td>
                `;

                tbody.appendChild(fila);
            });

            verificarAsistencias(fechaStr);
            document.querySelector('.info-paginacion-asistencia').textContent = `${horario.length} registro(s)`;
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const verificarAsistencias = async (fechaStr) => {
        const filas = document.querySelectorAll('#tabla-asistencia tbody tr');
        for (const fila of filas) {
            const btn = fila.querySelector('.btn-marcar-asistencia');
            if (!btn) continue;
            const horaInicio = btn.dataset.desde;

            try {
                const res = await fetch(`/api/asistencia/verificar?docente=${docenteCedula}&fecha=${fechaStr}&hora=${horaInicio}`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                const data = await res.json();
                const estadoCelda = fila.querySelector('.estado-asistencia');
                if (data.existe) {
                    estadoCelda.innerHTML = '<span class="estatus-circulo solicitud-aceptada"></span> Registrada';
                    estadoCelda.dataset.verificado = 'true';
                    btn.textContent = '✔ Hecho';
                    btn.disabled = true;
                    btn.style.opacity = '0.6';
                }
            } catch (e) {
                console.error('Error verificando:', e);
            }
        }
    };

    document.querySelector('#tabla-asistencia tbody').addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-marcar-asistencia');
        if (!btn || btn.disabled) return;

        const desde = btn.dataset.desde;
        const asignatura = btn.dataset.asignatura;
        const seccion = btn.dataset.seccion;

        document.getElementById('confirmar-mensaje').textContent =
            `¿Desea marcar asistencia para la clase de las ${desde}?`;

        const modal = document.getElementById('confirmarModal');
        modal.style.display = 'block';

        document.getElementById('btn-confirmar-si').onclick = async () => {
            try {
                const fechaStr = fechaActual.toISOString().split('T')[0];
                const res = await fetch('/api/asistencia/marcar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({
                        Docente_Cedula: docenteCedula,
                        Horario_Desde: desde,
                        Fecha: fechaStr
                    })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Error al marcar asistencia');
                }

                modal.style.display = 'none';
                await cargarHorario();
            } catch (err) {
                alert(err.message);
                modal.style.display = 'none';
            }
        };

        document.getElementById('btn-confirmar-no').onclick = () => {
            modal.style.display = 'none';
        };

        document.querySelector('#confirmarModal .close').onclick = () => {
            modal.style.display = 'none';
        };
    });

    document.getElementById('btn-recargar').addEventListener('click', cargarHorario);

    document.getElementById('btn-ver-reporte').addEventListener('click', () => {
        window.location.href = 'horas-impartidas.html';
    });

    await cargarHorario();
});
