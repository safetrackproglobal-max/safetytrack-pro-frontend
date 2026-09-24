// src/components/incidents/AIInvestigationAssistant.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Input, Space, Tag, message, Row, Col,
  List, Avatar, Typography, Divider, Alert, Spin, Progress,
  Collapse, Tooltip, Badge, Tabs, Select, Switch, Slider,
  Timeline, Steps, Result, Modal, Drawer, Form, InputNumber
} from 'antd';
import {
  RobotOutlined, BulbOutlined, ThunderboltOutlined,
  SearchOutlined, FileSearchOutlined, SafetyCertificateOutlined,
  WarningOutlined, CheckCircleOutlined, ReloadOutlined,
  CopyOutlined, SaveOutlined, ShareAltOutlined, DownloadOutlined,
  ExperimentOutlined, ApartmentOutlined, BranchesOutlined,
  ClockCircleOutlined, TeamOutlined, ToolOutlined,
  BookOutlined, LinkOutlined, RiseOutlined, FallOutlined
} from '@ant-design/icons';

// ✅ SERVICE IMPORT
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { Step } = Steps;

// ==================== AI KNOWLEDGE BASE (Fallback) ====================
// Used only when API fails — the real analysis comes from your pre-trained models

const AI_KNOWLEDGE_BASE = {
  investigationPrompts: {
    healthcare: [
      {
        category: 'Patient Safety',
        prompts: [
          'Was there a patient identification verification process?',
          'Were proper hand hygiene protocols followed?',
          'Was the patient adequately monitored?',
          'Were medication administration rights followed?',
          'Was there adequate staffing at the time of incident?'
        ]
      },
      {
        category: 'Equipment & Environment',
        prompts: [
          'Was the medical equipment properly maintained and calibrated?',
          'Were alarms functioning and audible?',
          'Was the environment conducive to safe care delivery?',
          'Was there adequate lighting in the area?'
        ]
      }
    ],
    construction: [
      {
        category: 'Safety Planning',
        prompts: [
          'Was a Job Hazard Analysis (JHA) conducted?',
          'Was there a pre-task safety briefing?',
          'Were proper permits obtained?',
          'Was the work sequenced properly?'
        ]
      },
      {
        category: 'Equipment & Tools',
        prompts: [
          'Was the equipment properly inspected before use?',
          'Were operators certified for the equipment?',
          'Was the equipment properly maintained?'
        ]
      }
    ],
    oil_gas: [
      {
        category: 'Process Safety',
        prompts: [
          'Was a Process Hazard Analysis (PHA) conducted?',
          'Were safety critical elements functioning?',
          'Was the Management of Change (MOC) process followed?',
          'Were operating procedures followed?'
        ]
      }
    ]
  },
  correctiveActions: {
    training: ['Conduct refresher training', 'Implement competency assessment', 'Develop job-specific materials'],
    procedure: ['Review and update SOPs', 'Implement checkpoints', 'Create visual aids'],
    equipment: ['Implement preventive maintenance', 'Upgrade faulty equipment', 'Add redundant safety systems'],
    communication: ['Implement structured handoffs', 'Establish daily briefings', 'Improve documentation']
  },
  incidentPatterns: {
    'fall': {
      commonCauses: ['Inadequate fall protection', 'Poor housekeeping', 'Insufficient lighting', 'Wet surfaces'],
      preventiveMeasures: ['Implement fall protection program', 'Regular inspections', 'Improve lighting', 'Non-slip surfaces']
    },
    'equipment_failure': {
      commonCauses: ['Inadequate maintenance', 'Operator error', 'Design deficiency', 'Wear and tear'],
      preventiveMeasures: ['Preventive maintenance', 'Operator training', 'Review specs', 'Replacement schedules']
    }
  }
};

// ==================== AI INVESTIGATION ASSISTANT ====================

