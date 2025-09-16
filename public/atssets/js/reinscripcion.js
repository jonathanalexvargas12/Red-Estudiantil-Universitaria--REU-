document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener datos del localStorage
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const userDataStr = localStorage.getItem('userData');
    
    try {
        // 2. Validar que existan los datos necesarios
        if (!userId || !role || !userDataStr) {
            throw new Error('Datos de usuario no encontrados. Por favor, inicie sesión nuevamente.');
        }

        const userData = JSON.parse(userDataStr);

        // 3. Actualizar los campos del formulario
        document.getElementById('cedula').value = userData.Cedula || 'No disponible';
        document.getElementById('nombres').value = userData.Nombres || 'No disponible';
        document.getElementById('apellidos').value = userData.Apellidos || 'No disponible';
        document.getElementById('direccion').value = userData.Direccion_Residencial || 'No disponible';
        document.getElementById('telefono1').value = userData.Telefono_1 || 'No disponible';
        document.getElementById('telefono2').value = userData.Telefono_2 || 'No disponible';
        document.getElementById('correo').value = userData.Correo || 'No disponible';
        document.getElementById('usuario').value = userId || 'No disponible';

    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        mostrarError(error.message);
        
        if (error.message.includes('iniciar sesión')) {
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        }
    }

    // Elementos del DOM
    const carreraSelect = document.getElementById('carrera');
    const periodoSelect = document.getElementById('periodo');
    const nivelPensumSelect = document.getElementById('nivel-pensum');
    const turnoSelect = document.getElementById('turno');
    const enviarBtn = document.querySelector('.contenedor-mis-datos__button');

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // 1. Función para cargar niveles del pensum
    async function cargarNivelesPensum() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/nivel_pensum', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener los niveles del pensum');

            const niveles = await response.json();

            // Limpiar y llenar select de niveles
            nivelPensumSelect.innerHTML = '<option value="">Seleccione un Nivel</option>';
            
            niveles.forEach(nivel => {
                const option = document.createElement('option');
                option.value = nivel.ID_Nivel || nivel.Nombre_Nivel;
                option.textContent = nivel.Nombre_Nivel;
                nivelPensumSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar niveles del pensum:', error);
            mostrarError('Error al cargar los niveles del pensum.');
        }
    }

    // 2. Cargar todas las carreras desde api/carreras
    async function cargarCarreras() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/carreras', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener las carreras');

            const carreras = await response.json();

            // Limpiar y llenar select de carreras
            carreraSelect.innerHTML = '<option value="">Seleccione una Carrera</option>';
            carreras.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera.Codigo_Carrera;
                option.textContent = carrera.Nombre_Carrera || carrera.Codigo_Carrera;
                carreraSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar carreras:', error);
            mostrarError('Error al cargar las carreras. Por favor, recarga la página.');
        }
    }

    // 3. Cargar periodos académicos desde api/periodo_academico
    async function cargarPeriodos() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/periodo_academico', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener los periodos académicos');

            const periodos = await response.json();

            // Limpiar y llenar select de periodos
            periodoSelect.innerHTML = '<option value="">Seleccione un Periodo</option>';
            
            // Ordenar periodos de más reciente a más antiguo
            const periodosOrdenados = periodos.sort((a, b) => {
                const [anoA, periodoA] = a.Periodo_Academico.split('-');
                const [anoB, periodoB] = b.Periodo_Academico.split('-');
                return anoB - anoA || periodoB - periodoA;
            });

            periodosOrdenados.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.Periodo_Academico;
                option.textContent = periodo.Periodo_Academico;
                periodoSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar periodos académicos:', error);
            mostrarError('Error al cargar los periodos académicos.');
        }
    }

    // Función para mostrar errores al usuario
    function mostrarError(mensaje, tipo = 'error') {
        // Limpiar mensajes anteriores
        document.querySelectorAll('.mensaje-reinscripcion').forEach(msg => msg.remove());

        const mensajeElement = document.createElement('div');
        mensajeElement.className = `mensaje-reinscripcion ${tipo}`;
        mensajeElement.textContent = mensaje;
        
        // Estilos según el tipo de mensaje
        if (tipo === 'error') {
            mensajeElement.style.color = '#dc3545';
        } else {
            mensajeElement.style.color = '#28a745';
        }
        
        mensajeElement.style.marginTop = '10px';
        mensajeElement.style.fontSize = '0.9rem';
        mensajeElement.style.padding = '10px';
        mensajeElement.style.borderRadius = '4px';
        
        // Insertar antes del botón de enviar
        enviarBtn.parentNode.insertBefore(mensajeElement, enviarBtn);
    }

    // Función para mostrar éxito
    function mostrarExito(mensaje) {
        mostrarError(mensaje, 'success');
    }

    // Evento para el botón Enviar Reinscripción
    enviarBtn.addEventListener('click', async function() {
        const cedula = document.getElementById('cedula').value;
        const carrera = carreraSelect.value;
        const periodo = periodoSelect.value;
        const nivel = nivelPensumSelect.value;
        const turno = turnoSelect.value;

        // Validar campos requeridos
        if (!cedula || !carrera || !periodo || !nivel || !turno) {
            mostrarError('Por favor complete todos los campos requeridos');
            return;
        }

        // Mostrar loading
        enviarBtn.disabled = true;
        enviarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Datos para enviar a la API
            const datosReinscripcion = {
                Cedula_Estudiante: cedula,
                Carrera: carrera,
                Periodo_Academico: periodo,
                Nivel_Pensum: nivel,
                Turno: turno
            };

            const response = await fetch('/api/reinscripciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosReinscripcion)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al procesar la reinscripción');
            }

            const resultado = await response.json();

            // Mostrar mensaje de éxito
            mostrarExito('¡Reinscripción exitosa! ' + (resultado.message || ''));
            
            // Opcional: Limpiar el formulario después de éxito
            // carreraSelect.value = '';
            // periodoSelect.value = '';
            // nivelPensumSelect.value = '';
            // turnoSelect.value = '';

        } catch (error) {
            console.error('Error al procesar reinscripción:', error);
            mostrarError(error.message || 'Error al procesar la reinscripción. Por favor, intente nuevamente.');
        } finally {
            // Restaurar botón
            enviarBtn.disabled = false;
            enviarBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Reinscripción';
        }
    });

    // Inicializar los selects
    function inicializar() {
        cargarCarreras();
        cargarPeriodos();
        cargarNivelesPensum();
    }

    // Iniciar la aplicación
    inicializar();
});