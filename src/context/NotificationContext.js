// src/context/NotificationContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import api from '../services/api';   // ← shared axios instance (has baseURL + JWT interceptor)

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // ============================================================
  // FETCH — uses api.get('/notifications') so it targets the backend
  // ============================================================
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/notifications');
      const data = res.data;

      // Handle both array response and paginated { notifications: [...] } response
      const notificationsArray = Array.isArray(data)
        ? data
        : (data.notifications || []);

      setNotifications(notificationsArray);
      setUnreadCount(
        notificationsArray.filter((n) => !n.read && !n.is_read).length
      );
    } catch (error) {
      // Non-blocking — swallow to avoid console spam
      console.warn('Notifications unavailable:', error?.message || error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      await fetchNotifications();
    } catch (error) {
      console.warn('Failed to refresh notifications:', error?.message || error);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ============================================================
  // MARK ALL AS READ — POST via api
  // ============================================================
  async function markAllRead() {
    try {
      await api.post('/notifications/mark-read');
      setNotifications((n) => n.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.warn('Failed to mark all as read:', error?.message || error);
    }
  }

  // ============================================================
  // MARK SINGLE AS READ — POST via api
  // ============================================================
  async function markAsRead(notificationId) {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications((n) =>
        n.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.warn('Failed to mark notification as read:', error?.message || error);
    }
  }

  // ============================================================
  // PUSH — local in-app toast only (no network call)
  // ============================================================
  function pushNotification(newNotif) {
    const notificationWithDefaults = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      date: new Date().toISOString(),
      type: 'info',
      ...newNotif,
    };

    setNotifications((n) => [notificationWithDefaults, ...n]);
    setUnreadCount((count) => count + 1);
    setToasts((t) => [notificationWithDefaults, ...t].slice(0, 3));
    setTimeout(() => setToasts((t) => t.slice(1)), 5000);
  }

  const contextValue = {
    notifications,
    unreadCount,
    markAllRead,
    markAsRead,
    pushNotification,
    toasts,
    setToasts,
    fetchNotifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// ============================================================
// Custom hook for incident-specific notifications
// ============================================================
export const useIncidentNotifications = () => {
  const { pushNotification, refreshNotifications } = useContext(NotificationContext);

  const notifyNewIncident = useCallback(
    (incidentData) => {
      pushNotification({
        title: '🚨 New Safety Incident Reported',
        message: `${incidentData.industryName || 'Unknown'} - ${
          incidentData.incidentType || incidentData.incident_type
        } (${incidentData.severity})`,
        type: 'incident',
        priority: incidentData.severity,
        data: incidentData,
        action: `/incidents/${incidentData.id}`,
      });
    },
    [pushNotification]
  );

  const notifyIncidentStatusUpdate = useCallback(
    (incidentId, newStatus, updatedBy) => {
      pushNotification({
        title: '📋 Incident Status Updated',
        message: `Incident #${incidentId} status changed to ${newStatus} by ${updatedBy}`,
        type: 'incident_update',
        data: { incidentId, newStatus, updatedBy },
        action: `/incidents/${incidentId}`,
      });
    },
    [pushNotification]
  );

  const notifyIncidentReportSuccess = useCallback(
    (industryName) => {
      pushNotification({
        title: '✅ Incident Reported Successfully',
        message: `Your ${industryName} incident has been submitted. Managers have been automatically notified via email.`,
        type: 'success',
        autoHide: true,
      });
    },
    [pushNotification]
  );

  const notifyIncidentReportError = useCallback(
    (errorMessage) => {
      pushNotification({
        title: '❌ Incident Report Failed',
        message:
          errorMessage ||
          'There was an error submitting your incident report. Please try again.',
        type: 'error',
        autoHide: true,
      });
    },
    [pushNotification]
  );

  return {
    notifyNewIncident,
    notifyIncidentStatusUpdate,
    notifyIncidentReportSuccess,
    notifyIncidentReportError,
    refreshNotifications,
  };
};

export default NotificationContext;
