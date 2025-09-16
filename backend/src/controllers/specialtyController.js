import Specialty from "../models/specialtyModel.js";

const specialtyController = {
  // Obtener todas las especialidades
  async getAll(req, res) {
    try {
      console.log(
        "🔍 [SpecialtyController] Obteniendo todas las especialidades"
      );
      const result = await Specialty.getAll();
      console.log(
        "📊 [SpecialtyController] Especialidades obtenidas:",
        result.length
      );
      res.json(result);
    } catch (error) {
      console.error("❌ [SpecialtyController] Error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener especialidad por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      console.log(`🔍 [SpecialtyController] Obteniendo especialidad ID: ${id}`);
      const result = await Specialty.getById(id);

      if (!result) {
        return res.status(404).json({ error: "Especialidad no encontrada" });
      }

      console.log("📊 [SpecialtyController] Especialidad encontrada:", result);
      res.json(result);
    } catch (error) {
      console.error("❌ [SpecialtyController] Error:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default specialtyController;
