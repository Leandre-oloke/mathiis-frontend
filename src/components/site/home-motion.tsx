"use client";

import { useEffect, useId, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { CheckCheck, FileText, Sparkles } from 'lucide-react';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const subscribeMotion = (onChange: () => void) => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};

/** A word that slides out and is replaced by the next one. All words share one grid cell, so the line never jumps. */
export function RotatingWord({ words, interval = 2400 }: { words: readonly string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setIndex(i => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return <span className="rotating-word">
    {words.map((w, i) => <span key={w} className={i === index ? 'is-in' : 'is-out'} aria-hidden={i !== index}>{w}</span>)}
  </span>;
}

/** A line of text riding a wave, drifting forever. Text is repeated so the loop is seamless. */
export function CurvedMarquee({ text }: { text: string }) {
  const id = useId().replace(/:/g, '');
  const animate = !useSyncExternalStore(subscribeMotion, reducedMotion, () => true);
  const line = Array.from({ length: 6 }, () => text).join('   ✳   ');
  return <div className="curved-marquee" aria-hidden="true">
    <svg viewBox="0 0 1440 96" preserveAspectRatio="xMidYMid slice">
      <path id={`wave-${id}`} d="M-20 62 C 220 26, 460 26, 700 58 S 1180 90, 1460 40" fill="none" />
      <text><textPath href={`#wave-${id}`} startOffset="0%">{line}{animate && <animate attributeName="startOffset" from="0%" to="-50%" dur="38s" repeatCount="indefinite" />}</textPath></text>
    </svg>
  </div>;
}

type Sheet = { subject: string; title: string; level: string; kind: string };
const columns: Sheet[][] = [
  [
    { subject: 'Mathématiques', title: 'Équations du premier degré', level: '3e', kind: 'Épreuve complète' },
    { subject: 'Mathématiques', title: 'Théorème de Pythagore', level: '4e', kind: 'Exercice' },
    { subject: 'Mathématiques', title: 'Fonctions affines', level: '2nde', kind: 'Épreuve complète' },
    { subject: 'Mathématiques', title: 'Statistiques et moyennes', level: '3e', kind: 'Exercice' },
    { subject: 'Mathématiques', title: 'Probabilités', level: '1ère', kind: 'Épreuve complète' },
  ],
  [
    { subject: 'PCT', title: 'Mouvement rectiligne uniforme', level: '2nde', kind: 'Épreuve complète' },
    { subject: 'PCT', title: 'Le circuit électrique', level: '4e', kind: 'Exercice' },
    { subject: 'PCT', title: 'Combustion du carbone', level: '3e', kind: 'Épreuve complète' },
    { subject: 'PCT', title: 'Loi d’Ohm', level: '3e', kind: 'Exercice' },
    { subject: 'PCT', title: 'Masse volumique', level: '5e', kind: 'Exercice' },
  ],
  [
    { subject: 'SVT', title: 'La photosynthèse', level: '4e', kind: 'Épreuve complète' },
    { subject: 'SVT', title: 'La cellule', level: '6e', kind: 'Exercice' },
    { subject: 'SVT', title: 'La digestion', level: '5e', kind: 'Exercice' },
    { subject: 'SVT', title: 'Hérédité et génétique', level: '3e', kind: 'Épreuve complète' },
    { subject: 'SVT', title: 'Les écosystèmes', level: '2nde', kind: 'Épreuve complète' },
  ],
];

function SheetCard({ s, copy }: { s: Sheet; copy?: boolean }) {
  return <article className="wall-sheet" aria-hidden={copy || undefined}>
    <div className="wall-sheet-top"><span>{s.subject}</span><span>{s.level}</span></div>
    <h3>{s.title}</h3>
    <div className="wall-sheet-lines" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="wall-sheet-foot"><span>{s.kind}</span><span>✓ Corrigé inclus</span></div>
  </article>;
}

/** Three columns of example exams scrolling up and down in a loop (each column is duplicated for a seamless loop). */
export function ExamWall() {
  return <div className="exam-wall" aria-label="Exemples d’épreuves">
    {columns.map((col, i) => <div key={i} className={`wall-col${i === 1 ? ' down' : ''}`} style={{ ['--duration' as string]: `${34 + i * 6}s` }}>
      <div className="wall-track">{[...col, ...col].map((s, j) => <SheetCard key={j} s={s} copy={j >= col.length} />)}</div>
    </div>)}
  </div>;
}

const ideas = [
  { idea: 'Équations du premier degré', subject: 'mathématiques', theme: 'Équations & calcul littéral' },
  { idea: 'Le mouvement d’un cycliste', subject: 'PCT', theme: 'Mouvement rectiligne uniforme' },
  { idea: 'Pourquoi les feuilles jaunissent', subject: 'SVT', theme: 'La photosynthèse' },
];

/** "01 / Créer" scene, on a loop: an idea is typed, the link draws itself, the exam card appears and fills, the check bounces.
 *  Each cycle remounts the step (key) so the CSS choreography replays. */
export function IdeaToExam() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setIndex(i => (i + 1) % ideas.length), 4600);
    return () => clearInterval(t);
  }, []);
  const step = ideas[index];
  return <div className="entry-diagram idea-cycle" aria-live="off">
    <div className="idea-step" key={index}>
      <div className="diagram-input"><Sparkles size={18} /><span className="typed" style={{ '--chars': step.idea.length } as CSSProperties}>{step.idea}</span></div>
      <div className="diagram-path" />
      <div className="diagram-result"><div><FileText size={18} /><span>Épreuve de {step.subject}</span></div><p>{step.theme}</p><div className="diagram-lines"><i /><i /><i /></div><span className="diagram-check"><CheckCheck size={14} /> Épreuve + corrigé</span></div>
    </div>
  </div>;
}

