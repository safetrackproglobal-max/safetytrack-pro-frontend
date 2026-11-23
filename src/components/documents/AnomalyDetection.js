// src/components/documents/AnomalyDetection.jsx
// AI-powered anomaly detection: unusual access patterns, suspicious downloads,
// potential data leaks, and behavioral analytics

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Checkbox, Radio, Slider, DatePicker, InputNumber, Segmented,
  Statistic, Result, Steps, Badge as AntBadge, Alert as AntAlert,
  Statistic as AntStat
} from 'antd';
import {
  WarningOutlined, AlertFilled, BugOutlined, FireOutlined,
  ExclamationCircleOutlined, SafetyCertificateOutlined,
  SecurityScanOutlined, RadarChartOutlined, LineChartOutlined,
  PieChartOutlined, BarChartOutlined, EyeOutlined, UserOutlined,
  ClockCircleOutlined, EnvironmentOutlined, GlobalOutlined,
  LaptopOutlined, MobileOutlined, DesktopOutlined, DatabaseOutlined,
  DownloadOutlined, UploadOutlined, EditOutlined, DeleteOutlined,
  ShareAltOutlined, LinkOutlined, LockOutlined, UnlockOutlined,
  SearchOutlined, FilterOutlined, ReloadOutlined, SettingOutlined,
  BellOutlined, MailOutlined, ThunderboltOutlined, RobotOutlined,
  ExperimentOutlined, CheckCircleOutlined, CloseCircleOutlined,
  InfoCircleOutlined, StopOutlined, PlayCircleOutlined,
  HistoryOutlined, LineChartOutlined as TrendOutlined,
  RiseOutlined, FallOutlined, DeploymentUnitOutlined,
  NodeIndexOutlined, ApartmentOutlined, ClusterOutlined,
  CompassOutlined, AimOutlined, MonitorOutlined, HeatMapOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, ResponsiveContainer, Cell, ZAxis, ReferenceLine
} from 'recharts';
import documentService from '../../services/documentService';
import './AnomalyDetection.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// ============================================================
// CONSTANTS
// ============================================================

const ANOMALY_TYPES = {
  unusual_access: { 
    label: 'Unusual Access', 
    icon: <EyeOutlined />, 
    color: '#1890ff',
    description: 'Access from unusual locations or times'
  },
  mass_download: { 
    label: 'Mass Download', 
    icon: <DownloadOutlined />, 
    color: '#f5222d',
    description: 'Unusually high download volume'
  },
  off_hours: { 
    label: 'Off-Hours Activity', 
    icon: <ClockCircleOutlined />, 
    color: '#faad14',
    description: 'Activity outside business hours'
  },
  location_anomaly: { 
    label: 'Location Anomaly', 
    icon: <GlobalOutlined />, 
    color: '#722ed1',
    description: 'Access from new locations'
  },
  device_anomaly: { 
    label: 'Device Anomaly', 
    icon: <LaptopOutlined />, 
    color: '#13c2c2',
    description: 'Access from new devices'
  },
  permission_escalation: { 
    label: 'Permission Escalation', 
    icon: <LockOutlined />, 
    color: '#fa541c',
    description: 'Unusual permission changes'
  },
  data_exfiltration: { 
    label: 'Data Exfiltration', 
    icon: <ThunderboltOutlined />, 
    color: '#cf1322',
    description: 'Potential data leak patterns'
  },
  failed_access: { 
    label: 'Failed Access Attempts', 
    icon: <StopOutlined />, 
    color: '#eb2f96',
    description: 'Multiple failed access attempts'
  }
};

const SEVERITY_LEVELS = {
  critical: { label: 'Critical', color: '#cf1322', bgColor: '#fff1f0' },
  high: { label: 'High', color: '#f5222d', bgColor: '#fff1f0' },
  medium: { label: 'Medium', color: '#faad14', bgColor: '#fff7e6' },
  low: { label: 'Low', color: '#52c41a', bgColor: '#f6ffed' }
};

