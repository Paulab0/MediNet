# 🚀 Resumen Ejecutivo: Pasos para Activar Funcionalidades

## ⚡ Guía Rápida (5 minutos)

### 1️⃣ Ejecutar SQL (2 minutos)

**Opción más fácil - MySQL Workbench:**
1. Abre MySQL Workbench
2. Conecta a tu base de datos `medinetdb`
3. Abre el archivo: `MediNet/backend/database/migrations/complete_requirements.sql`
4. Ejecuta el script (botón ⚡)
5. Verifica ejecutando: `MediNet/SCRIPT_VERIFICACION.sql`

**Por qué:** Crea las tablas necesarias para todas las funcionalidades nuevas.

---

### 2️⃣ Configurar Email (2 minutos)

**Crear archivo `.env` en `MediNet/backend/`:**

```env
# Copia esto y completa con tus datos

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=medinetdb

JWT_SECRET=tu_clave_secreta_minimo_32_caracteres
JWT_EXPIRES_IN=8h

EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=contraseña_de_aplicacion_gmail
FRONTEND_URL=http://localhost:5173

PORT=3000
NODE_ENV=development
```

**Para obtener contraseña de aplicación Gmail:**
1. Ve a: https://myaccount.google.com/apppasswords
2. Genera una contraseña para "Correo"
3. Copia y pega en `EMAIL_PASSWORD`

**Por qué:** Permite enviar emails de recuperación de contraseña y confirmaciones.

---

### 3️⃣ Reiniciar Servidores (1 minuto)

**Backend:**
```bash
cd MediNet/backend
# Presiona Ctrl+C si está corriendo
npm run dev
```

**Frontend:**
```bash
cd MediNet/frontend
# Presiona Ctrl+C si está corriendo
npm run dev
```

**Por qué:** Carga las nuevas rutas y configuraciones.

---

## ✅ Verificación Rápida

1. **Backend corriendo:** http://localhost:3000
2. **Frontend corriendo:** http://localhost:5173
3. **Sin errores** en las consolas
4. **Probar login:** Iniciar sesión debe funcionar

---

## 📋 Checklist Completo

Para más detalles, consulta: `GUIA_PROXIMOS_PASOS.md`

- [ ] SQL ejecutado
- [ ] .env configurado
- [ ] Backend reiniciado
- [ ] Frontend reiniciado
- [ ] Login funciona
- [ ] Recuperación de contraseña funciona
- [ ] Foto de perfil funciona

---

## 🆘 Si algo no funciona

1. **Verifica errores en consola** del backend/frontend
2. **Ejecuta `SCRIPT_VERIFICACION.sql`** para ver qué falta
3. **Revisa que MySQL esté corriendo**
4. **Verifica que el .env esté en la ubicación correcta**

---

**Tiempo estimado total: 5 minutos** ⏱️

