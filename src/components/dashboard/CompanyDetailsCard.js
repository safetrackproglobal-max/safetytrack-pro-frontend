// Company contact details — editable by company admins (validated on the server too).
import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, Button, Row, Col, Skeleton, Alert, Space, message, Typography } from 'antd';
import { BankOutlined, SaveOutlined } from '@ant-design/icons';
import dashboardService from '../../services/dashboardService';
import { INDUSTRY_OPTIONS } from '../../constants/accountFlow';

const { Text } = Typography;
const ZONES = (typeof Intl !== 'undefined' && Intl.supportedValuesOf) ? Intl.supportedValuesOf('timeZone') : ['UTC', 'Africa/Accra', 'Europe/London'];

const CompanyDetailsCard = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let alive = true;
    dashboardService.getCompanyInfo()
      .then((res) => {
        if (!alive) return;
        const d = res?.data || {};
        setInfo(d);
        form.setFieldsValue({ name: d.name, email: d.email, phone: d.phone, website: d.website, address: d.address,
          industry: d.industry, timezone: d.timezone || undefined });
      })
      .catch(() => alive && setError('Could not load company details'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [form]);

  const save = async (values) => {
    setSaving(true);
    try {
      const res = await dashboardService.updateCompany(values);
      if (res?.success === false) throw new Error(res.error);
      message.success('Company details saved');
      setInfo(res.data);
    } catch (e) {
      const errs = e?.response?.data?.errors;
      if (errs) form.setFields(Object.entries(errs).map(([name, msg]) => ({ name, errors: [msg] })));
      message.error(e?.response?.data?.error || e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title={<Space><BankOutlined /> Company details</Space>}
          extra={info?.employee_count !== undefined && <Text type="secondary">{info.employee_count} users · {info.departments ?? 0} departments</Text>}>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} />}
      {loading ? <Skeleton active /> : (
        <Form form={form} layout="vertical" onFinish={save} requiredMark="optional">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Company name" rules={[{ required: true, whitespace: true }, { max: 255 }, { pattern: /^[^<>]*$/, message: 'Angle brackets are not allowed' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="industry" label="Industry">
                <Select showSearch options={INDUSTRY_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Company email" rules={[{ type: 'email' }]}><Input /></Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Phone" rules={[{ pattern: /^[+\d\s()-]{7,20}$/, message: '7–20 characters: digits, spaces, + ( ) -' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="website" label="Website" rules={[{ pattern: /^https?:\/\/\S+$/, message: 'Start with http:// or https://' }]}>
                <Input placeholder="https://" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="timezone" label="Company time zone">
                <Select showSearch allowClear options={ZONES.map((z) => ({ value: z, label: z.replace(/_/g, ' ') }))} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="address" label="Address" rules={[{ max: 500 }]}><Input.TextArea rows={2} /></Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>Save company details</Button>
        </Form>
      )}
    </Card>
  );
};

export default CompanyDetailsCard;
