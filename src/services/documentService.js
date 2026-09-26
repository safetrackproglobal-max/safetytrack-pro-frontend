// src/services/documentService.js
import api from './api'; // Your API client

class DocumentService {
  // ============================================================
  // CORE CRUD OPERATIONS
  // ============================================================

  /**
   * Get documents with optional filters
   * Enhanced with company filtering and better parameter handling
   */
  async getDocuments(filters = {}) {
    try {
      // Remove null/undefined/empty values
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null &&
            filters[key] !== undefined &&
            filters[key] !== '' &&
            filters[key] !== 'all') {
          cleanFilters[key] = filters[key];
        }
      });

      // Handle date range
      if (filters.date_from && filters.date_to) {
        cleanFilters.date_from = filters.date_from;
        cleanFilters.date_to = filters.date_to;
      }

      const params = new URLSearchParams(cleanFilters);
      const response = await api.get(`/documents?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      throw error;
    }
  }

  /**
   * Get single document by ID
   */
  async getDocument(id) {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch document ${id}:`, error);
      throw error;
    }
  }

  async createDocument(data) {
    try {
      let formData;

      // ✅ Check if data is already FormData
      if (data instanceof FormData) {
        formData = data;
        console.log('✅ [createDocument] Received FormData directly');

        // Verify it has a file
        let hasFile = false;
        for (let [key, value] of formData.entries()) {
          if (key === 'file') {
            hasFile = true;
            console.log(`  - File: ${value.name} (${value.size} bytes)`);
            break;
          }
        }
        if (!hasFile) {
          throw new Error('FormData does not contain a file');
        }
      } else {
        // ✅ Original behavior - build FormData from object
        console.log('✅ [createDocument] Building FormData from object');
        formData = new FormData();

        // Required fields
        if (data.title) formData.append('title', data.title);
        if (data.document_type) formData.append('document_type', data.document_type);

        // Optional fields
        if (data.description) formData.append('description', data.description);
        if (data.category) formData.append('category', data.category);
        if (data.module) formData.append('module', data.module);
        if (data.priority) formData.append('priority', data.priority);
        if (data.site_id) formData.append('site_id', data.site_id);
        if (data.company_id) formData.append('company_id', data.company_id);
        if (data.expires_at) formData.append('expires_at', data.expires_at);
        if (data.content) formData.append('content', data.content);

        formData.append('is_confidential', data.is_confidential ? 'true' : 'false');
        formData.append('requires_approval', data.requires_approval !== false ? 'true' : 'false');

        if (data.tags && data.tags.length > 0) {
          formData.append('tags', JSON.stringify(data.tags));
        }

        if (data.approval_workflow) {
          formData.append('approval_workflow', data.approval_workflow);
        }

        // ✅ File
        if (data.file) {
          formData.append('file', data.file);
          console.log(`  - File: ${data.file.name} (${data.file.size} bytes)`);
        } else {
          console.warn('⚠️ [createDocument] No file provided in data object');
        }
      }

      const response = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create document:', error);
      throw error;
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(id, data) {
    try {
      const response = await api.put(`/documents/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(id) {
    try {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Restore deleted document
   */
  async restoreDocument(id) {
    try {
      const response = await api.post(`/documents/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error(`Failed to restore document ${id}:`, error);
      throw error;
    }
  }

  // ============================================================
  // APPROVAL CHAIN METHODS
  // ============================================================

  /**
   * Get approval chains with optional filters
   */
  async getApprovalChains(filters = {}) {
    try {
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          cleanFilters[key] = filters[key];
        }
      });

      const params = new URLSearchParams(cleanFilters);
      const response = await api.get(`/documents/approval-chains?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch approval chains:', error);
      return { success: false, chains: [], error: error.message };
    }
  }

  /**
   * Get pending approvals for current user
   */
  async getPendingApprovals(filters = {}) {
    try {
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          cleanFilters[key] = filters[key];
        }
      });

      const params = new URLSearchParams(cleanFilters);
      const response = await api.get(`/documents/pending-approvals?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      return { success: false, approvals: [], error: error.message };
    }
  }

  /**
   * Create a new approval chain
   */
  async createApprovalChain(data) {
    try {
      const response = await api.post('/documents/approval-chains', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create approval chain:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start document approval process
   */
  async startDocumentApproval(documentId, data) {
    try {
      const response = await api.post(`/documents/${documentId}/start-approval`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to start approval:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process an approval action (approve/reject)
   */
  async processApprovalAction(approvalId, action, comment = '') {
    try {
      const response = await api.post(`/documents/approvals/${approvalId}/action`, {
        action,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Failed to process approval action:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get approval chain details
   */
  async getApprovalChain(chainId) {
    try {
      const response = await api.get(`/documents/approval-chains/${chainId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get approval chain:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update approval chain
   */
  async updateApprovalChain(chainId, data) {
    try {
      const response = await api.put(`/documents/approval-chains/${chainId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update approval chain:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete approval chain
   */
  async deleteApprovalChain(chainId) {
    try {
      const response = await api.delete(`/documents/approval-chains/${chainId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete approval chain:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get approval history for a document
   */
  async getApprovalHistory(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/approval-history`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch approval history:', error);
      return { success: false, history: [], error: error.message };
    }
  }

  // ============================================================
  // VERSION CONTROL
  // ============================================================

  /**
   * Get version history for a document
   */
  async getVersions(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/versions`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch versions for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new version of a document
   */
  async createVersion(documentId, file, changes = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('changes', changes);

      const response = await api.post(`/documents/${documentId}/version`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to create version for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollbackVersion(documentId, versionNumber) {
    try {
      const response = await api.post(`/documents/${documentId}/rollback`, { version: versionNumber });
      return response.data;
    } catch (error) {
      console.error(`Failed to rollback ${documentId} to version ${versionNumber}:`, error);
      throw error;
    }
  }

  // ============================================================
  // WORKFLOW ACTIONS
  // ============================================================

  /**
   * Submit document for review
   */
  async submitForReview(id, reviewerId = null) {
    try {
      const response = await api.post(`/documents/${id}/submit`, { reviewer_id: reviewerId });
      return response.data;
    } catch (error) {
      console.error(`Failed to submit document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Review document (add review comments)
   */
  async reviewDocument(id, data) {
    try {
      const response = await api.post(`/documents/${id}/review`, {
        comment: data.comment || '',
        status: data.status || 'reviewed'
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to review document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Approve document
   */
  async approveDocument(id, comment = '') {
    try {
      const response = await api.post(`/documents/${id}/approve`, { comment });
      return response.data;
    } catch (error) {
      console.error(`Failed to approve document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reject document
   */
  async rejectDocument(id, reason = '') {
    try {
      const response = await api.post(`/documents/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Failed to reject document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Publish document (make it active)
   */
  async publishDocument(id) {
    try {
      const response = await api.post(`/documents/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error(`Failed to publish document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Archive document
   */
  async archiveDocument(id, reason = '') {
    try {
      const response = await api.post(`/documents/${id}/archive`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Failed to archive document ${id}:`, error);
      throw error;
    }
  }

  // ============================================================
  // COLLABORATION
  // ============================================================

  /**
   * Get document comments
   */
  async getComments(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch comments for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Add comment to document
   */
  async addComment(documentId, content, parentId = null) {
    try {
      const response = await api.post(`/documents/${documentId}/comments`, {
        content,
        parent_id: parentId
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to add comment to ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Update comment
   */
  async updateComment(commentId, content) {
    try {
      const response = await api.put(`/documents/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      console.error(`Failed to update comment ${commentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId) {
    try {
      const response = await api.delete(`/documents/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw error;
    }
  }

  // ============================================================
  // SEARCH & DISCOVERY
  // ============================================================

  /**
   * Search documents with advanced filters
   */
  async searchDocuments(query, filters = {}) {
    try {
      const params = new URLSearchParams({ q: query });

      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/documents/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search documents:', error);
      throw error;
    }
  }

  /**
   * Global search across all documents
   */
  async globalSearch(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });
      const response = await api.get(`/documents/global-search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to perform global search:', error);
      throw error;
    }
  }

  /**
   * Save a search for later use
   */
  async saveSearch(name, filters) {
    try {
      const response = await api.post('/documents/saved-searches', {
        name: name,
        filters: filters
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save search:', error);
      throw error;
    }
  }

  /**
   * Get saved searches for current user
   */
  async getSavedSearches() {
    try {
      const response = await api.get('/documents/saved-searches');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch saved searches:', error);
      throw error;
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(searchId) {
    try {
      const response = await api.delete(`/documents/saved-searches/${searchId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete saved search ${searchId}:`, error);
      throw error;
    }
  }

  /**
   * Get search history
   */
  async getSearchHistory() {
    try {
      const response = await api.get('/documents/search-history');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch search history:', error);
      throw error;
    }
  }

  /**
   * Add to search history
   */
  async addSearchHistory(term) {
    try {
      const response = await api.post('/documents/search-history', { term });
      return response.data;
    } catch (error) {
      console.error('Failed to add to search history:', error);
      throw error;
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory() {
    try {
      const response = await api.delete('/documents/search-history');
      return response.data;
    } catch (error) {
      console.error('Failed to clear search history:', error);
      throw error;
    }
  }

  // ============================================================
  // ANALYTICS
  // ============================================================

  /**
   * Get document statistics with optional filters
   * Enhanced with company filtering
   */
  async getStats(params = {}) {
    try {
      // Remove null/undefined/empty values
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== null &&
            params[key] !== undefined &&
            params[key] !== '' &&
            params[key] !== 'all') {
          cleanParams[key] = params[key];
        }
      });

      const queryParams = new URLSearchParams(cleanParams);
      const response = await api.get(`/documents/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch document stats:', error);
      throw error;
    }
  }

  /**
   * Get document analytics (detailed)
   */
  async getDocumentAnalytics(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== null &&
            params[key] !== undefined &&
            params[key] !== '' &&
            params[key] !== 'all') {
          cleanParams[key] = params[key];
        }
      });

      const queryParams = new URLSearchParams(cleanParams);
      const response = await api.get(`/documents/analytics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch document analytics:', error);
      throw error;
    }
  }

  /**
   * Get document statistics by module
   */
  async getModuleStats(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/stats/modules?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch module statistics:', error);
      throw error;
    }
  }

  /**
   * Get review analytics
   */
  async getReviewAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/analytics/reviews?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch review analytics:', error);
      throw error;
    }
  }

  /**
   * Get compliance analytics
   */
  async getComplianceAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/analytics/compliance?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance analytics:', error);
      throw error;
    }
  }

  // ============================================================
  // REVIEW MANAGEMENT
  // ============================================================

  /**
   * Get documents requiring review with filters
   */
  async getReviewDocuments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/review?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch review documents:', error);
      throw error;
    }
  }

  /**
   * Get review history for a specific document
   */
  async getReviewHistory(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/review-history`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch review history for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get detailed review information for a document
   */
  async getDocumentReviewDetail(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/review-detail`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch review detail for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Update review date and frequency
   */
  async updateReviewDate(documentId, reviewDate, frequency, notes = '') {
    try {
      const response = await api.put(`/documents/${documentId}/review-date`, {
        review_date: reviewDate,
        review_frequency: frequency,
        notes: notes
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update review date for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Complete a review (mark as reviewed)
   */
  async completeReview(documentId, notes = '') {
    try {
      const response = await api.post(`/documents/${documentId}/complete-review`, {
        notes: notes
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to complete review for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Send review reminders for selected documents
   */
  async sendReviewReminders(documentIds) {
    try {
      const response = await api.post('/documents/send-reminders', {
        document_ids: documentIds
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send review reminders:', error);
      throw error;
    }
  }

  /**
   * Bulk update review status for multiple documents
   */
  async bulkUpdateReviewStatus(documentIds, status) {
    try {
      const response = await api.put('/documents/bulk-review-status', {
        document_ids: documentIds,
        status: status
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update review status:', error);
      throw error;
    }
  }

  /**
   * Get expiring documents (review dates approaching)
   */
  async getExpiringDocuments(days = 30, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        days: days,
        ...params
      });
      const response = await api.get(`/documents/expiring?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch expiring documents:', error);
      throw error;
    }
  }

  /**
   * Get overdue documents
   */
  async getOverdueDocuments(params = {}) {
    try {
      const cleanParams = this.cleanParams(params);
      const queryParams = new URLSearchParams(cleanParams);
      const response = await api.get(`/documents/overdue?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch overdue documents:', error);
      // Return empty result instead of throwing
      return {
        success: true,
        overdue: [],
        expiring_soon: [],
        overdue_count: 0,
        expiring_soon_count: 0
      };
    }
  }

  // ============================================================
  // AUDIT TRAIL
  // ============================================================

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/audit?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw error;
    }
  }

  /**
   * Check document compliance
   */
  async checkDocumentCompliance(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/compliance`);
      return response.data;
    } catch (error) {
      console.error(`Failed to check compliance for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/audit/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = params.format === 'pdf' ? 'pdf' : params.format === 'json' ? 'json' : 'csv';
      link.setAttribute('download', `audit-logs.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw error;
    }
  }

  // ============================================================
  // INTEGRATION (Document Linking)
  // ============================================================

  /**
   * Get document links
   */
  async getDocumentLinks(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/links?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch document links:', error);
      throw error;
    }
  }

  /**
   * Get available items for linking
   */
  async getAvailableLinkItems(type, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        type: type,
        ...params
      });
      const response = await api.get(`/documents/links/available?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available link items:', error);
      throw error;
    }
  }

  /**
   * Create a document link
   */
  async createDocumentLink(data) {
    try {
      const response = await api.post('/documents/links', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create document link:', error);
      throw error;
    }
  }

  /**
   * Remove a document link
   */
  async removeDocumentLink(linkId) {
    try {
      const response = await api.delete(`/documents/links/${linkId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to remove link ${linkId}:`, error);
      throw error;
    }
  }

  /**
   * Bulk remove document links
   */
  async bulkRemoveLinks(linkIds) {
    try {
      const response = await api.post('/documents/links/bulk-remove', { ids: linkIds });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk remove links:', error);
      throw error;
    }
  }

  // ============================================================
  // BULK OPERATIONS (Enhanced)
  // ============================================================

  /**
   * Bulk archive documents
   */
  async bulkArchive(ids) {
    try {
      const response = await api.post('/documents/bulk/archive', { ids });
      return response.data;
    } catch (error) {
      console.error('Bulk archive failed:', error);
      throw error;
    }
  }

  /**
   * Bulk publish documents
   */
  async bulkPublish(ids) {
    try {
      const response = await api.post('/documents/bulk/publish', { ids });
      return response.data;
    } catch (error) {
      console.error('Bulk publish failed:', error);
      throw error;
    }
  }

  /**
   * Bulk mark as reviewed
   */
  async bulkMarkReviewed(ids) {
    try {
      const response = await api.post('/documents/bulk/mark-reviewed', { ids });
      return response.data;
    } catch (error) {
      console.error('Bulk mark reviewed failed:', error);
      throw error;
    }
  }

  /**
   * Bulk upload documents
   */
  async bulkUpload(files, metadata = {}) {
    try {
      const formData = new FormData();

      // Add files
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      // Add metadata
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await api.post('/documents/bulk/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      console.error('Bulk upload failed:', error);
      throw error;
    }
  }

  /**
   * Import documents from file
   */
  async importDocuments(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await api.post('/documents/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  /**
   * Export documents
   */
  async exportDocuments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = params.format === 'pdf' ? 'pdf' : params.format === 'json' ? 'json' : 'csv';
      link.setAttribute('download', `documents.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  // ============================================================
  // DOCUMENT EDITOR
  // ============================================================

  /**
   * Auto-save document content
   */
  async autoSaveDocument(documentId, data) {
    try {
      const response = await api.put(`/documents/${documentId}/autosave`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to auto-save document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Upload image for document
   */
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/documents/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  }

  /**
   * Get document content (for editor)
   */
  async getDocumentContent(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/content`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch document content ${documentId}:`, error);
      throw error;
    }
  }

  // ============================================================
  // DIGITAL SIGNATURES
  // ============================================================

  /**
 * Get all signatures for a document.
 * Returns an array (unwraps the { success, signatures } envelope).
 */
async getDocumentSignatures(documentId) {
  try {
    const response = await api.get(`/documents/${documentId}/signatures`);
    // Backend returns { success: true, signatures: [...] }
    return response.data?.signatures || [];
  } catch (error) {
    console.error(`Failed to fetch signatures for ${documentId}:`, error);
    return [];
  }
}

/**
 * Get the most recent signed signature for a document.
 * Returns null if none exists.
 */
async getLatestSignature(documentId) {
  const sigs = await this.getDocumentSignatures(documentId);
  if (!Array.isArray(sigs) || sigs.length === 0) return null;
  const signed = sigs.filter((s) => s.status === 'signed');
  return signed[0] || sigs[0] || null;
}

  /**
   * Create a new signature
   */
  async createSignature(data) {
    try {
      const response = await api.post('/documents/signatures', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create signature:', error);
      throw error;
    }
  }

  /**
   * Verify a signature
   */
  async verifySignature(signatureId) {
    try {
      const response = await api.get(`/documents/signatures/${signatureId}/verify`);
      return response.data;
    } catch (error) {
      console.error(`Failed to verify signature ${signatureId}:`, error);
      throw error;
    }
  }

  /**
   * Revoke a signature
   */
  async revokeSignature(signatureId, data) {
    try {
      const response = await api.post(`/documents/signatures/${signatureId}/revoke`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to revoke signature ${signatureId}:`, error);
      throw error;
    }
  }

  /**
   * Get signature history
   */
  async getSignatureHistory(signatureId) {
    try {
      const response = await api.get(`/documents/signatures/${signatureId}/history`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch history for ${signatureId}:`, error);
      throw error;
    }
  }

  /**
   * Download signature certificate
   */
  async downloadSignatureCertificate(signatureId) {
    try {
      const response = await api.get(`/documents/signatures/${signatureId}/certificate`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `signature-certificate-${signatureId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error(`Failed to download certificate for ${signatureId}:`, error);
      throw error;
    }
  }

  // ============================================================
  // DASHBOARD / RECENT
  // ============================================================

  /**
   * Get recent documents
   */
  async getRecentDocuments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/recent?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent documents:', error);
      throw error;
    }
  }

  /**
   * Get pending tasks for current user
   */
  async getPendingTasks(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/pending-tasks?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending tasks:', error);
      throw error;
    }
  }

  // ============================================================
  // DOWNLOAD & PREVIEW
  // ============================================================

  /**
   * Download document
   */
  async downloadDocument(id) {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error(`Failed to download document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get document preview URL
   */
  async getPreviewUrl(id) {
    try {
      const response = await api.get(`/documents/${id}/preview`);
      return response.data.preview_url;
    } catch (error) {
      console.error(`Failed to get preview for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk download multiple documents
   */
  async bulkDownloadDocuments(ids) {
    try {
      const response = await api.post('/documents/bulk-download', { ids }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documents_${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Failed to bulk download documents:', error);
      throw error;
    }
  }

  // ============================================================
  // AI FEATURES
  // ============================================================

  /**
   * AI Analysis of document
   */
  async analyzeDocument(documentId) {
    try {
      const response = await api.post(`/documents/${documentId}/analyze`);
      return response.data;
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    }
  }

  /**
   * Suggest tags for document using AI
   */
  async suggestTags(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/suggest-tags`);
      return response.data.tags || [];
    } catch (error) {
      console.error('Tag suggestion failed:', error);
      throw error;
    }
  }

  /**
   * Extract key information from document using AI
   */
  async extractKeyInfo(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/extract-info`);
      return response.data;
    } catch (error) {
      console.error('Key info extraction failed:', error);
      throw error;
    }
  }

  /**
   * Check document for compliance issues
   */
  async checkCompliance(documentId) {
    try {
      const response = await api.post(`/documents/${documentId}/check-compliance`);
      return response.data;
    } catch (error) {
      console.error('Compliance check failed:', error);
      throw error;
    }
  }

  // ============================================================
  // SHARING & PERMISSIONS
  // ============================================================

  /**
   * Share document with users or departments
   */
  async shareDocument(documentId, data) {
    try {
      const response = await api.post(`/documents/${documentId}/share`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to share document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get document sharing settings
   */
  async getSharingSettings(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/sharing`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get sharing settings for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Remove share for a user or department
   */
  async removeShare(documentId, userId) {
    try {
      const response = await api.delete(`/documents/${documentId}/share/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to remove share for ${userId}:`, error);
      throw error;
    }
  }

  // ============================================================
  // EXPIRY MANAGEMENT
  // ============================================================

  /**
   * Extend expiry date
   */
  async extendExpiry(documentId, newExpiryDate) {
    try {
      const response = await api.post(`/documents/${documentId}/extend-expiry`, {
        new_expiry_date: newExpiryDate
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to extend expiry for ${documentId}:`, error);
      throw error;
    }
  }

  // ============================================================
  // BULK OPERATIONS (Legacy - Keep for compatibility)
  // ============================================================

  /**
   * Bulk update document status
   */
  async bulkUpdateStatus(ids, status) {
    try {
      const response = await api.post('/documents/bulk/status', { ids, status });
      return response.data;
    } catch (error) {
      console.error('Bulk status update failed:', error);
      throw error;
    }
  }

  /**
   * Bulk delete documents
   */
  async bulkDelete(ids) {
    try {
      const response = await api.post('/documents/bulk/delete', { ids });
      return response.data;
    } catch (error) {
      console.error('Bulk delete failed:', error);
      throw error;
    }
  }

  /**
   * Bulk assign tags
   */
  async bulkAssignTags(ids, tags) {
    try {
      const response = await api.post('/documents/bulk/tags', { ids, tags });
      return response.data;
    } catch (error) {
      console.error('Bulk tag assignment failed:', error);
      throw error;
    }
  }

  // ============================================================
  // COMPLIANCE FRAMEWORK
  // ============================================================

  /**
   * Get compliance frameworks
   */
  async getComplianceFrameworks(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/compliance/frameworks?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance frameworks:', error);
      return { frameworks: [], total: 0 };
    }
  }

  /**
   * Get compliance requirements for a document
   */
  async getDocumentComplianceRequirements(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/compliance/requirements`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance requirements:', error);
      return { requirements: [] };
    }
  }

  /**
   * Link document to compliance framework
   */
  async linkToComplianceFramework(documentId, frameworkId, data = {}) {
    try {
      const response = await api.post(`/documents/${documentId}/compliance/link`, {
        framework_id: frameworkId,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Failed to link compliance framework:', error);
      throw error;
    }
  }

  /**
   * Check document compliance status
   */
  async checkComplianceStatus(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/compliance/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to check compliance status:', error);
      return { status: 'unknown', score: 0 };
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(documentId, format = 'pdf') {
    try {
      const response = await api.get(`/documents/${documentId}/compliance/report?format=${format}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/compliance/dashboard?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance dashboard:', error);
      return {
        overall_score: 0,
        frameworks: [],
        pending_items: 0,
        compliant_items: 0
      };
    }
  }

  /**
   * Get compliance audit trail
   */
  async getComplianceAudit(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/compliance/audit`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance audit:', error);
      return { audits: [] };
    }
  }

  // ============================================================
  // INCIDENT LINKING
  // ============================================================

  /**
   * Get incidents linked to a document
   */
  async getLinkedIncidents(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/incidents`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch linked incidents:', error);
      return { incidents: [] };
    }
  }

  /**
   * Link document to an incident
   */
  async linkToIncident(documentId, incidentId, data = {}) {
    try {
      const response = await api.post(`/documents/${documentId}/incidents/link`, {
        incident_id: incidentId,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Failed to link incident:', error);
      throw error;
    }
  }

  /**
   * Unlink document from an incident
   */
  async unlinkFromIncident(documentId, incidentId) {
    try {
      const response = await api.delete(`/documents/${documentId}/incidents/${incidentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to unlink incident:', error);
      throw error;
    }
  }

  /**
   * Get available incidents for linking
   */
  async getAvailableIncidents(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/incidents/available?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available incidents:', error);
      return { incidents: [] };
    }
  }

  // ============================================================
  // SDS MANAGEMENT (Safety Data Sheets)
  // ============================================================

  /**
   * Get SDS documents
   */
  async getSDSDocuments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/sds?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch SDS documents:', error);
      return { documents: [], total: 0 };
    }
  }

  /**
   * Get SDS by ID
   */
  async getSDSById(sdsId) {
    try {
      const response = await api.get(`/documents/sds/${sdsId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch SDS:', error);
      throw error;
    }
  }

  /**
   * Create SDS document
   */
  async createSDS(data) {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'file' && data[key]) {
          formData.append('file', data[key]);
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      const response = await api.post('/documents/sds', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create SDS:', error);
      throw error;
    }
  }

  /**
   * Update SDS
   */
  async updateSDS(sdsId, data) {
    try {
      const response = await api.put(`/documents/sds/${sdsId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update SDS:', error);
      throw error;
    }
  }

  /**
   * Delete SDS
   */
  async deleteSDS(sdsId) {
    try {
      const response = await api.delete(`/documents/sds/${sdsId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete SDS:', error);
      throw error;
    }
  }

  /**
   * Search SDS by chemical name or CAS number
   */
  async searchSDS(query) {
    try {
      const response = await api.get(`/documents/sds/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search SDS:', error);
      return { results: [] };
    }
  }

  // ============================================================
  // PTW INTEGRATION (Permit to Work)
  // ============================================================

  /**
   * Get PTW documents
   */
  async getPTWDocuments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/documents/ptw?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch PTW documents:', error);
      return { documents: [], total: 0 };
    }
  }

  /**
   * Get PTW by ID
   */
  async getPTWById(ptwId) {
    try {
      const response = await api.get(`/documents/ptw/${ptwId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch PTW:', error);
      throw error;
    }
  }

  /**
   * Create PTW document
   */
  async createPTW(data) {
    try {
      // ✅ If data is FormData, use it directly
      let formData = data;
      if (!(data instanceof FormData)) {
        formData = new FormData();
        Object.keys(data).forEach(key => {
          if (key === 'file' && data[key]) {
            formData.append('file', data[key]);
          } else if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        });
      }

      // ✅ Debug: Log what's being sent
      console.log('📤 Sending PTW FormData:');
      for (let [key, value] of formData.entries()) {
        if (key === 'file') {
          console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const response = await api.post('/documents/ptw', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create PTW:', error);
      throw error;
    }
  }

  /**
   * Update PTW status
   */
  async updatePTWStatus(ptwId, status, data = {}) {
    try {
      const response = await api.put(`/documents/ptw/${ptwId}/status`, {
        status,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update PTW status:', error);
      throw error;
    }
  }

  /**
   * Approve PTW
   */
  async approvePTW(ptwId, data = {}) {
    try {
      const response = await api.post(`/documents/ptw/${ptwId}/approve`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to approve PTW:', error);
      throw error;
    }
  }

  /**
   * Reject PTW
   */
  async rejectPTW(ptwId, reason) {
    try {
      const response = await api.post(`/documents/ptw/${ptwId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to reject PTW:', error);
      throw error;
    }
  }

  /**
   * Get PTW templates
   */
  async getPTWTemplates() {
    try {
      const response = await api.get('/documents/ptw/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch PTW templates:', error);
      return { templates: [] };
    }
  }

  // ============================================================
  // TEMPLATE MANAGEMENT
  // ============================================================

  /**
   * Get document templates
   */
  async getTemplates(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/documents/templates?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get templates:', error);
      throw error;
    }
  }

  /**
   * Get a single template
   */
  async getTemplate(templateId) {
    try {
      const response = await api.get(`/documents/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get template:', error);
      throw error;
    }
  }

  /**
   * Create a template
   */
  async createTemplate(data) {
    try {
      const response = await api.post('/documents/templates', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId, data) {
    try {
      const response = await api.put(`/documents/templates/${templateId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId) {
    try {
      const response = await api.delete(`/documents/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  /**
   * Use a template (increment usage count)
   */
  async useTemplate(templateId) {
    try {
      const response = await api.post(`/documents/templates/${templateId}/use`);
      return response.data;
    } catch (error) {
      console.error('Failed to use template:', error);
      throw error;
    }
  }

  /**
   * Apply template to document creation
   */
  async applyTemplate(templateId, variables = {}) {
    try {
      const template = await this.getTemplate(templateId);
      if (!template.success) {
        throw new Error('Template not found');
      }

      // Replace variables in template content
      let content = template.template.template_content;
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, variables[key]);
      });

      return {
        success: true,
        content: content,
        title: template.template.name,
        document_type: template.template.document_type,
        module: template.template.module,
        category: template.template.category
      };
    } catch (error) {
      console.error('Failed to apply template:', error);
      throw error;
    }
  }

  // ============================================================
  // AI CLASSIFICATION
  // ============================================================

  /**
   * Classify a document using AI
   */
  async classifyDocument(data) {
    try {
      const response = await api.post('/documents/classify', data);
      return response.data;
    } catch (error) {
      console.error('Failed to classify document:', error);
      throw error;
    }
  }

  /**
   * Batch classify multiple documents
   */
  async batchClassifyDocuments(documents) {
    try {
      const response = await api.post('/documents/batch-classify', { documents });
      return response.data;
    } catch (error) {
      console.error('Failed to batch classify documents:', error);
      throw error;
    }
  }

  /**
   * Suggest tags for a document
   */
  async suggestTagsForContent(data) {
    try {
      const response = await api.post('/documents/classify/tags', data);
      return response.data;
    } catch (error) {
      console.error('Failed to suggest tags:', error);
      throw error;
    }
  }

  /**
   * Train AI classifier (admin only)
   */
  async trainClassifier(documents, labels) {
    try {
      const response = await api.post('/documents/classify/train', { documents, labels });
      return response.data;
    } catch (error) {
      console.error('Failed to train classifier:', error);
      throw error;
    }
  }

  /**
   * Get classifier status
   */
  async getClassifierStatus() {
    try {
      const response = await api.get('/documents/classify/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get classifier status:', error);
      throw error;
    }
  }

  // ============================================================
  // OCR METHODS
  // ============================================================

  /**
   * Perform OCR on a document file
   */
  async performOCR(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/documents/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 minutes for large files
      });
      return response.data;
    } catch (error) {
      console.error('Failed to perform OCR:', error);
      throw error;
    }
  }

  /**
   * Search within OCR text
   */
  async searchOCRText(text, query) {
    try {
      const response = await api.post('/documents/ocr/search', { text, query });
      return response.data;
    } catch (error) {
      console.error('Failed to search OCR text:', error);
      throw error;
    }
  }

  /**
   * Get OCR status for a document
   */
  async getOCRStatus(documentId) {
    try {
      const response = await api.get(`/documents/ocr/status/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get OCR status:', error);
      throw error;
    }
  }

  // ============================================================
  // EXPIRATION METHODS
  // ============================================================

  /**
   * Get document expiration details
   */
  async getDocumentExpiration(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/expiration`);
      return response.data;
    } catch (error) {
      console.error('Failed to get document expiration:', error);
      throw error;
    }
  }

  /**
   * Get documents created/edited from the standalone sidebar editor.
   * These are stored in the same documents table but flagged editing_source='sidebar'.
   */
  async getEditorDrafts(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(
        `/dm-documents/editor-drafts?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch editor drafts:', error);
      return { documents: [], total: 0 };
    }
  }

  /**
   * Update document expiration settings
   */
  async updateDocumentExpiration(documentId, data) {
    try {
      const response = await api.put(`/documents/${documentId}/expiration`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update document expiration:', error);
      throw error;
    }
  }

  /**
   * Extend document expiration
   */
  async extendDocumentExpiration(documentId, newExpiryDate, reason = '') {
    try {
      const response = await api.post(`/documents/${documentId}/expiration/extend`, {
        new_expiry_date: newExpiryDate,
        reason: reason
      });
      return response.data;
    } catch (error) {
      console.error('Failed to extend document expiration:', error);
      throw error;
    }
  }

  /**
   * Get expiration statistics
   */
  async getExpirationStats() {
    try {
      const response = await api.get('/documents/expiration/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch expiration stats:', error);
      return {
        success: true,
        stats: {
          total: 0,
          active: 0,
          expiring_soon: 0,
          expired: 0,
          completed: 0
        }
      };
    }
  }

  /**
   * Check and send expiration notifications (admin only)
   */
  async checkExpirationNotifications() {
    try {
      const response = await api.post('/documents/expiration/check');
      return response.data;
    } catch (error) {
      console.error('Failed to check expiration notifications:', error);
      throw error;
    }
  }

  // ============================================================
  // DOCUMENT ANALYTICS OVERVIEW (Alias)
  // ============================================================

  /**
   * Get document analytics overview (alias for getDocumentAnalytics)
   */
  async getDocumentAnalyticsOverview(params = {}) {
    try {
      // Clean parameters
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '' && params[key] !== 'all') {
          cleanParams[key] = params[key];
        }
      });
      return await this.getDocumentAnalytics(cleanParams);
    } catch (error) {
      console.error('Failed to fetch analytics overview:', error);
      // Return default data structure
      return {
        success: false,
        overview: { total: 0, draft: 0, review: 0, approved: 0, published: 0, archived: 0 },
        trends: [],
        moduleDistribution: [],
        statusDistribution: [],
        reviewStats: { current: 0, pending: 0, overdue: 0 },
        complianceScore: 0,
        topAuthors: [],
        documentGrowth: []
      };
    }
  }

  /**
   * Get document compliance analytics
   */
  async getDocumentComplianceAnalytics(params = {}) {
    try {
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '' && params[key] !== 'all') {
          cleanParams[key] = params[key];
        }
      });
      return await this.getComplianceAnalytics(cleanParams);
    } catch (error) {
      console.error('Failed to fetch compliance analytics:', error);
      return {
        success: false,
        compliance: {
          overall_score: 0,
          frameworks: [],
          pending_items: 0,
          compliant_items: 0,
          compliance_rate: 0
        }
      };
    }
  }

  // ============================================================
  // PERMISSIONS (current user)
  // ============================================================

  /**
   * Get document permissions for current user
   */
  async getPermissions(params = {}) {
    try {
      // Clean parameters
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });

      const queryParams = new URLSearchParams(cleanParams);
      const response = await api.get(`/documents/permissions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get document permissions:', error);
      // Return null so frontend falls back to plan-based permissions
      return null;
    }
  }

  // ============================================================
  // EXPORT FUNCTIONS (Legacy)
  // ============================================================

  /**
   * Export documents to CSV
   */
  async exportToCSV(filters = {}) {
    try {
      const response = await api.get('/documents/export/csv', {
        params: filters,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documents_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export to CSV failed:', error);
      throw error;
    }
  }

  /**
   * Export documents to PDF
   */
  async exportToPDF(filters = {}) {
    try {
      const response = await api.get('/documents/export/pdf', {
        params: filters,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documents_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export to PDF failed:', error);
      throw error;
    }
  }


    // ============================================================
  // PDF EDITING
  // ============================================================

  /**
   * Get the raw PDF URL for PDF.js consumption.
   */
  getRawDocumentUrl(documentId) {
    const base = (api.defaults.baseURL || '').replace(/\/$/, '');
    return `${base}/documents/${documentId}/raw`;
  }

  /**
   * Save an annotated PDF back to the backend.
   * @param {number} documentId
   * @param {Blob} pdfBlob
   * @param {string} filename
   */
  async saveAnnotatedPdf(documentId, pdfBlob, filename = 'annotated.pdf') {
    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, filename);
      const response = await api.post(
        `/documents/${documentId}/save-annotated`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to save annotated PDF:', error);
      throw error;
    }
  }

  /**
   * Get AcroForm fields for a PDF.
   */
  async getPdfFormFields(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/form-fields`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch form fields:', error);
      return { fields: [], count: 0 };
    }
  }

  // ============================================================
  // PDF FORM FILL + SIGNATURE
  // ============================================================

  /**
   * Fill AcroForm fields and save as a new version.
   * @param {number} documentId
   * @param {object} values  — { field_name: value, ... }
   * @param {boolean} flatten
   */
  async fillPdfForm(documentId, values, flatten = false) {
    try {
      const response = await api.post(
        `/documents/${documentId}/fill-form`,
        { values, flatten }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fill PDF form:', error);
      throw error;
    }
  }

  /**
   * Stamp a signature/initials image onto a PDF page.
   * @param {number} documentId
   * @param {object} payload — { image_data_url, page_number, x_percent, y_percent, width_percent, rotation }
   */
  async stampSignature(documentId, payload) {
    try {
      const response = await api.post(
        `/documents/${documentId}/stamp`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Failed to stamp signature:', error);
      throw error;
    }
  }

  // ============================================================
  // PDF PAGE OPERATIONS
  // ============================================================

  async rotatePdfPages(documentId, pages, degrees = 90) {
    try {
      const response = await api.post(`/documents/${documentId}/pages/rotate`, {
        pages, degrees
      });
      return response.data;
    } catch (error) {
      console.error('Failed to rotate pages:', error);
      throw error;
    }
  }

  async deletePdfPages(documentId, pages) {
    try {
      const response = await api.post(`/documents/${documentId}/pages/delete`, { pages });
      return response.data;
    } catch (error) {
      console.error('Failed to delete pages:', error);
      throw error;
    }
  }

  async reorderPdfPages(documentId, order) {
    try {
      const response = await api.post(`/documents/${documentId}/pages/reorder`, { order });
      return response.data;
    } catch (error) {
      console.error('Failed to reorder pages:', error);
      throw error;
    }
  }

  async insertPdfPages(documentId, payload) {
    try {
      const response = await api.post(`/documents/${documentId}/pages/insert`, payload);
      return response.data;
    } catch (error) {
      console.error('Failed to insert pages:', error);
      throw error;
    }
  }

  async extractPdfPages(documentId, pages, newTitle) {
    try {
      const response = await api.post(`/documents/${documentId}/pages/extract`, {
        pages, new_title: newTitle
      });
      return response.data;
    } catch (error) {
      console.error('Failed to extract pages:', error);
      throw error;
    }
  }

async applyRedactions(documentId, redactions, options = {}) {
  try {
    const response = await api.post(`/documents/${documentId}/redact`, {
      redactions,
      fill_color: options.fillColor || '#000000',
      remove_metadata: options.removeMetadata !== false,
      remove_embedded_files: options.removeEmbeddedFiles !== false,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to apply redactions:', error);
    throw error;
  }
}

async verifyRedactions(documentId, regions) {
  try {
    const response = await api.post(
      `/documents/${documentId}/redact/verify`,
      { regions }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to verify redactions:', error);
    return { leaks: [], has_leaks: false };
  }
}

async applyTextEdits(documentId, edits) {
  try {
    const response = await api.post(
      `/documents/${documentId}/text-edits`,
      { edits }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to apply text edits:', error);
    throw error;
  }
}

  /**
   * Get track-changes / document changes for a document.
   * Falls back gracefully if the backend endpoint isn't ready yet.
   */
  async getDocumentChanges(documentId, params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(
        `/documents/${documentId}/changes?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch changes for ${documentId}:`, error);
      // Return an empty shape so callers don't crash
      return {
        success: false,
        changes: [],
        pendingChanges: [],
        currentHunks: [],
        hasUnsavedChange: false,
      };
    }
  }

  // ============================================================
  // REDACTION (compliance-grade)
  // ============================================================

  async applyRedactions(documentId, payload) {
    try {
      const response = await api.post(`/documents/${documentId}/redact`, payload, {
        timeout: 120000,   // redaction can take a while on large PDFs
      });
      return response.data;
    } catch (error) {
      console.error('Failed to apply redactions:', error);
      throw error;
    }
  }

  async getRedactionLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/redactions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch redaction logs:', error);
      return { redactions: [], total: 0 };
    }
  }

  async downloadRedactionCertificate(logId) {
    try {
      const response = await api.get(
        `/dm-documents/redactions/${logId}/certificate`,
        { responseType: 'blob' }
      );
      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `redaction-certificate-${logId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to download certificate:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ ACCESS CONTROL — backend: /api/dm-documents/... + /api/dm-permissions/...
  // ============================================================

  async getDocumentPermissions(documentId) {
    try {
      const response = await api.get(`/dm-documents/${documentId}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch document permissions:', error);
      return { permissions: [], inherited: [] };
    }
  }

  async addDocumentPermission(data) {
    try {
      const response = await api.post(`/dm-documents/${data.document_id}/permissions`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to add permission:', error);
      throw error;
    }
  }

  async updateDocumentPermission(permissionId, data) {
    try {
      const response = await api.put(`/dm-permissions/${permissionId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update permission:', error);
      throw error;
    }
  }

  async removeDocumentPermission(permissionId) {
    try {
      const response = await api.delete(`/dm-permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove permission:', error);
      throw error;
    }
  }

  async revokeAllDocumentPermissions(documentId) {
    try {
      const response = await api.post(`/dm-documents/${documentId}/permissions/revoke-all`);
      return response.data;
    } catch (error) {
      console.error('Failed to revoke all permissions:', error);
      throw error;
    }
  }

  async getDocumentSecurity(documentId) {
    try {
      const response = await api.get(`/dm-documents/${documentId}/security`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      return null;
    }
  }

  async updateDocumentSecurity(documentId, data) {
    try {
      const response = await api.put(`/dm-documents/${documentId}/security`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update security settings:', error);
      throw error;
    }
  }

  async getAccessAuditLog(documentId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/${documentId}/access-audit?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access audit log:', error);
      return { logs: [] };
    }
  }

  // ============================================================
  // ✨ RETENTION & LEGAL HOLD
  // ============================================================

  async getRetentionPolicies(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/retention/policies?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch retention policies:', error);
      return { policies: [] };
    }
  }

  async getDocumentRetention(documentId) {
    try {
      const response = await api.get(`/dm-documents/${documentId}/retention`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch document retention:', error);
      return null;
    }
  }

  async setDocumentRetention(documentId, data) {
    try {
      const response = await api.put(`/dm-documents/${documentId}/retention`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to set retention policy:', error);
      throw error;
    }
  }

  async getUpcomingDisposals(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/retention/upcoming-disposals?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch upcoming disposals:', error);
      return { items: [] };
    }
  }

  async getLegalHolds(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/retention/legal-holds?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch legal holds:', error);
      return { holds: [] };
    }
  }

  async createLegalHold(data) {
    try {
      const response = await api.post('/dm-documents/retention/legal-holds', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create legal hold:', error);
      throw error;
    }
  }

  async releaseLegalHold(holdId) {
    try {
      const response = await api.post(`/dm-documents/retention/legal-holds/${holdId}/release`);
      return response.data;
    } catch (error) {
      console.error('Failed to release legal hold:', error);
      throw error;
    }
  }

  async getDispositionCertificates(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/retention/certificates?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch disposition certificates:', error);
      return { certificates: [] };
    }
  }

  async downloadDispositionCertificate(certificateId) {
    try {
      const response = await api.get(`/dm-documents/retention/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download certificate:', error);
      throw error;
    }
  }

  async disposeDocument(documentId, data) {
    try {
      const response = await api.post(`/dm-documents/${documentId}/dispose`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to dispose document:', error);
      throw error;
    }
  }

  async extendRetention(documentId, data) {
    try {
      const response = await api.post(`/dm-documents/${documentId}/retention/extend`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to extend retention:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ WATERMARKING
  // ============================================================

  async getWatermarkSettings(documentId) {
    try {
      const response = await api.get(`/dm-documents/${documentId}/watermark`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch watermark settings:', error);
      return null;
    }
  }

  async saveWatermarkSettings(documentId, data) {
    try {
      const response = await api.post(`/dm-documents/${documentId}/watermark`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to save watermark settings:', error);
      throw error;
    }
  }

  async applyWatermark(documentId, data) {
    try {
      const response = await api.post(`/dm-documents/${documentId}/watermark/apply`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to apply watermark:', error);
      throw error;
    }
  }

  async removeWatermark(documentId) {
    try {
      const response = await api.delete(`/dm-documents/${documentId}/watermark`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove watermark:', error);
      throw error;
    }
  }

  async generateWatermarkPreview(documentId, data) {
    try {
      const response = await api.post(`/dm-documents/${documentId}/watermark/preview`, data, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate preview:', error);
      throw error;
    }
  }

  async uploadWatermarkImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/dm-documents/watermark/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload watermark image:', error);
      throw error;
    }
  }

  async getWatermarkLog(documentId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/${documentId}/watermark/log?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch watermark log:', error);
      return { logs: [] };
    }
  }

  // ============================================================
  // ✨ WORKFLOW BUILDER
  // ============================================================

  async getWorkflows(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/workflows?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return { workflows: [] };
    }
  }

  async getWorkflow(workflowId) {
    try {
      const response = await api.get(`/dm-documents/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
      throw error;
    }
  }

  async createWorkflow(data) {
    try {
      const response = await api.post('/dm-documents/workflows', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  }

  async updateWorkflow(workflowId, data) {
    try {
      const response = await api.put(`/dm-documents/workflows/${workflowId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  }

  async deleteWorkflow(workflowId) {
    try {
      const response = await api.delete(`/dm-documents/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  }

  async triggerWorkflow(workflowId, documentId, data = {}) {
    try {
      const response = await api.post(`/dm-documents/workflows/${workflowId}/trigger`, {
        document_id: documentId,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ COMPLIANCE REPORTS
  // ============================================================

  async getComplianceAssessments(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/compliance/assessments?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      return { assessments: [] };
    }
  }

  async getComplianceReports(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/compliance/reports?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance reports:', error);
      return { reports: [] };
    }
  }

  async generateComplianceReportData(config) {
    try {
      const response = await api.post('/dm-documents/compliance/reports/generate', config);
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  async previewComplianceReport(config) {
    try {
      const response = await api.post('/dm-documents/compliance/reports/preview', config);
      return response.data;
    } catch (error) {
      console.error('Failed to preview report:', error);
      throw error;
    }
  }

  async downloadComplianceReport(reportId) {
    try {
      const response = await api.get(`/dm-documents/compliance/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download report:', error);
      throw error;
    }
  }

  async deleteComplianceReport(reportId) {
    try {
      const response = await api.delete(`/dm-documents/compliance/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete report:', error);
      throw error;
    }
  }

  async scheduleComplianceReport(data) {
    try {
      const response = await api.post('/dm-documents/compliance/reports/schedule', data);
      return response.data;
    } catch (error) {
      console.error('Failed to schedule report:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ DOCUMENT BUNDLES
  // ============================================================

  async getBundles(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/bundles?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
      return { bundles: [] };
    }
  }

  async getBundle(bundleId) {
    try {
      const response = await api.get(`/dm-documents/bundles/${bundleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bundle:', error);
      throw error;
    }
  }

  async getBundleDocuments(bundleId) {
    try {
      const response = await api.get(`/dm-documents/bundles/${bundleId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bundle documents:', error);
      return { documents: [] };
    }
  }

  async createBundle(data) {
    try {
      const response = await api.post('/dm-documents/bundles', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create bundle:', error);
      throw error;
    }
  }

  async updateBundle(bundleId, data) {
    try {
      const response = await api.put(`/dm-documents/bundles/${bundleId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update bundle:', error);
      throw error;
    }
  }

  async deleteBundle(bundleId) {
    try {
      const response = await api.delete(`/dm-documents/bundles/${bundleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete bundle:', error);
      throw error;
    }
  }

  async addDocumentsToBundle(bundleId, documentIds) {
    try {
      const response = await api.post(`/dm-documents/bundles/${bundleId}/documents`, {
        document_ids: documentIds
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add documents:', error);
      throw error;
    }
  }

  async removeDocumentFromBundle(bundleId, documentId) {
    try {
      const response = await api.delete(`/dm-documents/bundles/${bundleId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove document:', error);
      throw error;
    }
  }

  async exportBundle(bundleId, options = {}) {
    try {
      const response = await api.post(`/dm-documents/bundles/${bundleId}/export`, options);
      return response.data;
    } catch (error) {
      console.error('Failed to export bundle:', error);
      throw error;
    }
  }

  async shareBundle(bundleId, data) {
    try {
      const response = await api.post(`/dm-documents/bundles/${bundleId}/share`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to share bundle:', error);
      throw error;
    }
  }

  async lockBundle(bundleId, locked) {
    try {
      const response = await api.put(`/dm-documents/bundles/${bundleId}/lock`, { locked });
      return response.data;
    } catch (error) {
      console.error('Failed to update lock state:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ SHARE PORTAL
  // ============================================================

  async getShares(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/shares?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch shares:', error);
      return { shares: [] };
    }
  }

  async createShare(data) {
    try {
      const response = await api.post('/dm-documents/shares', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create share:', error);
      throw error;
    }
  }

  async revokeShare(shareId) {
    try {
      const response = await api.post(`/dm-documents/shares/${shareId}/revoke`);
      return response.data;
    } catch (error) {
      console.error('Failed to revoke share:', error);
      throw error;
    }
  }

  async extendShareExpiry(shareId, days) {
    try {
      const response = await api.post(`/dm-documents/shares/${shareId}/extend`, { days });
      return response.data;
    } catch (error) {
      console.error('Failed to extend expiry:', error);
      throw error;
    }
  }

  async getShareActivity(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/shares/activity?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch share activity:', error);
      return { activities: [] };
    }
  }

  async getShareAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/shares/analytics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch share analytics:', error);
      return { total_views: 0, total_downloads: 0, unique_visitors: 0, total_accesses: 0 };
    }
  }

  // ============================================================
  // ✨ SMART INTAKE
  // ============================================================

  async submitSmartIntake(formData) {
    try {
      const response = await api.post('/dm-documents/intake/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000
      });
      return response.data;
    } catch (error) {
      console.error('Failed to submit for intake:', error);
      throw error;
    }
  }

  async getIntakeQueue(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/intake/queue?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch intake queue:', error);
      return { items: [] };
    }
  }

  async getIntakeStatus(itemId) {
    try {
      const response = await api.get(`/dm-documents/intake/${itemId}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch intake status:', error);
      return { item: {} };
    }
  }

  async getIntakeStats(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/intake/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch intake stats:', error);
      return { total_processed: 0, auto_approved: 0, needs_review: 0, duplicates_found: 0, avg_confidence: 0 };
    }
  }

  async approveIntakeItem(itemId, updates = {}) {
    try {
      const response = await api.post(`/dm-documents/intake/${itemId}/approve`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to approve intake:', error);
      throw error;
    }
  }

  async rejectIntakeItem(itemId, reason) {
    try {
      const response = await api.post(`/dm-documents/intake/${itemId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to reject intake:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ ADVANCED SEARCH & ALERTS
  // ============================================================

  async advancedSearch(params) {
    try {
      const cleanParams = this.cleanParams(params);
      const response = await api.post('/dm-documents/advanced-search', cleanParams);
      return response.data;
    } catch (error) {
      console.error('Advanced search failed:', error);
      return { results: [], total: 0, facets: {}, did_you_mean: null };
    }
  }

  async getSearchSuggestions(query, params = {}) {
    try {
      const queryParams = new URLSearchParams({ q: query, ...params });
      const response = await api.get(`/dm-documents/search/suggestions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      return { suggestions: [] };
    }
  }

  async createSearchAlert(data) {
    try {
      const response = await api.post('/dm-documents/search/alerts', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  }

  async getSearchAlerts() {
    try {
      const response = await api.get('/dm-documents/search/alerts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return { alerts: [] };
    }
  }

  // ============================================================
  // ✨ AI ASSISTANT
  // ============================================================

  async askAssistant(question, context = {}) {
    try {
      const response = await api.post('/dm-documents/assistant/ask', {
        question,
        ...context
      }, { timeout: 120000 });
      return response.data;
    } catch (error) {
      console.error('Assistant query failed:', error);
      throw error;
    }
  }

  async getAssistantConversations(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/assistant/conversations?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      return { conversations: [] };
    }
  }

  async getAssistantConversation(conversationId) {
    try {
      const response = await api.get(`/dm-documents/assistant/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      return { messages: [] };
    }
  }

  async deleteAssistantConversation(conversationId) {
    try {
      const response = await api.delete(`/dm-documents/assistant/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ ANOMALY DETECTION
  // ============================================================

  async getAnomalies(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/anomalies?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
      return { anomalies: [] };
    }
  }

  async getAnomalyStats(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/anomalies/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch anomaly stats:', error);
      return {};
    }
  }

  async getAnomalyPatterns(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/anomalies/patterns?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch patterns:', error);
      return { patterns: {} };
    }
  }

  async getAnomalyTimeline(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/anomalies/timeline?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      return { timeline: [] };
    }
  }

  async getTopOffenders(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/anomalies/top-offenders?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch offenders:', error);
      return { offenders: [] };
    }
  }

  async getUserBaselines(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/anomalies/baselines?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch baselines:', error);
      return { baselines: [] };
    }
  }

  async getDetectionRules(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/anomalies/rules?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      return { rules: [] };
    }
  }

  async saveDetectionRule(data) {
    try {
      const response = await api.post('/dm-documents/anomalies/rules', data);
      return response.data;
    } catch (error) {
      console.error('Failed to save rule:', error);
      throw error;
    }
  }

  async toggleDetectionRule(ruleId, enabled) {
    try {
      const response = await api.put(`/dm-documents/anomalies/rules/${ruleId}/toggle`, { enabled });
      return response.data;
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      throw error;
    }
  }

  async deleteDetectionRule(ruleId) {
    try {
      const response = await api.delete(`/dm-documents/anomalies/rules/${ruleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete rule:', error);
      throw error;
    }
  }

  async runAnomalyDetection(data) {
    try {
      const response = await api.post('/dm-documents/anomalies/detect', data);
      return response.data;
    } catch (error) {
      console.error('Failed to run detection:', error);
      throw error;
    }
  }

  async resolveAnomaly(anomalyId) {
    try {
      const response = await api.post(`/dm-documents/anomalies/${anomalyId}/resolve`);
      return response.data;
    } catch (error) {
      console.error('Failed to resolve anomaly:', error);
      throw error;
    }
  }

  async markFalsePositive(anomalyId) {
    try {
      const response = await api.post(`/dm-documents/anomalies/${anomalyId}/false-positive`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark false positive:', error);
      throw error;
    }
  }

  async blockUser(userId, data) {
    try {
      const response = await api.post(`/dm-documents/users/${userId}/block`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    }
  }

  async bulkAnomalyAction(ids, action) {
    try {
      const response = await api.post('/dm-documents/anomalies/bulk-action', { ids, action });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk action:', error);
      throw error;
    }
  }

  async saveAnomalySettings(data) {
    try {
      const response = await api.post('/dm-documents/anomalies/settings', data);
      return response.data;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ PREDICTIVE ANALYTICS
  // ============================================================

  async getPredictiveForecast(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/predictive/forecast?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
      return { timeline: [], summary: {} };
    }
  }

  async getRiskScores(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/predictive/risk-scores?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch risk scores:', error);
      return { risks: [] };
    }
  }

  async getPredictiveTrends(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/predictive/trends?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      return { trends: [] };
    }
  }

  async getPredictiveRecommendations(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/predictive/recommendations?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      return { recommendations: [] };
    }
  }

  async getPredictiveModels(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/predictive/models?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return { models: [], accuracy: {} };
    }
  }

  async getPredictions(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/predictive/predictions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      return { predictions: [] };
    }
  }

  async trainPredictiveModel(data) {
    try {
      const response = await api.post('/dm-documents/predictive/train', data, { timeout: 300000 });
      return response.data;
    } catch (error) {
      console.error('Failed to train model:', error);
      throw error;
    }
  }

  async generateForecast(data) {
    try {
      const response = await api.post('/dm-documents/predictive/generate-forecast', data);
      return response.data;
    } catch (error) {
      console.error('Failed to generate forecast:', error);
      throw error;
    }
  }

  async exportPredictiveReport(data) {
    try {
      const response = await api.post('/dm-documents/predictive/export', data, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  }

  async createPredictiveAlert(data) {
    try {
      const response = await api.post('/dm-documents/predictive/alerts', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  }

  async savePredictiveSettings(data) {
    try {
      const response = await api.post('/dm-documents/predictive/settings', data);
      return response.data;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ QUALITY MANAGEMENT (QMS)
  // ============================================================

  async getQualityRecords(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/qms/records?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quality records:', error);
      return { records: [] };
    }
  }

  async getQualityRecord(recordId) {
    try {
      const response = await api.get(`/dm-documents/qms/records/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch record:', error);
      throw error;
    }
  }

  async createQualityRecord(data) {
    try {
      const response = await api.post('/dm-documents/qms/records', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create record:', error);
      throw error;
    }
  }

  async updateQualityRecord(recordId, data) {
    try {
      const response = await api.put(`/dm-documents/qms/records/${recordId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update record:', error);
      throw error;
    }
  }

  async updateQualityRecordStatus(recordId, data) {
    try {
      const response = await api.put(`/dm-documents/qms/records/${recordId}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  }

  async deleteQualityRecord(recordId) {
    try {
      const response = await api.delete(`/dm-documents/qms/records/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw error;
    }
  }

  async getQualityDashboard(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/qms/dashboard?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      return {};
    }
  }

  async getQualityMetrics(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/qms/metrics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return { metrics: {} };
    }
  }

  async getQualityTrends(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/qms/trends?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      return { trends: [] };
    }
  }

  async getQualityDistribution(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/qms/distribution?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch distribution:', error);
      return { distributions: {} };
    }
  }

  async saveRCA(recordId, data) {
    try {
      const response = await api.post(`/dm-documents/qms/records/${recordId}/rca`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to save RCA:', error);
      throw error;
    }
  }

  async addQualityAction(recordId, data) {
    try {
      const response = await api.post(`/dm-documents/qms/records/${recordId}/actions`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to add action:', error);
      throw error;
    }
  }

  async verifyQualityAction(recordId, data) {
    try {
      const response = await api.post(`/dm-documents/qms/records/${recordId}/verify`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to verify action:', error);
      throw error;
    }
  }

  async bulkQualityAction(ids, action) {
    try {
      const response = await api.post('/dm-documents/qms/bulk-action', { ids, action });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk action:', error);
      throw error;
    }
  }

    /**
   * Utility: strip null/undefined/empty/'all' values from a params object
   */
  cleanParams(params = {}) {
    const cleaned = {};
    Object.keys(params).forEach(key => {
      if (
        params[key] !== null &&
        params[key] !== undefined &&
        params[key] !== '' &&
        params[key] !== 'all'
      ) {
        cleaned[key] = params[key];
      }
    });
    return cleaned;
  }

  // ============================================================
  // ✨ OFFLINE MANAGER
  // ============================================================

  async getOfflineDocuments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/offline?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch offline documents:', error);
      return { documents: [] };
    }
  }

  async downloadForOffline(documentIds, options = {}) {
    try {
      const response = await api.post('/dm-documents/offline/download', {
        document_ids: documentIds,
        ...options
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download for offline:', error);
      throw error;
    }
  }

  async removeFromOffline(documentIds) {
    try {
      const response = await api.post('/dm-documents/offline/remove', {
        document_ids: documentIds
      });
      return response.data;
    } catch (error) {
      console.error('Failed to remove from cache:', error);
      throw error;
    }
  }

  async getSyncQueue(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/offline/sync-queue?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sync queue:', error);
      return { queue: [] };
    }
  }

  async getSyncConflicts(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/offline/conflicts?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conflicts:', error);
      return { conflicts: [] };
    }
  }

  async syncOfflineChanges(data) {
    try {
      const response = await api.post('/dm-documents/offline/sync', data);
      return response.data;
    } catch (error) {
      console.error('Failed to sync:', error);
      throw error;
    }
  }

  async resolveConflict(conflictId, data) {
    try {
      const response = await api.post(`/dm-documents/offline/conflicts/${conflictId}/resolve`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }

  async removeFromSyncQueue(itemId) {
    try {
      const response = await api.delete(`/dm-documents/offline/sync-queue/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove from queue:', error);
      throw error;
    }
  }

  async getOfflineStats(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/offline/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return {};
    }
  }

  async getOfflineSettings(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/offline/settings?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return { settings: {} };
    }
  }

  async saveOfflineSettings(data) {
    try {
      const response = await api.post('/dm-documents/offline/settings', data);
      return response.data;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async clearOfflineCache(params = {}) {
    try {
      const response = await api.post('/dm-documents/offline/clear-cache', params);
      return response.data;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ INTEGRATION HUB
  // ============================================================

  async getIntegrations(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/integrations?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      return { integrations: [] };
    }
  }

  async connectIntegration(data) {
    try {
      const response = await api.post('/dm-documents/integrations/connect', data);
      return response.data;
    } catch (error) {
      console.error('Failed to connect integration:', error);
      throw error;
    }
  }

  async disconnectIntegration(integrationId, data = {}) {
    try {
      const response = await api.post(`/dm-documents/integrations/${integrationId}/disconnect`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  }

  async testIntegration(integrationId, data = {}) {
    try {
      const response = await api.post(`/dm-documents/integrations/${integrationId}/test`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to test integration:', error);
      return { success: false, error: error.message };
    }
  }

  async triggerIntegrationSync(integrationId, data = {}) {
    try {
      const response = await api.post(`/dm-documents/integrations/${integrationId}/sync`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      throw error;
    }
  }

  async getWebhooks(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/webhooks?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
      return { webhooks: [] };
    }
  }

  async createWebhook(data) {
    try {
      const response = await api.post('/dm-documents/webhooks', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create webhook:', error);
      throw error;
    }
  }

  async toggleWebhook(webhookId, enabled) {
    try {
      const response = await api.put(`/dm-documents/webhooks/${webhookId}/toggle`, { enabled });
      return response.data;
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
      throw error;
    }
  }

  async deleteWebhook(webhookId) {
    try {
      const response = await api.delete(`/dm-documents/webhooks/${webhookId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete webhook:', error);
      throw error;
    }
  }

  async testWebhook(webhookId) {
    try {
      const response = await api.post(`/dm-documents/webhooks/${webhookId}/test`);
      return response.data;
    } catch (error) {
      console.error('Failed to test webhook:', error);
      throw error;
    }
  }

  async getApiKeys(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/api-keys?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      return { api_keys: [] };
    }
  }

  async createApiKey(data) {
    try {
      const response = await api.post('/dm-documents/api-keys', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create API key:', error);
      throw error;
    }
  }

  async revokeApiKey(keyId) {
    try {
      const response = await api.delete(`/dm-documents/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      throw error;
    }
  }

  async getIntegrationActivity(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/integrations/activity?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      return { activities: [] };
    }
  }

  async getIntegrationStats(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/integrations/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return {};
    }
  }

  // ============================================================
  // ✨ CUSTOM REPORT BUILDER
  // ============================================================

  async getCustomReports(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/custom-reports?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch custom reports:', error);
      return { reports: [] };
    }
  }

  async runCustomReport(config) {
    try {
      const response = await api.post('/dm-documents/custom-reports/run', config);
      return response.data;
    } catch (error) {
      console.error('Failed to run report:', error);
      throw error;
    }
  }

  async saveCustomReport(data) {
    try {
      const response = await api.post('/dm-documents/custom-reports', data);
      return response.data;
    } catch (error) {
      console.error('Failed to save report:', error);
      throw error;
    }
  }

  async deleteCustomReport(reportId) {
    try {
      const response = await api.delete(`/dm-documents/custom-reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete report:', error);
      throw error;
    }
  }

  async exportCustomReport(data) {
    try {
      const response = await api.post('/dm-documents/custom-reports/export', data, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  }

  // ============================================================
  // ✨ BUSINESS INTELLIGENCE
  // ============================================================

  async getBIKpis(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/bi/kpis?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      return { kpis: {} };
    }
  }

  async getBITrends(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/bi/trends?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      return { data: [] };
    }
  }

  async getBIDistributions(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/bi/distributions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch distributions:', error);
      return { distributions: {} };
    }
  }

  async getBIUserMetrics(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/bi/user-metrics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user metrics:', error);
      return { metrics: [] };
    }
  }

  async getBICostMetrics(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/bi/cost-metrics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cost metrics:', error);
      return { metrics: {} };
    }
  }

  async getBIBottlenecks(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/bi/bottlenecks?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bottlenecks:', error);
      return { bottlenecks: [] };
    }
  }

  async getBITopContributors(params = {}) {
    try {
      const queryParams = new URLSearchParams(this.cleanParams(params));
      const response = await api.get(`/dm-documents/bi/top-contributors?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contributors:', error);
      return { contributors: [] };
    }
  }

  async getBIDrilldown(params) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/bi/drilldown?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch drilldown:', error);
      return { items: [] };
    }
  }

  async getBIDashboards(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/dm-documents/bi/dashboards?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
      return { dashboards: [] };
    }
  }

  async saveBIDashboard(data) {
    try {
      const response = await api.post('/dm-documents/bi/dashboards', data);
      return response.data;
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      throw error;
    }
  }

  async shareBIDashboard(data) {
    try {
      const response = await api.post('/dm-documents/bi/dashboards/share', data);
      return response.data;
    } catch (error) {
      console.error('Failed to share dashboard:', error);
      throw error;
    }
  }
}

  


// Export singleton instance
const documentService = new DocumentService();
export default documentService;
