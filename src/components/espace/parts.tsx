"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { subjects as catalog } from '@/lib/mascot-catalog';

/** Stagger index for the shared entrance animation. */
export const rise = (i: number) => ({ '--i': i }) as CSSProperties;

// Small building blocks shared by every page of the teacher workspace.

/** The search shortcut as this visitor's keyboard writes it: ⌘K on Apple devices, Ctrl K elsewhere. */
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform) || /Macintosh/.test(navigator.userAgent);
const noSubscribe = () => () => {};
export function useSearchShortcut() {
  // "Ctrl K" on the server, then the visitor's own keyboard once hydrated.
  return useSyncExternalStore(noSubscribe, () => (isApple() ? '⌘K' : 'Ctrl K'), () => 'Ctrl K');
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="esp-kbd">{children}</kbd>;
}

export function PageHead({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return <header className="esp-head">
    <div>{eyebrow && <span className="esp-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
    {actions && <div className="esp-head-actions">{actions}</div>}
  </header>;
}

/** A ruler-like gauge: ticks for every unit, ink filled up to the value. */
export function Meter({ label, value, max, compact = false }: { label: string; value: number; max: number; compact?: boolean }) {
  const left = Math.max(0, max - value);
  return <div className={`esp-meter${compact ? ' compact' : ''}`}>
    <div className="esp-meter-top"><span>{label}</span><strong>{value} / {max}</strong></div>
    <div className="esp-meter-track" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <span className="esp-meter-fill" style={{ width: `${(value / max) * 100}%` }} />
      {!compact && Array.from({ length: max - 1 }, (_, i) => <i key={i} style={{ left: `${((i + 1) / max) * 100}%` }} />)}
    </div>
    {!compact && <p className="esp-meter-note">{left} restant{left > 1 ? 's' : ''}</p>}
  </div>;
}

export function EmptyState({ icon, title, text, children }: { icon: ReactNode; title: string; text: string; children?: ReactNode }) {
  return <div className="esp-empty">
    <span className="esp-empty-icon">{icon}</span>
    <h3>{title}</h3>
    <p>{text}</p>
    {children && <div className="esp-empty-actions">{children}</div>}
  </div>;
}

export const subjects = catalog.map(s => ({ id: s.id, name: s.subject, detail: s.specialty, symbol: s.symbol }));

// The 13 official classes (6e … Tle D), as in the real app.
export { CLASSES as classes } from '@/lib/exam-generator';
