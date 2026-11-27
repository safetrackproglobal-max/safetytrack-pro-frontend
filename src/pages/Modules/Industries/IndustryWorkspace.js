// One HSE workspace for each industry, built only from real things: the company's own records and documents,
// the HSE knowledge base, working calculators and the tools that exist in the app. Nothing here is sample data.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert, Button, Card, Col, Empty, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Skeleton, Space, Statistic, Table, Tabs,
  Tag, Typography, message,
} from 'antd';
import {
  AlertOutlined, AuditOutlined, BookOutlined, CalculatorOutlined, DeleteOutlined, DeleteRowOutlined, EditOutlined, ExperimentOutlined, FileTextOutlined,
  FolderOutlined, PlusOutlined, SafetyCertificateOutlined, TeamOutlined, WarningOutlined,
} from '@ant-design/icons';
import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/api';
import DashboardOverview from '../../../components/dashboard/DashboardOverview';
import { useChemicalTabs } from './chemical/ChemicalSafety';
import ChemicalLab from './chemical/ChemicalLab';
import ChemicalWaste from './chemical/ChemicalWaste';
import ChemicalFolders from './chemical/ChemicalFolders';

const { Title, Text, Paragraph } = Typography;

export const INDUSTRIES = {
  construction: {
    name: 'Construction', color: '#fa8c16', tasks: ['height', 'excavation', 'lifting', 'vehicle', 'energy'], calcs: ['risk', 'noise'],
    intro: 'Work at height, excavations, lifting, plant and temporary works on building and civil sites.',
    standards: ['OSHA 29 CFR 1926 - Construction safety', 'CDM 2015 (UK) - Construction design and management', 'ISO 45001 - OH&S management systems'],
  },
  oil_gas: {
    name: 'Oil & Gas', color: '#d46b08', tasks: ['hotwork', 'confined', 'energy', 'pressure', 'lifting'], calcs: ['risk', 'gas', 'noise'],
    intro: 'Process safety, permits, isolation and gas testing for upstream, midstream and downstream sites.',
    standards: ['OSHA 29 CFR 1910.119 - Process Safety Management', 'API RP 754 - Process safety performance indicators', 'IOGP Life-Saving Rules', 'ISO 45001 - OH&S management systems'],
  },
  mining: {
    name: 'Mining', color: '#8c6d1f', tasks: ['vehicle', 'energy', 'excavation', 'confined', 'heat'], calcs: ['risk', 'noise', 'gas'],
    intro: 'Mobile plant, ground control, isolation, dust and noise for surface and underground mines.',
    standards: ['MSHA 30 CFR Parts 46 and 48 - Miner training', 'MSHA 30 CFR Parts 56 and 57 - Metal and non-metal mine safety', 'ICMM - Critical control management', 'ISO 45001 - OH&S management systems'],
  },
  maritime: {
    name: 'Maritime', color: '#1677ff', tasks: ['confined', 'lifting', 'hotwork', 'height'], calcs: ['risk', 'gas'],
    intro: 'Enclosed space entry, lifting, hot work and working aloft on vessels, ports and offshore units.',
    standards: ['SOLAS - Safety of Life at Sea', 'ISM Code - International Safety Management', 'MARPOL - Prevention of pollution from ships', 'STCW - Training and certification of seafarers'],
  },
  healthcare: {
    name: 'Healthcare', color: '#cf1322', tasks: ['chemical', 'general', 'machinery'], calcs: ['risk'],
    intro: 'Staff safety, sharps, hazardous drugs, manual handling and infection control in clinics and hospitals.',
    standards: ['OSHA 29 CFR 1910.1030 - Bloodborne pathogens', 'WHO - Patient safety and health worker safety', 'ISO 45001 - OH&S management systems'],
  },
  aviation: {
    name: 'Aviation', color: '#531dab', tasks: ['vehicle', 'height', 'hotwork', 'chemical'], calcs: ['risk', 'noise'],
    intro: 'Ramp, hangar, fuelling and maintenance safety under a safety management system.',
    standards: ['ICAO Annex 19 - Safety Management', 'ICAO Doc 9859 - Safety Management Manual', 'ISO 45001 - OH&S management systems'],
  },
  chemical: {
    name: 'Chemical', color: '#08979c', tasks: ['chemical', 'confined', 'hotwork', 'pressure', 'energy'], calcs: ['risk', 'gas'], chem: true,
    intro: 'Chemical register, mixing checks, lab tools, waste and documents for chemical plants, stores and labs.',
    standards: ['OSHA 29 CFR 1910.119 - Process Safety Management', 'OSHA 29 CFR 1910.1200 - Hazard Communication (GHS)', 'ISO 45001 - OH&S management systems'],
  },
  general: {
    name: 'General Industry', color: '#389e0d', tasks: ['machinery', 'energy', 'chemical', 'height', 'general'], calcs: ['risk', 'noise'],
    intro: 'Machinery, isolation, chemicals, working at height and everyday hazards for any workplace.',
    standards: ['ISO 45001 - OH&S management systems', 'OSHA 29 CFR 1910 - General industry standards'],
  },
};

