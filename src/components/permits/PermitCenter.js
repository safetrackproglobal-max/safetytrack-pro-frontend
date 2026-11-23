// src/components/permits/PermitCenter.js
// Permit-to-work register with the 12 standard international permit types.
import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Card, Col, Row, Table, Tag, Space, Input, Select, Modal, message, Typography, Alert, Steps, Tooltip, Empty,
} from 'antd';
import {
  PlusOutlined, FilePdfOutlined, SendOutlined, PlayCircleOutlined, PauseCircleOutlined, CheckSquareOutlined,
  StopOutlined, EditOutlined, ReloadOutlined, AppstoreAddOutlined,
} from '@ant-design/icons';
import permitService from '../../services/permitService';
import PermitWizard from './PermitWizard';
import SubmitForApproval from '../submissions/SubmitForApproval';
import './Permits.css';

const { Text, Paragraph } = Typography;
export const PERMIT_STATUS = {
  draft: { color: 'default', label: 'Draft' },
  in_approval: { color: 'processing', label: 'In approval' },
  approved: { color: 'cyan', label: 'Approved — ready to activate' },
  active: { color: 'success', label: 'Active' },
  suspended: { color: 'warning', label: 'Suspended' },
  expired: { color: 'error', label: 'Expired' },
  closed: { color: 'default', label: 'Closed' },
  rejected: { color: 'error', label: 'Rejected — edit and resend' },
  cancelled: { color: 'default', label: 'Cancelled' },
};
const RISK_COLOR = { Low: 'green', Medium: 'gold', High: 'volcano', Extreme: 'red' };

const timeLeft = (end) => {
  if (!end) return null;
  const ms = new Date(end) - new Date();
  if (ms <= 0) return 'ended';
  const h = Math.floor(ms / 3600000);
  return h >= 48 ? `${Math.floor(h / 24)} days left` : `${h} h ${Math.floor((ms % 3600000) / 60000)} min left`;
};

