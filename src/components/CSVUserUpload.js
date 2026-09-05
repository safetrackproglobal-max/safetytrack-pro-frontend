// src/components/CSVUserUpload.js
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Button, 
  Table, 
  Alert, 
  Progress, 
  Card, 
  Space, 
  Typography, 
  Tag,
  Modal,
  message,
  Tooltip,
  Steps,
  Result,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  FileExcelOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import SafetyProService from '../services/safetyproservice';

const { Title, Text } = Typography;
const { Step } = Steps;

const CSVUserUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [downloadTemplateLoading, setDownloadTemplateLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);

  // CSV template columns
  const csvTemplateColumns = [
    { title: 'First Name', dataIndex: 'first_name', key: 'first_name' },
    { title: 'Last Name', dataIndex: 'last_name', key: 'last_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'User Type', dataIndex: 'user_type', key: 'user_type' },
    { title: 'Subscription Plan', dataIndex: 'subscription_plan', key: 'subscription_plan' },
    { title: 'Country', dataIndex: 'country', key: 'country' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Company', dataIndex: 'company_name', key: 'company_name' },
    { title: 'Custom Role', dataIndex: 'custom_role', key: 'custom_role' },
    { 
      title: 'Send Welcome Email', 
      dataIndex: 'send_welcome_email', 
      key: 'send_welcome_email',
      render: (text) => text === 'true' ? 'Yes' : 'No'
    },
    { 
      title: 'Password', 
      dataIndex: 'password', 
      key: 'password',
      render: (text) => text ? '*****' : 'Auto-generate'
    },
  ];

  // Steps for the import process
  const steps = [
    {
      title: 'Upload CSV',
      description: 'Select your CSV file',
    },
    {
      title: 'Validate',
      description: 'Check for errors',
    },
    {
      title: 'Review',
      description: 'Preview the data',
    },
    {
      title: 'Import',
      description: 'Create users',
    },
  ];

  // Handle file selection
  const handleFileSelect = (file) => {
    setFile(file);
    setValidationResult(null);
    setImportResult(null);
    setCurrentStep(0);
    
    // Read and preview the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Parse first 5 rows for preview (excluding header)
        const previewRows = [];
        for (let i = 1; i < Math.min(6, lines.length); i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] ? values[index].trim() : '';
            });
            previewRows.push(row);
          }
        }
        
        setPreviewData(previewRows);
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    };
    reader.readAsText(file);
    
    return false; // Prevent automatic upload
  };

  // Download CSV template
  const handleDownloadTemplate = async () => {
    setDownloadTemplateLoading(true);
    try {
      const response = await SafetyProService.downloadUserCSVTemplate();
      
      if (response) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'user_creation_template.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        message.success('Template downloaded successfully');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      message.error('Failed to download template');
    } finally {
      setDownloadTemplateLoading(false);
    }
  };

  // Validate CSV file
  const handleValidateCSV = async () => {
    if (!file) {
      message.warning('Please select a CSV file first');
      return;
    }

    setValidating(true);
    setCurrentStep(1);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await SafetyProService.validateCSVFile(formData);
      
      if (response.success) {
        setValidationResult(response);
        setCurrentStep(2);
        message.success(`Validation complete: ${response.summary.valid_rows} valid rows`);
      } else {
        message.error(response.error || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Failed to validate CSV file');
    } finally {
      setValidating(false);
    }
  };

  // Import users from CSV
  const handleImportCSV = async () => {
    if (!file || !validationResult) {
      message.warning('Please validate the CSV file first');
      return;
    }

    if (validationResult.recommendation === 'needs_correction') {
      Modal.confirm({
        title: 'CSV Has Validation Errors',
        content: (
          <div>
            <p>The CSV file contains {validationResult.summary.invalid_rows} invalid rows.</p>
            <p>Do you want to proceed with import anyway?</p>
            <Alert 
              type="warning" 
              message="Only valid rows will be imported"
              style={{ marginTop: 10 }}
            />
          </div>
        ),
        okText: 'Import Valid Rows',
        cancelText: 'Cancel',
        onOk: performImport,
      });
    } else {
      performImport();
    }
  };

  const performImport = async () => {
    setUploading(true);
    setCurrentStep(3);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await SafetyProService.bulkCreateUsersFromCSV(formData);
      
      if (response.success) {
        setImportResult(response);
        message.success(`Successfully created ${response.summary.created} users`);
      } else {
        message.error(response.error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      message.error('Failed to import users');
    } finally {
      setUploading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
    setPreviewData([]);
    setCurrentStep(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render validation errors
  const renderValidationErrors = () => {
    if (!validationResult || !validationResult.validation_results.errors.length) {
      return null;
    }

    return (
      <Card 
        title="Validation Errors" 
        style={{ marginTop: 16 }}
        extra={<Tag color="red">{validationResult.summary.invalid_rows} errors</Tag>}
      >
        <Table
          dataSource={validationResult.validation_results.errors.slice(0, 10)}
          columns={[
            { title: 'Row', dataIndex: 'row', key: 'row', width: 80 },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { 
              title: 'Errors', 
              dataIndex: 'errors', 
              key: 'errors',
              render: (errors) => (
                <div>
                  {errors.map((error, idx) => (
                    <div key={idx} style={{ color: '#f5222d', fontSize: '12px' }}>
                      • {error}
                    </div>
                  ))}
                </div>
              )
            }
          ]}
          size="small"
          pagination={false}
        />
        {validationResult.validation_results.errors.length > 10 && (
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            Showing first 10 errors of {validationResult.validation_results.errors.length} total
          </Text>
        )}
      </Card>
    );
  };

  // Render import results
  const renderImportResults = () => {
    if (!importResult) return null;

    return (
      <Card 
        title="Import Results" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Statistic
              title="Created"
              value={importResult.summary.created}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
            <Statistic
              title="Failed"
              value={importResult.summary.failed}
              valueStyle={{ color: '#f5222d' }}
              prefix={<CloseCircleOutlined />}
            />
          </Space>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Success Rate"
                value={importResult.summary.success_rate}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Total Processed"
                value={importResult.summary.processed}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Time"
                value={new Date().toLocaleTimeString()}
              />
            </Card>
          </Col>
        </Row>

        {/* Successful imports */}
        {importResult.results.successful.length > 0 && (
          <Card size="small" title="Successfully Created Users" style={{ marginBottom: 16 }}>
            <Table
              dataSource={importResult.results.successful.slice(0, 5)}
              columns={[
                { title: 'Row', dataIndex: 'row', key: 'row', width: 80 },
                { title: 'User ID', dataIndex: 'user_id', key: 'user_id' },
                { title: 'Email', dataIndex: 'email', key: 'email' },
                { title: 'First Name', dataIndex: 'first_name', key: 'first_name' },
                { title: 'Last Name', dataIndex: 'last_name', key: 'last_name' },
              ]}
              size="small"
              pagination={false}
            />
            {importResult.results.successful.length > 5 && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                Showing first 5 of {importResult.results.successful.length} successful imports
              </Text>
            )}
          </Card>
        )}

        {/* Import errors */}
        {importResult.results.errors.length > 0 && (
          <Card size="small" title="Import Errors" style={{ marginBottom: 16 }}>
            <Table
              dataSource={importResult.results.errors.slice(0, 5)}
              columns={[
                { title: 'Row', dataIndex: 'row', key: 'row', width: 80 },
                { title: 'Email', dataIndex: 'email', key: 'email' },
                { title: 'Error', dataIndex: 'error', key: 'error' },
              ]}
              size="small"
              pagination={false}
            />
            {importResult.results.errors.length > 5 && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                Showing first 5 of {importResult.results.errors.length} errors
              </Text>
            )}
          </Card>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space>
            <Button 
              type="primary" 
              onClick={() => {
                // Refresh the page or update user list
                window.location.reload();
              }}
            >
              <ReloadOutlined /> Refresh User List
            </Button>
            <Button onClick={handleReset}>
              Import Another File
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <div className="csv-user-upload">
      <Card 
        title={
          <Space>
            <FileExcelOutlined />
            <span>Bulk User Creation via CSV</span>
          </Space>
        }
        extra={
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            loading={downloadTemplateLoading}
          >
            Download Template
          </Button>
        }
      >
        <Alert
          message="CSV Import Guide"
          description={
            <ul style={{ marginBottom: 0 }}>
              <li>Download the template for the correct format</li>
              <li>Required fields: First Name, Last Name, Email, User Type, Subscription Plan</li>
              <li>Maximum file size: 10MB</li>
              <li>Passwords left empty will be auto-generated</li>
              <li>Welcome emails are sent by default</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Progress Steps */}
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => (
            <Step 
              key={index} 
              title={step.title} 
              description={step.description}
              icon={index < currentStep ? <CheckCircleOutlined /> : null}
            />
          ))}
        </Steps>

        {/* File Upload Section */}
        {currentStep === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Upload.Dragger
              accept=".csv"
              beforeUpload={handleFileSelect}
              showUploadList={false}
              disabled={uploading || validating}
            >
              <p className="ant-upload-drag-icon">
                <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">
                {file ? file.name : 'Click or drag CSV file to this area'}
              </p>
              <p className="ant-upload-hint">
                Support for a single CSV file. Ensure correct format.
              </p>
              <Button type="primary" size="large">
                Select CSV File
              </Button>
            </Upload.Dragger>

            {/* File Preview */}
            {file && previewData.length > 0 && (
              <Card 
                title="CSV Preview (First 5 Rows)" 
                size="small" 
                style={{ marginTop: 24 }}
              >
                <Table
                  dataSource={previewData}
                  columns={csvTemplateColumns}
                  size="small"
                  pagination={false}
                  scroll={{ x: 1000 }}
                />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button 
                    type="primary" 
                    onClick={handleValidateCSV}
                    loading={validating}
                    icon={<CheckCircleOutlined />}
                  >
                    Validate CSV File
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Validation Results */}
        {currentStep >= 1 && validationResult && (
          <div>
            <Card 
              title="Validation Summary"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Rows"
                    value={validationResult.summary.total_rows}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Valid Rows"
                    value={validationResult.summary.valid_rows}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Invalid Rows"
                    value={validationResult.summary.invalid_rows}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Success Rate"
                    value={validationResult.summary.success_rate}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                {validationResult.recommendation === 'ready_to_import' ? (
                  <Alert
                    message="CSV is ready for import"
                    description="All rows are valid. You can proceed with the import."
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                ) : (
                  <Alert
                    message="CSV needs correction"
                    description={`Found ${validationResult.summary.invalid_rows} invalid rows. You can still import valid rows.`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Space>
                  <Button onClick={() => setCurrentStep(0)}>
                    Back to Upload
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleImportCSV}
                    loading={uploading}
                    disabled={validating}
                    icon={<TeamOutlined />}
                  >
                    Import Users
                  </Button>
                </Space>
              </div>
            </Card>

            {renderValidationErrors()}
          </div>
        )}

        {/* Import Results */}
        {importResult && renderImportResults()}

        {/* Actions at the bottom */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleReset} disabled={uploading}>
            Reset
          </Button>
          
          {currentStep === 0 && file && (
            <Button 
              type="primary" 
              onClick={handleValidateCSV}
              loading={validating}
            >
              Next: Validate
            </Button>
          )}
          
          {currentStep === 2 && validationResult && (
            <Button 
              type="primary" 
              onClick={handleImportCSV}
              loading={uploading}
            >
              Next: Import Users
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CSVUserUpload;