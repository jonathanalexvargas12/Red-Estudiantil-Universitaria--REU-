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
        document.getElementById('direccion').value = userData.Direccion || 'No disponible';
        document.getElementById('telefono1').value = userData.Telefono_1 || 'No disponible';
        document.getElementById('telefono2').value = userData.Telefono_2 || 'No disponible';
        document.getElementById('correo').value = userData.Correo || 'No disponible';
        document.getElementById('usuario').value = userId || 'No disponible';

    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        alert(error.message);
        
        if (error.message.includes('iniciar sesión')) {
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        }
    }
});

// Logica para cargar los datos en sus respectivos selects
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const carreraSelect = document.getElementById('carrera');
    const periodoSelect = document.getElementById('periodo');
    const nivelPensumSelect = document.getElementById('nivel-pensum');
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
                option.value = nivel.ID_Nivel; // Ajusta según tu estructura de datos
                option.textContent = nivel.Nombre_Nivel;
                nivelPensumSelect.appendChild(option);
            });

            // Habilitar select después de cargar
            nivelPensumSelect.disabled = false;

        } catch (error) {
            console.error('Error al cargar niveles del pensum:', error);
            mostrarError('Error al cargar los niveles del pensum.');
            nivelPensumSelect.disabled = false; // Habilitar incluso si hay error
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
            carreraSelect.innerHTML = '<option value="" disabled selected>Seleccione una Carrera</option>';
            carreras.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera.Codigo_Carrera || carrera.id;
                option.textContent = carrera.Nombre_Carrera || carrera.nombre || carrera.Codigo_Carrera;
                carreraSelect.appendChild(option);
            });

            // Habilitar select después de cargar
            carreraSelect.disabled = false;

        } catch (error) {
            console.error('Error al cargar carreras:', error);
            mostrarError('Error al cargar las carreras. Por favor, recarga la página.');
            carreraSelect.disabled = false; // Habilitar incluso si hay error
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
            periodoSelect.innerHTML = '<option value="" disabled selected>Seleccione un Periodo</option>';
            
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

            // Habilitar select después de cargar
            periodoSelect.disabled = false;

        } catch (error) {
            console.error('Error al cargar periodos académicos:', error);
            mostrarError('Error al cargar los periodos académicos.');
            periodoSelect.disabled = false; // Habilitar incluso si hay error
        }
    }

    // Función para mostrar errores al usuario
    function mostrarError(mensaje) {
        document.querySelectorAll('.error-mensaje-reinscripcion').forEach(msg => msg.remove());

        const errorElement = document.createElement('div');
        errorElement.className = 'error-mensaje-reinscripcion';
        errorElement.textContent = mensaje;
        errorElement.style.color = '#dc3545';
        errorElement.style.marginTop = '10px';
        errorElement.style.fontSize = '0.9rem';
        
        document.querySelector('.contenedor-mis-datos').appendChild(errorElement);
    }

    // Evento para el botón Enviar Reinscripción
    enviarBtn.addEventListener('click', function() {
        const carrera = carreraSelect.value;
        const periodo = periodoSelect.value;
        const nivel = nivelPensumSelect.value;

        if (!carrera || !periodo || !nivel) {
            mostrarError('Por favor seleccione todos los campos requeridos');
            return;
        }

        // Obtener los textos seleccionados para mostrar
        const carreraTexto = carreraSelect.options[carreraSelect.selectedIndex].text;
        const periodoTexto = periodoSelect.options[periodoSelect.selectedIndex].text;
        const nivelTexto = nivelPensumSelect.options[nivelPensumSelect.selectedIndex].text;

        // Procesar la reinscripción
        procesarReinscripcion(carrera, periodo, nivel, carreraTexto, periodoTexto, nivelTexto);
    });

    // Función para procesar la reinscripción
    async function procesarReinscripcion(carreraId, periodoId, nivelId, carreraNombre, periodoNombre, nivelNombre) {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/reinscripcion', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    carrera_id: carreraId,
                    periodo_academico: periodoId,
                    nivel_pensum: nivelId
                })
            });

            if (!response.ok) throw new Error('Error al procesar la reinscripción');

            const resultado = await response.json();

            // Mostrar mensaje de éxito
            const mensajeExito = document.createElement('div');
            mensajeExito.className = 'exito-mensaje-reinscripcion';
            mensajeExito.innerHTML = `
                <p>Reinscripción exitosa:</p>
                <ul>
                    <li><strong>Carrera:</strong> ${carreraNombre}</li>
                    <li><strong>Periodo:</strong> ${periodoNombre}</li>
                    <li><strong>Nivel:</strong> ${nivelNombre}</li>
                </ul>
                <p>${resultado.mensaje || 'Su reinscripción ha sido registrada correctamente.'}</p>
            `;
            mensajeExito.style.color = '#28a745';
            mensajeExito.style.marginTop = '10px';
            mensajeExito.style.fontSize = '0.9rem';
            mensajeExito.style.padding = '10px';
            mensajeExito.style.borderLeft = '3px solid #28a745';
            mensajeExito.style.backgroundColor = '#f8f9fa';
            
            document.querySelectorAll('.error-mensaje-reinscripcion, .exito-mensaje-reinscripcion').forEach(msg => msg.remove());
            document.querySelector('.contenedor-mis-datos').appendChild(mensajeExito);

        } catch (error) {
            console.error('Error al procesar reinscripción:', error);
            mostrarError(error.message || 'Error al procesar la reinscripción. Por favor, intente nuevamente.');
        }
    }

    // Inicializar los selects
    function inicializar() {
        // Deshabilitar selects inicialmente mientras se cargan los datos
        carreraSelect.disabled = true;
        periodoSelect.disabled = true;
        nivelPensumSelect.disabled = true;
        
        // Cargar datos iniciales
        cargarCarreras();
        cargarPeriodos();
        cargarNivelesPensum();
    }

    // Iniciar la aplicación
    inicializar();
});