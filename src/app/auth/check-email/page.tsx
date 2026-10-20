"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { MailCheck, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";

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
    <div className="rounded-2xl border-[1.5px] border-foreground bg-card p-6 shadow-[6px_6px_0_var(--foreground)] sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full border-[1.5px] border-foreground flex items-center justify-center mx-auto mb-5">
            <MailCheck className="w-7 h-7 text-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-2">Confirmez votre inscription</h1>
          <p className="text-muted text-sm mb-1">
            Un email de confirmation vient d&apos;être envoyé à
          </p>
          {email && <p className="text-foreground font-medium text-sm mb-4">{email}</p>}
          <p className="text-muted text-sm mb-6">
            Cliquez sur le lien qu&apos;il contient pour activer votre compte. Pensez à vérifier
            vos courriers indésirables (spams) si vous ne le voyez pas d&apos;ici quelques minutes.
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={sending || !email}
            className="btn-ink w-full mb-4"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi...
              </>
            ) : (
              "Renvoyer l'email"
            )}
          </button>

          <Link href="/auth/login" className="text-sm font-semibold text-foreground underline underline-offset-4">
            Retour à la connexion
          </Link>
        </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  );
}
