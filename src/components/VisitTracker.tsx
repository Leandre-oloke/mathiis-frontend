"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

/**
 * Enregistre une visite de la page d'accueil publique (mesure l'engouement
 * autour de l'appli) -- un appel silencieux, une seule fois au chargement.
 * N'affiche jamais rien, ne bloque jamais le rendu si l'appel échoue.
 */
export default function VisitTracker() {
  useEffect(() => {
    api.post("/visits/track", { path: window.location.pathname }).catch(() => {});
  }, []);
  return null;
}
