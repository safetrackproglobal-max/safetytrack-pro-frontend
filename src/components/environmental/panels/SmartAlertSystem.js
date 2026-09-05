// src/components/environmental/panels/SmartAlertSystem.js
import React from 'react';
import { List, Alert, Button, Tag, Card, Badge } from 'antd';

const SmartAlertSystem = ({ alerts, onAcknowledge }) => {
  return (
    <Card 
      title="🚨 Smart Alert System" 
      extra={<Badge count={alerts.length} showZero={false} />}
    >
      <List
        dataSource={alerts}
        renderItem={alert => (
          <List.Item>
            <Alert
              message={
                <div>
                  <span>{alert.message}</span>
                  <Tag 
                    color={alert.severity === 'high' ? 'red' : 'orange'} 
                    style={{ marginLeft: 8 }}
                  >
                    AI Confidence: {alert.confidence}%
                  </Tag>
                </div>
              }
              description={alert.suggested_action}
              type={alert.severity === 'high' ? 'error' : 'warning'}
              showIcon
              action={
                <Button size="small" onClick={() => onAcknowledge(alert.id)}>
                  Acknowledge
                </Button>
              }
              style={{ width: '100%' }}
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No active alerts' }}
      />
    </Card>
  );
};

export default SmartAlertSystem;