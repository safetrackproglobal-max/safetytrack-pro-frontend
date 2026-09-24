// src/components/incidents/FishboneDiagram.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Button, Input, Select, Space, Tag, Modal, Form, message,
  Row, Col, Tooltip, Popconfirm, Empty, Divider, Badge, Alert,
  List, Avatar, Typography, Drawer, Tabs, Progress, Statistic
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined,
  DownloadOutlined, ExpandOutlined, CompressOutlined,
  BranchesOutlined, BulbOutlined, ThunderboltOutlined,
  FileImageOutlined, PrinterOutlined, ReloadOutlined,
  CheckCircleOutlined, WarningOutlined, InfoCircleOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// ==================== FISHBONE CONSTANTS ====================

const DEFAULT_CATEGORIES = [
  {
    id: 'man',
    name: 'Man / People',
    color: '#1890ff',
    icon: '👤',
    description: 'Human factors, training, experience, fatigue, communication',
    causes: []
  },
  {
    id: 'machine',
    name: 'Machine / Equipment',
    color: '#52c41a',
    icon: '⚙️',
    description: 'Equipment failure, maintenance, design, calibration',
    causes: []
  },
  {
    id: 'method',
    name: 'Method / Process',
    color: '#faad14',
    icon: '📋',
    description: 'Procedures, work instructions, supervision, planning',
    causes: []
  },
  {
    id: 'material',
    name: 'Material',
    color: '#722ed1',
    icon: '📦',
    description: 'Raw materials, components, specifications, quality',
    causes: []
  },
  {
    id: 'measurement',
    name: 'Measurement',
    color: '#13c2c2',
    icon: '📊',
    description: 'Inspection, testing, calibration, data accuracy',
    causes: []
  },
  {
    id: 'environment',
    name: 'Environment',
    color: '#eb2f96',
    icon: '🌍',
    description: 'Lighting, noise, temperature, layout, weather',
    causes: []
  }
];

const INDUSTRY_SPECIFIC_CATEGORIES = {
  healthcare: [
    { id: 'patient', name: 'Patient Factors', color: '#1890ff', icon: '🏥', description: 'Patient condition, cooperation, history', causes: [] },
    { id: 'staff', name: 'Staff Factors', color: '#52c41a', icon: '👨‍⚕️', description: 'Training, staffing levels, experience', causes: [] },
    { id: 'protocol', name: 'Protocols', color: '#faad14', icon: '📋', description: 'Clinical protocols, guidelines', causes: [] },
    { id: 'equipment', name: 'Medical Equipment', color: '#722ed1', icon: '🩺', description: 'Device failure, availability', causes: [] },
    { id: 'communication', name: 'Communication', color: '#13c2c2', icon: '💬', description: 'Handoffs, documentation', causes: [] },
    { id: 'environment', name: 'Environment', color: '#eb2f96', icon: '🏥', description: 'Ward layout, lighting, noise', causes: [] }
  ],
  construction: [
    { id: 'worker', name: 'Worker Factors', color: '#1890ff', icon: '👷', description: 'Training, PPE, experience', causes: [] },
    { id: 'equipment', name: 'Equipment', color: '#52c41a', icon: '🏗️', description: 'Cranes, tools, machinery', causes: [] },
    { id: 'method', name: 'Method', color: '#faad14', icon: '📋', description: 'Work method, sequencing', causes: [] },
    { id: 'material', name: 'Materials', color: '#722ed1', icon: '🧱', description: 'Structural materials', causes: [] },
    { id: 'site', name: 'Site Conditions', color: '#13c2c2', icon: '🏔️', description: 'Ground, weather, access', causes: [] },
    { id: 'management', name: 'Management', color: '#eb2f96', icon: '📊', description: 'Supervision, planning', causes: [] }
  ],
  oil_gas: [
    { id: 'personnel', name: 'Personnel', color: '#1890ff', icon: '👷', description: 'Training, competency', causes: [] },
    { id: 'equipment', name: 'Equipment', color: '#52c41a', icon: '🛢️', description: 'Pumps, valves, vessels', causes: [] },
    { id: 'process', name: 'Process', color: '#faad14', icon: '⚗️', description: 'Procedures, parameters', causes: [] },
    { id: 'chemical', name: 'Chemicals', color: '#722ed1', icon: '🧪', description: 'H2S, hydrocarbons', causes: [] },
    { id: 'environment', name: 'Environment', color: '#13c2c2', icon: '🌊', description: 'Weather, sea state', causes: [] },
    { id: 'management', name: 'Management', color: '#eb2f96', icon: '📊', description: 'Permits, supervision', causes: [] }
  ]
};

