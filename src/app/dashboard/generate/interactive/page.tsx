"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  CheckCircle2, Loader2, RefreshCw, ChevronRight, Crown,
  ArrowLeft, Save, BookOpen, AlertTriangle,
} from "lucide-react";
import { streamPremiumStep, streamPremiumCorrige, finalizePremiumExam } from "@/lib/stream";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "contexte",   label: "Contexte" },
  { id: "tache",      label: "Tâche" },
  { id: "exercice_1", label: "Problème I" },
  { id: "exercice_2", label: "Problème II" },
  { id: "exercice_3", label: "Problème III" },
];

function assembleMarkdown(classe: string, parts: Record<string, string>): string {
  const college = ["6e", "5e", "4e", "3e"].includes(classe);
  const lines = [
    `## ÉPREUVE DE MATHÉMATIQUES - ${classe}`,
    "*Année scolaire 2025-2026 · Durée : 3 h*",
    "", "---", "",
  ];
  for (const s of STEPS) {
    const txt = parts[s.id];
    if (!txt) continue;
    const head = s.id === "contexte" ? "CONTEXTE"
      : s.id === "tache" ? "TÂCHE"
      : s.label.toUpperCase();
    lines.push(`### ${head}`, "", txt.trim(), "");
  }
  lines.push("---", `*${college ? "Bon courage !" : "Bonne composition !"}*`);
  return lines.join("\n");
}

