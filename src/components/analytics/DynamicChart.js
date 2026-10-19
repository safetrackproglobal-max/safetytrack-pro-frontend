import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  ComposedChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Legend, Tooltip as RechartsTooltip, ReferenceLine
} from 'recharts';

export const DynamicChart = ({ data, config, xKey, yKey, nameKey }) => {
  if (!data || data.length === 0) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Data</div>;

  const chartType = config?.chartType || 'bar';
  const colors = config?.colors || ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'];
  const showLegend = config?.showLegend !== false;
  const showGrid = config?.showGrid !== false;
  const showTooltip = config?.showTooltip !== false;
  const opacity = config?.opacity || 0.3;
  const lineWidth = config?.lineWidth || 2;
  const barWidth = config?.barWidth || 0.8;
  const isHorizontal = config?.horizontal || false;

  // Custom Color Cells for Bars/Pies
  const renderCells = () => data.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
  ));

  const commonProps = { data };
  const axisProps = isHorizontal 
    ? { type: "number", ...(config?.yAxisMin !== undefined && { domain: [config?.yAxisMin, config?.yAxisMax] }) }
    : { type: "category", dataKey: xKey };

  const numericalAxisProps = isHorizontal
    ? { type: "category", dataKey: xKey }
    : { type: "number", ...(config?.yAxisMin !== undefined && { domain: [config?.yAxisMin, config?.yAxisMax] }) };

  switch (chartType) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart {...commonProps} layout={isHorizontal ? "vertical" : "horizontal"}>
            {showGrid && <CartesianGrid strokeDasharray={config?.gridDash || "3 3"} />}
            <XAxis {...axisProps} />
            <YAxis {...numericalAxisProps} />
            {showTooltip && <RechartsTooltip />}
            {showLegend && <Legend />}
            <Line 
              type={config?.chartVariant === 'smooth' ? 'monotone' : 'linear'} 
              dataKey={yKey} 
              stroke={colors[0]} 
              strokeWidth={lineWidth} 
              dot={config?.showDataPoint !== false}
            />
            {config?.targetLine && <ReferenceLine y={config?.targetLine} stroke="red" strokeDasharray="3 3" />}
          </LineChart>
        </ResponsiveContainer>
      );
      
    case 'area':
      return (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart {...commonProps} layout={isHorizontal ? "vertical" : "horizontal"}>
            {showGrid && <CartesianGrid strokeDasharray={config?.gridDash || "3 3"} />}
            <XAxis {...axisProps} />
            <YAxis {...numericalAxisProps} />
            {showTooltip && <RechartsTooltip />}
            {showLegend && <Legend />}
            <Area 
              type={config?.chartVariant === 'smooth' ? 'monotone' : 'linear'} 
              dataKey={yKey} 
              stroke={colors[0]} 
              fill={colors[0]} 
              fillOpacity={opacity} 
            />
          </AreaChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie 
              data={commonProps.data} 
              dataKey={yKey} 
              nameKey={xKey} 
              cx="50%" cy="50%" 
              outerRadius={config?.chartVariant === 'rose' ? 90 : 70} 
              innerRadius={config?.chartVariant === 'donut' ? 40 : 0}
              label={config?.showLabels !== false}
            >
              {renderCells()}
            </Pie>
            {showTooltip && <RechartsTooltip />}
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );

    case 'bar':
    default:
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart {...commonProps} layout={isHorizontal ? "vertical" : "horizontal"}>
            {showGrid && <CartesianGrid strokeDasharray={config?.gridDash || "3 3"} />}
            <XAxis {...axisProps} />
            <YAxis {...numericalAxisProps} />
            {showTooltip && <RechartsTooltip />}
            {showLegend && <Legend />}
            <Bar 
              dataKey={yKey} 
              barSize={config?.barWidth ? config.barWidth * 100 : 40} 
              radius={[config?.borderRadius || 0, config?.borderRadius || 0, 0, 0]}
            >
              {renderCells()}
            </Bar>
            {config?.targetLine && <ReferenceLine y={config?.targetLine} stroke="red" strokeDasharray="3 3" />}
          </BarChart>
        </ResponsiveContainer>
      );
  }
};
