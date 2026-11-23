// src/components/submissions/ReviewAndSign.js
// Read a submitted PDF, place signature/stamp, approve or reject. Used for colleagues and client reviewers.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button, Card, Steps, Tag, Space, Typography, Input, Alert, Modal, Checkbox, Spin, Result, message, Empty, Descriptions,
} from 'antd';
import {
  CheckOutlined, CloseOutlined, DownloadOutlined, ArrowLeftOutlined, EditOutlined, SafetyCertificateOutlined,
  ZoomInOutlined, ZoomOutOutlined,
} from '@ant-design/icons';
import * as pdfjsLib from 'pdfjs-dist';
import submissionService from '../../services/submissionService';
import { SignatureCreator, StampDesigner } from './SigningTools';
import { SignerChain, STATUS } from './SubmissionsCenter';
import './Submissions.css';

const { Text, Title, Paragraph } = Typography;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// mirrors pdf_edit_engine.default_slots on the server
const SLOT_W = 160; const SLOT_H = 64; const SLOT_GAP = 12; const SLOT_MARGIN = 40;
const defaultSlot = (pageSize, pageNumber, index) => {
  const perRow = Math.max(1, Math.floor((pageSize.width - 2 * SLOT_MARGIN + SLOT_GAP) / (SLOT_W + SLOT_GAP)));
  const row = Math.floor(index / perRow); const col = index % perRow;
  return { page: pageNumber, x: SLOT_MARGIN + col * (SLOT_W + SLOT_GAP), y: pageSize.height - SLOT_MARGIN - SLOT_H - row * (SLOT_H + 26), w: SLOT_W, h: SLOT_H };
};

