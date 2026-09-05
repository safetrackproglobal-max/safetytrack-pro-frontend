// src/components/PDFEditor/PDFEditor.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Button,
  Space,
  Tooltip,
  Input,
  Select,
  ColorPicker,
  Divider,
  message,
  Popover,
  Tag,
  Badge,
  Modal,
  Tabs,
  Upload
} from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  TableOutlined,
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  PictureOutlined,
  LinkOutlined,
  ClearOutlined,
  CodeOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ExpandOutlined,
  CompressOutlined,
  SignatureOutlined,
  DeleteOutlined,
  UploadOutlined,
  EditOutlined
} from '@ant-design/icons';

import './PDFEditor.css';

const { TextArea } = Input;
const { TabPane } = Tabs;

// ===================== TABLE GRID COMPONENT =====================
const TableGrid = ({ onInsert }) => {
  const [tableConfig, setTableConfig] = useState({ rows: 3, cols: 4 });

  return (
    <div className="table-grid-popover">
      <div className="table-grid-header">
        <span>Insert Table</span>
        <span className="table-grid-size">{tableConfig.rows} × {tableConfig.cols}</span>
      </div>
      <div className="table-grid">
        {[...Array(36)].map((_, i) => {
          const row = Math.floor(i / 6);
          const col = i % 6;
          const isSelected = row < tableConfig.rows && col < tableConfig.cols;
          return (
            <div
              key={i}
              className={`grid-cell ${isSelected ? 'selected' : ''}`}
              onMouseEnter={() => setTableConfig({ rows: row + 1, cols: col + 1 })}
              onClick={() => onInsert(tableConfig.rows, tableConfig.cols)}
            />
          );
        })}
      </div>
    </div>
  );
};

