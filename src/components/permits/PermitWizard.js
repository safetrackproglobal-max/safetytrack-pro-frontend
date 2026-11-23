// src/components/permits/PermitWizard.js
// Guided permit form: details -> risk assessment -> precautions & PPE -> gas tests -> documents & sign-off -> style & preview.
import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer, Steps, Form, Input, DatePicker, Button, Space, Table, InputNumber, Select, Checkbox, Tag, Alert, Upload,
  Radio, Typography, message, Tooltip, Divider, Empty, Spin,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, UploadOutlined, CheckCircleTwoTone, SaveOutlined, FilePdfOutlined, SendOutlined,
  ArrowLeftOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import permitService from '../../services/permitService';
import SubmitForApproval from '../submissions/SubmitForApproval';
import './Permits.css';

const { Text, Paragraph } = Typography;
const LS = [1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }));

export const riskOf = (l, s, levels) => {
  const score = (Number(l) || 0) * (Number(s) || 0);
  const lv = (levels || []).find((x) => score >= x.min && score <= x.max);
  return { score, label: lv ? lv.label : '—', color: lv ? lv.color : '#bfbfbf' };
};

const gasOk = (key, value, limits) => {
  if (value === null || value === undefined || value === '') return null;
  const lim = limits[key]; const v = Number(value);
  if (!lim || Number.isNaN(v)) return null;
  return (lim.min === undefined || v >= lim.min) && (lim.max === undefined || v <= lim.max);
};

