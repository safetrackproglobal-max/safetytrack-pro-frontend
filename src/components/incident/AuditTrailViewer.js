// src/components/incidents/AuditTrailViewer.js
import React, { useState, useEffect } from 'react';
import {
  Card, Timeline, Tag, Space, Button, Select, DatePicker, Input,
  Row, Col, message, Empty, Avatar, Tooltip, Badge, Typography,
  Descriptions, Divider, Modal, Table, Drawer, Alert, Spin
} from 'antd';
import {
  HistoryOutlined, UserOutlined, EditOutlined, DeleteOutlined,
  PlusOutlined, EyeOutlined, FileTextOutlined, CheckCircleOutlined,
  WarningOutlined, ClockCircleOutlined, SearchOutlined,
  FilterOutlined, DownloadOutlined, ReloadOutlined,
  LoginOutlined, LogoutOutlined, SettingOutlined,
  BellOutlined, CommentOutlined, PaperClipOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ==================== AUDIT ACTION TYPES ====================

const AUDIT_ACTIONS = {
  created: { label: 'Created', color: 'green', icon: <PlusOutlined /> },
  updated: { label: 'Updated', color: 'blue', icon: <EditOutlined /> },
  deleted: { label: 'Deleted', color: 'red', icon: <DeleteOutlined /> },
  viewed: { label: 'Viewed', color: 'default', icon: <EyeOutlined /> },
  status_changed: { label: 'Status Changed', color: 'purple', icon: <CheckCircleOutlined /> },
  assigned: { label: 'Assigned', color: 'cyan', icon: <UserOutlined /> },
  commented: { label: 'Commented', color: 'geekblue', icon: <CommentOutlined /> },
  file_uploaded: { label: 'File Uploaded', color: 'orange', icon: <PaperClipOutlined /> },
  notification_sent: { label: 'Notification Sent', color: 'gold', icon: <BellOutlined /> },
  exported: { label: 'Exported', color: 'magenta', icon: <DownloadOutlined /> },
  login: { label: 'Login', color: 'default', icon: <LoginOutlined /> },
  logout: { label: 'Logout', color: 'default', icon: <LogoutOutlined /> },
  settings_changed: { label: 'Settings Changed', color: 'orange', icon: <SettingOutlined /> }
};

// ==================== AUDIT TRAIL VIEWER COMPONENT ====================

const AuditTrailViewer = ({ 
  incident, 
  visible, 
  onClose,
  auditLogs = [] 
}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');

  // Load audit logs
  useEffect(() => {
    if (incident) {
      setLoading(true);
      // In real implementation, fetch from API
      const incidentLogs = auditLogs.filter(log => log.incidentId === incident.id);
      
      // Add mock data if no logs
      const mockLogs = incidentLogs.length > 0 ? incidentLogs : generateMockLogs(incident);
      setLogs(mockLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setLoading(false);
    }
  }, [incident, auditLogs]);

  // Generate mock logs for demonstration
  const generateMockLogs = (incident) => {
    const mockLogs = [
      {
        id: '1',
        incidentId: incident.id,
        action: 'created',
        user: { id: '1', name: incident.reported_by_name || 'Reporter', email: 'reporter@example.com' },
        timestamp: incident.created_at || new Date().toISOString(),
        details: {
          description: 'Incident report created',
          fields: { title: incident.title, severity: incident.severity }
        }
      },
      {
        id: '2',
        incidentId: incident.id,
        action: 'status_changed',
        user: { id: '2', name: 'Manager', email: 'manager@example.com' },
        timestamp: dayjs(incident.created_at).add(1, 'hour').toISOString(),
        details: {
          description: 'Status changed from Draft to Reported',
          oldValue: 'draft',
          newValue: 'reported'
        }
      },
      {
        id: '3',
        incidentId: incident.id,
        action: 'assigned',
        user: { id: '2', name: 'Manager', email: 'manager@example.com' },
        timestamp: dayjs(incident.created_at).add(2, 'hours').toISOString(),
        details: {
          description: 'Assigned to investigator',
          assignedTo: 'John Investigator'
        }
      },
      {
        id: '4',
        incidentId: incident.id,
        action: 'commented',
        user: { id: '3', name: 'Investigator', email: 'investigator@example.com' },
        timestamp: dayjs(incident.created_at).add(3, 'hours').toISOString(),
        details: {
          description: 'Added comment',
          comment: 'Initial investigation started. Reviewing witness statements.'
        }
      },
      {
        id: '5',
        incidentId: incident.id,
        action: 'file_uploaded',
        user: { id: '3', name: 'Investigator', email: 'investigator@example.com' },
        timestamp: dayjs(incident.created_at).add(4, 'hours').toISOString(),
        details: {
          description: 'Uploaded evidence file',
          fileName: 'incident_photo_001.jpg',
          fileSize: '2.4 MB'
        }
      }
    ];

    return mockLogs;
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (filterUser !== 'all' && log.user?.id !== filterUser) return false;
    if (dateRange && dateRange.length === 2) {
      const logDate = dayjs(log.timestamp);
      if (logDate.isBefore(dateRange[0]) || logDate.isAfter(dateRange[1])) return false;
    }
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        log.details?.description?.toLowerCase().includes(searchLower) ||
        log.user?.name?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Get unique users for filter
  const uniqueUsers = [...new Map(logs.map(log => [log.user?.id, log.user])).values()].filter(Boolean);

  // Export audit trail
  const handleExport = () => {
    const csvData = filteredLogs.map(log => ({
      'Timestamp': dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      'Action': log.action,
      'User': log.user?.name,
      'Email': log.user?.email,
      'Description': log.details?.description
    }));

    // Convert to CSV and download
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${incident?.incident_number || 'incident'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('Audit trail exported');
  };

  // Render timeline item
  const renderTimelineItem = (log) => {
    const actionConfig = AUDIT_ACTIONS[log.action] || AUDIT_ACTIONS.viewed;
    
    return (
      <Timeline.Item
        key={log.id}
        color={actionConfig.color}
        dot={
          <Tooltip title={actionConfig.label}>
            <Avatar 
              size="small" 
              style={{ backgroundColor: actionConfig.color }}
              icon={actionConfig.icon}
            />
          </Tooltip>
        }
      >
        <Card 
          size="small" 
          style={{ marginBottom: 8, cursor: 'pointer' }}
          onClick={() => {
            setSelectedLog(log);
            setDetailsModalVisible(true);
          }}
        >
          <Row justify="space-between" align="top">
            <Col>
              <Space direction="vertical" size={4}>
                <Space>
                  <Tag color={actionConfig.color} icon={actionConfig.icon}>
                    {actionConfig.label}
                  </Tag>
                  <Text strong>{log.user?.name || 'System'}</Text>
                </Space>
                <Text>{log.details?.description}</Text>
                {log.details?.oldValue && log.details?.newValue && (
                  <Space>
                    <Tag color="red">{log.details.oldValue}</Tag>
                    <span>→</span>
                    <Tag color="green">{log.details.newValue}</Tag>
                  </Space>
                )}
              </Space>
            </Col>
            <Col>
              <Tooltip title={dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <ClockCircleOutlined /> {dayjs(log.timestamp).fromNow()}
                </Text>
              </Tooltip>
            </Col>
          </Row>
        </Card>
      </Timeline.Item>
    );
  };

  return (
    <Drawer
      title={
        <Space>
          <HistoryOutlined />
          <span>Audit Trail</span>
          {incident && (
            <Tag color="blue">{incident.incident_number || `#${incident.id}`}</Tag>
          )}
          <Badge count={filteredLogs.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      placement="right"
      width={800}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Tooltip title="Export Audit Trail">
            <Button icon={<DownloadOutlined />} onClick={handleExport} />
          </Tooltip>
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={() => setLoading(true)} />
          </Tooltip>
        </Space>
      }
    >
      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Select
              value={filterAction}
              onChange={setFilterAction}
              style={{ width: '100%' }}
              placeholder="Filter by action"
            >
              <Option value="all">All Actions</Option>
              {Object.entries(AUDIT_ACTIONS).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.icon} {config.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Select
              value={filterUser}
              onChange={setFilterUser}
              style={{ width: '100%' }}
              placeholder="Filter by user"
            >
              <Option value="all">All Users</Option>
              {uniqueUsers.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker 
              style={{ width: '100%' }} 
              onChange={setDateRange}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: 12 }}>
          <Col span={24}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search audit logs..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">Total Events</Text>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{logs.length}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">Unique Users</Text>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{uniqueUsers.length}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">Last Activity</Text>
            <div style={{ fontSize: 14 }}>
              {logs[0] ? dayjs(logs[0].timestamp).fromNow() : 'N/A'}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">Filtered</Text>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{filteredLogs.length}</div>
          </Card>
        </Col>
      </Row>

      {/* Timeline */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : filteredLogs.length > 0 ? (
        <Timeline mode="left">
          {filteredLogs.map(renderTimelineItem)}
        </Timeline>
      ) : (
        <Empty 
          description="No audit logs found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* Log Details Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            Audit Log Details
          </Space>
        }
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedLog(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedLog && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Action">
                <Tag 
                  color={AUDIT_ACTIONS[selectedLog.action]?.color}
                  icon={AUDIT_ACTIONS[selectedLog.action]?.icon}
                >
                  {AUDIT_ACTIONS[selectedLog.action]?.label || selectedLog.action}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="User">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  {selectedLog.user?.name}
                  <Text type="secondary">({selectedLog.user?.email})</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Timestamp">
                {dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedLog.details?.description}
              </Descriptions.Item>
              {selectedLog.details?.oldValue && (
                <Descriptions.Item label="Change">
                  <Space>
                    <Tag color="red">{selectedLog.details.oldValue}</Tag>
                    <span>→</span>
                    <Tag color="green">{selectedLog.details.newValue}</Tag>
                  </Space>
                </Descriptions.Item>
              )}
              {selectedLog.details?.comment && (
                <Descriptions.Item label="Comment">
                  <Paragraph>{selectedLog.details.comment}</Paragraph>
                </Descriptions.Item>
              )}
              {selectedLog.details?.fileName && (
                <Descriptions.Item label="File">
                  <Space>
                    <PaperClipOutlined />
                    {selectedLog.details.fileName}
                    {selectedLog.details.fileSize && (
                      <Text type="secondary">({selectedLog.details.fileSize})</Text>
                    )}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedLog.details?.fields && (
              <>
                <Divider orientation="left">Changed Fields</Divider>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4,
                  fontSize: 12,
                  overflow: 'auto'
                }}>
                  {JSON.stringify(selectedLog.details.fields, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </Modal>
    </Drawer>
  );
};

export default AuditTrailViewer;