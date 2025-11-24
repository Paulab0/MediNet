START TRANSACTION;
DROP DATABASE IF EXISTS `medinetdb`;

-- Crear base de datos
CREATE DATABASE `medinetdb`;

-- Usar la base de datos
USE `medinetdb`;

-- TABLA: roles
-- ============================================================================
CREATE TABLE `roles` (
    `rol_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `rol_nombre` varchar(50) NOT NULL
);

-- ============================================================================
-- TABLA: tipos_identificaciones
-- ============================================================================
CREATE TABLE `tipos_identificaciones` (
  `identificacion_id` INT AUTO_INCREMENT PRIMARY KEY,
  `identificacion_tipo` ENUM ('CC', 'CE','TI')
);

-- ============================================================================
-- TABLA: especialidades
-- ============================================================================
CREATE TABLE `especialidades` (
  `especialidad_id` INT AUTO_INCREMENT PRIMARY KEY,
  `especialidad_nombre` VARCHAR(100)
);

-- ============================================================================
-- TABLA: usuarios
-- ============================================================================
CREATE TABLE `usuarios` (
  `usuario_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_nombre` VARCHAR(100),
  `usuario_apellido` VARCHAR(100),
  `usuario_edad` INT,
  `usuario_genero` VARCHAR(10),
  `usuario_identificacion` INT UNIQUE NOT NULL,
  `usuario_direccion` VARCHAR(255),
  `usuario_ciudad` VARCHAR(100),
  `usuario_correo` VARCHAR(150) UNIQUE,
  `usuario_telefono` VARCHAR(10),
  `usuario_foto_perfil` TEXT DEFAULT NULL,
  `usuario_contrasena` VARCHAR(255),
  `usuario_fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_estado` BOOLEAN DEFAULT 1,  
  `rol_id` INT,
  `identificacion_id` INT,
  `medico_id` INT
);

-- ============================================================================
-- TABLA: medicos
-- ============================================================================
CREATE TABLE `medicos` (
  `medico_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT,
  `medico_estado` BOOLEAN DEFAULT 1,
  `especialidad_id` INT,
  `medico_consultorio` VARCHAR(255) DEFAULT NULL
);

