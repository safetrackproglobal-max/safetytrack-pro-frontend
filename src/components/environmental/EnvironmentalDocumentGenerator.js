// src/components/environmental/EnvironmentalDocumentGenerator.js
// Real environmental documents: ISO 14001 performance report, safety inspection report and
// environmental impact assessment. Built from what you enter plus your company's monitoring data
// (air, water, incidents, goals). Statuses and conclusions are calculated — nothing is invented.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card, Form, Input, InputNumber, Select, Radio, Button, Space, DatePicker, Switch, Table, Tag, Alert, List, Typography,
  Tooltip, Row, Col, Divider, message, Empty, Segmented, Spin, Descriptions,
} from 'antd';
import {
  FilePdfOutlined, FileExcelOutlined, FileWordOutlined, DownloadOutlined, PlusOutlined, DeleteOutlined, AimOutlined,
  SafetyCertificateOutlined, EnvironmentOutlined, FileTextOutlined, ReloadOutlined, FolderOpenOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export const ENV_DOC_KINDS = {
  iso14001: { label: 'ISO 14001 report', title: 'Environmental performance & ISO 14001 report', icon: <EnvironmentOutlined /> },
  safety: { label: 'Safety inspection', title: 'Workplace safety inspection report', icon: <SafetyCertificateOutlined /> },
  eia: { label: 'Impact assessment', title: 'Environmental impact assessment', icon: <FileTextOutlined /> },
};

const PERFORMANCE = [
  ['carbon_emissions', 'Carbon emissions', 'tCO2e'],
  ['energy_consumption', 'Energy consumption', 'kWh'],
  ['water_usage', 'Water usage', 'm³'],
  ['waste_generated', 'Waste generated', 'kg'],
  ['waste_recycled', 'Waste recycled / diverted', '%'],
];
const CLAUSES = [
  ['4', 'Context of the organization'], ['5', 'Leadership & environmental policy'], ['6', 'Planning (aspects, obligations, objectives)'],
  ['7', 'Support (resources, competence, documents)'], ['8', 'Operation & emergency preparedness'],
  ['9', 'Performance evaluation (monitoring, audit, review)'], ['10', 'Improvement & corrective action'],
];
const CLAUSE_STATUS = [
  { value: 'not_assessed', label: 'Not assessed' }, { value: 'implemented', label: 'Implemented' },
  { value: 'partial', label: 'Partially implemented' }, { value: 'not_implemented', label: 'Not implemented' },
];
const SAFETY_STATUS = [
  { value: 'not_inspected', label: 'Not inspected' }, { value: 'compliant', label: 'Compliant' },
  { value: 'minor', label: 'Minor issue' }, { value: 'major', label: 'Major issue' },
  { value: 'critical', label: 'Critical — stop work' }, { value: 'na', label: 'Not applicable' },
];
const SAFETY_AREAS = [
  'Personal protective equipment (PPE)', 'Emergency exits, routes and signage', 'Fire protection & extinguishers',
  'Chemical storage, labelling and SDS', 'Machine guarding & lockout/tagout', 'Electrical safety',
  'Working at height (ladders, scaffolds, edges)', 'Housekeeping, walkways and slips/trips',
  'First aid & welfare facilities', 'Training records and toolbox talks',
];
const STANDARDS = [
  'OSHA 29 CFR 1910 (General Industry)', 'OSHA 29 CFR 1926 (Construction)', 'ISO 45001:2018',
  'Ghana Factories, Offices and Shops Act, 1970 (Act 328)', 'Ghana Labour Act, 2003 (Act 651)', 'Company HSE standard',
];
const EIA_AREAS = ['Air quality', 'Noise & vibration', 'Surface & ground water', 'Soil & land', 'Biodiversity & habitats',
  'Waste generation', 'Traffic & transport', 'Community & socio-economic', 'Cultural heritage', 'Climate (greenhouse gases)'];
const LEVELS = {
  magnitude: ['negligible', 'low', 'medium', 'high'],
  duration: ['short', 'medium', 'long', 'permanent'],
  extent: ['site', 'local', 'regional', 'national'],
  likelihood: ['unlikely', 'possible', 'likely', 'certain'],
};
const FORMATS = [
  { value: 'pdf', label: <span><FilePdfOutlined /> PDF</span> },
  { value: 'word', label: <span><FileWordOutlined /> Word</span> },
  { value: 'excel', label: <span><FileExcelOutlined /> Excel</span> },
];

// same significance matrix as the server (env_documents.eia_significance)
export const eiaSignificance = (it) => {
  const m = LEVELS.magnitude.indexOf(it.magnitude);
  if (m <= 0) return m === 0 ? ['Negligible', 0] : ['Minor', 0];
  const d = Math.max(0, LEVELS.duration.indexOf(it.duration));
  const e = Math.max(0, LEVELS.extent.indexOf(it.extent));
  const l = Math.max(0, LEVELS.likelihood.indexOf(it.likelihood));
  const score = Math.round(((m * 2 + d + e) * (1 + l) / 3) * 10) / 10;
  return [score >= 9 ? 'Major' : score >= 5 ? 'Moderate' : 'Minor', score];
};
const SIG_COLOR = { Major: 'red', Moderate: 'orange', Minor: 'green', Negligible: 'default' };

const errorText = async (err, fallback) => {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try { return JSON.parse(await data.text()).error || fallback; } catch (e) { return fallback; }
  }
  return data?.error || data?.message || err?.message || fallback;
};

