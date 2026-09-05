import React from 'react';
import PropTypes from 'prop-types';
import AQIMeter from './AQIMeter'; // Add this import
import './AirQualitySensorCard.css';

const AirQualitySensorCard = ({ sensor = {}, reading = null }) => {
  // Validate sensor data
  if (!sensor || typeof sensor !== 'object') {
    return (
      <div className="sensor-card error">
        <div className="error-message">Invalid sensor data</div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', label: 'Active' },
      maintenance: { class: 'status-maintenance', label: 'Maintenance' },
      offline: { class: 'status-offline', label: 'Offline' },
      default: { class: 'status-offline', label: 'Unknown' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig.default;
    return <span className={`sensor-status ${config.class}`}>{config.label}</span>;
  };

  const getLastUpdateText = (timestamp) => {
    if (!timestamp) return 'No data';
    
    try {
      const now = new Date();
      const updateTime = new Date(timestamp);
      if (isNaN(updateTime.getTime())) return 'Invalid date';
      
      const diffMs = now - updateTime;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return `${Math.floor(diffMins / 1440)}d ago`;
    } catch {
      return 'Invalid date';
    }
  };

  const safeGet = (obj, key, defaultValue = 'N/A') => {
    return obj && obj[key] != null ? obj[key] : defaultValue;
  };

  return (
    <div className="sensor-card">
      <div className="sensor-header">
        <h4>{safeGet(sensor, 'location', 'Unknown Location')}</h4>
        {getStatusBadge(safeGet(sensor, 'status'))}
      </div>
      
      <div className="sensor-info">
        <span className="sensor-id">ID: {safeGet(sensor, 'device_id', 'N/A')}</span>
        <span className="sensor-department">{safeGet(sensor, 'department', 'N/A')}</span>
      </div>

      {reading ? (
        <>
          <div className="aqi-section">
            {/* Now AQIMeter is properly imported and will work */}
            <AQIMeter aqi={safeGet(reading, 'aqi', 0)} />
            <div className="reading-details">
              <div className="reading-item">
                <span className="label">PM2.5:</span>
                <span className="value">{safeGet(reading, 'pm2_5', 'N/A')} μg/m³</span>
              </div>
              <div className="reading-item">
                <span className="label">PM10:</span>
                <span className="value">{safeGet(reading, 'pm10', 'N/A')} μg/m³</span>
              </div>
              <div className="reading-item">
                <span className="label">Temp:</span>
                <span className="value">{safeGet(reading, 'temperature', 'N/A')}°C</span>
              </div>
              <div className="reading-item">
                <span className="label">Humidity:</span>
                <span className="value">{safeGet(reading, 'humidity', 'N/A')}%</span>
              </div>
            </div>
          </div>
          
          <div className="last-update">
            Last update: {getLastUpdateText(reading.timestamp)}
          </div>
        </>
      ) : (
        <div className="no-data">
          <p>No recent readings available</p>
        </div>
      )}
    </div>
  );
};

AirQualitySensorCard.propTypes = {
  sensor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    location: PropTypes.string,
    status: PropTypes.string,
    device_id: PropTypes.string,
    department: PropTypes.string
  }),
  reading: PropTypes.shape({
    aqi: PropTypes.number,
    pm2_5: PropTypes.number,
    pm10: PropTypes.number,
    temperature: PropTypes.number,
    humidity: PropTypes.number,
    timestamp: PropTypes.string
  })
};

AirQualitySensorCard.defaultProps = {
  sensor: {},
  reading: null
};

export default AirQualitySensorCard;