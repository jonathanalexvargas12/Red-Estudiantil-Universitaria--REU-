// Función que se ejecuta para eliminar el token y el role del localStorage
        function checkAndClearLocalStorage() {
            // Verifica si existe un token en el localStorage
            if (localStorage.getItem('token')) {
                // Si existe, lo elimina
                localStorage.removeItem('token');
                console.log('Token eliminado.');
            }
    
            // Verifica si existe un item 'role' en el localStorage
            if (localStorage.getItem('role')) {
                // Si existe, lo elimina
                localStorage.removeItem('role');
                console.log('Rol eliminado.');
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