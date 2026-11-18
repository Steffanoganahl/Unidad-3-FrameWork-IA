
/**
 * Middleware global de manejo de excepciones y errores en Express.
 * Evita exponer información técnica sensible al cliente.
 */
const errorHandler = (err, req, res, next) => {

  // 1. Evitar intentar responder si la respuesta ya fue enviada
  if (res.headersSent) {
    return next(err);
  }

  // 2. Validar el código de estado HTTP
  const requestedStatus = Number(err.statusCode || err.status || 500);

  const statusCode =
    Number.isInteger(requestedStatus) &&
    requestedStatus >= 400 &&
    requestedStatus <= 599
      ? requestedStatus
      : 500;

  // 3. Registro interno del error
  if (statusCode >= 500) {
    console.error('[Error del servidor]:', err.message);
    console.error(err.stack);
  }

  // 4. Respuesta segura al cliente
  return res.status(statusCode).json({
    status: 'error',
    message:
      statusCode >= 500
        ? 'Error interno del servidor. Por favor intente más tarde.'
        : err.message || 'Se produjo un error en la solicitud.'
  });
};

module.exports = errorHandler;
