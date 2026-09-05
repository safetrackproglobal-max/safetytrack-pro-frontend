// src/pages/SubscriptionPage.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  Card, 
  Button, 
  List, 
  Typography, 
  Space, 
  Tag, 
  Alert, 
  Divider, 
  Row, 
  Col, 
  Select, 
  Spin,
  Modal
} from 'antd';
import { 
  CheckCircleOutlined, 
  CrownOutlined, 
  TeamOutlined, 
  StarOutlined, 
  RocketOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiInstance, { normalizePlanName } from '../services/api';
import './SubscriptionPage.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [selectedDuration, setSelectedDuration] = useState('1_month');
  const [selectedCountry, setSelectedCountry] = useState('Qatar');
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [plans, setPlans] = useState([]);
  const [pricingData, setPricingData] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const { user, refreshPlanData } = useContext(AuthContext);
  const history = useHistory();

  // Define local pricing data as fallback
  const localPricingData = {
    Ghana: {
      free: {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "GHS"},
      basic: {"1_month": 100, "6_month": 500, "1_year": 900, "currency": "GHS"},
      pro: {"1_month": 200, "6_month": 1000, "1_year": 1800, "currency": "GHS"},
      enterprise: {"1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "GHS"}
    },
    Qatar: {
      free: {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "QAR"},
      basic: {"1_month": 100, "6_month": 500, "1_year": 900, "currency": "QAR"},
      pro: {"1_month": 300, "6_month": 1500, "1_year": 2700, "currency": "QAR"},
      enterprise: {"1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "QAR"}
    },
    default: {
      free: {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "USD"},
      basic: {"1_month": 20, "6_month": 100, "1_year": 180, "currency": "USD"},
      pro: {"1_month": 50, "6_month": 250, "1_year": 450, "currency": "USD"},
      enterprise: {"1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "USD"}
    }
  };

  // Define plans data locally as fallback
  const localPlansData = {
    free: {
      id: 'free',
      name: 'free',
      label: "Free Forever",
      features: [
        "Basic document analysis",
        "Email notifications",
        "3 document uploads per month",
        "20 API calls per month",
        "1 team member",
        "1 monitoring station",
        "Basic AI services access"
      ]
    },
    basic: {
      id: 'basic',
      name: 'basic',
      label: "Basic",
      features: [
        "All Free features",
        "PDF/Word/Excel generation",
        "Basic analytics",
        "100 document uploads per month",
        "500 API calls per month",
        "Up to 5 team members",
        "Up to 3 monitoring stations",
        "Medical NER AI",
        "Symptom Analysis AI",
        "Text Classification"
      ]
    },
    pro: {
      id: 'pro',
      name: 'pro',
      label: "Professional",
      features: [
        "All Basic features",
        "ML image analysis",
        "Advanced analytics",
        "Team management",
        "500 document uploads per month",
        "2000 API calls per month",
        "Up to 20 team members",
        "Up to 10 monitoring stations",
        "Real-time monitoring alerts",
        "Priority email support",
        "Disease Prediction AI",
        "Risk Assessment AI",
        "Text Summarization",
        "Video Safety Analysis"
      ]
    },
    enterprise: {
      id: 'enterprise',
      name: 'enterprise',
      label: "Enterprise",
      features: [
        "All Pro features",
        "Custom workflows & forms",
        "API Integration",
        "Advanced analytics & custom dashboards",
        "Dedicated infrastructure (SLA)",
        "On-premise deployment options",
        "Dedicated account manager & support",
        "Custom training & onboarding",
        "White-labeling options",
        "Lab Result Analysis AI",
        "Environmental AI",
        "Custom AI model training",
        "Unlimited API calls"
      ]
    }
  };

  // Load plans from API
  const loadPlans = async () => {
    try {
      setCalculating(true);
      // Get plans with user's country pricing
      const response = await api.get('/plans/pricing');
      
      if (response.data && response.data.success) {
        setPlans(response.data.plans || []);
        setPricingData(response.data.pricing || localPricingData);
      } else {
        // Use local data as fallback
        setPlans(Object.values(localPlansData));
        setPricingData(localPricingData);
      }
      
      // Normalize current plan for display
      const userPlan = user?.subscription_plan || user?.plan || 'free';
      setCurrentPlan(normalizePlanName(userPlan));
    } catch (error) {
      console.error('Error loading plans:', error);
      // Use local data as fallback
      setPlans(Object.values(localPlansData));
      setPricingData(localPricingData);
      Alert.warning('Using local pricing data. Some features may be limited.');
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [user]);

  // Calculate discount percentage
  const calculateDiscount = (planName, duration, country) => {
    if (!pricingData) return 0;
    
    const countryPricing = pricingData[country] || pricingData.default;
    const planPricing = countryPricing[planName];
    
    if (!planPricing || planPricing[duration] === "Custom" || planPricing['1_month'] === "Custom") {
      return 0;
    }
    
    const monthlyPrice = parseFloat(planPricing['1_month']);
    const durationPrice = parseFloat(planPricing[duration]);
    
    if (isNaN(monthlyPrice) || isNaN(durationPrice) || monthlyPrice === 0) {
      return 0;
    }
    
    let regularPrice;
    if (duration === '6_month') {
      regularPrice = monthlyPrice * 6;
    } else if (duration === '1_year') {
      regularPrice = monthlyPrice * 12;
    } else {
      return 0;
    }
    
    const discount = ((regularPrice - durationPrice) / regularPrice) * 100;
    return Math.round(discount);
  };

  // Format currency display
  const formatCurrency = (amount, currency) => {
    if (amount === "Custom") return "Custom Pricing";
    if (typeof amount !== 'number') amount = parseFloat(amount);
    
    const currencySymbols = {
      'GHS': 'GH₵',
      'QAR': 'QR',
      'USD': '$'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const handleUpgrade = async (planName) => {
    if (!user) {
      history.push('/login?redirect=subscription');
      return;
    }

    confirm({
      title: 'Confirm Plan Change',
      icon: <InfoCircleOutlined />,
      content: (
        <div>
          <p>You are about to change your subscription plan to <strong>{planName.toUpperCase()}</strong>.</p>
          <Alert
            message="Plan Change Notice"
            description={`Your new subscription will be billed ${
              selectedDuration === '1_month' ? 'monthly' : 
              selectedDuration === '6_month' ? 'every 6 months' : 'annually'
            }.`}
            type="info"
            showIcon
          />
        </div>
      ),
      okText: 'Confirm Upgrade',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await api.post('/subscription/upgrade', {
            plan: planName,
            duration: selectedDuration,
            country: selectedCountry
          });
          
          if (response.data.success) {
            // Refresh user data
            await refreshPlanData();
            
            if (response.data.paymentUrl) {
              // Redirect to payment gateway
              window.location.href = response.data.paymentUrl;
            } else if (planName === 'enterprise') {
              Alert.info('Our sales team will contact you shortly for enterprise setup.');
              history.push('/contact');
            } else {
              Alert.success('Plan upgraded successfully!');
            }
          }
        } catch (error) {
          Alert.error(error.response?.data?.error || 'Upgrade failed. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getButtonText = (planId) => {
    if (currentPlan === planId) return 'Current Plan';
    if (planId === 'free') return 'Downgrade to Free';
    return currentPlan === 'free' ? 'Upgrade Now' : 'Switch Plan';
  };

  const isPlanDisabled = (planId) => {
    return currentPlan === planId;
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free': return <StarOutlined />;
      case 'basic': return <TeamOutlined />;
      case 'pro': return <CrownOutlined />;
      case 'enterprise': return <RocketOutlined />;
      default: return <StarOutlined />;
    }
  };

  if (calculating) {
    return (
      <div className="subscription-page">
        <div className="loading-container">
          <Spin size="large" />
          <Text>Loading pricing information...</Text>
        </div>
      </div>
    );
  }

  const countryPricing = pricingData?.[selectedCountry] || pricingData?.default || localPricingData.default;
  const durationOptions = [
    { value: '1_month', label: 'Monthly' },
    { value: '6_month', label: '6 Months' },
    { value: '1_year', label: 'Annual' }
  ];

  // Show current plan info
  const currentPlanData = plans.find(p => p.name === (user?.subscription_plan || user?.plan || 'free')) || localPlansData[user?.plan || 'free'];

  return (
    <div className="subscription-page">
      <div className="page-header">
        <Title level={1}>Choose Your Plan</Title>
        <Paragraph>
          Select the perfect plan for your healthcare facility. All plans include our AI-powered safety management features.
        </Paragraph>
      </div>

      {/* Current Plan Information */}
      {currentPlanData && (
        <Card className="current-plan-card" style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="current-plan-header">
              <Title level={4}>Your Current Plan</Title>
              <Tag color="blue">{currentPlanData.label}</Tag>
            </div>
            <Row gutter={16}>
              <Col span={16}>
                <List
                  size="small"
                  dataSource={currentPlanData.features?.slice(0, 4)}
                  renderItem={(feature) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {feature}
                    </List.Item>
                  )}
                />
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Button 
                  type="default" 
                  onClick={() => history.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </Col>
            </Row>
          </Space>
        </Card>
      )}

      {/* Country and Duration Selection */}
      <div className="selection-section" style={{ marginBottom: 24 }}>
        <Space size="large">
          <div className="selection-group">
            <Text strong>Country: </Text>
            <Select
              value={selectedCountry}
              onChange={setSelectedCountry}
              style={{ width: 120 }}
            >
              <Option value="Ghana">Ghana</Option>
              <Option value="Qatar">Qatar</Option>
              <Option value="default">Other</Option>
            </Select>
          </div>
          
          <div className="selection-group">
            <Text strong>Billing: </Text>
            <Select
              value={selectedDuration}
              onChange={setSelectedDuration}
              style={{ width: 120 }}
            >
              {durationOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </div>

      <Row gutter={[24, 24]} justify="center" className="pricing-plans">
        {plans.length > 0 ? plans.map((plan) => {
          const pricing = countryPricing[plan.name];
          const discount = calculateDiscount(plan.name, selectedDuration, selectedCountry);
          const isCurrentPlan = currentPlan === plan.name;

          return (
            <Col xs={24} md={6} key={plan.id || plan.name}>
              <Card
                className={`plan-card ${selectedPlan === plan.name ? 'selected' : ''} ${plan.name === 'pro' ? 'recommended' : ''} ${isCurrentPlan ? 'current' : ''}`}
              >
                {plan.name === 'pro' && (
                  <div className="recommended-badge">
                    <Tag color="blue">Most Popular</Tag>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="current-badge">
                    <Tag color="green">Current Plan</Tag>
                  </div>
                )}
                
                <div className="plan-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {getPlanIcon(plan.name)}
                    <Title level={3} style={{ margin: 0 }}>{plan.label}</Title>
                  </div>
                  <div className="plan-price">
                    <Title level={2} style={{ margin: 0 }}>
                      {formatCurrency(pricing?.[selectedDuration], pricing?.currency)}
                    </Title>
                    {selectedDuration !== '1_month' && pricing?.[selectedDuration] !== "Custom" && (
                      <Text type="secondary">
                        {formatCurrency(pricing?.['1_month'], pricing?.currency)}/month
                      </Text>
                    )}
                  </div>
                  
                  {discount > 0 && (
                    <div className="discount-badge">
                      <Tag color="green">Save {discount}%</Tag>
                    </div>
                  )}
                </div>

                <List
                  size="small"
                  dataSource={plan.features}
                  renderItem={(feature) => (
                    <List.Item className="plan-feature">
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      <span>{feature}</span>
                    </List.Item>
                  )}
                  className="plan-features-list"
                />

                <Button
                  type={selectedPlan === plan.name ? 'primary' : 'default'}
                  size="large"
                  block
                  loading={loading}
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={isCurrentPlan}
                  style={{ marginTop: 16 }}
                >
                  {pricing?.[selectedDuration] === "Custom" ? 'Contact Sales' : getButtonText(plan.name)}
                </Button>

                {pricing?.[selectedDuration] === "Custom" && (
                  <div className="custom-pricing-note">
                    <Text type="secondary">Custom pricing for enterprise solutions</Text>
                  </div>
                )}
              </Card>
            </Col>
          );
        }) : (
          <Col span={24}>
            <Alert
              message="No plans available"
              description="Unable to load subscription plans. Please try again later."
              type="warning"
            />
          </Col>
        )}
      </Row>

      {/* Enterprise Contact Section */}
      <div className="enterprise-section" style={{ marginTop: 48 }}>
        <Card className="enterprise-card">
          <Row gutter={[48, 24]} align="middle">
            <Col xs={24} md={14}>
              <Title level={2}>Need Enterprise Solution?</Title>
              <Paragraph>
                For large healthcare networks with specific requirements, we offer fully customized 
                enterprise solutions with dedicated support, custom integrations, and tailored pricing.
              </Paragraph>
              <Button 
                type="primary" 
                size="large" 
                icon={<RocketOutlined />} 
                onClick={() => history.push('/contact')}
              >
                Contact Sales
              </Button>
            </Col>
            <Col xs={24} md={10}>
              <div className="enterprise-features">
                <div className="enterprise-feature">
                  <CheckCircleOutlined /> Custom AI Models
                </div>
                <div className="enterprise-feature">
                  <CheckCircleOutlined /> Dedicated Support Team
                </div>
                <div className="enterprise-feature">
                  <CheckCircleOutlined /> HIPAA Compliance
                </div>
                <div className="enterprise-feature">
                  <CheckCircleOutlined /> On-premise Deployment
                </div>
                <div className="enterprise-feature">
                  <CheckCircleOutlined /> White-label Solutions
                </div>
                <div className="enterprise-feature">
                  <CheckCircleOutlined /> Unlimited API Access
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      <Divider style={{ marginTop: 48 }} />

      <Card style={{ marginTop: 24 }}>
        <Title level={3}>Frequently Asked Questions</Title>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Can I change plans later?</Text>
            <br />
            <Text type="secondary">Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.</Text>
          </div>
          
          <div>
            <Text strong>Is there a free trial?</Text>
            <br />
            <Text type="secondary">All paid plans come with a 14-day free trial. No credit card required.</Text>
          </div>
          
          <div>
            <Text strong>What payment methods do you accept?</Text>
            <br />
            <Text type="secondary">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</Text>
          </div>

          <div>
            <Text strong>Can I cancel anytime?</Text>
            <br />
            <Text type="secondary">Yes, you can cancel your subscription at any time. No long-term contracts.</Text>
          </div>

          <div>
            <Text strong>What happens to my data if I downgrade?</Text>
            <br />
            <Text type="secondary">Your data is preserved. Some features may become inaccessible until you upgrade again.</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default SubscriptionPage;