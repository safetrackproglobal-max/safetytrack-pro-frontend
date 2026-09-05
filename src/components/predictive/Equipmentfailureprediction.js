import React, { useState, useEffect, useCallback } from 'react';
import { equipmentService } from '../../services/equipmentService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import PropTypes from 'prop-types';
import './predictive.css';

const EquipmentFailurePrediction = ({ hospitalId }) => {
  const [equipmentData, setEquipmentData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeframe, setTimeframe] = useState('30days');

  const loadEquipmentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await equipmentService.getFailurePredictions({
        hospitalId,
        category: selectedCategory,
        timeframe
      });
      
      setEquipmentData(data?.equipmentStatus || []);
      setPredictions(data?.predictions || []);
      setMaintenanceSchedule(data?.maintenanceSchedule || []);
      
    } catch (error) {
      console.error('Error loading equipment data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [hospitalId, selectedCategory, timeframe]);

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'urgent': return '#e74c3c';
      case 'scheduled': return '#3498db';
      case 'completed': return '#27ae60';
      case 'overdue': return '#e67e22';
      default: return '#95a5a6';
    }
  };

  const getUptimePercentage = (operational, total) => {
    return total > 0 ? Math.round((operational / total) * 100) : 0;
  };

  useEffect(() => {
    loadEquipmentData();
  }, [loadEquipmentData]);

  if (loading) {
    return <div className="predictive-loading">Loading equipment data...</div>;
  }

  if (error) {
    return (
      <div className="predictive-error">
        <p>Error: {error}</p>
        <button onClick={loadEquipmentData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const overallUptime = equipmentData.reduce((total, eq) => total + getUptimePercentage(eq.operational, eq.totalUnits), 0) / equipmentData.length;

  return (
    <div className="equipment-failure-predictor">
      <div className="predictor-header">
        <h3>Equipment Failure Predictor</h3>
        <div className="controls">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Equipment</option>
            <option value="critical">Critical Equipment</option>
            <option value="general">General Equipment</option>
            <option value="imaging">Imaging Equipment</option>
            <option value="life_support">Life Support</option>
          </select>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            disabled={loading}
          >
            <option value="7days">7 Days</option>
            <option value="30days">30 Days</option>
            <option value="90days">90 Days</option>
          </select>
          <button onClick={loadEquipmentData} className="refresh-btn" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="equipment-content">
        <div className="overview-stats">
          <div className="stat-card">
            <h4>Overall Uptime</h4>
            <div className="stat-value">{overallUptime}%</div>
            <div className="stat-trend">
              {overallUptime > 95 ? '✅ Excellent' : overallUptime > 90 ? '⚠️ Good' : '❌ Needs Attention'}
            </div>
          </div>
          <div className="stat-card">
            <h4>Total Equipment</h4>
            <div className="stat-value">{equipmentData.reduce((sum, eq) => sum + eq.totalUnits, 0)}</div>
            <div className="stat-label">Units</div>
          </div>
          <div className="stat-card">
            <h4>Pending Maintenance</h4>
            <div className="stat-value">{maintenanceSchedule.filter(m => m.status === 'scheduled').length}</div>
            <div className="stat-label">Tasks</div>
          </div>
        </div>

        <div className="predictions-section">
          <h4>Failure Predictions</h4>
          {predictions.length === 0 ? (
            <div className="no-data">No failure predictions</div>
          ) : (
            <div className="predictions-grid">
              {predictions.map((prediction, index) => (
                <div key={index} className="prediction-card">
                  <div className="prediction-header">
                    <h5>{prediction.equipmentType}</h5>
                    <span 
                      className="risk-badge"
                      style={{ backgroundColor: getRiskLevelColor(prediction.riskLevel) }}
                    >
                      {prediction.riskLevel}
                    </span>
                  </div>
                  <div className="prediction-content">
                    <div className="prediction-metric">
                      <span className="metric-label">Failure Probability:</span>
                      <span className="metric-value">{prediction.probability}%</span>
                    </div>
                    <div className="prediction-metric">
                      <span className="metric-label">Timeframe:</span>
                      <span className="metric-value">{prediction.timeframe}</span>
                    </div>
                    <div className="prediction-metric">
                      <span className="metric-label">Confidence:</span>
                      <span className="metric-value">{Math.round(prediction.confidence * 100)}%</span>
                    </div>
                    <div className="recommended-action">
                      <strong>Action:</strong> {prediction.recommendedAction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="maintenance-section">
          <h4>Maintenance Schedule</h4>
          {maintenanceSchedule.length === 0 ? (
            <div className="no-data">No maintenance scheduled</div>
          ) : (
            <div className="maintenance-list">
              {maintenanceSchedule.map((task, index) => (
                <div key={index} className="maintenance-item">
                  <div className="task-info">
                    <h5>{task.equipmentName}</h5>
                    <span className="equipment-type">{task.equipmentType}</span>
                  </div>
                  <div className="task-details">
                    <span className="due-date">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button className="action-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

EquipmentFailurePrediction.propTypes = {
  hospitalId: PropTypes.string
};

EquipmentFailurePrediction.defaultProps = {
  hospitalId: null
};

export default EquipmentFailurePrediction;