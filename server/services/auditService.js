const AuditLog = require('../models/AuditLog');

/**
 * Service to handle audit log creation and retrieval
 */
const createAuditLog = async ({
  ticketId,
  action,
  performedBy,
  oldValue = null,
  newValue = null,
  metadata = {}
}) => {
  try {
    const log = await AuditLog.create({
      ticketId,
      action,
      performedBy,
      oldValue,
      newValue,
      metadata
    });
    return log;
  } catch (error) {
    console.error('[AuditService] Failed to create audit log:', error);
    // Don't throw so main business transaction does not fail if audit logging encounters an issue
    return null;
  }
};

/**
 * Get audit logs for a specific ticket ordered chronologically
 */
const getTicketAuditLogs = async (ticketId) => {
  return await AuditLog.find({ ticketId })
    .populate('performedBy', 'name email role')
    .sort({ createdAt: 1 });
};

module.exports = {
  createAuditLog,
  getTicketAuditLogs
};
