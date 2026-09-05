// src/components/documents/OCRProcessor.jsx

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal, Upload,
  Progress, Table, Tag, Alert, Descriptions, Typography,
  Divider, List, Badge, Tooltip, message, Spin, Tabs,
  Collapse, Statistic, Empty, Switch, Popconfirm, Drawer,
  Timeline, Avatar, Skeleton, InputNumber, Checkbox, Radio
} from 'antd';
import {
  ScanOutlined,
  UploadOutlined,
  FileTextOutlined,
  SearchOutlined,
  DownloadOutlined,
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TagOutlined,
  BarChartOutlined,
  ReloadOutlined,
  ClearOutlined,
  SaveOutlined,
  HighlightOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './OCRProcessor.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Dragger } = Upload;

// ============================================================
// MAIN COMPONENT
// ============================================================

const OCRProcessor = ({ 
  onComplete, 
  onClose, 
  documentId = null,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [ocrResult, setOcrResult] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [structuredData, setStructuredData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('text');
  const [autoDetect, setAutoDetect] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [processingTime, setProcessingTime] = useState(0);
  const [confidence, setConfidence] = useState(0);
  
  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleOCR = async (file) => {
    if (!file) {
      message.warning('Please select a file');
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setOcrResult(null);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      const result = await documentService.performOCR(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success) {
        setOcrResult(result.result);
        setExtractedText(result.result.text);
        setStructuredData(result.result.structured_data || {});
        setConfidence(result.result.confidence || 0);
        setProcessingTime(result.result.processing_time || 0);
        
        message.success('OCR completed successfully');
        
        if (onComplete) {
          onComplete({
            text: result.result.text,
            structuredData: result.result.structured_data,
            confidence: result.result.confidence,
            fileInfo: {
              name: result.result.filename,
              type: result.result.file_type,
              size: result.result.file_size
            }
          });
        }
      } else {
        message.error(result.error || 'OCR failed');
      }
      
    } catch (error) {
      console.error('OCR error:', error);
      message.error(error.message || 'OCR processing failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchText || searchText.length < 2) {
      message.warning('Please enter at least 2 characters');
      return;
    }
    
    try {
      const result = await documentService.searchOCRText(extractedText, searchText);
      setSearchResults(result.matches || []);
      
      if (result.count === 0) {
        message.info('No matches found');
      } else {
        message.success(`Found ${result.count} matches`);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      message.error('Search failed');
    }
  };
  
  const handleClear = () => {
    setOcrResult(null);
    setExtractedText('');
    setStructuredData({});
    setSearchResults([]);
    setFileList([]);
    setProgress(0);
    setConfidence(0);
    message.info('Cleared OCR results');
  };
  
  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    message.success('Text copied to clipboard');
  };
  
  const handleDownloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-text-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Text downloaded');
  };
  
  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  // Render Upload Area
  const renderUploadArea = () => (
    <div className="upload-area">
      <Dragger
        fileList={fileList}
        onChange={({ fileList }) => setFileList(fileList)}
        beforeUpload={(file) => {
          handleOCR(file);
          return false;
        }}
        accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
        disabled={loading}
        maxCount={1}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Click or drag file to OCR</p>
        <p className="ant-upload-hint">
          Supported: PDF, JPG, JPEG, PNG, TIFF, BMP
          <br />
          Max file size: 50MB
        </p>
      </Dragger>
      
      {loading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} status="active" />
          <p style={{ textAlign: 'center', marginTop: 8, color: '#8c8c8c' }}>
            {progress < 100 ? 'Processing document...' : 'Finalizing OCR...'}
          </p>
        </div>
      )}
    </div>
  );
  
  // Render Results
  const renderResults = () => (
    <div className="ocr-results">
      {!ocrResult && !loading && (
        <Empty 
          description="Upload a document to extract text"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
      
      {ocrResult && (
        <>
          {/* Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Word Count"
                  value={ocrResult.word_count || 0}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Characters"
                  value={ocrResult.char_count || 0}
                  prefix={<FileOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Confidence"
                  value={confidence || 0}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: confidence > 70 ? '#52c41a' : confidence > 40 ? '#faad14' : '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Pages"
                  value={ocrResult.page_count || 1}
                  prefix={<FilePdfOutlined />}
                />
              </Card>
            </Col>
          </Row>
          
          <Alert
            message={`OCR Complete - ${ocrResult.filename}`}
            description={
              <Space>
                <Tag color={confidence > 70 ? 'green' : confidence > 40 ? 'orange' : 'red'}>
                  Confidence: {confidence}%
                </Tag>
                <Tag>Language: {ocrResult.language || 'English'}</Tag>
                <Tag>Pages: {ocrResult.page_count || 1}</Tag>
              </Space>
            }
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          {/* Tabs */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane 
              tab={<span><FileTextOutlined /> Text</span>} 
              key="text"
            >
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={handleCopyText}
                  >
                    Copy
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownloadText}
                  >
                    Download
                  </Button>
                  <Button 
                    icon={<ClearOutlined />} 
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                </Space>
              </div>
              
              <div className="ocr-text-area">
                <Input.TextArea
                  value={extractedText}
                  rows={12}
                  placeholder="Extracted text will appear here..."
                  style={{ 
                    fontFamily: 'monospace',
                    fontSize: 14,
                    lineHeight: 1.8
                  }}
                />
              </div>
            </TabPane>
            
            <TabPane 
              tab={<span><SearchOutlined /> Search</span>} 
              key="search"
            >
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Input.Search
                    placeholder="Search in text..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                    enterButton
                  />
                  <Button icon={<ClearOutlined />} onClick={() => {
                    setSearchText('');
                    setSearchResults([]);
                  }}>
                    Clear
                  </Button>
                </Space>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="search-results">
                  <List
                    dataSource={searchResults}
                    renderItem={(item, index) => (
                      <List.Item>
                        <List.Item.Meta
                          title={`Match ${index + 1}`}
                          description={
                            <div>
                              <div>{item.context}</div>
                              <div style={{ marginTop: 4 }}>
                                <Tag color="blue">Position: {item.position}</Tag>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ) : (
                <Empty 
                  description="Search for text in the document" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </TabPane>
            
            <TabPane 
              tab={<span><UserOutlined /> Extracted Data</span>} 
              key="data"
            >
              <Row gutter={[16, 16]}>
                {structuredData.names && structuredData.names.length > 0 && (
                  <Col span={12}>
                    <Card size="small" title="Names">
                      <List
                        size="small"
                        dataSource={structuredData.names}
                        renderItem={(item) => (
                          <List.Item>
                            <UserOutlined style={{ marginRight: 8 }} />
                            {item}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                )}
                
                {structuredData.emails && structuredData.emails.length > 0 && (
                  <Col span={12}>
                    <Card size="small" title="Emails">
                      <List
                        size="small"
                        dataSource={structuredData.emails}
                        renderItem={(item) => (
                          <List.Item>
                            <MailOutlined style={{ marginRight: 8 }} />
                            {item}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                )}
                
                {structuredData.phones && structuredData.phones.length > 0 && (
                  <Col span={12}>
                    <Card size="small" title="Phone Numbers">
                      <List
                        size="small"
                        dataSource={structuredData.phones}
                        renderItem={(item) => (
                          <List.Item>
                            <PhoneOutlined style={{ marginRight: 8 }} />
                            {item}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                )}
                
                {structuredData.dates && structuredData.dates.length > 0 && (
                  <Col span={12}>
                    <Card size="small" title="Dates">
                      <List
                        size="small"
                        dataSource={structuredData.dates}
                        renderItem={(item) => (
                          <List.Item>
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            {item}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                )}
                
                {structuredData.keywords && structuredData.keywords.length > 0 && (
                  <Col span={24}>
                    <Card size="small" title="Keywords">
                      <Space wrap>
                        {structuredData.keywords.map((keyword, idx) => (
                          <Tag key={idx} color="blue">{keyword}</Tag>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                )}
              </Row>
              
              {Object.keys(structuredData).every(key => 
                !structuredData[key] || structuredData[key].length === 0
              ) && (
                <Empty 
                  description="No structured data extracted" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </TabPane>
          </Tabs>
        </>
      )}
    </div>
  );
  
  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="ocr-processor" style={{ padding: embedded ? '0' : '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <ScanOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
          <Title level={4} style={{ margin: 0 }}>OCR Processor</Title>
          <Badge status="processing" text={loading ? 'Processing' : 'Ready'} />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => {
            handleClear();
            window.location.reload();
          }}>
            Reset
          </Button>
          {onClose && (
            <Button onClick={onClose}>Close</Button>
          )}
        </Space>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {renderUploadArea()}
        </Col>
        <Col span={24}>
          {renderResults()}
        </Col>
      </Row>
    </div>
  );
};

export default OCRProcessor;