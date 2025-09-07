import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
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

      // Redirigir según el rol del usuario
      if (data.user) {
        switch (data.user.rol_id) {
          case 1:
          case "Administrador":
            navigate("/admin/dashboard");
            break;
          case 2:
          case "Medico":
            navigate("/doctor/dashboard");
            break;
          case 3:
          case "Paciente":
            navigate("/patient/dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 p-6">
      <div className="flex flex-col md:flex-row items-center bg-white/90 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl">
        {/* Lado izquierdo - Logo MEDINET */}
        <div className="hidden md:flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            {/* Logo principal */}
            <div>
              <img
                src={logoImage}
                alt="MEDINET Logo"
                className="w-96 h-96 mx-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Lado derecho - formulario */}
        <div className="flex-1 p-8 md:p-12">
          {/* Logo para móviles */}
          <div className="md:hidden mb-8 text-center">
            <img
              src={logoImage}
              alt="MEDINET Logo"
              className="w-40 h-40 mx-auto object-contain mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">MEDINET</h2>
          </div>

          {/* Título para desktop */}
          <h2 className="hidden md:block text-3xl font-bold text-center text-gray-800 mb-6">
            ¡BIENVENIDO!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>

            {/* Recordar y olvidar */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md transition duration-200"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-center font-medium">{error}</p>
            )}

            {/* Enlace al Registro */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                ¿No tienes una cuenta?{" "}
                <a
                  href="/register"
                  className="text-blue-600 hover:underline font-medium"
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
