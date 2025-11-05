# 🔍 Cómo Verificar que la Migración SQL se Ejecutó Correctamente

## 📋 Método 1: Usando MySQL Workbench (Más Fácil)

### Paso 1: Abrir MySQL Workbench
1. Abre MySQL Workbench en tu computadora
2. Conecta a tu servidor MySQL (normalmente `localhost`)

### Paso 2: Cargar el Script de Verificación
1. En MySQL Workbench, haz clic en **File** → **Open SQL Script**
2. Navega a: `MediNet/SCRIPT_VERIFICACION.sql`
3. Selecciona el archivo y ábrelo

### Paso 3: Ejecutar el Script
1. Asegúrate de estar conectado a la base de datos `medinetdb`
2. Haz clic en el botón **⚡ Execute** (o presiona `Ctrl+Shift+Enter`)
3. Espera a que se ejecute

### Paso 4: Revisar los Resultados
Verás una lista de verificaciones con resultados como:

```
✅ Tabla password_reset_tokens existe
✅ Tabla notificaciones existe
✅ Tabla logs_actividad existe
✅ Tabla configuracion_sistema existe
✅ Columna usuario_foto_perfil existe
✅ Columna medico_consultorio existe
✅ Estados de citas correctos
✅ Configuración existe (con los valores)
```

**Si ves ✅ en todas:** ¡Todo está correcto!

**Si ves ❌ en alguna:** Ejecuta nuevamente el script `complete_requirements.sql`

---

## 📋 Método 2: Usando phpMyAdmin

### Paso 1: Abrir phpMyAdmin
1. Abre tu navegador web
2. Ve a: `http://localhost/phpmyadmin` (o la URL de tu phpMyAdmin)
3. Selecciona la base de datos `medinetdb`

### Paso 2: Ejecutar el Script
1. Haz clic en la pestaña **"SQL"**
2. Abre el archivo `MediNet/SCRIPT_VERIFICACION.sql` en un editor de texto
3. Copia todo el contenido
4. Pégalo en el área de texto de phpMyAdmin
5. Haz clic en **"Continuar"** o **"Ejecutar"**

### Paso 3: Revisar los Resultados
Verás los mismos resultados que en el Método 1

---

## 📋 Método 3: Usando Línea de Comandos (Terminal/CMD)

### Paso 1: Abrir Terminal
- Presiona `Win + R`
- Escribe `cmd` y presiona Enter

### Paso 2: Navegar al Proyecto
```bash
cd C:\Users\Aprendiz\Documents\MediNet\MediNet
```

### Paso 3: Ejecutar el Script
```bash
mysql -u root -p medinetdb < SCRIPT_VERIFICACION.sql
```

**Nota:** Te pedirá la contraseña de MySQL

### Paso 4: Ver los Resultados
Verás los resultados directamente en la terminal

---

## 📋 Método 4: Verificación Manual (Rápida)

Si prefieres verificar manualmente, ejecuta estos comandos uno por uno:

### Verificar Tablas:
```sql
USE medinetdb;

SHOW TABLES LIKE 'password_reset_tokens';
SHOW TABLES LIKE 'notificaciones';
SHOW TABLES LIKE 'logs_actividad';
SHOW TABLES LIKE 'configuracion_sistema';
```

**Resultado esperado:** Cada comando debe mostrar 1 fila (la tabla existe)

### Verificar Columnas:
```sql
DESCRIBE usuarios;
-- Busca la columna 'usuario_foto_perfil'

DESCRIBE medicos;
-- Busca la columna 'medico_consultorio'
```

### Verificar Estados de Citas:
```sql
SHOW COLUMNS FROM citas LIKE 'cita_estado';
```

**Resultado esperado:** Debe mostrar el ENUM con los 5 estados

### Verificar Configuraciones:
```sql
SELECT * FROM configuracion_sistema;
```

**Resultado esperado:** Debe mostrar 6 filas con las configuraciones iniciales

---

## ✅ Interpretación de Resultados

### ✅ Todo Correcto
Si ves:
- ✅ En todas las tablas
- ✅ En todas las columnas
- ✅ Estados de citas correctos
- ✅ 6 configuraciones iniciales

**Entonces:** La migración se ejecutó correctamente ✅

### ❌ Hay Problemas
Si ves:
- ❌ En alguna tabla o columna
- ❌ Estados incompletos
- ❌ Menos de 6 configuraciones

**Entonces:**
1. Ejecuta nuevamente `complete_requirements.sql`
2. Verifica que no haya errores durante la ejecución
3. Ejecuta el script de verificación nuevamente

---

## 🆘 Solución de Problemas Comunes

### Error: "Table doesn't exist"
**Causa:** El script SQL no se ejecutó completamente
**Solución:** Ejecuta nuevamente `complete_requirements.sql`

### Error: "Column doesn't exist"
**Causa:** La columna no se agregó correctamente
**Solución:** Ejecuta manualmente la línea ALTER TABLE correspondiente

### Error: "Cannot connect to database"
**Causa:** MySQL no está corriendo o las credenciales son incorrectas
**Solución:** 
- Verifica que MySQL esté corriendo
- Verifica usuario y contraseña en `.env`

---

## 📝 Checklist Rápido

Después de ejecutar el script de verificación, deberías tener:

- [ ] ✅ Tabla `password_reset_tokens`
- [ ] ✅ Tabla `notificaciones`
- [ ] ✅ Tabla `logs_actividad`
- [ ] ✅ Tabla `configuracion_sistema`
- [ ] ✅ Columna `usuario_foto_perfil` en `usuarios`
- [ ] ✅ Columna `medico_consultorio` en `medicos`
- [ ] ✅ Estados de citas con 5 opciones
- [ ] ✅ 6 configuraciones iniciales en `configuracion_sistema`

**Si todas las casillas están marcadas:** ¡Todo está listo! 🎉

