// AgriChain Migration Runner — runs migrate.sql via the Node.js MySQL connection
// Usage: node server/run-migration.js
import { readFileSync } from 'fs';
import { createPool } from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'agrichain',
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 1
});

async function runMigration() {
  const sqlPath = join(__dirname, 'migrate.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log('🚀 AgriChain Database Migration — v2.0');
  console.log('⚠️  All old tables will be DROPPED and recreated.');
  console.log('─'.repeat(50));

  try {
    const conn = await pool.getConnection();
    try {
      // Execute entire migration file
      await conn.query(sql);
      console.log('✅ Migration completed successfully!');
      console.log('');
      console.log('New tables created:');
      const [tables] = await conn.query('SHOW TABLES');
      tables.forEach(t => console.log('  ✓', Object.values(t)[0]));
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err.sqlMessage || '');
    process.exit(1);
  }

  await pool.end();
  console.log('');
  console.log('🎉 Database is ready. You can now start the backend server.');
  console.log('   node server/index.js');
}

runMigration();
