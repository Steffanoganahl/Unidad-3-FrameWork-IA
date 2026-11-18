
const jwt = require('jsonwebtoken');

/**
 * Middleware para validar la autenticidad del token JWT
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Comprobar que exista el secreto JWT
  if (!process.env.JWT_SECRET) {
    console.error('Error: JWT_SECRET no está configurado');

    return res.status(500).json({
      status: 'error',
      message: 'Error de configuración del servidor'
    });
  }

  // 2. Validar presencia de la cabecera Authorization
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Acceso no autorizado: no se proporcionó token de autenticación'
    });
  }

  // 3. Extraer el token del esquema Bearer
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({
      status: 'error',
      message: 'Formato de token inválido. Debe utilizar: Bearer <token>'
    });
  }

  const token = parts[1];

  // 4. Verificar firma, algoritmo y vigencia del token
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ['HS256'] },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 'error',
          message: 'Token inválido o expirado'
        });
      }
      if(
        !decoded ||
        typeof decoded.id !== 'string' ||
        typeof decoded.email !== 'string' ||
        !['USER', 'ADMIN'].includes(decoded.role)
      ) {
        return res.status(401).json({
          status: 'error',
          message: 'Token inválido: datos de usuario incompletos o incorrectos'
        });
      }
      // 5. Inyectar datos del usuario autenticado
      req.user = decoded;

      next();
    }
  );
};

module.exports = authenticateJWT;