-- ============================================================================
-- TABLA: pacientes
-- ============================================================================
CREATE TABLE `pacientes` (
  `paciente_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT,
  `medico_id` INT,
  `paciente_estado` BOOLEAN DEFAULT 1
);

-- ============================================================================
-- TABLA: disponibilidad
-- ============================================================================
CREATE TABLE `disponibilidad` (
  `disponibilidad_id` INT AUTO_INCREMENT PRIMARY KEY,
  `medico_id` INT,
  `disponibilidad_fecha` DATE,
  `disponibilidad_hora` TIME,
  `disponibilidad_estado` BOOLEAN DEFAULT 1
);

-- ============================================================================
-- TABLA: citas
-- ============================================================================
CREATE TABLE `citas` (
  `cita_id` INT AUTO_INCREMENT PRIMARY KEY,
  `medico_id` INT,
  `paciente_id` INT,
  `cita_fecha` DATE,
  `cita_hora` TIME,
  `cita_tipo` VARCHAR(100),
  `cita_observaciones` TEXT,
  `cita_estado` ENUM ('Programada', 'Confirmada', 'Completada', 'Cancelada', 'No asistió') DEFAULT 'Programada'
);

-- ============================================================================
-- TABLA: historiales
-- ============================================================================
CREATE TABLE `historiales` (
  `historial_id` INT AUTO_INCREMENT PRIMARY KEY,
  `medico_id` INT,
  `paciente_id` INT,
  `historial_fecha` DATE,
  `historial_estado` BOOLEAN DEFAULT 1,
  `historial_tipo` ENUM('Consulta', 'Seguimiento', 'Control', 'Emergencia', 'Otro') DEFAULT 'Consulta',
  `historial_diagnostico` TEXT,
  `historial_tratamiento` TEXT,
  `historial_observaciones` TEXT,
  `historial_medicamentos` TEXT,
  `historial_proxima_cita` DATE,
  `historial_estado_paciente` ENUM('Estable', 'Mejorando', 'Empeorando', 'Crítico') DEFAULT 'Estable',
  `historial_creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `historial_actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: historial_archivos
-- ============================================================================
CREATE TABLE `historial_archivos` (
  `archivo_id` INT AUTO_INCREMENT PRIMARY KEY,
  `historial_id` INT NOT NULL,
  `archivo_nombre` VARCHAR(255) NOT NULL,
  `archivo_ruta` VARCHAR(500) NOT NULL,
  `archivo_tipo` VARCHAR(50) NOT NULL,
  `archivo_tamano` INT NOT NULL,
  `archivo_subido_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLA: recordatorios
-- ============================================================================
CREATE TABLE `recordatorios` (
  `recordatorio_id` INT AUTO_INCREMENT PRIMARY KEY,
  `medico_id` INT,
  `cita_id` INT NULL,
  `recordatorio_fecha` DATE,
  `recordatorio_hora` TIME,
  `recordatorio_estado` BOOLEAN DEFAULT 1,
  `recordatorio_enviado` BOOLEAN DEFAULT FALSE,
  `recordatorio_tipo` ENUM('24h_antes', '1h_antes', 'Personalizado') DEFAULT '24h_antes'
);

-- ============================================================================
-- TABLA: password_reset_tokens
-- ============================================================================
CREATE TABLE `password_reset_tokens` (
  `token_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `expira_en` DATETIME NOT NULL,
  `usado` BOOLEAN DEFAULT FALSE,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLA: login_verification_tokens
-- ============================================================================
CREATE TABLE `login_verification_tokens` (
  `token_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `login_ip` VARCHAR(45),
  `login_user_agent` TEXT,
  `login_fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `token_expiracion` DATETIME NOT NULL,
  `token_verificado` BOOLEAN DEFAULT 0,
  `token_fecha_verificacion` DATETIME NULL,
  `token_estado` BOOLEAN DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLA: notificaciones
-- ============================================================================
CREATE TABLE `notificaciones` (
  `notificacion_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NULL,
  `rol_id` INT NULL,
  `notificacion_titulo` VARCHAR(255) NOT NULL,
  `notificacion_mensaje` TEXT NOT NULL,
  `notificacion_tipo` ENUM('Info', 'Alerta', 'Mantenimiento', 'Sistema', 'Cita', 'Recordatorio') DEFAULT 'Info',
  `notificacion_leida` BOOLEAN DEFAULT FALSE,
  `notificacion_fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `notificacion_estado` BOOLEAN DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLA: logs_actividad
-- ============================================================================
CREATE TABLE `logs_actividad` (
  `log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NULL,
  `log_tipo` ENUM('Login', 'Logout', 'Crear', 'Actualizar', 'Eliminar', 'Cambio_Rol', 'Cambio_Contrasena', 'Error') NOT NULL,
  `log_entidad` VARCHAR(50) NOT NULL,
  `log_descripcion` TEXT NOT NULL,
  `log_ip` VARCHAR(45),
  `log_user_agent` TEXT,
  `log_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLA: configuracion_sistema
-- ============================================================================
CREATE TABLE `configuracion_sistema` (
  `config_id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_clave` VARCHAR(100) UNIQUE NOT NULL,
  `config_valor` TEXT NOT NULL,
  `config_descripcion` VARCHAR(255),
  `config_tipo` ENUM('String', 'Number', 'Boolean', 'JSON', 'Time') DEFAULT 'String',
  `config_actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- PARTE 3: INSERCIÓN DE DATOS INICIALES
-- ============================================================================

-- Datos iniciales de roles
INSERT INTO `roles` (`rol_id`,`rol_nombre`) VALUES 
(1,'Administrador'),
(2,'Medico'),
(3,'Paciente');

-- Datos iniciales de tipos de identificación
INSERT INTO tipos_identificaciones (identificacion_id, identificacion_tipo) VALUES
(1,'CC'),
(2,'CE'),
(3,'TI');

-- Datos iniciales de especialidades
INSERT INTO especialidades (especialidad_id, especialidad_nombre) VALUES
(1, 'Alergología'),
(2, 'Anestesiología'),
(3, 'Cardiología'),
(4, 'Cirugía General'),
(5, 'Cirugía Plástica'),
(6, 'Dermatología'),
(7, 'Endocrinología'),
(8, 'Gastroenterología'),
(9, 'Geriatría'),
(10, 'Ginecología y Obstetricia'),
(11, 'Hematología'),
(12, 'Infectología'),
(13, 'Medicina del Deporte'),
(14, 'Medicina Familiar'),
(15, 'Medicina General'),
(16, 'Medicina Interna'),
(17, 'Nefrología'),
(18, 'Neumología'),
(19, 'Neurología'),
(20, 'Nutriología'),
(21, 'Oftalmología'),
(22, 'Oncología'),
(23, 'Otorrinolaringología'),
(24, 'Pediatría'),
(25, 'Psiquiatría'),
(26, 'Radiología'),
(27, 'Rehabilitación y Medicina Física'),
(28, 'Reumatología'),
(29, 'Traumatología y Ortopedia'),
(30, 'Urología');

-- Datos iniciales de usuarios
INSERT INTO usuarios (usuario_id, usuario_nombre, usuario_apellido, usuario_edad, usuario_genero, usuario_identificacion, usuario_direccion, usuario_ciudad, usuario_correo, usuario_telefono, usuario_contrasena, rol_id, identificacion_id) VALUES
(1, 'Paula', 'Buitrago', 18, 'Femenino', 10000000, 'Calle 1', 'Cali', 'p@gmail.com', '1234567891', 'admin', 1, 1),
(2, 'medico', 'medico', 34, 'medico',10000222, 'medico', 'medico', 'medico', 'medico', 'medico', 2, 2),
(3, 'paciente', 'paciente', 21, 'paciente', 21111112,'paciente', 'paciente', 'paciente', 'paciente', 'paciente', 3, 3);

-- Datos iniciales de medicos
INSERT INTO medicos (medico_id, usuario_id, medico_estado, especialidad_id) VALUES
(1, 2, 1, 1);

-- Datos iniciales de pacientes
INSERT INTO pacientes (paciente_id, usuario_id, medico_id, paciente_estado) VALUES
(1, 3, 1, 1);

-- Datos iniciales de disponibilidad
INSERT INTO disponibilidad (disponibilidad_id, medico_id, disponibilidad_fecha, disponibilidad_hora, disponibilidad_estado) VALUES
(1, 1, '2023-08-01', '08:00:00', 1),
(2, 1, '2023-08-01', '09:00:00', 1),
(3, 1, '2023-08-01', '10:00:00', 1),
(4, 1, '2023-08-01', '11:00:00', 1),
(5, 1, '2023-08-01', '12:00:00', 1),
(6, 1, '2023-08-01', '13:00:00', 1),
(7, 1, '2023-08-01', '14:00:00', 1),
(8, 1, '2023-08-01', '15:00:00', 1),
(9, 1, '2023-08-01', '16:00:00', 1),
(10, 1, '2023-08-01', '17:00:00', 1);

-- Datos iniciales de citas
INSERT INTO citas (cita_id, medico_id, paciente_id, cita_fecha, cita_hora, cita_estado) VALUES
(1, 1, 1, '2023-08-01', '08:00:00', 'Programada'),
(2, 1, 1, '2023-08-01', '09:00:00', 'Programada'),
(3, 1, 1, '2023-08-01', '10:00:00', 'Programada'),
(4, 1, 1, '2023-08-01', '11:00:00', 'Programada'),
(5, 1, 1, '2023-08-01', '12:00:00', 'Programada'),
(6, 1, 1, '2023-08-01', '13:00:00', 'Programada'),
(7, 1, 1, '2023-08-01', '14:00:00', 'Programada'),
(8, 1, 1, '2023-08-01', '15:00:00', 'Programada');

-- Datos iniciales de historiales
INSERT INTO historiales (historial_id, medico_id, paciente_id, historial_fecha, historial_estado) VALUES
(1, 1, 1, '2023-08-01', 1);

-- Datos iniciales de recordatorios
INSERT INTO recordatorios (recordatorio_id, medico_id, recordatorio_fecha, recordatorio_hora, recordatorio_estado) VALUES
(1, 1, '2023-08-01', '08:00:00', 1),
(2, 1, '2023-08-01', '09:00:00', 1),
(3, 1, '2023-08-01', '10:00:00', 1),
(4, 1, '2023-08-01', '11:00:00', 1),
(5, 1, '2023-08-01', '12:00:00', 1),
(6, 1, '2023-08-01', '13:00:00', 1),
(7, 1, '2023-08-01', '14:00:00', 1),
(8, 1, '2023-08-01', '15:00:00', 1),
(9, 1, '2023-08-01', '16:00:00', 1);

-- Datos iniciales de configuración del sistema
INSERT INTO `configuracion_sistema` (`config_clave`, `config_valor`, `config_descripcion`, `config_tipo`) VALUES
('horario_atencion_inicio', '08:00', 'Hora de inicio de atención', 'Time'),
('horario_atencion_fin', '17:00', 'Hora de fin de atención', 'Time'),
('dias_laborales', '["Lunes","Martes","Miércoles","Jueves","Viernes"]', 'Días laborales de la semana', 'JSON'),
('zona_horaria', 'America/Bogota', 'Zona horaria del sistema', 'String'),
('recordatorio_24h_antes', 'true', 'Enviar recordatorio 24 horas antes de la cita', 'Boolean'),
('recordatorio_1h_antes', 'true', 'Enviar recordatorio 1 hora antes de la cita', 'Boolean')
ON DUPLICATE KEY UPDATE `config_valor` = VALUES(`config_valor`);

-- ============================================================================
-- PARTE 4: AGREGAR FOREIGN KEYS
-- ============================================================================

-- Foreign keys de usuarios
ALTER TABLE `usuarios` 
  ADD CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`rol_id`);

ALTER TABLE `usuarios` 
  ADD CONSTRAINT `fk_usuarios_identificacion` FOREIGN KEY (`identificacion_id`) REFERENCES `tipos_identificaciones`(`identificacion_id`);

ALTER TABLE `usuarios` 
  ADD CONSTRAINT `fk_usuarios_medico` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`) ON DELETE SET NULL;

-- Foreign keys de medicos
ALTER TABLE `medicos` 
  ADD CONSTRAINT `fk_medicos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`);

ALTER TABLE `medicos` 
  ADD CONSTRAINT `fk_medicos_especialidad` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades`(`especialidad_id`);

-- Foreign keys de pacientes
ALTER TABLE `pacientes` 
  ADD CONSTRAINT `fk_pacientes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`);

