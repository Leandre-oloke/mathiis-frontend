"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExamStore, Exam } from "@/store/exams";
import {
  ArrowLeft, Download, Loader2, FileText, Clock,
  BookOpen, CheckCircle, AlertCircle, FileType2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { ExamMarkdown } from "@/components/exam/ExamMarkdown";

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, refreshExam, downloadPdf, downloadDocx } = useExamStore();
  const [exam, setExam] = useState<Exam | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const found = exams.find((e) => e.id === id);
    if (found) setExam(found);
    else refreshExam(id).then(setExam).catch(() => router.push("/dashboard/exams"));
  }, [id, exams, refreshExam, router]);

  useEffect(() => {
    if (!exam || (exam.status !== "generating" && exam.status !== "pending")) return;
    const timer = setInterval(async () => {
      const updated = await refreshExam(id);
      setExam(updated);
      if (updated.status === "completed" || updated.status === "failed") clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [exam?.status, id, refreshExam]);

  const handleDownload = async (type: "pdf" | "docx", withAnswers = false) => {
    if (!exam) return;
    const key = `${type}-${withAnswers}`;
    setDownloading(key);
    let toastId: string | undefined;
    if (withAnswers) {
      toastId = toast.loading("Génération du corrigé en cours… (1 à 2 min)", { duration: 180000 });
    }
    try {
      if (type === "pdf") await downloadPdf(exam.id, withAnswers);
      else await downloadDocx(exam.id, withAnswers);
      if (toastId) toast.dismiss(toastId);
    } catch {
      if (toastId) toast.dismiss(toastId);
      toast.error("Erreur lors du téléchargement. Réessayez dans quelques instants.");
    } finally {
      setDownloading(null);
    }
  };

  if (!exam) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  const content = exam.content as Record<string, unknown> | null;
  const markdownText = content?.markdown as string | undefined;
  const hasContent = !!markdownText?.trim();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/dashboard/exams" className="btn-framed btn-sm">
        <ArrowLeft className="h-3.5 w-3.5" />Retour aux épreuves
      </Link>

      {/* En-tête */}
      <header className="card-ink p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Épreuve</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance">{exam.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge icon={FileText} label={exam.subject} />
              {exam.level && <Badge icon={BookOpen} label={exam.level} />}
              {exam.duration_minutes && <Badge icon={Clock} label={`${exam.duration_minutes} min`} />}
              {exam.generation_time && <Badge icon={CheckCircle} label={`Généré en ${exam.generation_time.toFixed(1)} s`} />}
            </div>
            {exam.topics?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {exam.topics.map((t) => (
                  <span key={t} className="rounded-full bg-foreground/[0.06] px-2.5 py-1 text-xs font-medium">{t}</span>
                ))}
              </div>
            )}
          </div>

          {exam.status === "completed" && (
            <div className="flex shrink-0 flex-wrap gap-2">
              <DownloadBtn primary label="PDF" icon={Download} loading={downloading === "pdf-false"} onClick={() => handleDownload("pdf", false)} />
              <DownloadBtn label="PDF corrigé" icon={Download} loading={downloading === "pdf-true"} onClick={() => handleDownload("pdf", true)} />
              <DownloadBtn label="Word" icon={FileType2} loading={downloading === "docx-false"} onClick={() => handleDownload("docx", false)} />
              <DownloadBtn label="Word corrigé" icon={FileType2} loading={downloading === "docx-true"} onClick={() => handleDownload("docx", true)} />
            </div>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      {(exam.status === "pending" || exam.status === "generating") ? (
        <div className="card-ink p-12 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="font-display text-lg font-semibold">Génération en cours…</p>
          <p className="mt-2 text-sm text-muted">Le moteur IA prépare votre épreuve.</p>
        </div>
      ) : exam.status === "failed" ? (
        <div className="rounded-2xl border-[1.5px] border-red-600 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-600" />
          <p className="font-semibold text-red-700">Échec de la génération</p>
          {exam.error_message && <p className="mt-1 text-sm text-red-600">{exam.error_message}</p>}
        </div>
      ) : hasContent ? (
        <article className="rounded-md border-[1.5px] border-foreground bg-card p-6 shadow-[6px_6px_0_var(--foreground)] sm:p-10">
          <ExamMarkdown text={markdownText!} />
        </article>
      ) : exam.status === "completed" ? (
        <div className="card-ink p-8 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10" />
          <p className="font-medium text-muted">Épreuve générée : téléchargez le PDF pour la consulter.</p>
        </div>
      ) : null}
    </div>
  );
}

/* ── Composants utilitaires ────────────────────────────────────────── */

function Badge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-foreground/25 px-2.5 py-1 text-xs font-medium">
      <Icon className="h-3.5 w-3.5" />{label}
    </span>
  );
}

function DownloadBtn({ label, icon: Icon, loading, onClick, primary = false }: {
  label: string;
  icon: React.ElementType;
  loading: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={loading} className={cn(primary ? "btn-ink h-10" : "btn-framed")}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}
