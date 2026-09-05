// src/admin/EmployeeManagement.js - Complete with validation
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Card, 
  Space, 
  Tag,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  DatePicker,
  Avatar,
  Divider,
  Statistic,
  Badge,
  InputNumber,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  PhoneOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../services/adminService';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const [customPosition, setCustomPosition] = useState('');
  const [isCustomPosition, setIsCustomPosition] = useState(false);

  // Departments configuration with their typical roles
  const departmentConfig = {
    'Medical': {
      roles: ['Doctor', 'Nurse', 'Medical Officer', 'First Aid Responder', 'Health Coordinator', 'Medical Assistant', 'Lab Technician', 'Radiology Technician', 'Pharmacist', 'Medical Records Clerk'],
      icon: '🏥'
    },
    'Safety': {
      roles: ['Safety Officer', 'Safety Manager', 'Safety Director', 'Safety Coordinator', 'Safety Inspector', 'Safety Trainer', 'Safety Engineer', 'HSE Specialist'],
      icon: '🛡️'
    },
    'Operations': {
      roles: ['Operator', 'Operations Manager', 'Team Lead', 'Supervisor', 'Project Manager', 'Site Supervisor', 'Field Technician', 'Production Manager', 'Plant Manager'],
      icon: '⚙️'
    },
    'HR': {
      roles: ['HR Manager', 'HR Specialist', 'Recruiter', 'Training Coordinator', 'Employee Relations', 'HR Assistant', 'Payroll Specialist', 'Benefits Administrator'],
      icon: '👤'
    },
    'Quality Control': {
      roles: ['QA/QC Officer', 'Quality Manager', 'Quality Inspector', 'Quality Assurance', 'Quality Control', 'Document Controller', 'Quality Engineer'],
      icon: '✅'
    },
    'Environmental': {
      roles: ['Environmental Officer', 'Environmental Manager', 'Compliance Officer', 'Environmental Specialist', 'Sustainability Manager', 'Waste Management Officer', 'Ecologist'],
      icon: '🌿'
    },
    'Administration': {
      roles: ['Admin Assistant', 'Office Manager', 'Executive Assistant', 'Administrative Assistant', 'Receptionist', 'Secretary', 'Office Administrator', 'Office Manager'],
      icon: '📋'
    },
    'IT': {
      roles: ['IT Support', 'System Administrator', 'IT Manager', 'IT Technician', 'Network Administrator', 'Software Developer', 'Database Administrator', 'Cybersecurity Specialist'],
      icon: '💻'
    },
    'Maintenance': {
      roles: ['Maintenance Technician', 'Maintenance Supervisor', 'Facility Manager', 'Maintenance Planner', 'Maintenance Manager', 'Reliability Engineer', 'Asset Manager'],
      icon: '🔧'
    },
    'Finance': {
      roles: ['Finance Officer', 'Accountant', 'Payroll Specialist', 'Budget Analyst', 'Financial Controller', 'Accounts Payable', 'Accounts Receivable', 'Auditor'],
      icon: '💰'
    },
    'Logistics': {
      roles: ['Logistics Coordinator', 'Warehouse Manager', 'Fleet Manager', 'Driver', 'Supply Chain Manager', 'Procurement Officer', 'Inventory Controller'],
      icon: '🚚'
    },
    'Engineering': {
      roles: ['Engineer', 'Senior Engineer', 'Engineering Manager', 'Process Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Design Engineer'],
      icon: '🔬'
    }
  };

  // All positions combined for search
  const allPositions = [
    ...new Set(Object.values(departmentConfig).flatMap(d => d.roles))
  ].sort();

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Intern'];

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchText, statusFilter, departmentFilter, dateRange]);

  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEmployees();
      console.log('Employees response:', response);
      
      if (response && response.success) {
        const employeesData = response.data || [];
        const formattedEmployees = employeesData.map(emp => ({
          ...emp,
          name: emp.name || 'Unknown',
          email: emp.email || 'No email',
          employeeId: emp.employeeId || `EMP${emp.id}`,
          department: emp.department || 'General',
          position: emp.position || emp.role || 'Employee',
          status: emp.status || (emp.is_active ? 'active' : 'inactive'),
          employmentType: emp.employmentType || 'Full-time',
          phone: emp.phone || 'N/A',
          hireDate: emp.hireDate || emp.created_at
        }));
        setEmployees(formattedEmployees);
      } else {
        setError(response?.error || 'Failed to load employees');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('Failed to load employees. Please try again.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchText) {
      filtered = filtered.filter(emp =>
        (emp.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (emp.employeeId || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (emp.department || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(emp => {
        const empDate = dayjs(emp.hireDate || emp.created_at);
        return empDate.isAfter(start) && empDate.isBefore(end);
      });
    }

    setFilteredEmployees(filtered);
  };

  const handleAddEmployee = async (values) => {
    setLoading(true);
    try {
      // If custom position was entered, use it
      if (isCustomPosition && customPosition) {
        values.position = customPosition;
      }
      
      const response = await addEmployee(values);
      if (response && response.success) {
        message.success('Employee added successfully!');
        setModalVisible(false);
        form.resetFields();
        setCustomPosition('');
        setIsCustomPosition(false);
        await loadEmployees();
      } else {
        message.error(response?.error || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      message.error('Failed to add employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async (values) => {
    setLoading(true);
    try {
      // If custom position was entered, use it
      if (isCustomPosition && customPosition) {
        values.position = customPosition;
      }
      
      const response = await updateEmployee(editingEmployee.id, values);
      if (response && response.success) {
        message.success('Employee updated successfully!');
        setModalVisible(false);
        setEditingEmployee(null);
        form.resetFields();
        setCustomPosition('');
        setIsCustomPosition(false);
        await loadEmployees();
      } else {
        message.error(response?.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      message.error('Failed to update employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    setLoading(true);
    try {
      const response = await deleteEmployee(employeeId);
      if (response && response.success) {
        message.success('Employee deleted successfully!');
        await loadEmployees();
      } else {
        message.error(response?.error || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      message.error('Failed to delete employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingEmployee(null);
    setModalVisible(true);
    form.resetFields();
    setCustomPosition('');
    setIsCustomPosition(false);
    form.setFieldsValue({
      status: 'active',
      employmentType: 'Full-time'
    });
  };

  const showEditModal = (employee) => {
    setEditingEmployee(employee);
    setModalVisible(true);
    setCustomPosition('');
    setIsCustomPosition(false);
    form.setFieldsValue({
      ...employee,
      hireDate: employee.hireDate ? dayjs(employee.hireDate) : null,
      status: employee.status || 'active',
      employmentType: employee.employmentType || 'Full-time'
    });
  };

  const showViewModal = (employee) => {
    setViewingEmployee(employee);
    setViewModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingEmployee(null);
    form.resetFields();
    setCustomPosition('');
    setIsCustomPosition(false);
  };

  const handleViewModalCancel = () => {
    setViewModalVisible(false);
    setViewingEmployee(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      inactive: 'red',
      suspended: 'orange',
      pending: 'blue'
    };
    return colors[status] || 'default';
  };

  // Get roles for selected department
  const getRolesForDepartment = (department) => {
    if (!department) return [];
    return departmentConfig[department]?.roles || [];
  };

  // Handle department change - update position suggestions
  const handleDepartmentChange = (value) => {
    setIsCustomPosition(false);
    setCustomPosition('');
    form.setFieldsValue({ position: undefined });
  };

  // Handle position change
  const handlePositionChange = (value) => {
    if (value === 'custom') {
      setIsCustomPosition(true);
      form.setFieldsValue({ position: undefined });
    } else {
      setIsCustomPosition(false);
      setCustomPosition('');
      form.setFieldsValue({ position: value });
    }
  };

  // Validate position based on department
  const validatePosition = (rule, value) => {
    const department = form.getFieldValue('department');
    if (!department) {
      return Promise.reject('Please select a department first');
    }
    
    const validRoles = getRolesForDepartment(department);
    
    // If custom position is entered, validate it
    if (isCustomPosition && customPosition) {
      if (customPosition.trim().length < 2) {
        return Promise.reject('Position must be at least 2 characters');
      }
      return Promise.resolve();
    }
    
    if (!value) {
      return Promise.reject('Please select or enter a position');
    }
    
    // Check if position is valid for the department
    if (validRoles.length > 0 && !validRoles.includes(value) && value !== 'custom') {
      return Promise.reject(`"${value}" is not a standard position for ${department}. Please select from the list or enter a custom position.`);
    }
    
    return Promise.resolve();
  };

  const getDepartmentIcon = (department) => {
    return departmentConfig[department]?.icon || '📌';
  };

  const getPositionValidation = () => {
    const department = form.getFieldValue('department');
    if (department) {
      const roles = getRolesForDepartment(department);
      if (roles.length > 0) {
        return `Standard positions for ${department}: ${roles.join(', ')}`;
      }
    }
    return 'Select from the list or type a custom position';
  };

  // Statistics
  const stats = {
    total: filteredEmployees.length,
    active: filteredEmployees.filter(emp => emp.status === 'active').length,
    newThisMonth: filteredEmployees.filter(emp => {
      const hireDate = dayjs(emp.hireDate || emp.created_at);
      return hireDate.isAfter(dayjs().startOf('month'));
    }).length
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 160,
      render: (text, record) => (
        <Space size={4}>
          <Avatar size="small" icon={<UserOutlined />} src={record.avatar} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 500, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {text || 'Unknown'}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {record.employeeId || 'No ID'}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (email) => (
        <Tooltip title={email || 'No email'}>
          <span style={{ 
            display: 'block', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            maxWidth: '160px'
          }}>
            <MailOutlined style={{ marginRight: 4, color: '#888' }} />
            {email || 'N/A'}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          <PhoneOutlined style={{ marginRight: 4, color: '#888' }} />
          {phone && phone !== 'N/A' ? phone : '—'}
        </span>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      filters: Object.keys(departmentConfig).map(dept => ({ text: dept, value: dept })),
      onFilter: (value, record) => record.department === value,
      render: (department) => (
        <Tag color="blue" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {departmentConfig[department]?.icon || '📌'} {department || 'General'}
        </Tag>
      )
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      width: 150,
      render: (position) => (
        <span style={{ 
          display: 'block', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          maxWidth: '140px'
        }}>
          {position || 'Employee'}
        </span>
      )
    },
    {
      title: 'Type',
      dataIndex: 'employmentType',
      key: 'employmentType',
      width: 100,
      render: (type) => (
        <Tag color="cyan" style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {type || 'Full-time'}
        </Tag>
      )
    },
    {
      title: 'Hire Date',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 110,
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A',
      sorter: (a, b) => dayjs(a.hireDate || 0).unix() - dayjs(b.hireDate || 0).unix()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' },
        { text: 'Pending', value: 'pending' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={(status || 'active').toUpperCase()}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="View Details">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => showViewModal(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit Employee">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => showEditModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this employee?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteEmployee(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Tooltip title="Delete Employee">
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="employee-management" style={{ padding: '0 4px' }}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Total Employees"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Active Employees"
              value={stats.active}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="New This Month"
              value={stats.newThisMonth}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card
        title={
          <Space size={8}>
            <TeamOutlined />
            <span>Employee Management</span>
            <Tag color="blue">{filteredEmployees.length} employees</Tag>
          </Space>
        }
        extra={
          <Space size={8} wrap>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadEmployees}
              loading={loading}
              size="small"
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={showAddModal}
              size="small"
            >
              Add Employee
            </Button>
          </Space>
        }
        size="small"
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 12 }}
            action={
              <Button size="small" type="primary" onClick={loadEmployees}>
                Retry
              </Button>
            }
          />
        )}

        {/* Filters */}
        <div style={{ marginBottom: 12 }}>
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} sm={8}>
              <Search
                placeholder="Search employees..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                size="small"
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                placeholder="Status"
                size="small"
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="suspended">Suspended</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Select
                value={departmentFilter}
                onChange={setDepartmentFilter}
                style={{ width: '100%' }}
                placeholder="Department"
                size="small"
              >
                <Option value="all">All Departments</Option>
                {Object.keys(departmentConfig).map(dept => (
                  <Option key={dept} value={dept}>{dept}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
                placeholder={['Start Date', 'End Date']}
                size="small"
              />
            </Col>
          </Row>
        </div>

        {/* Employees Table */}
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={filteredEmployees}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1100 }}
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} employees`,
              pageSizeOptions: ['10', '20', '50'],
              size: 'small'
            }}
          />
        </div>
      </Card>

      {/* ✅ UPDATED: Add/Edit Employee Modal with Department-based position validation */}
      <Modal
        title={
          <Space>
            {editingEmployee ? <EditOutlined /> : <PlusOutlined />}
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </Space>
        }
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Alert
          message="Position Selection"
          description="Select a position from the list for your department, or choose 'Custom' to enter a custom position."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={editingEmployee ? handleEditEmployee : handleAddEmployee}
          initialValues={{ status: 'active', employmentType: 'Full-time' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please enter employee name' },
                  { min: 2, message: 'Name must be at least 2 characters' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="Enter employee full name" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="employeeId"
                label="Employee ID"
                rules={[
                  { required: true, message: 'Please enter employee ID' }
                ]}
              >
                <Input 
                  prefix={<IdcardOutlined />}
                  placeholder="EMP-001" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  placeholder="employee@company.com" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input 
                  prefix={<PhoneOutlined />}
                  placeholder="+1 (555) 123-4567" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please select a department' }]}
              >
                <Select 
                  placeholder="Select department"
                  onChange={handleDepartmentChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {Object.keys(departmentConfig).map(dept => (
                    <Option key={dept} value={dept}>
                      {departmentConfig[dept].icon} {dept}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[
                  { required: true, message: 'Please select or enter a position' },
                  { validator: validatePosition }
                ]}
                extra={getPositionValidation()}
              >
                <Select
                  placeholder="Search or select position"
                  showSearch
                  optionFilterProp="children"
                  onChange={handlePositionChange}
                  allowClear
                >
                  {form.getFieldValue('department') && (
                    <Option value="custom">✏️ Custom Position...</Option>
                  )}
                  {getRolesForDepartment(form.getFieldValue('department')).map(pos => (
                    <Option key={pos} value={pos}>{pos}</Option>
                  ))}
                </Select>
              </Form.Item>
              {isCustomPosition && (
                <Form.Item
                  name="customPosition"
                  label="Enter Custom Position"
                  rules={[
                    { required: true, message: 'Please enter a custom position' },
                    { min: 2, message: 'Position must be at least 2 characters' }
                  ]}
                  style={{ marginTop: -8 }}
                >
                  <Input 
                    placeholder="Enter custom position"
                    onChange={(e) => setCustomPosition(e.target.value)}
                    prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                  />
                </Form.Item>
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employmentType"
                label="Employment Type"
                rules={[{ required: true, message: 'Please select employment type' }]}
              >
                <Select placeholder="Select employment type">
                  {employmentTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hireDate"
                label="Hire Date"
                rules={[{ required: true, message: 'Please select hire date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="MMM DD, YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salary"
                label="Salary (Optional)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Annual salary"
                  min={0}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                initialValue="active"
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="suspended">Suspended</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes (Optional)"
          >
            <Input.TextArea 
              rows={3}
              placeholder="Additional notes or comments..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        title="Employee Details"
        open={viewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            handleViewModalCancel();
            showEditModal(viewingEmployee);
          }}>
            Edit Employee
          </Button>,
          <Button key="close" onClick={handleViewModalCancel}>
            Close
          </Button>
        ]}
        width={500}
      >
        {viewingEmployee && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={80} icon={<UserOutlined />} src={viewingEmployee.avatar} />
              <h3 style={{ marginTop: 16, marginBottom: 4 }}>{viewingEmployee.name}</h3>
              <p style={{ color: '#666', margin: 0 }}>{viewingEmployee.employeeId}</p>
              <Tag color={getStatusColor(viewingEmployee.status)} style={{ marginTop: 8 }}>
                {viewingEmployee.status.toUpperCase()}
              </Tag>
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Email:</strong>
                <br />
                {viewingEmployee.email}
              </Col>
              <Col span={12}>
                <strong>Phone:</strong>
                <br />
                {viewingEmployee.phone || 'N/A'}
              </Col>
              <Col span={12}>
                <strong>Department:</strong>
                <br />
                {departmentConfig[viewingEmployee.department]?.icon || '📌'} {viewingEmployee.department}
              </Col>
              <Col span={12}>
                <strong>Position:</strong>
                <br />
                {viewingEmployee.position}
              </Col>
              <Col span={12}>
                <strong>Employment Type:</strong>
                <br />
                {viewingEmployee.employmentType}
              </Col>
              <Col span={12}>
                <strong>Hire Date:</strong>
                <br />
                {viewingEmployee.hireDate ? dayjs(viewingEmployee.hireDate).format('MMM DD, YYYY') : 'N/A'}
              </Col>
              {viewingEmployee.salary && (
                <Col span={12}>
                  <strong>Salary:</strong>
                  <br />
                  ${viewingEmployee.salary.toLocaleString()}
                </Col>
              )}
              {viewingEmployee.notes && (
                <Col span={24}>
                  <strong>Notes:</strong>
                  <br />
                  {viewingEmployee.notes}
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeManagement;