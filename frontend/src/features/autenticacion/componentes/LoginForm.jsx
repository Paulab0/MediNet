import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contextos/AuthContext";
import logoImage from "../../../assets/images/logo-medinet.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      console.log("✅ Login exitoso:", data);

      // Redirigir según el rol del usuario (usando replace para evitar historial)
      if (data.user) {
        switch (data.user.rol_id) {
          case 1:
          case "Administrador":
            navigate("/administrador/panel", { replace: true });
            break;
          case 2:
          case "Medico":
            navigate("/medico/panel", { replace: true });
            break;
          case 3:
          case "Paciente":
            navigate("/paciente/panel", { replace: true });
            break;
          default:
            navigate("/panel", { replace: true });
        }
      }
    } catch (err) {
      const errorMessage = err.error || "Error al iniciar sesión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Izquierdo - Imagen de la Doctora */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <img
            src="/doctor-image.png"
            alt="Doctora profesional"
            className="w-full h-full object-cover"
          />
          {/* Overlay para mejorar legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-blue-900/70"></div>
        </div>

        {/* Contenido superpuesto */}
        <div className="relative z-10 flex flex-col justify-center w-full p-12 text-white">
          <div className="space-y-8">
            {/* Logo MEDINET */}
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
                MediNet
              </h1>
              <div className="w-16 h-1 bg-white mx-auto rounded-full"></div>
            </div>

            {/* Texto descriptivo */}
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-semibold text-blue-100 drop-shadow-md">
                Sistema Médico Profesional
              </h2>
              <p className="text-lg text-blue-200 max-w-lg mx-auto leading-relaxed drop-shadow-sm">
                Conectando tu historia con el futuro de la medicina
              </p>
            </div>

            {/* Características del sistema */}
            <div className="grid grid-cols-1 gap-4 mt-12">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
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
                </div>
                <span className="text-white font-medium">
                  Gestión de citas médicas
                </span>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <span className="text-white font-medium">
                  Historial médico digital
                </span>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <span className="text-white font-medium">
                  Reportes y estadísticas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Derecho - Formulario de Login */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo para móviles */}
          <div className="lg:hidden mb-8 text-center">
            <img
              src={logoImage}
              alt="MEDINET Logo"
              className="w-24 h-24 mx-auto object-contain mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800">MEDINET</h2>
          </div>

          {/* Header del formulario */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido!
            </h2>
            <p className="text-gray-600">Inicia sesión en tu cuenta médica</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                required
              />
            </div>

            {/* Recordar y olvidar */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-600">Recordarme</span>
              </label>
              <Link
                to="/recuperar-contrasena"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Cargando...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-center font-medium">{error}</p>
              </div>
            )}

            {/* Enlace al Registro */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                ¿No tienes una cuenta?{" "}
                <a
                  href="/registro"
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                >
                  Regístrate aquí
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
