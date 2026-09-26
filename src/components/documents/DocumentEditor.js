// src/components/documents/DocumentEditor.jsx
// Modern Tiptap-based Document Editor
// Features: rich text, tables, images, tasks, code, AI, versions,
//           find/replace, outline, autosave, signature,
//           track changes, slash commands, focus mode,
//           reading mode, import/export, PDF annotation mode

import React, {
  useState, useEffect, useCallback, useRef, useMemo
} from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Form, Modal,
  message, Spin, Divider, Typography, Tag, Tooltip,
  Switch, Upload, Drawer, Tabs, Dropdown, Menu, Badge, Avatar, List,
  Collapse, DatePicker, InputNumber, Empty, Progress
} from 'antd';
import {
  SaveOutlined, CloseOutlined, UndoOutlined, RedoOutlined,
  BoldOutlined, ItalicOutlined, UnderlineOutlined,
  StrikethroughOutlined, OrderedListOutlined, UnorderedListOutlined,
  AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined,
  LinkOutlined, PictureOutlined, TableOutlined, CodeOutlined,
  HighlightOutlined, CopyOutlined, SearchOutlined, DeleteOutlined,
  PlusOutlined, MinusOutlined, SignatureOutlined, ClockCircleOutlined,
  RobotOutlined, FilePdfOutlined, FileWordOutlined,
  FileTextOutlined, EyeOutlined, HistoryOutlined,
  FullscreenOutlined, FullscreenExitOutlined,
  CheckSquareOutlined, FontSizeOutlined, BlockOutlined, MenuOutlined,
  InsertRowAboveOutlined, InsertRowBelowOutlined,
  InsertRowLeftOutlined, InsertRowRightOutlined,
  DeleteRowOutlined, DeleteColumnOutlined, MergeCellsOutlined,
  SplitCellsOutlined, CloudUploadOutlined,
  ExportOutlined, ImportOutlined, FileMarkdownOutlined,
  ReadOutlined, ThunderboltOutlined,
  StrikethroughOutlined as StrikeIcon,
} from '@ant-design/icons';

// ============================================================
// TIPTAP IMPORTS — Tiptap v3 (named exports only)
// ============================================================
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TiptapTypography from '@tiptap/extension-typography';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Focus from '@tiptap/extension-focus';
import { createLowlight, common } from 'lowlight';
import TurndownService from 'turndown';

// ============================================================
// LOCAL IMPORTS
// ============================================================
import documentService from '../../services/documentService';
import pdfService from '../../services/pdfService';
import DocumentSignature from './DocumentSignature';
import { useTrackChanges } from './useTrackChanges';
import TrackChangesPanel from './TrackChangesPanel';
import EditorRibbon from '../editor/EditorRibbon';
import PDFEditor from '../editor/PDFEditor';
import EditorStatusBar from '../editor/EditorStatusBar';
import '../editor/EditorRibbon.css';
import './DocumentEditor.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

