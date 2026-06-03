import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

// Para que se desplieguen los filtros de busqueda

const btnFiltrarOfertas = document.getElementById('btn-filtrar-ofertas');
const filtrosBusquedaOfertas = document.getElementById('filtros-busqueda-ofertas');

btnFiltrarOfertas.addEventListener('click', () => {
    filtrosBusquedaOfertas.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración inicial de la tabla
    const tablaDocenteAsignatura = new GenericTable(
        'docente_asignatura',
        'tabla-ofertas',
        ['ID', 'Docente_Cedula', 'Docente_Nombre', 'Asignatura', 'Num_Alumnos', 'Carrera', 'Pensum', 'Trayecto', 'Sem/Trim', 'Seccion', 'Clases_Semana', 'Estado', 'Periodo_Academico'],
        ['Docente_Cedula', 'Docente_Nombre', 'Asignatura', 'Num_Alumnos', 'Carrera', 'Pensum', 'Trayecto', 'Sem/Trim', 'Seccion', 'Clases_Semana', 'Estado', 'Periodo_Academico']
    );

    // 2. Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // 3. Variables para paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-ofertas');
    const estatusSelect = document.querySelector('.select-estado-ofertas');
    const periodoSelect = document.querySelector('.select-periodo-ofertas');
    const carreraSelect = document.querySelector('.select-carrera-ofertas');
    const botonBuscar = document.querySelector('.btn-buscar-ofertas');
    const btnReajustar = document.querySelector('.btn-reajustar-ofertas');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // 4. Función para aplicar estilos de estatus
    const aplicarEstilosEstatus = (filas) => {
        const elementos = filas || document.querySelectorAll('#tabla-ofertas tbody tr');
        
        elementos.forEach(row => {
            const estatusCell = row.cells[10]; // Índice del estado en la tabla
            if (estatusCell) {
                const estadoReal = row.getAttribute('data-estado') || 
                                 estatusCell.textContent.replace(/<[^>]*>/g, '').trim().toLowerCase();
                
                let claseEstatus = '';
                let textoEstatus = '';
                
                switch(estadoReal) {
                    case 'correcta':
                        claseEstatus = 'correcta';
                        textoEstatus = 'Cargada Correctamente';
                        break;
                    case 'incorrecta':
                        claseEstatus = 'incorrecta';
                        textoEstatus = 'Cargada Incorrectamente';
                        break;
                    default:
                        claseEstatus = '';
                        textoEstatus = estadoReal;
                }
                
                row.setAttribute('data-estado', estadoReal);
                estatusCell.innerHTML = `<span class="circulo-estatus ${claseEstatus}"></span> ${textoEstatus}`;
                estatusCell.className = `estatus-oferta ${claseEstatus}`;
            }
        });
    };

    // 5. Función para clonar filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-ofertas tbody tr');
        filasOriginales = Array.from(filas).map(fila => {
            const clone = fila.cloneNode(true);
            const estadoReal = fila.getAttribute('data-estado') || 
                             fila.cells[10].textContent.replace(/<[^>]*>/g, '').trim().toLowerCase();
            clone.setAttribute('data-estado', estadoReal);
            return clone;
        });
    };

    // 6. Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estatusSeleccionado = estatusSelect.value.toLowerCase();
        const periodoSeleccionado = periodoSelect.value.toLowerCase();
        const carreraSeleccionada = carreraSelect.value.toLowerCase();
        const tbody = document.querySelector('#tabla-ofertas tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(filaOriginal => {
            const docenteNombre = filaOriginal.cells[1].textContent.toLowerCase();
            const asignatura = filaOriginal.cells[2].textContent.toLowerCase();
            const carrera = filaOriginal.cells[4].textContent.toLowerCase();
            const periodo = filaOriginal.cells[11].textContent.toLowerCase();
            const estadoReal = filaOriginal.getAttribute('data-estado').toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                docenteNombre.includes(textoBusqueda) || 
                asignatura.includes(textoBusqueda) ||
                carrera.includes(textoBusqueda) ||
                periodo.includes(textoBusqueda);
            
            const coincideEstatus = estatusSeleccionado === '' || 
            estadoReal === estatusSeleccionado

            
            const coincidePeriodo = periodoSeleccionado === '' || 
                periodo.includes(periodoSeleccionado);
            
            const coincideCarrera = carreraSeleccionada === '' || 
                carrera.includes(carreraSeleccionada);

            if (coincideBusqueda && coincideEstatus && coincidePeriodo && coincideCarrera) {
                const nuevaFila = filaOriginal.cloneNode(true);
                tbody.appendChild(nuevaFila);
            }
        });

        aplicarEstilosEstatus(tbody.querySelectorAll('tr'));
        actualizarPaginacion();
        tablaDocenteAsignatura.asignarEventosEditarEliminar();
    };

    // 7. Funciones de paginación
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-ofertas tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-ofertas').textContent =
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-ofertas',
            paginaActual: currentPage,
            totalPaginas: totalPages,
            alCambiarPagina: (pagina) => {
                currentPage = pagina;
                displayRows(currentPage);
                updatePaginationButtons();
            }
        });
    };

    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-ofertas tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // 8. Eventos de búsqueda y paginación
    botonBuscar.addEventListener('click', filtrarTabla);
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        estatusSelect.selectedIndex = 0;
        periodoSelect.selectedIndex = 0;
        carreraSelect.selectedIndex = 0;
        filtrarTabla();
    });

    document.querySelector('.pagina-anterior-ofertas').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-ofertas').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // 9. Modificar el método actualizarTabla en GenericTable
    const originalActualizarTabla = tablaDocenteAsignatura.actualizarTabla.bind(tablaDocenteAsignatura);
    tablaDocenteAsignatura.actualizarTabla = function(datos) {
        originalActualizarTabla(datos);
        
        const filas = document.querySelectorAll(`#${this.tableId} tbody tr`);
        datos.forEach((item, index) => {
            if (filas[index]) {
                filas[index].setAttribute('data-id', item[this.columns[0]]);
                filas[index].setAttribute('data-docente-cedula', item.Docente_Cedula || '');
                filas[index].setAttribute('data-docente-nombre', item.Docente_Nombre || '');
                filas[index].setAttribute('data-asignatura', item.Asignatura || '');
                filas[index].setAttribute('data-num-alumnos', item.Num_Alumnos || '');
                filas[index].setAttribute('data-carrera', item.Carrera || '');
                filas[index].setAttribute('data-pensum', item.Pensum || '');
                filas[index].setAttribute('data-trayecto', item['Sem/Trim'] || '');
                filas[index].setAttribute('data-seccion', item.Seccion || '');
                filas[index].setAttribute('data-clases-semana', item.Clases_Semana || '');
                filas[index].setAttribute('data-periodo', item.Periodo_Academico || '');
                filas[index].setAttribute('data-estado', item.Estado || '');
            }
        });
        
        aplicarEstilosEstatus();
    };

    // 10. Sobrescribir cargarDatos para formateo adicional
    const originalCargarDatos = tablaDocenteAsignatura.cargarDatos.bind(tablaDocenteAsignatura);
    tablaDocenteAsignatura.cargarDatos = async function() {
        await originalCargarDatos();
        
        aplicarEstilosEstatus();
        clonarFilasOriginales();
        actualizarPaginacion();
        
        // Llenar selectores de filtro con datos únicos
        await llenarSelectoresFiltro();
        // Llenar selectores de formularios con datos de otras tablas
        await cargarSelectoresFormularios();
    };

    // 11. Función para llenar selectores de filtro con datos únicos
    const llenarSelectoresFiltro = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Obtener datos únicos de la tabla docente_asignatura
            const response = await fetch('/api/docente_asignatura/valores-unicos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener valores únicos');

            const { periodos, carreras } = await response.json();

            // Llenar selector de periodos
            periodoSelect.innerHTML = '<option value="" disabled selected>Periodo</option><option value="">Todos</option>';
            periodos.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo;
                option.textContent = periodo;
                periodoSelect.appendChild(option);
            });
            
            // Llenar selector de carreras
            carreraSelect.innerHTML = '<option value="" disabled selected>Carrera</option><option value="">Todas</option>';
            carreras.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera;
                option.textContent = carrera;
                carreraSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error al llenar selectores de filtro:', error);
        }
    };

    // 12. Función para cargar selectores de formularios desde otras tablas
    const cargarSelectoresFormularios = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            // Obtener periodos académicos
            const resPeriodos = await fetch('/api/periodo_academico', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const periodos = await resPeriodos.json();

            // Obtener asignaturas
            const resAsignaturas = await fetch('/api/asignaturas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const asignaturas = await resAsignaturas.json();

            // Obtener pensums
            const resPensums = await fetch('/api/pensum', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const pensums = await resPensums.json();

            // Obtener niveles de pensum
            const resNiveles = await fetch('/api/nivel_pensum', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const niveles = await resNiveles.json();

            // Obtener carreras
            const resCarreras = await fetch('/api/carreras', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const carreras = await resCarreras.json();

            // Obtener secciones
            const resSecciones = await fetch('/api/secciones', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const secciones = await resSecciones.json();

            // Llenar selectores en formularios de agregar y editar
            llenarSelector('agregar-periodo', periodos, 'Periodo_Academico');
            llenarSelector('editar-periodo', periodos, 'Periodo_Academico');
            llenarSelector('agregar-asignatura', asignaturas, 'Codigo_Asignatura');
            llenarSelector('editar-asignatura', asignaturas, 'Codigo_Asignatura');
            llenarSelector('agregar-pensum', pensums, 'Codigo_Pensum');
            llenarSelector('editar-pensum', pensums, 'Codigo_Pensum');
            llenarSelector('agregar-nivel-pensum', niveles, 'Nombre_Nivel');
            llenarSelector('editar-nivel-pensum', niveles, 'Nombre_Nivel');
            llenarSelector('agregar-carrera', carreras, 'Codigo_Carrera');
            llenarSelector('editar-carrera', carreras, 'Codigo_Carrera');
            llenarSelector('agregar-seccion', secciones, 'Codigo_Seccion');
            llenarSelector('editar-seccion', secciones, 'Codigo_Seccion');

        } catch (error) {
            console.error('Error al cargar selectores de formularios:', error);
        }
    };

    // Función auxiliar para llenar un selector
    const llenarSelector = (idSelector, datos, campoValor, campoTexto = null) => {
        const selector = document.getElementById(idSelector);
        if (!selector) return;

        selector.innerHTML = '';
        const optionDefault = document.createElement('option');
        optionDefault.value = '';
        optionDefault.textContent = 'Seleccione una opción';
        optionDefault.disabled = true;
        optionDefault.selected = true;
        selector.appendChild(optionDefault);

        datos.forEach(item => {
            const option = document.createElement('option');
            option.value = item[campoValor];
            option.textContent = campoTexto ? item[campoTexto] : item[campoValor];
            selector.appendChild(option);
        });
    };

    // 13. Método para editar
    tablaDocenteAsignatura.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarOfertaModal');
        if (!editarModal) {
            console.error('No se encontró el modal de edición');
            return;
        }

        const editarForm = document.getElementById('editar-oferta-modal-form');
        if (!editarForm) {
            console.error('No se encontró el formulario de edición');
            return;
        }

        // Obtener la fila completa con los datos adicionales
        const fila = document.querySelector(`#tabla-ofertas tr[data-id="${id}"]`);
        if (!fila) {
            console.error('No se encontró la fila con ID:', id);
            return;
        }

        // Llenar el formulario con todos los campos
        document.getElementById('editar-docente-cedula').value = fila.getAttribute('data-docente-cedula') || '';
        document.getElementById('editar-docente-nombre').value = fila.getAttribute('data-docente-nombre') || '';
        document.getElementById('editar-asignatura').value = fila.getAttribute('data-asignatura') || '';
        document.getElementById('editar-num-alumnos').value = fila.getAttribute('data-num-alumnos') || '';
        document.getElementById('editar-carrera').value = fila.getAttribute('data-carrera') || '';
        document.getElementById('editar-pensum').value = fila.getAttribute('data-pensum') || '';
        document.getElementById('editar-trayecto').value = fila.getAttribute('data-trayecto') || '';
        document.getElementById('editar-sem-trim').value = fila.getAttribute('data-sem-trim') || '';
        document.getElementById('editar-seccion').value = fila.getAttribute('data-seccion') || '';
        document.getElementById('editar-clases-semana').value = fila.getAttribute('data-clases-semana') || '';
        document.getElementById('editar-estado').value = fila.getAttribute('data-estado') || 'correcta';
        document.getElementById('editar-periodo').value = fila.getAttribute('data-periodo') || '';

        // Mostrar el modal
        editarModal.style.display = 'block';

        // Configurar el evento submit
        const handleSubmit = async (event) => {
            event.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/docente_asignatura/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Docente_Cedula: document.getElementById('editar-docente-cedula').value,
                        Docente_Nombre: document.getElementById('editar-docente-nombre').value,
                        Asignatura: document.getElementById('editar-asignatura').value,
                        Num_Alumnos: document.getElementById('editar-num-alumnos').value,
                        Carrera: document.getElementById('editar-carrera').value,
                        Pensum: document.getElementById('editar-pensum').value,
                        Trayecto: document.getElementById('editar-trayecto').value,
                        'Sem/Trim': document.getElementById('editar-sem-trim').value,
                        Seccion: document.getElementById('editar-seccion').value,
                        Clases_Semana: document.getElementById('editar-clases-semana').value,
                        Estado: document.getElementById('editar-estado').value,
                        Periodo_Academico: document.getElementById('editar-periodo').value
                    }),
                });

                if (!response.ok) throw new Error('Error al editar la asignación docente-asignatura');
                
                await tablaDocenteAsignatura.cargarDatos();
                editarModal.style.display = 'none';
                alert('Asignación docente-asignatura actualizada correctamente');
            } catch (error) {
                console.error('Error al editar:', error);
                alert(`Error al editar: ${error.message}`);
            }
        };

        editarForm.onsubmit = handleSubmit;

        // Cerrar modal
        const closeModal = () => {
            editarModal.style.display = 'none';
            editarForm.onsubmit = null;
        };

        editarModal.querySelector('.close').addEventListener('click', closeModal);
        document.getElementById('cancelar-editar-oferta-modal').addEventListener('click', closeModal);
    };

    // 14. Método para eliminar
    tablaDocenteAsignatura.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarOfertaModal');
        if (!eliminarModal) {
            console.error('Modal de eliminación no encontrado');
            return;
        }

        eliminarModal.style.display = 'block';

        const handleEliminar = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/docente_asignatura/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar la asignación docente-asignatura');
                
                eliminarModal.style.display = 'none';
                await tablaDocenteAsignatura.cargarDatos();
                alert('Asignación docente-asignatura eliminada correctamente');
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al eliminar: ${error.message}`);
            }
        };

        // Configurar botón de aceptar
        const btnAceptar = document.getElementById('btn-aceptar-eliminar-oferta');
        if (btnAceptar) {
            btnAceptar.onclick = handleEliminar;
        }

        // Configurar cierre del modal
        const closeModal = () => {
            eliminarModal.style.display = 'none';
        };

        const closeButton = eliminarModal.querySelector('.eliminar-close');
        if (closeButton) {
            closeButton.onclick = closeModal;
        }

        const cancelButton = document.getElementById('btn-cancelar-eliminar-oferta');
        if (cancelButton) {
            cancelButton.onclick = closeModal;
        }
    };

    // 15. Agregar nueva asignación docente-asignatura
    const agregarModal = document.getElementById('agregarOfertaModal');
    const agregarForm = document.getElementById('agregar-oferta-modal-form');

    if (agregarModal && agregarForm) {
        document.getElementById('btn-agregar-oferta').addEventListener('click', () => {
            agregarModal.style.display = 'block';
        });

        agregarForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/docente_asignatura', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Docente_Cedula: document.getElementById('agregar-docente-cedula').value,
                        Docente_Nombre: document.getElementById('agregar-docente-nombre').value,
                        Asignatura: document.getElementById('agregar-asignatura').value,
                        Num_Alumnos: document.getElementById('agregar-num-alumnos').value,
                        Carrera: document.getElementById('agregar-carrera').value,
                        Pensum: document.getElementById('agregar-pensum').value,
                        Trayecto: document.getElementById('agregar-trayecto').value,
                        'Sem/Trim': document.getElementById('agregar-sem-trim').value,
                        Seccion: document.getElementById('agregar-seccion').value,
                        Clases_Semana: document.getElementById('agregar-clases-semana').value,
                        Estado: document.getElementById('agregar-estado').value,
                        Periodo_Academico: document.getElementById('agregar-periodo').value
                    }),
                });

                if (!response.ok) throw new Error('Error al agregar la asignación docente-asignatura');

                await tablaDocenteAsignatura.cargarDatos();
                agregarForm.reset();
                agregarModal.style.display = 'none';
                alert('Asignación docente-asignatura agregada correctamente');
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al agregar: ${error.message}`);
            }
        });

        // Cerrar modal de agregar
        agregarModal.querySelector('.agregar-close').addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });

        document.getElementById('cancelar-agregar-oferta-modal').addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });
    }


    // 17. Inicializar la tabla
    tablaDocenteAsignatura.cargarDatos().then(() => {
        console.log('Tabla de asignaciones docente-asignatura cargada correctamente');
    }).catch(error => {
        console.error('Error al cargar la tabla:', error);
    });
});