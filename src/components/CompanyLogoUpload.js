// src/components/CompanyLogoUpload.js
import React, { useState } from 'react';
import { Upload, Button, message, Modal, Spin, Avatar, Typography, Space } from 'antd';
import { 
  UploadOutlined, 
  CameraOutlined, 
  DeleteOutlined, 
  CheckOutlined,
  LoadingOutlined,
  EyeOutlined  // ✅ Added missing import
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';

const { Text } = Typography;

const CompanyLogoUpload = ({ 
  currentLogo, 
  companyName, 
  onLogoUpdate,
  companyId 
}) => {
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  // Handle file upload
  const handleUpload = async (file) => {
    setUploading(true);
    
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        message.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP, SVG)');
        setUploading(false);
        return false;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        message.error('Logo must be smaller than 5MB');
        setUploading(false);
        return false;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('company_id', companyId || user?.company_id);

      // Upload to server
      const response = await dashboardService.uploadCompanyLogo(formData);
      
      if (response && response.success) {
        const logoUrl = response.data?.logo_url || response.logo_url;
        message.success('Company logo uploaded successfully!');
        
        // Update parent component
        if (onLogoUpdate && logoUrl) {
          onLogoUpdate(logoUrl);
        }
        
        setUploading(false);
        return true;
      } else {
        message.error(response?.error || 'Failed to upload logo');
        setUploading(false);
        return false;
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload logo. Please try again.');
      setUploading(false);
      return false;
    }
  };

  // Handle logo removal
  const handleRemove = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.removeCompanyLogo(companyId || user?.company_id);
      
      if (response && response.success) {
        message.success('Company logo removed successfully');
        if (onLogoUpdate) {
          onLogoUpdate(null);
        }
      } else {
        message.error(response?.error || 'Failed to remove logo');
      }
    } catch (error) {
      console.error('Remove error:', error);
      message.error('Failed to remove logo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show preview
  const handlePreview = (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
  };

  // Upload props
  const uploadProps = {
    name: 'logo',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      handleUpload(file);
      return false;
    },
    accept: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
  };

  return (
    <div className="company-logo-upload">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Logo Display */}
        <div 
          className="logo-container"
          style={{ 
            position: 'relative',
            width: '120px',
            height: '120px',
            border: '2px dashed #d9d9d9',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: '#fafafa',
            cursor: currentLogo ? 'pointer' : 'default',
            transition: 'all 0.3s'
          }}
          onClick={() => {
            if (currentLogo) {
              handlePreview({ url: currentLogo });
            }
          }}
        >
          {loading ? (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} />} />
          ) : currentLogo ? (
            <img 
              src={currentLogo} 
              alt={companyName || 'Company Logo'} 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '8px'
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#999' }}>
              <CameraOutlined style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>No Logo</Text>
            </div>
          )}
          
          {/* Hover overlay for preview */}
          {currentLogo && (
            <div 
              className="logo-hover-overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s',
                color: '#fff',
                borderRadius: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
            >
              <EyeOutlined style={{ fontSize: 24 }} />
              <Text style={{ color: '#fff', marginLeft: 8 }}>Preview</Text>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <Space direction="vertical" size="middle">
          <div>
            <Text strong style={{ fontSize: '16px', display: 'block' }}>
              Company Logo
            </Text>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Recommended: Square image, 200x200px minimum
            </Text>
          </div>

          <Space>
            <Upload {...uploadProps}>
              <Button 
                icon={<UploadOutlined />} 
                loading={uploading}
                disabled={loading}
              >
                {currentLogo ? 'Change Logo' : 'Upload Logo'}
              </Button>
            </Upload>

            {currentLogo && (
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleRemove}
                loading={loading}
                disabled={uploading}
              >
                Remove
              </Button>
            )}
          </Space>
        </Space>
      </div>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={companyName || 'Company Logo'}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={400}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <img 
            src={previewImage} 
            alt={companyName || 'Company Logo'} 
            style={{ 
              maxWidth: '100%',
              maxHeight: '400px',
              objectFit: 'contain'
            }} 
          />
        </div>
      </Modal>
    </div>
  );
};

export default CompanyLogoUpload;