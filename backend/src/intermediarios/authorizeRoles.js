const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar si el usuario tiene uno de los roles permitidos
    const userRoleId = user.rol_id || user.rol;
    const hasPermission = Array.isArray(allowedRoles) 
      ? allowedRoles.includes(userRoleId) 
      : allowedRoles === userRoleId;

    if (!hasPermission) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta ruta' });
    }
    next();
  };
};

export default authorizeRoles;
