// Inyectar el aviso de que la sesion expirará en todas las páginas
document.addEventListener('DOMContentLoaded', function() {
    const warningHTML = `
        <div id="session-warning">
            <p>La sesión expirará pronto</p>
            <button id="extend-session">Extender sesión</button>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', warningHTML);
});