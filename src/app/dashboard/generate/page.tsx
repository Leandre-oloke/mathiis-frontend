"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useQuotaStore } from "@/store/quota";
import { BookOpen, Check, ChevronDown, Clock, ExternalLink, Eye, Layers, RotateCcw, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHead } from "@/components/espace/parts";
import { ZoomableDocument } from "@/components/espace/zoomable-document";
import { cn } from "@/lib/utils";
import { getCsrfToken, isCsrfInvalidDetail, redirectToLoginAfterCsrfFailure } from "@/lib/csrf";
import toast from "react-hot-toast";
import { ExamMarkdown } from "@/components/exam/ExamMarkdown";

// ── Données ────────────────────────────────────────────────────────────────────

// Chaque matière a son propre programme (notions par classe). Vide = le
// programme officiel n'est pas encore intégré pour cette matière/classe : le
// formulaire bascule alors automatiquement sur une saisie libre des notions
// (voir plus bas) — dès que la liste est renseignée ici, les chips reviennent
// sans aucun autre changement de code.
const MATHEMATIQUES_NOTIONS: Record<string, string[]> = {
  "6e": ["Cube et pavé droit", "Cône de révolution", "Sphère", "Droites du plan",
    "Segments de droites", "Cercles", "Angles", "Triangles", "Parallélogramme",
    "Entiers naturels", "Nombres décimaux", "Fractions", "Calcul littéral",
    "Symétrie axiale", "Symétrie centrale", "Glissement",
    "Proportionnalité", "Statistique"],
  "5e": ["Prisme droit", "Division dans ℕ", "Nombres premiers", "Puissances",
    "PPCM", "PGCD", "Distance", "Angles", "Triangles", "Cercle",
    "Parallélogramme", "Polygones particuliers", "Nombres décimaux relatifs",
    "Fractions", "Symétrie axiale", "Symétrie centrale", "Glissement",
    "Équations", "Proportionnalité"],
  "4e": ["Angles au centre d'un cercle", "Distance", "Triangles", "Polygones réguliers",
    "Nombres décimaux", "Nombres rationnels", "Puissances", "Expressions algébriques",
    "Pyramide", "Cône de révolution", "Représentation en perspective cavalière",
    "Sphère et boule", "Notion de plan et de droite de l'espace", "PPCM et PGCD",
    "Symétrie centrale", "Symétrie orthogonale", "Translation", "Projection",
    "Équations et inéquations", "Proportionnalité", "Statistique"],
  "3e": ["Nombres réels", "Valeur absolue", "Trigonométrie", "Théorème de Thalès",
    "Triangles semblables", "Triangle rectangle", "Angles et cercles",
    "Cône de révolution", "Sections planes", "Polynômes", "Équations de droite",
    "Équations et inéquations", "Vecteurs", "Coordonnées de vecteurs",
    "Applications affines", "Applications linéaires", "Statistiques"],
  "2nde AB": ["Proportionnalité", "Fonctions numériques", "Suites numériques",
    "Dénombrement", "Nombres réels", "Calculs dans ℝ",
    "Équations du premier degré dans ℝ", "Inéquations du premier degré dans ℝ",
    "Équations linéaires dans ℝ×ℝ", "Systèmes d'équations linéaires",
    "Représentation graphique de fonctions"],
  "2nde C": ["Représentation dans le plan d'objets de l'espace",
    "Positions relatives d'une droite et d'un plan de l'espace",
    "Positions relatives de deux plans de l'espace",
    "Positions relatives de deux droites de l'espace",
    "Étude du parallélisme de droites et plans de l'espace", "La sphère",
    "Calculs dans ℝ", "Généralités sur les fonctions", "Applications",
    "Étude de fonctions", "Équations et inéquations dans ℝ", "Statistique",
    "Polynômes", "Vecteurs du plan", "Droites dans le plan", "Homothétie",
    "Symétrie orthogonale – symétrie centrale – translation",
    "Angles inscrits", "Angles orientés", "Trigonométrie", "Produit scalaire", "Rotation",
    "Cercles dans le plan", "Équations et inéquations dans ℝ×ℝ"],
  "2nde D": ["Représentation dans le plan d'objets de l'espace",
    "Positions relatives d'une droite et d'un plan de l'espace",
    "Positions relatives de deux plans de l'espace",
    "Positions relatives de deux droites de l'espace",
    "Étude du parallélisme de droites et plans de l'espace",
    "Calculs dans ℝ", "Généralités sur les fonctions", "Applications",
    "Étude de fonctions", "Équations et inéquations dans ℝ", "Statistique",
    "Polynômes", "Vecteurs du plan", "Droites dans le plan", "Homothétie",
    "Symétrie orthogonale – symétrie centrale – translation",
    "Angles inscrits", "Relations métriques dans un triangle", "Angles orientés", "Trigonométrie",
    "Produit scalaire", "Rotation", "Équation cartésienne d'un cercle",
    "Équations et inéquations dans ℝ×ℝ"],
  "1ère AB": ["Équations du second degré", "Somme et produit des racines",
    "Équations bicarrées", "Inéquations du second degré", "Inéquation bicarrée",
    "Systèmes linéaires dans ℝ²", "Système d'inéquations linéaires dans ℝ²",
    "Suites arithmétiques", "Suites géométriques", "Statistique", "Dénombrement",
    "Fonctions numériques", "Limite et continuité", "Dérivation",
    "Étude des fonctions x→1/x, x→x² et x→√x",
    "Étude des fonctions x→xⁿ et x→x^(1/n)",
    "Représentation graphique de g : x→f(x-α)+β",
    "Fonctions polynômes", "Fonctions homographiques"],
  "1ère C": ["Droites orthogonales", "Droites et plans orthogonaux", "Plans perpendiculaires",
    "Projection orthogonale sur un plan", "Projection orthogonale sur une droite",
    "Vecteurs de l'espace", "Produit scalaire", "Géométrie analytique",
    "Équations et inéquations dans ℝ", "Statistique", "Dénombrement",
    "Fonctions et applications", "Limite et continuité",
    "Extension de la notion de limite", "Dérivation", "Primitives",
    "Suites numériques", "Angles orientés", "Angles associés",
    "Formules d'addition et de transformation", "Fonctions circulaires",
    "Équations et inéquations trigonométriques", "Barycentre",
    "Orthogonalité, droite et cercle dans le plan", "Les translations",
    "Les symétries orthogonales et les rotations", "Isométries du plan",
    "Similitudes", "Représentations graphiques de fonctions et transformations du plan"],
  "1ère D": ["Droites orthogonales", "Droites et plans orthogonaux", "Plans perpendiculaires",
    "Projection orthogonale sur un plan", "Projection orthogonale sur une droite",
    "Vecteurs de l'espace", "Équations et inéquations dans ℝ", "Systèmes linéaires",
    "Statistique", "Dénombrement", "Fonctions numériques", "Limites et continuité",
    "Extension de la notion de limite", "Dérivation", "Primitives",
    "Suites numériques", "Angles orientés", "Angles associés",
    "Formules d'addition et de transformation",
    "Équations et inéquations trigonométriques", "Barycentre",
    "Transformations du plan et isométries",
    "Représentation graphique de fonctions et transformations du plan",
    "Étude de fonctions numériques de variable réelle"],
  "Tle AB": ["Généralités sur les fonctions", "Limite et continuité", "Dérivation",
    "Fonctions polynômes", "Fonctions rationnelles",
    "Résolution de problèmes conduisant à l'étude d'une fonction polynôme ou rationnelle",
    "Logarithme népérien", "Exponentielle népérienne",
    "Fonctions comportant logarithme ou exponentielle",
    "Entiers naturels", "Équations — Inéquations — Systèmes",
    "Suites numériques", "Statistique", "Probabilité"],
  "Tle C": ["Calcul vectoriel dans l'espace", "Applications de l'espace",
    "Systèmes linéaires", "Arithmétique", "Nombres complexes",
    "Limites et continuité", "Étude de fonctions", "Primitives",
    "Logarithme népérien", "Exponentielle népérienne", "Fonctions puissances",
    "Calcul intégral", "Équations différentielles", "Probabilité",
    "Suites numériques", "Isométries du plan", "Applications affines",
    "Similitudes", "Coniques"],
  "Tle D": ["Vecteurs de l'espace", "Barycentre",
    "Représentations paramétriques d'une droite et d'un plan dans l'espace",
    "Équation cartésienne d'un plan",
    "Système d'équations cartésiennes d'une droite de l'espace",
    "Systèmes linéaires", "Produit scalaire",
    "Produit vectoriel", "Nombres complexes", "Limites et continuité",
    "Étude de fonctions", "Primitives", "Logarithme népérien",
    "Exponentielle népérienne", "Fonctions puissances", "Calcul intégral",
    "Équations différentielles", "Probabilité", "Suites numériques", "Statistique",
    "Application des nombres complexes aux transformations du plan"],
};

// Regroupement par SA (Situation d'Apprentissage) des notions Mathématiques
// ci-dessus -- source : fiches officielles de suivi de progression
// 2026-2027 (toutes classes, DIPIQ). Mêmes chaînes de notions que
// MATHEMATIQUES_NOTIONS (aucune notion renommée/ajoutée : seul un
// regroupement est ajouté, pour ne rien changer au texte envoyé au modèle).
// Chaque notion est son propre groupe à un seul "item" -- utilisé comme
// repli à 1 niveau pour les classes sans sommaire de manuel détaillé dans
// MATHS_SEQ_ACTIVITES_DETAILS ci-dessous (ex. "6e": MATHS_SA_DETAILS["6e"]).
type MathSaSeq = { label: string; items: string[] };
const _mathSeq = (notions: string[]): MathSaSeq[] => notions.map((n) => ({ label: n, items: [n] }));

const MATHS_SA_DETAILS: Record<string, Record<string, SaGroup[]>> = {
  "6e": {
    "Configurations de l'espace": _mathSeq(["Cube et pavé droit", "Cône de révolution", "Sphère"]),
    "Configurations du plan": _mathSeq(["Droites du plan", "Segments de droites", "Cercles", "Angles", "Triangles", "Parallélogramme", "Entiers naturels", "Nombres décimaux", "Fractions", "Calcul littéral"]),
    "Applications du plan": _mathSeq(["Symétrie axiale", "Symétrie centrale", "Glissement"]),
    "Organisation des données": _mathSeq(["Proportionnalité", "Statistique"]),
  },
  "5e": {
    "Configurations de l'espace": _mathSeq(["Prisme droit", "Division dans ℕ", "Nombres premiers", "Puissances", "PPCM", "PGCD"]),
    "Configurations du plan": _mathSeq(["Distance", "Angles", "Triangles", "Cercle", "Parallélogramme", "Polygones particuliers", "Nombres décimaux relatifs", "Fractions"]),
    "Applications du plan": _mathSeq(["Symétrie axiale", "Symétrie centrale", "Glissement"]),
    "Organisation des données": _mathSeq(["Équations", "Proportionnalité"]),
  },
  "4e": {
    "Configurations du plan": _mathSeq(["Angles au centre d'un cercle", "Distance", "Triangles", "Polygones réguliers", "Nombres décimaux", "Nombres rationnels", "Puissances", "Expressions algébriques"]),
    "Configurations de l'espace": _mathSeq(["Pyramide", "Cône de révolution", "Représentation en perspective cavalière", "Sphère et boule", "Notion de plan et de droite de l'espace", "PPCM et PGCD"]),
    "Applications du plan": _mathSeq(["Symétrie centrale", "Symétrie orthogonale", "Translation", "Projection"]),
    "Organisation des données": _mathSeq(["Équations et inéquations", "Proportionnalité", "Statistique"]),
  },
  "3e": {
    "Triangles": _mathSeq(["Nombres réels", "Valeur absolue", "Trigonométrie", "Théorème de Thalès", "Triangles semblables", "Triangle rectangle", "Angles et cercles"]),
    "Configurations de l'espace": _mathSeq(["Cône de révolution", "Sections planes"]),
    "Calcul littéral": _mathSeq(["Polynômes", "Équations de droite", "Équations et inéquations", "Vecteurs", "Coordonnées de vecteurs"]),
    "Organisation des données": _mathSeq(["Applications affines", "Applications linéaires", "Statistiques"]),
  },
  "2nde AB": {
    "Organisation des données": _mathSeq(["Proportionnalité", "Fonctions numériques", "Suites numériques", "Dénombrement"]),
    "Lieux géométriques dans le plan": _mathSeq(["Nombres réels", "Calculs dans ℝ", "Équations du premier degré dans ℝ", "Inéquations du premier degré dans ℝ", "Équations linéaires dans ℝ×ℝ", "Systèmes d'équations linéaires", "Représentation graphique de fonctions"]),
  },
  "2nde C": {
    "Configurations de l'espace": _mathSeq(["Représentation dans le plan d'objets de l'espace", "Positions relatives d'une droite et d'un plan de l'espace", "Positions relatives de deux plans de l'espace", "Positions relatives de deux droites de l'espace", "Étude du parallélisme de droites et plans de l'espace", "La sphère"]),
    "Organisation des données": _mathSeq(["Calculs dans ℝ", "Généralités sur les fonctions", "Applications", "Étude de fonctions", "Équations et inéquations dans ℝ", "Statistique", "Polynômes", "Équations et inéquations dans ℝ×ℝ"]),
    "Lieux géométriques dans le plan": _mathSeq(["Vecteurs du plan", "Droites dans le plan", "Homothétie", "Symétrie orthogonale – symétrie centrale – translation", "Angles inscrits", "Angles orientés", "Trigonométrie", "Produit scalaire", "Rotation", "Cercles dans le plan"]),
  },
  "2nde D": {
    "Configurations de l'espace": _mathSeq(["Représentation dans le plan d'objets de l'espace", "Positions relatives d'une droite et d'un plan de l'espace", "Positions relatives de deux plans de l'espace", "Positions relatives de deux droites de l'espace", "Étude du parallélisme de droites et plans de l'espace"]),
    "Organisation des données": _mathSeq(["Calculs dans ℝ", "Généralités sur les fonctions", "Applications", "Étude de fonctions", "Équations et inéquations dans ℝ", "Statistique", "Polynômes", "Équations et inéquations dans ℝ×ℝ"]),
    "Lieux géométriques dans le plan": _mathSeq(["Vecteurs du plan", "Droites dans le plan", "Homothétie", "Symétrie orthogonale – symétrie centrale – translation", "Angles inscrits", "Relations métriques dans un triangle", "Angles orientés", "Trigonométrie", "Produit scalaire", "Rotation", "Équation cartésienne d'un cercle"]),
  },
  "1ère AB": {
    "Organisation des données": _mathSeq(["Équations du second degré", "Somme et produit des racines", "Équations bicarrées", "Inéquations du second degré", "Inéquation bicarrée", "Systèmes linéaires dans ℝ²", "Système d'inéquations linéaires dans ℝ²", "Suites arithmétiques", "Suites géométriques", "Statistique", "Dénombrement"]),
    "Lieux géométriques dans le plan": _mathSeq(["Fonctions numériques", "Limite et continuité", "Dérivation", "Étude des fonctions x→1/x, x→x² et x→√x", "Étude des fonctions x→xⁿ et x→x^(1/n)", "Représentation graphique de g : x→f(x-α)+β", "Fonctions polynômes", "Fonctions homographiques"]),
  },
  "1ère C": {
    "Configurations de l'espace": _mathSeq(["Droites orthogonales", "Droites et plans orthogonaux", "Plans perpendiculaires", "Projection orthogonale sur un plan", "Projection orthogonale sur une droite", "Vecteurs de l'espace", "Produit scalaire", "Géométrie analytique"]),
    "Organisation des données": _mathSeq(["Équations et inéquations dans ℝ", "Statistique", "Dénombrement", "Fonctions et applications", "Limite et continuité", "Extension de la notion de limite", "Dérivation", "Primitives", "Suites numériques"]),
    "Lieux géométriques dans le plan": _mathSeq(["Angles orientés", "Angles associés", "Formules d'addition et de transformation", "Fonctions circulaires", "Équations et inéquations trigonométriques", "Barycentre", "Orthogonalité, droite et cercle dans le plan", "Les translations", "Les symétries orthogonales et les rotations", "Isométries du plan", "Similitudes", "Représentations graphiques de fonctions et transformations du plan"]),
  },
  "1ère D": {
    "Configurations de l'espace": _mathSeq(["Droites orthogonales", "Droites et plans orthogonaux", "Plans perpendiculaires", "Projection orthogonale sur un plan", "Projection orthogonale sur une droite", "Vecteurs de l'espace"]),
    "Organisation des données": _mathSeq(["Équations et inéquations dans ℝ", "Systèmes linéaires", "Statistique", "Dénombrement", "Fonctions numériques", "Limites et continuité", "Extension de la notion de limite", "Dérivation", "Primitives", "Suites numériques"]),
    "Lieux géométriques dans le plan": _mathSeq(["Angles orientés", "Angles associés", "Formules d'addition et de transformation", "Équations et inéquations trigonométriques", "Barycentre", "Transformations du plan et isométries", "Représentation graphique de fonctions et transformations du plan", "Étude de fonctions numériques de variable réelle"]),
  },
  "Tle AB": {
    "Lieux géométriques dans le plan": _mathSeq(["Généralités sur les fonctions", "Limite et continuité", "Dérivation", "Fonctions polynômes", "Fonctions rationnelles", "Résolution de problèmes conduisant à l'étude d'une fonction polynôme ou rationnelle", "Logarithme népérien", "Exponentielle népérienne", "Fonctions comportant logarithme ou exponentielle"]),
    "Organisation des données": _mathSeq(["Entiers naturels", "Équations — Inéquations — Systèmes", "Suites numériques", "Statistique", "Probabilité"]),
  },
  "Tle C": {
    "Configurations de l'espace": _mathSeq(["Calcul vectoriel dans l'espace", "Applications de l'espace"]),
    "Organisation des données": _mathSeq(["Systèmes linéaires", "Arithmétique", "Nombres complexes", "Limites et continuité", "Étude de fonctions", "Primitives", "Logarithme népérien", "Exponentielle népérienne", "Fonctions puissances", "Calcul intégral", "Équations différentielles", "Probabilité", "Suites numériques"]),
    "Lieux géométriques dans le plan": _mathSeq(["Isométries du plan", "Applications affines", "Similitudes", "Coniques"]),
  },
  "Tle D": {
    "Configurations de l'espace": _mathSeq(["Vecteurs de l'espace", "Barycentre", "Représentations paramétriques d'une droite et d'un plan dans l'espace", "Équation cartésienne d'un plan", "Système d'équations cartésiennes d'une droite de l'espace", "Systèmes linéaires", "Produit scalaire", "Produit vectoriel"]),
    "Organisation des données": _mathSeq(["Nombres complexes", "Limites et continuité", "Étude de fonctions", "Primitives", "Logarithme népérien", "Exponentielle népérienne", "Fonctions puissances", "Calcul intégral", "Équations différentielles", "Probabilité", "Suites numériques", "Statistique"]),
    "Lieux géométriques dans le plan": _mathSeq(["Application des nombres complexes aux transformations du plan"]),
  },
};

// Titres de SA par classe (clés de MATHS_SA_DETAILS) -- c'est CETTE liste,
// pas MATHEMATIQUES_NOTIONS (le pool plat de notions), qui doit alimenter
// le rendu des "chips" de SA du picker (même rôle que PCT_NOTIONS_PHYSIQUE/
// SVT_NOTIONS : une liste de titres de SA, pas de notions individuelles).
const MATHS_SA_TITLES: Record<string, string[]> = Object.fromEntries(
  Object.entries(MATHS_SA_DETAILS).map(([classe, saMap]) => [classe, Object.keys(saMap)])
);

// Numéro de SA (1, 2, 3...) par classe, dérivé de l'ordre de déclaration
// ci-dessus (qui suit déjà l'ordre SA n°1/2/3/4 des fiches officielles) --
// alimente l'affichage "SA1 : <titre>" sur les chips (cf. saChipLabel),
// même mécanique que PCT_SA_NUMBER/SVT_SA_NUMBER.
const MATHS_SA_NUMBER: Record<string, Record<string, number>> = Object.fromEntries(
  Object.entries(MATHS_SA_DETAILS).map(([classe, saMap]) => [
    classe,
    Object.fromEntries(Object.keys(saMap).map((sa, i) => [sa, i + 1])),
  ])
);

// Variante à 3 niveaux (SA -> Notion -> Activités) de MATHS_SA_DETAILS
// ci-dessus, utilisée pour le picker Mathématiques en mode Épreuve ET en
// mode Exercice (demande explicite utilisateur : même format de choix des
// notions dans les deux modes). Mêmes clés de SA/notion que MATHS_SA_DETAILS
// (même source fiches 2026-2027) ; les sous-activités viennent des
// sommaires de manuels collectés séparément et ne couvrent pas toutes les
// notions -- une notion sans sous-détail retombe sur un groupe à un seul
// item (elle-même), comme dans MATHS_SA_DETAILS.
const _mSeq = (notion: string, items?: string[]): MathSaSeq => ({ label: notion, items: items && items.length ? items : [notion] });

