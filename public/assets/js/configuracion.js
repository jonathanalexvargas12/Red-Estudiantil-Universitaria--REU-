const getToken = () => localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('config-container');
    const token = getToken();
    if (!token) return;

    try {
        const resp = await fetch('/api/configuracion', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Error');
        const configs = await resp.json();

        let html = '<div style="max-width:600px;">';
        configs.forEach(c => {
            const isBool = c.Valor === '0' || c.Valor === '1';
            html += `
            <div class="config-item" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#f8f9fa;border-radius:8px;margin-bottom:8px;">
                <div>
                    <strong>${c.Descripcion || c.Clave}</strong>
                    <br><small style="color:#888;">${c.Clave}</small>
                </div>
                <div>
                    ${isBool
                        ? `<label class="switch">
                              <input type="checkbox" class="config-toggle" data-clave="${c.Clave}" ${c.Valor === '1' ? 'checked' : ''}>
                              <span class="slider round"></span>
                           </label>`
                        : `<input type="text" class="config-input input-recuperacion" data-clave="${c.Clave}" value="${c.Valor}" style="width:200px;">`
                    }
                </div>
            </div>`;
        });
        html += `
            <button id="btn-guardar-config" class="login-button" style="margin-top:12px;"><i class="fas fa-save"></i> Guardar Cambios</button>
        </div>`;

        html += `
        <style>
            .switch { position:relative; display:inline-block; width:50px; height:26px; }
            .switch input { opacity:0; width:0; height:0; }
            .slider { position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#ccc; transition:.3s; border-radius:26px; }
            .slider:before { position:absolute; content:""; height:20px; width:20px; left:3px; bottom:3px; background:white; transition:.3s; border-radius:50%; }
            input:checked + .slider { background:#003DA5; }
            input:checked + .slider:before { transform:translateX(24px); }
        </style>`;

        container.innerHTML = html;

        document.getElementById('btn-guardar-config').addEventListener('click', async () => {
            const toggles = document.querySelectorAll('.config-toggle');
            const inputs = document.querySelectorAll('.config-input');
            const updates = [];

            toggles.forEach(t => updates.push({
                clave: t.dataset.clave,
                valor: t.checked ? '1' : '0'
            }));
            inputs.forEach(i => updates.push({
                clave: i.dataset.clave,
                valor: i.value
            }));

            for (const u of updates) {
                await fetch(`/api/configuracion/${encodeURIComponent(u.clave)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ Valor: u.valor })
                });
            }

            alert('Configuración guardada exitosamente.');
        });

    } catch (e) {
        console.error('Error cargando configuración:', e);
        container.innerHTML = '<p style="color:#dc3545;">Error al cargar la configuración.</p>';
    }
});
