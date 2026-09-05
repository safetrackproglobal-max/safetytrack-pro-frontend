import React, { useState } from 'react';
import { useAIServices } from '../../hooks/useAIServices';
import './ai.css';

const DiseasePrediction = () => {
  const [symptoms, setSymptoms] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    preExistingConditions: ''
  });
  const { analyzeSymptoms, loading, error, results } = useAIServices();

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      alert('Please describe the symptoms');
      return;
    }

    const analysisText = `Patient: ${patientInfo.age} years, ${patientInfo.gender}. 
    Pre-existing conditions: ${patientInfo.preExistingConditions || 'None'}.
    Symptoms: ${symptoms}`;

    await analyzeSymptoms(analysisText);
  };

  const clearForm = () => {
    setSymptoms('');
    setPatientInfo({
      age: '',
      gender: '',
      preExistingConditions: ''
    });
  };

  return (
    <div className="ai-service-card">
      <div className="service-header">
        <span className="service-icon">🔬</span>
        <h2>Disease Prediction</h2>
      </div>

      <div className="input-section">
        <div className="patient-info-form">
          <h4>Patient Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                placeholder="Enter age"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Pre-existing Conditions</label>
            <input
              type="text"
              value={patientInfo.preExistingConditions}
              onChange={(e) => setPatientInfo({...patientInfo, preExistingConditions: e.target.value})}
              placeholder="e.g., Diabetes, Hypertension"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Describe Symptoms in Detail</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe all symptoms, their duration, severity, and any patterns you've noticed..."
            rows="6"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button 
            onClick={handleAnalyze} 
            disabled={loading || !symptoms.trim()}
            className="analyze-btn"
          >
            {loading ? 'Analyzing...' : 'Predict Disease'}
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

      {results.symptoms && (
        <div className="analysis-results">
          <h3>Disease Prediction Results</h3>
          
          {results.symptoms.extracted_entities && (
            <div className="entities-section">
              <h4>Detected Medical Terms</h4>
              <div className="entities-grid">
                {results.symptoms.extracted_entities.symptoms && 
                 results.symptoms.extracted_entities.symptoms.map((symptom, index) => (
                  <span key={index} className="entity-tag symptom">
                    {symptom.text} ({Math.round(symptom.confidence * 100)}%)
                  </span>
                ))}
                
                {results.symptoms.extracted_entities.diseases && 
                 results.symptoms.extracted_entities.diseases.map((disease, index) => (
                  <span key={index} className="entity-tag disease">
                    {disease.text} ({Math.round(disease.confidence * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          {results.symptoms.disease_predictions && (
            <div className="predictions-section">
              <h4>Possible Conditions (Probability)</h4>
              <div className="predictions-list">
                {results.symptoms.disease_predictions.slice(0, 5).map((prediction, index) => (
                  <div key={index} className="prediction-item">
                    <span className="prediction-label">{prediction.label}</span>
                    <span className="prediction-score">
                      {Math.round(prediction.score * 100)}% confidence
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="recommendations-section">
            <h4>Recommended Next Steps</h4>
            <ul className="recommendations-list">
              <li>✅ Schedule appointment with primary care physician</li>
              <li>✅ Consider consulting a specialist if symptoms persist</li>
              <li>✅ Monitor symptoms and keep a health journal</li>
              <li>✅ Follow up with recommended diagnostic tests</li>
            </ul>
          </div>

          <div className="disclaimer">
            <p>⚠️ This prediction is for informational purposes only. Always consult with qualified healthcare professionals for medical diagnosis and treatment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseasePrediction;