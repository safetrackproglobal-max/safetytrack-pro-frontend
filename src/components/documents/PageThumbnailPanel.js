// src/components/documents/editor/PageThumbnailPanel.jsx
// Visual grid of PDF page thumbnails with drag-to-reorder, rotate, delete

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Button, Space, Tooltip, message, Popconfirm, Checkbox, Spin, Empty
} from 'antd';
import {
  RotateLeftOutlined, RotateRightOutlined,
  DeleteOutlined, PlusOutlined, ExportOutlined,
  DragOutlined, CheckOutlined, CloseOutlined
} from '@ant-design/icons';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../../services/api';  
import documentService from '../../services/documentService';

const PageThumbnailPanel = ({
  documentId,
  onDocumentChange,   // callback(newDoc) after any operation
  onPageClick,        // callback(pageNumber) — sync with main viewer
  activePage = 1,
}) => {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([]);     // [{ num, thumbUrl, width, height, rotation }]
  const [selected, setSelected] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [order, setOrder] = useState([]);     // local reorder preview
  const [busy, setBusy] = useState(false);

  const containerRef = useRef(null);

  // ============================================================
  // LOAD THUMBNAILS
  // ============================================================
  const loadPages = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const res = await api.get(`/documents/${documentId}/raw`, {
        responseType: 'arraybuffer'
      });
      const loadingTask = pdfjsLib.getDocument({ data: res.data });
      const pdf = await loadingTask.promise;
      const total = pdf.numPages;
      const thumbs = [];

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push({
          num: i,
          thumbUrl: canvas.toDataURL('image/jpeg', 0.7),
          width: viewport.width,
          height: viewport.height,
          rotation: 0,
        });
      }

      setPages(thumbs);
      setOrder(thumbs.map((t) => t.num));
    } catch (err) {
      console.error('Failed to load thumbnails:', err);
      message.error('Failed to load page thumbnails');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => { loadPages(); }, [loadPages]);

  // ============================================================
  // SELECTION
  // ============================================================
  const toggleSelect = (num) => {
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };
  const clearSelection = () => setSelected([]);

  // ============================================================
  // DRAG-TO-REORDER
  // ============================================================
  const onDragStart = (idx) => (e) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };
  const onDragOver = (idx) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(idx);
  };
  const onDragLeave = () => setDragOverIndex(null);
  const onDrop = (idx) => (e) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(idx, 0, moved);
    setOrder(newOrder);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ============================================================
  // OPERATIONS
  // ============================================================
  const runOp = async (fn, successMsg) => {
    setBusy(true);
    try {
      const res = await fn();
      if (res?.success) {
        message.success(successMsg || 'Done');
        onDocumentChange?.(res.document);
        // Reload thumbnails
        await loadPages();
      } else {
        message.error(res?.error || 'Operation failed');
      }
    } catch (err) {
      message.error(err.message || 'Operation failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRotateLeft = () =>
    runOp(
      () => documentService.rotatePdfPages(documentId, selected, -90),
      `Rotated ${selected.length} page(s) left`
    );

  const handleRotateRight = () =>
    runOp(
      () => documentService.rotatePdfPages(documentId, selected, 90),
      `Rotated ${selected.length} page(s) right`
    );

  const handleDelete = () =>
    runOp(
      () => documentService.deletePdfPages(documentId, selected),
      `Deleted ${selected.length} page(s)`
    );

  const handleApplyOrder = () => {
    // Verify it changed
    const originalOrder = pages.map((p) => p.num);
    const changed = order.some((n, i) => n !== originalOrder[i]);
    if (!changed) {
      message.info('No changes to apply');
      return;
    }
    runOp(
      () => documentService.reorderPdfPages(documentId, order),
      'Pages reordered'
    );
  };

  const handleInsertBlank = () => {
    const at = selected.length === 1
      ? selected[0] + 1
      : (activePage || 1);
    runOp(
      () => documentService.insertPdfPages(documentId, {
        at_index: at, mode: 'blank', count: 1
      }),
      'Inserted blank page'
    );
  };

  const handleExtract = () => {
    if (selected.length === 0) {
      message.warning('Select pages to extract first');
      return;
    }
    runOp(
      () => documentService.extractPdfPages(
        documentId, selected, `Extract of ${selected.length} page(s)`
      ),
      `Extracted ${selected.length} page(s) as new document`
    );
  };

  // ============================================================
  // EVENT LISTENERS — page operations delegated from parent
  // ============================================================
  useEffect(() => {
    const onInsert = () => handleInsertBlank();
    const onDelete = () => {
      if (selected.length) handleDelete();
      else message.warning('Select pages to delete');
    };
    const onRotate = (e) => {
      if (!selected.length) return message.warning('Select pages to rotate');
      if (e.detail.degrees < 0) handleRotateLeft();
      else handleRotateRight();
    };
    window.addEventListener('pdf-page-insert', onInsert);
    window.addEventListener('pdf-page-delete', onDelete);
    window.addEventListener('pdf-page-rotate', onRotate);
    return () => {
      window.removeEventListener('pdf-page-insert', onInsert);
      window.removeEventListener('pdf-page-delete', onDelete);
      window.removeEventListener('pdf-page-rotate', onRotate);
    };
  }, [selected, handleInsertBlank, handleDelete, handleRotateLeft, handleRotateRight]);

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) {
    return (
      <div className="page-thumb-panel">
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
          <div style={{ marginTop: 8, fontSize: 12 }}>Loading pages…</div>
        </div>
      </div>
    );
  }

  const orderChanged =
    JSON.stringify(order) !== JSON.stringify(pages.map((p) => p.num));

  return (
    <div className="page-thumb-panel" ref={containerRef}>
      {/* Header / toolbar */}
      <div className="page-thumb-toolbar">
        <div className="page-thumb-count">
          {pages.length} page{pages.length !== 1 ? 's' : ''}
          {selected.length > 0 && (
            <span className="page-thumb-sel-count">
              {' '}· {selected.length} selected
            </span>
          )}
        </div>
        <div className="page-thumb-actions">
          <Tooltip title="Insert blank page">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={handleInsertBlank}
              disabled={busy}
            />
          </Tooltip>
          <Tooltip title="Rotate left 90°">
            <Button
              size="small"
              icon={<RotateLeftOutlined />}
              onClick={handleRotateLeft}
              disabled={busy || !selected.length}
            />
          </Tooltip>
          <Tooltip title="Rotate right 90°">
            <Button
              size="small"
              icon={<RotateRightOutlined />}
              onClick={handleRotateRight}
              disabled={busy || !selected.length}
            />
          </Tooltip>
          <Tooltip title="Extract to new document">
            <Button
              size="small"
              icon={<ExportOutlined />}
              onClick={handleExtract}
              disabled={busy || !selected.length}
            />
          </Tooltip>
          <Popconfirm
            title={`Delete ${selected.length} page(s)?`}
            onConfirm={handleDelete}
            disabled={busy || !selected.length}
            okText="Delete"
            okType="danger"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={busy || !selected.length}
            />
          </Popconfirm>
        </div>
      </div>

      {/* Selection helper */}
      {selected.length > 0 && (
        <div className="page-thumb-sel-bar">
          <Button size="small" onClick={clearSelection} disabled={busy}>
            Clear
          </Button>
          <Button
            size="small"
            onClick={() => setSelected(pages.map((p) => p.num))}
            disabled={busy}
          >
            Select all
          </Button>
        </div>
      )}

      {/* Reorder banner */}
      {orderChanged && (
        <div className="page-thumb-reorder-banner">
          <span><DragOutlined /> New order ready</span>
          <Space>
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleApplyOrder}
              disabled={busy}
            >
              Apply
            </Button>
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setOrder(pages.map((p) => p.num))}
              disabled={busy}
            >
              Reset
            </Button>
          </Space>
        </div>
      )}

      {/* Grid */}
      {pages.length === 0 ? (
        <Empty description="No pages" />
      ) : (
        <div className="page-thumb-grid">
          {order.map((num, idx) => {
            const page = pages.find((p) => p.num === num);
            if (!page) return null;
            const isSel = selected.includes(page.num);
            const isDragOver = dragOverIndex === idx;
            return (
              <div
                key={`${page.num}-${idx}`}
                className={
                  `page-thumb-item ${isSel ? 'selected' : ''} ${isDragOver ? 'drag-over' : ''}`
                }
                draggable
                onDragStart={onDragStart(idx)}
                onDragOver={onDragOver(idx)}
                onDragLeave={onDragLeave}
                onDrop={onDrop(idx)}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    toggleSelect(page.num);
                  } else {
                    onPageClick?.(page.num);
                    if (pages.length > 1) toggleSelect(page.num);
                  }
                }}
              >
                <div className="page-thumb-header">
                  <Checkbox
                    checked={isSel}
                    onChange={() => toggleSelect(page.num)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="page-thumb-num">#{idx + 1}</span>
                </div>
                <div className="page-thumb-image">
                  <img
                    src={page.thumbUrl}
                    alt={`Page ${page.num}`}
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PageThumbnailPanel;
