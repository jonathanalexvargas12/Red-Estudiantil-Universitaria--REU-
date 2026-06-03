const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reu_db',
    port: parseInt(process.env.DB_PORT) || 3306,
    connectionLimit: 1
});

async function migrate() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('=== INICIANDO MIGRACIÓN: NORMALIZACIÓN DE FKs ===\n');

        // ============================================================
        // 0. INSPECCIONAR ESQUEMA REAL
        // ============================================================
        console.log('--- 0. INSPECCIONANDO ESQUEMA ---');
        const tablasBD = await conn.query("SHOW TABLES");
        const nombresTablas = tablasBD.map(r => Object.values(r)[0]);
        console.log(`  Tablas encontradas: ${nombresTablas.join(', ')}`);

        const esquema = {};
        for (const t of nombresTablas) {
            const cols = await conn.query(`SHOW COLUMNS FROM \`${t}\``);
            esquema[t] = cols.map(c => c.Field);
        }

        const tableExists = (name) => nombresTablas.includes(name);
        const columnExists = (table, col) => esquema[table] && esquema[table].includes(col);
        const findColumn = (table, posibles) => {
            if (!esquema[table]) return null;
            return posibles.find(c => esquema[table].includes(c)) || null;
        };

        // Mapeo de nombres de tabla alternativos
        const findTable = (posibles) => {
            for (const p of posibles) {
                if (nombresTablas.includes(p)) return p;
            }
            return null;
        };

        // ============================================================
        // FUNCIONES HELPER
        // ============================================================
        const addColumn = async (table, column, definition) => {
            if (!tableExists(table)) {
                console.log(`  [--] Tabla "${table}" no existe, no se puede agregar columna ${column}`);
                return false;
            }
            if (columnExists(table, column)) {
                console.log(`  [--] Columna ${column} ya existe en ${table}`);
                return false;
            }
            try {
                await conn.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
                console.log(`  [OK] Columna ${column} agregada a ${table}`);
                return true;
            } catch (e) {
                console.error(`  [!!] Error agregando columna ${column} a ${table}: ${e.message}`);
                return false;
            }
        };

        const addForeignKeySafe = async (table, constraint, column, refTable, refColumn, onDelete = 'SET NULL') => {
            if (!tableExists(table)) {
                console.log(`  [--] Tabla "${table}" no existe`);
                return false;
            }
            if (!columnExists(table, column)) {
                console.log(`  [--] Columna "${column}" no existe en ${table}`);
                return false;
            }
            if (!tableExists(refTable)) {
                console.log(`  [--] Tabla referenciada "${refTable}" no existe`);
                return false;
            }
            if (!columnExists(refTable, refColumn)) {
                console.log(`  [--] Columna "${refColumn}" no existe en ${refTable}`);
                return false;
            }

            // Verificar si la FK ya existe vía INFORMATION_SCHEMA
            const existente = await conn.query(`
                SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = ? AND COLUMN_NAME = ?
                AND REFERENCED_TABLE_NAME IS NOT NULL
            `, [table, column]);
            if (existente.length > 0) {
                console.log(`  [--] FK en ${table}.${column} ya existe (${existente[0].CONSTRAINT_NAME})`);
                return false;
            }

            try {
                const sql = `ALTER TABLE \`${table}\` ADD CONSTRAINT \`${constraint}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${refTable}\`(\`${refColumn}\`) ON DELETE ${onDelete}`;
                await conn.query(sql);
                console.log(`  [OK] FK ${constraint}: ${table}.${column} -> ${refTable}.${refColumn}`);
                return true;
            } catch (e) {
                console.error(`  [!!] Error FK ${constraint}: ${e.message}`);
                return false;
            }
        };

        const createTableIfNotExists = async (name, sql) => {
            if (tableExists(name)) {
                console.log(`  [--] Tabla "${name}" ya existe`);
                return false;
            }
            try {
                await conn.query(sql);
                console.log(`  [OK] Tabla "${name}" creada`);
                return true;
            } catch (e) {
                console.error(`  [!!] Error creando "${name}": ${e.message}`);
                return false;
            }
        };

        // ============================================================
        // 1. TABLA horas - Agregar Docente_Cedula y poblarla
        // ============================================================
        console.log('\n--- 1. TABLA horas ---');
        if (tableExists('horas')) {
            const added = await addColumn('horas', 'Docente_Cedula', 'Docente_Cedula VARCHAR(20) DEFAULT NULL');
            if (added) {
                const colNames = esquema.horas;
                console.log(`  Columnas en horas: ${colNames.join(', ')}`);
                const posiblesDocente = ['Docente', 'Nombre_Docente', 'Docente_Nombre', 'Profesor', 'Nombre_Profesor', 'NombreDocente'];
                const docenteCol = posiblesDocente.find(c => colNames.includes(c));
                if (docenteCol) {
                    const result = await conn.query(`
                        UPDATE horas h
                        JOIN docentes d ON TRIM(CONCAT(d.Nombres, ' ', d.Apellidos)) = TRIM(h.\`${docenteCol}\`)
                        SET h.Docente_Cedula = d.Cedula
                    `);
                    console.log(`  [OK] ${result.affectedRows} registros actualizados (columna: ${docenteCol})`);
                } else {
                    console.log('  [--] No se encontró columna origen para docente');
                }
            }
        } else {
            console.log('  [--] Tabla "horas" no existe');
        }

        // ============================================================
        // 2. TABLA tutores_externos
        // ============================================================
        console.log('\n--- 2. TABLA tutores_externos ---');
        await createTableIfNotExists('tutores_externos', `
            CREATE TABLE tutores_externos (
                Cedula VARCHAR(20) PRIMARY KEY,
                Nombres VARCHAR(100) NOT NULL,
                Apellidos VARCHAR(100) NOT NULL,
                Correo VARCHAR(100) DEFAULT NULL,
                Telefono VARCHAR(20) DEFAULT NULL,
                Institucion VARCHAR(100) DEFAULT NULL,
                Especialidad VARCHAR(100) DEFAULT NULL,
                Estado VARCHAR(20) DEFAULT 'Habilitado',
                Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ============================================================
        // 3. TABLA asistencia_docente (Fase 2)
        // ============================================================
        console.log('\n--- 3. TABLA asistencia_docente ---');
        await createTableIfNotExists('asistencia_docente', `
            CREATE TABLE asistencia_docente (
                ID INT AUTO_INCREMENT PRIMARY KEY,
                Docente_Cedula VARCHAR(20) NOT NULL,
                Periodo_Academico VARCHAR(20) NOT NULL,
                Asignatura VARCHAR(50) NOT NULL,
                Seccion VARCHAR(20) NOT NULL,
                Fecha DATE NOT NULL,
                Hora_Inicio TIME NOT NULL,
                Hora_Fin TIME NOT NULL,
                Estado VARCHAR(20) DEFAULT 'impartida',
                Observacion TEXT DEFAULT NULL,
                Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (Docente_Cedula) REFERENCES docentes(Cedula),
                FOREIGN KEY (Periodo_Academico) REFERENCES periodo_academico(Periodo_Academico),
                FOREIGN KEY (Asignatura) REFERENCES asignaturas(Codigo_Asignatura),
                FOREIGN KEY (Seccion) REFERENCES secciones(Codigo_Seccion)
            )
        `);

        // ============================================================
        // 4. AGREGAR ID_Solicitud a trabajo_investigacion
        // ============================================================
        console.log('\n--- 4. Columna ID_Solicitud ---');
        await addColumn('trabajo_investigacion', 'ID_Solicitud', 'ID_Solicitud INT DEFAULT NULL');

        // ============================================================
        // 5. FOREIGN KEYS
        // ============================================================
        console.log('\n--- 5. FOREIGN KEYS ---');

        // Definir todas las FKs a crear
        const fks = [
            // horas
            { table: 'horas', col: 'Docente_Cedula', ref: 'docentes', refCol: 'Cedula', onDelete: 'SET NULL' },
            // trabajo_investigacion
            { table: 'trabajo_investigacion', col: 'Cedula_Estudiante', ref: 'estudiantes', refCol: 'Cedula', onDelete: 'SET NULL' },
            { table: 'trabajo_investigacion', col: 'Tutor_Cedula', ref: 'docentes', refCol: 'Cedula', onDelete: 'SET NULL' },
            // calificaciones
            { table: 'calificaciones', col: 'Cedula_Estudiante', ref: 'estudiantes', refCol: 'Cedula', onDelete: 'SET NULL' },
            { table: 'calificaciones', col: 'Cedula_Docente', ref: 'docentes', refCol: 'Cedula', onDelete: 'SET NULL' },
            // estudiante_periodo_academico
            { table: 'estudiante_periodo_academico', col: 'Cedula_Estudiante', ref: 'estudiantes', refCol: 'Cedula', onDelete: 'CASCADE' },
            // docente_asignatura
            { table: 'docente_asignatura', col: 'Docente_Cedula', ref: 'docentes', refCol: 'Cedula', onDelete: 'CASCADE' },
            // estudiantes
            { table: 'estudiantes', col: 'Carrera', ref: 'carreras', refCol: 'Codigo_Carrera', onDelete: 'SET NULL' },
        ];

        // FKs adicionales que dependen de columnas existentes (detectadas dinámicamente)
        const fksDinamicas = [
            // horas - columnas que pueden tener nombres distintos
            { table: 'horas', posiblesCol: ['Carrera', 'Codigo_Carrera', 'Id_Carrera'], ref: 'carreras', refCol: 'Codigo_Carrera', onDelete: 'SET NULL' },
            { table: 'horas', posiblesCol: ['Pensum', 'Codigo_Pensum', 'Id_Pensum'], ref: 'pensum', refCol: 'Codigo_Pensum', onDelete: 'SET NULL' },
            { table: 'horas', posiblesCol: ['Periodo_Academico', 'Periodo', 'Id_Periodo'], ref: 'periodo_academico', refCol: 'Periodo_Academico', onDelete: 'SET NULL' },
            { table: 'horas', posiblesCol: ['Seccion', 'Codigo_Seccion', 'Id_Seccion'], ref: 'secciones', refCol: 'Codigo_Seccion', onDelete: 'SET NULL' },
            { table: 'horas', posiblesCol: ['Nivel', 'Nivel_Pensum', 'Id_Nivel'], ref: 'nivel_pensum', refCol: 'Nombre_Nivel', onDelete: 'SET NULL' },
            { table: 'horas', posiblesCol: ['Asignatura', 'Codigo_Asignatura', 'Id_Asignatura'], ref: 'asignaturas', refCol: 'Codigo_Asignatura', onDelete: 'SET NULL' },
            // trabajo_investigacion
            { table: 'trabajo_investigacion', posiblesCol: ['Carrera', 'Codigo_Carrera'], ref: 'carreras', refCol: 'Codigo_Carrera', onDelete: 'SET NULL' },
            { table: 'trabajo_investigacion', posiblesCol: ['Periodo_Academico', 'Periodo'], ref: 'periodo_academico', refCol: 'Periodo_Academico', onDelete: 'SET NULL' },
            // calificaciones
            { table: 'calificaciones', posiblesCol: ['Periodo_Academico', 'Periodo'], ref: 'periodo_academico', refCol: 'Periodo_Academico', onDelete: 'SET NULL' },
            // estudiante_periodo_academico
            { table: 'estudiante_periodo_academico', posiblesCol: ['Carrera', 'Codigo_Carrera'], ref: 'carreras', refCol: 'Codigo_Carrera', onDelete: 'SET NULL' },
            { table: 'estudiante_periodo_academico', posiblesCol: ['Periodo_Academico', 'Periodo'], ref: 'periodo_academico', refCol: 'Periodo_Academico', onDelete: 'SET NULL' },
            { table: 'estudiante_periodo_academico', posiblesCol: ['Nivel_Pensum', 'Nivel'], ref: 'nivel_pensum', refCol: 'Nombre_Nivel', onDelete: 'SET NULL' },
            // docente_asignatura
            { table: 'docente_asignatura', posiblesCol: ['Asignatura', 'Codigo_Asignatura'], ref: 'asignaturas', refCol: 'Codigo_Asignatura', onDelete: 'SET NULL' },
            { table: 'docente_asignatura', posiblesCol: ['Carrera', 'Codigo_Carrera'], ref: 'carreras', refCol: 'Codigo_Carrera', onDelete: 'SET NULL' },
            { table: 'docente_asignatura', posiblesCol: ['Pensum', 'Codigo_Pensum'], ref: 'pensum', refCol: 'Codigo_Pensum', onDelete: 'SET NULL' },
            { table: 'docente_asignatura', posiblesCol: ['Seccion', 'Codigo_Seccion'], ref: 'secciones', refCol: 'Codigo_Seccion', onDelete: 'SET NULL' },
            { table: 'docente_asignatura', posiblesCol: ['Periodo_Academico', 'Periodo'], ref: 'periodo_academico', refCol: 'Periodo_Academico', onDelete: 'SET NULL' },
            // solicitudes_tutor_interno
            { table: 'solicitudes_tutor_interno', posiblesCol: ['Cedula_Docente', 'Docente_Cedula'], ref: 'docentes', refCol: 'Cedula', onDelete: 'SET NULL' },
            { table: 'solicitudes_tutor_interno', posiblesCol: ['Cedula_Solicitante', 'Cedula_Estudiante'], ref: 'estudiantes', refCol: 'Cedula', onDelete: 'SET NULL' },
            // solicitudes_tutor_externo
            { table: 'solicitudes_tutor_externo', posiblesCol: ['Cedula_Tutor', 'Tutor_Cedula'], ref: 'tutores_externos', refCol: 'Cedula', onDelete: 'SET NULL' },
            { table: 'solicitudes_tutor_externo', posiblesCol: ['Cedula_Solicitante', 'Cedula_Estudiante'], ref: 'estudiantes', refCol: 'Cedula', onDelete: 'SET NULL' },
            // asignaturas -> carreras
            { table: 'asignaturas', posiblesCol: ['Carrera', 'Codigo_Carrera'], ref: 'carreras', refCol: 'Codigo_Carrera', onDelete: 'SET NULL' },
        ];

        // Crear FKs fijas
        let count = 0;
        for (const fk of fks) {
            const constraint = `fk_${fk.table}_${fk.col}`;
            const ok = await addForeignKeySafe(fk.table, constraint, fk.col, fk.ref, fk.refCol, fk.onDelete);
            if (ok) count++;
        }

        // Crear FKs dinámicas (detectan columna real)
        for (const fk of fksDinamicas) {
            if (!tableExists(fk.table)) continue;
            const colReal = findColumn(fk.table, fk.posiblesCol);
            if (!colReal) {
                console.log(`  [--] Ninguna columna de [${fk.posiblesCol.join(', ')}] en ${fk.table}`);
                continue;
            }
            const constraint = `fk_${fk.table}_${colReal}`;
            const ok = await addForeignKeySafe(fk.table, constraint, colReal, fk.ref, fk.refCol, fk.onDelete);
            if (ok) count++;
        }

        console.log(`\n  Total FKs creadas: ${count}`);

        // ============================================================
        // 6. MOSTRAR COLUMNAS DE CADA TABLA (debug)
        // ============================================================
        console.log('\n--- 6. ESQUEMA FINAL POR TABLA ---');
        for (const t of nombresTablas) {
            const cols = await conn.query(`SHOW COLUMNS FROM \`${t}\``);
            const info = cols.map(c => `${c.Field} (${c.Type})`).join(', ');
            console.log(`  ${t}: ${info}`);
        }

        console.log('\n========================================');
        console.log('MIGRACIÓN COMPLETADA');
        console.log('========================================');

    } catch (error) {
        console.error('\nError durante la migración:', error);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

migrate();
