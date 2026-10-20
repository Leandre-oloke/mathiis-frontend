"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCheck, FileText, LoaderCircle, Plus, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Kbd, Meter, PageHead, rise, useSearchShortcut } from "@/components/espace/parts";
import { ExamTable } from "@/components/espace/exam-rows";
import { useAuthStore } from "@/store/auth";
import { useExamStore } from "@/store/exams";
import { useQuotaStore } from "@/store/quota";
import { api } from "@/lib/api";

const hello = () => { const h = new Date().getHours(); return h < 5 || h >= 18 ? "Bonsoir" : "Bonjour"; };

export default function DashboardPage() {
  const shortcut = useSearchShortcut();
  const user = useAuthStore((s) => s.user);
  const { exams, fetchExams, loading } = useExamStore();
  const { exams_used, exams_limit, is_unlimited, loaded: quotaLoaded, fetchQuota } = useQuotaStore();
  const [stats, setStats] = useState({ total: 0, completed: 0, generating: 0 });

  useEffect(() => {
    void fetchExams({ page: 1 });
    if (!quotaLoaded) void fetchQuota();
    api.get("/exams/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, [fetchExams, fetchQuota, quotaLoaded]);

  const first = user?.full_name?.split(" ")[0] || user?.username;
  const recent = exams.slice(0, 5);
  const figures = [
    { icon: FileText, value: stats.total, label: "Épreuves totales" },
    { icon: CheckCheck, value: stats.completed, label: "Complétées" },
    { icon: LoaderCircle, value: stats.generating, label: "En génération" },
  ];

  return (
    <div className="esp-page">
      <PageHead eyebrow="Tableau de bord" title={first ? `${hello()}, ${first}` : hello()} subtitle="Gérez et créez vos épreuves intelligentes."
        actions={<Button asChild className="esp-primary"><Link href="/dashboard/generate"><Plus /> Nouvelle épreuve <Kbd>N</Kbd></Link></Button>} />

      <section className="esp-stats" aria-label="Vos chiffres">
        {figures.map((s, i) => <div className="esp-stat esp-rise" style={rise(i)} key={s.label}><s.icon /><strong>{s.value}</strong><span>{s.label}</span></div>)}
        <div className="esp-stat esp-stat-quota esp-rise" style={rise(3)}>
          {is_unlimited
            ? <div className="esp-meter"><div className="esp-meter-top"><span>Quota d’épreuves</span><strong>Illimité</strong></div></div>
            : <Meter label="Quota d’épreuves" value={Math.min(exams_used, exams_limit)} max={Math.max(1, exams_limit)} compact={exams_limit > 30} />}
        </div>
      </section>

      <section className="esp-actions" aria-label="Démarrer">
        <Link href="/dashboard/generate" className="esp-action ink esp-rise" style={rise(4)}>
          <Sparkles /><h2>Générer une épreuve</h2><p>Choisissez la matière et la classe : l’IA rédige l’épreuve et son corrigé en direct.</p><span className="esp-action-foot">Commencer <ArrowRight /><Kbd>N</Kbd></span>
        </Link>
        <Link href="/dashboard/documents" className="esp-action esp-rise" style={rise(5)}>
          <Upload /><h2>Importer un document</h2><p>Une épreuve en PDF, Word ou photo : recevez son corrigé détaillé en PDF.</p><span className="esp-action-foot">Importer <ArrowRight /><Kbd>I</Kbd></span>
        </Link>
      </section>

      <section className="esp-block">
        <div className="esp-block-head"><h2>Épreuves récentes</h2><Button variant="framed" size="sm" asChild><Link href="/dashboard/exams">Voir tout <ArrowRight /></Link></Button></div>
        {loading && recent.length === 0 ? <div className="esp-panel esp-loading" aria-busy="true"><LoaderCircle className="animate-spin" /> Chargement…</div>
          : recent.length > 0 ? <ExamTable exams={recent} />
          : <EmptyState icon={<FileText />} title="Aucune épreuve pour l’instant" text="Votre première épreuve apparaîtra ici dès qu’elle sera générée.">
              <Button asChild className="esp-primary"><Link href="/dashboard/generate"><Sparkles /> Générer ma première épreuve</Link></Button>
            </EmptyState>}
      </section>

      <p className="esp-tip"><Kbd>{shortcut}</Kbd> ouvre la recherche rapide depuis n’importe quelle page.</p>
    </div>
  );
}
