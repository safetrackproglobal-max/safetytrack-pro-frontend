import React, { useState } from 'react';
import { Card, Input, Space, Tag, Typography } from 'antd';
import {
  TeamOutlined, ExperimentOutlined, WarningOutlined, FieldTimeOutlined,
  EyeOutlined, AlertOutlined, SafetyOutlined, ClockCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

const widgetTypes = [
  { id: 'kpi', name: 'KPI Cards', icon: <DashboardOutlined />, category: 'Overview', color: '#1890ff' },
  { id: 'manpower', name: 'Manpower', icon: <TeamOutlined />, category: 'Workforce', color: '#52c41a' },
  { id: 'training', name: 'Training', icon: <ExperimentOutlined />, category: 'Training', color: '#722ed1' },
  { id: 'lti', name: 'LTI Trend', icon: <WarningOutlined />, category: 'Safety', color: '#f5222d' },
  { id: 'manhours', name: 'Man-Hours', icon: <FieldTimeOutlined />, category: 'Workforce', color: '#13c2c2' },
  { id: 'observations', name: 'Observations', icon: <EyeOutlined />, category: 'Safety', color: '#fa8c16' },
  { id: 'accidents', name: 'Accidents', icon: <AlertOutlined />, category: 'Safety', color: '#fa541c' },
  { id: 'injuries', name: 'Injuries', icon: <SafetyOutlined />, category: 'Safety', color: '#faad14' },
  { id: 'overdue', name: 'Overdue', icon: <ClockCircleOutlined />, category: 'Compliance', color: '#f5222d' },
];

const WidgetLibrary = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', ...new Set(widgetTypes.map(w => w.category))];
  const filteredWidgets = widgetTypes.filter(w => (category === 'all' || w.category === category) && w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="widget-library">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Search placeholder="Search widgets..." onChange={e => setSearch(e.target.value)} allowClear />
        <Space wrap>{categories.map(cat => <Tag key={cat} color={category === cat ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setCategory(cat)}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Tag>)}</Space>
        <div className="widget-grid">{filteredWidgets.map(widget => <Card key={widget.id} size="small" hoverable onClick={() => onSelect(widget.id)} className="widget-library-item"><Space direction="vertical" align="center" style={{ width: '100%' }}><div className="widget-icon" style={{ color: widget.color }}>{widget.icon}</div><Text strong>{widget.name}</Text><Tag color="blue">{widget.category}</Tag></Space></Card>)}</div>
      </Space>
    </div>
  );
};

export default WidgetLibrary;