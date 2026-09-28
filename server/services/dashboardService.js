const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const {
  ROLES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES
} = require('../config/constants');

/**
 * Get aggregated statistics for the current user based on role
 */
const getDashboardStats = async (user) => {
  const baseFilter = {};
  if (user.role === ROLES.EMPLOYEE) {
    baseFilter.createdBy = user._id;
  } else if (user.role === ROLES.SUPPORT_AGENT) {
    baseFilter.assignedTo = user._id;
  }

  const [
    total,
    open,
    inProgress,
    onHold,
    resolved,
    closed,
    critical,
    high,
    unassigned,
    slaBreached
  ] = await Promise.all([
    Ticket.countDocuments(baseFilter),
    Ticket.countDocuments({ ...baseFilter, status: TICKET_STATUSES.OPEN }),
    Ticket.countDocuments({ ...baseFilter, status: TICKET_STATUSES.IN_PROGRESS }),
    Ticket.countDocuments({ ...baseFilter, status: TICKET_STATUSES.ON_HOLD }),
    Ticket.countDocuments({ ...baseFilter, status: TICKET_STATUSES.RESOLVED }),
    Ticket.countDocuments({ ...baseFilter, status: TICKET_STATUSES.CLOSED }),
    Ticket.countDocuments({ ...baseFilter, priority: TICKET_PRIORITIES.CRITICAL }),
    Ticket.countDocuments({ ...baseFilter, priority: TICKET_PRIORITIES.HIGH }),
    // Unassigned is only meaningful for Admin or general pool
    user.role === ROLES.ADMIN ? Ticket.countDocuments({ assignedTo: null }) : 0,
    // Tickets whose SLA deadline has passed and are not resolved/closed
    Ticket.countDocuments({
      ...baseFilter,
      status: { $nin: [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED] },
      slaDeadline: { $lt: new Date() }
    })
  ]);

  return {
    total,
    open,
    inProgress,
    onHold,
    resolved,
    closed,
    critical,
    high,
    unassigned,
    slaBreached
  };
};

/**
 * Breakdown of tickets by status
 */
const getStatusBreakdown = async (user) => {
  const filter = {};
  if (user.role === ROLES.EMPLOYEE) {
    filter.createdBy = user._id;
  } else if (user.role === ROLES.SUPPORT_AGENT) {
    filter.assignedTo = user._id;
  }

  const aggregation = await Ticket.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Ensure all statuses exist in output
  const statusMap = Object.values(TICKET_STATUSES).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  aggregation.forEach((item) => {
    if (statusMap[item._id] !== undefined) {
      statusMap[item._id] = item.count;
    }
  });

  return Object.keys(statusMap).map((name) => ({
    name,
    count: statusMap[name]
  }));
};

/**
 * Breakdown of tickets by priority
 */
const getPriorityBreakdown = async (user) => {
  const filter = {};
  if (user.role === ROLES.EMPLOYEE) {
    filter.createdBy = user._id;
  } else if (user.role === ROLES.SUPPORT_AGENT) {
    filter.assignedTo = user._id;
  }

  const aggregation = await Ticket.aggregate([
    { $match: filter },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  const priorityMap = Object.values(TICKET_PRIORITIES).reduce((acc, prio) => {
    acc[prio] = 0;
    return acc;
  }, {});

  aggregation.forEach((item) => {
    if (priorityMap[item._id] !== undefined) {
      priorityMap[item._id] = item.count;
    }
  });

  return Object.keys(priorityMap).map((name) => ({
    name,
    count: priorityMap[name]
  }));
};

/**
 * Breakdown of tickets by category
 */
const getCategoryBreakdown = async (user) => {
  const filter = {};
  if (user.role === ROLES.EMPLOYEE) {
    filter.createdBy = user._id;
  } else if (user.role === ROLES.SUPPORT_AGENT) {
    filter.assignedTo = user._id;
  }

  const aggregation = await Ticket.aggregate([
    { $match: filter },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const categoryMap = Object.values(TICKET_CATEGORIES).reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {});

  aggregation.forEach((item) => {
    if (categoryMap[item._id] !== undefined) {
      categoryMap[item._id] = item.count;
    }
  });

  return Object.keys(categoryMap).map((name) => ({
    name,
    count: categoryMap[name]
  }));
};

/**
 * Ticket creation trends over the past N days
 */
const getTrends = async (user, days = 7) => {
  const filter = {};
  if (user.role === ROLES.EMPLOYEE) {
    filter.createdBy = user._id;
  } else if (user.role === ROLES.SUPPORT_AGENT) {
    filter.assignedTo = user._id;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  filter.createdAt = { $gte: startDate };

  const aggregation = await Ticket.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        created: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [
              { $in: ['$status', [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED]] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Generate array for all days in range so empty dates show 0
  const dateMap = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    dateMap[key] = {
      date: key,
      created: 0,
      resolved: 0
    };
  }

  aggregation.forEach((item) => {
    if (dateMap[item._id]) {
      dateMap[item._id].created = item.created;
      dateMap[item._id].resolved = item.resolved;
    }
  });

  return Object.values(dateMap);
};

/**
 * Fetch recent activity logs across tickets (for Admin / Agent dashboard)
 */
const getRecentActivity = async (limit = 10) => {
  return await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('performedBy', 'name email role')
    .populate('ticketId', 'ticketId title status priority');
};

module.exports = {
  getDashboardStats,
  getStatusBreakdown,
  getPriorityBreakdown,
  getCategoryBreakdown,
  getTrends,
  getRecentActivity
};
