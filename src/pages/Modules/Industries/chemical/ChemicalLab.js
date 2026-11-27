// Chemical lab: calculators used every day in labs and chemical stores. All are standard formulas, worked out in the
// browser (nothing is sent anywhere). Each card shows the formula it uses. Atomic weights: IUPAC standard atomic weights
// (abridged / conventional values).
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, Button, Card, Col, Divider, Input, InputNumber, Radio, Row, Select, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export const ATOMIC = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305,
  Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.95, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942,
  Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.63, As: 74.922, Se: 78.971,
  Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224, Nb: 92.906, Mo: 95.95, Ru: 101.07, Rh: 102.91, Pd: 106.42,
  Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71, Sb: 121.76, Te: 127.6, I: 126.9, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91,
  Ce: 140.12, Pr: 140.91, Nd: 144.24, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.5, Ho: 164.93, Er: 167.26, Tm: 168.93,
  Yb: 173.05, Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
  Tl: 204.38, Pb: 207.2, Bi: 208.98, Th: 232.04, Pa: 231.04, U: 238.03,
};

// "CuSO4·5H2O", "Ca(OH)2", "K4[Fe(CN)6]" -> { mass, atoms } or throws
export const molarMass = (formula) => {
  const parts = String(formula || '').replace(/\s+/g, '').split(/[·•*]|\.(?=\d*[A-Z(])/).filter(Boolean);
  if (!parts.length) throw new Error('Type a formula');
  const atoms = {};
  parts.forEach((part) => {
    const m = part.match(/^(\d+)(.*)$/);
    const mult = m ? Number(m[1]) : 1;
    const body = m ? m[2] : part;
    const stack = [{}];
    let i = 0;
    while (i < body.length) {
      const ch = body[i];
      if (ch === '(' || ch === '[') { stack.push({}); i += 1; continue; }
      if (ch === ')' || ch === ']') {
        if (stack.length < 2) throw new Error('Brackets do not match');
        const grp = stack.pop(); i += 1;
        const n = body.slice(i).match(/^\d+/); const k = n ? Number(n[0]) : 1; i += n ? n[0].length : 0;
        Object.entries(grp).forEach(([e, c]) => { stack[stack.length - 1][e] = (stack[stack.length - 1][e] || 0) + c * k; });
        continue;
      }
      const el = body.slice(i).match(/^[A-Z][a-z]?/);
      if (!el) throw new Error(`Cannot read "${body.slice(i, i + 3)}"`);
      if (!ATOMIC[el[0]]) throw new Error(`Unknown element ${el[0]}`);
      i += el[0].length;
      const n = body.slice(i).match(/^\d+/); const k = n ? Number(n[0]) : 1; i += n ? n[0].length : 0;
      stack[stack.length - 1][el[0]] = (stack[stack.length - 1][el[0]] || 0) + k;
    }
    if (stack.length !== 1) throw new Error('Brackets do not match');
    Object.entries(stack[0]).forEach(([e, c]) => { atoms[e] = (atoms[e] || 0) + c * mult; });
  });
  const mass = Object.entries(atoms).reduce((s, [e, c]) => s + ATOMIC[e] * c, 0);
  return { mass, atoms };
};

export const fmt = (x, d = 4) => {
  if (x === null || x === undefined || !Number.isFinite(x)) return '-';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e6 || a < 1e-3) return x.toExponential(3);
  return Number(x.toPrecision(d)).toLocaleString(undefined, { maximumFractionDigits: 6 });
};
const ok = (...v) => v.every((x) => typeof x === 'number' && Number.isFinite(x));
const Num = ({ label, value, onChange, unit, min = 0, step, width = 150 }) => (
  <div style={{ display: 'inline-block', marginRight: 12, marginBottom: 8 }}>
    <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
    <InputNumber value={value} onChange={onChange} min={min} step={step} style={{ width }} addonAfter={unit} />
  </div>
);
const Result = ({ children }) => <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '8px 12px', marginTop: 4 }}>{children}</div>;
const Formula = ({ children }) => <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>{children}</Paragraph>;

