const { sendError } = require('../utils/response');

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles Allowed roles for the endpoint
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${roles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

module.exports = { authorize };
