// src/pages/Modules/SupplyChainManagement.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Timeline,
  Alert,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  List,
  Avatar,
  Badge,
  Tabs,
  Space,
  Tooltip,
  Popconfirm,
  message,
  Divider,
  Upload,
  DatePicker,
  Steps
} from 'antd';
import {
  TruckOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LineChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FilterOutlined,
  SearchOutlined,
  DownloadOutlined,
  DollarOutlined,
  ContainerOutlined,
  ShopOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;

// Enhanced mock data with real supply chain management features
const mockSuppliers = [
  {
    id: 1,
    name: 'MedEquip Corporation',
    contact: 'John Smith',
    email: 'john.smith@medequip.com',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Drive, Healthcare City, HC 12345',
    rating: 'A+',
    deliveryScore: 98,
    compliance: 95,
    status: 'active',
    category: 'medical_equipment',
    contractExpiry: '2024-12-31',
    performance: {
      onTimeDelivery: 98,
      qualityScore: 96,
      costEffectiveness: 92
    },
    products: ['Ventilators', 'Patient Monitors', 'ICU Equipment']
  },
  {
    id: 2,
    name: 'SafeSupplies Ltd',
    contact: 'Maria Garcia',
    email: 'maria.garcia@safesupplies.com',
    phone: '+1 (555) 987-6543',
    address: '456 Safety Avenue, Industrial Park, IP 67890',
    rating: 'A',
    deliveryScore: 92,
    compliance: 88,
    status: 'active',
    category: 'safety_equipment',
    contractExpiry: '2024-10-15',
    performance: {
      onTimeDelivery: 92,
      qualityScore: 90,
      costEffectiveness: 85
    },
    products: ['PPE Kits', 'Safety Gloves', 'Protective Gowns']
  },
  {
    id: 3,
    name: 'HealthTech Innovations',
    contact: 'Robert Chen',
    email: 'robert.chen@healthtech.com',
    phone: '+1 (555) 456-7890',
    address: '789 Tech Boulevard, Innovation Center, IC 11223',
    rating: 'B+',
    deliveryScore: 85,
    compliance: 82,
    status: 'under_review',
    category: 'technology',
    contractExpiry: '2024-08-20',
    performance: {
      onTimeDelivery: 85,
      qualityScore: 88,
      costEffectiveness: 78
    },
    products: ['Medical Software', 'Diagnostic Equipment', 'Telemedicine']
  },
  {
    id: 4,
    name: 'BioMedical Supplies Inc',
    contact: 'Lisa Wang',
    email: 'lisa.wang@biomedical.com',
    phone: '+1 (555) 321-0987',
    address: '321 Bio Park, Research District, RD 44556',
    rating: 'A',
    deliveryScore: 94,
    compliance: 90,
    status: 'active',
    category: 'consumables',
    contractExpiry: '2024-11-30',
    performance: {
      onTimeDelivery: 94,
      qualityScore: 92,
      costEffectiveness: 88
    },
    products: ['Medical Consumables', 'Lab Supplies', 'Disinfectants']
  }
];

const mockInventory = [
  {
    id: 1,
    product: 'N95 Masks',
    sku: 'MSK-N95-001',
    category: 'ppe',
    currentStock: 2450,
    minStock: 1000,
    maxStock: 5000,
    reorderPoint: 1200,
    status: 'adequate',
    unitCost: 2.50,
    totalValue: 6125,
    supplier: 'SafeSupplies Ltd',
    lastRestocked: '2024-01-15',
    nextRestock: '2024-02-01'
  },
  {
    id: 2,
    product: 'Safety Gloves (Latex)',
    sku: 'GLV-LTX-002',
    category: 'ppe',
    currentStock: 850,
    minStock: 500,
    maxStock: 2000,
    reorderPoint: 600,
    status: 'low',
    unitCost: 0.75,
    totalValue: 637.50,
    supplier: 'SafeSupplies Ltd',
    lastRestocked: '2024-01-10',
    nextRestock: '2024-01-25'
  },
  {
    id: 3,
    product: 'Disinfectant Solution',
    sku: 'DIS-SOL-003',
    category: 'cleaning',
    currentStock: 3200,
    minStock: 800,
    maxStock: 4000,
    reorderPoint: 1000,
    status: 'adequate',
    unitCost: 8.50,
    totalValue: 27200,
    supplier: 'BioMedical Supplies Inc',
    lastRestocked: '2024-01-12',
    nextRestock: '2024-02-10'
  },
  {
    id: 4,
    product: 'Protective Gowns',
    sku: 'GWN-PRO-004',
    category: 'ppe',
    currentStock: 420,
    minStock: 300,
    maxStock: 1000,
    reorderPoint: 400,
    status: 'critical',
    unitCost: 12.00,
    totalValue: 5040,
    supplier: 'SafeSupplies Ltd',
    lastRestocked: '2024-01-05',
    nextRestock: '2024-01-20'
  },
  {
    id: 5,
    product: 'Ventilator Filters',
    sku: 'FLT-VNT-005',
    category: 'medical_equipment',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    reorderPoint: 80,
    status: 'adequate',
    unitCost: 45.00,
    totalValue: 6750,
    supplier: 'MedEquip Corporation',
    lastRestocked: '2024-01-08',
    nextRestock: '2024-02-15'
  }
];

const mockPurchaseOrders = [
  {
    id: 'PO-001',
    supplier: 'MedEquip Corporation',
    product: 'Ventilator Parts',
    quantity: 5,
    unitPrice: 1200.00,
    totalAmount: 6000.00,
    orderDate: '2024-01-10',
    expectedDate: '2024-01-20',
    status: 'in_transit',
    priority: 'high',
    trackingNumber: 'TRK-789456123',
    notes: 'Critical components for ICU maintenance'
  },
  {
    id: 'PO-002',
    supplier: 'SafeSupplies Ltd',
    product: 'Safety Equipment Kit',
    quantity: 100,
    unitPrice: 85.50,
    totalAmount: 8550.00,
    orderDate: '2024-01-12',
    expectedDate: '2024-01-18',
    status: 'processing',
    priority: 'medium',
    trackingNumber: null,
    notes: 'Standard safety equipment restock'
  },
  {
    id: 'PO-003',
    supplier: 'BioMedical Supplies Inc',
    product: 'Medical Consumables',
    quantity: 500,
    unitPrice: 4.25,
    totalAmount: 2125.00,
    orderDate: '2024-01-08',
    expectedDate: '2024-01-15',
    status: 'delayed',
    priority: 'medium',
    trackingNumber: 'TRK-321654987',
    notes: 'Delayed due to supplier inventory issues'
  },
  {
    id: 'PO-004',
    supplier: 'HealthTech Innovations',
    product: 'Diagnostic Software License',
    quantity: 1,
    unitPrice: 15000.00,
    totalAmount: 15000.00,
    orderDate: '2024-01-14',
    expectedDate: '2024-01-16',
    status: 'delivered',
    priority: 'high',
    trackingNumber: 'DIG-789123456',
    notes: 'Annual license renewal for diagnostic software'
  }
];

const mockShipments = [
  {
    id: 'SH-001',
    purchaseOrder: 'PO-001',
    supplier: 'MedEquip Corporation',
    carrier: 'FedEx',
    trackingNumber: 'TRK-789456123',
    status: 'in_transit',
    shippedDate: '2024-01-15',
    estimatedDelivery: '2024-01-20',
    currentLocation: 'Distribution Center - Chicago',
    items: ['Ventilator Motor', 'Control Panel', 'Sensors'],
    weight: 45.5,
    cost: 250.00
  },
  {
    id: 'SH-002',
    purchaseOrder: 'PO-003',
    supplier: 'BioMedical Supplies Inc',
    carrier: 'UPS',
    trackingNumber: 'TRK-321654987',
    status: 'delayed',
    shippedDate: '2024-01-10',
    estimatedDelivery: '2024-01-17',
    currentLocation: 'Warehouse - St. Louis',
    items: ['Syringes', 'Bandages', 'Disinfectants'],
    weight: 120.0,
    cost: 180.00
  },
  {
    id: 'SH-003',
    purchaseOrder: 'PO-004',
    supplier: 'HealthTech Innovations',
    carrier: 'Digital Delivery',
    trackingNumber: 'DIG-789123456',
    status: 'delivered',
    shippedDate: '2024-01-14',
    estimatedDelivery: '2024-01-16',
    currentLocation: 'Delivered',
    items: ['Software License Key', 'Documentation'],
    weight: 0,
    cost: 0
  }
];

const mockSupplyChainAnalytics = {
  onTimeDelivery: 94,
  inventoryTurnover: 6.2,
  supplierCompliance: 88,
  stockoutRate: 2.1,
  carryingCost: 125000,
  orderAccuracy: 97.5
};

function SupplyChainManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setInventory(mockInventory);
      setPurchaseOrders(mockPurchaseOrders);
      setShipments(mockShipments);
      setAnalytics(mockSupplyChainAnalytics);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'under_review': return 'orange';
      case 'suspended': return 'red';
      case 'adequate': return 'green';
      case 'low': return 'orange';
      case 'critical': return 'red';
      case 'in_transit': return 'blue';
      case 'processing': return 'orange';
      case 'delayed': return 'red';
      case 'delivered': return 'green';
      default: return 'blue';
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'A+': return 'green';
      case 'A': return 'blue';
      case 'B+': return 'orange';
      case 'B': return 'yellow';
      case 'C': return 'red';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#cf1322';
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'medical_equipment': return 'blue';
      case 'safety_equipment': return 'green';
      case 'technology': return 'purple';
      case 'consumables': return 'orange';
      case 'ppe': return 'red';
      case 'cleaning': return 'cyan';
      default: return 'default';
    }
  };

  const handleAddSupplier = () => {
    setSelectedItem(null);
    setModalVisible(true);
  };

  const handleCreateOrder = () => {
    setSelectedItem(null);
    setModalVisible(true);
  };

  const handleAddInventory = () => {
    setSelectedItem(null);
    setModalVisible(true);
  };

  // Supplier Management Columns
  const supplierColumns = [
    {
      title: 'Supplier',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Contact: {record.contact}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.email}
          </div>
        </Space>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Tag color={getRatingColor(rating)}>
          {rating}
        </Tag>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_, record) => (
        <div>
          <div>Delivery: {record.deliveryScore}%</div>
          <Progress 
            percent={record.deliveryScore} 
            size="small" 
            strokeColor={record.deliveryScore >= 90 ? '#52c41a' : record.deliveryScore >= 80 ? '#faad14' : '#ff4d4f'}
          />
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Contract Expiry',
      dataIndex: 'contractExpiry',
      key: 'contractExpiry',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => setSelectedItem(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => setSelectedItem(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Inventory Management Columns
  const inventoryColumns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            SKU: {record.sku}
          </div>
        </Space>
      ),
    },
    {
      title: 'Stock Level',
      key: 'stockLevel',
      render: (record) => {
        const percent = Math.min(100, (record.currentStock / record.maxStock) * 100);
        let status = 'normal';
        if (record.status === 'critical') status = 'exception';
        else if (record.status === 'low') status = 'active';
        
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              {record.currentStock} / {record.maxStock}
            </div>
            <Progress 
              percent={percent} 
              status={status}
              size="small"
              strokeColor={
                record.status === 'critical' ? '#ff4d4f' :
                record.status === 'low' ? '#faad14' : '#52c41a'
              }
            />
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Next Restock',
      dataIndex: 'nextRestock',
      key: 'nextRestock',
      render: (date) => moment(date).format('MMM DD'),
    },
  ];

  // Purchase Orders Columns
  const purchaseOrderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Expected Date',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
  ];

  // Shipments Columns
  const shipmentColumns = [
    {
      title: 'Shipment ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Purchase Order',
      dataIndex: 'purchaseOrder',
      key: 'purchaseOrder',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Carrier',
      dataIndex: 'carrier',
      key: 'carrier',
    },
    {
      title: 'Tracking',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (tracking) => tracking || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Estimated Delivery',
      dataIndex: 'estimatedDelivery',
      key: 'estimatedDelivery',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Current Location',
      dataIndex: 'currentLocation',
      key: 'currentLocation',
    },
  ];

  return (
    <div className="supplychain-management-page">
      {/* Header */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <TruckOutlined />
            </div>
            <div>
              <h1>Supply Chain Management System</h1>
              <p>Supplier management, inventory control, purchase orders, and logistics tracking</p>
            </div>
          </div>
          <div className="header-actions">
            <Space>
              <Button icon={<DownloadOutlined />}>Export Reports</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateOrder}
              >
                Create Purchase Order
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="On-Time Delivery"
              value={analytics.onTimeDelivery}
              suffix="%"
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Inventory Turnover"
              value={analytics.inventoryTurnover}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Supplier Compliance"
              value={analytics.supplierCompliance}
              suffix="%"
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Suppliers"
              value={suppliers.filter(s => s.status === 'active').length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs with Real Supply Chain Management Features */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        className="management-tabs"
      >
        {/* Overview Tab */}
        <TabPane 
          tab={
            <span>
              <DashboardOutlined />
              Supply Chain Overview
            </span>
          } 
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title="🏭 Supplier Performance"
                extra={
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />}
                    onClick={handleAddSupplier}
                  >
                    Add Supplier
                  </Button>
                }
              >
                <Table
                  columns={supplierColumns}
                  dataSource={suppliers.slice(0, 5)}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="📦 Critical Inventory Alerts">
                <List
                  dataSource={inventory.filter(item => item.status === 'critical' || item.status === 'low')}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button type="link">Reorder</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<WarningOutlined />}
                            style={{ backgroundColor: getStatusColor(item.status) }}
                          />
                        }
                        title={item.product}
                        description={
                          <Space direction="vertical" size={0}>
                            <div>Current Stock: {item.currentStock} units</div>
                            <div>Reorder Point: {item.reorderPoint} units</div>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              Supplier: {item.supplier}
                            </div>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="📊 Supply Chain Analytics">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress 
                        type="circle" 
                        percent={analytics.onTimeDelivery} 
                        strokeColor={analytics.onTimeDelivery >= 90 ? '#52c41a' : '#faad14'}
                      />
                      <div style={{ marginTop: 8 }}>On-Time Delivery</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress 
                        type="circle" 
                        percent={analytics.orderAccuracy} 
                        strokeColor={analytics.orderAccuracy >= 95 ? '#52c41a' : '#faad14'}
                      />
                      <div style={{ marginTop: 8 }}>Order Accuracy</div>
                    </div>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic title="Inventory Turnover" value={analytics.inventoryTurnover} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Stockout Rate" value={analytics.stockoutRate} suffix="%" />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Carrying Cost" value={analytics.carryingCost} prefix="$" />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="⚡ Quick Actions">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<FileTextOutlined />}
                    block
                    style={{ textAlign: 'left' }}
                    onClick={handleCreateOrder}
                  >
                    Create Purchase Order
                  </Button>
                  <Button 
                    icon={<ShoppingOutlined />}
                    block
                    style={{ textAlign: 'left' }}
                    onClick={handleAddInventory}
                  >
                    Add Inventory Item
                  </Button>
                  <Button 
                    icon={<TruckOutlined />}
                    block
                    style={{ textAlign: 'left' }}
                  >
                    Track Shipment
                  </Button>
                  <Button 
                    icon={<LineChartOutlined />}
                    block
                    style={{ textAlign: 'left' }}
                  >
                    View Supply Chain Analytics
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Suppliers Tab */}
        <TabPane 
          tab={
            <span>
              <ShopOutlined />
              Suppliers
              <Badge count={suppliers.length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="suppliers"
        >
          <Card
            title="🏭 Supplier Management"
            extra={
              <Space>
                <Input
                  placeholder="Search suppliers..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                />
                <Button icon={<FilterOutlined />}>Filters</Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddSupplier}
                >
                  Add Supplier
                </Button>
              </Space>
            }
          >
            <Table
              columns={supplierColumns}
              dataSource={suppliers.filter(supplier => 
                supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
                supplier.contact.toLowerCase().includes(searchText.toLowerCase())
              )}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Card>
        </TabPane>

        {/* Inventory Tab */}
        <TabPane 
          tab={
            <span>
              <ShoppingOutlined />
              Inventory
              <Badge count={inventory.filter(i => i.status === 'critical').length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="inventory"
        >
          <Card 
            title="📦 Inventory Management"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddInventory}>
                Add Inventory
              </Button>
            }
          >
            <Table
              columns={inventoryColumns}
              dataSource={inventory}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Purchase Orders Tab */}
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Purchase Orders
              <Badge count={purchaseOrders.filter(po => po.status !== 'delivered').length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="orders"
        >
          <Card 
            title="📋 Purchase Orders"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOrder}>
                Create PO
              </Button>
            }
          >
            <Table
              columns={purchaseOrderColumns}
              dataSource={purchaseOrders}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Shipments Tab */}
        <TabPane 
          tab={
            <span>
              <TruckOutlined />
              Shipments
              <Badge count={shipments.filter(s => s.status !== 'delivered').length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="shipments"
        >
          <Card 
            title="🚚 Shipment Tracking"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                New Shipment
              </Button>
            }
          >
            <Table
              columns={shipmentColumns}
              dataSource={shipments}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Supplier Detail Modal */}
      <Modal
        title={selectedItem ? 'Supplier Details' : 'Add New Supplier'}
        open={!!selectedItem || modalVisible}
        onCancel={() => {
          setSelectedItem(null);
          setModalVisible(false);
        }}
        footer={null}
        width={800}
      >
        {selectedItem ? (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Supplier Name:</strong> {selectedItem.name}
              </Col>
              <Col span={12}>
                <strong>Rating:</strong>
                <Tag color={getRatingColor(selectedItem.rating)} style={{ marginLeft: 8 }}>
                  {selectedItem.rating}
                </Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Contact:</strong> {selectedItem.contact}
              </Col>
              <Col span={12}>
                <strong>Email:</strong> {selectedItem.email}
              </Col>
            </Row>
            <div style={{ marginBottom: 16 }}>
              <strong>Address:</strong> {selectedItem.address}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Performance Metrics:</strong>
              {selectedItem.performance && (
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginTop: 8 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div>On-Time Delivery: {selectedItem.performance.onTimeDelivery}%</div>
                      <Progress 
                        percent={selectedItem.performance.onTimeDelivery} 
                        size="small"
                        strokeColor={selectedItem.performance.onTimeDelivery >= 90 ? '#52c41a' : '#faad14'}
                      />
                    </Col>
                    <Col span={8}>
                      <div>Quality Score: {selectedItem.performance.qualityScore}%</div>
                      <Progress 
                        percent={selectedItem.performance.qualityScore} 
                        size="small"
                        strokeColor={selectedItem.performance.qualityScore >= 90 ? '#52c41a' : '#faad14'}
                      />
                    </Col>
                    <Col span={8}>
                      <div>Cost Effectiveness: {selectedItem.performance.costEffectiveness}%</div>
                      <Progress 
                        percent={selectedItem.performance.costEffectiveness} 
                        size="small"
                        strokeColor={selectedItem.performance.costEffectiveness >= 90 ? '#52c41a' : '#faad14'}
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Products:</strong>
              <div style={{ marginTop: 8 }}>
                {selectedItem.products?.map((product, index) => (
                  <Tag key={index} color="blue" style={{ margin: '2px' }}>
                    {product}
                  </Tag>
                ))}
              </div>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <strong>Contract Expiry:</strong> {moment(selectedItem.contractExpiry).format('MMM DD, YYYY')}
              </Col>
              <Col span={12}>
                <strong>Status:</strong>
                <Tag color={getStatusColor(selectedItem.status)} style={{ marginLeft: 8 }}>
                  {selectedItem.status.replace('_', ' ').toUpperCase()}
                </Tag>
              </Col>
            </Row>
          </div>
        ) : (
          <Form
            layout="vertical"
            onFinish={(values) => {
              message.success('Supplier added successfully');
              setModalVisible(false);
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Supplier Name"
                  rules={[{ required: true, message: 'Please enter supplier name' }]}
                >
                  <Input placeholder="Enter supplier name" />
                </Form.Item>
              </Col>
                            <Col span={12}>
                <Form.Item
                  name="contact"
                  label="Contact Person"
                  rules={[{ required: true, message: 'Please enter contact person' }]}
                >
                  <Input placeholder="Enter contact person" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <TextArea placeholder="Enter full address" rows={3} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select placeholder="Select category">
                    <Option value="medical_equipment">Medical Equipment</Option>
                    <Option value="safety_equipment">Safety Equipment</Option>
                    <Option value="technology">Technology</Option>
                    <Option value="consumables">Consumables</Option>
                    <Option value="ppe">PPE</Option>
                    <Option value="cleaning">Cleaning Supplies</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="rating"
                  label="Rating"
                  rules={[{ required: true, message: 'Please select rating' }]}
                >
                  <Select placeholder="Select rating">
                    <Option value="A+">A+</Option>
                    <Option value="A">A</Option>
                    <Option value="B+">B+</Option>
                    <Option value="B">B</Option>
                    <Option value="C">C</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="active">Active</Option>
                    <Option value="under_review">Under Review</Option>
                    <Option value="suspended">Suspended</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="products"
              label="Products"
              rules={[{ required: true, message: 'Please enter products' }]}
            >
              <Select
                mode="tags"
                placeholder="Enter products (press Enter to add)"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="contractExpiry"
              label="Contract Expiry"
              rules={[{ required: true, message: 'Please select contract expiry date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Divider>Performance Metrics</Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="deliveryScore"
                  label="Delivery Score (%)"
                  rules={[{ required: true, message: 'Please enter delivery score' }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    placeholder="0-100"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="compliance"
                  label="Compliance (%)"
                  rules={[{ required: true, message: 'Please enter compliance score' }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    placeholder="0-100"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="qualityScore"
                  label="Quality Score (%)"
                  rules={[{ required: true, message: 'Please enter quality score' }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    placeholder="0-100"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Add Supplier
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Purchase Order Modal */}
      <Modal
        title="Create Purchase Order"
        open={modalVisible && !selectedItem}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            message.success('Purchase order created successfully');
            setModalVisible(false);
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Supplier"
                rules={[{ required: true, message: 'Please select supplier' }]}
              >
                <Select placeholder="Select supplier">
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="product"
                label="Product"
                rules={[{ required: true, message: 'Please enter product' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="Enter quantity"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unitPrice"
                label="Unit Price ($)"
                rules={[{ required: true, message: 'Please enter unit price' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderDate"
                label="Order Date"
                rules={[{ required: true, message: 'Please select order date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedDate"
                label="Expected Delivery"
                rules={[{ required: true, message: 'Please select expected date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea 
              placeholder="Enter any special instructions or notes..." 
              rows={4}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Purchase Order
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Inventory Item Modal */}
      <Modal
        title="Add Inventory Item"
        open={modalVisible && !selectedItem}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            message.success('Inventory item added successfully');
            setModalVisible(false);
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="product"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[{ required: true, message: 'Please enter SKU' }]}
              >
                <Input placeholder="Enter SKU" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="ppe">PPE</Option>
                  <Option value="medical_equipment">Medical Equipment</Option>
                  <Option value="cleaning">Cleaning Supplies</Option>
                  <Option value="consumables">Consumables</Option>
                  <Option value="technology">Technology</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currentStock"
                label="Current Stock"
                rules={[{ required: true, message: 'Please enter current stock' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Enter quantity"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unitCost"
                label="Unit Cost ($)"
                rules={[{ required: true, message: 'Please enter unit cost' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="minStock"
                label="Minimum Stock"
                rules={[{ required: true, message: 'Please enter minimum stock' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Min quantity"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxStock"
                label="Maximum Stock"
                rules={[{ required: true, message: 'Please enter maximum stock' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Max quantity"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="reorderPoint"
                label="Reorder Point"
                rules={[{ required: true, message: 'Please enter reorder point' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Reorder quantity"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Supplier"
                rules={[{ required: true, message: 'Please select supplier' }]}
              >
                <Select placeholder="Select supplier">
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextRestock"
                label="Next Restock Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Inventory Item
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SupplyChainManagement;