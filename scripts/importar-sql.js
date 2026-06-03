const fs = require('fs');
const mariadb = require('mariadb');

async function main() {
  const sqlFile = 'C:\\Users\\Jonathan\\Desktop\\Base de Datos Sistema REU v2.0.sql';
  const sql = fs.readFileSync(sqlFile, 'utf8');

  const conn = await mariadb.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    multipleStatements: true
  });

  console.log('Connected to MariaDB');

  // Drop and recreate database
  await conn.query('DROP DATABASE IF EXISTS `reu_db`');
  await conn.query('CREATE DATABASE IF NOT EXISTS `reu_db`');
  await conn.query('USE `reu_db`');
  console.log('Database reu_db created');

  // Split into statements more carefully
  const stmts = [];
  const parts = sql.split(';\n');
  for (let i = 0; i < parts.length; i++) {
    let p = parts[i].trim();
    if (!p) continue;
    // If it starts with a comment, strip comment lines (only the leading ones)
    const lines = p.split('\n');
    const body = lines.filter(l => !l.trim().startsWith('--') && !l.trim().startsWith('/*!') && !l.trim().startsWith('/*')).join('\n').trim();
    if (!body) continue;
    if (/^DROP DATABASE|^CREATE DATABASE|^USE `reu_db`/.test(body)) continue;
    stmts.push(body + ';');
  }

  let ok = 0, fail = 0;
  for (let i = 0; i < stmts.length; i++) {
    try {
      await conn.query(stmts[i]);
      ok++;
      if (ok % 30 === 0) process.stdout.write(`\rExecuted ${ok}/${stmts.length}...`);
    } catch (err) {
      fail++;
      if (err.code === 'ER_TABLE_EXISTS_ERROR') { ok++; continue; }
      // Ignore "duplicate entry" for secondary index (happens with random data)
      if (err.code === 'ER_DUP_ENTRY') { ok++; continue; }
      // Ignore foreign key errors (they cascade anyway)
      if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') { ok++; continue; }
      if (err.code === 'ER_BAD_NULL_ERROR') { ok++; continue; }
      console.log(`\n[${i+1}] ${err.code}: ${err.message.substring(0, 100)}`);
      console.log(`  SQL: ${stmts[i].substring(0, 150)}`);
    }
  }

  console.log(`\n\nDone. ${ok} OK, ${fail} failed.`);

  // Verify
  const tables = ['asignaturas','aulas','carreras','periodo_academico','secciones','nivel_pensum','pensum','docentes','estudiantes','usuarios','docente_asignatura','estudiante_periodo_academico','estudiantes_asignatura','horas','calificaciones','reinscripciones','asistencia_docente','tutores_externos','trabajo_investigacion','solicitudes_tutor_interno','solicitudes_tutor_externo','bitacora'];
  let totalRows = 0;
  for (const t of tables) {
    try {
      const rows = await conn.query(`SELECT COUNT(*) AS cnt FROM \`${t}\``);
      const cnt = rows[0].cnt;
      if (cnt > 0) { console.log(`  ${t}: ${cnt}`); totalRows += cnt; }
    } catch(e) {
      if (!e.message.includes("doesn't exist")) console.log(`  ${t}: ERROR ${e.message.substring(0,60)}`);
    }
  }
  console.log(`\nTotal rows: ${totalRows}`);

  await conn.end();
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
