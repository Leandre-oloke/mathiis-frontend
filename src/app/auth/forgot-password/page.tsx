"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
    }
  };

  return (
    <div className="rounded-2xl border-[1.5px] border-foreground bg-card p-6 shadow-[6px_6px_0_var(--foreground)] sm:p-8">
          {sent ? (
            <>
              <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Email envoyé</h1>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                Si un compte est associé à cette adresse, un lien de réinitialisation vient de vous être envoyé.
                Vérifiez votre boîte mail (et vos spams).
              </p>
              <Link
                href="/auth/login"
                className="btn-ink w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Mot de passe oublié</h1>
              <p className="text-muted text-sm mb-8">
                Entrez votre email, nous vous enverrons un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="vous@exemple.com"
                      className="w-full pl-10 pr-4 h-11 rounded-xl border-[1.5px] border-foreground/25 bg-card text-sm outline-none transition focus:border-foreground focus:shadow-[var(--shadow-ink)]"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-ink w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                <Link href="/auth/login" className="font-semibold text-foreground underline underline-offset-4">
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
  );
}
