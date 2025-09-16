document.addEventListener('DOMContentLoaded', function() {
    const btnContinuar = document.getElementById('btn-continuar-retiro');
    
    btnContinuar.addEventListener('click', async () => {
        const cedula = document.getElementById('buscar-estudiante').value.trim();
        
        if (!cedula) {
            mostrarAlerta('Ingrese una cédula.', 'error');
            return;
        }

        try {
            const estudiante = await buscarEstudianteEnBD(cedula);
            
            if (estudiante) {
                localStorage.setItem('estudianteRetiro', JSON.stringify(estudiante));
                window.location.href = 'detalle-retiro.html';
            } else {
                mostrarAlerta('Estudiante no encontrado. Verifique la cédula e intente nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error al buscar estudiante:', error);
            mostrarAlerta('Error al buscar el estudiante. Por favor, intente nuevamente.', 'error');
        }
    });

    // Función para buscar estudiante en la base de datos
    async function buscarEstudianteEnBD(cedula) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(`/api/estudiantes?cedula=${encodeURIComponent(cedula)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        
        // Verificar si se encontró el estudiante
        if (data && data.length > 0) {
            return {
                cedula: data[0].Cedula,
                nombres: data[0].Nombres,
                apellidos: data[0].Apellidos,
                carrera: data[0].Carrera,
                nivel: data[0].Nivel,
                // Puedes incluir más campos según necesites
            };
        }
        
        return null;
    }

    // Función para mostrar alertas personalizadas
    function mostrarAlerta(mensaje, tipo) {
        // Eliminar alertas anteriores
        const alertasAnteriores = document.querySelectorAll('.alerta-retiro');
        alertasAnteriores.forEach(alerta => alerta.remove());

        const alerta = document.createElement('div');
        alerta.className = `alerta-retiro alerta-${tipo}`;
        alerta.textContent = mensaje;
        
        // Estilos básicos para la alerta
        alerta.style.padding = '10px 15px';
        alerta.style.marginTop = '15px';
        alerta.style.borderRadius = '4px';
        alerta.style.fontSize = '0.9rem';
        
        if (tipo === 'error') {
            alerta.style.backgroundColor = '#f8d7da';
            alerta.style.color = '#721c24';
            alerta.style.border = '1px solid #f5c6cb';
        } else {
            alerta.style.backgroundColor = '#d4edda';
            alerta.style.color = '#155724';
            alerta.style.border = '1px solid #c3e6cb';
        }

        // Insertar después del botón
        btnContinuar.insertAdjacentElement('afterend', alerta);
        
        // Desaparecer después de 5 segundos
        setTimeout(() => {
            alerta.remove();
        }, 5000);
    }
});