const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // BUG: exposes full stack trace to client in all environments
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
