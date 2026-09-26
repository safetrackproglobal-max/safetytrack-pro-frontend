// src/components/documents/editor/PDFSignaturePlacer.jsx
// Drag-and-drop signature placement on a PDF page.
// The signature data URL comes from the parent component (already fetched).

import React, { useRef, useState, useEffect } from 'react';
import { Button, Space, message, Slider, Tooltip } from 'antd';
import {
  CheckOutlined, CloseOutlined, DeleteOutlined
} from '@ant-design/icons';

const PDFSignaturePlacer = ({
  containerRef,
  currentPage,
  signature,           // ✅ data URL passed from parent
  onPlace,
  onCancel,
}) => {
  const [placement, setPlacement] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sizePct, setSizePct] = useState(25);

  // ------------------------------------------------------------
  // MOUSE HANDLERS
  // ------------------------------------------------------------
  const handleContainerMouseMove = (e) => {
    if (!dragging || !placement) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPlacement({
      ...placement,
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y,
    });
  };

  const handleContainerMouseUp = () => setDragging(false);

  const startDrag = (e) => {
    if (!placement) return;
    const rect = e.target.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
  };

  // ------------------------------------------------------------
  // PLACE INITIALLY CENTERED
  // ------------------------------------------------------------
  useEffect(() => {
    if (!signature || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width * (sizePct / 100);
    const h = w * 0.35;
    setPlacement({
      x: (rect.width - w) / 2,
      y: rect.height - h - 40,
      w,
      h,
    });
  }, [signature, sizePct, containerRef]);

  // ------------------------------------------------------------
  // CONFIRM
  // ------------------------------------------------------------
  const confirmPlacement = () => {
    if (!placement || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const payload = {
      page: currentPage,
      x_percent: placement.x / rect.width,
      y_percent: 1 - (placement.y + placement.h) / rect.height,
      width_percent: sizePct / 100,
    };
    onPlace?.(payload);
  };

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
            cursor: 'move',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={signature}
            alt="Signature"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              pointerEvents: 'none',
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

      {/* Mouse tracking overlay */}
      <div
        onMouseMove={handleContainerMouseMove}
        onMouseUp={handleContainerMouseUp}
        onMouseLeave={handleContainerMouseUp}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 99,
          pointerEvents: dragging ? 'auto' : 'none',
        }}
      />
    </>
  );
};

export default PDFSignaturePlacer;
