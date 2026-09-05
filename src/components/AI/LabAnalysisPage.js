import React from 'react';
import { Card } from 'antd';
import LabResultAnalyzer from '../../components/AI/LabResultAnalyzer';

const LabAnalysisPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Lab Result Analysis">
        <LabResultAnalyzer />
      </Card>
    </div>
  );
};

export default LabAnalysisPage;