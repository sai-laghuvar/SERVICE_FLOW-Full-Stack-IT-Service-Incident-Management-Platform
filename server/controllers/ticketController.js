const ticketService = require('../services/ticketService');
const auditService = require('../services/auditService');
const { sendSuccess } = require('../utils/response');

/**
 * Create a new support ticket
 * POST /api/tickets
 */
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    const ticket = await ticketService.createTicket({
      title,
      description,
      category,
      priority,
      user: req.user
    });

    return sendSuccess(res, { ticket }, 'Ticket created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get tickets with search, filtering, and pagination
 * GET /api/tickets
 */
const getTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getTickets({
      user: req.user,
      query: req.query
    });

    return sendSuccess(res, result, 'Tickets retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single ticket details
 * GET /api/tickets/:id
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    return sendSuccess(res, { ticket }, 'Ticket details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update ticket status with state transition validation
 * PATCH /api/tickets/:id/status
 */
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, resolutionText } = req.body;
    const ticket = await ticketService.updateTicketStatus(
      req.params.id,
      { status, resolutionText },
      req.user
    );

    return sendSuccess(res, { ticket }, `Ticket status updated to '${status}'`);
  } catch (error) {
    next(error);
  }
};

/**
 * Assign ticket to a support agent (Admin only)
 * PATCH /api/tickets/:id/assign
 */
const assignTicket = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const ticket = await ticketService.assignTicket(req.params.id, agentId, req.user);
    return sendSuccess(res, { ticket }, 'Ticket assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update ticket priority (Admin or Agent)
 * PATCH /api/tickets/:id/priority
 */
const updateTicketPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    const ticket = await ticketService.updateTicketPriority(req.params.id, priority, req.user);
    return sendSuccess(res, { ticket }, `Ticket priority updated to '${priority}'`);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a ticket (Admin only)
 * DELETE /api/tickets/:id
 */
const deleteTicket = async (req, res, next) => {
  try {
    const result = await ticketService.deleteTicket(req.params.id, req.user);
    return sendSuccess(res, result, 'Ticket deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get ticket activity history / audit logs
 * GET /api/tickets/:id/history
 */
const getTicketHistory = async (req, res, next) => {
  try {
    // First verify user has access to view this ticket
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    const history = await auditService.getTicketAuditLogs(ticket._id);
    return sendSuccess(res, { history }, 'Ticket history retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  updateTicketPriority,
  deleteTicket,
  getTicketHistory
};
