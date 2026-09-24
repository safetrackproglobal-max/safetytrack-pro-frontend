// src/components/documents/SmartIntake.jsx
// AI-powered document intake: auto-detect type, extract metadata,
// detect duplicates, suggest linking, and human review queue

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Drawer, Descriptions, Tabs, Timeline,
  Avatar, List, Badge, Tooltip, Progress, Switch, Empty, Spin,
  Alert, Divider, Typography, Collapse, Checkbox, Radio, Slider,
  Upload, Steps, Result, Tag, Table, Statistic, Segmented,
  InputNumber, DatePicker, Tree, Transfer, notification
} from 'antd';
import {
  RobotOutlined, ThunderboltOutlined, ScanOutlined,
  FileTextOutlined, FilePdfOutlined, FileWordOutlined,
  FileExcelOutlined, FileImageOutlined, FileOutlined,
  InboxOutlined, CloudUploadOutlined, CheckCircleOutlined,
  CloseCircleOutlined, WarningOutlined, InfoCircleOutlined,
  ClockCircleOutlined, SyncOutlined, LoadingOutlined,
  SearchOutlined, FilterOutlined, ReloadOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
  TagsOutlined, UserOutlined, TeamOutlined, CalendarOutlined,
  GlobalOutlined, EnvironmentOutlined, SafetyOutlined,
  AuditOutlined, DatabaseOutlined, DeploymentUnitOutlined,
  BulbOutlined, ThunderboltFilled, ExperimentOutlined,
  LinkOutlined, PaperClipOutlined, SaveOutlined,
  SendOutlined, RocketOutlined, RollbackOutlined,
  ExclamationCircleOutlined, FireOutlined, BugOutlined,
  LineChartOutlined, PieChartOutlined, BarChartOutlined,
  FileSearchOutlined, HighlightOutlined, RobotFilled,
  CheckOutlined, CloseOutlined, ArrowRightOutlined,
  StarFilled, StarOutlined, HeartOutlined
} from '@ant-design/icons';
import { Upload as AntUpload } from 'antd';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './SmartIntake.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Dragger } = AntUpload;
const { Step } = Steps;

// ============================================================
// CONSTANTS
// ============================================================

const INTAKE_STAGES = {
  uploading: { label: 'Uploading', icon: <CloudUploadOutlined />, color: 'processing' },
  scanning: { label: 'Scanning', icon: <ScanOutlined />, color: 'processing' },
  extracting: { label: 'Extracting', icon: <RobotOutlined />, color: 'processing' },
  classifying: { label: 'Classifying', icon: <ThunderboltOutlined />, color: 'processing' },
  duplicate_check: { label: 'Duplicate Check', icon: <SearchOutlined />, color: 'processing' },
  review: { label: 'Human Review', icon: <UserOutlined />, color: 'warning' },
  complete: { label: 'Complete', icon: <CheckCircleOutlined />, color: 'success' },
  error: { label: 'Error', icon: <CloseCircleOutlined />, color: 'error' }
};

const CONFIDENCE_LEVELS = {
  high: { label: 'High Confidence', color: 'green', threshold: 0.8 },
  medium: { label: 'Medium Confidence', color: 'orange', threshold: 0.5 },
  low: { label: 'Low Confidence', color: 'red', threshold: 0 }
};

