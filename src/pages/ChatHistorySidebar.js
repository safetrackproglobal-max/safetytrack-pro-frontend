// src/components/ChatHistorySidebar.js
import React from 'react';
import { List, Button, Space, Tag, Typography, Modal } from 'antd';
import { DeleteOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';
import aiStorageService from '../services/aiStorageService';

const { Text } = Typography;

const ChatHistorySidebar = ({ onSelectSession, currentSessionId, onClose }) => {
  const [sessions, setSessions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const result = await aiStorageService.getChatHistory(50);
      if (result.success) {
        setSessions(result.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    Modal.confirm({
      title: 'Delete Chat Session?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await aiStorageService.deleteChatSession(sessionId);
          setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
          message.success('Chat session deleted');
        } catch (error) {
          message.error('Failed to delete session');
        }
      }
    });
  };

  return (
    <div className="chat-history-sidebar" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Text strong>Chat History</Text>
        <Button size="small" onClick={onClose}>Close</Button>
      </div>
      
      <List
        loading={loading}
        dataSource={sessions}
        renderItem={session => (
          <List.Item
            style={{
              cursor: 'pointer',
              backgroundColor: session.sessionId === currentSessionId ? '#e6f7ff' : 'transparent',
              padding: '8px 12px',
              borderRadius: '8px',
              border: session.sessionId === currentSessionId ? '1px solid #1890ff' : 'none'
            }}
            onClick={() => onSelectSession(session)}
            actions={[
              <Button 
                key="delete" 
                type="text" 
                size="small" 
                icon={<DeleteOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(session.sessionId);
                }}
              />
            ]}
          >
            <List.Item.Meta
              avatar={<MessageOutlined style={{ color: '#1890ff' }} />}
              title={
                <Space>
                  <Text ellipsis style={{ maxWidth: 120 }}>
                    {session.messages?.[0]?.content?.substring(0, 30) || 'New Chat'}
                  </Text>
                  <Tag size="small" color="blue">{session.metadata?.industry || 'General'}</Tag>
                </Space>
              }
              description={
                <Space size="small">
                  <ClockCircleOutlined style={{ fontSize: '12px' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(session.metadata?.lastUpdated || session.timestamp).toLocaleDateString()}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {session.messages?.length || 0} messages
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ChatHistorySidebar;