function PdfPage({ pdf, pageNumber, scale, children, onSize }) {
  const canvasRef = useRef(null);
  const [size, setSize] = useState(null);
  useEffect(() => {
    let task = null; let cancelled = false;
    (async () => {
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      if (!cancelled) { setSize({ width: base.width, height: base.height }); onSize?.(pageNumber, { width: base.width, height: base.height }); }
      const vp = page.getViewport({ scale });
      const dpr = window.devicePixelRatio || 1;
      const c = canvasRef.current; if (!c || cancelled) return;
      c.width = Math.floor(vp.width * dpr); c.height = Math.floor(vp.height * dpr);
      c.style.width = `${Math.floor(vp.width)}px`; c.style.height = `${Math.floor(vp.height)}px`;
      task = page.render({ canvasContext: c.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
      try { await task.promise; } catch (e) { /* cancelled */ }
    })();
    return () => { cancelled = true; if (task) task.cancel(); };
  }, [pdf, pageNumber, scale, onSize]);
  return (
    <div className="rv-page-box" style={size ? { width: Math.floor(size.width * scale), height: Math.floor(size.height * scale) } : { width: 600, height: 800 }}>
      <span className="rv-page-label">Page {pageNumber}</span>
      <canvas ref={canvasRef} />
      {children}
    </div>
  );
}

function ReviewAndSign({ submissionId }) {
  const history = useHistory();
  const [sub, setSub] = useState(null);
  const [error, setError] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [scale, setScale] = useState(1.1);
  const [sizes, setSizes] = useState({});
  const [assets, setAssets] = useState([]);
  const [assetUrls, setAssetUrls] = useState({});
  const [sigChoice, setSigChoice] = useState(null);     // {assetId} | {dataUrl, save}
  const [stampChoice, setStampChoice] = useState(null);
  const [marks, setMarks] = useState({});               // { signature: {page,x,y,w,h}, stamp: {...} }
  const [comment, setComment] = useState('');
  const [creator, setCreator] = useState(null);         // 'signature' | 'stamp'
  const [draftImage, setDraftImage] = useState(null);
  const [saveForLater, setSaveForLater] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const viewerRef = useRef(null);
  const dragRef = useRef(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const s = (await submissionService.get(submissionId)).submission;
      setSub(s);
      const bytes = await submissionService.fileBytes(submissionId);
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
      setPdf(doc);
      if (s.my_role?.can_act) {
        const list = (await submissionService.listAssets()).assets || [];
        setAssets(list);
        const urls = {};
        await Promise.all(list.map(async (a) => { try { urls[a.id] = await submissionService.assetImageUrl(a.id); } catch (e) { /* ignore */ } }));
        setAssetUrls(urls);
        const defSig = list.find((a) => a.kind === 'signature' && a.is_default) || list.find((a) => a.kind === 'signature');
        const defStamp = list.find((a) => a.kind === 'stamp' && a.is_default) || list.find((a) => a.kind === 'stamp');
        if (defSig) setSigChoice({ assetId: defSig.id });
        if (defStamp) setStampChoice({ assetId: defStamp.id });
      }
    } catch (e) {
      setError(e.status === 404 ? 'This document was not found, or it was not sent to you.' : e.message);
    }
  }, [submissionId]);
  useEffect(() => { load(); }, [load]);

  // fit the page to the viewer width
  useEffect(() => {
    const first = sizes[1];
    if (!first || !viewerRef.current) return;
    const w = viewerRef.current.clientWidth - 48;
    setScale(Math.max(0.45, Math.min(1.4, w / first.width)));
  }, [sizes]);

  const action = sub?.my_role?.action;
  const needsSig = action === 'sign' || action === 'sign_and_stamp';
  const needsStamp = action === 'stamp' || action === 'sign_and_stamp';
  const canAct = !!sub?.my_role?.can_act;

  // default positions once the last page size is known
  useEffect(() => {
    if (!canAct || !pdf) return;
    const last = pdf.numPages; const size = sizes[last];
    if (!size) return;
    const order = (sub.signers.find((s) => s.id === sub.my_role.signer_id)?.order || 1) - 1;
    setMarks((m) => ({
      signature: m.signature || (needsSig ? defaultSlot(size, last, order * 2) : undefined),
      stamp: m.stamp || (needsStamp ? defaultSlot(size, last, order * 2 + 1) : undefined),
    }));
  }, [canAct, pdf, sizes, sub, needsSig, needsStamp]);

  const onSize = useCallback((n, s) => setSizes((prev) => (prev[n] ? prev : { ...prev, [n]: s })), []);
  const imageFor = (kind) => {
    const c = kind === 'signature' ? sigChoice : stampChoice;
    if (!c) return null;
    return c.dataUrl || assetUrls[c.assetId] || null;
  };

  // dragging / resizing the signature boxes (page points)
  useEffect(() => {
    const move = (e) => {
      const d = dragRef.current; if (!d) return;
      const dx = (e.clientX - d.sx) / scale; const dy = (e.clientY - d.sy) / scale;
      const size = sizes[d.orig.page] || { width: 9999, height: 9999 };
      setMarks((m) => {
        const o = d.orig;
        const next = d.mode === 'move'
          ? { ...o, x: Math.min(Math.max(0, o.x + dx), size.width - o.w), y: Math.min(Math.max(0, o.y + dy), size.height - o.h) }
          : { ...o, w: Math.max(40, Math.min(size.width - o.x, o.w + dx)), h: Math.max(20, Math.min(size.height - o.y, o.h + dy)) };
        return { ...m, [d.kind]: next };
      });
    };
    const up = () => { dragRef.current = null; };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [scale, sizes]);

  const startDrag = (kind, mode) => (e) => {
    e.stopPropagation(); e.preventDefault();
    dragRef.current = { kind, mode, sx: e.clientX, sy: e.clientY, orig: marks[kind] };
  };
  const moveToPage = (kind, page) => setMarks((m) => {
    const size = sizes[page]; const o = m[kind];
    return { ...m, [kind]: { ...o, page, x: Math.min(o.x, size.width - o.w), y: Math.min(o.y, size.height - o.h) } };
  });

  const decide = async (decision) => {
    if (decision === 'reject' && comment.trim().length < 3) { message.warning('Please write why you reject it, so the sender knows what to fix.'); return; }
    if (decision === 'approve') {
      if (needsSig && !sigChoice) { message.warning('Add your signature first (step 2).'); return; }
      if (needsStamp && !stampChoice) { message.warning('Choose or create your stamp first (step 2).'); return; }
    }
    const payload = { decision, comment: comment.trim() || undefined, placements: [] };
    if (decision === 'approve') {
      if (needsSig) {
        if (sigChoice.dataUrl) { payload.signature_data_url = sigChoice.dataUrl; payload.save_signature = !!sigChoice.save; payload.signature_remove_background = !!sigChoice.removeBackground; }
        else payload.signature_asset_id = sigChoice.assetId;
        payload.placements.push({ kind: 'signature', ...marks.signature });
      }
      if (needsStamp) {
        if (stampChoice.dataUrl) { payload.stamp_data_url = stampChoice.dataUrl; payload.save_stamp = !!stampChoice.save; payload.stamp_remove_background = !!stampChoice.removeBackground; }
        else payload.stamp_asset_id = stampChoice.assetId;
        payload.placements.push({ kind: 'stamp', ...marks.stamp });
      }
    }
    Modal.confirm({
      title: decision === 'approve' ? 'Approve this document?' : 'Reject this document?',
      content: decision === 'approve'
        ? `${needsSig || needsStamp ? 'Your ' + [needsSig && 'signature', needsStamp && 'stamp'].filter(Boolean).join(' and ') + ' will be added to the PDF where the blue boxes are. ' : ''}This is recorded with your name, the time and your IP address, and cannot be undone.`
        : 'The sender will be emailed your reason and the approval stops here.',
      okText: decision === 'approve' ? 'Yes, approve' : 'Yes, reject',
      okButtonProps: { danger: decision === 'reject' },
      onOk: async () => {
        setSubmitting(true);
        try {
          const res = await submissionService.act(submissionId, payload);
          setDone({ decision, message: res.message });
        } catch (e) { message.error(e.message, 6); }
        finally { setSubmitting(false); }
      },
    });
  };

  const sigAssets = useMemo(() => assets.filter((a) => a.kind === 'signature'), [assets]);
  const stampAssets = useMemo(() => assets.filter((a) => a.kind === 'stamp'), [assets]);

  if (error) return <Result status="warning" title="Cannot open this document" subTitle={error} extra={<Button onClick={() => history.push('/reviews')}>Back to my reviews</Button>} />;
  if (done) {
    return (
      <Result status={done.decision === 'approve' ? 'success' : 'info'}
        title={done.decision === 'approve' ? 'Thank you — approved' : 'Rejected'}
        subTitle={done.message}
        extra={[
          <Button key="list" type="primary" onClick={() => history.push('/reviews')}>Back to my reviews</Button>,
          <Button key="dl" icon={<DownloadOutlined />} onClick={() => submissionService.download(submissionId, `${sub.title}.pdf`)}>Download copy</Button>,
        ]} />
    );
  }
  if (!sub || !pdf) return <div style={{ padding: 60, textAlign: 'center' }}><Spin size="large" tip="Opening document…"><div style={{ height: 40 }} /></Spin></div>;

  const renderChooser = (kind, list, choice, setChoice) => (
    <div className="rv-choice">
      {list.map((a) => (
        <div key={a.id} className={`rv-choice-item ${choice?.assetId === a.id ? 'active' : ''}`} onClick={() => setChoice({ assetId: a.id })} role="button" tabIndex={0}>
          {assetUrls[a.id] ? <img className="rv-thumb" src={assetUrls[a.id]} alt="" /> : <Spin size="small" />}
        </div>
      ))}
      {choice?.dataUrl && <div className="rv-choice-item active"><img className="rv-thumb" src={choice.dataUrl} alt="" /></div>}
      <Button icon={<EditOutlined />} onClick={() => { setDraftImage(null); setSaveForLater(true); setCreator(kind); }}>
        {list.length || choice?.dataUrl ? 'Create new' : kind === 'signature' ? 'Add my signature' : 'Create my stamp'}
      </Button>
    </div>
  );

  return (
    <div className="rv-page">
      <div className="rv-header">
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/reviews')}>My reviews</Button>
          <div>
            <Title level={5} style={{ margin: 0 }}>{sub.title}</Title>
            <Text type="secondary">{sub.reference} · from {sub.submitted_by?.name}</Text>
          </div>
          <Tag color={STATUS[sub.status]?.color} icon={STATUS[sub.status]?.icon}>{STATUS[sub.status]?.label}</Tag>
        </Space>
        <Space wrap>
          <Button icon={<ZoomOutOutlined />} onClick={() => setScale((s) => Math.max(0.4, +(s - 0.15).toFixed(2)))} aria-label="Zoom out" />
          <Button icon={<ZoomInOutlined />} onClick={() => setScale((s) => Math.min(2.5, +(s + 0.15).toFixed(2)))} aria-label="Zoom in" />
          <Button icon={<DownloadOutlined />} onClick={() => submissionService.download(submissionId, `${sub.title} - ${sub.reference}.pdf`)}>Download</Button>
        </Space>
      </div>

      <div className="rv-body">
        <div className="rv-viewer" ref={viewerRef}>
          {Array.from({ length: pdf.numPages }, (_, i) => i + 1).map((n) => (
            <PdfPage key={n} pdf={pdf} pageNumber={n} scale={scale} onSize={onSize}>
              {canAct && ['signature', 'stamp'].map((kind) => {
                const m = marks[kind];
                if (!m || m.page !== n) return null;
                const img = imageFor(kind);
                return (
                  <div key={kind} className="rv-mark" onPointerDown={startDrag(kind, 'move')}
                    style={{ left: m.x * scale, top: m.y * scale, width: m.w * scale, height: m.h * scale }}
                    title="Drag to move · drag the corner to resize">
                    <span className="rv-mark-label">{kind === 'signature' ? 'Your signature' : 'Your stamp'}</span>
                    {img ? <img src={img} alt="" /> : <Text type="secondary" style={{ fontSize: 11, padding: 4, display: 'block' }}>{kind === 'signature' ? 'Signature goes here' : 'Stamp goes here'}</Text>}
                    <span className="rv-mark-handle" onPointerDown={startDrag(kind, 'resize')} />
                  </div>
                );
              })}
            </PdfPage>
          ))}
        </div>

        <div className="rv-side">
          {canAct ? (
            <>
              <Steps direction="vertical" size="small" current={-1} items={[
                { title: 'Read the document', description: 'Scroll through all pages on the left.' },
                { title: needsSig || needsStamp ? `Check your ${[needsSig && 'signature', needsStamp && 'stamp'].filter(Boolean).join(' and ')}` : 'Add a comment (optional)',
                  description: needsSig || needsStamp ? 'The blue box shows where it goes. Drag it to another place if needed.' : 'Your name and the time are recorded.' },
                { title: 'Approve or reject', description: 'The sender gets an email straight away.' },
              ]} />
              {sub.message && <Alert type="info" showIcon style={{ marginBottom: 12 }} message="Message from the sender" description={sub.message} />}
              {sub.due_date && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message={`Please respond by ${new Date(sub.due_date).toLocaleDateString()}`} />}
              {needsSig && (
                <Card size="small" title="Your signature">
                  {renderChooser('signature', sigAssets, sigChoice, setSigChoice)}
                  {marks.signature && pdf.numPages > 1 && (
                    <Space style={{ marginTop: 8 }}><Text type="secondary">Page</Text>
                      <Input type="number" min={1} max={pdf.numPages} size="small" style={{ width: 70 }} value={marks.signature.page}
                        onChange={(e) => { const p = Math.max(1, Math.min(pdf.numPages, Number(e.target.value) || 1)); if (sizes[p]) moveToPage('signature', p); }} />
                    </Space>
                  )}
                </Card>
              )}
              {needsStamp && (
                <Card size="small" title="Your stamp">
                  {renderChooser('stamp', stampAssets, stampChoice, setStampChoice)}
                  {marks.stamp && pdf.numPages > 1 && (
                    <Space style={{ marginTop: 8 }}><Text type="secondary">Page</Text>
                      <Input type="number" min={1} max={pdf.numPages} size="small" style={{ width: 70 }} value={marks.stamp.page}
                        onChange={(e) => { const p = Math.max(1, Math.min(pdf.numPages, Number(e.target.value) || 1)); if (sizes[p]) moveToPage('stamp', p); }} />
                    </Space>
                  )}
                </Card>
              )}
              <Card size="small" title="Comment">
                <Input.TextArea rows={3} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional when approving. Required when rejecting — say what must be changed." />
              </Card>
              <Space style={{ width: '100%' }} direction="vertical">
                <Button type="primary" size="large" block icon={<CheckOutlined />} loading={submitting} onClick={() => decide('approve')}>
                  Approve{needsSig || needsStamp ? ` and ${[needsSig && 'sign', needsStamp && 'stamp'].filter(Boolean).join(' & ')}` : ''}
                </Button>
                <Button danger size="large" block icon={<CloseOutlined />} disabled={submitting} onClick={() => decide('reject')}>Reject</Button>
              </Space>
              <Paragraph type="secondary" style={{ marginTop: 10, fontSize: 12 }}>
                <SafetyCertificateOutlined /> When everyone has approved, an approval certificate listing every signer, time and IP address is added to the PDF.
              </Paragraph>
            </>
          ) : (
            <>
              <Alert type={sub.status === 'approved' ? 'success' : 'info'} showIcon style={{ marginBottom: 12 }}
                message={sub.my_role?.status === 'waiting' ? 'Not your turn yet' : sub.my_role ? 'You have already responded' : 'View only'}
                description={sub.my_role?.status === 'waiting' ? 'You will get an email when it is your turn to sign.' : 'You can read and download this document.'} />
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Sent by">{sub.submitted_by?.name}</Descriptions.Item>
                <Descriptions.Item label="Sent">{new Date(sub.submitted_at).toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </>
          )}
          <Card size="small" title="Signing order" style={{ marginTop: 12 }}>
            {sub.signers?.length ? <SignerChain signers={sub.signers} /> : <Empty />}
          </Card>
        </div>
      </div>

      <Modal open={!!creator} onCancel={() => setCreator(null)} width={680} destroyOnClose
        title={creator === 'stamp' ? 'Create your stamp' : 'Add your signature'}
        okText="Use this" onOk={() => {
          if (!draftImage?.dataUrl) { message.warning(creator === 'stamp' ? 'Design or upload a stamp first.' : 'Draw, type or upload your signature first.'); return; }
          const choice = { dataUrl: draftImage.dataUrl, save: saveForLater, removeBackground: !!draftImage.removeBackground };
          if (creator === 'stamp') setStampChoice(choice); else setSigChoice(choice);
          setCreator(null);
        }}>
        {creator === 'stamp' ? <StampDesigner onChange={setDraftImage} companyName={sub.signers?.find((x) => x.id === sub.my_role?.signer_id)?.organization || ''} /> : <SignatureCreator onChange={setDraftImage} />}
        <Checkbox style={{ marginTop: 12 }} checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)}>
          Save it for next time (only you can use it)
        </Checkbox>
      </Modal>
    </div>
  );
}

export default ReviewAndSign;
