import db from "../../database/connectiondb.js";

class Role {
    
    // Crear rol
    static async create(rolData) {
        try {
            const query = `
                INSERT INTO roles (rol_nombre) 
                VALUES (?)
            `;
            const [result] = await db.executeQuery(query, [
                rolData.rol_nombre
            ]);
            return { success: true, insertId: result.insertId };
        } catch (error) {
            throw new Error(`Error al crear rol: ${error.message}`);
        }
    }

    // Obtener todos los roles
    static async getAll() {
        try {
            const query = `
                SELECT 
                    r.rol_id, r.rol_nombre,
                    COUNT(u.usuario_id) as total_usuarios
                FROM roles r
                LEFT JOIN usuarios u ON r.rol_id = u.rol_id AND u.usuario_estado = 1
                GROUP BY r.rol_id, r.rol_nombre
                ORDER BY r.rol_id
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener roles: ${error.message}`);
        }
    }

    // Obtener rol por ID
    static async getById(rol_id) {
        try {
            const query = `
                SELECT 
                    r.rol_id, r.rol_nombre,
                    COUNT(u.usuario_id) as total_usuarios
                FROM roles r
                LEFT JOIN usuarios u ON r.rol_id = u.rol_id AND u.usuario_estado = 1
                WHERE r.rol_id = ?
                GROUP BY r.rol_id, r.rol_nombre
            `;
            const [result] = await db.executeQuery(query, [rol_id]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error al obtener rol: ${error.message}`);
        }
    }

    // Actualizar rol
    static async update(rol_id, rolData) {
        try {
            const query = `
                UPDATE roles SET 
                    rol_nombre = ?
                WHERE rol_id = ?
            `;
            const [result] = await db.executeQuery(query, [
                rolData.rol_nombre,
                rol_id
            ]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al actualizar rol: ${error.message}`);
        }
    }

    // Eliminar rol
    static async delete(rol_id) {
        try {
            // Verificar si hay usuarios asociados
            const checkQuery = `SELECT COUNT(*) as count FROM usuarios WHERE rol_id = ? AND usuario_estado = 1`;
            const [checkResult] = await db.executeQuery(checkQuery, [rol_id]);
            
            if (checkResult[0].count > 0) {
                throw new Error('No se puede eliminar el rol porque tiene usuarios asociados');
            }

            const query = `DELETE FROM roles WHERE rol_id = ?`;
            const [result] = await db.executeQuery(query, [rol_id]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al eliminar rol: ${error.message}`);
        }
    }

    // Obtener usuarios por rol
    static async getUsersByRol(rol_id) {
        try {
            const query = `
                SELECT 
                    u.usuario_id, u.usuario_nombre, u.usuario_apellido, 
                    u.usuario_correo, u.usuario_telefono, u.usuario_identificacion,
                    u.usuario_fecha_registro, u.usuario_estado
                FROM usuarios u
                WHERE u.rol_id = ? AND u.usuario_estado = 1
                ORDER BY u.usuario_apellido, u.usuario_nombre
            `;
            const [result] = await db.executeQuery(query, [rol_id]);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
        }
    }

    // Verificar si un rol existe por nombre
    static async existsByName(rol_nombre, rol_id = null) {
        try {
            let query = `SELECT rol_id FROM roles WHERE rol_nombre = ?`;
            let params = [rol_nombre];

            if (rol_id) {
                query += ` AND rol_id != ?`;
                params.push(rol_id);
            }

            const [result] = await db.executeQuery(query, params);
            return result.length > 0;
        } catch (error) {
            throw new Error(`Error al verificar rol: ${error.message}`);
        }
    }

    // Obtener estadísticas por rol
    static async getStats() {
        try {
            const query = `
                SELECT 
                    r.rol_id, r.rol_nombre,
                    COUNT(u.usuario_id) as total_usuarios,
                    SUM(CASE WHEN u.usuario_estado = 1 THEN 1 ELSE 0 END) as usuarios_activos,
                    SUM(CASE WHEN u.usuario_estado = 0 THEN 1 ELSE 0 END) as usuarios_inactivos
                FROM roles r
                LEFT JOIN usuarios u ON r.rol_id = u.rol_id
                GROUP BY r.rol_id, r.rol_nombre
                ORDER BY r.rol_id
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de roles: ${error.message}`);
        }
    }
}

export default Role;