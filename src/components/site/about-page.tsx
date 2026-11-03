import Link from "next/link";
import { ArrowRight, BookOpen, FileType2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

const values = [
  { icon: BookOpen, title: "Fidèle au programme", text: "Chaque épreuve suit le programme officiel béninois, classe par classe et matière par matière." },
  { icon: Sparkles, title: "Un gain de temps réel", text: "Moins de temps passé à rédiger, plus de temps pour enseigner et accompagner les élèves." },
  { icon: ShieldCheck, title: "Un espace privé", text: "Vos documents et vos épreuves restent dans votre espace, jamais partagés avec d'autres comptes." },
  { icon: FileType2, title: "Export PDF et Word", text: "Téléchargez votre épreuve et son corrigé au format PDF ou Word, pour les modifier librement avant de les transmettre." },
];

export function AboutPage() {
  return (
    <div className="static-page">
      <SiteHeader />
      <main>
        <section className="static-hero shell">
          <span className="eyebrow">À propos de Mathiis</span>
          <h1>Un assistant pensé pour l’enseignement au Bénin.</h1>
          <p>
            Mathiis est né d’un constat simple : préparer une épreuve de qualité, conforme au programme officiel,
            demande beaucoup de temps aux enseignants. Notre plateforme utilise l’intelligence artificielle pour
            générer des épreuves et leurs corrigés détaillés en quelques secondes, en Mathématiques, en PCT et en
            SVT, tout en laissant l’enseignant garder la main sur le contenu final.
          </p>
        </section>

        <section className="section shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Notre approche</span>
              <h2>Ce qui guide chaque décision.</h2>
            </div>
          </div>
          <div className="tools-grid">
            {values.map((v) => (
              <article className="tool-item" key={v.title}>
                <div className="tool-icon"><v.icon size={19} strokeWidth={1.7} /></div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bottom-cta">
          <div className="shell">
            <span className="eyebrow">Envie d’essayer ?</span>
            <h2>Créez votre première<br />épreuve gratuitement.</h2>
            <div className="cta-actions">
              <Button asChild className="cta-primary magnetic"><Link href="/auth/register">Commencer gratuitement <ArrowRight /></Link></Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
