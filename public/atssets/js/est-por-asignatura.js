document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const carreraSelect = document.getElementById('carrera-estudiantes-asignatura');
    const pensumSelect = document.getElementById('pensum-estudiantes-asignatura');
    const periodoSelect = document.getElementById('periodo-estudiantes-asignatura');
    const seccionSelect = document.getElementById('seccion-estudiantes-asignatura');
    const asignaturaSelect = document.getElementById('asignatura-estudiantes-asignatura');
    const ordenSelect = document.getElementById('ordenar-por-estudiantes-asignatura');
    const reporteBtn = document.querySelector('.contenedor-estudiantes-asignatura__boton');

    // Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // 1. Cargar carreras desde la tabla "carreras", columna "Codigo_Carrera"
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
            resetSelect(carreraSelect, 'Seleccione una Carrera');
            
            carreras.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera.Codigo_Carrera;
                option.textContent = `${carrera.Codigo_Carrera} - ${carrera.Nombre || carrera.Descripcion || 'Carrera'}`;
                carreraSelect.appendChild(option);
            });

            // Habilitar select de carreras
            carreraSelect.disabled = false;

            // Cargar pensums si hay una carrera seleccionada por defecto
            if (carreraSelect.value) {
                cargarPensums(carreraSelect.value);
            }

        } catch (error) {
            console.error('Error al cargar carreras:', error);
            mostrarError('Error al cargar las carreras. Por favor, recarga la página.');
            resetSelect(carreraSelect, 'Error al cargar carreras');
        }
    }

    // 2. Cargar pensums desde la tabla "pensum", columna "Codigo_Pensum"
    async function cargarPensums(codigoCarrera) {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            showLoading(pensumSelect, 'Cargando pensums...');
            
            const response = await fetch(`/api/pensum?carrera=${codigoCarrera}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener los pensums');

            const pensums = await response.json();

            // Limpiar y llenar select de pensums
            resetSelect(pensumSelect, 'Seleccione un Pensum');
            
            if (pensums.length === 0) {
                pensumSelect.innerHTML = '<option value="" disabled selected>No hay pensums para esta carrera</option>';
            } else {
                pensums.forEach(pensum => {
                    const option = document.createElement('option');
                    option.value = pensum.Codigo_Pensum;
                    option.textContent = `${pensum.Codigo_Pensum} - ${pensum.Nombre || pensum.Descripcion || 'Pensum'}`;
                    pensumSelect.appendChild(option);
                });
            }

            // Habilitar select de pensums
            pensumSelect.disabled = false;
            
            // Resetear select de asignaturas
            resetSelect(asignaturaSelect, 'Seleccione una Asignatura');

        } catch (error) {
            console.error('Error al cargar pensums:', error);
            mostrarError('Error al cargar los pensums para la carrera seleccionada.');
            resetSelect(pensumSelect, 'Error al cargar pensums');
        }
    }

    // 3. Cargar periodos desde la tabla "periodo_academico", columna "Periodo_Academico"
    async function cargarPeriodos() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            showLoading(periodoSelect, 'Cargando periodos...');
            
            const response = await fetch('/api/periodo_academico', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener los periodos académicos');

            const periodos = await response.json();

            // Limpiar y llenar select de periodos
            resetSelect(periodoSelect, 'Seleccione un Periodo');
            
            if (periodos.length === 0) {
                periodoSelect.innerHTML = '<option value="" disabled selected>No hay periodos disponibles</option>';
            } else {
                // Ordenar periodos de más reciente a más antiguo (formato YYYY-X)
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
            }

            // Habilitar select de periodos
            periodoSelect.disabled = false;

        } catch (error) {
            console.error('Error al cargar periodos académicos:', error);
            mostrarError('Error al cargar los periodos académicos.');
            resetSelect(periodoSelect, 'Error al cargar periodos');
        }
    }

    // 4. Cargar secciones desde la tabla "secciones", columna "Codigo_Seccion"
    async function cargarSecciones() {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            showLoading(seccionSelect, 'Cargando secciones...');
            
            const response = await fetch('/api/secciones', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener las secciones');

            const secciones = await response.json();

            // Limpiar y llenar select de secciones
            resetSelect(seccionSelect, 'Seleccione una Sección');
            
            if (secciones.length === 0) {
                seccionSelect.innerHTML = '<option value="" disabled selected>No hay secciones disponibles</option>';
            } else {
                secciones.forEach(seccion => {
                    const option = document.createElement('option');
                    option.value = seccion.Codigo_Seccion;
                    option.textContent = `${seccion.Codigo_Seccion} - ${seccion.Nombre || 'Sección'}`;
                    seccionSelect.appendChild(option);
                });
            }

            // Habilitar select de secciones
            seccionSelect.disabled = false;

        } catch (error) {
            console.error('Error al cargar secciones:', error);
            mostrarError('Error al cargar las secciones disponibles.');
            resetSelect(seccionSelect, 'Error al cargar secciones');
        }
    }

    // 5. Cargar asignaturas desde la tabla "asignaturas", columna "Codigo_Asignatura"
    async function cargarAsignaturas() {
        const carrera = carreraSelect.value;
        const pensum = pensumSelect.value;
        
        if (!carrera || !pensum) {
            resetSelect(asignaturaSelect, 'Seleccione una Asignatura');
            return;
        }

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            showLoading(asignaturaSelect, 'Cargando asignaturas...');
            
            const response = await fetch(`/api/asignaturas?carrera=${carrera}&pensum=${pensum}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener las asignaturas');

            const asignaturas = await response.json();

            // Limpiar y llenar select de asignaturas
            resetSelect(asignaturaSelect, 'Seleccione una Asignatura');
            
            if (asignaturas.length === 0) {
                asignaturaSelect.innerHTML = '<option value="" disabled selected>No hay asignaturas para esta combinación</option>';
            } else {
                asignaturas.forEach(asignatura => {
                    const option = document.createElement('option');
                    option.value = asignatura.Codigo_Asignatura;
                    option.textContent = `${asignatura.Codigo_Asignatura} - ${asignatura.Nombre_Asignatura || asignatura.Nombre || 'Asignatura'}`;
                    asignaturaSelect.appendChild(option);
                });
            }

            // Habilitar select de asignaturas
            asignaturaSelect.disabled = false;

        } catch (error) {
            console.error('Error al cargar asignaturas:', error);
            mostrarError('Error al cargar las asignaturas disponibles.');
            resetSelect(asignaturaSelect, 'Error al cargar asignaturas');
        }
    }

    // Función para mostrar estado de carga
    function showLoading(selectElement, message) {
        selectElement.innerHTML = `<option value="" disabled selected>${message}</option>`;
        selectElement.disabled = true;
    }

    // Función para resetear un select
    function resetSelect(selectElement, placeholderText) {
        selectElement.innerHTML = `<option value="" disabled selected>${placeholderText}</option>`;
        selectElement.disabled = true;
    }

    // Función para mostrar errores al usuario
    function mostrarError(mensaje) {
        // Eliminar mensajes anteriores
        const erroresAnteriores = document.querySelectorAll('.error-mensaje-estudiantes');
        erroresAnteriores.forEach(error => error.remove());

        const errorElement = document.createElement('div');
        errorElement.className = 'error-mensaje-estudiantes';
        errorElement.textContent = mensaje;
        errorElement.style.color = '#dc3545';
        errorElement.style.marginTop = '10px';
        errorElement.style.fontSize = '0.9rem';
        
        document.querySelector('.contenedor-estudiantes-asignatura').appendChild(errorElement);
    }

    // Eventos
    carreraSelect.addEventListener('change', function() {
        if (this.value) {
            cargarPensums(this.value);
        } else {
            resetSelect(pensumSelect, 'Seleccione un Pensum');
            resetSelect(asignaturaSelect, 'Seleccione una Asignatura');
        }
    });

    pensumSelect.addEventListener('change', function() {
        if (this.value) {
            cargarAsignaturas();
        } else {
            resetSelect(asignaturaSelect, 'Seleccione una Asignatura');
        }
    });

    reporteBtn.addEventListener('click', function() {
        const carrera = carreraSelect.value;
        const pensum = pensumSelect.value;
        const periodo = periodoSelect.value;
        const seccion = seccionSelect.value;
        const asignatura = asignaturaSelect.value;
        const orden = ordenSelect.value;
        const direccion = document.querySelector('input[name="orden"]:checked').value;

        if (!carrera || !pensum || !periodo || !seccion || !asignatura) {
            mostrarError('Por favor seleccione todos los campos requeridos');
            return;
        }

        generarReporteEstudiantes(carrera, pensum, periodo, seccion, asignatura, orden, direccion);
    });

    // Función para generar el reporte
    function generarReporteEstudiantes(carreraId, pensumId, periodoId, seccionId, asignaturaId, orden, direccion) {
        console.log('Generando reporte con:', {
            carrera: carreraId,
            pensum: pensumId,
            periodo: periodoId,
            seccion: seccionId,
            asignatura: asignaturaId,
            orden,
            direccion
        });

        // Mostrar mensaje de éxito
        const mensajeExito = document.createElement('div');
        mensajeExito.className = 'exito-mensaje-estudiantes';
        mensajeExito.innerHTML = `
            <p>Reporte generado para:</p>
            <ul>
                <li><strong>Carrera:</strong> ${carreraSelect.options[carreraSelect.selectedIndex].text}</li>
                <li><strong>Pensum:</strong> ${pensumSelect.options[pensumSelect.selectedIndex].text}</li>
                <li><strong>Asignatura:</strong> ${asignaturaSelect.options[asignaturaSelect.selectedIndex].text}</li>
                <li><strong>Sección:</strong> ${seccionSelect.options[seccionSelect.selectedIndex].text}</li>
                <li><strong>Periodo:</strong> ${periodoSelect.options[periodoSelect.selectedIndex].text}</li>
                <li><strong>Ordenado por:</strong> ${orden} (${direccion})</li>
            </ul>
        `;
        mensajeExito.style.color = '#28a745';
        mensajeExito.style.marginTop = '10px';
        mensajeExito.style.fontSize = '0.9rem';
        mensajeExito.style.padding = '10px';
        mensajeExito.style.borderLeft = '3px solid #28a745';
        mensajeExito.style.backgroundColor = '#f8f9fa';
        
        // Eliminar mensajes anteriores
        document.querySelectorAll('.error-mensaje-estudiantes, .exito-mensaje-estudiantes').forEach(msg => msg.remove());
        document.querySelector('.contenedor-estudiantes-asignatura').appendChild(mensajeExito);
    }

    // Inicializar la aplicación
    function inicializar() {
        // Cargar todos los datos iniciales
        cargarCarreras();
        cargarPeriodos();
        cargarSecciones();
        
        // El select de orden ya viene con opciones en el HTML
        ordenSelect.disabled = false;
    }

    // Iniciar la aplicación
    inicializar();
});