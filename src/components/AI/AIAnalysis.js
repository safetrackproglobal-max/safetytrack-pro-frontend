import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Alert } from 'antd';
import { SafetyCertificateOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

function AIAnalysis() {
  const [analysisResults, setAnalysisResults] = useState({
    riskLevel: 'Medium',
    confidence: 87,
    issuesFound: 3,
    recommendations: [
      'Update emergency evacuation routes',
      'Schedule safety training for new staff',
      'Replace expired fire extinguishers'
    ]
  });

  return (
    <Card title="AI Safety Analysis" style={{ marginBottom: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Risk Level"
              value={analysisResults.riskLevel}
              prefix={<WarningOutlined />}
              valueStyle={{ 
                color: analysisResults.riskLevel === 'High' ? '#ff4d4f' : 
                       analysisResults.riskLevel === 'Medium' ? '#faad14' : '#52c41a' 
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Analysis Confidence"
              value={analysisResults.confidence}
              suffix="%"
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Issues Identified"
              value={analysisResults.issuesFound}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Alert
        message="AI Analysis Complete"
        description="The AI has analyzed your safety documents and identified potential areas for improvement."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <h4>Recommendations:</h4>
        <ul>
          {analysisResults.recommendations.map((rec, index) => (
            <li key={index} style={{ marginBottom: 8 }}>{rec}</li>
          ))}
        </ul>
      </div>

      <Progress 
        percent={analysisResults.confidence} 
        status="active" 
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
      />
    </Card>
  );
}

export default AIAnalysis;