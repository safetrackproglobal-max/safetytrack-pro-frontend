// src/components/documents/DocumentEditor.jsx
// Enhanced Document Editor - Advanced PDF editing with inline editing, tables, AI integration

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Form, Modal,
  message, Spin, Alert, Divider, Typography, Tag, Tooltip,
  Switch, Upload, Progress, Drawer, Descriptions, Tabs,
  Popconfirm, Dropdown, Menu, Badge, Avatar, List, Collapse,
  DatePicker, Radio, Checkbox, Slider, Popover, Skeleton,
  Table, InputNumber, ColorPicker, Segmented, Statistic,
  Empty, Affix, Grid, Pagination, Tree, Transfer, Cascader
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  LinkOutlined,
  PaperClipOutlined,
  PictureOutlined,
  TableOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  HighlightOutlined,
  FontColorsOutlined,
  BgColorsOutlined,
  ClearOutlined,
  CopyOutlined,
  ScissorOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  CodeOutlined,
  BlockOutlined,
  MenuOutlined,
  ExpandOutlined,
  CompressOutlined,
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  SignatureOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  UploadOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  InsertRowAboveOutlined,
  InsertRowBelowOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  DeleteRowOutlined,
  DeleteColumnOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
  BorderOutlined,
  BorderBottomOutlined,
  BorderTopOutlined,
  BorderLeftOutlined,
  BorderRightOutlined,
  BorderInnerOutlined,
  BorderOuterOutlined,
  FontSizeOutlined,
  LineHeightOutlined,
  TextAlignOutlined,
  FormatPainterOutlined,
  InsertRowOutlined,
  DeleteOutlined as DeleteIcon,
  ImportOutlined,
  ExportOutlined,
  CloudUploadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Document, Page, pdfjs, PDFDocument,
  rgb, PDFPage, StandardFonts
} from 'react-pdf';
import { PDFViewer, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import pdfService from '../../services/pdfService';
import documentService from '../../services/documentService';
import DocumentSignature from './DocumentSignature';
import AIClassification from './AIClassification';
import './DocumentEditor.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// ============================================================
// RICH TEXT EDITOR CONFIGURATION
// ============================================================

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
    ['table']
  ],
  clipboard: {
    matchVisual: false,
  },
  table: true
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'indent', 'align',
  'blockquote', 'code-block',
  'link', 'image', 'video',
  'table'
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentEditor = ({
  documentId = null,
  initialContent = '',
  initialPdfUrl = null,
  onSave,
  onCancel,
  onDocumentUpdate,
  readOnly = false,
  embedded = false,
  companyId = null,
  userRole = 'admin',
  currentUser = null,
  isPdf = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [pdfContent, setPdfContent] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(initialPdfUrl);
  const [isEditingPdf, setIsEditingPdf] = useState(isPdf);
  
  // Document Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState('report');
  const [module, setModule] = useState('general');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [version, setVersion] = useState(1);
  const [status, setStatus] = useState('draft');
  const [priority, setPriority] = useState('medium');
  const [isConfidential, setIsConfidential] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  
  // UI State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Editor Mode
  const [editorMode, setEditorMode] = useState('rich');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  
  // Table Editing
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [selectedCell, setSelectedCell] = useState(null);
  const [tableData, setTableData] = useState([]);
  
  // History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  
  // Image Upload
  const [imageUploading, setImageUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  
  // AI Features
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  
  // AI Classification
  const [classificationVisible, setClassificationVisible] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const [classificationLoading, setClassificationLoading] = useState(false);
  
  // Signature Modal
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  
  // Auto-save timer
  const autoSaveTimer = useRef(null);
  
  // Editor ref
  const editorRef = useRef(null);
  const pdfContainerRef = useRef(null);

  // ============================================================
  // PDF HELPERS
  // ============================================================
  
  const handlePdfLoad = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePdfLoadSuccess = (pdf) => {
    setPdfContent(pdf);
  };

  const renderPdfPage = (pageIndex) => {
    return (
      <Page
        key={`page_${pageIndex + 1}`}
        pageNumber={pageIndex + 1}
        scale={zoomLevel}
        renderTextLayer={true}
        renderAnnotationLayer={true}
      />
    );
  };

  // ============================================================
  // TABLE OPERATIONS
  // ============================================================
  
  const insertTable = () => {
    const quill = editorRef.current?.getEditor();
    if (!quill) return;
    
    const range = quill.getSelection(true);
    const tableHtml = `<table class="editor-table" style="border-collapse: collapse; width: 100%;">
      ${Array(tableRows).fill(0).map(() => `
        <tr>
          ${Array(tableCols).fill(0).map(() => `
            <td style="border: 1px solid #d9d9d9; padding: 8px;"><br></td>
          `).join('')}
        </tr>
      `).join('')}
    </table>`;
    
    quill.clipboard.dangerouslyPasteHTML(range.index, tableHtml);
  };

  const insertRowAbove = () => {
    message.info('Insert row above - coming soon');
  };

  const insertRowBelow = () => {
    message.info('Insert row below - coming soon');
  };

  const insertColLeft = () => {
    message.info('Insert column left - coming soon');
  };

  const insertColRight = () => {
    message.info('Insert column right - coming soon');
  };

  const deleteRow = () => {
    message.info('Delete row - coming soon');
  };

  const deleteCol = () => {
    message.info('Delete column - coming soon');
  };

  const mergeCells = () => {
    message.info('Merge cells - coming soon');
  };

  const splitCells = () => {
    message.info('Split cells - coming soon');
  };

  // ============================================================
  // AI FEATURES
  // ============================================================
  
  const handleAISuggestion = async () => {
    if (!content || content.length < 50) {
      message.warning('Please write more content first (at least 50 characters)');
      return;
    }
    
    setAiLoading(true);
    try {
      const suggestions = await pdfService.getAIEditingSuggestions({
        content: content,
        context: title,
        document_type: documentType
      });
      
      setAiSuggestions(suggestions);
      setShowAiPanel(true);
      
      if (suggestions.length === 0) {
        message.info('No AI suggestions available');
      } else {
        message.success(`Received ${suggestions.length} AI suggestions`);
      }
      
    } catch (error) {
      console.error('AI suggestion failed:', error);
      message.error('Failed to get AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = (suggestion) => {
    if (suggestion.action === 'replace') {
      setContent(suggestion.content);
      message.success('AI suggestion applied');
    } else if (suggestion.action === 'insert') {
      const newContent = content + '\n\n' + suggestion.content;
      setContent(newContent);
      message.success('AI content inserted');
    } else if (suggestion.action === 'rewrite') {
      setContent(suggestion.content);
      message.success('Content rewritten by AI');
    }
    
    setShowAiPanel(false);
    addToHistory(content);
  };

  const handleAIEnhance = async () => {
    if (!content || content.length < 100) {
      message.warning('Please write more content first (at least 100 characters)');
      return;
    }
    
    setAiLoading(true);
    try {
      const enhanced = await pdfService.enhanceDocumentContent({
        content: content,
        style: 'professional',
        enhance_level: 'moderate'
      });
      
      setContent(enhanced);
      addToHistory(enhanced);
      message.success('Document enhanced by AI');
      
    } catch (error) {
      console.error('AI enhance failed:', error);
      message.error('Failed to enhance document');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISummarize = async () => {
    if (!content || content.length < 200) {
      message.warning('Please write more content first (at least 200 characters)');
      return;
    }
    
    setAiLoading(true);
    try {
      const summary = await pdfService.summarizeDocument({
        content: content,
        length: 'medium'
      });
      
      Modal.info({
        title: 'AI Summary',
        content: summary,
        width: 600,
        okText: 'Close'
      });
      
    } catch (error) {
      console.error('AI summarize failed:', error);
      message.error('Failed to summarize document');
    } finally {
      setAiLoading(false);
    }
  };

  // ============================================================
  // AI CLASSIFICATION
  // ============================================================
  
  const handleAIClassify = async () => {
    if (!content || content.length < 50) {
      message.warning('Please write more content for classification (at least 50 characters)');
      return;
    }
    
    setClassificationLoading(true);
    try {
      const result = await documentService.classifyDocument({
        content: content,
        title: title
      });
      
      setClassificationResult(result);
      
      Modal.info({
        title: 'AI Document Classification',
        content: (
          <div>
            <h4>Primary Classification</h4>
            <Tag color="blue" style={{ fontSize: 16 }}>
              {result.primary?.category} ({result.primary?.confidence}% confidence)
            </Tag>
            <p>{result.primary?.description}</p>
            
            <h4 style={{ marginTop: 16 }}>Alternative Classifications</h4>
            {result.predictions?.slice(1).map((pred, i) => (
              <div key={i}>
                <Tag>{pred.category}</Tag>
                <span style={{ marginLeft: 8 }}>({pred.confidence}%)</span>
              </div>
            ))}
            
            <h4 style={{ marginTop: 16 }}>Suggested Tags</h4>
            {result.suggested_tags?.map(tag => (
              <Tag key={tag} color="green">{tag}</Tag>
            ))}
            
            <Divider />
            <Button 
              type="primary" 
              onClick={() => {
                // Apply suggestions
                setDocumentType(result.primary?.category);
                setTags([...tags, ...result.suggested_tags]);
                message.success('Classification applied');
              }}
            >
              Apply Classification
            </Button>
          </div>
        ),
        width: 600
      });
      
    } catch (error) {
      console.error('Classification failed:', error);
      message.error('Failed to classify document');
    } finally {
      setClassificationLoading(false);
    }
  };

  // ============================================================
  // EXPORT / IMPORT
  // ============================================================
  
  const handleExportPDF = async () => {
    try {
      const pdfBlob = await pdfService.exportToPDF({
        content: content,
        title: title,
        pageSize: pageSize,
        orientation: orientation
      });
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'document'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      message.success('PDF exported successfully');
      
    } catch (error) {
      console.error('PDF export failed:', error);
      message.error('Failed to export PDF');
    }
  };

  const handleExportWord = async () => {
    try {
      const blob = await pdfService.exportToWord({
        content: content,
        title: title
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'document'}.docx`;
      link.click();
      URL.revokeObjectURL(url);
      
      message.success('Word document exported successfully');
      
    } catch (error) {
      console.error('Word export failed:', error);
      message.error('Failed to export Word document');
    }
  };

  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================
  
  const validateTitle = (value) => {
    if (!value || value.trim().length < 3) {
      return 'Title must be at least 3 characters';
    }
    if (value.length > 255) {
      return 'Title cannot exceed 255 characters';
    }
    return null;
  };

  const validateContent = (value) => {
    const cleanContent = value.replace(/<[^>]*>/g, '').trim();
    if (!cleanContent) {
      return 'Content cannot be empty';
    }
    if (cleanContent.length < 10) {
      return 'Content must be at least 10 characters';
    }
    return null;
  };

  const sanitizeInput = (value) => {
    if (!value) return '';
    return value.replace(/[<>]/g, '');
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadDocument = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const data = await documentService.getDocument(documentId);
      
      setContent(data.content || data.html_content || '');
      setTitle(data.title || '');
      setDescription(data.description || '');
      setDocumentType(data.document_type || 'report');
      setModule(data.module || 'general');
      setCategory(data.category || '');
      setTags(data.tags || []);
      setVersion(data.version || 1);
      setStatus(data.status || 'draft');
      setPriority(data.priority || 'medium');
      setIsConfidential(data.is_confidential || false);
      setExpiresAt(data.expires_at || null);
      
      if (data.pdf_url) {
        setPdfUrl(data.pdf_url);
        setIsEditingPdf(true);
      }
      
      updateCounts(data.content || data.html_content || '');
      
    } catch (error) {
      console.error('Failed to load document:', error);
      message.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // ============================================================
  // AUTO-SAVE
  // ============================================================
  
  const handleAutoSave = useCallback(async () => {
    if (!autoSave || !documentId || !title.trim()) return;
    
    const contentError = validateContent(content);
    if (contentError) return;
    
    try {
      await documentService.autoSaveDocument(documentId, {
        content: content,
        title: title,
        description: description
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [autoSave, documentId, content, title, description]);

  // ============================================================
  // SAVE OPERATIONS
  // ============================================================
  
  const handleSave = async () => {
    const titleError = validateTitle(title);
    if (titleError) {
      message.error(titleError);
      return;
    }
    
    const contentError = validateContent(content);
    if (contentError) {
      message.error(contentError);
      return;
    }
    
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        content: content,
        document_type: documentType,
        module: module,
        category: category,
        tags: tags,
        priority: priority,
        is_confidential: isConfidential,
        expires_at: expiresAt,
        company_id: companyId,
        version: documentId ? version + 1 : 1,
        page_size: pageSize,
        orientation: orientation
      };
      
      let result;
      if (documentId) {
        result = await documentService.updateDocument(documentId, data);
        message.success('Document updated successfully');
      } else {
        result = await documentService.createDocument(data);
        message.success('Document created successfully');
      }
      
      setVersion(documentId ? version + 1 : 1);
      setLastSaved(new Date());
      
      if (onSave) onSave(result);
      if (onDocumentUpdate) onDocumentUpdate(result);
      
    } catch (error) {
      console.error('Save failed:', error);
      message.error(error.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsNew = async () => {
    const titleError = validateTitle(title);
    if (titleError) {
      message.error(titleError);
      return;
    }
    
    setSaving(true);
    try {
      const data = {
        title: title.trim() + ' (Copy)',
        description: description.trim(),
        content: content,
        document_type: documentType,
        module: module,
        category: category,
        tags: tags,
        priority: priority,
        is_confidential: isConfidential,
        expires_at: expiresAt,
        company_id: companyId,
        page_size: pageSize,
        orientation: orientation
      };
      
      const result = await documentService.createDocument(data);
      message.success('Document saved as new');
      
      if (onSave) onSave(result);
      if (onDocumentUpdate) onDocumentUpdate(result);
      
    } catch (error) {
      console.error('Save as new failed:', error);
      message.error(error.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // SIGNATURE HANDLERS
  // ============================================================
  
  const handleSignatureComplete = () => {
    setSignatureModalVisible(false);
    message.success('Document signed successfully');
    if (onDocumentUpdate) onDocumentUpdate({ id: documentId });
  };

  // ============================================================
  // CONTENT HANDLERS
  // ============================================================
  
  const handleContentChange = (value) => {
    setContent(value);
    updateCounts(value);
    addToHistory(value);
  };

  const updateCounts = (html) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const readTimeMinutes = Math.ceil(words / 200);
    
    setWordCount(words);
    setCharCount(chars);
    setReadTime(readTimeMinutes);
  };

  // ============================================================
  // HISTORY (Undo/Redo)
  // ============================================================
  
  const addToHistory = (value) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(value);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  // ============================================================
  // IMAGE UPLOAD HANDLER
  // ============================================================
  
  const handleImageUpload = async (file) => {
    setImageUploading(true);
    try {
      const result = await documentService.uploadImage(file);
      const imageUrl = result.url || result.data?.url;
      
      if (imageUrl && editorRef.current) {
        const quill = editorRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', imageUrl);
        message.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      message.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        handleExportPDF();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);

  // ============================================================
  // AUTO-SAVE TIMER
  // ============================================================
  
  useEffect(() => {
    if (autoSave) {
      autoSaveTimer.current = setInterval(handleAutoSave, 30000);
    }
    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, [autoSave, handleAutoSave]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================
  
  useEffect(() => {
    if (documentId) {
      loadDocument();
    } else {
      setContent(initialContent || '<p>Start writing your document here...</p>');
      updateCounts(initialContent || '<p>Start writing your document here...</p>');
      setHistory([initialContent || '<p>Start writing your document here...</p>']);
      setHistoryIndex(0);
    }
  }, [documentId, loadDocument]);

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Advanced Toolbar
  const renderAdvancedToolbar = () => (
    <div className="editor-toolbar">
      <Space wrap>
        <Button.Group>
          <Tooltip title="Undo (Ctrl+Z)">
            <Button 
              icon={<UndoOutlined />} 
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Y)">
            <Button 
              icon={<RedoOutlined />} 
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              size="small"
            />
          </Tooltip>
        </Button.Group>
        
        <Divider type="vertical" />
        
        <Tooltip title="AI Enhance">
          <Button
            icon={<RobotOutlined />}
            onClick={handleAIEnhance}
            loading={aiLoading}
            size="small"
            style={{ color: '#1890ff' }}
          >
            AI Enhance
          </Button>
        </Tooltip>
        
        <Tooltip title="AI Summary">
          <Button
            icon={<RobotOutlined />}
            onClick={handleAISummarize}
            loading={aiLoading}
            size="small"
          >
            Summarize
          </Button>
        </Tooltip>
        
        <Tooltip title="AI Suggestions">
          <Button
            icon={<RobotOutlined />}
            onClick={handleAISuggestion}
            loading={aiLoading}
            size="small"
            type="dashed"
          >
            Suggest
          </Button>
        </Tooltip>

        <Tooltip title="AI Classification">
          <Button
            icon={<RobotOutlined />}
            onClick={handleAIClassify}
            loading={classificationLoading}
            size="small"
            type={classificationResult ? 'primary' : 'default'}
          >
            Classify
          </Button>
        </Tooltip>
        
        <Divider type="vertical" />
        
        <Tooltip title="Insert Table">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="table" onClick={() => {
                  Modal.confirm({
                    title: 'Insert Table',
                    content: (
                      <div>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Form.Item label="Rows">
                              <InputNumber 
                                min={1} 
                                max={20} 
                                value={tableRows} 
                                onChange={setTableRows}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Columns">
                              <InputNumber 
                                min={1} 
                                max={20} 
                                value={tableCols} 
                                onChange={setTableCols}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ),
                    onOk: insertTable,
                    okText: 'Insert',
                    cancelText: 'Cancel'
                  });
                }}>
                  Custom Table
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="insert_above" onClick={insertRowAbove}>
                  <InsertRowAboveOutlined /> Insert Row Above
                </Menu.Item>
                <Menu.Item key="insert_below" onClick={insertRowBelow}>
                  <InsertRowBelowOutlined /> Insert Row Below
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="insert_left" onClick={insertColLeft}>
                  <InsertRowLeftOutlined /> Insert Column Left
                </Menu.Item>
                <Menu.Item key="insert_right" onClick={insertColRight}>
                  <InsertRowRightOutlined /> Insert Column Right
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="delete_row" onClick={deleteRow}>
                  <DeleteRowOutlined /> Delete Row
                </Menu.Item>
                <Menu.Item key="delete_col" onClick={deleteCol}>
                  <DeleteColumnOutlined /> Delete Column
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="merge" onClick={mergeCells}>
                  <MergeCellsOutlined /> Merge Cells
                </Menu.Item>
                <Menu.Item key="split" onClick={splitCells}>
                  <SplitCellsOutlined /> Split Cells
                </Menu.Item>
              </Menu>
            }
          >
            <Button icon={<TableOutlined />} size="small">
              Table
            </Button>
          </Dropdown>
        </Tooltip>
        
        <Tooltip title="Word Count">
          <Badge count={wordCount} showZero style={{ backgroundColor: '#1890ff' }}>
            <Button icon={<FileTextOutlined />} size="small">
              Words
            </Button>
          </Badge>
        </Tooltip>
        
        <Tooltip title="Read Time">
          <Tag icon={<ClockCircleOutlined />}>
            {readTime} min read
          </Tag>
        </Tooltip>
        
        <Divider type="vertical" />
        
        <Tooltip title="Zoom In">
          <Button 
            icon={<ZoomInOutlined />} 
            onClick={() => setZoomLevel(Math.min(zoomLevel + 0.1, 2))}
            size="small"
            disabled={!isEditingPdf}
          />
        </Tooltip>
        
        <Tooltip title="Zoom Out">
          <Button 
            icon={<ZoomOutOutlined />} 
            onClick={() => setZoomLevel(Math.max(zoomLevel - 0.1, 0.5))}
            size="small"
            disabled={!isEditingPdf}
          />
        </Tooltip>
        
        <Tooltip title="Zoom Level">
          <Tag>{Math.round(zoomLevel * 100)}%</Tag>
        </Tooltip>
        
        <Divider type="vertical" />
        
        <Tooltip title="Toggle Fullscreen">
          <Button 
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
            onClick={() => setIsFullscreen(!isFullscreen)}
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="Auto-Save">
          <Switch 
            checked={autoSave} 
            onChange={setAutoSave} 
            size="small"
            checkedChildren="Auto"
            unCheckedChildren="Manual"
          />
        </Tooltip>
        
        {lastSaved && (
          <Tag color="green" style={{ fontSize: 11 }}>
            Last saved: {lastSaved.toLocaleTimeString()}
          </Tag>
        )}
      </Space>
    </div>
  );

  // Render Export Menu
  const renderExportMenu = () => (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item key="pdf" icon={<FilePdfOutlined />} onClick={handleExportPDF}>
            Export as PDF
          </Menu.Item>
          <Menu.Item key="word" icon={<FileWordOutlined />} onClick={handleExportWord}>
            Export as Word
          </Menu.Item>
          <Menu.Item key="html" icon={<FileTextOutlined />} onClick={() => {
            message.info('HTML export coming soon');
          }}>
            Export as HTML
          </Menu.Item>
        </Menu>
      }
    >
      <Button icon={<ExportOutlined />}>Export</Button>
    </Dropdown>
  );

  // Render Metadata Panel (Enhanced)
  const renderMetadataPanel = () => (
    <Collapse defaultActiveKey={['1']} className="metadata-panel" ghost>
      <Panel header="Document Metadata" key="1">
        <Form layout="vertical">
          <Form.Item
            label="Title"
            required
            validateStatus={validateTitle(title) ? 'error' : 'success'}
            help={validateTitle(title) || ''}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              maxLength={255}
              showCount
            />
          </Form.Item>

          <Form.Item label="Description">
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description"
              rows={2}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Document Type">
                <Select value={documentType} onChange={setDocumentType}>
                  <Option value="report">Report</Option>
                  <Option value="policy">Policy/Procedure</Option>
                  <Option value="record">Record/Log</Option>
                  <Option value="hse_report">HSE Report</Option>
                  <Option value="incident_report">Incident Report</Option>
                  <Option value="environmental_report">Environmental Report</Option>
                  <Option value="permit">Permit/License</Option>
                  <Option value="hospital_record">Hospital Record</Option>
                  <Option value="quality_document">Quality Document</Option>
                  <Option value="supply_chain">Supply Chain Document</Option>
                  <Option value="training_material">Training Material</Option>
                  <Option value="technical">Technical Document</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Module">
                <Select value={module} onChange={setModule}>
                  <Option value="general">General</Option>
                  <Option value="hse">HSE</Option>
                  <Option value="environmental">Environmental</Option>
                  <Option value="hospital">Hospital</Option>
                  <Option value="quality">Quality</Option>
                  <Option value="supply_chain">Supply Chain</Option>
                  <Option value="training">Training</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Category">
                <Select value={category} onChange={setCategory} allowClear>
                  <Option value="air_quality">Air Quality</Option>
                  <Option value="water_quality">Water Quality</Option>
                  <Option value="waste_management">Waste Management</Option>
                  <Option value="emissions">Emissions</Option>
                  <Option value="biodiversity">Biodiversity</Option>
                  <Option value="social_impact">Social Impact</Option>
                  <Option value="governance">Governance</Option>
                  <Option value="safety">Safety</Option>
                  <Option value="compliance">Compliance</Option>
                  <Option value="training">Training</Option>
                  <Option value="incident">Incident</Option>
                  <Option value="medical">Medical</Option>
                  <Option value="quality">Quality</Option>
                  <Option value="supply_chain">Supply Chain</Option>
                  <Option value="technical">Technical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Priority">
                <Select value={priority} onChange={setPriority}>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Tags">
                <Select
                  mode="tags"
                  value={tags}
                  onChange={setTags}
                  placeholder="Add tags"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Page Size">
                <Select value={pageSize} onChange={setPageSize}>
                  <Option value="a4">A4</Option>
                  <Option value="letter">Letter</Option>
                  <Option value="legal">Legal</Option>
                  <Option value="a3">A3</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Orientation">
                <Select value={orientation} onChange={setOrientation}>
                  <Option value="portrait">Portrait</Option>
                  <Option value="landscape">Landscape</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Expiry Date">
                <DatePicker
                  value={expiresAt}
                  onChange={setExpiresAt}
                  style={{ width: '100%' }}
                  placeholder="Select expiry date"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Confidential">
                <Switch
                  checked={isConfidential}
                  onChange={setIsConfidential}
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status">
                <Tag color={
                  status === 'published' ? 'green' :
                  status === 'review' ? 'blue' :
                  status === 'draft' ? 'default' :
                  status === 'archived' ? 'orange' : 'red'
                }>
                  {status.toUpperCase()}
                </Tag>
                {documentId && (
                  <Tooltip title="Version">
                    <Tag color="blue">v{version}</Tag>
                  </Tooltip>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Panel>
    </Collapse>
  );

  // Render Editor
  const renderEditor = () => (
    <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {renderAdvancedToolbar()}
      
      <div className="editor-wrapper" ref={pdfContainerRef}>
        <ReactQuill
          ref={editorRef}
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          readOnly={readOnly}
          placeholder="Start writing your document here..."
          className="document-editor"
        />
      </div>
      
      <div className="editor-footer">
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {wordCount} words • {charCount} characters • {readTime} min read
          </Text>
          {imageUploading && (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
          )}
        </Space>
        <Space>
          {renderExportMenu()}
        </Space>
      </div>
    </div>
  );

  // Render AI Suggestion Panel
  const renderAIPanel = () => (
    <Drawer
      title={<Space><RobotOutlined /> AI Suggestions</Space>}
      open={showAiPanel}
      onClose={() => setShowAiPanel(false)}
      width={400}
      placement="right"
    >
      {aiLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>AI is analyzing your document...</div>
        </div>
      ) : aiSuggestions.length > 0 ? (
        <List
          dataSource={aiSuggestions}
          renderItem={(suggestion, index) => (
            <List.Item
              actions={[
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={() => applyAISuggestion(suggestion)}
                >
                  Apply
                </Button>
              ]}
            >
              <List.Item.Meta
                title={suggestion.title}
                description={
                  <div>
                    <div>{suggestion.description}</div>
                    {suggestion.preview && (
                      <div style={{ 
                        marginTop: 8, 
                        padding: 8, 
                        background: '#f5f5f5', 
                        borderRadius: 4,
                        fontSize: 12
                      }}>
                        {suggestion.preview}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty 
          description="No AI suggestions available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Drawer>
  );

  // Render Action Buttons
  const renderActions = () => (
    <div className="editor-actions">
      <Space>
        {onCancel && (
          <Button onClick={onCancel} icon={<CloseOutlined />}>
            Cancel
          </Button>
        )}
        
        {documentId && (
          <>
            <Tooltip title="Save as New Document">
              <Button onClick={handleSaveAsNew} loading={saving} icon={<CopyOutlined />}>
                Save As
              </Button>
            </Tooltip>
            
            <Tooltip title="View Document">
              <Button 
                icon={<EyeOutlined />} 
                onClick={() => {
                  if (onDocumentUpdate) {
                    onDocumentUpdate({ id: documentId });
                  }
                }}
              >
                View
              </Button>
            </Tooltip>
            
            <Tooltip title="Sign Document">
              <Button 
                icon={<SignatureOutlined />} 
                onClick={() => setSignatureModalVisible(true)}
              >
                Sign
              </Button>
            </Tooltip>
          </>
        )}
        
        {renderExportMenu()}
        
        <Button 
          type="primary" 
          onClick={handleSave} 
          loading={saving}
          icon={<SaveOutlined />}
        >
          {documentId ? 'Update' : 'Create'}
        </Button>
      </Space>
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  if (loading) {
    return (
      <div className="document-editor-loading">
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading document...</div>
      </div>
    );
  }

  return (
    <>
      <div className={`document-editor-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
        <Card className="editor-card">
          {/* Header */}
          <div className="editor-header">
            <div className="editor-title">
              <Title level={4} style={{ margin: 0 }}>
                {documentId ? 'Edit Document' : 'New Document'}
              </Title>
              {documentId && (
                <Tag color="blue">v{version}</Tag>
              )}
              {isEditingPdf && (
                <Tag color="purple" icon={<FilePdfOutlined />}>PDF</Tag>
              )}
            </div>
            {renderActions()}
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* Content */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={6}>
              {renderMetadataPanel()}
            </Col>
            <Col xs={24} lg={18}>
              {renderEditor()}
            </Col>
          </Row>
        </Card>
      </div>

      {/* AI Panel */}
      {renderAIPanel()}

      {/* Signature Modal */}
      <Modal
        title="Document Signatures"
        open={signatureModalVisible}
        onCancel={() => setSignatureModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ padding: '16px', maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <DocumentSignature
          documentId={documentId}
          documentTitle={title}
          onSignatureComplete={handleSignatureComplete}
          companyId={companyId}
          currentUser={currentUser}
        />
      </Modal>
    </>
  );
};

export default DocumentEditor;