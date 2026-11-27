// src/pages/AnalyticsPage.js — Safety analytics dashboard
import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import {
  Card, Select, Button, Space, Typography, Modal, Form, Input, DatePicker, message, Tooltip, Dropdown,
  Tag, Radio, Switch, Spin, Alert, Drawer, List, Empty, Segmented, ColorPicker, Divider, Badge,
} from 'antd';
import {
  DashboardOutlined, PlusOutlined, SettingOutlined, DownloadOutlined, FullscreenOutlined, FullscreenExitOutlined,
  SaveOutlined, DeleteOutlined, EditOutlined, CopyOutlined, ReloadOutlined, FilePdfOutlined, FileImageOutlined,
  TeamOutlined, WarningOutlined, ClockCircleOutlined, SafetyOutlined, AlertOutlined, RiseOutlined, FieldTimeOutlined,
  ExperimentOutlined, EyeOutlined, ProjectOutlined, DatabaseOutlined, MoreOutlined, HolderOutlined, ArrowLeftOutlined,
  ArrowRightOutlined, ColumnWidthOutlined, ExportOutlined, FileExcelOutlined, InfoCircleOutlined, AppstoreAddOutlined,
  UndoOutlined, BgColorsOutlined, EyeInvisibleOutlined, CheckOutlined,
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import analyticsService from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import WidgetLibrary from '../components/analytics/WidgetLibrary';
import WidgetConfigModal from '../components/analytics/WidgetConfigModal';
import DataEntryForms from '../components/analytics/DataEntryForms';
import RecordsDrawer from '../components/analytics/RecordsDrawer';
import SafetyKpiPanel from '../components/analytics/SafetyKpiPanel';
import { ProjectBanner, ProjectFormModal, ProjectsDrawer, StatusTag } from '../components/analytics/ProjectPanel';
import { DynamicChart } from '../components/analytics/DynamicChart';
import {
  WIDGETS, PALETTES, SIZES, sizeCols, legacySize, DEFAULT_LAYOUT, RECORD_TO_FORM,
} from '../components/analytics/widgetCatalog';
import './AnalyticsPage.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ------------------------------------------------------------------ storage helpers (per user)
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full / private mode */ }
  },
};

const DEFAULT_THEME = { accent: '#1677ff', palette: 'default', card: 'shadow', density: 'comfortable', dark: false };
const RANGE_PRESETS = [
  { label: 'Last 30 days', value: [dayjs().subtract(30, 'day'), dayjs()] },
  { label: 'Last 90 days', value: [dayjs().subtract(90, 'day'), dayjs()] },
  { label: 'This year', value: [dayjs().startOf('year'), dayjs()] },
  { label: 'Last 12 months', value: [dayjs().subtract(12, 'month'), dayjs()] },
  { label: 'Last 3 years', value: [dayjs().subtract(3, 'year'), dayjs()] },
];
const ENTRY_LABEL = { manpower: 'manpower', training: 'training', lti: 'lost-time injury', manhours: 'man-hours',
  observations: 'observation', accidents: 'accident', severity: 'severity', injuries: 'injury', overdue: 'report submission' };
const CREATE = { manpower: 'createManpower', training: 'createTraining', lti: 'createLTI', manhours: 'createManHours',
  observations: 'createObservation', accidents: 'createAccident', severity: 'createSeverity', injuries: 'createInjury',
  overdue: 'createOverdueReport' };

const makeWidget = (type, palette) => {
  const def = WIDGETS[type];
  const cfg = { ...(def.config || {}) };
  if (!cfg.colors) cfg.colors = [...(PALETTES[palette] || PALETTES.default)];
  return { id: uuidv4(), type, title: def.name, sizeKey: def.size || 'md', config: cfg, visible: true };
};

// accept layouts saved by the old page ({size:{w}, position:{y}}) and drop unknown widget types
const normaliseLayout = (widgets) => (Array.isArray(widgets) ? widgets : [])
  .filter((w) => w && WIDGETS[w.type])
  .map((w, i) => ({
    id: w.id || uuidv4(), type: w.type, title: w.title || WIDGETS[w.type].name,
    sizeKey: w.sizeKey || legacySize(w.size?.w || 6), config: w.config || {}, visible: w.visible !== false,
    _order: w.position?.y ?? i,
  }))
  .sort((a, b) => a._order - b._order)
  .map(({ _order, ...w }) => w);

const fmt = (v, digits = 0) => (v === null || v === undefined ? '—'
  : Number(v).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 }));

