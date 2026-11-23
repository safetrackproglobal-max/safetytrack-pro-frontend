// src/components/documents/DocumentAssistant.jsx
// AI chat assistant: ask questions, extract insights, compare documents,
// summarize content, and get recommendations using natural language

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Drawer, Descriptions, Tabs, Timeline,
  Avatar, List, Badge, Tooltip, Progress, Switch, Empty, Spin,
  Alert, Divider, Typography, Collapse, Checkbox, Radio, Slider,
  Tag, Table, Statistic, Steps, Result, Segmented, Upload,
  Tree, Cascader, DatePicker, Popover, FloatButton, Affix
} from 'antd';
import {
  RobotOutlined, SendOutlined, UserOutlined, BulbOutlined,
  FileTextOutlined, FilePdfOutlined, FileWordOutlined,
  FileExcelOutlined, FileImageOutlined, FileOutlined,
  ThunderboltOutlined, RocketOutlined, FireOutlined,
  StarOutlined, StarFilled, CopyOutlined, ReloadOutlined,
  HistoryOutlined, DeleteOutlined, SaveOutlined, PlusOutlined,
  SearchOutlined, FilterOutlined, EditOutlined, EyeOutlined,
  DownloadOutlined, LinkOutlined, PaperClipOutlined,
  CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
  InfoCircleOutlined, ClockCircleOutlined, ThunderboltFilled,
  ExperimentOutlined, LineChartOutlined, PieChartOutlined,
  BarChartOutlined, FundOutlined, DeploymentUnitOutlined,
  SafetyCertificateOutlined, AuditOutlined, EnvironmentOutlined,
  MedicineBoxOutlined, TeamOutlined, ApartmentOutlined,
  MessageOutlined, CommentOutlined, HighlightOutlined,
  ExportOutlined, ImportOutlined, CloudUploadOutlined,
  SyncOutlined, LoadingOutlined, QuestionCircleOutlined,
  BulbFilled, RiseOutlined, FallOutlined, NodeIndexOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import documentService from '../../services/documentService';
import './DocumentAssistant.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const SUGGESTED_PROMPTS = [
  {
    icon: <SearchOutlined />,
    label: 'Find Documents',
    prompts: [
      'Show me all HSE reports from Q1 2024',
      'Find documents related to fire safety',
      'What permits expire this month?',
      'List all incident reports involving falls'
    ]
  },
  {
    icon: <BulbOutlined />,
    label: 'Extract Insights',
    prompts: [
      'Summarize the safety incidents from last quarter',
      'What are the most common hazards mentioned?',
      'Identify trends in environmental compliance',
      'Show me key metrics from the quality reports'
    ]
  },
  {
    icon: <FileTextOutlined />,
    label: 'Analyze Content',
    prompts: [
      'Compare the 2023 and 2024 safety policies',
      'What does the SDS say about chemical storage?',
      'Extract all action items from the audit report',
      'What are the key risks mentioned in this document?'
    ]
  },
  {
    icon: <StarOutlined />,
    label: 'Recommendations',
    prompts: [
      'What documents should I review for ISO 45001?',
      'Suggest improvements for our safety documentation',
      'Which documents are missing required signatures?',
      'What gaps exist in our compliance documentation?'
    ]
  }
];

