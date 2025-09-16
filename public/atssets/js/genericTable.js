class GenericTable {
    constructor(tableName, tableId, columns, displayColumns, options = {}) {
        this.tableName = tableName;
        this.tableId = tableId;
        this.columns = columns;
        this.displayColumns = displayColumns;
        
        // Nueva propiedad para identificar por HTML
        const tableElement = document.getElementById(tableId);
        this.tableType = tableElement?.getAttribute('data-table-type') || 
                         tableElement?.classList.contains('imprimir-horario-table') ? 'imprimir-horario' : 
                         tableName;
        
        // Opciones por defecto
        this.disableEdit = options.disableEdit || false;
        this.disableDelete = options.disableDelete || false;
        
        // Compatibilidad con versión anterior
        if (typeof options === 'boolean') {
            this.disableEdit = options;
            this.disableDelete = false;
        }
        
        this.init();
    }

    init() {
        this.tabla = document.getElementById(this.tableId).getElementsByTagName('tbody')[0];
        this.setupEventDelegation();
        this.cargarDatos();
    }

    asignarEventosEditarEliminar() {
        document.querySelectorAll(`#${this.tableId} .editar-icono`).forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                const fila = btn.closest('tr');
                const celdas = Array.from(fila.cells).map(cell => {
                    const icon = cell.querySelector('i');
                    return icon ? icon.getAttribute('title') || '' : cell.textContent.trim();
                });
                if (this.onEditar) this.onEditar(id, celdas);
            };
        });

        document.querySelectorAll(`#${this.tableId} .eliminar-icono`).forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                if (this.onEliminar) this.onEliminar(id);
            };
        });
    }

    setupEventDelegation() {
        const tablaElement = document.getElementById(this.tableId);
        
        tablaElement.addEventListener('click', (event) => {
            const target = event.target;
            
            // Eventos comunes
            if (target.classList.contains('editar-icono') || target.closest('.editar-icono')) {
                const icono = target.classList.contains('editar-icono') ? target : target.closest('.editar-icono');
                const id = icono.getAttribute('data-id');
                const fila = icono.closest('tr');
                const datos = Array.from(fila.cells).map(celda => {
                    const icon = celda.querySelector('i');
                    return icon ? icon.getAttribute('title') || '' : celda.textContent.trim();
                });
                if (this.onEditar) this.onEditar(id, datos);
                return;
            }
            
            if (target.classList.contains('eliminar-icono') || target.closest('.eliminar-icono')) {
                const icono = target.classList.contains('eliminar-icono') ? target : target.closest('.eliminar-icono');
                const id = icono.getAttribute('data-id');
                if (this.onEliminar) this.onEliminar(id);
                return;
            }
            
            // Eventos especiales basados en tableType
            if (this.tableType === 'estudiantes') {
                if (target.classList.contains('ficha-icono') || target.closest('.ficha-icono')) {
                    const icono = target.classList.contains('ficha-icono') ? target : target.closest('.ficha-icono');
                    const id = icono.getAttribute('data-id');
                    if (this.onFichaEstudiante) this.onFichaEstudiante(id);
                    return;
                }
                
                if (target.classList.contains('carnet-icono') || target.closest('.carnet-icono')) {
                    const icono = target.classList.contains('carnet-icono') ? target : target.closest('.carnet-icono');
                    const id = icono.getAttribute('data-id');
                    if (this.onCarnetEstudiante) this.onCarnetEstudiante(id);
                    return;
                }
            }
            
            if (this.tableType === 'docentes') {
                if (target.classList.contains('ficha-profesor-icono') || target.closest('.ficha-profesor-icono')) {
                    const icono = target.classList.contains('ficha-profesor-icono') ? target : target.closest('.ficha-profesor-icono');
                    const id = icono.getAttribute('data-id');
                    if (this.onFichaProfesor) this.onFichaProfesor(id);
                    return;
                }
                
                if (target.classList.contains('carnet-profesor-icono') || target.closest('.carnet-profesor-icono')) {
                    const icono = target.classList.contains('carnet-profesor-icono') ? target : target.closest('.carnet-profesor-icono');
                    const id = icono.getAttribute('data-id');
                    if (this.onCarnetProfesor) this.onCarnetProfesor(id);
                    return;
                }
            }

            if (this.tableType === 'pensum' && (target.classList.contains('pdf-icono-pensum') || target.closest('.pdf-icono-pensum'))) {
                const icono = target.classList.contains('pdf-icono-pensum') ? target : target.closest('.pdf-icono-pensum');
                const id = icono.getAttribute('data-id');
                if (this.onGenerarPDFPensum) this.onGenerarPDFPensum(id);
                return;
            }

            if (this.tableType === 'imprimir-horario' && (target.classList.contains('imprimir-horario-icono') || target.closest('.imprimir-horario-icono'))) {
                const icono = target.classList.contains('imprimir-horario-icono') ? target : target.closest('.imprimir-horario-icono');
                const id = icono.getAttribute('data-id');
                if (this.onImprimirHorario) this.onImprimirHorario(id);
                return;
            }
        });
    }

    async cargarDatos() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch(`/api/${this.tableName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Error al obtener los datos');
            
            const datos = await response.json();
            this.actualizarTabla(datos);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async obtenerDatosCompletos() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch(`/api/${this.tableName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Error al obtener los datos completos');
            
            return await response.json();
        } catch (error) {
            console.error('Error al obtener datos completos:', error);
            throw error;
        }
    }

    actualizarTabla(datos) {
        this.tabla.innerHTML = '';
        datos.forEach(item => {
            const nuevaFila = document.createElement('tr');

            this.displayColumns.forEach(col => {
                let contenido = item[col];
                
                if (col === 'Inicio' || col === 'Final' || col === 'Fecha_Registro' || col === 'Fecha') {
                    contenido = this.formatearFecha(contenido);
                }
                
                if (col === 'Estado_Pensum' || col === 'Estado_Docente') {
                    const estado = (contenido || '').toLowerCase();
                    if (estado === 'activo') {
                        contenido = '<i class="fas fa-circle estado-activo" title="Activo"></i>';
                    } else if (estado === 'inactivo') {
                        contenido = '<i class="fas fa-circle estado-inactivo" title="Inactivo"></i>';
                    }
                }
                
                if (col === 'Tipo') {
                    const tipo = (contenido || '').toLowerCase();
                    if (tipo === 'normal') {
                        contenido = '<i class="fas fa-circle tipo-normal" title="Normal"></i>';
                    } else if (tipo === 'virtual') {
                        contenido = '<i class="fas fa-circle tipo-virtual" title="Virtual"></i>';
                    }
                }

                nuevaFila.innerHTML += `<td>${contenido}</td>`;
            });

            if (this.tableName !== 'bitacora') {
                nuevaFila.innerHTML += this.generarAccionesHTML(item);
            } else {
                nuevaFila.innerHTML += '<td></td>';
            }
            
            this.tabla.appendChild(nuevaFila);
        });
    }

    generarAccionesHTML(item) {
        let accionesHTML = '<td class="acciones-cell">';

        if (this.tableType === 'imprimir-horario') {
            accionesHTML += `
                <i class="fa-solid fa-file-pdf accion-icono imprimir-horario-icono" 
                   title="Imprimir Horario" 
                   data-id="${item[this.columns[0]]}"></i>
            `;
        }
        else if (this.tableType === 'estudiantes') {
            accionesHTML += `
                <i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-id-card accion-icono ficha-icono" title="Ficha del Estudiante" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-id-badge accion-icono carnet-icono" title="Carnet" data-id="${item[this.columns[0]]}"></i>
            `;
        } 
        else if (this.tableType === 'docentes') {
            accionesHTML += `
                <i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono" title="Eliminar" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-id-card accion-icono ficha-profesor-icono" title="Ficha del Profesor" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-id-badge accion-icono carnet-profesor-icono" title="Carnet" data-id="${item[this.columns[0]]}"></i>
            `;
        }
        else if (this.tableType === 'pensum') {
            accionesHTML += `
                <i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono" title="Eliminar" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-file-pdf accion-icono pdf-icono-pensum" title="Generar PDF" data-id="${item[this.columns[0]]}"></i>
            `;
        }
        else {
            if (!this.disableEdit) {
                accionesHTML += `<i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item[this.columns[0]]}"></i>`;
            }
            
            if (!this.disableDelete) {
                accionesHTML += `<i class="fas fa-trash-alt accion-icono eliminar-icono" title="Eliminar" data-id="${item[this.columns[0]]}"></i>`;
            }
        }

        accionesHTML += '</td>';
        return accionesHTML;
    }

    // Métodos vacíos para sobrescribir
    onEditar(id, datos) {}
    onEliminar(id) {}
    onFichaEstudiante(id) {}
    onCarnetEstudiante(id) {}
    onFichaProfesor(id) {}
    onCarnetProfesor(id) {}
    onGenerarPDFPensum(id) {}
    onImprimirHorario(id) {}

    formatearFecha(fechaISO) {
        if (!fechaISO) return '';
        try {
            const fecha = new Date(fechaISO);
            if (isNaN(fecha.getTime())) return fechaISO;
            
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            return `${año}-${mes}-${dia}`;
        } catch (e) {
            console.error('Error al formatear fecha:', e);
            return fechaISO;
        }
    }

    formatearFechaEnSelect(selectElement) {
        if (!selectElement) return;
        
        Array.from(selectElement.options).forEach(option => {
            if (option.value && (option.value.match(/^\d{4}-\d{2}-\d{2}/) || option.text.match(/^\d{4}-\d{2}-\d{2}/))) {
                const fechaFormateada = this.formatearFecha(option.value);
                if (fechaFormateada !== option.value) {
                    option.text = fechaFormateada;
                    option.value = fechaFormateada;
                }
            }
        });
    }
}

export default GenericTable;