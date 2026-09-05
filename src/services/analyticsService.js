// src/services/analyticsService.js - COMPLETE WITH ALL METHODS

// Import the shared API instance from api.js
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './api.js';

// Helper function for content type
const getContentType = (format) => {
  const types = {
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf',
    json: 'application/json',
    csv: 'text/csv',
    zip: 'application/zip',
  };
  return types[format] || 'application/octet-stream';
};

// Debug logger
const debug = (tag, ...args) => {
  console.log(`[📊 AnalyticsService:${tag}]`, ...args);
};

// Analytics Service using the shared axios instance
export const analyticsService = {
  // ====================
  // DASHBOARD DATA
  // ====================
  fetchDashboardData: async (timeRange = '30days', filters = {}) => {
    debug('fetchDashboardData', { timeRange, filters });
    return apiGet('/analytics/dashboard', {
      params: { time_range: timeRange, ...filters }
    });
  },

  fetchDashboardStats: async () => {
    debug('fetchDashboardStats');
    return apiGet('/analytics/dashboard/stats');
  },

  fetchDashboardTrends: async (metric, timeRange) => {
    debug('fetchDashboardTrends', { metric, timeRange });
    return apiGet('/analytics/dashboard/trends', {
      params: { metric, time_range: timeRange || '30days' }
    });
  },

  // ====================
  // RISK ASSESSMENT
  // ====================
  fetchRiskAssessment: async (department = null, timeRange = '30days', projectId = null) => {
    const params = { time_range: timeRange };
    if (department) params.department = department;
    if (projectId) params.project_id = projectId;
    debug('fetchRiskAssessment', params);
    return apiGet('/analytics/risk/assessment', { params });
  },

  fetchRiskTrends: async (department, months = 6, projectId = null) => {
    const params = { months };
    if (department) params.department = department;
    if (projectId) params.project_id = projectId;
    debug('fetchRiskTrends', params);
    return apiGet('/analytics/risk/trends', { params });
  },

  fetchRiskDistribution: async (projectId = null) => {
    debug('fetchRiskDistribution', { projectId });
    const params = {};
    if (projectId) params.project_id = projectId;
    return apiGet('/analytics/risk/distribution', { params });
  },

  updateRiskScore: async (departmentId, score, notes = '', projectId = null) => {
    debug('updateRiskScore', { departmentId, score, projectId });
    const data = { score, notes };
    if (projectId) data.project_id = projectId;
    return apiPut(`/analytics/risk/${departmentId}/score`, data);
  },

  // ====================
  // COMPLIANCE SCORES
  // ====================
  fetchComplianceScores: async (department = null, timeRange = '30days', projectId = null) => {
    const params = { time_range: timeRange };
    if (department) params.department = department;
    if (projectId) params.project_id = projectId;
    debug('fetchComplianceScores', params);
    return apiGet('/analytics/compliance/scores', { params });
  },

  fetchComplianceDistribution: async (projectId = null) => {
    debug('fetchComplianceDistribution', { projectId });
    const params = {};
    if (projectId) params.project_id = projectId;
    return apiGet('/analytics/compliance/distribution', { params });
  },

  fetchComplianceTrends: async (department, months = 6, projectId = null) => {
    const params = { months };
    if (department) params.department = department;
    if (projectId) params.project_id = projectId;
    debug('fetchComplianceTrends', params);
    return apiGet('/analytics/compliance/trends', { params });
  },

  updateComplianceScore: async (departmentId, score, evidence = '', projectId = null) => {
    debug('updateComplianceScore', { departmentId, score, projectId });
    const data = { score, evidence };
    if (projectId) data.project_id = projectId;
    return apiPut(`/analytics/compliance/${departmentId}/score`, data);
  },

  // ====================
  // POWER BI SAFETY ANALYTICS
  // ====================
  fetchManpower: async (filters = {}) => {
    debug('fetchManpower', filters);
    return apiGet('/powerbi/manpower', { params: filters });
  },

  createManpower: async (data) => {
    debug('createManpower', data);
    return apiPost('/powerbi/manpower', data);
  },

  updateManpower: async (id, data) => {
    debug('updateManpower', { id, data });
    return apiPut(`/powerbi/manpower/${id}`, data);
  },

  deleteManpower: async (id) => {
    debug('deleteManpower', id);
    return apiDelete(`/powerbi/manpower/${id}`);
  },

  fetchTraining: async (filters = {}) => {
    debug('fetchTraining', filters);
    return apiGet('/powerbi/training', { params: filters });
  },

  createTraining: async (data) => {
    debug('createTraining', data);
    return apiPost('/powerbi/training', data);
  },

  updateTraining: async (id, data) => {
    debug('updateTraining', { id, data });
    return apiPut(`/powerbi/training/${id}`, data);
  },

  deleteTraining: async (id) => {
    debug('deleteTraining', id);
    return apiDelete(`/powerbi/training/${id}`);
  },

  fetchLTI: async (filters = {}) => {
    debug('fetchLTI', filters);
    return apiGet('/powerbi/lti', { params: filters });
  },

  createLTI: async (data) => {
    debug('createLTI', data);
    return apiPost('/powerbi/lti', data);
  },

  updateLTI: async (id, data) => {
    debug('updateLTI', { id, data });
    return apiPut(`/powerbi/lti/${id}`, data);
  },

  deleteLTI: async (id) => {
    debug('deleteLTI', id);
    return apiDelete(`/powerbi/lti/${id}`);
  },

  fetchManHours: async (filters = {}) => {
    debug('fetchManHours', filters);
    return apiGet('/powerbi/man-hours', { params: filters });
  },

  createManHours: async (data) => {
    debug('createManHours', data);
    return apiPost('/powerbi/man-hours', data);
  },

  updateManHours: async (id, data) => {
    debug('updateManHours', { id, data });
    return apiPut(`/powerbi/man-hours/${id}`, data);
  },

  deleteManHours: async (id) => {
    debug('deleteManHours', id);
    return apiDelete(`/powerbi/man-hours/${id}`);
  },

  fetchObservations: async (filters = {}) => {
    debug('fetchObservations', filters);
    return apiGet('/powerbi/observations', { params: filters });
  },

  createObservation: async (data) => {
    debug('createObservation', data);
    return apiPost('/powerbi/observations', data);
  },

  updateObservation: async (id, data) => {
    debug('updateObservation', { id, data });
    return apiPut(`/powerbi/observations/${id}`, data);
  },

  deleteObservation: async (id) => {
    debug('deleteObservation', id);
    return apiDelete(`/powerbi/observations/${id}`);
  },

  fetchAccidents: async (filters = {}) => {
    debug('fetchAccidents', filters);
    return apiGet('/powerbi/accidents', { params: filters });
  },

  createAccident: async (data) => {
    debug('createAccident', data);
    return apiPost('/powerbi/accidents', data);
  },

  updateAccident: async (id, data) => {
    debug('updateAccident', { id, data });
    return apiPut(`/powerbi/accidents/${id}`, data);
  },

  deleteAccident: async (id) => {
    debug('deleteAccident', id);
    return apiDelete(`/powerbi/accidents/${id}`);
  },

  fetchSeverity: async (filters = {}) => {
    debug('fetchSeverity', filters);
    return apiGet('/powerbi/severity', { params: filters });
  },

  createSeverity: async (data) => {
    debug('createSeverity', data);
    return apiPost('/powerbi/severity', data);
  },

  updateSeverity: async (id, data) => {
    debug('updateSeverity', { id, data });
    return apiPut(`/powerbi/severity/${id}`, data);
  },

  deleteSeverity: async (id) => {
    debug('deleteSeverity', id);
    return apiDelete(`/powerbi/severity/${id}`);
  },

  fetchInjuries: async (filters = {}) => {
    debug('fetchInjuries', filters);
    return apiGet('/powerbi/injuries', { params: filters });
  },

  createInjury: async (data) => {
    debug('createInjury', data);
    return apiPost('/powerbi/injuries', data);
  },

  updateInjury: async (id, data) => {
    debug('updateInjury', { id, data });
    return apiPut(`/powerbi/injuries/${id}`, data);
  },

  deleteInjury: async (id) => {
    debug('deleteInjury', id);
    return apiDelete(`/powerbi/injuries/${id}`);
  },

  fetchOverdueReports: async (filters = {}) => {
    debug('fetchOverdueReports', filters);
    return apiGet('/powerbi/overdue-reports', { params: filters });
  },

  createOverdueReport: async (data) => {
    debug('createOverdueReport', data);
    return apiPost('/powerbi/overdue-reports', data);
  },

  updateOverdueReport: async (id, data) => {
    debug('updateOverdueReport', { id, data });
    return apiPut(`/powerbi/overdue-reports/${id}`, data);
  },

  deleteOverdueReport: async (id) => {
    debug('deleteOverdueReport', id);
    return apiDelete(`/powerbi/overdue-reports/${id}`);
  },

  // ====================
  // DEPARTMENTS & PROJECTS
  // ====================
  fetchDepartments: async () => {
    debug('fetchDepartments');
    return apiGet('/powerbi/departments');
  },

  createDepartment: async (data) => {
    debug('createDepartment', data);
    return apiPost('/powerbi/departments', data);
  },

  updateDepartment: async (id, data) => {
    debug('updateDepartment', { id, data });
    return apiPut(`/powerbi/departments/${id}`, data);
  },

  deleteDepartment: async (id) => {
    debug('deleteDepartment', id);
    return apiDelete(`/powerbi/departments/${id}`);
  },

  fetchProjects: async (filters = {}) => {
    debug('fetchProjects', filters);
    return apiGet('/powerbi/projects', { params: filters });
  },

  createProject: async (data) => {
    debug('createProject', data);
    return apiPost('/powerbi/projects', data);
  },

  updateProject: async (id, data) => {
    debug('updateProject', { id, data });
    return apiPut(`/powerbi/projects/${id}`, data);
  },

  deleteProject: async (id) => {
    debug('deleteProject', id);
    return apiDelete(`/powerbi/projects/${id}`);
  },

  getProjectById: async (id) => {
    debug('getProjectById', id);
    return apiGet(`/powerbi/projects/${id}`);
  },

  // ====================
  // DASHBOARD MANAGEMENT
  // ====================
  getSavedDashboards: async () => {
    debug('getSavedDashboards');
    return apiGet('/powerbi/dashboards');
  },

  saveDashboard: async (dashboard) => {
    debug('saveDashboard', dashboard);
    return apiPost('/powerbi/dashboards', dashboard);
  },

  updateDashboard: async (id, data) => {
    debug('updateDashboard', { id, data });
    return apiPut(`/powerbi/dashboards/${id}`, data);
  },

  deleteDashboard: async (dashboardId) => {
    debug('deleteDashboard', dashboardId);
    return apiDelete(`/powerbi/dashboards/${dashboardId}`);
  },

  getDashboardById: async (id) => {
    debug('getDashboardById', id);
    return apiGet(`/powerbi/dashboards/${id}`);
  },

  // ====================
  // METRICS CALCULATION
  // ====================
  calculateMetrics: async (data) => {
    debug('calculateMetrics', { dataKeys: Object.keys(data) });
    
    // Get project_id from data
    const projectId = data.project_id || data.project || null;
    
    // Create a copy of data with project_id included
    const requestData = {
      ...data,
      project_id: projectId
    };
    
    debug('calculateMetrics - sending with project_id:', projectId);
    
    try {
      const response = await apiPost('/powerbi/calculate-metrics', requestData);
      if (response && response.metrics) {
        debug('calculateMetrics - backend success', response.metrics);
        return response.metrics;
      }
    } catch (error) {
      debug('calculateMetrics - backend failed, using client-side fallback', error.message);
    }
    
    // Client-side calculations as fallback
    const totalManpower = data.manpower?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const totalManHours = data.manhours?.reduce((sum, item) => sum + (item.hours || 0), 0) || 0;
    const totalLTIs = data.lti?.length || 0;
    
    const ltifr = totalManHours > 0 ? ((totalLTIs * 1000000) / totalManHours).toFixed(2) : 0;
    const accidentRate = totalManHours > 0 ? ((data.accidents?.length || 0) * 10000 / totalManHours).toFixed(3) : 0;
    const totalTrained = data.training?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const trainingRate = totalManpower > 0 ? ((totalTrained / totalManpower) * 100).toFixed(1) : 0;
    const totalOverdue = data.overdue?.reduce((sum, item) => sum + (item.late || 0), 0) || 0;
    const totalReports = data.overdue?.reduce((sum, item) => sum + (item.on_time || 0) + (item.late || 0), 0) || 0;
    const overdueRate = totalReports > 0 ? ((totalOverdue / totalReports) * 100).toFixed(1) : 0;
    const positiveObs = data.observations?.filter(o => o.type === 'Positive').reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const negativeObs = data.observations?.filter(o => o.type === 'Negative').reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const observationRatio = negativeObs > 0 ? (positiveObs / negativeObs).toFixed(2) : 0;
    const avgSeverity = data.severity?.length > 0 ? (data.severity.reduce((sum, item) => sum + (item.value || 0), 0) / data.severity.length).toFixed(1) : 0;
    const totalInjuries = data.injuries?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    
    // Include incident metrics in fallback
    const totalIncidents = data.incidentStats?.total || data.incidents?.length || 0;
    const activeIncidents = (data.incidentStats?.byStatus?.reported || 0) + (data.incidentStats?.byStatus?.investigating || 0);
    
    return {
      totalManpower,
      totalManHours,
      totalLTIs,
      ltifr: parseFloat(ltifr),
      accidentRate: parseFloat(accidentRate),
      totalTrained,
      trainingRate: parseFloat(trainingRate),
      totalOverdue,
      totalReports,
      overdueRate: parseFloat(overdueRate),
      positiveObs,
      negativeObs,
      observationRatio: parseFloat(observationRatio),
      avgSeverity: parseFloat(avgSeverity),
      totalInjuries,
      totalIncidents,
      activeIncidents
    };
  },

  // ====================
  // EXPORT MANAGEMENT
  // ====================
  
  /**
   * Generate and download export directly
   */
  exportPowerBI: async (exportConfig) => {
    debug('=== exportPowerBI START ===');
    debug('exportConfig:', exportConfig);
    
    try {
      // Import the raw axios instance for blob handling
      const { default: api } = await import('./api.js');
      debug('API instance loaded');
      
      // Validate export config
      if (!exportConfig.widgets || exportConfig.widgets.length === 0) {
        debug('ERROR: No widgets selected');
        throw new Error('No widgets selected for export');
      }
      
      debug('Making POST request to /powerbi/export');
      
      // Make request with blob response type
      const response = await api.post('/powerbi/export', exportConfig, {
        responseType: 'blob',
        timeout: 60000,
      });

      debug('Response received!');
      debug('Response status:', response.status);
      debug('Response headers:', response.headers);
      
      // Check if response is actually JSON (error response)
      const contentType = response.headers['content-type'] || '';
      debug('Content-Type:', contentType);
      
      if (contentType.includes('application/json')) {
        debug('ERROR: Response is JSON, not blob - likely an error');
        const text = await response.data.text();
        debug('Error response body:', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || errorData.message || 'Export failed');
        } catch (parseError) {
          throw new Error(`Export failed: ${text}`);
        }
      }
      
      // Determine correct extension based on format
      const formatMap = {
        'excel': 'xlsx',
        'xlsx': 'xlsx',
        'xls': 'xls',
        'pdf': 'pdf',
        'json': 'json',
        'csv': 'csv',
        'zip': 'zip'
      };
      
      const extension = formatMap[exportConfig.format] || 'xlsx';
      debug('Extension:', extension);
      
      // Get filename from Content-Disposition header
      let filename = `powerbi_export.${extension}`;
      const contentDisposition = response.headers['content-disposition'];
      debug('Content-Disposition:', contentDisposition);
      
      if (contentDisposition) {
        // Try to extract filename from content-disposition
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        debug('Filename match:', match);
        if (match && match[1]) {
          let extractedName = match[1].replace(/['"]/g, '');
          debug('Extracted filename:', extractedName);
          
          // Ensure the filename has the correct extension
          const nameWithoutExt = extractedName.replace(/\.[^/.]+$/, '');
          filename = `${nameWithoutExt}.${extension}`;
          debug('Fixed filename:', filename);
        }
      }
      
      // If still no extension, add it
      if (!filename.includes('.')) {
        filename = `powerbi_export_${Date.now()}.${extension}`;
        debug('Added extension to filename:', filename);
      }

      // Create blob with proper content type
      const blobType = response.headers['content-type'] || getContentType(exportConfig.format);
      debug('Creating blob with type:', blobType);
      
      const blob = new Blob([response.data], {
        type: blobType
      });
      
      debug('Blob created:', {
        size: blob.size,
        type: blob.type,
        filename: filename
      });
      
      // Check if blob has content
      if (blob.size === 0) {
        debug('ERROR: Blob is empty!');
        throw new Error('Export file is empty');
      }
      
      // Trigger download
      debug('Creating download link...');
      const url = window.URL.createObjectURL(blob);
      debug('Object URL created:', url);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      debug('Link created with download filename:', link.download);
      
      // Use requestAnimationFrame for better browser compatibility
      requestAnimationFrame(() => {
        debug('Clicking download link...');
        link.click();
        debug('Download link clicked');
        document.body.removeChild(link);
        debug('Link removed from body');
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          debug('Object URL revoked');
        }, 1000);
      });
      
      debug('=== exportPowerBI SUCCESS ===');
      return { 
        success: true, 
        filename, 
        size: blob.size,
        type: blob.type
      };
    } catch (error) {
      debug('=== exportPowerBI ERROR ===');
      debug('Error:', error);
      throw error;
    }
  },

  /**
   * Generate export (async) - returns export ID for polling
   */
  generateExport: async (exportConfig) => {
    debug('generateExport', exportConfig);
    return apiPost('/powerbi/export', exportConfig);
  },

  /**
   * Get export status by ID
   */
  getExportStatus: async (exportId) => {
    debug('getExportStatus', exportId);
    return apiGet(`/analytics/exports/${exportId}/status`);
  },

  /**
   * Download export by ID (for async exports)
   */
  downloadExport: async (exportId, filename = '') => {
    debug('downloadExport', { exportId, filename });
    try {
      const { default: api } = await import('./api.js');
      
      const response = await api.get(`/analytics/exports/${exportId}/download`, {
        responseType: 'blob'
      });

      debug('Download response:', {
        status: response.status,
        headers: response.headers,
        dataSize: response.data?.size
      });

      let downloadFilename = filename || `export-${exportId}.xlsx`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          downloadFilename = match[1].replace(/['"]/g, '');
        }
      }
      debug('Download filename:', downloadFilename);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, exportId, filename: downloadFilename };
    } catch (error) {
      debug('downloadExport error:', error);
      throw error;
    }
  },

  /**
   * Poll export status until completion
   */
  pollExportStatus: async (exportId, interval = 2000, maxAttempts = 60) => {
    debug('pollExportStatus', { exportId, interval, maxAttempts });
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const poll = async () => {
        try {
          const status = await analyticsService.getExportStatus(exportId);
          attempts++;
          debug('Poll attempt', attempts, 'Status:', status);
          
          if (status.status === 'completed') {
            resolve(status);
            return;
          }
          
          if (status.status === 'failed') {
            reject(new Error(status.error || 'Export failed'));
            return;
          }
          
          if (attempts >= maxAttempts) {
            reject(new Error('Export timeout after maximum attempts'));
            return;
          }
          
          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  },

  /**
   * Get export history
   */
  getExportHistory: async (page = 1, limit = 20, filters = {}) => {
    debug('getExportHistory', { page, limit, filters });
    return apiGet('/analytics/exports/history', {
      params: { page, limit, ...filters }
    });
  },

  /**
   * Delete export
   */
  deleteExport: async (exportId) => {
    debug('deleteExport', exportId);
    return apiDelete(`/analytics/exports/${exportId}`);
  },

  /**
   * Retry failed export
   */
  retryExport: async (exportId) => {
    debug('retryExport', exportId);
    return apiPost(`/analytics/exports/${exportId}/retry`);
  },

  /**
   * Share export with other users
   */
  shareExport: async (exportId, recipients, permissions = 'view') => {
    debug('shareExport', { exportId, recipients, permissions });
    return apiPost(`/analytics/exports/${exportId}/share`, { recipients, permissions });
  },

  /**
   * Batch export (ZIP download for multiple exports)
   */
  batchExport: async (exportIds) => {
    debug('batchExport', exportIds);
    try {
      const { default: api } = await import('./api.js');
      
      const response = await api.post('/analytics/exports/batch', { exportIds }, {
        responseType: 'blob'
      });

      const filename = `batch_exports_${Date.now()}.zip`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, filename };
    } catch (error) {
      debug('batchExport error:', error);
      throw error;
    }
  },

  /**
   * Batch delete exports
   */
  batchDeleteExports: async (exportIds) => {
    debug('batchDeleteExports', exportIds);
    return apiPost('/analytics/exports/batch/delete', { exportIds });
  },

  // ====================
  // AUDIT TRAIL
  // ====================
  fetchAuditLogs: async (page = 1, limit = 50, filters = {}) => {
    debug('fetchAuditLogs', { page, limit, filters });
    return apiGet('/analytics/audit/logs', {
      params: { page, limit, ...filters }
    });
  },

  searchAuditLogs: async (searchTerm, filters = {}) => {
    debug('searchAuditLogs', { searchTerm, filters });
    return apiGet('/analytics/audit/search', {
      params: { q: searchTerm, ...filters }
    });
  },

  getAuditStats: async (timeRange = '30days') => {
    debug('getAuditStats', timeRange);
    return apiGet('/analytics/audit/stats', {
      params: { time_range: timeRange }
    });
  },

  exportAuditLogs: async (format = 'csv', filters = {}) => {
    debug('exportAuditLogs', { format, filters });
    return apiPost('/analytics/audit/export', { format, filters });
  },

  // ====================
  // ANALYTICS PAGE
  // ====================
  fetchPageAnalytics: async (pageName, timeRange = '30days') => {
    debug('fetchPageAnalytics', { pageName, timeRange });
    return apiGet('/analytics/pages/views', {
      params: { page: pageName, time_range: timeRange }
    });
  },

  trackPageView: async (pageName, additionalProps = {}) => {
    debug('trackPageView', { pageName, additionalProps });
    try {
      await apiPost('/analytics/pages/track', {
        page: pageName,
        timestamp: new Date().toISOString(),
        ...additionalProps
      });
    } catch (error) {
      console.debug('Page view tracking failed:', error);
    }
  },

  // ====================
  // REAL-TIME UPDATES
  // ====================
  subscribeToUpdates: (callback, channels = ['dashboard', 'exports']) => {
    debug('subscribeToUpdates', { channels });
    const wsUrl = `${window.location.protocol.replace('http', 'ws')}//${window.location.host}/analytics/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        debug('WebSocket connected');
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        debug('WebSocket closed');
      };
      
      return () => ws.close();
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      return () => {};
    }
  },

  // ====================
  // DATA VALIDATION
  // ====================
  validateExportConfig: (config) => {
    debug('validateExportConfig', config);
    const errors = [];
    
    if (!config.format) {
      errors.push('Export format is required');
    }
    
    if (!config.date_range || !config.date_range.start || !config.date_range.end) {
      errors.push('Date range is required');
    }
    
    if (!config.widgets || config.widgets.length === 0) {
      errors.push('At least one widget must be selected');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateDataEntry: (type, data) => {
    debug('validateDataEntry', { type, data });
    const errors = [];
    
    switch (type) {
      case 'manpower':
        if (!data.section) errors.push('Section is required');
        if (!data.count || data.count < 0) errors.push('Valid count is required');
        break;
      case 'training':
        if (!data.type) errors.push('Training type is required');
        if (!data.count || data.count < 0) errors.push('Valid count is required');
        break;
      case 'lti':
        if (!data.year) errors.push('Year is required');
        if (!data.value || data.value < 0) errors.push('Valid LTI value is required');
        break;
      case 'observations':
        if (!data.type) errors.push('Observation type is required');
        if (!data.count || data.count < 0) errors.push('Valid count is required');
        break;
      case 'manhours':
        if (!data.section) errors.push('Section is required');
        if (!data.hours || data.hours < 0) errors.push('Valid hours is required');
        break;
      case 'accidents':
        if (!data.year) errors.push('Year is required');
        if (!data.rate || data.rate < 0) errors.push('Valid rate is required');
        break;
      case 'severity':
        if (!data.year) errors.push('Year is required');
        if (!data.value || data.value < 0) errors.push('Valid severity value is required');
        break;
      case 'injuries':
        if (!data.body_part) errors.push('Body part is required');
        if (!data.count || data.count < 0) errors.push('Valid count is required');
        break;
      case 'overdue':
        if (!data.month) errors.push('Month is required');
        if (!data.on_time || data.on_time < 0) errors.push('Valid on-time count is required');
        if (!data.late || data.late < 0) errors.push('Valid late count is required');
        break;
      default:
        errors.push(`Unknown data type: ${type}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // ====================
  // CACHE MANAGEMENT
  // ====================
  cache: {
    get: (key) => {
      debug('cache.get', key);
      try {
        const cached = localStorage.getItem(`analytics_cache_${key}`);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        
        if (Date.now() - timestamp > 5 * 60 * 1000) {
          localStorage.removeItem(`analytics_cache_${key}`);
          return null;
        }
        
        return data;
      } catch (error) {
        debug('cache.get error', error);
        return null;
      }
    },
    
    set: (key, data) => {
      debug('cache.set', key);
      try {
        const cacheItem = {
          data,
          timestamp: Date.now()
        };
        localStorage.setItem(`analytics_cache_${key}`, JSON.stringify(cacheItem));
      } catch (error) {
        console.error('Cache set error:', error);
      }
    },
    
    clear: (key = null) => {
      debug('cache.clear', key);
      if (key) {
        localStorage.removeItem(`analytics_cache_${key}`);
      } else {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('analytics_cache_')) {
            localStorage.removeItem(k);
          }
        });
      }
    }
  },

  // ====================
  // UTILITY FUNCTIONS
  // ====================
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDate: (dateString, format = 'short') => {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    if (format === 'short') {
      return date.toLocaleDateString();
    } else if (format === 'long') {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } else if (format === 'relative') {
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
      if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
      if (diff < 604800000) return Math.floor(diff / 86400000) + ' days ago';
      if (diff < 2592000000) return Math.floor(diff / 604800000) + ' weeks ago';
      
      return date.toLocaleDateString();
    }
    
    return date.toISOString();
  },

  formatNumber: (num, decimals = 0) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return new Intl.NumberFormat().format(Number(num));
  },

  formatPercentage: (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) return '0%';
    return `${parseFloat(value).toFixed(decimals)}%`;
  },

  // ====================
  // FALLBACK METHOD FOR BACKEND ISSUES
  // ====================
  fetchWithFallback: async (method, endpoint, data = null) => {
    debug('fetchWithFallback', { method, endpoint, data });
    try {
      switch (method.toLowerCase()) {
        case 'get':
          return await apiGet(endpoint, data || {});
        case 'post':
          return await apiPost(endpoint, data || {});
        case 'put':
          return await apiPut(endpoint, data || {});
        case 'delete':
          return await apiDelete(endpoint, data || {});
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error.message);
      throw error;
    }
  },

  // ====================
  // DEBUG EXPORT - FOR TESTING
  // ====================
  debugExport: async (exportConfig) => {
    debug('=== DEBUG EXPORT ===');
    debug('Config:', exportConfig);
    
    try {
      const { default: api } = await import('./api.js');
      
      const response = await api.post('/powerbi/export', exportConfig, {
        responseType: 'blob',
        timeout: 60000,
      });

      debug('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataType: response.data?.constructor?.name,
        dataSize: response.data?.size
      });

      return response;
    } catch (error) {
      debug('Error:', error);
      throw error;
    }
  },

  // ====================
  // ADDITIONAL HELPER METHODS
  // ====================
  
  /**
   * Get widget data by type
   */
  getWidgetData: async (widgetType, filters = {}) => {
    debug('getWidgetData', { widgetType, filters });
    const methodMap = {
      'manpower': analyticsService.fetchManpower,
      'training': analyticsService.fetchTraining,
      'lti': analyticsService.fetchLTI,
      'manhours': analyticsService.fetchManHours,
      'observations': analyticsService.fetchObservations,
      'accidents': analyticsService.fetchAccidents,
      'severity': analyticsService.fetchSeverity,
      'injuries': analyticsService.fetchInjuries,
      'overdue': analyticsService.fetchOverdueReports,
    };
    
    const method = methodMap[widgetType];
    if (!method) {
      debug('getWidgetData - unknown widget type:', widgetType);
      return { data: [] };
    }
    
    return method(filters);
  },

  /**
   * Get all widget data in one call
   */
  getAllWidgetData: async (filters = {}) => {
    debug('getAllWidgetData', filters);
    const widgetTypes = ['manpower', 'training', 'lti', 'manhours', 'observations', 'accidents', 'severity', 'injuries', 'overdue'];
    const results = {};
    
    await Promise.all(widgetTypes.map(async (type) => {
      try {
        const response = await analyticsService.getWidgetData(type, filters);
        results[type] = response.data || response || [];
      } catch (error) {
        debug(`getAllWidgetData - error for ${type}:`, error);
        results[type] = [];
      }
    }));
    
    return results;
  },

  /**
   * Export data to CSV
   */
  exportToCSV: (data, filename = 'export.csv') => {
    debug('exportToCSV', { filename, dataLength: data?.length });
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  },

  /**
   * Export data to JSON
   */
  exportToJSON: (data, filename = 'export.json') => {
    debug('exportToJSON', { filename, dataLength: data?.length });
    if (!data) {
      throw new Error('No data to export');
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  }
};

// Export for both named and default export
export default analyticsService;