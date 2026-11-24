// src/components/environmental/panels/ComplianceAutomationPanel.js
import React, { useState, useEffect } from 'react';
import { 
  Card, List, Switch, Alert, Button, Row, Col, Statistic, Tag, message, 
  Timeline, Tabs, Space, Tooltip, Progress, Divider,
  Empty
} from 'antd';
import { 
  CheckCircleOutlined, ClockCircleOutlined, SettingOutlined,
  RiseOutlined, FallOutlined, BarChartOutlined, 
  LineChartOutlined, PieChartOutlined, ThunderboltOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  Line, Bar, Pie, Doughnut, Area, Radar, 
  ComposedChart, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip,
  LineChart as RechartsLine, BarChart as RechartsBar, 
  PieChart as RechartsPie, Cell
} from 'recharts';
import advancedEnvironmentalService from '../../../services/advancedEnvironmentalService';

const { TabPane } = Tabs;

const ComplianceAutomationPanel = ({ data, onSettingsUpdate }) => {
  const [automationData, setAutomationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [chartData, setChartData] = useState({
    complianceTrend: [],
    violationTypes: [],
    categoryPerformance: [],
    riskHeatmap: [],
    predictionAccuracy: [],
    weeklyPerformance: []
  });

  const COLORS = ['#52c41a', '#1890ff', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa541c'];

  useEffect(() => {
    if (data) {
      setAutomationData(data);
      generateChartData(data);
    } else {
      loadAutomationData();
    }
  }, [data]);

  const loadAutomationData = async () => {
    setLoading(true);
    try {
      const response = await advancedEnvironmentalService.getComplianceAutomation();
      
      console.log('🔧 Compliance Automation Response:', response);
      
      let automation = null;
      
      if (response) {
        if (response.automation) {
          automation = response.automation;
        } else if (response.data && response.data.automation) {
          automation = response.data.automation;
        } else if (response.overall_compliance !== undefined) {
          automation = response;
        }
      }
      
      if (automation) {
        setAutomationData(automation);
        generateChartData(automation);
      } else {
        console.warn('No automation data found in response:', response);
        const fallbackData = getFallbackData();
        setAutomationData(fallbackData);
        generateChartData(fallbackData);
      }
      
    } catch (error) {
      console.error('Failed to load automation data:', error);
      message.info(error?.response?.status === 403 ? 'Compliance automation needs a Business or Enterprise plan.' : 'Compliance data could not be loaded.');
      const fallbackData = getFallbackData();
      setAutomationData(fallbackData);
      generateChartData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (data) => {
    // 1. Compliance Trend (Line Chart)
    const trend = data.compliance_trend || [];
    
    // 2. Violation Types (Pie Chart)
    const violations = data.violation_types || [];
    
    // 3. Category Performance (Bar Chart)
    const performance = data.category_performance || [];
    
    // 4. Risk Heatmap Data
    const riskData = data.risk_heatmap || [];
    
    // 5. Prediction Accuracy (Area Chart)
    const accuracy = data.prediction_accuracy || [];
    
    // 6. Weekly Performance (Composed Chart)
    const weekly = data.weekly_performance || [];
    
    setChartData({
      complianceTrend: trend,
      violationTypes: violations,
      categoryPerformance: performance,
      riskHeatmap: riskData,
      predictionAccuracy: accuracy,
      weeklyPerformance: weekly
    });
  };

  const getFallbackData = () => ({ no_data: true, scheduled_reports: [], automation_metrics: {} });

  const handleAutomationToggle = async (enabled) => {
    setAutoMode(enabled);
    try {
      await advancedEnvironmentalService.updateAutomationSettings({
        automation_enabled: enabled
      });
      message.success(`Automation ${enabled ? 'enabled' : 'disabled'}`);
      if (onSettingsUpdate) {
        onSettingsUpdate();
      }
    } catch (error) {
      console.error('Failed to update automation settings:', error);
      message.error('Failed to update automation settings');
      setAutoMode(!enabled);
    }
  };

  const renderComplianceTrend = () => (
    <Card size="small" title="📈 Compliance Trend">
      <ResponsiveContainer width="100%" height={250}>
        <RechartsLine data={chartData.complianceTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[60, 100]} />
          <RechartsTooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="compliance" 
            stroke="#52c41a" 
            strokeWidth={2}
            dot={{ fill: '#52c41a' }}
            activeDot={{ r: 8 }}
          />
        </RechartsLine>
      </ResponsiveContainer>
    </Card>
  );

  const renderViolationTypes = () => (
    <Card size="small" title="📊 Violation Types">
      <ResponsiveContainer width="100%" height={250}>
        <RechartsPie>
          <Pie
            data={chartData.violationTypes}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.violationTypes.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    </Card>
  );

  const renderCategoryPerformance = () => (
    <Card size="small" title="📊 Category Performance">
      <ResponsiveContainer width="100%" height={250}>
        <RechartsBar data={chartData.categoryPerformance} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="category" />
          <RechartsTooltip />
          <Bar 
            dataKey="score" 
            fill="#1890ff" 
            radius={[0, 4, 4, 0]}
          >
            {chartData.categoryPerformance.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.score > 90 ? '#52c41a' : entry.score > 70 ? '#1890ff' : '#faad14'} />
            ))}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    </Card>
  );

  const renderRiskHeatmap = () => (
    <Card size="small" title="🔥 Risk Heatmap">
      <ResponsiveContainer width="100%" height={250}>
        <RechartsBar data={chartData.riskHeatmap}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip />
          <Legend />
          <Bar 
            dataKey="risk" 
            fill="#f5222d" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.riskHeatmap.map((entry, index) => {
              const colors = ['#52c41a', '#faad14', '#f5222d'];
              const color = entry.risk < 30 ? colors[0] : entry.risk < 60 ? colors[1] : colors[2];
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    </Card>
  );

  const renderPredictionAccuracy = () => (
    <Card size="small" title="🎯 AI Prediction Accuracy">
      <ResponsiveContainer width="100%" height={250}>
        <RechartsLine data={chartData.predictionAccuracy}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="model" />
          <YAxis domain={[60, 100]} />
          <RechartsTooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            stroke="#722ed1" 
            strokeWidth={2}
            dot={{ fill: '#722ed1' }}
            fill="#722ed1"
            fillOpacity={0.2}
          />
        </RechartsLine>
      </ResponsiveContainer>
    </Card>
  );

  const renderWeeklyPerformance = () => (
    <Card size="small" title="📅 Weekly Performance">
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData.weeklyPerformance}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis yAxisId="left" domain={[0, 5]} />
          <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
          <RechartsTooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="incidents" fill="#f5222d" barSize={20} name="Incidents" />
          <Bar yAxisId="left" dataKey="resolved" fill="#52c41a" barSize={20} name="Resolved" />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="compliance" 
            stroke="#1890ff" 
            strokeWidth={2} 
            name="Compliance %"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderAIInsights = () => {
    const metrics = automationData?.automation_metrics || {};
    const show = (v) => (v === undefined || v === null || v === 0 ? 'No data' : v);
    return (
      <Card size="small" title="Automation results">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}><Statistic title="Measured accuracy" value={show(metrics.accuracy_rate)} suffix={metrics.accuracy_rate ? '%' : ''} /></Col>
          <Col xs={24} sm={8}><Statistic title="Time saved" value={show(metrics.time_saved_hours)} suffix={metrics.time_saved_hours ? 'hrs' : ''} /></Col>
          <Col xs={24} sm={8}><Statistic title="Compliance change" value={show(metrics.compliance_improvement)} suffix={metrics.compliance_improvement ? '%' : ''} /></Col>
        </Row>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card title="⚖️ Smart Compliance Automation">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading automation data...
        </div>
      </Card>
    );
  }

  if (!automationData) {
    return (
      <Card title="⚖️ Smart Compliance Automation">
        <Alert
          message="No Data Available"
          description="Unable to load compliance automation data. Please try again later."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card 
      title="⚖️ Smart Compliance Automation" 
      extra={
        <Space>
          <Tag color="blue" icon={<ThunderboltOutlined />}>
            {autoMode ? 'Auto Mode' : 'Manual Mode'}
          </Tag>
          <Switch 
            checkedChildren="Auto" 
            unCheckedChildren="Manual" 
            checked={autoMode}
            onChange={handleAutomationToggle}
          />
        </Space>
      }
    >
      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic 
              title="Overall Compliance" 
              value={automationData.overall_compliance ?? 'No data'} 
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic 
              title="Upcoming Deadlines" 
              value={automationData.upcoming_deadlines ?? 'No data'} 
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic 
              title="Active Violations" 
              value={automationData.active_violations ?? 'No data'} 
              valueStyle={{ color: '#f5222d' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic 
              title="Automated Tasks" 
              value={automationData.automated_tasks ?? 'No data'} 
              valueStyle={{ color: '#1890ff' }}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic 
              title="Auto-generated Reports" 
              value={automationData.auto_generated_reports ?? 'No data'} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic 
              title="AI-assisted Reviews" 
              value={automationData.ai_assisted_reviews ?? 'No data'} 
            />
          </Card>
        </Col>
        {automationData.automation_metrics && (
          <>
            <Col xs={12} sm={12} md={6}>
              <Card size="small">
                <Statistic 
                  title="Accuracy Rate" 
                  value={automationData.automation_metrics.accuracy_rate || 0} 
                  suffix="%"
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card size="small">
                <Statistic 
                  title="Time Saved" 
                  value={automationData.automation_metrics.time_saved_hours || 0} 
                  suffix="hrs"
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      <Alert
        message={`Automation Status: ${autoMode ? 'Active' : 'Disabled'}`}
        description={
          autoMode 
            ? "Compliance dates and reports are checked automatically. Check every result before you rely on it."
            : "Manual mode - reports and compliance checks require manual intervention"
        }
        type={autoMode ? "success" : "warning"}
        showIcon
        style={{ marginBottom: 16 }}
      />

      {Object.values(chartData).some((x) => Array.isArray(x) && x.length > 0) ? <>
      {/* Charts Section */}
      <Divider orientation="left">Compliance charts</Divider>
      
      <Tabs defaultActiveKey="overview">
        <TabPane 
          tab={<span><BarChartOutlined /> Overview</span>} 
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              {renderComplianceTrend()}
            </Col>
            <Col xs={24} md={12}>
              {renderCategoryPerformance()}
            </Col>
            <Col xs={24} md={12}>
              {renderViolationTypes()}
            </Col>
            <Col xs={24} md={12}>
              {renderRiskHeatmap()}
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={<span><LineChartOutlined /> Performance</span>} 
          key="performance"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              {renderWeeklyPerformance()}
            </Col>
            <Col xs={24} md={12}>
              {renderPredictionAccuracy()}
            </Col>
            <Col xs={24} md={24}>
              {renderAIInsights()}
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={<span><PieChartOutlined /> Insights</span>} 
          key="insights"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic 
                  title="Automation Coverage" 
                  value={85} 
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress percent={85} strokeColor="#52c41a" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic 
                  title="Risk Reduction" 
                  value={32} 
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress percent={32} strokeColor="#1890ff" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic 
                  title="Efficiency Gain" 
                  value={47} 
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
                <Progress percent={47} strokeColor="#722ed1" />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
      </> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No compliance history yet. Charts appear when your records contain it." />}

      {/* Scheduled Reports Section */}
      {automationData.scheduled_reports && automationData.scheduled_reports.length > 0 && (
        <Card title="Scheduled Reports" size="small" style={{ marginTop: 16 }}>
          <Timeline
            items={automationData.scheduled_reports.map((report, index) => ({
              key: index,
              dot: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
              color: report.priority === 'high' ? 'red' : report.priority === 'medium' ? 'orange' : 'blue',
              children: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong>{report.name}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Due: {new Date(report.due_date).toLocaleDateString()}
                    </div>
                    {report.ai_confidence && (
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        AI Confidence: {Math.round(report.ai_confidence * 100)}%
                      </div>
                    )}
                  </div>
                  <div>
                    <Tag color={report.auto_generate ? 'green' : 'orange'}>
                      {report.auto_generate ? 'Auto-Generate' : 'Manual'}
                    </Tag>
                    {report.priority && (
                      <Tag color={report.priority === 'high' ? 'red' : report.priority === 'medium' ? 'orange' : 'default'}>
                        {report.priority.toUpperCase()}
                      </Tag>
                    )}
                  </div>
                </div>
              )
            }))}
          />
        </Card>
      )}

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button 
          type="primary" 
          icon={<SettingOutlined />}
          onClick={() => {
            message.info('Automation configuration panel coming soon');
          }}
        >
          Configure Automation Rules
        </Button>
      </div>
    </Card>
  );
};

export default ComplianceAutomationPanel;