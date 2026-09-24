// src/components/safety/LessonsLearned.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Row, Col, Button, Table, Tag, Space, Modal, Form, Input,
  Select, DatePicker, message, Badge, Statistic, Progress, Tabs,
  Divider, Alert, Avatar, Tooltip, Timeline, List, Empty, Upload,
  Switch, Radio, Checkbox, InputNumber, Drawer, Descriptions,
  Popconfirm, notification, Rate, Segmented, Collapse, Result
} from 'antd';
import {
  BulbOutlined, BookOutlined, FileTextOutlined, SafetyCertificateOutlined,
  StarOutlined, StarFilled, TeamOutlined, ShareAltOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
  LikeOutlined, DislikeOutlined, MessageOutlined, CopyOutlined,
  DownloadOutlined, PrinterOutlined, SendOutlined, CheckCircleOutlined,
  WarningOutlined, InfoCircleOutlined, AimOutlined, ThunderboltOutlined,
  ToolOutlined, HeartOutlined, BulbFilled, RiseOutlined, FilterOutlined,
  SearchOutlined, ReloadOutlined, LinkOutlined, FileImageOutlined,
  InboxOutlined, SaveOutlined, ExportOutlined, ApartmentOutlined,
  ClockCircleOutlined, UserOutlined, EnvironmentOutlined, HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title: AntTitle, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Dragger } = Upload;

// ==================== LESSON CATEGORIES ====================

const LESSON_CATEGORIES = {
  safety_procedure: {
    id: 'safety_procedure',
    label: 'Safety Procedure',
    color: '#1890ff',
    icon: <SafetyCertificateOutlined />,
    description: 'Lessons about safety procedures and protocols'
  },
  equipment: {
    id: 'equipment',
    label: 'Equipment & Tools',
    color: '#52c41a',
    icon: <ToolOutlined />,
    description: 'Lessons about equipment maintenance and usage'
  },
  human_factors: {
    id: 'human_factors',
    label: 'Human Factors',
    color: '#faad14',
    icon: <UserOutlined />,
    description: 'Lessons about human behavior and decision-making'
  },
  training: {
    id: 'training',
    label: 'Training & Competency',
    color: '#722ed1',
    icon: <BookOutlined />,
    description: 'Lessons about training and skill development'
  },
  communication: {
    id: 'communication',
    label: 'Communication',
    color: '#13c2c2',
    icon: <MessageOutlined />,
    description: 'Lessons about communication and information flow'
  },
  management: {
    id: 'management',
    label: 'Management & Leadership',
    color: '#eb2f96',
    icon: <TeamOutlined />,
    description: 'Lessons about management systems and leadership'
  },
  environment: {
    id: 'environment',
    label: 'Environment & Conditions',
    color: '#fa541c',
    icon: <EnvironmentOutlined />,
    description: 'Lessons about environmental and workplace conditions'
  },
  emergency_response: {
    id: 'emergency_response',
    label: 'Emergency Response',
    color: '#f5222d',
    icon: <WarningOutlined />,
    description: 'Lessons about emergency preparedness and response'
  },
  design: {
    id: 'design',
    label: 'Design & Engineering',
    color: '#2f54eb',
    icon: <ApartmentOutlined />,
    description: 'Lessons about design and engineering controls'
  },
  best_practice: {
    id: 'best_practice',
    label: 'Best Practice',
    color: '#52c41a',
    icon: <CheckCircleOutlined />,
    description: 'Proven best practices worth sharing'
  }
};

const LESSON_SEVERITY = {
  critical: { label: 'Critical', color: 'red', icon: <WarningOutlined /> },
  high: { label: 'High', color: 'orange', icon: <ThunderboltOutlined /> },
  medium: { label: 'Medium', color: 'gold', icon: <InfoCircleOutlined /> },
  low: { label: 'Low', color: 'green', icon: <BulbOutlined /> }
};

const LESSON_STATUS = {
  draft: { label: 'Draft', color: 'default' },
  review: { label: 'Under Review', color: 'processing' },
  published: { label: 'Published', color: 'success' },
  archived: { label: 'Archived', color: 'default' }
};

