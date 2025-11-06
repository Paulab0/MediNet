import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import estadisticasService from "../../../servicios/servicioEstadisticas";

const StatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fecha_desde: "",
    fecha_hasta: "",
  });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadStats();
  }, [filters]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await estadisticasService.getBasicStats(
        filters.fecha_desde || null,
        filters.fecha_hasta || null
      );
      setStats(data);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
      setError(err.response?.data?.error || err.message || "Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Calcular porcentajes
  const calcularPorcentaje = (valor, total) => {
    if (total === 0) return 0;
    return ((valor / total) * 100).toFixed(1);
  };

  // Obtener el mes actual para comparación
  const getMesActual = () => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const generales = stats?.estadisticas_generales || {};
  const citasPorMes = stats?.citas_por_mes || [];
  const especialidades = stats?.especialidades_mas_solicitadas || [];
  const citasPorDia = stats?.citas_por_dia || [];

  // Encontrar el mes con más citas
  const mesMasCitas = citasPorMes.length > 0
    ? citasPorMes.reduce((max, mes) => 
        parseInt(mes.total_citas) > parseInt(max.total_citas) ? mes : max
      )
    : null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Estadísticas del Sistema</h1>
          <p className="text-gray-600">Métricas y análisis de citas médicas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Fecha</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              name="fecha_desde"
              value={filters.fecha_desde}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              name="fecha_hasta"
              value={filters.fecha_hasta}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Citas</p>
              <p className="text-2xl font-bold text-gray-900">{generales.total_citas || 0}</p>
            </div>
            <CalendarIcon className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Citas Completadas</p>
              <p className="text-2xl font-bold text-green-600">{generales.citas_completadas || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {calcularPorcentaje(generales.citas_completadas || 0, generales.total_citas || 1)}%
              </p>
            </div>
            <ChartBarIcon className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pacientes</p>
              <p className="text-2xl font-bold text-purple-600">{generales.total_pacientes || 0}</p>
            </div>
            <UserGroupIcon className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Médicos</p>
              <p className="text-2xl font-bold text-orange-600">{generales.total_medicos || 0}</p>
            </div>
            <UserGroupIcon className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Citas por Mes */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Citas por Mes</h2>
            {mesMasCitas && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                <span>Más citas: {mesMasCitas.mes_formateado}</span>
              </div>
            )}
          </div>
          {citasPorMes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {citasPorMes.map((mes, index) => {
                const maxCitas = Math.max(...citasPorMes.map((m) => parseInt(m.total_citas)));
                const porcentaje = maxCitas > 0 ? (parseInt(mes.total_citas) / maxCitas) * 100 : 0;
                const esMesActual = mes.mes === getMesActual();

                return (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${esMesActual ? "text-blue-600" : "text-gray-700"}`}>
                        {mes.mes_formateado}
                        {esMesActual && <span className="ml-2 text-xs">(Actual)</span>}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{mes.total_citas}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          esMesActual ? "bg-blue-600" : "bg-blue-400"
                        }`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>✓ {mes.citas_completadas} completadas</span>
                      <span>✗ {mes.citas_canceladas} canceladas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Especialidades Más Solicitadas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Especialidades Más Solicitadas</h2>
          {especialidades.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {especialidades.map((esp, index) => {
                const maxCitas = Math.max(...especialidades.map((e) => parseInt(e.total_citas)));
                const porcentaje = maxCitas > 0 ? (parseInt(esp.total_citas) / maxCitas) * 100 : 0;

                return (
                  <div key={esp.especialidad_id} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {index + 1}. {esp.especialidad_nombre}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{esp.total_citas} citas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {esp.citas_completadas} completadas
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Citas por Día de la Semana */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Citas por Día de la Semana</h2>
        {citasPorDia.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {[
              "Domingo",
              "Lunes",
              "Martes",
              "Miércoles",
              "Jueves",
              "Viernes",
              "Sábado",
            ].map((diaNombre, index) => {
              const diaData = citasPorDia.find(
                (d) => d.dia_numero === index + 1 || d.dia_semana === diaNombre
              );
              const total = diaData ? parseInt(diaData.total_citas) : 0;
              const maxDia = Math.max(...citasPorDia.map((d) => parseInt(d.total_citas)), 1);
              const porcentaje = (total / maxDia) * 100;

              return (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">{diaNombre}</p>
                  <div className="bg-gray-200 rounded-lg h-32 flex items-end justify-center p-2">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-lg transition-all"
                      style={{ height: `${porcentaje}%` }}
                    ></div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-2">{total}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;

