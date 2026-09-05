import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography, DatePicker, Spin } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import axios from "axios";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function IncidentAnalytics({ hospitalId }) {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState([null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, [hospitalId, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = `/api/hospital/${hospitalId}/incidents/analytics`;
      if (timeRange[0] && timeRange[1]) {
        url += `?start=${timeRange[0].format('YYYY-MM-DD')}&end=${timeRange[1].format('YYYY-MM-DD')}`;
      }
      
      const { data } = await axios.get(url);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
    setLoading(false);
  };

  if (loading) return <Spin />;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Title level={3}>Incident Analytics</Title>
          <RangePicker onChange={setTimeRange} style={{ marginBottom: 16 }} />
        </Col>
      </Row>

      {stats && (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="Total Incidents" value={stats.total_incidents} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Open Incidents" value={stats.open_incidents} valueStyle={{ color: '#cf1322' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Resolved (7 days)" value={stats.resolved_recent} valueStyle={{ color: '#3f8600' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Avg Resolution Time" value={stats.avg_resolution_time} suffix="hours" />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="Incidents by Type" style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.by_type}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Incidents by Severity" style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={stats.by_severity}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label
                    >
                      {stats.by_severity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="Trend Over Time" style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="incidents" fill="#52c41a" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}