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

  // src/services/documentService.js

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

  // src/services/documentService.js

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
 * Get review history for a document
 */
async getReviewHistory(documentId) {
  try {
    const response = await api.get(`/documents/${documentId}/review-history`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch review history:', error);
    return { data: [], history: [] };
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
    console.error('Failed to update review date:', error);
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
    console.error('Failed to complete review:', error);
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
   * Get all signatures for a document
   */
  async getDocumentSignatures(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/signatures`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch signatures for ${documentId}:`, error);
      throw error;
    }
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
  // In documentService.js
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
  async suggestTags(data) {
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
        return await this.getDocumentAnalytics(params);
    } catch (error) {
        console.error('Failed to fetch analytics overview:', error);
        throw error;
    }
}

/**
 * Get document compliance analytics (alias for getComplianceAnalytics)
 */
async getDocumentComplianceAnalytics(params = {}) {
    try {
        return await this.getComplianceAnalytics(params);
    } catch (error) {
        console.error('Failed to fetch compliance analytics:', error);
        throw error;
    }
}

// ============================================================
// EXPIRATION STATS (Fixed)
// ============================================================

/**
 * Get expiration statistics
 */
async getExpirationStats() {
    try {
        const response = await api.get('/documents/expiration/stats');
        return response.data;
    } catch (error) {
        console.error('Failed to get expiration stats:', error);
        // Return default stats
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

 // src/services/documentService.js

// Add this method to the DocumentService class

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
}

// Export singleton instance
const documentService = new DocumentService();
export default documentService;