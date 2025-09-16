document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const carreraSelect = document.getElementById('carrera');
    const pensumSelect = document.getElementById('pensum');
    const periodoSelect = document.getElementById('periodo');
    const verReporteBtn = document.querySelector('.contenedor-consulta-oferta__boton');

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
                option.value = carrera.Codigo_Carrera || carrera.id; // Ajusta según tu estructura real
                option.textContent = carrera.Nombre_Carrera || carrera.nombre || carrera.Codigo_Carrera;
                carreraSelect.appendChild(option);
            });

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
            pensumSelect.disabled = false;

            pensums.forEach(pensum => {
                const option = document.createElement('option');
                option.value = pensum.Codigo_Pensum || pensum.id; // Ajusta según tu estructura real
                option.textContent = pensum.Nombre_Pensum || pensum.nombre || pensum.Codigo_Pensum;
                pensumSelect.appendChild(option);
            });

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
            
            // Ordenar periodos de más reciente a más antiguo (asumiendo formato YYYY-X)
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
    function mostrarError(mensaje) {
        // Eliminar mensajes de error anteriores
        const erroresAnteriores = document.querySelectorAll('.error-mensaje-consulta');
        erroresAnteriores.forEach(error => error.remove());

        const errorElement = document.createElement('div');
        errorElement.className = 'error-mensaje-consulta';
        errorElement.textContent = mensaje;
        errorElement.style.color = '#dc3545';
        errorElement.style.marginTop = '10px';
        errorElement.style.fontSize = '0.9rem';
        
        document.querySelector('.contenedor-consulta-oferta').appendChild(errorElement);
    }

    // Evento para el botón Ver Reporte
    verReporteBtn.addEventListener('click', function() {
        const carrera = carreraSelect.value;
        const pensum = pensumSelect.value;
        const periodo = periodoSelect.value;

        if (!carrera || !pensum || !periodo) {
            mostrarError('Por favor seleccione todos los campos requeridos');
            return;
        }

        // Obtener los textos seleccionados para mostrar en el reporte
        const carreraTexto = carreraSelect.options[carreraSelect.selectedIndex].text;
        const pensumTexto = pensumSelect.options[pensumSelect.selectedIndex].text;
        const periodoTexto = periodoSelect.options[periodoSelect.selectedIndex].text;

        // Aquí puedes implementar la lógica para generar el reporte
        generarReporte(carrera, pensum, periodo, carreraTexto, pensumTexto, periodoTexto);
    });

    // Función para generar el reporte (implementación básica)
    function generarReporte(carreraId, pensumId, periodoId, carreraNombre, pensumNombre, periodoNombre) {
        console.log('Generando reporte con:', {
            carrera: { id: carreraId, nombre: carreraNombre },
            pensum: { id: pensumId, nombre: pensumNombre },
            periodo: periodoId
        });

        // Mostrar mensaje de éxito
        const mensajeExito = document.createElement('div');
        mensajeExito.className = 'exito-mensaje-consulta';
        mensajeExito.textContent = `Reporte generado para: ${carreraNombre} - ${pensumNombre} - ${periodoNombre}`;
        mensajeExito.style.color = '#28a745';
        mensajeExito.style.marginTop = '10px';
        mensajeExito.style.fontSize = '0.9rem';
        
        // Eliminar mensajes anteriores
        document.querySelectorAll('.error-mensaje-consulta, .exito-mensaje-consulta').forEach(msg => msg.remove());
        document.querySelector('.contenedor-consulta-oferta').appendChild(mensajeExito);

        // Aquí deberías hacer la llamada a tu API para generar el reporte
        // Ejemplo:
        // fetch(`/api/generar-reporte?carrera=${carreraId}&pensum=${pensumId}&periodo=${periodoId}`, {
        //     headers: { 'Authorization': `Bearer ${getToken()}` }
        // })
        // .then(response => response.blob())
        // .then(blob => {
        //     // Descargar el reporte
        //     const url = window.URL.createObjectURL(blob);
        //     const a = document.createElement('a');
        //     a.href = url;
        //     a.download = `reporte-${carreraNombre}-${pensumNombre}-${periodoNombre}.pdf`;
        //     document.body.appendChild(a);
        //     a.click();
        //     window.URL.revokeObjectURL(url);
        // });
    }

    // Inicializar los selects
    function inicializar() {
        // Cargar todos los datos iniciales
        cargarCarreras();
        cargarPensums();
        cargarPeriodos();
    }

    // Iniciar la aplicación
    inicializar();
});