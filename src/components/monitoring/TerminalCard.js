// src/components/monitoring/TerminalCard.js
import React from 'react';
import { Card, Tag, Space, Progress, Tooltip, Button } from 'antd';
import { 
  DesktopOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined,
  HeatMapOutlined,
  RiseOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import './TerminalCard.css';

const TerminalCard = ({ terminal, metrics, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return '#52c41a';
      case 'offline': return '#f5222d';
      case 'warning': return '#faad14';
      case 'maintenance': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 80) return '#cf1322';
    if (temp >= 70) return '#f5222d';
    if (temp >= 60) return '#fa541c';
    if (temp >= 50) return '#fa8c16';
    if (temp >= 40) return '#faad14';
    return '#52c41a';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'online': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'offline': return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      default: return <DashboardOutlined />;
    }
  };

  const cpuTemp = metrics?.cpu?.temperature || 45;
  const gpuTemp = metrics?.gpu?.temperature;
  const cpuUsage = metrics?.cpu?.usage || 30;
  const ramUsage = metrics?.memory?.usagePercent || 40;

  return (
    <Card 
      className={`terminal-card ${terminal.status}`}
      bordered={false}
      actions={[
        <Button 
          type="link" 
          size="small"
          onClick={() => onViewDetails && onViewDetails(terminal.id)}
        >
          View Details
        </Button>
      ]}
    >
      <div className="terminal-header">
        <div className="terminal-title">
          <DesktopOutlined className="terminal-icon" />
          <span className="terminal-name">{terminal.name}</span>
        </div>
        <Tooltip title={`Status: ${terminal.status}`}>
          <Tag color={getStatusColor(terminal.status)} className="status-tag">
            {getStatusIcon(terminal.status)} {terminal.status}
          </Tag>
        </Tooltip>
      </div>

      <div className="terminal-location">
        📍 {terminal.location} • {terminal.ip}
      </div>

      <div className="terminal-specs">
        <Tag color="blue">{terminal.type}</Tag>
        <Tag>{terminal.os}</Tag>
      </div>

      <div className="temperature-section">
        <div className="temp-item">
          <span className="temp-label">CPU</span>
          <span className="temp-value" style={{ color: getTemperatureColor(cpuTemp) }}>
            {Math.round(cpuTemp)}°C
          </span>
          <Progress 
            percent={Math.min(100, (cpuTemp / 100) * 100)} 
            size="small" 
            showInfo={false}
            strokeColor={getTemperatureColor(cpuTemp)}
          />
        </div>
        {gpuTemp && (
          <div className="temp-item">
            <span className="temp-label">GPU</span>
            <span className="temp-value" style={{ color: getTemperatureColor(gpuTemp) }}>
              {Math.round(gpuTemp)}°C
            </span>
            <Progress 
              percent={Math.min(100, (gpuTemp / 100) * 100)} 
              size="small" 
              showInfo={false}
              strokeColor={getTemperatureColor(gpuTemp)}
            />
          </div>
        )}
      </div>

      <div className="usage-section">
        <div className="usage-item">
          <span className="usage-label">CPU Load</span>
          <Progress 
            percent={Math.round(cpuUsage)} 
            size="small" 
            status={cpuUsage > 80 ? 'exception' : cpuUsage > 60 ? 'active' : 'normal'}
          />
        </div>
        <div className="usage-item">
          <span className="usage-label">RAM Usage</span>
          <Progress 
            percent={Math.round(ramUsage)} 
            size="small" 
            status={ramUsage > 80 ? 'exception' : ramUsage > 60 ? 'active' : 'normal'}
          />
        </div>
      </div>

      {metrics?.fans && (
        <div className="fans-section">
          {metrics.fans.map((fan, idx) => (
            <div key={idx} className="fan-item">
              <span>{fan.name}:</span>
              <span>{fan.speed} RPM</span>
            </div>
          ))}
        </div>
      )}

      <div className="terminal-footer">
        <small>
          <FieldTimeOutlined /> Uptime: {Math.floor(metrics?.uptime / 3600)}h
        </small>
        <small>Last seen: {new Date(terminal.lastSeen).toLocaleTimeString()}</small>
      </div>
    </Card>
  );
};

export default TerminalCard;