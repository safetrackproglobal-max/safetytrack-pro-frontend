// Oil & gas part 2 inside HSE > Oil & Gas: shift handover built from live data, barrier health by area, gas detector
// bump tests and calibration (a detector must pass one in the last 24 h before a gas test), dropped objects (DROPS).
// Data: /api/og/handovers, /api/og/barriers, /api/og/detectors, /api/og/drops.
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Badge, Button, Card, Checkbox, Col, Drawer, Empty, Form, Input, InputNumber, List, Modal, Row, Select, Space, Statistic, Table, Tag, Typography, message,
} from 'antd';
import dayjs from 'dayjs';
import { CheckCircleOutlined, MinusCircleOutlined, PlusOutlined, ReloadOutlined, SwapOutlined } from '@ant-design/icons';
import { apiGet, apiPost, apiPut } from '../../../../services/api';

const { Text, Paragraph } = Typography;
const err = (e) => e?.data?.error || e?.response?.data?.error || e?.message || 'Something went wrong';
const dt = (x) => (x ? dayjs(x).format('D MMM HH:mm') : '-');
const LVL = { red: 'red', amber: 'orange', green: 'green' };

// ------------------------------------------------------------------ shift handover
const ItemRow = ({ i, onAck, canAck }) => (
  <List.Item style={{ alignItems: 'flex-start' }}
    actions={canAck ? [<Checkbox key="a" checked={!!i.ack} onChange={(e) => onAck(i, e.target.checked)}>Understood</Checkbox>] : (i.ack ? [<Tag key="a" color="green">acknowledged</Tag>] : [])}>
    <div style={{ minWidth: 0 }}>
      <Space wrap size={4}>
        {i.level === 'high' && <Tag color="red">important</Tag>}
        <Tag>{i.kind}</Tag>
        {i.new && <Tag color="blue">{i.during ? 'appeared during handover' : 'new since last shift'}</Tag>}
        <Text strong>{i.title}</Text>
      </Space>
      {i.detail && <div><Text type="secondary" style={{ fontSize: 12 }}>{i.detail}</Text></div>}
      {i.note && <div style={{ fontSize: 13 }}>Note: {i.note}</div>}
    </div>
  </List.Item>
);

