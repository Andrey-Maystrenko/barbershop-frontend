import api from './api';

export const clientService = {
  getAll: async () => {
    const response = await api.get('/clients');
    return response.data;
  },
};