// ── Composant StepRail ────────────────────────────────────────────────────────
function StepRail({
  idx, parts,
}: { idx: number; parts: Record<string, string> }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const done = i < idx && parts[s.id];
        const active = i === idx;
        return (
          <li key={s.id} className="flex items-center gap-1 flex-shrink-0">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              done && "bg-emerald-100 text-emerald-700",
              active && "bg-amber-100 text-amber-700 ring-2 ring-amber-300",
              !done && !active && "bg-slate-100 text-slate-400",
            )}>
              {done
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : active
                  ? <Crown className="w-3.5 h-3.5" />
                  : <span className="w-3.5 h-3.5 flex items-center justify-center text-xs">{i + 1}</span>
              }
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Rendu Markdown simple ─────────────────────────────────────────────────────
function MarkdownPreview({ content }: { content: string }) {
  if (!content) return <p className="text-slate-400 text-sm italic">Rien encore validé.</p>;
  return (
    <div className="prose prose-sm max-w-none text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-mono">
      {content}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
function InteractivePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classe = searchParams.get("classe") || "Tle D";
  const title = searchParams.get("title") || "Épreuve Premium";
  const notions: string[] = JSON.parse(searchParams.get("notions") || "[]");
  const durationMinutes = searchParams.get("duration") ? Number(searchParams.get("duration")) : null;

  const [phase, setPhase] = useState<"stepping" | "done">("stepping");
  const [idx, setIdx] = useState(0);
  const [parts, setParts] = useState<Record<string, string>>({});
  const [currentText, setCurrentText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [corrige, setCorrige] = useState("");
  const [corrigeBusy, setCorrigeBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const runStep = useCallback(async (
    stepId: string,
    partsObj: Record<string, string>,
    instr: string,
  ) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setBusy(true);
    setCurrentText("");

    try {
      await streamPremiumStep(
        { classe, notions, step: stepId, parts: partsObj, instruction: instr },
        setCurrentText,
        abortRef.current.signal,
      );
    } catch (err: unknown) {
      const e = err as { status?: number; name?: string; message?: string };
      if (e.name === "AbortError") return;
      if (e.status === 429) {
        toast.error("Quota Premium épuisé. Finalisez ou passez en mode Standard.");
      } else {
        toast.error(e.message || "Erreur de génération");
      }
    } finally {
      setBusy(false);
    }
  }, [classe, notions]);

  // Lance la première étape au montage
  useEffect(() => {
    runStep("contexte", {}, "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function validateNext() {
    const stepId = STEPS[idx].id;
    const newParts = { ...parts, [stepId]: currentText.trim() };
    setParts(newParts);
    setInstruction("");
    const next = idx + 1;
    if (next >= STEPS.length) {
      setPhase("done");
    } else {
      setIdx(next);
      runStep(STEPS[next].id, newParts, "");
    }
  }

  function regenerate() {
    runStep(STEPS[idx].id, parts, instruction);
  }

  async function makeCorrige() {
    setCorrigeBusy(true);
    setCorrige("");
    try {
      await streamPremiumCorrige({ classe, parts }, setCorrige);
    } catch (e) {
      setCorrige(`[Erreur : ${(e as Error).message}]`);
    } finally {
      setCorrigeBusy(false);
    }
  }

  async function saveExam() {
    setSaving(true);
    try {
      const markdown = assembleMarkdown(classe, parts);
      const { id } = await finalizePremiumExam({
        title,
        classe,
        notions,
        markdown,
        duration_minutes: durationMinutes,
      });
      toast.success("Épreuve sauvegardée !");
      router.push(`/dashboard/exams/${id}`);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  const currentStep = STEPS[idx];
  const isExercise = currentStep?.id.startsWith("exercice_");

  // ── Phase STEPPING ────────────────────────────────────────────────────────
  if (phase === "stepping") {
    const validatedContent = STEPS.slice(0, idx)
      .filter(s => parts[s.id])
      .map(s => {
        const head = s.id === "contexte" ? "CONTEXTE"
          : s.id === "tache" ? "TÂCHE"
          : s.label.toUpperCase();
        return `### ${head}\n\n${parts[s.id]}`;
      })
      .join("\n\n---\n\n");

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/generate")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              <Crown className="w-3 h-3" />
              Premium · Interactif
            </span>
            <span className="text-sm text-slate-500 font-medium">{classe}</span>
          </div>
        </div>

        {/* Rail */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <StepRail idx={idx} parts={parts} />
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Déjà validé */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Déjà validé
            </p>
            <div className="overflow-y-auto max-h-[500px]">
              <MarkdownPreview content={validatedContent} />
            </div>
          </div>

          {/* Étape courante */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-amber-200 shadow-sm shadow-amber-50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                {busy
                  ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  : <Crown className="w-4 h-4 text-amber-500" />
                }
                {currentStep?.label}
                {isExercise && busy && (
                  <span className="text-xs font-normal text-slate-400">
                    · validation automatique en cours…
                  </span>
                )}
              </h3>
            </div>

            {/* Texte généré — éditable */}
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              disabled={busy}
              rows={14}
              className={cn(
                "w-full px-4 py-3 border rounded-xl text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all",
                busy
                  ? "border-amber-200 bg-amber-50/30 text-slate-600 cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-800"
              )}
              placeholder={busy
                ? (isExercise ? "Génération et vérification en cours…" : "Génération en cours…")
                : "Le contenu généré apparaîtra ici. Vous pouvez l'éditer librement."
              }
            />

            {/* Instruction de régénération */}
            <div className="flex gap-2">
              <input
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                disabled={busy}
                placeholder='Ex : "plus court", "changer les valeurs", "niveau plus facile"'
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && instruction.trim() && !busy) regenerate();
                }}
              />
              <button
                onClick={regenerate}
                disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Régénérer
              </button>
            </div>

            {/* Valider et continuer */}
            <button
              onClick={validateNext}
              disabled={busy || !currentText.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {idx + 1 >= STEPS.length ? "Valider et terminer" : "Valider et continuer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase DONE ────────────────────────────────────────────────────────────
  const finalMarkdown = assembleMarkdown(classe, parts);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Épreuve terminée</h1>
          <p className="text-slate-500 mt-1 text-sm">{title} · {classe}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/generate")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Nouvelle épreuve
          </button>
          <button
            onClick={saveExam}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Sauvegarde…" : "Sauvegarder l'épreuve"}
          </button>
        </div>
      </div>

      {/* Épreuve finale */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Épreuve complète
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            <Crown className="w-3 h-3" />Premium
          </span>
        </div>
        <div className="overflow-y-auto max-h-[500px]">
          <MarkdownPreview content={finalMarkdown} />
        </div>
      </div>

      {/* Corrigé */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Corrigé</h2>
          {corrige && !corrigeBusy && (
            <span className="text-xs text-emerald-600 font-medium">Généré</span>
          )}
        </div>
        {!corrige && !corrigeBusy ? (
          <button
            onClick={makeCorrige}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Générer le corrigé
          </button>
        ) : (
          <div className="overflow-y-auto max-h-[500px]">
            <MarkdownPreview
              content={corrigeBusy && !corrige
                ? "Génération du corrigé en cours…"
                : corrige}
            />
          </div>
        )}
      </div>

      {!parts && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Pensez à sauvegarder l&apos;épreuve avant de quitter cette page.
          </p>
        </div>
      )}
    </div>
  );
}

// Import Sparkles manquant dans phase done
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
      <path d="M19 3l.8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8z"/>
      <path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8z"/>
    </svg>
  );
}

export default function InteractivePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <InteractivePageInner />
    </Suspense>
  );
}
