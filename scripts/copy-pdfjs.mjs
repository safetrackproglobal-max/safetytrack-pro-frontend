// Runs before every build: serves the PDF.js worker, fonts and decoders from our own site,
// always in the same version as the installed library.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const from = path.join(root, 'node_modules', 'pdfjs-dist');
const to = path.join(root, 'public', 'pdfjs');
fs.mkdirSync(to, { recursive: true });
// .js so that every server sends a script type
fs.copyFileSync(path.join(from, 'legacy', 'build', 'pdf.worker.min.mjs'), path.join(to, 'pdf.worker.min.js'));
for (const dir of ['cmaps', 'standard_fonts', 'wasm']) fs.cpSync(path.join(from, dir), path.join(to, dir), { recursive: true });
console.log('pdfjs files copied');
