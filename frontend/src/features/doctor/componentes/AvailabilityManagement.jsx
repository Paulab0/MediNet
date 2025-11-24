import { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import disponibilidadService from "../../../servicios/servicioDisponibilidad";
import { useAuth } from "../../../contextos/AuthContext";

const AvailabilityManagement = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({
    disponibilidad_fecha: "",
    disponibilidad_hora: "",
  });
  const [bulkFormData, setBulkFormData] = useState({
    fechaInicio: "",
    fechaFin: "",
    horas: [],
  });

  // Horas disponibles comunes
  const commonHours = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  ];

  useEffect(() => {
    if (isOpen && user?.medico_id) {
      loadAvailability();
    }
  }, [isOpen, user?.medico_id]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await disponibilidadService.getByMedico(user.medico_id);
      setAvailability(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al cargar disponibilidad");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHourToggle = (hora) => {
    setBulkFormData((prev) => {
      const horas = prev.horas || [];
      if (horas.includes(hora)) {
        return { ...prev, horas: horas.filter((h) => h !== hora) };
      } else {
        return { ...prev, horas: [...horas, hora] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await disponibilidadService.create({
        medico_id: user.medico_id,
        disponibilidad_fecha: formData.disponibilidad_fecha,
        disponibilidad_hora: formData.disponibilidad_hora,
        disponibilidad_estado: 1,
      });
      setSuccess("Horario agregado exitosamente");
      setIsAdding(false);
      setFormData({ disponibilidad_fecha: "", disponibilidad_hora: "" });
      await loadAvailability();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al agregar horario");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkFormData.horas || bulkFormData.horas.length === 0) {
      setError("Selecciona al menos una hora");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await disponibilidadService.generateAvailability(
        user.medico_id,
        bulkFormData.fechaInicio,
        bulkFormData.fechaFin,
        bulkFormData.horas
      );
      setSuccess("Horarios generados exitosamente");
      setBulkFormData({ fechaInicio: "", fechaFin: "", horas: [] });
      await loadAvailability();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al generar horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditing(item.disponibilidad_id);
    setFormData({
      disponibilidad_fecha: item.disponibilidad_fecha,
      disponibilidad_hora: item.disponibilidad_hora,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await disponibilidadService.update(isEditing, {
        disponibilidad_fecha: formData.disponibilidad_fecha,
        disponibilidad_hora: formData.disponibilidad_hora,
        disponibilidad_estado: 1,
      });
      setSuccess("Horario actualizado exitosamente");
      setIsEditing(null);
      setFormData({ disponibilidad_fecha: "", disponibilidad_hora: "" });
      await loadAvailability();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar horario");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este horario?")) return;
    try {
      setLoading(true);
      setError(null);
      await disponibilidadService.delete(id);
      setSuccess("Horario eliminado exitosamente");
      await loadAvailability();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar horario");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({ disponibilidad_fecha: "", disponibilidad_hora: "" });
    setBulkFormData({ fechaInicio: "", fechaFin: "", horas: [] });
    setError(null);
  };

  // Agrupar disponibilidad por fecha
  const groupedAvailability = availability.reduce((acc, item) => {
    const fecha = item.disponibilidad_fecha;
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(item);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Logo MediNet en la parte superior */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-2xl">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white drop-shadow-lg">MediNet</h1>
              <p className="text-xs text-blue-100 font-medium tracking-widest mt-1">SISTEMA MÉDICO</p>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestión de Disponibilidad</h2>
              <p className="text-sm text-gray-500">Gestiona tus horarios disponibles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Botones de acción */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdding(true)}
              disabled={loading || isEditing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Agregar Horario
            </button>
            <button
              onClick={() => setBulkFormData({ fechaInicio: "", fechaFin: "", horas: [] })}
              disabled={loading || isEditing || isAdding}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <CalendarIcon className="w-5 h-5" />
              Generar Múltiples Horarios
            </button>
          </div>

          {/* Formulario de agregar/editar */}
          {(isAdding || isEditing) && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">
                {isEditing ? "Editar Horario" : "Agregar Horario"}
              </h3>
              <form onSubmit={isEditing ? handleUpdate : handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      name="disponibilidad_fecha"
                      value={formData.disponibilidad_fecha}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora *
                    </label>
                    <input
                      type="time"
                      name="disponibilidad_hora"
                      value={formData.disponibilidad_hora}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckIcon className="w-5 h-5" />
                    {isEditing ? "Actualizar" : "Agregar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Formulario de generación masiva */}
          {!isAdding && !isEditing && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Generar Múltiples Horarios</h3>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Inicio *
                    </label>
                    <input
                      type="date"
                      name="fechaInicio"
                      value={bulkFormData.fechaInicio}
                      onChange={handleBulkInputChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Fin *
                    </label>
                    <input
                      type="date"
                      name="fechaFin"
                      value={bulkFormData.fechaFin}
                      onChange={handleBulkInputChange}
                      required
                      min={bulkFormData.fechaInicio || new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas Disponibles *
                  </label>
                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 rounded-xl">
                    {commonHours.map((hora) => (
                      <button
                        key={hora}
                        type="button"
                        onClick={() => handleHourToggle(hora)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          bulkFormData.horas?.includes(hora)
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                  {bulkFormData.horas && bulkFormData.horas.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {bulkFormData.horas.length} hora(s) seleccionada(s)
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckIcon className="w-5 h-5" />
                  Generar Horarios
                </button>
              </form>
            </div>
          )}

          {/* Lista de disponibilidad */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Horarios Disponibles</h3>
            {loading && !availability.length ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : Object.keys(groupedAvailability).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No hay horarios disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(groupedAvailability)
                  .sort()
                  .map((fecha) => (
                    <div key={fecha} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {new Date(fecha).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {groupedAvailability[fecha].length} horario(s)
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {groupedAvailability[fecha]
                          .sort((a, b) => a.disponibilidad_hora.localeCompare(b.disponibilidad_hora))
                          .map((item) => (
                            <div
                              key={item.disponibilidad_id}
                              className={`flex items-center justify-between p-2 rounded-lg ${
                                item.disponibilidad_estado === 1
                                  ? "bg-green-50 border border-green-200"
                                  : "bg-gray-50 border border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium">{item.disponibilidad_hora}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEdit(item)}
                                  disabled={loading || isEditing}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                                  title="Editar"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.disponibilidad_id)}
                                  disabled={loading || isEditing}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                  title="Eliminar"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManagement;

