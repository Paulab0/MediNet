import db from "../../database/connectiondb.js";

class Availability {
    
    // Crear disponibilidad
    static async create(disponibilidadData) {
        try {
            const query = `
                INSERT INTO disponibilidad (medico_id, disponibilidad_fecha, disponibilidad_hora, disponibilidad_estado) 
                VALUES (?, ?, ?, ?)
            `;
            const [result] = await db.executeQuery(query, [
                disponibilidadData.medico_id,
                disponibilidadData.disponibilidad_fecha,
                disponibilidadData.disponibilidad_hora,
                disponibilidadData.disponibilidad_estado || 1
            ]);
            return { success: true, insertId: result.insertId };
        } catch (error) {
            throw new Error(`Error al crear disponibilidad: ${error.message}`);
        }
    }

    // Crear múltiples horarios de disponibilidad
    static async createMultiple(medico_id, fecha, horas) {
        try {
            const values = horas.map(hora => [medico_id, fecha, hora, 1]);
            const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
            const query = `
                INSERT INTO disponibilidad (medico_id, disponibilidad_fecha, disponibilidad_hora, disponibilidad_estado) 
                VALUES ${placeholders}
            `;
            const flatValues = values.flat();
            const [result] = await db.executeQuery(query, flatValues);
            return { success: true, insertedCount: result.affectedRows };
        } catch (error) {
            throw new Error(`Error al crear múltiples disponibilidades: ${error.message}`);
        }
    }

