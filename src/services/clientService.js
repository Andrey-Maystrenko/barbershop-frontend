// import api from './api';

// export const clientService = {
//   getAll: async () => {
//     const response = await api.get('/clients');
//     return response.data;
//   },
// };

import api from './api';

export const clientService = {
  getAll: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching clients:', error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching client ${id}:`, error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/clients', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating client:', error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/clients/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating client ${id}:`, error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting client ${id}:`, error.message);
      throw error;
    }
  },
};