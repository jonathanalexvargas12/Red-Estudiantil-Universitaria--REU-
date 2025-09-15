//Este modulo da seguimiento al ciclo de vida del token
function isTokenExpired() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No se encontró ningún token en localStorage.');
        return true;
    }

    try {
        const decodedToken = jwt_decode(token);
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos
        const marginOfError = 60; // 1 minuto de margen de error

        console.log('Tiempo actual:', new Date(currentTime * 1000));
        console.log('Tiempo de expiración del token:', new Date(decodedToken.exp * 1000));

        return decodedToken.exp + marginOfError < currentTime;
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return true;
    }
}

// Verificar la expiración del token y mostrar alerta
function checkTokenExpiration() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const decodedToken = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        const timeLeft = decodedToken.exp - currentTime;

        console.log('Tiempo restante para la expiración del token:', timeLeft, 'segundos');

        // Si quedan 2 minutos o menos, mostrar la alerta
        if (timeLeft <= 120) {
            const extendSession = confirm('Tu sesión está a punto de expirar. ¿Deseas extenderla?');
            if (extendSession) {
                extendSessionTime();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                window.location.href = '/index.html';
            }
        }
    } catch (error) {
        console.error('Error al verificar la expiración del token:', error);
    }
}

// Extender la sesión generando un nuevo token
async function extendSessionTime() {
    try {
        const response = await fetch('/auth/refresh-token', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Actualizar el token
            alert('Sesión extendida con éxito.');
        } else {
            throw new Error('Error al extender la sesión');
        }
    } catch (error) {
        console.error('Error al extender la sesión:', error);
        alert('No se pudo extender la sesión. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/index.html';
    }
}

// Verificar la expiración del token al cargar la página y cada minuto
document.addEventListener('DOMContentLoaded', () => {
    if (isTokenExpired()) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/index.html';
    } else {
        checkTokenExpiration(); // Verificar si el token está a punto de expirar
        setInterval(checkTokenExpiration, 60000); // Verificar cada minuto
    }
});