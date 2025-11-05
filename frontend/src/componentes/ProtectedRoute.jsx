import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contextos/AuthContext";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  // Prevenir navegación hacia atrás si no está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      // Limpiar el historial del navegador para esta ruta
      window.history.replaceState(null, "", "/iniciar-sesion");
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Usar replace para evitar que quede en el historial
    return <Navigate to="/iniciar-sesion" replace state={{ from: location }} />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // Redirigir según el rol del usuario
    const { user } = useAuth();
    if (user) {
      if (user.rol_id === 1 || user.rol_nombre === "Administrador") {
        return <Navigate to="/administrador/panel" replace />;
      } else if (user.rol_id === 2 || user.rol_nombre === "Medico") {
        return <Navigate to="/medico/panel" replace />;
      } else if (user.rol_id === 3 || user.rol_nombre === "Paciente") {
        return <Navigate to="/paciente/panel" replace />;
      }
    }
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return children;
};

export default ProtectedRoute;
