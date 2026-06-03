// Este archivo maneja la lógica del formulario de login en el frontend.
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario se envíe de manera tradicional

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }

        const data = await response.json();
        console.log('Token recibido:', data.token);
        console.log('Usuario Identificado:', data.userId);
        console.log('Rol recibido:', data.role);
        console.log('Datos recibidos:', data.userData);

        // Guardar el token y el rol en localStorage (parte existente)
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userData', JSON.stringify(data.userData));

        // Obtener la IP del usuario
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIp = ipData.ip;
        localStorage.setItem('userIp', userIp);
        console.log('IP del usuario:', userIp);

        // Obtener fecha y hora actual con formato específico
        const now = new Date();
        const loginTime = now.toLocaleTimeString('es-ES');
        
        // Formatear fecha como yyyy/mm/dd
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const loginDate = `${year}/${month}/${day}`;
        
        localStorage.setItem('loginTime', loginTime);
        localStorage.setItem('loginDate', loginDate);
        
        console.log('Hora de inicio de sesión:', loginTime);
        console.log('Fecha de inicio de sesión (yyyy/mm/dd):', loginDate);

        // Registrar la acción del usuario
        const userAction = 'Inicio de Sesión';
        localStorage.setItem('userAction', userAction);
        console.log('Acción del usuario:', userAction);

        // Parte existente de rutas permitidas
        const routesResponse = await fetch('/auth/allowed-routes', {
            headers: {
                'Authorization': `Bearer ${data.token}`,
            },
        });

        if (!routesResponse.ok) {
            const errorData = await routesResponse.json();
            console.error('Error del servidor:', errorData);
            throw new Error('Error al obtener las rutas permitidas');
        }

        const routesData = await routesResponse.json();
        console.log('Rutas permitidas recibidas:', routesData.allowedRoutes);

        // Guardar las rutas permitidas en localStorage (parte existente)
        localStorage.setItem('allowedRoutes', JSON.stringify(routesData.allowedRoutes));

        // Enviar datos a la bitácora
        const bitacoraResponse = await fetch('/auth/registrar-bitacora', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({
                hora: localStorage.getItem('loginTime'),
                fecha: localStorage.getItem('loginDate'),
                ip: localStorage.getItem('userIp'),
                usuario: localStorage.getItem('userId'),
                accion: localStorage.getItem('userAction')
            })
        });

        if (!bitacoraResponse.ok) {
            console.error('Error al registrar en bitácora:', await bitacoraResponse.text());
        } else {
            console.log('Registro de bitácora exitoso');
        }

        // --- ALERTA ESTILIZADA DE ÉXITO ---
        const successAlert = document.createElement('div');
        successAlert.textContent = 'Inicio de sesión exitoso';
        successAlert.style.position = 'fixed';
        successAlert.style.top = '30px';
        successAlert.style.left = '50%';
        successAlert.style.transform = 'translateX(-50%)';
        successAlert.style.background = '#43a047';
        successAlert.style.color = '#fff';
        successAlert.style.padding = '16px 32px';
        successAlert.style.borderRadius = '8px';
        successAlert.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        successAlert.style.fontSize = '18px';
        successAlert.style.zIndex = '9999';
        document.body.appendChild(successAlert);
        setTimeout(() => {
            successAlert.remove();
            window.location.href = '/assets/html/inicio.html'; // Redirigir a inicio.html
        }, 1800);
    } catch (error) {
        console.error('Error:', error);

        // --- ALERTA ESTILIZADA DE ERROR ---
        const errorAlert = document.createElement('div');
        errorAlert.textContent = 'Error en el servidor';
        errorAlert.style.position = 'fixed';
        errorAlert.style.top = '30px';
        errorAlert.style.left = '50%';
        errorAlert.style.transform = 'translateX(-50%)';
        errorAlert.style.background = '#c62828';
        errorAlert.style.color = '#fff';
        errorAlert.style.padding = '16px 32px';
        errorAlert.style.borderRadius = '8px';
        errorAlert.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        errorAlert.style.fontSize = '18px';
        errorAlert.style.zIndex = '9999';
        document.body.appendChild(errorAlert);
        setTimeout(() => errorAlert.remove(), 2500);
    }
});