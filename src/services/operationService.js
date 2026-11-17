// import api from './api';

// export const operationService = {
//   getAll: async () => {
//     try {
//       console.log('🔍 Fetching operations...');
//       const response = await api.get('/operations');
//       console.log('✅ Operations response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('❌ Error fetching operations:', error.message);
//       throw error;
//     }
//   },
//   getById: async (id) => {
//     try {
//       const response = await api.get(`/operations/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error fetching operation ${id}:`, error.message);
//       throw error;
//     }
//   },
// };

import api from './api';

export const operationService = {
  getAll: async () => {
    try {
      const response = await api.get('/operations');
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

  create: async (data) => {
    try {
      const response = await api.post('/operations', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating operation:', error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/operations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating operation ${id}:`, error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/operations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting operation ${id}:`, error.message);
      throw error;
    }
  },
};