const MESSAGE_TYPES = {
  user: { color: '#1890ff', icon: <UserOutlined /> },
  assistant: { color: '#52c41a', icon: <RobotOutlined /> },
  system: { color: '#8c8c8c', icon: <InfoCircleOutlined /> },
  error: { color: '#f5222d', icon: <WarningOutlined /> }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentAssistant = ({
  documentId = null,
  companyId = null,
  embedded = false,
  onDocumentSelect = null
}) => {
  const { user } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [assistantMode, setAssistantMode] = useState('general');
  const [contextDocuments, setContextDocuments] = useState([]);
  const [attachedDocuments, setAttachedDocuments] = useState([]);
  const [showSuggested, setShowSuggested] = useState(true);
  const [streamingContent, setStreamingContent] = useState('');
  
  // UI State
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [documentPickerVisible, setDocumentPickerVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [autoCitation, setAutoCitation] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const eventSourceRef = useRef(null);

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadConversations = useCallback(async () => {
    try {
      const data = await documentService.getAssistantConversations({ 
        company_id: companyId,
        limit: 20 
      });
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [companyId]);
  
  const loadConversation = useCallback(async (conversationId) => {
    setLoading(true);
    try {
      const data = await documentService.getAssistantConversation(conversationId);
      setMessages(data.messages || []);
      setCurrentConversationId(conversationId);
      setShowSuggested(false);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      message.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // CHAT HANDLERS
  // ============================================================
  
  const handleSendMessage = async (content = inputValue) => {
    if (!content.trim() || sending) return;
    
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSending(true);
    setShowSuggested(false);
    
    try {
      // Prepare context
      const context = {
        conversation_id: currentConversationId,
        document_ids: [
          ...(documentId ? [documentId] : []),
          ...attachedDocuments.map(d => d.id)
        ],
        mode: assistantMode,
        temperature,
        max_tokens: maxTokens,
        include_sources: showSources,
        company_id: companyId
      };
      
      if (streamingEnabled) {
        // Streaming response
        await handleStreamingResponse(content, context);
      } else {
        // Regular response
        const data = await documentService.askAssistant(content, context);
        
        const assistantMessage = {
          id: `msg-${Date.now()}-a`,
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
          suggestions: data.suggestions || [],
          timestamp: new Date().toISOString(),
          tokens_used: data.tokens_used
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (!currentConversationId && data.conversation_id) {
          setCurrentConversationId(data.conversation_id);
          loadConversations();
        }
      }
      
    } catch (error) {
      console.error('Failed to get response:', error);
      
      const errorMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'error',
        content: error.message || 'Failed to get response. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
      setStreamingContent('');
    }
  };
  
  const handleStreamingResponse = async (content, context) => {
    return new Promise((resolve, reject) => {
      let accumulated = '';
      const assistantMessageId = `msg-${Date.now()}-a`;
      
      // Add empty assistant message that will be updated
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        streaming: true,
        timestamp: new Date().toISOString()
      }]);
      
      // Use EventSource for streaming
      const eventSource = documentService.streamAssistantResponse(content, context);
      eventSourceRef.current = eventSource;
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'content') {
            accumulated += data.content;
            setStreamingContent(accumulated);
            
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulated }
                : msg
            ));
          } else if (data.type === 'sources') {
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, sources: data.sources }
                : msg
            ));
          } else if (data.type === 'complete') {
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessageId
                ? { 
                    ...msg, 
                    streaming: false,
                    suggestions: data.suggestions || [],
                    conversation_id: data.conversation_id
                  }
                : msg
            ));
            
            if (!currentConversationId && data.conversation_id) {
              setCurrentConversationId(data.conversation_id);
              loadConversations();
            }
            
            eventSource.close();
            resolve();
          } else if (data.type === 'error') {
            eventSource.close();
            reject(new Error(data.message));
          }
        } catch (e) {
          console.error('Failed to parse stream message:', e);
        }
      };
      
      eventSource.onerror = (error) => {
        eventSource.close();
        // If we have accumulated content, treat as success
        if (accumulated) {
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, streaming: false }
              : msg
          ));
          resolve();
        } else {
          reject(new Error('Stream connection failed'));
        }
      };
    });
  };
  
  const handleSuggestedPrompt = (prompt) => {
    setInputValue(prompt);
    inputRef.current?.focus();
    // Optionally auto-send
    // handleSendMessage(prompt);
  };
  
  const handleAttachDocuments = (documents) => {
    setAttachedDocuments(prev => {
      const existing = new Set(prev.map(d => d.id));
      const newDocs = documents.filter(d => !existing.has(d.id));
      return [...prev, ...newDocs];
    });
    setDocumentPickerVisible(false);
    message.success(`${documents.length} document(s) attached to context`);
  };
  
  const handleRemoveAttachment = (docId) => {
    setAttachedDocuments(prev => prev.filter(d => d.id !== docId));
  };
  
  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setAttachedDocuments([]);
    setShowSuggested(true);
    setInputValue('');
  };
  
  const handleDeleteConversation = async (conversationId) => {
    try {
      await documentService.deleteAssistantConversation(conversationId);
      message.success('Conversation deleted');
      if (currentConversationId === conversationId) {
        handleNewConversation();
      }
      loadConversations();
    } catch (error) {
      message.error('Failed to delete conversation');
    }
  };
  
  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    message.success('Copied to clipboard');
  };
  
  const handleRegenerateResponse = async () => {
    // Find last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;
    
    // Remove last assistant message
    setMessages(prev => {
      const newMessages = [...prev];
      const lastAssistantIndex = newMessages.map(m => m.role).lastIndexOf('assistant');
      if (lastAssistantIndex > -1) {
        newMessages.splice(lastAssistantIndex, 1);
      }
      return newMessages;
    });
    
    // Resend
    setTimeout(() => handleSendMessage(lastUserMessage.content), 100);
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);
  
  useEffect(() => {
    return () => {
      // Cleanup event source
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };
  
  const getMessageConfig = (role) => {
    return MESSAGE_TYPES[role] || MESSAGE_TYPES.system;
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderSuggestedPrompts = () => (
    <div className="suggested-prompts">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar 
          size={64} 
          icon={<RobotOutlined />} 
          style={{ 
            background: 'linear-gradient(135deg, #1890ff, #52c41a)',
            marginBottom: 16
          }}
        />
        <Title level={3} style={{ margin: 0 }}>Document Assistant</Title>
        <Text type="secondary">
          Ask questions about your documents, extract insights, and get recommendations
        </Text>
      </div>
      
      <Row gutter={[16, 16]}>
        {SUGGESTED_PROMPTS.map((category, idx) => (
          <Col xs={24} md={12} key={idx}>
            <Card 
              size="small" 
              className="prompt-category-card"
              title={
                <Space>
                  {category.icon}
                  <span style={{ fontSize: 13 }}>{category.label}</span>
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size={4}>
                {category.prompts.map((prompt, i) => (
                  <div
                    key={i}
                    className="suggested-prompt-item"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    <span style={{ fontSize: 12 }}>{prompt}</span>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
  
  const renderMessage = (message) => {
    const config = getMessageConfig(message.role);
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isError = message.role === 'error';
    
    return (
      <div 
        key={message.id} 
        className={`assistant-message ${message.role}`}
      >
        <div className="message-avatar">
          <Avatar 
            icon={config.icon}
            style={{ 
              backgroundColor: config.color,
              color: 'white'
            }}
            size="small"
          />
        </div>
        
        <div className="message-content">
          <div className="message-header">
            <Space>
              <Text strong style={{ fontSize: 13 }}>
                {isUser ? 'You' : isAssistant ? 'Assistant' : 'System'}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {formatTime(message.timestamp)}
              </Text>
              {message.streaming && (
                <Tag color="processing" style={{ fontSize: 10 }}>
                  <SyncOutlined spin /> Generating
                </Tag>
              )}
            </Space>
            
            <Space size={4}>
              <Tooltip title="Copy">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopyMessage(message.content)}
                />
              </Tooltip>
              {isAssistant && !message.streaming && (
                <Tooltip title="Regenerate">
                  <Button
                    type="text"
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={handleRegenerateResponse}
                  />
                </Tooltip>
              )}
            </Space>
          </div>
          
          <div className={`message-body ${isError ? 'error' : ''}`}>
            {renderMessageContent(message.content, isAssistant)}
          </div>
          
          {/* Sources */}
          {showSources && message.sources && message.sources.length > 0 && (
            <div className="message-sources">
              <Text type="secondary" style={{ fontSize: 11 }}>
                <PaperClipOutlined /> Sources:
              </Text>
              <Space wrap size={[4, 4]} style={{ marginTop: 4 }}>
                {message.sources.map((source, i) => (
                  <Tooltip 
                    key={i} 
                    title={source.snippet || source.title}
                  >
                    <Tag 
                      color="blue" 
                      style={{ cursor: 'pointer', fontSize: 11 }}
                      onClick={() => {
                        if (onDocumentSelect) {
                          onDocumentSelect(source.document_id);
                        }
                      }}
                    >
                      {source.title || `Source ${i + 1}`}
                    </Tag>
                  </Tooltip>
                ))}
              </Space>
            </div>
          )}
          
          {/* Suggested follow-ups */}
          {isAssistant && message.suggestions && message.suggestions.length > 0 && (
            <div className="message-suggestions">
              <Space direction="vertical" style={{ width: '100%' }} size={4}>
                {message.suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="suggestion-chip"
                    onClick={() => handleSuggestedPrompt(suggestion)}
                  >
                    <BulbOutlined style={{ color: '#faad14', marginRight: 6 }} />
                    {suggestion}
                  </div>
                ))}
              </Space>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderMessageContent = (content, isAssistant) => {
    if (!content && isAssistant) {
      return (
        <Space>
          <LoadingOutlined /> 
          <Text type="secondary">Thinking...</Text>
        </Space>
      );
    }
    
    // Simple markdown-like rendering
    const lines = content.split('\n');
    
    return (
      <div style={{ lineHeight: 1.7, fontSize: 14 }}>
        {lines.map((line, i) => {
          // Headers
          if (line.startsWith('### ')) {
            return <Title key={i} level={5} style={{ marginTop: 8, marginBottom: 4 }}>{line.slice(4)}</Title>;
          }
          if (line.startsWith('## ')) {
            return <Title key={i} level={4} style={{ marginTop: 12, marginBottom: 6 }}>{line.slice(3)}</Title>;
          }
          if (line.startsWith('# ')) {
            return <Title key={i} level={3} style={{ marginTop: 12, marginBottom: 8 }}>{line.slice(2)}</Title>;
          }
          
          // Bullet points
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={i} style={{ paddingLeft: 16, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span>
                {line.slice(2)}
              </div>
            );
          }
          
          // Numbered lists
          if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+)\.\s(.+)/);
            if (match) {
              return (
                <div key={i} style={{ paddingLeft: 20, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#1890ff' }}>
                    {match[1]}.
                  </span>
                  {match[2]}
                </div>
              );
            }
          }
          
          // Code blocks
          if (line.startsWith('```')) {
            return <div key={i} style={{ height: 4 }} />;
          }
          if (line.startsWith('    ')) {
            return (
              <pre 
                key={i} 
                style={{ 
                  background: '#f5f5f5',
                  padding: '8px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  margin: '4px 0',
                  overflow: 'auto'
                }}
              >
                {line.slice(4)}
              </pre>
            );
          }
          
          // Empty lines
          if (!line.trim()) {
            return <div key={i} style={{ height: 8 }} />;
          }
          
          // Regular text with bold/italic/code formatting
          return <div key={i}>{renderFormattedText(line)}</div>;
        })}
      </div>
    );
  };
  
  const renderFormattedText = (text) => {
    // Handle bold **text**
    let parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      
      // Handle inline code `text`
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((codePart, j) => {
        if (codePart.startsWith('`') && codePart.endsWith('`')) {
          return (
            <code 
              key={`${i}-${j}`}
              style={{ 
                background: '#f5f5f5', 
                padding: '1px 4px',
                borderRadius: 3,
                fontSize: 13,
                fontFamily: 'Monaco, Menlo, monospace'
              }}
            >
              {codePart.slice(1, -1)}
            </code>
          );
        }
        return codePart;
      });
    });
  };
  
  const renderAttachments = () => {
    if (attachedDocuments.length === 0) return null;
    
    return (
      <div className="attached-documents">
        <Space wrap size={[4, 4]}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <PaperClipOutlined /> Context:
          </Text>
          {attachedDocuments.map(doc => (
            <Tag
              key={doc.id}
              closable
              onClose={() => handleRemoveAttachment(doc.id)}
              color="blue"
              style={{ fontSize: 11 }}
            >
              {doc.title}
            </Tag>
          ))}
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setDocumentPickerVisible(true)}
            style={{ padding: 0, fontSize: 11 }}
          >
            Add
          </Button>
        </Space>
      </div>
    );
  };
  
  const renderInputArea = () => (
    <div className="assistant-input-area">
      {renderAttachments()}
      
      <div className="input-wrapper">
        <TextArea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask me anything about your documents..."
          autoSize={{ minRows: 1, maxRows: 6 }}
          disabled={sending}
          style={{ paddingRight: 100 }}
        />
        
        <div className="input-actions">
          <Tooltip title="Attach documents">
            <Button
              type="text"
              icon={<PaperClipOutlined />}
              onClick={() => setDocumentPickerVisible(true)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Settings">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setSettingsVisible(true)}
              size="small"
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSendMessage()}
            loading={sending}
            disabled={!inputValue.trim()}
            size="small"
          >
            Send
          </Button>
        </div>
      </div>
      
      <div className="input-footer">
        <Text type="secondary" style={{ fontSize: 10 }}>
          Press Enter to send, Shift+Enter for new line
        </Text>
      </div>
    </div>
  );
  
  const renderSidebar = () => (
    <div className="assistant-sidebar">
      <Button
        type="primary"
        block
        icon={<PlusOutlined />}
        onClick={handleNewConversation}
        style={{ marginBottom: 16 }}
      >
        New Conversation
      </Button>
      
      <div style={{ marginBottom: 12 }}>
        <Input
          placeholder="Search conversations..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          allowClear
        />
      </div>
      
      <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: 'block' }}>
        Recent Conversations
      </Text>
      
      <List
        size="small"
        dataSource={conversations.filter(c => 
          !searchQuery || 
          c.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={(conv) => (
          <List.Item
            className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
            onClick={() => loadConversation(conv.id)}
            actions={[
              <Popconfirm
                key="delete"
                title="Delete conversation?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="text" 
                  size="small" 
                  icon={<DeleteOutlined />} 
                  danger
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              avatar={<MessageOutlined style={{ color: '#1890ff' }} />}
              title={
                <span style={{ fontSize: 12, fontWeight: 500 }}>
                  {conv.title || 'Untitled'}
                </span>
              }
              description={
                <Text type="secondary" style={{ fontSize: 10 }}>
                  {conv.message_count} messages
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderDocumentPicker = () => (
    <Modal
      title={
        <Space>
          <PaperClipOutlined />
          <span>Attach Documents to Context</span>
        </Space>
      }
      open={documentPickerVisible}
      onCancel={() => setDocumentPickerVisible(false)}
      footer={null}
      width={600}
    >
      <Alert
        message="Add documents as context"
        description="The assistant will use these documents to answer your questions more accurately."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Input.Search
        placeholder="Search documents..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16 }}
      />
      
      <List
        dataSource={[]}
        renderItem={(doc) => (
          <List.Item
            actions={[
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleAttachDocuments([doc])}
              >
                Attach
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<FileTextOutlined />}
              title={doc.title}
              description={doc.module}
            />
          </List.Item>
        )}
      />
      
      <Empty description="Search to find documents" />
    </Modal>
  );
  
  const renderSettingsModal = () => (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>Assistant Settings</span>
        </Space>
      }
      open={settingsVisible}
      onCancel={() => setSettingsVisible(false)}
      footer={
        <Button type="primary" onClick={() => {
          setSettingsVisible(false);
          message.success('Settings saved');
        }}>
          Save Settings
        </Button>
      }
    >
      <Form layout="vertical">
        <Form.Item label={`Temperature: ${temperature}`} extra="Higher = more creative, Lower = more focused">
          <Slider
            value={temperature}
            onChange={setTemperature}
            min={0}
            max={1}
            step={0.1}
            marks={{ 0: 'Precise', 0.5: 'Balanced', 1: 'Creative' }}
          />
        </Form.Item>
        
        <Form.Item label="Max Response Length">
          <Select value={maxTokens} onChange={setMaxTokens}>
            <Option value={500}>Short (500 tokens)</Option>
            <Option value={1000}>Medium (1000 tokens)</Option>
            <Option value={2000}>Long (2000 tokens)</Option>
            <Option value={4000}>Very Long (4000 tokens)</Option>
          </Select>
        </Form.Item>
        
        <Divider />
        
        <Form.Item>
          <Space direction="vertical">
            <Space>
              <Switch checked={streamingEnabled} onChange={setStreamingEnabled} />
              <Text>Stream responses in real-time</Text>
            </Space>
            <Space>
              <Switch checked={autoCitation} onChange={setAutoCitation} />
              <Text>Auto-cite sources</Text>
            </Space>
            <Space>
              <Switch checked={showSources} onChange={setShowSources} />
              <Text>Show source documents</Text>
            </Space>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className={`document-assistant ${embedded ? 'embedded' : ''}`}>
      {/* Header */}
      <div className="assistant-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Avatar 
                icon={<RobotOutlined />} 
                style={{ background: 'linear-gradient(135deg, #1890ff, #52c41a)' }}
              />
              <div>
                <Title level={5} style={{ margin: 0 }}>Document Assistant</Title>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  AI-powered document Q&A and analysis
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              {messages.length > 0 && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleNewConversation}
                  size="small"
                >
                  New Chat
                </Button>
              )}
              {!embedded && (
                <Button
                  icon={<HistoryOutlined />}
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                  size="small"
                >
                  {sidebarVisible ? 'Hide' : 'Show'} History
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Main Layout */}
      <Row gutter={16} style={{ marginTop: 16, height: 'calc(100vh - 200px)' }}>
        {!embedded && sidebarVisible && (
          <Col xs={24} md={6} lg={5}>
            <Card 
              size="small" 
              bodyStyle={{ padding: 12, maxHeight: '100%', overflow: 'auto' }}
              style={{ height: '100%' }}
            >
              {renderSidebar()}
            </Card>
          </Col>
        )}
        
        <Col xs={24} md={embedded ? 24 : (sidebarVisible ? 18 : 24)} lg={embedded ? 24 : (sidebarVisible ? 19 : 24)}>
          <Card
            size="small"
            bodyStyle={{ 
              padding: 0, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
            style={{ height: '100%' }}
          >
            {/* Messages Area */}
            <div className="messages-area">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-messages">
                  {renderSuggestedPrompts()}
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Input Area */}
            {renderInputArea()}
          </Card>
        </Col>
      </Row>
      
      {/* Modals */}
      {renderDocumentPicker()}
      {renderSettingsModal()}
    </div>
  );
};

export default DocumentAssistant;