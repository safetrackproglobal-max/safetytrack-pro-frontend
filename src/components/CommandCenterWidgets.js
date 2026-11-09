// src/components/CommandCenterWidgets.js
import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, Table, Button, Tag, Space, Input, Select,
  Badge, Tooltip, Empty, Progress, Avatar, List, Drawer,
  Descriptions, Divider, Switch, DatePicker
} from 'antd';
import {
  ReloadOutlined, SearchOutlined, EyeOutlined, TeamOutlined,
  WarningOutlined, SafetyCertificateOutlined, UserOutlined,
  BuildOutlined, StopOutlined, ApiOutlined, DatabaseOutlined,
  CloudOutlined, CloseCircleOutlined, GlobalOutlined, TrophyOutlined,
  LaptopOutlined, MobileOutlined, DesktopOutlined
} from '@ant-design/icons';
import SafetyProService from '../services/safetyproservice';

const { Option } = Select;
const { RangePicker } = DatePicker;

// ✅ Safe array helper — handles ALL nesting patterns
const safeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.users)) return data.users;
  if (Array.isArray(data.activities)) return data.activities;
  if (Array.isArray(data.sessions)) return data.sessions;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.errors)) return data.errors;
  if (Array.isArray(data.locations)) return data.locations;
  if (data.data && Array.isArray(data.data.data)) return data.data.data;
  return [];
};

// ✅ Universal unwrap — extracts the payload from any backend wrapper
const unwrap = (res) => {
  if (!res) return null;
  if (res.data && res.data.data !== undefined) return res.data.data;
  if (res.data !== undefined) return res.data;
  return res;
};

// ============================================
// 1. MAIN KPI CARDS
// ============================================
export const ActivityKPICards = ({ stats }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={24} sm={12} md={6}>
      <Card className="command-kpi-card">
        <Statistic title="Events (24h)" value={stats?.total_events_24h || 0} prefix={<EyeOutlined />} valueStyle={{ color: '#1890ff' }} />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card className="command-kpi-card">
        <Statistic title="Active Users (24h)" value={stats?.active_users_24h || 0} prefix={<TeamOutlined />} valueStyle={{ color: '#52c41a' }} />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card className="command-kpi-card">
        <Statistic title="Failed Logins (24h)" value={stats?.failed_logins_24h || 0} prefix={<WarningOutlined />} valueStyle={{ color: (stats?.failed_logins_24h || 0) > 5 ? '#ff4d4f' : '#faad14' }} />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card className="command-kpi-card">
        <Statistic title="Security Alerts (7d)" value={stats?.security_alerts_7d || 0} prefix={<SafetyCertificateOutlined />} valueStyle={{ color: (stats?.security_alerts_7d || 0) > 0 ? '#ff4d4f' : '#52c41a' }} />
      </Card>
    </Col>
  </Row>
);

// ============================================
// 2. SECONDARY KPIs
// ============================================
export const SecondaryKPIs = ({ stats }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={24} sm={8}>
      <Card>
        <Statistic title="Total Users" value={stats?.total_users || 0} prefix={<UserOutlined />} valueStyle={{ color: '#722ed1' }} />
      </Card>
    </Col>
    <Col xs={24} sm={8}>
      <Card>
        <Statistic title="Total Companies" value={stats?.total_companies || 0} prefix={<BuildOutlined />} valueStyle={{ color: '#fa8c16' }} />
      </Card>
    </Col>
    <Col xs={24} sm={8}>
      <Card>
        <Statistic title="Suspicious Activity (7d)" value={stats?.suspicious_activity_7d || 0} prefix={<StopOutlined />} valueStyle={{ color: (stats?.suspicious_activity_7d || 0) > 0 ? '#ff4d4f' : '#52c41a' }} />
      </Card>
    </Col>
  </Row>
);

