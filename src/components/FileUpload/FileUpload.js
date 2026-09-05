import React, { useState, useRef } from 'react';
import { Upload, Button, Progress, Card, Space, Typography, Tag } from 'antd';
import { UploadOutlined, FileOutlined, CloudOutlined } from '@ant-design/icons';
import { useFileUpload } from '../../hooks/useFileUpload';
import './FileUpload.css';

const { Title, Text } = Typography;
const { Dragger } = Upload;

function FileUpload({ onUploadSuccess, folder = 'general', multiple = false }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [storageStatus, setStorageStatus] = useState(null);
  const fileInputRef = useRef();
  
  const { uploading, progress, uploadStatus, uploadFile, fileUtils } = useFileUpload();

  const handleFileSelect = (file) => {
    if (!fileUtils.validateFileType(file)) {
      alert('File type not allowed');
      return false;
    }

    if (!fileUtils.validateFileSize(file)) {
      alert('File size too large (max 10MB)');
      return false;
    }

    setSelectedFiles(prev => [...prev, file]);
    return false; // Prevent automatic upload
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      message.warning('Please select files to upload');
      return;
    }

    for (const file of selectedFiles) {
      const result = await uploadFile(file, folder);
      if (result && onUploadSuccess) {
        onUploadSuccess(result);
      }
    }

    // Clear selected files after upload
    setSelectedFiles([]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const checkStorageStatus = async () => {
    try {
      const status = await uploadService.getStorageStatus();
      setStorageStatus(status);
    } catch (error) {
      message.error('Failed to check storage status');
    }
  };

  const uploadProps = {
    beforeUpload: handleFileSelect,
    multiple: multiple,
    showUploadList: false,
    disabled: uploading,
  };

  return (
    <div className="file-upload-container">
      <Card 
        title={
          <Space>
            <CloudOutlined />
            <span>File Upload</span>
            {storageStatus && (
              <Tag color={storageStatus.connected ? 'green' : 'red'}>
                {storageStatus.connected ? 'Cloud Storage Connected' : 'Local Storage Only'}
              </Tag>
            )}
          </Space>
        }
        extra={
          <Button 
            type="link" 
            onClick={checkStorageStatus}
            loading={uploading}
          >
            Check Storage
          </Button>
        }
        className="upload-card"
      >
        <Dragger {...uploadProps} className="upload-dragger">
          <div className="upload-area">
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag files to upload
            </p>
            <p className="ant-upload-hint">
              Supports documents, images, PDFs (max 10MB each)
            </p>
          </div>
        </Dragger>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <Title level={5} style={{ marginTop: 16 }}>
              Selected Files ({selectedFiles.length})
            </Title>
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <Space>
                  <FileOutlined />
                  <Text>{file.name}</Text>
                  <Text type="secondary">
                    ({fileUtils.formatFileSize(file.size)})
                  </Text>
                  <Button 
                    type="link" 
                    danger 
                    size="small"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    Remove
                  </Button>
                </Space>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="upload-progress">
            <Progress 
              percent={progress} 
              status={uploadStatus === 'error' ? 'exception' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary">
              {progress === 100 ? 'Processing...' : `Uploading... ${progress}%`}
            </Text>
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && !uploading && (
          <div className="upload-actions">
            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploading}
              disabled={selectedFiles.length === 0}
              icon={<UploadOutlined />}
            >
              Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
            </Button>
            <Button 
              onClick={() => setSelectedFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default FileUpload;