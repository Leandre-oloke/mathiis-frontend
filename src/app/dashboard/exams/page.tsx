"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useExamStore } from "@/store/exams";
import { formatDate } from "@/lib/utils";
import {
  FileText, Download, Trash2, Search, Plus,
  Clock, CheckCircle, AlertCircle, Loader2, Sparkles, Zap, FileType2, Layers
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { PageHeader, StatusBadge } from "@/components/ui/kit";

const statusConfig: Record<string, { icon: React.ElementType; label: string }> = {
  pending: { icon: Clock, label: "En attente" },
  generating: { icon: Loader2, label: "Génération…" },
  completed: { icon: CheckCircle, label: "Terminé" },
  failed: { icon: AlertCircle, label: "Échoué" },
};

const ENGINE_BADGE: Record<string, { icon: React.ElementType; label: string }> = {
  premium: { icon: Zap, label: "Premium" },
  standard: { icon: Layers, label: "Standard" },
  free: { icon: Zap, label: "Basique" },
};

const FILTERS = [
  { value: "", label: "Toutes" },
  { value: "completed", label: "Terminées" },
  { value: "generating", label: "En génération" },
  { value: "pending", label: "En attente" },
  { value: "failed", label: "Échouées" },
];

export default function ExamsPage() {
  const { exams, total, page, pages, fetchExams, deleteExam, downloadPdf, downloadDocx, refreshExam, loading } =
    useExamStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadingDocx, setDownloadingDocx] = useState<string | null>(null);
  // Deleting is final: the first click asks for confirmation, the second one deletes.
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchExams({ page: 1, search, status: statusFilter });
  }, [fetchExams, search, statusFilter]);

  // Auto-refresh des exams en cours de génération (max 30 min — DeepSeek peut prendre 10-15 min)
  useEffect(() => {
    const MAX_AGE_MS = 30 * 60 * 1000;
    const now = Date.now();
    const generating = exams.filter((e) => {
      if (e.status !== "generating" && e.status !== "pending") return false;
      return now - new Date(e.created_at).getTime() < MAX_AGE_MS;
    });
    if (generating.length === 0) return;
    const timer = setInterval(() => {
      generating.forEach((e) => refreshExam(e.id));
    }, 3000);
    return () => clearInterval(timer);
  }, [exams, refreshExam]);

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    setConfirmDelete(null);
    setDeleting(id);
    try {
      await deleteExam(id);
      toast.success("Épreuve supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (id: string, withAnswers: boolean) => {
    setDownloading(id);
    try {
      await downloadPdf(id, withAnswers);
    } catch {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadDocx = async (id: string, withAnswers: boolean) => {
    setDownloadingDocx(id);
    try {
      await downloadDocx(id, withAnswers);
    } catch {
      toast.error("Erreur lors du téléchargement Word");
    } finally {
      setDownloadingDocx(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bibliothèque"
        title="Mes épreuves"
        subtitle={`${total} épreuve${total > 1 ? "s" : ""} au total`}
        actions={<Link href="/dashboard/generate" className="btn-ink"><Plus className="h-4 w-4" />Nouvelle épreuve</Link>}
      />

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex h-11 min-w-56 flex-1 items-center rounded-xl border-[1.5px] border-foreground bg-card focus-within:shadow-[var(--shadow-ink)]">
          <Search className="absolute left-3.5 h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une épreuve…"
            aria-label="Rechercher une épreuve"
            className="h-full w-full bg-transparent pl-10 pr-4 text-sm outline-none"
          />
        </label>
        <div role="radiogroup" aria-label="Statut" className="flex flex-wrap gap-1 rounded-full border-[1.5px] border-foreground bg-card p-1">
          {FILTERS.map((f) => (
            <button key={f.value} role="radio" aria-checked={statusFilter === f.value} onClick={() => setStatusFilter(f.value)}
              className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors", statusFilter === f.value ? "bg-foreground text-background" : "hover:bg-foreground/5")}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : exams.length === 0 ? (
        <div className="card-ink px-5 py-16 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border-[1.5px] border-dashed border-foreground"><Sparkles className="h-6 w-6" /></span>
          <p className="font-semibold">Aucune épreuve trouvée</p>
          <p className="mt-1 text-sm text-muted">{search || statusFilter ? "Essayez un autre mot ou un autre statut." : "Créez votre première épreuve : elle sera rangée ici automatiquement."}</p>
          {!search && !statusFilter && <Link href="/dashboard/generate" className="btn-ink mt-5"><Plus className="h-4 w-4" />Générer une épreuve</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const status = statusConfig[exam.status];
            const StatusIcon = status.icon;
            const engine = ENGINE_BADGE[exam.engine] ?? ENGINE_BADGE.free;
            return (
              <article key={exam.id} className="card-ink p-5 transition-shadow hover:shadow-[0_4px_0_var(--foreground)]">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[1.5px] border-foreground"><FileText className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/dashboard/exams/${exam.id}`} className="font-display text-lg font-bold underline-offset-4 hover:underline">{exam.title}</Link>
                          <span className="inline-flex items-center gap-1 rounded-full border border-foreground/25 px-2 py-0.5 text-[11px] font-semibold"><engine.icon className="h-3 w-3" />{engine.label}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                          {exam.subject}{exam.level && ` · ${exam.level}`}{exam.duration_minutes ? ` · ${exam.duration_minutes} min` : ""} · {formatDate(exam.created_at)}
                          {exam.generation_time ? ` · généré en ${exam.generation_time.toFixed(1)} s` : ""}
                        </p>
                      </div>
                      <StatusBadge status={exam.status}>
                        <span className="inline-flex items-center gap-1.5"><StatusIcon className={cn("h-3 w-3", exam.status === "generating" && "animate-spin")} />{status.label}</span>
                      </StatusBadge>
                    </div>

                    {exam.status === "completed" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => handleDownload(exam.id, false)} disabled={downloading === exam.id} className="btn-framed btn-sm">
                          {downloading === exam.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}PDF
                        </button>
                        <button onClick={() => handleDownload(exam.id, true)} disabled={downloading === exam.id} className="btn-framed btn-sm">
                          <Download className="h-3 w-3" />PDF corrigé
                        </button>
                        {(exam.engine === "standard" || exam.engine === "premium") && (
                          <>
                            <button onClick={() => handleDownloadDocx(exam.id, false)} disabled={downloadingDocx === exam.id} className="btn-framed btn-sm">
                              {downloadingDocx === exam.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileType2 className="h-3 w-3" />}Word
                            </button>
                            <button onClick={() => handleDownloadDocx(exam.id, true)} disabled={downloadingDocx === exam.id} className="btn-framed btn-sm">
                              <FileType2 className="h-3 w-3" />Word corrigé
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    onBlur={() => setConfirmDelete((c) => (c === exam.id ? null : c))}
                    disabled={deleting === exam.id}
                    aria-label={confirmDelete === exam.id ? `Confirmer la suppression de ${exam.title}` : `Supprimer ${exam.title}`}
                    className={cn("shrink-0 rounded-lg p-2 text-xs font-semibold transition-colors",
                      confirmDelete === exam.id ? "bg-red-600 px-3 text-white" : "text-muted hover:bg-red-50 hover:text-red-600")}
                  >
                    {deleting === exam.id ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmDelete === exam.id ? "Supprimer ?" : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <nav aria-label="Pages" className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchExams({ page: p, search, status: statusFilter })}
              aria-current={p === page ? "page" : undefined}
              className={cn("h-9 w-9 rounded-xl border-[1.5px] border-foreground text-sm font-semibold transition-colors",
                p === page ? "bg-foreground text-background" : "bg-card hover:bg-foreground/5")}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
