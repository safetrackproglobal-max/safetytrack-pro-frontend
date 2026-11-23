// src/components/submissions/SendToDocumentControl.js
// Links other modules (AI document generator, incident reports) to Document Management:
// save the real content as a document (HTML + PDF), optionally send it straight for approval.
import React, { useState } from 'react';
import { Button, Dropdown, Switch, Space, Tooltip, message } from 'antd';
import { FolderAddOutlined, SendOutlined, DownOutlined } from '@ant-design/icons';
import api from '../../services/api';
import SubmitForApproval from './SubmitForApproval';

const AUTO_KEYS = { ai: 'autoAddAIDocsToDM', incident: 'autoAddIncidentReportsToDM' };

export const getAutoAdd = (kind) => {
  try { return localStorage.getItem(AUTO_KEYS[kind]) === '1'; } catch (e) { return false; }
};
export const setAutoAdd = (kind, on) => {
  try { localStorage.setItem(AUTO_KEYS[kind], on ? '1' : '0'); } catch (e) { /* ignore */ }
};

const post = async (url, data) => {
  const res = await api.post(url, data, { validateStatus: () => true });
  if (res.status >= 200 && res.status < 300 && res.data?.success !== false) return res.data;
  throw new Error(res.data?.error || 'Could not save to Document Management');
};

// Save an AI-generated document (its HTML) into Document Management.
export const importGeneratedDocument = ({ title, html, documentType, module, meta }) =>
  post('/documents/import-generated', { title, html, document_type: documentType, module, meta });

// Create / refresh the incident report document.
export const incidentToDocument = (incidentId) => post(`/incidents/${incidentId}/to-document`, {});

export function AutoAddSwitch({ kind, label }) {
  const [on, setOn] = useState(getAutoAdd(kind));
  return (
    <Tooltip title="When on, every new one is saved to Document Management automatically (this browser).">
      <Space size={6}>
        <Switch size="small" checked={on} onChange={(v) => { setOn(v); setAutoAdd(kind, v); message.success(v ? 'Will be added automatically' : 'Automatic adding turned off'); }} />
        <span style={{ fontSize: 12 }}>{label || 'Always add to Document Management'}</span>
      </Space>
    </Tooltip>
  );
}

/**
 * Button: "Add to Document Management" with a menu option "Add and send for approval".
 * Either pass `save` (async () => { document_id, title }) or AI props (title/html/documentType...).
 */
function SendToDocumentControl({ save, title, html, documentType = 'report', module = 'hse', meta, size = 'small', onSaved }) {
  const [busy, setBusy] = useState(false);
  const [submitDoc, setSubmitDoc] = useState(null);

  const run = async (thenSend) => {
    setBusy(true);
    try {
      const res = save ? await save() : await importGeneratedDocument({ title, html, documentType, module, meta });
      message.success(res.message || 'Saved to Document Management');
      onSaved?.(res);
      if (thenSend) setSubmitDoc({ id: res.document_id, title: res.title || title });
    } catch (e) { message.error(e.message, 6); }
    finally { setBusy(false); }
  };

  return (
    <>
      <Dropdown.Button size={size} loading={busy} onClick={() => run(false)} icon={<DownOutlined />}
        menu={{ items: [{ key: 'send', icon: <SendOutlined />, label: 'Add and send for approval…', onClick: () => run(true) }] }}>
        <FolderAddOutlined /> Add to Document Management
      </Dropdown.Button>
      <SubmitForApproval open={!!submitDoc} document={submitDoc} onClose={() => setSubmitDoc(null)} />
    </>
  );
}

export default SendToDocumentControl;
