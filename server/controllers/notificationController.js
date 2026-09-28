const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/response');

/**
 * Get notifications for authenticated user
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, page, limit } = req.query;
    const result = await notificationService.getUserNotifications(req.user._id, {
      unreadOnly: unreadOnly === 'true',
      page,
      limit
    });

    return sendSuccess(res, result, 'Notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    return sendSuccess(res, { notification }, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    return sendSuccess(res, {}, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    return sendSuccess(res, { unreadCount: count }, 'Unread count retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
