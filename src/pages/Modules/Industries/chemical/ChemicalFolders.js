// Chemical document folders: PTW, risk assessments, COSHH, SDS, procedures, emergency plans, waste notes, training.
// They are ordinary Document Management documents (module "chemical"), so approval, versions, read & acknowledge and
// company access all come from Document Management. Confidential documents are shown to supervisors and the uploader only.
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, Badge, Button, Card, Checkbox, Col, Empty, Form, Input, Modal, Row, Select, Skeleton, Space, Table, Tag, Typography, Upload, message } from 'antd';
import { FileAddOutlined, FolderOpenOutlined, FolderOutlined, LockOutlined, RobotOutlined, UploadOutlined } from '@ant-design/icons';
import chemicalService, { chemErr } from '../../../../services/chemicalService';
import documentService from '../../../../services/documentService';

const { Text, Paragraph } = Typography;
const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt';

const ChemicalFolders = () => {
  const history = useHistory();
  const [d, setD] = useState(null);
  const [open, setOpen] = useState('ptw');
  const [adding, setAdding] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const load = useCallback(() => {
    chemicalService.folders().then((r) => setD(r.data)).catch((e) => { setD({ folders: [] }); message.error(chemErr(e)); });
  }, []);
  useEffect(() => { load(); }, [load]);
  const startAdd = () => { form.resetFields(); form.setFieldsValue({ folder: open, is_confidential: false }); setFile(null); setAdding(true); };
  const upload = async () => {
    const v = await form.validateFields();
    if (!file) { message.error('Choose the file'); return; }
    setBusy(true);
    try {
      await documentService.createDocument({ title: v.title, document_type: v.folder, category: v.folder, module: 'chemical', description: v.description,
        is_confidential: !!v.is_confidential, file });
      message.success('Added. It is also in Document Management, where approval and versions are handled.');
      setAdding(false); setOpen(v.folder); load();
    } catch (e) { message.error(e?.response?.data?.error || chemErr(e)); } finally { setBusy(false); }
  };
  if (!d) return <Skeleton active />;
  const cur = d.folders.find((f) => f.key === open) || d.folders[0];
  return (
    <div>
      <Space wrap style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<FileAddOutlined />} onClick={startAdd}>Add a document</Button>
        <Button icon={<RobotOutlined />} onClick={() => history.push('/ai-documents')}>Write one with AI</Button>
        <Button onClick={() => history.push('/document-management')}>Open Document Management</Button>
      </Space>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8} lg={7}>
          <Card size="small" style={{ borderRadius: 12 }} styles={{ body: { padding: 4 } }}>
            {d.folders.map((f) => (
              <div key={f.key} role="button" tabIndex={0} onClick={() => setOpen(f.key)} onKeyDown={(e) => e.key === 'Enter' && setOpen(f.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: f.key === open ? '#e6f4ff' : undefined }}>
                {f.key === open ? <FolderOpenOutlined style={{ color: '#1677ff' }} /> : <FolderOutlined />}
                <span style={{ flex: 1, minWidth: 0 }}>{f.name}</span>
                <Badge count={f.documents.length} showZero color={f.documents.length ? '#1677ff' : '#d9d9d9'} />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={16} lg={17}>
          <Card size="small" style={{ borderRadius: 12 }} title={cur?.name}>
            <Table rowKey="id" size="small" pagination={{ pageSize: 15, showSizeChanger: false }} dataSource={cur?.documents || []} scroll={{ x: 520 }}
              onRow={(r) => ({ onClick: () => history.push(`/document-management?tab=documents&doc=${r.id}`), style: { cursor: 'pointer' } })}
              locale={{ emptyText: <Empty description="No documents in this folder yet" /> }}
              columns={[
                { title: 'Title', dataIndex: 'title', render: (t, r) => <span>{r.confidential && <LockOutlined title="Confidential" style={{ marginRight: 6 }} />}{t}</span> },
                { title: 'Status', dataIndex: 'status', width: 110, render: (s) => (s ? <Tag>{s}</Tag> : null) },
                { title: 'Review / expiry', width: 140, render: (_, r) => {
                  const dt = r.expires_at || r.next_review_date;
                  if (!dt) return <Text type="secondary">-</Text>;
                  const late = new Date(dt) < new Date();
                  return <Text type={late ? 'danger' : undefined}>{new Date(dt).toLocaleDateString()}{late ? ' (due)' : ''}</Text>;
                } },
                { title: 'Updated', dataIndex: 'updated_at', width: 110, render: (u) => (u ? new Date(u).toLocaleDateString() : '') },
              ]} />
          </Card>
          {!d.can_see_confidential && <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>Confidential documents are shown to supervisors and to the person who added them.</Paragraph>}
        </Col>
      </Row>
      <Modal open={adding} title="Add a chemical document" onCancel={() => setAdding(false)} onOk={upload} okText="Upload" confirmLoading={busy}>
        <Form form={form} layout="vertical">
          <Form.Item name="folder" label="Folder" rules={[{ required: true }]}><Select options={d.folders.map((f) => ({ value: f.key, label: f.name }))} /></Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true, min: 3 }]}><Input maxLength={200} /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea maxLength={2000} autoSize={{ minRows: 2, maxRows: 4 }} /></Form.Item>
          <Form.Item label="File" required>
            <Upload accept={ACCEPT} maxCount={1} beforeUpload={(f) => { setFile(f); return false; }} onRemove={() => setFile(null)} fileList={file ? [{ uid: '1', name: file.name, status: 'done' }] : []}>
              <Button icon={<UploadOutlined />}>Choose file</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="is_confidential" valuePropName="checked"><Checkbox>Confidential (supervisors and admins only)</Checkbox></Form.Item>
        </Form>
        <Alert type="info" showIcon message="The document goes through your Document Management approval like any other document." />
      </Modal>
    </div>
  );
};

export default ChemicalFolders;
