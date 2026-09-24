// src/components/documents/editor/EditorRibbon.jsx
// PDF-XChange-style ribbon for the document editor

import React from 'react';
import {
  Menu, Dropdown, Button, Space, Tooltip, Divider, Tabs
} from 'antd';
import {
  FileOutlined, EditOutlined, EyeOutlined, PlusOutlined,
  FormatPainterOutlined, ToolOutlined, QuestionCircleOutlined,
  SaveOutlined, FolderOpenOutlined, ExportOutlined,
  PrinterOutlined, UndoOutlined, RedoOutlined, CopyOutlined,
  ScissorOutlined, SnippetsOutlined, BoldOutlined, ItalicOutlined,
  UnderlineOutlined, StrikethroughOutlined, AlignLeftOutlined,
  AlignCenterOutlined, AlignRightOutlined, OrderedListOutlined,
  UnorderedListOutlined, LinkOutlined, PictureOutlined,
  TableOutlined, HighlightOutlined, MessageOutlined,
  EditOutlined as EditIcon, BorderOutlined, MinusOutlined,
  ZoomInOutlined, ZoomOutOutlined, ExpandOutlined,
  CompressOutlined, RotateLeftOutlined, RotateRightOutlined,
  DeleteOutlined, FileAddOutlined, BgColorsOutlined,
   SignatureOutlined, FilePdfOutlined,
  FileTextOutlined, FileMarkdownOutlined,
} from '@ant-design/icons';

const { SubMenu } = Menu;

/**
 * Ribbon toolbar + menu bar for the document editor.
 * Renders above the actual editor area.
 */
