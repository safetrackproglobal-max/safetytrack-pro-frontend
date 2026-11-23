// Settings: language / time zone, password + two-factor + sessions, notification preferences — all saved to the server.
import React, { useCallback, useEffect, useState } from 'react';
import {
  Card, Tabs, Form, Input, Button, Switch, Select, Divider, message, Alert, Row, Col, Typography, Space, Tag, Modal,
  List, Steps, Segmented, Skeleton, Popconfirm, Progress,
} from 'antd';
import {
  SettingOutlined, BellOutlined, LockOutlined, GlobalOutlined, SaveOutlined, SafetyOutlined, MobileOutlined,
  LaptopOutlined, LogoutOutlined, KeyOutlined, CopyOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import dashboardService from '../services/dashboardService';

const { Text, Title, Paragraph } = Typography;
const TABS = ['general', 'security', 'notifications'];
const ZONES = (typeof Intl !== 'undefined' && Intl.supportedValuesOf) ? Intl.supportedValuesOf('timeZone') : ['UTC', 'Africa/Accra', 'Europe/London', 'America/New_York'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'];
// same policy as signup and /api/auth/change-password
const PASSWORD_RULES = [
  { test: (p) => p.length >= 12, label: '12+ characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'an uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'a lowercase letter' },
  { test: (p) => /\d/.test(p), label: 'a number' },
];
const NOTIFY_CATEGORIES = [
  { key: 'incidents', label: 'Incidents & investigations' },
  { key: 'actions', label: 'Corrective actions assigned to me' },
  { key: 'expiry', label: 'Expiring documents, permits & certificates' },
  { key: 'approvals', label: 'Documents waiting for my signature' },
  { key: 'environmental', label: 'Environmental alerts' },
  { key: 'compliance', label: 'Compliance & regulatory deadlines' },
  { key: 'system', label: 'System maintenance' },
  { key: 'features', label: 'New features' },
];
const errText = (e, fallback) => e?.response?.data?.error || e?.response?.data?.message || e?.message || fallback;
const tr = (t, key, fallback) => t(key) || fallback;

function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages, isLoading: languageLoading, isRTL } = useLanguage();
  const history = useHistory();
  const { tab } = useParams();
  const activeTab = TABS.includes(tab) ? tab : 'general';
  const [generalForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // ---------------- general
  useEffect(() => {
    let df = 'DD/MM/YYYY';
    try { df = localStorage.getItem('dateFormat') || df; } catch (e) { /* private mode */ }
    generalForm.setFieldsValue({
      language: currentLanguage || 'en',
      timezone: user?.timezone && user.timezone !== 'UTC' ? user.timezone : (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'),
      dateFormat: df,
    });
  }, [currentLanguage, user, generalForm]);

  const saveGeneral = async (values) => {
    setSavingGeneral(true);
    try {
      if (values.language && values.language !== currentLanguage) await changeLanguage(values.language);
      await dashboardService.updateMyProfile({ timezone: values.timezone, preferred_language: values.language });
      try { localStorage.setItem('dateFormat', values.dateFormat); } catch (e) { /* ignore */ }
      if (refreshUser) await refreshUser();
      message.success(tr(t, 'settings.settingsUpdated', 'Settings saved'));
    } catch (e) {
      message.error(errText(e, tr(t, 'settings.updateFailed', 'Could not save settings')));
    } finally {
      setSavingGeneral(false);
    }
  };

  // ---------------- password
  const changePassword = async (values) => {
    setSavingPassword(true);
    try {
      const res = await dashboardService.changePassword({
        current_password: values.currentPassword, new_password: values.newPassword, confirm_password: values.confirmPassword,
      });
      if (res?.success === false) throw new Error(res.error);
      passwordForm.resetFields();
      Modal.success({
        title: tr(t, 'settings.passwordUpdated', 'Password changed'),
        content: 'For your security every device has been signed out. Please sign in again with your new password.',
        onOk: async () => { await logout(); history.push('/login'); },
      });
    } catch (e) {
      message.error(errText(e, tr(t, 'settings.passwordUpdateFailed', 'Could not change the password')));
    } finally {
      setSavingPassword(false);
    }
  };

  // ---------------- two-factor
  const [mfa, setMfa] = useState({ step: null, secret: null, qr: null, codes: null });
  const [mfaCode, setMfaCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const mfaEnabled = !!user?.mfa_enabled && !mfa.codes;
  const startMfa = async () => {
    setMfaBusy(true);
    try {
      const res = await dashboardService.mfaSetup();
      setMfa({ step: 1, secret: res.mfa_secret, qr: res.mfa_qr_data_url, codes: null });
    } catch (e) {
      message.error(errText(e, 'Two-factor setup is not available right now'));
    } finally {
      setMfaBusy(false);
    }
  };
  const verifyMfa = async () => {
    if (!/^\d{6}$/.test(mfaCode)) { message.warning('Enter the 6-digit code from your authenticator app'); return; }
    setMfaBusy(true);
    try {
      const res = await dashboardService.mfaVerify(mfaCode);
      setMfa((m) => ({ ...m, step: 2, codes: res.mfa_backup_codes || [] }));
      setMfaCode('');
      if (refreshUser) refreshUser();
      message.success('Two-factor authentication is on');
    } catch (e) {
      message.error(errText(e, 'That code did not work — check the time on your phone and try again'));
    } finally {
      setMfaBusy(false);
    }
  };
  const disableMfa = () => {
    let pw = '';
    Modal.confirm({
      title: 'Turn off two-factor authentication?', icon: <LockOutlined />, okText: 'Turn off', okButtonProps: { danger: true },
      content: <Input.Password autoFocus placeholder="Your password" onChange={(e) => { pw = e.target.value; }} />,
      onOk: async () => {
        try {
          await dashboardService.mfaDisable(pw);
          message.success('Two-factor authentication is off');
          if (refreshUser) await refreshUser();
        } catch (e) {
          message.error(errText(e, 'Could not turn it off'));
          throw e;
        }
      },
    });
  };

  // ---------------- sessions
  const [sessions, setSessions] = useState(null);
  const loadSessions = useCallback(async () => {
    try {
      const res = await dashboardService.getUserSessions();
      setSessions(res?.sessions || res?.data || []);
    } catch (e) {
      setSessions([]);
    }
  }, []);
  useEffect(() => { if (activeTab === 'security') loadSessions(); }, [activeTab, loadSessions]);
  const signOutEverywhere = () => {
    let pw = '';
    Modal.confirm({
      title: 'Sign out of all devices?', icon: <LogoutOutlined />, okText: 'Sign out everywhere', okButtonProps: { danger: true },
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Every phone, tablet and browser — including this one — will need to sign in again.</Text>
          <Input.Password autoFocus placeholder="Confirm with your password" onChange={(e) => { pw = e.target.value; }} />
        </Space>
      ),
      onOk: async () => {
        try {
          await dashboardService.revokeAllSessions(pw);
          message.success('Signed out everywhere');
          await logout();
          history.push('/login');
        } catch (e) {
          message.error(errText(e, 'Could not sign out'));
          throw e;
        }
      },
    });
  };
  const endSession = async (id) => {
    try { await dashboardService.terminateSession(id); message.success('Session ended'); loadSessions(); } catch (e) { message.error(errText(e, 'Could not end that session')); }
  };

  // ---------------- notifications
  const [prefs, setPrefs] = useState(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  useEffect(() => {
    if (activeTab !== 'notifications' || prefs) return;
    dashboardService.getUserPreferences()
      .then((p) => setPrefs({
        emailNotifications: p?.emailNotifications !== false, pushNotifications: p?.pushNotifications !== false,
        browserNotifications: p?.browserNotifications !== false, notificationFrequency: p?.notificationFrequency || 'realtime',
        categories: { ...Object.fromEntries(NOTIFY_CATEGORIES.map((c) => [c.key, c.key !== 'system'])), ...(p?.categories || {}) },
      }))
      .catch(() => setPrefs({ emailNotifications: true, pushNotifications: true, browserNotifications: true, notificationFrequency: 'realtime',
        categories: Object.fromEntries(NOTIFY_CATEGORIES.map((c) => [c.key, true])) }));
  }, [activeTab, prefs]);
  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      const clean = { ...prefs, categories: Object.fromEntries(NOTIFY_CATEGORIES.map((c) => [c.key, !!prefs.categories[c.key]])) };
      await dashboardService.updateUserPreferences(clean);
      message.success(tr(t, 'settings.notificationsUpdated', 'Notification preferences saved'));
    } catch (e) {
      message.error(errText(e, tr(t, 'settings.notificationsUpdateFailed', 'Could not save')));
    } finally {
      setSavingPrefs(false);
    }
  };

  const passed = PASSWORD_RULES.filter((r) => r.test(newPassword)).length;

  const items = [
    {
      key: 'general', label: <span><SettingOutlined /> {tr(t, 'settings.tabs.general', 'General')}</span>,
      children: (
        <Card title={tr(t, 'settings.generalSettings', 'General settings')}>
          <Form form={generalForm} layout="vertical" onFinish={saveGeneral}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label={tr(t, 'settings.language', 'Language')} name="language" rules={[{ required: true }]}>
                  <Select suffixIcon={<GlobalOutlined />} loading={languageLoading} disabled={languageLoading} showSearch optionFilterProp="label"
                          options={availableLanguages.map((l) => ({ value: l.code, label: `${l.flag || ''} ${l.nativeName} (${l.name})` }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={tr(t, 'settings.timezone', 'Time zone')} name="timezone" extra="Deadlines and reminders use this time zone">
                  <Select showSearch options={ZONES.map((z) => ({ value: z, label: z.replace(/_/g, ' ') }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={tr(t, 'settings.dateFormat', 'Date format')} name="dateFormat">
                  <Segmented options={DATE_FORMATS} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" loading={savingGeneral} icon={<SaveOutlined />}>{tr(t, 'settings.saveSettings', 'Save settings')}</Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security', label: <span><LockOutlined /> {tr(t, 'settings.tabs.security', 'Security')}</span>,
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card title={<Space><KeyOutlined /> {tr(t, 'settings.securitySettings', 'Change password')}</Space>}>
            <Form form={passwordForm} layout="vertical" onFinish={changePassword} style={{ maxWidth: 480 }}>
              <Form.Item label={tr(t, 'settings.currentPassword', 'Current password')} name="currentPassword" rules={[{ required: true }]}>
                <Input.Password autoComplete="current-password" />
              </Form.Item>
              <Form.Item label={tr(t, 'settings.newPassword', 'New password')} name="newPassword" hasFeedback
                         rules={[{ required: true }, { validator: (_, v) => (PASSWORD_RULES.every((r) => r.test(v || '')) ? Promise.resolve() : Promise.reject(new Error(`Needs ${PASSWORD_RULES.filter((r) => !r.test(v || '')).map((r) => r.label).join(', ')}`))) }]}>
                <Input.Password autoComplete="new-password" onChange={(e) => setNewPassword(e.target.value)} />
              </Form.Item>
              {newPassword && <Progress percent={(passed / PASSWORD_RULES.length) * 100} showInfo={false} size="small"
                                        strokeColor={passed === 4 ? '#52c41a' : passed >= 2 ? '#faad14' : '#f5222d'} style={{ marginTop: -16, marginBottom: 12 }} />}
              <Form.Item label={tr(t, 'settings.confirmPassword', 'Confirm new password')} name="confirmPassword" dependencies={['newPassword']} hasFeedback
                         rules={[{ required: true }, ({ getFieldValue }) => ({ validator: (_, v) => (!v || getFieldValue('newPassword') === v ? Promise.resolve() : Promise.reject(new Error(tr(t, 'settings.passwordsDontMatch', 'Passwords do not match')))) })]}>
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={savingPassword} icon={<SaveOutlined />}>{tr(t, 'settings.updatePassword', 'Update password')}</Button>
              <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>After changing it you will be signed out on every device.</Paragraph>
            </Form>
          </Card>

          <Card title={<Space><SafetyOutlined /> Two-factor authentication</Space>}
                extra={mfaEnabled ? <Tag color="green" icon={<CheckCircleOutlined />}>On</Tag> : <Tag color="red">Off</Tag>}>
            {mfa.step === 2 ? (
              <Alert type="success" showIcon message="Two-factor authentication is on — save your backup codes"
                     description={(
                       <Space direction="vertical">
                         <Text>Each code works once if you lose your phone. Store them somewhere safe; they will not be shown again.</Text>
                         <div className="settings-codes" style={{ fontFamily: 'monospace', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 4 }}>
                           {(mfa.codes || []).map((c) => <span key={c}>{c}</span>)}
                         </div>
                         <Space>
                           <Button icon={<CopyOutlined />} onClick={() => { navigator.clipboard?.writeText((mfa.codes || []).join('\n')); message.success('Copied'); }}>Copy codes</Button>
                           <Button onClick={() => setMfa({ step: null, secret: null, qr: null, codes: null })}>Done</Button>
                         </Space>
                       </Space>
                     )} />
            ) : mfa.step === 1 ? (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Steps size="small" current={1} items={[{ title: 'Scan' }, { title: 'Confirm' }, { title: 'Backup codes' }]} />
                <Row gutter={16} align="middle">
                  <Col xs={24} sm={10}>
                    {mfa.qr ? <img src={mfa.qr} alt="Scan with your authenticator app" style={{ width: '100%', maxWidth: 200 }} />
                      : <Alert type="info" message="Add the key below to your authenticator app manually." />}
                  </Col>
                  <Col xs={24} sm={14}>
                    <Text>1. Scan the code with Google Authenticator, Microsoft Authenticator or Authy.</Text><br />
                    <Text type="secondary">Or type this key: </Text><Text code copyable>{mfa.secret}</Text>
                    <div style={{ marginTop: 12 }}><Text>2. Enter the 6-digit code it shows:</Text></div>
                    <Space.Compact style={{ marginTop: 6 }}>
                      <Input value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric"
                             placeholder="123456" style={{ width: 140 }} onPressEnter={verifyMfa} />
                      <Button type="primary" loading={mfaBusy} onClick={verifyMfa}>Turn on</Button>
                    </Space.Compact>
                  </Col>
                </Row>
                <Button type="link" onClick={() => setMfa({ step: null, secret: null, qr: null, codes: null })} style={{ padding: 0 }}>Cancel</Button>
              </Space>
            ) : mfaEnabled ? (
              <Space direction="vertical">
                <Text>Sign-ins need a code from your authenticator app as well as your password.</Text>
                <Button danger onClick={disableMfa}>Turn off</Button>
              </Space>
            ) : (
              <Space direction="vertical">
                <Text>Protect your account with a 6-digit code from your phone at sign-in.
                  {['admin', 'company_admin'].includes(user?.user_type) && <Text type="danger"> Strongly recommended for admins.</Text>}</Text>
                <Button type="primary" icon={<MobileOutlined />} loading={mfaBusy} onClick={startMfa}>Set up two-factor</Button>
              </Space>
            )}
          </Card>

          <Card title={<Space><LaptopOutlined /> Where you're signed in</Space>}
                extra={<Button danger icon={<LogoutOutlined />} onClick={signOutEverywhere}>Sign out everywhere</Button>}>
            {sessions === null ? <Skeleton active paragraph={{ rows: 2 }} /> : (
              <List size="small" dataSource={sessions} locale={{ emptyText: 'No session history recorded' }}
                    renderItem={(s) => (
                      <List.Item actions={s.is_current ? [<Tag key="c" color="blue">This device</Tag>] : [
                        <Popconfirm key="e" title="End this session?" onConfirm={() => endSession(s.id)}><Button size="small" type="link">End</Button></Popconfirm>]}>
                        <List.Item.Meta avatar={/mobile|android|iphone/i.test(s.device_info || '') ? <MobileOutlined /> : <LaptopOutlined />}
                                        title={(s.device_info || 'Unknown device').slice(0, 80)}
                                        description={`${s.ip_address || ''}${s.location && s.location !== 'Unknown' ? ` · ${s.location}` : ''} · last active ${s.last_activity ? new Date(s.last_activity).toLocaleString() : '—'}`} />
                      </List.Item>
                    )} />
            )}
          </Card>
        </Space>
      ),
    },
    {
      key: 'notifications', label: <span><BellOutlined /> {tr(t, 'settings.tabs.notifications', 'Notifications')}</span>,
      children: (
        <Card title={tr(t, 'settings.notificationSettings', 'Notification settings')}>
          {!prefs ? <Skeleton active /> : (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                {[['emailNotifications', 'Email'], ['pushNotifications', 'In-app'], ['browserNotifications', 'Browser pop-ups']].map(([k, label]) => (
                  <Col xs={24} sm={8} key={k}>
                    <Space><Switch checked={prefs[k]} onChange={(v) => setPrefs((p) => ({ ...p, [k]: v }))} /> <Text>{label}</Text></Space>
                  </Col>
                ))}
              </Row>
              <div>
                <Text strong>How often</Text>
                <div style={{ marginTop: 6 }}>
                  <Segmented value={prefs.notificationFrequency} onChange={(v) => setPrefs((p) => ({ ...p, notificationFrequency: v }))}
                             options={[{ value: 'realtime', label: 'Right away' }, { value: 'hourly', label: 'Hourly' }, { value: 'daily', label: 'Daily digest' }, { value: 'weekly', label: 'Weekly' }]} />
                </div>
              </div>
              <Divider style={{ margin: '4px 0' }} />
              <Text strong>Tell me about</Text>
              <Row gutter={[16, 12]}>
                {NOTIFY_CATEGORIES.map((c) => (
                  <Col xs={24} sm={12} key={c.key}>
                    <Space><Switch size="small" checked={!!prefs.categories[c.key]}
                                   onChange={(v) => setPrefs((p) => ({ ...p, categories: { ...p.categories, [c.key]: v } }))} /> <Text>{c.label}</Text></Space>
                  </Col>
                ))}
              </Row>
              <Button type="primary" icon={<SaveOutlined />} loading={savingPrefs} onClick={savePrefs}>{tr(t, 'settings.saveNotifications', 'Save notification settings')}</Button>
            </Space>
          )}
        </Card>
      ),
    },
  ];

  return (
    <div className={`settings-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: 24, maxWidth: 1100 }}>
      <Space align="center" size="middle" style={{ marginBottom: 16 }}>
        <SettingOutlined style={{ fontSize: 28, color: '#1677ff' }} />
        <div>
          <Title level={2} style={{ margin: 0 }}>{tr(t, 'settings.title', 'Settings')}</Title>
          <Text type="secondary">{tr(t, 'settings.description', 'Manage your preferences and account security')}</Text>
        </div>
      </Space>
      <Tabs activeKey={activeTab} onChange={(k) => history.push(`/settings/${k}`)} items={items} className={isRTL ? 'rtl-tabs' : ''} />
    </div>
  );
}

export default SettingsPage;
