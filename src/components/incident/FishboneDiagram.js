// src/components/incidents/FishboneDiagram.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Card, Button, Input, Select, Space, Tag, Modal, Form, message,
  Row, Col, Tooltip, Popconfirm, Empty, Divider, Badge, Alert,
  List, Avatar, Typography, Drawer, Tabs, Progress, Statistic, Spin,
  Radio, Timeline
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined,
  DownloadOutlined, ExpandOutlined, CompressOutlined,
  BranchesOutlined, BulbOutlined, ThunderboltOutlined,
  FileImageOutlined, ReloadOutlined,
  CheckCircleOutlined, RobotOutlined, QuestionCircleOutlined,
  UndoOutlined, RedoOutlined, AimOutlined, FireOutlined,
  StarOutlined, StarFilled,
  HistoryOutlined,
  ZoomInOutlined, ZoomOutOutlined
} from '@ant-design/icons';

// ✅ SINGLE SERVICE IMPORT — all AI calls route through the backend
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// ==================== EXPANDED CATEGORY PRESETS ====================

const DEFAULT_CATEGORIES = [
  { id: 'man',           name: 'Man / People',        color: '#1890ff', icon: '👤', description: 'Human factors, training, experience, fatigue, communication, behavior', causes: [] },
  { id: 'machine',       name: 'Machine / Equipment', color: '#52c41a', icon: '⚙️', description: 'Equipment failure, maintenance, design, calibration, wear', causes: [] },
  { id: 'method',        name: 'Method / Process',    color: '#faad14', icon: '📋', description: 'Procedures, work instructions, supervision, planning, sequencing', causes: [] },
  { id: 'material',      name: 'Material',            color: '#722ed1', icon: '📦', description: 'Raw materials, components, specs, quality, compatibility', causes: [] },
  { id: 'measurement',   name: 'Measurement',         color: '#13c2c2', icon: '📊', description: 'Inspection, testing, calibration, data accuracy, monitoring', causes: [] },
  { id: 'environment',   name: 'Environment',         color: '#eb2f96', icon: '🌍', description: 'Lighting, noise, temperature, layout, weather, workspace', causes: [] },
  { id: 'management',    name: 'Management',          color: '#f5222d', icon: '📊', description: 'Supervision, planning, resource allocation, safety culture', causes: [] },
  { id: 'communication', name: 'Communication',       color: '#fa8c16', icon: '💬', description: 'Handoffs, briefings, signals, documentation, language barriers', causes: [] }
];