ALTER TABLE `pacientes` 
  ADD CONSTRAINT `fk_pacientes_medico` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

-- Foreign keys de disponibilidad
ALTER TABLE `disponibilidad` 
  ADD CONSTRAINT `fk_disponibilidad_medico` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

-- Foreign keys de citas
ALTER TABLE `citas` 
  ADD CONSTRAINT `fk_citas_medico` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

ALTER TABLE `citas` 
  ADD CONSTRAINT `fk_citas_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`paciente_id`);

-- Foreign keys de historiales
ALTER TABLE `historiales` 
  ADD CONSTRAINT `fk_historiales_medico` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

ALTER TABLE `historiales` 
  ADD CONSTRAINT `fk_historiales_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`paciente_id`);

-- Foreign keys de historial_archivos
ALTER TABLE `historial_archivos` 
  ADD CONSTRAINT `fk_historial_archivos_historial` FOREIGN KEY (`historial_id`) REFERENCES `historiales`(`historial_id`) ON DELETE CASCADE;

-- Foreign keys de recordatorios
ALTER TABLE `recordatorios` 
  ADD CONSTRAINT `fk_recordatorios_medico` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

ALTER TABLE `recordatorios` 
  ADD CONSTRAINT `fk_recordatorios_cita` FOREIGN KEY (`cita_id`) REFERENCES `citas`(`cita_id`) ON DELETE CASCADE;

