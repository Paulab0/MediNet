import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../database/connectiondb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ejecutarMigracion() {
  let connection;
  try {
    console.log('🔄 Ejecutando migración de login_verification_tokens...');
    
    // Obtener conexión del pool
    connection = await pool.getConnection();
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../database/migrations/login_verification.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir el SQL en statements (separados por ;)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Ejecutar cada statement
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    
    console.log('✅ Migración ejecutada exitosamente');
    console.log('✅ Tabla login_verification_tokens creada');
    connection.release();
    process.exit(0);
  } catch (error) {
    if (connection) {
      connection.release();
    }
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  }
}

ejecutarMigracion();

