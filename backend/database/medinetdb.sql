START TRANSACTION;
-- Base de datos: medinetdb

DROP DATABASE IF EXISTS `medinetdb`;
CREATE DATABASE `medinetdb`;
USE `medinetdb`;

DROP TABLE IF EXISTS `roles`, `usuarios`, `medicos`, `pacientes`, `disponibilidad`, `citas`, `historiales`, `recordatorios`, `notificaciones`;

-- Tabla roles
CREATE TABLE `roles` (
    `rol_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `rol_nombre` varchar(50) NOT NULL
);

-- Datos roles
INSERT INTO `roles` (`rol_id`,`rol_nombre`) VALUES 
(1,'Administrador'),
(2,'Medico'),
(3,'Paciente');

-- Tabla usuarios
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
  `usuario_contrasena` VARCHAR(255),
  `usuario_fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_estado` BOOLEAN DEFAULT 1,  
  `rol_id` INT,
  `identificacion_id` INT,
  `medico_id` INT
);

-- Datos usuarios
INSERT INTO usuarios (usuario_id, usuario_nombre, usuario_apellido, usuario_edad, usuario_genero, usuario_identificacion, usuario_direccion, usuario_ciudad, usuario_correo, usuario_telefono, usuario_contrasena, rol_id, identificacion_id) VALUES
(1, 'Paula', 'Buitrago', 18, 'Femenino', 10000000, 'Calle 1', 'Cali', 'p@gmail.com', '1234567891', 'admin', 1, 1),
(2, 'medico', 'medico', 34, 'medico',10000222, 'medico', 'medico', 'medico', 'medico', 'medico', 2, 2),
(3, 'paciente', 'paciente', 21, 'paciente', 21111112,'paciente', 'paciente', 'paciente', 'paciente', 'paciente', 3, 3);



CREATE TABLE `tipos_identificaciones` (
  `identificacion_id` INT AUTO_INCREMENT PRIMARY KEY,
  `identificacion_tipo` ENUM ('CC', 'CE','TI')
);

-- Datos identificaciones
INSERT INTO tipos_identificaciones (identificacion_id, identificacion_tipo) VALUES
(1,'CC'),
(2,'CE'),
(3,'TI');

-- Tabla Medicos
CREATE TABLE `medicos` (
  `medico_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT,
  `medico_estado` BOOLEAN DEFAULT 1,
  `especialidad_id` INT
);

-- Datos Medicos
INSERT INTO medicos (medico_id, usuario_id, medico_estado, especialidad_id) VALUES
(1, 2, 1, 1);

-- tabla especialidades
CREATE TABLE `especialidades` (
  `especialidad_id` INT AUTO_INCREMENT PRIMARY KEY,
  `especialidad_nombre` VARCHAR(100)
);

-- Datos especialidades
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

-- Tabla Pacientes
CREATE TABLE `pacientes` (
  `paciente_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT,
  `medico_id` INT,
  `paciente_estado` BOOLEAN DEFAULT 1
);

-- Datos Pacientes
INSERT INTO pacientes (paciente_id, usuario_id, medico_id, paciente_estado) VALUES
(1, 3, 1, 1);

-- Tabla Disponibilidad
CREATE TABLE `disponibilidad` (
  `disponibilidad_id` INT AUTO_INCREMENT PRIMARY KEY,
  `medico_id` INT,
  `disponibilidad_fecha` DATE,
  `disponibilidad_hora` TIME,
  `disponibilidad_estado` BOOLEAN DEFAULT 1
);

-- Datos Disponibilidad
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

-- Tabla Citas
CREATE TABLE `citas` (
  `cita_id` INT AUTO_INCREMENT PRIMARY KEY,
  `medico_id` INT,
  `paciente_id` INT,
  `cita_fecha` DATE,
  `cita_hora` TIME,
  `cita_tipo` VARCHAR(100),
  `cita_observaciones` TEXT,
  `cita_estado` ENUM ('Pendiente', 'Cancelada', 'Completada') DEFAULT 'Pendiente'
);

-- Datos citas
INSERT INTO citas (cita_id, medico_id, paciente_id, cita_fecha, cita_hora, cita_estado) VALUES
(1, 1, 1, '2023-08-01', '08:00:00', 1),
(2, 1, 1, '2023-08-01', '09:00:00', 1),
(3, 1, 1, '2023-08-01', '10:00:00', 1),
(4, 1, 1, '2023-08-01', '11:00:00', 1),
(5, 1, 1, '2023-08-01', '12:00:00', 1),
(6, 1, 1, '2023-08-01', '13:00:00', 1),
(7, 1, 1, '2023-08-01', '14:00:00', 1),
(8, 1, 1, '2023-08-01', '15:00:00', 1);

-- Tabla Historiales
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


-- Datos historiales
INSERT INTO historiales (historial_id, medico_id, paciente_id, historial_fecha, historial_estado) VALUES
(1, 1, 1, '2023-08-01', 1);

-- Tabla Recordatorios
CREATE TABLE `recordatorios` (
  `recordatorio_id` INT AUTO_INCREMENT PRIMARY KEY,
  `medico_id` INT,
  `recordatorio_fecha` DATE,
  `recordatorio_hora` TIME,
  `recordatorio_estado` BOOLEAN DEFAULT 1
);

-- Datos recordatorios
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

-- Llaves foraneas

-- Usuarios relacionados con roles e identificaciones
ALTER TABLE `usuarios` 
  ADD FOREIGN KEY (`rol_id`) REFERENCES `roles`(`rol_id`);

ALTER TABLE `usuarios` 
  ADD FOREIGN KEY (`identificacion_id`) REFERENCES `tipos_identificaciones`(`identificacion_id`);

-- Usuarios relacionados con médicos
ALTER TABLE `usuarios` 
  ADD FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

-- Médicos relacionados con usuarios y especialidades
ALTER TABLE `medicos` 
  ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`);

ALTER TABLE `medicos` 
  ADD FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades`(`especialidad_id`);

-- Pacientes relacionados con usuarios
ALTER TABLE `pacientes` 
  ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`);

-- Pacientes relacionados con médicos
ALTER TABLE `pacientes` 
  ADD FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

-- Disponibilidad relacionada con médicos
ALTER TABLE `disponibilidad` 
  ADD FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

-- Citas relacionadas con médicos y pacientes
ALTER TABLE `citas` 
  ADD FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

ALTER TABLE `citas` 
  ADD FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`paciente_id`);

-- Historiales relacionados con médicos y pacientes
ALTER TABLE `historiales` 
  ADD FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

ALTER TABLE `historiales` 
  ADD FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`paciente_id`);

-- Recordatorios relacionados con médicos
ALTER TABLE `recordatorios` 
  ADD FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`medico_id`);

COMMIT;
-- Fin de la transaccion