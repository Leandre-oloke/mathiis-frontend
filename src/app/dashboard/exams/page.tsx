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

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: "bg-slate-100 text-slate-600", icon: Clock, label: "En attente" },
  generating: { color: "bg-amber-100 text-amber-700", icon: Loader2, label: "Génération..." },
  completed: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Terminé" },
  failed: { color: "bg-red-100 text-red-600", icon: AlertCircle, label: "Échoué" },
};

export default function ExamsPage() {
  const { exams, total, page, pages, fetchExams, deleteExam, downloadPdf, downloadDocx, refreshExam, loading } =
    useExamStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadingDocx, setDownloadingDocx] = useState<string | null>(null);

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
    <div className="space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-indigo-500">Mes épreuves</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#071a3d] sm:text-4xl">Mes épreuves</h1>
          <p className="mt-1 text-lg text-slate-500">{total} épreuve{total > 1 ? "s" : ""} au total</p>
        </div>
        <Link
          href="/dashboard/generate"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Nouvelle épreuve
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une épreuve..."
            className="h-14 w-full rounded-2xl border border-white bg-white pl-11 pr-4 text-sm shadow-lg shadow-slate-200/40 outline-none transition focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-14 min-w-56 rounded-2xl border border-white bg-white px-5 text-sm text-slate-600 shadow-lg shadow-slate-200/40 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          <option value="completed">Terminé</option>
          <option value="generating">En génération</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoué</option>
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-3xl border border-white bg-white py-20 text-center shadow-xl shadow-slate-200/40">
          <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Aucune épreuve trouvée</p>
          <p className="text-slate-400 text-sm mt-1">Essayez de modifier votre recherche ou créez une nouvelle épreuve</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const status = statusConfig[exam.status];
            const StatusIcon = status.icon;
            return (
              <div
                key={exam.id}
                className="rounded-3xl border border-white bg-white p-6 shadow-lg shadow-slate-200/40 transition-all hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-[#071a3d]">{exam.title}</h3>
                          {exam.engine === "premium" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              <Zap className="w-3 h-3" />Premium
                            </span>
                          ) : exam.engine === "standard" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                              <Layers className="w-3 h-3" />Standard
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                              <Zap className="w-3 h-3" />Basique
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-sm text-slate-500">{exam.subject}</span>
                          {exam.level && <span className="text-sm text-slate-400">· {exam.level}</span>}
                          {exam.duration_minutes && (
                            <span className="text-sm text-slate-400">· {exam.duration_minutes} min</span>
                          )}
                          <span className="text-xs text-slate-300">· {formatDate(exam.created_at)}</span>
                        </div>
                      </div>
                      <span className={cn("flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full flex-shrink-0", status.color)}>
                        <StatusIcon className={cn("w-3 h-3", exam.status === "generating" && "animate-spin")} />
                        {status.label}
                      </span>
                    </div>

                    {exam.generation_time && (
                      <p className="text-xs text-slate-400 mt-1">
                        Généré en {exam.generation_time.toFixed(1)}s
                      </p>
                    )}

                    {exam.status === "completed" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {/* PDF épreuve */}
                        <button
                          onClick={() => handleDownload(exam.id, false)}
                          disabled={downloading === exam.id}
                            className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-60"
                        >
                          {downloading === exam.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                          PDF
                        </button>
                        {/* PDF corrigé */}
                        <button
                          onClick={() => handleDownload(exam.id, true)}
                          disabled={downloading === exam.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors disabled:opacity-60"
                        >
                          <Download className="w-3 h-3" />
                          PDF corrigé
                        </button>
                        {/* Word épreuve — Standard et Premium */}
                        {(exam.engine === "standard" || exam.engine === "premium") && (
                          <>
                            <button
                              onClick={() => handleDownloadDocx(exam.id, false)}
                              disabled={downloadingDocx === exam.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-60"
                            >
                              {downloadingDocx === exam.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileType2 className="w-3 h-3" />}
                              Word
                            </button>
                            <button
                              onClick={() => handleDownloadDocx(exam.id, true)}
                              disabled={downloadingDocx === exam.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors disabled:opacity-60"
                            >
                              <FileType2 className="w-3 h-3" />
                              Word corrigé
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    disabled={deleting === exam.id}
                    aria-label={`Supprimer ${exam.title}`}
                    className="flex-shrink-0 rounded-xl p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    {deleting === exam.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchExams({ page: p, search, status: statusFilter })}
              className={cn(
                "w-9 h-9 rounded-xl text-sm font-medium transition-colors",
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
