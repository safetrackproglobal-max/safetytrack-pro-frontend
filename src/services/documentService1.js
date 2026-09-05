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
      const response = await api.get(`/api/documents?${params.toString()}`);
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
      const response = await api.get(`/api/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document with file upload
   * Enhanced with module, priority, expiry, and confidentiality fields
   */
  async createDocument(data) {
    try {
      const formData = new FormData();
      
      // Required fields
      formData.append('title', data.title);
      formData.append('document_type', data.document_type);
      
      // Optional fields
      if (data.description) formData.append('description', data.description);
      if (data.category) formData.append('category', data.category);
      if (data.module) formData.append('module', data.module);
      if (data.priority) formData.append('priority', data.priority);
      if (data.site_id) formData.append('site_id', data.site_id);
      if (data.company_id) formData.append('company_id', data.company_id);
      if (data.expires_at) formData.append('expires_at', data.expires_at);
      
      // Boolean fields
      formData.append('is_confidential', data.is_confidential ? 'true' : 'false');
      formData.append('requires_approval', data.requires_approval !== false ? 'true' : 'false');
      
      // Tags (array to JSON string)
      if (data.tags && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags));
      }
      
      // Approval workflow
      if (data.approval_workflow) {
        formData.append('approval_workflow', data.approval_workflow);
      }
      
      // File
      if (data.file) {
        formData.append('file', data.file);
      }
      
      const response = await api.post('/api/documents', formData, {
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
      const response = await api.put(`/api/documents/${id}`, data);
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
      const response = await api.delete(`/api/documents/${id}`);
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
      const response = await api.post(`/api/documents/${id}/restore`);
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
      const response = await api.get(`/api/documents/${documentId}/versions`);
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
      
      const response = await api.post(`/api/documents/${documentId}/version`, formData, {
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
      const response = await api.post(`/api/documents/${documentId}/rollback`, { version: versionNumber });
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
      const response = await api.post(`/api/documents/${id}/submit`, { reviewer_id: reviewerId });
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
      const response = await api.post(`/api/documents/${id}/review`, {
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
      const response = await api.post(`/api/documents/${id}/approve`, { comment });
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
      const response = await api.post(`/api/documents/${id}/reject`, { reason });
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
      const response = await api.post(`/api/documents/${id}/publish`);
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
      const response = await api.post(`/api/documents/${id}/archive`, { reason });
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
      const response = await api.get(`/api/documents/${documentId}/comments`);
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
      const response = await api.post(`/api/documents/${documentId}/comments`, {
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
      const response = await api.put(`/api/documents/comments/${commentId}`, { content });
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
      const response = await api.delete(`/api/documents/comments/${commentId}`);
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
      
      const response = await api.get(`/api/documents/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search documents:', error);
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
      const response = await api.get(`/api/documents/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch document stats:', error);
      throw error;
    }
  }

  /**
   * Get document analytics (detailed)
   */
  async getAnalytics(params = {}) {
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
      const response = await api.get(`/api/documents/analytics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch document analytics:', error);
      throw error;
    }
  }

  /**
   * Download document
   */
  async downloadDocument(id) {
    try {
      const response = await api.get(`/api/documents/${id}/download`, {
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
      const response = await api.get(`/api/documents/${id}/preview`);
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
      const response = await api.post('/api/documents/bulk-download', { ids }, {
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
      const response = await api.post(`/api/documents/${documentId}/analyze`);
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
      const response = await api.get(`/api/documents/${documentId}/suggest-tags`);
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
      const response = await api.get(`/api/documents/${documentId}/extract-info`);
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
      const response = await api.post(`/api/documents/${documentId}/check-compliance`);
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
      const response = await api.post(`/api/documents/${documentId}/share`, data);
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
      const response = await api.get(`/api/documents/${documentId}/sharing`);
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
      const response = await api.delete(`/api/documents/${documentId}/share/${userId}`);
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
   * Get expiring documents
   */
  async getExpiringDocuments(days = 30) {
    try {
      const response = await api.get(`/api/documents/expiring?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch expiring documents:', error);
      throw error;
    }
  }

  /**
   * Extend expiry date
   */
  async extendExpiry(documentId, newExpiryDate) {
    try {
      const response = await api.post(`/api/documents/${documentId}/extend-expiry`, {
        new_expiry_date: newExpiryDate
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to extend expiry for ${documentId}:`, error);
      throw error;
    }
  }

  // ============================================================
  // BULK OPERATIONS
  // ============================================================
  
  /**
   * Bulk update document status
   */
  async bulkUpdateStatus(ids, status) {
    try {
      const response = await api.post('/api/documents/bulk/status', { ids, status });
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
      const response = await api.post('/api/documents/bulk/delete', { ids });
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
      const response = await api.post('/api/documents/bulk/tags', { ids, tags });
      return response.data;
    } catch (error) {
      console.error('Bulk tag assignment failed:', error);
      throw error;
    }
  }

  // ============================================================
  // EXPORT FUNCTIONS
  // ============================================================
  
  /**
   * Export documents to CSV
   */
  async exportToCSV(filters = {}) {
    try {
      const response = await api.get('/api/documents/export/csv', {
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
      const response = await api.get('/api/documents/export/pdf', {
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