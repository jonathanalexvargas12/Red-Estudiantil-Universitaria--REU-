const fs = require('fs');

const oldSql = fs.readFileSync(
  'C:\\Users\\Jonathan\\Desktop\\Base de Datos Sistema REU v1.2.12.sql',
  'utf8'
);

// ─── 1. Extract CREATE TABLE blocks ───────────────────────────
function extractCreateTables(sql) {
  const tables = {};
  const lines = sql.split('\n');
  let inCreate = false, block = '', parens = 0;

  for (const line of lines) {
    if (/^CREATE TABLE/.test(line.trim())) {
      inCreate = true;
      block = line;
      parens = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
    } else if (inCreate) {
      block += '\n' + line;
      parens += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
      if (parens <= 0 && line.trim().endsWith(';')) {
        const m = block.match(/`(\w+)`/);
        if (m) tables[m[1]] = block;
        inCreate = false;
      }
    }
  }
  return tables;
}

// ─── 2. Extract column names from a DDL block ────────────────
function getColumns(ddl) {
  // Extract the parenthesized part before any CONSTRAINT/KEY lines
  const m = ddl.match(/\(([\s\S]*?)\)\s*(?:ENGINE|PRIMARY)/);
  if (!m) return [];
  const lines = m[1].split('\n');
  const cols = [];
  for (const line of lines) {
    const colMatch = line.match(/^\s*`(\w+)`/);
    if (colMatch) cols.push(colMatch[1]);
  }
  return cols;
}

// ─── 3. Extract admin users INSERT ───────────────────────────
function extractAdminUsers(sql) {
  const idx = sql.indexOf("INSERT INTO `usuarios`");
  if (idx === -1) return '';
  const from = sql.indexOf('VALUES', idx) + 6;
  const to = sql.indexOf(';', from);
  const block = sql.substring(from, to);
  const lines = block.split('\n');
  const adminLines = lines.filter(l => l.includes("'Administrador'"));
  const header = "INSERT INTO `usuarios` (`ID_Usuario`,`Password`,`Rol`,`Estado`,`Nombres`,`Apellidos`,`Genero`,`Residente`,`Cedula`,`Telefono_1`,`Telefono_2`,`Correo`,`Direccion_Residencial`,`Codigo_Carnet`,`Fecha_Registro`) VALUES\n";
  return header + adminLines.join('\n') + ';\n\n';
}

// ─── 4. Load old tables ──────────────────────────────────────
const oldTables = extractCreateTables(oldSql);

// ─── 5. Seeded RNG ───────────────────────────────────────────
const seeded = (seed) => {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
};
const rnd = seeded(42);
const randomInt = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((rnd() * (max - min) + min).toFixed(decimals));
const pick = (arr) => arr[randomInt(0, arr.length - 1)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => rnd() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
};

// ─── 6. Data generators (matching old schema) ───────────────

// Carreras
const carrerasData = (() => {
  const codes = [
    'P-INF-2047','P-CIV-2022','P-ELE-2021','P-MEC-2022','P-QUI-2023',
    'P-ADM-2024','P-CON-2048','P-DER-2057','P-MED-2059','P-ARQ-2032',
    'P-PSI-2030','P-EDU-2029','P-COM-2040','P-GAS-2026','P-TUR-2035',
    'P-HOT-2063','P-MAT-2028','P-FIS-2056','P-BIO-2056','P-AMB-2027',
    'P-IND-2023','P-AGR-2027','P-FIL-2038','P-HIS-2039','P-SOC-2039',
    'P-ART-2065','P-MUS-2037','P-DEP-2037','P-PER-2041','P-PUB-2041'
  ];
  return codes.map(c => ({
    Codigo_Carrera: c,
    Nombre_Carrera: `Carrera ${c}`,
    Tipo: pick(['Pregrado','Postgrado','Diplomado']),
    Estado: 'Activo',
    Total_UC: randomInt(120, 200)
  }));
})();

// Periodos
const periodosData = (() => {
  const data = [];
  for (let y = 2020; y <= 2028; y++) {
    data.push({ Periodo_Academico: `${y}-1`, Estado: 'Activo', Inicio: `${y}-01-15`, Final: `${y}-06-30`, Limite_UC: randomInt(24, 36) });
    data.push({ Periodo_Academico: `${y}-2`, Estado: 'Activo', Inicio: `${y}-07-15`, Final: `${y}-12-20`, Limite_UC: randomInt(24, 36) });
  }
  return data;
})();

// Secciones
const seccionesData = Array.from({length: 30}, (_, i) => ({ Codigo_Seccion: i + 1 }));

// Niveles
const nivelesData = [
  { Nombre_Nivel: 'Trayecto I', Orden_Nivel: 1 },
  { Nombre_Nivel: 'Trayecto II', Orden_Nivel: 2 },
  { Nombre_Nivel: 'Trayecto III', Orden_Nivel: 3 },
  { Nombre_Nivel: 'Trayecto IV', Orden_Nivel: 4 }
];

// Pensum
const pensumData = carrerasData.map(c => ({
  Nombre_Pensum: `Pensum ${c.Codigo_Carrera}`,
  Num_Asignatura: randomInt(20, 50),
  Estado_Pensum: 'Activo',
  Codigo_Pensum: c.Codigo_Carrera
}));

