// src/components/submissions/SigningTools.js
// Signature creator (draw / type / upload), stamp designer, and the "My signature & stamp" manager.
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Tabs, Button, Input, Select, Space, Upload, Checkbox, Card, Row, Col, Empty, Tag, Popconfirm,
  message, Typography, Alert, Radio, Spin,
} from 'antd';
import { DeleteOutlined, StarOutlined, StarFilled, UploadOutlined, ClearOutlined } from '@ant-design/icons';
import SignatureCanvas from 'react-signature-canvas';
import submissionService from '../../services/submissionService';
import './Submissions.css';

const { Text, Paragraph } = Typography;

const SCRIPT_FONTS = [
  { value: '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive', label: 'Handwriting 1' },
  { value: '"Brush Script MT", "Segoe Script", cursive', label: 'Handwriting 2' },
  { value: '"Lucida Handwriting", "Segoe Script", cursive', label: 'Handwriting 3' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Formal (serif)' },
];
const INK = [
  { value: '#0b2e8a', label: 'Blue' },
  { value: '#111111', label: 'Black' },
];

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

// ------------------------------------------------------------------ signature
export function SignatureCreator({ onChange, kind = 'signature', defaultName = '' }) {
  const padRef = useRef(null);
  const [mode, setMode] = useState('draw');
  const [ink, setInk] = useState(INK[0].value);
  const [typed, setTyped] = useState(defaultName);
  const [font, setFont] = useState(SCRIPT_FONTS[0].value);
  const [uploaded, setUploaded] = useState(null);
  const [removeBg, setRemoveBg] = useState(true);

  const emitTyped = useCallback(() => {
    const text = typed.trim();
    if (!text) { onChange?.(null); return; }
    const c = document.createElement('canvas');
    const size = kind === 'initials' ? 120 : 90;
    c.width = 900; c.height = 260;
    const ctx = c.getContext('2d');
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = ink;
    ctx.textBaseline = 'middle';
    const w = Math.min(880, ctx.measureText(text).width);
    ctx.fillText(text, (c.width - w) / 2, c.height / 2, 880);
    onChange?.({ dataUrl: c.toDataURL('image/png'), removeBackground: false });
  }, [typed, font, ink, kind, onChange]);

  useEffect(() => { if (mode === 'type') emitTyped(); }, [mode, emitTyped]);
  useEffect(() => {
    if (mode === 'upload') onChange?.(uploaded ? { dataUrl: uploaded, removeBackground: removeBg } : null);
  }, [mode, uploaded, removeBg, onChange]);

  return (
    <div className="sg-creator">
      <Tabs
        activeKey={mode}
        onChange={(k) => { setMode(k); onChange?.(null); }}
        items={[
          {
            key: 'draw', label: 'Draw',
            children: (
              <div>
                <div className="sg-pad-wrap">
                  <SignatureCanvas
                    ref={padRef}
                    penColor={ink}
                    minWidth={1.2}
                    maxWidth={3}
                    canvasProps={{ className: 'sg-pad', 'aria-label': 'Signature drawing area' }}
                    onEnd={() => {
                      if (padRef.current && !padRef.current.isEmpty()) {
                        onChange?.({ dataUrl: padRef.current.toDataURL('image/png'), removeBackground: false });
                      }
                    }}
                  />
                  <span className="sg-pad-line">Sign above this line</span>
                </div>
                <Space style={{ marginTop: 8 }} wrap>
                  <Radio.Group size="small" value={ink} onChange={(e) => setInk(e.target.value)} options={INK} optionType="button" />
                  <Button size="small" icon={<ClearOutlined />} onClick={() => { padRef.current?.clear(); onChange?.(null); }}>Clear</Button>
                  <Text type="secondary">Use your mouse, finger or stylus.</Text>
                </Space>
              </div>
            ),
          },
          {
            key: 'type', label: 'Type',
            children: (
              <div>
                <Input size="large" value={typed} maxLength={kind === 'initials' ? 6 : 60}
                  placeholder={kind === 'initials' ? 'Your initials, e.g. A.A.' : 'Type your full name'}
                  onChange={(e) => setTyped(e.target.value)} />
                <Space style={{ marginTop: 8 }} wrap>
                  <Select size="small" style={{ width: 170 }} value={font} options={SCRIPT_FONTS} onChange={setFont} />
                  <Radio.Group size="small" value={ink} onChange={(e) => setInk(e.target.value)} options={INK} optionType="button" />
                </Space>
                <div className="sg-typed-preview" style={{ fontFamily: font, color: ink }}>{typed || ' '}</div>
              </div>
            ),
          },
          {
            key: 'upload', label: 'Upload',
            children: (
              <div>
                <Upload accept="image/png,image/jpeg" maxCount={1} showUploadList={false}
                  beforeUpload={async (file) => {
                    if (file.size > 3 * 1024 * 1024) { message.error('Please choose an image under 3 MB'); return false; }
                    setUploaded(await readFileAsDataUrl(file));
                    return false;
                  }}>
                  <Button icon={<UploadOutlined />}>Choose a photo or scan of your signature</Button>
                </Upload>
                <div style={{ marginTop: 8 }}>
                  <Checkbox checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)}>
                    Remove the white paper background
                  </Checkbox>
                </div>
                {uploaded && <img src={uploaded} alt="Uploaded signature" className="sg-upload-preview" />}
                <Paragraph type="secondary" style={{ marginTop: 6, marginBottom: 0 }}>
                  Tip: sign on plain white paper with a dark pen and take the photo in good light.
                </Paragraph>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

// ------------------------------------------------------------------ stamp
const drawCurvedText = (ctx, text, cx, cy, radius, top, fontPx) => {
  ctx.save();
  ctx.font = `bold ${fontPx}px Helvetica, Arial, sans-serif`;
  const chars = [...text];
  const total = chars.reduce((s, ch) => s + ctx.measureText(ch).width, 0) * 1.08;
  const angleSpan = Math.min(Math.PI * 1.6, total / radius);
  let angle = (top ? -Math.PI / 2 : Math.PI / 2) - (top ? angleSpan / 2 : -angleSpan / 2);
  chars.forEach((ch) => {
    const w = ctx.measureText(ch).width * 1.08;
    const a = angle + (top ? 1 : -1) * (w / 2) / radius;
    ctx.save();
    ctx.translate(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    ctx.rotate(a + (top ? Math.PI / 2 : -Math.PI / 2));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += (top ? 1 : -1) * w / radius;
  });
  ctx.restore();
};

export function renderStamp({ shape, topText, centerText, bottomText, color, showDate }) {
  const c = document.createElement('canvas');
  const W = shape === 'rect' ? 640 : 520; const Hh = shape === 'rect' ? 300 : 520;
  c.width = W; c.height = Hh;
  const ctx = c.getContext('2d');
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 10;
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const bottom = [bottomText, showDate ? date : null].filter(Boolean).join(' · ');
  if (shape === 'rect') {
    ctx.strokeRect(10, 10, W - 20, Hh - 20);
    ctx.lineWidth = 3; ctx.strokeRect(26, 26, W - 52, Hh - 52);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 34px Helvetica, Arial, sans-serif'; ctx.fillText(topText.toUpperCase(), W / 2, 72, W - 80);
    ctx.font = 'bold 64px Helvetica, Arial, sans-serif'; ctx.fillText(centerText.toUpperCase(), W / 2, Hh / 2 + 6, W - 80);
    ctx.font = 'bold 28px Helvetica, Arial, sans-serif'; ctx.fillText(bottom, W / 2, Hh - 64, W - 80);
  } else {
    const cx = W / 2; const cy = Hh / 2;
    const rx = shape === 'oval' ? W / 2 - 12 : Hh / 2 - 12; const ry = Hh / 2 - 12;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx - 70, ry - 70, 0, 0, Math.PI * 2); ctx.stroke();
    drawCurvedText(ctx, topText.toUpperCase(), cx, cy, ry - 38, true, 34);
    if (bottom) drawCurvedText(ctx, bottom, cx, cy, ry - 38, false, 28);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 54px Helvetica, Arial, sans-serif';
    ctx.fillText(centerText.toUpperCase(), cx, cy, (rx - 80) * 2);
  }
  return c.toDataURL('image/png');
}

export function StampDesigner({ onChange, companyName = '' }) {
  const [mode, setMode] = useState('design');
  const [shape, setShape] = useState('round');
  const [topText, setTopText] = useState(companyName || 'Company Name');
  const [centerText, setCenterText] = useState('APPROVED');
  const [bottomText, setBottomText] = useState('');
  const [showDate, setShowDate] = useState(true);
  const [color, setColor] = useState('#0b3d91');
  const [preview, setPreview] = useState(null);
  const [uploaded, setUploaded] = useState(null);
  const [removeBg, setRemoveBg] = useState(true);

  useEffect(() => {
    if (mode !== 'design') return;
    const url = renderStamp({ shape, topText, centerText, bottomText, color, showDate });
    setPreview(url);
    onChange?.({ dataUrl: url, removeBackground: false });
  }, [mode, shape, topText, centerText, bottomText, color, showDate, onChange]);
  useEffect(() => {
    if (mode === 'upload') onChange?.(uploaded ? { dataUrl: uploaded, removeBackground: removeBg } : null);
  }, [mode, uploaded, removeBg, onChange]);

  return (
    <Tabs activeKey={mode} onChange={setMode} items={[
      {
        key: 'design', label: 'Design a stamp',
        children: (
          <Row gutter={16}>
            <Col xs={24} md={13}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio.Group value={shape} onChange={(e) => setShape(e.target.value)} optionType="button" buttonStyle="solid"
                  options={[{ value: 'round', label: 'Round seal' }, { value: 'oval', label: 'Oval' }, { value: 'rect', label: 'Rectangle' }]} />
                <Input addonBefore="Outer text" value={topText} maxLength={40} onChange={(e) => setTopText(e.target.value)} />
                <Input addonBefore="Centre" value={centerText} maxLength={16} onChange={(e) => setCenterText(e.target.value)} />
                <Input addonBefore="Bottom" value={bottomText} maxLength={30} placeholder="e.g. HSE Department" onChange={(e) => setBottomText(e.target.value)} />
                <Space wrap>
                  <Checkbox checked={showDate} onChange={(e) => setShowDate(e.target.checked)}>Add today's date</Checkbox>
                  <label className="sg-color">Colour <input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
                </Space>
              </Space>
            </Col>
            <Col xs={24} md={11}>
              <div className="sg-stamp-preview">{preview && <img src={preview} alt="Stamp preview" />}</div>
            </Col>
          </Row>
        ),
      },
      {
        key: 'upload', label: 'Upload my company stamp',
        children: (
          <div>
            <Upload accept="image/png,image/jpeg" maxCount={1} showUploadList={false}
              beforeUpload={async (file) => {
                if (file.size > 3 * 1024 * 1024) { message.error('Please choose an image under 3 MB'); return false; }
                setUploaded(await readFileAsDataUrl(file));
                return false;
              }}>
              <Button icon={<UploadOutlined />}>Choose a scan or photo of your stamp</Button>
            </Upload>
            <div style={{ marginTop: 8 }}>
              <Checkbox checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)}>Remove the white paper background</Checkbox>
            </div>
            {uploaded && <img src={uploaded} alt="Uploaded stamp" className="sg-upload-preview" />}
          </div>
        ),
      },
    ]} />
  );
}

// ------------------------------------------------------------------ manager page
function AssetImage({ id }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true; let made = null;
    submissionService.assetImageUrl(id).then((u) => { made = u; if (alive) setUrl(u); }).catch(() => {});
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [id]);
  return url ? <img src={url} alt="" className="sg-asset-img" /> : <Spin size="small" />;
}

export function SigningProfile({ user }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingSig, setPendingSig] = useState(null);
  const [pendingInitials, setPendingInitials] = useState(null);
  const [pendingStamp, setPendingStamp] = useState(null);
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAssets((await submissionService.listAssets()).assets || []); }
    catch (e) { message.error(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (kind, pending) => {
    if (!pending?.dataUrl) { message.warning(kind === 'stamp' ? 'Design or upload a stamp first.' : 'Draw, type or upload it first.'); return; }
    setSaving(kind);
    try {
      await submissionService.createAsset({ kind, image_data_url: pending.dataUrl, remove_background: pending.removeBackground, is_default: true });
      message.success(`${kind === 'stamp' ? 'Stamp' : kind === 'initials' ? 'Initials' : 'Signature'} saved. It will be used by default when you sign.`);
      await load();
    } catch (e) { message.error(e.message); }
    finally { setSaving(null); }
  };

  const list = (kind) => {
    const items = assets.filter((a) => a.kind === kind);
    if (!items.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`No saved ${kind} yet`} />;
    return (
      <div className="sg-asset-list">
        {items.map((a) => (
          <Card key={a.id} size="small" className={a.is_default ? 'sg-asset sg-asset-default' : 'sg-asset'}
            actions={[
              a.is_default ? <Tag color="blue" key="d"><StarFilled /> Default</Tag> : (
                <Button key="d" type="link" size="small" icon={<StarOutlined />} onClick={async () => { await submissionService.setDefaultAsset(a.id); load(); }}>Use by default</Button>
              ),
              <Popconfirm key="x" title="Delete this image?" okText="Delete" onConfirm={async () => { await submissionService.deleteAsset(a.id); load(); }}>
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>Delete</Button>
              </Popconfirm>,
            ]}>
            <AssetImage id={a.id} />
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="sg-profile">
      <Alert type="info" showIcon style={{ marginBottom: 16 }}
        message="Save your signature and stamp once"
        description="When a document is sent to you, your default signature and stamp are added for you — you only check where they go and press Approve. Your images are private: only you can see and use them." />
      {loading ? <Spin /> : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="My signature" extra={<Button type="primary" loading={saving === 'signature'} onClick={() => save('signature', pendingSig)}>Save signature</Button>}>
              <SignatureCreator onChange={setPendingSig} defaultName={user?.name || ''} />
              <div className="sg-saved-title">Saved signatures</div>
              {list('signature')}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="My stamp" extra={<Button type="primary" loading={saving === 'stamp'} onClick={() => save('stamp', pendingStamp)}>Save stamp</Button>}>
              <StampDesigner onChange={setPendingStamp} companyName={user?.company_name || ''} />
              <div className="sg-saved-title">Saved stamps</div>
              {list('stamp')}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="My initials (optional)" extra={<Button loading={saving === 'initials'} onClick={() => save('initials', pendingInitials)}>Save initials</Button>}>
              <SignatureCreator kind="initials" onChange={setPendingInitials} />
              {list('initials')}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default SigningProfile;