export const downloadGeneratedDocument = async (doc) => {
  const url = String(doc.download_url || '').replace(/^\/api(?=\/)/, '');
  try {
    const res = await api.get(url, { responseType: 'blob' });
    const href = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = href;
    a.download = doc.filename || doc.name || 'document';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(href), 2000);
  } catch (err) {
    message.error(await errorText(err, 'Download failed'));
  }
};

const newRow = (extra) => ({ key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...extra });

export default function EnvironmentalDocumentGenerator({ kinds = ['iso14001', 'safety', 'eia'], onGenerated, compact = false }) {
  const [kind, setKind] = useState(kinds[0]);
  const [form] = Form.useForm();
  const [period, setPeriod] = useState([dayjs().subtract(90, 'day').startOf('day'), dayjs().endOf('day')]);
  const [live, setLive] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState([]);
  const [items, setItems] = useState(() => SAFETY_AREAS.map((area) => newRow({ area, status: 'not_inspected' })));
  const [impacts, setImpacts] = useState(() => EIA_AREAS.slice(0, 6).map((area) => newRow({ area, nature: 'negative', magnitude: 'low', duration: 'medium', extent: 'local', likelihood: 'likely' })));
  const [locating, setLocating] = useState(false);

  const loadLive = useCallback(async () => {
    setLiveLoading(true);
    try {
      const res = await api.get('/environmental/report-data', {
        params: { start_date: period[0].toISOString(), end_date: period[1].toISOString() },
      });
      const data = res.data?.data || null;
      setLive(data);
      if (data) {
        const cur = form.getFieldsValue(['company_name', 'report_period']);
        form.setFieldsValue({
          company_name: cur.company_name || data.company_name || undefined,
          report_period: cur.report_period || data.period_label,
        });
      }
    } catch (err) {
      setLive(null);
      message.warning(await errorText(err, 'Could not load your monitoring data — the report will only use what you enter'));
    } finally {
      setLiveLoading(false);
    }
  }, [period, form]);

  useEffect(() => { loadLive(); }, [loadLive]);

  const setItem = (key, patch) => setItems((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const setImpact = (key, patch) => setImpacts((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const useMyLocation = () => {
    if (!navigator.geolocation) { message.error('Your browser cannot share its location'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((p) => {
      form.setFieldsValue({ latitude: Number(p.coords.latitude.toFixed(6)), longitude: Number(p.coords.longitude.toFixed(6)) });
      setLocating(false);
    }, () => {
      setLocating(false);
      message.warning('Location not available — enter the coordinates or leave them empty');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  };

  const buildInputs = (v) => {
    const common = {
      company_name: v.company_name, prepared_by: v.prepared_by, include_monitoring_data: v.include_monitoring_data !== false,
      period_start: period[0].toISOString(), period_end: period[1].toISOString(),
    };
    if (kind === 'iso14001') {
      return {
        ...common, report_period: v.report_period, site: v.site, summary_notes: v.summary_notes,
        environmental_performance: Object.fromEntries(PERFORMANCE.map(([k]) => [k, v[`perf_${k}`]])),
        targets: Object.fromEntries(PERFORMANCE.map(([k]) => [k, v[`target_${k}`]])),
        clauses: Object.fromEntries(CLAUSES.map(([n]) => [n, { status: v[`clause_${n}`], evidence: v[`evidence_${n}`] }])),
      };
    }
    if (kind === 'safety') {
      return {
        ...common, facility: v.facility, inspector: v.inspector, standard: v.standard, notes: v.notes,
        inspection_date: v.inspection_date ? v.inspection_date.toISOString() : null,
        safety_metrics: { incidents: v.incidents, near_misses: v.near_misses, safety_training: v.safety_training,
          ppe_compliance: v.ppe_compliance, hours_worked: v.hours_worked },
        items: items.filter((r) => (r.area || '').trim()).map(({ key, due_date: due, ...r }) => ({ ...r, due_date: due ? due.toISOString() : null })),
      };
    }
    return {
      ...common, project_name: v.project_name, location: v.location, latitude: v.latitude, longitude: v.longitude,
      assessor: v.assessor, framework: v.framework, description: v.description,
      assessment_date: v.assessment_date ? v.assessment_date.toISOString() : null,
      impacts: impacts.filter((r) => (r.area || '').trim()).map(({ key, ...r }) => r),
    };
  };

  const generate = async () => {
    let values;
    try { values = await form.validateFields(); } catch (e) { return; }
    setBusy(true);
    try {
      const res = await api.post('/environmental/documents/generate', {
        kind, format: values.format || 'pdf', save_to_documents: !!values.save_to_documents, inputs: buildInputs(values),
      });
      const doc = res.data?.document;
      if (!res.data?.success || !doc) throw new Error(res.data?.error || 'The report could not be generated');
      setDocs((prev) => [{ ...doc, id: `${doc.filename}` }, ...prev]);
      onGenerated?.(doc);
      message.success(`${ENV_DOC_KINDS[kind].title} generated — ${doc.conclusion}`);
      if (doc.save_error) message.warning(doc.save_error);
      downloadGeneratedDocument(doc);
    } catch (err) {
      message.error(await errorText(err, 'The report could not be generated'), 6);
    } finally {
      setBusy(false);
    }
  };

  const liveSummary = useMemo(() => {
    if (!live) return null;
    const air = live.air || {};
    const water = live.water || {};
    const inc = live.incidents || {};
    return [
      ['Air sensors / readings', `${air.sensors ?? 0} / ${air.readings ?? 0}`],
      ['Air readings within WHO guideline', air.compliance_pct != null ? `${air.compliance_pct}%` : 'No readings'],
      ['Water samples (compliant)', water.samples ? `${water.samples} (${water.compliance_pct ?? '—'}%)` : 'No samples'],
      ['Environmental incidents (open)', `${inc.total ?? 0} (${inc.open ?? 0})`],
      ['Sustainability goals', String((live.goals || []).length)],
    ];
  }, [live]);

  const statusSelect = (value, onChange, options, width = 170) => (
    <Select size="small" value={value} onChange={onChange} options={options} style={{ width }} />
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={compact ? 24 : 16}>
        <Card size="small" title={<Space><FileTextOutlined /> Generate an environmental document</Space>}>
          {kinds.length > 1 && (
            <Segmented
              block
              value={kind}
              onChange={setKind}
              options={kinds.map((k) => ({ value: k, label: <span>{ENV_DOC_KINDS[k].icon} {ENV_DOC_KINDS[k].label}</span> }))}
              style={{ marginBottom: 16 }}
            />
          )}
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="Leave a field empty if you do not know it — the report shows “Not provided” instead of guessing. Statuses and the overall conclusion are calculated from your figures and records."
          />
          <Form form={form} layout="vertical" initialValues={{
            format: 'pdf', save_to_documents: true, include_monitoring_data: true,
            ...Object.fromEntries(CLAUSES.map(([n]) => [`clause_${n}`, 'not_assessed'])),
            inspection_date: dayjs(), assessment_date: dayjs(), standard: STANDARDS[0],
          }}>
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item name="company_name" label="Organisation" tooltip="Filled from your company profile">
                  <Input placeholder="Company name" maxLength={200} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Monitoring data period" tooltip="Air, water, incident and goal data from this period are added to the report">
                  <RangePicker
                    value={period}
                    allowClear={false}
                    style={{ width: '100%' }}
                    onChange={(v) => v && v[0] && v[1] && setPeriod([v[0].startOf('day'), v[1].endOf('day')])}
                    disabledDate={(d) => d && d.isAfter(dayjs().endOf('day'))}
                  />
                </Form.Item>
              </Col>
            </Row>

            {kind === 'iso14001' && (
              <>
                <Row gutter={12}>
                  <Col xs={24} md={8}><Form.Item name="report_period" label="Reporting period label"><Input placeholder="e.g. Q3 2026" maxLength={80} /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="site" label="Site / scope"><Input placeholder="All sites" maxLength={200} /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="prepared_by" label="Prepared by"><Input placeholder="Name and role" maxLength={120} /></Form.Item></Col>
                </Row>
                <Divider orientation="left" plain>Performance figures and targets</Divider>
                <Table
                  size="small"
                  pagination={false}
                  rowKey={(r) => r[0]}
                  dataSource={PERFORMANCE}
                  columns={[
                    { title: 'Parameter', render: (_, r) => <span>{r[1]} <Text type="secondary">({r[2]})</Text></span> },
                    { title: 'Value this period', width: 170, render: (_, r) => <Form.Item name={`perf_${r[0]}`} noStyle><InputNumber min={0} style={{ width: '100%' }} placeholder="Not provided" /></Form.Item> },
                    { title: 'Target', width: 170, render: (_, r) => <Form.Item name={`target_${r[0]}`} noStyle><InputNumber min={0} style={{ width: '100%' }} placeholder={r[0] === 'waste_recycled' ? 'minimum' : 'maximum'} /></Form.Item> },
                  ]}
                  scroll={{ x: 520 }}
                />
                <Divider orientation="left" plain>ISO 14001:2015 clause review</Divider>
                {CLAUSES.map(([n, title]) => (
                  <Row gutter={8} key={n} align="middle" style={{ marginBottom: 6 }}>
                    <Col xs={24} md={9}><Text>{n}. {title}</Text></Col>
                    <Col xs={10} md={6}><Form.Item name={`clause_${n}`} noStyle><Select size="small" options={CLAUSE_STATUS} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col xs={14} md={9}><Form.Item name={`evidence_${n}`} noStyle><Input size="small" placeholder="Evidence (e.g. EMS manual v3)" maxLength={300} /></Form.Item></Col>
                  </Row>
                ))}
                <Form.Item name="summary_notes" label="Additional notes for the executive summary" style={{ marginTop: 12 }}>
                  <TextArea rows={3} maxLength={3000} showCount />
                </Form.Item>
              </>
            )}

            {kind === 'safety' && (
              <>
                <Row gutter={12}>
                  <Col xs={24} md={8}><Form.Item name="facility" label="Facility / site" rules={[{ required: true, message: 'Enter the facility' }]}><Input maxLength={200} /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="inspector" label="Inspector" rules={[{ required: true, message: 'Enter the inspector' }]}><Input maxLength={120} /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="inspection_date" label="Inspection date"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                </Row>
                <Form.Item name="standard" label="Standard / regulation">
                  <Select options={STANDARDS.map((v) => ({ value: v, label: v }))} showSearch />
                </Form.Item>
                <Divider orientation="left" plain>Inspection checklist</Divider>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="key"
                  dataSource={items}
                  scroll={{ x: 900 }}
                  columns={[
                    { title: 'Area', width: 220, render: (_, r) => <Input size="small" value={r.area} onChange={(e) => setItem(r.key, { area: e.target.value })} /> },
                    { title: 'Status', width: 170, render: (_, r) => statusSelect(r.status, (v) => setItem(r.key, { status: v }), SAFETY_STATUS) },
                    { title: 'Finding', render: (_, r) => <Input size="small" value={r.finding} onChange={(e) => setItem(r.key, { finding: e.target.value })} placeholder="What was observed" /> },
                    { title: 'Corrective action', render: (_, r) => <Input size="small" value={r.action} onChange={(e) => setItem(r.key, { action: e.target.value })} /> },
                    { title: 'Responsible', width: 130, render: (_, r) => <Input size="small" value={r.responsible} onChange={(e) => setItem(r.key, { responsible: e.target.value })} /> },
                    { title: 'Due', width: 130, render: (_, r) => <DatePicker size="small" value={r.due_date} onChange={(d) => setItem(r.key, { due_date: d })} /> },
                    { title: '', width: 40, render: (_, r) => <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => setItems((rows) => rows.filter((x) => x.key !== r.key))} /> },
                  ]}
                />
                <Button size="small" icon={<PlusOutlined />} style={{ marginTop: 8 }} onClick={() => setItems((rows) => [...rows, newRow({ area: '', status: 'not_inspected' })])}>Add area</Button>
                <Divider orientation="left" plain>Safety indicators (optional)</Divider>
                <Row gutter={12}>
                  {[['incidents', 'Recordable incidents'], ['near_misses', 'Near misses'], ['hours_worked', 'Hours worked']].map(([k, l]) => (
                    <Col xs={12} md={8} key={k}><Form.Item name={k} label={l}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                  ))}
                  {[['safety_training', 'Training up to date (%)'], ['ppe_compliance', 'PPE compliance (%)']].map(([k, l]) => (
                    <Col xs={12} md={8} key={k}><Form.Item name={k} label={l}><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
                  ))}
                </Row>
                <Form.Item name="notes" label="Inspector notes"><TextArea rows={3} maxLength={3000} showCount /></Form.Item>
              </>
            )}

            {kind === 'eia' && (
              <>
                <Row gutter={12}>
                  <Col xs={24} md={12}><Form.Item name="project_name" label="Project" rules={[{ required: true, message: 'Enter the project name' }]}><Input maxLength={200} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="assessor" label="Lead assessor"><Input maxLength={120} /></Form.Item></Col>
                </Row>
                <Row gutter={12} align="bottom">
                  <Col xs={24} md={10}><Form.Item name="location" label="Project location"><Input maxLength={300} placeholder="Address / area" /></Form.Item></Col>
                  <Col xs={12} md={5}><Form.Item name="latitude" label="Latitude" rules={[{ type: 'number', min: -90, max: 90, message: '−90 to 90' }]}><InputNumber style={{ width: '100%' }} step={0.0001} /></Form.Item></Col>
                  <Col xs={12} md={5}><Form.Item name="longitude" label="Longitude" rules={[{ type: 'number', min: -180, max: 180, message: '−180 to 180' }]}><InputNumber style={{ width: '100%' }} step={0.0001} /></Form.Item></Col>
                  <Col xs={24} md={4}><Form.Item><Button block icon={<AimOutlined />} loading={locating} onClick={useMyLocation}>Here</Button></Form.Item></Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} md={12}><Form.Item name="assessment_date" label="Assessment date"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="framework" label="Framework / regulation"><Input placeholder="e.g. EPA Ghana LI 1652 / IFC Performance Standards" maxLength={160} /></Form.Item></Col>
                </Row>
                <Form.Item name="description" label="Project description"><TextArea rows={3} maxLength={5000} showCount /></Form.Item>
                <Divider orientation="left" plain>Impacts (significance is calculated)</Divider>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="key"
                  dataSource={impacts}
                  scroll={{ x: 1150 }}
                  columns={[
                    { title: 'Receptor / aspect', width: 190, render: (_, r) => (
                      <Select size="small" value={r.area} onChange={(v) => setImpact(r.key, { area: v })} style={{ width: '100%' }}
                        showSearch options={EIA_AREAS.map((a) => ({ value: a, label: a }))} />
                    ) },
                    { title: 'Nature', width: 105, render: (_, r) => statusSelect(r.nature, (v) => setImpact(r.key, { nature: v }), [{ value: 'negative', label: 'Negative' }, { value: 'positive', label: 'Positive' }], 95) },
                    ...['magnitude', 'duration', 'extent', 'likelihood'].map((k) => ({
                      title: k[0].toUpperCase() + k.slice(1), width: 115,
                      render: (_, r) => statusSelect(r[k], (v) => setImpact(r.key, { [k]: v }), LEVELS[k].map((x) => ({ value: x, label: x[0].toUpperCase() + x.slice(1) })), 105),
                    })),
                    { title: 'Significance', width: 120, render: (_, r) => { const [sig, sc] = eiaSignificance(r); return <Tag color={SIG_COLOR[sig]}>{sig} ({sc})</Tag>; } },
                    { title: 'Mitigation', width: 200, render: (_, r) => <Input size="small" value={r.mitigation} onChange={(e) => setImpact(r.key, { mitigation: e.target.value })} /> },
                    { title: '', width: 40, render: (_, r) => <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => setImpacts((rows) => rows.filter((x) => x.key !== r.key))} /> },
                  ]}
                />
                <Button size="small" icon={<PlusOutlined />} style={{ marginTop: 8 }}
                  onClick={() => setImpacts((rows) => [...rows, newRow({ area: EIA_AREAS[rows.length % EIA_AREAS.length], nature: 'negative', magnitude: 'low', duration: 'medium', extent: 'local', likelihood: 'likely' })])}>
                  Add impact
                </Button>
              </>
            )}

            <Divider />
            <Row gutter={12} align="middle">
              <Col xs={24} md={10}><Form.Item name="format" label="Format"><Radio.Group options={FORMATS} optionType="button" /></Form.Item></Col>
              <Col xs={12} md={7}>
                <Form.Item name="save_to_documents" label="Save to Document Management" valuePropName="checked"
                  tooltip="Keeps a copy you can review, sign and share through document control (PDF view)">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={12} md={7}>
                <Form.Item name="include_monitoring_data" label="Include monitoring data" valuePropName="checked"><Switch /></Form.Item>
              </Col>
            </Row>
            <Button type="primary" size="large" block loading={busy} icon={<FileTextOutlined />} onClick={generate}>
              Generate {ENV_DOC_KINDS[kind].title}
            </Button>
          </Form>
        </Card>
      </Col>

      <Col xs={24} xl={compact ? 24 : 8}>
        <Card size="small" title={<Space><InfoCircleOutlined /> From your records</Space>}
          extra={<Tooltip title="Reload"><Button size="small" icon={<ReloadOutlined />} onClick={loadLive} /></Tooltip>}>
          {liveLoading ? <div style={{ textAlign: 'center', padding: 16 }}><Spin /></div>
            : liveSummary ? (
              <Descriptions size="small" column={1} items={liveSummary.map(([k, v]) => ({ key: k, label: k, children: v }))} />
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No monitoring data loaded" />}
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>
            These figures are added to the report automatically for {period[0].format('D MMM YYYY')} – {period[1].format('D MMM YYYY')}.
          </Paragraph>
        </Card>

        <Card size="small" title="Generated this session" style={{ marginTop: 16 }}>
          {docs.length ? (
            <List
              size="small"
              dataSource={docs}
              renderItem={(d) => (
                <List.Item actions={[
                  <Button key="dl" size="small" type="link" icon={<DownloadOutlined />} onClick={() => downloadGeneratedDocument(d)}>Download</Button>,
                  d.document_id ? <Button key="dm" size="small" type="link" icon={<FolderOpenOutlined />} href="/document-management">Open</Button> : null,
                ].filter(Boolean)}>
                  <List.Item.Meta
                    title={<Space wrap size={4}><span>{d.title}</span><Tag>{d.format}</Tag></Space>}
                    description={<Space wrap size={4}>
                      <Tag color={/ACTION|MAJOR|CRITICAL|SIGNIFICANT/.test(d.conclusion) ? 'red' : /MINOR ISSUES|MODERATE/.test(d.conclusion) ? 'orange' : /NOT|INSUFFICIENT/.test(d.conclusion) ? 'default' : 'green'}>{d.conclusion}</Tag>
                      {d.saved_to_documents && <Tag color="blue">In Document Management</Tag>}
                    </Space>}
                  />
                </List.Item>
              )}
            />
          ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Documents you generate appear here" />}
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>
            Download links are private to your company. Save to Document Management to keep a permanent copy.
          </Paragraph>
        </Card>
      </Col>
    </Row>
  );
}
