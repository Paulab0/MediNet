import { useEffect, useState } from "react";
import appointmentService from "../../../services/appointmentService";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await appointmentService.getAppointments();
        setAppointments(Array.isArray(data) ? data : data?.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Citas</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-left px-4 py-2">Hora</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Paciente</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={5}>Cargando...</td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.cita_id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{a.cita_id}</td>
                  <td className="px-4 py-2">{a.cita_fecha}</td>
                  <td className="px-4 py-2">{a.cita_hora}</td>
                  <td className="px-4 py-2">{a.cita_estado}</td>
                  <td className="px-4 py-2">{a.paciente_nombre} {a.paciente_apellido}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentsPage;