const REACTION_TYPES = {
  helpful: { icon: <LikeOutlined />, color: '#52c41a', label: 'Helpful' },
  insightful: { icon: <BulbFilled />, color: '#faad14', label: 'Insightful' },
  not_relevant: { icon: <DislikeOutlined />, color: '#f5222d', label: 'Not Relevant' }
};

// ==================== LESSONS LEARNED COMPONENT ====================

const LessonsLearned = ({ 
  lessons: initialLessons = [],
  incidents = [],
  onAddLesson,
  onUpdateLesson,
  currentUser,
  readOnly = false 
}) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [reactions, setReactions] = useState({});

  // Load lessons
  useEffect(() => {
    setLessons(initialLessons.length > 0 ? initialLessons : getMockLessons());
  }, [initialLessons]);

  // Mock data
  const getMockLessons = () => [
    {
      id: '1',
      title: 'Always verify equipment lockout before maintenance',
      summary: 'A near-miss incident revealed that maintenance was started before proper lockout/tagout was verified. This lesson emphasizes the critical importance of verifying zero energy state.',
      category: 'safety_procedure',
      severity: 'critical',
      status: 'published',
      sourceIncident: 'INC-2024-001',
      sourceType: 'near_miss',
      author: { id: '1', name: 'John Smith', role: 'Safety Manager' },
      createdAt: dayjs().subtract(15, 'day').toISOString(),
      publishedAt: dayjs().subtract(14, 'day').toISOString(),
      tags: ['lockout', 'tagout', 'maintenance', 'energy control'],
      keyTakeaways: [
        'Never assume equipment is de-energized',
        'Always verify with test equipment',
        'Follow the LOTO procedure every time',
        'Report any deviations immediately'
      ],
      recommendations: [
        'Implement mandatory LOTO verification checklist',
        'Provide refresher training to all maintenance staff',
        'Install visual indicators on energy isolation points'
      ],
      applicableIndustries: ['manufacturing', 'construction', 'oil_gas'],
      reactions: { helpful: 45, insightful: 32, not_relevant: 2 },
      views: 234,
      shares: 18
    },
    {
      id: '2',
      title: 'Communication gaps during shift handover can be deadly',
      summary: 'Analysis of multiple incidents revealed that critical safety information was lost during shift handovers. This lesson provides a structured approach to effective handovers.',
      category: 'communication',
      severity: 'high',
      status: 'published',
      sourceIncident: 'INC-2024-015',
      sourceType: 'incident',
      author: { id: '2', name: 'Emily Davis', role: 'Operations Manager' },
      createdAt: dayjs().subtract(30, 'day').toISOString(),
      publishedAt: dayjs().subtract(28, 'day').toISOString(),
      tags: ['handover', 'communication', 'shift change', 'SBAR'],
      keyTakeaways: [
        'Use structured handover protocols (SBAR)',
        'Document all critical safety information',
        'Verify understanding through read-back',
        'Include safety-specific items in every handover'
      ],
      recommendations: [
        'Implement SBAR handover protocol',
        'Create standardized handover checklist',
        'Train all supervisors on effective handovers'
      ],
      applicableIndustries: ['healthcare', 'oil_gas', 'manufacturing'],
      reactions: { helpful: 38, insightful: 25, not_relevant: 1 },
      views: 189,
      shares: 12
    },
    {
      id: '3',
      title: 'Proper PPE selection prevents chemical burns',
      summary: 'A chemical splash incident led to improved PPE selection procedures. This lesson provides guidance on proper PPE selection for chemical handling.',
      category: 'safety_procedure',
      severity: 'high',
      status: 'published',
      sourceIncident: 'INC-2024-022',
      sourceType: 'incident',
      author: { id: '3', name: 'Robert Chen', role: 'Safety Officer' },
      createdAt: dayjs().subtract(45, 'day').toISOString(),
      publishedAt: dayjs().subtract(42, 'day').toISOString(),
      tags: ['PPE', 'chemical safety', 'burns', 'protective equipment'],
      keyTakeaways: [
        'Match PPE to the specific chemical hazard',
        'Check SDS for PPE requirements',
        'Inspect PPE before each use',
        'Replace damaged PPE immediately'
      ],
      recommendations: [
        'Create chemical-specific PPE matrix',
        'Post PPE requirements at all chemical handling areas',
        'Conduct quarterly PPE inspections'
      ],
      applicableIndustries: ['manufacturing', 'oil_gas', 'healthcare'],
      reactions: { helpful: 52, insightful: 28, not_relevant: 3 },
      views: 312,
      shares: 24
    },
    {
      id: '4',
      title: 'Fatigue management prevents errors',
      summary: 'Multiple errors were linked to operator fatigue during extended shifts. This lesson provides fatigue management strategies.',
      category: 'human_factors',
      severity: 'medium',
      status: 'published',
      sourceIncident: 'INC-2024-030',
      sourceType: 'incident',
      author: { id: '1', name: 'John Smith', role: 'Safety Manager' },
      createdAt: dayjs().subtract(60, 'day').toISOString(),
      publishedAt: dayjs().subtract(58, 'day').toISOString(),
      tags: ['fatigue', 'human factors', 'shift work', 'error prevention'],
      keyTakeaways: [
        'Recognize signs of fatigue in yourself and others',
        'Take regular breaks during long shifts',
        'Report fatigue concerns to supervisors',
        'Use fatigue assessment tools'
      ],
      recommendations: [
        'Implement fatigue risk assessment',
        'Review shift scheduling practices',
        'Provide fatigue awareness training'
      ],
      applicableIndustries: ['transportation', 'healthcare', 'aviation', 'mining'],
      reactions: { helpful: 41, insightful: 35, not_relevant: 2 },
      views: 267,
      shares: 15
    },
    {
      id: '5',
      title: 'Effective toolbox talks improve safety awareness',
      summary: 'Best practices from high-performing teams on conducting effective toolbox talks that engage workers and improve safety outcomes.',
      category: 'best_practice',
      severity: 'low',
      status: 'published',
      sourceIncident: null,
      sourceType: 'proactive',
      author: { id: '2', name: 'Emily Davis', role: 'Operations Manager' },
      createdAt: dayjs().subtract(20, 'day').toISOString(),
      publishedAt: dayjs().subtract(18, 'day').toISOString(),
      tags: ['toolbox talks', 'engagement', 'safety awareness', 'best practice'],
      keyTakeaways: [
        'Keep toolbox talks short and focused (5-10 min)',
        'Use real examples from the workplace',
        'Encourage two-way discussion',
        'Document attendance and topics'
      ],
      recommendations: [
        'Create toolbox talk template library',
        'Train supervisors on effective delivery',
        'Track toolbox talk completion rates'
      ],
      applicableIndustries: ['construction', 'manufacturing', 'mining', 'oil_gas'],
      reactions: { helpful: 56, insightful: 42, not_relevant: 1 },
      views: 423,
      shares: 38
    }
  ];

  // Handle save lesson
  const handleSaveLesson = (values) => {
    setLoading(true);
    
    setTimeout(() => {
      const lessonData = {
        id: editingLesson?.id || Date.now().toString(),
        ...values,
        author: currentUser || { id: '1', name: 'Current User', role: 'Safety Officer' },
        createdAt: editingLesson?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: values.status || 'draft',
        tags: values.tags || [],
        keyTakeaways: values.keyTakeaways || [],
        recommendations: values.recommendations || [],
        reactions: editingLesson?.reactions || { helpful: 0, insightful: 0, not_relevant: 0 },
        views: editingLesson?.views || 0,
        shares: editingLesson?.shares || 0,
        attachments: fileList.map(f => ({
          name: f.name,
          url: f.url || URL.createObjectURL(f)
        }))
      };

      if (editingLesson) {
        setLessons(prev => prev.map(l => 
          l.id === editingLesson.id ? lessonData : l
        ));
        if (onUpdateLesson) onUpdateLesson(lessonData);
        message.success('Lesson updated');
      } else {
        setLessons(prev => [lessonData, ...prev]);
        if (onAddLesson) onAddLesson(lessonData);
        message.success('Lesson learned recorded');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingLesson(null);
      setFileList([]);
      setLoading(false);
    }, 800);
  };

  // Handle reaction
  const handleReaction = (lessonId, reactionType) => {
    const key = `${lessonId}-${reactionType}`;
    const hasReacted = reactions[key];
    
    setReactions(prev => ({
      ...prev,
      [key]: !hasReacted
    }));

    setLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        return {
          ...l,
          reactions: {
            ...l.reactions,
            [reactionType]: (l.reactions[reactionType] || 0) + (hasReacted ? -1 : 1)
          }
        };
      }
      return l;
    }));

    message.success(hasReacted ? 'Reaction removed' : 'Thanks for your feedback!');
  };

  // Handle share
  const handleShare = (lesson) => {
    navigator.clipboard?.writeText(`${window.location.origin}/lessons/${lesson.id}`);
    message.success('Link copied to clipboard');
    
    setLessons(prev => prev.map(l => 
      l.id === lesson.id ? { ...l, shares: (l.shares || 0) + 1 } : l
    ));
  };

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      if (filterCategory !== 'all' && lesson.category !== filterCategory) return false;
      if (filterSeverity !== 'all' && lesson.severity !== filterSeverity) return false;
      if (activeTab !== 'all' && lesson.status !== activeTab) return false;
      if (searchText) {
        const search = searchText.toLowerCase();
        return (
          lesson.title?.toLowerCase().includes(search) ||
          lesson.summary?.toLowerCase().includes(search) ||
          lesson.tags?.some(t => t.toLowerCase().includes(search))
        );
      }
      return true;
    });
  }, [lessons, filterCategory, filterSeverity, activeTab, searchText]);

  // Statistics
  const stats = useMemo(() => {
    const total = lessons.length;
    const published = lessons.filter(l => l.status === 'published').length;
    const totalViews = lessons.reduce((sum, l) => sum + (l.views || 0), 0);
    const totalShares = lessons.reduce((sum, l) => sum + (l.shares || 0), 0);
    
    const byCategory = {};
    lessons.forEach(l => {
      byCategory[l.category] = (byCategory[l.category] || 0) + 1;
    });

    const bySeverity = {};
    lessons.forEach(l => {
      bySeverity[l.severity] = (bySeverity[l.severity] || 0) + 1;
    });

    return { total, published, totalViews, totalShares, byCategory, bySeverity };
  }, [lessons]);

  // Render lesson card
  const renderLessonCard = (lesson) => {
    const categoryConfig = LESSON_CATEGORIES[lesson.category] || {};
    const severityConfig = LESSON_SEVERITY[lesson.severity] || {};
    const statusConfig = LESSON_STATUS[lesson.status] || {};
    const totalReactions = Object.values(lesson.reactions || {}).reduce((a, b) => a + b, 0);

    return (
      <Card
        key={lesson.id}
        hoverable
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <Avatar 
              style={{ backgroundColor: categoryConfig.color }}
              icon={categoryConfig.icon}
            />
            <Text strong style={{ fontSize: 15 }}>{lesson.title}</Text>
          </Space>
        }
        extra={
          <Space>
            <Tag color={severityConfig.color} icon={severityConfig.icon}>
              {severityConfig.label}
            </Tag>
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
          </Space>
        }
        actions={[
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedLesson(lesson);
                setDetailsVisible(true);
              }}
            >
              {lesson.views || 0}
            </Button>
          </Tooltip>,
          <Tooltip title="Helpful">
            <Button 
              type="text" 
              icon={<LikeOutlined style={{ color: reactions[`${lesson.id}-helpful`] ? '#52c41a' : undefined }} />}
              onClick={() => handleReaction(lesson.id, 'helpful')}
            >
              {lesson.reactions?.helpful || 0}
            </Button>
          </Tooltip>,
          <Tooltip title="Share">
            <Button 
              type="text" 
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(lesson)}
            >
              {lesson.shares || 0}
            </Button>
          </Tooltip>,
          ...(!readOnly ? [
            <Tooltip title="Edit">
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingLesson(lesson);
                  form.setFieldsValue(lesson);
                  setModalVisible(true);
                }}
              />
            </Tooltip>
          ] : [])
        ]}
      >
        <Paragraph 
          ellipsis={{ rows: 3, expandable: false }}
          style={{ marginBottom: 12 }}
        >
          {lesson.summary}
        </Paragraph>

        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            {lesson.tags?.slice(0, 5).map(tag => (
              <Tag key={tag} color="blue">{tag}</Tag>
            ))}
            {lesson.tags?.length > 5 && (
              <Tag>+{lesson.tags.length - 5} more</Tag>
            )}
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {lesson.author?.name}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                {lesson.sourceIncident && (
                  <Tooltip title="Source Incident">
                    <Tag color="orange">
                      <LinkOutlined /> {lesson.sourceIncident}
                    </Tag>
                  </Tooltip>
                )}
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {dayjs(lesson.publishedAt || lesson.createdAt).fromNow()}
                </Text>
              </Space>
            </Col>
          </Row>

          {lesson.keyTakeaways?.length > 0 && (
            <div>
              <Text strong style={{ fontSize: 12 }}>Key Takeaway:</Text>
              <div style={{ paddingLeft: 12, marginTop: 4 }}>
                <Text style={{ fontSize: 12 }}>• {lesson.keyTakeaways[0]}</Text>
              </div>
            </div>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Lessons"
              value={stats.total}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Published"
              value={stats.published}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Views"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Shares"
              value={stats.totalShares}
              prefix={<ShareAltOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs & Filters */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><BulbOutlined /> All Lessons</span>} key="all">
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={6}>
                <Input.Search
                  placeholder="Search lessons..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={8} md={5}>
                <Select
                  value={filterCategory}
                  onChange={setFilterCategory}
                  style={{ width: '100%' }}
                  placeholder="Category"
                >
                  <Option value="all">All Categories</Option>
                  {Object.entries(LESSON_CATEGORIES).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={5}>
                <Select
                  value={filterSeverity}
                  onChange={setFilterSeverity}
                  style={{ width: '100%' }}
                  placeholder="Severity"
                >
                  <Option value="all">All Severities</Option>
                  {Object.entries(LESSON_SEVERITY).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                {!readOnly && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingLesson(null);
                      form.resetFields();
                      form.setFieldsValue({
                        severity: 'medium',
                        status: 'draft'
                      });
                      setFileList([]);
                      setModalVisible(true);
                    }}
                    block
                  >
                    Share New Lesson
                  </Button>
                )}
              </Col>
            </Row>
          </Card>

          {filteredLessons.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredLessons.map(lesson => (
                <Col xs={24} lg={12} key={lesson.id}>
                  {renderLessonCard(lesson)}
                </Col>
              ))}
            </Row>
          ) : (
            <Card>
              <Empty 
                description="No lessons found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                {!readOnly && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                  >
                    Share First Lesson
                  </Button>
                )}
              </Empty>
            </Card>
          )}
        </TabPane>

        <TabPane tab={<span><StarOutlined /> Most Helpful</span>} key="helpful">
          <Row gutter={[16, 16]}>
            {[...filteredLessons]
              .sort((a, b) => (b.reactions?.helpful || 0) - (a.reactions?.helpful || 0))
              .slice(0, 6)
              .map(lesson => (
                <Col xs={24} lg={12} key={lesson.id}>
                  {renderLessonCard(lesson)}
                </Col>
              ))}
          </Row>
        </TabPane>

        <TabPane tab={<span><EyeOutlined /> Most Viewed</span>} key="viewed">
          <Row gutter={[16, 16]}>
            {[...filteredLessons]
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 6)
              .map(lesson => (
                <Col xs={24} lg={12} key={lesson.id}>
                  {renderLessonCard(lesson)}
                </Col>
              ))}
          </Row>
        </TabPane>

        <TabPane tab={<span><EditOutlined /> My Drafts</span>} key="drafts">
          {lessons.filter(l => l.status === 'draft' && l.author?.id === currentUser?.id).length > 0 ? (
            <Row gutter={[16, 16]}>
              {lessons
                .filter(l => l.status === 'draft' && l.author?.id === currentUser?.id)
                .map(lesson => (
                  <Col xs={24} lg={12} key={lesson.id}>
                    {renderLessonCard(lesson)}
                  </Col>
                ))}
            </Row>
          ) : (
            <Empty description="No drafts" />
          )}
        </TabPane>
      </Tabs>

      {/* Add/Edit Lesson Modal */}
      <Modal
        title={
          <Space>
            <BulbOutlined />
            {editingLesson ? 'Edit Lesson Learned' : 'Share Lesson Learned'}
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingLesson(null);
          setFileList([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveLesson}
        >
          <Form.Item
            name="title"
            label="Lesson Title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input 
              placeholder="Brief, descriptive title of the lesson"
              maxLength={150}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="summary"
            label="Summary"
            rules={[{ required: true, message: 'Summary is required' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Describe the lesson learned and why it matters..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select category">
                  {Object.entries(LESSON_CATEGORIES).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="severity"
                label="Severity"
                rules={[{ required: true }]}
              >
                <Select>
                  {Object.entries(LESSON_SEVERITY).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
                initialValue="draft"
              >
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="review">Submit for Review</Option>
                  {currentUser?.role === 'admin' && (
                    <Option value="published">Publish</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="sourceIncident" label="Related Incident (optional)">
            <Select 
              placeholder="Link to incident"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {incidents.map(inc => (
                <Option key={inc.id} value={inc.incident_number || inc.id}>
                  {inc.incident_number || `INC-${inc.id}`} - {inc.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            extra="Press Enter to add tags"
          >
            <Select
              mode="tags"
              placeholder="Add relevant tags..."
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Key Takeaways */}
          <Form.List name="keyTakeaways">
            {(fields, { add, remove }) => (
              <>
                <Divider orientation="left">Key Takeaways</Divider>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={name}
                      style={{ marginBottom: 0, width: 600 }}
                    >
                      <Input placeholder="Key takeaway point" />
                    </Form.Item>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Add Key Takeaway
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* Recommendations */}
          <Form.List name="recommendations">
            {(fields, { add, remove }) => (
              <>
                <Divider orientation="left">Recommendations</Divider>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={name}
                      style={{ marginBottom: 0, width: 600 }}
                    >
                      <Input placeholder="Recommended action" />
                    </Form.Item>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Add Recommendation
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="applicableIndustries" label="Applicable Industries">
            <Select mode="multiple" placeholder="Select industries">
              <Option value="healthcare">Healthcare</Option>
              <Option value="construction">Construction</Option>
              <Option value="oil_gas">Oil & Gas</Option>
              <Option value="aviation">Aviation</Option>
              <Option value="manufacturing">Manufacturing</Option>
              <Option value="transportation">Transportation</Option>
              <Option value="mining">Mining</Option>
              <Option value="hospitality">Hospitality</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Attachments">
            <Dragger
              multiple
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to upload</p>
              <p className="ant-upload-hint">Supporting documents, images, etc.</p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                {editingLesson ? 'Update' : 'Share'} Lesson
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingLesson(null);
                setFileList([]);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title={
          <Space>
            <BulbOutlined style={{ color: '#722ed1' }} />
            Lesson Details
            {selectedLesson && (
              <Tag color={LESSON_CATEGORIES[selectedLesson.category]?.color}>
                {LESSON_CATEGORIES[selectedLesson.category]?.label}
              </Tag>
            )}
          </Space>
        }
        placement="right"
        width={700}
        open={detailsVisible}
        onClose={() => {
          setDetailsVisible(false);
          setSelectedLesson(null);
        }}
        extra={
          <Space>
            <Tooltip title="Share">
              <Button 
                icon={<ShareAltOutlined />}
                onClick={() => selectedLesson && handleShare(selectedLesson)}
              />
            </Tooltip>
            <Tooltip title="Print">
              <Button 
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
              />
            </Tooltip>
          </Space>
        }
      >
        {selectedLesson && (
          <div>
            <AntTitle level={4}>{selectedLesson.title}</AntTitle>
            
            <Space wrap style={{ marginBottom: 16 }}>
              <Tag color={LESSON_SEVERITY[selectedLesson.severity]?.color} 
                icon={LESSON_SEVERITY[selectedLesson.severity]?.icon}>
                {LESSON_SEVERITY[selectedLesson.severity]?.label}
              </Tag>
              <Tag color={LESSON_CATEGORIES[selectedLesson.category]?.color}
                icon={LESSON_CATEGORIES[selectedLesson.category]?.icon}>
                {LESSON_CATEGORIES[selectedLesson.category]?.label}
              </Tag>
              <Tag color={LESSON_STATUS[selectedLesson.status]?.color}>
                {LESSON_STATUS[selectedLesson.status]?.label}
              </Tag>
            </Space>

            <Card size="small" style={{ marginBottom: 16 }}>
              <Text>{selectedLesson.summary}</Text>
            </Card>

            {/* Key Takeaways */}
            {selectedLesson.keyTakeaways?.length > 0 && (
              <>
                <Divider orientation="left">
                  <Space>
                    <AimOutlined />
                    Key Takeaways
                  </Space>
                </Divider>
                <List
                  size="small"
                  dataSource={selectedLesson.keyTakeaways}
                  renderItem={(item, i) => (
                    <List.Item>
                      <Space>
                        <Avatar size="small" style={{ backgroundColor: '#52c41a' }}>
                          {i + 1}
                        </Avatar>
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </>
            )}

            {/* Recommendations */}
            {selectedLesson.recommendations?.length > 0 && (
              <>
                <Divider orientation="left">
                  <Space>
                    <CheckCircleOutlined />
                    Recommendations
                  </Space>
                </Divider>
                <List
                  size="small"
                  dataSource={selectedLesson.recommendations}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </>
            )}

            {/* Tags */}
            {selectedLesson.tags?.length > 0 && (
              <>
                <Divider orientation="left">Tags</Divider>
                <Space wrap>
                  {selectedLesson.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
              </>
            )}

            {/* Metadata */}
            <Divider orientation="left">Details</Divider>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Author">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  {selectedLesson.author?.name} ({selectedLesson.author?.role})
                </Space>
              </Descriptions.Item>
              {selectedLesson.sourceIncident && (
                <Descriptions.Item label="Source Incident">
                  <Tag color="orange">{selectedLesson.sourceIncident}</Tag>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Published">
                {dayjs(selectedLesson.publishedAt || selectedLesson.createdAt).format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Applicable Industries">
                <Space wrap>
                  {selectedLesson.applicableIndustries?.map(ind => (
                    <Tag key={ind}>{ind}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Engagement">
                <Space>
                  <Tag icon={<EyeOutlined />}>{selectedLesson.views || 0} views</Tag>
                  <Tag icon={<ShareAltOutlined />}>{selectedLesson.shares || 0} shares</Tag>
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {/* Reactions */}
            <Divider orientation="left">Was this helpful?</Divider>
            <Space>
              {Object.entries(REACTION_TYPES).map(([key, config]) => (
                <Button
                  key={key}
                  icon={config.icon}
                  onClick={() => handleReaction(selectedLesson.id, key)}
                  type={reactions[`${selectedLesson.id}-${key}`] ? 'primary' : 'default'}
                  style={{ 
                    color: reactions[`${selectedLesson.id}-${key}`] ? '#fff' : config.color,
                    borderColor: config.color
                  }}
                >
                  {config.label} ({selectedLesson.reactions?.[key] || 0})
                </Button>
              ))}
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default LessonsLearned;