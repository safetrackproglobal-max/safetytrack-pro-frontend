"""Convert the backend's box-drawing templates into clean HTML for the public document library.

usage: python build-doc-library.py hub.json <frontend dir>
hub.json = {template_id: {industry, type, content}} dumped from classes.HSEDocumentGeneratorHub().templates
Writes public/doc-library/<slug>.json and src/data/docLibraryIndex.json
"""
import html
import json
import os
import re
import sys
import unicodedata

hub = json.load(open(sys.argv[1], encoding='utf-8'))
FE = sys.argv[2]
IND = {'construction': 'Construction', 'manufacturing': 'Manufacturing', 'mining': 'Mining', 'maritime': 'Maritime', 'oilgas': 'Oil & Gas',
       'aviation': 'Aviation', 'chemical': 'Chemical', 'education': 'Education', 'healthcare': 'Healthcare', 'energy': 'Energy',
       'agriculture': 'Agriculture'}
SKIP = re.compile(r'hsedocumentgeneratorhub|storagemanager|base_get|status')
H, V = '═─━-', '│║|┃'
SEP = re.compile(r'^[\s╔╗╚╝╠╣╦╩╬═┌┐└┘├┤┬┴┼─━│║|┃╟╢╤╧╪]+$')
ACR = {'Jsa': 'JSA', 'Ppe': 'PPE', 'Hse': 'HSE', 'Msds': 'SDS', 'H2s': 'H2S', 'Osha': 'OSHA', 'Iso': 'ISO', 'Sop': 'SOP', 'Apu': 'APU',
       'Icu': 'ICU', 'Loto': 'LOTO', 'Jha': 'JHA', 'Ptw': 'PTW', 'Nfpa': 'NFPA', 'Sms': 'SMS', 'Hvac': 'HVAC', 'Lpg': 'LPG', 'Lng': 'LNG'}


def clean(t):
    t = re.sub(r'[\U0001F000-\U0001FAFF☀-☏☓-➿️⃣]', '', t)
    t = t.replace('□', '☐').replace('▢', '☐').replace('[ ]', '☐')
    t = re.sub(r'_{14,}', '_' * 14, t)
    t = re.sub(r'\.{14,}', '.' * 14, t)
    return re.sub(r'[ \t]+', ' ', t).strip()


def esc(t):
    return html.escape(clean(t), quote=False)


def cells(line):
    s = line.strip().strip('║│|┃')
    return [c.strip() for c in re.split('[│┃]', s)]


def line_html(t):
    t = t.strip()
    if not clean(t):
        return ''
    x = esc(t)
    if re.match(r'^[A-Z0-9][A-Z0-9 &/,()\'.-]{3,70}:$', clean(t)):
        return '<p><b>%s</b></p>' % x
    return '<p>%s</p>' % re.sub(r'^([A-Z][A-Za-z0-9 /&#()-]{2,38}):', r'<b>\1:</b>', x)


def convert(txt):
    out, bad, rows = [], 0, 0
    group, table = [], []
    cols = 1
    title, sub = None, None
    first_in_box = [True]

    def flush_table():
        nonlocal table
        if table:
            hd = table[0]
            body = ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % c for c in r) for r in table[1:])
            out.append('<table><tr>%s</tr>%s</table>' % (''.join('<th>%s</th>' % c for c in hd), body))
            table = []

    def flush_group():
        nonlocal group, rows, bad
        if not group:
            return
        parts = [cells(g) for g in group]
        n = max(set(map(len, parts)), key=[len(p) for p in parts].count)
        rows += len(parts)
        bad += sum(1 for p in parts if len(p) != n)
        if n > 1:
            merged = [[] for _ in range(n)]
            for p in parts:
                if len(p) != n:
                    p = (p + [''] * n)[:n] if len(p) < n else p[:n - 1] + [' '.join(p[n - 1:])]
                for i, c in enumerate(p):
                    c = esc(c)
                    if c and c not in ('_' * 14,):
                        merged[i].append(c)
                    elif c:
                        merged[i].append('________')
            row = []
            for m in merged:
                txt_ = ''
                for c in m:   # continuation lines join with a space, list items start a new line
                    txt_ += ('<br>' if txt_ and re.match(r'^(-|•|☐|\d+[.)])', c) else ' ' if txt_ else '') + c
                row.append(txt_)
            if any(row):
                if table and len(table[0]) != n:
                    flush_table()
                table.append(row)
        else:
            flush_table()
            text = [p[0] for p in parts if clean(p[0])]
            if text and len(text) <= 2 and len(clean(text[0])) < 90 and first_in_box[0] and '____' not in text[0] and '☐' not in text[0]:
                out.append('<h2>%s</h2>' % html.escape(nice(clean(' '.join(text)).upper()), quote=False))
            else:
                out.extend(filter(None, (line_html(t) for t in text)))
        first_in_box[0] = False
        group = []

    in_head = False
    for raw in txt.split('\n'):
        ln = raw.rstrip()
        st = ln.strip()
        if not st:
            if group:
                flush_group()
            continue
        if '╔' in st:
            in_head = True
        if SEP.match(st):
            flush_group()
            if st[0] in '┌╔':
                flush_table()
                first_in_box[0] = True
            if st[0] in '╚╠' or '╝' in st:
                in_head = False
            if st[0] in '└╚':
                flush_table()
            continue
        if in_head and title is None and st[0] in '║│':
            title = clean(st.strip('║│ '))
            continue
        if in_head and title and sub is None and st[0] in '║│' and not group and not re.search('____|REF|DATE', st):
            sub = clean(st.strip('║│ '))
            continue
        if st[0] in V:
            group.append(st)
        else:
            flush_group()
            flush_table()
            t = clean(st)
            if t and len(t) < 80 and (t.endswith(':') or t.isupper()) and '__' not in t:
                out.append('<h2>%s</h2>' % html.escape(nice(t.rstrip(':').upper()), quote=False))
            else:
                out.append(line_html(st))
    flush_group()
    flush_table()
    body = '\n'.join(x for x in out if x)
    return title, sub, body, bad / max(1, rows), rows


