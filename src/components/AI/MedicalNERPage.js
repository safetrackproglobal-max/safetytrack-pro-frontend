import React from 'react';
import { Card } from 'antd';
import MedicalTextAnalysis from '../../components/AI/MedicalTextAnalysis';

const MedicalNERPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Medical NER Analysis">
        <MedicalTextAnalysis />
      </Card>
    </div>
  );
};

export default MedicalNERPage;