// CSV cell that spreadsheet apps will not execute as a formula
const csvCell = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// ------------------------------------------------------------------ KPI widget
const KPI_DEFS = [
  { key: 'ltifr', label: 'LTIFR', icon: <WarningOutlined />, suffix: '/1M hrs', digits: 2, color: (v) => (v > 1 ? '#f5222d' : '#52c41a'),
    help: (k) => `Lost-time cases × 1,000,000 ÷ man-hours. Based on ${k.lti_source || 'LTI records'} (${k.lti_cases ?? 0} cases).` },
  { key: 'trir', label: 'TRIR', icon: <AlertOutlined />, suffix: '/200k hrs', digits: 2, color: (v) => (v > 3 ? '#fa8c16' : '#52c41a'),
    help: (k) => `Recordable injuries (medical treatment, restricted work, lost time, fatality) × 200,000 ÷ man-hours. ${k.classified_incidents ? `${k.recordables ?? 0} recordable of ${k.classified_incidents} classified incidents.` : 'Classify injuries to calculate it.'}` },
  { key: 'total_incidents', label: 'Incidents', icon: <SafetyOutlined />, link: '/incidents',
    sub: (k) => `${k.open_incidents ?? 0} open · ${k.serious_incidents ?? 0} serious`, color: () => '#1677ff' },
  { key: 'total_man_hours', label: 'Man-hours', icon: <FieldTimeOutlined />, color: () => '#13c2c2', help: () => 'Hours worked in the selected period.' },
  { key: 'total_manpower', label: 'Head-count', icon: <TeamOutlined />, color: () => '#2f54eb', sub: (k) => `from ${k.headcount_source || 'records'}` },
  { key: 'training_rate', label: 'Training rate', icon: <ExperimentOutlined />, suffix: '%', digits: 1,
    color: (v) => (v < 60 ? '#fa8c16' : '#52c41a'), sub: (k) => `${k.total_trained ?? 0} people trained` },
  { key: 'positive_obs', label: 'Observations', icon: <EyeOutlined />, link: '/safety/observations',
    value: (k) => (k.positive_obs || 0) + (k.negative_obs || 0), sub: (k) => `${k.positive_obs ?? 0} positive · ${k.negative_obs ?? 0} unsafe`, color: () => '#52c41a' },
  { key: 'overdue_rate', label: 'Late reports', icon: <ClockCircleOutlined />, suffix: '%', digits: 1, color: (v) => (v > 20 ? '#f5222d' : '#52c41a') },
  { key: 'avg_severity', label: 'Avg severity', icon: <RiseOutlined />, digits: 2, color: (v) => (v >= 5 ? '#f5222d' : v >= 3 ? '#fa8c16' : '#52c41a'),
    help: () => 'Average incident severity: low 1, medium 3, high 5, critical 7.' },
  { key: 'total_injuries', label: 'Injuries', icon: <SafetyOutlined />, color: () => '#faad14' },
];

const KpiGrid = memo(({ kpis = {}, onOpen }) => (
  <div className="pbi-kpis">
    {KPI_DEFS.map((d) => {
      const raw = d.value ? d.value(kpis) : kpis[d.key];
      const has = raw !== null && raw !== undefined;
      const tile = (
        <div className={`pbi-kpi ${d.link ? 'pbi-clickable' : ''}`} key={d.key} role={d.link ? 'button' : undefined} tabIndex={d.link ? 0 : undefined}
             onClick={d.link ? () => onOpen(d.link) : undefined} onKeyDown={d.link ? (e) => { if (e.key === 'Enter') onOpen(d.link); } : undefined}>
          <span className="pbi-kpi-label">{d.icon} {d.label}{d.help && <Tooltip title={d.help(kpis)}><InfoCircleOutlined className="pbi-kpi-info" /></Tooltip>}</span>
          <span className="pbi-kpi-value" style={{ color: has ? d.color(Number(raw)) : undefined }}>
            {has ? fmt(raw, d.digits || 0) : '—'}{has && d.suffix && <small>{d.suffix}</small>}
          </span>
          <span className="pbi-kpi-sub">{d.sub ? d.sub(kpis) : has ? '' : 'not enough data'}</span>
        </div>
      );
      return tile;
    })}
  </div>
));

// ------------------------------------------------------------------ one dashboard card
const WidgetCard = memo(({ widget, summary, index, count, editMode, dragOver, onAction, onOpen, onDragStart, onDragOverCard, onDrop }) => {
  const def = WIDGETS[widget.type];
  if (!def) return null;
  const cols = sizeCols(widget.sizeKey);
  let body;
  let footer = null;
  if (def.special === 'kpi') {
    body = <KpiGrid kpis={summary?.kpis} onOpen={onOpen} />;
  } else if (def.special === 'project') {
    const p = summary?.project;
    body = p ? (
      <div className="pbi-mini-project">
        <Space wrap><Text strong>{p.name}</Text><StatusTag status={p.status} /></Space>
        <div className="pbi-mini-bar"><span style={{ width: `${Math.min(100, p.progress || 0)}%`, background: p.late ? '#f5222d' : widget.config?.colors?.[0] || '#1677ff' }} /></div>
        <Text type="secondary">{p.progress}% complete · {p.days_remaining === null || p.days_remaining === undefined ? 'no end date' : p.days_remaining >= 0 ? `${p.days_remaining} days left` : `${-p.days_remaining} days late`}</Text>
        <Text type="secondary">{(p.milestones || []).filter((m) => m.status === 'achieved').length}/{(p.milestones || []).length} milestones</Text>
      </div>
    ) : <div className="pbi-chart-empty" style={{ height: 120 }}>Select a project at the top to see its status</div>;
  } else {
    const rows = def.data ? def.data(summary || {}) : [];
    body = <DynamicChart data={rows} xKey={def.xKey} yKey={def.yKey} yKeys={def.yKeys} config={widget.config} />;
    const total = (rows || []).reduce((s, r) => s + (Number(r[def.yKey || def.yKeys?.[0]?.key]) || 0), 0);
    footer = (
      <div className="pbi-widget-foot">
        <Text type="secondary">{rows?.length ? `${rows.length} ${rows.length === 1 ? 'point' : 'points'}${def.yKey ? ` · total ${fmt(total, 1)}` : ''}` : ''}</Text>
        <Space size={0}>
          {def.link && <Button type="link" size="small" icon={<ExportOutlined />} onClick={() => onOpen(def.link)}>Open module</Button>}
          {def.record && <Button type="link" size="small" icon={<DatabaseOutlined />} onClick={() => onAction('records', widget)}>Records</Button>}
          {(def.record || def.entry) && <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => onAction('add', widget)}>Add</Button>}
        </Space>
      </div>
    );
  }

  const menu = {
    items: [
      { key: 'config', icon: <BgColorsOutlined />, label: 'Customise…' },
      { key: 'size', icon: <ColumnWidthOutlined />, label: 'Width', children: SIZES.map((s) => ({ key: `size:${s.key}`, label: s.label, icon: widget.sizeKey === s.key ? <CheckOutlined /> : null })) },
      { key: 'left', icon: <ArrowLeftOutlined />, label: 'Move earlier', disabled: index === 0 },
      { key: 'right', icon: <ArrowRightOutlined />, label: 'Move later', disabled: index === count - 1 },
      { key: 'dup', icon: <CopyOutlined />, label: 'Duplicate' },
      { key: 'hide', icon: <EyeInvisibleOutlined />, label: 'Hide' },
      { type: 'divider' },
      { key: 'remove', icon: <DeleteOutlined />, label: 'Remove', danger: true },
    ],
    onClick: ({ key }) => onAction(key, widget),
  };

  return (
    <div className={`pbi-cell pbi-w-${widget.sizeKey || 'md'} ${dragOver ? 'drag-over' : ''}`} style={{ '--cols': cols }}
         draggable={editMode} onDragStart={(e) => onDragStart(e, widget.id)} onDragOver={(e) => onDragOverCard(e, widget.id)} onDrop={(e) => onDrop(e, widget.id)}>
      <Card size="small" className="pbi-widget" style={{ '--widget-accent': widget.config?.colors?.[0] || def.color }}
            title={<span className="pbi-widget-title">
              {editMode && <HolderOutlined className="pbi-drag" title="Drag to reorder" />}
              <span className="pbi-widget-icon" style={{ color: widget.config?.colors?.[0] || def.color }}>{def.icon}</span>
              <span className="pbi-widget-name" title={widget.title}>{widget.title}</span>
            </span>}
            extra={<Space size={0}>
              {editMode && <Tooltip title="Customise"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => onAction('config', widget)} /></Tooltip>}
              <Dropdown menu={menu} trigger={['click']}><Button type="text" size="small" icon={<MoreOutlined />} aria-label="Widget menu" /></Dropdown>
            </Space>}>
        <div className="pbi-widget-body">{body}</div>
        {footer}
      </Card>
    </div>
  );
});

