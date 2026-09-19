"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuotaStore } from "@/store/quota";
import { api } from "@/lib/api";
import {
  CheckCircle, AlertCircle, Clock, BarChart2, Crown, Sparkles, FileDown, Headphones,
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
    <div className="space-y-7">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-indigo-500">Abonnement</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#071a3d] sm:text-4xl">Abonnement & Quota <span aria-hidden>👑</span></h1>
        <p className="mt-1 text-lg text-slate-500">Gérez votre abonnement et consultez vos usages.</p>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-white bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-100/70 blur-2xl" />
        <div className="absolute bottom-[-7rem] right-28 h-56 w-56 rounded-full bg-cyan-100/60 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100">
              <Crown className="h-10 w-10 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-500">Votre abonnement</p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#071a3d] sm:text-3xl">{is_unlimited ? "Accès illimité (Admin)" : "Formule Mathiis"}</h2>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Actif</span>
              <p className="mt-3 max-w-2xl text-sm text-slate-500">Profitez de toutes les fonctionnalités de Mathiis pour créer, corriger et exporter vos évaluations.</p>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 px-7 py-5 text-center text-white shadow-xl shadow-indigo-200">
            <div className="text-4xl font-black">∞</div><div className="text-xs font-bold uppercase tracking-wider text-indigo-100">possibilités</div>
          </div>
        </div>
      </section>

      {/* Quota actuel */}
      <div className="rounded-3xl border border-white bg-white p-7 shadow-xl shadow-slate-200/50">
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
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
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
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
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

      <section className="rounded-3xl border border-white bg-white p-6 shadow-xl shadow-slate-200/50">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-extrabold text-[#071a3d]">Vos avantages inclus</h2><span className="text-sm font-semibold text-indigo-600">Tout est inclus</span></div>
        <div className="grid gap-4 md:grid-cols-3">
          {([
            [Sparkles, "Génération intelligente", "Créez des épreuves adaptées à toutes vos classes.", "text-indigo-600", "bg-indigo-50"],
            [FileDown, "Exports PDF & Word", "Téléchargez vos épreuves et corrigés à tout moment.", "text-emerald-600", "bg-emerald-50"],
            [Headphones, "Support prioritaire", "Une équipe à votre écoute pour vous accompagner.", "text-orange-600", "bg-orange-50"],
          ] as const).map(([Icon, title, copy, color, bg]) => (
            <div key={String(title)} className="rounded-2xl border border-slate-100 p-5">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${bg}`}><Icon className={`h-6 w-6 ${color}`} /></div>
              <h3 className="font-bold text-[#071a3d]">{String(title)}</h3><p className="mt-1 text-sm leading-relaxed text-slate-500">{String(copy)}</p>
            </div>
          ))}
        </div>
      </section>


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
