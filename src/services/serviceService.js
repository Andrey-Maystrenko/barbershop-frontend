import api from './api';

export const serviceService = {
  create: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },
};