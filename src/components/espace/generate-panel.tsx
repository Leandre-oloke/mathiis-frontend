"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Clock, RotateCcw, Sparkles, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHead, subjects } from './parts';
import { ZoomableDocument } from './zoomable-document';
import { Figure3D, MathText } from './math-text';
import { CLASSES, durationFor, formatDuree, requirement, sampleFor, situationsFor, type Mode, type Pick, type Sa, type Step, type SubjectName } from '@/lib/exam-generator';

/** Ticks activities for the user, spread across the SA (first unticked activity of each SA in turn). */
function autoPick(situations: Sa[], count: number): Pick[] {
  const picks: Pick[] = [];
  for (let round = 0; picks.length < count && round < 20; round++) {
    for (const sa of situations) {
      const items = sa.groups.flatMap(g => g.items);
      if (items[round] && picks.length < count) picks.push({ sa: sa.title, activite: items[round], part: sa.part });
    }
  }
  return picks;
}

function Choice({ selected, onClick, children, className = '' }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return <button type="button" className={`esp-choice ${className}${selected ? ' is-on' : ''}`} aria-pressed={selected} onClick={onClick}>
    <span className="esp-choice-dot" aria-hidden="true">{selected && <Check />}</span>{children}
  </button>;
}

const SPEED = 14; // characters written per tick
const TICK = 28; // ms

// The "Générer une épreuve" screen of the home-page demo, in the workspace's own look. It follows the real
// programme (classes, durations, SA and activities) and starts on Mathématiques, Tle D, the three SA1 activities
// of the real exam it can show. Nothing is invented: any other choice leads to sign-up, where the model writes it.
const DEMO_SA = situationsFor('Mathématiques', 'Tle D')[0]?.title ?? '';
const DEMO_PICKS: Pick[] = ['Barycentre', "Droites et plans de l'espace", "Vecteurs de l'espace"].map(activite => ({ sa: DEMO_SA, activite }));

