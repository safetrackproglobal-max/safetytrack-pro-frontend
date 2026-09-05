// src/components/environmental/panels/SustainabilityTracker.js
import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Table, Modal, Form, Input, InputNumber, 
  Select, DatePicker, Space, message, Popconfirm, Tag, Progress,
  Row, Col, Statistic, Tabs, Empty, Tooltip, Timeline, Spin, Alert
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  EnvironmentOutlined, CheckCircleOutlined, ClockCircleOutlined,
  RocketOutlined, LineChartOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import advancedEnvironmentalService from '../../../services/advancedEnvironmentalService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const SustainabilityTracker = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [form] = Form.useForm();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      console.log('🎯 Fetching sustainability goals...');
      const response = await advancedEnvironmentalService.getSustainabilityGoals();
      console.log('📊 Response:', response);
      
      let goalsData = [];
      if (response && response.goals && Array.isArray(response.goals)) {
        goalsData = response.goals;
      } else if (response && Array.isArray(response)) {
        goalsData = response;
      }
      
      setGoals(goalsData);
      
      if (goalsData.length === 0) {
        message.info('No sustainability goals yet. Click "Add Goal" to get started!');
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
      message.error('Failed to load sustainability goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGoal(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      unit: '%',
      current_value: 0,
      target_value: 100
    });
    setModalVisible(true);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    form.setFieldsValue({
      goal: goal.goal,
      target: goal.target,
      current_value: goal.current_value,
      target_value: goal.target_value,
      unit: goal.unit,
      category: goal.category,
      deadline: goal.deadline ? dayjs(goal.deadline) : null,
      status: goal.status
    });
    setModalVisible(true);
  };

  const handleDelete = async (goalId) => {
    try {
      await advancedEnvironmentalService.deleteSustainabilityGoal(goalId);
      message.success('Goal deleted successfully');
      loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      message.error('Failed to delete goal');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        deadline: values.deadline ? values.deadline.toISOString() : null
      };
      
      if (editingGoal) {
        await advancedEnvironmentalService.updateSustainabilityGoal(editingGoal.id, submitData);
        message.success('Goal updated successfully');
      } else {
        await advancedEnvironmentalService.createSustainabilityGoal(submitData);
        message.success('Goal added successfully');
      }
      setModalVisible(false);
      loadGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
      message.error('Failed to save goal');
    }
  };

  const calculateOverallProgress = () => {
    if (goals.length === 0) return 0;
    const sum = goals.reduce((total, goal) => total + (goal.progress_percentage || 0), 0);
    return Math.round(sum / goals.length);
  };

  const getCompletedCount = () => {
    return goals.filter(g => (g.progress_percentage || 0) >= 100).length;
  };

  const getActiveCount = () => {
    return goals.filter(g => g.status === 'active' && (g.progress_percentage || 0) < 100).length;
  };

  const getAtRiskCount = () => {
    return goals.filter(g => {
      if (!g.deadline) return false;
      const deadline = new Date(g.deadline);
      const today = new Date();
      const daysLeft = (deadline - today) / (1000 * 60 * 60 * 24);
      return daysLeft < 30 && (g.progress_percentage || 0) < 50;
    }).length;
  };

  const getMilestoneStatus = (progress) => {
    if (progress >= 100) return { color: 'green', icon: <CheckCircleOutlined />, text: 'Completed' };
    if (progress >= 75) return { color: 'blue', icon: <ClockCircleOutlined />, text: 'On Track' };
    if (progress >= 50) return { color: 'orange', icon: <ExclamationCircleOutlined />, text: 'At Risk' };
    return { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Behind Schedule' };
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#52c41a';
    if (progress >= 50) return '#1890ff';
    if (progress >= 25) return '#faad14';
    return '#f5222d';
  };

  const columns = [
    {
      title: 'Goal',
      dataIndex: 'goal',
      key: 'goal',
      width: 250,
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          <br />
          <Tag color="blue" style={{ fontSize: 11, marginTop: 4 }}>{record.category}</Tag>
        </div>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress_percentage',
      key: 'progress',
      width: 200,
      render: (progress) => (
        <div>
          <Progress percent={Math.round(progress || 0)} size="small" strokeColor={getProgressColor(progress || 0)} />
          <span style={{ fontSize: 12 }}>{Math.round(progress || 0)}% complete</span>
        </div>
      ),
    },
    {
      title: 'Current / Target',
      key: 'values',
      width: 150,
      render: (_, record) => (
        <span>
          <strong>{record.current_value}</strong> / {record.target_value} {record.unit}
        </span>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (date) => {
        if (!date) return 'No deadline';
        const deadlineDate = new Date(date);
        const today = new Date();
        const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <div>{deadlineDate.toLocaleDateString()}</div>
            {daysLeft > 0 && daysLeft < 30 && (
              <Tag color="orange" style={{ fontSize: 10 }}>{daysLeft} days left</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const status = getMilestoneStatus(record.progress_percentage || 0);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          </Tooltip>
          <Popconfirm
            title="Delete Goal"
            description="Are you sure you want to delete this goal?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button icon={<DeleteOutlined />} danger size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <Card title="🌱 Sustainability Goal Tracker">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading your sustainability goals...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <span>
          <RocketOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          🌱 My Sustainability Goals
        </span>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadGoals}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Goal
          </Button>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Overview Tab */}
        <TabPane tab={<span><LineChartOutlined /> Overview</span>} key="overview">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Goals"
                  value={goals.length}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<EnvironmentOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="In Progress"
                  value={getActiveCount()}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Completed"
                  value={getCompletedCount()}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="At Risk"
                  value={getAtRiskCount()}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <h3>Overall Sustainability Progress</h3>
              <Progress 
                type="circle" 
                percent={calculateOverallProgress()} 
                size={140}
                strokeColor="#1890ff"
                format={(percent) => `${percent}% Complete`}
              />
              <div style={{ marginTop: 24 }}>
                <p>
                  You have <strong>{getActiveCount()}</strong> active goals and 
                  <strong> {getCompletedCount()}</strong> completed goals.
                </p>
                {getAtRiskCount() > 0 && (
                  <Alert
                    message={`${getAtRiskCount()} goal(s) are at risk of missing deadline`}
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
                <Button type="link" onClick={() => setActiveTab('list')}>
                  View All Goals →
                </Button>
              </div>
            </div>
          </Card>
        </TabPane>

        {/* Timeline View Tab */}
        <TabPane tab={<span><ClockCircleOutlined /> Timeline</span>} key="timeline">
          {goals.length === 0 ? (
            <Empty description="No goals yet. Click 'Add Goal' to create your first sustainability goal!" />
          ) : (
            <Timeline>
              {goals.map((goal, index) => {
                const status = getMilestoneStatus(goal.progress_percentage || 0);
                const deadline = goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline';
                return (
                  <Timeline.Item
                    key={goal.id || index}
                    color={status.color}
                    dot={status.icon}
                  >
                    <Card 
                      size="small" 
                      style={{ 
                        borderLeft: `4px solid ${getProgressColor(goal.progress_percentage || 0)}`,
                        marginBottom: 8
                      }}
                    >
                      <Row gutter={16} align="middle">
                        <Col xs={24} md={16}>
                          <h4 style={{ margin: 0 }}>{goal.goal}</h4>
                          <p style={{ margin: '4px 0', color: '#666' }}>{goal.target}</p>
                          <div>
                            <Tag color="blue">{goal.category}</Tag>
                            <Tag color={status.color}>{status.text}</Tag>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <Progress 
                              percent={Math.round(goal.progress_percentage || 0)} 
                              size="small"
                              strokeColor={getProgressColor(goal.progress_percentage || 0)}
                            />
                          </div>
                        </Col>
                        <Col xs={24} md={8}>
                          <div style={{ textAlign: 'center' }}>
                            <div>
                              <strong>{goal.current_value}</strong> / {goal.target_value} {goal.unit}
                            </div>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              Deadline: {deadline}
                            </div>
                            <Button 
                              type="link" 
                              size="small" 
                              onClick={() => handleEdit(goal)}
                              style={{ marginTop: 8 }}
                            >
                              Update Progress
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          )}
        </TabPane>

        {/* List View Tab */}
        <TabPane tab={<span><EnvironmentOutlined /> My Goals</span>} key="list">
          <Table
            columns={columns}
            dataSource={goals}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No goals yet. Click "Add Goal" to create your first sustainability goal!' }}
          />
        </TabPane>
      </Tabs>

      {/* Add/Edit Goal Modal */}
      <Modal
        title={editingGoal ? 'Edit Sustainability Goal' : 'Add New Sustainability Goal'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            unit: '%',
            current_value: 0,
            target_value: 100
          }}
        >
          <Form.Item
            name="goal"
            label="Goal Title"
            rules={[{ required: true, message: 'Please enter a goal title' }]}
          >
            <Input placeholder="e.g., Reduce Carbon Emissions by 50%" />
          </Form.Item>

          <Form.Item
            name="target"
            label="Target Description"
            rules={[{ required: true, message: 'Please describe your target' }]}
          >
            <TextArea rows={2} placeholder="Describe what you want to achieve" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="current_value"
                label="Current Value"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="target_value"
                label="Target Value"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="100" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
                <Select>
                  <Option value="%">Percentage (%)</Option>
                  <Option value="tons">Tons</Option>
                  <Option value="kg">Kilograms (kg)</Option>
                  <Option value="kWh">Kilowatt-hours (kWh)</Option>
                  <Option value="gallons">Gallons</Option>
                  <Option value="liters">Liters</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select>
                  <Option value="emissions">Carbon Emissions</Option>
                  <Option value="energy">Energy</Option>
                  <Option value="water">Water</Option>
                  <Option value="waste">Waste</Option>
                  <Option value="biodiversity">Biodiversity</Option>
                  <Option value="social">Social Impact</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="deadline" label="Deadline">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="on_hold">On Hold</Option>
                  <Option value="completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SustainabilityTracker;