// src/components/documents/DocumentCompare.jsx

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal,
  Typography, Divider, Tag, Badge, Tooltip, message,
  Spin, Empty, Alert, Progress, Statistic, Tabs, List,
  Collapse, Table, Timeline, Avatar, Descriptions
} from 'antd';
import {
  DiffOutlined,
  SwapOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import * as Diff from 'diff';
import documentService from '../../services/documentService';
import './DocumentCompare.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentCompare = ({ 
  documents, 
  documentId = null,
  onClose,
  embedded = false 
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [leftDoc, setLeftDoc] = useState(null);
  const [rightDoc, setRightDoc] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [activeTab, setActiveTab] = useState('split');
  const [viewMode, setViewMode] = useState('split'); // split, unified, inline
  const [highlightChanges, setHighlightChanges] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleCompare = async () => {
    if (!leftDoc || !rightDoc) {
      message.warning('Please select two documents to compare');
      return;
    }
    
    if (leftDoc.id === rightDoc.id) {
      message.warning('Please select two different documents');
      return;
    }
    
    setLoading(true);
    try {
      const result = await documentService.compareDocuments(leftDoc.id, rightDoc.id);
      
      if (result.success) {
        setComparisonResult(result);
        message.success('Comparison complete');
      } else {
        message.error(result.error || 'Comparison failed');
      }
      
    } catch (error) {
      console.error('Comparison error:', error);
      message.error('Failed to compare documents');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompareVersions = async (docId, v1, v2) => {
    setLoading(true);
    try {
      const result = await documentService.compareDocumentVersions(docId, v1, v2);
      
      if (result.success) {
        setComparisonResult(result);
        message.success('Version comparison complete');
      } else {
        message.error(result.error || 'Comparison failed');
      }
      
    } catch (error) {
      console.error('Version comparison error:', error);
      message.error('Failed to compare versions');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSwap = () => {
    const temp = leftDoc;
    setLeftDoc(rightDoc);
    setRightDoc(temp);
    
    // Re-run comparison if both selected
    if (leftDoc && rightDoc) {
      setTimeout(handleCompare, 100);
    }
  };
  
  const handleExportComparison = () => {
    if (!comparisonResult) return;
    
    const content = comparisonResult.diff_text || 'No differences found';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Comparison exported');
  };
  
  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  // Render Document Selector
  const renderSelector = () => (
    <div className="comparison-selector">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={10}>
          <Select
            placeholder="Select First Document"
            style={{ width: '100%' }}
            onChange={(value) => {
              const doc = documents.find(d => d.id === value);
              setLeftDoc(doc);
            }}
            value={leftDoc?.id}
            showSearch
            optionFilterProp="children"
          >
            {documents.map(doc => (
              <Option key={doc.id} value={doc.id}>
                {doc.title} (v{doc.version}) - {doc.status}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={4} style={{ textAlign: 'center' }}>
          <Button 
            type="text" 
            icon={<SwapOutlined />} 
            onClick={handleSwap}
            disabled={!leftDoc || !rightDoc}
          />
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
            Swap
          </Text>
        </Col>
        <Col xs={24} md={10}>
          <Select
            placeholder="Select Second Document"
            style={{ width: '100%' }}
            onChange={(value) => {
              const doc = documents.find(d => d.id === value);
              setRightDoc(doc);
            }}
            value={rightDoc?.id}
            showSearch
            optionFilterProp="children"
          >
            {documents.map(doc => (
              <Option key={doc.id} value={doc.id}>
                {doc.title} (v{doc.version}) - {doc.status}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
      
      <Divider />
      
      <Row>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Space>
            <Button 
              type="primary" 
              onClick={handleCompare} 
              disabled={!leftDoc || !rightDoc || leftDoc.id === rightDoc.id}
              loading={loading}
              icon={<DiffOutlined />}
              size="large"
            >
              Compare Documents
            </Button>
            {comparisonResult && (
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleExportComparison}
              >
                Export
              </Button>
            )}
            {onClose && (
              <Button onClick={onClose}>Close</Button>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
  
  // Render Statistics
  const renderStats = () => {
    if (!comparisonResult || !showStats) return null;
    
    const stats = comparisonResult.stats;
    
    return (
      <div className="comparison-stats">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Similarity Score"
                value={comparisonResult.similarity_score || 0}
                suffix="%"
                valueStyle={{ 
                  color: (comparisonResult.similarity_score || 0) >= 80 ? '#52c41a' :
                         (comparisonResult.similarity_score || 0) >= 50 ? '#faad14' : '#f5222d'
                }}
              />
              <Progress 
                percent={comparisonResult.similarity_score || 0} 
                strokeColor={(comparisonResult.similarity_score || 0) >= 80 ? '#52c41a' : '#faad14'}
                showInfo={false}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Added"
                value={stats.added || 0}
                prefix={<PlusOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Removed"
                value={stats.removed || 0}
                prefix={<MinusOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Modified"
                value={stats.modified || 0}
                prefix={<EditOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Row>
          <Col span={24}>
            <Alert
              message="Comparison Summary"
              description={
                <div>
                  <Space>
                    <Tag color="green">{stats.added || 0} additions</Tag>
                    <Tag color="red">{stats.removed || 0} deletions</Tag>
                    <Tag color="orange">{stats.modified || 0} modifications</Tag>
                    <Tag color="blue">{stats.unchanged || 0} unchanged</Tag>
                  </Space>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      Change rate: {stats.change_percentage || 0}% of document changed
                    </Text>
                  </div>
                </div>
              }
              type="info"
              showIcon
            />
          </Col>
        </Row>
      </div>
    );
  };
  
  // Render Diff Viewer
  const renderDiff = () => {
    if (!comparisonResult) return null;
    
    const oldValue = comparisonResult.document1?.content || '';
    const newValue = comparisonResult.document2?.content || '';
    
    return (
      <div className="comparison-diff">
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button.Group>
              <Button 
                type={viewMode === 'split' ? 'primary' : 'default'}
                onClick={() => setViewMode('split')}
              >
                Split View
              </Button>
              <Button 
                type={viewMode === 'unified' ? 'primary' : 'default'}
                onClick={() => setViewMode('unified')}
              >
                Unified View
              </Button>
              <Button 
                type={viewMode === 'inline' ? 'primary' : 'default'}
                onClick={() => setViewMode('inline')}
              >
                Inline View
              </Button>
            </Button.Group>
            
            <Divider type="vertical" />
            
            <Switch
              checked={highlightChanges}
              onChange={setHighlightChanges}
              checkedChildren="Highlight"
              unCheckedChildren="Plain"
            />
            
            <Divider type="vertical" />
            
            <Tooltip title="Zoom In">
              <Button 
                icon={<ZoomInOutlined />} 
                onClick={() => setZoomLevel(Math.min(zoomLevel + 0.1, 2))}
              />
            </Tooltip>
            <Tooltip title="Zoom Out">
              <Button 
                icon={<ZoomOutOutlined />} 
                onClick={() => setZoomLevel(Math.max(zoomLevel - 0.1, 0.5))}
              />
            </Tooltip>
            <Tag>{Math.round(zoomLevel * 100)}%</Tag>
          </Space>
        </div>
        
        <div style={{ 
          border: '1px solid #f0f0f0', 
          borderRadius: '8px',
          overflow: 'hidden',
          fontSize: `${14 * zoomLevel}px`
        }}>
          <ReactDiffViewer
            oldValue={oldValue}
            newValue={newValue}
            splitView={viewMode === 'split'}
            showDiffOnly={false}
            leftTitle={comparisonResult.document1?.title || 'Document 1'}
            rightTitle={comparisonResult.document2?.title || 'Document 2'}
            styles={{
              diffContainer: {
                backgroundColor: '#fafafa'
              },
              diffRemoved: {
                backgroundColor: '#ffddd6',
                textDecoration: highlightChanges ? 'line-through' : 'none'
              },
              diffAdded: {
                backgroundColor: '#d4fcd9'
              },
              line: {
                fontSize: `${14 * zoomLevel}px`,
                lineHeight: 1.6
              }
            }}
          />
        </div>
      </div>
    );
  };
  
  // Render Changes List
  const renderChangesList = () => {
    if (!comparisonResult || !comparisonResult.changes) return null;
    
    const changes = comparisonResult.changes;
    const allChanges = [
      ...changes.additions.map(c => ({ type: 'addition', content: c })),
      ...changes.deletions.map(c => ({ type: 'deletion', content: c })),
      ...changes.modifications.map(c => ({ type: 'modification', content: c }))
    ];
    
    return (
      <Card title="Changes List" size="small">
        <List
          dataSource={allChanges}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  item.type === 'addition' ? 
                    <PlusOutlined style={{ color: '#52c41a' }} /> :
                    item.type === 'deletion' ? 
                      <MinusOutlined style={{ color: '#f5222d' }} /> :
                      <EditOutlined style={{ color: '#faad14' }} />
                }
                title={
                  <Tag color={
                    item.type === 'addition' ? 'green' :
                    item.type === 'deletion' ? 'red' : 'orange'
                  }>
                    {item.type.toUpperCase()}
                  </Tag>
                }
                description={item.content}
              />
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
    <div className="document-compare" style={{ padding: embedded ? '0' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <DiffOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
          <Title level={4} style={{ margin: 0 }}>Document Comparison</Title>
          <Badge status="processing" text="Live" />
        </Space>
        {comparisonResult && (
          <Space>
            <Button 
              icon={<PrinterOutlined />} 
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button 
              icon={<FullscreenOutlined />} 
              onClick={() => {
                const el = document.querySelector('.comparison-diff');
                if (el && el.requestFullscreen) {
                  el.requestFullscreen();
                }
              }}
            >
              Fullscreen
            </Button>
          </Space>
        )}
      </div>
      
      {/* Selector */}
      {renderSelector()}
      
      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Comparing documents...</div>
        </div>
      ) : comparisonResult ? (
        <>
          {renderStats()}
          
          <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: 16 }}>
            <TabPane tab={<span><DiffOutlined /> Diff View</span>} key="split">
              {renderDiff()}
            </TabPane>
            <TabPane tab={<span><ListOutlined /> Changes</span>} key="changes">
              {renderChangesList()}
            </TabPane>
            <TabPane tab={<span><HistoryOutlined /> Timeline</span>} key="timeline">
              <Card size="small">
                <Timeline>
                  <Timeline.Item color="green">
                    Document 1: {comparisonResult.document1?.title} (v{comparisonResult.document1?.version})
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {comparisonResult.document1?.updated_at}
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    Document 2: {comparisonResult.document2?.title} (v{comparisonResult.document2?.version})
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {comparisonResult.document2?.updated_at}
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="orange">
                    Changes Detected
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {comparisonResult.stats?.change_percentage || 0}% of document changed
                    </div>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </TabPane>
            <TabPane tab={<span><InfoCircleOutlined /> Details</span>} key="details">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Similarity Score">
                  <Progress 
                    percent={comparisonResult.similarity_score || 0}
                    strokeColor={(comparisonResult.similarity_score || 0) >= 80 ? '#52c41a' : '#faad14'}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Lines Added">
                  <Tag color="green">{comparisonResult.stats?.added || 0}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Lines Removed">
                  <Tag color="red">{comparisonResult.stats?.removed || 0}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Lines Modified">
                  <Tag color="orange">{comparisonResult.stats?.modified || 0}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Lines Unchanged">
                  <Tag color="blue">{comparisonResult.stats?.unchanged || 0}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Total Lines (Doc 1)">
                  {comparisonResult.stats?.total_lines1 || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Total Lines (Doc 2)">
                  {comparisonResult.stats?.total_lines2 || 0}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          </Tabs>
        </>
      ) : (
        <Card>
          <Empty 
            description="Select two documents to compare"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              onClick={handleCompare}
              disabled={!leftDoc || !rightDoc}
            >
              Compare Documents
            </Button>
          </Empty>
        </Card>
      )}
    </div>
  );
};

export default DocumentCompare;