export const Handover = () => {
  const [rows, setRows] = useState(null);
  const [me, setMe] = useState(null);
  const [area, setArea] = useState('');
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [shift, setShift] = useState('');
  const [itemNotes, setItemNotes] = useState({});
  const [open, setOpen] = useState(null);
  const [concerns, setConcerns] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => apiGet('/og/handovers').then((r) => { setRows(r.data || []); setMe(r.me); }).catch((e) => { setRows([]); message.error(err(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const build = () => apiGet(`/og/handovers?preview=1&area=${encodeURIComponent(area)}`).then((r) => { setPreview(r.data); setItemNotes({}); }).catch((e) => message.error(err(e)));
  const create = async () => {
    setBusy(true);
    try {
      await apiPost('/og/handovers', { area, shift_label: shift, notes, item_notes: itemNotes });
      message.success('Handover ready: the incoming person now goes through each item');
      setPreview(null); setNotes(''); load();
    } catch (e) { message.error(err(e)); } finally { setBusy(false); }
  };
  const ack = async (i, v) => {
    try { const r = await apiPut(`/og/handovers/${open.id}`, { action: 'ack', key: i.key, ack: v }); setOpen(r.data); } catch (e) { message.error(err(e)); }
  };
  const accept = async () => {
    try {
      const r = await apiPut(`/og/handovers/${open.id}`, { action: 'accept', concerns });
      message.success('Handover accepted: you now have the shift'); setOpen(null); setConcerns(''); load(); return r;
    } catch (e) {
      if (e?.data?.code === 'CHANGED') { setOpen(e.data.data); message.warning(err(e)); } else message.error(err(e));
    }
    return null;
  };
  const cancel = async () => { try { await apiPut(`/og/handovers/${open.id}`, { action: 'cancel' }); setOpen(null); load(); } catch (e) { message.error(err(e)); } };
  const waiting = (rows || []).filter((h) => h.status === 'open');
  const ST = { open: 'gold', accepted: 'green', cancelled: 'default' };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Paragraph style={{ marginBottom: 12 }}>The handover is built from what is live now: permits, isolations, bypassed devices, failed gas tests, temporary changes, out-of-service detectors and dropped-object risks. The person taking over must tick every item before accepting; anything that appears during the handover is added and must be ticked too.</Paragraph>
      {waiting.map((h) => (
        <Alert key={h.id} type="warning" showIcon style={{ marginBottom: 8 }}
          message={<span>Waiting to be accepted: {h.area || 'Whole site'} from {h.outgoing} ({dt(h.created_at)}), {h.acknowledged}/{h.total} acknowledged</span>}
          action={<Button size="small" type="primary" onClick={() => setOpen(h)}>{h.outgoing_id === me ? 'View' : 'Take over'}</Button>} />
      ))}
      <Card size="small" title={<span><SwapOutlined /> Hand over my shift</span>} style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={10}>
          <Col xs={24} md={10}><Input placeholder="Area (empty = whole site)" value={area} onChange={(e) => setArea(e.target.value)} maxLength={200} /></Col>
          <Col xs={24} md={8}><Input placeholder="Shift (for example Day to night)" value={shift} onChange={(e) => setShift(e.target.value)} maxLength={80} style={{ marginTop: 0 }} /></Col>
          <Col xs={24} md={6}><Button block onClick={build}>Build handover</Button></Col>
        </Row>
        {preview && (
          <div style={{ marginTop: 12 }}>
            {preview.items.length === 0 ? <Alert type="success" showIcon message="Nothing live in this area. Write a note for the next shift." /> : (
              <List size="small" dataSource={preview.items} renderItem={(i) => (
                <div key={i.key}>
                  <ItemRow i={i} />
                  <Input size="small" placeholder="Add a note for this item (optional)" maxLength={300} value={itemNotes[i.key] || ''}
                    onChange={(e) => setItemNotes({ ...itemNotes, [i.key]: e.target.value })} style={{ marginBottom: 8 }} />
                </div>
              )} />
            )}
            {preview.cleared.length > 0 && <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>Cleared since the last handover: {preview.cleared.map((c) => c.title).join('; ')}</Paragraph>}
            <Input.TextArea placeholder="Anything else the next shift must know (equipment behaving oddly, jobs half done, visitors on site)" value={notes}
              onChange={(e) => setNotes(e.target.value)} autoSize={{ minRows: 2, maxRows: 6 }} maxLength={4000} style={{ marginTop: 8 }} />
            <Button type="primary" style={{ marginTop: 8 }} loading={busy} onClick={create}>Send handover</Button>
          </div>
        )}
      </Card>
      <Table rowKey="id" size="small" loading={!rows} dataSource={rows || []} pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 700 }}
        onRow={(r) => ({ onClick: () => setOpen(r), style: { cursor: 'pointer' } })} locale={{ emptyText: <Empty description="No handovers yet" /> }}
        columns={[
          { title: 'When', render: (_, r) => dt(r.created_at) }, { title: 'Area', render: (_, r) => r.area || 'Whole site' },
          { title: 'From', dataIndex: 'outgoing' }, { title: 'To', render: (_, r) => r.incoming || '-' },
          { title: 'Items', render: (_, r) => `${r.acknowledged}/${r.total}` },
          { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={ST[s]}>{s}</Tag> },
        ]} />
      <Drawer open={!!open} onClose={() => setOpen(null)} width={Math.min(640, window.innerWidth)} title={open ? `Handover: ${open.area || 'Whole site'}` : ''}>
        {open && (
          <>
            <Paragraph type="secondary">From {open.outgoing} at {dt(open.created_at)}{open.shift_label ? ` · ${open.shift_label}` : ''}{open.incoming ? ` · accepted by ${open.incoming} ${dt(open.accepted_at)}` : ''}</Paragraph>
            {open.notes && <Alert type="info" style={{ marginBottom: 12 }} message="Notes from the outgoing shift" description={open.notes} />}
            <List size="small" dataSource={open.items} locale={{ emptyText: 'No live items' }}
              renderItem={(i) => <ItemRow key={i.key} i={i} canAck={open.status === 'open' && open.outgoing_id !== me} onAck={ack} />} />
            {open.cleared?.length > 0 && <Paragraph type="secondary" style={{ fontSize: 12 }}>Cleared since the previous handover: {open.cleared.map((c) => c.title).join('; ')}</Paragraph>}
            {open.concerns && <Alert type="warning" message="Concerns raised when accepting" description={open.concerns} />}
            {open.status === 'open' && open.outgoing_id !== me && (
              <>
                <Input.TextArea placeholder="Concerns (optional; supervisors are told)" value={concerns} onChange={(e) => setConcerns(e.target.value)} maxLength={2000} style={{ marginTop: 12 }} />
                <Button type="primary" block style={{ marginTop: 8 }} disabled={open.items.some((i) => !i.ack)} onClick={accept}>
                  {open.items.some((i) => !i.ack) ? `Tick every item first (${open.items.filter((i) => !i.ack).length} left)` : 'Accept the shift'}
                </Button>
              </>
            )}
            {open.status === 'open' && open.outgoing_id === me && <Alert type="info" showIcon style={{ marginTop: 12 }} message="The person taking over must open this and tick every item." action={<Button size="small" danger onClick={cancel}>Cancel</Button>} />}
          </>
        )}
      </Drawer>
    </Card>
  );
};

// ------------------------------------------------------------------ barrier health
export const Barriers = ({ onTab }) => {
  const [d, setD] = useState(null);
  const load = useCallback(() => { setD(null); apiGet('/og/barriers').then(setD).catch((e) => { setD({ data: [], barriers: [], totals: {} }); message.error(err(e)); }); }, []);
  useEffect(() => { load(); }, [load]);
  if (!d) return <Card loading style={{ borderRadius: 16 }} />;
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Space size={24}>
          <Statistic title="Barriers failed (red)" value={d.totals.red || 0} valueStyle={{ color: d.totals.red ? '#cf1322' : undefined }} />
          <Statistic title="Barriers weakened (amber)" value={d.totals.amber || 0} valueStyle={{ color: d.totals.amber ? '#d46b08' : undefined }} />
        </Space>
        <Button icon={<ReloadOutlined />} onClick={load} aria-label="Reload" />
      </Space>
      {d.data.length === 0 && <Alert type="success" showIcon message="No degraded barriers recorded." description={d.note} />}
      {d.data.map((a) => (
        <Card key={a.area} size="small" style={{ borderRadius: 12, marginBottom: 12, borderLeft: `4px solid ${a.status === 'red' ? '#cf1322' : '#d46b08'}` }}
          title={<span>{a.area} <Tag color={LVL[a.status]}>{a.red ? `${a.red} red` : ''}{a.red && a.amber ? ', ' : ''}{a.amber ? `${a.amber} amber` : ''}</Tag></span>}>
          <Space wrap size={4} style={{ marginBottom: 8 }}>
            {d.barriers.map((b) => <Tag key={b.id} color={LVL[a.barriers[b.id] || 'green']}>{b.name}</Tag>)}
          </Space>
          <List size="small" dataSource={a.issues} renderItem={(i, n) => (
            <List.Item key={n} actions={onTab ? [<Button key="g" size="small" type="link" onClick={() => onTab(i.tab)}>Open</Button>] : []}>
              <div style={{ minWidth: 0 }}>
                <Badge color={i.level === 'red' ? '#cf1322' : '#d46b08'} /> <Text strong>{i.text}</Text> <Text type="secondary" style={{ fontSize: 12 }}>({i.barrier_name})</Text>
                <div style={{ fontSize: 13 }}>To restore: {i.fix}</div>
              </div>
            </List.Item>
          )} />
        </Card>
      ))}
      {d.data.length > 0 && <Paragraph type="secondary" style={{ fontSize: 12 }}>{d.note}</Paragraph>}
    </Card>
  );
};

