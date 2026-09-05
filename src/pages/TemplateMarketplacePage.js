import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Tag, Modal, Typography } from 'antd';
import { SearchOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

const TemplateMarketplacePage = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const templates = [
    {
      id: 1,
      title: 'Risk Assessment Template',
      category: 'Safety',
      description: 'Comprehensive risk assessment template for workplace safety evaluation',
      downloads: 1245,
      rating: 4.8,
      price: 'Free',
      tags: ['Safety', 'Assessment', 'Compliance']
    },
    {
      id: 2,
      title: 'Incident Report Form',
      category: 'Incident Management',
      description: 'Detailed incident reporting template with investigation sections',
      downloads: 892,
      rating: 4.6,
      price: 'Free',
      tags: ['Incident', 'Report', 'Investigation']
    },
    {
      id: 3,
      title: 'Safety Inspection Checklist',
      category: 'Inspections',
      description: 'Comprehensive safety inspection checklist for various environments',
      downloads: 1567,
      rating: 4.9,
      price: 'Premium',
      tags: ['Inspection', 'Checklist', 'Safety']
    },
    {
      id: 4,
      title: 'Emergency Response Plan',
      category: 'Emergency',
      description: 'Complete emergency response plan template with evacuation procedures',
      downloads: 734,
      rating: 4.7,
      price: 'Premium',
      tags: ['Emergency', 'Response', 'Plan']
    },
    {
      id: 5,
      title: 'COVID-19 Safety Protocol',
      category: 'Health',
      description: 'Pandemic safety measures and health protocol template',
      downloads: 2103,
      rating: 4.5,
      price: 'Free',
      tags: ['Health', 'COVID', 'Protocol']
    },
    {
      id: 6,
      title: 'Environmental Compliance Report',
      category: 'Environmental',
      description: 'Environmental compliance reporting template for regulatory requirements',
      downloads: 567,
      rating: 4.4,
      price: 'Premium',
      tags: ['Environmental', 'Compliance', 'Report']
    }
  ];

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchText.toLowerCase()) ||
    template.description.toLowerCase().includes(searchText.toLowerCase()) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setPreviewVisible(true);
  };

  const handleDownload = (template) => {
    console.log('Downloading template:', template.title);
    // Implement download logic here
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={1}>Template Marketplace</Title>
      <Text type="secondary">Browse and download professional safety document templates</Text>

      <div style={{ margin: '24px 0' }}>
        <Search
          placeholder="Search templates..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <Row gutter={[16, 16]}>
        {filteredTemplates.map((template) => (
          <Col xs={24} sm={12} lg={8} key={template.id}>
            <Card
              hoverable
              actions={[
                <EyeOutlined key="preview" onClick={() => handlePreview(template)} />,
                <DownloadOutlined key="download" onClick={() => handleDownload(template)} />
              ]}
            >
              <div style={{ marginBottom: '12px' }}>
                <Tag color={template.price === 'Free' ? 'green' : 'blue'}>
                  {template.price}
                </Tag>
                <Tag>{template.category}</Tag>
              </div>
              
              <Title level={4} style={{ marginBottom: '8px' }}>
                {template.title}
              </Title>
              
              <Text type="secondary" style={{ marginBottom: '12px', display: 'block' }}>
                {template.description}
              </Text>
              
              <div style={{ marginBottom: '12px' }}>
                {template.tags.map(tag => (
                  <Tag key={tag} style={{ marginBottom: '4px' }}>{tag}</Tag>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">⭐ {template.rating}</Text>
                <Text type="secondary">📥 {template.downloads} downloads</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={selectedTemplate?.title}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="download" type="primary" onClick={() => handleDownload(selectedTemplate)}>
            <DownloadOutlined /> Download Template
          </Button>
        ]}
        width={800}
      >
        {selectedTemplate && (
          <div>
            <Text strong>Category: </Text>
            <Tag>{selectedTemplate.category}</Tag>
            <br />
            <Text strong>Description: </Text>
            <Text>{selectedTemplate.description}</Text>
            <br /><br />
            <Text>This is a preview of the template content. The full template includes:</Text>
            <ul>
              <li>Professional formatting</li>
              <li>Customizable sections</li>
              <li>Industry-standard compliance guidelines</li>
              <li>Editable fields for your specific needs</li>
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TemplateMarketplacePage;