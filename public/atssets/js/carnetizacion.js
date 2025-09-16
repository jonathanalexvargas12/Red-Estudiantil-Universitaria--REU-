document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('fecha-vencimiento');
    
    // Función para obtener el token JWT (similar a tu CRUD)
    const getToken = () => localStorage.getItem('token');
    
    // Función auxiliar para formatear fechas (similar a la de GenericTable)
    function formatearFecha(fechaISO) {
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
    
    // Función para formatear fechas en el select
    function formatearFechasEnSelect(select) {
        if (!select) return;
        
        Array.from(select.options).forEach(option => {
            if (option.value && (option.value.match(/^\d{4}-\d{2}-\d{2}/) || option.textContent.match(/^\d{4}-\d{2}-\d{2}/))) {
                const fechaFormateada = formatearFecha(option.value);
                if (fechaFormateada !== option.value) {
                    option.textContent = fechaFormateada;
                    option.value = fechaFormateada;
                }
            }
        });
    }
    
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
                option.value = periodo.Final;
                option.textContent = periodo.Final;
                selectElement.appendChild(option);
            });
            
            // Aplicar formato de fecha a las opciones del select
            formatearFechasEnSelect(selectElement);
            
            // Cargar la fecha guardada si existe
            const fechaGuardada = localStorage.getItem('fechaVencimientoCarnet');
            if (fechaGuardada) {
                selectElement.value = fechaGuardada;
            }
            
        } catch (error) {
            console.error('Error al cargar periodos académicos:', error);
            // Mostrar mensaje al usuario en caso de error
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Error al cargar los periodos académicos. Por favor, recarga la página.';
            document.querySelector('.contenedor-carnetizacion__form-group').appendChild(errorMessage);
        }
    }
    
    // Evento para el botón Guardar
    document.querySelector('.contenedor-carnetizacion__boton').addEventListener('click', function() {
        const selectedDate = document.getElementById('fecha-vencimiento').value;
        if (selectedDate) {
            localStorage.setItem('fechaVencimientoCarnet', selectedDate);
            
            // Mostrar notificación de éxito con estilo
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Fecha de vencimiento guardada correctamente</span>
            `;
            document.querySelector('.contenedor-carnetizacion').appendChild(notification);
            
            // Eliminar la notificación después de 3 segundos
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        } else {
            // Mostrar notificación de error con estilo
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>Por favor seleccione una fecha</span>
            `;
            document.querySelector('.contenedor-carnetizacion').appendChild(notification);
            
            // Eliminar la notificación después de 3 segundos
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    });
    
    // Evento para cambiar la fecha
    selectElement.addEventListener('change', function() {
        if (this.value) {
            // Mostrar confirmación solo si hay una fecha seleccionada
            const confirmation = confirm('¿Desea actualizar la fecha de vencimiento para todos los carnets?');
            if (confirmation) {
                localStorage.setItem('fechaVencimientoCarnet', this.value);
                
                // Mostrar notificación de éxito
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>Fecha de vencimiento actualizada</span>
                `;
                document.querySelector('.contenedor-carnetizacion').appendChild(notification);
                
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            } else {
                // Restaurar el valor anterior si el usuario cancela
                const fechaAnterior = localStorage.getItem('fechaVencimientoCarnet') || '';
                this.value = fechaAnterior;
            }
        }
    });
    
    // Llamar a la función para cargar los periodos al cargar la página
    cargarPeriodosAcademicos();
    
    // Estilos para las notificaciones
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            opacity: 1;
            transition: opacity 0.3s ease;
        }
        .notification.success {
            background-color: #4CAF50;
        }
        .notification.error {
            background-color: #F44336;
        }
        .notification i {
            font-size: 18px;
        }
        .fade-out {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
});