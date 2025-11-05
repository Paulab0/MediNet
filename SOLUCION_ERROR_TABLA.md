# 🔧 Solución: Error "Tabla desconocida 'configuracion_sistema'"

## ❌ El Problema

El error que estás viendo:
```
#1109 - Tabla desconocida 'configuracion_sistema' in information_schema
```

**Significa que:** La tabla `configuracion_sistema` (y probablemente otras tablas) **no existen** en tu base de datos.

**Causa:** El script de migración principal (`complete_requirements.sql`) **aún no se ha ejecutado**.

---

## ✅ Solución Paso a Paso

### Paso 1: Ejecutar el Script de Migración Principal

**IMPORTANTE:** Debes ejecutar primero el script de migración antes del script de verificación.

1. **Abre MySQL Workbench o phpMyAdmin**

2. **Conecta a tu base de datos `medinetdb`**

3. **Ejecuta el script de migración:**
   - Abre: `MediNet/backend/database/migrations/complete_requirements.sql`
   - O la versión sin comentarios: `complete_requirements_sin_comentarios.sql`
   - Ejecuta el script completo (botón ⚡)

4. **Espera a que termine sin errores**

5. **Verifica que se ejecutó correctamente:**
   - Deberías ver mensajes de éxito
   - No debería haber errores en rojo

### Paso 2: Ahora SÍ Ejecutar el Script de Verificación

**Después** de ejecutar el script de migración, ejecuta:
- `MediNet/SCRIPT_VERIFICACION.sql`

Ahora debería funcionar correctamente y mostrar todos los ✅.

---

## 🔍 Verificación Rápida Manual

Si quieres verificar rápidamente si las tablas existen, ejecuta esto en MySQL:

```sql
USE medinetdb;

-- Verificar si las tablas existen
SHOW TABLES LIKE 'password_reset_tokens';
SHOW TABLES LIKE 'notificaciones';
SHOW TABLES LIKE 'logs_actividad';
SHOW TABLES LIKE 'configuracion_sistema';
```

**Si alguna de estas consultas NO muestra resultados:**
- La tabla no existe
- Necesitas ejecutar `complete_requirements.sql`

**Si todas muestran resultados:**
- Las tablas existen
- El script de verificación debería funcionar

---

## 📋 Orden Correcto de Ejecución

### ❌ Orden INCORRECTO (lo que causó el error):
1. Ejecutar `SCRIPT_VERIFICACION.sql` primero
2. ❌ Error: las tablas no existen

### ✅ Orden CORRECTO:
1. **PRIMERO:** Ejecutar `complete_requirements.sql` (o `complete_requirements_sin_comentarios.sql`)
2. **DESPUÉS:** Ejecutar `SCRIPT_VERIFICACION.sql`
3. ✅ Todo funciona correctamente

---

## 🎯 Qué Hacer Ahora

### Opción 1: Ejecutar la Migración Completa (Recomendado)

1. Ve a MySQL Workbench
2. Abre: `MediNet/backend/database/migrations/complete_requirements.sql`
3. Ejecuta el script completo
4. Espera a que termine
5. Luego ejecuta el script de verificación

### Opción 2: Verificar Qué Tablas Faltan

Ejecuta esto para ver qué tablas NO existen:

```sql
USE medinetdb;

SELECT 'Tablas que DEBERÍAN existir:' AS Info;

SELECT 'password_reset_tokens' AS Tabla_Esperada, 
       CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ NO existe' END AS Estado
FROM information_schema.tables 
WHERE table_schema = 'medinetdb' AND table_name = 'password_reset_tokens'

UNION ALL

SELECT 'notificaciones', 
       CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ NO existe' END
FROM information_schema.tables 
WHERE table_schema = 'medinetdb' AND table_name = 'notificaciones'

UNION ALL

SELECT 'logs_actividad', 
       CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ NO existe' END
FROM information_schema.tables 
WHERE table_schema = 'medinetdb' AND table_name = 'logs_actividad'

UNION ALL

SELECT 'configuracion_sistema', 
       CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ NO existe' END
FROM information_schema.tables 
WHERE table_schema = 'medinetdb' AND table_name = 'configuracion_sistema';
```

---

## ✅ Después de Ejecutar la Migración

Una vez ejecutado `complete_requirements.sql` correctamente, deberías tener:

- ✅ Tabla `password_reset_tokens`
- ✅ Tabla `notificaciones`
- ✅ Tabla `logs_actividad`
- ✅ Tabla `configuracion_sistema`
- ✅ Columna `usuario_foto_perfil` en `usuarios`
- ✅ Columna `medico_consultorio` en `medicos`
- ✅ Estados de citas actualizados

**Entonces** el script de verificación funcionará sin errores.

---

## 🆘 Si Sigue Dando Error

Si después de ejecutar la migración el script de verificación sigue fallando:

1. **Verifica que estás en la base de datos correcta:**
   ```sql
   SELECT DATABASE();
   ```
   Debe mostrar: `medinetdb`

2. **Verifica que las tablas se crearon:**
   ```sql
   SHOW TABLES;
   ```
   Debe incluir las 4 tablas nuevas

3. **Si las tablas no aparecen:**
   - Revisa los errores al ejecutar `complete_requirements.sql`
   - Verifica permisos de usuario MySQL
   - Asegúrate de tener permisos para crear tablas

---

**Resumen:** El error es porque faltan las tablas. Ejecuta primero `complete_requirements.sql` y luego el script de verificación funcionará. ✅