const answerKeys = [
  { subject: 'Mathématiques', rows: [['2x + 6 = 14', '2x = 8 → x = 4'], ['(x + 3)(x − 2)', 'x² + x − 6']] },
  { subject: 'PCT', rows: [['v = d ÷ t = 3 km ÷ 0,2 h', 'v = 15 km/h'], ['E = P × t = 60 W × 5 h', 'E = 300 Wh']] },
  { subject: 'SVT', rows: [['6 CO₂ + 6 H₂O + lumière →', 'C₆H₁₂O₆ + 6 O₂'], ['Rôle des chloroplastes ?', 'Siège de la photosynthèse']] },
] as const;

/** "02 / Corriger": three answer keys stacked like sheets. The deck turns by itself (paused on hover or focus);
 *  clicking the front card sends it to the bottom, clicking a card behind brings it to the front.
 *  Each time, the front card's answers are ticked again. */
export function CorrectionDeck() {
  const [order, setOrder] = useState([0, 1, 2]);
  const [paused, setPaused] = useState(false);
  const next = () => setOrder(o => [...o.slice(1), o[0]]);
  const bring = (i: number) => setOrder(o => (o[0] === i ? [...o.slice(1), i] : [i, ...o.filter(x => x !== i)]));
  useEffect(() => {
    if (paused || reducedMotion()) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [paused]);
  return <div className="correction-deck" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    <div className="deck-stack">
      {answerKeys.map((k, i) => {
        const pos = order.indexOf(i);
        return <article key={k.subject} className="entry-correction deck-card" data-pos={pos} aria-hidden={pos !== 0}
          role={pos === 0 ? 'button' : undefined} tabIndex={pos === 0 ? 0 : -1} aria-label={pos === 0 ? `Corrigé de ${k.subject} : cliquer pour voir le suivant` : undefined}
          onClick={() => bring(i)} onKeyDown={e => { if (pos === 0 && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); } }}>
          <span className="mono-tag">Mathiis / Corrigé · {k.subject}</span>
          <h3>Le raisonnement<br />prend sa place.</h3>
          {k.rows.map(([q, a], r) => <div key={pos === 0 ? `${r}-${order[0]}` : r} className="deck-row"><span>0{r + 1}</span><p>{q}<br /><strong>{a}</strong></p><CheckCheck /></div>)}
        </article>;
      })}
    </div>
  </div>;
}
