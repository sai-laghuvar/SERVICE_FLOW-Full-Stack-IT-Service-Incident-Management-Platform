const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { ROLES, AUDIT_ACTIONS, NOTIFICATION_TYPES } = require('../config/constants');
const { createAuditLog } = require('./auditService');
const { createNotification } = require('./notificationService');

/**
 * Add a comment to a ticket
 */
const addComment = async ({ ticketId, text, user }) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Access validation: Employee can only comment on own tickets
  if (user.role === ROLES.EMPLOYEE && ticket.createdBy.toString() !== user._id.toString()) {
    const error = new Error('You do not have permission to comment on this ticket');
    error.statusCode = 403;
    throw error;
  }

  if (!text || !text.trim()) {
    const error = new Error('Comment text cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  const comment = await Comment.create({
    ticketId: ticket._id,
    userId: user._id,
    text: text.trim()
  });

  // Create audit log
  await createAuditLog({
    ticketId: ticket._id,
    action: AUDIT_ACTIONS.COMMENT_ADDED,
    performedBy: user._id,
    metadata: {
      commentSnippet: text.trim().substring(0, 80)
    }
  });

  // Notifications logic
  const isCreator = ticket.createdBy.toString() === user._id.toString();

  if (isCreator) {
    // If ticket has assigned agent, notify agent
    if (ticket.assignedTo) {
      await createNotification({
        userId: ticket.assignedTo,
        message: `${user.name} commented on ticket ${ticket.ticketId}: "${text.trim().substring(0, 50)}..."`,
        type: NOTIFICATION_TYPES.NEW_COMMENT,
        relatedTicketId: ticket._id,
        ticketCode: ticket.ticketId
      });
    } else {
      // Notify admins if unassigned
      const admins = await User.find({ role: ROLES.ADMIN, isActive: true });
      for (const admin of admins) {
        await createNotification({
          userId: admin._id,
          message: `${user.name} commented on unassigned ticket ${ticket.ticketId}`,
          type: NOTIFICATION_TYPES.NEW_COMMENT,
          relatedTicketId: ticket._id,
          ticketCode: ticket.ticketId
        });
      }
    }
  } else {
    // Agent or admin commented: notify ticket creator
    await createNotification({
      userId: ticket.createdBy,
      message: `${user.name} (${user.role === ROLES.SUPPORT_AGENT ? 'Support Agent' : 'Admin'}) commented on your ticket ${ticket.ticketId}`,
      type: NOTIFICATION_TYPES.NEW_COMMENT,
      relatedTicketId: ticket._id,
      ticketCode: ticket.ticketId
    });
  }

  return await comment.populate('userId', 'name email role department');
};

/**
 * Get all comments for a ticket
 */
const getTicketComments = async (ticketId, user) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Employee access check
  if (user.role === ROLES.EMPLOYEE && ticket.createdBy.toString() !== user._id.toString()) {
    const error = new Error('You do not have permission to view comments on this ticket');
    error.statusCode = 403;
    throw error;
  }

  return await Comment.find({ ticketId })
    .populate('userId', 'name email role department')
    .sort({ createdAt: 1 });
};

module.exports = {
  addComment,
  getTicketComments
};
