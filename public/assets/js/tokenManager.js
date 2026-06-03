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

// Mostrar alerta estilizada y creativa
function showStyledAlert(message, color = '#222', callback, isConfirm = false) {
    // Eliminar cualquier alerta previa
    const prev = document.getElementById('styled-alert-reu');
    if (prev) prev.remove();

    const alertDiv = document.createElement('div');
    alertDiv.id = 'styled-alert-reu';
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '30px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.background = color;
    alertDiv.style.color = '#fff';
    alertDiv.style.padding = '22px 38px';
    alertDiv.style.borderRadius = '16px';
    alertDiv.style.boxShadow = '0 6px 24px 0 rgba(0,0,0,0.18)';
    alertDiv.style.fontSize = '18px';
    alertDiv.style.zIndex = '10000';
    alertDiv.style.textAlign = 'center';
    alertDiv.style.maxWidth = '95vw';
    alertDiv.style.letterSpacing = '0.5px';
    alertDiv.style.border = '2px solid #fff';
    alertDiv.style.animation = 'pop-in-reu 0.4s cubic-bezier(.68,-0.55,.27,1.55)';

    // Iconos según el tipo de alerta
    let icon = '';
    if (color === '#43a047') { // Verde éxito
        icon = '✅';
        alertDiv.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
        alertDiv.style.color = '#222';
        alertDiv.style.border = '2px solid #43a047';
    } else if (color === '#c62828') { // Rojo error
        icon = '❌';
        alertDiv.style.background = 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)';
        alertDiv.style.color = '#fff';
        alertDiv.style.border = '2px solid #c62828';
    } else if (color === '#fbc02d') { // Amarillo advertencia
        icon = '⚠️';
        alertDiv.style.background = 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)';
        alertDiv.style.color = '#222';
        alertDiv.style.border = '2px solid #fbc02d';
    } else { // Por defecto
        icon = 'ℹ️';
        alertDiv.style.background = 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)';
        alertDiv.style.color = '#fff';
        alertDiv.style.border = '2px solid #185a9d';
    }

    alertDiv.innerHTML = `<span style="font-size:2em;display:block;margin-bottom:8px;">${icon}</span>${message}`;

    if (isConfirm) {
        const btnYes = document.createElement('button');
        btnYes.textContent = 'Extender sesión';
        btnYes.style.margin = '16px 12px 0 0';
        btnYes.style.padding = '10px 28px';
        btnYes.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
        btnYes.style.color = '#222';
        btnYes.style.fontWeight = 'bold';
        btnYes.style.border = 'none';
        btnYes.style.borderRadius = '6px';
        btnYes.style.cursor = 'pointer';
        btnYes.style.fontSize = '16px';
        btnYes.style.boxShadow = '0 2px 8px rgba(67,233,123,0.15)';
        btnYes.onmouseover = () => btnYes.style.background = '#43a047';
        btnYes.onmouseout = () => btnYes.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
        btnYes.onclick = () => {
            alertDiv.remove();
            if (callback) callback(true);
        };

        const btnNo = document.createElement('button');
        btnNo.textContent = 'Cerrar sesión';
        btnNo.style.margin = '16px 0 0 0';
        btnNo.style.padding = '10px 28px';
        btnNo.style.background = 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)';
        btnNo.style.color = '#fff';
        btnNo.style.fontWeight = 'bold';
        btnNo.style.border = 'none';
        btnNo.style.borderRadius = '6px';
        btnNo.style.cursor = 'pointer';
        btnNo.style.fontSize = '16px';
        btnNo.style.boxShadow = '0 2px 8px rgba(255,88,88,0.15)';
        btnNo.onmouseover = () => btnNo.style.background = '#c62828';
        btnNo.onmouseout = () => btnNo.style.background = 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)';
        btnNo.onclick = () => {
            alertDiv.remove();
            if (callback) callback(false);
        };

        alertDiv.appendChild(document.createElement('br'));
        alertDiv.appendChild(btnYes);
        alertDiv.appendChild(btnNo);
    }

    // Animación CSS
    if (!document.getElementById('pop-in-reu-style')) {
        const style = document.createElement('style');
        style.id = 'pop-in-reu-style';
        style.innerHTML = `
        @keyframes pop-in-reu {
            0% { transform: translateX(-50%) scale(0.7); opacity: 0; }
            80% { transform: translateX(-50%) scale(1.05); opacity: 1; }
            100% { transform: translateX(-50%) scale(1); }
        }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(alertDiv);

    if (!isConfirm) {
        setTimeout(() => {
            alertDiv.remove();
            if (callback) callback && callback();
        }, 2500);
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

        // Si quedan 2 minutos o menos, mostrar la alerta estilizada de confirmación
        if (timeLeft <= 120) {
            showStyledAlert(
                'Tu sesión está a punto de expirar.<br>¿Deseas extenderla?',
                '#fbc02d',
                (extendSession) => {
                    if (extendSession) {
                        extendSessionTime();
                    } else {
                        localStorage.removeItem('token');
                        localStorage.removeItem('role');
                        window.location.href = '/index.html';
                    }
                },
                true
            );
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
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            showStyledAlert('Sesión extendida con éxito.', '#43a047');
        } else {
            throw new Error('Error al extender la sesión');
        }
    } catch (error) {
        showStyledAlert('No se pudo extender la sesión. Por favor, inicia sesión nuevamente.', '#c62828', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/index.html';
        });
    }
}

// --- Interceptor global de fetch: Silent Refresh en 401 ---
(function setupFetchInterceptor() {
    const originalFetch = window.fetch;
    let isRefreshing = false;

    window.fetch = async function (...args) {
        const response = await originalFetch(...args);

        if (response.status !== 401) {
            return response;
        }

        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        if (!url || url.includes('/auth/refresh-token') || url.includes('/auth/login')) {
            return response;
        }

        if (isRefreshing) {
            return response;
        }
        isRefreshing = true;

        try {
            const refreshRes = await originalFetch('/auth/refresh-token', { method: 'POST' });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                localStorage.setItem('token', data.token);

                const newArgs = Array.isArray(args) ? [...args] : [args];
                const reqInit = typeof newArgs[1] === 'object' && newArgs[1] ? { ...newArgs[1] } : {};
                const headers = new Headers(reqInit.headers || {});
                headers.set('Authorization', `Bearer ${data.token}`);
                reqInit.headers = headers;
                newArgs[1] = reqInit;

                isRefreshing = false;
                return originalFetch(newArgs[0], newArgs[1]);
            }

            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('allowedRoutes');
            isRefreshing = false;
            window.location.href = '/index.html';
            return response;
        } catch (e) {
            isRefreshing = false;
            return response;
        }
    };
})();

// Verificar la expiración del token al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    if (isTokenExpired()) {
        // Intentar refresh silencioso antes de mostrar alerta
        try {
            const refreshRes = await fetch('/auth/refresh-token', { method: 'POST' });
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                localStorage.setItem('token', data.token);
                return;
            }
        } catch (_) {}

        showStyledAlert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', '#c62828', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/index.html';
        });
    }

    // --- Pie de página REU ---
    if (!document.getElementById('reu-footer')) {
        const footer = document.createElement('div');
        footer.id = 'reu-footer';
        footer.style.position = 'fixed';
        footer.style.left = '0';
        footer.style.right = '0';
        footer.style.bottom = '0';
        footer.style.width = '100%';
        footer.style.background = '#222';
        footer.style.color = '#fff';
        footer.style.textAlign = 'center';
        footer.style.padding = '6px 0';
        footer.style.fontSize = '12px';
        footer.style.zIndex = '9999';
        footer.innerHTML = `© Red Estudiantil Universitaria "REU", si desea obtener más información haga click <a href="https://reu2.webnode.com.ve/" target="_blank" style="color:#4FC3F7;text-decoration:underline;">aquí</a>`;
        document.body.appendChild(footer);
    }
});