const MATHS_SEQ_ACTIVITES_DETAILS: Record<string, Record<string, SaGroup[]>> = {
  "6e": MATHS_SA_DETAILS["6e"], // pas de sommaire de manuel correspondant (édition différente) -- repli 1 niveau
  "5e": {
    "Configurations de l'espace": [
      _mSeq("Prisme droit", ["Prisme droit", "Pyramide"]),
      _mSeq("Division dans ℕ", ["Division dans ℕ", "Produit de facteurs premiers"]),
      _mSeq("Nombres premiers"),
      _mSeq("Puissances", ["Puissance d'un nombre entier naturel", "Calculer avec des puissances"]),
      _mSeq("PPCM"), _mSeq("PGCD"),
    ],
    "Configurations du plan": [
      _mSeq("Distance", ["Cercle", "Propriétés de la distance"]),
      _mSeq("Angles", ["Angles supplémentaires, complémentaires", "Angles opposés par le sommet", "Angles formés par deux droites et une sécante", "Angles d'un triangle"]),
      _mSeq("Triangles", ["Triangle isocèle", "Triangle équilatéral", "Triangle rectangle"]),
      _mSeq("Cercle"),
      _mSeq("Parallélogramme", ["Parallélogramme", "Rectangle", "Losange", "Carré"]),
      _mSeq("Polygones particuliers"),
      _mSeq("Nombres décimaux relatifs", ["Présentation des nombres décimaux relatifs", "Droites graduées", "Comparaison de nombres décimaux relatifs", "Somme de nombres décimaux relatifs", "Différence de deux nombres décimaux relatifs", "Produit de deux nombres décimaux relatifs"]),
      _mSeq("Fractions", ["Fractions irréductibles", "Somme et différence de deux fractions", "Comparaison de deux fractions – Encadrement", "Produit de deux fractions"]),
    ],
    "Applications du plan": [
      _mSeq("Symétrie axiale", ["Définition et premières propriétés", "Nouvelles propriétés"]),
      _mSeq("Symétrie centrale", ["Définition et premières propriétés", "Nouvelles propriétés"]),
      _mSeq("Glissement"),
    ],
    "Organisation des données": [
      _mSeq("Équations", ["Équation du type x + b = a"]),
      _mSeq("Proportionnalité", ["Exemples de coefficients de proportionnalité", "Représentation graphique de tableaux de proportionnalité"]),
    ],
  },
  "4e": {
    "Configurations du plan": [
      _mSeq("Angles au centre d'un cercle", ["Angle au centre"]),
      _mSeq("Distance", ["Distances et droites", "Points équidistants de deux droites", "Cercles et droites"]),
      _mSeq("Triangles", ["Droite des milieux", "Droites particulières d'un triangle", "Droites particulières d'un triangle isocèle", "Propriétés métriques du triangle rectangle"]),
      _mSeq("Polygones réguliers"),
      _mSeq("Nombres décimaux"),
      _mSeq("Nombres rationnels", ["Fractions", "PGCD-PPCM", "Opérations sur les nombres rationnels"]),
      _mSeq("Puissances", ["Puissances de 10", "Nombres décimaux et puissances de 10", "Approximations décimales"]),
      _mSeq("Expressions algébriques", ["Expressions littérales", "Sommes algébriques", "Produits et puissances", "Calcul littéral"]),
    ],
    "Configurations de l'espace": [
      _mSeq("Pyramide", ["Prismes et pyramides", "Représentation d'un objet de l'espace", "Solides de révolution", "Volumes et aires"]),
      _mSeq("Cône de révolution"), _mSeq("Représentation en perspective cavalière"),
      _mSeq("Sphère et boule"), _mSeq("Notion de plan et de droite de l'espace"), _mSeq("PPCM et PGCD"),
    ],
    "Applications du plan": [
      _mSeq("Symétrie centrale", ["Notion d'application", "Propriétés des symétries", "Utilisation de symétries"]),
      _mSeq("Symétrie orthogonale"),
      _mSeq("Translation", ["Translations", "Vecteurs", "Translations et vecteurs"]),
      _mSeq("Projection", ["Projection", "Repérage dans le plan"]),
    ],
    "Organisation des données": [
      _mSeq("Équations et inéquations", ["Équations", "Inéquations"]),
      _mSeq("Proportionnalité", ["Problèmes de dénombrement", "Problèmes de proportionnalité", "Équations et inéquations pour résoudre des problèmes"]),
      _mSeq("Statistique"),
    ],
  },
  "3e": {
    "Triangles": [
      _mSeq("Nombres réels", ["Racine carrée", "Opérations et racines carrées", "Calculs avec des racines carrées"]),
      _mSeq("Valeur absolue", ["Valeur absolue", "Intervalles", "Comparaison de nombres réels", "Calcul approché"]),
      _mSeq("Trigonométrie", ["Propriété de Pythagore", "Cosinus et sinus d'un angle aigu", "Tangente d'un angle aigu", "Utilisation de la trigonométrie"]),
      _mSeq("Théorème de Thalès", ["Propriété de Thalès dans le triangle", "Utilisation des propriétés de Thalès", "Propriété de Thalès dans le cas général"]),
      _mSeq("Triangles semblables"), _mSeq("Triangle rectangle"),
      _mSeq("Angles et cercles", ["Angles inscrits dans un cercle", "Angles inscrits et configurations du plan"]),
    ],
    "Configurations de l'espace": [
      _mSeq("Cône de révolution", ["Pyramides et cônes"]),
      _mSeq("Sections planes"),
    ],
    "Calcul littéral": [
      _mSeq("Polynômes", ["Quotients", "Calcul littéral", "Exemples d'expressions littérales"]),
      _mSeq("Équations de droite", ["Équation du premier degré dans ℝ×ℝ", "Équations d'une droite", "Positions relatives de deux droites"]),
      _mSeq("Équations et inéquations", ["Équations du 1er degré dans ℝ", "Inéquations du 1er degré dans ℝ", "Systèmes d'équations du 1er degré dans ℝ×ℝ", "Inéquations du 1er degré dans ℝ×ℝ"]),
      _mSeq("Vecteurs", ["Somme de vecteurs", "Produit d'un vecteur par un nombre", "Vecteurs et configurations"]),
      _mSeq("Coordonnées de vecteurs", ["Coordonnées d'un vecteur", "Vecteurs colinéaires - vecteurs orthogonaux", "Calculs dans un repère"]),
    ],
    "Organisation des données": [
      _mSeq("Applications affines", ["Applications affines", "Résolution graphique de problèmes"]),
      _mSeq("Applications linéaires"),
      _mSeq("Statistiques", ["Étude d'un caractère qualitatif", "Étude d'un caractère quantitatif", "Regroupement en classes"]),
    ],
  },
  "2nde AB": MATHS_SA_DETAILS["2nde AB"], // pas de sommaire de manuel détaillé disponible -- repli 1 niveau
  "2nde C": {
    "Configurations de l'espace": [
      _mSeq("Représentation dans le plan d'objets de l'espace"),
      _mSeq("Positions relatives d'une droite et d'un plan de l'espace"),
      _mSeq("Positions relatives de deux plans de l'espace"),
      _mSeq("Positions relatives de deux droites de l'espace"),
      _mSeq("Étude du parallélisme de droites et plans de l'espace", ["Étude du parallélisme"]),
      _mSeq("La sphère"),
    ],
    "Organisation des données": [
      _mSeq("Calculs dans ℝ", ["Nombres rationnels et irrationnels", "Ordre dans ℝ", "Valeur absolue"]),
      _mSeq("Généralités sur les fonctions", ["Généralités sur les fonctions", "Étude graphique", "Variations d'une fonction"]),
      _mSeq("Applications"),
      _mSeq("Étude de fonctions", ["Fonctions affines par intervalles", "Fonctions de référence", "Utilisation des fonctions de référence"]),
      _mSeq("Équations et inéquations dans ℝ", ["Généralités", "Équations et inéquations liant deux polynômes", "Équations et inéquations liant deux fractions rationnelles", "Équations et inéquations avec valeurs absolues"]),
      _mSeq("Statistique", ["Organisation des données", "Graphiques", "Caractéristiques de position", "Caractéristiques de dispersion"]),
      _mSeq("Polynômes", ["Généralités sur les polynômes", "Polynômes du second degré", "Factorisation par x - α", "Fractions rationnelles"]),
      _mSeq("Équations et inéquations dans ℝ×ℝ"),
    ],
    "Lieux géométriques dans le plan": [
      _mSeq("Vecteurs du plan", ["Vecteurs", "Mesure algébrique", "Bases et repères"]),
      _mSeq("Droites dans le plan", ["Droites"]),
      _mSeq("Homothétie", ["Homothétie", "Propriétés de l'homothétie", "Caractérisations d'une homothétie"]),
      _mSeq("Symétrie orthogonale – symétrie centrale – translation"),
      _mSeq("Angles inscrits", ["Angles inscrits", "Lieu géométrique des points M tels que mes AMB = θ°", "Quadrilatères inscriptibles", "Relations métriques dans un triangle", "Polygones réguliers"]),
      _mSeq("Angles orientés"),
      _mSeq("Trigonométrie", ["Compléments sur les angles", "Trigonométrie"]),
      _mSeq("Produit scalaire", ["Définitions et premières propriétés", "Propriétés du produit scalaire", "Relations métriques dans un triangle", "Forme analytique du produit scalaire"]),
      _mSeq("Rotation"),
      _mSeq("Cercles dans le plan", ["Cercles"]),
    ],
  },
  "2nde D": {
    "Configurations de l'espace": [
      _mSeq("Représentation dans le plan d'objets de l'espace"),
      _mSeq("Positions relatives d'une droite et d'un plan de l'espace"),
      _mSeq("Positions relatives de deux plans de l'espace"),
      _mSeq("Positions relatives de deux droites de l'espace"),
      _mSeq("Étude du parallélisme de droites et plans de l'espace", ["Étude du parallélisme"]),
    ],
    "Organisation des données": [
      _mSeq("Calculs dans ℝ", ["Nombres rationnels et irrationnels", "Ordre dans ℝ", "Valeur absolue"]),
      _mSeq("Généralités sur les fonctions", ["Généralités sur les fonctions", "Étude graphique", "Variations d'une fonction"]),
      _mSeq("Applications"),
      _mSeq("Étude de fonctions", ["Fonctions affines par intervalles", "Fonctions de référence", "Utilisation des fonctions de référence"]),
      _mSeq("Équations et inéquations dans ℝ", ["Généralités", "Équations et inéquations liant deux polynômes", "Équations et inéquations liant deux fractions rationnelles", "Équations et inéquations avec valeurs absolues"]),
      _mSeq("Statistique", ["Organisation des données", "Graphiques", "Caractéristiques de position", "Caractéristiques de dispersion"]),
      _mSeq("Polynômes", ["Généralités sur les polynômes", "Polynômes du second degré", "Factorisation par x - α", "Fractions rationnelles"]),
      _mSeq("Équations et inéquations dans ℝ×ℝ"),
    ],
    "Lieux géométriques dans le plan": [
      _mSeq("Vecteurs du plan", ["Vecteurs", "Mesure algébrique", "Bases et repères"]),
      _mSeq("Droites dans le plan", ["Droites"]),
      _mSeq("Homothétie", ["Homothétie", "Propriétés de l'homothétie", "Caractérisations d'une homothétie"]),
      _mSeq("Symétrie orthogonale – symétrie centrale – translation"),
      _mSeq("Angles inscrits"),
      _mSeq("Relations métriques dans un triangle"),
      _mSeq("Angles orientés"),
      _mSeq("Trigonométrie", ["Compléments sur les angles", "Trigonométrie"]),
      _mSeq("Produit scalaire", ["Définitions et premières propriétés", "Propriétés du produit scalaire", "Forme analytique du produit scalaire"]),
      _mSeq("Rotation"),
      _mSeq("Équation cartésienne d'un cercle"),
    ],
  },
  "1ère AB": {
    "Organisation des données": [
      _mSeq("Équations du second degré", ["Équations du second degré", "Résolution de problèmes"]),
      _mSeq("Somme et produit des racines"), _mSeq("Équations bicarrées"),
      _mSeq("Inéquations du second degré"), _mSeq("Inéquation bicarrée"),
      _mSeq("Systèmes linéaires dans ℝ²"), _mSeq("Système d'inéquations linéaires dans ℝ²"),
      _mSeq("Suites arithmétiques", ["Généralités", "Suites arithmétiques, suites géométriques"]),
      _mSeq("Suites géométriques"),
      _mSeq("Statistique", ["Caractéristiques d'une série statistique", "Séries à modalités regroupées en classes", "Exemples de séries chronologiques"]),
      _mSeq("Dénombrement", ["Compléments sur les ensembles", "p-uplets, arrangements et permutations", "Combinaisons"]),
    ],
    "Lieux géométriques dans le plan": [
      _mSeq("Fonctions numériques", ["Fonctions élémentaires", "Fonctions et transformations du plan", "Parité et éléments de symétrie"]),
      _mSeq("Limite et continuité", ["Notion de limite"]),
      _mSeq("Dérivation", ["Compléments sur les droites", "Dérivation en x0", "Calculs de dérivées"]),
      _mSeq("Étude des fonctions x→1/x, x→x² et x→√x"),
      _mSeq("Étude des fonctions x→xⁿ et x→x^(1/n)"),
      _mSeq("Représentation graphique de g : x→f(x-α)+β"),
      _mSeq("Fonctions polynômes", ["Applications de la dérivation", "Étude de fonctions polynômes et homographiques", "Résolution de problèmes"]),
      _mSeq("Fonctions homographiques"),
    ],
  },
  "1ère C": {
    "Configurations de l'espace": [
      _mSeq("Droites orthogonales"),
      _mSeq("Droites et plans orthogonaux"),
      _mSeq("Plans perpendiculaires"),
      _mSeq("Projection orthogonale sur un plan"),
      _mSeq("Projection orthogonale sur une droite"),
      _mSeq("Vecteurs de l'espace", ["Extension à l'espace de la notion de vecteur", "Bases et repères"]),
      _mSeq("Produit scalaire"),
      _mSeq("Géométrie analytique", ["Équations cartésiennes", "Représentations paramétriques", "Positions relatives de droites et plans"]),
    ],
    "Organisation des données": [
      _mSeq("Équations et inéquations dans ℝ", ["Problèmes du second degré", "Équations et inéquations se ramenant au second degré", "Systèmes linéaires d'équations et d'inéquations"]),
      _mSeq("Statistique", ["Séries statistiques présentant un regroupement en classes", "Séries statistiques à deux caractères"]),
      _mSeq("Dénombrement", ["Premiers outils pour dénombrer", "Compléments sur les ensembles", "p-uplets, arrangements, permutations", "Combinaisons", "Problèmes de dénombrement"]),
      _mSeq("Fonctions et applications"),
      _mSeq("Limite et continuité", ["Approche intuitive de la notion de limite", "Calculs de limites", "Continuité"]),
      _mSeq("Extension de la notion de limite"),
      _mSeq("Dérivation", ["Dérivation en x0", "Calculs de dérivées", "Applications de la dérivation"]),
      _mSeq("Primitives"),
      _mSeq("Suites numériques", ["Généralités", "Étude d'une suite numérique", "Suites arithmétiques, suites géométriques"]),
    ],
    "Lieux géométriques dans le plan": [
      _mSeq("Angles orientés", ["Angles orientés", "Propriétés des angles orientés"]),
      _mSeq("Angles associés"),
      _mSeq("Formules d'addition et de transformation"),
      _mSeq("Fonctions circulaires", ["Fonctions trigonométriques"]),
      _mSeq("Équations et inéquations trigonométriques", ["Équations trigonométriques", "Inéquations trigonométriques"]),
      _mSeq("Barycentre", ["Barycentre de deux points pondérés", "Barycentre de plus de deux points pondérés", "Utilisations du barycentre"]),
      _mSeq("Orthogonalité, droite et cercle dans le plan", ["Orthogonalité et droites du plan"]),
      _mSeq("Les translations"),
      _mSeq("Les symétries orthogonales et les rotations"),
      _mSeq("Isométries du plan", ["Translations et symétries orthogonales", "Rotations", "Isométries", "Compléments sur les isométries"]),
      _mSeq("Similitudes", ["Les homothéties et leurs utilisations", "Composition d'homothéties et d'isométries"]),
      _mSeq("Représentations graphiques de fonctions et transformations du plan"),
    ],
  },
  "1ère D": {
    "Configurations de l'espace": [
      _mSeq("Droites orthogonales"),
      _mSeq("Droites et plans orthogonaux"),
      _mSeq("Plans perpendiculaires"),
      _mSeq("Projection orthogonale sur un plan"),
      _mSeq("Projection orthogonale sur une droite"),
      _mSeq("Vecteurs de l'espace", ["Vecteurs et configurations de l'espace"]),
    ],
    "Organisation des données": [
      _mSeq("Équations et inéquations dans ℝ", ["Équations, inéquations du second degré", "Équations et inéquations se ramenant au second degré"]),
      _mSeq("Systèmes linéaires", ["Généralités", "Systèmes d'équations"]),
      _mSeq("Statistique", ["Séries statistiques groupées en classes", "Caractéristiques des séries groupées"]),
      _mSeq("Dénombrement", ["Dénombrement de parties d'ensembles finis", "Dénombrement de listes", "Dénombrement d'arrangements et de permutations", "Dénombrement de combinaisons"]),
      _mSeq("Fonctions numériques", ["Généralités sur les fonctions", "Opérations sur les fonctions", "Applications bijectives"]),
      _mSeq("Limites et continuité", ["Limite et continuité en a", "Limite à gauche, limite à droite"]),
      _mSeq("Extension de la notion de limite"),
      _mSeq("Dérivation", ["Dérivation en a", "Calcul de la dérivée", "Dérivée et sens de variation"]),
      _mSeq("Primitives"),
      _mSeq("Suites numériques", ["Généralités", "Étude d'une suite numérique", "Suites arithmétiques – suites géométriques"]),
    ],
    "Lieux géométriques dans le plan": [
      _mSeq("Angles orientés", ["Mesure d'un angle orienté"]),
      _mSeq("Angles associés"),
      _mSeq("Formules d'addition et de transformation"),
      _mSeq("Équations et inéquations trigonométriques", ["Fonctions cosinus, sinus et tangente", "Formules trigonométriques", "Résolution d'équations trigonométriques"]),
      _mSeq("Barycentre", ["Barycentres", "Lignes de niveau", "Cercle"]),
      _mSeq("Transformations du plan et isométries", ["Isométries", "Utilisation des transformations du plan"]),
      _mSeq("Représentation graphique de fonctions et transformations du plan"),
      _mSeq("Étude de fonctions numériques de variable réelle"),
    ],
  },
  "Tle AB": {
    "Lieux géométriques dans le plan": [
      _mSeq("Généralités sur les fonctions", ["Généralités"]),
      _mSeq("Limite et continuité", ["Notions de limite et de continuité"]),
      _mSeq("Dérivation", ["Dérivation"]),
      _mSeq("Fonctions polynômes", ["Fonctions polynômes", "Résolution de problèmes"]),
      _mSeq("Fonctions rationnelles"),
      _mSeq("Résolution de problèmes conduisant à l'étude d'une fonction polynôme ou rationnelle"),
      _mSeq("Logarithme népérien", ["Fonction logarithme népérien"]),
      _mSeq("Exponentielle népérienne", ["Fonction exponentielle népérienne"]),
      _mSeq("Fonctions comportant logarithme ou exponentielle", ["Fonctions comportant ln ou exp"]),
    ],
    "Organisation des données": [
      _mSeq("Entiers naturels"),
      _mSeq("Équations — Inéquations — Systèmes", ["Problèmes du premier ou du second degré à une inconnue", "Systèmes d'équations et d'inéquations", "Équations et inéquations comportant ln et exp"]),
      _mSeq("Suites numériques", ["Suites arithmétiques, suites géométriques", "Variation d'une suite numérique", "Notion de limite d'une suite numérique", "Applications des suites"]),
      _mSeq("Statistique", ["Représentations graphiques de séries statistiques", "Indicateurs d'une série statistique", "Séries statistiques à deux caractères"]),
      _mSeq("Probabilité", ["Notion de probabilité", "Calculs de probabilités", "Résolution de problèmes"]),
    ],
  },
  "Tle C": {
    "Configurations de l'espace": [
      _mSeq("Calcul vectoriel dans l'espace", ["Barycentre de n points pondérés", "Lignes de niveau", "Produit vectoriel"]),
      _mSeq("Applications de l'espace", ["Projections", "Translations et homothéties", "Symétries orthogonales"]),
    ],
    "Organisation des données": [
      _mSeq("Systèmes linéaires"),
      _mSeq("Arithmétique", ["Les ensembles ℕ et ℤ", "Divisibilité dans ℤ", "PPCM et PGCD", "Nombres premiers"]),
      _mSeq("Nombres complexes", ["Étude algébrique", "Étude trigonométrique", "Utilisation des nombres complexes"]),
      _mSeq("Limites et continuité", ["Limites d'une fonction", "Étude d'une branche infinie", "Continuité d'une fonction"]),
      _mSeq("Étude de fonctions", ["Dérivation", "Études de fonctions"]),
      _mSeq("Primitives", ["Primitives d'une fonction", "Fonction logarithme népérien", "Fonctions comportant ln", "Logarithme décimal"]),
      _mSeq("Logarithme népérien", ["Fonction logarithme népérien"]),
      _mSeq("Exponentielle népérienne", ["Fonction exponentielle", "Fonctions comportant exp"]),
      _mSeq("Fonctions puissances"),
      _mSeq("Calcul intégral", ["Intégrale d'une fonction continue", "Techniques de calcul intégral", "Applications du calcul intégral"]),
      _mSeq("Équations différentielles", ["Généralités", "Équations du type y' - ay = 0", "Équations du type y'' + ay' + by = 0"]),
      _mSeq("Probabilité", ["Analyse combinatoire", "Calculs de probabilités", "Variable aléatoire"]),
      _mSeq("Suites numériques", ["Étude globale d'une suite numérique : Suites Arithmétiques & Suites Géométriques", "Limite d'une suite numérique", "Compléments sur les suites"]),
    ],
    "Lieux géométriques dans le plan": [
      _mSeq("Isométries du plan", ["Composition d'isométries", "Classification des isométries du plan"]),
      _mSeq("Applications affines"),
      _mSeq("Similitudes", ["Similitudes directes du plan", "Similitudes directes et problèmes de géométrie"]),
      _mSeq("Coniques", ["Étude générale des coniques", "Étude de la parabole", "Étude de l'ellipse", "Étude de l'hyperbole"]),
    ],
  },
  "Tle D": MATHS_SA_DETAILS["Tle D"], // pas de sommaire de manuel disponible pour Tle D -- repli 1 niveau
};

// PCT n'est pas enseigné en série littéraire (AB) au Bénin. Programme
// officiel INIFRCF & DIPIQ — même source que New_model/backend/subjects/pct.py
// (Architecture_magasins_PCT.pdf). Une épreuve de PCT est composée de DEUX
// PARTIES INDÉPENDANTES (Physique et Chimie), chacune avec ses 3 sous-tâches
// et ses propres notions — voir SUBJECT_PARTS plus bas, plutôt qu'un pool
// unique de 3 comme les maths/SVT.
//
// Les notions sont désormais au niveau SA (Situation d'Apprentissage) du
// guide officiel, pas au niveau fin d'avant (ex. "Équilibre d'un solide" est
// devenu "Équilibre d'un solide et conversion d'énergie", toute la SA) —
// demande explicite utilisateur, miroir exact de pct.py::NOTIONS_PHYSIQUE/
// NOTIONS_CHIMIE (mêmes chaînes, pour que le lookup de profondeur programme
// côté New_model reste cohérent, cf. pct_depth_data.py::DEPTH_PCT_PAR_SA_NUM).
const PCT_NOTIONS_PHYSIQUE: Record<string, string[]> = {
  "6e": ["Le courant électrique", "La fabrication d'une lampe de poche", "L'eau dans ses différents états physiques", "La fabrication d'un instrument de production de son"],
  "5e": ["Le courant électrique alternatif", "Protection des personnes et des biens contre les dangers du courant électrique", "Propagation rectiligne de la lumière et applications", "Propriétés physiques des gaz", "Dilatation et contraction des liquides – Fabrication d'un thermomètre à alcool"],
  "4e": ["Utilisation des appareils de mesure de quelques grandeurs électriques – Vérification de la loi d'Ohm", "Interactions mécaniques – Forces et poulies", "Propagation de la lumière", "Fabrication d'un dynamomètre et d'une chambre noire"],
  "3e": ["Équilibre d'un solide et conversion d'énergie", "L'énergie électrique, un besoin indispensable", "Fabrication d'un détecteur de courant électrique et d'un électrolyseur", "L'optique au service de l'homme"],
  "2nde C": ["Le courant électrique dans les composants électriques", "La réalisation d'un montage électronique", "Les chocs et collisions entre solides en mouvement"],
  "2nde D": ["Le courant électrique dans les composants électriques", "La réalisation d'un montage électronique", "Les chocs et collisions entre solides en mouvement"],
  "1ère C": ["L'énergie mécanique au service du développement", "Réalisation d'une source de tension électrique continue stabilisée", "Température et chaleur", "Vibration, propagation et interférences : trois phénomènes physiques utiles dans la technologie des ondes"],
  "1ère D": ["L'énergie mécanique au service du développement", "Réalisation d'une source de tension électrique continue stabilisée", "Température et chaleur", "Vibration, propagation et interférences : trois phénomènes physiques utiles dans la technologie des ondes"],
  "Tle C": ["Champs de forces et interactions", "Les oscillations mécaniques et électriques", "Optique géométrique et physique", "Physique atomique et nucléaire (« L'énergie de l'infiniment petit et la science »)"],
  "Tle D": ["Champs de forces et interactions", "Les oscillations mécaniques et électriques", "Optique géométrique et physique", "Physique atomique et nucléaire (« L'énergie de l'infiniment petit et la science »)"],
};

const PCT_NOTIONS_CHIMIE: Record<string, string[]> = {
  "6e": ["Quelques combustions vives", "La pollution de l'air"],
  "5e": ["Structure de la matière"],
  "4e": ["Structure d'un atome – Quelques propriétés physiques et mécaniques de certains métaux usuels", "Étude de quelques molécules"],
  "3e": ["Quelques réactions chimiques en solution aqueuse", "Combustion complète de quelques hydrocarbures et réactions de polymérisation"],
  "2nde C": ["La matière et ses transformations", "Les ions en solution aqueuse", "La pollution des eaux superficielles et de la nappe phréatique"],
  "2nde D": ["La matière et ses transformations", "Les ions en solution aqueuse", "La pollution des eaux superficielles et de la nappe phréatique"],
  "1ère C": ["Étude de quelques composés organiques et leurs propriétés", "Explication de quelques phénomènes chimiques par les réactions conjuguées d'oxydation et de réduction"],
  "1ère D": ["Étude de quelques composés organiques et leurs propriétés", "Explication de quelques phénomènes chimiques par les réactions conjuguées d'oxydation et de réduction"],
  "Tle C": ["Chimie des solutions aqueuses et cinétique chimique", "Chimie organique"],
  "Tle D": ["Chimie des solutions aqueuses et cinétique chimique", "Chimie organique"],
};

// Détail de chaque SA (clé = titre de SA, identique aux chaînes ci-dessus) :
// ses Activités/Contenus notionnels (sous-activités, dans l'ordre du guide)
// et ses Travaux Pratiques exigibles s'il y en a — alimente la liste
// déroulante affichée au clic sur une SA (demande explicite utilisateur).
// Même source que New_model/backend/subjects/pct.py::PROGRAMME_PCT.
type SaGroup = { label: string; items: string[] };

const PCT_SA_DETAILS: Record<string, Record<string, SaGroup[]>> = {
  "6e": {
    // Regroupement par SÉQUENCE (demande explicite utilisateur, cf.
    // PCT-Guide/6e/2_contenus_notionnels_6e.md déjà validé) -- remplace
    // l'ancien regroupement plat "Activités"/"Travaux pratiques" par SA.
    // Les items restent les TEXTES EXACTS de PROGRAMME_PCT (pct.py) : le
    // backend retrouve leur contenu précis par égalité exacte sur
    // "{titre de SA} - {item}" (cf. pct.py::DEPTH, ACTIVITES_PCT). Les TP
    // sont fusionnés dans le texte de l'Activité qu'ils accompagnent
    // (jamais sélectionnables séparément), comme dans le corpus.
    "Le courant électrique": [
      { label: "Circuit électrique simple", items: ["4.1 : Quelles sont les différentes parties d'une lampe électrique et d'une pile ?", "4.2 : Comment allume-t-on une lampe électrique avec une pile ?", "4.3 : Quel est le sens conventionnel du courant électrique continu ?", "4.4 : Tous les corps conduisent-ils le courant électrique ?", "4.5 : Quand dit-on qu'une pile est adaptée à une lampe électrique ?", "4.6 : Comment schématise-t-on un circuit électrique simple ?"] },
      { label: "Association de piles", items: ["4.7 : Pourquoi et comment associe-t-on des piles en série ?"] },
      { label: "Association de lampes", items: ["4.8 : Comment et pourquoi associe-t-on des lampes électriques en série ou en parallèle ?", "4.9 : Quels sont les effets du court-circuit d'une lampe électrique dans un montage ?"] },
    ],
    "La fabrication d'une lampe de poche": [
      { label: "Lampe de poche", items: ["1 : Fabrication d'une lampe de poche : éléments essentiels ; rôle des différentes parties ; notion de masse électrique et son symbole ; schéma normalisé du circuit d'une lampe torche"] },
      { label: "Circuit d'un vélo", items: ["2 : Réparation du circuit électrique d'un vélo : éléments essentiels ; types de pannes ; techniques d'intervention ; schéma normalisé du circuit d'une bicyclette"] },
    ],
    "Quelques combustions vives": [
      { label: "Combustions vives", items: ["4.1 : Comment s'explique la combustion de la bougie ?", "4.2 : Comment s'explique la combustion du bois de chauffe ?", "4.3 : Comment s'explique la combustion du pétrole ?", "4.4 : Quels sont les produits issus de la combustion de la bougie et du bois de chauffe ?"] },
      { label: "Composition de l'air", items: ["4.5 : Quels sont les constituants de l'air ?"] },
      { label: "Triangle du feu", items: ["4.6 : Quelles sont les conditions d'activation ou de maîtrise d'un feu ?"] },
    ],
    "L'eau dans ses différents états physiques": [
      { label: "États de l'eau", items: ["1 : Les états physiques de l'eau : solide, liquide, gazeux"] },
      { label: "Changements d'état", items: ["4.1 : Quels sont les changements d'états physiques de l'eau ?", "2 : Changements d'états : solidification ; fusion de la glace ; vaporisation et évaporation ; condensation ; sublimation du diiode ou du naphtalène", "4.2 : Quand est-ce que l'eau passe de l'état liquide à l'état solide ?", "4.3 : Quand est-ce que l'eau passe de l'état solide à l'état liquide ?", "4.4 : Quand est-ce que l'eau passe de l'état liquide à l'état vapeur et inversement ?", "4.5 : Comment s'effectue la sublimation du naphtalène ?"] },
      { label: "Distillateur", items: ["3 : Fabrication d'un distillateur : différentes parties et leur rôle"] },
      { label: "Dispositif à glace", items: ["4 : Fabrication d'un dispositif d'obtention de la glace : constituants ; rôle des parties ; mélange réfrigérant"] },
    ],
    "La pollution de l'air": [
      { label: "Pollution de l'air", items: ["7.1 : Quels sont les causes et les effets néfastes des feux de végétation, des pluies acides et des gaz d'échappement sur l'environnement ?", "7.2 : Quelles sont les conséquences des changements climatiques ?", "7.3 : Comment l'homme peut-il satisfaire ses besoins actuels relatifs à la combustion sans compromettre ceux des générations futures ?"] },
    ],
    "La fabrication d'un instrument de production de son": [
      { label: "Instruments de musique", items: ["Fabrication d'objets acoustiques : instruments à membrane, à corde, à vent, de percussion"] },
    ],
  },
  "5e": {
    // Regroupement par SÉQUENCE (cf. PCT-Guide/5e/2_contenus_notionnels_5e.md).
    "Le courant électrique alternatif": [
      { label: "Courant alternatif", items: ["4.1 : Quelles sont les caractéristiques du courant électrique alternatif ?", "4.2 : Quelle utilisation fait-on du courant électrique alternatif ?"] },
      { label: "Production du courant", items: ["4.3 : Quelles sont les propriétés d'un aimant ?", "4.4 : Quel est le comportement d'une bobine traversée par un courant électrique continu ?", "4.5 : Comment produire du courant électrique à l'aide d'une bobine et d'un aimant ?", "4.6 : Quelles sont les caractéristiques du courant électrique produit par un alternateur de bicyclette ?"] },
      { label: "Tournevis testeur", items: ["4.7 : Quelles sont les différentes parties et le rôle d'un tournevis testeur ?", "4.8 : Comment utilise-t-on le tournevis testeur pour identifier les bornes d'une prise de courant ?"] },
    ],
    "Protection des personnes et des biens contre les dangers du courant électrique": [
      { label: "Dangers du courant", items: ["7.1 (partie 1) : Quels sont les dangers du courant électrique sur le corps humain et comment se manifestent-ils ?"] },
      { label: "Anomalies d'un circuit", items: ["7.1 (partie 2) : Quels sont les dangers du courant électrique liés aux anomalies d'un circuit (court-circuit, surcharge) ?"] },
      { label: "Dispositifs de protection", items: ["7.2 : Quels sont les moyens de protection des personnes et des biens contre les dangers du courant électrique ?"] },
      { label: "Urgences électriques", items: ["7.3 : Quelles sont les conduites à tenir en cas d'urgence liée aux dangers du courant électrique ?"] },
    ],
    "Structure de la matière": [
      { label: "Atomes et molécules", items: ["4.1 : Structure particulaire de la matière : atomes, molécules, symbole, formule chimique", "4.2 : Utilisation du modèle moléculaire (corps purs simples, composés et mélanges)"] },
      { label: "Mélanges et séparation", items: ["4.3 : Quelles sont les différentes sortes de mélanges et comment séparer leurs constituants ?"] },
      { label: "Solutions", items: ["4.4 : Solution (soluté, solvant) : solution diluée, concentrée et saturée"] },
      { label: "La mole", items: ["4.5 : La mole : masse molaire atomique, masse molaire moléculaire, volume molaire, concentration molaire", "4.6 : Comment déterminer les concentrations massique et molaire d'une solution aqueuse ?"] },
    ],
    "Propagation rectiligne de la lumière et applications": [
      { label: "Sources de lumière", items: ["4.1 : Quelles sont les différentes sources et récepteurs de lumière ?"] },
      { label: "Propagation rectiligne", items: ["4.2 : Comment se propage la lumière et qu'est-ce qu'un rayon lumineux ?", "4.3 : Qu'est-ce qu'un corps opaque, translucide et transparent ?"] },
      { label: "Réflexion de la lumière", items: ["4.4 : Qu'est-ce que la réflexion de la lumière, ses applications et les réflexions multiples ?", "4.5 : Comment explique-t-on l'image donnée par un miroir plan ?"] },
      { label: "Périscope et kaléidoscope", items: ["Démarche technologique : fabrication d'un périscope à miroirs ou d'un kaléidoscope (principe de fonctionnement, étapes de fabrication)"] },
    ],
    "Propriétés physiques des gaz": [
      { label: "Propriétés des gaz", items: ["4.1 : Le gaz a-t-il une forme et un volume propres ?", "4.2 : Le gaz a-t-il une masse ?", "4.3 : Les gaz sont-ils expansibles, compressibles et élastiques ?", "4.4 : Comment transvase-t-on les gaz ?", "4.5 : Comment mettre en évidence la dilatation des gaz ?"] },
      { label: "Pression des gaz", items: ["4.6 : Comment mettre en évidence la pression atmosphérique ?", "4.7 : Comment mesure-t-on la pression atmosphérique ?", "4.8 : Comment mesure-t-on la pression d'un gaz ?"] },
    ],
    "Dilatation et contraction des liquides – Fabrication d'un thermomètre à alcool": [
      { label: "Chaleur et température", items: ["4.1 : Quels sont les modes de transfert de la chaleur ?", "4.2 : Qu'est-ce que l'équilibre thermique ?"] },
      { label: "Dilatation des liquides", items: ["4.3 : Comment les liquides se dilatent-ils ou se contractent-ils ?"] },
      { label: "Thermomètre à alcool", items: ["Démarche technologique : fabrication d'un thermomètre à alcool (principe de fonctionnement, étapes de fabrication)"] },
    ],
  },
  "4e": {
    // Regroupement par SÉQUENCE (cf. PCT-Guide/4e/2_contenus_notionnels_4e.md).
    "Utilisation des appareils de mesure de quelques grandeurs électriques – Vérification de la loi d'Ohm": [
      { label: "Appareils de mesure", items: ["5.1 : Mesure de quelques grandeurs électriques"] },
      { label: "Lois des circuits", items: ["5.2 : Vérification de l'unicité de l'intensité et de l'additivité des tensions dans un circuit en série", "5.3 : Vérification de l'unicité de la tension et de l'additivité des intensités dans un circuit en dérivation"] },
      { label: "Loi d'Ohm", items: ["5.4 : Vérification de la loi d'Ohm"] },
      { label: "Résistance équivalente", items: ["5.5 : Résistance équivalente de deux conducteurs ohmiques"] },
    ],
    "Structure d'un atome – Quelques propriétés physiques et mécaniques de certains métaux usuels": [
      { label: "Constitution de l'atome", items: ["4.1 : Quand parle-t-on d'électrisation d'un corps et quels sont les différents types de charge électrique ?", "4.2 : De quoi est constitué l'atome ?"] },
      { label: "Structure électronique", items: ["4.3 : Quelle est la structure électronique des atomes ?"] },
      { label: "Ions et ionisation", items: ["4.4 : Comment les atomes s'ionisent-ils ?"] },
      { label: "Métaux usuels", items: ["4.5 : Quelles sont les propriétés physiques des métaux usuels ?", "4.6 : Quelles sont les propriétés mécaniques des métaux usuels ?"] },
      { label: "Alliages", items: ["4.7 : Qu'est-ce qu'un alliage et quelle est son importance ?"] },
    ],
    "Interactions mécaniques – Forces et poulies": [
      { label: "Forces et interactions", items: ["4.1 : Qu'est-ce qu'une interaction mécanique ?", "4.2 : Qu'est-ce qu'une force et quelles sont ses caractéristiques ?"] },
      { label: "Dynamomètre", items: ["4.3 : Comment mesure-t-on l'intensité d'une force et comment la représente-t-on ?", "4.10 : Comment étalonner un ressort ?"] },
      { label: "Poids et poussée d'Archimède", items: ["4.4 : Qu'appelle-t-on poids d'un corps ?", "4.5 : Comment représente-t-on la tension d'un fil ou d'un ressort et la réaction d'un support ?", "4.6 : Qu'est-ce que la poussée d'Archimède ?"] },
      { label: "Résultante de forces", items: ["4.7 : Comment déterminer la résultante de deux forces colinéaires ?", "4.8 : Comment déterminer la résultante de deux forces parallèles de même sens ?", "4.9 : Comment déterminer la résultante de deux forces concourantes ?"] },
      { label: "Poulies et palans", items: ["4.11 : Quel est l'intérêt de l'utilisation d'une poulie simple ?", "4.12 : Quelles sont les relations entre les intensités des forces et les déplacements au cours de l'utilisation d'un palan ?"] },
    ],
    "Étude de quelques molécules": [
      { label: "Liaison covalente", items: ["4.1 : Comment les atomes sont-ils liés dans une molécule ?"] },
      { label: "Combustions dans le dioxygène", items: ["4.2 : Comment s'effectue la combustion du carbone dans le dioxygène ?", "4.3 : Comment s'effectue la combustion du soufre dans le dioxygène ?", "4.4 : Comment s'effectue la combustion du fer dans le dioxygène ?"] },
      { label: "Hydrocarbures simples", items: ["4.5 : Quelles sont les propriétés physiques des hydrocarbures ?"] },
    ],
    "Propagation de la lumière": [
      { label: "Ombre et pénombre", items: ["4.1 : Comment réalise-t-on une ombre, une pénombre ?"] },
      { label: "Éclipses et phases lunaires", items: ["4.2 : Comment s'expliquent les différents aspects de la Lune lors de son mouvement ?", "4.3 : Comment s'expliquent les éclipses du Soleil et de la Lune ?"] },
      { label: "Réfraction", items: ["4.4 : Qu'est-ce que la réfraction de la lumière ?"] },
    ],
    "Fabrication d'un dynamomètre et d'une chambre noire": [
      { label: "Fabrication d'un dynamomètre", items: ["Dynamomètre : ressort hélicoïdal (récupération) ; étalonnage ; graduations ; anneau et crochet"] },
      { label: "Chambre noire", items: ["Chambre noire : boîte percée d'un trou avec écran translucide ; conditions d'obtention de l'image ; fixation de l'écran ; confection du cache pour la netteté"] },
    ],
  },
  "3e": {
    // Regroupement par SÉQUENCE (cf. PCT-Guide/3e/2_contenus_notionnels_3e.md).
    "Équilibre d'un solide et conversion d'énergie": [
      { label: "Équilibre d'un solide", items: ["4.1 : Quels sont les différents types d'équilibre qui existent ?", "4.2 : Quand dit-on qu'un solide est animé d'un mouvement de translation rectiligne ?", "4.3 : À quelles conditions un solide en translation soumis à deux forces, à trois forces concourantes ou à des forces parallèles est-il en équilibre ?"] },
      { label: "Leviers et treuil", items: ["4.4 : Quand dit-on qu'un solide est animé d'un mouvement de rotation ?", "4.5 : Quelle est l'expression de la grandeur qui caractérise l'effet de rotation d'une force et d'un couple de forces ?", "4.6 : À quelle condition un solide mobile autour d'un axe fixe et soumis à plusieurs forces est-il en équilibre ?", "4.7 : À quelles situations de vie courante s'applique le théorème des moments ?"] },
      { label: "Travail et puissance", items: ["4.8 : À quelle condition une force travaille-t-elle et quand ce travail est-il moteur, résistant ou nul ?", "4.9 : Quelle est l'expression du travail d'une force constante lors d'un déplacement rectiligne ?", "4.10 : Quelle est l'expression du travail effectué par une force appliquée à un solide en rotation ?", "4.11 : Quelle est l'expression de la puissance d'une force ou d'un couple de forces ?"] },
      { label: "Formes d'énergie", items: ["4.12 : Quelles sont les différentes formes d'énergie, leur transfert et conversion ?"] },
    ],
    "Quelques réactions chimiques en solution aqueuse": [
      { label: "Solutions aqueuses", items: ["4.1 : Comment prépare-t-on une solution aqueuse d'une concentration donnée ?"] },
      { label: "Solutions ioniques", items: ["4.2 : Comment identifie-t-on les solutions aqueuses ioniques et non ioniques ?", "4.3 : Comment identifie-t-on le caractère acide, basique ou neutre d'une solution aqueuse ?", "4.6 : Comment identifie-t-on les ions en solution aqueuse ?"] },
      { label: "Réactions acide-base", items: ["4.4 : Comment explique-t-on une réaction acide-base ?", "4.5 : Comment les acides réagissent-ils avec les métaux usuels ?"] },
      { label: "Électrolyse", items: ["4.7 : Comment réalise-t-on l'électrolyse d'une solution aqueuse ionique ?"] },
    ],
    "L'énergie électrique, un besoin indispensable": [
      { label: "Production de l'électricité", items: ["4.1 : Quel est le principe de production du courant alternatif et quelles sont les caractéristiques de la tension alternative produite ?", "4.2 : Quels sont les éléments intervenant dans la distribution du courant électrique ?"] },
      { label: "Transformateurs", items: ["4.3 : Qu'est-ce qu'un transformateur et quel est son rôle ?", "4.4 : Comment produire une tension continue à partir de la tension alternative ?"] },
      { label: "Puissance électrique", items: ["4.5 : Qu'est-ce que la puissance électrique ?", "4.6 : Qu'est-ce que l'énergie électrique ?"] },
      { label: "Loi de Joule", items: ["4.7 : Comment met-on en évidence l'effet Joule dans un conducteur ohmique ?", "4.8 : Comment fait-on le bilan énergétique dans un circuit électrique ?"] },
    ],
    "Fabrication d'un détecteur de courant électrique et d'un électrolyseur": [
      { label: "DEL et transistor", items: ["Fonctionnement de la DEL, étude qualitative du transistor, schéma du circuit du détecteur ; fabrication et emboîtage du détecteur"] },
      { label: "Électrolyseur", items: ["Électrodes (cathode, anode), constitution et formes de l'électrolyseur, schéma ; fabrication de l'électrolyseur ; identification des produits recueillis aux électrodes"] },
    ],
    "Combustion complète de quelques hydrocarbures et réactions de polymérisation": [
      { label: "Hydrocarbures", items: ["4.1 : Qu'est-ce qu'un hydrocarbure ?", "4.3 : Comment préparer l'acétylène et le méthane au laboratoire ?"] },
      { label: "Combustion des hydrocarbures", items: ["4.2 : Comment réaliser la combustion complète d'un hydrocarbure ?"] },
      { label: "Polymérisation", items: ["4.4 : Qu'est-ce qu'une réaction de polymérisation ?", "4.5 : Quels sont les avantages et les inconvénients de l'utilisation des matières plastiques ?"] },
    ],
    "L'optique au service de l'homme": [
      { label: "Lentilles convergentes", items: ["4.1 : Quels sont les différents types de lentilles et comment les reconnaît-on dans la pratique ?", "4.2 : Quelles sont les caractéristiques d'une lentille convergente ?", "4.3 : Comment détermine-t-on expérimentalement le foyer principal image et la distance focale d'une lentille ?", "4.4 : Comment vérifie-t-on expérimentalement la relation de conjugaison et du grandissement ?", "4.5 : Comment construit-on graphiquement l'image d'un objet à travers une lentille mince convergente ?"] },
      { label: "Défauts de l'œil", items: ["4.6 : Quels sont les défauts de l'œil et comment les corrige-t-on ?"] },
      { label: "Lumière blanche", items: ["4.7 : Comment décompose-t-on la lumière blanche et explique-t-on la formation de l'arc-en-ciel ?", "4.8 : Comment synthétise-t-on la lumière blanche ?"] },
    ],
  },
  "2nde C": {
    // Regroupement par SÉQUENCE (cf. PCT-Guide/2nde-C/2_contenus_notionnels_2ndeC.md).
    // Certains items du guide sont partagés par plusieurs séquences (le guide ne
    // les numérote pas plus finement) : le même item apparaît alors sous
    // plusieurs groupes, chacun donnant accès au contenu notionnel propre à sa
    // séquence (cf. pct_depth_data.py::_2NDE, champ "activites").
    "Le courant électrique dans les composants électriques": [
      { label: "Courant continu et alternatif", items: ["1 : Courant électrique continu : porteurs de charge, sens conventionnel, mesure de l'intensité, quantité d'électricité", "4 : Courant alternatif ; tensions électriques variables"] },
      { label: "Tension électrique", items: ["2 : Tension électrique continue (différence de potentiel) et sa mesure"] },
      { label: "Oscilloscope", items: ["3 : Voltmètre, multimètre, oscilloscope"] },
      { label: "Dipôles passifs", items: ["5 (dipôles passifs) : Dipôles passifs : résistor, photorésistor, thermistor, varistor (caractéristiques U = f(I) et I = g(U))"] },
      { label: "Conducteur ohmique", items: ["5 (résistance et effet Joule du conducteur ohmique) : Résistance de conducteurs ohmiques"] },
      { label: "Associations de résistors", items: ["5 (association de conducteurs ohmiques) : Association de conducteurs ohmiques"] },
      { label: "Diode et diode Zener", items: ["5 (diode au silicium, diode Zener, photodiode) : Diode au silicium, diode Zener, photodiode"] },
      { label: "Générateur et fem", items: ["6 : Dipôles actifs : générateur (caractéristique u = f(i), résistance interne, force électromotrice)"] },
      { label: "Point de fonctionnement", items: ["7 : Point de fonctionnement d'un circuit"] },
    ],
    "La matière et ses transformations": [
      { label: "Structure de l'atome", items: ["1 : Élément chimique ; atomes, électrons, noyau (protons et neutrons) ; nucléides, isotopes"] },
      { label: "Classification périodique", items: ["2 : Classification périodique des éléments"] },
      { label: "Molécules et liaison covalente", items: ["3 : Molécule et liaison covalente (représentation de Lewis)"] },
      { label: "Équation-bilan", items: ["5 : Équation-bilan d'une réaction chimique ; loi de Lavoisier ; bilans molaires et massiques"] },
      { label: "Quantités de matière", items: ["6 : Quantité de matière : la mole ; constante d'Avogadro ; loi d'Avogadro-Ampère ; volume molaire"] },
    ],
    "La réalisation d'un montage électronique": [
      { label: "Transistor", items: ["Construction de nouveaux savoirs : étude expérimentale du transistor"] },
      { label: "Amplificateur opérationnel", items: ["Construction de nouveaux savoirs : amplificateur opérationnel"] },
      { label: "Montage électronique (projet)", items: ["Étapes du projet ; tableau de répartition des tâches (planning)", "Exemples de montages : dispositif de protection contre le vol ; détecteur de niveau d'eau", "Schéma normalisé du dispositif à fabriquer ; estimation du coût du projet"] },
    ],
    "Les ions en solution aqueuse": [
      { label: "Corps ioniques", items: ["1 (NaCl : corps pur et solution) : Chlorure de sodium : ions dans le corps pur et dans sa solution aqueuse ; rôle du solvant"] },
      { label: "Dissolution et concentration", items: ["1 (concentration de la solution) : Concentration de la solution de chlorure de sodium"] },
      { label: "Électrolyse de NaCl", items: ["1 (électrolyse) : Électrolyse du chlorure de sodium fondu et en solution"] },
      { label: "Solutions acides et basiques", items: ["2 : Solutions acides : acide chlorhydrique, ion H3O+", "3 : Solutions basiques : solution d'hydroxyde de sodium"] },
      { label: "Notion de pH", items: ["2 et 3 (mesure du pH) : Définition et mesure du pH ; pH de différentes solutions"] },
      { label: "Dosage acide-base", items: ["4 : Réaction entre l'acide chlorhydrique et l'hydroxyde de sodium (dosage)"] },
      { label: "Tests d'identification des ions", items: ["5 : Tests d'identification des ions : chlorure, argent, sulfate, nitrate, fer II et fer III, cuivre II, zinc, aluminium"] },
    ],
    "Les chocs et collisions entre solides en mouvement": [
      { label: "Relativité du mouvement", items: ["1 (relativité du mouvement) : Relativité du mouvement"] },
      { label: "Mouvement rectiligne uniforme", items: ["1 (mouvement rectiligne uniforme) : Mouvement rectiligne uniforme"] },
      { label: "Mouvement circulaire uniforme", items: ["1 (mouvement circulaire uniforme) : Mouvement circulaire uniforme"] },
      { label: "Vecteur vitesse", items: ["1 (vecteur vitesse) : Vecteur vitesse d'un point mobile"] },
      { label: "Centre d'inertie", items: ["2 (centre d'inertie) : Centre d'inertie"] },
      { label: "Principe d'inertie", items: ["2 (principe de l'inertie) : Principe de l'inertie"] },
      { label: "Quantité de mouvement", items: ["3 : Vecteur quantité de mouvement d'un solide"] },
      { label: "Chocs et collisions", items: ["4 : Conservation du vecteur quantité de mouvement d'un système isolé (éclatement, chocs) ; exemples de variation"] },
    ],
    "La pollution des eaux superficielles et de la nappe phréatique": [
      { label: "Pollution des eaux", items: ["Analyse des eaux pour prendre position face à l'utilisation de certains produits chimiques", "Généralités sur l'eau : usages ; approvisionnement ; obtention d'une eau potable", "Sources d'eau (océans, lacs, rivières, eaux souterraines, atmosphère) et caractéristiques (température, gaz dissous, acidité, salinité)", "Produits polluants : pesticides, acides, engrais, autres produits chimiques ; leurs effets", "Formes de lutte contre la pollution des eaux"] },
    ],
  },
  "2nde D": {
    "Le courant électrique dans les composants électriques": [
      { label: "Courant continu et alternatif", items: ["1 : Courant électrique continu : porteurs de charge, sens conventionnel, mesure de l'intensité, quantité d'électricité", "4 : Courant alternatif ; tensions électriques variables"] },
      { label: "Tension électrique", items: ["2 : Tension électrique continue (différence de potentiel) et sa mesure"] },
      { label: "Oscilloscope", items: ["3 : Voltmètre, multimètre, oscilloscope"] },
      { label: "Dipôles passifs", items: ["5 (dipôles passifs) : Dipôles passifs : résistor, photorésistor, thermistor, varistor (caractéristiques U = f(I) et I = g(U))"] },
      { label: "Conducteur ohmique", items: ["5 (résistance et effet Joule du conducteur ohmique) : Résistance de conducteurs ohmiques"] },
      { label: "Associations de résistors", items: ["5 (association de conducteurs ohmiques) : Association de conducteurs ohmiques"] },
      { label: "Diode et diode Zener", items: ["5 (diode au silicium, diode Zener, photodiode) : Diode au silicium, diode Zener, photodiode"] },
      { label: "Générateur et fem", items: ["6 : Dipôles actifs : générateur (caractéristique u = f(i), résistance interne, force électromotrice)"] },
      { label: "Point de fonctionnement", items: ["7 : Point de fonctionnement d'un circuit"] },
    ],
    "La matière et ses transformations": [
      { label: "Structure de l'atome", items: ["1 : Élément chimique ; atomes, électrons, noyau (protons et neutrons) ; nucléides, isotopes"] },
      { label: "Classification périodique", items: ["2 : Classification périodique des éléments"] },
      { label: "Molécules et liaison covalente", items: ["3 : Molécule et liaison covalente (représentation de Lewis)"] },
      { label: "Équation-bilan", items: ["5 : Équation-bilan d'une réaction chimique ; loi de Lavoisier ; bilans molaires et massiques"] },
      { label: "Quantités de matière", items: ["6 : Quantité de matière : la mole ; constante d'Avogadro ; loi d'Avogadro-Ampère ; volume molaire"] },
    ],
    "La réalisation d'un montage électronique": [
      { label: "Transistor", items: ["Construction de nouveaux savoirs : étude expérimentale du transistor"] },
      { label: "Amplificateur opérationnel", items: ["Construction de nouveaux savoirs : amplificateur opérationnel"] },
      { label: "Montage électronique (projet)", items: ["Étapes du projet ; tableau de répartition des tâches (planning)", "Exemples de montages : dispositif de protection contre le vol ; détecteur de niveau d'eau", "Schéma normalisé du dispositif à fabriquer ; estimation du coût du projet"] },
    ],
    "Les ions en solution aqueuse": [
      { label: "Corps ioniques", items: ["1 (NaCl : corps pur et solution) : Chlorure de sodium : ions dans le corps pur et dans sa solution aqueuse ; rôle du solvant"] },
      { label: "Dissolution et concentration", items: ["1 (concentration de la solution) : Concentration de la solution de chlorure de sodium"] },
      { label: "Électrolyse de NaCl", items: ["1 (électrolyse) : Électrolyse du chlorure de sodium fondu et en solution"] },
      { label: "Solutions acides et basiques", items: ["2 : Solutions acides : acide chlorhydrique, ion H3O+", "3 : Solutions basiques : solution d'hydroxyde de sodium"] },
      { label: "Notion de pH", items: ["2 et 3 (mesure du pH) : Définition et mesure du pH ; pH de différentes solutions"] },
      { label: "Dosage acide-base", items: ["4 : Réaction entre l'acide chlorhydrique et l'hydroxyde de sodium (dosage)"] },
      { label: "Tests d'identification des ions", items: ["5 : Tests d'identification des ions : chlorure, argent, sulfate, nitrate, fer II et fer III, cuivre II, zinc, aluminium"] },
    ],
    "Les chocs et collisions entre solides en mouvement": [
      { label: "Relativité du mouvement", items: ["1 (relativité du mouvement) : Relativité du mouvement"] },
      { label: "Mouvement rectiligne uniforme", items: ["1 (mouvement rectiligne uniforme) : Mouvement rectiligne uniforme"] },
      { label: "Mouvement circulaire uniforme", items: ["1 (mouvement circulaire uniforme) : Mouvement circulaire uniforme"] },
      { label: "Vecteur vitesse", items: ["1 (vecteur vitesse) : Vecteur vitesse d'un point mobile"] },
      { label: "Centre d'inertie", items: ["2 (centre d'inertie) : Centre d'inertie"] },
      { label: "Principe d'inertie", items: ["2 (principe de l'inertie) : Principe de l'inertie"] },
      { label: "Quantité de mouvement", items: ["3 : Vecteur quantité de mouvement d'un solide"] },
      { label: "Chocs et collisions", items: ["4 : Conservation du vecteur quantité de mouvement d'un système isolé (éclatement, chocs) ; exemples de variation"] },
    ],
    "La pollution des eaux superficielles et de la nappe phréatique": [
      { label: "Pollution des eaux", items: ["Analyse des eaux pour prendre position face à l'utilisation de certains produits chimiques", "Généralités sur l'eau : usages ; approvisionnement ; obtention d'une eau potable", "Sources d'eau (océans, lacs, rivières, eaux souterraines, atmosphère) et caractéristiques (température, gaz dissous, acidité, salinité)", "Produits polluants : pesticides, acides, engrais, autres produits chimiques ; leurs effets", "Formes de lutte contre la pollution des eaux"] },
    ],
  },
  "1ère C": {
    // Regroupement par SÉQUENCE (cf. PCT-Guide/1ere-C/2_contenus_notionnels_1ereC.md).
    "L'énergie mécanique au service du développement": [
      { label: "Cinématique", items: ["1.1 : Vecteur espace et vecteur vitesse d'un point dans un repère donné"] },
      { label: "Translation et rotation", items: ["1.2 : Mouvement de translation d'un solide", "1.3 : Mouvement de rotation autour d'un axe fixe : vitesse angulaire, vitesse linéaire"] },
      { label: "Moment d'une force", items: ["1.4 : Moment d'une force par rapport à un axe ; moment d'un couple de forces"] },
      { label: "Travail et puissance", items: ["2.1 : Force constante", "2.2 : Solide en translation : travail élémentaire et puissance instantanée ; travail du poids ; travail d'une force de frottement", "2.3 : Solide en rotation autour d'un axe fixe"] },
      { label: "Énergie cinétique", items: ["3 : Énergie cinétique : translation ; rotation, moment d'inertie ; théorème de l'énergie cinétique"] },
      { label: "Énergie potentielle", items: ["4 : Énergie potentielle de pesanteur"] },
      { label: "Énergie mécanique", items: ["5 : Énergie mécanique totale : conservation et non-conservation"] },
    ],
    "Étude de quelques composés organiques et leurs propriétés": [
      { label: "Le carbone", items: ["1 : Le carbone, élément essentiel des composés organiques : mise en évidence ; liaisons covalentes, tétravalence"] },
      { label: "Les alcanes", items: ["2 (tétravalence, nomenclature, formule générale) : Les alcanes : tétravalence ; nomenclature ; formule générale ; isomérie"] },
      { label: "Combustion et halogénation", items: ["2 (combustion, halogénation) : Les alcanes : combustion ; halogénation"] },
      { label: "Alcènes et alcynes", items: ["3 (structure, nomenclature) : Hydrocarbures insaturés : structure ; nomenclature ; isomérie Z/E ; test de reconnaissance"] },
      { label: "Additions et polymérisation", items: ["3 (additions, polymérisation) : Additions (H2, HCl, H2O) sur alcènes et alcynes ; polymérisation"] },
    ],
    "Réalisation d'une source de tension électrique continue stabilisée": [
      { label: "Champ électrostatique", items: ["1 (vecteur champ ; champ uniforme) : Vecteur champ électrostatique ; champ uniforme"] },
      { label: "Énergie potentielle électrique", items: ["1 (travail de la force électrostatique ; d.d.p. ; énergie potentielle) : Travail de la force électrostatique ; énergie potentielle électrique"] },
      { label: "Effet Joule", items: ["2 (loi de Joule) : Puissance électrique : loi de Joule"] },
      { label: "Loi d'Ohm généralisée", items: ["2 (loi d'Ohm pour générateur et récepteur) : Loi d'Ohm pour générateur et récepteur"] },
      { label: "Bilan énergétique", items: ["2 (bilan énergétique, loi de Pouillet) : Bilan énergétique d'un générateur et d'un récepteur"] },
      { label: "Diodes et semi-conducteurs", items: ["4 (diode Zener) : Diodes et semi-conducteurs : fonctionnement, caractéristique, diode Zener"] },
      { label: "Redressement et filtrage", items: ["4 (transformateur, pont de diodes, filtrage) : Redressement et filtrage : transformateur, pont de diodes, condensateur"] },
      { label: "Source stabilisée (projet)", items: ["4 (réalisation du projet) : Conduite du projet ; réalisation et test du dispositif", "Schéma normalisé du dispositif à fabriquer ; estimation du coût du projet"] },
    ],
    "Explication de quelques phénomènes chimiques par les réactions conjuguées d'oxydation et de réduction": [
      { label: "Oxydoréduction", items: ["1.1 : Action de solutions acides sur les métaux", "1.2 : Réaction entre un métal et un ion métallique"] },
      { label: "Couples oxydant/réducteur", items: ["1.3 : Couple oxydant-réducteur", "1.4 : Potentiel d'oxydoréduction", "1.5 : Généralisation du couple oxydant-réducteur ; dosages par oxydoréduction", "3 : Applications : électrolyse en solution aqueuse ; piles électrochimiques ; corrosion des métaux (cas du fer)"] },
    ],
    "Température et chaleur": [
      { label: "Calorimétrie", items: ["2 : La calorimétrie"] },
      { label: "Lois des gaz", items: ["3 : Lois des gaz parfaits : état gazeux ; compressibilité isotherme, loi de Mariotte ; dilatation ; équation d'état pV = nRT"] },
      { label: "Conservation de l'énergie", items: ["1 : Conversions réciproques énergie mécanique ↔ énergie thermique"] },
    ],
    "Vibration, propagation et interférences : trois phénomènes physiques utiles dans la technologie des ondes": [
      { label: "Types d'ondes", items: ["1 : Types d'ondes et propagation : mécaniques, acoustiques, lumineuses, hertziennes"] },
      { label: "Onde progressive périodique", items: ["2 : Caractère périodique des ondes vibratoires entretenues"] },
      { label: "Diffraction et dispersion", items: ["3 : Propriétés des ondes : réflexion, transmission, réfraction, diffraction"] },
      { label: "Interférences", items: ["4 : Superposition des ondes : les interférences"] },
    ],
  },
  "1ère D": {
    "L'énergie mécanique au service du développement": [
      { label: "Cinématique", items: ["1.1 : Vecteur espace et vecteur vitesse d'un point dans un repère donné"] },
      { label: "Translation et rotation", items: ["1.2 : Mouvement de translation d'un solide", "1.3 : Mouvement de rotation autour d'un axe fixe : vitesse angulaire, vitesse linéaire"] },
      { label: "Moment d'une force", items: ["1.4 : Moment d'une force par rapport à un axe ; moment d'un couple de forces"] },
      { label: "Travail et puissance", items: ["2.1 : Force constante", "2.2 : Solide en translation : travail élémentaire et puissance instantanée ; travail du poids ; travail d'une force de frottement", "2.3 : Solide en rotation autour d'un axe fixe"] },
      { label: "Énergie cinétique", items: ["3 : Énergie cinétique : translation ; rotation, moment d'inertie ; théorème de l'énergie cinétique"] },
      { label: "Énergie potentielle", items: ["4 : Énergie potentielle de pesanteur"] },
      { label: "Énergie mécanique", items: ["5 : Énergie mécanique totale : conservation et non-conservation"] },
    ],
    "Étude de quelques composés organiques et leurs propriétés": [
      { label: "Le carbone", items: ["1 : Le carbone, élément essentiel des composés organiques : mise en évidence ; liaisons covalentes, tétravalence"] },
      { label: "Les alcanes", items: ["2 (tétravalence, nomenclature, formule générale) : Les alcanes : tétravalence ; nomenclature ; formule générale ; isomérie"] },
      { label: "Combustion et halogénation", items: ["2 (combustion, halogénation) : Les alcanes : combustion ; halogénation"] },
      { label: "Alcènes et alcynes", items: ["3 (structure, nomenclature) : Hydrocarbures insaturés : structure ; nomenclature ; isomérie Z/E ; test de reconnaissance"] },
      { label: "Additions et polymérisation", items: ["3 (additions, polymérisation) : Additions (H2, HCl, H2O) sur alcènes et alcynes ; polymérisation"] },
    ],
    "Réalisation d'une source de tension électrique continue stabilisée": [
      { label: "Champ électrostatique", items: ["1 (vecteur champ ; champ uniforme) : Vecteur champ électrostatique ; champ uniforme"] },
      { label: "Énergie potentielle électrique", items: ["1 (travail de la force électrostatique ; d.d.p. ; énergie potentielle) : Travail de la force électrostatique ; énergie potentielle électrique"] },
      { label: "Effet Joule", items: ["2 (loi de Joule) : Puissance électrique : loi de Joule"] },
      { label: "Loi d'Ohm généralisée", items: ["2 (loi d'Ohm pour générateur et récepteur) : Loi d'Ohm pour générateur et récepteur"] },
      { label: "Bilan énergétique", items: ["2 (bilan énergétique, loi de Pouillet) : Bilan énergétique d'un générateur et d'un récepteur"] },
      { label: "Diodes et semi-conducteurs", items: ["4 (diode Zener) : Diodes et semi-conducteurs : fonctionnement, caractéristique, diode Zener"] },
      { label: "Redressement et filtrage", items: ["4 (transformateur, pont de diodes, filtrage) : Redressement et filtrage : transformateur, pont de diodes, condensateur"] },
      { label: "Source stabilisée (projet)", items: ["4 (réalisation du projet) : Conduite du projet ; réalisation et test du dispositif", "Schéma normalisé du dispositif à fabriquer ; estimation du coût du projet"] },
    ],
    "Explication de quelques phénomènes chimiques par les réactions conjuguées d'oxydation et de réduction": [
      { label: "Oxydoréduction", items: ["1.1 : Action de solutions acides sur les métaux", "1.2 : Réaction entre un métal et un ion métallique"] },
      { label: "Couples oxydant/réducteur", items: ["1.3 : Couple oxydant-réducteur", "1.4 : Potentiel d'oxydoréduction", "1.5 : Généralisation du couple oxydant-réducteur ; dosages par oxydoréduction", "3 : Applications : électrolyse en solution aqueuse ; piles électrochimiques ; corrosion des métaux (cas du fer)"] },
    ],
    "Température et chaleur": [
      { label: "Calorimétrie", items: ["2 : La calorimétrie"] },
      { label: "Lois des gaz", items: ["3 : Lois des gaz parfaits : état gazeux ; compressibilité isotherme, loi de Mariotte ; dilatation ; équation d'état pV = nRT"] },
      { label: "Conservation de l'énergie", items: ["1 : Conversions réciproques énergie mécanique ↔ énergie thermique"] },
    ],
    "Vibration, propagation et interférences : trois phénomènes physiques utiles dans la technologie des ondes": [
      { label: "Types d'ondes", items: ["1 : Types d'ondes et propagation : mécaniques, acoustiques, lumineuses, hertziennes"] },
      { label: "Onde progressive périodique", items: ["2 : Caractère périodique des ondes vibratoires entretenues"] },
      { label: "Diffraction et dispersion", items: ["3 : Propriétés des ondes : réflexion, transmission, réfraction, diffraction"] },
      { label: "Interférences", items: ["4 : Superposition des ondes : les interférences"] },
    ],
  },
  "Tle C": {
    // Regroupement par SÉQUENCE (cf. PCT-Guide/Tle-C/2_contenus_notionnels_TleC.md).
    "Champs de forces et interactions": [
      { label: "Cinématique du point", items: ["1 (vecteurs position, vitesse, accélération) : Cinématique : vecteurs position, vitesse, accélération tangentielle et normale ; rayon de courbure"] },
      { label: "Mouvements particuliers", items: ["1 (mouvements rectilignes et circulaire) : Mouvements rectilignes (uniforme, uniformément varié, sinusoïdal) ; mouvement circulaire uniforme"] },
      { label: "Interaction gravitationnelle", items: ["2 : Interaction gravitationnelle : loi de gravitation ; champ de gravitation ; champ de pesanteur"] },
      { label: "Champ électrostatique", items: ["3 : Champ électrostatique : force électrique, charge et champ ; condensateur plan"] },
      { label: "Champ magnétique", items: ["4 : Champ magnétique : mise en évidence ; aimants et bobines ; vecteur champ ; spectres ; mesure ; champ terrestre ; champ uniforme"] },
      { label: "Lois de Newton", items: ["5 : Lois de Newton : principe de l'inertie ; théorème du centre d'inertie ; principe d'interaction ; théorème de l'énergie cinétique"] },
      { label: "Satellites et lois de Képler", items: ["6 : Mouvement des satellites et des planètes : satellites terrestres, géostationnaires ; lois de Kepler ; système solaire"] },
      { label: "Chute dans le champ de pesanteur", items: ["7 : Mouvement dans le champ de pesanteur terrestre"] },
      { label: "Particule en champ E", items: ["8 : Particule chargée dans un champ électrique uniforme : étude dynamique, énergétique ; déflexion électrique"] },
      { label: "Particule en champ B", items: ["9 : Particule chargée dans un champ magnétique uniforme : force magnétique, puissance, mouvement ; déflexion (téléviseur), spectrographe de masse, cyclotron"] },
      { label: "Loi de Laplace", items: ["10 : Action d'un champ magnétique sur un circuit ; loi de Laplace : rails de Laplace ; moteurs et haut-parleurs électrodynamiques"] },
      { label: "Induction et auto-induction", items: ["11 : Induction et auto-induction : loi de Lenz ; f.é.m. d'induction ; auto-inductance ; énergie et puissance d'une bobine"] },
    ],
    "Chimie des solutions aqueuses et cinétique chimique": [
      { label: "pH et produit ionique", items: ["1.1 : L'eau : solvant ionisant ; produit ionique ; pH"] },
      { label: "Acides forts et bases fortes", items: ["1.2 : Solutions d'acide chlorhydrique et d'hydroxyde de sodium ; pH"] },
      { label: "Couples acide/base et Ka", items: ["1.3 : Couples acide/base : Ka, pKa, classification, domaines de prédominance ; acides et bases forts"] },
      { label: "Réactions acide-base", items: ["1.4 : Réactions acide-base : acide fort/base forte ; acide fort/base faible ; acide faible/base forte"] },
      { label: "Cinétique chimique", items: ["2.1 : Vitesse de formation et de disparition d'un corps", "2.2 : Influence des concentrations et de la température ; applications"] },
      { label: "Catalyse", items: ["2.3 : Catalyse : définition ; exemples ; applications industrielles"] },
    ],
    "Les oscillations mécaniques et électriques": [
      { label: "Oscillations mécaniques", items: ["1.1 : Oscillateur harmonique non amorti (pendule élastique) : équation différentielle, fréquence propre, énergie", "1.2 : Oscillateur amorti : régimes pseudo-périodique, apériodique, critique"] },
      { label: "Circuit LC", items: ["2.1 : Circuit LC : équation différentielle, fréquence propre, énergie ; entretien des oscillations"] },
      { label: "Circuit RLC forcé", items: ["2.2 : Circuit RLC série en régime sinusoïdal forcé : impédance ; résonance d'intensité, bande passante, facteur de qualité ; puissance, facteur de puissance ; émission-réception radio"] },
    ],
    "Chimie organique": [
      { label: "Stéréochimie", items: ["1 : Notions de stéréochimie : conformation (éthane, cyclohexane) ; diastéréoisomérie Z/E"] },
      { label: "Alcools", items: ["2 (tétravalence, nomenclature) : Les alcools : classes, nomenclature ; préparation ; réaction avec le sodium ; déshydratation ; polyalcools (glycol, glycérol)"] },
      { label: "Aldéhydes et cétones", items: ["2 (oxydation) : Oxydation ménagée des alcools : aldéhydes et cétones ; passage aux acides carboxyliques"] },
      { label: "Amines", items: ["3 : Les amines : classes, nomenclature ; caractère basique ; caractère nucléophile (réaction d'Hofmann), passage aux amides"] },
      { label: "Acides carboxyliques", items: ["4 (acide carboxylique, dérivés, amides) : Les acides carboxyliques : formule, caractère acide faible, anhydride d'acide, chlorure d'acyle, amides"] },
      { label: "Esters et saponification", items: ["4 (estérification, hydrolyse, saponification) : Estérification, hydrolyse, saponification"] },
      { label: "Acides α-aminés", items: ["5 : Les acides α-aminés : formule, nomenclature ; amphion ; liaison peptidique, protéines"] },
    ],
    "Optique géométrique et physique": [
      { label: "Lentilles minces", items: ["1 (lentilles minces) : Lentilles minces : foyers, marche des rayons ; conditions de Gauss ; formules de conjugaison (Descartes, Newton) ; constructions ; système de deux lentilles ; distance focale (Bessel, Silbermann)"] },
      { label: "Instruments d'optique", items: ["1 (œil, appareil photo, microscope) : Œil réduit, appareil photo et microscope"] },
      { label: "Prisme et réseau", items: ["2 : Décomposition de la lumière : dispersion par un prisme (formules du prisme) ; diffraction par un réseau (incidence normale et quelconque)"] },
    ],
    "Physique atomique et nucléaire (« L'énergie de l'infiniment petit et la science »)": [
      { label: "Particules de grande énergie", items: ["Particules de grande énergie : quantité de mouvement, énergie ; cas du photon (figure dans le guide et la progression 2026-2027, pas dans le programme d'études)"] },
      { label: "Niveaux d'énergie", items: ["1 : Niveaux d'énergie atomiques : spectres ; niveaux ; transitions E2 − E1 = hν ; atome d'hydrogène"] },
      { label: "Noyau et énergie de liaison", items: ["2 : Noyau atomique : nucléons ; énergie de liaison, stabilité"] },
      { label: "Radioactivité", items: ["3 : Réactions nucléaires spontanées : α, β−, β+, γ ; loi de décroissance, demi-vie ; familles radioactives ; absorption des rayonnements"] },
      { label: "Fission et fusion", items: ["4 : Réactions nucléaires provoquées : fission ; fusion ; applications"] },
    ],
  },
  "Tle D": {
    // Regroupement par SÉQUENCE (cf. PCT-Guide/Tle-D/2_contenus_notionnels_TleD.md).
    // Tle D a son PROPRE guide (distinct de Tle C) : items bruts différents.
    "Champs de forces et interactions": [
      { label: "Cinématique du point", items: ["1 (vecteurs position, vitesse, accélération) : Cinématique : vecteurs position, vitesse, accélération tangentielle et normale ; rayon de courbure"] },
      { label: "Mouvements particuliers", items: ["1 (mouvements rectilignes et circulaire) : Mouvements rectilignes (uniforme, uniformément varié, sinusoïdal) ; mouvement circulaire uniforme"] },
      { label: "Champ électrostatique", items: ["2 : Champ électrostatique : force électrique, charge et champ ; condensateur plan"] },
      { label: "Champ magnétique", items: ["3 : Champ magnétique : mise en évidence ; aimants et bobines ; vecteur champ ; spectres ; mesure ; champ terrestre ; champ uniforme"] },
      { label: "Lois de Newton", items: ["4 : Lois de Newton ; théorème de l'énergie cinétique"] },
      { label: "Chute dans le champ de pesanteur", items: ["5 : Mouvement dans le champ de pesanteur terrestre"] },
      { label: "Particule en champ E", items: ["6 : Particule chargée dans un champ électrique uniforme : étude dynamique, énergétique ; déflexion électrique"] },
      { label: "Particule en champ B", items: ["7 : Particule chargée dans un champ magnétique uniforme : force magnétique, puissance, mouvement ; applications"] },
      { label: "Induction et auto-induction", items: ["8 : Induction et auto-induction : loi de Lenz ; f.é.m. ; auto-inductance ; énergie et puissance d'une bobine"] },
    ],
    "Chimie des solutions aqueuses et cinétique chimique": [
      { label: "pH et produit ionique", items: ["1.1 : L'eau : solvant ionisant ; produit ionique ; pH"] },
      { label: "Acides forts et bases fortes", items: ["1.2 : Solutions d'acide chlorhydrique et d'hydroxyde de sodium ; pH"] },
      { label: "Couples acide/base et Ka", items: ["1.3 : Couples acide/base : Ka, pKa, domaines de prédominance ; acides et bases forts"] },
      { label: "Réactions acide-base", items: ["1.4 : Réactions acide-base : fort/fort ; fort/faible ; faible/fort"] },
      { label: "Cinétique chimique", items: ["2.1 : Vitesse de formation et de disparition d'un corps", "2.2 : Influence des concentrations et de la température ; applications"] },
      { label: "Catalyse", items: ["2.3 : Catalyse : définition ; exemples ; applications industrielles"] },
    ],
    "Les oscillations mécaniques et électriques": [
      { label: "Oscillations mécaniques", items: ["1 : Oscillations mécaniques : oscillateur harmonique non amorti ; oscillateur amorti (régimes)"] },
      { label: "Circuit LC", items: ["2.1 : Circuit LC : équation différentielle, fréquence propre, énergie ; entretien des oscillations"] },
      { label: "Circuit RLC forcé", items: ["2.2 : Circuit RLC série en régime sinusoïdal forcé : impédance ; résonance d'intensité, bande passante, facteur de qualité ; puissance, facteur de puissance ; émission-réception radio"] },
    ],
    "Chimie organique": [
      { label: "Stéréochimie", items: ["1 : Stéréochimie : conformation ; diastéréoisomérie Z/E ; carbone asymétrique, énantiomérie, chiralité, activité optique"] },
      { label: "Alcools", items: ["2 (tétravalence, nomenclature, phosphates d'alkyle) : Les alcools : classes ; préparation ; réaction avec le sodium ; déshydratation ; passage aux phosphates d'alkyle ; polyalcools"] },
      { label: "Aldéhydes et cétones", items: ["2 (oxydation) : Oxydation ménagée des alcools : aldéhydes et cétones ; passage aux acides carboxyliques"] },
      { label: "Amines", items: ["3 : Les amines : classes ; caractère basique ; caractère nucléophile (Hofmann), amides"] },
      { label: "Acides carboxyliques", items: ["4 (acide carboxylique, dérivés, amides) : Les acides carboxyliques : formule, caractère acide faible, anhydride d'acide, chlorure d'acyle, amides"] },
      { label: "Esters et saponification", items: ["4 (estérification, hydrolyse, saponification) : Estérification, hydrolyse, saponification"] },
      { label: "Acides α-aminés", items: ["5 : Les acides α-aminés : représentation de Fischer, configurations D et L, chiralité ; amphion ; liaison peptidique ; protéines, enzymes"] },
    ],
    "Optique géométrique et physique": [
      { label: "Lentilles minces", items: ["1 (lentilles minces) : Lentilles minces : foyers, marche des rayons ; conditions de Gauss ; formules de conjugaison (Descartes, Newton) ; constructions ; système de deux lentilles ; distance focale (Bessel, Silbermann)"] },
      { label: "Instruments d'optique", items: ["1 (œil, appareil photo, microscope) : Œil réduit, appareil photo et microscope"] },
      { label: "Prisme et réseau", items: ["2 : Décomposition de la lumière : prisme ; réseau"] },
      { label: "Polarisation", items: ["3 : Polarisation rectiligne de la lumière : nature électromagnétique ; lumière polarisée ; loi de Malus ; loi de Biot et Savart"] },
    ],
    "Physique atomique et nucléaire (« L'énergie de l'infiniment petit et la science »)": [
      { label: "Niveaux d'énergie", items: ["1 : Niveaux d'énergie atomiques : spectres ; transitions ; atome d'hydrogène"] },
      { label: "Noyau et énergie de liaison", items: ["2 : Noyau atomique : nucléons ; énergie de liaison, stabilité"] },
      { label: "Radioactivité", items: ["3 : Réactions nucléaires spontanées : radioactivités ; décroissance, demi-vie ; familles radioactives ; absorption"] },
      { label: "Fission et fusion", items: ["4 : Réactions nucléaires provoquées : fission, fusion, applications"] },
    ],
  },
};

