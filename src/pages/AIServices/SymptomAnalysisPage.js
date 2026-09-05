import React from 'react';
import { Card } from 'antd';
import SymptomAnalyzer from '../../components/AI/SymptomAnalyzer';

const SymptomAnalysisPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Symptom Analysis">
        <SymptomAnalyzer />
      </Card>
    </div>
  );
};

export default SymptomAnalysisPage;