// Typical commercial strengths: CHECK THE BOTTLE LABEL / SDS. Densities at about 20 °C.
const STOCKS = [
  { id: 'hcl', name: 'Hydrochloric acid 37%', w: 37, rho: 1.19, mw: 36.46, n: 1, kind: 'acid' },
  { id: 'h2so4', name: 'Sulfuric acid 98%', w: 98, rho: 1.84, mw: 98.08, n: 2, kind: 'acid' },
  { id: 'hno3', name: 'Nitric acid 65%', w: 65, rho: 1.39, mw: 63.01, n: 1, kind: 'acid' },
  { id: 'h3po4', name: 'Phosphoric acid 85%', w: 85, rho: 1.685, mw: 98.0, n: 3, kind: 'acid' },
  { id: 'acoh', name: 'Acetic acid, glacial 100%', w: 100, rho: 1.049, mw: 60.05, n: 1, kind: 'acid' },
  { id: 'nh3', name: 'Ammonia solution 25%', w: 25, rho: 0.91, mw: 17.03, n: 1, kind: 'base' },
  { id: 'naoh', name: 'Sodium hydroxide solution 50%', w: 50, rho: 1.52, mw: 40.0, n: 1, kind: 'base' },
  { id: 'h2o2', name: 'Hydrogen peroxide 30%', w: 30, rho: 1.11, mw: 34.01, n: 0, kind: 'other' },
];

// ------------------------------------------------------------------ 1. molar mass
const MolarMass = ({ onMw }) => {
  const [f, setF] = useState('CuSO4·5H2O');
  const r = useMemo(() => { try { return molarMass(f); } catch (e) { return { error: e.message }; } }, [f]);
  return (
    <div>
      <Input value={f} onChange={(e) => setF(e.target.value)} maxLength={80} placeholder="e.g. NaCl, Ca(OH)2, CuSO4·5H2O" style={{ maxWidth: 320 }} />
      {r.error ? <Alert style={{ marginTop: 8 }} type="warning" showIcon message={r.error} /> : (
        <Result>
          <Text strong>{fmt(r.mass, 6)} g/mol</Text>
          <div style={{ fontSize: 12 }}>{Object.entries(r.atoms).map(([e, c]) => `${e} ${c} × ${ATOMIC[e]}`).join(' + ')}</div>
          <Button size="small" type="link" style={{ padding: 0 }} onClick={() => onMw(Number(r.mass.toFixed(3)))}>Use in the solution calculators</Button>
        </Result>
      )}
      <Formula>Sum of IUPAC standard atomic weights. Hydrates: write the water after "·" or "." (e.g. CuSO4.5H2O).</Formula>
    </div>
  );
};

// ------------------------------------------------------------------ 2. solution preparation
const SolutionPrep = ({ mw, setMw }) => {
  const [mode, setMode] = useState('molar');
  const [c, setC] = useState(0.1);
  const [v, setV] = useState(500);
  const [purity, setPurity] = useState(100);
  const grams = mode === 'molar' ? (ok(c, v, mw) ? (c * (v / 1000) * mw) : NaN) : (ok(c, v) ? (c / 100) * v : NaN);
  const real = ok(grams, purity) && purity > 0 ? grams / (purity / 100) : NaN;
  return (
    <div>
      <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} style={{ marginBottom: 8 }} optionType="button"
        options={[{ value: 'molar', label: 'Molarity (mol/L)' }, { value: 'wv', label: '% w/v' }]} />
      <div>
        <Num label={mode === 'molar' ? 'Concentration' : 'Concentration'} value={c} onChange={setC} unit={mode === 'molar' ? 'mol/L' : '% w/v'} step={0.01} />
        <Num label="Final volume" value={v} onChange={setV} unit="mL" />
        {mode === 'molar' && <Num label="Molar mass" value={mw} onChange={setMw} unit="g/mol" />}
        <Num label="Purity of the solid" value={purity} onChange={setPurity} unit="%" />
      </div>
      <Result>Weigh <Text strong>{fmt(real)} g</Text>, dissolve in less water, then make up to {v || '-'} mL in a volumetric flask.</Result>
      <Formula>{mode === 'molar' ? 'mass (g) = M × V (L) × molar mass ÷ purity' : 'mass (g) = % w/v × V (mL) ÷ 100 ÷ purity'}</Formula>
    </div>
  );
};

// ------------------------------------------------------------------ 3. dilution
const Dilution = () => {
  const [c1, setC1] = useState(12.1);
  const [v1, setV1] = useState(null);
  const [c2, setC2] = useState(1);
  const [v2, setV2] = useState(250);
  const vals = { c1, v1, c2, v2 };
  const blanks = Object.entries(vals).filter(([, x]) => x === null || x === undefined || x === '');
  let out = null;
  if (blanks.length === 1) {
    const k = blanks[0][0];
    const r = { c1: (c2 * v2) / v1, v1: (c2 * v2) / c1, c2: (c1 * v1) / v2, v2: (c1 * v1) / c2 }[k];
    out = { k, r };
  }
  const name = { c1: 'Stock concentration C1', v1: 'Stock volume V1', c2: 'Final concentration C2', v2: 'Final volume V2' };
  return (
    <div>
      <Paragraph style={{ marginBottom: 6 }}>Leave one box empty: it is calculated.</Paragraph>
      <Num label="C1 (stock)" value={c1} onChange={setC1} unit="conc." step={0.1} />
      <Num label="V1 (stock)" value={v1} onChange={setV1} unit="mL" />
      <Num label="C2 (wanted)" value={c2} onChange={setC2} unit="conc." step={0.1} />
      <Num label="V2 (final)" value={v2} onChange={setV2} unit="mL" />
      {out && Number.isFinite(out.r) && <Result>{name[out.k]} = <Text strong>{fmt(out.r)}</Text> {out.k.startsWith('v') ? 'mL' : '(same unit as the other concentration)'}
        {out.k === 'v1' && ok(v2) && <div>Add {fmt(out.r)} mL of stock to about {fmt(v2 - out.r)} mL of water, then make up to {v2} mL.</div>}</Result>}
      {out && ok(c1, c2) && c2 > c1 && <Alert type="warning" showIcon style={{ marginTop: 8 }} message="The wanted concentration is higher than the stock: this is not a dilution." />}
      {blanks.length !== 1 && <Alert type="info" showIcon style={{ marginTop: 8 }} message="Leave exactly one box empty." />}
      <Formula>C1 × V1 = C2 × V2. For acids: always add acid to water, slowly, with stirring and cooling.</Formula>
    </div>
  );
};

// ------------------------------------------------------------------ 4. concentrated reagents
const StockReagent = () => {
  const [id, setId] = useState('hcl');
  const base = STOCKS.find((s) => s.id === id);
  const [w, setW] = useState(base.w);
  const [rho, setRho] = useState(base.rho);
  const [mw, setMw] = useState(base.mw);
  const [target, setTarget] = useState(1);
  const [vol, setVol] = useState(1000);
  const pick = (k) => { const s = STOCKS.find((x) => x.id === k); setId(k); setW(s.w); setRho(s.rho); setMw(s.mw); };
  const M = ok(w, rho, mw) && mw > 0 ? (w * rho * 10) / mw : NaN;
  const need = ok(M, target, vol) && M > 0 ? (target * vol) / M : NaN;
  return (
    <div>
      <Select value={id} onChange={pick} style={{ width: '100%', maxWidth: 340, marginBottom: 8 }} options={STOCKS.map((s) => ({ value: s.id, label: s.name }))} />
      <div>
        <Num label="Strength" value={w} onChange={setW} unit="% w/w" step={0.5} />
        <Num label="Density" value={rho} onChange={setRho} unit="g/mL" step={0.01} />
        <Num label="Molar mass" value={mw} onChange={setMw} unit="g/mol" />
      </div>
      <Result>The bottle is about <Text strong>{fmt(M)} mol/L</Text>{base.n > 1 && ok(M) ? ` (${fmt(M * base.n)} N as an acid)` : ''}.</Result>
      <Divider style={{ margin: '10px 0' }} />
      <Num label="Wanted concentration" value={target} onChange={setTarget} unit="mol/L" step={0.1} />
      <Num label="Volume to make" value={vol} onChange={setVol} unit="mL" />
      <Result>Measure <Text strong>{fmt(need)} mL</Text> of the concentrated reagent{base.kind === 'acid' ? ' and add it slowly to about half the water' : ''}, then make up to {vol || '-'} mL.</Result>
      <Formula>M = (% w/w × density × 10) ÷ molar mass. The strengths listed are typical commercial grades: use the numbers on your bottle or its SDS.</Formula>
    </div>
  );
};

