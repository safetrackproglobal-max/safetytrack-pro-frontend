// src/pages/ProfilePage.js - Updated with Company Logo Upload
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import dashboardService from '../services/dashboardService';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Divider,
  Tag,
  message,
  Spin,
  Tabs,
  List,
  Typography,
  Space,
  Alert,
  Select,
  Modal,
  Badge,
  Progress,
  Descriptions,
  Timeline
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  SaveOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  RocketOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  SettingOutlined,
  SafetyOutlined,
  VideoCameraOutlined,
  ApiOutlined,
  TeamOutlined,
  DashboardOutlined,
  FileTextOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
  BankOutlined
} from '@ant-design/icons';
import './ProfilePage.css';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProfilePage = () => {
  const { user, planData, canAccess, updateProfile, refreshUser } = useAuth();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [profileImage, setProfileImage] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyLogoError, setCompanyLogoError] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    industry: '',
    address: '',
    phone: '',
    website: '',
    email: ''
  });
  const [usageData, setUsageData] = useState({
    uploads: { used: 0, total: 3 },
    apiCalls: { used: 0, total: 20 },
    teamMembers: { used: 1, total: 1 },
    storage: { used: 0, total: 100 },
    videoMinutes: { used: 0, total: 0 }
  });
  const [quickStats, setQuickStats] = useState({
    incidents: 0,
    documents: 0,
    tasks: 0,
    alerts: 0,
    team: 1,
    completion: 0
  });

  // Get full URL for images
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
    if (path.startsWith('/static')) {
      return `${baseUrl}${path}`;
    }
    if (!path.startsWith('/')) {
      return `${baseUrl}/static/${path}`;
    }
    return `${baseUrl}${path}`;
  };

  // Fetch real usage data on component mount
  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const usage = await dashboardService.getCurrentUsage();
        setUsageData({
          uploads: { used: usage.uploads?.used || 0, total: usage.uploads?.total || 3 },
          apiCalls: { used: usage.apiCalls?.used || 0, total: usage.apiCalls?.total || 20 },
          teamMembers: { used: usage.teamMembers?.used || 1, total: usage.teamMembers?.total || 1 },
          storage: { used: usage.storage?.used || 0, total: usage.storage?.total || 100 },
          videoMinutes: { used: usage.videoMinutes?.used || 0, total: usage.videoMinutes?.total || 0 }
        });
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
      }
    };

    const fetchQuickStats = async () => {
      try {
        const stats = await dashboardService.getUserQuickStats();
        setQuickStats({
          incidents: stats.incidents || 0,
          documents: stats.documents || 0,
          tasks: stats.tasks || 0,
          alerts: stats.alerts || 0,
          team: stats.team || 1,
          completion: stats.completion || 0
        });
      } catch (error) {
        console.error('Failed to fetch quick stats:', error);
      }
    };

    // Fetch company info
    const fetchCompanyInfo = async () => {
      try {
        if (user?.company_id) {
          const response = await dashboardService.getCompanyInfo(user.company_id);
          if (response && response.success) {
            const data = response.data || response;
            setCompanyInfo({
              name: data.name || user.company_name || '',
              industry: data.industry || '',
              address: data.address || '',
              phone: data.phone || '',
              website: data.website || '',
              email: data.email || ''
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch company info:', error);
      }
    };

    fetchUsageData();
    fetchQuickStats();
    fetchCompanyInfo();

    // Set profile image and company logo from user
    if (user) {
      const avatar = user.avatar || user.avatar_url || user.profile_image || null;
      if (avatar) {
        setProfileImage(getFullUrl(avatar));
      }
      
      const logo = user.company_logo || user.companyLogo || user.logo || null;
      if (logo) {
        setCompanyLogo(getFullUrl(logo));
      }
    }
  }, [user]);

  // Handle file selection for avatar upload
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setAvatarError(false);
    
    const options = {
      file: file,
      onSuccess: () => {
        console.log('Upload success');
      },
      onError: (err) => {
        console.error('Upload error', err);
        message.error(t('profile.uploadError'));
      },
      onProgress: (percent) => {
        console.log('Upload progress:', percent);
      }
    };
    
    await handleProfileImageUpload(options);
    event.target.value = '';
  };

  // Handle profile image upload
  const handleProfileImageUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    setUploading(true);
    
    try {
      const response = await dashboardService.uploadProfileImage(file, onProgress);
      console.log('Upload response:', response);
      
      if (response.imageUrl || response.avatar || response.avatar_url) {
        const imageUrl = response.imageUrl || response.avatar || response.avatar_url;
        const timestamp = new Date().getTime();
        const finalImageUrl = `${imageUrl}?t=${timestamp}`;
        
        setProfileImage(finalImageUrl);
        setAvatarError(false);
        
        await updateProfile({ avatar: imageUrl });
        await refreshUser();
        
        message.success(t('profile.avatarUpdated'));
        onSuccess('ok');
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error(t('profile.uploadFailed') + ': ' + (error.message || t('profile.unknownError')));
      onError({ error });
    } finally {
      setUploading(false);
    }
  };

  // ✅ NEW: Handle company logo upload using the same endpoint as AdminDashboard
  const handleCompanyLogoUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('company_id', user?.company_id);

      const response = await dashboardService.uploadCompanyLogo(formData);
      console.log('Company logo upload response:', response);
      
      if (response && response.success) {
        const logoUrl = response.data?.logo_url || response.logo_url;
        const timestamp = new Date().getTime();
        const finalLogoUrl = `${getFullUrl(logoUrl)}?t=${timestamp}`;
        
        setCompanyLogo(finalLogoUrl);
        setCompanyLogoError(false);
        
        // Update user context with new logo
        await updateProfile({ company_logo: logoUrl });
        await refreshUser();
        
        message.success('Company logo uploaded successfully!');
        onSuccess('ok');
      } else {
        throw new Error(response?.error || 'No logo URL in response');
      }
    } catch (error) {
      console.error('Company logo upload error:', error);
      message.error('Failed to upload company logo: ' + (error.message || 'Unknown error'));
      onError({ error });
    } finally {
      setUploading(false);
    }
  };

  // ✅ NEW: Handle company logo removal
  const handleRemoveCompanyLogo = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.removeCompanyLogo(user?.company_id);
      if (response && response.success) {
        setCompanyLogo(null);
        await updateProfile({ company_logo: null });
        await refreshUser();
        message.success('Company logo removed successfully');
      } else {
        message.error(response?.error || 'Failed to remove company logo');
      }
    } catch (error) {
      console.error('Remove error:', error);
      message.error('Failed to remove company logo');
    } finally {
      setLoading(false);
    }
  };

  // Handle company info update
  const handleUpdateCompanyInfo = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.updateCompany({
        company_id: user?.company_id,
        ...companyInfo
      });
      if (response && response.success) {
        await refreshUser();
        message.success('Company information updated successfully!');
      } else {
        message.error(response?.error || 'Failed to update company information');
      }
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update company information');
    } finally {
      setLoading(false);
    }
  };

  // Handle company logo file selection
  const handleCompanyLogoFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setCompanyLogoError(false);
    
    const options = {
      file: file,
      onSuccess: () => {
        console.log('Company logo upload success');
      },
      onError: (err) => {
        console.error('Company logo upload error', err);
        message.error('Failed to upload company logo');
      },
      onProgress: (percent) => {
        console.log('Upload progress:', percent);
      }
    };
    
    handleCompanyLogoUpload(options);
    event.target.value = '';
  };

  // Enhanced plan data with translations
  const enhancedPlans = {
    free: {
      name: t('profile.plans.free.name'),
      color: '#8c8c8c',
      icon: <UserOutlined />,
      features: {
        [t('profile.plans.free.features.basic')]: [
          t('profile.plans.free.features.basic1'),
          t('profile.plans.free.features.basic2'),
          t('profile.plans.free.features.basic3'),
          t('profile.plans.free.features.basic4')
        ],
        [t('profile.plans.free.features.team')]: [
          t('profile.plans.free.features.team1'),
          t('profile.plans.free.features.team2')
        ],
        [t('profile.plans.free.features.support')]: [
          t('profile.plans.free.features.support1')
        ]
      },
      limits: {
        uploads: 3,
        apiCalls: 20,
        teamMembers: 1,
        cameras: 1,
        storage: '100MB',
        videoMinutes: 0
      }
    },
    basic: {
      name: t('profile.plans.basic.name'),
      color: '#1890ff',
      icon: <SafetyOutlined />,
      features: {
        [t('profile.plans.basic.features.free')]: [],
        [t('profile.plans.basic.features.enhanced')]: [
          t('profile.plans.basic.features.enhanced1'),
          t('profile.plans.basic.features.enhanced2'),
          t('profile.plans.basic.features.enhanced3'),
          t('profile.plans.basic.features.enhanced4')
        ],
        [t('profile.plans.basic.features.team')]: [
          t('profile.plans.basic.features.team1'),
          t('profile.plans.basic.features.team2')
        ],
        [t('profile.plans.basic.features.support')]: [
          t('profile.plans.basic.features.support1'),
          t('profile.plans.basic.features.support2')
        ]
      },
      limits: {
        uploads: 100,
        apiCalls: 500,
        teamMembers: 5,
        cameras: 3,
        storage: '10GB',
        videoMinutes: 0
      }
    },
    pro: {
      name: t('profile.plans.pro.name'),
      color: '#722ed1',
      icon: <CrownOutlined />,
      features: {
        [t('profile.plans.pro.features.basic')]: [],
        [t('profile.plans.pro.features.ai')]: [
          t('profile.plans.pro.features.ai1'),
          t('profile.plans.pro.features.ai2'),
          t('profile.plans.pro.features.ai3'),
          t('profile.plans.pro.features.ai4')
        ],
        [t('profile.plans.pro.features.team')]: [
          t('profile.plans.pro.features.team1'),
          t('profile.plans.pro.features.team2'),
          t('profile.plans.pro.features.team3')
        ],
        [t('profile.plans.pro.features.productivity')]: [
          t('profile.plans.pro.features.productivity1'),
          t('profile.plans.pro.features.productivity2'),
          t('profile.plans.pro.features.productivity3')
        ],
        [t('profile.plans.pro.features.support')]: [
          t('profile.plans.pro.features.support1'),
          t('profile.plans.pro.features.support2'),
          t('profile.plans.pro.features.support3')
        ]
      },
      limits: {
        uploads: 500,
        apiCalls: 2000,
        teamMembers: 20,
        cameras: 10,
        storage: '50GB',
        videoMinutes: 100
      }
    },
    enterprise: {
      name: t('profile.plans.enterprise.name'),
      color: '#fa8c16',
      icon: <RocketOutlined />,
      features: {
        [t('profile.plans.enterprise.features.pro')]: [],
        [t('profile.plans.enterprise.features.enterprise')]: [
          t('profile.plans.enterprise.features.enterprise1'),
          t('profile.plans.enterprise.features.enterprise2'),
          t('profile.plans.enterprise.features.enterprise3'),
          t('profile.plans.enterprise.features.enterprise4')
        ],
        [t('profile.plans.enterprise.features.infrastructure')]: [
          t('profile.plans.enterprise.features.infrastructure1'),
          t('profile.plans.enterprise.features.infrastructure2'),
          t('profile.plans.enterprise.features.infrastructure3'),
          t('profile.plans.enterprise.features.infrastructure4')
        ],
        [t('profile.plans.enterprise.features.support')]: [
          t('profile.plans.enterprise.features.support1'),
          t('profile.plans.enterprise.features.support2'),
          t('profile.plans.enterprise.features.support3'),
          t('profile.plans.enterprise.features.support4')
        ]
      },
      limits: {
        uploads: t('profile.limits.unlimited'),
        apiCalls: t('profile.limits.custom'),
        teamMembers: t('profile.limits.unlimited'),
        cameras: t('profile.limits.unlimited'),
        storage: t('profile.limits.custom'),
        videoMinutes: t('profile.limits.custom')
      }
    }
  };

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success(t('profile.updateSuccess'));
      setEditing(false);
    } catch (error) {
      message.error(t('profile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    if (selectedPlan === 'enterprise') {
      window.open('/contact', '_blank');
      message.info(t('profile.salesContact'));
    } else {
      window.location.href = `/pricing?plan=${selectedPlan}&duration=${selectedDuration}`;
    }
    
    setShowUpgradeModal(false);
  };

  const getCurrentPlan = () => {
    const currentPlanName = planData?.plan || user?.plan || 'free';
    return {
      name: currentPlanName,
      data: enhancedPlans[currentPlanName] || enhancedPlans.free,
      isTrial: planData?.isTrial || false,
      expires: planData?.expires || null,
      originalPlan: planData?.originalPlan
    };
  };

  const currentPlan = getCurrentPlan();
  const usagePercentage = (used, total) => {
    if (total === 'Unlimited' || total === 'Custom') return 0;
    return Math.min((used / total) * 100, 100);
  };

  const getMemberSince = () => {
    if (user?.created_at) {
      return new Date(user.created_at).toLocaleDateString();
    }
    return t('profile.na');
  };

  const renderOverview = () => (
    <Row gutter={[24, 24]} className={isRTL ? 'rtl' : 'ltr'}>
      <Col xs={24} lg={8}>
        {/* Profile Card */}
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Badge
                count={
                  <div
                    className="avatar-upload-badge"
                    onClick={() => document.getElementById('avatar-upload-input').click()}
                  >
                    <CameraOutlined style={{ color: 'white', fontSize: 16 }} />
                  </div>
                }
                offset={[-10, 90]}
              >
                <Avatar
                  size={100}
                  src={avatarError ? null : (profileImage || user?.avatar || user?.avatar_url)}
                  className="profile-avatar"
                  icon={avatarError || (!profileImage && !user?.avatar && !user?.avatar_url) ? <UserOutlined /> : null}
                  onClick={() => document.getElementById('avatar-upload-input').click()}
                  onError={() => {
                    console.log('Avatar failed to load, using fallback icon');
                    setAvatarError(true);
                    return true;
                  }}
                />
              </Badge>
              <input
                type="file"
                id="avatar-upload-input"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {uploading && (
                <div className="avatar-upload-loading">
                  <Spin />
                </div>
              )}
            </div>
            
            <Title level={3} style={{ marginTop: 16 }}>{user?.name || t('profile.user')}</Title>
            <Tag color="blue" style={{ marginBottom: 8 }}>
              {user?.role?.toUpperCase() || user?.user_type?.toUpperCase() || t('profile.user')}
            </Tag>
            <Text type="secondary">
              {t('profile.memberSince')} {getMemberSince()}
            </Text>
          </div>

          <Divider />

          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              {user?.email}
            </div>
            {user?.phone && (
              <div>
                <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                {user?.phone}
              </div>
            )}
            {user?.department && (
              <div>
                <UserOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                {user?.department}
              </div>
            )}
            {user?.location && (
              <div>
                <EnvironmentOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                {user?.location}
              </div>
            )}
          </Space>
        </Card>

        {/* ✅ NEW: Company Logo Card */}
        <Card 
          title={
            <Space>
              <BankOutlined />
              <span>Company Logo</span>
            </Space>
          } 
          style={{ marginTop: 24 }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Badge
                count={
                  <div
                    className="avatar-upload-badge"
                    onClick={() => document.getElementById('company-logo-upload-input').click()}
                  >
                    <CameraOutlined style={{ color: 'white', fontSize: 16 }} />
                  </div>
                }
                offset={[-10, 90]}
              >
                <Avatar
                  size={100}
                  src={companyLogoError ? null : companyLogo}
                  className="company-logo-avatar"
                  icon={companyLogoError || !companyLogo ? <BankOutlined /> : null}
                  onClick={() => document.getElementById('company-logo-upload-input').click()}
                  onError={() => {
                    console.log('Company logo failed to load');
                    setCompanyLogoError(true);
                    return true;
                  }}
                  style={{ 
                    borderRadius: '12px',
                    backgroundColor: '#f0f2f5',
                    border: '2px dashed #d9d9d9'
                  }}
                />
              </Badge>
              <input
                type="file"
                id="company-logo-upload-input"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleCompanyLogoFileSelect}
                disabled={uploading}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <Space>
                <Button 
                  size="small" 
                  icon={<CameraOutlined />}
                  onClick={() => document.getElementById('company-logo-upload-input').click()}
                >
                  Upload Logo
                </Button>
                {companyLogo && (
                  <Button 
                    size="small" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveCompanyLogo}
                    loading={loading}
                  >
                    Remove
                  </Button>
                )}
              </Space>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Recommended: Square image, 200x200px, max 5MB
                </Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Plan Card */}
        <Card title={t('profile.currentPlan')} style={{ marginTop: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 32, 
              color: currentPlan.data.color,
              marginBottom: 8 
            }}>
              {currentPlan.data.icon}
            </div>
            <Title level={2} style={{ color: currentPlan.data.color }}>
              {currentPlan.data.name}
            </Title>
            
            {currentPlan.isTrial && (
              <Alert
                message={t('profile.trialVersion')}
                description={`${t('profile.expires')} ${new Date(currentPlan.expires).toLocaleDateString()}`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {currentPlan.originalPlan && currentPlan.originalPlan !== currentPlan.name && (
              <Alert
                message={`${t('profile.original')}: ${currentPlan.originalPlan.toUpperCase()}`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Button 
              type="primary" 
              block 
              onClick={() => setActiveTab('subscription')}
              icon={<SettingOutlined />}
            >
              {t('profile.manageSubscription')}
            </Button>
          </div>
        </Card>
      </Col>

      {/* Right Column - Features & Usage */}
      <Col xs={24} lg={16}>
        {/* Features Access Card */}
        <Card title={t('profile.availableFeatures')}>
          <Row gutter={[16, 16]}>
            {Object.entries(currentPlan.data.features).map(([category, features]) => (
              <Col xs={24} md={12} key={category}>
                <Card size="small" title={category}>
                  <List
                    size="small"
                    dataSource={features}
                    renderItem={feature => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        <Text>{feature}</Text>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Usage Statistics */}
        <Card title={t('profile.usageStats')} style={{ marginTop: 24 }}>
          <Row gutter={[16, 24]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {usageData.uploads.used}/{usageData.uploads.total}
                </div>
                <Text>{t('profile.documentUploads')}</Text>
                <Progress 
                  percent={usagePercentage(usageData.uploads.used, usageData.uploads.total)}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {usageData.apiCalls.used}/{usageData.apiCalls.total}
                </div>
                <Text>{t('profile.apiCalls')}</Text>
                <Progress 
                  percent={usagePercentage(usageData.apiCalls.used, usageData.apiCalls.total)}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                  {usageData.teamMembers.used}/{usageData.teamMembers.total}
                </div>
                <Text>{t('profile.teamMembers')}</Text>
                <Progress 
                  percent={usagePercentage(usageData.teamMembers.used, usageData.teamMembers.total)}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>

            {canAccess('pro') && (
              <>
                <Col xs={24} sm={12} md={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                      {usageData.storage.used}MB/{usageData.storage.total}MB
                    </div>
                    <Text>{t('profile.storageUsed')}</Text>
                    <Progress 
                      percent={usagePercentage(usageData.storage.used, usageData.storage.total)}
                      size="small"
                      style={{ marginTop: 8 }}
                    />
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#eb2f96' }}>
                      {usageData.videoMinutes.used}/{usageData.videoMinutes.total} min
                    </div>
                    <Text>{t('profile.videoAnalysis')}</Text>
                    <Progress 
                      percent={usagePercentage(usageData.videoMinutes.used, usageData.videoMinutes.total)}
                      size="small"
                      style={{ marginTop: 8 }}
                    />
                  </div>
                </Col>
              </>
            )}
          </Row>
        </Card>

        {/* Quick Stats */}
        <Card title={t('profile.quickStats')} style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>{quickStats.incidents}</div>
                <Text>{t('profile.stats.incidents')}</Text>
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>{quickStats.documents}</div>
                <Text>{t('profile.stats.documents')}</Text>
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>{quickStats.tasks}</div>
                <Text>{t('profile.stats.tasks')}</Text>
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f5222d' }}>{quickStats.alerts}</div>
                <Text>{t('profile.stats.alerts')}</Text>
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>{quickStats.team}</div>
                <Text>{t('profile.stats.team')}</Text>
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#13c2c2' }}>{quickStats.completion}%</div>
                <Text>{t('profile.stats.completion')}</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );

  const renderSubscription = () => (
    <div className={isRTL ? 'rtl' : 'ltr'}>
      <Card title={t('profile.subscriptionDetails')}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label={t('profile.currentPlan')}>
            <Tag color={currentPlan.data.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
              {currentPlan.data.icon} {currentPlan.data.name.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('profile.status')}>
            <Badge status="success" text={t('profile.active')} />
            {currentPlan.isTrial && <Tag color="orange" style={{ marginLeft: 8 }}>{t('profile.trial')}</Tag>}
          </Descriptions.Item>
          {currentPlan.expires && (
            <Descriptions.Item label={t('profile.renewalDate')}>
              {new Date(currentPlan.expires).toLocaleDateString()}
            </Descriptions.Item>
          )}
          {currentPlan.originalPlan && (
            <Descriptions.Item label={t('profile.originalPlan')}>
              {currentPlan.originalPlan.toUpperCase()}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider />

        <Title level={4}>{t('profile.planComparison')}</Title>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {Object.entries(enhancedPlans).map(([planId, plan]) => {
            const isCurrent = planId === currentPlan.name;
            return (
              <Col xs={24} md={6} key={planId}>
                <Card 
                  style={{ 
                    border: isCurrent ? `2px solid ${plan.color}` : '1px solid #d9d9d9',
                    opacity: !canAccess(planId) && !isCurrent ? 0.6 : 1
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, color: plan.color, marginBottom: 8 }}>
                      {plan.icon}
                    </div>
                    <Title level={4}>{plan.name}</Title>
                    
                    {isCurrent && (
                      <Tag color="green" style={{ marginBottom: 16 }}>
                        {t('profile.currentPlan')}
                      </Tag>
                    )}

                    {planId === 'pro' && !isCurrent && (
                      <Tag color="blue" style={{ marginBottom: 16 }}>
                        <CrownOutlined /> {t('profile.recommended')}
                      </Tag>
                    )}
                  </div>

                  <List
                    size="small"
                    dataSource={Object.values(plan.features).flat()}
                    renderItem={feature => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        <Text>{feature}</Text>
                      </List.Item>
                    )}
                  />

                  <Button
                    type={planId === 'pro' ? 'primary' : 'default'}
                    block
                    style={{ marginTop: 16 }}
                    onClick={() => handlePlanSelect(planId)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? t('profile.currentPlan') : 
                     planId === 'enterprise' ? t('profile.contactSales') : t('profile.upgrade')}
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      <Card title={t('profile.detailedUsageLimits')} style={{ marginTop: 24 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          {Object.entries(currentPlan.data.limits).map(([key, value]) => (
            <Descriptions.Item key={key} label={t(`profile.limits.${key}`)}>
              <Text strong>{value}</Text>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
    </div>
  );

  const renderEditProfile = () => (
    <div className={isRTL ? 'rtl' : 'ltr'}>
      <Card title={t('profile.editProfile')}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          initialValues={{
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
            department: user?.department,
            location: user?.location
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('profile.fullName')}
                name="name"
                rules={[{ required: true, message: t('profile.enterName') }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('profile.email')}
                name="email"
                rules={[
                  { required: true, message: t('profile.enterEmail') },
                  { type: 'email', message: t('profile.validEmail') }
                ]}
              >
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('profile.phoneNumber')}
                name="phone"
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('profile.department')}
                name="department"
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t('profile.location')}
            name="location"
          >
            <Input prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {t('profile.saveChanges')}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setEditing(false)}>
              {t('profile.cancel')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  if (!user) {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={`profile-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: 24 }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={1}>
          <UserOutlined /> {t('profile.profileDashboard')}
        </Title>
        <Text type="secondary">
          {t('profile.manageAccount')}
        </Text>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className={isRTL ? 'rtl-tabs' : ''}
        items={[
          {
            key: 'overview',
            label: t('profile.overview'),
            icon: <DashboardOutlined />,
            children: renderOverview()
          },
          {
            key: 'subscription',
            label: t('profile.subscription'),
            icon: <CreditCardOutlined />,
            children: renderSubscription()
          },
          {
            key: 'edit',
            label: t('profile.editProfile'),
            icon: <EditOutlined />,
            children: renderEditProfile()
          }
        ]}
      />

      {/* Upgrade Modal */}
      <Modal
        title={`${t('profile.upgradeTo')} ${selectedPlan?.toUpperCase()}`}
        open={showUpgradeModal}
        onCancel={() => setShowUpgradeModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowUpgradeModal(false)}>
            {t('profile.cancel')}
          </Button>,
          <Button 
            key="upgrade" 
            type="primary" 
            onClick={handleUpgrade}
          >
            {selectedPlan === 'enterprise' ? t('profile.contactSales') : t('profile.proceedPayment')}
          </Button>
        ]}
      >
        {selectedPlan && (
          <div>
            <Alert
              message={t('profile.upgradeSummary')}
              description={
                <div>
                  <p><strong>{t('profile.from')}:</strong> {currentPlan.data.name}</p>
                  <p><strong>{t('profile.to')}:</strong> {enhancedPlans[selectedPlan]?.name}</p>
                  <p><strong>{t('profile.billing')}:</strong> {selectedDuration}</p>
                </div>
              }
              type="info"
              showIcon
            />

            <div style={{ marginTop: 16 }}>
              <Title level={5}>{t('profile.newFeatures')}</Title>
              <List
                size="small"
                dataSource={Object.values(enhancedPlans[selectedPlan]?.features).flat().slice(0, 5)}
                renderItem={feature => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    <Text>{feature}</Text>
                  </List.Item>
                )}
              />
            </div>

            <Alert
              message={t('profile.important')}
              description={t('profile.upgradeWarning')}
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;