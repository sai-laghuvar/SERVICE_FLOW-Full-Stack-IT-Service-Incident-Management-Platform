const { sendError } = require('../utils/response');

/**
 * Centralized Express Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose bad ObjectId CastError
  if (err.name === 'CastError') {
    message = `Resource not found with ID of '${err.value}'`;
    statusCode = 404;
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token expired';
    statusCode = 401;
  }

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

module.exports = errorHandler;
