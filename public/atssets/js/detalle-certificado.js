document.addEventListener('DOMContentLoaded', () => {
    const datosEstudianteInfoDiv = document.getElementById('datos-estudiante-info');
    const materiasAprobadasDiv = document.getElementById('materias-aprobadas');
    const btnGenerarCertificado = document.getElementById('btn-generar-certificado');
    const estudiante = JSON.parse(localStorage.getItem('estudianteCertificado'));

    if (estudiante) {
        datosEstudianteInfoDiv.innerHTML = `
            <p><strong>Cédula:</strong> ${estudiante.cedula}</p>
            <p><strong>Nombres:</strong> ${estudiante.nombres}</p>
            <p><strong>Apellidos:</strong> ${estudiante.apellidos}</p>
        `;

        let tablaMaterias = `
            <table>
                <thead>
                    <tr>
                        <th>Materia</th>
                        <th>Código</th>
                        <th>Nota</th>
                        <th>Fecha de Aprobación</th>
                    </tr>
                </thead>
                <tbody>
        `;

        estudiante.notas.forEach(nota => {
            tablaMaterias += `
                <tr>
                    <td>${nota.materia}</td>
                    <td>${nota.codigo}</td>
                    <td>${nota.nota}</td>
                    <td>${nota.fechaAprobacion}</td>
                </tr>
            `;
        });

        tablaMaterias += `
                </tbody>
            </table>
        `;
        materiasAprobadasDiv.innerHTML = tablaMaterias;

        btnGenerarCertificado.addEventListener('click', () => {
            // Aquí la lógica para generar el PDF
            alert('Generando Certificado PDF...');
        });
    } else {
        datosEstudianteDiv.innerHTML = '<p>No se encontraron datos del estudiante.</p>';
        window.location.href = "index.html"; // Redirigir a la página principal si no hay datos
    }
});