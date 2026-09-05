// src/admin/UserManagement.js - Responsive with better layout
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Card, 
  message,
  Popconfirm,
  Tooltip,
  Alert,
  Row,
  Col
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  UserSwitchOutlined,
  SafetyOutlined,
  UserOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { getUsers, updateUser, deleteUser, updateUserRole, updateUserStatus } from '../services/adminService';

const { Option } = Select;
const { Search } = Input;

// ✅ EMPLOYEE ROLES - Based on dashboard access levels
const ROLES = [
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

// ✅ Dashboard access mapping
const DASHBOARD_ACCESS = {
  'administrator': 'admin_dashboard',
  'safety_manager': 'admin_dashboard',
  'operational_manager': 'admin_dashboard',
  'safety_officer': 'employee_dashboard',
  'environmental_officer': 'employee_dashboard',
  'qa_qc_officer': 'employee_dashboard',
  'employee': 'employee_dashboard',
  'intern': 'employee_dashboard',
  'contractor': 'employee_dashboard'
};

// ✅ Role level mapping for filtering
const ROLE_LEVELS = {
  'administrator': 'admin',
  'safety_manager': 'admin',
  'operational_manager': 'admin',
  'safety_officer': 'employee',
  'environmental_officer': 'employee',
  'qa_qc_officer': 'employee',
  'employee': 'employee',
  'intern': 'employee',
  'contractor': 'employee'
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  // ✅ Load users using adminService
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUsers();
      console.log('📊 UserManagement loadUsers response:', response);
      
      let usersData = [];
      if (response && response.success) {
        usersData = response.users || response.data || [];
      } else if (response && Array.isArray(response)) {
        usersData = response;
      } else if (response && response.users) {
        usersData = response.users;
      }
      
      console.log('📊 Setting users:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ Update user role using adminService
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const response = await updateUserRole(userId, newRole);
      if (response && response.success) {
        message.success(`User role updated to ${getRoleLabel(newRole)}`);
        await loadUsers();
      } else {
        message.error(response?.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      message.error('Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  // ✅ Update user status using adminService
  const handleStatusChange = async (userId, currentStatus) => {
    setUpdatingId(userId);
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await updateUserStatus(userId, newStatus === 'active');
      if (response && response.success) {
        message.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        await loadUsers();
      } else {
        message.error(response?.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  // ✅ Delete user using adminService
  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(userId);
      if (response && response.success) {
        message.success('User deleted successfully');
        await loadUsers();
      } else {
        message.error(response?.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  const getRoleLabel = (roleValue) => {
    const role = ROLES.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getRoleLevel = (roleValue) => {
    return ROLE_LEVELS[roleValue] || 'employee';
  };

  const getDashboardAccess = (roleValue) => {
    return DASHBOARD_ACCESS[roleValue] || 'employee_dashboard';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
      (roleFilter === 'admin' && getRoleLevel(user.role) === 'admin') ||
      (roleFilter === 'employee' && getRoleLevel(user.role) === 'employee') ||
      user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // ✅ Responsive columns with better sizing
  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <div>
            <div style={{ fontWeight: 500 }}>{text || 'N/A'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 200,
      render: (role, record) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record.id, value)}
          style={{ width: 180 }}
          disabled={updatingId === record.id}
        >
          {ROLES.map(role => (
            <Option key={role.value} value={role.value}>
              {role.level === 'admin' ? '👑 ' : '👤 '}
              {role.label}
              {role.level === 'admin' && ' (Admin)'}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Access Level',
      key: 'access_level',
      width: 130,
      render: (_, record) => {
        const level = getRoleLevel(record.role);
        return (
          <Tag color={level === 'admin' ? 'purple' : 'blue'}>
            {level === 'admin' ? 'Admin' : 'Employee'}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'status',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
      width: 150,
      render: (text) => text || 'N/A',
      ellipsis: true
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.is_active ? "Deactivate User" : "Activate User"}>
            <Button 
              type="link" 
              icon={<UserSwitchOutlined />}
              onClick={() => handleStatusChange(record.id, record.is_active ? 'active' : 'inactive')}
              disabled={updatingId === record.id}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={updatingId === record.id}
          >
            <Tooltip title="Delete User">
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                disabled={updatingId === record.id}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="user-management" style={{ padding: '0 8px' }}>
      <Card
        title={
          <Space>
            <span>User Management</span>
            <Tag color="blue">{filteredUsers.length} users</Tag>
          </Space>
        }
        extra={
          <Space wrap>
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 150 }}
              placeholder="Filter by role"
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">👑 Admin Roles</Option>
              <Option value="employee">👤 Employee Roles</Option>
              <Option value="safety_manager">Safety Manager</Option>
              <Option value="safety_officer">Safety Officer</Option>
              <Option value="operational_manager">Operational Manager</Option>
              <Option value="environmental_officer">Environmental Officer</Option>
              <Option value="qa_qc_officer">QA/QC Officer</Option>
            </Select>
            <Search
              placeholder="Search users..."
              allowClear
              style={{ width: 200 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Space>
        }
        bodyStyle={{ padding: '16px', overflow: 'auto' }}
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" type="primary" onClick={loadUsers}>
                Retry
              </Button>
            }
          />
        )}
        
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1000 }}
            size="middle"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} users`,
              pageSizeOptions: ['10', '20', '50']
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;