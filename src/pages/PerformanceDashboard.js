// src/pages/safetypro/PerformanceDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Button,
  Select,
  DatePicker,
  Tabs,
  Progress,
  Tag,
  Space,
  Tooltip,
  Modal,
  Timeline,
  Descriptions,
  Avatar,
  message
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  DashboardOutlined,
  BarChartOutlined,
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  DownloadOutlined,
  FilterOutlined,
  EyeOutlined
} from '@ant-design/icons';
import AdminService from '../services/safetyproservice'; // Import the service
import './PerformanceDashboard.css';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const PerformanceDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30days');
  const [overviewData, setOverviewData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [engagementData, setEngagementData] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPerformance, setUserPerformance] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);

  // Fetch performance data using AdminService
  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const days = timeRange === '7days' ? 7 : timeRange === '90days' ? 90 : 30;
      
      // Use AdminService methods
      const [overviewRes, monthlyRes, engagementRes] = await Promise.all([
        AdminService.getPerformanceOverview(days),
        AdminService.getMonthlyPerformance(12),
        AdminService.getEngagementMetrics(days)
      ]);

      if (overviewRes.success) {
        setOverviewData(overviewRes.data);
        setTopPerformers(overviewRes.data.top_performers || []);
      }

      if (monthlyRes.success) {
        setMonthlyData(monthlyRes.data.monthly_data);
      }

      if (engagementRes.success) {
        setEngagementData(engagementRes.data.engagement);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      message.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user performance details using AdminService
  const fetchUserPerformance = async (userId) => {
    try {
      const response = await AdminService.getUserPerformance(userId, 30);
      if (response.success) {
        setUserPerformance(response.data);
        setUserModalVisible(true);
      } else {
        message.error('Failed to load user performance data');
      }
    } catch (error) {
      console.error('Error fetching user performance:', error);
      message.error('Failed to load user performance data');
    }
  };

  // Fetch admin analytics for user (more detailed)
  const fetchAdminUserAnalytics = async (userId) => {
    try {
      const response = await AdminService.getAdminUserAnalytics(userId, 30);
      if (response.success) {
        // You could use this more detailed data instead
        console.log('Admin analytics:', response.data);
      }
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
    }
  };

  // Export performance report
  const handleExportReport = async () => {
    try {
      const reportConfig = {
        time_range: timeRange,
        include_charts: true,
        format: 'pdf'
      };
      
      const response = await AdminService.generatePerformanceReport(reportConfig);
      if (response.success) {
        message.success('Report generated successfully');
        // Handle download - assuming response contains file URL or data
        if (response.data.file_url) {
          window.open(response.data.file_url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report');
    }
  };

  // Get user activity timeline
  const fetchUserActivityTimeline = async (userId) => {
    try {
      const response = await AdminService.getUserActivityTimeline(userId, {
        limit: 10,
        sort: 'desc'
      });
      if (response.success) {
        console.log('User activity timeline:', response.data);
      }
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
    }
  };

  // Get feature usage analytics
  const fetchFeatureUsage = async (userId) => {
    try {
      const response = await AdminService.getFeatureUsage(userId, 30);
      if (response.success) {
        console.log('Feature usage:', response.data);
      }
    } catch (error) {
      console.error('Error fetching feature usage:', error);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  // Format data for charts
  const formatMonthlyChartData = () => {
    return monthlyData.map(item => ({
      name: item.month_name,
      new_users: item.new_users,
      active_users: item.active_users,
      retention_rate: item.retention_rate
    }));
  };

  const formatEngagementChartData = () => {
    if (!engagementData?.dau_data) return [];
    return engagementData.dau_data.slice(-30).map(item => ({
      date: item.date,
      dau: item.dau
    }));
  };

  // Color schemes
  const SUBSCRIPTION_COLORS = {
    free: '#1890ff',
    professional: '#52c41a',
    pro: '#fa8c16',
    custom: '#f5222d'
  };

  const PERFORMANCE_GRADES = {
    'A+': { color: '#52c41a', bg: '#f6ffed' },
    'A': { color: '#73d13d', bg: '#f6ffed' },
    'B': { color: '#fa8c16', bg: '#fff7e6' },
    'C': { color: '#faad14', bg: '#fff7e6' },
    'D': { color: '#ff7875', bg: '#fff1f0' },
    'F': { color: '#f5222d', bg: '#fff1f0' }
  };

  // Enhanced user details handler
  const handleViewUserDetails = async (userId) => {
    try {
      // Fetch multiple user data points
      await Promise.all([
        fetchUserPerformance(userId),
        fetchAdminUserAnalytics(userId),
        fetchFeatureUsage(userId),
        fetchUserActivityTimeline(userId)
      ]);
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  return (
    <div className="performance-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>
          <DashboardOutlined style={{ marginRight: 16, color: '#1890ff' }} />
          Performance Analytics Dashboard
        </h1>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Option value="7days">Last 7 Days</Option>
            <Option value="30days">Last 30 Days</Option>
            <Option value="90days">Last 90 Days</Option>
          </Select>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportReport}
            loading={loading}
          >
            Export Report
          </Button>
        </Space>
      </div>

      {/* Overview Stats */}
      {overviewData && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={overviewData.overview.total_users}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-trend">
                <span style={{ color: '#52c41a' }}>
                  <RiseOutlined /> +{overviewData.overview.new_users} new
                </span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Users"
                value={overviewData.overview.active_users}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <Progress
                percent={overviewData.overview.active_rate.toFixed(1)}
                size="small"
                status="active"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg. Logins/User"
                value={overviewData.overview.avg_logins_per_user}
                prefix={<DashboardOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div className="stat-trend">
                <span>Last {timeRange} days</span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Churn Rate"
                value={overviewData.overview.churn_rate.toFixed(1)}
                suffix="%"
                prefix={<FallOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
              <div className="stat-trend">
                <span>{overviewData.overview.churned_users} users churned</span>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Charts Section */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Monthly User Growth" extra={<CalendarOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatMonthlyChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="new_users" name="New Users" fill="#1890ff" />
                <Bar dataKey="active_users" name="Active Users" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Daily Active Users (DAU)" extra={<FireOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatEngagementChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="dau"
                  name="Daily Active Users"
                  fill="#ff4d4f"
                  stroke="#ff4d4f"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* User Distribution */}
      {overviewData && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card title="User Type Distribution">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={overviewData.distribution.user_types}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {overviewData.distribution.user_types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.type === 'admin' ? '#f5222d' :
                        entry.type === 'employee' ? '#52c41a' : '#1890ff'
                      } />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Subscription Performance">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={overviewData.distribution.subscriptions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <ChartTooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Active Rate']} />
                  <Bar dataKey="active_rate" name="Active Rate" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Engagement Metrics" extra="Stickiness: DAU/MAU">
              {engagementData && (
                <div className="engagement-metrics">
                  <div className="metric-item">
                    <span className="metric-label">MAU:</span>
                    <span className="metric-value">{engagementData.mau}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Avg DAU:</span>
                    <span className="metric-value">{engagementData.avg_dau.toFixed(0)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Stickiness:</span>
                    <span className="metric-value" style={{ color: '#52c41a' }}>
                      {engagementData.stickiness.toFixed(1)}%
                    </span>
                  </div>
                  <div className="activity-distribution">
                    <h4>Activity Distribution:</h4>
                    {engagementData.activity_distribution && (
                      <>
                        <Progress
                          percent={(engagementData.activity_distribution.power_users / engagementData.mau * 100).toFixed(1)}
                          strokeColor="#52c41a"
                          format={() => `Power: ${engagementData.activity_distribution.power_users}`}
                        />
                        <Progress
                          percent={(engagementData.activity_distribution.regular_users / engagementData.mau * 100).toFixed(1)}
                          strokeColor="#1890ff"
                          format={() => `Regular: ${engagementData.activity_distribution.regular_users}`}
                        />
                        <Progress
                          percent={(engagementData.activity_distribution.casual_users / engagementData.mau * 100).toFixed(1)}
                          strokeColor="#fa8c16"
                          format={() => `Casual: ${engagementData.activity_distribution.casual_users}`}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Top Performers & At-Risk Users */}
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                <span>Top Performers</span>
              </Space>
            }
            extra={
              <Button size="small" onClick={() => fetchPerformanceData()}>
                <FilterOutlined /> Refresh
              </Button>
            }
          >
            <Table
              dataSource={topPerformers}
              pagination={false}
              size="small"
              loading={loading}
              columns={[
                {
                  title: 'User',
                  dataIndex: 'name',
                  key: 'user',
                  render: (text, record) => (
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <div>
                        <div>{text}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
                      </div>
                    </Space>
                  )
                },
                {
                  title: 'Plan',
                  dataIndex: 'subscription_plan',
                  key: 'plan',
                  render: (plan) => (
                    <Tag color={SUBSCRIPTION_COLORS[plan] || 'default'}>
                      {plan?.toUpperCase() || 'N/A'}
                    </Tag>
                  )
                },
                {
                  title: 'Score',
                  dataIndex: 'performance_score',
                  key: 'score',
                  render: (score) => {
                    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : 
                                 score >= 70 ? 'B' : score >= 60 ? 'C' :
                                 score >= 50 ? 'D' : 'F';
                    const config = PERFORMANCE_GRADES[grade];
                    
                    return (
                      <Tag color={config?.color} style={{ background: config?.bg }}>
                        {grade} ({score?.toFixed(0) || 0})
                      </Tag>
                    );
                  }
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewUserDetails(record.id)}
                      loading={loading}
                    >
                      Details
                    </Button>
                  )
                }
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={
              <Space>
                <FallOutlined />
                <span>At-Risk Users</span>
              </Space>
            }
            extra={
              <Tag color="red">{overviewData?.at_risk_users?.length || 0} users</Tag>
            }
          >
            <Table
              dataSource={overviewData?.at_risk_users || []}
              pagination={false}
              size="small"
              loading={loading}
              columns={[
                {
                  title: 'User',
                  dataIndex: 'name',
                  key: 'user',
                  render: (text, record) => (
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <div>
                        <div>{text}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
                      </div>
                    </Space>
                  )
                },
                {
                  title: 'Last Active',
                  dataIndex: 'last_active',
                  key: 'last_active',
                  render: (date) => (
                    <Tooltip title={date}>
                      <span>{date ? new Date(date).toLocaleDateString() : 'Never'}</span>
                    </Tooltip>
                  )
                },
                {
                  title: 'Days Inactive',
                  dataIndex: 'days_inactive',
                  key: 'days_inactive',
                  render: (days) => (
                    <Tag color={days > 60 ? 'red' : days > 30 ? 'orange' : 'yellow'}>
                      {days} days
                    </Tag>
                  )
                },
                {
                  title: 'Action',
                  key: 'action',
                  render: (_, record) => (
                    <Button size="small" type="link">
                      Send Reminder
                    </Button>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* User Performance Modal */}
      <Modal
        title="User Performance Details"
        width={800}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUserModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="analytics" 
            type="primary"
            onClick={() => userPerformance && fetchAdminUserAnalytics(userPerformance.user.id)}
          >
            View Advanced Analytics
          </Button>
        ]}
      >
        {userPerformance && (
          <div className="user-performance-modal">
            {/* User Info */}
            <Descriptions title="User Information" bordered>
              <Descriptions.Item label="Name">{userPerformance.user.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{userPerformance.user.email}</Descriptions.Item>
              <Descriptions.Item label="User Type">
                <Tag color="blue">{userPerformance.user.user_type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Subscription">
                <Tag color={SUBSCRIPTION_COLORS[userPerformance.user.subscription_plan]}>
                  {userPerformance.user.subscription_plan}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Joined Date">
                {new Date(userPerformance.user.joined_date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Active">
                {userPerformance.user.last_active ? 
                  new Date(userPerformance.user.last_active).toLocaleString() : 'Never'
                }
              </Descriptions.Item>
            </Descriptions>

            {/* Performance Metrics */}
            <div style={{ marginTop: 24 }}>
              <h3>Performance Metrics</h3>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Performance Score"
                      value={userPerformance.metrics.performance_score}
                      suffix="/100"
                      valueStyle={{
                        color: userPerformance.metrics.performance_score >= 80 ? '#52c41a' :
                               userPerformance.metrics.performance_score >= 60 ? '#fa8c16' : '#f5222d'
                      }}
                    />
                    <Tag color={PERFORMANCE_GRADES[userPerformance.metrics.performance_grade]?.color}>
                      Grade: {userPerformance.metrics.performance_grade}
                    </Tag>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Logins"
                      value={userPerformance.metrics.login_count}
                      prefix={<UserOutlined />}
                    />
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {userPerformance.metrics.avg_daily_logins} per day
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Activities"
                      value={userPerformance.metrics.activity_count}
                      prefix={<DashboardOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Avg Session"
                      value={userPerformance.metrics.avg_session_duration_minutes}
                      suffix="minutes"
                      prefix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Feature Usage */}
            {userPerformance.metrics.feature_usage && (
              <div style={{ marginTop: 24 }}>
                <h3>Feature Usage</h3>
                <Row gutter={8}>
                  {Object.entries(userPerformance.metrics.feature_usage).map(([feature, count]) => (
                    <Col span={6} key={feature}>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{count}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{feature.replace('_', ' ')}</div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* Comparative Analysis */}
            {userPerformance.comparative && (
              <div style={{ marginTop: 24 }}>
                <h3>Comparative Analysis</h3>
                <Card>
                  <p>
                    Compared to {userPerformance.comparative.similar_users_count} similar users:
                  </p>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: 16 }}>
                        <strong>Logins:</strong>
                        <Progress
                          percent={userPerformance.comparative.comparison.logins.percentile}
                          status="active"
                          format={percent => (
                            <span>
                              {userPerformance.comparative.comparison.logins.user} logins
                              ({percent}th percentile)
                            </span>
                          )}
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 16 }}>
                        <strong>Activities:</strong>
                        <Progress
                          percent={userPerformance.comparative.comparison.activities.percentile}
                          status="active"
                          format={percent => (
                            <span>
                              {userPerformance.comparative.comparison.activities.user} activities
                              ({percent}th percentile)
                            </span>
                          )}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PerformanceDashboard;