"use client";

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight, Check, CheckCheck, Download, FileText, ShieldCheck, Sparkles, Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExamDemo } from './exam-demo';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { MascotExperience } from './mascot-experience';
import { usePremiumMotion } from './premium-motion';
import { CorrectionDeck, CurvedMarquee, ExamWall, IdeaToExam, RotatingWord } from './home-motion';
import { subjects } from '@/lib/mascot-catalog';

const tools = [
  { icon: Sparkles, title: 'Création par IA', text: 'Un thème, un niveau, une matière. Transformez vos idées en épreuves structurées et cohérentes.' },
  { icon: Upload, title: 'Import de documents', text: 'Partez de vos documents PDF, Word ou texte et obtenez un corrigé détaillé.' },
  { icon: Download, title: 'Export PDF soigné', text: 'Une mise en page professionnelle pour vos épreuves, avec ou sans corrigé.' },
  { icon: FileText, title: 'Des questions variées', text: 'QCM, vrai ou faux, questions ouvertes, textes à trous. Évaluez sous plusieurs angles.' },
  { icon: ShieldCheck, title: 'Un espace privé', text: 'Préparez vos épreuves dans un espace sécurisé. Vos documents restent privés.' },
  { icon: Zap, title: 'Création en temps réel', text: 'Voyez votre épreuve prendre forme et suivez la génération au fil des questions.' },
];

// One long page: hero, proof, approach, the two core jobs (create, correct), demo, tools, subjects, method, call to action.
export function HomePage() {
  const page = useRef<HTMLDivElement>(null);
  usePremiumMotion(page);
  return <MascotExperience><div ref={page} className="accueil-page">
    <SiteHeader />
    <main>
      <section className="hero"><div className="shell">
        <span className="hero-badge"><i aria-hidden="true" /> Générateur d’épreuves par IA</span>
        <h1>Vos épreuves de <em><RotatingWord words={['mathématiques', 'PCT', 'SVT']} /></em><br />prêtes en moins d’une minute.</h1>
        <p className="hero-description">Enseignants et élèves : choisissez la classe et les notions du programme officiel, Mathiis rédige l’épreuve et son corrigé détaillé, prêts à exporter en PDF.</p>
        <div className="hero-actions">
          <Button asChild className="cta-primary magnetic"><Link href="/auth/register">Commencer gratuitement <ArrowRight /></Link></Button>
          <Button variant="framed" asChild className="cta-secondary"><a href="#demonstration">Voir la démo</a></Button>
        </div>
        <div className="hero-note"><span><Check size={13} /> Inscription gratuite</span><span><Check size={13} /> Pour les enseignants et les élèves</span></div>
      </div></section>
      <section className="stats" aria-label="Mathiis en chiffres"><div className="shell stats-inner"><p className="stats-intro">Moins de tâches répétitives.<strong>Plus de place pour enseigner.</strong></p><div className="stat"><strong>&lt; 60 s</strong><span>pour générer une épreuve</span></div><div className="stat"><strong>20+</strong><span>questions par épreuve</span></div><div className="stat"><strong>5</strong><span>types de questions</span></div></div></section>

      <CurvedMarquee text="Créer · Corriger · Exporter · Transmettre" />
      <div className="entry-blocks">
        <section className="entry-manifesto" id="approche"><div className="shell"><span className="eyebrow">L’expertise reste la vôtre.</span><div className="entry-section-heading"><h2>Pas juste de l’IA.<br />Une longueur<br />d’avance.</h2><p>Préparer une épreuve demande du temps et de la précision. Mathiis accompagne votre travail, de la première question au corrigé final.</p></div></div></section>
        <section className="entry-feature entry-dark"><div className="shell entry-feature-grid"><div><span className="eyebrow">01 / Créer</span><h2>Une idée.<br />Une épreuve.<br />Votre signature.</h2><p>Une matière, un niveau, un thème. Donnez le point de départ et gardez la main sur votre contenu.</p><Button asChild variant="framed" className="entry-text-link"><a href="#demonstration">Explorer l’exemple <ArrowRight /></a></Button></div><IdeaToExam /></div></section>
        <section className="entry-feature"><div className="shell entry-feature-grid"><div><span className="eyebrow">02 / Corriger</span><h2>Chaque question.<br />Chaque réponse.<br />Au clair.</h2><p>Retrouvez une correction détaillée et un document structuré, pour vous concentrer sur ce qui compte : transmettre.</p><Button asChild variant="framed" className="entry-text-link"><a href="#demonstration">Voir l’aperçu <ArrowRight /></a></Button></div><CorrectionDeck /></div></section>
      </div>

      <section className="product-section shell" id="demonstration"><ExamDemo /><div className="product-caption"><span><ShieldCheck size={13} /> Votre expertise. Vos documents. Votre espace.</span><span>Conçu pour l’enseignement au Bénin <ArrowRight size={13} /></span></div></section>
      <section className="section shell" id="fonctionnalites"><div className="section-heading"><div><span className="eyebrow">Un espace. Tous vos outils.</span><h2>Tout pour vos épreuves.<br /><span>Rien pour vous ralentir.</span></h2></div><p className="section-subtitle">Créez, importez, corrigez et exportez. Vos outils essentiels, réunis au même endroit.</p></div><div className="tools-grid">{tools.map((tool,index) => <article className="tool-item" key={tool.title}><span className="tool-number">0{index+1}</span><div className="tool-icon"><tool.icon size={19} strokeWidth={1.7} /></div><h3>{tool.title}</h3><p>{tool.text}</p></article>)}</div></section>
      <section className="subjects-band" id="matieres" aria-labelledby="subjects-title"><div className="shell subjects-grid">
        <div>
          <span className="eyebrow">Matières disponibles</span>
          <h2 id="subjects-title">Trois matières pour commencer.<br /><span>D’autres arrivent.</span></h2>
          <ul>{subjects.map(s => <li key={s.subject}><span aria-hidden="true">{s.symbol}</span><strong>{s.subject}</strong><small>{s.specialty}</small></li>)}</ul>
        </div>
        <ExamWall />
      </div></section>
      <section className="section workflow" id="comment-ca-marche"><div className="shell"><div className="section-heading"><div><span className="eyebrow">De l’idée à l’épreuve</span><h2>Trois étapes.<br /><span>Et vous êtes prêt.</span></h2></div><Button variant="framed" asChild><a href="#demonstration">Voir un exemple <ArrowRight /></a></Button></div><div className="workflow-grid"><article className="workflow-step"><span>01</span><h3>Donnez le point de départ.</h3><p>Choisissez la matière, le niveau et le thème de votre épreuve.</p></article><article className="workflow-step"><span>02</span><h3>L’IA prend le relais.</h3><p>Votre épreuve prend forme, accompagnée d’un corrigé détaillé.</p></article><article className="workflow-step"><span>03</span><h3>À vous de transmettre.</h3><p>Exportez votre document en PDF, prêt pour votre classe.</p></article></div></div></section>
      <section className="bottom-cta"><div className="shell"><span className="eyebrow">Votre prochaine épreuve commence ici</span><h2>Moins de préparation.<br />Plus de transmission.</h2><p>Une nouvelle façon de préparer, sans changer votre façon d’enseigner.</p><div className="cta-actions"><Button asChild className="cta-primary magnetic"><Link href="/auth/register">Commencer gratuitement <ArrowRight /></Link></Button><span><CheckCheck size={12} className="inline mr-1" /> Votre expertise reste au centre.</span></div></div></section>
    </main>
    <SiteFooter />
  </div></MascotExperience>;
}
