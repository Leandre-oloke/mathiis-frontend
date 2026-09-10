"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Sparkles, MailCheck, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl">Mathiis</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <MailCheck className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Confirmez votre inscription</h1>
          <p className="text-slate-500 text-sm mb-1">
            Un email de confirmation vient d&apos;être envoyé à
          </p>
          {email && <p className="text-slate-900 font-medium text-sm mb-4">{email}</p>}
          <p className="text-slate-500 text-sm mb-6">
            Cliquez sur le lien qu&apos;il contient pour activer votre compte. Pensez à vérifier
            vos courriers indésirables (spams) si vous ne le voyez pas d&apos;ici quelques minutes.
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={sending || !email}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-4"
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

          <Link href="/auth/login" className="text-sm text-indigo-600 font-medium hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
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
