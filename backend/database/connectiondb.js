import mysql from 'mysql2';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medinetdb',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisificar el pool para usar async/await (async, la función siempre devolverá una promesa y promesa es algo que se tiene que cumplir )
// (await, esperar que funcione el async ) 
// (try, es intentar que todo funcione de manera correcta)
// (catch, siempre indicara un error o que no ejecuto de manera correcta)
const promisePool = pool.promise();

// Función para testear la conexión
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al conectar con MySQL:', error.message);
    return false;
  }
};

// Función para ejecutar queries de forma segura
const executeQuery = async (query, params = []) => {
  try {
    const [rows, fields] = await promisePool.execute(query, params);
    return { success: true, data: rows, fields };
  } catch (error) {
    console.error('Error ejecutando query:', error);
    return { success: false, error: error.message };
  }
};
//queries son las peticiones de la base de datos, 
// la funcion del script es para ejecutar los queries(que son peticiones como; create, read, update y delete) 
// recibiendo los parametros de cada peticion (campos de base de datos que recibe)

// Función para transacciones
const executeTransaction = async (queries) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [rows] = await connection.execute(query, params || []);
      results.push(rows);
    }
    
    await connection.commit();
    connection.release();
    
    return { success: true, results };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error en transacción:', error);
    return { success: false, error: error.message };
  }
};

// EXPORTS NOMBRADOS - Para usar import { executeQuery }
export { promisePool as pool, testConnection, executeQuery, executeTransaction };

// EXPORT DEFAULT - Para usar import db from '...'
export default {
  pool: promisePool,
  testConnection,
  executeQuery,
  executeTransaction
};

//las puedo llamar de manera individual asi: "export { promisePool as pool, testConnection, executeQuery, executeTransaction };"
//las puedo agrupar y llamar todas con un pool "export default {
                                                //pool: promisePool,
                                                // testConnection,
                                                // executeQuery,
                                                // executeTransaction"