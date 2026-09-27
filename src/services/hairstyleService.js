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

import api from './api';

export const hairstyleService = {
  getAll: async () => {
    try {
      const response = await api.get('/hairstyles');
      console.log('✅ hairstyleService.getAll() success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ hairstyleService.getAll() error:', error.message);
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
};