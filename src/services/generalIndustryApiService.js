// src/services/generalIndustryApiService.js
import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Industry-Type'] = 'general';
    config.headers['X-Module'] = 'general-industry';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class GeneralIndustryApiService {
  constructor() {
    this.isPremium = localStorage.getItem('subscriptionTier') === 'premium';
  }

  // Generic API call method
  async makeApiCall(endpoint, options = {}) {
    try {
      const response = await apiClient({
        url: endpoint,
        ...options
      });

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`General Industry API Error for ${endpoint}:`, error);

      if (error.code === 'NETWORK_ERROR') {
        return {
          success: false,
          error: 'Network error: Please check your internet connection',
          code: 'NETWORK_ERROR'
        };
      }

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;

        if (status === 402) {
          return {
            success: false,
            error: 'Premium feature: Upgrade your subscription to access advanced general industry safety features',
            code: 'PREMIUM_REQUIRED'
          };
        }

        return {
          success: false,
          error: message,
          code: `HTTP_${status}`,
          status
        };
      }

      return {
        success: false,
        error: 'An unexpected error occurred in general industry safety service',
        code: 'UNKNOWN_ERROR'
      };
    }
  }

  // Industry Configuration
  async getIndustryConfig() {
    return await this.makeApiCall('/hse/industries/general');
  }

  async getIndustryDashboard() {
    return await this.makeApiCall('/hse/industries/general/dashboard');
  }

  async getIndustryAnalytics(timeframe = '30d') {
    return await this.makeApiCall(`/hse/industries/general/analytics?timeframe=${timeframe}`);
  }

  // Document Management
  async getDocuments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/hse/industries/general/documents?${queryString}`);
  }

  async uploadDocument(formData) {
    return await this.makeApiCall('/hse/industries/general/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData
    });
  }

  async downloadDocument(documentId) {
    return await this.makeApiCall(`/hse/documents/${documentId}/download`, {
      method: 'GET',
      responseType: 'blob'
    });
  }

  async deleteDocument(documentId) {
    return await this.makeApiCall(`/hse/documents/${documentId}`, {
      method: 'DELETE'
    });
  }

  async searchDocuments(query, filters = {}) {
    return await this.makeApiCall('/hse/industries/general/documents/search', {
      method: 'POST',
      data: { query, filters }
    });
  }

  // Safety Tools
  async getSafetyTools() {
    return await this.makeApiCall('/hse/industries/general/tools');
  }

  async executeTool(toolId, parameters) {
    return await this.makeApiCall(`/hse/tools/${toolId}/execute`, {
      method: 'POST',
      data: { parameters }
    });
  }

  // AI Services
  async getAIServices() {
    return await this.makeApiCall('/hse/industries/general/ai-services');
  }

  async runAISafetyAnalysis(analysisData) {
    return await this.makeApiCall('/hse/ai/general/safety-analysis', {
      method: 'POST',
      data: analysisData
    });
  }

  async generateDocument(templateData) {
    return await this.makeApiCall('/hse/ai/general/generate-document', {
      method: 'POST',
      data: templateData
    });
  }

  // Risk Assessment
  async getRiskAssessments() {
    return await this.makeApiCall('/hse/industries/general/risk-assessments');
  }

  async createRiskAssessment(assessmentData) {
    return await this.makeApiCall('/hse/industries/general/risk-assessments', {
      method: 'POST',
      data: assessmentData
    });
  }

  // Incident Management
  async getIncidents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/hse/industries/general/incidents?${queryString}`);
  }

  async reportIncident(incidentData) {
    return await this.makeApiCall('/hse/industries/general/incidents', {
      method: 'POST',
      data: incidentData
    });
  }

  // Training Management
  async getTrainingCourses() {
    return await this.makeApiCall('/hse/industries/general/training');
  }

  async getTrainingRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/hse/industries/general/training-records?${queryString}`);
  }

  // Compliance Management
  async getComplianceRequirements() {
    return await this.makeApiCall('/hse/industries/general/compliance');
  }

  async getComplianceStatus() {
    return await this.makeApiCall('/hse/industries/general/compliance-status');
  }

  // Department Safety
  async getDepartmentSafety() {
    return await this.makeApiCall('/hse/industries/general/departments/safety');
  }

  // Analytics & Reporting
  async getSafetyMetrics(timeframe = '30d') {
    return await this.makeApiCall(`/hse/industries/general/metrics?timeframe=${timeframe}`);
  }

  async generateReport(reportData) {
    return await this.makeApiCall('/hse/industries/general/reports', {
      method: 'POST',
      data: reportData
    });
  }

  // Favorites Management
  async getFavorites() {
    return await this.makeApiCall('/hse/favorites?industry=general');
  }

  async toggleFavorite(documentId) {
    return await this.makeApiCall('/hse/favorites/toggle', {
      method: 'POST',
      data: { documentId, industry: 'general' }
    });
  }

  // Document Sharing
  async shareDocument(documentId) {
    return await this.makeApiCall(`/hse/documents/${documentId}/share`, {
      method: 'POST',
      data: { industry: 'general' }
    });
  }

  // Document Categories
  async getDocumentCategories() {
    return await this.makeApiCall('/hse/industries/general/document-categories');
  }

  // File Operations with progress tracking
  async uploadWithProgress(formData, onProgress) {
    return await apiClient.post('/hse/industries/general/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  }

  // Utility Methods
  async checkSystemStatus() {
    return await this.makeApiCall('/health');
  }

  async getUserPreferences() {
    return await this.makeApiCall('/user/preferences/general');
  }

  async updateUserPreferences(preferences) {
    return await this.makeApiCall('/user/preferences/general', {
      method: 'PUT',
      data: preferences
    });
  }
}

// Create and export singleton instance
const generalIndustryApiService = new GeneralIndustryApiService();
export default generalIndustryApiService;