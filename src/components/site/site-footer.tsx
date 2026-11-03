"use client";

import Link from 'next/link';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand } from './site-header';
import { subjects } from '@/lib/mascot-catalog';

// Full footer of the public site: pitch and call to action, link columns, a large wordmark and the legal line.
export function SiteFooter() {
  const top = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  return <footer className="site-footer">
    <div className="shell footer-top">
      <div className="footer-pitch">
        <Brand />
        <p>Le générateur d’épreuves des enseignants et des élèves : préparer un devoir ou s’entraîner, l’épreuve et son corrigé prêts en moins d’une minute.</p>
        <Button asChild className="cta-primary magnetic"><Link href="/auth/register">Commencer gratuitement <ArrowRight /></Link></Button>
      </div>
      <nav className="footer-cols" aria-label="Pied de page">
        <div><h3>Produit</h3><a href="#demonstration">Démo interactive</a><a href="#fonctionnalites">Fonctionnalités</a><a href="#comment-ca-marche">Comment ça marche</a><a href="#approche">Notre approche</a></div>
        <div><h3>Matières</h3>{subjects.map(s => <a key={s.id} href="#matieres">{s.subject}</a>)}<span className="footer-soon">D’autres arrivent</span></div>
        <div><h3>Compte</h3><Link href="/auth/login">Connexion</Link><Link href="/auth/register">Créer un compte</Link><Link href="/auth/forgot-password">Mot de passe oublié</Link></div>
        <div><h3>Mathiis</h3><Link href="/a-propos">À propos</Link><Link href="/contact">Contact</Link></div>
      </nav>
    </div>
    <div className="shell footer-wordmark" aria-hidden="true">Mathiis</div>
    <div className="shell footer-bottom">
      <p>© {new Date().getFullYear()} Mathiis · Au service de l’enseignement, au Bénin.</p>
      <Button variant="framed" size="sm" onClick={top}>Haut de page <ArrowUp /></Button>
    </div>
  </footer>;
}
