import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data.data.stats;
  },

  getStatusBreakdown: async () => {
    const response = await api.get('/dashboard/status');
    return response.data.data.breakdown;
  },

  getPriorityBreakdown: async () => {
    const response = await api.get('/dashboard/priority');
    return response.data.data.breakdown;
  },

  getCategoryBreakdown: async () => {
    const response = await api.get('/dashboard/categories');
    return response.data.data.breakdown;
  },

  getTrends: async (days = 7) => {
    const response = await api.get('/dashboard/trends', { params: { days } });
    return response.data.data.trends;
  },

  getRecentActivity: async (limit = 10) => {
    const response = await api.get('/dashboard/recent-activity', { params: { limit } });
    return response.data.data.activities;
  }
};
