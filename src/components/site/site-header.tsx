"use client";

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { BrandMark } from './brand-mark';

// Same order as the sections on the page.
const links = [
  { id: 'demonstration', label: 'Démo' },
  { id: 'fonctionnalites', label: 'Fonctionnalités' },
  { id: 'comment-ca-marche', label: 'Comment ça marche' },
];
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function Brand() {
  return <Link href="/" className="brand" aria-label="Mathiis, accueil"><BrandMark />Mathiis</Link>;
}

// Nine dots that fold into a cross when the menu is open.
function DotGrid({ open }: { open: boolean }) {
  return <span className={`dot-grid${open ? ' open' : ''}`} aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</span>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Highlight the section the reader is in: the last one whose top has passed 40% of the screen.
  // Nothing is lit above the first section (the hero).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * .4;
      let current: string | null = null;
      for (const l of links) {
        const el = document.getElementById(l.id);
        if (!el) continue;
        const box = el.getBoundingClientRect();
        if (box.top <= line && box.bottom > line) current = l.id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, []);

  // Slide the ink pill under the hovered link, or the active one.
  useIsoLayoutEffect(() => {
    const nav = navRef.current, pill = pillRef.current;
    if (!nav || !pill) return;
    const target = nav.querySelector<HTMLElement>(`[data-link="${hovered ?? active}"]`);
    if (!target) { gsap.to(pill, { opacity: 0, duration: .2, overwrite: true }); return; }
    gsap.to(pill, { x: target.offsetLeft, width: target.offsetWidth, opacity: 1, duration: .45, ease: 'expo.out', overwrite: true });
  }, [hovered, active]);

  useEffect(() => {
    const panel = panelRef.current;
    document.documentElement.classList.toggle('menu-locked', open);
    if (!open || !panel) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.timeline()
        .fromTo(panel, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .55, ease: 'expo.out' })
        .from('.menu-row', { y: 26, opacity: 0, duration: .5, stagger: .06, ease: 'power3.out' }, .12)
        .from('.menu-foot > *', { y: 18, opacity: 0, duration: .45, stagger: .07, ease: 'power3.out' }, .3);
    }, panel);
    return () => { window.removeEventListener('keydown', close); ctx.revert(); document.documentElement.classList.remove('menu-locked'); };
  }, [open]);

  return <header className="site-header"><div className="shell header-inner">
    <div className="header-left"><Brand /></div>
    <nav ref={navRef} className="nav-frame" aria-label="Navigation principale" onPointerLeave={() => setHovered(null)}>
      <span ref={pillRef} className="nav-pill" aria-hidden="true" />
      {links.map(l => <a key={l.id} href={`#${l.id}`} data-link={l.id} className={(hovered ?? active) === l.id ? 'is-lit' : undefined} aria-current={active === l.id ? 'location' : undefined} onPointerEnter={() => setHovered(l.id)} onFocus={() => setHovered(l.id)} onBlur={() => setHovered(null)}>{l.label}</a>)}
    </nav>
    <div className="header-actions">
      <Button variant="framed" asChild className="login"><Link href="/auth/login">Connexion</Link></Button>
      <Button asChild className="rounded-full start-btn magnetic"><Link href="/auth/register">Commencer <ArrowRight /></Link></Button>
      <Button variant="ghost" size="icon" className="mobile-menu" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} aria-controls="menu-panel" onClick={() => setOpen(!open)}><DotGrid open={open} /></Button>
    </div>
  </div>
  <span className="scroll-progress" aria-hidden="true" />
  {open && <div ref={panelRef} id="menu-panel" className="menu-panel">
    <nav aria-label="Menu">{links.map(l => <a key={l.id} className="menu-row" href={`#${l.id}`} onClick={() => setOpen(false)}>{l.label}<ChevronRight /></a>)}</nav>
    <div className="menu-foot">
      <Link href="/auth/register" className="menu-btn" onClick={() => setOpen(false)}>Commencer gratuitement <ChevronRight /></Link>
      <Link href="/auth/login" className="menu-btn light" onClick={() => setOpen(false)}>Se connecter <ChevronRight /></Link>
    </div>
  </div>}
  </header>;
}
