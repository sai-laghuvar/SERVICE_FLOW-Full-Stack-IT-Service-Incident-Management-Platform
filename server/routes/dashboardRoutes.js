const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

const router = express.Router();

// All dashboard endpoints require authentication
router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/status', dashboardController.getStatusBreakdown);
router.get('/priority', dashboardController.getPriorityBreakdown);
router.get('/categories', dashboardController.getCategoryBreakdown);
router.get('/trends', dashboardController.getTrends);

// Recent activity feed is accessible by Admin and Support Agents
router.get(
  '/recent-activity',
  authorize(ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  dashboardController.getRecentActivity
);

module.exports = router;
