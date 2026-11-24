// SafetyPro team: set the price each company pays. The company admin then pays it on /payment.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import api from '../services/api';
import { DURATION_OPTIONS, durationPer, formatPrice } from '../constants/accountFlow';
import { errText } from '../utils/billingStage';

const { Text } = Typography;
const LABEL = { enterprise: 'Enterprise', custom: 'Custom' };

function CompanyQuotes() {
  const [rows, setRows] = useState([]);
  const [currencies, setCurrencies] = useState(['GHS', 'USD']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async (term = '') => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/company-quotes', { params: term ? { search: term } : {} });
      setRows(data.companies || []);
      if (data.currencies) setCurrencies(data.currencies);
    } catch (e) {
      setError(errText(e, 'Could not load company prices.'));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (r) => {
    const from = r.request || r.quote || {};
    setEdit(r);
    form.setFieldsValue({
      plan: from.plan || (r.plan === 'custom' ? 'custom' : 'enterprise'),
      billing_cycle: from.billing_cycle || '1_year',
      currency: r.quote?.currency || (r.country === 'Ghana' ? 'GHS' : 'USD'),
      amount: r.quote?.amount,
      note: r.quote?.note || '',
    });
  };
  const save = async () => {
    const v = await form.validateFields().catch(() => null);
    if (!v) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/admin/companies/${edit.company_id}/quote`, v);
      message.success(data.emails_sent ? 'Price saved. The company admin was emailed.' : 'Price saved. No email was sent, so please tell the company admin.');
      setEdit(null);
      load(search);
    } catch (e) {
      message.error(errText(e, 'Could not save the price.'));
    } finally { setSaving(false); }
  };
  const withdraw = async (r) => {
    try {
      await api.delete(`/admin/companies/${r.company_id}/quote`);
      message.success('Price withdrawn');
      load(search);
    } catch (e) {
      message.error(errText(e, 'Could not withdraw the price.'));
    }
  };

  const columns = [
    { title: 'Company', key: 'c', render: (_, r) => <><Text strong>{r.name}</Text><br /><Text type="secondary">{r.email}</Text></> },
    { title: 'Country', dataIndex: 'country', responsive: ['lg'] },
    { title: 'Plan', key: 'p', render: (_, r) => <Space direction="vertical" size={2}><span>{LABEL[r.plan] || r.plan}</span><Tag color={r.status === 'active' ? 'green' : 'orange'}>{r.status}</Tag></Space> },
    { title: 'Paid until', key: 'e', responsive: ['md'], render: (_, r) => (r.ends_at ? new Date(r.ends_at).toLocaleDateString() : 'No date') },
    { title: 'Agreed price', key: 'q', render: (_, r) => (r.quote ? `${formatPrice(r.quote.amount, r.quote.currency)} per ${durationPer(r.quote.billing_cycle)}` : 'None') },
    {
      title: 'Request',
      key: 'r',
      render: (_, r) => (r.request ? (
        <div style={{ maxWidth: 260 }}>
          <Tag color="blue">Waiting</Tag>{LABEL[r.request.plan]}, per {durationPer(r.request.billing_cycle)}
          {r.request.request_note && <div><Text type="secondary">{r.request.request_note}</Text></div>}
        </div>
      ) : null),
    },
    {
      title: '',
      key: 'a',
      render: (_, r) => (
        <Space wrap>
          <Button type={r.request ? 'primary' : 'default'} onClick={() => open(r)}>{r.quote ? 'Change price' : 'Set price'}</Button>
          {r.quote && (
            <Popconfirm title="Withdraw this price?" description="The company cannot pay until you set a new one." onConfirm={() => withdraw(r)}>
              <Button danger>Withdraw</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space wrap style={{ marginBottom: 14 }}>
        <Input.Search placeholder="Company or email" allowClear onSearch={(v) => { setSearch(v); load(v); }} style={{ width: 260 }} />
        <Button icon={<ReloadOutlined />} onClick={() => load(search)}>Refresh</Button>
      </Space>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 14 }} />}
      <Table rowKey="company_id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 20 }} />
      <Modal open={!!edit} title={edit ? `Price for ${edit.name}` : ''} onCancel={() => setEdit(null)} onOk={save} confirmLoading={saving} okText="Save price" forceRender>
        <Form form={form} layout="vertical">
          <Form.Item name="plan" label="Plan" rules={[{ required: true }]}><Select options={[{ value: 'enterprise', label: 'Enterprise' }, { value: 'custom', label: 'Custom' }]} /></Form.Item>
          <Form.Item name="billing_cycle" label="Billing period" rules={[{ required: true }]}><Select options={DURATION_OPTIONS.map((d) => ({ value: d.value, label: d.label }))} /></Form.Item>
          <Form.Item name="currency" label="Currency" extra="Paystack takes GHS, USD, NGN, ZAR and KES if your account has that currency. Other currencies use PayPal or bank transfer." rules={[{ required: true }]}><Select options={currencies.map((c) => ({ value: c, label: c }))} /></Form.Item>
          <Form.Item name="amount" label="Amount for the whole billing period" rules={[{ required: true, message: 'Enter the amount' }]}><InputNumber min={1} max={10000000} precision={2} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="note" label="Note shown to the company (optional)"><Input.TextArea rows={2} maxLength={1000} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default CompanyQuotes;