// Asignaturas
const nombresAsignaturas = [
  'Matematica I','Matematica II','Fisica I','Fisica II','Quimica General',
  'Programacion I','Programacion II','Base de Datos','Redes','Sistemas Operativos',
  'Calculo I','Calculo II','Algebra Lineal','Ecuaciones Diferenciales','Estadistica',
  'Ingles I','Ingles II','Lengua','Sociologia','Etica Profesional',
  'Electronica','Circuitos','Mecanica','Termodinamica','Fluidos',
  'Contabilidad','Economia','Administracion','Marketing','Gerencia',
  'Arquitectura','Diseno','Urbanismo','Estructuras','Materiales',
  'Derecho I','Derecho II','Penal','Civil','Laboral',
  'Medicina General','Anatomia','Fisiologia','Farmacologia','Patologia',
  'Psicologia General','Psicologia Clinica','Psicologia Social','Psicologia Educativa','Neuropsicologia'
];
let nextCodAsig = 1;
const asignaturasData = nombresAsignaturas.map(nombre => ({
  Codigo_Asignatura: `COD-${String(nextCodAsig++).padStart(3, '0')}`,
  Nombre_Asignatura: nombre,
  Carrera: pick(carrerasData).Codigo_Carrera,
  Trayecto: randomInt(1, 4),
  'Sem/Trim': randomInt(1, 3),
  Valor_UC: randomInt(2, 5)
}));

// Aulas
const aulasData = ['A-101','A-102','A-103','A-201','A-202','A-203','LAB-1','LAB-2','LAB-3','SALA-1','SALA-2','AUDITORIO'].map(n => ({
  Nombre_Aula: n,
  Capacidad: randomInt(20, 120)
}));

// Docentes
const docentesData = (() => {
  const nombresMasc = ['Carlos','Luis','Jose','Manuel','Pedro','Juan','Miguel','Angel','Jesus','David','Rafael','Victor','Diego','Fernando','Pablo','Sergio','Andres','Jorge','Alberto','Antonio'];
  const nombresFem = ['Maria','Carmen','Ana','Marta','Isabel','Laura','Patricia','Rosa','Sandra','Elena','Cristina','Gloria','Sofia','Valentina','Camila','Luciana','Daniela','Andrea','Paula','Gabriela'];
  const apellidos = ['Rodriguez','Garcia','Martinez','Lopez','Gonzalez','Hernandez','Perez','Sanchez','Diaz','Torres','Ramirez','Flores','Rivera','Morales','Ortiz','Castillo','Alvarez','Romero','Vargas','Moreno','Reyes','Cruz','Molina','Gutierrez','Medina','Castro','Ruiz','Aguilar','Mendoza','Jimenez'];
  const data = [];

  for (let i = 0; i < 80; i++) {
    const ced = String(100 + i).padStart(8, '0');
    const fem = randomInt(0, 1);
    const nom = fem ? pick(nombresFem) : pick(nombresMasc);
    const ap = `${pick(apellidos)} ${pick(apellidos)}`;
    data.push({
      Cedula: ced,
      Usuario: `${nom.toUpperCase()}_${ced.slice(-4)}`,
      Nombres: nom,
      Apellidos: ap,
      Estado_Docente: pick(['Activo','Inactivo']),
      Tipo: pick(['Titular','Contratado','Suplente']),
      Fecha_Registro: `202${randomInt(0,5)}-${String(randomInt(1,12)).padStart(2,'0')}-${String(randomInt(1,28)).padStart(2,'0')}`,
      Estado: 'Activo'
    });
  }
  return data;
})();

// Estudiantes
const estudiantesData = (() => {
  const nombresMasc = ['Carlos','Luis','Jose','Manuel','Pedro','Juan','Miguel','Angel','Jesus','David','Rafael','Victor','Diego','Fernando','Pablo','Sergio','Andres','Jorge','Alberto','Antonio'];
  const nombresFem = ['Maria','Carmen','Ana','Marta','Isabel','Laura','Patricia','Rosa','Sandra','Elena','Cristina','Gloria','Sofia','Valentina','Camila','Luciana','Daniela','Andrea','Paula','Gabriela'];
  const apellidos = ['Rodriguez','Garcia','Martinez','Lopez','Gonzalez','Hernandez','Perez','Sanchez','Diaz','Torres','Ramirez','Flores','Rivera','Morales','Ortiz','Castillo','Alvarez','Romero','Vargas','Moreno','Reyes','Cruz','Molina','Gutierrez','Medina','Castro','Ruiz','Aguilar','Mendoza','Jimenez'];
  const data = [];

  for (let i = 0; i < 120; i++) {
    const ced = String(300 + i).padStart(8, '0');
    const fem = randomInt(0, 1);
    const nom = fem ? pick(nombresFem) : pick(nombresMasc);
    const ap = `${pick(apellidos)} ${pick(apellidos)}`;
    data.push({
      Cedula: ced,
      Usuario: `EST_${ced}`,
      Nombres: nom,
      Apellidos: ap,
      Carrera: pick(carrerasData).Codigo_Carrera,
      Estado_Pensum: pick(['Activo','Inactivo']),
      Estado: pick(['Activo','Inactivo']),
      Fecha_Registro: `202${randomInt(0,5)}-${String(randomInt(1,12)).padStart(2,'0')}-${String(randomInt(1,28)).padStart(2,'0')}`
    });
  }
  return data;
})();

