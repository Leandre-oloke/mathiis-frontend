"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, Loader2, CheckCircle2, XCircle } from "lucide-react";
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
          {status === "loading" && (
            <>
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Vérification en cours...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 mb-2">Email vérifié !</h1>
              <p className="text-slate-500 text-sm mb-6">{message}</p>
              <Link
                href="/auth/login"
                className="inline-block w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Se connecter
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 mb-2">Échec de la vérification</h1>
              <p className="text-slate-500 text-sm mb-6">{message}</p>
              <Link href="/auth/login" className="text-indigo-600 font-medium hover:underline text-sm">
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </div>
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
