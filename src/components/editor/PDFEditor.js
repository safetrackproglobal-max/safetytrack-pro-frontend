// src/components/editor/PDFEditor.js
// PDF editor for Document Control (PDF-XChange / PDFgear style).
//
// How it works
//  * Pages are rendered with PDF.js (only pages near the viewport, so 300+ page files stay fast).
//  * Every change is an "object" stored in page points (visible page, top-left origin, scale 1).
//    The browser previews objects live; on Save the server (PyMuPDF, pdf_edit_engine.py) applies
//    them for real and stores the result as a new version (the old file is kept in history).
//  * Edit Text: the server lists each text line with its exact font, size, colour and position.
//    Clicking a line opens it for typing in the same style. On save the original characters are
//    removed (background kept) and the new text is written on the same baseline.
//  * White-out: erases text under it and paints the page background colour (auto-matched).
//  * Eraser: deletes lines, text and pictures in the area and paints nothing (the paper shows through).
//  * Find drawn words: CAD drawings often draw lettering as lines, so there is no text to edit.
//    The server reads those words with OCR; editing one erases the drawn letters and writes real text.
//
// Kept from the previous version: thumbnails, AcroForm panel, signature placement and certified
// redaction (server side, with reason + certificate).

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
  forwardRef, useImperativeHandle,
} from 'react';
import {
  Spin, Empty, message, Button, Space, Tooltip, Modal, Form, Input, Select, Alert,
  Drawer, List, Tag, Typography, InputNumber, Dropdown, Divider,
} from 'antd';
import {
  ZoomInOutlined, ZoomOutOutlined, ExpandOutlined, CompressOutlined, OneToOneOutlined,
  SaveOutlined, SignatureOutlined, SafetyCertificateOutlined, HistoryOutlined,
  DragOutlined, SelectOutlined, EditOutlined, FontSizeOutlined, ClearOutlined,
  HighlightOutlined, BorderOutlined, LineOutlined, MessageOutlined, CheckSquareOutlined,
  EyeInvisibleOutlined, UndoOutlined, RedoOutlined, QuestionCircleOutlined,
  DownloadOutlined, DeleteOutlined, BoldOutlined, ItalicOutlined, AlignLeftOutlined,
  AlignCenterOutlined, AlignRightOutlined, BgColorsOutlined, MenuOutlined, DownOutlined,
  InfoCircleOutlined, LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import { openPdf } from '../../utils/pdfjs';

import documentService from '../../services/documentService';
import PDFFormPanel from '../documents/PDFFormPanel';
import PDFSignaturePlacer from '../documents/PDFSignaturePlacer';
import PageThumbnailPanel from '../documents/PageThumbnailPanel';
import './PDFEditor.css';

const { Text, Title, Paragraph } = Typography;

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  'https://safetrackproglobal-backend-production.up.railway.app/api'
).replace(/\/$/, '');
const buildRawUrl = (documentId) => `${API_BASE}/documents/${documentId}/raw`;

// The app keeps the token in localStorage ("remember me") or sessionStorage.
const getAuthToken = () => {
  for (const store of [localStorage, sessionStorage]) {
    for (const key of ['authToken', 'token', 'access_token', 'jwtToken']) {
      const v = store.getItem(key);
      if (v) return v;
    }
  }
  return '';
};

// ============================================================
// CONSTANTS
// ============================================================
const PAGE_GAP = 24;
const PRELOAD_RANGE = 1;
const LINE_HEIGHT = 1.2;
// first-baseline position inside a CSS line box (line-height 1.2) — mirrored by the server
const BASELINE_RATIO = { Helvetica: 0.947, Times: 0.938, Courier: 0.867 };
const CSS_FONT = {
  Helvetica: 'Helvetica, Arial, "Liberation Sans", sans-serif',
  Times: '"Times New Roman", Times, "Liberation Serif", serif',
  Courier: '"Courier New", Courier, "Liberation Mono", monospace',
};
const FONT_OPTIONS = [
  { value: 'Helvetica', label: 'Sans (Helvetica / Arial)' },
  { value: 'Times', label: 'Serif (Times)' },
  { value: 'Courier', label: 'Mono (Courier)' },
];
const STAMPS = ['APPROVED', 'REVIEWED', 'DRAFT', 'CONFIDENTIAL', 'FOR INFORMATION', 'RECEIVED', 'VOID'];
const DEFAULT_COLOR = {
  highlight: '#ffec3d', rect: '#ff4d4f', ellipse: '#52c41a', line: '#1890ff', ink: '#1d39c4',
  note: '#fff566', stamp: '#d4380d', textbox: '#000000', whiteout: '#ffffff', erase: '#ffffff',
};
// tool names used by the ribbon in DocumentEditor -> internal names
const RIBBON_TOOL = { 'text-edit': 'editText', text: 'addText' };

const EllipseIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <ellipse cx="8" cy="8" rx="6.5" ry="4.8" />
  </svg>
);
const EraserIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M6.2 13.5 1.9 9.2a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0l4.9 4.9a1 1 0 0 1 0 1.4l-6 6H14" />
    <path d="m5 4.8 6.2 6.2" />
  </svg>
);
const PenIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M2 13c2-3 3-6 5-6s1 4 3 4 2-5 4-7" />
  </svg>
);

const TOOLS = [
  { key: 'select', label: 'Select', icon: <SelectOutlined />, group: 'view',
    hint: 'Click an item you added to select it. Drag to move, drag the blue corner to resize, press Delete to remove. Double-click text to type.' },
  { key: 'hand', label: 'Hand', icon: <DragOutlined />, group: 'view',
    hint: 'Drag the page to scroll. Nothing is changed in this mode.' },
  { key: 'editText', label: 'Edit Text', icon: <EditOutlined />, group: 'edit',
    hint: 'Editable text is outlined in blue. Click a line and type — it keeps the same font, size and colour. Enter = new line, Esc or click outside = done.' },
  { key: 'addText', label: 'Add Text', icon: <FontSizeOutlined />, group: 'edit',
    hint: 'Click where the new text should start and type. Change font, size and colour in the bar above. Press Enter for a new line.' },
  { key: 'whiteout', label: 'White-out', icon: <ClearOutlined />, group: 'edit',
    hint: 'Drag over anything you want to erase. The patch takes the page background colour automatically (change it above). Then use Add Text to write on it.' },
  { key: 'erase', label: 'Eraser', icon: <EraserIcon />, group: 'edit',
    hint: 'Drag over lines, words or pictures to delete them. Nothing is painted on top, the paper shows through. Stamps and comments fully inside the area are removed too.' },
  { key: 'highlight', label: 'Highlight', icon: <HighlightOutlined />, group: 'mark',
    hint: 'Drag over text to highlight it. Pick another colour in the bar above.' },
  { key: 'ink', label: 'Pen', icon: <PenIcon />, group: 'mark',
    hint: 'Hold the mouse button (or finger) down and draw freely.' },
  { key: 'rect', label: 'Rectangle', icon: <BorderOutlined />, group: 'mark', hint: 'Drag to draw a rectangle.' },
  { key: 'ellipse', label: 'Ellipse', icon: <EllipseIcon />, group: 'mark', hint: 'Drag to draw an ellipse or circle.' },
  { key: 'line', label: 'Line', icon: <LineOutlined />, group: 'mark', hint: 'Drag from the start point to the end point.' },
  { key: 'note', label: 'Note', icon: <MessageOutlined />, group: 'mark',
    hint: 'Click to place a sticky note, then type your comment.' },
  { key: 'stamp', label: 'Stamp', icon: <CheckSquareOutlined />, group: 'mark',
    hint: 'Choose the stamp text with the arrow next to the Stamp button, then click on the page to place it.' },
  { key: 'redact', label: 'Redact', icon: <EyeInvisibleOutlined />, group: 'secure',
    hint: 'Drag over confidential content, then press "Apply redactions". Redaction permanently deletes it and issues a certificate.' },
];
const TOOL_BY_KEY = Object.fromEntries(TOOLS.map((t) => [t.key, t]));

const newId = () => `o_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const isTextType = (t) => t === 'textbox' || t === 'textedit';
const hasBox = (t) => ['whiteout', 'erase', 'highlight', 'rect', 'ellipse', 'note', 'stamp'].includes(t);

let measureCtx = null;
const measureText = (o) => {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = `${o.italic ? 'italic ' : ''}${o.bold ? 'bold ' : ''}${o.size}px ${CSS_FONT[o.font] || CSS_FONT.Helvetica}`;
  const lines = String(o.text || '').split('\n');
  const w = Math.max(8, ...lines.map((l) => measureCtx.measureText(l || ' ').width));
  return { w, h: lines.length * LINE_HEIGHT * o.size, lines: lines.length };
};

const stampFontSize = (o) => {
  let size = Math.max(8, Math.min(o.h * 0.55, 48));
  const w = measureText({ text: o.text, size, bold: true, font: 'Helvetica' }).w;
  if (w > o.w - 8) size = size * (o.w - 8) / w;
  return size;
};

// top-left of a text object's line box, in page points
const textTop = (o) => (o.type === 'textedit' ? o.baseline - (BASELINE_RATIO[o.font] || 0.947) * o.size : o.y);
const textLeft = (o) => o.x;

// bounding box of any object (page points) — used for selection outlines and hit testing
const objectBox = (o) => {
  if (isTextType(o.type)) {
    const m = measureText(o);
    return { x: textLeft(o), y: textTop(o), w: m.w, h: m.h };
  }
  if (o.type === 'line') {
    return { x: Math.min(o.x1, o.x2), y: Math.min(o.y1, o.y2), w: Math.abs(o.x2 - o.x1) || 1, h: Math.abs(o.y2 - o.y1) || 1 };
  }
  if (o.type === 'ink') {
    const xs = o.points.map((p) => p[0]); const ys = o.points.map((p) => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs) || 1, h: Math.max(...ys) - Math.min(...ys) || 1 };
  }
  return { x: o.x, y: o.y, w: o.w, h: o.h };
};

const moveObject = (o, dx, dy) => {
  if (o.type === 'line') return { ...o, x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy };
  if (o.type === 'ink') return { ...o, points: o.points.map(([x, y]) => [x + dx, y + dy]) };
  if (o.type === 'textedit') return { ...o, x: o.x + dx, baseline: o.baseline + dy };
  return { ...o, x: o.x + dx, y: o.y + dy };
};

// Sample the page canvas around a rectangle and return the most common colour (the background).
const sampleBackground = (canvas, box, scale) => {
  try {
    if (!canvas) return '#ffffff';
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const k = canvas.width / (parseFloat(canvas.style.width) || canvas.width); // device px per CSS px
    const pad = 3;
    const x0 = Math.max(0, Math.floor((box.x * scale - pad) * k));
    const y0 = Math.max(0, Math.floor((box.y * scale - pad) * k));
    const x1 = Math.min(canvas.width - 1, Math.ceil(((box.x + box.w) * scale + pad) * k));
    const y1 = Math.min(canvas.height - 1, Math.ceil(((box.y + box.h) * scale + pad) * k));
    if (x1 <= x0 || y1 <= y0) return '#ffffff';
    const { data, width } = ctx.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    const h = data.length / 4 / width;
    const buckets = new Map();
    const add = (px, py) => {
      const i = (py * width + px) * 4;
      const key = `${data[i] >> 3},${data[i + 1] >> 3},${data[i + 2] >> 3}`;
      const b = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
      b.n += 1; b.r += data[i]; b.g += data[i + 1]; b.b += data[i + 2];
      buckets.set(key, b);
    };
    const ring = Math.max(1, Math.round(2 * k));
    for (let px = 0; px < width; px++) {
      for (let t = 0; t < ring; t++) { add(px, t); add(px, h - 1 - t); }
    }
    for (let py = 0; py < h; py++) {
      for (let t = 0; t < ring; t++) { add(t, py); add(width - 1 - t, py); }
    }
    let best = null;
    buckets.forEach((b) => { if (!best || b.n > best.n) best = b; });
    if (!best) return '#ffffff';
    const hex = (v) => Math.round(v / best.n).toString(16).padStart(2, '0');
    return `#${hex(best.r)}${hex(best.g)}${hex(best.b)}`;
  } catch (err) {
    return '#ffffff';
  }
};

// What the server needs for each object (UI-only fields removed)
const toPayload = (o) => {
  const base = { type: o.type, page: o.page };
  switch (o.type) {
    case 'textedit':
      return { ...base, cover: o.removeBand, x: o.x, baseline: o.baseline, text: o.text, size: o.size,
               font: o.font, bold: !!o.bold, italic: !!o.italic, color: o.color, ocr: !!o.ocr };
    case 'erase':
      return { ...base, x: o.x, y: o.y, w: o.w, h: o.h };
    case 'textbox':
      return { ...base, x: o.x, y: o.y, text: o.text, size: o.size, font: o.font, bold: !!o.bold,
               italic: !!o.italic, color: o.color, align: o.align || 'left', bg: o.bg || null };
    case 'line':
      return { ...base, x1: o.x1, y1: o.y1, x2: o.x2, y2: o.y2, color: o.color, width: o.width || 2 };
    case 'ink':
      return { ...base, points: o.points, color: o.color, width: o.width || 2 };
    default:
      return { ...base, x: o.x, y: o.y, w: o.w, h: o.h, color: o.color, width: o.width || 2, text: o.text };
  }
};

// ============================================================
// PDF EDITOR
// ============================================================
const PDFEditor = forwardRef(({
  pdfUrl,
  documentId,
  activeTool = 'select',
  onToolChange,
  onSave,      // legacy: receives a Blob (only used when the file is not stored in Document Control)
  onSaved,     // receives the updated document after a server save
  signaturePlacing: signatureRequested = false,
  onSignaturePlacingChange,
  showFormPanel: formPanelRequested = false,
}, ref) => {
  // ---------------- loading / viewport ----------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [baseDims, setBaseDims] = useState([]);          // page size in points (scale 1)
  const [renderedPages, setRenderedPages] = useState(new Set());
  const [showThumbs, setShowThumbs] = useState(window.innerWidth > 900);

  // ---------------- editing ----------------
  const [tool, setToolState] = useState(RIBBON_TOOL[activeTool] || activeTool || 'select');
  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);              // shape being drawn
  const [style, setStyle] = useState({ font: 'Helvetica', size: 12, bold: false, italic: false, color: '#000000' });
  const [stampText, setStampText] = useState('APPROVED');
  const [textLines, setTextLines] = useState({});        // { [page]: { status, lines, likelyScanned } }
  const [saving, setSaving] = useState(false);
  const [, setHistoryTick] = useState(0);                // re-render when undo/redo stacks change
  const [helpOpen, setHelpOpen] = useState(false);

  // ---------------- kept features ----------------
  const [signaturePlacing, setSignaturePlacing] = useState(false);
  const [activeSignature, setActiveSignature] = useState(null);
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [pendingRedactions, setPendingRedactions] = useState([]);
  const [redactionModalOpen, setRedactionModalOpen] = useState(false);
  const [redactionReason, setRedactionReason] = useState('');
  const [redactionBasis, setRedactionBasis] = useState('policy');
  const [applying, setApplying] = useState(false);
  const [redactionHistoryOpen, setRedactionHistoryOpen] = useState(false);
  const [redactionHistory, setRedactionHistory] = useState([]);

  // ---------------- refs ----------------
  const viewportRef = useRef(null);
  const canvasRefs = useRef({});
  const overlayRefs = useRef({});
  const pageWrapperRefs = useRef({});
  const objectsRef = useRef(objects);
  const pastRef = useRef([]);
  const futureRef = useRef([]);
  const gestureRef = useRef(null);
  const editSnapshotRef = useRef(null);
  const draftRef = useRef(null);
  const loadSerialRef = useRef(0);
  const fittedRef = useRef(false);
  objectsRef.current = objects;

  const pageDims = useMemo(
    () => baseDims.map((d) => ({ width: Math.floor(d.width * scale), height: Math.floor(d.height * scale) })),
    [baseDims, scale]
  );

  // ============================================================
  // TOOL SELECTION (ribbon prop <-> internal state)
  // ============================================================
  const setTool = useCallback((t) => {
    setToolState(t);
    setDraft(null);
    setEditingId(null);
    if (t !== 'select') setSelectedId(null);
    const ribbonName = Object.keys(RIBBON_TOOL).find((k) => RIBBON_TOOL[k] === t) || t;
    onToolChange?.(ribbonName);
  }, [onToolChange]);

  useEffect(() => {
    const mapped = RIBBON_TOOL[activeTool] || activeTool;
    if (mapped && TOOL_BY_KEY[mapped]) setToolState(mapped);
  }, [activeTool]);

  // ============================================================
  // HISTORY (undo / redo)
  // ============================================================
  const commit = useCallback((next) => {
    pastRef.current.push(objectsRef.current);
    if (pastRef.current.length > 100) pastRef.current.shift();
    futureRef.current = [];
    setObjects(next);
    setHistoryTick((t) => t + 1);
  }, []);

  const undo = useCallback(() => {
    if (!pastRef.current.length) return;
    futureRef.current.push(objectsRef.current);
    setObjects(pastRef.current.pop());
    setEditingId(null);
    setSelectedId(null);
    setHistoryTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    pastRef.current.push(objectsRef.current);
    setObjects(futureRef.current.pop());
    setEditingId(null);
    setHistoryTick((t) => t + 1);
  }, []);

  const updateObject = useCallback((id, patch, withHistory = true) => {
    const next = objectsRef.current.map((o) => (o.id === id ? { ...o, ...patch } : o));
    if (withHistory) commit(next); else setObjects(next);
  }, [commit]);

  const deleteObject = useCallback((id) => {
    commit(objectsRef.current.filter((o) => o.id !== id));
    setSelectedId(null);
    setEditingId(null);
  }, [commit]);

  // ============================================================
  // ZOOM
  // ============================================================
  const clampScale = (s) => +Math.max(0.25, Math.min(4, s)).toFixed(2);
  const zoomIn = useCallback(() => setScale((s) => clampScale(s + 0.15)), []);
  const zoomOut = useCallback(() => setScale((s) => clampScale(s - 0.15)), []);
  const actualSize = useCallback(() => setScale(1), []);
  const fitWidth = useCallback(() => {
    const d = baseDims[currentPage - 1];
    if (!d || !viewportRef.current) return;
    setScale(clampScale((viewportRef.current.clientWidth - 64) / d.width));
  }, [baseDims, currentPage]);
  const fitPage = useCallback(() => {
    const d = baseDims[currentPage - 1];
    if (!d || !viewportRef.current) return;
    const el = viewportRef.current;
    setScale(clampScale(Math.min((el.clientWidth - 48) / d.width, (el.clientHeight - 48) / d.height)));
  }, [baseDims, currentPage]);

  const goToPage = useCallback((num) => {
    const n = Math.max(1, Math.min(numPages, num));
    setCurrentPage(n);
    const el = viewportRef.current;
    const wrapper = pageWrapperRefs.current[n];
    if (el && wrapper) el.scrollTop = wrapper.offsetTop - 24;
  }, [numPages]);

  // ============================================================
  // LOAD PDF
  // ============================================================
  const loadPDF = useCallback(async () => {
    if (!documentId && !pdfUrl) return;
    setLoading(true);
    setError(null);
    setPendingRedactions([]);
    setRenderedPages(new Set());
    setTextLines({});
    loadSerialRef.current += 1;
    try {
      const token = getAuthToken();
      const res = await fetch(documentId ? buildRawUrl(documentId) : pdfUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(res.status === 401 ? 'Your session has expired. Please log in again.'
          : res.status === 403 ? 'You do not have access to this document.'
          : res.status === 404 ? 'The PDF file for this document was not found.'
          : `The server answered ${res.status}.`);
      }
      const buffer = await res.arrayBuffer();
      const head = new TextDecoder().decode(new Uint8Array(buffer).slice(0, 5));
      if (head !== '%PDF-') throw new Error('This file is not a PDF.');
      setPdfBytes(buffer);
      // PDF.js transfers the buffer to its worker, so give it a copy and keep ours intact
      const doc = await openPdf(new Uint8Array(buffer.slice(0)));
      const dims = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const vp = (await doc.getPage(i)).getViewport({ scale: 1 });
        dims.push({ width: vp.width, height: vp.height });
      }
      setBaseDims(dims);
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
    } catch (err) {
      console.error('[PDFEditor] load failed:', err);
      setError(err.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  }, [documentId, pdfUrl]);

  useEffect(() => { fittedRef.current = false; loadPDF(); }, [loadPDF]);

  // fit the first page to the available width once the viewport exists
  useEffect(() => {
    if (fittedRef.current || !pdfDoc || !baseDims[0] || !viewportRef.current) return;
    fittedRef.current = true;
    const w = viewportRef.current.clientWidth - 64;
    if (w > 100) setScale(clampScale(Math.min(1.5, Math.max(0.4, w / baseDims[0].width))));
  }, [pdfDoc, baseDims]);

  useEffect(() => {
    const reload = () => loadPDF();
    window.addEventListener('pdf-reload', reload);
    return () => window.removeEventListener('pdf-reload', reload);
  }, [loadPDF]);

  useEffect(() => {
    if (!documentId) return;
    (async () => {
      try {
        const data = await documentService.getPdfFormFields(documentId);
        setShowFormPanel((data.fields || []).length > 0);
      } catch (err) { /* form panel is optional */ }
    })();
  }, [documentId]);

  // first-time help
  useEffect(() => {
    try {
      if (!localStorage.getItem('pdfEditorHelpSeen')) {
        setHelpOpen(true);
        localStorage.setItem('pdfEditorHelpSeen', '1');
      }
    } catch (e) { /* storage unavailable */ }
  }, []);

  // ============================================================
  // VIRTUALISED RENDERING
  // ============================================================
  useEffect(() => { setRenderedPages(new Set()); }, [scale]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || pageDims.length === 0) return undefined;
    const onScroll = () => {
      const top = el.scrollTop; const bottom = top + el.clientHeight;
      let y = 24; let first = null; let last = 1; let mostVisible = 1; let best = -1;
      for (let i = 0; i < pageDims.length; i++) {
        const pTop = y; const pBottom = y + pageDims[i].height;
        const visible = Math.min(pBottom, bottom) - Math.max(pTop, top);
        if (visible > 0) {
          if (first === null) first = i + 1;
          last = i + 1;
          if (visible > best) { best = visible; mostVisible = i + 1; }
        }
        y = pBottom + PAGE_GAP;
      }
      if (first === null) first = 1;
      setCurrentPage(mostVisible);
      setRenderedPages((prev) => {
        const next = new Set(prev); let changed = false;
        for (let p = Math.max(1, first - PRELOAD_RANGE); p <= Math.min(numPages, last + PRELOAD_RANGE); p++) {
          if (!next.has(p)) { next.add(p); changed = true; }
        }
        return changed ? next : prev;
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [pageDims, numPages]);

  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDoc) return;
    const canvas = canvasRefs.current[pageNum];
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const w = Math.floor(viewport.width); const h = Math.floor(viewport.height);
    const key = `${w}x${h}@${dpr}#${loadSerialRef.current}`;
    if (canvas.dataset.key === key) return;
    canvas.dataset.key = key;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    try {
      await page.render({
        canvasContext: canvas.getContext('2d', { willReadFrequently: true }),
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
      }).promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') console.error(`Render page ${pageNum}:`, err);
    }
  }, [pdfDoc, scale]);

  useEffect(() => { renderedPages.forEach((p) => renderPage(p)); }, [renderedPages, renderPage]);

  // ============================================================
  // EDITABLE TEXT DETECTION (server, PyMuPDF)
  // ============================================================
  useEffect(() => {
    if (tool !== 'editText' || !documentId) return;
    renderedPages.forEach((p) => {
      if (textLines[p]) return;
      setTextLines((prev) => ({ ...prev, [p]: { status: 'loading', lines: [] } }));
      documentService.getPdfTextLines(documentId, p)
        .then((data) => setTextLines((prev) => ({
          ...prev, [p]: { status: 'ready', lines: data.lines || [], likelyScanned: data.likely_scanned },
        })))
        .catch(() => setTextLines((prev) => ({ ...prev, [p]: { status: 'error', lines: [] } })));
    });
  }, [tool, documentId, renderedPages, textLines]);

  // CAD drawings draw most lettering as lines: read those words with OCR on the server (one page at a time)
  const findDrawnWords = useCallback((p) => {
    if (!documentId) return;
    setTextLines((prev) => ({ ...prev, [p]: { ...(prev[p] || { lines: [] }), status: 'ocr' } }));
    documentService.getPdfTextLines(documentId, p, { ocr: true })
      .then((data) => {
        const found = data.ocr_found || 0;
        setTextLines((prev) => ({ ...prev, [p]: { status: 'ready', lines: data.lines || [], likelyScanned: data.likely_scanned, ocrDone: true, ocrFound: found } }));
        if (found) message.success(`Found ${found} drawn line${found === 1 ? '' : 's'} of words on page ${p}. They are outlined in orange — click one to edit it.`);
        else message.info(`No more words could be read on page ${p}.`);
      })
      .catch((err) => {
        setTextLines((prev) => ({ ...prev, [p]: { ...(prev[p] || { lines: [] }), status: 'ready' } }));
        message.error(err?.response?.data?.error || 'Word recognition failed. Please try again.');
      });
  }, [documentId]);

  const editedLineIds = useMemo(
    () => new Set(objects.filter((o) => o.type === 'textedit').map((o) => o.lineId)),
    [objects]
  );

  const startEditLine = (page, line) => {
    const existing = objectsRef.current.find((o) => o.type === 'textedit' && o.lineId === line.id);
    if (existing) { setSelectedId(existing.id); setEditingId(existing.id); return; }
    const bbox = { x: line.x0, y: line.y0, w: line.x1 - line.x0, h: line.y1 - line.y0 };
    const obj = {
      id: newId(), type: 'textedit', page, lineId: line.id,
      original: line.text,
      text: line.text,
      x: line.origin_x, baseline: line.baseline, size: line.size,
      font: line.font, bold: line.bold, italic: line.italic, color: line.color,
      preview: { x: bbox.x - 1, y: bbox.y - 0.5, w: bbox.w + 2, h: bbox.h + 1 },
      coverColor: sampleBackground(canvasRefs.current[page], bbox, scale),
      // band around the baseline that the server clears (never reaches neighbouring lines);
      // words found by OCR are drawn as lines, so their whole box is erased
      removeBand: line.ocr ? [line.x0 - 1, line.y0 - 1, line.x1 + 1, line.y1 + 1]
        : [line.x0 - 0.5, line.baseline - 0.6 * line.size, line.x1 + 0.5, line.baseline + 0.1 * line.size],
      ocr: !!line.ocr,
    };
    if (line.mixed_styles) message.info('This line mixes several fonts. It will be rewritten in one style.');
    editSnapshotRef.current = objectsRef.current;
    setObjects([...objectsRef.current, obj]);
    setSelectedId(obj.id);
    setEditingId(obj.id);
  };

  // ============================================================
  // POINTER INTERACTION
  // ============================================================
  const toPagePoint = (pageNum, e) => {
    const el = overlayRefs.current[pageNum];
    const r = el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  };

  const finishEditing = useCallback(() => {
    const id = editingId;
    if (!id) return;
    setEditingId(null);
    const obj = objectsRef.current.find((o) => o.id === id);
    const before = editSnapshotRef.current;
    editSnapshotRef.current = null;
    if (!obj) return;
    if (obj.type === 'textbox' && !String(obj.text || '').trim()) {
      setObjects(objectsRef.current.filter((o) => o.id !== id));   // empty new box -> drop it
      setSelectedId(null);
      return;
    }
    if (obj.type === 'textedit' && obj.text === obj.original && before && !before.some((o) => o.id === id)) {
      setObjects(objectsRef.current.filter((o) => o.id !== id));   // opened but unchanged -> no edit
      setSelectedId(null);
      return;
    }
    if (before) {
      pastRef.current.push(before);
      futureRef.current = [];
      setHistoryTick((t) => t + 1);
    }
  }, [editingId]);

  const onPagePointerDown = (pageNum) => (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (editingId) { finishEditing(); if (tool !== 'select') return; }

    if (tool === 'hand') {
      gestureRef.current = { kind: 'pan', x: e.clientX, y: e.clientY,
        sl: viewportRef.current.scrollLeft, st: viewportRef.current.scrollTop };
      e.preventDefault();
      return;
    }
    const pt = toPagePoint(pageNum, e);

    if (tool === 'select' || tool === 'editText') {
      setSelectedId(null);
      return;
    }
    if (tool === 'addText') {
      const obj = { id: newId(), type: 'textbox', page: pageNum, x: pt.x, y: pt.y - style.size * 0.6,
        text: '', ...style, align: 'left', bg: null };
      editSnapshotRef.current = objectsRef.current;
      setObjects([...objectsRef.current, obj]);
      setSelectedId(obj.id);
      setEditingId(obj.id);
      e.preventDefault();
      return;
    }
    if (tool === 'note') {
      const obj = { id: newId(), type: 'note', page: pageNum, x: pt.x, y: pt.y, w: 170, h: 70,
        text: '', color: DEFAULT_COLOR.note };
      editSnapshotRef.current = objectsRef.current;
      setObjects([...objectsRef.current, obj]);
      setSelectedId(obj.id);
      setEditingId(obj.id);
      e.preventDefault();
      return;
    }
    if (tool === 'stamp') {
      const w = Math.max(90, measureText({ text: stampText, size: 22, bold: true, font: 'Helvetica' }).w + 28);
      const obj = { id: newId(), type: 'stamp', page: pageNum, x: pt.x - w / 2, y: pt.y - 22, w, h: 44,
        text: stampText, color: DEFAULT_COLOR.stamp };
      commit([...objectsRef.current, obj]);
      setSelectedId(obj.id);
      return;
    }
    // drag-to-draw tools
    gestureRef.current = { kind: 'draw', page: pageNum };
    draftRef.current = { type: tool, page: pageNum, x0: pt.x, y0: pt.y, x1: pt.x, y1: pt.y,
      points: tool === 'ink' ? [[pt.x, pt.y]] : null };
    setDraft(draftRef.current);
    e.preventDefault();
  };

  const onObjectPointerDown = (obj, mode) => (e) => {
    if (tool === 'editText' && obj.type === 'textedit') {
      e.stopPropagation();
      e.preventDefault();   // a mouse press would otherwise move focus away and close the text box at once
      if (editingId && editingId !== obj.id) finishEditing();
      editSnapshotRef.current = objectsRef.current;
      setSelectedId(obj.id);
      setEditingId(obj.id);
      return;
    }
    if (tool !== 'select') return;
    e.stopPropagation();
    if (editingId && editingId !== obj.id) finishEditing();
    if (editingId === obj.id) return;   // clicks inside the text being edited
    setSelectedId(obj.id);
    const pt = toPagePoint(obj.page, e);
    gestureRef.current = { kind: mode, id: obj.id, page: obj.page, start: pt, orig: obj,
      snapshot: objectsRef.current, moved: false };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      const g = gestureRef.current;
      if (!g) return;
      if (g.kind === 'pan') {
        viewportRef.current.scrollLeft = g.sl - (e.clientX - g.x);
        viewportRef.current.scrollTop = g.st - (e.clientY - g.y);
        return;
      }
      const pt = toPagePoint(g.page, e);
      if (g.kind === 'draw') {
        const d = draftRef.current;
        if (d) {
          draftRef.current = { ...d, x1: pt.x, y1: pt.y, points: d.points ? [...d.points, [pt.x, pt.y]] : null };
          setDraft(draftRef.current);
        }
        return;
      }
      const dx = pt.x - g.start.x; const dy = pt.y - g.start.y;
      if (Math.abs(dx) + Math.abs(dy) > 0.5) g.moved = true;
      if (g.kind === 'move') {
        setObjects(g.snapshot.map((o) => (o.id === g.id ? moveObject(g.orig, dx, dy) : o)));
      } else if (g.kind === 'resize') {
        const o = g.orig;
        let patch;
        if (isTextType(o.type)) {
          const box = objectBox(o);
          const ratio = Math.max(0.2, (box.h + dy) / box.h);
          patch = { size: Math.max(4, Math.min(144, +(o.size * ratio).toFixed(1))) };
        } else {
          patch = { w: Math.max(6, o.w + dx), h: Math.max(6, o.h + dy) };
        }
        setObjects(g.snapshot.map((x) => (x.id === g.id ? { ...o, ...patch } : x)));
      }
    };
    const onUp = () => {
      const g = gestureRef.current;
      gestureRef.current = null;
      if (!g) return;
      if (g.kind === 'draw') {
        const d = draftRef.current;
        draftRef.current = null;
        setDraft(null);
        if (d) {
          const x = Math.min(d.x0, d.x1); const y = Math.min(d.y0, d.y1);
          const w = Math.abs(d.x1 - d.x0); const h = Math.abs(d.y1 - d.y0);
          let obj = null;
          if (d.type === 'ink') {
            if (d.points && d.points.length > 2) obj = { type: 'ink', points: d.points, color: DEFAULT_COLOR.ink, width: 2 };
          } else if (d.type === 'line') {
            if (w + h > 4) obj = { type: 'line', x1: d.x0, y1: d.y0, x2: d.x1, y2: d.y1, color: DEFAULT_COLOR.line, width: 2 };
          } else if (w > 3 && h > 3) {
            if (d.type === 'redact') {
              setPendingRedactions((prev) => [...prev, { page: d.page, x, y, w, h }]);
            } else if (d.type === 'erase') {
              obj = { type: 'erase', x, y, w, h, color: '#ffffff' };
            } else if (d.type === 'whiteout') {
              obj = { type: 'whiteout', x, y, w, h, autoColor: true,
                color: sampleBackground(canvasRefs.current[d.page], { x, y, w, h }, scale) };
            } else {
              obj = { type: d.type, x, y, w, h, color: DEFAULT_COLOR[d.type] || '#1890ff', width: 2 };
            }
          }
          if (obj) {
            const full = { ...obj, id: newId(), page: d.page };
            commit([...objectsRef.current, full]);
            setSelectedId(full.id);
          }
        }
        return;
      }
      if ((g.kind === 'move' || g.kind === 'resize') && g.moved) {
        pastRef.current.push(g.snapshot);
        futureRef.current = [];
        setHistoryTick((t) => t + 1);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    // toPagePoint only depends on scale
    // eslint-disable-next-line
  }, [scale, commit]);

  // ============================================================
  // SIGNATURE (toolbar button or ribbon "Place signature")
  // ============================================================
  const startSignature = useCallback(async () => {
    try {
      const sig = await documentService.getLatestSignature(documentId);
      const image = sig?.signature_data?.image;
      if (!image) { message.warning('You have no saved signature for this document yet. Use "Sign" in the ribbon to create one first.'); return; }
      setActiveSignature(image);
      setSignaturePlacing(true);
      message.info('Click on the page where the signature should go.');
    } catch (err) { message.error('Could not load your signature.'); }
  }, [documentId]);

  useEffect(() => {
    if (!signatureRequested) return;
    startSignature();
    onSignaturePlacingChange?.(false);
  }, [signatureRequested, startSignature, onSignaturePlacingChange]);

  useEffect(() => { if (formPanelRequested) setShowFormPanel(true); }, [formPanelRequested]);

  // ============================================================
  // SAVE
  // ============================================================
  const pendingChanges = useMemo(
    () => objects.filter((o) => !(o.type === 'textedit' && o.text === o.original)),
    [objects]
  );
  const dirty = pendingChanges.length > 0;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const doSave = useCallback(async () => {
    if (editingId) finishEditing();
    const changes = objectsRef.current.filter((o) => !(o.type === 'textedit' && o.text === o.original));
    if (!changes.length) { message.info('There are no changes to save yet.'); return; }
    if (!documentId) {
      message.warning('This PDF is not stored in Document Control yet, so it cannot be saved from here.');
      return;
    }
    setSaving(true);
    try {
      message.loading({ content: 'Saving your changes…', key: 'pdfsave', duration: 0 });
      const res = await documentService.applyPdfEdits(documentId, changes.map(toPayload));
      message.success({ content: `Saved. This is now version ${res.version}; the previous version is kept in history.`, key: 'pdfsave' });
      setObjects([]);
      pastRef.current = []; futureRef.current = [];
      setSelectedId(null);
      setHistoryTick((t) => t + 1);
      onSaved?.(res.document);
      await loadPDF();
    } catch (err) {
      const text = err.code === 'FEATURE_NOT_AVAILABLE'
        ? 'Editing PDFs is available on the Professional plan and above.'
        : (err.message || 'Could not save the edited PDF.');
      message.error({ content: text, key: 'pdfsave', duration: 6 });
    } finally {
      setSaving(false);
    }
  }, [documentId, editingId, finishEditing, loadPDF, onSaved]);

  const confirmSave = useCallback(() => {
    if (!dirty) { message.info('There are no changes to save yet.'); return; }
    Modal.confirm({
      title: `Save ${pendingChanges.length} change${pendingChanges.length > 1 ? 's' : ''}?`,
      content: 'Your edits are written into the PDF and saved as a new version. The current file stays in the version history, so you can go back to it.',
      okText: 'Save as new version',
      onOk: doSave,
    });
  }, [dirty, pendingChanges.length, doSave]);

  const downloadCurrent = () => {
    if (!pdfBytes) return;
    const url = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url; a.download = `document-${documentId || 'file'}.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    if (dirty) message.info('Downloaded the last saved version. Save first to include your current changes.');
    if (!documentId && onSave) onSave(new Blob([pdfBytes], { type: 'application/pdf' }));
  };

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================
  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); confirmSave(); return; }
      if (typing) {
        if (e.key === 'Escape') finishEditing();
        return;
      }
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { e.preventDefault(); deleteObject(selectedId); return; }
      if (e.key === 'Escape') { draftRef.current = null; setDraft(null); setSelectedId(null); gestureRef.current = null; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmSave, finishEditing, undo, redo, deleteObject, selectedId]);

  // ============================================================
  // IMPERATIVE API (used by the ribbon in DocumentEditor)
  // ============================================================
  useImperativeHandle(ref, () => ({
    zoomIn, zoomOut, actualSize, fitWidth, fitPage,
    getScale: () => scale,
    getCurrentPage: () => currentPage,
    getNumPages: () => numPages,
    setCurrentPage: goToPage,
    save: confirmSave,
    undo,
    redo,
    setTool,
    hasUnsavedChanges: () => dirty,
  }), [zoomIn, zoomOut, actualSize, fitWidth, fitPage, scale, currentPage, numPages, goToPage,
    confirmSave, undo, redo, setTool, dirty]);

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  const selected = objects.find((o) => o.id === selectedId) || null;

  const applyStyle = (patch) => {
    setStyle((s) => ({ ...s, ...patch }));
    if (selected && (isTextType(selected.type))) updateObject(selected.id, patch);
  };

  const renderTextObject = (o) => {
    const isEditing = editingId === o.id;
    const isSel = selectedId === o.id;
    const top = textTop(o); const left = textLeft(o);
    const css = {
      fontFamily: CSS_FONT[o.font] || CSS_FONT.Helvetica,
      fontSize: `${o.size * scale}px`,
      lineHeight: LINE_HEIGHT,
      fontWeight: o.bold ? 700 : 400,
      fontStyle: o.italic ? 'italic' : 'normal',
      color: o.color,
      textAlign: o.align || 'left',
    };
    const m = measureText(o);
    return (
      <React.Fragment key={o.id}>
        {o.type === 'textedit' && (
          <div className="pe-cover" style={{
            left: o.preview.x * scale, top: o.preview.y * scale,
            width: o.preview.w * scale, height: o.preview.h * scale, background: o.coverColor,
          }} />
        )}
        {o.type === 'textbox' && o.bg && (
          <div className="pe-cover" style={{
            left: (left - 2) * scale, top: (top - 1) * scale,
            width: (m.w + 6) * scale, height: (m.h + 2) * scale, background: o.bg,
          }} />
        )}
        {isEditing ? (
          <textarea
            className="pe-text-input"
            autoFocus
            spellCheck
            value={o.text}
            rows={Math.max(1, m.lines)}
            onChange={(e) => updateObject(o.id, { text: e.target.value }, false)}
            onFocus={(e) => { const v = e.target.value; e.target.setSelectionRange(v.length, v.length); }}
            onBlur={finishEditing}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ ...css, left: left * scale - 3, top: top * scale - 2,
              width: (m.w + o.size * 2) * scale + 8, height: m.h * scale + 6 }}
          />
        ) : (
          <div
            className={`pe-text ${isSel ? 'pe-selected' : ''}`}
            style={{ ...css, left: left * scale, top: top * scale, minWidth: 8,
              pointerEvents: tool === 'select' || (tool === 'editText' && o.type === 'textedit') ? 'auto' : 'none' }}
            onPointerDown={onObjectPointerDown(o, 'move')}
            onDoubleClick={() => { editSnapshotRef.current = objectsRef.current; setSelectedId(o.id); setEditingId(o.id); }}
            title="Drag to move · double-click to edit"
          >
            {o.text || ' '}
            {isSel && <span className="pe-handle" onPointerDown={onObjectPointerDown(o, 'resize')} title="Drag to change size" />}
          </div>
        )}
      </React.Fragment>
    );
  };

  const renderBoxObject = (o) => {
    const isSel = selectedId === o.id;
    const isEditing = editingId === o.id;
    const style2 = { left: o.x * scale, top: o.y * scale, width: o.w * scale, height: o.h * scale,
      pointerEvents: tool === 'select' || isEditing ? 'auto' : 'none' };
    let inner = null; let cls = 'pe-box';
    if (o.type === 'whiteout') { style2.background = o.color; cls += ' pe-whiteout'; }
    if (o.type === 'erase') { style2.background = '#ffffff'; cls += ' pe-erase'; }
    if (o.type === 'highlight') { style2.background = o.color; style2.opacity = 0.4; style2.mixBlendMode = 'multiply'; }
    if (o.type === 'stamp') {
      style2.border = `2.5px solid ${o.color}`; style2.color = o.color; style2.fontSize = stampFontSize(o) * scale;
      cls += ' pe-stamp'; inner = o.text;
    }
    if (o.type === 'note') {
      style2.background = o.color; cls += ' pe-note';
      inner = isEditing ? (
        <textarea className="pe-note-input" autoFocus value={o.text} placeholder="Type your note…"
          onChange={(e) => updateObject(o.id, { text: e.target.value }, false)}
          onBlur={finishEditing} onPointerDown={(e) => e.stopPropagation()}
          style={{ fontSize: 10 * scale }} />
      ) : <span style={{ fontSize: 10 * scale }}>{o.text || 'Double-click to type'}</span>;
    }
    return (
      <div key={o.id} className={`${cls} ${isSel ? 'pe-selected' : ''}`} style={style2}
        onPointerDown={onObjectPointerDown(o, 'move')}
        onDoubleClick={() => { if (o.type === 'note') { editSnapshotRef.current = objectsRef.current; setEditingId(o.id); } }}>
        {inner}
        {isSel && !isEditing && <span className="pe-handle" onPointerDown={onObjectPointerDown(o, 'resize')} title="Drag to resize" />}
      </div>
    );
  };

  const renderSvgObject = (o) => {
    const s = scale; const isSel = selectedId === o.id;
    const common = { stroke: o.color, strokeWidth: (o.width || 2) * s, fill: 'none',
      onPointerDown: onObjectPointerDown(o, 'move'), style: { cursor: tool === 'select' ? 'move' : undefined, pointerEvents: tool === 'select' ? 'stroke' : 'none' } };
    let el = null;
    if (o.type === 'rect') el = <rect x={o.x * s} y={o.y * s} width={o.w * s} height={o.h * s} {...common} />;
    if (o.type === 'ellipse') el = <ellipse cx={(o.x + o.w / 2) * s} cy={(o.y + o.h / 2) * s} rx={o.w / 2 * s} ry={o.h / 2 * s} {...common} />;
    if (o.type === 'line') el = <line x1={o.x1 * s} y1={o.y1 * s} x2={o.x2 * s} y2={o.y2 * s} {...common} strokeLinecap="round" />;
    if (o.type === 'ink') el = <polyline points={o.points.map(([x, y]) => `${x * s},${y * s}`).join(' ')} {...common} strokeLinecap="round" strokeLinejoin="round" />;
    if (!el) return null;
    const b = objectBox(o);
    return (
      <g key={o.id}>
        <g style={{ pointerEvents: tool === 'select' ? 'stroke' : 'none' }}>{el}</g>
        {isSel && <rect x={b.x * s - 4} y={b.y * s - 4} width={b.w * s + 8} height={b.h * s + 8}
          fill="none" stroke="#1677ff" strokeDasharray="4 3" strokeWidth={1.2} />}
      </g>
    );
  };

  const renderDraft = (pageNum) => {
    if (!draft || draft.page !== pageNum) return null;
    const s = scale;
    const x = Math.min(draft.x0, draft.x1) * s; const y = Math.min(draft.y0, draft.y1) * s;
    const w = Math.abs(draft.x1 - draft.x0) * s; const h = Math.abs(draft.y1 - draft.y0) * s;
    if (draft.type === 'ink' && draft.points) {
      return <polyline points={draft.points.map(([px, py]) => `${px * s},${py * s}`).join(' ')} fill="none" stroke={DEFAULT_COLOR.ink} strokeWidth={2 * s} strokeLinecap="round" />;
    }
    if (draft.type === 'line') return <line x1={draft.x0 * s} y1={draft.y0 * s} x2={draft.x1 * s} y2={draft.y1 * s} stroke={DEFAULT_COLOR.line} strokeWidth={2 * s} />;
    if (draft.type === 'ellipse') return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="none" stroke={DEFAULT_COLOR.ellipse} strokeWidth={2 * s} strokeDasharray="4 3" />;
    const fill = draft.type === 'highlight' ? 'rgba(255,236,61,0.45)' : ['whiteout', 'erase'].includes(draft.type) ? 'rgba(255,255,255,0.9)'
      : draft.type === 'redact' ? 'rgba(0,0,0,0.6)' : 'rgba(24,144,255,0.08)';
    return <rect x={x} y={y} width={w} height={h} fill={fill} stroke={draft.type === 'rect' ? DEFAULT_COLOR.rect : '#1677ff'} strokeWidth={1.5} strokeDasharray="4 3" />;
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (loading && !pdfDoc) {
    return <div className="pe-center"><Spin size="large" tip="Loading PDF…"><div style={{ width: 120, height: 60 }} /></Spin></div>;
  }
  if (error) {
    return (
      <div className="pe-center">
        <Empty description={<span><b>The PDF could not be opened.</b><br />{error}</span>}>
          <Button onClick={loadPDF}>Try again</Button>
        </Empty>
      </div>
    );
  }

  const toolDef = TOOL_BY_KEY[tool] || TOOL_BY_KEY.select;
  const pageState = textLines[currentPage];
  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const toolButton = (t) => {
    const btn = (
      <Button
        key={t.key}
        className={`pe-tool ${tool === t.key ? 'pe-tool-active' : ''}`}
        type="text"
        onClick={() => setTool(t.key)}
        aria-pressed={tool === t.key}
      >
        <span className="pe-tool-icon">{t.icon}</span>
        <span className="pe-tool-label">{t.label}</span>
      </Button>
    );
    if (t.key !== 'stamp') return <Tooltip key={t.key} title={t.hint} mouseEnterDelay={0.6}>{btn}</Tooltip>;
    return (
      <span key={t.key} className="pe-tool-split">
        {btn}
        <Dropdown
          trigger={['click']}
          menu={{
            items: STAMPS.map((s) => ({ key: s, label: s })),
            selectable: true,
            selectedKeys: [stampText],
            onClick: ({ key }) => { setStampText(key); setTool('stamp'); },
          }}
        >
          <Button type="text" size="small" className="pe-tool-caret" icon={<DownOutlined />} aria-label="Choose stamp" />
        </Dropdown>
      </span>
    );
  };

  const groups = [['view'], ['edit'], ['mark'], ['secure']];

  return (
    <div className="pdf-editor pe-root">
      {/* ===================== TOOLBAR ===================== */}
      <div className="pe-toolbar">
        <div className="pe-tools">
          {groups.map((g, i) => (
            <React.Fragment key={g[0]}>
              {i > 0 && <Divider type="vertical" className="pe-divider" />}
              <div className="pe-group">
                {TOOLS.filter((t) => g.includes(t.group)).map(toolButton)}
                {g[0] === 'secure' && (
                  <Tooltip title="Place your saved signature on the current page">
                    <Button type="text" className="pe-tool" onClick={startSignature}>
                      <span className="pe-tool-icon"><SignatureOutlined /></span>
                      <span className="pe-tool-label">Sign</span>
                    </Button>
                  </Tooltip>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="pe-actions">
          <Tooltip title="Undo (Ctrl+Z)"><Button icon={<UndoOutlined />} onClick={undo} disabled={!canUndo} aria-label="Undo" /></Tooltip>
          <Tooltip title="Redo (Ctrl+Y)"><Button icon={<RedoOutlined />} onClick={redo} disabled={!canRedo} aria-label="Redo" /></Tooltip>
          <Tooltip title="How to edit this PDF"><Button icon={<QuestionCircleOutlined />} onClick={() => setHelpOpen(true)}>Help</Button></Tooltip>
          <Tooltip title="Download the last saved version"><Button icon={<DownloadOutlined />} onClick={downloadCurrent} aria-label="Download" /></Tooltip>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} disabled={!dirty} onClick={confirmSave}>
            {dirty ? `Save changes (${pendingChanges.length})` : 'Saved'}
          </Button>
        </div>
      </div>

      {/* ===================== PROPERTIES BAR ===================== */}
      <div className="pe-propbar">
        {(selected && isTextType(selected.type)) || (!selected && tool === 'addText') ? (
          <Space wrap size={6}>
            <Text type="secondary" className="pe-prop-label">{selected ? (selected.type === 'textedit' ? 'Edited text' : 'Text box') : 'New text'}</Text>
            <Select size="small" style={{ width: 190 }} value={(selected || style).font} options={FONT_OPTIONS}
              onChange={(v) => applyStyle({ font: v })} aria-label="Font" />
            <InputNumber size="small" min={4} max={144} step={0.5} value={(selected || style).size} addonAfter="pt"
              style={{ width: 100 }} onChange={(v) => v && applyStyle({ size: v })} aria-label="Font size" />
            <Button size="small" icon={<BoldOutlined />} type={(selected || style).bold ? 'primary' : 'default'}
              onClick={() => applyStyle({ bold: !(selected || style).bold })} aria-label="Bold" />
            <Button size="small" icon={<ItalicOutlined />} type={(selected || style).italic ? 'primary' : 'default'}
              onClick={() => applyStyle({ italic: !(selected || style).italic })} aria-label="Italic" />
            <label className="pe-color" title="Text colour">
              <input type="color" value={(selected || style).color} onChange={(e) => applyStyle({ color: e.target.value })} />
              Colour
            </label>
            {selected?.type === 'textbox' && (
              <>
                <Space.Compact size="small">
                  <Button icon={<AlignLeftOutlined />} type={selected.align === 'left' || !selected.align ? 'primary' : 'default'} onClick={() => updateObject(selected.id, { align: 'left' })} />
                  <Button icon={<AlignCenterOutlined />} type={selected.align === 'center' ? 'primary' : 'default'} onClick={() => updateObject(selected.id, { align: 'center' })} />
                  <Button icon={<AlignRightOutlined />} type={selected.align === 'right' ? 'primary' : 'default'} onClick={() => updateObject(selected.id, { align: 'right' })} />
                </Space.Compact>
                <label className="pe-color" title="Background behind the text">
                  <input type="checkbox" checked={!!selected.bg} onChange={(e) => updateObject(selected.id, { bg: e.target.checked ? '#ffffff' : null })} />
                  Background
                  {selected.bg && <input type="color" value={selected.bg} onChange={(e) => updateObject(selected.id, { bg: e.target.value })} />}
                </label>
              </>
            )}
            {selected?.type === 'textedit' && (
              <Text type="secondary" className="pe-prop-note">Original: “{selected.original}”</Text>
            )}
            {selected && (
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteObject(selected.id)}>
                {selected.type === 'textedit' ? 'Undo this edit' : 'Delete'}
              </Button>
            )}
          </Space>
        ) : selected ? (
          <Space wrap size={6}>
            <Text type="secondary" className="pe-prop-label">{TOOL_BY_KEY[selected.type]?.label || selected.type}</Text>
            {selected.type === 'stamp' && (
              <Select size="small" style={{ width: 170 }} value={selected.text}
                options={STAMPS.map((s) => ({ value: s, label: s }))}
                onChange={(v) => updateObject(selected.id, { text: v })} />
            )}
            {selected.type !== 'erase' && <label className="pe-color" title="Colour">
              <input type="color" value={selected.color} onChange={(e) => updateObject(selected.id, { color: e.target.value, autoColor: false })} />
              {selected.type === 'whiteout' ? 'Patch colour' : 'Colour'}
            </label>}
            {selected.type === 'whiteout' && (
              <Button size="small" icon={<BgColorsOutlined />} onClick={() => updateObject(selected.id, {
                color: sampleBackground(canvasRefs.current[selected.page], selected, scale), autoColor: true,
              })}>Match page background</Button>
            )}
            {['rect', 'ellipse', 'line', 'ink'].includes(selected.type) && (
              <InputNumber size="small" min={0.5} max={20} step={0.5} value={selected.width || 2} addonBefore="Width"
                style={{ width: 130 }} onChange={(v) => v && updateObject(selected.id, { width: v })} />
            )}
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteObject(selected.id)}>Delete</Button>
          </Space>
        ) : (
          <div className="pe-hint" role="status">
            <InfoCircleOutlined /> <b>{toolDef.label}:</b> {toolDef.hint}
            {tool === 'editText' && !documentId && <span className="pe-warn"> Text editing needs the file to be stored in Document Control.</span>}
            {tool === 'editText' && pageState?.status === 'loading' && <span> Finding text on page {currentPage}…</span>}
            {tool === 'editText' && pageState?.status === 'ready' && !pageState.lines.length && (
              <span className="pe-warn"> Page {currentPage} has no editable text{pageState.likelyScanned ? ' — it looks like a scanned image' : ''}{pageState.ocrDone ? '. Use the Eraser or White-out + Add Text instead.' : '.'}</span>
            )}
            {tool === 'editText' && documentId && pageState?.status === 'ready' && !pageState.ocrDone && (
              <Button size="small" type="primary" ghost style={{ marginLeft: 8 }} onClick={() => findDrawnWords(currentPage)}
                title="Drawings often draw their lettering as lines, so it cannot be clicked. This reads those words so you can edit them.">
                Find drawn words on page {currentPage}
              </Button>
            )}
            {tool === 'editText' && pageState?.status === 'ocr' && <span> Reading the words drawn on page {currentPage} (can take up to a minute)…</span>}
            {tool === 'editText' && pageState?.status === 'error' && <span className="pe-warn"> Could not read the text on this page.</span>}
          </div>
        )}
      </div>

      {/* ===================== MAIN ===================== */}
      <div className="pe-main">
        {showThumbs && (
          <div className="pe-thumbs">
            <PageThumbnailPanel
              documentId={documentId}
              onDocumentChange={(newDoc) => { onSaved?.(newDoc); window.dispatchEvent(new CustomEvent('pdf-reload')); }}
              onPageClick={goToPage}
              activePage={currentPage}
            />
          </div>
        )}

        <div className="pe-canvas-col">
          <div className="pe-viewbar">
            <Space size={4} wrap>
              <Tooltip title={showThumbs ? 'Hide page thumbnails' : 'Show page thumbnails'}>
                <Button size="small" icon={<MenuOutlined />} type={showThumbs ? 'primary' : 'default'} onClick={() => setShowThumbs((v) => !v)} />
              </Tooltip>
              <Button size="small" icon={<LeftOutlined />} disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)} aria-label="Previous page" />
              <span className="pe-pageno">
                Page <InputNumber size="small" min={1} max={numPages} value={currentPage} controls={false}
                  style={{ width: 52 }} onPressEnter={(e) => goToPage(Number(e.target.value))} /> of {numPages}
              </span>
              <Button size="small" icon={<RightOutlined />} disabled={currentPage >= numPages} onClick={() => goToPage(currentPage + 1)} aria-label="Next page" />
            </Space>
            <Space size={4} wrap>
              <Button size="small" icon={<ZoomOutOutlined />} onClick={zoomOut} aria-label="Zoom out" />
              <span className="pe-zoom">{Math.round(scale * 100)}%</span>
              <Button size="small" icon={<ZoomInOutlined />} onClick={zoomIn} aria-label="Zoom in" />
              <Tooltip title="Actual size"><Button size="small" icon={<OneToOneOutlined />} onClick={actualSize} /></Tooltip>
              <Tooltip title="Fit width"><Button size="small" icon={<ExpandOutlined />} onClick={fitWidth} /></Tooltip>
              <Tooltip title="Fit page"><Button size="small" icon={<CompressOutlined />} onClick={fitPage} /></Tooltip>
              <Tooltip title="Redaction history"><Button size="small" icon={<HistoryOutlined />} onClick={async () => {
                try {
                  const data = await documentService.getRedactionLogs({ document_id: documentId });
                  setRedactionHistory(data.redactions || []);
                  setRedactionHistoryOpen(true);
                } catch (err) { message.warning('Redaction history is unavailable.'); }
              }} /></Tooltip>
            </Space>
          </div>

          <div ref={viewportRef} className={`pe-viewport pe-tool-${tool}`}>
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
              const dims = pageDims[pageNum - 1];
              const shouldRender = renderedPages.has(pageNum);
              const pageObjects = objects.filter((o) => o.page === pageNum);
              const lines = tool === 'editText' ? (textLines[pageNum]?.lines || []) : [];
              return (
                <div key={pageNum} ref={(el) => { pageWrapperRefs.current[pageNum] = el; }}
                  className="pe-page" style={{ width: dims?.width, height: dims?.height }}
                  data-page={pageNum}>
                  {shouldRender ? (
                    <>
                      <canvas ref={(el) => { if (el) canvasRefs.current[pageNum] = el; }} className="pe-canvas" />
                      <div
                        ref={(el) => { if (el) overlayRefs.current[pageNum] = el; }}
                        className="pe-overlay"
                        onPointerDown={onPagePointerDown(pageNum)}
                      >
                        {/* editable text lines ("type boxes") */}
                        {lines.filter((l) => !editedLineIds.has(l.id)).map((l) => (
                          <div key={l.id} className={`pe-run${l.ocr ? ' pe-run-ocr' : ''}`}
                            style={{ left: (l.x0 - 1) * scale, top: (l.y0 - 1) * scale, width: (l.x1 - l.x0 + 2) * scale, height: (l.y1 - l.y0 + 2) * scale }}
                            title={l.ocr ? `Click to edit · drawn word read by OCR: "${l.text}" · rewritten in Sans ${Math.round(l.size * 10) / 10}pt`
                              : `Click to edit · ${l.font} ${Math.round(l.size * 10) / 10}pt${l.bold ? ' bold' : ''}${l.italic ? ' italic' : ''}`}
                            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); if (editingId) finishEditing(); startEditLine(pageNum, l); }}
                          />
                        ))}

                        <svg className="pe-svg" width={dims?.width || 0} height={dims?.height || 0}>
                          {pageObjects.filter((o) => ['rect', 'ellipse', 'line', 'ink'].includes(o.type)).map(renderSvgObject)}
                          {renderDraft(pageNum)}
                          {pendingRedactions.map((r, idx) => (r.page !== pageNum ? null : (
                            <g key={`red_${idx}`} className="pe-redaction" onPointerDown={(e) => {
                              e.stopPropagation();
                              Modal.confirm({
                                title: 'Remove this redaction mark?', okText: 'Remove',
                                onOk: () => setPendingRedactions((prev) => prev.filter((_, i) => i !== idx)),
                              });
                            }}>
                              <rect x={r.x * scale} y={r.y * scale} width={r.w * scale} height={r.h * scale} fill="black" fillOpacity={0.8} stroke="#ff4d4f" strokeWidth={2} />
                              <text x={r.x * scale + 4} y={r.y * scale + 13} fill="#fff" fontSize={11} fontWeight="bold">REDACT #{idx + 1}</text>
                            </g>
                          )))}
                        </svg>

                        {pageObjects.filter((o) => hasBox(o.type)).map(renderBoxObject)}
                        {pageObjects.filter((o) => isTextType(o.type)).map(renderTextObject)}
                      </div>
                    </>
                  ) : (
                    <div className="pe-placeholder"><Spin size="small" /> <span>Page {pageNum}</span></div>
                  )}
                </div>
              );
            })}

            {signaturePlacing && (
              <PDFSignaturePlacer
                containerRef={{ current: overlayRefs.current[currentPage] }}
                currentPage={currentPage}
                signature={activeSignature}
                onPlace={async (placement) => {
                  setSignaturePlacing(false);
                  try {
                    message.loading({ content: 'Placing signature…', key: 'stamp' });
                    const res = await documentService.stampSignature(documentId, {
                      image_data_url: activeSignature,
                      page_number: placement.page,
                      x_percent: placement.x_percent,
                      y_percent: placement.y_percent,
                      width_percent: placement.width_percent,
                    });
                    message.success({ content: 'Signature placed', key: 'stamp' });
                    setActiveSignature(null);
                    onSaved?.(res?.document);
                    window.dispatchEvent(new CustomEvent('pdf-reload'));
                  } catch (err) {
                    message.error({ content: err?.message || 'Failed to place signature', key: 'stamp' });
                  }
                }}
                onCancel={() => { setSignaturePlacing(false); setActiveSignature(null); }}
              />
            )}
          </div>
        </div>

        {showFormPanel && (
          <div className="pe-forms">
            <PDFFormPanel
              documentId={documentId}
              pageNumber={currentPage}
              fieldPositions={[]}
              onBackendSave={(res) => { message.success('Form saved'); onSaved?.(res?.document); }}
            />
          </div>
        )}
      </div>

      {pendingRedactions.length > 0 && (
        <Button type="primary" danger className="pe-float" icon={<SafetyCertificateOutlined />}
          onClick={() => setRedactionModalOpen(true)}>
          Apply {pendingRedactions.length} redaction{pendingRedactions.length > 1 ? 's' : ''}
        </Button>
      )}

      {/* ===================== HELP ===================== */}
      <Modal open={helpOpen} onCancel={() => setHelpOpen(false)} footer={<Button type="primary" onClick={() => setHelpOpen(false)}>Got it</Button>}
        title="How to edit this PDF" width={620}>
        <Paragraph type="secondary">Nothing is changed in the stored file until you press <b>Save changes</b>. Every save creates a new version, and the previous one stays in the version history.</Paragraph>
        <Title level={5}>Change existing text</Title>
        <ol className="pe-help-list">
          <li>Choose <b>Edit Text</b>. Text the editor can change is outlined in blue.</li>
          <li>Click a line and type. It keeps the original font, size and colour (you can change them in the bar above).</li>
          <li>Press <b>Esc</b> or click outside to finish. The old words are removed from the file, not just hidden.</li>
          <li>Drawings (CAD) often draw their words as lines, so they are not outlined. Press <b>Find drawn words</b>: the words that can be read are outlined in orange and can be edited the same way.</li>
        </ol>
        <Title level={5}>Erase and replace (scanned pages, logos, signatures, images)</Title>
        <ol className="pe-help-list">
          <li>Choose <b>Eraser</b> and drag over lines, words or pictures to delete them. Nothing is painted on top.</li>
          <li>Or choose <b>White-out</b> to cover the area with a patch that matches the page background.</li>
          <li>Choose <b>Add Text</b>, click on the patch and type the new words.</li>
        </ol>
        <Title level={5}>Mark up</Title>
        <Paragraph><b>Highlight</b>, <b>Pen</b>, <b>Rectangle</b>, <b>Ellipse</b>, <b>Line</b>, <b>Note</b> and <b>Stamp</b> add marks. Use <b>Select</b> to move, resize or delete anything you added. <b>Redact</b> permanently deletes confidential content and issues a certificate.</Paragraph>
        <Title level={5}>Shortcuts</Title>
        <div className="pe-shortcuts">
          <span><kbd>Ctrl</kbd>+<kbd>Z</kbd> Undo</span><span><kbd>Ctrl</kbd>+<kbd>Y</kbd> Redo</span>
          <span><kbd>Delete</kbd> Remove selected</span><span><kbd>Esc</kbd> Finish / cancel</span>
          <span><kbd>Ctrl</kbd>+<kbd>S</kbd> Save</span>
        </div>
        <Alert style={{ marginTop: 12 }} type="info" showIcon
          message="Fonts" description="New text uses the closest standard font (Helvetica/Arial, Times or Courier) in the original size and colour. Letters outside Western European alphabets (for example Arabic or Chinese) cannot be written yet." />
      </Modal>

      {/* ===================== REDACTION ===================== */}
      <Modal
        title={<Space><SafetyCertificateOutlined style={{ color: '#cf1322' }} />Confirm redaction</Space>}
        open={redactionModalOpen}
        onCancel={() => setRedactionModalOpen(false)}
        confirmLoading={applying}
        okText="Apply & redact permanently"
        okButtonProps={{ danger: true }}
        width={560}
        onOk={async () => {
          setApplying(true);
          try {
            const regions = pendingRedactions.map((r) => {
              const d = baseDims[r.page - 1] || { width: 1, height: 1 };
              return { page: r.page, x_percent: r.x / d.width, y_percent: r.y / d.height,
                w_percent: r.w / d.width, h_percent: r.h / d.height };
            });
            const res = await documentService.applyRedactions(documentId, {
              regions, reason: redactionReason || 'Redaction applied', legal_basis: redactionBasis,
              fill_color: '#000000', remove_metadata: true, remove_embedded_files: true,
              remove_annotations: true, remove_scripts: true, sanitize_links: true,
              sanitize_outline: true, linearize: true,
            });
            if (res.success) {
              message.success(`Redacted — certificate ${res.certificate_number}`);
              setPendingRedactions([]); setRedactionModalOpen(false); setRedactionReason('');
              onSaved?.(res.document);
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
      >
        <Alert type="warning" showIcon style={{ marginBottom: 16 }} message="This cannot be undone"
          description="The marked content is permanently removed from the PDF. A copy of the original is kept as a version and a certificate is created for audit." />
        {dirty && <Alert type="info" showIcon style={{ marginBottom: 16 }} message="Save your other changes first" description="Redaction reloads the document, so unsaved edits would be lost." />}
        <Form layout="vertical">
          <Form.Item label="Reason / justification">
            <Input.TextArea rows={3} value={redactionReason} onChange={(e) => setRedactionReason(e.target.value)}
              placeholder="e.g. GDPR Article 17 — erasure request from data subject" maxLength={500} showCount />
          </Form.Item>
          <Form.Item label="Legal basis">
            <Select value={redactionBasis} onChange={setRedactionBasis} options={[
              { label: 'Privacy / GDPR / HIPAA', value: 'privacy' },
              { label: 'Security / Classified', value: 'security' },
              { label: 'Court Order', value: 'court_order' },
              { label: 'Company Policy', value: 'policy' },
              { label: 'Other', value: 'other' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="Redaction history" open={redactionHistoryOpen} onClose={() => setRedactionHistoryOpen(false)} width={520}>
        <List
          dataSource={redactionHistory}
          locale={{ emptyText: 'No redactions yet' }}
          renderItem={(r) => (
            <List.Item actions={[<Button key="cert" size="small" type="link" onClick={() => documentService.downloadRedactionCertificate(r.id)}>Certificate</Button>]}>
              <List.Item.Meta
                title={<Space><Text strong>{r.certificate_number}</Text>{r.verified_no_leaks ? <Tag color="green">Verified</Tag> : <Tag color="orange">Review</Tag>}</Space>}
                description={<div style={{ fontSize: 12 }}>
                  <div>{r.region_count} region(s) · v{r.before_version} → v{r.after_version}</div>
                  <div style={{ color: '#8c8c8c' }}>{r.redacted_by_name} · {new Date(r.created_at).toLocaleString()}</div>
                  <div style={{ color: '#8c8c8c' }}>Basis: {r.legal_basis}</div>
                </div>}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
});

export default PDFEditor;
