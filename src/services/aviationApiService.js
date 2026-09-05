// src/services/aviationApiService.js
import axios from 'axios';
import { API_ENDPOINTS } from './api'; // Import from api.js instead

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
    config.headers['X-Industry-Type'] = 'aviation';
    config.headers['X-Module'] = 'aviation-safety';
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

class AviationApiService {
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
      console.error(`Aviation API Error for ${endpoint}:`, error);

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
            error: 'Premium feature: Upgrade your subscription to access advanced aviation safety features',
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
        error: 'An unexpected error occurred in aviation safety service',
        code: 'UNKNOWN_ERROR'
      };
    }
  }

  // Real-time Data & Metrics
  async getRealTimeMetrics() {
    return await this.makeApiCall('/hse/industries/aviation/dashboard');
  }

  async getFlightOperations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/aviation/flight-operations?${queryString}`);
  }

  async getSafetyMetrics() {
    return await this.makeApiCall('/hse/industries/aviation/metrics');
  }

  async getOperationalStatus() {
    return await this.makeApiCall('/aviation/operational-status');
  }

  // Flight Operations Management
  async getFlightDetails(flightId) {
    return await this.makeApiCall(`/aviation/flights/${flightId}`);
  }

  async updateFlightStatus(flightId, statusData) {
    return await this.makeApiCall(`/aviation/flights/${flightId}/status`, {
      method: 'PUT',
      data: statusData
    });
  }

  async addFlightOperation(flightData) {
    return await this.makeApiCall('/aviation/flights', {
      method: 'POST',
      data: flightData
    });
  }

  async cancelFlight(flightId, reason) {
    return await this.makeApiCall(`/aviation/flights/${flightId}/cancel`, {
      method: 'POST',
      data: { reason }
    });
  }

  async searchFlights(query, filters = {}) {
    return await this.makeApiCall('/aviation/flights/search', {
      method: 'POST',
      data: { query, filters }
    });
  }

  // Aircraft Management
  async getAircraftFleet(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/aviation/aircraft?${queryString}`);
  }

  async getAircraftDetails(tailNumber) {
    return await this.makeApiCall(`/aviation/aircraft/${tailNumber}`);
  }

  async updateAircraftStatus(tailNumber, statusData) {
    return await this.makeApiCall(`/aviation/aircraft/${tailNumber}/status`, {
      method: 'PUT',
      data: statusData
    });
  }

  async scheduleAircraftMaintenance(tailNumber, maintenanceData) {
    return await this.makeApiCall(`/aviation/aircraft/${tailNumber}/maintenance`, {
      method: 'POST',
      data: maintenanceData
    });
  }

  // Safety Tools & Analysis
  async getSafetyTools() {
    return await this.makeApiCall('/hse/industries/aviation/tools');
  }

  async runFODDetection(area, parameters = {}) {
    return await this.makeApiCall('/aviation/tools/fod-detection', {
      method: 'POST',
      data: { area, parameters }
    });
  }

  async analyzeRunwaySafety(runwayData) {
    return await this.makeApiCall('/aviation/tools/runway-analysis', {
      method: 'POST',
      data: runwayData
    });
  }

  async simulateEmergencyResponse(scenario) {
    return await this.makeApiCall('/aviation/tools/emergency-simulation', {
      method: 'POST',
      data: scenario
    });
  }

  async analyzeFlightData(flightData) {
    return await this.makeApiCall('/aviation/tools/flight-analysis', {
      method: 'POST',
      data: flightData
    });
  }

  // Document Management
  async getAviationDocuments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/hse/industries/aviation/documents?${queryString}`);
  }

  async uploadAviationDocument(formData) {
    return await this.makeApiCall('/hse/industries/aviation/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData
    });
  }

  async updateDocument(documentId, updates) {
    return await this.makeApiCall(`/hse/documents/${documentId}`, {
      method: 'PUT',
      data: updates
    });
  }

  async deleteDocument(documentId) {
    return await this.makeApiCall(`/hse/documents/${documentId}`, {
      method: 'DELETE'
    });
  }

  async downloadDocument(documentId) {
    return await this.makeApiCall(`/hse/documents/${documentId}/download`, {
      method: 'GET',
      responseType: 'blob'
    });
  }

  async searchDocuments(query, filters = {}) {
    return await this.makeApiCall('/hse/industries/aviation/documents/search', {
      method: 'POST',
      data: { query, filters }
    });
  }

  // AI Services
  async runAISafetyAnalysis(flightData = null) {
    return await this.makeApiCall('/hse/ai/aviation/safety-analysis', {
      method: 'POST',
      data: { flightData }
    });
  }

  async activatePredictiveMaintenance() {
    return await this.makeApiCall('/hse/ai/aviation/predictive-maintenance', {
      method: 'POST'
    });
  }

  async predictWeatherRisks(routeData) {
    return await this.makeApiCall('/hse/ai/aviation/weather-prediction', {
      method: 'POST',
      data: routeData
    });
  }

  async monitorCrewFatigue(crewData) {
    return await this.makeApiCall('/hse/ai/aviation/crew-monitoring', {
      method: 'POST',
      data: crewData
    });
  }

  async getAISafetyInsights(airportCode = null) {
    const endpoint = airportCode ? 
      `/hse/ai/aviation/insights?airport=${airportCode}` : 
      '/hse/ai/aviation/insights';
    return await this.makeApiCall(endpoint);
  }

  // Crew & Training Management
  async getCrewTrainingStatus(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/aviation/crew/training?${queryString}`);
  }

  async updateCrewTraining(crewId, trainingData) {
    return await this.makeApiCall(`/aviation/crew/training/${crewId}`, {
      method: 'PUT',
      data: trainingData
    });
  }

  async assignTraining(crewIds, trainingModule) {
    return await this.makeApiCall('/aviation/crew/training/assign', {
      method: 'POST',
      data: { crewIds, trainingModule }
    });
  }

  async getTrainingCompliance() {
    return await this.makeApiCall('/aviation/crew/training/compliance');
  }

  // Maintenance Management
  async getMaintenanceSchedule(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/aviation/maintenance?${queryString}`);
  }

  async scheduleMaintenance(maintenanceData) {
    return await this.makeApiCall('/aviation/maintenance', {
      method: 'POST',
      data: maintenanceData
    });
  }

  async updateMaintenanceStatus(maintenanceId, status) {
    return await this.makeApiCall(`/aviation/maintenance/${maintenanceId}/status`, {
      method: 'PUT',
      data: { status }
    });
  }

  async getMaintenanceCompliance() {
    return await this.makeApiCall('/aviation/maintenance/compliance');
  }

  // Incident Reporting
  async reportIncident(incidentData) {
    return await this.makeApiCall('/hse/industries/aviation/incidents', {
      method: 'POST',
      data: incidentData
    });
  }

  async getIncidents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/hse/industries/aviation/incidents?${queryString}`);
  }

  async updateIncident(incidentId, updates) {
    return await this.makeApiCall(`/hse/incidents/${incidentId}`, {
      method: 'PUT',
      data: updates
    });
  }

  // Compliance & Regulatory
  async getRegulatoryCompliance() {
    return await this.makeApiCall('/hse/industries/aviation/compliance');
  }

  async generateSafetyReport(params) {
    return await this.makeApiCall('/hse/industries/aviation/reports', {
      method: 'POST',
      data: params
    });
  }

  async submitRegulatoryData(complianceData) {
    return await this.makeApiCall('/aviation/regulatory/submission', {
      method: 'POST',
      data: complianceData
    });
  }

