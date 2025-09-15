document.addEventListener('DOMContentLoaded', () => {
    console.log('Cargando datos del usuario...');

    // 1. Obtener datos del localStorage
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const userDataStr = localStorage.getItem('userData');
    
    try {
        // 2. Validar que existan los datos necesarios
        if (!userId || !role || !userDataStr) {
            throw new Error('Datos de usuario no encontrados. Por favor, inicie sesión nuevamente.');
        }

        const userData = JSON.parse(userDataStr);
        console.log('Datos del usuario obtenidos:', { userId, role, userData });

        // 3. Actualizar los campos del formulario
        document.getElementById('cedula').value = userData.Cedula || 'No disponible';
        document.getElementById('nombres').value = userData.Nombres || 'No disponible';
        document.getElementById('apellidos').value = userData.Apellidos || 'No disponible';
        document.getElementById('direccion').value = userData.Direccion || 'No disponible';
        document.getElementById('telefono1').value = userData.Telefono_1 || 'No disponible';
        document.getElementById('telefono2').value = userData.Telefono_2 || 'No disponible';
        document.getElementById('correo').value = userData.Correo || 'No disponible';
        document.getElementById('usuario').value = userId || 'No disponible'; // Usamos el userId del localStorage

        // 4. Marcar el checkbox del rol correspondiente
        const roleCheckboxId = `rol-${role.toLowerCase().replace(/_/g, '-')}`;
        const roleCheckbox = document.getElementById(roleCheckboxId);
        
        if (roleCheckbox) {
            roleCheckbox.checked = true;
            console.log(`Rol ${role} marcado correctamente`);
        } else {
            console.warn(`No se encontró checkbox para el rol: ${role}`);
        }

        // 5. Actualizar el nombre de usuario en el menú (si existe el elemento)
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = userData.Nombres || userId;
        }

        console.log('Formulario actualizado exitosamente');

    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        alert(error.message);
        
        // Redirigir al login si no hay datos válidos
        if (error.message.includes('iniciar sesión')) {
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        }
    }
});