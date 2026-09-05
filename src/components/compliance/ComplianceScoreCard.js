import React from "react";
import { Card, Progress, Tag, List } from "antd";

export default function ComplianceScoreCard({ score }) {
  if (!score)
    return (
      <Card>
        <b>No compliance score data available.</b>
      </Card>
    );

  return (
    <Card title="Compliance Score">
      <Progress
        type="dashboard"
        percent={score.compliance_score || 0}
        status={score.compliance_score >= 80 ? "success" : "exception"}
        format={p => `${p}%`}
      />
      <div style={{ marginTop: 16 }}>
        <Tag color={score.compliance_score >= 80 ? "green" : "red"}>
          {score.compliance_score >= 80 ? "Compliant" : "Non-Compliant"}
        </Tag>
      </div>
      <List
        header={<b>Issues</b>}
        dataSource={score.issues || []}
        renderItem={issue => (
          <List.Item>
            <Tag color="red">{issue}</Tag>
          </List.Item>
        )}
      />
      <List
        header={<b>Recommendations</b>}
        dataSource={score.recommendations || []}
        renderItem={rec => (
          <List.Item>
            <Tag color="gold">{rec}</Tag>
          </List.Item>
        )}
      />
    </Card>
  );
}