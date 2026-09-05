// src/hooks/useDashboard.js
import { useState, useEffect, useContext } from 'react';
import { message } from 'antd';
import AuthContext from '../context/AuthContext';
import dashboardService from '../services/dashboardService';

export const useDashboard = (module = null) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadDashboardData();
  }, [module, user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (user.role === 'employee') {
        data = await dashboardService.getEmployeeDashboard();
      } else if (user.role === 'admin') {
        data = await dashboardService.getAdminDashboard();
      } else {
        const userModule = module || user.module || 'hse';
        data = await dashboardService.getUserDashboard(userModule);
      }
      
      setDashboardData(data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    loadDashboardData();
  };

  return {
    dashboardData,
    loading,
    error,
    refreshDashboard,
    userRole: user?.role,
    userModule: user?.module
  };
};

// Hook for AI Documents
export const useAIDocuments = () => {
  const [generating, setGenerating] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const generateDocument = async (prompt, template, module = null) => {
    setGenerating(true);
    try {
      const result = await dashboardService.generateAIDocument(prompt, template, module);
      setDocuments(prev => [result, ...prev]);
      message.success('Document generated successfully!');
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate document';
      message.error(errorMessage);
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const loadDocumentHistory = async () => {
    setHistoryLoading(true);
    try {
      const history = await dashboardService.getAIDocumentHistory();
      setDocuments(history);
      return history;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load document history';
      message.error(errorMessage);
      throw error;
    } finally {
      setHistoryLoading(false);
    }
  };

  return {
    generating,
    documents,
    historyLoading,
    generateDocument,
    loadDocumentHistory
  };
};

// Hook for Module Analytics
export const useModuleAnalytics = (module, timeframe = 'monthly') => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAnalytics = async (newModule = module, newTimeframe = timeframe) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await dashboardService.getModuleAnalytics(newModule, newTimeframe);
      setAnalytics(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load analytics';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (module) {
      loadAnalytics();
    }
  }, [module, timeframe]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: loadAnalytics
  };
};

// Hook for Incidents Management
export const useIncidents = (module = null, filters = {}) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadIncidents = async (newModule = module, newFilters = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (newModule) {
        data = await dashboardService.getModuleIncidents(newModule, newFilters);
      } else {
        data = await dashboardService.getAllIncidents(newFilters);
      }
      setIncidents(data.incidents || data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load incidents';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reportIncident = async (incidentData) => {
    try {
      const result = await dashboardService.reportIncident(incidentData);
      message.success('Incident reported successfully!');
      // Refresh incidents list
      await loadIncidents();
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to report incident';
      message.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [module, JSON.stringify(filters)]);

  return {
    incidents,
    loading,
    error,
    refreshIncidents: loadIncidents,
    reportIncident
  };
};

// Hook for Notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await dashboardService.getNotifications();
      setNotifications(data.notifications || data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load notifications';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await dashboardService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      message.success('Notification marked as read');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to mark notification as read';
      message.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    refreshNotifications: loadNotifications,
    markAsRead,
    unreadCount: notifications.filter(n => !n.read).length
  };
};

// Hook for AI Insights
export const useAIInsights = (module) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadInsights = async (newModule = module) => {
    if (!newModule) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dashboardService.getAIInsights(newModule);
      setInsights(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load AI insights';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (module) {
      loadInsights();
    }
  }, [module]);

  return {
    insights,
    loading,
    error,
    refreshInsights: loadInsights
  };
};

// Hook for Monitoring
export const useMonitoring = () => {
  const [cameraFeeds, setCameraFeeds] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMonitoringData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [feedsData, alertsData] = await Promise.all([
        dashboardService.getCameraFeeds(),
        dashboardService.getMonitoringAlerts()
      ]);
      
      setCameraFeeds(feedsData.cameras || feedsData);
      setAlerts(alertsData.alerts || alertsData);
      
      return { feeds: feedsData, alerts: alertsData };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load monitoring data';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
  }, []);

  return {
    cameraFeeds,
    alerts,
    loading,
    error,
    refreshMonitoring: loadMonitoringData
  };
};

// Hook for Module Data
export const useModuleData = (module) => {
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadModuleData = async (newModule = module) => {
    if (!newModule) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let data;
      switch (newModule) {
        case 'hospital':
          data = await dashboardService.getHospitalData();
          break;
        case 'hse':
          data = await dashboardService.getHSEData();
          break;
        case 'environmental':
          data = await dashboardService.getEnvironmentalData();
          break;
        case 'quality':
          data = await dashboardService.getQualityData();
          break;
        default:
          throw new Error(`Unknown module: ${newModule}`);
      }
      
      setModuleData(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || `Failed to load ${newModule} data`;
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (module) {
      loadModuleData();
    }
  }, [module]);

  return {
    moduleData,
    loading,
    error,
    refreshModuleData: loadModuleData
  };
};