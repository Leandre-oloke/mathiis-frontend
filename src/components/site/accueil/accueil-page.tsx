"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock } from "lucide-react";
import { DemoGenerateur } from "./demo-generateur";

const NAV = [
  { href: "#demonstration", label: "Démo" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#matieres", label: "Matières" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
];

const TOOLS = [
  { title: "Création par IA", text: "Un thème, un niveau, une matière : des épreuves structurées et cohérentes." },
  { title: "Import de documents", text: "Partez de vos PDF, Word ou textes et obtenez un corrigé détaillé." },
  { title: "Export PDF soigné", text: "Une mise en page professionnelle, avec ou sans corrigé." },
  { title: "Des questions variées", text: "QCM, vrai ou faux, questions ouvertes, textes à trous." },
  { title: "Un espace privé", text: "Vos documents restent dans un espace sécurisé, à vous seul." },
  { title: "Création en temps réel", text: "Suivez l’épreuve prendre forme, question après question." },
];

const SUBJECTS = [
  { symbol: "∑", name: "Mathématiques", topics: [["Pythagore", "4e"], ["Fonctions affines", "2nde"], ["Probabilités", "1ère"]] },
  { symbol: "⚛", name: "PCT", topics: [["Loi d’Ohm", "3e"], ["Masse volumique", "5e"], ["Mouvement uniforme", "2nde"]] },
  { symbol: "❋", name: "SVT", topics: [["La cellule", "6e"], ["Photosynthèse", "4e"], ["Écosystèmes", "2nde"]] },
];

const STEPS = [
  { title: "Donnez le point de départ", text: "Choisissez la matière, la classe et les notions à évaluer." },
  { title: "L’IA prend le relais", text: "L’épreuve prend forme sous vos yeux, avec son corrigé détaillé." },
  { title: "À vous de transmettre", text: "Exportez en PDF, prêt pour votre classe ou vos révisions." },
];

function Logo() {
  return (
    <Link href="/" className="ra-brand" aria-label="Mathiis, accueil">
      <span className="ra-logo" aria-hidden="true">M</span>
      <span><strong>Mathiis</strong><small>Au service de l’éducation béninoise</small></span>
    </Link>
  );
}

/** Public home page, redesigned after « Mathiis — Refonte accueil » (cream, navy, indigo, yellow and brick red). */
export function AccueilPage() {
  return (
    <div className="ra">
      <header className="ra-header">
        <div className="ra-shell ra-header-inner">
          <Logo />
          <nav className="ra-nav" aria-label="Navigation principale">{NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</nav>
          <div className="ra-header-actions">
            <Link href="/auth/login" className="ra-btn ra-btn-ghost ra-btn-sm">Connexion</Link>
            <Link href="/auth/register" className="ra-btn ra-btn-primary ra-btn-sm">Commencer</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="ra-hero">
          <div className="ra-shell ra-hero-grid">
            <div>
              <span className="ra-tag ra-mono">Générateur d’épreuves · Programme officiel du Bénin</span>
              <h1 className="ra-serif">Votre épreuve <em className="ra-mark">et son corrigé</em>, prêts en moins d’une minute.</h1>
              <p className="ra-hero-lead">Choisissez la classe et les notions du programme. Mathiis rédige l’épreuve de mathématiques, de PCT ou de SVT, avec un corrigé détaillé prêt à exporter en PDF.</p>
              <div className="ra-hero-actions">
                <Link href="/auth/register" className="ra-btn ra-btn-primary">Commencer gratuitement <ArrowRight /></Link>
                <a href="#demonstration" className="ra-btn ra-btn-ghost">Voir la démo</a>
              </div>
              <div className="ra-checks">
                <span><Check /> Inscription gratuite</span>
                <span><Check /> Enseignants et élèves</span>
                <span><Check /> De la 6e à la Terminale</span>
              </div>
            </div>
            <div className="ra-paper-stack">
              <article className="ra-paper" aria-label="Exemple d’épreuve">
                <div className="ra-paper-head"><span>CLASSE : TLE D<br />DURÉE : 4H00</span><span>MATHÉMATIQUES<br />COEF. —</span></div>
                <h3>Épreuve de mathématiques</h3>
                <p className="ra-paper-sub">SA1 · Configurations de l’espace</p>
                <p className="ra-paper-label">PROBLÈME 1 — Barycentre</p>
                <p>Soit A, B, C trois points non alignés. Déterminer le barycentre G de {"{"}(A ; 1), (B ; 2), (C ; 1){"}"}.</p>
                <div className="ra-corrige">
                  <small>CORRIGÉ</small>
                  <p>G = bar{"{"}(A,1),(B,2),(C,1){"}"} ⇔ 4 AG→ = 2 AB→ + AC→</p>
                </div>
                <p className="ra-paper-label">PROBLÈME 2 — Droites et plans</p>
                <p>Montrer que la droite (D) est parallèle au plan (P) d’équation x − 2y + z = 3.</p>
                <div className="ra-paper-ghost" aria-hidden="true"><i /><i /></div>
                <div className="ra-paper-foot"><span><Clock /> Générée en 48 s</span><span className="ra-pill-ink">PDF prêt</span></div>
              </article>
            </div>
          </div>
        </section>

        <section className="ra-band" aria-label="Mathiis en chiffres">
          <div className="ra-shell ra-band-inner">
            <p className="ra-band-intro">Moins de tâches répétitives. <em>Plus de place pour enseigner.</em></p>
            <div className="ra-band-stat"><strong>&lt; 60 s</strong><span>pour générer une épreuve</span></div>
            <div className="ra-band-stat"><strong>20+</strong><span>questions par épreuve</span></div>
            <div className="ra-band-stat"><strong>5</strong><span>types de questions</span></div>
          </div>
        </section>

        <section className="ra-section" id="approche">
          <div className="ra-shell">
            <div className="ra-split">
              <h2 className="ra-serif ra-h2">Pas juste de l’IA. <em>Une longueur d’avance</em> — l’expertise reste la vôtre.</h2>
              <p className="ra-lead">Préparer une épreuve demande du temps et de la précision. Mathiis vous accompagne de la première question au corrigé final.</p>
            </div>
            <div className="ra-cards">
              <article className="ra-card">
                <span className="ra-mono">01 / Créer</span>
                <h3>Une idée. Une épreuve. Votre signature.</h3>
                <p>Une matière, un niveau, un thème : donnez le point de départ et gardez la main sur le contenu.</p>
                <div className="ra-card-foot"><span className="ra-chip-idea">› Équations du premier degré</span></div>
              </article>
              <article className="ra-card">
                <span className="ra-mono">02 / Corriger</span>
                <h3>Chaque question. Chaque réponse. Au clair.</h3>
                <p>Un corrigé détaillé, étape par étape, pour vous concentrer sur l’essentiel : transmettre.</p>
                <div className="ra-card-foot"><span className="ra-formula">2x + 6 = 14 ⇒ x = 4 ✓</span></div>
              </article>
              <article className="ra-card">
                <span className="ra-mono">03 / Exporter</span>
                <h3>Un PDF soigné, prêt pour la classe.</h3>
                <p>Une mise en page professionnelle, avec ou sans corrigé, à imprimer ou à partager.</p>
                <div className="ra-card-foot ra-files"><span className="ra-file ink">Épreuve.pdf</span><span className="ra-file">Corrigé.pdf</span></div>
              </article>
            </div>
          </div>
        </section>

        <section className="ra-demo-section" id="demonstration">
          <div className="ra-shell"><DemoGenerateur /></div>
        </section>

        <section className="ra-section" id="fonctionnalites">
          <div className="ra-shell">
            <span className="ra-mono">Un espace. Tous vos outils.</span>
            <h2 className="ra-serif ra-h2" style={{ marginTop: 8 }}>Tout pour vos épreuves. <em className="ra-soft">Rien pour vous ralentir.</em></h2>
            <div className="ra-tools">
              {TOOLS.map((t, i) => <article className="ra-tool" key={t.title}><span>0{i + 1}</span><h3>{t.title}</h3><p>{t.text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="ra-subjects-band" id="matieres">
          <div className="ra-shell ra-subjects-grid">
            <div>
              <span className="ra-mono">Matières disponibles</span>
              <h2 className="ra-serif ra-h2" style={{ marginTop: 8 }}>Trois matières pour commencer. <em>D’autres arrivent.</em></h2>
              <p className="ra-lead" style={{ marginTop: 14 }}>Des classes de 6e à la Terminale (séries AB, C et D), alignées sur le programme officiel.</p>
            </div>
            <div className="ra-subject-cards">
              {SUBJECTS.map((s) => (
                <article className="ra-subject-card" key={s.name}>
                  <i aria-hidden="true">{s.symbol}</i>
                  <h3>{s.name}</h3>
                  <ul>{s.topics.map(([t, c]) => <li key={t}><span>{t}</span><span>{c}</span></li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ra-section" id="comment-ca-marche">
          <div className="ra-shell">
            <h2 className="ra-serif ra-h2">Trois étapes. <em className="ra-soft">Et vous êtes prêt.</em></h2>
            <div className="ra-steps-grid">
              {STEPS.map((s, i) => <article className="ra-step" key={s.title}><b>{i + 1}</b><h3>{s.title}</h3><p>{s.text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="ra-shell" aria-label="Commencer">
          <div className="ra-cta">
            <div>
              <span className="ra-mono">Votre prochaine épreuve commence ici</span>
              <h2>Moins de préparation.<br /><em>Plus de transmission.</em></h2>
            </div>
            <Link href="/auth/register" className="ra-btn ra-btn-yellow">Commencer gratuitement <ArrowRight /></Link>
          </div>
        </section>
      </main>

      <footer className="ra-footer">
        <div className="ra-shell">
          <div className="ra-footer-top">
            <div>
              <strong>Mathiis</strong>
              <p>Le générateur d’épreuves des enseignants et des élèves : l’épreuve et son corrigé, prêts en moins d’une minute.</p>
            </div>
            <nav aria-label="Produit"><h4>Produit</h4><a href="#demonstration">Démo</a><a href="#fonctionnalites">Fonctionnalités</a><a href="#comment-ca-marche">Comment ça marche</a></nav>
            <nav aria-label="Matières"><h4>Matières</h4><a href="#matieres">Mathématiques</a><a href="#matieres">PCT</a><a href="#matieres">SVT</a></nav>
            <nav aria-label="Compte"><h4>Compte</h4><Link href="/auth/login">Connexion</Link><Link href="/auth/register">Créer un compte</Link></nav>
            <nav aria-label="Mathiis"><h4>Mathiis</h4><Link href="/a-propos">À propos</Link><Link href="/contact">Contact</Link></nav>
          </div>
          <div className="ra-wordmark" aria-hidden="true">Mathiis</div>
          <p className="ra-legal">© {new Date().getFullYear()} Mathiis · Au service de l’enseignement, au Bénin.</p>
        </div>
      </footer>
    </div>
  );
}
