// src/components/documents/AdvancedSearch.jsx
// Full-text + Boolean search with faceted filters, saved searches,
// search alerts, and did-you-mean suggestions

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Checkbox, Radio, Slider, DatePicker, InputNumber, Segmented,
  Statistic, Result, Steps, Tree, Cascader, AutoComplete,
  TreeSelect, Transfer, Anchor, FloatButton, Affix, Pagination
} from 'antd';
import {
  SearchOutlined, FilterOutlined, FileTextOutlined,
  FilePdfOutlined, FileWordOutlined, FileExcelOutlined,
  FileImageOutlined, FileOutlined, EyeOutlined, DownloadOutlined,
  StarOutlined, StarFilled, HistoryOutlined, SaveOutlined,
  BellOutlined, CloseOutlined, ClearOutlined, ReloadOutlined,
  SettingOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
  CopyOutlined, ThunderboltOutlined, BulbOutlined,
  RocketOutlined, FireOutlined, WarningOutlined, InfoCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  UserOutlined, TeamOutlined, CalendarOutlined, TagsOutlined,
  AppstoreOutlined, UnorderedListOutlined, BarsOutlined,
  SortAscendingOutlined, SortDescendingOutlined, SwapOutlined,
  HighlightOutlined, CodeOutlined, DatabaseOutlined,
  GlobalOutlined, EnvironmentOutlined, SafetyOutlined,
  AuditOutlined, RobotOutlined, ExperimentOutlined,
  CompassOutlined, LineChartOutlined, PieChartOutlined,
  BarChartOutlined, FundOutlined, DeploymentUnitOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './AdvancedSearch.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea, Search } = Input;
const { RangePicker } = DatePicker;

// ============================================================
// CONSTANTS
// ============================================================

const SEARCH_MODES = {
  fulltext: { label: 'Full-Text', icon: <SearchOutlined />, description: 'Search inside documents' },
  metadata: { label: 'Metadata', icon: <DatabaseOutlined />, description: 'Search by attributes' },
  boolean: { label: 'Boolean', icon: <CodeOutlined />, description: 'Advanced query syntax' },
  semantic: { label: 'Semantic (AI)', icon: <RobotOutlined />, description: 'AI-powered meaning search' }
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance', icon: <FireOutlined /> },
  { value: 'date_desc', label: 'Newest First', icon: <SortDescendingOutlined /> },
  { value: 'date_asc', label: 'Oldest First', icon: <SortAscendingOutlined /> },
  { value: 'title_asc', label: 'Title A-Z', icon: <SortAscendingOutlined /> },
  { value: 'title_desc', label: 'Title Z-A', icon: <SortDescendingOutlined /> },
  { value: 'size_desc', label: 'Largest First', icon: <SortDescendingOutlined /> },
  { value: 'score_desc', label: 'Highest Score', icon: <LineChartOutlined /> }
];

const FACET_CATEGORIES = {
  document_type: { label: 'Document Type', icon: <FileTextOutlined /> },
  module: { label: 'Module', icon: <AppstoreOutlined /> },
  status: { label: 'Status', icon: <CheckCircleOutlined /> },
  category: { label: 'Category', icon: <TagsOutlined /> },
  tags: { label: 'Tags', icon: <TagsOutlined /> },
  created_by: { label: 'Author', icon: <UserOutlined /> },
  department: { label: 'Department', icon: <TeamOutlined /> },
  year: { label: 'Year', icon: <CalendarOutlined /> },
  sensitivity: { label: 'Sensitivity', icon: <SafetyOutlined /> }
};

const BOOLEAN_OPERATORS = [
  { symbol: 'AND', label: 'AND', description: 'Both terms must match' },
  { symbol: 'OR', label: 'OR', description: 'Either term can match' },
  { symbol: 'NOT', label: 'NOT', description: 'Exclude this term' },
  { symbol: '""', label: 'Phrase', description: 'Exact phrase match' },
  { symbol: '()', label: 'Group', description: 'Group terms together' },
  { symbol: '*', label: 'Wildcard', description: 'Match any characters' },
  { symbol: '~', label: 'Fuzzy', description: 'Approximate match' },
  { symbol: 'field:', label: 'Field', description: 'Search specific field' }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const AdvancedSearch = ({
  companyId = null,
  embedded = false,
  onResultSelect = null
}) => {
  const { user } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('fulltext');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState({});
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [didYouMean, setDidYouMean] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchAlerts, setSearchAlerts] = useState([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState('results');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filtersDrawer, setFiltersDrawer] = useState(false);
  const [saveSearchModal, setSaveSearchModal] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    document_type: [],
    module: [],
    status: [],
    category: [],
    tags: [],
    created_by: [],
    department: [],
    year: [],
    sensitivity: [],
    date_range: null,
    size_range: [0, 100],
    score_min: 0
  });
  
  // Boolean mode
  const [booleanQuery, setBooleanQuery] = useState('');
  
  // Search suggestions
  const [querySuggestions, setQuerySuggestions] = useState([]);

  // Refs
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadSearchHistory = useCallback(async () => {
    try {
      const data = await documentService.getSearchHistory({ limit: 20 });
      setSearchHistory(data.history || []);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);
  
  const loadSavedSearches = useCallback(async () => {
    try {
      const data = await documentService.getSavedSearches();
      setSavedSearches(data.searches || []);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  }, []);
  
  const loadSearchAlerts = useCallback(async () => {
    try {
      const data = await documentService.getSearchAlerts();
      setSearchAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to load search alerts:', error);
    }
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================
  
  const performSearch = useCallback(async (searchQuery = query, searchFilters = filters, searchModeOverride = null) => {
    const mode = searchModeOverride || searchMode;
    const activeQuery = mode === 'boolean' ? booleanQuery : searchQuery;
    
    // Validation
    if (!activeQuery || activeQuery.trim().length < 2) {
      const hasFilters = Object.keys(searchFilters).some(key => {
        const val = searchFilters[key];
        if (key === 'date_range') return !!val;
        if (key === 'size_range') return false;
        if (key === 'score_min') return false;
        return Array.isArray(val) && val.length > 0;
      });
      
      if (!hasFilters) {
        message.warning('Please enter a search query (min 2 characters)');
        return;
      }
    }
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const params = {
        q: activeQuery?.trim() || '*',
        mode,
        sort_by: sortBy,
        page,
        limit: pageSize,
        company_id: companyId,
        ...searchFilters
      };
      
      // Handle date range
      if (searchFilters.date_range && searchFilters.date_range.length === 2) {
        params.date_from = searchFilters.date_range[0].format('YYYY-MM-DD');
        params.date_to = searchFilters.date_range[1].format('YYYY-MM-DD');
        delete params.date_range;
      }
      
      // Handle size range
      if (searchFilters.size_range) {
        params.size_min = searchFilters.size_range[0] * 1024;
        params.size_max = searchFilters.size_range[1] * 1024 * 1024;
        delete params.size_range;
      }
      
      const data = await documentService.advancedSearch(params);
      
      setResults(data.results || []);
      setTotalResults(data.total || 0);
      setFacets(data.facets || {});
      setSearchTime(Date.now() - startTime);
      setDidYouMean(data.did_you_mean || null);
      
      // Add to history
      if (activeQuery && activeQuery.trim().length >= 2) {
        addToHistory(activeQuery.trim());
      }
      
    } catch (error) {
      console.error('Search failed:', error);
      message.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, booleanQuery, filters, searchMode, sortBy, page, pageSize, companyId]);
  
  const handleSearch = () => {
    setPage(1);
    performSearch();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };
  
  const addToHistory = async (searchTerm) => {
    try {
      await documentService.addSearchHistory(searchTerm);
      loadSearchHistory();
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  };
  
  // Get suggestions as user types
  const handleQueryChange = (value) => {
    if (searchMode === 'boolean') {
      setBooleanQuery(value);
    } else {
      setQuery(value);
    }
    
    // Get suggestions with debounce
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const data = await documentService.getSearchSuggestions(value, { limit: 8 });
          setQuerySuggestions(data.suggestions || []);
        } catch (error) {
          // Silent fail
        }
      }, 300);
    } else {
      setQuerySuggestions([]);
    }
  };

  // ============================================================
  // SAVED SEARCHES & ALERTS
  // ============================================================
  
  const handleSaveSearch = async (values) => {
    if (!values.name || values.name.trim().length < 2) {
      message.warning('Please enter a name (min 2 characters)');
      return;
    }
    
    try {
      await documentService.saveSearch({
        name: values.name.trim(),
        query: searchMode === 'boolean' ? booleanQuery : query,
        mode: searchMode,
        filters,
        sort_by: sortBy,
        notify_on_new: values.notify_on_new || false,
        notification_frequency: values.notification_frequency || 'daily'
      });
      
      message.success('Search saved');
      setSaveSearchModal(false);
      loadSavedSearches();
      
    } catch (error) {
      console.error('Failed to save search:', error);
      message.error('Failed to save search');
    }
  };
  
  const handleLoadSavedSearch = (saved) => {
    setQuery(saved.query || '');
    if (saved.mode) setSearchMode(saved.mode);
    if (saved.filters) setFilters(saved.filters);
    if (saved.sort_by) setSortBy(saved.sort_by);
    setActiveTab('results');
    setTimeout(() => performSearch(saved.query, saved.filters, saved.mode), 100);
  };
  
  const handleDeleteSavedSearch = async (searchId) => {
    try {
      await documentService.deleteSavedSearch(searchId);
      message.success('Saved search deleted');
      loadSavedSearches();
    } catch (error) {
      message.error('Failed to delete saved search');
    }
  };
  
  const handleCreateAlert = async (values) => {
    try {
      await documentService.createSearchAlert({
        name: values.name,
        query: query || booleanQuery,
        mode: searchMode,
        filters,
        frequency: values.frequency || 'daily',
        recipients: values.recipients || [user?.email],
        company_id: companyId
      });
      
      message.success('Search alert created');
      setAlertModal(false);
      loadSearchAlerts();
      
    } catch (error) {
      console.error('Failed to create alert:', error);
      message.error('Failed to create search alert');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadSearchHistory();
    loadSavedSearches();
    loadSearchAlerts();
  }, [loadSearchHistory, loadSavedSearches, loadSearchAlerts]);
  
  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getFileIcon = (fileName, mimeType) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return <FilePdfOutlined style={{ color: '#f5222d', fontSize: 20 }} />;
      case 'doc':
      case 'docx': return <FileWordOutlined style={{ color: '#1890ff', fontSize: 20 }} />;
      case 'xls':
      case 'xlsx': return <FileExcelOutlined style={{ color: '#52c41a', fontSize: 20 }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FileImageOutlined style={{ color: '#faad14', fontSize: 20 }} />;
      default: return <FileOutlined style={{ fontSize: 20 }} />;
    }
  };
  
  const highlightText = (text, term) => {
    if (!text || !term) return text;
    try {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) => 
        regex.test(part) 
          ? <mark key={i} style={{ background: '#ffe58f', padding: '0 2px' }}>{part}</mark>
          : part
      );
    } catch {
      return text;
    }
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid';
    }
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderSearchBar = () => (
    <Card size="small" className="search-bar-card">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Search Mode */}
        <Segmented
          value={searchMode}
          onChange={(value) => {
            setSearchMode(value);
            if (value === 'boolean') {
              setQuery(booleanQuery || query);
            } else {
              setBooleanQuery('');
            }
          }}
          options={Object.entries(SEARCH_MODES).map(([key, value]) => ({
            label: (
              <Tooltip title={value.description}>
                <Space size={4}>
                  {value.icon}
                  <span>{value.label}</span>
                </Space>
              </Tooltip>
            ),
            value: key
          }))}
          block
        />
        
        {/* Search Input */}
        <div className="search-input-wrapper">
          <AutoComplete
            value={searchMode === 'boolean' ? booleanQuery : query}
            options={querySuggestions.map(s => ({ value: s, label: s }))}
            onChange={handleQueryChange}
            style={{ width: '100%' }}
          >
            <Input
              ref={inputRef}
              size="large"
              placeholder={
                searchMode === 'boolean'
                  ? 'e.g., (safety AND report) NOT "draft"'
                  : searchMode === 'semantic'
                    ? 'Describe what you\'re looking for...'
                    : 'Search across all documents... (Ctrl+K)'
              }
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              suffix={
                <Space>
                  {(query || booleanQuery) && (
                    <CloseOutlined
                      style={{ cursor: 'pointer', color: '#8c8c8c' }}
                      onClick={() => {
                        setQuery('');
                        setBooleanQuery('');
                        setResults([]);
                      }}
                    />
                  )}
                  <Button
                    type="primary"
                    onClick={handleSearch}
                    loading={loading}
                    icon={<SearchOutlined />}
                  >
                    Search
                  </Button>
                </Space>
              }
              onKeyDown={handleKeyDown}
              allowClear={false}
            />
          </AutoComplete>
        </div>
        
        {/* Boolean Help */}
        {searchMode === 'boolean' && (
          <div className="boolean-help">
            <Text type="secondary" style={{ fontSize: 11 }}>
              Operators:
            </Text>
            <Space wrap size={[4, 4]}>
              {BOOLEAN_OPERATORS.map(op => (
                <Tooltip key={op.symbol} title={op.description}>
                  <Tag
                    style={{ cursor: 'pointer', fontSize: 11 }}
                    onClick={() => {
                      setBooleanQuery(prev => prev + ' ' + op.symbol);
                      inputRef.current?.focus();
                    }}
                  >
                    {op.symbol}
                  </Tag>
                </Tooltip>
              ))}
            </Space>
          </div>
        )}
        
        {/* Quick actions */}
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersDrawer(true)}
              >
                Filters
                {Object.values(filters).some(v => 
                  Array.isArray(v) && v.length > 0 || 
                  (v && typeof v === 'object' && !Array.isArray(v))
                ) && (
                  <Badge count={
                    Object.values(filters).filter(v => 
                      Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined
                    ).length
                  } 
                  size="small" 
                  style={{ marginLeft: 4 }} />
                )}
              </Button>
              <Button
                icon={<StarOutlined />}
                onClick={() => setSaveSearchModal(true)}
                disabled={!query && !booleanQuery}
              >
                Save
              </Button>
              <Button
                icon={<BellOutlined />}
                onClick={() => setAlertModal(true)}
                disabled={!query && !booleanQuery}
              >
                Alert
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Sort:
              </Text>
              <Select
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value);
                  if (results.length > 0) setTimeout(() => performSearch(), 100);
                }}
                style={{ width: 160 }}
                size="small"
              >
                {SORT_OPTIONS.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    <Space>
                      {opt.icon}
                      {opt.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>
      </Space>
    </Card>
  );
  
  const renderDidYouMean = () => {
    if (!didYouMean) return null;
    
    return (
      <Alert
        message={
          <Space>
            <BulbOutlined style={{ color: '#faad14' }} />
            <span>Did you mean:</span>
            <Button
              type="link"
              size="small"
              onClick={() => {
                setQuery(didYouMean);
                setTimeout(() => performSearch(didYouMean), 100);
              }}
              style={{ padding: 0, height: 'auto' }}
            >
              <strong>{didYouMean}</strong>
            </Button>
          </Space>
        }
        type="info"
        showIcon={false}
        style={{ marginBottom: 16 }}
        closable
      />
    );
  };
  
  const renderResultsHeader = () => (
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <Space>
          <Text strong>{totalResults.toLocaleString()} results</Text>
          <Text type="secondary">({searchTime}ms)</Text>
          {filters && Object.values(filters).some(v => Array.isArray(v) && v.length > 0) && (
            <Tag color="blue">Filtered</Tag>
          )}
        </Space>
      </Col>
      <Col>
        <Space>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'list', icon: <UnorderedListOutlined /> },
              { value: 'grid', icon: <AppstoreOutlined /> },
              { value: 'compact', icon: <BarsOutlined /> }
            ]}
            size="small"
          />
        </Space>
      </Col>
    </Row>
  );
  
  const renderResultItem = (item) => {
    const titleHighlight = highlightText(item.title, query);
    const descriptionHighlight = highlightText(
      item.snippet || item.description || '',
      query
    );
    
    return (
      <Card
        key={item.id}
        hoverable
        size="small"
        className="search-result-card"
        style={{ marginBottom: 12 }}
        onClick={() => {
          setSelectedResult(item);
          setDetailDrawer(true);
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {getFileIcon(item.file_name, item.mime_type)}
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                  {titleHighlight}
                </div>
                <Space size={[4, 4]} wrap>
                  {item.document_type && (
                    <Tag color="blue" style={{ fontSize: 10 }}>
                      {item.document_type}
                    </Tag>
                  )}
                  {item.module && (
                    <Tag style={{ fontSize: 10 }}>{item.module}</Tag>
                  )}
                  {item.status && (
                    <Tag 
                      color={item.status === 'published' ? 'green' : 'default'}
                      style={{ fontSize: 10 }}
                    >
                      {item.status}
                    </Tag>
                  )}
                  {item.score !== undefined && (
                    <Tooltip title="Relevance score">
                      <Tag color="orange" style={{ fontSize: 10 }}>
                        {Math.round(item.score * 100)}%
                      </Tag>
                    </Tooltip>
                  )}
                </Space>
              </div>
              <Space size={4}>
                <Tooltip title="Save">
                  <Button
                    type="text"
                    size="small"
                    icon={item.is_saved ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle save
                    }}
                  />
                </Tooltip>
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedResult(item);
                    setDetailDrawer(true);
                  }}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    documentService.downloadDocument(item.id);
                  }}
                />
              </Space>
            </div>
            
            {descriptionHighlight && (
              <div 
                style={{ 
                  fontSize: 12, 
                  color: '#595959', 
                  marginBottom: 8,
                  lineHeight: 1.5,
                  maxHeight: 40,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {descriptionHighlight}
              </div>
            )}
            
            <Space split={<Divider type="vertical" />} style={{ fontSize: 11, color: '#8c8c8c' }}>
              <span><UserOutlined /> {item.created_by_name || 'Unknown'}</span>
              <span><CalendarOutlined /> {formatDate(item.updated_at)}</span>
              <span>{formatFileSize(item.file_size)}</span>
              {item.page_count && (
                <span>{item.page_count} pages</span>
              )}
            </Space>
          </div>
        </div>
      </Card>
    );
  };
  
  const renderResults = () => {
    if (loading && results.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Searching...</div>
        </div>
      );
    }
    
    if (results.length === 0) {
      if (!query && !booleanQuery && Object.values(filters).every(v => 
        Array.isArray(v) ? v.length === 0 : !v
      )) {
        return (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={5}>Search Documents</Title>
                  <Text type="secondary">
                    Enter a search term or use filters to find documents
                  </Text>
                  <div style={{ marginTop: 16 }}>
                    <Space wrap>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Try searching for:
                      </Text>
                      {['safety report', 'permit', 'incident', 'SDS'].map(term => (
                        <Tag
                          key={term}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setQuery(term);
                            setTimeout(() => performSearch(term), 100);
                          }}
                        >
                          {term}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              }
            />
          </Card>
        );
      }
      
      return (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={5}>No results found</Title>
                <Text type="secondary">
                  Try different keywords or adjust your filters
                </Text>
              </div>
            }
          >
            <Space>
              <Button
                icon={<ClearOutlined />}
                onClick={() => {
                  setQuery('');
                  setBooleanQuery('');
                  setFilters({
                    document_type: [],
                    module: [],
                    status: [],
                    category: [],
                    tags: [],
                    created_by: [],
                    department: [],
                    year: [],
                    sensitivity: [],
                    date_range: null,
                    size_range: [0, 100],
                    score_min: 0
                  });
                  setResults([]);
                }}
              >
                Clear Filters
              </Button>
            </Space>
          </Empty>
        </Card>
      );
    }
    
    if (viewMode === 'grid') {
      return (
        <Row gutter={[16, 16]}>
          {results.map(item => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                hoverable
                size="small"
                onClick={() => {
                  setSelectedResult(item);
                  setDetailDrawer(true);
                }}
                style={{ height: '100%', cursor: 'pointer' }}
              >
                <div style={{ marginBottom: 8 }}>
                  {getFileIcon(item.file_name, item.mime_type)}
                </div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {highlightText(item.title, query)}
                </div>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 8 }}>
                  {item.module} • {formatDate(item.updated_at)}
                </div>
                <Space size={[4, 4]} wrap>
                  {item.document_type && (
                    <Tag color="blue" style={{ fontSize: 10 }}>{item.document_type}</Tag>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    
    return (
      <div className="search-results">
        {results.map(renderResultItem)}
      </div>
    );
  };
  
  const renderPagination = () => {
    if (totalResults <= pageSize) return null;
    
    return (
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={totalResults}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `Total ${total} documents`}
          pageSizeOptions={['10', '20', '50', '100']}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
            setTimeout(() => performSearch(), 100);
          }}
        />
      </div>
    );
  };
  
  const renderFiltersPanel = () => (
    <div className="filters-panel">
      <Divider orientation="left" style={{ margin: '12px 0' }}>Document Type</Divider>
      <Checkbox.Group
        value={filters.document_type}
        onChange={(v) => setFilters({ ...filters, document_type: v })}
        style={{ width: '100%' }}
      >
        <Row gutter={[8, 8]}>
          {['report', 'policy', 'permit', 'certificate', 'incident_report', 'sds'].map(type => (
            <Col span={12} key={type}>
              <Checkbox value={type}>
                <span style={{ fontSize: 12 }}>{type}</span>
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
      
      <Divider orientation="left" style={{ margin: '12px 0' }}>Module</Divider>
      <Checkbox.Group
        value={filters.module}
        onChange={(v) => setFilters({ ...filters, module: v })}
        style={{ width: '100%' }}
      >
        <Row gutter={[8, 8]}>
          {['HSE', 'Environmental', 'Quality', 'Hospital', 'Training'].map(mod => (
            <Col span={12} key={mod}>
              <Checkbox value={mod}>
                <span style={{ fontSize: 12 }}>{mod}</span>
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
      
      <Divider orientation="left" style={{ margin: '12px 0' }}>Status</Divider>
      <Checkbox.Group
        value={filters.status}
        onChange={(v) => setFilters({ ...filters, status: v })}
        style={{ width: '100%' }}
      >
        <Row gutter={[8, 8]}>
          {['draft', 'review', 'approved', 'published', 'archived'].map(s => (
            <Col span={12} key={s}>
              <Checkbox value={s}>
                <span style={{ fontSize: 12 }}>{s}</span>
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
      
      <Divider orientation="left" style={{ margin: '12px 0' }}>Date Range</Divider>
      <RangePicker
        value={filters.date_range}
        onChange={(dates) => setFilters({ ...filters, date_range: dates })}
        style={{ width: '100%' }}
        size="small"
      />
      
      <Divider orientation="left" style={{ margin: '12px 0' }}>File Size (MB)</Divider>
      <Slider
        range
        value={filters.size_range}
        onChange={(value) => setFilters({ ...filters, size_range: value })}
        min={0}
        max={100}
        marks={{ 0: '0', 50: '50', 100: '100+' }}
      />
      
      <Divider orientation="left" style={{ margin: '12px 0' }}>Minimum Score</Divider>
      <Slider
        value={filters.score_min}
        onChange={(value) => setFilters({ ...filters, score_min: value })}
        min={0}
        max={100}
        marks={{ 0: '0%', 50: '50%', 100: '100%' }}
      />
      
      <Divider />
      
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button
          size="small"
          onClick={() => setFilters({
            document_type: [],
            module: [],
            status: [],
            category: [],
            tags: [],
            created_by: [],
            department: [],
            year: [],
            sensitivity: [],
            date_range: null,
            size_range: [0, 100],
            score_min: 0
          })}
        >
          Clear All
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setPage(1);
            performSearch();
            if (embedded) setFiltersDrawer(false);
          }}
        >
          Apply Filters
        </Button>
      </Space>
    </div>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderSaveSearchModal = () => (
    <Modal
      title={
        <Space>
          <StarOutlined />
          <span>Save Search</span>
        </Space>
      }
      open={saveSearchModal}
      onCancel={() => setSaveSearchModal(false)}
      footer={null}
      width={500}
    >
      <Form layout="vertical" onFinish={handleSaveSearch}>
        <Form.Item
          name="name"
          label="Search Name"
          rules={[
            { required: true, message: 'Please enter a name' },
            { min: 2, message: 'Name must be at least 2 characters' }
          ]}
        >
          <Input placeholder="e.g., Critical Safety Reports" maxLength={100} />
        </Form.Item>
        
        <Form.Item label="Search Details">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Query">
              <Text code>{query || booleanQuery || '(no query)'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mode">
              <Tag>{SEARCH_MODES[searchMode]?.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Filters">
              {Object.values(filters).filter(v => 
                Array.isArray(v) ? v.length > 0 : v
              ).length > 0 ? (
                <Tag color="blue">
                  {Object.values(filters).filter(v => 
                    Array.isArray(v) ? v.length > 0 : v
                  ).length} active
                </Tag>
              ) : (
                <Text type="secondary">None</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setSaveSearchModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Search
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderAlertModal = () => (
    <Modal
      title={
        <Space>
          <BellOutlined />
          <span>Create Search Alert</span>
        </Space>
      }
      open={alertModal}
      onCancel={() => setAlertModal(false)}
      footer={null}
      width={500}
    >
      <Alert
        message="Get Notified"
        description="You'll receive notifications when new documents match this search."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form layout="vertical" onFinish={handleCreateAlert}>
        <Form.Item
          name="name"
          label="Alert Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="e.g., New Safety Reports" />
        </Form.Item>
        
        <Form.Item
          name="frequency"
          label="Notification Frequency"
          initialValue="daily"
        >
          <Radio.Group>
            <Radio value="realtime">Real-time</Radio>
            <Radio value="daily">Daily Digest</Radio>
            <Radio value="weekly">Weekly Summary</Radio>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item name="recipients" label="Recipients">
          <Select
            mode="tags"
            placeholder="Enter email addresses"
            style={{ width: '100%' }}
            defaultValue={user?.email ? [user.email] : []}
          />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setAlertModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<BellOutlined />}>
              Create Alert
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderDetailDrawer = () => (
    <Drawer
      title={
        <Space>
          {selectedResult && getFileIcon(selectedResult.file_name)}
          <span>{selectedResult?.title}</span>
        </Space>
      }
      open={detailDrawer}
      onClose={() => setDetailDrawer(false)}
      width={600}
    >
      {selectedResult && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Document Type">
              <Tag color="blue">{selectedResult.document_type || 'Unknown'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Module">
              {selectedResult.module || 'General'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedResult.status === 'published' ? 'green' : 'default'}>
                {selectedResult.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Author">
              {selectedResult.created_by_name || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Modified">
              {formatDate(selectedResult.updated_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Size">
              {formatFileSize(selectedResult.file_size)}
            </Descriptions.Item>
            {selectedResult.score !== undefined && (
              <Descriptions.Item label="Relevance">
                <Progress 
                  percent={Math.round(selectedResult.score * 100)} 
                  size="small"
                />
              </Descriptions.Item>
            )}
          </Descriptions>
          
          {selectedResult.snippet && (
            <>
              <Divider>Match Preview</Divider>
              <div style={{ 
                padding: 12, 
                background: '#fafafa', 
                borderRadius: 6,
                fontSize: 13,
                lineHeight: 1.6
              }}>
                {highlightText(selectedResult.snippet, query)}
              </div>
            </>
          )}
          
          <Divider />
          
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={() => {
                if (onResultSelect) onResultSelect(selectedResult);
                setDetailDrawer(false);
              }}
            >
              Open Document
            </Button>
            <Button icon={<DownloadOutlined />}>
              Download
            </Button>
          </Space>
        </div>
      )}
    </Drawer>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="advanced-search" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="search-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <SearchOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Advanced Search</Title>
              <Badge status="processing" text="AI-Powered" />
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Search Bar */}
      {renderSearchBar()}
      
      {/* Main Content */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {!embedded && (
          <Col xs={24} lg={6}>
            <Card size="small" title={<Space><FilterOutlined /> Filters</Space>}>
              {renderFiltersPanel()}
            </Card>
            
            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <Card 
                size="small" 
                title={<Space><StarOutlined /> Saved Searches</Space>}
                style={{ marginTop: 16 }}
              >
                <List
                  dataSource={savedSearches.slice(0, 5)}
                  renderItem={(saved) => (
                    <List.Item
                      actions={[
                        <Popconfirm
                          key="delete"
                          title="Delete this saved search?"
                          onConfirm={() => handleDeleteSavedSearch(saved.id)}
                        >
                          <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <a onClick={() => handleLoadSavedSearch(saved)}>
                            {saved.name}
                          </a>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {saved.query || 'No query'}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
            
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <Card 
                size="small" 
                title={<Space><HistoryOutlined /> Recent</Space>}
                style={{ marginTop: 16 }}
              >
                <Space wrap size={[4, 4]}>
                  {searchHistory.slice(0, 8).map((item, i) => (
                    <Tag
                      key={i}
                      style={{ cursor: 'pointer', margin: 0 }}
                      onClick={() => {
                        setQuery(item.term);
                        setTimeout(() => performSearch(item.term), 100);
                      }}
                    >
                      {item.term}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}
          </Col>
        )}
        
        <Col xs={24} lg={embedded ? 24 : 18}>
          {/* Did You Mean */}
          {renderDidYouMean()}
          
          {/* Results Header */}
          {results.length > 0 && renderResultsHeader()}
          
          {/* Results */}
          {renderResults()}
          
          {/* Pagination */}
          {renderPagination()}
        </Col>
      </Row>
      
      {/* Filters Drawer (mobile) */}
      <Drawer
        title="Search Filters"
        placement="right"
        open={filtersDrawer}
        onClose={() => setFiltersDrawer(false)}
        width={400}
      >
        {renderFiltersPanel()}
      </Drawer>
      
      {/* Modals */}
      {renderSaveSearchModal()}
      {renderAlertModal()}
      {renderDetailDrawer()}
      
      {/* Floating Search Button (mobile) */}
      {embedded && (
        <FloatButton
          icon={<FilterOutlined />}
          type="primary"
          style={{ right: 24, bottom: 24 }}
          onClick={() => setFiltersDrawer(true)}
          badge={{
            count: Object.values(filters).filter(v => 
              Array.isArray(v) ? v.length > 0 : v
            ).length
          }}
        />
      )}
    </div>
  );
};

export default AdvancedSearch;