const SVT_NOTIONS: Record<string, string[]> = {
  "6e": ["Alimentation et besoins nutritionnels de l'Homme", "Diversité des régimes alimentaires chez les animaux", "Unité et diversité des phénomènes respiratoires chez les êtres vivants"],
  "5e": ["Besoins nutritifs des végétaux", "Relations entre les êtres vivants, entre les êtres vivants et leur milieu de vie", "Reproduction et développement chez les animaux et les végétaux"],
  "4e": ["Sol, avenir de l'Homme", "Terre, planète active"],
  "3e": ["Les échanges de matières et d'énergie entre l'organisme et le milieu extérieur", "La commande nerveuse et les réactions comportementales de l'Homme", "Reproduction humaine", "Les réactions immunitaires et les moyens de lutte contre les agressions microbiennes"],
  "2nde AB": ["La cellule fonde l'unité et la diversité du monde vivant", "Cycles de la matière et flux d'énergie dans les communautés d'êtres vivants"],
  "2nde C": ["La cellule fonde l'unité et la diversité du monde vivant", "Cycles de la matière et flux d'énergie dans les communautés d'êtres vivants"],
  "2nde D": ["La cellule fonde l'unité et la diversité du monde vivant", "Cycles de la matière et flux d'énergie dans les communautés d'êtres vivants"],
  "1ère AB": ["Conversion de l'énergie des métabolites en énergie utilisable par les cellules", "Connaissance des micro-organismes et de leur utilisation en biotechnologie agro-alimentaire et médicale"],
  "1ère C": ["La géodynamique interne : mouvement de la lithosphère et énergie interne du globe", "Conversion de l'énergie des métabolites en énergie utilisable par les cellules", "Connaissance des micro-organismes et de leur utilisation en biotechnologie agro-alimentaire et médicale"],
  "1ère D": ["Mouvement de la lithosphère et énergie interne du globe", "La mesure du temps dans l'histoire de la Terre et de la vie", "Conversion de l'énergie des métabolites en énergie utilisable par les cellules", "Connaissance des micro-organismes et de leur utilisation en biotechnologie agro-alimentaire et médicale"],
  "Tle AB": ["L'information génétique : nature, localisation et mécanisme de transmission", "La reproduction humaine"],
  "Tle C": ["L'information génétique : nature, localisation et mécanisme de transmission", "La reproduction humaine"],
  "Tle D": ["L'information génétique : nature, localisation et mécanisme de transmission", "La sauvegarde de l'intégrité de l'organisme par les réactions immunitaires", "La transmission des messages dans l'organisme", "Physiologie de la reproduction humaine et maîtrise de la procréation"],
};

