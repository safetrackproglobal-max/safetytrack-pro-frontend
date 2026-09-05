// src/components/documents/DocumentAnalytics.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Select, Statistic, 
  Progress, Tag, Badge, Tooltip, message, Spin, Empty,
  Tabs, List, Avatar, Divider, Alert, Modal, Form,
  Radio, Checkbox, DatePicker, Table, Collapse, Typography,
  Skeleton, Dropdown, Menu, Popover, Switch
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  DashboardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ExportOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  FireOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  RiseOutlined,
  FallOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ComposedChart, ResponsiveContainer, Cell, Scatter,
  Treemap, Sankey
} from 'recharts';
import documentService from '../../services/documentService';
import './DocumentAnalytics.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// ============================================================
// CONSTANTS
// ============================================================

const CHART_COLORS = {
  blue: '#1890ff',
  green: '#52c41a',
  yellow: '#faad14',
  red: '#f5222d',
  purple: '#722ed1',
  cyan: '#13c2c2',
  orange: '#fa541c',
  pink: '#eb2f96',
  teal: '#36cfc9',
  lime: '#a0d911'
};

const STATUS_COLORS = {
  draft: '#d9d9d9',
  review: '#1890ff',
  approved: '#52c41a',
  published: '#1890ff',
  archived: '#faad14',
  rejected: '#f5222d'
};

