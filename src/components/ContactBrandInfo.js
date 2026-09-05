import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import './ContactBrandInfo.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ContactBrandInfo = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Contact form submitted:', values);
      message.success('Your message has been sent successfully! We will get back to you within 24 hours.');
      form.resetFields();
    } catch (error) {
      message.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-brand-page">
      <div className="contact-container">
        <div className="page-header">
          <Title level={1}>Contact Us</Title>
          <Text className="page-description">
            Have questions or need assistance? Send us a message and we'll get back to you as soon as possible.
          </Text>
        </div>

        <Card className="contact-form-card">
          <div className="form-header">
            <MessageOutlined className="form-icon" />
            <Title level={3}>Send us a Message</Title>
          </div>
          
          <Form
            form={form}
            name="contact"
            onFinish={onFinish}
            layout="vertical"
            className="contact-form"
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Your full name" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="your.email@example.com" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: 'Please enter a subject' }]}
            >
              <Input 
                placeholder="What is this regarding?" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: 'Please enter your message' }]}
            >
              <TextArea 
                placeholder="Tell us how we can help you..." 
                rows={6}
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                loading={loading}
                className="submit-button"
                block
              >
                Send Message
              </Button>
            </Form.Item>
          </Form>

          <div className="contact-info-minimal">
            <Text type="secondary">
              Prefer to contact us directly? Email us at{' '}
              <a href="mailto:abigalisticstudious@gmail.com">abigalisticstudious@gmail.com</a>
              {' '}or call{' '}
              <a href="tel:+97433251705">+974 33251705</a>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContactBrandInfo;