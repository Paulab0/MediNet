import { Navigate } from "react-router-dom";
import { useAuth } from "../contextos/AuthContext";

const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (!user) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  // Redirigir según el rol del usuario
  switch (user.rol_id) {
    case 1:
    case "Administrador":
      return <Navigate to="/administrador/panel" replace />;
    case 2:
    case "Medico":
      return <Navigate to="/medico/panel" replace />;
    case 3:
    case "Paciente":
      return <Navigate to="/paciente/panel" replace />;
    default:
      return <Navigate to="/iniciar-sesion" replace />;
  }
};

export default RoleRedirect;
