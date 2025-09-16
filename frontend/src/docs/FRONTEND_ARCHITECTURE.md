# ⚛️ Arquitectura del Frontend - MEDINET

## 📋 Índice

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Tecnologías y Herramientas](#tecnologías-y-herramientas)
4. [Sistema de Rutas](#sistema-de-rutas)
5. [Gestión de Estado](#gestión-de-estado)
6. [Sistema de Autenticación](#sistema-de-autenticación)
7. [Arquitectura de Componentes](#arquitectura-de-componentes)
8. [Servicios y API](#servicios-y-api)
9. [Features y Pages](#features-y-pages)
10. [Sistema de Roles](#sistema-de-roles)
11. [Flujo de Datos](#flujo-de-datos)
12. [Patrones de Diseño](#patrones-de-diseño)

---

## 🎯 Visión General

El frontend de MEDINET está construido con **React 18** y **Vite**, siguiendo una arquitectura **modular y escalable** con separación clara de responsabilidades. Utiliza **React Router DOM** para navegación, **Context API** para gestión de estado global, y **Tailwind CSS** para estilos.

### Tecnologías Principales:

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Tailwind CSS** - Framework de estilos
- **Axios** - Cliente HTTP
- **Heroicons** - Iconografía
- **Context API** - Gestión de estado global

---

## 📁 Estructura del Proyecto

```
frontend/src/
├── main.jsx                    # Punto de entrada de la aplicación
├── App.jsx                     # Componente raíz
├── api/
│   └── api.js                  # Configuración de Axios
├── components/                 # Componentes reutilizables
│   ├── ProtectedRoute.jsx      # Protección de rutas
│   └── RoleRedirect.jsx        # Redirección por roles
├── contexts/
│   └── AuthContext.jsx         # Contexto de autenticación
├── features/                   # Funcionalidades por módulo
│   ├── auth/                   # Autenticación
│   ├── doctor/                 # Funcionalidades del médico
│   └── patient/                # Funcionalidades del paciente
├── routes/
│   └── AppRoutes.jsx           # Configuración de rutas
├── services/                   # Servicios de API
├── css/
│   └── index.css               # Estilos globales
└── docs/                       # Documentación
```

---

## 🛠️ Tecnologías y Herramientas

### Core Technologies:

- **React 18** - Biblioteca principal para UI
- **JavaScript (ES6+)** - Lenguaje de programación
- **Vite** - Herramienta de build ultra-rápida

### Routing & Navigation:

- **React Router DOM v6** - Enrutamiento declarativo
- **Navigate** - Componente de redirección
- **Routes & Route** - Configuración de rutas

### Styling:

- **Tailwind CSS** - Framework de utilidades CSS
- **PostCSS** - Procesador de CSS
- **Responsive Design** - Diseño adaptativo

### State Management:

- **React Context API** - Estado global
- **useState** - Estado local de componentes
- **useEffect** - Efectos secundarios

### HTTP Client:

- **Axios** - Cliente HTTP con interceptores
- **Request/Response interceptors** - Manejo automático de tokens

---

## 🛣️ Sistema de Rutas

### Configuración Principal (AppRoutes.jsx)

```javascript
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRedirect from "../components/RoleRedirect";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Ruta de redirección por rol */}
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Rutas protegidas por rol */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute requiredRole={2}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
```

### Tipos de Rutas:

1. **Rutas Públicas** - Accesibles sin autenticación

   - `/login` - Formulario de inicio de sesión
   - `/register` - Formulario de registro

2. **Rutas Protegidas** - Requieren autenticación

   - `/doctor/dashboard` - Dashboard del médico
   - `/admin/dashboard` - Dashboard del administrador
   - `/patient/dashboard` - Dashboard del paciente

3. **Rutas de Redirección** - Lógica de navegación
   - `/dashboard` - Redirección según rol del usuario

---

## 🔐 Sistema de Autenticación

### AuthContext - Gestión Global de Estado

```javascript
// contexts/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.token && response.user) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### Funcionalidades del Contexto:

1. **Estado Global** - Usuario y estado de autenticación
2. **Persistencia** - Almacenamiento en localStorage
3. **Métodos de Autenticación** - Login, logout, verificación
4. **Gestión de Roles** - Verificación de permisos
5. **Loading States** - Estados de carga

---

## 🛡️ Protección de Rutas

### ProtectedRoute Component

```javascript
// components/ProtectedRoute.jsx
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

### RoleRedirect Component

```javascript
// components/RoleRedirect.jsx
const RoleRedirect = () => {
  const { user } = useAuth();

  if (user?.rol_id === 2) {
    return <Navigate to="/doctor/dashboard" replace />;
  }
  // ... más redirecciones por rol
};
```

### Características:

- **Verificación de Autenticación** - Token válido
- **Autorización por Roles** - Permisos específicos
- **Redirección Automática** - Según rol del usuario
- **Loading States** - Estados de carga

---

## 🏗️ Arquitectura de Componentes

### Estructura Jerárquica

```
App
├── AuthProvider (Context)
├── AppRoutes
│   ├── Public Routes
│   │   ├── LoginForm
│   │   └── RegisterForm
│   └── Protected Routes
│       ├── ProtectedRoute
│       └── RoleRedirect
│           └── DoctorDashboard
│               ├── Header
│               ├── Sidebar
│               ├── Main Content
│               └── Modals
```

### Tipos de Componentes:

1. **Layout Components** - Estructura general
2. **Feature Components** - Funcionalidades específicas
3. **UI Components** - Elementos reutilizables
4. **Form Components** - Formularios
5. **Modal Components** - Ventanas emergentes

---

## 🌐 Servicios y API

### Configuración de Axios (api.js)

```javascript
// api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Servicios Implementados:

1. **authService.js** - Autenticación y autorización
2. **appointmentService.js** - Gestión de citas
3. **doctorService.js** - Datos del médico
4. **patientService.js** - Gestión de pacientes
5. **historialService.js** - Historial médico
6. **specialtyService.js** - Especialidades

### Patrón de Servicios:

```javascript
// services/authService.js
const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};
```

---

## 🎯 Features y Pages

### Estructura de Features

```
features/
├── auth/                       # Módulo de autenticación
│   ├── components/
│   │   ├── LoginForm.jsx       # Formulario de login
│   │   └── RegisterForm.jsx    # Formulario de registro
│   └── pages/
│       └── RegisterPage.jsx    # Página de registro
├── doctor/                     # Módulo del médico
│   ├── components/
│   │   ├── DoctorDashboard.jsx # Dashboard principal
│   │   ├── AppointmentForm.jsx # Formulario de citas
│   │   ├── PatientsView.jsx    # Vista de pacientes
│   │   ├── NotificationsView.jsx # Notificaciones
│   │   └── CalendarView.jsx    # Vista de calendario
│   └── pages/
│       └── DashboardPage.jsx   # Página del dashboard
└── patient/                    # Módulo del paciente (futuro)
```

### Características de Features:

1. **Separación Modular** - Cada feature es independiente
2. **Componentes Específicos** - Lógica de negocio encapsulada
3. **Páginas Contenedoras** - Layout específico por feature
4. **Reutilización** - Componentes compartidos

---

## 👥 Sistema de Roles

### Roles Implementados:

1. **Administrador (rol_id: 1)**

   - Acceso completo al sistema
   - Gestión de usuarios y médicos
   - Dashboard administrativo

2. **Médico (rol_id: 2)**

   - Gestión de citas y pacientes
   - Historial médico
   - Dashboard médico

3. **Paciente (rol_id: 3)**
   - Visualización de citas
   - Historial personal
   - Dashboard paciente

### Implementación de Roles:

```javascript
// En AuthContext
const hasRole = (role) => {
  if (!user) return false;
  return user.rol_id === role || user.rol_nombre === role;
};

// En ProtectedRoute
if (requiredRole && !hasRole(requiredRole)) {
  return <Navigate to="/dashboard" replace />;
}
```

---

## 🔄 Flujo de Datos

### 1. **Flujo de Autenticación**

```
Usuario → LoginForm → authService → API → AuthContext → ProtectedRoute → Dashboard
```

### 2. **Flujo de Datos de Citas**

```
DoctorDashboard → appointmentService → API → Backend → Database → Response → UI Update
```

### 3. **Flujo de Navegación**

```
URL Change → React Router → Route Matching → Component Rendering → State Update
```

### 4. **Flujo de Estado Global**

```
User Action → Component State → Context Update → Re-render → UI Update
```

---

## 🎨 Patrones de Diseño

### 1. **Component Composition**

```javascript
<ProtectedRoute requiredRole={2}>
  <DashboardPage>
    <Header />
    <Sidebar />
    <MainContent />
  </DashboardPage>
</ProtectedRoute>
```

### 2. **Custom Hooks Pattern**

```javascript
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

### 3. **Higher-Order Components (HOC)**

```javascript
const withAuth = (WrappedComponent) => {
  return (props) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated() ? (
      <WrappedComponent {...props} />
    ) : (
      <Navigate to="/login" />
    );
  };
};
```

### 4. **Render Props Pattern**

```javascript
<AuthContext.Consumer>
  {({ user, login, logout }) => <div>Welcome {user?.name}</div>}
</AuthContext.Consumer>
```

---

## 🎯 Gestión de Estado

### Niveles de Estado:

1. **Estado Local** - `useState` en componentes
2. **Estado de Contexto** - `AuthContext` para datos globales
3. **Estado de URL** - React Router para navegación
4. **Estado Persistente** - localStorage para datos del usuario

### Patrones de Estado:

```javascript
// Estado local
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);

// Estado global
const { user, login, logout } = useAuth();

// Estado de URL
const navigate = useNavigate();
navigate("/dashboard");
```

---

## 🎨 Sistema de Estilos

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#10B981",
      },
    },
  },
  plugins: [],
};
```

### Patrones de Estilos:

1. **Utility-First** - Clases de Tailwind
2. **Component Styling** - Estilos específicos por componente
3. **Responsive Design** - Breakpoints móviles
4. **Dark Mode Ready** - Preparado para modo oscuro

---

## 🚀 Performance y Optimización

### Optimizaciones Implementadas:

1. **Code Splitting** - Carga lazy de componentes
2. **Memoization** - `useMemo` y `useCallback`
3. **Bundle Optimization** - Vite para builds rápidos
4. **Image Optimization** - Optimización de assets

### Patrones de Performance:

```javascript
// Memoización de componentes
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// Callback memoizado
const handleClick = useCallback(() => {
  // lógica
}, [dependencies]);
```

---

## 🧪 Testing Strategy

### Estructura de Testing:

1. **Unit Tests** - Componentes individuales
2. **Integration Tests** - Flujos completos
3. **E2E Tests** - Casos de uso completos

### Herramientas de Testing:

- **Jest** - Framework de testing
- **React Testing Library** - Testing de componentes
- **Cypress** - Testing E2E

---

## 📱 Responsive Design

### Breakpoints:

- **Mobile** - < 640px
- **Tablet** - 640px - 1024px
- **Desktop** - > 1024px

### Patrones Responsive:

```javascript
// Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>
```

---

## 🔧 Desarrollo y Build

### Scripts de Desarrollo:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Variables de Entorno:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=MEDINET
```

---

## 🚀 Despliegue

### Configuración de Producción:

1. **Build Optimization** - Minificación y compresión
2. **Environment Variables** - Configuración por ambiente
3. **Static Hosting** - Despliegue en CDN
4. **HTTPS** - Certificados SSL

---

## 📈 Escalabilidad

### Consideraciones Futuras:

1. **State Management** - Redux Toolkit para estado complejo
2. **Micro Frontends** - Arquitectura modular
3. **Server-Side Rendering** - Next.js para SEO
4. **Progressive Web App** - Funcionalidades offline

### Patrones de Escalabilidad:

- **Feature-based Architecture** - Organización por funcionalidad
- **Component Library** - Biblioteca de componentes reutilizables
- **Design System** - Sistema de diseño consistente

---

## 🔧 Mantenimiento

### Buenas Prácticas:

1. **Código Limpio** - Nombres descriptivos y funciones pequeñas
2. **Documentación** - Comentarios y documentación actualizada
3. **Versionado** - Control de versiones con Git
4. **Testing** - Cobertura de tests adecuada

### Estructura Modular:

- **Fácil Mantenimiento** - Código organizado y documentado
- **Escalabilidad** - Arquitectura preparada para crecimiento
- **Testing** - Tests automatizados
- **Debugging** - Herramientas de desarrollo

---

_Esta documentación refleja la arquitectura actual del frontend de MEDINET y puede ser actualizada conforme evolucione el sistema._
