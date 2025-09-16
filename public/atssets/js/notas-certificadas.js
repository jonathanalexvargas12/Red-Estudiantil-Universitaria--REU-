document.getElementById('btn-continuar-certificadas').addEventListener('click', () => {
    const cedula = document.getElementById('buscar-estudiante-certificadas').value;
    if (cedula) {
        const estudiante = buscarEstudianteCertificadas(cedula);
        if (estudiante) {
            localStorage.setItem('estudianteCertificado', JSON.stringify(estudiante)); 
            window.location.href = 'detalle-certificado.html'; 
        } else {
            alert('Estudiante no encontrado.');
        }
    } else {
        alert('Ingrese una cédula.');
    }
});

function buscarEstudianteCertificadas(cedula) {
    const estudiantes = [
        { cedula: "123", nombres: "Juan", apellidos: "Pérez", notas: [{ materia: "Calculo III", codigo: "MAT-301", nota: 15, fechaAprobacion: "2024-05-10" }, { materia: "Fisica II", codigo: "FIS-201", nota: 12, fechaAprobacion: "2023-12-15" }, { materia: "Programacion I", codigo: "PRO-101", nota: 18, fechaAprobacion: "2023-07-20" }] },
        { cedula: "456", nombres: "Maria", apellidos: "Gomez", notas: [{ materia: "Contabilidad I", codigo: "CON-101", nota: 10, fechaAprobacion: "2024-01-25" }, { materia: "Economia I", codigo: "ECO-101", nota: 16, fechaAprobacion: "2023-09-05" }] },
        { cedula: "789", nombres: "Pedro", apellidos: "Lopez", notas: [{ materia: "Diseño Arquitectonico V", codigo: "ARQ-501", nota: 19, fechaAprobacion: "2024-03-01" }, { materia: "Historia de la Arquitectura III", codigo: "HAR-301", nota: 14, fechaAprobacion: "2023-11-22" }] }
    ];
    return estudiantes.find(estudiante => estudiante.cedula === cedula);
}