-- Tabla para tokens de verificación de inicio de sesión
CREATE TABLE IF NOT EXISTS `login_verification_tokens` (
  `token_id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `login_ip` VARCHAR(45),
  `login_user_agent` TEXT,
  `login_fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `token_expiracion` DATETIME NOT NULL,
  `token_verificado` BOOLEAN DEFAULT 0,
  `token_fecha_verificacion` DATETIME NULL,
  `token_estado` BOOLEAN DEFAULT 1,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`usuario_id`) ON DELETE CASCADE,
  INDEX `idx_token` (`token`),
  INDEX `idx_usuario` (`usuario_id`),
  INDEX `idx_expiracion` (`token_expiracion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

