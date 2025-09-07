import db from "../../database/connectiondb.js";

class Record {
    
    // Crear historial
    static async create(historialData) {
        try {
            const query = `
                INSERT INTO historiales (medico_id, paciente_id, historial_fecha, historial_estado) 
                VALUES (?, ?, ?, ?)
            `;
            const [result] = await db.executeQuery(query, [
                historialData.medico_id,
                historialData.paciente_id,
                historialData.historial_fecha || new Date().toISOString().split('T')[0],
                historialData.historial_estado || 1
            ]);
            return { success: true, insertId: result.insertId };
        } catch (error) {
            throw new Error(`Error al crear historial: ${error.message}`);
        }
    }

    // Obtener todos los historiales
    static async getAll() {
        try {
            const query = `
                SELECT 
                    h.historial_id, h.historial_fecha, h.historial_estado,
                    m.medico_id,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    p.paciente_id,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_identificacion, up.usuario_edad, up.usuario_genero
                FROM historiales h
                INNER JOIN medicos m ON h.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON h.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE h.historial_estado = 1
                ORDER BY h.historial_fecha DESC
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener historiales: ${error.message}`);
        }
    }

    // Obtener historial por ID
    static async getById(historial_id) {
        try {
            const query = `
                SELECT 
                    h.historial_id, h.medico_id, h.paciente_id, h.historial_fecha, h.historial_estado,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_identificacion, up.usuario_edad, up.usuario_genero,
                    up.usuario_telefono, up.usuario_correo
                FROM historiales h
                INNER JOIN medicos m ON h.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON h.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE h.historial_id = ? AND h.historial_estado = 1
            `;
            const [result] = await db.executeQuery(query, [historial_id]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error al obtener historial: ${error.message}`);
        }
    }

    // Obtener historial por paciente
    static async getByPaciente(paciente_id) {
        try {
            const query = `
                SELECT 
                    h.historial_id, h.historial_fecha, h.historial_estado,
                    m.medico_id,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre
                FROM historiales h
                INNER JOIN medicos m ON h.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE h.paciente_id = ? AND h.historial_estado = 1
                ORDER BY h.historial_fecha DESC
            `;
            const [result] = await db.executeQuery(query, [paciente_id]);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener historial por paciente: ${error.message}`);
        }
    }

    // Obtener historial por médico
    static async getByMedico(medico_id) {
        try {
            const query = `
                SELECT 
                    h.historial_id, h.historial_fecha, h.historial_estado,
                    p.paciente_id,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_identificacion, up.usuario_edad, up.usuario_genero
                FROM historiales h
                INNER JOIN pacientes p ON h.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE h.medico_id = ? AND h.historial_estado = 1
                ORDER BY h.historial_fecha DESC
            `;
            const [result] = await db.executeQuery(query, [medico_id]);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener historial por médico: ${error.message}`);
        }
    }

    // Obtener historial por fecha
    static async getByDate(fecha) {
        try {
            const query = `
                SELECT 
                    h.historial_id, h.historial_fecha, h.historial_estado,
                    m.medico_id,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    p.paciente_id,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_identificacion
                FROM historiales h
                INNER JOIN medicos m ON h.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON h.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE h.historial_fecha = ? AND h.historial_estado = 1
                ORDER BY um.usuario_apellido, um.usuario_nombre
            `;
            const [result] = await db.executeQuery(query, [fecha]);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener historial por fecha: ${error.message}`);
        }
    }

    // Obtener historiales de hoy
    static async getToday() {
        try {
            const query = `
                SELECT 
                    h.historial_id, h.historial_fecha, h.historial_estado,
                    m.medico_id,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    p.paciente_id,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_identificacion
                FROM historiales h
                INNER JOIN medicos m ON h.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON h.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE h.historial_fecha = CURDATE() AND h.historial_estado = 1
                ORDER BY um.usuario_apellido, um.usuario_nombre
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener historiales de hoy: ${error.message}`);
        }
    }

    // Actualizar historial
    static async update(historial_id, historialData) {
        try {
            const query = `
                UPDATE historiales SET 
                    historial_fecha = ?, historial_estado = ?
                WHERE historial_id = ?
            `;
            const [result] = await db.executeQuery(query, [
                historialData.historial_fecha,
                historialData.historial_estado,
                historial_id
            ]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al actualizar historial: ${error.message}`);
        }
    }

    // Eliminar historial (soft delete)
    static async delete(historial_id) {
        try {
            const query = `UPDATE historiales SET historial_estado = 0 WHERE historial_id = ?`;
            const [result] = await db.executeQuery(query, [historial_id]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al eliminar historial: ${error.message}`);
        }
    }

    // Buscar en historiales por paciente (nombre o identificación)
    static async searchByPaciente(searchTerm) {
        try {
            const query = `
                SELECT 
                    h.historial_id, h.historial_fecha, h.historial_estado,
                    m.medico_id,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    p.paciente_id,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_identificacion, up.usuario_edad, up.usuario_genero
                FROM historiales h
                INNER JOIN medicos m ON h.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON h.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE h.historial_estado = 1
                AND (up.usuario_nombre LIKE ? OR up.usuario_apellido LIKE ? OR up.usuario_identificacion LIKE ?)
                ORDER BY h.historial_fecha DESC
            `;
            const searchPattern = `%${searchTerm}%`;
            const [result] = await db.executeQuery(query, [searchPattern, searchPattern, searchPattern]);
            return result;
        } catch (error) {
            throw new Error(`Error al buscar en historiales: ${error.message}`);
        }
    }

    // Obtener historial completo de un paciente con un médico específico
    static async getByPacienteAndMedico(paciente_id, medico_id) {
        try {
            const query = `
                SELECT 
                    h.historial_id, h.historial_fecha, h.historial_estado,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_identificacion, up.usuario_edad, up.usuario_genero
                FROM historiales h
                INNER JOIN medicos m ON h.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON h.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE h.paciente_id = ? AND h.medico_id = ? AND h.historial_estado = 1
                ORDER BY h.historial_fecha DESC
            `;
            const [result] = await db.executeQuery(query, [paciente_id, medico_id]);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener historial por paciente y médico: ${error.message}`);
        }
    }

    // Crear historial automático después de una cita
    static async createFromAppointment(medico_id, paciente_id) {
        try {
            const fecha = new Date().toISOString().split('T')[0];
            const query = `
                INSERT INTO historiales (medico_id, paciente_id, historial_fecha, historial_estado) 
                VALUES (?, ?, ?, 1)
            `;
            const [result] = await db.executeQuery(query, [medico_id, paciente_id, fecha]);
            return { success: true, insertId: result.insertId };
        } catch (error) {
            throw new Error(`Error al crear historial desde cita: ${error.message}`);
        }
    }

    // Obtener estadísticas de historiales
    static async getStats(medico_id = null, paciente_id = null) {
        try {
            let whereClause = 'WHERE h.historial_estado = 1';
            let params = [];
            
            if (medico_id) {
                whereClause += ' AND h.medico_id = ?';
                params.push(medico_id);
            }
            
            if (paciente_id) {
                whereClause += ' AND h.paciente_id = ?';
                params.push(paciente_id);
            }

            const queries = [
                `SELECT COUNT(*) as total_historiales FROM historiales h ${whereClause}`,
                `SELECT COUNT(*) as historiales_hoy FROM historiales h ${whereClause} AND h.historial_fecha = CURDATE()`,
                `SELECT COUNT(*) as historiales_mes FROM historiales h ${whereClause} AND MONTH(h.historial_fecha) = MONTH(CURDATE()) AND YEAR(h.historial_fecha) = YEAR(CURDATE())`,
                `SELECT COUNT(*) as historiales_año FROM historiales h ${whereClause} AND YEAR(h.historial_fecha) = YEAR(CURDATE())`
            ];

            const results = await Promise.all(
                queries.map(query => db.executeQuery(query, params))
            );

            return {
                total_historiales: results[0][0][0].total_historiales,
                historiales_hoy: results[1][0][0].historiales_hoy,
                historiales_mes: results[2][0][0].historiales_mes,
                historiales_año: results[3][0][0].historiales_año
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de historiales: ${error.message}`);
        }
    }

    // Obtener resumen de atenciones por especialidad
    static async getBySpecialty() {
        try {
            const query = `
                SELECT 
                    e.especialidad_nombre,
                    COUNT(h.historial_id) as total_atenciones
                FROM historiales h
                INNER JOIN medicos m ON h.medico_id = m.medico_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE h.historial_estado = 1
                GROUP BY e.especialidad_id, e.especialidad_nombre
                ORDER BY total_atenciones DESC
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener historiales por especialidad: ${error.message}`);
        }
    }
}

export default Record;