import { pool } from '../database/connectiondb.js';

async function verificarTabla() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Verificar si la tabla existe
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'login_verification_tokens'
    `);
    
    if (tables.length > 0) {
      console.log('✅ La tabla login_verification_tokens EXISTE');
      
      // Verificar estructura
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'login_verification_tokens'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('\n📋 Estructura de la tabla:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
      });
    } else {
      console.log('❌ La tabla login_verification_tokens NO EXISTE');
      console.log('🔄 Intentando crear la tabla...');
      
      // Crear la tabla directamente
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`login_verification_tokens\` (
          \`token_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`usuario_id\` INT NOT NULL,
          \`token\` VARCHAR(255) UNIQUE NOT NULL,
          \`login_ip\` VARCHAR(45),
          \`login_user_agent\` TEXT,
          \`login_fecha\` DATETIME DEFAULT CURRENT_TIMESTAMP,
          \`token_expiracion\` DATETIME NOT NULL,
          \`token_verificado\` BOOLEAN DEFAULT 0,
          \`token_fecha_verificacion\` DATETIME NULL,
          \`token_estado\` BOOLEAN DEFAULT 1,
          FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`usuario_id\`) ON DELETE CASCADE,
          INDEX \`idx_token\` (\`token\`),
          INDEX \`idx_usuario\` (\`usuario_id\`),
          INDEX \`idx_expiracion\` (\`token_expiracion\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      
      console.log('✅ Tabla creada exitosamente');
    }
    
    // Verificar base de datos actual
    const [dbInfo] = await connection.query('SELECT DATABASE() as db');
    console.log(`\n📊 Base de datos actual: ${dbInfo[0].db}`);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    if (connection) {
      connection.release();
    }
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

verificarTabla();

