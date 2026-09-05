import React from 'react';
import { PageHeader, message } from 'antd';
import FileUpload from '../../components/FileUpload/FileUpload';
import './UploadPage.css';

function UploadPage() {
  const handleUploadSuccess = (result) => {
    console.log('Upload successful:', result);
    // You can update your file list or state here
  };

  return (
    <div className="upload-page">
      <PageHeader
        title="File Upload"
        subTitle="Upload documents, images, and other files"
        style={{ padding: 0, marginBottom: 24 }}
      />
      
      <FileUpload 
        onUploadSuccess={handleUploadSuccess}
        folder="documents"
        multiple={true}
      />
    </div>
  );
}

export default UploadPage;