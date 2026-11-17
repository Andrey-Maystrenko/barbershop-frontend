// import api from './api';

// export const hairstyleService = {
//   getAll: async () => {
//     const response = await api.get('/hairstyles');
//     return response.data;
//   },
//   getById: async (id) => {
//     const response = await api.get(`/hairstyles/${id}`);
//     return response.data;
//   },
// };

// import api from './api';

// export const hairstyleService = {
//   getAll: async () => {
//     try {
//       const response = await api.get('/hairstyles');
//       console.log('✅ hairstyleService.getAll() success:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('❌ hairstyleService.getAll() error:', error.message);
//       throw error;
//     }
//   },
//   getById: async (id) => {
//     try {
//       const response = await api.get(`/hairstyles/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error fetching hairstyle ${id}:`, error.message);
//       throw error;
//     }
//   },
// };

import api from './api';

export const hairstyleService = {
  getAll: async () => {
    try {
      const response = await api.get('/hairstyles');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching hairstyles:', error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/hairstyles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching hairstyle ${id}:`, error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/hairstyles', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating hairstyle:', error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/hairstyles/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating hairstyle ${id}:`, error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/hairstyles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting hairstyle ${id}:`, error.message);
      throw error;
    }
  },
};