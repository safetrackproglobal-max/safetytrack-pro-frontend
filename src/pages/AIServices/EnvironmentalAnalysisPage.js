import React from 'react';
import { Card } from 'antd';
import EnvironmentalDataAnalysis from '../../components/AI/EnvironmentalDataAnalysis';

const EnvironmentalAnalysisPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Environmental Data Analysis">
        <EnvironmentalDataAnalysis />
      </Card>
    </div>
  );
};

export default EnvironmentalAnalysisPage;