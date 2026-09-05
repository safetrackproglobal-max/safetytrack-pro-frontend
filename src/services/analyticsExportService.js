// src/services/analyticsExportService.js
import api from './api';

class AnalyticsExportService {
  /**
   * Generate analytics export
   */
  async generateExport(exportData) {
    try {
      const response = await api.post('/analytics/export/generate', exportData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate export');
    }
  }

  /**
   * Get export status
   */
  async getExportStatus(exportId) {
    try {
      const response = await api.get(`/analytics/export/status/${exportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get export status');
    }
  }

  /**
   * Download analytics export
   */
  async downloadExport(exportId) {
    try {
      const response = await api.get(`/analytics/export/download/${exportId}`, {
        responseType: 'blob' // Important for file downloads
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Download failed');
    }
  }

  /**
   * Get user's export history
   */
  async getExportHistory(filters = {}) {
    try {
      const response = await api.get('/analytics/export/history', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch export history');
    }
  }

  /**
   * Delete export record
   */
  async deleteExport(exportId) {
    try {
      const response = await api.delete(`/analytics/export/${exportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete export');
    }
  }
}

export default new AnalyticsExportService();