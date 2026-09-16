"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useExamStore } from "@/store/exams";
import { api } from "@/lib/api";
import { formatDate, STATUS_LABELS } from "@/lib/utils";
import { Sparkles, FileText, Plus, ArrowRight, CheckCircle, Upload, WandSparkles } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  generating: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { exams, fetchExams, loading } = useExamStore();
  const [stats, setStats] = useState({ total: 0, completed: 0, generating: 0 });

  useEffect(() => {
    fetchExams({ page: 1 });
    api.get("/exams/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, [fetchExams]);

  const recentExams = exams.slice(0, 5);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-indigo-500">Bon retour</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-[#071a3d] sm:text-4xl">
            Bonjour, {user?.full_name?.split(" ")[0] || user?.username} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-2 text-base text-slate-500">Gérez et créez vos épreuves intelligentes</p>
        </div>
        <Link
          href="/dashboard/generate"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-200"
        >
          <Plus className="h-5 w-5" />
          Nouvelle épreuve
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Épreuves totales"
          value={stats.total}
          color="bg-indigo-50 text-indigo-600"
          accent="from-indigo-500/10"
        />
        <StatCard
          icon={CheckCircle}
          label="Complétées"
          value={stats.completed}
          color="bg-emerald-50 text-emerald-600"
          accent="from-emerald-500/10"
        />
        <StatCard
          icon={Sparkles}
          label="En génération"
          value={stats.generating}
          color="bg-amber-50 text-amber-600"
          accent="from-amber-500/10"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Link
          href="/dashboard/generate"
          className="group relative min-h-56 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-8 text-white shadow-xl shadow-indigo-200/70 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-200"
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10 bg-white/5" />
          <div className="absolute -bottom-16 right-16 h-44 w-44 rounded-full bg-fuchsia-300/10 blur-xl" />
          <div className="relative z-10 flex h-full flex-col items-start">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <WandSparkles className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold tracking-[-0.02em]">Générer une épreuve</div>
            <div className="mt-2 text-indigo-100">Paramétrez et laissez l&apos;IA créer</div>
            <div className="mt-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-indigo-600 shadow-lg transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </Link>
        <Link
          href="/dashboard/documents"
          className="group relative min-h-56 overflow-hidden rounded-3xl border border-white bg-white p-8 shadow-lg shadow-slate-200/60 transition-all hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl"
        >
          <div className="absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100" />
          <Upload className="absolute bottom-12 right-12 h-20 w-20 text-blue-200/80" strokeWidth={1.2} />
          <div className="relative z-10 flex h-full flex-col items-start">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold tracking-[-0.02em] text-[#071a3d]">Importer un document</div>
            <div className="mt-2 text-slate-500">PDF, Word ou texte comme base</div>
            <div className="mt-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-indigo-600 transition group-hover:translate-x-1 group-hover:border-indigo-200">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent exams */}
      <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-lg shadow-slate-200/50">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold tracking-[-0.02em] text-[#071a3d]">Épreuves récentes</h2>
          <Link href="/dashboard/exams" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : recentExams.length === 0 ? (
          <div className="py-14 text-center">
            <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">Aucune épreuve pour l&apos;instant</p>
            <Link
              href="/dashboard/generate"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:underline"
            >
              <Plus className="w-4 h-4" />
              Créer ma première épreuve
            </Link>
          </div>
        ) : (
          <div>
            {recentExams.map((exam, idx) => (
              <div
                key={exam.id}
                className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80 ${
                  idx < recentExams.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-semibold text-[#071a3d]">{exam.title}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {exam.subject} · {exam.num_questions} questions · {formatDate(exam.created_at)}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusColors[exam.status]}`}>
                  {STATUS_LABELS[exam.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-lg shadow-slate-200/50">
      <div className={`absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${accent} to-transparent`} />
      <div className="relative flex items-center gap-5">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-3xl font-extrabold tracking-[-0.03em] text-[#071a3d]">{value}</div>
          <div className="mt-0.5 text-sm text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
