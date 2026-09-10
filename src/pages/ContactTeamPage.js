// src/pages/ContactTeamPage.js
import React, { useState } from 'react';
import { Form, Input, Button, message, Row, Col, Select, Checkbox, Divider } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  SendOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import './ContactTeamPage.css';

const { TextArea } = Input;
const { Option } = Select;

function ContactTeamPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      // TODO: Replace with your actual API endpoint
      // await axios.post('/api/contact', values);

      console.log('Contact form submitted:', values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);
      message.success(
        t('contact.successMessage') ||
        'Thank you! Our enterprise team will contact you within 24 hours.'
      );

      form.resetFields();
    } catch (error) {
      message.error(
        t('contact.errorMessage') ||
        'Something went wrong. Please try again or email us directly at info@safetrackproglobal.com'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSubmitted(false);
  };

  // Contact methods
  const contactMethods = [
    {
      icon: <MailOutlined />,
      title: t('contact.email') || 'Email Us',
      value: 'info@safetrackproglobal.com',
      link: 'mailto:info@safetrackproglobal.com',
      description: t('contact.emailDesc') || 'Response within 24 hours',
      color: '#1890ff'
    },
    {
      icon: <PhoneOutlined />,
      title: t('contact.phone') || 'Call Us',
      value: '+974 3325 1705',
      link: 'tel:+97433251705',
      description: t('contact.phoneDesc') || 'Sun-Thu, 9AM-6PM AST',
      color: '#52c41a'
    },
    {
      icon: <GlobalOutlined />,
      title: t('contact.location') || 'Visit Us',
      value: 'Doha, Qatar',
      link: 'https://maps.google.com/?q=Doha,Qatar',
      description: t('contact.locationDesc') || 'Middle East HQ',
      color: '#fa8c16'
    },
    {
      icon: <MessageOutlined />,
      title: t('contact.liveChat') || 'Live Chat',
      value: t('contact.chatAvailable') || 'Available 24/7',
      link: '/support',
      description: t('contact.chatDesc') || 'Instant AI assistance',
      color: '#722ed1'
    }
  ];

  // Inquiry types
  const inquiryTypes = [
    { value: 'enterprise', label: t('contact.inquiry.enterprise') || 'Enterprise Sales' },
    { value: 'demo', label: t('contact.inquiry.demo') || 'Request a Demo' },
    { value: 'partnership', label: t('contact.inquiry.partnership') || 'Partnership' },
    { value: 'support', label: t('contact.inquiry.support') || 'Technical Support' },
    { value: 'pricing', label: t('contact.inquiry.pricing') || 'Pricing Inquiry' },
    { value: 'other', label: t('contact.inquiry.other') || 'Other' }
  ];

  // Company sizes
  const companySizes = [
    { value: '1-50', label: '1-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1,000 employees' },
    { value: '1001-5000', label: '1,001-5,000 employees' },
    { value: '5000+', label: '5,000+ employees' }
  ];

  // Industries
  const industries = [
    { value: 'healthcare', label: t('industries.healthcare') || 'Healthcare' },
    { value: 'oil-gas', label: t('industries.oilGas') || 'Oil & Gas' },
    { value: 'construction', label: t('industries.construction') || 'Construction' },
    { value: 'manufacturing', label: t('industries.manufacturing') || 'Manufacturing' },
    { value: 'maritime', label: t('industries.maritime') || 'Maritime' },
    { value: 'aviation', label: t('industries.aviation') || 'Aviation' },
    { value: 'mining', label: t('industries.mining') || 'Mining' },
    { value: 'chemical', label: t('industries.chemical') || 'Chemical' },
    { value: 'other', label: t('industries.other') || 'Other' }
  ];

  return (
    <div
      className={`contact-team-page ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ============================================
           HERO SECTION - ONLY ONE H1
           ============================================ */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <span className="contact-badge">
              <TeamOutlined /> {t('contact.badge') || 'Enterprise Sales Team'}
            </span>

            {/* ✅ THE ONLY H1 ON THIS PAGE */}
            <h1 className="contact-title">
              {t('contact.title') || 'Contact Our Enterprise Team'}
            </h1>

            <p className="contact-description">
              {t('contact.description') ||
                'Have questions about SafeTrack Pro Global? Our enterprise team is ready to help you find the right safety management solution for your organization.'}
            </p>

            {/* Trust signals */}
            <div className="contact-trust-signals">
              <div className="trust-signal">
                <ClockCircleOutlined />
                <span>{t('contact.responseTime') || 'Response within 24 hours'}</span>
              </div>
              <div className="trust-signal">
                <SafetyCertificateOutlined />
                <span>{t('contact.isoCertified') || 'ISO 27001 Certified'}</span>
              </div>
              <div className="trust-signal">
                <GlobalOutlined />
                <span>{t('contact.multiLanguage') || 'Support in 10 languages'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
           MAIN CONTENT - TWO COLUMN LAYOUT
           ============================================ */}
      <section className="contact-main">
        <div className="container">
          <Row gutter={[48, 48]}>
            {/* ============================================
                 LEFT COLUMN - CONTACT FORM
                 ============================================ */}
            <Col xs={24} lg={14}>
              <div className="contact-form-wrapper">
                <h2 className="form-title">
                  {t('contact.formTitle') || 'Send Us a Message'}
                </h2>
                <p className="form-subtitle">
                  {t('contact.formSubtitle') ||
                    'Fill out the form below and our team will get back to you within 24 hours.'}
                </p>

                <Form
                  form={form}
                  onFinish={onFinish}
                  layout="vertical"
                  requiredMark="optional"
                  size="large"
                  className="contact-form"
                >
                  {/* Row 1: Name + Email */}
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="fullName"
                        label={t('contact.fullName') || 'Full Name'}
                        rules={[
                          { required: true, message: t('contact.requiredName') || 'Please enter your full name' },
                          { min: 2, message: t('contact.minName') || 'Name must be at least 2 characters' }
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder={t('contact.namePlaceholder') || 'John Doe'}
                          autoComplete="name"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label={t('contact.email') || 'Work Email'}
                        rules={[
                          { required: true, message: t('contact.requiredEmail') || 'Please enter your email' },
                          { type: 'email', message: t('contact.validEmail') || 'Please enter a valid email address' }
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder={t('contact.emailPlaceholder') || 'john@company.com'}
                          autoComplete="email"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Row 2: Company + Phone */}
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="companyName"
                        label={t('contact.companyName') || 'Company Name'}
                        rules={[
                          { required: true, message: t('contact.requiredCompany') || 'Please enter your company name' }
                        ]}
                      >
                        <Input
                          prefix={<TeamOutlined />}
                          placeholder={t('contact.companyPlaceholder') || 'Acme Corp'}
                          autoComplete="organization"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label={t('contact.phone') || 'Phone Number'}
                        rules={[
                          { required: true, message: t('contact.requiredPhone') || 'Please enter your phone number' },
                          {
                            pattern: /^[+\d\s()-]{7,20}$/,
                            message: t('contact.validPhone') || 'Please enter a valid phone number'
                          }
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined />}
                          placeholder={t('contact.phonePlaceholder') || '+974 3325 1705'}
                          autoComplete="tel"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Row 3: Industry + Company Size */}
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="industry"
                        label={t('contact.industry') || 'Industry'}
                        rules={[{ required: true, message: t('contact.requiredIndustry') || 'Please select your industry' }]}
                      >
                        <Select
                          placeholder={t('contact.selectIndustry') || 'Select your industry'}
                          showSearch
                          optionFilterProp="label"
                        >
                          {industries.map((ind) => (
                            <Option key={ind.value} value={ind.value} label={ind.label}>
                              {ind.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="companySize"
                        label={t('contact.companySize') || 'Company Size'}
                        rules={[{ required: true, message: t('contact.requiredSize') || 'Please select company size' }]}
                      >
                        <Select placeholder={t('contact.selectSize') || 'Select company size'}>
                          {companySizes.map((size) => (
                            <Option key={size.value} value={size.value}>
                              {size.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Inquiry Type */}
                  <Form.Item
                    name="inquiryType"
                    label={t('contact.inquiryType') || 'Inquiry Type'}
                    rules={[{ required: true, message: t('contact.requiredInquiry') || 'Please select inquiry type' }]}
                  >
                    <Select placeholder={t('contact.selectInquiry') || 'What can we help you with?'}>
                      {inquiryTypes.map((type) => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* Message */}
                  <Form.Item
                    name="message"
                    label={t('contact.message') || 'Message'}
                    rules={[
                      { required: true, message: t('contact.requiredMessage') || 'Please enter your message' },
                      { min: 20, message: t('contact.minMessage') || 'Message must be at least 20 characters' },
                      { max: 2000, message: t('contact.maxMessage') || 'Message must be under 2,000 characters' }
                    ]}
                  >
                    <TextArea
                      rows={5}
                      placeholder={
                        t('contact.messagePlaceholder') ||
                        'Tell us about your safety management needs, number of sites, and any specific compliance requirements...'
                      }
                      showCount
                      maxLength={2000}
                    />
                  </Form.Item>

                  {/* Consent */}
                  <Form.Item
                    name="consent"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(new Error(t('contact.requiredConsent') || 'Please accept to continue'))
                      }
                    ]}
                  >
                    <Checkbox>
                      {t('contact.consent') || 'I agree to the'}{' '}
                      <Link to="/privacy">{t('contact.privacyPolicy') || 'Privacy Policy'}</Link>{' '}
                      {t('contact.and') || 'and'}{' '}
                      <Link to="/terms">{t('contact.terms') || 'Terms of Service'}</Link>
                    </Checkbox>
                  </Form.Item>

                  {/* Submit */}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      icon={loading ? <LoadingOutlined /> : <SendOutlined />}
                      className="submit-button"
                    >
                      {loading
                        ? t('contact.sending') || 'Sending...'
                        : t('contact.submit') || 'Send Message'}
                    </Button>
                  </Form.Item>

                  {/* Success Message */}
                  {submitted && (
                    <div className="success-message">
                      <CheckCircleOutlined />
                      <div>
                        <strong>{t('contact.thankYou') || 'Thank you!'}</strong>
                        <p>
                          {t('contact.successDetail') ||
                            'Your message has been received. Our team will contact you within 24 hours.'}
                        </p>
                        <Button type="link" onClick={handleReset}>
                          {t('contact.sendAnother') || 'Send another message'}
                        </Button>
                      </div>
                    </div>
                  )}
                </Form>
              </div>
            </Col>

            {/* ============================================
                 RIGHT COLUMN - CONTACT INFO
                 ============================================ */}
            <Col xs={24} lg={10}>
              <div className="contact-info-wrapper">
                <h2 className="info-title">
                  {t('contact.otherWays') || 'Other Ways to Reach Us'}
                </h2>

                {/* Contact Methods */}
                <div className="contact-methods">
                  {contactMethods.map((method, index) => (
                    <a
                      key={index}
                      href={method.link}
                      className="contact-method-card"
                      target={method.link.startsWith('http') ? '_blank' : undefined}
                      rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      <div className="method-icon" style={{ color: method.color }}>
                        {method.icon}
                      </div>
                      <div className="method-content">
                        <span className="method-title">{method.title}</span>
                        <span className="method-value">{method.value}</span>
                        <span className="method-description">{method.description}</span>
                      </div>
                    </a>
                  ))}
                </div>

                <Divider />

                {/* Quick Links */}
                <div className="quick-links">
                  <h3 className="quick-links-title">
                    {t('contact.quickLinks') || 'Quick Links'}
                  </h3>
                  <ul className="quick-links-list">
                    <li>
                      <Link to="/demo">
                        <CheckCircleOutlined /> {t('contact.requestDemo') || 'Request a Demo'}
                      </Link>
                    </li>
                    <li>
                      <Link to="/pricing">
                        <CheckCircleOutlined /> {t('contact.viewPricing') || 'View Pricing Plans'}
                      </Link>
                    </li>
                    <li>
                      <Link to="/support">
                        <CheckCircleOutlined /> {t('contact.helpCenter') || 'Visit Help Center'}
                      </Link>
                    </li>
                    <li>
                      <Link to="/docs">
                        <CheckCircleOutlined /> {t('contact.readDocs') || 'Read Documentation'}
                      </Link>
                    </li>
                    <li>
                      <Link to="/security">
                        <CheckCircleOutlined /> {t('contact.securityInfo') || 'Security & Compliance'}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Response Time Card */}
                <div className="response-time-card">
                  <ClockCircleOutlined />
                  <div>
                    <strong>{t('contact.avgResponse') || 'Average Response Time'}</strong>
                    <p>{t('contact.under24') || 'Under 24 hours for enterprise inquiries'}</p>
                  </div>
                </div>

                {/* Office Info */}
                <div className="office-info">
                  <EnvironmentOutlined />
                  <div>
                    <strong>SafeTrack Pro Global</strong>
                    <p>
                      {t('contact.address') || 'Doha, Qatar'}
                      <br />
                      {t('contact.addressLine2') || 'Middle East Headquarters'}
                    </p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ============================================
           CTA SECTION
           ============================================ */}
      <section className="contact-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              {t('contact.ctaTitle') || 'Not sure which plan is right for you?'}
            </h2>
            <p className="cta-text">
              {t('contact.ctaText') ||
                'Start with our free Starter plan, or speak with our team to find the perfect solution.'}
            </p>
            <div className="cta-actions">
              <Button type="primary" size="large" href="/signup">
                {t('contact.startFree') || 'Start Free Trial'}
              </Button>
              <Button size="large" href="/pricing">
                {t('contact.comparePlans') || 'Compare Plans'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactTeamPage;