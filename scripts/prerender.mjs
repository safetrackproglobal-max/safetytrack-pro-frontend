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
const { TRUST_PAGES, TRUST_META, CONTROLS, STATUS_ROWS, AI_WARNING } = await load('../src/data/trustPages.js');
const H = await load('../src/data/homeContent.js');
const INDEX = JSON.parse(fs.readFileSync(path.join(here, '../src/data/docLibraryIndex.json'), 'utf8'));
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const once = (s, rx, to) => { if (!rx.test(s)) throw new Error(`prerender: pattern not found ${rx}`); return s.replace(rx, () => to); };

let n = 0;
const ROBOTS = /<meta name="robots" content="[^"]*"\s*\/?>/;
const page = ({ url, title, description, body, crumbs, faqs, index = true }) => {
  let h = shell;
  if (!index) h = once(h, ROBOTS, '<meta name="robots" content="noindex, follow"/>');
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
  if (faqs && faqs.length) {
    const fl = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
    h = once(h, /<\/head>/, `<script type="application/ld+json">${JSON.stringify(fl).replace(/</g, '\\u003c')}</script></head>`);
  }
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

const marketing = (p, prefix, group) => page({ faqs: p.faqs,
  url: `${prefix}${p.slug}`, title: p.title, description: p.description, crumbs: [['Home', '/'], [group, `${prefix}${p.slug}`]],
  body: `<h1>${esc(p.h1 || p.name)}</h1><p>${esc(p.lead || p.description)}</p>${list((p.benefits || []).map((b) => `<strong>${esc(b.title)}</strong> - ${esc(b.text)}`))}${list((p.capabilities || []).map(esc))}${p.note ? `<p>${esc(p.note)}</p>` : ''}${faq(p.faqs)}<p><a href="${L}">Free safety documents</a> <a href="/data-use">How we use your data</a> <a href="/ai-transparency">AI transparency</a> <a href="/">Home</a></p>`,
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

// ---- Trust and guide pages
const table = (t) => `<table><tr>${t.head.map((x) => `<th>${esc(x)}</th>`).join('')}</tr>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;
const links = (a) => list(a.map(([n2, u]) => `<a href="${u}">${esc(n2)}</a>`));
TRUST_PAGES.forEach((p) => page({ url: p.path, title: p.title, description: p.description, faqs: p.faqs, crumbs: [['Home', '/'], p.parent, [p.nav, p.path]],
  body: `<h1>${esc(p.h1)}</h1><p>${esc(p.lead)}</p>${p.warning ? `<p>${esc(p.warning)}</p>` : ''}${p.sections.map((s) => `<h2>${esc(s.h)}</h2>${s.table ? table(s.table) : ''}${list((s.list || []).map(esc))}${list((s.steps || []).map(esc))}${(s.p || []).map((x) => `<p>${esc(x)}</p>`).join('')}`).join('')}${faq(p.faqs)}${links([...p.links, ['Home', '/']])}` }));
page({ url: '/trust', title: TRUST_META.title, description: TRUST_META.description, crumbs: [['Home', '/'], ['Trust centre', '/trust']],
  body: `<h1>Clear answers about your data, AI and security</h1><p>${esc(AI_WARNING)}</p>${links(TRUST_PAGES.map((p) => [p.nav, p.path]))}<h2>Security measures in the software</h2>${list(CONTROLS.map((c) => `<strong>${esc(c.title)}</strong> - ${esc(c.text)}`))}<h2>What we do not claim</h2>${table({ head: ['Standard or promise', 'Status'], rows: STATUS_ROWS })}` });

// ---- Pages whose text lives in React components: own title, description and canonical, short text
const simple = (url, title, description, h1, text, more = [], index = true) => page({ url, title, description, index, crumbs: [['Home', '/'], [h1, url]],
  body: `<h1>${esc(h1)}</h1><p>${esc(text)}</p>${links([...more, ['Home', '/']])}` });
const solutionLinks = SOLUTIONS.map((p) => [p.name, `/${p.slug}`]);
simple('/features', 'HSE Software Features | SafeTrack Pro Global', 'Every SafeTrack Pro feature: incidents, permits, toolbox talks, worker reporting, documents, AI cameras, environment, compliance and analytics.', 'Features', 'All SafeTrack Pro tools, with a page for each.', solutionLinks);
simple('/pricing', 'Pricing and Plans | SafeTrack Pro Global', 'SafeTrack Pro plans and prices by country. Start on the free plan.', 'Pricing', 'Start free. Paid plans add users, AI limits and certificates. Prices depend on your country.', [['Contact', '/contact'], ['Create a free account', '/signup']]);
simple('/contact', 'Contact SafeTrack Pro Global | Doha, Qatar', 'Contact SafeTrack Pro Global: info@safetrackproglobal.com, +974 3325 1705, Doha, Qatar.', 'Contact', 'Email info@safetrackproglobal.com or call +974 3325 1705. Doha, Qatar.', [['Request a demo', '/demo'], ['Company facts', '/facts']]);
simple('/about', 'About SafeTrack Pro Global', 'Who we are: HSE software from Doha, Qatar, for construction, oil and gas, mining, manufacturing and more.', 'About SafeTrack Pro Global', 'SafeTrack Pro Global is web-based HSE software based in Doha, Qatar.', [['Company facts', '/facts'], ['Trust centre', '/trust']]);
simple('/terms', 'Terms and Conditions | SafeTrack Pro Global', 'Terms for using SafeTrack Pro Global, including AI limits, user responsibilities and governing law.', 'Terms and conditions', 'AI results must be checked by a competent person before use. SafeTrack Pro assists safety professionals and does not replace them.', [['Privacy policy', '/privacy'], ['How we use your data', '/data-use']]);
simple('/demo', 'Request a Demo | SafeTrack Pro Global', 'Book a walkthrough of SafeTrack Pro HSE software for your industry.', 'Request a demo', 'Tell us about your sites and we will show you the parts that matter.', [['Pricing', '/pricing']]);
simple('/voice', 'Report a Workplace Safety Concern | Workplace Voice', 'Find your company and report a hazard or concern by voice, photo, video or text. Anonymous, protected or named. No account needed.', 'Workplace Voice: report a concern', 'Find your company, choose your language and report. You choose anonymous, protected or named. In danger now? Call your local emergency number first.', [['How it works and who sees what', '/anonymous-safety-reporting/how-it-works'], ['Track a report', '/voice/track'], ['For companies', '/anonymous-safety-reporting']]);
simple('/signup', 'Create a Free Account | SafeTrack Pro Global', 'Create a free SafeTrack Pro account.', 'Create a free account', 'Start on the free plan.', [['Privacy policy', '/privacy'], ['Terms', '/terms']]);
simple('/info/support', 'Support | SafeTrack Pro Global', 'Get help with SafeTrack Pro by email, phone, WhatsApp or the contact form.', 'Support', 'Reach our team by email, phone, WhatsApp or the contact form.', [['Contact', '/contact'], ['Trust centre', '/trust']]);
simple('/info/partners', 'Partners | SafeTrack Pro Global', 'Reseller, technology and consulting partners for SafeTrack Pro HSE software.', 'Partners', 'We welcome reseller, technology and consulting partners.', [['Contact', '/contact']]);
simple('/info/careers', 'Careers | SafeTrack Pro Global', 'Work in HSE technology with SafeTrack Pro.', 'Careers', 'Send us your CV and we will contact you when a suitable role opens.', [['Contact', '/contact']]);
simple('/login', 'Log in | SafeTrack Pro Global', 'Log in to SafeTrack Pro.', 'Log in', 'Log in to your account.', [['Create a free account', '/signup']], false);

// ---- app.html: shell for every other address (private pages, company reporting pages, unknown pages).
// It must not be indexed and must not call itself the home page. vercel.json rewrites to it.
let app = once(shell, /<link rel="canonical" href="[^"]*"\s*\/?>/, '');
app = once(app, ROBOTS, '<meta name="robots" content="noindex, follow"/>');
app = once(app, /<meta property="og:url" content="[^"]*"\s*\/?>/, '');
app = app.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (m, j) => (/"@type":\s*"(FAQPage|BreadcrumbList)"/.test(j) ? '' : m));
fs.writeFileSync(path.join(build, 'app.html'), app);

// ---- home page
let home = once(shell, /<title>[^<]*<\/title>/, `<title>${esc(H.HOME_TITLE)}</title>`);
home = once(home, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(H.HOME_DESCRIPTION)}"/>`);
home = home.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (m, j) => (/"@type":\s*"(FAQPage|BreadcrumbList)"/.test(j) ? '' : m));
const hf = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: H.HOME_FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
home = once(home, /<\/head>/, `<script type="application/ld+json">${JSON.stringify(hf).replace(/</g, '\\u003c')}</script></head>`);
const hs = home.indexOf('<div class="seo-only">');
const he = home.lastIndexOf('</body>');
const homeBody = `<h1>${esc(H.HOME_H1)}</h1><p>${esc(H.HOME_LEAD)}</p>${links(H.DOORS.map((d) => [d.title, d.to]))}<h2>Know what happens to your data</h2><p>${esc(AI_WARNING)}</p>${list(H.TRUST_POINTS.map((t) => `<strong>${esc(t.title)}</strong> - ${esc(t.text)} <a href="${t.to}">${esc(t.cta)}</a>`))}<h2>Tools</h2>${list(H.SPOTLIGHTS.map((t) => `<a href="${t.to}">${esc(t.title)}</a> - ${esc(t.text)} <a href="${t.guide}">${esc(t.guideLabel)}</a>`))}${list(SOLUTIONS.map((p) => `<a href="/${p.slug}">${esc(p.name)}</a> - ${esc(p.summary)}`))}<h2>Industries</h2>${links(INDUSTRIES.map((i) => [i.name, `/industries/${i.slug}`]))}<h2>Standards</h2>${links(COMPLIANCE_PAGES.map((c) => [c.code, `/compliance/${c.slug}`]))}<h2>Questions</h2>${faq(H.HOME_FAQS)}<h2>All pages</h2>${links([...TRUST_PAGES.map((p) => [p.nav, p.path]), ['Trust centre', '/trust'], ...H.OTHER_PAGES.flatMap(([, l]) => l)])}<p>SafeTrack Pro Global is not related to SafeStart SafeTrack, MaxAccel SafeTrack or Brady SafeTrak.</p>`;
fs.writeFileSync(path.join(build, 'index.html'), `${home.slice(0, hs)}<div class="seo-only">${homeBody}</div></div>${home.slice(he)}`);
console.log(`prerendered ${n} pages`);

// ---- service worker: a new version name per build, so installed apps fetch the new files
{
  const swPath = path.join(build, 'sw.js');
  if (fs.existsSync(swPath)) {
    const am = JSON.parse(fs.readFileSync(path.join(build, 'asset-manifest.json'), 'utf8'));
    const tag = String(am.files && am.files['main.js'] || Date.now()).replace(/[^\w]/g, '').slice(-24);
    fs.writeFileSync(swPath, fs.readFileSync(swPath, 'utf8').replace("const VERSION = 'st-shell-v1';", `const VERSION = 'st-shell-${tag}';`));
  }
}
