"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Download, FileText, FileType2, Loader2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHead } from "@/components/espace/parts";
import { ExamStatus } from "@/components/espace/exam-rows";
import { ZoomableDocument } from "@/components/espace/zoomable-document";
import { ExamMarkdown } from "@/components/exam/ExamMarkdown";
import { useExamStore, type Exam } from "@/store/exams";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";

const schoolYear = (iso: string) => { const d = new Date(iso); const y = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1; return `${y}-${y + 1}`; };
const duree = (min: number) => `${Math.floor(min / 60)}H${String(min % 60).padStart(2, "0")}`;

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, refreshExam, downloadPdf, downloadDocx } = useExamStore();
  const { user } = useAuthStore();
  const isAdmin = user?.is_admin || user?.is_superuser;
  const [exam, setExam] = useState<Exam | null>(() => exams.find((e) => e.id === id) ?? null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (exam?.id === id) return;
    refreshExam(id).then(setExam).catch(() => router.push("/dashboard/exams"));
  }, [id, exam?.id, refreshExam, router]);

  // While the exam is being written, poll until it is done.
  useEffect(() => {
    if (!exam || (exam.status !== "generating" && exam.status !== "pending")) return;
    const timer = setInterval(async () => {
      const updated = await refreshExam(id);
      setExam(updated);
      if (updated.status === "completed" || updated.status === "failed") clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [exam, id, refreshExam]);

  const handleDownload = async (type: "pdf" | "docx", withAnswers = false) => {
    if (!exam) return;
    setDownloading(`${type}-${withAnswers}`);
    const toastId = withAnswers ? toast.loading("Génération du corrigé en cours… (1 à 2 min)", { duration: 180000 }) : undefined;
    try {
      if (type === "pdf") await downloadPdf(exam.id, withAnswers);
      else await downloadDocx(exam.id, withAnswers);
    } catch {
      toast.error("Erreur lors du téléchargement. Réessayez dans quelques instants.");
    } finally {
      if (toastId) toast.dismiss(toastId);
      setDownloading(null);
    }
  };

  if (!exam) return <div className="esp-page"><div className="esp-panel esp-loading" aria-busy="true"><LoaderCircle className="animate-spin" /> Chargement de l’épreuve…</div></div>;

  const markdown = (exam.content as Record<string, unknown> | null)?.markdown as string | undefined;
  const meta = [exam.level && `Classe : ${exam.level}`, exam.duration_minutes && `Durée : ${duree(exam.duration_minutes)}`, exam.num_questions && `${exam.num_questions} questions`].filter(Boolean).join(" · ");
  const btn = (type: "pdf" | "docx", withAnswers: boolean, label: string, primary = false) => (
    <Button key={label} variant={primary ? "default" : "framed"} size={primary ? "default" : "sm"} className={primary ? "esp-primary" : undefined} disabled={!!downloading} onClick={() => void handleDownload(type, withAnswers)}>
      {downloading === `${type}-${withAnswers}` ? <Loader2 className="animate-spin" /> : type === "pdf" ? <Download /> : <FileType2 />}{label}
    </Button>
  );

  return (
    <div className="esp-page">
      <Button variant="framed" size="sm" asChild className="esp-back"><Link href="/dashboard/exams"><ArrowLeft /> Mes épreuves</Link></Button>
      <PageHead eyebrow={[exam.subject, exam.level].filter(Boolean).join(" · ")} title={exam.title}
        subtitle={`Créée le ${formatDate(exam.created_at)}${exam.generation_time ? ` · générée en ${exam.generation_time.toFixed(0)} s` : ""}`}
        actions={exam.status === "completed" ? <>
          {btn("pdf", false, "Télécharger le PDF", true)}
          {btn("pdf", true, "PDF avec corrigé")}
          {btn("docx", false, "Word")}
          {btn("docx", true, "Word avec corrigé")}
        </> : <ExamStatus status={exam.status} />} />

      {exam.topics?.length > 0 && <nav className="esp-chips" aria-label="Notions">{exam.topics.map((t) => <span key={t}>{t}</span>)}</nav>}

      {exam.status === "pending" || exam.status === "generating" ? (
        <div className="esp-panel"><EmptyState icon={<LoaderCircle className="animate-spin" />} title="Génération en cours…" text="Le modèle Mathiis rédige votre épreuve. Cette page se met à jour toute seule." /></div>
      ) : exam.status === "failed" ? (
        <p className="esp-error" role="alert"><strong>Échec de la génération.</strong> {exam.error_message}</p>
      ) : !isAdmin ? (
        // Demande explicite utilisateur (UX) : plus d'aperçu du contenu sur
        // cette page une fois la génération terminée, pour les comptes non-
        // admin -- il faut télécharger le PDF/Word pour consulter l'épreuve.
        // L'aperçu en direct PENDANT la génération (page /dashboard/generate)
        // reste inchangé, et les admins gardent l'aperçu ici aussi.
        <div className="esp-panel"><EmptyState icon={<FileText />} title="Épreuve générée" text="Téléchargez le PDF ou le Word pour consulter le contenu." /></div>
      ) : markdown?.trim() ? (
        <ZoomableDocument>
          <article className="esp-sheet">
            <div className="esp-sheet-head"><span>Mathiis · Épreuve</span><span>Année scolaire {schoolYear(exam.created_at)}</span></div>
            <h2>{exam.subject}</h2>
            {meta && <p className="esp-sheet-meta">{meta}</p>}
            <div className="esp-sheet-body"><ExamMarkdown text={markdown} /></div>
          </article>
        </ZoomableDocument>
      ) : (
        <div className="esp-panel"><EmptyState icon={<FileText />} title="Épreuve générée" text="Son contenu n’est pas affichable ici : téléchargez le PDF pour la consulter." /></div>
      )}
    </div>
  );
}
