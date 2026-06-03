function validateRoute() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('userId');
    const dataStr = localStorage.getItem('userData');
    const data = dataStr ? JSON.parse(dataStr) : null;
    const allowedRoutes = JSON.parse(localStorage.getItem('allowedRoutes')) || [];

    console.log('Token almacenado:', token);
    console.log('Usuario autenticado y con acceso permitido.');
    console.log('Usuario identificado:', user);
    console.log('Rol almacenado:', role);
    console.log('Datos almacenados:', data);
    console.log('Rutas permitidas:', allowedRoutes);

    // Si no hay token, rol o rutas permitidas, redirigir al login
    if (!token || !role || allowedRoutes.length === 0) {
        console.log('No se encontró token, rol o rutas permitidas en localStorage.');
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = '/index.html';
        return;
    }

    // Obtener la ruta actual
    const currentRoute = window.location.pathname.split('/').pop();

    // Verificar si la ruta actual está permitida
    if (!allowedRoutes.includes(currentRoute)) {
        console.log('Ruta no permitida:', currentRoute);
        alert('No tienes permiso para acceder a esta página.');
        window.location.href = '/assets/html/inicio.html'; // Redirigir al inicio
        return;
    }
}


// Función para mostrar el userId en el elemento con ID "username"
function displayUsername() {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        const userId = localStorage.getItem('userId');
        if (userId) {
            usernameElement.textContent = userId; // Mostrar el userId en el HTML
        }
    }
}

// Verificar la ruta y mostrar el usuario al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    validateRoute();
    displayUsername(); // Llamamos a la nueva función aquí
});