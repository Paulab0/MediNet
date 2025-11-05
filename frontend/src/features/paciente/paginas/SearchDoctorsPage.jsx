import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, UserCircleIcon, MapPinIcon, PhoneIcon, CalendarIcon } from "@heroicons/react/24/outline";
import doctorService from "../../../servicios/servicioMedico";
import specialtyService from "../../../servicios/servicioEspecialidad";

const SearchDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filters, setFilters] = useState({
    nombre: "",
    especialidad_id: "",
    fecha: "",
    hora: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSpecialties();
    searchDoctors();
  }, []);

  const loadSpecialties = async () => {
    try {
      const data = await specialtyService.getSpecialties();
      setSpecialties(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error cargando especialidades:", error);
    }
  };

  const searchDoctors = async () => {
    setLoading(true);
    try {
      const activeFilters = {};
      if (filters.nombre) activeFilters.nombre = filters.nombre;
      if (filters.especialidad_id) activeFilters.especialidad_id = filters.especialidad_id;
      if (filters.fecha) activeFilters.fecha = filters.fecha;
      if (filters.hora) activeFilters.hora = filters.hora;

      const data = await doctorService.search(activeFilters);
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error buscando médicos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchDoctors();
  };

  const handleClearFilters = () => {
    setFilters({
      nombre: "",
      especialidad_id: "",
      fecha: "",
      hora: "",
    });
    setTimeout(() => searchDoctors(), 100);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buscar Médicos</h1>
        <p className="text-gray-600">Encuentra el médico que necesitas</p>
      </div>

      {/* Filtros de búsqueda */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del médico
            </label>
            <div className="relative">
              <input
                type="text"
                name="nombre"
                value={filters.nombre}
                onChange={handleFilterChange}
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidad
            </label>
            <select
              name="especialidad_id"
              value={filters.especialidad_id}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las especialidades</option>
              {specialties.map((specialty) => (
                <option key={specialty.especialidad_id} value={specialty.especialidad_id}>
                  {specialty.especialidad_nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha disponible
            </label>
            <input
              type="date"
              name="fecha"
              value={filters.fecha}
              onChange={handleFilterChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora disponible
            </label>
            <input
              type="time"
              name="hora"
              value={filters.hora}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpiar filtros
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Buscando médicos...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron médicos</p>
            <p className="text-gray-500 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.medico_id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  {doctor.usuario_foto_perfil ? (
                    <img
                      src={doctor.usuario_foto_perfil}
                      alt={doctor.usuario_nombre}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      Dr. {doctor.usuario_nombre} {doctor.usuario_apellido}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      {doctor.especialidad_nombre || "Sin especialidad"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {doctor.medico_consultorio && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{doctor.medico_consultorio}</span>
                    </div>
                  )}
                  {doctor.usuario_telefono && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{doctor.usuario_telefono}</span>
                    </div>
                  )}
                  {doctor.usuario_correo && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="text-xs">{doctor.usuario_correo}</span>
                    </div>
                  )}
                </div>

                <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Ver disponibilidad
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDoctorsPage;