// Usuarios (non-admin)
const usuariosData = (() => {
  const data = [];
  // 1 user per docente
  docentesData.forEach(d => {
    data.push({
      ID_Usuario: d.Usuario,
      Password: '$2b$10$E7EiwPGsCUzjI3xU3Ebtne0ZTFSqMzVkS4U.U9G05bXEU4ZP8OSba',
      Rol: 'Docente',
      Estado: 'Habilitado',
      Nombres: d.Nombres,
      Apellidos: d.Apellidos,
      Genero: '',
      Residente: '',
      Cedula: d.Cedula,
      Telefono_1: `0412${String(randomInt(1000000,9999999))}`,
      Telefono_2: '',
      Correo: `${d.Nombres.toLowerCase()}.${d.Apellidos.split(' ')[0].toLowerCase()}@email.com`,
      Direccion_Residencial: 'Ciudad',
      Codigo_Carnet: null,
      Fecha_Registro: d.Fecha_Registro + ' 00:00:00'
    });
  });
  // 1 user per estudiante
  estudiantesData.forEach(e => {
    data.push({
      ID_Usuario: e.Usuario,
      Password: '$2b$10$E7EiwPGsCUzjI3xU3Ebtne0ZTFSqMzVkS4U.U9G05bXEU4ZP8OSba',
      Rol: 'Estudiante',
      Estado: 'Habilitado',
      Nombres: e.Nombres,
      Apellidos: e.Apellidos,
      Genero: '',
      Residente: '',
      Cedula: e.Cedula,
      Telefono_1: `0424${String(randomInt(1000000,9999999))}`,
      Telefono_2: '',
      Correo: `${e.Nombres.toLowerCase()}.${e.Apellidos.split(' ')[0].toLowerCase()}@email.com`,
      Direccion_Residencial: 'Ciudad',
      Codigo_Carnet: null,
      Fecha_Registro: e.Fecha_Registro + ' 00:00:00'
    });
  });
  return data;
})();

// Docente_Asignatura
const docenteAsignaturaData = (() => {
  const data = [];
  docentesData.forEach(d => {
    const count = randomInt(1, 4);
    const used = new Set();
    for (let i = 0; i < count; i++) {
      let asig;
      do { asig = pick(asignaturasData); } while (used.has(asig.Codigo_Asignatura));
      used.add(asig.Codigo_Asignatura);
      data.push({
        Docente_Cedula: d.Cedula,
        Docente_Nombre: `${d.Nombres} ${d.Apellidos}`,
        Asignatura: asig.Codigo_Asignatura,
        Carrera: pick(carrerasData).Codigo_Carrera,
        Trayecto: randomInt(1, 4),
        'Sem/Trim': randomInt(1, 3),
        Seccion: pick(seccionesData).Codigo_Seccion,
        Clases_Semana: randomInt(2, 6),
        Estado: 'Cargado Correctamente',
        Periodo_Academico: pick(periodosData).Periodo_Academico
      });
    }
  });
  return data;
})();

// Estudiante_Periodo_Academico
const estPeriodoData = (() => {
  const data = [];
  estudiantesData.forEach(e => {
    const count = randomInt(1, 3);
    for (let i = 0; i < count; i++) {
      data.push({
        Cedula_Estudiante: e.Cedula,
        Estado: pick(['Inscrito','Activo','Cursando','Finalizado']),
        Periodo_Academico: pick(periodosData).Periodo_Academico,
        Carrera: e.Carrera,
        Pago: pick(['Realizado','Pendiente','Comprobado']),
        Monto_Pago: randomFloat(100, 2000),
        Moneda: 'Bs.',
        Modalidad_Pago: pick(['Transferencia','Deposito','Efectivo','Punto']),
        Entidad_Bancaria: pick(['Banco de Venezuela','Mercantil','Provincial','Banesco','Exterior']),
        Numero_Transferencia: randomInt(10000, 999999),
        Fecha_Pago: `202${randomInt(0,5)}-${String(randomInt(1,12)).padStart(2,'0')}-${String(randomInt(1,28)).padStart(2,'0')}`,
        Fecha_Registro: `202${randomInt(0,5)}-${String(randomInt(1,12)).padStart(2,'0')}-${String(randomInt(1,28)).padStart(2,'0')} 00:00:00`
      });
    }
  });
  return data;
})();

// Estudiantes_Asignatura
const estudiantesAsignaturaData = (() => {
  const data = [];
  estudiantesData.forEach(e => {
    const matching = docenteAsignaturaData.filter(da => da.Carrera === e.Carrera);
    if (matching.length === 0) return;
    const count = randomInt(2, Math.min(6, matching.length));
    const selected = pickN(matching, count);
    selected.forEach(da => {
      data.push({
        Estudiante_Cedula: e.Cedula,
        Estudiante_Nombre: `${e.Nombres} ${e.Apellidos}`,
        Asignatura: da.Asignatura,
        Seccion: da.Seccion,
        Periodo_Academico: da.Periodo_Academico,
        Estado: randomInt(0, 3) === 0 ? pick(['Aprobado','Reprobado']) : 'Cargando Notas',
        Nota: randomInt(0, 3) === 0 ? randomFloat(1, 20) : null,
        Nota_Definitiva: null
      });
    });
  });
  return data;
})();

