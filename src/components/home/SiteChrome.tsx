import Link from "next/link";
import { ArrowRight, ArrowUp } from "lucide-react";
import { Brand } from "@/components/brand/BrandMark";

const NAV = [
  { href: "#exemple", label: "Exemple" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#matieres", label: "Matières" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
];

/** Public header: brand, anchor navigation in an ink-framed pill, sign-in and sign-up. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Accueil Mathiis"><Brand /></Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 rounded-full border-[1.5px] border-foreground bg-card p-1 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="hidden px-3 text-sm font-semibold underline-offset-4 hover:underline sm:inline">Connexion</Link>
          <Link href="/auth/register" className="btn-ink h-10 px-4">Commencer</Link>
        </div>
      </div>
    </header>
  );
}

/** Public footer: pitch, link columns, a large outlined wordmark and the legal line. */
export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-10 pt-20 sm:px-6 lg:grid-cols-[1.2fr_2fr] lg:px-8">
        <div className="max-w-sm space-y-6">
          <Brand className="text-background" />
          <p className="text-[15px] leading-relaxed text-background/70">
            Le générateur d’épreuves des enseignants et des élèves : préparer un devoir ou s’entraîner, avec l’épreuve et son corrigé.
          </p>
          <Link href="/auth/register" className="inline-flex h-11 items-center gap-2 rounded-xl bg-background px-5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-px">
            Commencer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <nav aria-label="Pied de page" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/50">Produit</h3>
            {NAV.map((n) => <a key={n.href} href={n.href} className="block text-sm text-background/80 hover:text-background">{n.label}</a>)}
          </div>
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/50">Matières</h3>
            {["Mathématiques", "PCT", "SVT"].map((s) => <a key={s} href="#matieres" className="block text-sm text-background/80 hover:text-background">{s}</a>)}
            <span className="block text-sm italic text-background/50">D’autres arrivent</span>
          </div>
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/50">Compte</h3>
            <Link href="/auth/login" className="block text-sm text-background/80 hover:text-background">Connexion</Link>
            <Link href="/auth/register" className="block text-sm text-background/80 hover:text-background">Créer un compte</Link>
            <Link href="/auth/forgot-password" className="block text-sm text-background/80 hover:text-background">Mot de passe oublié</Link>
          </div>
        </nav>
      </div>
      <div className="footer-wordmark mx-auto max-w-7xl select-none px-4" aria-hidden="true">Mathiis</div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-background/15 px-4 py-6 text-xs text-background/60 sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Mathiis · Au service de l’enseignement, au Bénin.</p>
        <a href="#haut" className="inline-flex items-center gap-1.5 rounded-full border border-background/40 px-3 py-1.5 font-semibold text-background hover:bg-background hover:text-foreground">
          Haut de page <ArrowUp className="h-3.5 w-3.5" />
        </a>
      </div>
    </footer>
  );
}
