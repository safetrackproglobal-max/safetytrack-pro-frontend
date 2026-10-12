// src/pages/CommandCenter.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Space, Button, Alert, Badge, message } from 'antd';
import {
  ReloadOutlined, EyeOutlined, DashboardOutlined, ExportOutlined
} from '@ant-design/icons';
import SafetyProService from '../services/safetyproservice';
import {
  ActivityKPICards,
  SecondaryKPIs,
  LiveActivityFeed,
  ActiveSessionsPanel,
  SecurityAlertsPanel,
  ActivityChart,
  PlatformHealth,
  TopActiveUsers,
  RecentErrors,
  GeographicDistribution,
  ActivityFilterBar,
  ActivityTable,
  UserDrillDownDrawer
} from '../components/CommandCenterWidgets';

const CommandCenter = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [drawerUserId, setDrawerUserId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filters, setFilters] = useState({
    activity_type: '', category: '', status: '', severity: '',
    search: '', start_date: '', end_date: ''
  });
  const [pagination, setPagination] = useState({
    page: 1, limit: 50, total: 0, pages: 1
  });

  const fetchActivity = async (page = 1) => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v && v !== '')
      );
      const res = await SafetyProService.getPlatformActivity({
        page, limit: pagination.limit, ...activeFilters
      });
      if (res?.data) {
        setActivities(res.data);
        setStats(res.stats || {});
        setPagination(prev => ({
          ...prev,
          page: res.pagination?.page || page,
          total: res.pagination?.total || 0,
          pages: res.pagination?.pages || 1
        }));
      }
    } catch (error) {
      console.error('Command Center error:', error);
      message.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivity(1); }, []);

  const handleRefresh = () => fetchActivity(pagination.page);

  const handleUserClick = (userId) => {
    setDrawerUserId(userId);
    setDrawerVisible(true);
  };

  const handleExport = async () => {
    try {
      const res = await SafetyProService.getPlatformActivity({
        page: 1, limit: 1000,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      if (!res?.data) return;

      const csv = [
        ['Time', 'User', 'Email', 'Activity', 'Description', 'IP', 'Status', 'Severity'].join(','),
        ...res.data.map(a => [
          new Date(a.created_at).toISOString(),
          a.user_name || 'System',
          a.user_email || '',
          a.activity_type,
          `"${(a.description || '').replace(/"/g, '""')}"`,
          a.ip_address || '',
          a.status,
          a.severity
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `command-center-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      message.success('Exported successfully');
    } catch (e) {
      message.error('Export failed');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          <DashboardOutlined /> Platform Command Center
        </h1>
        <p style={{ color: '#666', marginTop: 4, marginBottom: 16 }}>
          Real-time monitoring of activity, security, and system health across SafeTrack Pro
        </p>
        <Alert
          message="Platform-Wide Oversight"
          description="All user activity, security events, and system health in one place"
          type="info"
          showIcon
          action={
            <Space>
              <Button icon={<ExportOutlined />} onClick={handleExport}>Export</Button>
              <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
            </Space>
          }
        />
      </div>

      {/* KPI Cards */}
      <ActivityKPICards stats={stats} />
      <SecondaryKPIs stats={stats} />

      {/* Row 1: Live Feed + Sessions + Alerts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={8}>
          <LiveActivityFeed refreshInterval={10000} />
        </Col>
        <Col xs={24} lg={8}>
          <ActiveSessionsPanel />
        </Col>
        <Col xs={24} lg={8}>
          <SecurityAlertsPanel />
        </Col>
      </Row>

      {/* Row 2: Chart + Health */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <ActivityChart />
        </Col>
        <Col xs={24} lg={8}>
          <PlatformHealth />
        </Col>
      </Row>

      {/* Row 3: Top Users + Errors + Geo */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={8}>
          <TopActiveUsers />
        </Col>
        <Col xs={24} lg={8}>
          <RecentErrors />
        </Col>
        <Col xs={24} lg={8}>
          <GeographicDistribution />
        </Col>
      </Row>

      {/* Filters */}
      <ActivityFilterBar filters={filters} setFilters={setFilters} onApply={() => fetchActivity(1)} />

      {/* Main Activity Table */}
      <Card
        title={
          <Space>
            <EyeOutlined />
            Platform Activity Log
            <Badge count={pagination.total} style={{ marginLeft: 8 }} />
          </Space>
        }
      >
        <ActivityTable
          activities={activities}
          loading={loading}
          pagination={pagination}
          onPageChange={fetchActivity}
          onUserClick={handleUserClick}
        />
      </Card>

      {/* Drill-Down Drawer */}
      <UserDrillDownDrawer
        visible={drawerVisible}
        userId={drawerUserId}
        onClose={() => setDrawerVisible(false)}
      />
    </div>
  );
};

export default CommandCenter;
