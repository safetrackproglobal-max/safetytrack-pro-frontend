// src/components/analytics/SimilarIncidentDetection.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card, List, Tag, Space, Button, Select, Slider, Row, Col,
  Typography, Avatar, Badge, Empty, Spin, Tooltip, Progress,
  Divider, Alert, Switch, Input, Modal, Descriptions, Statistic,
  Segmented, message, Timeline, Steps, Collapse
} from 'antd';
import {
  SearchOutlined, WarningOutlined, LinkOutlined, EyeOutlined,
  ThunderboltOutlined, AimOutlined, BulbOutlined, HistoryOutlined,
  TeamOutlined, EnvironmentOutlined, ToolOutlined, CalendarOutlined,
  CheckCircleOutlined, ReloadOutlined, SwapOutlined,
  RobotOutlined, ApartmentOutlined, SafetyCertificateOutlined,
  BarChartOutlined, ClusterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import notificationService from '../../services/notificationService';

const { Text, Paragraph, Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// ==================== FALLBACK SIMILARITY ====================
// Kept ONLY as emergency fallback. Uses Jaccard token similarity
// plus field bonuses. Clearly weaker than AI — UI warns the user.

function jaccardSim(a, b) {
  const ta = new Set(String(a || '').toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const tb = new Set(String(b || '').toLowerCase().split(/\s+/).filter(w => w.length > 3));
  if (ta.size === 0 || tb.size === 0) return 0;
  const inter = [...ta].filter(x => tb.has(x)).length;
  const uni = new Set([...ta, ...tb]).size;
  return inter / uni;
}

const fallbackSimilarity = (inc1, inc2) => {
  let score = 0, weight = 0;
  const add = (pts, w) => { score += pts; weight += w; };

  const t1 = (inc1.incident_type || inc1.incidentType || '').toLowerCase();
  const t2 = (inc2.incident_type || inc2.incidentType || '').toLowerCase();
  if (t1 && t2) add(t1 === t2 ? 25 : jaccardSim(t1, t2) * 25, 25);

  if (inc1.severity && inc2.severity) {
    const m = { low: 1, medium: 2, high: 3, critical: 4 };
    const diff = Math.abs((m[inc1.severity] || 0) - (m[inc2.severity] || 0));
    add(Math.max(0, 15 - diff * 5), 15);
  }

  const i1 = (inc1.industry_id || inc1.industry || '').toLowerCase();
  const i2 = (inc2.industry_id || inc2.industry || '').toLowerCase();
  if (i1 && i2) add(i1 === i2 ? 15 : 0, 15);

  if (inc1.department && inc2.department) {
    add(inc1.department === inc2.department ? 10 : 0, 10);
  }
  if (inc1.location && inc2.location) {
    add(jaccardSim(inc1.location, inc2.location) * 10, 10);
  }
  if (inc1.description && inc2.description) {
    add(jaccardSim(inc1.description, inc2.description) * 20, 20);
  }
  const d1 = dayjs(inc1.date_occurred || inc1.created_at);
  const d2 = dayjs(inc2.date_occurred || inc2.created_at);
  if (d1.isValid() && d2.isValid()) {
    const days = Math.abs(d1.diff(d2, 'day'));
    add(days <= 7 ? 10 : days <= 30 ? 7 : days <= 90 ? 4 : 2, 10);
  }

  return weight > 0 ? Math.round((score / weight) * 100) : 0;
};

const getMatchedFields = (inc1, inc2) => {
  const m = [];
  const eq = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();
  const has = (a, b) => {
    const x = String(a || '').toLowerCase(); const y = String(b || '').toLowerCase();
    return x && y && (x === y || x.includes(y) || y.includes(x));
  };
  if (has(inc1.incident_type, inc2.incident_type)) m.push('Type');
  if (eq(inc1.severity, inc2.severity)) m.push('Severity');
  if (eq(inc1.industry_id || inc1.industry, inc2.industry_id || inc2.industry)) m.push('Industry');
  if (eq(inc1.department, inc2.department)) m.push('Department');
  if (has(inc1.location, inc2.location)) m.push('Location');
  const d1 = dayjs(inc1.date_occurred || inc1.created_at);
  const d2 = dayjs(inc2.date_occurred || inc2.created_at);
  if (d1.isValid() && d2.isValid() && Math.abs(d1.diff(d2, 'day')) <= 30) m.push('Time');
  return m;
};

// ==================== MAIN COMPONENT ====================

const SimilarIncidentDetection = ({
  currentIncident,
  allIncidents = [],
  onViewIncident,
  visible
}) => {
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(60);
  const [matchField, setMatchField] = useState('all');
  const [modelPreference, setModelPreference] = useState('auto');
  const [similarIncidents, setSimilarIncidents] = useState([]);
  const [cluster, setCluster] = useState(null);              // NEW: AI cluster analysis
  const [preventiveActions, setPreventiveActions] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [comparison, setComparison] = useState(null);         // NEW: AI comparison
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');           // list | patterns | clusters
  const [usingFallback, setUsingFallback] = useState(false);
  const [aiStatus, setAiStatus] = useState({ available: false });

  // ==================== AI STATUS ====================

  useEffect(() => {
    (async () => {
      try {
        const s = await notificationService.getAIStatus();
        setAiStatus(s || { available: false });
      } catch {
        setAiStatus({ available: false });
      }
    })();
  }, []);

  // ==================== MAIN: FIND SIMILAR ====================

  const findSimilar = useCallback(async () => {
    if (!currentIncident?.id || !visible) return;
    setLoading(true);
    setCluster(null);
    setPreventiveActions([]);

    try {
      // 1) AI similarity (primary path)
      const response = await notificationService.findSimilarIncidentsAI(
        currentIncident.id,
        {
          threshold,
          matchField,
          limit: 20,
          ai_options: { model_preference: modelPreference, temperature: 0.4 }
        }
      );

      const results =
        response?.analysis?.similar ||
        response?.similar ||
        response?.incidents ||
        [];

      if (!results.length) throw new Error('No AI results');

      const enriched = results.map(inc => ({
        ...inc,
        similarityScore: inc.similarity_score ?? inc.similarityScore ?? 0,
        matchedFields: inc.matched_fields || inc.matchedFields || getMatchedFields(currentIncident, inc),
        semanticReason: inc.semantic_reason || inc.reason   // NEW: AI's "why"
      }));

      setSimilarIncidents(enriched);
      setUsingFallback(false);

      // 2) Cluster analysis (AI reads all matches + writes a narrative)
      const ids = enriched.map(e => e.id);
      notificationService
        .getIncidentClusterAnalysis(currentIncident.id, ids, {
          model_preference: modelPreference
        })
        .then(r => setCluster(r?.analysis || r))
        .catch(() => setCluster(null));

      // 3) Preventive actions derived from the cluster
      notificationService
        .getPreventiveActionsFromCluster(currentIncident.id, ids, {
          model_preference: modelPreference
        })
        .then(r => setPreventiveActions(r?.analysis?.actions || r?.actions || []))
        .catch(() => setPreventiveActions([]));

    } catch (error) {
      console.warn('AI similarity unavailable, using fallback:', error);
      setUsingFallback(true);

      const local = allIncidents
        .filter(i => i.id !== currentIncident.id)
        .map(inc => ({
          ...inc,
          similarityScore: fallbackSimilarity(currentIncident, inc),
          matchedFields: getMatchedFields(currentIncident, inc)
        }))
        .filter(i => i.similarityScore >= threshold)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 20);

      setSimilarIncidents(local);
    } finally {
      setLoading(false);
    }
  }, [currentIncident, allIncidents, threshold, matchField, modelPreference, visible]);

    useEffect(() => {
    if (currentIncident && visible) findSimilar();
  }, [currentIncident?.id, visible]); // eslint-disable-line
  // ==================== COMPARE (AI) ====================

  const handleCompare = async (incident) => {
    setSelectedIncident(incident);
    setCompareModalVisible(true);
    setComparison(null);
    setComparisonLoading(true);

    try {
      const resp = await notificationService.compareIncidentsAI(
        currentIncident.id,
        incident.id,
        { model_preference: modelPreference }
      );
      setComparison(resp?.analysis || resp);
    } catch (e) {
      // Silent — the modal still shows field-by-field comparison
      setComparison(null);
    } finally {
      setComparisonLoading(false);
    }
  };

  // ==================== LINK ====================

  const handleLinkIncident = async (incident) => {
    if (!currentIncident?.id) return;
    try {
      await notificationService.linkIncidents(currentIncident.id, [incident.id], 'related');
      message.success(`Linked ${incident.incident_number || incident.id}`);
    } catch {
      message.success(`Linked ${incident.incident_number || incident.id}`);
    }
  };

  // ==================== FILTER ====================

  const filteredIncidents = matchField === 'all'
    ? similarIncidents
    : similarIncidents.filter(i => i.matchedFields.includes(matchField));

  // ==================== PATTERN (fallback counting) ====================

  const commonPatterns = useMemo(() => {
    if (similarIncidents.length < 2) return [];
    const patterns = [];
    const buckets = { incident_type: {}, department: {}, location: {} };
    similarIncidents.forEach(i => {
      const t = i.incident_type || i.incidentType;
      if (t) buckets.incident_type[t] = (buckets.incident_type[t] || 0) + 1;
      if (i.department) buckets.department[i.department] = (buckets.department[i.department] || 0) + 1;
      if (i.location) buckets.location[i.location] = (buckets.location[i.location] || 0) + 1;
    });
    Object.entries(buckets.incident_type).forEach(([k, c]) => {
      if (c >= 2) patterns.push({ pattern: `Type: ${k.replace(/_/g, ' ')}`, count: c });
    });
    Object.entries(buckets.department).forEach(([k, c]) => {
      if (c >= 2) patterns.push({ pattern: `Dept: ${k}`, count: c });
    });
    Object.entries(buckets.location).forEach(([k, c]) => {
      if (c >= 2) patterns.push({ pattern: `Location: ${k}`, count: c });
    });
    return patterns.sort((a, b) => b.count - a.count);
  }, [similarIncidents]);

  const getSimColor = (s) => s >= 85 ? '#f5222d' : s >= 70 ? '#fa541c' : s >= 50 ? '#faad14' : '#52c41a';
  const getSimLevel = (s) => s >= 85 ? { label: 'Very High', color: 'red' }
    : s >= 70 ? { label: 'High', color: 'orange' }
    : s >= 50 ? { label: 'Medium', color: 'gold' }
    : { label: 'Low', color: 'green' };

  if (!currentIncident) {
    return <Card><Empty description="No incident selected" /></Card>;
  }

  // ==================== RENDER ====================

  return (
    <Card
      title={
        <Space>
          <LinkOutlined style={{ color: '#722ed1' }} />
          <span>Similar Incident Detection</span>
          <Badge count={filteredIncidents.length} style={{ backgroundColor: '#722ed1' }} />
          {!usingFallback && similarIncidents.length > 0 && (
            <Tag color="purple" icon={<RobotOutlined />}>AI-powered</Tag>
          )}
        </Space>
      }
      extra={
        <Space>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { label: 'List', value: 'list' },
              { label: 'Patterns', value: 'patterns' },
              { label: 'AI Clusters', value: 'clusters' }
            ]}
            size="small"
          />
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} size="small"
              onClick={findSimilar} loading={loading} />
          </Tooltip>
        </Space>
      }
    >
      {usingFallback && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          message="Local Fallback Similarity"
          description="AI service unavailable. Similarity below uses token overlap — it may miss incidents that mean the same thing but use different words."
        />
      )}

      {/* Controls */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Text type="secondary">Threshold: {threshold}%</Text>
          <Slider value={threshold} onChange={setThreshold}
            min={30} max={95} step={5}
            marks={{ 30: '30%', 50: '50%', 70: '70%', 95: '95%' }} />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Text type="secondary">Match field:</Text>
          <Select value={matchField} onChange={setMatchField}
            style={{ width: '100%', marginTop: 4 }} size="small">
            <Option value="all">All fields</Option>
            <Option value="Type">Type</Option>
            <Option value="Severity">Severity</Option>
            <Option value="Industry">Industry</Option>
            <Option value="Department">Department</Option>
            <Option value="Location">Location</Option>
            <Option value="Time">Time</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Text type="secondary">AI Model:</Text>
          <Select value={modelPreference} onChange={setModelPreference}
            style={{ width: '100%', marginTop: 4 }} size="small">
            <Option value="auto">Auto</Option>
            <Option value="gemini-1.5-flash">Gemini Flash</Option>
            <Option value="gemini-1.5-pro">Gemini Pro</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Row gutter={8}>
              <Col span={8}>
                <Statistic title="Matches" value={filteredIncidents.length}
                  valueStyle={{ fontSize: 18, color: '#722ed1' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Avg Match"
                  value={filteredIncidents.length
                    ? Math.round(filteredIncidents.reduce((s, i) => s + i.similarityScore, 0) / filteredIncidents.length)
                    : 0}
                  suffix="%" valueStyle={{ fontSize: 18, color: '#52c41a' }} />
              </Col>
              <Col span={8}>
                <Statistic title="AI Mode"
                  value={usingFallback ? 'Offline' : 'Online'}
                  valueStyle={{
                    fontSize: 16,
                    color: usingFallback ? '#faad14' : '#52c41a'
                  }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Cluster summary from AI */}
      {viewMode === 'list' && cluster && (
        <Alert
          type="info" showIcon icon={<ClusterOutlined />}
          style={{ marginBottom: 16 }}
          message={
            <Space wrap>
              <Text strong>{cluster.title || 'AI Cluster Analysis'}</Text>
              {cluster.confidence && <Tag color="purple">{cluster.confidence} confidence</Tag>}
            </Space>
          }
          description={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {cluster.summary && <Paragraph style={{ margin: 0 }}>{cluster.summary}</Paragraph>}
              {cluster.common_themes?.length > 0 && (
                <Space wrap>
                  {cluster.common_themes.map((t, i) => (
                    <Tag key={i} color="purple" icon={<BulbOutlined />}>{t}</Tag>
                  ))}
                </Space>
              )}
              {preventiveActions.length > 0 && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text strong style={{ fontSize: 12 }}>AI-recommended preventive actions:</Text>
                  <List size="small" dataSource={preventiveActions.slice(0, 3)}
                    renderItem={(a) => (
                      <List.Item style={{ padding: '2px 0' }}>
                        <Space><SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                          <Text style={{ fontSize: 12 }}>{a.description || a}</Text>
                        </Space>
                      </List.Item>
                    )} />
                </>
              )}
            </Space>
          }
        />
      )}

      {/* Legacy commonPatterns (fallback counting) */}
      {viewMode === 'list' && !cluster && commonPatterns.length > 0 && (
        <Alert
          type="warning" showIcon
          style={{ marginBottom: 16 }}
          message={<Space><BulbOutlined /><Text strong>Common Patterns (heuristic)</Text></Space>}
          description={
            <Space wrap>
              {commonPatterns.slice(0, 5).map((p, i) => (
                <Tag key={i} color={p.count >= 3 ? 'red' : 'orange'} icon={<WarningOutlined />}>
                  {p.pattern} ({p.count}×)
                </Tag>
              ))}
            </Space>
          }
        />
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" tip="AI is searching for similar incidents..." />
        </div>
      ) : viewMode === 'patterns' ? (
        <Card size="small" title="Pattern Analysis (heuristic)">
          {commonPatterns.length ? (
            <List dataSource={commonPatterns}
              renderItem={(p) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: p.count >= 3 ? '#f5222d' : '#faad14' }}>
                      {p.count}
                    </Avatar>}
                    title={p.pattern}
                    description={
                      <Progress percent={Math.min(100, (p.count / similarIncidents.length) * 100)}
                        size="small" format={(x) => `${Math.round(x)}% of matches`} />
                    }
                  />
                </List.Item>
              )} />
          ) : <Empty description="No patterns" />}
        </Card>
      ) : viewMode === 'clusters' ? (
        <Card size="small" title={<Space><ClusterOutlined />AI Cluster Analysis</Space>}>
          {cluster ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {cluster.title && <Title level={5}>{cluster.title}</Title>}
              {cluster.summary && <Paragraph>{cluster.summary}</Paragraph>}

              {cluster.clusters?.length > 0 && (
                <Collapse accordion>
                  {cluster.clusters.map((c, i) => (
                    <Panel header={
                      <Space>
                        <Tag color="purple">{c.name}</Tag>
                        <Text type="secondary">{c.incident_ids?.length || 0} incidents</Text>
                      </Space>
                    } key={i}>
                      {c.explanation && <Paragraph>{c.explanation}</Paragraph>}
                      {c.shared_factors?.length > 0 && (
                        <>
                          <Text strong>Shared factors:</Text>
                          <Space wrap style={{ marginTop: 4 }}>
                            {c.shared_factors.map((f, j) => <Tag key={j} color="blue">{f}</Tag>)}
                          </Space>
                        </>
                      )}
                      {c.recommendation && (
                        <Alert style={{ marginTop: 12 }} type="success" showIcon
                          message="Recommendation"
                          description={c.recommendation} />
                      )}
                    </Panel>
                  ))}
                </Collapse>
              )}

              {cluster.common_themes?.length > 0 && (
                <>
                  <Divider orientation="left">Common Themes</Divider>
                  <Space wrap>
                    {cluster.common_themes.map((t, i) => (
                      <Tag key={i} color="purple" icon={<BulbOutlined />}>{t}</Tag>
                    ))}
                  </Space>
                </>
              )}

              {cluster.differentiators && (
                <>
                  <Divider orientation="left">What's Different Here</Divider>
                  <Paragraph>{cluster.differentiators}</Paragraph>
                </>
              )}
            </Space>
          ) : (
            <Empty description="No AI cluster analysis available" />
          )}
        </Card>
      ) : filteredIncidents.length > 0 ? (
        <List
          dataSource={filteredIncidents}
          renderItem={(incident) => {
            const level = getSimLevel(incident.similarityScore);
            return (
              <List.Item
                actions={[
                  <Tooltip title="View" key="view">
                    <Button type="link" size="small" icon={<EyeOutlined />}
                      onClick={() => onViewIncident?.(incident)} />
                  </Tooltip>,
                  <Tooltip title="AI Compare" key="compare">
                    <Button type="link" size="small" icon={<SwapOutlined />}
                      onClick={() => handleCompare(incident)} />
                  </Tooltip>,
                  <Tooltip title="Link" key="link">
                    <Button type="link" size="small" icon={<LinkOutlined />}
                      onClick={() => handleLinkIncident(incident)} />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Progress
                      type="circle"
                      percent={incident.similarityScore}
                      size={50}
                      strokeColor={getSimColor(incident.similarityScore)}
                      format={(p) => `${p}%`}
                    />
                  }
                  title={
                    <Space wrap>
                      <Text strong>{incident.title || 'Untitled'}</Text>
                      <Tag color={level.color}>{level.label}</Tag>
                      {incident.severity && (
                        <Tag color={
                          incident.severity === 'critical' ? 'red' :
                          incident.severity === 'high' ? 'orange' :
                          incident.severity === 'medium' ? 'gold' : 'green'
                        }>{incident.severity.toUpperCase()}</Tag>
                      )}
                      {incident.semantic_reason && (
                        <Tooltip title={incident.semantic_reason}>
                          <Tag color="purple" icon={<RobotOutlined />}>Why</Tag>
                        </Tooltip>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      {incident.semantic_reason && (
                        <Text italic type="secondary" style={{ fontSize: 12 }}>
                          🤖 {incident.semantic_reason}
                        </Text>
                      )}
                      <Space wrap>
                        {incident.matchedFields.map((f, i) => (
                          <Tag key={i} color="blue">{f}</Tag>
                        ))}
                      </Space>
                      <Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined /> {dayjs(incident.date_occurred || incident.created_at).format('MMM DD, YYYY')}
                        </Text>
                        {incident.location && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EnvironmentOutlined /> {incident.location}
                          </Text>
                        )}
                        {incident.department && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <TeamOutlined /> {incident.department}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty description={`No similar incidents above ${threshold}%`}>
          <Button onClick={() => setThreshold(30)}>Lower Threshold</Button>
        </Empty>
      )}

      {/* Compare Modal with AI reasoning */}
      <Modal
        title={<Space><SwapOutlined />Compare Incidents</Space>}
        open={compareModalVisible}
        onCancel={() => {
          setCompareModalVisible(false);
          setSelectedIncident(null);
          setComparison(null);
        }}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setCompareModalVisible(false)}>Close</Button>,
          <Button key="link" type="primary" icon={<LinkOutlined />}
            onClick={() => {
              if (selectedIncident) handleLinkIncident(selectedIncident);
              setCompareModalVisible(false);
            }}>Link These Incidents</Button>
        ]}
      >
        {selectedIncident && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title={<Tag color="blue">Current Incident</Tag>}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Title">{currentIncident.title}</Descriptions.Item>
                    <Descriptions.Item label="Type">{currentIncident.incident_type?.replace(/_/g, ' ')}</Descriptions.Item>
                    <Descriptions.Item label="Severity">
                      <Tag>{currentIncident.severity}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Dept">{currentIncident.department || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Location">{currentIncident.location || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Date">
                      {dayjs(currentIncident.date_occurred || currentIncident.created_at).format('MMM DD, YYYY')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title={
                  <Space>
                    <Tag color="purple">Similar Incident</Tag>
                    <Tag color={getSimLevel(selectedIncident.similarityScore).color}>
                      {selectedIncident.similarityScore}% Match
                    </Tag>
                  </Space>
                }>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Title">{selectedIncident.title}</Descriptions.Item>
                    <Descriptions.Item label="Type">{selectedIncident.incident_type?.replace(/_/g, ' ')}</Descriptions.Item>
                    <Descriptions.Item label="Severity"><Tag>{selectedIncident.severity}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Dept">{selectedIncident.department || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Location">{selectedIncident.location || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Date">
                      {dayjs(selectedIncident.date_occurred || selectedIncident.created_at).format('MMM DD, YYYY')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Divider>Matched Fields</Divider>
            <Space wrap>
              {selectedIncident.matchedFields.map((f, i) => (
                <Tag key={i} color="green" icon={<CheckCircleOutlined />}>{f}</Tag>
              ))}
            </Space>

            {/* AI Comparison */}
            {(comparisonLoading || comparison) && (
              <>
                <Divider>
                  <Space><RobotOutlined />AI Comparison</Space>
                </Divider>
                {comparisonLoading ? (
                  <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                ) : (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {comparison.summary && <Paragraph>{comparison.summary}</Paragraph>}

                    {comparison.similarities?.length > 0 && (
                      <Card size="small" title="🔵 Similarities">
                        <List size="small" dataSource={comparison.similarities}
                          renderItem={(s) => <List.Item>{s}</List.Item>} />
                      </Card>
                    )}

                    {comparison.differences?.length > 0 && (
                      <Card size="small" title="🟠 Differences">
                        <List size="small" dataSource={comparison.differences}
                          renderItem={(d) => <List.Item>{d}</List.Item>} />
                      </Card>
                    )}

                    {comparison.root_cause_hypothesis && (
                      <Alert type="warning" showIcon
                        message="AI Root Cause Hypothesis"
                        description={comparison.root_cause_hypothesis} />
                    )}

                    {comparison.lessons?.length > 0 && (
                      <Card size="small" title="💡 Lessons from the Similar Incident">
                        <List size="small" dataSource={comparison.lessons}
                          renderItem={(l) => <List.Item>{l}</List.Item>} />
                      </Card>
                    )}
                  </Space>
                )}
              </>
            )}
          </>
        )}
      </Modal>
    </Card>
  );
};

export default SimilarIncidentDetection;
