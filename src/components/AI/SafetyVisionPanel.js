// Photo / video hazard check with the SafeTrack 43-class model. Shows what is WRONG or MISSING (boxes only on hazards),
// each with a risk rating, what to do and the standard; PDF report; mark findings right / wrong for the next training.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Checkbox, Col, Empty, Image, Input, List, Row, Select, Space, Spin, Tag, Typography, Upload, message } from 'antd';
import { CameraOutlined, CheckOutlined, CloseOutlined, FilePdfOutlined, UploadOutlined } from '@ant-design/icons';
import api, { apiGet, apiPut } from '../../services/api';

const { Text, Paragraph } = Typography;
const RISK = { critical: 'red', high: 'volcano', medium: 'orange', low: 'gold', none: 'green' };
const PPE = [['hardhat', 'Hard hat'], ['vest', 'Hi-vis vest'], ['goggles', 'Eye protection'], ['gloves', 'Gloves'], ['mask', 'Mask / respirator']];
const SITE_PPE = { construction: ['hardhat', 'vest'], industrial: ['hardhat', 'vest', 'goggles'], warehouse: ['vest'], lab: ['goggles', 'gloves'], healthcare: ['mask', 'gloves'], office: [] };
const err = (e) => e?.response?.data?.error || e?.data?.error || e?.message || 'Something went wrong';

const ReportImage = ({ rid, n }) => {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let url;
    api.get(`/safety-vision/reports/${rid}/image/${n}`, { responseType: 'blob' }).then((r) => { url = URL.createObjectURL(r.data); setSrc(url); }).catch(() => {});
    return () => url && URL.revokeObjectURL(url);
  }, [rid, n]);
  return src ? <Image src={src} alt={`Checked picture ${n + 1}`} style={{ borderRadius: 8, maxHeight: 520, objectFit: 'contain' }} /> : <Spin />;
};

