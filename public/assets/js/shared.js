// Shared app initialization: header injection, auth validation, security, session warning
document.addEventListener('DOMContentLoaded', async function() {

    // 1. Inject header from shared header.html
    try {
        const resp = await fetch('../html/header.html');
        const html = await resp.text();
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) placeholder.innerHTML = html;
    } catch (e) {
        console.warn('Error al cargar el header compartido:', e);
    }

    // 1b. Ocultar tarjetas y submenús del header según rol
    const allowedRoutes = JSON.parse(localStorage.getItem('allowedRoutes')) || [];
    setTimeout(() => {
        // Tarjetas en principal-*.html
        document.querySelectorAll('.tarjeta').forEach(el => {
            const page = el.getAttribute('href');
            if (page && !allowedRoutes.includes(page)) {
                el.style.display = 'none';
            }
        });

        // Submenús del header — ocultar los que el rol no puede usar
        document.querySelectorAll('#header-placeholder nav li > ul > li > a[href]').forEach(a => {
            const page = a.getAttribute('href');
            if (!page || page.startsWith('/') ||
                page === 'inicio.html' || page === 'mis-datos.html' || page === 'cambiar-contrasena.html') {
                return;
            }
            if (!allowedRoutes.includes(page)) {
                a.closest('li').style.display = 'none';
            }
        });

        // Ocultar categorías del header que quedaron vacías
        document.querySelectorAll('#header-placeholder nav > ul > li').forEach(li => {
            const subUl = li.querySelector('ul');
            if (subUl) {
                const visibles = subUl.querySelectorAll('li:not([style*="display: none"])');
                if (visibles.length === 0) li.style.display = 'none';
            }
        });
    }, 50);

    // 2. Route validation from localStorage
    function validateRoute() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const user = localStorage.getItem('userId');
        const dataStr = localStorage.getItem('userData');
        const data = dataStr ? JSON.parse(dataStr) : null;
        if (!token || !role || allowedRoutes.length === 0) {
            window.location.href = '/index.html';
            return;
        }
        const currentRoute = window.location.pathname.split('/').pop();
        if (!allowedRoutes.includes(currentRoute)) {
            window.location.href = '/assets/html/inicio.html';
        }
    }

    // 3. Display username in header
    function displayUsername() {
        const el = document.getElementById('username');
        const userId = localStorage.getItem('userId');
        if (el && userId) el.textContent = userId;
    }

    validateRoute();
    displayUsername();

    // 4. Security restrictions for non-admin users
    const userRole = localStorage.getItem('role');
    if (userRole !== 'Administrador') {
        document.addEventListener('keydown', function(e) {
            const key = e.key.toLowerCase();
            const code = e.code;
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const blockedShortcuts = [
                code === 'F12',
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyI' || key === 'i'),
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyJ' || key === 'j'),
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyC' || key === 'c'),
                (e.ctrlKey || e.metaKey) && (code === 'KeyU' || key === 'u'),
                (e.ctrlKey || e.metaKey) && e.altKey && (code === 'KeyI' || key === 'i'),
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyK' || key === 'k'),
                (e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyE' || key === 'e'),
                isMac && e.altKey && key === '\u00bf',
                isMac && e.metaKey && e.altKey && (code === 'KeyI' || key === 'i'),
                code === 'F8',
                (e.ctrlKey && code === 'Backquote') || (e.metaKey && code === 'Backquote')
            ];
            if (blockedShortcuts.some(s => s)) {
                e.preventDefault();
                alert('\u26a0\ufe0f Acceso restringido: No tienes permisos para usar herramientas de desarrollo.');
            }
        });
        document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
        document.addEventListener('mousedown', function(e) {
            if (e.button === 2 && e.shiftKey) {
                e.preventDefault();
                alert('\u26a0\ufe0f No esta permitido abrir el inspector con Shift + Clic derecho.');
            }
        });
    }

    // 5. Session warning banner
    const warningHTML = `
        <div id="session-warning">
            <p>La sesi\u00f3n expirar\u00e1 pronto</p>
            <button id="extend-session">Extender sesi\u00f3n</button>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', warningHTML);

    // 6. Close modals when clicking outside (on the overlay background)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') || e.target.classList.contains('modal-anular')) {
            e.target.style.display = 'none';
        }
    });
});

// 7. Inject real IP in all API requests via custom header
(() => {
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        if (typeof url === 'string' && (url.startsWith('/api/') || url.startsWith('/auth/'))) {
            const userIp = localStorage.getItem('userIp');
            if (userIp) {
                options.headers = options.headers || {};
                if (options.headers instanceof Headers) {
                    if (!options.headers.has('X-Client-IP')) {
                        options.headers.set('X-Client-IP', userIp);
                    }
                } else {
                    options.headers['X-Client-IP'] = userIp;
                }
            }
        }
        return originalFetch.call(this, url, options);
    };
})();

// 8. Tom Select — búsqueda en tiempo real en selects con muchas opciones
(function() {
    const TS_CDN = 'https://cdn.jsdelivr.net/npm/tom-select@2.3.1/dist/js/tom-select.complete.min.js';
    const MIN_OPCIONES = 3;
    let tsCargado = false;

    window.__ts = new Map();

    const TS_CONFIG = {
        maxOptions: 150,
        placeholder: 'Buscar...',
        allowEmptyOption: true,
        selectOnTab: true
    };

    function actualizarOpcionesTS(inst) {
        // Sincroniza las opciones internas de TomSelect con el <select> oculto
        // sin disparar el MutationObserver (solo toca el DOM dentro de .ts-wrapper)
        inst.clearOptions(() => false);
        const sel = inst.input;
        Array.from(sel.options).forEach(opt => {
            inst.addOption({ value: opt.value, text: opt.textContent });
        });
        inst.refreshOptions(false);
    }

    function initSelect(sel) {
        if (!tsCargado) return;
        if (sel.options.length < MIN_OPCIONES) return;
        if (sel.hasAttribute('data-ts-skip')) return;

        const id = sel.id || 'ts-' + Math.random().toString(36).slice(2, 8);
        if (!sel.id) sel.id = id;

        // Ya tiene TomSelect → actualizar opciones si cambiaron
        if (sel.tomselect && window.__ts.has(id)) {
            const inst = window.__ts.get(id);
            const actual = Array.from(sel.options).map(o => o.value).join(',');
            if (inst._lastOpts !== actual) {
                actualizarOpcionesTS(inst);
                inst._lastOpts = actual;
            }
            return;
        }

        // Limpieza por si el mapa tiene una entrada huérfana
        if (window.__ts.has(id)) {
            window.__ts.delete(id);
        }

        try {
            const inst = new TomSelect(sel, TS_CONFIG);
            inst._lastOpts = Array.from(sel.options).map(o => o.value).join(',');
            window.__ts.set(id, inst);
        } catch (e) {}
    }

    window.refreshTS = function(selector) {
        if (!tsCargado) return;
        const selects = selector
            ? document.querySelectorAll(selector)
            : document.querySelectorAll('select');
        selects.forEach(initSelect);
    };

    window.destroyTS = function(id) {
        if (window.__ts.has(id)) {
            try { window.__ts.get(id).destroy(); } catch (e) {}
            window.__ts.delete(id);
        }
    };

    // Cargar Tom Select CDN
    const script = document.createElement('script');
    script.src = TS_CDN;
    script.onload = () => {
        tsCargado = true;
        refreshTS();
    };
    document.head.appendChild(script);

    // MutationObserver: detecta únicamente <select> NUEVOS en el DOM (modales, etc.)
    // NO observa cambios de <option> para evitar loops con destroy().
    let debounceTs = null;
    const observer = new MutationObserver((mutations) => {
        let dirty = false;
        for (const mut of mutations) {
            if (mut.type !== 'childList') continue;
            if (mut.target.closest?.('.ts-wrapper')) continue;
            for (const node of mut.addedNodes) {
                if (node.nodeType === 1 && node.tagName === 'SELECT') {
                    dirty = true;
                    break;
                }
            }
            if (dirty) break;
        }
        if (dirty) {
            clearTimeout(debounceTs);
            debounceTs = setTimeout(refreshTS, 100);
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();

// 6. Forced reload on back/forward cache (not DOMContentLoaded)
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || !role) {
            window.location.href = '/index.html';
        } else {
            window.location.reload();
        }
    }
});