const TASK_NAMES = {
  height: 'Working at height', excavation: 'Excavation or trench', confined: 'Confined space', energy: 'Isolation (electrical, machine)',
  lifting: 'Lifting and cranes', vehicle: 'Vehicles and plant', hotwork: 'Hot work', chemical: 'Chemicals', pressure: 'Pressure systems',
  machinery: 'Machinery and tools', heat: 'Heat and heavy work', general: 'Other work',
};

// ------------------------------------------------------------------ calculators (formulas shown, inputs checked)
const LEVEL = (s) => (s >= 15 ? ['Critical', 'red', 'Stop the work. Do not start until the risk is reduced.'] : s >= 10 ? ['High', 'volcano', 'Reduce the risk before work starts; senior approval needed.'] : s >= 5 ? ['Medium', 'gold', 'Reduce the risk as far as reasonably practicable.'] : ['Low', 'green', 'Keep existing controls in place.']);

const RiskCalc = () => {
  const [l, setL] = useState(3);
  const [s, setS] = useState(3);
  const score = l * s;
  const [name, color, action] = LEVEL(score);
  const opts = (labels) => labels.map((t, i) => ({ value: i + 1, label: `${i + 1} - ${t}` }));
  return (
    <div>
      <Row gutter={12}>
        <Col xs={24} sm={12}><Text>Likelihood</Text><Select style={{ width: '100%' }} value={l} onChange={setL} options={opts(['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'])} /></Col>
        <Col xs={24} sm={12}><Text>Severity</Text><Select style={{ width: '100%' }} value={s} onChange={setS} options={opts(['Minor', 'First aid', 'Lost time', 'Major / permanent', 'Fatal'])} /></Col>
      </Row>
      <Alert style={{ marginTop: 12 }} type={score >= 10 ? 'error' : score >= 5 ? 'warning' : 'success'} showIcon
        message={<span>Risk {score} of 25: <Tag color={color}>{name}</Tag></span>} description={action} />
      <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>5 x 5 matrix, risk = likelihood x severity. Use your company's own matrix if it differs.</Paragraph>
    </div>
  );
};