    // Obtener todas las disponibilidades
    static async getAll() {
        try {
            const query = `
                SELECT 
                    d.disponibilidad_id, d.disponibilidad_fecha, d.disponibilidad_hora, d.disponibilidad_estado,
                    m.medico_id,
                    u.usuario_nombre, u.usuario_apellido,
                    e.especialidad_nombre
                FROM disponibilidad d
                INNER JOIN medicos m ON d.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE d.disponibilidad_estado = 1
                ORDER BY d.disponibilidad_fecha DESC, d.disponibilidad_hora
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener disponibilidades: ${error.message}`);
        }
    }

    // Obtener disponibilidad por ID
    static async getById(disponibilidad_id) {
        try {
            const query = `
                SELECT 
                    d.disponibilidad_id, d.medico_id, d.disponibilidad_fecha, 
                    d.disponibilidad_hora, d.disponibilidad_estado,
                    u.usuario_nombre, u.usuario_apellido,
                    e.especialidad_nombre
                FROM disponibilidad d
                INNER JOIN medicos m ON d.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE d.disponibilidad_id = ?
            `;
            const [result] = await db.executeQuery(query, [disponibilidad_id]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error al obtener disponibilidad: ${error.message}`);
        }
    }

    // Obtener disponibilidad por médico
    static async getByMedico(medico_id, fecha = null) {
        try {
            let query = `
                SELECT 
                    d.disponibilidad_id, d.disponibilidad_fecha, 
                    d.disponibilidad_hora, d.disponibilidad_estado
                FROM disponibilidad d
                WHERE d.medico_id = ?
            `;
            let params = [medico_id];

            if (fecha) {
                query += ` AND d.disponibilidad_fecha = ?`;
                params.push(fecha);
            }

            query += ` ORDER BY d.disponibilidad_fecha, d.disponibilidad_hora`;
            
            const [result] = await db.executeQuery(query, params);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener disponibilidad por médico: ${error.message}`);
        }
    }

    // Obtener disponibilidad disponible (no ocupada) por médico
    static async getAvailableByMedico(medico_id, fecha = null) {
        try {
            let query = `
                SELECT 
                    d.disponibilidad_id, d.disponibilidad_fecha, 
                    d.disponibilidad_hora, d.disponibilidad_estado
                FROM disponibilidad d
                WHERE d.medico_id = ? AND d.disponibilidad_estado = 1
            `;
            let params = [medico_id];

            if (fecha) {
                query += ` AND d.disponibilidad_fecha = ?`;
                params.push(fecha);
            } else {
                // Solo mostrar fechas futuras o de hoy
                query += ` AND d.disponibilidad_fecha >= CURDATE()`;
            }

            query += ` ORDER BY d.disponibilidad_fecha, d.disponibilidad_hora`;
            
            const [result] = await db.executeQuery(query, params);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener disponibilidad disponible: ${error.message}`);
        }
    }

    // Obtener disponibilidad por fecha
    static async getByDate(fecha) {
        try {
            const query = `
                SELECT 
                    d.disponibilidad_id, d.disponibilidad_fecha, 
                    d.disponibilidad_hora, d.disponibilidad_estado,
                    m.medico_id,
                    u.usuario_nombre, u.usuario_apellido,
                    e.especialidad_nombre
                FROM disponibilidad d
                INNER JOIN medicos m ON d.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE d.disponibilidad_fecha = ?
                ORDER BY u.usuario_apellido, u.usuario_nombre, d.disponibilidad_hora
            `;
            const [result] = await db.executeQuery(query, [fecha]);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener disponibilidad por fecha: ${error.message}`);
        }
    }

    // Actualizar disponibilidad
    static async update(disponibilidad_id, disponibilidadData) {
        try {
            const query = `
                UPDATE disponibilidad SET 
                    disponibilidad_fecha = ?, disponibilidad_hora = ?, disponibilidad_estado = ?
                WHERE disponibilidad_id = ?
            `;
            const [result] = await db.executeQuery(query, [
                disponibilidadData.disponibilidad_fecha,
                disponibilidadData.disponibilidad_hora,
                disponibilidadData.disponibilidad_estado,
                disponibilidad_id
            ]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al actualizar disponibilidad: ${error.message}`);
        }
    }

    // Cambiar estado de disponibilidad (ocupar/liberar horario)
    static async updateStatus(disponibilidad_id, estado) {
        try {
            const query = `
                UPDATE disponibilidad SET disponibilidad_estado = ?
                WHERE disponibilidad_id = ?
            `;
            const [result] = await db.executeQuery(query, [estado, disponibilidad_id]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al actualizar estado de disponibilidad: ${error.message}`);
        }
    }

    // Eliminar disponibilidad
    static async delete(disponibilidad_id) {
        try {
            const query = `DELETE FROM disponibilidad WHERE disponibilidad_id = ?`;
            const [result] = await db.executeQuery(query, [disponibilidad_id]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al eliminar disponibilidad: ${error.message}`);
        }
    }

    // Verificar si un horario específico está disponible
    static async checkSpecificAvailability(medico_id, fecha, hora) {
        try {
            const query = `
                SELECT disponibilidad_id, disponibilidad_estado 
                FROM disponibilidad 
                WHERE medico_id = ? AND disponibilidad_fecha = ? AND disponibilidad_hora = ?
            `;
            const [result] = await db.executeQuery(query, [medico_id, fecha, hora]);
            
            if (result.length === 0) {
                return { exists: false, available: false };
            }
            
            return { 
                exists: true, 
                available: result[0].disponibilidad_estado === 1,
                disponibilidad_id: result[0].disponibilidad_id
            };
        } catch (error) {
            throw new Error(`Error al verificar disponibilidad específica: ${error.message}`);
        }
    }

    // Obtener horarios ocupados por médico y fecha
    static async getOccupiedSlots(medico_id, fecha) {
        try {
            const query = `
                SELECT disponibilidad_hora 
                FROM disponibilidad 
                WHERE medico_id = ? AND disponibilidad_fecha = ? AND disponibilidad_estado = 0
                ORDER BY disponibilidad_hora
            `;
            const [result] = await db.executeQuery(query, [medico_id, fecha]);
            return result.map(row => row.disponibilidad_hora);
        } catch (error) {
            throw new Error(`Error al obtener horarios ocupados: ${error.message}`);
        }
    }

    // Generar disponibilidad para múltiples días
    static async generateAvailability(medico_id, fechaInicio, fechaFin, horas) {
        try {
            const startDate = new Date(fechaInicio);
            const endDate = new Date(fechaFin);
            const values = [];

            for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                const fecha = d.toISOString().split('T')[0];
                horas.forEach(hora => {
                    values.push([medico_id, fecha, hora, 1]);
                });
            }

            if (values.length === 0) {
                throw new Error('No hay datos para insertar');
            }

            const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
            const query = `
                INSERT IGNORE INTO disponibilidad (medico_id, disponibilidad_fecha, disponibilidad_hora, disponibilidad_estado) 
                VALUES ${placeholders}
            `;
            const flatValues = values.flat();
            const [result] = await db.executeQuery(query, flatValues);
            
            return { 
                success: true, 
                insertedCount: result.affectedRows,
                totalSlots: values.length
            };
        } catch (error) {
            throw new Error(`Error al generar disponibilidad: ${error.message}`);
        }
    }

    // Obtener estadísticas de disponibilidad
    static async getStats(medico_id = null) {
        try {
            let whereClause = '';
            let params = [];
            
            if (medico_id) {
                whereClause = 'WHERE medico_id = ?';
                params.push(medico_id);
            }

            const queries = [
                `SELECT COUNT(*) as total_slots FROM disponibilidad ${whereClause}`,
                `SELECT COUNT(*) as available_slots FROM disponibilidad ${whereClause} ${medico_id ? 'AND' : 'WHERE'} disponibilidad_estado = 1`,
                `SELECT COUNT(*) as occupied_slots FROM disponibilidad ${whereClause} ${medico_id ? 'AND' : 'WHERE'} disponibilidad_estado = 0`,
                `SELECT COUNT(*) as today_available FROM disponibilidad ${whereClause} ${medico_id ? 'AND' : 'WHERE'} disponibilidad_fecha = CURDATE() AND disponibilidad_estado = 1`
            ];

            const results = await Promise.all(
                queries.map(query => db.executeQuery(query, params))
            );

            return {
                total_slots: results[0][0][0].total_slots,
                available_slots: results[1][0][0].available_slots,
                occupied_slots: results[2][0][0].occupied_slots,
                today_available: results[3][0][0].today_available
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de disponibilidad: ${error.message}`);
        }
    }
}

export default Availability;