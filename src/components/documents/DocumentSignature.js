// src/components/documents/DocumentSignature.jsx
// Digital Signature Component - e-signatures, approval signatures, audit trail

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Modal, Form, Input, Select,
  message, Spin, Alert, Divider, Typography, Tag, Tooltip,
  Avatar, List, Timeline, Badge, Progress, Popconfirm,
  Drawer, Descriptions, Tabs, Upload, Switch, Checkbox,
  Radio, DatePicker, Statistic, QRCode, Image, Empty
} from 'antd';
import {
  SignatureOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ReloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  QrcodeOutlined,
  ScanOutlined,
  FingerprintOutlined,
  VerifiedOutlined,
  HistoryOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import SignatureCanvas from 'react-signature-canvas';
import documentService from '../../services/documentService';
import './DocumentSignature.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// ============================================================
// CONSTANTS
// ============================================================

const SIGNATURE_TYPES = {
  draft: { label: 'Draft', color: 'default', icon: <FileTextOutlined /> },
  pending: { label: 'Pending Signature', color: 'warning', icon: <ClockCircleOutlined /> },
  signed: { label: 'Signed', color: 'success', icon: <CheckCircleOutlined /> },
  rejected: { label: 'Rejected', color: 'error', icon: <CloseCircleOutlined /> },
  expired: { label: 'Expired', color: 'error', icon: <CloseCircleOutlined /> },
  revoked: { label: 'Revoked', color: 'error', icon: <CloseCircleOutlined /> }
};

const SIGNATURE_PURPOSES = {
  approval: { label: 'Approval', icon: <CheckCircleOutlined /> },
  review: { label: 'Review', icon: <EyeOutlined /> },
  acknowledgement: { label: 'Acknowledgement', icon: <SafetyCertificateOutlined /> },
  consent: { label: 'Consent', icon: <CheckOutlined /> },
  authorization: { label: 'Authorization', icon: <LockOutlined /> },
  witness: { label: 'Witness', icon: <UserOutlined /> }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentSignature = ({
  documentId = null,
  documentTitle = '',
  onSignatureComplete,
  onCancel,
  embedded = false,
  companyId = null,
  userRole = 'admin',
  currentUser = null
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [signatureStatus, setSignatureStatus] = useState({
    total: 0,
    signed: 0,
    pending: 0,
    rejected: 0
  });
  
  // Signature Modal State
  const [signModalVisible, setSignModalVisible] = useState(false);
  const [signaturePurpose, setSignaturePurpose] = useState('approval');
  const [signatureType, setSignatureType] = useState('draw');
  const [signatureComment, setSignatureComment] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  // Signature Canvas
  const sigCanvasRef = useRef(null);
  const [canvasEmpty, setCanvasEmpty] = useState(true);
  
  // Signature Image
  const [signatureImage, setSignatureImage] = useState(null);
  
  // Signature History
  const [historyVisible, setHistoryVisible] = useState(false);
  const [signatureHistory, setSignatureHistory] = useState([]);
  
  // QR Code
  const [qrVisible, setQrVisible] = useState(false);
  const [qrData, setQrData] = useState('');

  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================
  
  const validateSignature = () => {
    if (signatureType === 'draw') {
      if (canvasEmpty || !sigCanvasRef.current) {
        message.error('Please draw your signature');
        return false;
      }
    } else if (signatureType === 'upload') {
      if (!signatureImage) {
        message.error('Please upload a signature image');
        return false;
      }
    } else if (signatureType === 'type') {
      // Type signature validation - will be handled by form
    }
    return true;
  };

  const validateComment = (comment) => {
    if (comment && comment.length > 500) {
      message.error('Comment cannot exceed 500 characters');
      return false;
    }
    return true;
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadSignatures = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const data = await documentService.getDocumentSignatures(documentId);
      
      const sigs = data.signatures || data.data || [];
      setSignatures(sigs);
      
      // Update stats
      setSignatureStatus({
        total: sigs.length || 0,
        signed: sigs.filter(s => s.status === 'signed').length,
        pending: sigs.filter(s => s.status === 'pending').length,
        rejected: sigs.filter(s => s.status === 'rejected').length
      });
      
    } catch (error) {
      console.error('Failed to load signatures:', error);
      message.error('Failed to load signatures');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const loadSignatureHistory = useCallback(async (signatureId) => {
    try {
      const data = await documentService.getSignatureHistory(signatureId);
      setSignatureHistory(data.history || []);
    } catch (error) {
      console.error('Failed to load signature history:', error);
    }
  }, []);

  // ============================================================
  // SIGNATURE OPERATIONS
  // ============================================================
  
  const handleSign = async () => {
    // Validate
    if (!validateSignature()) {
      return;
    }
    
    if (!validateComment(signatureComment)) {
      return;
    }
    
    setLoading(true);
    try {
      let signatureData = {};
      
      if (signatureType === 'draw') {
        // Get signature as image data URL
        const canvas = sigCanvasRef.current;
        if (canvas) {
          signatureData = {
            image: canvas.toDataURL('image/png'),
            type: 'draw'
          };
        }
      } else if (signatureType === 'upload') {
        signatureData = {
          image: signatureImage,
          type: 'upload'
        };
      } else if (signatureType === 'type') {
        // Typed signature will be rendered as text
        signatureData = {
          type: 'typed',
          text: signatureComment
        };
      }
      
      // Prepare signature data
      const data = {
        document_id: documentId,
        purpose: signaturePurpose,
        comment: signatureComment,
        signature_data: signatureData,
        company_id: companyId,
        signed_by: currentUser?.id || null,
        signed_at: new Date().toISOString(),
        ip_address: 'client', // Will be populated by backend
        user_agent: navigator.userAgent
      };
      
      const result = await documentService.createSignature(data);
      
      if (result.success) {
        message.success('Document signed successfully');
        setSignModalVisible(false);
        setSignatureComment('');
        setIsVerified(false);
        setSignatureImage(null);
        if (sigCanvasRef.current) {
          sigCanvasRef.current.clear();
        }
        loadSignatures();
        
        if (onSignatureComplete) onSignatureComplete(result);
        
        // Generate QR code for verification
        generateQRCode(result.signature_id);
      }
      
    } catch (error) {
      console.error('Signature failed:', error);
      message.error(error.message || 'Failed to sign document');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignature = async (signatureId) => {
    setVerificationLoading(true);
    try {
      const result = await documentService.verifySignature(signatureId);
      
      if (result.valid) {
        message.success('Signature verified successfully');
        setSelectedSignature(result.signature);
        setIsVerified(true);
      } else {
        message.error('Signature verification failed');
        setIsVerified(false);
      }
      
    } catch (error) {
      console.error('Verification failed:', error);
      message.error('Failed to verify signature');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleRevokeSignature = async (signatureId) => {
    try {
      await documentService.revokeSignature(signatureId, {
        reason: 'Revoked by user',
        company_id: companyId
      });
      message.success('Signature revoked successfully');
      loadSignatures();
    } catch (error) {
      console.error('Revocation failed:', error);
      message.error(error.message || 'Failed to revoke signature');
    }
  };

  // ============================================================
  // QR CODE GENERATION
  // ============================================================
  
  const generateQRCode = (signatureId) => {
    const verificationUrl = `${window.location.origin}/verify-signature/${signatureId}`;
    setQrData(verificationUrl);
    setQrVisible(true);
  };

  // ============================================================
  // CANVAS HANDLERS
  // ============================================================
  
  const handleCanvasBegin = () => {
    setCanvasEmpty(false);
  };

  const handleCanvasEnd = () => {
    // Check if canvas is empty
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL('image/png');
      setCanvasEmpty(data === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...');
    }
  };

  const clearCanvas = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setCanvasEmpty(true);
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    if (documentId) {
      loadSignatures();
    }
  }, [documentId, loadSignatures]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getSignatureStatusTag = (status) => {
    const config = SIGNATURE_TYPES[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getSignaturePurposeTag = (purpose) => {
    const config = SIGNATURE_PURPOSES[purpose];
    if (!config) return <Tag>{purpose}</Tag>;
    return <Tag icon={config.icon}>{config.label}</Tag>;
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

  // Render Signature Stats
  const renderStats = () => (
    <Row gutter={[16, 16]} className="signature-stats">
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-total">
          <Statistic
            title="Total Signatures"
            value={signatureStatus.total || 0}
            prefix={<SignatureOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-signed">
          <Statistic
            title="Signed"
            value={signatureStatus.signed || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-pending">
          <Statistic
            title="Pending"
            value={signatureStatus.pending || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-rejected">
          <Statistic
            title="Rejected"
            value={signatureStatus.rejected || 0}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Signatures List
  const renderSignaturesList = () => (
    <Card 
      title="Signature History" 
      size="small"
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setSignModalVisible(true)}
        >
          Sign Document
        </Button>
      }
    >
      {signatures.length > 0 ? (
        <List
          dataSource={signatures}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Tooltip title="Verify Signature">
                  <Button
                    type="text"
                    icon={<VerifiedOutlined />}
                    onClick={() => handleVerifySignature(item.id)}
                    loading={verificationLoading}
                  />
                </Tooltip>,
                <Tooltip title="View History">
                  <Button
                    type="text"
                    icon={<HistoryOutlined />}
                    onClick={() => {
                      setSelectedSignature(item);
                      setHistoryVisible(true);
                      loadSignatureHistory(item.id);
                    }}
                  />
                </Tooltip>,
                item.status === 'signed' && (
                  <Tooltip title="Revoke">
                    <Popconfirm
                      title="Revoke this signature?"
                      onConfirm={() => handleRevokeSignature(item.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Tooltip>
                )
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ 
                      backgroundColor: item.status === 'signed' ? '#52c41a' : 
                                     item.status === 'pending' ? '#faad14' : '#f5222d'
                    }}
                  />
                }
                title={
                  <Space>
                    <span>{item.signed_by?.name || item.signed_by || 'Unknown'}</span>
                    {getSignatureStatusTag(item.status)}
                    {getSignaturePurposeTag(item.purpose)}
                  </Space>
                }
                description={
                  <div>
                    <div>{item.comment || 'No comment'}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {formatDate(item.signed_at || item.created_at)}
                      {item.ip_address && ` • IP: ${item.ip_address}`}
                    </div>
                    {item.signature_data?.image && (
                      <div style={{ marginTop: 8 }}>
                        <img 
                          src={item.signature_data.image} 
                          alt="Signature" 
                          style={{ 
                            maxHeight: 60, 
                            maxWidth: 200,
                            border: '1px solid #f0f0f0',
                            borderRadius: 4,
                            padding: 4
                          }} 
                        />
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty 
          description="No signatures yet" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setSignModalVisible(true)}
          >
            Sign Document
          </Button>
        </Empty>
      )}
    </Card>
  );

  // Render Sign Modal
  const renderSignModal = () => (
    <Modal
      title={<Space><SignatureOutlined /> Sign Document</Space>}
      open={signModalVisible}
      onCancel={() => {
        setSignModalVisible(false);
        setSignatureComment('');
        setSignatureImage(null);
        setIsVerified(false);
        if (sigCanvasRef.current) {
          sigCanvasRef.current.clear();
        }
      }}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="signature-modal-content">
        <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Document">
            <Text strong>{documentTitle || 'Untitled Document'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Document ID">
            <Text code>{documentId}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Form layout="vertical">
          <Form.Item label="Signature Purpose">
            <Select 
              value={signaturePurpose} 
              onChange={setSignaturePurpose}
              style={{ width: '100%' }}
            >
              {Object.entries(SIGNATURE_PURPOSES).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.icon} {value.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Signature Method">
            <Radio.Group 
              value={signatureType} 
              onChange={(e) => setSignatureType(e.target.value)}
            >
              <Radio value="draw">Draw Signature</Radio>
              <Radio value="type">Type Signature</Radio>
              <Radio value="upload">Upload Signature</Radio>
            </Radio.Group>
          </Form.Item>

          {signatureType === 'draw' && (
            <Form.Item label="Draw Signature">
              <div className="signature-canvas-wrapper">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  canvasProps={{
                    className: 'signature-canvas',
                    width: 600,
                    height: 200,
                    style: {
                      border: '2px solid #d9d9d9',
                      borderRadius: '8px',
                      background: 'white',
                      width: '100%',
                      height: '200px',
                      cursor: 'crosshair'
                    }
                  }}
                  onBegin={handleCanvasBegin}
                  onEnd={handleCanvasEnd}
                  backgroundColor="rgba(255,255,255,1)"
                  penColor="black"
                  velocityFilterWeight={0.7}
                />
                <Button 
                  size="small" 
                  onClick={clearCanvas}
                  style={{ marginTop: 8 }}
                >
                  Clear
                </Button>
              </div>
            </Form.Item>
          )}

          {signatureType === 'type' && (
            <Form.Item label="Type Signature">
              <Input 
                placeholder="Type your full name as signature"
                value={signatureComment}
                onChange={(e) => setSignatureComment(e.target.value)}
                maxLength={100}
                style={{ fontSize: 20, fontFamily: 'cursive' }}
              />
            </Form.Item>
          )}

          {signatureType === 'upload' && (
            <Form.Item label="Upload Signature">
              <Upload
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setSignatureImage(e.target.result);
                  };
                  reader.readAsDataURL(file);
                  return false;
                }}
                maxCount={1}
                accept="image/png,image/jpeg"
              >
                <Button icon={<UploadOutlined />}>Upload Signature Image</Button>
              </Upload>
              {signatureImage && (
                <div style={{ marginTop: 8 }}>
                  <img 
                    src={signatureImage} 
                    alt="Signature" 
                    style={{ 
                      maxHeight: 100, 
                      maxWidth: 300,
                      border: '1px solid #f0f0f0',
                      borderRadius: 4,
                      padding: 8
                    }} 
                  />
                  <Button 
                    size="small" 
                    danger 
                    onClick={() => setSignatureImage(null)}
                    style={{ marginLeft: 8 }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Form.Item>
          )}

          <Form.Item label="Comment (Optional)">
            <TextArea
              value={signatureComment}
              onChange={(e) => setSignatureComment(e.target.value)}
              placeholder="Add a comment about this signature..."
              rows={2}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Checkbox checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)}>
              I confirm that I am the authorized signatory and understand the legal implications of this signature.
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setSignModalVisible(false);
                setSignatureComment('');
                setSignatureImage(null);
                if (sigCanvasRef.current) {
                  sigCanvasRef.current.clear();
                }
              }}>Cancel</Button>
              <Button 
                type="primary" 
                onClick={handleSign} 
                loading={loading}
                disabled={!isVerified}
                icon={<SignatureOutlined />}
              >
                Sign Document
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );

  // Render History Drawer
  const renderHistoryDrawer = () => (
    <Drawer
      title={<Space><HistoryOutlined /> Signature History</Space>}
      open={historyVisible}
      onClose={() => setHistoryVisible(false)}
      width={600}
    >
      {signatureHistory.length > 0 ? (
        <Timeline>
          {signatureHistory.map((item, index) => (
            <Timeline.Item 
              key={index}
              color={
                item.action === 'signed' ? 'green' :
                item.action === 'revoked' ? 'red' :
                item.action === 'verified' ? 'blue' : 'gray'
              }
            >
              <Card size="small">
                <div>
                  <Space>
                    <strong>{item.action?.toUpperCase()}</strong>
                    {item.user && <Tag icon={<UserOutlined />}>{item.user}</Tag>}
                  </Space>
                  {item.details && (
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      {item.details}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty description="No signature history available" />
      )}
    </Drawer>
  );

  // Render QR Code Modal
  const renderQRModal = () => (
    <Modal
      title={<Space><QrcodeOutlined /> Signature Verification</Space>}
      open={qrVisible}
      onCancel={() => setQrVisible(false)}
      footer={[
        <Button key="close" onClick={() => setQrVisible(false)}>
          Close
        </Button>,
        <Button key="download" type="primary" icon={<DownloadOutlined />}>
          Download QR
        </Button>
      ]}
      width={400}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <QRCode value={qrData} size={200} />
        <div style={{ marginTop: 16 }}>
          <Text strong>Scan to Verify</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Use this QR code to verify the signature authenticity
          </Text>
        </div>
        <div style={{ marginTop: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
          <Text code style={{ fontSize: 11, wordBreak: 'break-all' }}>{qrData}</Text>
        </div>
      </div>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="document-signature">
      {/* Header */}
      <div className="signature-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <SignatureOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Document Signatures</Title>
            <Badge 
              status={signatureStatus.signed > 0 ? 'success' : 'warning'} 
              text={signatureStatus.signed > 0 ? `${signatureStatus.signed} signed` : 'No signatures'} 
            />
          </Space>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Signatures List */}
      {renderSignaturesList()}

      {/* Modals */}
      {renderSignModal()}
      {renderHistoryDrawer()}
      {renderQRModal()}
    </div>
  );
};

export default DocumentSignature;