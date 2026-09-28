/**
 * Standardized JSON response helpers
 */

const sendSuccess = (res, data = {}, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const sendPaginated = (res, items = [], pagination = {}, message = 'Data retrieved successfully') => {
  return res.status(200).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 0,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false
      }
    }
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated
};
