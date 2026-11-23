// One place that describes every analytics widget: where its data comes from, how it is charted,
// which manual record type feeds it and which module it links to.
import React from 'react';
import {
  DashboardOutlined, TeamOutlined, ExperimentOutlined, WarningOutlined, FieldTimeOutlined, EyeOutlined,
  AlertOutlined, SafetyOutlined, ClockCircleOutlined, LineChartOutlined, RiseOutlined, ApartmentOutlined,
  PieChartOutlined, TagsOutlined, ProjectOutlined, FileTextOutlined,
} from '@ant-design/icons';

export const PALETTES = {
  default: ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'],
  safety: ['#d4380d', '#fa8c16', '#fadb14', '#52c41a', '#1677ff', '#722ed1', '#8c8c8c', '#13c2c2'],
  ocean: ['#003a8c', '#0958d9', '#1677ff', '#4096ff', '#69b1ff', '#13c2c2', '#36cfc9', '#87e8de'],
  forest: ['#135200', '#237804', '#389e0d', '#52c41a', '#73d13d', '#95de64', '#7cb305', '#d3f261'],
  sunset: ['#a8071a', '#d4380d', '#fa541c', '#fa8c16', '#faad14', '#fadb14', '#eb2f96', '#9e1068'],
  corporate: ['#1d39c4', '#2f54eb', '#597ef7', '#85a5ff', '#434343', '#8c8c8c', '#bfbfbf', '#13c2c2'],
  pastel: ['#91caff', '#b7eb8f', '#ffe58f', '#ffa39e', '#d3adf7', '#ffadd2', '#87e8de', '#ffd591'],
  mono: ['#141414', '#434343', '#595959', '#8c8c8c', '#bfbfbf', '#d9d9d9', '#262626', '#737373'],
  highContrast: ['#0050b3', '#d4380d', '#389e0d', '#531dab', '#ad8b00', '#c41d7f', '#006d75', '#000000'],
};

export const SIZES = [
  { key: 'sm', label: 'One-third', cols: 4 },
  { key: 'md', label: 'Half', cols: 6 },
  { key: 'lg', label: 'Two-thirds', cols: 8 },
  { key: 'full', label: 'Full width', cols: 12 },
];
export const sizeCols = (key) => (SIZES.find((s) => s.key === key) || SIZES[1]).cols;
// old saved layouts used size.w on a 12-col scale (6 / 8 / 12)
export const legacySize = (w) => (w >= 12 ? 'full' : w >= 8 ? 'lg' : w <= 4 ? 'sm' : 'md');

const lastMonths = (rows, n = 24) => (rows || []).slice(-n);
const fromMap = (obj, key = 'name') => Object.entries(obj || {})
  .map(([k, v]) => ({ [key]: String(k).replace(/_/g, ' '), value: v }))
  .sort((a, b) => b.value - a.value);

