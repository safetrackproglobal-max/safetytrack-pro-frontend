// src/components/analytics/CostAnalysisModule.js
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Space, Button, Select,
  DatePicker, Divider, Progress, Typography, Tooltip, Badge,
  Alert, List, Avatar, Empty, Modal, Form, Input, InputNumber,
  message, Tabs, Descriptions, Timeline, Segmented, Spin
} from 'antd';
import {
  DollarOutlined, RiseOutlined, FallOutlined, CalculatorOutlined,
  PieChartOutlined, BarChartOutlined, LineChartOutlined,
  WarningOutlined, CheckCircleOutlined, ClockCircleOutlined,
  TeamOutlined, ToolOutlined, MedicineBoxOutlined, BankOutlined,
  SafetyCertificateOutlined, FileTextOutlined, EditOutlined,
  PlusOutlined, DeleteOutlined, DownloadOutlined, InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import dayjs from 'dayjs';

// ✅ SERVICE IMPORT
import notificationService from '../../services/notificationService';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, ChartTitle, ChartTooltip, Legend, Filler
);

const { Text, Title: AntTitle, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// ==================== COST CATEGORIES ====================

const COST_CATEGORIES = {
  direct: {
    label: 'Direct Costs',
    color: '#f5222d',
    icon: <DollarOutlined />,
    subcategories: [
      { id: 'medical_treatment', label: 'Medical Treatment', icon: <MedicineBoxOutlined />, backend_key: 'medical_treatment' },
      { id: 'lost_time_wages', label: 'Lost Time Wages', icon: <ClockCircleOutlined />, backend_key: 'lost_time_wages' },
      { id: 'property_damage', label: 'Property Damage', icon: <ToolOutlined />, backend_key: 'property_damage' },
      { id: 'equipment_damage', label: 'Equipment Damage', icon: <ToolOutlined />, backend_key: 'equipment_damage' },
      { id: 'legal_fees', label: 'Legal Fees', icon: <BankOutlined />, backend_key: 'legal_fees' },
      { id: 'regulatory_fines', label: 'Regulatory Fines', icon: <WarningOutlined />, backend_key: 'regulatory_fines' }
    ]
  },
  indirect: {
    label: 'Indirect Costs',
    color: '#fa8c16',
    icon: <CalculatorOutlined />,
    subcategories: [
      { id: 'investigation_costs', label: 'Investigation Costs', icon: <FileTextOutlined />, backend_key: 'investigation_costs' },
      { id: 'retraining_costs', label: 'Retraining Costs', icon: <TeamOutlined />, backend_key: 'retraining_costs' },
      { id: 'lost_productivity', label: 'Lost Productivity', icon: <BarChartOutlined />, backend_key: 'lost_productivity' },
      { id: 'overtime_costs', label: 'Overtime Costs', icon: <ClockCircleOutlined />, backend_key: 'overtime_costs' },
      { id: 'replacement_labor', label: 'Replacement Labor', icon: <TeamOutlined />, backend_key: 'replacement_labor' },
      { id: 'administrative', label: 'Administrative', icon: <FileTextOutlined />, backend_key: 'administrative' }
    ]
  },
  hidden: {
    label: 'Hidden Costs',
    color: '#722ed1',
    icon: <InfoCircleOutlined />,
    subcategories: [
      { id: 'morale_impact', label: 'Morale Impact', icon: <TeamOutlined />, backend_key: 'morale_impact' },
      { id: 'reputation_damage', label: 'Reputation Damage', icon: <BankOutlined />, backend_key: 'reputation_damage' },
      { id: 'insurance_increase', label: 'Insurance Premium Increase', icon: <SafetyCertificateOutlined />, backend_key: 'insurance_increase' },
      { id: 'customer_impact', label: 'Customer Impact', icon: <TeamOutlined />, backend_key: 'customer_impact' },
      { id: 'recruitment_costs', label: 'Recruitment Costs', icon: <TeamOutlined />, backend_key: 'recruitment_costs' }
    ]
  },
  preventive: {
    label: 'Preventive Investment',
    color: '#52c41a',
    icon: <SafetyCertificateOutlined />,
    subcategories: [
      { id: 'training_programs', label: 'Training Programs', icon: <TeamOutlined />, backend_key: 'training_programs' },
      { id: 'equipment_upgrade', label: 'Equipment Upgrades', icon: <ToolOutlined />, backend_key: 'equipment_upgrade' },
      { id: 'safety_audits', label: 'Safety Audits', icon: <FileTextOutlined />, backend_key: 'safety_audits' },
      { id: 'ppe_investment', label: 'PPE Investment', icon: <SafetyCertificateOutlined />, backend_key: 'ppe_investment' },
      { id: 'consulting', label: 'Safety Consulting', icon: <TeamOutlined />, backend_key: 'consulting' }
    ]
  }
};

// ==================== COST ANALYSIS MODULE ====================

const CostAnalysisModule = ({ incidents = [] }) => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [costModalVisible, setCostModalVisible] = useState(false);
  const [editingCosts, setEditingCosts] = useState(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState('overview');
  const [dateRange, setDateRange] = useState([dayjs().subtract(12, 'month'), dayjs()]);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [incidentCosts, setIncidentCosts] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(null);

  // ==================== FETCH SUMMARY FROM API ====================

  const fetchCostSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange?.[0]) params.start_date = dateRange[0].toISOString();
      if (dateRange?.[1]) params.end_date = dateRange[1].toISOString();
      if (selectedIndustry !== 'all') params.industry = selectedIndustry;

      const response = await notificationService.getCostAnalysisSummary(params);

      const data = response?.summary || response?.data?.summary || response;

      if (data) {
        setSummary(data);
      }
    } catch (error) {
      console.warn('Cost summary API unavailable, using client-side calculation:', error);
      setSummary(null); // Will trigger client-side fallback below
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedIndustry]);

  useEffect(() => {
    if (incidents.length > 0) {
      fetchCostSummary();
    }
  }, [incidents.length, fetchCostSummary]);

  // ==================== CLIENT-SIDE TOTAL CALCULATION (Fallback) ====================

  const totalCosts = useMemo(() => {
    // If we have backend summary, use it
    if (summary) {
      return {
        direct: summary.total_costs?.direct || 0,
        indirect: summary.total_costs?.indirect || 0,
        hidden: summary.total_costs?.hidden || 0,
        preventive: summary.total_costs?.preventive || 0,
        total: summary.total_costs?.total || 0,
        byCategory: summary.by_category || {},
        byIncident: summary.by_incident || [],
        byMonth: summary.by_month || {},
        byDepartment: summary.by_department || {},
        byIndustry: summary.by_industry || {}
      };
    }

    // Fallback: client-side calculation
    let totals = {
      direct: 0,
      indirect: 0,
      hidden: 0,
      preventive: 0,
      total: 0,
      byCategory: {},
      byIncident: [],
      byMonth: {},
      byDepartment: {},
      byIndustry: {}
    };

    // Initialize subcategory totals
    Object.values(COST_CATEGORIES).forEach(cat => {
      cat.subcategories.forEach(sub => {
        totals.byCategory[sub.id] = 0;
      });
    });

    incidents.forEach(incident => {
      const costs = incidentCosts[incident.id] || incident.custom_data?.costs || incident.costs || {};
      
      let incidentTotal = 0;
      
      Object.entries(COST_CATEGORIES).forEach(([catKey, cat]) => {
        cat.subcategories.forEach(sub => {
          const cost = costs[sub.backend_key] || costs[sub.id] || 0;
          totals[catKey] += cost;
          totals.byCategory[sub.id] += cost;
          incidentTotal += cost;
        });
      });

      totals.total += incidentTotal;
      
      if (incidentTotal > 0) {
        totals.byIncident.push({
          ...incident,
          totalCost: incidentTotal,
          costs
        });
      }

      const month = dayjs(incident.date_occurred || incident.created_at).format('YYYY-MM');
      totals.byMonth[month] = (totals.byMonth[month] || 0) + incidentTotal;

      const dept = incident.department || 'Unknown';
      totals.byDepartment[dept] = (totals.byDepartment[dept] || 0) + incidentTotal;

      const industry = incident.industryName || incident.industry_id || 'Unknown';
      totals.byIndustry[industry] = (totals.byIndustry[industry] || 0) + incidentTotal;
    });

    return totals;
  }, [incidents, incidentCosts, summary]);

  // ==================== METRICS ====================

  const metrics = useMemo(() => {
    const totalIncidents = incidents.length;
    const incidentsWithCosts = totalCosts.byIncident.length;
    
    // Use backend metrics if available
    const backendTotal = summary?.total_costs?.total;
    const backendAvg = summary?.average_per_incident;
    const backendRoi = summary?.roi;

    return {
      totalCost: backendTotal || totalCosts.total,
      averageCostPerIncident: backendAvg || (totalIncidents > 0 ? totalCosts.total / totalIncidents : 0),
      directCostRatio: totalCosts.total > 0 ? (totalCosts.direct / totalCosts.total) * 100 : 0,
      indirectCostRatio: totalCosts.total > 0 ? (totalCosts.indirect / totalCosts.total) * 100 : 0,
      hiddenCostRatio: totalCosts.total > 0 ? (totalCosts.hidden / totalCosts.total) * 100 : 0,
      roi: backendRoi || (totalCosts.preventive > 0 
        ? ((totalCosts.direct + totalCosts.indirect) / totalCosts.preventive).toFixed(2)
        : 'N/A'),
      incidentsWithCosts: summary?.incidents_with_costs || incidentsWithCosts,
      costCoverage: totalIncidents > 0 ? (incidentsWithCosts / totalIncidents) * 100 : 0
    };
  }, [totalCosts, incidents, summary]);

  // ==================== SAVE COSTS ====================

  const handleSaveCosts = async (values) => {
    const incidentId = editingCosts?.id || selectedIncident?.id;
    if (!incidentId) {
      message.warning('No incident selected');
      return;
    }

    setSaving(true);
    try {
      // ✅ Map form values to backend field names
      const payload = {};
      Object.entries(COST_CATEGORIES).forEach(([catKey, cat]) => {
        cat.subcategories.forEach(sub => {
          const value = values[sub.id] || 0;
          payload[sub.backend_key] = value;
        });
      });

      const response = await notificationService.updateIncidentCosts(incidentId, payload);

      // Update local state
      setIncidentCosts(prev => ({
        ...prev,
        [incidentId]: values
      }));

      // Refresh summary
      fetchCostSummary();

      message.success('Cost data saved');
      setCostModalVisible(false);
      form.resetFields();
      setEditingCosts(null);
      setSelectedIncident(null);
    } catch (error) {
      console.error('Failed to save costs:', error);
      message.error(error?.message || 'Failed to save cost data');
    } finally {
      setSaving(false);
    }
  };

  // ==================== OPEN EDITOR ====================

  const openCostEditor = async (incident) => {
    setSelectedIncident(incident);
    setEditingCosts(incident);

    // Try to fetch from API first
    try {
      const response = await notificationService.getIncidentCosts(incident.id);
      const costs = response?.costs || response?.data?.costs || response;
      
      if (costs) {
        // Map backend fields to form fields
        const formValues = {};
        Object.entries(COST_CATEGORIES).forEach(([catKey, cat]) => {
          cat.subcategories.forEach(sub => {
            const value = costs[sub.backend_key] || costs[sub.id] || 0;
            formValues[sub.id] = value;
          });
        });
        form.setFieldsValue(formValues);
      }
    } catch (error) {
      // Fallback to incident data
      const existingCosts = incidentCosts[incident.id] || incident.custom_data?.costs || incident.costs || {};
      const formValues = {};
      Object.entries(COST_CATEGORIES).forEach(([catKey, cat]) => {
        cat.subcategories.forEach(sub => {
          formValues[sub.id] = existingCosts[sub.backend_key] || existingCosts[sub.id] || 0;
        });
      });
      form.setFieldsValue(formValues);
    }
    
    setCostModalVisible(true);
  };

  // ==================== GENERATE REPORT ====================

  const handleGenerateReport = async () => {
    try {
      const params = {};
      if (dateRange?.[0]) params.start_date = dateRange[0].toISOString();
      if (dateRange?.[1]) params.end_date = dateRange[1].toISOString();
      if (selectedIndustry !== 'all') params.industry = selectedIndustry;

      const blob = await notificationService.exportCostReport(params, 'pdf');

      if (blob) {
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `cost-report-${dayjs().format('YYYY-MM-DD')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success('Cost report generated');
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      message.info('Cost report generated (fallback)');
    }
  };

  // ==================== FORMAT CURRENCY ====================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // ==================== CHART DATA ====================

  const categoryChartData = {
    labels: ['Direct', 'Indirect', 'Hidden', 'Preventive'],
    datasets: [{
      data: [totalCosts.direct, totalCosts.indirect, totalCosts.hidden, totalCosts.preventive],
      backgroundColor: [
        COST_CATEGORIES.direct.color,
        COST_CATEGORIES.indirect.color,
        COST_CATEGORIES.hidden.color,
        COST_CATEGORIES.preventive.color
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const monthlyTrendData = {
    labels: Object.keys(totalCosts.byMonth).sort().slice(-12),
    datasets: [{
      label: 'Monthly Cost',
      data: Object.keys(totalCosts.byMonth).sort().slice(-12).map(k => totalCosts.byMonth[k]),
      borderColor: '#1890ff',
      backgroundColor: 'rgba(24, 144, 255, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const departmentChartData = {
    labels: Object.keys(totalCosts.byDepartment),
    datasets: [{
      label: 'Cost by Department',
      data: Object.values(totalCosts.byDepartment),
      backgroundColor: '#722ed1',
      borderColor: '#531dab',
      borderWidth: 1
    }]
  };

  const subcategoryChartData = {
    labels: Object.entries(totalCosts.byCategory)
      .filter(([_, value]) => value > 0)
      .map(([key]) => {
        for (const cat of Object.values(COST_CATEGORIES)) {
          const sub = cat.subcategories.find(s => s.id === key);
          if (sub) return sub.label;
        }
        return key;
      }),
    datasets: [{
      label: 'Cost by Category',
      data: Object.entries(totalCosts.byCategory).filter(([_, value]) => value > 0).map(([_, value]) => value),
      backgroundColor: [
        '#f5222d', '#fa541c', '#fa8c16', '#faad14', '#fadb14',
        '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb',
        '#722ed1', '#eb2f96', '#f759ab', '#ff7a45', '#ffc53d'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatCurrency(context.raw)}`
        }
      }
    }
  };

  // ==================== TABLE COLUMNS ====================

  const incidentColumns = [
    {
      title: 'Incident',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.incident_number || `#${record.id}`}
          </Text>
        </Space>
      )
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={
          severity === 'critical' ? 'red' :
          severity === 'high' ? 'orange' :
          severity === 'medium' ? 'gold' : 'green'
        }>
          {severity?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date_occurred',
      key: 'date_occurred',
      render: (date) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Direct',
      key: 'direct',
      render: (_, record) => {
        const costs = record.costs || {};
        const direct = COST_CATEGORIES.direct.subcategories
          .reduce((sum, sub) => sum + (costs[sub.backend_key] || costs[sub.id] || 0), 0);
        return <Text>{formatCurrency(direct)}</Text>;
      }
    },
    {
      title: 'Indirect',
      key: 'indirect',
      render: (_, record) => {
        const costs = record.costs || {};
        const indirect = COST_CATEGORIES.indirect.subcategories
          .reduce((sum, sub) => sum + (costs[sub.backend_key] || costs[sub.id] || 0), 0);
        return <Text>{formatCurrency(indirect)}</Text>;
      }
    },
    {
      title: 'Total Cost',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => (
        <Text strong style={{ color: cost > 10000 ? '#f5222d' : '#1890ff' }}>
          {formatCurrency(cost)}
        </Text>
      ),
      sorter: (a, b) => a.totalCost - b.totalCost
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          size="small" 
          icon={<EditOutlined />}
          onClick={() => openCostEditor(record)}
        >
          Edit Costs
        </Button>
      )
    }
  ];

  // ==================== MAIN RENDER ====================

  return (
    <div>
      {/* Header Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Text type="secondary">View Mode:</Text>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { label: 'Overview', value: 'overview', icon: <PieChartOutlined /> },
                { label: 'By Incident', value: 'incidents', icon: <FileTextOutlined /> },
                { label: 'Breakdown', value: 'breakdown', icon: <BarChartOutlined /> }
              ]}
              style={{ marginTop: 4, display: 'block' }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Text type="secondary">Date Range:</Text>
            <RangePicker 
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Text type="secondary">Industry:</Text>
            <Select
              value={selectedIndustry}
              onChange={setSelectedIndustry}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
            >
              <Option value="all">All Industries</Option>
              <Option value="healthcare">Healthcare</Option>
              <Option value="construction">Construction</Option>
              <Option value="oil_gas">Oil & Gas</Option>
              <Option value="aviation">Aviation</Option>
              <Option value="manufacturing">Manufacturing</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Space style={{ marginTop: 20 }} block>
              <Button 
                type="primary" 
                icon={<CalculatorOutlined />}
                onClick={handleGenerateReport}
              >
                Generate Cost Report
              </Button>
              <Tooltip title="Refresh">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchCostSummary}
                  loading={loading}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Loading state */}
      {loading && !summary ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" tip="Loading cost data..." />
          </div>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title={<Space><DollarOutlined />Total Cost</Space>}
                  value={metrics.totalCost}
                  precision={0}
                  prefix="$"
                  valueStyle={{ color: '#f5222d', fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title={<Space><CalculatorOutlined />Avg per Incident</Space>}
                  value={metrics.averageCostPerIncident}
                  precision={0}
                  prefix="$"
                  valueStyle={{ color: '#1890ff', fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title={<Space><SafetyCertificateOutlined />Safety ROI</Space>}
                  value={metrics.roi}
                  suffix="x"
                  valueStyle={{ color: '#52c41a', fontSize: 24 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Return on preventive investment
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title={<Space><FileTextOutlined />Cost Coverage</Space>}
                  value={metrics.costCoverage}
                  precision={0}
                  suffix="%"
                  valueStyle={{ color: '#722ed1', fontSize: 24 }}
                />
                <Progress 
                  percent={metrics.costCoverage} 
                  size="small" 
                  showInfo={false}
                  strokeColor="#722ed1"
                />
              </Card>
            </Col>
          </Row>

          {/* Content based on view mode */}
          {viewMode === 'overview' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <Card title={<Space><PieChartOutlined />Cost Distribution</Space>}>
                  <div style={{ height: 280 }}>
                    {metrics.totalCost > 0 ? (
                      <Doughnut data={categoryChartData} options={chartOptions} />
                    ) : (
                      <Empty description="No cost data" />
                    )}
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={16}>
                <Card title={<Space><LineChartOutlined />Monthly Cost Trend</Space>}>
                  <div style={{ height: 280 }}>
                    <Line data={monthlyTrendData} options={chartOptions} />
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title={<Space><BarChartOutlined />Cost by Department</Space>}>
                  <div style={{ height: 280 }}>
                    <Bar data={departmentChartData} options={chartOptions} />
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card 
                  title={<Space><CalculatorOutlined />Category Breakdown</Space>}
                  bodyStyle={{ maxHeight: 280, overflow: 'auto' }}
                >
                  <List
                    size="small"
                    dataSource={Object.entries(COST_CATEGORIES)}
                    renderItem={([key, cat]) => {
                      const catTotal = totalCosts[key] || 0;
                      const percentage = metrics.totalCost > 0 
                        ? (catTotal / metrics.totalCost) * 100 
                        : 0;
                      
                      return (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar style={{ backgroundColor: cat.color }} icon={cat.icon} />
                            }
                            title={
                              <Space>
                                <Text strong>{cat.label}</Text>
                                <Text>{formatCurrency(catTotal)}</Text>
                              </Space>
                            }
                            description={
                              <Progress 
                                percent={percentage} 
                                size="small"
                                strokeColor={cat.color}
                                format={(p) => `${Math.round(p)}%`}
                              />
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {viewMode === 'incidents' && (
            <Card 
              title={
                <Space>
                  <FileTextOutlined />
                  Incident Costs
                  <Badge count={totalCosts.byIncident.length} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              }
            >
              <Table
                dataSource={totalCosts.byIncident.sort((a, b) => b.totalCost - a.totalCost)}
                columns={incidentColumns}
                rowKey="id"
                pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} incidents` }}
                size="small"
                summary={(data) => {
                  const total = data.reduce((sum, r) => sum + r.totalCost, 0);
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={5}>
                        <Text strong>Total</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        <Text strong style={{ color: '#f5222d' }}>{formatCurrency(total)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell />
                    </Table.Summary.Row>
                  );
                }}
              />
            </Card>
          )}

          {viewMode === 'breakdown' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Cost by Category" bodyStyle={{ maxHeight: 400, overflow: 'auto' }}>
                  <div style={{ height: 350 }}>
                    <Bar 
                      data={subcategoryChartData} 
                      options={{
                        ...chartOptions,
                        indexAxis: 'y',
                        plugins: {
                          ...chartOptions.plugins,
                          legend: { display: false }
                        }
                      }} 
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Detailed Breakdown" bodyStyle={{ maxHeight: 400, overflow: 'auto' }}>
                  {Object.entries(COST_CATEGORIES).map(([catKey, cat]) => (
                    <div key={catKey} style={{ marginBottom: 16 }}>
                      <Space>
                        <Avatar size="small" style={{ backgroundColor: cat.color }} icon={cat.icon} />
                        <Text strong>{cat.label}</Text>
                        <Tag color={cat.color}>{formatCurrency(totalCosts[catKey])}</Tag>
                      </Space>
                      <List
                        size="small"
                        dataSource={cat.subcategories}
                        renderItem={(sub) => {
                          const cost = totalCosts.byCategory[sub.id] || 0;
                          if (cost === 0) return null;
                          return (
                            <List.Item style={{ paddingLeft: 32 }}>
                              <Space>
                                {sub.icon}
                                <Text>{sub.label}</Text>
                              </Space>
                              <Text strong>{formatCurrency(cost)}</Text>
                            </List.Item>
                          );
                        }}
                      />
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* Cost Editor Modal */}
      <Modal
        title={
          <Space>
            <CalculatorOutlined />
            Edit Costs
            {selectedIncident && (
              <Tag color="blue">{selectedIncident.incident_number || `#${selectedIncident.id}`}</Tag>
            )}
          </Space>
        }
        open={costModalVisible}
        onCancel={() => {
          setCostModalVisible(false);
          form.resetFields();
          setSelectedIncident(null);
          setEditingCosts(null);
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveCosts}>
          {Object.entries(COST_CATEGORIES).map(([catKey, cat]) => (
            <div key={catKey}>
              <Divider orientation="left">
                <Space>
                  <Avatar size="small" style={{ backgroundColor: cat.color }} icon={cat.icon} />
                  {cat.label}
                </Space>
              </Divider>
              <Row gutter={[16, 16]}>
                {cat.subcategories.map(sub => (
                  <Col xs={24} sm={12} key={sub.id}>
                    <Form.Item
                      name={sub.id}
                      label={<Space>{sub.icon}{sub.label}</Space>}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        prefix="$"
                        min={0}
                        step={100}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </div>
          ))}

          <Divider />

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<CheckCircleOutlined />}
                loading={saving}
              >
                Save Costs
              </Button>
              <Button onClick={() => {
                setCostModalVisible(false);
                form.resetFields();
                setSelectedIncident(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CostAnalysisModule;