def nice(t):
    t = re.sub(r'\s+', ' ', t).strip(' -:')
    t = t.title() if t.isupper() else t
    t = ' '.join(ACR.get(w, w) for w in t.split(' '))
    return re.sub(r"'S\b", "'s", t)


def doctype(tid, title):
    x = (tid + ' ' + title).lower()
    for k, v in (('jsa', 'Job Safety Analysis'), ('job safety', 'Job Safety Analysis'), ('msds', 'Safety Data Sheet'), ('permit', 'Permit to Work'),
                 ('risk_assess', 'Risk Assessment'), ('risk assess', 'Risk Assessment'), ('checklist', 'Checklist'), ('inspection', 'Inspection Form'),
                 ('incident', 'Incident Form'), ('near miss', 'Incident Form'), ('emergency', 'Emergency Plan'), ('evacuation', 'Emergency Plan'),
                 ('audit', 'Audit'), ('training', 'Training Record'), ('plan', 'Safety Plan'), ('log', 'Log & Register'),
                 ('register', 'Log & Register'), ('certificate', 'Form'), ('report', 'Report')):
        if k in x:
            return v
    return 'Form'


docs, seen, rejected = [], set(), 0
for tid, v in hub.items():
    c = v.get('content')
    if SKIP.search(tid) or not c or len(c) < 1800 or not re.search('[║│]', c):
        continue
    title, sub, body, badratio, nrows = convert(c)
    plain = re.sub('<[^>]+>', ' ', body)
    words = len(re.findall(r'[A-Za-z]{2,}', plain))
    heads = re.findall(r'<h2>(.*?)</h2>', body)
    leftovers = len(re.findall('[│║┌┐└┘├┤┬┴┼═╔╗╚╝]', body))
    if not title or len(title) < 6 or len(title) > 80 or badratio > 0.12 or words < 160 or leftovers > 6 or re.search(r'\{\w*\}|None\b', body):
        rejected += 1
        continue
    body = re.sub('[│║┌┐└┘├┤┬┴┼═╔╗╚╝]', ' ', body)
    t = nice(title)
    ind = IND.get(v['industry'], 'All Industries')
    dt = doctype(tid, t)
    full = t if ind == 'All Industries' or ind.split(' ')[0].lower() in t.lower() else t
    slug = re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', full.lower())).strip('-')
    if ind != 'All Industries' and ind.split(' ')[0].lower() not in slug:
        slug = re.sub(r'[^a-z0-9]+', '-', ind.lower()).strip('-') + '-' + slug
    if slug in seen:
        continue
    seen.add(slug)
    topics = [html.unescape(h) for h in heads if 4 < len(h) < 60][:4]
    desc = 'Free %s template%s you can edit online and download as PDF.%s' % (
        t, '' if ind == 'All Industries' else ' for %s' % ind.lower(), ' Covers %s.' % ', '.join(x.lower() for x in topics[:3]) if topics else '')
    docs.append({'slug': slug, 'title': t, 'industry': ind, 'type': dt, 'description': desc[:230], 'standard': nice(sub)[:90] if sub else '',
                 'words': words, 'body': body, 'topics': topics, 'bad': badratio})

out = os.path.join(FE, 'public', 'doc-library')
os.makedirs(out, exist_ok=True)
for d in docs:
    json.dump({k: d[k] for k in ('slug', 'title', 'industry', 'type', 'description', 'standard', 'topics')} | {'html': d['body']},
              open(os.path.join(out, d['slug'] + '.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False)
docs.sort(key=lambda d: (d['industry'] == 'All Industries', d['industry'], d['type'], d['title']))
json.dump([{k: d[k] for k in ('slug', 'title', 'industry', 'type', 'description', 'topics')} for d in docs],
          open(os.path.join(FE, 'src', 'data', 'docLibraryIndex.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=0)
from collections import Counter
print('published', len(docs), 'rejected', rejected)
print(Counter(d['industry'] for d in docs))
print(Counter(d['type'] for d in docs))
print('total KB', sum(len(d['body']) for d in docs) // 1024, 'max KB', max(len(d['body']) for d in docs) // 1024)
