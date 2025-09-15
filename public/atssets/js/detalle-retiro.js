document.addEventListener('DOMContentLoaded', () => {
    const datosEstudianteDiv = document.getElementById('datos-estudiante');
    const materiasEstudianteDiv = document.getElementById('materias-estudiante');
    const estudiante = JSON.parse(localStorage.getItem('estudianteRetiro'));

    if (estudiante) {
        datosEstudianteDiv.innerHTML = `
            <p><strong>Cédula:</strong> ${estudiante.cedula}</p>
            <p><strong>Nombres:</strong> ${estudiante.nombres}</p>
            <p><strong>Apellidos:</strong> ${estudiante.apellidos}</p>
            <p><strong>Pensum:</strong> ${estudiante.pensum}</p>
            <p><strong>Nivel:</strong> ${estudiante.nivel}</p>
        `;

        let tablaMaterias = "<table><thead><tr><th>Código</th><th>Materia</th><th>Acciones</th></tr></thead><tbody>"; // Se quita la columna de "Nota"

        estudiante.materias.forEach(materia => {
            tablaMaterias += `<tr><td>${materia.codigo}</td><td>${materia.materia}</td><td><i class="fas fa-ban" style="cursor: pointer; color: #5870C4;"></i></td></tr>`;
        });

        

        tablaMaterias += "</tbody></table>";
        materiasEstudianteDiv.innerHTML = tablaMaterias;
        

        document.getElementById('btn-generar-reporte__retiro').addEventListener('click', () => {
            // Aquí la lógica para generar el PDF de retiro
            alert('Generando reporte de retiro...');
        });
    } else {
        datosEstudianteDiv.innerHTML = '<p>No se encontraron datos del estudiante.</p>';
        materiasEstudianteDiv.innerHTML = ""; // Limpiar el div de materias si no hay estudiante
    }
});