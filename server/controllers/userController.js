const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

/**
 * Get all users with optional filtering (Admin or Agent)
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page, limit } = req.query;
    const result = await authService.getAllUsers({ role, search, page, limit });
    return sendSuccess(res, result, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.params.id);
    return sendSuccess(res, { user }, 'User details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user details (Admin only)
 * PATCH /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, department } = req.body;
    const user = await authService.updateUserById(req.params.id, {
      role,
      isActive,
      department
    });
    return sendSuccess(res, { user }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser
};
