"use client";

import katex from 'katex';
import 'katex/dist/katex.min.css';

const render = (tex: string, display: boolean) => katex.renderToString(tex, { throwOnError: false, displayMode: display, strict: false });

/** Text with $inline$ and $$display$$ LaTeX, as written by the Mathiis model. While a formula is still being
 *  typed (unbalanced $), its source stays faint instead of flashing broken maths. */
export function MathText({ text }: { text: string }) {
  const parts: { kind: 'text' | 'math' | 'pending'; value: string; display?: boolean }[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push({ kind: 'text', value: text.slice(last, m.index) });
    parts.push({ kind: 'math', value: m[1] ?? m[2], display: m[1] !== undefined });
    last = re.lastIndex;
  }
  const rest = text.slice(last);
  const open = rest.indexOf('$');
  if (open === -1) parts.push({ kind: 'text', value: rest });
  else { parts.push({ kind: 'text', value: rest.slice(0, open) }); parts.push({ kind: 'pending', value: rest.slice(open) }); }
  return <>{parts.map((p, i) => p.kind === 'text' ? <span key={i}>{p.value}</span>
    : p.kind === 'pending' ? <span key={i} className="math-pending">{p.value}</span>
    : <span key={i} className={p.display ? 'math-display' : 'math-inline'} dangerouslySetInnerHTML={{ __html: render(p.value, !!p.display) }} />)}</>;
}

type P3 = [number, number, number];

/** Draws a [FIGURE: type=repere3d …] marker: cabinet projection of the axes, named points, vectors, edges and planes. */
export function Figure3D({ spec }: { spec: string }) {
  const points: Record<string, P3> = {};
  for (const m of spec.matchAll(/([A-Z])\((-?[\d.]+),(-?[\d.]+),(-?[\d.]+)\)/g)) points[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  const field = (name: string) => spec.match(new RegExp(`${name}=([^\\s\\]]+)`))?.[1];
  const planes = [field('plans'), field('planes')].filter(Boolean).flatMap(v => v!.split(';'));
  const vectors = field('vecteurs')?.split(',') ?? [];
  const edges = field('aretes')?.split(',') ?? [];

  const k = Math.SQRT1_2 * .55;
  const proj = ([x, y, z]: P3) => [y - x * k, -z + x * k] as const;
  const all = Object.values(points);
  const span = Math.max(2, ...all.flatMap(p => p.map(Math.abs))) + 1;
  const axes: P3[] = [[span, 0, 0], [0, span, 0], [0, 0, span]];
  const pts2 = [...all, ...axes, [0, 0, 0] as P3].map(proj);
  const xs = pts2.map(p => p[0]), ys = pts2.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 340, H = 250, pad = 26;
  const s = Math.min((W - pad * 2) / (maxX - minX || 1), (H - pad * 2) / (maxY - minY || 1));
  const at = (p: P3) => { const [u, v] = proj(p); return [pad + (u - minX) * s, pad + (v - minY) * s] as const; };
  const o = at([0, 0, 0]);
  const seg = (a: string, b: string) => points[a] && points[b] ? [at(points[a]), at(points[b])] as const : null;
  return <figure className="fig3d">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Repère de l’espace avec les points ${Object.keys(points).join(', ')}`}>
      <defs><marker id="fig-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" /></marker></defs>
      {planes.map(name => { const corners = name.split('').map(c => points[c]).filter(Boolean); if (corners.length < 3) return null; return <polygon key={name} className="fig-plane" points={corners.map(c => at(c).join(',')).join(' ')} />; })}
      {axes.map((a, i) => { const e = at(a); return <g key={i} className="fig-axis"><line x1={o[0]} y1={o[1]} x2={e[0]} y2={e[1]} markerEnd="url(#fig-arrow)" /><text x={e[0] + 6} y={e[1] + 4}>{'xyz'[i]}</text></g>; })}
      <text className="fig-origin" x={o[0] - 14} y={o[1] + 14}>O</text>
      {edges.map(e => { const l = seg(e[0], e[1]); return l && <line key={e} className="fig-edge" x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} />; })}
      {vectors.map(v => { const l = seg(v[0], v[1]); return l && <line key={v} className="fig-vector" x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} markerEnd="url(#fig-arrow)" />; })}
      {Object.entries(points).map(([name, p]) => { const [x, y] = at(p); return <g key={name} className="fig-point"><circle cx={x} cy={y} r="3" /><text x={x + 5} y={y - 5}>{name}</text></g>; })}
    </svg>
    <figcaption>Figure · repère orthonormé de l’espace</figcaption>
  </figure>;
}
