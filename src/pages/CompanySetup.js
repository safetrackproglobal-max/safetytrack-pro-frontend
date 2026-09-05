// src/pages/CompanySetup.js
import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, Typography, Alert, Space, 
  Select, InputNumber, message, Spin, Steps, Row, Col, 
  Tag, Divider, Radio, Modal
} from 'antd';
import { 
  BankOutlined, 
  GlobalOutlined, 
  TeamOutlined, 
  SaveOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  RocketOutlined,
  CreditCardOutlined,
  DollarOutlined,
  PhoneOutlined,
  LoadingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaymentService from '../services/paymentService';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

// ✅ Pricing data - Only Enterprise (Custom is contact sales)
const COUNTRY_PRICING = {
  "Ghana": {
    "enterprise": {"1_month": 299, "6_month": 1499, "1_year": 2699, "currency": "GHS"}
  },
  "Qatar": {
    "enterprise": {"1_month": 299, "6_month": 1499, "1_year": 2699, "currency": "QAR"}
  },
  "default": {
    "enterprise": {"1_month": 299, "6_month": 1499, "1_year": 2699, "currency": "USD"}
  }
};

// ✅ PLAN DEFINITIONS - Only Enterprise and Custom
const PLAN_DEFINITIONS = {
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    icon: <RocketOutlined />,
    color: '#fa8c16',
    features: [
      'All Pro features',
      'Unlimited document uploads',
      'Custom API limits',
      'Unlimited team members',
      'Unlimited camera feeds',
      'Custom AI model training',
      'White-label solution',
      'On-premise deployment',
      'Dedicated infrastructure',
      'Custom integrations (API)',
      'Dedicated account manager',
      '24/7 priority support',
      'SLA 99.9% uptime',
      'Custom training sessions'
    ],
    requiresPayment: true,
    isEnterprise: true
  },
  custom: {
    id: 'custom',
    name: 'Custom Enterprise',
    icon: <CrownOutlined />,
    color: '#722ed1',
    features: [
      'Fully customized solution',
      'Tailored workflows & forms',
      'Complete API Integration',
      'Custom dashboards & reports',
      'Dedicated infrastructure',
      'On-premise or cloud deployment',
      'Dedicated account manager & support team',
      'Custom training & onboarding',
      'White-labeling options',
      'Advanced AI & ML models',
      'Predictive analytics & insights',
      'Custom integrations & APIs',
      '24/7 premium support'
    ],
    requiresPayment: false,
    isCustom: true,
    isEnterprise: true
  }
};

const DURATION_OPTIONS = [
  { value: '1_month', label: 'Monthly' },
  { value: '6_month', label: '6 Months' },
  { value: '1_year', label: 'Annual' }
];

