/**
 * Runs after `react-scripts build` (npm "postbuild").
 * Writes a real HTML file per public page (own title, description, canonical and text), because the SPA shell
 * declares the home page as canonical and search engines / AI crawlers may not run JavaScript.
 * Vercel serves these files before the SPA rewrite; React then takes over the page.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const build = process.env.BUILD_PATH ? path.resolve(process.env.BUILD_PATH) : path.join(here, '../build');
const shell = fs.readFileSync(path.join(build, 'index.html'), 'utf8');
const load = async (rel) => {
  const tmp = path.join(os.tmpdir(), `pr-${process.pid}-${path.basename(rel, '.js')}.mjs`);
  fs.writeFileSync(tmp, fs.readFileSync(path.join(here, rel), 'utf8'));
  const m = await import(pathToFileURL(tmp).href);
  fs.unlinkSync(tmp);
  return m;
};
const { SITE_URL, SOLUTIONS, INDUSTRIES, COMPLIANCE_PAGES } = await load('../src/data/marketingPages.js');
const { FREE_TEST } = await load('../src/data/freePracticeTest.js');
const INDEX = JSON.parse(fs.readFileSync(path.join(here, '../src/data/docLibraryIndex.json'), 'utf8'));
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const once = (s, rx, to) => { if (!rx.test(s)) throw new Error(`prerender: pattern not found ${rx}`); return s.replace(rx, () => to); };

let n = 0;
const page = ({ url, title, description, body, crumbs }) => {
  let h = shell;
  h = once(h, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  h = once(h, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}"/>`);
  h = once(h, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${SITE_URL}${url}"/>`);
  h = once(h, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}"/>`);
  h = once(h, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(description)}"/>`);
  h = once(h, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${SITE_URL}${url}"/>`);
  // page-specific structured data: the home page's FAQ/breadcrumb must not repeat on every page
  h = h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (m, j) => (/"@type":\s*"(FAQPage|BreadcrumbList)"/.test(j) ? '' : m));
  const bc = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, u], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${u}` })) };
  h = once(h, /<\/head>/, `<script type="application/ld+json">${JSON.stringify(bc).replace(/</g, '\\u003c')}</script></head>`);
  const start = h.indexOf('<div class="seo-only">');
  const end = h.lastIndexOf('</body>');
  if (start < 0 || end < start) throw new Error('prerender: seo-only block not found');
  h = `${h.slice(0, start)}<div class="seo-only">${body}</div></div>${h.slice(end)}`;
  const dir = path.join(build, url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), h);
  n += 1;
};
const list = (a) => (a && a.length ? `<ul>${a.map((x) => `<li>${x}</li>`).join('')}</ul>` : '');
const faq = (f) => (f || []).map((x) => `<h3>${esc(x.q)}</h3><p>${esc(x.a)}</p>`).join('');
const L = '/free-safety-documents';

const marketing = (p, prefix, group) => page({
  url: `${prefix}${p.slug}`, title: p.title, description: p.description, crumbs: [['Home', '/'], [group, `${prefix}${p.slug}`]],
  body: `<h1>${esc(p.h1 || p.name)}</h1><p>${esc(p.lead || p.description)}</p>${list((p.benefits || []).map((b) => `<strong>${esc(b.title)}</strong> - ${esc(b.text)}`))}${list((p.capabilities || []).map(esc))}${p.note ? `<p>${esc(p.note)}</p>` : ''}${faq(p.faqs)}<p><a href="${L}">Free safety documents</a></p>`,
});
SOLUTIONS.forEach((p) => marketing(p, '/', p.name));
INDUSTRIES.forEach((p) => marketing(p, '/industries/', p.name));
COMPLIANCE_PAGES.forEach((p) => marketing(p, '/compliance/', p.name || p.code));

page({ url: L, title: `${INDEX.length} Free Safety Documents & Templates (PDF) | SafeTrack Pro`, crumbs: [['Home', '/'], ['Free safety documents', L]],
  description: 'Free editable HSE templates: risk assessments, JSAs, permits to work, safety plans and forms for construction, oil and gas, mining and more. Add your logo, download PDF.',
  body: `<h1>${INDEX.length} free safety documents you can edit and download</h1>${list(INDEX.map((d) => `<a href="${L}/${d.slug}">${esc(d.title)}</a> (${esc(d.industry)}, ${esc(d.type)})`))}` });
INDEX.forEach((d) => {
  const doc = JSON.parse(fs.readFileSync(path.join(here, `../public/doc-library/${d.slug}.json`), 'utf8'));
  const more = INDEX.filter((x) => x.slug !== d.slug && x.industry === d.industry).slice(0, 8);
  page({ url: `${L}/${d.slug}`, description: d.description, crumbs: [['Home', '/'], ['Free safety documents', L], [d.title, `${L}/${d.slug}`]],
    title: `${d.title} Template - Free PDF${d.industry === 'All Industries' ? '' : ` | ${d.industry}`} | SafeTrack Pro`,
    body: `<h1>${esc(d.title)} template</h1><p>${esc(d.description)}</p>${doc.html}<h2>More templates</h2>${list(more.map((x) => `<a href="${L}/${x.slug}">${esc(x.title)}</a>`))}` });
});
page({ url: '/csp-practice-exam/free-test', title: 'Free CSP Practice Test - 10 Questions with Answers | SafeTrack Pro',
  description: 'Take a free 10-question CSP-style safety practice test with instant answers and explanations. No sign-up. Then try the full 100-question practice exam.',
  crumbs: [['Home', '/'], ['CSP practice exam', '/csp-practice-exam'], ['Free test', '/csp-practice-exam/free-test']],
  body: `<h1>Free CSP practice test: 10 questions</h1><p>Practice only. Not the official CSP exam and not affiliated with BCSP.</p>${FREE_TEST.map((q) => `<h2>${esc(q.q)}</h2>${list(q.o.map(esc))}`).join('')}` });
console.log(`prerendered ${n} pages`);
