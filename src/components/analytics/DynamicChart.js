import React, { memo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
  Tooltip as RechartsTooltip, ReferenceLine, LabelList,
} from 'recharts';

export const DEFAULT_COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
export const CHART_TYPES = ['bar', 'line', 'area', 'pie', 'donut', 'radar'];
export const CHART_HEIGHTS = { compact: 200, normal: 260, tall: 360 };

const num = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v));

// Short axis labels so long department / training names don't squash the plot
const shortLabel = (v) => {
  const s = String(v ?? '');
  return s.length > 14 ? `${s.slice(0, 13)}…` : s;
};

const fmt = (v) => (typeof v === 'number' ? (Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 2 })) : v);

/**
 * Renders one widget chart from a plain config object.
 *  data      rows
 *  xKey      category key
 *  yKey      value key  (or yKeys: [{key, name}] for several series)
 */
export const DynamicChart = memo(({ data, config = {}, xKey, yKey, yKeys, height, emptyText = 'No data for this period' }) => {
  const rows = Array.isArray(data) ? data.filter((r) => r && typeof r === 'object') : [];
  const h = height || CHART_HEIGHTS[config.height] || CHART_HEIGHTS.normal;
  if (!rows.length) {
    return <div className="pbi-chart-empty" style={{ height: h }}>{emptyText}</div>;
  }

  const palette = (Array.isArray(config.colors) && config.colors.length ? config.colors : DEFAULT_COLORS)
    .slice(0, Math.max(1, config.colorCount || 12));
  const color = (i) => palette[i % palette.length];
  const series = (yKeys && yKeys.length ? yKeys : [{ key: yKey, name: config.seriesName || yKey }])
    .map((s) => (typeof s === 'string' ? { key: s, name: s } : s));
  const multi = series.length > 1;

  let type = config.chartType || 'bar';
  if (type === 'pie' && config.chartVariant === 'donut') type = 'donut';
  if (!CHART_TYPES.includes(type)) type = 'bar';
  if (multi && (type === 'pie' || type === 'donut')) type = 'bar';

  const showLegend = config.showLegend !== false && (multi || type === 'pie' || type === 'donut');
  const showGrid = config.showGrid !== false;
  const showTooltip = config.showTooltip !== false;
  const showLabels = !!config.showLabels;
  const animate = config.showAnimation !== false;
  const horizontal = !!config.horizontal && type === 'bar';
  const stacked = !!config.stacked && multi;
  const opacity = num(config.opacity) ?? 0.35;
  const lineWidth = num(config.lineWidth) ?? 2;
  const radius = num(config.borderRadius) ?? 4;
  const curve = config.smooth === false || config.chartVariant === 'linear' ? 'linear'
    : config.chartVariant === 'step' ? 'step' : 'monotone';
  const yMin = num(config.yAxisMin ?? config.yAxis?.min);
  const yMax = num(config.yAxisMax ?? config.yAxis?.max);
  const domain = [yMin ?? 0, yMax ?? 'auto'];
  const target = num(config.targetLine);
  const targetColor = config.targetColor || '#f5222d';
  const dash = config.gridDash === '0' ? undefined : (config.gridDash || '3 3');
  const perBarColors = !multi && config.colorByCategory !== false;
  const barSize = Math.round(12 + (num(config.barWidth) ?? 0.6) * 40);

  const tooltip = showTooltip && <RechartsTooltip formatter={(v, n) => [fmt(v), n]} />;
  const legend = showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />;
  const grid = showGrid && <CartesianGrid strokeDasharray={dash} vertical={horizontal} horizontal={!horizontal} />;
  const ref = target !== undefined && (
    horizontal
      ? <ReferenceLine x={target} stroke={targetColor} strokeDasharray="4 4" label={{ value: `Target ${target}`, fontSize: 11, fill: targetColor, position: 'top' }} />
      : <ReferenceLine y={target} stroke={targetColor} strokeDasharray="4 4" label={{ value: `Target ${target}`, fontSize: 11, fill: targetColor, position: 'insideTopRight' }} />
  );
  const catAxis = { dataKey: xKey, tick: { fontSize: 11 }, tickFormatter: shortLabel, interval: 'preserveStartEnd' };
  const valAxis = { tick: { fontSize: 11 }, domain, allowDecimals: true, tickFormatter: fmt, width: 48 };
  const margin = { top: 12, right: 16, left: 0, bottom: 4 };

  let chart;
  if (type === 'pie' || type === 'donut') {
    const s = series[0];
    chart = (
      <PieChart>
        <Pie data={rows} dataKey={s.key} nameKey={xKey} cx="50%" cy="50%" outerRadius="78%"
             innerRadius={type === 'donut' ? '50%' : 0} paddingAngle={type === 'donut' ? 2 : 0}
             isAnimationActive={animate} label={showLabels ? ({ value }) => fmt(value) : false} labelLine={showLabels}>
          {rows.map((_, i) => <Cell key={i} fill={color(i)} />)}
        </Pie>
        {tooltip}
        {legend}
      </PieChart>
    );
  } else if (type === 'radar') {
    chart = (
      <RadarChart data={rows} outerRadius="72%">
        <PolarGrid />
        <PolarAngleAxis dataKey={xKey} tick={{ fontSize: 11 }} tickFormatter={shortLabel} />
        <PolarRadiusAxis tick={{ fontSize: 10 }} />
        {series.map((s, i) => (
          <Radar key={s.key} name={s.name} dataKey={s.key} stroke={color(i)} fill={color(i)} fillOpacity={opacity} isAnimationActive={animate} />
        ))}
        {tooltip}
        {legend}
      </RadarChart>
    );
  } else if (type === 'line') {
    chart = (
      <LineChart data={rows} margin={margin}>
        {grid}
        <XAxis {...catAxis} />
        <YAxis {...valAxis} />
        {tooltip}
        {legend}
        {series.map((s, i) => (
          <Line key={s.key} type={curve} dataKey={s.key} name={s.name} stroke={color(i)} strokeWidth={lineWidth}
                dot={config.showDataPoint !== false ? { r: 3 } : false} isAnimationActive={animate} connectNulls>
            {showLabels && <LabelList dataKey={s.key} position="top" fontSize={10} formatter={fmt} />}
          </Line>
        ))}
        {ref}
      </LineChart>
    );
  } else if (type === 'area') {
    chart = (
      <AreaChart data={rows} margin={margin}>
        {grid}
        <XAxis {...catAxis} />
        <YAxis {...valAxis} />
        {tooltip}
        {legend}
        {series.map((s, i) => (
          <Area key={s.key} type={curve} dataKey={s.key} name={s.name} stroke={color(i)} fill={color(i)} fillOpacity={opacity}
                strokeWidth={lineWidth} stackId={stacked ? 'a' : undefined} isAnimationActive={animate} connectNulls>
            {showLabels && <LabelList dataKey={s.key} position="top" fontSize={10} formatter={fmt} />}
          </Area>
        ))}
        {ref}
      </AreaChart>
    );
  } else {
    chart = (
      <BarChart data={rows} layout={horizontal ? 'vertical' : 'horizontal'} margin={margin}>
        {grid}
        {horizontal
          ? <><XAxis type="number" {...valAxis} /><YAxis type="category" {...catAxis} width={96} interval={0} /></>
          : <><XAxis {...catAxis} /><YAxis {...valAxis} /></>}
        {tooltip}
        {legend}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={color(i)} maxBarSize={barSize} stackId={stacked ? 'a' : undefined}
               radius={horizontal ? [0, radius, radius, 0] : [radius, radius, 0, 0]} isAnimationActive={animate}>
            {perBarColors && rows.map((_, j) => <Cell key={j} fill={color(j)} />)}
            {showLabels && <LabelList dataKey={s.key} position={horizontal ? 'right' : 'top'} fontSize={10} formatter={fmt} />}
          </Bar>
        ))}
        {ref}
      </BarChart>
    );
  }

  return (
    <div className="pbi-chart" style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>
    </div>
  );
});

export default DynamicChart;
