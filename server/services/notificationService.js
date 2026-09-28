const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../config/constants');

/**
 * Service to handle in-app user notifications
 */
const createNotification = async ({
  userId,
  message,
  type = NOTIFICATION_TYPES.SYSTEM,
  relatedTicketId = null,
  ticketCode = ''
}) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      type,
      relatedTicketId,
      ticketCode
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error);
    return null;
  }
};

/**
 * Fetch notifications for a user with pagination
 */
const getUserNotifications = async (userId, { unreadOnly = false, page = 1, limit = 20 } = {}) => {
  const query = { userId };
  if (unreadOnly) {
    query.read = false;
  }

  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedTicketId', 'ticketId title status priority'),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId, read: false })
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
  return notification;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, read: false },
    { read: true }
  );
  return result;
};

/**
 * Get quick unread count for badge
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ userId, read: false });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
