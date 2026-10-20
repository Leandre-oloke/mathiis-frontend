"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import GoogleButton from "@/components/auth/GoogleButton";

// Transforme "Jean Dupont" -> "jean_dupont" : enlève les accents et tout
// caractère hors [a-z0-9_-], pour que le champ se remplisse tout seul et
// n'échoue jamais la validation à cause d'un espace ou d'un accent oublié.
function slugifyUsername(input: string): string {
  return input
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}

const schema = z.object({
  full_name: z.string().min(2, "Nom requis (min. 2 caractères)"),
  username: z.string().min(3, "Nom d'utilisateur: min. 3 caractères").regex(/^[a-zA-Z0-9_-]+$/, "Caractères alphanumériques, _ ou - uniquement"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const register_ = useAuthStore((s) => s.register);
  const [showPassword, setShowPassword] = useState(false);
  // Tant que l'utilisateur n'a pas modifié le champ à la main, on le
  // pré-remplit automatiquement à partir du nom complet.
  const usernameTouched = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fullNameField = register("full_name");
  const usernameField = register("username");

  const onSubmit = async (data: FormData) => {
    try {
      await register_(data);
      router.push(`/auth/check-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Erreur lors de la création du compte";
      toast.error(message);
    }
  };

  return (
    <div className="rounded-2xl border-[1.5px] border-foreground bg-card p-6 shadow-[6px_6px_0_var(--foreground)] sm:p-8">
          <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Créer un compte</h1>
          <p className="text-muted text-sm mb-8">Commencez à générer vos épreuves</p>

          <div className="mb-6">
            <GoogleButton />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  {...fullNameField}
                  onChange={(e) => {
                    fullNameField.onChange(e);
                    if (!usernameTouched.current) {
                      setValue("username", slugifyUsername(e.target.value), { shouldValidate: false });
                    }
                  }}
                  placeholder="Jacob"
                  className="w-full pl-10 pr-4 h-11 rounded-xl border-[1.5px] border-foreground/25 bg-card text-sm outline-none transition focus:border-foreground focus:shadow-[var(--shadow-ink)]"
                />
              </div>
              {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nom d&apos;utilisateur</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
                <input
                  {...usernameField}
                  onChange={(e) => {
                    usernameTouched.current = true;
                    e.target.value = slugifyUsername(e.target.value);
                    usernameField.onChange(e);
                  }}
                  placeholder="jean_dupont"
                  className="w-full pl-8 pr-4 h-11 rounded-xl border-[1.5px] border-foreground/25 bg-card text-sm outline-none transition focus:border-foreground focus:shadow-[var(--shadow-ink)]"
                />
              </div>
              <p className="mt-1 text-xs text-muted">Généré automatiquement à partir de votre nom, modifiable si besoin.</p>
              {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 h-11 rounded-xl border-[1.5px] border-foreground/25 bg-card text-sm outline-none transition focus:border-foreground focus:shadow-[var(--shadow-ink)]"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  {...register("password")}
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
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-ink w-full mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Création...</>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="font-semibold text-foreground underline underline-offset-4">
              Se connecter
            </Link>
          </p>
        </div>
  );
}
