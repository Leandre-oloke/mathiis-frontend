"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import GoogleButton from "@/components/auth/GoogleButton";
import { MathiisBrand } from "@/components/layout/MathiisBrand";

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
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8ff] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#071a3d] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-16 right-12 h-64 w-64 rounded-full border border-white/10" />
        <Link href="/" className="relative inline-flex w-fit"><MathiisBrand /></Link>
        <div className="relative max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100 backdrop-blur">
            <Sparkles className="h-4 w-4 text-cyan-300" /> L&apos;évaluation réinventée par l&apos;IA
          </span>
          <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-[-0.04em] xl:text-6xl">
            Créez des évaluations qui font vraiment <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">progresser.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">Mathiis transforme vos objectifs pédagogiques en épreuves claires, exigeantes et adaptées à chaque niveau.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {["Programmes officiels intégrés", "Épreuves et corrigés en quelques minutes", "Exports PDF et Word", "Pensé pour les enseignants"].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-sm font-medium text-slate-200"><CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" />{benefit}</div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-slate-400"><ShieldCheck className="h-5 w-5 text-emerald-300" />Vos contenus pédagogiques restent protégés.</div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="absolute right-[-10rem] top-[-9rem] h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-[-9rem] left-[-7rem] h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="relative w-full max-w-lg">
          <Link href="/" className="mb-8 inline-flex lg:hidden"><MathiisBrand theme="light" /></Link>

          <div className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-2xl shadow-slate-300/45 backdrop-blur-xl sm:p-9">
          <h2 className="text-3xl font-black tracking-tight text-[#071a3d] sm:text-4xl">Heureux de vous revoir</h2>
          <p className="mb-8 mt-2 text-sm leading-relaxed text-slate-500">Connectez-vous pour retrouver vos épreuves et continuer à faire progresser vos élèves.</p>

          <div className="mb-6">
            <GoogleButton />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#071a3d]">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="vous@exemple.com"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-12 pr-4 text-sm outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-bold text-[#071a3d]">
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
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-12 pr-12 text-sm outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>Se connecter <ArrowRight className="h-4 w-4" /></>
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

          <p className="mt-7 text-center text-sm text-slate-500">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-indigo-600 font-medium hover:underline">
              S&apos;inscrire gratuitement
            </Link>
          </p>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">En continuant, vous acceptez les conditions d&apos;utilisation et la politique de confidentialité de Mathiis.</p>
        </div>
      </section>
    </main>
  );
}
