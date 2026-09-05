// src/components/monitoring/ThermalSensorCard.js
import React from 'react';
import { Card, Tag, Space, Progress, Tooltip, Button, Popconfirm } from 'antd';
import { 
  ExperimentOutlined, 
  EnvironmentOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  DashboardOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import './ThermalSensorCard.css';

const ThermalSensorCard = ({ sensor, reading, onViewDetails, onDelete }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#52c41a';
      case 'inactive': return '#f5222d';
      case 'maintenance': return '#faad14';
      default: return '#d9d9d9';
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return '#cf1322';
    if (temp >= 30) return '#f5222d';
    if (temp >= 25) return '#fa541c';
    if (temp >= 20) return '#fa8c16';
    if (temp >= 15) return '#faad14';
    if (temp >= 10) return '#52c41a';
    if (temp >= 5) return '#1890ff';
    if (temp >= 0) return '#096dd9';
    return '#0050b3';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'inactive': return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'maintenance': return <WarningOutlined style={{ color: '#faad14' }} />;
      default: return <DashboardOutlined />;
    }
  };

  const getTemperatureStatus = (temp) => {
    if (temp >= 35) return 'Critical';
    if (temp >= 30) return 'Warning';
    if (temp >= 25) return 'Elevated';
    if (temp >= 15) return 'Normal';
    if (temp >= 5) return 'Cool';
    return 'Cold';
  };

  const currentTemp = reading?.temperature || sensor.current_temperature;
  const temperatureStatus = getTemperatureStatus(currentTemp);
  const tempColor = getTemperatureColor(currentTemp);

  // Calculate min/max range
  const minTemp = sensor.min_temperature || 15;
  const maxTemp = sensor.max_temperature || 35;
  const tempRange = maxTemp - minTemp;
  const tempPercentage = ((currentTemp - minTemp) / tempRange) * 100;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(sensor.id, sensor.sensor_id);
    }
  };

  return (
    <Card 
      className={`thermal-sensor-card ${sensor.status}`}
      bordered={false}
      actions={[
        <Tooltip title="View Details">
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            onClick={() => onViewDetails && onViewDetails(sensor.id, sensor.sensor_id)}
          >
            View
          </Button>
        </Tooltip>,
        <Popconfirm
          title="Delete Sensor"
          description={`Are you sure you want to delete ${sensor.name}?`}
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Delete Sensor">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Tooltip>
        </Popconfirm>
      ]}
    >
      <div className="sensor-header">
        <div className="sensor-title">
          <ExperimentOutlined className="sensor-icon" style={{ color: tempColor }} />
          <span className="sensor-name">{sensor.name || `Sensor ${sensor.id}`}</span>
        </div>
        <Tooltip title={`Status: ${sensor.status}`}>
          <Tag color={getStatusColor(sensor.status)} className="status-tag">
            {getStatusIcon(sensor.status)} {sensor.status}
          </Tag>
        </Tooltip>
      </div>

      <div className="sensor-location">
        <EnvironmentOutlined /> {sensor.location || 'Unknown location'}
        <Tag className="sensor-type-tag" color="blue">{sensor.type || 'indoor'}</Tag>
      </div>

      <div className="temperature-display">
        <div className="current-temp" style={{ color: tempColor }}>
          {currentTemp?.toFixed(1)}°C
        </div>
        <div className="temp-status">
          <Tag color={tempColor}>{temperatureStatus}</Tag>
        </div>
      </div>

      <div className="temperature-range">
        <div className="range-labels">
          <span>Min: {minTemp}°C</span>
          <span>Max: {maxTemp}°C</span>
        </div>
        <Progress 
          percent={tempPercentage} 
          showInfo={false}
          strokeColor={tempColor}
          size="small"
          className="temperature-progress"
        />
      </div>

      <div className="sensor-details">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {reading?.humidity && (
            <div className="detail-item">
              <span className="detail-label">Humidity:</span>
              <span className="detail-value">{reading.humidity}%</span>
            </div>
          )}
          {sensor.battery_level && (
            <div className="detail-item">
              <span className="detail-label">
                <ThunderboltOutlined /> Battery:
              </span>
              <Progress 
                percent={sensor.battery_level} 
                size="small" 
                showInfo={true}
                format={(percent) => `${percent}%`}
                strokeColor={sensor.battery_level > 20 ? '#52c41a' : '#faad14'}
                className="battery-progress"
              />
            </div>
          )}
          {sensor.maintenance_due && (
            <div className="detail-item">
              <span className="detail-label">
                <FieldTimeOutlined /> Maintenance:
              </span>
              <span className="detail-value">
                {new Date(sensor.maintenance_due).toLocaleDateString()}
              </span>
            </div>
          )}
        </Space>
      </div>

      {reading && (
        <div className="last-reading">
          <small>Last reading: {new Date(reading.reading_time).toLocaleString()}</small>
        </div>
      )}
    </Card>
  );
};

export default ThermalSensorCard;