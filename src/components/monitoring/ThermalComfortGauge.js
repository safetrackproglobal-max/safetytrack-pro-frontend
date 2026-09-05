// src/components/monitoring/ThermalComfortGauge.js
import React from 'react';
import { Card, Progress, Tag, Tooltip } from 'antd';
import { 
  BulbOutlined, 
  FireOutlined,
  HeatMapOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import './ThermalComfortGauge.css';

const ThermalComfortGauge = ({ comfortIndex, pmv, comfortLevel, size = 'normal' }) => {
  // Determine color based on comfort index
  const getComfortColor = (index) => {
    if (index <= 20) return '#52c41a'; // Excellent
    if (index <= 40) return '#389e0d'; // Good
    if (index <= 60) return '#faad14'; // Moderate
    if (index <= 80) return '#f5222d'; // Poor
    return '#cf1322'; // Very Poor
  };

  // Get comfort description
  const getComfortDescription = (index) => {
    if (index <= 20) return 'Excellent';
    if (index <= 40) return 'Good';
    if (index <= 60) return 'Moderate';
    if (index <= 80) return 'Poor';
    return 'Very Poor';
  };

  // Get comfort icon
  const getComfortIcon = (index) => {
    if (index <= 40) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (index <= 60) return <BulbOutlined style={{ color: '#faad14' }} />;
    return <WarningOutlined style={{ color: '#f5222d' }} />;
  };

  // Get PMV description
  const getPmvDescription = (pmv) => {
    if (pmv <= -2.5) return 'Very Cold';
    if (pmv <= -1.5) return 'Cold';
    if (pmv <= -0.5) return 'Cool';
    if (pmv <= 0.5) return 'Neutral';
    if (pmv <= 1.5) return 'Warm';
    if (pmv <= 2.5) return 'Hot';
    return 'Very Hot';
  };

  const comfortColor = getComfortColor(comfortIndex);
  const comfortDesc = comfortLevel || getComfortDescription(comfortIndex);
  const comfortIcon = getComfortIcon(comfortIndex);

  const isSmall = size === 'small';

  return (
    <Card 
      className={`thermal-comfort-gauge ${size}`}
      bordered={false}
      bodyStyle={{ padding: isSmall ? '12px' : '20px' }}
    >
      <div className="comfort-header">
        <div className="comfort-title">
          <BulbOutlined /> Thermal Comfort
        </div>
        <Tag color={comfortColor} className="comfort-level-tag">
          {comfortIcon} {comfortDesc}
        </Tag>
      </div>

      <div className="comfort-gauge-container">
        <Progress
          type="dashboard"
          percent={comfortIndex}
          format={(percent) => (
            <div className="gauge-format">
              <div className="gauge-value">{percent}</div>
              <div className="gauge-label">Discomfort</div>
            </div>
          )}
          strokeColor={comfortColor}
          width={isSmall ? 120 : 180}
          gapDegree={30}
        />
      </div>

      {pmv !== undefined && (
        <div className="pmv-indicator">
          <Tooltip title="Predicted Mean Vote (PMV)">
            <div className="pmv-label">
              <HeatMapOutlined /> PMV:
            </div>
          </Tooltip>
          <div className="pmv-value" style={{ color: getComfortColor(Math.abs(pmv) * 30) }}>
            {pmv.toFixed(2)}
          </div>
          <Tag color={getComfortColor(Math.abs(pmv) * 30)}>
            {getPmvDescription(pmv)}
          </Tag>
        </div>
      )}

      <div className="comfort-scale">
        <div className="scale-item excellent">Excellent</div>
        <div className="scale-item good">Good</div>
        <div className="scale-item moderate">Moderate</div>
        <div className="scale-item poor">Poor</div>
        <div className="scale-item very-poor">Very Poor</div>
      </div>

      {!isSmall && (
        <div className="comfort-recommendations">
          <h4>Recommendations</h4>
          <ul>
            {comfortIndex <= 20 && (
              <li>✓ Conditions are excellent - maintain current settings</li>
            )}
            {comfortIndex > 20 && comfortIndex <= 40 && (
              <>
                <li>✓ Good thermal conditions</li>
                <li>✓ Minor adjustments may improve comfort</li>
              </>
            )}
            {comfortIndex > 40 && comfortIndex <= 60 && (
              <>
                <li>⚠️ Consider adjusting temperature by 1-2°C</li>
                <li>⚠️ Check air circulation</li>
              </>
            )}
            {comfortIndex > 60 && comfortIndex <= 80 && (
              <>
                <li>❌ Immediate action recommended</li>
                <li>❌ Adjust HVAC settings</li>
                <li>❌ Check for thermal anomalies</li>
              </>
            )}
            {comfortIndex > 80 && (
              <>
                <li>🚨 CRITICAL - Take immediate action</li>
                <li>🚨 Emergency cooling/heating may be needed</li>
                <li>🚨 Evacuate if necessary</li>
              </>
            )}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ThermalComfortGauge;