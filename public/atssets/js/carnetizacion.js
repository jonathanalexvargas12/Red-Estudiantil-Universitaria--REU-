document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('fecha-vencimiento');
    
    // Función para obtener el token JWT (similar a tu CRUD)
    const getToken = () => localStorage.getItem('token');
    
    // Función para cargar los periodos académicos desde la API
    async function cargarPeriodosAcademicos() {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No se encontró el token JWT');
            }
            
            // Realizar la petición a la API (similar a tu CRUD)
            const response = await fetch('/api/periodo_academico', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener los periodos académicos');
            }
            
            const periodos = await response.json();
            
            // Limpiar las opciones existentes (excepto la primera)
            while (selectElement.options.length > 1) {
                selectElement.remove(1);
            }
            
            // Agregar las nuevas opciones
            periodos.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.Periodo_Academico;
                option.textContent = periodo.Periodo_Academico;
                selectElement.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error al cargar periodos académicos:', error);
            // Mostrar mensaje al usuario en caso de error
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Error al cargar los periodos académicos. Por favor, recarga la página.';
            document.querySelector('.contenedor-carnetizacion__form-group').appendChild(errorMessage);
        }
    }
    
    // Llamar a la función para cargar los periodos al cargar la página
    cargarPeriodosAcademicos();
});