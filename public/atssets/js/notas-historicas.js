document.getElementById('btn-continuar-notas').addEventListener('click', () => {
    const cedula = document.getElementById('buscar-estudiante-notas').value;
    if (cedula) {
        const estudiante = buscarEstudianteNotas(cedula);
        if (estudiante) {
            localStorage.setItem('estudianteNotas', JSON.stringify(estudiante));
            window.location.href = 'detalle-notas.html';
        } else {
            alert('Estudiante no encontrado.');
        }
    } else {
        alert('Ingrese una cédula.');
    }
});

function buscarEstudianteNotas(cedula) {
    const estudiantes = [
        { cedula: "123", nombres: "Juan", apellidos: "Pérez", pensum: "ING-2020", nivel: "5to", notas: [{ materia: "Calculo III", codigo: "MAT-301", nota: 15 }, { materia: "Fisica II", codigo: "FIS-201", nota: 12 }, { materia: "Programacion I", codigo: "PRO-101", nota: 18 }] },
        { cedula: "456", nombres: "Maria", apellidos: "Gomez", pensum: "ADM-2021", nivel: "3ro", notas: [{ materia: "Contabilidad I", codigo: "CON-101", nota: 10 }, { materia: "Economia I", codigo: "ECO-101", nota: 16 }] },
        { cedula: "789", nombres: "Pedro", apellidos: "Lopez", pensum: "ARQ-2019", nivel: "6to", notas: [{ materia: "Diseño Arquitectonico V", codigo: "ARQ-501", nota: 19 }, { materia: "Historia de la Arquitectura III", codigo: "HAR-301", nota: 14 }] }
    ];
    return estudiantes.find(estudiante => estudiante.cedula === cedula);
}