-- Foreign keys de password_reset_tokens
ALTER TABLE `password_reset_tokens` 
  ADD CONSTRAINT `fk_password_reset_tokens_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE CASCADE;

-- Foreign keys de login_verification_tokens
ALTER TABLE `login_verification_tokens` 
  ADD CONSTRAINT `fk_login_verification_tokens_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE CASCADE;

-- Foreign keys de notificaciones
ALTER TABLE `notificaciones` 
  ADD CONSTRAINT `fk_notificaciones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE CASCADE;

ALTER TABLE `notificaciones` 
  ADD CONSTRAINT `fk_notificaciones_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`rol_id`) ON DELETE CASCADE;

-- Foreign keys de logs_actividad
ALTER TABLE `logs_actividad` 
  ADD CONSTRAINT `fk_logs_actividad_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE SET NULL;

-- ============================================================================
-- PARTE 5: CREAR ÍNDICES ADICIONALES
-- ============================================================================
-- Nota: Los índices en columnas con foreign keys se crean automáticamente,
-- así que solo creamos índices adicionales para optimización

-- Índices para password_reset_tokens (token y expira_en no tienen FK)
CREATE INDEX `idx_password_reset_token` ON `password_reset_tokens`(`token`);
CREATE INDEX `idx_password_reset_expira` ON `password_reset_tokens`(`expira_en`);

-- Índices para login_verification_tokens (token y expiración no tienen FK)
CREATE INDEX `idx_login_verification_token` ON `login_verification_tokens`(`token`);
CREATE INDEX `idx_login_verification_expiracion` ON `login_verification_tokens`(`token_expiracion`);

-- Índices para notificaciones (campos adicionales sin FK)
CREATE INDEX `idx_notificaciones_leida` ON `notificaciones`(`notificacion_leida`);
CREATE INDEX `idx_notificaciones_fecha` ON `notificaciones`(`notificacion_fecha`);

-- Índices para logs_actividad (campos adicionales sin FK)
CREATE INDEX `idx_logs_tipo` ON `logs_actividad`(`log_tipo`);
CREATE INDEX `idx_logs_entidad` ON `logs_actividad`(`log_entidad`);
CREATE INDEX `idx_logs_fecha` ON `logs_actividad`(`log_fecha`);

-- Índices para configuracion_sistema
CREATE INDEX `idx_configuracion_clave` ON `configuracion_sistema`(`config_clave`);

-- Índices compuestos adicionales para optimización
CREATE INDEX `idx_citas_estado_fecha` ON `citas`(`cita_estado`, `cita_fecha`);
CREATE INDEX `idx_usuarios_rol_estado` ON `usuarios`(`rol_id`, `usuario_estado`);
CREATE INDEX `idx_medicos_especialidad` ON `medicos`(`especialidad_id`, `medico_estado`);

COMMIT;

-- ============================================================================
-- PARTE 6: SCRIPTS DE UTILIDAD
-- ============================================================================

-- ============================================================================
-- SCRIPT DE UTILIDAD: Activar usuario por correo electrónico
-- ============================================================================
-- Uso: Reemplaza 'correo@ejemplo.com' con el correo del usuario que deseas activar
-- 
-- UPDATE usuarios 
-- SET usuario_estado = 1 
-- WHERE usuario_correo = 'correo@ejemplo.com';
--
-- Verificar que se actualizó correctamente:
-- SELECT usuario_id, usuario_nombre, usuario_apellido, usuario_correo, usuario_estado, rol_id
-- FROM usuarios 
-- WHERE usuario_correo = 'correo@ejemplo.com';
-- ============================================================================

-- ============================================================================
-- FIN DEL SCRIPT COMPLETO
-- ============================================================================