// ------------------------------------------------------------------ module status strip
const StatusStrip = memo(({ modules, projects, onOpen, onProjects }) => {
  const entries = Object.entries(modules || {});
  const openProjects = projects.filter((p) => !['completed', 'cancelled', 'archived'].includes(p.status));
  const lateProjects = openProjects.filter((p) => p.end_date && dayjs(p.end_date).isBefore(dayjs(), 'day'));
  return (
    <div className="pbi-status">
      <button type="button" className="pbi-status-tile" onClick={onProjects}>
        <span className="pbi-status-label"><ProjectOutlined /> Projects</span>
        <span className="pbi-status-value">{openProjects.length}<small> open</small></span>
        <span className={`pbi-status-sub ${lateProjects.length ? 'warn' : ''}`}>{lateProjects.length ? `${lateProjects.length} past end date` : `${projects.length} in total`}</span>
      </button>
      {entries.map(([key, m]) => {
        const warn = (m.attention || 0) > 0;
        const Tag2 = m.link ? 'button' : 'div';
        return (
          <Tag2 type={m.link ? 'button' : undefined} key={key} className={`pbi-status-tile ${m.link ? '' : 'static'}`} onClick={m.link ? () => onOpen(m.link) : undefined}>
            <span className="pbi-status-label">{m.label}{m.link && <ExportOutlined className="pbi-status-go" />}</span>
            <span className="pbi-status-value">{fmt(m.total)}{m.open !== null && m.open !== undefined && m.open_label && <small> · {fmt(m.open)} {m.open_label}</small>}</span>
            <span className={`pbi-status-sub ${warn ? 'warn' : ''}`}>{m.attention !== null && m.attention !== undefined ? `${fmt(m.attention)} ${m.attention_label}` : ' '}</span>
          </Tag2>
        );
      })}
    </div>
  );
});

