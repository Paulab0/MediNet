import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contextos/AuthContext";
import NotificationCenter from "../../../componentes/NotificationCenter";

const navLinkBase =
  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium";

const AdminLayout = () => {
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isBlockingBack = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Bloquear completamente el botón de retroceso
  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    // Limpiar todo el historial anterior y establecer el dashboard como primera entrada
    window.history.replaceState({ page: "admin-dashboard", preventBack: true }, "", location.pathname);
    
    // Agregar una entrada falsa adicional al historial para que siempre haya algo "atrás"
    // Esto hace que el botón de retroceso no funcione como se espera
    window.history.pushState({ page: "admin-dashboard", preventBack: true }, "", location.pathname);

    const handlePopState = (event) => {
      // Bloquear completamente cualquier intento de retroceso
      if (isAuthenticated()) {
        // Verificar la ruta actual después del popstate
        const currentPath = window.location.pathname;
        
        // Si intenta salir del dashboard, bloquear inmediatamente
        if (!currentPath.startsWith("/administrador")) {
          // Agregar entrada al historial inmediatamente para bloquear
          window.history.pushState({ page: "admin-dashboard", preventBack: true }, "", "/administrador/panel");
          // Redirigir forzadamente
          navigate("/administrador/panel", { replace: true });
        } else {
          // Si está en el dashboard pero intentó retroceder, agregar entrada de nuevo
          window.history.pushState({ page: "admin-dashboard", preventBack: true }, "", currentPath);
          // Mantenerlo en la página actual
          navigate(currentPath, { replace: true });
        }
      }
    };

    // Escuchar el evento popstate
    window.addEventListener("popstate", handlePopState);

    // Interceptar cualquier intento de navegación fuera del dashboard
    const handleHashChange = () => {
      if (isAuthenticated() && !window.location.pathname.startsWith("/administrador")) {
        window.history.pushState({ page: "admin-dashboard" }, "", "/administrador/panel");
        navigate("/administrador/panel", { replace: true });
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [isAuthenticated, navigate, location.pathname]);

  // Mantener el historial manipulado cuando cambia la ruta dentro del dashboard
  useEffect(() => {
    if (isAuthenticated() && location.pathname.startsWith("/administrador")) {
      // Cada vez que cambia la ruta dentro del dashboard, agregar entrada al historial
      // Esto asegura que siempre haya una entrada "falsa" atrás para bloquear retroceso
      const currentState = window.history.state;
      if (!currentState || currentState.page !== "admin-dashboard") {
        window.history.pushState({ page: "admin-dashboard", preventBack: true }, "", location.pathname);
      }
    }
  }, [location.pathname, isAuthenticated]);

  // Interceptar cualquier intento de navegación fuera del dashboard
  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    // Verificar periódicamente si el usuario está fuera del dashboard
    const checkPath = () => {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/administrador") && isAuthenticated()) {
        // Si está fuera del dashboard, redirigir inmediatamente
        window.history.pushState({ page: "admin-dashboard", preventBack: true }, "", "/administrador/panel");
        navigate("/administrador/panel", { replace: true });
      }
    };

    // Verificar cada 100ms
    const interval = setInterval(checkPath, 100);

    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    // Limpiar todo el historial y redirigir
    window.history.replaceState(null, "", "/iniciar-sesion");
    navigate("/iniciar-sesion", { replace: true });
    // Forzar recarga para limpiar completamente el estado
    window.location.href = "/iniciar-sesion";
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar Deslizable Derecho */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Logo/Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-blue-700/50">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
              MediNet
            </h1>
            <p className="text-xs text-blue-200 font-medium">Administración</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-blue-700/50 transition-colors text-white"
            aria-label="Cerrar menú"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink
            to="/administrador/panel"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-white text-blue-700 shadow-lg transform scale-105"
                  : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/administrador/usuarios"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-white text-blue-700 shadow-lg transform scale-105"
                  : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>Usuarios</span>
          </NavLink>
          <NavLink
            to="/administrador/medicos"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-white text-blue-700 shadow-lg transform scale-105"
                  : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>Médicos</span>
          </NavLink>
          <NavLink
            to="/administrador/pacientes"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-white text-blue-700 shadow-lg transform scale-105"
                  : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Pacientes</span>
          </NavLink>
          <NavLink
            to="/administrador/citas"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-white text-blue-700 shadow-lg transform scale-105"
                  : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Citas</span>
          </NavLink>
          <NavLink
            to="/administrador/reportes/citas"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-white text-blue-700 shadow-lg transform scale-105"
                  : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Reportes Citas</span>
          </NavLink>
          <NavLink
            to="/administrador/reportes/pacientes"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-white text-blue-700 shadow-lg transform scale-105"
                  : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Reportes Pacientes</span>
          </NavLink>
          <NavLink
            to="/administrador/estadisticas"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-white text-blue-700 shadow-lg transform scale-105"
                  : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 13l8-5 8 5M3 6l8 5 8-5M3 18l8-5 8 5"
              />
            </svg>
            <span>Estadísticas</span>
          </NavLink>
          {/* Enlace de Configuración eliminado */}
        </nav>

        {/* User Info Footer */}
        {user && (
          <div className="p-4 border-t border-blue-700/50">
            <div className="bg-blue-700/30 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-blue-200 font-medium">
                {user.usuario_nombre} {user.usuario_apellido}
              </p>
              <p className="text-xs text-blue-300/80">{user.usuario_correo}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white shadow-md border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona usuarios, médicos, pacientes y citas
            </p>
          </div>
          
          {/* Sección Central - Logo MEDINET clickeable */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => navigate("/administrador/panel")}
              className="relative group cursor-pointer"
              title="Ir al Dashboard"
            >
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent group-hover:animate-bounce transition-all duration-300">
                MediNet
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
              <p className="text-xs text-gray-600 text-center mt-2 font-medium tracking-widest opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                SISTEMA MÉDICO
              </p>
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg"></div>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            {/* Botón para abrir el sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Abrir menú"
              title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay para cerrar sidebar en móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;


