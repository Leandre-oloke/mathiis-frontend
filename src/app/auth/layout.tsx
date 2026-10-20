import Link from "next/link";
import { Check } from "lucide-react";
import { Brand } from "@/components/brand/BrandMark";

const POINTS = [
  "Épreuves conformes au programme officiel, de la 6e à la Terminale",
  "Corrigés détaillés de vos propres sujets importés",
  "Téléchargement en PDF et Word, prêt à imprimer",
];

/** Two-column frame shared by every /auth page: ink panel on the left, the form on the right. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-12 text-background lg:flex">
        <Link href="/" aria-label="Accueil Mathiis">
          <Brand className="text-background" />
        </Link>

        <div className="max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">Enseignants et élèves</p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl">
            Des épreuves au programme, prêtes à imprimer.
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3 text-[15px] text-background/80">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px] border-background/70">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-background/50">© {new Date().getFullYear()} Mathiis</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex lg:hidden" aria-label="Accueil Mathiis">
            <Brand />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
