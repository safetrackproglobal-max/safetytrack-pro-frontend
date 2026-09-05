import api from './api';

export const uploadService = {
  // Upload file with progress tracking
  uploadFile: async (file, folder = 'general', description = '', onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('description', description);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
        timeout: 30000, // 30 seconds for large files
      });

      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
  },

  // Get storage status
  getStorageStatus: async () => {
    try {
      const response = await api.get('/storage/status');
      return response.data;
    } catch (error) {
      console.error('Storage status error:', error);
      throw new Error(error.response?.data?.error || 'Failed to get storage status');
    }
  },

  // Get file URL (for serving files)
  getFileUrl: (filename) => {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/files/${filename}`;
  },

  // Download file
  downloadFile: async (filename, originalFilename = null) => {
    try {
      const response = await api.get(`/files/${filename}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFilename || filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error(error.response?.data?.error || 'Download failed');
    }
  },
};

// File validation utilities
export const fileUtils = {
  // Allowed file types
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ],

  // Allowed file extensions
  allowedExtensions: [
    '.jpg', '.jpeg', '.png', '.gif', '.pdf',
    '.doc', '.docx', '.xls', '.xlsx', '.txt',
    '.zip', '.rar'
  ],

  // Validate file type
  validateFileType: (file) => {
    return fileUtils.allowedFileTypes.includes(file.type) || 
           fileUtils.allowedExtensions.some(ext => 
             file.name.toLowerCase().endsWith(ext)
           );
  },

  // Validate file size (10MB max)
  validateFileSize: (file, maxSizeMB = 10) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    return file.size <= maxSize;
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file icon based on type
  getFileIcon: (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const iconMap = {
      'pdf': 'file-pdf',
      'doc': 'file-word',
      'docx': 'file-word',
      'xls': 'file-excel',
      'xlsx': 'file-excel',
      'jpg': 'file-image',
      'jpeg': 'file-image',
      'png': 'file-image',
      'gif': 'file-image',
      'txt': 'file-text',
      'zip': 'file-zip',
      'rar': 'file-zip'
    };
    return iconMap[extension] || 'file';
  }
};

export default uploadService;