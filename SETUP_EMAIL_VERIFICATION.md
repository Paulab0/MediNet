# 🔐 Guía de Configuración: Sistema de Verificación de Email

## 📋 Descripción

Sistema completo de verificación de email implementado para MediNet. Cada usuario debe confirmar su dirección de correo electrónico antes de poder iniciar sesión en el sistema.

## ✨ Características Implementadas

### Backend

1. **Tabla de Tokens de Verificación** (`email_verification_tokens`)
   - Token único generado con crypto
   - Expiración de 24 horas
   - Uso único
   - Soporte para diferentes tipos (verificación, recuperación de contraseña)

2. **Campo de Verificación** en tabla usuarios
   - `usuario_email_verificado` (BOOLEAN)

3. **Servicio de Email** (`emailService.js`)
   - Envío de emails HTML con diseño profesional
   - Plantillas para:
     - Confirmación de registro
     - Bienvenida después de confirmar
   - Configuración con nodemailer

4. **Modelo de Verificación** (`emailVerificationModel.js`)
   - Generación de tokens únicos
   - Validación de tokens
   - Reenvío de tokens
   - Limpieza automática de tokens expirados
   - Marcado de email como verificado

5. **Integración con Auth** (`authModel.js`)
   - Creación automática de token al registrar
   - Envío automático de email de confirmación
   - Verificación de email en login
   - Bloqueo de login si email no está verificado

6. **Endpoints**
   - `GET /api/email-verification/confirm?token=xxx` - Confirmar email
   - `POST /api/email-verification/resend` - Reenviar token
   - `POST /api/email-verification/clean-expired` - Limpiar tokens

### Frontend

1. **Página de Confirmación** (`ConfirmEmailPage.jsx`)
   - Validación de token
   - Mensajes de éxito/error
   - Redirección automática al login
   - Opción de reenvío

2. **Integración en Login** (`LoginForm.jsx`)
   - Detección de email no verificado
   - Botón de reenvío de email
   - Mensajes informativos

3. **Integración en Registro** (`RegisterForm.jsx`)
   - Mensaje de verificación al registrar
   - Redirección al login después de 5 segundos

4. **Servicio de Verificación** (`emailVerificationService.js`)
   - Métodos para confirmar y reenviar

## 🚀 Pasos de Configuración

### 1. Configurar Base de Datos

Ejecuta la migración SQL:

```bash
mysql -u root -p medinetdb < backend/database/migrations/add_email_verification.sql
```

O ejecuta manualmente en MySQL:

