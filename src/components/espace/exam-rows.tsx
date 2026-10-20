"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChevronDown, Download, FileText, FileType2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useExamStore, type Exam } from "@/store/exams";
import { formatDate, STATUS_LABELS } from "@/lib/utils";

const STATUS_CLASS: Record<Exam["status"], string> = { completed: "complete", generating: "running", pending: "draft", failed: "failed" };

export function ExamStatus({ status }: { status: Exam["status"] }) {
  return <span className={`esp-status ${STATUS_CLASS[status] ?? "draft"}`}>{STATUS_LABELS[status] ?? status}</span>;
}

/** The workspace's exam table (title, class, date, status, actions), fed by the API. */
export function ExamTable({ exams, actions }: { exams: Exam[]; actions?: (exam: Exam) => ReactNode }) {
  return (
    <div className="esp-panel esp-list" role="table" aria-label="Épreuves">
      <div className="esp-row esp-row-head" role="row">
        <span role="columnheader">Épreuve</span><span role="columnheader">Classe</span><span role="columnheader">Date</span><span role="columnheader">Statut</span>
        <span role="columnheader" className="sr-only">Actions</span>
      </div>
      {exams.map((exam) => (
        <div className="esp-row" role="row" key={exam.id}>
          <span role="cell" className="esp-row-title">
            <FileText />
            <span>
              <Link href={`/dashboard/exams/${exam.id}`} className="esp-row-link"><strong>{exam.title}</strong></Link>
              <small>{exam.subject}{exam.num_questions ? ` · ${exam.num_questions} questions` : ""}</small>
            </span>
          </span>
          <span role="cell">{exam.level ?? "—"}</span>
          <span role="cell">{formatDate(exam.created_at)}</span>
          <span role="cell"><ExamStatus status={exam.status} /></span>
          <span role="cell" className="esp-row-actions"><ExamDownload exam={exam} />{actions?.(exam)}</span>
        </div>
      ))}
    </div>
  );
}

/** "Télécharger" menu of a finished exam: PDF, PDF with answers, and Word for the engines that produce it. */
export function ExamDownload({ exam }: { exam: Exam }) {
  const { downloadPdf, downloadDocx } = useExamStore();
  const [busy, setBusy] = useState(false);
  if (exam.status !== "completed") return null;

  const download = async (format: "pdf" | "docx", withAnswers: boolean) => {
    setBusy(true);
    const toastId = withAnswers ? toast.loading("Génération du corrigé en cours… (1 à 2 min)", { duration: 180000 }) : undefined;
    try {
      await (format === "pdf" ? downloadPdf : downloadDocx)(exam.id, withAnswers);
    } catch {
      toast.error(format === "pdf" ? "Erreur lors du téléchargement" : "Erreur lors du téléchargement Word");
    } finally {
      if (toastId) toast.dismiss(toastId);
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="framed" size="sm" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Download />} Télécharger <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="esp-menu">
        <DropdownMenuItem onSelect={() => void download("pdf", false)}><Download />PDF</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void download("pdf", true)}><Download />PDF avec corrigé</DropdownMenuItem>
        {(exam.engine === "standard" || exam.engine === "premium") && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void download("docx", false)}><FileType2 />Word</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void download("docx", true)}><FileType2 />Word avec corrigé</DropdownMenuItem>
        </>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
