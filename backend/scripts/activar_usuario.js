import { executeQuery, testConnection } from '../database/connectiondb.js';
import dotenv from 'dotenv';

dotenv.config();

const usuarioCorreo = process.argv[2] || 'buitragopaula769@gmail.com';

async function activarUsuario() {
  console.log(`🔄 Activando usuario: ${usuarioCorreo}`);
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ No se pudo establecer conexión con la base de datos.');
    process.exit(1);
  }

  try {
    // Primero verificar si el usuario existe
    const checkQuery = `SELECT usuario_id, usuario_nombre, usuario_apellido, usuario_estado, rol_id FROM usuarios WHERE usuario_correo = ?`;
    const checkResult = await executeQuery(checkQuery, [usuarioCorreo]);

    if (!checkResult.success) {
      console.error('❌ Error al verificar usuario:', checkResult.error);
      process.exit(1);
    }

    if (!checkResult.data || checkResult.data.length === 0) {
      console.error(`❌ Usuario con correo ${usuarioCorreo} no encontrado`);
      process.exit(1);
    }

    const usuario = checkResult.data[0];
    console.log(`📋 Usuario encontrado:`, {
      id: usuario.usuario_id,
      nombre: `${usuario.usuario_nombre} ${usuario.usuario_apellido}`,
      estado_actual: usuario.usuario_estado === 1 ? 'Activo' : 'Inactivo',
      rol_id: usuario.rol_id
    });

    if (usuario.usuario_estado === 1) {
      console.log('✅ El usuario ya está activo');
      process.exit(0);
    }

    // Activar el usuario
    const updateQuery = `UPDATE usuarios SET usuario_estado = 1 WHERE usuario_correo = ?`;
    const updateResult = await executeQuery(updateQuery, [usuarioCorreo]);

    if (!updateResult.success) {
      console.error('❌ Error al activar usuario:', updateResult.error);
      process.exit(1);
    }

    if (updateResult.data.affectedRows === 0) {
      console.error('❌ No se pudo actualizar el usuario');
      process.exit(1);
    }

    console.log('✅ Usuario activado exitosamente');
    console.log(`✅ El usuario ${usuario.usuario_nombre} ${usuario.usuario_apellido} ahora puede iniciar sesión`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  }
}

activarUsuario();

