// src/pages/Dashboard/UserDashboard.js - Personal only

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  List,
  Button,
  Spin,
  Tag,
  Space,
  Typography,
  Progress,
  Timeline,
  Avatar,
  Badge,
  Tooltip,
  Empty,
  Alert,
  Tabs,
  Table
} from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RobotOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  SyncOutlined,
  WarningOutlined,
  VideoCameraOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import DashboardOverview from '../../components/dashboard/DashboardOverview';
import ToolboxTalkWidget from '../../components/toolbox/ToolboxTalkWidget';
import ReadyCheckBanner from '../../components/readycheck/ReadyCheckBanner';
import MyTraining from '../../components/dashboard/MyTraining';
import { useHistory } from 'react-router-dom';
import './UserDashboard.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function UserDashboard() {
  const history = useHistory();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      documents: 0,
      incidents: 0,
      tasks: 0,
      compliance: 0,
      aiUsage: 0,
      analysis: 0,
      activeIncidents: 0,
      safetyProtocols: 0,
      trainingCompliance: 0,
      daysSinceLastIncident: 0
    },
    recentActivity: [],
    notifications: [],
    incidents: [],
    safetyProtocols: [],
    trainingRecords: [],
    environmentalMetrics: [],
    usageStats: {
      aiRequests: { used: 0, total: 50, percentage: 0 },
      documentUploads: { used: 0, total: 10, percentage: 0 },
      apiCalls: { used: 0, total: 100, percentage: 0 },
      videoAnalysis: { used: 0, total: 30, percentage: 0 }
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user-specific data only
      const response = await dashboardService.getMyDashboard();
      
      if (response && response.success) {
        const data = response.data || {};
        setDashboardData({
          stats: {
            documents: data.documents || 0,
            incidents: data.incidents || 0,
            tasks: data.tasks || 0,
            compliance: data.compliance || 85,
            aiUsage: data.aiUsage || 0,
            analysis: data.analysis || 0,
            activeIncidents: data.activeIncidents || 0,
            safetyProtocols: data.safetyProtocols || 0,
            trainingCompliance: data.trainingCompliance || 85,
            daysSinceLastIncident: data.daysSinceLastIncident || 0
          },
          recentActivity: data.recentActivity || [],
          notifications: data.notifications || [],
          incidents: data.incidents || [],
          safetyProtocols: data.safetyProtocols || [],
          trainingRecords: data.trainingRecords || [],
          environmentalMetrics: data.environmentalMetrics || [],
          usageStats: data.usageStats || {
            aiRequests: { used: 0, total: 50, percentage: 0 },
            documentUploads: { used: 0, total: 10, percentage: 0 },
            apiCalls: { used: 0, total: 100, percentage: 0 },
            videoAnalysis: { used: 0, total: 30, percentage: 0 }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getActivityIcon = (type) => {
    const icons = {
      'document': <FileTextOutlined />,
      'incident': <AlertOutlined />,
      'analysis': <ExperimentOutlined />,
      'ai': <RobotOutlined />,
      'compliance': <SafetyCertificateOutlined />,
      'environmental': <EnvironmentOutlined />,
      'video': <VideoCameraOutlined />,
      'training': <BookOutlined />,
      'default': <CheckCircleOutlined />
    };
    return icons[type] || icons.default;
  };

  const getStatusColor = (status) => {
    const colors = {
      'success': '#52c41a',
      'warning': '#faad14',
      'error': '#ff4d4f',
      'info': '#1890ff',
      'high': '#ff4d4f',
      'medium': '#faad14',
      'low': '#52c41a'
    };
    return colors[status] || colors.info;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'high': '#ff4d4f',
      'medium': '#faad14',
      'low': '#52c41a'
    };
    return colors[severity] || '#d9d9d9';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <Title level={2}>
            <DashboardOutlined /> My Dashboard
          </Title>
          <div className="header-subtitle">
            <Text type="secondary">
              Welcome back, <strong>{user?.name || 'User'}</strong>!
            </Text>
            <Tag color="blue" style={{ marginLeft: 8 }}>User</Tag>
            <Tag icon={<CalendarOutlined />} color="green">
              {new Date().toLocaleDateString()}
            </Tag>
          </div>
        </div>
        <div className="header-right">
          <Button icon={<SyncOutlined />} onClick={fetchDashboardData} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <DashboardOverview title="My safety status" />

      <ReadyCheckBanner />

      <ToolboxTalkWidget />

      {/* Tabs */}
      <Tabs defaultActiveKey="overview" className="dashboard-tabs">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="My Recent Activity" className="activity-card">
                {dashboardData.recentActivity.length > 0 ? (
                  <Timeline
                    items={dashboardData.recentActivity.slice(0, 5).map(activity => ({
                      color: getStatusColor(activity.status),
                      dot: getActivityIcon(activity.type),
                      children: (
                        <div className="activity-item">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-description">{activity.description}</div>
                          <div className="activity-time">
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                          </div>
                        </div>
                      )
                    }))}
                  />
                ) : (
                  <Empty description="No recent activity" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="My Usage" className="usage-card">
                <div className="usage-grid">
                  <div className="usage-item">
                    <div className="usage-label"><RobotOutlined /> AI Requests</div>
                    <Progress
                      percent={dashboardData.usageStats.aiRequests.percentage}
                      strokeColor="#eb2f96"
                      format={() => `${dashboardData.usageStats.aiRequests.used}/${dashboardData.usageStats.aiRequests.total}`}
                    />
                  </div>
                  <div className="usage-item">
                    <div className="usage-label"><FileTextOutlined /> Document Uploads</div>
                    <Progress
                      percent={dashboardData.usageStats.documentUploads.percentage}
                      strokeColor="#1890ff"
                      format={() => `${dashboardData.usageStats.documentUploads.used}/${dashboardData.usageStats.documentUploads.total}`}
                    />
                  </div>
                  <div className="usage-item">
                    <div className="usage-label"><VideoCameraOutlined /> Video Analysis</div>
                    <Progress
                      percent={dashboardData.usageStats.videoAnalysis?.percentage || 0}
                      strokeColor="#722ed1"
                      format={() => `${dashboardData.usageStats.videoAnalysis?.used || 0}/${dashboardData.usageStats.videoAnalysis?.total || 30} min`}
                    />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="My Incidents" key="incidents">
          <Card title="My Incidents">
            <Table
              columns={[
                { title: 'Title', dataIndex: 'title', key: 'title' },
                { title: 'Type', dataIndex: 'type', key: 'type', render: (t) => <Tag color="blue">{t}</Tag> },
                { title: 'Severity', dataIndex: 'severity', key: 'severity', render: (s) => <Tag color={getSeverityColor(s)}>{s}</Tag> },
                { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={getStatusColor(s)}>{s}</Tag> },
                { title: 'Date', dataIndex: 'reportedDate', key: 'reportedDate', render: (d) => d ? new Date(d).toLocaleDateString() : 'N/A' }
              ]}
              dataSource={dashboardData.incidents}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="My Training" key="training">
          <MyTraining />
        </TabPane>
      </Tabs>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Quick Actions" className="quick-actions-card">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Button icon={<FileTextOutlined />} block onClick={() => history.push('/document-management?tab=documents')}>Upload Document</Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button icon={<AlertOutlined />} block onClick={() => history.push('/incidents')}>Report Incident</Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button icon={<RobotOutlined />} block onClick={() => history.push('/ai-services')}>AI Analysis</Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button icon={<SafetyCertificateOutlined />} block onClick={() => history.push('/compliance')}>Check Compliance</Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default UserDashboard;