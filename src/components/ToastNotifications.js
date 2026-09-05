// src/components/NotificationBell.jsx
import React, { useContext, useState } from "react";
import { Badge, Dropdown, Menu, List, Avatar, Typography, Button, Empty } from "antd";
import { BellOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import NotificationContext from "../context/NotificationContext";
import { useHistory } from "react-router-dom";

const { Text } = Typography;

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllRead } = useContext(NotificationContext);
  const [visible, setVisible] = useState(false);
  const history = useHistory();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      history.push(notification.action);
      setVisible(false);
    }
  };

  const menu = (
    <div style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications" style={{ padding: 24 }} />
      ) : (
        <List
          dataSource={notifications.slice(0, 10)}
          renderItem={(item) => (
            <List.Item
              style={{ 
                padding: '12px 16px', 
                cursor: 'pointer',
                backgroundColor: !item.read ? '#f6f6f6' : 'transparent',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => handleNotificationClick(item)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={getIcon(item.type)} style={{ backgroundColor: 'transparent' }} />}
                title={<Text strong={!item.read}>{item.title}</Text>}
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.message}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
    >
      <div style={{ cursor: 'pointer', padding: '0 12px' }}>
        <Badge count={unreadCount} size="small">
          <BellOutlined style={{ fontSize: 18 }} />
        </Badge>
      </div>
    </Dropdown>
  );
}