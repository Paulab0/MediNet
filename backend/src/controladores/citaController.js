import Appointment from "../modelos/citaModel.js";
import emailService from "../servicios/emailService.js";
import Notificacion from "../modelos/notificacionModel.js";
import LogActividad from "../modelos/logActividadModel.js";

const appointmentController = {
  // Crear cita
  async create(req, res) {
    try {
      const citaData = req.body;
      const result = await Appointment.create(citaData);

      // Enviar notificación por email si la cita fue creada exitosamente
      if (result.success && result.insertId) {
        try {
          // Obtener información completa de la cita para el email
          const citaCompleta = await Appointment.getById(result.insertId);
          
          if (citaCompleta) {
            // Obtener datos del paciente y médico (el getById ya incluye esta info)
            if (citaCompleta.paciente_id && citaCompleta.usuario_correo) {
              // Log para depuración
              console.log('📧 Datos para email de confirmación:', {
                consultorio: citaCompleta.medico_consultorio,
                especialidad: citaCompleta.especialidad_nombre,
                identificacion: citaCompleta.usuario_identificacion
              });
              
              // Enviar email de confirmación
              await emailService.sendAppointmentConfirmationEmail(
                citaCompleta.usuario_correo,
                `${citaCompleta.paciente_nombre} ${citaCompleta.paciente_apellido}`,
                {
                  fecha: citaCompleta.cita_fecha,
                  hora: citaCompleta.cita_hora,
                  medico: `${citaCompleta.medico_nombre || ''} ${citaCompleta.medico_apellido || ''}`.trim() || 'Médico',
                  especialidad: citaCompleta.especialidad_nombre,
                  consultorio: citaCompleta.medico_consultorio || null,
                  identificacion: citaCompleta.usuario_identificacion,
                  tipo: citaCompleta.cita_tipo,
                  observaciones: citaCompleta.cita_observaciones,
                }
              );

              // Obtener usuario_id del paciente para la notificación
              const db = (await import("../../database/connectiondb.js")).default;
              const pacienteQuery = `SELECT usuario_id FROM pacientes WHERE paciente_id = ?`;
              const pacienteResult = await db.executeQuery(pacienteQuery, [citaCompleta.paciente_id]);
              
              if (pacienteResult.success && pacienteResult.data && pacienteResult.data[0]) {
                const pacienteUserId = pacienteResult.data[0].usuario_id;
                
                // Crear notificación
                await Notificacion.create({
                  usuario_id: pacienteUserId,
                  notificacion_titulo: "Cita Confirmada",
                  notificacion_mensaje: `Tu cita ha sido confirmada para el ${citaCompleta.cita_fecha} a las ${citaCompleta.cita_hora}`,
                  notificacion_tipo: "Cita",
                });
              }
            }
          }
        } catch (emailError) {
          console.error("Error enviando notificación de cita:", emailError);
          // No fallar la creación de la cita si falla el email
        }

          // Registrar log
        try {
          const clientIp = req.ip || req.connection.remoteAddress;
          const userAgent = req.get('user-agent');
          await LogActividad.create({
            usuario_id: req.user?.usuario_id || null,
            log_tipo: "Crear",
            log_entidad: "Cita",
            log_descripcion: `Cita creada: ID ${result.insertId}`,
            log_ip: clientIp,
            log_user_agent: userAgent,
          });
        } catch (logError) {
          console.error("Error registrando log:", logError);
        }
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener todas las citas
  async getAll(req, res) {
    try {
      const result = await Appointment.getAll();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener cita por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await Appointment.getById(id);
      if (!result) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar cita
  async update(req, res) {
    try {
      const { id } = req.params;
      const citaData = req.body;
      const result = await Appointment.update(id, citaData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Eliminar cita (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await Appointment.delete(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener citas por fecha
  async getByDate(req, res) {
    try {
      const { fecha } = req.params;
      const result = await Appointment.getByDate(fecha);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener citas de hoy
  async getToday(req, res) {
    try {
      const result = await Appointment.getToday();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener próximas citas
  async getUpcoming(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const result = await Appointment.getUpcoming(limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estadísticas de citas
  async getStats(req, res) {
    try {
      const { medico_id } = req.query;
      const result = await Appointment.getStats(medico_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar estado de cita
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      // Validar que el estado sea válido
      const validStates = ["Programada", "Confirmada", "Completada", "Cancelada", "No asistió"];
      if (!validStates.includes(estado)) {
        return res.status(400).json({
          error: "Estado inválido. Debe ser: Programada, Confirmada, Completada, Cancelada o No asistió",
        });
      }

      const result = await Appointment.updateStatus(id, estado);

      // Registrar log
      try {
        const clientIp = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');
        await LogActividad.create({
          usuario_id: req.user?.usuario_id || null,
          log_tipo: "Actualizar",
          log_entidad: "Cita",
          log_descripcion: `Estado de cita ${id} actualizado a: ${estado}`,
          log_ip: clientIp,
          log_user_agent: userAgent,
        });
      } catch (logError) {
        console.error("Error registrando log:", logError);
      }

      res.json(result);
    } catch (error) {
      console.error(
        `❌ [AppointmentController] Error actualizando estado:`,
        error
      );
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener citas por paciente
  async getByPaciente(req, res) {
    try {
      const { paciente_id } = req.params;
      const result = await Appointment.getByPaciente(paciente_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default appointmentController;
