import React from 'react';
import PropTypes from 'prop-types';
import './AQIMeter.css';

const AQIMeter = ({ aqi = 0 }) => {
  const aqiValue = Number(aqi) || 0;
  
  const getAQICategory = (aqiValue) => {
    if (aqiValue <= 0) return { level: 'No Data', color: '#9E9E9E', description: 'No air quality data available' };
    if (aqiValue <= 50) return { level: 'Good', color: '#4CAF50', description: 'Air quality is satisfactory' };
    if (aqiValue <= 100) return { level: 'Moderate', color: '#FFC107', description: 'Acceptable air quality' };
    if (aqiValue <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#FF9800', description: 'Members of sensitive groups may experience health effects' };
    if (aqiValue <= 200) return { level: 'Unhealthy', color: '#F44336', description: 'Everyone may begin to experience health effects' };
    if (aqiValue <= 300) return { level: 'Very Unhealthy', color: '#9C27B0', description: 'Health alert: everyone may experience more serious health effects' };
    return { level: 'Hazardous', color: '#795548', description: 'Health warnings of emergency conditions' };
  };

  const category = getAQICategory(aqiValue);
  const percentage = aqiValue > 0 ? Math.min((aqiValue / 500) * 100, 100) : 0;

  return (
    <div className="aqi-meter">
      <div className="aqi-value" style={{ color: category.color }}>
        {aqiValue > 0 ? aqiValue : 'N/A'}
      </div>
      <div className="aqi-category" style={{ color: category.color }}>
        {category.level}
      </div>
      <div className="aqi-description">
        {category.description}
      </div>
      <div className="aqi-scale">
        <div className="scale-markers">
          <span>0</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>200</span>
          <span>300</span>
          <span>500</span>
        </div>
        <div className="scale-bar">
          <div 
            className="scale-fill" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: category.color
            }}
          />
          <div 
            className="current-marker" 
            style={{ 
              left: `${percentage}%`,
              backgroundColor: category.color
            }}
          />
        </div>
      </div>
    </div>
  );
};

AQIMeter.propTypes = {
  aqi: PropTypes.number
};

AQIMeter.defaultProps = {
  aqi: 0
};

export default AQIMeter;