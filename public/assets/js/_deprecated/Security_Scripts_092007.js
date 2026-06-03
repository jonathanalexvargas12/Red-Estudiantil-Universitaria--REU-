//En este archiivo se aplicaran las medidas de seguridad del sistema y sus proximas versiones

document.addEventListener('DOMContentLoaded', function() {
    // Verificar el rol en localStorage
    const userRole = localStorage.getItem('role');
    // Si el rol no es "Administrador", aplicar restricciones
    if (userRole !== 'Administrador') {
        // ===== BLOQUEO DE TECLADO =====
        //Bloquear atajos de teclado para abrir la consola
        document.addEventListener('keydown', function(e) {
            const key = e.key.toLowerCase();
            const code = e.code;
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            // Lista de todos los atajos conocidos 
            const blockedShortcuts = [
                // Atajos universales
                code === 'F12',
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyI' || key === 'i'), // Ctrl+Shift+I
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyJ' || key === 'j'), // Ctrl+Shift+J
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyC' || key === 'c'), // Ctrl+Shift+C
                (e.ctrlKey || e.metaKey) && (code === 'KeyU' || key === 'u'), // Ctrl+U
                (e.ctrlKey || e.metaKey) && e.altKey && (code === 'KeyI' || key === 'i'), // Ctrl+Alt+I
                // Firefox y Edge
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyK' || key === 'k'), // Ctrl+Shift+K (Firefox)
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyE' || key === 'e'), // Ctrl+Shift+E (Edge)
                // Mac (Safari/Chrome)
                isMac && e.altKey && key === '¿', // Cmd+Alt+¿ (Mac español)
                isMac && e.metaKey && e.altKey && (code === 'KeyI' || key === 'i'), // Cmd+Alt+I
                // Atajos raros pero existentes
                code === 'F8', // Pausa en algunos navegadores
                (e.ctrlKey && code === 'Backquote') || (e.metaKey && code === 'Backquote') // Ctrl+` o Cmd+`
            ];
            //Mostrar la alerta cuando algun atajo de la lista es introducido
            if (blockedShortcuts.some(shortcut => shortcut)) {
                e.preventDefault();
                alert('⚠️ Acceso restringido: No tienes permisos para usar herramientas de desarrollo.');
                return false;
            }
        });
        // ===== BLOQUEO DE RATÓN =====
        // Bloquear clic derecho
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        // Bloquear Shift + Clic derecho (menú "Inspeccionar" en Chrome)
        document.addEventListener('mousedown', function(e) {
            if (e.button === 2 && e.shiftKey) {
                e.preventDefault();
                alert('⚠️ No esta permitido abrir el inspector con Shift + Clic derecho.');
            }
        });
        // ===== BLOQUEO DE EVENTOS DE CONSOLA =====
        // Evitar que se abra la consola mediante inyección de código (pendiente por probar)
        console.log = function() {};
        console.warn = function() {};
        console.error = function() {};
        console.clear = function() {};
    }
});