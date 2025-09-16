import db from "../../database/connectiondb.js";
import bcrypt from "bcrypt";

class User {
    
    // Crear usuario
    static async create(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.usuario_contrasena, 10);
            const query = `
                INSERT INTO usuarios (
                    usuario_nombre, usuario_apellido, usuario_edad, usuario_genero,
                    usuario_identificacion, usuario_direccion, usuario_ciudad,
                    usuario_correo, usuario_telefono, usuario_contrasena,
                    rol_id, identificacion_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await db.executeQuery(query, [
                userData.usuario_nombre,
                userData.usuario_apellido,
                userData.usuario_edad,
                userData.usuario_genero,
                userData.usuario_identificacion,
                userData.usuario_direccion,
                userData.usuario_ciudad,
                userData.usuario_correo,
                userData.usuario_telefono,
                hashedPassword,
                userData.rol_id,
                userData.identificacion_id
            ]);
            return { success: true, insertId: result.insertId };
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    // Obtener todos los usuarios
    static async getAll() {
        try {
            const query = `
                SELECT u.*, r.rol_nombre, ti.identificacion_tipo 
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.rol_id
                LEFT JOIN tipos_identificaciones ti ON u.identificacion_id = ti.identificacion_id
                WHERE u.usuario_estado = 1
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    // Obtener usuario por ID
    static async getById(usuario_id) {
        try {
            const query = `
                SELECT u.*, r.rol_nombre, ti.identificacion_tipo 
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.rol_id
                LEFT JOIN tipos_identificaciones ti ON u.identificacion_id = ti.identificacion_id
                WHERE u.usuario_id = ? AND u.usuario_estado = 1
            `;
            const [result] = await db.executeQuery(query, [usuario_id]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error al obtener usuario: ${error.message}`);
        }
    }

    // Obtener usuario por email (para login)
    static async findByEmail(usuario_correo) {
        try {
            const query = `
                SELECT u.*, r.rol_nombre 
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.rol_id
                WHERE u.usuario_correo = ? AND u.usuario_estado = 1
            `;
            const [result] = await db.executeQuery(query, [usuario_correo]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error al buscar usuario por email: ${error.message}`);
        }
    }

    // Actualizar usuario
    static async update(usuario_id, userData) {
        try {
            let query = `
                UPDATE usuarios SET 
                    usuario_nombre = ?, usuario_apellido = ?, usuario_edad = ?,
                    usuario_genero = ?, usuario_direccion = ?, usuario_ciudad = ?,
                    usuario_correo = ?, usuario_contrasena = ?, usuario_telefono = ?, rol_id = ?, identificacion_id = ?
            `;
            let values = [
                userData.usuario_nombre,
                userData.usuario_apellido,
                userData.usuario_edad,
                userData.usuario_genero,
                userData.usuario_direccion,
                userData.usuario_ciudad,
                userData.usuario_correo,
                userData.usuario_contrasena,
                userData.usuario_telefono,
                userData.rol_id,
                userData.identificacion_id
            ];

            if (userData.usuario_contrasena) {
                const hashedPassword = await bcrypt.hash(userData.usuario_contrasena, 10);
                query += `, usuario_contrasena = ?`;
                values.push(hashedPassword);
            }

            query += ` WHERE usuario_id = ?`;
            values.push(usuario_id);

            const result = await db.executeQuery(query, values);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }

    // Eliminar usuario (soft delete)
    static async delete(usuario_id) {
        try {
            const query = `UPDATE usuarios SET usuario_estado = 0 WHERE usuario_id = ?`;
            const [result] = await db.executeQuery(query, [usuario_id]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    // Verificar contraseña
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Obtener usuarios por rol
    static async getByRole(rol_id) {
        try {
            const query = `
                SELECT u.*, r.rol_nombre, ti.identificacion_tipo 
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.rol_id
                LEFT JOIN tipos_identificaciones ti ON u.identificacion_id = ti.identificacion_id
                WHERE u.rol_id = ? AND u.usuario_estado = 1
            `;
            const [result] = await db.executeQuery(query, [rol_id]);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
        }
    }
}

export default User;