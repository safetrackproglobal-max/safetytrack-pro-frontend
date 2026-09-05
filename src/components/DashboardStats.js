// src/components/DashboardStats/DashboardStats.js
import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { 
  WarningOutlined, 
  SafetyCertificateOutlined, 
  UserOutlined,
  FileTextOutlined, 
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined 
} from '@ant-design/icons';
import './DashboardStats.css';

function DashboardStats({ stats = {} }) {
  // Default stats for fallback
  const defaultStats = {
    incidentsReported: 0,
    tasksCompleted: 0,
    pendingTasks: 0,
    complianceScore: 0,
    incidentsThisMonth: 4,
    activePermits: 23,
    trainingCompliance: 92
  };

  // Combined statistics array with all metrics
  const statistics = [
    {
      title: 'Incidents This Month',
      value: stats.incidentsThisMonth || defaultStats.incidentsThisMonth,
      prefix: <WarningOutlined />,
      suffix: null,
      trend: 'down',
      change: 12,
      description: '12% decrease from last month',
      color: '#cf1322',
      showProgress: false
    },
    {
      title: 'Active Permits',
      value: stats.activePermits || defaultStats.activePermits,
      prefix: <SafetyCertificateOutlined />,
      suffix: null,
      trend: 'up',
      change: 8,
      description: '8 hot work permits issued today',
      color: '#1890ff',
      showProgress: false
    },
    {
      title: 'Training Compliance',
      value: stats.trainingCompliance || defaultStats.trainingCompliance,
      prefix: <UserOutlined />,
      suffix: '%',
      trend: 'up',
      change: 5,
      description: 'Up to date with certifications',
      color: '#52c41a',
      showProgress: true
    },
    {
      title: 'Incidents Reported',
      value: stats.incidentsReported || defaultStats.incidentsReported,
      prefix: <SafetyCertificateOutlined />,
      suffix: null,
      color: '#1890ff',
      showProgress: false
    },
    {
      title: 'Tasks Completed',
      value: stats.tasksCompleted || defaultStats.tasksCompleted,
      prefix: <CheckCircleOutlined />,
      suffix: null,
      color: '#52c41a',
      showProgress: false
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks || defaultStats.pendingTasks,
      prefix: <WarningOutlined />,
      suffix: null,
      color: '#faad14',
      showProgress: false
    },
    {
      title: 'Compliance Score',
      value: stats.complianceScore || defaultStats.complianceScore,
      suffix: '%',
      prefix: <FileTextOutlined />,
      color: '#722ed1',
      showProgress: true
    }
  ];

  return (
    <div className="dashboard-stats" role="region" aria-label="Dashboard statistics">
      <Row gutter={[16, 16]}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stat-card">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
              />
              {/* Trend indicator for stats that have trend data */}
              {stat.trend && stat.description && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {stat.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {stat.change}% {stat.description}
                </div>
              )}
              {/* Progress bar for percentage-based stats */}
              {stat.showProgress && stat.suffix === '%' && (
                <Progress 
                  percent={stat.value} 
                  size="small" 
                  status={stat.value >= 90 ? 'success' : stat.value >= 70 ? 'normal' : 'exception'}
                  style={{ marginTop: 8 }}
                  showInfo={false}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default DashboardStats;