function PermitCenter() {
  const [catalog, setCatalog] = useState(null);
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: undefined, q: '' });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [wizard, setWizard] = useState(null);        // { type } | { permit }
  const [submitDoc, setSubmitDoc] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status && filter.status !== 'expired') params.status = filter.status;
      if (filter.q) params.q = filter.q;
      let list = (await permitService.list(params)).permits || [];
      if (filter.status === 'expired') list = list.filter((p) => p.status === 'expired');
      setPermits(list);
    } catch (e) { message.error(e.message); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { permitService.catalog().then(setCatalog).catch((e) => message.error(e.message)); }, []);
  useEffect(() => { load(); }, [load]);

  const openPermit = async (id) => {
    try { setWizard({ permit: (await permitService.get(id)).permit }); } catch (e) { message.error(e.message); }
  };

  const changeStatus = (p, action) => {
    const labels = { activate: 'Activate', suspend: 'Suspend', close: 'Close out', cancel: 'Cancel' };
    let notes = '';
    Modal.confirm({
      title: `${labels[action]} permit ${p.permit_number}?`,
      content: (
        <div>
          {action === 'activate' && <Paragraph>Confirm all precautions are in place and the gas test (if required) is acceptable. Work may start once the permit is active.</Paragraph>}
          {action === 'suspend' && <Paragraph>Work must stop. Use this for alarms, changed conditions or shift breaks. You can activate it again later.</Paragraph>}
          {action === 'close' && <Paragraph>Confirm the work is complete, the area is left safe and clean and isolations are removed.</Paragraph>}
          {action === 'cancel' && <Paragraph>The permit can no longer be used.</Paragraph>}
          <Input.TextArea rows={3} placeholder={action === 'close' ? 'Close-out notes (required)' : 'Notes (optional)'} onChange={(e) => { notes = e.target.value; }} />
        </div>
      ),
      okText: labels[action],
      okButtonProps: { danger: action === 'cancel' || action === 'suspend' },
      onOk: async () => {
        try { await permitService.setStatus(p.id, action, notes); message.success(`Permit ${labels[action].toLowerCase()}d`); load(); }
        catch (e) { message.error(e.message); throw e; }
      },
    });
  };

  const columns = [
    {
      title: 'Permit', key: 'p',
      render: (_, p) => (
        <div className="pm-cell">
          <b>{p.permit_number}</b>
          <span>{p.title}</span>
          <Text type="secondary" className="pm-small">{catalog?.types.find((t) => t.key === p.permit_type)?.name || 'Custom permit'}</Text>
        </div>
      ),
    },
    { title: 'Location', dataIndex: 'location', responsive: ['md'] },
    {
      title: 'Validity', key: 'v', responsive: ['lg'],
      render: (_, p) => (p.start_at ? (
        <div className="pm-small">
          {new Date(p.start_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} → {new Date(p.end_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          {p.status === 'active' && <div><Tag color="green">{timeLeft(p.end_at)}</Tag></div>}
        </div>
      ) : '—'),
    },
    { title: 'Risk', dataIndex: 'risk_level', width: 90, render: (r) => (r ? <Tag color={RISK_COLOR[r]}>{r}</Tag> : '—') },
    { title: 'Status', dataIndex: 'status', width: 190, render: (s) => <Tag color={PERMIT_STATUS[s]?.color}>{PERMIT_STATUS[s]?.label || s}</Tag> },
    {
      title: '', key: 'a', width: 260,
      render: (_, p) => (
        <Space wrap size={4}>
          <Tooltip title={p.editable ? 'Edit' : 'View'}><Button size="small" icon={<EditOutlined />} onClick={() => openPermit(p.id)} /></Tooltip>
          {p.document_id && <Tooltip title="Download permit PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={() => permitService.downloadDocument(p.document_id, `${p.permit_number}.pdf`)} /></Tooltip>}
          {p.editable && p.document_id && <Button size="small" icon={<SendOutlined />} onClick={() => setSubmitDoc({ id: p.document_id, title: `${p.permit_number} — ${p.title}` })}>Send for approval</Button>}
          {['approved', 'suspended'].includes(p.status) && <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => changeStatus(p, 'activate')}>{p.status === 'suspended' ? 'Resume' : 'Activate'}</Button>}
          {p.status === 'active' && <Button size="small" icon={<PauseCircleOutlined />} onClick={() => changeStatus(p, 'suspend')}>Suspend</Button>}
          {['active', 'suspended', 'approved', 'expired'].includes(p.status) && <Button size="small" icon={<CheckSquareOutlined />} onClick={() => changeStatus(p, 'close')}>Close out</Button>}
          {['draft', 'rejected', 'approved', 'in_approval'].includes(p.status) && <Tooltip title="Cancel permit"><Button size="small" danger icon={<StopOutlined />} onClick={() => changeStatus(p, 'cancel')} /></Tooltip>}
        </Space>
      ),
    },
  ];

  const counts = permits.reduce((m, p) => ({ ...m, [p.status]: (m[p.status] || 0) + 1 }), {});

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Steps size="small" items={[
          { title: 'Choose permit type', description: 'International standard templates' },
          { title: 'Fill in & assess risk', description: 'Hazards, precautions, gas tests, documents' },
          { title: 'Send for approval', description: 'Area authority, HSE, client sign or stamp' },
          { title: 'Activate → close out', description: 'Suspend any time conditions change' },
        ]} />
      </Card>
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {['active', 'approved', 'in_approval', 'expired'].map((s) => (
          <Col xs={12} md={6} key={s}>
            <Card size="small" hoverable onClick={() => setFilter((f) => ({ ...f, status: f.status === s ? undefined : s }))} className={filter.status === s ? 'pm-kpi pm-kpi-on' : 'pm-kpi'}>
              <div className="pm-kpi-n">{counts[s] || 0}</div>
              <Tag color={PERMIT_STATUS[s].color}>{PERMIT_STATUS[s].label.split(' —')[0]}</Tag>
            </Card>
          </Col>
        ))}
      </Row>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }} wrap>
        <Space wrap>
          <Input.Search allowClear placeholder="Search number, title or location" style={{ width: 280 }} onSearch={(q) => setFilter((f) => ({ ...f, q }))} />
          <Select allowClear placeholder="All statuses" style={{ width: 210 }} value={filter.status}
            onChange={(v) => setFilter((f) => ({ ...f, status: v }))}
            options={Object.entries(PERMIT_STATUS).map(([k, v]) => ({ value: k, label: v.label.split(' —')[0] }))} />
          <Button icon={<ReloadOutlined />} onClick={load} />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setPickerOpen(true)} disabled={!catalog}>New permit</Button>
      </Space>
      <Table rowKey="id" loading={loading} dataSource={permits} columns={columns} scroll={{ x: 900 }} pagination={{ pageSize: 15 }}
        locale={{ emptyText: <Empty description="No permits yet — click New permit" /> }} />

      <Modal open={pickerOpen} onCancel={() => setPickerOpen(false)} footer={null} width={1000} title="Choose a permit type">
        <Alert type="info" showIcon style={{ marginBottom: 12 }}
          message="Each type comes with its own risk assessment, precautions, required documents, PPE and sign-off roles"
          description="Everything is a starting point — you can change, remove or add items for your job." />
        <Row gutter={[12, 12]}>
          {(catalog?.types || []).map((t) => (
            <Col xs={24} sm={12} lg={8} key={t.key}>
              <Card size="small" hoverable className="pm-type" style={{ borderTopColor: t.color }}
                onClick={() => { setPickerOpen(false); setWizard({ type: t.key }); }}>
                <b>{t.name}</b>
                <Paragraph type="secondary" className="pm-small" ellipsis={{ rows: 3 }}>{t.description}</Paragraph>
                <Space wrap size={4}>
                  {t.gas_test && <Tag color="orange">Gas test</Tag>}
                  <Tag>{t.validity_hours} h</Tag>
                  <Tag>{t.required_documents.length} documents</Tag>
                </Space>
                <div className="pm-std">{t.standards.join(' · ')}</div>
              </Card>
            </Col>
          ))}
          <Col xs={24} sm={12} lg={8}>
            <Card size="small" hoverable className="pm-type" onClick={() => { setPickerOpen(false); setWizard({ type: 'custom' }); }}>
              <b><AppstoreAddOutlined /> Custom permit</b>
              <Paragraph type="secondary" className="pm-small">Start from a blank form and build your own permit type, hazards and checklist.</Paragraph>
            </Card>
          </Col>
        </Row>
      </Modal>

      <PermitWizard open={!!wizard} catalog={catalog} permitType={wizard?.type} permit={wizard?.permit}
        onClose={() => { setWizard(null); load(); }} onSaved={() => load()} />
      <SubmitForApproval open={!!submitDoc} document={submitDoc} onClose={() => setSubmitDoc(null)} onSubmitted={load} />
    </div>
  );
}

export default PermitCenter;
