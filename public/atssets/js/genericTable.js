class GenericTable {
    constructor(tableName, tableId, columns, displayColumns) {
        this.tableName = tableName; // Nombre de la tabla en la base de datos
        this.tableId = tableId; // ID de la tabla HTML
        this.columns = columns; // Todas las columnas de la tabla (para insertar/actualizar)
        this.displayColumns = displayColumns; // Columnas a mostrar en la tabla HTML
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
                    nuevaFila.innerHTML += `<td>${item[col]}</td>`;
                });

                // Agregar botones de acciones
                nuevaFila.innerHTML += `
                    <td>
                        <i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item[this.columns[0]]}"></i>
                        <i class="fas fa-trash-alt accion-icono eliminar-icono" title="Eliminar" data-id="${item[this.columns[0]]}"></i>
                    </td>
                `;
                this.tabla.appendChild(nuevaFila);
            });

            // Asignar eventos de editar y eliminar
            this.asignarEventosEditarEliminar();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Asignar eventos de editar y eliminar
    asignarEventosEditarEliminar() {
        const editIcons = document.querySelectorAll('.editar-icono');
        const deleteIcons = document.querySelectorAll('.eliminar-icono');

        editIcons.forEach(icon => {
            icon.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-id');
                const fila = event.target.closest('tr');
                const datos = Array.from(fila.cells).map(celda => celda.textContent);
                this.onEditar(id, datos);
            });
        });

        deleteIcons.forEach(icon => {
            icon.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-id');
                this.onEliminar(id);
            });
        });
    }

    // Métodos vacíos para que se sobrescriban en el módulo específico
    onEditar(id, datos) {}
    onEliminar(id) {}
}

export default GenericTable;