import { useState, useEffect } from "react";
import loginVerificationService from "../../../servicios/servicioLoginVerification";

const PendingLoginsSection = () => {
  const [pendingTokens, setPendingTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPendingTokens();
    // Recargar cada 30 segundos
    const interval = setInterval(loadPendingTokens, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingTokens = async () => {
    try {
      setLoading(true);
      const response = await loginVerificationService.getPendingTokens();
      setPendingTokens(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.error || "Error al cargar tokens pendientes");
      console.error("Error cargando tokens:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvalidateToken = async (token_id) => {
    if (!window.confirm("¿Estás seguro de que deseas invalidar este token?")) {
      return;
    }

    try {
      await loginVerificationService.invalidateToken(token_id);
      loadPendingTokens();
    } catch (err) {
      alert(err.error || "Error al invalidar token");
    }
  };

  const handleCleanExpired = async () => {
    try {
      const response = await loginVerificationService.cleanExpiredTokens();
      alert(response.message || "Tokens expirados limpiados");
      loadPendingTokens();
    } catch (err) {
      alert(err.error || "Error al limpiar tokens");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (expirationDate) => {
    if (!expirationDate) return "N/A";
    const now = new Date();
    const exp = new Date(expirationDate);
    const diff = exp - now;
    
    if (diff <= 0) return "Expirado";
    
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Inicios de Sesión Pendientes
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona los intentos de inicio de sesión que requieren confirmación
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadPendingTokens}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar
          </button>
          <button
            onClick={handleCleanExpired}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Limpiar Expirados
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {pendingTokens.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg">
                No hay inicios de sesión pendientes
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispositivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiempo Restante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingTokens.map((token) => (
                    <tr key={token.token_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {token.usuario_nombre} {token.usuario_apellido}
                          </div>
                          <div className="text-sm text-gray-500">
                            {token.usuario_correo}
                          </div>
                          <div className="text-xs text-gray-400">
                            {token.rol_id === 1
                              ? "Administrador"
                              : token.rol_id === 2
                              ? "Médico"
                              : "Paciente"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(token.login_fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {token.login_ip || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={token.login_user_agent}>
                          {token.login_user_agent || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            getTimeRemaining(token.token_expiracion) === "Expirado"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {getTimeRemaining(token.token_expiracion)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleInvalidateToken(token.token_id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Invalidar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingLoginsSection;

