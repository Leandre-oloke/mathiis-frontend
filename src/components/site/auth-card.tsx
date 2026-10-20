"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { AtSign, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoogleButton from "@/components/auth/GoogleButton";
import { useAuthStore } from "@/store/auth";
import { KofiBear, type KofiProps } from "./kofi-bear";
import { BrandMark } from "./brand-mark";

/** The /auth frame of the template: brand, a card topped by the bear, and the mascot credit (CC BY 4.0). */
export function AuthShell({ children, bear, labelledBy = "auth-title" }: { children: ReactNode; bear?: KofiProps; labelledBy?: string }) {
  return (
    <main className="auth-page">
      <Link href="/" className="brand auth-brand"><BrandMark />Mathiis</Link>
      <section className="auth-card" aria-labelledby={labelledBy}>
        <KofiBear className="auth-kofi" {...bear} />
        {children}
      </section>
      <p className="kofi-credit auth-credit">
        Mascotte : <a href="https://rive.app/marketplace/3469-7899-login-screen-character/" target="_blank" rel="noopener">« login-screen-character » par JcToon</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> · recadré
      </p>
    </main>
  );
}

export function AuthHead({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return <header className="auth-head"><h1 id="auth-title">{title}</h1>{subtitle && <p>{subtitle}</p>}</header>;
}

export function FieldRow({ id, label, icon, hint, error, aside, children }: { id: string; label: string; icon: ReactNode; hint?: string; error?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="auth-field">
      <div className="auth-label-row"><label htmlFor={id}>{label}</label>{aside}</div>
      <div className="auth-input">{icon}{children}</div>
      {hint && <p className="auth-hint">{hint}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
    </div>
  );
}

/** Eye toggle shared by the password fields. */
export function RevealButton({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon" className="auth-eye" aria-label={shown ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={shown} onMouseDown={(e) => e.preventDefault()} onClick={onToggle}>
      {shown ? <EyeOff /> : <Eye />}
    </Button>
  );
}

type Field = "name" | "username" | "email" | "password" | null;

/** The bear reads along the text being typed and covers his eyes while the password field is in use. */
function useBear() {
  const [focus, setFocus] = useState<Field>(null);
  const [cheer, setCheer] = useState(0);
  const [frown, setFrown] = useState(0);
  const watch = (field: Exclude<Field, null>) => ({ onFocus: () => setFocus(field), onBlurCapture: () => setFocus(null) });
  const props = (typed: string): KofiProps => ({
    look: focus && focus !== "password" ? Math.min(90, 8 + typed.length * 2.4) : undefined,
    handsUp: focus === "password",
    cheer,
    frown,
  });
  return { focus, watch, props, happy: () => setCheer((n) => n + 1), sad: () => setFrown((n) => n + 1) };
}

const detailOf = (err: unknown) => (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;

// ── Connexion ────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
type LoginData = z.infer<typeof loginSchema>;

export function LoginCard() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const resendVerification = useAuthStore((s) => s.resendVerification);
  const [reveal, setReveal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const bear = useBear();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const email = watch("email") ?? "";

  const onSubmit = async (data: LoginData) => {
    setUnverifiedEmail(null);
    try {
      await login(data.email, data.password);
      bear.happy();
      toast.success("Connexion réussie !");
      router.push("/dashboard");
    } catch (err) {
      bear.sad();
      const detail = detailOf(err) as string | { code?: string; message?: string } | undefined;
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
    <AuthShell bear={bear.props(email)}>
      <AuthHead title="Bon retour !" subtitle="Connectez-vous à votre compte" />
      <GoogleButton />
      <form className="auth-form" onSubmit={handleSubmit(onSubmit, () => bear.sad())} noValidate>
        <FieldRow id="auth-email" label="Adresse email" icon={<Mail />} error={errors.email?.message}>
          <input id="auth-email" type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.com" {...register("email")} {...bear.watch("email")} />
        </FieldRow>
        <FieldRow id="auth-password" label="Mot de passe" icon={<Lock />} error={errors.password?.message} aside={<Link className="auth-link" href="/auth/forgot-password">Mot de passe oublié ?</Link>}>
          <input id="auth-password" type={reveal ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" {...register("password")} {...bear.watch("password")} />
          <RevealButton shown={reveal} onToggle={() => setReveal(!reveal)} />
        </FieldRow>
        <Button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="animate-spin" /> Connexion…</> : "Se connecter"}
        </Button>
      </form>
      {unverifiedEmail && (
        <Button type="button" variant="framed" className="auth-back" onClick={handleResend}>Renvoyer l&apos;email de vérification</Button>
      )}
      <p className="auth-switch">Pas encore de compte ? <Link href="/auth/register">S’inscrire gratuitement</Link></p>
    </AuthShell>
  );
}

// ── Inscription ──────────────────────────────────────────────────────────────
// "Jean Dupont" → "jean_dupont": no accents, nothing outside [a-z0-9_-], so the field never fails validation.
export function slugifyUsername(input: string): string {
  return input
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}

const registerSchema = z.object({
  full_name: z.string().min(2, "Nom requis (min. 2 caractères)"),
  username: z.string().min(3, "Nom d'utilisateur : min. 3 caractères").regex(/^[a-zA-Z0-9_-]+$/, "Caractères alphanumériques, _ ou - uniquement"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});
type RegisterData = z.infer<typeof registerSchema>;

export function RegisterCard() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.register);
  const [reveal, setReveal] = useState(false);
  const [usernameEdited, setUsernameEdited] = useState(false);
  const bear = useBear();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });
  const values = watch();
  const typed = bear.focus === "name" ? values.full_name : bear.focus === "username" ? values.username : values.email;
  const fullName = register("full_name");
  const username = register("username");

  const onSubmit = async (data: RegisterData) => {
    try {
      await signUp(data);
      bear.happy();
      router.push(`/auth/check-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      bear.sad();
      const detail = detailOf(err);
      toast.error((typeof detail === "string" && detail) || "Erreur lors de la création du compte");
    }
  };

  return (
    <AuthShell bear={bear.props(typed ?? "")}>
      <AuthHead title="Créer un compte" subtitle="Commencez à générer vos épreuves" />
      <GoogleButton />
      <form className="auth-form" onSubmit={handleSubmit(onSubmit, () => bear.sad())} noValidate>
        <FieldRow id="auth-name" label="Nom complet" icon={<User />} error={errors.full_name?.message}>
          <input id="auth-name" autoComplete="name" placeholder="Jacob" {...fullName} {...bear.watch("name")}
            onChange={(e) => { void fullName.onChange(e); if (!usernameEdited) setValue("username", slugifyUsername(e.target.value)); }} />
        </FieldRow>
        <FieldRow id="auth-username" label="Nom d’utilisateur" icon={<AtSign />} hint="Généré automatiquement à partir de votre nom, modifiable si besoin." error={errors.username?.message}>
          <input id="auth-username" autoComplete="username" placeholder="jean_dupont" {...username} {...bear.watch("username")}
            onChange={(e) => { setUsernameEdited(true); e.target.value = slugifyUsername(e.target.value); void username.onChange(e); }} />
        </FieldRow>
        <FieldRow id="auth-email" label="Adresse email" icon={<Mail />} error={errors.email?.message}>
          <input id="auth-email" type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.com" {...register("email")} {...bear.watch("email")} />
        </FieldRow>
        <FieldRow id="auth-password" label="Mot de passe" icon={<Lock />} error={errors.password?.message}>
          <input id="auth-password" type={reveal ? "text" : "password"} autoComplete="new-password" placeholder="Minimum 8 caractères" {...register("password")} {...bear.watch("password")} />
          <RevealButton shown={reveal} onToggle={() => setReveal(!reveal)} />
        </FieldRow>
        <Button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="animate-spin" /> Création…</> : "Créer mon compte"}
        </Button>
      </form>
      <p className="auth-switch">Déjà un compte ? <Link href="/auth/login">Se connecter</Link></p>
    </AuthShell>
  );
}
