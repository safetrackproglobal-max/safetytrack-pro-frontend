import React, { useState } from 'react';
import './predictive.css';

const AirQualityTrain = () => {
  const [trainingStatus, setTrainingStatus] = useState('idle');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [trainingData, setTrainingData] = useState({
    timeRange: '365days',
    parameters: ['pm2_5', 'pm10', 'temperature', 'humidity'],
    algorithm: 'lstm',
    epochs: 100
  });

  const handleTrainModel = async () => {
    setTrainingStatus('training');
    
    // Simulate training process
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setTrainingProgress(i);
    }
    
    setTrainingStatus('completed');
    setModelMetrics({
      accuracy: 0.923,
      mae: 2.1,
      mse: 6.8,
      r2: 0.87,
      trainingTime: '2m 45s',
      dataPoints: 12500
    });
  };

  const handleInputChange = (field, value) => {
    setTrainingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParameterToggle = (parameter) => {
    setTrainingData(prev => ({
      ...prev,
      parameters: prev.parameters.includes(parameter)
        ? prev.parameters.filter(p => p !== parameter)
        : [...prev.parameters, parameter]
    }));
  };

  return (
    <div className="training-content">
      <div className="training-configuration">
        <h3>Model Training Configuration</h3>
        
        <div className="config-grid">
          <div className="config-group">
            <label>Time Range</label>
            <select
              value={trainingData.timeRange}
              onChange={(e) => handleInputChange('timeRange', e.target.value)}
            >
              <option value="90days">Last 90 Days</option>
              <option value="180days">Last 180 Days</option>
              <option value="365days">Last 365 Days</option>
              <option value="2years">Last 2 Years</option>
            </select>
          </div>

          <div className="config-group">
            <label>Algorithm</label>
            <select
              value={trainingData.algorithm}
              onChange={(e) => handleInputChange('algorithm', e.target.value)}
            >
              <option value="lstm">LSTM Neural Network</option>
              <option value="random_forest">Random Forest</option>
              <option value="xgboost">XGBoost</option>
              <option value="prophet">Facebook Prophet</option>
            </select>
          </div>

          <div className="config-group">
            <label>Training Epochs</label>
            <input
              type="number"
              value={trainingData.epochs}
              onChange={(e) => handleInputChange('epochs', parseInt(e.target.value))}
              min="10"
              max="1000"
            />
          </div>
        </div>

        <div className="parameters-selection">
          <label>Parameters to Include</label>
          <div className="parameters-grid">
            {['pm2_5', 'pm10', 'temperature', 'humidity', 'co', 'no2', 'o3', 'so2'].map(param => (
              <label key={param} className="parameter-checkbox">
                <input
                  type="checkbox"
                  checked={trainingData.parameters.includes(param)}
                  onChange={() => handleParameterToggle(param)}
                />
                <span className="checkmark"></span>
                {param.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        <button
          className="train-btn"
          onClick={handleTrainModel}
          disabled={trainingStatus === 'training'}
        >
          {trainingStatus === 'training' ? 'Training...' : 'Start Training'}
        </button>
      </div>

      <div className="training-progress">
        <h3>Training Progress</h3>
        
        {trainingStatus === 'training' && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${trainingProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">{trainingProgress}% Complete</span>
            
            <div className="progress-details">
              <div className="progress-step">✓ Data Collection</div>
              <div className="progress-step">✓ Data Preprocessing</div>
              <div className="progress-step">
                {trainingProgress > 50 ? '✓' : '⏳'} Model Training
              </div>
              <div className="progress-step">
                {trainingProgress > 90 ? '✓' : '⏳'} Validation
              </div>
            </div>
          </div>
        )}

        {trainingStatus === 'completed' && modelMetrics && (
          <div className="training-results">
            <h4>Training Completed Successfully! 🎉</h4>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-value">{modelMetrics.accuracy * 100}%</span>
                <span className="metric-label">Accuracy</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{modelMetrics.mae}</span>
                <span className="metric-label">MAE</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{modelMetrics.r2}</span>
                <span className="metric-label">R² Score</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{modelMetrics.trainingTime}</span>
                <span className="metric-label">Training Time</span>
              </div>
            </div>

            <div className="model-actions">
              <button className="btn-primary">Deploy Model</button>
              <button className="btn-secondary">Export Model</button>
              <button className="btn-secondary">View Detailed Report</button>
            </div>
          </div>
        )}

        {trainingStatus === 'idle' && (
          <div className="idle-state">
            <p>Configure your training parameters and click "Start Training" to begin</p>
            <div className="training-tips">
              <h4>💡 Training Tips:</h4>
              <ul>
                <li>More data generally leads to better predictions</li>
                <li>Include relevant parameters for your use case</li>
                <li>LSTM networks work well for time series data</li>
                <li>Monitor training progress for overfitting</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityTrain;