import db from "../../database/connectiondb.js";

class Reminder {
    
    // Crear recordatorio
    static async create(recordatorioData) {
        try {
            const query = `
                INSERT INTO recordatorios (medico_id, recordatorio_fecha, recordatorio_hora, recordatorio_estado) 
                VALUES (?, ?, ?, ?)
            `;
            const result = await db.executeQuery(query, [
                recordatorioData.medico_id,
                recordatorioData.recordatorio_fecha,
                recordatorioData.recordatorio_hora,
                recordatorioData.recordatorio_estado || 1
            ]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return { success: true, insertId: result.data.insertId };
        } catch (error) {
            throw new Error(`Error al crear recordatorio: ${error.message}`);
        }
    }

    // Obtener todos los recordatorios
    static async getAll() {
        try {
            const query = `
                SELECT 
                    r.recordatorio_id, r.recordatorio_fecha, r.recordatorio_hora, r.recordatorio_estado,
                    m.medico_id,
                    u.usuario_nombre, u.usuario_apellido,
                    e.especialidad_nombre
                FROM recordatorios r
                INNER JOIN medicos m ON r.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE r.recordatorio_estado = 1
                ORDER BY r.recordatorio_fecha DESC, r.recordatorio_hora DESC
            `;
            const result = await db.executeQuery(query);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        } catch (error) {
            throw new Error(`Error al obtener recordatorios: ${error.message}`);
        }
    }

    // Obtener recordatorio por ID
    static async getById(recordatorio_id) {
        try {
            const query = `
                SELECT 
                    r.recordatorio_id, r.medico_id, r.recordatorio_fecha, 
                    r.recordatorio_hora, r.recordatorio_estado,
                    u.usuario_nombre, u.usuario_apellido,
                    e.especialidad_nombre
                FROM recordatorios r
                INNER JOIN medicos m ON r.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE r.recordatorio_id = ? AND r.recordatorio_estado = 1
            `;
            const result = await db.executeQuery(query, [recordatorio_id]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data[0] || null;
        } catch (error) {
            throw new Error(`Error al obtener recordatorio: ${error.message}`);
        }
    }

    // Obtener recordatorios por médico
    static async getByMedico(medico_id, fecha = null) {
        try {
            let query = `
                SELECT 
                    r.recordatorio_id, r.recordatorio_fecha, 
                    r.recordatorio_hora, r.recordatorio_estado
                FROM recordatorios r
                WHERE r.medico_id = ? AND r.recordatorio_estado = 1
            `;
            let params = [medico_id];

            if (fecha) {
                query += ` AND r.recordatorio_fecha = ?`;
                params.push(fecha);
            }

            query += ` ORDER BY r.recordatorio_fecha DESC, r.recordatorio_hora DESC`;
            
            const result = await db.executeQuery(query, params);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        } catch (error) {
            throw new Error(`Error al obtener recordatorios por médico: ${error.message}`);
        }
    }

    // Obtener recordatorios por fecha
    static async getByDate(fecha) {
        try {
            const query = `
                SELECT 
                    r.recordatorio_id, r.recordatorio_fecha, 
                    r.recordatorio_hora, r.recordatorio_estado,
                    m.medico_id,
                    u.usuario_nombre, u.usuario_apellido,
                    e.especialidad_nombre
                FROM recordatorios r
                INNER JOIN medicos m ON r.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE r.recordatorio_fecha = ? AND r.recordatorio_estado = 1
                ORDER BY r.recordatorio_hora
            `;
            const result = await db.executeQuery(query, [fecha]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        } catch (error) {
            throw new Error(`Error al obtener recordatorios por fecha: ${error.message}`);
        }
    }

    // Obtener recordatorios de hoy
    static async getToday() {
        try {
            const query = `
                SELECT 
                    r.recordatorio_id, r.recordatorio_fecha, 
                    r.recordatorio_hora, r.recordatorio_estado,
                    m.medico_id,
                    u.usuario_nombre, u.usuario_apellido,
                    e.especialidad_nombre
                FROM recordatorios r
                INNER JOIN medicos m ON r.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE r.recordatorio_fecha = CURDATE() AND r.recordatorio_estado = 1
                ORDER BY r.recordatorio_hora
            `;
            const result = await db.executeQuery(query);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        } catch (error) {
            throw new Error(`Error al obtener recordatorios de hoy: ${error.message}`);
        }
    }

    // Obtener próximos recordatorios
    static async getUpcoming(limit = 10) {
        try {
            const query = `
                SELECT 
                    r.recordatorio_id, r.recordatorio_fecha, 
                    r.recordatorio_hora, r.recordatorio_estado,
                    m.medico_id,
                    u.usuario_nombre, u.usuario_apellido,
                    e.especialidad_nombre
                FROM recordatorios r
                INNER JOIN medicos m ON r.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE r.recordatorio_estado = 1 
                AND (r.recordatorio_fecha > CURDATE() OR (r.recordatorio_fecha = CURDATE() AND r.recordatorio_hora >= CURTIME()))
                ORDER BY r.recordatorio_fecha ASC, r.recordatorio_hora ASC
                LIMIT ?
            `;
            const result = await db.executeQuery(query, [limit]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        } catch (error) {
            throw new Error(`Error al obtener próximos recordatorios: ${error.message}`);
        }
    }

    // Actualizar recordatorio
    static async update(recordatorio_id, recordatorioData) {
        try {
            const query = `
                UPDATE recordatorios SET 
                    recordatorio_fecha = ?, recordatorio_hora = ?, recordatorio_estado = ?
                WHERE recordatorio_id = ?
            `;
            const result = await db.executeQuery(query, [
                recordatorioData.recordatorio_fecha,
                recordatorioData.recordatorio_hora,
                recordatorioData.recordatorio_estado,
                recordatorio_id
            ]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return { success: result.data.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al actualizar recordatorio: ${error.message}`);
        }
    }

    // Eliminar recordatorio (soft delete)
    static async delete(recordatorio_id) {
        try {
            const query = `UPDATE recordatorios SET recordatorio_estado = 0 WHERE recordatorio_id = ?`;
            const result = await db.executeQuery(query, [recordatorio_id]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return { success: result.data.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al eliminar recordatorio: ${error.message}`);
        }
    }

    // Marcar recordatorio como completado
    static async markAsCompleted(recordatorio_id) {
        try {
            const query = `UPDATE recordatorios SET recordatorio_estado = 0 WHERE recordatorio_id = ?`;
            const result = await db.executeQuery(query, [recordatorio_id]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return { success: result.data.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al marcar recordatorio como completado: ${error.message}`);
        }
    }

    // Obtener recordatorios pendientes por médico
    static async getPendingByMedico(medico_id) {
        try {
            const query = `
                SELECT 
                    r.recordatorio_id, r.recordatorio_fecha, 
                    r.recordatorio_hora, r.recordatorio_estado
                FROM recordatorios r
                WHERE r.medico_id = ? AND r.recordatorio_estado = 1 
                AND (r.recordatorio_fecha > CURDATE() OR (r.recordatorio_fecha = CURDATE() AND r.recordatorio_hora >= CURTIME()))
                ORDER BY r.recordatorio_fecha ASC, r.recordatorio_hora ASC
            `;
            const result = await db.executeQuery(query, [medico_id]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        } catch (error) {
            throw new Error(`Error al obtener recordatorios pendientes del médico: ${error.message}`);
        }
    }

    // Obtener recordatorios vencidos
    static async getOverdue() {
        try {
            const query = `
                SELECT 
                    r.recordatorio_id, r.recordatorio_fecha, 
                    r.recordatorio_hora, r.recordatorio_estado,
                    m.medico_id,
                    u.usuario_nombre, u.usuario_apellido,
                    e.especialidad_nombre
                FROM recordatorios r
                INNER JOIN medicos m ON r.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE r.recordatorio_estado = 1 
                AND (r.recordatorio_fecha < CURDATE() OR (r.recordatorio_fecha = CURDATE() AND r.recordatorio_hora < CURTIME()))
                ORDER BY r.recordatorio_fecha DESC, r.recordatorio_hora DESC
            `;
            const result = await db.executeQuery(query);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        } catch (error) {
            throw new Error(`Error al obtener recordatorios vencidos: ${error.message}`);
        }
    }

    // Crear recordatorio automático para cita
    static async createForAppointment(medico_id, cita_id, cita_fecha, cita_hora, minutes_before = 30) {
        try {
            // Calcular fecha y hora del recordatorio
            const citaDateTime = new Date(`${cita_fecha}T${cita_hora}`);
            const recordatorioDateTime = new Date(citaDateTime.getTime() - (minutes_before * 60000));
            
            const recordatorio_fecha = recordatorioDateTime.toISOString().split('T')[0];
            const recordatorio_hora = recordatorioDateTime.toTimeString().split(' ')[0];

            // Determinar tipo de recordatorio
            let recordatorio_tipo = 'Personalizado';
            if (minutes_before === 1440) {
                recordatorio_tipo = '24h_antes';
            } else if (minutes_before === 60) {
                recordatorio_tipo = '1h_antes';
            }

            const query = `
                INSERT INTO recordatorios (medico_id, cita_id, recordatorio_fecha, recordatorio_hora, recordatorio_estado, recordatorio_enviado, recordatorio_tipo) 
                VALUES (?, ?, ?, ?, 1, FALSE, ?)
            `;
            const result = await db.executeQuery(query, [
                medico_id,
                cita_id,
                recordatorio_fecha,
                recordatorio_hora,
                recordatorio_tipo
            ]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return { success: true, insertId: result.data.insertId };
        } catch (error) {
            throw new Error(`Error al crear recordatorio automático: ${error.message}`);
        }
    }

    // Obtener recordatorios pendientes de envío
    static async getPendingReminders() {
        try {
            const query = `
                SELECT 
                    r.recordatorio_id, r.cita_id, r.medico_id, 
                    r.recordatorio_fecha, r.recordatorio_hora, r.recordatorio_tipo,
                    c.cita_fecha, c.cita_hora, c.cita_tipo, c.cita_observaciones,
                    c.paciente_id,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_correo as paciente_email, up.usuario_telefono as paciente_telefono,
                    e.especialidad_nombre,
                    m.medico_consultorio
                FROM recordatorios r
                INNER JOIN citas c ON r.cita_id = c.cita_id
                INNER JOIN medicos m ON r.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                INNER JOIN pacientes p ON c.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE r.recordatorio_estado = 1 
                AND (r.recordatorio_enviado = 0 OR r.recordatorio_enviado = FALSE)
                AND c.cita_estado NOT IN ('Cancelada', 'Completada', 'No asistió')
                AND (
                    (r.recordatorio_fecha < CURDATE()) 
                    OR (r.recordatorio_fecha = CURDATE() AND r.recordatorio_hora <= CURTIME())
                )
                ORDER BY r.recordatorio_fecha ASC, r.recordatorio_hora ASC
            `;
            const result = await db.executeQuery(query);
            if (!result.success) {
                console.error('❌ [ReminderModel] Error en consulta SQL:', result.error);
                console.error('❌ [ReminderModel] Query:', query);
                throw new Error(result.error || 'Error desconocido al ejecutar la consulta');
            }
            return result.data || [];
        } catch (error) {
            console.error('❌ [ReminderModel] Error completo en getPendingReminders:', error);
            throw new Error(`Error al obtener recordatorios pendientes: ${error.message}`);
        }
    }

    // Marcar recordatorio como enviado
    static async markAsSent(recordatorio_id) {
        try {
            const query = `UPDATE recordatorios SET recordatorio_enviado = TRUE WHERE recordatorio_id = ?`;
            const result = await db.executeQuery(query, [recordatorio_id]);
            if (!result.success) {
                throw new Error(result.error);
            }
            return { success: result.data.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al marcar recordatorio como enviado: ${error.message}`);
        }
    }

    // Obtener estadísticas de recordatorios
    static async getStats(medico_id = null) {
        try {
            let whereClause = '';
            let params = [];
            
            if (medico_id) {
                whereClause = 'WHERE medico_id = ?';
                params.push(medico_id);
            }

            const queries = [
                `SELECT COUNT(*) as total_recordatorios FROM recordatorios ${whereClause} ${medico_id ? 'AND' : 'WHERE'} recordatorio_estado = 1`,
                `SELECT COUNT(*) as recordatorios_hoy FROM recordatorios ${whereClause} ${medico_id ? 'AND' : 'WHERE'} recordatorio_fecha = CURDATE() AND recordatorio_estado = 1`,
                `SELECT COUNT(*) as recordatorios_pendientes FROM recordatorios ${whereClause} ${medico_id ? 'AND' : 'WHERE'} recordatorio_estado = 1 AND (recordatorio_fecha > CURDATE() OR (recordatorio_fecha = CURDATE() AND recordatorio_hora >= CURTIME()))`,
                `SELECT COUNT(*) as recordatorios_vencidos FROM recordatorios ${whereClause} ${medico_id ? 'AND' : 'WHERE'} recordatorio_estado = 1 AND (recordatorio_fecha < CURDATE() OR (recordatorio_fecha = CURDATE() AND recordatorio_hora < CURTIME()))`
            ];

            const results = await Promise.all(
                queries.map(query => db.executeQuery(query, params))
            );

            // Verificar que todas las consultas fueron exitosas
            for (let i = 0; i < results.length; i++) {
                if (!results[i].success) {
                    throw new Error(`Error en consulta ${i + 1}: ${results[i].error}`);
                }
            }

            return {
                total_recordatorios: results[0].data[0].total_recordatorios,
                recordatorios_hoy: results[1].data[0].recordatorios_hoy,
                recordatorios_pendientes: results[2].data[0].recordatorios_pendientes,
                recordatorios_vencidos: results[3].data[0].recordatorios_vencidos
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de recordatorios: ${error.message}`);
        }
    }
}

export default Reminder;