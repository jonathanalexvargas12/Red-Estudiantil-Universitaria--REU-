class GenericTable {
    constructor(tableName, tableId, columns, displayColumns, disableEdit = false) {
        this.tableName = tableName;
        this.tableId = tableId;
        this.columns = columns;
        this.displayColumns = displayColumns;
        this.disableEdit = disableEdit;
        this.init();
    }

    init() {
        this.tabla = document.getElementById(this.tableId).getElementsByTagName('tbody')[0];
        // Usar delegación de eventos en lugar de asignar a cada elemento
        this.setupEventDelegation();
        this.cargarDatos();
    }

    // Configurar delegación de eventos para toda la tabla
    setupEventDelegation() {
        const tablaElement = document.getElementById(this.tableId);
        
        tablaElement.addEventListener('click', (event) => {
            const target = event.target;
            
            // Manejar eventos de edición
            if (target.classList.contains('editar-icono')) {
                const id = target.getAttribute('data-id');
                const fila = target.closest('tr');
                const datos = Array.from(fila.cells).map(celda => celda.textContent);
                this.onEditar(id, datos);
                return;
            }
            
            // Manejar eventos de eliminación
            if (target.classList.contains('eliminar-icono')) {
                const id = target.getAttribute('data-id');
                this.onEliminar(id);
                return;
            }
            
            // Manejar eventos especiales para estudiantes
            if (this.tableName === 'estudiantes') {
                if (target.classList.contains('ficha-icono')) {
                    const id = target.getAttribute('data-id');
                    if (this.onFichaEstudiante) this.onFichaEstudiante(id);
                    return;
                }
                
                if (target.classList.contains('carnet-icono')) {
                    const id = target.getAttribute('data-id');
                    if (this.onCarnetEstudiante) this.onCarnetEstudiante(id);
                    return;
                }
            }
            
            // Manejar eventos especiales para profesores
            if (this.tableName === 'docentes') {
                if (target.classList.contains('ficha-profesor-icono')) {
                    const id = target.getAttribute('data-id');
                    if (this.onFichaProfesor) this.onFichaProfesor(id);
                    return;
                }
                
                if (target.classList.contains('carnet-profesor-icono')) {
                    const id = target.getAttribute('data-id');
                    if (this.onCarnetProfesor) this.onCarnetProfesor(id);
                    return;
                }
            }
        });
    }

    async cargarDatos() {
        try {
            const response = await fetch(`/api/${this.tableName}`);
            if (!response.ok) throw new Error('Error al obtener los datos');
            const datos = await response.json();
            this.tabla.innerHTML = '';
            datos.forEach(item => {
                const nuevaFila = document.createElement('tr');

                this.displayColumns.forEach(col => {
                    let contenido = item[col];
                    if (col === 'Inicio' || col === 'Final') {
                        contenido = this.formatearFecha(contenido);
                    }
                    nuevaFila.innerHTML += `<td>${contenido}</td>`;
                });

                nuevaFila.innerHTML += this.generarAccionesHTML(item);
                this.tabla.appendChild(nuevaFila);
            });

            // Ya no necesitamos asignar eventos individualmente
        } catch (error) {
            console.error('Error:', error);
        }
    }

    generarAccionesHTML(item) {
        let accionesHTML = '<td class="acciones-cell">';

        // Caso especial para estudiantes
        if (this.tableName === 'estudiantes') {
            accionesHTML += `
                <i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-id-card accion-icono ficha-icono" title="Ficha del Estudiante" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-id-badge accion-icono carnet-icono" title="Carnet" data-id="${item[this.columns[0]]}"></i>
            `;
        } 
        // Caso especial para profesores
        else if (this.tableName === 'docentes') {
            accionesHTML += `
                <i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-trash-alt accion-icono eliminar-icono" title="Eliminar" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-id-card accion-icono ficha-profesor-icono" title="Ficha del Profesor" data-id="${item[this.columns[0]]}"></i>
                <i class="fas fa-id-badge accion-icono carnet-profesor-icono" title="Carnet" data-id="${item[this.columns[0]]}"></i>
            `;
        }
        // Comportamiento por defecto
        else {
            if (!this.disableEdit) {
                accionesHTML += `<i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item[this.columns[0]]}"></i>`;
            }
            accionesHTML += `<i class="fas fa-trash-alt accion-icono eliminar-icono" title="Eliminar" data-id="${item[this.columns[0]]}"></i>`;
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

    formatearFecha(fechaISO) {
        if (!fechaISO) return '';
        const fecha = new Date(fechaISO);
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    }
}

export default GenericTable;