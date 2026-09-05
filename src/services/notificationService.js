
// src/services/notificationService.js - COMPLETE FIXED VERSION
import api from './api';

class NotificationService {
  // ==================== INCIDENT REPORTING ====================
  
  // Report a new safety incident
  async reportIncident(incidentData) {
    try {
      const response = await api.post('/incidents/report', {
        ...incidentData,
        reportedAt: new Date().toISOString(),
        status: 'reported'
      });
      
      // Trigger immediate notifications
      if (response.data.success) {
        await this.notifyNewIncident(response.data.incident);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to report incident');
    }
  }

  // Get all incidents with filters
  async getIncidents(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          if (Array.isArray(filters[key])) {
            filters[key].forEach(value => params.append(`${key}[]`, value));
          } else {
            params.append(key, filters[key]);
          }
        }
      });

      const response = await api.get(`/incidents?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch incidents');
    }
  }

  // Get single incident by ID
  async getIncidentById(id) {
    try {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch incident');
    }
  }

  // Update incident status
  async updateIncidentStatus(id, status, notes = '') {
    try {
      // Handle both function signatures
      let statusData;
      if (typeof status === 'object') {
        const statusValue = status.status || status;
        statusData = {
          status: statusValue,
          notes: status.notes || notes || '',
          updatedBy: status.updatedBy || localStorage.getItem('userId'),
          updatedAt: status.updatedAt || new Date().toISOString()
        };
      } else {
        statusData = {
          status: status,
          notes: notes || '',
          updatedBy: localStorage.getItem('userId'),
          updatedAt: new Date().toISOString()
        };
      }

      // Make sure status is a string
      if (typeof statusData.status === 'object') {
        statusData.status = statusData.status.status || statusData.status;
      }

      console.log('📤 Updating status with:', statusData);

      const response = await api.put(`/incidents/${id}/status`, statusData);
      
      // Notify about status change
      if (response.data.success) {
        await this.notifyIncidentStatusChange(id, statusData.status, statusData.notes);
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        throw new Error(JSON.stringify({
          message: errorData.error || 'Failed to update incident status',
          code: errorData.code,
          suggestion: errorData.suggestion,
          current_status: errorData.current_status,
          requested_status: errorData.requested_status
        }));
      }
      throw new Error(error.response?.data?.message || 'Failed to update incident status');
    }
  }

  // Assign investigator to incident
  async assignInvestigator(id, investigatorId) {
    try {
      const response = await api.put(`/incidents/${id}/assign`, {
        investigatorId,
        assignedBy: localStorage.getItem('userId'),
        assignedAt: new Date().toISOString()
      });
      
      // Notify investigator
      if (response.data.success) {
        await this.notifyInvestigatorAssignment(id, investigatorId);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign investigator');
    }
  }

  // Add investigation notes
  async addInvestigationNotes(id, notes) {
    try {
      const response = await api.post(`/incidents/${id}/investigation-notes`, {
        notes,
        addedBy: localStorage.getItem('userId'),
        addedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add investigation notes');
    }
  }

  // ==================== EVIDENCE MANAGEMENT ====================
  
  // Upload evidence file
  async uploadEvidence(incidentId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('incidentId', incidentId);

      const response = await api.post(`/incidents/${incidentId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload evidence');
    }
  }

  // Get attachments for an incident
  async getAttachments(incidentId) {
    try {
      const response = await api.get(`/incidents/${incidentId}/attachments`);
      return response.data;
    } catch (error) {
      console.error('Fetch attachments error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch attachments');
    }
  }

  // Delete an attachment
  async deleteAttachment(attachmentId) {
    try {
      const response = await api.delete(`/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete attachment error:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete attachment');
    }
  }

  // Download an attachment
  async downloadAttachment(attachmentId) {
    try {
      const response = await api.get(`/attachments/${attachmentId}/download`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Try to get filename from content-disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error(error.response?.data?.error || 'Failed to download attachment');
    }
  }

  // ==================== STATISTICS & EXPORTS ====================

  // Get incident statistics
  async getIncidentStats(timeRange = 'month') {
    try {
      const response = await api.get(`/incidents/stats?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch incident statistics');
    }
  }

  // Export incidents to CSV/Excel
  async exportIncidents(filters = {}) {
    try {
      const response = await api.post('/incidents/export', filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export incidents');
    }
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  // Get all notifications for current user
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      
      console.log('🔔 getNotifications API response:', response.data);
      
      if (response.data && response.data.success) {
        const notifications = response.data.notifications.map(notification => ({
          ...notification,
          read: notification.is_read !== undefined ? notification.is_read : false,
          date: notification.created_at || notification.date,
          type: notification.type || 'info',
          priority: notification.priority || 'medium',
          category: notification.category || 'system',
          is_read: notification.is_read
        }));
        
        console.log('🔔 Processed notifications:', notifications);
        return notifications;
        
      } else if (Array.isArray(response.data)) {
        return response.data.map(notification => ({
          ...notification,
          read: notification.is_read !== undefined ? notification.is_read : false,
          date: notification.created_at || notification.date,
          is_read: notification.is_read
        }));
      }
      
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      return [];
    }
  }

  // Mark single notification as read
  async markAsRead(notificationId) {
    try {
      console.log('🔔 Marking notification as read:', notificationId);
      const response = await api.post(`/notifications/${notificationId}/read`);
      
      console.log('🔔 Mark as read response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllRead() {
    try {
      console.log('🔔 Marking all notifications as read');
      const response = await api.post('/notifications/read-all');
      
      console.log('🔔 Mark all read response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
      throw error;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId) {
    try {
      const response = await api.get(`/notifications/preferences/${userId}`);
      return response.data;
    } catch (error) {
      return {
        email: true,
        push: true,
        sms: false,
        incidentAlerts: true,
        statusUpdates: true,
        dailyDigest: false
      };
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId, preferences) {
    try {
      const response = await api.put(`/notifications/preferences/${userId}`, preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
    }
  }

  // ==================== SPECIFIC NOTIFICATION TYPES ====================

  // Notify about new incident
  async notifyNewIncident(incidentData) {
    try {
      const notification = {
        title: '🚨 New Safety Incident Reported',
        message: `${incidentData.industryName} - ${incidentData.incidentType} (${incidentData.severity})`,
        type: 'incident',
        priority: this.getPriorityLevel(incidentData.severity),
        category: 'safety',
        data: incidentData,
        actionUrl: `/incidents/${incidentData.id}`,
        recipients: ['managers', 'safety_team']
      };

      await this.createNotification(notification);
      this.emitSocketNotification('new_incident', notification);
      
      return { success: true };
    } catch (error) {
      console.error('New incident notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify about incident status change
  async notifyIncidentStatusChange(incidentId, newStatus, notes = '') {
    try {
      const notification = {
        title: '📋 Incident Status Updated',
        message: `Incident #${incidentId} status changed to ${newStatus}${notes ? `: ${notes}` : ''}`,
        type: 'incident_update',
        priority: 'medium',
        category: 'safety',
        data: { incidentId, newStatus, notes },
        actionUrl: `/incidents/${incidentId}`,
        recipients: ['reporters', 'assigned_investigators']
      };

      await this.createNotification(notification);
      this.emitSocketNotification('incident_status_update', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Status change notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify investigator about assignment
  async notifyInvestigatorAssignment(incidentId, investigatorId) {
    try {
      const notification = {
        title: '🔍 Incident Investigation Assigned',
        message: `You have been assigned to investigate Incident #${incidentId}`,
        type: 'investigator_assignment',
        priority: 'high',
        category: 'safety',
        data: { incidentId, investigatorId },
        actionUrl: `/incidents/${incidentId}`,
        recipients: [investigatorId]
      };

      await this.createNotification(notification);
      this.emitSocketNotification('investigator_assigned', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Investigator assignment notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify about overdue investigations
  async notifyOverdueInvestigation(incidentId, daysOverdue) {
    try {
      const notification = {
        title: '⏰ Investigation Overdue',
        message: `Investigation for Incident #${incidentId} is ${daysOverdue} day(s) overdue`,
        type: 'overdue_investigation',
        priority: 'high',
        category: 'safety',
        data: { incidentId, daysOverdue },
        actionUrl: `/incidents/${incidentId}`,
        recipients: ['managers', 'safety_team']
      };

      await this.createNotification(notification);
      this.emitSocketNotification('investigation_overdue', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Overdue investigation notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async addNoteToNotification(id, note) {
    try {
      const response = await api.post(`/notifications/${id}/notes`, { note });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add note');
    }
  }
  // Send daily safety digest
  async sendDailySafetyDigest(stats) {
    try {
      const notification = {
        title: '📊 Daily Safety Digest',
        message: `Today's safety overview: ${stats.incidentsToday} new incidents, ${stats.openInvestigations} ongoing investigations`,
        type: 'daily_digest',
        priority: 'low',
        category: 'safety',
        data: stats,
        recipients: ['managers', 'safety_team'],
        digest: true
      };

      await this.createNotification(notification);
      return { success: true };
    } catch (error) {
      console.error('Daily digest notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== HELPER METHODS ====================

  // Get priority level based on incident severity
  getPriorityLevel(severity) {
    const priorityMap = {
      'critical': 'urgent',
      'high': 'high', 
      'medium': 'medium',
      'low': 'low'
    };
    return priorityMap[severity] || 'medium';
  }

  // Emit socket notification if socket is available
  emitSocketNotification(event, data) {
    if (typeof window !== 'undefined' && window.socket) {
      window.socket.emit(event, data);
    }
  }

  // Initialize socket listeners for real-time notifications
  initializeSocketListeners(socket, callbacks = {}) {
    if (!socket) return;

    socket.on('new_incident', (data) => {
      if (callbacks.onNewIncident) callbacks.onNewIncident(data);
    });

    socket.on('incident_status_update', (data) => {
      if (callbacks.onStatusUpdate) callbacks.onStatusUpdate(data);
    });

    socket.on('investigator_assigned', (data) => {
      if (callbacks.onInvestigatorAssigned) callbacks.onInvestigatorAssigned(data);
    });

    socket.on('investigation_overdue', (data) => {
      if (callbacks.onOverdueInvestigation) callbacks.onOverdueInvestigation(data);
    });

    socket.on('new_notification', (data) => {
      if (callbacks.onNewNotification) callbacks.onNewNotification(data);
    });

    socket.on('connect', () => {
      console.log('🔔 Connected to notification service');
    });

    socket.on('disconnect', () => {
      console.log('🔔 Disconnected from notification service');
    });
  }

  // Cleanup socket listeners
  cleanupSocketListeners(socket) {
    if (socket) {
      socket.off('new_incident');
      socket.off('incident_status_update');
      socket.off('investigator_assigned');
      socket.off('investigation_overdue');
      socket.off('new_notification');
    }
  }

  // ==================== BULK OPERATIONS ====================

  // Send bulk notifications (for system-wide alerts)
  async sendBulkNotification(notificationData, userGroups = []) {
    try {
      const response = await api.post('/notifications/bulk', {
        ...notificationData,
        userGroups,
        sentAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send bulk notification');
    }
  }

  // Clear all notifications for current user
  async clearAllNotifications() {
    try {
      const response = await api.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to clear notifications');
    }
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification statistics');
    }
  }

  // ==================== CREATE NOTIFICATION (INTERNAL) ====================

  // Create a notification (internal method)
  async createNotification(notificationData) {
    try {
      const response = await api.post('/notifications/create', notificationData);
      return response.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationService();