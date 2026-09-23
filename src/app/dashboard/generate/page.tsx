"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useQuotaStore } from "@/store/quota";
import { useExamStore } from "@/store/exams";
import {
  Sparkles, Zap, Layers, Clock, BookOpen, ChevronDown,
  ArrowRight, CheckCircle2, Download, Eye, AlertCircle, ExternalLink,
  Calculator, FlaskConical, Leaf, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/api";
import toast from "react-hot-toast";

// ── Données ────────────────────────────────────────────────────────────────────

// Chaque matière a son propre programme (notions par classe). Vide = le
// programme officiel n'est pas encore intégré pour cette matière/classe : le
// formulaire bascule alors automatiquement sur une saisie libre des notions
// (voir plus bas) — dès que la liste est renseignée ici, les chips reviennent
// sans aucun autre changement de code.
const MATHEMATIQUES_NOTIONS: Record<string, string[]> = {
  "6e": ["Cube et pavé droit", "Cône de révolution", "Sphère", "Droites du plan",
    "Cercles", "Angles", "Triangles", "Parallélogramme", "Entiers naturels",
    "Nombres décimaux", "Fractions", "Calcul littéral", "Symétrie axiale",
    "Symétrie centrale", "Proportionnalité", "Statistique"],
  "5e": ["Prisme droit", "Division dans ℕ", "Nombres premiers", "Puissances",
    "PPCM", "PGCD", "Distance", "Angles", "Triangles", "Cercle",
    "Parallélogramme", "Nombres décimaux relatifs", "Fractions",
    "Symétrie axiale", "Symétrie centrale", "Équations", "Proportionnalité"],
  "4e": ["Angles au centre d'un cercle", "Distance", "Triangles", "Polygones réguliers",
    "Nombres rationnels", "Puissances", "Expressions algébriques", "Pyramide",
    "Cône de révolution", "Sphère et boule", "PPCM et PGCD", "Symétrie centrale",
    "Translation", "Projection", "Équations et inéquations", "Proportionnalité", "Statistique"],
  "3e": ["Nombres réels", "Valeur absolue", "Trigonométrie", "Théorème de Thalès",
    "Triangles semblables", "Triangle rectangle", "Angles et cercles",
    "Cône de révolution", "Polynômes", "Équations de droite",
    "Équations et inéquations", "Vecteurs", "Coordonnées de vecteurs",
    "Applications affines", "Applications linéaires", "Statistiques"],
  "2nde AB": ["Proportionnalité", "Fonctions numériques", "Suites numériques",
    "Dénombrement", "Nombres réels", "Calculs dans ℝ",
    "Équations du premier degré dans ℝ", "Inéquations du premier degré dans ℝ",
    "Systèmes d'équations linéaires", "Représentation graphique de fonctions"],
  "2nde C": ["Droites et plans de l'espace", "Parallélisme", "La sphère", "Calculs dans ℝ",
    "Généralités sur les fonctions", "Étude de fonctions",
    "Équations et inéquations dans ℝ", "Statistique", "Polynômes",
    "Vecteurs du plan", "Droites dans le plan", "Homothétie",
    "Angles inscrits", "Trigonométrie", "Produit scalaire", "Rotation", "Cercles dans le plan"],
  "2nde D": ["Droites et plans de l'espace", "Parallélisme", "Calculs dans ℝ",
    "Généralités sur les fonctions", "Étude de fonctions",
    "Équations et inéquations dans ℝ", "Statistique", "Polynômes",
    "Vecteurs du plan", "Droites dans le plan", "Homothétie",
    "Relations métriques dans un triangle", "Trigonométrie",
    "Produit scalaire", "Rotation", "Équation cartésienne d'un cercle"],
  "1ère AB": ["Équations du second degré", "Somme et produit des racines",
    "Équations bicarrées", "Inéquations du second degré",
    "Systèmes linéaires dans ℝ²", "Suites arithmétiques", "Suites géométriques",
    "Statistique", "Dénombrement", "Fonctions numériques",
    "Limite et continuité", "Dérivation", "Fonctions polynômes", "Fonctions homographiques"],
  "1ère C": ["Orthogonalité dans l'espace", "Projection orthogonale",
    "Vecteurs de l'espace", "Produit scalaire", "Géométrie analytique",
    "Équations et inéquations dans ℝ", "Statistique", "Dénombrement",
    "Limite et continuité", "Dérivation", "Primitives", "Suites numériques",
    "Angles orientés", "Fonctions circulaires", "Trigonométrie",
    "Barycentre", "Isométries du plan", "Similitudes"],
  "1ère D": ["Orthogonalité dans l'espace", "Vecteurs de l'espace",
    "Équations et inéquations dans ℝ", "Systèmes linéaires", "Statistique",
    "Dénombrement", "Fonctions numériques", "Limites et continuité",
    "Dérivation", "Primitives", "Suites numériques", "Angles orientés",
    "Trigonométrie", "Barycentre", "Transformations du plan"],
  "Tle AB": ["Généralités sur les fonctions", "Limite et continuité", "Dérivation",
    "Fonctions polynômes", "Fonctions rationnelles", "Logarithme népérien",
    "Exponentielle népérienne", "Équations — Inéquations — Systèmes",
    "Suites numériques", "Statistique", "Probabilité"],
  "Tle C": ["Calcul vectoriel dans l'espace", "Systèmes linéaires", "Arithmétique",
    "Nombres complexes", "Limites et continuité", "Étude de fonctions",
    "Primitives", "Logarithme népérien", "Exponentielle népérienne",
    "Calcul intégral", "Équations différentielles", "Probabilité",
    "Suites numériques", "Isométries du plan", "Similitudes", "Coniques"],
  "Tle D": ["Vecteurs de l'espace", "Barycentre", "Droites et plans de l'espace",
    "Systèmes linéaires", "Produit scalaire", "Produit vectoriel",
    "Nombres complexes", "Limites et continuité", "Étude de fonctions",
    "Primitives", "Logarithme népérien", "Exponentielle népérienne",
    "Calcul intégral", "Équations différentielles", "Probabilité",
    "Suites numériques", "Statistique"],
};

// PCT n'est pas enseigné en série littéraire (AB) au Bénin. Programme
// officiel INIFRCF & DIPIQ — même source que New_model/backend/subjects/pct.py.
// Une épreuve de PCT est composée de DEUX PARTIES INDÉPENDANTES (Physique et
// Chimie), chacune avec ses 3 sous-tâches et ses propres notions — voir
// SUBJECT_PARTS plus bas, plutôt qu'un pool unique de 3 comme les maths/SVT.
const PCT_NOTIONS_PHYSIQUE: Record<string, string[]> = {
  "6e": ["Circuit électrique simple", "Association de piles", "Association de lampes", "Lampe de poche", "Circuit d'un vélo", "États de l'eau", "Changements d'état", "Distillateur", "Dispositif à glace", "Instruments de musique"],
  "5e": ["Courant alternatif", "Production du courant", "Tournevis testeur", "Dangers du courant", "Anomalies d'un circuit", "Dispositifs de protection", "Urgences électriques", "Sources de lumière", "Propagation rectiligne", "Réflexion de la lumière", "Périscope et kaléidoscope", "Propriétés des gaz", "Pression des gaz", "Chaleur et température", "Dilatation des liquides", "Thermomètre à alcool"],
  "4e": ["Appareils de mesure", "Lois des circuits", "Loi d'Ohm", "Résistance équivalente", "Forces et interactions", "Dynamomètre", "Poids et poussée d'Archimède", "Résultante de forces", "Poulies et palans", "Ombre et pénombre", "Éclipses et phases lunaires", "Réfraction", "Fabrication d'un dynamomètre", "Chambre noire"],
  "3e": ["Équilibre d'un solide", "Leviers et treuil", "Travail et puissance", "Formes d'énergie", "Énergie thermique", "Puissance électrique", "Loi de Joule", "Production de l'électricité", "Transformateurs", "DEL et transistor", "Électrolyseur", "Lentilles convergentes", "Défauts de l'œil", "Lumière blanche"],
  "2nde C": ["Courant continu et alternatif", "Tension électrique", "Oscilloscope", "Dipôles passifs", "Conducteur ohmique", "Associations de résistors", "Générateur et fem", "Point de fonctionnement", "Diode et diode Zener", "Transistor", "Amplificateur opérationnel", "Montage électronique (projet)", "Relativité du mouvement", "Mouvement rectiligne uniforme", "Mouvement circulaire uniforme", "Vecteur vitesse", "Centre d'inertie", "Principe d'inertie", "Quantité de mouvement", "Chocs et collisions"],
  "2nde D": ["Courant continu et alternatif", "Tension électrique", "Oscilloscope", "Dipôles passifs", "Conducteur ohmique", "Associations de résistors", "Générateur et fem", "Point de fonctionnement", "Diode et diode Zener", "Transistor", "Amplificateur opérationnel", "Montage électronique (projet)", "Relativité du mouvement", "Mouvement rectiligne uniforme", "Mouvement circulaire uniforme", "Vecteur vitesse", "Centre d'inertie", "Principe d'inertie", "Quantité de mouvement", "Chocs et collisions"],
  "1ère C": ["Cinématique", "Translation et rotation", "Moment d'une force", "Travail et puissance", "Énergie cinétique", "Énergie potentielle", "Énergie mécanique", "Champ électrostatique", "Énergie potentielle électrique", "Effet Joule", "Loi d'Ohm généralisée", "Bilan énergétique", "Diodes et semi-conducteurs", "Redressement et filtrage", "Source stabilisée (projet)", "Température et chaleur", "Calorimétrie", "Lois des gaz", "Conservation de l'énergie", "Types d'ondes", "Onde progressive périodique", "Diffraction et dispersion", "Interférences"],
  "1ère D": ["Cinématique", "Translation et rotation", "Moment d'une force", "Travail et puissance", "Énergie cinétique", "Énergie potentielle", "Énergie mécanique", "Champ électrostatique", "Énergie potentielle électrique", "Effet Joule", "Loi d'Ohm généralisée", "Bilan énergétique", "Diodes et semi-conducteurs", "Redressement et filtrage", "Source stabilisée (projet)", "Température et chaleur", "Calorimétrie", "Lois des gaz", "Conservation de l'énergie", "Types d'ondes", "Onde progressive périodique", "Diffraction et dispersion", "Interférences"],
  "Tle C": ["Cinématique du point", "Mouvements particuliers", "Interaction gravitationnelle", "Champ électrostatique", "Champ magnétique", "Lois de Newton", "Satellites et lois de Képler", "Chute dans le champ de pesanteur", "Particule en champ E", "Particule en champ B", "Loi de Laplace", "Induction et auto-induction", "Oscillations mécaniques", "Circuit LC", "Circuit RLC forcé", "Lentilles minces", "Instruments d'optique", "Prisme et réseau", "Particules de grande énergie", "Niveaux d'énergie", "Noyau et énergie de liaison", "Radioactivité", "Fission et fusion"],
  "Tle D": ["Cinématique du point", "Mouvements particuliers", "Champ électrostatique", "Champ magnétique", "Lois de Newton", "Chute dans le champ de pesanteur", "Particule en champ E", "Particule en champ B", "Induction et auto-induction", "Oscillations mécaniques", "Circuit LC", "Circuit RLC forcé", "Lentilles minces", "Instruments d'optique", "Prisme et réseau", "Niveaux d'énergie", "Noyau et énergie de liaison", "Radioactivité", "Fission et fusion", "Polarisation"],
};

const PCT_NOTIONS_CHIMIE: Record<string, string[]> = {
  "6e": ["Combustions vives", "Composition de l'air", "Triangle du feu", "Pollution de l'air"],
  "5e": ["Atomes et molécules", "La mole", "Mélanges et séparation", "Solutions"],
  "4e": ["Constitution de l'atome", "Structure électronique", "Ions et ionisation", "Métaux usuels", "Alliages", "Liaison covalente", "Hydrocarbures simples", "Combustions dans le dioxygène"],
  "3e": ["Solutions aqueuses", "Solutions ioniques", "Réactions acide-base", "Électrolyse", "Hydrocarbures", "Combustion des hydrocarbures", "Polymérisation"],
  "2nde C": ["Structure de l'atome", "Classification périodique", "Molécules et liaison covalente", "Quantités de matière", "Équation-bilan", "Corps ioniques", "Dissolution et concentration", "Électrolyse de NaCl", "Solutions acides et basiques", "Notion de pH", "Dosage acide-base", "Tests d'identification des ions", "Pollution des eaux"],
  "2nde D": ["Structure de l'atome", "Classification périodique", "Molécules et liaison covalente", "Quantités de matière", "Équation-bilan", "Corps ioniques", "Dissolution et concentration", "Électrolyse de NaCl", "Solutions acides et basiques", "Notion de pH", "Dosage acide-base", "Tests d'identification des ions", "Pollution des eaux"],
  "1ère C": ["Le carbone", "Les alcanes", "Combustion et halogénation", "Alcènes et alcynes", "Additions et polymérisation", "Oxydoréduction", "Couples oxydant/réducteur"],
  "1ère D": ["Le carbone", "Les alcanes", "Combustion et halogénation", "Alcènes et alcynes", "Additions et polymérisation", "Oxydoréduction", "Couples oxydant/réducteur"],
  "Tle C": ["pH et produit ionique", "Acides forts et bases fortes", "Couples acide/base et Ka", "Réactions acide-base", "Cinétique chimique", "Catalyse", "Stéréochimie", "Alcools", "Aldéhydes et cétones", "Amines", "Acides carboxyliques", "Esters et saponification", "Acides α-aminés"],
  "Tle D": ["pH et produit ionique", "Acides forts et bases fortes", "Couples acide/base et Ka", "Réactions acide-base", "Cinétique chimique", "Catalyse", "Stéréochimie", "Alcools", "Aldéhydes et cétones", "Amines", "Acides carboxyliques", "Esters et saponification", "Acides α-aminés"],
};

// Pool "à plat" = union des deux parties, utilisé uniquement pour dériver la
// liste des classes disponibles (NOTIONS_BY_SUBJECT ci-dessous) — le choix
// réel des notions PCT passe par SUBJECT_PARTS, pas par ce pool.
const PCT_NOTIONS: Record<string, string[]> = Object.fromEntries(
  Object.keys(PCT_NOTIONS_PHYSIQUE).map((c) => [c, [...PCT_NOTIONS_PHYSIQUE[c], ...PCT_NOTIONS_CHIMIE[c]]])
);

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
const SUBJECT_PARTS: Record<string, { label: string; slug: string; notions: Record<string, string[]> }[]> = {
  "PCT": [
    { label: "Physique", slug: "physique", notions: PCT_NOTIONS_PHYSIQUE },
    { label: "Chimie", slug: "chimie", notions: PCT_NOTIONS_CHIMIE },
  ],
};

// La structure à parties ne s'applique qu'à CERTAINES classes de la matière
// (PCT : 1ère/Tle seulement — 6e à 2nde gardent le pool unique de 3
// problèmes, comme les maths). Absente/non listée = s'applique à toutes les
// classes dès que SUBJECT_PARTS a une entrée pour la matière.
const PARTS_CLASSES: Record<string, Set<string>> = {
  "PCT": new Set(["1ère C", "1ère D", "Tle C", "Tle D"]),
};

function partsFor(subject: string, classe: string) {
  const def = SUBJECT_PARTS[subject];
  if (!def) return null;
  const restrict = PARTS_CLASSES[subject];
  if (restrict && !restrict.has(classe)) return null;
  return def;
}

// SVT est enseignée dans toutes les séries, comme les mathématiques.
// Programme officiel INIFRCF/DIP-SPPE — même source que
// New_model/backend/subjects/svt.py. "2nde" est un programme commun aux
// séries A/B/C/D dans la source officielle, répliqué ici sur les 3 clés.
const SVT_NOTIONS: Record<string, string[]> = {
  "6e": ["Les aliments", "Substances nutritives", "Alimentation équilibrée", "Digestion", "Absorption intestinale", "Régimes alimentaires", "Comportement alimentaire", "Adaptation structure-fonction", "Respiration des êtres vivants"],
  "5e": ["Nutrition minérale des plantes", "Photosynthèse", "Autotrophie et hétérotrophie", "Engrais et pesticides", "Relations intraspécifiques", "Relations interspécifiques", "Parasitisme et parasitoses", "Facteurs du milieu", "Chaînes et réseaux trophiques", "Reproduction chez les animaux", "Développement et métamorphose", "Reproduction chez les végétaux"],
  "4e": ["Composantes d'un paysage", "Roches et relief", "Formation du sol", "Érosion", "Homme et ressources géologiques", "Séismes", "Volcanisme", "Structure du globe", "Risques géologiques"],
  "3e": ["Digestion et absorption", "Respiration et échanges gazeux", "Circulation sanguine", "Excrétion", "Système nerveux", "Réflexes et comportements", "Appareils reproducteurs", "Cycle féminin et fécondation", "Défenses de l'organisme", "Vaccination et prévention"],
  "2nde AB": ["La cellule", "Membrane et échanges cellulaires", "Cellule sécrétrice", "Les tissus", "Organes et systèmes", "Peuplement et répartition", "Relations trophiques", "Productivité et photosynthèse", "Flux d'énergie", "Équilibre des écosystèmes"],
  "2nde C": ["La cellule", "Membrane et échanges cellulaires", "Cellule sécrétrice", "Les tissus", "Organes et systèmes", "Peuplement et répartition", "Relations trophiques", "Productivité et photosynthèse", "Flux d'énergie", "Équilibre des écosystèmes"],
  "2nde D": ["La cellule", "Membrane et échanges cellulaires", "Cellule sécrétrice", "Les tissus", "Organes et systèmes", "Peuplement et répartition", "Relations trophiques", "Productivité et photosynthèse", "Flux d'énergie", "Équilibre des écosystèmes"],
  "1ère AB": ["Dépenses énergétiques", "Oxydations respiratoires", "Micro-organismes", "Biotechnologies"],
  "1ère C": ["Organisation de la Terre", "Énergie interne du globe", "Dynamique des fonds océaniques", "Tectonique globale", "Chaînes de montagnes", "Magmatisme", "Cycle de la matière dans le globe", "Dépenses énergétiques", "Oxydations respiratoires", "Glycolyse et cycle de Krebs", "Fermentations", "Métabolisme énergétique humain", "Alimentation rationnelle", "Micro-organismes", "Biotechnologies"],
  "1ère D": ["Organisation de la Terre", "Énergie interne du globe", "Dynamique des fonds océaniques", "Tectonique globale", "Chaînes de montagnes", "Magmatisme", "Cycle de la matière dans le globe", "Mesure du temps géologique", "Dépenses énergétiques", "Oxydations respiratoires", "Glycolyse et cycle de Krebs", "Fermentations", "Métabolisme énergétique humain", "Alimentation rationnelle", "Micro-organismes", "Biotechnologies"],
  "Tle AB": ["Nature de l'information génétique", "Mitose et cycle cellulaire", "Méiose et gamétogenèse", "Hérédité monofactorielle", "Hérédité liée au sexe", "Génétique humaine", "Fonction reproductrice masculine", "Fonction reproductrice féminine", "Gamètes et fécondation", "Maîtrise de la procréation"],
  "Tle C": ["Nature de l'information génétique", "Expression des gènes", "Mitose et cycle cellulaire", "Méiose et gamétogenèse", "Brassage génétique", "Hérédité monofactorielle", "Hérédité liée au sexe", "Hérédité difactorielle", "Génétique humaine", "Fonction reproductrice masculine", "Fonction reproductrice féminine", "Gamètes et fécondation", "Maîtrise de la procréation"],
  "Tle D": ["Nature de l'information génétique", "Expression des gènes", "Mitose et cycle cellulaire", "Méiose et gamétogenèse", "Brassage génétique", "Hérédité monofactorielle", "Hérédité liée au sexe", "Hérédité difactorielle", "Génétique humaine", "Immunité naturelle et acquise", "Agents effecteurs de l'immunité", "Immunité humorale et cellulaire", "Dysfonctionnements immunitaires", "Aides biomédicales à l'immunité", "Réflexe myotatique", "Le message nerveux", "Synapse et traitement du message", "Substances et radiations", "Communication hormonale", "Corrélations neuro-hormonales", "Fonction reproductrice masculine", "Fonction reproductrice féminine", "Gamètes et fécondation", "Maîtrise de la procréation", "Génie génétique"],
};

const NOTIONS_BY_SUBJECT: Record<string, Record<string, string[]>> = {
  "Mathématiques": MATHEMATIQUES_NOTIONS,
  "PCT": PCT_NOTIONS,
  "SVT": SVT_NOTIONS,
};

const SUBJECTS = [
  {
    key: "Mathématiques",
    desc: "Algèbre, analyse, géométrie",
    Icon: Calculator,
    selected: "border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50",
    iconWrap: "bg-indigo-100 text-indigo-600",
  },
  {
    key: "PCT",
    desc: "Physique, Chimie, Technologie",
    Icon: FlaskConical,
    selected: "border-amber-600 ring-1 ring-amber-600 bg-amber-50",
    iconWrap: "bg-amber-100 text-amber-600",
  },
  {
    key: "SVT",
    desc: "Sciences de la Vie et de la Terre",
    Icon: Leaf,
    selected: "border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50",
    iconWrap: "bg-emerald-100 text-emerald-600",
  },
] as const;

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

// Formate une durée en minutes vers "1H30", "2H00"...
function formatDuree(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}H${m.toString().padStart(2, "0")}`;
}

// Deux moteurs de génération au choix (façon Titan 1 / Titan 2).
const MOTEURS = [
  {
    id: "titan1",
    nom: "Titan 1",
    desc: "Rapide, bonne qualité",
    detail: "Génération en ~2 minutes. Recommandé pour un usage courant.",
    duree: "~2 min",
    avert: false,
  },
  {
    id: "titan2",
    nom: "Titan 2",
    desc: "Qualité supérieure",
    detail: "Moteur plus puissant, contrôle mathématique plus poussé. La génération prend plus de temps (~5 min).",
    duree: "~5 min",
    avert: true,
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
function stepsAndLabelsFor(subject: string, classe: string): { steps: string[]; labels: Record<string, string> } {
  const parts = partsFor(subject, classe);
  const labels: Record<string, string> = { contexte: "Contexte", tache: "Tâche" };
  const steps = ["contexte", "tache"];
  if (parts) {
    for (const part of parts) {
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
  const { exams_remaining, is_unlimited, openPaywall } = useQuotaStore();
  const { downloadPdf } = useExamStore();
  const isAdmin = user?.is_admin || user?.is_superuser;

  const [subject, setSubject] = useState("Mathématiques");
  const [classe, setClasse] = useState("Tle D");
  const [selectedNotions, setSelectedNotions] = useState<string[]>([]);
  const [notionDraft, setNotionDraft] = useState("");
  // Pour une matière à parties (PCT) : 3 notions choisies indépendamment par
  // partie (ex. { Physique: [...3], Chimie: [...3] }), au lieu du pool
  // unique `selectedNotions` ci-dessus.
  const [selectedNotionsByPart, setSelectedNotionsByPart] = useState<Record<string, string[]>>({});
  const [duration, setDuration] = useState(DEFAULT_DURATIONS["Tle D"]);
  const [downloading, setDownloading] = useState(false);
  const [engine, setEngine] = useState<"titan1" | "titan2">("titan1");
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

  const CLASSES = useMemo(() => Object.keys(NOTIONS_BY_SUBJECT[subject]), [subject]);
  const notions = useMemo(() => NOTIONS_BY_SUBJECT[subject]?.[classe] || [], [subject, classe]);
  const parts = partsFor(subject, classe);
  const MAX_NOTIONS = 3;

  // Notions sélectionnées, à plat (pool unique OU union des parties PCT) —
  // utilisé pour décider si la case "figure obligatoire" doit être proposée,
  // et repris tel quel dans le payload envoyé au backend.
  const flatSelectedNotions = useMemo(
    () => (parts ? parts.flatMap((p) => selectedNotionsByPart[p.label] || []) : selectedNotions),
    [parts, selectedNotionsByPart, selectedNotions]
  );
  const hasGeometryNotion = useMemo(
    () => flatSelectedNotions.some(isGeometryNotion),
    [flatSelectedNotions]
  );

  function handleSubjectChange(s: string) {
    setSubject(s);
    const classesForSubject = Object.keys(NOTIONS_BY_SUBJECT[s]);
    const nextClasse = classesForSubject.includes(classe)
      ? classe
      : classesForSubject[classesForSubject.length - 1];
    setClasse(nextClasse);
    setSelectedNotions([]);
    setNotionDraft("");
    setSelectedNotionsByPart({});
    setDuration(DEFAULT_DURATIONS[nextClasse] ?? 180);
  }

  function handleClasseChange(c: string) {
    setClasse(c);
    setSelectedNotions([]);
    setNotionDraft("");
    setSelectedNotionsByPart({});
    setDuration(DEFAULT_DURATIONS[c] ?? 180);
  }

  function toggleNotion(n: string) {
    setSelectedNotions((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= MAX_NOTIONS) return prev;
      return [...prev, n];
    });
  }

  function toggleNotionInPart(partLabel: string, n: string) {
    setSelectedNotionsByPart((prev) => {
      const cur = prev[partLabel] || [];
      const next = cur.includes(n) ? cur.filter((x) => x !== n)
        : cur.length >= MAX_NOTIONS ? cur : [...cur, n];
      return { ...prev, [partLabel]: next };
    });
  }

  function addFreeNotion() {
    const v = notionDraft.trim();
    if (!v || selectedNotions.length >= MAX_NOTIONS) return;
    if (!selectedNotions.includes(v)) {
      setSelectedNotions((prev) => [...prev, v]);
    }
    setNotionDraft("");
  }

  function removeFreeNotion(n: string) {
    setSelectedNotions((prev) => prev.filter((x) => x !== n));
  }

  async function handleSubmit(chosenEngine: "titan1" | "titan2" = engine) {
    if (!isAdmin && !is_unlimited && exams_remaining <= 0) {
      openPaywall("exam");
      return;
    }

    const isCollege = COLLEGE.has(classe);
    const examData = {
      title: `Épreuve de ${subject} - ${classe}`,
      subject,
      level: classe,
      duration_minutes: duration,
      topics: flatSelectedNotions,
      ...(parts ? { topics_by_part: selectedNotionsByPart } : {}),
      num_questions: isCollege ? 8 : 10,
      difficulty: "mixed",
      question_type: "mixed",
      engine: "standard",
      titan: chosenEngine,
      is_public: false,
      // Uniquement pertinent si une notion de géométrie est sélectionnée —
      // cf. hasGeometryNotion (la case n'est même pas affichée sinon).
      figure_requise: hasGeometryNotion && figureRequise,
    };

    setPhase("streaming");
    setStepTexts({});
    setCompletedSteps([]);
    setActiveSteps(new Set());

    const apiUrl = getApiBaseUrl();
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    try {
      const resp = await fetch(`${apiUrl}/exams/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(examData),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 402) {
          setPhase("form");
          openPaywall("exam");
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
            setCompletedSteps((prev) => [...prev, s]);
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
  const { steps: STEPS, labels: STEP_LABELS } = useMemo(() => stepsAndLabelsFor(subject, classe), [subject, classe]);

  // Texte affiché toujours dans l'ordre canonique des étapes (Contexte, Tâche,
  // Problème I/II/III ou Physique/Chimie), même si les étapes se terminent
  // dans le désordre du fait de leur génération en parallèle.
  const streamText = STEPS.filter((s) => stepTexts[s]).map((s) => stepTexts[s]).join("\n\n");

  const progress = phase === "done" ? 100
    : completedSteps.length === 0 && activeSteps.size === 0 ? 0
    : Math.round(((completedSteps.length + activeSteps.size * 0.5) / STEPS.length) * 100);

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (phase === "streaming" || phase === "done" || phase === "error") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Génération en cours</h1>
            <p className="text-slate-500 mt-1 text-sm">{subject} · Classe {classe}</p>
          </div>
          {phase === "done" && (
            <button onClick={handleRestart} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
              ← Nouvelle épreuve
            </button>
          )}
        </div>

        {/* Barre de progression par étape */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{phase === "done" ? "Génération terminée" : phase === "error" ? "Erreur" : `Génération en cours, veuillez patienter... ${progress}%`}</span>
            <span>{completedSteps.length}/{STEPS.length} étapes</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                phase === "error" ? "bg-red-500" : phase === "done" ? "bg-emerald-500" : "bg-indigo-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Étapes */}
          <div className="flex gap-2 flex-wrap">
            {STEPS.map((step) => {
              const done = completedSteps.includes(step);
              const active = activeSteps.has(step);
              return (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    done ? "bg-slate-50 border-slate-200 text-slate-700"
                    : active ? "bg-slate-100 border-slate-300 text-slate-700 animate-pulse"
                    : "bg-slate-50 border-slate-100 text-slate-400"
                  )}
                >
                  {done
                    ? <CheckCircle2 className="w-3 h-3" />
                    : active
                    ? <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse inline-block" />
                    : <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                  }
                  {STEP_LABELS[step]}
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone de preview en streaming */}
        {phase !== "error" && (
          <div
            ref={previewRef}
            className="bg-white rounded-2xl border border-slate-100 p-6 h-96 overflow-y-auto font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed"
          >
            {streamText || <span className="text-slate-300 italic">L&apos;épreuve s&apos;affiche ici…</span>}
            {phase === "streaming" && (
              <span className="inline-block w-0.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}

        {/* Erreur */}
        {phase === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700">Erreur lors de la génération</p>
              <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
              <button
                onClick={handleRestart}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Actions après génération */}
        {phase === "done" && examId && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-slate-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Épreuve générée avec succès !</p>
                <p className="text-sm text-slate-600">Téléchargez-la ou consultez-la dans vos épreuves.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  setDownloading(true);
                  try {
                    await downloadPdf(examId);
                  } catch {
                    toast.error("Échec du téléchargement du PDF");
                  } finally {
                    setDownloading(false);
                  }
                }}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {downloading ? "Téléchargement..." : "Télécharger le PDF"}
              </button>
              <button
                onClick={() => router.push(`/dashboard/exams/${examId}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                <Eye className="w-4 h-4" />
                Voir l&apos;épreuve
              </button>
              <button
                onClick={() => router.push("/dashboard/exams")}
                className="flex items-center gap-2 px-5 py-2.5 text-slate-500 hover:text-slate-700 text-sm transition-colors"
              >
                Mes épreuves →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Formulaire ────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-indigo-500">Création intelligente</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#071a3d] sm:text-4xl">Générer une épreuve</h1>
        <p className="mt-1 text-lg text-slate-500">
          Configurez les paramètres : la génération s&apos;affiche en direct.
        </p>
      </div>

      <div className="grid grid-cols-3 items-center gap-3 px-1 text-xs font-semibold text-slate-400 sm:text-sm">
        {[["1", "Paramètres"], ["2", "Structure"], ["3", "Aperçu"]].map(([number, label], index) => (
          <div key={number} className="flex items-center gap-3">
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", index === 0 ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-400 shadow-sm")}>{number}</span>
            <span className={index === 0 ? "text-indigo-600" : ""}>{label}</span>
            {index < 2 && <span className="hidden h-px flex-1 bg-slate-200 sm:block" />}
          </div>
        ))}
      </div>

      <div className="space-y-6 rounded-3xl border border-white bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100">
            <Zap className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#071a3d]">Mode rapide</h2>
            <p className="text-sm text-slate-400">Génération en direct · résultat visible en temps réel</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
            <Layers className="w-3 h-3" />Standard
          </span>
        </div>

        <hr className="border-slate-100" />

        {/* Matière */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Matière</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SUBJECTS.map(({ key, desc, Icon, selected, iconWrap }) => {
              const isSelected = subject === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSubjectChange(key)}
                  className={cn(
                    "min-w-0 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                    isSelected ? selected : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn("mb-3 flex h-11 w-11 items-center justify-center rounded-xl", iconWrap)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight break-words">{key}</div>
                  <div className="hidden sm:block text-xs text-slate-400 mt-0.5 line-clamp-2">{desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Classe */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Classe</label>
          <div className="relative">
            <select
              value={classe}
              onChange={(e) => handleClasseChange(e.target.value)}
              className="h-13 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Durée — fixée par classe (grille officielle), non modifiable */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Durée
          </label>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {formatDuree(duration)}
            </div>
            <span className="text-xs text-slate-400">
              Durée officielle fixée pour la classe {classe}
            </span>
          </div>
        </div>

        {/* Notions */}
        {parts ? (
          <div className="space-y-5">
            {parts.map((part) => {
              const partNotions = part.notions[classe] || [];
              const picked = selectedNotionsByPart[part.label] || [];
              return (
                <div key={part.label} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    Notions — {part.label}
                    <span className="text-xs text-slate-400 font-normal">(3 obligatoires)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                    {partNotions.map((n) => {
                      const isSelected = picked.includes(n);
                      const isDisabled = !isSelected && picked.length >= MAX_NOTIONS;
                      return (
                        <button
                          key={n}
                          onClick={() => toggleNotionInPart(part.label, n)}
                          disabled={isDisabled}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                            isSelected
                              ? "bg-amber-600 text-white border-amber-600"
                              : isDisabled
                              ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                              : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                          )}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  {picked.length > 0 && (
                    <p className="text-xs text-amber-600 font-medium">
                      {picked.length}/{MAX_NOTIONS} notion{picked.length > 1 ? "s" : ""} sélectionnée{picked.length > 1 ? "s" : ""}
                      {picked.length >= MAX_NOTIONS && " (maximum atteint)"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Notions au programme
            <span className="text-xs text-slate-400 font-normal">(3 obligatoires)</span>
          </label>
          {notions.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {notions.map((n) => {
                const isSelected = selectedNotions.includes(n);
                const isDisabled = !isSelected && selectedNotions.length >= MAX_NOTIONS;
                return (
                  <button
                    key={n}
                    onClick={() => toggleNotion(n)}
                    disabled={isDisabled}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : isDisabled
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Le programme officiel {subject} n&apos;est pas encore intégré pour cette classe :
                tape toi-même jusqu&apos;à {MAX_NOTIONS} notions à évaluer.
              </p>
              {selectedNotions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedNotions.map((n) => (
                    <span
                      key={n}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white"
                    >
                      {n}
                      <button onClick={() => removeFreeNotion(n)} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {selectedNotions.length < MAX_NOTIONS && (
                <input
                  value={notionDraft}
                  onChange={(e) => setNotionDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addFreeNotion();
                    }
                  }}
                  placeholder="Tape une notion et appuie sur Entrée…"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          )}
          {selectedNotions.length > 0 && (
            <p className="text-xs text-indigo-600 font-medium">
              {selectedNotions.length}/{MAX_NOTIONS} notion{selectedNotions.length > 1 ? "s" : ""} sélectionnée{selectedNotions.length > 1 ? "s" : ""}
              {selectedNotions.length >= MAX_NOTIONS && " (maximum atteint)"}
            </p>
          )}
        </div>
        )}

        {/* Figure obligatoire — proposée uniquement pour une notion de géométrie */}
        {hasGeometryNotion && (
          <label className="flex items-start gap-3 px-4 py-3 rounded-xl border border-indigo-100 bg-indigo-50/60 cursor-pointer">
            <input
              type="checkbox"
              checked={figureRequise}
              onChange={(e) => setFigureRequise(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">
              Aimeriez-vous avoir une figure géométrique sur l&apos;épreuve pour une bonne illustration ?
              <span className="block text-xs text-slate-400 mt-0.5">
                Illustre le(s) problème(s) de géométrie dans l&apos;énoncé et son corrigé.
              </span>
            </span>
          </label>
        )}

        {/* Submit */}
        <button
          onClick={() => {
            if (parts) {
              const missing = parts.filter((p) => (selectedNotionsByPart[p.label] || []).length !== MAX_NOTIONS);
              if (missing.length > 0) {
                toast.error(`Sélectionne exactement ${MAX_NOTIONS} notions pour la partie ${missing[0].label}`);
                return;
              }
            } else if (selectedNotions.length !== MAX_NOTIONS) {
              toast.error(`Sélectionne exactement ${MAX_NOTIONS} notions au programme avant de générer l'épreuve`);
              return;
            }
            setShowEngineModal(true);
          }}
          className="ml-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
        >
          <Sparkles className="w-4 h-4" />
          Générer l&apos;épreuve
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Modal de choix du moteur (Titan 1 / Titan 2) — s'ouvre au clic sur Générer */}
      {showEngineModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowEngineModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900">Choisis ton moteur de génération</h3>
              <p className="text-sm text-slate-500 mt-1">
                Deux moteurs, deux compromis entre vitesse et qualité.
              </p>
            </div>

            <div className="space-y-3">
              {MOTEURS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setEngine(m.id)}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all",
                    engine === m.id
                      ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                      : "border-slate-200 hover:border-indigo-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{m.nom}</span>
                    <span className="text-xs font-medium text-slate-500">{m.duree}</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-0.5">{m.desc}</div>
                  <div className="text-xs text-slate-400 mt-1">{m.detail}</div>
                  {m.avert && (
                    <div className="mt-2 text-xs font-medium text-amber-600">
                      ⚠ Génération plus lente — patiente jusqu&apos;à la fin.
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEngineModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowEngineModal(false);
                  handleSubmit(engine);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
              >
                Lancer la génération
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Itératif — Admin seulement */}
      {isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-amber-900">Mode itératif</h2>
                <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Admin</span>
              </div>
              <p className="text-sm text-amber-700 mb-4">
                Interface interactive étape par étape avec validation manuelle de chaque exercice.
              </p>
              <a
                href="/atelier/"
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir l&apos;atelier interactif
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
