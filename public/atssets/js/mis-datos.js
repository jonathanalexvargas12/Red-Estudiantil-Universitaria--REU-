document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    const userDataLocal = localStorage.getItem('userData');
    
    if (!token) {
        alert('Debes iniciar sesión para ver esta página');
        window.location.href = '/atssets/html/login.html';
        return;
    }

    // 2. Intentar obtener datos actualizados del backend
    try {
        const response = await fetch('/api/usuario/datos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener datos actualizados');
        }

        const userData = await response.json();
        mostrarDatosUsuario(userData);
        
        // Actualizar localStorage con los datos más recientes
        localStorage.setItem('userData', JSON.stringify(userData));

    } catch (error) {
        console.error('Error al obtener datos del servidor:', error);
        
        // 3. Fallback: usar datos de localStorage si hay
        if (userDataLocal) {
            try {
                const userData = JSON.parse(userDataLocal);
                mostrarDatosUsuario(userData);
                console.log('Mostrando datos desde localStorage');
            } catch (parseError) {
                console.error('Error al parsear datos locales:', parseError);
                mostrarError();
            }
        } else {
            mostrarError();
        }
    }

    function mostrarDatosUsuario(user) {
        // Mapeo de campos de la base de datos al formulario
        const fieldMap = {
            'cedula': 'Cedula',
            'nombres': 'Nombres',
            'apellidos': 'Apellidos',
            'direccion': 'Direccion_Residencial',
            'telefono1': 'Telefono_1',
            'telefono2': 'Telefono_2',
            'correo': 'Correo',
            'usuario': 'ID_Usuario' // Usamos ID_Usuario para el campo de usuario
        };

        // Llenar campos del formulario
        Object.entries(fieldMap).forEach(([fieldId, userKey]) => {
            const element = document.getElementById(fieldId);
            if (element) element.value = user[userKey] || '';
        });

        // Configurar el rol - Mapeo de roles a checkboxes
        const rolesMap = {
            'Administrador': 'rol-administrador',
            'Docente': 'rol-profesor', // Asumiendo que 'Docente' equivale a 'profesor' en el HTML
            'Estudiante': 'rol-estudiante',
            'Control_Estudio': 'rol-control-estudio',
            'Tutor_Externo': 'rol-tutor-externo',
            'Administrativo': 'rol-administrativo'
        };

        // Desmarcar todos los checkboxes primero
        document.querySelectorAll('input[name="rol"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Marcar el checkbox correspondiente al rol del usuario
        if (user.Rol && rolesMap[user.Rol]) {
            const roleCheckbox = document.getElementById(rolesMap[user.Rol]);
            if (roleCheckbox) {
                roleCheckbox.checked = true;
            } else {
                console.warn(`No se encontró checkbox para el rol: ${user.Rol}`);
            }
        } else {
            console.warn('Rol no definido o no mapeado:', user.Rol);
        }
    }

    function mostrarError() {
        alert('No se pudieron cargar los datos del usuario');
        // Opcional: redirigir o mostrar un estado alternativo
    }
});