const API = '/auth';

const formRecuperarCorreo = document.getElementById('form-recuperar-correo');
if (formRecuperarCorreo) {
    formRecuperarCorreo.addEventListener('submit', async (event) => {
        event.preventDefault();
        const correo = document.getElementById('correo-recuperacion').value;
        const mensaje = document.getElementById('mensaje-correo');
        const btn = formRecuperarCorreo.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Enviando...';
        try {
            const resp = await fetch(`${API}/solicitar-recuperacion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });
            const data = await resp.json();
            mensaje.textContent = data.message || 'Si el correo existe, recibirás un código.';
            mensaje.style.color = '#28a745';
            if (resp.ok) {
                localStorage.setItem('recoveryCorreo', correo);
                setTimeout(() => window.location.href = 'verificar-codigo.html', 2000);
            } else {
                mensaje.style.color = '#dc3545';
            }
        } catch {
            mensaje.textContent = 'Error de conexión. Intente de nuevo.';
            mensaje.style.color = '#dc3545';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Enviar Código';
        }
    });
}

const formVerificarCodigo = document.getElementById('form-verificar-codigo');
if (formVerificarCodigo) {
    const correo = localStorage.getItem('recoveryCorreo');
    if (!correo) window.location.href = 'recuperar-correo.html';

    formVerificarCodigo.addEventListener('submit', async (event) => {
        event.preventDefault();
        const codigo = document.getElementById('codigo-verificacion').value;
        const mensaje = document.getElementById('mensaje-codigo');
        const btn = formVerificarCodigo.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Verificando...';
        try {
            const resp = await fetch(`${API}/verificar-codigo-recuperacion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, codigo })
            });
            const data = await resp.json();
            if (resp.ok && data.token) {
                localStorage.setItem('recoveryToken', data.token);
                localStorage.setItem('recoveryCodigo', codigo);
                mensaje.textContent = 'Código verificado. Redirigiendo...';
                mensaje.style.color = '#28a745';
                setTimeout(() => window.location.href = 'nueva-contrasena.html', 1500);
            } else {
                mensaje.textContent = data.message || 'Código inválido o expirado.';
                mensaje.style.color = '#dc3545';
            }
        } catch {
            mensaje.textContent = 'Error de conexión.';
            mensaje.style.color = '#dc3545';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Verificar Código';
        }
    });
}

const formNuevaContrasena = document.getElementById('form-nueva-contrasena');
if (formNuevaContrasena) {
    const correo = localStorage.getItem('recoveryCorreo');
    const codigo = localStorage.getItem('recoveryCodigo');
    const token = localStorage.getItem('recoveryToken');
    if (!correo || !codigo || !token) window.location.href = 'recuperar-correo.html';

    formNuevaContrasena.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nueva = document.getElementById('nueva-contrasena').value;
        const confirmar = document.getElementById('confirmar-contrasena').value;
        const mensaje = document.getElementById('mensaje-contrasena');
        if (nueva !== confirmar) {
            mensaje.textContent = 'Las contraseñas no coinciden.';
            mensaje.style.color = '#dc3545';
            return;
        }
        const btn = formNuevaContrasena.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Guardando...';
        try {
            const resp = await fetch(`${API}/cambiar-contrasena-recuperacion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, codigo, token, nuevaContrasena: nueva })
            });
            const data = await resp.json();
            if (resp.ok) {
                mensaje.textContent = 'Contraseña cambiada con éxito. Redirigiendo...';
                mensaje.style.color = '#28a745';
                localStorage.removeItem('recoveryCorreo');
                localStorage.removeItem('recoveryCodigo');
                localStorage.removeItem('recoveryToken');
                setTimeout(() => window.location.href = '/index.html', 2000);
            } else {
                mensaje.textContent = data.message || 'Error al cambiar la contraseña.';
                mensaje.style.color = '#dc3545';
            }
        } catch {
            mensaje.textContent = 'Error de conexión.';
            mensaje.style.color = '#dc3545';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Guardar Contraseña';
        }
    });
}
