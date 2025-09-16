document.addEventListener('DOMContentLoaded', () => {
    const cambiarContrasenaForm = document.querySelector('.contenedor-cambiar-contrasena');
    const btnGuardar = cambiarContrasenaForm.querySelector('button');
    
    btnGuardar.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const nuevaContrasena = document.getElementById('nueva-contrasena').value;
        const repetirContrasena = document.getElementById('repetir-contrasena').value;
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        // Validaciones
        if (!nuevaContrasena || !repetirContrasena) {
            mostrarAlerta('Por favor complete todos los campos', 'error');
            return;
        }
        
        if (nuevaContrasena !== repetirContrasena) {
            mostrarAlerta('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (nuevaContrasena.length < 8) {
            mostrarAlerta('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        
        try {
            // Mostrar loader
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            
            // Enviar la contraseña en texto plano (sin encriptar)
            const response = await fetch(`/api/usuarios/cambiar-contrasena-plana/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    nuevaContrasenaPlana: nuevaContrasena // Cambiado el nombre del campo para ser explícito
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al cambiar la contraseña');
            }
            
            mostrarAlerta('Contraseña cambiada exitosamente. Será redirigido para iniciar sesión.', 'success');
            
            // Cerrar sesión después de 3 segundos
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/index.html';
            }, 3000);
            
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta(error.message || 'Error al cambiar la contraseña', 'error');
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar Contraseña';
        }
    });
    
    function mostrarAlerta(mensaje, tipo) {
        // Limpiar alertas anteriores
        const alertaAnterior = document.querySelector('.custom-alert');
        if (alertaAnterior) {
            alertaAnterior.remove();
        }
        
        const alerta = document.createElement('div');
        alerta.className = `custom-alert ${tipo}`;
        alerta.innerHTML = `
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${mensaje}</span>
        `;
        
        document.body.appendChild(alerta);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            alerta.remove();
        }, 5000);
    }
});