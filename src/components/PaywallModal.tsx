"use client";

import { useState } from "react";
import { X, Zap, Check, Loader2, CreditCard, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useQuotaStore } from "@/store/quota";
import toast from "react-hot-toast";

const PLANS: Array<{
  id: string;
  name: string;
  price: string;
  priceNum: number;
  color: "indigo" | "violet" | "amber";
  features: string[];
  popular?: boolean;
}> = [
  {
    id: "starter",
    name: "Starter",
    price: "500 FCFA",
    priceNum: 500,
    color: "indigo",
    features: ["10 crédits", "5 épreuves + 5 corrigés"],
  },
  {
    id: "standard",
    name: "Standard",
    price: "1 000 FCFA",
    priceNum: 1000,
    color: "violet",
    features: ["25 crédits", "15 épreuves + 10 corrigés"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "1 500 FCFA",
    priceNum: 1500,
    color: "amber",
    features: ["40 crédits", "20 épreuves + 20 corrigés"],
  },
];

const colorMap = {
  indigo: {
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    btn: "bg-indigo-600 hover:bg-indigo-700",
    ring: "ring-2 ring-indigo-500 border-indigo-400",
    selected: "border-indigo-500 bg-indigo-50",
    unselected: "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40",
  },
  violet: {
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    btn: "bg-violet-600 hover:bg-violet-700",
    ring: "ring-2 ring-violet-500 border-violet-400",
    selected: "border-violet-500 bg-violet-50",
    unselected: "border-slate-200 hover:border-violet-200 hover:bg-violet-50/40",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    btn: "bg-amber-500 hover:bg-amber-600",
    ring: "ring-2 ring-amber-500 border-amber-400",
    selected: "border-amber-500 bg-amber-50",
    unselected: "border-slate-200 hover:border-amber-200 hover:bg-amber-50/40",
  },
};

export function PaywallModal() {
  const { showPaywall, paywallReason, closePaywall } = useQuotaStore();
  const [step, setStep] = useState<"notify" | "plans">("notify");
  const [selectedPlan, setSelectedPlan] = useState<string>("standard");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    closePaywall();
    setTimeout(() => { setStep("notify"); setSelectedPlan("standard"); }, 300);
  };

  if (!showPaywall) return null;

  const isExam = paywallReason === "exam";
  const reasonText = isExam
    ? "Vous avez épuisé vos épreuves gratuites."
    : "Vous avez épuisé vos corrigés gratuits.";

  const chosen = PLANS.find((p) => p.id === selectedPlan) ?? PLANS[1];

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<{ payment_url: string }>("/subscriptions/initiate", {
        plan: selectedPlan,
      });
      window.open(data.payment_url, "_blank");
      handleClose();
    } catch {
      toast.error("Impossible d'initier le paiement. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Étape 1 : Notification ─────────────────────────────────────── */}
        {step === "notify" && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Quota atteint</h2>
              <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-8 py-10 flex flex-col items-center text-center gap-6 overflow-y-auto">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-800">{reasonText}</p>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                  Rechargez votre compte à partir de{" "}
                  <span className="font-semibold text-indigo-600">500 FCFA</span>{" "}
                  pour continuer à générer des {isExam ? "épreuves" : "corrigés"} sans interruption.
                </p>
              </div>

              <button
                onClick={() => setStep("plans")}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-md shadow-indigo-200"
              >
                <RefreshCw className="w-4 h-4" />
                Recharger mon compte
                <ArrowRight className="w-4 h-4" />
              </button>

              <button onClick={handleClose} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                Fermer
              </button>
            </div>
          </>
        )}

        {/* ── Étape 2 : Choix du plan ────────────────────────────────────── */}
        {step === "plans" && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Choisir un pack</h2>
                <p className="text-sm text-slate-500 mt-0.5">Sélectionnez le pack qui vous convient</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Sélecteur de plan (scrollable si l'écran est trop court) */}
            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              {PLANS.map((plan) => {
                const colors = colorMap[plan.color];
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all cursor-pointer relative ${
                      isSelected ? colors.selected + " " + colors.ring : colors.unselected
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-4 bg-violet-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Populaire
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      {/* Infos */}
                      <div className="flex items-center gap-3">
                        {/* Radio */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? "border-current" : "border-slate-300"
                        }`} style={{ color: isSelected ? undefined : undefined }}>
                          {isSelected && (
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              plan.color === "indigo" ? "bg-indigo-600" :
                              plan.color === "violet" ? "bg-violet-600" : "bg-amber-500"
                            }`} />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors.badge}`}>
                              {plan.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {plan.features.map((f) => (
                              <span key={f} className="flex items-center gap-1 text-sm text-slate-600">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Prix */}
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="text-xl font-bold text-slate-900">{plan.price}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Récap + bouton payer — toujours visible, jamais poussé hors écran */}
            <div className="px-6 pb-6 pt-3 space-y-3 flex-shrink-0 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{chosen.name}</span>
                  {" · "}
                  {chosen.features.join(" + ")}
                </div>
                <span className="font-bold text-slate-900">{chosen.price}</span>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 ${
                  chosen.color === "indigo" ? "bg-indigo-600 hover:bg-indigo-700" :
                  chosen.color === "violet" ? "bg-violet-600 hover:bg-violet-700" :
                  "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {loading ? "Chargement…" : `Payer ${chosen.price} via MTN MoMo`}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setStep("notify")}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ← Retour
                </button>
                <p className="text-xs text-slate-400">
                  Paiement sécurisé · FedaPay · Béninois
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
