// src/services/constructionApiService.js
import axios from 'axios';

// Enhanced configuration with construction industry standards
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Industry-Standard': 'Construction',
    'X-Client-Version': '2.1.0'
  }
});

class ConstructionApiService {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.standards = {
      osha: '29 CFR 1926',
      ansi: 'A10 Series',
      nfpa: '241, 70E',
      epa: 'Stormwater Management'
    };

    // Auto-bind all methods to maintain 'this' context
    this.autoBindMethods();
    this.setupInterceptors();
  }

  // Auto-bind all class methods
  autoBindMethods() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(name => typeof this[name] === 'function' && name !== 'constructor');
    
    methodNames.forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  setupInterceptors() {
    // Enhanced request interceptor with standards compliance
    apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Industry-specific headers
        config.headers['X-Industry-Type'] = 'construction';
        config.headers['X-Module'] = 'construction-safety';
        config.headers['X-Standards'] = 'OSHA,ANSI,NFPA,EPA';
        config.headers['X-Compliance-Level'] = 'Enterprise';
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        return config;
      },
      (error) => {
        console.error('❌ Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );

    // Enhanced response interceptor with comprehensive error handling
    apiClient.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
        return response;
      },
      async (error) => {
        console.error(`❌ API Error: ${error.config?.url}`, error.response?.data || error.message);
        const originalRequest = error.config;
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Enhanced retry logic for construction safety critical systems
        if (this.shouldRetry(error) && !originalRequest._retry) {
          originalRequest._retry = true;
          await this.delay(1000 * (this.retryCount + 1));
          return apiClient(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }

  shouldRetry(error) {
    const retryableCodes = ['NETWORK_ERROR', 'ECONNABORTED', 'ECONNRESET'];
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    
    return retryableCodes.includes(error.code) || 
           retryableStatuses.includes(error.response?.status) ||
           error.message?.includes('Network Error');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleConstructionError(error) {
    // Construction-specific error handling
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        success: false,
        error: 'Network connectivity issue. Please check your connection to construction safety systems.',
        code: 'NETWORK_ERROR',
        retryable: true,
        severity: 'High'
      };
    }

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;

      const errorMap = {
        400: { message: 'Invalid construction safety data format', severity: 'Medium' },
        403: { message: 'Access denied to construction safety resources', severity: 'High' },
        404: { message: 'Construction safety resource not found', severity: 'Medium' },
        422: { message: 'Construction data validation failed', severity: 'High' },
        429: { message: 'Too many requests to construction safety API', severity: 'Low' },
        500: { message: 'Internal construction safety system error', severity: 'Critical' },
        502: { message: 'Construction safety gateway error', severity: 'High' },
        503: { message: 'Construction safety service temporarily unavailable', severity: 'High' },
        504: { message: 'Construction safety gateway timeout', severity: 'Medium' }
      };

      const errorInfo = errorMap[status] || { message, severity: 'Medium' };

      return {
        success: false,
        error: errorInfo.message,
        code: `CONSTRUCTION_HTTP_${status}`,
        status,
        retryable: status >= 500,
        severity: errorInfo.severity,
        details: error.response.data
      };
    }

    return {
      success: false,
      error: 'Critical construction safety system error',
      code: 'CONSTRUCTION_SYSTEM_FAILURE',
      retryable: false,
      severity: 'Critical',
      details: error.message
    };
  }

  // Enhanced API call with construction-specific error handling
  async makeApiCall(endpoint, options = {}) {
    try {
      console.log(`🔧 Construction API Call: ${endpoint}`, options.method || 'GET');
      
      const response = await apiClient({
        url: endpoint,
        ...options
      });

      this.retryCount = 0;
      
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Construction API Error for ${endpoint}:`, error);

      if (this.shouldRetry(error) && this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying ${endpoint} (attempt ${this.retryCount}/${this.maxRetries})...`);
        await this.delay(1000 * this.retryCount);
        return this.makeApiCall(endpoint, options);
      }

      return this.handleConstructionError(error);
    }
  }

  // === CORE DASHBOARD & REAL-TIME DATA ===

  async getRealTimeMetrics() {
    return await this.makeApiCall('/construction/dashboard/metrics');
  }

  async getSystemHealth() {
    return await this.makeApiCall('/construction/system/health');
  }

  async getOperationalStatus() {
    return await this.makeApiCall('/construction/operations/status');
  }

  // === COMPLIANCE & REGULATORY STANDARDS ===

  async getComplianceStatus() {
    return await this.makeApiCall('/construction/compliance/status');
  }

  async validateOSHACompliance(safetyData) {
    return await this.makeApiCall('/construction/compliance/osha/validate', {
      method: 'POST',
      data: safetyData
    });
  }

  async validateANSICompliance(requirements) {
    return await this.makeApiCall('/construction/compliance/ansi/validate', {
      method: 'POST',
      data: requirements
    });
  }

  async validateNFPACompliance(fireSafetyData) {
    return await this.makeApiCall('/construction/compliance/nfpa/validate', {
      method: 'POST',
      data: fireSafetyData
    });
  }

  async generateComplianceReport(standards = ['osha', 'ansi', 'nfpa']) {
    return await this.makeApiCall('/construction/compliance/report', {
      method: 'POST',
      data: { standards }
    });
  }

  // === SAFETY PERFORMANCE MONITORING ===

  async getSafetyPerformance() {
    return await this.makeApiCall('/construction/performance/metrics');
  }

  async getSafetyPerformanceIndicators() {
    return await this.makeApiCall('/construction/performance/indicators');
  }

  async updateSPITargets(targets) {
    return await this.makeApiCall('/construction/performance/targets', {
      method: 'PUT',
      data: targets
    });
  }

  async getSafetyTrends(timeframe = '30d') {
    return await this.makeApiCall(`/construction/performance/trends?timeframe=${timeframe}`);
  }

  async getSafetyMetrics() {
    return await this.makeApiCall('/construction/analytics/metrics');
  }

  async calculateSafetyMetrics(metricsData) {
    return await this.makeApiCall('/construction/analytics/metrics/calculate', {
      method: 'POST',
      data: metricsData
    });
  }

  // === RISK MANAGEMENT ===

  async submitRiskAssessment(assessmentData) {
    return await this.makeApiCall('/construction/risk/assessment', {
      method: 'POST',
      data: assessmentData
    });
  }

  async getRiskMatrix() {
    return await this.makeApiCall('/construction/risk/matrix');
  }

  async updateRiskMitigation(riskId, mitigationData) {
    return await this.makeApiCall(`/construction/risk/${riskId}/mitigation`, {
      method: 'PUT',
      data: mitigationData
    });
  }

  async getHazardLog(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/construction/risk/hazards?${queryString}`);
  }

  async batchRiskAssessments(assessments) {
    return await this.makeApiCall('/construction/risk/batch', {
      method: 'POST',
      data: { assessments }
    });
  }

  // === INCIDENT REPORTING & INVESTIGATION ===

  async reportIncident(incidentData) {
    return await this.makeApiCall('/construction/incidents/report', {
      method: 'POST',
      data: incidentData
    });
  }

  async getIncidents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/construction/incidents?${queryString}`);
  }

  async updateIncident(incidentId, updates) {
    return await this.makeApiCall(`/construction/incidents/${incidentId}`, {
      method: 'PUT',
      data: updates
    });
  }

  async updateIncidentStatus(incidentId, status) {
    return await this.makeApiCall(`/construction/incidents/${incidentId}/status`, {
      method: 'PUT',
      data: { status }
    });
  }

  async conductRootCauseAnalysis(incidentId) {
    return await this.makeApiCall(`/construction/incidents/${incidentId}/analysis`, {
      method: 'POST'
    });
  }

  async getIncidentStatistics() {
    return await this.makeApiCall('/construction/incidents/statistics');
  }

  async batchProcessIncidents(incidentUpdates) {
    return await this.makeApiCall('/construction/incidents/batch', {
      method: 'PUT',
      data: incidentUpdates
    });
  }

  async batchIncidentReports(incidents) {
    return await this.makeApiCall('/construction/incidents/batch', {
      method: 'POST',
      data: { incidents }
    });
  }

  // === SAFETY ASSURANCE & AUDITING ===

  async submitSafetyAudit(auditData) {
    return await this.makeApiCall('/construction/assurance/audits', {
      method: 'POST',
      data: auditData
    });
  }

  async getAuditSchedule() {
    return await this.makeApiCall('/construction/assurance/audits/schedule');
  }

  async updateAuditFinding(findingId, updates) {
    return await this.makeApiCall(`/construction/assurance/findings/${findingId}`, {
      method: 'PUT',
      data: updates
    });
  }

  async getCorrectiveActions() {
    return await this.makeApiCall('/construction/assurance/actions');
  }

  async getSafetyInspections() {
    return await this.makeApiCall('/construction/inspections');
  }

  async scheduleInspection(inspectionData) {
    return await this.makeApiCall('/construction/inspections/schedule', {
      method: 'POST',
      data: inspectionData
    });
  }

  async getInspectionChecklists() {
    return await this.makeApiCall('/construction/inspections/checklists');
  }

  // === SITE SAFETY MANAGEMENT ===

  async getSiteSafetyInfo(siteId) {
    return await this.makeApiCall(`/construction/sites/${siteId}/safety`);
  }

  async updateSiteSafety(siteId, safetyData) {
    return await this.makeApiCall(`/construction/sites/${siteId}/safety`, {
      method: 'PUT',
      data: safetyData
    });
  }

  async getSiteHazards(siteId) {
    return await this.makeApiCall(`/construction/sites/${siteId}/hazards`);
  }

  async getSiteSafetyOverview(siteId) {
    return await this.makeApiCall(`/construction/sites/${siteId}/safety-overview`);
  }

  async updateSiteSafetyPlan(siteId, planData) {
    return await this.makeApiCall(`/construction/sites/${siteId}/safety-plan`, {
      method: 'PUT',
      data: planData
    });
  }

 // Add this method to handle image uploads specifically
async uploadSiteImageForAnalysis(formData) {
  return await this.makeApiCall('/construction/ai/site-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
    timeout: 60000 // Longer timeout for image processing
  });
}

// Enhanced error handling for image analysis
async runAISiteAnalysis(siteData) {
  try {
    // If siteData contains an image, use the specialized upload method
    if (siteData.site_image && typeof siteData.site_image !== 'string') {
      const formData = new FormData();
      formData.append('siteData', JSON.stringify(siteData));
      formData.append('image', siteData.site_image);
      
      return await this.uploadSiteImageForAnalysis(formData);
    } else {
      return await this.makeApiCall('/construction/ai/site-analysis', {
        method: 'POST',
        data: { siteData }
      });
    }
  } catch (error) {
    console.error('AI Site Analysis Error:', error);
    return this.handleConstructionError(error);
  }
} 
  
  // === EQUIPMENT SAFETY ===

  async getEquipmentSafety() {
    return await this.makeApiCall('/construction/equipment/safety');
  }

  async getEquipmentStatus() {
    return await this.makeApiCall('/construction/equipment/status');
  }

  async updateEquipmentInspection(equipmentId, inspectionData) {
    return await this.makeApiCall(`/construction/equipment/${equipmentId}/inspection`, {
      method: 'PUT',
      data: inspectionData
    });
  }

  async getMaintenanceSchedule() {
    return await this.makeApiCall('/construction/equipment/maintenance/schedule');
  }

  async scheduleMaintenance(maintenanceData) {
    return await this.makeApiCall('/construction/equipment/maintenance/schedule', {
      method: 'POST',
      data: maintenanceData
    });
  }

  // === TRAINING & COMPETENCE ===

  async getConstructionTrainingModules() {
    return await this.makeApiCall('/construction/training/modules');
  }

  async assignConstructionTraining(trainingData) {
    return await this.makeApiCall('/construction/training/assign', {
      method: 'POST',
      data: trainingData
    });
  }

  async getTrainingCompliance() {
    return await this.makeApiCall('/construction/training/compliance');
  }

  async getTrainingRecords() {
    return await this.makeApiCall('/construction/training/records');
  }

  async updateTrainingCompletion(recordId, data) {
    return await this.makeApiCall(`/construction/training/records/${recordId}`, {
      method: 'PUT',
      data
    });
  }

  async getCompetenceAssessments() {
    return await this.makeApiCall('/construction/competence/assessments');
  }

  async scheduleTraining(trainingData) {
    return await this.makeApiCall('/construction/training/schedule', {
      method: 'POST',
      data: trainingData
    });
  }

  async batchUpdateTraining(trainingUpdates) {
    return await this.makeApiCall('/construction/training/batch', {
      method: 'PUT',
      data: trainingUpdates
    });
  }

  // === EMERGENCY RESPONSE ===

  async getEmergencyProcedures() {
    return await this.makeApiCall('/construction/emergency/procedures');
  }

  async updateEmergencyProcedure(procedureId, updates) {
    return await this.makeApiCall(`/construction/emergency/procedures/${procedureId}`, {
      method: 'PUT',
      data: updates
    });
  }

  async simulateEmergencyScenario(scenario) {
    return await this.makeApiCall('/construction/ai/emergency-simulation', {
      method: 'POST',
      data: scenario
    });
  }

  // === DOCUMENT MANAGEMENT ===

  async getConstructionDocuments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/construction/documents?${queryString}`);
  }

  async uploadConstructionDocument(formData) {
    return await this.makeApiCall('/construction/documents/upload', {
      method: 'POST',
      headers: {
        
      },
      data: formData
    });
  }

  async updateDocument(documentId, updates) {
    return await this.makeApiCall(`/construction/documents/${documentId}`, {
      method: 'PUT',
      data: updates
    });
  }

 // Add these methods to constructionApiService class

// Equipment management
async addEquipment(equipmentData) {
  return await this.makeApiCall('/construction/equipment', {
    method: 'POST',
    data: equipmentData
  });
}

async updateEquipment(equipmentId, updates) {
  return await this.makeApiCall(`/construction/equipment/${equipmentId}`, {
    method: 'PUT',
    data: updates
  });
}

async deleteEquipment(equipmentId) {
  return await this.makeApiCall(`/construction/equipment/${equipmentId}`, {
    method: 'DELETE'
  });
}

// Enhanced document upload with progress
async uploadConstructionDocument(formData) {
  return await this.makeApiCall('/construction/documents/upload', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000
  });
}

// Training reports
async generateTrainingReport(params = {}) {
  return await this.makeApiCall('/construction/training/reports/generate', {
    method: 'POST',
    data: params,
    responseType: 'blob'
  });
}

// Regulatory compliance
async getRegulatoryDeadlines() {
  return await this.makeApiCall('/construction/regulatory/deadlines');
}

async submitOSHAReport(reportData) {
  return await this.makeApiCall('/construction/regulatory/osha/submit', {
    method: 'POST',
    data: reportData
  });
}

// Add to constructionApiService class
async scheduleTraining(trainingData) {
  return await this.makeApiCall('/construction/training/schedule', {
    method: 'POST',
    data: trainingData
  });
}

async getTrainingSchedule() {
  return await this.makeApiCall('/construction/training/schedule');
}

async generateTrainingReport(params) {
  return await this.makeApiCall('/construction/training/reports/generate', {
    method: 'POST',
    data: params,
    responseType: 'blob'
  });
}

async submitEPAReport(reportData) {
  return await this.makeApiCall('/construction/regulatory/epa/submit', {
    method: 'POST',
    data: reportData
  });
} 
  
  async deleteDocument(documentId) {
    return await this.makeApiCall(`/construction/documents/${documentId}`, {
      method: 'DELETE'
    });
  }

  async downloadDocument(documentId) {
    return await this.makeApiCall(`/construction/documents/${documentId}/download`, {
      method: 'GET',
      responseType: 'blob'
    });
  }

  async searchDocuments(query, filters = {}) {
    return await this.makeApiCall('/construction/documents/search', {
      method: 'POST',
      data: { query, filters }
    });
  }

  async getReportTemplates() {
    return await this.makeApiCall('/construction/reporting/templates');
  }

  async downloadTemplate(templateId) {
    return await this.makeApiCall(`/construction/templates/${templateId}/download`, {
      method: 'GET',
      responseType: 'blob'
    });
  }

  // === ENVIRONMENTAL COMPLIANCE ===

  async getEnvironmentalMonitoring() {
    return await this.makeApiCall('/construction/environmental/monitoring');
  }

  async getEnvironmentalCompliance() {
    return await this.makeApiCall('/construction/environmental/compliance');
  }

  async submitEnvironmentalReport(reportData) {
    return await this.makeApiCall('/construction/environmental/reports', {
      method: 'POST',
      data: reportData
    });
  }

  // === SAFETY COMMUNICATION ===

  async getSafetyBulletins() {
    return await this.makeApiCall('/construction/communication/bulletins');
  }

  async publishSafetyAlert(alertData) {
    return await this.makeApiCall('/construction/communication/alerts', {
      method: 'POST',
      data: alertData
    });
  }

  async getSafetySuggestions() {
    return await this.makeApiCall('/construction/communication/suggestions');
  }

  async submitSafetySuggestion(suggestionData) {
    return await this.makeApiCall('/construction/communication/suggestions', {
      method: 'POST',
      data: suggestionData
    });
  }

  async getToolboxTalks() {
    return await this.makeApiCall('/construction/communication/toolbox-talks');
  }

  // === REGULATORY REPORTING ===

  async getReportingRequirements() {
    return await this.makeApiCall('/construction/reporting/requirements');
  }

  async submitRegulatoryReport(reportData) {
    return await this.makeApiCall('/construction/reporting/submit', {
      method: 'POST',
      data: reportData
    });
  }

  // === AI & ANALYTICS SERVICES ===

  async runAISiteAnalysis(siteData) {
    return await this.makeApiCall('/construction/ai/site-analysis', {
      method: 'POST',
      data: siteData
    });
  }

  async predictConstructionHazards(siteParameters) {
    return await this.makeApiCall('/construction/ai/hazard-prediction', {
      method: 'POST',
      data: siteParameters
    });
  }

  async classifySafetyViolations(violationData) {
    return await this.makeApiCall('/construction/ai/violation-classification', {
      method: 'POST',
      data: violationData
    });
  }

  async getAISafetyInsights(siteId = null) {
    const endpoint = siteId ? `/construction/ai/insights/${siteId}` : '/construction/ai/insights';
    return await this.makeApiCall(endpoint);
  }

  async getPredictiveAnalytics() {
    return await this.makeApiCall('/construction/analytics/predictive');
  }

  async getSafetyTrendsAnalysis() {
    return await this.makeApiCall('/construction/analytics/trends');
  }

  async getConstructionAnalytics(timeframe = '30d') {
    return await this.makeApiCall(`/construction/analytics?timeframe=${timeframe}`);
  }

  // === SYSTEM ADMINISTRATION ===

  async getSystemUsers() {
    return await this.makeApiCall('/construction/admin/users');
  }

  async updateSystemSettings(settings) {
    return await this.makeApiCall('/construction/admin/settings', {
      method: 'PUT',
      data: settings
    });
  }

  async getSystemLogs() {
    return await this.makeApiCall('/construction/admin/logs');
  }

  async exportSystemData(format = 'json') {
    return await this.makeApiCall('/construction/admin/export', {
      method: 'POST',
      data: { format },
      responseType: 'blob'
    });
  }

  async backupSystemData() {
    return await this.makeApiCall('/construction/admin/backup', {
      method: 'POST'
    });
  }

  async getSystemHealthDetailed() {
    return await this.makeApiCall('/construction/admin/health-detailed');
  }

  async clearCache() {
    return await this.makeApiCall('/construction/cache/clear', {
      method: 'POST'
    });
  }

  // === INTEGRATION & SYNCHRONIZATION ===

  async syncWithOSHASystems() {
    return await this.makeApiCall('/construction/integration/osha/sync', {
      method: 'POST'
    });
  }

  async syncWithEPASystems() {
    return await this.makeApiCall('/construction/integration/epa/sync', {
      method: 'POST'
    });
  }

  async syncWithRegulatoryAuthorities() {
    return await this.makeApiCall('/construction/sync/regulatory', {
      method: 'POST'
    });
  }

  async syncSafetyData() {
    return await this.makeApiCall('/construction/sync/safety', {
      method: 'POST'
    });
  }

  // === EXPORT & REPORTING ===

  async exportConstructionReport(reportType, params) {
    return await this.makeApiCall('/construction/reports/export', {
      method: 'POST',
      data: { reportType, params },
      responseType: 'blob'
    });
  }

  // === UTILITY & HEALTH CHECKS ===

  async checkServiceHealth() {
    return await this.makeApiCall('/health/construction');
  }

  async getServiceStatus() {
    return await this.makeApiCall('/construction/status');
  }

  // === REAL-TIME MONITORING WITH WEBSOCKETS ===

  initializeRealTimeMonitoring(callbacks) {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/realtime';
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    try {
      const socket = new WebSocket(`${wsUrl}?type=construction&token=${token}`);

      socket.onopen = () => {
        console.log('🏗️ Construction Safety WebSocket connected');
        callbacks.onConnect?.();
      };

      socket.onclose = (event) => {
        console.log('🏗️ Construction Safety WebSocket disconnected:', event.code, event.reason);
        callbacks.onDisconnect?.(event);
        
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          console.log('🔄 Attempting WebSocket reconnection...');
          this.initializeRealTimeMonitoring(callbacks);
        }, 5000);
      };

      socket.onerror = (error) => {
        console.error('🏗️ Construction Safety WebSocket error:', error);
        callbacks.onError?.(error);
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🏗️ WebSocket Message:', data);
          
          switch (data.type) {
            case 'safety_alert':
              callbacks.onSafetyAlert?.(data.payload);
              break;
            case 'risk_update':
              callbacks.onRiskUpdate?.(data.payload);
              break;
            case 'compliance_status':
              callbacks.onComplianceUpdate?.(data.payload);
              break;
            case 'incident_report':
              callbacks.onIncidentReport?.(data.payload);
              break;
            case 'system_health':
              callbacks.onSystemHealthUpdate?.(data.payload);
              break;
            case 'equipment_status':
              callbacks.onEquipmentUpdate?.(data.payload);
              break;
            case 'weather_alert':
              callbacks.onWeatherAlert?.(data.payload);
              break;
            default:
              callbacks.onMessage?.(data);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      return {
        socket,
        send: (type, payload) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type, payload }));
          } else {
            console.warn('WebSocket not connected, cannot send message');
          }
        },
        disconnect: () => {
          socket.close(1000, 'Client disconnected');
        },
        subscribe: (eventType, callback) => {
          const messageHandler = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === eventType) {
                callback(data.payload);
              }
            } catch (error) {
              console.error('Error in subscription handler:', error);
            }
          };
          socket.addEventListener('message', messageHandler);
          
          return () => socket.removeEventListener('message', messageHandler);
        },
        getState: () => socket.readyState
      };
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      callbacks.onError?.(error);
      return null;
    }
  }

  // === BULK OPERATIONS ===

  async bulkUploadSafetyData(data) {
    return await this.makeApiCall('/construction/bulk/upload', {
      method: 'POST',
      data
    });
  }

  async exportSafetyData(format = 'json', filters = {}) {
    return await this.makeApiCall('/construction/export/data', {
      method: 'POST',
      data: { format, filters },
      responseType: 'blob'
    });
  }

  // === CONFIGURATION MANAGEMENT ===

  async getSystemConfiguration() {
    return await this.makeApiCall('/construction/config');
  }

  async updateSystemConfiguration(config) {
    return await this.makeApiCall('/construction/config', {
      method: 'PUT',
      data: config
    });
  }

  // === NOTIFICATION MANAGEMENT ===

  async getSafetyNotifications() {
    return await this.makeApiCall('/construction/notifications');
  }

  async markNotificationRead(notificationId) {
    return await this.makeApiCall(`/construction/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async getNotificationSettings() {
    return await this.makeApiCall('/construction/notifications/settings');
  }

  async updateNotificationSettings(settings) {
    return await this.makeApiCall('/construction/notifications/settings', {
      method: 'PUT',
      data: settings
    });
  }
}

// Create and export singleton instance
const constructionApiService = new ConstructionApiService();
export default constructionApiService;