document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const carreraSelect = document.getElementById('carrera-horario');
    const pensumSelect = document.getElementById('pensum-horario');
    const periodoSelect = document.getElementById('periodo-horario');
    const seccionSelect = document.getElementById('seccion-horario');
    const nivelPensumSelect = document.getElementById('nivel-pensum-horario');
    const verReporteBtn = document.querySelector('.contenedor-imprimir-horario__boton');

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // 1. Cargar todas las carreras desde api/carreras
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

            // Habilitar select de carreras
            carreraSelect.disabled = false;

        } catch (error) {
            console.error('Error al cargar carreras:', error);
            mostrarError('Error al cargar las carreras. Por favor, recarga la página.');
        }
    }

    // 2. Cargar todos los pensums desde api/pensum (sin filtro por carrera)
    async function cargarPensums() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/pensum', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener los pensums');

            const pensums = await response.json();

            // Limpiar y llenar select de pensums
            pensumSelect.innerHTML = '<option value="" disabled selected>Seleccione un Pensum</option>';
            
            pensums.forEach(pensum => {
                const option = document.createElement('option');
                option.value = pensum.Codigo_Pensum || pensum.id;
                option.textContent = pensum.Nombre_Pensum || pensum.nombre || pensum.Codigo_Pensum;
                pensumSelect.appendChild(option);
            });

            // Habilitar select de pensums
            pensumSelect.disabled = false;

        } catch (error) {
            console.error('Error al cargar pensums:', error);
            mostrarError('Error al cargar los pensums disponibles.');
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

            // Habilitar select de periodos
            periodoSelect.disabled = false;

        } catch (error) {
            console.error('Error al cargar periodos académicos:', error);
            mostrarError('Error al cargar los periodos académicos.');
        }
    }

    // 4. Cargar secciones desde api/secciones
    async function cargarSecciones() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/secciones', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener las secciones');

            const secciones = await response.json();

            // Limpiar y llenar select de secciones
            seccionSelect.innerHTML = '<option value="" disabled selected>Seleccione una Sección</option>';
            seccionSelect.disabled = false;

            secciones.forEach(seccion => {
                const option = document.createElement('option');
                option.value = seccion.Codigo_Seccion || seccion.id;
                option.textContent = seccion.Nombre_Seccion || seccion.nombre || seccion.Codigo_Seccion;
                seccionSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar secciones:', error);
            mostrarError('Error al cargar las secciones disponibles.');
        }
    }

    // 5. Cargar niveles de pensum desde api/nivel_pensum
    async function cargarNivelesPensum() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/nivel_pensum', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener los niveles de pensum');

            const niveles = await response.json();

            // Limpiar y llenar select de niveles
            nivelPensumSelect.innerHTML = '<option value="" disabled selected>Seleccione un Nivel</option>';
            nivelPensumSelect.disabled = false;

            niveles.forEach(nivel => {
                const option = document.createElement('option');
                option.value = nivel.Codigo_Nivel || nivel.id;
                option.textContent = nivel.Nombre_Nivel || nivel.nombre || nivel.Codigo_Nivel;
                nivelPensumSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar niveles de pensum:', error);
            mostrarError('Error al cargar los niveles de pensum.');
        }
    }

    // Función para mostrar errores al usuario
    function mostrarError(mensaje) {
        // Eliminar mensajes anteriores
        document.querySelectorAll('.error-mensaje-horario').forEach(msg => msg.remove());

        const errorElement = document.createElement('div');
        errorElement.className = 'error-mensaje-horario';
        errorElement.textContent = mensaje;
        errorElement.style.color = '#dc3545';
        errorElement.style.marginTop = '10px';
        errorElement.style.fontSize = '0.9rem';
        
        document.querySelector('.contenedor-imprimir-horario').appendChild(errorElement);
    }

    // Evento para el botón Ver Reporte
    verReporteBtn.addEventListener('click', function() {
        const carrera = carreraSelect.value;
        const pensum = pensumSelect.value;
        const periodo = periodoSelect.value;
        const seccion = seccionSelect.value;
        const nivelPensum = nivelPensumSelect.value;

        if (!carrera || !pensum || !periodo || !seccion || !nivelPensum) {
            mostrarError('Por favor seleccione todos los campos requeridos');
            return;
        }

        // Obtener los textos seleccionados para mostrar
        const carreraTexto = carreraSelect.options[carreraSelect.selectedIndex].text;
        const pensumTexto = pensumSelect.options[pensumSelect.selectedIndex].text;
        const periodoTexto = periodoSelect.options[periodoSelect.selectedIndex].text;
        const seccionTexto = seccionSelect.options[seccionSelect.selectedIndex].text;
        const nivelPensumTexto = nivelPensumSelect.options[nivelPensumSelect.selectedIndex].text;

        // Generar el horario
        generarHorario(carrera, pensum, periodo, seccion, nivelPensum, 
                      carreraTexto, pensumTexto, periodoTexto, seccionTexto, nivelPensumTexto);
    });

    // Función para generar el horario
    function generarHorario(carreraId, pensumId, periodoId, seccionId, nivelId, 
                           carreraNombre, pensumNombre, periodoNombre, seccionNombre, nivelNombre) {
        console.log('Generando horario con:', {
            carrera: { id: carreraId, nombre: carreraNombre },
            pensum: { id: pensumId, nombre: pensumNombre },
            periodo: periodoId,
            seccion: { id: seccionId, nombre: seccionNombre },
            nivel: { id: nivelId, nombre: nivelNombre }
        });

        // Mostrar mensaje de éxito
        const mensajeExito = document.createElement('div');
        mensajeExito.className = 'exito-mensaje-horario';
        mensajeExito.innerHTML = `
            <p>Horario generado para:</p>
            <ul>
                <li><strong>Carrera:</strong> ${carreraNombre}</li>
                <li><strong>Pensum:</strong> ${pensumNombre}</li>
                <li><strong>Periodo:</strong> ${periodoNombre}</li>
                <li><strong>Sección:</strong> ${seccionNombre}</li>
                <li><strong>Nivel:</strong> ${nivelNombre}</li>
            </ul>
        `;
        mensajeExito.style.color = '#28a745';
        mensajeExito.style.marginTop = '10px';
        mensajeExito.style.fontSize = '0.9rem';
        mensajeExito.style.padding = '10px';
        mensajeExito.style.borderLeft = '3px solid #28a745';
        mensajeExito.style.backgroundColor = '#f8f9fa';
        
        // Eliminar mensajes anteriores
        document.querySelectorAll('.error-mensaje-horario, .exito-mensaje-horario').forEach(msg => msg.remove());
        document.querySelector('.contenedor-imprimir-horario').appendChild(mensajeExito);

        // Aquí puedes implementar la lógica para descargar/imprimir el horario
    }

    // Inicializar los selects
    function inicializar() {
        // Deshabilitar selects dependientes inicialmente
        seccionSelect.disabled = true;
        nivelPensumSelect.disabled = true;
        
        // Cargar datos iniciales (todos habilitados excepto los dependientes)
        cargarCarreras();
        cargarPensums(); // Ahora se carga independientemente
        cargarPeriodos();
        cargarSecciones();
        cargarNivelesPensum();
    }

    // Iniciar la aplicación
    inicializar();
});