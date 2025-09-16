import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    const tablaHoras = new GenericTable(
        'horas',
        'tabla-horas',
        ['Desde', 'Hasta', 'Dias', 'Turno', 'Carrera', 'Pensum', 'Periodo_Academico', 'Seccion', 'Nivel', 'Asignatura', 'Docente'],
        ['Desde', 'Hasta']
    );

    const getToken = () => localStorage.getItem('token');

    const buscarDesdeInput = document.querySelector('.buscar-hora-desde');
    const buscarHastaInput = document.querySelector('.buscar-hora-hasta');
    const botonBuscar = document.querySelector('.btn-buscar-horas');
    const btnReajustar = document.querySelector('.btn-reajustar-horas');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    const prepararSelect = (selectElement) => {
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        selectElement.selectedIndex = 0;
    };

    const verificarDocente = async (nombreDocente) => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/docentes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error al obtener docentes');
            
            const docentes = await response.json();
            return docentes.some(docente => 
                `${docente.Nombres} ${docente.Apellidos}` === nombreDocente
            );
        } catch (error) {
            console.error('Error verificando docente:', error);
            return false;
        }
    };

    const cargarOpcionesSelects = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Cargar Carreras
            const selectCarreraAgregar = document.getElementById('agregar-carrera');
            const selectCarreraEditar = document.getElementById('editar-carrera');
            prepararSelect(selectCarreraAgregar);
            prepararSelect(selectCarreraEditar);
            
            const resCarreras = await fetch('/api/carreras', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const carreras = await resCarreras.json();
            carreras.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera.Codigo_Carrera;
                option.textContent = carrera.Codigo_Carrera;
                selectCarreraAgregar.appendChild(option.cloneNode(true));
                selectCarreraEditar.appendChild(option);
            });

            // Cargar Pensums
            const selectPensumAgregar = document.getElementById('agregar-pensum');
            const selectPensumEditar = document.getElementById('editar-pensum');
            prepararSelect(selectPensumAgregar);
            prepararSelect(selectPensumEditar);
            
            const resPensums = await fetch('/api/pensum', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const pensums = await resPensums.json();
            pensums.forEach(pensum => {
                const option = document.createElement('option');
                option.value = pensum.Codigo_Pensum;
                option.textContent = pensum.Nombre_Pensum;
                selectPensumAgregar.appendChild(option.cloneNode(true));
                selectPensumEditar.appendChild(option);
            });

            // Cargar Periodos Académicos
            const selectPeriodoAgregar = document.getElementById('agregar-periodo-academico');
            const selectPeriodoEditar = document.getElementById('editar-periodo-academico');
            prepararSelect(selectPeriodoAgregar);
            prepararSelect(selectPeriodoEditar);
            
            const resPeriodos = await fetch('/api/periodo_academico', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const periodos = await resPeriodos.json();
            periodos.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.Periodo_Academico;
                option.textContent = periodo.Periodo_Academico;
                selectPeriodoAgregar.appendChild(option.cloneNode(true));
                selectPeriodoEditar.appendChild(option);
            });

            // Cargar Secciones
            const selectSeccionAgregar = document.getElementById('agregar-seccion');
            const selectSeccionEditar = document.getElementById('editar-seccion');
            prepararSelect(selectSeccionAgregar);
            prepararSelect(selectSeccionEditar);
            
            const resSecciones = await fetch('/api/secciones', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const secciones = await resSecciones.json();
            secciones.forEach(seccion => {
                const option = document.createElement('option');
                option.value = seccion.Codigo_Seccion;
                option.textContent = seccion.Codigo_Seccion;
                selectSeccionAgregar.appendChild(option.cloneNode(true));
                selectSeccionEditar.appendChild(option);
            });

            // Cargar Niveles
            const selectNivelAgregar = document.getElementById('agregar-nivel');
            const selectNivelEditar = document.getElementById('editar-nivel');
            prepararSelect(selectNivelAgregar);
            prepararSelect(selectNivelEditar);
            
            const resNiveles = await fetch('/api/nivel_pensum', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const niveles = await resNiveles.json();
            niveles.forEach(nivel => {
                const option = document.createElement('option');
                option.value = nivel.Nombre_Nivel;
                option.textContent = nivel.Nombre_Nivel;
                selectNivelAgregar.appendChild(option.cloneNode(true));
                selectNivelEditar.appendChild(option);
            });

            // Cargar Asignaturas
            const selectAsignaturaAgregar = document.getElementById('agregar-asignatura');
            const selectAsignaturaEditar = document.getElementById('editar-asignatura');
            prepararSelect(selectAsignaturaAgregar);
            prepararSelect(selectAsignaturaEditar);
            
            const resAsignaturas = await fetch('/api/asignaturas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const asignaturas = await resAsignaturas.json();
            asignaturas.forEach(asignatura => {
                const option = document.createElement('option');
                option.value = asignatura.Codigo_Asignatura;
                option.textContent = asignatura.Codigo_Asignatura;
                selectAsignaturaAgregar.appendChild(option.cloneNode(true));
                selectAsignaturaEditar.appendChild(option);
            });

            // Cargar Turnos (opciones fijas)
            const selectTurnoAgregar = document.getElementById('agregar-turno');
            const selectTurnoEditar = document.getElementById('editar-turno');
            prepararSelect(selectTurnoAgregar);
            prepararSelect(selectTurnoEditar);
            
            ['Mañana', 'Tarde', 'Noche'].forEach(turno => {
                const option = document.createElement('option');
                option.value = turno;
                option.textContent = turno;
                selectTurnoAgregar.appendChild(option.cloneNode(true));
                selectTurnoEditar.appendChild(option);
            });

        } catch (error) {
            console.error('Error cargando opciones:', error);
        }
    };

    const formatTimeForComparison = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-horas tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    const filtrarTabla = () => {
        const horaDesde = formatTimeForComparison(buscarDesdeInput.value);
        const horaHasta = formatTimeForComparison(buscarHastaInput.value);
        const tbody = document.querySelector('#tabla-horas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const desde = formatTimeForComparison(fila.cells[0].textContent);
            const hasta = formatTimeForComparison(fila.cells[1].textContent);
      

            const coincideDesde = horaDesde === '' || desde === horaDesde;
            const coincideHasta = horaHasta === '' || hasta === horaHasta;
            

            if (coincideDesde && coincideHasta) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        tablaHoras.asignarEventosEditarEliminar();
        actualizarPaginacion();
    };

    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-horas tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-horas').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
        
        tablaHoras.asignarEventosEditarEliminar();
    };

    // Actualizar botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-horas');
        const nextButton = document.querySelector('.pagina-siguiente-horas');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-horas');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-horas');
            button.textContent = i;
            button.classList.toggle('activo', i === currentPage);

            button.addEventListener('click', () => {
                currentPage = i;
                displayRows(currentPage);
                updatePaginationButtons();
            });

            pageButtonsContainer.appendChild(button);
        }
    };

    // Actualizar paginación
    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-horas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarDesdeInput.value = '';
        buscarHastaInput.value = '';
        const tbody = document.querySelector('#tabla-horas tbody');
        tbody.innerHTML = '';
        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        tablaHoras.asignarEventosEditarEliminar();
        actualizarPaginacion();
    });

    document.querySelector('.pagina-anterior-horas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-horas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    tablaHoras.onEditar = (desde, datos) => {
        const editarModal = document.getElementById('editarHoraModal');
        const editarForm = document.getElementById('editar-hora-modal-form');

        // Precargar valores
        document.getElementById('editar-hora-desde').value = datos[0];
        document.getElementById('editar-hora-hasta').value = datos[1];
        
        // Obtener y establecer días seleccionados
        const diasSeleccionados = datos[2] ? datos[2].split(',') : [];
        document.querySelectorAll('#editar-hora-modal-form input[name="editar-dias[]"]').forEach(checkbox => {
            checkbox.checked = diasSeleccionados.includes(checkbox.value);
        });

        // Obtener referencias a los selects
        const selectTurno = document.getElementById('editar-turno');
        const selectCarrera = document.getElementById('editar-carrera');
        const selectPensum = document.getElementById('editar-pensum');
        const selectPeriodo = document.getElementById('editar-periodo-academico');
        const selectSeccion = document.getElementById('editar-seccion');
        const selectNivel = document.getElementById('editar-nivel');
        const selectAsignatura = document.getElementById('editar-asignatura');
        const inputDocente = document.getElementById('editar-docente');

        // Establecer valores en los selects
        if (selectTurno) selectTurno.value = datos[3] || '';
        if (selectCarrera) selectCarrera.value = datos[4] || '';
        if (selectPensum) selectPensum.value = datos[5] || '';
        if (selectPeriodo) selectPeriodo.value = datos[6] || '';
        if (selectSeccion) selectSeccion.value = datos[7] || '';
        if (selectNivel) selectNivel.value = datos[8] || '';
        if (selectAsignatura) selectAsignatura.value = datos[9] || '';
        if (inputDocente) inputDocente.value = datos[10] || '';

        editarModal.style.display = 'block';

        editarForm.onsubmit = async (event) => {
            event.preventDefault();
            
            // Obtener días seleccionados
            const diasCheckboxes = Array.from(document.querySelectorAll('#editar-hora-modal-form input[name="editar-dias[]"]:checked'));
            const dias = diasCheckboxes.map(checkbox => checkbox.value).join(',');

            // Verificar docente antes de enviar
            const docente = inputDocente.value;
            if (docente) {
                const docenteValido = await verificarDocente(docente);
                if (!docenteValido) {
                    alert('El docente ingresado no está registrado en la tabla correspondiente');
                    return;
                }
            }

            const nuevosDatos = {
                Desde: document.getElementById('editar-hora-desde').value,
                Hasta: document.getElementById('editar-hora-hasta').value,
                Dias: dias,
                Turno: selectTurno.value,
                Carrera: selectCarrera.value,
                Pensum: selectPensum.value,
                Periodo_Academico: selectPeriodo.value,
                Seccion: selectSeccion.value,
                Nivel: selectNivel.value,
                Asignatura: selectAsignatura.value,
                Docente: docente
            };

            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const responseCheck = await fetch('/api/horas', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!responseCheck.ok) throw new Error('Error al verificar horas existentes');
                
                const horasExistentes = await responseCheck.json();
                const existeDuplicadoExacto = horasExistentes.some(hora => 
                    hora.Desde === nuevosDatos.Desde && 
                    hora.Hasta === nuevosDatos.Hasta &&
                    hora.Dias === nuevosDatos.Dias &&
                    hora.Turno === nuevosDatos.Turno &&
                    hora.Carrera === nuevosDatos.Carrera &&
                    hora.Pensum === nuevosDatos.Pensum &&
                    hora.Periodo_Academico === nuevosDatos.Periodo_Academico &&
                    hora.Seccion === nuevosDatos.Seccion &&
                    hora.Nivel === nuevosDatos.Nivel &&
                    hora.Asignatura === nuevosDatos.Asignatura &&
                    hora.Docente === nuevosDatos.Docente &&
                    hora.Desde !== desde
                );

                if (existeDuplicadoExacto) {
                    alert('Ya existe otro registro con exactamente los mismos datos en todas las columnas');
                    return;
                }

                const response = await fetch(`/api/horas/${encodeURIComponent(desde)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevosDatos),
                });

                if (!response.ok) throw new Error('Error al editar el registro');
                tablaHoras.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
                editarModal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
                alert('Error al editar: ' + error.message);
            }
        };

        const editarClose = document.querySelector('.close');
        if (editarClose) editarClose.addEventListener('click', () => editarModal.style.display = 'none');
        
        const cancelarEditar = document.getElementById('cancelar-editar-hora-modal');
        if (cancelarEditar) cancelarEditar.addEventListener('click', () => editarModal.style.display = 'none');
    };

    tablaHoras.onEliminar = (desde) => {
        const eliminarModal = document.getElementById('eliminarHoraModal');
        eliminarModal.style.display = 'block';

        document.getElementById('btn-aceptar-eliminar-hora').onclick = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/horas/${encodeURIComponent(desde)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el registro');
                eliminarModal.style.display = 'none';
                tablaHoras.cargarDatos().then(() => {
                    clonarFilasOriginales();
                    actualizarPaginacion();
                });
            } catch (error) {
                console.error('Error:', error);
            }
        };

        document.querySelector('.eliminar-close')?.addEventListener('click', () => eliminarModal.style.display = 'none');
        document.getElementById('btn-cancelar-eliminar-hora')?.addEventListener('click', () => eliminarModal.style.display = 'none');
    };

    document.getElementById('btn-agregar-hora').addEventListener('click', () => {
        const agregarModal = document.getElementById('agregarHoraModal');
        if (agregarModal) {
            agregarModal.style.display = 'block';
            document.getElementById('agregar-hora-desde').value = '';
            document.getElementById('agregar-hora-hasta').value = '';
            document.querySelectorAll('#agregar-hora-modal-form input[name="agregar-dias[]"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            document.getElementById('agregar-turno').selectedIndex = 0;
            document.getElementById('agregar-carrera').selectedIndex = 0;
            document.getElementById('agregar-pensum').selectedIndex = 0;
            document.getElementById('agregar-periodo-academico').selectedIndex = 0;
            document.getElementById('agregar-seccion').selectedIndex = 0;
            document.getElementById('agregar-nivel').selectedIndex = 0;
            document.getElementById('agregar-asignatura').selectedIndex = 0;
            document.getElementById('agregar-docente').value = '';
        }
    });

    document.getElementById('agregar-hora-modal-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const horaDesde = document.getElementById('agregar-hora-desde').value;
        const horaHasta = document.getElementById('agregar-hora-hasta').value;
        const diasCheckboxes = Array.from(document.querySelectorAll('#agregar-hora-modal-form input[name="agregar-dias[]"]:checked'));
        const dias = diasCheckboxes.map(checkbox => checkbox.value).join(',');
        const turno = document.getElementById('agregar-turno').value;
        const carrera = document.getElementById('agregar-carrera').value;
        const pensum = document.getElementById('agregar-pensum').value;
        const periodoAcademico = document.getElementById('agregar-periodo-academico').value;
        const seccion = document.getElementById('agregar-seccion').value;
        const nivel = document.getElementById('agregar-nivel').value;
        const asignatura = document.getElementById('agregar-asignatura').value;
        const docente = document.getElementById('agregar-docente').value;

        if (!horaDesde || !horaHasta) {
            alert('Por favor ingrese ambas horas');
            return;
        }

        if (horaDesde >= horaHasta) {
            alert('La hora "Desde" debe ser menor que la hora "Hasta"');
            return;
        }

        if (dias === '') {
            alert('Por favor seleccione al menos un día');
            return;
        }

        if (turno === '' || carrera === '' || pensum === '' || periodoAcademico === '' || 
            seccion === '' || nivel === '' || asignatura === '') {
            alert('Por favor seleccione todas las opciones requeridas');
            return;
        }

        // Verificar docente antes de enviar
        if (docente) {
            const docenteValido = await verificarDocente(docente);
            if (!docenteValido) {
                alert('El docente ingresado no está registrado en la tabla correspondiente');
                return;
            }
        }

        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const responseCheck = await fetch('/api/horas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!responseCheck.ok) throw new Error('Error al obtener las horas existentes');
            
            const horasExistentes = await responseCheck.json();
            const existeDuplicadoExacto = horasExistentes.some(hora => 
                hora.Desde === horaDesde && 
                hora.Hasta === horaHasta &&
                hora.Dias === dias &&
                hora.Turno === turno &&
                hora.Carrera === carrera &&
                hora.Pensum === pensum &&
                hora.Periodo_Academico === periodoAcademico &&
                hora.Seccion === seccion &&
                hora.Nivel === nivel &&
                hora.Asignatura === asignatura &&
                hora.Docente === docente
            );

            if (existeDuplicadoExacto) {
                alert('Ya existe un registro con exactamente los mismos datos en todas las columnas');
                return;
            }

            const createResponse = await fetch('/api/horas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    Desde: horaDesde, 
                    Hasta: horaHasta,
                    Dias: dias,
                    Turno: turno,
                    Carrera: carrera,
                    Pensum: pensum,
                    Periodo_Academico: periodoAcademico,
                    Seccion: seccion,
                    Nivel: nivel,
                    Asignatura: asignatura,
                    Docente: docente
                }),
            });

            if (!createResponse.ok) throw new Error('Error al agregar la hora');
            
            tablaHoras.cargarDatos().then(() => {
                clonarFilasOriginales();
                actualizarPaginacion();
            });

            document.getElementById('agregarHoraModal').style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar la hora: ' + error.message);
        }
    });

    document.querySelector('.agregar-close')?.addEventListener('click', () => {
        document.getElementById('agregarHoraModal').style.display = 'none';
    });

    document.getElementById('cancelar-agregar-hora-modal')?.addEventListener('click', () => {
        document.getElementById('agregarHoraModal').style.display = 'none';
    });

    cargarOpcionesSelects().then(() => {
        tablaHoras.cargarDatos().then(() => {
            clonarFilasOriginales();
            actualizarPaginacion();
        });
    });
});