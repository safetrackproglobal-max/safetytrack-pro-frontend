// src/components/documents/RecentDraftsPanel.jsx
// Grid of sidebar-editor drafts, powered by /api/dm-documents/editor-drafts

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Typography, Tag, Empty,
  Spin, Avatar, Tooltip, Divider, message, Segmented, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, ClockCircleOutlined,
  FileTextOutlined, DeleteOutlined, ReloadOutlined,
  UserOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';

const { Title, Text } = Typography;

const RecentDraftsPanel = ({
  companyId = null,
  onOpenDocument,
  onCreateNew
}) => {
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [scope, setScope] = useState('mine');  // 'mine' | 'all'

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentService.getEditorDrafts({
        company_id: companyId,
        scope,
        limit: 30
      });
      setDrafts(data.documents || []);
    } catch (error) {
      console.error('Failed to load drafts:', error);
      message.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  }, [companyId, scope]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleDelete = async (id, title) => {
    try {
      await documentService.deleteDocument(id);
      message.success(`"${title}" deleted`);
      loadDrafts();
    } catch (error) {
      message.error('Failed to delete draft');
    }
  };

  const formatRelative = (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            Recent Drafts
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Documents you started or edited in the standalone editor.
          </Text>
        </div>

        <Space wrap>
          <Segmented
            value={scope}
            onChange={setScope}
            options={[
              { label: 'My drafts', value: 'mine', icon: <UserOutlined /> },
              { label: 'Team drafts', value: 'all' }
            ]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={loadDrafts}
            loading={loading}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateNew}
          >
            New Document
          </Button>
        </Space>
      </div>

      <Divider style={{ margin: '12px 0 16px' }} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading drafts…</div>
        </div>
      ) : drafts.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={8}>
              <Text type="secondary">No drafts yet</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Start writing and your drafts will appear here.
              </Text>
            </Space>
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateNew}
          >
            Create Your First Draft
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {drafts.map((doc) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={doc.id}>
              <Card
                hoverable
                size="small"
                style={{ height: '100%' }}
                onClick={() => onOpenDocument?.(doc)}
                actions={[
                  <Tooltip title="Edit" key="edit">
                    <EditOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDocument?.(doc);
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title="Delete" key="delete">
                    <DeleteOutlined
                      style={{ color: '#ff4d4f' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Delete "${doc.title || 'Untitled'}"?`
                          )
                        ) {
                          handleDelete(doc.id, doc.title || 'Untitled');
                        }
                      }}
                    />
                  </Tooltip>
                ]}
              >
                <Card.Meta
                  avatar={
                    <Badge
                      count={doc.version > 1 ? `v${doc.version}` : 0}
                      size="small"
                      offset={[-4, 4]}
                    >
                      <Avatar
                        icon={<FileTextOutlined />}
                        style={{ backgroundColor: '#13c2c2' }}
                      />
                    </Badge>
                  }
                  title={
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {doc.title || 'Untitled Draft'}
                    </div>
                  }
                  description={
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ fontSize: 12, width: '100%' }}
                    >
                      <Space wrap>
                        <Tag color="cyan" style={{ margin: 0 }}>
                          {doc.document_type || 'report'}
                        </Tag>
                        <Tag
                          color={
                            doc.status === 'draft'
                              ? 'default'
                              : doc.status === 'review'
                              ? 'processing'
                              : 'success'
                          }
                          style={{ margin: 0 }}
                        >
                          {doc.status || 'draft'}
                        </Tag>
                      </Space>
                      <Text type="secondary">
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {formatRelative(doc.updated_at)}
                      </Text>
                      {doc.description && (
                        <Text
                          type="secondary"
                          ellipsis
                          style={{ fontSize: 11 }}
                        >
                          {doc.description}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default RecentDraftsPanel;