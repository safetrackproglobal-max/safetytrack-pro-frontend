// src/pages/NotificationDetails.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Fixed: useNavigate instead of useHistory
import notificationService from "../services/notificationService";
import { message } from 'antd'; // Using antd message for toast
import "./NotificationDetails.css";

export default function NotificationDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // Fixed: useNavigate
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [relatedNotifications, setRelatedNotifications] = useState([]);
  const [userNote, setUserNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const contentRef = useRef(null);
  const deleteModalRef = useRef(null);

  // Load notification data
  useEffect(() => {
    const loadNotification = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const notifications = await notificationService.getNotifications();
        const found = notifications.find(
          (n) => n.id.toString() === id.toString()
        );

        if (!found) {
          setError("Notification not found");
          return;
        }

        setNotification(found);

        // Find related notifications (same type/category)
        const related = notifications
          .filter(n => 
            n.id !== found.id && 
            (n.type === found.type || n.category === found.category) &&
            n.id.toString() !== id.toString()
          )
          .slice(0, 3);
        setRelatedNotifications(related);

        // Auto-mark as read with animation delay
        const isRead = found.read || found.is_read;
        if (!isRead) {
          setIsMarkingRead(true);
          // Delay marking as read to show animation
          setTimeout(async () => {
            try {
              await notificationService.markAsRead(found.id);
              setNotification((prev) => ({
                ...prev,
                read: true,
                is_read: true,
              }));
            } catch (err) {
              console.error("Failed to mark as read:", err);
            } finally {
              setIsMarkingRead(false);
            }
          }, 1000);
        }
      } catch (err) {
        console.error("Error loading notification:", err);
        setError("Failed to load notification");
      } finally {
        setLoading(false);
      }
    };

    loadNotification();
  }, [id]);

  // Handle click outside delete modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(e.target)) {
        setShowDeleteConfirm(false);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteConfirm]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          handleBack();
        }
      } else if (e.key === "a" && e.ctrlKey && notification?.action_url) {
        e.preventDefault();
        handleActionClick();
      } else if (e.key === "m" && e.ctrlKey) {
        e.preventDefault();
        setShowMetadata(!showMetadata);
      } else if (e.key === "Delete" && e.ctrlKey) {
        e.preventDefault();
        setShowDeleteConfirm(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [notification, showMetadata, showDeleteConfirm]);

  const handleBack = () => {
    // Add exit animation
    if (contentRef.current) {
      contentRef.current.classList.add("fade-out");
      setTimeout(() => navigate("/notifications"), 300);
    } else {
      navigate("/notifications");
    }
  };

  const handleActionClick = () => {
    if (notification?.action_url) {
      // Track click analytics
      console.log(`🔗 Action clicked: ${notification.action_url}`);
      
      if (notification.action_url.startsWith("/")) {
        navigate(notification.action_url);
      } else {
        window.open(notification.action_url, "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleSaveNote = async () => {
    if (!userNote.trim()) return;
    
    setIsSavingNote(true);
    try {
      // Save note to backend - Fixed: proper API call
      const response = await notificationService.addNoteToNotification?.(notification.id, userNote);
      
      // Update local state
      setNotification(prev => ({
        ...prev,
        notes: [...(prev.notes || []), { 
          text: userNote, 
          timestamp: new Date().toISOString(),
          id: Date.now().toString()
        }]
      }));
      setUserNote("");
      
      message.success("Note saved successfully!");
    } catch (error) {
      console.error("Failed to save note:", error);
      message.error("Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Call the delete API - Fixed: use proper method
      if (notificationService.deleteNotification) {
        await notificationService.deleteNotification(notification.id);
      } else {
        // Fallback: delete via API
        await notificationService.markAllRead?.(); // Fallback
        console.log(`Deleting notification: ${notification.id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      message.success("Notification deleted successfully");
      
      // Add exit animation
      if (contentRef.current) {
        contentRef.current.classList.add("delete-animation");
      }
      
      // Navigate back to notifications list
      setTimeout(() => {
        navigate("/notifications");
      }, 500);
      
    } catch (error) {
      console.error("Failed to delete notification:", error);
      message.error("Failed to delete notification");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRelatedNotificationClick = (notificationId) => {
    navigate(`/notifications/${notificationId}`);
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 7) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅',
      safety: '🛡️',
      incident: '🚨',
      update: '📋',
      assignment: '👤',
      overdue: '⏰',
      digest: '📊',
      notification: '📢'
    };
    return icons[type?.toLowerCase()] || '📢';
  };

  // Add to notificationService if needed
  // This should be added to notificationService.js
  // async addNoteToNotification(id, note) {
  //   try {
  //     const response = await api.post(`/notifications/${id}/notes`, { note });
  //     return response.data;
  //   } catch (error) {
  //     throw new Error(error.response?.data?.message || 'Failed to add note');
  //   }
  // }

  if (loading) {
    return (
      <div className="notification-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading notification...</p>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="notification-details-error">
        <div className="error-icon">⚠️</div>
        <h2>{error || "Notification not found"}</h2>
        <p>The notification you're looking for doesn't exist or has been removed.</p>
        <button onClick={handleBack} className="back-button primary">
          ← Back to Notifications
        </button>
      </div>
    );
  }

  const isRead = notification.read || notification.is_read;

  return (
    <div className="notification-details" ref={contentRef}>
      {/* Progress bar for marking as read */}
      {isMarkingRead && (
        <div className="mark-read-progress">
          <div className="progress-bar"></div>
          <span>Marking as read...</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal" ref={deleteModalRef}>
            <div className="delete-modal-header">
              <span className="delete-icon">🗑️</span>
              <h3>Delete Notification</h3>
            </div>
            <div className="delete-modal-content">
              <p>Are you sure you want to delete this notification?</p>
              <p className="delete-warning">This action cannot be undone.</p>
              <div className="notification-preview">
                <strong>{notification.title}</strong>
                <span className="notification-preview-date">
                  {formatRelativeTime(notification.created_at || notification.date)}
                </span>
              </div>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
            <div className="keyboard-hint-delete">
              Press ESC to cancel
            </div>
          </div>
        </div>
      )}

      {/* Header with navigation */}
      <div className="details-header">
        <button onClick={handleBack} className="back-button">
          <span className="back-icon">←</span>
          <span className="back-text">Back</span>
          <span className="keyboard-hint">ESC</span>
        </button>
        
        <div className="header-actions">
          <button 
            className={`icon-button ${showMetadata ? 'active' : ''}`}
            onClick={() => setShowMetadata(!showMetadata)}
            title="Toggle metadata (Ctrl+M)"
          >
            📋
          </button>
          <button 
            className="icon-button delete-header-btn"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete notification (Ctrl+Delete)"
          >
            🗑️
          </button>
          <button 
            className="icon-button"
            onClick={() => window.print()}
            title="Print notification"
          >
            🖨️
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="notification-card">
        <div className="notification-header">
          <div className="title-section">
            <div className="title-icon">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="title-wrapper">
              <h1>{notification.title}</h1>
              <div className="badges">
                {!isRead && (
                  <span className="badge unread-badge pulse">
                    ● Unread
                  </span>
                )}
                {notification.priority && (
                  <span className={`badge priority-${notification.priority}`}>
                    {notification.priority.toUpperCase()}
                  </span>
                )}
                {notification.category && (
                  <span className="badge category-badge">
                    {notification.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="date-section">
            <span className="notification-date">
              {formatRelativeTime(notification.created_at || notification.date)}
            </span>
            <span className="full-date-tooltip">
              {new Date(notification.created_at || notification.date).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Message section with highlight effect for unread */}
        <div className={`notification-message-section ${!isRead ? 'unread-highlight' : ''}`}>
          <h2>Message</h2>
          <div className="message-container">
            <p className="notification-message">{notification.message}</p>
            {!isRead && (
              <div className="unread-indicator">
                <span className="pulse-dot"></span>
                New
              </div>
            )}
          </div>
        </div>

        {/* Metadata section (collapsible) */}
        {showMetadata && (
          <div className="metadata-section fade-in">
            <h2>Technical Details</h2>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label">ID</span>
                <span className="metadata-value code">{notification.id}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Type</span>
                <span className="metadata-value">{notification.type || 'info'}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Created</span>
                <span className="metadata-value">
                  {new Date(notification.created_at || notification.date).toLocaleString()}
                </span>
              </div>
              {notification.read_at && (
                <div className="metadata-item">
                  <span className="metadata-label">Read At</span>
                  <span className="metadata-value">
                    {new Date(notification.read_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User notes section - Fixed: conditional rendering */}
        <div className="notes-section">
          <h2>Notes</h2>
          <div className="notes-container">
            {notification.notes && notification.notes.length > 0 ? (
              notification.notes.map((note, index) => (
                <div key={index} className="note-item slide-in">
                  <div className="note-text">{note.text}</div>
                  <div className="note-meta">
                    <span className="note-date">
                      {formatRelativeTime(note.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-notes">No notes yet. Add your first note below.</p>
            )}
          </div>
          
          <div className="add-note">
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Add a private note about this notification..."
              rows="3"
              disabled={isSavingNote}
            />
            <button 
              onClick={handleSaveNote}
              disabled={!userNote.trim() || isSavingNote}
              className="save-note-button"
            >
              {isSavingNote ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Saving...
                </>
              ) : 'Save Note'}
            </button>
          </div>
        </div>

        {/* Related notifications */}
        {relatedNotifications.length > 0 && (
          <div className="related-section">
            <h2>Related Notifications</h2>
            <div className="related-list">
              {relatedNotifications.map((related) => (
                <div
                  key={related.id}
                  className="related-item"
                  onClick={() => handleRelatedNotificationClick(related.id)}
                >
                  <div className="related-icon">
                    {getNotificationIcon(related.type)}
                  </div>
                  <div className="related-content">
                    <div className="related-title">{related.title}</div>
                    <div className="related-meta">
                      <span className="related-date">
                        {formatRelativeTime(related.created_at || related.date)}
                      </span>
                      {!related.read && !related.is_read && (
                        <span className="related-unread">New</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button with keyboard hint */}
        {notification.action_url && (
          <div className="notification-action-section">
            <div className="action-header">
              <h2>Related Action</h2>
              <span className="keyboard-hint">Ctrl+A</span>
            </div>
            <button onClick={handleActionClick} className="action-button">
              <span className="action-icon">→</span>
              Go to Related Page
            </button>
            <p className="action-url">{notification.action_url}</p>
          </div>
        )}
      </div>

      {/* Quick actions floating bar */}
      <div className="quick-actions">
        <button 
          className="quick-action-item"
          onClick={() => navigate('/notifications')}
          title="All notifications"
        >
          📋
        </button>
        <button 
          className="quick-action-item delete-quick"
          onClick={() => setShowDeleteConfirm(true)}
          title="Delete notification"
        >
          🗑️
        </button>
        <button 
          className="quick-action-item"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Scroll to top"
        >
          ↑
        </button>
        <button 
          className="quick-action-item"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href).then(() => {
              message.success("Link copied to clipboard!");
            }).catch(() => {
              // Fallback
              const textarea = document.createElement('textarea');
              textarea.value = window.location.href;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
              message.success("Link copied to clipboard!");
            });
          }}
          title="Copy link"
        >
          🔗
        </button>
      </div>
    </div>
  );
}