// ===================== SIGNATURE PAD COMPONENT =====================
const SignaturePad = ({ onSave, onCancel, existingSignature }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState('draw');
  const [typedName, setTypedName] = useState('');
  const [fontFamily, setFontFamily] = useState('cursive');
  const [signatureData, setSignatureData] = useState(existingSignature || null);

  // Drawing functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const saveSignature = () => {
    if (signatureType === 'draw') {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      if (dataUrl === canvas.toDataURL('image/png').replace(/[^,]*,/, '')) {
        message.warning('Please draw your signature first');
        return;
      }
      setSignatureData(dataUrl);
      onSave(dataUrl);
    } else if (signatureType === 'type') {
      if (!typedName.trim()) {
        message.warning('Please enter your name');
        return;
      }
      // Create typed signature
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `48px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureData(dataUrl);
      onSave(dataUrl);
    }
  };

  // Handle file upload
  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setSignatureData(dataUrl);
      onSave(dataUrl);
      message.success('Signature uploaded successfully');
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div className="signature-modal-content">
      <Tabs activeKey={signatureType} onChange={setSignatureType} className="signature-tabs">
        <TabPane tab="Draw" key="draw">
          <div className="signature-draw-area">
            <div className="signature-canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="signature-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                  border: '2px dashed #d9d9d9',
                  borderRadius: '4px',
                  cursor: 'crosshair',
                  width: '100%',
                  height: '200px',
                  touchAction: 'none'
                }}
              />
              <div className="signature-hint">Draw your signature here</div>
            </div>
            <div className="signature-actions">
              <Button icon={<DeleteOutlined />} onClick={clearCanvas}>
                Clear
              </Button>
              <span className="signature-info">Use mouse or touch to draw</span>
            </div>
          </div>
        </TabPane>

        <TabPane tab="Type" key="type">
          <div className="signature-type-area">
            <div className="signature-type-inputs">
              <Input
                placeholder="Type your name..."
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                style={{ fontSize: '16px' }}
                prefix={<EditOutlined />}
              />
              <Select
                value={fontFamily}
                onChange={setFontFamily}
                style={{ width: 150, marginLeft: 10 }}
              >
                <Select.Option value="cursive">Cursive</Select.Option>
                <Select.Option value="'Brush Script MT', cursive">Brush Script</Select.Option>
                <Select.Option value="'Great Vibes', cursive">Great Vibes</Select.Option>
                <Select.Option value="'Pacifico', cursive">Pacifico</Select.Option>
                <Select.Option value="'Dancing Script', cursive">Dancing Script</Select.Option>
                <Select.Option value="'Alex Brush', cursive">Alex Brush</Select.Option>
              </Select>
            </div>
            <div className="signature-preview">
              <div className="signature-preview-label">Preview:</div>
              <div className="signature-preview-text" style={{ 
                fontFamily: fontFamily,
                fontSize: '48px',
                color: '#1a1a1a',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e8e8e8',
                borderRadius: '4px',
                padding: '20px',
                background: '#fafafa'
              }}>
                {typedName || 'Your signature will appear here'}
              </div>
            </div>
          </div>
        </TabPane>

        <TabPane tab="Upload" key="upload">
          <div className="signature-upload-area">
            <Upload.Dragger
              accept="image/*"
              beforeUpload={handleUpload}
              showUploadList={false}
              className="signature-upload-dragger"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag signature image here</p>
              <p className="ant-upload-hint">
                Supports PNG, JPG, GIF (Max 2MB)
              </p>
            </Upload.Dragger>
            {signatureData && (
              <div className="signature-uploaded-preview">
                <img src={signatureData} alt="Uploaded signature" style={{ maxWidth: '200px', maxHeight: '100px' }} />
                <Button danger icon={<DeleteOutlined />} onClick={() => setSignatureData(null)}>
                  Remove
                </Button>
              </div>
            )}
          </div>
        </TabPane>
      </Tabs>

      <div className="signature-modal-footer">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={saveSignature}>
          Add Signature
        </Button>
      </div>
    </div>
  );
};

// ===================== MAIN PDF EDITOR =====================
const PDFEditor = ({ 
  initialContent = '', 
  onSave, 
  onExport,
  readOnly = false,
  className = ''
}) => {
  // ===== STATE =====
  const [content, setContent] = useState(initialContent);
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCodeView, setIsCodeView] = useState(false);
  const [history, setHistory] = useState({ past: [], future: [] });
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);

  const contentEditableRef = useRef(null);
  const editorContainerRef = useRef(null);

  // ===== EFFECTS =====
  useEffect(() => {
    if (initialContent && contentEditableRef.current && !isInternalUpdate) {
      const currentContent = contentEditableRef.current.innerHTML;
      if (currentContent !== initialContent) {
        contentEditableRef.current.innerHTML = initialContent;
        setContent(initialContent);
        setHtmlContent(initialContent);
      }
    }
  }, [initialContent, isInternalUpdate]);

  // ===== HISTORY =====
  const saveToHistory = useCallback((newContent) => {
    if (newContent !== content) {
      setHistory(prev => ({
        past: [...prev.past, content],
        future: []
      }));
      setContent(newContent);
      setHtmlContent(newContent);
    }
  }, [content]);

  const handleUndo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory(prev => ({
      past: prev.past.slice(0, -1),
      future: [content, ...prev.future]
    }));
    setContent(previous);
    setHtmlContent(previous);
    if (contentEditableRef.current) {
      setIsInternalUpdate(true);
      contentEditableRef.current.innerHTML = previous;
      setIsInternalUpdate(false);
    }
    message.success('Undo');
  };

  const handleRedo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory(prev => ({
      past: [...prev.past, content],
      future: prev.future.slice(1)
    }));
    setContent(next);
    setHtmlContent(next);
    if (contentEditableRef.current) {
      setIsInternalUpdate(true);
      contentEditableRef.current.innerHTML = next;
      setIsInternalUpdate(false);
    }
    message.success('Redo');
  };

  // ===== CONTENT EDITING =====
  const handleContentChange = useCallback(() => {
    if (contentEditableRef.current && !isInternalUpdate) {
      const newContent = contentEditableRef.current.innerHTML;
      if (newContent !== content) {
        setContent(newContent);
        setHtmlContent(newContent);
        setHistory(prev => ({
          past: [...prev.past, content],
          future: []
        }));
      }
    }
  }, [content, isInternalUpdate]);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    }
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    }
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
    }
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic');
    }
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline');
    }
  }, []);

  // ===== TABLE OPERATIONS =====
  const insertTable = (rows, cols) => {
    let tableHtml = `<table style="width:100%;border-collapse:collapse;margin:10px 0;">`;
    tableHtml += '<thead><tr>';
    for (let i = 0; i < cols; i++) {
      tableHtml += `<th style="border:1px solid #ddd;padding:8px;background:#f0f0f0;text-align:left;">Column ${i + 1}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let i = 0; i < rows; i++) {
      tableHtml += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHtml += `<td style="border:1px solid #ddd;padding:8px;">&nbsp;</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table>';

    const currentContent = contentEditableRef.current?.innerHTML || content;
    const newContent = currentContent + tableHtml;
    
    setContent(newContent);
    setHtmlContent(newContent);
    if (contentEditableRef.current) {
      setIsInternalUpdate(true);
      contentEditableRef.current.innerHTML = newContent;
      setIsInternalUpdate(false);
    }
    setHistory(prev => ({
      past: [...prev.past, content],
      future: []
    }));
    message.success(`Table (${rows}×${cols}) inserted`);
    setShowTableMenu(false);
  };

  // ===== FORMATTING =====
  const handleFormat = (command) => {
    if (contentEditableRef.current) {
      document.execCommand(command, false, null);
      const newContent = contentEditableRef.current.innerHTML;
      if (newContent !== content) {
        setContent(newContent);
        setHtmlContent(newContent);
        setHistory(prev => ({
          past: [...prev.past, content],
          future: []
        }));
      }
    }
  };

  const handleClearFormatting = () => {
    if (contentEditableRef.current) {
      document.execCommand('removeFormat', false, null);
      const newContent = contentEditableRef.current.innerHTML;
      setContent(newContent);
      setHtmlContent(newContent);
      setHistory(prev => ({
        past: [...prev.past, content],
        future: []
      }));
      message.success('Formatting cleared');
    }
  };

  const handleAlignment = (align) => {
    if (contentEditableRef.current) {
      document.execCommand(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`, false, null);
      const newContent = contentEditableRef.current.innerHTML;
      setContent(newContent);
      setHtmlContent(newContent);
      setHistory(prev => ({
        past: [...prev.past, content],
        future: []
      }));
    }
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    if (contentEditableRef.current) {
      document.execCommand('fontSize', false, size);
      const newContent = contentEditableRef.current.innerHTML;
      setContent(newContent);
      setHtmlContent(newContent);
      setHistory(prev => ({
        past: [...prev.past, content],
        future: []
      }));
    }
  };

  const handleColorChange = (type, color) => {
    if (type === 'text') {
      setFontColor(color);
      document.execCommand('foreColor', false, color);
    } else {
      setBgColor(color);
      document.execCommand('hiliteColor', false, color);
    }
    if (contentEditableRef.current) {
      const newContent = contentEditableRef.current.innerHTML;
      setContent(newContent);
      setHtmlContent(newContent);
      setHistory(prev => ({
        past: [...prev.past, content],
        future: []
      }));
    }
  };

  // ===== ZOOM =====
  const handleZoom = (direction) => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev + 10 : prev - 10;
      return Math.max(50, Math.min(200, newZoom));
    });
  };

  // ===== SIGNATURE =====
  const handleInsertSignature = () => {
    setShowSignatureModal(true);
  };

  const handleSignatureSave = (dataUrl) => {
    setSignatureData(dataUrl);
    const signatureHtml = `
      <div style="text-align:center;margin:10px 0;padding:10px;border:1px solid #e8e8e8;border-radius:4px;background:#fafafa;">
        <img src="${dataUrl}" style="max-width:300px;max-height:100px;display:inline-block;" alt="Signature" />
        <div style="font-size:12px;color:#999;margin-top:4px;">Signed</div>
      </div>
    `;
    
    const currentContent = contentEditableRef.current?.innerHTML || content;
    const newContent = currentContent + signatureHtml;
    
    setContent(newContent);
    setHtmlContent(newContent);
    if (contentEditableRef.current) {
      setIsInternalUpdate(true);
      contentEditableRef.current.innerHTML = newContent;
      setIsInternalUpdate(false);
    }
    setHistory(prev => ({
      past: [...prev.past, content],
      future: []
    }));
    
    setShowSignatureModal(false);
    message.success('Signature inserted successfully');
  };

  const handleSignatureCancel = () => {
    setShowSignatureModal(false);
  };

  // ===== INSERT IMAGE =====
  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const imgHtml = `<div style="text-align:center;margin:10px 0;"><img src="${ev.target.result}" style="max-width:100%;max-height:400px;border:1px solid #ddd;border-radius:4px;padding:4px;" /></div>`;
          const currentContent = contentEditableRef.current?.innerHTML || content;
          const newContent = currentContent + imgHtml;
          setContent(newContent);
          setHtmlContent(newContent);
          if (contentEditableRef.current) {
            setIsInternalUpdate(true);
            contentEditableRef.current.innerHTML = newContent;
            setIsInternalUpdate(false);
          }
          setHistory(prev => ({
            past: [...prev.past, content],
            future: []
          }));
          message.success('Image inserted');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // ===== INSERT LINK =====
  const handleInsertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      const text = prompt('Enter link text:', 'Link');
      if (text) {
        const linkHtml = `<a href="${url}" target="_blank">${text}</a>`;
        const currentContent = contentEditableRef.current?.innerHTML || content;
        const newContent = currentContent + linkHtml;
        setContent(newContent);
        setHtmlContent(newContent);
        if (contentEditableRef.current) {
          setIsInternalUpdate(true);
          contentEditableRef.current.innerHTML = newContent;
          setIsInternalUpdate(false);
        }
        setHistory(prev => ({
          past: [...prev.past, content],
          future: []
        }));
        message.success('Link inserted');
      }
    }
  };

  // ===== SAVE / EXPORT =====
  const handleSave = () => {
    if (contentEditableRef.current) {
      const newContent = contentEditableRef.current.innerHTML;
      setContent(newContent);
      setHtmlContent(newContent);
      onSave?.(newContent);
      message.success('Document saved');
    }
  };

  const handleExport = () => {
    onExport?.(content);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFullscreen = () => {
    const elem = editorContainerRef.current;
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  const handleToggleCodeView = () => {
    setIsCodeView(!isCodeView);
  };

  const handleContentChangeTextArea = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHtmlContent(newContent);
    if (contentEditableRef.current) {
      setIsInternalUpdate(true);
      contentEditableRef.current.innerHTML = newContent;
      setIsInternalUpdate(false);
    }
    setHistory(prev => ({
      past: [...prev.past, content],
      future: []
    }));
  };

  // ===== WORD COUNT =====
  const getWordCount = () => {
    const text = content.replace(/<[^>]*>/g, '');
    return text.split(/\s+/).filter(w => w.length > 0).length;
  };

  const getCharCount = () => {
    return content.replace(/<[^>]*>/g, '').length;
  };

  // ===== RENDER =====
  return (
    <div className={`pdf-editor ${className}`} ref={editorContainerRef}>
      
      {/* ===== TOP TOOLBAR ===== */}
      <div className="top-toolbar">
        <div className="toolbar-row">
          <div className="toolbar-left">
            <Space size="small" wrap={false}>
              <Tooltip title={isExpanded ? 'Hide Tools' : 'Show Tools'}>
                <Button 
                  type={isExpanded ? 'primary' : 'default'}
                  icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />} 
                  onClick={() => setIsExpanded(!isExpanded)}
                  size="small"
                  className="toggle-tools-btn"
                >
                  {isExpanded ? 'Hide' : 'Tools'}
                </Button>
              </Tooltip>

              {isExpanded && (
                <>
                  <Button.Group size="small">
                    <Tooltip title="Undo (Ctrl+Z)">
                      <Button icon={<UndoOutlined />} onClick={handleUndo} disabled={history.past.length === 0} />
                    </Tooltip>
                    <Tooltip title="Redo (Ctrl+Y)">
                      <Button icon={<RedoOutlined />} onClick={handleRedo} disabled={history.future.length === 0} />
                    </Tooltip>
                  </Button.Group>

                  <Divider type="vertical" />

                  <Tooltip title="Bold (Ctrl+B)">
                    <Button size="small" icon={<BoldOutlined />} onClick={() => handleFormat('bold')} />
                  </Tooltip>
                  <Tooltip title="Italic (Ctrl+I)">
                    <Button size="small" icon={<ItalicOutlined />} onClick={() => handleFormat('italic')} />
                  </Tooltip>
                  <Tooltip title="Underline (Ctrl+U)">
                    <Button size="small" icon={<UnderlineOutlined />} onClick={() => handleFormat('underline')} />
                  </Tooltip>
                  <Tooltip title="Strikethrough">
                    <Button size="small" icon={<StrikethroughOutlined />} onClick={() => handleFormat('strikethrough')} />
                  </Tooltip>
                  <Tooltip title="Clear Formatting">
                    <Button size="small" icon={<ClearOutlined />} onClick={handleClearFormatting} />
                  </Tooltip>

                  <Divider type="vertical" />

                  <Tooltip title="Align Left">
                    <Button size="small" icon={<AlignLeftOutlined />} onClick={() => handleAlignment('left')} />
                  </Tooltip>
                  <Tooltip title="Center">
                    <Button size="small" icon={<AlignCenterOutlined />} onClick={() => handleAlignment('center')} />
                  </Tooltip>
                  <Tooltip title="Align Right">
                    <Button size="small" icon={<AlignRightOutlined />} onClick={() => handleAlignment('right')} />
                  </Tooltip>

                  <Divider type="vertical" />

                  <Popover
                    content={<TableGrid onInsert={insertTable} />}
                    trigger="click"
                    open={showTableMenu}
                    onOpenChange={setShowTableMenu}
                    placement="bottomLeft"
                  >
                    <Tooltip title="Insert Table">
                      <Button size="small" icon={<TableOutlined />}>Table</Button>
                    </Tooltip>
                  </Popover>

                  <Divider type="vertical" />

                  <Select
                    size="small"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    style={{ width: 50 }}
                    dropdownMatchSelectWidth={false}
                  >
                    {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                      <Select.Option key={size} value={size}>{size}</Select.Option>
                    ))}
                  </Select>

                  <ColorPicker
                    value={fontColor}
                    onChange={(color) => handleColorChange('text', color.toHexString())}
                    size="small"
                  />
                  <ColorPicker
                    value={bgColor}
                    onChange={(color) => handleColorChange('bg', color.toHexString())}
                    size="small"
                  />

                  <Divider type="vertical" />

                  <Tooltip title="Insert Image">
                    <Button size="small" icon={<PictureOutlined />} onClick={handleInsertImage} />
                  </Tooltip>
                  <Tooltip title="Insert Link">
                    <Button size="small" icon={<LinkOutlined />} onClick={handleInsertLink} />
                  </Tooltip>
                  
                  {/* Signature Button */}
                  <Tooltip title="Insert Signature">
                    <Button size="small" icon={<SignatureOutlined />} onClick={handleInsertSignature}>
                      Sign
                    </Button>
                  </Tooltip>

                  <Divider type="vertical" />

                  <span className="zoom-control">
                    <Button size="small" icon={<ZoomOutOutlined />} onClick={() => handleZoom('out')} />
                    <span className="zoom-level">{zoomLevel}%</span>
                    <Button size="small" icon={<ZoomInOutlined />} onClick={() => handleZoom('in')} />
                  </span>

                  <Divider type="vertical" />

                  <Tooltip title={isCodeView ? 'View Mode' : 'Code View'}>
                    <Button 
                      size="small" 
                      icon={<CodeOutlined />} 
                      type={isCodeView ? 'primary' : 'default'}
                      onClick={handleToggleCodeView}
                    />
                  </Tooltip>

                  <Divider type="vertical" />

                  <Tooltip title="Save">
                    <Button size="small" type="primary" icon={<SaveOutlined />} onClick={handleSave}>Save</Button>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <Button size="small" icon={<DownloadOutlined />} onClick={handleExport}>PDF</Button>
                  </Tooltip>
                  <Tooltip title="Print">
                    <Button size="small" icon={<PrinterOutlined />} onClick={handlePrint} />
                  </Tooltip>
                  <Tooltip title="Fullscreen">
                    <Button size="small" icon={<FullscreenOutlined />} onClick={handleFullscreen} />
                  </Tooltip>
                </>
              )}
            </Space>
          </div>

          <div className="toolbar-right">
            {isExpanded && (
              <Badge status="processing" text="Editing" />
            )}
          </div>
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div 
        className="content-wrapper"
        style={{ 
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease'
        }}
      >
        <div className="content-area">
          {isCodeView ? (
            <TextArea
              value={htmlContent}
              onChange={handleContentChangeTextArea}
              className="code-editor"
              placeholder="Edit HTML directly..."
              rows={20}
            />
          ) : (
            <div
              ref={contentEditableRef}
              contentEditable={!readOnly}
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              className="content-editable"
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: `${fontSize}px`,
                padding: '32px 40px',
                outline: 'none',
                lineHeight: '1.8',
                color: '#1a1a1a',
                width: '100%',
                minHeight: '500px'
              }}
            />
          )}
        </div>
      </div>

      {/* ===== STATUS BAR ===== */}
      <div className="status-bar">
        <div className="status-left">
          <Space size="middle">
            <Tag color="blue">Characters: {getCharCount()}</Tag>
            <Tag color="green">Words: {getWordCount()}</Tag>
            <Tag color="purple">Zoom: {zoomLevel}%</Tag>
            {signatureData && <Tag color="gold" icon={<SignatureOutlined />}>Signature Ready</Tag>}
          </Space>
        </div>
        <div className="status-right">
          <Space size="small">
            <Button size="small" icon={<FilePdfOutlined />} onClick={handleExport}>Export PDF</Button>
          </Space>
        </div>
      </div>

      {/* ===== SIGNATURE MODAL ===== */}
      <Modal
        title={
          <span>
            <SignatureOutlined style={{ marginRight: 8 }} />
            Insert Signature
          </span>
        }
        open={showSignatureModal}
        onCancel={handleSignatureCancel}
        footer={null}
        width={700}
        className="signature-modal"
        destroyOnClose
      >
        <SignaturePad 
          onSave={handleSignatureSave} 
          onCancel={handleSignatureCancel}
          existingSignature={signatureData}
        />
      </Modal>
    </div>
  );
};

export default PDFEditor;