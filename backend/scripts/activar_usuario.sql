-- Script para activar un usuario por correo electrónico
-- Uso: Reemplaza 'buitragopaula769@gmail.com' con el correo del usuario que deseas activar

UPDATE usuarios 
SET usuario_estado = 1 
WHERE usuario_correo = 'buitragopaula769@gmail.com';

-- Verificar que se actualizó correctamente
SELECT usuario_id, usuario_nombre, usuario_apellido, usuario_correo, usuario_estado, rol_id
FROM usuarios 
WHERE usuario_correo = 'buitragopaula769@gmail.com';

