"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meter, PageHead } from "@/components/espace/parts";
import { PLANS } from "@/components/PaywallModal";
import { useQuotaStore } from "@/store/quota";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

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

const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  completed: { label: "Payé", className: "complete" },
  pending: { label: "En attente", className: "running" },
  failed: { label: "Échoué", className: "failed" },
  declined: { label: "Refusé", className: "failed" },
};

function Usage({ label, used, limit, unlimited }: { label: string; used: number; limit: number; unlimited: boolean }) {
  if (unlimited) return <div className="esp-meter"><div className="esp-meter-top"><span>{label}</span><strong>Illimité</strong></div></div>;
  return <Meter label={label} value={Math.min(used, limit)} max={Math.max(1, limit)} compact={limit > 30} />;
}

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const { fetchQuota, openPaywall, exams_used, exams_limit, corrections_used, corrections_limit, is_unlimited } = useQuotaStore();
  const [history, setHistory] = useState<SubscriptionItem[]>([]);

  useEffect(() => {
    void fetchQuota();
    api.get<SubscriptionItem[]>("/subscriptions/history").then((r) => setHistory(r.data)).catch(() => {});
  }, [fetchQuota]);

  // Back from the payment callback: show the outcome.
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "1") {
      toast.success("Paiement confirmé ! Votre quota a été mis à jour.");
      void fetchQuota();
    } else if (error) {
      toast.error(error === "declined" ? "Paiement refusé." : `Erreur de paiement : ${error}`);
    }
  }, [searchParams, fetchQuota]);

  return (
    <div className="esp-page">
      <PageHead eyebrow="Compte" title="Utilisation" subtitle="Consultez vos usages et rechargez votre compte." />
      <div className="esp-plan">
        <section className="esp-panel esp-quota">
          <h2>Votre quota actuel</h2>
          <Usage label="Épreuves générées" used={exams_used} limit={exams_limit} unlimited={is_unlimited} />
          <Usage label="Corrigés générés" used={corrections_used} limit={corrections_limit} unlimited={is_unlimited} />
        </section>
        <section className="esp-panel esp-offer" id="forfaits">
          <span className="esp-eyebrow">Recharger mon compte</span>
          <h2>Forfaits</h2>
          <ul>{PLANS.map((p) => <li key={p.id}><Check /><span><strong>{p.name}</strong> · {p.price} · {p.features.join(", ")}</span></li>)}</ul>
          <p className="esp-hint">Paiement par Mobile Money MTN. Les crédits achetés n’expirent pas.</p>
          {!is_unlimited && <Button variant="framed" onClick={() => openPaywall("recharge")}>Choisir un forfait <ArrowRight /></Button>}
        </section>
      </div>

      {history.length > 0 && (
        <section className="esp-block">
          <div className="esp-block-head"><h2>Historique des paiements</h2></div>
          <div className="esp-panel esp-list" role="table" aria-label="Paiements">
            <div className="esp-row esp-row-head" role="row">
              <span role="columnheader">Forfait</span><span role="columnheader">Montant</span><span role="columnheader">Date</span><span role="columnheader">Statut</span><span role="columnheader">Crédits</span>
            </div>
            {history.map((s) => {
              const st = PAYMENT_STATUS[s.status] ?? PAYMENT_STATUS.pending;
              return (
                <div className="esp-row" role="row" key={s.id}>
                  <span role="cell" className="esp-row-title"><span><strong className="capitalize">{s.plan}</strong></span></span>
                  <span role="cell">{s.amount.toLocaleString("fr-FR")} FCFA</span>
                  <span role="cell">{formatDate(s.created_at)}</span>
                  <span role="cell"><span className={`esp-status ${st.className}`}>{st.label}</span></span>
                  <span role="cell" className="esp-row-actions">+{s.exams_added} épr. · +{s.corrections_added} corr.</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <p className="esp-note">Une question sur le paiement ? <Link href="/dashboard/help#fonctionne-paiement" className="esp-inline-link">Consultez l’aide</Link>.</p>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionContent />
    </Suspense>
  );
}
