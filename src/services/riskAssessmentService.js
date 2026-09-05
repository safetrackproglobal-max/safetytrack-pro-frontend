// src/services/riskAssessmentService.js
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './api.js';

const RiskAssessmentService = {
  /**
   * Get all risk assessments
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise with assessments data
   */
  getAllAssessments: async (params = {}) => {
    try {
      const response = await apiGet('/risk-assessments/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  /**
   * Get risk assessment by ID
   * @param {string|number} id - Assessment ID
   * @returns {Promise} Promise with assessment data
   */
  getAssessmentById: async (id) => {
    try {
      const response = await apiGet(`/risk-assessments/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new risk assessment
   * @param {Object} data - Assessment data
   * @returns {Promise} Promise with created assessment
   */
  createAssessment: async (data) => {
    try {
      const response = await apiPost('/risk-assessments/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  },

  /**
   * Update an existing risk assessment
   * @param {string|number} id - Assessment ID
   * @param {Object} data - Updated assessment data
   * @returns {Promise} Promise with updated assessment
   */
  updateAssessment: async (id, data) => {
    try {
      const response = await apiPut(`/risk-assessments/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a risk assessment
   * @param {string|number} id - Assessment ID
   * @returns {Promise} Promise with deletion result
   */
  deleteAssessment: async (id) => {
    try {
      const response = await apiDelete(`/risk-assessments/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Download assessment as PDF
   * @param {string|number} id - Assessment ID
   * @param {string} fileName - Optional custom filename
   * @returns {Promise} Promise with blob data
   */
  downloadAssessmentPDF: async (id, fileName = null) => {
    try {
      const response = await apiGet(`/risk-assessments/${id}/download-pdf/`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `risk-assessment-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error(`Error downloading PDF for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Download assessment as Excel
   * @param {string|number} id - Assessment ID
   * @param {string} fileName - Optional custom filename
   * @returns {Promise} Promise with blob data
   */
  downloadAssessmentExcel: async (id, fileName = null) => {
    try {
      const response = await apiGet(`/risk-assessments/${id}/download-excel/`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `risk-assessment-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error(`Error downloading Excel for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Download all assessments as Excel
   * @param {Object} params - Filter parameters
   * @param {string} fileName - Optional custom filename
   * @returns {Promise} Promise with blob data
   */
  downloadAllAssessments: async (format = 'excel', params = {}, fileName = null) => {
    try {
      const response = await apiGet('/risk-assessments/download-all/', {
        params: { format, ...params },
        responseType: 'blob'
      });
      
      const extension = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `all-risk-assessments-${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error(`Error downloading all assessments as ${format}:`, error);
      throw error;
    }
  },

  /**
   * Get assessment templates (Industry templates)
   * @param {Object} params - Filter parameters (industry, category)
   * @returns {Promise} Promise with templates data
   */
  getTemplates: async (params = {}) => {
    try {
      const response = await apiGet('/risk-assessment-templates/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Get template by ID
   * @param {string} templateId - Template ID
   * @returns {Promise} Promise with template data
   */
  getTemplateById: async (templateId) => {
    try {
      const response = await apiGet(`/risk-assessment-templates/${templateId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Upload attachments to assessment
   * @param {string|number} id - Assessment ID
   * @param {File} file - File to upload
   * @param {string} description - File description
   * @returns {Promise} Promise with upload result
   */
  uploadAttachment: async (id, file, description = '') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      
      const response = await apiUpload(`/risk-assessments/${id}/upload-attachment/`, formData);
      return response.data;
    } catch (error) {
      console.error(`Error uploading attachment for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get assessment attachments
   * @param {string|number} id - Assessment ID
   * @returns {Promise} Promise with attachments data
   */
  getAttachments: async (id) => {
    try {
      const response = await apiGet(`/risk-assessments/${id}/attachments/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attachments for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete assessment attachment
   * @param {string|number} id - Assessment ID
   * @param {string|number} attachmentId - Attachment ID
   * @returns {Promise} Promise with deletion result
   */
  deleteAttachment: async (id, attachmentId) => {
    try {
      const response = await apiDelete(`/risk-assessments/${id}/attachments/${attachmentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting attachment ${attachmentId} for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update assessment status
   * @param {string|number} id - Assessment ID
   * @param {string} status - New status
   * @param {string} comments - Status change comments
   * @returns {Promise} Promise with updated assessment
   */
  updateStatus: async (id, status, comments = '') => {
    try {
      const response = await apiPut(`/risk-assessments/${id}/update-status/`, {
        status,
        comments
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get assessment history/audit trail
   * @param {string|number} id - Assessment ID
   * @param {Object} params - Pagination/filter parameters
   * @returns {Promise} Promise with history data
   */
  getHistory: async (id, params = {}) => {
    try {
      const response = await apiGet(`/risk-assessments/${id}/history/`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add comment to assessment
   * @param {string|number} id - Assessment ID
   * @param {string} comment - Comment text
   * @returns {Promise} Promise with comment data
   */
  addComment: async (id, comment) => {
    try {
      const response = await apiPost(`/risk-assessments/${id}/comments/`, { comment });
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get assessment comments
   * @param {string|number} id - Assessment ID
   * @param {Object} params - Pagination parameters
   * @returns {Promise} Promise with comments data
   */
  getComments: async (id, params = {}) => {
    try {
      const response = await apiGet(`/risk-assessments/${id}/comments/`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get assessment statistics
   * @param {Object} params - Filter parameters
   * @returns {Promise} Promise with statistics data
   */
  getStatistics: async (params = {}) => {
    try {
      const response = await apiGet('/risk-assessments/statistics/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  /**
   * Get risk matrix data
   * @param {Object} params - Filter parameters
   * @returns {Promise} Promise with matrix data
   */
  getRiskMatrix: async (params = {}) => {
    try {
      const response = await apiGet('/risk-assessments/risk-matrix/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching risk matrix:', error);
      throw error;
    }
  },

  /**
   * Bulk update assessments
   * @param {Array} ids - Array of assessment IDs
   * @param {Object} data - Data to update
   * @returns {Promise} Promise with bulk update result
   */
  bulkUpdate: async (ids, data) => {
    try {
      const response = await apiPost('/risk-assessments/bulk-update/', {
        ids,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating assessments:', error);
      throw error;
    }
  },

  /**
   * Bulk delete assessments
   * @param {Array} ids - Array of assessment IDs
   * @returns {Promise} Promise with bulk delete result
   */
  bulkDelete: async (ids) => {
    try {
      const response = await apiPost('/risk-assessments/bulk-delete/', { ids });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting assessments:', error);
      throw error;
    }
  },

  /**
   * Import assessments from file
   * @param {File} file - File to import
   * @param {string} importType - Import type (excel, csv, json)
   * @param {Object} options - Additional import options
   * @returns {Promise} Promise with import result
   */
  importAssessments: async (file, importType = 'excel', options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('import_type', importType);
      
      if (options.templateId) {
        formData.append('template_id', options.templateId);
      }
      
      const response = await apiUpload('/risk-assessments/import/', formData);
      return response.data;
    } catch (error) {
      console.error('Error importing assessments:', error);
      throw error;
    }
  },

  /**
   * Export assessments with custom format
   * @param {Object} params - Filter and format parameters
   * @returns {Promise} Promise with export data
   */
  exportAssessments: async (params = {}) => {
    try {
      const response = await apiGet('/risk-assessments/export/', {
        params,
        responseType: 'blob'
      });
      
      // Determine file extension based on format
      const format = params.format || 'excel';
      const extensions = {
        excel: 'xlsx',
        csv: 'csv',
        pdf: 'pdf',
        json: 'json'
      };
      const ext = extensions[format] || 'xlsx';
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `risk-assessments-export-${new Date().toISOString().split('T')[0]}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error exporting assessments:', error);
      throw error;
    }
  },

  /**
   * Get dashboard metrics
   * @returns {Promise} Promise with dashboard data
   */
  getDashboardMetrics: async () => {
    try {
      const response = await apiGet('/risk-assessments/dashboard-metrics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  /**
   * Get overdue assessments
   * @param {Object} params - Filter parameters
   * @returns {Promise} Promise with overdue assessments
   */
  getOverdueAssessments: async (params = {}) => {
    try {
      const response = await apiGet('/risk-assessments/overdue/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue assessments:', error);
      throw error;
    }
  },

  /**
   * Get upcoming reviews
   * @param {Object} params - Filter parameters
   * @returns {Promise} Promise with upcoming reviews
   */
  getUpcomingReviews: async (params = {}) => {
    try {
      const response = await apiGet('/risk-assessments/upcoming-reviews/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming reviews:', error);
      throw error;
    }
  },

  /**
   * Clone/duplicate assessment
   * @param {string|number} id - Assessment ID to clone
   * @param {Object} overrides - Data to override in clone
   * @returns {Promise} Promise with cloned assessment
   */
  cloneAssessment: async (id, overrides = {}) => {
    try {
      const response = await apiPost(`/risk-assessments/${id}/clone/`, overrides);
      return response.data;
    } catch (error) {
      console.error(`Error cloning assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Share assessment via email
   * @param {string|number} id - Assessment ID
   * @param {Array} emails - Array of email addresses
   * @param {string} message - Optional message
   * @param {string} shareType - Share type (view, edit, download)
   * @returns {Promise} Promise with share result
   */
  shareAssessment: async (id, emails, message = '', shareType = 'view') => {
    try {
      const response = await apiPost(`/risk-assessments/${id}/share/`, {
        emails,
        message,
        share_type: shareType
      });
      return response.data;
    } catch (error) {
      console.error(`Error sharing assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Generate report for assessment
   * @param {string|number} id - Assessment ID
   * @param {Object} reportConfig - Report configuration
   * @returns {Promise} Promise with report data
   */
  generateReport: async (id, reportConfig = {}) => {
    try {
      const response = await apiPost(`/risk-assessments/${id}/generate-report/`, reportConfig);
      return response.data;
    } catch (error) {
      console.error(`Error generating report for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Validate assessment data
   * @param {Object} data - Assessment data to validate
   * @returns {Promise} Promise with validation result
   */
  validateAssessment: async (data) => {
    try {
      const response = await apiPost('/risk-assessments/validate/', data);
      return response.data;
    } catch (error) {
      console.error('Error validating assessment:', error);
      throw error;
    }
  },

  /**
   * Get assessment workflow
   * @param {string|number} id - Assessment ID
   * @returns {Promise} Promise with workflow data
   */
  getWorkflow: async (id) => {
    try {
      const response = await apiGet(`/risk-assessments/${id}/workflow/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workflow for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Transition assessment workflow state
   * @param {string|number} id - Assessment ID
   * @param {string} action - Workflow action
   * @param {Object} data - Additional data
   * @returns {Promise} Promise with workflow transition result
   */
  transitionWorkflow: async (id, action, data = {}) => {
    try {
      const response = await apiPost(`/risk-assessments/${id}/workflow/transition/`, {
        action,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error(`Error transitioning workflow for assessment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get assessment by assessment number
   * @param {string} assessmentNumber - Assessment number
   * @returns {Promise} Promise with assessment data
   */
  getAssessmentByNumber: async (assessmentNumber) => {
    try {
      const response = await apiGet(`/risk-assessments/by-number/${assessmentNumber}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assessment by number ${assessmentNumber}:`, error);
      throw error;
    }
  },

  /**
   * Search assessments
   * @param {string} query - Search query
   * @param {Object} params - Additional search parameters
   * @returns {Promise} Promise with search results
   */
  searchAssessments: async (query, params = {}) => {
    try {
      const response = await apiGet('/risk-assessments/search/', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching assessments:', error);
      throw error;
    }
  },

  /**
   * Get assessment trends
   * @param {Object} params - Time period and filter parameters
   * @returns {Promise} Promise with trend data
   */
  getAssessmentTrends: async (params = {}) => {
    try {
      const response = await apiGet('/risk-assessments/trends/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment trends:', error);
      throw error;
    }
  },

  /**
   * Batch process assessments
   * @param {string} action - Batch action (approve, reject, archive)
   * @param {Array} ids - Array of assessment IDs
   * @param {Object} data - Additional data
   * @returns {Promise} Promise with batch result
   */
  batchProcess: async (action, ids, data = {}) => {
    try {
      const response = await apiPost('/risk-assessments/batch/', {
        action,
        ids,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Error batch processing assessments:', error);
      throw error;
    }
  }
};

export default RiskAssessmentService;