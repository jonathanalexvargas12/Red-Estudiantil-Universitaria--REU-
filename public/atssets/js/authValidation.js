function validateRoute() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const allowedRoutes = JSON.parse(localStorage.getItem('allowedRoutes')) || [];

    console.log('Token almacenado:', token);
    console.log('Rol almacenado:', role);
    console.log('Rutas permitidas:', allowedRoutes);

    // Si no hay token, rol o rutas permitidas, redirigir al login
    if (!token || !role || allowedRoutes.length === 0) {
        console.log('No se encontró token, rol o rutas permitidas en localStorage.');
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = '/index.html';
        return;
    }

    // Obtener la ruta actual (por ejemplo, 'calificar-asignaturas.html')
    const currentRoute = window.location.pathname.split('/').pop();

    // Verificar si la ruta actual está permitida
    if (!allowedRoutes.includes(currentRoute)) {
        console.log('Ruta no permitida:', currentRoute);
        alert('No tienes permiso para acceder a esta página.');
        window.location.href = '/atssets/html/inicio.html'; // Redirigir al inicio
        return;
    }

    console.log('Usuario autenticado y con acceso permitido.');
}

// Verificar la ruta al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    validateRoute();
});