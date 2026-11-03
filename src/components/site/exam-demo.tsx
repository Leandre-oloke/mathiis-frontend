"use client";

import { FileText, LayoutGrid, Plus, Sparkles, Upload } from 'lucide-react';
import { GeneratePanel } from '@/components/espace/generate-panel';
import { BrandMarkColor as BrandMark } from './brand-mark';

// Neutral sample account: no real person's name in the demo.
const teacher = { name: 'Mon compte', initials: 'M', plan: 'Gratuite' };

// Home-page demo: the real teacher workspace (sidebar + generate screen) in a browser frame,
// so what visitors try here is exactly what they get after signing in. Nothing in it leads into the signed-in workspace.
export function ExamDemo() {
  return <div className="product-window">
    <div className="window-bar"><span className="window-dots"><i /><i /><i /></span><span>mathiis / mon espace</span><span className="preview-label">Aperçu interactif</span></div>
    <div className="espace espace-demo">
      {/* Decorative sidebar: the demo lets visitors try generation only, the workspace itself needs a sign-in. */}
      <aside className="esp-side" aria-hidden="true" inert>
        <span className="esp-brand"><BrandMark /><span>Mathiis<small>Au service de l’éducation béninoise</small></span></span>
        <span className="esp-new esp-new-static"><Plus /> Nouvelle épreuve</span>
        <div className="esp-nav">
          <span><LayoutGrid /><span>Tableau de bord</span></span>
          <span className="is-active"><Sparkles /><span>Générer une épreuve</span></span>
          <span><FileText /><span>Mes épreuves</span></span>
          <span><Upload /><span>Importer</span></span>
        </div>
        <div className="esp-side-foot"><div className="esp-account"><span className="esp-avatar">{teacher.initials}</span><span className="esp-account-name"><strong>{teacher.name}</strong><small>Offre {teacher.plan.toLowerCase()}</small></span></div></div>
      </aside>
      <div className="esp-main"><GeneratePanel /></div>
    </div>
  </div>;
}