// Horas (uses updated schema with ID PK)
const horasData = (() => {
  const data = [];
  const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  docentesData.forEach(d => {
    const count = randomInt(2, 6);
    for (let i = 0; i < count; i++) {
      const hDesde = randomInt(7, 18);
      const mDesde = pick([0, 30]);
      const hHasta = Math.min(hDesde + randomInt(1, 3), 23);
      const mHasta = pick([0, 30]);
      const da = pick(docenteAsignaturaData.filter(x => x.Docente_Cedula === d.Cedula)) || pick(docenteAsignaturaData);
      data.push({
        Desde: `${String(hDesde).padStart(2,'0')}:${String(mDesde).padStart(2,'0')}:00`,
        Hasta: `${String(hHasta).padStart(2,'0')}:${String(mHasta).padStart(2,'0')}:00`,
        Dias: pickN(diasSemana, randomInt(1,4)).join(','),
        Turno: hDesde < 12 ? 'Mañana' : hDesde < 18 ? 'Tarde' : 'Noche',
        Carrera: da.Carrera,
        Pensum: da.Carrera,
        Periodo_Academico: da.Periodo_Academico,
        Seccion: da.Seccion,
        Nivel: `Trayecto ${randomInt(1,4)}`,
        Asignatura: da.Asignatura,
        Docente_Cedula: d.Cedula,
        Docente: `${d.Nombres} ${d.Apellidos}`
      });
    }
  });
  return data;
})();

// Calificaciones (matching old schema: Cedula_Estudiante, Nombre_Estudiante, Carrera, Trayecto, Seccion, Unidad_Curricular, Cedula_Docente, Nombre_Docente, Estado, Calificacion_Numerica, Calificacion_Cualitativa, Periodo_Academico)
const calificacionesData = (() => {
  const data = [];
  estudiantesAsignaturaData.forEach(ea => {
    if (ea.Nota === null) return;
    const da = docenteAsignaturaData.find(d => d.Asignatura === ea.Asignatura && d.Seccion === ea.Seccion) || pick(docenteAsignaturaData);
    data.push({
      Cedula_Estudiante: ea.Estudiante_Cedula,
      Nombre_Estudiante: ea.Estudiante_Nombre,
      Carrera: pick(carrerasData).Codigo_Carrera,
      Trayecto: randomInt(1, 4),
      Seccion: ea.Seccion,
      Unidad_Curricular: ea.Asignatura,
      Cedula_Docente: da.Docente_Cedula,
      Nombre_Docente: da.Docente_Nombre,
      Estado: ea.Nota >= 10 ? 'Aprobado' : 'Reprobado',
      Calificacion_Numerica: ea.Nota,
      Calificacion_Cualitativa: ea.Nota >= 10 ? 'Aprobado' : 'Reprobado',
      Periodo_Academico: ea.Periodo_Academico
    });
  });
  return data;
})();

// Reinscripciones (missing table)
const reinscripcionesData = (() => {
  const data = [];
  for (let i = 0; i < 60; i++) {
    const epa = pick(estPeriodoData);
    data.push({
      Cedula_Estudiante: epa.Cedula_Estudiante,
      Carrera: epa.Carrera,
      Periodo_Academico: epa.Periodo_Academico,
      Nivel_Pensum: `Trayecto ${randomInt(1,4)}`,
      Turno: pick(['Mañana','Tarde','Noche'])
    });
  }
  return data;
})();

// Asistencia_Docente (missing table)
const asistenciaDocenteData = (() => {
  const data = [];
  for (let i = 0; i < 200; i++) {
    const da = pick(docenteAsignaturaData);
    if (!da) continue;
    data.push({
      Docente_Cedula: da.Docente_Cedula,
      Periodo_Academico: da.Periodo_Academico,
      Asignatura: da.Asignatura,
      Seccion: da.Seccion,
      Fecha: `202${randomInt(3,5)}-${String(randomInt(1,12)).padStart(2,'0')}-${String(randomInt(1,28)).padStart(2,'0')}`,
      Hora_Inicio: `${String(randomInt(7,18)).padStart(2,'0')}:${pick(['00','30'])}:00`,
      Hora_Fin: `${String(randomInt(8,21)).padStart(2,'0')}:${pick(['00','30'])}:00`,
      Estado: pick(['impartida','cancelada','recuperada']),
      Observacion: null
    });
  }
  return data;
})();

// Tutores_Externos (missing table)
const tutoresExternosData = (() => {
  const nombresMasc = ['Carlos','Luis','Jose','Manuel','Pedro','Juan'];
  const nombresFem = ['Maria','Carmen','Ana','Marta','Isabel','Laura'];
  const apellidos = ['Rodriguez','Garcia','Martinez','Lopez','Gonzalez','Hernandez','Perez','Sanchez','Diaz','Torres'];
  const data = [];
  for (let i = 0; i < 15; i++) {
    const ced = String(800 + i).padStart(8, '0');
    const fem = randomInt(0, 1);
    const nom = fem ? pick(nombresFem) : pick(nombresMasc);
    const ap = `${pick(apellidos)} ${pick(apellidos)}`;
    data.push({
      Cedula: ced,
      Nombres: nom,
      Apellidos: ap,
      Telefono: `0412${String(randomInt(1000000,9999999))}`,
      Correo: `${nom.toLowerCase()}.${ap.split(' ')[0].toLowerCase()}@externo.com`,
      Profesion: pick(['Ingeniero','Licenciado','Doctor','Magister','Abogado','Arquitecto','Contador']),
      Lugar_Trabajo: pick(['Empresa A','Empresa B','Universidad X','Instituto Y','Corporacion Z'])
    });
  }
  return data;
})();

