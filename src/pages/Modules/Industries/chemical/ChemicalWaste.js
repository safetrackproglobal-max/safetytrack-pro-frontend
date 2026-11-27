// Chemical waste log: containers being filled, what is in them, how long they have been stored, compatibility check
// before adding something, and collection (contractor, transfer note / manifest). Data: /api/chem/waste (company-scoped).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Card, Checkbox, Col, DatePicker, Drawer, Empty, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography, message,
} from 'antd';
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import chemicalService, { chemErr } from '../../../../services/chemicalService';

const { Text, Paragraph } = Typography;

const toValues = (w) => ({
  ...w,
  contents: (w.contents || []).map((c) => (c.item_id ? `item:${c.item_id}` : c.name)),
  started_on: w.started_on ? dayjs(w.started_on) : dayjs(),
});

const WasteDrawer = ({ open, waste, register, groups, categories, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(null);
  const [check, setCheck] = useState(null);
  useEffect(() => {
    if (!open) return;
    setAdding(null); setCheck(null);
    form.resetFields();
    form.setFieldsValue(waste ? toValues(waste) : { limit_days: 90, started_on: dayjs(), contents: [], groups: [] });
  }, [open, waste, form]);
  const byId = useMemo(() => Object.fromEntries((register || []).map((r) => [`item:${r.id}`, r])), [register]);
  // groups follow the register chemicals put in the container
  const onContents = (vals) => {
    const g = new Set(form.getFieldValue('groups') || []);
    vals.forEach((v) => (byId[v]?.groups || []).forEach((x) => g.add(x)));
    form.setFieldsValue({ groups: [...g] });
  };
  const runCheck = async () => {
    const it = byId[adding];
    const g = form.getFieldValue('groups') || [];
    if (!it || !g.length) return;
    try {
      const r = (await chemicalService.compatibility({ items: [it.id], groups: g })).data;
      setCheck({ ...r, pairs: r.pairs.filter((p) => p.a === it.name || p.b === it.name), name: it.name, missing: !(it.groups || []).length });
    } catch (e) { message.error(chemErr(e)); }
  };
  const save = async () => {
    const v = await form.validateFields();
    const payload = {
      ...v,
      started_on: v.started_on ? v.started_on.format('YYYY-MM-DD') : null,
      contents: (v.contents || []).map((c) => (String(c).startsWith('item:') ? { item_id: Number(String(c).slice(5)) } : { name: c })),
    };
    setBusy(true);
    try { await chemicalService.saveWaste(payload, waste?.id); message.success('Saved'); onSaved(); } catch (e) { message.error(chemErr(e)); } finally { setBusy(false); }
  };
  return (
    <Drawer open={open} onClose={onClose} width={Math.min(760, typeof window !== 'undefined' ? window.innerWidth : 760)}
      title={waste ? waste.name : 'New waste container'} extra={<Button type="primary" loading={busy} onClick={save}>Save</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col xs={24} md={14}><Form.Item name="name" label="Container" rules={[{ required: true, min: 2 }]}><Input maxLength={200} placeholder='e.g. "Halogenated solvents, 20 L drum, Lab 2"' /></Form.Item></Col>
          <Col xs={24} md={10}><Form.Item name="category" label="Waste type"><Select allowClear options={(categories || []).map((c) => ({ value: c.id, label: c.name }))} /></Form.Item></Col>
          <Col span={24}>
            <Form.Item name="contents" label="What is in it" extra="Pick chemicals from the register, or type other contents and press Enter.">
              <Select mode="tags" optionFilterProp="label" onChange={onContents}
                options={(register || []).map((r) => ({ value: `item:${r.id}`, label: `${r.name}${r.cas ? ` (${r.cas})` : ''}` }))} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="groups" label="Reactivity groups of the contents" extra="Filled in from the register chemicals. Add groups for other contents. The check below uses them.">
              <Select mode="multiple" optionFilterProp="label" options={(groups || []).map((g) => ({ value: g.id, label: `${g.id}. ${g.name}` }))} />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}><Form.Item name="quantity" label="Amount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="unit" label="Unit"><Select allowClear options={['L', 'kg', 'drums', 'bags', 'containers'].map((u) => ({ value: u, label: u }))} /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="location" label="Where it is stored"><Input maxLength={160} /></Form.Item></Col>
          <Col xs={12} md={8}><Form.Item name="started_on" label="First waste added" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} disabledDate={(d) => d && d > dayjs().endOf('day')} /></Form.Item></Col>
          <Col xs={12} md={8}><Form.Item name="limit_days" label="Storage limit (days)" rules={[{ required: true }]}><InputNumber min={1} max={3650} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={24}>
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: -8 }}>
              Use the limit in your waste permit or national rules. For comparison, US EPA rules give large-quantity generators 90 days and small-quantity generators 180 days.
            </Paragraph>
          </Col>
          <Col span={24}><Form.Item name="notes" label="Notes"><Input.TextArea maxLength={4000} autoSize={{ minRows: 2, maxRows: 4 }} /></Form.Item></Col>
        </Row>
      </Form>
      <Card size="small" title={<span><SwapOutlined /> Before you add something to this container</span>} style={{ borderRadius: 12 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Select style={{ width: '100%' }} showSearch optionFilterProp="label" placeholder="Chemical you want to pour in" value={adding} onChange={(v) => { setAdding(v); setCheck(null); }}
            options={(register || []).filter((r) => r.status === 'in_use').map((r) => ({ value: `item:${r.id}`, label: r.name }))} />
          <Button type="primary" onClick={runCheck} disabled={!adding}>Check</Button>
        </Space.Compact>
        {check && (
          <div style={{ marginTop: 10 }}>
            {check.missing && <Alert type="warning" showIcon message={`${check.name} has no reactivity group in the register, so it cannot be checked.`} />}
            {!check.missing && (check.pairs.length === 0
              ? <Alert type="success" showIcon message={`The EPA chart shows no listed reaction between ${check.name} and these contents.`} description="A blank in the chart does not prove it is safe. Check the SDS (section 10) too." />
              : check.pairs.map((p, i) => (
                <Alert key={i} type={p.severity >= 3 ? 'error' : 'warning'} showIcon style={{ marginBottom: 6 }} message={`${p.verdict}: ${p.a} + ${p.b}`}
                  description={[...new Set(p.reactions.map((r) => r.meaning))].join('; ')} />
              )))}
          </div>
        )}
      </Card>
    </Drawer>
  );
};

