import React, { useState, useEffect, useCallback } from 'react';
import { hospitalService } from '../../services/hospitalService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import PropTypes from 'prop-types';
import './predictive.css';

const DiseaseOutbreakPrediction = ({ hospitalId }) => {
  const [outbreakData, setOutbreakData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeframe, setTimeframe] = useState('30days');

  const loadOutbreakData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await hospitalService.getDiseaseOutbreakPredictions({
        hospitalId,
        region: selectedRegion,
        timeframe
      });
      
      setOutbreakData(data?.currentOutbreaks || []);
      setPredictions(data?.predictions || []);
      
    } catch (error) {
      console.error('Error loading outbreak data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [hospitalId, selectedRegion, timeframe]);

  const getTrendIcon = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getRiskLevel = (probability) => {
    if (probability > 70) return 'high';
    if (probability > 40) return 'medium';
    return 'low';
  };

  useEffect(() => {
    loadOutbreakData();
  }, [loadOutbreakData]);

  if (loading) {
    return <div className="predictive-loading">Loading outbreak predictions...</div>;
  }

  if (error) {
    return (
      <div className="predictive-error">
        <p>Error: {error}</p>
        <button onClick={loadOutbreakData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="outbreak-predictor">
      <div className="predictor-header">
        <h3>Disease Outbreak Predictor</h3>
        <div className="controls">
          <select 
            value={selectedRegion} 
            onChange={(e) => setSelectedRegion(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Regions</option>
            <option value="north">Northern Region</option>
            <option value="south">Southern Region</option>
            <option value="east">Eastern Region</option>
            <option value="west">Western Region</option>
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
          <button onClick={loadOutbreakData} className="refresh-btn" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="outbreak-content">
        <div className="current-situation">
          <h4>Current Outbreaks</h4>
          {outbreakData.length === 0 ? (
            <div className="no-data">No current outbreaks</div>
          ) : (
            <div className="disease-grid">
              {outbreakData.map((disease, index) => (
                <div key={index} className="disease-card">
                  <div className="disease-header">
                    <h5>{disease.diseaseName}</h5>
                    <span className="trend-indicator">{getTrendIcon(disease.trend)}</span>
                  </div>
                  <div className="disease-stats">
                    <span 
                      className="cases-count"
                      style={{ color: getSeverityColor(disease.severity) }}
                    >
                      {disease.caseCount} cases
                    </span>
                    <span className="severity-badge" style={{ 
                      backgroundColor: getSeverityColor(disease.severity) 
                    }}>
                      {disease.severity}
                    </span>
                  </div>
                  <div className="disease-meta">
                    <span>Region: {disease.region}</span>
                    <span>Last update: {new Date(disease.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="predictions-section">
          <h4>Outbreak Predictions</h4>
          {predictions.length === 0 ? (
            <div className="no-data">No predictions available</div>
          ) : (
            <div className="predictions-grid">
              {predictions.map((prediction, index) => {
                const riskLevel = getRiskLevel(prediction.probability);
                return (
                  <div key={index} className="prediction-card">
                    <div className="prediction-header">
                      <h5>{prediction.diseaseName}</h5>
                      <span className="confidence-badge">
                        {Math.round(prediction.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="prediction-content">
                      <div className="prediction-metric">
                        <span className="metric-label">Probability:</span>
                        <span className="metric-value">{prediction.probability}%</span>
                      </div>
                      <div className="prediction-metric">
                        <span className="metric-label">Timeframe:</span>
                        <span className="metric-value">{prediction.timeframe}</span>
                      </div>
                      <div className="prediction-metric">
                        <span className="metric-label">Expected Cases:</span>
                        <span className="metric-value">{prediction.expectedCases}</span>
                      </div>
                      <div className="risk-level">
                        <span className="risk-label">Risk Level:</span>
                        <span className={`risk-value ${riskLevel}`}>
                          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="recommendations-section">
          <h4>Preventive Recommendations</h4>
          <div className="recommendations-grid">
            <div className="recommendation-card">
              <div className="rec-icon">🧼</div>
              <h5>Enhanced Hygiene</h5>
              <p>Increase hand hygiene compliance to 95% and deploy additional sanitization stations</p>
            </div>
            <div className="recommendation-card">
              <div className="rec-icon">😷</div>
              <h5>PPE Management</h5>
              <p>Ensure 30-day stock of N95 masks and maintain PPE usage monitoring</p>
            </div>
            <div className="recommendation-card">
              <div className="rec-icon">📋</div>
              <h5>Screening Protocols</h5>
              <p>Implement temperature checks and symptom screening at all entry points</p>
            </div>
            <div className="recommendation-card">
              <div className="rec-icon">📞</div>
              <h5>Communication Plan</h5>
              <p>Activate outbreak response team and distribute emergency protocols</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DiseaseOutbreakPrediction.propTypes = {
  hospitalId: PropTypes.string
};

DiseaseOutbreakPrediction.defaultProps = {
  hospitalId: null
};

export default DiseaseOutbreakPrediction;