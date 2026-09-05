// src/components/documents/DocumentDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Space, Table, Tag,
  Progress, List, Avatar, Badge, Timeline, message,
  Tabs, Select, DatePicker, Modal, Spin, Empty, Divider
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  GlobalOutlined,
  DashboardOutlined,
  ExportOutlined,
  ReloadOutlined,
  BellOutlined,
  SettingOutlined,
  FolderOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import documentService from '../../services/documentService';
import './DocumentDashboard.css';

const { TabPane } = Tabs;
const { Option } = Select;

const DocumentDashboard = ({ companyId = null }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    review: 0,
    approved: 0,
    published: 0,
    archived: 0,
    rejected: 0
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [moduleDistribution, setModuleDistribution] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [documentTrend, setDocumentTrend] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [reviewStatus, setReviewStatus] = useState([]);
  const [timeRange, setTimeRange] = useState('30d');

  // ============================================================
  // COLORS
  // ============================================================
  
  const STATUS_COLORS = {
    draft: '#d9d9d9',
    review: '#1890ff',
    approved: '#52c41a',
    published: '#1890ff',
    archived: '#faad14',
    rejected: '#f5222d'
  };

  const MODULE_COLORS = {
    hse: '#faad14',
    environmental: '#52c41a',
    hospital: '#f5222d',
    quality: '#1890ff',
    supply_chain: '#722ed1',
    training: '#2f54eb',
    general: '#8c8c8c'
  };

  const CHART_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsData = await documentService.getStats({ company_id: companyId });
      setStats(statsData || { total: 0, draft: 0, review: 0, approved: 0, published: 0, archived: 0, rejected: 0 });
      
      // Fetch recent documents
      try {
        const recentData = await documentService.getRecentDocuments({ limit: 10, company_id: companyId });
        setRecentDocuments(Array.isArray(recentData.documents) ? recentData.documents : []);
      } catch (e) {
        console.warn('Recent documents not available:', e);
        setRecentDocuments([]);
      }
      
      // Fetch pending tasks
      try {
        const tasksData = await documentService.getPendingTasks({ company_id: companyId });
        setPendingTasks(Array.isArray(tasksData.tasks) ? tasksData.tasks : []);
      } catch (e) {
        console.warn('Pending tasks not available:', e);
        setPendingTasks([]);
      }
      
      // Fetch expiring documents
      try {
        const expiringData = await documentService.getExpiringDocuments(30, { company_id: companyId });
        setExpiringDocuments(Array.isArray(expiringData.documents) ? expiringData.documents : []);
      } catch (e) {
        console.warn('Expiring documents not available:', e);
        setExpiringDocuments([]);
      }
      
      // Fetch module stats - ✅ ENSURE IT'S ALWAYS AN ARRAY
      try {
        const moduleData = await documentService.getModuleStats({ company_id: companyId });
        const moduleArray = moduleData?.data;
        if (Array.isArray(moduleArray)) {
          setModuleDistribution(moduleArray);
        } else {
          console.warn('Module stats data is not an array, using empty array');
          setModuleDistribution([]);
        }
      } catch (e) {
        console.warn('Module stats not available:', e);
        setModuleDistribution([]);
      }
      
      // Build status distribution from stats
      const statusData = [
        { key: 'draft', name: 'Draft', value: statsData.draft || 0 },
        { key: 'review', name: 'Review', value: statsData.review || 0 },
        { key: 'approved', name: 'Approved', value: statsData.approved || 0 },
        { key: 'published', name: 'Published', value: statsData.published || 0 },
        { key: 'archived', name: 'Archived', value: statsData.archived || 0 },
        { key: 'rejected', name: 'Rejected', value: statsData.rejected || 0 }
      ];
      setStatusDistribution(statusData);
      
      // Build review status
      const reviewData = [
        { key: 'current', name: 'Current', value: statsData.published || 0 },
        { key: 'pending', name: 'Pending Review', value: statsData.review || 0 },
        { key: 'overdue', name: 'Overdue', value: 0 },
        { key: 'never_reviewed', name: 'Never Reviewed', value: statsData.draft || 0 }
      ];
      setReviewStatus(reviewData);
      
      // Generate document trend (mock data for now)
      const trendData = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        trendData.push({
          date: date.toLocaleDateString(),
          count: Math.floor(Math.random() * 5) + 1
        });
      }
      setDocumentTrend(trendData);
      
      // Top contributors (mock)
      setTopContributors([
        { name: 'John Smith', count: 12 },
        { name: 'Jane Doe', count: 8 },
        { name: 'Bob Johnson', count: 5 }
      ]);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      message.error('Failed to load dashboard data');
      // ✅ Set all to empty arrays on error
      setModuleDistribution([]);
      setRecentDocuments([]);
      setPendingTasks([]);
      setExpiringDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeRange, companyId]);

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // 1. Status Distribution Chart
  const renderStatusDistribution = () => (
    <Card title="Documents by Status" size="small" className="chart-card">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={statusDistribution}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {statusDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.key] || '#d9d9d9'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  // 2. Module Distribution (Pie Chart) - ✅ FIXED with safe check
  const renderModuleDistribution = () => {
    // ✅ Ensure moduleDistribution is an array before rendering
    if (!Array.isArray(moduleDistribution) || moduleDistribution.length === 0) {
      return (
        <Card title="Documents by Module" size="small" className="chart-card">
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Empty description="No module data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        </Card>
      );
    }

    return (
      <Card title="Documents by Module" size="small" className="chart-card">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={moduleDistribution}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {moduleDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={MODULE_COLORS[entry.key] || CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  // 3. Document Trend
  const renderDocumentTrend = () => (
    <Card title="Document Creation Trend" size="small" className="chart-card">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={documentTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#1890ff"
            fill="#1890ff"
            fillOpacity={0.2}
            name="Documents Created"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );

  // 4. Review Status
  const renderReviewStatus = () => (
    <Card title="Review Status" size="small" className="chart-card">
      <div style={{ padding: '8px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>✅ Current</span>
          <span style={{ color: '#52c41a' }}>{reviewStatus.find(r => r.key === 'current')?.value || 0}</span>
        </div>
        <Progress 
          percent={Math.round(((reviewStatus.find(r => r.key === 'current')?.value || 0) / (stats.total || 1)) * 100)} 
          strokeColor="#52c41a"
          showInfo={false}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, marginTop: 16 }}>
          <span>⏳ Pending Review</span>
          <span style={{ color: '#faad14' }}>{reviewStatus.find(r => r.key === 'pending')?.value || 0}</span>
        </div>
        <Progress 
          percent={Math.round(((reviewStatus.find(r => r.key === 'pending')?.value || 0) / (stats.total || 1)) * 100)} 
          strokeColor="#faad14"
          showInfo={false}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, marginTop: 16 }}>
          <span>❌ Overdue</span>
          <span style={{ color: '#f5222d' }}>{reviewStatus.find(r => r.key === 'overdue')?.value || 0}</span>
        </div>
        <Progress 
          percent={Math.round(((reviewStatus.find(r => r.key === 'overdue')?.value || 0) / (stats.total || 1)) * 100)} 
          strokeColor="#f5222d"
          showInfo={false}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, marginTop: 16 }}>
          <span>❓ Never Reviewed</span>
          <span style={{ color: '#8c8c8c' }}>{reviewStatus.find(r => r.key === 'never_reviewed')?.value || 0}</span>
        </div>
        <Progress 
          percent={Math.round(((reviewStatus.find(r => r.key === 'never_reviewed')?.value || 0) / (stats.total || 1)) * 100)} 
          strokeColor="#8c8c8c"
          showInfo={false}
        />
      </div>
    </Card>
  );

  // 5. Recent Documents
  const renderRecentDocuments = () => (
    <Card 
      title="Recent Documents" 
      size="small"
      extra={<Button type="link" size="small" onClick={() => window.location.href = '/document-management'}>View All</Button>}
    >
      {recentDocuments.length > 0 ? (
        <List
          dataSource={recentDocuments.slice(0, 5)}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  item.mime_type?.includes('pdf') ? <FilePdfOutlined style={{ fontSize: 20, color: '#f5222d' }} /> :
                  item.mime_type?.includes('word') ? <FileWordOutlined style={{ fontSize: 20, color: '#1890ff' }} /> :
                  item.mime_type?.includes('excel') ? <FileExcelOutlined style={{ fontSize: 20, color: '#52c41a' }} /> :
                  item.mime_type?.includes('image') ? <FileImageOutlined style={{ fontSize: 20, color: '#faad14' }} /> :
                  <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                }
                title={<a onClick={() => window.location.href = `/document-management`}>{item.title}</a>}
                description={
                  <Space>
                    <Tag color={STATUS_COLORS[item.status] || '#d9d9d9'}>{item.status}</Tag>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No recent documents" />
      )}
    </Card>
  );

  // 6. Pending Approvals
  const renderPendingApprovals = () => (
    <Card title="Pending Approvals" size="small" className="pending-card">
      {pendingTasks.length > 0 ? (
        <Timeline>
          {pendingTasks.slice(0, 5).map((task, index) => (
            <Timeline.Item 
              key={index}
              color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{task.title}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {task.description || 'No description'} • Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty description="No pending approvals" />
      )}
    </Card>
  );

  // 7. Expiring Documents
  const renderExpiringDocuments = () => (
    <Card title="Documents Expiring Soon" size="small" className="expiring-card">
      {expiringDocuments.length > 0 ? (
        <List
          dataSource={expiringDocuments.slice(0, 5)}
          renderItem={(item) => {
            const days = Math.ceil((new Date(item.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    days <= 7 ? <Badge status="error" /> :
                    days <= 14 ? <Badge status="warning" /> :
                    <Badge status="default" />
                  }
                  title={<a onClick={() => window.location.href = `/document-management`}>{item.title}</a>}
                  description={
                    <Space>
                      <Tag color={days <= 7 ? 'red' : days <= 14 ? 'orange' : 'blue'}>
                        {days} days left
                      </Tag>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                        Expires: {new Date(item.expires_at).toLocaleDateString()}
                      </span>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty description="No expiring documents" />
      )}
    </Card>
  );

  // 8. Top Contributors
  const renderTopContributors = () => (
    <Card title="Top Contributors" size="small">
      {topContributors.length > 0 ? (
        <List
          dataSource={topContributors}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    background: CHART_COLORS[index % CHART_COLORS.length],
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
                title={item.name || 'Unknown'}
                description={`${item.count} documents`}
              />
              <Progress 
                percent={Math.round((item.count / (stats.total || 1)) * 100)} 
                size="small"
                width={80}
                strokeColor={CHART_COLORS[index % CHART_COLORS.length]}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No contributor data" />
      )}
    </Card>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="document-dashboard">
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
          {renderDocumentTrend()}
        </Col>
        <Col xs={24} lg={12}>
          {renderReviewStatus()}
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          {renderRecentDocuments()}
        </Col>
        <Col xs={24} md={12}>
          {renderPendingApprovals()}
        </Col>
      </Row>

      {/* Expiring & Contributors */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          {renderExpiringDocuments()}
        </Col>
        <Col xs={24} md={12}>
          {renderTopContributors()}
        </Col>
      </Row>
    </div>
  );
};

export default DocumentDashboard;