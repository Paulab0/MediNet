USE medinetdb;

ALTER TABLE `usuarios` 
ADD COLUMN IF NOT EXISTS `usuario_foto_perfil` TEXT DEFAULT NULL AFTER `usuario_telefono`;

ALTER TABLE `citas` 
MODIFY COLUMN `cita_estado` ENUM('Programada', 'Confirmada', 'Completada', 'Cancelada', 'No asistió') DEFAULT 'Programada';

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `token_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `expira_en` DATETIME NOT NULL,
  `usado` BOOLEAN DEFAULT FALSE,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE CASCADE,
  INDEX `idx_token` (`token`),
  INDEX `idx_usuario_id` (`usuario_id`),
  INDEX `idx_expira_en` (`expira_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notificaciones` (
  `notificacion_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NULL,
  `rol_id` INT NULL,
  `notificacion_titulo` VARCHAR(255) NOT NULL,
  `notificacion_mensaje` TEXT NOT NULL,
  `notificacion_tipo` ENUM('Info', 'Alerta', 'Mantenimiento', 'Sistema', 'Cita', 'Recordatorio') DEFAULT 'Info',
  `notificacion_leida` BOOLEAN DEFAULT FALSE,
  `notificacion_fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `notificacion_estado` BOOLEAN DEFAULT 1,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE CASCADE,
  FOREIGN KEY (`rol_id`) REFERENCES `roles`(`rol_id`) ON DELETE CASCADE,
  INDEX `idx_usuario_id` (`usuario_id`),
  INDEX `idx_rol_id` (`rol_id`),
  INDEX `idx_leida` (`notificacion_leida`),
  INDEX `idx_fecha` (`notificacion_fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `logs_actividad` (
  `log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NULL,
  `log_tipo` ENUM('Login', 'Logout', 'Crear', 'Actualizar', 'Eliminar', 'Cambio_Rol', 'Cambio_Contrasena', 'Error') NOT NULL,
  `log_entidad` VARCHAR(50) NOT NULL,
  `log_descripcion` TEXT NOT NULL,
  `log_ip` VARCHAR(45),
  `log_user_agent` TEXT,
  `log_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE SET NULL,
  INDEX `idx_usuario_id` (`usuario_id`),
  INDEX `idx_tipo` (`log_tipo`),
  INDEX `idx_entidad` (`log_entidad`),
  INDEX `idx_fecha` (`log_fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `historial_archivos` (
  `archivo_id` INT AUTO_INCREMENT PRIMARY KEY,
  `historial_id` INT NOT NULL,
  `archivo_nombre` VARCHAR(255) NOT NULL,
  `archivo_ruta` VARCHAR(500) NOT NULL,
  `archivo_tipo` VARCHAR(50) NOT NULL,
  `archivo_tamano` INT NOT NULL,
  `archivo_subido_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`historial_id`) REFERENCES `historiales`(`historial_id`) ON DELETE CASCADE,
  INDEX `idx_historial_id` (`historial_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `configuracion_sistema` (
  `config_id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_clave` VARCHAR(100) UNIQUE NOT NULL,
  `config_valor` TEXT NOT NULL,
  `config_descripcion` VARCHAR(255),
  `config_tipo` ENUM('String', 'Number', 'Boolean', 'JSON', 'Time') DEFAULT 'String',
  `config_actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_clave` (`config_clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `configuracion_sistema` (`config_clave`, `config_valor`, `config_descripcion`, `config_tipo`) VALUES
('horario_atencion_inicio', '08:00', 'Hora de inicio de atención', 'Time'),
('horario_atencion_fin', '17:00', 'Hora de fin de atención', 'Time'),
('dias_laborales', '["Lunes","Martes","Miércoles","Jueves","Viernes"]', 'Días laborales de la semana', 'JSON'),
('zona_horaria', 'America/Bogota', 'Zona horaria del sistema', 'String'),
('recordatorio_24h_antes', 'true', 'Enviar recordatorio 24 horas antes de la cita', 'Boolean'),
('recordatorio_1h_antes', 'true', 'Enviar recordatorio 1 hora antes de la cita', 'Boolean')
ON DUPLICATE KEY UPDATE `config_valor` = VALUES(`config_valor`);

ALTER TABLE `medicos` 
ADD COLUMN IF NOT EXISTS `medico_consultorio` VARCHAR(255) DEFAULT NULL AFTER `especialidad_id`;

ALTER TABLE `recordatorios`
ADD COLUMN IF NOT EXISTS `cita_id` INT NULL AFTER `medico_id`,
ADD COLUMN IF NOT EXISTS `recordatorio_enviado` BOOLEAN DEFAULT FALSE AFTER `recordatorio_estado`,
ADD COLUMN IF NOT EXISTS `recordatorio_tipo` ENUM('24h_antes', '1h_antes', 'Personalizado') DEFAULT '24h_antes' AFTER `recordatorio_enviado`,
ADD FOREIGN KEY (`cita_id`) REFERENCES `citas`(`cita_id`) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_citas_estado_fecha ON citas(cita_estado, cita_fecha);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_estado ON usuarios(rol_id, usuario_estado);
CREATE INDEX IF NOT EXISTS idx_medicos_especialidad ON medicos(especialidad_id, medico_estado);

