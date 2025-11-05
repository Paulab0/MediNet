USE medinetdb;

SELECT 'Verificando tablas nuevas...' AS Status;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tabla password_reset_tokens existe'
        ELSE '❌ Tabla password_reset_tokens NO existe'
    END AS Estado
FROM information_schema.tables 
WHERE table_schema = 'medinetdb' AND table_name = 'password_reset_tokens';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tabla notificaciones existe'
        ELSE '❌ Tabla notificaciones NO existe'
    END AS Estado
FROM information_schema.tables 
WHERE table_schema = 'medinetdb' AND table_name = 'notificaciones';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tabla logs_actividad existe'
        ELSE '❌ Tabla logs_actividad NO existe'
    END AS Estado
FROM information_schema.tables 
WHERE table_schema = 'medinetdb' AND table_name = 'logs_actividad';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tabla configuracion_sistema existe'
        ELSE '❌ Tabla configuracion_sistema NO existe'
    END AS Estado
FROM information_schema.tables 
WHERE table_schema = 'medinetdb' AND table_name = 'configuracion_sistema';

SELECT 'Verificando columnas nuevas...' AS Status;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Columna usuario_foto_perfil existe'
        ELSE '❌ Columna usuario_foto_perfil NO existe'
    END AS Estado
FROM information_schema.columns 
WHERE table_schema = 'medinetdb' 
  AND table_name = 'usuarios' 
  AND column_name = 'usuario_foto_perfil';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Columna medico_consultorio existe'
        ELSE '❌ Columna medico_consultorio NO existe'
    END AS Estado
FROM information_schema.columns 
WHERE table_schema = 'medinetdb' 
  AND table_name = 'medicos' 
  AND column_name = 'medico_consultorio';

SELECT 'Verificando estados de citas...' AS Status;

SELECT 
    COLUMN_TYPE AS Estados_Disponibles,
    CASE 
        WHEN COLUMN_TYPE LIKE '%Programada%' 
         AND COLUMN_TYPE LIKE '%Confirmada%'
         AND COLUMN_TYPE LIKE '%Completada%'
         AND COLUMN_TYPE LIKE '%Cancelada%'
         AND COLUMN_TYPE LIKE '%No asistió%'
        THEN '✅ Estados de citas correctos'
        ELSE '❌ Estados de citas incompletos'
    END AS Estado
FROM information_schema.columns 
WHERE table_schema = 'medinetdb' 
  AND table_name = 'citas' 
  AND column_name = 'cita_estado';

SELECT 'Verificando configuraciones iniciales...' AS Status;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tabla configuracion_sistema existe'
        ELSE '❌ Tabla configuracion_sistema NO existe'
    END AS Estado_Tabla
FROM information_schema.tables 
WHERE table_schema = 'medinetdb' AND table_name = 'configuracion_sistema';

SELECT 
    CASE 
        WHEN COUNT(*) >= 6 THEN CONCAT('✅ ', COUNT(*), ' configuraciones iniciales encontradas')
        WHEN COUNT(*) > 0 THEN CONCAT('⚠️ Solo ', COUNT(*), ' configuraciones encontradas (deberían ser 6)')
        ELSE '❌ No hay configuraciones iniciales'
    END AS Estado_Configuraciones
FROM configuracion_sistema;

SELECT '===========================================' AS '';
SELECT 'VERIFICACIÓN COMPLETA' AS '';
SELECT '===========================================' AS '';
SELECT 'Si todas las verificaciones muestran ✅, todo está correcto.' AS '';
SELECT 'Si alguna muestra ❌, ejecuta complete_requirements.sql nuevamente.' AS '';
