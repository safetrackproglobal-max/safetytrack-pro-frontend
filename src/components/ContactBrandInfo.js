// src/components/Footer/ContactBrandInfo.js
import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd';
import {
  MailOutlined,
  UserOutlined,
  MessageOutlined,
  PhoneOutlined,
  WhatsAppOutlined,
  EnvironmentOutlined,
  SendOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './ContactBrandInfo.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

// API base URL — reuse your existing config or fall back to the prod URL
const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  'https://safetrackproglobal-backend-production.up.railway.app';

// Contact constants
const CONTACT = {
  email: 'info@safetrackproglobal.com',
  phone: '+974 3325 1705',
  phoneRaw: '+97433251705',
  whatsapp: '97433251705', // WhatsApp number without + or spaces
  whatsappMessage: encodeURIComponent(
    "Hello SafeTrack Pro Global team! I'd like to learn more about your HSE platform."
  ),
  address: 'Doha, Qatar'
};

const ContactBrandInfo = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/contact`,
        {
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          // Honeypot — always empty for real users
          website: values.website || ''
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000
        }
      );

      if (data?.success) {
        message.success(
          data.message ||
            'Your message has been sent successfully! We will get back to you within 24 hours.'
        );
        form.resetFields();
      } else {
        // Field-level validation errors from the backend
        if (data?.fields) {
          form.setFields(
            Object.entries(data.fields).map(([field, err]) => ({
              name: field,
              errors: [err]
            }))
          );
        }
        message.error(data?.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      const errData = error?.response?.data;

      // Map backend field errors onto the form
      if (errData?.fields) {
        form.setFields(
          Object.entries(errData.fields).map(([field, err]) => ({
            name: field,
            errors: [err]
          }))
        );
      }

      // Rate limit or send failure
      message.error(
        errData?.error ||
          'Failed to send message. Please try again or email us directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp click-to-chat URL
  const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${CONTACT.whatsappMessage}`;

  return (
    <div className="contact-brand-page">
      <div className="contact-container">
        <div className="page-header">
          <Title level={1}>Contact Us</Title>
          <Text className="page-description">
            Have questions or need assistance? Send us a message, chat on WhatsApp,
            or reach out through any of the channels below — we'll get back to you
            as soon as possible.
          </Text>
        </div>

        {/* ============================================
             QUICK CONTACT METHODS
             ============================================ */}
        <div className="quick-contact-grid">
          {/* Email */}
          <a
            href={`mailto:${CONTACT.email}`}
            className="quick-contact-card email"
            aria-label={`Email us at ${CONTACT.email}`}
          >
            <div className="quick-icon">
              <MailOutlined />
            </div>
            <div className="quick-content">
              <span className="quick-label">Email</span>
              <span className="quick-value">{CONTACT.email}</span>
              <span className="quick-hint">Response within 24 hours</span>
            </div>
          </a>

          {/* Phone */}
          <a
            href={`tel:${CONTACT.phoneRaw}`}
            className="quick-contact-card phone"
            aria-label={`Call us at ${CONTACT.phone}`}
          >
            <div className="quick-icon">
              <PhoneOutlined />
            </div>
            <div className="quick-content">
              <span className="quick-label">Call Us</span>
              <span className="quick-value">{CONTACT.phone}</span>
              <span className="quick-hint">Sun–Thu, 9AM–6PM AST</span>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-contact-card whatsapp"
            aria-label="Chat with us on WhatsApp"
          >
            <div className="quick-icon whatsapp-icon">
              <WhatsAppOutlined />
            </div>
            <div className="quick-content">
              <span className="quick-label">WhatsApp</span>
              <span className="quick-value">Chat Now</span>
              <span className="quick-hint">Instant reply during business hours</span>
            </div>
          </a>

          {/* Location */}
          <a
            href="https://maps.google.com/?q=Doha,Qatar"
            target="_blank"
            rel="noopener noreferrer"
            className="quick-contact-card location"
            aria-label="View our location on Google Maps"
          >
            <div className="quick-icon">
              <EnvironmentOutlined />
            </div>
            <div className="quick-content">
              <span className="quick-label">Headquarters</span>
              <span className="quick-value">{CONTACT.address}</span>
              <span className="quick-hint">Middle East HQ</span>
            </div>
          </a>
        </div>

        <Divider className="contact-divider">
          <span className="divider-text">or send us a message</span>
        </Divider>

        {/* ============================================
             CONTACT FORM
             ============================================ */}
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
            requiredMark="optional"
            disabled={loading}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: 'Please enter your name' },
                { min: 2, message: 'Name must be at least 2 characters' },
                { max: 100, message: 'Name must be under 100 characters' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Your full name"
                size="large"
                autoComplete="name"
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
                { max: 254, message: 'Email is too long' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="your.email@company.com"
                size="large"
                autoComplete="email"
                maxLength={254}
              />
            </Form.Item>

            <Form.Item
              name="subject"
              label="Subject"
              rules={[
                { required: true, message: 'Please enter a subject' },
                { min: 3, message: 'Subject must be at least 3 characters' },
                { max: 150, message: 'Subject must be under 150 characters' }
              ]}
            >
              <Input
                placeholder="What is this regarding?"
                size="large"
                prefix={<SendOutlined />}
                maxLength={150}
              />
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[
                { required: true, message: 'Please enter your message' },
                { min: 10, message: 'Message must be at least 10 characters' },
                { max: 2000, message: 'Message must be under 2,000 characters' }
              ]}
            >
              <TextArea
                placeholder="Tell us how we can help you..."
                rows={6}
                size="large"
                showCount
                maxLength={2000}
              />
            </Form.Item>

            {/* Honeypot — hidden from humans, filled by bots.
                If this field has a value, the backend silently drops the message. */}
            <Form.Item
              name="website"
              style={{
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
              }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            >
              <Input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="submit-button"
                icon={<SendOutlined />}
                block
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </Form.Item>
          </Form>

          <div className="contact-info-minimal">
            <Text type="secondary">
              Prefer to reach us directly?{' '}
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              {' · '}
              <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a>
              {' · '}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-link"
              >
                <WhatsAppOutlined /> WhatsApp
              </a>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContactBrandInfo;
