// src/components/incidents/AuditTrailViewer.js
import React, { useState, useEffect, useCallback } from 'react';
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

// ✅ SERVICE IMPORT
import notificationService from '../../services/notificationService';

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
  comment_added: { label: 'Comment Added', color: 'geekblue', icon: <CommentOutlined /> },
  file_uploaded: { label: 'File Uploaded', color: 'orange', icon: <PaperClipOutlined /> },
  notification_sent: { label: 'Notification Sent', color: 'gold', icon: <BellOutlined /> },
  exported: { label: 'Exported', color: 'magenta', icon: <DownloadOutlined /> },
  login: { label: 'Login', color: 'default', icon: <LoginOutlined /> },
  logout: { label: 'Logout', color: 'default', icon: <LogoutOutlined /> },
  settings_changed: { label: 'Settings Changed', color: 'orange', icon: <SettingOutlined /> },
  fishbone_updated: { label: 'Fishbone Updated', color: 'purple', icon: <EditOutlined /> },
  corrective_action_created: { label: 'Corrective Action Created', color: 'green', icon: <PlusOutlined /> },
  corrective_action_updated: { label: 'Corrective Action Updated', color: 'blue', icon: <EditOutlined /> },
  corrective_action_deleted: { label: 'Corrective Action Deleted', color: 'red', icon: <DeleteOutlined /> },
  witness_statement_added: { label: 'Witness Statement Added', color: 'cyan', icon: <FileTextOutlined /> },
  witness_statement_updated: { label: 'Witness Statement Updated', color: 'blue', icon: <EditOutlined /> },
  witness_statement_deleted: { label: 'Witness Statement Deleted', color: 'red', icon: <DeleteOutlined /> },
  team_member_added: { label: 'Team Member Added', color: 'blue', icon: <UserOutlined /> },
  team_member_removed: { label: 'Team Member Removed', color: 'red', icon: <UserOutlined /> },
  escalated: { label: 'Escalated', color: 'red', icon: <WarningOutlined /> }
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

  // ==================== FETCH AUDIT LOGS ====================

  const fetchAuditLogs = useCallback(async () => {
    if (!incident?.id || !visible) return;

    setLoading(true);
    try {
      // Build filters for API
      const filters = {};
      if (filterAction !== 'all') filters.action = filterAction;
      if (filterUser !== 'all') filters.user_id = filterUser;
      if (dateRange && dateRange.length === 2) {
        filters.start_date = dateRange[0].toISOString();
        filters.end_date = dateRange[1].toISOString();
      }

      const response = await notificationService.getAuditTrail(incident.id, filters);

      const logsData = 
        response?.audit_logs || 
        response?.logs || 
        response?.data?.audit_logs || 
        (Array.isArray(response) ? response : []) || 
        [];

      setLogs(logsData);
    } catch (error) {
      console.error('Failed to fetch audit trail:', error);
      
      // Fall back to prop-supplied logs
      const incidentLogs = auditLogs.filter(log => 
        log.incidentId === incident.id || log.incident_id === incident.id
      );
      setLogs(incidentLogs);
    } finally {
      setLoading(false);
    }
  }, [incident?.id, visible, filterAction, filterUser, dateRange, auditLogs]);

  useEffect(() => {
    if (visible && incident?.id) {
      fetchAuditLogs();
    }
  }, [visible, incident?.id, fetchAuditLogs]);

  // ==================== FILTERS ====================

  const filteredLogs = logs.filter(log => {
    // If filters already applied on server, these client filters act as a second layer
    if (filterAction !== 'all' && (log.action !== filterAction)) return false;
    if (filterUser !== 'all' && (log.user_id !== filterUser && log.user?.id !== filterUser)) return false;
    
    if (dateRange && dateRange.length === 2) {
      const logDate = dayjs(log.created_at || log.timestamp);
      if (logDate.isBefore(dateRange[0]) || logDate.isAfter(dateRange[1])) return false;
    }
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        log.description?.toLowerCase().includes(searchLower) ||
        log.user_name?.toLowerCase().includes(searchLower) ||
        log.user?.name?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Get unique users for filter
  const uniqueUsers = [...new Map(
    logs.map(log => [
      log.user_id || log.user?.id, 
      {
        id: log.user_id || log.user?.id,
        name: log.user_name || log.user?.name || 'System',
        email: log.user_email || log.user?.email
      }
    ])
  ).values()].filter(u => u.id);

  // ==================== EXPORT ====================

  const handleExport = async () => {
    if (!incident?.id) return;

    try {
      // Try server-side export first
      const blob = await notificationService.exportAuditTrail(incident.id, 'csv');
      
      if (blob) {
        const url = URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-trail-${incident.incident_number || 'incident'}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success('Audit trail exported');
        return;
      }
    } catch (error) {
      console.warn('Server export failed, falling back to client-side export:', error);
    }

    // Fallback to client-side export
    const csvData = filteredLogs.map(log => ({
      'Timestamp': dayjs(log.created_at || log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      'Action': log.action,
      'User': log.user_name || log.user?.name,
      'Email': log.user_email || log.user?.email,
      'Description': log.description
    }));

    const headers = Object.keys(csvData[0] || { Timestamp: '', Action: '', User: '', Email: '', Description: '' });
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${incident?.incident_number || 'incident'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('Audit trail exported');
  };

  // ==================== RENDER TIMELINE ITEM ====================

  const renderTimelineItem = (log) => {
    const actionConfig = AUDIT_ACTIONS[log.action] || AUDIT_ACTIONS.viewed;
    const timestamp = log.created_at || log.timestamp;
    const userName = log.user_name || log.user?.name || 'System';
    const userEmail = log.user_email || log.user?.email;
    const description = log.description;
    
    // Extract change info
    const oldValues = log.old_values || {};
    const newValues = log.new_values || {};
    const hasChanges = Object.keys(oldValues).length > 0;

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
                  <Text strong>{userName}</Text>
                  {userEmail && <Text type="secondary">({userEmail})</Text>}
                </Space>
                {description && <Text>{description}</Text>}
                
                {hasChanges && (
                  <Space wrap>
                    {Object.entries(newValues).slice(0, 3).map(([key, value]) => (
                      <Tag key={key} color="blue">
                        {key}: {String(value).substring(0, 30)}
                      </Tag>
                    ))}
                  </Space>
                )}
              </Space>
            </Col>
            <Col>
              <Tooltip title={dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <ClockCircleOutlined /> {dayjs(timestamp).fromNow()}
                </Text>
              </Tooltip>
            </Col>
          </Row>
        </Card>
      </Timeline.Item>
    );
  };

  // ==================== MAIN RENDER ====================

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
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchAuditLogs}
              loading={loading}
            />
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
              allowClear
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
              {logs[0] 
                ? dayjs(logs[0].created_at || logs[0].timestamp).fromNow() 
                : 'N/A'
              }
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
          <Spin size="large" tip="Loading audit trail..." />
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
        width={700}
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
                  {selectedLog.user_name || selectedLog.user?.name || 'System'}
                  {(selectedLog.user_email || selectedLog.user?.email) && (
                    <Text type="secondary">
                      ({selectedLog.user_email || selectedLog.user?.email})
                    </Text>
                  )}
                </Space>
              </Descriptions.Item>
              {selectedLog.user_role && (
                <Descriptions.Item label="Role">
                  <Tag>{selectedLog.user_role}</Tag>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Timestamp">
                {dayjs(selectedLog.created_at || selectedLog.timestamp)
                  .format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              {selectedLog.description && (
                <Descriptions.Item label="Description">
                  {selectedLog.description}
                </Descriptions.Item>
              )}
              {selectedLog.ip_address && (
                <Descriptions.Item label="IP Address">
                  <Text code>{selectedLog.ip_address}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Changes */}
            {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
              <>
                <Divider orientation="left">Changes</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>Before:</Text>
                    <pre style={{ 
                      background: '#fff1f0', 
                      padding: 12, 
                      borderRadius: 4,
                      fontSize: 12,
                      overflow: 'auto',
                      maxHeight: 300
                    }}>
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </Col>
                  <Col span={12}>
                    <Text strong>After:</Text>
                    <pre style={{ 
                      background: '#f6ffed', 
                      padding: 12, 
                      borderRadius: 4,
                      fontSize: 12,
                      overflow: 'auto',
                      maxHeight: 300
                    }}>
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </Col>
                </Row>
              </>
            )}

            {/* Extra data */}
            {selectedLog.extra_data && Object.keys(selectedLog.extra_data).length > 0 && (
              <>
                <Divider orientation="left">Additional Data</Divider>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4,
                  fontSize: 12,
                  overflow: 'auto',
                  maxHeight: 300
                }}>
                  {JSON.stringify(selectedLog.extra_data, null, 2)}
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