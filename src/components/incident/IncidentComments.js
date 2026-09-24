// src/components/incidents/IncidentComments.js
import React, { useState, useEffect } from 'react';
import {
  Card, List, Avatar, Input, Button, Space, Tag, message,
  Typography, Divider, Tooltip, Badge, Dropdown, Menu,
  Modal, Form, Select, Alert, Empty, Spin, Popconfirm
} from 'antd';
import {
  UserOutlined, SendOutlined, DeleteOutlined, EditOutlined,
  MoreOutlined, PaperClipOutlined, AtOutlined, LockOutlined,
  EyeOutlined, EyeInvisibleOutlined, CommentOutlined,
  TeamOutlined, ClockCircleOutlined, PushpinOutlined,
  BellOutlined, FileImageOutlined, CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Text, Paragraph } = Typography;
const { Option } = Select;

// ==================== COMMENT TYPES ====================

const COMMENT_TYPES = {
  comment: { label: 'Comment', color: 'blue', icon: <CommentOutlined /> },
  update: { label: 'Update', color: 'green', icon: <BellOutlined /> },
  question: { label: 'Question', color: 'orange', icon: <AtOutlined /> },
  decision: { label: 'Decision', color: 'purple', icon: <PushpinOutlined /> },
  note: { label: 'Internal Note', color: 'default', icon: <LockOutlined /> }
};

// ==================== INCIDENT COMMENTS COMPONENT ====================

const IncidentComments = ({ 
  incident, 
  currentUser,
  onAddComment,
  readOnly = false 
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('comment');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [mentions, setMentions] = useState([]);

  // Load comments from incident
  useEffect(() => {
    if (incident) {
      const savedComments = incident.custom_data?.comments || [];
      setComments(savedComments);
    }
  }, [incident]);

  // Handle adding comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.warning('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        type: commentType,
        isInternal,
        author: {
          id: currentUser?.id,
          name: currentUser?.name || currentUser?.email || 'Unknown',
          avatar: currentUser?.avatar
        },
        createdAt: new Date().toISOString(),
        mentions: extractMentions(newComment)
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setMentions([]);
      
      if (onAddComment) {
        onAddComment(comment);
      }
      
      message.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Extract @mentions from text
  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex) || [];
    return matches.map(m => m.substring(1));
  };

  // Handle edit comment
  const handleEditComment = (values) => {
    setComments(prev => prev.map(c => 
      c.id === editingComment.id 
        ? { 
            ...c, 
            content: values.content, 
            editedAt: new Date().toISOString(),
            edited: true
          }
        : c
    ));
    setEditModalVisible(false);
    setEditingComment(null);
    editForm.resetFields();
    message.success('Comment updated');
  };

  // Handle delete comment
  const handleDeleteComment = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    message.success('Comment deleted');
  };

  // Check if user can edit/delete comment
  const canModifyComment = (comment) => {
    return comment.author?.id === currentUser?.id;
  };

  // Render comment item
  const renderComment = (comment) => {
    const typeConfig = COMMENT_TYPES[comment.type] || COMMENT_TYPES.comment;
    
    return (
      <List.Item
        key={comment.id}
        style={{
          background: comment.isInternal ? '#fffbe6' : 'transparent',
          borderRadius: 8,
          padding: 12,
          marginBottom: 8
        }}
      >
        <List.Item.Meta
          avatar={
            <Avatar 
              src={comment.author?.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
          }
          title={
            <Space>
              <Text strong>{comment.author?.name || 'Unknown'}</Text>
              <Tag color={typeConfig.color} icon={typeConfig.icon}>
                {typeConfig.label}
              </Tag>
              {comment.isInternal && (
                <Tag color="gold" icon={<LockOutlined />}>Internal</Tag>
              )}
              {comment.edited && (
                <Text type="secondary" style={{ fontSize: 11 }}>(edited)</Text>
              )}
            </Space>
          }
          description={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {renderContentWithMentions(comment.content)}
              </Paragraph>
              <Space>
                <Tooltip title={dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined /> {dayjs(comment.createdAt).fromNow()}
                  </Text>
                </Tooltip>
                {comment.mentions?.length > 0 && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <AtOutlined /> {comment.mentions.join(', ')}
                  </Text>
                )}
              </Space>
            </Space>
          }
        />
        
        {!readOnly && canModifyComment(comment) && (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Edit',
                  onClick: () => {
                    setEditingComment(comment);
                    editForm.setFieldsValue({ content: comment.content });
                    setEditModalVisible(true);
                  }
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Delete',
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: 'Delete Comment',
                      content: 'Are you sure you want to delete this comment?',
                      okText: 'Delete',
                      okType: 'danger',
                      onOk: () => handleDeleteComment(comment.id)
                    });
                  }
                }
              ]
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        )}
      </List.Item>
    );
  };

  // Render content with highlighted mentions
  const renderContentWithMentions = (content) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <Tag key={index} color="blue" style={{ margin: '0 2px' }}>
            {part}
          </Tag>
        );
      }
      return part;
    });
  };

  return (
    <Card
      title={
        <Space>
          <CommentOutlined />
          <span>Discussion</span>
          <Badge count={comments.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      size="small"
    >
      {/* Add Comment Section */}
      {!readOnly && (
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space style={{ width: '100%' }}>
              <Select
                value={commentType}
                onChange={setCommentType}
                style={{ width: 150 }}
                size="small"
              >
                {Object.entries(COMMENT_TYPES).map(([key, config]) => (
                  <Option key={key} value={key}>
                    {config.icon} {config.label}
                  </Option>
                ))}
              </Select>
              
              <Tooltip title="Internal notes are only visible to admins and investigators">
                <Button
                  type={isInternal ? 'primary' : 'default'}
                  size="small"
                  icon={isInternal ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => setIsInternal(!isInternal)}
                >
                  {isInternal ? 'Internal' : 'Public'}
                </Button>
              </Tooltip>
            </Space>

            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... Use @ to mention someone"
              rows={3}
              maxLength={2000}
              showCount
            />

            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleAddComment}
                loading={submitting}
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {newComment.length}/2000 characters
              </Text>
            </Space>
          </Space>
        </div>
      )}

      <Divider style={{ margin: '12px 0' }} />

      {/* Comments List */}
      {comments.length > 0 ? (
        <List
          dataSource={comments}
          renderItem={renderComment}
          pagination={comments.length > 10 ? {
            pageSize: 10,
            size: 'small',
            showTotal: (total) => `${total} comments`
          } : false}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No comments yet"
        >
          <Text type="secondary">Start the discussion by adding a comment</Text>
        </Empty>
      )}

      {/* Edit Comment Modal */}
      <Modal
        title="Edit Comment"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingComment(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditComment}
        >
          <Form.Item
            name="content"
            rules={[{ required: true, message: 'Comment cannot be empty' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Comment
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingComment(null);
                editForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default IncidentComments;