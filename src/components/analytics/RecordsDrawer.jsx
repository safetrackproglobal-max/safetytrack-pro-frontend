// Review, edit and delete the manual analytics records (manpower, man-hours, LTI, accidents, injuries, report submissions).
import React, { useCallback, useEffect, useState } from 'react';
import { Drawer, Segmented, Table, Button, Space, Popconfirm, Modal, Form, Tooltip, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DatabaseOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import analyticsService from '../../services/analyticsService';
import DataEntryForms from './DataEntryForms';
import { RECORD_LABELS, RECORD_TO_FORM } from './widgetCatalog';

const { Text } = Typography;
const HIDDEN = new Set(['id', 'project_id', 'created_by', 'can_edit']);
const title = (f) => f.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const RecordsDrawer = ({ open, kind: initialKind, projectId, projects, onClose, onAdd, onChanged }) => {
  const [kind, setKind] = useState(initialKind || 'manpower');
  const [rows, setRows] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { if (open && initialKind) setKind(initialKind); }, [open, initialKind]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsService.fetchRecords(kind, projectId);
      setRows(res?.data || []);
      setFields((res?.fields || []).filter((f) => !HIDDEN.has(f)));
    } catch (e) {
      setRows([]);
      message.error('Could not load records');
    } finally {
      setLoading(false);
    }
  }, [kind, projectId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const startEdit = (r) => setEditing(r);
  // the modal renders its form in the same commit, so after it the form is connected and can be filled
  useEffect(() => {
    if (!editing) return;
    form.resetFields();
    const v = { ...editing };
    if (v.date) v.date = dayjs(v.date);
    form.setFieldsValue(v);
  }, [editing, form]);

  const save = async (values) => {
    setSaving(true);
    const body = { ...values };
    Object.keys(body).forEach((k) => { if (body[k] && typeof body[k].format === 'function') body[k] = body[k].format('YYYY-MM-DD'); });
    try {
      const res = await analyticsService.updateRecord(kind, editing.id, body);
      if (res?.success === false) throw new Error(res.error);
      message.success('Record updated');
      setEditing(null);
      load();
      onChanged();
    } catch (e) {
      message.error(e?.response?.data?.error || e?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    try {
      await analyticsService.deleteRecord(kind, r.id);
      message.success('Record deleted');
      load();
      onChanged();
    } catch (e) {
      message.error(e?.response?.data?.error || 'Could not delete');
    }
  };

  const projectName = (id) => projects.find((p) => String(p.id) === String(id))?.name;
  const columns = [
    ...fields.map((f) => ({
      title: title(f), dataIndex: f, key: f, ellipsis: true,
      render: (v) => (v === null || v === undefined || v === '' ? <Text type="secondary">—</Text> : typeof v === 'number' ? v.toLocaleString() : String(v)),
    })),
    { title: 'Project', dataIndex: 'project_id', key: 'p', ellipsis: true, render: (v) => projectName(v) || <Text type="secondary">—</Text> },
    {
      title: '', key: 'a', width: 84, fixed: 'right',
      render: (_, r) => (r.can_edit ? (
        <Space size={0}>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => startEdit(r)} /></Tooltip>
          <Popconfirm title="Delete this record?" okButtonProps={{ danger: true }} onConfirm={() => remove(r)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ) : <Tooltip title="Only the person who entered it or an admin can change it"><LockOutlined style={{ color: '#bfbfbf' }} /></Tooltip>),
    },
  ];

  return (
    <Drawer open={open} onClose={onClose} width={Math.min(900, window.innerWidth)} destroyOnClose
            title={<Space><DatabaseOutlined /> Data records</Space>}
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => onAdd(RECORD_TO_FORM[kind])}>Add {RECORD_LABELS[kind]?.toLowerCase()}</Button>}>
      <Segmented block size="small" value={kind} onChange={setKind} style={{ marginBottom: 12 }}
                 options={Object.entries(RECORD_LABELS).map(([value, label]) => ({ value, label }))} />
      <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
        {projectId && projectId !== 'all' ? 'Showing records of the selected project.' : 'Showing all records of your company (newest first, up to 500).'}
      </Text>
      <Table size="small" rowKey="id" loading={loading} dataSource={rows} columns={columns} scroll={{ x: 'max-content' }}
             pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }} />
      <Modal open={!!editing} title={`Edit ${RECORD_LABELS[kind]?.toLowerCase()} record`} footer={null}
             onCancel={() => setEditing(null)} destroyOnClose>
        <DataEntryForms type={RECORD_TO_FORM[kind]} form={form} onFinish={save} loading={saving} submitText="Save changes" />
      </Modal>
    </Drawer>
  );
};

export default RecordsDrawer;