// Trabajo_Investigacion
const trabajoData = (() => {
  const data = [];
  for (let i = 0; i < 50; i++) {
    const est = pick(estudiantesData);
    const tutor = pick(docentesData);
    data.push({
      Nombre_Investigacion: `Investigacion ${pick(['sobre','analisis de','estudio de','evaluacion de','propuesta de'])} ${pick(['Sistemas','Redes','Educacion','Salud','Ambiente','Energia','Gestion','Calidad','Seguridad','Innovacion'])}`,
      Carrera: est.Carrera,
      Cedula_Estudiante: est.Cedula,
      Nombre_Estudiante: `${est.Nombres} ${est.Apellidos}`,
      Tutor_Cedula: tutor.Cedula,
      Tutor_Nombre: `${tutor.Nombres} ${tutor.Apellidos}`,
      Area_Interes: pick(['Tecnologia','Salud','Educacion','Social','Ambiental','Industrial']),
      Periodo_Academico: pick(periodosData).Periodo_Academico,
      ID_Solicitud: null
    });
  }
  return data;
})();

// Solicitudes Tutor Interno
const solicitudesIntData = (() => {
  const data = [];
  for (let i = 0; i < 40; i++) {
    const est = pick(estudiantesData);
    const doc = pick(docentesData);
    data.push({
      Cedula_Docente: doc.Cedula,
      Nombre_Docente: `${doc.Nombres} ${doc.Apellidos}`,
      Cedula_Solicitante: est.Cedula,
      Nombre_Estudiante: `${est.Nombres} ${est.Apellidos}`,
      Estado: pick(['Pendiente','Aprobado','Rechazado']),
      Fecha_Solicitud: `202${randomInt(3,5)}-${String(randomInt(1,12)).padStart(2,'0')}-${String(randomInt(1,28)).padStart(2,'0')}`
    });
  }
  return data;
})();

// Solicitudes Tutor Externo
const solicitudesExtData = (() => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const est = pick(estudiantesData);
    const tutor = pick(tutoresExternosData);
    data.push({
      Cedula_Tutor: tutor.Cedula,
      Nombre_Tutor: `${tutor.Nombres} ${tutor.Apellidos}`,
      Cedula_Solicitante: est.Cedula,
      Nombre_Estudiante: `${est.Nombres} ${est.Apellidos}`,
      Estado: pick(['Pendiente','tutor-asignado','tutor-aprobado','Rechazado']),
      Fecha_Solicitud: `202${randomInt(3,5)}-${String(randomInt(1,12)).padStart(2,'0')}-${String(randomInt(1,28)).padStart(2,'0')}`
    });
  }
  return data;
})();

// Bitacora (matching old schema)
const bitacoraData = (() => {
  const adminUsers = usuariosData.slice(0, 5);
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      Hora: `${String(randomInt(8,18)).padStart(2,'0')}:${String(randomInt(0,59)).padStart(2,'0')}:${String(randomInt(0,59)).padStart(2,'0')}`,
      Fecha: `202${randomInt(4,6)}-${String(randomInt(1,12)).padStart(2,'0')}-${String(randomInt(1,28)).padStart(2,'0')}`,
      IP: `192.168.${randomInt(0,255)}.${randomInt(1,254)}`,
      Usuario_ID: pick(adminUsers).ID_Usuario,
      Accion: pick(['Creación','Modificación','Eliminación','Inicio de Sesión']),
      Modulo: pick(['Usuarios','Estudiantes','Docentes','Horas','Asignaturas','Inscripciones','Calificaciones']),
      Registro_ID: String(randomInt(1, 999)),
      Detalles: 'Operacion registrada en el sistema'
    });
  }
  return data;
})();

// ─── Utility ─────────────────────────────────────────────────
function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "\\'")}'`;
}
function sqlInsert(table, cols, data) {
  if (data.length === 0) return '';
  const header = `INSERT INTO \`${table}\` (\`${cols.join('\`,\`')}\`) VALUES\n`;
  const rows = data.map((d, i) => '\t(' + cols.map(c => sqlVal(d[c])).join(',') + ')' + (i < data.length - 1 ? ',' : ';'));
  return header + rows.join('\n') + '\n\n';
}

// ─── Build output ────────────────────────────────────────────
let output = `-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Version del servidor:         12.1.2-MariaDB - MariaDB Server
-- SO del servidor:              Win64
-- GENERADO AUTOMATICAMENTE - Datos de ejemplo masivos
-- Base de Datos Sistema REU v2.0
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Volcando estructura para base de datos reu_db
DROP DATABASE IF EXISTS \`reu_db\`;
CREATE DATABASE IF NOT EXISTS \`reu_db\`;
USE \`reu_db\`;

SET FOREIGN_KEY_CHECKS=0;

`;

