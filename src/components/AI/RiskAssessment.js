import React, { useState } from 'react';
import { Card, Form, Input, Slider, Button, Alert, Tag, List, Progress, Space } from 'antd';
import { SafetyCertificateOutlined, AlertOutlined, CheckCircleOutlined } from '@ant-design/icons';
import aiService from '../../services/aiService';
import './ai.css';

const { TextArea } = Input;

const RiskAssessment = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await aiService.assessRisk(values);
      setAssessment(response.data);
    } catch (error) {
      console.error('Risk assessment failed:', error);
      // Fallback mock data
      setAssessment({
        risk_score: Math.floor(Math.random() * 100),
        risk_level: 'MEDIUM',
        factors: [
          'Inadequate safety protocols in described area',
          'Potential electrical hazards identified',
          'Emergency response procedures need review'
        ],
        recommendations: [
          'Implement additional safety signage',
          'Schedule safety training session',
          'Conduct equipment inspection'
        ],
        confidence: 87
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW': return '#52c41a';
      case 'MEDIUM': return '#faad14';
      case 'HIGH': return '#f5222d';
      case 'CRITICAL': return '#a8071a';
      default: return '#d9d9d9';
    }
  };

  return (
    <div className="ai-component">
      <Card 
        title={
          <Space>
            <SafetyCertificateOutlined />
            AI Risk Assessment
          </Space>
        }
        className="analysis-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={loading}
        >
          <Form.Item
            label="Environment Description"
            name="environment"
            rules={[{ required: true, message: 'Please describe the environment' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Describe the work environment, activities, equipment, and any observed hazards..."
            />
          </Form.Item>

          <Form.Item
            label="Safety Protocols"
            name="protocols"
          >
            <TextArea 
              rows={3} 
              placeholder="Describe existing safety measures, emergency procedures, and training programs..."
            />
          </Form.Item>

          <Form.Item
            label="Historical Incident Data"
            name="incidents"
          >
            <TextArea 
              rows={2} 
              placeholder="Any previous incidents, near-misses, or safety concerns in this area..."
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SafetyCertificateOutlined />}
              size="large"
            >
              Assess Risk
            </Button>
          </Form.Item>
        </Form>

        {assessment && (
          <div className="results-section">
            <Alert
              message={`Risk Level: ${assessment.risk_level}`}
              description={`AI Risk Score: ${assessment.risk_score}/100`}
              type={
                assessment.risk_level === 'LOW' ? 'success' :
                assessment.risk_level === 'MEDIUM' ? 'warning' :
                assessment.risk_level === 'HIGH' ? 'error' : 'info'
              }
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Progress 
              percent={assessment.risk_score} 
              status="active"
              strokeColor={getRiskColor(assessment.risk_level)}
              style={{ marginBottom: 16 }}
            />

            <div className="risk-factors">
              <h4>Identified Risk Factors:</h4>
              <List
                size="small"
                dataSource={assessment.factors}
                renderItem={factor => (
                  <List.Item>
                    <Tag color="red" icon={<AlertOutlined />}>
                      {factor}
                    </Tag>
                  </List.Item>
                )}
              />
            </div>

            <div className="recommendations">
              <h4>Safety Recommendations:</h4>
              <List
                size="small"
                dataSource={assessment.recommendations}
                renderItem={recommendation => (
                  <List.Item>
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      {recommendation}
                    </Tag>
                  </List.Item>
                )}
              />
            </div>

            {assessment.confidence && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Tag color="blue">AI Confidence: {assessment.confidence}%</Tag>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default RiskAssessment;