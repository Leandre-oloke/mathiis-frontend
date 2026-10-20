"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide.");
      return;
    }
    api
      .post("/auth/verify-email", { token })
      .then((res) => {
        setStatus("success");
        setMessage(res.data?.message || "Email vérifié avec succès.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.detail || "Lien invalide ou expiré. Refaites une inscription ou demandez un nouvel envoi."
        );
      });
  }, [token]);

  return (
    <div className="rounded-2xl border-[1.5px] border-foreground bg-card p-6 shadow-[6px_6px_0_var(--foreground)] sm:p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-10 h-10 text-foreground animate-spin mx-auto mb-4" />
              <p className="text-muted text-sm">Vérification en cours...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="w-10 h-10 text-foreground mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold tracking-tight mb-2">Email vérifié !</h1>
              <p className="text-muted text-sm mb-6">{message}</p>
              <Link
                href="/auth/login"
                className="btn-ink w-full"
              >
                Se connecter
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold tracking-tight mb-2">Échec de la vérification</h1>
              <p className="text-muted text-sm mb-6">{message}</p>
              <Link href="/auth/login" className="font-semibold text-foreground underline underline-offset-4 text-sm">
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
