import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import emailVerificationService from "../../../services/emailVerificationService";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Token de verificación no proporcionado");
        setLoading(false);
        return;
      }

      try {
        const result = await emailVerificationService.confirmEmail(token);
        
        if (result.success) {
          setStatus("success");
          setMessage("¡Tu email ha sido confirmado exitosamente!");
          setUserInfo(result.user);
          // Redirigir al login después de 5 segundos
          setTimeout(() => {
            navigate("/login");
          }, 5000);
        } else {
          setStatus("error");
          setMessage(result.message || "Error al confirmar el email");
        }
      } catch (error) {
        console.error("Error confirmando email:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Error al confirmar el email. El token puede haber expirado."
        );
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    if (!userInfo?.usuario_correo) {
      navigate("/login");
      return;
    }

    try {
      await emailVerificationService.resendVerificationToken(
        userInfo.usuario_correo
      );
      alert(
        "Se ha enviado un nuevo email de verificación. Por favor revisa tu bandeja de entrada."
      );
    } catch (error) {
      console.error("Error reenviando email:", error);
      alert(
        error.response?.data?.message ||
          "Error al reenviar el email de verificación."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Verificación de Email
          </h2>
          <p className="text-blue-100">
            Confirmando tu dirección de correo electrónico
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando tu email...</p>
            </div>
          ) : status === "success" ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Email Confirmado!
              </h3>
              <p className="text-gray-600 mb-6">
                Tu cuenta ha sido verificada exitosamente. Ahora puedes iniciar
                sesión y comenzar a usar MediNet.
              </p>
              {userInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    Bienvenido{" "}
                    <strong>
                      {userInfo.usuario_nombre} {userInfo.usuario_apellido}
                    </strong>
                  </p>
                </div>
              )}
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Ir al Login
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Serás redirigido automáticamente en unos segundos...
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircleIcon className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Error en la Verificación
              </h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm text-yellow-800 font-medium mb-1">
                      ¿Token expirado?
                    </p>
                    <p className="text-xs text-yellow-700">
                      Si tu token expiró o el enlace no funciona, puedes
                      solicitar un nuevo email de verificación.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {userInfo?.usuario_correo && (
                  <button
                    onClick={handleResendEmail}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Reenviar Email de Verificación
                  </button>
                )}
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  Volver al Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;

