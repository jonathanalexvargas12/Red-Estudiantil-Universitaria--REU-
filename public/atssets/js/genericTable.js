class GenericTable {
    constructor(tableName, tableId, columns, displayColumns) {
        this.tableName = tableName;
        this.tableId = tableId;
        this.columns = columns;
        this.displayColumns = displayColumns;
        this.init();
    }

    init() {
        this.tabla = document.getElementById(this.tableId).getElementsByTagName('tbody')[0];
        this.cargarDatos();
    }

    async cargarDatos() {
        try {
            const response = await fetch(`/api/${this.tableName}`);
            if (!response.ok) throw new Error('Error al obtener los datos');
            const datos = await response.json();
            this.tabla.innerHTML = '';
            
            datos.forEach(item => {
                const nuevaFila = document.createElement('tr');

                // Mostrar columnas definidas
                this.displayColumns.forEach(col => {
                    nuevaFila.innerHTML += `<td>${item[col]}</td>`;
                });

                // Agregar botones de acciones usando "Desde" como ID
                nuevaFila.innerHTML += `
                    <td>
                        <i class="fas fa-edit accion-icono editar-icono" title="Editar" data-id="${item['Desde']}"></i>
                        <i class="fas fa-trash-alt accion-icono eliminar-icono" title="Eliminar" data-id="${item['Desde']}"></i>
                    </td>
                `;
                this.tabla.appendChild(nuevaFila);
            });

            this.asignarEventosEditarEliminar();
        } catch (error) {
            console.error('Error:', error);
            this.tabla.innerHTML = `<tr><td colspan="${this.displayColumns.length + 1}" class="error-message">Error al cargar los datos</td></tr>`;
        }
    }

    asignarEventosEditarEliminar() {
        // Limpiar eventos anteriores
        const oldEditIcons = document.querySelectorAll('.editar-icono');
        const oldDeleteIcons = document.querySelectorAll('.eliminar-icono');
        oldEditIcons.forEach(icon => icon.replaceWith(icon.cloneNode(true)));
        oldDeleteIcons.forEach(icon => icon.replaceWith(icon.cloneNode(true)));

        // Asignar nuevos eventos
        const editIcons = document.querySelectorAll('.editar-icono');
        const deleteIcons = document.querySelectorAll('.eliminar-icono');

        editIcons.forEach(icon => {
            icon.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-id');
                const fila = event.target.closest('tr');
                const datos = Array.from(fila.cells)
                    .slice(0, this.displayColumns.length)
                    .map(celda => celda.textContent);
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

    onEditar(id, datos) {}
    onEliminar(id) {}
}

export default GenericTable;