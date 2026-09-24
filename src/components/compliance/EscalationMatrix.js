// src/components/compliance/EscalationMatrix.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Tag, Space, Modal, Form, Input, Select,
  InputNumber, Row, Col, message, Switch, Tooltip, Badge,
  Alert, Divider, Timeline, Statistic, Progress, List, Avatar,
  Collapse, Descriptions, Popconfirm, notification, Drawer,
  Tabs, Radio, Checkbox, TimePicker, Empty, Spin, Typography
} from 'antd';
import {
  WarningOutlined, ClockCircleOutlined, UserOutlined,
  ArrowUpOutlined, BellOutlined, MailOutlined, PhoneOutlined,
  TeamOutlined, SafetyCertificateOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, ThunderboltOutlined, FireOutlined,
  InfoCircleOutlined, SettingOutlined, PlayCircleOutlined,
  PauseCircleOutlined, ReloadOutlined, SendOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// ✅ SERVICE IMPORTS
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const { Text, Title: AntTitle, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// ==================== CONSTANTS ====================

const ESCALATION_ROLES = {
  super_admin: { label: 'Super Admin', color: 'red', icon: <SafetyCertificateOutlined /> },
  company_admin: { label: 'Company Admin', color: 'orange', icon: <UserOutlined /> },
  safety_officer: { label: 'Safety Officer', color: 'blue', icon: <SafetyCertificateOutlined /> },
  lead_investigator: { label: 'Lead Investigator', color: 'purple', icon: <TeamOutlined /> },
  manager: { label: 'Manager', color: 'cyan', icon: <UserOutlined /> },
  assignee: { label: 'Assignee', color: 'green', icon: <UserOutlined /> },
  reporter: { label: 'Reporter', color: 'default', icon: <UserOutlined /> }
};

const NOTIFICATION_CHANNELS = {
  email: { label: 'Email', icon: <MailOutlined />, color: 'blue' },
  sms: { label: 'SMS', icon: <PhoneOutlined />, color: 'green' },
  push: { label: 'Push', icon: <BellOutlined />, color: 'purple' },
  in_app: { label: 'In-App', icon: <BellOutlined />, color: 'cyan' }
};

// ==================== ESCALATION MATRIX COMPONENT ====================

const EscalationMatrix = ({ incidents = [], onEscalate }) => {
  // ✅ Get user
  const { user: currentUser } = useAuth();

  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [escalationLog, setEscalationLog] = useState([]);
  const [activeTab, setActiveTab] = useState('rules');
  const [form] = Form.useForm();
  const [testingRule, setTestingRule] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ==================== FETCH RULES ====================

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.getEscalationRules();
      const rulesData = response?.rules || response?.data?.rules || (Array.isArray(response) ? response : []) || [];
      setRules(rulesData);
    } catch (error) {
      console.warn('Escalation rules API unavailable:', error);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== FETCH PENDING ESCALATIONS ====================

  const fetchPendingEscalations = useCallback(async () => {
    try {
      const response = await notificationService.getPendingEscalations();
      const pending = response?.pending || response?.data?.pending || [];
      
      // Merge with rule info
      const enriched = pending.map(item => ({
        ...item,
        incident: item.incident,
        rule: item.rule,
        reasons: item.reasons || [],
        urgency: item.urgency || (item.rule?.priority <= 2 ? 'high' : 'medium')
      }));
      
      // Store separately if needed
    } catch (error) {
      console.warn('Pending escalations API unavailable');
    }
  }, []);

  // ==================== FETCH HISTORY ====================

  const fetchEscalationHistory = useCallback(async () => {
    try {
      const response = await notificationService.getEscalationHistory();
      const history = response?.history || response?.data || [];
      setEscalationLog(history);
    } catch (error) {
      console.warn('Escalation history API unavailable');
    }
  }, []);

  // Load rules on mount
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Load history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history') {
      fetchEscalationHistory();
    }
  }, [activeTab, fetchEscalationHistory]);

  // ==================== COMPUTE ESCALATABLE INCIDENTS ====================

  const escalatableIncidents = React.useMemo(() => {
    if (!incidents.length || !rules.length) return [];
    
    const results = [];

    incidents.forEach(incident => {
      rules.filter(r => r.enabled).forEach(rule => {
        let matches = true;
        let reasons = [];

        // Check severity
        if (rule.conditions?.severity && rule.conditions.severity.length > 0) {
          if (!rule.conditions.severity.includes(incident.severity)) {
            matches = false;
          } else {
            reasons.push(`Severity: ${incident.severity}`);
          }
        }

        // Check status
        if (matches && rule.conditions?.status && rule.conditions.status.length > 0) {
          if (!rule.conditions.status.includes(incident.status)) {
            matches = false;
          } else {
            reasons.push(`Status: ${incident.status}`);
          }
        }

        // Check time elapsed
        if (matches && rule.conditions?.timeElapsed) {
          const incidentDate = dayjs(incident.date_occurred || incident.created_at);
          const hoursElapsed = dayjs().diff(incidentDate, 'hour');
          if (hoursElapsed < rule.conditions.timeElapsed) {
            matches = false;
          } else {
            reasons.push(`${hoursElapsed}h elapsed`);
          }
        }

        if (matches) {
          results.push({
            incident,
            rule,
            reasons,
            shouldEscalate: true,
            urgency: rule.priority <= 2 ? 'high' : 'medium'
          });
        }
      });
    });

    return results.sort((a, b) => a.rule.priority - b.rule.priority);
  }, [incidents, rules]);

  // ==================== SAVE RULE ====================

  const handleSaveRule = async (values) => {
    setSaving(true);
    try {
      const ruleData = {
        name: values.name,
        description: values.description,
        enabled: values.enabled !== false,
        priority: values.priority || 3,
        conditions: {
          severity: values.severity || [],
          status: values.status || [],
          timeElapsed: values.timeElapsed || null
        },
        actions: values.actions || []
      };

      let response;
      if (selectedRule) {
        response = await notificationService.updateEscalationRule(selectedRule.id, ruleData);
      } else {
        response = await notificationService.createEscalationRule(ruleData);
      }

      const savedRule = response?.rule || response?.data || response;

      // Refresh list
      await fetchRules();

      message.success(selectedRule ? 'Rule updated' : 'Rule created');
      setRuleModalVisible(false);
      form.resetFields();
      setSelectedRule(null);
    } catch (error) {
      console.error('Save rule failed:', error);
      message.error(error?.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE RULE ====================

  const handleDeleteRule = async (ruleId) => {
    try {
      await notificationService.deleteEscalationRule(ruleId);
      setRules(prev => prev.filter(r => r.id !== ruleId));
      message.success('Rule deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('Failed to delete rule');
    }
  };

  // ==================== TOGGLE RULE ====================

  const handleToggleRule = async (ruleId, enabled) => {
    // Optimistic update
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled } : r));

    try {
      await notificationService.toggleEscalationRule(ruleId, enabled);
      message.success(enabled ? 'Rule enabled' : 'Rule disabled');
    } catch (error) {
      console.error('Toggle failed:', error);
      // Revert
      setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !enabled } : r));
      message.error('Failed to toggle rule');
    }
  };

  // ==================== EXECUTE ESCALATION ====================

  const handleExecuteEscalation = async (item) => {
    try {
      const response = await notificationService.executeEscalation(
        item.incident.id,
        item.rule.id
      );

      const logEntry = response?.history || response?.data || {
        id: Date.now().toString(),
        incident_id: item.incident.id,
        incident_number: item.incident.incident_number || `INC-${item.incident.id}`,
        rule_id: item.rule.id,
        rule_name: item.rule.name,
        escalated_at: new Date().toISOString(),
        actions_executed: item.rule.actions?.map(a => ({
          ...a,
          status: 'sent',
          sentAt: new Date().toISOString()
        })) || [],
        status: 'completed'
      };

      setEscalationLog(prev => [logEntry, ...prev]);
      
      notification.success({
        message: 'Escalation Executed',
        description: `${item.rule.name} applied to ${logEntry.incident_number || item.incident.incident_number}`,
      });

      if (onEscalate) {
        onEscalate(item.incident, item.rule);
      }
    } catch (error) {
      console.error('Escalation failed:', error);
      message.error(error?.message || 'Failed to execute escalation');
    }
  };

  // ==================== TEST RULE ====================

  const handleTestRule = async (rule) => {
    setTestingRule(rule);
    setTestResult(null);
    setTestModalVisible(true);

    try {
      // Try server-side test
      const response = await notificationService.testEscalationRule(rule.id);
      const result = response?.result || response?.data || response;

      if (result) {
        setTestResult({
          matchCount: result.match_count || result.matchCount || 0,
          incidents: result.incidents || [],
          actionsCount: result.actions_count || rule.actions?.length || 0
        });
        return;
      }
    } catch (error) {
      console.warn('Server test failed, using local test:', error);
    }

    // Local fallback test
    setTimeout(() => {
      const matchingIncidents = incidents.filter(incident => {
        let matches = true;
        
        if (rule.conditions?.severity?.length > 0) {
          matches = matches && rule.conditions.severity.includes(incident.severity);
        }
        if (rule.conditions?.status?.length > 0) {
          matches = matches && rule.conditions.status.includes(incident.status);
        }
        
        return matches;
      });

      setTestResult({
        matchCount: matchingIncidents.length,
        incidents: matchingIncidents.slice(0, 5),
        actionsCount: rule.actions?.length || 0
      });
    }, 800);
  };

  // ==================== HELPERS ====================

  const getPriorityColor = (priority) => {
    if (priority === 1) return 'red';
    if (priority === 2) return 'orange';
    if (priority === 3) return 'gold';
    return 'green';
  };

  const getUrgencyColor = (urgency) => {
    return urgency === 'high' ? '#f5222d' : '#faad14';
  };

  // ==================== RENDER ====================

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <Space>
              <SettingOutlined />
              Escalation Rules
              <Badge count={rules.filter(r => r.enabled).length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          } 
          key="rules"
        >
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Active Rules"
                  value={rules.filter(r => r.enabled).length}
                  suffix={`/ ${rules.length}`}
                  prefix={<SettingOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Pending Escalations"
                  value={escalatableIncidents.length}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Escalations Today"
                  value={escalationLog.filter(l => 
                    dayjs(l.escalated_at || l.escalatedAt).isSame(dayjs(), 'day')
                  ).length}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Pending Escalations Alert */}
          {escalatableIncidents.length > 0 && (
            <Alert
              message={
                <Space>
                  <FireOutlined style={{ color: '#f5222d' }} />
                  <Text strong>{escalatableIncidents.length} incidents require escalation</Text>
                </Space>
              }
              description={
                <Space wrap>
                  {escalatableIncidents.slice(0, 3).map((item, i) => (
                    <Tag key={i} color={getUrgencyColor(item.urgency)}>
                      {item.incident.incident_number || `INC-${item.incident.id}`} - {item.rule.name}
                    </Tag>
                  ))}
                  {escalatableIncidents.length > 3 && (
                    <Text type="secondary">+{escalatableIncidents.length - 3} more</Text>
                  )}
                </Space>
              }
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button 
                  size="small" 
                  type="primary" 
                  danger
                  onClick={() => {
                    escalatableIncidents.forEach(item => handleExecuteEscalation(item));
                  }}
                >
                  Escalate All
                </Button>
              }
            />
          )}

          {/* Rules Table */}
          <Card 
            title={<Space><SettingOutlined />Escalation Rules</Space>}
            extra={
              <Space>
                <Tooltip title="Refresh">
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={fetchRules}
                    loading={loading}
                  />
                </Tooltip>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedRule(null);
                    form.resetFields();
                    form.setFieldsValue({
                      enabled: true,
                      priority: 3,
                      actions: [{ type: 'notify', channel: 'email' }]
                    });
                    setRuleModalVisible(true);
                  }}
                >
                  Add Rule
                </Button>
              </Space>
            }
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin tip="Loading rules..." />
              </div>
            ) : rules.length > 0 ? (
              <Table
                dataSource={rules.sort((a, b) => (a.priority || 3) - (b.priority || 3))}
                columns={[
                  {
                    title: 'Priority',
                    dataIndex: 'priority',
                    key: 'priority',
                    width: 80,
                    render: (priority) => (
                      <Tag color={getPriorityColor(priority)}>P{priority || 3}</Tag>
                    )
                  },
                  {
                    title: 'Rule Name',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record) => (
                      <Space direction="vertical" size={0}>
                        <Text strong>{text}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {record.description}
                        </Text>
                      </Space>
                    )
                  },
                  {
                    title: 'Conditions',
                    key: 'conditions',
                    render: (_, record) => (
                      <Space wrap>
                        {record.conditions?.severity?.map(s => (
                          <Tag key={s} color={
                            s === 'critical' ? 'red' : s === 'high' ? 'orange' : 'gold'
                          }>
                            Severity: {s}
                          </Tag>
                        ))}
                        {record.conditions?.status?.map(s => (
                          <Tag key={s} color="blue">Status: {s}</Tag>
                        ))}
                        {record.conditions?.timeElapsed && (
                          <Tag color="purple">After {record.conditions.timeElapsed}h</Tag>
                        )}
                      </Space>
                    )
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Space wrap>
                        {record.actions?.slice(0, 3).map((action, i) => (
                          <Tooltip key={i} title={`${action.type}: ${action.role || action.to}`}>
                            <Tag 
                              icon={
                                action.type === 'notify' ? <BellOutlined /> :
                                action.type === 'assign' ? <UserOutlined /> :
                                action.type === 'status_change' ? <CheckCircleOutlined /> :
                                <ThunderboltOutlined />
                              }
                              color={
                                action.type === 'notify' ? 'blue' :
                                action.type === 'assign' ? 'purple' : 'green'
                              }
                            >
                              {action.type}
                            </Tag>
                          </Tooltip>
                        ))}
                        {record.actions?.length > 3 && (
                          <Tag>+{record.actions.length - 3}</Tag>
                        )}
                      </Space>
                    )
                  },
                  {
                    title: 'Status',
                    dataIndex: 'enabled',
                    key: 'enabled',
                    width: 100,
                    render: (enabled, record) => (
                      <Switch
                        checked={enabled}
                        onChange={(checked) => handleToggleRule(record.id, checked)}
                        checkedChildren="On"
                        unCheckedChildren="Off"
                      />
                    )
                  },
                  {
                    title: 'Actions',
                    key: 'rowActions',
                    width: 150,
                    render: (_, record) => (
                      <Space>
                        <Tooltip title="Test Rule">
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleTestRule(record)}
                          />
                        </Tooltip>
                        <Tooltip title="Edit">
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<EditOutlined />}
                            onClick={() => {
                              setSelectedRule(record);
                              form.setFieldsValue({
                                ...record,
                                severity: record.conditions?.severity || [],
                                status: record.conditions?.status || [],
                                timeElapsed: record.conditions?.timeElapsed
                              });
                              setRuleModalVisible(true);
                            }}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="Delete this rule?"
                          onConfirm={() => handleDeleteRule(record.id)}
                        >
                          <Button 
                            type="link" 
                            size="small" 
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty 
                description="No escalation rules configured"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedRule(null);
                    form.resetFields();
                    form.setFieldsValue({
                      enabled: true,
                      priority: 3,
                      actions: [{ type: 'notify', channel: 'email' }]
                    });
                    setRuleModalVisible(true);
                  }}
                >
                  Create First Rule
                </Button>
              </Empty>
            )}
          </Card>

          {/* Pending Escalations List */}
          {escalatableIncidents.length > 0 && (
            <Card 
              title={
                <Space>
                  <WarningOutlined style={{ color: '#f5222d' }} />
                  Pending Escalations
                  <Badge count={escalatableIncidents.length} style={{ backgroundColor: '#f5222d' }} />
                </Space>
              }
              style={{ marginTop: 16 }}
            >
              <List
                dataSource={escalatableIncidents}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        size="small"
                        icon={<ArrowUpOutlined />}
                        onClick={() => handleExecuteEscalation(item)}
                        key="escalate"
                      >
                        Escalate
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ backgroundColor: getUrgencyColor(item.urgency) }}
                          icon={<WarningOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{item.incident.title}</Text>
                          <Tag color="blue">{item.incident.incident_number || `INC-${item.incident.id}`}</Tag>
                          <Tag color={getPriorityColor(item.rule.priority)}>
                            Rule P{item.rule.priority}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Text type="secondary">{item.rule.name}</Text>
                          <Space wrap>
                            {item.reasons.map((r, i) => (
                              <Tag key={i} color="orange">{r}</Tag>
                            ))}
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <ClockCircleOutlined />
              Escalation History
              <Badge count={escalationLog.length} style={{ backgroundColor: '#1890ff' }} />
            </Space>
          } 
          key="history"
        >
          {escalationLog.length > 0 ? (
            <Timeline>
              {escalationLog.map(log => (
                <Timeline.Item 
                  key={log.id}
                  color="green"
                  dot={<CheckCircleOutlined />}
                >
                  <Card size="small">
                    <Row justify="space-between">
                      <Col>
                        <Space direction="vertical" size={0}>
                          <Space>
                            <Text strong>{log.rule_name || log.ruleName}</Text>
                            <Tag color="blue">{log.incident_number || log.incidentNumber}</Tag>
                          </Space>
                          <Text type="secondary">
                            {(log.actions_executed || log.actions)?.length || 0} actions executed
                          </Text>
                        </Space>
                      </Col>
                      <Col>
                        <Text type="secondary">
                          {dayjs(log.escalated_at || log.escalatedAt).format('MMM DD, YYYY HH:mm')}
                        </Text>
                      </Col>
                    </Row>
                    <Divider style={{ margin: '8px 0' }} />
                    <Space wrap>
                      {(log.actions_executed || log.actions || []).map((action, i) => (
                        <Tag 
                          key={i}
                          color="green"
                          icon={<CheckCircleOutlined />}
                        >
                          {action.type}: {action.role || action.to}
                        </Tag>
                      ))}
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty description="No escalation history" />
          )}
        </TabPane>

        <TabPane 
          tab={<Space><InfoCircleOutlined />Escalation Flow</Space>} 
          key="flow"
        >
          <Card>
            <AntTitle level={5}>Default Escalation Flow</AntTitle>
            <Paragraph type="secondary">
              When an incident is reported, the following escalation path is applied based on severity and time:
            </Paragraph>

            <Timeline mode="left" style={{ marginTop: 24 }}>
              <Timeline.Item color="red" dot={<WarningOutlined />}>
                <Card size="small" title="Critical Incident">
                  <Space direction="vertical">
                    <Text>Immediate notification to:</Text>
                    <Space wrap>
                      <Tag color="red">Super Admin</Tag>
                      <Tag color="orange">Company Admin</Tag>
                      <Tag color="blue">Safety Officer</Tag>
                    </Space>
                  </Space>
                </Card>
              </Timeline.Item>

              <Timeline.Item color="orange" dot={<ClockCircleOutlined />}>
                <Card size="small" title="24 Hours Without Action">
                  <Text>Escalate to Company Admin and Safety Officer</Text>
                </Card>
              </Timeline.Item>

              <Timeline.Item color="gold" dot={<ClockCircleOutlined />}>
                <Card size="small" title="72 Hours Without Resolution">
                  <Space direction="vertical">
                    <Text>Escalate to Super Admin</Text>
                    <Text>Increase incident priority</Text>
                  </Space>
                </Card>
              </Timeline.Item>

              <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                <Card size="small" title="Resolved">
                  <Text>Incident closed and archived</Text>
                </Card>
              </Timeline.Item>
            </Timeline>
          </Card>
        </TabPane>
      </Tabs>

      {/* Rule Editor Modal */}
      <Modal
        title={selectedRule ? 'Edit Escalation Rule' : 'Create Escalation Rule'}
        open={ruleModalVisible}
        onCancel={() => {
          setRuleModalVisible(false);
          form.resetFields();
          setSelectedRule(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRule}
          initialValues={{
            enabled: true,
            priority: 3,
            actions: [{ type: 'notify', channel: 'email' }]
          }}
        >
          <Form.Item
            name="name"
            label="Rule Name"
            rules={[{ required: true, message: 'Rule name is required' }]}
          >
            <Input placeholder="e.g., Critical Incident Escalation" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Describe when this rule should trigger" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select>
                  <Option value={1}>P1 - Critical</Option>
                  <Option value={2}>P2 - High</Option>
                  <Option value={3}>P3 - Medium</Option>
                  <Option value={4}>P4 - Low</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enabled" label="Enabled" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Conditions</Divider>

          <Form.Item name="severity" label="Severity Match">
            <Checkbox.Group>
              <Space>
                <Checkbox value="critical">Critical</Checkbox>
                <Checkbox value="high">High</Checkbox>
                <Checkbox value="medium">Medium</Checkbox>
                <Checkbox value="low">Low</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="status" label="Status Match">
            <Checkbox.Group>
              <Space wrap>
                <Checkbox value="reported">Reported</Checkbox>
                <Checkbox value="under_review">Under Review</Checkbox>
                <Checkbox value="investigating">Investigating</Checkbox>
                <Checkbox value="resolved">Resolved</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item 
            name="timeElapsed" 
            label="Hours Elapsed (optional)"
            extra="Trigger only if this many hours have passed since incident"
          >
            <InputNumber min={0} max={720} style={{ width: '100%' }} placeholder="e.g., 24" />
          </Form.Item>

          <Divider orientation="left">Actions</Divider>

          <Form.List name="actions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card size="small" key={key} style={{ marginBottom: 8 }}>
                    <Row gutter={8} align="middle">
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'type']}
                          style={{ marginBottom: 0 }}
                        >
                          <Select placeholder="Action type">
                            <Option value="notify">Notify</Option>
                            <Option value="assign">Assign</Option>
                            <Option value="status_change">Change Status</Option>
                            <Option value="increase_priority">Increase Priority</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'role']}
                          style={{ marginBottom: 0 }}
                        >
                          <Select placeholder="Role">
                            {Object.entries(ESCALATION_ROLES).map(([key, config]) => (
                              <Option key={key} value={key}>{config.label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'channel']}
                          style={{ marginBottom: 0 }}
                        >
                          <Select placeholder="Channel">
                            {Object.entries(NOTIFICATION_CHANNELS).map(([key, config]) => (
                              <Option key={key} value={key}>{config.label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'delay']}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber 
                            placeholder="Delay (h)" 
                            min={0} 
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add()} 
                  block 
                  icon={<PlusOutlined />}
                >
                  Add Action
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                {selectedRule ? 'Update Rule' : 'Create Rule'}
              </Button>
              <Button onClick={() => {
                setRuleModalVisible(false);
                form.resetFields();
                setSelectedRule(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Test Rule Modal */}
      <Modal
        title={`Test Rule: ${testingRule?.name}`}
        open={testModalVisible}
        onCancel={() => {
          setTestModalVisible(false);
          setTestingRule(null);
          setTestResult(null);
        }}
        footer={[
          <Button key="close" onClick={() => setTestModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {!testResult ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Progress type="circle" percent={100} status="active" />
            <div style={{ marginTop: 16 }}>Testing rule...</div>
          </div>
        ) : (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Statistic 
                  title="Matching Incidents" 
                  value={testResult.matchCount}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Actions to Execute" 
                  value={testResult.actionsCount}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>

            {testResult.incidents.length > 0 ? (
              <List
                size="small"
                header={<Text strong>Sample Matching Incidents</Text>}
                dataSource={testResult.incidents}
                renderItem={(incident) => (
                  <List.Item>
                    <Space>
                      <Tag color="blue">{incident.incident_number || `INC-${incident.id}`}</Tag>
                      <Text>{incident.title}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Alert
                message="No Matching Incidents"
                description="This rule would not trigger for any current incidents."
                type="info"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EscalationMatrix;