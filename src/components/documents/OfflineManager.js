// src/components/documents/OfflineManager.jsx
// Offline document access with PWA support, sync queue, and conflict resolution

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Checkbox, Radio, Slider, DatePicker, InputNumber, Segmented,
  Statistic, Result, Steps, Upload, Tree, Transfer, Cascader,
  Statistic as AntStat, FloatButton, notification
} from 'antd';
import {
  CloudDownloadOutlined, CloudUploadOutlined, SyncOutlined,
  DisconnectOutlined, WifiOutlined, CloudServerOutlined,
  DatabaseOutlined, FileTextOutlined, FilePdfOutlined,
  FileImageOutlined, CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, InfoCircleOutlined, ClockCircleOutlined,
  DownloadOutlined, UploadOutlined, DeleteOutlined, EyeOutlined,
  ReloadOutlined, SettingOutlined, SaveOutlined, PlayCircleOutlined,
  PauseCircleOutlined, StopOutlined, LaptopOutlined, MobileOutlined,
  DesktopOutlined, ThunderboltOutlined, RocketOutlined,
  HistoryOutlined, FilterOutlined, SearchOutlined, PlusOutlined,
  FolderOutlined, AppstoreOutlined, GlobalOutlined, SafetyOutlined,
  LockOutlined, UnlockOutlined, BarChartOutlined, LineChartOutlined,
  PieChartOutlined, FundOutlined, DeploymentUnitOutlined,
  MergeCellsOutlined, SplitCellsOutlined, BugOutlined,
  ApiOutlined, ClusterOutlined, CloudOutlined
} from '@ant-design/icons';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './OfflineManager.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const SYNC_STATUS = {
  synced: { label: 'Synced', color: 'success', icon: <CheckCircleOutlined /> },
  pending: { label: 'Pending', color: 'warning', icon: <ClockCircleOutlined /> },
  syncing: { label: 'Syncing', color: 'processing', icon: <SyncOutlined spin /> },
  conflict: { label: 'Conflict', color: 'error', icon: <WarningOutlined /> },
  error: { label: 'Error', color: 'error', icon: <CloseCircleOutlined /> },
  offline: { label: 'Offline', color: 'default', icon: <DisconnectOutlined /> }
};

const CONNECTION_STATUS = {
  online: { label: 'Online', color: 'success', icon: <WifiOutlined /> },
  offline: { label: 'Offline', color: 'warning', icon: <DisconnectOutlined /> },
  slow: { label: 'Slow Connection', color: 'warning', icon: <ThunderboltOutlined /> },
  unstable: { label: 'Unstable', color: 'error', icon: <WarningOutlined /> }
};

