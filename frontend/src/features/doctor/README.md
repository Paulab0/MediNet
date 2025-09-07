# Dashboard del Doctor - MEDINET

## 🏥 Descripción

Dashboard completo para médicos que incluye gestión de citas, pacientes, estadísticas y más funcionalidades esenciales para la práctica médica.

## ✨ Características Principales

### 📊 **Dashboard Principal**

- **Saludo Personalizado**: Mensaje de bienvenida con el nombre del doctor
- **Estadísticas Semanales**: Total de pacientes, llamadas, citas y correos no leídos
- **Gráficos Visuales**: Representación gráfica de datos médicos
- **Diseño Responsive**: Adaptable a diferentes tamaños de pantalla

### 📅 **Gestión de Citas**

- **Vista de Citas**: Tabla con información completa de pacientes
- **Estados de Citas**: Pending, Completed, Cancelled
- **Filtros Avanzados**: Por fecha, estado, tipo de cita
- **Formulario de Agendamiento**: Modal completo para crear nuevas citas

### 👥 **Gestión de Pacientes**

- **Lista de Pacientes**: Información detallada de cada paciente
- **Historial Médico**: Acceso rápido a expedientes
- **Agregar Pacientes**: Formulario de registro de nuevos pacientes

### 📈 **Reportes y Estadísticas**

- **Reportes Semanales**: Métricas de rendimiento
- **Calendario de Horarios**: Vista mensual con citas marcadas
- **Gráficos de Pacientes**: Distribución temporal de consultas

## 🎨 **Diseño y Estilo**

### **Esquema de Colores**

- **Morado Principal**: `#7C3AED` (purple-600) - Navegación y elementos principales
- **Naranja Acentos**: `#F97316` (orange-500) - Elementos destacados y activos
- **Blanco**: `#FFFFFF` - Fondos y tarjetas
- **Gris**: `#6B7280` - Textos secundarios y bordes

### **Componentes Visuales**

- **Bordes Redondeados**: `rounded-3xl`, `rounded-2xl` para un look moderno
- **Sombras Sutiles**: `shadow-sm`, `shadow-2xl` para profundidad
- **Transiciones Suaves**: `transition-all duration-200` para interactividad
- **Iconos Heroicons**: Sistema de iconos consistente y profesional

## 🚀 **Funcionalidades Implementadas**

### **1. Navegación Lateral**

- Logo de la aplicación
- Menú de navegación con iconos
- Indicadores de sección activa
- Transiciones hover suaves

### **2. Header Superior**

- Barra de búsqueda de citas
- Botón de historial de citas
- Botón de agendar nueva cita
- Notificaciones y configuración
- Perfil del doctor

### **3. Área Principal**

- **Tarjeta de Saludo**: Mensaje personalizado con ilustración
- **Reportes Semanales**: 4 tarjetas de estadísticas + botón de agregar
- **Tabla de Citas**: Vista completa con avatares y estados

### **4. Barra Lateral Derecha**

- **Calendario de Horarios**: Vista mensual navegable
- **Reportes Mensuales**: Lista de próximas citas
- **Gráfico de Pacientes**: Estadísticas visuales

## 📱 **Formulario de Agendamiento**

### **Campos del Formulario**

- **Información del Paciente**: Nombre, correo, teléfono
- **Detalles de la Cita**: Fecha, hora, tipo, ubicación
- **Notas Adicionales**: Observaciones y síntomas

### **Validaciones en Tiempo Real**

- **Validación de Campos**: Requeridos, formato, rangos
- **Indicadores Visuales**: Bordes de colores y iconos de estado
- **Mensajes de Error**: Contextuales y específicos
- **Prevención de Envío**: Botón deshabilitado si hay errores

### **Tipos de Cita Disponibles**

- Consulta General
- Seguimiento
- Urgencia
- Examen
- Cirugía
- Terapia

## 🔧 **Servicios y API**

### **appointmentService.js**

- `getAppointments()`: Obtener todas las citas
- `createAppointment()`: Crear nueva cita
- `updateAppointment()`: Actualizar cita existente
- `deleteAppointment()`: Eliminar cita
- `getAppointmentsByDate()`: Filtrar por fecha
- `getAppointmentsByStatus()`: Filtrar por estado
- `changeAppointmentStatus()`: Cambiar estado
- `getAppointmentStats()`: Obtener estadísticas

## 📁 **Estructura de Archivos**

```
frontend/src/features/doctor/
├── components/
│   ├── DoctorDashboard.jsx      # Dashboard principal
│   └── AppointmentForm.jsx      # Formulario de citas
├── pages/
│   └── DashboardPage.jsx        # Página del dashboard
└── README.md                     # Esta documentación
```

## 🎯 **Uso del Dashboard**

### **1. Acceso**

- Navegar a `/dashboard` después del login
- Verificar que el usuario tenga rol de médico

### **2. Agendar Cita**

- Hacer clic en "Agendar Cita" en el header
- Completar el formulario con validaciones
- Confirmar la creación de la cita

### **3. Gestionar Citas Existentes**

- Ver todas las citas en la tabla principal
- Cambiar estados (Pending → Completed)
- Filtrar por fecha o estado

### **4. Ver Estadísticas**

- Cambiar período en "Weekly Reports"
- Navegar por el calendario mensual
- Revisar gráficos de pacientes

## 🔒 **Seguridad y Autenticación**

- **Ruta Protegida**: Solo accesible para usuarios autenticados
- **Validación de Rol**: Verificación de permisos de médico
- **Tokens JWT**: Autenticación segura en todas las operaciones
- **Validación de Datos**: Frontend y backend

## 🚧 **Próximas Funcionalidades**

- [ ] **Chat en Tiempo Real**: Comunicación con pacientes
- [ ] **Historial Médico**: Expedientes completos de pacientes
- [ ] **Prescripciones**: Sistema de recetas médicas
- [ ] **Facturación**: Gestión de pagos y facturas
- [ ] **Notificaciones Push**: Recordatorios de citas
- [ ] **Reportes Avanzados**: Exportación a PDF/Excel

## 🎨 **Personalización**

### **Cambiar Colores**

```css
/* En el CSS o Tailwind config */
:root {
  --primary-color: #7c3aed; /* Morado principal */
  --accent-color: #f97316; /* Naranja acentos */
  --success-color: #10b981; /* Verde éxito */
  --error-color: #ef4444; /* Rojo error */
}
```

### **Modificar Iconos**

```jsx
// Reemplazar iconos de Heroicons
import { UserIcon } from "@heroicons/react/24/outline";
// Por iconos personalizados o de otras librerías
```

## 📞 **Soporte y Mantenimiento**

- **Documentación**: Este README y comentarios en el código
- **Estructura Modular**: Fácil de mantener y extender
- **Componentes Reutilizables**: Patrón consistente en toda la app
- **Validaciones Robustas**: Prevención de errores y mejor UX

---

¡El Dashboard del Doctor está listo para revolucionar la gestión médica! 🏥✨