// Lowlight for code blocks
const lowlight = createLowlight(common);

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
  isPdf = false,
  maxWords = null,
  editingSource = 'regular',
}) => {
  // ============================================================
  // STATE — Document metadata
  // ============================================================
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  // ============================================================
  // STATE — Editor UI
  // ============================================================
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [readingMode, setReadingMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [language, setLanguage] = useState('en');
  // ============================================================
  // STATE — Panels / Drawers
  // ============================================================
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findMatches, setFindMatches] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // ============================================================
  // STATE — AI
  // ============================================================
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // ============================================================
  // STATE — Track changes
  // ============================================================
  const [trackChangesEnabled, setTrackChangesEnabled] = useState(false);
  const [trackPanelOpen, setTrackPanelOpen] = useState(false);

  // ============================================================
  // STATE — Signature & modals
  // ============================================================
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  // ============================================================
  // STATE — Ribbon / PDF mode
  // ============================================================
  const [ribbonTab, setRibbonTab] = useState('home');
  const [editorMode, setEditorMode] = useState(
    isPdf || (initialPdfUrl && initialPdfUrl.endsWith('.pdf')) ? 'pdf' : 'html'
  );
  const [activePdfTool, setActivePdfTool] = useState('select');
  const [signaturePlacing, setSignaturePlacing] = useState(false);
  const [showFormPanel, setShowFormPanel] = useState(false);

  // ============================================================
  // REFS
  // ============================================================
  const imageInputRef = useRef(null);
  const importInputRef = useRef(null);
  const autoSaveTimer = useRef(null);
  const pdfEditorRef = useRef(null);
  // Turndown for Markdown export
  const turndown = useMemo(() => new TurndownService({ headingStyle: 'atx' }), []);

  // ============================================================
  // IMAGE PICKER HANDLER (must be before any use in arrays/effects)
  // ============================================================
  const handlePickImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  // ============================================================
  // TIPTAP EDITOR
  // ============================================================
  const updateCounts = useCallback((ed) => {
    if (!ed) return;
    const text = ed.getText() || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);
    setReadTime(Math.ceil(words / 200));
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: false,        // ← ADD
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: 'Start writing…  Type / for commands' }),
      CharacterCount,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      TiptapTypography,
      Subscript,
      Superscript,
      CodeBlockLowlight.configure({ lowlight }),
      Focus.configure({ className: 'has-focus', mode: 'shallowest' }),
    ],
    content: initialContent || '<p></p>',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      updateCounts(editor);
    },
  });

  // ============================================================
  // TRACK CHANGES HOOK
  // ============================================================
  const {
    pendingChanges,
    currentHunks,
    hasUnsavedChange,
    loading: tcLoading,
    saveCurrentChange,
    acceptChange,
    rejectChange,
    deleteChange,
  } = useTrackChanges(editor, documentId, trackChangesEnabled);

  // ============================================================
  // LOAD DOCUMENT
  // ============================================================
  const loadDocument = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const data = await documentService.getDocument(documentId);
      const html = data.content || data.html_content || '<p></p>';
      setTitle(data.title || '');
      setDescription(data.description || '');
      setDocumentType(data.document_type || 'report');
      setModule(data.module || 'general');
      setCategory(data.category || '');
      setTags(Array.isArray(data.tags) ? data.tags : []);
      setVersion(data.version || 1);
      setStatus(data.status || 'draft');
      setPriority(data.priority || 'medium');
      setIsConfidential(data.is_confidential || false);
      setExpiresAt(data.expires_at || null);

      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(html, false);
        updateCounts(editor);
      }
    } catch (err) {
      console.error('Load document failed:', err);
      message.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  }, [documentId, editor, updateCounts]);

  useEffect(() => {
    if (documentId) loadDocument();
  }, [documentId, loadDocument]);

  // ============================================================
  // LOAD VERSIONS / COMMENTS
  // ============================================================
  useEffect(() => {
    if (versionsOpen && documentId) {
      documentService
        .getVersions(documentId)
        .then((d) => setVersions(d.versions || d.data || []))
        .catch(() => {});
    }
  }, [versionsOpen, documentId]);

  useEffect(() => {
    if (commentsOpen && documentId) {
      documentService
        .getComments(documentId)
        .then((d) => setComments(d.comments || d.data || []))
        .catch(() => {});
    }
  }, [commentsOpen, documentId]);

  // ============================================================
  // VALIDATION
  // ============================================================
  const validateTitle = (v) => {
    if (!v || v.trim().length < 3) return 'Title must be at least 3 characters';
    if (v.length > 255) return 'Title cannot exceed 255 characters';
    return null;
  };

  const validateContent = (html) => {
    const txt = (html || '').replace(/<[^>]*>/g, '').trim();
    if (!txt) return 'Content cannot be empty';
    if (txt.length < 10) return 'Content must be at least 10 characters';
    return null;
  };

  // ============================================================
  // SAVE / AUTOSAVE
  // ============================================================
  const handleSave = async () => {
    const tErr = validateTitle(title);
    if (tErr) return message.error(tErr);
    const html = editor?.getHTML() || '';
    const cErr = validateContent(html);
    if (cErr) return message.error(cErr);

    if (maxWords && wordCount > maxWords) {
      return message.error(`Word limit exceeded (${wordCount}/${maxWords})`);
    }

    setSaving(true);
    try {
      if (trackChangesEnabled && hasUnsavedChange) {
        await saveCurrentChange();
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        content: html,
        document_type: documentType,
        module,
        category,
        tags,
        priority,
        is_confidential: isConfidential,
        expires_at: expiresAt,
        company_id: companyId,
        version: documentId ? version + 1 : 1,
        page_size: pageSize,
        orientation,
        editing_source: editingSource,
      };

      let result;
      if (documentId) {
        result = await documentService.updateDocument(documentId, payload);
        message.success('Document updated');
      } else {
        result = await documentService.createDocument(payload);
        message.success('Document created');
      }

      setVersion(documentId ? version + 1 : 1);
      setLastSaved(new Date());
      onSave?.(result);
      onDocumentUpdate?.(result);
    } catch (err) {
      console.error('Save failed:', err);
      message.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsNew = async () => {
    const tErr = validateTitle(title);
    if (tErr) return message.error(tErr);
    setSaving(true);
    try {
      const html = editor?.getHTML() || '';
      const result = await documentService.createDocument({
        title: `${title} (Copy)`,
        description,
        content: html,
        document_type: documentType,
        module,
        category,
        tags,
        priority,
        is_confidential: isConfidential,
        company_id: companyId,
        page_size: pageSize,
        orientation,
        editing_source: editingSource,
      });
      message.success('Saved as new');
      onSave?.(result);
      onDocumentUpdate?.(result);
    } catch (err) {
      message.error(err.message || 'Failed to save copy');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = useCallback(async () => {
    if (!autoSave || !documentId || !title.trim()) return;
    const html = editor?.getHTML() || '';
    if (validateContent(html)) return;
    try {
      await documentService.autoSaveDocument(documentId, {
        content: html,
        title,
        description,
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  }, [autoSave, documentId, title, description, editor]);

  useEffect(() => {
    if (!autoSave) return;
    autoSaveTimer.current = setInterval(handleAutoSave, 30000);
    return () => clearInterval(autoSaveTimer.current);
  }, [autoSave, handleAutoSave]);

  // ============================================================
  // TRACK CHANGES TOGGLE
  // ============================================================
  const toggleTrackChanges = async () => {
    if (trackChangesEnabled) {
      if (hasUnsavedChange) {
        await saveCurrentChange();
      }
      setTrackChangesEnabled(false);
      message.info('Track changes OFF');
    } else {
      setTrackChangesEnabled(true);
      message.info('Track changes ON — edits will be recorded');
    }
  };

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================
  useEffect(() => {
    const h = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindOpen(true);
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setLinkModalVisible(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTrackChanges();
      }
      if (e.key === 'Escape') {
        if (findOpen) setFindOpen(false);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
    
  }, [findOpen]);

  // ============================================================
  // IMAGE / FILE UPLOAD
  // ============================================================
  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      message.error('Only images allowed');
      return;
    }
    setImageUploading(true);
    try {
      const result = await documentService.uploadImage(file);
      const url = result?.url || result?.data?.url;
      if (url && editor) editor.chain().focus().setImage({ src: url }).run();
      message.success('Image inserted');
    } catch (err) {
      console.error(err);
      message.error('Image upload failed');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    try {
      const text = await file.text();
      let html = '';
      if (ext === 'html' || ext === 'htm') {
        html = text;
      } else if (ext === 'md' || ext === 'markdown') {
        html = text
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^- (.*$)/gim, '<li>$1</li>')
          .replace(/\n{2,}/g, '</p><p>')
          .replace(/^/, '<p>')
          .replace(/$/, '</p>');
      } else {
        html = `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
      }
      editor?.commands.setContent(html, false);
      message.success('File imported');
    } catch (err) {
      console.error(err);
      message.error('Import failed');
    } finally {
      e.target.value = '';
    }
  };

  // ============================================================
  // LINK
  // ============================================================
  const handleInsertLink = () => {
    if (!editor || !linkUrl.trim()) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    setLinkModalVisible(false);
    setLinkUrl('');
  };

  // ============================================================
  // FIND & REPLACE
  // ============================================================
  const runFind = () => {
    if (!editor || !findText) return;
    const text = editor.getText();
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex) || [];
    setFindMatches(matches.length);
    message.info(`${matches.length} matches found`);
  };

  const replaceAll = () => {
    if (!editor || !findText) return;
    const html = editor.getHTML();
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const updated = html.replace(regex, replaceText);
    editor.commands.setContent(updated, false);
    message.success('Replaced all matches');
    setFindOpen(false);
  };

  // ============================================================
  // OUTLINE
  // ============================================================
  const outline = useMemo(() => {
    if (!editor) return [];
    const headings = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({ level: node.attrs.level, text: node.textContent, pos });
      }
    });
    return headings;
    
  }, [editor, editor?.state?.doc]);

  const jumpToHeading = (pos) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection(pos).run();
    editor.commands.scrollIntoView();
    setOutlineOpen(false);
  };

  // ============================================================
  // AI
  // ============================================================
  const getPlainText = () => editor?.getText() || '';

  const handleAIEnhance = async () => {
    const txt = getPlainText();
    if (txt.length < 100) return message.warning('Need at least 100 chars');
    setAiLoading(true);
    try {
      const enhanced = await pdfService.enhanceDocumentContent({
        content: txt,
        style: 'professional',
        enhance_level: 'moderate',
      });
      editor.commands.setContent(`<p>${enhanced}</p>`, false);
      message.success('Enhanced');
    } catch {
      message.error('AI enhance failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISummarize = async () => {
    const txt = getPlainText();
    if (txt.length < 200) return message.warning('Need at least 200 chars');
    setAiLoading(true);
    try {
      const summary = await pdfService.summarizeDocument({ content: txt, length: 'medium' });
      Modal.info({ title: 'AI Summary', content: summary, width: 600 });
    } catch {
      message.error('AI summarize failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISuggestion = async () => {
    const txt = getPlainText();
    if (txt.length < 50) return message.warning('Need at least 50 chars');
    setAiLoading(true);
    try {
      const suggestions = await pdfService.getAIEditingSuggestions({
        content: txt,
        context: title,
        document_type: documentType,
      });
      setAiSuggestions(suggestions || []);
      setShowAiPanel(true);
    } catch {
      message.error('AI suggestions failed');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = (sug) => {
    if (!editor) return;
    if (sug.action === 'replace' || sug.action === 'rewrite') {
      editor.commands.setContent(sug.content, false);
    } else if (sug.action === 'insert') {
      editor.commands.insertContent(`<p>${sug.content}</p>`);
    }
    setShowAiPanel(false);
    message.success('AI suggestion applied');
  };

  // ============================================================
  // EXPORT
  // ============================================================
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      const html = editor?.getHTML() || '';
      const blob = await pdfService.exportToPDF({
        content: html,
        title,
        pageSize,
        orientation,
      });
      downloadBlob(blob, `${title || 'document'}.pdf`);
      message.success('Exported PDF');
    } catch {
      message.error('PDF export failed');
    }
  };

  const handleExportWord = async () => {
    try {
      const html = editor?.getHTML() || '';
      const blob = await pdfService.exportToWord({ content: html, title });
      downloadBlob(blob, `${title || 'document'}.docx`);
      message.success('Exported Word');
    } catch {
      message.error('Word export failed');
    }
  };

  const handleExportHTML = () => {
    const html = editor?.getHTML() || '';
    downloadBlob(new Blob([html], { type: 'text/html' }), `${title || 'document'}.html`);
    message.success('Exported HTML');
  };

  const handleExportMarkdown = () => {
    const html = editor?.getHTML() || '';
    const md = turndown.turndown(html);
    downloadBlob(new Blob([md], { type: 'text/markdown' }), `${title || 'document'}.md`);
    message.success('Exported Markdown');
  };

  // ============================================================
  // COMMENTS
  // ============================================================
  const handleAddComment = async () => {
    if (!commentInput.trim() || !documentId) return;
    setCommentLoading(true);
    try {
      await documentService.addComment(documentId, commentInput);
      setCommentInput('');
      const d = await documentService.getComments(documentId);
      setComments(d.comments || d.data || []);
      message.success('Comment added');
    } catch {
      message.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // ============================================================
  // RENDER — RIBBON
  // ============================================================
  const renderRibbon = () => (
    <EditorRibbon
      mode={editorMode}
      activeTab={ribbonTab}
      onTabChange={setRibbonTab}
      documentTitle={title}
      canUndo={editor?.can().undo()}
      canRedo={editor?.can().redo()}
      activeFormats={{
        bold: editor?.isActive('bold'),
        italic: editor?.isActive('italic'),
        underline: editor?.isActive('underline'),
        strike: editor?.isActive('strike'),
        highlight: editor?.isActive('highlight'),
      }}

      // ============================================================
      // ✅ NEW — Hand / Select mode (PDF-XChange "Edit" group)
      // ============================================================
      activeTool={activePdfTool}
      onToolChange={(tool) => setActivePdfTool(tool)}

      // ============================================================
      // ✅ NEW — Search group (opens Find & Replace modal)
      // ============================================================
      onFindReplace={() => setFindOpen(true)}

      // File
      onNew={() => {
        setTitle('');
        editor?.commands.setContent('<p></p>');
      }}
      onOpen={() => importInputRef.current?.click()}
      onSave={handleSave}
      onSaveAs={handleSaveAsNew}
      onExport={(fmt) => {
        if (fmt === 'pdf') handleExportPDF();
        else if (fmt === 'docx') handleExportWord();
        else if (fmt === 'md') handleExportMarkdown();
        else if (fmt === 'html') handleExportHTML();
      }}
      onPrint={() => window.print()}

      // Edit
      onUndo={() => editor?.chain().focus().undo().run()}
      onRedo={() => editor?.chain().focus().redo().run()}
      onCut={() => document.execCommand('cut')}
      onCopy={() => document.execCommand('copy')}
      onPaste={() => {}}

      // Format
      onBold={() => editor?.chain().focus().toggleBold().run()}
      onItalic={() => editor?.chain().focus().toggleItalic().run()}
      onUnderline={() => editor?.chain().focus().toggleUnderline().run()}
      onStrike={() => editor?.chain().focus().toggleStrike().run()}
      onHighlight={() => editor?.chain().focus().toggleHighlight().run()}
      onAlignLeft={() => editor?.chain().focus().setTextAlign('left').run()}
      onAlignCenter={() => editor?.chain().focus().setTextAlign('center').run()}
      onAlignRight={() => editor?.chain().focus().setTextAlign('right').run()}
      onOrderedList={() => editor?.chain().focus().toggleOrderedList().run()}
      onUnorderedList={() => editor?.chain().focus().toggleBulletList().run()}
      onLink={() => setLinkModalVisible(true)}
      onImage={() => imageInputRef.current?.click()}
      onTable={() =>
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      }

      // PDF annotation
      onTextAnnotation={() => setActivePdfTool('text')}
      onRectAnnotation={() => setActivePdfTool('rect')}
      onEllipseAnnotation={() => setActivePdfTool('ellipse')}
      onLineAnnotation={() => setActivePdfTool('line')}
      onStickyNote={() => setActivePdfTool('note')}
      onSignature={() => setSignatureModalVisible(true)}
      onStamp={() => message.info('Stamp tool coming soon')}
      onPlaceSignature={() => setSignaturePlacing(true)}
      onOpenFormPanel={() => setShowFormPanel(true)}

      // Pages (PDF) — events delegated to thumbnail panel
      onInsertPage={() => window.dispatchEvent(new CustomEvent('pdf-page-insert'))}
      onDeletePage={() => window.dispatchEvent(new CustomEvent('pdf-page-delete'))}
      onRotateLeft={() =>
        window.dispatchEvent(new CustomEvent('pdf-page-rotate', { detail: { degrees: -90 } }))
      }
      onRotateRight={() =>
        window.dispatchEvent(new CustomEvent('pdf-page-rotate', { detail: { degrees: 90 } }))
      }

      // View
      onToggleReading={() => setReadingMode(!readingMode)}
      onToggleFocus={() => setFocusMode(!focusMode)}
      readingMode={readingMode}
      focusMode={focusMode}
      onToggleTrack={toggleTrackChanges}
      onOpenTrackPanel={() => setTrackPanelOpen(true)}
      trackChangesEnabled={trackChangesEnabled}
      onOpenOutline={() => setOutlineOpen(true)}
      onOpenComments={() => setCommentsOpen(true)}
      onOpenVersions={() => setVersionsOpen(true)}
      onAIAssist={handleAIEnhance}
      onAISummarize={handleAISummarize}
      onAISuggest={handleAISuggestion}

      // ============================================================
      // ✅ NEW — Actual Size (resets zoom to 100%)
      // ============================================================
      onActualSize={() => message.info('Actual size — 100% zoom')}

      // Zoom (delegated to PDF toolbar)
      onActualSize={() => pdfEditorRef.current?.actualSize()}
      onZoomIn={() => pdfEditorRef.current?.zoomIn()}
      onZoomOut={() => pdfEditorRef.current?.zoomOut()}
      onFitWidth={() => pdfEditorRef.current?.fitWidth()}
      onFitPage={() => pdfEditorRef.current?.fitPage()}
      onStamp={() => setActivePdfTool('stamp')}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
    />
  );
  // ============================================================
  // RENDER — METADATA PANEL
  // ============================================================
  const renderMetadata = () => (
    <Collapse defaultActiveKey={['meta']} ghost>
      <Panel header="Document Metadata" key="meta">
        <Form layout="vertical" size="small">
          <Form.Item
            label="Title"
            required
            validateStatus={validateTitle(title) ? 'error' : 'success'}
            help={validateTitle(title) || ''}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              showCount
            />
          </Form.Item>

          <Form.Item label="Description">
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="Type">
                <Select value={documentType} onChange={setDocumentType}>
                  <Option value="report">Report</Option>
                  <Option value="policy">Policy</Option>
                  <Option value="record">Record</Option>
                  <Option value="hse_report">HSE</Option>
                  <Option value="permit">Permit</Option>
                  <Option value="technical">Technical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Module">
                <Select value={module} onChange={setModule}>
                  <Option value="general">General</Option>
                  <Option value="hse">HSE</Option>
                  <Option value="environmental">Environmental</Option>
                  <Option value="quality">Quality</Option>
                  <Option value="hospital">Hospital</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="Category">
                <Select value={category} onChange={setCategory} allowClear>
                  <Option value="safety">Safety</Option>
                  <Option value="compliance">Compliance</Option>
                  <Option value="technical">Technical</Option>
                  <Option value="medical">Medical</Option>
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

          <Form.Item label="Tags">
            <Select mode="tags" value={tags} onChange={setTags} placeholder="Add tags" />
          </Form.Item>

          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="Page Size">
                <Select value={pageSize} onChange={setPageSize}>
                  <Option value="a4">A4</Option>
                  <Option value="letter">Letter</Option>
                  <Option value="legal">Legal</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Orientation">
                <Select value={orientation} onChange={setOrientation}>
                  <Option value="portrait">Portrait</Option>
                  <Option value="landscape">Landscape</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Expiry Date">
            <DatePicker
              value={expiresAt}
              onChange={setExpiresAt}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="Confidential">
                <Switch checked={isConfidential} onChange={setIsConfidential} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status">
                <Tag>{status.toUpperCase()}</Tag>
                {documentId && <Tag color="blue">v{version}</Tag>}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Panel>
    </Collapse>
  );

  // ============================================================
  // RENDER — MAIN
  // ============================================================
  if (loading) {
    return (
      <div className="document-editor-loading">
        <Spin size="large" />
      </div>
    );
  }

  const editorClass = [
    'document-editor-content',
    readingMode ? 'reading-mode' : '',
    focusMode ? 'focus-mode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className={`document-editor-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
        <Card className="editor-card" bordered={false}>
          {/* ============================================================ */}
          {/* HEADER */}
          {/* ============================================================ */}
          <div className="editor-header">
            <div className="editor-header-title">
              <Title level={4} style={{ margin: 0 }}>
                {documentId ? 'Edit Document' : 'New Document'}
              </Title>
              {documentId && <Tag color="blue">v{version}</Tag>}
              {readingMode && <Tag icon={<ReadOutlined />} color="purple">Reading</Tag>}
              {focusMode && <Tag icon={<EyeOutlined />} color="cyan">Focus</Tag>}
            </div>

            <div className="editor-header-actions">
              {onCancel && (
                <Button icon={<CloseOutlined />} onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {documentId && (
                <>
                  <Button icon={<CopyOutlined />} onClick={handleSaveAsNew} loading={saving}>
                    Save As
                  </Button>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => onDocumentUpdate?.({ id: documentId })}
                  >
                    View
                  </Button>
                  <Button
                    icon={<SignatureOutlined />}
                    onClick={() => setSignatureModalVisible(true)}
                  >
                    Sign
                  </Button>
                </>
              )}

              <Tooltip title="Import file (HTML, MD, TXT)">
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => importInputRef.current?.click()}
                />
              </Tooltip>

              <Dropdown
                menu={{
                  items: [
                    { key: 'pdf', label: 'Export as PDF', icon: <FilePdfOutlined />, onClick: handleExportPDF },
                    { key: 'word', label: 'Export as Word', icon: <FileWordOutlined />, onClick: handleExportWord },
                    { key: 'html', label: 'Export as HTML', icon: <FileTextOutlined />, onClick: handleExportHTML },
                    { key: 'md', label: 'Export as Markdown', icon: <FileMarkdownOutlined />, onClick: handleExportMarkdown },
                  ],
                }}
              >
                <Button icon={<ExportOutlined />}>Export</Button>
              </Dropdown>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
              >
                {documentId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* ============================================================ */}
          {/* BODY */}
          {/* ============================================================ */}
          <div className="editor-body">
            {/* Ribbon */}
            {renderRibbon()}

            {/* Editor area — PDF or HTML */}
            {editorMode === 'pdf' && (initialPdfUrl || documentId) ? (
              <PDFEditor
                ref={pdfEditorRef}
                pdfUrl={initialPdfUrl}
                documentId={documentId}
                activeTool={activePdfTool}
                signaturePlacing={signaturePlacing}
                onSignaturePlacingChange={setSignaturePlacing}
                showFormPanel={showFormPanel}
                onShowFormPanelChange={setShowFormPanel}
                onSave={(blob) => {
                  const file = new File(
                    [blob],
                    `${title || 'document'}-annotated.pdf`,
                    { type: 'application/pdf' }
                  );
                  if (onSave) onSave({ file, title, isPdf: true });
                }}
                onClose={() => setEditorMode('html')}
              />
            ) : (
              <div className="editor-wrapper">
                <EditorContent editor={editor} className={editorClass} />
              </div>
            )}

            {/* ---------- Status bar (Word-style) ---------- */}
<EditorStatusBar
  wordCount={wordCount}
  charCount={charCount}
  readTime={readTime}
  mode={editorMode}
  pageNumber={1}                 /* wired later when PDF thumbnails sync */
  totalPages={1}                 /* wired later when PDF thumbnails sync */
  onPageChange={() => {}}        /* wired later when PDF thumbnails sync */
  zoom={zoom}
  onZoomChange={setZoom}
  language={language}
  onLanguageChange={setLanguage}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
  lastSaved={lastSaved}
  isSaving={saving}
  readingMode={readingMode}
  focusMode={focusMode}
  trackChangesEnabled={trackChangesEnabled}
  currentSection={
    outline.length > 0 && editor
      ? (() => {
          // Find the heading closest before the cursor
          const pos = editor.state.selection.from;
          let current = null;
          for (const h of outline) {
            if (h.pos <= pos) current = h.text;
          }
          return current;
        })()
      : null
  }
/>

            {/* Metadata */}
            {!readingMode && !focusMode && (
              <div className="editor-metadata-section">{renderMetadata()}</div>
            )}
          </div>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* HIDDEN FILE INPUTS */}
      {/* ============================================================ */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelected}
      />
      <input
        ref={importInputRef}
        type="file"
        accept=".html,.htm,.md,.markdown,.txt"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

      {/* ============================================================ */}
      {/* FIND & REPLACE MODAL */}
      {/* ============================================================ */}
      <Modal
        title="Find & Replace"
        open={findOpen}
        onCancel={() => setFindOpen(false)}
        footer={[
          <Button key="find" onClick={runFind}>
            Find
          </Button>,
          <Button key="replaceAll" type="primary" onClick={replaceAll}>
            Replace All
          </Button>,
        ]}
      >
        <Input
          placeholder="Find"
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Input
          placeholder="Replace with"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        {findMatches > 0 && <Text type="secondary">{findMatches} matches</Text>}
      </Modal>

      {/* ============================================================ */}
      {/* LINK MODAL */}
      {/* ============================================================ */}
      <Modal
        title="Insert / Edit Link"
        open={linkModalVisible}
        onCancel={() => {
          setLinkModalVisible(false);
          setLinkUrl('');
        }}
        onOk={handleInsertLink}
      >
        <Input
          placeholder="https://example.com"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
      </Modal>

      {/* ============================================================ */}
      {/* OUTLINE DRAWER */}
      {/* ============================================================ */}
      <Drawer
        title="Document Outline"
        placement="right"
        open={outlineOpen}
        onClose={() => setOutlineOpen(false)}
        width={320}
      >
        {outline.length === 0 ? (
          <Empty description="No headings yet" />
        ) : (
          <List
            dataSource={outline}
            renderItem={(h) => (
              <List.Item
                style={{ paddingLeft: (h.level - 1) * 12, cursor: 'pointer' }}
                onClick={() => jumpToHeading(h.pos)}
              >
                <Text strong={h.level <= 2}>{h.text || '(empty heading)'}</Text>
              </List.Item>
            )}
          />
        )}
      </Drawer>

      {/* ============================================================ */}
      {/* COMMENTS DRAWER */}
      {/* ============================================================ */}
      <Drawer
        title={`Comments (${comments.length})`}
        placement="right"
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        width={420}
      >
        <List
          dataSource={comments}
          locale={{ emptyText: 'No comments yet' }}
          renderItem={(c) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<SignatureOutlined />} />}
                title={c.user?.name || c.created_by?.name || 'User'}
                description={
                  <div>
                    <div>{c.content}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <Divider />
        <TextArea
          rows={3}
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Add a comment…"
        />
        <Button
          type="primary"
          block
          style={{ marginTop: 8 }}
          loading={commentLoading}
          onClick={handleAddComment}
        >
          Post Comment
        </Button>
      </Drawer>

      {/* ============================================================ */}
      {/* VERSIONS DRAWER */}
      {/* ============================================================ */}
      <Drawer
        title={`Versions (${versions.length})`}
        placement="right"
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        width={420}
      >
        {versions.length === 0 ? (
          <Empty description="No versions yet" />
        ) : (
          <List
            dataSource={versions}
            renderItem={(v) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      v{v.version} {v.is_current && <Tag color="green">Current</Tag>}
                    </Space>
                  }
                  description={
                    <div>
                      <div>{v.changes || 'No changes recorded'}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                        {v.created_at ? new Date(v.created_at).toLocaleString() : ''}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>

      {/* ============================================================ */}
      {/* AI SUGGESTIONS DRAWER */}
      {/* ============================================================ */}
      <Drawer
        title={
          <Space>
            <RobotOutlined /> AI Suggestions
          </Space>
        }
        placement="right"
        open={showAiPanel}
        onClose={() => setShowAiPanel(false)}
        width={400}
      >
        {aiSuggestions.length === 0 ? (
          <Empty description="No suggestions" />
        ) : (
          <List
            dataSource={aiSuggestions}
            renderItem={(s) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => applyAISuggestion(s)}
                  >
                    Apply
                  </Button>,
                ]}
              >
                <List.Item.Meta title={s.title} description={s.description} />
              </List.Item>
            )}
          />
        )}
      </Drawer>

      {/* ============================================================ */}
      {/* TRACK CHANGES PANEL */}
      {/* ============================================================ */}
      <TrackChangesPanel
        open={trackPanelOpen}
        onClose={() => setTrackPanelOpen(false)}
        pendingChanges={pendingChanges}
        currentHunks={currentHunks}
        hasUnsavedChange={hasUnsavedChange}
        onAccept={async (id) => {
          await acceptChange(id);
          if (documentId) loadDocument();
          message.success('Change accepted');
        }}
        onReject={async (id) => {
          await rejectChange(id);
          message.success('Change rejected');
        }}
        onDelete={async (id) => {
          await deleteChange(id);
          message.success('Change deleted');
        }}
        onSaveCurrent={async () => {
          const c = await saveCurrentChange();
          if (c) message.success('Change set saved');
          else message.info('No changes to save');
        }}
        loading={tcLoading}
      />

      {/* ============================================================ */}
      {/* SIGNATURE MODAL */}
      {/* ============================================================ */}
      <Modal
        title="Sign Document"
        open={signatureModalVisible}
        onCancel={() => setSignatureModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        styles={{
          body: { padding: 16, maxHeight: 'calc(100vh - 200px)', overflow: 'auto' },
        }}
        destroyOnClose
      >
        <DocumentSignature
          documentId={documentId}
          documentTitle={title}
          onSignatureComplete={() => {
            setSignatureModalVisible(false);
            onDocumentUpdate?.({ id: documentId });
          }}
          companyId={companyId}
          currentUser={currentUser}
        />
      </Modal>
    </>
  );
};

export default DocumentEditor;
