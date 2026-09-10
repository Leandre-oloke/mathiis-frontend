import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  mixed: "Mixte",
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  mcq: "QCM",
  open: "Questions ouvertes",
  true_false: "Vrai / Faux",
  fill_blank: "Texte à trous",
  mixed: "Types mixtes",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  generating: "Génération...",
  completed: "Terminé",
  failed: "Échoué",
};

export const ENGINE_LABELS: Record<string, { label: string; short: string; color: string }> = {
  free: { label: "Standard", short: "Standard", color: "bg-slate-100 text-slate-600" },
  premium: { label: "Premium", short: "Premium", color: "bg-amber-100 text-amber-700" },
};
