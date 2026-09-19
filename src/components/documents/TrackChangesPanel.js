// src/components/documents/TrackChangesPanel.jsx
import React from 'react';
import {
  Drawer, List, Tag, Space, Button, Typography, Empty,
  Popconfirm, Badge, Tooltip, Divider, Alert
} from 'antd';
import {
  CheckOutlined, CloseOutlined, DeleteOutlined,
  HistoryOutlined, EyeOutlined
} from '@ant-design/icons';
import { hunksToInlineHtml } from './useTrackChanges';

const { Text, Paragraph } = Typography;

/**
 * TrackChangesPanel
 *
 * Shows pending change-sets saved on the server. Also shows the current
 * uncommitted hunks so the user can preview before saving.
 */
const TrackChangesPanel = ({
  open,
  onClose,
  pendingChanges = [],
  currentHunks = [],
  hasUnsavedChange = false,
  onAccept,
  onReject,
  onDelete,
  onSaveCurrent,
  loading = false
}) => {
  return (
    <Drawer
      title={
        <Space>
          <HistoryOutlined />
          <span>Track Changes</span>
          {pendingChanges.length > 0 && (
            <Badge count={pendingChanges.length} style={{ backgroundColor: '#faad14' }} />
          )}
        </Space>
      }
      placement="right"
      open={open}
      onClose={onClose}
      width={520}
    >
      {/* -------- Unsaved local changes -------- */}
      {hasUnsavedChange && currentHunks.length > 0 && (
        <>
          <Alert
            type="warning"
            showIcon
            message="Uncommitted changes"
            description={`${countInserts(currentHunks)} insertion(s), ${countDeletes(currentHunks)} deletion(s) since you entered track-changes mode.`}
            action={
              <Button type="primary" size="small" onClick={onSaveCurrent} loading={loading}>
                Save as Change Set
              </Button>
            }
            style={{ marginBottom: 16 }}
          />

          <div
            className="track-preview"
            dangerouslySetInnerHTML={{ __html: hunksToInlineHtml(currentHunks) }}
          />

          <Divider />
        </>
      )}

      {/* -------- Pending server-side changes -------- */}
      <Text strong style={{ fontSize: 14 }}>Pending Change Sets</Text>
      <div style={{ marginTop: 12 }}>
        {pendingChanges.length === 0 ? (
          <Empty description="No pending changes" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={pendingChanges}
            renderItem={(change) => (
              <List.Item
                key={change.id}
                actions={[
                  <Tooltip key="a" title="Accept">
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => onAccept(change.id)}
                    />
                  </Tooltip>,
                  <Tooltip key="r" title="Reject">
                    <Button
                      danger
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => onReject(change.id)}
                    />
                  </Tooltip>,
                  <Popconfirm
                    key="d"
                    title="Delete this change set?"
                    onConfirm={() => onDelete(change.id)}
                  >
                    <Button size="small" icon={<DeleteOutlined />} />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>#{change.id}</Text>
                      <Tag color="orange">pending</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {change.summary}
                      </Text>
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {change.author_name || 'Unknown'} •{' '}
                        {change.created_at
                          ? new Date(change.created_at).toLocaleString()
                          : ''}
                      </Text>

                      {/* Inline diff preview */}
                      <div
                        className="track-preview track-preview-small"
                        dangerouslySetInnerHTML={{
                          __html: hunksToInlineHtml(change.hunks)
                        }}
                      />
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Drawer>
  );
};

// helpers
const countInserts = (hunks) => hunks.filter((h) => h.type === 'insert').length;
const countDeletes = (hunks) => hunks.filter((h) => h.type === 'delete').length;

export default TrackChangesPanel;