const ChemicalWaste = ({ register, groups }) => {
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState({ can_manage: false, categories: [] });
  const [showCollected, setShowCollected] = useState(false);
  const [edit, setEdit] = useState(undefined);       // undefined closed, null new, object existing
  const [collect, setCollect] = useState(null);
  const [cform] = Form.useForm();
  const load = useCallback(() => {
    chemicalService.waste().then((r) => { setRows(r.data || []); setMeta({ can_manage: !!r.can_manage, categories: r.categories || [] }); })
      .catch((e) => { setRows([]); message.error(chemErr(e)); });
  }, []);
  useEffect(() => { load(); }, [load]);
  const list = (rows || []).filter((w) => showCollected || w.status === 'open');
  const due = (rows || []).filter((w) => w.issue);
  const doCollect = async () => {
    const v = await cform.validateFields();
    try {
      await chemicalService.saveWaste({ ...v, status: 'collected', collected_on: v.collected_on ? v.collected_on.format('YYYY-MM-DD') : null }, collect.id);
      message.success('Marked as collected'); setCollect(null); load();
    } catch (e) { message.error(chemErr(e)); }
  };
  return (
    <Card style={{ borderRadius: 16 }}>
      {due.length > 0 && <Alert type={due.some((w) => w.issue.level === 'critical') ? 'error' : 'warning'} showIcon style={{ marginBottom: 12 }}
        message={`${due.length} container(s) need collection soon`} description={due.map((w) => `${w.name}: ${w.issue.text}`).join(' ')} />}
      <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Space wrap>
          <Checkbox checked={showCollected} onChange={(e) => setShowCollected(e.target.checked)}>Show collected</Checkbox>
          <Button icon={<ReloadOutlined />} onClick={load} aria-label="Reload" />
        </Space>
        {meta.can_manage && <Button type="primary" icon={<PlusOutlined />} onClick={() => setEdit(null)}>New waste container</Button>}
      </Space>
      <Table rowKey="id" size="middle" loading={!rows} dataSource={list} scroll={{ x: 860 }} pagination={{ pageSize: 25, showSizeChanger: false }}
        onRow={(r) => ({ onClick: () => meta.can_manage && setEdit(r), style: { cursor: meta.can_manage ? 'pointer' : 'default' } })}
        locale={{ emptyText: <Empty description="No waste containers logged" /> }}
        columns={[
          { title: 'Container', dataIndex: 'name', render: (v, r) => <div><Text strong>{v}</Text><div><Text type="secondary">{r.category_name || ''}</Text></div></div> },
          { title: 'Contents', dataIndex: 'contents', render: (c) => (c.length ? c.map((x) => x.name).join(', ') : <Text type="secondary">-</Text>) },
          { title: 'Where', dataIndex: 'location', width: 140, render: (v) => v || '-' },
          { title: 'Amount', width: 100, render: (_, r) => (r.quantity != null ? `${r.quantity} ${r.unit || ''}` : '-') },
          { title: 'Stored', width: 170, render: (_, r) => (r.status === 'collected'
            ? <span><Tag color="green">collected</Tag>{r.collected_on}</span>
            : <span>{r.days} of {r.limit_days} days {r.issue && <Tag color={r.issue.level === 'critical' ? 'red' : 'orange'}>{r.days_left < 0 ? 'over limit' : `${r.days_left} left`}</Tag>}</span>) },
          ...(meta.can_manage ? [{ title: '', width: 170, render: (_, r) => (
            <Space onClick={(e) => e.stopPropagation()}>
              {r.status === 'open' && <Button size="small" onClick={() => { cform.resetFields(); cform.setFieldsValue({ collected_on: dayjs() }); setCollect(r); }}>Collected</Button>}
              <Popconfirm title="Delete this record?" onConfirm={async () => { try { await chemicalService.removeWaste(r.id); load(); } catch (e) { message.error(chemErr(e)); } }}>
                <Button size="small" danger icon={<DeleteOutlined />} aria-label="Delete" />
              </Popconfirm>
            </Space>
          ) }] : []),
        ]} />
      <WasteDrawer open={edit !== undefined} waste={edit} register={register || []} groups={groups}
        categories={meta.categories} onClose={() => setEdit(undefined)} onSaved={() => { setEdit(undefined); load(); }} />
      <Modal open={!!collect} title={collect ? `Collected: ${collect.name}` : ''} onCancel={() => setCollect(null)} onOk={doCollect} okText="Save">
        <Form form={cform} layout="vertical">
          <Form.Item name="collected_on" label="Collected on" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} disabledDate={(d) => d && d > dayjs().endOf('day')} /></Form.Item>
          <Form.Item name="contractor" label="Licensed waste contractor"><Input maxLength={160} /></Form.Item>
          <Form.Item name="manifest_no" label="Transfer note / manifest number"><Input maxLength={80} /></Form.Item>
          <Form.Item name="disposal_method" label="Disposal method"><Input maxLength={120} placeholder="e.g. incineration, recycling, treatment" /></Form.Item>
        </Form>
        <Paragraph type="secondary" style={{ fontSize: 12 }}>Keep the signed transfer note: upload it to the "Waste transfer notes" folder in Documents.</Paragraph>
      </Modal>
    </Card>
  );
};

export default ChemicalWaste;
