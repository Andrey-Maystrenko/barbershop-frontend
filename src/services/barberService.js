// import api from './api';

// export const barberService = {
//   getAll: async () => {
//     try {
//       const response = await api.get('/barbers');
//       console.log('✅ barberService.getAll() success:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('❌ barberService.getAll() error:', error.message);
//       throw error;
//     }
//   },
//   getById: async (id) => {
//     try {
//       const response = await api.get(`/barbers/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error fetching barber ${id}:`, error.message);
//       throw error;
//     }
//   },

// };

import api from './api';

export const barberService = {
  getAll: async () => {
    try {
      const response = await api.get('/barbers');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching barbers:', error.message);
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

  create: async (data) => {
    try {
      const response = await api.post('/barbers', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating barber:', error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/barbers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating barber ${id}:`, error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/barbers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting barber ${id}:`, error.message);
      throw error;
    }
  },
};