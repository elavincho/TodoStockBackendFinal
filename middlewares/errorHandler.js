// Middleware para manejar errores 404 (página no encontrada)
const notFound = (req, res, next) => {
  res.status(404).render('error', {
    titulo: 'Página no encontrada - TodoStock S.A.',
    errorCode: 404,
    errorMessage: 'Página no encontrada',
    errorDescription: 'Lo sentimos, la página que estás buscando no existe o ha sido movida.',
    backLink: '/dashboard'
  });
};

// Middleware para manejar errores generales
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const errorMessage = statusCode === 500 ? 'Error interno del servidor' : err.message;
  const errorDescription = statusCode === 500 
    ? 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente más tarde.' 
    : err.description || 'Ocurrió un problema al procesar tu solicitud.';

  res.status(statusCode).render('error', {
    titulo: `Error ${statusCode} - TodoStock S.A.`,
    errorCode: statusCode,
    errorMessage: errorMessage,
    errorDescription: errorDescription,
    backLink: req.session?.usuario ? '/dashboard' : '/login'
  });
};

module.exports = {
  notFound,
  errorHandler
};
