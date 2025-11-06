import app from "./app.js";
import { testConnection } from "../database/connectiondb.js";
import appointmentRouter from "./rutas/rutaCita.js";
import availabilityRouter from "./rutas/rutaDisponibilidad.js";
import doctorRouter from "./rutas/rutaMedico.js";
import patientRouter from "./rutas/rutaPaciente.js";
import recordRouter from "./rutas/rutaRegistro.js";
import reminderRouter from "./rutas/rutaRecordatorio.js";
import roleRouter from "./rutas/rutaRol.js";
import specialtyRouter from "./rutas/rutaEspecialidad.js";
import userRouter from "./rutas/rutaUsuario.js";
import authRouter from "./rutas/rutaAutenticacion.js";
import historialRouter from "./rutas/rutaHistorial.js";
import passwordResetRouter from "./rutas/rutaPasswordReset.js";
import notificacionRouter from "./rutas/rutaNotificacion.js";
import logActividadRouter from "./rutas/rutaLogActividad.js";
import exportRouter from "./rutas/rutaExport.js";
import configuracionRouter from "./rutas/rutaConfiguracion.js";
import estadisticasRouter from "./rutas/rutaEstadisticas.js";
import loginVerificationRouter from "./rutas/rutaLoginVerification.js";
import reminderJob from "./jobs/reminderJob.js";

// Configurar rutas
app.use("/api/citas", appointmentRouter);
app.use("/api/disponibilidad", availabilityRouter);
app.use("/api/medicos", doctorRouter);
app.use("/api/pacientes", patientRouter);
app.use("/api/recordatorios", recordRouter);
app.use("/api/pendientes", reminderRouter);
app.use("/api/roles", roleRouter);
app.use("/api/especialidades", specialtyRouter);
app.use("/api/usuarios", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/historial", historialRouter);
app.use("/api/password-reset", passwordResetRouter);
app.use("/api/notificaciones", notificacionRouter);
app.use("/api/logs", logActividadRouter);
app.use("/api/export", exportRouter);
app.use("/api/configuracion", configuracionRouter);
app.use("/api/estadisticas", estadisticasRouter);
app.use("/api/login-verification", loginVerificationRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await testConnection();
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
  
  // Iniciar job de recordatorios automáticos (cada 5 minutos)
  reminderJob.start(5);
  console.log("✅ Job de recordatorios automáticos iniciado");
});
