"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuotaStore } from "@/store/quota";
import { api } from "@/lib/api";
import {
  CheckCircle, AlertCircle, Clock, BarChart2,
} from "lucide-react";
import toast from "react-hot-toast";

interface SubscriptionItem {
  id: string;
  plan: string;
  amount: number;
  exams_added: number;
  corrections_added: number;
  status: string;
  created_at: string;
  completed_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  completed: { label: "Payé", color: "text-emerald-700 bg-emerald-100", Icon: CheckCircle },
  pending:   { label: "En attente", color: "text-amber-700 bg-amber-100", Icon: Clock },
  failed:    { label: "Échoué", color: "text-red-700 bg-red-100", Icon: AlertCircle },
  declined:  { label: "Refusé", color: "text-red-700 bg-red-100", Icon: AlertCircle },
};

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const {
    fetchQuota,
    exams_used, exams_limit, exams_remaining,
    corrections_used, corrections_limit, corrections_remaining,
    is_unlimited,
  } = useQuotaStore();
  const [history, setHistory] = useState<SubscriptionItem[]>([]);

  useEffect(() => {
    fetchQuota();
    api.get<SubscriptionItem[]>("/subscriptions/history").then((r) => setHistory(r.data));
  }, [fetchQuota]);

  // Afficher le résultat du paiement si on revient du callback
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "1") {
      toast.success("Paiement confirmé ! Votre quota a été mis à jour.");
      fetchQuota();
    } else if (error) {
      toast.error(error === "declined" ? "Paiement refusé." : `Erreur de paiement : ${error}`);
    }
  }, [searchParams, fetchQuota]);

  const pct = (used: number, limit: number) => Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Abonnement & Quota</h1>
        <p className="text-slate-500 mt-1">Gérez votre abonnement et consultez vos usages.</p>
      </div>

      {/* Quota actuel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">Votre quota actuel</h2>
          {is_unlimited && (
            <span className="ml-auto text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
              Accès illimité (Admin)
            </span>
          )}
        </div>
        {/* Quotas séparés : épreuves et corrigés */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Épreuves générées</span>
              <span className="text-slate-500">
                {is_unlimited ? "∞" : `${exams_used} / ${exams_limit}`}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: is_unlimited ? "10%" : `${pct(exams_used, exams_limit)}%` }}
              />
            </div>
            {!is_unlimited && (
              <p className="text-xs text-slate-400 mt-1">
                {exams_remaining} épreuve{exams_remaining > 1 ? "s" : ""} restante{exams_remaining > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Corrigés générés</span>
              <span className="text-slate-500">
                {is_unlimited ? "∞" : `${corrections_used} / ${corrections_limit}`}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: is_unlimited ? "10%" : `${pct(corrections_used, corrections_limit)}%` }}
              />
            </div>
            {!is_unlimited && (
              <p className="text-xs text-slate-400 mt-1">
                {corrections_remaining} corrigé{corrections_remaining > 1 ? "s" : ""} restant{corrections_remaining > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>


      {/* Historique */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Historique des paiements</h2>

          {/* Cartes (mobile / tablette) */}
          <div className="lg:hidden space-y-3">
            {history.map((s) => {
              const st = statusConfig[s.status] ?? statusConfig["pending"];
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-medium text-slate-900 capitalize">{s.plan}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                      <st.Icon className="w-3.5 h-3.5" />
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-sm text-slate-600 mb-2">
                    <span className="font-medium">{s.amount.toLocaleString()} FCFA</span>
                    <span className="text-xs text-slate-400">
                      +{s.exams_added} épreuve{s.exams_added > 1 ? "s" : ""} / +{s.corrections_added} corrigé{s.corrections_added > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                    {new Date(s.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tableau (desktop) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Montant</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Crédits</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((s) => {
                  const st = statusConfig[s.status] ?? statusConfig["pending"];
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-medium text-slate-900 capitalize">{s.plan}</td>
                      <td className="px-4 py-3 text-slate-600">{s.amount.toLocaleString()} FCFA</td>
                      <td className="px-4 py-3 text-slate-600">
                        +{s.exams_added} épreuve{s.exams_added > 1 ? "s" : ""} / +{s.corrections_added} corrigé{s.corrections_added > 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                          <st.Icon className="w-3.5 h-3.5" />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(s.created_at).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense>
      <SubscriptionContent />
    </Suspense>
  );
}
