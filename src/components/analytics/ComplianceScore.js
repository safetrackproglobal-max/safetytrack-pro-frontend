import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, ScatterChart, Scatter, ZAxis, ComposedChart, Brush
} from 'recharts';
import { 
  Card, Row, Col, Statistic, Select, Progress, Tag, 
  Button, Space, Alert, Tooltip as AntTooltip, Typography,
  Switch, Tabs, Badge, Divider, Empty, Timeline,
  Spin, message, Modal, Form, Input
} from 'antd';
import { 
  SafetyCertificateOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  RadarChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleOutlined,
  ExportOutlined,
  EyeOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons';
import { analyticsService } from '../../services/analyticsService';
import './analytics.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ComplianceScore = () => {
  const [complianceData, setComplianceData] = useState([]);
  const [overallCompliance, setOverallCompliance] = useState(0);
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('30days');
  const [departmentFilter, setDepartmentFilter] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTrends, setShowTrends] = useState(true);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [form] = Form.useForm();

  // Initialize data
  useEffect(() => {
    fetchComplianceData();
    setupAutoRefresh();
  }, []);

  // Auto-refresh
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchComplianceData();
      }, 60000); // 1 minute
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Fetch data when filters change
  useEffect(() => {
    if (timeRange) {
      fetchComplianceData();
      fetchComplianceTrends();
    }
  }, [timeRange]);

  // Service-based data fetching
  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      // Fetch compliance data from service
      const data = await analyticsService.fetchComplianceScores(null, timeRange);
      
      if (data && data.departmentStats) {
        setComplianceData(data.departmentStats);
        setOverallCompliance(data.overview?.complianceRate || 0);
      } else {
        // Fallback to mock data in development
        if (process.env.NODE_ENV === 'development') {
          const mockData = generateMockComplianceData();
          setComplianceData(mockData);
          setOverallCompliance(calculateOverallCompliance(mockData));
        }
      }
      
      // Cache the data
      analyticsService.cache.set('compliance_data', data);
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
      message.error('Failed to load compliance data');
      
      // Try to load from cache
      const cached = analyticsService.cache.get('compliance_data');
      if (cached) {
        setComplianceData(cached.departmentStats || []);
        setOverallCompliance(cached.overview?.complianceRate || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComplianceTrends = async () => {
    try {
      const data = await analyticsService.fetchComplianceTrends(null, 6);
      if (data) {
        setTrendData(data);
      }
    } catch (error) {
      console.error('Failed to fetch compliance trends:', error);
    }
  };

  const fetchComplianceDistribution = async () => {
    try {
      const data = await analyticsService.fetchComplianceDistribution();
      return data;
    } catch (error) {
      console.error('Failed to fetch compliance distribution:', error);
      return null;
    }
  };

  const generateMockComplianceData = () => {
    const departments = ['Emergency', 'Surgery', 'ICU', 'Lab', 'Pharmacy', 'Radiology', 'Pediatrics', 'Administration'];
    return departments.map(dept => ({
      department: dept,
      compliance: Math.floor(Math.random() * 30) + 70,
      incidents: Math.floor(Math.random() * 50),
      risk: Math.floor(Math.random() * 100),
      category: dept === 'Administration' ? 'Administrative' : 'Clinical'
    }));
  };

  const calculateOverallCompliance = (data) => {
    if (!data || data.length === 0) return 0;
    const total = data.reduce((sum, dept) => sum + dept.compliance, 0);
    return Math.round(total / data.length);
  };

  const handleExport = async (format = 'excel') => {
    setExporting(true);
    try {
      const exportData = {
        export_type: format,
        module: 'compliance',
        date_range: getDateRange(),
        include_charts: true,
        data_format: 'detailed',
        filename: `compliance-report-${new Date().toISOString().split('T')[0]}.${format}`
      };

      // Validate config
      const validation = analyticsService.validateExportConfig(exportData);
      if (!validation.isValid) {
        message.error(`Invalid export config: ${validation.errors.join(', ')}`);
        return;
      }

      const result = await analyticsService.generateExport(exportData);
      
      if (result.export_id) {
        message.success('Export generation started!');
        pollExportStatus(result.export_id);
        setExportModalVisible(false);
      }
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const pollExportStatus = async (exportId, retries = 0) => {
    if (retries > 60) {
      message.error('Export timeout');
      return;
    }

    try {
      const status = await analyticsService.getExportStatus(exportId);
      
      if (status.status === 'completed') {
        // Auto-download the export
        await analyticsService.downloadExport(exportId, `compliance-report.${status.format || 'xlsx'}`);
        message.success('Export downloaded!');
      } else if (status.status === 'failed') {
        message.error(`Export failed: ${status.error || 'Unknown error'}`);
      } else {
        // Continue polling with exponential backoff
        const delay = Math.min(1000 * Math.pow(1.5, retries), 10000);
        setTimeout(() => pollExportStatus(exportId, retries + 1), delay);
      }
    } catch (error) {
      const delay = Math.min(5000 * Math.pow(1.5, retries), 30000);
      setTimeout(() => pollExportStatus(exportId, retries + 1), delay);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case '90days':
        start.setDate(now.getDate() - 90);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  };

  const updateComplianceScore = async (departmentId, score, evidence) => {
    try {
      await analyticsService.updateComplianceScore(departmentId, score, evidence);
      message.success('Compliance score updated successfully');
      fetchComplianceData(); // Refresh data
    } catch (error) {
      message.error('Failed to update compliance score');
    }
  };

  // Color functions
  const getComplianceColor = (score) => {
    if (score >= 95) return '#52c41a'; // Excellent
    if (score >= 90) return '#27ae60'; // Good
    if (score >= 80) return '#f39c12'; // Fair
    if (score >= 70) return '#fa8c16'; // Poor
    return '#ff4d4f'; // Critical
  };

  const getComplianceLevel = (score) => {
    if (score >= 95) return { label: 'Excellent', color: '#52c41a', icon: <CheckCircleOutlined /> };
    if (score >= 90) return { label: 'Good', color: '#27ae60', icon: <CheckCircleOutlined /> };
    if (score >= 80) return { label: 'Fair', color: '#f39c12', icon: <WarningOutlined /> };
    if (score >= 70) return { label: 'Poor', color: '#fa8c16', icon: <WarningOutlined /> };
    return { label: 'Critical', color: '#ff4d4f', icon: <CloseCircleOutlined /> };
  };

  const getComplianceProgressStatus = (score) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'active';
    return 'exception';
  };

  // Data calculations
  const getComplianceDistribution = () => {
    const levels = [
      { name: 'Excellent (95-100%)', value: 0, color: '#52c41a' },
      { name: 'Good (90-94%)', value: 0, color: '#27ae60' },
      { name: 'Fair (80-89%)', value: 0, color: '#f39c12' },
      { name: 'Poor (70-79%)', value: 0, color: '#fa8c16' },
      { name: 'Critical (<70%)', value: 0, color: '#ff4d4f' }
    ];

    complianceData.forEach(dept => {
      if (dept.compliance >= 95) levels[0].value++;
      else if (dept.compliance >= 90) levels[1].value++;
      else if (dept.compliance >= 80) levels[2].value++;
      else if (dept.compliance >= 70) levels[3].value++;
      else levels[4].value++;
    });

    return levels;
  };

  const getTopPerformers = () => {
    return [...complianceData]
      .sort((a, b) => b.compliance - a.compliance)
      .slice(0, 3);
  };

  const getNeedAttention = () => {
    return [...complianceData]
      .filter(dept => dept.compliance < 80)
      .sort((a, b) => a.compliance - b.compliance)
      .slice(0, 3);
  };

  // Chart renderers
  const renderDepartmentComplianceChart = () => {
    const filteredData = departmentFilter.length > 0 
      ? complianceData.filter(dept => departmentFilter.includes(dept.department))
      : complianceData;

    const sortedData = [...filteredData].sort((a, b) => b.compliance - a.compliance);

    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="department" 
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              label={{ value: 'Compliance %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Compliance']}
              labelFormatter={(label) => `Department: ${label}`}
              contentStyle={{ 
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="compliance" 
              name="Compliance Score"
              radius={[4, 4, 0, 0]}
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getComplianceColor(entry.compliance)}
                  stroke={getComplianceColor(entry.compliance)}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        );

      case 'radar':
        return (
          <RadarChart outerRadius={90} data={sortedData}>
            <PolarGrid stroke="#f0f0f0" />
            <PolarAngleAxis 
              dataKey="department" 
              tick={{ fontSize: 10 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
            />
            <Radar
              name="Compliance"
              dataKey="compliance"
              stroke={getComplianceColor(overallCompliance)}
              fill={getComplianceColor(overallCompliance)}
              fillOpacity={0.6}
            />
            <Legend />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Compliance']}
              labelFormatter={(label) => `Department: ${label}`}
            />
          </RadarChart>
        );

      case 'treemap':
        return (
          <Treemap
            width={400}
            height={300}
            data={sortedData.map(dept => ({
              name: dept.department,
              size: dept.compliance,
              color: getComplianceColor(dept.compliance)
            }))}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
          >
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Compliance']}
              labelFormatter={(label) => `Department: ${label}`}
            />
          </Treemap>
        );

      default:
        return (
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, 'Compliance']} />
            <Legend />
            <Bar dataKey="compliance" name="Compliance %" fill="#3498db" />
          </BarChart>
        );
    }
  };

  const renderTrendChart = () => {
    if (!trendData) return null;

    return (
      <ComposedChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" domain={[0, 100]} />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="target"
          stroke="#ffcc00"
          fill="#ffcc00"
          fillOpacity={0.1}
          name="Target (90%)"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="compliance"
          stroke={getComplianceColor(overallCompliance)}
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
          name="Compliance Trend"
        />
        <Bar
          yAxisId="right"
          dataKey="incidents"
          fill="#ff6b6b"
          fillOpacity={0.6}
          name="Incidents"
          radius={[2, 2, 0, 0]}
        />
        <Brush dataKey="month" height={30} stroke="#8889aa" />
      </ComposedChart>
    );
  };

  const renderScatterMatrix = () => {
    const scatterData = complianceData.map(dept => ({
      x: dept.compliance,
      y: dept.risk || 0,
      z: dept.incidents || 0,
      name: dept.department
    }));

    return (
      <ScatterChart width={600} height={400}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Compliance %" 
          domain={[0, 100]}
          label={{ value: 'Compliance %', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="Risk Score" 
          label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
        />
        <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Incidents" />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value, name) => {
            if (name === 'x') return [`${value}%`, 'Compliance'];
            if (name === 'y') return [value, 'Risk Score'];
            if (name === 'z') return [value, 'Incidents'];
            return value;
          }}
          labelFormatter={(label) => `Department: ${label}`}
        />
        <Legend />
        <Scatter 
          name="Departments" 
          data={scatterData} 
          fill="#8884d8"
          shape="circle"
        />
      </ScatterChart>
    );
  };

  // Render export modal
  const renderExportModal = () => (
    <Modal
      title="Export Compliance Report"
      open={exportModalVisible}
      onCancel={() => setExportModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setExportModalVisible(false)}>
          Cancel
        </Button>,
        <Button 
          key="export-excel" 
          type="primary"
          onClick={() => handleExport('excel')}
          loading={exporting}
          icon={<FileExcelOutlined />}
        >
          Export as Excel
        </Button>,
        <Button 
          key="export-pdf" 
          onClick={() => handleExport('pdf')}
          loading={exporting}
          icon={<FilePdfOutlined />}
        >
          Export as PDF
        </Button>
      ]}
      width={500}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Export Options"
          description="Select the format and data for your compliance report"
          type="info"
          showIcon
        />
        
        <div>
          <Text strong>Time Range:</Text>
          <Select 
            value={timeRange} 
            onChange={setTimeRange} 
            style={{ width: '100%', marginTop: 8 }}
          >
            <Option value="7days">Last 7 Days</Option>
            <Option value="30days">Last 30 Days</Option>
            <Option value="90days">Last 90 Days</Option>
            <Option value="year">Last Year</Option>
          </Select>
        </div>
        
        <div>
          <Text strong>Include Departments:</Text>
          <Select
            mode="multiple"
            placeholder="All departments"
            value={departmentFilter}
            onChange={setDepartmentFilter}
            style={{ width: '100%', marginTop: 8 }}
          >
            {complianceData.map(dept => (
              <Option key={dept.department} value={dept.department}>
                {dept.department}
              </Option>
            ))}
          </Select>
        </div>
        
        <div>
          <Text strong>Include in Export:</Text>
          <div style={{ marginTop: 8 }}>
            <Space direction="vertical">
              <Switch defaultChecked>Compliance Scores</Switch>
              <Switch defaultChecked>Trend Analysis</Switch>
              <Switch defaultChecked>Department Comparison</Switch>
              <Switch>Detailed Change Log</Switch>
              <Switch defaultChecked>Recommendations</Switch>
            </Space>
          </div>
        </div>
        
        <Divider />
        
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Estimated file size: ~{(complianceData.length * 0.3).toFixed(1)} KB
          </Text>
        </div>
      </Space>
    </Modal>
  );

  if (loading && complianceData.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="Loading compliance data..." />
      </div>
    );
  }

  if (complianceData.length === 0) {
    return (
      <Card className="compliance-empty">
        <Empty
          description={
            <div>
              <Title level={4}>No Compliance Data Available</Title>
              <Text type="secondary">
                Connect to your data source to view compliance analytics
              </Text>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            onClick={fetchComplianceData}
            loading={loading}
            icon={<ReloadOutlined />}
          >
            Refresh Data
          </Button>
        </Empty>
      </Card>
    );
  }

  const complianceLevel = getComplianceLevel(overallCompliance);
  const distributionData = getComplianceDistribution();
  const topPerformers = getTopPerformers();
  const needAttention = getNeedAttention();

  return (
    <div className="compliance-score">
      {/* Header with overall score */}
      <Card className="compliance-header-card">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <div className="compliance-header">
              <Title level={2}>Compliance Analytics</Title>
              <Text type="secondary">Monitor and analyze compliance metrics across departments</Text>
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Badge 
                    status="processing" 
                    text={`Last updated: ${analyticsService.formatDate(new Date().toISOString(), 'relative')}`}
                  />
                  <Switch
                    checkedChildren="Auto-refresh"
                    unCheckedChildren="Manual"
                    checked={autoRefresh}
                    onChange={setAutoRefresh}
                    size="small"
                  />
                </Space>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="overall-score-display">
              <div 
                className="score-circle"
                style={{ 
                  borderColor: complianceLevel.color,
                  background: `linear-gradient(135deg, ${complianceLevel.color}20, transparent)`
                }}
              >
                <span className="score-value">{overallCompliance.toFixed(1)}%</span>
                <span className="score-label">Overall Compliance</span>
                <Tag 
                  color={complianceLevel.color} 
                  style={{ marginTop: 8 }}
                  icon={complianceLevel.icon}
                >
                  {complianceLevel.label}
                </Tag>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Total Departments"
              value={complianceData.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Average Compliance"
              value={overallCompliance}
              suffix="%"
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: complianceLevel.color }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Top Performers"
              value={topPerformers.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Need Attention"
              value={needAttention.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Target Met"
              value={complianceData.filter(dept => dept.compliance >= 90).length}
              suffix={`/ ${complianceData.length}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#27ae60' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Last Updated"
              value={analyticsService.formatDate(new Date().toISOString(), 'relative')}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Controls */}
      <Card className="compliance-controls" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select
              value={chartType}
              onChange={setChartType}
              style={{ width: '100%' }}
              suffixIcon={<BarChartOutlined />}
            >
              <Option value="bar"><BarChartOutlined /> Bar Chart</Option>
              <Option value="radar"><RadarChartOutlined /> Radar Chart</Option>
              <Option value="treemap"><PieChartOutlined /> Treemap</Option>
              <Option value="line"><LineChartOutlined /> Line Chart</Option>
              <Option value="area"><AreaChartOutlined /> Area Chart</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter Departments"
              mode="multiple"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              {complianceData.map(dept => (
                <Option key={dept.department} value={dept.department}>
                  {dept.department}
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: '100%' }}
              suffixIcon={<CalendarOutlined />}
            >
              <Option value="7days">Last 7 Days</Option>
              <Option value="30days">Last 30 Days</Option>
              <Option value="90days">Last 90 Days</Option>
              <Option value="year">Last Year</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Switch
                checked={showTrends}
                onChange={setShowTrends}
                checkedChildren="Trends On"
                unCheckedChildren="Trends Off"
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchComplianceData}
                loading={loading}
              >
                Refresh
              </Button>
              <Button 
                type="primary"
                icon={<ExportOutlined />} 
                onClick={() => setExportModalVisible(true)}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabs for different views */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="compliance-tabs"
        style={{ marginTop: 24 }}
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <BarChartOutlined />
                Overview
              </span>
            )
          },
          {
            key: 'trends',
            label: (
              <span>
                <LineChartOutlined />
                Trends
              </span>
            )
          },
          {
            key: 'details',
            label: (
              <span>
                <EyeOutlined />
                Detailed View
              </span>
            )
          },
          {
            key: 'analysis',
            label: (
              <span>
                <HistoryOutlined />
                Analysis
              </span>
            )
          }
        ]}
      />

      {/* Main Content */}
      <div className="compliance-content">
        {activeTab === 'overview' && (
          <Row gutter={[24, 24]}>
            {/* Distribution Chart */}
            <Col xs={24} lg={12}>
              <Card 
                title="Compliance Distribution" 
                className="chart-card"
                extra={
                  <AntTooltip title="Distribution of departments by compliance level">
                    <QuestionCircleOutlined />
                  </AntTooltip>
                }
              >
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={30}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} departments`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Department Chart */}
            <Col xs={24} lg={12}>
              <Card 
                title="Department Compliance" 
                className="chart-card"
                extra={
                  <Space>
                    <Text type="secondary">{complianceData.length} departments</Text>
                    <AntTooltip title="Department compliance scores">
                      <QuestionCircleOutlined />
                    </AntTooltip>
                  </Space>
                }
              >
                <ResponsiveContainer width="100%" height={350}>
                  {renderDepartmentComplianceChart()}
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Top Performers */}
            <Col xs={24} lg={12}>
              <Card title="Top Performers" className="stats-card">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {topPerformers.map((dept, index) => (
                    <div key={dept.department} className="performer-item">
                      <div className="performer-rank">
                        <Badge count={index + 1} style={{ backgroundColor: getComplianceColor(dept.compliance) }} />
                      </div>
                      <div className="performer-info">
                        <Text strong>{dept.department}</Text>
                        <Text type="secondary">{dept.compliance}% compliance</Text>
                      </div>
                      <Progress 
                        percent={dept.compliance} 
                        status={getComplianceProgressStatus(dept.compliance)}
                        strokeColor={getComplianceColor(dept.compliance)}
                        size="small"
                        style={{ flex: 1 }}
                      />
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>

            {/* Need Attention */}
            <Col xs={24} lg={12}>
              <Card title="Need Attention" className="stats-card">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {needAttention.length > 0 ? (
                    needAttention.map((dept) => (
                      <Alert
                        key={dept.department}
                        message={dept.department}
                        description={`${dept.compliance}% compliance - Needs improvement`}
                        type="warning"
                        showIcon
                        action={
                          <Button size="small" type="link">
                            View Details
                          </Button>
                        }
                        style={{ width: '100%' }}
                      />
                    ))
                  ) : (
                    <Alert
                      message="All departments are compliant"
                      description="Great job! All departments meet the minimum compliance standards."
                      type="success"
                      showIcon
                    />
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {activeTab === 'trends' && (
          <Card title="Compliance Trends Over Time" className="chart-card">
            {showTrends ? (
              trendData ? (
                <ResponsiveContainer width="100%" height={400}>
                  {renderTrendChart()}
                </ResponsiveContainer>
              ) : (
                <Empty description="No trend data available" />
              )
            ) : (
              <Empty description="Trend analysis is currently disabled" />
            )}
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Switch
                checked={showTrends}
                onChange={setShowTrends}
                checkedChildren="Trend Analysis Enabled"
                unCheckedChildren="Trend Analysis Disabled"
              />
            </div>
          </Card>
        )}

        {activeTab === 'details' && (
          <Card title="Compliance Matrix Analysis" className="chart-card">
            <ResponsiveContainer width="100%" height={500}>
              {renderScatterMatrix()}
            </ResponsiveContainer>
            <Divider />
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Title level={4}>Compliance Insights</Title>
                <Text>
                  This scatter plot shows the relationship between compliance scores, risk levels, and incident counts.
                  Departments in the top-right quadrant have both high compliance and low risk.
                </Text>
              </Col>
            </Row>
          </Card>
        )}

        {activeTab === 'analysis' && (
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="Detailed Compliance Analysis">
                <Timeline>
                  <Timeline.Item color="green">
                    <Text strong>Overall Compliance: {overallCompliance}%</Text>
                    <br />
                    <Text type="secondary">
                      {complianceLevel.label} level of compliance across all departments
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <Text strong>{topPerformers.length} Top Performing Departments</Text>
                    <br />
                    <Text type="secondary">
                      Average score: {(topPerformers.reduce((sum, dept) => sum + dept.compliance, 0) / topPerformers.length).toFixed(1)}%
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item color={needAttention.length > 0 ? "red" : "green"}>
                    <Text strong>{needAttention.length} Departments Need Attention</Text>
                    <br />
                    <Text type="secondary">
                      {needAttention.length > 0 
                        ? `Lowest score: ${needAttention[0]?.compliance || 0}%`
                        : 'All departments are meeting targets'
                      }
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>Next Steps</Text>
                    <br />
                    <Text type="secondary">
                      {overallCompliance >= 90 
                        ? 'Maintain current compliance levels and focus on continuous improvement'
                        : 'Implement targeted improvement plans for low-compliance departments'
                      }
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      {/* Export Modal */}
      {renderExportModal()}
    </div>
  );
};

export default ComplianceScore;