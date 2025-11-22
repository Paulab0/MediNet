import { useState, useEffect } from "react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import doctorService from "../../../servicios/servicioMedico";
import specialtyService from "../../../servicios/servicioEspecialidad";
import { useAuth } from "../../../contextos/AuthContext";

const EditMedicalInfoForm = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    especialidad_id: "",
    medico_consultorio: "",
  });
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      // Cargar especialidades
      const specialtiesData = await specialtyService.getSpecialties();
      setSpecialties(Array.isArray(specialtiesData) ? specialtiesData : specialtiesData?.data || []);

      // Cargar información actual del médico
      if (user?.medico_id) {
        const doctorData = await doctorService.getProfile(user.medico_id);
        setFormData({
          especialidad_id: doctorData.especialidad_id || "",
          medico_consultorio: doctorData.medico_consultorio || "",
        });
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await doctorService.updateMedicalInfo(user.medico_id, formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar información médica");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        {/* Logo MediNet en la parte superior */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-2xl">
          <div className="flex items-center justify-center mb-2">
            <div className="text-center">
              <h1 className="text-3xl font-black text-white drop-shadow-lg">
                MediNet
              </h1>
              <p className="text-xs text-blue-100 font-medium tracking-widest mt-1">
                SISTEMA MÉDICO
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <h2 className="text-2xl font-bold text-white">Información Médica</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">¡Información actualizada exitosamente!</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidad *
              </label>
              <select
                name="especialidad_id"
                value={formData.especialidad_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar especialidad</option>
                {specialties.map((specialty) => (
                  <option key={specialty.especialidad_id} value={specialty.especialidad_id}>
                    {specialty.especialidad_nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultorio
              </label>
              <input
                type="text"
                name="medico_consultorio"
                value={formData.medico_consultorio}
                onChange={handleChange}
                placeholder="Ej: Consultorio 101, Piso 2"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ubicación física del consultorio donde atiendes
              </p>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMedicalInfoForm;