// === INCIDENT MANAGEMENT ===
async getIncidents(status = 'all') {
  return await this.makeApiCall(`/aviation/incidents?status=${status}`);
}

async submitIncidentReport(incidentData) {
  return await this.makeApiCall('/aviation/incidents/report', {
    method: 'POST',
    data: incidentData
  });
}

async updateIncidentStatus(incidentId, status) {
  return await this.makeApiCall(`/aviation/incidents/${incidentId}/status`, {
    method: 'PUT',
    data: { status }
  });
}

// === TRAINING & COMPETENCE ===
async getTrainingRecords() {
  return await this.makeApiCall('/aviation/training/records');
}

async updateTrainingCompletion(recordId, data) {
  return await this.makeApiCall(`/aviation/training/records/${recordId}`, {
    method: 'PUT',
    data
  });
}

async getCompetenceAssessments() {
  return await this.makeApiCall('/aviation/competence/assessments');
}

// === MAINTENANCE SAFETY ===
async getMaintenanceStatus() {
  return await this.makeApiCall('/aviation/maintenance/status');
}

async scheduleMaintenance(maintenanceData) {
  return await this.makeApiCall('/aviation/maintenance/schedule', {
    method: 'POST',
    data: maintenanceData
  });
}

// === SAFETY COMMUNICATION ===
async getSafetyBulletins() {
  return await this.makeApiCall('/aviation/communication/bulletins');
}

