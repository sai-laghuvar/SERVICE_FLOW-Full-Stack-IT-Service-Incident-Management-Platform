import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('serviceflow_token', response.data.token);
      localStorage.setItem('serviceflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('serviceflow_token', response.data.token);
      localStorage.setItem('serviceflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('serviceflow_token');
      localStorage.removeItem('serviceflow_user');
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/auth/me', profileData);
    if (response.data.data.user) {
      localStorage.setItem('serviceflow_user', JSON.stringify(response.data.data.user));
    }
    return response.data.data.user;
  }
};
