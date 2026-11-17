"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, CheckCheck, FileDown, FileText, Menu, Sparkles, Upload, X } from "lucide-react";
import { BrandMarkColor } from "@/components/site/brand-mark";
import { CurvedMarquee } from "@/components/site/home-motion";
import { MotsMachine, TexteMachine, TitreMachine } from "./titre-machine";

// Liens absolus (« /#… ») : l'en-tête et le pied de page servent aussi sur la
// page /demo, d'où il faut pouvoir revenir vers les sections de l'accueil.
const NAV = [
  { href: "/demo", label: "Démo" },
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#matieres", label: "Matières" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
];

// Les quatre usages de Mathiis, dans l'ordre où on les enchaîne.
const APPROCHE = [
  {
    icon: Sparkles, label: "Créer", title: "Une idée, une épreuve, votre signature.",
    text: "Choisissez la matière, la classe et les notions : Mathiis rédige l’épreuve, et vous gardez la main sur le contenu.",
    foot: <span className="ra-chip-idea">Équations du premier degré · 4e</span>,
  },
  {
    icon: Upload, label: "Importer", title: "Vos propres sujets, pris en charge.",
    text: "Importez un sujet existant en PDF, en Word ou en texte : Mathiis le lit et prépare son corrigé.",
    foot: <span className="ra-chip-file"><FileText /> Sujet_BEPC.pdf <b>Importé</b></span>,
  },
  {
    icon: CheckCheck, label: "Corriger", title: "Chaque question, chaque réponse, au clair.",
    text: "Un corrigé détaillé, étape par étape, pour vous concentrer sur l’essentiel : transmettre.",
    foot: <span className="ra-formula">2x + 6 = 14 ⇒ x = 4 ✓</span>,
  },
  {
    icon: FileDown, label: "Exporter", title: "Un document soigné, prêt pour la classe.",
    text: "Une mise en page professionnelle en PDF ou en Word, avec ou sans corrigé, à imprimer ou à partager.",
    foot: <span className="ra-files"><span className="ra-file ink">Épreuve.pdf</span><span className="ra-file">Corrigé.docx</span></span>,
  },
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
      <BrandMarkColor className="ra-logo" />
      <span><strong>Mathiis</strong><small>Au service de l’éducation béninoise</small></span>
    </Link>
  );
}

