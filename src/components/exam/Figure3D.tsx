type P3 = [number, number, number];

/** Parses a model marker such as `[FIGURE: type=repere3d points=A(2,-1,3),B(...) plans=ABC;DEF vecteurs=AB aretes=AB,BC]`. */
export function parseFigure(spec: string) {
  const points: Record<string, P3> = {};
  for (const m of spec.matchAll(/([A-Z])\((-?[\d.]+),(-?[\d.]+),(-?[\d.]+)\)/g)) points[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  const field = (name: string) => spec.match(new RegExp(`${name}=([^\\s\\]]+)`))?.[1];
  return {
    type: field("type") ?? "",
    points,
    planes: [field("plans"), field("planes")].filter(Boolean).flatMap((v) => v!.split(";")),
    vectors: field("vecteurs")?.split(",") ?? [],
    edges: field("aretes")?.split(",") ?? [],
  };
}

export const isFigureMarker = (text: string) => /^\s*\[FIGURE:/.test(text);

/** Draws a 3D frame (cabinet projection) with named points, vectors, edges and planes, in ink. */
export function Figure3D({ spec }: { spec: string }) {
  const { points, planes, vectors, edges } = parseFigure(spec);
  const all = Object.values(points);
  if (all.length === 0) return null;
  const k = Math.SQRT1_2 * 0.55;
  const proj = ([x, y, z]: P3) => [y - x * k, -z + x * k] as const;
  const span = Math.max(2, ...all.flatMap((p) => p.map(Math.abs))) + 1;
  const axes: P3[] = [[span, 0, 0], [0, span, 0], [0, 0, span]];
  const flat = [...all, ...axes, [0, 0, 0] as P3].map(proj);
  const xs = flat.map((p) => p[0]), ys = flat.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 340, H = 250, pad = 26;
  const s = Math.min((W - pad * 2) / (maxX - minX || 1), (H - pad * 2) / (maxY - minY || 1));
  const at = (p: P3) => { const [u, v] = proj(p); return [pad + (u - minX) * s, pad + (v - minY) * s] as const; };
  const o = at([0, 0, 0]);
  const seg = (a: string, b: string) => (points[a] && points[b] ? ([at(points[a]), at(points[b])] as const) : null);
  return (
    <figure className="my-4 rounded-xl border-[1.5px] border-foreground bg-card p-3">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Repère de l’espace avec les points ${Object.keys(points).join(", ")}`} className="mx-auto block h-auto w-full max-w-[420px] overflow-visible text-foreground">
        <defs><marker id="fig-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="currentColor" /></marker></defs>
        {planes.map((name) => {
          const corners = name.split("").map((c) => points[c]).filter(Boolean);
          return corners.length < 3 ? null : <polygon key={name} points={corners.map((c) => at(c).join(",")).join(" ")} fill="currentColor" fillOpacity={0.07} stroke="currentColor" strokeWidth={0.8} strokeDasharray="4 3" />;
        })}
        {axes.map((a, i) => { const e = at(a); return <g key={i}><line x1={o[0]} y1={o[1]} x2={e[0]} y2={e[1]} stroke="currentColor" strokeWidth={1.2} markerEnd="url(#fig-arrow)" /><text x={e[0] + 6} y={e[1] + 4} fontSize={12} fontStyle="italic" fill="currentColor">{"xyz"[i]}</text></g>; })}
        <text x={o[0] - 14} y={o[1] + 14} fontSize={12} fontStyle="italic" fill="currentColor">O</text>
        {edges.map((e) => { const l = seg(e[0], e[1]); return l && <line key={e} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="currentColor" strokeWidth={1.4} />; })}
        {vectors.map((v) => { const l = seg(v[0], v[1]); return l && <line key={v} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="currentColor" strokeWidth={1.8} markerEnd="url(#fig-arrow)" />; })}
        {Object.entries(points).map(([name, p]) => { const [x, y] = at(p); return <g key={name}><circle cx={x} cy={y} r={3} fill="currentColor" /><text x={x + 5} y={y - 5} fontSize={12} fontWeight={600} fill="currentColor">{name}</text></g>; })}
      </svg>
      <figcaption className="mt-1.5 text-center font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">Figure · repère orthonormé de l’espace</figcaption>
    </figure>
  );
}
