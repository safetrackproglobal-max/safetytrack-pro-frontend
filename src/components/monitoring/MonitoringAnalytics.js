import React, { useEffect, useState } from "react";
import { Card, List, Progress, Spin, Alert, Typography } from "antd";
import axios from "axios";

export default function MoAnalysis({ hospitalId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/analytics/air-quality/${hospitalId}`);
        setAnalytics(data);
      } catch (e) {
        console.error("Failed to fetch analytics:", e);
        setError("Failed to load analytics data");
        setAnalytics(null);
      }
      setLoading(false);
    }
    
    if (hospitalId) {
      fetchAnalytics();
    }
  }, [hospitalId]);

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error} />;
  if (!analytics) return <Alert type="warning" message="No analytics data available" />;

  const parameters = analytics.parameters && typeof analytics.parameters === 'object' 
    ? Object.entries(analytics.parameters) 
    : [];

  const timePeriodText = analytics.time_period 
    ? analytics.time_period.replace("last_", "").replace("_days", " days")
    : "recent period";

  const safeGet = (obj, key, defaultValue = 'N/A') => {
    return obj && obj[key] != null ? obj[key] : defaultValue;
  };

  return (
    <Card title="Air Quality Analytics">
      <List
        header={<b>Parameters ({timePeriodText})</b>}
        dataSource={parameters}
        renderItem={([param, info]) => (
          <List.Item>
            <List.Item.Meta
              title={`${param} (${safeGet(info, 'unit', 'N/A')})`}
              description={
                <>
                  <span>Min: {safeGet(info, 'min', 'N/A')}, </span>
                  <span>Max: {safeGet(info, 'max', 'N/A')}, </span>
                  <span>Avg: {safeGet(info, 'avg', 'N/A')}, </span>
                  <span>Latest: {safeGet(info, 'latest', 'N/A')}</span>
                </>
              }
            />
            {info && info.avg != null && info.max != null && info.max > 0 && (
              <Progress 
                percent={Math.min((info.avg / info.max) * 100, 100)} 
                size="small" 
                showInfo={false}
              />
            )}
          </List.Item>
        )}
      />
      
      <div style={{ marginTop: 16 }}>
        <Typography.Text>
          <b>Active Alerts:</b> {safeGet(analytics, 'active_alerts', 0)} <br />
          <b>Station Count:</b> {safeGet(analytics, 'station_count', 0)} <br />
          <b>Data Points:</b> {safeGet(analytics, 'data_points', 0)}
        </Typography.Text>
      </div>
    </Card>
  );
}