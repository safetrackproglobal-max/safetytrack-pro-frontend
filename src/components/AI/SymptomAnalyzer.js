import React, { useState } from 'react';
import { useAIServices } from '../../hooks/useAIServices';
import './ai.css';

const SymptomAnalyzer = () => {
  const [symptoms, setSymptoms] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState({
    duration: '',
    severity: 'moderate',
    frequency: '',
    triggers: '',
    relievingFactors: ''
  });
  const { analyzeSymptoms, loading, error, results } = useAIServices();

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      alert('Please describe your symptoms');
      return;
    }

    const symptomAnalysisText = `Symptoms: ${symptoms}
    Duration: ${additionalInfo.duration || 'Not specified'}
    Severity: ${additionalInfo.severity}
    Frequency: ${additionalInfo.frequency || 'Not specified'}
    Triggers: ${additionalInfo.triggers || 'None identified'}
    Relieving Factors: ${additionalInfo.relievingFactors || 'None identified'}`;

    await analyzeSymptoms(symptomAnalysisText);
  };

  const clearForm = () => {
    setSymptoms('');
    setAdditionalInfo({
      duration: '',
      severity: 'moderate',
      frequency: '',
      triggers: '',
      relievingFactors: ''
    });
  };

  const severityOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
    { value: 'very-severe', label: 'Very Severe' }
  ];

  const durationOptions = [
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'chronic', label: 'Chronic' }
  ];

  return (
    <div className="ai-service-card">
      <div className="service-header">
        <span className="service-icon">🤒</span>
        <h2>Symptom Analyzer</h2>
        <p>Describe your symptoms for AI-powered analysis and guidance</p>
      </div>

      <div className="input-section">
        <div className="form-group">
          <label>Describe Your Symptoms in Detail *</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe what you're feeling, when it started, and any patterns you've noticed..."
            rows="6"
            disabled={loading}
            required
          />
        </div>

        <div className="additional-info">
          <h4>Additional Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Duration</label>
              <select
                value={additionalInfo.duration}
                onChange={(e) => setAdditionalInfo({...additionalInfo, duration: e.target.value})}
              >
                <option value="">Select Duration</option>
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select
                value={additionalInfo.severity}
                onChange={(e) => setAdditionalInfo({...additionalInfo, severity: e.target.value})}
              >
                {severityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Frequency</label>
              <input
                type="text"
                value={additionalInfo.frequency}
                onChange={(e) => setAdditionalInfo({...additionalInfo, frequency: e.target.value})}
                placeholder="e.g., Daily, Weekly, Constant"
              />
            </div>
            <div className="form-group">
              <label>Known Triggers</label>
              <input
                type="text"
                value={additionalInfo.triggers}
                onChange={(e) => setAdditionalInfo({...additionalInfo, triggers: e.target.value})}
                placeholder="e.g., Stress, Certain foods, Exercise"
              />
            </div>
          </div>

          <div className="form-group">
            <label>What Makes it Better?</label>
            <input
              type="text"
              value={additionalInfo.relievingFactors}
              onChange={(e) => setAdditionalInfo({...additionalInfo, relievingFactors: e.target.value})}
              placeholder="e.g., Rest, Medication, Cold compress"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            onClick={handleAnalyze} 
            disabled={loading || !symptoms.trim()}
            className="analyze-btn"
          >
            {loading ? 'Analyzing Symptoms...' : 'Analyze Symptoms'}
          </button>
          <button 
            onClick={clearForm}
            className="btn-secondary"
          >
            Clear Form
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {results.symptoms && (
        <div className="analysis-results">
          <h3>Symptom Analysis Results</h3>
          
          {results.symptoms.possible_conditions && (
            <div className="conditions-section">
              <h4>Possible Conditions</h4>
              <div className="conditions-list">
                {results.symptoms.possible_conditions.slice(0, 5).map((condition, index) => (
                  <div key={index} className="condition-item">
                    <span className="condition-name">{condition.name}</span>
                    <span className="condition-probability">
                      {Math.round(condition.probability * 100)}% match
                    </span>
                    <div className="condition-description">
                      {condition.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.symptoms.recommended_actions && (
            <div className="actions-section">
              <h4>Recommended Actions</h4>
              <div className="actions-grid">
                <div className="action-category">
                  <h5>Immediate Care</h5>
                  <ul>
                    {results.symptoms.recommended_actions.immediate?.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
                <div className="action-category">
                  <h5>When to Seek Help</h5>
                  <ul>
                    {results.symptoms.recommended_actions.emergency_signs?.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </div>
                <div className="action-category">
                  <h5>Self-Care</h5>
                  <ul>
                    {results.symptoms.recommended_actions.self_care?.map((care, index) => (
                      <li key={index}>{care}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {results.symptoms.when_to_see_doctor && (
            <div className="doctor-section">
              <h4>When to See a Doctor</h4>
              <ul>
                {results.symptoms.when_to_see_doctor.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="disclaimer">
            <p>⚠️ This symptom analysis is for informational purposes only and is not a medical diagnosis. 
            Always consult with a qualified healthcare professional for proper medical advice and treatment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomAnalyzer;