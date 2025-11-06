import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../contextos/AuthContext";
import authService from "../../../servicios/servicioAutenticacion";
import logoImage from "../../../assets/images/logo-medinet.png";

const ConfirmLoginPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    if (!token) {
      setError("Token de verificación no encontrado");
      return;
    }

    // Confirmar el login automáticamente solo una vez
    handleConfirmLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmLogin = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      console.log("🔑 Token recibido:", token);
      const data = await authService.confirmLogin(token);
      console.log("✅ Respuesta del servidor:", data);

      if (data.success && data.token && data.user) {
        // Guardar token y usuario en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Actualizar el contexto de autenticación
        if (updateUser) {
          updateUser(data.user);
        }

        setSuccess(true);

        // Redirigir después de 1 segundo (recargar la página para actualizar el contexto)
        setTimeout(() => {
          // Recargar la página para que el contexto se actualice correctamente
          window.location.href = data.user.rol_id === 1 
            ? "/administrador/panel" 
            : data.user.rol_id === 2 
            ? "/medico/panel" 
            : data.user.rol_id === 3 
            ? "/paciente/panel" 
            : "/panel";
        }, 1000);
      } else {
        setError(data.error || "Error al confirmar inicio de sesión");
      }
    } catch (err) {
      console.error("❌ Error en confirmación:", err);
      const errorMessage = err.error || err.message || "Error al confirmar inicio de sesión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logoImage}
            alt="MEDINET Logo"
            className="w-20 h-20 mx-auto object-contain mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">MEDINET</h2>
        </div>

        {/* Contenido */}
        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Confirmando inicio de sesión...</p>
          </div>
        )}

        {success && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¡Inicio de sesión confirmado!
            </h3>
            <p className="text-gray-600 mb-4">
              Serás redirigido a tu panel en unos segundos...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
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
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Error al confirmar
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/iniciar-sesion")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}

        {!loading && !success && !error && (
          <div className="text-center">
            <p className="text-gray-600">Procesando...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmLoginPage;

