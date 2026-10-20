"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useExamStore } from "@/store/exams";
import { useQuotaStore } from "@/store/quota";
import { api } from "@/lib/api";
import { formatDate, STATUS_LABELS } from "@/lib/utils";
import { PageHeader, StatusBadge } from "@/components/ui/kit";
import { Sparkles, FileText, Plus, ArrowRight, Upload, CheckCheck, Loader } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { exams, fetchExams, loading } = useExamStore();
  const { exams_used, exams_limit, is_unlimited, loaded: quotaLoaded, fetchQuota } = useQuotaStore();
  const [stats, setStats] = useState({ total: 0, completed: 0, generating: 0 });

  useEffect(() => {
    fetchExams({ page: 1 });
    if (!quotaLoaded) fetchQuota();
    api.get("/exams/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, [fetchExams, fetchQuota, quotaLoaded]);

  const recentExams = exams.slice(0, 5);
  const firstName = user?.full_name?.split(" ")[0] || user?.username;
  const hour = new Date().getHours();
  const hello = hour < 5 || hour >= 18 ? "Bonsoir" : "Bonjour";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tableau de bord"
        title={firstName ? `${hello}, ${firstName}` : hello}
        subtitle="Gérez et créez vos épreuves intelligentes."
        actions={
          <Link href="/dashboard/generate" className="btn-ink">
            <Plus className="h-4 w-4" />Nouvelle épreuve
          </Link>
        }
      />

      {/* Chiffres + quota, dans un seul cadre */}
      <section aria-label="Vos chiffres" className="grid overflow-hidden rounded-2xl border-[1.5px] border-foreground bg-card sm:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.4fr)]">
        <Stat icon={FileText} value={stats.total} label="Épreuves totales" />
        <Stat icon={CheckCheck} value={stats.completed} label="Complétées" />
        <Stat icon={Loader} value={stats.generating} label="En génération" />
        <div className="flex flex-col justify-center gap-2 border-t border-foreground/10 p-5 sm:border-l sm:border-t-0">
          <div className="flex justify-between text-sm font-medium">
            <span>Quota d’épreuves</span>
            <span className="font-mono text-xs">{is_unlimited ? "Illimité" : `${exams_used} / ${exams_limit}`}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border-[1.5px] border-foreground bg-background">
            <div className="h-full bg-foreground transition-[width] duration-700" style={{ width: is_unlimited ? "100%" : `${Math.min(100, (exams_used / Math.max(1, exams_limit)) * 100)}%` }} />
          </div>
          <Link href="/dashboard/subscription" className="text-xs text-muted underline-offset-4 hover:underline">Voir mon abonnement</Link>
        </div>
      </section>

      {/* Actions principales */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/generate" className="group relative overflow-hidden rounded-2xl border-[1.5px] border-foreground bg-foreground p-6 text-background transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_6px_0_oklch(14.5%_0_0/0.35)]">
          <Sparkles className="mb-4 h-7 w-7" />
          <div className="font-display text-xl font-bold">Générer une épreuve</div>
          <p className="mt-1.5 text-sm opacity-70">Choisissez la matière, la classe et les notions : l’IA rédige l’épreuve et son corrigé.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Commencer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </Link>
        <Link href="/dashboard/documents" className="group rounded-2xl border-[1.5px] border-foreground bg-card p-6 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_6px_0_var(--foreground)]">
          <Upload className="mb-4 h-7 w-7" />
          <div className="font-display text-xl font-bold">Importer un document</div>
          <p className="mt-1.5 text-sm text-muted">Une épreuve en PDF, Word ou photo : recevez son corrigé détaillé.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Importer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </div>

      {/* Épreuves récentes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Épreuves récentes</h2>
          <Link href="/dashboard/exams" className="btn-framed btn-sm">Voir tout <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : recentExams.length === 0 ? (
          <div className="rounded-2xl border-[1.5px] border-foreground bg-card px-5 py-14 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border-[1.5px] border-dashed border-foreground"><Sparkles className="h-6 w-6" /></span>
            <p className="font-semibold">Aucune épreuve pour l’instant</p>
            <p className="mt-1 text-sm text-muted">Votre première épreuve apparaîtra ici dès qu’elle sera générée.</p>
            <Link href="/dashboard/generate" className="btn-ink mt-5"><Plus className="h-4 w-4" />Créer ma première épreuve</Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border-[1.5px] border-foreground bg-card">
            {recentExams.map((exam) => (
              <Link key={exam.id} href={`/dashboard/exams/${exam.id}`} className="flex items-center gap-4 border-b border-foreground/10 p-4 transition-colors last:border-0 hover:bg-foreground/[0.03]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[1.5px] border-foreground"><FileText className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{exam.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">{exam.subject}{exam.level ? ` · ${exam.level}` : ""} · {exam.num_questions} questions · {formatDate(exam.created_at)}</span>
                </span>
                <StatusBadge status={exam.status}>{STATUS_LABELS[exam.status]}</StatusBadge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="border-t border-foreground/10 p-5 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0">
      <Icon className="mb-3 h-5 w-5" />
      <div className="font-display text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 text-sm text-muted">{label}</div>
    </div>
  );
}
