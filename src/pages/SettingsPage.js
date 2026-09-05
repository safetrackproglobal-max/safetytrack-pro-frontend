import React, { useState, useContext, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Divider,
  message,
  Alert,
  Row,
  Col,
  Typography,
  Space,
  Tag
} from 'antd';
import { 
  SettingOutlined, 
  BellOutlined, 
  LockOutlined,
  GlobalOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext'; 
import { useLanguage } from '../context/LanguageContext'; 
import { useTranslation } from 'react-i18next'; 

const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

function SettingsPage() {
  const { user, updateUserLanguage } = useAuth();
  const { t, i18n } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages, isLoading: languageLoading, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [settingsForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('general');

  // Set initial form values when language context loads
  useEffect(() => {
    if (currentLanguage) {
      settingsForm.setFieldsValue({
        language: currentLanguage
      });
    }
  }, [currentLanguage, settingsForm]);

  const onSettingsFinish = async (values) => {
    setLoading(true);
    try {
      // Handle language change separately
      if (values.language && values.language !== currentLanguage) {
        await changeLanguage(values.language);
        message.success(t('settings.languageUpdated'));
      }

      // Handle other settings (simulate API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(t('settings.settingsUpdated'));
    } catch (error) {
      console.error('Settings update error:', error);
      message.error(t('settings.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onPasswordFinish = async (values) => {
    setLoading(true);
    try {
      // Simulate password update API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(t('settings.passwordUpdated'));
      passwordForm.resetFields();
    } catch (error) {
      message.error(t('settings.passwordUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onNotificationFinish = async (values) => {
    setLoading(true);
    try {
      // Simulate notification settings API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(t('settings.notificationsUpdated'));
    } catch (error) {
      message.error(t('settings.notificationsUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Get current language display
  const getCurrentLanguageDisplay = () => {
    const lang = availableLanguages.find(l => l.code === currentLanguage);
    if (lang) {
      return `${lang.flag} ${lang.nativeName} (${lang.name})`;
    }
    return currentLanguage?.toUpperCase() || 'EN';
  };

  // Get language direction
  const getLanguageDirection = (langCode) => {
    const lang = availableLanguages.find(l => l.code === langCode);
    return lang?.dir || 'ltr';
  };

  return (
    <div 
      className={`settings-page ${isRTL ? 'rtl' : 'ltr'}`} 
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ padding: 24 }}
    >
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Space align="center" size="middle">
          <SettingOutlined style={{ fontSize: 28, color: '#1890ff' }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {t('settings.title')}
            </Title>
            <Text type="secondary">{t('settings.description')}</Text>
          </div>
        </Space>
        
        <div style={{ marginTop: 12 }}>
          <Tag color="blue" icon={<GlobalOutlined />}>
            {t('settings.currentLanguage')}: {getCurrentLanguageDisplay()}
          </Tag>
          {isRTL && (
            <Tag color="purple" icon={<SafetyOutlined />}>
              RTL
            </Tag>
          )}
        </div>
      </div>

      <Tabs 
        defaultActiveKey="general" 
        activeKey={activeTab}
        onChange={setActiveTab}
        className={isRTL ? 'rtl-tabs' : ''}
      >
        <TabPane 
          tab={
            <span>
              <SettingOutlined />
              {t('settings.tabs.general')}
            </span>
          } 
          key="general"
        >
          <Card title={t('settings.generalSettings')}>
            <Form
              form={settingsForm}
              layout="vertical"
              onFinish={onSettingsFinish}
              initialValues={{
                language: currentLanguage || 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                emailNotifications: true,
                pushNotifications: false,
                smsNotifications: false
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={t('settings.language')}
                    name="language"
                    rules={[{ required: true, message: t('settings.languageRequired') }]}
                  >
                    <Select
                      placeholder={t('settings.selectLanguage')}
                      suffixIcon={<GlobalOutlined />}
                      loading={languageLoading}
                      disabled={languageLoading}
                      showSearch
                      filterOption={(input, option) => {
                        const children = option?.children?.join?.('') || '';
                        return children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                      }}
                    >
                      {availableLanguages.map(lang => (
                        <Option key={lang.code} value={lang.code}>
                          <span style={{ marginRight: 8 }}>{lang.flag}</span>
                          {lang.nativeName} ({lang.name})
                          {lang.dir === 'rtl' && (
                            <Tag color="purple" size="small" style={{ marginLeft: 8 }}>
                              RTL
                            </Tag>
                          )}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {currentLanguage && (
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: -8, marginBottom: 16 }}>
                      {t('settings.currentLanguage')}: <strong>{getCurrentLanguageDisplay()}</strong>
                      {isRTL && <span style={{ marginLeft: 8 }}>🔀 RTL</span>}
                    </Text>
                  )}
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={t('settings.timezone')}
                    name="timezone"
                  >
                    <Select placeholder={t('settings.selectTimezone')}>
                      <Option value="UTC">UTC (GMT)</Option>
                      <Option value="EST">EST (UTC-5)</Option>
                      <Option value="PST">PST (UTC-8)</Option>
                      <Option value="CET">CET (UTC+1)</Option>
                      <Option value="IST">IST (UTC+5:30)</Option>
                      <Option value="JST">JST (UTC+9)</Option>
                      <Option value="AEDT">AEDT (UTC+11)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={t('settings.dateFormat')}
                name="dateFormat"
              >
                <Select>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY (US)</Option>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY (EU)</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</Option>
                  <Option value="DD-MM-YYYY">DD-MM-YYYY (UK)</Option>
                </Select>
              </Form.Item>

              <Divider>{t('settings.notificationPreferences')}</Divider>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label={t('settings.emailNotifications')}
                    name="emailNotifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label={t('settings.pushNotifications')}
                    name="pushNotifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label={t('settings.smsNotifications')}
                    name="smsNotifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginTop: 16 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  icon={<SaveOutlined />}
                  disabled={languageLoading}
                  size="large"
                >
                  {t('settings.saveSettings')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <LockOutlined />
              {t('settings.tabs.security')}
            </span>
          } 
          key="security"
        >
          <Card title={t('settings.securitySettings')}>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onPasswordFinish}
            >
              <Form.Item
                label={t('settings.currentPassword')}
                name="currentPassword"
                rules={[{ required: true, message: t('settings.currentPasswordRequired') }]}
              >
                <Input.Password placeholder={t('settings.enterCurrentPassword')} />
              </Form.Item>

              <Form.Item
                label={t('settings.newPassword')}
                name="newPassword"
                rules={[
                  { required: true, message: t('settings.newPasswordRequired') },
                  { min: 8, message: t('settings.passwordMinLength') }
                ]}
                hasFeedback
              >
                <Input.Password placeholder={t('settings.enterNewPassword')} />
              </Form.Item>

              <Form.Item
                label={t('settings.confirmPassword')}
                name="confirmPassword"
                dependencies={['newPassword']}
                hasFeedback
                rules={[
                  { required: true, message: t('settings.confirmPasswordRequired') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('settings.passwordsDontMatch')));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder={t('settings.confirmNewPassword')} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} size="large">
                  {t('settings.updatePassword')}
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            <Alert
              message={
                <span>
                  <SafetyOutlined /> {t('settings.securityTips')}
                </span>
              }
              description={t('settings.securityDescription')}
              type="info"
              showIcon
              icon={<LockOutlined />}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <BellOutlined />
              {t('settings.tabs.notifications')}
            </span>
          } 
          key="notifications"
        >
          <Card title={t('settings.notificationSettings')}>
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={onNotificationFinish}
              initialValues={{
                incidentAlerts: true,
                riskUpdates: true,
                complianceDeadlines: true,
                systemMaintenance: false,
                newFeatures: true
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('settings.incidentAlerts')}
                    name="incidentAlerts"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('settings.riskAssessmentUpdates')}
                    name="riskUpdates"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('settings.complianceDeadlines')}
                    name="complianceDeadlines"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('settings.systemMaintenance')}
                    name="systemMaintenance"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('settings.newFeatures')}
                    name="newFeatures"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginTop: 16 }}>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} size="large">
                  {t('settings.saveNotifications')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>

      {/* Current Settings Summary */}
      <Card style={{ marginTop: 24, background: '#fafafa' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary">{t('settings.currentLanguage')}</Text>
            <div>
              <Text strong>{getCurrentLanguageDisplay()}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary">{t('settings.timezone')}</Text>
            <div>
              <Text strong>UTC</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary">{t('settings.dateFormat')}</Text>
            <div>
              <Text strong>MM/DD/YYYY</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary">{t('settings.notificationPreferences')}</Text>
            <div>
              <Text strong>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> {t('settings.emailNotifications')}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default SettingsPage;