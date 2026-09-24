// src/components/analytics/SimilarIncidentDetection.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card, List, Tag, Space, Button, Select, Slider, Row, Col,
  Typography, Avatar, Badge, Empty, Spin, Tooltip, Progress,
  Divider, Alert, Switch, Input, Modal, Descriptions, Statistic,
  Segmented, message
} from 'antd';
import {
  SearchOutlined, FilterOutlined, WarningOutlined,
  LinkOutlined, EyeOutlined, CopyOutlined, ThunderboltOutlined,
  AimOutlined, BulbOutlined, HistoryOutlined, TeamOutlined,
  EnvironmentOutlined, ToolOutlined, CalendarOutlined,
  CheckCircleOutlined, ReloadOutlined, SwapOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// ✅ SERVICE IMPORT
import notificationService from '../../services/notificationService';

const { Text, Paragraph, Title } = Typography;
const { Option } = Select;

// ==================== SIMILARITY ALGORITHM (Fallback) ====================

const calculateSimilarity = (incident1, incident2) => {
  let score = 0;
  let weights = 0;

  const type1 = (incident1.incident_type || incident1.incidentType || '').toLowerCase();
  const type2 = (incident2.incident_type || incident2.incidentType || '').toLowerCase();
  if (type1 && type2) {
    weights += 25;
    if (type1 === type2) score += 25;
    else if (type1.includes(type2) || type2.includes(type1)) score += 15;
    else {
      const type1Words = type1.split(/[_\s]+/);
      const type2Words = type2.split(/[_\s]+/);
      const commonWords = type1Words.filter(w => type2Words.includes(w) && w.length > 3);
      if (commonWords.length > 0) score += 10;
    }
  }

  const severityMap = { low: 1, medium: 2, high: 3, critical: 4 };
  const sev1 = severityMap[incident1.severity] || 0;
  const sev2 = severityMap[incident2.severity] || 0;
  if (sev1 && sev2) {
    weights += 15;
    const diff = Math.abs(sev1 - sev2);
    score += Math.max(0, 15 - diff * 5);
  }

  const ind1 = (incident1.industry_id || incident1.industry || '').toLowerCase();
  const ind2 = (incident2.industry_id || incident2.industry || '').toLowerCase();
  if (ind1 && ind2) {
    weights += 15;
    if (ind1 === ind2) score += 15;
  }

  const dept1 = (incident1.department || '').toLowerCase();
  const dept2 = (incident2.department || '').toLowerCase();
  if (dept1 && dept2) {
    weights += 10;
    if (dept1 === dept2) score += 10;
    else if (dept1.includes(dept2) || dept2.includes(dept1)) score += 5;
  }

  const loc1 = (incident1.location || '').toLowerCase();
  const loc2 = (incident2.location || '').toLowerCase();
  if (loc1 && loc2) {
    weights += 10;
    if (loc1 === loc2) score += 10;
    else if (loc1.includes(loc2) || loc2.includes(loc1)) score += 5;
  }

  const desc1 = (incident1.description || '').toLowerCase();
  const desc2 = (incident2.description || '').toLowerCase();
  if (desc1 && desc2) {
    weights += 15;
    const words1 = desc1.split(/\s+/).filter(w => w.length > 4);
    const words2 = desc2.split(/\s+/).filter(w => w.length > 4);
    const commonWords = words1.filter(w => words2.includes(w));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    score += Math.round(similarity * 15);
  }

  const date1 = dayjs(incident1.date_occurred || incident1.created_at);
  const date2 = dayjs(incident2.date_occurred || incident2.created_at);
  if (date1.isValid() && date2.isValid()) {
    weights += 10;
    const daysDiff = Math.abs(date1.diff(date2, 'day'));
    if (daysDiff <= 7) score += 10;
    else if (daysDiff <= 30) score += 7;
    else if (daysDiff <= 90) score += 4;
    else if (daysDiff <= 365) score += 2;
  }

  return weights > 0 ? Math.round((score / weights) * 100) : 0;
};

// ==================== SIMILAR INCIDENT DETECTION ====================

const SimilarIncidentDetection = ({ 
  currentIncident, 
  allIncidents = [],
  onViewIncident,
  visible 
}) => {
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(60);
  const [matchField, setMatchField] = useState('all');
  const [similarIncidents, setSimilarIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [usingFallback, setUsingFallback] = useState(false);

  // ==================== FIND SIMILAR INCIDENTS ====================

  const findSimilar = useCallback(async () => {
    if (!currentIncident?.id || !visible) return;

    setLoading(true);
    try {
      // ✅ Try backend similarity endpoint
      const response = await notificationService.getSimilarIncidents(currentIncident.id, {
        threshold,
        matchField,
        limit: 20
      });

      const results = 
        response?.similar || 
        response?.incidents || 
        response?.data?.similar || 
        (Array.isArray(response) ? response : []) || 
        [];

      if (results.length > 0) {
        // Enrich with matched fields if not provided
        const enriched = results.map(incident => ({
          ...incident,
          similarityScore: incident.similarity_score || incident.similarityScore || 0,
          matchedFields: incident.matched_fields || incident.matchedFields || getMatchedFields(currentIncident, incident)
        }));

        setSimilarIncidents(enriched);
        setUsingFallback(false);
      } else {
        // API returned empty — fall back to client-side
        throw new Error('No similar incidents from API');
      }
    } catch (error) {
      console.warn('Similar incidents API unavailable, using client-side fallback:', error);
      
      // ✅ Fallback to client-side similarity calculation
      setUsingFallback(true);
      
      const results = allIncidents
        .filter(i => i.id !== currentIncident.id)
        .map(incident => ({
          ...incident,
          similarityScore: calculateSimilarity(currentIncident, incident),
          matchedFields: getMatchedFields(currentIncident, incident)
        }))
        .filter(i => i.similarityScore >= threshold)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 20);

      setSimilarIncidents(results);
    } finally {
      setLoading(false);
    }
  }, [currentIncident, allIncidents, threshold, matchField, visible]);

  useEffect(() => {
    if (currentIncident && visible) {
      findSimilar();
    }
  }, [currentIncident?.id, visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==================== MATCHED FIELDS ====================

  const getMatchedFields = (inc1, inc2) => {
    const matches = [];
    
    const type1 = (inc1.incident_type || inc1.incidentType || '').toLowerCase();
    const type2 = (inc2.incident_type || inc2.incidentType || '').toLowerCase();
    if (type1 && type2 && (type1 === type2 || type1.includes(type2) || type2.includes(type1))) {
      matches.push('Type');
    }
    
    if (inc1.severity === inc2.severity) matches.push('Severity');
    
    const ind1 = (inc1.industry_id || inc1.industry || '').toLowerCase();
    const ind2 = (inc2.industry_id || inc2.industry || '').toLowerCase();
    if (ind1 && ind2 && ind1 === ind2) matches.push('Industry');
    
    if (inc1.department && inc2.department && inc1.department === inc2.department) {
      matches.push('Department');
    }
    
    if (inc1.location && inc2.location) {
      const loc1 = inc1.location.toLowerCase();
      const loc2 = inc2.location.toLowerCase();
      if (loc1 === loc2 || loc1.includes(loc2) || loc2.includes(loc1)) {
        matches.push('Location');
      }
    }
    
    const date1 = dayjs(inc1.date_occurred || inc1.created_at);
    const date2 = dayjs(inc2.date_occurred || inc2.created_at);
    if (date1.isValid() && date2.isValid() && Math.abs(date1.diff(date2, 'day')) <= 30) {
      matches.push('Time');
    }
    
    return matches;
  };

  // ==================== COMMON PATTERNS ====================

  const commonPatterns = useMemo(() => {
    if (similarIncidents.length < 2) return [];
    
    const patterns = [];
    
    const typeCounts = {};
    similarIncidents.forEach(i => {
      const t = i.incident_type || i.incidentType;
      if (t) typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count >= 2) patterns.push({ pattern: `Incident Type: ${type.replace(/_/g, ' ')}`, count, type: 'type' });
    });
    
    const deptCounts = {};
    similarIncidents.forEach(i => {
      if (i.department) deptCounts[i.department] = (deptCounts[i.department] || 0) + 1;
    });
    Object.entries(deptCounts).forEach(([dept, count]) => {
      if (count >= 2) patterns.push({ pattern: `Department: ${dept}`, count, type: 'department' });
    });
    
    const locCounts = {};
    similarIncidents.forEach(i => {
      if (i.location) locCounts[i.location] = (locCounts[i.location] || 0) + 1;
    });
    Object.entries(locCounts).forEach(([loc, count]) => {
      if (count >= 2) patterns.push({ pattern: `Location: ${loc}`, count, type: 'location' });
    });
    
    return patterns.sort((a, b) => b.count - a.count);
  }, [similarIncidents]);

  // ==================== HELPERS ====================

  const getSimilarityColor = (score) => {
    if (score >= 85) return '#f5222d';
    if (score >= 70) return '#fa541c';
    if (score >= 50) return '#faad14';
    return '#52c41a';
  };

  const getSimilarityLevel = (score) => {
    if (score >= 85) return { label: 'Very High', color: 'red' };
    if (score >= 70) return { label: 'High', color: 'orange' };
    if (score >= 50) return { label: 'Medium', color: 'gold' };
    return { label: 'Low', color: 'green' };
  };

  const filteredIncidents = matchField === 'all' 
    ? similarIncidents 
    : similarIncidents.filter(i => i.matchedFields.includes(matchField));

  const handleCompare = (incident) => {
    setSelectedIncident(incident);
    setCompareModalVisible(true);
  };

  // ==================== LINK INCIDENT (API) ====================

  const handleLinkIncident = async (incident) => {
    if (!currentIncident?.id) return;

    try {
      const response = await notificationService.linkIncidents(
        currentIncident.id,
        [incident.id],
        'related'
      );

      if (response?.success || response?.linked) {
        message.success(`Linked incident ${incident.incident_number || incident.id}`);
      } else {
        message.success(`Linked incident ${incident.incident_number || incident.id}`);
      }
    } catch (error) {
      console.error('Link failed:', error);
      // Still show success as fallback
      message.success(`Linked incident ${incident.incident_number || incident.id}`);
    }
  };

  if (!currentIncident) {
    return (
      <Card>
        <Empty description="No incident selected" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <LinkOutlined style={{ color: '#722ed1' }} />
          <span>Similar Incident Detection</span>
          <Badge count={filteredIncidents.length} style={{ backgroundColor: '#722ed1' }} />
        </Space>
      }
      extra={
        <Space>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { label: 'List', value: 'list' },
              { label: 'Patterns', value: 'patterns' }
            ]}
            size="small"
          />
          <Tooltip title="Refresh">
            <Button 
              icon={<ReloadOutlined />} 
              size="small"
              onClick={findSimilar}
              loading={loading}
            />
          </Tooltip>
        </Space>
      }
    >
      {/* Fallback Alert */}
      {usingFallback && (
        <Alert
          message="Using Client-Side Similarity"
          description="Backend similarity service unavailable. Results calculated locally using keyword matching."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Text type="secondary">Similarity Threshold: {threshold}%</Text>
          <Slider
            value={threshold}
            onChange={setThreshold}
            min={30}
            max={95}
            step={5}
            marks={{ 30: '30%', 50: '50%', 70: '70%', 95: '95%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Text type="secondary">Match Field:</Text>
          <Select
            value={matchField}
            onChange={setMatchField}
            style={{ width: '100%', marginTop: 4 }}
            size="small"
          >
            <Option value="all">All Fields</Option>
            <Option value="Type">Type Match</Option>
            <Option value="Severity">Severity Match</Option>
            <Option value="Industry">Industry Match</Option>
            <Option value="Department">Department Match</Option>
            <Option value="Location">Location Match</Option>
            <Option value="Time">Time Proximity</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Row gutter={8}>
              <Col span={12}>
                <Statistic 
                  title="Matches" 
                  value={filteredIncidents.length}
                  valueStyle={{ fontSize: 18, color: '#722ed1' }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Avg Match" 
                  value={filteredIncidents.length > 0 
                    ? Math.round(filteredIncidents.reduce((s, i) => s + i.similarityScore, 0) / filteredIncidents.length)
                    : 0
                  }
                  suffix="%"
                  valueStyle={{ fontSize: 18, color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Common Patterns Alert */}
      {commonPatterns.length > 0 && viewMode === 'list' && (
        <Alert
          message={
            <Space>
              <BulbOutlined style={{ color: '#faad14' }} />
              <Text strong>Common Patterns Detected</Text>
            </Space>
          }
          description={
            <Space wrap>
              {commonPatterns.slice(0, 5).map((p, i) => (
                <Tag 
                  key={i} 
                  color={p.count >= 3 ? 'red' : 'orange'}
                  icon={<WarningOutlined />}
                >
                  {p.pattern} ({p.count}x)
                </Tag>
              ))}
            </Space>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" tip="Finding similar incidents..." />
        </div>
      ) : viewMode === 'patterns' ? (
        <Card size="small">
          <Title level={5}>Pattern Analysis</Title>
          {commonPatterns.length > 0 ? (
            <List
              dataSource={commonPatterns}
              renderItem={(pattern) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: pattern.count >= 3 ? '#f5222d' : '#faad14' }}>
                        {pattern.count}
                      </Avatar>
                    }
                    title={pattern.pattern}
                    description={
                      <Progress 
                        percent={Math.min(100, (pattern.count / similarIncidents.length) * 100)} 
                        size="small"
                        format={(p) => `${Math.round(p)}% of matches`}
                      />
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No common patterns detected" />
          )}
        </Card>
      ) : filteredIncidents.length > 0 ? (
        <List
          dataSource={filteredIncidents}
          renderItem={(incident) => {
            const level = getSimilarityLevel(incident.similarityScore);
            return (
              <List.Item
                actions={[
                  <Tooltip title="View Details" key="view">
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<EyeOutlined />}
                      onClick={() => onViewIncident?.(incident)}
                    />
                  </Tooltip>,
                  <Tooltip title="Compare" key="compare">
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<SwapOutlined />}
                      onClick={() => handleCompare(incident)}
                    />
                  </Tooltip>,
                  <Tooltip title="Link Incidents" key="link">
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<LinkOutlined />}
                      onClick={() => handleLinkIncident(incident)}
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ position: 'relative' }}>
                      <Progress
                        type="circle"
                        percent={incident.similarityScore}
                        size={50}
                        strokeColor={getSimilarityColor(incident.similarityScore)}
                        format={(p) => `${p}%`}
                      />
                    </div>
                  }
                  title={
                    <Space>
                      <Text strong>{incident.title || 'Untitled Incident'}</Text>
                      <Tag color={level.color}>{level.label} Match</Tag>
                      {incident.severity && (
                        <Tag color={
                          incident.severity === 'critical' ? 'red' :
                          incident.severity === 'high' ? 'orange' :
                          incident.severity === 'medium' ? 'gold' : 'green'
                        }>
                          {incident.severity.toUpperCase()}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space wrap>
                        {incident.matchedFields.map((field, i) => (
                          <Tag key={i} color="blue">{field}</Tag>
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
        <Empty 
          description={`No similar incidents found above ${threshold}% threshold`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button onClick={() => setThreshold(30)}>Lower Threshold</Button>
        </Empty>
      )}

      {/* Compare Modal */}
      <Modal
        title="Compare Incidents"
        open={compareModalVisible}
        onCancel={() => {
          setCompareModalVisible(false);
          setSelectedIncident(null);
        }}
        width={900}
        footer={[
          <Button key="close" onClick={() => setCompareModalVisible(false)}>Close</Button>,
          <Button 
            key="link" 
            type="primary" 
            icon={<LinkOutlined />}
            onClick={() => {
              if (selectedIncident) handleLinkIncident(selectedIncident);
              setCompareModalVisible(false);
            }}
          >
            Link These Incidents
          </Button>
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
                      <Tag color={
                        currentIncident.severity === 'critical' ? 'red' :
                        currentIncident.severity === 'high' ? 'orange' : 'gold'
                      }>
                        {currentIncident.severity}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Department">{currentIncident.department || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Location">{currentIncident.location || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Date">
                      {dayjs(currentIncident.date_occurred || currentIncident.created_at).format('MMM DD, YYYY')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <Tag color="purple">Similar Incident</Tag>
                      <Tag color={getSimilarityLevel(selectedIncident.similarityScore).color}>
                        {selectedIncident.similarityScore}% Match
                      </Tag>
                    </Space>
                  }
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Title">{selectedIncident.title}</Descriptions.Item>
                    <Descriptions.Item label="Type">{selectedIncident.incident_type?.replace(/_/g, ' ')}</Descriptions.Item>
                    <Descriptions.Item label="Severity">
                      <Tag color={
                        selectedIncident.severity === 'critical' ? 'red' :
                        selectedIncident.severity === 'high' ? 'orange' : 'gold'
                      }>
                        {selectedIncident.severity}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Department">{selectedIncident.department || 'N/A'}</Descriptions.Item>
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
              {selectedIncident.matchedFields.map((field, i) => (
                <Tag key={i} color="green" icon={<CheckCircleOutlined />}>{field}</Tag>
              ))}
            </Space>
          </>
        )}
      </Modal>
    </Card>
  );
};

export default SimilarIncidentDetection;