window.addEventListener('pageshow', function(event) {
    // Verifica si la página se está cargando desde el caché
    if (event.persisted) {
        // Verifica si el usuario está autenticado (token y role presentes)
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || !role) {
            // Si no hay token o role, redirige al usuario a la página de inicio de sesión
            window.location.href = '/index.html';
        } else {
            // Si hay token y role, recarga la página para asegurar que esté actualizada
            window.location.reload();
        }
    }
});