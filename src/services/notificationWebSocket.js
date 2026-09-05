// src/services/notificationWebSocket.js
import io from 'socket.io-client';

class NotificationWebSocket {
  constructor() {
    this.socket = null;
    this.listeners = [];
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(process.env.REACT_APP_API_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected for notifications');
    });

    this.socket.on('new_notification', (notification) => {
      console.log('🔔 New notification received:', notification);
      this.listeners.forEach(listener => listener(notification));
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });
  }

  onNotification(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new NotificationWebSocket();