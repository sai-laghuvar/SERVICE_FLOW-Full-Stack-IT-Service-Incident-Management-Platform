import api from './api';

export const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.unreadCount;
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data.data.notification;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }
};
