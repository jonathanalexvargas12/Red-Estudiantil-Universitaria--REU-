document.getElementById('btn-continuar-record').addEventListener('click', () => {
    const cedula = document.getElementById('buscar-estudiante-record').value;
    if (cedula) {
        const estudiante = buscarEstudianteRecord(cedula);
        if (estudiante) {
            localStorage.setItem('estudianteRecord', JSON.stringify(estudiante)); // Clave en localStorage adaptada
            window.location.href = 'detalle-record.html'; // Nombre del archivo adaptado
        } else {
            alert('Estudiante no encontrado.');
        }
    } else {
        alert('Ingrese una cédula.');
    }
});

function buscarEstudianteRecord(cedula) {
    const estudiantes = [
        { 
            cedula: "123", 
            nombres: "Juan", 
            apellidos: "Pérez", 
            pensum: "ING-2020", 
            nivel: "5to", 
            materias: [ // 'notas' se cambia a 'materias'
                { materia: "Calculo III", codigo: "MAT-301", calificacion: 85, creditos: 4, periodo: "2023-I" }, // Se agrega 'calificacion', 'creditos' y 'periodo'
                { materia: "Fisica II", codigo: "FIS-201", calificacion: 78, creditos: 4, periodo: "2023-I" },
                { materia: "Programacion I", codigo: "PRO-101", calificacion: 92, creditos: 3, periodo: "2022-II" }
            ] 
        },
        { 
            cedula: "456", 
            nombres: "Maria", 
            apellidos: "Gomez", 
            pensum: "ADM-2021", 
            nivel: "3ro", 
            materias: [
                { materia: "Contabilidad I", codigo: "CON-101", calificacion: 70, creditos: 4, periodo: "2023-I" },
                { materia: "Economia I", codigo: "ECO-101", calificacion: 88, creditos: 3, periodo: "2022-II" }
            ] 
        },
        { 
            cedula: "789", 
            nombres: "Pedro", 
            apellidos: "Lopez", 
            pensum: "ARQ-2019", 
            nivel: "6to", 
            materias: [
                { materia: "Diseño Arquitectonico V", codigo: "ARQ-501", calificacion: 95, creditos: 5, periodo: "2023-I" },
                { materia: "Historia de la Arquitectura III", codigo: "HAR-301", calificacion: 75, creditos: 3, periodo: "2022-II" }
            ] 
        }
    ];
    return estudiantes.find(estudiante => estudiante.cedula === cedula);
}