const DETECTION_METHODS = {
  statistical: { label: 'Statistical', description: 'Z-score and IQR analysis' },
  behavioral: { label: 'Behavioral', description: 'User behavior baseline' },
  ml_model: { label: 'ML Model', description: 'Isolation Forest / Autoencoder' },
  rule_based: { label: 'Rule-Based', description: 'Custom business rules' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const AnomalyDetection = ({
  companyId = null,
  embedded = false,
  onUpdate = null
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  
  // Data
  const [anomalies, setAnomalies] = useState([]);
  const [stats, setStats] = useState({});
  const [patterns, setPatterns] = useState({});
  const [timeline, setTimeline] = useState([]);
  const [topOffenders, setTopOffenders] = useState([]);
  const [userBaselines, setUserBaselines] = useState([]);
  const [rules, setRules] = useState([]);
  
  // UI State
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [configureModalVisible, setConfigureModalVisible] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    status: 'all'
  });
  
  // Settings
  const [sensitivity, setSensitivity] = useState(0.7);
  const [autoDetect, setAutoDetect] = useState(true);
  const [autoBlock, setAutoBlock] = useState(false);
  const [notifyAdmins, setNotifyAdmins] = useState(true);
  const [notifyUsers, setNotifyUsers] = useState(false);
  const [detectionMethods, setDetectionMethods] = useState(['statistical', 'behavioral']);
  
  // Forms
  const [ruleForm] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        anomaliesData,
        statsData,
        patternsData,
        timelineData,
        offendersData,
        baselinesData,
        rulesData
      ] = await Promise.all([
        documentService.getAnomalies({ 
          company_id: companyId, 
          time_range: timeRange,
          ...filters 
        }),
        documentService.getAnomalyStats({ company_id: companyId, time_range: timeRange }),
        documentService.getAnomalyPatterns({ company_id: companyId, time_range: timeRange }),
        documentService.getAnomalyTimeline({ company_id: companyId, time_range: timeRange }),
        documentService.getTopOffenders({ company_id: companyId, time_range: timeRange }),
        documentService.getUserBaselines({ company_id: companyId }),
        documentService.getDetectionRules({ company_id: companyId })
      ]);
      
      setAnomalies(anomaliesData.anomalies || []);
      setStats(statsData);
      setPatterns(patternsData.patterns || {});
      setTimeline(timelineData.timeline || []);
      setTopOffenders(offendersData.offenders || []);
      setUserBaselines(baselinesData.baselines || []);
      setRules(rulesData.rules || []);
      
    } catch (error) {
      console.error('Failed to load anomaly data:', error);
      message.error('Failed to load anomaly data');
    } finally {
      setLoading(false);
    }
  }, [companyId, timeRange, filters]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleDetectNow = async () => {
    setDetecting(true);
    try {
      const result = await documentService.runAnomalyDetection({
        company_id: companyId,
        methods: detectionMethods,
        sensitivity
      });
      
      message.success(`Detection complete: ${result.anomalies_found} anomalies found`);
      loadData();
      
    } catch (error) {
      console.error('Detection failed:', error);
      message.error('Detection failed');
    } finally {
      setDetecting(false);
    }
  };
  
  const handleInvestigate = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setDetailDrawerVisible(true);
  };
  
  const handleMarkResolved = async (anomalyId) => {
    try {
      await documentService.resolveAnomaly(anomalyId);
      message.success('Anomaly marked as resolved');
      loadData();
      setDetailDrawerVisible(false);
    } catch (error) {
      message.error('Failed to resolve anomaly');
    }
  };
  
  const handleMarkFalsePositive = async (anomalyId) => {
    try {
      await documentService.markFalsePositive(anomalyId);
      message.success('Marked as false positive - improves detection');
      loadData();
      setDetailDrawerVisible(false);
    } catch (error) {
      message.error('Failed to mark as false positive');
    }
  };
  
  const handleBlockUser = async (userId) => {
    Modal.confirm({
      title: 'Block User',
      content: 'This will immediately block the user\'s access. Continue?',
      okText: 'Block',
      okType: 'danger',
      onOk: async () => {
        try {
          await documentService.blockUser(userId, { 
            reason: 'Anomalous activity',
            company_id: companyId 
          });
          message.success('User blocked');
          loadData();
        } catch (error) {
          message.error('Failed to block user');
        }
      }
    });
  };
  
  const handleBulkAction = async (action) => {
    if (selectedRows.length === 0) return;
    
    try {
      await documentService.bulkAnomalyAction(selectedRows, action);
      message.success(`${selectedRows.length} anomalies ${action}`);
      setSelectedRows([]);
      loadData();
    } catch (error) {
      message.error('Bulk action failed');
    }
  };
  
  const handleSaveRule = async (values) => {
    try {
      await documentService.saveDetectionRule({
        ...values,
        company_id: companyId
      });
      message.success('Rule saved');
      setRuleModalVisible(false);
      ruleForm.resetFields();
      loadData();
    } catch (error) {
      message.error('Failed to save rule');
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      await documentService.saveAnomalySettings({
        sensitivity,
        auto_detect: autoDetect,
        auto_block: autoBlock,
        notify_admins: notifyAdmins,
        notify_users: notifyUsers,
        detection_methods: detectionMethods,
        company_id: companyId
      });
      message.success('Settings saved');
      setConfigureModalVisible(false);
    } catch (error) {
      message.error('Failed to save settings');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getTypeConfig = (type) => ANOMALY_TYPES[type] || {
    label: type,
    icon: <WarningOutlined />,
    color: '#8c8c8c',
    description: ''
  };
  
  const getSeverityConfig = (severity) => SEVERITY_LEVELS[severity] || SEVERITY_LEVELS.low;
  
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
        <Card size="small" className="anomaly-stat-card">
          <AntStat
            title="Total Anomalies"
            value={stats.total || 0}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="anomaly-stat-card critical">
          <AntStat
            title="Critical"
            value={stats.critical || 0}
            prefix={<AlertFilled />}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="anomaly-stat-card">
          <AntStat
            title="Active Threats"
            value={stats.active || 0}
            prefix={<FireOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="anomaly-stat-card success">
          <AntStat
            title="Resolved"
            value={stats.resolved || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderOverviewTab = () => (
    <div>
      {/* Timeline Chart */}
      <Card 
        title="Anomaly Timeline" 
        size="small"
        style={{ marginBottom: 16 }}
      >
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f5222d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f5222d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis fontSize={11} />
            <RTooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="critical" 
              stackId="1"
              stroke="#cf1322" 
              fill="#cf1322"
              name="Critical"
            />
            <Area 
              type="monotone" 
              dataKey="high" 
              stackId="1"
              stroke="#f5222d" 
              fill="#ff7875"
              name="High"
            />
            <Area 
              type="monotone" 
              dataKey="medium" 
              stackId="1"
              stroke="#faad14" 
              fill="#ffc53d"
              name="Medium"
            />
            <Area 
              type="monotone" 
              dataKey="low" 
              stackId="1"
              stroke="#52c41a" 
              fill="#95de64"
              name="Low"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      
      {/* Pattern Distribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Anomaly Types" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(patterns.by_type || {}).map(([name, value]) => ({
                    name: getTypeConfig(name).label,
                    value,
                    color: getTypeConfig(name).color
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {Object.entries(patterns.by_type || {}).map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={getTypeConfig(entry[0]).color} 
                    />
                  ))}
                </Pie>
                <RTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Top Offenders" size="small">
            {topOffenders.length > 0 ? (
              <List
                dataSource={topOffenders}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => handleBlockUser(item.user_id)}
                        danger
                      >
                        Block
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: index === 0 ? '#cf1322' : index === 1 ? '#faad14' : '#1890ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                      }
                      title={item.user_name || item.user_email}
                      description={
                        <Space size={[4, 4]} wrap>
                          <Tag color="red">{item.anomaly_count} anomalies</Tag>
                          {item.risk_score > 80 && (
                            <Tag color="red" icon={<FireOutlined />}>High Risk</Tag>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No offenders detected" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
  
  const renderAnomaliesTab = () => {
    const columns = [
      {
        title: 'Severity',
        dataIndex: 'severity',
        key: 'severity',
        width: 100,
        render: (severity) => {
          const config = getSeverityConfig(severity);
          return (
            <Tag 
              color={config.color}
              style={{ fontWeight: 600 }}
            >
              {config.label.toUpperCase()}
            </Tag>
          );
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type) => {
          const config = getTypeConfig(type);
          return (
            <Tooltip title={config.description}>
              <Tag color={config.color} icon={config.icon}>
                {config.label}
              </Tag>
            </Tooltip>
          );
        }
      },
      {
        title: 'User',
        dataIndex: 'user_name',
        key: 'user_name',
        render: (name, record) => (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <div>
              <div style={{ fontWeight: 500 }}>{name || 'Unknown'}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                {record.user_email}
              </div>
            </div>
          </Space>
        )
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true
      },
      {
        title: 'Risk Score',
        dataIndex: 'risk_score',
        key: 'risk_score',
        width: 100,
        render: (score) => (
          <Progress 
            percent={score} 
            size="small"
            strokeColor={score >= 80 ? '#cf1322' : score >= 60 ? '#f5222d' : score >= 40 ? '#faad14' : '#52c41a'}
            format={(p) => `${p}`}
          />
        )
      },
      {
        title: 'Detected',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 150,
        render: (date) => formatDate(date)
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, record) => (
          <Space>
            <Tooltip title="Investigate">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleInvestigate(record)}
              />
            </Tooltip>
            <Tooltip title="Mark Resolved">
              <Popconfirm
                title="Mark as resolved?"
                onConfirm={() => handleMarkResolved(record.id)}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a' }}
                />
              </Popconfirm>
            </Tooltip>
            <Tooltip title="False Positive">
              <Popconfirm
                title="Mark as false positive?"
                onConfirm={() => handleMarkFalsePositive(record.id)}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleOutlined />}
                />
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
            <WarningOutlined />
            <span>Detected Anomalies</span>
            <Badge count={anomalies.length} style={{ backgroundColor: '#faad14' }} />
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Select
              value={filters.severity}
              onChange={(v) => setFilters({ ...filters, severity: v })}
              style={{ width: 120 }}
              size="small"
              placeholder="Severity"
            >
              <Option value="all">All Severity</Option>
              {Object.entries(SEVERITY_LEVELS).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
            
            <Select
              value={filters.type}
              onChange={(v) => setFilters({ ...filters, type: v })}
              style={{ width: 150 }}
              size="small"
              placeholder="Type"
            >
              <Option value="all">All Types</Option>
              {Object.entries(ANOMALY_TYPES).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
            
            {selectedRows.length > 0 && (
              <>
                <Button 
                  size="small"
                  onClick={() => handleBulkAction('resolved')}
                >
                  Resolve ({selectedRows.length})
                </Button>
                <Button 
                  size="small"
                  danger
                  onClick={() => handleBulkAction('ignored')}
                >
                  Ignore
                </Button>
              </>
            )}
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={anomalies}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys: selectedRows,
            onChange: setSelectedRows
          }}
          rowClassName={(record) => 
            record.severity === 'critical' ? 'critical-row' :
            record.severity === 'high' ? 'high-row' : ''
          }
          locale={{ emptyText: <Empty description="No anomalies detected" /> }}
        />
      </Card>
    );
  };
  
  const renderRulesTab = () => (
    <Card
      title={
        <Space>
          <SettingOutlined />
          <span>Detection Rules</span>
          <Badge count={rules.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      size="small"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setRuleModalVisible(true)}
          size="small"
        >
          New Rule
        </Button>
      }
    >
      {rules.length > 0 ? (
        <List
          dataSource={rules}
          renderItem={(rule) => (
            <List.Item
              actions={[
                <Switch 
                  key="toggle"
                  checked={rule.enabled} 
                  size="small"
                  onChange={async (checked) => {
                    try {
                      await documentService.toggleDetectionRule(rule.id, checked);
                      loadData();
                    } catch (error) {
                      message.error('Failed to toggle rule');
                    }
                  }}
                />,
                <Button 
                  key="edit"
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />}
                />,
                <Popconfirm
                  key="delete"
                  title="Delete this rule?"
                  onConfirm={async () => {
                    await documentService.deleteDetectionRule(rule.id);
                    loadData();
                  }}
                >
                  <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    style={{ 
                      backgroundColor: rule.enabled ? '#1890ff' : '#d9d9d9'
                    }}
                    icon={<BugOutlined />}
                  />
                }
                title={
                  <Space>
                    <span>{rule.name}</span>
                    <Tag color={rule.enabled ? 'green' : 'default'}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </Tag>
                    <Tag color={getSeverityConfig(rule.severity).color}>
                      {getSeverityConfig(rule.severity).label}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>{rule.description}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                      Condition: <code>{rule.condition}</code>
                      {rule.triggered_count > 0 && (
                        <span> • Triggered {rule.triggered_count} times</span>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No custom rules configured">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setRuleModalVisible(true)}
          >
            Create First Rule
          </Button>
        </Empty>
      )}
    </Card>
  );
  
  const renderBaselinesTab = () => (
    <Card title="User Behavior Baselines" size="small">
      <Table
        rowKey="id"
        dataSource={userBaselines}
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: 'User',
            dataIndex: 'user_name',
            key: 'user_name',
            render: (name, record) => (
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <div>
                  <div style={{ fontWeight: 500 }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                    {record.user_email}
                  </div>
                </div>
              </Space>
            )
          },
          {
            title: 'Typical Access Hours',
            dataIndex: 'typical_hours',
            key: 'typical_hours',
            render: (hours) => (
              <Tag icon={<ClockCircleOutlined />}>
                {hours || '9:00 - 17:00'}
              </Tag>
            )
          },
          {
            title: 'Common Locations',
            dataIndex: 'common_locations',
            key: 'common_locations',
            render: (locations) => (
              <Space size={[4, 4]} wrap>
                {(locations || []).slice(0, 3).map((loc, i) => (
                  <Tag key={i} icon={<EnvironmentOutlined />}>{loc}</Tag>
                ))}
                {(locations || []).length > 3 && (
                  <Tag>+{locations.length - 3}</Tag>
                )}
              </Space>
            )
          },
          {
            title: 'Avg Daily Downloads',
            dataIndex: 'avg_daily_downloads',
            key: 'avg_daily_downloads',
            render: (v) => v?.toFixed(1) || '0.0'
          },
          {
            title: 'Baseline Score',
            dataIndex: 'baseline_score',
            key: 'baseline_score',
            render: (score) => (
              <Progress 
                percent={score} 
                size="small"
                strokeColor={score >= 80 ? '#52c41a' : '#faad14'}
              />
            )
          },
          {
            title: 'Risk Level',
            dataIndex: 'risk_level',
            key: 'risk_level',
            render: (level) => {
              const config = getSeverityConfig(level);
              return <Tag color={config.color}>{config.label}</Tag>;
            }
          }
        ]}
      />
    </Card>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderDetailDrawer = () => (
    <Drawer
      title={
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          <span>Anomaly Investigation</span>
        </Space>
      }
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={700}
      extra={
        <Space>
          <Button 
            icon={<CloseCircleOutlined />}
            onClick={() => handleMarkFalsePositive(selectedAnomaly?.id)}
          >
            False Positive
          </Button>
          <Button 
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleMarkResolved(selectedAnomaly?.id)}
          >
            Resolve
          </Button>
        </Space>
      }
    >
      {selectedAnomaly && (
        <div>
          <Alert
            message={`${getSeverityConfig(selectedAnomaly.severity).label} Priority`}
            description={selectedAnomaly.description}
            type={
              selectedAnomaly.severity === 'critical' ? 'error' :
              selectedAnomaly.severity === 'high' ? 'warning' : 'info'
            }
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Type">
              <Tag color={getTypeConfig(selectedAnomaly.type).color} icon={getTypeConfig(selectedAnomaly.type).icon}>
                {getTypeConfig(selectedAnomaly.type).label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Risk Score">
              <Progress 
                percent={selectedAnomaly.risk_score} 
                strokeColor={selectedAnomaly.risk_score >= 80 ? '#cf1322' : '#faad14'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="User">
              {selectedAnomaly.user_name} ({selectedAnomaly.user_email})
            </Descriptions.Item>
            <Descriptions.Item label="IP Address">
              <code>{selectedAnomaly.ip_address || 'N/A'}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              <Space>
                <EnvironmentOutlined />
                {selectedAnomaly.location || 'Unknown'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Device">
              <Space>
                <LaptopOutlined />
                {selectedAnomaly.device_info || 'Unknown'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Detected At">
              {formatDate(selectedAnomaly.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Detection Method">
              <Tag>{selectedAnomaly.detection_method || 'Statistical'}</Tag>
            </Descriptions.Item>
          </Descriptions>
          
          <Divider>Related Activity</Divider>
          
          <Timeline
            items={(selectedAnomaly.related_events || []).map((event) => ({
              color: event.severity === 'critical' ? 'red' : 'blue',
              children: (
                <div>
                  <Space>
                    <Text strong>{event.action}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {formatDate(event.timestamp)}
                    </Text>
                  </Space>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    {event.details}
                  </div>
                </div>
              )
            }))}
          />
          
          <Divider>Recommended Actions</Divider>
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              block
              danger
              icon={<LockOutlined />}
              onClick={() => handleBlockUser(selectedAnomaly.user_id)}
            >
              Block User Access
            </Button>
            <Button 
              block
              icon={<BellOutlined />}
              onClick={() => message.info('Security team notified')}
            >
              Notify Security Team
            </Button>
            <Button 
              block
              icon={<HistoryOutlined />}
              onClick={() => message.info('Viewing full audit trail')}
            >
              View Full Audit Trail
            </Button>
          </Space>
        </div>
      )}
    </Drawer>
  );
  
  const renderRuleModal = () => (
    <Modal
      title="Create Detection Rule"
      open={ruleModalVisible}
      onCancel={() => {
        setRuleModalVisible(false);
        ruleForm.resetFields();
      }}
      footer={null}
      width={600}
    >
      <Form
        form={ruleForm}
        layout="vertical"
        onFinish={handleSaveRule}
      >
        <Form.Item
          name="name"
          label="Rule Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g., Mass Download Alert" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={2} placeholder="What does this rule detect?" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Anomaly Type"
              rules={[{ required: true }]}
            >
              <Select>
                {Object.entries(ANOMALY_TYPES).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <Space>
                      {value.icon}
                      {value.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="severity"
              label="Severity"
              rules={[{ required: true }]}
            >
              <Select>
                {Object.entries(SEVERITY_LEVELS).map(([key, value]) => (
                  <Option key={key} value={key}>{value.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="condition"
          label="Condition"
          rules={[{ required: true }]}
          extra="Use expressions like: downloads > 50 AND time_range = '1h'"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="e.g., downloads > 50 AND time_range = '1h'" 
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>
        
        <Form.Item name="actions" label="Actions">
          <Checkbox.Group>
            <Space direction="vertical">
              <Checkbox value="notify">Notify security team</Checkbox>
              <Checkbox value="block">Auto-block user</Checkbox>
              <Checkbox value="log">Log to audit trail</Checkbox>
              <Checkbox value="escalate">Escalate to management</Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>
        
        <Form.Item name="enabled" valuePropName="checked" initialValue={true}>
          <Checkbox>Enable this rule immediately</Checkbox>
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setRuleModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Create Rule</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderConfigureModal = () => (
    <Modal
      title="Detection Configuration"
      open={configureModalVisible}
      onCancel={() => setConfigureModalVisible(false)}
      onOk={handleSaveSettings}
      okText="Save Settings"
      width={600}
    >
      <Form layout="vertical">
        <Form.Item label={`Detection Sensitivity: ${(sensitivity * 100).toFixed(0)}%`}>
          <Slider
            value={sensitivity}
            onChange={setSensitivity}
            min={0.1}
            max={1}
            step={0.1}
            marks={{
              0.1: 'Low',
              0.5: 'Balanced',
              1: 'High'
            }}
          />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Higher sensitivity = More alerts but more false positives
          </Text>
        </Form.Item>
        
        <Form.Item label="Detection Methods">
          <Checkbox.Group
            value={detectionMethods}
            onChange={setDetectionMethods}
          >
            <Space direction="vertical">
              {Object.entries(DETECTION_METHODS).map(([key, value]) => (
                <Checkbox key={key} value={key}>
                  <Space>
                    <strong>{value.label}</strong>
                    <Text type="secondary">- {value.description}</Text>
                  </Space>
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Form.Item>
        
        <Divider>Automation</Divider>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Switch checked={autoDetect} onChange={setAutoDetect} />
            <Text>Run detection automatically every hour</Text>
          </Space>
          <Space>
            <Switch checked={autoBlock} onChange={setAutoBlock} />
            <Text>Auto-block users with critical anomalies</Text>
          </Space>
        </Space>
        
        <Divider>Notifications</Divider>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Switch checked={notifyAdmins} onChange={setNotifyAdmins} />
            <Text>Notify administrators of new anomalies</Text>
          </Space>
          <Space>
            <Switch checked={notifyUsers} onChange={setNotifyUsers} />
            <Text>Notify users of suspicious activity on their account</Text>
          </Space>
        </Space>
      </Form>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="anomaly-detection" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="anomaly-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <SecurityScanOutlined style={{ fontSize: 24, color: '#f5222d' }} />
              <Title level={4} style={{ margin: 0 }}>Anomaly Detection</Title>
              <Badge status="processing" text="AI-Powered" />
              {stats.critical > 0 && (
                <Tag color="red" icon={<AlertFilled />}>
                  {stats.critical} CRITICAL
                </Tag>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 140 }}
              >
                <Option value="24h">Last 24 Hours</Option>
                <Option value="7d">Last 7 Days</Option>
                <Option value="30d">Last 30 Days</Option>
                <Option value="90d">Last 90 Days</Option>
              </Select>
              
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setConfigureModalVisible(true)}
              >
                Configure
              </Button>
              
              <Button 
                type="primary"
                danger
                icon={<RadarChartOutlined />}
                onClick={handleDetectNow}
                loading={detecting}
              >
                Run Detection
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
      
      {/* Critical Alert */}
      {stats.critical > 0 && (
        <Alert
          message="Critical Anomalies Detected"
          description={`${stats.critical} critical anomalies require immediate attention. Review and take action.`}
          type="error"
          showIcon
          icon={<AlertFilled />}
          style={{ marginBottom: 16 }}
          action={
            <Button 
              size="small" 
              danger
              onClick={() => {
                setActiveTab('anomalies');
                setFilters({ ...filters, severity: 'critical' });
              }}
            >
              Review Now
            </Button>
          }
        />
      )}
      
      {/* Stats */}
      {renderStats()}
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <Space>
                <RadarChartOutlined />
                Overview
              </Space>
            ),
            children: renderOverviewTab()
          },
          {
            key: 'anomalies',
            label: (
              <Space>
                <WarningOutlined />
                Anomalies
                {anomalies.length > 0 && (
                  <Badge count={anomalies.length} style={{ backgroundColor: '#faad14' }} />
                )}
              </Space>
            ),
            children: renderAnomaliesTab()
          },
          {
            key: 'rules',
            label: (
              <Space>
                <BugOutlined />
                Rules
                <Badge count={rules.length} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            ),
            children: renderRulesTab()
          },
          {
            key: 'baselines',
            label: (
              <Space>
                <LineChartOutlined />
                User Baselines
              </Space>
            ),
            children: renderBaselinesTab()
          }
        ]}
      />
      
      {/* Modals */}
      {renderDetailDrawer()}
      {renderRuleModal()}
      {renderConfigureModal()}
    </div>
  );
};

export default AnomalyDetection;