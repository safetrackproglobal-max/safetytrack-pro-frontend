// components/Video/VideoAnalysisPanel.js
import React, { useState, useEffect } from 'react';
import { 
  Tabs, Card, Button, Upload, Form, Input, Select, Row, Col, 
  Alert, Tag, List, message, Divider, Progress, Space, Modal,
  Collapse, Switch, InputNumber
} from 'antd';
import { 
  VideoCameraOutlined, UploadOutlined, FileTextOutlined, 
  PlayCircleOutlined, DownloadOutlined, FilePdfOutlined,
  SafetyCertificateOutlined, BarChartOutlined, BulbOutlined,
  SettingOutlined, EyeOutlined, WarningOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { 
  aiService, 
  validateVideoFile, 
  withProgressTracking,
  aiMockService 
} from '../../services/aiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;
const { TextArea } = Input;
const { Panel } = Collapse;

// Error Boundary Component
class VideoAnalysisErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Video Analysis Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Alert
          message="Video Analysis Error"
          description={
            <div>
              <p>Something went wrong with the video analysis component.</p>
              <Button 
                type="primary" 
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </Button>
            </div>
          }
          type="error"
          showIcon
        />
      );
    }
    return this.props.children;
  }
}

export default function VideoAnalysisPanel() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [analysisType, setAnalysisType] = useState('custom');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const [useMockData, setUseMockData] = useState(process.env.NODE_ENV === 'development');
  const [form] = Form.useForm();

  // Load analysis history from localStorage and API
  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      // Try to load from API first
      if (!useMockData) {
        try {
          const response = await aiService.getVideoAnalysisHistory(10);
          if (response.success && response.history) {
            setAnalysisHistory(response.history);
            if (response.history.length > 0) {
              setAnalysisResult(response.history[0]);
            }
            return;
          }
        } catch (apiError) {
          console.warn('API history load failed, using localStorage:', apiError);
        }
      }

      // Fallback to localStorage
      const savedHistory = JSON.parse(localStorage.getItem('videoAnalysisHistory') || '[]');
      setAnalysisHistory(savedHistory);
      
      if (savedHistory.length > 0) {
        setAnalysisResult(savedHistory[0]);
      }
    } catch (error) {
      console.error('Error loading analysis history:', error);
      message.error('Failed to load analysis history');
    }
  };

  const analysisOptions = [
    { value: 'custom', label: 'Custom Analysis', icon: '💬', color: 'purple', description: 'Write your own instructions' },
    { value: 'risk_assessment', label: 'Risk Assessment', icon: '⚠️', color: 'red', description: 'Automatic hazard identification' },
    { value: 'safety_audit', label: 'Safety Audit', icon: '🔍', color: 'orange', description: 'Compliance checking' },
    { value: 'incident_analysis', label: 'Incident Analysis', icon: '🚨', color: 'volcano', description: 'Post-incident review' },
    { value: 'ppe_compliance', label: 'PPE Compliance', icon: '👷', color: 'blue', description: 'Safety gear detection' },
    { value: 'object_detection', label: 'Object Detection', icon: '📹', color: 'green', description: 'Basic object recognition' },
    { value: 'behavior_analysis', label: 'Behavior Analysis', icon: '🚶', color: 'cyan', description: 'Worker behavior patterns' },
    { value: 'environmental_safety', label: 'Environmental Safety', icon: '🌿', color: 'green', description: 'Environmental hazards' }
  ];

  // Pre-defined prompts for quick selection
  const quickPrompts = [
    {
      label: "Identify all safety hazards",
      prompt: "Analyze this video and identify all potential safety hazards. Focus on: fall risks, electrical hazards, machinery safety, fire risks, and any unsafe behaviors. Provide specific timestamps and recommendations."
    },
    {
      label: "PPE compliance check", 
      prompt: "Check if all personnel are wearing appropriate PPE. Look for: hard hats, safety vests, gloves, safety glasses, and proper footwear. Identify any violations and suggest corrective actions."
    },
    {
      label: "Emergency preparedness",
      prompt: "Assess emergency preparedness in this area. Check: clear emergency exits, accessible fire extinguishers, proper signage, evacuation routes, and emergency equipment availability."
    },
    {
      label: "Machinery safety audit",
      prompt: "Conduct a machinery safety audit. Look for: proper guarding, lockout/tagout compliance, operator training, maintenance issues, and any unsafe machinery operation."
    }
  ];

  const uploadProps = {
    name: 'video',
    multiple: false,
    accept: 'video/*,.mp4,.avi,.mov,.mkv,.webm,.mpeg,.mpg',
    beforeUpload: (file) => {
      try {
        validateVideoFile(file);
        return false; // Prevent auto-upload
      } catch (error) {
        message.error(error.message);
        return Upload.LIST_IGNORE;
      }
    },
    onChange: (info) => {
      if (info.file.status === 'removed') {
        form.setFieldValue('videoFile', null);
      }
    }
  };

  const applyQuickPrompt = (prompt) => {
    form.setFieldValue('customPrompt', prompt);
    setAnalysisType('custom');
    message.info('Prompt applied! You can modify it further.');
  };

  const handleAnalysis = async (values) => {
    if (!values.videoFile) {
      message.error('Please select a video file');
      return;
    }

    const analysisId = `analysis-${Date.now()}`;
    setCurrentAnalysisId(analysisId);
    setUploading(true);
    setAnalysisProgress(0);

    try {
      // Prepare analysis configuration
      const analysisConfig = {
        analysisType,
        customPrompt: values.customPrompt || '',
        description: values.description || '',
        confidenceThreshold: values.confidenceThreshold || 0.6,
        includeTimestamps: values.includeTimestamps || false,
        generateReport: values.generateReport || false
      };

      let result;
      
      if (useMockData) {
        // Use mock service for development
        result = await withProgressTracking(
          aiMockService.analyzeSafetyVideo(values.videoFile.file, analysisConfig),
          setAnalysisProgress
        );
      } else {
        // Use real API service
        result = await withProgressTracking(
          aiService.analyzeSafetyVideo(values.videoFile.file, analysisConfig),
          setAnalysisProgress
        );
      }

      if (result.success) {
        const newAnalysis = {
          id: result.analysis?.id || analysisId,
          timestamp: result.analysis?.timestamp || new Date().toISOString(),
          analysisType,
          fileName: values.videoFile.file.name,
          customPrompt: values.customPrompt,
          result: result.analysis?.result || result.analysis,
          detections: result.analysis?.detections || [],
          insights: result.analysis?.insights || [],
          compliance: result.analysis?.compliance
        };

        setAnalysisResult(newAnalysis);
        
        // Update history
        const updatedHistory = [newAnalysis, ...analysisHistory.slice(0, 9)];
        setAnalysisHistory(updatedHistory);
        
        try {
          localStorage.setItem('videoAnalysisHistory', JSON.stringify(updatedHistory));
        } catch (storageError) {
          console.warn('Could not save to localStorage:', storageError);
        }

        message.success('Video analysis completed!');
        setActiveTab('results');

        // Auto-generate report if enabled
        if (values.generateReport && !useMockData) {
          setTimeout(() => {
            generateReport('pdf');
          }, 1000);
        }

      } else {
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Analysis error:', error);
      message.error(`Analysis failed: ${error.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setAnalysisProgress(0), 2000);
    }
  };

  const generateReport = async (format, customType = null) => {
    if (!analysisResult) {
      message.error('No analysis results available');
      return;
    }

    setGeneratingReport(true);
    try {
      let blob;
      
      if (useMockData) {
        // Mock report generation
        const mockResponse = await aiMockService.generateVideoAnalysisReport();
        blob = new Blob(['Mock report content'], { type: 'application/pdf' });
      } else {
        // Real API call
        const response = await aiService.generateVideoAnalysisReport(
          analysisResult.id, 
          format, 
          customType || analysisResult.analysisType
        );
        
        if (response instanceof Blob) {
          blob = response;
        } else {
          throw new Error('Invalid response format');
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safety-analysis-${analysisResult.id}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success(`Report downloaded successfully!`);

    } catch (error) {
      console.error('Report generation error:', error);
      message.error(`Report generation failed: ${error.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  const clearHistory = () => {
    Modal.confirm({
      title: 'Clear Analysis History',
      content: 'Are you sure you want to clear all video analysis history? This action cannot be undone.',
      okText: 'Yes, Clear All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setAnalysisHistory([]);
        setAnalysisResult(null);
        try {
          localStorage.removeItem('videoAnalysisHistory');
          message.success('Analysis history cleared');
        } catch (error) {
          message.error('Failed to clear history from storage');
        }
      }
    });
  };

  const cancelAnalysis = () => {
    Modal.confirm({
      title: 'Cancel Analysis',
      content: 'Are you sure you want to cancel the current analysis?',
      onOk: () => {
        setUploading(false);
        setAnalysisProgress(0);
        setCurrentAnalysisId(null);
        message.info('Analysis cancelled');
      }
    });
  };

  const quickAnalysis = async (analysisFunction, promptName) => {
    const videoFile = form.getFieldValue('videoFile');
    if (!videoFile) {
      message.error('Please select a video file first');
      return;
    }

    setUploading(true);
    setAnalysisProgress(0);

    try {
      let result;
      
      if (useMockData) {
        result = await withProgressTracking(
          aiMockService.analyzeSafetyVideo(videoFile.file, { analysisType: 'custom', customPrompt: promptName }),
          setAnalysisProgress
        );
      } else {
        result = await withProgressTracking(
          analysisFunction(videoFile.file),
          setAnalysisProgress
        );
      }

      if (result.success) {
        const newAnalysis = {
          id: result.analysis?.id || `analysis-${Date.now()}`,
          timestamp: result.analysis?.timestamp || new Date().toISOString(),
          analysisType: 'custom',
          fileName: videoFile.file.name,
          customPrompt: promptName,
          result: result.analysis?.result || result.analysis,
          detections: result.analysis?.detections || [],
          insights: result.analysis?.insights || [],
          compliance: result.analysis?.compliance
        };

        setAnalysisResult(newAnalysis);
        setAnalysisHistory(prev => [newAnalysis, ...prev.slice(0, 9)]);
        setActiveTab('results');
        message.success(`${promptName} analysis completed!`);
      }

    } catch (error) {
      message.error(`Quick analysis failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <VideoAnalysisErrorBoundary>
      <div style={{ padding: '24px' }}>
        {/* Development Mode Indicator */}
        {useMockData && (
          <Alert
            message="Development Mode"
            description="Using mock data for demonstration. Switch to production mode in settings to use real AI services."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={() => setUseMockData(false)}>
                Switch to Live API
              </Button>
            }
          />
        )}

        <Card>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
          >
            {/* UPLOAD & ANALYZE TAB */}
            <TabPane 
              tab={
                <span>
                  <UploadOutlined />
                  Video Analysis
                </span>
              } 
              key="upload"
            >
              <Alert
                message="AI Video Analysis with Custom Prompts"
                description="Upload safety videos and tell our AI exactly what to analyze. Use pre-built templates or write your own instructions."
                type="info"
                style={{ marginBottom: 24 }}
              />

              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card title="📹 Upload & Analyze" bordered={false}>
                    <Form form={form} onFinish={handleAnalysis} layout="vertical">
                      {/* Video Upload */}
                      <Form.Item
                        name="videoFile"
                        label="Select Video File"
                        rules={[{ required: true, message: 'Please upload a video file' }]}
                      >
                        <Dragger {...uploadProps}>
                          <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                          </p>
                          <p className="ant-upload-text">Click or drag video to upload</p>
                          <p className="ant-upload-hint">
                            Supports MP4, AVI, MOV, MKV, WebM (max 100MB)
                          </p>
                        </Dragger>
                      </Form.Item>

                      {/* Progress Bar */}
                      {uploading && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>Analyzing video...</span>
                            <span>{Math.round(analysisProgress)}%</span>
                          </div>
                          <Progress 
                            percent={analysisProgress} 
                            status={analysisProgress >= 100 ? 'success' : 'active'}
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': '#87d068',
                            }}
                          />
                          {analysisProgress < 100 && (
                            <div style={{ textAlign: 'center', marginTop: 8 }}>
                              <Button 
                                size="small" 
                                danger 
                                icon={<CloseOutlined />}
                                onClick={cancelAnalysis}
                              >
                                Cancel Analysis
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Analysis Buttons */}
                      {form.getFieldValue('videoFile') && !uploading && (
                        <Form.Item label="Quick Analysis">
                          <Space wrap>
                            <Button 
                              type="primary" 
                              onClick={() => quickAnalysis(aiService.analyzeVideoForRisks, 'Risk Assessment')}
                            >
                              🚨 Risk Assessment
                            </Button>
                            <Button 
                              type="primary" 
                              onClick={() => quickAnalysis(aiService.analyzeVideoForPPE, 'PPE Compliance')}
                            >
                              👷 PPE Check
                            </Button>
                            <Button 
                              type="primary" 
                              onClick={() => quickAnalysis(aiService.analyzeVideoForEmergencyPreparedness, 'Emergency Audit')}
                            >
                              🚒 Emergency Audit
                            </Button>
                          </Space>
                        </Form.Item>
                      )}

                      {/* Analysis Type */}
                      <Form.Item
                        name="analysisType"
                        label="Analysis Type"
                        initialValue="custom"
                      >
                        <Select onChange={setAnalysisType} disabled={uploading}>
                          {analysisOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                              <Tag color={option.color}>{option.icon}</Tag> 
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Custom Prompt */}
                      {(analysisType === 'custom' || analysisType === 'behavior_analysis') && (
                        <Form.Item
                          name="customPrompt"
                          label={
                            <span>
                              <BulbOutlined /> AI Instructions
                              <Tag color="purple" style={{ marginLeft: 8 }}>Custom</Tag>
                            </span>
                          }
                          rules={[{ required: analysisType === 'custom', message: 'Please provide analysis instructions' }]}
                          extra="Tell the AI exactly what to look for in the video"
                        >
                          <TextArea 
                            rows={4}
                            placeholder="Example: 'Focus on identifying fall hazards near the scaffolding area. Look for workers not using harnesses, unstable platforms, and any objects that could fall. Provide specific timestamps for each finding.'"
                            showCount
                            maxLength={1000}
                            disabled={uploading}
                          />
                        </Form.Item>
                      )}

                      {/* Quick Prompts */}
                      {analysisType === 'custom' && !uploading && (
                        <Form.Item label="Quick Prompts" extra="Select a pre-defined analysis template">
                          <Space direction="vertical" style={{ width: '100%' }}>
                            {quickPrompts.map((quickPrompt, index) => (
                              <Button 
                                key={index}
                                type="dashed" 
                                block
                                onClick={() => applyQuickPrompt(quickPrompt.prompt)}
                                style={{ textAlign: 'left', height: 'auto', whiteSpace: 'normal' }}
                                disabled={uploading}
                              >
                                <div>
                                  <strong>{quickPrompt.label}</strong>
                                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    {quickPrompt.prompt.substring(0, 80)}...
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </Space>
                        </Form.Item>
                      )}

                      {/* Context Description */}
                      <Form.Item
                        name="description"
                        label="Additional Context (Optional)"
                        extra="Provide background information about the video context"
                      >
                        <TextArea 
                          rows={2}
                          placeholder="Example: 'This is construction site footage from the 3rd floor. Focus on the workers near the edge and the material storage area.'"
                          disabled={uploading}
                        />
                      </Form.Item>

                      {/* Advanced Settings */}
                      <Collapse 
                        ghost
                        style={{ marginBottom: 16 }}
                        onChange={(keys) => setAdvancedSettings(keys.length > 0)}
                      >
                        <Panel 
                          header={
                            <span>
                              <SettingOutlined /> 
                              Advanced Settings
                              {advancedSettings && <Tag color="blue" style={{ marginLeft: 8 }}>Active</Tag>}
                            </span>
                          } 
                          key="1"
                        >
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name="confidenceThreshold"
                                label="Confidence Threshold"
                                initialValue={0.6}
                                extra="Higher = more accurate but fewer detections"
                              >
                                <InputNumber 
                                  min={0.1} 
                                  max={0.9} 
                                  step={0.1}
                                  style={{ width: '100%' }}
                                  disabled={uploading}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="includeTimestamps"
                                label="Include Timestamps"
                                valuePropName="checked"
                                initialValue={true}
                              >
                                <Switch disabled={uploading} />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Form.Item
                            name="generateReport"
                            label="Auto-generate Report"
                            valuePropName="checked"
                            initialValue={true}
                            extra="Automatically create a PDF report after analysis"
                          >
                            <Switch disabled={uploading} />
                          </Form.Item>
                        </Panel>
                      </Collapse>

                      {/* Submit Button */}
                      <Form.Item>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={uploading}
                          icon={<PlayCircleOutlined />}
                          size="large"
                          block
                          disabled={uploading}
                        >
                          {uploading ? 'Analyzing Video...' : 'Start AI Analysis'}
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="🎯 Analysis Capabilities" bordered={false}>
                    <div style={{ lineHeight: '2' }}>
                      {analysisOptions.map(option => (
                        <p key={option.value}>
                          <Tag color={option.color}>{option.icon}</Tag> 
                          <strong>{option.label}:</strong> {option.description}
                        </p>
                      ))}
                    </div>

                    <Divider />

                    {/* Quick Actions */}
                    <Card title="⚡ Quick Actions" size="small" style={{ marginBottom: 16 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button 
                          block 
                          onClick={() => quickAnalysis(aiService.analyzeVideoForRisks, 'Risk Assessment')}
                          disabled={!form.getFieldValue('videoFile') || uploading}
                        >
                          🚨 Run Risk Assessment
                        </Button>
                        <Button 
                          block 
                          onClick={() => quickAnalysis(aiService.analyzeVideoForPPE, 'PPE Compliance')}
                          disabled={!form.getFieldValue('videoFile') || uploading}
                        >
                          👷 Check PPE Compliance
                        </Button>
                      </Space>
                    </Card>

                    <Card title="🛡️ Detection Capabilities" size="small">
                      <Row gutter={[8, 8]}>
                        <Col xs={12} sm={8}>
                          <div>• 👷 Persons</div>
                          <div>• ⛑️ Hard Hats</div>
                          <div>• 🦺 Safety Vests</div>
                          <div>• 🚗 Vehicles</div>
                        </Col>
                        <Col xs={12} sm={8}>
                          <div>• 🏗️ Machinery</div>
                          <div>• 🔥 Fire Equipment</div>
                          <div>• 🚧 Safety Cones</div>
                          <div>• ⚠️ Warning Signs</div>
                        </Col>
                        <Col xs={24} sm={8}>
                          <div>• 💧 Spill Hazards</div>
                          <div>• 🔌 Electrical</div>
                          <div>• 📏 Height Risks</div>
                          <div>• 🚶‍♂️ Pedestrian Flow</div>
                        </Col>
                      </Row>
                    </Card>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* RESULTS TAB */}
            <TabPane 
              tab={
                <span>
                  <BarChartOutlined />
                  Analysis Results
                  {analysisResult && <Tag color="green" style={{ marginLeft: 8 }}>New</Tag>}
                </span>
              } 
              key="results"
              disabled={!analysisResult}
            >
              {analysisResult ? (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={16}>
                    <Card 
                      title={`Analysis Results - ${analysisResult.fileName}`}
                      extra={
                        <Space>
                          <small style={{ color: '#666' }}>
                            {new Date(analysisResult.timestamp).toLocaleString()}
                          </small>
                          <Tag color={analysisOptions.find(o => o.value === analysisResult.analysisType)?.color}>
                            {analysisResult.analysisType.replace('_', ' ').toUpperCase()}
                          </Tag>
                        </Space>
                      }
                    >
                      {/* Custom Prompt Used */}
                      {analysisResult.customPrompt && (
                        <Alert
                          message="AI Instructions Used"
                          description={analysisResult.customPrompt}
                          type="info"
                          style={{ marginBottom: 16 }}
                          icon={<BulbOutlined />}
                        />
                      )}

                      {/* AI Insights */}
                      {analysisResult.insights && analysisResult.insights.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <h4><EyeOutlined /> AI Insights</h4>
                          <Card size="small">
                            {analysisResult.insights.map((insight, index) => (
                              <div key={index} style={{ marginBottom: 8 }}>
                                <strong>{insight.title}:</strong> {insight.description}
                                {insight.recommendation && (
                                  <div style={{ color: '#1890ff', marginTop: 4 }}>
                                    💡 {insight.recommendation}
                                  </div>
                                )}
                              </div>
                            ))}
                          </Card>
                        </div>
                      )}

                      {/* Detection Results */}
                      {analysisResult.detections && analysisResult.detections.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <h4>🕵️ Detected Objects</h4>
                          <div style={{ marginTop: 8 }}>
                            {analysisResult.detections.map((det, index) => (
                              <Tag key={index} color="blue" style={{ margin: '4px' }}>
                                {det.class} ({Math.round(det.confidence * 100)}%)
                                {det.timestamp && <small> @ {det.timestamp}</small>}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Risk Assessment */}
                      {analysisResult.result?.risks && analysisResult.result.risks.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <h4><WarningOutlined /> Identified Risks</h4>
                          <List
                            dataSource={analysisResult.result.risks}
                            renderItem={risk => (
                              <List.Item
                                extra={
                                  risk.timestamp && (
                                    <Tag color="default">@{risk.timestamp}</Tag>
                                  )
                                }
                              >
                                <List.Item.Meta
                                  avatar={<Tag color={getRiskColor(risk.severity)}>{risk.severity}</Tag>}
                                  title={risk.type}
                                  description={risk.description}
                                />
                                <div>Confidence: {Math.round(risk.confidence * 100)}%</div>
                              </List.Item>
                            )}
                          />
                        </div>
                      )}

                      {/* Compliance Check */}
                      {analysisResult.compliance && (
                        <div>
                          <h4>✅ Compliance Status</h4>
                          <Progress 
                            percent={Math.round(analysisResult.compliance.score * 100)} 
                            status={
                              analysisResult.compliance.score > 0.8 ? 'success' : 
                              analysisResult.compliance.score > 0.6 ? 'normal' : 'exception'
                            }
                          />
                          {analysisResult.compliance.issues && analysisResult.compliance.issues.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <strong>Issues:</strong>
                              {analysisResult.compliance.issues.map((issue, idx) => (
                                <div key={idx}>• {issue}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={8}>
                    <Card title="📄 Generate Reports" style={{ marginBottom: 16 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button 
                          block 
                          icon={<FilePdfOutlined />}
                          onClick={() => generateReport('pdf')}
                          size="large"
                          loading={generatingReport}
                        >
                          {generatingReport ? 'Generating...' : 'Download PDF Report'}
                        </Button>
                        <Button 
                          block 
                          onClick={() => generateReport('docx')}
                          size="large"
                          loading={generatingReport}
                        >
                          Word Document
                        </Button>
                        <Button 
                          block 
                          onClick={() => generateReport('xlsx')}
                          size="large"
                          loading={generatingReport}
                        >
                          Excel Data Export
                        </Button>
                      </Space>
                    </Card>

                    <Card title="📊 Quick Stats" size="small">
                      <div style={{ lineHeight: '2' }}>
                        <div>• Total Detections: {analysisResult.detections?.length || 0}</div>
                        <div>• Risks Identified: {analysisResult.result?.risks?.length || 0}</div>
                        <div>• Analysis Type: {analysisResult.analysisType}</div>
                        <div>• File: {analysisResult.fileName}</div>
                        <div>• Date: {new Date(analysisResult.timestamp).toLocaleDateString()}</div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <FileTextOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                  <p>No analysis results available.</p>
                  <p>Upload and analyze a video first.</p>
                </div>
              )}
            </TabPane>

            {/* HISTORY TAB */}
            <TabPane 
              tab={
                <span>
                  <SafetyCertificateOutlined />
                  Analysis History
                  {analysisHistory.length > 0 && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>{analysisHistory.length}</Tag>
                  )}
                </span>
              } 
              key="history"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>Previous Video Analyses</h3>
                {analysisHistory.length > 0 && (
                  <Button onClick={clearHistory} size="small" danger>
                    Clear History
                  </Button>
                )}
              </div>

              {analysisHistory.length > 0 ? (
                <List
                  dataSource={analysisHistory}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          onClick={() => {
                            setAnalysisResult(item);
                            setActiveTab('results');
                          }}
                        >
                          View
                        </Button>,
                        <Button 
                          type="link" 
                          onClick={() => generateReport('pdf', item.analysisType)}
                          loading={generatingReport}
                        >
                          Report
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Tag color={analysisOptions.find(o => o.value === item.analysisType)?.color}>
                            {analysisOptions.find(o => o.value === item.analysisType)?.icon}
                          </Tag>
                        }
                        title={item.fileName}
                        description={
                          <div>
                            <div>Type: {item.analysisType.replace('_', ' ')}</div>
                            <div>Date: {new Date(item.timestamp).toLocaleString()}</div>
                            <div>Detections: {item.detections?.length || 0} objects</div>
                            {item.result?.risks && <div>Risks: {item.result.risks.length} found</div>}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                  <p>No analysis history yet.</p>
                  <p>Your video analyses will appear here.</p>
                </div>
              )}
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </VideoAnalysisErrorBoundary>
  );
}

// Helper functions
function getRiskColor(severity) {
  const colors = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'green'
  };
  return colors[severity] || 'blue';
}