// ------------------------------------------------------------------ gas detectors
const CheckModal = ({ det, gases, tol, onClose, onSaved }) => {
  const [kind, setKind] = useState('bump');
  const [rows, setRows] = useState([{ gas: 'O2', alarmed: true }, { gas: 'LEL', alarmed: true }, { gas: 'H2S', alarmed: true }, { gas: 'CO', alarmed: true }]);
  const [tolerance, setTolerance] = useState(tol);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (n, k, v) => setRows(rows.map((r, i) => (i === n ? { ...r, [k]: v } : r)));
  const save = async () => {
    setBusy(true);
    try {
      const r = await apiPost(`/og/detectors/${det.id}/checks`, { kind, sensors: rows, tolerance_pct: tolerance, note });
      if (r.data.result === 'pass') message.success(`${kind === 'bump' ? 'Bump test' : 'Calibration'} passed`); else message.error(`FAILED: ${r.data.reasons.join('; ')}. The detector is now out of service.`);
      if (r.message) message.warning(r.message);
      onSaved();
    } catch (e) { message.error(err(e)); } finally { setBusy(false); }
  };
  return (
    <Modal open title={`${det.tag_no} ${det.name}`} onCancel={onClose} onOk={save} okText="Record" confirmLoading={busy} width={Math.min(620, window.innerWidth - 24)}>
      <Select value={kind} onChange={setKind} style={{ width: '100%', marginBottom: 8 }} options={[{ value: 'bump', label: 'Bump test (does each sensor alarm?)' }, { value: 'calibration', label: 'Calibration check (reading against test gas)' }]} />
      {rows.map((r, n) => (
        <Row key={n} gutter={6} style={{ marginBottom: 6 }} align="middle">
          <Col span={kind === 'bump' ? 10 : 6}><Select value={r.gas} onChange={(v) => set(n, 'gas', v)} style={{ width: '100%' }} options={gases.map((g) => ({ value: g, label: g }))} /></Col>
          {kind === 'calibration' && <Col span={6}><InputNumber placeholder="Test gas" value={r.applied} onChange={(v) => set(n, 'applied', v)} min={0} style={{ width: '100%' }} /></Col>}
          {kind === 'calibration' && <Col span={6}><InputNumber placeholder="Reading" value={r.reading} onChange={(v) => set(n, 'reading', v)} min={0} style={{ width: '100%' }} /></Col>}
          <Col span={kind === 'bump' ? 12 : 4}><Checkbox checked={r.alarmed === true} onChange={(e) => set(n, 'alarmed', e.target.checked)}>Alarmed</Checkbox></Col>
          <Col span={2}><Button size="small" type="text" icon={<MinusCircleOutlined />} aria-label="Remove sensor" onClick={() => setRows(rows.filter((_, i) => i !== n))} /></Col>
        </Row>
      ))}
      <Button size="small" icon={<PlusOutlined />} onClick={() => setRows([...rows, { gas: gases.find((g) => !rows.some((r) => r.gas === g)) || 'OTHER', alarmed: true }])}>Sensor</Button>
      {kind === 'calibration' && <div style={{ marginTop: 8 }}><Text>Allowed difference %</Text> <InputNumber min={1} max={50} value={tolerance} onChange={setTolerance} /> <Text type="secondary" style={{ fontSize: 12 }}>default {tol}%: use your maker's figure</Text></div>}
      <Input placeholder="Note (test gas cylinder, lot number)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} style={{ marginTop: 8 }} />
      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>A failed check takes the detector out of service. It comes back after a passing calibration. A detector needs a passing bump test or calibration in the last 24 hours before it can be used for a gas test (ISEA: before each day's use).</Paragraph>
    </Modal>
  );
};

export const Detectors = () => {
  const [d, setD] = useState(null);
  const [check, setCheck] = useState(null);
  const [hist, setHist] = useState(null);
  const load = useCallback(() => apiGet('/og/detectors').then(setD).catch((e) => { setD({ data: [], counts: {} }); message.error(err(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const history = (r) => apiGet(`/og/detectors/${r.id}/checks`).then((x) => setHist({ det: r, rows: x.data })).catch((e) => message.error(err(e)));
  return (
    <Card style={{ borderRadius: 16 }}>
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col xs={8}><Statistic title="Ready to use" value={d?.counts?.usable ?? 0} valueStyle={{ color: '#389e0d' }} /></Col>
        <Col xs={8}><Statistic title="Need a bump test" value={d?.counts?.need_bump ?? 0} valueStyle={{ color: d?.counts?.need_bump ? '#d46b08' : undefined }} /></Col>
        <Col xs={8}><Statistic title="Failed" value={d?.counts?.failed ?? 0} valueStyle={{ color: d?.counts?.failed ? '#cf1322' : undefined }} /></Col>
      </Row>
      <Table rowKey="id" size="middle" loading={!d} dataSource={d?.data || []} scroll={{ x: 760 }} pagination={false}
        locale={{ emptyText: <Empty description="No gas detectors. Add them in Inspections > Equipment with the category Gas detector." /> }}
        columns={[
          { title: 'Detector', render: (_, r) => <div><Text strong>{r.tag_no}</Text> {r.name}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.location || ''}</Text></div></div> },
          { title: 'Today', render: (_, r) => (r.usable ? <Tag color="green" icon={<CheckCircleOutlined />}>ready</Tag> : <Tag color={(r.last_check || {}).result === 'fail' || r.state_level === 'red' ? 'red' : 'orange'} style={{ whiteSpace: 'normal' }}>{r.bump_ok ? r.state_label : r.bump_label}</Tag>) },
          { title: 'Last check', render: (_, r) => (r.last_check ? `${r.last_check.kind} ${r.last_check.result} ${dt(r.last_check.at)}` : '-') },
          { title: 'Calibration due', render: (_, r) => r.cert_due || '-' },
          { title: '', render: (_, r) => <Space><Button size="small" type="primary" onClick={() => setCheck(r)}>Bump / calibrate</Button><Button size="small" onClick={() => history(r)}>History</Button></Space> },
        ]} />
      {check && <CheckModal det={check} gases={d.gases || []} tol={d.tolerance_default || 10} onClose={() => setCheck(null)} onSaved={() => { setCheck(null); load(); }} />}
      <Drawer open={!!hist} onClose={() => setHist(null)} width={Math.min(560, window.innerWidth)} title={hist ? `${hist.det.tag_no} checks` : ''}>
        {hist && <List size="small" dataSource={hist.rows} locale={{ emptyText: 'No checks yet' }} renderItem={(c) => (
          <List.Item key={c.id}><div><Tag color={c.result === 'pass' ? 'green' : 'red'}>{c.kind} {c.result}</Tag> {dt(c.checked_at)} by {c.checked_by}
            <div style={{ fontSize: 12 }}>{c.sensors.map((s) => `${s.gas}${s.reading != null ? ` ${s.reading}/${s.applied}` : ''}${s.alarmed ? ' alarmed' : ''}`).join(' · ')}</div>
            {c.reasons.length > 0 && <div style={{ fontSize: 12, color: '#cf1322' }}>{c.reasons.join('; ')}</div>}</div></List.Item>
        )} />}
      </Drawer>
    </Card>
  );
};

// ------------------------------------------------------------------ dropped objects
const blankFinding = () => ({ item: '', position: '', issue: 'no_secondary', mass_kg: null, height_m: null, consequence: null, people_below: true });
export const Drops = () => {
  const [d, setD] = useState(null);
  const [all, setAll] = useState(false);
  const [survey, setSurvey] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => apiGet(`/og/drops${all ? '?all=1' : ''}`).then(setD).catch((e) => { setD({ data: [], coverage: [], issues: [] }); message.error(err(e)); }), [all]);
  useEffect(() => { load(); }, [load]);
  const setF = (n, k, v) => setSurvey({ ...survey, findings: survey.findings.map((f, i) => (i === n ? { ...f, [k]: v } : f)) });
  const save = async () => {
    setBusy(true);
    try { await apiPost('/og/drops/surveys', survey); message.success('Survey recorded'); setSurvey(null); load(); } catch (e) { message.error(err(e)); } finally { setBusy(false); }
  };
  const fix = (f) => { const note = window.prompt('How was it secured?', 'Secondary retention fitted and checked'); if (note) apiPut(`/og/drops/${f.id}`, { action: 'fix', note }).then(load).catch((e) => message.error(err(e))); };
  const conseq = (f, v) => apiPut(`/og/drops/${f.id}`, { action: 'consequence', consequence: v }).then(load).catch((e) => message.error(err(e)));
  const PC = { 4: 'red', 3: 'red', 2: 'orange', 1: 'default', 0: 'green' };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Checkbox checked={all} onChange={(e) => setAll(e.target.checked)}>Show fixed</Checkbox>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setSurvey({ area: '', items_checked: null, note: '', findings: [blankFinding()] })}>Record a survey</Button>
      </Space>
      <Table rowKey="id" size="middle" loading={!d} dataSource={d?.data || []} scroll={{ x: 900 }} pagination={{ pageSize: 15, showSizeChanger: false }}
        locale={{ emptyText: <Empty description="No open dropped-object findings" /> }}
        columns={[
          { title: 'Item', render: (_, r) => <div><Text strong>{r.item}</Text><div><Text type="secondary" style={{ fontSize: 12 }}>{r.area}{r.position ? ` · ${r.position}` : ''}</Text></div></div> },
          { title: 'Issue', dataIndex: 'issue_name' },
          { title: 'Drop', render: (_, r) => <div>{r.mass_kg} kg from {r.height_m} m<div><Text type="secondary" style={{ fontSize: 12 }}>{r.energy_j} J{r.people_below ? ' · people below' : ''}</Text></div></div> },
          { title: 'Consequence', render: (_, r) => <Select size="small" value={r.consequence} placeholder="set" style={{ width: 100 }} disabled={r.status !== 'open'} onChange={(v) => conseq(r, v)} options={['minor', 'serious', 'fatal'].map((x) => ({ value: x, label: x }))} /> },
          { title: 'Do now', render: (_, r) => <Tag color={PC[r.priority[0]]} style={{ whiteSpace: 'normal' }}>{r.priority[1]}</Tag> },
          { title: '', render: (_, r) => (r.status === 'open' ? <Button size="small" onClick={() => fix(r)}>Fixed</Button> : <Tag color="green">fixed {dt(r.fixed_at)}</Tag>) },
        ]} />
      <Card size="small" title="Survey coverage by area" style={{ marginTop: 16, borderRadius: 12 }}>
        {(d?.coverage || []).length === 0 ? <Text type="secondary">No surveys recorded yet.</Text> : (
          <List size="small" dataSource={d.coverage} renderItem={(c) => (
            <List.Item key={c.area}><Space wrap><Text strong>{c.area}</Text><Text type="secondary">last surveyed {c.days} day(s) ago by {c.by}</Text>
              {c.stale && <Tag color="orange">over {d.stale_days} days: survey again</Tag>}{c.open_findings > 0 && <Tag color="red">{c.open_findings} open</Tag>}</Space></List.Item>
          )} />
        )}
      </Card>
      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>Drop energy = mass × 9.81 × height. Read the consequence (minor, serious, fatal) from the DROPS Calculator (dropsonline.org) for the mass and height; it is a guide for blunt objects with standard PPE.</Paragraph>
      <Modal open={!!survey} title="Dropped objects survey" onCancel={() => setSurvey(null)} onOk={save} okText="Save survey" confirmLoading={busy} width={Math.min(860, window.innerWidth - 24)}>
        {survey && (
          <>
            <Row gutter={8}>
              <Col xs={24} md={14}><Form.Item label="Area surveyed" required style={{ marginBottom: 8 }}><Input value={survey.area} onChange={(e) => setSurvey({ ...survey, area: e.target.value })} maxLength={200} /></Form.Item></Col>
              <Col xs={24} md={10}><Form.Item label="Items checked" style={{ marginBottom: 8 }}><InputNumber min={0} value={survey.items_checked} onChange={(v) => setSurvey({ ...survey, items_checked: v })} style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            {survey.findings.map((f, n) => (
              <Card key={n} size="small" style={{ marginBottom: 8, borderRadius: 10 }} title={`Finding ${n + 1}`}
                extra={<Button size="small" type="text" icon={<MinusCircleOutlined />} aria-label="Remove finding" onClick={() => setSurvey({ ...survey, findings: survey.findings.filter((_, i) => i !== n) })} />}>
                <Row gutter={6}>
                  <Col xs={24} md={12}><Input placeholder="Item (light fitting, bolt, tool)" value={f.item} onChange={(e) => setF(n, 'item', e.target.value)} maxLength={200} style={{ marginBottom: 6 }} /></Col>
                  <Col xs={24} md={12}><Input placeholder="Where exactly" value={f.position} onChange={(e) => setF(n, 'position', e.target.value)} maxLength={200} style={{ marginBottom: 6 }} /></Col>
                  <Col xs={24} md={12}><Select value={f.issue} onChange={(v) => setF(n, 'issue', v)} style={{ width: '100%', marginBottom: 6 }} options={(d?.issues || []).map((x) => ({ value: x.id, label: x.name }))} /></Col>
                  <Col xs={12} md={6}><InputNumber placeholder="kg" min={0} value={f.mass_kg} onChange={(v) => setF(n, 'mass_kg', v)} style={{ width: '100%', marginBottom: 6 }} /></Col>
                  <Col xs={12} md={6}><InputNumber placeholder="fall m" min={0} value={f.height_m} onChange={(v) => setF(n, 'height_m', v)} style={{ width: '100%', marginBottom: 6 }} /></Col>
                  <Col xs={12} md={8}><Select allowClear placeholder="Consequence" value={f.consequence} onChange={(v) => setF(n, 'consequence', v || null)} style={{ width: '100%' }} options={['minor', 'serious', 'fatal'].map((x) => ({ value: x, label: x }))} /></Col>
                  <Col xs={12} md={8}><Checkbox checked={f.people_below} onChange={(e) => setF(n, 'people_below', e.target.checked)}>People work or pass below</Checkbox></Col>
                  <Col xs={24} md={8}><Text type="secondary">{f.mass_kg > 0 && f.height_m > 0 ? `${(f.mass_kg * 9.81 * f.height_m).toFixed(0)} J` : ''}</Text></Col>
                </Row>
              </Card>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => setSurvey({ ...survey, findings: [...survey.findings, blankFinding()] })}>Finding</Button>
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>No findings? Remove the empty one: the survey still counts for coverage.</Paragraph>
          </>
        )}
      </Modal>
    </Card>
  );
};
