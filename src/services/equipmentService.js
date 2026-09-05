import api from './api';

export const equipmentService = {
  getFailurePredictions: async (params) => {
    try {
      const response = await api.get('/predictive/equipment-failure', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch equipment predictions');
    }
  }
};