const SafetyVisionPanel = () => {
  const [site, setSite] = useState('construction');
  const [ppe, setPpe] = useState(SITE_PPE.construction);
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [rep, setRep] = useState(null);
  const [history, setHistory] = useState([]);
  const [model, setModel] = useState(null);
  const loadHistory = useCallback(() => apiGet('/safety-vision/reports').then((r) => setHistory(r.data || [])).catch(() => {}), []);
  useEffect(() => { loadHistory(); apiGet('/safety-vision/model').then((r) => setModel(r.data)).catch(() => setModel({ installed: false })); }, [loadHistory]);
  const analyse = async (file) => {
    const f = new FormData();
    f.append('file', file); f.append('site_type', site); f.append('required_ppe', JSON.stringify(ppe)); if (location) f.append('location', location);
    setBusy(true); setRep(null);
    try {
      const r = (await api.post('/safety-vision/analyze', f, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000 })).data;
      setRep(r.data); loadHistory();
    } catch (e) { message.error(err(e)); } finally { setBusy(false); }
    return false;
  };
  const pdf = async () => {
    const b = (await api.get(`/safety-vision/reports/${rep.id}/pdf`, { responseType: 'blob' })).data;
    const url = URL.createObjectURL(b); const a = document.createElement('a'); a.href = url; a.download = `${(rep.title || 'safety_report').replace(/[^A-Za-z0-9 _-]+/g, '').replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  const feedback = async (fid, verdict) => {
    try { setRep((await apiPut(`/safety-vision/reports/${rep.id}/feedback`, { finding_id: fid, verdict })).data); } catch (e) { message.error(err(e)); }
  };
  const s = rep?.summary || {};
  const real = (rep?.findings || []).filter((f) => f.level !== 'possible');
  const poss = (rep?.findings || []).filter((f) => f.level === 'possible');
  const Finding = ({ f }) => (
    <List.Item style={{ display: 'block' }}>
      <Space wrap>
        <Text strong>{f.id}. {f.title}</Text>
        {f.level === 'possible' ? <Tag>possible: please confirm</Tag> : <Tag color={RISK[f.risk]}>{f.risk}</Tag>}
        <Tag>{f.category}</Tag>
        {f.level === 'inferred' && <Tag color="blue">not seen on the person</Tag>}
        {rep.images > 1 && <Text type="secondary">picture {f.image + 1}{f.time != null ? ` at ${f.time} s` : ''}</Text>}
      </Space>
      <ol style={{ margin: '6px 0 4px', paddingLeft: 20 }}>{f.controls.map((c) => <li key={c}>{c}</li>)}</ol>
      <Space wrap style={{ fontSize: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>{f.reference} · {f.evidence} · confidence {f.confidence}</Text>
        <Button size="small" type={f.feedback?.verdict === 'correct' ? 'primary' : 'default'} icon={<CheckOutlined />} onClick={() => feedback(f.id, f.feedback?.verdict === 'correct' ? null : 'correct')}>Right</Button>
        <Button size="small" danger={f.feedback?.verdict === 'wrong'} type={f.feedback?.verdict === 'wrong' ? 'primary' : 'default'} icon={<CloseOutlined />} onClick={() => feedback(f.id, f.feedback?.verdict === 'wrong' ? null : 'wrong')}>Wrong</Button>
      </Space>
    </List.Item>
  );
  return (
    <Card style={{ borderRadius: 16, marginBottom: 16 }} title={<span><CameraOutlined /> Photo or video hazard check</span>}>
      {model && !model.installed && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="The detection model is not installed on the server yet." />}
      <Paragraph style={{ marginBottom: 8 }}>Upload a site photo or a short video. The check marks what is wrong or missing (for example a person without a hard hat, someone at height with no harness, people next to moving plant, spills, fire) and gives what to do for each.</Paragraph>
      <Row gutter={[12, 8]} align="middle">
        <Col xs={24} md={6}><Select value={site} style={{ width: '100%' }} onChange={(v) => { setSite(v); setPpe(SITE_PPE[v]); }}
          options={[['construction', 'Construction site'], ['industrial', 'Plant / industrial'], ['warehouse', 'Warehouse'], ['lab', 'Laboratory'], ['healthcare', 'Healthcare'], ['office', 'Office']].map(([v, l]) => ({ value: v, label: l }))} /></Col>
        <Col xs={24} md={8}><Input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} placeholder="Location (optional)" /></Col>
        <Col xs={24} md={10}><Upload accept=".jpg,.jpeg,.png,.mp4,.mov,.webm,.avi" showUploadList={false} beforeUpload={analyse} disabled={busy}>
          <Button type="primary" icon={<UploadOutlined />} loading={busy} block>{busy ? 'Checking...' : 'Choose photo or video'}</Button></Upload></Col>
        <Col span={24}><Text type="secondary">PPE required here: </Text><Checkbox.Group value={ppe} onChange={setPpe} options={PPE.map(([v, l]) => ({ value: v, label: l }))} /></Col>
      </Row>
      {rep && (
        <div style={{ marginTop: 16 }}>
          <Alert type={s.overall === 'none' ? 'success' : ['critical', 'high'].includes(s.overall) ? 'error' : 'warning'} showIcon
            message={s.overall === 'none' ? 'No hazards found in the checked pictures' : `Overall risk ${s.overall?.toUpperCase()}: ${s.hazards} hazard(s)${s.possible ? `, ${s.possible} to confirm` : ''}`}
            description={`${s.people || 0} people seen${Object.keys(s.ppe_seen || {}).length ? ` · seen: ${Object.entries(s.ppe_seen).map(([k, v]) => `${v} ${k}`).join(', ')}` : ''} · ${s.frames_checked} picture(s) checked`}
            action={<Button icon={<FilePdfOutlined />} onClick={pdf}>PDF report</Button>} />
          <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
            <Col xs={24} lg={12}>{Array.from({ length: rep.images }).map((_, i) => <div key={i} style={{ marginBottom: 8 }}><ReportImage rid={rep.id} n={i} /></div>)}</Col>
            <Col xs={24} lg={12}>
              {real.length ? <List size="small" header={<Text strong>Hazards found</Text>} dataSource={real} renderItem={(f) => <Finding f={f} />} /> : <Empty description="Nothing wrong seen" />}
              {poss.length > 0 && <List size="small" style={{ marginTop: 8 }} header={<Text strong>Possible: check these on site (the model is still learning them)</Text>} dataSource={poss} renderItem={(f) => <Finding f={f} />} />}
              <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>Marking findings right or wrong helps train the next model. A camera cannot check permits, training or gas levels; this supports, and does not replace, a site inspection.</Paragraph>
            </Col>
          </Row>
        </div>
      )}
      {history.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">Earlier checks: </Text>
          <Space wrap>{history.slice(0, 8).map((h) => <Tag key={h.id} color={RISK[h.summary?.overall]} style={{ cursor: 'pointer' }} onClick={() => setRep(h)}>{h.title}</Tag>)}</Space>
        </div>
      )}
    </Card>
  );
};

export default SafetyVisionPanel;
