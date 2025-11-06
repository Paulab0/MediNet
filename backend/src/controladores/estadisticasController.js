import db from "../../database/connectiondb.js";

const estadisticasController = {
  // Obtener estadísticas básicas del sistema
  async getBasicStats(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;

      // Construir filtro de fecha
      let fechaFilter = "";
      const params = [];
      if (fecha_desde && fecha_hasta) {
        fechaFilter = " AND c.cita_fecha BETWEEN ? AND ?";
        params.push(fecha_desde, fecha_hasta);
      } else if (fecha_desde) {
        fechaFilter = " AND c.cita_fecha >= ?";
        params.push(fecha_desde);
      } else if (fecha_hasta) {
        fechaFilter = " AND c.cita_fecha <= ?";
        params.push(fecha_hasta);
      }

      // 1. Citas por mes (últimos 12 meses)
      const citasPorMesQuery = `
        SELECT 
          DATE_FORMAT(c.cita_fecha, '%Y-%m') as mes,
          DATE_FORMAT(c.cita_fecha, '%b %Y') as mes_formateado,
          COUNT(*) as total_citas,
          COUNT(CASE WHEN c.cita_estado = 'Completada' THEN 1 END) as citas_completadas,
          COUNT(CASE WHEN c.cita_estado = 'Cancelada' THEN 1 END) as citas_canceladas
        FROM citas c
        WHERE c.cita_fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        ${fechaFilter}
        GROUP BY DATE_FORMAT(c.cita_fecha, '%Y-%m'), DATE_FORMAT(c.cita_fecha, '%b %Y')
        ORDER BY mes ASC
      `;

      // 2. Especialidades más solicitadas
      const especialidadesQuery = `
        SELECT 
          e.especialidad_id,
          e.especialidad_nombre,
          COUNT(c.cita_id) as total_citas,
          COUNT(CASE WHEN c.cita_estado = 'Completada' THEN 1 END) as citas_completadas
        FROM citas c
        INNER JOIN medicos m ON c.medico_id = m.medico_id
        INNER JOIN especialidades e ON m.especialidad_id = e.especialidad_id
        WHERE 1=1 ${fechaFilter}
        GROUP BY e.especialidad_id, e.especialidad_nombre
        ORDER BY total_citas DESC
        LIMIT 10
      `;

      // 3. Estadísticas generales
      const statsGeneralesQuery = `
        SELECT 
          COUNT(*) as total_citas,
          COUNT(CASE WHEN c.cita_estado = 'Completada' THEN 1 END) as citas_completadas,
          COUNT(CASE WHEN c.cita_estado = 'Cancelada' THEN 1 END) as citas_canceladas,
          COUNT(CASE WHEN c.cita_estado = 'Programada' OR c.cita_estado = 'Confirmada' THEN 1 END) as citas_pendientes,
          COUNT(DISTINCT c.paciente_id) as total_pacientes,
          COUNT(DISTINCT c.medico_id) as total_medicos
        FROM citas c
        WHERE 1=1 ${fechaFilter}
      `;

      // 4. Citas por día de la semana
      const citasPorDiaQuery = `
        SELECT 
          DAYNAME(c.cita_fecha) as dia_semana,
          DAYOFWEEK(c.cita_fecha) as dia_numero,
          COUNT(*) as total_citas
        FROM citas c
        WHERE 1=1 ${fechaFilter}
        GROUP BY DAYNAME(c.cita_fecha), DAYOFWEEK(c.cita_fecha)
        ORDER BY dia_numero ASC
      `;

      // Ejecutar todas las consultas
      const [citasPorMesResult, especialidadesResult, statsGeneralesResult, citasPorDiaResult] = await Promise.all([
        db.executeQuery(citasPorMesQuery, params),
        db.executeQuery(especialidadesQuery, params),
        db.executeQuery(statsGeneralesQuery, params),
        db.executeQuery(citasPorDiaQuery, params),
      ]);

      // Verificar errores
      if (!citasPorMesResult.success) {
        throw new Error(citasPorMesResult.error);
      }
      if (!especialidadesResult.success) {
        throw new Error(especialidadesResult.error);
      }
      if (!statsGeneralesResult.success) {
        throw new Error(statsGeneralesResult.error);
      }
      if (!citasPorDiaResult.success) {
        throw new Error(citasPorDiaResult.error);
      }

      res.json({
        citas_por_mes: citasPorMesResult.data || [],
        especialidades_mas_solicitadas: especialidadesResult.data || [],
        estadisticas_generales: statsGeneralesResult.data[0] || {},
        citas_por_dia: citasPorDiaResult.data || [],
      });
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default estadisticasController;

