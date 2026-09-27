import api from './api';

export const barberService = {
  getAll: async () => {
    try {
      const response = await api.get('/barbers');
      console.log('✅ barberService.getAll() success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ barberService.getAll() error:', error.message);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/barbers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching barber ${id}:`, error.message);
      throw error;
    }
  },
};