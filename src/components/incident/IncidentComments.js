// src/components/incidents/IncidentComments.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, List, Avatar, Input, Button, Space, Tag, message,
  Typography, Divider, Tooltip, Badge, Dropdown,
  Modal, Form, Select, Alert, Empty, Spin, Popconfirm
} from 'antd';
import {
  UserOutlined, SendOutlined, DeleteOutlined, EditOutlined,
  MoreOutlined, PaperClipOutlined,  LockOutlined,
  EyeOutlined, EyeInvisibleOutlined, CommentOutlined,
  TeamOutlined, ClockCircleOutlined, PushpinOutlined,
  BellOutlined, FileImageOutlined, CloseOutlined, ReloadOutlined, AlertOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// ✅ SERVICE IMPORTS
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Text, Paragraph } = Typography;
const { Option } = Select;

// ==================== COMMENT TYPES ====================

const COMMENT_TYPES = {
  comment: { label: 'Comment', color: 'blue', icon: <CommentOutlined /> },
  update: { label: 'Update', color: 'green', icon: <BellOutlined /> },
  question: { label: 'Question', color: 'orange', icon: <AlertOutlined /> },
  decision: { label: 'Decision', color: 'purple', icon: <PushpinOutlined /> },
  note: { label: 'Internal Note', color: 'default', icon: <LockOutlined /> }
};

// ==================== INCIDENT COMMENTS COMPONENT ====================

const IncidentComments = ({ 
  incident, 
  currentUser: propUser,
  onAddComment,
  readOnly = false 
}) => {
  // ✅ Get current user from context (fallback to prop)
  const { user: contextUser } = useAuth();
  const currentUser = propUser || contextUser;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('comment');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  // ==================== FETCH COMMENTS ====================

  const fetchComments = useCallback(async () => {
    if (!incident?.id) return;

    setLoading(true);
    try {
      const response = await notificationService.getIncidentComments(incident.id);

      const commentsData = 
        response?.comments || 
        response?.data?.comments || 
        (Array.isArray(response) ? response : []) || 
        [];

      setComments(commentsData);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      // Fall back to incident data if available
      const savedComments = incident.custom_data?.comments || [];
      setComments(savedComments);
    } finally {
      setLoading(false);
    }
  }, [incident?.id, incident?.custom_data?.comments]);

  useEffect(() => {
    if (incident?.id) {
      fetchComments();
    }
  }, [incident?.id, fetchComments]);

  // ==================== ADD COMMENT ====================

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.warning('Please enter a comment');
      return;
    }

    if (!incident?.id) {
      message.warning('No incident selected');
      return;
    }

    setSubmitting(true);
    try {
      const mentions = extractMentions(newComment);

      const payload = {
        content: newComment.trim(),
        comment_type: commentType,
        is_internal: isInternal,
        mentions: mentions
      };

      const response = await notificationService.addIncidentComment(incident.id, payload);
      const savedComment = response?.comment || response?.data?.comment || response;

      if (savedComment) {
        setComments(prev => [savedComment, ...prev]);
        setNewComment('');
        setIsInternal(false);
        
        if (onAddComment) onAddComment(savedComment);
        
        message.success('Comment added');
      } else {
        // Optimistic fallback
        const fallback = {
          id: Date.now().toString(),
          content: newComment.trim(),
          comment_type: commentType,
          is_internal: isInternal,
          author: {
            id: currentUser?.id,
            name: currentUser?.name || currentUser?.email || 'Unknown',
            email: currentUser?.email,
            role: currentUser?.user_type
          },
          mentions: mentions,
          created_at: new Date().toISOString()
        };
        setComments(prev => [fallback, ...prev]);
        setNewComment('');
        setIsInternal(false);
        message.success('Comment added');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      message.error(error?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== EDIT COMMENT ====================

  const handleEditComment = async (values) => {
    if (!editingComment?.id || !incident?.id) return;

    try {
      const response = await notificationService.updateIncidentComment(
        incident.id,
        editingComment.id,
        { content: values.content }
      );

      const updated = response?.comment || response?.data?.comment || {
        ...editingComment,
        content: values.content,
        is_edited: true,
        edited_at: new Date().toISOString()
      };

      setComments(prev => prev.map(c => 
        c.id === editingComment.id ? updated : c
      ));

      setEditModalVisible(false);
      setEditingComment(null);
      editForm.resetFields();
      message.success('Comment updated');
    } catch (error) {
      console.error('Failed to update comment:', error);
      message.error(error?.message || 'Failed to update comment');
    }
  };

  // ==================== DELETE COMMENT ====================

  const handleDeleteComment = async (commentId) => {
    if (!incident?.id) return;

    // Optimistic
    const previous = [...comments];
    setComments(prev => prev.filter(c => c.id !== commentId));

    try {
      await notificationService.deleteIncidentComment(incident.id, commentId);
      message.success('Comment deleted');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setComments(previous);
      message.error('Failed to delete comment');
    }
  };

  // ==================== HELPERS ====================

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex) || [];
    return matches.map(m => m.substring(1));
  };

  const canModifyComment = (comment) => {
    const commentAuthorId = comment.author?.id || comment.author_id;
    return commentAuthorId === currentUser?.id;
  };

  const renderContentWithMentions = (content) => {
    if (!content) return null;
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

  // ==================== RENDER COMMENT ====================

  const renderComment = (comment) => {
    const typeConfig = COMMENT_TYPES[comment.comment_type || comment.type] || COMMENT_TYPES.comment;
    const authorName = comment.author?.name || comment.author_name || 'Unknown';
    const authorAvatar = comment.author?.avatar;
    const createdAt = comment.created_at || comment.createdAt;
    const isInternal = comment.is_internal || comment.isInternal;
    const isEdited = comment.is_edited || comment.edited;
    const mentions = comment.mentions || [];

    return (
      <List.Item
        key={comment.id}
        style={{
          background: isInternal ? '#fffbe6' : 'transparent',
          borderRadius: 8,
          padding: 12,
          marginBottom: 8
        }}
      >
        <List.Item.Meta
          avatar={
            <Avatar 
              src={authorAvatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
          }
          title={
            <Space>
              <Text strong>{authorName}</Text>
              <Tag color={typeConfig.color} icon={typeConfig.icon}>
                {typeConfig.label}
              </Tag>
              {isInternal && (
                <Tag color="gold" icon={<LockOutlined />}>Internal</Tag>
              )}
              {isEdited && (
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
                <Tooltip title={dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined /> {dayjs(createdAt).fromNow()}
                  </Text>
                </Tooltip>
                {mentions.length > 0 && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <AtOutlined /> {mentions.join(', ')}
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

  // ==================== MAIN RENDER ====================

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
      extra={
        <Tooltip title="Refresh comments">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchComments}
            loading={loading}
            size="small"
          />
        </Tooltip>
      }
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="Loading comments..." />
        </div>
      ) : comments.length > 0 ? (
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