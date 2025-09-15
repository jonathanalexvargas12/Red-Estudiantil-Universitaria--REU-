document.addEventListener('DOMContentLoaded', () => {
    const datosEstudianteDiv = document.getElementById('datos-estudiante-notas');
    const notasEstudianteDiv = document.getElementById('notas-estudiante');
    const estudiante = JSON.parse(localStorage.getItem('estudianteNotas'));

    if (estudiante) {
        datosEstudianteDiv.innerHTML = `
            <p><strong>Cédula:</strong> ${estudiante.cedula}</p>
            <p><strong>Nombres:</strong> ${estudiante.nombres}</p>
            <p><strong>Apellidos:</strong> ${estudiante.apellidos}</p>
            <p><strong>Pensum:</strong> ${estudiante.pensum}</p>
            <p><strong>Nivel:</strong> ${estudiante.nivel}</p>
        `;

        let tablaNotas = "<table><thead><tr><th>Código</th><th>Materia</th><th>Nota</th></tr></thead><tbody>";

        estudiante.notas.forEach(nota => {
            tablaNotas += `<tr><td>${nota.codigo}</td><td>${nota.materia}</td><td>${nota.nota}</td></tr>`;
        });

        tablaNotas += "</tbody></table>";
        notasEstudianteDiv.innerHTML = tablaNotas;

        document.getElementById('btn-generar-reporte-notas').addEventListener('click', () => {
            // Aquí la lógica para generar el PDF
            alert('Generando reporte de notas...');
        });
    } else {
        datosEstudianteDiv.innerHTML = '<p>No se encontraron datos del estudiante.</p>';
        notasEstudianteDiv.innerHTML = ""; // Limpiar el div de notas si no hay estudiante
    }
});