// ============================================
// 3. LIVE ACTIVITY FEED
// ============================================
export const LiveActivityFeed = ({ refreshInterval = 10000 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLive = async () => {
    setLoading(true);
    try {
      const res = await SafetyProService.getPlatformActivity({ page: 1, limit: 20 });
      const payload = unwrap(res);
      const list = safeArray(payload) || safeArray(res?.data) || safeArray(res);
      setActivities(list);
    } catch (e) {
      console.error('[LiveActivityFeed] Error:', e);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLive, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getActivityIcon = (type) => ({
    login: '🔓', logout: '🔒', failed_login: '⚠️', signup: '✨', password_reset: '🔑',
    data_access: '👁️', data_export: '📤', data_delete: '🗑️', permission_change: '🔐',
    plan_upgrade: '🚀', payment: '💳', api_call: '🔌', suspicious_activity: '🚨',
    admin_action: '⚙️', user_created: '👤', user_suspended: '🚫'
  }[type] || '📌');

  return (
    <Card
      title={<Space><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: autoRefresh ? '#52c41a' : '#8c8c8c', animation: autoRefresh ? 'pulse 2s infinite' : 'none' }} /><EyeOutlined /> Live Activity Feed</Space>}
      extra={<Space><Switch size="small" checked={autoRefresh} onChange={setAutoRefresh} checkedChildren="Live" unCheckedChildren="Paused" /><Button size="small" icon={<ReloadOutlined />} onClick={fetchLive} loading={loading} /></Space>}
      style={{ height: '100%' }}
    >
      {activities.length === 0 ? <Empty description="No activity yet" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <List
            size="small" dataSource={activities} rowKey={(item) => item.id || `${item.created_at}-${item.activity_type}`}
            renderItem={(item) => (
              <List.Item style={{ padding: '8px 0' }}>
                <Space>
                  <span style={{ fontSize: 16 }}>{getActivityIcon(item.activity_type)}</span>
                  <div>
                    <div style={{ fontSize: 13 }}><strong>{item.user_name || item.user_email || 'System'}</strong>{' '}<span style={{ color: '#666' }}>{item.activity_type?.replace(/_/g, ' ')}</span></div>
                    <div style={{ fontSize: 11, color: '#888' }}>{item.created_at ? new Date(item.created_at).toLocaleTimeString() : '—'}{item.company_name && ` • ${item.company_name}`}</div>
                  </div>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}
    </Card>
  );
};

// ============================================
// 4. ACTIVE SESSIONS PANEL
// ============================================
export const ActiveSessionsPanel = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await SafetyProService.getActiveSessions();
      const payload = unwrap(res);
      const list = safeArray(payload) || safeArray(res?.data) || safeArray(res);
      setSessions(list);
    } catch (e) {
      console.error('[ActiveSessions] Error:', e);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); const interval = setInterval(fetchSessions, 30000); return () => clearInterval(interval); }, []);

  const getDeviceIcon = (device) => {
    if (!device) return <DesktopOutlined />;
    if (String(device).toLowerCase().includes('mobile')) return <MobileOutlined />;
    return <LaptopOutlined />;
  };

  return (
    <Card title={<Space><TeamOutlined /> Active Sessions ({sessions.length})</Space>} extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchSessions} loading={loading} />} style={{ height: '100%' }}>
      {sessions.length === 0 ? <Empty description="No active sessions" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {sessions.map((s, idx) => (
            <div key={s.id || s.session_id || idx} style={{ padding: 8, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space><Avatar size="small" icon={<UserOutlined />} /><div><div style={{ fontSize: 13 }}>{s.user_name || s.email || 'User'}</div><div style={{ fontSize: 11, color: '#888' }}>{getDeviceIcon(s.device_type)} {s.ip_address || s.ip || '—'}</div></div></Space>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#888' }}><div>{s.last_seen_at ? new Date(s.last_seen_at).toLocaleTimeString() : '—'}</div></div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================
// 5. SECURITY ALERTS PANEL
// ============================================
export const SecurityAlertsPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await SafetyProService.getSecurityEvents();
      const payload = unwrap(res);
      const list = safeArray(payload) || safeArray(res?.data) || safeArray(res);
      setEvents(list);
    } catch (e) {
      console.error('[SecurityAlerts] Error:', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  return (
    <Card title={<Space><SafetyCertificateOutlined style={{ color: '#ff4d4f' }} /> Security Alerts</Space>} extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchEvents} loading={loading} />} style={{ height: '100%' }}>
      {events.length === 0 ? <Empty description="No security alerts" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <List size="small" dataSource={events.slice(0, 15)} rowKey={(item) => item.id || `${item.created_at}-${item.activity_type}`}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Badge status={item.severity === 'critical' ? 'error' : 'warning'} />}
                  title={<Space><span style={{ fontSize: 12 }}>{item.activity_type?.replace(/_/g, ' ').toUpperCase()}</span><Tag color={item.severity === 'critical' ? 'magenta' : 'red'}>{item.severity?.toUpperCase() || 'ALERT'}</Tag></Space>}
                  description={<div><div style={{ fontSize: 12 }}>{item.description || '—'}</div><div style={{ fontSize: 11, color: '#888' }}>{item.user_name || 'System'} • {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</div></div>}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </Card>
  );
};

// ============================================
// 6. ACTIVITY CHART
// ============================================
export const ActivityChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChart = async () => {
    setLoading(true);
    try {
      const res = await SafetyProService.getActivityChart(7);
      const payload = unwrap(res);
      const list = safeArray(payload) || safeArray(res?.data) || safeArray(res);
      const normalized = list.map((d) => ({
        date: d.date || d.day || d.created_at || d.label || '',
        count: Number(d.count ?? d.total ?? d.value ?? d.events ?? 0),
      }));
      setData(normalized);
    } catch (e) {
      console.error('[ActivityChart] Error:', e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChart(); }, []);

  const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count || 0), 1) : 1;

  return (
    <Card title={<Space><EyeOutlined /> Activity Trend (7 days)</Space>} extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchChart} loading={loading} />} style={{ height: '100%' }}>
      {data.length === 0 ? <Empty description="No chart data" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 8, padding: '16px 0' }}>
          {data.map((d, i) => (
            <Tooltip key={i} title={`${d.date}: ${d.count} events`}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', height: `${(d.count / maxCount) * 100}%`, background: 'linear-gradient(180deg, #1890ff, #40a9ff)', borderRadius: 4, minHeight: 4, transition: 'all 0.3s' }} />
                <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{d.date ? new Date(d.date).toLocaleDateString('en', { weekday: 'short' }) : '—'}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1890ff' }}>{d.count}</div>
              </div>
            </Tooltip>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================
// 7. PLATFORM HEALTH
// ============================================
export const PlatformHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await SafetyProService.getSystemHealth();
      const payload = unwrap(res) || res;
      setHealth(payload || {});
    } catch (e) {
      console.error('[PlatformHealth] Error:', e);
      setHealth({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  const getStatusTag = (item) => {
    if (!item) return <Tag color="default">Unknown</Tag>;
    if (item.healthy === true) return <Tag color="green">Healthy</Tag>;
    if (item.healthy === false) return <Tag color="red">Unhealthy</Tag>;
    const s = item.status?.toLowerCase?.();
    if (s === 'healthy' || s === 'connected' || s === 'ok' || s === 'up' || s === 'online') return <Tag color="green">Healthy</Tag>;
    if (s === 'unhealthy' || s === 'disconnected' || s === 'error' || s === 'down' || s === 'offline') return <Tag color="red">Unhealthy</Tag>;
    if (item === true) return <Tag color="green">Healthy</Tag>;
    if (item === false) return <Tag color="red">Unhealthy</Tag>;
    if (typeof item === 'string') {
      if (item.toLowerCase() === 'healthy' || item.toLowerCase() === 'ok') return <Tag color="green">Healthy</Tag>;
      if (item.toLowerCase() === 'unhealthy' || item.toLowerCase() === 'error') return <Tag color="red">Unhealthy</Tag>;
    }
    return <Tag color="default">Unknown</Tag>;
  };

  return (
    <Card title={<Space><ApiOutlined /> Platform Health</Space>} extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchHealth} loading={loading} />} style={{ height: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Space><ApiOutlined /> API</Space>{getStatusTag(health?.api)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Space><DatabaseOutlined /> Database</Space>{getStatusTag(health?.database)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Space><CloudOutlined /> Redis</Space>{getStatusTag(health?.redis)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Space><CloudOutlined /> Storage</Space>{getStatusTag(health?.storage)}</div>
        {health?.storage?.used !== undefined && <Progress percent={health.storage.used} size="small" status={health.storage.used > 90 ? 'exception' : 'active'} />}
      </Space>
    </Card>
  );
};

// ============================================
// 8. TOP ACTIVE USERS
// ============================================
export const TopActiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await SafetyProService.getTopActiveUsers(7);
      const payload = unwrap(res);
      const list = safeArray(payload) || safeArray(res?.data) || safeArray(res);
      setUsers(list);
    } catch (e) {
      console.error('[TopActiveUsers] Error:', e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <Card title={<Space><TrophyOutlined style={{ color: '#faad14' }} /> Top Active Users (7d)</Space>} extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading} />} style={{ height: '100%' }}>
      {users.length === 0 ? <Empty description="No users to rank" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
        <List size="small" dataSource={users} rowKey={(u) => u.user_id || u.id || u.user_name || Math.random()}
          renderItem={(user, index) => (
            <List.Item>
              <Space>
                <span style={{ fontSize: 18, minWidth: 30 }}>{getMedal(index)}</span>
                <Avatar size="small" icon={<UserOutlined />} />
                <div>
                  <div style={{ fontSize: 13 }}>{user.user_name || user.name || user.email || 'User'}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{user.count ?? user.total ?? 0} actions</div>
                </div>
              </Space>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

// ============================================
// 9. RECENT ERRORS
// ============================================
export const RecentErrors = () => {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const res = await SafetyProService.getRecentErrors();
      const payload = unwrap(res);
      const list = safeArray(payload) || safeArray(res?.data) || safeArray(res);
      setErrors(list);
    } catch (e) {
      console.error('[RecentErrors] Error:', e);
      setErrors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchErrors(); }, []);

  return (
    <Card title={<Space><CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Recent Errors</Space>} extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchErrors} loading={loading} />} style={{ height: '100%' }}>
      {errors.length === 0 ? <Empty description="No recent errors" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
        <List size="small" dataSource={errors.slice(0, 10)} rowKey={(item) => item.id || `${item.created_at}-${item.activity_type}`}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                title={<span style={{ fontSize: 12 }}>{item.activity_type?.replace(/_/g, ' ') || 'Error'}</span>}
                description={<div><div style={{ fontSize: 12 }}>{item.description || item.message || '—'}</div><div style={{ fontSize: 11, color: '#888' }}>{item.user_name || 'System'} • {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</div></div>}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

// ============================================
// 10. GEOGRAPHIC DISTRIBUTION
// ============================================
export const GeographicDistribution = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGeo = async () => {
    setLoading(true);
    try {
      const res = await SafetyProService.getGeographicDistribution(30);
      const payload = unwrap(res);
      const list = safeArray(payload) || safeArray(res?.data) || safeArray(res);
      setData(list);
    } catch (e) {
      console.error('[GeoDistribution] Error:', e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGeo(); }, []);

  const maxUsers = data.length > 0 ? Math.max(...data.map(d => d.users ?? d.count ?? 0), 1) : 1;

  return (
    <Card title={<Space><GlobalOutlined /> Geographic Distribution (30d)</Space>} extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchGeo} loading={loading} />} style={{ height: '100%' }}>
      {data.length === 0 ? <Empty description="No location data" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {data.map((item, i) => {
            const count = item.users ?? item.count ?? 0;
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}><GlobalOutlined /> {item.location || item.country || item.name || 'Unknown'}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{count} users</span>
                </div>
                <Progress percent={(count / maxUsers) * 100} size="small" strokeColor="#1890ff" showInfo={false} />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

// ============================================
// 11. FILTER BAR
// ============================================
export const ActivityFilterBar = ({ filters, setFilters, onApply, showDateRange = true }) => (
  <Card style={{ marginBottom: 16 }}>
    <Row gutter={[12, 12]}>
      <Col xs={24} sm={8} md={5}>
        <Input placeholder="Search description or IP..." prefix={<SearchOutlined />} value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} onPressEnter={onApply} allowClear />
      </Col>
      <Col xs={12} sm={8} md={3}>
        <Select placeholder="Category" style={{ width: '100%' }} allowClear value={filters.category || undefined} onChange={(v) => { setFilters(prev => ({ ...prev, category: v || '' })); setTimeout(onApply, 0); }}>
          <Option value="auth">Authentication</Option><Option value="data">Data Access</Option><Option value="billing">Billing</Option><Option value="admin">Admin</Option><Option value="security">Security</Option><Option value="usage">Usage</Option>
        </Select>
      </Col>
      <Col xs={12} sm={8} md={3}>
        <Select placeholder="Status" style={{ width: '100%' }} allowClear value={filters.status || undefined} onChange={(v) => { setFilters(prev => ({ ...prev, status: v || '' })); setTimeout(onApply, 0); }}>
          <Option value="success">Success</Option><Option value="failed">Failed</Option><Option value="blocked">Blocked</Option>
        </Select>
      </Col>
      <Col xs={12} sm={8} md={3}>
        <Select placeholder="Severity" style={{ width: '100%' }} allowClear value={filters.severity || undefined} onChange={(v) => { setFilters(prev => ({ ...prev, severity: v || '' })); setTimeout(onApply, 0); }}>
          <Option value="low">Low</Option><Option value="medium">Medium</Option><Option value="high">High</Option><Option value="critical">Critical</Option>
        </Select>
      </Col>
      {showDateRange && (
        <Col xs={24} sm={12} md={6}>
          <RangePicker style={{ width: '100%' }} onChange={(dates) => { setFilters(prev => ({ ...prev, start_date: dates?.[0]?.toISOString() || '', end_date: dates?.[1]?.toISOString() || '' })); setTimeout(onApply, 0); }} />
        </Col>
      )}
      <Col xs={24} sm={8} md={4}>
        <Button block onClick={() => { setFilters({ activity_type: '', category: '', status: '', severity: '', search: '', start_date: '', end_date: '' }); setTimeout(onApply, 0); }}>Clear</Button>
      </Col>
    </Row>
  </Card>
);

// ============================================
// 12. ACTIVITY TABLE + USER DRILL-DOWN
// ============================================
export const ActivityTable = ({ activities, loading, pagination, onPageChange, onUserClick, onViewDetail }) => {
  const getActivityIcon = (type) => ({
    login: '🔓', logout: '🔒', failed_login: '⚠️', signup: '✨', password_reset: '🔑', data_access: '👁️', data_export: '📤', data_delete: '🗑️', permission_change: '🔐', plan_upgrade: '🚀', plan_downgrade: '⬇️', payment: '💳', api_call: '🔌', document_upload: '📄', document_delete: '🗑️', suspicious_activity: '🚨', admin_action: '⚙️', user_created: '👤', user_suspended: '🚫'
  }[type] || '📌');

  const getActivityColor = (type) => ({
    login: 'green', logout: 'default', failed_login: 'orange', signup: 'cyan', password_reset: 'gold', data_access: 'blue', data_export: 'cyan', data_delete: 'red', permission_change: 'purple', plan_upgrade: 'green', plan_downgrade: 'orange', payment: 'green', api_call: 'geekblue', document_upload: 'blue', document_delete: 'volcano', suspicious_activity: 'red', admin_action: 'magenta', user_created: 'green', user_suspended: 'red'
  }[type] || 'default');

  const getSeverityColor = (s) => ({ low: 'green', medium: 'orange', high: 'red', critical: 'magenta' }[s] || 'default');
  const getStatusBadge = (s) => ({ success: 'success', failed: 'error', blocked: 'warning', pending: 'processing' }[s] || 'default');

  return (
    <Table
      dataSource={safeArray(activities)}
      rowKey={(r) => r.id || `${r.created_at}-${r.activity_type}-${r.user_id}`}
      loading={loading}
      pagination={{ current: pagination?.page || 1, pageSize: pagination?.limit || 20, total: pagination?.total || 0, showSizeChanger: false, onChange: onPageChange }}
      scroll={{ x: 1400 }}
      columns={[
        { title: 'Time', dataIndex: 'created_at', width: 150, render: (d) => d ? new Date(d).toLocaleString() : '—' },
        { title: 'Activity', dataIndex: 'activity_type', width: 180, render: (t) => (<Space><span style={{ fontSize: 16 }}>{getActivityIcon(t)}</span><Tag color={getActivityColor(t)}>{t?.replace(/_/g, ' ').toUpperCase() || '—'}</Tag></Space>) },
                {
          title: 'User', dataIndex: 'user_name', width: 220,
          render: (name, r) => {
            // Highlight anonymous users in red
            const isAnonymous = !r.user_id;

            return (
              <a onClick={() => onUserClick && onUserClick(r)} style={{ color: isAnonymous ? '#ff4d4f' : '#1890ff' }}>
                <div style={{ fontWeight: isAnonymous ? 600 : 400 }}>
                  {name || 'Anonymous (No Auth)'}
                  {r.is_suspicious && ' 🚨'}
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>{r.user_email || r.ip_address || '—'}</div>
              </a>
            );
          }
        },
        { title: 'Context', key: 'context', width: 180, render: (_, r) => (<div>{r.company_name && <div style={{ fontSize: 12 }}><BuildOutlined /> {r.company_name}</div>}{r.hospital_name && <div style={{ fontSize: 11, color: '#888' }}>{r.hospital_name}</div>}</div>) },
        { title: 'Description', dataIndex: 'description', ellipsis: true, render: (d) => d || '—' },
        { title: 'IP / Device', dataIndex: 'ip_address', width: 150, render: (ip, r) => (<div><div style={{ fontSize: 12 }}>{ip || '—'}</div><div style={{ fontSize: 11, color: '#888' }}>{r.device_type || '—'}</div></div>) },
        { title: 'Status', dataIndex: 'status', width: 100, render: (s) => <Badge status={getStatusBadge(s)} text={s?.toUpperCase() || '—'} /> },
        { title: 'Severity', dataIndex: 'severity', width: 100, render: (s) => s ? <Tag color={getSeverityColor(s)}>{s.toUpperCase()}</Tag> : '—' },
        {
          title: 'Action', key: 'action', width: 80, fixed: 'right',
          render: (_, record) => (
            <Button type="primary" ghost size="small" icon={<EyeOutlined />} onClick={() => onViewDetail && onViewDetail(record)} />
          )
        }
      ]}
    />
  );
};

// ============================================
// 13. USER DRILL-DOWN DRAWER (UPGRADED FOR SECURITY)
// ============================================
export const UserDrillDownDrawer = ({ visible, userRecord, onClose }) => {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userRecord) fetchUser();
  }, [visible, userRecord]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      let userData = null;
      
      // 1. Try to fetch the full profile if we have a user_id
      if (userRecord.user_id) {
        const userRes = await SafetyProService.getUserDetails(userRecord.user_id);
        userData = unwrap(userRes) || userRes;
      } 
      
      // 2. If we don't have a profile (or no user_id), build one from the activity record
      // This prevents "undefined" for manual logs, deleted users, or hacker attempts.
      if (!userData) {
        userData = {
          name: userRecord.user_name || 'Unknown User',
          email: userRecord.user_email || 'No email recorded',
          user_type: 'Activity Log Only',
          subscription_plan: 'N/A',
          is_active: false,
          company_name: userRecord.company_name || 'N/A'
        };
      }

      setUser(userData);

      // 3. Fetch recent activity for this user (by ID or Email)
      const activityRes = await SafetyProService.getPlatformActivity({ 
        user_id: userRecord.user_id || undefined, 
        search: userRecord.user_email || undefined, 
        page: 1, 
        limit: 50 
      });
      
      const activityData = unwrap(activityRes) || activityRes;
      setActivities(safeArray(activityData));

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={user ? `${user.name || user.email} - Activity` : 'User Activity'}
      placement="right" width={700} open={visible} onClose={onClose}
    >
      {user && (
        <>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Name" span={2}>{user.name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>{user.email || '—'}</Descriptions.Item>
            <Descriptions.Item label="Type">{user.user_type || '—'}</Descriptions.Item>
            <Descriptions.Item label="Plan">{user.subscription_plan || '—'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge status={user.is_active ? 'success' : 'default'} text={user.is_active ? 'Active' : 'Inactive'} />
            </Descriptions.Item>
            <Descriptions.Item label="Company">{user.company_name || 'N/A'}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Recent Activity</Divider>
          <List
            size="small"
            loading={loading}
            dataSource={activities}
            rowKey={(item) => item.id || `${item.created_at}-${item.activity_type}`}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.activity_type?.replace(/_/g, ' ') || 'Event'}
                  description={
                    <div>
                      <div style={{ fontSize: 12 }}>{item.description || '—'}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}
    </Drawer>
  );
};

// ============================================
// 14. ACTIVITY DETAIL DRAWER (INVESTIGATION)
// ============================================
export const ActivityDetailDrawer = ({ activity, onClose }) => {
  if (!activity) return null;

  return (
    <Drawer
      title={<Space><EyeOutlined /> Activity Detail</Space>}
      placement="right"
      width={600}
      open={!!activity}
      onClose={onClose}
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Time">{new Date(activity.created_at).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Activity"><Tag color={activity.severity === 'high' ? 'red' : 'blue'}>{activity.activity_type?.replace(/_/g, ' ').toUpperCase()}</Tag></Descriptions.Item>
        <Descriptions.Item label="User">{activity.user_name || 'System'} ({activity.user_email || 'No email'})</Descriptions.Item>
        <Descriptions.Item label="Context">{activity.company_name || 'N/A'} {activity.hospital_name && ` • ${activity.hospital_name}`}</Descriptions.Item>
        <Descriptions.Item label="Description"><div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{activity.description || '—'}</div></Descriptions.Item>

        {/* ✅ NEW: Target resource */}
        <Descriptions.Item label="Target Resource">
          {activity.resource_name || '—'}
          {activity.resource_id && ` (ID: ${activity.resource_id})`}
        </Descriptions.Item>

        {/* ✅ NEW: Request method + URL */}
        <Descriptions.Item label="Request">
          <Tag color="blue">{activity.http_method || '—'}</Tag>
          {activity.request_url || '—'}
        </Descriptions.Item>

        {/* ✅ NEW: Suspicious flag */}
        <Descriptions.Item label="Suspicious">
          <Badge status={activity.is_suspicious ? 'error' : 'success'} text={activity.is_suspicious ? 'Yes - Investigate' : 'No'} />
        </Descriptions.Item>

        <Descriptions.Item label="IP Address">{activity.ip_address || '—'}</Descriptions.Item>
        <Descriptions.Item label="Device">{activity.device_type || '—'}</Descriptions.Item>
        <Descriptions.Item label="User Agent"><div style={{ fontSize: 12, color: '#666' }}>{activity.user_agent || '—'}</div></Descriptions.Item>
        <Descriptions.Item label="Location">{activity.location || '—'}</Descriptions.Item>
        <Descriptions.Item label="Status"><Badge status={activity.status === 'success' ? 'success' : 'error'} text={activity.status?.toUpperCase()} /></Descriptions.Item>
        <Descriptions.Item label="Severity"><Tag color={activity.severity === 'critical' ? 'magenta' : 'green'}>{activity.severity?.toUpperCase()}</Tag></Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Raw JSON Payload (extra_data)</Divider>
      {activity.extra_data ? (
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto', fontSize: 12 }}>
          {JSON.stringify(activity.extra_data, null, 2)}
        </pre>
      ) : (
        <Empty description="No extra data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Drawer>
  );
};
