class GenericTable {
    constructor(tableName, tableId, columns, displayColumns, disableEdit = false) {
        this.tableName = tableName; // Nombre de la tabla en la base de datos
        this.tableId = tableId; // ID de la tabla HTML
        this.columns = columns; // Todas las columnas de la tabla (para insertar/actualizar)
        this.displayColumns = displayColumns; // Columnas a mostrar en la tabla HTML
        this.disableEdit = disableEdit; // Bandera para deshabilitar edición
        this.init();
    }

    // Inicializar la tabla
    init() {
        this.tabla = document.getElementById(this.tableId).getElementsByTagName('tbody')[0];
        this.cargarDatos();
    }

    // Cargar datos desde la base de datos
    async cargarDatos() {
        try {
            const response = await fetch(`/api/${this.tableName}`);
            if (!response.ok) throw new Error('Error al obtener los datos');
            const datos = await response.json();
            this.tabla.innerHTML = '';
            datos.forEach(item => {
                const nuevaFila = document.createElement('tr');

                // Mostrar solo las columnas definidas en displayColumns
                this.displayColumns.forEach(col => {
                    let contenido = item[col];
                    // Formatear fechas si la columna es 'Inicio' o 'Final'
                    if (col === 'Inicio' || col === 'Final') {
                        contenido = this.formatearFecha(contenido);
                    }
                    nuevaFila.innerHTML += `<td>${contenido}</td>`;
                });

                // Agregar botones de acciones (con excepción para secciones)
                let accionesHTML = '<td>';

                if (!this.disableEdit) {
                    accionesHTML += `<i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item[this.columns[0]]}"></i>`;
                }

                accionesHTML += `<i class="fas fa-trash-alt accion-icono eliminar-icono" title="Eliminar" data-id="${item[this.columns[0]]}"></i>`;
                accionesHTML += '</td>';

                nuevaFila.innerHTML += accionesHTML;
                this.tabla.appendChild(nuevaFila);
            });

            // Asignar eventos de editar (si corresponde) y eliminar
            this.asignarEventosEditarEliminar();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Asignar eventos de editar y eliminar
    asignarEventosEditarEliminar() {
        if (!this.disableEdit) {
            const editIcons = document.querySelectorAll('.editar-icono');
            editIcons.forEach(icon => {
                icon.addEventListener('click', (event) => {
                    const id = event.target.getAttribute('data-id');
                    const fila = event.target.closest('tr');
                    const datos = Array.from(fila.cells).map(celda => celda.textContent);
                    this.onEditar(id, datos);
                });
            });
        }

        const deleteIcons = document.querySelectorAll('.eliminar-icono');
        deleteIcons.forEach(icon => {
            icon.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-id');
                this.onEliminar(id);
            });
        });
    }

    // Métodos vacíos para que se sobrescriban en el módulo específico
    onEditar(id, datos) { }
    onEliminar(id) { }

    // Función para formatear fechas
    formatearFecha(fechaISO) {
        if (!fechaISO) return ''; // Manejar valores nulos o indefinidos

        const fecha = new Date(fechaISO);
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0 a 11
        const dia = String(fecha.getDate()).padStart(2, '0');

        return `${año}-${mes}-${dia}`;
    }
}

export default GenericTable;