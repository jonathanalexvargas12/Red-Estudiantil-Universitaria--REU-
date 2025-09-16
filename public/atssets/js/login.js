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

        alert('Inicio de sesión exitoso');
        window.location.href = '/atssets/html/inicio.html'; // Redirigir a inicio.html
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el servidor');
    }
});