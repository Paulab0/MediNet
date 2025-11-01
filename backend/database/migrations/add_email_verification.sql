-- Migración: Añadir verificación de email

-- Añadir columna de verificación de email a la tabla usuarios
ALTER TABLE `usuarios` 
ADD COLUMN `usuario_email_verificado` BOOLEAN DEFAULT FALSE AFTER `usuario_estado`;

-- Crear tabla de tokens de verificación
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `token_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `tipo` ENUM('verificacion', 'reset_password') DEFAULT 'verificacion',
  `expira_en` DATETIME NOT NULL,
  `usado` BOOLEAN DEFAULT FALSE,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE CASCADE,
  INDEX `idx_token` (`token`),
  INDEX `idx_usuario_id` (`usuario_id`),
  INDEX `idx_expira_en` (`expira_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_usuario_email_verificado ON usuarios(usuario_email_verificado);
CREATE INDEX idx_usuario_email ON usuarios(usuario_correo);

-- Activar verificación para usuarios existentes (opcional)
-- UPDATE usuarios SET usuario_email_verificado = TRUE WHERE usuario_estado = 1;

