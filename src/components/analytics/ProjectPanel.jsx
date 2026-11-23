// Project management for the analytics page: banner for the selected project (progress, schedule, budget,
// milestones), a create/edit form and a drawer listing every project with quick actions.
import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, Progress, Tag, Space, Button, Typography, Dropdown, Tooltip, Checkbox, Input, DatePicker, Popconfirm, Empty,
  Modal, Form, Select, InputNumber, Drawer, List, Segmented, Row, Col, Statistic, message,
} from 'antd';
import {
  ProjectOutlined, EditOutlined, DeleteOutlined, PlusOutlined, CalendarOutlined, DollarOutlined, FlagOutlined,
  InboxOutlined, DownOutlined, CheckCircleTwoTone, ExclamationCircleOutlined, SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import analyticsService from '../../services/analyticsService';

const { Text, Paragraph } = Typography;

export const PROJECT_STATUS = {
  planning: { label: 'Planning', color: 'default' },
  active: { label: 'Active', color: 'processing' },
  on_hold: { label: 'On hold', color: 'warning' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
  archived: { label: 'Archived', color: 'default' },
};
const PRIORITY_COLOR = { low: 'green', medium: 'blue', high: 'orange', critical: 'red' };
const errText = (e, fallback) => e?.response?.data?.error || e?.data?.error || e?.message || fallback;
const money = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 }));

export const StatusTag = ({ status }) => {
  const s = PROJECT_STATUS[status] || { label: status || 'unknown', color: 'default' };
  return <Tag color={s.color}>{s.label}</Tag>;
};

