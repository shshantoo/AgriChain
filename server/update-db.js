import db from './db.js';

async function updateDB() {
  try {
    console.log('Dropping old users table...');
    await db.query('DROP TABLE IF EXISTS users');
    
    console.log('Creating new users table with email and password...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('farmer', 'warehouse', 'processing', 'supplier', 'admin') NOT NULL,
        region VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Active',
        last_login DATETIME
      )
    `);
    console.log('Successfully updated users table schema!');
    process.exit(0);
  } catch(e) {
    console.error('Database update failed:', e);
    process.exit(1);
  }
}

updateDB();
