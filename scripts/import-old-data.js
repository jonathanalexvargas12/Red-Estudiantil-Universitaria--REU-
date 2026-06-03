const fs = require('fs');
const mariadb = require('mariadb');

async function main() {
  const oldSql = fs.readFileSync('scripts/old_data.sql', 'utf8');
  
  const conn = await mariadb.createConnection({host:'localhost',user:'root',password:'',port:3306,multipleStatements:true});
  await conn.query('USE reu_db');
  await conn.query('SET FOREIGN_KEY_CHECKS=0');
  console.log('Connected\n');

  // Parse INSERT blocks
  const blocks = oldSql.match(/INSERT INTO.*?;\n/gs) || [];
  console.log(`Found ${blocks.length} INSERT blocks\n`);

  for (const block of blocks) {
    const m = block.match(/INSERT INTO `(\w+)` \(([^)]+)\)/);
    if (!m) continue;
    const table = m[1];
    const cols = m[2].split(',').map(c => c.trim().replace(/`/g, ''));

    // Get current table columns
    let curCols;
    try {
      const result = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
      curCols = new Set(result.map(r => r.Field));
    } catch(e) {
      console.log(`  SKIP \`${table}\`: table not found`);
      continue;
    }

    // Filter to valid columns only
    const validCols = cols.filter(c => curCols.has(c));
    const invalidCols = cols.filter(c => !curCols.has(c));

    if (validCols.length === 0) {
      console.log(`  SKIP \`${table}\`: no matching columns`);
      continue;
    }

    if (invalidCols.length > 0) {
      console.log(`  \`${table}\`: dropping [${invalidCols.join(',')}]`);
    }

    // Build the INSERT with column mapping
    // Get the column indices to keep
    const keepIdx = cols.map((c, i) => curCols.has(c) ? i : -1).filter(i => i >= 0);

    // Extract rows
    const valuesMatch = block.match(/VALUES\s*([\s\S]+?);\n/);
    if (!valuesMatch) continue;
    const valuesStr = valuesMatch[1].trim();

    // Parse each row
    const newRows = [];
    const rowStrs = valuesStr.split('\n').map(l => l.trim()).filter(l => l.startsWith('('));
    
    for (const rowStr of rowStrs) {
      const vals = parseValues(rowStr);
      if (vals.length !== cols.length) {
        console.log(`    Row parse error: expected ${cols.length} values, got ${vals.length}`);
        continue;
      }
      const filtered = keepIdx.map(i => vals[i]);
      newRows.push(filtered);
    }

    if (newRows.length === 0) continue;

    // Build SQL
    const colList = validCols.map(c => `\`${c}\``).join(',');
    const rowsSql = newRows.map(r => '(' + r.join(',') + ')').join(',\n\t');
    const sql = `INSERT INTO \`${table}\` (${colList}) VALUES\n\t${rowsSql};`;

    try {
      await conn.query(sql);
      console.log(`  OK \`${table}\`: ${newRows.length} rows`);
    } catch(err) {
      console.log(`  ERR \`${table}\`: ${err.message.substring(0, 120)}`);
      console.log(`    SQL: ${sql.substring(0, 100)}...`);
    }
  }

  await conn.query('SET FOREIGN_KEY_CHECKS=1');
  console.log('\nDone');
  await conn.end();
}

function parseValues(rowStr) {
  const vals = [];
  let cur = '', depth = 0, inStr = false;
  for (let i = 0; i < rowStr.length; i++) {
    const c = rowStr[i];
    if (c === "'" && (i === 0 || rowStr[i-1] !== '\\')) { inStr = !inStr; cur += c; continue; }
    if (inStr) { cur += c; continue; }
    if (c === '(' && depth === 0) { depth++; continue; }
    if (c === ',' && depth === 1) { vals.push(cur.trim()); cur = ''; continue; }
    if (c === ')' && depth === 1) { depth--; if (cur.trim()) vals.push(cur.trim()); continue; }
    if (c === ';') continue;
    cur += c;
  }
  return vals;
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
