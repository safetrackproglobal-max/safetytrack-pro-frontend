// src/components/documents/editor/PDFEditor.jsx
// PDF.js-based viewer with annotation layer
// Supports: highlight, rectangle, ellipse, line, text, sticky notes,
//           signature placement, form fields, page thumbnails,
//           redaction (compliance-grade), and text editing.

import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import {
  Spin, Empty, message, Button, Space, Tooltip, Modal, Form,
  Input, Select, Alert, Drawer, List, Tag, Typography
} from 'antd';
import {
  ZoomInOutlined, ZoomOutOutlined, ExpandOutlined,
  CloseOutlined, SaveOutlined, SignatureOutlined,
  StopOutlined, SafetyCertificateOutlined, HistoryOutlined,
  EditOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// ============================================================
// LOCAL IMPORTS
// ============================================================
import documentService from '../../services/documentService';
import PDFFormPanel from '../documents/PDFFormPanel';
import PDFSignaturePlacer from '../documents/PDFSignaturePlacer';
import PageThumbnailPanel from '../documents/PageThumbnailPanel';

const { Text } = Typography;

// Configure PDF.js worker (use a CDN or local copy)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * PDFEditor
 *
 * Props:
 *   pdfUrl       - URL to fetch the PDF from
 *   documentId   - ID of the document (for signature/form/redaction features)
 *   activeTool   - 'select' | 'highlight' | 'rect' | 'ellipse' | 'line' | 'text' | 'note'
 *                | 'redact' | 'text-edit'
 *   onSave       - callback(blob) called when user saves annotated PDF
 *   onClose      - callback to close the editor
 */
const PDFEditor = ({
  pdfUrl,
  documentId,
  activeTool = 'select',
  onSave,
  onClose
}) => {
  // ============================================================
  // STATE — PDF loading / viewport
  // ============================================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);

  // ============================================================
  // STATE — annotations
  // ============================================================
  const [annotations, setAnnotations] = useState([]); // [{id, page, type, geometry, color, text}]
  const [drawing, setDrawing] = useState(null); // currently-drawing annotation
  const [selectedAnnId, setSelectedAnnId] = useState(null);

  // ============================================================
  // STATE — signature / forms
  // ============================================================
  const [signaturePlacing, setSignaturePlacing] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [showFormPanel, setShowFormPanel] = useState(false);

  // ============================================================
  // STATE — page thumbnails
  // ============================================================
  const [showThumbs, setShowThumbs] = useState(true);

  // ============================================================
  // STATE — redaction
  // ============================================================
  const [pendingRedactions, setPendingRedactions] = useState([]); // [{page, x, y, w, h}] screen px
  const [redactionModalOpen, setRedactionModalOpen] = useState(false);
  const [redactionReason, setRedactionReason] = useState('');
  const [redactionBasis, setRedactionBasis] = useState('policy');
  const [applying, setApplying] = useState(false);
  const [redactionHistoryOpen, setRedactionHistoryOpen] = useState(false);
  const [redactionHistory, setRedactionHistory] = useState([]);

  // ============================================================
  // STATE — text editing
  // ============================================================
  const [textEditTarget, setTextEditTarget] = useState(null); // {page,x,y,w,h,original}
  const [textEditValue, setTextEditValue] = useState('');
  const [pendingTextEdits, setPendingTextEdits] = useState([]); // queued edits

  // ============================================================
  // REFS
  // ============================================================
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const textLayerRef = useRef(null);

  // ============================================================
  // LOAD PDF (extracted so it can be re-triggered)
  // ============================================================
  const loadPDF = useCallback(() => {
    if (!pdfUrl) return;
    setLoading(true);
    setError(null);
    setAnnotations([]);
    setPendingRedactions([]);
    setPendingTextEdits([]);

    // Fetch raw bytes (kept for pdf-lib re-save)
    fetch(pdfUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => setPdfBytes(buf))
      .catch((err) => console.error('Failed to fetch PDF bytes:', err));

    // Load into PDF.js for rendering
    pdfjsLib
      .getDocument(pdfUrl)
      .promise.then((doc) => {
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load PDF:', err);
        setError(err.message || 'Failed to load PDF');
        setLoading(false);
      });
  }, [pdfUrl]);

  useEffect(() => {
    loadPDF();
  }, [loadPDF]);

  // ============================================================
  // RELOAD LISTENER (for after page ops / redactions)
  // ============================================================
  useEffect(() => {
    const reload = () => loadPDF();
    window.addEventListener('pdf-reload', reload);
    return () => window.removeEventListener('pdf-reload', reload);
  }, [loadPDF]);

  // ============================================================
  // LOAD FORM FIELDS
  // ============================================================
  useEffect(() => {
    if (!documentId) return;
    (async () => {
      try {
        const data = await documentService.getPdfFormFields(documentId);
        setFormFields(data.fields || []);
        setShowFormPanel((data.fields || []).length > 0);
      } catch (err) {
        console.error('Failed to load PDF form fields:', err);
      }
    })();
  }, [documentId]);

  // ============================================================
  // RENDER PAGE TO CANVAS + TEXT LAYER
  // ============================================================
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;
    let renderTask = null;

    pdfDoc.getPage(currentPage).then(async (page) => {
      if (cancelled || !canvasRef.current) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      renderTask = page.render({ canvasContext: ctx, viewport });
      renderTask.promise.catch((err) => {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Render error:', err);
        }
      });

      // ---------- TEXT LAYER ----------
      // After page.render(...)
try {
  const textContent = await page.getTextContent();
  const textLayerDiv = textLayerRef.current;
  
  if (textLayerDiv) {
    textLayerDiv.innerHTML = '';
    textLayerDiv.style.width = `${viewport.width}px`;
    textLayerDiv.style.height = `${viewport.height}px`;

    // ✅ Use the new TextLayer class
    const textLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: textLayerDiv,
      viewport,
    });

    await textLayer.render();

    // Now add click handlers to each text span
    textLayerDiv.querySelectorAll('span').forEach((span) => {
      span.style.cursor = 'text';
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        handleTextClick(span, e);
      });
    });
  }
} catch (err) {
  if (err?.name !== 'RenderingCancelledException') {
    console.error('Text layer error:', err);
  }
}
    });

    return () => {
      cancelled = true;
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, currentPage, scale, activeTool]);

  // ============================================================
  // ANNOTATION DRAWING
  // ============================================================
  const handleMouseDown = (e) => {
    if (activeTool === 'select' || activeTool === 'text-edit' || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'text' || activeTool === 'note') {
      const text = window.prompt(
        activeTool === 'note' ? 'Note text:' : 'Enter text:'
      );
      if (!text) return;
      addAnnotation({
        type: activeTool,
        page: currentPage,
        geometry: { x, y, w: 200, h: 40 },
        text,
        color: activeTool === 'note' ? '#fadb14' : '#1890ff'
      });
      return;
    }

    setDrawing({
      type: activeTool,
      page: currentPage,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    });
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const rect = overlayRef.current.getBoundingClientRect();
    setDrawing({
      ...drawing,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top
    });
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    const x = Math.min(drawing.startX, drawing.currentX);
    const y = Math.min(drawing.startY, drawing.currentY);
    const w = Math.abs(drawing.currentX - drawing.startX);
    const h = Math.abs(drawing.currentY - drawing.startY);

    if (w < 5 || h < 5) {
      setDrawing(null);
      return;
    }

    // Redaction tool → queue, don't add to regular annotations
    if (activeTool === 'redact') {
      setPendingRedactions((prev) => [
        ...prev,
        { page: currentPage, x, y, w, h }
      ]);
      setDrawing(null);
      return;
    }

    // Regular annotation
    addAnnotation({
      type: drawing.type,
      page: currentPage,
      geometry: { x, y, w, h },
      color:
        drawing.type === 'highlight' ? '#ffec3d' :
        drawing.type === 'rect' ? '#ff4d4f' :
        drawing.type === 'ellipse' ? '#52c41a' :
        '#1890ff'
    });
    setDrawing(null);
  };

  const addAnnotation = (ann) => {
    setAnnotations((prev) => [
      ...prev,
      { ...ann, id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` }
    ]);
  };

  const deleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setSelectedAnnId(null);
  };

  // ============================================================
  // TEXT EDIT CLICK
  // ============================================================
  const handleTextClick = (span, event) => {
    if (activeTool !== 'text-edit') return;
    const textLayer = textLayerRef.current;
    if (!textLayer) return;
    const layerRect = textLayer.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    setTextEditTarget({
      page: currentPage,
      x: spanRect.left - layerRect.left,
      y: spanRect.top - layerRect.top,
      w: spanRect.width,
      h: spanRect.height,
      original: span.textContent,
    });
    setTextEditValue(span.textContent);
  };

  // ============================================================
  // SAVE ANNOTATED PDF
  // ============================================================
  const handleSave = async () => {
    if (!pdfBytes) return;
    try {
      message.loading({ content: 'Preparing PDF…', key: 'save' });

      const pdfDocLib = await PDFDocument.load(pdfBytes);
      const pages = pdfDocLib.getPages();
      const font = await pdfDocLib.embedFont(StandardFonts.Helvetica);

      const hexToRgb = (hex) => {
        const h = hex.replace('#', '');
        return {
          r: parseInt(h.substring(0, 2), 16) / 255,
          g: parseInt(h.substring(2, 4), 16) / 255,
          b: parseInt(h.substring(4, 6), 16) / 255
        };
      };

      // Coordinate transform: canvas pixels → PDF points
      const pxToPt = 72 / (96 * scale);

      annotations.forEach((ann) => {
        const page = pages[ann.page - 1];
        if (!page) return;
        const { width: pageW, height: pageH } = page.getSize();

        const x = ann.geometry.x * pxToPt;
        const yTop = ann.geometry.y * pxToPt;
        const w = ann.geometry.w * pxToPt;
        const h = ann.geometry.h * pxToPt;
        const y = pageH - yTop - h;

        const color = hexToRgb(ann.color);

        switch (ann.type) {
          case 'highlight':
            page.drawRectangle({
              x, y, width: w, height: h,
              color: rgb(color.r, color.g, color.b),
              opacity: 0.35
            });
            break;
          case 'rect':
            page.drawRectangle({
              x, y, width: w, height: h,
              borderColor: rgb(color.r, color.g, color.b),
              borderWidth: 2
            });
            break;
          case 'ellipse':
            page.drawEllipse({
              x: x + w / 2,
              y: y + h / 2,
              xScale: w / 2,
              yScale: h / 2,
              borderColor: rgb(color.r, color.g, color.b),
              borderWidth: 2
            });
            break;
          case 'line':
            page.drawLine({
              start: { x, y: pageH - yTop },
              end: { x: x + w, y: pageH - (yTop + h) },
              color: rgb(color.r, color.g, color.b),
              thickness: 2
            });
            break;
          case 'text':
          case 'note':
            page.drawRectangle({
              x, y, width: w, height: h,
              color: rgb(color.r, color.g, color.b),
              opacity: 0.2
            });
            page.drawText(ann.text || '', {
              x: x + 4, y: y + h - 14,
              size: 11,
              font,
              color: rgb(0, 0, 0),
              maxWidth: w - 8
            });
            break;
        }
      });

      const bytes = await pdfDocLib.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });

      message.success({ content: 'PDF ready', key: 'save' });
      if (onSave) onSave(blob);
    } catch (err) {
      console.error('Save failed:', err);
      message.error({ content: 'Failed to save PDF', key: 'save' });
    }
  };

  // ============================================================
  // RENDER ANNOTATION OVERLAY
  // ============================================================
  const renderAnnotationSvg = (ann) => {
    const { x, y, w, h } = ann.geometry;
    const isSelected = selectedAnnId === ann.id;

    const commonProps = {
      onClick: (e) => {
        e.stopPropagation();
        setSelectedAnnId(ann.id);
      },
      style: { cursor: 'pointer' }
    };

    let shape = null;
    if (ann.type === 'highlight') {
      shape = <rect x={x} y={y} width={w} height={h} fill={ann.color} opacity={0.35} />;
    } else if (ann.type === 'rect') {
      shape = <rect x={x} y={y} width={w} height={h} fill="transparent" stroke={ann.color} strokeWidth={2} />;
    } else if (ann.type === 'ellipse') {
      shape = (
        <ellipse
          cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2}
          fill="transparent" stroke={ann.color} strokeWidth={2}
        />
      );
    } else if (ann.type === 'line') {
      shape = <line x1={x} y1={y} x2={x + w} y2={y + h} stroke={ann.color} strokeWidth={2} />;
    } else if (ann.type === 'text' || ann.type === 'note') {
      shape = (
        <>
          <rect x={x} y={y} width={w} height={h} fill={ann.color} opacity={0.2} rx={4} />
          <text x={x + 6} y={y + 18} fontSize={12} fill="#000">{ann.text || ''}</text>
        </>
      );
    }

    return (
      <g key={ann.id} {...commonProps}>
        {shape}
        {isSelected && (
          <>
            <rect
              x={x - 4} y={y - 4} width={w + 8} height={h + 8}
              fill="none" stroke="#1890ff" strokeWidth={1.5} strokeDasharray="4 2"
            />
            <circle cx={x + w + 4} cy={y - 4} r={7} fill="#ff4d4f" />
            <text
              x={x + w + 4} y={y - 1} textAnchor="middle" fontSize={9}
              fill="#fff" style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={(e) => { e.stopPropagation(); deleteAnnotation(ann.id); }}
            >×</text>
          </>
        )}
      </g>
    );
  };

  // Page-filtered annotations
  const pageAnnotations = useMemo(
    () => annotations.filter((a) => a.page === currentPage),
    [annotations, currentPage]
  );

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Spin size="large" tip="Loading PDF…" />
      </div>
    );
  }

  if (error) {
    return <Empty description={`Failed to load PDF: ${error}`} />;
  }

  const canvasEl = canvasRef.current;
  const canvasW = canvasEl?.width || 0;
  const canvasH = canvasEl?.height || 0;

  return (
    <div className="pdf-editor" ref={containerRef} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ============================================================ */}
      {/* TOOLBAR */}
      {/* ============================================================ */}
      <div className="pdf-editor-toolbar" style={{
        padding: '6px 12px',
        background: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <Space>
          <Tooltip title="Toggle thumbnails">
            <Button
              size="small"
              type={showThumbs ? 'primary' : 'default'}
              onClick={() => setShowThumbs((v) => !v)}
            >
              ☰
            </Button>
          </Tooltip>
          <Tooltip title="Zoom out">
            <Button
              size="small"
              icon={<ZoomOutOutlined />}
              onClick={() => setScale((s) => Math.max(0.4, s - 0.15))}
            />
          </Tooltip>
          <span style={{ fontSize: 12, minWidth: 44, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <Tooltip title="Zoom in">
            <Button
              size="small"
              icon={<ZoomInOutlined />}
              onClick={() => setScale((s) => Math.min(3, s + 0.15))}
            />
          </Tooltip>
          <Tooltip title="Fit width">
            <Button
              size="small"
              icon={<ExpandOutlined />}
              onClick={() => setScale(1.2)}
            />
          </Tooltip>
        </Space>

        <div style={{ flex: 1 }} />

        <Space>
          <span style={{ fontSize: 12 }}>
            Page {currentPage} / {numPages}
          </span>
          <Button
            size="small"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ←
          </Button>
          <Button
            size="small"
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
          >
            →
          </Button>
        </Space>

        <div style={{ flex: 1 }} />

        <Space>
          <Tooltip title="Redaction history">
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={async () => {
                const data = await documentService.getRedactionLogs({ document_id: documentId });
                setRedactionHistory(data.redactions || []);
                setRedactionHistoryOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Place signature">
            <Button
              size="small"
              icon={<SignatureOutlined />}
              onClick={() => setSignaturePlacing(true)}
            >
              Sign
            </Button>
          </Tooltip>
          <Tooltip title="Save annotated PDF">
            <Button type="primary" size="small" icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
          </Tooltip>
          {onClose && (
            <Tooltip title="Close">
              <Button size="small" icon={<CloseOutlined />} onClick={onClose} />
            </Tooltip>
          )}
        </Space>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT: thumbnails + canvas area + form panel */}
      {/* ============================================================ */}
      <div className="pdf-editor-main" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {showThumbs && (
          <div className="pdf-editor-thumbs" style={{ width: 180, borderRight: '1px solid #e0e0e0', overflow: 'auto' }}>
            <PageThumbnailPanel
              documentId={documentId}
              onDocumentChange={(newDoc) => {
                onSave?.(newDoc);
                window.dispatchEvent(new CustomEvent('pdf-reload'));
              }}
              onPageClick={(num) => setCurrentPage(num)}
              activePage={currentPage}
            />
          </div>
        )}

        {/* PDF viewport */}
        <div
          className="pdf-editor-canvas-area"
          style={{
            flex: 1,
            overflow: 'auto',
            background: '#525659',
            padding: 24,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div
            className="pdf-editor-page"
            style={{
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              alignSelf: 'flex-start'
            }}
          >
            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {/* Text layer (for text-edit mode) */}
            <div
              ref={textLayerRef}
              className="pdf-text-layer"
              style={{
                position: 'absolute',
                top: 0, left: 0,
                pointerEvents: activeTool === 'text-edit' ? 'auto' : 'none',
                userSelect: activeTool === 'text-edit' ? 'text' : 'none',
                color: 'transparent',
                lineHeight: 1,
              }}
            />

            {/* Annotation overlay */}
            <svg
              ref={overlayRef}
              className="pdf-editor-overlay"
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: canvasW,
                height: canvasH,
                cursor: activeTool === 'select' ? 'default' : 'crosshair'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {pageAnnotations.map(renderAnnotationSvg)}

              {/* Currently drawing shape */}
              {drawing && (
                <rect
                  x={Math.min(drawing.startX, drawing.currentX)}
                  y={Math.min(drawing.startY, drawing.currentY)}
                  width={Math.abs(drawing.currentX - drawing.startX)}
                  height={Math.abs(drawing.currentY - drawing.startY)}
                  fill={
                    drawing.type === 'highlight' ? '#ffec3d' :
                    drawing.type === 'rect' ? 'rgba(255,77,79,0.1)' :
                    'rgba(24,144,255,0.1)'
                  }
                  stroke={
                    drawing.type === 'rect' ? '#ff4d4f' :
                    drawing.type === 'ellipse' ? '#52c41a' : '#1890ff'
                  }
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              )}

              {/* Pending redaction marks */}
              {pendingRedactions
                .filter((r) => r.page === currentPage)
                .map((r) => {
                  const globalIdx = pendingRedactions.indexOf(r);
                  return (
                    <g
                      key={`redact_${globalIdx}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (window.confirm('Remove this redaction mark?')) {
                          setPendingRedactions((prev) =>
                            prev.filter((_, i) => i !== globalIdx)
                          );
                        }
                      }}
                    >
                      <rect
                        x={r.x} y={r.y} width={r.w} height={r.h}
                        fill="black"
                        fillOpacity={0.85}
                        stroke="#ff4d4f"
                        strokeWidth={2}
                      />
                      <line x1={r.x} y1={r.y} x2={r.x + r.w} y2={r.y + r.h} stroke="#ff7875" strokeWidth={1} />
                      <line x1={r.x + r.w} y1={r.y} x2={r.x} y2={r.y + r.h} stroke="#ff7875" strokeWidth={1} />
                      <text
                        x={r.x + 4} y={r.y + 14}
                        fill="#fff" fontSize={11} fontWeight="bold"
                      >
                        REDACT #{globalIdx + 1}
                      </text>
                    </g>
                  );
                })}
            </svg>

            {/* Signature placer */}
            {signaturePlacing && (
              <PDFSignaturePlacer
                containerRef={overlayRef}
                currentPage={currentPage}
                onPlace={async (placement) => {
                  setSignaturePlacing(false);
                  try {
                    const signature = await getUserSignatureDataUrl();
                    message.loading({ content: 'Stamping…', key: 'stamp' });

                    const res = await documentService.stampSignature(documentId, {
                      image_data_url: signature,
                      page_number: placement.page,
                      x_percent: placement.x_percent,
                      y_percent: placement.y_percent,
                      width_percent: placement.width_percent
                    });

                    message.success({ content: 'Signature placed', key: 'stamp' });
                    onSave?.(res?.document);
                    window.dispatchEvent(new CustomEvent('pdf-reload'));
                  } catch (err) {
                    message.error({ content: 'Failed to place signature', key: 'stamp' });
                  }
                }}
                onCancel={() => setSignaturePlacing(false)}
              />
            )}

            {/* Text edit popover */}
            {textEditTarget && (
              <div
                className="pdf-text-edit-popover"
                style={{
                  position: 'absolute',
                  left: textEditTarget.x,
                  top: textEditTarget.y + textEditTarget.h + 4,
                  zIndex: 200,
                  background: '#fff',
                  border: '1px solid #1890ff',
                  borderRadius: 6,
                  padding: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  width: 240,
                }}
              >
                <Input
                  size="small"
                  value={textEditValue}
                  onChange={(e) => setTextEditValue(e.target.value)}
                  autoFocus
                  onPressEnter={() => {
                    setPendingTextEdits((prev) => [
                      ...prev,
                      { ...textEditTarget, new_text: textEditValue },
                    ]);
                    setTextEditTarget(null);
                  }}
                />
                <Space style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => setTextEditTarget(null)}>Cancel</Button>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      setPendingTextEdits((prev) => [
                        ...prev,
                        { ...textEditTarget, new_text: textEditValue },
                      ]);
                      setTextEditTarget(null);
                    }}
                  >Queue</Button>
                </Space>
              </div>
            )}

            {/* Tool hint */}
            {activeTool === 'text-edit' && (
              <div className="pdf-tool-hint" style={{ position: 'absolute', bottom: 8, left: 8, background: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                <InfoCircleOutlined /> Click any text to edit. Long edits may overlap
                other elements. For complex text, use redaction + insert a text box.
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* FORM PANEL */}
        {/* ============================================================ */}
        {showFormPanel && (
          <div className="pdf-form-panel" style={{ width: 260, borderLeft: '1px solid #e0e0e0', overflow: 'auto' }}>
            <PDFFormPanel
              documentId={documentId}
              pageNumber={currentPage}
              fieldPositions={[]}
              onBackendSave={(res) => {
                message.success('Form saved');
                onSave?.(res?.document);
              }}
            />
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* FLOATING ACTION BUTTONS */}
      {/* ============================================================ */}
      {pendingRedactions.length > 0 && (
        <Button
          type="primary"
          danger
          size="small"
          icon={<SafetyCertificateOutlined />}
          style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 100 }}
          onClick={() => setRedactionModalOpen(true)}
        >
          Apply {pendingRedactions.length} Redaction{pendingRedactions.length > 1 ? 's' : ''}
        </Button>
      )}

      {pendingTextEdits.length > 0 && (
        <Button
          type="primary"
          size="small"
          style={{ position: 'absolute', bottom: 16, right: 200, zIndex: 100 }}
          onClick={async () => {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const pw = rect.width;
            const ph = rect.height;

            const payload = pendingTextEdits.map((e) => ({
              page: e.page,
              x_percent: e.x / pw,
              y_percent: 1 - (e.y + e.h) / ph,
              w_percent: e.w / pw,
              h_percent: e.h / ph,
              new_text: e.new_text,
              font_size: 11,
              color: '#000000',
              font_family: 'Helvetica',
              hide_original: true,
            }));

            try {
              message.loading({ content: 'Applying text edits…', key: 'tedit' });
              const res = await documentService.applyTextEdits(documentId, payload);
              message.success({ content: 'Text edits applied', key: 'tedit' });
              setPendingTextEdits([]);
              onSave?.(res.document);
              window.dispatchEvent(new CustomEvent('pdf-reload'));
            } catch (err) {
              message.error({ content: err.message || 'Failed', key: 'tedit' });
            }
          }}
        >
          Apply {pendingTextEdits.length} Text Edit{pendingTextEdits.length > 1 ? 's' : ''}
        </Button>
      )}

      {/* ============================================================ */}
      {/* REDACTION CONFIRM MODAL */}
      {/* ============================================================ */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#cf1322' }} />
            Confirm Redaction
          </Space>
        }
        open={redactionModalOpen}
        onCancel={() => setRedactionModalOpen(false)}
        confirmLoading={applying}
        okText="Apply & Redact Permanently"
        okButtonProps={{ danger: true }}
        onOk={async () => {
          setApplying(true);
          try {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const pw = rect.width;
            const ph = rect.height;

            const regions = pendingRedactions.map((r) => ({
              page: r.page,
              x_percent: r.x / pw,
              y_percent: r.y / ph,
              w_percent: r.w / pw,
              h_percent: r.h / ph,
            }));

            const res = await documentService.applyRedactions(documentId, {
              regions,
              reason: redactionReason || 'Redaction applied',
              legal_basis: redactionBasis,
              fill_color: '#000000',
              remove_metadata: true,
              remove_embedded_files: true,
              remove_annotations: true,
              remove_scripts: true,
              sanitize_links: true,
              sanitize_outline: true,
              linearize: true,
            });

            if (res.success) {
              message.success(
                `Redacted successfully — certificate ${res.certificate_number}`
              );
              if (res.verification?.verification_passed === false) {
                Modal.warning({
                  title: 'Verification Notice',
                  content: (
                    <div>
                      <p>Redaction applied, but the automated text-leak check flagged {res.verification.text_leaks_found} region(s).</p>
                      <p>This may be due to text that's embedded as an image or
                         intricate content stream. Manual review is recommended.</p>
                    </div>
                  ),
                });
              }
              setPendingRedactions([]);
              setRedactionModalOpen(false);
              setRedactionReason('');
              onSave?.(res.document);
              window.dispatchEvent(new CustomEvent('pdf-reload'));
            } else {
              message.error(res.error || 'Redaction failed');
            }
          } catch (err) {
            message.error(err.message || 'Failed to apply redactions');
          } finally {
            setApplying(false);
          }
        }}
        width={560}
      >
        <Alert
          type="warning"
          showIcon
          message="This action is irreversible"
          description={
            <div>
              <p>The redacted content will be <strong>permanently removed</strong> from the PDF.</p>
              <p style={{ marginBottom: 0 }}>
                A snapshot of the original will be saved as a version,
                and a certificate will be generated for audit purposes.
              </p>
            </div>
          }
          style={{ marginBottom: 16 }}
        />

        <Form layout="vertical">
          <Form.Item label="Reason / Justification">
            <Input.TextArea
              rows={3}
              value={redactionReason}
              onChange={(e) => setRedactionReason(e.target.value)}
              placeholder="e.g. GDPR Article 17 — right to erasure request from data subject"
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item label="Legal Basis">
            <Select
              value={redactionBasis}
              onChange={setRedactionBasis}
              options={[
                { label: 'Privacy / GDPR / HIPAA', value: 'privacy' },
                { label: 'Security / Classified', value: 'security' },
                { label: 'Court Order', value: 'court_order' },
                { label: 'Company Policy', value: 'policy' },
                { label: 'Other', value: 'other' },
              ]}
            />
          </Form.Item>
          <Alert
            type="info"
            showIcon
            message={`${pendingRedactions.length} region(s) on ${new Set(pendingRedactions.map(r => r.page)).size} page(s)`}
          />
        </Form>
      </Modal>

      {/* ============================================================ */}
      {/* REDACTION HISTORY DRAWER */}
      {/* ============================================================ */}
      <Drawer
        title="Redaction History"
        open={redactionHistoryOpen}
        onClose={() => setRedactionHistoryOpen(false)}
        width={520}
      >
        <List
          dataSource={redactionHistory}
          renderItem={(r) => (
            <List.Item
              actions={[
                <Button
                  key="cert"
                  size="small"
                  type="link"
                  onClick={() => documentService.downloadRedactionCertificate(r.id)}
                >
                  Certificate
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{r.certificate_number}</Text>
                    {r.verified_no_leaks ? (
                      <Tag color="green">Verified</Tag>
                    ) : (
                      <Tag color="orange">Review</Tag>
                    )}
                  </Space>
                }
                description={
                  <div style={{ fontSize: 12 }}>
                    <div>{r.region_count} region(s) · v{r.before_version} → v{r.after_version}</div>
                    <div style={{ color: '#8c8c8c' }}>
                      {r.redacted_by_name} · {new Date(r.created_at).toLocaleString()}
                    </div>
                    <div style={{ color: '#8c8c8c' }}>Basis: {r.legal_basis}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};

export default PDFEditor;