// ------------------------------------------------------------------ 5. pH
const PH = () => {
  const [kind, setKind] = useState('sa');
  const [c, setC] = useState(0.01);
  const [n, setN] = useState(1);
  const [pk, setPk] = useState(4.76);
  const [ca, setCa] = useState(0.1);
  const [cb, setCb] = useState(0.1);
  let ph = NaN; let note = '';
  const K = 10 ** -pk;
  if (kind === 'sa' && ok(c, n) && c > 0) ph = -Math.log10(c * n);
  if (kind === 'sb' && ok(c, n) && c > 0) ph = 14 + Math.log10(c * n);
  if (kind === 'wa' && ok(c, pk) && c > 0) { const h = (-K + Math.sqrt(K * K + 4 * K * c)) / 2; ph = -Math.log10(h); }
  if (kind === 'wb' && ok(c, pk) && c > 0) { const oh = (-K + Math.sqrt(K * K + 4 * K * c)) / 2; ph = 14 + Math.log10(oh); }
  if (kind === 'buf' && ok(pk, ca, cb) && ca > 0 && cb > 0) { ph = pk + Math.log10(cb / ca); if (cb / ca > 10 || cb / ca < 0.1) note = 'Ratio outside 0.1-10: a poor buffer, and the equation becomes inaccurate.'; }
  if ((kind === 'sa' || kind === 'sb' || kind === 'wa' || kind === 'wb') && ok(c) && c < 1e-6) note = 'Very dilute: water itself changes the pH; the result is approximate.';
  return (
    <div>
      <Select value={kind} onChange={setKind} style={{ width: '100%', maxWidth: 340, marginBottom: 8 }} options={[
        { value: 'sa', label: 'Strong acid (HCl, HNO3, H2SO4 first step)' }, { value: 'sb', label: 'Strong base (NaOH, KOH)' },
        { value: 'wa', label: 'Weak acid (pKa)' }, { value: 'wb', label: 'Weak base (pKb)' }, { value: 'buf', label: 'Buffer (Henderson-Hasselbalch)' }]} />
      <div>
        {kind !== 'buf' && <Num label="Concentration" value={c} onChange={setC} unit="mol/L" step={0.001} />}
        {(kind === 'sa' || kind === 'sb') && <Num label="H+ or OH- per molecule" value={n} onChange={setN} min={1} width={120} />}
        {(kind === 'wa' || kind === 'buf') && <Num label="pKa" value={pk} onChange={setPk} min={-5} step={0.01} width={120} />}
        {kind === 'wb' && <Num label="pKb" value={pk} onChange={setPk} min={-5} step={0.01} width={120} />}
        {kind === 'buf' && <><Num label="Acid [HA]" value={ca} onChange={setCa} unit="mol/L" step={0.01} /><Num label="Base [A-]" value={cb} onChange={setCb} unit="mol/L" step={0.01} /></>}
      </div>
      <Result>pH = <Text strong>{fmt(ph, 3)}</Text>{ok(ph) && (ph <= 2 ? ' (corrosive: pH 2 or lower)' : ph >= 11.5 ? ' (corrosive: pH 11.5 or higher)' : '')}</Result>
      {note && <Alert type="info" showIcon style={{ marginTop: 8 }} message={note} />}
      <Formula>Strong: pH = -log[H+]. Weak: [H+] = (-Ka + √(Ka² + 4·Ka·C)) ÷ 2. Buffer: pH = pKa + log([A-] ÷ [HA]). 25 °C, ideal solutions.</Formula>
    </div>
  );
};

