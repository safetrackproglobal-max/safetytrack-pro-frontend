// src/pages/NotificationsPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import notificationService from "../services/notificationService";
import "./NotificationsPage.css"; // Make sure this CSS file exists

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Navigate to notification details page
    history.push(`/notifications/${notification.id}`);
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(
    (n) => !n.read && !n.is_read
  ).length;

  if (loading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read-btn">
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => {
            const isRead = notification.read || notification.is_read;
            
            return (
              <div
                key={notification.id}
                className={`notification-item ${isRead ? "read" : "unread"}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <h3>{notification.title}</h3>
                    {!isRead && <span className="unread-badge">New</span>}
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-footer">
                    <span className="notification-date">
                      {new Date(
                        notification.created_at || notification.date
                      ).toLocaleString()}
                    </span>
                    {notification.type && (
                      <span className={`notification-type ${notification.type}`}>
                        {notification.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}