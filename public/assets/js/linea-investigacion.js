import GenericTable from './genericTable.js';

document.addEventListener('DOMContentLoaded', () => {
    const tablaLineas = new GenericTable(
        'linea_investigacion',
        'Codigo_Linea',
        'tabla-lineas',
        {
            agregarModalId: 'agregarLineaModal',
            editarModalId: 'editarLineaModal',
            eliminarModalId: 'eliminarLineaModal',
            paginacionClass: 'paginacion-crud',
            btnAgregarId: 'btn-agregar-linea',
            btnBuscar: '.btn-buscar-asignaturas',
            btnReajustar: '.btn-reajustar-asignaturas',
            buscarInput: '.buscar-input-asignaturas'
        },
        [
            { field: 'Codigo_Linea', label: 'Código' },
            { field: 'Nombre_Linea', label: 'Nombre' },
            { field: 'Descripcion', label: 'Descripción' }
        ],
        [
            { id: 'agregar-codigo-linea', field: 'Codigo_Linea', required: true },
            { id: 'agregar-nombre-linea', field: 'Nombre_Linea', required: true },
            { id: 'agregar-descripcion-linea', field: 'Descripcion' }
        ],
        [
            { id: 'editar-codigo-linea', field: 'Codigo_Linea', required: true },
            { id: 'editar-nombre-linea', field: 'Nombre_Linea', required: true },
            { id: 'editar-descripcion-linea', field: 'Descripcion' }
        ]
    );

    tablaLineas.inicializar();

    // Close modal handlers
    document.querySelector('#agregarLineaModal .agregar-close').onclick = () => {
        document.getElementById('agregarLineaModal').style.display = 'none';
    };
    document.querySelector('#editarLineaModal .close').onclick = () => {
        document.getElementById('editarLineaModal').style.display = 'none';
    };
    document.querySelector('#eliminarLineaModal .eliminar-close').onclick = () => {
        document.getElementById('eliminarLineaModal').style.display = 'none';
    };
    document.getElementById('cancelar-editar-linea').onclick = () => {
        document.getElementById('editarLineaModal').style.display = 'none';
    };
    document.getElementById('btn-cancelar-eliminar-linea').onclick = () => {
        document.getElementById('eliminarLineaModal').style.display = 'none';
    };
});
