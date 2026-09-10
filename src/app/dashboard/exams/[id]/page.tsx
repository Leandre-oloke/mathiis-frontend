"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExamStore, Exam } from "@/store/exams";
import {
  ArrowLeft, Download, Loader2, FileText, Clock,
  BookOpen, CheckCircle, AlertCircle, FileType2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Components } from "react-markdown";

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
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  const content = exam.content as Record<string, unknown> | null;
  const markdownText = content?.markdown as string | undefined;
  const hasContent = !!markdownText?.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Retour */}
      <Link
        href="/dashboard/exams"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux épreuves
      </Link>

      {/* En-tête */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge icon={FileText} label={exam.subject} />
              {exam.level && <Badge icon={BookOpen} label={exam.level} />}
              {exam.duration_minutes && (
                <Badge icon={Clock} label={`${exam.duration_minutes} min`} />
              )}
              {exam.generation_time && (
                <Badge
                  icon={CheckCircle}
                  label={`Généré en ${exam.generation_time.toFixed(1)}s`}
                  color="text-slate-600 bg-slate-100"
                />
              )}
            </div>
            {exam.topics?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {exam.topics.map((t) => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {exam.status === "completed" && (
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <DownloadBtn
                label="PDF"
                icon={Download}
                loading={downloading === "pdf-false"}
                onClick={() => handleDownload("pdf", false)}
                color="bg-indigo-600 hover:bg-indigo-700 text-white"
              />
              <DownloadBtn
                label="PDF corrigé"
                icon={Download}
                loading={downloading === "pdf-true"}
                onClick={() => handleDownload("pdf", true)}
                color="bg-emerald-600 hover:bg-emerald-700 text-white"
              />
              <DownloadBtn
                label="Word"
                icon={FileType2}
                loading={downloading === "docx-false"}
                onClick={() => handleDownload("docx", false)}
                color="bg-blue-600 hover:bg-blue-700 text-white"
              />
              <DownloadBtn
                label="Word corrigé"
                icon={FileType2}
                loading={downloading === "docx-true"}
                onClick={() => handleDownload("docx", true)}
                color="bg-teal-600 hover:bg-teal-700 text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      {(exam.status === "pending" || exam.status === "generating") ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="font-medium text-slate-700 text-lg">Génération en cours…</p>
          <p className="text-slate-400 text-sm mt-2">Le moteur IA prépare votre épreuve</p>
        </div>
      ) : exam.status === "failed" ? (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="font-medium text-red-700">Échec de la génération</p>
          {exam.error_message && (
            <p className="text-red-500 text-sm mt-1">{exam.error_message}</p>
          )}
        </div>
      ) : hasContent ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <ExamRenderer text={markdownText!} />
        </div>
      ) : exam.status === "completed" ? (
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Épreuve générée : téléchargez le PDF pour la consulter</p>
        </div>
      ) : null}
    </div>
  );
}

/* ── Renderer Markdown + LaTeX ─────────────────────────────────────── */

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3 pb-1 border-b border-slate-100">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-slate-800 mt-5 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-slate-700 mt-4 mb-1">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-slate-700 leading-7 mb-3">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-700">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 mb-3 pl-2 text-slate-700">{children}</ul>
  ),
  hr: () => <hr className="my-4 border-slate-200" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-200 pl-4 italic text-slate-600 my-3">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-slate-300 text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-indigo-50">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-slate-200">{children}</tr>,
  th: ({ children }) => (
    <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-800">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-300 px-3 py-2 text-slate-700">{children}</td>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    return isBlock ? (
      <code className="block bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono text-slate-800 overflow-x-auto my-3">
        {children}
      </code>
    ) : (
      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-700">
        {children}
      </code>
    );
  },
};

function ExamRenderer({ text }: { text: string }) {
  // Numéro écrit directement en texte (pas via le compteur <ol> du
  // navigateur) : reste correct même quand une question est interrompue par
  // du texte ou des sous-parties lettrées (a) b) c)) qui repartiraient
  // sinon le compteur natif à zéro. Incrémenté une fois par <li> réel,
  // continu sur tout le document (Problème I: 1-5, Problème II: 6-10, ...).
  const questionCounter = useRef(0);
  questionCounter.current = 0;

  const components: Components = {
    ...mdComponents,
    ol: ({ children }) => <div className="space-y-1 mb-3">{children}</div>,
    li: ({ children }) => {
      questionCounter.current += 1;
      return (
        <div className="leading-7 flex gap-1.5 text-slate-700">
          <span className="flex-shrink-0">{questionCounter.current}.</span>
          <span>{children}</span>
        </div>
      );
    },
  };

  return (
    <div className="exam-content">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

/* ── Composants utilitaires ────────────────────────────────────────── */

function Badge({
  icon: Icon,
  label,
  color = "text-slate-600 bg-slate-100",
}: {
  icon: React.ElementType;
  label: string;
  color?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", color)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function DownloadBtn({
  label,
  icon: Icon,
  loading,
  onClick,
  color,
}: {
  label: string;
  icon: React.ElementType;
  loading: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60",
        color,
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}
