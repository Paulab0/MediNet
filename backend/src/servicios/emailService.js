import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Verificar si las credenciales de email están configuradas
const hasEmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

// Configuración del transporter de nodemailer (solo si hay credenciales)
let transporter = null;

if (hasEmailCredentials) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Verificar configuración del transporter
  transporter.verify((error, success) => {
    if (error) {
      console.log('⚠️ Error en la configuración de email:', error.message);
    } else {
      console.log('✅ Servidor de email listo para enviar mensajes');
    }
  });
} else {
  console.log('⚠️ Email no configurado: EMAIL_USER y EMAIL_PASSWORD no están definidos en .env');
  console.log('💡 El sistema funcionará pero no enviará correos electrónicos. Para configurar email, edita el archivo .env');
}

const emailService = {
  // Enviar email de confirmación de registro
  async sendConfirmationEmail(userEmail, userName, confirmationToken) {
    // Si no hay transporter configurado, lanzar error descriptivo
    if (!transporter || !hasEmailCredentials) {
      const error = new Error('Servicio de email no configurado. Por favor configura EMAIL_USER y EMAIL_PASSWORD en el archivo .env');
      error.code = 'EMAIL_NOT_CONFIGURED';
      throw error;
    }

    try {
      const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirmar-email?token=${confirmationToken}`;
      
      const mailOptions = {
        from: `"MediNet" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Confirma tu registro en MediNet',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirma tu registro</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">MediNet</h1>
                <p style="color: #f0f0f0; margin: 5px 0 0 0;">Sistema de Gestión Médica</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; margin-top: 0;">¡Bienvenido a MediNet!</h2>
                
                <p>Hola <strong>${userName}</strong>,</p>
                
                <p>Gracias por registrarte en MediNet. Para completar tu registro y activar tu cuenta, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                    Confirmar Email
                  </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  O copia y pega este enlace en tu navegador:
                </p>
                <p style="word-break: break-all; color: #667eea; font-size: 12px;">
                  ${confirmationUrl}
                </p>
                
                <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad. Si no puedes confirmar tu email ahora, podrás solicitar un nuevo enlace de confirmación.
                  </p>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                  Si no te registraste en MediNet, por favor ignora este correo.
                </p>
                
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                  © ${new Date().getFullYear()} MediNet. Todos los derechos reservados.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email de confirmación enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      throw new Error(`Error enviando email de confirmación: ${error.message}`);
    }
  },

  // Enviar email de bienvenida después de confirmar
  async sendWelcomeEmail(userEmail, userName) {
    // Si no hay transporter configurado, lanzar error descriptivo
    if (!transporter || !hasEmailCredentials) {
      const error = new Error('Servicio de email no configurado. Por favor configura EMAIL_USER y EMAIL_PASSWORD en el archivo .env');
      error.code = 'EMAIL_NOT_CONFIGURED';
      throw error;
    }

    try {
      const mailOptions = {
        from: `"MediNet" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '¡Tu cuenta ha sido confirmada!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Cuenta confirmada</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">MediNet</h1>
                <p style="color: #f0f0f0; margin: 5px 0 0 0;">Sistema de Gestión Médica</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center;">
                  <div style="width: 80px; height: 80px; background: #28a745; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px; color: white;">✓</span>
                  </div>
                </div>
                
                <h2 style="color: #28a745; text-align: center; margin-top: 0;">¡Email Confirmado!</h2>
                
                <p style="text-align: center;">Hola <strong>${userName}</strong>,</p>
                
                <p style="text-align: center;">Tu cuenta ha sido confirmada exitosamente. Ya puedes iniciar sesión y comenzar a usar MediNet.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                    Iniciar Sesión
                  </a>
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 5px;">
                  <p style="margin: 0; font-size: 14px; color: #155724;">
                    <strong>🎉 ¡Bienvenido a MediNet!</strong> Estamos contentos de tenerte como parte de nuestra comunidad médica.
                  </p>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
                  © ${new Date().getFullYear()} MediNet. Todos los derechos reservados.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email de bienvenida enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      throw new Error(`Error enviando email de bienvenida: ${error.message}`);
    }
  },

  // Enviar email de recuperación de contraseña
  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    // Si no hay transporter configurado, lanzar error descriptivo
    if (!transporter || !hasEmailCredentials) {
      const error = new Error('Servicio de email no configurado. Por favor configura EMAIL_USER y EMAIL_PASSWORD en el archivo .env');
      error.code = 'EMAIL_NOT_CONFIGURED';
      throw error;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recuperar-contrasena/reset?token=${resetToken}`;
      
      const mailOptions = {
        from: `"MediNet" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Recuperación de contraseña - MediNet',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Recuperar contraseña</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">MediNet</h1>
                <p style="color: #f0f0f0; margin: 5px 0 0 0;">Sistema de Gestión Médica</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; margin-top: 0;">Recuperación de Contraseña</h2>
                
                <p>Hola <strong>${userName}</strong>,</p>
                
                <p>Recibimos una solicitud para restablecer tu contraseña en MediNet. Si tú hiciste esta solicitud, haz clic en el siguiente botón para crear una nueva contraseña:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                    Restablecer Contraseña
                  </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  O copia y pega este enlace en tu navegador:
                </p>
                <p style="word-break: break-all; color: #667eea; font-size: 12px;">
                  ${resetUrl}
                </p>
                
                <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad. Si no solicitaste este cambio, por favor ignora este correo y tu contraseña permanecerá sin cambios.
                  </p>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                  Si no solicitaste recuperar tu contraseña, puedes ignorar este correo de forma segura.
                </p>
                
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                  © ${new Date().getFullYear()} MediNet. Todos los derechos reservados.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email de recuperación de contraseña enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      throw new Error(`Error enviando email de recuperación: ${error.message}`);
    }
  },

  // Enviar email de confirmación de cita
  async sendAppointmentConfirmationEmail(userEmail, userName, appointmentData) {
    // Si no hay transporter configurado, solo registrar
    if (!transporter || !hasEmailCredentials) {
      console.log('⚠️ Email no configurado, no se enviará confirmación de cita');
      return { success: false, message: 'Email no configurado' };
    }

    try {
      const { fecha, hora, medico, especialidad, consultorio, identificacion, tipo, observaciones } = appointmentData;
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Convertir hora a formato AM/PM
      let horaFormateada = hora;
      if (hora) {
        try {
          // Si la hora viene en formato HH:MM:SS o HH:MM
          const [horas, minutos] = hora.split(':');
          const horasNum = parseInt(horas);
          const minutosNum = minutos ? parseInt(minutos) : 0;
          
          if (!isNaN(horasNum)) {
            let periodo = 'AM';
            let horas12 = horasNum;
            
            if (horasNum === 0) {
              horas12 = 12;
              periodo = 'AM';
            } else if (horasNum === 12) {
              horas12 = 12;
              periodo = 'PM';
            } else if (horasNum > 12) {
              horas12 = horasNum - 12;
              periodo = 'PM';
            } else {
              horas12 = horasNum;
              periodo = 'AM';
            }
            
            horaFormateada = `${horas12}:${minutosNum.toString().padStart(2, '0')} ${periodo}`;
          }
        } catch (e) {
          // Si falla la conversión, usar la hora original
          console.warn('Error formateando hora:', e);
        }
      }

      const mailOptions = {
        from: `"MediNet" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Confirmación de Cita Médica - MediNet',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmación de Cita</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">MediNet</h1>
                <p style="color: #f0f0f0; margin: 5px 0 0 0;">Sistema de Gestión Médica</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center;">
                  <div style="width: 80px; height: 80px; background: #28a745; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px; color: white;">✓</span>
                  </div>
                </div>
                
                <h2 style="color: #28a745; text-align: center; margin-top: 0;">¡Cita Confirmada!</h2>
                
                <p>Hola <strong>${userName}</strong>,</p>
                
                <p>Tu cita médica ha sido confirmada exitosamente. Aquí están los detalles:</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                  <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${horaFormateada}</p>
                  <p style="margin: 5px 0;"><strong>👨‍⚕️ Médico:</strong> ${medico}</p>
                  ${especialidad ? `<p style="margin: 5px 0;"><strong>🏥 Especialidad:</strong> ${especialidad}</p>` : ''}
                  <p style="margin: 5px 0;"><strong>📍 Consultorio:</strong> ${consultorio || 'No especificado'}</p>
                  ${identificacion ? `<p style="margin: 5px 0;"><strong>🆔 Identificación:</strong> ${identificacion}</p>` : ''}
                  ${tipo ? `<p style="margin: 5px 0;"><strong>📋 Tipo:</strong> ${tipo}</p>` : ''}
                  ${observaciones ? `<p style="margin: 5px 0;"><strong>📝 Observaciones:</strong> ${observaciones}</p>` : ''}
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 5px;">
                  <p style="margin: 0; font-size: 14px; color: #155724;">
                    <strong>💡 Recordatorio:</strong> Te enviaremos un recordatorio 24 horas antes de tu cita.
                  </p>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
                  © ${new Date().getFullYear()} MediNet. Todos los derechos reservados.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email de confirmación de cita enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de confirmación de cita:', error);
      return { success: false, message: error.message };
    }
  },

  // Enviar email de recordatorio de cita
  async sendAppointmentReminderEmail(userEmail, userName, appointmentData, reminderType) {
    // Si no hay transporter configurado, solo registrar
    if (!transporter || !hasEmailCredentials) {
      console.log('⚠️ Email no configurado, no se enviará recordatorio de cita');
      return { success: false, message: 'Email no configurado' };
    }

    try {
      const { fecha, hora, medico, especialidad, consultorio, tipo } = appointmentData;
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Determinar mensaje según el tipo de recordatorio
      let tiempoAntes = '';
      let mensajeRecordatorio = '';
      if (reminderType === '24h_antes') {
        tiempoAntes = '24 horas';
        mensajeRecordatorio = 'Tu cita es mañana. Por favor, confirma tu asistencia.';
      } else if (reminderType === '1h_antes') {
        tiempoAntes = '1 hora';
        mensajeRecordatorio = 'Tu cita es en 1 hora. Por favor, asegúrate de llegar a tiempo.';
      } else {
        tiempoAntes = 'próximamente';
        mensajeRecordatorio = 'Tu cita es muy pronto. Por favor, confirma tu asistencia.';
      }

      const mailOptions = {
        from: `"MediNet" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Recordatorio de Cita Médica - ${tiempoAntes} antes - MediNet`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Recordatorio de Cita</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">MediNet</h1>
                <p style="color: #f0f0f0; margin: 5px 0 0 0;">Sistema de Gestión Médica</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center;">
                  <div style="width: 80px; height: 80px; background: #ffc107; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px; color: white;">⏰</span>
                  </div>
                </div>
                
                <h2 style="color: #ffc107; text-align: center; margin-top: 0;">Recordatorio de Cita</h2>
                
                <p>Hola <strong>${userName}</strong>,</p>
                
                <p><strong>${mensajeRecordatorio}</strong></p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                  <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${hora}</p>
                  <p style="margin: 5px 0;"><strong>👨‍⚕️ Médico:</strong> ${medico}</p>
                  ${especialidad ? `<p style="margin: 5px 0;"><strong>🏥 Especialidad:</strong> ${especialidad}</p>` : ''}
                  ${consultorio ? `<p style="margin: 5px 0;"><strong>📍 Consultorio:</strong> ${consultorio}</p>` : ''}
                  ${tipo ? `<p style="margin: 5px 0;"><strong>📋 Tipo:</strong> ${tipo}</p>` : ''}
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>💡 Importante:</strong> Si no puedes asistir, por favor cancela o reprograma tu cita con anticipación.
                  </p>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
                  © ${new Date().getFullYear()} MediNet. Todos los derechos reservados.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email de recordatorio de cita enviado (${reminderType}):`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de recordatorio de cita:', error);
      return { success: false, message: error.message };
    }
  },

  // Enviar email de confirmación de inicio de sesión
  async sendLoginConfirmationEmail(userEmail, userName, loginData) {
    // Si no hay transporter configurado, lanzar error descriptivo
    if (!transporter || !hasEmailCredentials) {
      const error = new Error('Servicio de email no configurado. Por favor configura EMAIL_USER y EMAIL_PASSWORD en el archivo .env');
      error.code = 'EMAIL_NOT_CONFIGURED';
      throw error;
    }

    try {
      const { fecha, hora, ip, dispositivo, confirmationUrl } = loginData;
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: `"MediNet" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Confirma tu Inicio de Sesión - MediNet',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmar Inicio de Sesión</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">MediNet</h1>
                <p style="color: #f0f0f0; margin: 5px 0 0 0;">Sistema de Gestión Médica</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center;">
                  <div style="width: 80px; height: 80px; background: #ffc107; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px; color: white;">🔐</span>
                  </div>
                </div>
                
                <h2 style="color: #ffc107; text-align: center; margin-top: 0;">Confirma tu Inicio de Sesión</h2>
                
                <p>Hola <strong>${userName}</strong>,</p>
                
                <p>Se ha detectado un intento de inicio de sesión en tu cuenta de MediNet. Para completar el acceso, por favor confirma haciendo clic en el siguiente botón:</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                  <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${hora}</p>
                  ${ip ? `<p style="margin: 5px 0;"><strong>🌐 Dirección IP:</strong> ${ip}</p>` : ''}
                  ${dispositivo ? `<p style="margin: 5px 0;"><strong>💻 Dispositivo:</strong> ${dispositivo.substring(0, 100)}</p>` : ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                    Confirmar Inicio de Sesión
                  </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  O copia y pega este enlace en tu navegador:
                </p>
                <p style="word-break: break-all; color: #667eea; font-size: 12px;">
                  ${confirmationUrl}
                </p>
                
                <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>⚠️ Importante:</strong> Este enlace expirará en 15 minutos por seguridad. Si no fuiste tú quien intentó iniciar sesión, por favor ignora este correo y cambia tu contraseña inmediatamente.
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/recuperar-contrasena" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 6px rgba(220, 53, 69, 0.4);">
                    Cambiar Contraseña
                  </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
                  © ${new Date().getFullYear()} MediNet. Todos los derechos reservados.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email de confirmación de inicio de sesión enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de confirmación de inicio de sesión:', error);
      throw new Error(`Error enviando email de confirmación: ${error.message}`);
    }
  },

  // Enviar email de notificación de inicio de sesión (deprecated - ahora se usa sendLoginConfirmationEmail)
  async sendLoginNotificationEmail(userEmail, userName, loginData) {
    // Si no hay transporter configurado, solo registrar
    if (!transporter || !hasEmailCredentials) {
      console.log('⚠️ Email no configurado, no se enviará notificación de inicio de sesión');
      return { success: false, message: 'Email no configurado' };
    }

    try {
      const { fecha, hora, ip, dispositivo } = loginData;
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: `"MediNet" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Notificación de Inicio de Sesión - MediNet',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Inicio de Sesión</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">MediNet</h1>
                <p style="color: #f0f0f0; margin: 5px 0 0 0;">Sistema de Gestión Médica</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center;">
                  <div style="width: 80px; height: 80px; background: #28a745; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px; color: white;">🔐</span>
                  </div>
                </div>
                
                <h2 style="color: #28a745; text-align: center; margin-top: 0;">Inicio de Sesión Detectado</h2>
                
                <p>Hola <strong>${userName}</strong>,</p>
                
                <p>Se ha detectado un inicio de sesión en tu cuenta de MediNet. Aquí están los detalles:</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                  <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${hora}</p>
                  ${ip ? `<p style="margin: 5px 0;"><strong>🌐 Dirección IP:</strong> ${ip}</p>` : ''}
                  ${dispositivo ? `<p style="margin: 5px 0;"><strong>💻 Dispositivo:</strong> ${dispositivo}</p>` : ''}
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>⚠️ Importante:</strong> Si no fuiste tú quien inició sesión, por favor cambia tu contraseña inmediatamente y contacta al soporte.
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/recuperar-contrasena" style="display: inline-block; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 6px rgba(220, 53, 69, 0.4);">
                    Cambiar Contraseña
                  </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                  Si fuiste tú quien inició sesión, puedes ignorar este correo de forma segura.
                </p>
                
                <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
                  © ${new Date().getFullYear()} MediNet. Todos los derechos reservados.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email de notificación de inicio de sesión enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de notificación de inicio de sesión:', error);
      return { success: false, message: error.message };
    }
  },
};

export default emailService;


