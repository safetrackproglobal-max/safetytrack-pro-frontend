import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import './predictive.css';

const RiskAssessmentPredictor = () => {
  const [riskData, setRiskData] = useState([]);
  const [departmentRisks, setDepartmentRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30days');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    loadRiskData();
  }, [timeframe, selectedDepartment]);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual endpoint
      const data = await fetchRiskAssessmentData({
        timeframe,
        department: selectedDepartment
      });
      
      setRiskData(data.RiskAssessments);
      setDepartmentRisks(data.departmentRisks);
    } catch (error) {
      console.error('Error loading risk assessment data:', error);
      setRiskData(generateMockRiskData());
      setDepartmentRisks(generateMockDepartmentRisks());
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskAssessmentData = async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      riskAssessments: generateMockRiskData(),
      departmentRisks: generateMockDepartmentRisks()
    };
  };

  const generateMockRiskData = () => {
    const riskTypes = [
      'Biohazard Exposure', 'Chemical Spill', 'Equipment Failure',
      'Workplace Violence', 'Ergonomic Injury', 'Fire Hazard',
      'Electrical Safety', 'Slip/Trip/Fall', 'Infection Control'
    ];

    return riskTypes.map(risk => ({
      riskType: risk,
      currentScore: Math.random() * 80 + 20,
      predictedScore: Math.random() * 80 + 20,
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      confidence: Math.random() * 0.3 + 0.7
    }));
  };

  const generateMockDepartmentRisks = () => {
    const departments = [
      'Emergency Room', 'ICU', 'Operating Room', 'Laboratory',
      'Pharmacy', 'Radiology', 'Oncology', 'Pediatrics'
    ];

    return departments.map(dept => ({
      department: dept,
      biohazard: Math.random() * 100,
      chemical: Math.random() * 100,
      equipment: Math.random() * 100,
      physical: Math.random() * 100,
      environmental: Math.random() * 100,
      overallRisk: Math.random() * 80 + 20
    }));
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Critical', color: '#e74c3c' };
    if (score >= 60) return { level: 'High', color: '#f39c12' };
    if (score >= 40) return { level: 'Medium', color: '#f1c40f' };
    if (score >= 20) return { level: 'Low', color: '#27ae60' };
    return { level: 'Minimal', color: '#2ecc71' };
  };

  const getTrendIcon = (trend) => {
    return trend === 'increasing' ? '📈' : '📉';
  };

  if (loading) {
    return <div className="loading">Loading risk assessment data...</div>;
  }

  const radarData = departmentRisks.slice(0, 1).map(dept => ({
    subject: 'Biohazard',
    A: dept.biohazard,
    fullMark: 100
  }));

  return (
    <div className="risk-assessment-predictor">
      <div className="predictor-header">
        <h3>Risk Assessment Predictor</h3>
        <div className="controls">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departmentRisks.map(dept => (
              <option key={dept.department} value={dept.department}>
                {dept.department}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="risk-content">
        <div className="risk-overview">
          <h4>Overall Risk Overview</h4>
          <div className="risk-metrics">
            <div className="metric-card critical">
              <span className="metric-value">
                {Math.max(...riskData.map(r => r.currentScore)).toFixed(1)}%
              </span>
              <span className="metric-label">Highest Current Risk</span>
            </div>
            <div className="metric-card high">
              <span className="metric-value">
                {Math.max(...riskData.map(r => r.predictedScore)).toFixed(1)}%
              </span>
              <span className="metric-label">Highest Predicted Risk</span>
            </div>
            <div className="metric-card medium">
              <span className="metric-value">
                {riskData.filter(r => r.trend === 'increasing').length}
              </span>
              <span className="metric-label">Risks Increasing</span>
            </div>
            <div className="metric-card low">
              <span className="metric-value">
                {riskData.filter(r => r.severity === 'high').length}
              </span>
              <span className="metric-label">High Severity Risks</span>
            </div>
          </div>
        </div>

        <div className="risk-charts">
          <div className="chart-container">
            <h5>Risk Type Comparison</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="riskType" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Risk Score']}
                />
                <Legend />
                <Bar dataKey="currentScore" fill="#3498db" name="Current" />
                <Bar dataKey="predictedScore" fill="#e74c3c" name="Predicted" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h5>Department Risk Radar</h5>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar 
                  name="Risk Level" 
                  dataKey="A" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="risk-details">
          <h4>Detailed Risk Assessment</h4>
          <div className="risk-table">
            <div className="table-header">
              <span>Risk Type</span>
              <span>Current</span>
              <span>Predicted</span>
              <span>Trend</span>
              <span>Severity</span>
              <span>Confidence</span>
            </div>
            {riskData.map((risk, index) => {
              const currentLevel = getRiskLevel(risk.currentScore);
              const predictedLevel = getRiskLevel(risk.predictedScore);
              
              return (
                <div key={index} className="table-row">
                  <span className="risk-type">{risk.riskType}</span>
                  <span 
                    className="risk-score"
                    style={{ color: currentLevel.color }}
                  >
                    {risk.currentScore.toFixed(1)}%
                  </span>
                  <span 
                    className="risk-score"
                    style={{ color: predictedLevel.color }}
                  >
                    {risk.predictedScore.toFixed(1)}%
                  </span>
                  <span className="risk-trend">
                    {getTrendIcon(risk.trend)}
                  </span>
                  <span className={`severity-badge ${risk.severity}`}>
                    {risk.severity}
                  </span>
                  <span className="confidence">
                    {(risk.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="risk-mitigation">
          <h4>Risk Mitigation Recommendations</h4>
          <div className="recommendations-grid">
            <div className="recommendation-card">
              <div className="rec-icon">🛡️</div>
              <h5>Immediate Actions</h5>
              <ul>
                <li>Review and update safety protocols for high-risk areas</li>
                <li>Conduct emergency drills for critical scenarios</li>
                <li>Ensure PPE availability meets predicted demand</li>
              </ul>
            </div>
            <div className="recommendation-card">
              <div className="rec-icon">📋</div>
              <h5>Training Needs</h5>
              <ul>
                <li>Schedule safety training for identified risk areas</li>
                <li>Implement competency assessments for high-risk procedures</li>
                <li>Develop emergency response certification program</li>
              </ul>
            </div>
            <div className="recommendation-card">
              <div className="rec-icon">🔍</div>
              <h5>Monitoring & Audit</h5>
              <ul>
                <li>Increase audit frequency for high-risk departments</li>
                <li>Implement real-time monitoring for critical equipment</li>
                <li>Establish risk assessment review committee</li>
              </ul>
            </div>
            <div className="recommendation-card">
              <div className="rec-icon">📊</div>
              <h5>Strategic Planning</h5>
              <ul>
                <li>Develop risk mitigation roadmap for next quarter</li>
                <li>Allocate resources based on predicted risk levels</li>
                <li>Establish risk-based maintenance schedules</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentPredictor;