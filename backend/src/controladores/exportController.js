import db from "../../database/connectiondb.js";

const exportController = {
  // Exportar historial médico a PDF
  async exportMedicalHistory(req, res) {
    try {
      const { paciente_id } = req.params;
      const { fecha_desde, fecha_hasta } = req.query;

      // Obtener historial médico
      let query = `
        SELECT 
          h.*,
          u_paciente.usuario_nombre as paciente_nombre,
          u_paciente.usuario_apellido as paciente_apellido,
          u_paciente.usuario_identificacion as paciente_identificacion,
          u_medico.usuario_nombre as medico_nombre,
          u_medico.usuario_apellido as medico_apellido,
          e.especialidad_nombre
        FROM historiales h
        INNER JOIN pacientes p ON h.paciente_id = p.paciente_id
        INNER JOIN usuarios u_paciente ON p.usuario_id = u_paciente.usuario_id
        INNER JOIN medicos m ON h.medico_id = m.medico_id
        INNER JOIN usuarios u_medico ON m.usuario_id = u_medico.usuario_id
        LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
        WHERE h.paciente_id = ? AND h.historial_estado = 1
      `;
      const params = [paciente_id];

      if (fecha_desde) {
        query += " AND h.historial_fecha >= ?";
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        query += " AND h.historial_fecha <= ?";
        params.push(fecha_hasta);
      }

      query += " ORDER BY h.historial_fecha DESC";

      const result = await db.executeQuery(query, params);

      if (!result.success) {
        throw new Error(result.error);
      }

      const historiales = result.data || [];

      // Generar HTML para PDF
      const htmlContent = generatePDFHTML(historiales, fecha_desde, fecha_hasta);

      // Configurar headers para descargar como PDF
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="historial_medico_${paciente_id}_${Date.now()}.html"`);

      res.send(htmlContent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Exportar reporte de citas a Excel/PDF
  async exportAppointmentsReport(req, res) {
    try {
      const { medico_id, fecha_desde, fecha_hasta, formato } = req.query;

      let query = `
        SELECT 
          c.*,
          u_paciente.usuario_nombre as paciente_nombre,
          u_paciente.usuario_apellido as paciente_apellido,
          u_paciente.usuario_telefono as paciente_telefono,
          u_medico.usuario_nombre as medico_nombre,
          u_medico.usuario_apellido as medico_apellido,
          e.especialidad_nombre
        FROM citas c
        INNER JOIN pacientes p ON c.paciente_id = p.paciente_id
        INNER JOIN usuarios u_paciente ON p.usuario_id = u_paciente.usuario_id
        INNER JOIN medicos m ON c.medico_id = m.medico_id
        INNER JOIN usuarios u_medico ON m.usuario_id = u_medico.usuario_id
        LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
        WHERE 1=1
      `;
      const params = [];

      if (medico_id) {
        query += " AND c.medico_id = ?";
        params.push(medico_id);
      }

      if (fecha_desde) {
        query += " AND c.cita_fecha >= ?";
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        query += " AND c.cita_fecha <= ?";
        params.push(fecha_hasta);
      }

      query += " ORDER BY c.cita_fecha DESC, c.cita_hora DESC";

      const result = await db.executeQuery(query, params);

      if (!result.success) {
        throw new Error(result.error);
      }

      const citas = result.data || [];

      if (formato === 'excel' || formato === 'csv') {
        // Generar CSV (compatible con Excel)
        const csvContent = generateCSV(citas);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_citas_${Date.now()}.csv"`);
        res.send('\ufeff' + csvContent); // BOM para Excel
      } else {
        // Generar HTML para PDF
        const htmlContent = generateAppointmentsPDFHTML(citas, fecha_desde, fecha_hasta);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_citas_${Date.now()}.html"`);
        res.send(htmlContent);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

// Función para generar HTML del historial médico
function generatePDFHTML(historiales, fecha_desde, fecha_hasta) {
  const fechaActual = new Date().toLocaleDateString('es-ES');
  const paciente = historiales[0] || {};

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Historial Médico</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
    }
    .patient-info {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .patient-info h2 {
      margin-top: 0;
      color: #1f2937;
    }
    .historial-item {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .historial-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .historial-date {
      font-weight: bold;
      color: #2563eb;
    }
    .historial-type {
      background: #dbeafe;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      color: #1e40af;
    }
    .section {
      margin-bottom: 15px;
    }
    .section-title {
      font-weight: bold;
      color: #374151;
      margin-bottom: 5px;
    }
    .section-content {
      color: #6b7280;
      line-height: 1.6;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
    @media print {
      body { margin: 20px; }
      .historial-item { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MediNet - Historial Médico</h1>
    <p>Fecha de generación: ${fechaActual}</p>
  </div>

  <div class="patient-info">
    <h2>Información del Paciente</h2>
    <p><strong>Nombre:</strong> ${paciente.paciente_nombre || ''} ${paciente.paciente_apellido || ''}</p>
    <p><strong>Identificación:</strong> ${paciente.paciente_identificacion || 'N/A'}</p>
    ${fecha_desde || fecha_hasta ? `<p><strong>Período:</strong> ${fecha_desde || 'Inicio'} - ${fecha_hasta || 'Actual'}</p>` : ''}
  </div>

  <h2 style="color: #1f2937; margin-bottom: 20px;">Registros Médicos</h2>

  ${historiales.length === 0 
    ? '<p style="text-align: center; color: #9ca3af; padding: 40px;">No hay registros médicos en el período seleccionado.</p>'
    : historiales.map(h => `
    <div class="historial-item">
      <div class="historial-header">
        <div>
          <span class="historial-date">${new Date(h.historial_fecha).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        <span class="historial-type">${h.historial_tipo || 'Consulta'}</span>
      </div>

      <div class="section">
        <div class="section-title">Médico:</div>
        <div class="section-content">
          Dr. ${h.medico_nombre || ''} ${h.medico_apellido || ''} - ${h.especialidad_nombre || 'Sin especialidad'}
        </div>
      </div>

      ${h.historial_diagnostico ? `
      <div class="section">
        <div class="section-title">Diagnóstico:</div>
        <div class="section-content">${h.historial_diagnostico}</div>
      </div>
      ` : ''}

      ${h.historial_tratamiento ? `
      <div class="section">
        <div class="section-title">Tratamiento:</div>
        <div class="section-content">${h.historial_tratamiento}</div>
      </div>
      ` : ''}

      ${h.historial_medicamentos ? `
      <div class="section">
        <div class="section-title">Medicamentos:</div>
        <div class="section-content">${h.historial_medicamentos}</div>
      </div>
      ` : ''}

      ${h.historial_observaciones ? `
      <div class="section">
        <div class="section-title">Observaciones:</div>
        <div class="section-content">${h.historial_observaciones}</div>
      </div>
      ` : ''}

      ${h.historial_estado_paciente ? `
      <div class="section">
        <div class="section-title">Estado del Paciente:</div>
        <div class="section-content">${h.historial_estado_paciente}</div>
      </div>
      ` : ''}

      ${h.historial_proxima_cita ? `
      <div class="section">
        <div class="section-title">Próxima Cita:</div>
        <div class="section-content">${new Date(h.historial_proxima_cita).toLocaleDateString('es-ES')}</div>
      </div>
      ` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p>Este documento fue generado el ${fechaActual} por MediNet</p>
    <p>Documento confidencial - Solo para uso médico</p>
  </div>
</body>
</html>
  `;
}

// Función para generar HTML de reporte de citas
function generateAppointmentsPDFHTML(citas, fecha_desde, fecha_hasta) {
  const fechaActual = new Date().toLocaleDateString('es-ES');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Citas</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }
    th {
      background: #2563eb;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
    @media print {
      body { margin: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MediNet - Reporte de Citas</h1>
    <p>Fecha de generación: ${fechaActual}</p>
    ${fecha_desde || fecha_hasta ? `<p>Período: ${fecha_desde || 'Inicio'} - ${fecha_hasta || 'Actual'}</p>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Hora</th>
        <th>Paciente</th>
        <th>Médico</th>
        <th>Especialidad</th>
        <th>Tipo</th>
        <th>Estado</th>
        <th>Observaciones</th>
      </tr>
    </thead>
    <tbody>
      ${citas.length === 0 
        ? '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #9ca3af;">No hay citas en el período seleccionado.</td></tr>'
        : citas.map(c => `
        <tr>
          <td>${new Date(c.cita_fecha).toLocaleDateString('es-ES')}</td>
          <td>${c.cita_hora ? c.cita_hora.substring(0, 5) : 'N/A'}</td>
          <td>${c.paciente_nombre || ''} ${c.paciente_apellido || ''}</td>
          <td>Dr. ${c.medico_nombre || ''} ${c.medico_apellido || ''}</td>
          <td>${c.especialidad_nombre || 'Sin especialidad'}</td>
          <td>${c.cita_tipo || 'Consulta'}</td>
          <td>${c.cita_estado || 'Pendiente'}</td>
          <td>${c.cita_observaciones || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Total de citas: ${citas.length}</p>
    <p>Este documento fue generado el ${fechaActual} por MediNet</p>
  </div>
</body>
</html>
  `;
}

// Función para generar CSV
function generateCSV(citas) {
  const headers = ['Fecha', 'Hora', 'Paciente', 'Médico', 'Especialidad', 'Tipo', 'Estado', 'Observaciones'];
  const rows = citas.map(c => [
    new Date(c.cita_fecha).toLocaleDateString('es-ES'),
    c.cita_hora ? c.cita_hora.substring(0, 5) : 'N/A',
    `${c.paciente_nombre || ''} ${c.paciente_apellido || ''}`,
    `Dr. ${c.medico_nombre || ''} ${c.medico_apellido || ''}`,
    c.especialidad_nombre || 'Sin especialidad',
    c.cita_tipo || 'Consulta',
    c.cita_estado || 'Pendiente',
    c.cita_observaciones || '-'
  ]);

  const csvRows = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ];

  return csvRows.join('\n');
}

export default exportController;


