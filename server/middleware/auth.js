const User = require('../models/User');
const { verifyToken } = require('../utils/token');
const { sendError } = require('../utils/response');

/**
 * Authentication Middleware: Verify JWT and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Check cookies
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(
        res,
        'Access denied. No authentication token provided.',
        401
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Authentication token has expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authentication token.', 401);
    }

    // Find user in database
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User associated with this token no longer exists.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact an administrator.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate };
