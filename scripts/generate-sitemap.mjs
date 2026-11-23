/**
 * Generates public/sitemap.xml from src/data/marketingPages.js.
 * Run from the project root:  node scripts/generate-sitemap.mjs
 * (The data file is copied to a temp .mjs so Node can import it without "type": "module".)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(here, '../src/data/marketingPages.js'), 'utf8');
const tmpFile = path.join(os.tmpdir(), `marketingPages-${Date.now()}.mjs`);
fs.writeFileSync(tmpFile, source);

const { SITE_URL, ALL_MARKETING_PATHS } = await import(pathToFileURL(tmpFile).href);
fs.unlinkSync(tmpFile);

// Existing app pages that should be indexed. Edit as needed.
const EXISTING = ['/', '/pricing', '/features', '/contact'];
const today = new Date().toISOString().slice(0, 10);

const priority = (p) => {
  if (p === '/') return '1.0';
  if (['/pricing', '/demo'].includes(p)) return '0.9';
  if (p.startsWith('/industries/') || p.startsWith('/compliance/')) return '0.7';
  return '0.8';
};

const urls = [...new Set([...EXISTING, ...ALL_MARKETING_PATHS])];
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    (p) =>
      `  <url>\n    <loc>${SITE_URL}${p === '/' ? '/' : p}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority(p)}</priority>\n  </url>`
  ),
  '</urlset>',
  ''
].join('\n');

const out = path.join(here, '../public/sitemap.xml');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, xml);
console.log(`Wrote ${urls.length} URLs to ${out}`);
