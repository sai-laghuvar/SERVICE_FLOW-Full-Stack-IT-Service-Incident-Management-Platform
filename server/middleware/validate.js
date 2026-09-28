const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Middleware to check express-validator validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return sendError(
      res,
      formattedErrors[0]?.message || 'Input validation failed',
      400,
      formattedErrors
    );
  }
  next();
};

module.exports = { validate };
