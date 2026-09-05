// src/components/documents/TemplateLibrary.jsx

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal, Form,
  Tag, Badge, Rate, Empty, Spin, Tooltip, message, Upload,
  Tabs, Table, Popconfirm, Switch, Divider, Typography,
  Collapse, Checkbox, Slider, Progress, Drawer, Descriptions
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  StarOutlined,
  StarFilled,
  CopyOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  ImportOutlined,
  TagsOutlined,
  InboxOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './TemplateLibrary.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Dragger } = Upload;

// ============================================================
// CONSTANTS
// ============================================================

const TEMPLATE_CATEGORIES = [
  { value: 'report', label: 'Reports', icon: '📊' },
  { value: 'policy', label: 'Policies', icon: '📋' },
  { value: 'procedure', label: 'Procedures', icon: '📝' },
  { value: 'form', label: 'Forms', icon: '📄' },
  { value: 'checklist', label: 'Checklists', icon: '✅' },
  { value: 'incident', label: 'Incident Templates', icon: '🚨' },
  { value: 'training', label: 'Training Materials', icon: '📚' },
  { value: 'compliance', label: 'Compliance Docs', icon: '🔒' }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const TemplateLibrary = ({ companyId, onSelectTemplate, embedded = false }) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    module: 'all',
    document_type: 'all'
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    categories: {},
    popular: []
  });
  
  // Form
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  
  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const params = {
        company_id: companyId,
        search: searchText,
        ...filters
      };
      
      // Remove 'all' values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === null) {
          delete params[key];
        }
      });
      
      const data = await documentService.getTemplates(params);
      setTemplates(data.templates || []);
      
      // Calculate stats
      const cats = {};
      templates.forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + 1;
      });
      
      setStats({
        total: data.total || 0,
        categories: cats,
        popular: templates.slice(0, 5)
      });
      
    } catch (error) {
      console.error('Failed to load templates:', error);
      message.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleCreateTemplate = async (values) => {
    try {
      const data = {
        ...values,
        company_id: companyId,
        template_content: values.template_content || '<p>Start writing your template content here...</p>',
        template_variables: values.template_variables ? 
          values.template_variables.split(',').map(v => v.trim()) : []
      };
      
      await documentService.createTemplate(data);
      message.success('Template created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      loadTemplates();
      
    } catch (error) {
      console.error('Failed to create template:', error);
      message.error(error.message || 'Failed to create template');
    }
  };

  const handleUpdateTemplate = async (values) => {
    try {
      await documentService.updateTemplate(selectedTemplate.id, values);
      message.success('Template updated successfully');
      setEditModalVisible(false);
      form.resetFields();
      loadTemplates();
      
    } catch (error) {
      console.error('Failed to update template:', error);
      message.error(error.message || 'Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await documentService.deleteTemplate(templateId);
      message.success('Template deleted successfully');
      loadTemplates();
      
    } catch (error) {
      console.error('Failed to delete template:', error);
      message.error(error.message || 'Failed to delete template');
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      // Increment usage count
      await documentService.useTemplate(template.id);
      
      // Apply template
      const result = await documentService.applyTemplate(template.id);
      
      if (result.success && onSelectTemplate) {
        onSelectTemplate(result);
        message.success(`Template "${template.name}" loaded successfully`);
      }
      
    } catch (error) {
      console.error('Failed to use template:', error);
      message.error(error.message || 'Failed to use template');
    }
  };

  const handleImportTemplate = async (file) => {
    try {
      // Parse template from file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const templateData = JSON.parse(e.target.result);
          await documentService.createTemplate({
            ...templateData,
            company_id: companyId
          });
          message.success('Template imported successfully');
          setUploadModalVisible(false);
          loadTemplates();
        } catch (error) {
          message.error('Invalid template file format');
        }
      };
      reader.readAsText(file);
      return false;
    } catch (error) {
      console.error('Failed to import template:', error);
      message.error('Failed to import template');
      return false;
    }
  };

  const handleExportTemplate = (template) => {
    try {
      const data = JSON.stringify(template, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}.template.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Template exported successfully');
      
    } catch (error) {
      console.error('Failed to export template:', error);
      message.error('Failed to export template');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadTemplates();
  }, [searchText, filters]);

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Stats
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #1890ff' }}>
          <Statistic
            title="Total Templates"
            value={stats.total || 0}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #52c41a' }}>
          <Statistic
            title="Categories"
            value={Object.keys(stats.categories).length || 0}
            prefix={<TagsOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #faad14' }}>
          <Statistic
            title="Most Used"
            value={stats.popular.length > 0 ? stats.popular[0]?.usage_count || 0 : 0}
            prefix={<StarFilled style={{ color: '#faad14' }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #722ed1' }}>
          <Statistic
            title="System Templates"
            value={templates.filter(t => t.is_system).length || 0}
            prefix={<BookOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Template Card
  const renderTemplateCard = (template) => (
    <Card
      hoverable
      cover={
        <div style={{ 
          height: 200, 
          background: '#f5f5f5', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {template.preview_image ? (
            <img src={template.preview_image} alt={template.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
          )}
          {template.is_system && (
            <Tag color="gold" style={{ position: 'absolute', top: 8, right: 8 }}>
              System
            </Tag>
          )}
        </div>
      }
      actions={[
        <Tooltip title="Preview">
          <EyeOutlined onClick={() => { 
            setSelectedTemplate(template); 
            setPreviewVisible(true); 
          }} />
        </Tooltip>,
        <Tooltip title="Use Template">
          <CopyOutlined onClick={() => handleUseTemplate(template)} />
        </Tooltip>,
        <Tooltip title="Download">
          <DownloadOutlined onClick={() => handleExportTemplate(template)} />
        </Tooltip>,
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => {
                setSelectedTemplate(template);
                form.setFieldsValue(template);
                setEditModalVisible(true);
              }}>
                Edit
              </Menu.Item>
              <Menu.Item key="export" icon={<ExportOutlined />} onClick={() => handleExportTemplate(template)}>
                Export
              </Menu.Item>
              <Menu.Item key="duplicate" icon={<CopyOutlined />} onClick={() => {
                handleCreateTemplate({
                  ...template,
                  name: `${template.name} (Copy)`
                });
              }}>
                Duplicate
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
                Modal.confirm({
                  title: 'Delete Template',
                  content: `Are you sure you want to delete "${template.name}"?`,
                  onOk: () => handleDeleteTemplate(template.id)
                });
              }}>
                Delete
              </Menu.Item>
            </Menu>
          }
        >
          <Tooltip title="More Actions">
            <MoreOutlined />
          </Tooltip>
        </Dropdown>
      ]}
    >
      <Card.Meta
        title={
          <div>
            <span>{template.name}</span>
            {template.is_public && (
              <Tag color="blue" style={{ marginLeft: 8 }}>Public</Tag>
            )}
          </div>
        }
        description={
          <div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
              {template.description || 'No description'}
            </div>
            <div>
              <Tag color="blue">{template.document_type}</Tag>
              <Tag>{template.module || 'General'}</Tag>
              {template.category && <Tag color="cyan">{template.category}</Tag>}
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <Rate disabled defaultValue={template.rating || 0} style={{ fontSize: 12 }} />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                Used {template.usage_count || 0} times
              </span>
            </div>
          </div>
        }
      />
    </Card>
  );

  // Render Preview Modal
  const renderPreviewModal = () => (
    <Modal
      title={selectedTemplate?.name}
      open={previewVisible}
      onCancel={() => setPreviewVisible(false)}
      footer={[
        <Button key="close" onClick={() => setPreviewVisible(false)}>Close</Button>,
        <Button key="use" type="primary" onClick={() => {
          handleUseTemplate(selectedTemplate);
          setPreviewVisible(false);
        }}>
          Use Template
        </Button>
      ]}
      width={800}
    >
      {selectedTemplate && (
        <div>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Name">{selectedTemplate.name}</Descriptions.Item>
            <Descriptions.Item label="Type">{selectedTemplate.document_type}</Descriptions.Item>
            <Descriptions.Item label="Module">{selectedTemplate.module || 'General'}</Descriptions.Item>
            <Descriptions.Item label="Category">{selectedTemplate.category || 'Uncategorized'}</Descriptions.Item>
            <Descriptions.Item label="Created By">{selectedTemplate.created_by_name || 'Unknown'}</Descriptions.Item>
            <Descriptions.Item label="Created At">{formatDate(selectedTemplate.created_at)}</Descriptions.Item>
            <Descriptions.Item label="Usage">{selectedTemplate.usage_count || 0} times</Descriptions.Item>
            <Descriptions.Item label="Rating">
              <Rate disabled defaultValue={selectedTemplate.rating || 0} />
            </Descriptions.Item>
          </Descriptions>
          
          <Divider>Template Content</Divider>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: selectedTemplate.template_content || 'No content' 
            }} 
            style={{ 
              padding: 16, 
              background: '#fafafa', 
              borderRadius: 8,
              maxHeight: 400,
              overflow: 'auto'
            }}
          />
          
          {selectedTemplate.template_variables?.length > 0 && (
            <>
              <Divider>Variables</Divider>
              <Space>
                {selectedTemplate.template_variables.map(v => (
                  <Tag key={v} color="purple">{"{{"}{v}{"}}"}</Tag>
                ))}
              </Space>
            </>
          )}
        </div>
      )}
    </Modal>
  );

  // Render Create Template Modal
  const renderCreateModal = () => (
    <Modal
      title={<Space><PlusOutlined /> Create Template</Space>}
      open={createModalVisible}
      onCancel={() => {
        setCreateModalVisible(false);
        form.resetFields();
      }}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateTemplate}
        initialValues={{
          is_public: false,
          module: 'general',
          document_type: 'report'
        }}
      >
        <Form.Item
          name="name"
          label="Template Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="Enter template name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={2} placeholder="Brief description of the template" />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="document_type"
              label="Document Type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select placeholder="Select type">
                {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                  <Option key={key} value={key}>{value.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="module" label="Module">
              <Select placeholder="Select module">
                {MODULES.filter(m => m.value !== 'all').map(mod => (
                  <Option key={mod.value} value={mod.value}>{mod.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="category" label="Category">
              <Select placeholder="Select category" allowClear>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_public" label="Public Template" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="template_variables"
          label="Variables"
          extra="Comma-separated list of variables (e.g., company_name, date, author)"
        >
          <Input placeholder="e.g. company_name, date, author" />
        </Form.Item>

        <Form.Item
          name="template_content"
          label="Template Content"
          rules={[{ required: true, message: 'Please enter content' }]}
        >
          <TextArea rows={6} placeholder="HTML content of the template..." />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Create Template</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Import Modal
  const renderImportModal = () => (
    <Modal
      title={<Space><ImportOutlined /> Import Template</Space>}
      open={uploadModalVisible}
      onCancel={() => {
        setUploadModalVisible(false);
        setFileList([]);
      }}
      footer={null}
    >
      <Dragger
        fileList={fileList}
        onChange={({ fileList }) => setFileList(fileList)}
        beforeUpload={handleImportTemplate}
        accept=".json"
        maxCount={1}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Click or drag JSON file to import</p>
        <p className="ant-upload-hint">Export a template to get the JSON format</p>
      </Dragger>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="template-library" style={{ padding: embedded ? '0' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <BookOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
          <Title level={4} style={{ margin: 0 }}>Template Library</Title>
          <Badge status="processing" text={stats.total} />
        </Space>
        <Space>
          <Button icon={<ImportOutlined />} onClick={() => setUploadModalVisible(true)}>
            Import
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            New Template
          </Button>
        </Space>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      <div style={{ 
        background: 'white', 
        padding: '16px 20px', 
        borderRadius: '8px', 
        marginBottom: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Search templates..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => loadTemplates()}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={filters.category}
              onChange={(value) => setFilters({ ...filters, category: value })}
              style={{ width: '100%' }}
              allowClear
              placeholder="Category"
            >
              <Option value="all">All Categories</Option>
              {TEMPLATE_CATEGORIES.map(cat => (
                <Option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </Option>
              ))}
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
              {MODULES.map(mod => (
                <Option key={mod.value} value={mod.value}>{mod.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button icon={<ReloadOutlined />} onClick={loadTemplates} loading={loading}>
                Refresh
              </Button>
              <Button.Group>
                <Button 
                  icon={<AppstoreOutlined />} 
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                />
                <Button 
                  icon={<UnorderedListOutlined />} 
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                />
              </Button.Group>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading templates...</div>
        </div>
      ) : templates.length > 0 ? (
        <Row gutter={[16, 16]}>
          {templates.map(template => (
            <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
              {renderTemplateCard(template)}
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Empty 
            description="No templates available" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => setCreateModalVisible(true)}>
              Create First Template
            </Button>
          </Empty>
        </Card>
      )}

      {/* Modals */}
      {renderPreviewModal()}
      {renderCreateModal()}
      {renderImportModal()}

      {/* Edit Modal */}
      <Modal
        title={<Space><EditOutlined /> Edit Template</Space>}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateTemplate}
        >
          <Form.Item
            name="name"
            label="Template Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="Enter template name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Brief description of the template" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="document_type" label="Document Type">
                <Select placeholder="Select type">
                  {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                    <Option key={key} value={key}>{value.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="module" label="Module">
                <Select placeholder="Select module">
                  {MODULES.filter(m => m.value !== 'all').map(mod => (
                    <Option key={mod.value} value={mod.value}>{mod.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Select placeholder="Select category" allowClear>
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_public" label="Public Template" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="template_variables"
            label="Variables"
            extra="Comma-separated list of variables (e.g., company_name, date, author)"
          >
            <Input placeholder="e.g. company_name, date, author" />
          </Form.Item>

          <Form.Item
            name="template_content"
            label="Template Content"
          >
            <TextArea rows={6} placeholder="HTML content of the template..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Update Template</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateLibrary;