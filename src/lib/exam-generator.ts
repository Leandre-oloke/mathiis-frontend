// Programme rules shared by the home-page demo: classes, durations, learning situations (SA) and how many
// activities must be ticked. Same data as the generator (programme.ts). Nothing here writes an exam:
// the only exam the demo shows is real model output (sample-exams.ts).
import { MATHS_TLE_D } from "./sample-exams";
import { DEFAULT_DURATIONS, MATHS_SA_DETAILS, PCT_NOTIONS_CHIMIE, PCT_NOTIONS_PHYSIQUE, PCT_SA_DETAILS, SVT_DURATION_OVERRIDES, SVT_NOTIONS, SVT_SA_DETAILS, type SaGroup } from "./programme";

export type SubjectName = "Mathématiques" | "PCT" | "SVT";
export type Mode = "epreuve" | "exercice";
export type Sa = { number: number; title: string; part?: "Physique" | "Chimie"; groups: SaGroup[] };
export type Pick = { sa: string; activite: string; part?: "Physique" | "Chimie" };
export type Step = { id: string; label: string; title: string; lines: string[] };

export const CLASSES = Object.keys(DEFAULT_DURATIONS);

export function durationFor(subject: SubjectName | null, classe: string) {
  return (subject === "SVT" ? SVT_DURATION_OVERRIDES[classe] : undefined) ?? DEFAULT_DURATIONS[classe] ?? 180;
}
export const formatDuree = (min: number) => `${Math.floor(min / 60)}H${String(min % 60).padStart(2, "0")}`;

/** The learning situations (SA) offered for a subject and class, numbered as in the app. */
export function situationsFor(subject: SubjectName, classe: string): Sa[] {
  const own = (title: string): SaGroup[] => [{ label: "Activités", items: [title] }];
  if (subject === "Mathématiques") return Object.entries(MATHS_SA_DETAILS[classe] ?? {}).map(([title, groups], i) => ({ number: i + 1, title, groups }));
  if (subject === "SVT") return (SVT_NOTIONS[classe] ?? []).map((title, i) => ({ number: i + 1, title, groups: SVT_SA_DETAILS[classe]?.[title] ?? own(title) }));
  const physique = (PCT_NOTIONS_PHYSIQUE[classe] ?? []).map((title) => ({ title, part: "Physique" as const }));
  const chimie = (PCT_NOTIONS_CHIMIE[classe] ?? []).map((title) => ({ title, part: "Chimie" as const }));
  return [...physique, ...chimie].map((s, i) => ({ number: i + 1, ...s, groups: PCT_SA_DETAILS[classe]?.[s.title] ?? own(s.title) }));
}

/** How many activities must be ticked: 3 for an exam (2 or 3 in SVT), 1 or 2 for an exercise. */
export function requirement(subject: SubjectName | null, mode: Mode | null) {
  if (mode === "exercice") return { min: 1, max: 2 };
  if (subject === "SVT") return { min: 2, max: 3 };
  return { min: 3, max: 3 };
}

/** The real exam the demo can show: Mathématiques, Tle D, full exam. Any other choice needs an account. */
export function sampleFor(subject: SubjectName | null, classe: string, mode: Mode | null): Step[] | null {
  return subject === "Mathématiques" && classe === "Tle D" && mode === "epreuve" ? MATHS_TLE_D : null;
}