// ------------------------------------------------------------------ 6. ppm <-> mg/m3
const AirConvert = ({ mw, setMw }) => {
  const [ppm, setPpm] = useState(50);
  const [mg, setMg] = useState(null);
  const [t, setT] = useState(25);
  const [p, setP] = useState(101.325);
  const vm = ok(t, p) && p > 0 ? 22.414 * ((t + 273.15) / 273.15) * (101.325 / p) : NaN;
  const toMg = ok(ppm, mw, vm) ? (ppm * mw) / vm : NaN;
  const toPpm = ok(mg, mw, vm) && mw > 0 ? (mg * vm) / mw : NaN;
  return (
    <div>
      <Num label="Molar mass" value={mw} onChange={setMw} unit="g/mol" />
      <Num label="Temperature" value={t} onChange={setT} unit="°C" min={-50} width={130} />
      <Num label="Pressure" value={p} onChange={setP} unit="kPa" width={150} />
      <Divider style={{ margin: '6px 0' }} />
      <Num label="ppm" value={ppm} onChange={setPpm} unit="ppm" />
      <Result>{fmt(ppm)} ppm = <Text strong>{fmt(toMg)} mg/m³</Text></Result>
      <div style={{ marginTop: 8 }}><Num label="mg/m³" value={mg} onChange={setMg} unit="mg/m³" /></div>
      {ok(mg) && <Result>{fmt(mg)} mg/m³ = <Text strong>{fmt(toPpm)} ppm</Text></Result>}
      <Formula>mg/m³ = ppm × molar mass ÷ molar volume; molar volume = {fmt(vm, 4)} L/mol here (24.45 at 25 °C and 101.325 kPa). For gases and vapours only, not dusts.</Formula>
    </div>
  );
};