// ================================================================== page
const PowerBIAnalytics = () => {
  const history = useHistory();
  const { user } = useAuth() || {};
  const uid = user?.id || 'anon';
  const K = useMemo(() => ({ layout: `pbi:layout:${uid}`, prefs: `pbi:prefs:${uid}`, theme: `pbi:theme:${uid}` }), [uid]);

  // ---- persisted preferences
  const [theme, setTheme] = useState(() => ({ ...DEFAULT_THEME, ...store.get(`pbi:theme:${uid}`, {}) }));
  const [filters, setFilters] = useState(() => {
    const p = store.get(`pbi:prefs:${uid}`, {});
    const days = p.rangeDays || 365;
    return { range: [dayjs().subtract(days, 'day'), dayjs()], rangeDays: days, department: p.department || 'all', project: p.project || 'all', refresh: p.refresh || 0 };
  });
  const [widgets, setWidgets] = useState(() => {
    const saved = store.get(`pbi:layout:${uid}`, null) || store.get('powerbi_dashboard_config', null);
    const list = normaliseLayout(saved?.widgets);
    return list.length ? list : DEFAULT_LAYOUT.map((t) => makeWidget(t, 'default'));
  });

  // ---- data
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ---- ui
  const [editMode, setEditMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ open: false, project: null });
  const [records, setRecords] = useState({ open: false, kind: null });
  const [entry, setEntry] = useState(null);
  const [entrySaving, setEntrySaving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [exporting, setExporting] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [entryForm] = Form.useForm();
  const contentRef = useRef(null);
  const reqSeq = useRef(0);

  // persist
  useEffect(() => { store.set(K.layout, { widgets, lastSaved: new Date().toISOString() }); }, [widgets, K.layout]);
  useEffect(() => { store.set(K.theme, theme); }, [theme, K.theme]);
  useEffect(() => {
    store.set(K.prefs, { rangeDays: filters.rangeDays, department: filters.department, project: filters.project, refresh: filters.refresh });
  }, [filters, K.prefs]);

  // ---- loading
  const loadSummary = useCallback(async (quiet = false) => {
    const seq = ++reqSeq.current;
    if (!quiet) setLoading(true);
    try {
      const res = await analyticsService.fetchSummary({
        start_date: filters.range[0].format('YYYY-MM-DD'), end_date: filters.range[1].format('YYYY-MM-DD'),
        department: filters.department, project_id: filters.project,
      });
      if (seq !== reqSeq.current) return; // a newer request is on its way
      if (res?.success === false) throw new Error(res.error);
      setSummary(res?.data || null);
      setLoadError(null);
      setLastUpdated(new Date());
    } catch (e) {
      if (seq !== reqSeq.current) return;
      const status = e?.response?.status || e?.status;
      if (status === 404 && filters.project !== 'all') {
        message.warning('That project is no longer available — showing all projects');
        setFilters((f) => ({ ...f, project: 'all' }));
        return;
      }
      setLoadError(e?.response?.data?.error || e?.message || 'Could not load analytics data');
    } finally {
      if (seq === reqSeq.current) setLoading(false);
    }
  }, [filters.range, filters.department, filters.project]);

  const loadProjects = useCallback(async () => {
    try {
      const res = await analyticsService.fetchProjects();
      setProjects(res?.data || []);
    } catch (e) { setProjects([]); }
  }, []);
  const loadSaved = useCallback(async () => {
    try {
      const res = await analyticsService.getSavedDashboards();
      setSavedDashboards(res?.data || []);
    } catch (e) { setSavedDashboards([]); }
  }, []);

  useEffect(() => {
    loadProjects();
    loadSaved();
    analyticsService.fetchDepartments().then((r) => setDepartments(r?.data || [])).catch(() => setDepartments([]));
  }, [loadProjects, loadSaved]);
  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => {
    if (!filters.refresh) return undefined;
    const t = setInterval(() => { if (!document.hidden) loadSummary(true); }, filters.refresh * 60000);
    return () => clearInterval(t);
  }, [filters.refresh, loadSummary]);
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const refreshAll = useCallback(() => { loadSummary(true); loadProjects(); }, [loadSummary, loadProjects]);
  const openLink = useCallback((link) => history.push(link), [history]);

  // ---- widget actions
  const updateWidget = useCallback((id, patch) => setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w))), []);
  const addWidget = useCallback((type) => {
    setWidgets((ws) => [...ws, makeWidget(type, theme.palette)]);
    message.success(`${WIDGETS[type].name} added`);
    setTimeout(() => contentRef.current?.lastElementChild?.scrollIntoView?.({ behavior: 'smooth', block: 'center' }), 150);
  }, [theme.palette]);

  const onWidgetAction = useCallback((key, w) => {
    const def = WIDGETS[w.type];
    if (key === 'config') setConfigWidget(w);
    else if (key.startsWith('size:')) updateWidget(w.id, { sizeKey: key.slice(5) });
    else if (key === 'left' || key === 'right') {
      setWidgets((ws) => {
        const vis = ws.filter((x) => x.visible);
        const i = vis.findIndex((x) => x.id === w.id);
        const j = key === 'left' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= vis.length) return ws;
        const a = ws.indexOf(vis[i]);
        const b = ws.indexOf(vis[j]);
        const next = [...ws];
        [next[a], next[b]] = [next[b], next[a]];
        return next;
      });
    } else if (key === 'dup') {
      setWidgets((ws) => {
        const i = ws.findIndex((x) => x.id === w.id);
        const copy = { ...w, id: uuidv4(), title: `${w.title} (copy)`, config: { ...w.config } };
        return [...ws.slice(0, i + 1), copy, ...ws.slice(i + 1)];
      });
    } else if (key === 'hide') {
      updateWidget(w.id, { visible: false });
      message.info('Widget hidden — show it again from Settings › Layout');
    } else if (key === 'remove') {
      let removed;
      setWidgets((ws) => { removed = ws; return ws.filter((x) => x.id !== w.id); });
      message.success({ content: <span>Widget removed <Button size="small" type="link" onClick={() => setWidgets(removed)}>Undo</Button></span>, duration: 5 });
    } else if (key === 'records') setRecords({ open: true, kind: def.record });
    else if (key === 'add') setEntry(def.record ? RECORD_TO_FORM[def.record] : def.entry);
  }, [updateWidget]);

  // native drag & drop reorder (edit mode)
  const onDragStart = useCallback((e, id) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', id); } catch (x) { /* IE */ } }, []);
  const onDragOverCard = useCallback((e, id) => { if (!dragId) return; e.preventDefault(); if (id !== dragOverId) setDragOverId(id); }, [dragId, dragOverId]);
  const onDrop = useCallback((e, targetId) => {
    e.preventDefault();
    const from = dragId;
    setDragId(null); setDragOverId(null);
    if (!from || from === targetId) return;
    setWidgets((ws) => {
      const moving = ws.find((w) => w.id === from);
      const rest = ws.filter((w) => w.id !== from);
      const at = rest.findIndex((w) => w.id === targetId);
      rest.splice(at < 0 ? rest.length : at, 0, moving);
      return rest;
    });
  }, [dragId]);

  const applyPaletteToAll = useCallback((colors, scheme) => {
    setWidgets((ws) => ws.map((w) => (WIDGETS[w.type]?.special ? w : { ...w, config: { ...w.config, colors: [...colors], colorScheme: scheme || 'custom' } })));
  }, []);
  const resetLayout = () => {
    Modal.confirm({
      title: 'Reset the dashboard layout?', content: 'Your widgets, sizes and colours go back to the default set.', okText: 'Reset',
      onOk: () => setWidgets(DEFAULT_LAYOUT.map((t) => makeWidget(t, theme.palette))),
    });
  };

  // ---- data entry
  const submitEntry = async (values) => {
    const fn = analyticsService[CREATE[entry]];
    if (!fn) return;
    setEntrySaving(true);
    const body = { ...values };
    Object.keys(body).forEach((k) => { if (body[k] && typeof body[k].format === 'function') body[k] = body[k].format('YYYY-MM-DD'); });
    if (filters.project !== 'all') body.project_id = filters.project;
    try {
      const res = await fn(body);
      if (res?.success === false) throw new Error(res.error);
      message.success(`${ENTRY_LABEL[entry] || 'Record'} saved`);
      setEntry(null);
      entryForm.resetFields();
      loadSummary(true);
    } catch (e) {
      message.error(e?.response?.data?.error || e?.message || 'Could not save');
    } finally {
      setEntrySaving(false);
    }
  };

  // ---- projects
  const selectProject = (id) => { setFilters((f) => ({ ...f, project: id ?? 'all' })); setProjectsOpen(false); };
  const onProjectSaved = (p) => {
    setProjectForm({ open: false, project: null });
    loadProjects();
    if (p?.id && !projectForm.project) selectProject(p.id);
    else loadSummary(true);
  };
  const deleteSelectedProject = async () => {
    try {
      await analyticsService.deleteProject(filters.project);
      message.success('Project deleted');
      setFilters((f) => ({ ...f, project: 'all' }));
      loadProjects();
    } catch (e) {
      message.error(e?.response?.data?.error || 'Could not delete the project');
    }
  };

  // ---- saved dashboards
  const currentView = () => ({
    widgets,
    dateRange: { start: filters.range[0].format('YYYY-MM-DD'), end: filters.range[1].format('YYYY-MM-DD') },
    selectedDepartment: filters.department, selectedProject: filters.project,
  });
  const saveView = async () => {
    const name = saveName.trim();
    if (!name) { message.warning('Give the view a name'); return; }
    try {
      const res = await analyticsService.saveDashboard({ name, ...currentView() });
      if (res?.success === false) throw new Error(res.error);
      message.success('View saved');
      setSaveOpen(false); setSaveName('');
      loadSaved();
    } catch (e) { message.error(e?.response?.data?.error || 'Could not save the view'); }
  };
  const overwriteView = async (d) => {
    try { await analyticsService.updateDashboard(d.id, currentView()); message.success(`"${d.name}" updated`); loadSaved(); } catch (e) { message.error('Could not update'); }
  };
  const renameView = (d) => {
    let name = d.name;
    Modal.confirm({
      title: 'Rename view', icon: <EditOutlined />,
      content: <Input defaultValue={d.name} maxLength={200} onChange={(e) => { name = e.target.value; }} />,
      onOk: async () => { await analyticsService.updateDashboard(d.id, { name: name.trim() || d.name }); loadSaved(); },
    });
  };
  const deleteView = async (d) => {
    try { await analyticsService.deleteDashboard(d.id); message.success('View deleted'); loadSaved(); } catch (e) { message.error('Could not delete'); }
  };
  const loadView = (d) => {
    const list = normaliseLayout(d.widgets);
    if (list.length) setWidgets(list);
    const r = d.dateRange || d.date_range || {};
    const pid = d.selectedProject ?? d.project_id;
    setFilters((f) => {
      const start = r.start && dayjs(r.start).isValid() ? dayjs(r.start) : f.range[0];
      const end = r.end && dayjs(r.end).isValid() ? dayjs(r.end) : f.range[1];
      return { ...f, range: [start, end], rangeDays: Math.max(1, end.diff(start, 'day')),
        project: pid && projects.some((p) => String(p.id) === String(pid)) ? pid : 'all',
        department: d.selectedDepartment ?? d.department_id ?? 'all' };
    });
    setSettingsOpen(false);
    message.success(`Loaded "${d.name}"`);
  };

  // ---- export
  const download = (href, name) => {
    const a = document.createElement('a');
    a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  };
  const exportCSV = () => {
    const s = summary || {};
    const lines = [['Safety analytics export'], ['Period', s.period?.start, s.period?.end],
      ['Project', filters.project === 'all' ? 'All projects' : (projects.find((p) => String(p.id) === String(filters.project))?.name || filters.project)], [],
      ['KPI', 'Value']];
    KPI_DEFS.forEach((d) => lines.push([d.label, d.value ? d.value(s.kpis || {}) : s.kpis?.[d.key]]));
    widgets.filter((w) => w.visible && WIDGETS[w.type]?.data).forEach((w) => {
      const def = WIDGETS[w.type];
      const rows = def.data(s) || [];
      if (!rows.length) return;
      const keys = [def.xKey, ...(def.yKeys ? def.yKeys.map((y) => y.key) : [def.yKey])];
      lines.push([], [w.title], keys);
      rows.forEach((r) => lines.push(keys.map((k) => r[k])));
    });
    const csv = `﻿${lines.map((l) => l.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    download(url, `safety_analytics_${dayjs().format('YYYYMMDD_HHmm')}.csv`);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const runExport = async () => {
    setExporting(true);
    try {
      if (exportFormat === 'csv') { exportCSV(); setExportOpen(false); return; }
      const [{ default: html2canvas }, jspdf] = await Promise.all([import('html2canvas'), exportFormat === 'pdf' ? import('jspdf') : Promise.resolve(null)]);
      const el = contentRef.current?.parentElement;
      if (!el) throw new Error('Nothing to export');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: theme.dark ? '#141414' : '#f5f7fa',
        ignoreElements: (n) => n.classList?.contains('pbi-no-export') });
      const stamp = dayjs().format('YYYYMMDD_HHmm');
      if (exportFormat === 'pdf') {
        const JsPDF = jspdf.jsPDF || jspdf.default;
        const pdf = new JsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true });
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const scale = (pw - margin * 2) / canvas.width;
        const sliceH = Math.floor((ph - margin * 2) / scale);
        for (let y = 0, page = 0; y < canvas.height; y += sliceH, page += 1) {
          const part = document.createElement('canvas');
          part.width = canvas.width; part.height = Math.min(sliceH, canvas.height - y);
          part.getContext('2d').drawImage(canvas, 0, y, canvas.width, part.height, 0, 0, canvas.width, part.height);
          if (page) pdf.addPage();
          pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, canvas.width * scale, part.height * scale);
        }
        pdf.save(`safety_analytics_${stamp}.pdf`);
      } else {
        download(canvas.toDataURL(exportFormat === 'jpg' ? 'image/jpeg' : 'image/png', 0.95), `safety_analytics_${stamp}.${exportFormat}`);
      }
      message.success('Export ready');
      setExportOpen(false);
    } catch (e) {
      message.error(`Export failed: ${e.message || 'unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  // ---- derived
  const visible = useMemo(() => widgets.filter((w) => w.visible), [widgets]);
  const hidden = widgets.filter((w) => !w.visible);
  const selectedProject = summary?.project && String(summary.project.id) === String(filters.project) ? summary.project : null;
  const configPreview = useMemo(() => {
    if (!configWidget) return null;
    const def = WIDGETS[configWidget.type];
    return def?.data ? { rows: def.data(summary || {}), xKey: def.xKey, yKey: def.yKey, yKeys: def.yKeys } : null;
  }, [configWidget, summary]);
  const rootClass = ['pbi', `pbi-card-${theme.card}`, `pbi-${theme.density}`, theme.dark ? 'pbi-dark' : '', fullscreen ? 'pbi-fullscreen' : '', editMode ? 'pbi-editing' : ''].join(' ');

  return (
    <div className={rootClass} style={{ '--pbi-accent': theme.accent }}>
      {/* ------------------------------------------------ header */}
      <div className="pbi-header">
        <div className="pbi-header-title">
          <Title level={4} style={{ margin: 0 }}><DashboardOutlined /> Safety analytics</Title>
          <Text type="secondary" className="pbi-updated">
            {loading ? <><Spin size="small" /> Updating…</> : lastUpdated ? `Updated ${dayjs(lastUpdated).format('HH:mm')}` : ''}
            {filters.refresh ? <Badge status="processing" text={`auto every ${filters.refresh} min`} style={{ marginLeft: 8 }} /> : null}
          </Text>
        </div>
        <div className="pbi-filters">
          <RangePicker value={filters.range} presets={RANGE_PRESETS} allowClear={false} format="DD MMM YYYY" disabledDate={(d) => d.isAfter(dayjs(), 'day')}
                       onChange={(v) => v && v[0] && v[1] && setFilters((f) => ({ ...f, range: v, rangeDays: Math.max(1, v[1].diff(v[0], 'day')) }))} />
          <Select value={filters.department} onChange={(v) => setFilters((f) => ({ ...f, department: v }))} className="pbi-select"
                  showSearch optionFilterProp="label" popupMatchSelectWidth={false}
                  options={[{ value: 'all', label: 'All departments' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
          <Select value={filters.project} onChange={(v) => setFilters((f) => ({ ...f, project: v }))} className="pbi-select pbi-select-wide"
                  showSearch optionFilterProp="label" popupMatchSelectWidth={false}
                  options={[{ value: 'all', label: 'All projects (company-wide)' }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
                  dropdownRender={(menu) => (<>{menu}<Divider style={{ margin: '4px 0' }} />
                    <Space style={{ padding: '0 8px 4px' }}>
                      <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => setProjectForm({ open: true, project: null })}>New project</Button>
                      <Button type="link" size="small" icon={<ProjectOutlined />} onClick={() => setProjectsOpen(true)}>Manage</Button>
                    </Space></>)} />
        </div>
        <div className="pbi-actions pbi-no-export">
          <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={loading} />} onClick={refreshAll} /></Tooltip>
          <Button icon={<AppstoreAddOutlined />} onClick={() => setLibraryOpen(true)}>Widgets</Button>
          <Button icon={<DatabaseOutlined />} onClick={() => setRecords({ open: true, kind: null })}>Data</Button>
          <Button icon={<ProjectOutlined />} onClick={() => setProjectsOpen(true)}>Projects</Button>
          <Dropdown trigger={['click']} menu={{ items: [
            { key: 'png', icon: <FileImageOutlined />, label: 'Image (PNG)' }, { key: 'jpg', icon: <FileImageOutlined />, label: 'Image (JPG)' },
            { key: 'pdf', icon: <FilePdfOutlined />, label: 'PDF' }, { key: 'csv', icon: <FileExcelOutlined />, label: 'Data (CSV / Excel)' },
          ], onClick: ({ key }) => { setExportFormat(key); setExportOpen(true); } }}>
            <Button icon={<DownloadOutlined />}>Export</Button>
          </Dropdown>
          <Tooltip title="Save this view"><Button icon={<SaveOutlined />} onClick={() => setSaveOpen(true)} /></Tooltip>
          <Tooltip title="Look & layout"><Button icon={<SettingOutlined />} onClick={() => setSettingsOpen(true)} /></Tooltip>
          <Tooltip title={fullscreen ? 'Exit full screen (Esc)' : 'Full screen'}>
            <Button icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={() => setFullscreen((v) => !v)} />
          </Tooltip>
          <Switch checked={editMode} onChange={setEditMode} checkedChildren="Editing" unCheckedChildren="Edit layout" />
        </div>
      </div>

      {loadError && (
        <Alert type="error" showIcon className="pbi-alert" message="Analytics data could not be loaded" description={loadError}
               action={<Button size="small" onClick={() => loadSummary()}>Try again</Button>} />
      )}
      {(summary?.notes || []).map((n) => <Alert key={n} type="info" showIcon className="pbi-alert pbi-no-export" message={n} closable
                                                 action={/man-hours/.test(n) ? <Button size="small" onClick={() => setEntry('manhours')}>Add man-hours</Button> : null} />)}
      {editMode && (
        <Alert className="pbi-alert pbi-no-export" type="success" showIcon
               message="Layout editing is on: drag cards to reorder, use ✎ to change chart type, colours and width." />
      )}

      {selectedProject && (
        <ProjectBanner project={selectedProject} onEdit={() => setProjectForm({ open: true, project: selectedProject })}
                       onChanged={(p) => { if (p) setSummary((s) => ({ ...s, project: { ...p, can_manage: s?.project?.can_manage } })); loadProjects(); }}
                       onDelete={deleteSelectedProject} />
      )}

      <StatusStrip modules={summary?.modules} projects={projects} onOpen={openLink} onProjects={() => setProjectsOpen(true)} />

      {summary && <SafetyKpiPanel summary={summary} filters={filters} onOpen={openLink} onChanged={() => loadSummary(true)} />}

      {/* ------------------------------------------------ widgets */}
      {!summary && loading ? (
        <div className="pbi-loading"><Spin size="large" /><Text type="secondary">Loading analytics…</Text></div>
      ) : (
        <div className="pbi-grid" ref={contentRef} onDragEnd={() => { setDragId(null); setDragOverId(null); }}>
          {visible.map((w, i) => (
            <WidgetCard key={w.id} widget={w} summary={summary} index={i} count={visible.length} editMode={editMode}
                        dragOver={dragOverId === w.id && dragId !== w.id} onAction={onWidgetAction} onOpen={openLink}
                        onDragStart={onDragStart} onDragOverCard={onDragOverCard} onDrop={onDrop} />
          ))}
          {!visible.length && (
            <Card className="pbi-cell pbi-w-full" style={{ '--cols': 12 }}>
              <Empty description="No widgets on this dashboard">
                <Space><Button type="primary" icon={<PlusOutlined />} onClick={() => setLibraryOpen(true)}>Add widgets</Button>
                  <Button icon={<UndoOutlined />} onClick={() => setWidgets(DEFAULT_LAYOUT.map((t) => makeWidget(t, theme.palette)))}>Use default layout</Button></Space>
              </Empty>
            </Card>
          )}
        </div>
      )}

      {/* ------------------------------------------------ drawers & modals */}
      <Drawer title="Add widgets" open={libraryOpen} onClose={() => setLibraryOpen(false)} width={440}>
        <WidgetLibrary onSelect={addWidget} activeTypes={widgets.map((w) => w.type)} />
      </Drawer>

      <WidgetConfigModal open={!!configWidget} widget={configWidget} preview={configPreview} onCancel={() => setConfigWidget(null)}
                         onApplyToAll={applyPaletteToAll}
                         onSave={(id, patch) => { updateWidget(id, patch); setConfigWidget(null); message.success('Widget updated'); }} />

      <Drawer title="Look & layout" open={settingsOpen} onClose={() => setSettingsOpen(false)} width={400}>
        <div className="pbi-settings">
          <Text strong>Accent colour</Text>
          <Space wrap>
            {['#1677ff', '#2f54eb', '#722ed1', '#13c2c2', '#52c41a', '#fa8c16', '#f5222d', '#262626'].map((c) => (
              <button type="button" key={c} aria-label={`accent ${c}`} className={`pbi-swatch ${theme.accent === c ? 'active' : ''}`} style={{ background: c }}
                      onClick={() => setTheme((t) => ({ ...t, accent: c }))} />
            ))}
            <ColorPicker disabledAlpha value={theme.accent} onChangeComplete={(v) => setTheme((t) => ({ ...t, accent: v.toHexString() }))} />
          </Space>

          <Text strong>Chart colours for every widget</Text>
          <div className="pbi-palettes">
            {Object.entries(PALETTES).map(([name, pal]) => (
              <button type="button" key={name} className={`pbi-palette ${theme.palette === name ? 'active' : ''}`}
                      onClick={() => { setTheme((t) => ({ ...t, palette: name })); applyPaletteToAll(pal, name); }}>
                <span className="pbi-palette-swatches">{pal.slice(0, 6).map((c) => <i key={c} style={{ background: c }} />)}</span>
                <span className="pbi-palette-name">{name.replace(/([A-Z])/g, ' $1')}</span>
              </button>
            ))}
          </div>

          <Text strong>Card style</Text>
          <Segmented block value={theme.card} onChange={(v) => setTheme((t) => ({ ...t, card: v }))}
                     options={[{ value: 'shadow', label: 'Shadow' }, { value: 'bordered', label: 'Outlined' }, { value: 'flat', label: 'Flat' }]} />
          <Text strong>Spacing</Text>
          <Segmented block value={theme.density} onChange={(v) => setTheme((t) => ({ ...t, density: v }))}
                     options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} />
          <Space><Switch checked={theme.dark} onChange={(v) => setTheme((t) => ({ ...t, dark: v }))} /> <Text>Dark dashboard</Text></Space>

          <Text strong>Auto refresh</Text>
          <Select value={filters.refresh} onChange={(v) => setFilters((f) => ({ ...f, refresh: v }))}
                  options={[{ value: 0, label: 'Off' }, { value: 5, label: 'Every 5 minutes' }, { value: 15, label: 'Every 15 minutes' },
                    { value: 30, label: 'Every 30 minutes' }, { value: 60, label: 'Every hour' }]} />

          <Divider style={{ margin: '8px 0' }} />
          <Text strong>Layout</Text>
          {hidden.length > 0 && (
            <List size="small" bordered header={<Text type="secondary">Hidden widgets</Text>} dataSource={hidden}
                  renderItem={(w) => <List.Item actions={[<Button key="s" size="small" type="link" onClick={() => updateWidget(w.id, { visible: true })}>Show</Button>]}>{w.title}</List.Item>} />
          )}
          <Space wrap>
            <Button icon={<UndoOutlined />} onClick={resetLayout}>Reset to default</Button>
            <Button onClick={() => setTheme(DEFAULT_THEME)}>Reset look</Button>
          </Space>

          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Text strong>Saved views</Text>
            <Button size="small" icon={<SaveOutlined />} onClick={() => setSaveOpen(true)}>Save current</Button>
          </Space>
          <List size="small" dataSource={savedDashboards} locale={{ emptyText: 'No saved views yet' }}
                renderItem={(d) => (
                  <List.Item actions={[
                    <Button key="l" size="small" type="link" onClick={() => loadView(d)}>Open</Button>,
                    <Dropdown key="m" trigger={['click']} menu={{ items: [
                      { key: 'o', label: 'Replace with current layout', icon: <SaveOutlined /> }, { key: 'r', label: 'Rename', icon: <EditOutlined /> },
                      { key: 'd', label: 'Delete', danger: true, icon: <DeleteOutlined /> }],
                      onClick: ({ key }) => (key === 'o' ? overwriteView(d) : key === 'r' ? renameView(d)
                        : Modal.confirm({ title: `Delete "${d.name}"?`, okType: 'danger', onOk: () => deleteView(d) })) }}>
                      <Button size="small" type="text" icon={<MoreOutlined />} />
                    </Dropdown>]}>
                    <List.Item.Meta title={d.name} description={d.updated_at ? dayjs(d.updated_at).format('DD MMM YYYY HH:mm') : ''} />
                  </List.Item>
                )} />
        </div>
      </Drawer>

      <Modal title="Save this view" open={saveOpen} onCancel={() => setSaveOpen(false)} onOk={saveView} okText="Save">
        <Text type="secondary">Saves widgets, colours, the date range and filters so you can reopen them from any device.</Text>
        <Input style={{ marginTop: 12 }} autoFocus maxLength={200} placeholder="e.g. Monthly HSE board report" value={saveName}
               onChange={(e) => setSaveName(e.target.value)} onPressEnter={saveView} />
      </Modal>

      <Modal title={<Space><DownloadOutlined /> Export dashboard</Space>} open={exportOpen} onCancel={() => setExportOpen(false)}
             onOk={runExport} okText="Export" confirmLoading={exporting}>
        <Radio.Group value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} optionType="button" buttonStyle="solid"
                     options={[{ value: 'png', label: 'PNG' }, { value: 'jpg', label: 'JPG' }, { value: 'pdf', label: 'PDF' }, { value: 'csv', label: 'CSV data' }]} />
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">
            {exportFormat === 'csv' ? 'KPIs and the numbers behind every visible chart — opens in Excel.' : 'A picture of the dashboard exactly as shown (buttons are left out). Long dashboards are split over several PDF pages.'}
          </Text>
        </div>
        <div className="pbi-export-meta">
          <Tag>{visible.length} widgets</Tag>
          <Tag>{filters.range[0].format('DD MMM YYYY')} – {filters.range[1].format('DD MMM YYYY')}</Tag>
          {filters.project !== 'all' && <Tag color="blue">{projects.find((p) => String(p.id) === String(filters.project))?.name}</Tag>}
        </div>
      </Modal>

      <Modal title={`Add ${ENTRY_LABEL[entry] || ''} data`} open={!!entry} onCancel={() => setEntry(null)} footer={null} destroyOnClose width={560}>
        {filters.project !== 'all' && <Alert type="info" showIcon style={{ marginBottom: 12 }} message={`Will be linked to project "${projects.find((p) => String(p.id) === String(filters.project))?.name || ''}"`} />}
        {entry === 'observations' && <Alert type="info" showIcon style={{ marginBottom: 12 }} message={<span>For full observations with photos, use the <Button type="link" size="small" style={{ padding: 0 }} onClick={() => openLink('/safety/observations')}>observation module</Button>.</span>} />}
        <DataEntryForms type={entry} form={entryForm} onFinish={submitEntry} loading={entrySaving} />
      </Modal>

      <RecordsDrawer open={records.open} kind={records.kind} projectId={filters.project} projects={projects}
                     onClose={() => setRecords({ open: false, kind: null })} onAdd={(t) => setEntry(t)} onChanged={() => loadSummary(true)} />
      <ProjectsDrawer open={projectsOpen} projects={projects} selected={filters.project} onClose={() => setProjectsOpen(false)}
                      onSelect={selectProject} onReload={() => { loadProjects(); loadSummary(true); }}
                      onCreate={() => setProjectForm({ open: true, project: null })} onEdit={(p) => setProjectForm({ open: true, project: p })} />
      <ProjectFormModal open={projectForm.open} project={projectForm.project} departments={departments}
                        onClose={() => setProjectForm({ open: false, project: null })} onSaved={onProjectSaved} />
    </div>
  );
};

export default PowerBIAnalytics;
