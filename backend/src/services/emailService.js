import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
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

const emailService = {
  // Enviar email de confirmación de registro
  async sendConfirmationEmail(userEmail, userName, confirmationToken) {
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
};

export default emailService;

