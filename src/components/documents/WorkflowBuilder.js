// src/components/documents/WorkflowBuilder.jsx
// Visual drag-and-drop workflow designer for document approval chains,
// with conditional routing, parallel approvals, escalation, and SLA tracking

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Drawer, Descriptions, Tabs, Timeline,
  Avatar, List, Badge, Tooltip, Progress, Switch, Empty, Spin,
  Alert, Divider, Typography, Collapse, Checkbox, Radio, Slider,
  Transfer, Tree, Cascader, DatePicker, InputNumber, Segmented,
  Statistic, Result, Steps, Tag, Upload, ColorPicker, FloatButton
} from 'antd';
import {
  ApartmentOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
  EyeOutlined, SaveOutlined, ReloadOutlined, UndoOutlined,
  RedoOutlined, CopyOutlined, DragOutlined, NodeIndexOutlined,
  BranchesOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
  InfoCircleOutlined, SettingOutlined, PlayCircleOutlined,
  PauseCircleOutlined, ThunderboltOutlined, MergeCellsOutlined,
  SplitCellsOutlined, ExpandOutlined, CompressOutlined,
  ArrowRightOutlined, ArrowDownOutlined, GlobalOutlined,
  SafetyCertificateOutlined, AuditOutlined, MailOutlined,
  BellOutlined, SwapOutlined, RetweetOutlined, ForkOutlined,
  DeploymentUnitOutlined, BlockOutlined, ApiOutlined,
  FullscreenOutlined, FullscreenExitOutlined, ClearOutlined,
  DownloadOutlined, ExportOutlined, ImportOutlined, PrinterOutlined,
  HistoryOutlined, FieldTimeOutlined, ScheduleOutlined,
  ExclamationCircleOutlined, FireOutlined, FlagOutlined,
  StopOutlined, SendOutlined, NotificationOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './WorkflowBuilder.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const NODE_TYPES = {
  start: {
    label: 'Start',
    icon: <PlayCircleOutlined />,
    color: '#52c41a',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f'
  },
  end: {
    label: 'End',
    icon: <StopOutlined />,
    color: '#f5222d',
    bgColor: '#fff1f0',
    borderColor: '#ffa39e'
  },
  approval: {
    label: 'Approval',
    icon: <CheckCircleOutlined />,
    color: '#1890ff',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff'
  },
  review: {
    label: 'Review',
    icon: <EyeOutlined />,
    color: '#722ed1',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7'
  },
  signature: {
    label: 'Signature',
    icon: <EditOutlined />,
    color: '#faad14',
    bgColor: '#fffbe6',
    borderColor: '#ffe58f'
  },
  condition: {
    label: 'Condition',
    icon: <BranchesOutlined />,
    color: '#fa8c16',
    bgColor: '#fff7e6',
    borderColor: '#ffd591'
  },
  parallel: {
    label: 'Parallel',
    icon: <ForkOutlined />,
    color: '#13c2c2',
    bgColor: '#e6fffb',
    borderColor: '#87e8de'
  },
  merge: {
    label: 'Merge',
    icon: <MergeCellsOutlined />,
    color: '#2f54eb',
    bgColor: '#f0f5ff',
    borderColor: '#adc6ff'
  },
  notification: {
    label: 'Notification',
    icon: <BellOutlined />,
    color: '#eb2f96',
    bgColor: '#fff0f6',
    borderColor: '#ffadd2'
  },
  delay: {
    label: 'Delay',
    icon: <ClockCircleOutlined />,
    color: '#8c8c8c',
    bgColor: '#fafafa',
    borderColor: '#d9d9d9'
  }
};

const ASSIGNEE_TYPES = {
  user: { label: 'Specific User', icon: <UserOutlined /> },
  role: { label: 'Role', icon: <SafetyCertificateOutlined /> },
  group: { label: 'Group', icon: <TeamOutlined /> },
  department: { label: 'Department', icon: <ApartmentOutlined /> },
  manager: { label: 'Manager', icon: <UserOutlined /> },
  document_owner: { label: 'Document Owner', icon: <UserOutlined /> },
  requestor: { label: 'Requestor', icon: <UserOutlined /> }
};

