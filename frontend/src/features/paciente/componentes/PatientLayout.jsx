import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contextos/AuthContext";
import NotificationCenter from "../../../componentes/NotificationCenter";

const PatientLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/iniciar-sesion", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white shadow-md border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Panel de Paciente
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona tus citas y consultas médicas
            </p>
          </div>
          
          {/* Sección Central - Logo MEDINET clickeable */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => navigate("/paciente/panel")}
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
            {user && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  {user.usuario_nombre} {user.usuario_apellido}
                </p>
              </div>
            )}
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
    </div>
  );
};

export default PatientLayout;

