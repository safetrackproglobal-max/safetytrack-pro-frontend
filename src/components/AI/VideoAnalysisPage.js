import React from 'react';
import { Card } from 'antd';
import VideoSafetyAnalysis from '../../components/AI/VideoSafetyAnalysis';

const VideoAnalysisPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Video Safety Analysis">
        <VideoSafetyAnalysis />
      </Card>
    </div>
  );
};

export default VideoAnalysisPage;