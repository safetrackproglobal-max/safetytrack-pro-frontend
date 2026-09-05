// src/components/environmental/panels/ComplianceAutomationPanel.js
import React, { useState, useEffect } from 'react';
import { 
  Card, List, Switch, Alert, Button, Row, Col, Statistic, Tag, message, 
  Timeline, Tabs, Space, Tooltip, Progress, Divider
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
      message.error('Failed to load compliance automation data');
      const fallbackData = getFallbackData();
      setAutomationData(fallbackData);
      generateChartData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (data) => {
    // 1. Compliance Trend (Line Chart)
    const trend = data.compliance_trend || [
      { month: 'Jan', compliance: 78 },
      { month: 'Feb', compliance: 82 },
      { month: 'Mar', compliance: 79 },
      { month: 'Apr', compliance: 85 },
      { month: 'May', compliance: 88 },
      { month: 'Jun', compliance: 92 },
      { month: 'Jul', compliance: 94 },
      { month: 'Aug', compliance: 96 }
    ];
    
    // 2. Violation Types (Pie Chart)
    const violations = data.violation_types || [
      { name: 'Air Quality', value: 12 },
      { name: 'Water Quality', value: 8 },
      { name: 'Waste Management', value: 5 },
      { name: 'Documentation', value: 15 },
      { name: 'Safety Protocols', value: 6 }
    ];
    
    // 3. Category Performance (Bar Chart)
    const performance = data.category_performance || [
      { category: 'Environmental', score: 92 },
      { category: 'Social', score: 85 },
      { category: 'Governance', score: 78 },
      { category: 'Safety', score: 90 },
      { category: 'Quality', score: 88 },
      { category: 'Compliance', score: 94 }
    ];
    
    // 4. Risk Heatmap Data
    const riskData = data.risk_heatmap || [
      { area: 'Emissions', risk: 25, severity: 2 },
      { area: 'Waste', risk: 45, severity: 3 },
      { area: 'Water', risk: 15, severity: 1 },
      { area: 'Safety', risk: 65, severity: 4 },
      { area: 'Documentation', risk: 35, severity: 2 }
    ];
    
    // 5. Prediction Accuracy (Area Chart)
    const accuracy = data.prediction_accuracy || [
      { model: 'Classification', accuracy: 92 },
      { model: 'Detection', accuracy: 88 },
      { model: 'Forecast', accuracy: 84 },
      { model: 'Anomaly', accuracy: 90 },
      { model: 'ESG', accuracy: 86 }
    ];
    
    // 6. Weekly Performance (Composed Chart)
    const weekly = data.weekly_performance || [
      { day: 'Mon', incidents: 2, resolved: 2, compliance: 95 },
      { day: 'Tue', incidents: 1, resolved: 1, compliance: 97 },
      { day: 'Wed', incidents: 3, resolved: 2, compliance: 92 },
      { day: 'Thu', incidents: 0, resolved: 0, compliance: 98 },
      { day: 'Fri', incidents: 2, resolved: 1, compliance: 94 },
      { day: 'Sat', incidents: 1, resolved: 1, compliance: 96 },
      { day: 'Sun', incidents: 0, resolved: 0, compliance: 99 }
    ];
    
    setChartData({
      complianceTrend: trend,
      violationTypes: violations,
      categoryPerformance: performance,
      riskHeatmap: riskData,
      predictionAccuracy: accuracy,
      weeklyPerformance: weekly
    });
  };

  const getFallbackData = () => {
    return {
      overall_compliance: 88,
      upcoming_deadlines: 3,
      active_violations: 1,
      automated_tasks: 12,
      auto_generated_reports: 15,
      ai_assisted_reviews: 8,
      automation_metrics: {
        accuracy_rate: 94,
        time_saved_hours: 45,
        compliance_improvement: 12
      },
      scheduled_reports: [
        {
          name: 'EPA Form R',
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          auto_generate: true,
          priority: 'high'
        },
        {
          name: 'Water Discharge Report',
          due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          auto_generate: true,
          priority: 'medium'
        }
      ]
    };
  };

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
    return (
      <Card size="small" title="🤖 AI Insights">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic 
              title="AI Accuracy" 
              value={metrics.accuracy_rate || 94} 
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Time Saved" 
              value={metrics.time_saved_hours || 45} 
              suffix="hrs"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Compliance Improvement" 
              value={metrics.compliance_improvement || 12} 
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
        <Divider />
        <div>
          <Progress 
            percent={metrics.accuracy_rate || 94} 
            strokeColor="#52c41a"
            format={(p) => `${p}%`}
          />
          <Progress 
            percent={Math.min(100, ((metrics.time_saved_hours || 45) / 100) * 100)} 
            strokeColor="#1890ff"
            format={() => `${metrics.time_saved_hours || 45} hrs saved`}
          />
          <Progress 
            percent={metrics.compliance_improvement || 12} 
            strokeColor="#722ed1"
            format={(p) => `${p}% improvement`}
          />
        </div>
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
              value={automationData.overall_compliance || 0} 
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
              value={automationData.upcoming_deadlines || 0} 
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic 
              title="Active Violations" 
              value={automationData.active_violations || 0} 
              valueStyle={{ color: '#f5222d' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic 
              title="Automated Tasks" 
              value={automationData.automated_tasks || 0} 
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
              value={automationData.auto_generated_reports || 0} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic 
              title="AI-assisted Reviews" 
              value={automationData.ai_assisted_reviews || 0} 
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
            ? `System is automatically monitoring compliance and generating reports. AI model accuracy: ${automationData.automation_metrics?.accuracy_rate || 94}%`
            : "Manual mode - reports and compliance checks require manual intervention"
        }
        type={autoMode ? "success" : "warning"}
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Charts Section */}
      <Divider orientation="left">📊 Compliance Analytics Dashboard</Divider>
      
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

      {/* Automated Tasks List */}
      <Card title="Automated Tasks" size="small" style={{ marginTop: 16 }}>
        <List
          dataSource={[
            { name: 'Automated EPA reporting', status: 'scheduled', active: true },
            { name: 'Water discharge monitoring', status: 'active', active: true },
            { name: 'Air quality compliance checks', status: 'running', active: true },
            { name: 'Waste management tracking', status: 'automated', active: true },
            { name: 'Environmental impact assessments', status: 'scheduled', active: true }
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title={item.name}
                description={`Status: ${item.status}`}
              />
              <Tag color="blue">Automated</Tag>
            </List.Item>
          )}
        />
      </Card>

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