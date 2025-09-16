import GenericTable from './genericTable.js';

// Para que se desplieguen los filtros de busqueda

const btnFiltrarBitacora = document.getElementById('btn-filtrar-bitacora');
const filtrosBusquedaBitacora = document.getElementById('filtros-busqueda-bitacora');

btnFiltrarBitacora.addEventListener('click', () => {
    filtrosBusquedaBitacora.classList.toggle('mostrar');
});

document.addEventListener('DOMContentLoaded', () => {
    // Instanciar la tabla genérica para bitácora
    const tablaBitacora = new GenericTable(
        'bitacora', // Nombre de la tabla en la base de datos
        'tabla-bitacora', // ID de la tabla HTML
        ['ID', 'Fecha', 'Hora', 'IP', 'Usuario_ID', 'Accion', 'Fecha_Registro'], // Todas las columnas
        ['ID', 'Fecha', 'Hora', 'IP', 'Usuario_ID', 'Accion'], // Columnas a mostrar en la tabla HTML
        { disableEdit: false, disableDelete: false }
    );

    // Función para obtener el token JWT del almacenamiento local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Variables para la paginación y búsqueda
    const buscarInput = document.querySelector('.buscar-input-bitacora');
    const botonBuscar = document.querySelector('.btn-buscar-bitacora');
    const btnReajustar = document.querySelector('.btn-reajustar-bitacora');
    const rowsPerPage = 5;
    let currentPage = 1;
    let totalRows = 0;
    let totalPages = 0;
    let filasOriginales = [];

    // Función para clonar las filas originales
    const clonarFilasOriginales = () => {
        const filas = document.querySelectorAll('#tabla-bitacora tbody tr');
        filasOriginales = Array.from(filas).map(fila => fila.cloneNode(true));
    };

    // Función para filtrar la tabla
    const filtrarTabla = () => {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const tbody = document.querySelector('#tabla-bitacora tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => {
            const id = fila.cells[0].textContent.toLowerCase();
            const fecha = fila.cells[1].textContent.toLowerCase();
            const hora = fila.cells[2].textContent.toLowerCase();
            const ip = fila.cells[3].textContent.toLowerCase();
            const usuario = fila.cells[4].textContent.toLowerCase();
            const accion = fila.cells[5].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' || 
                                  id.includes(textoBusqueda) || 
                                  fecha.includes(textoBusqueda) ||
                                  hora.includes(textoBusqueda) ||
                                  ip.includes(textoBusqueda) ||
                                  usuario.includes(textoBusqueda) ||
                                  accion.includes(textoBusqueda);

            if (coincideBusqueda) {
                tbody.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
    };

    // Evento para el botón de búsqueda
    botonBuscar.addEventListener('click', filtrarTabla);

    // Evento para el botón de reajustar
    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        const tbody = document.querySelector('#tabla-bitacora tbody');
        tbody.innerHTML = '';

        filasOriginales.forEach(fila => tbody.appendChild(fila.cloneNode(true)));
        actualizarPaginacion();
    });

    // Función para mostrar las filas de la página actual
    const displayRows = (page) => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const filas = document.querySelectorAll('#tabla-bitacora tbody tr');

        filas.forEach((fila, index) => {
            fila.style.display = (index >= start && index < end) ? '' : 'none';
        });

        document.querySelector('.info-paginacion-bitacora').textContent = 
            `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    };

    // Función para actualizar los botones de paginación
    const updatePaginationButtons = () => {
        const prevButton = document.querySelector('.pagina-anterior-bitacora');
        const nextButton = document.querySelector('.pagina-siguiente-bitacora');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-bitacora');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageButtonsContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-bitacora');
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

    // Función para actualizar la paginación
    const actualizarPaginacion = () => {
        const filas = document.querySelectorAll('#tabla-bitacora tbody tr');
        totalRows = filas.length;
        totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = 1;
        displayRows(currentPage);
        updatePaginationButtons();
    };

    // Eventos de paginación
    document.querySelector('.pagina-anterior-bitacora').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-bitacora').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });


    // Inicialización
    tablaBitacora.cargarDatos().then(() => {
        clonarFilasOriginales();
        actualizarPaginacion();
        
        // Ocultar la columna de acciones ya que no se necesitan
        const accionesHeader = document.querySelector('#tabla-bitacora thead tr th:nth-child(7)');
        const accionesCells = document.querySelectorAll('#tabla-bitacora tbody tr td:nth-child(7)');
        
        if (accionesHeader) accionesHeader.style.display = 'none';
        accionesCells.forEach(cell => cell.style.display = 'none');
    });

    // Evento para el botón de generar PDF
    const btnGenerarPDF = document.getElementById('btn-generar-pdf-bitacora');
    btnGenerarPDF.addEventListener('click', async () => {
        try {
            const token = getToken();
            if (!token) throw new Error('No se encontró el token JWT');

            const response = await fetch('/api/bitacora/reporte', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) throw new Error('Error al generar el reporte');

            // Suponiendo que la API devuelve un blob con el PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_bitacora.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar el reporte');
        }
    });
});