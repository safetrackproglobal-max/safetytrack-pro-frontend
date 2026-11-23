// src/components/submissions/ClientsManager.js
// Company admins add client organisations (e.g. QatarEnergy) and invite their reviewers.
import React, { useCallback, useEffect, useState } from 'react';
import {
  Card, Button, Modal, Form, Input, Table, Tag, Space, Alert, Empty, Popconfirm, Switch, message, Typography, Steps, Spin,
} from 'antd';
import { PlusOutlined, UserAddOutlined, MailOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import submissionService from '../../services/submissionService';
import './Submissions.css';

const { Text } = Typography;

function ClientsManager() {
  const [clients, setClients] = useState([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orgModal, setOrgModal] = useState(false);
  const [inviteFor, setInviteFor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [orgForm] = Form.useForm();
  const [inviteForm] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await submissionService.listClients();
      setClients(res.clients || []);
      setCanManage(!!res.can_manage);
    } catch (e) { message.error(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const createOrg = async () => {
    const v = await orgForm.validateFields();
    setBusy(true);
    try {
      await submissionService.createClient(v);
      message.success(`${v.name} added. Now invite the people who will review your documents.`);
      setOrgModal(false); orgForm.resetFields(); load();
    } catch (e) { message.error(e.message); }
    finally { setBusy(false); }
  };

  const invite = async () => {
    const v = await inviteForm.validateFields();
    setBusy(true);
    try {
      const res = await submissionService.inviteMember(inviteFor.id, v);
      message.success(res.status === 'invited' ? `Invitation emailed to ${v.email}` : res.message);
      setInviteFor(null); inviteForm.resetFields(); load();
    } catch (e) { message.error(e.message); }
    finally { setBusy(false); }
  };

  const memberColumns = (org) => [
    { title: 'Name', dataIndex: 'name', render: (v, m) => <span><b>{v}</b>{m.job_title ? <Text type="secondary"> · {m.job_title}</Text> : null}</span> },
    { title: 'Email', dataIndex: 'email', responsive: ['md'] },
    {
      title: 'Status', dataIndex: 'status', width: 170,
      render: (v) => (v === 'active'
        ? <Tag color="success">Active</Tag>
        : <Tag color="warning">Invitation sent</Tag>),
    },
    ...(canManage ? [{
      title: '', key: 'a', width: 190,
      render: (_, m) => (
        <Space>
          {m.status === 'invited' && (
            <Button size="small" icon={<MailOutlined />} onClick={async () => {
              try { await submissionService.resendInvite(org.id, m.id); message.success('Invitation sent again'); }
              catch (e) { message.error(e.message); }
            }}>Resend</Button>
          )}
          <Popconfirm title={`Remove ${m.name}?`} description="They will no longer be able to receive new documents from you." okText="Remove"
            onConfirm={async () => { try { await submissionService.removeMember(org.id, m.id); load(); } catch (e) { message.error(e.message); } }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Steps size="small" items={[
          { title: 'Add the client', description: 'e.g. QatarEnergy and the project name' },
          { title: 'Invite reviewers', description: 'They get an email to create a free login' },
          { title: 'Send documents', description: 'Choose them when you send for approval' },
        ]} />
        <Alert type="info" showIcon style={{ marginTop: 16 }}
          message="Client reviewers are free"
          description="They do not use your team seats. They only see the documents you send them — never your other documents, dashboards or data." />
      </Card>

      <Space style={{ marginBottom: 12 }}>
        {canManage
          ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setOrgModal(true)}>Add client</Button>
          : <Text type="secondary">Only company administrators can add clients or invite reviewers.</Text>}
      </Space>

      {loading ? <Spin /> : !clients.length ? (
        <Empty description="No clients yet" />
      ) : clients.map((org) => (
        <Card key={org.id} style={{ marginBottom: 12 }}
          title={<Space><TeamOutlined /><b>{org.name}</b>{org.project_name && <Text type="secondary">· {org.project_name}</Text>}{!org.is_active && <Tag>Deactivated</Tag>}</Space>}
          extra={canManage && (
            <Space>
              <Switch checkedChildren="Active" unCheckedChildren="Off" checked={org.is_active}
                onChange={async (v) => { await submissionService.updateClient(org.id, { is_active: v }); load(); }} />
              <Button icon={<UserAddOutlined />} disabled={!org.is_active} onClick={() => setInviteFor(org)}>Invite reviewer</Button>
            </Space>
          )}>
          {org.members.length
            ? <Table size="small" rowKey="id" pagination={false} dataSource={org.members} columns={memberColumns(org)} />
            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No reviewers yet — invite the people who must sign your documents" />}
        </Card>
      ))}

      <Modal open={orgModal} title="Add a client organisation" okText="Add client" onOk={createOrg} confirmLoading={busy} onCancel={() => setOrgModal(false)} destroyOnClose>
        <Form form={orgForm} layout="vertical">
          <Form.Item name="name" label="Client organisation" rules={[{ required: true, min: 2, message: 'Enter the client name' }]}>
            <Input placeholder="e.g. QatarEnergy" maxLength={255} />
          </Form.Item>
          <Form.Item name="project_name" label="Project (optional)"><Input placeholder="e.g. North Field East — Offshore" maxLength={255} /></Form.Item>
          <Form.Item name="contact_email" label="General contact email (optional)" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
            <Input placeholder="documents@client.com" />
          </Form.Item>
          <Form.Item name="notes" label="Notes (optional)"><Input.TextArea rows={2} maxLength={2000} /></Form.Item>
        </Form>
      </Modal>

      <Modal open={!!inviteFor} title={inviteFor ? `Invite a reviewer from ${inviteFor.name}` : ''} okText="Send invitation" onOk={invite}
        confirmLoading={busy} onCancel={() => setInviteFor(null)} destroyOnClose>
        <Alert type="info" showIcon style={{ marginBottom: 12 }}
          message="What happens next"
          description="They receive an email with a link to create a password (valid 14 days). After that they can sign or stamp the documents you send them. If they already have a SafeTrack Pro account, they are added straight away." />
        <Form form={inviteForm} layout="vertical">
          <Form.Item name="name" label="Full name" rules={[{ required: true, min: 2, message: "Enter the person's name" }]}><Input placeholder="e.g. Ahmed Ali" /></Form.Item>
          <Form.Item name="email" label="Work email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}><Input placeholder="ahmed.ali@client.com" /></Form.Item>
          <Form.Item name="job_title" label="Job title (optional)"><Input placeholder="e.g. HSE Lead" maxLength={128} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ClientsManager;
