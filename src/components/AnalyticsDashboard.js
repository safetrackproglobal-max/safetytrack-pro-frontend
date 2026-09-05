import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/analytics", { headers: { Authorization: `Bearer ${localStorage.token}` } })
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading analytics...</div>;

  return (
    <div className="analytics-dashboard">
      <h2>Safety Trends</h2>
      <Bar data={data.incidentsOverTime} />
      <h2>Training Compliance</h2>
      <Pie data={data.complianceStats} />
      <h2>Document Reviews</h2>
      <Line data={data.documentReviewTrends} />
    </div>
  );
}