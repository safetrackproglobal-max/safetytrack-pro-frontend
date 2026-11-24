// Small allow-list HTML sanitizer (document bodies, templates, drafts). No scripts, styles, handlers or links to code.
const TAGS = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'H1', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD',
  'DIV', 'SPAN', 'HR', 'BLOCKQUOTE', 'SUB', 'SUP', 'INS', 'DEL', 'MARK']);
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'SVG', 'MATH', 'LINK', 'META', 'NOSCRIPT', 'FORM', 'TEXTAREA', 'SELECT',
  'BUTTON', 'INPUT', 'VIDEO', 'AUDIO']);

export const sanitizeHtml = (dirty) => {
  if (!dirty) return '';
  const doc = new DOMParser().parseFromString(String(dirty), 'text/html');
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) return;
      if (n.nodeType !== 1 || DROP.has(n.nodeName.toUpperCase())) { n.remove(); return; }
      walk(n);
      if (!TAGS.has(n.nodeName)) { n.replaceWith(...n.childNodes); return; }
      [...n.attributes].forEach((a) => {
        if (!(['colspan', 'rowspan'].includes(a.name) && /^\d{1,2}$/.test(a.value))) n.removeAttribute(a.name);
      });
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
};
