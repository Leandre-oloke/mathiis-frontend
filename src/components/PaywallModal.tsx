"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useQuotaStore } from "@/store/quota";

export const PLANS: { id: string; name: string; price: string; priceNum: number; features: string[]; popular?: boolean }[] = [
  { id: "starter", name: "Starter", price: "500 FCFA", priceNum: 500, features: ["10 crédits", "5 épreuves + 5 corrigés"] },
  { id: "standard", name: "Standard", price: "1 000 FCFA", priceNum: 1000, features: ["25 crédits", "15 épreuves + 10 corrigés"], popular: true },
  { id: "premium", name: "Premium", price: "1 500 FCFA", priceNum: 1500, features: ["40 crédits", "20 épreuves + 20 corrigés"] },
];

/** Quota reached (or "Choisir un forfait"): explains why, then lets the user pick a pack and pay with MTN MoMo (FedaPay). */
export function PaywallModal() {
  const { showPaywall, paywallReason, closePaywall } = useQuotaStore();
  const [askedPlans, setAskedPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [loading, setLoading] = useState(false);

  const step = askedPlans || paywallReason === "recharge" ? "plans" : "notify";
  const handleClose = () => {
    closePaywall();
    setTimeout(() => { setAskedPlans(false); setSelectedPlan("standard"); }, 300);
  };

  const isExam = paywallReason === "exam";
  const chosen = PLANS.find((p) => p.id === selectedPlan) ?? PLANS[1];

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<{ payment_url: string }>("/subscriptions/initiate", { plan: selectedPlan });
      // Only a secure payment page is opened, and it gets no handle on this tab.
      if (!/^https:\/\//.test(data.payment_url)) throw new Error("payment_url");
      window.open(data.payment_url, "_blank", "noopener,noreferrer");
      handleClose();
    } catch {
      toast.error("Impossible d'initier le paiement. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showPaywall} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="esp-dialog esp-dialog-wide">
        {step === "notify" ? (<>
          <DialogHeader>
            <DialogTitle>Quota atteint</DialogTitle>
            <DialogDescription>{isExam ? "Vous avez épuisé vos épreuves gratuites." : "Vous avez épuisé vos corrigés gratuits."}</DialogDescription>
          </DialogHeader>
          <p className="esp-hint">Rechargez votre compte à partir de <strong>500 FCFA</strong> pour continuer à générer des {isExam ? "épreuves" : "corrigés"} sans interruption.</p>
          <div className="esp-dialog-actions">
            <Button variant="framed" onClick={handleClose}>Fermer</Button>
            <Button className="esp-primary" onClick={() => setAskedPlans(true)}>Recharger mon compte <ArrowRight /></Button>
          </div>
        </>) : (<>
          <DialogHeader>
            <DialogTitle>Choisir un forfait</DialogTitle>
            <DialogDescription>Les crédits achetés n’expirent pas.</DialogDescription>
          </DialogHeader>
          <div className="esp-choice-row esp-plans" role="radiogroup" aria-label="Forfaits">
            {PLANS.map((plan) => {
              const on = selectedPlan === plan.id;
              return (
                <button key={plan.id} type="button" role="radio" aria-checked={on} className={`esp-choice${on ? " is-on" : ""}`} onClick={() => setSelectedPlan(plan.id)}>
                  <span className="esp-choice-dot" aria-hidden="true">{on && <Check />}</span>
                  <span>
                    <strong>{plan.name}{plan.popular && <em className="esp-engine-time">Populaire</em>}</strong>
                    <small>{plan.features.join(" · ")}</small>
                  </span>
                  <span className="esp-plan-price">{plan.price}</span>
                </button>
              );
            })}
          </div>
          <Button className="esp-primary esp-pay" onClick={() => void handlePay()} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <CreditCard />}
            {loading ? "Chargement…" : `Payer ${chosen.price} via MTN MoMo`}
          </Button>
          <div className="esp-dialog-foot">
            {paywallReason !== "recharge" ? <button type="button" className="esp-inline-link" onClick={() => setAskedPlans(false)}><ArrowLeft className="inline h-3.5 w-3.5" /> Retour</button> : <span />}
            <span>Paiement sécurisé · FedaPay</span>
          </div>
        </>)}
      </DialogContent>
    </Dialog>
  );
}
