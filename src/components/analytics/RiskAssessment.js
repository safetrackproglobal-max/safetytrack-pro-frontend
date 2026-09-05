import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Card, 
  Table, 
  Tag, 
  Progress, 
  Spin, 
  Row, 
  Col, 
  Statistic,
  Select,
  Space,
  Button,
  Tooltip,
  Alert,
  Badge,
  Modal,
  Typography,
  Slider,
  Switch,
  DatePicker,
  Input,
  Tabs,
  Empty,
  Timeline,
  Collapse,
  Radio,
  Divider,
  notification
} from "antd";
import { 
  WarningOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  HeatMapOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  ExportOutlined,
  CalendarOutlined,
  SearchOutlined,
  SettingOutlined,
  HistoryOutlined,
  ClusterOutlined,
  RiskIconOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, AreaChart, Area, Treemap
} from "recharts";
import "./RiskAssessment.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

export default function RiskAssessment({ data, onExport, onFilterChange, autoRefresh = false }) {
  // State Management
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRisks, setFilteredRisks] = useState([]);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [timeRange, setTimeRange] = useState("30days");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("table");
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [stats, setStats] = useState({});
  const [trendData, setTrendData] = useState([]);

  // Initialize
  useEffect(() => {
    if (data) {
      processRiskData(data);
    } else {
      fetchRisks();
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchRisks();
      }, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Apply filters when risks or filters change
  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [risks, searchTerm, riskLevelFilter, departmentFilter]);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      // Replace with your API endpoint
      // const { data } = await axios.get('/api/risk/assessment');
      
      // Mock data for demonstration
      const mockData = generateEnhancedRiskData();
      processRiskData(mockData);
      generateTrendData(mockData);
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
      notification.error({
        message: 'Data Load Failed',
        description: 'Unable to load risk assessment data.',
        duration: 5
      });
      processRiskData(generateEnhancedRiskData());
    } finally {
      setLoading(false);
    }
  };

  const generateEnhancedRiskData = () => {
    return {
      departmentStats: [
        { 
          department: 'Emergency', 
          risk: 78, 
          incidents: 45, 
          compliance: 76,
          trend: 'rising',
          change: '+12%',
          category: 'Clinical',
          severity: 'High',
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          factors: ['Staff Shortage', 'High Volume', 'Complex Cases']
        },
        { 
          department: 'Surgery', 
          risk: 71, 
          incidents: 32, 
          compliance: 82,
          trend: 'stable',
          change: '+3%',
          category: 'Clinical',
          severity: 'High',
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          factors: ['Equipment Issues', 'Long Procedures']
        },
        { 
          department: 'ICU', 
          risk: 65, 
          incidents: 28, 
          compliance: 89,
          trend: 'falling',
          change: '-8%',
          category: 'Clinical',
          severity: 'Medium',
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          factors: ['Critical Care', 'Infection Risk']
        },
        { 
          department: 'Lab', 
          risk: 48, 
          incidents: 12, 
          compliance: 93,
          trend: 'stable',
          change: '+2%',
          category: 'Support',
          severity: 'Medium',
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
          factors: ['Sample Processing', 'Equipment Calibration']
        },
        { 
          department: 'Pharmacy', 
          risk: 35, 
          incidents: 7, 
          compliance: 96,
          trend: 'falling',
          change: '-15%',
          category: 'Support',
          severity: 'Low',
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          factors: ['Medication Errors', 'Inventory Management']
        },
        { 
          department: 'Radiology', 
          risk: 42, 
          incidents: 15, 
          compliance: 91,
          trend: 'stable',
          change: '+1%',
          category: 'Diagnostic',
          severity: 'Low',
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
          factors: ['Radiation Safety', 'Equipment Maintenance']
        },
        { 
          department: 'Pediatrics', 
          risk: 55, 
          incidents: 21, 
          compliance: 87,
          trend: 'rising',
          change: '+7%',
          category: 'Clinical',
          severity: 'Medium',
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
          factors: ['Patient Safety', 'Specialized Care']
        },
        { 
          department: 'Administration', 
          risk: 28, 
          incidents: 5, 
          compliance: 98,
          trend: 'stable',
          change: '0%',
          category: 'Administrative',
          severity: 'Low',
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          factors: ['Data Security', 'Compliance']
        }
      ],
      overallRisk: 52.5,
      highRiskDepartments: 2,
      totalIncidents: 165,
      avgCompliance: 89.0
    };
  };

  const processRiskData = (riskData) => {
    const processedRisks = riskData.departmentStats?.map(dept => ({
      key: dept.department,
      department: dept.department,
      riskScore: dept.risk,
      riskLevel: getRiskLevel(dept.risk),
      incidents: dept.incidents,
      compliance: dept.compliance,
      trend: dept.trend || (dept.risk > 70 ? 'rising' : dept.risk > 50 ? 'stable' : 'falling'),
      change: dept.change || '0%',
      category: dept.category || 'Unknown',
      severity: dept.severity || getRiskLevel(dept.risk),
      lastUpdated: dept.lastUpdated || new Date().toISOString(),
      factors: dept.factors || []
    })) || [];
    
    setRisks(processedRisks);
  };

  const generateTrendData = (riskData) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends = months.map((month, index) => ({
      month,
      emergency: 75 + Math.random() * 10,
      surgery: 68 + Math.random() * 8,
      icu: 60 + Math.random() * 10,
      lab: 45 + Math.random() * 10,
      pharmacy: 30 + Math.random() * 10,
      average: 55 + Math.random() * 5
    }));
    setTrendData(trends);
  };

  const applyFilters = () => {
    let filtered = [...risks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(risk =>
        risk.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk level filter
    if (riskLevelFilter !== "all") {
      filtered = filtered.filter(risk => risk.riskLevel === riskLevelFilter);
    }

    // Department filter
    if (departmentFilter.length > 0) {
      filtered = filtered.filter(risk => departmentFilter.includes(risk.department));
    }

    setFilteredRisks(filtered);
  };

  const calculateStats = () => {
    const stats = {
      total: risks.length,
      highRisk: risks.filter(r => r.riskLevel === 'High').length,
      mediumRisk: risks.filter(r => r.riskLevel === 'Medium').length,
      lowRisk: risks.filter(r => r.riskLevel === 'Low').length,
      totalIncidents: risks.reduce((sum, risk) => sum + risk.incidents, 0),
      avgCompliance: (risks.reduce((sum, risk) => sum + risk.compliance, 0) / risks.length).toFixed(1),
      avgRisk: (risks.reduce((sum, risk) => sum + risk.riskScore, 0) / risks.length).toFixed(1),
      trendingUp: risks.filter(r => r.trend === 'rising').length,
      trendingDown: risks.filter(r => r.trend === 'falling').length
    };
    setStats(stats);
  };

  // Helper functions
  const getRiskLevel = (score) => {
    if (score >= 70) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return '#ff4d4f';
      case 'Medium': return '#fa8c16';
      case 'Low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rising':
        return <ArrowUpOutlined style={{ color: '#ff4d4f' }} />;
      case 'falling':
        return <ArrowDownOutlined style={{ color: '#52c41a' }} />;
      default:
        return <span style={{ color: '#fa8c16' }}>—</span>;
    }
  };

  const getRiskStatus = (score) => {
    if (score >= 70) return 'exception';
    if (score >= 50) return 'active';
    return 'success';
  };

  // Enhanced columns
  const columns = [
    {
      title: (
        <Space>
          <ClusterOutlined />
          <span>Department</span>
        </Space>
      ),
      dataIndex: "department",
      key: "department",
      width: 150,
      render: (text, record) => (
        <Space>
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: getRiskColor(record.riskLevel),
            marginRight: 8 
          }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>{record.category}</Text>
          </div>
        </Space>
      )
    },
    {
      title: "Risk Score",
      dataIndex: "riskScore",
      key: "riskScore",
      width: 180,
      render: (score, record) => (
        <div style={{ minWidth: 120 }}>
          <Progress 
            percent={score} 
            status={getRiskStatus(score)}
            strokeColor={getRiskColor(record.riskLevel)}
            size="small"
            showInfo={false}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: 12,
            marginTop: 4
          }}>
            <span>{score}%</span>
            <span style={{ 
              color: getRiskColor(record.riskLevel),
              fontWeight: 500 
            }}>
              {record.riskLevel}
            </span>
          </div>
        </div>
      )
    },
    {
      title: "Risk Level",
      dataIndex: "riskLevel",
      key: "riskLevel",
      width: 120,
      render: (level) => (
        <Tag 
          color={getRiskColor(level)} 
          style={{ 
            fontWeight: 500,
            border: 'none',
            padding: '2px 12px',
            borderRadius: 12
          }}
        >
          {level}
        </Tag>
      )
    },
    {
      title: "Incidents",
      dataIndex: "incidents",
      key: "incidents",
      width: 100,
      render: (incidents) => (
        <Badge 
          count={incidents} 
          style={{ 
            backgroundColor: incidents > 20 ? '#ff4d4f' : incidents > 10 ? '#fa8c16' : '#52c41a'
          }}
        />
      )
    },
    {
      title: "Compliance",
      dataIndex: "compliance",
      key: "compliance",
      width: 120,
      render: (compliance) => (
        <Progress 
          percent={compliance} 
          size="small" 
          strokeColor={
            compliance >= 90 ? '#52c41a' :
            compliance >= 80 ? '#fa8c16' : '#ff4d4f'
          }
          format={() => `${compliance}%`}
        />
      )
    },
    {
      title: "Trend",
      key: "trend",
      width: 100,
      render: (_, record) => (
        <Space>
          {getTrendIcon(record.trend)}
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.change}
          </Text>
        </Space>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setSelectedRisk(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Export Report">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleExportDepartment(record)}
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleExportDepartment = (department) => {
    notification.info({
      message: 'Export Started',
      description: `Exporting risk report for ${department.department}`,
      duration: 3
    });
    onExport?.(department);
  };

  const handleBulkExport = () => {
    if (selectedRows.length === 0) {
      notification.warning({
        message: 'No Selection',
        description: 'Please select departments to export',
        duration: 3
      });
      return;
    }
    
    notification.info({
      message: 'Bulk Export Started',
      description: `Exporting ${selectedRows.length} department reports`,
      duration: 3
    });
    onExport?.(selectedRows);
  };

  // Chart renderers
  const renderRiskDistributionChart = () => {
    const distribution = [
      { name: 'High Risk', value: stats.highRisk || 0, color: '#ff4d4f' },
      { name: 'Medium Risk', value: stats.mediumRisk || 0, color: '#fa8c16' },
      { name: 'Low Risk', value: stats.lowRisk || 0, color: '#52c41a' }
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={distribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            innerRadius={40}
            paddingAngle={5}
            dataKey="value"
          >
            {distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value) => [`${value} departments`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderTrendChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="emergency" 
            stroke="#ff4d4f" 
            strokeWidth={2}
            name="Emergency"
          />
          <Line 
            type="monotone" 
            dataKey="surgery" 
            stroke="#fa8c16" 
            strokeWidth={2}
            name="Surgery"
          />
          <Line 
            type="monotone" 
            dataKey="average" 
            stroke="#1890ff" 
            strokeWidth={3}
            strokeDasharray="5 5"
            name="Average"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderRadarChart = () => {
    const radarData = filteredRisks.slice(0, 6).map(dept => ({
      subject: dept.department.substring(0, 3),
      risk: dept.riskScore,
      compliance: dept.compliance,
      incidents: dept.incidents * 5,
      fullMark: 100
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar 
            name="Risk Score" 
            dataKey="risk" 
            stroke="#ff4d4f" 
            fill="#ff4d4f" 
            fillOpacity={0.6} 
          />
          <Radar 
            name="Compliance" 
            dataKey="compliance" 
            stroke="#52c41a" 
            fill="#52c41a" 
            fillOpacity={0.6} 
          />
          <Legend />
          <RechartsTooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderScatterChart = () => {
    const scatterData = filteredRisks.map(dept => ({
      x: dept.riskScore,
      y: dept.compliance,
      z: dept.incidents * 10,
      name: dept.department
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Risk Score" 
            domain={[0, 100]}
            label={{ value: 'Risk Score', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Compliance %" 
            domain={[0, 100]}
            label={{ value: 'Compliance %', angle: -90, position: 'insideLeft' }}
          />
          <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Incidents" />
          <RechartsTooltip 
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name) => {
              if (name === 'x') return [`${value}`, 'Risk Score'];
              if (name === 'y') return [`${value}%`, 'Compliance'];
              return [value, name];
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
      </ResponsiveContainer>
    );
  };

  // Detailed risk modal
  const renderRiskDetails = () => {
    if (!selectedRisk) return null;

    return (
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: getRiskColor(selectedRisk.riskLevel) }} />
            <span>Risk Assessment Details</span>
          </Space>
        }
        open={!!selectedRisk}
        onCancel={() => setSelectedRisk(null)}
        width={700}
        footer={null}
      >
        <div className="risk-details">
          <Row gutter={[24, 16]}>
            <Col span={24}>
              <div className="risk-header">
                <Title level={3} style={{ margin: 0 }}>
                  {selectedRisk.department}
                </Title>
                <Tag 
                  color={getRiskColor(selectedRisk.riskLevel)} 
                  style={{ fontSize: 14, padding: '4px 16px' }}
                >
                  {selectedRisk.riskLevel} Risk
                </Tag>
              </div>
            </Col>

            <Col span={8}>
              <Card size="small" title="Risk Score">
                <Statistic
                  value={selectedRisk.riskScore}
                  suffix="%"
                  valueStyle={{ color: getRiskColor(selectedRisk.riskLevel), fontSize: 32 }}
                />
                <Progress 
                  percent={selectedRisk.riskScore} 
                  status={getRiskStatus(selectedRisk.riskScore)}
                  strokeColor={getRiskColor(selectedRisk.riskLevel)}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>

            <Col span={8}>
              <Card size="small" title="Compliance">
                <Statistic
                  value={selectedRisk.compliance}
                  suffix="%"
                  valueStyle={{ 
                    color: selectedRisk.compliance >= 90 ? '#52c41a' : '#fa8c16',
                    fontSize: 32 
                  }}
                />
                <Text type="secondary">Department average</Text>
              </Card>
            </Col>

            <Col span={8}>
              <Card size="small" title="Incidents">
                <Statistic
                  value={selectedRisk.incidents}
                  valueStyle={{ fontSize: 32 }}
                />
                <Text type="secondary">Last 30 days</Text>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="Trend Analysis">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Current Trend</Text>
                    <Space>
                      {getTrendIcon(selectedRisk.trend)}
                      <Text strong>{selectedRisk.change}</Text>
                    </Space>
                  </div>
                  <Timeline>
                    <Timeline.Item color="green">
                      <Text>Last Month: {Math.round(selectedRisk.riskScore * 0.9)}% risk</Text>
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <Text>Current: {selectedRisk.riskScore}% risk</Text>
                    </Timeline.Item>
                    <Timeline.Item color={selectedRisk.trend === 'rising' ? 'red' : 'green'}>
                      <Text>Projected: {selectedRisk.trend === 'rising' ? 'Increase' : 'Decrease'}</Text>
                    </Timeline.Item>
                  </Timeline>
                </Space>
              </Card>
            </Col>

            {selectedRisk.factors && selectedRisk.factors.length > 0 && (
              <Col span={24}>
                <Card size="small" title="Risk Factors">
                  <Space wrap>
                    {selectedRisk.factors.map((factor, index) => (
                      <Tag key={index} color="red" style={{ margin: '4px' }}>
                        {factor}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
            )}

            <Col span={24}>
              <Card size="small" title="Recommendations">
                <Alert
                  message={
                    selectedRisk.riskLevel === 'High' 
                      ? 'Immediate Action Required'
                      : selectedRisk.riskLevel === 'Medium'
                      ? 'Monitor and Plan Actions'
                      : 'Maintain Current Practices'
                  }
                  description={
                    selectedRisk.riskLevel === 'High'
                      ? 'Implement risk mitigation strategies immediately. Consider additional training and process reviews.'
                      : selectedRisk.riskLevel === 'Medium'
                      ? 'Schedule risk assessment review. Monitor key indicators regularly.'
                      : 'Continue current practices with regular monitoring.'
                  }
                  type={
                    selectedRisk.riskLevel === 'High' ? 'error'
                    : selectedRisk.riskLevel === 'Medium' ? 'warning'
                    : 'success'
                  }
                  showIcon
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div className="risk-loading">
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>Loading risk assessment data...</Text>
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <Card className="risk-empty">
        <Empty
          description={
            <div>
              <Title level={4}>No Risk Data Available</Title>
              <Text type="secondary">
                Connect to your data source to view risk assessment analytics
              </Text>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div className="risk-assessment">
      {/* Header */}
      <Card className="risk-header-card">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <div className="header-content">
              <Title level={2}>Risk Assessment Dashboard</Title>
              <Text type="secondary">Monitor and analyze risk levels across departments</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Switch
                checked={showAdvanced}
                onChange={setShowAdvanced}
                checkedChildren="Advanced"
                unCheckedChildren="Basic"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRisks}
                loading={loading}
              />
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={() => onExport && onExport('risk')}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={3}>
          <Card size="small" className="stat-card">
            <Statistic
              title="Overall Risk"
              value={stats.avgRisk || 0}
              suffix="%"
              valueStyle={{ color: getRiskColor(getRiskLevel(stats.avgRisk)) }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Card size="small" className="stat-card">
            <Statistic
              title="High Risk"
              value={stats.highRisk || 0}
              suffix={`/ ${stats.total}`}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Card size="small" className="stat-card">
            <Statistic
              title="Total Incidents"
              value={stats.totalIncidents || 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Card size="small" className="stat-card">
            <Statistic
              title="Avg Compliance"
              value={stats.avgCompliance || 0}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Card size="small" className="stat-card">
            <Statistic
              title="Trending Up"
              value={stats.trendingUp || 0}
              suffix={`/ ${stats.total}`}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Card size="small" className="stat-card">
            <Statistic
              title="Trending Down"
              value={stats.trendingDown || 0}
              suffix={`/ ${stats.total}`}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="risk-filters" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search departments..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
              allowClear
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={riskLevelFilter}
              onChange={setRiskLevelFilter}
              style={{ width: '100%' }}
              placeholder="Risk Level"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Levels</Option>
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
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
              {risks.map(risk => (
                <Option key={risk.department} value={risk.department}>
                  {risk.department}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: '100%' }}
              placeholder="Time Range"
              suffixIcon={<CalendarOutlined />}
            >
              <Option value="7days">Last 7 Days</Option>
              <Option value="30days">Last 30 Days</Option>
              <Option value="90days">Last 90 Days</Option>
              <Option value="year">Last Year</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              style={{ width: '100%' }}
              onClick={() => {
                setSearchTerm("");
                setRiskLevelFilter("all");
                setDepartmentFilter([]);
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>

        {showAdvanced && (
          <div style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Risk Threshold: </Text>
                <Slider
                  value={riskThreshold}
                  onChange={setRiskThreshold}
                  min={0}
                  max={100}
                  style={{ width: 200, margin: '0 16px' }}
                />
                <Text>{riskThreshold}%</Text>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginTop: 24 }}
        items={[
          {
            key: 'table',
            label: (
              <span>
                <BarChartOutlined />
                Table View
              </span>
            )
          },
          {
            key: 'distribution',
            label: (
              <span>
                <PieChartOutlined />
                Distribution
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
            key: 'analysis',
            label: (
              <span>
                <HeatMapOutlined />
                Analysis
              </span>
            )
          }
        ]}
      />

      {/* Main Content */}
      {activeTab === 'table' && (
        <Card title="Department Risk Assessment">
          <div className="table-header">
            <Space>
              {selectedRows.length > 0 && (
                <Badge count={selectedRows.length} style={{ backgroundColor: '#1890ff' }}>
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleBulkExport}
                    size="small"
                  >
                    Export Selected
                  </Button>
                </Badge>
              )}
              <Text type="secondary">
                Showing {filteredRisks.length} of {risks.length} departments
              </Text>
            </Space>
          </div>
          
          <Table
            columns={columns}
            dataSource={filteredRisks}
            rowKey="key"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} departments`
            }}
            rowSelection={{
              selectedRowKeys: selectedRows,
              onChange: setSelectedRows,
              getCheckboxProps: (record) => ({
                disabled: record.riskLevel === 'Low'
              })
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
      )}

      {activeTab === 'distribution' && (
        <Card title="Risk Distribution Analysis">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Risk Level Distribution">
                {renderRiskDistributionChart()}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Department Comparison">
                {renderRadarChart()}
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {activeTab === 'trends' && (
        <Card title="Risk Trend Analysis">
          {renderTrendChart()}
          <Divider />
          <Alert
            message="Trend Analysis"
            description="This chart shows risk trends over time for key departments. Monitor these trends to identify emerging risks."
            type="info"
            showIcon
          />
        </Card>
      )}

      {activeTab === 'analysis' && (
        <Card title="Risk-Compliance Matrix">
          {renderScatterChart()}
          <Divider />
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Title level={4}>Matrix Interpretation</Title>
              <Text>
                This scatter plot shows the relationship between risk scores and compliance rates.
                Departments in the bottom-right quadrant have high compliance but also high risk,
                indicating potential hidden risks in otherwise compliant processes.
              </Text>
            </Col>
          </Row>
        </Card>
      )}

      {/* Risk Details Modal */}
      {renderRiskDetails()}
    </div>
  );
}