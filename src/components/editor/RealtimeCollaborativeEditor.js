// src/components/documents/RealtimeCollaborativeEditor.jsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Card, Row, Col, Avatar, Badge, Tooltip, Space, Typography,
  Alert, Spin, Button, Tag, Divider, List, Input, message,
  Popover, Switch, Select, Dropdown, Menu
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  SaveOutlined,
  ReloadOutlined,
  WifiOutlined,
  DisconnectOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  MoreOutlined,
  SettingOutlined,
  HistoryOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { io } from 'socket.io-client';
import documentService from '../../services/documentService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://safetrackproglobal-backend-production.up.railway.app';

const CONNECTION_STATUS = {
  connected: { label: 'Connected', color: 'success', icon: <WifiOutlined /> },
  connecting: { label: 'Connecting...', color: 'processing', icon: <LoadingOutlined /> },
  disconnected: { label: 'Disconnected', color: 'error', icon: <DisconnectOutlined /> },
  reconnecting: { label: 'Reconnecting...', color: 'warning', icon: <SyncOutlined spin /> }
};

const USER_COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#fa541c', '#eb2f96', '#a0d911', '#2f54eb'
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getColorForUser = (userId) => {
  if (!userId) return USER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const RealtimeCollaborativeEditor = ({
  documentId,
  documentTitle = '',
  currentUser = null,
  onSave,
  onContentChange,
  readOnly = false,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [content, setContent] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [showPresence, setShowPresence] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);
  
  // ============================================================
  // REFS
  // ============================================================
  
  const socketRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Generate stable user ID
  const userId = useMemo(() => {
    return currentUser?.id || generateUserId();
  }, [currentUser?.id]);
  
  const userName = useMemo(() => {
    return currentUser?.name || currentUser?.email || 'Anonymous';
  }, [currentUser]);
  
  const userColor = useMemo(() => {
    return getColorForUser(userId);
  }, [userId]);

  // ============================================================
  // SOCKET CONNECTION
  // ============================================================
  
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }
    
    setConnectionStatus('connecting');
    setError(null);
    
    try {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        auth: {
          token: localStorage.getItem('token')
        }
      });
      
      // Connection events
      socketRef.current.on('connect', () => {
        console.log('🔌 Socket connected:', socketRef.current.id);
        setConnectionStatus('connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Join document room
        socketRef.current.emit('join_document', {
          doc_id: documentId,
          user: {
            id: userId,
            name: userName,
            color: userColor
          }
        });
      });
      
      socketRef.current.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setConnectionStatus('disconnected');
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          socketRef.current.connect();
        }
      });
      
      socketRef.current.on('connect_error', (err) => {
        console.error('🔌 Socket connection error:', err.message);
        setConnectionStatus('disconnected');
        setError(`Connection failed: ${err.message}`);
      });
      
      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔌 Reconnection attempt ${attemptNumber}`);
        setConnectionStatus('reconnecting');
        reconnectAttemptsRef.current = attemptNumber;
      });
      
      socketRef.current.on('reconnect_failed', () => {
        console.error('🔌 Reconnection failed');
        setConnectionStatus('disconnected');
        setError('Failed to reconnect. Please refresh the page.');
      });
      
      // Document events
      socketRef.current.on('document_state', ({ content: docContent, locked, locked_by }) => {
        console.log('📄 Received document state');
        setContent(docContent || '');
        setLastSavedContent(docContent || '');
        setIsLocked(locked || false);
        setLockedBy(locked_by || null);
      });
      
      socketRef.current.on('document_edited', ({ content: newContent, user, version }) => {
        console.log('📝 Document edited by:', user?.name);
        
        // Only update if the edit is from another user
        if (user?.id !== userId) {
          setContent(newContent);
        }
      });
      
      socketRef.current.on('user_joined', ({ user, collaborators: allCollaborators }) => {
        console.log('👤 User joined:', user?.name);
        
        if (allCollaborators) {
          setCollaborators(allCollaborators.filter(c => c.id !== userId));
        } else if (user && user.id !== userId) {
          setCollaborators(prev => {
            const exists = prev.find(c => c.id === user.id);
            if (exists) return prev;
            return [...prev, user];
          });
        }
        
        // Show notification
        if (user?.id !== userId) {
          message.info(`${user.name} joined the document`);
        }
      });
      
      socketRef.current.on('user_left', ({ user, collaborators: allCollaborators }) => {
        console.log('👤 User left:', user?.name);
        
        if (allCollaborators) {
          setCollaborators(allCollaborators.filter(c => c.id !== userId));
        } else if (user) {
          setCollaborators(prev => prev.filter(c => c.id !== user.id));
        }
        
        // Remove typing indicator
        setTypingUsers(prev => prev.filter(u => u.id !== user?.id));
      });
      
      socketRef.current.on('user_typing', ({ user, isTyping }) => {
        if (user?.id === userId) return;
        
        setTypingUsers(prev => {
          if (isTyping) {
            const exists = prev.find(u => u.id === user.id);
            if (exists) return prev;
            return [...prev, user];
          } else {
            return prev.filter(u => u.id !== user.id);
          }
        });
      });
      
      socketRef.current.on('cursor_moved', ({ user, position }) => {
        if (user?.id === userId) return;
        
        setCursors(prev => ({
          ...prev,
          [user.id]: {
            ...user,
            position
          }
        }));
      });
      
      socketRef.current.on('document_locked', ({ locked, locked_by }) => {
        setIsLocked(locked);
        setLockedBy(locked_by);
        
        if (locked && locked_by?.id !== userId) {
          message.warning(`Document locked by ${locked_by?.name || 'another user'}`);
        } else if (!locked) {
          message.success('Document unlocked');
        }
      });
      
      socketRef.current.on('save_confirmed', ({ version, saved_at }) => {
        setLastSaved(new Date(saved_at));
        setHasUnsavedChanges(false);
      });
      
      socketRef.current.on('error', ({ message: errorMessage }) => {
        console.error('🔌 Socket error:', errorMessage);
        setError(errorMessage);
        message.error(errorMessage);
      });
      
    } catch (err) {
      console.error('🔌 Failed to create socket:', err);
      setConnectionStatus('disconnected');
      setError('Failed to connect to collaboration server');
    }
  }, [documentId, userId, userName, userColor]);

  // ============================================================
  // EFFECTS
  // ============================================================
  
  // Connect on mount
  useEffect(() => {
    connectSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_document', {
          doc_id: documentId,
          user: { id: userId }
        });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket, documentId, userId]);
  
  // Load initial document content
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) return;
      
      try {
        const data = await documentService.getDocument(documentId);
        setContent(data.content || data.html_content || '');
        setLastSavedContent(data.content || data.html_content || '');
      } catch (err) {
        console.error('Failed to load document:', err);
        setError('Failed to load document content');
      }
    };
    
    loadDocument();
  }, [documentId]);
  
  // Auto-save
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || !isConnected) return;
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSave(true);
    }, 3000);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave, hasUnsavedChanges, isConnected, content]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleContentChange = useCallback((e) => {
    const newContent = e.target.value;
    
    if (isLocked && lockedBy?.id !== userId) {
      message.warning('Document is locked by another user');
      return;
    }
    
    setContent(newContent);
    setHasUnsavedChanges(true);
    
    // Emit edit to other users
    if (isConnected && socketRef.current) {
      socketRef.current.emit('edit_document', {
        doc_id: documentId,
        content: newContent,
        user: {
          id: userId,
          name: userName,
          color: userColor
        }
      });
      
      // Emit typing indicator
      socketRef.current.emit('typing', {
        doc_id: documentId,
        user: { id: userId, name: userName },
        isTyping: true
      });
      
      // Clear typing indicator after delay
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', {
          doc_id: documentId,
          user: { id: userId, name: userName },
          isTyping: false
        });
      }, 2000);
    }
    
    // Notify parent
    if (onContentChange) {
      onContentChange(newContent);
    }
  }, [documentId, userId, userName, userColor, isConnected, isLocked, lockedBy, onContentChange]);
  
  const handleCursorMove = useCallback((e) => {
    if (!isConnected || !socketRef.current) return;
    
    const position = e.target.selectionStart;
    
    socketRef.current.emit('cursor_move', {
      doc_id: documentId,
      user: { id: userId, name: userName, color: userColor },
      position
    });
  }, [documentId, userId, userName, userColor, isConnected]);
  
  const handleSave = useCallback(async (isAutoSave = false) => {
    if (!documentId) return;
    
    if (isLocked && lockedBy?.id !== userId) {
      if (!isAutoSave) {
        message.warning('Cannot save: document is locked by another user');
      }
      return;
    }
    
    setSaving(true);
    
    try {
      const data = {
        content: content,
        title: documentTitle
      };
      
      const result = await documentService.updateDocument(documentId, data);
      
      setLastSavedContent(content);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      // Emit save confirmation
      if (socketRef.current) {
        socketRef.current.emit('document_saved', {
          doc_id: documentId,
          user: { id: userId, name: userName },
          version: result.version,
          saved_at: new Date().toISOString()
        });
      }
      
      if (!isAutoSave) {
        message.success('Document saved successfully');
      }
      
      if (onSave) {
        onSave(result);
      }
      
      // Add to history
      setHistory(prev => [
        {
          version: result.version || prev.length + 1,
          content: content,
          saved_at: new Date().toISOString(),
          saved_by: userName
        },
        ...prev.slice(0, 9)
      ]);
      
    } catch (err) {
      console.error('Save failed:', err);
      if (!isAutoSave) {
        message.error('Failed to save document');
      }
    } finally {
      setSaving(false);
    }
  }, [documentId, content, documentTitle, userId, userName, isLocked, lockedBy, onSave]);
  
  const handleToggleLock = useCallback(() => {
    if (!socketRef.current) return;
    
    const newLockState = !isLocked;
    
    socketRef.current.emit('toggle_lock', {
      doc_id: documentId,
      locked: newLockState,
      user: { id: userId, name: userName }
    });
  }, [documentId, userId, userName, isLocked]);
  
  const handleReconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    connectSocket();
  }, [connectSocket]);

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderConnectionStatus = () => {
    const status = CONNECTION_STATUS[connectionStatus] || CONNECTION_STATUS.disconnected;
    
    return (
      <Tooltip title={error || status.label}>
        <Tag 
          color={status.color} 
          icon={status.icon}
          style={{ cursor: 'pointer' }}
          onClick={connectionStatus === 'disconnected' ? handleReconnect : undefined}
        >
          {status.label}
        </Tag>
      </Tooltip>
    );
  };
  
  const renderCollaborators = () => {
    if (!showPresence) return null;
    
    const allUsers = [
      { id: userId, name: userName, color: userColor, isCurrentUser: true },
      ...collaborators
    ];
    
    return (
      <div className="collaborators-bar" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8,
        padding: '8px 12px',
        background: '#fafafa',
        borderRadius: 8,
        marginBottom: 12
      }}>
        <TeamOutlined style={{ color: '#8c8c8c' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {allUsers.length} {allUsers.length === 1 ? 'person' : 'people'} editing
        </Text>
        
        <Avatar.Group maxCount={5} size="small">
          {allUsers.map(user => (
            <Tooltip key={user.id} title={`${user.name}${user.isCurrentUser ? ' (you)' : ''}`}>
              <Avatar
                size="small"
                style={{ 
                  backgroundColor: user.color,
                  border: user.isCurrentUser ? '2px solid #1890ff' : 'none'
                }}
              >
                {getInitials(user.name)}
              </Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
        
        {typingUsers.length > 0 && (
          <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
            {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Text>
        )}
      </div>
    );
  };
  
  const renderToolbar = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 16,
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <Space>
        {renderConnectionStatus()}
        
        {hasUnsavedChanges && (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Unsaved changes
          </Tag>
        )}
        
        {lastSaved && !hasUnsavedChanges && (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Saved {lastSaved.toLocaleTimeString()}
          </Tag>
        )}
      </Space>
      
      <Space>
        <Tooltip title={isLocked ? 'Unlock document' : 'Lock document'}>
          <Button
            icon={isLocked ? <LockOutlined /> : <UnlockOutlined />}
            onClick={handleToggleLock}
            type={isLocked ? 'primary' : 'default'}
            size="small"
            danger={isLocked}
          >
            {isLocked ? 'Locked' : 'Lock'}
          </Button>
        </Tooltip>
        
        <Tooltip title="Toggle presence display">
          <Switch
            checked={showPresence}
            onChange={setShowPresence}
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeOutlined />}
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="Auto-save">
          <Switch
            checked={autoSave}
            onChange={setAutoSave}
            checkedChildren="Auto"
            unCheckedChildren="Manual"
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="View history">
          <Button
            icon={<HistoryOutlined />}
            onClick={() => setShowHistory(!showHistory)}
            size="small"
          />
        </Tooltip>
        
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => handleSave(false)}
          loading={saving}
          disabled={!hasUnsavedChanges || (isLocked && lockedBy?.id !== userId)}
          size="small"
        >
          Save
        </Button>
      </Space>
    </div>
  );
  
  const renderEditor = () => (
    <div style={{ position: 'relative' }}>
      <TextArea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        onSelect={handleCursorMove}
        onClick={handleCursorMove}
        onKeyUp={handleCursorMove}
        placeholder="Start typing your document..."
        autoSize={{ minRows: 15, maxRows: 30 }}
        disabled={readOnly || (isLocked && lockedBy?.id !== userId)}
        style={{
          fontSize: 14,
          lineHeight: 1.8,
          fontFamily: 'inherit',
          padding: 16,
          borderRadius: 8,
          border: isLocked ? '2px solid #faad14' : '1px solid #d9d9d9'
        }}
      />
      
      {isLocked && lockedBy?.id !== userId && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          cursor: 'not-allowed'
        }}>
          <Space direction="vertical" align="center">
            <LockOutlined style={{ fontSize: 32, color: '#faad14' }} />
            <Text strong>Document locked by {lockedBy?.name || 'another user'}</Text>
            <Text type="secondary">You cannot edit while the document is locked</Text>
          </Space>
        </div>
      )}
    </div>
  );
  
  const renderHistory = () => {
    if (!showHistory) return null;
    
    return (
      <Card 
        title={<Space><HistoryOutlined /> Recent Saves</Space>}
        size="small"
        style={{ marginTop: 16 }}
      >
        <List
          size="small"
          dataSource={history}
          locale={{ emptyText: 'No save history yet' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar size="small">{item.version}</Avatar>}
                title={`Version ${item.version}`}
                description={
                  <Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.saved_at).toLocaleString()}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      by {item.saved_by}
                    </Text>
                  </Space>
                }
              />
              <Button 
                size="small" 
                onClick={() => {
                  setContent(item.content);
                  setHasUnsavedChanges(true);
                  message.info(`Loaded version ${item.version}`);
                }}
              >
                Restore
              </Button>
            </List.Item>
          )}
        />
      </Card>
    );
  };
  
  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div 
      className="realtime-collaborative-editor"
      style={{ padding: embedded ? 0 : 24 }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Space>
          <EditOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
          <Title level={4} style={{ margin: 0 }}>
            {documentTitle || 'Collaborative Editor'}
          </Title>
        </Space>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Alert
          message="Connection Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          action={
            <Button size="small" onClick={handleReconnect}>
              Reconnect
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* Collaborators */}
      {renderCollaborators()}
      
      {/* Toolbar */}
      {renderToolbar()}
      
      {/* Editor */}
      {renderEditor()}
      
      {/* History */}
      {renderHistory()}
    </div>
  );
};

export default RealtimeCollaborativeEditor;
