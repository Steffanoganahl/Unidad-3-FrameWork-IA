
/**
 * Middleware para autorización basada en roles (RBAC)
 * @param {Array<string>} allowedRoles - Roles permitidos
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {

    // 1. Validar identidad del usuario
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: 'error',
        message: 'Acceso no autorizado: identidad de usuario no identificada'
      });
    }

    // 2. Validar que existan roles permitidos
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso prohibido: no existen roles autorizados'
      });
    }

    // 3. Aceptar únicamente roles conocidos
    const validRoles = ['USER', 'ADMIN'];

    if (!validRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso prohibido: rol de usuario no válido'
      });
    }

    // 4. Comprobar autorización
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Acceso prohibido: se requiere rol [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};

module.exports = authorize;
