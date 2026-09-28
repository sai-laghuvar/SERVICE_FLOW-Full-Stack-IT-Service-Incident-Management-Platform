import api from './api';

export const ticketService = {
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data.data.ticket;
  },

  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data.data;
  },

  getTicketById: async (idOrCode) => {
    const response = await api.get(`/tickets/${idOrCode}`);
    return response.data.data.ticket;
  },

  updateStatus: async (ticketId, status, resolutionText = '') => {
    const response = await api.patch(`/tickets/${ticketId}/status`, {
      status,
      resolutionText
    });
    return response.data.data.ticket;
  },

  assignTicket: async (ticketId, agentId) => {
    const response = await api.patch(`/tickets/${ticketId}/assign`, { agentId });
    return response.data.data.ticket;
  },

  updatePriority: async (ticketId, priority) => {
    const response = await api.patch(`/tickets/${ticketId}/priority`, { priority });
    return response.data.data.ticket;
  },

  deleteTicket: async (ticketId) => {
    const response = await api.delete(`/tickets/${ticketId}`);
    return response.data;
  },

  getTicketHistory: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/history`);
    return response.data.data.history;
  }
};
