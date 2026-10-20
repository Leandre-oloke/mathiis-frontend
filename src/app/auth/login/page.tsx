"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import GoogleButton from "@/components/auth/GoogleButton";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const resendVerification = useAuthStore((s) => s.resendVerification);
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setUnverifiedEmail(null);
    try {
      await login(data.email, data.password);
      toast.success("Connexion réussie !");
      router.push("/dashboard");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string | { code?: string; message?: string } } } })
        ?.response?.data?.detail;
      if (typeof detail === "object" && detail?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(data.email);
        toast.error(detail.message || "Email non vérifié");
      } else {
        toast.error((typeof detail === "string" && detail) || "Identifiants incorrects");
      }
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    try {
      await resendVerification(unverifiedEmail);
      toast.success("Email de vérification renvoyé, vérifie ta boîte mail.");
    } catch {
      toast.error("Échec de l'envoi, réessaie plus tard.");
    }
  };

  return (
    <div className="rounded-2xl border-[1.5px] border-foreground bg-card p-6 shadow-[6px_6px_0_var(--foreground)] sm:p-8">
          <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Bon retour !</h1>
          <p className="text-muted text-sm mb-8">Connectez-vous à votre compte</p>

          <div className="mb-6">
            <GoogleButton />
          </div>

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Mot de passe
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold underline-offset-4 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
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
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {unverifiedEmail && (
            <button
              type="button"
              onClick={handleResend}
              className="mt-4 w-full text-center text-sm font-semibold text-foreground underline underline-offset-4"
            >
              Renvoyer l&apos;email de vérification
            </button>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="font-semibold text-foreground underline underline-offset-4">
              S&apos;inscrire gratuitement
            </Link>
          </p>
        </div>
  );
}