```sql
-- Añadir columna de verificación
ALTER TABLE `usuarios` 
ADD COLUMN `usuario_email_verificado` BOOLEAN DEFAULT FALSE AFTER `usuario_estado`;

-- Crear tabla de tokens
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `token_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `tipo` ENUM('verificacion', 'reset_password') DEFAULT 'verificacion',
  `expira_en` DATETIME NOT NULL,
  `usado` BOOLEAN DEFAULT FALSE,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE CASCADE,
  INDEX `idx_token` (`token`),
  INDEX `idx_usuario_id` (`usuario_id`),
  INDEX `idx_expira_en` (`expira_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices adicionales
CREATE INDEX idx_usuario_email_verificado ON usuarios(usuario_email_verificado);
CREATE INDEX idx_usuario_email ON usuarios(usuario_correo);
```

### 2. Configurar Gmail para Emails

#### Opción A: Gmail Personal (Recomendado para desarrollo)

1. Ve a https://myaccount.google.com/apppasswords
2. Activa la verificación en 2 pasos si no está activa
3. Genera una "App Password":
   - Selecciona "Mail" y "Otro (Nombre personalizado)"
   - Ingresa "MediNet" como nombre
   - Copia la contraseña de 16 caracteres generada

#### Opción B: Otro Proveedor

Para otros proveedores (Outlook, SendGrid, etc.), ajusta la configuración en `backend/.env`:

```env
EMAIL_SERVICE=custom  # o el servicio específico
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_correo@outlook.com
EMAIL_PASSWORD=tu_contraseña
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend`:

```env
# Configuración del servidor
PORT=3000

# JWT Secret
JWT_SECRET=tu_secret_key_muy_segura_y_larga_aqui

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=medinetdb

# Configuración de Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_app_password_de_16_caracteres

# URL del Frontend
FRONTEND_URL=http://localhost:5173
```

### 4. Activar Verificación para Usuarios Existentes (Opcional)

Si tienes usuarios existentes que quieres activar automáticamente:

```sql
UPDATE usuarios SET usuario_email_verificado = TRUE WHERE usuario_estado = 1;
```

## 📧 Flujo de Verificación

### Registro de Usuario

1. Usuario completa formulario de registro
2. Sistema valida que el email no esté registrado
3. Se crea el usuario con `usuario_email_verificado = FALSE`
4. Se genera un token único de 64 caracteres
5. Se almacena el token con expiración de 24 horas
6. Se envía email de confirmación automáticamente
7. Mensaje: "Revisa tu email para confirmar tu cuenta"

### Confirmación de Email

1. Usuario recibe email con enlace único
2. Hace clic en el enlace
3. Sistema valida:
   - Token existe
   - Token no está usado
   - Token no está expirado
4. Marca token como usado
5. Marca email como verificado
6. Envía email de bienvenida
7. Redirige a login

### Login

1. Usuario intenta iniciar sesión
2. Sistema verifica credenciales
3. Sistema verifica `usuario_email_verificado = TRUE`
4. Si no está verificado: bloquea login y ofrece reenvío
5. Si está verificado: permite login

### Reenvío de Email

1. Usuario hace clic en "Reenviar Email"
2. Sistema elimina tokens antiguos no usados
3. Genera nuevo token
4. Envía nuevo email de confirmación

## 🧪 Pruebas

### Probar el Flujo Completo

1. **Registro**
   ```bash
   # Registra un nuevo usuario desde el frontend
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "usuario_nombre": "Test",
       "usuario_apellido": "Usuario",
       "usuario_correo": "test@example.com",
       "usuario_contrasena": "Test123456!",
       "rol_id": 3,
       "identificacion_id": 1
     }'
   ```

2. **Verificar Token Generado**
   ```sql
   SELECT * FROM email_verification_tokens WHERE usuario_id = LAST_INSERT_ID();
   ```

3. **Confirmar Email**
   ```bash
   curl "http://localhost:3000/api/email-verification/confirm?token=TOKEN_AQUI"
   ```

4. **Reenvío**
   ```bash
   curl -X POST http://localhost:3000/api/email-verification/resend \
     -H "Content-Type: application/json" \
     -d '{"usuario_correo": "test@example.com"}'
   ```

## 🔧 Mantenimiento

### Limpiar Tokens Expirados

```bash
curl -X POST http://localhost:3000/api/email-verification/clean-expired
```

### Configurar Tarea Programada (Opcional)

Agrega un cron job para limpiar tokens expirados automáticamente:

```bash
# Limpiar cada hora
0 * * * * curl -X POST http://localhost:3000/api/email-verification/clean-expired
```

## 📊 Estadísticas

Para ver estadísticas de verificación:

```sql
-- Usuarios no verificados
SELECT COUNT(*) FROM usuarios WHERE usuario_email_verificado = FALSE AND usuario_estado = 1;

-- Tokens pendientes
SELECT COUNT(*) FROM email_verification_tokens WHERE usado = FALSE;

-- Tokens expirados
SELECT COUNT(*) FROM email_verification_tokens WHERE usado = FALSE AND expira_en < NOW();
```

## 🐛 Solución de Problemas

### Email no se envía

1. Verifica que `.env` esté configurado correctamente
2. Verifica que la App Password sea válida
3. Revisa los logs del servidor para errores
4. Verifica que EMAIL_USER y EMAIL_PASSWORD sean correctos

### Token inválido

1. Verifica que el token no haya expirado (24 horas)
2. Verifica que el token no haya sido usado
3. Verifica que la URL sea correcta

### Login bloqueado

1. Verifica que `usuario_email_verificado = TRUE`
2. Usa el botón de reenvío para generar nuevo token
3. Confirma el email con el nuevo token

## 📝 Notas Importantes

- Los emails se envían de forma asíncrona y no bloquean el registro
- Si falla el envío de email, el usuario sigue registrado pero deberá solicitar reenvío
- Los tokens expiran después de 24 horas por seguridad
- Solo se puede usar un token una vez
- El sistema puede manejar múltiples proveedores de email (Gmail, Outlook, SendGrid, etc.)

## 🎯 Próximas Mejoras

- [ ] Recuperación de contraseña por email
- [ ] Notificaciones de email no verificada periódicas
- [ ] Panel administrativo para ver estadísticas de verificación
- [ ] Plantillas de email personalizables
- [ ] Soporte para múltiples idiomas en emails

