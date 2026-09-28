const express = require('express');
const { body } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const {
  ROLES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES
} = require('../config/constants');

const router = express.Router();

// All ticket routes require authentication
router.use(authenticate);

// Validation rules for ticket creation
const createTicketValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Ticket title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Ticket description is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(TICKET_CATEGORIES))
    .withMessage('Invalid category specified'),
  body('priority')
    .optional()
    .isIn(Object.values(TICKET_PRIORITIES))
    .withMessage('Invalid priority specified')
];

// Validation rules for status update
const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(TICKET_STATUSES))
    .withMessage('Invalid status specified'),
  body('resolutionText')
    .if(body('status').equals(TICKET_STATUSES.RESOLVED))
    .trim()
    .notEmpty()
    .withMessage('Resolution explanation is mandatory when marking a ticket as Resolved')
];

// Validation for assignment
const assignValidation = [
  body('agentId')
    .notEmpty()
    .withMessage('Support agent ID is required')
    .isMongoId()
    .withMessage('Invalid agent ID format')
];

// Validation for priority update
const priorityValidation = [
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(Object.values(TICKET_PRIORITIES))
    .withMessage('Invalid priority specified')
];

// Validation for comments
const commentValidation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters')
];

// Ticket endpoints
router.post('/', createTicketValidation, validate, ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);

// Status transition (Admin or Support Agent)
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  updateStatusValidation,
  validate,
  ticketController.updateTicketStatus
);

// Ticket assignment (Admin only)
router.patch(
  '/:id/assign',
  authorize(ROLES.ADMIN),
  assignValidation,
  validate,
  ticketController.assignTicket
);

// Priority change (Admin or Support Agent)
router.patch(
  '/:id/priority',
  authorize(ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  priorityValidation,
  validate,
  ticketController.updateTicketPriority
);

// Delete ticket (Admin only)
router.delete('/:id', authorize(ROLES.ADMIN), ticketController.deleteTicket);

// Activity / Audit history
router.get('/:id/history', ticketController.getTicketHistory);

// Comments subroutes
router.post('/:id/comments', commentValidation, validate, commentController.addComment);
router.get('/:id/comments', commentController.getComments);

module.exports = router;
