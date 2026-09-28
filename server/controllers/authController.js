const authService = require('../services/authService');
const { sendTokenResponse } = require('../utils/token');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;
    const user = await authService.registerUser({
      name,
      email,
      password,
      role,
      department
    });

    return sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser({ email, password });

    return sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user by clearing cookie
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return sendSuccess(res, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PATCH /api/auth/me
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, department } = req.body;
    const user = await authService.updateProfile(req.user._id, { name, department });
    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile
};