export const WIDGETS = {
  kpi: { name: 'KPI cards', category: 'Overview', icon: <DashboardOutlined />, color: '#1677ff', size: 'full', special: 'kpi',
    description: 'Headline safety numbers: LTIFR, TRIR, man-hours, training rate and more' },
  project_status: { name: 'Project status', category: 'Overview', icon: <ProjectOutlined />, color: '#2f54eb', size: 'md', special: 'project',
    description: 'Progress, schedule, budget and milestones of the selected project' },
  incident_trend: { name: 'Incident trend', category: 'Incidents', icon: <LineChartOutlined />, color: '#1677ff', size: 'lg',
    description: 'Incidents per month — total, still open and closed', link: '/incidents',
    data: (s) => lastMonths(s.incidentStats?.trend), xKey: 'month',
    yKeys: [{ key: 'count', name: 'Total' }, { key: 'open', name: 'Open' }, { key: 'closed', name: 'Closed' }],
    config: { chartType: 'line' } },
  incident_summary: { name: 'Incident status', category: 'Incidents', icon: <PieChartOutlined />, color: '#fa541c', size: 'sm',
    description: 'Incidents by status (click to open the incident list)', link: '/incidents',
    data: (s) => fromMap(s.incidentStats?.byStatus), xKey: 'name', yKey: 'value', config: { chartType: 'donut' } },
  incident_by_severity: { name: 'Incidents by severity', category: 'Incidents', icon: <WarningOutlined />, color: '#f5222d', size: 'sm',
    description: 'How serious the incidents were', link: '/incidents',
    data: (s) => fromMap(s.incidentStats?.bySeverity), xKey: 'name', yKey: 'value',
    config: { chartType: 'pie', colors: ['#f5222d', '#fa8c16', '#faad14', '#52c41a', '#8c8c8c', '#1677ff'] } },
  incident_by_department: { name: 'Incidents by department', category: 'Incidents', icon: <ApartmentOutlined />, color: '#722ed1', size: 'md',
    description: 'Where incidents happen', link: '/incidents',
    data: (s) => fromMap(s.incidentStats?.byDepartment).slice(0, 15), xKey: 'name', yKey: 'value', config: { chartType: 'bar', horizontal: true } },
  incident_by_type: { name: 'Incidents by type', category: 'Incidents', icon: <TagsOutlined />, color: '#eb2f96', size: 'md',
    description: 'Most common kinds of incident', link: '/incidents',
    data: (s) => fromMap(s.incidentStats?.byType).slice(0, 12), xKey: 'name', yKey: 'value', config: { chartType: 'bar', horizontal: true } },
  severity: { name: 'Severity trend', category: 'Incidents', icon: <RiseOutlined />, color: '#eb2f96', size: 'md',
    description: 'Average severity score per month (1 low – 7 critical)', link: '/incidents',
    data: (s) => lastMonths(s.series?.severity), xKey: 'year', yKey: 'value', config: { chartType: 'line', targetLine: 3 } },
  lti: { name: 'Lost-time injuries', category: 'Safety', icon: <WarningOutlined />, color: '#f5222d', size: 'md', record: 'lti',
    description: 'LTI records per year (or high/critical incidents per month when none are entered)',
    data: (s) => s.series?.lti, xKey: 'year', yKey: 'value', config: { chartType: 'bar' } },
  ltifr: { name: 'LTIFR trend', category: 'Safety', icon: <LineChartOutlined />, color: '#1677ff', size: 'md',
    description: 'Lost-time injury frequency rate per 1,000,000 hours, by month (needs man-hours)',
    data: (s) => s.series?.ltifr, xKey: 'year', yKey: 'value', config: { chartType: 'line', targetLine: 1 } },
  accidents: { name: 'Accident rate', category: 'Safety', icon: <AlertOutlined />, color: '#fa8c16', size: 'md', record: 'accidents',
    description: 'Accidents per 10,000 man-hours',
    data: (s) => s.series?.accidents, xKey: 'year', yKey: 'per_10k_hours', config: { chartType: 'area' } },
  injuries: { name: 'Injuries by body part', category: 'Safety', icon: <SafetyOutlined />, color: '#faad14', size: 'md', record: 'injuries',
    description: 'Which body parts get hurt most',
    data: (s) => s.series?.injuries, xKey: 'body_part', yKey: 'count', config: { chartType: 'bar', horizontal: true } },
  observations: { name: 'Safety observations', category: 'Safety', icon: <EyeOutlined />, color: '#52c41a', size: 'md', link: '/safety/observations',
    description: 'Observations from the observation module, by type',
    data: (s) => s.series?.observations, xKey: 'type', yKey: 'count', config: { chartType: 'pie' } },
  manpower: { name: 'Manpower', category: 'Workforce', icon: <TeamOutlined />, color: '#13c2c2', size: 'md', record: 'manpower',
    description: 'Current head-count per section (latest entry per section)',
    data: (s) => s.series?.manpower, xKey: 'section', yKey: 'count', config: { chartType: 'bar' } },
  manhours: { name: 'Man-hours', category: 'Workforce', icon: <FieldTimeOutlined />, color: '#13c2c2', size: 'md', record: 'man-hours',
    description: 'Hours worked per section in the period',
    data: (s) => s.series?.manhours, xKey: 'section', yKey: 'hours', config: { chartType: 'bar' } },
  training: { name: 'Training completions', category: 'Workforce', icon: <ExperimentOutlined />, color: '#722ed1', size: 'md', entry: 'training',
    description: 'Completed training records by course',
    data: (s) => s.series?.training, xKey: 'type', yKey: 'count', config: { chartType: 'bar', horizontal: true } },
  overdue: { name: 'Report submissions', category: 'Compliance', icon: <ClockCircleOutlined />, color: '#f5222d', size: 'md', record: 'overdue-reports',
    description: 'Reports submitted on time vs late, per month',
    data: (s) => s.series?.overdue, xKey: 'month',
    yKeys: [{ key: 'on_time', name: 'On time' }, { key: 'late', name: 'Late' }],
    config: { chartType: 'bar', stacked: true, colors: ['#52c41a', '#f5222d'] } },
};

export const RECORD_LABELS = {
  manpower: 'Manpower', 'man-hours': 'Man-hours', lti: 'Lost-time injuries', accidents: 'Accidents',
  injuries: 'Injuries', 'overdue-reports': 'Report submissions',
};
// DataEntryForms uses short type names
export const RECORD_TO_FORM = { manpower: 'manpower', 'man-hours': 'manhours', lti: 'lti', accidents: 'accidents',
  injuries: 'injuries', 'overdue-reports': 'overdue', training: 'training', observations: 'observations' };

export const DEFAULT_LAYOUT = ['kpi', 'incident_trend', 'incident_summary', 'incident_by_severity', 'observations',
  'manhours', 'training', 'overdue'];

export const WIDGET_ICON_DOC = <FileTextOutlined />;
