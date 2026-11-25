// The one place that loads PDF.js.
//  * legacy build: also runs on browsers that are not brand new
//  * worker, fonts and decoders come from our own site (/pdfjs, copied by scripts/copy-pdfjs.mjs
//    before each build), so no outside server is needed and the versions always match
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const BASE = `${process.env.PUBLIC_URL || ''}/pdfjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = `${BASE}/pdf.worker.min.js?v=${pdfjsLib.version}`;

export const openPdf = (data) => pdfjsLib.getDocument({
  data,
  cMapUrl: `${BASE}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${BASE}/standard_fonts/`,
  wasmUrl: `${BASE}/wasm/`,
}).promise;

/** Is this stored document a PDF? (mime type, file name or address, any letter case) */
export const isPdfDocument = (doc) => {
  if (!doc || !doc.file_url) return false;
  const mime = String(doc.mime_type || doc.file_type || '').toLowerCase();
  if (mime === 'application/pdf' || mime === 'pdf' || mime === '.pdf') return true;
  const ends = (v) => /\.pdf$/i.test(String(v || '').split(/[?#]/)[0]);
  return ends(doc.file_url) || ends(doc.file_name);
};

export default pdfjsLib;
