"use client";

import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// The hero title holds a live rotating word, so it fades in whole instead of being split into lines.
const HERO_TITLE = '.hero h1';
const INTRO = '.hero .mono-tag, .hero-description, .hero .drive-bar, .hero-note';
const SCROLL_HEADINGS = '.section-heading h2, .bottom-cta h2, .entry-section-heading h2, .entry-feature h2, .subjects-band h2';
const CARDS = '.tool-item, .workflow-step, .stat, .bottom-cta p, .entry-feature p, .subjects-band li';
const COUNTERS = '.stat strong';

// Page-wide premium motion: masked headline reveals, staggered cards, a tilting demo window,
// counting stats, magnetic calls to action and a reading-progress bar.
export function usePremiumMotion(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    let cancelled = false;
    let ctx: gsap.Context | undefined;
    const detach: (() => void)[] = [];
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.from(root.querySelectorAll(HERO_TITLE), { y: 46, opacity: 0, duration: 1.1, ease: 'expo.out' });
        gsap.from(root.querySelectorAll(INTRO), { y: 24, opacity: 0, duration: .9, stagger: .05, ease: 'power3.out', delay: .25 });

        root.querySelectorAll<HTMLElement>(SCROLL_HEADINGS).forEach(el => {
          const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
          gsap.from(split.lines, { yPercent: 115, duration: 1.1, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
        });
        gsap.set(root.querySelectorAll(CARDS), { opacity: 0 });
        ScrollTrigger.batch(root.querySelectorAll(CARDS), {
          start: 'top 90%', once: true,
          onEnter: batch => gsap.fromTo(batch, { y: 46, opacity: 0, scale: .97 }, { y: 0, opacity: 1, scale: 1, duration: .9, stagger: .08, ease: 'power3.out', overwrite: true }),
        });

        // "02 / Corriger": the deck of answer keys rises into place.
        root.querySelectorAll<HTMLElement>('.deck-stack').forEach(deck => {
          gsap.from(deck, { y: 60, rotate: -6, opacity: 0, duration: 1, ease: 'back.out(1.5)', scrollTrigger: { trigger: deck, start: 'top 82%', once: true } });
        });

        root.querySelectorAll<HTMLElement>('.product-window').forEach(el => {
          gsap.fromTo(el, { rotateX: 16, scale: .9, y: 40, transformPerspective: 1400, transformOrigin: '50% 0%' }, { rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: .6 } });
        });

        root.querySelectorAll<HTMLElement>(COUNTERS).forEach(el => {
          const match = el.textContent?.match(/^(\D*)(\d+)(.*)$/);
          if (!match) return;
          const [, before, digits, after] = match;
          const count = { value: 0 };
          gsap.to(count, { value: Number(digits), duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate: () => { el.textContent = `${before}${Math.round(count.value)}${after}`; } });
        });

        // Footer wordmark: letters rise one by one as it comes into view.
        root.querySelectorAll<HTMLElement>('.footer-wordmark').forEach(el => {
          const split = SplitText.create(el, { type: 'chars', mask: 'chars' });
          gsap.from(split.chars, { yPercent: 110, duration: 1, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
        });

        const progress = document.querySelector<HTMLElement>('.scroll-progress');
        if (progress) gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
      }, root);

      // Calls to action lean toward the pointer, on devices that have one.
      if (window.matchMedia('(pointer: fine)').matches) root.querySelectorAll<HTMLElement>('.magnetic').forEach(el => {
        const x = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' });
        const y = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });
        const move = (e: PointerEvent) => { const box = el.getBoundingClientRect(); x((e.clientX - box.left - box.width / 2) * .28); y((e.clientY - box.top - box.height / 2) * .38); };
        const leave = () => { x(0); y(0); };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        detach.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); gsap.set(el, { clearProps: 'transform' }); });
      });
      ScrollTrigger.refresh();
    });
    return () => { cancelled = true; detach.forEach(fn => fn()); ctx?.revert(); };
  }, [scope]);
}
