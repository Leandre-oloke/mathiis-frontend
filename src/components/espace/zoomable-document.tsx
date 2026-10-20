"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Maximize, Minimize, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Same steps as Chrome, bounded to what stays readable for an exam.
const STEPS = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200];

/** In-app zoom for the exam preview (like Google Docs or Figma): − / + steps, reset, Ctrl+wheel on the
 *  document only, and full screen to project the exam in class. The browser's own zoom stays untouched. */
export function ZoomableDocument({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const step = useCallback((dir: 1 | -1) => {
    setZoom(z => (dir > 0 ? STEPS.find(s => s > z) : [...STEPS].reverse().find(s => s < z)) ?? z);
  }, []);

  // Ctrl + wheel zooms the document, not the whole page.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { if (!e.ctrlKey) return; e.preventDefault(); step(e.deltaY < 0 ? 1 : -1); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [step]);

  // Also follows leaving full screen with the Escape key.
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === frame.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFullscreen = () => { if (fullscreen) void document.exitFullscreen(); else void frame.current?.requestFullscreen?.(); };

  return <div ref={frame} className="zoom-frame">
    <div className="zoom-bar" role="toolbar" aria-label="Zoom du document">
      <Button variant="ghost" size="icon" onClick={() => step(-1)} disabled={zoom === STEPS[0]} aria-label="Dézoomer"><Minus /></Button>
      <button type="button" className="zoom-value" onClick={() => setZoom(100)} title="Revenir à 100 %">{zoom} %</button>
      <Button variant="ghost" size="icon" onClick={() => step(1)} disabled={zoom === STEPS[STEPS.length - 1]} aria-label="Zoomer"><Plus /></Button>
      <span className="zoom-sep" aria-hidden="true" />
      <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label={fullscreen ? 'Quitter le plein écran' : 'Plein écran'}>{fullscreen ? <Minimize /> : <Maximize />}</Button>
    </div>
    <div className="zoom-viewport">
      <div style={{ zoom: zoom / 100 }}>{children}</div>
    </div>
  </div>;
}