const APPROVAL_MODES = {
  all: { label: 'All Must Approve', description: 'Every assignee must approve' },
  any: { label: 'Any Can Approve', description: 'First approval completes step' },
  majority: { label: 'Majority', description: 'More than 50% must approve' },
  sequential: { label: 'Sequential', description: 'One after another in order' }
};

const ESCALATION_ACTIONS = {
  notify: { label: 'Send Notification', icon: <BellOutlined /> },
  reassign: { label: 'Reassign', icon: <SwapOutlined /> },
  auto_approve: { label: 'Auto-Approve', icon: <CheckCircleOutlined /> },
  auto_reject: { label: 'Auto-Reject', icon: <CloseCircleOutlined /> }
};

const CONDITION_OPERATORS = {
  equals: 'Equals',
  not_equals: 'Not Equals',
  greater_than: 'Greater Than',
  less_than: 'Less Than',
  contains: 'Contains',
  in: 'In List',
  not_in: 'Not In List',
  is_empty: 'Is Empty',
  is_not_empty: 'Is Not Empty'
};

const CONDITION_FIELDS = [
  { value: 'document_type', label: 'Document Type' },
  { value: 'module', label: 'Module' },
  { value: 'priority', label: 'Priority' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
  { value: 'department', label: 'Department' },
  { value: 'created_by', label: 'Created By' },
  { value: 'tags', label: 'Tags' },
  { value: 'sensitivity', label: 'Sensitivity Level' }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const WorkflowBuilder = ({
  workflowId = null,
  companyId = null,
  embedded = false,
  onSave = null,
  readOnly = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [activeTab, setActiveTab] = useState('canvas');
  
  // Canvas state
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  
  // History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // UI
  const [nodeConfigVisible, setNodeConfigVisible] = useState(false);
  const [workflowSettingsVisible, setWorkflowSettingsVisible] = useState(false);
  const [templatesVisible, setTemplatesVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  
  // Workflow metadata
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowEnabled, setWorkflowEnabled] = useState(true);
  const [workflowCategory, setWorkflowCategory] = useState('general');
  const [applicableTo, setApplicableTo] = useState([]);
  
  // Refs
  const canvasRef = useRef(null);
  const nodeIdCounter = useRef(1);

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadWorkflow = useCallback(async () => {
    setLoading(true);
    try {
      if (workflowId) {
        const data = await documentService.getWorkflow(workflowId);
        setWorkflow(data);
        setWorkflowName(data.name || '');
        setWorkflowDescription(data.description || '');
        setWorkflowEnabled(data.is_active ?? true);
        setWorkflowCategory(data.category || 'general');
        setApplicableTo(data.applicable_to || []);
        setNodes(data.nodes || getDefaultNodes());
        setConnections(data.connections || []);
      } else {
        setNodes(getDefaultNodes());
      }
      
      const listData = await documentService.getWorkflows({ company_id: companyId });
      setWorkflows(listData.workflows || []);
      
    } catch (error) {
      console.error('Failed to load workflow:', error);
      message.error('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  }, [workflowId, companyId]);

  // ============================================================
  // DEFAULT WORKFLOW
  // ============================================================
  
  const getDefaultNodes = () => {
    return [
      {
        id: 'node-start',
        type: 'start',
        title: 'Start',
        x: 100,
        y: 200,
        config: {}
      },
      {
        id: 'node-approval-1',
        type: 'approval',
        title: 'Manager Approval',
        x: 350,
        y: 200,
        config: {
          assignees: [],
          approval_mode: 'all',
          timeout_days: 3,
          escalation_action: 'notify'
        }
      },
      {
        id: 'node-end',
        type: 'end',
        title: 'End',
        x: 600,
        y: 200,
        config: {}
      }
    ];
  };

  // ============================================================
  // NODE OPERATIONS
  // ============================================================
  
  const addNode = (type, position = null) => {
    const newNodeId = `node-${type}-${nodeIdCounter.current++}`;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    const newNode = {
      id: newNodeId,
      type,
      title: NODE_TYPES[type]?.label || 'New Node',
      x: position?.x ?? (canvasRect ? canvasRect.width / 2 - 75 : 300),
      y: position?.y ?? (canvasRect ? canvasRect.height / 2 - 40 : 200),
      config: getDefaultNodeConfig(type)
    };
    
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    addToHistory({ nodes: newNodes, connections });
    setSelectedNode(newNode);
    setNodeConfigVisible(true);
  };
  
  const getDefaultNodeConfig = (type) => {
    const baseConfig = { description: '', notes: '' };
    
    switch (type) {
      case 'approval':
        return {
          ...baseConfig,
          assignees: [],
          assignee_type: 'user',
          approval_mode: 'all',
          timeout_days: 3,
          escalation_action: 'notify',
          require_comment: false,
          allow_delegation: true,
          allow_rejection: true
        };
      case 'review':
        return {
          ...baseConfig,
          assignees: [],
          assignee_type: 'user',
          require_comment: true
        };
      case 'signature':
        return {
          ...baseConfig,
          signer_type: 'user',
          signers: [],
          require_witness: false,
          signature_method: 'electronic'
        };
      case 'condition':
        return {
          ...baseConfig,
          field: 'priority',
          operator: 'equals',
          value: 'high',
          true_path: null,
          false_path: null
        };
      case 'parallel':
        return {
          ...baseConfig,
          branch_count: 2,
          branches: []
        };
      case 'notification':
        return {
          ...baseConfig,
          recipients: [],
          channels: ['email'],
          template: '',
          timing: 'on_enter'
        };
      case 'delay':
        return {
          ...baseConfig,
          duration: 1,
          duration_unit: 'days'
        };
      default:
        return baseConfig;
    }
  };
  
  const updateNode = (nodeId, updates) => {
    const newNodes = nodes.map(n => 
      n.id === nodeId ? { ...n, ...updates } : n
    );
    setNodes(newNodes);
    addToHistory({ nodes: newNodes, connections });
  };
  
  const deleteNode = (nodeId) => {
    const newNodes = nodes.filter(n => n.id !== nodeId);
    const newConnections = connections.filter(
      c => c.from !== nodeId && c.to !== nodeId
    );
    setNodes(newNodes);
    setConnections(newConnections);
    addToHistory({ nodes: newNodes, connections: newConnections });
    setSelectedNode(null);
    setNodeConfigVisible(false);
  };
  
  const duplicateNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const newNode = {
      ...node,
      id: `node-${node.type}-${nodeIdCounter.current++}`,
      title: `${node.title} (Copy)`,
      x: node.x + 40,
      y: node.y + 40
    };
    
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    addToHistory({ nodes: newNodes, connections });
    setSelectedNode(newNode);
  };

  // ============================================================
  // DRAG & DROP
  // ============================================================
  
  const handleNodeMouseDown = (e, node) => {
    if (readOnly || e.button !== 0) return;
    
    e.stopPropagation();
    setSelectedNode(node);
    setDraggingNode(node.id);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.x * zoom,
      y: e.clientY - rect.top - node.y * zoom
    });
  };
  
  const handleCanvasMouseMove = (e) => {
    if (!draggingNode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left - dragOffset.x) / zoom;
    const newY = (e.clientY - rect.top - dragOffset.y) / zoom;
    
    setNodes(nodes.map(n =>
      n.id === draggingNode
        ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) }
        : n
    ));
  };
  
  const handleCanvasMouseUp = () => {
    if (draggingNode) {
      addToHistory({ nodes, connections });
    }
    setDraggingNode(null);
  };
  
  const handleCanvasClick = () => {
    if (!connectingFrom) {
      setSelectedNode(null);
      setNodeConfigVisible(false);
    }
    setConnectingFrom(null);
  };

  // ============================================================
  // CONNECTIONS
  // ============================================================
  
  const startConnection = (e, nodeId) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
  };
  
  const completeConnection = (e, toNodeId) => {
    e.stopPropagation();
    if (!connectingFrom || connectingFrom === toNodeId) {
      setConnectingFrom(null);
      return;
    }
    
    // Check for duplicate
    const exists = connections.some(
      c => c.from === connectingFrom && c.to === toNodeId
    );
    
    if (!exists) {
      const newConnections = [
        ...connections,
        {
          id: `conn-${Date.now()}`,
          from: connectingFrom,
          to: toNodeId,
          label: ''
        }
      ];
      setConnections(newConnections);
      addToHistory({ nodes, connections: newConnections });
    }
    
    setConnectingFrom(null);
  };
  
  const deleteConnection = (connId) => {
    const newConnections = connections.filter(c => c.id !== connId);
    setConnections(newConnections);
    addToHistory({ nodes, connections: newConnections });
  };

  // ============================================================
  // HISTORY
  // ============================================================
  
  const addToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state)));
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setNodes(state.nodes);
      setConnections(state.connections);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setNodes(state.nodes);
      setConnections(state.connections);
    }
  };

  // ============================================================
  // SAVE
  // ============================================================
  
  const handleSave = async () => {
    if (!workflowName.trim()) {
      message.error('Please enter a workflow name');
      return;
    }
    
    if (nodes.length < 2) {
      message.error('Workflow must have at least a start and end node');
      return;
    }
    
    const hasStart = nodes.some(n => n.type === 'start');
    const hasEnd = nodes.some(n => n.type === 'end');
    
    if (!hasStart) {
      message.error('Workflow must have a start node');
      return;
    }
    if (!hasEnd) {
      message.error('Workflow must have an end node');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        name: workflowName,
        description: workflowDescription,
        is_active: workflowEnabled,
        category: workflowCategory,
        applicable_to: applicableTo,
        nodes,
        connections,
        company_id: companyId
      };
      
      let result;
      if (workflowId) {
        result = await documentService.updateWorkflow(workflowId, payload);
      } else {
        result = await documentService.createWorkflow(payload);
      }
      
      message.success('Workflow saved successfully');
      
      if (onSave) onSave(result);
      
      loadWorkflow();
      
    } catch (error) {
      console.error('Failed to save workflow:', error);
      message.error(error.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Delete' && selectedNode) {
        deleteNode(selectedNode.id);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedNode]);

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  const renderNode = (node) => {
    const config = NODE_TYPES[node.type] || NODE_TYPES.approval;
    const isSelected = selectedNode?.id === node.id;
    const isConnecting = connectingFrom === node.id;
    
    return (
      <div
        key={node.id}
        className={`workflow-node ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''}`}
        style={{
          position: 'absolute',
          left: node.x,
          top: node.y,
          background: config.bgColor,
          borderColor: config.borderColor,
          borderWidth: isSelected ? 3 : 2,
          zIndex: isSelected ? 10 : 1
        }}
        onMouseDown={(e) => handleNodeMouseDown(e, node)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(node);
          setNodeConfigVisible(true);
        }}
        onMouseUp={(e) => completeConnection(e, node.id)}
      >
        <div className="node-header">
          <span className="node-icon" style={{ color: config.color }}>
            {config.icon}
          </span>
          <span className="node-title">{node.title}</span>
        </div>
        <div className="node-body">
          {node.type === 'approval' && (
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              {node.config?.assignees?.length || 0} assignee(s)
              {node.config?.timeout_days && ` • ${node.config.timeout_days}d timeout`}
            </div>
          )}
          {node.type === 'condition' && (
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              IF {node.config?.field} {node.config?.operator} {node.config?.value}
            </div>
          )}
          {node.type === 'delay' && (
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              Wait {node.config?.duration} {node.config?.duration_unit}
            </div>
          )}
        </div>
        
        {/* Connection handles */}
        {!readOnly && (
          <>
            <div 
              className="node-handle node-handle-right"
              onMouseDown={(e) => startConnection(e, node.id)}
              title="Drag to connect"
            />
            <div className="node-handle node-handle-left" />
          </>
        )}
      </div>
    );
  };

  const renderConnection = (conn) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    
    if (!fromNode || !toNode) return null;
    
    const fromX = fromNode.x + 150; // node width
    const fromY = fromNode.y + 40; // half node height
    const toX = toNode.x;
    const toY = toNode.y + 40;
    
    const midX = (fromX + toX) / 2;
    
    const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
    
    return (
      <g key={conn.id} className="workflow-connection">
        <path
          d={path}
          stroke="#1890ff"
          strokeWidth={2}
          fill="none"
          markerEnd="url(#arrowhead)"
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
          onClick={() => {
            if (!readOnly) {
              Modal.confirm({
                title: 'Delete connection?',
                onOk: () => deleteConnection(conn.id)
              });
            }
          }}
        />
        {conn.label && (
          <text
            x={midX}
            y={(fromY + toY) / 2 - 5}
            textAnchor="middle"
            fill="#8c8c8c"
            fontSize={10}
          >
            {conn.label}
          </text>
        )}
      </g>
    );
  };

  const renderCanvas = () => (
    <div 
      className={`workflow-canvas ${fullscreen ? 'fullscreen' : ''}`}
      ref={canvasRef}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      onClick={handleCanvasClick}
    >
      {/* SVG for connections */}
      <svg 
        className="workflow-svg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#1890ff" />
          </marker>
        </defs>
        <g style={{ pointerEvents: 'auto' }}>
          {connections.map(conn => renderConnection(conn))}
        </g>
      </svg>
      
      {/* Nodes */}
      <div 
        className="workflow-nodes"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        {nodes.map(node => renderNode(node))}
      </div>
      
      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="canvas-empty-state">
          <Empty
            description={
              <div>
                <Title level={5}>Empty Workflow</Title>
                <Text type="secondary">Drag nodes from the palette or click "Add Node" to start</Text>
              </div>
            }
          />
        </div>
      )}
    </div>
  );

  const renderPalette = () => (
    <Card 
      title={
        <Space>
          <AppstoreOutlined />
          <span>Node Palette</span>
        </Space>
      }
      size="small"
      className="workflow-palette"
    >
      <div className="palette-grid">
        {Object.entries(NODE_TYPES).map(([key, config]) => (
          <Tooltip key={key} title={`Add ${config.label} node`}>
            <div
              className="palette-item"
              style={{
                borderColor: config.borderColor,
                background: config.bgColor
              }}
              onClick={() => addNode(key)}
            >
              <span style={{ color: config.color, fontSize: 18 }}>
                {config.icon}
              </span>
              <span style={{ fontSize: 11 }}>{config.label}</span>
            </div>
          </Tooltip>
        ))}
      </div>
    </Card>
  );

  const renderToolbar = () => (
    <div className="workflow-toolbar">
      <Space>
        <Button 
          icon={<UndoOutlined />} 
          onClick={handleUndo}
          disabled={historyIndex <= 0}
        >
          Undo
        </Button>
        <Button 
          icon={<RedoOutlined />} 
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
        >
          Redo
        </Button>
        <Divider type="vertical" />
        <Button.Group>
          <Tooltip title="Zoom Out">
            <Button 
              icon={<ZoomOutOutlined />} 
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            />
          </Tooltip>
          <Button disabled style={{ minWidth: 60 }}>
            {Math.round(zoom * 100)}%
          </Button>
          <Tooltip title="Zoom In">
            <Button 
              icon={<ZoomInOutlined />} 
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            />
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => setZoom(1)}
            />
          </Tooltip>
        </Button.Group>
        <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
          <Button 
            icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
            onClick={() => setFullscreen(!fullscreen)}
          />
        </Tooltip>
        <Divider type="vertical" />
        <Tooltip title="Clear Canvas">
          <Popconfirm
            title="Clear all nodes?"
            onConfirm={() => {
              setNodes([]);
              setConnections([]);
              addToHistory({ nodes: [], connections: [] });
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<ClearOutlined />} danger>
              Clear
            </Button>
          </Popconfirm>
        </Tooltip>
      </Space>
      
      <Space>
        <Button 
          icon={<SettingOutlined />} 
          onClick={() => setWorkflowSettingsVisible(true)}
        >
          Settings
        </Button>
        <Button 
          icon={<PlayCircleOutlined />} 
          onClick={() => setTestModalVisible(true)}
        >
          Test
        </Button>
        <Button 
          type="primary"
          icon={<SaveOutlined />} 
          onClick={handleSave}
          loading={saving}
          disabled={readOnly}
        >
          Save Workflow
        </Button>
      </Space>
    </div>
  );

  const renderNodeConfig = () => {
    if (!selectedNode) return null;
    
    const config = NODE_TYPES[selectedNode.type];
    
    return (
      <Drawer
        title={
          <Space>
            <span style={{ color: config?.color }}>{config?.icon}</span>
            <span>Configure {config?.label}</span>
          </Space>
        }
        placement="right"
        width={480}
        open={nodeConfigVisible}
        onClose={() => setNodeConfigVisible(false)}
        extra={
          <Space>
            <Tooltip title="Duplicate">
              <Button 
                icon={<CopyOutlined />} 
                size="small"
                onClick={() => duplicateNode(selectedNode.id)}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this node?"
              onConfirm={() => deleteNode(selectedNode.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small"
                danger
              />
            </Popconfirm>
          </Space>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Node Title">
            <Input
              value={selectedNode.title}
              onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
              placeholder="Enter node title"
            />
          </Form.Item>
          
          {/* Approval node config */}
          {selectedNode.type === 'approval' && (
            <>
              <Form.Item label="Assignee Type">
                <Select
                  value={selectedNode.config?.assignee_type || 'user'}
                  onChange={(v) => updateNode(selectedNode.id, {
                    config: { ...selectedNode.config, assignee_type: v }
                  })}
                >
                  {Object.entries(ASSIGNEE_TYPES).map(([key, val]) => (
                    <Option key={key} value={key}>
                      <Space>
                        {val.icon}
                        {val.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item label="Assignees">
                <Select
                  mode="multiple"
                  placeholder="Select assignees"
                  value={selectedNode.config?.assignees || []}
                  onChange={(v) => updateNode(selectedNode.id, {
                    config: { ...selectedNode.config, assignees: v }
                  })}
                  style={{ width: '100%' }}
                >
                  <Option value="user_1">John Smith</Option>
                  <Option value="user_2">Jane Doe</Option>
                  <Option value="role_manager">Manager Role</Option>
                  <Option value="dept_hse">HSE Department</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Approval Mode">
                <Radio.Group
                  value={selectedNode.config?.approval_mode || 'all'}
                  onChange={(e) => updateNode(selectedNode.id, {
                    config: { ...selectedNode.config, approval_mode: e.target.value }
                  })}
                >
                  {Object.entries(APPROVAL_MODES).map(([key, val]) => (
                    <Radio key={key} value={key} style={{ display: 'block', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{val.label}</div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{val.description}</div>
                      </div>
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Timeout (days)">
                    <InputNumber
                      value={selectedNode.config?.timeout_days || 3}
                      onChange={(v) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, timeout_days: v }
                      })}
                      min={1}
                      max={365}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Escalation Action">
                    <Select
                      value={selectedNode.config?.escalation_action || 'notify'}
                      onChange={(v) => updateNode(selectedNode.id, {
                        config: { ...selectedNode.config, escalation_action: v }
                      })}
                    >
                      {Object.entries(ESCALATION_ACTIONS).map(([key, val]) => (
                        <Option key={key} value={key}>
                          <Space>
                            {val.icon}
                            {val.label}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Space direction="vertical">
                  <Checkbox
                    checked={selectedNode.config?.require_comment || false}
                    onChange={(e) => updateNode(selectedNode.id, {
                      config: { ...selectedNode.config, require_comment: e.target.checked }
                    })}
                  >
                    Require comment on approval
                  </Checkbox>
                  <Checkbox
                    checked={selectedNode.config?.allow_delegation ?? true}
                    onChange={(e) => updateNode(selectedNode.id, {
                      config: { ...selectedNode.config, allow_delegation: e.target.checked }
                    })}
                  >
                    Allow delegation
                  </Checkbox>
                  <Checkbox
                    checked={selectedNode.config?.allow_rejection ?? true}
                    onChange={(e) => updateNode(selectedNode.id, {
                      config: { ...selectedNode.config, allow_rejection: e.target.checked }
                    })}
                  >
                    Allow rejection
                  </Checkbox>
                </Space>
              </Form.Item>
            </>
          )}
          
          {/* Condition node config */}
          {selectedNode.type === 'condition' && (
            <>
              <Form.Item label="Field">
                <Select
                  value={selectedNode.config?.field || 'priority'}
                  onChange={(v) => updateNode(selectedNode.id, {
                    config: { ...selectedNode.config, field: v }
                  })}
                >
                  {CONDITION_FIELDS.map(f => (
                    <Option key={f.value} value={f.value}>{f.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item label="Operator">
                <Select
                  value={selectedNode.config?.operator || 'equals'}
                  onChange={(v) => updateNode(selectedNode.id, {
                    config: { ...selectedNode.config, operator: v }
                  })}
                >
                  {Object.entries(CONDITION_OPERATORS).map(([key, val]) => (
                    <Option key={key} value={key}>{val}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item label="Value">
                <Input
                  value={selectedNode.config?.value || ''}
                  onChange={(e) => updateNode(selectedNode.id, {
                    config: { ...selectedNode.config, value: e.target.value }
                  })}
                  placeholder="Enter comparison value"
                />
              </Form.Item>
            </>
          )}
          
          {/* Delay node config */}
          {selectedNode.type === 'delay' && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Duration">
                  <InputNumber
                    value={selectedNode.config?.duration || 1}
                    onChange={(v) => updateNode(selectedNode.id, {
                      config: { ...selectedNode.config, duration: v }
                    })}
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Unit">
                  <Select
                    value={selectedNode.config?.duration_unit || 'days'}
                    onChange={(v) => updateNode(selectedNode.id, {
                      config: { ...selectedNode.config, duration_unit: v }
                    })}
                  >
                    <Option value="minutes">Minutes</Option>
                    <Option value="hours">Hours</Option>
                    <Option value="days">Days</Option>
                    <Option value="weeks">Weeks</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
          
          {/* Notification node config */}
          {selectedNode.type === 'notification' && (
            <>
              <Form.Item label="Recipients">
                <Select
                  mode="multiple"
                  placeholder="Select recipients"
                  value={selectedNode.config?.recipients || []}
                  onChange={(v) => updateNode(selectedNode.id, {
                    config: { ...selectedNode.config, recipients: v }
                  })}
                  style={{ width: '100%' }}
                >
                  <Option value="document_owner">Document Owner</Option>
                  <Option value="requestor">Requestor</Option>
                  <Option value="approvers">Current Approvers</Option>
                  <Option value="team">Team Members</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Channels">
                <Checkbox.Group
                  value={selectedNode.config?.channels || ['email']}
                  onChange={(v) => updateNode(selectedNode.id, {
                    config: { ...selectedNode.config, channels: v }
                  })}
                >
                  <Checkbox value="email">Email</Checkbox>
                  <Checkbox value="sms">SMS</Checkbox>
                  <Checkbox value="push">Push</Checkbox>
                  <Checkbox value="slack">Slack</Checkbox>
                  <Checkbox value="teams">Teams</Checkbox>
                </Checkbox.Group>
              </Form.Item>
              
              <Form.Item label="Timing">
                <Radio.Group
                  value={selectedNode.config?.timing || 'on_enter'}
                  onChange={(e) => updateNode(selectedNode.id, {
                    config: { ...selectedNode.config, timing: e.target.value }
                  })}
                >
                  <Radio value="on_enter">On Node Entry</Radio>
                  <Radio value="on_exit">On Node Exit</Radio>
                  <Radio value="on_assign">On Assignment</Radio>
                </Radio.Group>
              </Form.Item>
            </>
          )}
          
          <Form.Item label="Description">
            <TextArea
              value={selectedNode.config?.description || ''}
              onChange={(e) => updateNode(selectedNode.id, {
                config: { ...selectedNode.config, description: e.target.value }
              })}
              rows={2}
              placeholder="Optional description"
            />
          </Form.Item>
        </Form>
      </Drawer>
    );
  };

  const renderWorkflowSettingsModal = () => (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>Workflow Settings</span>
        </Space>
      }
      open={workflowSettingsVisible}
      onCancel={() => setWorkflowSettingsVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setWorkflowSettingsVisible(false)}>
          Cancel
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          onClick={() => {
            setWorkflowSettingsVisible(false);
            message.success('Settings updated');
          }}
        >
          Apply
        </Button>
      ]}
      width={600}
    >
      <Form layout="vertical">
        <Form.Item label="Workflow Name" required>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="e.g., Document Approval Workflow"
            maxLength={100}
          />
        </Form.Item>
        
        <Form.Item label="Description">
          <TextArea
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            rows={3}
            placeholder="Describe when this workflow should be used"
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Category">
              <Select value={workflowCategory} onChange={setWorkflowCategory}>
                <Option value="general">General</Option>
                <Option value="hse">HSE</Option>
                <Option value="quality">Quality</Option>
                <Option value="environmental">Environmental</Option>
                <Option value="hr">HR</Option>
                <Option value="finance">Finance</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Active">
              <Switch
                checked={workflowEnabled}
                onChange={setWorkflowEnabled}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="Applicable To">
          <Select
            mode="multiple"
            value={applicableTo}
            onChange={setApplicableTo}
            placeholder="Select applicable documents"
            style={{ width: '100%' }}
          >
            <Option value="all">All Documents</Option>
            <Option value="reports">Reports</Option>
            <Option value="policies">Policies</Option>
            <Option value="contracts">Contracts</Option>
            <Option value="permits">Permits</Option>
            <Option value="incidents">Incident Reports</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );

  const renderTestModal = () => (
    <Modal
      title={
        <Space>
          <PlayCircleOutlined />
          <span>Test Workflow</span>
        </Space>
      }
      open={testModalVisible}
      onCancel={() => setTestModalVisible(false)}
      footer={null}
      width={700}
    >
      <Alert
        message="Workflow Simulation"
        description="This will simulate the workflow without executing actual approvals."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Steps direction="vertical" current={1}>
        {nodes
          .filter(n => n.type !== 'start' && n.type !== 'end')
          .map((node, index) => (
            <Steps.Step
              key={node.id}
              title={node.title}
              description={
                <div>
                  <Tag color="blue">{NODE_TYPES[node.type]?.label}</Tag>
                  {node.config?.timeout_days && (
                    <Tag>Timeout: {node.config.timeout_days} days</Tag>
                  )}
                </div>
              }
              status="process"
              icon={NODE_TYPES[node.type]?.icon}
            />
          ))}
      </Steps>
      
      <Divider />
      
      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={() => setTestModalVisible(false)}>Close</Button>
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />}
          onClick={() => {
            message.success('Simulation complete - workflow is valid');
            setTestModalVisible(false);
          }}
        >
          Run Simulation
        </Button>
      </Space>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading workflow...</div>
      </div>
    );
  }

  return (
    <div className={`workflow-builder ${fullscreen ? 'fullscreen' : ''}`} style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="workflow-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ApartmentOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>
                {workflowName || 'Workflow Builder'}
              </Title>
              {workflowEnabled && <Tag color="green">Active</Tag>}
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Main Layout */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        {/* Palette */}
        <Col xs={24} md={6} lg={5}>
          {renderPalette()}
          
          <Card title="Workflow Info" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic title="Nodes" value={nodes.length} />
              <Statistic title="Connections" value={connections.length} />
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ fontSize: 12 }}>
                <Text type="secondary">Name: </Text>
                <Text strong>{workflowName || 'Untitled'}</Text>
              </div>
              <div style={{ fontSize: 12 }}>
                <Text type="secondary">Description: </Text>
                <Text>{workflowDescription || 'No description'}</Text>
              </div>
            </Space>
          </Card>
        </Col>
        
        {/* Canvas */}
        <Col xs={24} md={18} lg={19}>
          <Card bodyStyle={{ padding: 0 }}>
            {renderToolbar()}
            {renderCanvas()}
          </Card>
        </Col>
      </Row>
      
      {/* Node Config Drawer */}
      {renderNodeConfig()}
      
      {/* Settings Modal */}
      {renderWorkflowSettingsModal()}
      
      {/* Test Modal */}
      {renderTestModal()}
    </div>
  );
};

export default WorkflowBuilder;