async publishSafetyAlert(alertData) {
  return await this.makeApiCall('/aviation/communication/alerts', {
    method: 'POST',
    data: alertData
  });
}

// === REGULATORY REPORTING ===
async getReportingRequirements() {
  return await this.makeApiCall('/aviation/reporting/requirements');
}

async submitRegulatoryReport(reportData) {
  return await this.makeApiCall('/aviation/reporting/submit', {
    method: 'POST',
    data: reportData
  });
}

// === SAFETY ANALYTICS ===
async getPredictiveAnalytics() {
  return await this.makeApiCall('/aviation/analytics/predictive');
}

async getSafetyTrendsAnalysis() {
  return await this.makeApiCall('/aviation/analytics/trends');
}

// === SYSTEM ADMINISTRATION ===
async getSystemUsers() {
  return await this.makeApiCall('/aviation/admin/users');
}

async updateSystemSettings(settings) {
  return await this.makeApiCall('/aviation/admin/settings', {
    method: 'PUT',
    data: settings
  });
}

  // Analytics & Reporting
  async getAviationAnalytics(timeframe = '30d') {
    return await this.makeApiCall(`/hse/industries/aviation/analytics?timeframe=${timeframe}`);
  }

  async exportFlightReport(reportType, params) {
    return await this.makeApiCall('/aviation/reports/export', {
      method: 'POST',
      data: { reportType, params },
      responseType: 'blob'
    });
  }

  // File Operations with progress tracking
  async uploadWithProgress(formData, onProgress) {
    return await apiClient.post('/hse/industries/aviation/documents/upload', formData, {
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

  // Batch Operations
  async batchFlightOperations(operations) {
    return await this.makeApiCall('/aviation/flights/batch', {
      method: 'POST',
      data: operations
    });
  }

  // Utility Methods
  async checkSystemStatus() {
    return await this.makeApiCall('/health');
  }

  async getUserPreferences() {
    return await this.makeApiCall('/user/preferences/aviation');
  }

  async updateUserPreferences(preferences) {
    return await this.makeApiCall('/user/preferences/aviation', {
      method: 'PUT',
      data: preferences
    });
  }

  // Real-time WebSocket connection for flight tracking
  initializeFlightTracking(airportCode) {
    const wsUrl = process.env.REACT_APP_WS_URL || 'wss://api/realtime';
    const socket = new WebSocket(`${wsUrl}?type=aviation&airport=${airportCode}&token=${localStorage.getItem('authToken')}`);

    return {
      socket,
      subscribe: (event, callback) => {
        socket.addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          if (data.type === event) {
            callback(data.payload);
          }
        });
      },
      disconnect: () => socket.close()
    };
  }
}

// Create and export singleton instance
const aviationApiService = new AviationApiService();
export default aviationApiService;