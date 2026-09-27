// src/components/documents/editor/PDFSignaturePlacer.jsx
// Drag-and-drop signature placement on a PDF page.
// The signature data URL comes from the parent component (already fetched).

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Space, message, Slider, Tooltip } from 'antd';
import {
  CheckOutlined, CloseOutlined, DeleteOutlined
} from '@ant-design/icons';

const PDFSignaturePlacer = ({
  containerRef,
  currentPage,
  signature,
  onPlace,
  onCancel,
}) => {
  console.log('🎯 [Placer] Render — signature prop =',
    signature ? signature.substring(0, 60) + '...' : null);

  const [placement, setPlacement] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sizePct, setSizePct] = useState(25);

  // ------------------------------------------------------------
  // DRAG STATE REFS — keep latest values for global listeners
  // ------------------------------------------------------------
  const draggingRef = useRef(false);
  const placementRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => { draggingRef.current = dragging; }, [dragging]);
  useEffect(() => { placementRef.current = placement; }, [placement]);
  useEffect(() => { dragOffsetRef.current = dragOffset; }, [dragOffset]);

  // ------------------------------------------------------------
  // DRAG HANDLERS — attached at window level while dragging
  // ------------------------------------------------------------
  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current || !placementRef.current) return;
    const el = containerRef?.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPlacement({
      ...placementRef.current,
      x: e.clientX - rect.left - dragOffsetRef.current.x,
      y: e.clientY - rect.top - dragOffsetRef.current.y,
    });
  }, [containerRef]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  const startDrag = (e) => {
    if (!placement) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
    e.preventDefault();
  };

  // ------------------------------------------------------------
  // PLACE INITIALLY CENTERED — recompute position whenever the
  // size or page changes, preserving the same relative anchor.
  // ------------------------------------------------------------
  useEffect(() => {
    const el = containerRef?.current;
    if (!signature || !el) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width * (sizePct / 100);
    const h = w * 0.35;
    setPlacement((prev) => {
      // If we already have a placement, keep the center position
      // and just resize around it.
      if (prev) {
        const cx = prev.x + prev.w / 2;
        const cy = prev.y + prev.h / 2;
        return {
          x: Math.max(0, Math.min(rect.width - w, cx - w / 2)),
          y: Math.max(0, Math.min(rect.height - h, cy - h / 2)),
          w,
          h,
        };
      }
      // First render — bottom-center like before.
      return {
        x: (rect.width - w) / 2,
        y: rect.height - h - 40,
        w,
        h,
      };
    });
  }, [signature, sizePct, containerRef]);

  // ------------------------------------------------------------
  // CONFIRM
  // ------------------------------------------------------------
  const confirmPlacement = () => {
    if (!placement || !containerRef?.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const payload = {
      page: currentPage,
      x_percent: placement.x / rect.width,
      y_percent: 1 - (placement.y + placement.h) / rect.height,
      width_percent: sizePct / 100,
    };
    onPlace?.(payload);
  };

  console.log('🎯 [Placer] About to render. signature valid?', !!signature);

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  if (!signature) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          padding: 8,
          borderRadius: 6,
          fontSize: 12,
          zIndex: 100,
        }}
      >
        No signature on file. Please capture one first.
      </div>
    );
  }

  return (
    <>
      {placement && (
        <div
          onMouseDown={startDrag}
          style={{
            position: 'absolute',
            left: placement.x,
            top: placement.y,
            width: placement.w,
            height: placement.h,
            border: '2px dashed #1890ff',
            background: 'rgba(24,144,255,0.08)',
            cursor: dragging ? 'grabbing' : 'move',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          <img
            src={signature}
            alt="Signature"
            draggable={false}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </div>
      )}

      {/* Floating controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          padding: 12,
          borderRadius: 8,
          zIndex: 101,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12 }}>Size</span>
        <Slider
          min={10}
          max={60}
          value={sizePct}
          onChange={setSizePct}
          style={{ width: 120 }}
        />
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={confirmPlacement}
        >
          Place
        </Button>
        <Button size="small" icon={<CloseOutlined />} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </>
  );
};

export default PDFSignaturePlacer;
