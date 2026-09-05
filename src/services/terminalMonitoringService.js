// src/services/terminalMonitoringService.js
import axios from 'axios';

// This would connect to your backend API that collects system metrics
// You would need to install agents on terminals to report data

const terminalMonitoringService = {
  // Get all monitored terminals
  getTerminals: async () => {
    try {
      const response = await axios.get('/api/terminal-monitoring/terminals');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch terminals:', error);
      // Return mock data for development
      return getMockTerminals();
    }
  },

  // Get terminal details by ID
  getTerminalById: async (terminalId) => {
    try {
      const response = await axios.get(`/api/terminal-monitoring/terminals/${terminalId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch terminal:', error);
      return null;
    }
  },

  // Get real-time metrics for a terminal
  getTerminalMetrics: async (terminalId) => {
    try {
      const response = await axios.get(`/api/terminal-monitoring/terminals/${terminalId}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch terminal metrics:', error);
      return getMockMetrics(terminalId);
    }
  },

  // Get historical metrics
  getTerminalHistory: async (terminalId, timeframe = '24h') => {
    try {
      const response = await axios.get(`/api/terminal-monitoring/terminals/${terminalId}/history`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch terminal history:', error);
      return [];
    }
  },

  // Get terminal alerts
  getTerminalAlerts: async (terminalId = null) => {
    try {
      const url = terminalId 
        ? `/api/terminal-monitoring/alerts?terminal_id=${terminalId}`
        : '/api/terminal-monitoring/alerts';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch terminal alerts:', error);
      return [];
    }
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId) => {
    try {
      const response = await axios.post(`/api/terminal-monitoring/alerts/${alertId}/acknowledge`);
      return response.data;
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  },

  // Get system health summary
  getSystemHealth: async () => {
    try {
      const response = await axios.get('/api/terminal-monitoring/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      return {
        totalTerminals: 24,
        onlineTerminals: 18,
        offlineTerminals: 3,
        warningTerminals: 2,
        criticalTerminals: 1,
        averageCpuTemp: 45,
        averageGpuTemp: 52,
        averageCpuLoad: 35
      };
    }
  }
};

// Mock data for development
const getMockTerminals = () => {
  return [
    {
      id: 'term-001',
      name: 'Main Server',
      ip: '192.168.1.100',
      location: 'Server Room A',
      status: 'online',
      type: 'server',
      os: 'Ubuntu 22.04',
      cpu: 'Intel Xeon E5-2690',
      ram: '64GB',
      storage: '2TB SSD',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'term-002',
      name: 'Workstation-01',
      ip: '192.168.1.101',
      location: 'Control Room',
      status: 'online',
      type: 'workstation',
      os: 'Windows 11',
      cpu: 'Intel i9-13900K',
      ram: '32GB',
      storage: '1TB NVMe',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'term-003',
      name: 'GPU Render Node',
      ip: '192.168.1.102',
      location: 'Server Room B',
      status: 'warning',
      type: 'workstation',
      os: 'Ubuntu 22.04',
      cpu: 'AMD Ryzen 9 5950X',
      gpu: 'NVIDIA RTX 4090',
      ram: '128GB',
      storage: '4TB SSD',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'term-004',
      name: 'Edge Gateway',
      ip: '192.168.1.103',
      location: 'Field',
      status: 'offline',
      type: 'iot',
      os: 'Raspberry Pi OS',
      cpu: 'ARM Cortex-A72',
      ram: '8GB',
      storage: '128GB SD',
      lastSeen: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};

const getMockMetrics = (terminalId) => {
  const now = Date.now();
  return {
    terminalId,
    timestamp: new Date().toISOString(),
    cpu: {
      temperature: 45 + Math.random() * 15,
      usage: 30 + Math.random() * 40,
      cores: 8,
      frequency: 3.2
    },
    gpu: {
      temperature: 52 + Math.random() * 20,
      usage: 25 + Math.random() * 50,
      memory: 8,
      memoryUsed: 2 + Math.random() * 4
    },
    memory: {
      total: 32,
      used: 12 + Math.random() * 10,
      available: 20 - Math.random() * 10,
      usagePercent: 35 + Math.random() * 30
    },
    storage: [
      {
        device: 'C:',
        total: 1000,
        used: 450 + Math.random() * 100,
        available: 550 - Math.random() * 100,
        usagePercent: 45 + Math.random() * 10
      }
    ],
    fans: [
      { name: 'CPU Fan', speed: 2200 + Math.random() * 500, rpm: 2200 },
      { name: 'Case Fan', speed: 1500 + Math.random() * 300, rpm: 1500 }
    ],
    network: {
      bytesIn: 1024 * 1024 * (5 + Math.random() * 10),
      bytesOut: 1024 * 1024 * (2 + Math.random() * 5),
      packetsIn: 1000 + Math.random() * 500,
      packetsOut: 800 + Math.random() * 400
    },
    uptime: 3600 * 24 * (3 + Math.random() * 4), // 3-7 days
    processes: 120 + Math.floor(Math.random() * 50)
  };
};

export default terminalMonitoringService;