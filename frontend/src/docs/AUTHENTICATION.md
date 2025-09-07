# Sistema de Autenticación - MEDINET

## 🔐 Descripción General

El sistema de autenticación de MEDINET está diseñado para manejar tres tipos de usuarios:

- **Administrador** (rol_id: 1)
- **Médico** (rol_id: 2)
- **Paciente** (rol_id: 3)

## 🏗️ Arquitectura

### **1. AuthContext (`/contexts/AuthContext.jsx`)**

- **Propósito**: Maneja el estado global de autenticación
- **Funciones**:
  - `login()`: Autentica al usuario y guarda token/datos
  - `logout()`: Limpia la sesión
  - `isAuthenticated()`: Verifica si hay sesión activa
  - `hasRole()`: Verifica si el usuario tiene un rol específico

### **2. ProtectedRoute (`/components/ProtectedRoute.jsx`)**

- **Propósito**: Protege rutas que requieren autenticación
- **Funciones**:
  - Verifica token válido
  - Redirige según rol si no tiene permisos
  - Muestra loading mientras verifica

### **3. RoleRedirect (`/components/RoleRedirect.jsx`)**

- **Propósito**: Redirige automáticamente según el rol del usuario
- **Rutas**:
  - Administrador → `/admin/dashboard`
  - Médico → `/doctor/dashboard`
  - Paciente → `/patient/dashboard`

## 🛣️ Rutas Configuradas

### **Rutas Públicas**

- `/login` - Formulario de inicio de sesión
- `/register` - Formulario de registro

### **Rutas Protegidas**

- `/dashboard` - Redirección automática por rol
- `/doctor/dashboard` - Dashboard médico (rol: 2)
- `/admin/dashboard` - Dashboard administrador (rol: 1)
- `/patient/dashboard` - Dashboard paciente (rol: 3)

## 🔄 Flujo de Autenticación

### **1. Login**

```javascript
// Usuario ingresa credenciales
const data = await login(email, password);

// Sistema redirige según rol
switch (data.user.rol_id) {
  case 1:
    navigate("/admin/dashboard");
    break;
  case 2:
    navigate("/doctor/dashboard");
    break;
  case 3:
    navigate("/patient/dashboard");
    break;
}
```

### **2. Protección de Rutas**

```javascript
// Ruta protegida para médicos
<Route
  path="/doctor/dashboard"
  element={
    <ProtectedRoute requiredRole={2}>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### **3. Verificación de Token**

- Token se guarda en `localStorage`
- Se incluye automáticamente en todas las peticiones API
- Se verifica en cada navegación a rutas protegidas

## 💾 Almacenamiento

### **localStorage**

- `token`: JWT token del usuario
- `user`: Datos completos del usuario (JSON)

### **Estructura del Usuario**

```javascript
{
  usuario_id: 1,
  usuario_nombre: "Juan",
  usuario_apellido: "Pérez",
  usuario_correo: "juan@medinet.com",
  rol_id: 2,
  rol_nombre: "Medico"
}
```

## 🚀 Uso en Componentes

### **Hook useAuth**

```javascript
import { useAuth } from "../contexts/AuthContext";

const MyComponent = () => {
  const { user, logout, hasRole } = useAuth();

  // Verificar rol
  if (hasRole(2)) {
    // Es médico
  }

  // Cerrar sesión
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
};
```

### **Protección de Componentes**

```javascript
// Solo para médicos
{
  hasRole(2) && <DoctorOnlyComponent />;
}

// Solo para administradores
{
  hasRole(1) && <AdminOnlyComponent />;
}
```

## 🔧 Configuración de API

### **Interceptores Axios**

```javascript
// Incluye token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## 🎯 Características Implementadas

✅ **Autenticación por roles**
✅ **Protección de rutas**
✅ **Redirección automática**
✅ **Persistencia de sesión**
✅ **Logout seguro**
✅ **Verificación de token**
✅ **Loading states**
✅ **Manejo de errores**

## 🔮 Próximas Funcionalidades

- [ ] **Refresh token** automático
- [ ] **Recordar sesión** opcional
- [ ] **Verificación de permisos** granulares
- [ ] **Auditoría de sesiones**
- [ ] **Notificaciones de seguridad**

---

¡El sistema de autenticación está listo para usar! 🎉
