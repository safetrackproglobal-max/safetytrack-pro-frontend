// src/pages/Dashboard/EmployeeDashboard.js - Personal + Team with Company Name & Logo (No Incident Table)
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
  Table,
  Divider,
  Descriptions,
  Image
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
  BookOutlined,
  TeamOutlined,
  BankOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  HomeOutlined,
  ShopOutlined,
  ApartmentOutlined,
  CrownOutlined,
  TrophyOutlined,
  GoldOutlined,
  IncidentOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import notificationService from '../../services/notificationService';
import './EmployeeDashboard.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [incidentStats, setIncidentStats] = useState({
    myIncidents: 0,
    activeIncidents: 0,
    teamIncidents: 0,
    resolvedIncidents: 0
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    role: '',
    user_type: '',
    department: '',
    employee_id: '',
    phone: '',
    company_id: null,
    company_name: '',
    plan: '',
    subscription_status: '',
    verified: false,
    is_active: false
  });
  const [dashboardData, setDashboardData] = useState({
    personal: {
      stats: {
        documents: 0,
        incidents: 0,
        tasks: 0,
        compliance: 0,
        aiUsage: 0,
        analysis: 0
      },
      recentActivity: [],
      notifications: [],
      incidents: [],
      trainingRecords: [],
      usageStats: {
        aiRequests: { used: 0, total: 50, percentage: 0 },
        documentUploads: { used: 0, total: 10, percentage: 0 },
        apiCalls: { used: 0, total: 100, percentage: 0 },
        videoAnalysis: { used: 0, total: 30, percentage: 0 }
      }
    },
    team: {
      members: 0,
      recentActivity: [],
      incidents: [],
      trainingCompliance: 0,
      safetyProtocols: []
    },
    company: {
      id: null,
      name: '',
      logo_url: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      industry: '',
      employee_count: 0,
      plan: '',
      hospital_id: null,
      hospital_name: '',
      environmentalMetrics: [],
      safetyProtocols: [],
      activeIncidents: 0,
      daysSinceLastIncident: 0,
      departments: []
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ Set user info from Auth context
      if (user) {
        setUserInfo({
          name: user.name || 'User',
          email: user.email || '',
          role: user.role || user.user_type || 'Employee',
          user_type: user.user_type || 'employee',
          department: user.department || '',
          employee_id: user.employee_id || '',
          phone: user.phone || '',
          company_id: user.company_id || null,
          company_name: user.company_name || 'Your Company',
          plan: user.plan || 'free',
          subscription_status: user.subscription_status || 'active',
          verified: user.verified || user.is_verified || false,
          is_active: user.is_active || false
        });

        // ✅ Set company info from user data
        const companyName = user.company_name || 'Your Company';
        const companyId = user.company_id || null;
        const companyLogoUrl = user.company_logo || null;

        setDashboardData(prev => ({
          ...prev,
          company: {
            ...prev.company,
            id: companyId,
            name: companyName,
            logo_url: companyLogoUrl || '',
            industry: user.industry || '',
            employee_count: user.employee_count || 0,
            plan: user.plan || 'free',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
          }
        }));

        // ✅ Fetch company logo if available
        if (companyLogoUrl) {
          setCompanyLogo(companyLogoUrl);
        } else if (companyId) {
          try {
            const logoResponse = await dashboardService.getCompanyLogo(companyId);
            if (logoResponse && logoResponse.success) {
              const logo = logoResponse.data?.logo_url || logoResponse.logo_url || null;
              if (logo) {
                setCompanyLogo(logo);
                setDashboardData(prev => ({
                  ...prev,
                  company: {
                    ...prev.company,
                    logo_url: logo
                  }
                }));
              }
            }
          } catch (error) {
            console.warn('Could not fetch company logo:', error);
          }
        }
      }

      // ✅ Fetch incidents stats
      await fetchIncidentStats();

      // ✅ Fetch personal data
      try {
        const personalResponse = await dashboardService.getMyDashboard();
        if (personalResponse?.success) {
          const data = personalResponse.data || {};
          setDashboardData(prev => ({
            ...prev,
            personal: {
              stats: {
                documents: data.documents || 0,
                incidents: data.incidents || 0,
                tasks: data.tasks || 0,
                compliance: data.compliance || 85,
                aiUsage: data.aiUsage || 0,
                analysis: data.analysis || 0
              },
              recentActivity: data.recentActivity || [],
              notifications: data.notifications || [],
              incidents: data.incidents || [],
              trainingRecords: data.trainingRecords || [],
              usageStats: data.usageStats || {
                aiRequests: { used: 0, total: 50, percentage: 0 },
                documentUploads: { used: 0, total: 10, percentage: 0 },
                apiCalls: { used: 0, total: 100, percentage: 0 },
                videoAnalysis: { used: 0, total: 30, percentage: 0 }
              }
            }
          }));
        }
      } catch (error) {
        console.warn('Could not fetch personal data:', error);
      }

      // ✅ Fetch team data
      try {
        const teamResponse = await dashboardService.getTeamDashboard();
        if (teamResponse?.success) {
          const data = teamResponse.data || {};
          setDashboardData(prev => ({
            ...prev,
            team: {
              members: data.members || 0,
              recentActivity: data.recentActivity || [],
              incidents: data.incidents || [],
              trainingCompliance: data.trainingCompliance || 85,
              safetyProtocols: data.safetyProtocols || []
            }
          }));
        }
      } catch (error) {
        console.warn('Could not fetch team data:', error);
      }

      // ✅ Fetch company overview
      try {
        const companyResponse = await dashboardService.getCompanyOverview();
        if (companyResponse?.success) {
          const data = companyResponse.data || {};
          setDashboardData(prev => ({
            ...prev,
            company: {
              ...prev.company,
              environmentalMetrics: data.environmentalMetrics || [],
              safetyProtocols: data.safetyProtocols || [],
              activeIncidents: data.activeIncidents || 0,
              daysSinceLastIncident: data.daysSinceLastIncident || 0,
              departments: data.departments || []
            }
          }));
        }
      } catch (error) {
        console.warn('Could not fetch company overview:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch incident stats
  const fetchIncidentStats = async () => {
    try {
      const response = await notificationService.getIncidents();
      if (response && response.success) {
        const incidents = response.incidents || [];
        
        // Calculate stats
        const myIncidents = incidents.filter(i => i.reported_by === user?.id).length;
        const activeIncidents = incidents.filter(i => i.status === 'reported' || i.status === 'investigating').length;
        const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
        const teamIncidents = incidents.length;

        setIncidentStats({
          myIncidents,
          activeIncidents,
          teamIncidents,
          resolvedIncidents
        });

        // Update dashboard data
        setDashboardData(prev => ({
          ...prev,
          personal: {
            ...prev.personal,
            stats: {
              ...prev.personal.stats,
              incidents: myIncidents
            }
          },
          company: {
            ...prev.company,
            activeIncidents: activeIncidents
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching incident stats:', error);
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

  const getPlanColor = (plan) => {
    const colors = {
      'free': 'green',
      'basic': 'blue',
      'pro': 'purple',
      'enterprise': 'gold',
      'custom': 'cyan'
    };
    return colors[plan] || 'default';
  };

  // Get initials for fallback avatar
  const getCompanyInitials = () => {
    const name = dashboardData.company.name || 'C';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserInitials = () => {
    const name = userInfo.name || 'U';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  const companyName = dashboardData.company.name || 'Your Company';
  const logoUrl = companyLogo || dashboardData.company.logo_url;
  const hasHospital = dashboardData.company.hospital_id !== null;
  const hospitalName = dashboardData.company.hospital_name || 'No Hospital Assigned';

  return (
    <div className="employee-dashboard">
      {/* ✅ User Profile Header */}
      <div className="user-profile-header">
        <Card className="user-profile-card">
          <Row gutter={[24, 24]} align="middle">
            <Col>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
                className="user-avatar"
              >
                {getUserInitials()}
              </Avatar>
            </Col>
            <Col flex="auto">
              <div className="user-details">
                <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
                  {userInfo.name}
                </Title>
                <Space size={8} wrap>
                  <Tag icon={<IdcardOutlined />} color="blue">
                    {userInfo.role || userInfo.user_type || 'Employee'}
                  </Tag>
                  <Tag icon={<MailOutlined />} color="cyan">
                    {userInfo.email}
                  </Tag>
                  {userInfo.department && (
                    <Tag icon={<ApartmentOutlined />} color="purple">
                      {userInfo.department}
                    </Tag>
                  )}
                  {userInfo.employee_id && (
                    <Tag icon={<IdcardOutlined />} color="orange">
                      ID: {userInfo.employee_id}
                    </Tag>
                  )}
                  {userInfo.verified ? (
                    <Tag icon={<CheckCircleOutlined />} color="green">
                      Verified
                    </Tag>
                  ) : (
                    <Tag icon={<ClockCircleOutlined />} color="orange">
                      Pending Verification
                    </Tag>
                  )}
                  {userInfo.is_active ? (
                    <Tag icon={<CheckCircleOutlined />} color="green">
                      Active
                    </Tag>
                  ) : (
                    <Tag icon={<WarningOutlined />} color="red">
                      Inactive
                    </Tag>
                  )}
                </Space>
              </div>
            </Col>
            <Col>
              <Button icon={<SyncOutlined />} onClick={fetchDashboardData} loading={loading}>
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      {/* ✅ Company Header with Logo and Name */}
      <div className="company-header">
        <Card className="company-header-card">
          <Row gutter={[24, 24]} align="middle">
            <Col>
              {/* Company Logo */}
              <div className="company-logo-wrapper">
                {logoUrl ? (
                  <Avatar
                    size={80}
                    src={logoUrl}
                    alt={companyName}
                    className="company-logo"
                  />
                ) : (
                  <Avatar
                    size={80}
                    icon={<BankOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                    className="company-logo"
                  >
                    {getCompanyInitials()}
                  </Avatar>
                )}
              </div>
            </Col>
            <Col flex="auto">
              <div className="company-details">
                <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                  {companyName}
                </Title>
                <Space size={8} wrap>
                  {dashboardData.company.industry && (
                    <Tag icon={<GlobalOutlined />} color="blue">
                      {dashboardData.company.industry}
                    </Tag>
                  )}
                  <Tag icon={<TeamOutlined />} color="green">
                    {dashboardData.company.employee_count} Employees
                  </Tag>
                  <Tag icon={<BankOutlined />} color={getPlanColor(dashboardData.company.plan)}>
                    {dashboardData.company.plan?.toUpperCase() || 'Plan'}
                  </Tag>
                  {hasHospital && (
                    <Tag icon={<MedicineBoxOutlined />} color="purple">
                      Hospital: {hospitalName}
                    </Tag>
                  )}
                  {!hasHospital && (
                    <Tag icon={<MedicineBoxOutlined />} color="orange">
                      No Hospital Assigned
                    </Tag>
                  )}
                </Space>
              </div>
            </Col>
          </Row>

          {/* Company Contact Info */}
          {(dashboardData.company.email || dashboardData.company.phone || dashboardData.company.address) && (
            <Divider style={{ margin: '16px 0' }} />
          )}
          <Row gutter={[16, 16]}>
            {dashboardData.company.email && (
              <Col>
                <Space>
                  <MailOutlined style={{ color: '#666' }} />
                  <Text type="secondary">{dashboardData.company.email}</Text>
                </Space>
              </Col>
            )}
            {dashboardData.company.phone && (
              <Col>
                <Space>
                  <PhoneOutlined style={{ color: '#666' }} />
                  <Text type="secondary">{dashboardData.company.phone}</Text>
                </Space>
              </Col>
            )}
            {dashboardData.company.address && (
              <Col>
                <Space>
                  <HomeOutlined style={{ color: '#666' }} />
                  <Text type="secondary">{dashboardData.company.address}</Text>
                </Space>
              </Col>
            )}
            {dashboardData.company.website && (
              <Col>
                <Space>
                  <GlobalOutlined style={{ color: '#666' }} />
                  <a href={dashboardData.company.website} target="_blank" rel="noopener noreferrer">
                    {dashboardData.company.website}
                  </a>
                </Space>
              </Col>
            )}
          </Row>
        </Card>
      </div>

      {/* Personal Stats */}
      <div className="section-title">
        <Title level={4}>My Personal Stats</Title>
      </div>
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card">
            <Statistic
              title="My Documents"
              value={dashboardData.personal.stats.documents}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card">
            <Statistic
              title="My Incidents"
              value={incidentStats.myIncidents}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card">
            <Statistic
              title="My Tasks"
              value={dashboardData.personal.stats.tasks}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card">
            <Statistic
              title="My Compliance"
              value={dashboardData.personal.stats.compliance}
              suffix="%"
              prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Incident Stats Cards */}
      <div className="section-title">
        <Title level={4}>
          <AlertOutlined /> Incident Overview
        </Title>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card incident-stat-card">
            <Statistic
              title="Active Incidents"
              value={incidentStats.activeIncidents}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Currently open incidents
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card incident-stat-card">
            <Statistic
              title="Team Incidents"
              value={incidentStats.teamIncidents}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Total company incidents
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card incident-stat-card">
            <Statistic
              title="Resolved Incidents"
              value={incidentStats.resolvedIncidents}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Successfully resolved
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stats-card incident-stat-card">
            <Statistic
              title="My Incidents"
              value={incidentStats.myIncidents}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Incidents you reported
            </div>
          </Card>
        </Col>
      </Row>

      {/* Team Stats */}
      <div className="section-title">
        <Title level={4}>Team Overview</Title>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Team Recent Activity" className="activity-card">
            {dashboardData.team.recentActivity.length > 0 ? (
              <Timeline
                items={dashboardData.team.recentActivity.slice(0, 5).map(activity => ({
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
              <Empty description="No team activity" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Team Stats" className="team-stats-card">
            <div className="team-stats-grid">
              <div className="team-stat-item">
                <div className="team-stat-value">{dashboardData.team.members}</div>
                <div className="team-stat-label">Team Members</div>
              </div>
              <div className="team-stat-item">
                <div className="team-stat-value">{incidentStats.teamIncidents}</div>
                <div className="team-stat-label">Team Incidents</div>
              </div>
              <div className="team-stat-item">
                <div className="team-stat-value">{dashboardData.team.trainingCompliance}%</div>
                <div className="team-stat-label">Training Compliance</div>
              </div>
              <div className="team-stat-item">
                <div className="team-stat-value">{dashboardData.team.safetyProtocols.length}</div>
                <div className="team-stat-label">Safety Protocols</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Company Overview (Limited for Employees) */}
      <div className="section-title">
        <Title level={4}>Company Overview</Title>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={`${companyName} - Safety Stats`} className="company-card">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="Active Incidents"
                  value={dashboardData.company.activeIncidents}
                  prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="Days Safe"
                  value={dashboardData.company.daysSinceLastIncident}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="Safety Protocols"
                  value={dashboardData.company.safetyProtocols.length}
                  prefix={<SafetyCertificateOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>

            <Divider />

            <div className="company-metrics">
              <Title level={5}>Environmental Metrics</Title>
              <Row gutter={[16, 16]}>
                {dashboardData.company.environmentalMetrics.map(metric => (
                  <Col xs={24} sm={12} md={6} key={metric.parameter}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: getStatusColor(metric.status) }}>
                          {metric.current} {metric.unit}
                        </div>
                        <div style={{ color: '#666' }}>{metric.parameter}</div>
                        <Progress
                          percent={metric.target ? (metric.current / metric.target) * 100 : 0}
                          size="small"
                          strokeColor={getStatusColor(metric.status)}
                        />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Quick Actions" className="quick-actions-card">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Button icon={<FileTextOutlined />} block>Upload Document</Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button icon={<AlertOutlined />} block onClick={() => window.location.href = '/incidents/report'}>
                  Report Incident
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button icon={<RobotOutlined />} block>AI Analysis</Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button icon={<SafetyCertificateOutlined />} block>Check Compliance</Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default EmployeeDashboard;