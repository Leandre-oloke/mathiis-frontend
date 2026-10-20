"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AuthHead, AuthShell, FieldRow } from "@/components/site/auth-card";

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

  if (sent) {
    return (
      <AuthShell bear={{ cheer: 1 }}>
        <div className="auth-done" role="status">
          <h1 id="auth-title">Email envoyé</h1>
          <p>Si un compte existe avec cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe.</p>
          <Button asChild className="auth-submit"><Link href="/auth/login"><ArrowLeft /> Retour à la connexion</Link></Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthHead title="Mot de passe oublié" subtitle="Entrez votre email pour recevoir un lien de réinitialisation." />
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldRow id="auth-email" label="Adresse email" icon={<Mail />} error={errors.email?.message}>
          <input id="auth-email" type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.com" {...register("email")} />
        </FieldRow>
        <Button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="animate-spin" /> Envoi…</> : "Envoyer le lien"}
        </Button>
      </form>
      <p className="auth-switch"><Link href="/auth/login">Retour à la connexion</Link></p>
    </AuthShell>
  );
}
