"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Sparkles, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl">Mathiis</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Bon retour !</h1>
          <p className="text-slate-500 text-sm mb-8">Connectez-vous à votre compte</p>

          <div className="mb-6">
            <GoogleButton />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="mt-4 w-full text-center text-sm text-indigo-600 font-medium hover:underline"
            >
              Renvoyer l&apos;email de vérification
            </button>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-indigo-600 font-medium hover:underline">
              S&apos;inscrire gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
