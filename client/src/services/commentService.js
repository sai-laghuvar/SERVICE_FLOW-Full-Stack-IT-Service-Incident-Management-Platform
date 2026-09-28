import api from './api';

export const commentService = {
  getTicketComments: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/comments`);
    return response.data.data.comments;
  },

  addComment: async (ticketId, text) => {
    const response = await api.post(`/tickets/${ticketId}/comments`, { text });
    return response.data.data.comment;
  }
};