const INDUSTRY_SPECIFIC_CATEGORIES = {
  healthcare: [
    { id: 'patient',       name: 'Patient Factors',     color: '#1890ff', icon: '🏥', description: 'Condition, cooperation, history, comorbidities', causes: [] },
    { id: 'staff',         name: 'Staff Factors',       color: '#52c41a', icon: '👨‍⚕️', description: 'Training, competency, staffing levels, fatigue', causes: [] },
    { id: 'protocol',      name: 'Clinical Protocols',  color: '#faad14', icon: '📋', description: 'Guidelines, order sets, escalation pathways', causes: [] },
    { id: 'equipment',     name: 'Medical Equipment',   color: '#722ed1', icon: '🩺', description: 'Device failure, availability, usability', causes: [] },
    { id: 'communication', name: 'Communication',       color: '#13c2c2', icon: '💬', description: 'Handoffs (SBAR), documentation, closed-loop', causes: [] },
    { id: 'medication',    name: 'Medication',          color: '#eb2f96', icon: '💊', description: 'Dosing, administration, interactions, storage', causes: [] },
    { id: 'environment',   name: 'Environment',         color: '#a0d911', icon: '🏥', description: 'Ward layout, lighting, noise, distractions', causes: [] },
    { id: 'management',    name: 'Management',          color: '#f5222d', icon: '📊', description: 'Staffing models, policy, safety culture', causes: [] },
    { id: 'infection',     name: 'Infection Control',   color: '#722ed1', icon: '🧼', description: 'Hand hygiene, isolation, sterilization', causes: [] },
    { id: 'documentation', name: 'Documentation',       color: '#fa8c16', icon: '📝', description: 'EHR, charting, consent, orders', causes: [] }
  ],
  construction: [
    { id: 'worker',        name: 'Worker Factors',      color: '#1890ff', icon: '👷', description: 'Training, PPE, experience, fitness for duty', causes: [] },
    { id: 'equipment',     name: 'Equipment',           color: '#52c41a', icon: '🏗️', description: 'Cranes, tools, machinery, rigging', causes: [] },
    { id: 'method',        name: 'Method',              color: '#faad14', icon: '📋', description: 'Work method, sequencing, JSA, PTW', causes: [] },
    { id: 'material',      name: 'Materials',           color: '#722ed1', icon: '🧱', description: 'Structural materials, quality, delivery', causes: [] },
    { id: 'site',          name: 'Site Conditions',     color: '#13c2c2', icon: '🏔️', description: 'Ground, weather, access, housekeeping', causes: [] },
    { id: 'management',    name: 'Management',          color: '#eb2f96', icon: '📊', description: 'Supervision, planning, resourcing', causes: [] },
    { id: 'contractor',    name: 'Contractor',          color: '#f5222d', icon: '🤝', description: 'Selection, induction, supervision of subs', causes: [] },
    { id: 'design',        name: 'Design / Engineering', color: '#fa8c16', icon: '📐', description: 'Design adequacy, tolerances, constructability', causes: [] },
    { id: 'regulatory',    name: 'Regulatory',          color: '#a0d911', icon: '📜', description: 'Permits, inspections, compliance', causes: [] },
    { id: 'communication', name: 'Communication',       color: '#2f54eb', icon: '💬', description: 'Toolbox talks, shift handovers, signage', causes: [] }
  ],
  oil_gas: [
    { id: 'personnel',     name: 'Personnel',           color: '#1890ff', icon: '👷', description: 'Training, competency, fatigue', causes: [] },
    { id: 'equipment',     name: 'Equipment',           color: '#52c41a', icon: '🛢️', description: 'Pumps, valves, vessels, instrumentation', causes: [] },
    { id: 'process',       name: 'Process',             color: '#faad14', icon: '⚗️', description: 'Procedures, parameters, HAZOP findings', causes: [] },
    { id: 'chemical',      name: 'Chemicals',           color: '#722ed1', icon: '🧪', description: 'H2S, hydrocarbons, compatibility, SDS', causes: [] },
    { id: 'environment',   name: 'Environment',         color: '#13c2c2', icon: '🌊', description: 'Weather, sea state, temperature', causes: [] },
    { id: 'management',    name: 'Management',          color: '#eb2f96', icon: '📊', description: 'Permits (PTW), supervision, SIMOPS', causes: [] },
    { id: 'barrier',       name: 'Safety Barriers',     color: '#f5222d', icon: '🛡️', description: 'BOWTIE barriers, ESD, relief systems', causes: [] },
    { id: 'maintenance',   name: 'Maintenance',         color: '#fa8c16', icon: '🔧', description: 'PM, inspection, calibration, integrity', causes: [] },
    { id: 'regulatory',    name: 'Regulatory',          color: '#a0d911', icon: '📜', description: 'BSEE, HSE, API standards', causes: [] },
    { id: 'human_factors', name: 'Human Factors',       color: '#2f54eb', icon: '🧠', description: 'Workload, decision-making, alarm flood', causes: [] }
  ],
  manufacturing: [
    { id: 'man',           name: 'Man / Operator',      color: '#1890ff', icon: '👤', description: 'Skill, training, fatigue, task design', causes: [] },
    { id: 'machine',       name: 'Machine',             color: '#52c41a', icon: '⚙️', description: 'Failure, wear, guarding, maintenance', causes: [] },
    { id: 'method',        name: 'Method',              color: '#faad14', icon: '📋', description: 'SOPs, changeover, quality gates', causes: [] },
    { id: 'material',      name: 'Material',            color: '#722ed1', icon: '📦', description: 'Incoming quality, supplier, storage', causes: [] },
    { id: 'measurement',   name: 'Measurement',         color: '#13c2c2', icon: '📊', description: 'Gauges, MSA, calibration, SPC', causes: [] },
    { id: 'environment',   name: 'Environment',         color: '#eb2f96', icon: '🌍', description: 'Temp, humidity, dust, layout', causes: [] },
    { id: 'management',    name: 'Management',          color: '#f5222d', icon: '📊', description: 'KPIs, staffing, escalation', causes: [] },
    { id: 'maintenance',   name: 'Maintenance',         color: '#fa8c16', icon: '🔧', description: 'PM schedule, spare parts, LOTO', causes: [] },
    { id: 'supplier',      name: 'Supplier',            color: '#a0d911', icon: '🚚', description: 'Quality, lead time, spec compliance', causes: [] },
    { id: 'design',        name: 'Design',              color: '#2f54eb', icon: '📐', description: 'Product/process design, FMEA findings', causes: [] }
  ],
  aviation: [
    { id: 'flight_crew',   name: 'Flight Crew',         color: '#1890ff', icon: '✈️', description: 'CRM, training, fatigue, decision-making', causes: [] },
    { id: 'aircraft',      name: 'Aircraft Systems',    color: '#52c41a', icon: '🛩️', description: 'Airframe, engines, avionics, MEL', causes: [] },
    { id: 'atc',           name: 'ATC / Ground',        color: '#faad14', icon: '📡', description: 'Clearances, handoffs, workload', causes: [] },
    { id: 'weather',       name: 'Weather',             color: '#13c2c2', icon: '🌩️', description: 'Wind, visibility, icing, turbulence', causes: [] },
    { id: 'maintenance',   name: 'Maintenance',         color: '#722ed1', icon: '🔧', description: 'AMM compliance, inspection, MEL', causes: [] },
    { id: 'management',    name: 'Management / SMS',    color: '#eb2f96', icon: '📊', description: 'Safety management, pressure, resources', causes: [] },
    { id: 'human_factors', name: 'Human Factors',       color: '#f5222d', icon: '🧠', description: 'Situation awareness, workload, complacency', causes: [] },
    { id: 'regulatory',    name: 'Regulatory',          color: '#fa8c16', icon: '📜', description: 'FAA/EASA, ADs, compliance', causes: [] },
    { id: 'communication', name: 'Communication',       color: '#a0d911', icon: '💬', description: 'Phraseology, readback, briefing', causes: [] },
    { id: 'environment',   name: 'Airport Environment', color: '#2f54eb', icon: '🛬', description: 'Runway, lighting, wildlife, signage', causes: [] }
  ],
  chemical: [
    { id: 'personnel',     name: 'Personnel',           color: '#1890ff', icon: '👤', description: 'Competency, training, staffing', causes: [] },
    { id: 'equipment',     name: 'Equipment',           color: '#52c41a', icon: '🏭', description: 'Reactors, vessels, pumps, relief', causes: [] },
    { id: 'process',       name: 'Process',             color: '#faad14', icon: '⚗️', description: 'HAZOP, parameters, control philosophy', causes: [] },
    { id: 'chemical',      name: 'Chemical Properties', color: '#722ed1', icon: '🧪', description: 'Reactivity, toxicity, flammability', causes: [] },
    { id: 'instrument',    name: 'Instrumentation',     color: '#13c2c2', icon: '📟', description: 'Sensors, interlocks, SIS, alarms', causes: [] },
    { id: 'environment',   name: 'Environment',         color: '#eb2f96', icon: '🌍', description: 'Ventilation, temp, containment', causes: [] },
    { id: 'management',    name: 'Management / MOC',    color: '#f5222d', icon: '📊', description: 'Management of Change, permits, training', causes: [] },
    { id: 'maintenance',   name: 'Maintenance',         color: '#fa8c16', icon: '🔧', description: 'PM, inspection, LOTO, hot work', causes: [] },
    { id: 'regulatory',    name: 'Regulatory',          color: '#a0d911', icon: '📜', description: 'OSHA PSM, EPA RMP, SEVESO', causes: [] },
    { id: 'human_factors', name: 'Human Factors',       color: '#2f54eb', icon: '🧠', description: 'Alarm response, workload, fatigue', causes: [] }
  ],
  mining: [
    { id: 'worker',        name: 'Worker',              color: '#1890ff', icon: '⛏️', description: 'Training, fitness, PPE', causes: [] },
    { id: 'equipment',     name: 'Equipment',           color: '#52c41a', icon: '🚜', description: 'Haul trucks, drills, conveyors', causes: [] },
    { id: 'method',        name: 'Method',              color: '#faad14', icon: '📋', description: 'Mining method, sequencing, ground control', causes: [] },
    { id: 'geology',       name: 'Geology / Ground',    color: '#722ed1', icon: '🪨', description: 'Rock mass, faults, water, gas', causes: [] },
    { id: 'ventilation',   name: 'Ventilation',         color: '#13c2c2', icon: '💨', description: 'Airflow, gas levels, dust', causes: [] },
    { id: 'environment',   name: 'Environment',         color: '#eb2f96', icon: '🌍', description: 'Weather, visibility, noise', causes: [] },
    { id: 'management',    name: 'Management',          color: '#f5222d', icon: '📊', description: 'Supervision, planning, contractors', causes: [] },
    { id: 'explosives',    name: 'Explosives',          color: '#fa8c16', icon: '💥', description: 'Blasting, storage, handling', causes: [] },
    { id: 'regulatory',    name: 'Regulatory',          color: '#a0d911', icon: '📜', description: 'MSHA, state regulations', causes: [] },
    { id: 'emergency',     name: 'Emergency Response',  color: '#2f54eb', icon: '🚨', description: 'Refuge, comms, escape routes', causes: [] }
  ]
};

const CONTROL_LEVELS = {
  elimination:    { label: 'Elimination',    color: '#52c41a', icon: '🚫' },
  substitution:   { label: 'Substitution',   color: '#13c2c2', icon: '🔄' },
  engineering:    { label: 'Engineering',    color: '#1890ff', icon: '🔧' },
  administrative: { label: 'Administrative', color: '#faad14', icon: '📋' },
  ppe:            { label: 'PPE',            color: '#eb2f96', icon: '🦺' }
};

const LIKELIHOODS = {
  high:   { color: 'red',    label: 'High' },
  medium: { color: 'orange', label: 'Medium' },
  low:    { color: 'green',  label: 'Low' }
};

// ==================== CATEGORY EDITOR ====================

const CategoryEditor = ({ initial, onCreate, onSave }) => {
  const [form] = Form.useForm();
  const handleChange = () => {
    const v = form.getFieldsValue();
    if (!v.name) return;
    if (onCreate) onCreate({ ...v, id: `cat_${Date.now()}` });
    if (onSave) onSave(v);
  };
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initial || { name: '', icon: '🔍', color: '#1890ff', description: '' }}
      onValuesChange={handleChange}
    >
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input placeholder="e.g. Contractor Management" />
      </Form.Item>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="icon" label="Icon">
            <Input maxLength={2} placeholder="Single emoji" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="color" label="Color">
            <Input type="color" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="Description">
        <TextArea rows={2} />
      </Form.Item>
    </Form>
  );
};

// ==================== MAIN COMPONENT ====================

