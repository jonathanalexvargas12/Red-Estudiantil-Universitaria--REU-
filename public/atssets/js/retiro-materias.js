// Para que aparezcan los datos del estudiante una vez consultado

document.getElementById('btn-continuar-retiro').addEventListener('click', () => {
    const cedula = document.getElementById('buscar-estudiante').value;
    if (cedula) {
        const estudiante = buscarEstudianteRetiro(cedula);
        if (estudiante) {
            localStorage.setItem('estudianteRetiro', JSON.stringify(estudiante));
            window.location.href = 'detalle-retiro.html';
        } else {
            alert('Estudiante no encontrado.');
        }
    } else {
        alert('Ingrese una cédula.');
    }
});

function buscarEstudianteRetiro(cedula) {
    const estudiantes = [
        { cedula: "123", nombres: "Juan", apellidos: "Pérez", pensum: "ING-2020", nivel: "5to", materias: [{ materia: "Calculo III", codigo: "MAT-301" }, { materia: "Fisica II", codigo: "FIS-201" }, { materia: "Programacion I", codigo: "PRO-101" }] },
        { cedula: "456", nombres: "Maria", apellidos: "Gomez", pensum: "ADM-2021", nivel: "3ro", materias: [{ materia: "Contabilidad I", codigo: "CON-101" }, { materia: "Economia I", codigo: "ECO-101" }] },
        { cedula: "789", nombres: "Pedro", apellidos: "Lopez", pensum: "ARQ-2019", nivel: "6to", materias: [{ materia: "Diseño Arquitectonico V", codigo: "ARQ-501" }, { materia: "Historia de la Arquitectura III", codigo: "HAR-301" }] }
    ];
    return estudiantes.find(estudiante => estudiante.cedula === cedula);
}