import React, { useEffect, useState } from 'react';
import { 
  Modal, Form, Select, Switch, InputNumber, Tabs, Radio, Space, 
  Slider, ColorPicker, Divider, Row, Col, Button, Tooltip, 
  Collapse, Alert, Badge, Tag, Input, Typography, message
} from 'antd';
import { 
  ChromeOutlined, BgColorsOutlined, LineChartOutlined, 
  BarChartOutlined, PieChartOutlined, AreaChartOutlined,
  DotChartOutlined, RadarChartOutlined, RadiusSettingOutlined,
  EyeOutlined, EyeInvisibleOutlined, PlusOutlined, 
  DeleteOutlined, CopyOutlined, UndoOutlined, ReloadOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// ==================== COLOR SCHEME PRESETS ====================
const COLOR_SCHEMES = {
  default: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'],
  pastel: ['#bae7ff', '#d9f7be', '#fff1b8', '#ffccc7', '#efdbff', '#f9f0ff'],
  vibrant: ['#0050b3', '#237804', '#ad6800', '#a8071a', '#22075e', '#531dab'],
  monochrome: ['#1f1f1f', '#434343', '#595959', '#8c8c8c', '#bfbfbf', '#d9d9d9'],
  warm: ['#ff4d4f', '#fa8c16', '#fadb14', '#ff9c6e', '#ff7a45', '#ffa39e'],
  cool: ['#1890ff', '#13c2c2', '#2f54eb', '#69c0ff', '#85a5ff', '#adc6ff'],
  corporate: ['#003366', '#336699', '#6699cc', '#99ccff', '#cce6ff', '#e6f2ff'],
  rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082'],
  forest: ['#237804', '#389e0d', '#52c41a', '#73d13d', '#95de64', '#b7eb8f'],
  ocean: ['#003366', '#006699', '#0099cc', '#33ccff', '#66e0ff', '#99f0ff']
};

// ==================== CHART TYPES CONFIG ====================
const CHART_TYPES = {
  bar: { 
    label: 'Bar Chart', 
    icon: <BarChartOutlined />,
    variants: ['vertical', 'horizontal', 'stacked', 'grouped']
  },
  line: { 
    label: 'Line Chart', 
    icon: <LineChartOutlined />,
    variants: ['smooth', 'step', 'linear', 'dashed']
  },
  area: { 
    label: 'Area Chart', 
    icon: <AreaChartOutlined />,
    variants: ['stacked', 'overlapping', 'separate']
  },
  pie: { 
    label: 'Pie Chart', 
    icon: <PieChartOutlined />,
    variants: ['pie', 'donut', 'rose', 'nested']
  },
  composed: { 
    label: 'Composed Chart', 
    icon: <RadarChartOutlined />,
    variants: ['bar+line', 'bar+area', 'line+area']
  },
  scatter: { 
    label: 'Scatter Plot', 
    icon: <DotChartOutlined />,
    variants: ['scatter', 'bubble']
  },
  radar: { 
    label: 'Radar Chart', 
    icon: <RadarChartOutlined />,
    variants: ['standard', 'stacked']
  },
  funnel: { 
    label: 'Funnel Chart', 
    icon: <LineChartOutlined />,
    variants: ['standard', 'pyramid']
  }
};

// ==================== COMPONENT ====================
const EnhancedWidgetConfigModal = ({ visible, widget, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [selectedScheme, setSelectedScheme] = useState('default');
  const [customColors, setCustomColors] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    if (widget && widget.config) {
      const config = widget.config;
      const colors = config.colors || COLOR_SCHEMES.default;
      setCustomColors(colors);
      setSelectedScheme(config.colorScheme || 'default');
      
      form.setFieldsValue({
        chartType: config.chartType || 'bar',
        chartVariant: config.chartVariant || 'vertical',
        showLegend: config.showLegend !== false,
        showGrid: config.showGrid !== false,
        showTooltip: config.showTooltip !== false,
        showLabels: config.showLabels !== false,
        showAnimation: config.showAnimation !== false,
        refreshInterval: config.refreshInterval || 0,
        yAxisMin: config.yAxis?.min,
        yAxisMax: config.yAxis?.max,
        targetLine: config.targetLine,
        colorScheme: config.colorScheme || 'default',
        colorCount: config.colorCount || 6,
        horizontal: config.horizontal || false,
        stacked: config.stacked || false,
        opacity: config.opacity || 0.3,
        borderRadius: config.borderRadius || 0,
        barWidth: config.barWidth || 0.8,
        lineWidth: config.lineWidth || 2,
        labelPosition: config.labelPosition || 'top',
        showDataPoint: config.showDataPoint !== false,
        gridDash: config.gridDash || '3 3'
      });
    }
  }, [widget, form]);

  const handleColorSchemeChange = (scheme) => {
    setSelectedScheme(scheme);
    const colors = COLOR_SCHEMES[scheme] || COLOR_SCHEMES.default;
    setCustomColors([...colors]);
    form.setFieldsValue({ colorScheme: scheme });
  };

  const handleColorChange = (index, color) => {
    const newColors = [...customColors];
    newColors[index] = color.toHexString();
    setCustomColors(newColors);
    form.setFieldsValue({ colors: newColors });
  };

  const addColor = () => {
    setCustomColors([...customColors, '#1890ff']);
  };

  const removeColor = (index) => {
    if (customColors.length > 1) {
      const newColors = customColors.filter((_, i) => i !== index);
      setCustomColors(newColors);
    }
  };

  const resetColors = () => {
    const colors = COLOR_SCHEMES[selectedScheme] || COLOR_SCHEMES.default;
    setCustomColors([...colors]);
    form.setFieldsValue({ colors: colors });
  };

  const getChartTypeOptions = () => {
    return Object.entries(CHART_TYPES).map(([key, value]) => (
      <Option key={key} value={key}>
        {value.icon} {value.label}
      </Option>
    ));
  };

  const getVariantOptions = () => {
    const chartType = form.getFieldValue('chartType') || 'bar';
    const variants = CHART_TYPES[chartType]?.variants || ['default'];
    return variants.map(v => (
      <Option key={v} value={v}>
        {v.charAt(0).toUpperCase() + v.slice(1).replace('_', ' ')}
      </Option>
    ));
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const config = {
        chartType: values.chartType,
        chartVariant: values.chartVariant || 'default',
        showLegend: values.showLegend,
        showGrid: values.showGrid,
        showTooltip: values.showTooltip !== false,
        showLabels: values.showLabels !== false,
        showAnimation: values.showAnimation !== false,
        refreshInterval: values.refreshInterval,
        yAxis: { min: values.yAxisMin, max: values.yAxisMax },
        targetLine: values.targetLine,
        colorScheme: values.colorScheme,
        colorCount: values.colorCount || 6,
        colors: customColors.length > 0 ? customColors : COLOR_SCHEMES[values.colorScheme] || COLOR_SCHEMES.default,
        horizontal: values.horizontal || false,
        stacked: values.stacked || false,
        opacity: values.opacity || 0.3,
        borderRadius: values.borderRadius || 0,
        barWidth: values.barWidth || 0.8,
        lineWidth: values.lineWidth || 2,
        labelPosition: values.labelPosition || 'top',
        showDataPoint: values.showDataPoint !== false,
        gridDash: values.gridDash || '3 3'
      };
      onSave(widget.id, config);
    });
  };

  if (!widget) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BgColorsOutlined style={{ color: '#1890ff' }} />
          <span>Configure: {widget.title}</span>
          <Badge count="Advanced" style={{ backgroundColor: '#52c41a' }} />
        </div>
      }
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      width={800}
      okText="Apply Changes"
      cancelText="Cancel"
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <Form form={form} layout="vertical">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 16 }}>
          
          {/* ========== TAB 1: CHART TYPE & LAYOUT ========== */}
          <Tabs.TabPane tab={<span><BarChartOutlined /> Chart Type</span>} key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="chartType" label="Chart Type" rules={[{ required: true }]}>
                  <Select size="large">
                    {getChartTypeOptions()}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="chartVariant" label="Variant">
                  <Select size="large">
                    {getVariantOptions()}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider>Layout Options</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="horizontal" valuePropName="checked" label="Horizontal Orientation">
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="stacked" valuePropName="checked" label="Stacked">
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Bar Width" name="barWidth">
                  <Slider min={0.2} max={1} step={0.1} marks={{ 0.2: '0.2', 0.6: '0.6', 1: '1' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Line Width" name="lineWidth">
                  <Slider min={1} max={6} step={0.5} marks={{ 1: '1', 3: '3', 6: '6' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Opacity" name="opacity">
                  <Slider min={0.1} max={1} step={0.05} marks={{ 0.1: '0.1', 0.5: '0.5', 1: '1' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Border Radius" name="borderRadius">
                  <Slider min={0} max={20} marks={{ 0: '0', 10: '10', 20: '20' }} />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* ========== TAB 2: COLORS ========== */}
          <Tabs.TabPane tab={<span><ChromeOutlined /> Colors</span>} key="2">
            <Form.Item name="colorScheme" label="Color Scheme Preset">
              <Select onChange={handleColorSchemeChange} size="large">
                {Object.keys(COLOR_SCHEMES).map(scheme => (
                  <Option key={scheme} value={scheme}>
                    <Space>
                      <span>{scheme.charAt(0).toUpperCase() + scheme.slice(1)}</span>
                      <span>
                        {COLOR_SCHEMES[scheme].slice(0, 4).map((color, i) => (
                          <span key={i} style={{
                            display: 'inline-block',
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: color,
                            marginLeft: i === 0 ? 0 : 4,
                            border: '1px solid #ddd'
                          }} />
                        ))}
                        {COLOR_SCHEMES[scheme].length > 4 && <span style={{ fontSize: 12, marginLeft: 4 }}>+{COLOR_SCHEMES[scheme].length - 4}</span>}
                      </span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider>Custom Colors</Divider>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                {customColors.map((color, index) => (
                  <Col key={index} xs={6} sm={4}>
                    <div style={{ textAlign: 'center' }}>
                      <ColorPicker
                        value={color}
                        onChange={(colorHex) => handleColorChange(index, colorHex)}
                        format="hex"
                        showText
                        size="large"
                      />
                      <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                        Series {index + 1}
                      </div>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => removeColor(index)}
                        style={{ marginTop: 2 }}
                      />
                    </div>
                  </Col>
                ))}
                <Col xs={6} sm={4}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 80,
                    border: '2px dashed #ddd',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={addColor}>
                      Add
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={resetColors} icon={<UndoOutlined />}>Reset Colors</Button>
              <Button onClick={() => {
                const randomColors = Array.from({ length: 6 }, () => 
                  '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
                );
                setCustomColors(randomColors);
              }} icon={<ReloadOutlined />}>
                Random Colors
              </Button>
            </div>

            <Form.Item name="colorCount" label="Number of Colors" style={{ marginTop: 16 }}>
              <Slider min={2} max={12} marks={{ 2: '2', 4: '4', 6: '6', 8: '8', 10: '10', 12: '12' }} />
            </Form.Item>
          </Tabs.TabPane>

          {/* ========== TAB 3: DISPLAY & LABELS ========== */}
          <Tabs.TabPane tab={<span><EyeOutlined /> Display</span>} key="3">
            <Alert
              message="Visual Elements"
              description="Toggle these options to customize what appears on your chart"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item name="showLegend" valuePropName="checked">
                  <Switch checkedChildren="Show Legend" unCheckedChildren="Hide Legend" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="showGrid" valuePropName="checked">
                  <Switch checkedChildren="Show Grid" unCheckedChildren="Hide Grid" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="showTooltip" valuePropName="checked">
                  <Switch checkedChildren="Show Tooltip" unCheckedChildren="Hide Tooltip" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="showLabels" valuePropName="checked">
                  <Switch checkedChildren="Show Labels" unCheckedChildren="Hide Labels" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="showDataPoint" valuePropName="checked">
                  <Switch checkedChildren="Data Points" unCheckedChildren="Hide Points" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="showAnimation" valuePropName="checked">
                  <Switch checkedChildren="Animate" unCheckedChildren="Static" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Axis & Labels</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Label Position" name="labelPosition">
                  <Select>
                    <Option value="top">Top</Option>
                    <Option value="bottom">Bottom</Option>
                    <Option value="left">Left</Option>
                    <Option value="right">Right</Option>
                    <Option value="inside">Inside</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Grid Line Style" name="gridDash">
                  <Select>
                    <Option value="3 3">Dashed</Option>
                    <Option value="0">Solid</Option>
                    <Option value="5 5">Dotted</Option>
                    <Option value="10 5">Long Dash</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider>Y-Axis Range</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="yAxisMin" label="Min Value">
                  <InputNumber placeholder="Auto" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="yAxisMax" label="Max Value">
                  <InputNumber placeholder="Auto" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="targetLine" label="Target Line Value">
              <InputNumber placeholder="e.g., 0.2 (optional)" style={{ width: '100%' }} />
            </Form.Item>
          </Tabs.TabPane>

          {/* ========== TAB 4: ADVANCED ========== */}
          <Tabs.TabPane tab={<span><RadiusSettingOutlined /> Advanced</span>} key="4">
            <Alert
              message="Advanced Settings"
              description="Fine-tune your chart behavior and data display"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item name="refreshInterval" label="Auto Refresh Interval (minutes)">
              <Select>
                <Option value={0}>Manual Only</Option>
                <Option value={1}>Every 1 minute</Option>
                <Option value={5}>Every 5 minutes</Option>
                <Option value={15}>Every 15 minutes</Option>
                <Option value={30}>Every 30 minutes</Option>
                <Option value={60}>Every hour</Option>
              </Select>
            </Form.Item>

            <Divider>Data Display</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Show Data Points" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Highlight Max/Min" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Export Options</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Export as PNG" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Export as CSV" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

        </Tabs>

        {/* Preview Section */}
        <div style={{
          marginTop: 16,
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 8,
          border: '1px solid #e8e8e8'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Text strong>Chart Preview</Text>
              <Badge count={`${customColors.length} colors`} style={{ backgroundColor: '#52c41a' }} />
            </Space>
            <Space>
              <Tooltip title="Current chart type will be applied on save">
                <Tag color="blue">{form.getFieldValue('chartType') || 'bar'}</Tag>
              </Tooltip>
              <Button size="small" icon={<CopyOutlined />} onClick={() => {
                const config = form.getFieldsValue();
                navigator.clipboard?.writeText(JSON.stringify(config, null, 2));
                message.success('Config copied to clipboard');
              }}>
                Copy Config
              </Button>
            </Space>
          </div>
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 8,
            flexWrap: 'wrap'
          }}>
            {customColors.map((color, i) => (
              <div key={i} style={{
                width: 30,
                height: 30,
                backgroundColor: color,
                borderRadius: 4,
                border: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default EnhancedWidgetConfigModal;