"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RaFooter, RaHeader } from "./accueil-page";
import { DemoGenerateur } from "./demo-generateur";

/** Page publique /demo : la démonstration interactive, sortie de la page d'accueil. */
export function DemoPage() {
  return (
    <div className="ra">
      <RaHeader />
      <main>
        <section className="ra-demo-intro">
          <div className="ra-shell">
            <Link href="/" className="ra-back"><ArrowLeft /> Retour à l’accueil</Link>
            <span className="ra-demo-eyebrow">Démonstration interactive, sans inscription</span>
            <h1 className="ra-serif">Essayez Mathiis, <em className="ra-mark">comme dans votre espace</em>.</h1>
            <p className="ra-lead">Choisissez une matière, une classe et des notions du programme, puis lancez la génération. Créez ensuite votre compte pour obtenir l’épreuve complète et son corrigé.</p>
          </div>
        </section>

        <section className="ra-demo-section">
          <div className="ra-shell"><DemoGenerateur /></div>
        </section>

        <section className="ra-shell" aria-label="Commencer">
          <div className="ra-cta">
            <div>
              <span className="ra-mono">Votre prochaine épreuve commence ici</span>
              <h2>Convaincu ?<br /><em>Générez la vôtre.</em></h2>
            </div>
            <Link href="/auth/register" className="ra-btn ra-btn-yellow">Commencer gratuitement <ArrowRight /></Link>
          </div>
        </section>
      </main>
      <RaFooter />
    </div>
  );
}
