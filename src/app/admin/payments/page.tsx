"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  CreditCard, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight,
  TrendingUp, Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSubscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan: string;
  amount: number;
  exams_added: number;
  corrections_added: number;
  status: string;
  fedapay_transaction_id: string | null;
  created_at: string;
  completed_at: string | null;
}

interface SubList {
  items: AdminSubscription[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  completed: { label: "Payé",      color: "text-emerald-700 bg-emerald-100", Icon: CheckCircle },
  pending:   { label: "En attente", color: "text-amber-700 bg-amber-100",    Icon: Clock },
  failed:    { label: "Échoué",    color: "text-red-700 bg-red-100",         Icon: AlertCircle },
  declined:  { label: "Refusé",    color: "text-red-700 bg-red-100",         Icon: AlertCircle },
  cancelled: { label: "Annulé",    color: "text-slate-600 bg-slate-100",     Icon: AlertCircle },
};

const PLAN_COLOR: Record<string, string> = {
  starter:  "bg-indigo-100 text-indigo-700",
  standard: "bg-violet-100 text-violet-700",
  premium:  "bg-amber-100 text-amber-700",
};

export default function AdminPaymentsPage() {
  const [data, setData] = useState<SubList | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, per_page: 20 };
      if (s) params.status_filter = s;
      const { data: res } = await api.get<SubList>("/admin/subscriptions", { params });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(page, statusFilter); }, [page, statusFilter, fetchData]);

  const handleFilter = (s: string) => {
    setStatusFilter(s);
    setPage(1);
  };

  const totalRevenue = data
    ? data.items.filter(i => i.status === "completed").reduce((sum, i) => sum + i.amount, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Paiements & Souscriptions</h1>
        <p className="text-slate-400 mt-1">Historique de tous les paiements MTN MoMo via FedaPay</p>
      </div>

      {/* KPI rapides */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-slate-400 text-sm">Revenus (page)</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()} FCFA</div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-slate-400 text-sm">Total paiements</span>
            </div>
            <div className="text-2xl font-bold text-white">{data.total}</div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-slate-400 text-sm">Complétés</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {data.items.filter(i => i.status === "completed").length}
              <span className="text-sm text-slate-400 font-normal"> / {data.items.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtres statut */}
      <div className="flex gap-2 flex-wrap">
        {["", "completed", "pending", "failed", "declined"].map((s) => (
          <button
            key={s}
            onClick={() => handleFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              statusFilter === s
                ? "bg-indigo-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            )}
          >
            {s === "" ? "Tous" : (STATUS_CONFIG[s]?.label ?? s)}
          </button>
        ))}
      </div>

      {/* Chargement / vide (partagé cartes + tableau) */}
      {loading ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center text-slate-500">Chargement…</div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center text-slate-500">Aucun paiement trouvé</div>
      ) : (
        <>
          {/* Cartes (mobile / tablette) */}
          <div className="lg:hidden space-y-3">
            {data.items.map((sub) => {
              const st = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG["pending"];
              return (
                <div key={sub.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{sub.user_name}</div>
                      <div className="text-xs text-slate-400 truncate">{sub.user_email}</div>
                    </div>
                    <span className={cn("flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium", st.color)}>
                      <st.Icon className="w-3.5 h-3.5" />
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold capitalize", PLAN_COLOR[sub.plan] ?? "bg-slate-700 text-slate-300")}>
                      {sub.plan}
                    </span>
                    <span className="text-white font-medium text-sm">{sub.amount.toLocaleString()} F</span>
                    <span className="text-slate-400 text-xs">
                      +{sub.exams_added} épreuve{sub.exams_added > 1 ? "s" : ""} · +{sub.corrections_added} corrigé{sub.corrections_added > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                    <span>
                      {new Date(sub.created_at).toLocaleDateString("fr-FR")}{" "}
                      {new Date(sub.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-mono truncate ml-2">{sub.fedapay_transaction_id ?? "-"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tableau (desktop) */}
          <div className="hidden lg:block bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-slate-400 font-semibold">Utilisateur</th>
                <th className="text-left px-4 py-3 text-slate-400 font-semibold">Plan</th>
                <th className="text-left px-4 py-3 text-slate-400 font-semibold">Montant</th>
                <th className="text-left px-4 py-3 text-slate-400 font-semibold">Crédits ajoutés</th>
                <th className="text-left px-4 py-3 text-slate-400 font-semibold">Statut</th>
                <th className="text-left px-4 py-3 text-slate-400 font-semibold">Date</th>
                <th className="text-left px-4 py-3 text-slate-400 font-semibold">Réf. FedaPay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.items.map((sub) => {
                const st = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG["pending"];
                return (
                  <tr key={sub.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{sub.user_name}</div>
                      <div className="text-xs text-slate-400">{sub.user_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold capitalize", PLAN_COLOR[sub.plan] ?? "bg-slate-700 text-slate-300")}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {sub.amount.toLocaleString()} F
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      +{sub.exams_added} épreuve{sub.exams_added > 1 ? "s" : ""}<br />
                      +{sub.corrections_added} corrigé{sub.corrections_added > 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium", st.color)}>
                        <st.Icon className="w-3.5 h-3.5" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(sub.created_at).toLocaleDateString("fr-FR")}<br />
                      {new Date(sub.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {sub.fedapay_transaction_id ?? "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            {data.total} paiement{data.total > 1 ? "s" : ""} · Page {data.page}/{data.pages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