// ==================== FISHBONE DIAGRAM COMPONENT ====================

const FishboneDiagram = ({ 
  incident, 
  visible, 
  onClose, 
  onSave,
  readOnly = false 
}) => {
  const [categories, setCategories] = useState([]);
  const [problemStatement, setProblemStatement] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [causeModalVisible, setCauseModalVisible] = useState(false);
  const [editingCause, setEditingCause] = useState(null);
  const [causeForm] = Form.useForm();
  const [expandedView, setExpandedView] = useState(false);
  const svgRef = useRef(null);

  // Initialize categories based on incident industry
  useEffect(() => {
    if (incident) {
      const industry = incident.industry_id || incident.industry;
      const baseCategories = INDUSTRY_SPECIFIC_CATEGORIES[industry] || DEFAULT_CATEGORIES;
      
      // Check if there's saved fishbone data
      const savedData = incident.custom_data?.fishbone_analysis;
      
      if (savedData) {
        setCategories(savedData.categories || baseCategories);
        setProblemStatement(savedData.problemStatement || incident.title || '');
      } else {
        setCategories(baseCategories.map(cat => ({ ...cat, causes: [] })));
        setProblemStatement(incident.title || '');
      }
    }
  }, [incident]);

  // Add cause to category
  const handleAddCause = (categoryId) => {
    setSelectedCategory(categoryId);
    setEditingCause(null);
    causeForm.resetFields();
    setCauseModalVisible(true);
  };

  // Edit existing cause
  const handleEditCause = (categoryId, cause) => {
    setSelectedCategory(categoryId);
    setEditingCause(cause);
    causeForm.setFieldsValue(cause);
    setCauseModalVisible(true);
  };

  // Save cause
  const handleSaveCause = (values) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === selectedCategory) {
        if (editingCause) {
          return {
            ...cat,
            causes: cat.causes.map(c => 
              c.id === editingCause.id ? { ...c, ...values } : c
            )
          };
        } else {
          return {
            ...cat,
            causes: [...cat.causes, {
              id: Date.now().toString(),
              ...values,
              createdAt: new Date().toISOString()
            }]
          };
        }
      }
      return cat;
    }));
    setCauseModalVisible(false);
    causeForm.resetFields();
    message.success(editingCause ? 'Cause updated' : 'Cause added');
  };

  // Delete cause
  const handleDeleteCause = (categoryId, causeId) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, causes: cat.causes.filter(c => c.id !== causeId) };
      }
      return cat;
    }));
    message.success('Cause removed');
  };

  // Save entire fishbone analysis
  const handleSave = () => {
    const fishboneData = {
      problemStatement,
      categories,
      lastUpdated: new Date().toISOString()
    };
    
    if (onSave) {
      onSave(fishboneData);
    }
    message.success('Fishbone analysis saved');
  };

  // Export as SVG
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fishbone-${incident?.incident_number || 'analysis'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('Diagram exported as SVG');
  };

  // Get total causes count
  const totalCauses = categories.reduce((sum, cat) => sum + cat.causes.length, 0);

  // Render fishbone SVG
  const renderFishboneSVG = () => {
    const width = 1200;
    const height = 600;
    const spineY = height / 2;
    const spineStartX = 50;
    const spineEndX = width - 50;
    
    return (
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', background: '#fff' }}
      >
        {/* Problem Statement Box (Head) */}
        <rect
          x={spineEndX - 150}
          y={spineY - 40}
          width={180}
          height={80}
          rx={8}
          fill="#f5222d"
          stroke="#cf1322"
          strokeWidth={2}
        />
        <text
          x={spineEndX - 60}
          y={spineY - 5}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
        >
          PROBLEM
        </text>
        <foreignObject
          x={spineEndX - 145}
          y={spineY - 25}
          width={170}
          height={50}
        >
          <div style={{ 
            color: '#fff', 
            fontSize: '10px', 
            textAlign: 'center',
            padding: '4px',
            wordWrap: 'break-word'
          }}>
            {problemStatement?.substring(0, 50) || 'Describe the problem'}
            {problemStatement?.length > 50 ? '...' : ''}
          </div>
        </foreignObject>

        {/* Main Spine */}
        <line
          x1={spineStartX}
          y1={spineY}
          x2={spineEndX - 150}
          y2={spineY}
          stroke="#333"
          strokeWidth={3}
          markerEnd="url(#arrowhead)"
        />

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
          </marker>
        </defs>

        {/* Categories (Bones) */}
        {categories.map((category, index) => {
          const isTop = index % 2 === 0;
          const boneIndex = Math.floor(index / 2);
          const boneSpacing = (spineEndX - 200 - spineStartX) / Math.ceil(categories.length / 2);
          const boneX = spineStartX + 100 + (boneIndex * boneSpacing);
          const boneLength = 180;
          const boneY = isTop ? spineY - boneLength : spineY + boneLength;

          return (
            <g key={category.id}>
              {/* Main bone line */}
              <line
                x1={boneX}
                y1={spineY}
                x2={boneX + 30}
                y2={boneY}
                stroke={category.color}
                strokeWidth={2}
              />
              <line
                x1={boneX + 30}
                y1={boneY}
                x2={boneX + boneSpacing - 20}
                y2={boneY}
                stroke={category.color}
                strokeWidth={2}
              />

              {/* Category label */}
              <rect
                x={boneX + 30}
                y={isTop ? boneY - 25 : boneY + 5}
                width={100}
                height={22}
                rx={4}
                fill={category.color}
              />
              <text
                x={boneX + 80}
                y={isTop ? boneY - 10 : boneY + 20}
                textAnchor="middle"
                fill="#fff"
                fontSize={10}
                fontWeight="bold"
              >
                {category.icon} {category.name.substring(0, 12)}
              </text>

              {/* Causes (Sub-bones) */}
              {category.causes.slice(0, 4).map((cause, causeIndex) => {
                const causeX = boneX + 50 + (causeIndex * 40);
                const causeLength = isTop ? -60 : 60;
                
                return (
                  <g key={cause.id}>
                    <line
                      x1={causeX}
                      y1={boneY}
                      x2={causeX + 10}
                      y2={boneY + causeLength}
                      stroke={category.color}
                      strokeWidth={1}
                      strokeDasharray="3,2"
                    />
                    <foreignObject
                      x={causeX - 20}
                      y={isTop ? boneY + causeLength - 30 : boneY + causeLength + 5}
                      width={80}
                      height={30}
                    >
                      <div style={{
                        fontSize: '8px',
                        color: '#666',
                        textAlign: 'center',
                        padding: '2px',
                        background: '#f5f5f5',
                        borderRadius: '2px',
                        wordWrap: 'break-word',
                        overflow: 'hidden'
                      }}>
                        {cause.description?.substring(0, 30) || cause.text?.substring(0, 30)}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* More causes indicator */}
              {category.causes.length > 4 && (
                <text
                  x={boneX + boneSpacing - 30}
                  y={boneY + 5}
                  fontSize={8}
                  fill="#999"
                >
                  +{category.causes.length - 4} more
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <Drawer
      title={
        <Space>
          <BranchesOutlined style={{ color: '#722ed1' }} />
          <span>Fishbone (Ishikawa) Analysis</span>
          {incident && (
            <Tag color="blue">{incident.incident_number || `#${incident.id}`}</Tag>
          )}
          <Badge count={totalCauses} style={{ backgroundColor: '#722ed1' }} />
        </Space>
      }
      placement="right"
      width={expandedView ? '100%' : 900}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Tooltip title={expandedView ? 'Collapse' : 'Expand'}>
            <Button 
              icon={expandedView ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={() => setExpandedView(!expandedView)}
            />
          </Tooltip>
          <Tooltip title="Export SVG">
            <Button icon={<FileImageOutlined />} onClick={handleExportSVG} />
          </Tooltip>
          {!readOnly && (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save Analysis
            </Button>
          )}
        </Space>
      }
    >
      <Alert
        message="Root Cause Analysis"
        description="Use the Fishbone diagram to systematically identify potential causes of the incident. Add causes to each category to build your analysis."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Problem Statement */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Text strong>Problem Statement:</Text>
          </Col>
          <Col span={20}>
            <Input
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Describe the problem or effect being analyzed..."
              disabled={readOnly}
            />
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="diagram">
        <TabPane tab="Diagram View" key="diagram">
          <Card 
            bodyStyle={{ padding: 16, overflow: 'auto' }}
            style={{ marginBottom: 16 }}
          >
            {categories.length > 0 ? renderFishboneSVG() : (
              <Empty description="No categories defined" />
            )}
          </Card>
        </TabPane>

        <TabPane tab="Manage Causes" key="manage">
          <Row gutter={[16, 16]}>
            {categories.map(category => (
              <Col xs={24} md={12} key={category.id}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <span style={{ fontSize: 18 }}>{category.icon}</span>
                      <span style={{ color: category.color }}>{category.name}</span>
                      <Badge count={category.causes.length} style={{ backgroundColor: category.color }} />
                    </Space>
                  }
                  extra={
                    !readOnly && (
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<PlusOutlined />}
                        onClick={() => handleAddCause(category.id)}
                      >
                        Add Cause
                      </Button>
                    )
                  }
                  style={{ borderTop: `3px solid ${category.color}` }}
                >
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    {category.description}
                  </Text>
                  
                  {category.causes.length > 0 ? (
                    <List
                      size="small"
                      dataSource={category.causes}
                      renderItem={(cause) => (
                        <List.Item
                          actions={!readOnly ? [
                            <Tooltip title="Edit">
                              <Button 
                                type="link" 
                                size="small" 
                                icon={<EditOutlined />}
                                onClick={() => handleEditCause(category.id, cause)}
                              />
                            </Tooltip>,
                            <Popconfirm
                              title="Remove this cause?"
                              onConfirm={() => handleDeleteCause(category.id, cause.id)}
                            >
                              <Button 
                                type="link" 
                                size="small" 
                                danger
                                icon={<DeleteOutlined />}
                              />
                            </Popconfirm>
                          ] : []}
                        >
                          <List.Item.Meta
                            avatar={
                              <Tag color={cause.likelihood === 'high' ? 'red' : cause.likelihood === 'medium' ? 'orange' : 'green'}>
                                {cause.likelihood?.charAt(0).toUpperCase() || 'M'}
                              </Tag>
                            }
                            title={cause.description || cause.text}
                            description={
                              <Space size="small">
                                {cause.evidence && (
                                  <Tooltip title={cause.evidence}>
                                    <Tag icon={<FileImageOutlined />} color="blue">Evidence</Tag>
                                  </Tooltip>
                                )}
                                {cause.isRootCause && (
                                  <Tag color="red" icon={<WarningOutlined />}>Root Cause</Tag>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty 
                      image={Empty.PRESENTED_IMAGE_SIMPLE} 
                      description="No causes identified"
                      style={{ margin: '8px 0' }}
                    />
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="Root Cause Summary" key="summary">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Total Causes" 
                  value={totalCauses}
                  prefix={<BulbOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Root Causes Identified" 
                  value={categories.reduce((sum, cat) => 
                    sum + cat.causes.filter(c => c.isRootCause).length, 0
                  )}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Categories Used" 
                  value={categories.filter(cat => cat.causes.length > 0).length}
                  suffix={`/ ${categories.length}`}
                />
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">Identified Root Causes</Divider>
          
          <List
            dataSource={categories.flatMap(cat => 
              cat.causes
                .filter(c => c.isRootCause)
                .map(c => ({ ...c, category: cat.name, categoryColor: cat.color }))
            )}
            renderItem={(cause) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: cause.categoryColor }}>{cause.category?.charAt(0)}</Avatar>}
                  title={cause.description || cause.text}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">Category: {cause.category}</Text>
                      {cause.evidence && <Text type="secondary">Evidence: {cause.evidence}</Text>}
                    </Space>
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: 'No root causes marked yet. Edit causes to mark them as root causes.' }}
          />
        </TabPane>
      </Tabs>

      {/* Add/Edit Cause Modal */}
      <Modal
        title={editingCause ? 'Edit Cause' : 'Add Cause'}
        open={causeModalVisible}
        onCancel={() => {
          setCauseModalVisible(false);
          causeForm.resetFields();
          setEditingCause(null);
        }}
        footer={null}
      >
        <Form
          form={causeForm}
          layout="vertical"
          onFinish={handleSaveCause}
        >
          <Form.Item
            name="description"
            label="Cause Description"
            rules={[{ required: true, message: 'Please describe the cause' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Describe the potential cause..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="likelihood"
                label="Likelihood"
                initialValue="medium"
              >
                <Select>
                  <Option value="high">
                    <Tag color="red">High</Tag>
                  </Option>
                  <Option value="medium">
                    <Tag color="orange">Medium</Tag>
                  </Option>
                  <Option value="low">
                    <Tag color="green">Low</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isRootCause"
                label="Mark as Root Cause"
                valuePropName="checked"
              >
                <Select>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="evidence"
            label="Supporting Evidence"
          >
            <TextArea 
              rows={2} 
              placeholder="What evidence supports this cause?"
            />
          </Form.Item>

          <Form.Item
            name="correctiveAction"
            label="Potential Corrective Action"
          >
            <TextArea 
              rows={2} 
              placeholder="What action could address this cause?"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCause ? 'Update Cause' : 'Add Cause'}
              </Button>
              <Button onClick={() => {
                setCauseModalVisible(false);
                causeForm.resetFields();
                setEditingCause(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

export default FishboneDiagram;