const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../config/constants');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get users list (Admin or Support Agent for lookups)
router.get('/', authorize(ROLES.ADMIN, ROLES.SUPPORT_AGENT), userController.getUsers);

// Get specific user by ID (Admin only)
router.get('/:id', authorize(ROLES.ADMIN), userController.getUserById);

// Update user role, active status, or department (Admin only)
const updateUserValidation = [
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role specified'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('department')
    .optional()
    .trim()
];

router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  updateUserValidation,
  validate,
  userController.updateUser
);

module.exports = router;
