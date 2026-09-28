const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/response');

/**
 * Get core metrics / KPI summary stats for dashboard cards
 * GET /api/dashboard/stats
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user);
    return sendSuccess(res, { stats }, 'Dashboard statistics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get status breakdown for pie/bar chart
 * GET /api/dashboard/status
 */
const getStatusBreakdown = async (req, res, next) => {
  try {
    const breakdown = await dashboardService.getStatusBreakdown(req.user);
    return sendSuccess(res, { breakdown }, 'Status breakdown retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get priority breakdown for donut/pie chart
 * GET /api/dashboard/priority
 */
const getPriorityBreakdown = async (req, res, next) => {
  try {
    const breakdown = await dashboardService.getPriorityBreakdown(req.user);
    return sendSuccess(res, { breakdown }, 'Priority breakdown retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get category breakdown for bar chart
 * GET /api/dashboard/categories
 */
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const breakdown = await dashboardService.getCategoryBreakdown(req.user);
    return sendSuccess(res, { breakdown }, 'Category breakdown retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get trend analysis over time
 * GET /api/dashboard/trends
 */
const getTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const trends = await dashboardService.getTrends(req.user, days);
    return sendSuccess(res, { trends }, 'Trend data retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activity feed (Admin or Support Agent)
 * GET /api/dashboard/recent-activity
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const activities = await dashboardService.getRecentActivity(limit);
    return sendSuccess(res, { activities }, 'Recent activity retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getStatusBreakdown,
  getPriorityBreakdown,
  getCategoryBreakdown,
  getTrends,
  getRecentActivity
};
