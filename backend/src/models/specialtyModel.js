import db from "../../database/connectiondb.js";

class Specialty {
  // Obtener todas las especialidades
  static async getAll() {
    try {
      console.log("🔍 [SpecialtyModel] Obteniendo todas las especialidades");
      const query = `
        SELECT especialidad_id, especialidad_nombre
        FROM especialidades 
        ORDER BY especialidad_nombre ASC
      `;

      const result = await db.executeQuery(query);
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(
        `📊 [SpecialtyModel] Especialidades encontradas: ${result.data.length}`
      );
      return result.data;
    } catch (error) {
      throw new Error(`Error al obtener especialidades: ${error.message}`);
    }
  }

  // Obtener especialidad por ID
  static async getById(id) {
    try {
      console.log(`🔍 [SpecialtyModel] Obteniendo especialidad ID: ${id}`);
      const query = `
        SELECT especialidad_id, especialidad_nombre
        FROM especialidades 
        WHERE especialidad_id = ?
      `;

      const result = await db.executeQuery(query, [id]);
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(
        `📊 [SpecialtyModel] Especialidad encontrada:`,
        result.data[0]
      );
      return result.data[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener especialidad: ${error.message}`);
    }
  }
}

export default Specialty;