const AIInvestigationAssistant = ({ 
  incident, 
  visible, 
  onClose,
  onSave 
}) => {
  // ✅ Get user from auth context
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [customQuestion, setCustomQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState('5_whys');
  const [whysAnswers, setWhysAnswers] = useState([]);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  // ==================== GENERATE AI ANALYSIS ====================

  const generateAnalysis = useCallback(async () => {
    if (!incident) return;

    setLoading(true);
    setAnalysis(null);

    try {
      // ✅ Call backend AI endpoint
      const response = await notificationService.generateAIAnalysis(incident.id, {
        model_preference: 'auto',   // Let backend choose the best model
        analysis_type: 'full'
      });

      const analysisData = response?.analysis || response?.data?.analysis || response;

      if (analysisData) {
        // Map backend response to component state
        const mapped = {
          summary: analysisData.summary || generateFallbackSummary(incident),
          riskFactors: analysisData.risk_factors || generateFallbackRiskFactors(incident),
          investigationQuestions: analysisData.investigation_questions || getFallbackQuestions(incident),
          similarPatterns: analysisData.similar_patterns || findFallbackPatterns(incident),
          suggestedActions: analysisData.suggested_actions || generateFallbackActions(incident),
          confidence: analysisData.confidence_score || 85,
          riskScore: analysisData.risk_score || 50,
          rootCauses: analysisData.root_causes || [],
          insights: analysisData.insights || [],
          trend: analysisData.trend_analysis || 'stable',
          modelInfo: analysisData.model_info || null,
          analysisDate: analysisData.created_at || new Date().toISOString()
        };

        setAnalysis(mapped);
        setSuggestedActions(mapped.suggestedActions);
        setModelInfo(mapped.modelInfo);

        // Initialize conversation
        setConversation([
          {
            role: 'assistant',
            content: `I've analyzed incident ${incident.incident_number || incident.id}. Based on the details provided, I've identified ${mapped.riskFactors.length} risk factors and ${mapped.investigationQuestions.length} investigation questions to consider. How would you like to proceed?`,
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        throw new Error('No analysis data received');
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      // ✅ Fallback to client-side analysis
      message.warning('AI service unavailable — using fallback analysis');
      
      const fallback = {
        summary: generateFallbackSummary(incident),
        riskFactors: generateFallbackRiskFactors(incident),
        investigationQuestions: getFallbackQuestions(incident),
        similarPatterns: findFallbackPatterns(incident),
        suggestedActions: generateFallbackActions(incident),
        confidence: 65,
        riskScore: 50,
        rootCauses: [],
        insights: [],
        trend: 'stable',
        modelInfo: { name: 'Local Fallback', provider: 'client' },
        analysisDate: new Date().toISOString(),
        isFallback: true
      };

      setAnalysis(fallback);
      setSuggestedActions(fallback.suggestedActions);
      setModelInfo(fallback.modelInfo);
      
      setConversation([
        {
          role: 'assistant',
          content: `I've analyzed incident ${incident.incident_number || incident.id} using local rules. I've identified ${fallback.riskFactors.length} risk factors and ${fallback.investigationQuestions.length} investigation questions. How can I help?`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [incident]);

  // Auto-load analysis when drawer opens
  useEffect(() => {
    if (incident && visible) {
      generateAnalysis();
    }
  }, [incident, visible, generateAnalysis]);

  // ==================== FALLBACK HELPERS ====================

  const generateFallbackSummary = (inc) => {
    if (!inc) return '';
    return `This ${inc.severity || 'medium'} severity incident involving ${inc.incident_type?.replace(/_/g, ' ') || 'an incident'} occurred in the ${inc.industryName || inc.industry_id || 'unknown'} industry. ${inc.description || 'No description provided.'}`;
  };

  const generateFallbackRiskFactors = (inc) => {
    const factors = [];
    const industry = inc?.industry_id || inc?.industry;
    const severity = inc?.severity;

    if (severity === 'critical' || severity === 'high') {
      factors.push({ factor: 'High severity classification', level: 'high', description: 'Incident has potential for serious harm' });
    }

    if (industry === 'healthcare') {
      factors.push(
        { factor: 'Patient safety risk', level: 'high', description: 'Potential impact on patient care' },
        { factor: 'Regulatory compliance', level: 'medium', description: 'May require reporting to health authorities' }
      );
    } else if (industry === 'construction') {
      factors.push(
        { factor: 'Worker safety', level: 'high', description: 'Potential for worker injury' },
        { factor: 'OSHA reporting', level: 'medium', description: 'May trigger OSHA reporting requirements' }
      );
    } else if (industry === 'oil_gas') {
      factors.push(
        { factor: 'Environmental impact', level: 'high', description: 'Potential for environmental damage' },
        { factor: 'Process safety', level: 'high', description: 'May indicate process safety issues' }
      );
    }

    factors.push(
      { factor: 'Repeat potential', level: 'medium', description: 'Similar incidents may occur if not addressed' },
      { factor: 'Investigation complexity', level: severity === 'critical' ? 'high' : 'medium', description: 'Requires thorough investigation' }
    );

    return factors;
  };

  const getFallbackQuestions = (inc) => {
    const industry = inc?.industry_id || inc?.industry;
    const prompts = AI_KNOWLEDGE_BASE.investigationPrompts[industry] || [];
    const questions = [];
    
    prompts.forEach(category => {
      category.prompts.forEach(prompt => {
        questions.push({ category: category.category, question: prompt, answered: false });
      });
    });

    if (questions.length === 0) {
      questions.push(
        { category: 'General', question: 'What were the contributing factors?', answered: false },
        { category: 'General', question: 'Were proper procedures followed?', answered: false },
        { category: 'General', question: 'What training was required?', answered: false },
        { category: 'General', question: 'What could have prevented this incident?', answered: false }
      );
    }

    return questions;
  };

  const findFallbackPatterns = (inc) => {
    const type = (inc?.incident_type || inc?.incidentType || '').toLowerCase();
    const patterns = [];

    if (type.includes('fall')) patterns.push(AI_KNOWLEDGE_BASE.incidentPatterns['fall']);
    if (type.includes('equipment') || type.includes('machine')) patterns.push(AI_KNOWLEDGE_BASE.incidentPatterns['equipment_failure']);

    return patterns.filter(Boolean);
  };

  const generateFallbackActions = (inc) => {
    const actions = [];
    const severity = inc?.severity;

    actions.push({
      type: 'immediate', priority: 'high',
      action: 'Secure the incident scene and ensure no further harm',
      category: 'Safety', timeframe: 'Immediate'
    });

    if (severity === 'critical' || severity === 'high') {
      actions.push({
        type: 'immediate', priority: 'critical',
        action: 'Notify relevant authorities and management',
        category: 'Communication', timeframe: 'Within 1 hour'
      });
    }

    actions.push({
      type: 'investigation', priority: 'high',
      action: 'Conduct witness interviews and gather evidence',
      category: 'Investigation', timeframe: 'Within 24 hours'
    });

    actions.push({
      type: 'investigation', priority: 'medium',
      action: 'Review relevant procedures and training records',
      category: 'Documentation', timeframe: 'Within 48 hours'
    });

    ['training', 'procedure', 'equipment', 'communication'].forEach(cat => {
      const catActions = AI_KNOWLEDGE_BASE.correctiveActions[cat];
      if (catActions?.length) {
        actions.push({
          type: 'corrective', priority: 'medium',
          action: catActions[Math.floor(Math.random() * catActions.length)],
          category: cat.charAt(0).toUpperCase() + cat.slice(1),
          timeframe: 'Within 30 days'
        });
      }
    });

    return actions;
  };

  // ==================== CHAT WITH AI ====================

  const handleSendMessage = async () => {
    if (!customQuestion.trim() || sendingMessage) return;

    const userMessage = {
      role: 'user',
      content: customQuestion,
      timestamp: new Date().toISOString()
    };

    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);
    const question = customQuestion;
    setCustomQuestion('');
    setSendingMessage(true);

    try {
      // ✅ Call backend AI chat endpoint
      const response = await notificationService.askAIInvestigation(
        incident.id,
        question,
        { context: { conversation: updatedConversation.slice(-5) } }
      );

      const aiContent = response?.answer || response?.response || response?.data?.answer;

      if (aiContent) {
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toISOString(),
          modelInfo: response?.model_info
        }]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('AI chat failed:', error);
      
      // Fallback to local response
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: generateFallbackResponse(question, incident),
        timestamp: new Date().toISOString(),
        isFallback: true
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  const generateFallbackResponse = (question, inc) => {
    const lower = question.toLowerCase();

    if (lower.includes('cause') || lower.includes('why')) {
      return `Based on the incident details, potential contributing factors include:

1. **Human Factors**: Training gaps, fatigue, communication breakdown
2. **Equipment/System**: Maintenance issues, design deficiencies
3. **Procedural**: Inadequate procedures, lack of checkpoints
4. **Environmental**: Workspace conditions, external factors

I recommend using the 5 Whys technique to drill down to root causes.`;
    }

    if (lower.includes('action') || lower.includes('prevent')) {
      return `Here are recommended corrective actions:

**Immediate:**
- Secure the area and prevent recurrence
- Notify relevant stakeholders

**Short-term:**
- Conduct thorough investigation
- Interview witnesses
- Review procedures

**Long-term:**
- Implement systemic improvements
- Update training programs
- Establish monitoring systems`;
    }

    if (lower.includes('regulatory') || lower.includes('report')) {
      const industry = inc?.industry_id;
      let regs = 'OSHA (Occupational Safety and Health Administration)';
      if (industry === 'healthcare') regs += ', Joint Commission, CMS';
      if (industry === 'oil_gas') regs += ', EPA, PHMSA';
      if (industry === 'aviation') regs += ', FAA, NTSB';

      return `Based on the incident details, potential regulatory reporting requirements include:

**Applicable Agencies:** ${regs}

**Reporting Timeframes:**
- Fatality/Catastrophe: Within 8 hours
- Hospitalization/Amputation: Within 24 hours
- Other recordable: Within 7 days`;
    }

    return `I understand your question about "${question}". 

To provide more specific guidance, could you clarify what aspect of the investigation you'd like help with? I can assist with:
- Root cause analysis
- Contributing factors identification
- Corrective action recommendations
- Regulatory compliance guidance
- Interview question suggestions`;
  };

  // ==================== 5 WHYS ====================

  const handleAddWhy = (answer) => {
    if (!answer?.trim()) return;
    if (whysAnswers.length < 5) {
      setWhysAnswers([...whysAnswers, { 
        question: `Why ${whysAnswers.length + 1}?`, 
        answer: answer.trim() 
      }]);
    }
  };

  // ==================== GENERATE REPORT ====================

  const handleGenerateReport = async () => {
    if (!incident) return;
    setGeneratingReport(true);

    try {
      // ✅ Call backend to generate report
      const response = await notificationService.generateAIInvestigationReport(
        incident.id,
        'full'
      );

      if (response?.success || response?.report) {
        message.success('Investigation report generated successfully');
        
        // If report comes back as a URL, open it
        if (response?.report_url) {
          window.open(response.report_url, '_blank');
        }
      } else {
        throw new Error(response?.error || 'Report generation failed');
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      message.error(error?.message || 'Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  // ==================== SAVE ANALYSIS ====================

  const handleSave = async () => {
    if (!analysis) return;

    setSaving(true);
    try {
      // ✅ Save to backend
      const response = await notificationService.saveAIAnalysis(incident.id, {
        analysis_type: 'investigation',
        summary: analysis.summary,
        risk_score: analysis.riskScore,
        confidence_score: analysis.confidence,
        risk_factors: analysis.riskFactors,
        investigation_questions: analysis.investigationQuestions,
        similar_patterns: analysis.similarPatterns,
        suggested_actions: analysis.suggestedActions,
        root_causes: analysis.rootCauses,
        insights: analysis.insights,
        conversation,
        selected_actions: selectedActions,
        whys_answers: whysAnswers
      });

      if (response?.success || response?.analysis) {
        message.success('Investigation saved');
        if (onSave) onSave(response?.analysis || response);
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Save failed:', error);
      message.error('Failed to save investigation');
    } finally {
      setSaving(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <Drawer
      title={
        <Space>
          <RobotOutlined style={{ color: '#722ed1' }} />
          <span>AI Investigation Assistant</span>
          {incident && (
            <Tag color="blue">{incident.incident_number || `#${incident.id}`}</Tag>
          )}
          {analysis && (
            <Tooltip title={`Confidence: ${analysis.confidence}%${modelInfo?.name ? ` • Model: ${modelInfo.name}` : ''}`}>
              <Tag color={analysis.isFallback ? 'orange' : 'green'}>
                <CheckCircleOutlined /> {analysis.isFallback ? 'Fallback' : 'AI Ready'}
              </Tag>
            </Tooltip>
          )}
        </Space>
      }
      placement="right"
      width={900}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Tooltip title="Regenerate Analysis">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={generateAnalysis}
              loading={loading}
            />
          </Tooltip>
          <Button 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={saving}
            disabled={!analysis}
          >
            Save
          </Button>
          <Button 
            type="primary" 
            icon={<FileSearchOutlined />}
            onClick={handleGenerateReport}
            loading={generatingReport}
            disabled={!analysis}
          >
            Generate Report
          </Button>
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Analyzing incident data with AI models...</Text>
          </div>
          <Progress 
            percent={100} 
            status="active" 
            style={{ maxWidth: 300, marginTop: 16 }}
            showInfo={false}
          />
        </div>
      ) : analysis ? (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><BulbOutlined /> Analysis</span>} key="analysis">
            {/* Model Info Banner */}
            {modelInfo && (
              <Alert
                message={`Powered by ${modelInfo.name || 'AI Model'}`}
                description={`Provider: ${modelInfo.provider || 'Unknown'}${analysis.isFallback ? ' — Using fallback (API unavailable)' : ''}`}
                type={analysis.isFallback ? 'warning' : 'success'}
                showIcon
                style={{ marginBottom: 16 }}
                closable
              />
            )}

            {/* Incident Summary */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5}>
                <SearchOutlined /> Incident Summary
              </Title>
              <Paragraph>{analysis.summary}</Paragraph>
            </Card>

            {/* Risk Factors */}
            <Card 
              size="small" 
              title={<Space><WarningOutlined /> Identified Risk Factors</Space>}
              style={{ marginBottom: 16 }}
            >
              <List
                dataSource={analysis.riskFactors}
                renderItem={(factor) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Tag color={
                          factor.level === 'high' ? 'red' : 
                          factor.level === 'medium' ? 'orange' : 'green'
                        }>
                          {factor.level?.toUpperCase()}
                        </Tag>
                      }
                      title={factor.factor}
                      description={factor.description}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* Investigation Questions */}
            <Card 
              size="small" 
              title={<Space><FileSearchOutlined /> Suggested Investigation Questions</Space>}
              style={{ marginBottom: 16 }}
            >
              <Collapse ghost>
                {Object.entries(
                  analysis.investigationQuestions.reduce((acc, q) => {
                    if (!acc[q.category]) acc[q.category] = [];
                    acc[q.category].push(q);
                    return acc;
                  }, {})
                ).map(([category, questions]) => (
                  <Panel header={category} key={category}>
                    <List
                      size="small"
                      dataSource={questions}
                      renderItem={(q, index) => (
                        <List.Item
                          actions={[
                            <Tooltip title="Copy question" key="copy">
                              <Button 
                                type="link" 
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={() => {
                                  navigator.clipboard?.writeText(q.question);
                                  message.success('Question copied');
                                }}
                              />
                            </Tooltip>
                          ]}
                        >
                          <Text>{index + 1}. {q.question}</Text>
                        </List.Item>
                      )}
                    />
                  </Panel>
                ))}
              </Collapse>
            </Card>

            {/* Similar Patterns */}
            {analysis.similarPatterns?.length > 0 && (
              <Card 
                size="small" 
                title={<Space><LinkOutlined /> Similar Incident Patterns</Space>}
                style={{ marginBottom: 16 }}
              >
                {analysis.similarPatterns.map((pattern, index) => (
                  <div key={index} style={{ marginBottom: 16 }}>
                    <Title level={5}>Common Causes</Title>
                    <Space wrap>
                      {pattern.commonCauses?.map((cause, i) => (
                        <Tag key={i} color="orange">{cause}</Tag>
                      ))}
                    </Space>
                    <Title level={5} style={{ marginTop: 12 }}>Preventive Measures</Title>
                    <Space wrap>
                      {pattern.preventiveMeasures?.map((measure, i) => (
                        <Tag key={i} color="green">{measure}</Tag>
                      ))}
                    </Space>
                  </div>
                ))}
              </Card>
            )}

            {/* Confidence Score */}
            <Card size="small">
              <Row gutter={16} align="middle">
                <Col>
                  <Text type="secondary">Analysis Confidence:</Text>
                </Col>
                <Col flex="auto">
                  <Progress 
                    percent={analysis.confidence} 
                    status={analysis.confidence >= 80 ? 'success' : 'normal'}
                    strokeColor={analysis.confidence >= 80 ? '#52c41a' : '#faad14'}
                  />
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane tab={<span><ExperimentOutlined /> Root Cause Analysis</span>} key="rca">
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space>
                <Text strong>Analysis Method:</Text>
                <Select 
                  value={selectedFramework} 
                  onChange={setSelectedFramework}
                  style={{ width: 200 }}
                >
                  <Option value="5_whys">5 Whys Analysis</Option>
                  <Option value="fishbone">Fishbone Analysis</Option>
                  <Option value="fault_tree">Fault Tree Analysis</Option>
                </Select>
              </Space>
            </Card>

            {selectedFramework === '5_whys' && (
              <Card size="small">
                <Timeline>
                  <Timeline.Item color="red">
                    <Text strong>Problem Statement</Text>
                    <Paragraph>{incident?.description?.substring(0, 100)}...</Paragraph>
                  </Timeline.Item>
                  
                  {whysAnswers.map((why, index) => (
                    <Timeline.Item key={index} color={index === 4 ? 'green' : 'blue'}>
                      <Text strong>{why.question}</Text>
                      <Paragraph>{why.answer}</Paragraph>
                      {index === 4 && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Potential Root Cause
                        </Tag>
                      )}
                    </Timeline.Item>
                  ))}
                  
                  {whysAnswers.length < 5 && (
                    <Timeline.Item color="gray">
                      <Text type="secondary">Why {whysAnswers.length + 1}? (Pending)</Text>
                      <div style={{ marginTop: 8 }}>
                        <Space.Compact style={{ width: '100%' }}>
                          <Input 
                            placeholder="Enter your answer..."
                            onPressEnter={(e) => {
                              handleAddWhy(e.target.value);
                              e.target.value = '';
                            }}
                          />
                          <Button 
                            type="primary"
                            onClick={(e) => {
                              const input = e.target.closest('.ant-space-compact')?.querySelector('input');
                              if (input?.value) {
                                handleAddWhy(input.value);
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </Button>
                        </Space.Compact>
                      </div>
                    </Timeline.Item>
                  )}
                </Timeline>
              </Card>
            )}

            {selectedFramework === 'fishbone' && (
              <Card size="small">
                <Alert
                  message="Fishbone Analysis"
                  description="Use the Fishbone Diagram component to perform a detailed cause-and-effect analysis."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Button 
                  type="primary" 
                  icon={<BranchesOutlined />}
                  onClick={() => message.info('Use the Fishbone Diagram button from the incident view')}
                >
                  Open Fishbone Diagram
                </Button>
              </Card>
            )}
          </TabPane>

          <TabPane tab={<span><ToolOutlined /> Corrective Actions</span>} key="actions">
            <Alert
              message="Select Corrective Actions"
              description="Review and select the corrective actions you want to implement."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={[16, 16]}>
              {['immediate', 'investigation', 'corrective'].map(type => {
                const typeActions = suggestedActions.filter(a => a.type === type);
                if (typeActions.length === 0) return null;

                return (
                  <Col span={24} key={type}>
                    <Card 
                      size="small" 
                      title={
                        <Space>
                          {type === 'immediate' && <ThunderboltOutlined style={{ color: '#f5222d' }} />}
                          {type === 'investigation' && <SearchOutlined style={{ color: '#1890ff' }} />}
                          {type === 'corrective' && <ToolOutlined style={{ color: '#52c41a' }} />}
                          <span>
                            {type === 'immediate' ? 'Immediate Actions' : 
                             type === 'investigation' ? 'Investigation Actions' : 
                             'Corrective Actions'}
                          </span>
                          <Badge count={typeActions.length} />
                        </Space>
                      }
                    >
                      <List
                        dataSource={typeActions}
                        renderItem={(action) => (
                          <List.Item
                            actions={[
                              <Switch 
                                key="toggle"
                                checked={selectedActions.includes(action.action)}
                                onChange={(checked) => {
                                  if (checked) {
                                    setSelectedActions([...selectedActions, action.action]);
                                  } else {
                                    setSelectedActions(selectedActions.filter(a => a !== action.action));
                                  }
                                }}
                              />
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <Tag color={
                                  action.priority === 'critical' ? 'red' :
                                  action.priority === 'high' ? 'orange' : 'blue'
                                }>
                                  {action.priority?.toUpperCase()}
                                </Tag>
                              }
                              title={action.action}
                              description={
                                <Space>
                                  <Tag>{action.category}</Tag>
                                  <Tag icon={<ClockCircleOutlined />}>{action.timeframe}</Tag>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {selectedActions.length > 0 && (
              <Card 
                size="small" 
                style={{ marginTop: 16 }}
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    Selected Actions ({selectedActions.length})
                  </Space>
                }
              >
                <List
                  size="small"
                  dataSource={selectedActions}
                  renderItem={(action, index) => (
                    <List.Item>
                      <Text>{index + 1}. {action}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </TabPane>

          <TabPane tab={<span><RobotOutlined /> AI Chat</span>} key="chat">
            <div style={{ 
              height: 400, 
              overflow: 'auto', 
              marginBottom: 16, 
              padding: 16, 
              background: '#fafafa', 
              borderRadius: 8 
            }}>
              {conversation.map((msg, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 16
                  }}
                >
                  <Card 
                    size="small"
                    style={{ 
                      maxWidth: '80%',
                      background: msg.role === 'user' ? '#1890ff' : '#fff',
                      color: msg.role === 'user' ? '#fff' : '#000'
                    }}
                  >
                    <Space align="start">
                      {msg.role === 'assistant' && (
                        <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#722ed1' }} />
                      )}
                      <div>
                        <Text style={{ 
                          color: msg.role === 'user' ? '#fff' : '#000', 
                          whiteSpace: 'pre-wrap' 
                        }}>
                          {msg.content}
                        </Text>
                        <div style={{ 
                          fontSize: 10, 
                          color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#999', 
                          marginTop: 4 
                        }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                          {msg.isFallback && ' • fallback'}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#1890ff' }} />
                      )}
                    </Space>
                  </Card>
                </div>
              ))}

              {sendingMessage && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                  <Space>
                    <Spin size="small" />
                    <Text type="secondary">AI is thinking...</Text>
                  </Space>
                </div>
              )}
            </div>

            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="Ask me anything about the investigation..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onPressEnter={handleSendMessage}
                prefix={<RobotOutlined style={{ color: '#722ed1' }} />}
                disabled={sendingMessage}
              />
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={handleSendMessage}
                loading={sendingMessage}
              >
                Send
              </Button>
            </Space.Compact>

            <Divider>Quick Questions</Divider>
            <Space wrap>
              {[
                'What are the potential root causes?',
                'What corrective actions do you recommend?',
                'What regulatory reporting is required?',
                'What investigation questions should I ask?'
              ].map((q, i) => (
                <Tag 
                  key={i} 
                  color="blue" 
                  style={{ cursor: 'pointer', padding: '4px 8px' }}
                  onClick={() => {
                    setCustomQuestion(q);
                    // Trigger send
                    setTimeout(() => {
                      const event = { target: { value: q } };
                      setCustomQuestion('');
                      handleSendMessageWithText(q);
                    }, 0);
                  }}
                >
                  {q}
                </Tag>
              ))}
            </Space>
          </TabPane>
        </Tabs>
      ) : (
        <Result
          status="info"
          title="No Analysis Available"
          subTitle="Select an incident to generate AI-powered investigation assistance."
          extra={
            <Button type="primary" onClick={generateAnalysis} icon={<ReloadOutlined />}>
              Generate Analysis
            </Button>
          }
        />
      )}
    </Drawer>
  );

  // Helper for quick question sending
  function handleSendMessageWithText(text) {
    if (!text?.trim() || !incident) return;
    
    const userMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const updated = [...conversation, userMessage];
    setConversation(updated);
    setSendingMessage(true);

    notificationService.askAIInvestigation(incident.id, text, {
      context: { conversation: updated.slice(-5) }
    })
      .then(response => {
        const content = response?.answer || response?.response || response?.data?.answer;
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: content || generateFallbackResponse(text, incident),
          timestamp: new Date().toISOString(),
          isFallback: !content
        }]);
      })
      .catch(() => {
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: generateFallbackResponse(text, incident),
          timestamp: new Date().toISOString(),
          isFallback: true
        }]);
      })
      .finally(() => setSendingMessage(false));
  }
};

export default AIInvestigationAssistant;