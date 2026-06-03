document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const userDataStr = localStorage.getItem('userData');

    if (!userId || !role || !userDataStr) {
        alert('Datos de usuario no encontrados. Por favor, inicie sesión nuevamente.');
        window.location.href = '/index.html';
        return;
    }

    const userData = JSON.parse(userDataStr);
    const cedula = userData.Cedula || '';

    document.getElementById('cedula').value = cedula;
    document.getElementById('nombres').value = userData.Nombres || 'No disponible';
    document.getElementById('apellidos').value = userData.Apellidos || 'No disponible';
    document.getElementById('direccion').value = userData.Direccion_Residencial || 'No disponible';
    document.getElementById('telefono1').value = userData.Telefono_1 || 'No disponible';
    document.getElementById('telefono2').value = userData.Telefono_2 || 'No disponible';
    document.getElementById('correo').value = userData.Correo || 'No disponible';
    document.getElementById('usuario').value = userId || 'No disponible';

    const carreraSelect = document.getElementById('carrera');
    const periodoSelect = document.getElementById('periodo');
    const nivelPensumSelect = document.getElementById('nivel-pensum');
    const turnoSelect = document.getElementById('turno');
    const enviarBtn = document.querySelector('.contenedor-mis-datos__button');
    const materiasContainer = document.getElementById('materias-reinscripcion');

    const getToken = () => localStorage.getItem('token');

    let datosPrevios = null;

    // Fetch previous data and auto-fill
    async function cargarDatosPrevios() {
        if (!cedula) return;
        try {
            const token = getToken();
            if (!token) return;
            const resp = await fetch(`/api/reinscripcion/datos-previos/${cedula}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) return;
            datosPrevios = await resp.json();

            if (datosPrevios.Carrera) {
                carreraSelect.value = datosPrevios.Carrera;
                carreraSelect.disabled = true;
            }
            if (datosPrevios.Nivel_Pensum_Sugerido) {
                nivelPensumSelect.value = datosPrevios.Nivel_Pensum_Sugerido;
            }
        } catch (error) {
            console.error('Error cargando datos previos:', error);
        }
    }

    function cargarSelect(url, selectId, valueField, textField) {
        return fetch(url, { headers: { 'Authorization': `Bearer ${getToken()}` } })
            .then(r => r.json())
            .then(data => {
                const sel = document.getElementById(selectId);
                sel.innerHTML = '<option value="">Seleccione una opción</option>';
                data.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item[valueField];
                    opt.textContent = item[textField] || item[valueField];
                    sel.appendChild(opt);
                });
            })
            .catch(e => console.error(`Error cargando ${selectId}:`, e));
    }

    async function cargarMateriasDisponibles() {
        const carrera = carreraSelect.value;
        const periodo = periodoSelect.value;
        if (!carrera || !periodo) {
            materiasContainer.innerHTML = '<p style="color:#888;">Seleccione carrera y período para ver materias.</p>';
            return;
        }
        try {
            const token = getToken();
            const resp = await fetch(
                `/api/inscripcion/materias-disponibles?carrera=${encodeURIComponent(carrera)}&periodo=${encodeURIComponent(periodo)}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (!resp.ok) throw new Error('Error al cargar materias');
            const materias = await resp.json();

            if (materias.length === 0) {
                materiasContainer.innerHTML = '<p>No hay materias disponibles para esta carrera y período.</p>';
                return;
            }

            materiasContainer.innerHTML = '';
            materias.forEach(m => {
                const div = document.createElement('div');
                div.style.cssText = 'margin:5px 0;padding:5px;border-bottom:1px solid #eee;';
                div.innerHTML = `
                    <label style="cursor:pointer;">
                        <input type="checkbox" class="materia-reinscripcion" value="${m.ID}" checked>
                        <strong>${m.Nombre_Asignatura || m.Asignatura}</strong>
                        - Docente: ${m.Docente_Nombre || 'Sin asignar'}
                        - Sección: ${m.Seccion || 'N/A'}
                    </label>`;
                materiasContainer.appendChild(div);
            });
        } catch (error) {
            console.error('Error cargando materias:', error);
            materiasContainer.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
    }

    // Load selects
    Promise.all([
        cargarSelect('/api/carreras', 'carrera', 'Codigo_Carrera', 'Nombre_Carrera'),
        cargarSelect('/api/periodo_academico', 'periodo', 'Periodo_Academico', 'Periodo_Academico'),
        cargarSelect('/api/nivel_pensum', 'nivel-pensum', 'Nombre_Nivel', 'Nombre_Nivel'),
    ]).then(() => cargarDatosPrevios());

    // When periodo changes, reload materias
    periodoSelect.addEventListener('change', cargarMateriasDisponibles);
    carreraSelect.addEventListener('change', cargarMateriasDisponibles);

    enviarBtn.addEventListener('click', async function() {
        const carrera = carreraSelect.value;
        const periodo = periodoSelect.value;
        const nivel = nivelPensumSelect.value;
        const turno = turnoSelect.value;

        if (!cedula || !carrera || !periodo || !nivel || !turno) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        enviarBtn.disabled = true;
        enviarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const checks = document.querySelectorAll('.materia-reinscripcion:checked');
            const materiasIds = Array.from(checks).map(c => c.value);

            const response = await fetch('/api/reinscripcion-completa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    Cedula_Estudiante: cedula,
                    Carrera: carrera,
                    Periodo_Academico: periodo,
                    Nivel_Pensum: nivel,
                    Turno: turno,
                    Materias: materiasIds
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Error al procesar la reinscripción');
            }

            const result = await response.json();

            const msgDiv = document.createElement('div');
            msgDiv.style.cssText = 'color:#28a745;margin-top:10px;padding:10px;border-radius:4px;font-size:0.9rem;';
            msgDiv.textContent = `¡Reinscripción exitosa! ${result.message}`;
            enviarBtn.parentNode.insertBefore(msgDiv, enviarBtn);
            enviarBtn.style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            const existingMsg = document.querySelector('.mensaje-error-re');
            if (existingMsg) existingMsg.remove();
            const msgDiv = document.createElement('div');
            msgDiv.className = 'mensaje-error-re';
            msgDiv.style.cssText = 'color:#dc3545;margin-top:10px;padding:10px;border-radius:4px;font-size:0.9rem;';
            msgDiv.textContent = error.message || 'Error al procesar la reinscripción';
            enviarBtn.parentNode.insertBefore(msgDiv, enviarBtn);
        } finally {
            enviarBtn.disabled = false;
            enviarBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Reinscripción';
        }
    });
});
