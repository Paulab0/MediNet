import { useState, useEffect } from "react";
import { BellIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import notificacionService from "../servicios/servicioNotificacion";
import { useAuth } from "../contextos/AuthContext";

const NotificationCenter = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadNotificaciones();
    loadUnreadCount();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await notificacionService.getNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await notificacionService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error("Error cargando contador:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificacionService.markAsRead(id);
      setNotificaciones(prev =>
        prev.map(n => n.notificacion_id === id ? { ...n, notificacion_leida: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marcando como leída:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificacionService.delete(id);
      setNotificaciones(prev => prev.filter(n => n.notificacion_id !== id));
      if (!notificaciones.find(n => n.notificacion_id === id)?.notificacion_leida) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error eliminando notificación:", error);
    }
  };

  const getTipoColor = (tipo) => {
    const colors = {
      Info: "bg-blue-100 text-blue-700",
      Alerta: "bg-yellow-100 text-yellow-700",
      Mantenimiento: "bg-orange-100 text-orange-700",
      Sistema: "bg-purple-100 text-purple-700",
      Cita: "bg-green-100 text-green-700",
      Recordatorio: "bg-indigo-100 text-indigo-700",
    };
    return colors[tipo] || colors.Info;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">Notificaciones</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Cargando...
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.notificacion_id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notificacion.notificacion_leida ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(
                                notificacion.notificacion_tipo
                              )}`}
                            >
                              {notificacion.notificacion_tipo}
                            </span>
                            {!notificacion.notificacion_leida && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {notificacion.notificacion_titulo}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {notificacion.notificacion_mensaje}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(notificacion.notificacion_fecha).toLocaleString('es-ES')}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          {!notificacion.notificacion_leida && (
                            <button
                              onClick={() => handleMarkAsRead(notificacion.notificacion_id)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Marcar como leída"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notificacion.notificacion_id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;


