// src/pages/ContactTeamPage.js
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';

function ContactTeamPage() {
  const onFinish = (values) => {
    console.log('Contact form:', values);
    message.success('Thank you! Our team will contact you soon.');
  };

  return (
    <div className="contact-team-container">
      <h2>Contact Our Enterprise Team</h2>
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item name="companyName" label="Company Name" rules={[{ required: true }]}>
          <Input prefix={<UserOutlined />} />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input prefix={<MailOutlined />} />
        </Form.Item>
        <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
          <Input prefix={<PhoneOutlined />} />
        </Form.Item>
        <Form.Item name="message" label="Message" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block>
          Submit Inquiry
        </Button>
      </Form>
    </div>
  );
}

export default ContactTeamPage;