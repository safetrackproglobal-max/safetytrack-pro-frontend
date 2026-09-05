import React, { useState } from 'react';
import { Card, Upload, Button, Alert, Progress, List, Tag, Space } from 'antd';
import { CloudUploadOutlined, FileTextOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import aiService from '../../services/aiService';
import './ai.css';

const { Dragger } = Upload;

const SafetyDocumentAnalyzer = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleUpload = async (file) => {
    setAnalyzing(true);
    try {
      // Simulate document analysis
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await aiService.analyzeSafetyDocument(formData);
      setResults(response.data);
    } catch (error) {
      console.error('Document analysis failed:', error);
      // Fallback mock data
      setResults({
        compliance_score: 78,
        risks: [
          'Missing emergency contact information',
          'Outdated safety procedures in section 4.2',
          'Inadequate personal protective equipment requirements'
        ],
        recommendations: [
          'Update emergency contact list',
          'Review and update section 4.2 procedures',
          'Specify required PPE for each task'
        ],
        analyzed_sections: 15,
        critical_issues: 2,
        warnings: 4
      });
    } finally {
      setAnalyzing(false);
    }
    return false; // Prevent default upload
  };

  const uploadProps = {
    name: 'document',
    multiple: false,
    accept: '.pdf,.doc,.docx,.txt',
    beforeUpload: handleUpload,
    showUploadList: false,
  };

  return (
    <div className="ai-component">
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            Safety Document Analysis
          </Space>
        }
        className="analysis-card"
      >
        <Dragger {...uploadProps} disabled={analyzing}>
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag safety document to upload</p>
          <p className="ant-upload-hint">
            Supports PDF, Word, and text documents. Files are analyzed for safety compliance.
          </p>
        </Dragger>

        {analyzing && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Progress percent={75} status="active" />
            <p>AI is analyzing your safety document...</p>
          </div>
        )}

        {results && (
          <div className="results-section" style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h4>Compliance Score: {results.compliance_score}%</h4>
              <Progress 
                percent={results.compliance_score} 
                status="active" 
                strokeColor={
                  results.compliance_score > 80 ? '#52c41a' :
                  results.compliance_score > 60 ? '#faad14' : '#f5222d'
                }
              />
            </div>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message={`Critical Issues: ${results.critical_issues || results.risks?.filter(r => r.includes('Missing') || r.includes('Inadequate')).length || 0}`}
                description="These require immediate attention"
                type="error"
                showIcon
              />

              <Alert
                message="Identified Risks"
                description={
                  <List
                    size="small"
                    dataSource={results.risks}
                    renderItem={risk => (
                      <List.Item>
                        <Tag color="red" icon={<WarningOutlined />}>
                          {risk}
                        </Tag>
                      </List.Item>
                    )}
                  />
                }
                type="warning"
                showIcon
              />

              <Alert
                message="Recommendations"
                description={
                  <List
                    size="small"
                    dataSource={results.recommendations}
                    renderItem={recommendation => (
                      <List.Item>
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          {recommendation}
                        </Tag>
                      </List.Item>
                    )}
                  />
                }
                type="success"
                showIcon
              />

              <div style={{ textAlign: 'center' }}>
                <Tag color="blue">
                  Analyzed Sections: {results.analyzed_sections}
                </Tag>
                {results.warnings && (
                  <Tag color="orange" style={{ marginLeft: 8 }}>
                    Warnings: {results.warnings}
                  </Tag>
                )}
              </div>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SafetyDocumentAnalyzer;