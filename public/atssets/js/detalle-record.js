document.addEventListener('DOMContentLoaded', () => {
    const datosEstudianteDiv = document.getElementById('datos-estudiante-record');
    const recordEstudianteDiv = document.getElementById('record-estudiante');
    const estudiante = JSON.parse(localStorage.getItem('estudianteRecord')); // Clave adaptada

    if (estudiante) {
        datosEstudianteDiv.innerHTML = `
            <p><strong>Cédula:</strong> ${estudiante.cedula}</p>
            <p><strong>Nombres:</strong> ${estudiante.nombres}</p>
            <p><strong>Apellidos:</strong> ${estudiante.apellidos}</p>
            <p><strong>Pensum:</strong> ${estudiante.pensum}</p>
            <p><strong>Nivel:</strong> ${estudiante.nivel}</p>
        `;

        let tablaRecord = "<table><thead><tr><th>Código</th><th>Materia</th><th>Calificación</th><th>Créditos</th><th>Período</th></tr></thead><tbody>"; // Encabezados adaptados

        if (estudiante.materias && estudiante.materias.length > 0) { // Comprobación añadida
            estudiante.materias.forEach(materia => {
                tablaRecord += `<tr>
                                    <td>${materia.codigo}</td>
                                    <td>${materia.materia}</td>
                                    <td>${materia.calificacion}</td>
                                    <td>${materia.creditos}</td>
                                    <td>${materia.periodo}</td>
                                </tr>`; // Datos adaptados
            });
        } else {
            tablaRecord += `<tr><td colspan="5">No hay registros académicos.</td></tr>`; // Mensaje si no hay materias
        }

        tablaRecord += "</tbody></table>";
        recordEstudianteDiv.innerHTML = tablaRecord;

        document.getElementById('btn-generar-reporte-record').addEventListener('click', () => {
            alert('Generando reporte de récord académico...'); // Mensaje adaptado
            // Aquí la lógica para generar el PDF del récord académico
        });
    } else {
        datosEstudianteDiv.innerHTML = '<p>No se encontraron datos del estudiante.</p>';
        recordEstudianteDiv.innerHTML = "";
    }
});