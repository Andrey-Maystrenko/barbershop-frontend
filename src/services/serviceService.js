import api from './api';

export const serviceService = {
  create: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },
  getByDateRange: async (startDate, endDate) => {
    const response = await api.get('/services/by-date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  update: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

};