// src/services/pdfService.js
// PDF Service - Handles PDF generation, export, and AI features

import api from './api';

class PDFService {
  /**
   * Export content to PDF
   */
  async exportToPDF(data) {
    try {
      const response = await api.post('/api/pdf/export', data, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }

  /**
   * Export to Word document
   */
  async exportToWord(data) {
    try {
      const response = await api.post('/api/pdf/export/word', data, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Word export failed:', error);
      throw error;
    }
  }

  /**
   * Get AI editing suggestions
   */
  async getAIEditingSuggestions(data) {
    try {
      const response = await api.post('/api/pdf/ai/suggestions', data);
      return response.data.suggestions || [];
    } catch (error) {
      console.error('AI suggestions failed:', error);
      return [];
    }
  }

  /**
   * Enhance document content with AI
   */
  async enhanceDocumentContent(data) {
    try {
      const response = await api.post('/api/pdf/ai/enhance', data);
      return response.data.content || data.content;
    } catch (error) {
      console.error('AI enhance failed:', error);
      throw error;
    }
  }

  /**
   * Summarize document with AI
   */
  async summarizeDocument(data) {
    try {
      const response = await api.post('/api/pdf/ai/summarize', data);
      return response.data.summary || 'Unable to generate summary';
    } catch (error) {
      console.error('AI summarize failed:', error);
      return 'Unable to generate summary';
    }
  }

  /**
   * Generate PDF from template
   */
  async generatePDFFromTemplate(data) {
    try {
      const response = await api.post('/api/pdf/generate', data, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }

  /**
   * Merge multiple PDFs
   */
  async mergePDFs(data) {
    try {
      const formData = new FormData();
      data.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      formData.append('metadata', JSON.stringify(data.metadata || {}));
      
      const response = await api.post('/api/pdf/merge', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('PDF merge failed:', error);
      throw error;
    }
  }

  /**
   * Add watermark to PDF
   */
  async addWatermark(data) {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('text', data.text);
      formData.append('opacity', data.opacity || 0.3);
      formData.append('position', data.position || 'center');
      
      const response = await api.post('/api/pdf/watermark', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Add watermark failed:', error);
      throw error;
    }
  }

  /**
   * Extract text from PDF
   */
  async extractTextFromPDF(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/pdf/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.text || '';
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      throw error;
    }
  }

  /**
   * Convert PDF to images
   */
  async convertPDFToImages(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/pdf/to-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('PDF to images conversion failed:', error);
      throw error;
    }
  }

  /**
   * Compress PDF
   */
  async compressPDF(file, level = 'medium') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('level', level);
      
      const response = await api.post('/api/pdf/compress', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('PDF compression failed:', error);
      throw error;
    }
  }

  /**
   * Sign PDF with certificate
   */
  async signPDF(file, signatureData) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signatureData.signature);
      formData.append('name', signatureData.name || '');
      formData.append('reason', signatureData.reason || '');
      formData.append('location', signatureData.location || '');
      
      const response = await api.post('/api/pdf/sign', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('PDF signing failed:', error);
      throw error;
    }
  }

  /**
   * Get PDF preview URL
   */
  async getPreviewURL(documentId) {
    try {
      const response = await api.get(`/api/pdf/preview/${documentId}`);
      return response.data.preview_url || null;
    } catch (error) {
      console.error('Get PDF preview failed:', error);
      return null;
    }
  }
}

// Export singleton instance
const pdfService = new PDFService();
export default pdfService;