const SVT_SA_DETAILS: Record<string, Record<string, SaGroup[]>> = {
  "6e": {
    "Alimentation et besoins nutritionnels de l'Homme": [
      { label: "Séquence 1 : Que sont les aliments et que sait-on de leur composition ?", items: ["Activité 1 : Notion d'aliment ; produits et préparations alimentaires ; origine animale, végétale, minérale", "Activité 2 : Constituants des aliments (eau, sels minéraux, glucides, protides, lipides, vitamines) et valeur nutritive", "Activité 3 : Propriétés physico-chimiques de quelques substances alimentaires (tests au laboratoire)"] },
      { label: "Séquence 2 : Quel est le rôle des aliments dans l'organisme ?", items: ["Activité 1 : Besoins nutritionnels (énergie, substances spécifiques) et facteurs de variation", "Activité 2 : Aliments énergétiques, d'entretien et de santé", "Activité 3 : Maladies nutritionnelles (kwashiorkor, marasme)", "Activité 4 : Alimentation équilibrée, composition de menus, interdits alimentaires"] },
      { label: "Séquence 3 : En quoi consiste la transformation digestive des aliments ?", items: ["Activité 1 : Appareil digestif (tube digestif, glandes digestives), mastication, dents et hygiène bucco-dentaire", "Activité 2 : Notion de digestion et de suc digestif (digestion in vitro de l'amidon, salive)", "Activité 3 : Absorption intestinale des nutriments"] },
      { label: "Séquence 4", items: ["Activité 1 : Techniques de conservation des denrées alimentaires du milieu"] },
    ],
    "Diversité des régimes alimentaires chez les animaux": [
      { label: "Séquence 1 : Comment et avec quels outils les zoophages capturent-ils et consomment-ils leur proie ?", items: ["Activité 1 : Étapes du comportement alimentaire et techniques de chasse", "Activité 2 : Denture des carnivores, mâchoires et organes de capture", "Activité 3 : Cas des serpents et des invertébrés prédateurs"] },
      { label: "Séquence 2 : Comment et avec quels outils les phytophages prélèvent-ils et consomment-ils leur nourriture ?", items: ["Activité 1 : Récolte (par opposition à la capture), rumination", "Activité 2 : Denture des herbivores (denture incomplète, tables d'usure des molaires)", "Activité 3 : Pièces buccales du criquet, radula et mâchoire de l'escargot"] },
      { label: "Séquence 3 : Quels outils pour prélever et consommer les aliments liquides ?", items: ["Activité 1 : Pièces buccales de type piqueur-suceur (moustique)", "Activité 2 : Types lécheur-suceur (abeille) et suceur (mouche, papillon)"] },
      { label: "Séquence 4 : Adaptation au régime alimentaire", items: ["Activité 1 : Relation structure-fonction entre outils et régime alimentaire", "Activité 2 : Longueur du tube digestif chez les carnivores et les herbivores"] },
      { label: "Séquence 5", items: ["Activité 1 : Problèmes socio-environnementaux (transhumance, divagation des animaux)"] },
    ],
    "Unité et diversité des phénomènes respiratoires chez les êtres vivants": [
      { label: "Séquence 1 : Comment respirent les Mammifères ? (cas de l'Homme)", items: ["Activité 1 : Mouvements respiratoires (inspiration, expiration) et ventilation pulmonaire", "Activité 2 : Comparaison air inspiré / air expiré (eau de chaux)", "Activité 3 : Échanges gazeux pulmonaires, caractéristiques des alvéoles, rôle du sang"] },
      { label: "Séquence 2 : Comment respirent les autres animaux ?", items: ["Activité 1 : Respiration branchiale (poisson)", "Activité 2 : Respiration pulmonaire et cutanée (grenouille)", "Activité 3 : Respiration trachéenne (criquet)", "Activité 4 : Phénomènes généraux de la respiration chez les animaux"] },
      { label: "Séquence 3 : Comment respirent les végétaux ?", items: ["Activité 1 : Échanges gazeux chez les végétaux chlorophylliens et non chlorophylliens", "Activité 2 : Stomates, lacunes et circulation des gaz dans la plante"] },
      { label: "Séquence 4", items: ["Activité 1 : Pollution de l'air et de l'eau et respiration des êtres vivants", "Activité 2 : Maladies des voies respiratoires et prévention"] },
    ],
  },
  "5e": {
    "Besoins nutritifs des végétaux": [
      { label: "Séquence 1 : De quels éléments les végétaux verts ont-ils besoin pour se développer et comment se les procurent-ils ?", items: ["Activité 1 : Besoins en eau et en sels minéraux, rôle du sol", "Activité 2 : Poils absorbants, vaisseaux conducteurs et sève brute", "Activité 3 : Justification des techniques agricoles (arrosage, irrigation, engrais)"] },
      { label: "Séquence 2 : Comment les végétaux verts se procurent-ils les matières organiques dont ils sont constitués ?", items: ["Activité 1 : Échanges gazeux chlorophylliens et rôle des stomates", "Activité 2 : Rôle de la lumière et de la chlorophylle", "Activité 3 : Matière organique fabriquée et circulation de la sève élaborée"] },
      { label: "Séquence 3 : Comment se nourrissent les végétaux non chlorophylliens ?", items: ["Activité 1 : Besoins nutritifs et organes d'absorption des champignons", "Activité 2 : Notions d'autotrophie et d'hétérotrophie"] },
      { label: "Séquence 4", items: ["Activité 1 : Amélioration de la production des plantes vertes (projet de jardinage)"] },
    ],
    "Relations entre les êtres vivants, entre les êtres vivants et leur milieu de vie": [
      { label: "Séquence 1 : Quelles sont les relations entre les êtres vivants d'espèces différentes ?", items: ["Activité 1 : Parasitisme (hôte, parasite, cycle à un ou deux hôtes)", "Activité 2 : Symbiose, commensalisme, compétition", "Activité 3 : Chaînes et réseaux alimentaires, producteurs et consommateurs"] },
      { label: "Séquence 2 : Quelles sont les relations entre les êtres vivants de même espèce ?", items: ["Activité 1 : Sociétés d'invertébrés (reine, division du travail, hiérarchie)", "Activité 2 : Sociétés de vertébrés et moyens de communication", "Activité 3 : Société animale, foule et groupe"] },
      { label: "Séquence 3 : Comment le milieu et les êtres qui y vivent s'influencent-ils ?", items: ["Activité 1 : Inventaire des êtres vivants et des facteurs d'un milieu", "Activité 2 : Influence des facteurs (éclairement, humidité, température) sur la répartition des êtres vivants"] },
      { label: "Séquence 4", items: ["Activité 1 : Eau, maladies d'origine hydrique et santé humaine"] },
    ],
    "Reproduction et développement chez les animaux et les végétaux": [
      { label: "Séquence 1 : Comment se forme l'œuf chez les animaux ?", items: ["Activité 1 : Individus mâle et femelle, gonades et gamètes", "Activité 2 : Comportements reproducteurs", "Activité 3 : Fécondation et structure de l'œuf"] },
      { label: "Séquence 2 : Comment se fait le passage de l'œuf à l'adulte chez les ovipares et les vivipares ?", items: ["Activité 1 : Ovipares et vivipares", "Activité 2 : Développement direct", "Activité 3 : Développement indirect et métamorphoses (complète, incomplète)"] },
      { label: "Séquence 3 : Comment se reproduisent les végétaux ?", items: ["Activité 1 : La fleur et ses pièces (fleurs mâle, femelle, hermaphrodite)", "Activité 2 : Floraison, pollinisation, fructification, germination", "Activité 3 : Reproduction des plantes sans fleurs", "Activité 4 : Reproduction végétative"] },
      { label: "Séquence 4", items: ["Activité 1 : Problème d'ordre environnemental soulevé par la situation de départ"] },
    ],
  },
  "4e": {
    "Sol, avenir de l'Homme": [
      { label: "Séquence 1 : Quels sont les éléments caractéristiques d'un paysage ?", items: ["Activité 1 : Le relief (plaines, plateaux, vallées, collines, montagnes)", "Activité 2 : Végétation et hydrographie", "Activité 3 : Affleurements de roches et traces de l'activité humaine"] },
      { label: "Séquence 2 : Comment les roches du sous-sol influencent-elles l'aspect des paysages ?", items: ["Activité 1 : Propriétés des roches (porosité, perméabilité, dureté, réaction à l'acide)", "Activité 2 : Types de paysages du Bénin (sableux, argileux, latéritique, cristallin, calcaire)", "Activité 3 : Relations entre roches, relief, cours d'eau et végétation"] },
      { label: "Séquence 3 : Comment évolue un paysage ?", items: ["Activité 1 : Érosion (désagrégation, dissolution), transport et dépôt", "Activité 2 : Sédiments et roches sédimentaires", "Activité 3 : Pédogenèse : formation et évolution des sols"] },
      { label: "Séquence 4", items: ["Activité 1 : Eaux souterraines et problèmes liés à leur exploitation", "Activité 2 : Ressources minières et roches énergétiques", "Activité 3 : Ressources végétales et gestion durable"] },
    ],
    "Terre, planète active": [
      { label: "Séquence 1 : Que nous apportent l'étude des séismes et du volcanisme sur la structure du globe ?", items: ["Activité 1 : Séismes : foyer, faille, ondes sismiques", "Activité 2 : Structure du globe (croûte, manteau, lithosphère, asthénosphère)", "Activité 3 : Volcanisme : types d'éruptions et roches volcaniques (basalte, andésite)", "Activité 4 : Répartition mondiale des séismes et des volcans, plaques lithosphériques"] },
      { label: "Séquence 2 : Quels sont les mouvements des plaques et leurs conséquences ?", items: ["Activité 1 : Dérive des continents (théorie de Wegener)", "Activité 2 : Divergence et dorsales océaniques", "Activité 3 : Convergence et subduction", "Activité 4 : Collision, chaînes de montagnes, plis, failles, métamorphisme", "Activité 5 : Courants de convection"] },
      { label: "Séquence 3", items: ["Activité 1 : Risques sismiques et volcaniques (prévision, prévention)"] },
    ],
  },
  "3e": {
    "Les échanges de matières et d'énergie entre l'organisme et le milieu extérieur": [
      { label: "Séquence 1 : Comment l'organisme s'approvisionne-t-il en nutriments ?", items: ["Activité 1 : Sucs et enzymes digestives", "Activité 2 : Étapes de la digestion (actions mécaniques et chimiques)", "Activité 3 : Absorption intestinale"] },
      { label: "Séquence 2 : Comment l'organisme s'approvisionne-t-il en dioxygène ?", items: ["Activité 1 : Cycle respiratoire et ventilation pulmonaire", "Activité 2 : Échanges gazeux alvéolaires"] },
      { label: "Séquence 3 : Comment le dioxygène et les nutriments sont-ils transportés et distribués aux organes ?", items: ["Activité 1 : Vaisseaux sanguins", "Activité 2 : Le cœur et le cycle cardiaque", "Activité 3 : Circulation sanguine, lymphe, rôle du foie"] },
      { label: "Séquence 4 : Comment l'organisme utilise-t-il le dioxygène et les nutriments ?", items: ["Activité 1 : Croissance et renouvellement", "Activité 2 : Production d'énergie et besoins énergétiques", "Activité 3 : Mise en réserve (foie, tissu adipeux), sels minéraux et carences"] },
      { label: "Séquence 5 : Comment l'organisme se débarrasse-t-il de ses déchets ?", items: ["Activité 1 : Appareil urinaire et rein", "Activité 2 : Glandes sudoripares", "Activité 3 : Urée et troubles de l'excrétion"] },
    ],
    "La commande nerveuse et les réactions comportementales de l'Homme": [
      { label: "Séquence 1 : Comment s'explique la diversité des réactions comportementales ?", items: ["Activité 1 : Organisation du système nerveux", "Activité 2 : Récepteurs, centres nerveux et organes effecteurs"] },
      { label: "Séquence 2 : Comment s'élabore une réaction involontaire ? (réflexe de retrait)", items: ["Activité 1 : Acte réflexe et arc réflexe", "Activité 2 : Nerf mixte, voies afférente et efférente", "Activité 3 : Naissance et conduction de l'influx nerveux"] },
      { label: "Séquence 3 : Comment le cerveau traite-t-il les informations dans une réaction volontaire ?", items: ["Activité 1 : Récepteurs cutanés, aires sensitives et motrices du cortex", "Activité 2 : Neurone et conduction du message nerveux", "Activité 3 : Synapse et messager chimique"] },
    ],
    "Reproduction humaine": [
      { label: "Séquence 1 : Comment sont déclenchées les transformations pubertaires ?", items: ["Activité 1 : Modifications physiques, physiologiques et psychologiques", "Activité 2 : Déclenchement de la puberté chez la fille et le garçon"] },
      { label: "Séquence 2 : Comment l'activité des gonades influence-t-elle les appareils reproducteurs ?", items: ["Activité 1 : Testicule (tubes séminifères, testostérone)", "Activité 2 : Ovaire et cycle ovarien", "Activité 3 : Cycle utérin"] },
      { label: "Séquence 3 : Comment l'œuf se forme-t-il et quel est son devenir ?", items: ["Activité 1 : Gamètes et fécondation", "Activité 2 : Embryon, fœtus et placenta", "Activité 3 : Grossesse"] },
    ],
    "Les réactions immunitaires et les moyens de lutte contre les agressions microbiennes": [
      { label: "Séquence 1 : Comment l'organisme réagit-il à l'introduction d'un corps étranger ?", items: ["Activité 1 : Microbes pathogènes et toxines", "Activité 2 : Barrières naturelles et réaction inflammatoire", "Activité 3 : Septicémie et toxémie", "Activité 4 : Reconnaissance du soi et du non-soi"] },
      { label: "Séquence 2 : Comment s'explique le dysfonctionnement du système immunitaire ?", items: ["Activité 1 : Allergies", "Activité 2 : Déficits immunitaires (congénital, VIH/SIDA)"] },
      { label: "Séquence 3 : Que sait-on des techniques biomédicales d'aide à l'organisme ?", items: ["Activité 1 : Vaccins, sérums, anatoxine et antitoxine", "Activité 2 : Antibiotiques, antiseptiques, asepsie et antisepsie"] },
    ],
  },
  "2nde AB": {
    "La cellule fonde l'unité et la diversité du monde vivant": [
      { label: "Séquence 1 : Comment a été établie la théorie cellulaire ?", items: ["Activité 1 : Grandes étapes et savants de la théorie cellulaire", "Activité 2 : Rôle du développement des techniques (microscope)"] },
      { label: "Séquence 2 : En quoi une cellule constitue-t-elle une unité de vie ?", items: ["Activité 1 : Préparations microscopiques et colorations", "Activité 2 : Cellules végétales, animales, protozoaires et bactéries", "Activité 3 : Niveaux d'organisation de la matière vivante"] },
      { label: "Séquence 3 : Comment les organites contribuent-ils aux fonctions vitales de la cellule ?", items: ["Activité 1 : Ultrastructure de la cellule (microscope électronique)", "Activité 2 : Organites et fonctions (chloroplaste, mitochondrie, réticulum, appareil de Golgi)"] },
      { label: "Séquence 4 : Comment la cellule se procure-t-elle les substances nutritives ?", items: ["Activité 1 : Échanges membranaires (diffusion libre et facilitée, osmose, transport actif)"] },
    ],
    "Cycles de la matière et flux d'énergie dans les communautés d'êtres vivants": [
      { label: "Séquence 1 : Notion d'écosystème", items: ["Activité 1 : Facteurs physico-chimiques du milieu", "Activité 2 : Réseaux trophiques"] },
      { label: "Séquence 2 : Pourquoi le premier maillon d'une chaîne alimentaire est-il un végétal chlorophyllien ?", items: ["Activité 1 : Nutrition minérale, sève brute et sève élaborée", "Activité 2 : Photosynthèse, pigments chlorophylliens et chloroplaste", "Activité 3 : Production primaire (écosystème naturel et agrosystème)"] },
      { label: "Séquence 3 : Comment les consommateurs utilisent-ils la matière organique prélevée ?", items: ["Activité 1 : Productivité secondaire", "Activité 2 : Transferts de matière et d'énergie dans les réseaux trophiques"] },
      { label: "Séquence 4 : Cycle du carbone et influence de l'Homme", items: ["Activité 1 : Cycle du carbone et perturbations humaines"] },
    ],
  },
  "2nde C": {
    "La cellule fonde l'unité et la diversité du monde vivant": [
      { label: "Séquence 1 : Comment a été établie la théorie cellulaire ?", items: ["Activité 1 : Grandes étapes et savants de la théorie cellulaire", "Activité 2 : Rôle du développement des techniques (microscope)"] },
      { label: "Séquence 2 : En quoi une cellule constitue-t-elle une unité de vie ?", items: ["Activité 1 : Préparations microscopiques et colorations", "Activité 2 : Cellules végétales, animales, protozoaires et bactéries", "Activité 3 : Niveaux d'organisation de la matière vivante"] },
      { label: "Séquence 3 : Comment les organites contribuent-ils aux fonctions vitales de la cellule ?", items: ["Activité 1 : Ultrastructure de la cellule (microscope électronique)", "Activité 2 : Organites et fonctions (chloroplaste, mitochondrie, réticulum, appareil de Golgi)"] },
      { label: "Séquence 4 : Comment la cellule se procure-t-elle les substances nutritives ?", items: ["Activité 1 : Échanges membranaires (diffusion libre et facilitée, osmose, transport actif)"] },
    ],
    "Cycles de la matière et flux d'énergie dans les communautés d'êtres vivants": [
      { label: "Séquence 1 : Notion d'écosystème", items: ["Activité 1 : Facteurs physico-chimiques du milieu", "Activité 2 : Réseaux trophiques"] },
      { label: "Séquence 2 : Pourquoi le premier maillon d'une chaîne alimentaire est-il un végétal chlorophyllien ?", items: ["Activité 1 : Nutrition minérale, sève brute et sève élaborée", "Activité 2 : Photosynthèse, pigments chlorophylliens et chloroplaste", "Activité 3 : Production primaire (écosystème naturel et agrosystème)"] },
      { label: "Séquence 3 : Comment les consommateurs utilisent-ils la matière organique prélevée ?", items: ["Activité 1 : Productivité secondaire", "Activité 2 : Transferts de matière et d'énergie dans les réseaux trophiques"] },
      { label: "Séquence 4 : Cycle du carbone et influence de l'Homme", items: ["Activité 1 : Cycle du carbone et perturbations humaines"] },
    ],
  },
  "2nde D": {
    "La cellule fonde l'unité et la diversité du monde vivant": [
      { label: "Séquence 1 : Comment a été établie la théorie cellulaire ?", items: ["Activité 1 : Grandes étapes et savants de la théorie cellulaire", "Activité 2 : Rôle du développement des techniques (microscope)"] },
      { label: "Séquence 2 : En quoi une cellule constitue-t-elle une unité de vie ?", items: ["Activité 1 : Préparations microscopiques et colorations", "Activité 2 : Cellules végétales, animales, protozoaires et bactéries", "Activité 3 : Niveaux d'organisation de la matière vivante"] },
      { label: "Séquence 3 : Comment les organites contribuent-ils aux fonctions vitales de la cellule ?", items: ["Activité 1 : Ultrastructure de la cellule (microscope électronique)", "Activité 2 : Organites et fonctions (chloroplaste, mitochondrie, réticulum, appareil de Golgi)"] },
      { label: "Séquence 4 : Comment la cellule se procure-t-elle les substances nutritives ?", items: ["Activité 1 : Échanges membranaires (diffusion libre et facilitée, osmose, transport actif)"] },
    ],
    "Cycles de la matière et flux d'énergie dans les communautés d'êtres vivants": [
      { label: "Séquence 1 : Notion d'écosystème", items: ["Activité 1 : Facteurs physico-chimiques du milieu", "Activité 2 : Réseaux trophiques"] },
      { label: "Séquence 2 : Pourquoi le premier maillon d'une chaîne alimentaire est-il un végétal chlorophyllien ?", items: ["Activité 1 : Nutrition minérale, sève brute et sève élaborée", "Activité 2 : Photosynthèse, pigments chlorophylliens et chloroplaste", "Activité 3 : Production primaire (écosystème naturel et agrosystème)"] },
      { label: "Séquence 3 : Comment les consommateurs utilisent-ils la matière organique prélevée ?", items: ["Activité 1 : Productivité secondaire", "Activité 2 : Transferts de matière et d'énergie dans les réseaux trophiques"] },
      { label: "Séquence 4 : Cycle du carbone et influence de l'Homme", items: ["Activité 1 : Cycle du carbone et perturbations humaines"] },
    ],
  },
  "1ère AB": {
    "Conversion de l'énergie des métabolites en énergie utilisable par les cellules": [
      { label: "Séquence 1 : Comment évaluer les dépenses énergétiques d'un organisme et quels facteurs les modifient ?", items: ["Activité 1 : Permanence et variations des dépenses énergétiques", "Activité 2 : Métabolisme basal", "Activité 3 : Énergie des aliments et mesure des dépenses (thermochimie)"] },
      { label: "Séquence 2 : Quelle est la signification biologique des échanges gazeux respiratoires ?", items: ["Activité 1 : Oxydation et réduction (pouvoir oxydant, pouvoir réducteur)", "Activité 2 : Combustion et respiration, la respiration comme oxydation"] },
      { label: "Séquence 3", items: ["Activité 1 : Dossier sur les besoins nutritionnels de l'Homme", "Activité 2 : Débat sur le cholestérol et le fait de sauter des repas"] },
    ],
    "Connaissance des micro-organismes et de leur utilisation en biotechnologie agro-alimentaire et médicale": [
      { label: "Séquence 1 : Micro-organismes et fermentations", items: ["Activité 1 : Diversité des micro-organismes (bactéries, levures, moisissures)", "Activité 2 : Fermentations et biotechnologies traditionnelles"] },
      { label: "Séquence 2 : Innovations biotechnologiques", items: ["Activité 1 : Domaine agro-alimentaire", "Activité 2 : Domaine médical", "Activité 3 : Domaine agronomique"] },
      { label: "Séquence 3 : Limites et problèmes de société liés à l'utilisation des micro-organismes", items: ["Activité 1 : Enjeux et débats de société"] },
    ],
  },
  "1ère C": {
    "La géodynamique interne : mouvement de la lithosphère et énergie interne du globe": [
      { label: "Séquence 1 : Quelle est la nature, la composition et l'état physique des matériaux de la Terre ?", items: ["Activité 1 : Ondes sismiques et discontinuités du globe", "Activité 2 : Caractéristiques physiques et chimiques des couches du globe"] },
      { label: "Séquence 2 : Quels sont les mouvements des plaques lithosphériques et leurs conséquences ?", items: ["Activité 1 : Répartition des séismes, du volcanisme et des reliefs", "Activité 2 : De la dérive des continents à la tectonique des plaques (paléomagnétisme)"] },
      { label: "Séquence 3 : Quelles activités tectoniques sont associées à la divergence des plaques ?", items: ["Activité 1 : Dorsales océaniques et création de croûte océanique", "Activité 2 : Roches de la lithosphère océanique (basalte, gabbro, péridotite)"] },
      { label: "Séquence 4 : Quels phénomènes caractérisent les zones de convergence ?", items: ["Activité 1 : Subduction et fosses océaniques", "Activité 2 : Collision et types de chaînes de montagnes"] },
      { label: "Séquence 5 : Comment l'énergie interne de la Terre est-elle à l'origine des mouvements de la lithosphère ?", items: ["Activité 1 : Radioactivité du manteau, source d'énergie interne", "Activité 2 : Propriétés du manteau et courants de convection"] },
      { label: "Séquence 6", items: ["Activité 1 : Dossier sur l'origine de la Terre"] },
    ],
    "Conversion de l'énergie des métabolites en énergie utilisable par les cellules": [
      { label: "Séquence 1 : Comment évaluer les dépenses énergétiques d'un organisme et quels facteurs les modifient ?", items: ["Activité 1 : Permanence et variations des dépenses énergétiques", "Activité 2 : Métabolisme basal", "Activité 3 : Énergie des aliments et mesure des dépenses (thermochimie)"] },
      { label: "Séquence 2 : Quelle est la signification biologique des échanges gazeux respiratoires ?", items: ["Activité 1 : Oxydation et réduction (pouvoir oxydant, pouvoir réducteur)", "Activité 2 : Combustion et respiration, la respiration comme oxydation"] },
      { label: "Séquence 3 : Comment les cellules libèrent-elles l'énergie chimique des nutriments ?", items: ["Activité 1 : Respiration cellulaire (glycolyse, cycle de Krebs)", "Activité 2 : Fermentation", "Activité 3 : Rendements énergétiques de la respiration et de la fermentation"] },
      { label: "Séquence 4 : Comment les cellules utilisent-elles l'ATP pour couvrir leurs besoins ?", items: ["Activité 1 : L'ATP, molécule de transfert d'énergie", "Activité 2 : ATP et synthèses, contraction musculaire, activité nerveuse"] },
    ],
    "Connaissance des micro-organismes et de leur utilisation en biotechnologie agro-alimentaire et médicale": [
      { label: "Séquence 1 : Micro-organismes et fermentations", items: ["Activité 1 : Diversité des micro-organismes (bactéries, levures, moisissures)", "Activité 2 : Fermentations et biotechnologies traditionnelles"] },
      { label: "Séquence 2 : Innovations biotechnologiques", items: ["Activité 1 : Domaine agro-alimentaire", "Activité 2 : Domaine médical", "Activité 3 : Domaine agronomique"] },
      { label: "Séquence 3 : Limites et problèmes de société liés à l'utilisation des micro-organismes", items: ["Activité 1 : Enjeux et débats de société"] },
    ],
  },
  "1ère D": {
    "Mouvement de la lithosphère et énergie interne du globe": [
      { label: "Séquence 1 : Quelle est la nature, la composition et l'état physique des matériaux de la Terre ?", items: ["Activité 1 : Ondes sismiques et discontinuités du globe", "Activité 2 : Caractéristiques physiques et chimiques des couches du globe"] },
      { label: "Séquence 2 : Quels sont les mouvements des plaques lithosphériques et leurs conséquences ?", items: ["Activité 1 : Répartition des séismes, du volcanisme et des reliefs", "Activité 2 : De la dérive des continents à la tectonique des plaques (paléomagnétisme)"] },
      { label: "Séquence 3 : Quelles activités tectoniques sont associées à la divergence des plaques ?", items: ["Activité 1 : Dorsales océaniques et création de croûte océanique", "Activité 2 : Roches de la lithosphère océanique (basalte, gabbro, péridotite)"] },
      { label: "Séquence 4 : Quels phénomènes caractérisent les zones de convergence ?", items: ["Activité 1 : Subduction et fosses océaniques", "Activité 2 : Collision et types de chaînes de montagnes"] },
      { label: "Séquence 5 : Comment l'énergie interne de la Terre est-elle à l'origine des mouvements de la lithosphère ?", items: ["Activité 1 : Radioactivité du manteau, source d'énergie interne", "Activité 2 : Propriétés du manteau et courants de convection"] },
      { label: "Séquence 6", items: ["Activité 1 : Dossier sur l'origine de la Terre"] },
    ],
    "La mesure du temps dans l'histoire de la Terre et de la vie": [
      { label: "Séquence 1 : Succession chronologique des événements géologiques (datation relative)", items: ["Activité 1 : Principes de superposition et de continuité", "Activité 2 : Principe de recoupement", "Activité 3 : Principe d'identité paléontologique"] },
      { label: "Séquence 2 : Mesure de la durée des événements géologiques", items: ["Activité 1 : Géochronologies naturelles"] },
      { label: "Séquence 3 : Datation absolue", items: ["Activité 1 : Radiochronologie", "Activité 2 : Âges absolus et incertitudes, fiabilité des méthodes"] },
    ],
    "Conversion de l'énergie des métabolites en énergie utilisable par les cellules": [
      { label: "Séquence 1 : Comment évaluer les dépenses énergétiques d'un organisme et quels facteurs les modifient ?", items: ["Activité 1 : Permanence et variations des dépenses énergétiques", "Activité 2 : Métabolisme basal", "Activité 3 : Énergie des aliments et mesure des dépenses (thermochimie)"] },
      { label: "Séquence 2 : Quelle est la signification biologique des échanges gazeux respiratoires ?", items: ["Activité 1 : Oxydation et réduction (pouvoir oxydant, pouvoir réducteur)", "Activité 2 : Combustion et respiration, la respiration comme oxydation"] },
      { label: "Séquence 3 : Comment les cellules libèrent-elles l'énergie chimique des nutriments ?", items: ["Activité 1 : Respiration cellulaire (glycolyse, cycle de Krebs)", "Activité 2 : Fermentation", "Activité 3 : Rendements énergétiques de la respiration et de la fermentation"] },
      { label: "Séquence 4 : Comment les cellules utilisent-elles l'ATP pour couvrir leurs besoins ?", items: ["Activité 1 : L'ATP, molécule de transfert d'énergie", "Activité 2 : ATP et synthèses, contraction musculaire, activité nerveuse"] },
    ],
    "Connaissance des micro-organismes et de leur utilisation en biotechnologie agro-alimentaire et médicale": [
      { label: "Séquence 1 : Micro-organismes et fermentations", items: ["Activité 1 : Diversité des micro-organismes (bactéries, levures, moisissures)", "Activité 2 : Fermentations et biotechnologies traditionnelles"] },
      { label: "Séquence 2 : Innovations biotechnologiques", items: ["Activité 1 : Domaine agro-alimentaire", "Activité 2 : Domaine médical", "Activité 3 : Domaine agronomique"] },
      { label: "Séquence 3 : Limites et problèmes de société liés à l'utilisation des micro-organismes", items: ["Activité 1 : Enjeux et débats de société"] },
    ],
  },
  "Tle AB": {
    "L'information génétique : nature, localisation et mécanisme de transmission": [
      { label: "Séquence 1 : Que sait-on de la nature de l'information génétique et de sa localisation ?", items: ["Activité 1 : Rôle du noyau et constance des potentialités génétiques", "Activité 2 : L'ADN, support de l'information génétique", "Activité 3 : Chromosomes et caryotype"] },
      { label: "Séquence 2 : Comment se comportent les chromosomes lors de la division cellulaire ?", items: ["Activité 1 : Cycle cellulaire, interphase et mitose"] },
      { label: "Séquence 3 : Comment se comportent les chromosomes au cours de la reproduction sexuée ?", items: ["Activité 1 : Méiose", "Activité 2 : Fécondation et constance du nombre de chromosomes"] },
      { label: "Séquence 4 : Quelles sont les modalités de transmission des caractères héréditaires ?", items: ["Activité 1 : Caractères héréditaires et méthodes de la génétique humaine", "Activité 2 : Diagnostic prénatal", "Activité 3 : Problèmes de bioéthique"] },
    ],
    "La reproduction humaine": [
      { label: "Séquence 1 : Par quel processus les gonades donnent-elles naissance aux gamètes ?", items: ["Activité 1 : Structure du testicule et spermatogenèse", "Activité 2 : Structure de l'ovaire et ovogenèse"] },
      { label: "Séquence 2 : Que sait-on de la fécondation et du devenir de l'œuf dans l'espèce humaine ?", items: ["Activité 1 : Étapes de la fécondation", "Activité 2 : Segmentation, migration et nidation", "Activité 3 : Embryon, fœtus et annexes embryonnaires"] },
      { label: "Séquence 3 : Par quels mécanismes les glandes mammaires assurent-elles la sécrétion du lait ?", items: ["Activité 1 : Structure de la glande mammaire", "Activité 2 : Montée, entretien et éjection du lait, rôle des hormones"] },
    ],
  },
  "Tle C": {
    "L'information génétique : nature, localisation et mécanisme de transmission": [
      { label: "Séquence 1 : Que sait-on de la nature de l'information génétique et de sa localisation ?", items: ["Activité 1 : Rôle du noyau et constance des potentialités génétiques", "Activité 2 : L'ADN, support de l'information génétique", "Activité 3 : Chromosomes et caryotype"] },
      { label: "Séquence 2 : Comment se comportent les chromosomes et l'ADN lors de la division cellulaire ?", items: ["Activité 1 : Cycle cellulaire, interphase et mitose", "Activité 2 : Réplication de l'ADN"] },
      { label: "Séquence 3 : Comment se comportent les chromosomes et l'ADN au cours de la reproduction sexuée ?", items: ["Activité 1 : Méiose", "Activité 2 : Fécondation et constance du caryotype de l'espèce"] },
      { label: "Séquence 4 : Dans quelle mesure peut-on faire des prévisions théoriques en génétique humaine ?", items: ["Activité 1 : Méthodes de la génétique humaine (arbres généalogiques)", "Activité 2 : Anomalies chromosomiques et caryotypes", "Activité 3 : Diagnostic prénatal et applications médicales"] },
      { label: "Séquence 5 : Comment l'information génétique détermine-t-elle les caractères observables ?", items: ["Activité 1 : Code génétique", "Activité 2 : Synthèse des protéines (transcription, traduction)", "Activité 3 : Gènes de régulation et gènes morcelés"] },
      { label: "Séquence 6 : Développement de la génétique", items: ["Activité 1 : Histoire de la génétique", "Activité 2 : Démarche classique d'une étude de génétique formelle"] },
    ],
    "La reproduction humaine": [
      { label: "Séquence 1 : Par quel processus les gonades donnent-elles naissance aux gamètes ?", items: ["Activité 1 : Structure du testicule et spermatogenèse", "Activité 2 : Structure de l'ovaire et ovogenèse"] },
      { label: "Séquence 2 : Que sait-on de la fécondation et du devenir de l'œuf dans l'espèce humaine ?", items: ["Activité 1 : Étapes de la fécondation", "Activité 2 : Segmentation, migration et nidation", "Activité 3 : Embryon, fœtus et annexes embryonnaires"] },
      { label: "Séquence 3 : Par quels mécanismes les glandes mammaires assurent-elles la sécrétion du lait ?", items: ["Activité 1 : Structure de la glande mammaire", "Activité 2 : Montée, entretien et éjection du lait, rôle des hormones"] },
    ],
  },
  "Tle D": {
    "L'information génétique : nature, localisation et mécanisme de transmission": [
      { label: "Séquence 1 : Que sait-on de la nature de l'information génétique et de sa localisation ?", items: ["Activité 1 : Rôle du noyau et constance des potentialités génétiques", "Activité 2 : L'ADN, support de l'information génétique", "Activité 3 : Chromosomes et caryotype"] },
      { label: "Séquence 2 : Comment se comportent les chromosomes et l'ADN lors de la division cellulaire ?", items: ["Activité 1 : Cycle cellulaire, interphase et mitose", "Activité 2 : Réplication de l'ADN"] },
      { label: "Séquence 3 : Comment se comportent les chromosomes et l'ADN au cours de la reproduction sexuée ?", items: ["Activité 1 : Méiose", "Activité 2 : Fécondation et constance du caryotype de l'espèce"] },
      { label: "Séquence 4 : Dans quelle mesure peut-on faire des prévisions théoriques en génétique humaine ?", items: ["Activité 1 : Méthodes de la génétique humaine (arbres généalogiques)", "Activité 2 : Anomalies chromosomiques et caryotypes", "Activité 3 : Diagnostic prénatal et applications médicales"] },
      { label: "Séquence 5 : Comment l'information génétique détermine-t-elle les caractères observables ?", items: ["Activité 1 : Code génétique", "Activité 2 : Synthèse des protéines (transcription, traduction)", "Activité 3 : Gènes de régulation et gènes morcelés"] },
      { label: "Séquence 6 : Développement de la génétique dans une perspective historique", items: ["Activité 1 : Histoire de la génétique"] },
    ],
    "La sauvegarde de l'intégrité de l'organisme par les réactions immunitaires": [
      { label: "Séquence 1 : Comment l'organisme distingue-t-il le soi du non-soi ?", items: ["Activité 1 : Marqueurs du soi (CMH / HLA)", "Activité 2 : Groupes sanguins ABO", "Activité 3 : Cellules immunitaires et reconnaissance du non-soi"] },
      { label: "Séquence 2 : Comment se déroulent les réponses immunitaires ?", items: ["Activité 1 : Réponse non spécifique (inflammation, phagocytose)", "Activité 2 : Réponse spécifique à médiation humorale", "Activité 3 : Réponse spécifique à médiation cellulaire"] },
      { label: "Séquence 3 : Que sait-on du dysfonctionnement du système immunitaire ?", items: ["Activité 1 : Allergies", "Activité 2 : SIDA"] },
    ],
    "La transmission des messages dans l'organisme": [
      { label: "Séquence 1 : Comment l'activité musculaire participe-t-elle au maintien de la posture ?", items: ["Activité 1 : Réflexe myotatique et posture"] },
      { label: "Séquence 2 : Que sait-on de la genèse, de la conduction et de la transmission des messages nerveux ?", items: ["Activité 1 : Genèse et nature du message nerveux", "Activité 2 : Conduction du message nerveux", "Activité 3 : Transmission synaptique"] },
      { label: "Séquence 3 : Comment les réflexes participent-ils à l'intégration de l'organisme à son milieu ?", items: ["Activité 1 : Réflexes et intégration au milieu de vie"] },
      { label: "Séquence 4 : Que sait-on de la motricité volontaire et des autres manifestations de l'activité cérébrale ?", items: ["Activité 1 : Mécanismes de la motricité volontaire", "Activité 2 : Autres manifestations de l'activité cérébrale"] },
      { label: "Séquence 5 : Quelles sont les caractéristiques et le rôle de la communication hormonale ?", items: ["Activité 1 : Caractéristiques et rôle de la communication hormonale"] },
      { label: "Séquence 6 : Que sait-on des relations entre communication nerveuse et hormonale ?", items: ["Activité 1 : Relations entre systèmes nerveux et hormonal"] },
    ],
    "Physiologie de la reproduction humaine et maîtrise de la procréation": [
      { label: "Séquence 1 : Par quels mécanismes les cellules reproductrices sont-elles formées ?", items: ["Activité 1 : Spermatogenèse", "Activité 2 : Ovogenèse"] },
      { label: "Séquence 2 : Comment se forme l'œuf et quel est son devenir ?", items: ["Activité 1 : Fécondation", "Activité 2 : Développement embryonnaire et grossesse"] },
      { label: "Séquence 3 : Comment se fait la maîtrise de la procréation ?", items: ["Activité 1 : Méthodes de contraception", "Activité 2 : Causes de l'infertilité", "Activité 3 : Techniques d'aide à la procréation"] },
      { label: "Séquence 4", items: ["Activité 1 : Dossier sur la procréation médicalement assistée"] },
    ],
  },
};


// Une "sélection" (pick) occupe UNE des 3 sous-tâches obligatoires -- le
// comptage se fait au niveau ACTIVITÉ (pas au niveau SA, demande explicite
// utilisateur) : cliquer une SA ouvre juste sa liste d'Activités/TP, mais
// n'occupe aucun pick tant qu'au moins une Activité/TP n'a pas été cochée.
// Plusieurs Activités peuvent venir de la MÊME SA ou de SA différentes,
// jusqu'à MAX_NOTIONS au total pour la partie. La notion envoyée au backend
// commence TOUJOURS par le titre de SA exact (cf. pickValue) : New_model
// (generator.py::depth_block) retrouve ainsi toujours le bon bloc "NIVEAU À
// RESPECTER" (programme officiel) pour cette Activité précise.
// `notion` = libellé du groupe (grp.label, ex. la séquence/notion au sein
// d'une SA) auquel appartient l'Activité cochée -- capturé dès la sélection
// (cf. toggleActivite) pour que groupForResolution (ci-dessous) puisse
// détecter si 2 des 3 Activités d'une partie PCT partagent la même séquence.
// `viaSequence` distingue un pick "séquence entière" (bouton esp-sequence-
// toggle) d'un pick d'Activité précise, y compris quand une Activité porte
// EXACTEMENT le même nom que sa notion (ex. groupe "Division dans ℕ"
// contenant lui-même l'item "Division dans ℕ" + "Produit de facteurs
// premiers") : sans ce champ, les deux picks sont indiscernables
// (notion===activite dans les deux cas) et cocher cette seule Activité
// affichait à tort "séquence entière sélectionnée" + verrouillait les
// autres Activités du groupe (bug signalé par l'utilisateur, 2026-10-31).
type NotionPick = { sa: string; notion: string; activite: string; viaSequence?: boolean };

function pickValue(p: NotionPick, subject?: string | null): string {
  if (subject === "Mathématiques") {
    // notion===activite couvre aussi bien le pick "séquence entière"
    // (viaSequence=true) que le repli 1-item des groupes lycée (aucune
    // ambiguïté là : la notion entière = cette unique Activité) -- les deux
    // envoient donc le même nom nu au backend, intentionnellement. `viaSequence`
    // ne sert qu'à l'affichage (cf. renderDetailPicker), pas ici.
    return p.notion === p.activite ? p.notion : `${p.notion} — ${p.activite}`;
  }
  return `${p.sa} - ${p.activite}`;
}

function picksToNotions(picks: NotionPick[], subject?: string | null): string[] {
  return picks.map((p) => pickValue(p, subject));
}

// PCT UNIQUEMENT (demande explicite utilisateur) : quand exactement 3
// Activités sont cochées pour une partie (ou le pool 6e/5e), détermine
// automatiquement lesquelles 2 forment la situation-problème combinée de
// la Résolution (la 3e restante forme l'autre, seule) -- critère : ces 2
// Activités partagent la même séquence (`pick.notion`). Retourne `null` si
// c'est ambigu (les 3 dans des séquences différentes, OU les 3 dans la même
// séquence) : dans ce cas, un questionnaire explicite est nécessaire (cf.
// orderedPicksForResolution ci-dessous et renderResolutionQuestionnaire).
function groupForResolution(picks: NotionPick[]): { pair: [number, number]; alone: number } | null {
  if (picks.length !== 3) return null;
  const [a, b, c] = picks;
  if (a.notion === b.notion && a.notion !== c.notion) return { pair: [0, 1], alone: 2 };
  if (a.notion === c.notion && a.notion !== b.notion) return { pair: [0, 2], alone: 1 };
  if (b.notion === c.notion && b.notion !== a.notion) return { pair: [1, 2], alone: 0 };
  return null;
}

// Réordonne les picks d'une partie (ou du pool) avant envoi au backend :
// pour 3 Activités, place le couple (détecté par séquence, ou désigné par
// l'utilisateur via `manualPair`) en position 0/1 et l'isolée en position
// 2 -- c'est cet ORDRE qui encode tout pour generator.py
// ::_pct_resolution_split (Mobilisation = toutes ; Résolution = couple +
// seule). Pour 2 Activités ou moins : ordre de clic, inchangé. Repli
// silencieux sur l'ordre de clic si `manualPair` ne correspond à aucune
// paire valide (jamais de blocage de soumission pour un choix optionnel).
function orderedPicksForResolution(picks: NotionPick[], manualPair?: string[]): NotionPick[] {
  if (picks.length !== 3) return picks;
  const auto = groupForResolution(picks);
  if (auto) {
    const [i, j] = auto.pair;
    return [picks[i], picks[j], picks[auto.alone]];
  }
  if (manualPair && manualPair.length === 2) {
    const pairSet = new Set(manualPair);
    const paired = picks.filter((p) => pairSet.has(p.activite));
    const alone = picks.filter((p) => !pairSet.has(p.activite));
    if (paired.length === 2 && alone.length === 1) {
      return [paired[0], paired[1], alone[0]];
    }
  }
  return picks;
}

// Pool "à plat" = union des deux parties, utilisé uniquement pour dériver la
// liste des classes disponibles (NOTIONS_BY_SUBJECT ci-dessous) — le choix
// réel des notions PCT passe par SUBJECT_PARTS, pas par ce pool.
const PCT_NOTIONS: Record<string, string[]> = Object.fromEntries(
  Object.keys(PCT_NOTIONS_PHYSIQUE).map((c) => [c, [...PCT_NOTIONS_PHYSIQUE[c], ...PCT_NOTIONS_CHIMIE[c]]])
);

// Numéro de SA (1 à 6, dans l'ordre du guide officiel) pour chaque titre de
// SA ci-dessus -- AFFICHAGE UNIQUEMENT (ex. "SA1 : Champs de forces et
// interactions" sur la chip, cf. rendu plus bas). La valeur réellement
// envoyée au backend reste le titre seul (sans préfixe), pour matcher
// exactement les clés de pct.py::DEPTH (cf. PCT_SA_DETAILS plus haut).
const PCT_SA_NUMBER: Record<string, Record<string, number>> = {
  "6e": { "Le courant électrique": 1, "La fabrication d'une lampe de poche": 2, "Quelques combustions vives": 3, "L'eau dans ses différents états physiques": 4, "La pollution de l'air": 5, "La fabrication d'un instrument de production de son": 6 },
  "5e": { "Le courant électrique alternatif": 1, "Protection des personnes et des biens contre les dangers du courant électrique": 2, "Structure de la matière": 3, "Propagation rectiligne de la lumière et applications": 4, "Propriétés physiques des gaz": 5, "Dilatation et contraction des liquides – Fabrication d'un thermomètre à alcool": 6 },
  "4e": { "Utilisation des appareils de mesure de quelques grandeurs électriques – Vérification de la loi d'Ohm": 1, "Structure d'un atome – Quelques propriétés physiques et mécaniques de certains métaux usuels": 2, "Interactions mécaniques – Forces et poulies": 3, "Étude de quelques molécules": 4, "Propagation de la lumière": 5, "Fabrication d'un dynamomètre et d'une chambre noire": 6 },
  "3e": { "Équilibre d'un solide et conversion d'énergie": 1, "Quelques réactions chimiques en solution aqueuse": 2, "L'énergie électrique, un besoin indispensable": 3, "Fabrication d'un détecteur de courant électrique et d'un électrolyseur": 4, "Combustion complète de quelques hydrocarbures et réactions de polymérisation": 5, "L'optique au service de l'homme": 6 },
  "2nde C": { "Le courant électrique dans les composants électriques": 1, "La matière et ses transformations": 2, "La réalisation d'un montage électronique": 3, "Les ions en solution aqueuse": 4, "Les chocs et collisions entre solides en mouvement": 5, "La pollution des eaux superficielles et de la nappe phréatique": 6 },
  "2nde D": { "Le courant électrique dans les composants électriques": 1, "La matière et ses transformations": 2, "La réalisation d'un montage électronique": 3, "Les ions en solution aqueuse": 4, "Les chocs et collisions entre solides en mouvement": 5, "La pollution des eaux superficielles et de la nappe phréatique": 6 },
  "1ère C": { "L'énergie mécanique au service du développement": 1, "Étude de quelques composés organiques et leurs propriétés": 2, "Réalisation d'une source de tension électrique continue stabilisée": 3, "Explication de quelques phénomènes chimiques par les réactions conjuguées d'oxydation et de réduction": 4, "Température et chaleur": 5, "Vibration, propagation et interférences : trois phénomènes physiques utiles dans la technologie des ondes": 6 },
  "1ère D": { "L'énergie mécanique au service du développement": 1, "Étude de quelques composés organiques et leurs propriétés": 2, "Réalisation d'une source de tension électrique continue stabilisée": 3, "Explication de quelques phénomènes chimiques par les réactions conjuguées d'oxydation et de réduction": 4, "Température et chaleur": 5, "Vibration, propagation et interférences : trois phénomènes physiques utiles dans la technologie des ondes": 6 },
  "Tle C": { "Champs de forces et interactions": 1, "Chimie des solutions aqueuses et cinétique chimique": 2, "Les oscillations mécaniques et électriques": 3, "Chimie organique": 4, "Optique géométrique et physique": 5, "Physique atomique et nucléaire (« L'énergie de l'infiniment petit et la science »)": 6 },
  "Tle D": { "Champs de forces et interactions": 1, "Chimie des solutions aqueuses et cinétique chimique": 2, "Les oscillations mécaniques et électriques": 3, "Chimie organique": 4, "Optique géométrique et physique": 5, "Physique atomique et nucléaire (« L'énergie de l'infiniment petit et la science »)": 6 },
};

// Même principe que PCT_SA_NUMBER ci-dessus, pour la SVT (New_model/backend/
// subjects/svt.py::PROGRAMME_SVT) -- affichage uniquement.
const SVT_SA_NUMBER: Record<string, Record<string, number>> = {
  "6e": { "Alimentation et besoins nutritionnels de l'Homme": 1, "Diversité des régimes alimentaires chez les animaux": 2, "Unité et diversité des phénomènes respiratoires chez les êtres vivants": 3 },
  "5e": { "Besoins nutritifs des végétaux": 1, "Relations entre les êtres vivants, entre les êtres vivants et leur milieu de vie": 2, "Reproduction et développement chez les animaux et les végétaux": 3 },
  "4e": { "Sol, avenir de l'Homme": 1, "Terre, planète active": 2 },
  "3e": { "Les échanges de matières et d'énergie entre l'organisme et le milieu extérieur": 1, "La commande nerveuse et les réactions comportementales de l'Homme": 2, "Reproduction humaine": 3, "Les réactions immunitaires et les moyens de lutte contre les agressions microbiennes": 4 },
  "2nde AB": { "La cellule fonde l'unité et la diversité du monde vivant": 1, "Cycles de la matière et flux d'énergie dans les communautés d'êtres vivants": 2 },
  "2nde C": { "La cellule fonde l'unité et la diversité du monde vivant": 1, "Cycles de la matière et flux d'énergie dans les communautés d'êtres vivants": 2 },
  "2nde D": { "La cellule fonde l'unité et la diversité du monde vivant": 1, "Cycles de la matière et flux d'énergie dans les communautés d'êtres vivants": 2 },
  "1ère AB": { "Conversion de l'énergie des métabolites en énergie utilisable par les cellules": 1, "Connaissance des micro-organismes et de leur utilisation en biotechnologie agro-alimentaire et médicale": 2 },
  "1ère C": { "La géodynamique interne : mouvement de la lithosphère et énergie interne du globe": 1, "Conversion de l'énergie des métabolites en énergie utilisable par les cellules": 2, "Connaissance des micro-organismes et de leur utilisation en biotechnologie agro-alimentaire et médicale": 3 },
  "1ère D": { "Mouvement de la lithosphère et énergie interne du globe": 1, "La mesure du temps dans l'histoire de la Terre et de la vie": 2, "Conversion de l'énergie des métabolites en énergie utilisable par les cellules": 3, "Connaissance des micro-organismes et de leur utilisation en biotechnologie agro-alimentaire et médicale": 4 },
  "Tle AB": { "L'information génétique : nature, localisation et mécanisme de transmission": 1, "La reproduction humaine": 2 },
  "Tle C": { "L'information génétique : nature, localisation et mécanisme de transmission": 1, "La reproduction humaine": 2 },
  "Tle D": { "L'information génétique : nature, localisation et mécanisme de transmission": 1, "La sauvegarde de l'intégrité de l'organisme par les réactions immunitaires": 2, "La transmission des messages dans l'organisme": 3, "Physiologie de la reproduction humaine et maîtrise de la procréation": 4 },
};

function saChipLabel(classe: string, titre: string): string {
  const n = PCT_SA_NUMBER[classe]?.[titre] ?? SVT_SA_NUMBER[classe]?.[titre] ?? MATHS_SA_NUMBER[classe]?.[titre];
  return n ? `SA${n} : ${titre}` : titre;
}

// Mots-clés de notions de géométrie : déclenchent la proposition de la case
// "figure obligatoire" (miroir de _GEO_KEYWORDS dans New_model/backend/
// generator.py — les deux listes doivent rester alignées).
const GEOMETRY_KEYWORDS = [
  "triangle", "cercle", "polygone", "parallélogramme", "losange", "carré",
  "rectangle", "trapèze", "pavé droit", "pavé", "cube", "parallélépipède",
  "pyramide", "cône", "sphère", "boule", "patron", "vecteur", "repère",
  "solide", "polyèdre", "prisme", "angle", "symétrie", "homothétie",
  "rotation", "translation", "thalès", "pythagore",
  // Notions de géométrie du LYCÉE (2nde/1ère/Tle) — absentes avant, la case
  // "figure obligatoire" ne s'affichait donc jamais pour ces notions-là.
  "droite", "droites", "plan", "plans", "produit scalaire",
  "produit vectoriel", "isométrie", "isométries", "similitude",
  "similitudes", "conique", "coniques", "parabole", "ellipse", "hyperbole",
  "barycentre", "orthogonal", "orthogonalité", "orthonormé", "projection",
  "géométrie analytique", "coplanaire", "coplanarité", "espace",
  "angle inscrit", "angles inscrits", "parallélisme", "perpendiculaire",
];

function isGeometryNotion(notion: string): boolean {
  const low = notion.toLowerCase();
  return GEOMETRY_KEYWORDS.some((k) => low.includes(k));
}

// Matières composées de PARTIES indépendantes (chacune avec ses 3 notions et
// ses 3 sous-tâches), au lieu du pool unique de 3 "problèmes" (maths, SVT).
// Absente de cette table = pool unique, comportement inchangé.
// `details` (optionnel) alimente la liste déroulante Activités/TP/Séquences
// affichée au clic sur une SA (cf. rendu plus bas) -- absent = la matière
// n'a pas (encore) ce niveau de détail et le picker reste au niveau SA seul.
const SUBJECT_PARTS: Record<string, { label: string; slug: string; notions: Record<string, string[]>; details?: Record<string, Record<string, SaGroup[]>> }[]> = {
  "PCT": [
    { label: "Physique", slug: "physique", notions: PCT_NOTIONS_PHYSIQUE, details: PCT_SA_DETAILS },
    { label: "Chimie", slug: "chimie", notions: PCT_NOTIONS_CHIMIE, details: PCT_SA_DETAILS },
  ],
  // SVT : pool unique (pas de Physique/Chimie), mais même mécanique de
  // sélection par Activité au sein d'une SA -- un seul "faux" part "Notions"
  // pour réutiliser tel quel le rendu "parts" ci-dessous (demande explicite
  // utilisateur : même architecture que PCT). La 1ère activité cochée
  // alimente la Restitution (Partie I), les suivantes le Problème (Partie
  // II) -- cf. generator.py (notions[0] -> restitution, notions[1:] ->
  // probleme_1, déjà le comportement existant côté New_model).
  "SVT": [
    { label: "Notions", slug: "svt", notions: SVT_NOTIONS, details: SVT_SA_DETAILS },
  ],
  // Mathématiques : même mécanique que SVT -- un seul "faux" part "Notions",
  // juste pour regrouper visuellement les notions par SA dans le picker
  // (fiches officielles de progression 2026-2027). Détail à 3 niveaux SA ->
  // Notion -> Activités (MATHS_SEQ_ACTIVITES_DETAILS) -- IDENTIQUE en mode
  // Épreuve et en mode Exercice (demande explicite utilisateur : même
  // format de choix des notions dans les deux modes ; auparavant l'épreuve
  // se limitait à 2 niveaux via MATHS_SA_DETAILS). Aucun autre changement
  // de comportement de génération : toujours exactement 3 notions au total
  // (MIN_NOTIONS_BY_SUBJECT ne liste pas "Mathématiques" -> réplique à
  // MAX_NOTIONS, comportement actuel inchangé), toujours soumises en pool
  // plat au backend (topics_by_part reconstruit en topics flat côté API).
  "Mathématiques": [
    { label: "Notions", slug: "mathematiques", notions: MATHS_SA_TITLES, details: MATHS_SEQ_ACTIVITES_DETAILS },
  ],
};

// La structure à parties ne s'applique qu'à CERTAINES classes de la matière
// (PCT : second cycle complet -- 2nde/1ère/Tle, toutes séries C/D --
// alignement sur le document officiel IGPM 2026-2027 ; 4e/3e aussi, mais en
// scission ASYMÉTRIQUE (cf. PCT_4E3E_CLASSES/validation plus bas) ; 6e/5e
// gardent le pool unique de 3 problèmes, comme les maths). Absente/non
// listée = s'applique à toutes les classes dès que SUBJECT_PARTS a une
// entrée pour la matière.
const PARTS_CLASSES: Record<string, Set<string>> = {
  "PCT": new Set(["4e", "3e", "2nde C", "2nde D", "1ère C", "1ère D", "Tle C", "Tle D"]),
};

// 4e/3e PCT : scission Physique/Chimie ASYMÉTRIQUE et FIXE (document
// officiel IGPM) -- Chimie a toujours exactement 1 notion (1 situation-
// problème), Physique toujours exactement 2 (2 situations-problèmes) :
// pas un choix libre de répartition par l'utilisateur, contrairement à
// 2nde/1ère/Tle où chaque partie a son propre nombre fixe (3) de notions.
const PCT_4E3E_CLASSES = new Set(["4e", "3e"]);

// 2nde/1ère/Tle PCT (demande explicite utilisateur) : chaque partie
// accepte désormais 2 OU 3 activités (au lieu d'exactement 3) -- la
// Mobilisation porte toujours sur toutes les activités choisies, la
// Résolution se répartit par séquence (cf. groupForResolution plus bas
// et generator.py::_pct_resolution_split).
const PCT_SECOND_CYCLE_CLASSES = new Set([
  "2nde C", "2nde D", "1ère C", "1ère D", "Tle C", "Tle D",
]);

function partsFor(subject: string, classe: string) {
  const def = SUBJECT_PARTS[subject];
  if (!def) return null;
  const restrict = PARTS_CLASSES[subject];
  if (restrict && !restrict.has(classe)) return null;
  return def;
}

// Nombre d'activités minimum à sélectionner pour valider l'épreuve, par
// matière -- absente de cette table = MAX_NOTIONS (comportement par
// défaut, inchangé). SVT : 2 ou 3 activités acceptées (1 pour la
// Restitution, 1 ou 2 pour le Problème) -- demande explicite utilisateur,
// jamais 3 obligatoires comme pour PCT.
const MIN_NOTIONS_BY_SUBJECT: Record<string, number> = {
  "SVT": 2,
};

const NOTIONS_BY_SUBJECT: Record<string, Record<string, string[]>> = {
  "Mathématiques": MATHEMATIQUES_NOTIONS,
  "PCT": PCT_NOTIONS,
  "SVT": SVT_NOTIONS,
};

const SUBJECTS = [
  { key: "Mathématiques", desc: "Algèbre, analyse, géométrie" },
  { key: "PCT", desc: "Physique, Chimie, Technologie" },
  { key: "SVT", desc: "Sciences de la Vie et de la Terre" },
] as const;
const SUBJECT_SYMBOLS: Record<string, string> = { "Mathématiques": "∑", PCT: "⚛", SVT: "❋" };

/** A selectable card with an ink check, as in the workspace mockup. */
function Choice({ selected, onClick, children, className = "", disabled = false }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button type="button" className={`esp-choice ${className}${selected ? " is-on" : ""}${disabled ? " is-disabled" : ""}`} aria-pressed={selected} aria-disabled={disabled} disabled={disabled} onClick={onClick}>
      <span className="esp-choice-dot" aria-hidden="true">{selected && <Check />}</span>{children}
    </button>
  );
}

const COLLEGE = new Set(["6e", "5e", "4e", "3e"]);
// Durées imposées par les consignes de l'AE (non modifiables par l'utilisateur) :
//   6e/5e -> 1h30 ; 4e/3e -> 2h ; séries littéraires (AB) -> 2h max ;
//   2nde/1ère CD -> 3h ; Tle CD -> 4h.
const DEFAULT_DURATIONS: Record<string, number> = {
  "6e": 90, "5e": 90, "4e": 120, "3e": 120,
  "2nde AB": 120, "2nde C": 180, "2nde D": 180,
  "1ère AB": 120, "1ère C": 180, "1ère D": 180,
  "Tle AB": 120, "Tle C": 240, "Tle D": 240,
};

// Durée PROPRE à la SVT (demande explicite utilisateur), distincte de la
// table partagée ci-dessus (toujours utilisée par Maths/PCT) -- miroir du
// dict Python SVT_DURATION_OVERRIDES (New_model/backend/subjects/svt.py).
// Séries littéraires (AB) 2nd cycle : 1h30 (Partie II allégée à 2
// documents max). Séries D 2nd cycle : 3h partout, y compris Tle D (au
// lieu de 4h partagées). Séries C et collège : non listées, suivent
// DEFAULT_DURATIONS inchangé (confirmé explicitement par l'utilisateur).
const SVT_DURATION_OVERRIDES: Record<string, number> = {
  "2nde AB": 90, "1ère AB": 90, "Tle AB": 90,
  "2nde D": 180, "1ère D": 180, "Tle D": 180,
};

function durationFor(subject: string | null, classe: string): number {
  return (subject === "SVT" ? SVT_DURATION_OVERRIDES[classe] : undefined)
    ?? DEFAULT_DURATIONS[classe] ?? 180;
}

