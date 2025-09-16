// Función para registrar cierre de sesión en bitácora
async function registrarCierreSesion() {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) return;

        // Actualizar la hora justo antes de enviar a bitácora
        const now = new Date();
        const logoutTime = now.toLocaleTimeString('es-ES');
        localStorage.setItem('loginTime', logoutTime);

        const bitacoraData = {
            hora: logoutTime, // Usamos la hora recién actualizada
            fecha: localStorage.getItem('loginDate'),
            ip: localStorage.getItem('userIp'),
            usuario: localStorage.getItem('userId'),
            accion: 'Cierre de Sesión'
        };

        // Verificar que tenemos todos los datos necesarios
        if (!bitacoraData.ip || !bitacoraData.usuario) {
            console.warn('Datos insuficientes para registrar cierre de sesión');
            return;
        }

        const response = await fetch('/auth/registrar-bitacora', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bitacoraData)
        });

        if (!response.ok) {
            console.error('Error al registrar cierre de sesión en bitácora:', await response.text());
        }
    } catch (error) {
        console.error('Error al registrar cierre de sesión:', error);
    }
}

// Función que se ejecuta para limpiar el localStorage y registrar el cierre
async function checkAndClearLocalStorage() {
    try {
        // Primero registramos el cierre de sesión
        await registrarCierreSesion();
        
        // Luego limpiamos todos los datos
        const itemsToRemove = [
            'token', 'role', 'userId', 'userData', 
            'userIp', 'loginTime', 'loginDate', 'userAction',
            'allowedRoutes'
        ];

        itemsToRemove.forEach(item => {
            if (localStorage.getItem(item)) {
                localStorage.removeItem(item);
                console.log(`${item} eliminado.`);
            }
        });
    } catch (error) {
        console.error('Error al limpiar sesión:', error);
    }
}

// Ejecuta la función cuando la página se carga por primera vez
window.onload = checkAndClearLocalStorage;

// Ejecuta la función cuando la página se muestra desde el caché (retroceso o avance)
window.addEventListener('pageshow', function(event) {
    // Verifica si la página se está cargando desde el caché
    if (event.persisted) {
        checkAndClearLocalStorage();
    }
});