import api from './api';

// export const materialService = {
//   getAll: async () => {
//     const response = await api.get('/materials');
//     return response.data;
//   },
// };

export const materialService = {
  getAll: async () => {
    try {
      const response = await api.get('/materials');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching materials:', error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching material ${id}:`, error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/materials', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating material:', error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/materials/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating material ${id}:`, error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting material ${id}:`, error.message);
      throw error;
    }
  },

  addStock: async (id, amount, reason) => {
    try {
      const response = await api.patch(`/materials/${id}/add-stock`, { amount, reason });
      return response.data;
    } catch (error) {
      console.error(`❌ Error adding stock to ${id}:`, error.message);
      throw error;
    }
  },

  useStock: async (id, amount, reason) => {
    try {
      const response = await api.patch(`/materials/${id}/use-stock`, { amount, reason });
      return response.data;
    } catch (error) {
      console.error(`❌ Error using stock from ${id}:`, error.message);
      throw error;
    }
  },
};