// ------------------------------------------------------------------ 7. exposure: 8-h TWA and mixtures
const Exposure = () => {
  const [rows, setRows] = useState([{ c: 120, t: 240 }, { c: 60, t: 180 }, { c: 0, t: 60 }]);
  const [oel, setOel] = useState(100);
  const [mix, setMix] = useState([{ name: 'Acetone', c: 250, oel: 500 }, { name: 'Toluene', c: 10, oel: 20 }]);
  const mins = rows.reduce((s, r) => s + (Number(r.t) || 0), 0);
  const twa = rows.reduce((s, r) => s + (Number(r.c) || 0) * (Number(r.t) || 0), 0) / 480;
  const sum = mix.reduce((s, r) => s + (r.oel > 0 ? (Number(r.c) || 0) / r.oel : 0), 0);
  const upd = (set, list, i, k, v) => set(list.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div>
      <Text strong>8-hour time-weighted average</Text>
      {rows.map((r, i) => (
        <Space key={i} wrap style={{ display: 'flex', marginTop: 6 }}>
          <InputNumber value={r.c} min={0} onChange={(v) => upd(setRows, rows, i, 'c', v)} addonAfter="ppm or mg/m³" style={{ width: 200 }} aria-label="Concentration" />
          <InputNumber value={r.t} min={0} onChange={(v) => upd(setRows, rows, i, 't', v)} addonAfter="min" style={{ width: 130 }} aria-label="Minutes" />
          <Button icon={<DeleteOutlined />} aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))} disabled={rows.length < 2} />
        </Space>
      ))}
      <Button size="small" icon={<PlusOutlined />} style={{ marginTop: 6 }} onClick={() => setRows([...rows, { c: 0, t: 60 }])}>Add a sample</Button>
      <div style={{ marginTop: 8 }}><Num label="Exposure limit (8-h)" value={oel} onChange={setOel} unit="same unit" /></div>
      <Result>
        8-h TWA = <Text strong>{fmt(twa)}</Text> ({fmt(ok(twa, oel) && oel > 0 ? (100 * twa) / oel : NaN, 3)}% of the limit) {ok(twa, oel) && oel > 0 && (twa > oel ? <Text type="danger">Over the limit</Text> : twa > oel / 2 ? <Text type="warning">Above half the limit: act</Text> : null)}
        {mins !== 480 && <div style={{ fontSize: 12 }}>Samples cover {mins} minutes; time not sampled counts as zero exposure{mins > 480 ? '. Shifts longer than 8 hours may need a reduced limit' : ''}.</div>}
      </Result>
      <Formula>TWA = Σ(Ci × ti) ÷ 480 min.</Formula>
      <Divider style={{ margin: '10px 0' }} />
      <Text strong>Several substances with the same effect</Text>
      <Table size="small" pagination={false} dataSource={mix.map((r, i) => ({ ...r, key: i }))} style={{ marginTop: 6 }} scroll={{ x: 420 }} columns={[
        { title: 'Substance', render: (_, r, i) => <Input value={r.name} maxLength={60} onChange={(e) => upd(setMix, mix, i, 'name', e.target.value)} /> },
        { title: 'Measured', width: 110, render: (_, r, i) => <InputNumber value={r.c} min={0} onChange={(v) => upd(setMix, mix, i, 'c', v)} style={{ width: 95 }} /> },
        { title: 'Limit', width: 110, render: (_, r, i) => <InputNumber value={r.oel} min={0} onChange={(v) => upd(setMix, mix, i, 'oel', v)} style={{ width: 95 }} /> },
        { title: 'C/L', width: 70, render: (_, r) => fmt(r.oel > 0 ? r.c / r.oel : NaN, 2) },
        { title: '', width: 50, render: (_, __, i) => <Button size="small" icon={<DeleteOutlined />} aria-label="Remove" onClick={() => setMix(mix.filter((_, j) => j !== i))} disabled={mix.length < 2} /> },
      ]} />
      <Button size="small" icon={<PlusOutlined />} style={{ marginTop: 6 }} onClick={() => setMix([...mix, { name: '', c: 0, oel: 1 }])}>Add a substance</Button>
      <Result>Sum = <Text strong>{fmt(sum, 3)}</Text> {sum > 1 ? <Text type="danger">above 1: the mixture is over the limit</Text> : 'at or below 1: within the mixture limit'}</Result>
      <Formula>Additive mixture rule (ACGIH / EH40): C1/L1 + C2/L2 + ... must not exceed 1, for substances acting on the same organ. Use your country's limits.</Formula>
    </div>
  );
};

// ------------------------------------------------------------------ 8. LEL of a fuel mixture (Le Chatelier)
const MixLel = () => {
  const [rows, setRows] = useState([{ name: 'Methane', y: 80, lel: 5.0 }, { name: 'Propane', y: 20, lel: 2.1 }]);
  const tot = rows.reduce((s, r) => s + (Number(r.y) || 0), 0);
  const den = rows.reduce((s, r) => s + (r.lel > 0 ? (Number(r.y) || 0) / r.lel : 0), 0);
  const lel = den > 0 ? tot / den : NaN;
  const upd = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div>
      <Table size="small" pagination={false} dataSource={rows.map((r, i) => ({ ...r, key: i }))} scroll={{ x: 380 }} columns={[
        { title: 'Gas / vapour', render: (_, r, i) => <Input value={r.name} maxLength={40} onChange={(e) => upd(i, 'name', e.target.value)} /> },
        { title: '% of the fuel', width: 110, render: (_, r, i) => <InputNumber value={r.y} min={0} max={100} onChange={(v) => upd(i, 'y', v)} style={{ width: 95 }} /> },
        { title: 'LEL % vol', width: 110, render: (_, r, i) => <InputNumber value={r.lel} min={0} step={0.1} onChange={(v) => upd(i, 'lel', v)} style={{ width: 95 }} /> },
        { title: '', width: 50, render: (_, __, i) => <Button size="small" icon={<DeleteOutlined />} aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))} disabled={rows.length < 2} /> },
      ]} />
      <Button size="small" icon={<PlusOutlined />} style={{ marginTop: 6 }} onClick={() => setRows([...rows, { name: '', y: 0, lel: 1 }])}>Add a component</Button>
      <Result>Mixture LEL ≈ <Text strong>{fmt(lel, 3)} % by volume</Text>; 10% of it (a common hot-work and entry limit) = {fmt(lel * 0.1, 3)} % vol = {fmt(lel * 1000, 4)} ppm at 10% LEL{Math.abs(tot - 100) > 0.5 ? ` · fuel fractions add up to ${fmt(tot, 3)}%, normalised` : ''}.</Result>
      <Formula>Le Chatelier: LEL(mix) = 100 ÷ Σ(yi ÷ LELi), yi = % of each component in the fuel part. Take LEL values from the SDS (section 9). Approximate for mixtures with hydrogen or very different gases.</Formula>
    </div>
  );
};

// ------------------------------------------------------------------ 9. dilution ventilation and purge time
const Ventilation = ({ mw, setMw }) => {
  const [lph, setLph] = useState(0.1);
  const [rho, setRho] = useState(0.79);
  const [oel, setOel] = useState(500);
  const [k, setK] = useState(5);
  const [room, setRoom] = useState(150);
  const [c0, setC0] = useState(1000);
  const [c1, setC1] = useState(50);
  const [q, setQ] = useState(900);
  const gMg = ok(lph, rho) ? lph * rho * 1e6 : NaN;                     // mg/h evaporated
  const oelMg = ok(oel, mw) ? (oel * mw) / 24.45 : NaN;                  // ppm -> mg/m3 at 25 °C
  const need = ok(gMg, oelMg, k) && oelMg > 0 ? (k * gMg) / oelMg : NaN; // m3/h
  const t = ok(room, q, c0, c1, k) && q > 0 && c1 > 0 && c0 > c1 ? (room / (q / k)) * Math.log(c0 / c1) * 60 : NaN; // minutes
  return (
    <div>
      <Text strong>Air needed to keep a solvent below its limit</Text>
      <div style={{ marginTop: 6 }}>
        <Num label="Liquid evaporated" value={lph} onChange={setLph} unit="L/h" step={0.01} />
        <Num label="Liquid density" value={rho} onChange={setRho} unit="g/mL" step={0.01} />
        <Num label="Molar mass" value={mw} onChange={setMw} unit="g/mol" />
        <Num label="Exposure limit" value={oel} onChange={setOel} unit="ppm" />
        <Num label="Mixing factor K" value={k} onChange={setK} min={1} width={120} />
        <Num label="Room volume" value={room} onChange={setRoom} unit="m³" />
      </div>
      <Result>Fresh air needed ≈ <Text strong>{fmt(need)} m³/h</Text> ({fmt(need / 3600, 3)} m³/s){ok(need, room) && room > 0 ? `, about ${fmt(need / room, 3)} air changes per hour for this room` : ''}.</Result>
      <Formula>Q = K × G ÷ limit (mg/m³); G = L/h × density × 10⁶ mg/h. K = 1 to 10 for poor mixing and uncertainty (ACGIH Industrial Ventilation). Dilution is not suitable for very toxic substances or large releases: use local exhaust.</Formula>
      <Divider style={{ margin: '10px 0' }} />
      <Text strong>Time to purge a space</Text>
      <div style={{ marginTop: 6 }}>
        <Num label="Starting level" value={c0} onChange={setC0} unit="ppm" />
        <Num label="Target level" value={c1} onChange={setC1} unit="ppm" />
        <Num label="Fan airflow" value={q} onChange={setQ} unit="m³/h" />
      </div>
      <Result>About <Text strong>{fmt(t, 3)} minutes</Text> with no further release (using K = {k || '-'} and room {room || '-'} m³). Always confirm with a gas test before entry.</Result>
      <Formula>t = (V ÷ (Q ÷ K)) × ln(C0 ÷ C).</Formula>
    </div>
  );
};

