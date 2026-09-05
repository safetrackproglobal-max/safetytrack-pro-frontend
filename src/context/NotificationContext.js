// src/context/NotificationContext.js - YOUR ORIGINAL WORKING VERSION
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Fetch notifications for the logged-in user
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch("/api/notifications", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Handle both array response and paginated response
        const notificationsArray = Array.isArray(data) ? data : (data.notifications || []);
        setNotifications(notificationsArray);
        setUnreadCount(notificationsArray.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function markAllRead() {
    try {
      const token = localStorage.getItem('token');
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNotifications(n => n.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  async function markAsRead(notificationId) {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNotifications(n => 
        n.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  function pushNotification(newNotif) {
    const notificationWithDefaults = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      date: new Date().toISOString(),
      type: 'info',
      ...newNotif
    };

    setNotifications(n => [notificationWithDefaults, ...n]);
    setUnreadCount(count => count + 1);
    setToasts(t => [notificationWithDefaults, ...t].slice(0, 3));
    setTimeout(() => setToasts(t => t.slice(1)), 5000);
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
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook for incident-specific notifications
export const useIncidentNotifications = () => {
  const { pushNotification, refreshNotifications } = useContext(NotificationContext);

  const notifyNewIncident = useCallback((incidentData) => {
    pushNotification({
      title: '🚨 New Safety Incident Reported',
      message: `${incidentData.industryName || 'Unknown'} - ${incidentData.incidentType || incidentData.incident_type} (${incidentData.severity})`,
      type: 'incident',
      priority: incidentData.severity,
      data: incidentData,
      action: `/incidents/${incidentData.id}`
    });
  }, [pushNotification]);

  const notifyIncidentStatusUpdate = useCallback((incidentId, newStatus, updatedBy) => {
    pushNotification({
      title: '📋 Incident Status Updated',
      message: `Incident #${incidentId} status changed to ${newStatus} by ${updatedBy}`,
      type: 'incident_update',
      data: { incidentId, newStatus, updatedBy },
      action: `/incidents/${incidentId}`
    });
  }, [pushNotification]);

  const notifyIncidentReportSuccess = useCallback((industryName) => {
    pushNotification({
      title: '✅ Incident Reported Successfully',
      message: `Your ${industryName} incident has been submitted. Managers have been automatically notified via email.`,
      type: 'success',
      autoHide: true
    });
  }, [pushNotification]);

  const notifyIncidentReportError = useCallback((errorMessage) => {
    pushNotification({
      title: '❌ Incident Report Failed',
      message: errorMessage || 'There was an error submitting your incident report. Please try again.',
      type: 'error',
      autoHide: true
    });
  }, [pushNotification]);

  return {
    notifyNewIncident,
    notifyIncidentStatusUpdate,
    notifyIncidentReportSuccess,
    notifyIncidentReportError,
    refreshNotifications
  };
};

export default NotificationContext;