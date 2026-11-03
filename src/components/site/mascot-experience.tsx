"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KofiBear } from './kofi-bear';

// Same order as the page: try it, see the tools, then how it works.
const stops = [
  { id: 'demonstration', title: 'Essayez tout de suite.', text: 'Choisissez un type et une matière : l’aperçu suit le programme officiel de la classe.' },
  { id: 'fonctionnalites', title: 'Une boîte à outils.', text: 'Créer, importer, corriger, exporter : tout est réuni au même endroit.' },
  { id: 'comment-ca-marche', title: 'De l’idée à la classe.', text: 'Votre matière, votre niveau, votre thème. Vous donnez la direction, Mathiis rédige.' },
];

// Wraps the home page in the white surface and offers the bear's guided tour.
export function MascotExperience({ children }: { children: ReactNode }) {
  const [tour, setTour] = useState<number | null>(null);
  // The tour pill steps aside while the demo or the footer is on screen, so it never covers their buttons.
  const [away, setAway] = useState(false);
  useEffect(() => {
    const zones = [...document.querySelectorAll('.site-footer, #demonstration')];
    if (!zones.length) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver(entries => { entries.forEach(e => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))); setAway(visible.size > 0); }, { rootMargin: '0px 0px -60px 0px' });
    zones.forEach(z => io.observe(z));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (tour === null) return;
    const target = document.getElementById(stops[tour]?.id ?? '');
    target?.classList.add('tour-target');
    target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    return () => target?.classList.remove('tour-target');
  }, [tour]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setTour(null); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  return <div className="experience">
    <div className="experience-page">{children}</div>
    {tour === null && <button type="button" className={`guide-pill${away ? ' is-away' : ''}`} tabIndex={away ? -1 : undefined} onClick={() => setTour(0)}><KofiBear /><span>Visite guidée</span></button>}
    {tour !== null && <aside className="mascot-guide touring" role="dialog" aria-label="Visite guidée de Mathiis">
      <Button variant="ghost" size="icon" className="guide-close" aria-label="Fermer la visite" onClick={() => setTour(null)}><X /></Button>
      <div className="guide-character"><KofiBear reading /></div>
      <div className="guide-copy"><span className="mono-tag">Visite · {tour + 1} / {stops.length}</span><h3>{stops[tour]?.title}</h3><p>{stops[tour]?.text}</p>
        <div className="guide-actions"><Button variant="framed" size="sm" disabled={tour === 0} onClick={() => setTour(Math.max(0, tour - 1))}>Précédent</Button><Button size="sm" onClick={() => setTour(tour === stops.length - 1 ? null : tour + 1)}>{tour === stops.length - 1 ? 'Terminer' : 'Suivant'}<ArrowRight /></Button>
        </div></div>
    </aside>}
  </div>;
}
