import { useEffect, useState } from "react";
import {
  PlusIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import doctorService from "../../../servicios/servicioMedico";
import RegisterDoctorForm from "../componentes/RegisterDoctorForm";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterFormOpen, setIsRegisterFormOpen] = useState(false);
  const [editingConsultorio, setEditingConsultorio] = useState(null);
  const [consultorioValue, setConsultorioValue] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctors();
      setDoctors(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error cargando médicos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (medico_id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este médico?")) {
      return;
    }

    try {
      await doctorService.deleteDoctor(medico_id);
      await loadDoctors();
      alert("Médico eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando médico:", error);
      alert("Error al eliminar el médico");
    }
  };

  const handleEditConsultorio = (doctor) => {
    setEditingConsultorio(doctor.medico_id);
    setConsultorioValue(doctor.medico_consultorio || "");
  };

  const handleSaveConsultorio = async (medico_id) => {
    try {
      await doctorService.updateMedicalInfo(medico_id, {
        medico_consultorio: consultorioValue.trim() || null,
      });
      setEditingConsultorio(null);
      setConsultorioValue("");
      await loadDoctors();
    } catch (error) {
      console.error("Error actualizando consultorio:", error);
      alert("Error al actualizar el consultorio");
    }
  };

  const handleCancelEdit = () => {
    setEditingConsultorio(null);
    setConsultorioValue("");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Médicos</h1>
          <p className="text-gray-600">Administra los médicos del sistema</p>
        </div>
        <button
          onClick={() => setIsRegisterFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Registrar Médico</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando médicos...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay médicos registrados</p>
            <p className="text-gray-500 text-sm mt-2">
              Comienza registrando el primer médico
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Especialidad</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Consultorio</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contacto</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.medico_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{doctor.medico_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {doctor.usuario_foto_perfil ? (
                          <img
                            src={doctor.usuario_foto_perfil}
                            alt={doctor.usuario_nombre}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {doctor.usuario_nombre || "Sin nombre"} {doctor.usuario_apellido || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {doctor.especialidad_nombre || "Sin especialidad"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {editingConsultorio === doctor.medico_id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={consultorioValue}
                            onChange={(e) => setConsultorioValue(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                            placeholder="Ej: Consultorio 150, Piso 3"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveConsultorio(doctor.medico_id);
                              } else if (e.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSaveConsultorio(doctor.medico_id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Guardar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Cancelar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          {doctor.medico_consultorio ? (
                            <>
                              <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                              <span>{doctor.medico_consultorio}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">No especificado</span>
                          )}
                          <button
                            onClick={() => handleEditConsultorio(doctor)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Editar consultorio"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {doctor.usuario_correo && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <EnvelopeIcon className="w-3 h-3" />
                            <span>{doctor.usuario_correo}</span>
                          </div>
                        )}
                        {doctor.usuario_telefono && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <PhoneIcon className="w-3 h-3" />
                            <span>{doctor.usuario_telefono}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doctor.medico_estado === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doctor.medico_estado === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(doctor.medico_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar médico"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro */}
      <RegisterDoctorForm
        isOpen={isRegisterFormOpen}
        onClose={() => setIsRegisterFormOpen(false)}
        onSuccess={() => {
          loadDoctors();
          setIsRegisterFormOpen(false);
        }}
      />
    </div>
  );
};

export default DoctorsPage;