// ─── DDLs from old SQL (exclude ones we're replacing) ────────
const skipDDL = new Set(['horas','nivel_pensum','asignaturas']);
const officialCols = {}; // store column names per table

Object.keys(oldTables).sort().forEach(name => {
  if (skipDDL.has(name)) return;
  officialCols[name] = getColumns(oldTables[name]);
  output += oldTables[name] + '\n\n';
});

// Updated horas DDL
output += `CREATE TABLE IF NOT EXISTS \`horas\` (
  \`ID\` int(11) NOT NULL AUTO_INCREMENT,
  \`Desde\` time NOT NULL,
  \`Hasta\` time NOT NULL,
  \`Dias\` varchar(100) DEFAULT NULL,
  \`Turno\` varchar(50) DEFAULT NULL,
  \`Carrera\` varchar(50) DEFAULT NULL,
  \`Pensum\` varchar(50) DEFAULT NULL,
  \`Periodo_Academico\` varchar(20) DEFAULT NULL,
  \`Seccion\` varchar(20) DEFAULT NULL,
  \`Nivel\` varchar(50) DEFAULT NULL,
  \`Asignatura\` varchar(50) DEFAULT NULL,
  \`Docente_Cedula\` varchar(20) DEFAULT NULL,
  \`Docente\` varchar(100) DEFAULT NULL,
  PRIMARY KEY (\`ID\`),
  KEY \`fk_horas_docente\` (\`Docente_Cedula\`),
  KEY \`fk_horas_asignatura\` (\`Asignatura\`),
  KEY \`fk_horas_periodo\` (\`Periodo_Academico\`),
  KEY \`fk_horas_carrera\` (\`Carrera\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;\n\n`;

// Updated nivel_pensum DDL
output += `CREATE TABLE IF NOT EXISTS \`nivel_pensum\` (
  \`Nombre_Nivel\` varchar(50) NOT NULL DEFAULT '',
  \`Orden_Nivel\` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (\`Nombre_Nivel\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;\n\n`;

// Updated asignaturas DDL (wider Nombre_Asignatura)
output += `CREATE TABLE IF NOT EXISTS \`asignaturas\` (
  \`Codigo_Asignatura\` varchar(13) NOT NULL,
  \`Nombre_Asignatura\` varchar(50) NOT NULL,
  \`Carrera\` varchar(13) NOT NULL,
  \`Trayecto\` int(1) NOT NULL,
  \`Sem/Trim\` int(1) NOT NULL,
  \`Valor_UC\` int(2) NOT NULL,
  PRIMARY KEY (\`Codigo_Asignatura\`),
  KEY \`Carrera\` (\`Carrera\`),
  CONSTRAINT \`Carrera\` FOREIGN KEY (\`Carrera\`) REFERENCES \`carreras\` (\`Codigo_Carrera\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;\n\n`;

// Missing tables DDLs
output += `CREATE TABLE IF NOT EXISTS \`reinscripciones\` (
  \`ID\` int(11) NOT NULL AUTO_INCREMENT,
  \`Cedula_Estudiante\` varchar(20) DEFAULT NULL,
  \`Carrera\` varchar(50) DEFAULT NULL,
  \`Periodo_Academico\` varchar(20) DEFAULT NULL,
  \`Nivel_Pensum\` varchar(50) DEFAULT NULL,
  \`Turno\` varchar(20) DEFAULT NULL,
  \`Fecha_Registro\` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (\`ID\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;\n\n`;

output += `CREATE TABLE IF NOT EXISTS \`tutores_externos\` (
  \`Cedula\` varchar(20) NOT NULL,
  \`Nombres\` varchar(50) NOT NULL,
  \`Apellidos\` varchar(50) NOT NULL,
  \`Telefono\` varchar(20) DEFAULT NULL,
  \`Correo\` varchar(100) DEFAULT NULL,
  \`Profesion\` varchar(100) DEFAULT NULL,
  \`Lugar_Trabajo\` varchar(100) DEFAULT NULL,
  PRIMARY KEY (\`Cedula\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;\n\n`;

output += `CREATE TABLE IF NOT EXISTS \`asistencia_docente\` (
  \`ID\` int(11) NOT NULL AUTO_INCREMENT,
  \`Docente_Cedula\` varchar(20) DEFAULT NULL,
  \`Periodo_Academico\` varchar(20) DEFAULT NULL,
  \`Asignatura\` varchar(50) DEFAULT NULL,
  \`Seccion\` varchar(20) DEFAULT NULL,
  \`Fecha\` date DEFAULT NULL,
  \`Hora_Inicio\` time DEFAULT NULL,
  \`Hora_Fin\` time DEFAULT NULL,
  \`Estado\` varchar(50) DEFAULT 'impartida',
  \`Observacion\` varchar(255) DEFAULT NULL,
  PRIMARY KEY (\`ID\`),
  KEY \`FK_asist_docente\` (\`Docente_Cedula\`),
  KEY \`FK_asist_asignatura\` (\`Asignatura\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;\n\n`;

// ─── INSERT data ────────────────────────────────────────────
output += '-- Volcando datos\n\n';

