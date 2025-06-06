const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Database errors
  if (err.code === '23505') { // Postgres unique violation
    return res.status(409).json({
      status: 'error',
      message: 'Resource already exists',
      detail: err.detail
    });
  }

  if (err.code === '23503') { // Postgres foreign key violation
    return res.status(409).json({
      status: 'error',
      message: 'Related resource not found',
      detail: err.detail
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    });
  }

  // Authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized access'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // Default server error
  const response = {
    status: 'error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.detail = err.detail || err.errors;
  }

  return res.status(500).json(response);
};

module.exports = { errorHandler }; 