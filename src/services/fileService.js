// src/services/fileService.js
import api from './api';

class FileService {
  async uploadDocument(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async uploadMultipleDocuments(files, metadata = {}) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await api.post('/documents/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async analyzeDocument(documentId, analysisType = 'safety') {
    const response = await api.post('/documents/analyze', {
      document_id: documentId,
      analysis_type: analysisType
    });
    
    return response.data;
  }

  async analyzeMultipleDocuments(documentIds, analysisType = 'safety') {
    const response = await api.post('/documents/analyze-multi', {
      document_ids: documentIds,
      analysis_type: analysisType
    });
    
    return response.data;
  }

  async getDocuments(filters = {}) {
    const response = await api.get('/documents', { params: filters });
    return response.data;
  }

  async deleteDocument(documentId) {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  }

  // File validation
  validateFile(file, allowedTypes = ['pdf', 'doc', 'docx', 'txt']) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(fileExtension);
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
    
    return {
      isValid: isValidType && isValidSize,
      errors: [
        !isValidType && `File type .${fileExtension} is not supported`,
        !isValidSize && 'File size must be less than 10MB'
      ].filter(Boolean)
    };
  }
}

export default new FileService();