// ------------------------------------------------------------------ form (create + edit)
export const ProjectFormModal = ({ open, project, departments, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const editing = !!project?.id;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (project) {
      form.setFieldsValue({
        ...project,
        dates: [project.start_date ? dayjs(project.start_date) : null, project.end_date ? dayjs(project.end_date) : null],
        tags: project.tags || [],
      });
    } else {
      form.setFieldsValue({ status: 'active', priority: 'medium', dates: [dayjs(), null] });
    }
  }, [open, project, form]);

  const submit = async (v) => {
    setSaving(true);
    const body = {
      name: v.name, description: v.description || '', status: v.status, priority: v.priority,
      start_date: v.dates?.[0] ? v.dates[0].format('YYYY-MM-DD') : null,
      end_date: v.dates?.[1] ? v.dates[1].format('YYYY-MM-DD') : null,
      budget: v.budget ?? null, department: v.department || null, tags: v.tags || [],
    };
    if (editing) body.actual_cost = v.actual_cost ?? null;
    try {
      const res = editing ? await analyticsService.updateProject(project.id, body) : await analyticsService.createProject(body);
      if (res?.success === false) throw new Error(res.error);
      message.success(editing ? 'Project updated' : 'Project created');
      onSaved(editing ? res.data : { id: res?.data?.id ?? res?.id, ...body });
    } catch (e) {
      message.error(errText(e, 'Could not save the project'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={<Space><ProjectOutlined />{editing ? `Edit project — ${project.name}` : 'New project'}</Space>}
           onCancel={onClose} onOk={() => form.submit()} okText={editing ? 'Save changes' : 'Create project'}
           confirmLoading={saving} width={640} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={submit} requiredMark="optional">
        <Form.Item name="name" label="Project name" rules={[{ required: true, whitespace: true, message: 'Enter a project name' }, { max: 255 }]}>
          <Input placeholder="e.g. Tema plant expansion" />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ max: 5000 }]}>
          <Input.TextArea rows={3} placeholder="Scope and safety goals of the project" />
        </Form.Item>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item name="status" label="Status">
              <Select options={Object.entries(PROJECT_STATUS).map(([value, s]) => ({ value, label: s.label }))} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="priority" label="Priority">
              <Select options={['low', 'medium', 'high', 'critical'].map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="dates" label="Start and end date"
                   rules={[{ validator: (_, v) => (v?.[0] && v?.[1] && v[1].isBefore(v[0]) ? Promise.reject(new Error('End date must be after the start date')) : Promise.resolve()) }]}>
          <DatePicker.RangePicker style={{ width: '100%' }} allowEmpty={[true, true]} />
        </Form.Item>
        <Row gutter={12}>
          <Col xs={24} sm={editing ? 8 : 12}>
            <Form.Item name="department" label="Department">
              <Select allowClear showSearch placeholder="Any department"
                      options={departments.map((d) => ({ value: d.name, label: d.name }))} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={editing ? 8 : 12}>
            <Form.Item name="budget" label="Budget"><InputNumber min={0} style={{ width: '100%' }} placeholder="optional" /></Form.Item>
          </Col>
          {editing && (
            <Col xs={12} sm={8}>
              <Form.Item name="actual_cost" label="Spent so far"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            </Col>
          )}
        </Row>
        <Form.Item name="tags" label="Tags">
          <Select mode="tags" maxCount={20} placeholder="Type and press Enter" tokenSeparators={[',']} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ------------------------------------------------------------------ selected project banner
export const ProjectBanner = ({ project, onEdit, onChanged, onDelete }) => {
  const [adding, setAdding] = useState(false);
  const [msTitle, setMsTitle] = useState('');
  const [msDate, setMsDate] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!project) return null;
  const can = !!project.can_manage;

  const run = async (fn, ok) => {
    setBusy(true);
    try {
      const res = await fn();
      if (res?.success === false) throw new Error(res.error);
      if (ok) message.success(ok);
      onChanged(res?.data);
      return true;
    } catch (e) {
      message.error(errText(e, 'Could not save'));
      return false;
    } finally {
      setBusy(false);
    }
  };
  const setStatus = (status) => run(() => analyticsService.updateProject(project.id, { status }), 'Status updated');
  const addMilestone = () => {
    if (!msTitle.trim() || !msDate) { message.warning('Enter a milestone title and due date'); return; }
    run(() => analyticsService.addMilestone(project.id, { title: msTitle.trim(), due_date: msDate.format('YYYY-MM-DD') }), 'Milestone added')
      .then((ok) => { if (ok) { setMsTitle(''); setMsDate(null); setAdding(false); } });
  };
  const late = project.late;
  const ms = project.milestones || [];
  const progressColor = late ? '#f5222d' : project.progress >= 100 ? '#52c41a' : undefined;

  return (
    <Card className="pbi-project" size="small" loading={false}>
      <div className="pbi-project-head">
        <div className="pbi-project-title">
          <ProjectOutlined className="pbi-project-icon" />
          <div style={{ minWidth: 0 }}>
            <Space wrap size={6}>
              <Text strong className="pbi-project-name">{project.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{project.project_number}</Text>
              {can ? (
                <Dropdown trigger={['click']} menu={{ items: Object.entries(PROJECT_STATUS).map(([k, s]) => ({ key: k, label: s.label })), onClick: ({ key }) => setStatus(key), selectedKeys: [project.status] }}>
                  <span className="pbi-clickable"><StatusTag status={project.status} /><DownOutlined style={{ fontSize: 10 }} /></span>
                </Dropdown>
              ) : <StatusTag status={project.status} />}
              {project.priority && <Tag color={PRIORITY_COLOR[project.priority]}>{project.priority} priority</Tag>}
              {late && <Tag color="red" icon={<ExclamationCircleOutlined />}>Past end date</Tag>}
              {(project.tags || []).map((t) => <Tag key={t} bordered={false}>{t}</Tag>)}
            </Space>
            {project.description && <Paragraph type="secondary" ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} style={{ margin: '4px 0 0' }}>{project.description}</Paragraph>}
          </div>
        </div>
        {can && (
          <Space wrap>
            <Button size="small" icon={<EditOutlined />} onClick={onEdit}>Edit</Button>
            <Popconfirm title="Delete this project?" description="Analytics records and incidents stay, they are just no longer linked to it."
                        okButtonProps={{ danger: true }} okText="Delete" onConfirm={onDelete}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )}
      </div>

      <Row gutter={[16, 12]} className="pbi-project-stats">
        <Col xs={24} md={9}>
          <Text type="secondary" style={{ fontSize: 12 }}>Progress <Tooltip title={`Based on ${project.progress_basis}`}><Text type="secondary" style={{ fontSize: 11 }}>({project.progress_basis})</Text></Tooltip></Text>
          <Progress percent={project.progress} strokeColor={progressColor} size="small" />
          {project.tasks?.total > 0 && <Text type="secondary" style={{ fontSize: 12 }}>{project.tasks.done}/{project.tasks.total} tasks done{project.tasks.overdue ? `, ${project.tasks.overdue} overdue` : ''}</Text>}
        </Col>
        <Col xs={12} md={5}>
          <Statistic title={<span><CalendarOutlined /> Schedule</span>} valueStyle={{ fontSize: 16, color: late ? '#f5222d' : undefined }}
                     value={project.days_remaining === null || project.days_remaining === undefined ? 'No end date' : project.days_remaining >= 0 ? `${project.days_remaining} days left` : `${-project.days_remaining} days late`} />
          <Text type="secondary" style={{ fontSize: 11 }}>{project.start_date || '?'} → {project.end_date || '?'}</Text>
        </Col>
        <Col xs={12} md={5}>
          <Statistic title={<span><DollarOutlined /> Budget</span>} valueStyle={{ fontSize: 16 }} value={money(project.budget)} />
          {project.budget_used_pct !== undefined && (
            <Progress percent={Math.min(100, project.budget_used_pct)} size="small" showInfo={false}
                      strokeColor={project.budget_used_pct > 100 ? '#f5222d' : project.budget_used_pct > 85 ? '#faad14' : '#52c41a'} />
          )}
          {project.budget_used_pct !== undefined && <Text type="secondary" style={{ fontSize: 11 }}>{money(project.actual_cost)} spent ({project.budget_used_pct}%)</Text>}
        </Col>
        <Col xs={24} md={5}>
          <Statistic title={<span><FlagOutlined /> Milestones</span>} valueStyle={{ fontSize: 16 }}
                     value={`${ms.filter((m) => m.status === 'achieved').length} / ${ms.length}`} />
          {ms.some((m) => m.overdue) && <Text type="danger" style={{ fontSize: 11 }}>{ms.filter((m) => m.overdue).length} overdue</Text>}
        </Col>
      </Row>

      <div className="pbi-milestones">
        {ms.map((m) => (
          <div key={m.id} className={`pbi-milestone ${m.overdue ? 'overdue' : ''}`}>
            <Checkbox checked={m.status === 'achieved'} disabled={!can || busy}
                      onChange={(e) => run(() => analyticsService.updateMilestone(m.id, { status: e.target.checked ? 'achieved' : 'pending' }))}>
              <Text delete={m.status === 'achieved'}>{m.title}</Text>
            </Checkbox>
            <Text type={m.overdue ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>{m.status === 'achieved' ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : null} {m.due_date}</Text>
            {can && (
              <Popconfirm title="Remove milestone?" onConfirm={() => run(() => analyticsService.deleteMilestone(m.id), 'Milestone removed')}>
                <Button type="text" size="small" icon={<DeleteOutlined />} aria-label="Remove milestone" />
              </Popconfirm>
            )}
          </div>
        ))}
        {can && (adding ? (
          <Space.Compact style={{ width: '100%', maxWidth: 520 }}>
            <Input placeholder="Milestone, e.g. Scaffolding inspected" value={msTitle} maxLength={255} onChange={(e) => setMsTitle(e.target.value)} onPressEnter={addMilestone} />
            <DatePicker value={msDate} onChange={setMsDate} placeholder="Due" />
            <Button type="primary" loading={busy} onClick={addMilestone}>Add</Button>
            <Button onClick={() => setAdding(false)}>Cancel</Button>
          </Space.Compact>
        ) : (
          <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => setAdding(true)}>Add milestone</Button>
        ))}
      </div>
    </Card>
  );
};

// ------------------------------------------------------------------ all projects
export const ProjectsDrawer = ({ open, projects, selected, onClose, onSelect, onCreate, onEdit, onReload }) => {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('open');
  const list = useMemo(() => projects.filter((p) => {
    if (status === 'open' && ['completed', 'cancelled', 'archived'].includes(p.status)) return false;
    if (status !== 'open' && status !== 'all' && p.status !== status) return false;
    const s = q.trim().toLowerCase();
    return !s || `${p.name} ${p.project_number} ${p.department || ''} ${(p.tags || []).join(' ')}`.toLowerCase().includes(s);
  }), [projects, q, status]);

  const act = async (fn, ok) => {
    try {
      const res = await fn();
      if (res?.success === false) throw new Error(res.error);
      message.success(ok);
      onReload();
    } catch (e) {
      message.error(errText(e, 'Action failed'));
    }
  };

  return (
    <Drawer open={open} onClose={onClose} width={520} title={<Space><ProjectOutlined /> Projects</Space>}
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>New project</Button>}>
      <Input prefix={<SearchOutlined />} placeholder="Search name, number, tag…" allowClear value={q} onChange={(e) => setQ(e.target.value)} />
      <Segmented block size="small" style={{ margin: '10px 0' }} value={status} onChange={setStatus}
                 options={[{ value: 'open', label: 'Open' }, { value: 'completed', label: 'Done' }, { value: 'archived', label: 'Archived' }, { value: 'all', label: 'All' }]} />
      {!list.length ? <Empty description={projects.length ? 'No project matches' : 'No projects yet'} /> : (
        <List dataSource={list} rowKey="id" renderItem={(p) => (
          <List.Item className={`pbi-project-row ${String(selected) === String(p.id) ? 'selected' : ''}`}
                     actions={[
                       <Tooltip title="Edit" key="e"><Button size="small" type="text" icon={<EditOutlined />} onClick={() => onEdit(p)} /></Tooltip>,
                       <Dropdown key="m" trigger={['click']} menu={{
                         items: [
                           ...Object.entries(PROJECT_STATUS).filter(([k]) => k !== p.status).map(([k, s]) => ({ key: `s:${k}`, label: `Mark ${s.label.toLowerCase()}`, icon: k === 'archived' ? <InboxOutlined /> : null })),
                           { type: 'divider' },
                           { key: 'del', danger: true, icon: <DeleteOutlined />, label: 'Delete…' },
                         ],
                         onClick: ({ key }) => {
                           if (key.startsWith('s:')) act(() => analyticsService.updateProject(p.id, { status: key.slice(2) }), 'Status updated');
                           else Modal.confirm({
                             title: `Delete "${p.name}"?`, okType: 'danger', okText: 'Delete',
                             content: 'Analytics records and incidents stay, they are just no longer linked to this project.',
                             onOk: () => act(() => analyticsService.deleteProject(p.id), 'Project deleted'),
                           });
                         },
                       }}><Button size="small" type="text" icon={<DownOutlined />} /></Dropdown>,
                     ]}>
            <List.Item.Meta
              title={<button type="button" className="pbi-link" onClick={() => onSelect(p.id)}>{p.name}</button>}
              description={<Space size={4} wrap><StatusTag status={p.status} />{p.priority && <Tag color={PRIORITY_COLOR[p.priority]} bordered={false}>{p.priority}</Tag>}
                {p.end_date && !['completed', 'cancelled', 'archived'].includes(p.status) && dayjs(p.end_date).isBefore(dayjs(), 'day') && <Tag color="red" bordered={false}>late</Tag>}
                <Text type="secondary" style={{ fontSize: 12 }}>{p.project_number}{p.end_date ? ` · due ${p.end_date.slice(0, 10)}` : ''}</Text></Space>} />
          </List.Item>
        )} />
      )}
    </Drawer>
  );
};