function PermitWizard({ open, catalog, permitType, permit: existing, onClose, onSaved }) {
  const type = useMemo(() => (catalog?.types || []).find((t) => t.key === (existing?.permit_type || permitType)) || null,
    [catalog, existing, permitType]);
  const [step, setStep] = useState(0);
  const [permit, setPermit] = useState(existing || null);
  const [form] = Form.useForm();
  const [hazards, setHazards] = useState([]);
  const [precautions, setPrecautions] = useState([]);
  const [ppe, setPpe] = useState([]);
  const [gasTests, setGasTests] = useState([]);
  const [docs, setDocs] = useState([]);
  const [signatories, setSignatories] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [style, setStyle] = useState({ template: 'modern', color: '', company_name: '' });
  const [customName, setCustomName] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [submitDoc, setSubmitDoc] = useState(null);

  // load initial values from the existing permit or the chosen standard type
  useEffect(() => {
    if (!open) return;
    setStep(0); setPreviewHtml(null);
    const d = existing?.data || {};
    setPermit(existing || null);
    form.setFieldsValue({
      title: existing?.title || type?.name || '',
      location: existing?.location || '',
      contractor: d.contractor || '',
      work_description: existing?.work_description || '',
      period: existing?.start_at ? [dayjs(existing.start_at), dayjs(existing.end_at)]
        : [dayjs().add(1, 'hour').startOf('hour'), dayjs().add(1 + (type?.validity_hours || 12), 'hour').startOf('hour')],
    });
    setHazards(d.hazards || (type?.hazards || []).map((h) => ({ ...h })));
    setPrecautions(d.precautions || (type?.precautions || []).map((t) => ({ text: t, done: false, note: '' })));
    setPpe(d.ppe || type?.ppe || []);
    setGasTests(d.gas_tests || []);
    setDocs(d.required_documents || (type?.required_documents || []).map((n) => ({ name: n, attached: false })));
    setSignatories(d.signatories || (type?.signatories || ['applicant', 'issuer']).map((r) => ({ role: r, name: '' })));
    setCustomFields(d.custom_fields || []);
    setStyle(d.style || { template: 'modern', color: type?.color || '#1677ff', company_name: '' });
    setCustomName(d.custom_type_name || '');
    // eslint-disable-next-line
  }, [open, existing?.id, permitType]);

  const levels = catalog?.risk_levels || [];
  const gasLimits = catalog?.gas_limits || {};
  const needsGas = !!type?.gas_test || gasTests.length > 0;
  const editable = !permit || permit.editable;

  const payload = async () => {
    const v = await form.validateFields();   // all steps are mounted, so this covers every field
    return {
      permit_type: type?.key || 'custom',
      title: v.title,
      location: v.location,
      work_description: v.work_description,
      start_at: v.period?.[0]?.format('YYYY-MM-DDTHH:mm:ss'),
      end_at: v.period?.[1]?.format('YYYY-MM-DDTHH:mm:ss'),
      data: {
        contractor: v.contractor, hazards, precautions, ppe, gas_tests: gasTests, required_documents: docs,
        signatories, custom_fields: customFields.filter((c) => c.label), style,
        custom_type_name: type ? undefined : customName,
      },
    };
  };

  const save = async (quiet = false) => {
    if (!editable) return permit;
    setSaving(true);
    try {
      const body = await payload();
      const res = permit?.id ? await permitService.update(permit.id, body) : await permitService.create(body);
      setPermit(res.permit);
      if (!quiet) message.success(`Draft saved as ${res.permit.permit_number}`);
      onSaved?.(res.permit);
      return res.permit;
    } catch (e) {
      if (e?.errorFields) { setStep(0); message.warning('Please complete the work details first.'); }
      else message.error(e.message);
      return null;
    } finally { setSaving(false); }
  };

  const goto = async (n) => {
    if (n > 0 && step === 0) { try { await form.validateFields(); } catch (e) { return; } }
    if (n === 5) {
      const p = await save(true);
      if (p) { try { setPreviewHtml((await permitService.preview(p.id)).html); } catch (e) { message.error(e.message); } }
    }
    setStep(n);
  };

  const generate = async (thenSend) => {
    const p = await save(true);
    if (!p) return;
    setSaving(true);
    try {
      const res = await permitService.generate(p.id);
      message.success(res.message);
      const fresh = (await permitService.get(p.id)).permit;
      setPermit(fresh); onSaved?.(fresh);
      if (thenSend) setSubmitDoc({ id: res.document_id, title: `${fresh.permit_number} — ${fresh.title}` });
    } catch (e) { message.error(e.message); }
    finally { setSaving(false); }
  };

  // ---------------- step content ----------------
  const hazardColumns = [
    { title: 'Hazard', dataIndex: 'hazard', render: (v, r, i) => <Input.TextArea autoSize value={v} disabled={!editable} onChange={(e) => setHazards((h) => h.map((x, j) => (j === i ? { ...x, hazard: e.target.value } : x)))} /> },
    { title: 'Consequence', dataIndex: 'consequence', render: (v, r, i) => <Input.TextArea autoSize value={v} disabled={!editable} onChange={(e) => setHazards((h) => h.map((x, j) => (j === i ? { ...x, consequence: e.target.value } : x)))} /> },
    { title: <Tooltip title="Likelihood × Severity (1-5 each)">Risk</Tooltip>, width: 150, render: (_, r, i) => {
      const k = riskOf(r.likelihood, r.severity, levels);
      return (
        <Space direction="vertical" size={2}>
          <Space size={2}><Select size="small" value={r.likelihood} options={LS} disabled={!editable} onChange={(v) => setHazards((h) => h.map((x, j) => (j === i ? { ...x, likelihood: v } : x)))} />×
            <Select size="small" value={r.severity} options={LS} disabled={!editable} onChange={(v) => setHazards((h) => h.map((x, j) => (j === i ? { ...x, severity: v } : x)))} /></Space>
          <Tag color={k.color}>{k.score} {k.label}</Tag>
        </Space>
      );
    } },
    { title: 'Control measures', dataIndex: 'controls', render: (v, r, i) => <Input.TextArea autoSize value={v} disabled={!editable} onChange={(e) => setHazards((h) => h.map((x, j) => (j === i ? { ...x, controls: e.target.value } : x)))} /> },
    { title: 'Residual', width: 150, render: (_, r, i) => {
      const k = riskOf(r.residual_likelihood, r.residual_severity, levels);
      return (
        <Space direction="vertical" size={2}>
          <Space size={2}><Select size="small" value={r.residual_likelihood} options={LS} disabled={!editable} onChange={(v) => setHazards((h) => h.map((x, j) => (j === i ? { ...x, residual_likelihood: v } : x)))} />×
            <Select size="small" value={r.residual_severity} options={LS} disabled={!editable} onChange={(v) => setHazards((h) => h.map((x, j) => (j === i ? { ...x, residual_severity: v } : x)))} /></Space>
          <Tag color={k.color}>{k.score} {k.label}</Tag>
        </Space>
      );
    } },
    { width: 40, render: (_, r, i) => editable && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setHazards((h) => h.filter((_, j) => j !== i))} /> },
  ];

  const steps = [
    {
      title: 'Work details',
      content: (
        <Form form={form} layout="vertical" disabled={!editable}>
          {!type && (
            <Form.Item label="Custom permit type name" required>
              <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Roof Access Permit" />
            </Form.Item>
          )}
          <Form.Item name="title" label="Permit title" rules={[{ required: true, message: 'Give the permit a title' }]}>
            <Input maxLength={255} placeholder="e.g. Hot work — weld support on pipe rack 3" />
          </Form.Item>
          <Form.Item name="location" label="Location / equipment tag" rules={[{ required: true, message: 'Where will the work take place?' }]}>
            <Input maxLength={255} placeholder="e.g. Area 3, pipe rack PR-3, line 6&quot;-P-1023" />
          </Form.Item>
          <Form.Item name="contractor" label="Contractor / work party"><Input placeholder="Company and crew carrying out the work" /></Form.Item>
          <Form.Item name="work_description" label="Description of work" rules={[{ required: true, message: 'Describe the work' }]}>
            <Input.TextArea rows={4} maxLength={10000} placeholder="What will be done, with which tools and equipment, and how many people." />
          </Form.Item>
          <Form.Item name="period" label={`Valid from – to${type?.validity_hours ? ` (typical maximum ${type.validity_hours} h for this permit type)` : ''}`}
            rules={[{ required: true, message: 'Set when the permit starts and ends' }]}>
            <DatePicker.RangePicker showTime={{ format: 'HH:mm' }} format="DD MMM YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Divider orientation="left" plain>Extra fields (optional)</Divider>
          {customFields.map((c, i) => (
            <Space key={i} style={{ display: 'flex', marginBottom: 8 }} wrap>
              <Input placeholder="Field name (e.g. Work order)" value={c.label} onChange={(e) => setCustomFields((f) => f.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <Input placeholder="Value" value={c.value} onChange={(e) => setCustomFields((f) => f.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
              <Button danger icon={<DeleteOutlined />} onClick={() => setCustomFields((f) => f.filter((_, j) => j !== i))} />
            </Space>
          ))}
          <Button icon={<PlusOutlined />} onClick={() => setCustomFields((f) => [...f, { label: '', value: '' }])}>Add a field</Button>
        </Form>
      ),
    },
    {
      title: 'Risk assessment',
      content: (
        <div>
          <Alert type="info" showIcon style={{ marginBottom: 12 }}
            message="Typical hazards for this permit type are filled in — check each one for your job"
            description="Score Likelihood and Severity from 1 (lowest) to 5 (highest). Risk = L × S: Low 1-4, Medium 5-9, High 10-16, Extreme 17-25. Add your control measures, then score the residual risk after controls." />
          <Table size="small" rowKey={(r, i) => i} pagination={false} dataSource={hazards} columns={hazardColumns} scroll={{ x: 900 }} />
          {editable && <Button style={{ marginTop: 8 }} icon={<PlusOutlined />} onClick={() => setHazards((h) => [...h, { hazard: '', consequence: '', likelihood: 3, severity: 3, controls: '', residual_likelihood: 1, residual_severity: 3 }])}>Add hazard</Button>}
        </div>
      ),
    },
    {
      title: 'Precautions & PPE',
      content: (
        <div>
          <Paragraph type="secondary">Tick each precaution when it is in place. Add any site-specific precautions.</Paragraph>
          {precautions.map((p, i) => (
            <Space key={i} className="pm-prec" align="start" wrap>
              <Checkbox checked={p.done} disabled={!editable} onChange={(e) => setPrecautions((x) => x.map((y, j) => (j === i ? { ...y, done: e.target.checked } : y)))} />
              <Input.TextArea autoSize style={{ width: 420, maxWidth: '70vw' }} value={p.text} disabled={!editable} onChange={(e) => setPrecautions((x) => x.map((y, j) => (j === i ? { ...y, text: e.target.value } : y)))} />
              <Input style={{ width: 200 }} placeholder="Remarks" value={p.note} disabled={!editable} onChange={(e) => setPrecautions((x) => x.map((y, j) => (j === i ? { ...y, note: e.target.value } : y)))} />
              {editable && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setPrecautions((x) => x.filter((_, j) => j !== i))} />}
            </Space>
          ))}
          {editable && <Button icon={<PlusOutlined />} onClick={() => setPrecautions((x) => [...x, { text: '', done: false, note: '' }])}>Add precaution</Button>}
          <Divider orientation="left" plain>Personal protective equipment</Divider>
          <Select mode="tags" style={{ width: '100%' }} value={ppe} disabled={!editable} onChange={setPpe} placeholder="Type to add PPE and press Enter"
            options={(type?.ppe || []).map((x) => ({ value: x, label: x }))} />
        </div>
      ),
    },
    {
      title: 'Gas tests',
      content: (
        <div>
          {needsGas ? (
            <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Gas testing is required for this permit"
              description="Record a test before work starts and at the intervals set by your procedure. Acceptable limits: O₂ 19.5-23.5 %, flammable gas below 10 % LEL, H₂S below 10 ppm, CO below 25 ppm. Readings outside the limits turn red — do not start work." />
          ) : (
            <Alert type="info" showIcon style={{ marginBottom: 12 }} message="Gas testing is not normally required for this permit type. Add a test if your site requires it." />
          )}
          <Table size="small" rowKey={(r, i) => i} pagination={false} dataSource={gasTests} scroll={{ x: 760 }}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No gas tests recorded yet" /> }}
            columns={[
              { title: 'Time', width: 90, render: (_, r, i) => <Input value={r.time} disabled={!editable} placeholder="06:45" onChange={(e) => setGasTests((g) => g.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))} /> },
              ...['O2', 'LEL', 'H2S', 'CO'].map((k) => ({
                title: `${gasLimits[k]?.label || k} (${gasLimits[k]?.unit || ''})`, width: 120,
                render: (_, r, i) => {
                  const ok = gasOk(k, r[k], gasLimits);
                  return <InputNumber value={r[k]} disabled={!editable} status={ok === false ? 'error' : undefined} style={{ width: '100%', borderColor: ok ? '#52c41a' : undefined }}
                    onChange={(v) => setGasTests((g) => g.map((x, j) => (j === i ? { ...x, [k]: v } : x)))} />;
                },
              })),
              { title: 'Tested by', render: (_, r, i) => <Input value={r.tester} disabled={!editable} onChange={(e) => setGasTests((g) => g.map((x, j) => (j === i ? { ...x, tester: e.target.value } : x)))} /> },
              { width: 40, render: (_, r, i) => editable && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setGasTests((g) => g.filter((_, j) => j !== i))} /> },
            ]} />
          {editable && <Button style={{ marginTop: 8 }} icon={<PlusOutlined />} onClick={() => setGasTests((g) => [...g, { time: dayjs().format('HH:mm') }])}>Add gas test</Button>}
        </div>
      ),
    },
    {
      title: 'Documents & sign-off',
      content: (
        <div>
          <Paragraph type="secondary">These supporting documents are expected for this permit type. Upload each one (PDF, image, Word or Excel) — it is stored in Document Management and linked to the permit.</Paragraph>
          {!permit?.id && <Alert type="info" showIcon style={{ marginBottom: 12 }} message="Save the draft first to upload files" action={<Button size="small" onClick={() => save()}>Save draft</Button>} />}
          {docs.map((d, i) => (
            <Space key={i} className="pm-doc" wrap>
              {d.attached ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <span className="pm-dot" />}
              <Input style={{ width: 300 }} value={d.name} disabled={!editable || d.attached} onChange={(e) => setDocs((x) => x.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} />
              {d.attached ? <Text type="success">{d.reference || 'Attached'}</Text> : (
                <Upload showUploadList={false} disabled={!permit?.id || !d.name}
                  beforeUpload={async (file) => {
                    try {
                      const res = await permitService.attach(permit.id, d.name, file);
                      setPermit(res.permit); setDocs(res.permit.data.required_documents || []);
                      message.success(`${d.name} attached`);
                    } catch (e) { message.error(e.message); }
                    return false;
                  }}>
                  <Button icon={<UploadOutlined />} disabled={!permit?.id}>Upload</Button>
                </Upload>
              )}
              {editable && !d.attached && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setDocs((x) => x.filter((_, j) => j !== i))} />}
            </Space>
          ))}
          {editable && <Button icon={<PlusOutlined />} onClick={() => setDocs((x) => [...x, { name: '', attached: false }])}>Add document</Button>}

          <Divider orientation="left" plain>Sign-off roles printed on the permit</Divider>
          <Paragraph type="secondary">Electronic signatures are collected when you send the permit for approval — choose the matching people in that step.</Paragraph>
          {signatories.map((s, i) => (
            <Space key={i} style={{ display: 'flex', marginBottom: 8 }} wrap>
              <Select style={{ width: 300 }} value={s.role} disabled={!editable}
                options={Object.entries(catalog?.signatories || {}).map(([k, v]) => ({ value: k, label: v }))}
                onChange={(v) => setSignatories((x) => x.map((y, j) => (j === i ? { ...y, role: v } : y)))} />
              <Input style={{ width: 220 }} placeholder="Name (optional)" value={s.name} disabled={!editable} onChange={(e) => setSignatories((x) => x.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} />
              {editable && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setSignatories((x) => x.filter((_, j) => j !== i))} />}
            </Space>
          ))}
          {editable && <Button icon={<PlusOutlined />} onClick={() => setSignatories((x) => [...x, { role: 'safety', name: '' }])}>Add role</Button>}
        </div>
      ),
    },
    {
      title: 'Style & finish',
      content: (
        <div>
          <Space wrap style={{ marginBottom: 12 }}>
            <Radio.Group value={style.template} disabled={!editable} optionType="button" buttonStyle="solid"
              onChange={(e) => setStyle((s) => ({ ...s, template: e.target.value }))}
              options={(catalog?.styles || []).map((s) => ({ value: s.key, label: s.label }))} />
            <label className="pm-color">Accent colour <input type="color" disabled={!editable} value={style.color || '#1677ff'} onChange={(e) => setStyle((s) => ({ ...s, color: e.target.value }))} /></label>
            <Input style={{ width: 260 }} disabled={!editable} placeholder="Company name on the permit (optional)" value={style.company_name}
              onChange={(e) => setStyle((s) => ({ ...s, company_name: e.target.value }))} />
            {editable && <Button onClick={() => goto(5)}>Refresh preview</Button>}
          </Space>
          <div className="pm-preview">
            {previewHtml ? <iframe title="Permit preview" sandbox="" srcDoc={`<!doctype html><html><body style="margin:24px">${previewHtml}</body></html>`} /> : <Spin />}
          </div>
          <Alert style={{ marginTop: 12 }} type="success" showIcon
            message="Next: create the permit document and send it for approval"
            description="“Create PDF” stores the permit in Document Management. “Create PDF and send for approval” then lets you pick who signs (your area authority, HSE officer, client representative…). The permit becomes Approved when everyone has signed, and you can then activate it." />
        </div>
      ),
    },
  ];

  return (
    <Drawer open={open} onClose={onClose} width={Math.min(1100, window.innerWidth)} destroyOnClose
      title={<Space>{permit?.permit_number && <Tag color="blue">{permit.permit_number}</Tag>}<span>{type?.name || customName || 'Custom permit'}</span>
        {permit && !editable && <Tag>{permit.status?.replace('_', ' ')} — read only</Tag>}</Space>}
      extra={editable && <Button icon={<SaveOutlined />} loading={saving} onClick={() => save()}>Save draft</Button>}
      footer={(
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Button icon={<ArrowLeftOutlined />} disabled={step === 0} onClick={() => goto(step - 1)}>Back</Button>
          {step < steps.length - 1 ? (
            <Button type="primary" onClick={() => goto(step + 1)}>Next <ArrowRightOutlined /></Button>
          ) : editable ? (
            <Space wrap>
              <Button icon={<FilePdfOutlined />} loading={saving} onClick={() => generate(false)}>Create PDF</Button>
              <Button type="primary" icon={<SendOutlined />} loading={saving} onClick={() => generate(true)}>Create PDF and send for approval</Button>
            </Space>
          ) : <Button onClick={onClose}>Close</Button>}
        </Space>
      )}>
      {type?.standards && <div className="pm-standards">Based on: {type.standards.join(' · ')}</div>}
      <Steps size="small" current={step} onChange={goto} className="pm-steps" items={steps.map((s) => ({ title: s.title }))} />
      {/* every step stays mounted (hidden when inactive) so the form keeps all values when saving from any step */}
      {steps.map((st, i) => (
        <div key={st.title} className="pm-step" style={{ display: i === step ? 'block' : 'none' }}>{st.content}</div>
      ))}
      <SubmitForApproval open={!!submitDoc} document={submitDoc} onClose={() => setSubmitDoc(null)}
        onSubmitted={async () => { setSubmitDoc(null); if (permit?.id) { const f = (await permitService.get(permit.id)).permit; setPermit(f); onSaved?.(f); } onClose?.(); }} />
    </Drawer>
  );
}

export default PermitWizard;
