import Historial from "../modelos/historialModel.js";

const historialController = {
  // Obtener todos los pacientes de un médico
  async getPatients(req, res) {
    try {
      const { medico_id } = req.params;

      console.log(
        `🔍 [HistorialController] Obteniendo pacientes del médico ${medico_id}`
      );

      const patients = await Historial.getPatientsByDoctor(medico_id);

      console.log(
        `📊 [HistorialController] Pacientes encontrados:`,
        patients.length
      );

      res.json(patients);
    } catch (error) {
      console.error(
        `❌ [HistorialController] Error obteniendo pacientes:`,
        error
      );
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener historial de un paciente específico
  async getPatientHistory(req, res) {
    try {
      const { medico_id, paciente_id } = req.params;

      console.log(
        `🔍 [HistorialController] Obteniendo historial del paciente ${paciente_id} del médico ${medico_id}`
      );

      const history = await Historial.getByPatient(medico_id, paciente_id);

      console.log(
        `📊 [HistorialController] Registros de historial encontrados:`,
        history.length
      );

      res.json(history);
    } catch (error) {
      console.error(
        `❌ [HistorialController] Error obteniendo historial:`,
        error
      );
      res.status(400).json({ error: error.message });
    }
  },

  // Crear nuevo registro de historial
  async createRecord(req, res) {
    try {
      const { medico_id, paciente_id } = req.params;
      const historialData = {
        ...req.body,
        medico_id: parseInt(medico_id),
        paciente_id: parseInt(paciente_id),
      };

      console.log(
        `🔍 [HistorialController] Creando registro de historial:`,
        historialData
      );

      const result = await Historial.create(historialData);

      console.log(`✅ [HistorialController] Registro creado exitosamente`);

      res.json(result);
    } catch (error) {
      console.error(`❌ [HistorialController] Error creando registro:`, error);
      res.status(400).json({ error: error.message });
    }
  },

  // Actualizar registro de historial
  async updateRecord(req, res) {
    try {
      const { historial_id } = req.params;
      const historialData = req.body;

      console.log(
        `🔍 [HistorialController] Actualizando registro ${historial_id}:`,
        historialData
      );

      const result = await Historial.update(historial_id, historialData);

      console.log(`✅ [HistorialController] Registro actualizado exitosamente`);

      res.json(result);
    } catch (error) {
      console.error(
        `❌ [HistorialController] Error actualizando registro:`,
        error
      );
      res.status(400).json({ error: error.message });
    }
  },

  // Eliminar registro de historial
  async deleteRecord(req, res) {
    try {
      const { historial_id } = req.params;

      console.log(
        `🔍 [HistorialController] Eliminando registro ${historial_id}`
      );

      const result = await Historial.delete(historial_id);

      console.log(`✅ [HistorialController] Registro eliminado exitosamente`);

      res.json(result);
    } catch (error) {
      console.error(
        `❌ [HistorialController] Error eliminando registro:`,
        error
      );
      res.status(400).json({ error: error.message });
    }
  },
};

export default historialController;
