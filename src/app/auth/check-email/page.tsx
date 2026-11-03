"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/site/auth-card";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const resendVerification = useAuthStore((s) => s.resendVerification);
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    if (!email || sending) return;
    setSending(true);
    try {
      await resendVerification(email);
      toast.success("Email renvoyé !");
    } catch {
      toast.error("Échec de l'envoi, réessaie plus tard.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell bear={{ cheer: 1 }}>
      <div className="auth-done" role="status">
        <h1 id="auth-title">Confirmez votre inscription</h1>
        <p>
          Un email de confirmation vient d&apos;être envoyé{email ? <> à <strong>{email}</strong></> : null}. Cliquez sur le lien qu&apos;il
          contient pour activer votre compte. Pensez à vérifier vos courriers indésirables (spams) si vous ne le voyez pas d&apos;ici quelques minutes.
        </p>
        <Button type="button" className="auth-submit" onClick={handleResend} disabled={sending || !email}>
          {sending ? <><Loader2 className="animate-spin" /> Envoi…</> : "Renvoyer l'email"}
        </Button>
        <Button variant="framed" asChild><Link href="/auth/login">Retour à la connexion</Link></Button>
      </div>
    </AuthShell>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  );
}
