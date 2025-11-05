# 📋 Guía Detallada: Próximos Pasos para Activar las Funcionalidades

## 🎯 Objetivo de esta Guía

Esta guía te explica **por qué** y **cómo** hacer cada paso necesario para activar todas las nuevas funcionalidades implementadas en MediNet.

---

## 📌 Paso 1: Ejecutar Migración SQL

### ¿Por qué es necesario?

El script SQL crea las tablas y columnas necesarias en la base de datos para que funcionen todas las nuevas características:

- **Sin ejecutar el SQL:**
  - ❌ No existirán las tablas para recuperación de contraseña
  - ❌ No habrá tabla de notificaciones
  - ❌ No se podrán guardar logs de actividad
  - ❌ No habrá configuración de horarios
  - ❌ No se podrán subir fotos de perfil
  - ❌ No habrá consultorios en médicos
  - ❌ Los estados de citas estarán limitados

- **Después de ejecutar el SQL:**
  - ✅ Todas las tablas necesarias estarán creadas
  - ✅ Las columnas nuevas estarán disponibles
  - ✅ Los índices mejorarán el rendimiento
  - ✅ Los datos iniciales de configuración estarán listos

### ¿Cómo hacerlo?

#### Opción 1: Usando MySQL Workbench o phpMyAdmin (Recomendado)

1. **Abrir tu herramienta de gestión de MySQL:**
   - MySQL Workbench
   - phpMyAdmin
   - DBeaver
   - HeidiSQL

2. **Conectarte a tu base de datos:**
   - Host: `localhost` (o tu servidor)
   - Usuario: `root` (o tu usuario)
   - Base de datos: `medinetdb`

3. **Abrir el archivo SQL:**
   ```
   Ruta: MediNet/backend/database/migrations/complete_requirements.sql
   ```

4. **Ejecutar el script:**
   - En MySQL Workbench: Click en el botón ⚡ (Execute)
   - En phpMyAdmin: Ir a la pestaña "SQL" y pegar el contenido
   - En línea de comandos: Ver opción 2

5. **Verificar que se ejecutó correctamente:**
   - Deberías ver mensajes de éxito
   - No debería haber errores
   - Puedes verificar las tablas nuevas ejecutando:
     ```sql
     SHOW TABLES LIKE 'password_reset_tokens';
     SHOW TABLES LIKE 'notificaciones';
     SHOW TABLES LIKE 'logs_actividad';
     SHOW TABLES LIKE 'configuracion_sistema';
     ```

#### Opción 2: Usando Línea de Comandos (Terminal/CMD)

1. **Abrir terminal en Windows:**
   - Presiona `Win + R`
   - Escribe `cmd` y presiona Enter

2. **Navegar a la carpeta del proyecto:**
   ```bash
   cd C:\Users\Aprendiz\Documents\MediNet\MediNet\backend\database\migrations
   ```

3. **Ejecutar el script SQL:**
   ```bash
   mysql -u root -p medinetdb < complete_requirements.sql
   ```
   
   **Nota:** Te pedirá la contraseña de MySQL. Si no tienes contraseña, usa:
   ```bash
   mysql -u root medinetdb < complete_requirements.sql
   ```