export function GeneratePanel() {
  const [mode, setMode] = useState<Mode | null>('epreuve');
  const [subjectId, setSubjectId] = useState<string | null>('maths');
  const [classe, setClasse] = useState('Tle D');
  const [picks, setPicks] = useState<Pick[]>(DEMO_PICKS);
  const [openSa, setOpenSa] = useState<string | null>(DEMO_SA);
  const [withKey, setWithKey] = useState(true);
  const [written, setWritten] = useState(0);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearInterval(timer.current), []);

  const subj = subjects.find(s => s.id === subjectId);
  const subject = (subj?.name ?? null) as SubjectName | null;
  const situations = useMemo(() => (subject ? situationsFor(subject, classe) : []), [subject, classe]);
  const need = requirement(subject, mode);
  const duree = formatDuree(durationFor(subject, classe));

  // Any change of settings resets the picks and the sheet.
  // Changing the type, subject or class clears the ticked activities and opens the first SA, so its activities are visible.
  const clearSheet = () => { clearInterval(timer.current); setRunning(false); setWritten(0); setSteps([]); };
  const reset = (subjectName: SubjectName | null, cls: string) => { clearSheet(); setPicks([]); const first = subjectName ? situationsFor(subjectName, cls)[0] : undefined; setOpenSa(first?.title ?? null); };
  const nameOf = (id: string | null) => (subjects.find(s => s.id === id)?.name ?? null) as SubjectName | null;
  const chooseMode = (m: Mode) => { setMode(m); reset(subject, classe); };
  const chooseSubject = (id: string) => { setSubjectId(id); reset(nameOf(id), classe); };
  const chooseClasse = (c: string) => { setClasse(c); reset(subject, c); };

  const toggle = (sa: string, activite: string, part?: Pick['part']) => { clearSheet(); setPicks(list => {
    const on = list.some(p => p.sa === sa && p.activite === activite);
    if (on) return list.filter(p => !(p.sa === sa && p.activite === activite));
    return list.length >= need.max ? list : [...list, { sa, activite, part }];
  }); };

  const ready = !!mode && !!subject && picks.length >= need.min;
  const sample = sampleFor(subject, classe, mode);
  const missing = !mode ? 'Choisissez le type de génération.' : !subject ? 'Choisissez la matière.' : picks.length < need.min ? `Encore ${need.min - picks.length} activité${need.min - picks.length > 1 ? 's' : ''} à cocher : ouvrez une SA ou cliquez sur « Choisir pour moi ».` : '';
  const totalChars = steps.reduce((n, s) => n + s.title.length + s.lines.join('').length, 0);
  const done = steps.length > 0 && written >= totalChars;

  // Which step is being written, and how much of it.
  const sizes = steps.map(s => s.title.length + s.lines.join('').length);
  const progress = steps.map((s, i) => { const before = sizes.slice(0, i).reduce((n, x) => n + x, 0); return { step: s, shown: Math.max(0, Math.min(sizes[i], written - before)), size: sizes[i] }; });
  const finished = progress.filter(p => p.shown >= p.size).length;
  const percent = totalChars ? Math.round((written / totalChars) * 100) : 0;

  const start = () => {
    if (!ready || !mode || !subject) return;
    const plan = sampleFor(subject, classe, mode);
    if (!plan) return;
    const size = plan.reduce((n, s) => n + s.title.length + s.lines.join('').length, 0);
    clearInterval(timer.current);
    setSteps(plan); setWritten(0); setRunning(true);
    // Bring the top of the generation view on screen (the form it replaces may have been scrolled).
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }));
    timer.current = setInterval(() => setWritten(w => { const next = w + SPEED; if (next >= size) { clearInterval(timer.current); setRunning(false); return size; } return next; }), TICK);
  };

  const label = (sa: { number: number; title: string }) => `SA${sa.number} : ${sa.title}`;
  const countIn = (title: string) => picks.filter(p => p.sa === title).length;

  // Once generation starts, the exam takes the whole width; "Modifier les paramètres" brings the form back.
  const generating = steps.length > 0;
  const kind = mode === 'exercice' ? 'Exercice' : 'Épreuve';

  return <div className="esp-page" ref={top}>
    {generating
      ? <PageHead eyebrow={`${kind} · ${subject} · Classe ${classe}`} title={done ? 'Génération terminée' : 'Génération en cours'}
          subtitle={done ? 'Voici l’épreuve rédigée par le modèle Mathiis.' : 'L’épreuve s’écrit sous vos yeux, formules et figures comprises.'}
          actions={<Button variant="framed" type="button" onClick={clearSheet}><ArrowLeft /> Modifier les paramètres</Button>} />
      : <PageHead eyebrow="Nouvelle épreuve" title="Générer une épreuve" subtitle="Configurez les paramètres : la génération s’affiche en direct." />}
    <div className={`esp-gen ${generating ? 'is-generating' : 'is-form'}`}>
      {!generating && <form className="esp-panel esp-gen-form" onSubmit={e => { e.preventDefault(); start(); }}>
        <fieldset><legend><span>1</span>Type de génération</legend>
          <div className="esp-choice-row two">
            <Choice selected={mode === 'epreuve'} onClick={() => chooseMode('epreuve')}><span><strong>Épreuve complète</strong><small>3 problèmes + contexte / tâche</small></span></Choice>
            <Choice selected={mode === 'exercice'} onClick={() => chooseMode('exercice')}><span><strong>Exercice</strong><small>1 ou 2 notions ciblées</small></span></Choice>
          </div>
        </fieldset>
        <fieldset><legend><span>2</span>Matière</legend>
          <div className="esp-choice-row three">
            {subjects.map(s => <Choice key={s.id} className="tall" selected={subjectId === s.id} onClick={() => chooseSubject(s.id)}><span><i className="esp-symbol" aria-hidden="true">{s.symbol}</i><strong>{s.name}</strong><small>{s.detail}</small></span></Choice>)}
          </div>
        </fieldset>
        <fieldset><legend><span>3</span>Classe</legend>
          <div className="esp-select"><select id="gen-classe" value={classe} onChange={e => chooseClasse(e.target.value)} aria-label="Classe">{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronDown aria-hidden="true" /></div>
          <div className="esp-duree"><Clock aria-hidden="true" /><strong>{duree}</strong><span>Durée officielle fixée pour la classe {classe}{subject === 'SVT' ? ' en SVT' : ''}</span></div>
        </fieldset>
        <fieldset><legend><span>4</span>Notions <em>{mode === 'exercice' ? '1 ou 2 activités' : subject === 'SVT' ? '2 ou 3 activités' : '3 activités obligatoires'}</em>{situations.length > 0 && <button type="button" className="esp-autopick" onClick={() => { clearSheet(); setPicks(autoPick(situations, need.max)); }}><WandSparkles /> Choisir pour moi</button>}</legend>
          {!subject ? <p className="esp-hint">Choisissez une matière pour afficher le programme officiel de la classe.</p>
            : situations.length === 0 ? <p className="esp-hint">Le programme de cette classe n’est pas encore intégré pour cette matière.</p>
            : <>
              <div className="esp-sa-chips">{situations.map(sa => {
                const n = countIn(sa.title);
                return <button key={sa.title} type="button" className={`esp-sa${openSa === sa.title ? ' is-open' : ''}${n ? ' has-picks' : ''}`} aria-expanded={openSa === sa.title} onClick={() => setOpenSa(openSa === sa.title ? null : sa.title)}>
                  {sa.part && <small>{sa.part}</small>}{label(sa)}{n > 0 && <i>{n}</i>}
                </button>;
              })}</div>
              {situations.filter(sa => sa.title === openSa).map(sa => <div key={sa.title} className="esp-sa-panel">
                <p className="esp-sa-head"><BookOpen aria-hidden="true" />{label(sa)} · cochez au moins une activité à évaluer</p>
                <div className="esp-sa-list">{sa.groups.map(g => <div key={g.label} className="esp-sa-group">
                  <span>{g.label}</span>
                  {g.items.map(item => {
                    const on = picks.some(p => p.sa === sa.title && p.activite === item);
                    return <label key={item} className={on ? 'is-on' : ''}><input type="checkbox" checked={on} disabled={!on && picks.length >= need.max} onChange={() => toggle(sa.title, item, sa.part)} />{item}</label>;
                  })}
                </div>)}</div>
              </div>)}
              <p className={`esp-sa-count${picks.length >= need.min ? ' is-ok' : ''}`}>{picks.length}/{need.max} activité{need.max > 1 ? 's' : ''} sélectionnée{picks.length > 1 ? 's' : ''}</p>
            </>}
          <label className="esp-toggle"><input type="checkbox" checked={withKey} onChange={e => setWithKey(e.target.checked)} /><span aria-hidden="true" />Générer aussi le corrigé</label>
        </fieldset>
        <div className="esp-gen-submit">
          <p className="esp-hint">{missing || `Prêt : ${mode === 'epreuve' ? 'épreuve complète' : 'exercice'} de ${subject}, classe de ${classe}, ${duree}.`}</p>
          {ready && !sample
            ? <Button asChild className="esp-primary"><Link href="/auth/register">Créer un compte pour générer <ArrowRight /></Link></Button>
            : <Button type="submit" className="esp-primary" disabled={!ready}><Sparkles /> Générer</Button>}
        </div>
      </form>}

      {generating && <aside className="esp-sheet-wrap" aria-live="polite">
        {steps.length > 0 && <div className="esp-progress">
          <div className="esp-progress-top"><span>{done ? 'Génération terminée' : 'Génération en cours, veuillez patienter…'} {percent} %</span><span>{finished}/{steps.length} étapes</span></div>
          <div className="esp-progress-track"><span style={{ width: `${percent}%` }} /></div>
          <div className="esp-progress-steps">{progress.map(p => <span key={p.step.id} className={p.shown >= p.size ? 'is-done' : p.shown > 0 ? 'is-active' : ''}>{p.shown >= p.size ? <Check /> : <i />}{p.step.label}</span>)}</div>
        </div>}
        <ZoomableDocument>
        <div className="esp-sheet">
          <div className="esp-sheet-head"><span>Mathiis · {mode === 'exercice' ? 'Exercice' : 'Épreuve'}</span><span>Année scolaire 2026-2027</span></div>
          <h2>{subject ?? 'Votre épreuve'}</h2>
          <p className="esp-sheet-meta">Classe : {classe} · Durée : {duree}{withKey ? ' · corrigé inclus' : ''}</p>
          <div className="esp-sheet-body">
            {steps.length === 0 && <div className="esp-sheet-blank">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ width: `${90 - (i % 3) * 18}%` }} />)}<p>{!ready ? 'L’aperçu se remplit au fil de vos choix.' : sample ? 'Cliquez sur Générer : l’épreuve s’écrira ici.' : 'Créez un compte : le modèle Mathiis rédigera cette épreuve dans votre espace.'}</p></div>}
            {progress.filter(p => p.shown > 0).map(({ step, shown }) => {
              let budget = shown - step.title.length;
              const title = step.title.slice(0, Math.max(0, shown));
              return <section key={step.id} className="esp-sheet-step">
                <h3>{title}</h3>
                {step.lines.map((line, i) => {
                  if (budget <= 0) return null;
                  const text = line.slice(0, budget); budget -= line.length;
                  if (line.startsWith('[FIGURE:')) return text === line ? <Figure3D key={i} spec={line} /> : <div key={i} className="fig3d is-drawing">Figure en cours de tracé…</div>;
                  return <p key={i} className={/^\d+[.)]/.test(line) ? 'q' : ''}><MathText text={text} /></p>;
                })}
              </section>;
            })}
            {running && <span className="esp-caret" aria-hidden="true" />}
          </div>
          {done && <div className="esp-sheet-done"><span><Check /> Épreuve prête{withKey ? ' · corrigé inclus' : ''}</span><span className="esp-row-actions"><Button variant="framed" size="sm" type="button" onClick={clearSheet}><RotateCcw /> Autres paramètres</Button><Button asChild size="sm" className="esp-primary"><Link href="/auth/register">Générer la vôtre <ArrowRight /></Link></Button></span></div>}
        </div>
        </ZoomableDocument>
        <p className="esp-note">{sample ? 'Exemple réel généré par le modèle Mathiis (Tle D, SA1 « Configurations de l’espace »).' : 'Le choix des notions suit le programme officiel ; la rédaction se fait par le modèle Mathiis, dans votre espace.'}</p>
      </aside>}
    </div>
  </div>;
}
