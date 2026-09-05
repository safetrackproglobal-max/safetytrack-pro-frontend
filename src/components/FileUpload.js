import React, { useState } from 'react';
import { Upload, Button, message, Card } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

function FileUpload() {
  const [fileList, setFileList] = useState([]);

  const props = {
    name: 'file',
    multiple: true,
    action: '/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        setFileList(info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ color: '#1890ff' }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      default:
        return <FileOutlined />;
    }
  };

  return (
    <Card title="Document Upload" style={{ marginBottom: 24 }}>
      <Dragger {...props} style={{ padding: 20 }}>
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">Click or drag files to this area to upload</p>
        <p className="ant-upload-hint">
          Supports single or bulk upload. Strictly prohibited from uploading company data or other banned files.
        </p>
      </Dragger>

      {fileList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Uploaded Files:</h4>
          {fileList.map(file => (
            <div key={file.uid} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: 8, 
              border: '1px solid #d9d9d9', 
              borderRadius: 4,
              marginBottom: 8 
            }}>
              {getFileIcon(file.name)}
              <span style={{ marginLeft: 8, flex: 1 }}>{file.name}</span>
              <span style={{ color: '#999' }}>{file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default FileUpload;