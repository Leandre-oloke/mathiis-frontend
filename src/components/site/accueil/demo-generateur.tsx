"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Eye, Sparkles } from "lucide-react";
import { CLASSES, durationFor, formatDuree, requirement, sampleFor, situationsFor, type SubjectName } from "@/lib/exam-generator";
import { subjects } from "@/lib/mascot-catalog";
import { Figure3D, MathText } from "@/components/espace/math-text";

const SHORT: Record<string, string> = { maths: "Algèbre, analyse, géométrie", pct: "Physique, Chimie, Techno", svt: "Vie et Terre" };
// The live steps shown for the real Tle D exam, in the order the model writes it.
const SAMPLE_STEPS = ["Contexte et tâche rédigés", "Problème I — Barycentre", "Problème II — Droites et plans", "Problème III — Vecteurs"];
const STEP_MS = 1100;

/** Home-page demo, as in the design: subject, class, official duration, the activities of the class's first learning
 *  situation, and a "Génération en direct" panel. Only real model output is ever shown (Mathématiques, Tle D);
 *  any other choice invites the visitor to create an account, where the model writes it. */
export function DemoGenerateur() {
  const [subjectId, setSubjectId] = useState<string>("maths");
  const [classe, setClasse] = useState("Tle D");
  const subject = (subjects.find((s) => s.id === subjectId)?.subject ?? "Mathématiques") as SubjectName;
  const sa = useMemo(() => situationsFor(subject, classe)[0], [subject, classe]);
  const activities = useMemo(() => sa?.groups.flatMap((g) => g.items) ?? [], [sa]);
  const need = requirement(subject, "epreuve");
  const [picks, setPicks] = useState<string[]>(["Vecteurs de l'espace", "Barycentre", "Droites et plans de l'espace"]);
  const [step, setStep] = useState(-1); // -1: idle, 0..n: running, n: done
  const [showExam, setShowExam] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const result = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearInterval(timer.current), []);

  const sample = sampleFor(subject, classe, "epreuve");
  const ready = picks.length >= need.min;
  const duree = formatDuree(durationFor(subject, classe));
  const running = step >= 0 && step < SAMPLE_STEPS.length;
  const done = step >= SAMPLE_STEPS.length;

  const reset = () => { clearInterval(timer.current); setStep(-1); setShowExam(false); };
  const chooseSubject = (id: string) => { setSubjectId(id); setPicks([]); reset(); };
  const chooseClasse = (c: string) => { setClasse(c); setPicks([]); reset(); };
  const toggle = (a: string) => {
    reset();
    setPicks((list) => (list.includes(a) ? list.filter((x) => x !== a) : list.length >= need.max ? list : [...list, a]));
  };

  const start = () => {
    if (!sample || !ready) return;
    reset();
    setStep(0);
    timer.current = setInterval(() => setStep((s) => {
      if (s + 1 >= SAMPLE_STEPS.length) clearInterval(timer.current);
      return s + 1;
    }), STEP_MS);
  };

  const reveal = () => {
    setShowExam(true);
    requestAnimationFrame(() => result.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  };

  const progress = step < 0 ? 0 : Math.round((Math.min(step, SAMPLE_STEPS.length) / SAMPLE_STEPS.length) * 100);
  const status = !ready
    ? `Choisissez encore ${need.min - picks.length} activité${need.min - picks.length > 1 ? "s" : ""}.`
    : `Prêt : épreuve complète, ${subject}, ${classe}, ${duree}.`;

  return (
    <>
      <div className="ra-window">
        <div className="ra-window-bar">
          <span className="ra-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="ra-mono">mathiis / mon espace / générer</span>
          <span className="ra-pill-yellow">Aperçu interactif</span>
        </div>
        <div className="ra-window-body">
          <form className="ra-form" onSubmit={(e) => { e.preventDefault(); start(); }}>
            <div>
              <span className="ra-mono">NOUVELLE ÉPREUVE</span>
              <h3>Générer une épreuve</h3>
            </div>
            <div>
              <span className="ra-field-label">1 · Matière</span>
              <div className="ra-subjects">
                {subjects.map((s) => (
                  <button key={s.id} type="button" aria-pressed={subjectId === s.id} className={`ra-subject${subjectId === s.id ? " is-on" : ""}`} onClick={() => chooseSubject(s.id)}>
                    <i aria-hidden="true">{s.symbol}</i><strong>{s.subject}</strong><small>{SHORT[s.id]}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="ra-row2">
              <div>
                <label className="ra-field-label" htmlFor="ra-classe">2 · Classe</label>
                <div className="ra-select">
                  <select id="ra-classe" value={classe} onChange={(e) => chooseClasse(e.target.value)}>
                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
              </div>
              <div>
                <span className="ra-field-label">Durée officielle</span>
                <div className="ra-duree">{duree} · fixée pour la {classe}</div>
              </div>
            </div>
            <div>
              <span className="ra-field-label">3 · Notions <em>— {need.min === need.max ? `${need.min} activités obligatoires` : `${need.min} ou ${need.max} activités`}</em></span>
              {activities.length === 0
                ? <p className="ra-live-empty">Le programme de cette classe n’est pas encore intégré pour cette matière.</p>
                : <div className="ra-chips">
                    {activities.map((a) => {
                      const on = picks.includes(a);
                      return (
                        <button key={a} type="button" aria-pressed={on} disabled={!on && picks.length >= need.max} className={`ra-chip${on ? " is-on" : ""}`} onClick={() => toggle(a)}>
                          <span className="box" aria-hidden="true">{on && <Check />}</span>{a}
                        </button>
                      );
                    })}
                  </div>}
            </div>
            <div className="ra-form-foot">
              <span>{status}</span>
              {ready && !sample
                ? <Link href="/auth/register" className="ra-btn ra-btn-primary">Créer un compte pour générer <ArrowRight /></Link>
                : <button type="submit" className="ra-btn ra-btn-primary" disabled={!ready || running}><Sparkles /> {running ? "Génération…" : "Générer l’épreuve"}</button>}
            </div>
          </form>

          <aside className="ra-live" aria-live="polite">
            <span className="ra-mono">GÉNÉRATION EN DIRECT</span>
            {step < 0
              ? <p className="ra-live-empty">{sample ? "Cliquez sur « Générer l’épreuve » : suivez la rédaction étape par étape." : "Choisissez la matière, la classe et les notions : la rédaction se fait ensuite dans votre espace."}</p>
              : <ul className="ra-steps">
                  {SAMPLE_STEPS.map((label, i) => (
                    <li key={label} className={i < step ? "is-done" : i === step ? "is-active" : ""}>
                      <span className="dot" aria-hidden="true">{i < step && <Check />}</span>{label}{i === step && "…"}
                    </li>
                  ))}
                </ul>}
            {done && (
              <div className="ra-live-done">
                <p>Épreuve rédigée par le modèle Mathiis.</p>
                <button type="button" className="ra-btn ra-btn-primary ra-btn-sm" onClick={reveal}><Eye /> Voir l’épreuve</button>
              </div>
            )}
            <div className="ra-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
          </aside>
        </div>
      </div>

      {showExam && sample && (
        <div className="ra-result" ref={result}>
          <div className="ra-result-head">
            <h3>Épreuve de mathématiques</h3>
            <span className="ra-mono">CLASSE : TLE D · DURÉE : {duree}</span>
          </div>
          {sample.map((s) => (
            <section key={s.id}>
              <h4>{s.title}</h4>
              {s.lines.map((line, i) => line.startsWith("[FIGURE:")
                ? <Figure3D key={i} spec={line} />
                : <p key={i} className={/^\d+[.)]/.test(line) ? "q" : ""}><MathText text={line} /></p>)}
            </section>
          ))}
          <p className="ra-result-note">Exemple réel généré par le modèle Mathiis (Tle D, SA1 « Configurations de l’espace »).</p>
          <div className="ra-hero-actions">
            <Link href="/auth/register" className="ra-btn ra-btn-primary">Générer la vôtre <ArrowRight /></Link>
          </div>
        </div>
      )}
    </>
  );
}
