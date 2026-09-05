// src/pages/StatsOverview.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Spin, Alert } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import safetyproservice from '../services/safetyproservice'; // Import the service

const StatsOverview = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch stats data
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await safetyproservice.getApprovalStats();
      
      console.log('📊 StatsOverview API Response:', response); // Debug log
      
      // Handle different response structures
      if (response) {
        // If response has error property
        if (response.error) {
          setError(response.error);
          setStats(null);
        }
        // If response has success: true and stats
        else if (response.success && response.stats) {
          setStats(response.stats);
        }
        // If response has success: true and data with stats
        else if (response.success && response.data && response.data.stats) {
          setStats(response.data.stats);
        }
        // If response has stats directly
        else if (response.stats) {
          setStats(response.stats);
        }
        // If response has data with stats
        else if (response.data && response.data.stats) {
          setStats(response.data.stats);
        }
        // If response is the stats object itself
        else if (response.total || response.today) {
          setStats(response);
        }
        // If response.success is true but no stats found
        else if (response.success) {
          setError('Stats data not found in response');
          setStats(null);
        }
        else {
          setError('Unexpected response format');
          setStats(null);
        }
      } else {
        setError('No response received from server');
        setStats(null);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics. Please try again.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  // Optional: Auto-refresh every 60 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchStats();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchStats();
  };

  // Calculate percentage safely
  const calculatePercentage = (numerator, denominator) => {
    if (!denominator || denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100);
  };

  // Format number safely
  const formatNumber = (value) => {
    if (value === undefined || value === null) return 0;
    return value;
  };

  // Format time safely
  const formatTime = (hours) => {
    if (!hours) return '0';
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };

  // Format plan name for display
  const formatPlanName = (plan) => {
    return plan.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get color for plan type
  const getPlanColor = (plan) => {
    const colors = {
      'free': '#fa8c16',
      'basic': '#1890ff',
      'pro': '#722ed1',
      'professional': '#52c41a',
      'enterprise': '#1890ff',
      'custom': '#722ed1',
      'custom_enterprise': '#13c2c2',
      'platform_owner': '#faad14',
      'platform_admin': '#13c2c2'
    };
    return colors[plan] || '#fa8c16';
  };

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Statistics"
        description={error}
        type="error"
        showIcon
        action={
          <button 
            onClick={handleRefresh}
            style={{ background: 'transparent', border: 'none', color: '#1890ff', cursor: 'pointer' }}
          >
            Retry
          </button>
        }
      />
    );
  }

  if (!stats) {
    return (
      <Alert
        message="No Statistics Available"
        description="Statistics data could not be loaded."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            hoverable
            actions={[
              <span key="refresh" onClick={handleRefresh} style={{ cursor: 'pointer' }}>
                Refresh
              </span>
            ]}
          >
            <Statistic
              title="Total Pending"
              value={formatNumber(stats.total?.pending)}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <Progress
              percent={calculatePercentage(stats.total?.pending, stats.total?.all)}
              size="small"
              status="active"
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              {formatNumber(stats.total?.all)} total applications
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Approved Today"
              value={formatNumber(stats.today?.approved)}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              {formatNumber(stats.today?.conversion_rate?.toFixed(1))}% conversion
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {formatNumber(stats.today?.total)} total today
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Total Approved"
              value={formatNumber(stats.total?.approved)}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              {calculatePercentage(stats.total?.approved, stats.total?.all)}% of total
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Total Rejected"
              value={formatNumber(stats.total?.rejected)}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              {calculatePercentage(stats.total?.rejected, stats.total?.all)}% of total
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Avg. Approval Time"
              value={formatTime(stats.avg_approval_time_hours)}
              suffix="hours"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              Median: {formatTime(stats.median_approval_time_hours)} hours
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card hoverable>
            <Statistic
              title="Active Plans"
              value={formatNumber(Object.keys(stats.by_plan || {}).length)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              <span style={{ color: '#52c41a' }}>
                {formatNumber(stats.total?.approved || 0)} total approved
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {formatNumber(stats.total?.pending || 0)} pending approval
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Plan Distribution Section */}
      {stats.by_plan && Object.keys(stats.by_plan).length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="Plan Distribution" size="small">
              <Row gutter={16}>
                {Object.entries(stats.by_plan)
                  .filter(([plan, data]) => data.total > 0) // Only show plans with users
                  .map(([plan, data]) => (
                    <Col xs={12} sm={6} md={4} lg={3} key={plan}>
                      <Card size="small" hoverable>
                        <Statistic
                          title={formatPlanName(plan)}
                          value={formatNumber(data.pending || 0)}
                          suffix={`/ ${formatNumber(data.total || 0)}`}
                          valueStyle={{ fontSize: '20px' }}
                        />
                        <Progress
                          percent={calculatePercentage(data.approved || 0, data.total || 0)}
                          size="small"
                          showInfo={false}
                          strokeColor={getPlanColor(plan)}
                        />
                        <div style={{ fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center' }}>
                          {formatNumber(data.approved || 0)} approved
                          {data.rejected > 0 && ` • ${data.rejected} rejected`}
                        </div>
                      </Card>
                    </Col>
                  ))}
              </Row>
              {Object.entries(stats.by_plan).filter(([plan, data]) => data.total > 0).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  No plan data available
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Additional metrics if available */}
      {stats.team_performance && Object.keys(stats.team_performance).length > 0 && (
        <Row gutter={16}>
          <Col span={24}>
            <Card title="Team Performance" size="small">
              <Row gutter={16}>
                {Object.entries(stats.team_performance).map(([key, value]) => (
                  <Col xs={12} sm={6} md={4} lg={3} key={key}>
                    <Statistic
                      title={key.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      value={formatNumber(value)}
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

// Export with default props
StatsOverview.defaultProps = {
  refreshTrigger: null
};

export default StatsOverview;