function CompanySetup() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('enterprise');
  const [selectedDuration, setSelectedDuration] = useState('1_year');
  const [selectedCountry, setSelectedCountry] = useState('Ghana');
  const [form] = Form.useForm();
  const history = useHistory();
  const { user, updateProfile, refreshUser } = useAuth();

  // ============================================
  // HELPERS
  // ============================================

  const getCountryPricing = () => {
    return COUNTRY_PRICING[selectedCountry] || COUNTRY_PRICING.default;
  };

  const getPlanPrice = (planId) => {
    if (planId === 'custom') return { amount: 'Custom', currency: 'USD' };
    
    const pricing = getCountryPricing();
    const planPricing = pricing[planId];
    if (!planPricing) return { amount: 0, currency: 'USD' };
    const amount = planPricing[selectedDuration] || planPricing['1_month'] || 0;
    const currency = planPricing.currency || 'USD';
    return { amount, currency };
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === 'Custom') return 'Custom Pricing';
    const symbols = { USD: '$', GHS: 'GH₵', QAR: 'QR', INR: '₹', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || currency;
    return `${symbol}${typeof amount === 'number' ? amount.toLocaleString() : amount}`;
  };

  const getDurationLabel = (duration) => {
    const labels = { '1_month': 'Monthly', '6_month': '6 Months', '1_year': 'Annual' };
    return labels[duration] || duration;
  };

  // ============================================
  // STEP 1: Company Setup Form
  // ============================================
  const renderCompanySetup = () => (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <BankOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        <Title level={2}>Company Setup</Title>
        <Text type="secondary">Set up your company profile</Text>
      </div>

      <Alert
        message="Complete your company profile"
        description="This information helps us tailor SafetyTrack Pro to your organization's needs."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          companyName: user?.company_name || '',
          industry: user?.industry || 'Healthcare',
          employeeCount: user?.employee_count || 1,
          country: user?.country || 'Ghana',
          phone: user?.phone || '',
          website: user?.website || '',
          address: user?.address || ''
        }}
      >
        <Form.Item
          name="companyName"
          label="Company Name"
          rules={[{ required: true, message: 'Please enter company name' }]}
        >
          <Input placeholder="Enter your company name" prefix={<BankOutlined />} size="large" />
        </Form.Item>

        <Form.Item
          name="industry"
          label="Industry"
          rules={[{ required: true, message: 'Please select industry' }]}
        >
          <Select placeholder="Select your industry" size="large">
            <Option value="Healthcare">Healthcare</Option>
            <Option value="Manufacturing">Manufacturing</Option>
            <Option value="Construction">Construction</Option>
            <Option value="Oil & Gas">Oil & Gas</Option>
            <Option value="Mining">Mining</Option>
            <Option value="Education">Education</Option>
            <Option value="Government">Government</Option>
            <Option value="Pharmaceutical">Pharmaceutical</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="employeeCount"
          label="Number of Employees"
          rules={[{ required: true, message: 'Please enter employee count' }]}
        >
          <InputNumber 
            min={1} 
            max={100000} 
            placeholder="Number of employees" 
            size="large"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true, message: 'Please select country' }]}
        >
          <Select placeholder="Select your country" size="large" onChange={setSelectedCountry}>
            <Option value="Ghana">Ghana 🇬🇭</Option>
            <Option value="Qatar">Qatar 🇶🇦</Option>
            <Option value="India">India 🇮🇳</Option>
            <Option value="United States">United States 🇺🇸</Option>
            <Option value="United Kingdom">United Kingdom 🇬🇧</Option>
            <Option value="Nigeria">Nigeria 🇳🇬</Option>
            <Option value="South Africa">South Africa 🇿🇦</Option>
            <Option value="Other">Other 🌍</Option>
          </Select>
        </Form.Item>

        <Form.Item name="phone" label="Phone Number">
          <Input placeholder="Enter phone number" size="large" />
        </Form.Item>

        <Form.Item name="website" label="Website (Optional)">
          <Input placeholder="https://yourcompany.com" size="large" />
        </Form.Item>

        <Form.Item name="address" label="Address (Optional)">
          <Input.TextArea placeholder="Enter company address" rows={2} size="large" />
        </Form.Item>
      </Form>
    </div>
  );

  // ============================================
  // STEP 2: Plan Selection - Only Enterprise & Custom
  // ============================================
  const renderPlanSelection = () => {
    const plans = ['enterprise', 'custom'];

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Choose Your Enterprise Plan</Title>
          <Text type="secondary">Select an enterprise plan that fits your organization</Text>
        </div>

        {/* Duration Selector - Only for Enterprise (Custom is contact sales) */}
        {selectedPlan !== 'custom' && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Text strong>Billing Cycle: </Text>
            <Select value={selectedDuration} onChange={setSelectedDuration} style={{ width: 150 }}>
              {DURATION_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </div>
        )}

        <Row gutter={[24, 24]} justify="center">
          {plans.map((planId) => {
            const plan = PLAN_DEFINITIONS[planId];
            const price = getPlanPrice(planId);
            const isSelected = selectedPlan === planId;
            const isCustom = planId === 'custom';

            return (
              <Col xs={24} md={12} key={planId}>
                <Card
                  className={`plan-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    border: isSelected ? `2px solid ${plan.color}` : undefined,
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedPlan(planId)}
                  hoverable
                >
                  {isCustom && (
                    <Tag color="orange" style={{ position: 'absolute', top: 16, right: 16 }}>
                      <CrownOutlined /> Custom
                    </Tag>
                  )}
                  {!isCustom && (
                    <Tag color="gold" style={{ position: 'absolute', top: 16, right: 16 }}>
                      <RocketOutlined /> Enterprise
                    </Tag>
                  )}

                  <div style={{ fontSize: 48, color: plan.color, marginBottom: 16, textAlign: 'center' }}>
                    {plan.icon}
                  </div>
                  <Title level={3} style={{ textAlign: 'center' }}>{plan.name}</Title>
                  
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 28, color: plan.color }}>
                      {isCustom ? 'Custom Pricing' : formatCurrency(price.amount, price.currency)}
                    </Text>
                    {!isCustom && price.amount > 0 && (
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        /{getDurationLabel(selectedDuration).toLowerCase()}
                      </Text>
                    )}
                  </div>

                  {isCustom && (
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Contact us for custom pricing tailored to your needs
                      </Text>
                    </div>
                  )}

                  <Divider style={{ margin: '16px 0' }} />

                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>Features:</Title>
                    {plan.features.slice(0, 8).map((feature, idx) => (
                      <div key={idx} style={{ padding: '4px 0', fontSize: 14 }}>
                        <CheckCircleOutlined style={{ color: plan.color, marginRight: 8 }} />
                        {feature}
                      </div>
                    ))}
                    {plan.features.length > 8 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        + {plan.features.length - 8} more features
                      </Text>
                    )}
                  </div>

                  {isSelected && (
                    <Tag color="blue" style={{ marginTop: 8 }}>
                      <CheckCircleOutlined /> Selected
                    </Tag>
                  )}

                  {isCustom && (
                    <Alert
                      message="Custom Plan"
                      description="Our team will work with you to create a tailored solution."
                      type="info"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>

        {selectedPlan === 'custom' && (
          <Alert
            message="Custom Enterprise Plan"
            description="After completing your company setup, our sales team will contact you to discuss your custom requirements and pricing."
            type="success"
            showIcon
            style={{ marginTop: 24 }}
          />
        )}
      </div>
    );
  };

  // ============================================
  // STEP 3: Payment - Only for Enterprise (Custom skips to contact)
  // ============================================
  const renderPayment = () => {
    const plan = PLAN_DEFINITIONS[selectedPlan];
    const price = getPlanPrice(selectedPlan);
    const isCustom = selectedPlan === 'custom';
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Custom plan - show contact sales message
    if (isCustom) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CrownOutlined style={{ fontSize: 64, color: '#722ed1' }} />
          <Title level={2}>Custom Enterprise Plan</Title>
          <Text type="secondary">
            Our team will contact you within 24 hours to discuss your custom requirements.
          </Text>
          <div style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              size="large"
              onClick={() => handleCompleteSetup()}
            >
              Complete Setup & Request Contact
            </Button>
          </div>
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <InfoCircleOutlined /> You will receive a confirmation email with next steps.
            </Text>
          </div>
        </div>
      );
    }

    // Enterprise plan - show payment
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CreditCardOutlined style={{ fontSize: 48, color: '#fa8c16' }} />
          <Title level={2}>Complete Payment</Title>
          <Text type="secondary">Pay to activate your Enterprise plan</Text>
        </div>

        <Alert
          message="Order Summary"
          description={
            <div style={{ marginTop: 8 }}>
              <Row>
                <Col span={12}><Text type="secondary">Plan:</Text> <Text strong>Enterprise</Text></Col>
                <Col span={12}><Text type="secondary">Billing:</Text> <Text strong>{getDurationLabel(selectedDuration)}</Text></Col>
                <Col span={24} style={{ marginTop: 8 }}>
                  <Text type="secondary">Amount:</Text>
                  <Text strong style={{ fontSize: 24, color: '#fa8c16' }}>
                    {formatCurrency(price.amount, price.currency)}
                  </Text>
                </Col>
              </Row>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider orientation="left">Select Payment Method</Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Card
            hoverable
            onClick={() => setPaymentMethod('paystack')}
            style={{ cursor: 'pointer', border: paymentMethod === 'paystack' ? '2px solid #1890ff' : undefined }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <CreditCardOutlined style={{ fontSize: 28, color: '#1890ff' }} />
              <div>
                <Text strong>Paystack / Credit Card</Text>
                <br />
                <Text type="secondary">Instant activation</Text>
              </div>
              <Tag color="green" style={{ marginLeft: 'auto' }}>✓ Instant</Tag>
            </div>
          </Card>

          <Card
            hoverable
            onClick={() => setPaymentMethod('paypal')}
            style={{ cursor: 'pointer', border: paymentMethod === 'paypal' ? '2px solid #1890ff' : undefined }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <DollarOutlined style={{ fontSize: 28, color: '#003087' }} />
              <div>
                <Text strong>PayPal</Text>
                <br />
                <Text type="secondary">Secure payment</Text>
              </div>
              <Tag color="green" style={{ marginLeft: 'auto' }}>✓ Instant</Tag>
            </div>
          </Card>

          <Card
            hoverable
            onClick={() => setPaymentMethod('bank_transfer')}
            style={{ cursor: 'pointer', border: paymentMethod === 'bank_transfer' ? '2px solid #1890ff' : undefined }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <BankOutlined style={{ fontSize: 28, color: '#faad14' }} />
              <div>
                <Text strong>Bank Transfer</Text>
                <br />
                <Text type="secondary">Manual verification</Text>
              </div>
              <Tag color="orange" style={{ marginLeft: 'auto' }}>⏱ 24-48h</Tag>
            </div>
          </Card>
        </Space>

        <Button 
          type="primary" 
          size="large"
          block
          style={{ marginTop: 24 }}
          loading={processing}
          disabled={!paymentMethod}
          onClick={() => handlePayment(paymentMethod)}
        >
          Pay {formatCurrency(price.amount, price.currency)}
        </Button>
      </div>
    );
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      
      // Update company profile
      const response = await fetch('http://localhost:5000/api/company/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          company_name: values.companyName,
          industry: values.industry,
          employee_count: values.employeeCount,
          country: values.country || 'Ghana',
          phone: values.phone || '',
          website: values.website || '',
          address: values.address || '',
          plan: selectedPlan,
          is_enterprise: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Clear all registration flags
        localStorage.removeItem('requires_company_setup');
        localStorage.removeItem('requires_plan_selection');
        localStorage.removeItem('requires_payment');
        localStorage.removeItem('userStage');
        localStorage.removeItem('redirect_to');
        
        message.success('Company setup completed!');
        
        // If custom plan, show special message
        if (selectedPlan === 'custom') {
          message.info('Our team will contact you within 24 hours to discuss your custom plan.');
        }
        
        history.push('/dashboard');
      } else {
        message.error(data.error || 'Failed to complete setup');
      }
    } catch (error) {
      console.error('Setup error:', error);
      message.error('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method) => {
    const plan = PLAN_DEFINITIONS[selectedPlan];
    const price = getPlanPrice(selectedPlan);
    
    if (method === 'bank_transfer') {
      // Show manual payment instructions
      Modal.info({
        title: 'Bank Transfer Instructions',
        width: 600,
        icon: <BankOutlined style={{ color: '#faad14' }} />,
        content: (
          <div>
            <Alert
              message={`${plan.name} Plan Payment`}
              description={`Amount: ${formatCurrency(price.amount, price.currency)}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Card size="small" style={{ marginBottom: 12 }}>
              <div><Text strong>Bank:</Text> GCB Bank</div>
              <div><Text strong>Account:</Text> <Text copyable>4151440001070</Text></div>
              <div><Text strong>Name:</Text> AfdalTech Solutions</div>
              <div><Text strong>Reference:</Text> <Text code>{user?.email || 'your-email'}</Text></div>
            </Card>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
              <Text strong>Instructions:</Text>
              <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>Log into your internet banking</li>
                <li>Add "GCB Bank" as payee</li>
                <li>Enter account number: <Text strong>4151440001070</Text></li>
                <li>Amount: <Text strong>{formatCurrency(price.amount, price.currency)}</Text></li>
                <li>Reference: Use your email <Text code>{user?.email || 'your-email'}</Text></li>
                <li>Save the transaction receipt</li>
              </ol>
            </div>
            <Button 
              type="primary" 
              size="large" 
              block
              style={{ marginTop: 16 }}
              onClick={() => {
                Modal.destroyAll();
                handleCompleteSetup();
              }}
            >
              I Have Sent Payment ✓
            </Button>
          </div>
        )
      });
      return;
    }

    // Process payment with Paystack/PayPal
    setProcessing(true);
    try {
      // Payment logic here
      message.info(`Processing ${method} payment...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // After successful payment
      await handleCompleteSetup();
    } catch (error) {
      console.error('Payment error:', error);
      message.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // STEPS
  // ============================================
  const steps = [
    { title: 'Company', content: renderCompanySetup() },
    { title: 'Plan', content: renderPlanSelection() },
    { title: 'Payment', content: renderPayment() }
  ];

  const nextStep = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields();
        setCurrentStep(1);
      } catch (error) {
        message.error('Please fill in all required fields');
      }
    } else if (currentStep === 1) {
      const plan = PLAN_DEFINITIONS[selectedPlan];
      if (plan.isCustom) {
        // Custom plan - skip payment
        handleCompleteSetup();
      } else {
        setCurrentStep(2);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <Card>
        <Steps current={currentStep} style={{ marginBottom: 40 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div style={{ minHeight: 400 }}>
          {steps[currentStep].content}
        </div>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentStep > 0 && (
            <Button onClick={prevStep} icon={<ArrowLeftOutlined />}>
              Back
            </Button>
          )}
          <div style={{ flex: 1 }} />
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={nextStep} icon={<ArrowRightOutlined />} loading={loading}>
              {currentStep === 1 && PLAN_DEFINITIONS[selectedPlan]?.isCustom 
                ? 'Submit & Request Contact' 
                : 'Continue to Payment'}
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleCompleteSetup} loading={loading}>
              Complete Setup
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default CompanySetup;