const EditorRibbon = ({
  // Actions
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onExport,
  onPrint,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  // Formatting
  onBold,
  onItalic,
  onPlaceSignature,      // NEW
  onOpenFormPanel,       // NEW
  onUnderline,
  onStrike,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onOrderedList,
  onUnorderedList,
  onLink,
  onImage,
  onTable,
  onHighlight,
  // Annotate (PDF)
  onTextAnnotation,
  onRectAnnotation,
  onEllipseAnnotation,
  onLineAnnotation,
  onStickyNote,
  onSignature,
  onStamp,
  // Pages
  onInsertPage,
  onDeletePage,
  onRotateLeft,
  onRotateRight,
  // View
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitPage,
  
  // ...existing props...
  onToggleReading,
  onToggleFocus,
  onToggleTrack,
  onOpenTrackPanel,
  onOpenOutline,
  onOpenComments,
  onOpenVersions,
  onAIAssist,
  onAISummarize,
  onAISuggest,
  trackChangesEnabled,
  readingMode,
  focusMode,
  onToggleFullscreen,
  // State
  activeTab = 'home',
  onTabChange,
  mode = 'html',        // 'html' | 'pdf'
  readOnly = false,
  documentTitle,
  // Optional computed state
  canUndo = false,
  canRedo = false,
  activeFormats = {}
}) => {
  const isPdf = mode === 'pdf';

  // ============================================================
  // MENU BAR
  // ============================================================
  const menuBar = (
    <div className="editor-menubar">
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'new', icon: <FileAddOutlined />, label: 'New Document', onClick: onNew },
            { key: 'open', icon: <FolderOpenOutlined />, label: 'Open…', onClick: onOpen },
            { type: 'divider' },
            { key: 'save', icon: <SaveOutlined />, label: 'Save (Ctrl+S)', onClick: onSave },
            { key: 'saveas', icon: <SaveOutlined />, label: 'Save As…', onClick: onSaveAs },
            { type: 'divider' },
            { key: 'pdf', icon: <FilePdfOutlined />, label: 'Export as PDF', onClick: () => onExport('pdf') },
            { key: 'docx', icon: <FileTextOutlined />, label: 'Export as Word', onClick: () => onExport('docx') },
            { key: 'md', icon: <FileMarkdownOutlined />, label: 'Export as Markdown', onClick: () => onExport('md') },
            { key: 'html', icon: <FileTextOutlined />, label: 'Export as HTML', onClick: () => onExport('html') },
            { type: 'divider' },
            { key: 'print', icon: <PrinterOutlined />, label: 'Print (Ctrl+P)', onClick: onPrint }
          ]
        }}
      >
        <span className="editor-menubar-item">File</span>
      </Dropdown>

      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'undo', icon: <UndoOutlined />, label: 'Undo (Ctrl+Z)', disabled: !canUndo, onClick: onUndo },
            { key: 'redo', icon: <RedoOutlined />, label: 'Redo (Ctrl+Y)', disabled: !canRedo, onClick: onRedo },
            { type: 'divider' },
            { key: 'cut', icon: <ScissorOutlined />, label: 'Cut (Ctrl+X)', onClick: onCut },
            { key: 'copy', icon: <CopyOutlined />, label: 'Copy (Ctrl+C)', onClick: onCopy },
            { key: 'paste', icon: <SnippetsOutlined />, label: 'Paste (Ctrl+V)', onClick: onPaste }
          ]
        }}
      >
        <span className="editor-menubar-item">Edit</span>
      </Dropdown>

      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'zin', icon: <ZoomInOutlined />, label: 'Zoom In (Ctrl++)', onClick: onZoomIn },
            { key: 'zout', icon: <ZoomOutOutlined />, label: 'Zoom Out (Ctrl+-)', onClick: onZoomOut },
            { type: 'divider' },
            { key: 'fitw', label: 'Fit Width', onClick: onFitWidth },
            { key: 'fitp', label: 'Fit Page', onClick: onFitPage },
            { type: 'divider' },
            { key: 'full', icon: <ExpandOutlined />, label: 'Fullscreen (F11)', onClick: onToggleFullscreen }
          ]
        }}
      >
        <span className="editor-menubar-item">View</span>
      </Dropdown>

      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'link', icon: <LinkOutlined />, label: 'Link (Ctrl+K)', onClick: onLink },
            { key: 'image', icon: <PictureOutlined />, label: 'Image', onClick: onImage },
            { key: 'table', icon: <TableOutlined />, label: 'Table', onClick: onTable },
            { type: 'divider' },
            ...(isPdf ? [
              { key: 'page', icon: <FileAddOutlined />, label: 'Insert Page', onClick: onInsertPage },
              { key: 'text-ann', icon: <EditIcon />, label: 'Text Annotation', onClick: onTextAnnotation },
              { key: 'rect-ann', icon: <BorderOutlined />, label: 'Rectangle', onClick: onRectAnnotation }
            ] : [])
          ]
        }}
      >
        <span className="editor-menubar-item">Insert</span>
      </Dropdown>

      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'bold', label: 'Bold (Ctrl+B)', onClick: onBold },
            { key: 'italic', label: 'Italic (Ctrl+I)', onClick: onItalic },
            { key: 'underline', label: 'Underline (Ctrl+U)', onClick: onUnderline },
            { key: 'strike', label: 'Strikethrough', onClick: onStrike },
            { type: 'divider' },
            { key: 'hl', icon: <HighlightOutlined />, label: 'Highlight', onClick: onHighlight }
          ]
        }}
      >
        <span className="editor-menubar-item">Format</span>
      </Dropdown>

      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'sig', icon: <SignatureOutlined />, label: 'Signature', onClick: onSignature },
            { key: 'stamp', icon: <EditOutlined />, label: 'Stamp', onClick: onStamp },
            { type: 'divider' },
            { key: 'bg', icon: <BgColorsOutlined />, label: 'Watermark / Background', disabled: true }
          ]
        }}
      >
        <span className="editor-menubar-item">Tools</span>
      </Dropdown>

      <span className="editor-menubar-item editor-menubar-help">
        <QuestionCircleOutlined /> Help
      </span>
    </div>
  );

  // ============================================================
  // RIBBON GROUP — helper
  // ============================================================
  const Group = ({ title, children }) => (
    <div className="editor-ribbon-group">
      <div className="editor-ribbon-group-content">{children}</div>
      <div className="editor-ribbon-group-label">{title}</div>
    </div>
  );

  const BigBtn = ({ icon, label, onClick, disabled, active, danger }) => (
    <Tooltip title={label}>
      <button
        type="button"
        className={`editor-ribbon-btn-big ${active ? 'active' : ''} ${danger ? 'danger' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        <span className="editor-ribbon-btn-icon">{icon}</span>
        <span className="editor-ribbon-btn-label">{label}</span>
      </button>
    </Tooltip>
  );

  const SmallBtn = ({ icon, tooltip, onClick, disabled, active }) => (
    <Tooltip title={tooltip}>
      <button
        type="button"
        className={`editor-ribbon-btn-small ${active ? 'active' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
      </button>
    </Tooltip>
  );

  // ============================================================
  // RIBBON TABS — content
  // ============================================================
  const renderHomeTab = () => (
    <div className="editor-ribbon-content">
      <Group title="Clipboard">
        <BigBtn icon={<SnippetsOutlined />} label="Paste" onClick={onPaste} />
        <div className="editor-ribbon-stack">
          <SmallBtn icon={<ScissorOutlined />} tooltip="Cut" onClick={onCut} />
          <SmallBtn icon={<CopyOutlined />} tooltip="Copy" onClick={onCopy} />
        </div>
      </Group>

      <Group title="Undo">
        <BigBtn icon={<UndoOutlined />} label="Undo" onClick={onUndo} disabled={!canUndo} />
        <BigBtn icon={<RedoOutlined />} label="Redo" onClick={onRedo} disabled={!canRedo} />
      </Group>

      <Group title="Font">
        <div className="editor-ribbon-stack">
          <div className="editor-ribbon-row">
            <SmallBtn icon={<BoldOutlined />} tooltip="Bold" onClick={onBold} active={activeFormats.bold} />
            <SmallBtn icon={<ItalicOutlined />} tooltip="Italic" onClick={onItalic} active={activeFormats.italic} />
            <SmallBtn icon={<UnderlineOutlined />} tooltip="Underline" onClick={onUnderline} active={activeFormats.underline} />
          </div>
          <div className="editor-ribbon-row">
            <SmallBtn icon={<StrikethroughOutlined />} tooltip="Strike" onClick={onStrike} active={activeFormats.strike} />
            <SmallBtn icon={<HighlightOutlined />} tooltip="Highlight" onClick={onHighlight} active={activeFormats.highlight} />
          </div>
        </div>
      </Group>

      <Group title="Paragraph">
        <div className="editor-ribbon-stack">
          <div className="editor-ribbon-row">
            <SmallBtn icon={<AlignLeftOutlined />} tooltip="Align Left" onClick={onAlignLeft} />
            <SmallBtn icon={<AlignCenterOutlined />} tooltip="Center" onClick={onAlignCenter} />
            <SmallBtn icon={<AlignRightOutlined />} tooltip="Align Right" onClick={onAlignRight} />
          </div>
          <div className="editor-ribbon-row">
            <SmallBtn icon={<UnorderedListOutlined />} tooltip="Bullet List" onClick={onUnorderedList} />
            <SmallBtn icon={<OrderedListOutlined />} tooltip="Ordered List" onClick={onOrderedList} />
          </div>
        </div>
      </Group>

      <Group title="Insert">
        <BigBtn icon={<LinkOutlined />} label="Link" onClick={onLink} />
        <BigBtn icon={<PictureOutlined />} label="Image" onClick={onImage} />
        <BigBtn icon={<TableOutlined />} label="Table" onClick={onTable} />
      </Group>
    </div>
  );

  const renderInsertTab = () => (
    <div className="editor-ribbon-content">
      <Group title="Pages">
        <BigBtn icon={<FileAddOutlined />} label="Insert Page" onClick={onInsertPage} />
        <BigBtn icon={<DeleteOutlined />} label="Delete Page" onClick={onDeletePage} danger />
        <BigBtn icon={<RotateLeftOutlined />} label="Rotate Left" onClick={onRotateLeft} />
        <BigBtn icon={<RotateRightOutlined />} label="Rotate Right" onClick={onRotateRight} />
      </Group>

      <Group title="Media">
        <BigBtn icon={<PictureOutlined />} label="Image" onClick={onImage} />
        <BigBtn icon={<TableOutlined />} label="Table" onClick={onTable} />
        <BigBtn icon={<LinkOutlined />} label="Link" onClick={onLink} />
      </Group>
    </div>
  );

  const renderAnnotateTab = () => (
    <div className="editor-ribbon-content">
      <Group title="Markup">
        <BigBtn
          icon={<HighlightOutlined />}
          label="Highlight"
          onClick={onHighlight}
        />
        <BigBtn
          icon={<EditIcon />}
          label="Text Box"
          onClick={onTextAnnotation}
        />
        <BigBtn
          icon={<MessageOutlined />}
          label="Sticky Note"
          onClick={onStickyNote}
        />
      </Group>

      <Group title="Shapes">
        <BigBtn icon={<BorderOutlined />} label="Rectangle" onClick={onRectAnnotation} />
        <BigBtn icon={<MinusOutlined />} label="Line" onClick={onLineAnnotation} />
        <BigBtn icon={<div className="editor-ribbon-shape-circle" />} label="Ellipse" onClick={onEllipseAnnotation} />
      </Group>

      <Group title="Sign & Stamp">
        <BigBtn icon={<SignatureOutlined />} label="Signature" onClick={onSignature} />
        <BigBtn icon={<EditOutlined />} label="Stamp" onClick={onStamp} />
      </Group>

      {/* NEW: Forms group (added as requested) */}
      <Group title="Forms">
        <BigBtn
          icon={<SignatureOutlined />}
          label="Sign PDF"
          onClick={() => onPlaceSignature?.()}
        />
        <BigBtn
          icon={<EditIcon />}
          label="Fill Form"
          onClick={() => onOpenFormPanel?.()}
        />
      </Group>
    </div>
  );

  const renderPagesTab = () => (
    <div className="editor-ribbon-content">
      <Group title="Manage">
        <BigBtn icon={<FileAddOutlined />} label="Insert" onClick={onInsertPage} />
        <BigBtn icon={<DeleteOutlined />} label="Delete" onClick={onDeletePage} danger />
      </Group>

      <Group title="Rotate">
        <BigBtn icon={<RotateLeftOutlined />} label="Left" onClick={onRotateLeft} />
        <BigBtn icon={<RotateRightOutlined />} label="Right" onClick={onRotateRight} />
      </Group>
    </div>
  );

  const renderViewTab = () => (
    <div className="editor-ribbon-content">
      <Group title="Zoom">
        <BigBtn icon={<ZoomInOutlined />} label="Zoom In" onClick={onZoomIn} />
        <BigBtn icon={<ZoomOutOutlined />} label="Zoom Out" onClick={onZoomOut} />
      </Group>

      <Group title="Layout">
        <BigBtn icon={<ExpandOutlined />} label="Fit Width" onClick={onFitWidth} />
        <BigBtn icon={<CompressOutlined />} label="Fit Page" onClick={onFitPage} />
      </Group>

      <Group title="Window">
        <BigBtn icon={<ExpandOutlined />} label="Fullscreen" onClick={onToggleFullscreen} />
      </Group>
    </div>
  );

  const renderReviewTab = () => (
    <div className="editor-ribbon-content">
      <Group title="Comments">
        <BigBtn icon={<MessageOutlined />} label="New Comment" onClick={onStickyNote} />
      </Group>
      <Group title="Signatures">
        <BigBtn icon={<SignatureOutlined />} label="Sign" onClick={onSignature} />
      </Group>

      {/* NEW: Forms group (added as requested) */}
      <Group title="Forms">
        <BigBtn
          icon={<SignatureOutlined />}
          label="Sign PDF"
          onClick={() => onPlaceSignature?.()}
        />
        <BigBtn
          icon={<EditIcon />}
          label="Fill Form"
          onClick={() => onOpenFormPanel?.()}
        />
      </Group>
    </div>
  );

  const tabsContent = {
    home: renderHomeTab(),
    insert: renderInsertTab(),
    annotate: renderAnnotateTab(),
    pages: renderPagesTab(),
    review: renderReviewTab(),
    view: renderViewTab()
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="editor-ribbon">
      {/* Menu bar */}
      {menuBar}

      {/* Ribbon tabs */}
      <div className="editor-ribbon-tabs">
        {[
          { key: 'home', label: 'Home' },
          { key: 'insert', label: 'Insert' },
          { key: 'annotate', label: 'Annotate' },
          { key: 'pages', label: 'Pages' },
          { key: 'review', label: 'Review' },
          { key: 'view', label: 'View' }
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            className={`editor-ribbon-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => onTabChange?.(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Ribbon body */}
      <div className="editor-ribbon-body">
        {tabsContent[activeTab] || tabsContent.home}
      </div>
    </div>
  );
};

export default EditorRibbon;