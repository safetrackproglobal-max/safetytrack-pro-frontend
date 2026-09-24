// src/services/notificationService.js - COMPLETE WITH ALL NEW FEATURES
import api from './api';

class NotificationService {
  // ==================== INCIDENT REPORTING ====================
  
  // Report a new safety incident
  async reportIncident(incidentData) {
    try {
      const response = await api.post('/incidents/report', {
        ...incidentData,
        reportedAt: new Date().toISOString(),
        status: 'reported'
      });
      
      if (response.data.success) {
        await this.notifyNewIncident(response.data.incident);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to report incident');
    }
  }

  // Get all incidents with filters
  async getIncidents(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          if (Array.isArray(filters[key])) {
            filters[key].forEach(value => params.append(`${key}[]`, value));
          } else {
            params.append(key, filters[key]);
          }
        }
      });

      const response = await api.get(`/incidents?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch incidents');
    }
  }

  // Get filtered incidents (for Custom Report Builder)
  async getFilteredIncidents(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          if (Array.isArray(filters[key])) {
            filters[key].forEach(value => params.append(`${key}[]`, value));
          } else {
            params.append(key, filters[key]);
          }
        }
      });

      const response = await api.get(`/incidents/filtered?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Filtered incidents error:', error);
      // Fallback to regular getIncidents
      return this.getIncidents(filters);
    }
  }

  // Get single incident by ID
  async getIncidentById(id) {
    try {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch incident');
    }
  }

  // ==================== INCIDENT CRUD OPERATIONS ====================

  // Update entire incident
  async updateIncident(id, incidentData) {
    try {
      const response = await api.put(`/incidents/${id}`, {
        ...incidentData,
        updatedAt: new Date().toISOString(),
        updatedBy: localStorage.getItem('userId')
      });
      
      if (response.data.success) {
        await this.logIncidentChange(id, {
          action: 'updated',
          changes: incidentData,
          updatedBy: localStorage.getItem('userId'),
          timestamp: new Date().toISOString()
        });
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update incident');
    }
  }

  // Partial update incident
  async patchIncident(id, updates) {
    try {
      const response = await api.patch(`/incidents/${id}`, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update incident');
    }
  }

  // Delete incident
  async deleteIncident(id) {
    try {
      const response = await api.delete(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete incident');
    }
  }

  // Update incident status
  async updateIncidentStatus(id, status, notes = '') {
    try {
      let statusData;
      if (typeof status === 'object') {
        const statusValue = status.status || status;
        statusData = {
          status: statusValue,
          notes: status.notes || notes || '',
          updatedBy: status.updatedBy || localStorage.getItem('userId'),
          updatedAt: status.updatedAt || new Date().toISOString()
        };
      } else {
        statusData = {
          status: status,
          notes: notes || '',
          updatedBy: localStorage.getItem('userId'),
          updatedAt: new Date().toISOString()
        };
      }

      if (typeof statusData.status === 'object') {
        statusData.status = statusData.status.status || statusData.status;
      }

      const response = await api.put(`/incidents/${id}/status`, statusData);
      
      if (response.data.success) {
        await this.notifyIncidentStatusChange(id, statusData.status, statusData.notes);
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        throw new Error(JSON.stringify({
          message: errorData.error || 'Failed to update incident status',
          code: errorData.code,
          suggestion: errorData.suggestion,
          current_status: errorData.current_status,
          requested_status: errorData.requested_status
        }));
      }
      throw new Error(error.response?.data?.message || 'Failed to update incident status');
    }
  }

  // Assign investigator to incident
  async assignInvestigator(id, investigatorId) {
    try {
      const response = await api.put(`/incidents/${id}/assign`, {
        investigatorId,
        assignedBy: localStorage.getItem('userId'),
        assignedAt: new Date().toISOString()
      });
      
      if (response.data.success) {
        await this.notifyInvestigatorAssignment(id, investigatorId);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign investigator');
    }
  }

  // Add investigation notes
  async addInvestigationNotes(id, notes) {
    try {
      const response = await api.post(`/incidents/${id}/investigation-notes`, {
        notes,
        addedBy: localStorage.getItem('userId'),
        addedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add investigation notes');
    }
  }

  // ==================== FISHBONE ANALYSIS ====================

  // Save fishbone analysis
  async saveFishboneAnalysis(incidentId, fishboneData) {
    try {
      const response = await api.post(`/incidents/${incidentId}/fishbone`, {
        ...fishboneData,
        savedBy: localStorage.getItem('userId'),
        savedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save fishbone analysis');
    }
  }

  // Get fishbone analysis
  async getFishboneAnalysis(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/fishbone`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch fishbone analysis:', error);
      return { success: false, data: null };
    }
  }

  // Update fishbone cause
  async updateFishboneCause(incidentId, categoryId, causeId, causeData) {
    try {
      const response = await api.put(
        `/incidents/${incidentId}/fishbone/categories/${categoryId}/causes/${causeId}`,
        causeData
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update cause');
    }
  }

  // Delete fishbone cause
  async deleteFishboneCause(incidentId, categoryId, causeId) {
    try {
      const response = await api.delete(
        `/incidents/${incidentId}/fishbone/categories/${categoryId}/causes/${causeId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete cause');
    }
  }

  // Export fishbone as image
  async exportFishbone(incidentId, format = 'svg') {
    try {
      const response = await api.get(`/incidents/${incidentId}/fishbone/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export fishbone');
    }
  }

  // ==================== AI INVESTIGATION ASSISTANT ====================

  // Generate AI analysis
  async generateAIAnalysis(incidentId, options = {}) {
    try {
      const response = await api.post(`/incidents/${incidentId}/ai-analysis`, {
        ...options,
        requestedBy: localStorage.getItem('userId'),
        requestedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate AI analysis');
    }
  }

  // Get AI analysis history
  async getAIAnalysisHistory(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/ai-analysis/history`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch AI analysis history');
    }
  }

  // Save AI analysis
  async saveAIAnalysis(incidentId, analysisData) {
    try {
      const response = await api.post(`/incidents/${incidentId}/ai-analysis/save`, {
        ...analysisData,
        savedBy: localStorage.getItem('userId'),
        savedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save AI analysis');
    }
  }

  // Ask AI a question
  async askAIInvestigation(incidentId, question, context = {}) {
    try {
      const response = await api.post(`/incidents/${incidentId}/ai-analysis/ask`, {
        question,
        context,
        askedBy: localStorage.getItem('userId'),
        askedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to ask AI');
    }
  }

  // Get AI-suggested corrective actions
  async getAICorrectiveActions(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/ai-analysis/corrective-actions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch AI corrective actions');
    }
  }

  // Generate AI investigation report
  async generateAIInvestigationReport(incidentId, reportType = 'full') {
    try {
      const response = await api.post(`/incidents/${incidentId}/ai-analysis/generate-report`, {
        reportType,
        generatedBy: localStorage.getItem('userId'),
        generatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate AI report');
    }
  }

  // ==================== INCIDENT TIMELINE ====================

  // Get incident timeline
  async getIncidentTimeline(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/timeline`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch timeline');
    }
  }

  // Add timeline event
  async addTimelineEvent(incidentId, eventData) {
    try {
      const response = await api.post(`/incidents/${incidentId}/timeline`, {
        ...eventData,
        createdBy: localStorage.getItem('userId'),
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add timeline event');
    }
  }

  // Update timeline event
  async updateTimelineEvent(incidentId, eventId, eventData) {
    try {
      const response = await api.put(`/incidents/${incidentId}/timeline/${eventId}`, {
        ...eventData,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update timeline event');
    }
  }

  // Delete timeline event
  async deleteTimelineEvent(incidentId, eventId) {
    try {
      const response = await api.delete(`/incidents/${incidentId}/timeline/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete timeline event');
    }
  }

  // ==================== CORRECTIVE ACTIONS ====================

  // Get corrective actions for incident
  async getCorrectiveActions(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/corrective-actions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch corrective actions');
    }
  }

  // Create corrective action
  async createCorrectiveAction(incidentId, actionData) {
    try {
      const response = await api.post(`/incidents/${incidentId}/corrective-actions`, {
        ...actionData,
        createdBy: localStorage.getItem('userId'),
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create corrective action');
    }
  }

  // Update corrective action
  async updateCorrectiveAction(actionId, actionData) {
    try {
      const response = await api.put(`/corrective-actions/${actionId}`, {
        ...actionData,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update corrective action');
    }
  }

  // Delete corrective action
  async deleteCorrectiveAction(actionId) {
    try {
      const response = await api.delete(`/corrective-actions/${actionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete corrective action');
    }
  }

  // Update corrective action status
  async updateCorrectiveActionStatus(actionId, status, notes = '') {
    try {
      const response = await api.put(`/corrective-actions/${actionId}/status`, {
        status,
        notes,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update corrective action status');
    }
  }

  // Verify corrective action completion
  async verifyCorrectiveAction(actionId, verificationData) {
    try {
      const response = await api.post(`/corrective-actions/${actionId}/verify`, {
        ...verificationData,
        verifiedBy: localStorage.getItem('userId'),
        verifiedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify corrective action');
    }
  }

  // Get overdue corrective actions
  async getOverdueCorrectiveActions() {
    try {
      const response = await api.get('/corrective-actions/overdue');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch overdue actions');
    }
  }

  // ==================== COMMENTS / DISCUSSION ====================

  // Get comments for incident
  async getIncidentComments(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/comments`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
  }

  // Add comment to incident
  async addIncidentComment(incidentId, commentData) {
    try {
      const response = await api.post(`/incidents/${incidentId}/comments`, {
        ...commentData,
        authorId: localStorage.getItem('userId'),
        authorName: localStorage.getItem('userName'),
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add comment');
    }
  }

  // Update comment
  async updateIncidentComment(incidentId, commentId, commentData) {
    try {
      const response = await api.put(`/incidents/${incidentId}/comments/${commentId}`, {
        ...commentData,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update comment');
    }
  }

  // Delete comment
  async deleteIncidentComment(incidentId, commentId) {
    try {
      const response = await api.delete(`/incidents/${incidentId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete comment');
    }
  }

  // ==================== WITNESS STATEMENTS ====================

  // Get witness statements for incident
  async getWitnessStatements(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/witness-statements`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch witness statements');
    }
  }

  // Create witness statement
  async createWitnessStatement(incidentId, statementData) {
    try {
      const response = await api.post(`/incidents/${incidentId}/witness-statements`, {
        ...statementData,
        recordedBy: localStorage.getItem('userId'),
        recordedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create witness statement');
    }
  }

  // Update witness statement
  async updateWitnessStatement(statementId, statementData) {
    try {
      const response = await api.put(`/witness-statements/${statementId}`, {
        ...statementData,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update witness statement');
    }
  }

  // Delete witness statement
  async deleteWitnessStatement(statementId) {
    try {
      const response = await api.delete(`/witness-statements/${statementId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete witness statement');
    }
  }

  // ==================== INVESTIGATION TEAM ====================

  // Get investigation team
  async getInvestigationTeam(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/investigation-team`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch investigation team');
    }
  }

  // Add team member
  async addInvestigationTeamMember(incidentId, memberData) {
    try {
      const response = await api.post(`/incidents/${incidentId}/investigation-team`, {
        ...memberData,
        addedBy: localStorage.getItem('userId'),
        addedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add team member');
    }
  }

  // Remove team member
  async removeInvestigationTeamMember(incidentId, memberId) {
    try {
      const response = await api.delete(`/incidents/${incidentId}/investigation-team/${memberId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove team member');
    }
  }

  // ==================== AUDIT TRAIL ====================

  // Log incident change
  async logIncidentChange(incidentId, changeData) {
    try {
      const response = await api.post(`/incidents/${incidentId}/audit-log`, {
        ...changeData,
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName'),
        timestamp: new Date().toISOString(),
        ipAddress: 'client'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to log change:', error);
      return { success: false };
    }
  }

  // Get audit trail for incident
  async getAuditTrail(incidentId, filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/incidents/${incidentId}/audit-log?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch audit trail');
    }
  }

  // Export audit trail
  async exportAuditTrail(incidentId, format = 'csv') {
    try {
      const response = await api.get(`/incidents/${incidentId}/audit-log/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export audit trail');
    }
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  // Get predictive analytics
  async getPredictiveAnalytics(params = {}) {
    try {
      const response = await api.post('/analytics/predictive', {
        ...params,
        requestedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch predictions');
    }
  }

  // Get risk factors
  async getRiskFactors(params = {}) {
    try {
      const response = await api.get('/analytics/risk-factors', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch risk factors');
    }
  }

  // Get AI insights
  async getAnalyticsInsights(params = {}) {
    try {
      const response = await api.get('/analytics/insights', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch insights');
    }
  }

  // Save prediction snapshot
  async savePredictionSnapshot(predictionData) {
    try {
      const response = await api.post('/analytics/predictions/save', {
        ...predictionData,
        savedBy: localStorage.getItem('userId'),
        savedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save prediction');
    }
  }

  // Get prediction history
  async getPredictionHistory(params = {}) {
    try {
      const response = await api.get('/analytics/predictions/history', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch prediction history');
    }
  }

  // ==================== SIMILAR INCIDENT DETECTION ====================

  // Find similar incidents
  async findSimilarIncidents(incidentId, options = {}) {
    try {
      const response = await api.post(`/incidents/${incidentId}/similar`, {
        threshold: options.threshold || 60,
        matchField: options.matchField || 'all',
        limit: options.limit || 20
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to find similar incidents');
    }
  }

  // Link incidents
  async linkIncidents(incidentId, linkedIncidentIds, linkType = 'related') {
    try {
      const response = await api.post(`/incidents/${incidentId}/link`, {
        linkedIncidentIds,
        linkType,
        linkedBy: localStorage.getItem('userId'),
        linkedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to link incidents');
    }
  }

  // Unlink incidents
  async unlinkIncidents(incidentId, linkedIncidentId) {
    try {
      const response = await api.delete(`/incidents/${incidentId}/link/${linkedIncidentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unlink incidents');
    }
  }

  // Get linked incidents
  async getLinkedIncidents(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/linked`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch linked incidents');
    }
  }

  // ==================== COST ANALYSIS ====================

  // Get cost analysis for incident
  async getIncidentCosts(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/costs`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch incident costs');
    }
  }

  // Update incident costs
  async updateIncidentCosts(incidentId, costData) {
    try {
      const response = await api.put(`/incidents/${incidentId}/costs`, {
        ...costData,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update incident costs');
    }
  }

  // Get cost analysis summary
  async getCostAnalysisSummary(params = {}) {
    try {
      const response = await api.get('/analytics/costs/summary', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cost summary');
    }
  }

  // Get cost breakdown by category
  async getCostBreakdown(params = {}) {
    try {
      const response = await api.get('/analytics/costs/breakdown', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cost breakdown');
    }
  }

  // Get cost trends
  async getCostTrends(params = {}) {
    try {
      const response = await api.get('/analytics/costs/trends', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cost trends');
    }
  }

  // Calculate ROI
  async calculateSafetyROI(params = {}) {
    try {
      const response = await api.post('/analytics/costs/roi', params);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to calculate ROI');
    }
  }

  // Export cost report
  async exportCostReport(params = {}, format = 'pdf') {
    try {
      const response = await api.post('/analytics/costs/export', {
        ...params,
        format
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export cost report');
    }
  }

  // ==================== REGULATORY REPORTING ====================

  // Get reportable incidents
  async getReportableIncidents(agency, params = {}) {
    try {
      const response = await api.get(`/regulatory/${agency}/reportable`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reportable incidents');
    }
  }

  // Generate regulatory report
  async generateRegulatoryReport(agency, formId, incidentId) {
    try {
      const response = await api.post(`/regulatory/${agency}/generate`, {
        formId,
        incidentId,
        generatedBy: localStorage.getItem('userId'),
        generatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  }

  // Submit regulatory report
  async submitRegulatoryReport(agency, reportData) {
    try {
      const response = await api.post(`/regulatory/${agency}/submit`, {
        ...reportData,
        submittedBy: localStorage.getItem('userId'),
        submittedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit report');
    }
  }

  // Get regulatory filing history
  async getRegulatoryFilingHistory(agency, params = {}) {
    try {
      const response = await api.get(`/regulatory/${agency}/history`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch filing history');
    }
  }

  // Get regulatory deadlines
  async getRegulatoryDeadlines(params = {}) {
    try {
      const response = await api.get('/regulatory/deadlines', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch deadlines');
    }
  }

  // Download regulatory form
  async downloadRegulatoryForm(agency, formId, incidentId) {
    try {
      const response = await api.get(
        `/regulatory/${agency}/forms/${formId}/download?incidentId=${incidentId}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download form');
    }
  }

  // ==================== ESCALATION MATRIX ====================

  // Get escalation rules
  async getEscalationRules(params = {}) {
    try {
      const response = await api.get('/escalation/rules', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch escalation rules');
    }
  }

  // Create escalation rule
  async createEscalationRule(ruleData) {
    try {
      const response = await api.post('/escalation/rules', {
        ...ruleData,
        createdBy: localStorage.getItem('userId'),
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create escalation rule');
    }
  }

  // Update escalation rule
  async updateEscalationRule(ruleId, ruleData) {
    try {
      const response = await api.put(`/escalation/rules/${ruleId}`, {
        ...ruleData,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update escalation rule');
    }
  }

  // Delete escalation rule
  async deleteEscalationRule(ruleId) {
    try {
      const response = await api.delete(`/escalation/rules/${ruleId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete escalation rule');
    }
  }

  // Toggle escalation rule
  async toggleEscalationRule(ruleId, enabled) {
    try {
      const response = await api.patch(`/escalation/rules/${ruleId}`, { enabled });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to toggle rule');
    }
  }

  // Get pending escalations
  async getPendingEscalations() {
    try {
      const response = await api.get('/escalation/pending');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending escalations');
    }
  }

  // Execute escalation
  async executeEscalation(incidentId, ruleId) {
    try {
      const response = await api.post('/escalation/execute', {
        incidentId,
        ruleId,
        executedBy: localStorage.getItem('userId'),
        executedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to execute escalation');
    }
  }

  // Get escalation history
  async getEscalationHistory(params = {}) {
    try {
      const response = await api.get('/escalation/history', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch escalation history');
    }
  }

  // Test escalation rule
  async testEscalationRule(ruleId) {
    try {
      const response = await api.post(`/escalation/rules/${ruleId}/test`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to test rule');
    }
  }

  // ==================== SAFETY OBSERVATIONS ====================

  // Get safety observations
  async getSafetyObservations(params = {}) {
    try {
      const response = await api.get('/safety-observations', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch observations');
    }
  }

  // Get single safety observation
  async getSafetyObservationById(id) {
    try {
      const response = await api.get(`/safety-observations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch observation');
    }
  }

  // Create safety observation
  async createSafetyObservation(observationData) {
    try {
      const response = await api.post('/safety-observations', {
        ...observationData,
        observerId: localStorage.getItem('userId'),
        observerName: localStorage.getItem('userName'),
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create observation');
    }
  }

  // Update safety observation
  async updateSafetyObservation(id, observationData) {
    try {
      const response = await api.put(`/safety-observations/${id}`, {
        ...observationData,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update observation');
    }
  }

  // Delete safety observation
  async deleteSafetyObservation(id) {
    try {
      const response = await api.delete(`/safety-observations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete observation');
    }
  }

  // Update observation status
  async updateObservationStatus(id, status, notes = '') {
    try {
      const response = await api.put(`/safety-observations/${id}/status`, {
        status,
        notes,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update status');
    }
  }

  // Get observation statistics
  async getObservationStats(params = {}) {
    try {
      const response = await api.get('/safety-observations/stats', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stats');
    }
  }

  // Get observation leaderboard
  async getObservationLeaderboard(params = {}) {
    try {
      const response = await api.get('/safety-observations/leaderboard', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }

  // Award recognition points
  async awardRecognitionPoints(observationId, points, recipientId) {
    try {
      const response = await api.post(`/safety-observations/${observationId}/award`, {
        points,
        recipientId,
        awardedBy: localStorage.getItem('userId'),
        awardedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to award points');
    }
  }

  // Export observations
  async exportObservations(params = {}, format = 'excel') {
    try {
      const response = await api.post('/safety-observations/export', {
        ...params,
        format
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export observations');
    }
  }

  // ==================== LESSONS LEARNED ====================

  // Get lessons learned
  async getLessonsLearned(params = {}) {
    try {
      const response = await api.get('/lessons-learned', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lessons');
    }
  }

  // Get single lesson
  async getLessonById(id) {
    try {
      const response = await api.get(`/lessons-learned/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lesson');
    }
  }

  // Create lesson learned
  async createLessonLearned(lessonData) {
    try {
      const response = await api.post('/lessons-learned', {
        ...lessonData,
        authorId: localStorage.getItem('userId'),
        authorName: localStorage.getItem('userName'),
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create lesson');
    }
  }

  // Update lesson learned
  async updateLessonLearned(id, lessonData) {
    try {
      const response = await api.put(`/lessons-learned/${id}`, {
        ...lessonData,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update lesson');
    }
  }

  // Delete lesson learned
  async deleteLessonLearned(id) {
    try {
      const response = await api.delete(`/lessons-learned/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete lesson');
    }
  }

  // Publish lesson
  async publishLesson(id) {
    try {
      const response = await api.post(`/lessons-learned/${id}/publish`, {
        publishedBy: localStorage.getItem('userId'),
        publishedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to publish lesson');
    }
  }

  // React to lesson
  async reactToLesson(id, reactionType) {
    try {
      const response = await api.post(`/lessons-learned/${id}/react`, {
        reactionType,
        userId: localStorage.getItem('userId'),
        reactedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to react to lesson');
    }
  }

  // Share lesson
  async shareLesson(id, recipients = []) {
    try {
      const response = await api.post(`/lessons-learned/${id}/share`, {
        recipients,
        sharedBy: localStorage.getItem('userId'),
        sharedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to share lesson');
    }
  }

  // Get lesson statistics
  async getLessonStats(params = {}) {
    try {
      const response = await api.get('/lessons-learned/stats', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lesson stats');
    }
  }

  // Get popular lessons
  async getPopularLessons(params = {}) {
    try {
      const response = await api.get('/lessons-learned/popular', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular lessons');
    }
  }

  // Search lessons
  async searchLessons(query, params = {}) {
    try {
      const response = await api.get('/lessons-learned/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search lessons');
    }
  }

  // Get lessons by incident
  async getLessonsByIncident(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/lessons-learned`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lessons for incident');
    }
  }

  // ==================== EVIDENCE MANAGEMENT ====================
  
  async uploadEvidence(incidentId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('incidentId', incidentId);

      const response = await api.post(`/incidents/${incidentId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload evidence');
    }
  }

  async getAttachments(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/attachments`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch attachments');
    }
  }

  async deleteAttachment(attachmentId) {
    try {
      const response = await api.delete(`/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete attachment');
    }
  }

  async downloadAttachment(attachmentId) {
    try {
      const response = await api.get(`/attachments/${attachmentId}/download`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to download attachment');
    }
  }

  // ==================== STATISTICS & EXPORTS ====================

  async getIncidentStats(timeRange = 'month') {
    try {
      const response = await api.get(`/incidents/stats?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch incident statistics');
    }
  }

  async exportIncidents(filters = {}) {
    try {
      const response = await api.post('/incidents/export', filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export incidents');
    }
  }

  // Dashboard statistics
  async getDashboardStats(params = {}) {
    try {
      const response = await api.get('/dashboard/stats', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }

  // Get KPI metrics
  async getKPIMetrics(params = {}) {
    try {
      const response = await api.get('/analytics/kpi', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch KPI metrics');
    }
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      
      if (response.data && response.data.success) {
        const notifications = response.data.notifications.map(notification => ({
          ...notification,
          read: notification.is_read !== undefined ? notification.is_read : false,
          date: notification.created_at || notification.date,
          type: notification.type || 'info',
          priority: notification.priority || 'medium',
          category: notification.category || 'system',
          is_read: notification.is_read
        }));
        return notifications;
      } else if (Array.isArray(response.data)) {
        return response.data.map(notification => ({
          ...notification,
          read: notification.is_read !== undefined ? notification.is_read : false,
          date: notification.created_at || notification.date,
          is_read: notification.is_read
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async markAllRead() {
    try {
      const response = await api.post('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getNotificationPreferences(userId) {
    try {
      const response = await api.get(`/notifications/preferences/${userId}`);
      return response.data;
    } catch (error) {
      return {
        email: true,
        push: true,
        sms: false,
        incidentAlerts: true,
        statusUpdates: true,
        dailyDigest: false
      };
    }
  }

  async updateNotificationPreferences(userId, preferences) {
    try {
      const response = await api.put(`/notifications/preferences/${userId}`, preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
    }
  }

  async addNoteToNotification(id, note) {
    try {
      const response = await api.post(`/notifications/${id}/notes`, { note });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add note');
    }
  }

  // ==================== SPECIFIC NOTIFICATION TYPES ====================

  async notifyNewIncident(incidentData) {
    try {
      const notification = {
        title: '🚨 New Safety Incident Reported',
        message: `${incidentData.industryName} - ${incidentData.incidentType} (${incidentData.severity})`,
        type: 'incident',
        priority: this.getPriorityLevel(incidentData.severity),
        category: 'safety',
        data: incidentData,
        actionUrl: `/incidents/${incidentData.id}`,
        recipients: ['managers', 'safety_team']
      };

      await this.createNotification(notification);
      this.emitSocketNotification('new_incident', notification);
      
      return { success: true };
    } catch (error) {
      console.error('New incident notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async notifyIncidentStatusChange(incidentId, newStatus, notes = '') {
    try {
      const notification = {
        title: '📋 Incident Status Updated',
        message: `Incident #${incidentId} status changed to ${newStatus}${notes ? `: ${notes}` : ''}`,
        type: 'incident_update',
        priority: 'medium',
        category: 'safety',
        data: { incidentId, newStatus, notes },
        actionUrl: `/incidents/${incidentId}`,
        recipients: ['reporters', 'assigned_investigators']
      };

      await this.createNotification(notification);
      this.emitSocketNotification('incident_status_update', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Status change notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async notifyInvestigatorAssignment(incidentId, investigatorId) {
    try {
      const notification = {
        title: '🔍 Incident Investigation Assigned',
        message: `You have been assigned to investigate Incident #${incidentId}`,
        type: 'investigator_assignment',
        priority: 'high',
        category: 'safety',
        data: { incidentId, investigatorId },
        actionUrl: `/incidents/${incidentId}`,
        recipients: [investigatorId]
      };

      await this.createNotification(notification);
      this.emitSocketNotification('investigator_assigned', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Investigator assignment notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async notifyOverdueInvestigation(incidentId, daysOverdue) {
    try {
      const notification = {
        title: '⏰ Investigation Overdue',
        message: `Investigation for Incident #${incidentId} is ${daysOverdue} day(s) overdue`,
        type: 'overdue_investigation',
        priority: 'high',
        category: 'safety',
        data: { incidentId, daysOverdue },
        actionUrl: `/incidents/${incidentId}`,
        recipients: ['managers', 'safety_team']
      };

      await this.createNotification(notification);
      this.emitSocketNotification('investigation_overdue', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Overdue investigation notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendDailySafetyDigest(stats) {
    try {
      const notification = {
        title: '📊 Daily Safety Digest',
        message: `Today's safety overview: ${stats.incidentsToday} new incidents, ${stats.openInvestigations} ongoing investigations`,
        type: 'daily_digest',
        priority: 'low',
        category: 'safety',
        data: stats,
        recipients: ['managers', 'safety_team'],
        digest: true
      };

      await this.createNotification(notification);
      return { success: true };
    } catch (error) {
      console.error('Daily digest notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== HELPER METHODS ====================

  getPriorityLevel(severity) {
    const priorityMap = {
      'critical': 'urgent',
      'high': 'high', 
      'medium': 'medium',
      'low': 'low'
    };
    return priorityMap[severity] || 'medium';
  }

  emitSocketNotification(event, data) {
    if (typeof window !== 'undefined' && window.socket) {
      window.socket.emit(event, data);
    }
  }

  initializeSocketListeners(socket, callbacks = {}) {
    if (!socket) return;

    socket.on('new_incident', (data) => {
      if (callbacks.onNewIncident) callbacks.onNewIncident(data);
    });

    socket.on('incident_status_update', (data) => {
      if (callbacks.onStatusUpdate) callbacks.onStatusUpdate(data);
    });

    socket.on('investigator_assigned', (data) => {
      if (callbacks.onInvestigatorAssigned) callbacks.onInvestigatorAssigned(data);
    });

    socket.on('investigation_overdue', (data) => {
      if (callbacks.onOverdueInvestigation) callbacks.onOverdueInvestigation(data);
    });

    socket.on('new_notification', (data) => {
      if (callbacks.onNewNotification) callbacks.onNewNotification(data);
    });

    socket.on('connect', () => {
      console.log('🔔 Connected to notification service');
    });

    socket.on('disconnect', () => {
      console.log('🔔 Disconnected from notification service');
    });
  }

  cleanupSocketListeners(socket) {
    if (socket) {
      socket.off('new_incident');
      socket.off('incident_status_update');
      socket.off('investigator_assigned');
      socket.off('investigation_overdue');
      socket.off('new_notification');
    }
  }

  // ==================== BULK OPERATIONS ====================

  async sendBulkNotification(notificationData, userGroups = []) {
    try {
      const response = await api.post('/notifications/bulk', {
        ...notificationData,
        userGroups,
        sentAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send bulk notification');
    }
  }

  async clearAllNotifications() {
    try {
      const response = await api.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to clear notifications');
    }
  }

  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification statistics');
    }
  }

  // ==================== CREATE NOTIFICATION (INTERNAL) ====================

  async createNotification(notificationData) {
    try {
      const response = await api.post('/notifications/create', notificationData);
      return response.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== USER MANAGEMENT ====================

  async getUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  async getInvestigatorList(params = {}) {
    try {
      const response = await api.get('/users/investigators', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch investigators');
    }
  }

  // ==================== REPORT TEMPLATES ====================

  async getReportTemplates(params = {}) {
    try {
      const response = await api.get('/reports/templates', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch templates');
    }
  }

  async saveReportTemplate(templateData) {
    try {
      const response = await api.post('/reports/templates', {
        ...templateData,
        createdBy: localStorage.getItem('userId'),
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save template');
    }
  }

  async deleteReportTemplate(templateId) {
    try {
      const response = await api.delete(`/reports/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete template');
    }
  }

  async generateCustomReport(filters, format = 'pdf') {
    try {
      const response = await api.post('/reports/generate', {
        filters,
        format,
        generatedBy: localStorage.getItem('userId'),
        generatedAt: new Date().toISOString()
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  }

  // ==================== KNOWLEDGE BASE ====================

  async getKnowledgeArticles(params = {}) {
    try {
      const response = await api.get('/knowledge-base', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch articles');
    }
  }

  async getKnowledgeArticleById(id) {
    try {
      const response = await api.get(`/knowledge-base/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch article');
    }
  }

  async searchKnowledgeBase(query, params = {}) {
    try {
      const response = await api.get('/knowledge-base/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search knowledge base');
    }
  }

  // ==================== TRAINING MANAGEMENT ====================

  async getTrainingCourses(params = {}) {
    try {
      const response = await api.get('/training/courses', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
  }

  async getTrainingRecords(userId, params = {}) {
    try {
      const response = await api.get(`/training/records/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch training records');
    }
  }

  async assignTraining(userId, courseId, dueDate) {
    try {
      const response = await api.post('/training/assign', {
        userId,
        courseId,
        dueDate,
        assignedBy: localStorage.getItem('userId'),
        assignedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign training');
    }
  }

  async completeTraining(recordId, completionData) {
    try {
      const response = await api.post(`/training/records/${recordId}/complete`, {
        ...completionData,
        completedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete training');
    }
  }

  async getTrainingComplianceReport(params = {}) {
    try {
      const response = await api.get('/training/compliance', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch compliance report');
    }
  }

  // ==================== SEARCH ====================

  async globalSearch(query, options = {}) {
    try {
      const response = await api.post('/search', {
        query,
        options,
        searchedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  }

  async advancedSearch(filters) {
    try {
      const response = await api.post('/search/advanced', filters);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Advanced search failed');
    }
  }

  // ==================== EXPORT ALL DATA ====================

  async exportAllData(format = 'zip') {
    try {
      const response = await api.get(`/export/all?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export data');
    }
  }

  async exportIncidentReport(incidentId, format = 'pdf') {
    try {
      const response = await api.get(`/incidents/${incidentId}/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export incident');
    }
  }

  // ==================== BATCH OPERATIONS ====================

  async batchUpdateIncidents(incidentIds, updates) {
    try {
      const response = await api.post('/incidents/batch-update', {
        incidentIds,
        updates,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Batch update failed');
    }
  }

  async batchDeleteIncidents(incidentIds) {
    try {
      const response = await api.post('/incidents/batch-delete', {
        incidentIds,
        deletedBy: localStorage.getItem('userId'),
        deletedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Batch delete failed');
    }
  }

  async batchAssignIncidents(incidentIds, investigatorId) {
    try {
      const response = await api.post('/incidents/batch-assign', {
        incidentIds,
        investigatorId,
        assignedBy: localStorage.getItem('userId'),
        assignedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Batch assign failed');
    }
  }

  // ==================== WORKFLOW ====================

  async getWorkflowStatus(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/workflow`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch workflow status');
    }
  }

  async advanceWorkflow(incidentId, action, data = {}) {
    try {
      const response = await api.post(`/incidents/${incidentId}/workflow/advance`, {
        action,
        data,
        performedBy: localStorage.getItem('userId'),
        performedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to advance workflow');
    }
  }

  async getWorkflowHistory(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/workflow/history`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch workflow history');
    }
  }

  // ==================== APPROVALS ====================

  async getPendingApprovals(params = {}) {
    try {
      const response = await api.get('/approvals/pending', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending approvals');
    }
  }

  async submitForApproval(incidentId, approvalType, data = {}) {
    try {
      const response = await api.post(`/incidents/${incidentId}/approvals`, {
        approvalType,
        data,
        submittedBy: localStorage.getItem('userId'),
        submittedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit for approval');
    }
  }

  async approveRequest(approvalId, comments = '') {
    try {
      const response = await api.post(`/approvals/${approvalId}/approve`, {
        comments,
        approvedBy: localStorage.getItem('userId'),
        approvedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to approve');
    }
  }

  async rejectRequest(approvalId, reason) {
    try {
      const response = await api.post(`/approvals/${approvalId}/reject`, {
        reason,
        rejectedBy: localStorage.getItem('userId'),
        rejectedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reject');
    }
  }

  // ==================== TASKS ====================

  async getTasks(params = {}) {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }

  async createTask(taskData) {
    try {
      const response = await api.post('/tasks', {
        ...taskData,
        createdBy: localStorage.getItem('userId'),
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const response = await api.put(`/tasks/${taskId}`, {
        ...taskData,
        updatedBy: localStorage.getItem('userId'),
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  }

  async completeTask(taskId, completionData = {}) {
    try {
      const response = await api.post(`/tasks/${taskId}/complete`, {
        ...completionData,
        completedBy: localStorage.getItem('userId'),
        completedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete task');
    }
  }

  async getMyTasks(params = {}) {
    try {
      const response = await api.get('/tasks/my-tasks', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch my tasks');
    }
  }
}

export default new NotificationService();
