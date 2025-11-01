# Configuración de Verificación de Email

## Descripción

Sistema de verificación de email implementado para validar registros de usuarios en MediNet. Cada nuevo usuario debe confirmar su dirección de correo electrónico antes de poder iniciar sesión.

## Características

- ✅ Validación de email único en registro
- ✅ Generación de token de verificación único con expiración (24 horas)
- ✅ Envío automático de email de confirmación al registrar
- ✅ Envío de email de bienvenida después de confirmar
- ✅ Reenvío de email de verificación
- ✅ Bloqueo de login hasta confirmar email
- ✅ Limpieza automática de tokens expirados

## Configuración Requerida

### Variables de Entorno

Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:

```env
# Configuración del servidor
PORT=3000

# JWT Secret
JWT_SECRET=tu_secret_key_muy_segura_aqui

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=medinetdb

# Configuración de Email
# Para Gmail, necesitas usar "App Password"
EMAIL_SERVICE=gmail
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail

# URL del Frontend
FRONTEND_URL=http://localhost:5173
```

### Configuración Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Activa la verificación en 2 pasos
3. Genera una "App Password":
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Mail" y "Otro (Nombre personalizado)"
   - Ingresa "MediNet" como nombre
   - Copia la contraseña generada (16 caracteres)
   - Usa esta contraseña en `EMAIL_PASSWORD`

## Migración de Base de Datos

Ejecuta la migración SQL para crear las tablas necesarias:

```bash
mysql -u root -p medinetdb < backend/database/migrations/add_email_verification.sql
```

O ejecuta manualmente las queries desde el archivo SQL.

## Endpoints

### Backend

- `GET /api/email-verification/confirm?token=xxx` - Confirmar email con token
- `POST /api/email-verification/resend` - Reenviar token de verificación
  ```json
  {
    "usuario_correo": "usuario@example.com"
  }
  ```

### Frontend

- `/confirmar-email?token=xxx` - Página de confirmación de email
- `/login` - Muestra botón de reenvío si el email no está verificado

## Flujo de Usuario

1. Usuario se registra → Email de verificación enviado automáticamente
2. Usuario recibe email → Hace clic en el enlace de confirmación
3. Token validado → Email marcado como verificado
4. Email de bienvenida enviado → Usuario puede iniciar sesión

## Seguridad

- Tokens únicos generados con crypto
- Expiración automática después de 24 horas
- Tokens usables solo una vez
- Verificación de estado antes de cada login
- Limpieza automática de tokens expirados

## Notas

- Si el envío de email falla, el registro NO falla (solo se registra el error)
- Los usuarios pueden solicitar reenvío de email en el login
- Los tokens expirados se pueden limpiar manualmente con el endpoint administrativo

