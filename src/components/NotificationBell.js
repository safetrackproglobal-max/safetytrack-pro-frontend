// src/components/NotificationBell/NotificationBell.js - ON CLICK ONLY
import React, { useState } from "react";
import { Badge, Button, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import notificationService from '../services/notificationService';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const fetchAndNavigate = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Fetch latest notifications before navigating
      const notifications = await notificationService.getNotifications();
      const unread = (notifications || []).filter(n => 
        !n.read && !n.is_read
      ).length;
      setUnreadCount(unread);
      
      // Navigate to notifications page
      history.push('/notifications');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to load notifications');
      // Still navigate even if error
      history.push('/notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Badge count={unreadCount} size="small">
      <Button 
        type="text" 
        icon={<BellOutlined />}
        onClick={fetchAndNavigate}
        loading={loading}
      />
    </Badge>
  );
}