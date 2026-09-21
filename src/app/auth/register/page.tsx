"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Sparkles, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
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

type ApiValidationIssue = {
  msg?: string;
};

type RegistrationApiError = {
  code?: string;
  response?: {
    data?: {
      detail?: string | { message?: string } | ApiValidationIssue[];
      message?: string;
    };
  };
};

function getRegistrationErrorMessage(err: unknown): string {
  const apiError = err as RegistrationApiError;

  if (!apiError.response || apiError.code === "ERR_NETWORK") {
    return "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.";
  }

  const { detail, message } = apiError.response.data ?? {};

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const validationMessages = detail
      .map((issue) => issue.msg)
      .filter((issue): issue is string => Boolean(issue));

    if (validationMessages.length > 0) return validationMessages.join(" ");
  }
  if (detail && typeof detail === "object" && detail.message) return detail.message;
  if (message) return message;

  return "La création du compte a échoué. Vérifiez les informations saisies puis réessayez.";
}

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
      toast.error(getRegistrationErrorMessage(err));
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

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Créer un compte</h1>
          <p className="text-slate-500 text-sm mb-8">Commencez à générer vos épreuves</p>

          <div className="mb-6">
            <GoogleButton />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...fullNameField}
                  onChange={(e) => {
                    fullNameField.onChange(e);
                    if (!usernameTouched.current) {
                      setValue("username", slugifyUsername(e.target.value), { shouldValidate: false });
                    }
                  }}
                  placeholder="Jacob"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom d&apos;utilisateur</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                <input
                  {...usernameField}
                  onChange={(e) => {
                    usernameTouched.current = true;
                    e.target.value = slugifyUsername(e.target.value);
                    usernameField.onChange(e);
                  }}
                  placeholder="jean_dupont"
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Généré automatiquement à partir de votre nom, modifiable si besoin.</p>
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 caractères"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Création...</>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-indigo-600 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
