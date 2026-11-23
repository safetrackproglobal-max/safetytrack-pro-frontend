// Command-center security view: attack signals, blocked IPs, recent attacks and a privileged-account audit.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Table, Tag, Button, Space, Input, Popconfirm, Tooltip, Typography, Empty, Alert, Badge, message, Segmented } from 'antd';
import {
  SafetyOutlined, StopOutlined, UnlockOutlined, ReloadOutlined, WarningOutlined, BugOutlined, CrownOutlined,
  LockOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import SafetyProService from '../../services/safetyproservice';

const { Text } = Typography;
const SEV_COLOR = { critical: 'red', high: 'volcano', medium: 'orange', low: 'default' };
const TYPE_LABEL = {
  injection_attempt: 'Injection attempt', privilege_escalation_attempt: 'Privilege escalation', ip_blocked: 'IP blocked',
  ip_unblocked: 'IP unblocked', privilege_change: 'Privilege granted', failed_login: 'Failed login', forbidden_access: 'Forbidden (403)',
  unauthorized_access: 'Unauthorized (401)', url_scan_404: 'URL scanning (404)', forbidden_admin_area: 'Admin area probe',
};
const IPV = /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$/i;
const when = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

const Kpi = ({ label, value, color, icon, hint }) => (
  <Card size="small" style={{ borderTop: `3px solid ${color}`, height: '100%' }}>
    <Space direction="vertical" size={0}>
      <Text type="secondary" style={{ fontSize: 12 }}>{icon} {label} {hint && <Tooltip title={hint}><ExclamationCircleOutlined /></Tooltip>}</Text>
      <span style={{ fontSize: 26, fontWeight: 700, color }}>{value ?? 0}</span>
    </Space>
  </Card>
);

const SecurityCenter = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ipInput, setIpInput] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SafetyProService.getSecurityOverview();
      if (res?.success === false) throw new Error(res.error);
      setData(res?.data || null);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Could not load security data');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(() => { if (!document.hidden) load(); }, 60000);
    return () => clearInterval(t);
  }, [load]);

  const setBlock = async (ip, action) => {
    try {
      const res = await SafetyProService.setIpBlock(ip, action);
      if (res?.success === false) throw new Error(res.error);
      message.success(res.message || 'Done');
      setIpInput('');
      load();
    } catch (e) {
      message.error(e?.response?.data?.error || e.message || 'Failed');
    }
  };

  const c = data?.counts_7d || {};
  const blockedSet = useMemo(() => new Set((data?.blocked_ips || []).map((b) => b.ip)), [data]);
  const accounts = data?.privileged_accounts || [];
  const risky = accounts.filter((a) => !a.mfa_enabled || a.flag_mismatch);
  const recent = (data?.recent || []).filter((e) => filter === 'all' || (filter === 'critical' ? e.severity === 'critical' : e.activity_type === filter));
  const days = Object.entries(data?.by_day || {}).sort(([a], [b]) => a.localeCompare(b));
  const maxDay = Math.max(1, ...days.map(([, n]) => n));

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {error && <Alert type="error" showIcon message={error} action={<Button size="small" onClick={load}>Retry</Button>} />}
      {(c.privilege_escalation_attempt || 0) > 0 && (
        <Alert type="error" showIcon icon={<CrownOutlined />}
               message={`${c.privilege_escalation_attempt} attempt(s) to gain super-admin / platform rights were blocked in the last 7 days`}
               description="Each attempt was stopped at the database layer and the source IP was blocked. Review the events below." />
      )}
      {risky.length > 0 && (
        <Alert type="warning" showIcon icon={<LockOutlined />}
               message={`${risky.length} privileged account(s) need attention`}
               description="Accounts with platform rights should have two-factor authentication on; accounts flagged 'type without flag' should be reviewed." />
      )}

      <Row gutter={[12, 12]}>
        <Col xs={12} md={6}><Kpi label="Suspicious events (24h)" value={data?.events_24h} color="#fa8c16" icon={<BugOutlined />} /></Col>
        <Col xs={12} md={6}><Kpi label="Critical (24h)" value={data?.critical_24h} color="#f5222d" icon={<WarningOutlined />} /></Col>
        <Col xs={12} md={6}><Kpi label="Injection attempts (7d)" value={c.injection_attempt} color="#722ed1" icon={<BugOutlined />}
                                 hint="SQL injection, XSS, path traversal, command and template injection patterns" /></Col>
        <Col xs={12} md={6}><Kpi label="IPs blocked now" value={(data?.blocked_ips || []).length} color="#cf1322" icon={<StopOutlined />}
                                 hint={data?.policy ? `Auto-block after ${data.policy.block_after_strikes} attack signals in ${data.policy.strike_window_min} min, for ${data.policy.block_minutes} min` : ''} /></Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={10}>
          <Card size="small" title="Attack signals — last 7 days" extra={<Button size="small" icon={<ReloadOutlined spin={loading} />} onClick={load} />}>
            {days.length ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                {days.map(([d, n]) => (
                  <Tooltip key={d} title={`${d}: ${n}`}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: '100%', height: `${Math.max(4, (n / maxDay) * 96)}px`, background: '#ff7875', borderRadius: 4 }} />
                      <Text type="secondary" style={{ fontSize: 10 }}>{d.slice(5)}</Text>
                    </div>
                  </Tooltip>
                ))}
              </div>
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No suspicious activity" />}
            <Space wrap style={{ marginTop: 8 }}>
              {Object.entries(c).map(([k, n]) => <Tag key={k}>{TYPE_LABEL[k] || k}: {n}</Tag>)}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={7}>
          <Card size="small" title="Top source IPs (7d)">
            <Table size="small" rowKey="ip" pagination={false} dataSource={data?.top_ips || []} loading={loading}
                   columns={[
                     { title: 'IP', dataIndex: 'ip', render: (ip) => <Space>{ip}{blockedSet.has(ip) && <Tag color="red">blocked</Tag>}</Space> },
                     { title: 'Events', dataIndex: 'events', width: 70 },
                     { title: '', key: 'a', width: 50, render: (_, r) => (blockedSet.has(r.ip)
                       ? <Tooltip title="Unblock"><Button size="small" type="text" icon={<UnlockOutlined />} onClick={() => setBlock(r.ip, 'unblock')} /></Tooltip>
                       : <Popconfirm title={`Block ${r.ip} for 30 minutes?`} onConfirm={() => setBlock(r.ip, 'block')}>
                           <Button size="small" type="text" danger icon={<StopOutlined />} />
                         </Popconfirm>) },
                   ]} />
          </Card>
        </Col>
        <Col xs={24} lg={7}>
          <Card size="small" title="Blocked IPs">
            <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
              <Input placeholder="IP address" value={ipInput} onChange={(e) => setIpInput(e.target.value.trim())} />
              <Button danger icon={<StopOutlined />} disabled={!IPV.test(ipInput)} onClick={() => setBlock(ipInput, 'block')}>Block</Button>
            </Space.Compact>
            {(data?.blocked_ips || []).length ? (data.blocked_ips.map((b) => (
              <div key={b.ip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span><Badge status="error" /> {b.ip} <Text type="secondary" style={{ fontSize: 11 }}>until {new Date(b.until).toLocaleTimeString()}</Text></span>
                <Button size="small" icon={<UnlockOutlined />} onClick={() => setBlock(b.ip, 'unblock')}>Unblock</Button>
              </div>
            ))) : <Text type="secondary">No IP is blocked right now</Text>}
          </Card>
        </Col>
      </Row>

      <Card size="small" title={<Space><SafetyOutlined /> Recent attacks & privilege changes</Space>}
            extra={<Segmented size="small" value={filter} onChange={setFilter}
                              options={[{ value: 'all', label: 'All' }, { value: 'critical', label: 'Critical' },
                                { value: 'privilege_escalation_attempt', label: 'Escalation' }, { value: 'injection_attempt', label: 'Injection' }]} />}>
        <Table size="small" rowKey="id" loading={loading} dataSource={recent} scroll={{ x: 'max-content' }}
               pagination={{ pageSize: 10, hideOnSinglePage: true }}
               expandable={{ expandedRowRender: (r) => <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(r.extra_data || {}, null, 2)}</pre> }}
               columns={[
                 { title: 'Time', dataIndex: 'created_at', render: when, width: 170 },
                 { title: 'Type', dataIndex: 'activity_type', render: (t) => TYPE_LABEL[t] || t },
                 { title: 'Severity', dataIndex: 'severity', render: (s) => <Tag color={SEV_COLOR[s]}>{s}</Tag> },
                 { title: 'What happened', dataIndex: 'description', ellipsis: true },
                 { title: 'IP', dataIndex: 'ip_address', render: (ip) => (ip ? <Space>{ip}{blockedSet.has(ip) && <Tag color="red">blocked</Tag>}</Space> : '—') },
                 { title: 'User', dataIndex: 'user_email', render: (e, r) => e || (r.user_id ? `#${r.user_id}` : 'anonymous') },
               ]} />
      </Card>

      <Card size="small" title={<Space><CrownOutlined /> Privileged accounts ({accounts.length})</Space>}>
        <Table size="small" rowKey="id" loading={loading} dataSource={accounts} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, hideOnSinglePage: true }}
               columns={[
                 { title: 'Account', key: 'n', render: (_, a) => <Space direction="vertical" size={0}><Text strong>{a.name}</Text><Text type="secondary" style={{ fontSize: 12 }}>{a.email}</Text></Space> },
                 { title: 'Rights', key: 'r', render: (_, a) => <Space wrap size={2}>
                   {a.super_admin && <Tag color="gold">super admin</Tag>}{a.platform_owner && <Tag color="purple">owner</Tag>}
                   {a.system_team && <Tag color="blue">SafeTrack team</Tag>}<Tag>{a.user_type}</Tag></Space> },
                 { title: '2FA', dataIndex: 'mfa_enabled', render: (v) => (v ? <Tag color="green">on</Tag> : <Tag color="red">off</Tag>) },
                 { title: 'Status', key: 's', render: (_, a) => <Space wrap size={2}>{a.is_active ? <Tag color="green">active</Tag> : <Tag>disabled</Tag>}
                   {a.flag_mismatch && <Tooltip title="Platform user type but no platform flag in the database — review this account"><Tag color="orange">type without flag</Tag></Tooltip>}</Space> },
                 { title: 'Last sign-in', dataIndex: 'last_login', render: when },
               ]} />
      </Card>
    </Space>
  );
};

export default SecurityCenter;
