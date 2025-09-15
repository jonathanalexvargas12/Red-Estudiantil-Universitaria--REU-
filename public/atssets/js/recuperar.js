const formRecuperarCorreo = document.getElementById('form-recuperar-correo');
formRecuperarCorreo.addEventListener('submit', (event) => {
    event.preventDefault();
   
    const correo = document.getElementById('correo-recuperacion').value;
    const mensajeCorreo = document.getElementById('mensaje-correo');

    //Aquí iría la lógica para enviar el correo y mostrar el mensaje
    mensajeCorreo.textContent = "Mensaje enviado. Revisa tu bandeja de entrada o spam.";
    //Redirección a la siguiente página.
    //window.location.href="verificar-codigo.html";
});


const formVerificarCodigo = document.getElementById('form-verificar-codigo');
formVerificarCodigo.addEventListener('submit', (event) => {
    event.preventDefault();
    const codigo = document.getElementById('codigo-verificacion').value;
    const mensajeCodigo = document.getElementById('mensaje-codigo');
    //Aquí iría la lógica para verificar el código y mostrar el mensaje
    mensajeCodigo.textContent = "Código verificado.";
    //Redirección a la siguiente página.
    //window.location.href="nueva-contrasena.html";
});

const formNuevaContrasena = document.getElementById('form-nueva-contrasena');
formNuevaContrasena.addEventListener('submit', (event) => {
    event.preventDefault();
    const nuevaContrasena = document.getElementById('nueva-contrasena').value;
    const confirmarContrasena = document.getElementById('confirmar-contrasena').value;
    const mensajeContrasena = document.getElementById('mensaje-contrasena');
    if (nuevaContrasena === confirmarContrasena) {
        mensajeContrasena.textContent = "Contraseña cambiada con éxito. Redirigiendo...";
        //Aquí iría la lógica para guardar la contraseña en la base de datos
        //Redirección a login.html
        //window.location.href = "login.html";
    } else {
        mensajeContrasena.textContent = "Las contraseñas no coinciden.";
    }

});
