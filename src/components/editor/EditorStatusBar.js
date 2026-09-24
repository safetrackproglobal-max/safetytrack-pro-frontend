// src/components/documents/editor/EditorStatusBar.jsx
// Word-style status bar shown at the bottom of the document editor.
// Displays: words, chars, page, zoom, language, page size, saved state.

import React from 'react';
import { Space, Tag, Select, Divider, Tooltip } from 'antd';
import {
  FileTextOutlined,
  ZoomInOutlined,
  GlobalOutlined,
  FileOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ReadOutlined,
  EyeOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

const EditorStatusBar = ({
  // Counts
  wordCount = 0,
  charCount = 0,
  readTime = 0,

  // Paging (PDF mode)
  mode = 'html',              // 'html' | 'pdf'
  pageNumber = 1,
  totalPages = 1,
  onPageChange,

  // Zoom
  zoom = 100,
  onZoomChange,

  // Language
  language = 'en',
  onLanguageChange,

  // Page setup
  pageSize = 'a4',
  onPageSizeChange,

  // Save state
  lastSaved = null,
  isSaving = false,

  // Modes
  readingMode = false,
  focusMode = false,
  trackChangesEnabled = false,

  // Optional current section (from outline)
  currentSection = null,
}) => {
  return (
    <div className="editor-status-bar">
      <Space size={10} split={<Divider type="vertical" />} wrap>
        {/* ---------- Word / char / read ---------- */}
        <Tooltip title="Word count">
          <span className="editor-status-item">
            <FileTextOutlined /> {wordCount} words
          </span>
        </Tooltip>

        <span className="editor-status-item">{charCount} chars</span>

        <span className="editor-status-item">{readTime} min read</span>

        {/* ---------- Page navigation (PDF only) ---------- */}
        {mode === 'pdf' && (
          <Space size={4} className="editor-status-item">
            <span>Page</span>
            <Select
              size="small"
              variant="borderless"
              value={pageNumber}
              onChange={onPageChange}
              style={{ width: 70 }}
              options={Array.from({ length: totalPages }, (_, i) => ({
                value: i + 1,
                label: String(i + 1),
              }))}
            />
            <span>of {totalPages}</span>
          </Space>
        )}

        {/* ---------- Zoom ---------- */}
        <Space size={4} className="editor-status-item">
          <ZoomInOutlined />
          <Select
            size="small"
            variant="borderless"
            value={zoom}
            onChange={onZoomChange}
            style={{ width: 72 }}
            options={[
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 100, label: '100%' },
              { value: 125, label: '125%' },
              { value: 150, label: '150%' },
              { value: 200, label: '200%' },
            ]}
          />
        </Space>

        {/* ---------- Language ---------- */}
        <Space size={4} className="editor-status-item">
          <GlobalOutlined />
          <Select
            size="small"
            variant="borderless"
            value={language}
            onChange={onLanguageChange}
            style={{ width: 110 }}
            options={[
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'Français' },
              { value: 'es', label: 'Español' },
              { value: 'ar', label: 'العربية' },
            ]}
          />
        </Space>

        {/* ---------- Page size ---------- */}
        <Select
          size="small"
          variant="borderless"
          value={pageSize}
          onChange={onPageSizeChange}
          style={{ width: 82 }}
          className="editor-status-item"
          options={[
            { value: 'a4', label: 'A4' },
            { value: 'letter', label: 'Letter' },
            { value: 'legal', label: 'Legal' },
          ]}
        />

        {/* ---------- Current section (from outline) ---------- */}
        {currentSection && (
          <Tooltip title="Current section">
            <span className="editor-status-item">
              <FileOutlined /> {currentSection}
            </span>
          </Tooltip>
        )}
      </Space>

      {/* ---------- Right side: mode + save state ---------- */}
      <Space size={8}>
        {readingMode && (
          <Tag icon={<ReadOutlined />} color="purple">
            Reading
          </Tag>
        )}
        {focusMode && (
          <Tag icon={<EyeOutlined />} color="cyan">
            Focus
          </Tag>
        )}
        {trackChangesEnabled && (
          <Tag icon={<HistoryOutlined />} color="orange">
            Tracking
          </Tag>
        )}

        {isSaving ? (
          <Tag icon={<SyncOutlined spin />} color="processing">
            Saving…
          </Tag>
        ) : lastSaved ? (
          <Tooltip title={lastSaved.toLocaleString()}>
            <Tag icon={<CheckCircleOutlined />} color="green">
              Saved {lastSaved.toLocaleTimeString()}
            </Tag>
          </Tooltip>
        ) : null}
      </Space>
    </div>
  );
};

export default EditorStatusBar;