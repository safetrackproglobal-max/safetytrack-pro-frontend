import React from 'react';
import { Card } from 'antd';
import DiseasePrediction from '../../components/AI/DiseasePrediction';

const DiseasePredictionPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Disease Prediction">
        <DiseasePrediction />
      </Card>
    </div>
  );
};

export default DiseasePredictionPage;