// Table definitions: [table_name, columns, data]
const inserts = [
  ['carreras', ['Codigo_Carrera','Nombre_Carrera','Tipo','Estado','Total_UC'], carrerasData],
  ['periodo_academico', ['Periodo_Academico','Estado','Inicio','Final','Limite_UC'], periodosData],
  ['secciones', ['Codigo_Seccion'], seccionesData],
  ['nivel_pensum', ['Nombre_Nivel','Orden_Nivel'], nivelesData],
  ['pensum', ['Nombre_Pensum','Num_Asignatura','Estado_Pensum','Codigo_Pensum'], pensumData],
  ['aulas', ['Nombre_Aula','Capacidad'], aulasData],
  ['asignaturas', ['Codigo_Asignatura','Nombre_Asignatura','Carrera','Trayecto','Sem/Trim','Valor_UC'], asignaturasData],
  ['docentes', ['Cedula','Usuario','Nombres','Apellidos','Estado_Docente','Tipo','Fecha_Registro','Estado'], docentesData],
  ['estudiantes', ['Cedula','Usuario','Nombres','Apellidos','Carrera','Estado_Pensum','Estado','Fecha_Registro'], estudiantesData],
  ['tutores_externos', ['Cedula','Nombres','Apellidos','Telefono','Correo','Profesion','Lugar_Trabajo'], tutoresExternosData],
];

// Hardcoded admin users (preserved on every regeneration)
const adminUsersData = [
  {ID_Usuario:'DIRIARTE',Password:'$2b$10$TTuQpXEeaOmopwnqwc3Je..MbOGrdF59SLE65YJI9E2LTYeE1SldG',Rol:'Administrador',Estado:'Habilitado',Nombres:'Dangelo',Apellidos:'Iriarte',Genero:'',Residente:'',Cedula:'00000000',Telefono_1:'00000000000',Telefono_2:null,Correo:'dangelo.iriarte@gmail.com',Direccion_Residencial:'Caracas',Codigo_Carnet:null,Fecha_Registro:'2025-02-28 06:28:38'},
  {ID_Usuario:'DNLB1072',Password:'$2b$10$TDAOcBk5y0iE.SR8TjSvUexqlfLVVLXlGH1QoNXZNnY85FTJBbDsa',Rol:'Administrador',Estado:'Habilitado',Nombres:'Jose',Apellidos:'Betancourt',Genero:'',Residente:'',Cedula:'30031724',Telefono_1:'04125767988',Telefono_2:null,Correo:'josedanielbetancourt65@gmail.com',Direccion_Residencial:'Caracas',Codigo_Carnet:null,Fecha_Registro:'2025-02-28 06:13:25'},
  {ID_Usuario:'ESTUDIA',Password:'$2b$10$EFnD7n21kpCZIuWVXJU1SuBgVDBww.BVyAy0PjwbituuIBO1zMdXe',Rol:'Administrador',Estado:'Habilitado',Nombres:'Estudiante',Apellidos:'Arnes',Genero:'Femenino',Residente:'Venezolano',Cedula:'32000123',Telefono_1:'04110001122',Telefono_2:'',Correo:'arnes@gmail.com',Direccion_Residencial:'Caracas',Codigo_Carnet:null,Fecha_Registro:'2026-05-22 04:30:51'},
  {ID_Usuario:'estusi123',Password:'$2b$10$A5W9AZ2D5HcLKs6H367X2eVuKn6HcyF3aZL0IVZ0kq42e07mmjvzO',Rol:'Administrador',Estado:'Habilitado',Nombres:'estudiante',Apellidos:'Barreto',Genero:'Masculino',Residente:'Venezolano',Cedula:'30000111',Telefono_1:'04243216547',Telefono_2:'',Correo:'estudiante@gmail.com',Direccion_Residencial:'Caracas',Codigo_Carnet:null,Fecha_Registro:'2026-05-22 04:22:42'},
  {ID_Usuario:'GENESYSP718',Password:'$2b$10$DO6GxYlBfAmvQhMr03EXRO2j2fl8QUCv50TZ9wNsTEw7VVV8q8Rcq',Rol:'Administrador',Estado:'Habilitado',Nombres:'genesis',Apellidos:'palacios',Genero:'Femenino',Residente:'Venezolano',Cedula:'29328971',Telefono_1:'04241439547',Telefono_2:'',Correo:'palaciosgenesis242@gmail.com',Direccion_Residencial:'Guarenas',Codigo_Carnet:null,Fecha_Registro:'2026-05-22 04:23:36'},
  {ID_Usuario:'JONATHAV',Password:'$2b$10$nMZnA3JFavEhhWCceHfHKum/sJ9h5NsRvnHvyZWHhOG6kzZUHGIGu',Rol:'Administrador',Estado:'Habilitado',Nombres:'Jonathan',Apellidos:'Leon',Genero:'',Residente:'',Cedula:'27893352',Telefono_1:'04124747680',Telefono_2:null,Correo:'jonathanleon_15@hotmail.com',Direccion_Residencial:'Caracas',Codigo_Carnet:null,Fecha_Registro:'2025-02-28 06:05:26'},
  {ID_Usuario:'JUNIOR09',Password:'$2b$10$3c/BGUVF3Zg1L5oUFy/bCupXysiE/Eozz7X1QnIxVQzHwJ6Rj1Xce',Rol:'Administrador',Estado:'Habilitado',Nombres:'Jose',Apellidos:'Rivas',Genero:'Masculino',Residente:'Venezolano',Cedula:'30155969',Telefono_1:'04241234567',Telefono_2:'',Correo:'joserivas@gmail.com',Direccion_Residencial:'Caracas',Codigo_Carnet:null,Fecha_Registro:'2025-02-28 06:30:45'}
];

