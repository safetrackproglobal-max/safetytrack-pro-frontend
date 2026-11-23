// SafeTrack platform oversight of Workplace Voice: every report across companies with time, company and the
// reporter's identity where one was given (named + "protected identity"). Every view is audit-logged on the server.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Card, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, UserOutlined } from '@ant-design/icons';
import { apiGet } from '../../services/api';

const { Text } = Typography;
const RISK = { critical: 'red', high: 'volcano', medium: 'gold', low: 'green' };

const qs = (p) => Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== '')
  .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');

const VoiceOversight = () => {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, items: [], total: 0, companies: [] });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await apiGet(`/voice/platform/reports?${qs({ ...filters, page })}`);
      setState({ loading: false, ...res.data });
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      message.error(e?.data?.error || e?.message || 'Could not load reports');
    }
  }, [filters, page]);
  useEffect(() => { load(); }, [load]);

  return (
    <Card style={{ borderRadius: 12 }}>
      <Alert type="warning" showIcon icon={<LockOutlined />} style={{ marginBottom: 12 }}
        message="Confidential - reporter identities"
        description="Named and 'protected identity' reporters are shown here for SafeTrack only. Companies never see protected identities. Every time this list is opened it is recorded in the activity log." />
      <Space wrap style={{ marginBottom: 12 }}>
        <Select allowClear showSearch optionFilterProp="label" placeholder="Company" style={{ width: 220 }} value={filters.company_id}
          onChange={(v) => { setPage(1); setFilters((f) => ({ ...f, company_id: v })); }}
          options={state.companies.map((c) => ({ value: c.id, label: `${c.name} (${c.reports})` }))} />
        <Select allowClear placeholder="Identity" style={{ width: 170 }} value={filters.anonymity}
          onChange={(v) => { setPage(1); setFilters((f) => ({ ...f, anonymity: v })); }}
          options={[{ value: 'open', label: 'Named' }, { value: 'protected', label: 'Protected' }, { value: 'anonymous', label: 'Anonymous' }]} />
        <Input.Search allowClear placeholder="Name, contact, company or code" style={{ width: 260 }} maxLength={100}
          onSearch={(q) => { setPage(1); setFilters((f) => ({ ...f, q })); }} />
      </Space>
      <Table rowKey="id" size="small" loading={state.loading} dataSource={state.items} scroll={{ x: 1000 }}
        pagination={{ current: page, pageSize: 50, total: state.total, onChange: setPage, showSizeChanger: false }}
        columns={[
          { title: 'Received', dataIndex: 'created_at', width: 160, render: (d) => (d ? new Date(`${d}Z`).toLocaleString() : '') },
          { title: 'Company', dataIndex: 'company', width: 170 },
          { title: 'Reporter', key: 'who', width: 220, render: (_, r) => (
            r.reporter_name || r.reporter_contact
              ? <span><Tag icon={r.anonymity === 'protected' ? <LockOutlined /> : <UserOutlined />} color={r.anonymity === 'protected' ? 'purple' : 'blue'}>{r.anonymity === 'protected' ? 'Protected' : 'Named'}</Tag>
                <div><Text strong>{r.reporter_name || '—'}</Text></div><Text type="secondary" style={{ fontSize: 12 }}>{r.reporter_contact || ''}</Text></span>
              : <Tag icon={<EyeInvisibleOutlined />}>{r.anonymity === 'anonymous' ? 'Anonymous - no identity collected' : 'No name given'}</Tag>
          ) },
          { title: 'Report', dataIndex: 'title', render: (t, r) => <span><Text>{t || r.tracking_code}</Text><div><Text type="secondary" style={{ fontSize: 12 }}>{r.tracking_code} · {r.group}{r.language ? ` · ${r.language}` : ''}</Text></div></span> },
          { title: 'Risk', dataIndex: 'risk_level', width: 90, render: (v) => <Tag color={RISK[v]}>{v}</Tag> },
          { title: 'Status', dataIndex: 'status', width: 120, render: (s, r) => <span><Tag>{s}</Tag>{r.duplicate_of && <Tag color="orange">repeat</Tag>}{r.rewards_linked && <Tag color="gold">rewards</Tag>}</span> },
        ]} />
    </Card>
  );
};

export default VoiceOversight;
