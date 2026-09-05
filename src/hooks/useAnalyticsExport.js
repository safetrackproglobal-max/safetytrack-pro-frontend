// src/hooks/useAnalyticsExport.js
import { useState, useCallback } from 'react';
import { message } from 'antd';
import analyticsExportService from '../services/analyticsExportService';

export const useAnalyticsExport = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exports, setExports] = useState([]);

  /**
   * Generate new analytics export
   */
  const generateExport = useCallback(async (exportData) => {
    setExporting(true);
    try {
      const result = await analyticsExportService.generateExport(exportData);
      message.success('Export generation started successfully');
      return result;
    } catch (error) {
      message.error(error.message);
      throw error;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Download export file
   */
  const downloadExport = useCallback(async (exportId, filename) => {
    setLoading(true);
    try {
      const response = await analyticsExportService.downloadExport(exportId);
      
      // Create blob and download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `analytics-export-${exportId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Export downloaded successfully');
      return true;
    } catch (error) {
      message.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load export history
   */
  const loadExportHistory = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const history = await analyticsExportService.getExportHistory(filters);
      setExports(history.exports || []);
      return history;
    } catch (error) {
      message.error(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete export record
   */
  const deleteExport = useCallback(async (exportId) => {
    try {
      await analyticsExportService.deleteExport(exportId);
      setExports(prev => prev.filter(exp => exp.id !== exportId));
      message.success('Export deleted successfully');
      return true;
    } catch (error) {
      message.error(error.message);
      return false;
    }
  }, []);

  /**
   * Check export status
   */
  const checkExportStatus = useCallback(async (exportId) => {
    try {
      const status = await analyticsExportService.getExportStatus(exportId);
      return status;
    } catch (error) {
      message.error(error.message);
      return null;
    }
  }, []);

  return {
    loading,
    exporting,
    exports,
    generateExport,
    downloadExport,
    loadExportHistory,
    deleteExport,
    checkExportStatus
  };
};