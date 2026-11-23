import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, Tabs, Input, InputNumber, Switch, Slider, ColorPicker, Button, Space, Typography, Segmented, Tooltip, Row, Col, Select, Checkbox,
} from 'antd';
import {
  BarChartOutlined, LineChartOutlined, AreaChartOutlined, PieChartOutlined, RadarChartOutlined, BgColorsOutlined,
  EyeOutlined, ControlOutlined, DeleteOutlined, PlusOutlined, UndoOutlined, SwapOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { DynamicChart } from './DynamicChart';
import { PALETTES, SIZES, WIDGETS } from './widgetCatalog';

const { Text } = Typography;

const TYPE_OPTIONS = [
  { value: 'bar', label: 'Bar', icon: <BarChartOutlined /> },
  { value: 'line', label: 'Line', icon: <LineChartOutlined /> },
  { value: 'area', label: 'Area', icon: <AreaChartOutlined /> },
  { value: 'pie', label: 'Pie', icon: <PieChartOutlined /> },
  { value: 'donut', label: 'Donut', icon: <PieChartOutlined /> },
  { value: 'radar', label: 'Radar', icon: <RadarChartOutlined /> },
];
const PRESET_SWATCHES = [{ label: 'Palette colours', colors: [...new Set(Object.values(PALETTES).flat())] }];
const HEX = /^#[0-9a-f]{6}$/i;

const Row2 = ({ label, hint, children }) => (
  <div className="pbi-cfg-row">
    <div><Text>{label}</Text>{hint && <div><Text type="secondary" style={{ fontSize: 12 }}>{hint}</Text></div>}</div>
    <div className="pbi-cfg-ctrl">{children}</div>
  </div>
);

/**
 * Live-preview widget editor. Every change shows instantly in the preview; nothing is saved until "Apply".
 */
const WidgetConfigModal = ({ open, widget, preview, onSave, onCancel, onApplyToAll }) => {
  const [draft, setDraft] = useState({});
  const [title, setTitle] = useState('');
  const [size, setSize] = useState('md');
  const [allToo, setAllToo] = useState(false);
  const def = widget ? WIDGETS[widget.type] : null;

  useEffect(() => {
    if (!widget) return;
    const c = { ...(def?.config || {}), ...(widget.config || {}) };
    if (c.chartType === 'pie' && c.chartVariant === 'donut') c.chartType = 'donut';
    if (c.yAxis && c.yAxisMin === undefined) { c.yAxisMin = c.yAxis.min; c.yAxisMax = c.yAxis.max; }
    if (!Array.isArray(c.colors) || !c.colors.length) c.colors = [...PALETTES.default];
    setDraft(c);
    setTitle(widget.title || def?.name || '');
    setSize(widget.sizeKey || 'md');
    setAllToo(false);
  }, [widget, def]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const colors = draft.colors || PALETTES.default;
  const setColor = (i, hex) => set({ colors: colors.map((c, j) => (j === i ? hex : c)), colorScheme: 'custom' });
  const multi = !!preview?.yKeys && preview.yKeys.length > 1;
  const cartesian = ['bar', 'line', 'area'].includes(draft.chartType || 'bar');

  const previewChart = useMemo(() => (
    <DynamicChart data={preview?.rows} xKey={preview?.xKey} yKey={preview?.yKey} yKeys={preview?.yKeys}
                  config={{ ...draft, showAnimation: false }} height={230} emptyText="No data in this period — the preview fills in once data exists" />
  ), [draft, preview]);

  if (!widget) return null;
  const special = def?.special;

  const tabs = [
    {
      key: 'type', label: <span><BarChartOutlined /> Chart</span>,
      children: special ? <Text type="secondary">This widget has a fixed layout — you can rename and resize it.</Text> : (
        <>
          <Row2 label="Chart type">
            <Segmented size="small" value={draft.chartType || 'bar'} onChange={(v) => set({ chartType: v, chartVariant: undefined })}
                       options={TYPE_OPTIONS.map((t) => ({ value: t.value, label: <Tooltip title={t.label}><span>{t.icon} <span className="pbi-hide-xs">{t.label}</span></span></Tooltip> }))} />
          </Row2>
          {draft.chartType === 'bar' && (
            <Row2 label="Horizontal bars" hint="Better for long names"><Switch size="small" checked={!!draft.horizontal} onChange={(v) => set({ horizontal: v })} /></Row2>
          )}
          {multi && cartesian && draft.chartType !== 'line' && (
            <Row2 label="Stack series"><Switch size="small" checked={!!draft.stacked} onChange={(v) => set({ stacked: v })} /></Row2>
          )}
          {['line', 'area'].includes(draft.chartType) && (
            <Row2 label="Curve">
              <Segmented size="small" value={draft.chartVariant === 'step' ? 'step' : draft.smooth === false ? 'linear' : 'smooth'}
                         onChange={(v) => set({ smooth: v === 'smooth', chartVariant: v === 'step' ? 'step' : undefined })}
                         options={[{ value: 'smooth', label: 'Smooth' }, { value: 'linear', label: 'Straight' }, { value: 'step', label: 'Step' }]} />
            </Row2>
          )}
          {draft.chartType === 'bar' && (
            <>
              <Row2 label="Bar thickness"><Slider min={0.1} max={1} step={0.1} value={draft.barWidth ?? 0.6} onChange={(v) => set({ barWidth: v })} /></Row2>
              <Row2 label="Rounded corners"><Slider min={0} max={16} value={draft.borderRadius ?? 4} onChange={(v) => set({ borderRadius: v })} /></Row2>
            </>
          )}
          {['line', 'area', 'radar'].includes(draft.chartType) && (
            <Row2 label="Line width"><Slider min={1} max={6} step={0.5} value={draft.lineWidth ?? 2} onChange={(v) => set({ lineWidth: v })} /></Row2>
          )}
          {['area', 'radar'].includes(draft.chartType) && (
            <Row2 label="Fill opacity"><Slider min={0.05} max={1} step={0.05} value={draft.opacity ?? 0.35} onChange={(v) => set({ opacity: v })} /></Row2>
          )}
        </>
      ),
    },
    {
      key: 'colors', label: <span><BgColorsOutlined /> Colours</span>, disabled: !!special,
      children: (
        <>
          <Text type="secondary" style={{ fontSize: 12 }}>Pick a palette, then fine-tune any colour.</Text>
          <div className="pbi-palettes">
            {Object.entries(PALETTES).map(([name, pal]) => (
              <button type="button" key={name} className={`pbi-palette ${draft.colorScheme === name ? 'active' : ''}`}
                      onClick={() => set({ colors: [...pal], colorScheme: name })} aria-label={`${name} palette`}>
                <span className="pbi-palette-swatches">{pal.slice(0, 6).map((c) => <i key={c} style={{ background: c }} />)}</span>
                <span className="pbi-palette-name">{name.replace(/([A-Z])/g, ' $1')}</span>
              </button>
            ))}
          </div>
          <div className="pbi-colors">
            {colors.map((c, i) => (
              <div key={i} className="pbi-color">
                <ColorPicker value={c} presets={PRESET_SWATCHES} disabledAlpha size="small"
                             onChangeComplete={(v) => setColor(i, v.toHexString())} />
                <Input size="small" value={c} maxLength={7} style={{ width: 82 }}
                       onChange={(e) => { const v = e.target.value.trim(); if (HEX.test(v)) setColor(i, v); }} />
                <Tooltip title="Remove colour">
                  <Button size="small" type="text" icon={<DeleteOutlined />} disabled={colors.length <= 1}
                          onClick={() => set({ colors: colors.filter((_, j) => j !== i), colorScheme: 'custom' })} />
                </Tooltip>
              </div>
            ))}
          </div>
          <Space wrap style={{ marginTop: 8 }}>
            <Button size="small" icon={<PlusOutlined />} disabled={colors.length >= 12}
                    onClick={() => set({ colors: [...colors, PALETTES.default[colors.length % 8]], colorScheme: 'custom' })}>Add colour</Button>
            <Button size="small" icon={<SwapOutlined />} onClick={() => set({ colors: [...colors].reverse(), colorScheme: 'custom' })}>Reverse</Button>
            <Button size="small" icon={<UndoOutlined />} onClick={() => set({ colors: [...(def?.config?.colors || PALETTES.default)], colorScheme: undefined })}>Reset</Button>
          </Space>
          {!multi && draft.chartType === 'bar' && (
            <Row2 label="One colour per bar" hint="Off = every bar uses the first colour">
              <Switch size="small" checked={draft.colorByCategory !== false} onChange={(v) => set({ colorByCategory: v })} />
            </Row2>
          )}
        </>
      ),
    },
    {
      key: 'display', label: <span><EyeOutlined /> Display</span>, disabled: !!special,
      children: (
        <>
          <Row gutter={[12, 4]}>
            {[['showLegend', 'Legend'], ['showTooltip', 'Tooltip'], ['showGrid', 'Grid lines'], ['showLabels', 'Value labels', false],
              ['showDataPoint', 'Data points'], ['showAnimation', 'Animation']].map(([k, label, def0 = true]) => (
              <Col xs={12} key={k}>
                <Checkbox checked={draft[k] === undefined ? def0 : !!draft[k]} onChange={(e) => set({ [k]: e.target.checked })}>{label}</Checkbox>
              </Col>
            ))}
          </Row>
          {cartesian && (
            <>
              <Row2 label="Grid style">
                <Select size="small" style={{ width: 130 }} value={draft.gridDash || '3 3'} onChange={(v) => set({ gridDash: v })}
                        options={[{ value: '3 3', label: 'Dashed' }, { value: '0', label: 'Solid' }, { value: '1 4', label: 'Dotted' }]} />
              </Row2>
              <Row2 label="Value axis range" hint="Leave empty for automatic">
                <Space.Compact>
                  <InputNumber size="small" placeholder="min" value={draft.yAxisMin} onChange={(v) => set({ yAxisMin: v ?? undefined })} style={{ width: 80 }} />
                  <InputNumber size="small" placeholder="max" value={draft.yAxisMax} onChange={(v) => set({ yAxisMax: v ?? undefined })} style={{ width: 80 }} />
                </Space.Compact>
              </Row2>
              <Row2 label="Target line" hint="Draws a reference line, e.g. your LTIFR goal">
                <Space>
                  <InputNumber size="small" placeholder="none" value={draft.targetLine} onChange={(v) => set({ targetLine: v ?? undefined })} style={{ width: 90 }} />
                  <ColorPicker size="small" disabledAlpha value={draft.targetColor || '#f5222d'} onChangeComplete={(v) => set({ targetColor: v.toHexString() })} />
                </Space>
              </Row2>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <Modal open={open} onCancel={onCancel} width={860} destroyOnClose
           title={<Space><ControlOutlined /> Customise widget</Space>}
           styles={{ body: { maxHeight: '72vh', overflowY: 'auto' } }}
           footer={[
             !special && onApplyToAll && (
               <Checkbox key="all" checked={allToo} onChange={(e) => setAllToo(e.target.checked)} style={{ float: 'left', marginTop: 5 }}>
                 Use these colours on every widget
               </Checkbox>
             ),
             <Button key="c" onClick={onCancel}>Cancel</Button>,
             <Button key="ok" type="primary" icon={<ThunderboltOutlined />}
                     onClick={() => {
                       const cfg = { ...draft };
                       if (cfg.chartType === 'donut') { cfg.chartType = 'pie'; cfg.chartVariant = 'donut'; } else if (cfg.chartType === 'pie') cfg.chartVariant = 'pie';
                       onSave(widget.id, { title: (title || '').trim().slice(0, 80) || def?.name, sizeKey: size, config: cfg });
                       if (allToo && onApplyToAll) onApplyToAll(cfg.colors, cfg.colorScheme);
                     }}>Apply</Button>,
           ]}>
      <div className="pbi-cfg">
        <div className="pbi-cfg-form">
          <Row2 label="Title"><Input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder={def?.name} /></Row2>
          <Row2 label="Width">
            <Segmented size="small" value={size} onChange={setSize} options={SIZES.map((s) => ({ value: s.key, label: s.label }))} />
          </Row2>
          {!special && (
            <Row2 label="Height">
              <Segmented size="small" value={draft.height || 'normal'} onChange={(v) => set({ height: v })}
                         options={[{ value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' }, { value: 'tall', label: 'Tall' }]} />
            </Row2>
          )}
          <Tabs size="small" items={tabs} />
        </div>
        {!special && (
          <div className="pbi-cfg-preview">
            <Text type="secondary" style={{ fontSize: 12 }}>Live preview</Text>
            <div className="pbi-cfg-preview-box" style={{ borderTop: `3px solid ${colors[0]}` }}>
              <Text strong>{title || def?.name}</Text>
              {previewChart}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WidgetConfigModal;
