const User = require('../models/User');
const { ROLES } = require('../config/constants');

/**
 * Service handling authentication and user management
 */
const registerUser = async ({ name, email, password, role = ROLES.EMPLOYEE, department }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    role,
    department: department || 'Engineering'
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Please provide email and password');
    error.statusCode = 400;
    throw error;
  }

  // Find user and explicitly select password
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return user;
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateProfile = async (userId, { name, department }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (name) user.name = name.trim();
  if (department) user.department = department.trim();

  await user.save();
  return user;
};

const getAllUsers = async ({ role, search, page = 1, limit = 50 } = {}) => {
  const query = {};
  if (role) {
    query.role = role;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

const updateUserById = async (userId, { role, isActive, department }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (role && Object.values(ROLES).includes(role)) {
    user.role = role;
  }
  if (typeof isActive === 'boolean') {
    user.isActive = isActive;
  }
  if (department) {
    user.department = department.trim();
  }

  await user.save();
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  updateUserById
};