const FishboneDiagram = ({
  incident,
  visible,
  onClose,
  onSave,
  readOnly = false
}) => {
  const { user: currentUser } = useAuth();

  // ---------- STATE ----------
  const [categories, setCategories] = useState([]);
  const [problemStatement, setProblemStatement] = useState('');
  const [summary, setSummary] = useState(null);
  const [aiMeta, setAiMeta] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCause, setEditingCause] = useState(null);
  const [causeModalVisible, setCauseModalVisible] = useState(false);
  const [causeForm] = Form.useForm();

  const [expandedView, setExpandedView] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiExpandingCat, setAiExpandingCat] = useState(null);

  const [versions, setVersions] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const [aiStatus, setAiStatus] = useState({ available: false, totalKeys: 0, availableKeys: 0 });

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiOptions, setAiOptions] = useState({
    industry: 'general',
    depth: 'comprehensive',
    language: 'English',
    focusAreas: ''
  });

  const [fiveWhysModal, setFiveWhysModal] = useState({ open: false, cause: null, data: null, loading: false });
  const [actionsModal, setActionsModal] = useState({ open: false, cause: null, data: [], loading: false });

  const historyRef = useRef({ past: [], future: [] });
  const svgRef = useRef(null);

  // ---------- DERIVED ----------
  const allCauses = useMemo(
    () => categories.flatMap(c =>
      c.causes.map(x => ({ ...x, categoryId: c.id, categoryName: c.name, categoryColor: c.color }))
    ),
    [categories]
  );
  const totalCauses = allCauses.length;
  const rootCauses = useMemo(() => allCauses.filter(c => c.isRootCause), [allCauses]);
  const categoriesUsed = categories.filter(c => c.causes.length > 0).length;
  const highLikelihoodCount = allCauses.filter(c => c.likelihood === 'high').length;

  // ==================== DATA LOADING ====================

  const initializeDefaultCategories = useCallback(() => {
    if (!incident) return;
    const industry = incident.industry_id || incident.industry;
    const base = INDUSTRY_SPECIFIC_CATEGORIES[industry] || DEFAULT_CATEGORIES;
    setCategories(base.map(c => ({ ...c, causes: [] })));
    setProblemStatement(incident.title || '');
    setSummary(null);
    setAiMeta(null);
  }, [incident]);

  const loadFishboneAnalysis = useCallback(async () => {
    if (!incident || !visible) return;
    setLoading(true);
    try {
      const response = await notificationService.getFishboneAnalysis(incident.id);
      const analysis = response?.analysis || response?.data?.analysis || response?.data || response;

      if (analysis && analysis.categories) {
        const cats = typeof analysis.categories === 'string'
          ? JSON.parse(analysis.categories)
          : analysis.categories;
        setCategories(cats.map(c => ({
          ...c,
          causes: (c.causes || []).map(x => ({
            ...x,
            likelihood: x.likelihood || 'medium',
            isRootCause: !!x.isRootCause
          }))
        })));
        setProblemStatement(analysis.problem_statement || incident.title || '');
        setSummary(analysis.summary || null);
        setAiMeta(analysis.ai_metadata || null);
      } else {
        initializeDefaultCategories();
      }
    } catch (error) {
      console.warn('Fishbone load failed, using defaults:', error);
      initializeDefaultCategories();
    } finally {
      setLoading(false);
    }
  }, [incident, visible, initializeDefaultCategories]);

  const loadVersions = useCallback(async () => {
    if (!incident) return;
    try {
      const response = await notificationService.getFishboneVersions(incident.id);
      setVersions(response?.versions || []);
    } catch (error) {
      console.warn('Failed to load versions:', error);
    }
  }, [incident]);

  const loadAIHistory = useCallback(async () => {
    if (!incident) return;
    try {
      const res = await notificationService.getAIAnalysisHistory(incident.id);
      setAiHistory(res?.history || res?.data || []);
    } catch {
      setAiHistory([]);
    }
  }, [incident]);

  const loadAIStatus = useCallback(async () => {
    try {
      const status = await notificationService.getAIStatus();
      setAiStatus(status || { available: false, totalKeys: 0, availableKeys: 0 });
    } catch {
      setAiStatus({ available: false, totalKeys: 0, availableKeys: 0 });
    }
  }, []);

  useEffect(() => { loadFishboneAnalysis(); }, [loadFishboneAnalysis]);
  useEffect(() => {
    if (visible && incident) {
      loadVersions();
      loadAIHistory();
      loadAIStatus();
    }
  }, [visible, incident, loadVersions, loadAIHistory, loadAIStatus]);

  // ==================== HISTORY (UNDO/REDO) ====================

  const pushHistory = (newCategories, newProblem) => {
    const { past } = historyRef.current;
    past.push({ categories, problemStatement });
    if (past.length > 30) past.shift();
    historyRef.current.future = [];
    if (newCategories !== undefined) setCategories(newCategories);
    if (newProblem !== undefined) setProblemStatement(newProblem);
  };

  const undo = () => {
    const { past, future } = historyRef.current;
    if (!past.length) return;
    const prev = past.pop();
    future.push({ categories, problemStatement });
    setCategories(prev.categories);
    setProblemStatement(prev.problemStatement);
    message.info('Undone');
  };

  const redo = () => {
    const { past, future } = historyRef.current;
    if (!future.length) return;
    const next = future.pop();
    past.push({ categories, problemStatement });
    setCategories(next.categories);
    setProblemStatement(next.problemStatement);
    message.info('Redone');
  };

  // ==================== AI: FULL GENERATE ====================

  const handleAIGenerate = async () => {
    if (!incident) return;
    setAiGenerating(true);
    try {
      const focusAreas = aiOptions.focusAreas
        ? aiOptions.focusAreas.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const response = await notificationService.generateAIFishbone(incident.id, {
        industry: aiOptions.industry,
        focusAreas,
        ai_options: {
          model_preference: 'auto',
          language: aiOptions.language,
          depth: aiOptions.depth,
          temperature: 0.7
        }
      });

      const result =
        response?.analysis ||
        response?.data?.analysis ||
        response?.data ||
        response;

      if (!result?.categories || !Array.isArray(result.categories)) {
        console.warn('Unexpected AI response shape:', response);
        throw new Error('AI returned an unexpected shape');
      }

      pushHistory(
        result.categories,
        result.problemStatement || result.problem_statement || incident.title
      );

      setSummary(result.summary || null);

      setAiMeta({
        generatedAt: response.generated_at || new Date().toISOString(),
        depth: aiOptions.depth,
        industry: aiOptions.industry,
        language: aiOptions.language,
        methodology: result.methodology || null,
        modelInfo: response.model_info || null,
        usage: response.usage || null
      });

      setAiModalVisible(false);
      message.success(
        `AI generated ${result.categories.length} categories, ` +
        `${result.categories.reduce((s, c) => s + (c.causes?.length || 0), 0)} causes`
      );

      loadAIHistory();
    } catch (error) {
      console.error('AI generation failed:', error);
      message.error(error.message || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  // ==================== AI: EXPAND A CATEGORY ====================

  const handleExpandCategory = async (category) => {
    if (!incident) return;
    setAiExpandingCat(category.id);
    try {
      const response = await notificationService.expandFishboneCategory(
        incident.id, category, category.causes, 5
      );
      const newCauses =
        response?.analysis?.causes ||
        response?.causes ||
        response?.data?.causes ||
        [];

      if (!Array.isArray(newCauses) || newCauses.length === 0) {
        message.warning('AI did not return any new causes');
        return;
      }

      const updated = categories.map(c =>
        c.id === category.id ? { ...c, causes: [...c.causes, ...newCauses] } : c
      );
      pushHistory(updated);
      message.success(`+${newCauses.length} causes added to ${category.name}`);
    } catch (error) {
      message.error(error.message || 'Failed to expand category');
    } finally {
      setAiExpandingCat(null);
    }
  };

  // ==================== AI: SUGGEST CORRECTIVE ACTIONS ====================

  const handleSuggestActions = async (cause, category) => {
    setActionsModal({ open: true, cause, data: [], loading: true });
    try {
      const response = await notificationService.suggestCorrectiveActions(
        incident.id, category, cause
      );
      const actions =
        response?.analysis?.actions ||
        response?.actions ||
        response?.data?.actions ||
        [];
      setActionsModal({ open: true, cause, data: actions, loading: false });
    } catch (error) {
      message.error(error.message || 'Failed to suggest actions');
      setActionsModal({ open: false, cause: null, data: [], loading: false });
    }
  };

  const applySuggestedAction = (action) => {
    const cause = actionsModal.cause;
    if (!cause) return;
    const updated = categories.map(c => ({
      ...c,
      causes: c.causes.map(x =>
        x.id === cause.id
          ? {
              ...x,
              correctiveAction: action.description,
              controlLevel: action.controlLevel || 'administrative'
            }
          : x
      )
    }));
    pushHistory(updated);
    message.success('Corrective action applied');
    setActionsModal({ open: false, cause: null, data: [], loading: false });
  };

  // ==================== AI: 5-WHY ====================

  const handleFiveWhys = async (cause) => {
    setFiveWhysModal({ open: true, cause, data: null, loading: true });
    try {
      const response = await notificationService.runFiveWhys(incident.id, cause);
      const data =
        response?.analysis ||
        response?.data?.analysis ||
        response?.data ||
        response;
      setFiveWhysModal({ open: true, cause, data, loading: false });
    } catch (error) {
      message.error(error.message || 'Failed to run 5-Why');
      setFiveWhysModal({ open: false, cause: null, data: null, loading: false });
    }
  };

  const saveFiveWhys = async () => {
    const { cause, data } = fiveWhysModal;
    if (!cause || !data) return;
    try {
      await notificationService.saveFiveWhys(incident.id, cause.id, data);
      const updated = categories.map(c => ({
        ...c,
        causes: c.causes.map(x =>
          x.id === cause.id ? { ...x, isRootCause: true, fiveWhys: data } : x
        )
      }));
      pushHistory(updated);
      message.success('5-Why saved & cause marked as root cause');
      setFiveWhysModal({ open: false, cause: null, data: null, loading: false });
    } catch (error) {
      message.error(error.message || 'Failed to save 5-Why');
    }
  };

  // ==================== CAUSE CRUD ====================

  const handleAddCause = (categoryId) => {
    setSelectedCategory(categoryId);
    setEditingCause(null);
    causeForm.resetFields();
    setCauseModalVisible(true);
  };

  const handleEditCause = (categoryId, cause) => {
    setSelectedCategory(categoryId);
    setEditingCause(cause);
    causeForm.setFieldsValue(cause);
    setCauseModalVisible(true);
  };

  const handleSaveCause = (values) => {
    const updated = categories.map(cat => {
      if (cat.id !== selectedCategory) return cat;
      if (editingCause) {
        return {
          ...cat,
          causes: cat.causes.map(c =>
            c.id === editingCause.id ? { ...c, ...values, updatedAt: new Date().toISOString() } : c
          )
        };
      }
      return {
        ...cat,
        causes: [
          ...cat.causes,
          {
            id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            ...values,
            createdAt: new Date().toISOString()
          }
        ]
      };
    });
    pushHistory(updated);
    setCauseModalVisible(false);
    causeForm.resetFields();
    setEditingCause(null);
    message.success(editingCause ? 'Cause updated' : 'Cause added');
  };

  const handleDeleteCause = (categoryId, causeId) => {
    const updated = categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, causes: cat.causes.filter(c => c.id !== causeId) }
        : cat
    );
    pushHistory(updated);
    message.success('Cause removed');
  };

  const toggleRootCause = (categoryId, causeId) => {
    const updated = categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            causes: cat.causes.map(c =>
              c.id === causeId ? { ...c, isRootCause: !c.isRootCause } : c
            )
          }
        : cat
    );
    pushHistory(updated);
  };

  // ==================== SAVE ====================

  const handleSave = async () => {
    if (!incident) return message.warning('No incident selected');
    setSaving(true);
    try {
      const fishboneData = {
        problem_statement: problemStatement,
        categories,
        summary,
        ai_metadata: aiMeta,
        stats: {
          total_causes: totalCauses,
          root_causes_count: rootCauses.length,
          categories_used: categoriesUsed
        }
      };
      const response = await notificationService.saveFishboneAnalysis(incident.id, fishboneData);
      if (response?.success || response?.analysis || response?.data) {
        message.success('Fishbone saved');
        loadVersions();
        if (onSave) onSave(response?.analysis || response?.data || response);
      } else {
        throw new Error(response?.error || 'Failed to save');
      }
    } catch (error) {
      message.error(error.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ==================== EXPORT ====================

  const handleExportSVG = () => {
    if (!svgRef.current) return message.warning('Nothing to export');
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fishbone-${incident?.incident_number || 'analysis'}-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Exported SVG');
    } catch (e) {
      message.error('Export failed');
    }
  };

  const handleExportJSON = () => {
    try {
      const payload = {
        incident_id: incident?.id,
        problem_statement: problemStatement,
        categories,
        summary,
        ai_metadata: aiMeta,
        exported_at: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fishbone-${incident?.incident_number || 'analysis'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Exported JSON');
    } catch (e) {
      message.error('Export failed');
    }
  };

  // ==================== SVG: DYNAMIC LAYOUT (READABILITY-OPTIMIZED) ====================

  const renderFishboneSVG = () => {
  const catCount = categories.length;
  const topCats = categories.filter((_, i) => i % 2 === 0).slice(0, 4);
  const botCats = categories.filter((_, i) => i % 2 === 1).slice(0, 4);
  const slots = Math.max(topCats.length, botCats.length, 1);

  // ── Layout — wider slots for readable 8-category layout ──
  const SPINE_START_X = 60;
  const SPINE_END_X   = 2100;                                   // was 1680
  const AVAILABLE_W   = SPINE_END_X - SPINE_START_X - 80;
  const SLOT_W        = Math.max(320, AVAILABLE_W / slots);     // was 240
  const WIDTH         = SPINE_END_X + 340 + 40;

  const maxCauses = Math.max(...categories.map(c => c.causes.length), 0);
  const BONE_LEN  = maxCauses > 5 ? 250 : 200;

  const V_PADDING = 100;
  const HEIGHT    = (BONE_LEN + V_PADDING) * 2 + 140;
  const SPINE_Y   = HEIGHT / 2;

  // ── Cause card layout (two-row stagger) ──
  const ARM_A       = 62;      // even-index causes — nearer to rail
  const ARM_B       = 150;     // odd-index causes — farther from rail
  const CARD_H      = 58;
  const CARD_W_MAX  = 150;
  const CARD_W_MIN  = 108;
  const ROW_GAP     = 10;

  // How many causes per wing do we show inline?
  const VISIBLE_PER_WING = 4;

  // ── Sort so the most important 4 land on the wing ──
  const sortByImportance = (list) => {
    const order = { high: 0, medium: 1, low: 2 };
    return [...list].sort((a, b) => {
      if (a.isRootCause !== b.isRootCause) return a.isRootCause ? -1 : 1;
      return (order[a.likelihood] ?? 1) - (order[b.likelihood] ?? 1);
    });
  };

  const renderCause = (cause, cx, cy, isTop, color, index, step) => {
    const dir = isTop ? -1 : 1;
    const onRowB = index % 2 === 1;
    const armLen = onRowB ? ARM_B : ARM_A;

    // Card width adapts to same-row spacing so neighbours don't collide.
    const sameRowSpacing = 2 * Math.max(step, 1);
    const cardW = Math.max(
      CARD_W_MIN,
      Math.min(CARD_W_MAX, sameRowSpacing - ROW_GAP)
    );

    const cardCx  = cx + 12;
    const armEndY = cy + dir * armLen;
    const cardY   = isTop
      ? armEndY - CARD_H - 6
      : armEndY + 6;

    return (
      <g key={cause.id}>
        {/* Arm from rail to the card's nearest edge */}
        <line
          x1={cx}
          y1={cy}
          x2={cardCx}
          y2={armEndY}
          stroke={cause.isRootCause ? '#f5222d' : color}
          strokeWidth={cause.isRootCause ? 2.4 : 1.4}
          strokeDasharray={cause.isRootCause ? '' : '3,2'}
        />

        {/* Root-cause dot at the rail */}
        {cause.isRootCause && (
          <circle cx={cardCx} cy={armEndY} r={4.5} fill="#f5222d" />
        )}

        {/* Card */}
        <foreignObject
          x={cardCx - cardW / 2}
          y={cardY}
          width={cardW}
          height={CARD_H}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: cause.isRootCause ? 600 : 500,
              color: cause.isRootCause ? '#cf1322' : '#333',
              textAlign: 'center',
              padding: '6px 8px',
              background: cause.isRootCause ? '#fff1f0' : '#fafafa',
              border: `1.5px solid ${cause.isRootCause ? '#ffa39e' : '#d9d9d9'}`,
              borderRadius: 5,
              lineHeight: 1.25,
              height: '100%',
              boxSizing: 'border-box',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word'
            }}
            title={cause.description}
          >
            {cause.description}
          </foreignObject>
        </foreignObject>
      </g>
    );
  };

  const renderBone = (cat, idx, isTop) => {
    const startX = SPINE_START_X + 50 + idx * SLOT_W;
    const tipY   = isTop ? SPINE_Y - BONE_LEN : SPINE_Y + BONE_LEN;
    const labelW = Math.min(SLOT_W - 40, 260);
    const labelX = startX + 30;

    // Visible causes: top 4 by importance
    const visibleCauses = sortByImportance(cat.causes).slice(0, VISIBLE_PER_WING);
    const hiddenCount   = Math.max(cat.causes.length - VISIBLE_PER_WING, 0);

    const railStart = labelX + labelW + 10;
    const railEnd   = startX + SLOT_W - 20;
    const railLen   = Math.max(railEnd - railStart, 60);
    const step      = visibleCauses.length > 0 ? railLen / visibleCauses.length : 0;

    return (
      <g key={cat.id}>
        {/* Bone diagonal */}
        <line
          x1={startX} y1={SPINE_Y}
          x2={startX + 30} y2={tipY}
          stroke={cat.color}
          strokeWidth={2.5}
        />
        {/* Rail */}
        <line
          x1={startX + 30} y1={tipY}
          x2={startX + SLOT_W - 20} y2={tipY}
          stroke={cat.color}
          strokeWidth={2.5}
        />
        {/* Banner */}
        <rect
          x={labelX}
          y={isTop ? tipY - 36 : tipY + 6}
          width={labelW}
          height={30}
          rx={5}
          fill={cat.color}
        />
        <text
          x={labelX + labelW / 2}
          y={isTop ? tipY - 15 : tipY + 27}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
          fontWeight="bold"
        >
          {cat.icon}{' '}
          {cat.name.length > 30 ? cat.name.substring(0, 30) + '…' : cat.name}
        </text>

        {/* Visible causes */}
        {visibleCauses.map((cause, i) => {
          const cx = railStart + step * (i + 0.5);
          return renderCause(cause, cx, tipY, isTop, cat.color, i, step);
        })}

        {/* "+N more" badge */}
        {hiddenCount > 0 && (
          <g>
            <rect
              x={startX + SLOT_W - 46}
              y={isTop ? tipY - 15 : tipY + 5}
              width={38}
              height={22}
              rx={11}
              fill="#f0f0f0"
              stroke="#d9d9d9"
            />
            <text
              x={startX + SLOT_W - 27}
              y={isTop ? tipY + 0.5 : tipY + 20}
              textAnchor="middle"
              fontSize={12}
              fill="#555"
              fontWeight="bold"
            >
              +{hiddenCount}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{
        width: '100%',
        height: 'auto',
        background: '#fff',
        minWidth: 1600
      }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
        </marker>
        <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f5222d" />
          <stop offset="100%" stopColor="#cf1322" />
        </linearGradient>
      </defs>

      {/* Problem / Effect box */}
      <rect
        x={SPINE_END_X + 20}
        y={SPINE_Y - 60}
        width={280}
        height={120}
        rx={10}
        fill="url(#headGrad)"
        stroke="#a8071a"
        strokeWidth={2}
      />
      <text
        x={SPINE_END_X + 160}
        y={SPINE_Y - 34}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
        fontWeight="bold"
        letterSpacing="1"
      >
        PROBLEM / EFFECT
      </text>
      <foreignObject
        x={SPINE_END_X + 30}
        y={SPINE_Y - 22}
        width={260}
        height={80}
      >
        <div
          style={{
            color: '#fff',
            fontSize: 13,
            textAlign: 'center',
            padding: '6px',
            lineHeight: 1.35
          }}
        >
          {problemStatement?.substring(0, 180) || 'Describe the problem'}
          {problemStatement?.length > 180 ? '…' : ''}
        </div>
      </foreignObject>

      {/* Spine */}
      <line
        x1={SPINE_START_X} y1={SPINE_Y}
        x2={SPINE_END_X + 20} y2={SPINE_Y}
        stroke="#333"
        strokeWidth={4}
        markerEnd="url(#arrowhead)"
      />

      {topCats.map((cat, i) => renderBone(cat, i, true))}
      {botCats.map((cat, i) => renderBone(cat, i, false))}

      {/* Legend */}
      <g transform={`translate(20, ${HEIGHT - 26})`}>
        <circle cx={0} cy={0} r={6} fill="#f5222d" />
        <text x={14} y={5} fontSize={13} fill="#444">Root cause</text>
        <circle cx={128} cy={0} r={5} fill="none" stroke="#999" strokeDasharray="3,2" />
        <text x={142} y={5} fontSize={13} fill="#444">Contributing</text>
        <text x={280} y={5} fontSize={13} fill="#888">
          {catCount} categories · {totalCauses} causes
        </text>
      </g>
    </svg>
  );
};
  // ==================== CAUSE LIST ITEM ====================

  const renderCauseItem = (cat, cause) => (
    <List.Item
      key={cause.id}
      style={{
        background: cause.isRootCause ? '#fff1f0' : 'transparent',
        borderLeft: cause.isRootCause ? '3px solid #f5222d' : '3px solid transparent',
        paddingLeft: 8
      }}
      actions={!readOnly ? [
        <Tooltip title={cause.isRootCause ? 'Unmark root' : 'Mark root'} key="root">
          <Button
            type="link"
            size="small"
            icon={cause.isRootCause ? <StarFilled style={{ color: '#f5222d' }} /> : <StarOutlined />}
            onClick={() => toggleRootCause(cat.id, cause.id)}
          />
        </Tooltip>,
        <Tooltip title="5-Why" key="why">
          <Button
            type="link"
            size="small"
            icon={<QuestionCircleOutlined />}
            onClick={() => handleFiveWhys(cause)}
          />
        </Tooltip>,
        <Tooltip title="AI actions" key="ai">
          <Button
            type="link"
            size="small"
            icon={<BulbOutlined />}
            onClick={() => handleSuggestActions(cause, cat)}
          />
        </Tooltip>,
        <Tooltip title="Edit" key="edit">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditCause(cat.id, cause)}
          />
        </Tooltip>,
        <Popconfirm key="del" title="Remove?" onConfirm={() => handleDeleteCause(cat.id, cause.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ] : []}
    >
      <List.Item.Meta
        avatar={
          <Tag color={LIKELIHOODS[cause.likelihood]?.color || 'default'}>
            {(cause.likelihood || 'M').charAt(0).toUpperCase()}
          </Tag>
        }
        title={
          <Space wrap>
            <Text strong={cause.isRootCause}>{cause.description || cause.text}</Text>
            {cause.controlLevel && CONTROL_LEVELS[cause.controlLevel] && (
              <Tag color={CONTROL_LEVELS[cause.controlLevel].color}>
                {CONTROL_LEVELS[cause.controlLevel].icon} {CONTROL_LEVELS[cause.controlLevel].label}
              </Tag>
            )}
          </Space>
        }
        description={
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            {cause.evidence && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <b>Evidence:</b> {cause.evidence}
              </Text>
            )}
            {cause.correctiveAction && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <b>Action:</b> {cause.correctiveAction}
              </Text>
            )}
            {cause.investigationQuestion && (
              <Text italic type="secondary" style={{ fontSize: 12 }}>
                ❓ {cause.investigationQuestion}
              </Text>
            )}
          </Space>
        }
      />
    </List.Item>
  );

  // ==================== MAIN RENDER ====================

  return (
    <Drawer
      title={
        <Space>
          <BranchesOutlined style={{ color: '#722ed1' }} />
          <span>Fishbone Analysis</span>
          {incident && <Tag color="blue">{incident.incident_number || `#${incident.id}`}</Tag>}
          <Badge count={totalCauses} style={{ backgroundColor: '#722ed1' }} />
          {aiMeta && <Tag color="purple" icon={<RobotOutlined />}>AI-generated</Tag>}
        </Space>
      }
      placement="right"
      width={expandedView ? '100%' : 1100}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Tooltip title="Undo"><Button icon={<UndoOutlined />} onClick={undo} /></Tooltip>
          <Tooltip title="Redo"><Button icon={<RedoOutlined />} onClick={redo} /></Tooltip>
          <Tooltip title="Reload">
            <Button icon={<ReloadOutlined />} onClick={loadFishboneAnalysis} loading={loading} />
          </Tooltip>
          <Tooltip title={expandedView ? 'Collapse' : 'Expand'}>
            <Button
              icon={expandedView ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={() => setExpandedView(!expandedView)}
            />
          </Tooltip>
          <Tooltip title="Export SVG">
            <Button icon={<FileImageOutlined />} onClick={handleExportSVG} />
          </Tooltip>
          <Tooltip title="Export JSON">
            <Button icon={<DownloadOutlined />} onClick={handleExportJSON} />
          </Tooltip>
          {!readOnly && (
            <>
              <Button
                type="primary"
                icon={<RobotOutlined />}
                onClick={() => setAiModalVisible(true)}
                loading={aiGenerating}
                disabled={!aiStatus.available}
                style={{ background: '#722ed1', borderColor: '#722ed1' }}
              >
                AI Generate
              </Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                Save
              </Button>
            </>
          )}
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" tip="Loading fishbone analysis..." />
        </div>
      ) : (
        <>
          <Alert
            message="Root Cause Analysis"
            description="Use the fishbone diagram to systematically identify causes. Click 🤖 AI Generate to auto-populate categories, causes, evidence, root causes, corrective actions, and summary."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          {aiMeta && (
            <Alert
              type="success"
              showIcon
              icon={<RobotOutlined />}
              message={
                <Space wrap>
                  <span>AI-generated fishbone</span>
                  {aiMeta.modelInfo?.name && (
                    <Tag color="purple" style={{ marginLeft: 8 }}>
                      {aiMeta.modelInfo.name}
                    </Tag>
                  )}
                  {aiMeta.depth && <Tag>{aiMeta.depth}</Tag>}
                  {aiMeta.industry && <Tag>{aiMeta.industry}</Tag>}
                </Space>
              }
              description={
                <Space size="small" wrap>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(aiMeta.generatedAt).toLocaleString()}
                  </Text>
                  {aiMeta.usage && (aiMeta.usage.prompt_tokens || aiMeta.usage.completion_tokens) && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Tokens: {aiMeta.usage.prompt_tokens || 0} prompt / {aiMeta.usage.completion_tokens || 0} completion
                    </Text>
                  )}
                  {aiMeta.methodology?.frameworksApplied?.map(f => (
                    <Tag key={f} color="purple">{f}</Tag>
                  ))}
                </Space>
              }
              style={{ marginBottom: 16 }}
            />
          )}

          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col span={3}><Text strong>Problem:</Text></Col>
              <Col span={21}>
                <Input
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Describe the problem..."
                  disabled={readOnly}
                />
              </Col>
            </Row>
          </Card>

          <Row gutter={12} style={{ marginBottom: 16 }}>
            <Col span={4}>
              <Card size="small"><Statistic title="Categories" value={categories.length} /></Card>
            </Col>
            <Col span={5}>
              <Card size="small">
                <Statistic title="Total Causes" value={totalCauses} prefix={<BulbOutlined />} />
              </Card>
            </Col>
            <Col span={5}>
              <Card size="small">
                <Statistic
                  title="Root Causes"
                  value={rootCauses.length}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<FireOutlined />}
                />
              </Card>
            </Col>
            <Col span={5}>
              <Card size="small">
                <Statistic
                  title="High Likelihood"
                  value={highLikelihoodCount}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={5}>
              <Card size="small">
                <Statistic
                  title="Categories Used"
                  value={categoriesUsed}
                  suffix={`/ ${categories.length}`}
                />
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="diagram">
            <TabPane tab="📊 Diagram" key="diagram">
              {/* ── Zoom + view controls ── */}
              <Space style={{ marginBottom: 8 }} wrap>
                <Tooltip title="Zoom out">
                  <Button
                    size="small"
                    icon={<ZoomOutOutlined />}
                    onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                  />
                </Tooltip>
                <Text type="secondary" style={{ minWidth: 48, textAlign: 'center' }}>
                  {Math.round(zoom * 100)}%
                </Text>
                <Tooltip title="Zoom in">
                  <Button
                    size="small"
                    icon={<ZoomInOutlined />}
                    onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))}
                  />
                </Tooltip>
                <Button size="small" onClick={() => setZoom(1)}>Reset</Button>
                <Button
                  size="small"
                  onClick={() => setExpandedView(v => !v)}
                  icon={expandedView ? <CompressOutlined /> : <ExpandOutlined />}
                >
                  {expandedView ? 'Compact' : 'Full Screen'}
                </Button>
              </Space>

              <Card bodyStyle={{ padding: 12, overflowX: 'auto', overflowY: 'hidden' }}>
                {categories.length > 0 ? (
                  <div
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                      // Reserve visual space so scrollbars appear correctly when zoomed
                      width: `${100 / zoom}%`
                    }}
                  >
                    {renderFishboneSVG()}
                  </div>
                ) : (
                  <Empty description="No categories" />
                )}
              </Card>
            </TabPane>

            <TabPane tab={`🧩 Causes (${totalCauses})`} key="manage">
              <Row gutter={[16, 16]}>
                {categories.map(cat => (
                  <Col xs={24} md={12} key={cat.id}>
                    <Card
                      size="small"
                      title={
                        <Space>
                          <span style={{ fontSize: 18 }}>{cat.icon}</span>
                          <span style={{ color: cat.color }}>{cat.name}</span>
                          <Badge count={cat.causes.length} style={{ backgroundColor: cat.color }} />
                        </Space>
                      }
                      extra={
                        !readOnly && (
                          <Space size="small">
                            <Tooltip title="AI: add more causes">
                              <Button
                                type="link"
                                size="small"
                                icon={<ThunderboltOutlined />}
                                loading={aiExpandingCat === cat.id}
                                onClick={() => handleExpandCategory(cat)}
                                style={{ color: '#722ed1' }}
                                disabled={!aiStatus.available}
                              />
                            </Tooltip>
                            <Button
                              type="link"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => handleAddCause(cat.id)}
                            >
                              Add
                            </Button>
                          </Space>
                        )
                      }
                      style={{ borderTop: `3px solid ${cat.color}` }}
                    >
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                        {cat.description}
                      </Text>
                      {cat.causes.length > 0 ? (
                        <List
                          size="small"
                          dataSource={cat.causes}
                          renderItem={(cause) => renderCauseItem(cat, cause)}
                        />
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="No causes"
                          style={{ margin: '8px 0' }}
                        />
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab={`🗂️ Categories`} key="categories">
              <Card
                size="small"
                title={`Category Management (${categories.length})`}
                extra={
                  !readOnly && (
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        size="small"
                        onClick={() => {
                          Modal.confirm({
                            title: 'Reset to industry defaults?',
                            content: 'This will replace your categories. Causes will be lost.',
                            onOk: () => {
                              initializeDefaultCategories();
                              message.success('Reset');
                            }
                          });
                        }}
                      >
                        Reset to Preset
                      </Button>
                      <Button
                        icon={<PlusOutlined />}
                        size="small"
                        type="primary"
                        onClick={() => {
                          let tempCat = null;
                          Modal.confirm({
                            title: 'Add a category',
                            width: 480,
                            content: (
                              <CategoryEditor onCreate={(cat) => { tempCat = cat; }} />
                            ),
                            okText: 'Add',
                            onOk: () => {
                              if (!tempCat || !tempCat.name) {
                                message.warning('Please give the category a name');
                                return Promise.reject();
                              }
                              pushHistory([...categories, { ...tempCat, causes: [] }]);
                              message.success('Category added');
                            }
                          });
                        }}
                      >
                        Add Category
                      </Button>
                    </Space>
                  )
                }
              >
                <List
                  dataSource={categories}
                  renderItem={(cat, idx) => (
                    <List.Item
                      actions={!readOnly ? [
                        <Tooltip title="Move up" key="up">
                          <Button
                            size="small"
                            icon={<span>↑</span>}
                            disabled={idx === 0}
                            onClick={() => {
                              const next = [...categories];
                              [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                              pushHistory(next);
                            }}
                          />
                        </Tooltip>,
                        <Tooltip title="Move down" key="down">
                          <Button
                            size="small"
                            icon={<span>↓</span>}
                            disabled={idx === categories.length - 1}
                            onClick={() => {
                              const next = [...categories];
                              [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                              pushHistory(next);
                            }}
                          />
                        </Tooltip>,
                        <Tooltip title="Edit" key="edit">
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                              let updated = { ...cat };
                              Modal.confirm({
                                title: 'Edit category',
                                width: 480,
                                content: (
                                  <CategoryEditor
                                    initial={cat}
                                    onSave={(v) => { updated = { ...updated, ...v }; }}
                                  />
                                ),
                                okText: 'Save',
                                onOk: () => {
                                  pushHistory(categories.map((c, i) => i === idx ? updated : c));
                                  message.success('Category updated');
                                }
                              });
                            }}
                          />
                        </Tooltip>,
                        <Popconfirm
                          key="del"
                          title="Remove this category and its causes?"
                          onConfirm={() => pushHistory(categories.filter((_, i) => i !== idx))}
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ] : []}
                    >
                      <List.Item.Meta
                        avatar={
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 6,
                              background: cat.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 18,
                              color: '#fff'
                            }}
                          >
                            {cat.icon}
                          </div>
                        }
                        title={<span style={{ color: cat.color, fontWeight: 600 }}>{cat.name}</span>}
                        description={cat.description}
                      />
                      <Badge count={cat.causes.length} style={{ backgroundColor: cat.color }} />
                    </List.Item>
                  )}
                />
              </Card>
            </TabPane>

            <TabPane tab="🎯 Summary" key="summary">
              {summary ? (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Card>
                    <Statistic
                      title={<Space><AimOutlined /> Primary Root Cause</Space>}
                      value={summary.primaryRootCause || 'Not identified'}
                      valueStyle={{ fontSize: 14, fontWeight: 500 }}
                    />
                  </Card>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Confidence"
                          value={summary.confidenceLevel || 'medium'}
                          valueStyle={{
                            color:
                              summary.confidenceLevel === 'high' ? '#52c41a'
                              : summary.confidenceLevel === 'low' ? '#fa8c16'
                              : '#1890ff'
                          }}
                        />
                        {summary.confidenceReasoning && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {summary.confidenceReasoning}
                          </Text>
                        )}
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic title="Root Causes" value={rootCauses.length} prefix={<FireOutlined />} />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic title="Contributing Factors" value={summary.contributingFactors?.length || 0} />
                      </Card>
                    </Col>
                  </Row>
                  {summary.contributingFactors?.length > 0 && (
                    <Card title="Contributing Factors" size="small">
                      <List
                        size="small"
                        dataSource={summary.contributingFactors}
                        renderItem={(f, i) => (
                          <List.Item><Tag color="blue">{i + 1}</Tag> {f}</List.Item>
                        )}
                      />
                    </Card>
                  )}
                  {summary.immediateActions?.length > 0 && (
                    <Card title="Immediate Actions" size="small">
                      <List
                        size="small"
                        dataSource={summary.immediateActions}
                        renderItem={(a) => (
                          <List.Item>
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                            {a}
                          </List.Item>
                        )}
                      />
                    </Card>
                  )}
                </Space>
              ) : (
                <Empty description="No summary yet. Run AI Generate to see the summary." />
              )}

              <Divider orientation="left">Identified Root Causes ({rootCauses.length})</Divider>
              <List
                dataSource={rootCauses}
                renderItem={(cause) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: cause.categoryColor }}>
                          {cause.categoryName?.charAt(0)}
                        </Avatar>
                      }
                      title={cause.description}
                      description={<Text type="secondary">Category: {cause.categoryName}</Text>}
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No root causes yet.' }}
              />
            </TabPane>

            <TabPane tab={<span><HistoryOutlined /> History</span>} key="history">
              {aiHistory.length > 0 && (
                <>
                  <Divider orientation="left">🤖 AI Generations</Divider>
                  <Timeline>
                    {aiHistory.map(h => (
                      <Timeline.Item key={h.id} color="purple">
                        <Space direction="vertical" size={0}>
                          <Text strong>
                            {h.type || 'AI analysis'}
                            {h.model_info?.name && (
                              <Tag color="purple" style={{ marginLeft: 8 }}>
                                {h.model_info.name}
                              </Tag>
                            )}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(h.created_at || h.generated_at).toLocaleString()}
                            {h.user_name ? ` • by ${h.user_name}` : ''}
                          </Text>
                          {h.usage && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {h.usage.total_tokens || 0} tokens
                            </Text>
                          )}
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </>
              )}

              <Divider orientation="left">📜 Saved Versions ({versions.length})</Divider>
              {versions.length === 0 ? (
                <Empty description="No versions" />
              ) : (
                <Timeline>
                  {versions.map(v => (
                    <Timeline.Item key={v.id} color={v.is_current ? 'green' : 'gray'}>
                      <Space direction="vertical" size={0}>
                        <Text strong>
                          Version {v.version} {v.is_current && <Tag color="green">Current</Tag>}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {v.created_by_name || 'Unknown'} • {new Date(v.created_at).toLocaleString()}
                        </Text>
                        {v.ai_model && <Tag color="purple">{v.ai_model}</Tag>}
                        {!readOnly && !v.is_current && (
                          <Button
                            size="small"
                            type="link"
                            onClick={async () => {
                              try {
                                await notificationService.restoreFishboneVersion(incident.id, v.id);
                                message.success('Restored');
                                loadFishboneAnalysis();
                                loadVersions();
                              } catch (e) {
                                message.error(e.message);
                              }
                            }}
                          >
                            Restore
                          </Button>
                        )}
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )}
            </TabPane>

            <TabPane tab={<span><RobotOutlined /> AI Assistant</span>} key="ai">
              <Card size="small">
                <Alert
                  type={aiStatus.available ? 'success' : 'warning'}
                  showIcon
                  message={aiStatus.available ? 'AI Ready' : 'AI Unavailable'}
                  description={
                    aiStatus.available
                      ? `${aiStatus.availableKeys} of ${aiStatus.totalKeys} API keys available • model: gemini-flash-latest`
                      : 'Configure GEMINI_API_KEY on the backend'
                  }
                  style={{ marginBottom: 16 }}
                />

                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={() => setAiModalVisible(true)}
                  disabled={!aiStatus.available}
                  block
                >
                  Generate Full Analysis with AI
                </Button>
              </Card>
            </TabPane>
          </Tabs>
        </>
      )}

      {/* ============ Cause Modal ============ */}
      <Modal
        title={editingCause ? 'Edit Cause' : 'Add Cause'}
        open={causeModalVisible}
        onCancel={() => {
          setCauseModalVisible(false);
          causeForm.resetFields();
          setEditingCause(null);
        }}
        footer={null}
        width={640}
      >
        <Form form={causeForm} layout="vertical" onFinish={handleSaveCause}>
          <Form.Item
            name="description"
            label="Cause Description"
            rules={[{ required: true, message: 'Please describe' }]}
          >
            <TextArea rows={3} placeholder="Specific, observable cause..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="likelihood" label="Likelihood" initialValue="medium">
                <Select>
                  {Object.entries(LIKELIHOODS).map(([k, v]) => (
                    <Option key={k} value={k}>
                      <Tag color={v.color}>{v.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isRootCause" label="Root Cause?" initialValue={false}>
                <Select>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="controlLevel" label="Control Level" initialValue="administrative">
                <Select>
                  {Object.entries(CONTROL_LEVELS).map(([k, v]) => (
                    <Option key={k} value={k}>{v.icon} {v.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="evidence" label="Supporting Evidence">
            <TextArea rows={2} placeholder="What evidence supports this?" />
          </Form.Item>

          <Form.Item name="correctiveAction" label="Corrective Action">
            <TextArea rows={2} placeholder="What action addresses this?" />
          </Form.Item>

          <Form.Item name="investigationQuestion" label="Investigation Question">
            <Input placeholder="One probing question" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCause ? 'Update' : 'Add'}
              </Button>
              <Button
                onClick={() => {
                  setCauseModalVisible(false);
                  causeForm.resetFields();
                  setEditingCause(null);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ============ AI Generate Modal ============ */}
      <Modal
        title={<Space><RobotOutlined style={{ color: '#722ed1' }} /> AI Fishbone Generator</Space>}
        open={aiModalVisible}
        onCancel={() => !aiGenerating && setAiModalVisible(false)}
        onOk={handleAIGenerate}
        okText={aiGenerating ? 'Generating...' : 'Generate'}
        okButtonProps={{ loading: aiGenerating, disabled: !aiStatus.available }}
        width={560}
      >
        <Alert
          type="warning"
          showIcon
          message="This will replace current categories and causes"
          description="Undo is available if needed. Save first to keep a version."
          style={{ marginBottom: 16 }}
        />

        <Alert
          type="info"
          showIcon
          icon={<RobotOutlined />}
          message="Powered by Gemini Flash (latest)"
          description="The backend chooses the fastest available Gemini model automatically. Categories, causes, evidence, root causes, corrective actions, and the summary are all generated."
          style={{ marginBottom: 16 }}
        />

        <Form layout="vertical">
          <Form.Item label="Industry">
            <Select
              value={aiOptions.industry}
              onChange={(v) => setAiOptions({ ...aiOptions, industry: v })}
            >
              <Option value="general">General</Option>
              <Option value="healthcare">Healthcare</Option>
              <Option value="construction">Construction</Option>
              <Option value="oil_gas">Oil &amp; Gas</Option>
              <Option value="manufacturing">Manufacturing</Option>
              <Option value="aviation">Aviation</Option>
              <Option value="chemical">Chemical</Option>
              <Option value="mining">Mining</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Analysis Depth">
            <Radio.Group
              value={aiOptions.depth}
              onChange={(e) => setAiOptions({ ...aiOptions, depth: e.target.value })}
            >
              <Radio.Button value="quick">Quick</Radio.Button>
              <Radio.Button value="standard">Standard</Radio.Button>
              <Radio.Button value="comprehensive">Comprehensive</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Language">
            <Select
              value={aiOptions.language}
              onChange={(v) => setAiOptions({ ...aiOptions, language: v })}
            >
              <Option value="English">English</Option>
              <Option value="Spanish">Spanish</Option>
              <Option value="French">French</Option>
              <Option value="Arabic">Arabic</Option>
              <Option value="Hindi">Hindi</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Focus Areas (comma-separated)">
            <Input
              value={aiOptions.focusAreas}
              onChange={(e) => setAiOptions({ ...aiOptions, focusAreas: e.target.value })}
              placeholder="e.g., lockout/tagout, contractor supervision"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ============ 5-Why Modal ============ */}
      <Modal
        title={<Space><QuestionCircleOutlined /> 5-Why Analysis</Space>}
        open={fiveWhysModal.open}
        onCancel={() => setFiveWhysModal({ open: false, cause: null, data: null, loading: false })}
        width={640}
        footer={
          fiveWhysModal.data
            ? [
                <Button
                  key="close"
                  onClick={() => setFiveWhysModal({ open: false, cause: null, data: null, loading: false })}
                >
                  Close
                </Button>,
                <Button key="save" type="primary" onClick={saveFiveWhys}>
                  Save &amp; Mark Root Cause
                </Button>
              ]
            : null
        }
      >
        {fiveWhysModal.loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="Analyzing..." />
          </div>
        ) : fiveWhysModal.data ? (
          <>
            <Alert
              message={`Starting: ${fiveWhysModal.cause?.description}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Timeline>
              {fiveWhysModal.data.whys?.map((w, i) => (
                <Timeline.Item key={i} color="blue">
                  <Text strong>Why {w.level}?</Text> {w.question}<br />
                  <Text type="secondary">→ {w.answer}</Text>
                </Timeline.Item>
              ))}
            </Timeline>
            <Card size="small" style={{ background: '#fff1f0', marginTop: 16 }}>
              <Text strong style={{ color: '#cf1322' }}>🎯 Root Cause: </Text>
              <Text>{fiveWhysModal.data.rootCause}</Text>
              {fiveWhysModal.data.verificationQuestion && (
                <>
                  <br />
                  <Text italic type="secondary" style={{ fontSize: 12 }}>
                    Verify: {fiveWhysModal.data.verificationQuestion}
                  </Text>
                </>
              )}
            </Card>
          </>
        ) : null}
      </Modal>

      {/* ============ Suggested Actions Modal ============ */}
      <Modal
        title={<Space><BulbOutlined /> Suggested Corrective Actions</Space>}
        open={actionsModal.open}
        onCancel={() => setActionsModal({ open: false, cause: null, data: [], loading: false })}
        footer={null}
        width={640}
      >
        {actionsModal.loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="Thinking..." />
          </div>
        ) : (
          <>
            <Alert
              message={actionsModal.cause?.description}
              description="Ranked by Hierarchy of Controls effectiveness"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <List
              dataSource={actionsModal.data}
              renderItem={(a) => {
                const cl = CONTROL_LEVELS[a.controlLevel] || CONTROL_LEVELS.administrative;
                return (
                  <List.Item
                    actions={[
                      <Button
                        key="apply"
                        type="link"
                        size="small"
                        onClick={() => applySuggestedAction(a)}
                      >
                        Apply
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Tag color={cl.color}>{cl.icon} {cl.label}</Tag>}
                      title={a.description}
                      description={
                        <Space size="small">
                          <Tag>Impact: {a.impact}</Tag>
                          <Tag>Effort: {a.effort}</Tag>
                          <Tag>Timeline: {a.timeline}</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </>
        )}
      </Modal>
    </Drawer>
  );
};

export default FishboneDiagram;
