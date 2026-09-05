// src/admin/PermissionManager.js - Using adminService
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Switch, 
  Card, 
  Space, 
  Tag, 
  message, 
  Spin, 
  Alert,
  Row,
  Col,
  Typography,
  Divider
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  ReloadOutlined, 
  SaveOutlined,
  SafetyOutlined,
  TeamOutlined,
  LockOutlined
} from '@ant-design/icons';
import { getRoles, getPermissions, savePermissions } from '../services/adminService';

const { Title, Text } = Typography;

// ✅ Employee roles based on your system
const EMPLOYEE_ROLES = [
  { value: 'administrator', label: 'Administrator', level: 'admin' },
  { value: 'safety_manager', label: 'Safety Manager', level: 'admin' },
  { value: 'operational_manager', label: 'Operational Manager', level: 'admin' },
  { value: 'safety_officer', label: 'Safety Officer', level: 'employee' },
  { value: 'environmental_officer', label: 'Environmental Officer', level: 'employee' },
  { value: 'qa_qc_officer', label: 'QA/QC Officer', level: 'employee' },
  { value: 'employee', label: 'Employee', level: 'employee' },
  { value: 'intern', label: 'Intern', level: 'employee' },
  { value: 'contractor', label: 'Contractor', level: 'employee' }
];

// ✅ Permissions based on employee roles
const ALL_PERMISSIONS = [
  { 
    key: 'view_dashboard', 
    label: 'View Dashboard', 
    description: 'Access to view dashboard',
    defaultRoles: ['administrator', 'safety_manager', 'operational_manager', 'safety_officer', 'environmental_officer', 'qa_qc_officer', 'employee']
  },
  { 
    key: 'view_employees', 
    label: 'View Employees', 
    description: 'View employee list and details',
    defaultRoles: ['administrator', 'safety_manager', 'operational_manager']
  },
  { 
    key: 'edit_employees', 
    label: 'Edit Employees', 
    description: 'Create, edit, and delete employees',
    defaultRoles: ['administrator', 'safety_manager']
  },
  { 
    key: 'view_reports', 
    label: 'View Reports', 
    description: 'Access to view system reports',
    defaultRoles: ['administrator', 'safety_manager', 'operational_manager', 'safety_officer']
  },
  { 
    key: 'edit_reports', 
    label: 'Edit Reports', 
    description: 'Create and modify reports',
    defaultRoles: ['administrator', 'safety_manager']
  },
  { 
    key: 'manage_roles', 
    label: 'Manage Roles', 
    description: 'Assign and modify user roles',
    defaultRoles: ['administrator']
  },
  { 
    key: 'view_audit_logs', 
    label: 'View Audit Logs', 
    description: 'Access to view system audit logs',
    defaultRoles: ['administrator', 'safety_manager']
  },
  { 
    key: 'manage_settings', 
    label: 'Manage Settings', 
    description: 'Modify system settings',
    defaultRoles: ['administrator']
  },
  { 
    key: 'view_own_profile', 
    label: 'View Own Profile', 
    description: 'View own user profile',
    defaultRoles: ['administrator', 'safety_manager', 'operational_manager', 'safety_officer', 'environmental_officer', 'qa_qc_officer', 'employee', 'intern', 'contractor']
  },
  { 
    key: 'edit_own_profile', 
    label: 'Edit Own Profile', 
    description: 'Edit own user profile',
    defaultRoles: ['administrator', 'safety_manager', 'operational_manager', 'safety_officer', 'environmental_officer', 'qa_qc_officer', 'employee', 'intern', 'contractor']
  }
];

