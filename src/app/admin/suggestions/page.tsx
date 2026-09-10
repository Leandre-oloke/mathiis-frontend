"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

interface AdminSuggestion {
  id: string;
  user_email: string;
  user_name: string;
  message: string;
  created_at: string;
}

interface SuggestionList {
  items: AdminSuggestion[]; total: number; page: number; per_page: number; pages: number;
}

export default function AdminSuggestionsPage() {
  const [data, setData] = useState<SuggestionList | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchSuggestions = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/admin/suggestions", { params: { page: p, per_page: 20 } });
      setData(res);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSuggestions(1); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Suggestions</h1>
        <p className="text-slate-500 mt-1">{data?.total ?? "-"} message{(data?.total ?? 0) > 1 ? "s" : ""} reçu{(data?.total ?? 0) > 1 ? "s" : ""} des utilisateurs</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          </div>
        ) : !data?.items.length ? (
          <div className="p-8 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Aucune suggestion reçue pour l&apos;instant
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.items.map((s) => (
              <div key={s.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-slate-900 text-sm">{s.user_name}</span>
                    <span className="text-xs text-slate-400 ml-2">{s.user_email}</span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(s.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{s.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {data.page} sur {data.pages} · {data.total} messages
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setPage(p => p - 1); fetchSuggestions(page - 1); }}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setPage(p => p + 1); fetchSuggestions(page + 1); }}
              disabled={page === data.pages}
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
