import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Typography, Button, message, Statistic, Progress } from "antd";
import { 
  SafetyCertificateOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from "axios";
import ComplianceScoreCard from "./ComplianceScoreCard";
import PolicyManager from "./PolicyManager";
import ChecklistWizard from "./ChecklistWizard";
import AuditFindings from "./AuditFindings";
import RegulatoryCalendar from "./RegulatoryCalendar";

const { Title, Text } = Typography;

export default function ComplianceDashboard({ departmentId, userId }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activeChecklists: 0,
    overdueTasks: 0,
    complianceRate: 0
  });

  const fetchScore = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockScore = {
        compliance_score: 87,
        issues: [
          "Outdated safety protocols",
          "Missing emergency contact lists",
          "Incomplete staff training records"
        ],
        recommendations: [
          "Update safety manual by next quarter",
          "Conduct emergency drill this month",
          "Complete mandatory training for all staff"
        ]
      };

      const mockStats = {
        totalPolicies: 24,
        activeChecklists: 8,
        overdueTasks: 3,
        complianceRate: 87
      };

      setScore(mockScore);
      setStats(mockStats);
    } catch (e) {
      message.error("Failed to fetch compliance data.");
      setScore(null);
      setStats({
        totalPolicies: 0,
        activeChecklists: 0,
        overdueTasks: 0,
        complianceRate: 0
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScore();
  }, [departmentId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Compliance Dashboard</Title>
      <Text type="secondary">Manage policies, checklists, and ensure regulatory compliance</Text>

      {/* Quick Stats Overview */}
      <Row gutter={16} style={{ margin: '24px 0' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Policies"
              value={stats.totalPolicies}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Checklists"
              value={stats.activeChecklists}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Overdue Tasks"
              value={stats.overdueTasks}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Compliance Rate"
              value={stats.complianceRate}
              suffix="%"
              valueStyle={{ 
                color: stats.complianceRate >= 90 ? '#52c41a' : 
                       stats.complianceRate >= 80 ? '#faad14' : '#ff4d4f' 
              }}
            />
            <Progress 
              percent={stats.complianceRate} 
              status={stats.complianceRate >= 90 ? 'success' : 
                      stats.complianceRate >= 80 ? 'normal' : 'exception'}
              size="small" 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <ComplianceScoreCard score={score} />
        </Col>
        <Col xs={24} lg={12}>
          <RegulatoryCalendar departmentId={departmentId} />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <AuditFindings departmentId={departmentId} />
        </Col>
        <Col xs={24} lg={12}>
          <PolicyManager departmentId={departmentId} userId={userId} />
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col xs={24}>
          <ChecklistWizard departmentId={departmentId} userId={userId} />
        </Col>
      </Row>
    </div>
  );
}