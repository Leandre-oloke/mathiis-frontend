"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useExamStore } from "@/store/exams";
import { api } from "@/lib/api";
import { formatDate, DIFFICULTY_LABELS, STATUS_LABELS } from "@/lib/utils";
import { Sparkles, FileText, Plus, ArrowRight, Clock, TrendingUp, CheckCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  generating: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.is_admin || user?.is_superuser;
  const { exams, fetchExams, loading } = useExamStore();
  const [stats, setStats] = useState({ total: 0, completed: 0, generating: 0 });

  useEffect(() => {
    fetchExams({ page: 1 });
    api.get("/exams/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, [fetchExams]);

  const recentExams = exams.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, {user?.full_name?.split(" ")[0] || user?.username}
          </h1>
          <p className="text-slate-500 mt-1">Gérez et créez vos épreuves intelligentes</p>
        </div>
        <Link
          href="/dashboard/generate"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Nouvelle épreuve
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          label="Épreuves totales"
          value={stats.total}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Complétées"
          value={stats.completed}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Sparkles}
          label="En génération"
          value={stats.generating}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/generate"
          className="group p-5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl text-white hover:shadow-xl hover:shadow-indigo-200 transition-all"
        >
          <Sparkles className="w-8 h-8 mb-3 opacity-80" />
          <div className="font-semibold text-lg">Générer une épreuve</div>
          <div className="text-indigo-100 text-sm mt-1">Paramétrez et laissez l&apos;IA créer</div>
          <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/dashboard/documents"
          className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-lg hover:shadow-slate-100 transition-all"
        >
          <FileText className="w-8 h-8 mb-3 text-slate-400" />
          <div className="font-semibold text-lg text-slate-900">Importer un document</div>
          <div className="text-slate-500 text-sm mt-1">PDF, Word ou texte comme base</div>
          <ArrowRight className="w-5 h-5 mt-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent exams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Épreuves récentes</h2>
          <Link href="/dashboard/exams" className="text-sm text-indigo-600 hover:underline font-medium">
            Voir tout
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : recentExams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">Aucune épreuve pour l&apos;instant</p>
            <a
              href="/atelier/"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:underline"
            >
              <Plus className="w-4 h-4" />
              Créer ma première épreuve
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {recentExams.map((exam, idx) => (
              <div
                key={exam.id}
                className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${
                  idx < recentExams.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{exam.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {exam.subject} · {exam.num_questions} questions · {formatDate(exam.created_at)}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[exam.status]}`}>
                  {STATUS_LABELS[exam.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
