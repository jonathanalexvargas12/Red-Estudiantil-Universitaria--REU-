import GenericTable from './genericTable.js';
import { renderizarPaginacion } from './paginacion.js';

// Para que se desplieguen los filtros de busqueda
const btnFiltrarUsuarios = document.getElementById('btn-filtrar-usuarios');
const filtrosBusquedaUsuarios = document.getElementById('filtros-busqueda-usuarios');

if (btnFiltrarUsuarios && filtrosBusquedaUsuarios) {
    btnFiltrarUsuarios.addEventListener('click', () => {
        filtrosBusquedaUsuarios.classList.toggle('mostrar');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración inicial de la tabla
    const tablaUsuarios = new GenericTable(
        'usuarios',
        'tabla-usuarios',
        ['ID_Usuario', 'Password', 'Rol', 'Estado', 'Nombres', 'Apellidos', 'Genero', 'Residente', 'Cedula', 'Telefono_1', 'Telefono_2', 'Correo', 'Direccion_Residencial', 'Codigo_Carnet', 'Fecha_Registro'], // Todas las columnas
        ['Cedula', 'Nombres', 'Apellidos', 'ID_Usuario', 'Rol', 'Estado'], // Columnas a mostrar (orden corregido)
            {
            disableEdit: false,
            disableDelete: true,
        }
         
    );



    // 2. Función para obtener el token JWT
    const getToken = () => localStorage.getItem('token');

    // 3. Variables para paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-usuarios');
    const estatusSelect = document.querySelector('.select-estado-usuarios');
    const ordenSelect = document.querySelector('.select-ordenar-usuarios');
    const ordenRadio = document.querySelectorAll('input[name="orden"]');
    const botonBuscar = document.querySelector('.btn-buscar-usuarios');
    const btnReajustar = document.querySelector('.btn-reajustar-usuarios');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // 4. Función para aplicar estilos de estatus
    const aplicarEstilosEstatus = (filas) => {
        const elementos = filas || document.querySelectorAll('#tabla-usuarios tbody tr');
        
        elementos.forEach(row => {
            const estatusCell = row.cells[5]; // Índice del estado en la tabla (sexta columna)
            if (estatusCell) {
                const estadoReal = row.getAttribute('data-estado') || 
                                 estatusCell.textContent.replace(/<[^>]*>/g, '').trim().toLowerCase();
                
                let iconoEstatus = '';
                
                switch(estadoReal) {
                    case 'Habilitado':
                        iconoEstatus = '<i class="fas fa-circle estado-habilitado" title="Habilitado"></i>';
                        break;
                    case 'Deshabilitado':
                        iconoEstatus = '<i class="fas fa-circle estado-deshabilitado" title="Deshabilitado"></i>';
                        break;
                    default:
                        iconoEstatus = estadoReal;
                }
                
                row.setAttribute('data-estado', estadoReal);
                estatusCell.innerHTML = iconoEstatus;
            }
        });
    };

    // 5. Función para clonar filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-usuarios tbody tr');
        filasOriginales = Array.from(filas).map(fila => {
            const clone = fila.cloneNode(true);
            const estadoReal = fila.getAttribute('data-estado') || 
                             fila.cells[5].textContent.replace(/<[^>]*>/g, '').trim().toLowerCase();
            clone.setAttribute('data-estado', estadoReal);
            return clone;
        });
    };

    // 6. Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const estatusSeleccionado = estatusSelect.value.toLowerCase();
        const ordenSeleccionado = ordenSelect.value.toLowerCase();
        const ordenSeleccionadoRadio = document.querySelector('input[name="orden"]:checked').value;
        const tbody = document.querySelector('#tabla-usuarios tbody');
        tbody.innerHTML = '';

        let filasFiltradas = [...filasOriginales];

        // Aplicar filtro de búsqueda
        if (textoBusqueda !== '') {
            filasFiltradas = filasFiltradas.filter(filaOriginal => {
                const usuarioId = filaOriginal.cells[0].textContent.toLowerCase();
                const cedula = filaOriginal.cells[1].textContent.toLowerCase();
                const nombres = filaOriginal.cells[2].textContent.toLowerCase();
                const apellidos = filaOriginal.cells[3].textContent.toLowerCase();
                const rol = filaOriginal.cells[4].textContent.toLowerCase();
                
                return usuarioId.includes(textoBusqueda) || 
                       cedula.includes(textoBusqueda) || 
                       nombres.includes(textoBusqueda) || 
                       apellidos.includes(textoBusqueda) ||
                       rol.includes(textoBusqueda);
            });
        }

        // Aplicar filtro de estado
        if (estatusSeleccionado !== '') {
            filasFiltradas = filasFiltradas.filter(filaOriginal => {
                const estadoReal = filaOriginal.getAttribute('data-estado').toLowerCase();
                return estadoReal === estatusSeleccionado;
            });
        }

        // Aplicar ordenamiento
        if (ordenSeleccionado !== '') {
            filasFiltradas.sort((a, b) => {
                let valorA, valorB;
                
                switch(ordenSeleccionado) {
                    case 'cedula':
                        valorA = a.cells[1].textContent;
                        valorB = b.cells[1].textContent;
                        break;
                    case 'nombre':
                        valorA = a.cells[2].textContent;
                        valorB = b.cells[2].textContent;
                        break;
                    case 'apellido':
                        valorA = a.cells[3].textContent;
                        valorB = b.cells[3].textContent;
                        break;
                    case 'usuario':
                        valorA = a.cells[0].textContent;
                        valorB = b.cells[0].textContent;
                        break;
                    default:
                        valorA = a.cells[1].textContent;
                        valorB = b.cells[1].textContent;
                }
                
                if (ordenSeleccionadoRadio === 'ascendente') {
                    return valorA.localeCompare(valorB);
                } else {
                    return valorB.localeCompare(valorA);
                }
            });
        }

        // Mostrar filas filtradas
        filasFiltradas.forEach(filaOriginal => {
            const nuevaFila = filaOriginal.cloneNode(true);
            tbody.appendChild(nuevaFila);
        });

        aplicarEstilosEstatus(tbody.querySelectorAll('tr'));
        actualizarPaginacion();
        tablaUsuarios.asignarEventosEditarEliminar();
    };

    // 7. Funciones de paginación
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-usuarios tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-usuarios').textContent =
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    const updatePaginationButtons = () => {
        renderizarPaginacion({
            sufijo: '-usuarios',
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
        const filas = document.querySelectorAll('#tabla-usuarios tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // 8. Eventos de búsqueda y paginación
    if (botonBuscar) {
        botonBuscar.addEventListener('click', filtrarTabla);
    }

    if (btnReajustar) {
        btnReajustar.addEventListener('click', () => {
            buscarInput.value = '';
            estatusSelect.selectedIndex = 0;
            ordenSelect.selectedIndex = 0;
            document.querySelector('input[name="orden"][value="ascendente"]').checked = true;
            filtrarTabla();
        });
    }

    const prevButton = document.querySelector('.pagina-anterior-usuarios');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayRows(currentPage);
                updatePaginationButtons();
            }
        });
    }

    const nextButton = document.querySelector('.pagina-siguiente-usuarios');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayRows(currentPage);
                updatePaginationButtons();
            }
        });
    }

    // 9. Modificar el método actualizarTabla en GenericTable
    const originalActualizarTabla = tablaUsuarios.actualizarTabla.bind(tablaUsuarios);
    tablaUsuarios.actualizarTabla = function(datos) {
        originalActualizarTabla(datos);
        
        const filas = document.querySelectorAll(`#${this.tableId} tbody tr`);
        datos.forEach((item, index) => {
            if (filas[index]) {
                filas[index].setAttribute('data-id', item[this.columns[0]]);
                filas[index].setAttribute('data-usuario-id', item.ID_Usuario || '');
                filas[index].setAttribute('data-cedula', item.Cedula || '');
                filas[index].setAttribute('data-nombres', item.Nombres || '');
                filas[index].setAttribute('data-apellidos', item.Apellidos || '');
                filas[index].setAttribute('data-rol', item.Rol || '');
                filas[index].setAttribute('data-estado', item.Estado || '');
                filas[index].setAttribute('data-genero', item.Genero || '');
                filas[index].setAttribute('data-residente', item.Residente || '');
                filas[index].setAttribute('data-telefono1', item.Telefono_1 || '');
                filas[index].setAttribute('data-telefono2', item.Telefono_2 || '');
                filas[index].setAttribute('data-correo', item.Correo || '');
                filas[index].setAttribute('data-direccion', item.Direccion_Residencial || '');
            }
        });
        
        aplicarEstilosEstatus();
    };

    // 10. Sobrescribir cargarDatos para formateo adicional
    const originalCargarDatos = tablaUsuarios.cargarDatos.bind(tablaUsuarios);
    tablaUsuarios.cargarDatos = async function() {
        await originalCargarDatos();
        
        aplicarEstilosEstatus();
        clonarFilasOriginales();
        actualizarPaginacion();
    };

    // 11. Método para editar
    tablaUsuarios.onEditar = (id, datos) => {
        const editarModal = document.getElementById('editarModal');
        if (!editarModal) {
            console.error('No se encontró el modal de edición');
            return;
        }

        const editarForm = document.getElementById('modal-form');
        if (!editarForm) {
            console.error('No se encontró el formulario de edición');
            return;
        }

        // Obtener la fila completa con los datos adicionales
        const fila = document.querySelector(`#tabla-usuarios tr[data-id="${id}"]`);
        if (!fila) {
            console.error('No se encontró la fila con ID:', id);
            return;
        }

        // Llenar el formulario con todos los campos
        document.getElementById('rol').value = fila.getAttribute('data-rol') || '';
        document.getElementById('usuario').value = fila.getAttribute('data-usuario-id') || '';
        document.getElementById('cedula').value = fila.getAttribute('data-cedula') || '';
        document.getElementById('nombres').value = fila.getAttribute('data-nombres') || '';
        document.getElementById('apellidos').value = fila.getAttribute('data-apellidos') || '';
        document.getElementById('genero').value = fila.getAttribute('data-genero') || '';
        document.getElementById('residente').value = fila.getAttribute('data-residente') || '';
        document.getElementById('telefono1').value = fila.getAttribute('data-telefono1') || '';
        document.getElementById('telefono2').value = fila.getAttribute('data-telefono2') || '';
        document.getElementById('correo').value = fila.getAttribute('data-correo') || '';
        document.getElementById('editar-direccion').value = fila.getAttribute('data-direccion') || '';
        document.getElementById('estado').value = fila.getAttribute('data-estado') || 'Habilitado';

        // Mostrar el modal
        editarModal.style.display = 'block';

        // Configurar el evento submit
        const handleSubmit = async (event) => {
            event.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/usuarios/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Rol: document.getElementById('rol').value,
                        Nombres: document.getElementById('nombres').value,
                        Apellidos: document.getElementById('apellidos').value,
                        Genero: document.getElementById('genero').value,
                        Residente: document.getElementById('residente').value,
                        Telefono_1: document.getElementById('telefono1').value,
                        Telefono_2: document.getElementById('telefono2').value,
                        Correo: document.getElementById('correo').value,
                        Direccion_Residencial: document.getElementById('editar-direccion').value,
                        Estado: document.getElementById('estado').value
                    }),
                });

                if (!response.ok) throw new Error('Error al editar el usuario');
                
                await tablaUsuarios.cargarDatos();
                editarModal.style.display = 'none';
                alert('Usuario actualizado correctamente');
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
        document.getElementById('cancelar-modal').addEventListener('click', closeModal);
    };

    // 12. Método para eliminar
    tablaUsuarios.onEliminar = (id) => {
        const eliminarModal = document.getElementById('eliminarModal');
        if (!eliminarModal) {
            console.error('Modal de eliminación no encontrado');
            return;
        }

        eliminarModal.style.display = 'block';

        const handleEliminar = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch(`/api/usuarios/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) throw new Error('Error al eliminar el usuario');
                
                eliminarModal.style.display = 'none';
                await tablaUsuarios.cargarDatos();
                alert('Usuario eliminado correctamente');
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al eliminar: ${error.message}`);
            }
        };

        // Configurar botón de aceptar
        const btnAceptar = document.getElementById('btn-aceptar-eliminar');
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

        const cancelButton = document.getElementById('btn-cancelar-eliminar');
        if (cancelButton) {
            cancelButton.onclick = closeModal;
        }
    };

    // 13. Agregar nuevo usuario
    const agregarModal = document.getElementById('agregarModal');
    const agregarForm = document.getElementById('agregar-modal-form');

    if (agregarModal && agregarForm) {
        document.getElementById('btn-agregar-usuarios').addEventListener('click', () => {
            agregarModal.style.display = 'block';
        });

        agregarForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                const token = getToken();
                if (!token) throw new Error('No se encontró el token JWT');

                const response = await fetch('/api/usuarios', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ID_Usuario: document.getElementById('nuevo-usuario').value,
                        Rol: document.getElementById('nuevo-rol').value,
                        Nombres: document.getElementById('nuevos-nombres').value,
                        Apellidos: document.getElementById('nuevos-apellidos').value,
                        Genero: document.getElementById('nuevo-genero').value,
                        Residente: document.getElementById('nuevo-residente').value,
                        Cedula: document.getElementById('nueva-cedula').value,
                        Telefono_1: document.getElementById('nuevo-telefono1').value,
                        Telefono_2: document.getElementById('nuevo-telefono2').value,
                        Correo: document.getElementById('nuevo-correo').value,
                        Direccion_Residencial: document.getElementById('agregar-direccion').value,
                        Estado: 'Habilitado'
                    }),
                });

                if (!response.ok) throw new Error('Error al agregar el usuario');

                const result = await response.json();
                await tablaUsuarios.cargarDatos();
                agregarForm.reset();
                agregarModal.style.display = 'none';
                alert(`Usuario creado exitosamente\nUsuario: ${document.getElementById('nuevo-usuario').value}\nContraseña: ${result.password}`);
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

        document.getElementById('cancelar-agregar-modal').addEventListener('click', () => {
            agregarModal.style.display = 'none';
            agregarForm.reset();
        });
    }

    // 14. Inicializar la tabla
    tablaUsuarios.cargarDatos().then(() => {
        console.log('Tabla de usuarios cargada correctamente');
    }).catch(error => {
        console.error('Error al cargar la tabla:', error);
    });
});