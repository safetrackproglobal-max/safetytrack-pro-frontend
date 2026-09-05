import React from 'react';
import { Card } from 'antd';
import RiskAssessment from '../../components/AI/RiskAssessment';

const RiskAssessmentAIPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="AI Risk Assessment">
        <RiskAssessment />
      </Card>
    </div>
  );
};

export default RiskAssessmentAIPage;