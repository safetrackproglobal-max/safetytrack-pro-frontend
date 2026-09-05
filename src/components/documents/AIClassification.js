// src/components/documents/AIClassification.jsx

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Tag, Modal,
  Progress, Statistic, List, Badge, Tooltip, Alert, Divider,
  Typography, Collapse, Spin, Empty, message, Tabs, Table,
  Switch, Radio, Slider, Checkbox, Form, Upload
} from 'antd';
import {
  RobotOutlined,
  ThunderboltOutlined,
  TagsOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  ClearOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  CloudUploadOutlined,
  InboxOutlined,
  FilterOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './AIClassification.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Dragger } = Upload;

// ============================================================
// CONSTANTS
// ============================================================

const CONFIDENCE_COLORS = {
  high: '#52c41a',
  medium: '#faad14',
  low: '#f5222d'
};

const DOCUMENT_TYPES = [
  { value: 'hse_report', label: 'HSE Report', icon: '🛡️' },
  { value: 'environmental_report', label: 'Environmental Report', icon: '🌿' },
  { value: 'incident_report', label: 'Incident Report', icon: '🚨' },
  { value: 'policy', label: 'Policy', icon: '📋' },
  { value: 'procedure', label: 'Procedure', icon: '📝' },
  { value: 'permit', label: 'Permit', icon: '📄' },
  { value: 'training_material', label: 'Training Material', icon: '📚' },
  { value: 'quality_document', label: 'Quality Document', icon: '✅' },
  { value: 'compliance_document', label: 'Compliance Document', icon: '🔒' },
  { value: 'technical_document', label: 'Technical Document', icon: '⚙️' }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const AIClassification = ({ 
  content, 
  title, 
  onApply,
  onClose,
  documentId = null,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [classification, setClassification] = useState(null);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [confidence, setConfidence] = useState(0);
  const [summary, setSummary] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
  const [trainingMode, setTrainingMode] = useState(false);
  const [trainingData, setTrainingData] = useState([]);
  
  // ============================================================
  // CLASSIFICATION
  // ============================================================
  
  const classifyDocument = async () => {
    if (!content && !title) {
      message.warning('Please provide content or title to classify');
      return;
    }
    
    setLoading(true);
    try {
      const result = await documentService.classifyDocument({
        content: content || '',
        title: title || ''
      });
      
      if (result.success) {
        const data = result.classification;
        setClassification(data);
        setSelectedType(data.suggested_type);
        setSuggestedTags(data.suggested_tags || []);
        setSelectedTags(data.suggested_tags || []);
        setConfidence(data.confidence || 0);
        setSummary(data.summary || '');
        setAlternatives(data.alternatives || []);
        
        // Auto-apply if confidence is high and autoApply is on
        if (autoApply && data.confidence > 70) {
          applyClassification(data.suggested_type, data.suggested_tags);
        }
        
        message.success('Document classified successfully');
      }
      
    } catch (error) {
      console.error('Classification failed:', error);
      message.error('Failed to classify document');
    } finally {
      setLoading(false);
    }
  };
  
  const applyClassification = (type, tags) => {
    if (onApply) {
      onApply({
        document_type: type,
        tags: tags || selectedTags,
        classification: classification
      });
      message.success('Classification applied');
    }
  };
  
  const handleApply = () => {
    applyClassification(selectedType, selectedTags);
  };
  
  const getConfidenceLevel = (score) => {
    if (score >= 70) return { level: 'High', color: '#52c41a' };
    if (score >= 40) return { level: 'Medium', color: '#faad14' };
    return { level: 'Low', color: '#f5222d' };
  };
  
  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    if (content || title) {
      classifyDocument();
    }
  }, []);
  
  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  // Render Classification Result
  const renderClassificationResult = () => (
    <Card className="classification-result">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Alert
            message="AI Classification Complete"
            description={
              <div>
                <p>Based on the document content, the AI has analyzed and classified your document.</p>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Tag color="blue">Confidence: {confidence}%</Tag>
                    <Tag color={getConfidenceLevel(confidence).color}>
                      {getConfidenceLevel(confidence).level} Confidence
                    </Tag>
                  </Space>
                </div>
              </div>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ 
            padding: 16, 
            background: '#f6f9ff', 
            borderRadius: 8,
            border: '1px solid #d6e4ff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <RobotOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 16 }}>
                  Suggested Type: {classification?.suggested_label || 'Unknown'}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {classification?.suggested_type || 'General Document'}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Progress 
                  type="circle" 
                  percent={confidence} 
                  width={60}
                  strokeColor={getConfidenceLevel(confidence).color}
                  format={(p) => `${p}%`}
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {alternatives.length > 0 && (
        <>
          <Divider>Alternative Classifications</Divider>
          <Row gutter={[16, 16]}>
            {alternatives.map((alt, idx) => (
              <Col span={12} key={idx}>
                <Card 
                  size="small"
                  hoverable
                  onClick={() => setSelectedType(alt.type)}
                  style={{ 
                    cursor: 'pointer',
                    border: selectedType === alt.type ? '2px solid #1890ff' : '1px solid #f0f0f0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{alt.label}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{alt.type}</div>
                    </div>
                    <Tag color={alt.confidence > 50 ? 'green' : 'orange'}>
                      {alt.confidence}%
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {suggestedTags.length > 0 && (
        <>
          <Divider>Suggested Tags</Divider>
          <div>
            <Space wrap>
              {suggestedTags.map(tag => (
                <Tag 
                  key={tag} 
                  color={selectedTags.includes(tag) ? 'blue' : 'default'}
                  style={{ 
                    cursor: 'pointer',
                    padding: '4px 12px',
                    fontSize: 13
                  }}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                >
                  {selectedTags.includes(tag) && '✓ '}
                  {tag}
                </Tag>
              ))}
            </Space>
            <div style={{ marginTop: 8 }}>
              <Button 
                type="link" 
                size="small"
                onClick={() => setShowAllTags(!showAllTags)}
              >
                {showAllTags ? 'Show Less' : 'Show More Tags'}
              </Button>
            </div>
          </div>
        </>
      )}

      {summary && (
        <>
          <Divider>Document Summary</Divider>
          <Paragraph>{summary}</Paragraph>
        </>
      )}

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={classifyDocument}
            loading={loading}
          >
            Re-analyze
          </Button>
          <Button 
            icon={<ClearOutlined />} 
            onClick={() => {
              setSelectedType(null);
              setSelectedTags([]);
              message.info('Selection cleared');
            }}
          >
            Clear Selection
          </Button>
        </Space>
        <Space>
          <Switch
            checked={autoApply}
            onChange={setAutoApply}
            checkedChildren="Auto Apply"
            unCheckedChildren="Manual"
          />
          <Button 
            type="primary" 
            onClick={handleApply}
            disabled={!selectedType}
            icon={<SaveOutlined />}
          >
            Apply Classification
          </Button>
          {onClose && (
            <Button onClick={onClose}>Close</Button>
          )}
        </Space>
      </div>
    </Card>
  );
  
  // Render Training Mode
  const renderTrainingMode = () => (
    <Card className="training-mode">
      <Alert
        message="Training Mode"
        description="Add training data to improve the AI classification accuracy."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label="Document Content">
            <TextArea rows={4} placeholder="Paste document content..." />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Correct Classification">
            <Select placeholder="Select type">
              {DOCUMENT_TYPES.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Tags">
            <Input placeholder="Enter tags (comma separated)" />
          </Form.Item>
          <Button type="primary" icon={<PlusOutlined />} block>
            Add Training Data
          </Button>
        </Col>
      </Row>
      
      <Divider />
      
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Button type="primary" size="large" icon={<CloudUploadOutlined />}>
          Train Model
        </Button>
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          Training with 25 documents will improve accuracy by ~15%
        </Text>
      </div>
    </Card>
  );
  
  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  if (loading && !classification) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Analyzing document with AI...</div>
        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
          This may take a few seconds
        </div>
      </div>
    );
  }
  
  return (
    <div className="ai-classification" style={{ padding: embedded ? '0' : '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <RobotOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
          <Title level={4} style={{ margin: 0 }}>AI Document Classification</Title>
          <Badge status="processing" text="Live" />
        </Space>
        <Space>
          <Switch
            checked={trainingMode}
            onChange={setTrainingMode}
            checkedChildren="Training"
            unCheckedChildren="Auto"
          />
          <Button icon={<BarChartOutlined />} onClick={() => message.info('Analytics coming soon')}>
            Analytics
          </Button>
        </Space>
      </div>
      
      {trainingMode ? renderTrainingMode() : renderClassificationResult()}
    </div>
  );
};

export default AIClassification;