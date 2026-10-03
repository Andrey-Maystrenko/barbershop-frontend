import api from './api';

export const operationService = {
  getAll: async () => {
    try {
      console.log('🔍 Fetching operations...');
      const response = await api.get('/operations');
      console.log('✅ Operations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching operations:', error.message);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/operations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching operation ${id}:`, error.message);
      throw error;
    }
  },
};