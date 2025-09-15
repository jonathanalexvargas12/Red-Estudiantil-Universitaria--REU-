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
        console.log('Rol recibido:', data.role);

        // Guardar el token y el rol en localStorage (parte existente)
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // NUEVO: Guardar los datos completos del usuario si vienen en la respuesta
        if (data.user) {
            localStorage.setItem('userData', JSON.stringify(data.user));
            console.log('Datos de usuario guardados:', data.user);
        }

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

        alert('Inicio de sesión exitoso');
        window.location.href = '/atssets/html/inicio.html'; // Redirigir a inicio.html
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el servidor');
    }
});