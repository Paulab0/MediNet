# MEDINET - Sistema de Gestión Médica

Sistema completo para el manejo de citas médicas, desarrollado con Node.js + React.

## 🚀 Características

- **Autenticación completa** con JWT
- **Registro de usuarios** (Pacientes, Médicos, Administradores)
- **Gestión de citas médicas**
- **Sistema de roles y permisos**
- **Interfaz moderna y responsive**

## 🛠️ Tecnologías

### Backend

- Node.js + Express
- MySQL + MySQL2
- JWT para autenticación
- Bcrypt para encriptación
- CORS habilitado

### Frontend

- React + Vite
- Tailwind CSS
- Axios para API calls
- React Router para navegación

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- MySQL (versión 8.0 o superior)
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd MEDINET
```

### 2. Configurar la base de datos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script SQL
source backend/database/medinetdb.sql
```

### 3. Configurar variables de entorno (Backend)

```bash
cd backend
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=medinetdb
DB_PORT=3306
JWT_SECRET=tu_secreto_jwt_super_seguro
```

### 4. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 5. Instalar dependencias del Frontend

```bash
cd frontend
npm install
```

## 🏃‍♂️ Ejecutar el Proyecto

### Backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en: http://localhost:3000

### Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

## 📱 Uso del Sistema

### 1. Registro de Usuario

- Navega a `/register`
- Completa el formulario con tus datos
- Selecciona el tipo de usuario (Paciente, Médico, Administrador)
- El sistema validará todos los campos antes del envío

### 2. Inicio de Sesión

- Navega a `/login`
- Ingresa tu correo y contraseña
- El sistema te autenticará y redirigirá según tu rol

### 3. Tipos de Usuario

- **Paciente**: Puede ver y gestionar sus citas
- **Médico**: Puede gestionar su agenda y pacientes
- **Administrador**: Acceso completo al sistema

## 🔧 Estructura del Proyecto

```
MEDINET/
├── backend/
│   ├── database/
│   │   ├── connectiondb.js
│   │   └── medinetdb.sql
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   └── auth/
│   │   │       ├── components/
│   │   │       │   ├── LoginForm.jsx
│   │   │       │   └── RegisterForm.jsx
│   │   │       └── pages/
│   │   │           └── RegisterPage.jsx
│   │   ├── services/
│   │   │   └── authService.js
│   │   ├── api/
│   │   │   └── api.js
│   │   └── routes/
│   │       └── AppRoutes.jsx
│   └── package.json
└── README.md
```

## 🧪 Pruebas del Sistema

### 1. Probar el Registro

- Ve a http://localhost:5173/register
- Completa el formulario con datos válidos
- Verifica que se cree el usuario en la base de datos

### 2. Probar el Login

- Ve a http://localhost:5173/login
- Usa las credenciales del usuario registrado
- Verifica que recibas el token JWT

### 3. Verificar en la Base de Datos

```sql
USE medinetdb;
SELECT * FROM usuarios ORDER BY usuario_fecha_registro DESC LIMIT 5;
```

## 🔒 Seguridad

- Contraseñas encriptadas con Bcrypt
- JWT para autenticación
- Validación de datos en frontend y backend
- CORS configurado para desarrollo
- Middleware de autorización por roles

## 🐛 Solución de Problemas

### Error de Conexión a MySQL

- Verifica que MySQL esté corriendo
- Confirma las credenciales en `.env`
- Asegúrate de que la base de datos `medinetdb` exista

### Error de CORS

- Verifica que el frontend esté en el puerto 5173
- Confirma la configuración CORS en `app.js`

### Error de JWT

- Verifica que `JWT_SECRET` esté configurado en `.env`
- Confirma que el token se esté enviando en los headers

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa los logs del servidor
2. Verifica la consola del navegador
3. Confirma la configuración de la base de datos

## 🚀 Próximas Funcionalidades

- [ ] Dashboard para cada tipo de usuario
- [ ] Gestión de citas médicas
- [ ] Sistema de recordatorios
- [ ] Historial médico de pacientes
- [ ] Gestión de especialidades médicas
- [ ] Reportes y estadísticas

---

¡Disfruta desarrollando con MEDINET! 🏥✨