const STATUS_ICONS = {
  draft: <FileTextOutlined />,
  review: <ClockCircleOutlined />,
  approved: <CheckCircleOutlined />,
  published: <SafetyCertificateOutlined />,
  archived: <InfoCircleOutlined />,
  rejected: <CloseCircleOutlined />
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentAnalytics = ({ 
  companyId = null,
  embedded = false,
  timeRange = '30d'
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [timeframe, setTimeframe] = useState(timeRange);
  const [chartType, setChartType] = useState('bar');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [reportType, setReportType] = useState('overview');
  const [exportFormat, setExportFormat] = useState('csv');
  const [showPercentage, setShowPercentage] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewResult, complianceResult] = await Promise.all([
        documentService.getDocumentAnalyticsOverview({ timeframe }),
        documentService.getDocumentComplianceAnalytics()
      ]);
      
      if (overviewResult.success) {
        setAnalyticsData(overviewResult);
      } else {
        message.error('Failed to load overview analytics');
      }
      
      if (complianceResult.success) {
        setComplianceData(complianceResult);
      }
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
      message.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadAnalytics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAnalytics, 300000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [loadAnalytics]);

  // ============================================================
  // EXPORT HANDLER
  // ============================================================
  
  const handleExport = async (values) => {
    try {
      const result = await documentService.exportDocumentAnalytics({
        type: reportType,
        format: exportFormat,
        timeframe: timeframe
      });
      
      if (result.success) {
        // Download file
        const blob = new Blob([result.data], { 
          type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        
        message.success('Analytics exported successfully');
        setExportModalVisible(false);
      } else {
        message.error(result.error || 'Export failed');
      }
      
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export analytics');
    }
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Overview Stats
  const renderOverviewStats = () => {
    if (!analyticsData) return null;
    
    const overview = analyticsData.overview || {};
    
    return (
      <Row gutter={[16, 16]} className="analytics-stats">
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="stat-card stat-total">
            <Statistic
              title="Total Documents"
              value={overview.total_documents || 0}
              prefix={<FileTextOutlined />}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              +{overview.new_documents || 0} new in {timeframe}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="stat-card stat-published">
            <Statistic
              title="Published"
              value={overview.documents_by_status?.find(s => s.status === 'published')?.count || 0}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="stat-card stat-review">
            <Statistic
              title="In Review"
              value={overview.documents_by_status?.find(s => s.status === 'review')?.count || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="stat-card stat-draft">
            <Statistic
              title="Drafts"
              value={overview.documents_by_status?.find(s => s.status === 'draft')?.count || 0}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Render Status Distribution Chart
  const renderStatusDistribution = () => {
    if (!analyticsData) return null;
    
    const data = analyticsData.overview?.documents_by_status || [];
    const chartData = data.map(item => ({
      name: item.status?.toUpperCase() || 'Unknown',
      value: item.count || 0
    }));
    
    return (
      <Card 
        title="Documents by Status" 
        size="small"
        extra={
          <Button.Group>
            <Button 
              icon={<PieChartOutlined />}
              type={chartType === 'pie' ? 'primary' : 'default'}
              onClick={() => setChartType('pie')}
            />
            <Button 
              icon={<BarChartOutlined />}
              type={chartType === 'bar' ? 'primary' : 'default'}
              onClick={() => setChartType('bar')}
            />
          </Button.Group>
        }
        className="chart-card"
      >
        <ResponsiveContainer width="100%" height={280}>
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#d9d9d9'} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#d9d9d9'} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </Card>
    );
  };

  // Render Module Distribution
  const renderModuleDistribution = () => {
    if (!analyticsData) return null;
    
    const data = analyticsData.overview?.documents_by_module || [];
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', 
      '#722ed1', '#13c2c2', '#fa541c', '#eb2f96'
    ];
    
    const chartData = data.map(item => ({
      name: item.module?.toUpperCase() || 'General',
      value: item.count || 0
    }));
    
    return (
      <Card title="Documents by Module" size="small" className="chart-card">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  // Render Growth Trends
  const renderGrowthTrends = () => {
    if (!analyticsData) return null;
    
    const data = analyticsData.growth_trends || [];
    
    return (
      <Card title="Document Growth Trends" size="small" className="chart-card">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="created"
              stroke="#1890ff"
              fill="#1890ff"
              fillOpacity={0.2}
              name="New Documents"
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#52c41a"
              fill="#52c41a"
              fillOpacity={0.1}
              name="Cumulative"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  // Render Compliance Analytics
  const renderComplianceAnalytics = () => {
    if (!complianceData) return null;
    
    const compliance = complianceData.compliance || {};
    
    return (
      <Card title="Compliance Overview" size="small" className="chart-card">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Progress
                type="circle"
                percent={compliance.compliance_rate || 0}
                strokeColor={(compliance.compliance_rate || 0) >= 80 ? '#52c41a' : '#faad14'}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{percent}%</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>Compliance Rate</div>
                  </div>
                )}
              />
            </div>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic
              title="Expired"
              value={compliance.expired || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Expiring Soon"
              value={compliance.expiring_soon || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Confidential"
              value={compliance.confidential || 0}
              prefix={<LockOutlined />}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Requires Approval"
              value={compliance.requires_approval || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  // Render Top Contributors
  const renderTopContributors = () => {
    if (!analyticsData) return null;
    
    const contributors = analyticsData.user_engagement?.top_contributors || [];
    
    if (contributors.length === 0) {
      return (
        <Card title="Top Contributors" size="small">
          <Empty description="No contributor data available" />
        </Card>
      );
    }
    
    const total = contributors.reduce((sum, c) => sum + c.count, 0);
    
    return (
      <Card title="Top Contributors" size="small" className="chart-card">
        <List
          dataSource={contributors}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    background: CHART_COLORS.blue,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                }
                title={item.name || 'Unknown User'}
                description={`${item.count} documents`}
              />
              <div style={{ width: 120 }}>
                <Progress 
                  percent={Math.round((item.count / total) * 100)} 
                  size="small"
                  strokeColor={CHART_COLORS.blue}
                  showInfo={false}
                />
              </div>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  // Render Lifecycle Metrics
  const renderLifecycleMetrics = () => {
    if (!analyticsData) return null;
    
    const lifecycle = analyticsData.lifecycle_metrics || {};
    const statusDist = lifecycle.status_distribution || {};
    
    return (
      <Card title="Document Lifecycle" size="small" className="chart-card">
        <Statistic
          title="Average Time to Publish"
          value={lifecycle.avg_publish_time_days || 0}
          suffix="days"
          valueStyle={{ color: '#1890ff' }}
          style={{ marginBottom: 16 }}
        />
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Draft</span>
            <span>{statusDist.draft || 0}</span>
          </div>
          <Progress 
            percent={Math.round((statusDist.draft || 0) / (analyticsData.overview?.total_documents || 1) * 100)} 
            strokeColor="#d9d9d9"
            showInfo={false}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, marginTop: 16 }}>
            <span>Review</span>
            <span>{statusDist.review || 0}</span>
          </div>
          <Progress 
            percent={Math.round((statusDist.review || 0) / (analyticsData.overview?.total_documents || 1) * 100)} 
            strokeColor="#1890ff"
            showInfo={false}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, marginTop: 16 }}>
            <span>Published</span>
            <span>{statusDist.published || 0}</span>
          </div>
          <Progress 
            percent={Math.round((statusDist.published || 0) / (analyticsData.overview?.total_documents || 1) * 100)} 
            strokeColor="#52c41a"
            showInfo={false}
          />
        </div>
      </Card>
    );
  };

  // Render Export Modal
  const renderExportModal = () => (
    <Modal
      title={<Space><ExportOutlined /> Export Analytics</Space>}
      open={exportModalVisible}
      onCancel={() => setExportModalVisible(false)}
      footer={null}
      width={500}
    >
      <Form layout="vertical" onFinish={handleExport}>
        <Form.Item label="Report Type">
          <Radio.Group 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <Radio value="overview">Overview</Radio>
            <Radio value="compliance">Compliance</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Format">
          <Radio.Group 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <Radio value="csv">CSV</Radio>
            <Radio value="json">JSON</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Timeframe">
          <Select value={timeframe} onChange={setTimeframe}>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
            <Option value="1y">Last Year</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setExportModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
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
  
  if (loading && !analyticsData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="document-analytics" style={{ padding: embedded ? '0' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <BarChartOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
          <Title level={4} style={{ margin: 0 }}>Document Analytics</Title>
          <Badge status="processing" text="Live" />
        </Space>
        <Space>
          <Select value={timeframe} onChange={setTimeframe} style={{ width: 120 }}>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
            <Option value="1y">Last Year</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadAnalytics} loading={loading}>
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<ExportOutlined />} 
            onClick={() => setExportModalVisible(true)}
          >
            Export
          </Button>
        </Space>
      </div>

      {/* Overview Stats */}
      {renderOverviewStats()}

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          {renderStatusDistribution()}
        </Col>
        <Col xs={24} lg={12}>
          {renderModuleDistribution()}
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          {renderGrowthTrends()}
        </Col>
        <Col xs={24} lg={12}>
          {renderComplianceAnalytics()}
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          {renderTopContributors()}
        </Col>
        <Col xs={24} lg={12}>
          {renderLifecycleMetrics()}
        </Col>
      </Row>

      {/* Export Modal */}
      {renderExportModal()}
    </div>
  );
};

export default DocumentAnalytics;