const PermissionManager = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPermissions = async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ Use adminService methods
      const [rolesRes, permsRes] = await Promise.all([
        getRoles().catch(() => ({ success: false })),
        getPermissions().catch(() => ({ success: false }))
      ]);
      
      // Set roles
      if (rolesRes && rolesRes.success) {
        setRoles(rolesRes.roles || rolesRes.data || []);
      } else {
        // Fallback to employee roles
        setRoles(EMPLOYEE_ROLES.map(r => r.value));
      }
      
      // Set permissions
      if (permsRes && permsRes.success) {
        setPermissions(permsRes.permissions || permsRes.data || {});
      } else {
        // Fallback permissions
        const defaultPerms = {};
        const roleValues = roles.length > 0 ? roles : EMPLOYEE_ROLES.map(r => r.value);
        roleValues.forEach(role => {
          defaultPerms[role] = ALL_PERMISSIONS
            .filter(p => p.defaultRoles.includes(role) || p.defaultRoles.includes('*'))
            .map(p => p.key);
        });
        setPermissions(defaultPerms);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setError('Failed to load permissions. Using default configuration.');
      
      // Set fallback data
      const roleValues = EMPLOYEE_ROLES.map(r => r.value);
      setRoles(roleValues);
      const defaultPerms = {};
      roleValues.forEach(role => {
        defaultPerms[role] = ALL_PERMISSIONS
          .filter(p => p.defaultRoles.includes(role) || p.defaultRoles.includes('*'))
          .map(p => p.key);
      });
      setPermissions(defaultPerms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const hasPermission = (role, permKey) => {
    return permissions[role] && permissions[role].includes(permKey);
  };

  const togglePermission = (role, permKey) => {
    setPermissions(prev => ({
      ...prev,
      [role]: prev[role].includes(permKey)
        ? prev[role].filter(p => p !== permKey)
        : [...prev[role], permKey]
    }));
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    setError('');
    try {
      // ✅ Use adminService savePermissions
      const response = await savePermissions(permissions);
      if (response && response.success) {
        message.success('Permissions saved successfully!');
      } else {
        message.error(response?.error || 'Failed to save permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      setError('Failed to save permissions. Please try again.');
      message.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const getRoleLevel = (roleValue) => {
    const role = EMPLOYEE_ROLES.find(r => r.value === roleValue);
    return role ? role.level : 'employee';
  };

  const getRoleLabel = (roleValue) => {
    const role = EMPLOYEE_ROLES.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const columns = [
    {
      title: 'Permission',
      dataIndex: 'label',
      key: 'label',
      width: 200,
      fixed: 'left',
      render: (label, record) => (
        <div>
          <div><strong>{label}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
        </div>
      )
    },
    ...roles.map(role => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <Tag color={getRoleLevel(role) === 'admin' ? 'purple' : 'blue'}>
            {getRoleLevel(role) === 'admin' ? '👑 ' : '👤 '}
            {getRoleLabel(role)}
          </Tag>
        </div>
      ),
      key: role,
      dataIndex: role,
      width: 100,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <Switch
            checked={hasPermission(role, record.key)}
            onChange={() => togglePermission(role, record.key)}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            disabled={role === 'administrator' && record.key === 'manage_roles'}
          />
        </div>
      )
    }))
  ];

  return (
    <Card
      title={
        <Space>
          <LockOutlined />
          <span>Role & Permission Management</span>
          <Tag color="purple">{roles.length} roles</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadPermissions}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSavePermissions}
            loading={saving}
          >
            Save Permissions
          </Button>
        </Space>
      }
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Legend */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col>
          <Tag color="purple">👑 Admin Roles</Tag>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Administrators, Safety Managers, Operational Managers
          </Text>
        </Col>
        <Col>
          <Tag color="blue">👤 Employee Roles</Tag>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Safety Officers, Environmental Officers, QA/QC Officers, Employees
          </Text>
        </Col>
      </Row>

      <Divider style={{ margin: '12px 0' }} />

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={ALL_PERMISSIONS}
          rowKey="key"
          pagination={false}
          size="middle"
          bordered
          scroll={{ x: 1200 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>Total Permissions</strong>
                </Table.Summary.Cell>
                {roles.map(role => {
                  const count = permissions[role] ? permissions[role].length : 0;
                  const total = ALL_PERMISSIONS.length;
                  return (
                    <Table.Summary.Cell key={role} index={roles.indexOf(role) + 1}>
                      <div style={{ textAlign: 'center' }}>
                        <Tag color={count === total ? 'green' : count > total/2 ? 'orange' : 'red'}>
                          {count}/{total}
                        </Tag>
                      </div>
                    </Table.Summary.Cell>
                  );
                })}
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Spin>
    </Card>
  );
};

export default PermissionManager;