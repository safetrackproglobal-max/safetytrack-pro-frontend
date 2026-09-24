// src/components/safety/LessonsLearned.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card, Row, Col, Button, Table, Tag, Space, Modal, Form, Input,
  Select, DatePicker, message, Badge, Statistic, Progress, Tabs,
  Divider, Alert, Avatar, Tooltip, Timeline, List, Empty, Upload,
  Switch, Radio, Checkbox, InputNumber, Drawer, Descriptions,
  Popconfirm, notification, Rate, Segmented, Collapse, Result, Spin,
  Typography
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
import relativeTime from 'dayjs/plugin/relativeTime';

// ✅ SERVICE IMPORT — matches your app
import notificationService from '../../services/notificationService';

// ✅ AUTH CONTEXT IMPORT — named export
import { useAuth } from '../../context/AuthContext';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title: AntTitle, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Dragger } = Upload;

// ==================== CONSTANTS ====================

const LESSON_CATEGORIES = {
  safety_procedure: { id: 'safety_procedure', label: 'Safety Procedure', color: '#1890ff', icon: <SafetyCertificateOutlined />, description: 'Lessons about safety procedures and protocols' },
  equipment: { id: 'equipment', label: 'Equipment & Tools', color: '#52c41a', icon: <ToolOutlined />, description: 'Lessons about equipment maintenance and usage' },
  human_factors: { id: 'human_factors', label: 'Human Factors', color: '#faad14', icon: <UserOutlined />, description: 'Lessons about human behavior and decision-making' },
  training: { id: 'training', label: 'Training & Competency', color: '#722ed1', icon: <BookOutlined />, description: 'Lessons about training and skill development' },
  communication: { id: 'communication', label: 'Communication', color: '#13c2c2', icon: <MessageOutlined />, description: 'Lessons about communication and information flow' },
  management: { id: 'management', label: 'Management & Leadership', color: '#eb2f96', icon: <TeamOutlined />, description: 'Lessons about management systems and leadership' },
  environment: { id: 'environment', label: 'Environment & Conditions', color: '#fa541c', icon: <EnvironmentOutlined />, description: 'Lessons about environmental and workplace conditions' },
  emergency_response: { id: 'emergency_response', label: 'Emergency Response', color: '#f5222d', icon: <WarningOutlined />, description: 'Lessons about emergency preparedness and response' },
  design: { id: 'design', label: 'Design & Engineering', color: '#2f54eb', icon: <ApartmentOutlined />, description: 'Lessons about design and engineering controls' },
  best_practice: { id: 'best_practice', label: 'Best Practice', color: '#52c41a', icon: <CheckCircleOutlined />, description: 'Proven best practices worth sharing' }
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

// ==================== COMPONENT ====================

const LessonsLearned = ({ 
  lessons: initialLessons = [],
  incidents = [],
  onAddLesson,
  onUpdateLesson,
  readOnly = false 
}) => {
  // ✅ Get user from context
  const { user: currentUser } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  // ==================== FETCH FROM API ====================

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.getLessonsLearned({
        page: 1,
        per_page: 100
      });

      const lessonsData = 
        response?.lessons || 
        response?.data?.lessons || 
        (Array.isArray(response) ? response : []) ||
        [];

      if (lessonsData.length > 0) {
        setLessons(lessonsData);
      } else if (initialLessons.length > 0) {
        setLessons(initialLessons);
      }
      // If both empty, leave as empty array (shows "no lessons" state)
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      // Fall back to initialLessons prop if available
      if (initialLessons.length > 0) {
        setLessons(initialLessons);
      }
    } finally {
      setLoading(false);
    }
  }, [initialLessons]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // ==================== SAVE (CREATE/UPDATE) ====================

  const handleSaveLesson = async (values) => {
    setSaving(true);
    try {
      const lessonPayload = {
        title: values.title,
        summary: values.summary,
        category: values.category,
        severity: values.severity,
        status: values.status || 'draft',
        source_incident_number: values.sourceIncident,
        source_type: values.sourceType || 'proactive',
        tags: values.tags || [],
        key_takeaways: values.keyTakeaways || [],
        recommendations: values.recommendations || [],
        applicable_industries: values.applicableIndustries || [],
        attachments: fileList.map(f => ({
          name: f.name,
          url: f.url || '',
          size: f.size,
          type: f.type
        }))
      };

      let response;
      if (editingLesson) {
        response = await notificationService.updateLessonLearned(editingLesson.id, lessonPayload);
      } else {
        response = await notificationService.createLessonLearned(lessonPayload);
      }

      const savedLesson = response?.lesson || response?.data?.lesson || response;

      if (editingLesson) {
        setLessons(prev => prev.map(l => l.id === editingLesson.id ? { ...l, ...savedLesson } : l));
        message.success('Lesson updated');
        if (onUpdateLesson) onUpdateLesson(savedLesson);
      } else {
        setLessons(prev => [savedLesson, ...prev]);
        message.success('Lesson learned recorded');
        if (onAddLesson) onAddLesson(savedLesson);
      }

      setModalVisible(false);
      form.resetFields();
      setEditingLesson(null);
      setFileList([]);
    } catch (error) {
      console.error('Failed to save lesson:', error);
      message.error(error?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  // ==================== REACTIONS ====================

  const handleReaction = async (lessonId, reactionType) => {
    const key = `${lessonId}-${reactionType}`;
    const hasReacted = reactions[key];

    // Optimistic UI update
    setReactions(prev => ({ ...prev, [key]: !hasReacted }));
    setLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        return {
          ...l,
          reactions: {
            ...l.reactions,
            [reactionType]: Math.max(0, (l.reactions?.[reactionType] || 0) + (hasReacted ? -1 : 1))
          }
        };
      }
      return l;
    }));

    try {
      await notificationService.reactToLesson(lessonId, reactionType);
      message.success(hasReacted ? 'Reaction removed' : 'Thanks for your feedback!');
    } catch (error) {
      console.error('Failed to save reaction:', error);
      // Revert on failure
      setReactions(prev => ({ ...prev, [key]: hasReacted }));
    }
  };

  // ==================== SHARE ====================

  const handleShare = async (lesson) => {
    const shareUrl = `${window.location.origin}/lessons/${lesson.id}`;
    navigator.clipboard?.writeText(shareUrl);
    
    try {
      await notificationService.shareLesson(lesson.id);
      setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, shares: (l.shares || 0) + 1 } : l));
    } catch (error) {
      console.error('Share failed:', error);
    }
    
    message.success('Link copied to clipboard');
  };

  // ==================== DELETE ====================

  const handleDeleteLesson = async (lessonId) => {
    try {
      await notificationService.deleteLessonLearned(lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      message.success('Lesson deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('Failed to delete lesson');
    }
  };

  // ==================== FILTERS & STATS ====================

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

  const stats = useMemo(() => {
    const total = lessons.length;
    const published = lessons.filter(l => l.status === 'published').length;
    const totalViews = lessons.reduce((sum, l) => sum + (l.views || 0), 0);
    const totalShares = lessons.reduce((sum, l) => sum + (l.shares || 0), 0);
    return { total, published, totalViews, totalShares };
  }, [lessons]);

  // ==================== RENDER HELPERS ====================

  const renderLessonCard = (lesson) => {
    const categoryConfig = LESSON_CATEGORIES[lesson.category] || {};
    const severityConfig = LESSON_SEVERITY[lesson.severity] || {};
    const statusConfig = LESSON_STATUS[lesson.status] || {};

    return (
      <Card
        key={lesson.id}
        hoverable
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <Avatar style={{ backgroundColor: categoryConfig.color }} icon={categoryConfig.icon} />
            <Text strong style={{ fontSize: 15 }}>{lesson.title}</Text>
          </Space>
        }
        extra={
          <Space>
            <Tag color={severityConfig.color} icon={severityConfig.icon}>{severityConfig.label}</Tag>
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
          </Space>
        }
        actions={[
          <Tooltip title="View Details" key="view">
            <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelectedLesson(lesson); setDetailsVisible(true); }}>
              {lesson.views || 0}
            </Button>
          </Tooltip>,
          <Tooltip title="Helpful" key="helpful">
            <Button type="text" icon={<LikeOutlined style={{ color: reactions[`${lesson.id}-helpful`] ? '#52c41a' : undefined }} />} onClick={() => handleReaction(lesson.id, 'helpful')}>
              {lesson.reactions?.helpful || 0}
            </Button>
          </Tooltip>,
          <Tooltip title="Share" key="share">
            <Button type="text" icon={<ShareAltOutlined />} onClick={() => handleShare(lesson)}>
              {lesson.shares || 0}
            </Button>
          </Tooltip>,
          ...(!readOnly ? [
            <Tooltip title="Edit" key="edit">
              <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingLesson(lesson); form.setFieldsValue(lesson); setModalVisible(true); }} />
            </Tooltip>,
            <Popconfirm key="delete" title="Delete this lesson?" onConfirm={() => handleDeleteLesson(lesson.id)}>
              <Tooltip title="Delete">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          ] : [])
        ]}
      >
        <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 12 }}>
          {lesson.summary}
        </Paragraph>

        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            {lesson.tags?.slice(0, 5).map(tag => <Tag key={tag} color="blue">{tag}</Tag>)}
            {lesson.tags?.length > 5 && <Tag>+{lesson.tags.length - 5} more</Tag>}
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text type="secondary" style={{ fontSize: 12 }}>{lesson.author?.name}</Text>
              </Space>
            </Col>
            <Col>
              <Space>
                {lesson.sourceIncident && (
                  <Tooltip title="Source Incident">
                    <Tag color="orange"><LinkOutlined /> {lesson.sourceIncident}</Tag>
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

  // ==================== MAIN RENDER ====================

  return (
    <div>
      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="Total Lessons" value={stats.total} prefix={<BulbOutlined />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="Published" value={stats.published} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="Total Views" value={stats.totalViews} prefix={<EyeOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="Total Shares" value={stats.totalShares} prefix={<ShareAltOutlined />} valueStyle={{ color: '#13c2c2' }} /></Card></Col>
      </Row>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" tip="Loading lessons..." />
        </div>
      )}

      {!loading && (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><BulbOutlined /> All Lessons</span>} key="all">
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8} md={6}>
                  <Input.Search placeholder="Search lessons..." value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear />
                </Col>
                <Col xs={24} sm={8} md={5}>
                  <Select value={filterCategory} onChange={setFilterCategory} style={{ width: '100%' }} placeholder="Category">
                    <Option value="all">All Categories</Option>
                    {Object.entries(LESSON_CATEGORIES).map(([key, config]) => (
                      <Option key={key} value={key}>{config.icon} {config.label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={5}>
                  <Select value={filterSeverity} onChange={setFilterSeverity} style={{ width: '100%' }} placeholder="Severity">
                    <Option value="all">All Severities</Option>
                    {Object.entries(LESSON_SEVERITY).map(([key, config]) => (
                      <Option key={key} value={key}>{config.icon} {config.label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} md={8}>
                  <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchLessons}>Refresh</Button>
                    {!readOnly && (
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        setEditingLesson(null);
                        form.resetFields();
                        form.setFieldsValue({ severity: 'medium', status: 'draft' });
                        setFileList([]);
                        setModalVisible(true);
                      }}>
                        Share New Lesson
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>

            {filteredLessons.length > 0 ? (
              <Row gutter={[16, 16]}>
                {filteredLessons.map(lesson => (
                  <Col xs={24} lg={12} key={lesson.id}>{renderLessonCard(lesson)}</Col>
                ))}
              </Row>
            ) : (
              <Card>
                <Empty description="No lessons found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  {!readOnly && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                      Share First Lesson
                    </Button>
                  )}
                </Empty>
              </Card>
            )}
          </TabPane>

          {/* Other tabs same as before but using filteredLessons */}
          <TabPane tab={<span><StarOutlined /> Most Helpful</span>} key="helpful">
            <Row gutter={[16, 16]}>
              {[...filteredLessons]
                .sort((a, b) => (b.reactions?.helpful || 0) - (a.reactions?.helpful || 0))
                .slice(0, 6)
                .map(lesson => <Col xs={24} lg={12} key={lesson.id}>{renderLessonCard(lesson)}</Col>)}
            </Row>
          </TabPane>

          <TabPane tab={<span><EyeOutlined /> Most Viewed</span>} key="viewed">
            <Row gutter={[16, 16]}>
              {[...filteredLessons]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 6)
                .map(lesson => <Col xs={24} lg={12} key={lesson.id}>{renderLessonCard(lesson)}</Col>)}
            </Row>
          </TabPane>

          <TabPane tab={<span><EditOutlined /> My Drafts</span>} key="drafts">
            {lessons.filter(l => l.status === 'draft' && l.author?.id === currentUser?.id).length > 0 ? (
              <Row gutter={[16, 16]}>
                {lessons
                  .filter(l => l.status === 'draft' && l.author?.id === currentUser?.id)
                  .map(lesson => <Col xs={24} lg={12} key={lesson.id}>{renderLessonCard(lesson)}</Col>)}
              </Row>
            ) : (
              <Empty description="No drafts" />
            )}
          </TabPane>
        </Tabs>
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={<Space><BulbOutlined />{editingLesson ? 'Edit Lesson Learned' : 'Share Lesson Learned'}</Space>}
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
        <Form form={form} layout="vertical" onFinish={handleSaveLesson}>
          <Form.Item name="title" label="Lesson Title" rules={[{ required: true }]}>
            <Input placeholder="Brief, descriptive title" maxLength={150} showCount />
          </Form.Item>

          <Form.Item name="summary" label="Summary" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Describe the lesson..." maxLength={500} showCount />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category">
                  {Object.entries(LESSON_CATEGORIES).map(([key, config]) => (
                    <Option key={key} value={key}>{config.icon} {config.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
                <Select>
                  {Object.entries(LESSON_SEVERITY).map(([key, config]) => (
                    <Option key={key} value={key}>{config.icon} {config.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status" initialValue="draft">
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="review">Submit for Review</Option>
                  {(currentUser?.user_type === 'admin' || currentUser?.user_type === 'super_admin') && (
                    <Option value="published">Publish</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="sourceIncident" label="Related Incident (optional)">
            <Select placeholder="Link to incident" allowClear showSearch optionFilterProp="children">
              {incidents.map(inc => (
                <Option key={inc.id} value={inc.incident_number || inc.id}>
                  {inc.incident_number || `INC-${inc.id}`} - {inc.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="Tags" extra="Press Enter to add tags">
            <Select mode="tags" placeholder="Add relevant tags..." style={{ width: '100%' }} />
          </Form.Item>

          <Form.List name="keyTakeaways">
            {(fields, { add, remove }) => (
              <>
                <Divider orientation="left">Key Takeaways</Divider>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={name} style={{ marginBottom: 0, width: 600 }}>
                      <Input placeholder="Key takeaway point" />
                    </Form.Item>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Key Takeaway</Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.List name="recommendations">
            {(fields, { add, remove }) => (
              <>
                <Divider orientation="left">Recommendations</Divider>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={name} style={{ marginBottom: 0, width: 600 }}>
                      <Input placeholder="Recommended action" />
                    </Form.Item>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Recommendation</Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="applicableIndustries" label="Applicable Industries">
            <Select mode="multiple" placeholder="Select industries">
              {['healthcare', 'construction', 'oil_gas', 'aviation', 'manufacturing', 'transportation', 'mining', 'hospitality'].map(ind => (
                <Option key={ind} value={ind}>{ind.replace('_', ' ')}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Attachments">
            <Dragger multiple fileList={fileList} onChange={({ fileList: newList }) => setFileList(newList)} beforeUpload={() => false}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Click or drag files to upload</p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                {editingLesson ? 'Update' : 'Share'} Lesson
              </Button>
              <Button onClick={() => { setModalVisible(false); form.resetFields(); setEditingLesson(null); setFileList([]); }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer — keep your existing implementation */}
      <Drawer
        title={<Space><BulbOutlined style={{ color: '#722ed1' }} />Lesson Details</Space>}
        placement="right"
        width={700}
        open={detailsVisible}
        onClose={() => { setDetailsVisible(false); setSelectedLesson(null); }}
      >
        {selectedLesson && (
          <div>
            <AntTitle level={4}>{selectedLesson.title}</AntTitle>
            <Space wrap style={{ marginBottom: 16 }}>
              <Tag color={LESSON_SEVERITY[selectedLesson.severity]?.color}>{LESSON_SEVERITY[selectedLesson.severity]?.label}</Tag>
              <Tag color={LESSON_CATEGORIES[selectedLesson.category]?.color}>{LESSON_CATEGORIES[selectedLesson.category]?.label}</Tag>
              <Tag color={LESSON_STATUS[selectedLesson.status]?.color}>{LESSON_STATUS[selectedLesson.status]?.label}</Tag>
            </Space>
            <Card size="small" style={{ marginBottom: 16 }}><Text>{selectedLesson.summary}</Text></Card>

            {selectedLesson.keyTakeaways?.length > 0 && (
              <>
                <Divider orientation="left">Key Takeaways</Divider>
                <List size="small" dataSource={selectedLesson.keyTakeaways} renderItem={(item, i) => (
                  <List.Item><Space><Avatar size="small" style={{ backgroundColor: '#52c41a' }}>{i + 1}</Avatar><Text>{item}</Text></Space></List.Item>
                )} />
              </>
            )}

            {selectedLesson.recommendations?.length > 0 && (
              <>
                <Divider orientation="left">Recommendations</Divider>
                <List size="small" dataSource={selectedLesson.recommendations} renderItem={(item) => (
                  <List.Item><Space><CheckCircleOutlined style={{ color: '#52c41a' }} /><Text>{item}</Text></Space></List.Item>
                )} />
              </>
            )}

            <Divider orientation="left">Was this helpful?</Divider>
            <Space>
              {Object.entries(REACTION_TYPES).map(([key, config]) => (
                <Button key={key} icon={config.icon} onClick={() => handleReaction(selectedLesson.id, key)}
                  type={reactions[`${selectedLesson.id}-${key}`] ? 'primary' : 'default'}
                  style={{ color: reactions[`${selectedLesson.id}-${key}`] ? '#fff' : config.color, borderColor: config.color }}>
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