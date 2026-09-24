// src/components/incidents/AIInvestigationAssistant.js
import React, { useState, useEffect, useRef } from 'react';
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

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { Step } = Steps;

// ==================== AI KNOWLEDGE BASE ====================

const AI_KNOWLEDGE_BASE = {
  // Industry-specific investigation prompts
  investigationPrompts: {
    healthcare: [
      {
        category: 'Patient Safety',
        prompts: [
          'Was there a patient identification verification process?',
          'Were proper hand hygiene protocols followed?',
          'Was the patient adequately monitored?',
          'Were medication administration rights followed (right patient, right drug, right dose, right route, right time)?',
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
      },
      {
        category: 'Communication',
        prompts: [
          'Was there a proper handoff between shifts?',
          'Were critical results communicated timely?',
          'Was documentation complete and accurate?',
          'Were there language or communication barriers?'
        ]
      }
    ],
    construction: [
      {
        category: 'Safety Planning',
        prompts: [
          'Was a Job Hazard Analysis (JHA) conducted?',
          'Was there a pre-task safety briefing?',
          'Were proper permits obtained (hot work, confined space, etc.)?',
          'Was the work sequenced properly?'
        ]
      },
      {
        category: 'Equipment & Tools',
        prompts: [
          'Was the equipment properly inspected before use?',
          'Were operators certified for the equipment?',
          'Was the equipment properly maintained?',
          'Were proper guards and safety devices in place?'
        ]
      },
      {
        category: 'Human Factors',
        prompts: [
          'Was the worker adequately trained for the task?',
          'Was fatigue a contributing factor?',
          'Was proper PPE worn?',
          'Was there adequate supervision?'
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
      },
      {
        category: 'Equipment Integrity',
        prompts: [
          'Was equipment within inspection intervals?',
          'Were corrosion monitoring results within limits?',
          'Were safety systems (PSVs, ESD) functional?',
          'Was there any recent maintenance activity?'
        ]
      },
      {
        category: 'Human Factors',
        prompts: [
          'Was there adequate shift handover?',
          'Were operators properly trained?',
          'Was fatigue management in place?',
          'Was there communication between shifts?'
        ]
      }
    ]
  },

  // Root cause analysis frameworks
  rcaFrameworks: {
    '5_whys': {
      name: '5 Whys Analysis',
      description: 'Iterative interrogative technique to explore cause-and-effect relationships',
      steps: [
        'What happened? (Problem statement)',
        'Why did it happen? (1st Why)',
        'Why did that happen? (2nd Why)',
        'Why did that happen? (3rd Why)',
        'Why did that happen? (4th Why)',
        'Why did that happen? (5th Why - Root Cause)'
      ]
    },
    'fishbone': {
      name: 'Fishbone (Ishikawa) Analysis',
      description: 'Categorize potential causes into major categories',
      categories: ['Man', 'Machine', 'Method', 'Material', 'Measurement', 'Environment']
    },
    'fault_tree': {
      name: 'Fault Tree Analysis',
      description: 'Top-down deductive failure analysis',
      elements: ['Top Event', 'Intermediate Events', 'Basic Events', 'AND/OR Gates']
    },
    'taproot': {
      name: 'TapRooT Analysis',
      description: 'Systematic root cause analysis methodology',
      steps: ['SnapChar', 'Root Cause Tree', 'Corrective Actions']
    }
  },

  // Corrective action suggestions
  correctiveActions: {
    training: [
      'Conduct refresher training on relevant procedures',
      'Implement competency assessment program',
      'Develop job-specific training materials',
      'Establish mentorship program for new employees'
    ],
    procedure: [
      'Review and update standard operating procedures',
      'Implement additional checkpoints in the process',
      'Create visual aids and job aids',
      'Establish clear escalation criteria'
    ],
    equipment: [
      'Implement preventive maintenance schedule',
      'Upgrade or replace faulty equipment',
      'Add redundant safety systems',
      'Improve equipment inspection protocols'
    ],
    communication: [
      'Implement structured handoff protocols (e.g., SBAR)',
      'Establish daily safety briefings',
      'Create near-miss reporting system',
      'Improve documentation standards'
    ],
    management: [
      'Review staffing levels and workload distribution',
      'Implement safety leadership rounds',
      'Establish safety committees',
      'Review and update safety policies'
    ],
    environment: [
      'Improve lighting and visibility',
      'Reduce noise levels',
      'Optimize workspace layout',
      'Address ergonomic factors'
    ]
  },

  // Similar incident patterns
  incidentPatterns: {
    'fall': {
      commonCauses: [
        'Inadequate fall protection',
        'Poor housekeeping',
        'Insufficient lighting',
        'Wet or slippery surfaces',
        'Inappropriate footwear',
        'Lack of training'
      ],
      preventiveMeasures: [
        'Implement fall protection program',
        'Regular housekeeping inspections',
        'Improve lighting in high-risk areas',
        'Install non-slip surfaces',
        'Provide appropriate footwear',
        'Conduct fall prevention training'
      ]
    },
    'equipment_failure': {
      commonCauses: [
        'Inadequate maintenance',
        'Operator error',
        'Design deficiency',
        'Wear and tear',
        'Improper installation',
        'Overloading'
      ],
      preventiveMeasures: [
        'Implement preventive maintenance program',
        'Provide operator training',
        'Review equipment specifications',
        'Establish replacement schedules',
        'Verify installation procedures',
        'Implement load limits'
      ]
    },
    'chemical_exposure': {
      commonCauses: [
        'Inadequate ventilation',
        'Improper PPE use',
        'Lack of training',
        'Improper storage',
        'Unlabeled containers',
        'Spills and leaks'
      ],
      preventiveMeasures: [
        'Improve ventilation systems',
        'Enforce PPE requirements',
        'Conduct chemical safety training',
        'Implement proper storage procedures',
        'Ensure proper labeling',
        'Develop spill response procedures'
      ]
    }
  }
};

// ==================== AI INVESTIGATION ASSISTANT COMPONENT ====================

const AIInvestigationAssistant = ({ 
  incident, 
  visible, 
  onClose,
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [customQuestion, setCustomQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState('5_whys');
  const [whysAnswers, setWhysAnswers] = useState([]);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Generate AI analysis when incident changes
  useEffect(() => {
    if (incident && visible) {
      generateAnalysis();
    }
  }, [incident, visible]);

  const generateAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);

    // Simulate AI processing
    setTimeout(() => {
      const industry = incident?.industry_id || incident?.industry || 'general';
      const incidentType = incident?.incident_type || incident?.incidentType || '';
      
      // Generate analysis based on incident data
      const generatedAnalysis = {
        summary: generateSummary(incident),
        riskFactors: generateRiskFactors(incident),
        investigationQuestions: getInvestigationQuestions(industry, incidentType),
        similarPatterns: findSimilarPatterns(incidentType),
        suggestedActions: generateSuggestedActions(incident),
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        analysisDate: new Date().toISOString()
      };

      setAnalysis(generatedAnalysis);
      setSuggestedActions(generatedAnalysis.suggestedActions);
      setLoading(false);

      // Initialize conversation
      setConversation([
        {
          role: 'assistant',
          content: `I've analyzed incident ${incident.incident_number || incident.id}. Based on the details provided, I've identified ${generatedAnalysis.riskFactors.length} risk factors and ${generatedAnalysis.investigationQuestions.length} investigation questions to consider. How would you like to proceed?`,
          timestamp: new Date().toISOString()
        }
      ]);
    }, 2000);
  };

  const generateSummary = (incident) => {
    if (!incident) return '';
    return `This ${incident.severity || 'medium'} severity incident involving ${incident.incident_type?.replace(/_/g, ' ') || 'an incident'} occurred in the ${incident.industryName || incident.industry_id || 'unknown'} industry. ${incident.description || 'No description provided.'}`;
  };

  const generateRiskFactors = (incident) => {
    const factors = [];
    const industry = incident?.industry_id || incident?.industry;
    const severity = incident?.severity;

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

    // Add generic factors
    factors.push(
      { factor: 'Repeat potential', level: 'medium', description: 'Similar incidents may occur if not addressed' },
      { factor: 'Investigation complexity', level: incident?.severity === 'critical' ? 'high' : 'medium', description: 'Requires thorough investigation' }
    );

    return factors;
  };

  const getInvestigationQuestions = (industry, incidentType) => {
    const prompts = AI_KNOWLEDGE_BASE.investigationPrompts[industry] || [];
    const questions = [];
    
    prompts.forEach(category => {
      category.prompts.forEach(prompt => {
        questions.push({
          category: category.category,
          question: prompt,
          answered: false
        });
      });
    });

    // Add generic questions if no industry-specific ones
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

  const findSimilarPatterns = (incidentType) => {
    const type = (incidentType || '').toLowerCase();
    const patterns = [];

    if (type.includes('fall')) {
      patterns.push(AI_KNOWLEDGE_BASE.incidentPatterns['fall']);
    }
    if (type.includes('equipment') || type.includes('machine')) {
      patterns.push(AI_KNOWLEDGE_BASE.incidentPatterns['equipment_failure']);
    }
    if (type.includes('chemical') || type.includes('exposure')) {
      patterns.push(AI_KNOWLEDGE_BASE.incidentPatterns['chemical_exposure']);
    }

    return patterns;
  };

  const generateSuggestedActions = (incident) => {
    const actions = [];
    const severity = incident?.severity;
    const industry = incident?.industry_id;

    // Immediate actions
    actions.push({
      type: 'immediate',
      priority: 'high',
      action: 'Secure the incident scene and ensure no further harm',
      category: 'Safety',
      timeframe: 'Immediate'
    });

    if (severity === 'critical' || severity === 'high') {
      actions.push({
        type: 'immediate',
        priority: 'critical',
        action: 'Notify relevant authorities and management',
        category: 'Communication',
        timeframe: 'Within 1 hour'
      });
    }

    // Investigation actions
    actions.push({
      type: 'investigation',
      priority: 'high',
      action: 'Conduct witness interviews and gather evidence',
      category: 'Investigation',
      timeframe: 'Within 24 hours'
    });

    actions.push({
      type: 'investigation',
      priority: 'medium',
      action: 'Review relevant procedures and training records',
      category: 'Documentation',
      timeframe: 'Within 48 hours'
    });

    // Corrective actions based on category
    const correctiveCategories = ['training', 'procedure', 'equipment', 'communication', 'management', 'environment'];
    correctiveCategories.forEach(cat => {
      const catActions = AI_KNOWLEDGE_BASE.correctiveActions[cat];
      if (catActions && catActions.length > 0) {
        const randomAction = catActions[Math.floor(Math.random() * catActions.length)];
        actions.push({
          type: 'corrective',
          priority: 'medium',
          action: randomAction,
          category: cat.charAt(0).toUpperCase() + cat.slice(1),
          timeframe: 'Within 30 days'
        });
      }
    });

    return actions;
  };

  // Handle 5 Whys submission
  const handleAddWhy = (answer) => {
    if (whysAnswers.length < 5) {
      setWhysAnswers([...whysAnswers, { question: `Why ${whysAnswers.length + 1}?`, answer }]);
    }
  };

  // Generate investigation report
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setTimeout(() => {
      message.success('Investigation report generated successfully');
      setGeneratingReport(false);
    }, 1500);
  };

  // Save investigation data
  const handleSave = () => {
    const investigationData = {
      analysis,
      whysAnswers,
      selectedActions,
      conversation,
      savedAt: new Date().toISOString()
    };
    
    if (onSave) {
      onSave(investigationData);
    }
    message.success('Investigation data saved');
  };

  // Send message to AI
  const handleSendMessage = () => {
    if (!customQuestion.trim()) return;

    const userMessage = {
      role: 'user',
      content: customQuestion,
      timestamp: new Date().toISOString()
    };

    setConversation([...conversation, userMessage]);
    setCustomQuestion('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: generateAIResponse(customQuestion, incident),
        timestamp: new Date().toISOString()
      };
      setConversation(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (question, incident) => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('cause') || lowerQuestion.includes('why')) {
      return `Based on the incident details, potential contributing factors include:
      
1. **Human Factors**: Training gaps, fatigue, communication breakdown
2. **Equipment/System**: Maintenance issues, design deficiencies
3. **Procedural**: Inadequate procedures, lack of checkpoints
4. **Environmental**: Workspace conditions, external factors

I recommend using the 5 Whys technique to drill down to root causes. Would you like me to guide you through it?`;
    }

    if (lowerQuestion.includes('action') || lowerQuestion.includes('prevent')) {
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

    if (lowerQuestion.includes('regulatory') || lowerQuestion.includes('report')) {
      const industry = incident?.industry_id;
      let regs = 'OSHA (Occupational Safety and Health Administration)';
      
      if (industry === 'healthcare') regs += ', Joint Commission, CMS';
      if (industry === 'oil_gas') regs += ', EPA, PHMSA';
      if (industry === 'aviation') regs += ', FAA, NTSB';
      
      return `Based on the incident details, potential regulatory reporting requirements include:

**Applicable Agencies:** ${regs}

**Reporting Timeframes:**
- Fatality/Catastrophe: Within 8 hours
- Hospitalization/Amputation: Within 24 hours
- Other recordable: Within 7 days

Please consult with your safety/compliance team to confirm specific requirements.`;
    }

    return `I understand your question about "${question}". Based on the incident data, here are my observations:

The incident appears to involve ${incident?.incident_type?.replace(/_/g, ' ') || 'safety concerns'} in the ${incident?.industryName || 'specified'} industry. 

To provide more specific guidance, could you clarify what aspect of the investigation you'd like help with? I can assist with:
- Root cause analysis
- Contributing factors identification
- Corrective action recommendations
- Regulatory compliance guidance
- Interview question suggestions`;
  };

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
            <Tooltip title={`Analysis Confidence: ${analysis.confidence}%`}>
              <Tag color="green">
                <CheckCircleOutlined /> Analysis Ready
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
            <Text>Analyzing incident data...</Text>
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
          <TabPane 
            tab={<span><BulbOutlined /> Analysis</span>} 
            key="analysis"
          >
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
                            <Tooltip title="Mark as answered">
                              <Button 
                                type="link" 
                                size="small"
                                icon={<CheckCircleOutlined />}
                              />
                            </Tooltip>,
                            <Tooltip title="Copy question">
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
            {analysis.similarPatterns.length > 0 && (
              <Card 
                size="small" 
                title={<Space><LinkOutlined /> Similar Incident Patterns</Space>}
                style={{ marginBottom: 16 }}
              >
                {analysis.similarPatterns.map((pattern, index) => (
                  <div key={index} style={{ marginBottom: 16 }}>
                    <Title level={5}>Common Causes</Title>
                    <Space wrap>
                      {pattern.commonCauses.map((cause, i) => (
                        <Tag key={i} color="orange">{cause}</Tag>
                      ))}
                    </Space>
                    <Title level={5} style={{ marginTop: 12 }}>Preventive Measures</Title>
                    <Space wrap>
                      {pattern.preventiveMeasures.map((measure, i) => (
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

          <TabPane 
            tab={<span><ExperimentOutlined /> Root Cause Analysis</span>} 
            key="rca"
          >
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
                              const input = e.target.parentElement.querySelector('input');
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
                  description="Use the Fishbone Diagram component to perform a detailed cause-and-effect analysis. Click the button below to open the diagram."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Button 
                  type="primary" 
                  icon={<BranchesOutlined />}
                  onClick={() => {
                    // This would open the FishboneDiagram component
                    message.info('Opening Fishbone Diagram...');
                  }}
                >
                  Open Fishbone Diagram
                </Button>
              </Card>
            )}
          </TabPane>

          <TabPane 
            tab={<span><ToolOutlined /> Corrective Actions</span>} 
            key="actions"
          >
            <Alert
              message="Select Corrective Actions"
              description="Review and select the corrective actions you want to implement. Selected actions will be included in the investigation report."
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

          <TabPane 
            tab={<span><RobotOutlined /> AI Chat</span>} 
            key="chat"
          >
            <div style={{ height: 400, overflow: 'auto', marginBottom: 16, padding: 16, background: '#fafafa', borderRadius: 8 }}>
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
                      {msg.role === 'assistant' && <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                      <div>
                        <Text style={{ color: msg.role === 'user' ? '#fff' : '#000', whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </Text>
                        <div style={{ fontSize: 10, color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#999', marginTop: 4 }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {msg.role === 'user' && <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    </Space>
                  </Card>
                </div>
              ))}
            </div>

            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="Ask me anything about the investigation..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onPressEnter={handleSendMessage}
                prefix={<RobotOutlined style={{ color: '#722ed1' }} />}
              />
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={handleSendMessage}
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
                    handleSendMessage();
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
            <Button type="primary" onClick={generateAnalysis}>
              Generate Analysis
            </Button>
          }
        />
      )}
    </Drawer>
  );
};

export default AIInvestigationAssistant;