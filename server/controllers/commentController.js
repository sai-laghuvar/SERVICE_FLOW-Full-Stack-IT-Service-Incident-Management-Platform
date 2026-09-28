const commentService = require('../services/commentService');
const { sendSuccess } = require('../utils/response');

/**
 * Add a comment to a ticket
 * POST /api/tickets/:id/comments
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const comment = await commentService.addComment({
      ticketId: req.params.id,
      text,
      user: req.user
    });

    return sendSuccess(res, { comment }, 'Comment added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all comments for a ticket
 * GET /api/tickets/:id/comments
 */
const getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getTicketComments(req.params.id, req.user);
    return sendSuccess(res, { comments }, 'Comments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getComments
};
