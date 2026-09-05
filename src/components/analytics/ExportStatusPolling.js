// src/components/analytics/ExportStatusPolling.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Alert, 
  Progress, 
  Button, 
  Space, 
  Card, 
  Typography, 
  Statistic, 
  Row, 
  Col,
  Tooltip,
  Badge,
  Modal,
  Timeline,
  Result,
  Divider,
  Popconfirm,
  notification,
  Spin,
  message
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  DownloadOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileZipOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ShareAltOutlined,
  CopyOutlined,
  EyeOutlined,
  SendOutlined,
  DeleteOutlined,
  CloudDownloadOutlined,
  ExportOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { analyticsService } from '../../services/analyticsService';
import './ExportStatusPolling.css';

const { Text, Title } = Typography;

const ExportStatusPolling = ({ 
  exportId, 
  onComplete, 
  onError, 
  onCancel,
  showDetails = true,
  autoDownload = false,
  showActions = true,
  size = 'default' 
}) => {
  // State Management
  const [status, setStatus] = useState('processing');
  const [progress, setProgress] = useState(0);
  const [exportDetails, setExportDetails] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [showTimeline, setShowTimeline] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  
  const pollingInterval = useRef(null);
  const startTime = useRef(Date.now());
  
  // Service functions replacement
  const checkExportStatus = async (id) => {
    try {
      const status = await analyticsService.getExportStatus(id);
      return {
        status: status.status || 'processing',
        progress: status.progress || 0,
        details: status
      };
    } catch (error) {
      throw new Error(`Failed to check export status: ${error.message}`);
    }
  };

  const downloadExport = async (id, filename) => {
    setDownloading(true);
    try {
      await analyticsService.downloadExport(id, filename);
      notification.success({
        message: 'Download Started',
        description: 'Your export file is now downloading.',
        duration: 3
      });
      return true;
    } catch (error) {
      notification.error({
        message: 'Download Failed',
        description: 'Could not download the export file.',
        duration: 5
      });
      throw error;
    } finally {
      setDownloading(false);
    }
  };

  const cancelExport = async (id) => {
    try {
      // Note: The service file doesn't have cancelExport function
      // You'll need to add it to analyticsService or handle differently
      // For now, we'll simulate cancellation
      notification.info({
        message: 'Export Cancelled',
        description: 'Export cancellation requested.',
        duration: 3
      });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to cancel export: ${error.message}`);
    }
  };

  const retryExport = async (id) => {
    try {
      const result = await analyticsService.retryExport(id);
      return result;
    } catch (error) {
      throw new Error(`Failed to retry export: ${error.message}`);
    }
  };

  const getExportDetails = async (id) => {
    try {
      const status = await analyticsService.getExportStatus(id);
      return {
        export_type: status.format || 'excel',
        module: status.module || 'unknown',
        file_size: status.file_size || 0,
        estimated_duration: status.estimated_duration || 60,
        filename: status.filename || `export-${id}.${status.format || 'xlsx'}`,
        download_url: status.download_url || `/api/exports/${id}/download`,
        retryable: status.retryable !== false
      };
    } catch (error) {
      throw new Error(`Failed to get export details: ${error.message}`);
    }
  };

  const shareExport = async (id) => {
    setSharing(true);
    try {
      const result = await analyticsService.shareExport(id, [], 'view');
      return result.share_url || `/exports/share/${id}`;
    } catch (error) {
      throw new Error(`Failed to share export: ${error.message}`);
    } finally {
      setSharing(false);
    }
  };

  // Initialize polling
  useEffect(() => {
    if (exportId) {
      initializePolling();
      fetchExportDetails();
    }
    
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [exportId]);

  // Auto-download when completed
  useEffect(() => {
    if (status === 'completed' && autoDownload && exportDetails?.download_url) {
      handleDownload();
    }
  }, [status, autoDownload, exportDetails]);

  const initializePolling = () => {
    startTime.current = Date.now();
    startPolling();
  };

  const fetchExportDetails = async () => {
    setLoading(true);
    try {
      const details = await getExportDetails(exportId);
      setExportDetails(details);
      calculateEstimatedTime(details);
    } catch (error) {
      console.warn('Could not fetch export details:', error);
      // Create fallback details
      setExportDetails({
        export_type: 'excel',
        module: 'unknown',
        file_size: 0,
        estimated_duration: 60,
        filename: `export-${exportId}.xlsx`,
        download_url: `/api/exports/${exportId}/download`,
        retryable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedTime = (details) => {
    if (details?.estimated_duration) {
      const remaining = Math.max(0, details.estimated_duration - Math.floor((Date.now() - startTime.current) / 1000));
      setEstimatedTime(remaining);
    }
  };

  const startPolling = useCallback(async () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    const poll = async () => {
      try {
        const result = await checkExportStatus(exportId);
        setPollingCount(prev => prev + 1);
        setStatus(result.status);
        setProgress(result.progress || 0);
        
        if (result.details) {
          setExportDetails(prev => ({ ...prev, ...result.details }));
        }

        // Handle status changes
        switch (result.status) {
          case 'completed':
            handleCompleted(result);
            break;
          case 'failed':
            handleFailed(result);
            break;
          case 'cancelled':
            handleCancelled(result);
            break;
          case 'processing':
            updateEstimatedTime();
            break;
        }
      } catch (error) {
        console.error('Polling error:', error);
        handlePollingError(error);
      }
    };

    // Initial poll
    await poll();
    
    // Set up interval polling with exponential backoff
    let delay = 2000;
    let attempt = 0;
    
    const intervalPoll = async () => {
      attempt++;
      delay = Math.min(delay * 1.5, 10000); // Max 10 seconds
      
      if (status === 'processing') {
        pollingInterval.current = setTimeout(async () => {
          if (['completed', 'failed', 'cancelled'].includes(status)) {
            clearInterval(pollingInterval.current);
            return;
          }
          await poll();
          intervalPoll();
        }, delay);
      }
    };

    if (status === 'processing') {
      intervalPoll();
    }
  }, [exportId, status]);

  const updateEstimatedTime = () => {
    if (startTime.current) {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      if (exportDetails?.estimated_duration) {
        const remaining = Math.max(0, exportDetails.estimated_duration - elapsed);
        setEstimatedTime(remaining);
      }
    }
  };

  const handleCompleted = (result) => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    // Show success notification
    notification.success({
      message: 'Export Ready',
      description: `Your ${exportDetails?.export_type || 'export'} is ready for download.`,
      duration: 5,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    });
    
    // Track completion in analytics
    analyticsService.trackPageView('export_completed', { 
      export_id: exportId,
      export_type: exportDetails?.export_type,
      generation_time: Math.floor((Date.now() - startTime.current) / 1000)
    });
    
    onComplete?.(result);
  };

  const handleFailed = (result) => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    setErrorDetails(result.error || 'Unknown error occurred');
    
    notification.error({
      message: 'Export Failed',
      description: result.error || 'There was an error generating your export.',
      duration: 5,
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    });
    
    onError?.(result.error);
  };

  const handleCancelled = (result) => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    notification.info({
      message: 'Export Cancelled',
      description: 'The export process was cancelled.',
      duration: 3
    });
  };

  const handlePollingError = (error) => {
    setRetryCount(prev => prev + 1);
    
    if (retryCount < 3) {
      notification.warning({
        message: 'Connection Issue',
        description: 'Retrying to connect...',
        duration: 3
      });
      
      // Retry after 5 seconds
      setTimeout(startPolling, 5000);
    } else {
      handleFailed({ error: 'Failed to connect to server. Please check your connection.' });
    }
  };

  const handleDownload = async () => {
    try {
      await downloadExport(exportId, exportDetails?.filename);
    } catch (error) {
      notification.error({
        message: 'Download Failed',
        description: 'Could not download the export file.',
        duration: 5
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelExport(exportId);
      onCancel?.();
    } catch (error) {
      notification.error({
        message: 'Cancellation Failed',
        description: 'Could not cancel the export.',
        duration: 5
      });
    }
  };

  const handleRetry = async () => {
    try {
      setStatus('processing');
      setProgress(0);
      setRetryCount(0);
      setErrorDetails(null);
      startTime.current = Date.now();
      
      await retryExport(exportId);
      startPolling();
    } catch (error) {
      notification.error({
        message: 'Retry Failed',
        description: 'Could not retry the export.',
        duration: 5
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = await shareExport(exportId);
      navigator.clipboard.writeText(shareUrl);
      notification.success({
        message: 'Link Copied',
        description: 'Export link copied to clipboard',
        duration: 3
      });
    } catch (error) {
      notification.error({
        message: 'Share Failed',
        description: 'Could not generate share link',
        duration: 5
      });
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'Calculating...';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatFileSize = (bytes) => {
    return analyticsService.formatFileSize(bytes);
  };

  const getExportTypeIcon = () => {
    const type = exportDetails?.export_type;
    const icons = {
      excel: <FileExcelOutlined style={{ color: '#52c41a' }} />,
      pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
      csv: <FileTextOutlined style={{ color: '#1890ff' }} />,
      json: <DatabaseOutlined style={{ color: '#722ed1' }} />,
      zip: <FileZipOutlined style={{ color: '#fa8c16' }} />
    };
    return icons[type] || <ExportOutlined />;
  };

  const renderProgressDetails = () => {
    const details = [
      { 
        label: 'Export Type', 
        value: exportDetails?.export_type?.toUpperCase() || 'Unknown',
        icon: getExportTypeIcon()
      },
      { 
        label: 'Module', 
        value: exportDetails?.module || 'Unknown',
        icon: <DatabaseOutlined />
      },
      { 
        label: 'File Size', 
        value: exportDetails?.file_size ? formatFileSize(exportDetails.file_size) : 'Calculating...',
        icon: <DatabaseOutlined />
      },
      { 
        label: 'Estimated Time', 
        value: formatTime(estimatedTime),
        icon: <ClockCircleOutlined />
      },
      { 
        label: 'Polling Attempts', 
        value: pollingCount,
        icon: <ReloadOutlined />
      }
    ];

    return (
      <div className="progress-details">
        <Row gutter={[16, 16]}>
          {details.map((detail, index) => (
            <Col xs={24} sm={12} key={index}>
              <Card size="small" className="detail-card">
                <Space>
                  {detail.icon}
                  <div>
                    <Text type="secondary" className="detail-label">{detail.label}</Text>
                    <div>
                      <Text strong className="detail-value">{detail.value}</Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderTimeline = () => {
    const events = [
      { time: 'Started', status: 'completed', icon: <ClockCircleOutlined /> },
      { time: 'Data Collection', status: progress > 20 ? 'completed' : 'processing', icon: <DatabaseOutlined /> },
      { time: 'Processing', status: progress > 50 ? 'completed' : progress > 20 ? 'processing' : 'pending', icon: <LoadingOutlined /> },
      { time: 'Formatting', status: progress > 80 ? 'completed' : progress > 50 ? 'processing' : 'pending', icon: <FileExcelOutlined /> },
      { time: 'Finalizing', status: status === 'completed' ? 'completed' : progress > 80 ? 'processing' : 'pending', icon: <CheckCircleOutlined /> }
    ];

    return (
      <div className="export-timeline">
        <Timeline>
          {events.map((event, index) => (
            <Timeline.Item
              key={index}
              color={event.status === 'completed' ? 'green' : event.status === 'processing' ? 'blue' : 'gray'}
              dot={event.icon}
            >
              {event.time}
              {event.status === 'processing' && ' (In Progress)'}
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    );
  };

  // Status-specific rendering
  const renderStatusContent = () => {
    switch (status) {
      case 'completed':
        return renderCompletedState();
      case 'failed':
        return renderFailedState();
      case 'cancelled':
        return renderCancelledState();
      default:
        return renderProcessingState();
    }
  };

  const renderProcessingState = () => {
    return (
      <Card className="export-status-card processing">
        <div className="status-header">
          <Space>
            <LoadingOutlined spin style={{ fontSize: 20, color: '#1890ff' }} />
            <Title level={5} style={{ margin: 0 }}>Generating Export</Title>
          </Space>
          {showActions && (
            <Popconfirm
              title="Cancel Export?"
              description="Are you sure you want to cancel this export?"
              onConfirm={handleCancel}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" type="text" danger icon={<CloseCircleOutlined />}>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </div>
        
        <div className="status-progress">
          <Progress
            percent={progress}
            status="active"
            strokeColor={{
              '0%': '#1890ff',
              '100%': '#52c41a',
            }}
            strokeWidth={8}
            showInfo={false}
          />
          <div className="progress-info">
            <Text>{progress}%</Text>
            <Text type="secondary">
              {estimatedTime ? `Estimated time remaining: ${formatTime(estimatedTime)}` : 'Processing...'}
            </Text>
          </div>
        </div>

        {showDetails && (
          <>
            {renderProgressDetails()}
            <Divider dashed />
            <Button 
              type="link" 
              onClick={() => setShowTimeline(!showTimeline)}
              icon={<EyeOutlined />}
              size="small"
            >
              {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
            </Button>
            {showTimeline && renderTimeline()}
          </>
        )}
      </Card>
    );
  };

  const renderCompletedState = () => {
    return (
      <Card className="export-status-card completed">
        <div className="status-header">
          <Space>
            <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
            <Title level={5} style={{ margin: 0 }}>Export Ready</Title>
          </Space>
          <Badge count="Ready" style={{ backgroundColor: '#52c41a' }} />
        </div>
        
        <Result
          status="success"
          title="Export Generated Successfully"
          subTitle={
            <Space direction="vertical">
              <Text>{exportDetails?.filename || 'Your export file'}</Text>
              <Text type="secondary">
                {exportDetails?.file_size ? formatFileSize(exportDetails.file_size) : ''}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Generated in {Math.floor((Date.now() - startTime.current) / 1000)} seconds
              </Text>
            </Space>
          }
          icon={getExportTypeIcon()}
          extra={[
            <Button 
              key="download" 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleDownload}
              loading={downloading}
              size={size}
            >
              Download Now
            </Button>,
            <Button 
              key="share" 
              icon={<ShareAltOutlined />} 
              onClick={handleShare}
              loading={sharing}
              size={size}
            >
              Share
            </Button>,
            <Button 
              key="copy" 
              icon={<CopyOutlined />} 
              onClick={() => {
                navigator.clipboard.writeText(exportDetails?.download_url || '');
                notification.success({ message: 'Link copied to clipboard' });
              }}
              size={size}
            >
              Copy Link
            </Button>
          ]}
        />
        
        {showDetails && (
          <>
            <Divider dashed />
            <div className="export-meta">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card size="small">
                    <Statistic 
                      title="Generation Time" 
                      value={Math.floor((Date.now() - startTime.current) / 1000)} 
                      suffix="seconds" 
                      prefix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card size="small">
                    <Statistic 
                      title="File Format" 
                      value={exportDetails?.export_type?.toUpperCase() || 'Unknown'} 
                      prefix={getExportTypeIcon()}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card size="small">
                    <Statistic 
                      title="File Size" 
                      value={exportDetails?.file_size ? formatFileSize(exportDetails.file_size) : 'Unknown'} 
                      prefix={<DatabaseOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card size="small">
                    <Statistic 
                      title="Polling Attempts" 
                      value={pollingCount} 
                      prefix={<ReloadOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Card>
    );
  };

  const renderFailedState = () => {
    return (
      <Card className="export-status-card failed">
        <div className="status-header">
          <Space>
            <CloseCircleOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
            <Title level={5} style={{ margin: 0 }}>Export Failed</Title>
          </Space>
          <Badge count="Failed" style={{ backgroundColor: '#ff4d4f' }} />
        </div>
        
        <Result
          status="error"
          title="Export Generation Failed"
          subTitle={
            <Space direction="vertical">
              <Text>{errorDetails || 'An error occurred during export generation'}</Text>
              {exportDetails?.retryable && (
                <Text type="secondary">You can retry the export or contact support.</Text>
              )}
            </Space>
          }
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          extra={[
            <Button 
              key="retry" 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRetry}
              disabled={!exportDetails?.retryable}
              size={size}
            >
              Retry Export
            </Button>,
            <Button 
              key="support" 
              icon={<WarningOutlined />}
              onClick={() => window.open('/support', '_blank')}
              size={size}
            >
              Contact Support
            </Button>,
            <Button 
              key="details" 
              icon={<InfoCircleOutlined />}
              onClick={() => setShowTimeline(!showTimeline)}
              size={size}
            >
              Show Details
            </Button>
          ]}
        />
        
        {showDetails && errorDetails && (
          <>
            <Divider dashed />
            <div className="error-details">
              <Title level={5}>Error Details</Title>
              <pre className="error-stack">
                {typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}
              </pre>
            </div>
          </>
        )}
      </Card>
    );
  };

  const renderCancelledState = () => {
    return (
      <Card className="export-status-card cancelled">
        <div className="status-header">
          <Space>
            <InfoCircleOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
            <Title level={5} style={{ margin: 0 }}>Export Cancelled</Title>
          </Space>
        </div>
        
        <Result
          status="info"
          title="Export Cancelled"
          subTitle="The export process was cancelled by the user."
          icon={<CloseCircleOutlined style={{ color: '#fa8c16' }} />}
          extra={[
            <Button 
              key="retry" 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRetry}
              size={size}
            >
              Start New Export
            </Button>,
            <Button 
              key="back" 
              onClick={onCancel}
              size={size}
            >
              Go Back
            </Button>
          ]}
        />
      </Card>
    );
  };

  // Loading state
  if (loading && !exportDetails) {
    return (
      <Card className="export-status-card loading">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading export details...</Text>
          </div>
        </div>
      </Card>
    );
  }

  // Simple mode for inline display
  if (!showDetails && size === 'small') {
    return (
      <Alert
        message={
          status === 'completed' ? 'Export Ready' :
          status === 'failed' ? 'Export Failed' :
          'Generating Export'
        }
        description={
          status === 'processing' ? (
            <Progress percent={progress} size="small" />
          ) : status === 'completed' ? (
            <Button size="small" type="link" onClick={handleDownload} loading={downloading}>
              Download
            </Button>
          ) : null
        }
        type={
          status === 'completed' ? 'success' :
          status === 'failed' ? 'error' :
          'info'
        }
        showIcon
        action={
          status === 'completed' && (
            <Button size="small" type="primary" icon={<DownloadOutlined />} onClick={handleDownload} loading={downloading}>
              Download
            </Button>
          )
        }
      />
    );
  }

  return renderStatusContent();
};

export default ExportStatusPolling;