const NoiseCalc = () => {
  const [rows, setRows] = useState([{ db: 92, h: 4 }, { db: 85, h: 4 }]);
  const set = (i, k, v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const valid = rows.filter((r) => Number.isFinite(r.db) && Number.isFinite(r.h) && r.h > 0 && r.db >= 40 && r.db <= 140);
  const hours = valid.reduce((n, r) => n + r.h, 0);
  const dose = (crit, ex) => valid.reduce((n, r) => n + r.h / (8 / 2 ** ((r.db - crit) / ex)), 0) * 100;
  const osha = dose(90, 5);
  const niosh = dose(85, 3);
  const twa = osha > 0 ? 16.61 * Math.log10(osha / 100) + 90 : null;
  return (
    <div>
      {rows.map((r, i) => (
        <Space key={i} wrap style={{ marginBottom: 8 }}>
          <InputNumber aria-label="Level dBA" min={40} max={140} value={r.db} onChange={(v) => set(i, 'db', v)} addonAfter="dBA" />
          <InputNumber aria-label="Hours" min={0.1} max={24} step={0.5} value={r.h} onChange={(v) => set(i, 'h', v)} addonAfter="hours" />
          {rows.length > 1 && <Button type="text" onClick={() => setRows((x) => x.filter((_, j) => j !== i))}>Remove</Button>}
        </Space>
      ))}
      <div><Button size="small" icon={<PlusOutlined />} onClick={() => setRows((x) => [...x, { db: 85, h: 1 }])}>Add period</Button></div>
      {hours > 24 && <Alert type="error" showIcon style={{ marginTop: 8 }} message="More than 24 hours entered." />}
      {valid.length > 0 && hours <= 24 && (
        <Row gutter={12} style={{ marginTop: 12 }}>
          <Col xs={12}><Statistic title="OSHA dose (90 dBA, 5 dB)" value={Math.round(osha)} suffix="%" valueStyle={{ color: osha > 100 ? '#cf1322' : osha >= 50 ? '#d48806' : '#389e0d' }} /></Col>
          <Col xs={12}><Statistic title="NIOSH dose (85 dBA, 3 dB)" value={Math.round(niosh)} suffix="%" valueStyle={{ color: niosh > 100 ? '#cf1322' : '#389e0d' }} /></Col>
          <Col xs={24}><Paragraph style={{ marginTop: 8 }}>8-hour TWA (OSHA): <b>{twa === null ? '-' : twa.toFixed(1)} dBA</b>. {osha >= 50 ? 'At or above the OSHA action level (50%): hearing conservation programme needed.' : 'Below the OSHA action level.'} {niosh > 100 ? 'Above the NIOSH recommended limit: reduce exposure or use hearing protection.' : ''}</Paragraph></Col>
        </Row>
      )}
      <Paragraph type="secondary" style={{ marginBottom: 0 }}>Dose = sum of hours / allowed hours, allowed hours = 8 / 2^((level - criterion) / exchange rate). Use measured levels.</Paragraph>
    </div>
  );
};

const GAS_DEFAULT = { o2min: 19.5, o2max: 23.5, lel: 10, h2s: 5, co: 25 };
const GasCalc = () => {
  const [v, setV] = useState({ o2: 20.9, lel: 0, h2s: 0, co: 0 });
  const [lim, setLim] = useState(GAS_DEFAULT);
  const bad = [];
  if (!(v.o2 >= lim.o2min && v.o2 <= lim.o2max)) bad.push(`Oxygen ${v.o2}% is outside ${lim.o2min} - ${lim.o2max}%`);
  if (v.lel >= lim.lel) bad.push(`Flammable gas ${v.lel}% LEL is at or above ${lim.lel}%`);
  if (v.h2s >= lim.h2s) bad.push(`H2S ${v.h2s} ppm is at or above ${lim.h2s} ppm`);
  if (v.co >= lim.co) bad.push(`CO ${v.co} ppm is at or above ${lim.co} ppm`);
  const num = (k, label, unit, obj, setter) => (
    <Col xs={12}><Text>{label}</Text><InputNumber style={{ width: '100%' }} min={0} max={k.startsWith('o2') ? 100 : 100000} step={0.1} value={obj[k]} onChange={(x) => setter((o) => ({ ...o, [k]: x ?? 0 }))} addonAfter={unit} /></Col>
  );
  return (
    <div>
      <Text strong>Readings</Text>
      <Row gutter={[12, 8]}>{num('o2', 'Oxygen', '%', v, setV)}{num('lel', 'Flammable', '% LEL', v, setV)}{num('h2s', 'H2S', 'ppm', v, setV)}{num('co', 'CO', 'ppm', v, setV)}</Row>
      <Alert style={{ marginTop: 12 }} type={bad.length ? 'error' : 'success'} showIcon message={bad.length ? 'Do not enter' : 'Readings are within the limits below'}
        description={bad.length ? bad.map((b) => <div key={b}>{b}</div>) : 'Keep monitoring while people are inside. Re-test after any break.'} />
      <details style={{ marginTop: 8 }}>
        <summary>Limits used (change them to your permit's limits)</summary>
        <Row gutter={[12, 8]} style={{ marginTop: 8 }}>{num('o2min', 'O2 min', '%', lim, setLim)}{num('o2max', 'O2 max', '%', lim, setLim)}{num('lel', 'LEL max', '%', lim, setLim)}{num('h2s', 'H2S max', 'ppm', lim, setLim)}{num('co', 'CO max', 'ppm', lim, setLim)}</Row>
      </details>
      <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>Defaults: oxygen 19.5 - 23.5% and flammable gas below 10% LEL (OSHA 1910.146); H2S 5 ppm and CO 25 ppm (ACGIH short-term and 8-hour values). Your permit and local law decide.</Paragraph>
    </div>
  );
};

// ------------------------------------------------------------------ page
const IndustryWorkspace = ({ industryId }) => {
  const history = useHistory();
  const location = useLocation();
  const cfg = INDUSTRIES[industryId] || INDUSTRIES.general;
  const key = INDUSTRIES[industryId] ? industryId : 'general';
  const chem = useChemicalTabs(!!cfg.chem);
  const tabParam = new URLSearchParams(location.search).get('tab') || 'overview';
  const setTab = (k) => history.replace({ pathname: location.pathname, search: k === 'overview' ? '' : `?tab=${k}` });
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    try {
      const r = (await apiGet(`/hse/workspace/${key}`)).data || {};
      setD({ ...r, hazards: r.hazards || [], regulations: r.regulations || [], documents: r.documents || [], documents_total: r.documents_total || 0 });
      setErr('');
    } catch (e) { setErr(e?.data?.error || 'Could not load this workspace'); }
  }, [key]);
  useEffect(() => { setD(null); load(); }, [load]);
  const calcs = useMemo(() => cfg.calcs.map((c) => ({
    key: c,
    label: { risk: 'Risk matrix', noise: 'Noise dose', gas: 'Gas test check' }[c],
    children: { risk: <RiskCalc />, noise: <NoiseCalc />, gas: <GasCalc /> }[c],
  })), [cfg]);
  const go = (to) => history.push(to);
  const LINKS = [
    { icon: <SafetyCertificateOutlined />, title: 'Ready Check', text: 'Check life-saving controls before a job', to: '/ready-check' },
    { icon: <WarningOutlined />, title: 'Report an incident', text: 'Incidents and near misses', to: '/incidents' },
    { icon: <AuditOutlined />, title: 'Risk assessment', text: 'Create and review risk assessments', to: '/risk-assessment' },
    { icon: <FileTextOutlined />, title: 'Permits to work', text: 'Issue and track permits', to: '/document-management?tab=ptw' },
    { icon: <BookOutlined />, title: 'Toolbox talks', text: "Today's talk from your own records", to: '/toolbox-talks' },
    { icon: <AlertOutlined />, title: 'Roll call', text: 'Evacuation roll call and drills', to: '/roll-call' },
    { icon: <TeamOutlined />, title: 'Contractors', text: 'Approval, documents and gate check', to: '/contractors' },
    { icon: <ExperimentOutlined />, title: 'AI documents', text: `Generate ${cfg.name} procedures and plans`, to: '/ai-documents' },
  ];
  return (
    <div style={{ padding: 16, maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ borderLeft: `6px solid ${cfg.color}`, paddingLeft: 12, marginBottom: 12 }}>
        <Title level={2} style={{ margin: 0 }}>{cfg.name} HSE</Title>
        <Text type="secondary">{cfg.intro}</Text>
      </div>
      {err && <Alert type="error" showIcon message={err} action={<Button onClick={load}>Try again</Button>} style={{ marginBottom: 12 }} />}
      {(() => {
        const T = {
          overview: { key: 'overview', label: 'Overview', children: (
          <div>
            <DashboardOverview title={`${cfg.name}: company safety status`} />
            {d?.ready_check && (
              <Card size="small" title="Ready Check, last 30 days" style={{ marginBottom: 16, borderRadius: 12 }} extra={<Button type="link" onClick={() => go('/ready-check?tab=board')}>Board</Button>}>
                <Row gutter={12}>
                  <Col xs={12} md={6}><Statistic title="Checks" value={d.ready_check.checks} /></Col>
                  <Col xs={12} md={6}><Statistic title="Work stopped" value={d.ready_check.stops} /></Col>
                  <Col xs={12} md={6}><Statistic title="Stopped now" value={d.ready_check.stopped_now} valueStyle={{ color: d.ready_check.stopped_now ? '#cf1322' : undefined }} /></Col>
                  <Col xs={12} md={6}><Statistic title="Controls in place" value={d.ready_check.score ?? 'No data'} suffix={d.ready_check.score == null ? '' : '%'} /></Col>
                </Row>
              </Card>
            )}
            <Row gutter={[12, 12]}>
              {LINKS.map((l) => (
                <Col xs={24} sm={12} lg={6} key={l.to}>
                  <Card hoverable size="small" style={{ borderRadius: 12, height: '100%' }} onClick={() => go(l.to)}>
                    <Space align="start"><span style={{ fontSize: 22, color: cfg.color }}>{l.icon}</span><div><Text strong>{l.title}</Text><div><Text type="secondary">{l.text}</Text></div></div></Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) },
          hazards: { key: 'hazards', label: 'Hazards and controls', children: (
          <div>
            <Card size="small" title="Before high-risk work" style={{ marginBottom: 16, borderRadius: 12 }}>
              <Space wrap>{cfg.tasks.map((t) => <Button key={t} onClick={() => go(`/ready-check?task=${t}`)}>{TASK_NAMES[t]}</Button>)}</Space>
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>Opens Ready Check for that job: one missing life-saving control means stop.</Paragraph>
            </Card>
            {!d && !err && <Skeleton active />}
            {d && d.hazards.length === 0 && <Empty description="No hazards in the knowledge base for this industry yet" />}
            {d && d.hazards.map((h) => (
              <Card key={h.id} size="small" style={{ marginBottom: 8, borderRadius: 12 }} title={<Space wrap><Text strong>{h.name}</Text><Tag>{h.category}</Tag><Tag color={h.severity >= 5 ? 'red' : h.severity >= 4 ? 'volcano' : 'gold'}>Severity {h.severity}/5</Tag></Space>}>
                <Paragraph style={{ marginBottom: 6 }}>{h.description}</Paragraph>
                {h.risks.length > 0 && <ul style={{ margin: 0, paddingLeft: 18 }}>{h.risks.map((r) => <li key={r}>{r}</li>)}</ul>}
                {h.controls.length > 0 && <div style={{ marginTop: 8 }}><Text strong>Controls</Text>{h.controls.map((c) => <div key={c.description}><Tag>{c.type}</Tag>{c.description}{c.verification ? <Text type="secondary"> (check: {c.verification})</Text> : null}</div>)}</div>}
              </Card>
            ))}
            <Card size="small" title="Standards to know" style={{ marginTop: 16, borderRadius: 12 }}>
              <ul style={{ margin: 0, paddingLeft: 18 }}>{cfg.standards.map((s) => <li key={s}>{s}</li>)}</ul>
              {d && d.regulations.length > 0 && (
                <div style={{ marginTop: 8 }}>{d.regulations.map((r) => <div key={r.reference}><Text strong>{r.reference}</Text> {r.title} <Text type="secondary">({r.jurisdiction})</Text></div>)}</div>
              )}
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>Reference list only. Check which laws apply in your country.</Paragraph>
            </Card>
          </div>
        ) },
          tools: { key: 'tools', label: <span><CalculatorOutlined /> Calculators</span>, children: (
          <Row gutter={[16, 16]}>
            {calcs.map((c) => <Col xs={24} lg={12} key={c.key}><Card title={c.label} style={{ borderRadius: 12, height: '100%' }}>{c.children}</Card></Col>)}
          </Row>
        ) },
          documents: { key: 'documents', label: 'Documents', children: (
          <div>
            <Space wrap style={{ marginBottom: 12 }}>
              <Button type="primary" icon={<ExperimentOutlined />} onClick={() => go('/ai-documents')}>Generate a document with AI</Button>
              <Button icon={<FileTextOutlined />} onClick={() => go('/document-management')}>Open Document Management</Button>
            </Space>
            {!d && !err && <Skeleton active />}
            {d && (d.documents.length ? (
              <Table rowKey="id" size="small" pagination={false} scroll={{ x: 520 }} dataSource={d.documents} onRow={(r) => ({ onClick: () => go(`/document-management?tab=documents&doc=${r.id}`), style: { cursor: 'pointer' } })} columns={[
                { title: 'Title', dataIndex: 'title' }, { title: 'Type', dataIndex: 'type' }, { title: 'Status', dataIndex: 'status', render: (s) => <Tag>{s}</Tag> },
                { title: 'Updated', dataIndex: 'updated_at', render: (u) => (u ? new Date(u).toLocaleDateString() : '') },
              ]} />
            ) : <Empty description={`No ${cfg.name} documents yet. Documents saved in Document Management under the ${cfg.name} module appear here.`} />)}
            {d && d.documents_total > d.documents.length && <Paragraph type="secondary" style={{ marginTop: 8 }}>Showing the latest {d.documents.length} of {d.documents_total}.</Paragraph>}
          </div>
        ) },
        };
        const docs = cfg.chem ? { ...T.documents, label: <span><FolderOutlined /> Documents</span>, children: <ChemicalFolders /> } : T.documents;
        const items = cfg.chem ? [
          T.overview, ...chem.tabs,
          { key: 'lab', label: <span><ExperimentOutlined /> Chemical lab</span>, children: <ChemicalLab /> },
          { key: 'waste', label: <span><DeleteRowOutlined /> Waste</span>, children: <ChemicalWaste register={chem.ctx?.data?.items} groups={chem.ctx?.groups} /> },
          docs, T.hazards, T.tools,
          { key: 'rules', label: <span><BookOutlined /> Rules by country</span>, children: chem.rules },
        ] : [T.overview, T.hazards, T.tools, T.documents];
        const active = items.some((t) => t.key === tabParam) ? tabParam : 'overview';
        return <Tabs activeKey={active} onChange={setTab} items={items} />;
      })()}
      {chem.drawer}
    </div>
  );
};

export default IndustryWorkspace;