/** En-tête commun à l'accueil et à la page /demo. */
export function RaHeader() {
  // Sur téléphone et tablette, le menu passe dans un panneau qui s'ouvre sous
  // la barre (sinon « Démo », « Matières »… et « Connexion » sont inaccessibles).
  const [menu, setMenu] = useState(false);
  const fermer = () => setMenu(false);
  return (
    <header className="ra-header">
      <div className="ra-shell ra-header-inner">
        <Logo />
        <nav className="ra-nav" aria-label="Navigation principale">{NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}</nav>
        <div className="ra-header-actions">
          <Link href="/auth/login" className="ra-btn ra-btn-ghost ra-btn-sm">Connexion</Link>
          <Link href="/auth/register" className="ra-btn ra-btn-primary ra-btn-sm">Commencer</Link>
          <button type="button" className="ra-menu-btn" aria-expanded={menu} aria-controls="ra-menu-mobile" aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenu((v) => !v)}>
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {menu && (
        <div className="ra-menu-mobile" id="ra-menu-mobile">
          <nav className="ra-shell" aria-label="Menu">
            {NAV.map((n) => <Link key={n.href} href={n.href} onClick={fermer}>{n.label}</Link>)}
            <Link href="/auth/login" onClick={fermer}>Connexion</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/** Pied de page commun à l'accueil et à la page /demo. */
export function RaFooter() {
  return (
    <footer className="ra-footer">
      <div className="ra-shell">
        <div className="ra-footer-top">
          <div>
            <strong>Mathiis</strong>
            <p>Le générateur d’épreuves des enseignants et des élèves : l’épreuve et son corrigé, prêts en moins d’une minute.</p>
          </div>
          <nav aria-label="Produit"><h4>Produit</h4><Link href="/demo">Démo</Link><Link href="/#fonctionnalites">Fonctionnalités</Link><Link href="/#comment-ca-marche">Comment ça marche</Link></nav>
          <nav aria-label="Matières"><h4>Matières</h4><Link href="/#matieres">Mathématiques</Link><Link href="/#matieres">PCT</Link><Link href="/#matieres">SVT</Link></nav>
          <nav aria-label="Compte"><h4>Compte</h4><Link href="/auth/login">Connexion</Link><Link href="/auth/register">Créer un compte</Link></nav>
          <nav aria-label="Mathiis"><h4>Mathiis</h4><Link href="/a-propos">À propos</Link><Link href="/contact">Contact</Link></nav>
        </div>
        <div className="ra-wordmark" aria-hidden="true">Mathiis</div>
        <p className="ra-legal">© {new Date().getFullYear()} Mathiis · Au service de l’enseignement, au Bénin.</p>
      </div>
    </footer>
  );
}

/** Public home page, redesigned after « Mathiis, Refonte accueil » (cream, navy, indigo, yellow and brick red). */
export function AccueilPage() {
  return (
    <div className="ra">
      <RaHeader />

      <main>
        {/* Photo en fond de toute la section, texte écrit par-dessus (en blanc, sur un dégradé sombre). */}
        <section className="ra-hero">
          <Image className="ra-hero-bg" src="/Gemini_Generated.jpeg" alt="" fill priority unoptimized />
          <div className="ra-shell ra-hero-content">
            <span className="ra-tag ra-mono">Générateur d’épreuves &amp; Programme officiel du Bénin</span>
            <TitreMachine />
            <p className="ra-hero-lead">Choisissez la classe et les notions du programme. Mathiis rédige l’épreuve de mathématiques, de PCT ou de SVT, avec un corrigé détaillé prêt à exporter en PDF ou Word.</p>
            <div className="ra-hero-actions">
              <Link href="/auth/register" className="ra-btn ra-btn-primary">Commencer gratuitement <ArrowRight /></Link>
              <Link href="/demo" className="ra-btn ra-btn-ghost">Voir la démo</Link>
            </div>
            <div className="ra-checks">
              <span><Check /> Inscription gratuite</span>
              <span><Check /> Enseignants et élèves</span>
              <span><Check /> De la 6e à la Terminale</span>
            </div>
          </div>
        </section>

        <section className="ra-band" aria-label="Mathiis en chiffres">
          <div className="ra-shell ra-band-inner">
            <p className="ra-band-intro">Moins de tâches répétitives, <em>plus de place pour enseigner.</em></p>
            <div className="ra-band-stat"><strong>&lt; 60 s</strong><span>pour générer une épreuve</span></div>
            <div className="ra-band-stat"><strong>20+</strong><span>questions par épreuve</span></div>
            <div className="ra-band-stat"><strong>5</strong><span>types de questions</span></div>
          </div>
        </section>

        {/* Bandeau défilant en vague (même composant que l'ancienne page d'accueil). */}
        <section className="ra-marquee" aria-label="Créer, importer, corriger, exporter, transmettre">
          <CurvedMarquee text="Créer & Importer & Corriger & Exporter & Transmettre" separator=" & " />
        </section>

        <section className="ra-section" id="approche">
          <div className="ra-shell">
            <div className="ra-split">
              <h2 className="ra-serif ra-h2">Pas juste de l’IA, <em>une longueur d’avance</em>, l’expertise reste la vôtre.</h2>
              <TexteMachine className="ra-lead" texte="Préparer une épreuve demande du temps et de la précision. Mathiis vous accompagne de la première question au corrigé final." />
            </div>
            <div className="ra-cards">
              {APPROCHE.map(({ icon: Icon, label, title, text, foot }) => (
                <article className="ra-card" key={label}>
                  <div className="ra-card-head"><span className="ra-card-icon"><Icon /></span><span className="ra-card-label">{label}</span></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <div className="ra-card-foot">{foot}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ra-section" id="fonctionnalites">
          <div className="ra-shell">
            <span className="ra-mono">Un espace, tous vos outils</span>
            <h2 className="ra-serif ra-h2" style={{ marginTop: 8 }}>Tout pour vos épreuves, <em className="ra-soft"><MotsMachine texte="rien pour vous ralentir." /></em></h2>
            <div className="ra-tools">
              {TOOLS.map((t, i) => <article className="ra-tool" key={t.title}><span>0{i + 1}</span><h3>{t.title}</h3><p>{t.text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="ra-subjects-band" id="matieres">
          <div className="ra-shell ra-subjects-grid">
            <div>
              <span className="ra-mono">Matières disponibles</span>
              <h2 className="ra-serif ra-h2" style={{ marginTop: 8 }}>Trois matières pour commencer, <em>d’autres arrivent.</em></h2>
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
            <h2 className="ra-serif ra-h2">Trois étapes, <em className="ra-soft"><MotsMachine texte="et vous êtes prêt." /></em></h2>
            <div className="ra-steps-grid">
              {STEPS.map((s, i) => <article className="ra-step" key={s.title}><b>{i + 1}</b><h3>{s.title}</h3><p>{s.text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="ra-shell" aria-label="Commencer">
          <div className="ra-cta">
            <div>
              <span className="ra-mono">Votre prochaine épreuve commence ici</span>
              <h2>Moins de préparation,<br /><em>plus de transmission.</em></h2>
            </div>
            <Link href="/auth/register" className="ra-btn ra-btn-yellow">Commencer gratuitement <ArrowRight /></Link>
          </div>
        </section>
      </main>

      <RaFooter />
    </div>
  );
}
