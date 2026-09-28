const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'serviceflow_enterprise_super_secret_jwt_key_2026_production_grade';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a signed JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
};

/**
 * Verify a JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Send standard token response with optional secure cookie
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt
    }
  });
};

module.exports = {
  generateToken,
  verifyToken,
  sendTokenResponse
};
