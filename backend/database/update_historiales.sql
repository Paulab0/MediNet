-- Script para actualizar la tabla historiales con más campos
-- Ejecutar este script para expandir la funcionalidad del historial

-- Agregar nuevos campos a la tabla historiales
ALTER TABLE `historiales` 
ADD COLUMN `historial_tipo` ENUM('Consulta', 'Seguimiento', 'Control', 'Emergencia', 'Otro') DEFAULT 'Consulta',
ADD COLUMN `historial_diagnostico` TEXT,
ADD COLUMN `historial_tratamiento` TEXT,
ADD COLUMN `historial_observaciones` TEXT,
ADD COLUMN `historial_medicamentos` TEXT,
ADD COLUMN `historial_proxima_cita` DATE,
ADD COLUMN `historial_estado_paciente` ENUM('Estable', 'Mejorando', 'Empeorando', 'Crítico') DEFAULT 'Estable',
ADD COLUMN `historial_creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `historial_actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Crear índice para mejorar consultas
CREATE INDEX idx_historial_medico_paciente ON historiales(medico_id, paciente_id);
CREATE INDEX idx_historial_fecha ON historiales(historial_fecha);
