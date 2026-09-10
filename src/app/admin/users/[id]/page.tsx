"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Loader2, FileText, FileUp, Coins, ChevronLeft, ChevronRight,
} from "lucide-react";

interface AdminExam {
  id: string;
  title: string;
  level: string | null;
  status: string;
  engine: string;
  generation_time: number | null;
  tokens_flash_in: number;
  tokens_flash_out: number;
  tokens_pro_in: number;
  tokens_pro_out: number;
  cost_usd: number;
  created_at: string;
}

interface ExamList {
  items: AdminExam[]; total: number; page: number; per_page: number; pages: number;
  total_cost_usd: number;
}

interface AdminDocument {
  id: string;
  original_filename: string;
  subject: string | null;
  tokens_flash_in: number;
  tokens_flash_out: number;
  tokens_pro_in: number;
  tokens_pro_out: number;
  cost_usd: number;
  created_at: string;
}

interface DocumentList {
  items: AdminDocument[]; total: number; page: number; per_page: number; pages: number;
  total_cost_usd: number;
}

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-600",
  failed: "bg-red-50 text-red-500",
  generating: "bg-amber-50 text-amber-600",
  pending: "bg-slate-100 text-slate-500",
};

type Tab = "exams" | "documents";

export default function AdminUserActivityPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [tab, setTab] = useState<Tab>("exams");
  const [examData, setExamData] = useState<ExamList | null>(null);
  const [docData, setDocData] = useState<DocumentList | null>(null);
  const [loading, setLoading] = useState(true);
  const [examPage, setExamPage] = useState(1);
  const [docPage, setDocPage] = useState(1);

  const fetchExams = useCallback(async (p: number) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}/exams`, { params: { page: p, per_page: 20 } });
      setExamData(data);
    } catch {
      toast.error("Erreur de chargement des épreuves");
    }
  }, [userId]);

  const fetchDocuments = useCallback(async (p: number) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}/documents`, { params: { page: p, per_page: 20 } });
      setDocData(data);
    } catch {
      toast.error("Erreur de chargement des documents");
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchExams(1), fetchDocuments(1)]).finally(() => setLoading(false));
  }, [userId, fetchExams, fetchDocuments]);

  const totalCost = (examData?.total_cost_usd ?? 0) + (docData?.total_cost_usd ?? 0);
  const activeData = tab === "exams" ? examData : docData;
  const activePage = tab === "exams" ? examPage : docPage;
  const setActivePage = tab === "exams" ? setExamPage : setDocPage;
  const refetchActive = tab === "exams" ? fetchExams : fetchDocuments;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/users")}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activité de l&apos;utilisateur</h1>
          <p className="text-slate-500 mt-1">
            {examData?.total ?? "-"} épreuve{(examData?.total ?? 0) > 1 ? "s" : ""} générée{(examData?.total ?? 0) > 1 ? "s" : ""}
            {" · "}
            {docData?.total ?? "-"} document{(docData?.total ?? 0) > 1 ? "s" : ""} importé{(docData?.total ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">${totalCost.toFixed(4)}</div>
            <div className="text-sm text-slate-500">Coût DeepSeek cumulé — épreuves + documents importés</div>
          </div>
        </div>
      )}

      <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setTab("exams")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
            tab === "exams" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Épreuves générées <span className="text-slate-400 font-normal ml-1">{examData?.total ?? 0}</span>
        </button>
        <button
          onClick={() => setTab("documents")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
            tab === "documents" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Documents importés <span className="text-slate-400 font-normal ml-1">{docData?.total ?? 0}</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
        </div>
      ) : !activeData?.items.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
          {tab === "exams" ? "Aucune épreuve générée par cet utilisateur" : "Aucun document importé par cet utilisateur"}
        </div>
      ) : tab === "exams" ? (
        <>
          {/* Cartes (mobile / tablette) */}
          <div className="lg:hidden space-y-3">
            {examData!.items.map((exam) => (
              <div key={exam.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-medium text-slate-900 text-sm truncate">{exam.title}</span>
                  </div>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0", STATUS_STYLE[exam.status] || "bg-slate-100 text-slate-500")}>
                    {exam.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-2">{exam.level || "—"} · {formatDate(exam.created_at)}</div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {exam.tokens_flash_in + exam.tokens_flash_out + exam.tokens_pro_in + exam.tokens_pro_out} tokens
                  </span>
                  <span className="font-semibold text-slate-700 text-sm">${exam.cost_usd.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tableau (desktop) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Épreuve</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Classe</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Statut</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Générée le</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Tokens (flash / pro)</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Coût</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examData!.items.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-900 text-sm">{exam.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{exam.level || "—"}</td>
                    <td className="px-4 py-4">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", STATUS_STYLE[exam.status] || "bg-slate-100 text-slate-500")}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{formatDate(exam.created_at)}</td>
                    <td className="px-4 py-4 text-right text-sm text-slate-500 [font-variant-numeric:tabular-nums]">
                      {(exam.tokens_flash_in + exam.tokens_flash_out).toLocaleString()} / {(exam.tokens_pro_in + exam.tokens_pro_out).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">${exam.cost_usd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Cartes (mobile / tablette) */}
          <div className="lg:hidden space-y-3">
            {docData!.items.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center gap-2 mb-2 min-w-0">
                  <FileUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="font-medium text-slate-900 text-sm truncate">{doc.original_filename}</span>
                </div>
                <div className="text-xs text-slate-400 mb-2">{doc.subject || "—"} · {formatDate(doc.created_at)}</div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {doc.tokens_flash_in + doc.tokens_flash_out + doc.tokens_pro_in + doc.tokens_pro_out} tokens
                  </span>
                  <span className="font-semibold text-slate-700 text-sm">${doc.cost_usd.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tableau (desktop) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Document importé</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Sujet</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Corrigé le</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Tokens (flash / pro)</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Coût</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docData!.items.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-900 text-sm">{doc.original_filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{doc.subject || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{formatDate(doc.created_at)}</td>
                    <td className="px-4 py-4 text-right text-sm text-slate-500 [font-variant-numeric:tabular-nums]">
                      {(doc.tokens_flash_in + doc.tokens_flash_out).toLocaleString()} / {(doc.tokens_pro_in + doc.tokens_pro_out).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">${doc.cost_usd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeData && activeData.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {activeData.page} sur {activeData.pages} · {activeData.total} résultats</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setActivePage(p => p - 1); refetchActive(activePage - 1); }}
              disabled={activePage === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActivePage(p => p + 1); refetchActive(activePage + 1); }}
              disabled={activePage === activeData.pages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
