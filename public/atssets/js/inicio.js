// Ventana modal de incripciones por cobrar

document.addEventListener('DOMContentLoaded', () => {
    const cardInscripcionesCobrar = document.getElementById('card-inscripciones-cobrar');
    const modalOverlay = document.getElementById('modal-overlay-inscripciones-cobrar');
    const modalClose = document.getElementById('modal-close-inscripciones-cobrar');

    cardInscripcionesCobrar.addEventListener('click', () => {
        modalOverlay.style.display = 'flex';
    });

    modalClose.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
    });

    // Cerrar el modal al hacer clic fuera del contenido
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
});
