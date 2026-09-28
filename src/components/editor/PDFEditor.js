// src/components/documents/editor/PDFEditor.jsx
// PDF.js-based viewer with VIRTUALIZED multi-page rendering
// Only renders pages near the current viewport — works for 300+ page PDFs.
//
// Supports: highlight, rectangle, ellipse, line, text, sticky notes,
//           signature placement, form fields, page thumbnails,
//           redaction (compliance-grade), text editing,
//           zoom/fit controls, hand-pan, and stamp annotations.

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
  forwardRef, useImperativeHandle,
} from 'react';
import {
  Spin, Empty, message, Button, Space, Tooltip, Modal, Form,
  Input, Select, Alert, Drawer, List, Tag, Typography,
} from 'antd';
import {
  ZoomInOutlined, ZoomOutOutlined, ExpandOutlined,
  CloseOutlined, SaveOutlined, SignatureOutlined,
  SafetyCertificateOutlined, HistoryOutlined,
  InfoCircleOutlined, OneToOneOutlined, CompressOutlined,
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

// ============================================================
// PDF.js worker
// ============================================================
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// ============================================================
// URL resolver
// ============================================================
const API_BASE = (
  process.env.REACT_APP_API_URL ||
  'https://safetrackproglobal-backend-production.up.railway.app/api'
).replace(/\/$/, '');

const buildRawUrl = (documentId) => `${API_BASE}/documents/${documentId}/raw`;

// ============================================================
// VIRTUALIZATION CONFIG
// ============================================================
const PAGE_GAP = 24;              // px gap between pages
const PRELOAD_RANGE = 1;          // render current ± this many pages
const WINDOW_SIZE = 5;            // render this many pages around the viewport
const OVERSCAN = 2;               // extra pages on each side to prevent flicker

// ============================================================
// PDF Editor
// ============================================================
const PDFEditor = forwardRef(({
  pdfUrl,
  documentId,
  activeTool = 'select',
  onSave,
  onClose,
}, ref) => {
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
  const [pageDims, setPageDims] = useState([]);   // [{ width, height }]
  const [renderedPages, setRenderedPages] = useState(new Set());
  const [visibleWindow, setVisibleWindow] = useState({ start: 1, end: 1 });

  // ============================================================
  // STATE — annotations
  // ============================================================
  const [annotations, setAnnotations] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [selectedAnnId, setSelectedAnnId] = useState(null);

  // ============================================================
  // STATE — signature / forms
  // ============================================================
  const [signaturePlacing, setSignaturePlacing] = useState(false);
  const [activeSignature, setActiveSignature] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [showFormPanel, setShowFormPanel] = useState(false);

  // ============================================================
  // STATE — page thumbnails
  // ============================================================
  const [showThumbs, setShowThumbs] = useState(true);

  // ============================================================
  // STATE — redaction
  // ============================================================
  const [pendingRedactions, setPendingRedactions] = useState([]);
  const [redactionModalOpen, setRedactionModalOpen] = useState(false);
  const [redactionReason, setRedactionReason] = useState('');
  const [redactionBasis, setRedactionBasis] = useState('policy');
  const [applying, setApplying] = useState(false);
  const [redactionHistoryOpen, setRedactionHistoryOpen] = useState(false);
  const [redactionHistory, setRedactionHistory] = useState([]);

  // ============================================================
  // STATE — text editing
  // ============================================================
  const [textEditTarget, setTextEditTarget] = useState(null);
  const [textEditValue, setTextEditValue] = useState('');
  const [pendingTextEdits, setPendingTextEdits] = useState([]);

  // ============================================================
  // STATE — hand-pan
  // ============================================================
  const [panning, setPanning] = useState(false);

  // ============================================================
  // REFS
  // ============================================================
  const containerRef = useRef(null);
  const viewportRef = useRef(null);
  const panStartRef = useRef(null);

  const canvasRefs = useRef({});        // { [pageNum]: HTMLCanvasElement }
  const overlayRefs = useRef({});       // { [pageNum]: SVGSVGElement }
  const textLayerRefs = useRef({});     // { [pageNum]: HTMLDivElement }
  const pageWrapperRefs = useRef({});   // { [pageNum]: HTMLDivElement }

  // ============================================================
  // IMPERATIVE API (exposed to parent via ref)
  // ============================================================
  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(4, +(s + 0.15).toFixed(2)));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(0.25, +(s - 0.15).toFixed(2)));
  }, []);

  const actualSize = useCallback(() => {
    setScale(1.0);
    message.success('Zoom reset to 100%');
  }, []);

  const fitWidth = useCallback(async () => {
    if (!viewportRef.current || !pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const baseViewport = page.getViewport({ scale: 1 });
      const container = viewportRef.current;
      const styles = window.getComputedStyle(container);
      const padLeft = parseFloat(styles.paddingLeft) || 0;
      const padRight = parseFloat(styles.paddingRight) || 0;
      const availableWidth = container.clientWidth - padLeft - padRight - 16;
      const newScale = availableWidth / baseViewport.width;
      setScale(+Math.max(0.25, Math.min(4, newScale)).toFixed(3));
    } catch (err) {
      console.error('Fit width failed:', err);
    }
  }, [pdfDoc, currentPage]);

  const fitPage = useCallback(async () => {
    if (!viewportRef.current || !pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const baseViewport = page.getViewport({ scale: 1 });
      const container = viewportRef.current;
      const styles = window.getComputedStyle(container);
      const padLeft = parseFloat(styles.paddingLeft) || 0;
      const padRight = parseFloat(styles.paddingRight) || 0;
      const padTop = parseFloat(styles.paddingTop) || 0;
      const padBottom = parseFloat(styles.paddingBottom) || 0;
      const availableWidth = container.clientWidth - padLeft - padRight - 16;
      const availableHeight = container.clientHeight - padTop - padBottom - 16;
      const scaleByW = availableWidth / baseViewport.width;
      const scaleByH = availableHeight / baseViewport.height;
      const newScale = Math.min(scaleByW, scaleByH);
      setScale(+Math.max(0.25, Math.min(4, newScale)).toFixed(3));
    } catch (err) {
      console.error('Fit page failed:', err);
    }
  }, [pdfDoc, currentPage]);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn,
      zoomOut,
      actualSize,
      fitWidth,
      fitPage,
      getScale: () => scale,
      getCurrentPage: () => currentPage,
      getNumPages: () => numPages,
      setCurrentPage,
    }),
    [zoomIn, zoomOut, actualSize, fitWidth, fitPage, scale, currentPage, numPages]
  );

  // ============================================================
  // LOAD PDF
  // ============================================================
  const loadPDF = useCallback(async () => {
    if (!documentId && !pdfUrl) return;

    setLoading(true);
    setError(null);
    setAnnotations([]);
    setPendingRedactions([]);
    setPendingTextEdits([]);
    setRenderedPages(new Set());

    const absoluteUrl = documentId ? buildRawUrl(documentId) : pdfUrl;
    console.log('🔍 [PDFEditor] Loading:', absoluteUrl);

    try {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
        '';

      const res = await fetch(absoluteUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      }

      const buffer = await res.arrayBuffer();

      const header = new TextDecoder().decode(
        new Uint8Array(buffer).slice(0, 5)
      );
      if (header !== '%PDF-') {
        const preview = new TextDecoder().decode(
          new Uint8Array(buffer).slice(0, 200)
        );
        throw new Error(
          `Server did not return a PDF. Response starts with: "${preview.slice(0, 80)}..."`
        );
      }

      setPdfBytes(buffer);

      const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setLoading(false);
    } catch (err) {
      console.error('❌ [PDFEditor] Load failed:', err);
      setError(err.message || 'Failed to load PDF');
      setLoading(false);
    }
  }, [documentId, pdfUrl]);

  useEffect(() => {
    loadPDF();
  }, [loadPDF]);

  // ============================================================
  // RELOAD LISTENER
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
        console.warn('PDF form fields unavailable:', err?.message);
      }
    })();
  }, [documentId]);

  // ============================================================
  // AUTO-FIT-WIDTH on first load
  // ============================================================
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;

      try {
        const page = await pdfDoc.getPage(1);
        const baseViewport = page.getViewport({ scale: 1 });
        const canvasEl = viewportRef.current;
        if (!canvasEl) return;

        const styles = window.getComputedStyle(canvasEl);
        const padLeft = parseFloat(styles.paddingLeft) || 0;
        const padRight = parseFloat(styles.paddingRight) || 0;
        const availableWidth = canvasEl.clientWidth - padLeft - padRight - 16;

        const fitScale = availableWidth / baseViewport.width;
        const clamped = Math.max(0.25, Math.min(2, fitScale));

        console.log('📄 Auto-fit:', {
          canvasWidth: canvasEl.clientWidth,
          availableWidth,
          pageNaturalWidth: baseViewport.width,
          fitScale: clamped.toFixed(3),
        });

        setScale(+clamped.toFixed(3));

        if (canvasEl) {
          canvasEl.scrollTop = 0;
          canvasEl.scrollLeft = 0;
        }
      } catch (err) {
        console.error('Auto-fit failed:', err);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [pdfDoc]);

  // ============================================================
  // MEASURE ALL PAGE DIMENSIONS
  // ============================================================
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    (async () => {
      const dims = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (cancelled) return;
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        dims.push({
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
        });
      }
      if (!cancelled) {
        setPageDims(dims);
        setRenderedPages(new Set());
      }
    })();

    return () => { cancelled = true; };
  }, [pdfDoc, scale]);

  // ============================================================
  // SCROLL HANDLER — windowed rendering + current page tracking
  // ============================================================
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || pageDims.length === 0) return;

    const onScroll = () => {
      const scrollTop = el.scrollTop;
      const viewportHeight = el.clientHeight;

      let cumulative = 0;
      let firstVisible = 1;
      let lastVisible = 1;

      for (let i = 0; i < pageDims.length; i++) {
        const top = cumulative;
        const bottom = top + pageDims[i].height + PAGE_GAP;
        if (bottom > scrollTop && top < scrollTop + viewportHeight) {
          if (firstVisible === 1 && i > 0) firstVisible = i + 1;
          lastVisible = i + 1;
        }
        cumulative = bottom;
      }

      if (currentPage < firstVisible || currentPage > lastVisible) {
        setCurrentPage(firstVisible);
      }

      const windowStart = Math.max(1, firstVisible - OVERSCAN);
      const windowEnd = Math.min(numPages, lastVisible + OVERSCAN);

      setVisibleWindow((prev) => {
        if (prev.start === windowStart && prev.end === windowEnd) return prev;
        return { start: windowStart, end: windowEnd };
      });

      // Preload +- PRELOAD_RANGE
      const toRender = [];
      for (
        let i = Math.max(1, firstVisible - PRELOAD_RANGE);
        i <= Math.min(numPages, lastVisible + PRELOAD_RANGE);
        i++
      ) {
        toRender.push(i);
      }

      setRenderedPages((prev) => {
        const next = new Set(prev);
        let changed = false;
        toRender.forEach((p) => {
          if (!next.has(p)) {
            next.add(p);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [pageDims, numPages, currentPage]);

  // ============================================================
  // RENDER A SINGLE PAGE — high-DPI aware
  // ============================================================
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDoc) return;
    const canvas = canvasRefs.current[pageNum];
    const textLayerDiv = textLayerRefs.current[pageNum];
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const logicalWidth = Math.floor(viewport.width);
    const logicalHeight = Math.floor(viewport.height);

    if (
      canvas.width === Math.floor(logicalWidth * dpr) &&
      canvas.height === Math.floor(logicalHeight * dpr) &&
      canvas.dataset.rendered === 'true'
    ) {
      return;
    }

    canvas.width = Math.floor(logicalWidth * dpr);
    canvas.height = Math.floor(logicalHeight * dpr);
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;
    canvas.dataset.rendered = 'true';

    const ctx = canvas.getContext('2d');
    await page.render({
      canvasContext: ctx,
      viewport,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
    }).promise;

    if (textLayerDiv) {
      try {
        const textContent = await page.getTextContent();
        textLayerDiv.innerHTML = '';
        textLayerDiv.style.width = `${logicalWidth}px`;
        textLayerDiv.style.height = `${logicalHeight}px`;

        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport,
        });
        await textLayer.render();

        textLayerDiv.querySelectorAll('span').forEach((span) => {
          span.style.cursor = 'text';
          span.addEventListener('click', (e) => {
            e.stopPropagation();
            handleTextClick(pageNum, span, e);
          });
        });
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Text layer error on page ${pageNum}:`, err);
        }
      }
    }
  }, [pdfDoc, scale]);

  // ============================================================
  // TRIGGER RENDER FOR PAGES IN renderedPages
  // ============================================================
  useEffect(() => {
    renderedPages.forEach((pageNum) => {
      renderPage(pageNum);
    });
  }, [renderedPages, renderPage]);

  // ============================================================
  // CLEAR DRAWING WHEN TOOL CHANGES
  // ============================================================
  useEffect(() => {
    setDrawing(null);
  }, [activeTool]);

  // ============================================================
  // TEXT EDIT CLICK
  // ============================================================
  const handleTextClick = (pageNumber, span, event) => {
    if (activeTool !== 'text-edit') return;
    const textLayer = textLayerRefs.current[pageNumber];
    if (!textLayer) return;
    const layerRect = textLayer.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    setTextEditTarget({
      page: pageNumber,
      x: spanRect.left - layerRect.left,
      y: spanRect.top - layerRect.top,
      w: spanRect.width,
      h: spanRect.height,
      original: span.textContent,
    });
    setTextEditValue(span.textContent);
  };

  // ============================================================
  // ANNOTATION DRAWING — per page
  // ============================================================
  const handleMouseDownForPage = (pageNum) => (e) => {
    if (activeTool === 'hand' && viewportRef.current) {
      setPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        sl: viewportRef.current.scrollLeft,
        st: viewportRef.current.scrollTop,
      };
      e.preventDefault();
      return;
    }

    const overlay = overlayRefs.current[pageNum];
    if (!overlay) return;
    if (activeTool === 'select' || activeTool === 'text-edit') return;

    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'text' || activeTool === 'note') {
      const text = window.prompt(
        activeTool === 'note' ? 'Note text:' : 'Enter text:'
      );
      if (!text) return;
      addAnnotation({
        type: activeTool,
        page: pageNum,
        geometry: { x, y, w: 200, h: 40 },
        text,
        color: activeTool === 'note' ? '#fadb14' : '#1890ff',
      });
      return;
    }

    if (activeTool === 'stamp') {
      const label = window.prompt('Stamp text (e.g. APPROVED, DRAFT):', 'APPROVED');
      if (!label) return;
      addAnnotation({
        type: 'stamp',
        page: pageNum,
        geometry: { x, y, w: 180, h: 60 },
        text: label.toUpperCase(),
        color: '#fa541c',
      });
      return;
    }

    setDrawing({
      type: activeTool,
      page: pageNum,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  };

  const handleMouseMoveForPage = (pageNum) => (e) => {
    if (panning && viewportRef.current && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      viewportRef.current.scrollLeft = panStartRef.current.sl - dx;
      viewportRef.current.scrollTop = panStartRef.current.st - dy;
      return;
    }

    if (!drawing) return;
    const overlay = overlayRefs.current[pageNum];
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();
    setDrawing({
      ...drawing,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    });
  };

  const handleMouseUp = useCallback(() => {
    if (panning) {
      setPanning(false);
      panStartRef.current = null;
      return;
    }

    if (!drawing) return;

    const x = Math.min(drawing.startX, drawing.currentX);
    const y = Math.min(drawing.startY, drawing.currentY);
    const w = Math.abs(drawing.currentX - drawing.startX);
    const h = Math.abs(drawing.currentY - drawing.startY);

    if (w < 5 || h < 5) {
      setDrawing(null);
      return;
    }

    if (drawing.type === 'redact') {
      setPendingRedactions((prev) => [
        ...prev,
        { page: drawing.page, x, y, w, h },
      ]);
      setDrawing(null);
      return;
    }

    addAnnotation({
      type: drawing.type,
      page: drawing.page,
      geometry: { x, y, w, h },
      color:
        drawing.type === 'highlight' ? '#ffec3d' :
        drawing.type === 'rect' ? '#ff4d4f' :
        drawing.type === 'ellipse' ? '#52c41a' :
        '#1890ff',
    });
    setDrawing(null);
  }, [panning, drawing]);

  useEffect(() => {
    if (!drawing && !panning) return;
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [drawing, panning, handleMouseUp]);

  const addAnnotation = (ann) => {
    setAnnotations((prev) => [
      ...prev,
      { ...ann, id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` },
    ]);
  };

  const deleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setSelectedAnnId(null);
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
          b: parseInt(h.substring(4, 6), 16) / 255,
        };
      };

      const pxToPt = 72 / (96 * scale);

      annotations.forEach((ann) => {
        const page = pages[ann.page - 1];
        if (!page) return;
        const { height: pageH } = page.getSize();

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
              opacity: 0.35,
            });
            break;
          case 'rect':
            page.drawRectangle({
              x, y, width: w, height: h,
              borderColor: rgb(color.r, color.g, color.b),
              borderWidth: 2,
            });
            break;
          case 'ellipse':
            page.drawEllipse({
              x: x + w / 2,
              y: y + h / 2,
              xScale: w / 2,
              yScale: h / 2,
              borderColor: rgb(color.r, color.g, color.b),
              borderWidth: 2,
            });
            break;
          case 'line':
            page.drawLine({
              start: { x, y: pageH - yTop },
              end: { x: x + w, y: pageH - (yTop + h) },
              color: rgb(color.r, color.g, color.b),
              thickness: 2,
            });
            break;
          case 'text':
          case 'note':
          case 'stamp':
            page.drawRectangle({
              x, y, width: w, height: h,
              color: rgb(color.r, color.g, color.b),
              opacity: ann.type === 'stamp' ? 0.15 : 0.2,
              borderColor: ann.type === 'stamp'
                ? rgb(color.r, color.g, color.b)
                : undefined,
              borderWidth: ann.type === 'stamp' ? 2 : 0,
            });
            page.drawText(ann.text || '', {
              x: x + 4,
              y: y + h - 14,
              size: ann.type === 'stamp' ? 16 : 11,
              font,
              color: ann.type === 'stamp'
                ? rgb(color.r, color.g, color.b)
                : rgb(0, 0, 0),
              maxWidth: w - 8,
            });
            break;
          default:
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
  // RENDER ANNOTATION SVG
  // ============================================================
  const renderAnnotationSvg = (ann) => {
    const { x, y, w, h } = ann.geometry;
    const isSelected = selectedAnnId === ann.id;

    const commonProps = {
      onClick: (e) => {
        e.stopPropagation();
        setSelectedAnnId(ann.id);
      },
      style: { cursor: 'pointer' },
    };

    let shape = null;
    if (ann.type === 'highlight') {
      shape = <rect x={x} y={y} width={w} height={h} fill={ann.color} opacity={0.35} />;
    } else if (ann.type === 'rect') {
      shape = <rect x={x} y={y} width={w} height={h} fill="transparent" stroke={ann.color} strokeWidth={2} />;
    } else if (ann.type === 'ellipse') {
      shape = (
        <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="transparent" stroke={ann.color} strokeWidth={2} />
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
    } else if (ann.type === 'stamp') {
      shape = (
        <>
          <rect x={x} y={y} width={w} height={h} fill="transparent" stroke={ann.color} strokeWidth={3} rx={4} />
          <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" fontSize={20} fontWeight="bold" fill={ann.color}>
            {ann.text}
          </text>
        </>
      );
    }

    return (
      <g key={ann.id} {...commonProps}>
        {shape}
        {isSelected && (
          <>
            <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} fill="none" stroke="#1890ff" strokeWidth={1.5} strokeDasharray="4 2" />
            <circle cx={x + w + 4} cy={y - 4} r={7} fill="#ff4d4f" />
            <text
              x={x + w + 4} y={y - 1} textAnchor="middle" fontSize={9}
              fill="#fff" style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={(e) => { e.stopPropagation(); deleteAnnotation(ann.id); }}
            >
              ×
            </text>
          </>
        )}
      </g>
    );
  };

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

  const isHandMode = activeTool === 'hand';
  const isTextEditMode = activeTool === 'text-edit';

  return (
    <div
      className="pdf-editor"
      ref={containerRef}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      {/* ============================================================ */}
      {/* PDF TOOLBAR */}
      {/* ============================================================ */}
      <div
        className="pdf-editor-toolbar"
        style={{
          padding: '6px 12px',
          background: '#fafafa',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
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
            <Button size="small" icon={<ZoomOutOutlined />} onClick={zoomOut} />
          </Tooltip>
          <span style={{ fontSize: 12, minWidth: 44, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <Tooltip title="Zoom in">
            <Button size="small" icon={<ZoomInOutlined />} onClick={zoomIn} />
          </Tooltip>
          <Tooltip title="Actual size (100%)">
            <Button size="small" icon={<OneToOneOutlined />} onClick={actualSize} />
          </Tooltip>
          <Tooltip title="Fit width">
            <Button size="small" icon={<ExpandOutlined />} onClick={fitWidth} />
          </Tooltip>
          <Tooltip title="Fit page">
            <Button size="small" icon={<CompressOutlined />} onClick={fitPage} />
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
            onClick={() => {
              const next = Math.max(1, currentPage - 1);
              setCurrentPage(next);
              const el = viewportRef.current;
              if (!el) return;
              let scrollTarget = 0;
              for (let i = 0; i < next - 1; i++) {
                scrollTarget += (pageDims[i]?.height || 1000) + PAGE_GAP;
              }
              el.scrollTop = scrollTarget;
            }}
          >
            ←
          </Button>
          <Button
            size="small"
            disabled={currentPage >= numPages}
            onClick={() => {
              const next = Math.min(numPages, currentPage + 1);
              setCurrentPage(next);
              const el = viewportRef.current;
              if (!el) return;
              let scrollTarget = 0;
              for (let i = 0; i < next - 1; i++) {
                scrollTarget += (pageDims[i]?.height || 1000) + PAGE_GAP;
              }
              el.scrollTop = scrollTarget;
            }}
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
                try {
                  const data = await documentService.getRedactionLogs({ document_id: documentId });
                  setRedactionHistory(data.redactions || []);
                  setRedactionHistoryOpen(true);
                } catch (err) {
                  message.warning('Redaction history unavailable');
                }
              }}
            />
          </Tooltip>

          <Tooltip title="Place signature">
            <Button
              size="small"
              icon={<SignatureOutlined />}
              onClick={async () => {
                try {
                  const sig = await documentService.getLatestSignature(documentId);
                  const image = sig?.signature_data?.image;
                  if (!image) {
                    message.error('No saved signature for this document. Please sign it first.');
                    return;
                  }
                  setActiveSignature(image);
                  setSignaturePlacing(true);
                } catch (err) {
                  console.error('🎯 [Sign] FAILED:', err);
                  message.error('Failed to load signature.');
                }
              }}
            >
              Sign
            </Button>
          </Tooltip>

          <Tooltip title="Save annotated PDF">
            <Button size="small" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================================ */}
      <div className="pdf-editor-main" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {showThumbs && (
          <div className="pdf-editor-thumbs">
            <PageThumbnailPanel
              documentId={documentId}
              onDocumentChange={(newDoc) => {
                onSave?.(newDoc);
                window.dispatchEvent(new CustomEvent('pdf-reload'));
              }}
              onPageClick={(num) => {
                setCurrentPage(num);
                const el = viewportRef.current;
                if (!el) return;
                let scrollTarget = 0;
                for (let i = 0; i < num - 1; i++) {
                  scrollTarget += (pageDims[i]?.height || 1000) + PAGE_GAP;
                }
                el.scrollTop = scrollTarget;
              }}
              activePage={currentPage}
            />
          </div>
        )}

        <div
          ref={viewportRef}
          className="pdf-editor-canvas-area"
          style={{
            cursor: isHandMode ? (panning ? 'grabbing' : 'grab') : 'default',
          }}
        >
          {/* ============================================================
              WINDOWED PAGE RENDERING
              - Top spacer: reserves height of pages before the window
              - Pages in window: rendered with canvas + text layer + overlay
              - Bottom spacer: reserves height of pages after the window
              ============================================================ */}
          {(() => {
            const { start, end } = visibleWindow;

            let topSpacerHeight = 0;
            for (let i = 0; i < start - 1; i++) {
              topSpacerHeight += (pageDims[i]?.height || 1000) + PAGE_GAP;
            }

            let bottomSpacerHeight = 0;
            for (let i = end; i < pageDims.length; i++) {
              bottomSpacerHeight += (pageDims[i]?.height || 1000) + PAGE_GAP;
            }

            return (
              <>
                {topSpacerHeight > 0 && (
                  <div
                    key="top-spacer"
                    style={{
                      height: topSpacerHeight,
                      flexShrink: 0,
                      width: 1,
                    }}
                  />
                )}

                {Array.from(
                  { length: end - start + 1 },
                  (_, i) => start + i
                ).map((pageNum) => {
                  const dims = pageDims[pageNum - 1];
                  const shouldRender = renderedPages.has(pageNum);

                  return (
                    <div
                      key={pageNum}
                      ref={(el) => (pageWrapperRefs.current[pageNum] = el)}
                      className="pdf-editor-page"
                      data-page-num={`Page ${pageNum} of ${numPages}`}
                      style={{
                        position: 'relative',
                        alignSelf: 'center',
                        width: dims?.width || 'auto',
                        height: dims?.height || 'auto',
                        minHeight: dims?.height || 500,
                      }}
                    >
                      {shouldRender ? (
                        <>
                          <canvas
                            ref={(el) => {
                              if (el) canvasRefs.current[pageNum] = el;
                            }}
                            style={{ display: 'block' }}
                          />

                          <div
                            ref={(el) => {
                              if (el) textLayerRefs.current[pageNum] = el;
                            }}
                            className="pdf-text-layer"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              pointerEvents: isTextEditMode ? 'auto' : 'none',
                              userSelect: isTextEditMode ? 'text' : 'none',
                              color: 'transparent',
                              lineHeight: 1,
                            }}
                          />

                          <svg
                            ref={(el) => {
                              if (el) overlayRefs.current[pageNum] = el;
                            }}
                            className="pdf-editor-overlay"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: dims?.width || 0,
                              height: dims?.height || 0,
                              cursor: isHandMode
                                ? 'grab'
                                : isTextEditMode
                                  ? 'text'
                                  : activeTool === 'select'
                                    ? 'default'
                                    : 'crosshair',
                              pointerEvents: (isHandMode || isTextEditMode) ? 'none' : 'auto',
                            }}
                            onMouseDown={handleMouseDownForPage(pageNum)}
                            onMouseMove={handleMouseMoveForPage(pageNum)}
                            onMouseUp={handleMouseUp}
                          >
                            {annotations
                              .filter((a) => a.page === pageNum)
                              .map(renderAnnotationSvg)}

                            {drawing && drawing.page === pageNum && (
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

                            {pendingRedactions
                              .filter((r) => r.page === pageNum)
                              .map((r, idx) => (
                                <g
                                  key={`redact_${pageNum}_${idx}`}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    if (window.confirm('Remove this redaction mark?')) {
                                      const globalIdx = pendingRedactions.indexOf(r);
                                      setPendingRedactions((prev) =>
                                        prev.filter((_, i) => i !== globalIdx)
                                      );
                                    }
                                  }}
                                >
                                  <rect
                                    x={r.x} y={r.y} width={r.w} height={r.h}
                                    fill="black" fillOpacity={0.85} stroke="#ff4d4f" strokeWidth={2}
                                  />
                                  <line x1={r.x} y1={r.y} x2={r.x + r.w} y2={r.y + r.h} stroke="#ff7875" strokeWidth={1} />
                                  <line x1={r.x + r.w} y1={r.y} x2={r.x} y2={r.y + r.h} stroke="#ff7875" strokeWidth={1} />
                                  <text x={r.x + 4} y={r.y + 14} fill="#fff" fontSize={11} fontWeight="bold">
                                    REDACT #{idx + 1}
                                  </text>
                                </g>
                              ))}
                          </svg>
                        </>
                      ) : (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f0f0f0',
                            color: '#888',
                            fontSize: 13,
                          }}
                        >
                          <Spin />
                          <span style={{ marginLeft: 8 }}>Page {pageNum}</span>
                        </div>
                      )}

                      {textEditTarget && textEditTarget.page === pageNum && (
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
                            >
                              Queue
                            </Button>
                          </Space>
                        </div>
                      )}
                    </div>
                  );
                })}

                {bottomSpacerHeight > 0 && (
                  <div
                    key="bottom-spacer"
                    style={{
                      height: bottomSpacerHeight,
                      flexShrink: 0,
                      width: 1,
                    }}
                  />
                )}
              </>
            );
          })()}

          {signaturePlacing && (
            <PDFSignaturePlacer
              containerRef={{ current: overlayRefs.current[currentPage] }}
              currentPage={currentPage}
              signature={activeSignature}
              onPlace={async (placement) => {
                setSignaturePlacing(false);
                try {
                  if (!activeSignature) {
                    message.error('No signature available.');
                    return;
                  }
                  message.loading({ content: 'Stamping…', key: 'stamp' });
                  const res = await documentService.stampSignature(documentId, {
                    image_data_url: activeSignature,
                    page_number: placement.page,
                    x_percent: placement.x_percent,
                    y_percent: placement.y_percent,
                    width_percent: placement.width_percent,
                  });
                  message.success({ content: 'Signature placed', key: 'stamp' });
                  setActiveSignature(null);
                  onSave?.(res?.document);
                  window.dispatchEvent(new CustomEvent('pdf-reload'));
                } catch (err) {
                  console.error('Signature placement failed:', err);
                  message.error({
                    content: err?.message || 'Failed to place signature',
                    key: 'stamp',
                  });
                }
              }}
              onCancel={() => {
                setSignaturePlacing(false);
                setActiveSignature(null);
              }}
            />
          )}

          {isTextEditMode && (
            <div
              className="pdf-tool-hint"
              style={{
                position: 'sticky',
                bottom: 8,
                alignSelf: 'center',
                background: '#fff',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                zIndex: 50,
              }}
            >
              <InfoCircleOutlined /> Click any text to edit. Long edits may overlap
              other elements. For complex text, use redaction + insert a text box.
            </div>
          )}
        </div>

        {showFormPanel && (
          <div className="pdf-form-panel">
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
            const payload = pendingTextEdits.map((e) => {
              const size = pageDims[e.page - 1] || { width: 1, height: 1 };
              return {
                page: e.page,
                x_percent: e.x / size.width,
                y_percent: 1 - (e.y + e.h) / size.height,
                w_percent: e.w / size.width,
                h_percent: e.h / size.height,
                new_text: e.new_text,
                font_size: 11,
                color: '#000000',
                font_family: 'Helvetica',
                hide_original: true,
              };
            });
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
            const regions = pendingRedactions.map((r) => {
              const size = pageDims[r.page - 1] || { width: 1, height: 1 };
              return {
                page: r.page,
                x_percent: r.x / size.width,
                y_percent: r.y / size.height,
                w_percent: r.w / size.width,
                h_percent: r.h / size.height,
              };
            });

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
              <p>
                The redacted content will be <strong>permanently removed</strong>{' '}
                from the PDF.
              </p>
              <p style={{ marginBottom: 0 }}>
                A snapshot of the original will be saved as a version, and a
                certificate will be generated for audit purposes.
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
            message={`${pendingRedactions.length} region(s) on ${
              new Set(pendingRedactions.map((r) => r.page)).size
            } page(s)`}
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
                    <div>
                      {r.region_count} region(s) · v{r.before_version} → v
                      {r.after_version}
                    </div>
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
});

export default PDFEditor;
