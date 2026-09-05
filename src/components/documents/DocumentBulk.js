// src/components/documents/DocumentBulk.jsx
// Bulk Operations Component - Bulk upload, status change, import/export

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Upload, Progress,
  List, Badge, Tooltip, Switch, Empty, Spin, Alert,
  Divider, Collapse, Typography, Checkbox, Radio, Steps,
  UploadFile, DatePicker, Tabs, Descriptions, Statistic
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileZipOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
  CloudUploadOutlined,
  InboxOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './DocumentBulk.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Dragger } = Upload;
const { Step } = Steps;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const BULK_ACTIONS = [
  { value: 'status', label: 'Change Status' },
  { value: 'tags', label: 'Assign Tags' },
  { value: 'delete', label: 'Delete' },
  { value: 'archive', label: 'Archive' },
  { value: 'publish', label: 'Publish' },
  { value: 'review', label: 'Mark Reviewed' }
];

const IMPORT_TYPES = [
  { value: 'csv', label: 'CSV File' },
  { value: 'excel', label: 'Excel File' },
  { value: 'json', label: 'JSON File' }
];

const EXPORT_TYPES = [
  { value: 'csv', label: 'CSV File' },
  { value: 'excel', label: 'Excel File' },
  { value: 'pdf', label: 'PDF File' },
  { value: 'json', label: 'JSON File' }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentBulk = ({ 
  companyId = null,
  onBulkActionComplete,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [bulkAction, setBulkAction] = useState('status');
  const [bulkTarget, setBulkTarget] = useState('selected');
  
  // Bulk Upload
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadFileList, setUploadFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState([]);
  
  // Bulk Action Modal
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResults, setActionResults] = useState([]);
  
  // Import/Export
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importType, setImportType] = useState('csv');
  const [exportType, setExportType] = useState('csv');
  const [importFile, setImportFile] = useState(null);
  
  // Search
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    module: 'all'
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
    return true;
  };

  const sanitizeInput = (value) => {
    if (!value) return '';
    return value.trim().replace(/[<>]/g, '');
  };

  const validateFileSize = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      message.error('File size cannot exceed 50MB');
      return false;
    }
    return true;
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const sanitizedSearch = sanitizeInput(searchText);
      
      const params = {
        search: sanitizedSearch,
        ...filters,
        company_id: companyId,
        limit: 1000 // Get more for bulk operations
      };
      
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });
      
      const data = await documentService.getDocuments(params);
      const docs = data.documents || data.data || [];
      setDocuments(docs);
      
    } catch (error) {
      console.error('Failed to load documents:', error);
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [searchText, filters, companyId]);

  // ============================================================
  // BULK OPERATIONS
  // ============================================================
  
  const handleBulkAction = async (values) => {
    const targetIds = bulkTarget === 'selected' ? selectedRowKeys : documents.map(d => d.id);
    
    if (targetIds.length === 0) {
      message.warning('No documents selected for bulk action');
      return;
    }
    
    if (targetIds.length > 1000) {
      message.warning('Cannot perform bulk action on more than 1000 documents at once');
      return;
    }
    
    setActionLoading(true);
    setActionResults([]);
    
    try {
      let result;
      
      switch (bulkAction) {
        case 'status':
          if (!values.status) {
            message.error('Please select a status');
            return;
          }
          result = await documentService.bulkUpdateStatus(targetIds, values.status);
          break;
        case 'tags':
          if (!values.tags || values.tags.trim().length < 2) {
            message.error('Please enter tags (minimum 2 characters)');
            return;
          }
          const tags = values.tags.split(',').map(t => t.trim()).filter(Boolean);
          if (tags.length === 0) {
            message.error('Please enter valid tags');
            return;
          }
          result = await documentService.bulkAssignTags(targetIds, tags);
          break;
        case 'delete':
          result = await documentService.bulkDelete(targetIds);
          break;
        case 'archive':
          result = await documentService.bulkArchive(targetIds);
          break;
        case 'publish':
          result = await documentService.bulkPublish(targetIds);
          break;
        case 'review':
          result = await documentService.bulkMarkReviewed(targetIds);
          break;
        default:
          message.error('Unknown bulk action');
          return;
      }
      
      setActionResults(result.results || []);
      message.success(`Bulk action completed: ${result.success || 0} succeeded, ${result.failed || 0} failed`);
      setActionModalVisible(false);
      setSelectedRowKeys([]);
      loadDocuments();
      
      if (onBulkActionComplete) onBulkActionComplete();
      
    } catch (error) {
      console.error('Bulk action failed:', error);
      message.error(error.message || 'Bulk action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // UPLOAD OPERATIONS
  // ============================================================
  
  const handleUpload = async () => {
    if (uploadFileList.length === 0) {
      message.warning('Please select files to upload');
      return;
    }
    
    if (uploadFileList.length > 50) {
      message.warning('Cannot upload more than 50 files at once');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setUploadResults([]);
    
    try {
      const files = uploadFileList.map(f => f.originFileObj);
      const totalFiles = files.length;
      let successCount = 0;
      let failCount = 0;
      const results = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = ((i + 1) / totalFiles) * 100;
        setUploadProgress(progress);
        
        try {
          // Create document with file
          await documentService.createDocument({
            title: file.name.replace(/\.[^/.]+$/, ''),
            file: file,
            document_type: 'report',
            module: 'general',
            company_id: companyId
          });
          successCount++;
          results.push({ file: file.name, status: 'success' });
        } catch (error) {
          failCount++;
          results.push({ file: file.name, status: 'failed', error: error.message });
        }
      }
      
      setUploadResults(results);
      message.success(`Upload complete: ${successCount} succeeded, ${failCount} failed`);
      setUploadModalVisible(false);
      setUploadFileList([]);
      loadDocuments();
      
      if (onBulkActionComplete) onBulkActionComplete();
      
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ============================================================
  // IMPORT/EXPORT
  // ============================================================
  
  const handleImport = async () => {
    if (!importFile) {
      message.warning('Please select a file to import');
      return;
    }
    
    if (!validateFileSize(importFile)) {
      return;
    }
    
    setLoading(true);
    try {
      await documentService.importDocuments(importFile, {
        type: importType,
        company_id: companyId
      });
      message.success('Documents imported successfully');
      setImportModalVisible(false);
      setImportFile(null);
      loadDocuments();
      
      if (onBulkActionComplete) onBulkActionComplete();
      
    } catch (error) {
      console.error('Import failed:', error);
      message.error(error.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (documents.length === 0) {
      message.warning('No documents to export');
      return;
    }
    
    if (documents.length > 10000) {
      message.warning('Too many documents to export. Please filter your results');
      return;
    }
    
    try {
      await documentService.exportDocuments({
        format: exportType,
        company_id: companyId,
        filters: {
          ...filters,
          search: searchText
        }
      });
      message.success(`Documents exported as ${exportType.toUpperCase()}`);
      setExportModalVisible(false);
      
    } catch (error) {
      console.error('Export failed:', error);
      message.error(error.message || 'Export failed');
    }
  };

  // ============================================================
  // SEARCH HANDLER
  // ============================================================
  
  const handleSearch = () => {
    if (!validateSearch(searchText)) {
      return;
    }
    loadDocuments();
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
    loadDocuments();
  }, [loadDocuments]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusColor = (status) => {
    const colors = {
      draft: '#d9d9d9',
      review: '#1890ff',
      approved: '#52c41a',
      published: '#1890ff',
      archived: '#faad14',
      rejected: '#f5222d'
    };
    return colors[status] || '#d9d9d9';
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

  // Render Document Table
  const renderDocumentTable = () => {
    const columns = [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (title, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.module || 'General'}
            </div>
          </div>
        )
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={getStatusColor(status)}>{status}</Tag>
        )
      },
      {
        title: 'Type',
        dataIndex: 'document_type',
        key: 'document_type',
        render: (type) => <Tag>{type}</Tag>
      },
      {
        title: 'Updated',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (date) => formatDate(date)
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
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        scroll={{ x: 800 }}
      />
    );
  };

  // Render Action Modal
  const renderActionModal = () => (
    <Modal
      title={<Space><EditOutlined /> Bulk Action</Space>}
      open={actionModalVisible}
      onCancel={() => setActionModalVisible(false)}
      footer={null}
      width={600}
    >
      <Form
        layout="vertical"
        onFinish={handleBulkAction}
        initialValues={{ status: 'approved' }}
      >
        <Form.Item label="Action Type">
          <Select value={bulkAction} onChange={setBulkAction} style={{ width: '100%' }}>
            {BULK_ACTIONS.map(action => (
              <Option key={action.value} value={action.value}>{action.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Target">
          <Radio.Group value={bulkTarget} onChange={(e) => setBulkTarget(e.target.value)}>
            <Radio value="selected">Selected ({selectedRowKeys.length})</Radio>
            <Radio value="all">All ({documents.length})</Radio>
          </Radio.Group>
        </Form.Item>

        {bulkAction === 'status' && (
          <Form.Item
            name="status"
            label="New Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="draft">Draft</Option>
              <Option value="review">Review</Option>
              <Option value="approved">Approved</Option>
              <Option value="published">Published</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Form.Item>
        )}

        {bulkAction === 'tags' && (
          <Form.Item
            name="tags"
            label="Tags"
            rules={[
              { required: true, message: 'Please enter tags' },
              { min: 2, message: 'Tags must be at least 2 characters' }
            ]}
            extra="Separate multiple tags with commas"
          >
            <Input placeholder="e.g. compliance, 2024, urgent" maxLength={500} />
          </Form.Item>
        )}

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setActionModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={actionLoading}>
              Execute
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Upload Modal
  const renderUploadModal = () => (
    <Modal
      title={<Space><CloudUploadOutlined /> Bulk Upload</Space>}
      open={uploadModalVisible}
      onCancel={() => {
        setUploadModalVisible(false);
        setUploadFileList([]);
        setUploadResults([]);
      }}
      footer={null}
      width={600}
    >
      <Dragger
        fileList={uploadFileList}
        onChange={({ fileList }) => setUploadFileList(fileList)}
        beforeUpload={() => false}
        multiple={true}
        maxCount={50}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag files to upload</p>
        <p className="ant-upload-hint">
          Support: PDF, Word, Excel, Images, Text (Max 50 files, 50MB each)
        </p>
      </Dragger>

      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={uploadProgress} status="active" />
        </div>
      )}

      {uploadResults.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Alert
            message={`Upload complete: ${uploadResults.filter(r => r.status === 'success').length} succeeded, ${uploadResults.filter(r => r.status === 'failed').length} failed`}
            type={uploadResults.filter(r => r.status === 'failed').length === 0 ? 'success' : 'warning'}
            showIcon
          />
          <List
            size="small"
            dataSource={uploadResults}
            renderItem={(item) => (
              <List.Item>
                <Space>
                  {item.status === 'success' ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                    <CloseCircleOutlined style={{ color: '#f5222d' }} />
                  }
                  <Text>{item.file}</Text>
                  {item.error && <Text type="danger" style={{ fontSize: 12 }}>{item.error}</Text>}
                </Space>
              </List.Item>
            )}
            style={{ marginTop: 8, maxHeight: 200, overflow: 'auto' }}
          />
        </div>
      )}

      <Divider />

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={() => {
          setUploadModalVisible(false);
          setUploadFileList([]);
          setUploadResults([]);
        }}>Cancel</Button>
        <Button 
          type="primary" 
          onClick={handleUpload} 
          loading={uploading}
          disabled={uploadFileList.length === 0}
        >
          Upload {uploadFileList.length} Files
        </Button>
      </Space>
    </Modal>
  );

  // Render Import Modal
  const renderImportModal = () => (
    <Modal
      title={<Space><ImportOutlined /> Import Documents</Space>}
      open={importModalVisible}
      onCancel={() => {
        setImportModalVisible(false);
        setImportFile(null);
      }}
      footer={null}
      width={500}
    >
      <Form layout="vertical">
        <Form.Item label="File Format">
          <Select value={importType} onChange={setImportType} style={{ width: '100%' }}>
            {IMPORT_TYPES.map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="File" required>
          <Dragger
            beforeUpload={(file) => {
              if (!validateFileSize(file)) {
                return Upload.LIST_IGNORE;
              }
              setImportFile(file);
              return false;
            }}
            fileList={importFile ? [importFile] : []}
            onRemove={() => setImportFile(null)}
            maxCount={1}
            accept=".csv,.xlsx,.json"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to import</p>
            <p className="ant-upload-hint">Support: CSV, Excel, JSON (Max 50MB)</p>
          </Dragger>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setImportModalVisible(false);
              setImportFile(null);
            }}>Cancel</Button>
            <Button type="primary" onClick={handleImport} loading={loading} disabled={!importFile}>
              Import
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Export Modal
  const renderExportModal = () => (
    <Modal
      title={<Space><ExportOutlined /> Export Documents</Space>}
      open={exportModalVisible}
      onCancel={() => setExportModalVisible(false)}
      footer={null}
      width={500}
    >
      <Form layout="vertical">
        <Form.Item label="Export Format">
          <Select value={exportType} onChange={setExportType} style={{ width: '100%' }}>
            {EXPORT_TYPES.map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Documents to Export">
          <Radio.Group defaultValue="all">
            <Radio value="all">All Filtered ({documents.length})</Radio>
            <Radio value="selected">Selected ({selectedRowKeys.length})</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Include">
          <Checkbox.Group>
            <Checkbox value="metadata">Metadata</Checkbox>
            <Checkbox value="tags">Tags</Checkbox>
            <Checkbox value="history">Version History</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setExportModalVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={handleExport} loading={loading}>
              Export
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="document-bulk">
      {/* Header */}
      <div className="bulk-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <UploadOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Bulk Document Operations</Title>
            <Badge status="processing" text="Live" />
          </Space>
        </div>
      </div>

      {/* Action Buttons */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Button 
              block 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
              size="large"
            >
              Bulk Upload
            </Button>
          </Col>
          <Col xs={24} md={6}>
            <Button 
              block 
              icon={<EditOutlined />}
              onClick={() => setActionModalVisible(true)}
              size="large"
              disabled={selectedRowKeys.length === 0}
            >
              Bulk Action ({selectedRowKeys.length})
            </Button>
          </Col>
          <Col xs={24} md={6}>
            <Button 
              block 
              icon={<ImportOutlined />}
              onClick={() => setImportModalVisible(true)}
              size="large"
            >
              Import
            </Button>
          </Col>
          <Col xs={24} md={6}>
            <Button 
              block 
              icon={<ExportOutlined />}
              onClick={() => setExportModalVisible(true)}
              size="large"
              disabled={documents.length === 0}
            >
              Export
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <div className="bulk-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Search documents..."
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
              placeholder="Status"
            >
              <Option value="all">All Statuses</Option>
              <Option value="draft">Draft</Option>
              <Option value="review">Review</Option>
              <Option value="approved">Approved</Option>
              <Option value="published">Published</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={filters.module}
              onChange={(value) => setFilters({ ...filters, module: value })}
              style={{ width: '100%' }}
              allowClear
              placeholder="Module"
            >
              <Option value="all">All Modules</Option>
              <Option value="hse">HSE</Option>
              <Option value="environmental">Environmental</Option>
              <Option value="hospital">Hospital</Option>
              <Option value="quality">Quality</Option>
              <Option value="supply_chain">Supply Chain</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button icon={<ReloadOutlined />} onClick={loadDocuments} loading={loading} size="small">
                Refresh
              </Button>
              <Button 
                icon={<DeleteOutlined />} 
                danger 
                size="small"
                onClick={() => {
                  if (selectedRowKeys.length === 0) {
                    message.warning('Please select documents to delete');
                    return;
                  }
                  Modal.confirm({
                    title: `Delete ${selectedRowKeys.length} documents?`,
                    content: 'This action cannot be undone.',
                    onOk: async () => {
                      try {
                        await documentService.bulkDelete(selectedRowKeys);
                        message.success(`${selectedRowKeys.length} documents deleted`);
                        setSelectedRowKeys([]);
                        loadDocuments();
                        if (onBulkActionComplete) onBulkActionComplete();
                      } catch (error) {
                        message.error('Delete failed');
                      }
                    }
                  });
                }}
                disabled={selectedRowKeys.length === 0}
              >
                Delete Selected
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title="Total Documents" 
              value={documents.length} 
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title="Selected" 
              value={selectedRowKeys.length} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title="Actions Available" 
              value={BULK_ACTIONS.length} 
              prefix={<EditOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      {renderDocumentTable()}

      {/* Modals */}
      {renderActionModal()}
      {renderUploadModal()}
      {renderImportModal()}
      {renderExportModal()}
    </div>
  );
};

export default DocumentBulk;