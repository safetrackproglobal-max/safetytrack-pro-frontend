import React, { useState } from 'react';
import { useAIServices } from '../../hooks/useAIServices';
import './ai.css';

const LabResultAnalyzer = () => {
  const [labData, setLabData] = useState({
    testType: '',
    resultValue: '',
    units: '',
    referenceRange: '',
    patientAge: '',
    patientGender: ''
  });
  const { analyzeLabResults, loading, error, results } = useAIServices();

  const handleAnalyze = async () => {
    if (!labData.testType || !labData.resultValue) {
      alert('Please fill in required fields');
      return;
    }

    await analyzeLabResults([labData]);
  };

  const clearForm = () => {
    setLabData({
      testType: '',
      resultValue: '',
      units: '',
      referenceRange: '',
      patientAge: '',
      patientGender: ''
    });
  };

  const commonTests = [
    { value: 'glucose', label: 'Glucose' },
    { value: 'wbc', label: 'White Blood Cells' },
    { value: 'hgb', label: 'Hemoglobin' },
    { value: 'plt', label: 'Platelets' },
    { value: 'na', label: 'Sodium' },
    { value: 'k', label: 'Potassium' },
    { value: 'creatinine', label: 'Creatinine' },
    { value: 'alt', label: 'ALT' },
    { value: 'ast', label: 'AST' }
  ];

  return (
    <div className="ai-service-card">
      <div className="service-header">
        <span className="service-icon">🧪</span>
        <h2>Lab Result Analyzer</h2>
      </div>

      <div className="input-section">
        <div className="lab-form">
          <h4>Lab Test Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Test Type *</label>
              <select
                value={labData.testType}
                onChange={(e) => setLabData({...labData, testType: e.target.value})}
                required
              >
                <option value="">Select Test Type</option>
                {commonTests.map(test => (
                  <option key={test.value} value={test.value}>
                    {test.label}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Result Value *</label>
              <input
                type="number"
                step="any"
                value={labData.resultValue}
                onChange={(e) => setLabData({...labData, resultValue: e.target.value})}
                placeholder="Enter value"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Units</label>
              <input
                type="text"
                value={labData.units}
                onChange={(e) => setLabData({...labData, units: e.target.value})}
                placeholder="e.g., mg/dL, U/L"
              />
            </div>
            <div className="form-group">
              <label>Reference Range</label>
              <input
                type="text"
                value={labData.referenceRange}
                onChange={(e) => setLabData({...labData, referenceRange: e.target.value})}
                placeholder="e.g., 70-100 mg/dL"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Patient Age</label>
              <input
                type="number"
                value={labData.patientAge}
                onChange={(e) => setLabData({...labData, patientAge: e.target.value})}
                placeholder="Age in years"
              />
            </div>
            <div className="form-group">
              <label>Patient Gender</label>
              <select
                value={labData.patientGender}
                onChange={(e) => setLabData({...labData, patientGender: e.target.value})}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            onClick={handleAnalyze} 
            disabled={loading || !labData.testType || !labData.resultValue}
            className="analyze-btn"
          >
            {loading ? 'Analyzing...' : 'Analyze Results'}
          </button>
          <button 
            onClick={clearForm}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {results.labAnalysis && (
        <div className="analysis-results">
          <h3>Lab Analysis Results</h3>
          
          <div className="result-summary">
            <h4>Interpretation</h4>
            <div className={`result-status ${results.labAnalysis.interpretation?.toLowerCase()}`}>
              {results.labAnalysis.interpretation}
            </div>
            <p>{results.labAnalysis.explanation}</p>
          </div>

          {results.labAnalysis.anomalies && results.labAnalysis.anomalies.length > 0 && (
            <div className="anomalies-section">
              <h4>Detected Anomalies</h4>
              <div className="anomalies-list">
                {results.labAnalysis.anomalies.map((anomaly, index) => (
                  <div key={index} className="anomaly-item">
                    <span className="anomaly-type">{anomaly.test}</span>
                    <span className="anomaly-value">{anomaly.value} {anomaly.units}</span>
                    <span className={`anomaly-severity ${anomaly.severity}`}>
                      {anomaly.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.labAnalysis.recommendations && (
            <div className="recommendations-section">
              <h4>Clinical Recommendations</h4>
              <ul className="recommendations-list">
                {results.labAnalysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {results.labAnalysis.follow_up && (
            <div className="followup-section">
              <h4>Recommended Follow-up</h4>
              <ul className="followup-list">
                {results.labAnalysis.follow_up.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="disclaimer">
            <p>⚠️ This analysis is based on the provided data and should be verified by a qualified healthcare professional. Always consult with a physician for medical advice.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabResultAnalyzer;