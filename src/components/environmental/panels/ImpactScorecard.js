// src/components/environmental/panels/ImpactScorecard.js

import React, { useState, useEffect } from 'react';
import {
  Card, List, Progress, Tag, Row, Col, Statistic,
  Button, Space, Divider, Tooltip, Badge, Empty,
  Spin, Alert, Collapse, Timeline, Tabs, message,
  Switch, Modal, Descriptions
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  GlobalOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  HeatMapOutlined,
  DashboardOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  RadarChartOutlined,
  WarningOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ComposedChart, ResponsiveContainer, Cell, Scatter
} from 'recharts';
import advancedEnvironmentalService from '../../../services/advancedEnvironmentalService';
import './ImpactScorecard.css';

const { Panel } = Collapse;
const { TabPane } = Tabs;

// Color palette
const COLORS = {
  green: ['#52c41a', '#95de64', '#b7eb8f', '#d9f7be'],
  blue: ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff'],
  red: ['#f5222d', '#ff4d4f', '#ff7875', '#ffa39e'],
  orange: ['#faad14', '#ffc53d', '#ffd666', '#ffe58f'],
  purple: ['#722ed1', '#9254de', '#b37feb', '#d3adf7'],
  cyan: ['#13c2c2', '#36cfc9', '#5cdbd3', '#87e8de']
};

const ImpactScorecard = ({ data: initialData, onRefresh, loading: parentLoading }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterImpact, setFilterImpact] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    impactDistribution: [],
    categoryScores: [],
    weeklyTrend: [],
    radarData: []
  });

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setData(initialData);
      generateChartData(initialData);
    } else {
      loadData();
    }

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData();
      }, 120000);
      return () => clearInterval(interval);
    }
  }, [initialData, autoRefresh]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await advancedEnvironmentalService.getImpactScorecard();
      if (response && response.length > 0) {
        setData(response);
        generateChartData(response);
        message.success('Impact data loaded successfully');
      } else {
        setData([]);
        setChartData({
          impactDistribution: [],
          categoryScores: [],
          weeklyTrend: [],
          radarData: []
        });
        message.info('No impact data available');
      }
    } catch (error) {
      console.error('Failed to load impact data:', error);
      setError(error.message || 'Failed to load impact data');
      setData([]);
      setChartData({
        impactDistribution: [],
        categoryScores: [],
        weeklyTrend: [],
        radarData: []
      });
      message.error('Failed to load impact data');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (data) => {
    if (!data || data.length === 0) {
      setChartData({
        impactDistribution: [],
        categoryScores: [],
        weeklyTrend: [],
        radarData: []
      });
      return;
    }

    // Impact Distribution
    const distribution = {};
    data.forEach(item => {
      const impact = item.impact || item.risk_level || 'unknown';
      distribution[impact] = (distribution[impact] || 0) + 1;
    });
    const impactDistribution = Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // Category Scores
    const categoryScores = data.map(item => ({
      category: item.category || item.name || 'Unnamed',
      score: item.score || item.impact_score || item.risk_score || 0,
      impact: item.impact || item.risk_level || 'unknown'
    })).sort((a, b) => (b.score || 0) - (a.score || 0));

    // Weekly Trend (simulated from data)
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const weeklyTrend = weeks.map((week, index) => {
      const weekData = { week };
      data.forEach(item => {
        const category = item.category || item.name || 'Unnamed';
        const baseScore = item.score || item.impact_score || item.risk_score || 50;
        // Use actual data variation if available, otherwise simulate slight variation
        const variation = item.trend_data && item.trend_data[index] 
          ? (item.trend_data[index] - baseScore) 
          : (Math.random() - 0.5) * 10;
        weekData[category] = Math.max(0, Math.min(100, baseScore + variation));
      });
      return weekData;
    });

    // Radar Data
    const radarData = data.map(item => ({
      subject: item.category || item.name || 'Unnamed',
      score: item.score || item.impact_score || item.risk_score || 0,
      fullMark: 100
    }));

    setChartData({
      impactDistribution,
      categoryScores,
      weeklyTrend,
      radarData
    });
  };

  const handleRefresh = () => {
    loadData();
    if (onRefresh) onRefresh();
  };

  const getTrendIcon = (trend) => {
    if (!trend) return <MinusOutlined style={{ color: '#faad14' }} />;
    const trendLower = trend.toLowerCase();
    if (trendLower === 'improving' || trendLower === 'improved' || trendLower === 'positive') {
      return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    } else if (trendLower === 'declining' || trendLower === 'declined' || trendLower === 'negative') {
      return <ArrowDownOutlined style={{ color: '#f5222d' }} />;
    } else {
      return <MinusOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getImpactColor = (impact) => {
    if (!impact) return 'blue';
    const impactLower = impact.toLowerCase();
    if (impactLower === 'high' || impactLower === 'critical' || impactLower === 'severe') {
      return 'red';
    } else if (impactLower === 'medium' || impactLower === 'moderate') {
      return 'orange';
    } else if (impactLower === 'low' || impactLower === 'minor') {
      return 'green';
    } else {
      return 'blue';
    }
  };

  const getScoreColor = (score) => {
    const safeScore = score || 0;
    if (safeScore >= 80) return '#52c41a';
    if (safeScore >= 60) return '#faad14';
    return '#f5222d';
  };

  const getScoreStatus = (score) => {
    const safeScore = score || 0;
    if (safeScore >= 80) return 'Excellent';
    if (safeScore >= 60) return 'Good';
    if (safeScore >= 40) return 'Moderate';
    return 'Poor';
  };

  const handleCategoryClick = (item) => {
    setSelectedCategory(item);
    setDetailModalVisible(true);
  };

  const getFilteredData = () => {
    if (filterImpact === 'all') return data;
    return data.filter(item => {
      const impact = item.impact || item.risk_level || '';
      return impact.toLowerCase() === filterImpact;
    });
  };

  const formatString = (str) => {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Calculate statistics
  const overallScore = data.length > 0
    ? data.reduce((sum, item) => sum + (item.score || item.impact_score || item.risk_score || 0), 0) / data.length
    : 0;

  const highImpactCount = data.filter(item => {
    const impact = item.impact || item.risk_level || '';
    return impact.toLowerCase() === 'high' || impact.toLowerCase() === 'critical' || impact.toLowerCase() === 'severe';
  }).length;

  const improvingCount = data.filter(item => {
    const trend = item.trend || '';
    return trend.toLowerCase() === 'improving' || trend.toLowerCase() === 'improved' || trend.toLowerCase() === 'positive';
  }).length;

  const totalScore = data.reduce((sum, item) => sum + (item.score || item.impact_score || item.risk_score || 0), 0);
  const averageScore = data.length > 0 ? totalScore / data.length : 0;

  // Loading state
  if (loading) {
    return (
      <div className="impact-loading" style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading impact data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="impact-error" style={{ textAlign: 'center', padding: '40px' }}>
        <Alert
          message="Error Loading Data"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="impact-empty" style={{ textAlign: 'center', padding: '60px' }}>
        <Empty
          description="No impact data available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleRefresh}>
            <ReloadOutlined /> Refresh
          </Button>
        </Empty>
      </div>
    );
  }

  // Render Charts
  const renderImpactDistribution = () => (
    <Card size="small" title="📊 Impact Distribution" className="chart-card">
      {chartData.impactDistribution.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData.impactDistribution}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.impactDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.name === 'High' ? '#f5222d' : entry.name === 'Medium' ? '#faad14' : '#52c41a'}
                />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Empty description="No distribution data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );

  const renderCategoryScores = () => (
    <Card size="small" title="📈 Category Scores" className="chart-card">
      {chartData.categoryScores.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.categoryScores} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="category" width={80} fontSize={10} />
            <RechartsTooltip />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {chartData.categoryScores.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Empty description="No score data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );

  const renderRadarChart = () => (
    <Card size="small" title="🎯 Radar Analysis" className="chart-card">
      {chartData.radarData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={chartData.radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Impact Score"
              dataKey="score"
              stroke="#1890ff"
              fill="#1890ff"
              fillOpacity={0.3}
            />
            <RechartsTooltip />
          </RadarChart>
        </ResponsiveContainer>
      ) : (
        <Empty description="No radar data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );

  const renderWeeklyTrend = () => (
    <Card size="small" title="📅 Weekly Trend" className="chart-card">
      {chartData.weeklyTrend.length > 0 && chartData.weeklyTrend[0] && Object.keys(chartData.weeklyTrend[0]).filter(key => key !== 'week').length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData.weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 100]} />
            <RechartsTooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {chartData.weeklyTrend.length > 0 && Object.keys(chartData.weeklyTrend[0]).filter(key => key !== 'week').map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS.blue[index % COLORS.blue.length]}
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Empty description="No trend data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );

  return (
    <div className="impact-scorecard">
      {/* Header */}
      <div className="impact-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="impact-header-title">
          <Space>
            <GlobalOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <h2 style={{ margin: 0 }}>Environmental Impact Scorecard</h2>
            <Badge status="processing" text="Live" />
          </Space>
        </div>
        <div className="impact-header-actions">
          <Space>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
              size="small"
            />
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading || parentLoading}
            >
              Refresh
            </Button>
          </Space>
        </div>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small" className="stat-card stat-card-green">
            <Statistic
              title="Overall Score"
              value={Math.round(overallScore)}
              suffix="/100"
              valueStyle={{ color: getScoreColor(overallScore) }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="stat-card stat-card-red">
            <Statistic
              title="High Impact Areas"
              value={highImpactCount}
              valueStyle={{ color: '#f5222d' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="stat-card stat-card-green">
            <Statistic
              title="Improving Metrics"
              value={improvingCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="stat-card stat-card-blue">
            <Statistic
              title="Total Categories"
              value={data.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <div className="impact-filter" style={{ marginBottom: 16 }}>
        <Space>
          <span style={{ fontWeight: 500 }}>Filter by Impact:</span>
          <Button
            size="small"
            type={filterImpact === 'all' ? 'primary' : 'default'}
            onClick={() => setFilterImpact('all')}
          >
            All
          </Button>
          <Button
            size="small"
            type={filterImpact === 'high' ? 'primary' : 'default'}
            onClick={() => setFilterImpact('high')}
            danger
          >
            High
          </Button>
          <Button
            size="small"
            type={filterImpact === 'medium' ? 'primary' : 'default'}
            onClick={() => setFilterImpact('medium')}
          >
            Medium
          </Button>
          <Button
            size="small"
            type={filterImpact === 'low' ? 'primary' : 'default'}
            onClick={() => setFilterImpact('low')}
          >
            Low
          </Button>
        </Space>
      </div>

      {/* Charts Section */}
      <Tabs defaultActiveKey="list" className="impact-tabs">
        <TabPane
          tab={<span><DashboardOutlined /> Dashboard</span>}
          key="dashboard"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderImpactDistribution()}
            </Col>
            <Col xs={24} lg={12}>
              {renderCategoryScores()}
            </Col>
            <Col xs={24} lg={12}>
              {renderRadarChart()}
            </Col>
            <Col xs={24} lg={12}>
              {renderWeeklyTrend()}
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={<span><CheckOutlined /> List View</span>}
          key="list"
        >
          <div className="impact-list">
            <List
              dataSource={getFilteredData()}
              renderItem={(item) => {
                // Safely get values with defaults
                const trend = item.trend || item.trend_status || 'stable';
                const impact = item.impact || item.risk_level || 'unknown';
                const category = item.category || item.name || 'Unnamed';
                const score = item.score || item.impact_score || item.risk_score || 0;
                const description = item.description || item.summary || 'No description available';
                
                return (
                  <List.Item
                    className="impact-list-item"
                    onClick={() => handleCategoryClick(item)}
                    style={{ cursor: 'pointer' }}
                    actions={[
                      <div className="impact-trend" key="trend">
                        {getTrendIcon(trend)}
                        <span style={{ marginLeft: 4, fontSize: 12 }}>
                          {formatString(trend)}
                        </span>
                      </div>,
                      <Tag color={getImpactColor(impact)} key="impact">
                        {impact.toUpperCase()} Impact
                      </Tag>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Progress
                          type="circle"
                          percent={score}
                          size={50}
                          strokeColor={getScoreColor(score)}
                          format={(p) => (
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600 }}>{p}</div>
                              <div style={{ fontSize: 8, color: '#8c8c8c' }}>score</div>
                            </div>
                          )}
                        />
                      }
                      title={
                        <div className="impact-title">
                          <span>{category}</span>
                          <Tag color={getScoreColor(score)}>
                            {getScoreStatus(score)}
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="impact-description">
                          <div>{description}</div>
                          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                            Click for details
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </div>
        </TabPane>
      </Tabs>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <span>{selectedCategory?.category || selectedCategory?.name || 'Unknown Category'}</span>
            <Tag color={getImpactColor(selectedCategory?.impact || selectedCategory?.risk_level)}>
              {(selectedCategory?.impact || selectedCategory?.risk_level || 'UNKNOWN').toUpperCase()} Impact
            </Tag>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button key="view" type="primary" onClick={() => {
            setDetailModalVisible(false);
            message.info('Opening detailed report...');
          }}>
            View Full Report
          </Button>
        ]}
        width={600}
      >
        {selectedCategory && (
          <div className="impact-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Score"
                    value={selectedCategory.score || selectedCategory.impact_score || selectedCategory.risk_score || 0}
                    suffix="/100"
                    valueStyle={{ color: getScoreColor(selectedCategory.score || selectedCategory.impact_score || selectedCategory.risk_score) }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Status"
                    value={getScoreStatus(selectedCategory.score || selectedCategory.impact_score || selectedCategory.risk_score)}
                    valueStyle={{ color: getScoreColor(selectedCategory.score || selectedCategory.impact_score || selectedCategory.risk_score) }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Category">
                {selectedCategory.category || selectedCategory.name || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Impact Level">
                <Tag color={getImpactColor(selectedCategory.impact || selectedCategory.risk_level)}>
                  {(selectedCategory.impact || selectedCategory.risk_level || 'UNKNOWN').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trend">
                {getTrendIcon(selectedCategory.trend || selectedCategory.trend_status)}
                <span style={{ marginLeft: 8 }}>
                  {formatString(selectedCategory.trend || selectedCategory.trend_status)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedCategory.description || selectedCategory.summary || 'No description available'}
              </Descriptions.Item>
              <Descriptions.Item label="Details">
                {selectedCategory.details || selectedCategory.full_description || 'No additional details available'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={selectedCategory.score || selectedCategory.impact_score || selectedCategory.risk_score || 0}
                strokeColor={getScoreColor(selectedCategory.score || selectedCategory.impact_score || selectedCategory.risk_score)}
                format={(p) => `${p}%`}
              />
              <div style={{ marginTop: 8, fontWeight: 500 }}>
                Overall Impact Score
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Legend */}
      <div className="impact-legend" style={{ marginTop: 16 }}>
        <Card size="small">
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Tag color="red">High Impact</Tag>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Critical areas needing immediate attention
              </div>
            </Col>
            <Col span={8}>
              <Tag color="orange">Medium Impact</Tag>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Important improvement areas
              </div>
            </Col>
            <Col span={8}>
              <Tag color="green">Low Impact</Tag>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Well-managed areas
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default ImpactScorecard;