// ------------------------------------------------------------------ 10. spill neutraliser
const NEUTRALISERS = {
  acid: [{ id: 'bicarb', name: 'Sodium bicarbonate (NaHCO3)', mw: 84.01, eq: 1, note: 'gives CO2 gas and foaming' },
    { id: 'soda', name: 'Sodium carbonate (soda ash, Na2CO3)', mw: 105.99, eq: 2, note: 'gives CO2 gas; more heat than bicarbonate' }],
  base: [{ id: 'citric', name: 'Citric acid (C6H8O7)', mw: 192.12, eq: 3, note: 'weak acid, little heat' },
    { id: 'bisulfate', name: 'Sodium bisulfate (NaHSO4)', mw: 120.06, eq: 1, note: 'acidic salt' }],
};
const Neutraliser = () => {
  const [stock, setStock] = useState('hcl');
  const [liters, setLiters] = useState(1);
  const s = STOCKS.find((x) => x.id === stock);
  const kind = s.kind === 'base' ? 'base' : 'acid';
  const molar = (s.w * s.rho * 10) / s.mw;
  const eq = ok(liters) ? liters * molar * s.n : NaN;    // mol of H+ or OH-
  return (
    <div>
      <Select value={stock} onChange={setStock} style={{ width: '100%', maxWidth: 340, marginBottom: 8 }}
        options={STOCKS.filter((x) => x.n > 0).map((x) => ({ value: x.id, label: x.name }))} />
      <Num label="Spilled volume" value={liters} onChange={setLiters} unit="L" step={0.1} />
      <Result>
        <div>{fmt(liters)} L of {s.name} ≈ {fmt(eq)} mol of {kind === 'acid' ? 'H+' : 'OH-'}. Minimum neutraliser:</div>
        {NEUTRALISERS[kind].map((n) => <div key={n.id}><Text strong>{fmt((eq / n.eq) * n.mw / 1000, 3)} kg</Text> of {n.name} ({n.note})</div>)}
      </Result>
      {s.id === 'hno3' || s.id === 'h2so4' ? <Alert type="warning" showIcon style={{ marginTop: 8 }} message="Concentrated nitric and sulfuric acid react strongly with organic absorbents: use only acid-rated absorbent or neutraliser." /> : null}
      <Formula>Stoichiometric amounts. Use more in practice (commercial kits state their coverage), add from the edge inward, slowly: heat and gas are released. Check with pH paper (6-9) before collecting the residue as waste.</Formula>
    </div>
  );
};

const ChemicalLab = () => {
  const history = useHistory();
  const [mw, setMw] = useState(58.08);
  const cards = [
    { k: 'mm', t: 'Molar mass from a formula', c: <MolarMass onMw={setMw} /> },
    { k: 'prep', t: 'Make up a solution', c: <SolutionPrep mw={mw} setMw={setMw} /> },
    { k: 'dil', t: 'Dilution (C1V1 = C2V2)', c: <Dilution /> },
    { k: 'stock', t: 'Concentrated reagents: strength and dilution', c: <StockReagent /> },
    { k: 'ph', t: 'pH', c: <PH /> },
    { k: 'air', t: 'ppm ↔ mg/m³', c: <AirConvert mw={mw} setMw={setMw} /> },
    { k: 'exp', t: 'Exposure: 8-hour TWA and mixtures', c: <Exposure /> },
    { k: 'lel', t: 'Flammable limit of a gas mixture', c: <MixLel /> },
    { k: 'vent', t: 'Dilution ventilation and purge time', c: <Ventilation mw={mw} setMw={setMw} /> },
    { k: 'spill', t: 'Spill neutraliser amount', c: <Neutraliser /> },
  ];
  return (
    <div>
      <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
          <Text>Lab checklists in Inspections: fume hood, eyewash and shower, chemical store and cabinet, gas cylinders, spill kit.</Text>
          <Button type="primary" onClick={() => history.push('/inspections')}>Open Inspections</Button>
        </Space>
      </Card>
      <Row gutter={[16, 16]}>
        {cards.map((x) => <Col xs={24} xl={12} key={x.k}><Card title={x.t} style={{ borderRadius: 12, height: '100%' }}>{x.c}</Card></Col>)}
      </Row>
      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12 }}>
        Calculations run in your browser. They support, but do not replace, the SDS, your exposure limits and a competent person's judgement.
      </Paragraph>
    </div>
  );
};

export default ChemicalLab;
