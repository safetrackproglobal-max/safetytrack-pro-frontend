import React from 'react';
import { Card } from 'antd';
import SafetyDocumentAnalyzer from '../../components/AI/SafetyDocumentAnalyzer';

const SafetyDocumentAnalysisPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Safety Document Analysis">
        <SafetyDocumentAnalyzer />
      </Card>
    </div>
  );
};

export default SafetyDocumentAnalysisPage;