const CACHE_STRATEGIES = {
  all: { label: 'All Documents', description: 'Cache everything for offline access' },
  recent: { label: 'Recently Used', description: 'Cache last 30 days of activity' },
  favorites: { label: 'Favorites Only', description: 'Cache starred documents only' },
  critical: { label: 'Critical Only', description: 'Cache critical documents only' },
  custom: { label: 'Custom Selection', description: 'Manually select documents' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const OfflineManager = ({
  companyId = null,
  embedded = false,
  onUpdate = null
}) => {
  const { user } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('online');
  
  // Data
  const [cachedDocuments, setCachedDocuments] = useState([]);
  const [syncQueue, setSyncQueue] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [stats, setStats] = useState({});
  const [settings, setSettings] = useState({});
  const [storageEstimate, setStorageEstimate] = useState({ used: 0, quota: 0 });
  
  // UI State
  const [settingsModal, setSettingsModal] = useState(false);
  const [conflictModal, setConflictModal] = useState(false);
  const [documentPicker, setDocumentPicker] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Settings
  const [cacheStrategy, setCacheStrategy] = useState('recent');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(15);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [maxCacheSize, setMaxCacheSize] = useState(500);
  const [encryptCache, setEncryptCache] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  
  // Forms
  const [form] = Form.useForm();

  // Refs
  const syncIntervalRef = useRef(null);
  const onlineHandlerRef = useRef(null);
  const offlineHandlerRef = useRef(null);

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        cachedData,
        syncData,
        conflictsData,
        statsData,
        settingsData,
        storageData
      ] = await Promise.all([
        documentService.getOfflineDocuments({ company_id: companyId }),
        documentService.getSyncQueue({ company_id: companyId }),
        documentService.getSyncConflicts({ company_id: companyId }),
        documentService.getOfflineStats({ company_id: companyId }),
        documentService.getOfflineSettings({ company_id: companyId }),
        getStorageEstimate()
      ]);
      
      setCachedDocuments(cachedData.documents || []);
      setSyncQueue(syncData.queue || []);
      setConflicts(conflictsData.conflicts || []);
      setStats(statsData);
      setStorageEstimate(storageData);
      
      if (settingsData.settings) {
        setSettings(settingsData.settings);
        setCacheStrategy(settingsData.settings.cache_strategy || 'recent');
        setAutoSync(settingsData.settings.auto_sync ?? true);
        setSyncInterval(settingsData.settings.sync_interval || 15);
        setWifiOnly(settingsData.settings.wifi_only ?? true);
        setMaxCacheSize(settingsData.settings.max_cache_size || 500);
        setEncryptCache(settingsData.settings.encrypt_cache ?? true);
        setAutoDownload(settingsData.settings.auto_download ?? true);
      }
      
    } catch (error) {
      console.error('Failed to load offline data:', error);
      message.error('Failed to load offline data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);
  
  const getStorageEstimate = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      } catch (error) {
        console.error('Failed to get storage estimate:', error);
      }
    }
    return { used: 0, quota: 0 };
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleDownloadForOffline = async (documentIds) => {
    if (documentIds.length === 0) {
      message.warning('Please select documents');
      return;
    }
    
    setDownloading(true);
    try {
      await documentService.downloadForOffline(documentIds, {
        encrypt: encryptCache,
        company_id: companyId
      });
      
      message.success(`${documentIds.length} document(s) available offline`);
      setDocumentPicker(false);
      setSelectedDocs([]);
      loadData();
      
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download documents');
    } finally {
      setDownloading(false);
    }
  };
  
  const handleRemoveFromCache = async (documentIds) => {
    try {
      await documentService.removeFromOffline(documentIds);
      message.success(`${documentIds.length} document(s) removed from cache`);
      loadData();
    } catch (error) {
      console.error('Failed to remove:', error);
      message.error('Failed to remove documents');
    }
  };
  
  const handleSyncNow = async () => {
    if (!isOnline) {
      message.warning('Cannot sync while offline');
      return;
    }
    
    setSyncing(true);
    try {
      const result = await documentService.syncOfflineChanges({
        company_id: companyId,
        user_id: user?.id
      });
      
      if (result.conflicts > 0) {
        message.warning(`Synced with ${result.conflicts} conflict(s) - please review`);
        setActiveTab('conflicts');
      } else {
        message.success(`Synced ${result.synced} change(s)`);
      }
      
      loadData();
      
    } catch (error) {
      console.error('Sync failed:', error);
      message.error('Sync failed - will retry automatically');
    } finally {
      setSyncing(false);
    }
  };
  
  const handleResolveConflict = async (conflictId, resolution) => {
    try {
      await documentService.resolveConflict(conflictId, {
        resolution, // 'local', 'remote', 'merge'
        company_id: companyId
      });
      
      message.success('Conflict resolved');
      setConflictModal(false);
      setSelectedConflict(null);
      loadData();
      
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      message.error('Failed to resolve conflict');
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      await documentService.saveOfflineSettings({
        cache_strategy: cacheStrategy,
        auto_sync: autoSync,
        sync_interval: syncInterval,
        wifi_only: wifiOnly,
        max_cache_size: maxCacheSize,
        encrypt_cache: encryptCache,
        auto_download: autoDownload,
        company_id: companyId
      });
      
      message.success('Settings saved');
      setSettingsModal(false);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      message.error('Failed to save settings');
    }
  };
  
  const handleClearCache = async () => {
    Modal.confirm({
      title: 'Clear Offline Cache',
      content: `This will remove ${cachedDocuments.length} documents from offline storage. This action cannot be undone.`,
      okText: 'Clear Cache',
      okType: 'danger',
      onOk: async () => {
        try {
          await documentService.clearOfflineCache({ company_id: companyId });
          message.success('Cache cleared');
          loadData();
        } catch (error) {
          message.error('Failed to clear cache');
        }
      }
    });
  };
  
  const handleForceSync = () => {
    handleSyncNow();
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Online/offline detection
  useEffect(() => {
    onlineHandlerRef.current = () => {
      setIsOnline(true);
      setConnectionType('online');
      message.success('Back online - syncing changes...');
      if (autoSync) {
        setTimeout(handleSyncNow, 1000);
      }
    };
    
    offlineHandlerRef.current = () => {
      setIsOnline(false);
      setConnectionType('offline');
      message.warning('You are offline - changes will be queued');
    };
    
    window.addEventListener('online', onlineHandlerRef.current);
    window.addEventListener('offline', offlineHandlerRef.current);
    
    return () => {
      window.removeEventListener('online', onlineHandlerRef.current);
      window.removeEventListener('offline', offlineHandlerRef.current);
    };
  }, [autoSync]);
  
  // Auto-sync interval
  useEffect(() => {
    if (!autoSync || !isOnline) return;
    
    syncIntervalRef.current = setInterval(() => {
      if (syncQueue.length > 0) {
        handleSyncNow();
      }
    }, syncInterval * 60 * 1000);
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [autoSync, isOnline, syncInterval, syncQueue.length]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusConfig = (status) => SYNC_STATUS[status] || SYNC_STATUS.pending;
  
  const getConnectionConfig = (status) => CONNECTION_STATUS[status] || CONNECTION_STATUS.online;
  
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid';
    }
  };
  
  const getStoragePercent = () => {
    if (!storageEstimate.quota) return 0;
    return Math.round((storageEstimate.used / storageEstimate.quota) * 100);
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="offline-stat-card">
          <AntStat
            title="Cached Documents"
            value={cachedDocuments.length}
            prefix={<DatabaseOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="offline-stat-card pending">
          <AntStat
            title="Pending Sync"
            value={syncQueue.length}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="offline-stat-card conflicts">
          <AntStat
            title="Conflicts"
            value={conflicts.length}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="offline-stat-card">
          <AntStat
            title="Storage Used"
            value={formatFileSize(storageEstimate.used)}
            prefix={<CloudServerOutlined />}
            valueStyle={{ color: '#722ed1', fontSize: 16 }}
          />
          <Progress 
            percent={getStoragePercent()} 
            size="small"
            strokeColor={getStoragePercent() >= 80 ? '#f5222d' : '#1890ff'}
            style={{ marginTop: 8 }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderConnectionStatus = () => {
    const config = getConnectionConfig(connectionType);
    
    return (
      <Card size="small" className="connection-status-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Badge status={config.color === 'success' ? 'success' : config.color === 'warning' ? 'warning' : 'error'} />
              <Text strong>
                <Space>
                  {config.icon}
                  {config.label}
                </Space>
              </Text>
              {syncQueue.length > 0 && (
                <Tag color="warning">
                  {syncQueue.length} change(s) queued
                </Tag>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Last sync: {formatDate(settings.last_sync_at)}
              </Text>
              <Button
                type="primary"
                size="small"
                icon={<SyncOutlined spin={syncing} />}
                onClick={handleSyncNow}
                disabled={!isOnline || syncing}
                loading={syncing}
              >
                Sync Now
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };
  
  const renderOverviewTab = () => (
    <div>
      {renderStats()}
      {renderConnectionStatus()}
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Cache Strategy" size="small">
            <Radio.Group 
              value={cacheStrategy} 
              onChange={(e) => setCacheStrategy(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(CACHE_STRATEGIES).map(([key, value]) => (
                  <Radio key={key} value={key} style={{ padding: 8, width: '100%' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{value.label}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>{value.description}</div>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
            
            <Button 
              type="primary" 
              block 
              style={{ marginTop: 16 }}
              onClick={handleSaveSettings}
              icon={<SaveOutlined />}
            >
              Apply Strategy
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                icon={<CloudDownloadOutlined />}
                onClick={() => setDocumentPicker(true)}
              >
                Download Documents for Offline
              </Button>
              <Button 
                block 
                icon={<CloudUploadOutlined />}
                onClick={handleForceSync}
                disabled={!isOnline || syncQueue.length === 0}
              >
                Push Pending Changes ({syncQueue.length})
              </Button>
              <Button 
                block 
                icon={<ReloadOutlined />}
                onClick={loadData}
              >
                Refresh Cache Info
              </Button>
              <Button 
                block 
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearCache}
              >
                Clear All Cache
              </Button>
            </Space>
          </Card>
          
          <Card title="Storage Breakdown" size="small" style={{ marginTop: 16 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Documents', value: cachedDocuments.reduce((sum, d) => sum + (d.size || 0), 0) },
                    { name: 'Metadata', value: stats.metadata_size || 0 },
                    { name: 'Free Space', value: Math.max(0, (storageEstimate.quota || 0) - storageEstimate.used) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                >
                  <Cell fill="#1890ff" />
                  <Cell fill="#722ed1" />
                  <Cell fill="#d9d9d9" />
                </Pie>
                <RTooltip formatter={(value) => formatFileSize(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
  
  const renderCachedTab = () => {
    const columns = [
      {
        title: 'Document',
        dataIndex: 'title',
        key: 'title',
        render: (title, record) => (
          <Space>
            {record.file_type === 'pdf' ? <FilePdfOutlined style={{ color: '#f5222d' }} /> :
             record.file_type === 'image' ? <FileImageOutlined style={{ color: '#faad14' }} /> :
             <FileTextOutlined style={{ color: '#1890ff' }} />}
            <div>
              <div style={{ fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                {record.module} • {formatFileSize(record.size)}
              </div>
            </div>
          </Space>
        )
      },
      {
        title: 'Cached',
        dataIndex: 'cached_at',
        key: 'cached_at',
        render: (date) => formatDate(date)
      },
      {
        title: 'Last Accessed',
        dataIndex: 'last_accessed',
        key: 'last_accessed',
        render: (date) => date ? formatDate(date) : 'Never'
      },
      {
        title: 'Status',
        dataIndex: 'sync_status',
        key: 'sync_status',
        render: (status) => {
          const config = getStatusConfig(status);
          return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
        }
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        render: (_, record) => (
          <Space>
            <Tooltip title="Open">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
              />
            </Tooltip>
            <Tooltip title="Remove from cache">
              <Popconfirm
                title="Remove from offline cache?"
                onConfirm={() => handleRemoveFromCache([record.id])}
              >
                <Button type="text" size="small" icon={<DeleteOutlined />} danger />
              </Popconfirm>
            </Tooltip>
          </Space>
        )
      }
    ];
    
    return (
      <Card
        title={
          <Space>
            <DatabaseOutlined />
            <span>Offline Documents</span>
            <Badge count={cachedDocuments.length} style={{ backgroundColor: '#1890ff' }} />
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Input
              placeholder="Search cached documents..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="small"
              style={{ width: 200 }}
              allowClear
            />
            <Select
              value={filter}
              onChange={setFilter}
              size="small"
              style={{ width: 130 }}
            >
              <Option value="all">All</Option>
              <Option value="recent">Recent</Option>
              <Option value="large">Large Files</Option>
              <Option value="old">Old Cache</Option>
            </Select>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setDocumentPicker(true)}
            >
              Add Documents
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={cachedDocuments.filter(d => 
            !searchText || d.title?.toLowerCase().includes(searchText.toLowerCase())
          )}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      </Card>
    );
  };
  
  const renderQueueTab = () => (
    <Card
      title={
        <Space>
          <SyncOutlined spin={syncing} />
          <span>Sync Queue</span>
          <Badge count={syncQueue.length} style={{ backgroundColor: '#faad14' }} />
        </Space>
      }
      size="small"
      extra={
        <Button
          type="primary"
          icon={<SyncOutlined />}
          onClick={handleSyncNow}
          disabled={!isOnline || syncQueue.length === 0}
          loading={syncing}
        >
          Sync All
        </Button>
      }
    >
      {syncQueue.length > 0 ? (
        <List
          dataSource={syncQueue}
          renderItem={(item) => {
            const config = getStatusConfig(item.status);
            return (
              <List.Item
                actions={[
                  <Button
                    key="retry"
                    type="link"
                    size="small"
                    onClick={() => message.info('Retrying...')}
                  >
                    Retry
                  </Button>,
                  <Popconfirm
                    key="discard"
                    title="Discard this change?"
                    onConfirm={async () => {
                      await documentService.removeFromSyncQueue(item.id);
                      loadData();
                    }}
                  >
                    <Button type="link" size="small" danger>
                      Discard
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={config.icon}
                      style={{ backgroundColor: 
                        config.color === 'success' ? '#52c41a' :
                        config.color === 'warning' ? '#faad14' : '#1890ff'
                      }}
                    />
                  }
                  title={
                    <Space>
                      <span>{item.action} - {item.document_title}</span>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div style={{ fontSize: 12 }}>{item.description}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                        Queued: {formatDate(item.created_at)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Result
          status="success"
          title="All Synced"
          subTitle="There are no pending changes to sync"
        />
      )}
    </Card>
  );
  
  const renderConflictsTab = () => (
    <Card
      title={
        <Space>
          <WarningOutlined style={{ color: '#f5222d' }} />
          <span>Sync Conflicts</span>
          <Badge count={conflicts.length} style={{ backgroundColor: '#f5222d' }} />
        </Space>
      }
      size="small"
    >
      {conflicts.length > 0 ? (
        <List
          dataSource={conflicts}
          renderItem={(conflict) => (
            <List.Item
              actions={[
                <Button
                  key="resolve"
                  type="primary"
                  size="small"
                  onClick={() => {
                    setSelectedConflict(conflict);
                    setConflictModal(true);
                  }}
                >
                  Resolve
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<WarningOutlined />}
                    style={{ backgroundColor: '#f5222d' }}
                  />
                }
                title={conflict.document_title}
                description={
                  <div>
                    <div>Conflict detected: {conflict.conflict_type}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      Local version: {formatDate(conflict.local_modified)} | 
                      Remote version: {formatDate(conflict.remote_modified)}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Result
          status="success"
          title="No Conflicts"
          subTitle="All documents are in sync"
        />
      )}
    </Card>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderDocumentPicker = () => (
    <Modal
      title={
        <Space>
          <CloudDownloadOutlined />
          <span>Download for Offline Access</span>
        </Space>
      }
      open={documentPicker}
      onCancel={() => {
        setDocumentPicker(false);
        setSelectedDocs([]);
      }}
      onOk={() => handleDownloadForOffline(selectedDocs)}
      okText={`Download ${selectedDocs.length} Document(s)`}
      okButtonProps={{ disabled: selectedDocs.length === 0, loading: downloading }}
      width={800}
    >
      <Alert
        message="Download for Offline"
        description="Selected documents will be cached locally and available without an internet connection."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Input.Search
        placeholder="Search documents..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16 }}
      />
      
      <Transfer
        dataSource={[]}
        titles={['Available Documents', 'Selected for Download']}
        targetKeys={selectedDocs}
        onChange={setSelectedDocs}
        listStyle={{ width: '100%', height: 400 }}
        render={item => item.title}
        showSearch
      />
    </Modal>
  );
  
  const renderConflictModal = () => (
    <Modal
      title={
        <Space>
          <MergeCellsOutlined />
          <span>Resolve Conflict</span>
        </Space>
      }
      open={conflictModal}
      onCancel={() => setConflictModal(false)}
      footer={null}
      width={700}
    >
      {selectedConflict && (
        <div>
          <Alert
            message="Sync Conflict Detected"
            description={`The document "${selectedConflict.document_title}" was modified both locally and remotely.`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Row gutter={16}>
            <Col span={12}>
              <Card 
                size="small" 
                title={<Tag color="blue">Local Version</Tag>}
                style={{ height: '100%' }}
              >
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Modified: {formatDate(selectedConflict.local_modified)}
                </Text>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ 
                  padding: 8, 
                  background: '#fafafa', 
                  borderRadius: 4,
                  maxHeight: 200,
                  overflow: 'auto',
                  fontSize: 12
                }}>
                  {selectedConflict.local_content || 'No preview available'}
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card 
                size="small" 
                title={<Tag color="green">Remote Version</Tag>}
                style={{ height: '100%' }}
              >
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Modified: {formatDate(selectedConflict.remote_modified)}
                </Text>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ 
                  padding: 8, 
                  background: '#fafafa', 
                  borderRadius: 4,
                  maxHeight: 200,
                  overflow: 'auto',
                  fontSize: 12
                }}>
                  {selectedConflict.remote_content || 'No preview available'}
                </div>
              </Card>
            </Col>
          </Row>
          
          <Divider>Resolution Options</Divider>
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              block 
              onClick={() => handleResolveConflict(selectedConflict.id, 'local')}
              icon={<UploadOutlined />}
            >
              Keep Local (Overwrite Remote)
            </Button>
            <Button 
              block 
              onClick={() => handleResolveConflict(selectedConflict.id, 'remote')}
              icon={<DownloadOutlined />}
            >
              Keep Remote (Overwrite Local)
            </Button>
            <Button 
              block 
              type="primary"
              onClick={() => handleResolveConflict(selectedConflict.id, 'merge')}
              icon={<MergeCellsOutlined />}
            >
              Merge Both Versions
            </Button>
          </Space>
        </div>
      )}
    </Modal>
  );
  
  const renderSettingsModal = () => (
    <Modal
      title="Offline Settings"
      open={settingsModal}
      onCancel={() => setSettingsModal(false)}
      onOk={handleSaveSettings}
      okText="Save Settings"
      width={600}
    >
      <Form layout="vertical">
        <Form.Item label="Cache Strategy">
          <Select value={cacheStrategy} onChange={setCacheStrategy}>
            {Object.entries(CACHE_STRATEGIES).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Divider>Sync Settings</Divider>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Switch checked={autoSync} onChange={setAutoSync} />
            <Text>Automatically sync changes</Text>
          </Space>
          <Space>
            <Switch checked={autoDownload} onChange={setAutoDownload} />
            <Text>Auto-download critical documents</Text>
          </Space>
          <Space>
            <Switch checked={wifiOnly} onChange={setWifiOnly} />
            <Text>Sync on Wi-Fi only</Text>
          </Space>
        </Space>
        
        <Form.Item label="Sync Interval (minutes)" style={{ marginTop: 16 }}>
          <InputNumber
            value={syncInterval}
            onChange={setSyncInterval}
            min={5}
            max={120}
            style={{ width: '100%' }}
            addonAfter="minutes"
          />
        </Form.Item>
        
        <Divider>Storage Settings</Divider>
        
        <Form.Item label="Maximum Cache Size">
          <Slider
            value={maxCacheSize}
            onChange={setMaxCacheSize}
            min={100}
            max={2000}
            step={100}
            marks={{ 100: '100MB', 500: '500MB', 1000: '1GB', 2000: '2GB' }}
          />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Switch checked={encryptCache} onChange={setEncryptCache} />
            <Text>Encrypt cached documents</Text>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="offline-manager" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="offline-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <CloudOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Offline Manager</Title>
              <Tag 
                color={isOnline ? 'green' : 'red'}
                icon={isOnline ? <WifiOutlined /> : <DisconnectOutlined />}
              >
                {isOnline ? 'Online' : 'Offline'}
              </Tag>
              {syncQueue.length > 0 && (
                <Tag color="warning" icon={<SyncOutlined spin />}>
                  {syncQueue.length} pending
                </Tag>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setSettingsModal(true)}
              >
                Settings
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadData}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <Space>
                <DashboardOutlined />
                Overview
              </Space>
            ),
            children: renderOverviewTab()
          },
          {
            key: 'cached',
            label: (
              <Space>
                <DatabaseOutlined />
                Cached Documents
                {cachedDocuments.length > 0 && (
                  <Badge count={cachedDocuments.length} style={{ backgroundColor: '#1890ff' }} />
                )}
              </Space>
            ),
            children: renderCachedTab()
          },
          {
            key: 'queue',
            label: (
              <Space>
                <SyncOutlined spin={syncing} />
                Sync Queue
                {syncQueue.length > 0 && (
                  <Badge count={syncQueue.length} style={{ backgroundColor: '#faad14' }} />
                )}
              </Space>
            ),
            children: renderQueueTab()
          },
          {
            key: 'conflicts',
            label: (
              <Space>
                <WarningOutlined />
                Conflicts
                {conflicts.length > 0 && (
                  <Badge count={conflicts.length} style={{ backgroundColor: '#f5222d' }} />
                )}
              </Space>
            ),
            children: renderConflictsTab()
          }
        ]}
      />
      
      {/* Modals */}
      {renderDocumentPicker()}
      {renderConflictModal()}
      {renderSettingsModal()}
    </div>
  );
};

export default OfflineManager;