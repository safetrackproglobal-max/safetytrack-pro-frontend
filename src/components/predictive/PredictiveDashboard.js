import React, { useState, useEffect } from 'react';
import AirQualityPredictive from './AirQualityPredictive';
import DiseaseOutbreakPrediction from './Diseaseoutbreakprediction';
import EquipmentFailurePrediction from './Equipmentfailureprediction';
import RiskAssessmentPrediction from './Riskassessmentprediction';
import AirQualityTrain from './AirQualityTrain';
import PropTypes from 'prop-types';
import './predictive.css';

const PredictiveDashboard = ({ hospitalId }) => {
  const [activeTab, setActiveTab] = useState('air-quality');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'air-quality', label: 'Air Quality', icon: '🌫️', component: AirQualityPredictive },
    { id: 'disease', label: 'Disease Outbreak', icon: '🦠', component: DiseaseOutbreakPrediction },
    { id: 'equipment', label: 'Equipment Failure', icon: '⚙️', component: EquipmentFailurePrediction },
    { id: 'risk', label: 'Risk Assessment', icon: '📊', component: RiskAssessmentPrediction },
    { id: 'training', label: 'Model Training', icon: '🧠', component: AirQualityTrain }
  ];

  const renderTabContent = () => {
    const tab = tabs.find(t => t.id === activeTab);
    if (!tab) return null;

    const Component = tab.component;
    return <Component hospitalId={hospitalId} />;
  };

  useEffect(() => {
    // Preload data when tab changes
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="predictive-dashboard">
      <div className="dashboard-header">
        <h1>Predictive Analytics Dashboard</h1>
        <p>AI-powered predictions for enhanced safety and operational efficiency</p>
      </div>

      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            disabled={loading}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
            {loading && activeTab === tab.id && <span className="loading-spinner"></span>}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {loading ? (
          <div className="tab-loading">Loading {tabs.find(t => t.id === activeTab)?.label}...</div>
        ) : (
          renderTabContent()
        )}
      </div>

      <div className="dashboard-footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <small>Predictions are based on historical data and machine learning models</small>
      </div>
    </div>
  );
};

PredictiveDashboard.propTypes = {
  hospitalId: PropTypes.string
};

PredictiveDashboard.defaultProps = {
  hospitalId: null
};

export default PredictiveDashboard;