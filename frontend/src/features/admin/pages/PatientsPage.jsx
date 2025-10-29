import { useEffect, useState } from "react";
import patientService from "../../../services/patientService";

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await patientService.getPatients();
        setPatients(Array.isArray(data) ? data : data?.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Pacientes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2">Teléfono</th>
              <th className="text-left px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={4}>Cargando...</td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p.paciente_id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{p.paciente_id}</td>
                  <td className="px-4 py-2">{p.paciente_nombre} {p.paciente_apellido}</td>
                  <td className="px-4 py-2">{p.paciente_telefono || "-"}</td>
                  <td className="px-4 py-2">{p.paciente_estado === 1 ? "Activo" : "Inactivo"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientsPage;


