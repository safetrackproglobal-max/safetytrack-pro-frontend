// src/components/documents/DocumentSearch.jsx
// Advanced Search Component - Full-text search, saved searches, filters

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  List, Badge, Tooltip, Progress, Switch, Empty, Spin,
  Alert, Divider, Collapse, Typography, Checkbox, Radio,
  Slider, DatePicker, Tree, Cascader, Avatar, Skeleton
} from 'antd';
import {
  SearchOutlined,
  SaveOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilterOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  StarOutlined,
  StarFilled,
  HistoryOutlined,
  BookOutlined,
  PushpinOutlined,
  ClearOutlined,
  ExportOutlined,
  PlusOutlined,
  CloseOutlined,
  SettingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  BorderInnerOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './DocumentSearch.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const SEARCH_FILTERS = {
  status: ['draft', 'review', 'approved', 'published', 'archived', 'rejected'],
  modules: ['HSE', 'Environmental', 'Hospital', 'Quality', 'Supply Chain', 'Training', 'General'],
  document_types: ['report', 'policy', 'record', 'hse_report', 'incident_report', 'environmental_report', 'permit', 'hospital_record', 'quality_document', 'supply_chain', 'training_material', 'technical']
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentSearch = ({ 
  onResultSelect,
  companyId = null,
  embedded = false,
  initialQuery = ''
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Search State
  const [query, setQuery] = useState(initialQuery);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    module: [],
    document_type: [],
    date_range: null,
    tags: [],
    author: '',
    created_by: '',
    min_score: 0,
    max_score: 100
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('list');
  
  // UI State
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [saveSearchModalVisible, setSaveSearchModalVisible] = useState(false);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
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
    if (value.length > 500) {
      message.warning('Search text cannot exceed 500 characters');
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

  // ============================================================
  // SEARCH OPERATIONS
  // ============================================================
  
  const performSearch = useCallback(async (searchQuery = query, searchFilters = filters) => {
    // Validate search
    if (!searchQuery || searchQuery.trim().length < 2) {
      if (Object.keys(searchFilters).every(key => {
        if (key === 'date_range') return !searchFilters.date_range;
        if (key === 'min_score' || key === 'max_score') return true;
        return !searchFilters[key] || searchFilters[key].length === 0;
      })) {
        message.warning('Please enter a search query or select filters');
        return;
      }
    }
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const sanitizedQuery = sanitizeInput(searchQuery);
      
      const params = {
        q: sanitizedQuery || '*',
        ...searchFilters,
        sort_by: sortBy,
        company_id: companyId
      };
      
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
        if (Array.isArray(params[key]) && params[key].length === 0) {
          delete params[key];
        }
      });
      
      // Handle date range
      if (searchFilters.date_range && searchFilters.date_range.length === 2) {
        params.date_from = searchFilters.date_range[0].format('YYYY-MM-DD');
        params.date_to = searchFilters.date_range[1].format('YYYY-MM-DD');
        delete params.date_range;
      }
      
      const data = await documentService.globalSearch(params);
      
      const results = data.documents || data.data || [];
      setSearchResults(results);
      setTotalResults(data.total || results.length || 0);
      setSearchTime(Date.now() - startTime);
      
      // Add to search history
      if (searchQuery && searchQuery.trim().length >= 2) {
        addToHistory(searchQuery.trim());
      }
      
    } catch (error) {
      console.error('Search failed:', error);
      message.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, filters, sortBy, companyId]);

  const handleSearch = () => {
    if (!validateSearch(query)) {
      return;
    }
    performSearch();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.length > 500) {
      message.warning('Search text cannot exceed 500 characters');
      return;
    }
    setQuery(value);
  };

  // ============================================================
  // SAVED SEARCHES
  // ============================================================
  
  const saveSearch = async (values) => {
    if (!values.name || values.name.trim().length < 2) {
      message.warning('Please enter a name for the saved search (min 2 characters)');
      return;
    }
    
    if (values.name.length > 100) {
      message.warning('Name cannot exceed 100 characters');
      return;
    }
    
    try {
      await documentService.saveSearch(
        values.name.trim(),
        {
          query: query,
          filters: filters,
          sort_by: sortBy
        }
      );
      
      message.success('Search saved successfully');
      setSaveSearchModalVisible(false);
      form.resetFields();
      loadSavedSearches();
      
    } catch (error) {
      console.error('Failed to save search:', error);
      message.error(error.message || 'Failed to save search');
    }
  };

  const loadSavedSearches = useCallback(async () => {
    try {
      const data = await documentService.getSavedSearches();
      setSavedSearches(data.searches || []);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  }, []);

  const deleteSavedSearch = async (searchId) => {
    try {
      await documentService.deleteSavedSearch(searchId);
      message.success('Saved search deleted');
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      message.error(error.message || 'Failed to delete saved search');
    }
  };

  const loadSearchHistory = useCallback(async () => {
    try {
      const data = await documentService.getSearchHistory();
      setSearchHistory(data.history || []);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  const addToHistory = async (searchTerm) => {
    try {
      await documentService.addSearchHistory(searchTerm);
      loadSearchHistory();
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await documentService.clearSearchHistory();
      setSearchHistory([]);
      message.success('Search history cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      message.error('Failed to clear history');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
    loadSavedSearches();
    loadSearchHistory();
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const highlightText = (text, searchTerm) => {
    if (!text || !searchTerm) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

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

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Search Bar
  const renderSearchBar = () => (
    <div className="search-bar">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={advancedMode ? 24 : 16}>
          <Search
            placeholder="Search documents... (min 2 characters)"
            value={query}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            onPressEnter={handleSearch}
            enterButton={<SearchOutlined />}
            size="large"
            maxLength={500}
            loading={loading}
            allowClear
          />
        </Col>
        <Col xs={12} md={4}>
          <Space>
            <Button 
              icon={advancedMode ? <FilterOutlined /> : <FilterOutlined />}
              onClick={() => setAdvancedMode(!advancedMode)}
              type={advancedMode ? 'primary' : 'default'}
              size="large"
            >
              {advancedMode ? 'Simple' : 'Advanced'}
            </Button>
          </Space>
        </Col>
        <Col xs={12} md={4}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip title="Save Search">
              <Button 
                icon={<SaveOutlined />} 
                onClick={() => setSaveSearchModalVisible(true)}
                disabled={!query && !Object.values(filters).some(v => v && v.length > 0)}
                size="large"
              >
                Save
              </Button>
            </Tooltip>
            <Tooltip title="Search History">
              <Button 
                icon={<HistoryOutlined />} 
                onClick={() => setHistoryDrawerVisible(true)}
                size="large"
              />
            </Tooltip>
          </Space>
        </Col>
      </Row>
    </div>
  );

  // Render Advanced Filters
  const renderAdvancedFilters = () => (
    <Collapse 
      activeKey={advancedMode ? ['1'] : []}
      ghost
      className="advanced-filters"
    >
      <Panel header="Advanced Filters" key="1">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Status</Text>
            </div>
            <Select
              mode="multiple"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
              placeholder="Select statuses"
              allowClear
            >
              {SEARCH_FILTERS.status.map(status => (
                <Option key={status} value={status}>
                  <Tag color={getStatusColor(status)}>{status}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Module</Text>
            </div>
            <Select
              mode="multiple"
              value={filters.module}
              onChange={(value) => setFilters({ ...filters, module: value })}
              style={{ width: '100%' }}
              placeholder="Select modules"
              allowClear
            >
              {SEARCH_FILTERS.modules.map(module => (
                <Option key={module} value={module}>{module}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Document Type</Text>
            </div>
            <Select
              mode="multiple"
              value={filters.document_type}
              onChange={(value) => setFilters({ ...filters, document_type: value })}
              style={{ width: '100%' }}
              placeholder="Select types"
              allowClear
            >
              {SEARCH_FILTERS.document_types.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Date Range</Text>
            </div>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => setFilters({ ...filters, date_range: dates })}
              disabledDate={(current) => current && current > new Date()}
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Author</Text>
            </div>
            <Input
              placeholder="Search by author..."
              value={filters.author}
              onChange={(e) => setFilters({ ...filters, author: e.target.value })}
              maxLength={100}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Score Range</Text>
            </div>
            <Slider
              range
              min={0}
              max={100}
              value={[filters.min_score, filters.max_score]}
              onChange={(value) => setFilters({ 
                ...filters, 
                min_score: value[0], 
                max_score: value[1] 
              })}
              marks={{
                0: '0%',
                50: '50%',
                100: '100%'
              }}
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Sort By</Text>
            </div>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              {SORT_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Space>
              <Button type="primary" onClick={handleSearch} loading={loading}>
                <SearchOutlined /> Search
              </Button>
              <Button onClick={() => {
                setFilters({
                  status: [],
                  module: [],
                  document_type: [],
                  date_range: null,
                  tags: [],
                  author: '',
                  created_by: '',
                  min_score: 0,
                  max_score: 100
                });
                setQuery('');
                setSearchResults([]);
                setTotalResults(0);
                message.info('Filters cleared');
              }}>
                <ClearOutlined /> Clear All
              </Button>
            </Space>
          </Col>
        </Row>
      </Panel>
    </Collapse>
  );

  // Render Search Results
  const renderResults = () => {
    if (loading) {
      return (
        <div style={{ padding: '24px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      );
    }

    if (searchResults.length === 0 && (query || Object.values(filters).some(v => v && v.length > 0))) {
      return (
        <Empty 
          description="No results found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleSearch}>
            Try Again
          </Button>
        </Empty>
      );
    }

    if (searchResults.length === 0) {
      return (
        <Empty 
          description="Enter a search query to find documents"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16,
          padding: '8px 16px',
          background: '#fafafa',
          borderRadius: 8
        }}>
          <Space>
            <Text strong>{totalResults} results</Text>
            <Text type="secondary">({searchTime}ms)</Text>
          </Space>
          <Space>
            <Button.Group>
              <Button 
                icon={<UnorderedListOutlined />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              />
              <Button 
                icon={<AppstoreOutlined />}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              />
            </Button.Group>
          </Space>
        </div>

        {viewMode === 'list' ? (
          <List
            dataSource={searchResults}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedDocument(item);
                      setDetailDrawerVisible(true);
                    }}
                  >
                    View
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <FileTextOutlined style={{ 
                      fontSize: 24, 
                      color: '#1890ff',
                      padding: '8px'
                    }} />
                  }
                  title={
                    <div>
                      <a onClick={() => {
                        setSelectedDocument(item);
                        setDetailDrawerVisible(true);
                      }}>
                        <span 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(item.title, query) 
                          }} 
                        />
                      </a>
                      <Space style={{ marginLeft: 8 }}>
                        <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                        <Tag>{item.module || 'General'}</Tag>
                        {item.score && (
                          <Tooltip title="Relevance Score">
                            <Tag color="blue">{Math.round(item.score * 100)}%</Tag>
                          </Tooltip>
                        )}
                      </Space>
                    </div>
                  }
                  description={
                    <div>
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: item.description ? highlightText(item.description, query) : 'No description'
                        }} 
                        style={{ marginBottom: 4 }}
                      />
                      <Space size="middle">
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                          Updated: {formatDate(item.updated_at)}
                        </span>
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                          By: {item.created_by?.name || item.created_by || 'Unknown'}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <span>
                            {item.tags.slice(0, 3).map(tag => (
                              <Tag key={tag} size="small">{tag}</Tag>
                            ))}
                            {item.tags.length > 3 && (
                              <Tag>+{item.tags.length - 3}</Tag>
                            )}
                          </span>
                        )}
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {searchResults.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.id}>
                <Card
                  hoverable
                  size="small"
                  onClick={() => {
                    setSelectedDocument(item);
                    setDetailDrawerVisible(true);
                  }}
                  className="result-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                    <div style={{ fontWeight: 500, flex: 1 }}>
                      <span 
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(item.title, query) 
                        }} 
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: item.description ? highlightText(item.description, query).substring(0, 100) + '...' : 'No description'
                      }} 
                    />
                  </div>
                  <div>
                    <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                    <Tag>{item.module || 'General'}</Tag>
                    {item.score && (
                      <Tag color="blue">{Math.round(item.score * 100)}%</Tag>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 8 }}>
                    {formatDate(item.updated_at)}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    );
  };

  // Render Save Search Modal
  const renderSaveSearchModal = () => (
    <Modal
      title={<Space><SaveOutlined /> Save Search</Space>}
      open={saveSearchModalVisible}
      onCancel={() => {
        setSaveSearchModalVisible(false);
        form.resetFields();
      }}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={saveSearch}
      >
        <Form.Item
          name="name"
          label="Search Name"
          rules={[
            { required: true, message: 'Please enter a name for this search' },
            { min: 2, message: 'Name must be at least 2 characters' },
            { max: 100, message: 'Name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="e.g. Critical Incidents Q1 2024" maxLength={100} />
        </Form.Item>

        <Form.Item label="Search Details">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Query">
              {query || 'All documents'}
            </Descriptions.Item>
            <Descriptions.Item label="Filters">
              {Object.entries(filters).filter(([key, value]) => {
                if (key === 'date_range' && value) return true;
                if (key === 'min_score' || key === 'max_score') return false;
                if (Array.isArray(value) && value.length > 0) return true;
                if (typeof value === 'string' && value) return true;
                return false;
              }).length > 0 ? (
                <div>
                  {filters.status && filters.status.length > 0 && (
                    <div>Status: {filters.status.join(', ')}</div>
                  )}
                  {filters.module && filters.module.length > 0 && (
                    <div>Module: {filters.module.join(', ')}</div>
                  )}
                  {filters.date_range && (
                    <div>Date: {filters.date_range[0]?.format('YYYY-MM-DD')} to {filters.date_range[1]?.format('YYYY-MM-DD')}</div>
                  )}
                </div>
              ) : (
                'No filters applied'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Sort By">
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Relevance'}
            </Descriptions.Item>
          </Descriptions>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setSaveSearchModalVisible(false);
              form.resetFields();
            }}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Search
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render History Drawer
  const renderHistoryDrawer = () => (
    <Drawer
      title={<Space><HistoryOutlined /> Search History</Space>}
      open={historyDrawerVisible}
      onClose={() => setHistoryDrawerVisible(false)}
      width={500}
      extra={
        <Popconfirm
          title="Clear all search history?"
          onConfirm={clearHistory}
          okText="Yes"
          cancelText="No"
        >
          <Button danger size="small" icon={<DeleteOutlined />}>
            Clear All
          </Button>
        </Popconfirm>
      }
    >
      {searchHistory.length > 0 ? (
        <List
          dataSource={searchHistory}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setQuery(item.term);
                    performSearch(item.term);
                    setHistoryDrawerVisible(false);
                  }}
                >
                  Search
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<ClockCircleOutlined />}
                title={item.term}
                description={formatDate(item.searched_at)}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No search history" />
      )}
    </Drawer>
  );

  // Render Detail Drawer
  const renderDetailDrawer = () => (
    <Drawer
      title={<Space><FileTextOutlined /> Document Details</Space>}
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={600}
    >
      {selectedDocument && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Title">
              <Text strong>{selectedDocument.title}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedDocument.description || 'No description'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedDocument.status)}>{selectedDocument.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Module">
              {selectedDocument.module || 'General'}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {selectedDocument.document_type || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Version">
              v{selectedDocument.version || 1}
            </Descriptions.Item>
            <Descriptions.Item label="Updated">
              {formatDate(selectedDocument.updated_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {formatDate(selectedDocument.created_at)}
            </Descriptions.Item>
            {selectedDocument.tags && selectedDocument.tags.length > 0 && (
              <Descriptions.Item label="Tags">
                {selectedDocument.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Descriptions.Item>
            )}
            {selectedDocument.score && (
              <Descriptions.Item label="Relevance Score">
                <Progress 
                  percent={Math.round(selectedDocument.score * 100)} 
                  size="small"
                  strokeColor="#1890ff"
                />
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button 
              type="primary" 
              onClick={() => {
                if (onResultSelect) {
                  onResultSelect(selectedDocument);
                }
                setDetailDrawerVisible(false);
              }}
            >
              View Full Document
            </Button>
          </Space>
        </div>
      )}
    </Drawer>
  );

  // Render Saved Searches
  const renderSavedSearches = () => (
    <div className="saved-searches" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StarOutlined style={{ color: '#faad14' }} />
        <Text strong>Saved Searches</Text>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {savedSearches.map((search) => (
          <Tag
            key={search.id}
            closable
            onClose={() => deleteSavedSearch(search.id)}
            style={{ 
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: '16px',
              background: '#f0f5ff',
              borderColor: '#d6e4ff'
            }}
            onClick={() => {
              setQuery(search.filters.query || '');
              setFilters(search.filters.filters || filters);
              setSortBy(search.filters.sort_by || sortBy);
              performSearch(search.filters.query || '', search.filters.filters || filters);
            }}
          >
            <StarFilled style={{ color: '#faad14', marginRight: 4 }} />
            {search.name}
          </Tag>
        ))}
        {savedSearches.length === 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            No saved searches. Click "Save" to save a search.
          </Text>
        )}
      </div>
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="document-search">
      {/* Header */}
      <div className="search-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <SearchOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Advanced Document Search</Title>
            <Badge status="processing" text="Live" />
          </Space>
        </div>
      </div>

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Saved Searches */}
      {renderSavedSearches()}

      {/* Advanced Filters */}
      {renderAdvancedFilters()}

      {/* Results */}
      {renderResults()}

      {/* Modals & Drawers */}
      {renderSaveSearchModal()}
      {renderHistoryDrawer()}
      {renderDetailDrawer()}
    </div>
  );
};

export default DocumentSearch;