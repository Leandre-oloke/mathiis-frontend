"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Users, FileText, TrendingUp, CheckCircle, AlertCircle,
  UserPlus, Sparkles, BarChart3, Activity, Banknote, CreditCard, Coins
} from "lucide-react";

interface Stats {
  total_users: number; active_users: number; new_users_today: number; new_users_week: number;
  total_exams: number; exams_today: number; exams_week: number;
  exams_completed: number; exams_failed: number; avg_exams_per_user: number;
  top_classes: { classe: string; count: number }[];
  daily_exams: { date: string; count: number }[];
  total_revenue: number; revenue_today: number; revenue_week: number;
  total_subscriptions: number; subscriptions_today: number;
  total_cost_usd: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-64" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>
    </div>
  );

  if (!stats) return null;
  const successRate = stats.total_exams > 0 ? Math.round((stats.exams_completed / stats.total_exams) * 100) : 0;
  const maxDaily = Math.max(...stats.daily_exams.map(d => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Vue d&apos;ensemble de la plateforme Mathiis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Utilisateurs total" value={stats.total_users}
          sub={`${stats.active_users} actifs`} color="bg-indigo-50 text-indigo-600"
          trend={`+${stats.new_users_today} aujourd'hui`} />
        <KpiCard icon={UserPlus} label="Nouveaux (7 jours)" value={stats.new_users_week}
          sub={`+${stats.new_users_today} aujourd'hui`} color="bg-emerald-50 text-emerald-600" />
        <KpiCard icon={FileText} label="Épreuves total" value={stats.total_exams}
          sub={`${stats.exams_week} cette semaine`} color="bg-amber-50 text-amber-600"
          trend={`+${stats.exams_today} aujourd'hui`} />
        <KpiCard icon={TrendingUp} label="Moy. épreuves/user" value={stats.avg_exams_per_user}
          sub={`${successRate}% de succès`} color="bg-violet-50 text-violet-600" />
      </div>

      {/* KPI Revenus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Banknote} label="Revenus total"
          value={`${stats.total_revenue.toLocaleString()} F`}
          sub={`${stats.total_subscriptions} abonnement${stats.total_subscriptions > 1 ? "s" : ""}`}
          color="bg-emerald-50 text-emerald-600"
          trend={`+${stats.revenue_today.toLocaleString()} F aujourd'hui`} />
        <KpiCard icon={CreditCard} label="Revenus (7 jours)"
          value={`${stats.revenue_week.toLocaleString()} F`}
          sub={`${stats.subscriptions_today} paiement${stats.subscriptions_today > 1 ? "s" : ""} aujourd'hui`}
          color="bg-violet-50 text-violet-600" />
        <KpiCard icon={TrendingUp} label="Revenu moyen/abonnement"
          value={stats.total_subscriptions > 0
            ? `${Math.round(stats.total_revenue / stats.total_subscriptions).toLocaleString()} F`
            : "0 F"}
          sub="par paiement confirmé"
          color="bg-amber-50 text-amber-600" />
        <KpiCard icon={Coins} label="Coût DeepSeek total"
          value={`$${stats.total_cost_usd.toFixed(2)}`}
          sub="épreuves + documents importés"
          color="bg-slate-100 text-slate-600" />
      </div>

      {/* Statut des générations + Top classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Statut */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Statut des générations
          </h2>
          <div className="space-y-4">
            <StatusBar label="Complétées" value={stats.exams_completed} total={stats.total_exams}
              color="bg-emerald-500" icon={CheckCircle} iconColor="text-emerald-500" />
            <StatusBar label="Échouées" value={stats.exams_failed} total={stats.total_exams}
              color="bg-red-400" icon={AlertCircle} iconColor="text-red-400" />
            <StatusBar label="En attente / Génération"
              value={stats.total_exams - stats.exams_completed - stats.exams_failed}
              total={stats.total_exams} color="bg-amber-400" icon={Sparkles} iconColor="text-amber-400" />
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-center">
            <div className="text-3xl font-bold text-indigo-600">{successRate}%</div>
            <div className="text-sm text-slate-500 mt-0.5">Taux de succès</div>
          </div>
        </div>

        {/* Top classes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Classes les plus générées
          </h2>
          {stats.top_classes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {stats.top_classes.map((tc, i) => {
                const max = stats.top_classes[0].count;
                const pct = Math.round((tc.count / max) * 100);
                return (
                  <div key={tc.classe}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{tc.classe}</span>
                      <span className="text-slate-400">{tc.count} épreuve{tc.count > 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Graphique activité 7 jours */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Épreuves générées (7 derniers jours)
        </h2>
        <div className="flex items-end gap-3 h-40">
          {stats.daily_exams.map((d) => {
            const pct = maxDaily > 0 ? (d.count / maxDaily) * 100 : 0;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{d.count}</span>
                <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden" style={{ height: "100px" }}>
                  <div
                    className="w-full bg-indigo-500 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(pct, d.count > 0 ? 4 : 0)}%`, marginTop: "auto" }}
                  />
                </div>
                <span className="text-xs text-slate-400">{d.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: number | string;
  sub?: string; color: string; trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function StatusBar({ label, value, total, color, icon: Icon, iconColor }: {
  label: string; value: number; total: number; color: string;
  icon: React.ElementType; iconColor: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          <span className="text-slate-700">{label}</span>
        </div>
        <span className="text-slate-500">{value} <span className="text-slate-300">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
