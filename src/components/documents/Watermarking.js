// src/components/documents/Watermarking.jsx
// Dynamic document watermarking with user tracking, PDF injection,
// and confidentiality marking

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal, Form,
  message, Slider, Switch, ColorPicker, Radio, Checkbox, Tag,
  Divider, Typography, Alert, Spin, Tooltip, Badge, Progress,
  Drawer, Descriptions, Tabs, List, Empty, Upload, Popconfirm,
  Segmented, InputNumber, Statistic, Result, Steps
} from 'antd';
import {
  FileProtectOutlined, BgColorsOutlined, EyeOutlined,
  DownloadOutlined, SaveOutlined, ReloadOutlined, SettingOutlined,
  WarningOutlined, InfoCircleOutlined, LockOutlined, UserOutlined,
  ClockCircleOutlined, EnvironmentOutlined, GlobalOutlined,
  CopyOutlined, DeleteOutlined, PlusOutlined, EditOutlined,
  ThunderboltOutlined, SafetyCertificateOutlined, AuditOutlined,
  FilePdfOutlined, FileImageOutlined, FileWordOutlined,
  FileTextOutlined, CloudUploadOutlined, InboxOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
  EyeInvisibleOutlined, RobotOutlined, FingerprintOutlined,
  ScanOutlined, QrcodeOutlined, BarcodeOutlined, FullscreenOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './Watermarking.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;

// ============================================================
// CONSTANTS
// ============================================================

const WATERMARK_TYPES = {
  text: { label: 'Text', icon: <FileTextOutlined />, description: 'Simple text overlay' },
  diagonal: { label: 'Diagonal Text', icon: <EditOutlined />, description: 'Rotated diagonal text' },
  image: { label: 'Image/Logo', icon: <FileImageOutlined />, description: 'Company logo or image' },
  qr_code: { label: 'QR Code', icon: <QrcodeOutlined />, description: 'Scannable QR code' },
  barcode: { label: 'Barcode', icon: <BarcodeOutlined />, description: 'Linear barcode' },
  tiled: { label: 'Tiled Pattern', icon: <BgColorsOutlined />, description: 'Repeating pattern' },
  footer: { label: 'Footer Mark', icon: <FileTextOutlined />, description: 'Small footer text' },
  header: { label: 'Header Mark', icon: <FileTextOutlined />, description: 'Header text' },
  background: { label: 'Full Background', icon: <BgColorsOutlined />, description: 'Full-page background' }
};

const WATERMARK_POSITIONS = {
  center: { label: 'Center', x: 50, y: 50 },
  top_left: { label: 'Top Left', x: 15, y: 10 },
  top_center: { label: 'Top Center', x: 50, y: 10 },
  top_right: { label: 'Top Right', x: 85, y: 10 },
  middle_left: { label: 'Middle Left', x: 15, y: 50 },
  middle_right: { label: 'Middle Right', x: 85, y: 50 },
  bottom_left: { label: 'Bottom Left', x: 15, y: 90 },
  bottom_center: { label: 'Bottom Center', x: 50, y: 90 },
  bottom_right: { label: 'Bottom Right', x: 85, y: 90 },
  tile: { label: 'Tiled', x: 50, y: 50 }
};

const WATERMARK_TEMPLATES = {
  confidential: {
    label: 'CONFIDENTIAL',
    text: 'CONFIDENTIAL',
    color: '#f5222d',
    opacity: 0.15,
    fontSize: 60,
    rotation: -45
  },
  draft: {
    label: 'DRAFT',
    text: 'DRAFT',
    color: '#faad14',
    opacity: 0.2,
    fontSize: 80,
    rotation: -30
  },
  user_tracking: {
    label: 'User Tracking',
    text: '{user_name} | {timestamp} | {ip_address}',
    color: '#1890ff',
    opacity: 0.12,
    fontSize: 14,
    rotation: -45
  },
  internal_use: {
    label: 'INTERNAL USE ONLY',
    text: 'INTERNAL USE ONLY',
    color: '#722ed1',
    opacity: 0.15,
    fontSize: 50,
    rotation: -45
  },
  do_not_copy: {
    label: 'DO NOT COPY',
    text: 'DO NOT COPY',
    color: '#cf1322',
    opacity: 0.2,
    fontSize: 70,
    rotation: -45
  },
  proprietary: {
    label: 'PROPRIETARY',
    text: 'PROPRIETARY & CONFIDENTIAL',
    color: '#fa541c',
    opacity: 0.15,
    fontSize: 45,
    rotation: -45
  },
  custom: {
    label: 'Custom',
    text: '',
    color: '#1890ff',
    opacity: 0.15,
    fontSize: 60,
    rotation: -45
  }
};

const VARIABLES = {
  '{user_name}': 'Current user full name',
  '{user_email}': 'Current user email',
  '{user_id}': 'Current user ID',
  '{timestamp}': 'Current date and time',
  '{date}': 'Current date',
  '{time}': 'Current time',
  '{ip_address}': 'User IP address',
  '{document_title}': 'Document title',
  '{document_id}': 'Document ID',
  '{company_name}': 'Company name',
  '{version}': 'Document version',
  '{session_id}': 'Session identifier'
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const Watermarking = ({
  documentId = null,
  companyId = null,
  embedded = false,
  onUpdate = null
}) => {
  const { user } = useAuth();
  const previewRef = useRef(null);

  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [document, setDocument] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('config');
  
  // Watermark configuration
  const [enabled, setEnabled] = useState(false);
  const [watermarkType, setWatermarkType] = useState('diagonal');
  const [template, setTemplate] = useState('confidential');
  const [text, setText] = useState('CONFIDENTIAL');
  const [color, setColor] = useState('#f5222d');
  const [opacity, setOpacity] = useState(0.15);
  const [fontSize, setFontSize] = useState(60);
  const [rotation, setRotation] = useState(-45);
  const [position, setPosition] = useState('center');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('bold');
  const [tileSpacing, setTileSpacing] = useState(100);
  const [imageUrl, setImageUrl] = useState('');
  const [applyToPages, setApplyToPages] = useState('all');
  const [pageRange, setPageRange] = useState({ from: 1, to: 1 });
  
  // Advanced settings
  const [applyOnView, setApplyOnView] = useState(true);
  const [applyOnDownload, setApplyOnDownload] = useState(true);
  const [applyOnPrint, setApplyOnPrint] = useState(true);
  const [applyOnShare, setApplyOnShare] = useState(true);
  const [dynamicUserTracking, setDynamicUserTracking] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(false);
  const [includeBarcode, setIncludeBarcode] = useState(false);
  const [watermarkId, setWatermarkId] = useState(null);
  const [watermarkLog, setWatermarkLog] = useState([]);
  
  // Form
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadWatermarkSettings = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const [docData, settingsData, logData] = await Promise.all([
        documentService.getDocument(documentId),
        documentService.getWatermarkSettings(documentId),
        documentService.getWatermarkLog(documentId, { limit: 20 })
      ]);
      
      setDocument(docData);
      
      if (settingsData) {
        setSettings(settingsData);
        setEnabled(settingsData.enabled || false);
        setWatermarkType(settingsData.watermark_type || 'diagonal');
        setTemplate(settingsData.template || 'confidential');
        setText(settingsData.text || 'CONFIDENTIAL');
        setColor(settingsData.color || '#f5222d');
        setOpacity(settingsData.opacity ?? 0.15);
        setFontSize(settingsData.font_size || 60);
        setRotation(settingsData.rotation || -45);
        setPosition(settingsData.position || 'center');
        setFontFamily(settingsData.font_family || 'Arial');
        setFontWeight(settingsData.font_weight || 'bold');
        setTileSpacing(settingsData.tile_spacing || 100);
        setImageUrl(settingsData.image_url || '');
        setApplyToPages(settingsData.apply_to_pages || 'all');
        setPageRange(settingsData.page_range || { from: 1, to: 1 });
        setApplyOnView(settingsData.apply_on_view ?? true);
        setApplyOnDownload(settingsData.apply_on_download ?? true);
        setApplyOnPrint(settingsData.apply_on_print ?? true);
        setApplyOnShare(settingsData.apply_on_share ?? true);
        setDynamicUserTracking(settingsData.dynamic_user_tracking ?? true);
        setIncludeQrCode(settingsData.include_qr_code || false);
        setIncludeBarcode(settingsData.include_barcode || false);
        setWatermarkId(settingsData.id);
      }
      
      setWatermarkLog(logData.logs || []);
      
    } catch (error) {
      console.error('Failed to load watermark settings:', error);
      message.error('Failed to load watermark settings');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleTemplateChange = (templateKey) => {
    setTemplate(templateKey);
    const tmpl = WATERMARK_TEMPLATES[templateKey];
    if (tmpl) {
      setText(tmpl.text);
      setColor(tmpl.color);
      setOpacity(tmpl.opacity);
      setFontSize(tmpl.fontSize);
      setRotation(tmpl.rotation);
    }
  };
  
  const handleSaveSettings = async () => {
    if (!documentId) {
      message.warning('No document selected');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        document_id: documentId,
        enabled,
        watermark_type: watermarkType,
        template,
        text,
        color,
        opacity,
        font_size: fontSize,
        rotation,
        position,
        font_family: fontFamily,
        font_weight: fontWeight,
        tile_spacing: tileSpacing,
        image_url: imageUrl,
        apply_to_pages: applyToPages,
        page_range: pageRange,
        apply_on_view: applyOnView,
        apply_on_download: applyOnDownload,
        apply_on_print: applyOnPrint,
        apply_on_share: applyOnShare,
        dynamic_user_tracking: dynamicUserTracking,
        include_qr_code: includeQrCode,
        include_barcode: includeBarcode,
        company_id: companyId
      };
      
      const result = await documentService.saveWatermarkSettings(documentId, payload);
      setWatermarkId(result.id);
      message.success('Watermark settings saved');
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      message.error(error.message || 'Failed to save watermark settings');
    } finally {
      setSaving(false);
    }
  };
  
  const handleApplyWatermark = async () => {
    if (!documentId) return;
    
    setApplying(true);
    try {
      const result = await documentService.applyWatermark(documentId, {
        watermark_id: watermarkId,
        apply_to: 'both' // 'original', 'preview', 'both'
      });
      
      message.success('Watermark applied successfully');
      
      if (result.download_url) {
        Modal.success({
          title: 'Watermark Applied',
          content: (
            <div>
              <p>Watermarked document is ready for download.</p>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => window.open(result.download_url, '_blank')}
              >
                Download Watermarked PDF
              </Button>
            </div>
          )
        });
      }
      
      loadWatermarkSettings();
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to apply watermark:', error);
      message.error(error.message || 'Failed to apply watermark');
    } finally {
      setApplying(false);
    }
  };
  
  const handleRemoveWatermark = async () => {
    Modal.confirm({
      title: 'Remove Watermark',
      content: 'This will disable watermarking for this document. Continue?',
      onOk: async () => {
        try {
          await documentService.removeWatermark(documentId);
          setEnabled(false);
          message.success('Watermark removed');
          loadWatermarkSettings();
          if (onUpdate) onUpdate();
        } catch (error) {
          message.error('Failed to remove watermark');
        }
      }
    });
  };
  
  const handlePreview = async () => {
    try {
      const blob = await documentService.generateWatermarkPreview(documentId, {
        text, color, opacity, fontSize, rotation, position, template, watermarkType
      });
      
      const url = URL.createObjectURL(blob);
      Modal.info({
        title: 'Watermark Preview',
        width: 800,
        content: (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={url} 
              alt="Watermark Preview" 
              style={{ maxWidth: '100%', maxHeight: '60vh', border: '1px solid #f0f0f0' }}
            />
          </div>
        )
      });
    } catch (error) {
      message.error('Failed to generate preview');
    }
  };
  
  const handleUploadLogo = async (file) => {
    try {
      const result = await documentService.uploadWatermarkImage(file);
      setImageUrl(result.url);
      message.success('Logo uploaded');
    } catch (error) {
      message.error('Failed to upload logo');
    }
    return false;
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadWatermarkSettings();
  }, [loadWatermarkSettings]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const resolveVariables = (text) => {
    if (!text) return '';
    let resolved = text;
    
    const now = new Date();
    const values = {
      '{user_name}': user?.name || user?.email || 'Unknown User',
      '{user_email}': user?.email || 'unknown@company.com',
      '{user_id}': user?.id || 'N/A',
      '{timestamp}': now.toLocaleString(),
      '{date}': now.toLocaleDateString(),
      '{time}': now.toLocaleTimeString(),
      '{ip_address}': '192.168.1.1',
      '{document_title}': document?.title || 'Untitled',
      '{document_id}': documentId || 'N/A',
      '{company_name}': user?.company_name || 'Company',
      '{version}': document?.version || '1',
      '{session_id}': 'SESSION-' + Math.random().toString(36).substr(2, 9)
    };
    
    Object.entries(values).forEach(([key, value]) => {
      resolved = resolved.split(key).join(value);
    });
    
    return resolved;
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };
  
  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderWatermarkPreview = () => {
    const previewText = resolveVariables(text);
    const pos = WATERMARK_POSITIONS[position] || WATERMARK_POSITIONS.center;
    
    return (
      <div 
        ref={previewRef}
        className="watermark-preview-container"
        style={{
          position: 'relative',
          background: 'white',
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          padding: 0,
          minHeight: 400,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Mock document content */}
        <div style={{ 
          padding: 40, 
          width: '100%',
          opacity: 0.3,
          pointerEvents: 'none'
        }}>
          <div style={{ 
            height: 20, 
            background: '#f0f0f0', 
            marginBottom: 16, 
            width: '60%',
            borderRadius: 4
          }} />
          <div style={{ 
            height: 12, 
            background: '#f0f0f0', 
            marginBottom: 8, 
            width: '100%',
            borderRadius: 4
          }} />
          <div style={{ 
            height: 12, 
            background: '#f0f0f0', 
            marginBottom: 8, 
            width: '95%',
            borderRadius: 4
          }} />
          <div style={{ 
            height: 12, 
            background: '#f0f0f0', 
            marginBottom: 24, 
            width: '80%',
            borderRadius: 4
          }} />
          <div style={{ 
            height: 200, 
            background: '#f5f5f5', 
            marginBottom: 16,
            borderRadius: 8
          }} />
          <div style={{ 
            height: 12, 
            background: '#f0f0f0', 
            marginBottom: 8, 
            width: '100%',
            borderRadius: 4
          }} />
          <div style={{ 
            height: 12, 
            background: '#f0f0f0', 
            width: '70%',
            borderRadius: 4
          }} />
        </div>
        
        {/* Watermark overlay */}
        {enabled && watermarkType === 'tiled' ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${Math.floor(i / 3) * 33 + 10}%`,
                left: `${(i % 3) * 33 + 10}%`,
                transform: `rotate(${rotation}deg)`,
                color,
                opacity,
                fontSize: Math.min(fontSize * 0.4, 20),
                fontWeight,
                fontFamily,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                userSelect: 'none'
              }}
            >
              {previewText}
            </div>
          ))
        ) : enabled && (
          <div
            style={{
              position: 'absolute',
              top: `${pos.y}%`,
              left: `${pos.x}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              color,
              opacity,
              fontSize: Math.min(fontSize, 48),
              fontWeight,
              fontFamily,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              letterSpacing: 4
            }}
          >
            {previewText}
          </div>
        )}
        
        {/* Dynamic tracking footer */}
        {enabled && dynamicUserTracking && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              fontSize: 8,
              color: '#8c8c8c',
              opacity: 0.6
            }}
          >
            {user?.email} | {new Date().toLocaleString()} | Watermark #{watermarkId?.substr(0, 8)}
          </div>
        )}
      </div>
    );
  };
  
  const renderConfigTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card title="Watermark Configuration" size="small">
          <Form layout="vertical">
            <Form.Item label="Enable Watermark">
              <Switch
                checked={enabled}
                onChange={setEnabled}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </Form.Item>
            
            {enabled && (
              <>
                <Form.Item label="Watermark Type">
                  <Segmented
                    value={watermarkType}
                    onChange={setWatermarkType}
                    options={Object.entries(WATERMARK_TYPES).map(([key, value]) => ({
                      label: (
                        <Tooltip title={value.description}>
                          <Space size={4}>
                            {value.icon}
                            <span style={{ fontSize: 12 }}>{value.label}</span>
                          </Space>
                        </Tooltip>
                      ),
                      value: key
                    }))}
                    block
                  />
                </Form.Item>
                
                <Form.Item label="Template">
                  <Select
                    value={template}
                    onChange={handleTemplateChange}
                    style={{ width: '100%' }}
                  >
                    {Object.entries(WATERMARK_TEMPLATES).map(([key, value]) => (
                      <Option key={key} value={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{value.label}</span>
                          <div 
                            style={{
                              width: 20,
                              height: 20,
                              background: value.color,
                              opacity: value.opacity,
                              borderRadius: 4
                            }}
                          />
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item 
                  label="Watermark Text"
                  extra={
                    <Space wrap size={[4, 4]}>
                      {Object.entries(VARIABLES).map(([key, desc]) => (
                        <Tooltip key={key} title={desc}>
                          <Tag
                            style={{ cursor: 'pointer', fontSize: 11 }}
                            onClick={() => setText(text + ' ' + key)}
                          >
                            {key}
                          </Tag>
                        </Tooltip>
                      ))}
                    </Space>
                  }
                >
                  <TextArea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={2}
                    placeholder="Enter watermark text or use variables"
                    maxLength={200}
                    showCount
                  />
                </Form.Item>
                
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Color">
                      <ColorPicker
                        value={color}
                        onChange={(c) => setColor(c.toHexString())}
                        showText
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Position">
                      <Select value={position} onChange={setPosition}>
                        {Object.entries(WATERMARK_POSITIONS).map(([key, value]) => (
                          <Option key={key} value={key}>{value.label}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label={`Opacity: ${Math.round(opacity * 100)}%`}>
                      <Slider
                        value={opacity}
                        onChange={setOpacity}
                        min={0.01}
                        max={1}
                        step={0.01}
                        tooltip={{ formatter: (v) => `${Math.round(v * 100)}%` }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={`Font Size: ${fontSize}px`}>
                      <Slider
                        value={fontSize}
                        onChange={setFontSize}
                        min={8}
                        max={200}
                        step={2}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label={`Rotation: ${rotation}°`}>
                      <Slider
                        value={rotation}
                        onChange={setRotation}
                        min={-90}
                        max={90}
                        step={5}
                        marks={{ '-90': '-90°', '0': '0°', '90': '90°' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Font">
                      <Space.Compact style={{ width: '100%' }}>
                        <Select 
                          value={fontFamily} 
                          onChange={setFontFamily}
                          style={{ width: '60%' }}
                        >
                          <Option value="Arial">Arial</Option>
                          <Option value="Times New Roman">Times New Roman</Option>
                          <Option value="Courier New">Courier New</Option>
                          <Option value="Georgia">Georgia</Option>
                          <Option value="Verdana">Verdana</Option>
                        </Select>
                        <Select
                          value={fontWeight}
                          onChange={setFontWeight}
                          style={{ width: '40%' }}
                        >
                          <Option value="normal">Normal</Option>
                          <Option value="bold">Bold</Option>
                        </Select>
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                </Row>
                
                {watermarkType === 'tiled' && (
                  <Form.Item label={`Tile Spacing: ${tileSpacing}px`}>
                    <Slider
                      value={tileSpacing}
                      onChange={setTileSpacing}
                      min={50}
                      max={300}
                      step={10}
                    />
                  </Form.Item>
                )}
                
                {watermarkType === 'image' && (
                  <Form.Item label="Upload Logo">
                    <Dragger
                      beforeUpload={handleUploadLogo}
                      maxCount={1}
                      accept="image/*"
                      showUploadList={false}
                    >
                      <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                      <p className="ant-upload-text">Click or drag logo to upload</p>
                      <p className="ant-upload-hint">PNG, JPG, SVG recommended (transparent background)</p>
                    </Dragger>
                    {imageUrl && (
                      <div style={{ marginTop: 8 }}>
                        <img src={imageUrl} alt="Logo" style={{ maxHeight: 60 }} />
                      </div>
                    )}
                  </Form.Item>
                )}
              </>
            )}
          </Form>
        </Card>
        
        <Card title="Application Rules" size="small" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Apply When Viewing">
                <Switch checked={applyOnView} onChange={setApplyOnView} size="small" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Apply on Download">
                <Switch checked={applyOnDownload} onChange={setApplyOnDownload} size="small" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Apply on Print">
                <Switch checked={applyOnPrint} onChange={setApplyOnPrint} size="small" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Apply on Share">
                <Switch checked={applyOnShare} onChange={setApplyOnShare} size="small" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Dynamic User Tracking">
                <Switch 
                  checked={dynamicUserTracking} 
                  onChange={setDynamicUserTracking}
                  size="small"
                />
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                  Include user info in watermark
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Include QR Code">
                <Switch checked={includeQrCode} onChange={setIncludeQrCode} size="small" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <Form.Item label="Apply to Pages">
            <Radio.Group value={applyToPages} onChange={(e) => setApplyToPages(e.target.value)}>
              <Radio value="all">All Pages</Radio>
              <Radio value="first">First Page Only</Radio>
              <Radio value="last">Last Page Only</Radio>
              <Radio value="range">Custom Range</Radio>
            </Radio.Group>
          </Form.Item>
          
          {applyToPages === 'range' && (
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="From Page">
                  <InputNumber
                    value={pageRange.from}
                    onChange={(v) => setPageRange({ ...pageRange, from: v })}
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="To Page">
                  <InputNumber
                    value={pageRange.to}
                    onChange={(v) => setPageRange({ ...pageRange, to: v })}
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Card>
      </Col>
      
      <Col xs={24} lg={10}>
        <Card 
          title="Live Preview" 
          size="small"
          extra={
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              onClick={handlePreview}
            >
              Full Preview
            </Button>
          }
        >
          {renderWatermarkPreview()}
          
          <div style={{ marginTop: 16 }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Resolved text: 
                </Text>
                <div style={{ 
                  fontSize: 12, 
                  fontFamily: 'monospace',
                  background: '#fafafa',
                  padding: '4px 8px',
                  borderRadius: 4,
                  marginTop: 4,
                  wordBreak: 'break-all'
                }}>
                  {resolveVariables(text)}
                </div>
              </div>
            </Space>
          </div>
        </Card>
        
        <Card title="Actions" size="small" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSaveSettings}
              loading={saving}
              block
            >
              Save Settings
            </Button>
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={handleApplyWatermark}
              loading={applying}
              disabled={!enabled || !watermarkId}
              block
            >
              Apply & Generate PDF
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={() => message.info('Generate PDF first')}
              disabled={!enabled}
              block
            >
              Download Watermarked
            </Button>
            {settings?.enabled && (
              <Button 
                danger
                icon={<DeleteOutlined />} 
                onClick={handleRemoveWatermark}
                block
              >
                Remove Watermark
              </Button>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
  
  const renderTemplatesTab = () => (
    <Card title="Watermark Templates" size="small">
      <Row gutter={[16, 16]}>
        {Object.entries(WATERMARK_TEMPLATES).map(([key, tmpl]) => (
          <Col xs={24} sm={12} md={8} lg={6} key={key}>
            <Card
              hoverable
              size="small"
              onClick={() => {
                handleTemplateChange(key);
                setActiveTab('config');
                message.info(`Template "${tmpl.label}" applied`);
              }}
              style={{
                border: template === key ? '2px solid #1890ff' : '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  height: 100,
                  background: '#fafafa',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: 8
                }}
              >
                <div
                  style={{
                    color: tmpl.color,
                    opacity: tmpl.opacity * 3,
                    fontSize: Math.min(tmpl.fontSize * 0.3, 24),
                    fontWeight: 'bold',
                    transform: `rotate(${tmpl.rotation}deg)`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tmpl.text || tmpl.label}
                </div>
              </div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{tmpl.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
  
  const renderLogTab = () => (
    <Card 
      title="Watermark Application Log" 
      size="small"
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadWatermarkSettings}
          size="small"
        >
          Refresh
        </Button>
      }
    >
      {watermarkLog.length > 0 ? (
        <List
          dataSource={watermarkLog}
          renderItem={(log) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    style={{ 
                      backgroundColor: log.action === 'applied' ? '#52c41a' :
                                      log.action === 'removed' ? '#f5222d' : '#1890ff'
                    }}
                  >
                    {log.action === 'applied' ? <CheckCircleOutlined /> :
                     log.action === 'removed' ? <DeleteOutlined /> :
                     <FileProtectOutlined />}
                  </Avatar>
                }
                title={
                  <Space>
                    <span style={{ textTransform: 'capitalize' }}>
                      {log.action} - {log.watermark_template || 'Custom'}
                    </span>
                    <Tag color={
                      log.action === 'applied' ? 'green' :
                      log.action === 'removed' ? 'red' : 'blue'
                    }>
                      {log.action?.toUpperCase()}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>Applied to: {log.target || 'Document'}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      By: {log.user_name || 'System'} • {formatDate(log.created_at)}
                    </div>
                    {log.ip_address && (
                      <div style={{ fontSize: 11, color: '#bfbfbf' }}>
                        IP: {log.ip_address}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No watermark activity yet" />
      )}
    </Card>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  if (!documentId) {
    return (
      <div className="watermarking" style={{ padding: embedded ? 0 : 24 }}>
        <Result
          icon={<FileProtectOutlined style={{ color: '#8c8c8c' }} />}
          title="Select a Document"
          subTitle="Choose a document to configure watermarking"
        />
      </div>
    );
  }

  return (
    <div className="watermarking" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="watermarking-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <FileProtectOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Document Watermarking</Title>
              {document && <Tag color="blue">{document.title}</Tag>}
              {enabled && <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>}
            </Space>
          </Col>
          <Col>
            <Space>
              <Badge count={watermarkLog.length} size="small">
                <Button icon={<AuditOutlined />}>
                  Activity
                </Button>
              </Badge>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadWatermarkSettings}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Warning if disabled */}
      {!enabled && (
        <Alert
          message="Watermarking Disabled"
          description="Enable watermarking to protect this document with dynamic user tracking and confidentiality marking."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
          action={
            <Button 
              size="small" 
              type="primary"
              onClick={() => setEnabled(true)}
            >
              Enable Now
            </Button>
          }
        />
      )}
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'config',
            label: (
              <Space>
                <SettingOutlined />
                Configuration
              </Space>
            ),
            children: renderConfigTab()
          },
          {
            key: 'templates',
            label: (
              <Space>
                <CopyOutlined />
                Templates
              </Space>
            ),
            children: renderTemplatesTab()
          },
          {
            key: 'log',
            label: (
              <Space>
                <AuditOutlined />
                Activity Log
                {watermarkLog.length > 0 && (
                  <Badge count={watermarkLog.length} style={{ backgroundColor: '#1890ff' }} />
                )}
              </Space>
            ),
            children: renderLogTab()
          }
        ]}
      />
    </div>
  );
};

export default Watermarking;