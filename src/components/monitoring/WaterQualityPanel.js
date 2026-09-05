import React, { useState } from 'react';
import PropTypes from 'prop-types';

const WaterQualityPanel = ({ samples = [] }) => {
  const [selectedSample, setSelectedSample] = useState(null);

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

  const safeGet = (obj, key, defaultValue = 'N/A') => {
    return obj && obj[key] != null ? obj[key] : defaultValue;
  };

  const safeSamples = Array.isArray(samples) ? samples : [];

  return (
    <div className="water-quality-panel">
      <div className="panel-header">
        <h3>Water Quality Samples</h3>
        <span className="sample-count">{safeSamples.length} samples</span>
      </div>

      <div className="samples-grid">
        <div className="samples-list">
          <h4>Recent Samples</h4>
          {safeSamples.slice(0, 10).map(sample => {
            const status = getComplianceStatus(sample);
            return (
              <div
                key={sample.id}
                className={`sample-item ${selectedSample?.id === sample.id ? 'selected' : ''}`}
                onClick={() => setSelectedSample(sample)}
              >
                <div className="sample-info">
                  <span className="sample-location">
                    {safeGet(sample.site, 'name', 'Unknown Site')}
                  </span>
                  <span className="sample-date">
                    {formatDate(sample.collection_time)}
                  </span>
                </div>
                <span 
                  className="compliance-status"
                  style={{ color: status.color }}
                >
                  {status.status}
                </span>
              </div>
            );
          })}
          {safeSamples.length === 0 && (
            <div className="no-samples">No water quality samples available</div>
          )}
        </div>

        <div className="sample-details">
          {selectedSample ? (
            <>
              <h4>Sample Details</h4>
              <div className="detail-section">
                <h5>Basic Information</h5>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Collection Date:</span>
                    <span className="value">{formatDate(selectedSample.collection_time)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Collected By:</span>
                    <span className="value">{safeGet(selectedSample, 'collected_by', 'N/A')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Water Type:</span>
                    <span className="value">{safeGet(selectedSample.site, 'water_type', 'N/A')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h5>Test Results</h5>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">pH Level:</span>
                    <span className="value">{safeGet(selectedSample, 'ph', 'N/A')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Turbidity:</span>
                    <span className="value">{safeGet(selectedSample, 'turbidity', 'N/A')} NTU</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Temperature:</span>
                    <span className="value">{safeGet(selectedSample, 'temperature', 'N/A')}°C</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Dissolved Oxygen:</span>
                    <span className="value">{safeGet(selectedSample, 'dissolved_oxygen', 'N/A')} mg/L</span>
                  </div>
                </div>
              </div>

              {selectedSample.violations && (
                <div className="detail-section">
                  <h5>Violations</h5>
                  <div className="violations-list">
                    {parseViolations(selectedSample.violations).map((violation, index) => (
                      <div key={index} className="violation-item">
                        ⚠️ {violation}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-selection">
              <p>Select a sample to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

WaterQualityPanel.propTypes = {
  samples: PropTypes.arrayOf(PropTypes.object)
};

WaterQualityPanel.defaultProps = {
  samples: []
};

export default WaterQualityPanel;