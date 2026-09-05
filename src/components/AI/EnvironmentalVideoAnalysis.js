import React, { useState } from 'react';
import { Upload, Button, Card, Alert, List, Tag, Progress, message } from 'antd';
import { UploadOutlined, PlayCircleOutlined } from '@ant-design/icons';

const VideoAnalysis = () => {
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const beforeUpload = (file) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      message.error('You can only upload video files!');
    }
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error('Video must be smaller than 100MB!');
    }
    return isVideo && isLt100M;
  };

  const handleUpload = async (file) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch('/api/ai/video/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result);
        message.success('Video analysis completed!');
      } else {
        message.error(`Analysis failed: ${result.error}`);
      }
    } catch (error) {
      message.error('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card title="Video Analysis for Environmental Compliance">
      <Upload
        beforeUpload={beforeUpload}
        customRequest={({ file }) => handleUpload(file)}
        showUploadList={false}
        accept="video/*"
      >
        <Button icon={<UploadOutlined />} size="large" loading={uploading}>
          Upload Video for Analysis
        </Button>
      </Upload>

      {analysis && (
        <div style={{ marginTop: 16 }}>
          <Alert
            message="Analysis Complete"
            description={`Analyzed ${analysis.video_duration}s video - Found ${analysis.violations_found} violations`}
            type="success"
            showIcon
          />

          <Card title="Risk Assessment" size="small" style={{ marginTop: 16 }}>
            <Progress 
              percent={analysis.risk_assessment.overall_risk_score}
              status={
                analysis.risk_assessment.risk_level === 'CRITICAL' ? 'exception' :
                analysis.risk_assessment.risk_level === 'HIGH' ? 'active' : 'normal'
              }
            />
            <Tag color={
              analysis.risk_assessment.risk_level === 'CRITICAL' ? 'red' :
              analysis.risk_assessment.risk_level === 'HIGH' ? 'orange' : 'green'
            }>
              {analysis.risk_assessment.risk_level}
            </Tag>
          </Card>

          <Card title="Violation Summary" size="small" style={{ marginTop: 16 }}>
            <List
              dataSource={Object.entries(analysis.violation_summary)}
              renderItem={([type, count]) => (
                <List.Item>
                  <Tag>{type}</Tag>
                  <span>{count} occurrences</span>
                </List.Item>
              )}
            />
          </Card>

          <Card title="AI Recommendations" size="small" style={{ marginTop: 16 }}>
            <List
              dataSource={analysis.risk_assessment.recommendations}
              renderItem={recommendation => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<PlayCircleOutlined />}
                    description={recommendation}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      )}
    </Card>
  );
};

export default VideoAnalysis;