# 🏗️ Arquitectura del Backend - MEDINET

## 📋 Índice

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Base de Datos](#base-de-datos)
4. [Modelos (Models)](#modelos-models)
5. [Controladores (Controllers)](#controladores-controllers)
6. [Rutas (Routes)](#rutas-routes)
7. [Middleware](#middleware)
8. [Configuración de la Aplicación](#configuración-de-la-aplicación)
9. [Flujo de Datos](#flujo-de-datos)
10. [Patrones de Diseño](#patrones-de-diseño)

---

## 🎯 Visión General

El backend de MEDINET está construido con **Node.js** y **Express.js**, siguiendo una arquitectura **MVC (Model-View-Controller)** con separación clara de responsabilidades. Utiliza **MySQL** como base de datos y **JWT** para autenticación.

### Tecnologías Principales:

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **bcrypt** - Encriptación de contraseñas
- **CORS** - Control de acceso entre dominios

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── app.js                 # Configuración principal de Express
│   ├── server.js              # Punto de entrada del servidor
│   ├── config/                # Configuraciones adicionales
│   ├── controllers/           # Lógica de negocio
│   ├── models/               # Acceso a datos
│   ├── routes/               # Definición de rutas
│   ├── middleware/           # Middlewares personalizados
│   └── database/
│       ├── connectiondb.js   # Conexión a la base de datos
│       └── medinetdb.sql     # Scripts de la base de datos
```

---

## 🗄️ Base de Datos

### Diseño de la Base de Datos

La base de datos está diseñada con las siguientes entidades principales:

#### **Tablas Principales:**

- `usuarios` - Información de todos los usuarios del sistema
- `roles` - Roles del sistema (Administrador, Médico, Paciente)
- `medicos` - Información específica de médicos
- `pacientes` - Información específica de pacientes
- `especialidades` - Especialidades médicas
- `citas` - Citas médicas programadas
- `historiales` - Historial médico de los pacientes
- `disponibilidad` - Horarios disponibles de los médicos

#### **Relaciones Clave:**

```sql
usuarios (1:1) medicos
usuarios (1:1) pacientes
medicos (N:1) especialidades
citas (N:1) medicos
citas (N:1) pacientes
historiales (N:1) medicos
historiales (N:1) pacientes
```

### Conexión a la Base de Datos

```javascript
// database/connectiondb.js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

---

## 🏛️ Modelos (Models)

Los modelos encapsulan la lógica de acceso a datos y las consultas SQL.

### Estructura de un Modelo:

```javascript
// models/authModel.js
class Auth {
  // Método estático para buscar usuario por email
  static async findUserByEmail(usuario_correo) {
    const query = "SELECT * FROM usuarios WHERE usuario_correo = ?";
    const result = await db.executeQuery(query, [usuario_correo]);
    return result.data[0] || null;
  }

  // Método para verificar credenciales
  static async verifyCredentials(usuario_correo, usuario_contrasena) {
    // Lógica de verificación
  }
}
```

### Modelos Implementados:

1. **authModel.js** - Autenticación y autorización
2. **userModel.js** - Gestión de usuarios
3. **doctorModel.js** - Gestión de médicos
4. **patientModel.js** - Gestión de pacientes
5. **appointmentModel.js** - Gestión de citas
6. **historialModel.js** - Historial médico
7. **specialtyModel.js** - Especialidades médicas
8. **roleModel.js** - Roles del sistema

### Patrones Utilizados:

- **Clases estáticas** para métodos de acceso a datos
- **Manejo de errores** centralizado
- **Consultas parametrizadas** para prevenir SQL injection
- **Retorno consistente** de datos

---

## 🎮 Controladores (Controllers)

Los controladores manejan la lógica de negocio y la comunicación entre el cliente y los modelos.

### Estructura de un Controlador:

```javascript
// controllers/authController.js
const authController = {
  async login(req, res) {
    try {
      const { usuario_correo, usuario_contrasena } = req.body;
      const result = await Auth.verifyCredentials(
        usuario_correo,
        usuario_contrasena
      );

      if (!result.success) {
        return res.status(401).json({ error: result.message });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
```

### Controladores Implementados:

1. **authController.js** - Login, registro, cambio de contraseña
2. **userController.js** - CRUD de usuarios
3. **doctorController.js** - Gestión de médicos
4. **patientController.js** - Gestión de pacientes
5. **appointmentController.js** - CRUD de citas
6. **historialController.js** - Historial médico
7. **specialtyController.js** - Especialidades
8. **roleController.js** - Roles

### Patrones Utilizados:

- **Try-catch** para manejo de errores
- **Status codes** HTTP apropiados
- **Validación de datos** de entrada
- **Respuestas JSON** consistentes

---

## 🛣️ Rutas (Routes)

Las rutas definen los endpoints de la API y conectan las peticiones HTTP con los controladores.

### Estructura de Rutas:

```javascript
// routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.put("/change-password", authController.changePassword);

export default router;
```

### Rutas Implementadas:

1. **authRoutes.js** - `/api/auth/*`
2. **userRoutes.js** - `/api/usuarios/*`
3. **doctorRoutes.js** - `/api/medicos/*`
4. **patientRoutes.js** - `/api/pacientes/*`
5. **appointmentRoutes.js** - `/api/citas/*`
6. **historialRoutes.js** - `/api/historial/*`
7. **specialtyRoutes.js** - `/api/especialidades/*`
8. **roleRoutes.js** - `/api/roles/*`

### Patrones Utilizados:

- **RESTful API** design
- **Agrupación lógica** de endpoints
- **Middleware de autenticación** en rutas protegidas
- **Validación de roles** para endpoints específicos

---

## 🔒 Middleware

Los middlewares procesan las peticiones antes de que lleguen a los controladores.

### Middlewares Implementados:

#### 1. **verifyToken.js** - Verificación de JWT

```javascript
export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};
```

#### 2. **authorizeRoles.js** - Autorización por roles

```javascript
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autorizado" });
    }

    if (!roles.includes(req.user.rol_id)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    next();
  };
};
```

### Uso de Middlewares:

- **Autenticación global** en rutas protegidas
- **Autorización específica** por roles
- **Validación de datos** de entrada
- **Logging** de peticiones

---

## ⚙️ Configuración de la Aplicación

### app.js - Configuración Principal

```javascript
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

dotenv.config();

export default app;
```

### server.js - Punto de Entrada

```javascript
import app from "./app.js";
import { testConnection } from "../database/connectiondb.js";

// Importar todas las rutas
import appointmentRouter from "./routes/appointmentRoute.js";
import authRouter from "./routes/authRoutes.js";
// ... más rutas

// Configurar rutas
app.use("/api/citas", appointmentRouter);
app.use("/api/auth", authRouter);
// ... más rutas

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await testConnection();
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});
```

---

## 🔄 Flujo de Datos

### 1. **Petición HTTP**

```
Cliente → Express Router → Middleware → Controller → Model → Database
```

### 2. **Procesamiento de Datos**

```
Database → Model → Controller → Middleware → Express Router → Cliente
```

### 3. **Ejemplo de Flujo Completo (Login)**

1. **Cliente** envía POST a `/api/auth/login`
2. **Express Router** recibe la petición
3. **authController.login** procesa la petición
4. **authModel.verifyCredentials** consulta la base de datos
5. **Base de datos** retorna los datos del usuario
6. **Modelo** procesa y valida los datos
7. **Controlador** genera respuesta con JWT
8. **Cliente** recibe token y datos del usuario

---

## 🎨 Patrones de Diseño

### 1. **MVC (Model-View-Controller)**

- **Model**: Acceso a datos y lógica de negocio
- **View**: Respuestas JSON (API)
- **Controller**: Lógica de control y coordinación

### 2. **Repository Pattern**

- Los modelos actúan como repositorios de datos
- Encapsulación de consultas SQL
- Abstracción de la base de datos

### 3. **Middleware Pattern**

- Procesamiento en cadena de peticiones
- Separación de responsabilidades
- Reutilización de código

### 4. **Dependency Injection**

- Inyección de dependencias en controladores
- Facilita testing y mantenimiento
- Bajo acoplamiento

---

## 🔐 Seguridad

### Medidas Implementadas:

1. **JWT Authentication**

   - Tokens seguros con expiración
   - Verificación en cada petición protegida

2. **Password Hashing**

   - bcrypt para encriptación de contraseñas
   - Salt automático para mayor seguridad

3. **SQL Injection Prevention**

   - Consultas parametrizadas
   - Validación de entrada

4. **CORS Configuration**

   - Control de acceso entre dominios
   - Configuración específica para frontend

5. **Role-Based Access Control**
   - Autorización por roles
   - Middleware de verificación

---

## 📊 Monitoreo y Logging

### Logging Implementado:

- **Console.log** para desarrollo
- **Error tracking** en controladores
- **Database connection** status
- **Request/Response** logging

### Métricas:

- **Response times** de endpoints
- **Error rates** por endpoint
- **Database performance** monitoring

---

## 🚀 Despliegue

### Variables de Entorno:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=medinet
JWT_SECRET=your_secret_key
```

### Comandos de Desarrollo:

```bash
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo con nodemon
npm test           # Ejecutar tests
```

---

## 📈 Escalabilidad

### Consideraciones Futuras:

1. **Clustering** con PM2
2. **Load balancing** con Nginx
3. **Database sharding** para grandes volúmenes
4. **Caching** con Redis
5. **Microservices** architecture

### Optimizaciones Actuales:

- **Connection pooling** para MySQL
- **Query optimization** en modelos
- **Middleware efficiency** en rutas
- **Error handling** robusto

---

## 🔧 Mantenimiento

### Buenas Prácticas:

1. **Código limpio** y documentado
2. **Separación de responsabilidades**
3. **Manejo de errores** consistente
4. **Testing** automatizado
5. **Versionado** de API

### Estructura Modular:

- **Fácil mantenimiento** de código
- **Escalabilidad** horizontal
- **Testing** individual de componentes
- **Debugging** simplificado

---

_Esta documentación refleja la arquitectura actual del backend de MEDINET y puede ser actualizada conforme evolucione el sistema._
