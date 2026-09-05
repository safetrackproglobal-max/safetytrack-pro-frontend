// src/components/documents/DocumentReview.jsx
// Review Management Component - Auto-reminders, Expiry Tracking, Review History

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Button, Space, Input, Select,
  Table, Tag, Modal, Form, message, Popconfirm, DatePicker,
  Drawer, Descriptions, Tabs, Timeline, Avatar, List,
  Badge, Tooltip, Progress, Switch, Empty, Spin, Alert,
  Divider, Collapse, Typography, Calendar, Radio
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  BellOutlined,
  HistoryOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  ExportOutlined,
  FilterOutlined,
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  AlertFilled,
  ClockCircleFilled,
  CheckCircleFilled
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './DocumentReview.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const REVIEW_STATUS = {
  current: { label: 'Current', color: 'success', icon: <CheckCircleOutlined /> },
  pending: { label: 'Pending Review', color: 'warning', icon: <ClockCircleOutlined /> },
  overdue: { label: 'Overdue', color: 'error', icon: <WarningOutlined /> },
  never_reviewed: { label: 'Never Reviewed', color: 'default', icon: <InfoCircleOutlined /> },
  reviewed: { label: 'Reviewed', color: 'processing', icon: <CheckCircleOutlined /> }
};

const REVIEW_FREQUENCY = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'biannual', label: 'Bi-Annual' },
  { value: 'annual', label: 'Annual' },
  { value: 'biennial', label: 'Bi-Annual' },
  { value: 'custom', label: 'Custom' }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentReview = ({ 
  documentId = null,
  companyId = null,
  onReviewUpdate,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    total: 0,
    current: 0,
    pending: 0,
    overdue: 0,
    never_reviewed: 0
  });
  
  // UI State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    frequency: 'all',
    date_range: null
  });
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // Form
  const [form] = Form.useForm();
  
  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================
  
  const validateSearch = (value) => {
    if (!value) return true;
    if (value.length < 2) {
      message.warning('Please enter at least 2 characters to search');
      return false;
    }
    if (value.length > 100) {
      message.warning('Search text cannot exceed 100 characters');
      return false;
    }
    // Prevent SQL injection patterns
    const dangerousPatterns = /([';]+|--|\b(OR|AND)\b\s+\b\w+\b\s*=\s*\w+)/i;
    if (dangerousPatterns.test(value)) {
      message.error('Invalid search text detected');
      return false;
    }
    return true;
  };

  const sanitizeInput = (value) => {
    if (!value) return '';
    return value.trim().replace(/[<>]/g, '');
  };

  const validateReviewDate = (date) => {
    if (!date) {
      message.error('Please select a review date');
      return false;
    }
    const selected = new Date(date);
    const today = new Date();
    // Can't set review date in the past (allow same day)
    if (selected < new Date(today.setHours(0, 0, 0, 0))) {
      message.error('Review date cannot be in the past');
      return false;
    }
    return true;
  };

  const validateNotes = (notes) => {
    if (notes && notes.length > 500) {
      message.error('Review notes cannot exceed 500 characters');
      return false;
    }
    return true;
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadReviewData = useCallback(async () => {
    setLoading(true);
    try {
      // Sanitize and validate search
      const sanitizedSearch = sanitizeInput(searchText);
      
      const params = {
        search: sanitizedSearch,
        ...filters,
        document_id: documentId,
        company_id: companyId
      };
      
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });
      
      // Handle date range
      if (filters.date_range && filters.date_range.length === 2) {
        params.date_from = filters.date_range[0].format('YYYY-MM-DD');
        params.date_to = filters.date_range[1].format('YYYY-MM-DD');
      }
      
      const data = await documentService.getReviewDocuments(params);
      
      const docs = data.documents || data.data || [];
      setDocuments(docs);
      
      // Update stats
      const stats = data.stats || {};
      setReviewStats({
        total: stats.total || docs.length || 0,
        current: stats.current || docs.filter(d => d.review_status === 'current').length,
        pending: stats.pending || docs.filter(d => d.review_status === 'pending').length,
        overdue: stats.overdue || docs.filter(d => d.review_status === 'overdue').length,
        never_reviewed: stats.never_reviewed || docs.filter(d => d.review_status === 'never_reviewed').length
      });
      
      // If documentId provided, load its history
      if (documentId) {
        const history = await documentService.getReviewHistory(documentId);
        setReviewHistory(history.data || []);
      }
      
    } catch (error) {
      console.error('Failed to load review data:', error);
      message.error('Failed to load review data');
    } finally {
      setLoading(false);
    }
  }, [searchText, filters, documentId, companyId]);

  const loadDocumentReviewDetail = useCallback(async (id) => {
    try {
      const data = await documentService.getDocumentReviewDetail(id);
      setSelectedDocument(data);
      
      const history = await documentService.getReviewHistory(id);
      setReviewHistory(history.data || []);
      
    } catch (error) {
      console.error('Failed to load review detail:', error);
      message.error('Failed to load review detail');
    }
  }, []);

  // ============================================================
  // REVIEW OPERATIONS WITH VALIDATION
  // ============================================================
  
  const handleSetReviewDate = async (values) => {
    // Validate review date
    if (!validateReviewDate(values.review_date)) {
      return;
    }
    
    // Validate notes
    if (!validateNotes(values.notes)) {
      return;
    }
    
    try {
      await documentService.updateReviewDate(
        selectedDocument.id,
        values.review_date,
        values.review_frequency,
        sanitizeInput(values.notes)
      );
      
      message.success('Review date updated successfully');
      setReviewModalVisible(false);
      form.resetFields();
      loadReviewData();
      
      if (onReviewUpdate) onReviewUpdate();
      
    } catch (error) {
      console.error('Failed to update review date:', error);
      message.error(error.message || 'Failed to update review date');
    }
  };

  const handleCompleteReview = async (id, notes = '') => {
    // Validate notes
    if (notes && notes.length > 500) {
      message.error('Review notes cannot exceed 500 characters');
      return;
    }
    
    try {
      await documentService.completeReview(id, sanitizeInput(notes));
      message.success('Review completed successfully');
      loadReviewData();
      if (selectedDocument?.id === id) {
        loadDocumentReviewDetail(id);
      }
    } catch (error) {
      console.error('Failed to complete review:', error);
      message.error(error.message || 'Failed to complete review');
    }
  };

  const handleSendReminders = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one document');
      return;
    }
    
    if (selectedRowKeys.length > 100) {
      message.warning('Cannot send reminders to more than 100 documents at once');
      return;
    }
    
    try {
      const result = await documentService.sendReviewReminders(selectedRowKeys);
      message.success(`Reminders sent to ${result.sent} documents`);
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Failed to send reminders:', error);
      message.error(error.message || 'Failed to send reminders');
    }
  };

  const handleBulkUpdate = async (status) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one document');
      return;
    }
    
    try {
      await documentService.bulkUpdateReviewStatus(selectedRowKeys, status);
      message.success(`${selectedRowKeys.length} documents updated`);
      setSelectedRowKeys([]);
      loadReviewData();
    } catch (error) {
      console.error('Bulk update failed:', error);
      message.error(error.message || 'Failed to update documents');
    }
  };

  // ============================================================
  // SEARCH HANDLER WITH VALIDATION
  // ============================================================
  
  const handleSearch = () => {
    if (!validateSearch(searchText)) {
      return;
    }
    loadReviewData();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.length > 100) {
      message.warning('Search text cannot exceed 100 characters');
      return;
    }
    setSearchText(value);
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadReviewData();
  }, [loadReviewData]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusTag = (status) => {
    const config = REVIEW_STATUS[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getStatusColor = (status) => {
    const config = REVIEW_STATUS[status];
    return config?.color || 'default';
  };

  const getDaysUntilReview = (nextReviewDate) => {
    if (!nextReviewDate) return null;
    const now = new Date();
    const reviewDate = new Date(nextReviewDate);
    const diffTime = reviewDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getReviewStatusText = (nextReviewDate) => {
    const days = getDaysUntilReview(nextReviewDate);
    if (days === null) return 'No review date set';
    if (days < 0) return `Overdue by ${Math.abs(days)} days`;
    if (days === 0) return 'Due today';
    if (days <= 7) return `Due in ${days} days`;
    if (days <= 30) return `Due in ${days} days`;
    return `Due in ${days} days`;
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Statistics
  const renderStats = () => (
    <Row gutter={[16, 16]} className="review-stats">
      <Col xs={24} sm={12} lg={4}>
        <Card size="small" className="stat-card stat-total">
          <Statistic
            title="Total Documents"
            value={reviewStats.total || 0}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card size="small" className="stat-card stat-current">
          <Statistic
            title="Current"
            value={reviewStats.current || 0}
            prefix={<CheckCircleFilled />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card size="small" className="stat-card stat-pending">
          <Statistic
            title="Pending Review"
            value={reviewStats.pending || 0}
            prefix={<ClockCircleFilled />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card size="small" className="stat-card stat-overdue">
          <Statistic
            title="Overdue"
            value={reviewStats.overdue || 0}
            prefix={<AlertFilled />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Card size="small" className="stat-card stat-never-reviewed">
          <Statistic
            title="Never Reviewed"
            value={reviewStats.never_reviewed || 0}
            prefix={<InfoCircleOutlined />}
            valueStyle={{ color: '#8c8c8c' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Filters
  const renderFilters = () => (
    <div className="review-filters">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={6}>
          <Input.Search
            placeholder="Search documents (min 2 characters)..."
            value={searchText}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            allowClear
            prefix={<SearchOutlined />}
            maxLength={100}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Select
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Review Status"
          >
            <Option value="all">All Statuses</Option>
            {Object.entries(REVIEW_STATUS).map(([key, value]) => (
              <Option key={key} value={key}>
                {value.icon} {value.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Select
            value={filters.frequency}
            onChange={(value) => setFilters({ ...filters, frequency: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Review Frequency"
          >
            <Option value="all">All Frequencies</Option>
            {REVIEW_FREQUENCY.map(freq => (
              <Option key={freq.value} value={freq.value}>{freq.label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={10}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button icon={<ReloadOutlined />} onClick={loadReviewData} loading={loading} size="small">
              Refresh
            </Button>
            {selectedRowKeys.length > 0 && (
              <>
                <Button
                  icon={<BellOutlined />}
                  onClick={handleSendReminders}
                  size="small"
                  disabled={selectedRowKeys.length > 100}
                >
                  Send Reminders ({selectedRowKeys.length})
                </Button>
                <Popconfirm
                  title={`Mark ${selectedRowKeys.length} documents as reviewed?`}
                  onConfirm={() => handleBulkUpdate('reviewed')}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small">Mark Reviewed</Button>
                </Popconfirm>
              </>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );

  // Render Review Table
  const renderReviewTable = () => {
    const columns = [
      {
        title: 'Document',
        dataIndex: 'title',
        key: 'title',
        render: (title, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: '#1890ff', fontSize: 18 }} />
            <div>
              <div style={{ fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                {record.module} • {record.document_type}
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Review Status',
        dataIndex: 'review_status',
        key: 'review_status',
        render: (status) => getStatusTag(status)
      },
      {
        title: 'Frequency',
        dataIndex: 'review_frequency',
        key: 'review_frequency',
        render: (frequency) => {
          const freq = REVIEW_FREQUENCY.find(f => f.value === frequency);
          return <Tag>{freq?.label || frequency || 'Not set'}</Tag>;
        }
      },
      {
        title: 'Last Review',
        dataIndex: 'last_reviewed_at',
        key: 'last_reviewed_at',
        render: (date) => date ? new Date(date).toLocaleDateString() : 'Never'
      },
      {
        title: 'Next Review',
        dataIndex: 'next_review_date',
        key: 'next_review_date',
        render: (date, record) => {
          if (!date) return <Text type="secondary">Not set</Text>;
          const days = getDaysUntilReview(date);
          return (
            <div>
              <div>{new Date(date).toLocaleDateString()}</div>
              <div style={{ fontSize: 12, color: days < 0 ? '#f5222d' : days <= 7 ? '#faad14' : '#52c41a' }}>
                {getReviewStatusText(date)}
              </div>
            </div>
          );
        }
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 180,
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedDocument(record);
                  loadDocumentReviewDetail(record.id);
                  setReviewModalVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="View History">
              <Button
                type="text"
                size="small"
                icon={<HistoryOutlined />}
                onClick={() => {
                  setSelectedDocument(record);
                  setHistoryDrawerVisible(true);
                  loadDocumentReviewDetail(record.id);
                }}
              />
            </Tooltip>
            {record.review_status !== 'current' && (
              <Tooltip title="Mark Reviewed">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Complete Review',
                      content: (
                        <div>
                          <TextArea
                            placeholder="Review notes (max 500 characters)..."
                            id="review-notes"
                            rows={3}
                            maxLength={500}
                            showCount
                          />
                        </div>
                      ),
                      onOk: () => {
                        const notes = document.getElementById('review-notes')?.value || '';
                        // Validate notes length
                        if (notes.length > 500) {
                          message.error('Review notes cannot exceed 500 characters');
                          return Promise.reject();
                        }
                        handleCompleteReview(record.id, notes);
                      }
                    });
                  }}
                />
              </Tooltip>
            )}
          </Space>
        )
      }
    ];

    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={documents}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} documents`,
          pageSizeOptions: ['10', '20', '50']
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: (record) => ({
            disabled: record.review_status === 'current' // Can't select already current documents
          })
        }}
        scroll={{ x: 1000 }}
      />
    );
  };

  // Render Review Modal
  const renderReviewModal = () => (
    <Modal
      title={<Space><CalendarOutlined /> Document Review</Space>}
      open={reviewModalVisible}
      onCancel={() => {
        setReviewModalVisible(false);
        form.resetFields();
      }}
      footer={null}
      width={600}
    >
      {selectedDocument && (
        <div>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Document" span={2}>
              <Text strong>{selectedDocument.title}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Current Status">
              {getStatusTag(selectedDocument.review_status)}
            </Descriptions.Item>
            <Descriptions.Item label="Frequency">
              {REVIEW_FREQUENCY.find(f => f.value === selectedDocument.review_frequency)?.label || 'Not set'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Review">
              {selectedDocument.last_reviewed_at ? new Date(selectedDocument.last_reviewed_at).toLocaleDateString() : 'Never'}
            </Descriptions.Item>
            <Descriptions.Item label="Next Review">
              {selectedDocument.next_review_date ? new Date(selectedDocument.next_review_date).toLocaleDateString() : 'Not set'}
            </Descriptions.Item>
          </Descriptions>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSetReviewDate}
            initialValues={{
              review_frequency: selectedDocument.review_frequency || 'annual',
              review_date: selectedDocument.next_review_date ? new Date(selectedDocument.next_review_date) : null
            }}
          >
            <Form.Item
              name="review_date"
              label="Next Review Date"
              rules={[
                { required: true, message: 'Please select a review date' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const selected = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selected < today) {
                      return Promise.reject('Review date cannot be in the past');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={(current) => current && current < new Date().setHours(0, 0, 0, 0)}
              />
            </Form.Item>

            <Form.Item
              name="review_frequency"
              label="Review Frequency"
              rules={[{ required: true, message: 'Please select a frequency' }]}
            >
              <Select placeholder="Select frequency">
                {REVIEW_FREQUENCY.map(freq => (
                  <Option key={freq.value} value={freq.value}>{freq.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Review Notes"
              rules={[
                {
                  max: 500,
                  message: 'Review notes cannot exceed 500 characters'
                }
              ]}
            >
              <TextArea 
                rows={3} 
                placeholder="Add review notes (max 500 characters)..." 
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setReviewModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Update Review Date
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );

  // Render History Drawer
  const renderHistoryDrawer = () => (
    <Drawer
      title={<Space><HistoryOutlined /> Review History</Space>}
      open={historyDrawerVisible}
      onClose={() => setHistoryDrawerVisible(false)}
      width={600}
    >
      {reviewHistory.length > 0 ? (
        <Timeline mode="left">
          {reviewHistory.map((item, index) => (
            <Timeline.Item
              key={index}
              color={item.action === 'reviewed' ? 'green' : 'blue'}
              label={item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
            >
              <Card size="small">
                <div>
                  <Space>
                    <strong>{item.action?.toUpperCase()}</strong>
                    {item.reviewer && <Tag icon={<UserOutlined />}>{item.reviewer}</Tag>}
                  </Space>
                  {item.comment && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Comment: </Text>
                      <Text>{item.comment}</Text>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                    {item.created_at && new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty description="No review history available" />
      )}
    </Drawer>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="document-review">
      {/* Header */}
      <div className="review-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <CalendarOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Document Review Management</Title>
            <Badge status="processing" text="Live" />
          </Space>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      {renderFilters()}

      {/* Table */}
      {renderReviewTable()}

      {/* Modals & Drawers */}
      {renderReviewModal()}
      {renderHistoryDrawer()}
    </div>
  );
};

export default DocumentReview;