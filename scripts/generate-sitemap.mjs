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

const { SITE_URL, ALL_MARKETING_PATHS, SOLUTIONS, INDUSTRIES, COMPLIANCE_PAGES } = await import(pathToFileURL(tmpFile).href);
fs.unlinkSync(tmpFile);

// Existing app pages that should be indexed. Edit as needed.
const LIBRARY = JSON.parse(fs.readFileSync(path.join(here, '../src/data/docLibraryIndex.json'), 'utf8'));
const EXISTING = ['/', '/pricing', '/features', '/contact', '/voice', '/csp-practice-exam/free-test', '/free-safety-documents', ...LIBRARY.map((d) => `/free-safety-documents/${d.slug}`)];
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

// AI-readable page list (public/sitemap-ai.json), built from the same marketing data so it never drifts.
const pageEntry = (p, prefix, category) => ({
  url: `${SITE_URL}${prefix}${p.slug}`,
  title: p.title,
  description: p.description,
  category,
  last_modified: today
});
const aiMap = {
  version: '3.0',
  last_updated: today,
  organization: {
    name: 'SafeTrack Pro Global',
    alternate_names: ['SafeTrack Pro', 'SafeTrackPro', 'Safe Track Pro'],
    url: SITE_URL,
    description:
      'AI-powered HSE / EHS software: incident and near-miss reporting, permit to work, daily AI toolbox talks, anonymous worker reporting, document control, risk assessment and compliance management.',
    not_to_be_confused_with: ['SafeStart SafeTrack', 'MaxAccel SafeTrack', 'Brady SafeTrak'],
    contact: { email: 'info@safetrackproglobal.com', phone: '+974 3325 1705', address: 'Doha, Qatar' }
  },
  pages: [
    { url: `${SITE_URL}/`, title: 'SafeTrack Pro Global | AI HSE & Safety Management Software', category: 'home', last_modified: today },
    { url: `${SITE_URL}/pricing`, title: 'Pricing', category: 'pricing', last_modified: today },
    { url: `${SITE_URL}/voice`, title: 'Workplace Voice - find your company and report safely', category: 'portal', last_modified: today },
    { url: `${SITE_URL}/free-safety-documents`, title: 'Free safety documents and templates', category: 'library', last_modified: today },
    { url: `${SITE_URL}/csp-practice-exam/free-test`, title: 'Free CSP practice test (10 questions)', category: 'practice test', last_modified: today },
    ...LIBRARY.map((d) => ({ url: `${SITE_URL}/free-safety-documents/${d.slug}`, title: d.title, description: d.description, category: 'free template', last_modified: today })),
    ...SOLUTIONS.map((p) => pageEntry(p, '/', 'solution')),
    ...INDUSTRIES.map((p) => pageEntry(p, '/industries/', 'industry')),
    ...COMPLIANCE_PAGES.map((p) => pageEntry(p, '/compliance/', 'compliance'))
  ]
};
fs.writeFileSync(path.join(here, '../public/sitemap-ai.json'), `${JSON.stringify(aiMap, null, 2)}\n`);
console.log(`Wrote ${aiMap.pages.length} pages to public/sitemap-ai.json`);
