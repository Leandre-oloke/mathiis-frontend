"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AuthHead, AuthShell, FieldRow, RevealButton } from "@/components/site/auth-card";

const schema = z
  .object({
    new_password: z.string().min(8, "Minimum 8 caractères"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [typing, setTyping] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/auth/reset-password", { token, new_password: data.new_password });
      toast.success("Mot de passe mis à jour, vous pouvez vous connecter.");
      router.push("/auth/login");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Lien invalide ou expiré. Refaites une demande.";
      toast.error(message);
    }
  };

  const watch = { onFocus: () => setTyping(true), onBlurCapture: () => setTyping(false) };

  return (
    <AuthShell bear={{ handsUp: typing }}>
      <AuthHead title="Nouveau mot de passe" subtitle="Choisissez un nouveau mot de passe pour votre compte." />
      {!token ? (
        <p className="auth-error" role="alert">
          Lien invalide. <Link href="/auth/forgot-password" className="auth-link">Refaites une demande</Link>.
        </p>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldRow id="auth-new-password" label="Nouveau mot de passe" icon={<Lock />} error={errors.new_password?.message}>
            <input id="auth-new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Minimum 8 caractères" {...register("new_password")} {...watch} />
            <RevealButton shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </FieldRow>
          <FieldRow id="auth-confirm-password" label="Confirmer le mot de passe" icon={<Lock />} error={errors.confirm_password?.message}>
            <input id="auth-confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" {...register("confirm_password")} {...watch} />
          </FieldRow>
          <Button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="animate-spin" /> Mise à jour…</> : "Mettre à jour"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
