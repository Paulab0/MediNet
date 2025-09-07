import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol del usuario
  switch (user.rol_id) {
    case 1:
    case "Administrador":
      return <Navigate to="/admin/dashboard" replace />;
    case 2:
    case "Medico":
      return <Navigate to="/doctor/dashboard" replace />;
    case 3:
    case "Paciente":
      return <Navigate to="/patient/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RoleRedirect;
