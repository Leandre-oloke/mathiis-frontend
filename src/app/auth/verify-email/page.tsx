"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/site/auth-card";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "Lien invalide.");

  useEffect(() => {
    if (!token) return;
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
    <AuthShell bear={{ reading: status === "loading", cheer: status === "success" ? 1 : 0, frown: status === "error" ? 1 : 0 }}>
      <div className="auth-done" role="status">
        {status === "loading" && (
          <>
            <h1 id="auth-title">Vérification en cours…</h1>
            <p><Loader2 className="inline h-4 w-4 animate-spin" /> Un instant, nous confirmons votre adresse email.</p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 id="auth-title">Email vérifié !</h1>
            <p>{message}</p>
            <Button asChild className="auth-submit"><Link href="/auth/login">Se connecter</Link></Button>
          </>
        )}
        {status === "error" && (
          <>
            <h1 id="auth-title">Échec de la vérification</h1>
            <p className="auth-error" role="alert">{message}</p>
            <Button variant="framed" asChild><Link href="/auth/login">Retour à la connexion</Link></Button>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
