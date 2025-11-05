import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.headers['authorization']; // Espera formato: Bearer <token> o solo el token

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "medinet_secret_key");
    req.user = decoded; // Datos del token
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export default verifyToken;