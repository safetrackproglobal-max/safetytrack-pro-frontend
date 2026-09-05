import React, { useState, useEffect } from 'react';
import { useAIServices } from '../../hooks/useAIServices';
import './ai.css';

const MedicalTextAnalysis = () => {
  const [medicalText, setMedicalText] = useState('');
  const { summarizeText, loading, error, results } = useAIServices();
  
  // Debug logging
  useEffect(() => {
    console.log('Results:', results);
    console.log('Results.summary:', results?.summary);
  }, [results]);
  
  // Safely get the summary data
  const getSummaryData = () => {
    const data = results?.summary || {};
    
    // If data is the transformed result object from your hook
    if (data.summary && typeof data.summary === 'object') {
      // Handle case where data.summary is the object with summary, key_points, etc.
      return data.summary;
    }
    
    // If data is already the inner object
    return data;
  };
  
  const summaryData = getSummaryData();
  
  // Safely get the summary text
  const getSummaryText = () => {
    // Try multiple possible property names
    const text = summaryData.summary || summaryData.text || summaryData.result || '';
    
    // Ensure it's a string
    if (typeof text === 'string') {
      return text;
    }
    
    // If it's still not a string, convert it
    return String(text || '');
  };
  
  const summaryText = getSummaryText();
  
  // Helper functions
  const getWordCount = (text) => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  const handleAnalyze = async () => {
    if (!medicalText.trim()) {
      alert('Please enter medical text to analyze');
      return;
    }
    await summarizeText(medicalText);
  };

  const clearText = () => {
    setMedicalText('');
  };

  const sampleTexts = [
    {
      title: "Clinical Note",
      content: "Patient presents with acute onset of fever, chills, and productive cough. Chest X-ray shows right lower lobe consolidation. White blood cell count elevated at 15,000/mm³. Suspected community-acquired pneumonia."
    },
    {
      title: "Research Abstract",
      content: "This study examines the efficacy of new antihypertensive medications in patients with stage 2 hypertension. Results show 45% reduction in systolic BP compared to control group over 12-week period with minimal side effects."
    },
    {
      title: "Patient History",
      content: "68-year-old male with history of type 2 diabetes, hypertension, and hyperlipidemia. Current medications include metformin 1000mg BID, lisinopril 20mg daily, atorvastatin 40mg daily. Presents for routine follow-up."
    }
  ];

  // Calculate word counts
  const originalWords = getWordCount(medicalText);
  const summaryWords = getWordCount(summaryText);
  const reductionPercentage = originalWords > 0 
    ? Math.round(((originalWords - summaryWords) / originalWords) * 100)
    : 0;

  // Check if we should show results
  const shouldShowResults = summaryText && summaryText.trim() !== '' && summaryText !== 'No summary available';

  return (
    <div className="ai-service-card">
      <div className="service-header">
        <span className="service-icon">📝</span>
        <h2>Medical Text Analysis</h2>
      </div>

      <div className="input-section">
        <div className="sample-texts">
          <h4>Quick Examples</h4>
          <div className="sample-buttons">
            {sampleTexts.map((sample, index) => (
              <button
                key={index}
                className="btn-secondary btn-sm"
                onClick={() => setMedicalText(sample.content)}
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Medical Text to Analyze</label>
          <textarea
            value={medicalText}
            onChange={(e) => setMedicalText(e.target.value)}
            placeholder="Paste clinical notes, research abstracts, patient histories, or any medical text..."
            rows="8"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button 
            onClick={handleAnalyze} 
            disabled={loading || !medicalText.trim()}
            className="analyze-btn"
          >
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
          <button 
            onClick={clearText}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {shouldShowResults && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          
          <div className="summary-section">
            <h4>Summary</h4>
            <div className="summary-content">
              <p>{summaryText}</p>
            </div>
          </div>

          {summaryData.key_points && Array.isArray(summaryData.key_points) && summaryData.key_points.length > 0 && (
            <div className="key-points-section">
              <h4>Key Points</h4>
              <ul className="key-points-list">
                {summaryData.key_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {summaryData.medical_terms && Array.isArray(summaryData.medical_terms) && summaryData.medical_terms.length > 0 && (
            <div className="terms-section">
              <h4>Medical Terminology</h4>
              <div className="entities-grid">
                {summaryData.medical_terms.map((term, index) => (
                  <span key={index} className="entity-tag disease">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="stats-section">
            <h4>Text Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Original Length</span>
                <span className="stat-value">
                  {originalWords} words
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Summary Length</span>
                <span className="stat-value">
                  {summaryWords} words
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reduction</span>
                <span className="stat-value">
                  {reductionPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalTextAnalysis;