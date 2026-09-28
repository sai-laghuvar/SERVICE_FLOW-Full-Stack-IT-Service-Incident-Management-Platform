const Ticket = require('../models/Ticket');
const Counter = require('../models/Counter');
const User = require('../models/User');
const {
  ROLES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  SLA_HOURS,
  AUDIT_ACTIONS,
  NOTIFICATION_TYPES,
  VALID_STATUS_TRANSITIONS
} = require('../config/constants');
const { createAuditLog } = require('./auditService');
const { createNotification } = require('./notificationService');

/**
 * Generate human-readable sequential ticket ID like INC-000001
 */
const generateTicketId = async () => {
  const seq = await Counter.getNextSequence('ticketId');
  return `INC-${String(seq).padStart(6, '0')}`;
};

/**
 * Calculate SLA deadline from now based on priority
 */
const calculateSLADeadline = (priority) => {
  const hours = SLA_HOURS[priority] || SLA_HOURS.Medium;
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};

/**
 * Create a new ticket
 */
const createTicket = async ({ title, description, category, priority = TICKET_PRIORITIES.MEDIUM, user }) => {
  const ticketId = await generateTicketId();
  const slaDeadline = calculateSLADeadline(priority);

  const ticket = await Ticket.create({
    ticketId,
    title,
    description,
    category,
    priority,
    status: TICKET_STATUSES.OPEN,
    createdBy: user._id,
    slaDeadline
  });

  // Create audit log
  await createAuditLog({
    ticketId: ticket._id,
    action: AUDIT_ACTIONS.TICKET_CREATED,
    performedBy: user._id,
    newValue: {
      ticketId: ticket.ticketId,
      title: ticket.title,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status
    }
  });

  // Notify admins of new ticket
  const admins = await User.find({ role: ROLES.ADMIN, isActive: true });
  for (const admin of admins) {
    await createNotification({
      userId: admin._id,
      message: `New ticket ${ticket.ticketId} created by ${user.name}: "${ticket.title}"`,
      type: NOTIFICATION_TYPES.SYSTEM,
      relatedTicketId: ticket._id,
      ticketCode: ticket.ticketId
    });
  }

  return await ticket.populate([
    { path: 'createdBy', select: 'name email role department' },
    { path: 'assignedTo', select: 'name email role department' }
  ]);
};

/**
 * Get tickets with search, filtering, and role-based scoping
 */
const getTickets = async ({ user, query = {} }) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    priority,
    category,
    assignedTo,
    createdBy,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;

  const filter = {};

  // Role-based scoping: Employees can ONLY view tickets they created
  if (user.role === ROLES.EMPLOYEE) {
    filter.createdBy = user._id;
  } else if (user.role === ROLES.SUPPORT_AGENT) {
    // Agents can see all tickets or filter specifically by their assigned tickets
    if (assignedTo === 'me') {
      filter.assignedTo = user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
  } else if (user.role === ROLES.ADMIN) {
    if (assignedTo === 'unassigned') {
      filter.assignedTo = null;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
  }

  // Common filters
  if (status) {
    filter.status = status;
  }
  if (priority) {
    filter.priority = priority;
  }
  if (category) {
    filter.category = category;
  }
  if (createdBy && user.role !== ROLES.EMPLOYEE) {
    filter.createdBy = createdBy;
  }

  // Search filter (Ticket ID or Title)
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [{ ticketId: searchRegex }, { title: searchRegex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions = { [sortBy]: sortDirection };

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .populate('resolution.resolvedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    Ticket.countDocuments(filter)
  ]);

  // Dynamically update isBreached check
  const processedTickets = tickets.map((t) => {
    const doc = t.toObject();
    doc.isBreached = t.checkSLABreach();
    return doc;
  });

  return {
    tickets: processedTickets,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasNextPage: pageNum * limitNum < total,
      hasPrevPage: pageNum > 1
    }
  };
};

/**
 * Get single ticket by ID (MongoDB _id or ticketId like INC-000001)
 */
const getTicketById = async (idOrCode, user) => {
  const isMongoId = idOrCode.match(/^[0-9a-fA-F]{24}$/);
  const query = isMongoId ? { _id: idOrCode } : { ticketId: idOrCode.toUpperCase() };

  const ticket = await Ticket.findOne(query)
    .populate('createdBy', 'name email role department')
    .populate('assignedTo', 'name email role department')
    .populate('resolution.resolvedBy', 'name email role');

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Check employee access
  if (user.role === ROLES.EMPLOYEE && ticket.createdBy._id.toString() !== user._id.toString()) {
    const error = new Error('Access denied: You do not have permission to view this ticket');
    error.statusCode = 403;
    throw error;
  }

  const result = ticket.toObject();
  result.isBreached = ticket.checkSLABreach();
  return result;
};

/**
 * Update ticket status with state transition validation
 */
const updateTicketStatus = async (ticketId, { status: newStatus, resolutionText }, user) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Employee cannot directly update status (except possibly re-opening or closing when permitted)
  if (user.role === ROLES.EMPLOYEE) {
    const error = new Error('Employees are not authorized to directly change ticket status');
    error.statusCode = 403;
    throw error;
  }

  const currentStatus = ticket.status;

  if (currentStatus === newStatus) {
    return ticket;
  }

  // Validate state transitions
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  const isAllowed = allowedTransitions.includes(newStatus);

  if (!isAllowed) {
    const error = new Error(
      `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowedTransitions.join(', ')}]`
    );
    error.statusCode = 400;
    throw error;
  }

  // Only Admin can re-open a Closed ticket
  if (currentStatus === TICKET_STATUSES.CLOSED && user.role !== ROLES.ADMIN) {
    const error = new Error('Only administrators can reopen a closed ticket');
    error.statusCode = 403;
    throw error;
  }

  // When marking as Resolved, resolution details are mandatory
  if (newStatus === TICKET_STATUSES.RESOLVED) {
    if (!resolutionText || !resolutionText.trim()) {
      const error = new Error('Resolution text is mandatory when resolving a ticket');
      error.statusCode = 400;
      throw error;
    }

    ticket.resolution = {
      text: resolutionText.trim(),
      resolvedAt: new Date(),
      resolvedBy: user._id
    };
  }

  ticket.status = newStatus;
  await ticket.save();

  // Audit Log
  let actionName = AUDIT_ACTIONS.STATUS_CHANGED;
  if (newStatus === TICKET_STATUSES.RESOLVED) actionName = AUDIT_ACTIONS.TICKET_RESOLVED;
  if (newStatus === TICKET_STATUSES.CLOSED) actionName = AUDIT_ACTIONS.TICKET_CLOSED;
  if (currentStatus === TICKET_STATUSES.CLOSED || currentStatus === TICKET_STATUSES.RESOLVED) {
    if (newStatus === TICKET_STATUSES.IN_PROGRESS) actionName = AUDIT_ACTIONS.TICKET_REOPENED;
  }

  await createAuditLog({
    ticketId: ticket._id,
    action: actionName,
    performedBy: user._id,
    oldValue: currentStatus,
    newValue: newStatus,
    metadata: newStatus === TICKET_STATUSES.RESOLVED ? { resolution: resolutionText } : {}
  });

  // Notify ticket creator (Employee)
  if (ticket.createdBy.toString() !== user._id.toString()) {
    await createNotification({
      userId: ticket.createdBy,
      message: `Status of ticket ${ticket.ticketId} updated to '${newStatus}' by ${user.name}`,
      type: NOTIFICATION_TYPES.STATUS_CHANGE,
      relatedTicketId: ticket._id,
      ticketCode: ticket.ticketId
    });
  }

  // If assigned to agent and agent didn't perform the update, notify agent
  if (ticket.assignedTo && ticket.assignedTo.toString() !== user._id.toString()) {
    await createNotification({
      userId: ticket.assignedTo,
      message: `Ticket ${ticket.ticketId} status changed to '${newStatus}' by ${user.name}`,
      type: NOTIFICATION_TYPES.STATUS_CHANGE,
      relatedTicketId: ticket._id,
      ticketCode: ticket.ticketId
    });
  }

  return await ticket.populate([
    { path: 'createdBy', select: 'name email role department' },
    { path: 'assignedTo', select: 'name email role department' },
    { path: 'resolution.resolvedBy', select: 'name email role' }
  ]);
};

/**
 * Assign ticket to a support agent (Admin only)
 */
const assignTicket = async (ticketId, agentId, user) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Target agent must exist and have SUPPORT_AGENT role
  const targetAgent = await User.findById(agentId);
  if (!targetAgent) {
    const error = new Error('Support agent not found');
    error.statusCode = 404;
    throw error;
  }

  if (targetAgent.role !== ROLES.SUPPORT_AGENT && targetAgent.role !== ROLES.ADMIN) {
    const error = new Error('Ticket can only be assigned to a Support Agent or Admin');
    error.statusCode = 400;
    throw error;
  }

  if (!targetAgent.isActive) {
    const error = new Error('Cannot assign ticket to an inactive agent');
    error.statusCode = 400;
    throw error;
  }

  const previousAgentId = ticket.assignedTo;
  const isReassignment = !!previousAgentId;

  ticket.assignedTo = targetAgent._id;
  await ticket.save();

  // Audit log
  await createAuditLog({
    ticketId: ticket._id,
    action: isReassignment ? AUDIT_ACTIONS.TICKET_REASSIGNED : AUDIT_ACTIONS.TICKET_ASSIGNED,
    performedBy: user._id,
    oldValue: previousAgentId ? previousAgentId.toString() : 'Unassigned',
    newValue: targetAgent._id.toString(),
    metadata: {
      agentName: targetAgent.name,
      agentEmail: targetAgent.email
    }
  });

  // Notify newly assigned agent
  await createNotification({
    userId: targetAgent._id,
    message: `You have been assigned to ticket ${ticket.ticketId}: "${ticket.title}"`,
    type: NOTIFICATION_TYPES.ASSIGNMENT,
    relatedTicketId: ticket._id,
    ticketCode: ticket.ticketId
  });

  // Notify employee that an agent has been assigned
  if (ticket.createdBy.toString() !== user._id.toString()) {
    await createNotification({
      userId: ticket.createdBy,
      message: `Your ticket ${ticket.ticketId} has been assigned to support agent ${targetAgent.name}`,
      type: NOTIFICATION_TYPES.ASSIGNMENT,
      relatedTicketId: ticket._id,
      ticketCode: ticket.ticketId
    });
  }

  return await ticket.populate([
    { path: 'createdBy', select: 'name email role department' },
    { path: 'assignedTo', select: 'name email role department' }
  ]);
};

/**
 * Update ticket priority
 */
const updateTicketPriority = async (ticketId, newPriority, user) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  if (!Object.values(TICKET_PRIORITIES).includes(newPriority)) {
    const error = new Error(`Invalid priority: ${newPriority}`);
    error.statusCode = 400;
    throw error;
  }

  const oldPriority = ticket.priority;
  if (oldPriority === newPriority) {
    return ticket;
  }

  ticket.priority = newPriority;
  // Recalculate SLA deadline based on updated priority
  ticket.slaDeadline = calculateSLADeadline(newPriority);
  await ticket.save();

  // Audit log
  await createAuditLog({
    ticketId: ticket._id,
    action: AUDIT_ACTIONS.PRIORITY_CHANGED,
    performedBy: user._id,
    oldValue: oldPriority,
    newValue: newPriority
  });

  // Notify assigned agent if someone else changed it
  if (ticket.assignedTo && ticket.assignedTo.toString() !== user._id.toString()) {
    await createNotification({
      userId: ticket.assignedTo,
      message: `Priority of ticket ${ticket.ticketId} updated to '${newPriority}' by ${user.name}`,
      type: NOTIFICATION_TYPES.PRIORITY_CHANGE,
      relatedTicketId: ticket._id,
      ticketCode: ticket.ticketId
    });
  }

  return await ticket.populate([
    { path: 'createdBy', select: 'name email role department' },
    { path: 'assignedTo', select: 'name email role department' }
  ]);
};

/**
 * Delete a ticket (Admin only)
 */
const deleteTicket = async (ticketId, user) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  await Ticket.findByIdAndDelete(ticketId);
  return { message: `Ticket ${ticket.ticketId} deleted successfully` };
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  updateTicketPriority,
  deleteTicket
};
