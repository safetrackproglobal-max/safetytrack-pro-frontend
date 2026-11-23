// "Today's toolbox talk" card shown on every dashboard: today's talk (or one-click generation), streak and
// monthly delivery stats, and a quick "type a topic" box that opens the full generator.
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Card, Input, Skeleton, Space, Statistic, Tag, Typography, message, Row, Col } from 'antd';
import {
  SoundOutlined, ThunderboltOutlined, FireOutlined, TeamOutlined, CheckCircleOutlined, RightOutlined,
} from '@ant-design/icons';
import toolboxService, { errorText } from '../../services/toolboxService';

const { Text } = Typography;

const ToolboxTalkWidget = ({ compact = false }) => {
  const history = useHistory();
  const [state, setState] = useState({ loading: true, data: null });
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await toolboxService.today();
      setState({ loading: false, data: res?.data || null });
    } catch (e) {
      setState({ loading: false, data: null });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await toolboxService.generate({ mode: 'auto', duration: 10, language: 'en' });
      const id = res?.data?.id;
      if (id) history.push(`/toolbox-talks?id=${id}`);
    } catch (e) {
      message.error(errorText(e, 'Could not generate the toolbox talk'));
    } finally {
      setGenerating(false);
    }
  };

  const openTopic = () => {
    const t = topic.trim();
    history.push(t ? `/toolbox-talks?topic=${encodeURIComponent(t.slice(0, 200))}` : '/toolbox-talks');
  };

  const data = state.data;
  if (!state.loading && data && data.available === false) return null;   // feature not installed yet
  const talk = data?.talk;
  const stats = data?.stats || {};

  return (
    <Card
      className="toolbox-widget"
      size="small"
      style={{ marginBottom: 16, borderRadius: 12, borderLeft: '4px solid #fa8c16' }}
      title={(
        <Space wrap>
          <SoundOutlined style={{ color: '#fa8c16' }} />
          <span>Today&apos;s Toolbox Talk</span>
          {talk && (talk.status === 'delivered'
            ? <Tag color="green" icon={<CheckCircleOutlined />}>Delivered</Tag>
            : <Tag color="orange">Ready to deliver</Tag>)}
        </Space>
      )}
      extra={<Button type="link" size="small" onClick={() => history.push('/toolbox-talks')}>All talks <RightOutlined /></Button>}
    >
      {state.loading ? <Skeleton active paragraph={{ rows: 2 }} /> : (
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} md={compact ? 24 : 14}>
            {talk ? (
              <div>
                <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>{talk.title}</Text>
                <Space size={4} wrap style={{ marginBottom: 10 }}>
                  <Tag>{talk.duration_minutes} min</Tag>
                  <Tag color={talk.mode === 'auto' ? 'blue' : 'purple'}>{talk.mode === 'auto' ? 'From your records' : 'Custom topic'}</Tag>
                  {talk.attendee_count > 0 && <Tag icon={<TeamOutlined />}>{talk.attendee_count} attended</Tag>}
                </Space>
                <Space wrap>
                  <Button type="primary" onClick={() => history.push(`/toolbox-talks?id=${talk.id}`)}>Open talk</Button>
                  {talk.status !== 'delivered' && (
                    <Button onClick={() => history.push(`/toolbox-talks?id=${talk.id}&deliver=1`)}>Record attendance</Button>
                  )}
                </Space>
              </div>
            ) : (
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 10 }}>
                  No talk yet today. Generate one from your latest incidents, near misses and today&apos;s weather in seconds.
                </Text>
                <Button type="primary" icon={<ThunderboltOutlined />} loading={generating} onClick={generate}>
                  {generating ? 'Reading your records…' : "Generate today's talk"}
                </Button>
              </div>
            )}
            <Input.Search
              style={{ marginTop: 12, maxWidth: 460 }}
              placeholder="Or type a topic, e.g. working near live traffic"
              enterButton="Create"
              maxLength={200}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onSearch={openTopic}
            />
          </Col>
          <Col xs={24} md={compact ? 24 : 10}>
            <Row gutter={8}>
              <Col span={8}>
                <Statistic title="Day streak" value={stats.streak_days || 0} prefix={<FireOutlined style={{ color: '#fa541c' }} />} />
              </Col>
              <Col span={8}><Statistic title="Delivered (month)" value={stats.delivered_this_month || 0} /></Col>
              <Col span={8}><Statistic title="Attendees (month)" value={stats.attendees_this_month || 0} /></Col>
            </Row>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default ToolboxTalkWidget;
