"use client";

import { useEffect, useState } from "react";

// Titre de l'accueil écrit lettre par lettre (effet machine à écrire), en
// boucle : écrit, reste affiché, disparaît d'un coup, puis se réécrit. Le texte complet est posé en dessous, invisible :
// le titre occupe donc sa place définitive dès le départ et la page ne saute
// pas pendant l'écriture. Lecteurs d'écran : ils lisent le texte complet.
const DEBUT = "Votre épreuve ";
const MARQUE = "et son corrigé";
const FIN = ", prêts en moins d’une minute.";
const TOTAL = DEBUT.length + MARQUE.length + FIN.length;
const VITESSE_MS = 45;

function morceaux(n: number) {
  const a = Math.min(n, DEBUT.length);
  const b = Math.min(Math.max(n - DEBUT.length, 0), MARQUE.length);
  const c = Math.max(n - DEBUT.length - MARQUE.length, 0);
  return { debut: DEBUT.slice(0, a), marque: MARQUE.slice(0, b), fin: FIN.slice(0, c) };
}

const PAUSE_PLEIN_MS = 2600;  // phrase complète affichée avant de repartir de zéro

export function TitreMachine() {
  const [n, setN] = useState(0);

  // Boucle continue : écrire, attendre, effacer, attendre, recommencer.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setN(TOTAL), 0);
      return () => clearTimeout(t);
    }
    // Phrase complète : après la pause, elle disparaît d'un coup (effacement
    // instantané), puis se réécrit depuis le début.
    const plein = n >= TOTAL;
    const t = setTimeout(() => setN(plein ? 0 : n + 1), plein ? PAUSE_PLEIN_MS : VITESSE_MS);
    return () => clearTimeout(t);
  }, [n]);

  const { debut, marque, fin } = morceaux(n);
  const plein = n >= TOTAL;

  // Styles de superposition écrits ici (et non seulement dans accueil.css) :
  // si la feuille de style tarde à charger, la phrase ne s'affiche jamais en
  // double ou en triple.
  return (
    <h1 className="ra-serif ra-titre-machine" style={{ display: "grid" }}>
      <span className="ra-sr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{DEBUT}{MARQUE}{FIN}</span>
      <span className="ra-titre-fantome" aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{DEBUT}<em className="ra-mark">{MARQUE}</em>{FIN}</span>
      <span className="ra-titre-ecrit" aria-hidden="true" style={{ gridArea: "1 / 1" }}>
        {debut}{marque && <em className="ra-mark">{marque}</em>}{fin}
        <span className="ra-curseur" data-plein={plein || undefined} />
      </span>
    </h1>
  );
}

/** Paragraphe écrit lettre par lettre en boucle, même principe que le titre. */
export function TexteMachine({ texte, className }: { texte: string; className?: string }) {
  const [n, setN] = useState(0);
  const total = texte.length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setN(total), 0);
      return () => clearTimeout(t);
    }
    const plein = n >= total;
    const t = setTimeout(() => setN(plein ? 0 : n + 1), plein ? 3200 : 28);
    return () => clearTimeout(t);
  }, [n, total]);

  return (
    <p className={className} style={{ display: "grid" }}>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{texte}</span>
      <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{texte}</span>
      <span aria-hidden="true" style={{ gridArea: "1 / 1" }}>{texte.slice(0, n)}<span className="ra-curseur ra-curseur-fin" /></span>
    </p>
  );
}

/** Fragment de titre écrit lettre par lettre en boucle, à placer DANS une
 *  phrase (ex. la fin d'un titre en italique). Même principe que TexteMachine. */
export function MotsMachine({ texte }: { texte: string }) {
  const [n, setN] = useState(0);
  const total = texte.length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setN(total), 0);
      return () => clearTimeout(t);
    }
    const plein = n >= total;
    const t = setTimeout(() => setN(plein ? 0 : n + 1), plein ? 2600 : 60);
    return () => clearTimeout(t);
  }, [n, total]);

  return (
    <span style={{ display: "inline-grid", verticalAlign: "top" }}>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{texte}</span>
      <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{texte}</span>
      <span aria-hidden="true" style={{ gridArea: "1 / 1" }}>{texte.slice(0, n)}<span className="ra-curseur ra-curseur-fin" /></span>
    </span>
  );
}
