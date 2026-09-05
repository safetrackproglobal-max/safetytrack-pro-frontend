import React from 'react';
import PropTypes from 'prop-types';

const WaterQualitySampleCard = ({ sample, onSelect, isSelected = false }) => {
  const getComplianceStatus = (sample) => {
    if (!sample) return { status: 'Unknown', color: '#9E9E9E' };
    if (!sample.compliant) return { status: 'Non-Compliant', color: '#F44336' };
    return { status: 'Compliant', color: '#4CAF50' };
  };

  const formatDate = (dateString) => {
    try {
      return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    } catch {
      return 'Invalid date';
    }
  };

  const safeGet = (obj, key, defaultValue = 'N/A') => {
    return obj && obj[key] != null ? obj[key] : defaultValue;
  };

  const parseViolations = (violations) => {
    try {
      if (Array.isArray(violations)) return violations;
      if (typeof violations === 'string') {
        return JSON.parse(violations);
      }
      return [];
    } catch {
      return Array.isArray(violations) ? violations : [violations];
    }
  };

  if (!sample) {
    return (
      <div className="water-quality-sample-card empty">
        <div className="no-sample-data">
          <p>No sample data available</p>
        </div>
      </div>
    );
  }

  const status = getComplianceStatus(sample);
  const violations = parseViolations(sample.violations);
  const hasViolations = violations && violations.length > 0;

  return (
    <div 
      className={`water-quality-sample-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect && onSelect(sample)}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="location-info">
          <h4 className="site-name">
            {safeGet(sample.site, 'name', 'Unknown Site')}
          </h4>
          <span className="water-type">
            {safeGet(sample.site, 'water_type', 'N/A')}
          </span>
        </div>
        <div 
          className="compliance-badge"
          style={{ backgroundColor: status.color }}
        >
          {status.status}
        </div>
      </div>

      {/* Collection Info */}
      <div className="collection-info">
        <div className="info-item">
          <span className="label">Collection Date:</span>
          <span className="value">{formatDate(sample.collection_time)}</span>
        </div>
        <div className="info-item">
          <span className="label">Collected By:</span>
          <span className="value">{safeGet(sample, 'collected_by', 'N/A')}</span>
        </div>
      </div>

      {/* Test Results Summary */}
      <div className="test-results-summary">
        <h5>Test Results</h5>
        <div className="results-grid">
          <div className="result-item">
            <span className="parameter">pH</span>
            <span className="value">{safeGet(sample, 'ph', 'N/A')}</span>
          </div>
          <div className="result-item">
            <span className="parameter">Turbidity</span>
            <span className="value">{safeGet(sample, 'turbidity', 'N/A')}</span>
            <span className="unit">NTU</span>
          </div>
          <div className="result-item">
            <span className="parameter">Temp</span>
            <span className="value">{safeGet(sample, 'temperature', 'N/A')}</span>
            <span className="unit">°C</span>
          </div>
          <div className="result-item">
            <span className="parameter">DO</span>
            <span className="value">{safeGet(sample, 'dissolved_oxygen', 'N/A')}</span>
            <span className="unit">mg/L</span>
          </div>
        </div>
      </div>

      {/* Violations Alert */}
      {hasViolations && (
        <div className="violations-alert">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <span className="alert-title">Violations Detected</span>
          </div>
          <div className="violations-list">
            {violations.slice(0, 2).map((violation, index) => (
              <div key={index} className="violation-item">
                {violation}
              </div>
            ))}
            {violations.length > 2 && (
              <div className="more-violations">
                +{violations.length - 2} more violations
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="card-actions">
        <button 
          className="view-details-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(sample);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

WaterQualitySampleCard.propTypes = {
  sample: PropTypes.object,
  onSelect: PropTypes.func,
  isSelected: PropTypes.bool
};

WaterQualitySampleCard.defaultProps = {
  sample: null,
  onSelect: null,
  isSelected: false
};

export default WaterQualitySampleCard;