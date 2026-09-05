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

// Create the service instance first to use in interceptors
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

    this.setupInterceptors();
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
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Enhanced response interceptor with comprehensive error handling
    apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        // Enhanced retry logic for construction safety critical systems
        if (this.shouldRetry(error) && !originalRequest._retry) {
          originalRequest._retry = true;
          await this.delay(1000 * this.retryCount);
          return apiClient(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }

  shouldRetry(error) {
    const retryableCodes = ['NETWORK_ERROR', 'ECONNABORTED'];
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    
    return retryableCodes.includes(error.code) || 
           retryableStatuses.includes(error.response?.status);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleConstructionError(error) {
    // Construction-specific error handling
    if (error.code === 'NETWORK_ERROR') {
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
        503: { message: 'Construction safety service temporarily unavailable', severity: 'High' }
      };

      const errorInfo = errorMap[status] || { message, severity: 'Medium' };

      return {
        success: false,
        error: errorInfo.message,
        code: `CONSTRUCTION_HTTP_${status}`,
        status,
        retryable: status >= 500,
        severity: errorInfo.severity
      };
    }

    return {
      success: false,
      error: 'Critical construction safety system error',
      code: 'CONSTRUCTION_SYSTEM_FAILURE',
      retryable: false,
      severity: 'Critical'
    };
  }

  // Enhanced API call with construction-specific error handling
  async makeApiCall(endpoint, options = {}) {
    try {
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
      console.error(`Construction API Error for ${endpoint}:`, error);

      if (this.shouldRetry(error) && this.retryCount < this.maxRetries) {
        this.retryCount++;
        await this.delay(1000 * this.retryCount);
        return this.makeApiCall(endpoint, options);
      }

      return this.handleConstructionError(error);
    }
  }

  // === DASHBOARD & REAL-TIME DATA ===

  async getRealTimeMetrics() {
    return await this.makeApiCall('/construction/dashboard/metrics');
  }

  async getSystemHealth() {
    return await this.makeApiCall('/construction/system/health');
  }

  async getSystemHealthDetailed() {
    return await this.makeApiCall('/construction/system/health');
  }

  async getOperationalStatus() {
    return await this.makeApiCall('/construction/operations/status');
  }

  // === COMPLIANCE MANAGEMENT ===

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

  // === SAFETY MANAGEMENT ===

  async getSafetyStatus() {
    return await this.makeApiCall('/construction/safety/status');
  }

  async updateSafetyPolicy(policyData) {
    return await this.makeApiCall('/construction/safety/policy', {
      method: 'PUT',
      data: policyData
    });
  }

  async getSafetyObjectives() {
    return await this.makeApiCall('/construction/safety/objectives');
  }

  async updateSafetyObjectives(objectives) {
    return await this.makeApiCall('/construction/safety/objectives', {
      method: 'PUT',
      data: objectives
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

  async conductRootCauseAnalysis(incidentId) {
    return await this.makeApiCall(`/construction/incidents/${incidentId}/analysis`, {
      method: 'POST'
    });
  }

  async updateIncidentStatus(incidentId, status) {
    return await this.makeApiCall(`/construction/incidents/${incidentId}/status`, {
      method: 'PUT',
      data: { status }
    });
  }

  async getIncidentStatistics() {
    return await this.makeApiCall('/construction/incidents/statistics');
  }

  // === SAFETY ASSURANCE ===

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

  // === TRAINING & CERTIFICATION ===

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

  // === DOCUMENT MANAGEMENT ===

  async getConstructionDocuments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.makeApiCall(`/construction/documents?${queryString}`);
  }

  async uploadConstructionDocument(formData) {
    return await this.makeApiCall('/construction/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
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

  // === REPORTING TEMPLATES ===

  async getReportTemplates() {
    return await this.makeApiCall('/construction/reporting/templates');
  }

  async downloadTemplate(templateId) {
    return await this.makeApiCall(`/construction/templates/${templateId}/download`, {
      method: 'GET',
      responseType: 'blob'
    });
  }

  // === AI SERVICES ===

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

  async simulateEmergencyScenario(scenario) {
    return await this.makeApiCall('/construction/ai/emergency-simulation', {
      method: 'POST',
      data: scenario
    });
  }

  async getAISafetyInsights(siteId) {
    if (siteId) {
      return await this.makeApiCall(`/construction/ai/insights/${siteId}`);
    }
    return await this.makeApiCall('/construction/analytics/ai-insights');
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

  // === SAFETY ANALYTICS ===

  async getPredictiveAnalytics() {
    return await this.makeApiCall('/construction/analytics/predictive');
  }

  async getSafetyTrendsAnalysis() {
    return await this.makeApiCall('/construction/analytics/trends');
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

  async getConstructionAnalytics(timeframe = '30d') {
    return await this.makeApiCall(`/construction/analytics?timeframe=${timeframe}`);
  }

  async exportConstructionReport(reportType, params) {
    return await this.makeApiCall('/construction/reports/export', {
      method: 'POST',
      data: { reportType, params },
      responseType: 'blob'
    });
  }

  // === INSPECTIONS ===

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

  // === DATA MANAGEMENT ===

  async backupSystemData() {
    return await this.makeApiCall('/construction/admin/backup', {
      method: 'POST'
    });
  }

  // === INTEGRATION METHODS ===

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

  // === BATCH OPERATIONS ===

  async batchUpdateTraining(trainingUpdates) {
    return await this.makeApiCall('/construction/training/batch', {
      method: 'PUT',
      data: trainingUpdates
    });
  }

  async batchProcessIncidents(incidentUpdates) {
    return await this.makeApiCall('/construction/incidents/batch', {
      method: 'PUT',
      data: incidentUpdates
    });
  }

  async batchRiskAssessments(assessments) {
    return await this.makeApiCall('/construction/risk/batch', {
      method: 'POST',
      data: { assessments }
    });
  }

  async batchIncidentReports(incidents) {
    return await this.makeApiCall('/construction/incidents/batch', {
      method: 'POST',
      data: { incidents }
    });
  }

  // === REAL-TIME MONITORING WITH WEBSOCKETS ===

  initializeRealTimeMonitoring(callbacks) {
    const wsUrl = process.env.REACT_APP_WS_URL || 'wss://api/realtime';
    const socket = new WebSocket(`${wsUrl}?type=construction&token=${localStorage.getItem('authToken')}`);

    socket.onopen = () => {
      callbacks.onConnect?.();
      console.log('Construction Safety WebSocket connected');
    };

    socket.onclose = () => {
      callbacks.onDisconnect?.();
      console.log('Construction Safety WebSocket disconnected');
    };

    socket.onerror = (error) => {
      callbacks.onError?.(error);
      console.error('Construction Safety WebSocket error:', error);
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
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
          default:
            callbacks.onMessage?.(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return {
      socket,
      send: (type, payload) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type, payload }));
        }
      },
      disconnect: () => socket.close(),
      subscribe: (event, callback) => {
        const messageHandler = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === event) {
            callback(data.payload);
          }
        };
        socket.addEventListener('message', messageHandler);
        
        return () => socket.removeEventListener('message', messageHandler);
      }
    };
  }

  // === UTILITY METHODS ===

  async checkServiceHealth() {
    return await this.makeApiCall('/health/construction');
  }

  async getServiceStatus() {
    return await this.makeApiCall('/construction/status');
  }

  async clearCache() {
    return await this.makeApiCall('/construction/cache/clear', {
      method: 'POST'
    });
  }
}

// Create and export singleton instance
const constructionApiService = new ConstructionApiService();
export default constructionApiService;