4. **Si tienes problemas con la ruta de MySQL:**
   - Busca la ruta completa de MySQL (normalmente: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`)
   - Usa la ruta completa:
     ```bash
     "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p medinetdb < complete_requirements.sql
     ```

#### Opción 3: Ejecutar directamente desde Node.js (Alternativa)

Si prefieres, puedo crear un script Node.js que ejecute el SQL automáticamente. ¿Quieres que lo haga?

---

## 📧 Paso 2: Configurar Variables de Entorno (Email)

### ¿Por qué es necesario?

El sistema necesita configuración de email para:
- ✉️ **Enviar emails de recuperación de contraseña**
- ✉️ **Enviar confirmaciones de citas**
- ✉️ **Enviar recordatorios automáticos**
- ✉️ **Notificaciones por email**

**Sin configurar email:**
- ❌ Los usuarios no podrán recuperar contraseñas por email
- ❌ No se enviarán confirmaciones de citas
- ❌ Los recordatorios automáticos no funcionarán
- ⚠️ El sistema seguirá funcionando, pero estas características no estarán disponibles

### ¿Cómo hacerlo?

#### Paso 2.1: Crear o Editar el archivo .env

1. **Ubicación del archivo:**
   ```
   MediNet/backend/.env
   ```

2. **Si no existe el archivo, créalo:**
   - Abre un editor de texto (Notepad++, VS Code, etc.)
   - Crea un nuevo archivo llamado `.env` (sin extensión)
   - Guárdalo en: `MediNet/backend/.env`

3. **Agregar las siguientes variables:**

   ```env
   # ============================================
   # CONFIGURACIÓN DE BASE DE DATOS
   # ============================================
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña_mysql
   DB_NAME=medinetdb
   DB_PORT=3306

   # ============================================
   # CONFIGURACIÓN DE JWT (AUTENTICACIÓN)
   # ============================================
   JWT_SECRET=tu_clave_secreta_super_segura_aqui_minimo_32_caracteres
   JWT_EXPIRES_IN=8h

   # ============================================
   # CONFIGURACIÓN DE EMAIL (NUEVO - REQUERIDO)
   # ============================================
   EMAIL_SERVICE=gmail
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=tu_contraseña_de_aplicacion
   FRONTEND_URL=http://localhost:5173

   # ============================================
   # CONFIGURACIÓN DEL SERVIDOR
   # ============================================
   PORT=3000
   NODE_ENV=development
   ```

#### Paso 2.2: Configurar Email con Gmail (Ejemplo más común)

**Opción A: Usar Contraseña de Aplicación (Recomendado para Gmail)**

1. **Activar verificación en 2 pasos en tu cuenta de Google:**
   - Ve a: https://myaccount.google.com/security
   - Activa "Verificación en 2 pasos"

2. **Generar una contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "MediNet" y genera la contraseña
   - Copia la contraseña generada (16 caracteres sin espacios)

3. **Usar en .env:**
   ```env
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  # La contraseña de aplicación generada
   EMAIL_SERVICE=gmail
   ```

**Opción B: Usar OAuth2 (Más seguro, pero más complejo)**

Si prefieres usar OAuth2, necesitarás configurar credenciales de OAuth2 de Google.

**Opción C: Usar otro proveedor de email**

- **Outlook/Hotmail:**
  ```env
  EMAIL_SERVICE=hotmail
  EMAIL_USER=tu_email@outlook.com
  EMAIL_PASSWORD=tu_contraseña
  ```

- **Servidor SMTP personalizado:**
  ```env
  EMAIL_SERVICE=smtp
  EMAIL_HOST=smtp.tu-servidor.com
  EMAIL_PORT=587
  EMAIL_USER=tu_email@tu-dominio.com
  EMAIL_PASSWORD=tu_contraseña
  ```

#### Paso 2.3: Verificar que el archivo .env está siendo leído

1. **Asegúrate de que el backend tenga dotenv instalado:**
   - Ya está en `package.json` como dependencia
   - Si no, ejecuta: `npm install dotenv`

2. **Verifica que el servidor lee el .env:**
   - Al iniciar el backend, deberías ver en la consola:
     ```
     ✅ Servidor de email listo para enviar mensajes
     ```
   - Si ves:
     ```
     ⚠️ Email no configurado: EMAIL_USER y EMAIL_PASSWORD no están definidos
     ```
     Significa que el .env no está configurado correctamente.

#### Paso 2.4: Ejemplo de .env completo

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mi_contraseña_segura_123
DB_NAME=medinetdb
DB_PORT=3306

# JWT
JWT_SECRET=medinet_super_secret_key_2024_para_produccion_cambiar_esto
JWT_EXPIRES_IN=8h

# Email (Gmail con contraseña de aplicación)
EMAIL_SERVICE=gmail
EMAIL_USER=medinet.sistema@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
FRONTEND_URL=http://localhost:5173

# Servidor
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANTE:**
- El archivo `.env` NO debe subirse a Git
- Debe estar en `.gitignore`
- Contiene información sensible

---

## 🔄 Paso 3: Reiniciar Servidores

### ¿Por qué es necesario?

Después de hacer cambios en:
- ✅ Base de datos (nuevas tablas)
- ✅ Variables de entorno (.env)
- ✅ Nuevos archivos de código
- ✅ Nuevas rutas del backend

**Necesitas reiniciar los servidores para:**
- 🔄 Cargar las nuevas rutas del backend
- 🔄 Leer las nuevas variables de entorno
- 🔄 Reconocer las nuevas tablas de la base de datos
- 🔄 Aplicar los cambios en el código

**Sin reiniciar:**
- ❌ El backend no reconocerá las nuevas rutas (`/api/configuracion`, `/api/export`, etc.)
- ❌ No cargará las variables de email del .env
- ❌ Puede haber errores al intentar usar nuevas funcionalidades

### ¿Cómo hacerlo?

#### Paso 3.1: Reiniciar Backend

**Opción A: Si estás usando `npm run dev` (con nodemon)**

1. **Detener el servidor:**
   - En la terminal donde está corriendo el backend
   - Presiona `Ctrl + C`

2. **Reiniciar:**
   ```bash
   cd MediNet/backend
   npm run dev
   ```

**Opción B: Si estás usando `npm start`**

1. **Detener el servidor:**
   - Presiona `Ctrl + C`

2. **Reiniciar:**
   ```bash
   cd MediNet/backend
   npm start
   ```

**Opción C: Si el servidor está corriendo como servicio**

1. Detener el servicio
2. Iniciarlo nuevamente

#### Paso 3.2: Verificar que el Backend inició correctamente

Deberías ver en la consola algo como:

```
✅ Conexión a la base de datos exitosa
✅ Servidor de email listo para enviar mensajes
Servidor corriendo en el puerto: 3000
```

**Si ves errores:**
- Verifica que MySQL esté corriendo
- Verifica que el .env esté configurado correctamente
- Revisa los errores específicos en la consola

#### Paso 3.3: Reiniciar Frontend

**Opción A: Si estás usando `npm run dev` (Vite)**

1. **Detener el servidor:**
   - En la terminal donde está corriendo el frontend
   - Presiona `Ctrl + C`

2. **Reiniciar:**
   ```bash
   cd MediNet/frontend
   npm run dev
   ```

**Opción B: Si el frontend está corriendo en producción**

1. Detener el servidor
2. Reconstruir si es necesario:
   ```bash
   npm run build
   ```
3. Reiniciar el servidor

#### Paso 3.4: Verificar que el Frontend inició correctamente

Deberías ver algo como:

```
  VITE v7.1.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Si ves errores:**
- Verifica que todas las dependencias estén instaladas (`npm install`)
- Revisa los errores específicos en la consola

---

## 🧪 Paso 4: Probar Funcionalidades

### ¿Por qué es necesario?

Para asegurarte de que:
- ✅ Todo funciona correctamente
- ✅ No hay errores inesperados
- ✅ Las nuevas funcionalidades están accesibles
- ✅ La integración entre frontend y backend funciona

### ¿Cómo hacerlo?

#### Checklist de Pruebas

**1. Probar Recuperación de Contraseña:**
- [ ] Ir a `/recuperar-contrasena`
- [ ] Ingresar un email válido
- [ ] Verificar que llegue el email (revisar spam si no aparece)
- [ ] Hacer clic en el enlace del email
- [ ] Probar restablecer la contraseña

**2. Probar Foto de Perfil:**
- [ ] Iniciar sesión
- [ ] Ir a `/perfil` o `/administrador/perfil`
- [ ] Subir una foto
- [ ] Verificar que se guarde correctamente
- [ ] Verificar que se muestre en el dashboard

**3. Probar Gestión de Roles:**
- [ ] Iniciar sesión como administrador
- [ ] Ir a `/administrador/usuarios`
- [ ] Intentar cambiar el rol de un usuario
- [ ] Verificar que el cambio se aplique
- [ ] Probar activar/desactivar usuarios

**4. Probar Edición de Información Médica:**
- [ ] Iniciar sesión como médico
- [ ] Ir al dashboard del médico
- [ ] Hacer clic en el botón de editar información médica (icono de engranaje)
- [ ] Cambiar especialidad o consultorio
- [ ] Guardar y verificar

**5. Probar Búsqueda de Médicos:**
- [ ] Iniciar sesión como paciente
- [ ] Ir a `/paciente/buscar-medicos`
- [ ] Probar buscar por nombre
- [ ] Probar filtrar por especialidad
- [ ] Probar filtrar por fecha/hora

**6. Probar Notificaciones:**
- [ ] Crear una cita nueva
- [ ] Verificar que llegue el email de confirmación
- [ ] Verificar que aparezca notificación en el centro de notificaciones
- [ ] Marcar como leída

**7. Probar Estados de Cita:**
- [ ] Crear una cita
- [ ] Cambiar el estado a "Confirmada"
- [ ] Cambiar a "Completada"
- [ ] Verificar que los cambios se guarden

**8. Probar Exportación de Historial:**
- [ ] Como médico, ir al historial de un paciente
- [ ] Exportar el historial
- [ ] Verificar que se descargue el archivo HTML
- [ ] Abrir y verificar que tenga toda la información

**9. Probar Exportación de Reportes:**
- [ ] Como administrador o médico
- [ ] Ir a la sección de citas
- [ ] Exportar reporte (CSV o PDF)
- [ ] Verificar que se descargue correctamente

**10. Probar Configuración de Horarios:**
- [ ] Iniciar sesión como administrador
- [ ] Ir a `/administrador/configuracion`
- [ ] Cambiar horarios de atención
- [ ] Seleccionar días laborales
- [ ] Cambiar zona horaria
- [ ] Configurar recordatorios
- [ ] Guardar y verificar

**11. Verificar Logs de Actividad:**
- [ ] Realizar alguna acción (crear usuario, cambiar rol, etc.)
- [ ] Verificar que se registre en los logs
- [ ] Revisar que los logs contengan información correcta

---

## 📚 Paso 5: Actualizar Documentación

### ¿Por qué es necesario?

Para que:
- ✅ Los usuarios sepan cómo usar las nuevas funcionalidades
- ✅ Los desarrolladores entiendan los cambios
- ✅ El mantenimiento futuro sea más fácil
- ✅ Se documenten las nuevas APIs y endpoints

### ¿Cómo hacerlo?

#### Opción 1: Actualizar README Principal

Agregar secciones sobre:
- Nuevas funcionalidades
- Cómo configurar email
- Cómo usar las nuevas características
- Guía de migración

#### Opción 2: Crear Manual de Usuario

Documentar:
- Cómo recuperar contraseña
- Cómo subir foto de perfil
- Cómo gestionar usuarios (para admins)
- Cómo buscar médicos (para pacientes)
- Cómo exportar reportes
- Cómo configurar horarios

#### Opción 3: Documentar APIs

Crear documentación de:
- Nuevos endpoints
- Parámetros requeridos
- Respuestas esperadas
- Ejemplos de uso

---

## 🔍 Verificación Final

### Script de Verificación Rápida

Ejecuta estos comandos para verificar que todo está bien:

```bash
# 1. Verificar que MySQL tiene las tablas nuevas
mysql -u root -p medinetdb -e "SHOW TABLES LIKE 'password_reset_tokens';"
mysql -u root -p medinetdb -e "SHOW TABLES LIKE 'notificaciones';"
mysql -u root -p medinetdb -e "SHOW TABLES LIKE 'configuracion_sistema';"

# 2. Verificar que el backend responde
curl http://localhost:3000/api/configuracion/horarios

# 3. Verificar que el frontend está corriendo
# Abre en el navegador: http://localhost:5173
```

---

## ❓ Solución de Problemas Comunes

### Error: "Table doesn't exist"
**Solución:** Ejecuta el script SQL de migración

### Error: "Email not configured"
**Solución:** Configura EMAIL_USER y EMAIL_PASSWORD en .env

### Error: "Route not found" en nuevas rutas
**Solución:** Reinicia el servidor backend

### Error: "Cannot read property of undefined"
**Solución:** Verifica que las tablas existan en la base de datos

### Error: "Connection refused" en MySQL
**Solución:** Asegúrate de que MySQL esté corriendo

---

## ✅ Checklist Final

Antes de considerar que todo está listo:

- [ ] Script SQL ejecutado sin errores
- [ ] Archivo .env configurado con email
- [ ] Backend reiniciado y funcionando
- [ ] Frontend reiniciado y funcionando
- [ ] Al menos 3 funcionalidades probadas exitosamente
- [ ] No hay errores en la consola del backend
- [ ] No hay errores en la consola del frontend
- [ ] Los emails se envían correctamente (opcional pero recomendado)

---

**¡Listo! Con estos pasos, todas las funcionalidades estarán activas y funcionando.** 🎉

