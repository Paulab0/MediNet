import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // Redirigir según el rol del usuario
    const { user } = useAuth();
    if (user) {
      if (user.rol_id === 1 || user.rol_nombre === "Administrador") {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user.rol_id === 2 || user.rol_nombre === "Medico") {
        return <Navigate to="/doctor/dashboard" replace />;
      } else if (user.rol_id === 3 || user.rol_nombre === "Paciente") {
        return <Navigate to="/patient/dashboard" replace />;
      }
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
