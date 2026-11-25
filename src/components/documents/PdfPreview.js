// Read-only PDF preview of a stored document (first pages), drawn with the signed-in user's access.
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Spin } from 'antd';
import api from '../../services/api';
import { openPdf } from '../../utils/pdfjs';

const MAX_PAGES = 5;

export default function PdfPreview({ documentId }) {
  const box = useRef(null);
  const [state, setState] = useState('loading');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let on = true;
    setState('loading');
    (async () => {
      try {
        const res = await api.get(`/documents/${documentId}/raw`, { responseType: 'arraybuffer' });
        const pdf = await openPdf(new Uint8Array(res.data));
        if (!on || !box.current) return;
        box.current.replaceChildren();
        setTotal(pdf.numPages);
        for (let i = 1; i <= Math.min(MAX_PAGES, pdf.numPages) && on; i += 1) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.4 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.cssText = 'width:100%;display:block;margin:0 0 12px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.15)';
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          if (!on || !box.current) return;
          box.current.appendChild(canvas);
          setState('ready');
        }
      } catch (e) {
        if (on) setState('error');
      }
    })();
    return () => { on = false; };
  }, [documentId]);

  return (
    <div>
      {state === 'error' && <Alert type="warning" showIcon message="The preview could not be loaded" description="The file may be missing. Try Download." />}
      {state === 'loading' && <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>}
      <div ref={box} style={{ maxHeight: 560, overflow: 'auto', background: '#e8eaed', padding: state === 'ready' ? 12 : 0, borderRadius: 8 }} />
      {state === 'ready' && total > MAX_PAGES && <p style={{ color: '#55697f', marginTop: 8 }}>First {MAX_PAGES} of {total} pages. Open Edit to see all.</p>}
    </div>
  );
}