// Formate une durée en minutes vers "1H30", "2H00"...
function formatDuree(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}H${m.toString().padStart(2, "0")}`;
}

// Deux moteurs de génération au choix (façon Titan 1 / Titan 2) — Titan 2 en
// première position car c'est désormais le moteur le plus rapide.
// Titan 1 TEMPORAIREMENT bloqué (demande explicite utilisateur, 2026-11-02 :
// le compte DeepSeek -- moteur "verify" de Titan1 -- est à sec) : reste
// visible dans le choix (pas filtré comme avant pour PCT, cf.
// availableMoteurs ci-dessous, désormais retiré) mais non sélectionnable,
// avec le message "Non disponible pour le moment" à la place de sa
// description habituelle. Repasser `disponible` à true une fois le solde
// DeepSeek reconstitué.
const MOTEURS = [
  {
    id: "titan2",
    nom: "Titan 2",
    desc: "Mode rapide & Génération optimisée",
    detail: "",
    duree: "~2 min",
    avert: false,
    disponible: true,
  },
  {
    id: "titan1",
    nom: "Titan 1",
    desc: "Vérification renforcée & Contrôle approfondi",
    detail: "",
    duree: "~4-5 min",
    avert: true,
    disponible: false,
  },
] as const;

// Vocabulaire propre à une matière pour désigner une unité notée, même en
// pool unique (ex. PCT : "Sous-tâche 1/2/3" dans TOUTES les classes, pas
// seulement 1ère/Tle où la matière est en plus scindée en parties). Absente
// de cette table = "Problème" (maths, SVT), numéroté en chiffres romains.
const SUBJECT_STEP_NOUN: Record<string, string> = { "PCT": "Sous-tâche" };

// Forme des étapes de streaming pour une matière donnée — pool unique de 3
// "Problème I/II/III" (ou son vocabulaire propre) par défaut, ou une étape
// par sous-tâche de chaque partie (ex. "Physique 1"..."Chimie 3") si la
// matière a des parties pour cette classe.
// Classes SVT par palier -- mêmes ensembles que _SVT_AB_CLASSES/_SVT_D_CLASSES
// côté backend (generator.py), pour dériver les MÊMES ID d'étapes réels.
const SVT_AB_CLASSES = new Set(["2nde AB", "1ère AB", "Tle AB"]);
const SVT_D_CLASSES = new Set(["2nde D", "1ère D", "Tle D"]);
const SVT_STEP_LABELS: Record<string, string> = {
  partie1_association: "Association mot/définition",
  partie1_lacunaire: "Test lacunaire",
  partie1_paragraphe: "Construction de paragraphe",
  partie1_dissertation: "Dissertation / Texte argumentatif ou explicatif",
  restitution: "Restitution organisée des connaissances",
  probleme_1: "Résolution de problème(s) à partir de documents fournis",
  situation_1: "Situation-problème 1",
  situation_2: "Situation-problème 2",
};

function stepsAndLabelsFor(
  subject: string, classe: string, mode: "epreuve" | "exercice" = "epreuve",
  exerciceNotionsCount = 1, partie1Choice: string | null = null,
  partsNotionCounts: number[] | null = null
): { steps: string[]; labels: Record<string, string> } {
  if (mode === "exercice") {
    // 2 notions, 1ère/Tle : Partie A/Partie B générées par deux appels
    // indépendants (cf. backend/_sse_generate) -- deux steps distincts à
    // l'écran, pas un seul "Exercice" global.
    if (exerciceNotionsCount === 2 && !COLLEGE.has(classe) && !classe.startsWith("2nde")) {
      return {
        steps: ["exercice_partie_a", "exercice_partie_b"],
        labels: { exercice_partie_a: "Partie A", exercice_partie_b: "Partie B" },
      };
    }
    return { steps: ["exercice_unique"], labels: { exercice_unique: "Exercice" } };
  }
  // BUG corrigé (constaté en conditions réelles : barre de progression
  // bloquée à 0% pour toute génération SVT) : SUBJECT_PARTS["SVT"] existe
  // UNIQUEMENT pour le picker de notions (regroupement visuel par SA, un
  // seul "faux" part "Notions") -- le backend, lui, ne génère JAMAIS
  // d'étapes "svt_support"/"svt_1"/"svt_contexte" pour cette matière
  // (has_restitution=True côté Subject) : il émet "restitution"/"probleme_1"
  // (ou, depuis la restructuration par palier, "partie1_association" /
  // "partie1_lacunaire" / "partie1_paragraphe" / "partie1_dissertation" en
  // 6e/5e/4e/3e, et "situation_1"/"situation_2" à la place de "probleme_1"
  // pour les séries D) -- cf. generator.py::steps_for, has_restitution.
  // Sans cette exception (même principe que Mathématiques ci-dessous), la
  // barre de progression n'attendait que des événements SSE qui n'arrivent
  // jamais.
  if (subject === "SVT") {
    let partie1: string;
    if (classe === "6e" || classe === "5e") {
      partie1 = partie1Choice && partie1Choice in SVT_STEP_LABELS && partie1Choice.startsWith("partie1_")
        ? partie1Choice : "partie1_association";
    } else if (classe === "4e" || classe === "3e") {
      partie1 = "partie1_dissertation";
    } else {
      partie1 = "restitution";
    }
    const partie2 = SVT_D_CLASSES.has(classe) ? ["situation_1", "situation_2"] : ["probleme_1"];
    return { steps: [partie1, ...partie2], labels: SVT_STEP_LABELS };
  }
  if (subject === "PCT" && (classe === "6e" || classe === "5e")) {
    // 6e/5e PCT (document officiel IGPM) : pool unique (pas de scission
    // Physique/Chimie), mais même structure Mobilisation/Résolution que
    // 4e/3e/Second Cycle -- forme FIXE (toujours 3 notions), cf.
    // generator.py::steps_for. Ordre d'émission réel côté backend : Support
    // d'abord (séquentiel), puis Mobilisation/Situations (parallèle), puis
    // Contexte/Tâche (séquentiel, APRÈS).
    return {
      steps: ["support", "mobilisation", "situation_1", "situation_2", "contexte", "tache"],
      labels: {
        support: "Support",
        mobilisation: "Mobilisation des ressources",
        situation_1: "Situation-problème 1",
        situation_2: "Situation-problème 2",
        contexte: "Contexte",
        tache: "Tâche",
      },
    };
  }
  // IMPORTANT : ce `parts` sert à déterminer les ID d'étapes RÉELLEMENT
  // émis par le backend (pour faire avancer la barre de progression SSE),
  // pas juste "la matière a un picker groupé par SA". Mathématiques utilise
  // SUBJECT_PARTS uniquement pour le picker (regroupement visuel par SA,
  // cf. plus haut) -- le backend y génère toujours en pool unique classique
  // ("contexte"/"tache"/"exercice_1..3"), jamais de vrais "parts" nommées
  // (physique_1, chimie_1...) comme PCT. Sans cette exception, la barre de
  // progression ne recevrait jamais les events "mathematiques_support" /
  // "mathematiques_1" attendus -> bloquée à 0% alors que la génération
  // réussit bel et bien côté serveur (bug constaté, cf. logs new-model).
  const parts = subject === "Mathématiques" ? null : partsFor(subject, classe);
  // Matière à parties (PCT 1ère/Tle) : chaque partie a son propre contexte/
  // tâche côté serveur (physique_contexte...), jamais un "contexte"/"tache"
  // global -- ces deux pastilles ne se termineraient donc jamais.
  const labels: Record<string, string> = parts ? {} : { contexte: "Contexte", tache: "Tâche" };
  const steps = parts ? [] : ["contexte", "tache"];
  if (parts && subject === "PCT" && PCT_4E3E_CLASSES.has(classe)) {
    // 4e/3e PCT : scission ASYMÉTRIQUE (document officiel IGPM) -- pas de
    // sous-tâches numérotées "{slug}_1/2/3", mais "{slug}_mobilisation" +
    // 1 ou 2 situations-problèmes selon le nombre de notions de CETTE
    // partie (cf. generator.py::build_step_prompt côté New_model).
    parts.forEach((part, i) => {
      const n = partsNotionCounts?.[i] ?? 1;
      const supportId = `${part.slug}_support`;
      steps.push(supportId);
      labels[supportId] = "Support";
      const mobId = `${part.slug}_mobilisation`;
      steps.push(mobId);
      labels[mobId] = "Mobilisation des ressources";
      const situationIds = n >= 2
        ? [`${part.slug}_situation_1`, `${part.slug}_situation_2`]
        : [`${part.slug}_situation`];
      situationIds.forEach((id, si) => {
        steps.push(id);
        labels[id] = `Situation-problème ${si + 1}`;
      });
      steps.push(`${part.slug}_contexte`, `${part.slug}_tache`);
      labels[`${part.slug}_contexte`] = "Contexte";
      labels[`${part.slug}_tache`] = "Tâche";
    });
  } else if (parts) {
    for (const part of parts) {
      // Support UNIQUE de la partie (demande explicite utilisateur), généré
      // séquentiellement AVANT ses sous-tâches (cf. backend/_sse_generate) --
      // affiché comme sa propre pastille de chargement.
      const supportId = `${part.slug}_support`;
      steps.push(supportId);
      labels[supportId] = "Support";
      for (let i = 1; i <= 3; i++) {
        const id = `${part.slug}_${i}`;
        steps.push(id);
        labels[id] = `${part.label} ${i}`;
      }
    }
  } else {
    const noun = SUBJECT_STEP_NOUN[subject];
    const romans = ["I", "II", "III"];
    for (let i = 1; i <= 3; i++) {
      const id = `exercice_${i}`;
      steps.push(id);
      labels[id] = noun ? `${noun} ${i}` : `Problème ${romans[i - 1]}`;
    }
  }
  return { steps, labels };
}

type Phase = "form" | "streaming" | "done" | "error";

// ── Page ───────────────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { exams_remaining, pct_exams_remaining, is_unlimited, openPaywall } = useQuotaStore();
  const isAdmin = user?.is_admin || user?.is_superuser;

  // "epreuve" (3 problèmes/sous-tâches + contexte/tâche, comportement
  // d'origine) ou "exercice" (un seul bloc autonome, 1 ou 2 notions max) —
  // demande explicite utilisateur, cf. ExamCreateRequest.mode côté backend.
  // Pas de sélection par défaut (demande explicite) : null jusqu'à un choix
  // actif de l'utilisateur, comme pour le moteur Titan1/Titan2.
  const [mode, setMode] = useState<"epreuve" | "exercice" | null>(null);
  // Sous-type du mode Exercice (demande explicite utilisateur) : l'utilisateur
  // précise si l'exercice généré est un "Exercice d'application" ou une
  // "Interrogation écrite" -- ce choix devient le titre affiché dans le rendu
  // (document PDF + liste des épreuves), cf. exerciceTypeLabel ci-dessous.
  const [exerciceType, setExerciceType] = useState<"application" | "interrogation" | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [classe, setClasse] = useState("");
  const [selectedNotions, setSelectedNotions] = useState<string[]>([]);
  // Pour une matière à parties (PCT) : jusqu'à MAX_NOTIONS "picks" -- chacun
  // UNE Activité/TP précis d'une SA -- choisis indépendamment par partie
  // (ex. { Physique: [...3], Chimie: [...3] }), au lieu du pool unique
  // `selectedNotions` ci-dessus. Comptage en Activités, pas en SA.
  const [selectedPicksByPart, setSelectedPicksByPart] = useState<Record<string, NotionPick[]>>({});
  // SA actuellement "ouverte" (liste Activités/TP affichée) par partie --
  // purement de la navigation, n'occupe aucun pick par elle-même.
  const [expandedSAByPart, setExpandedSAByPart] = useState<Record<string, string | null>>({});
  // PCT UNIQUEMENT (demande explicite utilisateur) : quand 3 Activités sont
  // cochées pour une partie (ou le pool 6e/5e) et qu'aucune paire ne partage
  // la même séquence (ni les 3 à la fois), un questionnaire demande à
  // l'utilisateur lesquelles 2 des 3 Activités forment la situation-
  // problème combinée -- la 3e restante forme l'autre, seule. Clé = label
  // de partie (ou "__pool__") ; valeur = les 2 `activite`
  // désignées comme couple. Non renseigné = repli silencieux sur les 2
  // premières cochées (cf. orderedPicksForResolution), jamais de blocage de
  // soumission.
  const [resolutionPairChoice, setResolutionPairChoice] = useState<Record<string, string[]>>({});
  // SVT 6e/5e UNIQUEMENT (demande explicite utilisateur) : type de Partie I
  // choisi par l'enseignant -- "partie1_association" | "partie1_lacunaire" |
  // "partie1_paragraphe" (ce dernier désactivé si la 1ère activité cochée a
  // un SA < 2, cf. SVT_SA_NUMBER). null = pas encore choisi (replié sur
  // "partie1_association" côté backend si jamais envoyé tel quel).
  const [partie1Choice, setPartie1Choice] = useState<string | null>(null);
  const [duration, setDuration] = useState(180);
  const [downloading, setDownloading] = useState(false);
  const [engine, setEngine] = useState<"titan1" | "titan2" | null>(null);
  const [showEngineModal, setShowEngineModal] = useState(false);
  // Case "figure obligatoire" : proposée uniquement quand une notion de
  // géométrie est sélectionnée (miroir de _GEO_KEYWORDS côté New_model/
  // backend/generator.py — garder les deux listes alignées si l'une évolue).
  const [figureRequise, setFigureRequise] = useState(false);

  // Streaming state
  // Les 3 problèmes sont générés en parallèle côté serveur : plusieurs étapes
  // peuvent être "actives" en même temps, donc activeSteps est un ensemble
  // (pas une seule chaîne) et le texte de chaque étape est stocké par clé pour
  // pouvoir se réafficher dans l'ordre canonique (STEPS) même si les étapes
  // se terminent dans le désordre.
  const [phase, setPhase] = useState<Phase>("form");
  const [activeSteps, setActiveSteps] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [stepTexts, setStepTexts] = useState<Record<string, string>>({});
  const [examId, setExamId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const CLASSES = useMemo(() => (subject ? Object.keys(NOTIONS_BY_SUBJECT[subject]) : []), [subject]);
  const notions = useMemo(
    () => (subject && classe ? NOTIONS_BY_SUBJECT[subject]?.[classe] || [] : []),
    [subject, classe]
  );
  // Mode "exercice" : ignore la structure à parties SÉPARÉES de PCT (même en
  // 1ère/Tle) — un seul picker plat (pool fusionné Physique+Chimie, cf.
  // usesPoolDetail plus bas), jamais de Partie A/B ni de combinaisons/Chimie
  // optionnelle côté formulaire. Mathématiques et SVT n'ont jamais eu qu'un
  // seul "faux" part "Notions" (pas de scission comme PCT) : leur `parts`
  // reste donc identique en Épreuve et en Exercice (demande explicite
  // utilisateur : même format de choix des notions dans les deux modes).
  const parts = !subject
    ? null
    : mode === "exercice" && subject === "PCT"
    ? null
    : partsFor(subject, classe);
  const MAX_NOTIONS = mode === "exercice" ? 2 : 3;
  // Détail SA -> Activités appliqué au pool PCT (6e/5e en épreuve, et tout
  // PCT en mode exercice -- jamais de scission Physique/Chimie dans ces cas,
  // cf. calcul de `parts` plus haut) -- demande explicite utilisateur : même
  // format de sélection des notions pour les exercices que pour les
  // épreuves, cf. renderDetailPicker.
  const usesPoolDetail = subject === "PCT" && !parts;

  // Notions sélectionnées, à plat (pool unique OU union des parties PCT) —
  // utilisé pour décider si la case "figure obligatoire" doit être proposée,
  // et repris tel quel dans le payload envoyé au backend.
  const flatSelectedNotions = useMemo(() => {
    if (parts) return parts.flatMap((p) => picksToNotions(selectedPicksByPart[p.label] || [], subject));
    if (usesPoolDetail) return picksToNotions(selectedPicksByPart["__pool__"] || [], subject);
    return selectedNotions;
  }, [parts, usesPoolDetail, selectedPicksByPart, selectedNotions]);
  const hasGeometryNotion = useMemo(
    () => flatSelectedNotions.some(isGeometryNotion),
    [flatSelectedNotions]
  );
  // SVT/PCT : la case "schéma/graphique/circuit" est proposée dès qu'une
  // notion est choisie, quelle que soit la classe ou la notion -- PCT
  // couvre bien plus que des notions "géométriques" (circuits, montages de
  // chimie, champs, etc., cf. figure_service_pct.py côté New_model), donc
  // ne JAMAIS la restreindre à hasGeometryNotion (pensé pour les Maths)
  // pour cette matière -- même principe que SVT, pas de notion
  // "géométrique" au sens Maths non plus.
  const isSvt = subject === "SVT";
  const isPct = subject === "PCT";
  const showFigureOption = hasGeometryNotion
    || ((isSvt || isPct) && flatSelectedNotions.length > 0);

  // Titan1 désormais bloqué GLOBALEMENT (toutes matières, cf. `disponible`
  // sur MOTEURS ci-dessus) plutôt que filtré pour PCT seulement -- reste
  // affiché dans le choix mais non sélectionnable.
  const availableMoteurs = MOTEURS;

  function handleSubjectChange(s: string) {
    setSubject(s);
    const classesForSubject = Object.keys(NOTIONS_BY_SUBJECT[s]);
    const nextClasse = classesForSubject.includes(classe)
      ? classe
      : classesForSubject[classesForSubject.length - 1];
    setClasse(nextClasse);
    setSelectedNotions([]);
    setSelectedPicksByPart({});
    setExpandedSAByPart({});
    setResolutionPairChoice({});
    setPartie1Choice(null);
    setDuration(durationFor(s, nextClasse));
  }

  function handleClasseChange(c: string) {
    setClasse(c);
    setSelectedNotions([]);
    setSelectedPicksByPart({});
    setExpandedSAByPart({});
    setResolutionPairChoice({});
    setPartie1Choice(null);
    setDuration(durationFor(subject, c));
  }

  function handleModeChange(m: "epreuve" | "exercice") {
    setMode(m);
    setExerciceType(null);
    setSelectedNotions([]);
    setSelectedPicksByPart({});
    setExpandedSAByPart({});
    setResolutionPairChoice({});
    setPartie1Choice(null);
  }

  // Les 3 choix (Épreuve complète / Exercice d'application / Interrogation
  // écrite) sont affichés côte à côte en une seule étape (demande explicite
  // utilisateur) : les deux derniers fixent mode="exercice" ET exerciceType
  // en un seul clic, au lieu d'une étape intermédiaire séparée.
  function handleTypeChoice(choice: "application" | "interrogation") {
    handleModeChange("exercice");
    setExerciceType(choice);
  }

  // "Exercice d'application" par défaut (comportement historique avant ce
  // choix) tant que l'utilisateur n'a pas explicitement précisé -- mode
  // Épreuve non concerné (pas de sous-type).
  const exerciceTypeLabel = exerciceType === "interrogation" ? "Interrogation écrite" : "Exercice d'application";

  function toggleNotion(n: string) {
    setSelectedNotions((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= MAX_NOTIONS) return prev;
      return [...prev, n];
    });
  }

  // Clique sur une chip SA : ouvre/ferme sa liste d'Activités/TP (une seule
  // SA ouverte à la fois par partie, par simplicité) -- n'occupe AUCUN pick
  // par elle-même, cf. toggleActivite ci-dessous pour ça.
  function toggleExpandSA(partLabel: string, sa: string) {
    setExpandedSAByPart((prev) => ({
      ...prev,
      [partLabel]: prev[partLabel] === sa ? null : sa,
    }));
  }

  // Coche/décoche UNE Activité ou UN TP d'une SA -- chaque coche occupe UN
  // pick (une des MAX_NOTIONS sous-tâches de la partie), plusieurs Activités
  // de la MÊME SA comptent chacune séparément (demande explicite
  // utilisateur : le comptage se fait en Activités, pas en SA).
  function toggleActivite(partLabel: string, sa: string, notion: string, activite: string, viaSequence = false) {
    setSelectedPicksByPart((prev) => {
      const cur = prev[partLabel] || [];
      // `viaSequence` fait partie de la clé d'identité du pick : un pick
      // "séquence entière" et un pick d'Activité précise de même nom
      // (notion===activite) sont deux sélections DISTINCTES à ne jamais
      // confondre lors du retrait (cf. NotionPick, commentaire ci-dessus).
      const existingIdx = cur.findIndex(
        (p) => p.sa === sa && p.notion === notion && p.activite === activite && !!p.viaSequence === viaSequence
      );
      if (existingIdx >= 0) {
        return { ...prev, [partLabel]: cur.filter((_, i) => i !== existingIdx) };
      }
      // 4e/3e PCT (document officiel IGPM) : répartition FIXE -- Chimie a
      // toujours exactement 1 notion (1 situation-problème), Physique
      // toujours exactement 2 (2 situations-problèmes) -- pas un choix
      // libre de l'utilisateur, cf. PCT_4E3E_CLASSES/validation plus bas.
      const capForPart = (subject === "PCT" && PCT_4E3E_CLASSES.has(classe))
        ? (partLabel === "Chimie" ? 1 : 2)
        : MAX_NOTIONS;
      if (cur.length >= capForPart) return prev;
      return { ...prev, [partLabel]: [...cur, { sa, notion, activite, viaSequence }] };
    });
  }

  // PCT UNIQUEMENT (demande explicite utilisateur) : questionnaire affiché
  // SEULEMENT quand exactement 3 Activités sont cochées pour `label` ET
  // qu'aucun regroupement par séquence n'est déductible automatiquement
  // (cf. groupForResolution) -- demande à l'utilisateur lesquelles 2 des 3
  // forment la situation-problème combinée. Jamais de blocage : non
  // répondu = repli sur les 2 premières cochées (orderedPicksForResolution).
  function renderResolutionQuestionnaire(label: string, picks: NotionPick[]) {
    if (subject !== "PCT" || picks.length !== 3 || groupForResolution(picks)) return null;
    const chosen = resolutionPairChoice[label] || [];
    return (
      <div className="esp-sa-panel">
        <p className="esp-sa-head">
          Ces 3 activités ne partagent pas une séquence commune : cochez les 2 qui formeront une situation-problème ensemble (la 3ᵉ restante formera l’autre, seule).
        </p>
        <div className="esp-sa-list">
          <div className="esp-sa-group">
            {picks.map((p) => {
              const isChecked = chosen.includes(p.activite);
              const disabled = !isChecked && chosen.length >= 2;
              return (
                <label key={p.activite} className={isChecked ? "is-on" : ""}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={disabled}
                    onChange={() => {
                      setResolutionPairChoice((prev) => {
                        const cur = prev[label] || [];
                        const without = cur.filter((a) => a !== p.activite);
                        const next = (isChecked ? without : [...without, p.activite]).slice(0, 2);
                        if (next.length === 0) {
                          const rest = { ...prev };
                          delete rest[label];
                          return rest;
                        }
                        return { ...prev, [label]: next };
                      });
                    }}
                  />
                  {p.activite}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Picker SA -> Activités réutilisable pour les pools PLATS (pas de "partie"
  // au sens PCT 1ère/Tle) : le pool PCT 6e/5e en épreuve et PCT en mode
  // exercice (pseudo-label "__pool__") -- demande explicite utilisateur
  // (même niveau de détail qu'en 1ère/Tle, même pour les classes sans
  // structure à 2 parties obligatoires).
  // Réutilise telles quelles toggleExpandSA/toggleActivite/selectedPicksByPart
  // (déjà génériques par "label") avec un pseudo-label au lieu d'un vrai
  // part.label -- aucun nouvel état nécessaire.
  function renderDetailPicker(pseudoLabel: string, saList: string[], detailsMap: Record<string, Record<string, SaGroup[]>>, allowSequencePick = false) {
    const picked = selectedPicksByPart[pseudoLabel] || [];
    const expandedSA = expandedSAByPart[pseudoLabel] || null;
    const groups = expandedSA ? detailsMap[classe]?.[expandedSA] : undefined;
    return (
      <>
        <div className="esp-sa-chips">
          {saList.map((sa) => {
            const countForSA = picked.filter((p) => p.sa === sa).length;
            const isOpen = expandedSA === sa;
            return (
              <button key={sa} type="button" aria-expanded={isOpen} onClick={() => toggleExpandSA(pseudoLabel, sa)}
                className={cn("esp-sa", isOpen && "is-open", countForSA > 0 && "has-picks")}>
                {saChipLabel(classe, sa)}{countForSA > 0 && <i>{countForSA}</i>}
              </button>
            );
          })}
        </div>
        {expandedSA && (!groups || groups.length === 0
          ? <p className="esp-hint">Détail des activités non disponible pour cette SA.</p>
          : <div className="esp-sa-panel">
              <p className="esp-sa-head"><BookOpen aria-hidden="true" />{saChipLabel(classe, expandedSA)} · cochez au moins une activité à évaluer</p>
              <div className="esp-sa-list">
                {groups.map((grp) => {
                  // Sélection de la Notion ENTIÈRE comme "séquence" (demande
                  // explicite utilisateur, Maths uniquement -- allowSequencePick) :
                  // réutilise exactement toggleActivite/pickValue avec
                  // activite===notion, l'encodage "nom nu" déjà géré pour les
                  // groupes à 1 seul item (cf. pickValue ligne ~1284) -- aucune
                  // nouvelle fonction ni changement backend nécessaire.
                  const isMultiItem = grp.items.length > 1;
                  const sequencePicked = picked.some(
                    (p) => p.sa === expandedSA && p.notion === grp.label && p.viaSequence
                  );
                  const hasIndividualPick = picked.some(
                    (p) => p.sa === expandedSA && p.notion === grp.label && !p.viaSequence
                  );
                  const canToggleSequence = allowSequencePick && isMultiItem;
                  return (
                    <div key={grp.label} className="esp-sa-group">
                      {canToggleSequence ? (
                        <button
                          type="button"
                          className={cn("esp-sequence-toggle", sequencePicked && "is-on")}
                          disabled={!sequencePicked && (hasIndividualPick || picked.length >= MAX_NOTIONS)}
                          onClick={() => toggleActivite(pseudoLabel, expandedSA, grp.label, grp.label, true)}
                          title={sequencePicked
                            ? "Toute la séquence est sélectionnée pour un problème — cliquer pour la désélectionner"
                            : hasIndividualPick
                            ? "Décochez d'abord l'activité déjà cochée dans cette séquence pour pouvoir la sélectionner entière"
                            : "Sélectionner toute la séquence pour un problème (au lieu d'une activité précise)"}
                        >
                          {sequencePicked ? <Check aria-hidden="true" /> : <Layers aria-hidden="true" />}
                          {grp.label}{sequencePicked ? " · séquence entière sélectionnée" : " · sélectionner toute la séquence"}
                        </button>
                      ) : (
                        <span>{grp.label}</span>
                      )}
                      {grp.items.map((item) => {
                        // `!p.viaSequence` est ce qui distingue ce pick "cet
                        // item précis" du pick "séquence entière" même quand
                        // un item porte EXACTEMENT le même nom que sa notion
                        // (ex. groupe "Division dans ℕ" contenant lui-même
                        // l'item "Division dans ℕ" + "Produit de facteurs
                        // premiers") -- sans ce champ, les deux picks étaient
                        // indiscernables (notion===activite dans les deux
                        // cas) : cocher cette seule Activité affichait à tort
                        // "séquence entière sélectionnée" et verrouillait les
                        // autres Activités du groupe (bug signalé par
                        // l'utilisateur, 2026-10-31).
                        const on = picked.some(
                          (p) => p.sa === expandedSA && p.notion === grp.label && p.activite === item && !p.viaSequence
                        );
                        const lockedBySequence = isMultiItem && sequencePicked;
                        return (
                          <label key={item} className={on ? "is-on" : ""}>
                            <input
                              type="checkbox"
                              checked={on}
                              disabled={lockedBySequence || (!on && picked.length >= MAX_NOTIONS)}
                              onChange={() => toggleActivite(pseudoLabel, expandedSA, grp.label, item)}
                            />
                            {item}
                          </label>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>)}
        {picked.length > 0 && (
          <p className={cn("esp-sa-count", picked.length >= MAX_NOTIONS && "is-ok")}>
            {picked.length}/{MAX_NOTIONS} activité{picked.length > 1 ? "s" : ""} sélectionnée{picked.length > 1 ? "s" : ""}
          </p>
        )}
        {renderResolutionQuestionnaire(pseudoLabel, picked)}
      </>
    );
  }


  async function handleSubmit(chosenEngine: "titan1" | "titan2") {
    if (!mode || !subject) return;
    // Les exercices ne sont jamais facturés : aucun contrôle de quota, pour
    // aucune matière, quand mode === "exercice".
    if (!isAdmin && !is_unlimited && mode !== "exercice") {
      if (exams_remaining <= 0) {
        openPaywall("exam");
        return;
      }
      if (subject === "PCT" && pct_exams_remaining <= 0) {
        openPaywall("pct");
        return;
      }
    }

    const isCollege = COLLEGE.has(classe);
    // Chaque partie : les notions "primaires" des 3 picks (une par sous-tâche)
    // d'abord, puis les notions "secondaires" des combinaisons ensuite (cf.
    // picksToNotions) — jamais l'inverse, pour ne pas casser l'assignation
    // par position des sous-tâches côté génération.
    // PCT UNIQUEMENT : réordonne d'abord les picks (couple + isolée, cf.
    // orderedPicksForResolution) avant de les convertir en chaînes -- cet
    // ordre encode la répartition Mobilisation/Résolution côté backend.
    const notionsByPart: Record<string, string[]> = parts
      ? Object.fromEntries(parts.map((p) => [
          p.label,
          picksToNotions(orderedPicksForResolution(selectedPicksByPart[p.label] || [], resolutionPairChoice[p.label]), subject),
        ]))
      : {};
    const flatTopics = parts
      ? parts.flatMap((p) => notionsByPart[p.label] || [])
      : usesPoolDetail
      ? picksToNotions(orderedPicksForResolution(selectedPicksByPart["__pool__"] || [], resolutionPairChoice["__pool__"]), subject)
      : selectedNotions;
    const examData = mode === "exercice"
      ? {
          title: `${exerciceTypeLabel} de ${subject} - ${classe}`,
          subject,
          level: classe,
          // flatTopics = selectedNotions pour tout sujet sans `parts` (donc
          // inchangé pour PCT en mode Exercice, cf. usesPoolDetail) ; pour
          // Mathématiques et SVT, `parts` reste actif en mode Exercice comme
          // en Épreuve -> reprend les activités cochées dans le picker.
          topics: flatTopics,
          mode: "exercice" as const,
          exercice_type: exerciceType ?? "application",
          num_questions: isCollege ? 8 : 10,
          difficulty: "mixed",
          question_type: "mixed",
          engine: "standard",
          titan: chosenEngine,
          is_public: false,
          figure_requise: showFigureOption && figureRequise,
        }
      : {
          title: `Épreuve de ${subject} - ${classe}`,
          subject,
          level: classe,
          duration_minutes: duration,
          topics: flatTopics,
          ...(parts ? { topics_by_part: notionsByPart } : {}),
          ...(subject === "SVT" && (classe === "6e" || classe === "5e")
            ? { partie1_choice: partie1Choice ?? "partie1_association" }
            : {}),
          mode: "epreuve" as const,
          num_questions: isCollege ? 8 : 10,
          difficulty: "mixed",
          question_type: "mixed",
          engine: "standard",
          titan: chosenEngine,
          is_public: false,
          // Uniquement pertinent si une notion de géométrie est sélectionnée —
          // cf. hasGeometryNotion (la case n'est même pas affichée sinon).
          figure_requise: showFigureOption && figureRequise,
        };

    setPhase("streaming");
    setStepTexts({});
    setCompletedSteps([]);
    setActiveSteps(new Set());

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

    try {
      const resp = await fetch(`${apiUrl}/exams/stream`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken() || "",
        },
        body: JSON.stringify(examData),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 402) {
          setPhase("form");
          openPaywall(err?.detail?.code === "PCT_QUOTA_EXCEEDED" ? "pct" : "exam");
          return;
        }
        if (resp.status === 403 && isCsrfInvalidDetail(err?.detail)) {
          await redirectToLoginAfterCsrfFailure();
          return;
        }
        throw new Error(err?.detail || `Erreur ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedDone = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (event.type === "step_start") {
            const s = event.step as string;
            setActiveSteps((prev) => new Set(prev).add(s));
          } else if (event.type === "step_done") {
            const s = event.step as string;
            setStepTexts((prev) => ({ ...prev, [s]: event.text as string }));
            // Une étape régénérée (réparation de figure) renvoie un 2e step_done :
            // ne la compter qu'une fois (sinon "7/6 étapes").
            setCompletedSteps((prev) => (prev.includes(s) ? prev : [...prev, s]));
            setActiveSteps((prev) => {
              const next = new Set(prev);
              next.delete(s);
              return next;
            });
            if (previewRef.current) {
              previewRef.current.scrollTop = previewRef.current.scrollHeight;
            }
          } else if (event.type === "done") {
            receivedDone = true;
            setExamId(event.exam_id as string);
            setPhase("done");
            // Demande explicite utilisateur (UX) : passer directement sur la
            // page de l'épreuve (téléchargements PDF/Word, zoom...) plutôt
            // que d'obliger un clic sur "Voir l'épreuve" une fois la
            // génération terminée.
            router.push(`/dashboard/exams/${event.exam_id as string}`);
          } else if (event.type === "error") {
            throw new Error(event.message as string);
          }
        }
      }

      // La connexion s'est fermée sans recevoir l'événement "done"
      if (!receivedDone) {
        throw new Error("La connexion a été interrompue. Le serveur a peut-être redémarré, réessayez.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setErrorMsg(msg);
      setPhase("error");
      toast.error("Erreur lors de la génération");
    }
  }

  function handleRestart() {
    setPhase("form");
    setStepTexts({});
    setCompletedSteps([]);
    setActiveSteps(new Set());
    setExamId(null);
    setErrorMsg("");
  }

  // Forme des étapes propre à la matière choisie — pool unique (maths/SVT)
  // ou une étape par sous-tâche de chaque partie (PCT).
  // 4e/3e PCT (scission asymétrique) : nombre de notions choisies PAR
  // PARTIE, pour que la barre de progression affiche la bonne forme
  // (mobilisation + 1 ou 2 situations-problèmes, cf. stepsAndLabelsFor).
  const partsNotionCountsForProgress = (subject === "PCT" && PCT_4E3E_CLASSES.has(classe) && parts)
    ? parts.map((p) => (selectedPicksByPart[p.label] || []).length)
    : null;
  const { steps: STEPS, labels: STEP_LABELS } = useMemo(
    () => stepsAndLabelsFor(
      subject || "Mathématiques", classe, mode || "epreuve", flatSelectedNotions.length,
      partie1Choice, partsNotionCountsForProgress
    ),
    [subject, classe, mode, flatSelectedNotions.length, partie1Choice, partsNotionCountsForProgress]
  );

  // Texte affiché toujours dans l'ordre canonique des étapes (Contexte, Tâche,
  // Problème I/II/III ou Physique/Chimie), même si les étapes se terminent
  // dans le désordre du fait de leur génération en parallèle.
  const streamText = STEPS.filter((s) => stepTexts[s]).map((s) => stepTexts[s]).join("\n\n");

  // Seules les étapes AFFICHÉES comptent (les contexte/tâche propres à chaque
  // partie PCT ne sont pas des pastilles) -- sinon "10/8 étapes", 125 %.
  const doneCount = completedSteps.filter((s) => STEPS.includes(s)).length;
  const activeCount = Array.from(activeSteps).filter((s) => STEPS.includes(s)).length;
  const progress = phase === "done" ? 100
    : doneCount === 0 && activeCount === 0 ? 0
    : Math.min(99, Math.round(((doneCount + activeCount * 0.5) / STEPS.length) * 100));

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (phase === "streaming" || phase === "done" || phase === "error") {
    const kind = mode === "exercice" ? exerciceTypeLabel : "Épreuve";
    return (
      <div className="esp-page">
        <PageHead eyebrow={`${kind} · ${subject} · Classe ${classe}`}
          title={phase === "done" ? "Génération terminée" : phase === "error" ? "Génération interrompue" : "Génération en cours"}
          subtitle={phase === "streaming" ? "L’épreuve s’écrit sous vos yeux, formules et figures comprises." : undefined}
          actions={phase !== "streaming" ? (
            <span className="esp-row-actions">
              {phase === "done" && examId && (
                <Button variant="framed" onClick={() => router.push(`/dashboard/exams/${examId}`)}><Eye /> Voir l’épreuve</Button>
              )}
              <Button variant="framed" onClick={handleRestart}><RotateCcw /> Nouvelle génération</Button>
            </span>
          ) : undefined} />

        <div className="esp-progress">
          <div className="esp-progress-top">
            <span>{phase === "done" ? "Génération terminée, téléchargez le PDF ou le Word" : phase === "error" ? "Erreur"
              : doneCount >= STEPS.length ? "Finalisation (figures, contextes et tâches), encore quelques minutes…"
              : `Génération en cours, veuillez patienter… ${progress} %`}</span>
            <span>{doneCount}/{STEPS.length} étapes</span>
          </div>
          <div className="esp-progress-track"><span style={{ width: `${progress}%` }} /></div>
          <div className="esp-progress-steps">
            {STEPS.map((step) => {
              const done = completedSteps.includes(step);
              const active = activeSteps.has(step);
              return <span key={step} className={done ? "is-done" : active ? "is-active" : ""}>{done ? <Check /> : <i />}{STEP_LABELS[step]}</span>;
            })}
          </div>
        </div>

        {phase === "error" && (
          <div className="esp-error" role="alert">
            <strong>Erreur lors de la génération.</strong> {errorMsg}{" "}
            <button type="button" className="esp-inline-link" onClick={handleRestart}>Réessayer</button>
          </div>
        )}

        {phase !== "error" && (
          <ZoomableDocument>
            <div className="esp-sheet" ref={previewRef} aria-live="polite">
              <div className="esp-sheet-head"><span>Mathiis · {kind}</span><span>Classe {classe}</span></div>
              <h2>{subject}</h2>
              <p className="esp-sheet-meta">Classe : {classe}{mode === "epreuve" ? ` · Durée : ${formatDuree(duration)}` : ""}</p>
              <div className="esp-sheet-body">
                {streamText
                  ? <ExamMarkdown text={streamText} streaming={phase === "streaming"} />
                  : <div className="esp-sheet-blank">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ width: `${90 - (i % 3) * 18}%` }} />)}<p>L’épreuve s’affiche ici…</p></div>}
                {phase === "streaming" && <span className="esp-caret" aria-hidden="true" />}
              </div>
            </div>
          </ZoomableDocument>
        )}
      </div>
    );
  }

  // Checks the picks against the programme rules, then asks which engine to use.
  function validateAndChooseEngine() {
    if (parts && subject === "PCT" && mode === "epreuve" && PCT_4E3E_CLASSES.has(classe)) {
      // 4e/3e PCT (document officiel IGPM) : Chimie toujours exactement 1
      // activité (imposé) ; Physique 1 ou 2.
      for (const p of parts) {
        const n = (selectedPicksByPart[p.label] || []).length;
        if (p.label === "Chimie") {
          if (n !== 1) {
            toast.error(`Sélectionne exactement 1 activité pour la partie ${p.label}`);
            return;
          }
        } else if (n < 1 || n > 2) {
          toast.error(`Sélectionne 1 ou 2 activités pour la partie ${p.label}`);
          return;
        }
      }
    } else if (parts) {
      // Mode Exercice : toujours 1 ou 2 activités, quelle que soit la matière --
      // jamais la règle épreuve de MIN_NOTIONS_BY_SUBJECT (ex. SVT 2-ou-3).
      // PCT 2nde/1ère/Tle (demande explicite utilisateur) : 2 OU 3 activités
      // par partie (au lieu d'exactement 3) -- Mobilisation porte alors sur
      // toutes, Résolution se répartit par séquence côté generator.py.
      const isPctSecondCycle = subject === "PCT" && PCT_SECOND_CYCLE_CLASSES.has(classe);
      const minForSubject = mode === "exercice"
        ? 1
        : isPctSecondCycle
        ? 2
        : subject ? (MIN_NOTIONS_BY_SUBJECT[subject] ?? MAX_NOTIONS) : MAX_NOTIONS;
      const missing = parts.filter((p) => {
        const n = (selectedPicksByPart[p.label] || []).length;
        return n < minForSubject || n > MAX_NOTIONS;
      });
      if (missing.length > 0) {
        const countTxt = minForSubject === MAX_NOTIONS
          ? `exactement ${MAX_NOTIONS} activités`
          : `entre ${minForSubject} et ${MAX_NOTIONS} activités`;
        toast.error(`Sélectionne ${countTxt} (dans les SA de ton choix) pour la partie ${missing[0].label}`);
        return;
      }
    } else if (usesPoolDetail) {
      const nPool = (selectedPicksByPart["__pool__"] || []).length;
      if (mode === "exercice") {
        if (nPool < 1 || nPool > 2) {
          toast.error("Sélectionne 1 ou 2 activités (dans les SA de ton choix) pour générer un exercice");
          return;
        }
      } else if (subject === "PCT" && (classe === "6e" || classe === "5e")) {
        // 6e/5e PCT (demande explicite utilisateur) : 2 ou 3
        // activités (au lieu d'exactement 3).
        if (nPool < 2 || nPool > MAX_NOTIONS) {
          toast.error(`Sélectionne 2 ou ${MAX_NOTIONS} activités (dans les SA de ton choix) avant de générer l'épreuve`);
          return;
        }
      } else if (nPool !== MAX_NOTIONS) {
        toast.error(`Sélectionne exactement ${MAX_NOTIONS} activités (dans les SA de ton choix) avant de générer l'épreuve`);
        return;
      }
    } else if (mode === "exercice") {
      if (selectedNotions.length < 1 || selectedNotions.length > 2) {
        toast.error("Sélectionne 1 ou 2 notions pour générer un exercice");
        return;
      }
    } else if (selectedNotions.length !== MAX_NOTIONS) {
      toast.error(`Sélectionne exactement ${MAX_NOTIONS} notions au programme avant de générer l'épreuve`);
      return;
    }
    setShowEngineModal(true);
  }

  const ready = !!mode && !!subject && (mode !== "exercice" || !!exerciceType);

  return (
    <div className="esp-page">
      <PageHead eyebrow="Nouvelle épreuve" title="Générer une épreuve" subtitle="Configurez les paramètres : la génération s’affiche en direct." />
      <div className="esp-gen is-form">
        <form className="esp-panel esp-gen-form" onSubmit={(e) => { e.preventDefault(); validateAndChooseEngine(); }}>
          <fieldset><legend><span>1</span>Type de génération</legend>
            <div className="esp-choice-row three">
              <Choice selected={mode === "epreuve"} onClick={() => handleModeChange("epreuve")}><span><strong>Épreuve complète</strong><small>3 problèmes + contexte / tâche</small></span></Choice>
              <Choice selected={mode === "exercice" && exerciceType === "application"} onClick={() => handleTypeChoice("application")}><span><strong>Exercice d&apos;application</strong><small>S&apos;entraîner sur la notion</small></span></Choice>
              <Choice selected={mode === "exercice" && exerciceType === "interrogation"} onClick={() => handleTypeChoice("interrogation")}><span><strong>Interrogation écrite</strong><small>Évaluation type questionnaire</small></span></Choice>
            </div>
          </fieldset>

          <fieldset><legend><span>2</span>Matière</legend>
            <div className="esp-choice-row three">
              {SUBJECTS.map(({ key, desc }) => (
                <Choice key={key} className="tall" selected={subject === key} onClick={() => handleSubjectChange(key)}>
                  <span><i className="esp-symbol" aria-hidden="true">{SUBJECT_SYMBOLS[key]}</i><strong>{key}</strong><small>{desc}</small></span>
                </Choice>
              ))}
            </div>
          </fieldset>

          {!ready ? (
            <p className="esp-hint">Choisissez le type de génération et la matière pour continuer.</p>
          ) : (<>
            <fieldset><legend><span>3</span>Classe</legend>
              <div className="esp-select">
                <select id="gen-classe" value={classe} onChange={(e) => handleClasseChange(e.target.value)} aria-label="Classe">
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown aria-hidden="true" />
              </div>
              {/* Durée fixée par classe (grille officielle), non modifiable ; pas de durée pour un exercice isolé. */}
              {mode === "epreuve" && (
                <div className="esp-duree"><Clock aria-hidden="true" /><strong>{formatDuree(duration)}</strong><span>Durée officielle fixée pour la classe {classe}{subject === "SVT" ? " en SVT" : ""}</span></div>
              )}
            </fieldset>

            <fieldset><legend><span>4</span>Notions <em>{mode === "exercice" ? "1 ou 2 activités" : subject === "SVT" ? "2 ou 3 activités" : `${MAX_NOTIONS} activités obligatoires`}</em></legend>
              {parts ? (
                <div className="esp-gen-parts">
                  {parts.map((part) => (
                    <div key={part.label} className="esp-gen-part">
                      {part.label !== "Notions" && <p className="esp-gen-part-title">{part.label}</p>}
                      {renderDetailPicker(part.label, part.notions[classe] || [], part.details ?? {}, subject === "Mathématiques")}
                    </div>
                  ))}
                  {subject === "SVT" && <p className="esp-hint">La 1ʳᵉ activité cochée alimente la Restitution (Partie I), les suivantes le Problème (Partie II).</p>}
                  {subject === "SVT" && (classe === "6e" || classe === "5e") && (() => {
                    // SVT 6e/5e uniquement : type de Partie I choisi par l'enseignant. « Paragraphe » désactivé
                    // si la 1ère activité cochée (convention : notions[0] -> Partie I) a une SA < 2.
                    const firstPick = (selectedPicksByPart["Notions"] || [])[0];
                    const sa1 = firstPick ? PCT_SA_NUMBER[classe]?.[firstPick.sa] ?? SVT_SA_NUMBER[classe]?.[firstPick.sa] : undefined;
                    const paragrapheOk = sa1 !== undefined && sa1 >= 2;
                    const options = [
                      { id: "partie1_association", label: "Association" },
                      { id: "partie1_lacunaire", label: "Test lacunaire" },
                      { id: "partie1_paragraphe", label: "Paragraphe" },
                    ];
                    return (
                      <div className="esp-gen-part">
                        <p className="esp-gen-part-title">Type de Partie I</p>
                        <div className="esp-seg" role="radiogroup" aria-label="Type de Partie I">
                          {options.map((opt) => {
                            const disabled = opt.id === "partie1_paragraphe" && !paragrapheOk;
                            const on = (partie1Choice ?? "partie1_association") === opt.id;
                            return <button key={opt.id} type="button" role="radio" aria-checked={on} disabled={disabled} className={on ? "is-on" : ""} onClick={() => setPartie1Choice(opt.id)}
                              title={disabled ? "Disponible à partir de la SA2 de la 1ère activité choisie" : undefined}>{opt.label}</button>;
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : usesPoolDetail ? (
                notions.length === 0
                  ? <p className="esp-hint">Le programme officiel {subject} n’est pas encore intégré pour cette classe.</p>
                  : renderDetailPicker("__pool__", notions, PCT_SA_DETAILS)
              ) : (<>
                {notions.length === 0 && <p className="esp-hint">Le programme officiel {subject} n’est pas encore intégré pour cette classe.</p>}
                <div className="esp-sa-chips">
                  {notions.map((n) => {
                    const on = selectedNotions.includes(n);
                    return <button key={n} type="button" className={cn("esp-sa", on && "has-picks is-open")} aria-pressed={on} disabled={!on && selectedNotions.length >= MAX_NOTIONS} onClick={() => toggleNotion(n)}>{n}</button>;
                  })}
                </div>
                {selectedNotions.length > 0 && <p className={cn("esp-sa-count", selectedNotions.length >= MAX_NOTIONS && "is-ok")}>{selectedNotions.length}/{MAX_NOTIONS} notion{selectedNotions.length > 1 ? "s" : ""} sélectionnée{selectedNotions.length > 1 ? "s" : ""}</p>}
              </>)}

              {/* Figure — proposée uniquement pour une notion de géométrie (ou un schéma en SVT) */}
              {showFigureOption && (
                <label className="esp-toggle">
                  <input type="checkbox" checked={figureRequise} onChange={(e) => setFigureRequise(e.target.checked)} /><span aria-hidden="true" />
                  {isSvt ? "Ajouter un schéma ou un graphique à analyser" : isPct ? "Ajouter un schéma ou un circuit à l’énoncé" : "Ajouter une figure géométrique à l’énoncé"}
                </label>
              )}

            </fieldset>
          </>)}

          <div className="esp-gen-submit">
            <p className="esp-hint">{!mode ? "Choisissez le type de génération." : !subject ? "Choisissez la matière." : mode === "exercice" && !exerciceType ? "Précisez la nature de l'exercice." : `${mode === "epreuve" ? "Épreuve complète" : exerciceTypeLabel} de ${subject}, classe de ${classe}${mode === "epreuve" ? `, ${formatDuree(duration)}` : ""}.`}</p>
            <Button type="submit" className="esp-primary" disabled={!ready}><Sparkles /> {mode === "exercice" ? "Générer l’exercice" : "Générer l’épreuve"}</Button>
          </div>
        </form>

      </div>

      {/* Choix du moteur (Titan 1 / Titan 2) — s'ouvre au clic sur Générer */}
      <Dialog open={showEngineModal} onOpenChange={setShowEngineModal}>
        <DialogContent className="esp-dialog esp-dialog-wide">
          <DialogHeader>
            <DialogTitle>Choisissez votre moteur de génération</DialogTitle>
            <DialogDescription>Deux moteurs, deux compromis entre vitesse et qualité.</DialogDescription>
          </DialogHeader>
          <div className={cn("esp-choice-row", availableMoteurs.length > 1 ? "two" : "one")}>
            {availableMoteurs.map((m) => (
              <Choice key={m.id} selected={engine === m.id} disabled={!m.disponible} onClick={() => m.disponible && setEngine(m.id)}>
                <span>
                  <strong>{m.nom} <em className="esp-engine-time">{m.duree}</em></strong>
                  {m.disponible ? (
                    <>
                      <small>{m.desc}</small>
                      {m.detail && <small>{m.detail}</small>}
                      {m.avert && <small className="esp-engine-warn">Génération plus lente, patientez jusqu’à la fin.</small>}
                    </>
                  ) : (
                    <small className="esp-engine-warn">Non disponible pour le moment</small>
                  )}
                </span>
              </Choice>
            ))}
          </div>
          <div className="esp-dialog-actions">
            <Button variant="framed" onClick={() => setShowEngineModal(false)}>Annuler</Button>
            <Button className="esp-primary" disabled={!engine} onClick={() => { if (!engine) return; setShowEngineModal(false); handleSubmit(engine); }}>
              <Sparkles /> Lancer la génération
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mode itératif — administrateurs seulement */}
      {isAdmin && (
        <section className="esp-panel esp-admin">
          <div><span className="esp-eyebrow">Administrateur</span><h2>Mode itératif</h2><p>Interface étape par étape avec validation manuelle de chaque exercice.</p></div>
          <Button variant="framed" asChild><a href={`/dashboard/generate/interactive${classe ? `?classe=${encodeURIComponent(classe)}` : ""}`}><ExternalLink /> Ouvrir l’atelier interactif</a></Button>
        </section>
      )}
    </div>
  );
}