const DOCUMENT_TYPES = {
  report: { label: 'Report', color: '#1890ff' },
  invoice: { label: 'Invoice', color: '#52c41a' },
  contract: { label: 'Contract', color: '#722ed1' },
  certificate: { label: 'Certificate', color: '#faad14' },
  policy: { label: 'Policy', color: '#13c2c2' },
  procedure: { label: 'Procedure', color: '#eb2f96' },
  incident_report: { label: 'Incident Report', color: '#f5222d' },
  permit: { label: 'Permit', color: '#fa541c' },
  sds: { label: 'Safety Data Sheet', color: '#faad14' },
  training: { label: 'Training Material', color: '#2f54eb' },
  medical: { label: 'Medical Record', color: '#cf1322' },
  financial: { label: 'Financial Document', color: '#52c41a' },
  unknown: { label: 'Unknown', color: '#8c8c8c' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const SmartIntake = ({
  companyId = null,
  embedded = false,
  onComplete = null
}) => {
  const { user } = useAuth();
  
  // ============================================================
  // STATE
  // ============================================================
  
  const [activeTab, setActiveTab] = useState('upload');
  const [processing, setProcessing] = useState(false);
  const [queue, setQueue] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [stats, setStats] = useState({
    total_processed: 0,
    auto_approved: 0,
    needs_review: 0,
    duplicates_found: 0,
    avg_confidence: 0
  });
  
  // UI State
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Processing config
  const [autoClassify, setAutoClassify] = useState(true);
  const [autoExtract, setAutoExtract] = useState(true);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [autoLink, setAutoLink] = useState(true);
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(90);
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);
  
  // Refs
  const pollIntervalRef = useRef(null);

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadQueue = useCallback(async () => {
    try {
      const data = await documentService.getIntakeQueue({ 
        company_id: companyId,
        status: 'processing'
      });
      setQueue(data.items || []);
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  }, [companyId]);
  
  const loadCompleted = useCallback(async () => {
    try {
      const data = await documentService.getIntakeQueue({ 
        company_id: companyId,
        status: 'completed',
        limit: 50
      });
      setCompleted(data.items || []);
    } catch (error) {
      console.error('Failed to load completed:', error);
    }
  }, [companyId]);
  
  const loadReviewQueue = useCallback(async () => {
    try {
      const data = await documentService.getIntakeQueue({ 
        company_id: companyId,
        status: 'needs_review',
        limit: 100
      });
      setReviewQueue(data.items || []);
    } catch (error) {
      console.error('Failed to load review queue:', error);
    }
  }, [companyId]);
  
  const loadStats = useCallback(async () => {
    try {
      const data = await documentService.getIntakeStats({ company_id: companyId });
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [companyId]);

  // ============================================================
  // UPLOAD HANDLERS
  // ============================================================
  
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select files to upload');
      return;
    }
    
    setUploading(true);
    try {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file.originFileObj);
        formData.append('company_id', companyId);
        formData.append('auto_classify', autoClassify);
        formData.append('auto_extract', autoExtract);
        formData.append('check_duplicates', checkDuplicates);
        formData.append('auto_link', autoLink);
        formData.append('auto_approve_threshold', autoApproveThreshold);
        
        const result = await documentService.submitSmartIntake(formData);
        
        // Add to queue
        setQueue(prev => [...prev, {
          id: result.id,
          file_name: file.name,
          status: 'processing',
          stage: 'uploading',
          progress: 0,
          uploaded_at: new Date().toISOString()
        }]);
        
        // Start polling for this item
        pollIntakeItem(result.id);
      }
      
      message.success(`${fileList.length} file(s) submitted for processing`);
      setFileList([]);
      setActiveTab('processing');
      loadStats();
      
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };
  
  const pollIntakeItem = async (itemId) => {
    try {
      const data = await documentService.getIntakeStatus(itemId);
      
      setQueue(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, ...data.item }
          : item
      ));
      
      if (data.item.status === 'completed') {
        // Move to completed
        setQueue(prev => prev.filter(i => i.id !== itemId));
        loadCompleted();
        
        if (data.item.needs_review) {
          loadReviewQueue();
        }
        
        if (notifyOnComplete) {
          notification.success({
            message: 'Processing Complete',
            description: `${data.item.file_name} processed successfully`,
            placement: 'bottomRight'
          });
        }
      } else if (data.item.status === 'processing') {
        // Continue polling
        setTimeout(() => pollIntakeItem(itemId), 2000);
      } else if (data.item.status === 'error') {
        setQueue(prev => prev.filter(i => i.id !== itemId));
        message.error(`Failed to process ${data.item.file_name}: ${data.item.error}`);
      }
    } catch (error) {
      console.error('Poll failed:', error);
    }
  };

  // ============================================================
  // REVIEW HANDLERS
  // ============================================================
  
  const handleApproveItem = async (itemId, updates = {}) => {
    try {
      await documentService.approveIntakeItem(itemId, updates);
      message.success('Item approved');
      loadReviewQueue();
      loadCompleted();
      setReviewModalVisible(false);
      setSelectedItem(null);
      
      if (onComplete) onComplete();
      
    } catch (error) {
      console.error('Approve failed:', error);
      message.error('Failed to approve item');
    }
  };
  
  const handleRejectItem = async (itemId, reason) => {
    try {
      await documentService.rejectIntakeItem(itemId, reason);
      message.success('Item rejected');
      loadReviewQueue();
      setReviewModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Reject failed:', error);
      message.error('Failed to reject item');
    }
  };
  
  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return;
    
    try {
      await Promise.all(
        selectedRows.map(id => documentService.approveIntakeItem(id))
      );
      message.success(`${selectedRows.length} items approved`);
      setSelectedRows([]);
      loadReviewQueue();
      loadCompleted();
    } catch (error) {
      message.error('Failed to approve some items');
    }
  };
  
  const handleEditField = (item, field, value) => {
    setSelectedItem(prev => ({
      ...prev,
      extracted_data: {
        ...prev.extracted_data,
        [field]: value
      }
    }));
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadQueue();
    loadCompleted();
    loadReviewQueue();
    loadStats();
    
    // Poll for updates
    pollIntervalRef.current = setInterval(() => {
      loadQueue();
      loadReviewQueue();
      loadStats();
    }, 10000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [loadQueue, loadCompleted, loadReviewQueue, loadStats]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStageIcon = (stage) => {
    const config = INTAKE_STAGES[stage];
    return config?.icon || <FileOutlined />;
  };
  
  const getStageColor = (stage) => {
    const config = INTAKE_STAGES[stage];
    return config?.color || 'default';
  };
  
  const getConfidenceLevel = (score) => {
    if (score >= 0.8) return CONFIDENCE_LEVELS.high;
    if (score >= 0.5) return CONFIDENCE_LEVELS.medium;
    return CONFIDENCE_LEVELS.low;
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="intake-stat-card">
          <Statistic
            title="Processed Today"
            value={stats.total_processed || 0}
            prefix={<RobotOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="intake-stat-card">
          <Statistic
            title="Auto-Approved"
            value={stats.auto_approved || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="intake-stat-card">
          <Statistic
            title="Needs Review"
            value={stats.needs_review || 0}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="intake-stat-card">
          <Statistic
            title="Avg Confidence"
            value={Math.round((stats.avg_confidence || 0) * 100)}
            suffix="%"
            prefix={<LineChartOutlined />}
            valueStyle={{ 
              color: stats.avg_confidence >= 0.8 ? '#52c41a' : '#faad14' 
            }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderUploadTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card title="Upload Documents for Smart Processing" size="small">
          <Dragger
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            multiple={true}
            maxCount={20}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.csv"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">
              Click or drag files to upload
            </p>
            <p className="ant-upload-hint">
              AI will automatically classify, extract metadata, and check for duplicates.
              <br />
              <strong>Supported:</strong> PDF, Word, Excel, Images, Text, CSV (max 20 files)
            </p>
          </Dragger>
          
          {fileList.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Alert
                message={`${fileList.length} file(s) ready to process`}
                description="Click 'Start Processing' to begin AI analysis"
                type="info"
                showIcon
              />
              
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setFileList([])}>
                    Clear
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<RocketOutlined />}
                    onClick={handleUpload}
                    loading={uploading}
                    size="large"
                  >
                    Start Processing
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Card title="Processing Options" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Switch
                checked={autoClassify}
                onChange={setAutoClassify}
                size="small"
              />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>Auto-Classify</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Detect document type using AI
                </div>
              </div>
            </Space>
            
            <Space>
              <Switch
                checked={autoExtract}
                onChange={setAutoExtract}
                size="small"
              />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>Extract Metadata</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Extract dates, amounts, names, tags
                </div>
              </div>
            </Space>
            
            <Space>
              <Switch
                checked={checkDuplicates}
                onChange={setCheckDuplicates}
                size="small"
              />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>Duplicate Detection</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Find similar existing documents
                </div>
              </div>
            </Space>
            
            <Space>
              <Switch
                checked={autoLink}
                onChange={setAutoLink}
                size="small"
              />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>Auto-Link</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Suggest linking to related items
                </div>
              </div>
            </Space>
            
            <Divider style={{ margin: '8px 0' }} />
            
            <div>
              <div style={{ fontSize: 12, marginBottom: 8 }}>
                Auto-Approve Threshold: <strong>{autoApproveThreshold}%</strong>
              </div>
              <Slider
                value={autoApproveThreshold}
                onChange={setAutoApproveThreshold}
                min={50}
                max={100}
                step={5}
                marks={{ 50: '50%', 75: '75%', 100: '100%' }}
              />
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 8 }}>
                Items with confidence above this threshold are auto-approved
              </div>
            </div>
            
            <Divider style={{ margin: '8px 0' }} />
            
            <Space>
              <Switch
                checked={notifyOnComplete}
                onChange={setNotifyOnComplete}
                size="small"
              />
              <Text style={{ fontSize: 13 }}>Notify me when complete</Text>
            </Space>
          </Space>
        </Card>
        
        <Card title="AI Capabilities" size="small" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <RobotFilled style={{ color: '#722ed1' }} />
              <Text style={{ fontSize: 12 }}>Document classification</Text>
            </Space>
            <Space>
              <ScanOutlined style={{ color: '#1890ff' }} />
              <Text style={{ fontSize: 12 }}>OCR text extraction</Text>
            </Space>
            <Space>
              <HighlightOutlined style={{ color: '#faad14' }} />
              <Text style={{ fontSize: 12 }}>Named entity recognition</Text>
            </Space>
            <Space>
              <DeploymentUnitOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: 12 }}>Smart linking suggestions</Text>
            </Space>
            <Space>
              <FileSearchOutlined style={{ color: '#13c2c2' }} />
              <Text style={{ fontSize: 12 }}>Duplicate detection</Text>
            </Space>
          </Space>
        </Card>
      </Col>
    </Row>
  );
  
  const renderProcessingTab = () => (
    <Card 
      title={
        <Space>
          <SyncOutlined spin={queue.length > 0} />
          <span>Processing Queue</span>
          <Badge count={queue.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      size="small"
    >
      {queue.length > 0 ? (
        <List
          dataSource={queue}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{item.file_name}</Text>
                    <Tag icon={getStageIcon(item.stage)} color={getStageColor(item.stage)}>
                      {INTAKE_STAGES[item.stage]?.label || item.stage}
                    </Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatFileSize(item.file_size)}
                  </Text>
                </div>
                <Progress 
                  percent={item.progress || 0} 
                  status={item.status === 'error' ? 'exception' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                  {item.message || `Processing: ${INTAKE_STAGES[item.stage]?.label || item.stage}`}
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty 
          description="No documents in queue" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
  
  const renderReviewTab = () => (
    <Card
      title={
        <Space>
          <UserOutlined style={{ color: '#faad14' }} />
          <span>Human Review Queue</span>
          <Badge count={reviewQueue.length} style={{ backgroundColor: '#faad14' }} />
        </Space>
      }
      size="small"
      extra={
        <Space>
          {selectedRows.length > 0 && (
            <Popconfirm
              title={`Approve ${selectedRows.length} items?`}
              onConfirm={handleBulkApprove}
            >
              <Button type="primary" size="small" icon={<CheckOutlined />}>
                Approve Selected ({selectedRows.length})
              </Button>
            </Popconfirm>
          )}
          <Button 
            icon={<ReloadOutlined />}
            onClick={loadReviewQueue}
            size="small"
          >
            Refresh
          </Button>
        </Space>
      }
    >
      {reviewQueue.length > 0 ? (
        <Table
          rowKey="id"
          dataSource={reviewQueue}
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys: selectedRows,
            onChange: setSelectedRows
          }}
          columns={[
            {
              title: 'Document',
              dataIndex: 'file_name',
              key: 'file_name',
              render: (name, record) => (
                <Space>
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {formatFileSize(record.file_size)}
                    </div>
                  </div>
                </Space>
              )
            },
            {
              title: 'AI Classification',
              dataIndex: 'predicted_type',
              key: 'predicted_type',
              render: (type, record) => {
                const typeConfig = DOCUMENT_TYPES[type] || DOCUMENT_TYPES.unknown;
                const confidence = getConfidenceLevel(record.confidence || 0);
                return (
                  <Space direction="vertical" size={2}>
                    <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                    <Tag color={confidence.color} style={{ fontSize: 10 }}>
                      {Math.round((record.confidence || 0) * 100)}% confidence
                    </Tag>
                  </Space>
                );
              }
            },
            {
              title: 'Reason for Review',
              dataIndex: 'review_reason',
              key: 'review_reason',
              render: (reason) => (
                <Tag color="orange" icon={<WarningOutlined />}>
                  {reason || 'Low confidence'}
                </Tag>
              )
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status, record) => (
                <Space direction="vertical" size={2}>
                  <Tag color="warning">Needs Review</Tag>
                  {record.duplicate_found && (
                    <Tag color="red" icon={<SearchOutlined />}>
                      Possible Duplicate
                    </Tag>
                  )}
                </Space>
              )
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 180,
              render: (_, record) => (
                <Space>
                  <Button 
                    type="primary"
                    size="small" 
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedItem(record);
                      setReviewModalVisible(true);
                    }}
                  >
                    Review
                  </Button>
                  <Popconfirm
                    title="Approve this item?"
                    onConfirm={() => handleApproveItem(record.id)}
                  >
                    <Button 
                      size="small" 
                      icon={<CheckOutlined />}
                      style={{ color: '#52c41a' }}
                    />
                  </Popconfirm>
                  <Popconfirm
                    title="Reject this item?"
                    onConfirm={() => handleRejectItem(record.id, 'Rejected by reviewer')}
                  >
                    <Button 
                      size="small" 
                      danger
                      icon={<CloseOutlined />}
                    />
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      ) : (
        <Result
          status="success"
          title="Review Queue Empty"
          subTitle="All documents have been processed. No items require review."
        />
      )}
    </Card>
  );
  
  const renderCompletedTab = () => (
    <Card title="Recently Processed" size="small">
      {completed.length > 0 ? (
        <Table
          rowKey="id"
          dataSource={completed}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Document',
              dataIndex: 'file_name',
              key: 'file_name',
              render: (name, record) => (
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {formatDate(record.processed_at)}
                    </div>
                  </div>
                </Space>
              )
            },
            {
              title: 'Classification',
              dataIndex: 'predicted_type',
              key: 'predicted_type',
              render: (type) => {
                const config = DOCUMENT_TYPES[type] || DOCUMENT_TYPES.unknown;
                return <Tag color={config.color}>{config.label}</Tag>;
              }
            },
            {
              title: 'Extracted Fields',
              dataIndex: 'extracted_fields_count',
              key: 'extracted_fields_count',
              render: (count) => (
                <Badge count={count || 0} style={{ backgroundColor: '#1890ff' }}>
                  <span style={{ fontSize: 11 }}>fields</span>
                </Badge>
              )
            },
            {
              title: 'Confidence',
              dataIndex: 'confidence',
              key: 'confidence',
              render: (score) => {
                const level = getConfidenceLevel(score || 0);
                return (
                  <Tag color={level.color}>
                    {Math.round((score || 0) * 100)}%
                  </Tag>
                );
              }
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button 
                    size="small" 
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedItem(record);
                      setDetailDrawerVisible(true);
                    }}
                  >
                    View
                  </Button>
                </Space>
              )
            }
          ]}
        />
      ) : (
        <Empty description="No completed items yet" />
      )}
    </Card>
  );

  // ============================================================
  // REVIEW MODAL
  // ============================================================
  
  const renderReviewModal = () => {
    if (!selectedItem) return null;
    
    const typeConfig = DOCUMENT_TYPES[selectedItem.predicted_type] || DOCUMENT_TYPES.unknown;
    const confidence = getConfidenceLevel(selectedItem.confidence || 0);
    
    return (
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#faad14' }} />
            <span>Review Document</span>
          </Space>
        }
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setSelectedItem(null);
        }}
        footer={[
          <Button 
            key="reject"
            danger
            onClick={() => handleRejectItem(selectedItem.id, 'Rejected by reviewer')}
          >
            Reject
          </Button>,
          <Button 
            key="approve"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApproveItem(selectedItem.id, {
              document_type: selectedItem.predicted_type,
              tags: selectedItem.suggested_tags,
              extracted_data: selectedItem.extracted_data
            })}
          >
            Approve & Save
          </Button>
        ]}
        width={800}
      >
        <Alert
          message="Review Required"
          description={
            <div>
              <div>Reason: {selectedItem.review_reason || 'Low AI confidence'}</div>
              {selectedItem.duplicate_found && (
                <div style={{ marginTop: 4 }}>
                  ⚠️ Possible duplicate of: <strong>{selectedItem.duplicate_title}</strong>
                </div>
              )}
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" title="AI Classification">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Predicted Type:</Text>
                  <div style={{ marginTop: 4 }}>
                    <Select
                      value={selectedItem.predicted_type}
                      onChange={(v) => setSelectedItem({ ...selectedItem, predicted_type: v })}
                      style={{ width: '100%' }}
                    >
                      {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                        <Option key={key} value={key}>
                          <Tag color={value.color}>{value.label}</Tag>
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Text type="secondary">Confidence:</Text>
                  <Progress 
                    percent={Math.round((selectedItem.confidence || 0) * 100)}
                    strokeColor={confidence.color === 'green' ? '#52c41a' : 
                                  confidence.color === 'orange' ? '#faad14' : '#f5222d'}
                  />
                </div>
                
                <div>
                  <Text type="secondary">Suggested Tags:</Text>
                  <div style={{ marginTop: 4 }}>
                    <Select
                      mode="tags"
                      value={selectedItem.suggested_tags || []}
                      onChange={(v) => setSelectedItem({ ...selectedItem, suggested_tags: v })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small" title="Extracted Data">
              {selectedItem.extracted_data && Object.keys(selectedItem.extracted_data).length > 0 ? (
                <Descriptions column={1} size="small" bordered>
                  {Object.entries(selectedItem.extracted_data).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      <Input
                        value={value}
                        onChange={(e) => handleEditField(selectedItem, key, e.target.value)}
                        size="small"
                      />
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              ) : (
                <Empty description="No data extracted" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>
        </Row>
        
        {selectedItem.ocr_text && (
          <Card size="small" title="Extracted Text" style={{ marginTop: 16 }}>
            <div style={{
              maxHeight: 200,
              overflow: 'auto',
              padding: 8,
              background: '#fafafa',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace'
            }}>
              {selectedItem.ocr_text.substring(0, 2000)}
              {selectedItem.ocr_text.length > 2000 && '...'}
            </div>
          </Card>
        )}
      </Modal>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="smart-intake" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="intake-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <RobotOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Smart Document Intake</Title>
              <Badge status="processing" text="AI-Powered" />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  loadQueue();
                  loadCompleted();
                  loadReviewQueue();
                  loadStats();
                }}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Stats */}
      {renderStats()}
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'upload',
            label: (
              <Space>
                <CloudUploadOutlined />
                Upload
              </Space>
            ),
            children: renderUploadTab()
          },
          {
            key: 'processing',
            label: (
              <Space>
                <SyncOutlined spin={queue.length > 0} />
                Processing
                {queue.length > 0 && (
                  <Badge count={queue.length} style={{ backgroundColor: '#1890ff' }} />
                )}
              </Space>
            ),
            children: renderProcessingTab()
          },
          {
            key: 'review',
            label: (
              <Space>
                <UserOutlined />
                Needs Review
                {reviewQueue.length > 0 && (
                  <Badge count={reviewQueue.length} style={{ backgroundColor: '#faad14' }} />
                )}
              </Space>
            ),
            children: renderReviewTab()
          },
          {
            key: 'completed',
            label: (
              <Space>
                <CheckCircleOutlined />
                Completed
                {completed.length > 0 && (
                  <Badge count={completed.length} style={{ backgroundColor: '#52c41a' }} />
                )}
              </Space>
            ),
            children: renderCompletedTab()
          }
        ]}
      />
      
      {/* Modals */}
      {renderReviewModal()}
    </div>
  );
};

export default SmartIntake;