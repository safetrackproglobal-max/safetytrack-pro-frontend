import React, { useState, useEffect } from 'react';
import { complianceService } from '../../services/complianceService';

const DepartmentComplianceCard = ({ department }) => {
  const [complianceScore, setComplianceScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComplianceScore = async () => {
      try {
        const score = await complianceService.getComplianceScore(department.id);
        setComplianceScore(score);
      } catch (error) {
        console.error('Error loading compliance score:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComplianceScore();
  }, [department.id]);

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FFC107';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <div className="department-card loading">
        <h3>{department.name}</h3>
        <p>Loading compliance data...</p>
      </div>
    );
  }

  return (
    <div className="department-card">
      <h3>{department.name}</h3>
      <div className="compliance-score">
        <div 
          className="score-circle"
          style={{ 
            borderColor: getScoreColor(complianceScore?.compliance_score || 0),
            color: getScoreColor(complianceScore?.compliance_score || 0)
          }}
        >
          {complianceScore?.compliance_score || 'N/A'}%
        </div>
      </div>
      <div className="department-stats">
        <div className="stat">
          <span className="stat-label">Risk Level:</span>
          <span className={`stat-value risk-${department.risk_level?.toLowerCase()}`}>
            {department.risk_level}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Open Findings:</span>
          <span className="stat-value">
            {complianceScore?.open_findings || 0}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Type:</span>
          <span className="stat-value">{department.type}</span>
        </div>
      </div>
      <button className="view-details-btn">
        View Details
      </button>
    </div>
  );
};

export default DepartmentComplianceCard;