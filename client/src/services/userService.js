import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data.user;
  },

  updateUser: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data.data.user;
  }
};
