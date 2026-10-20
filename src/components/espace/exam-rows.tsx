"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { Exam } from "@/store/exams";
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
          <span role="cell" className="esp-row-actions">{actions?.(exam)}</span>
        </div>
      ))}
    </div>
  );
}
