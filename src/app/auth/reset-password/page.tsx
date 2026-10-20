"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

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

  return (
    <div className="rounded-2xl border-[1.5px] border-foreground bg-card p-6 shadow-[6px_6px_0_var(--foreground)] sm:p-8">
          <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Nouveau mot de passe</h1>
          <p className="text-muted text-sm mb-8">Choisissez un nouveau mot de passe pour votre compte.</p>

          {!token ? (
            <p className="text-sm text-red-600">
              Lien invalide. Refaites une demande depuis la page{" "}
              <Link href="/auth/forgot-password" className="underline font-medium">
                mot de passe oublié
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    {...register("new_password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    className="w-full pl-10 pr-10 h-11 rounded-xl border-[1.5px] border-foreground/25 bg-card text-sm outline-none transition focus:border-foreground focus:shadow-[var(--shadow-ink)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="mt-1 text-xs text-red-600">{errors.new_password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    {...register("confirm_password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 h-11 rounded-xl border-[1.5px] border-foreground/25 bg-card text-sm outline-none transition focus:border-foreground focus:shadow-[var(--shadow-ink)]"
                  />
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>
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
                    Mise à jour...
                  </>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </button>
            </form>
          )}
        </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
