import api from './api';

export const materialService = {
  getAll: async () => {
    const response = await api.get('/materials');
    return response.data;
  },
};