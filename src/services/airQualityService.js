import api from './api';

export const airQualityService = {
  getPredictions: async (params) => {
    try {
      const response = await api.get('/predictive/air-quality', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch air quality predictions');
    }
  },

  trainModel: async (data) => {
    try {
      const response = await api.post('/predictive/air-quality/train', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to train model');
    }
  }
};