const userCols = ['ID_Usuario','Password','Rol','Estado','Nombres','Apellidos','Genero','Residente','Cedula','Telefono_1','Telefono_2','Correo','Direccion_Residencial','Codigo_Carnet','Fecha_Registro'];
output += sqlInsert('usuarios', userCols, adminUsersData);
output += sqlInsert('usuarios', userCols, usuariosData);

inserts.forEach(([table, cols, data]) => {
  output += sqlInsert(table, cols, data);
});

output += sqlInsert('docente_asignatura', ['Docente_Cedula','Docente_Nombre','Asignatura','Carrera','Trayecto','Sem/Trim','Seccion','Clases_Semana','Estado','Periodo_Academico'], docenteAsignaturaData);
output += sqlInsert('estudiante_periodo_academico', ['Cedula_Estudiante','Estado','Periodo_Academico','Carrera','Pago','Monto_Pago','Moneda','Modalidad_Pago','Entidad_Bancaria','Numero_Transferencia','Fecha_Pago','Fecha_Registro'], estPeriodoData);
output += sqlInsert('estudiantes_asignatura', ['Estudiante_Cedula','Estudiante_Nombre','Asignatura','Seccion','Periodo_Academico','Estado','Nota','Nota_Definitiva'], estudiantesAsignaturaData);
output += sqlInsert('horas', ['Desde','Hasta','Dias','Turno','Carrera','Pensum','Periodo_Academico','Seccion','Nivel','Asignatura','Docente_Cedula','Docente'], horasData);
output += sqlInsert('calificaciones', ['Cedula_Estudiante','Nombre_Estudiante','Carrera','Trayecto','Seccion','Unidad_Curricular','Cedula_Docente','Nombre_Docente','Estado','Calificacion_Numerica','Calificacion_Cualitativa','Periodo_Academico'], calificacionesData);
output += sqlInsert('reinscripciones', ['Cedula_Estudiante','Carrera','Periodo_Academico','Nivel_Pensum','Turno'], reinscripcionesData);
output += sqlInsert('asistencia_docente', ['Docente_Cedula','Periodo_Academico','Asignatura','Seccion','Fecha','Hora_Inicio','Hora_Fin','Estado','Observacion'], asistenciaDocenteData);
output += sqlInsert('trabajo_investigacion', ['Nombre_Investigacion','Carrera','Cedula_Estudiante','Nombre_Estudiante','Tutor_Cedula','Tutor_Nombre','Area_Interes','Periodo_Academico','ID_Solicitud'], trabajoData);
output += sqlInsert('solicitudes_tutor_interno', ['Cedula_Docente','Nombre_Docente','Cedula_Solicitante','Nombre_Estudiante','Estado','Fecha_Solicitud'], solicitudesIntData);
output += sqlInsert('solicitudes_tutor_externo', ['Cedula_Tutor','Nombre_Tutor','Cedula_Solicitante','Nombre_Estudiante','Estado','Fecha_Solicitud'], solicitudesExtData);
output += sqlInsert('bitacora', ['Hora','Fecha','IP','Usuario_ID','Accion','Modulo','Registro_ID','Detalles'], bitacoraData);

// Final comments
output += `/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;\n`;

// Write output
const outPath = 'C:\\Users\\Jonathan\\Desktop\\Base de Datos Sistema REU v2.0.sql';
fs.writeFileSync(outPath, output, 'utf8');

console.log('SQL generado exitosamente:');
console.log(`Carreras: ${carrerasData.length}`);
console.log(`Periodos: ${periodosData.length}`);
console.log(`Secciones: ${seccionesData.length}`);
console.log(`Niveles: ${nivelesData.length}`);
console.log(`Pensum: ${pensumData.length}`);
console.log(`Asignaturas: ${asignaturasData.length}`);
console.log(`Aulas: ${aulasData.length}`);
console.log(`Docentes: ${docentesData.length}`);
console.log(`Estudiantes: ${estudiantesData.length}`);
console.log(`Usuarios (no-admin): ${usuariosData.length}`);
console.log(`Docente-Asignatura: ${docenteAsignaturaData.length}`);
console.log(`Est-Periodo: ${estPeriodoData.length}`);
console.log(`Est-Asignatura: ${estudiantesAsignaturaData.length}`);
console.log(`Horas: ${horasData.length}`);
console.log(`Calificaciones: ${calificacionesData.length}`);
console.log(`Reinscripciones: ${reinscripcionesData.length}`);
console.log(`Asistencias: ${asistenciaDocenteData.length}`);
console.log(`Trabajos: ${trabajoData.length}`);
console.log(`Tutores Ext: ${tutoresExternosData.length}`);
console.log(`Solicitudes Int: ${solicitudesIntData.length}`);
console.log(`Solicitudes Ext: ${solicitudesExtData.length}`);
console.log(`Bitacora: ${bitacoraData.length}`);
console.log(`\nArchivo: ${outPath}`);
