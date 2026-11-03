// Official programme data (SA, sequences, activities, durations) taken as-is from the real Mathiis app
// (mathiis-frontend, src/app/dashboard/generate/page.tsx; source: fiches officielles 2026-2027, DIPIQ).
// Keep these strings identical to the app: they are what the generator receives.
export type SaGroup = { label: string; items: string[] };
type MathSaSeq = SaGroup;
const _mathSeq = (notions: string[]): MathSaSeq[] => notions.map((n) => ({ label: n, items: [n] }));

export const MATHS_SA_DETAILS: Record<string, Record<string, SaGroup[]>> = {
  "6e": {
    "Configurations de l'espace": _mathSeq(["Cube et pavé droit", "Cône de révolution", "Sphère"]),
    "Configurations du plan": _mathSeq(["Droites du plan", "Cercles", "Angles", "Triangles", "Parallélogramme", "Entiers naturels", "Nombres décimaux", "Fractions", "Calcul littéral"]),
    "Applications du plan": _mathSeq(["Symétrie axiale", "Symétrie centrale"]),
    "Organisation des données": _mathSeq(["Proportionnalité", "Statistique"]),
  },
  "5e": {
    "Configurations de l'espace": _mathSeq(["Prisme droit", "Division dans ℕ", "Nombres premiers", "Puissances", "PPCM", "PGCD"]),
    "Configurations du plan": _mathSeq(["Distance", "Angles", "Triangles", "Cercle", "Parallélogramme", "Nombres décimaux relatifs", "Fractions"]),
    "Applications du plan": _mathSeq(["Symétrie axiale", "Symétrie centrale"]),
    "Organisation des données": _mathSeq(["Équations", "Proportionnalité"]),
  },
  "4e": {
    "Configurations du plan": _mathSeq(["Angles au centre d'un cercle", "Distance", "Triangles", "Polygones réguliers", "Nombres rationnels", "Puissances", "Expressions algébriques"]),
    "Configurations de l'espace": _mathSeq(["Pyramide", "Cône de révolution", "Sphère et boule", "PPCM et PGCD"]),
    "Applications du plan": _mathSeq(["Symétrie centrale", "Translation", "Projection"]),
    "Organisation des données": _mathSeq(["Équations et inéquations", "Proportionnalité", "Statistique"]),
  },
  "3e": {
    "Triangles": _mathSeq(["Nombres réels", "Valeur absolue", "Trigonométrie", "Théorème de Thalès", "Triangles semblables", "Triangle rectangle", "Angles et cercles"]),
    "Configurations de l'espace": _mathSeq(["Cône de révolution"]),
    "Calcul littéral": _mathSeq(["Polynômes", "Équations de droite", "Équations et inéquations", "Vecteurs", "Coordonnées de vecteurs"]),
    "Organisation des données": _mathSeq(["Applications affines", "Applications linéaires", "Statistiques"]),
  },
  "2nde AB": {
    "Organisation des données": _mathSeq(["Proportionnalité", "Fonctions numériques", "Suites numériques", "Dénombrement"]),
    "Lieux géométriques dans le plan": _mathSeq(["Nombres réels", "Calculs dans ℝ", "Équations du premier degré dans ℝ", "Inéquations du premier degré dans ℝ", "Systèmes d'équations linéaires", "Représentation graphique de fonctions"]),
  },
  "2nde C": {
    "Configurations de l'espace": _mathSeq(["Droites et plans de l'espace", "Parallélisme", "La sphère"]),
    "Organisation des données": _mathSeq(["Calculs dans ℝ", "Généralités sur les fonctions", "Étude de fonctions", "Équations et inéquations dans ℝ", "Statistique", "Polynômes"]),
    "Lieux géométriques dans le plan": _mathSeq(["Vecteurs du plan", "Droites dans le plan", "Homothétie", "Angles inscrits", "Trigonométrie", "Produit scalaire", "Rotation", "Cercles dans le plan"]),
  },
  "2nde D": {
    "Configurations de l'espace": _mathSeq(["Droites et plans de l'espace", "Parallélisme"]),
    "Organisation des données": _mathSeq(["Calculs dans ℝ", "Généralités sur les fonctions", "Étude de fonctions", "Équations et inéquations dans ℝ", "Statistique", "Polynômes"]),
    "Lieux géométriques dans le plan": _mathSeq(["Vecteurs du plan", "Droites dans le plan", "Homothétie", "Relations métriques dans un triangle", "Trigonométrie", "Produit scalaire", "Rotation", "Équation cartésienne d'un cercle"]),
  },
  "1ère AB": {
    "Organisation des données": _mathSeq(["Équations du second degré", "Somme et produit des racines", "Équations bicarrées", "Inéquations du second degré", "Systèmes linéaires dans ℝ²", "Suites arithmétiques", "Suites géométriques", "Statistique", "Dénombrement"]),
    "Lieux géométriques dans le plan": _mathSeq(["Fonctions numériques", "Limite et continuité", "Dérivation", "Fonctions polynômes", "Fonctions homographiques"]),
  },
  "1ère C": {
    "Configurations de l'espace": _mathSeq(["Orthogonalité dans l'espace", "Projection orthogonale", "Vecteurs de l'espace", "Produit scalaire", "Géométrie analytique"]),
    "Organisation des données": _mathSeq(["Équations et inéquations dans ℝ", "Statistique", "Dénombrement", "Limite et continuité", "Dérivation", "Primitives", "Suites numériques"]),
    "Lieux géométriques dans le plan": _mathSeq(["Angles orientés", "Fonctions circulaires", "Trigonométrie", "Barycentre", "Isométries du plan", "Similitudes"]),
  },
  "1ère D": {
    "Configurations de l'espace": _mathSeq(["Orthogonalité dans l'espace", "Vecteurs de l'espace"]),
    "Organisation des données": _mathSeq(["Équations et inéquations dans ℝ", "Systèmes linéaires", "Statistique", "Dénombrement", "Fonctions numériques", "Limites et continuité", "Dérivation", "Primitives", "Suites numériques"]),
    "Lieux géométriques dans le plan": _mathSeq(["Angles orientés", "Trigonométrie", "Barycentre", "Transformations du plan"]),
  },
  "Tle AB": {
    "Lieux géométriques dans le plan": _mathSeq(["Généralités sur les fonctions", "Limite et continuité", "Dérivation", "Fonctions polynômes", "Fonctions rationnelles", "Logarithme népérien", "Exponentielle népérienne"]),
    "Organisation des données": _mathSeq(["Équations — Inéquations — Systèmes", "Suites numériques", "Statistique", "Probabilité"]),
  },
  "Tle C": {
    "Configurations de l'espace": _mathSeq(["Calcul vectoriel dans l'espace"]),
    "Organisation des données": _mathSeq(["Systèmes linéaires", "Arithmétique", "Nombres complexes", "Limites et continuité", "Étude de fonctions", "Primitives", "Logarithme népérien", "Exponentielle népérienne", "Calcul intégral", "Équations différentielles", "Probabilité", "Suites numériques"]),
    "Lieux géométriques dans le plan": _mathSeq(["Isométries du plan", "Similitudes", "Coniques"]),
  },
  "Tle D": {
    "Configurations de l'espace": _mathSeq(["Vecteurs de l'espace", "Barycentre", "Droites et plans de l'espace", "Systèmes linéaires", "Produit scalaire", "Produit vectoriel"]),
    "Organisation des données": _mathSeq(["Nombres complexes", "Limites et continuité", "Étude de fonctions", "Primitives", "Logarithme népérien", "Exponentielle népérienne", "Calcul intégral", "Équations différentielles", "Probabilité", "Suites numériques", "Statistique"]),
    "Lieux géométriques dans le plan": _mathSeq(["Application des nombres complexes aux transformations du plan"]),
  },
};

export const PCT_NOTIONS_PHYSIQUE: Record<string, string[]> = {
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

export const PCT_NOTIONS_CHIMIE: Record<string, string[]> = {
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

export const PCT_SA_DETAILS: Record<string, Record<string, SaGroup[]>> = {
  "6e": {
    "Le courant électrique": [
      { label: "Activités", items: ["4.1 : Quelles sont les différentes parties d'une lampe électrique et d'une pile ?", "4.2 : Comment allume-t-on une lampe électrique avec une pile ?", "4.3 : Quel est le sens conventionnel du courant électrique continu ?", "4.4 : Tous les corps conduisent-ils le courant électrique ?", "4.5 : Quand dit-on qu'une pile est adaptée à une lampe électrique ?", "4.6 : Comment schématise-t-on un circuit électrique simple ?", "4.7 : Pourquoi et comment associe-t-on des piles en série ?", "4.8 : Comment et pourquoi associe-t-on des lampes électriques en série ou en parallèle ?", "4.9 : Quels sont les effets du court-circuit d'une lampe électrique dans un montage ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Alimentation d'une lampe électrique par une pile électrique", "TP 2 : Mise en évidence du sens du courant électrique continu", "TP 3 : Identification des conducteurs et des isolants électriques", "TP 4 : Adaptation de la tension du générateur à celle de la lampe électrique", "TP 5 : Association de piles et de lampes électriques (série, concordance, opposition, parallèle, court-circuit)"] },
    ],
    "La fabrication d'une lampe de poche": [
      { label: "Activités", items: ["1 : Fabrication d'une lampe de poche : éléments essentiels ; rôle des différentes parties ; notion de masse électrique et son symbole ; schéma normalisé du circuit d'une lampe torche", "2 : Réparation du circuit électrique d'un vélo : éléments essentiels ; types de pannes ; techniques d'intervention ; schéma normalisé du circuit d'une bicyclette"] },
    ],
    "Quelques combustions vives": [
      { label: "Activités", items: ["4.1 : Comment s'explique la combustion de la bougie ?", "4.2 : Comment s'explique la combustion du bois de chauffe ?", "4.3 : Comment s'explique la combustion du pétrole ?", "4.4 : Quels sont les produits issus de la combustion de la bougie et du bois de chauffe ?", "4.5 : Quels sont les constituants de l'air ?", "4.6 : Quelles sont les conditions d'activation ou de maîtrise d'un feu ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Combustion du bois de chauffe", "TP 2 : Combustion du pétrole", "TP 3 : Combustion de la bougie (parties de la flamme ; corps transformés ; corps formés)", "TP 4 : Activation et maîtrise d'une flamme"] },
    ],
    "L'eau dans ses différents états physiques": [
      { label: "Activités", items: ["4.1 : Quels sont les changements d'états physiques de l'eau ?", "4.2 : Quand est-ce que l'eau passe de l'état liquide à l'état solide ?", "4.3 : Quand est-ce que l'eau passe de l'état solide à l'état liquide ?", "4.4 : Quand est-ce que l'eau passe de l'état liquide à l'état vapeur et inversement ?", "4.5 : Comment s'effectue la sublimation du naphtalène ?", "1 : Les états physiques de l'eau : solide, liquide, gazeux", "2 : Changements d'états : solidification ; fusion de la glace ; vaporisation et évaporation ; condensation ; sublimation du diiode ou du naphtalène", "3 : Fabrication d'un distillateur : différentes parties et leur rôle", "4 : Fabrication d'un dispositif d'obtention de la glace : constituants ; rôle des parties ; mélange réfrigérant"] },
      { label: "Travaux pratiques", items: ["TP 1 : Changements d'état de l'eau (fusion, évaporation, vaporisation, solidification)", "TP 2 : Sublimation du naphtalène ou du diiode"] },
    ],
    "La pollution de l'air": [
      { label: "Activités", items: ["7.1 : Quels sont les causes et les effets néfastes des feux de végétation, des pluies acides et des gaz d'échappement sur l'environnement ?", "7.2 : Quelles sont les conséquences des changements climatiques ?", "7.3 : Comment l'homme peut-il satisfaire ses besoins actuels relatifs à la combustion sans compromettre ceux des générations futures ?"] },
    ],
    "La fabrication d'un instrument de production de son": [
      { label: "Activités", items: ["Fabrication d'objets acoustiques : instruments à membrane, à corde, à vent, de percussion"] },
    ],
  },
  "5e": {
    "Le courant électrique alternatif": [
      { label: "Activités", items: ["4.1 : Quelles sont les caractéristiques du courant électrique alternatif ?", "4.2 : Quelle utilisation fait-on du courant électrique alternatif ?", "4.3 : Quelles sont les propriétés d'un aimant ?", "4.4 : Quel est le comportement d'une bobine traversée par un courant électrique continu ?", "4.5 : Comment produire du courant électrique à l'aide d'une bobine et d'un aimant ?", "4.6 : Quelles sont les caractéristiques du courant électrique produit par un alternateur de bicyclette ?", "4.7 : Quelles sont les différentes parties et le rôle d'un tournevis testeur ?", "4.8 : Comment utilise-t-on le tournevis testeur pour identifier les bornes d'une prise de courant ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Caractérisation d'un aimant et d'une bobine", "TP 2 : Production du courant électrique à l'aide d'une bobine et d'un aimant", "TP 3 : Visualisation du courant produit par la génératrice d'une bicyclette", "TP 4 : Visualisation du courant électrique du secteur", "TP 5 : Identification des bornes d'une prise de courant à l'aide d'un tournevis testeur"] },
    ],
    "Protection des personnes et des biens contre les dangers du courant électrique": [
      { label: "Activités", items: ["7.1 : Quels sont les dangers du courant électrique et comment se manifestent-ils ?", "7.2 : Quels sont les moyens de protection des personnes et des biens contre les dangers du courant électrique ?", "7.3 : Quelles sont les conduites à tenir en cas d'urgence liée aux dangers du courant électrique ?"] },
    ],
    "Structure de la matière": [
      { label: "Activités", items: ["4.1 : Structure particulaire de la matière : atomes, molécules, symbole, formule chimique", "4.2 : Utilisation du modèle moléculaire (corps purs simples, composés et mélanges)", "4.3 : Quelles sont les différentes sortes de mélanges et comment séparer leurs constituants ?", "4.4 : Solution (soluté, solvant) : solution diluée, concentrée et saturée", "4.5 : La mole : masse molaire atomique, masse molaire moléculaire, volume molaire, concentration molaire", "4.6 : Comment déterminer les concentrations massique et molaire d'une solution aqueuse ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Utilisation du modèle moléculaire pour expliquer les structures des corps", "TP 2 : Identification des types de mélanges et séparation des constituants", "TP 3 : Préparation d'une solution aqueuse (diluée, concentrée, saturée)"] },
    ],
    "Propagation rectiligne de la lumière et applications": [
      { label: "Activités", items: ["4.1 : Quelles sont les différentes sources et récepteurs de lumière ?", "4.2 : Comment se propage la lumière et qu'est-ce qu'un rayon lumineux ?", "4.3 : Qu'est-ce qu'un corps opaque, translucide et transparent ?", "4.4 : Qu'est-ce que la réflexion de la lumière, ses applications et les réflexions multiples ?", "4.5 : Comment explique-t-on l'image donnée par un miroir plan ?", "Sources et récepteurs de lumière ; corps opaques, translucides et transparents", "Propagation rectiligne de la lumière ; réflexion de la lumière et applications ; réflexions multiples", "Démarche technologique : fabrication d'un périscope à miroirs ou d'un kaléidoscope (principe de fonctionnement, étapes de fabrication)"] },
      { label: "Travaux pratiques", items: ["TP 1 : Identification des objets opaques, translucides et transparents", "TP 2 : Mise en évidence de la propagation rectiligne de la lumière", "TP 3 : Réflexion de la lumière"] },
    ],
    "Propriétés physiques des gaz": [
      { label: "Activités", items: ["4.1 : Le gaz a-t-il une forme et un volume propres ?", "4.2 : Le gaz a-t-il une masse ?", "4.3 : Les gaz sont-ils expansibles, compressibles et élastiques ?", "4.4 : Comment transvase-t-on les gaz ?", "4.5 : Comment mettre en évidence la dilatation des gaz ?", "4.6 : Comment mettre en évidence la pression atmosphérique ?", "4.7 : Comment mesure-t-on la pression atmosphérique ?", "4.8 : Comment mesure-t-on la pression d'un gaz ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Mise en évidence de l'existence des gaz et de leurs propriétés", "TP 2 : Transvasement des gaz", "TP 3 : Mise en évidence de la pression d'un gaz", "TP 4 : Dilatation d'un gaz"] },
    ],
    "Dilatation et contraction des liquides – Fabrication d'un thermomètre à alcool": [
      { label: "Activités", items: ["4.1 : Quels sont les modes de transfert de la chaleur ?", "4.2 : Qu'est-ce que l'équilibre thermique ?", "4.3 : Comment les liquides se dilatent-ils ou se contractent-ils ?", "Chaleur et température ; sources et propagation de la chaleur ; absorption et perte de chaleur", "Dilatation et contraction des liquides", "Démarche technologique : fabrication d'un thermomètre à alcool (principe de fonctionnement, étapes de fabrication)"] },
      { label: "Travaux pratiques", items: ["TP 1 : Identification des modes de propagation de la chaleur (conduction, convection, rayonnement)", "TP 2 : Mise en évidence de l'équilibre thermique"] },
    ],
  },
  "4e": {
    "Utilisation des appareils de mesure de quelques grandeurs électriques – Vérification de la loi d'Ohm": [
      { label: "Activités", items: ["5.1 : Mesure de quelques grandeurs électriques", "5.2 : Vérification de l'unicité de l'intensité et de l'additivité des tensions dans un circuit en série", "5.3 : Vérification de l'unicité de la tension et de l'additivité des intensités dans un circuit en dérivation", "5.4 : Vérification de la loi d'Ohm", "5.5 : Résistance équivalente de deux conducteurs ohmiques"] },
      { label: "Travaux pratiques", items: ["TP 1 : Utilisation d'un multimètre pour des mesures d'intensité et de tension dans un circuit en série", "TP 2 : Unicité de l'intensité et additivité des tensions dans un circuit en série", "TP 3 : Unicité de la tension et additivité des intensités dans un circuit en dérivation", "TP 4 : Vérification de la loi d'Ohm aux bornes d'un conducteur ohmique", "TP 5 : Détermination graphique de la résistance équivalente (série et dérivation)", "TP 6 : Détermination de la résistance équivalente de deux conducteurs ohmiques (série et dérivation)"] },
    ],
    "Structure d'un atome – Quelques propriétés physiques et mécaniques de certains métaux usuels": [
      { label: "Activités", items: ["4.1 : Quand parle-t-on d'électrisation d'un corps et quels sont les différents types de charge électrique ?", "4.2 : De quoi est constitué l'atome ?", "4.3 : Quelle est la structure électronique des atomes ?", "4.4 : Comment les atomes s'ionisent-ils ?", "4.5 : Quelles sont les propriétés physiques des métaux usuels ?", "4.6 : Quelles sont les propriétés mécaniques des métaux usuels ?", "4.7 : Qu'est-ce qu'un alliage et quelle est son importance ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Mise en évidence du phénomène d'électrisation", "TP 2 : Étude des propriétés physiques et mécaniques des métaux"] },
    ],
    "Interactions mécaniques – Forces et poulies": [
      { label: "Activités", items: ["4.1 : Qu'est-ce qu'une interaction mécanique ?", "4.2 : Qu'est-ce qu'une force et quelles sont ses caractéristiques ?", "4.3 : Comment mesure-t-on l'intensité d'une force et comment la représente-t-on ?", "4.4 : Qu'appelle-t-on poids d'un corps ?", "4.5 : Comment représente-t-on la tension d'un fil ou d'un ressort et la réaction d'un support ?", "4.6 : Qu'est-ce que la poussée d'Archimède ?", "4.7 : Comment déterminer la résultante de deux forces colinéaires ?", "4.8 : Comment déterminer la résultante de deux forces parallèles de même sens ?", "4.9 : Comment déterminer la résultante de deux forces concourantes ?", "4.10 : Comment étalonner un ressort ?", "4.11 : Quel est l'intérêt de l'utilisation d'une poulie simple ?", "4.12 : Quelles sont les relations entre les intensités des forces et les déplacements au cours de l'utilisation d'un palan ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Mise en évidence des interactions mécaniques", "TP 2 : Mesure de l'intensité d'une force à l'aide d'un dynamomètre", "TP 3 : Mise en évidence de la poussée d'Archimède", "TP 4 : Étalonnage d'un ressort", "TP 5 : Utilisation des poulies et palans"] },
    ],
    "Étude de quelques molécules": [
      { label: "Activités", items: ["4.1 : Comment les atomes sont-ils liés dans une molécule ?", "4.2 : Comment s'effectue la combustion du carbone dans le dioxygène ?", "4.3 : Comment s'effectue la combustion du soufre dans le dioxygène ?", "4.4 : Comment s'effectue la combustion du fer dans le dioxygène ?", "4.5 : Quelles sont les propriétés physiques des hydrocarbures ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Construction des molécules à partir des modèles moléculaires", "TP 2 : Combustion du carbone dans le dioxygène", "TP 3 : Combustion du soufre dans le dioxygène", "TP 4 : Combustion du fer dans le dioxygène"] },
    ],
    "Propagation de la lumière": [
      { label: "Activités", items: ["4.1 : Comment réalise-t-on une ombre, une pénombre ?", "4.2 : Comment s'expliquent les différents aspects de la Lune lors de son mouvement ?", "4.3 : Comment s'expliquent les éclipses du Soleil et de la Lune ?", "4.4 : Qu'est-ce que la réfraction de la lumière ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Réalisation d'ombre, de pénombre, de cône d'ombre", "TP 2 : Réalisation des éclipses", "TP 3 : Réalisation de la réfraction de la lumière"] },
    ],
    "Fabrication d'un dynamomètre et d'une chambre noire": [
      { label: "Activités", items: ["Dynamomètre : ressort hélicoïdal (récupération) ; étalonnage ; graduations ; anneau et crochet", "Chambre noire : boîte percée d'un trou avec écran translucide ; conditions d'obtention de l'image ; fixation de l'écran ; confection du cache pour la netteté"] },
    ],
  },
  "3e": {
    "Équilibre d'un solide et conversion d'énergie": [
      { label: "Activités", items: ["4.1 : Quels sont les différents types d'équilibre qui existent ?", "4.2 : Quand dit-on qu'un solide est animé d'un mouvement de translation rectiligne ?", "4.3 : À quelles conditions un solide en translation soumis à deux forces, à trois forces concourantes ou à des forces parallèles est-il en équilibre ?", "4.4 : Quand dit-on qu'un solide est animé d'un mouvement de rotation ?", "4.5 : Quelle est l'expression de la grandeur qui caractérise l'effet de rotation d'une force et d'un couple de forces ?", "4.6 : À quelle condition un solide mobile autour d'un axe fixe et soumis à plusieurs forces est-il en équilibre ?", "4.7 : À quelles situations de vie courante s'applique le théorème des moments ?", "4.8 : À quelle condition une force travaille-t-elle et quand ce travail est-il moteur, résistant ou nul ?", "4.9 : Quelle est l'expression du travail d'une force constante lors d'un déplacement rectiligne ?", "4.10 : Quelle est l'expression du travail effectué par une force appliquée à un solide en rotation ?", "4.11 : Quelle est l'expression de la puissance d'une force ou d'un couple de forces ?", "4.12 : Quelles sont les différentes formes d'énergie, leur transfert et conversion ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Équilibre d'un solide soumis à deux forces", "TP 2 : Équilibre d'un solide soumis à trois forces concourantes", "TP 3 : Équilibre d'un solide soumis à des forces parallèles", "TP 4 : Équilibre d'un solide mobile autour d'un axe fixe (treuil, leviers)"] },
    ],
    "Quelques réactions chimiques en solution aqueuse": [
      { label: "Activités", items: ["4.1 : Comment prépare-t-on une solution aqueuse d'une concentration donnée ?", "4.2 : Comment identifie-t-on les solutions aqueuses ioniques et non ioniques ?", "4.3 : Comment identifie-t-on le caractère acide, basique ou neutre d'une solution aqueuse ?", "4.4 : Comment explique-t-on une réaction acide-base ?", "4.5 : Comment les acides réagissent-ils avec les métaux usuels ?", "4.6 : Comment identifie-t-on les ions en solution aqueuse ?", "4.7 : Comment réalise-t-on l'électrolyse d'une solution aqueuse ionique ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Préparation de solution aqueuse", "TP 2 : Nature ionique ou non ionique d'une solution aqueuse", "TP 3 : Nature acido-basique d'une solution aqueuse", "TP 4 : Réaction acide chlorhydrique / hydroxyde de sodium (dosage acido-basique)", "TP 5 : Action des acides sur les métaux", "TP 6 : Caractérisation des ions", "TP 7 : Électrolyse de solutions d'acide chlorhydrique, de chlorure de cuivre II, de chlorure de fer II"] },
    ],
    "L'énergie électrique, un besoin indispensable": [
      { label: "Activités", items: ["4.1 : Quel est le principe de production du courant alternatif et quelles sont les caractéristiques de la tension alternative produite ?", "4.2 : Quels sont les éléments intervenant dans la distribution du courant électrique ?", "4.3 : Qu'est-ce qu'un transformateur et quel est son rôle ?", "4.4 : Comment produire une tension continue à partir de la tension alternative ?", "4.5 : Qu'est-ce que la puissance électrique ?", "4.6 : Qu'est-ce que l'énergie électrique ?", "4.7 : Comment met-on en évidence l'effet Joule dans un conducteur ohmique ?", "4.8 : Comment fait-on le bilan énergétique dans un circuit électrique ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Mise en évidence de l'effet Joule", "TP 2 : Redressement du courant alternatif"] },
    ],
    "Fabrication d'un détecteur de courant électrique et d'un électrolyseur": [
      { label: "Activités", items: ["Détecteur : fonctionnement d'une DEL ; étude qualitative d'un transistor ; schéma du circuit d'un détecteur", "Électrolyseur : électrodes (cathode, anode) ; constitution et formes ; schéma", "Techniques : fabrication et emboîtage du détecteur ; fabrication d'un électrolyseur ; identification des produits aux électrodes"] },
    ],
    "Combustion complète de quelques hydrocarbures et réactions de polymérisation": [
      { label: "Activités", items: ["4.1 : Qu'est-ce qu'un hydrocarbure ?", "4.2 : Comment réaliser la combustion complète d'un hydrocarbure ?", "4.3 : Comment préparer l'acétylène et le méthane au laboratoire ?", "4.4 : Qu'est-ce qu'une réaction de polymérisation ?", "4.5 : Quels sont les avantages et les inconvénients de l'utilisation des matières plastiques ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Construction des molécules d'hydrocarbures à partir des modèles moléculaires", "TP 2 : Identification des produits de combustion du butane", "TP 3 : Préparation de l'acétylène"] },
    ],
    "L'optique au service de l'homme": [
      { label: "Activités", items: ["4.1 : Quels sont les différents types de lentilles et comment les reconnaît-on dans la pratique ?", "4.2 : Quelles sont les caractéristiques d'une lentille convergente ?", "4.3 : Comment détermine-t-on expérimentalement le foyer principal image et la distance focale d'une lentille ?", "4.4 : Comment vérifie-t-on expérimentalement la relation de conjugaison et du grandissement ?", "4.5 : Comment construit-on graphiquement l'image d'un objet à travers une lentille mince convergente ?", "4.6 : Quels sont les défauts de l'œil et comment les corrige-t-on ?", "4.7 : Comment décompose-t-on la lumière blanche et explique-t-on la formation de l'arc-en-ciel ?", "4.8 : Comment synthétise-t-on la lumière blanche ?"] },
      { label: "Travaux pratiques", items: ["TP 1 : Identification des lentilles minces", "TP 2 : Détermination de la distance focale d'une lentille convergente", "TP 3 : Vérification de la relation de conjugaison", "TP 4 : Analyse et synthèse de la lumière blanche"] },
    ],
  },
  "2nde C": {
    "Le courant électrique dans les composants électriques": [
      { label: "Activités", items: ["1 : Courant électrique continu : porteurs de charge, sens conventionnel, mesure de l'intensité, quantité d'électricité", "2 : Tension électrique continue (différence de potentiel) et sa mesure", "3 : Voltmètre, multimètre, oscilloscope", "4 : Courant alternatif ; tensions électriques variables", "5 : Dipôles passifs : résistor, photorésistor, thermistor, varistor, diode au silicium, diode Zener, photodiode (caractéristiques ; résistance et association de conducteurs ohmiques)", "6 : Dipôles actifs : générateur (caractéristique u = f(i), résistance interne, force électromotrice)", "7 : Point de fonctionnement d'un circuit"] },
    ],
    "La matière et ses transformations": [
      { label: "Activités", items: ["1 : Élément chimique ; atomes, électrons, noyau (protons et neutrons) ; nucléides, isotopes", "2 : Classification périodique des éléments", "3 : Molécule et liaison covalente (représentation de Lewis)", "4 : Ions monoatomiques et polyatomiques", "5 : Équation-bilan d'une réaction chimique ; loi de Lavoisier ; bilans molaires et massiques", "6 : Quantité de matière : la mole ; constante d'Avogadro ; loi d'Avogadro-Ampère ; volume molaire"] },
    ],
    "La réalisation d'un montage électronique": [
      { label: "Activités", items: ["Étapes du projet ; tableau de répartition des tâches (planning)", "Construction de nouveaux savoirs : étude expérimentale du transistor", "Construction de nouveaux savoirs : amplificateur opérationnel", "Construction de nouveaux savoirs : capteurs (microphones ; photorésistance et photodiode ; thermistance et couple thermoélectrique)", "Exemples de montages : dispositif de protection contre le vol ; détecteur de niveau d'eau", "Schéma normalisé du dispositif à fabriquer ; estimation du coût du projet"] },
    ],
    "Les ions en solution aqueuse": [
      { label: "Activités", items: ["1 : Chlorure de sodium : ions dans le corps pur et dans sa solution aqueuse ; rôle du solvant ; électrolyse du chlorure de sodium fondu et en solution", "2 : Solutions acides : acide chlorhydrique, ion H3O+, définition et mesure du pH", "3 : Solutions basiques : solution d'hydroxyde de sodium ; pH de différentes solutions", "4 : Réaction entre l'acide chlorhydrique et l'hydroxyde de sodium (dosage)", "5 : Tests d'identification des ions : chlorure, argent, sulfate, nitrate, fer II et fer III, cuivre II, zinc, aluminium"] },
    ],
    "Les chocs et collisions entre solides en mouvement": [
      { label: "Activités", items: ["1 : Mouvement : relativité ; vecteur vitesse d'un point mobile ; mouvement rectiligne uniforme ; mouvement circulaire uniforme", "2 : Centre d'inertie ; principe de l'inertie ; centre d'inertie d'un ensemble de solides", "3 : Vecteur quantité de mouvement d'un solide", "4 : Conservation du vecteur quantité de mouvement d'un système isolé (éclatement, chocs) ; exemples de variation"] },
    ],
    "La pollution des eaux superficielles et de la nappe phréatique": [
      { label: "Activités", items: ["Analyse des eaux pour prendre position face à l'utilisation de certains produits chimiques", "Généralités sur l'eau : usages ; approvisionnement ; obtention d'une eau potable", "Sources d'eau (océans, lacs, rivières, eaux souterraines, atmosphère) et caractéristiques (température, gaz dissous, acidité, salinité)", "Produits polluants : pesticides, acides, engrais, autres produits chimiques ; leurs effets", "Formes de lutte contre la pollution des eaux"] },
    ],
  },
  "2nde D": {
    "Le courant électrique dans les composants électriques": [
      { label: "Activités", items: ["1 : Courant électrique continu : porteurs de charge, sens conventionnel, mesure de l'intensité, quantité d'électricité", "2 : Tension électrique continue (différence de potentiel) et sa mesure", "3 : Voltmètre, multimètre, oscilloscope", "4 : Courant alternatif ; tensions électriques variables", "5 : Dipôles passifs : résistor, photorésistor, thermistor, varistor, diode au silicium, diode Zener, photodiode (caractéristiques ; résistance et association de conducteurs ohmiques)", "6 : Dipôles actifs : générateur (caractéristique u = f(i), résistance interne, force électromotrice)", "7 : Point de fonctionnement d'un circuit"] },
    ],
    "La matière et ses transformations": [
      { label: "Activités", items: ["1 : Élément chimique ; atomes, électrons, noyau (protons et neutrons) ; nucléides, isotopes", "2 : Classification périodique des éléments", "3 : Molécule et liaison covalente (représentation de Lewis)", "4 : Ions monoatomiques et polyatomiques", "5 : Équation-bilan d'une réaction chimique ; loi de Lavoisier ; bilans molaires et massiques", "6 : Quantité de matière : la mole ; constante d'Avogadro ; loi d'Avogadro-Ampère ; volume molaire"] },
    ],
    "La réalisation d'un montage électronique": [
      { label: "Activités", items: ["Étapes du projet ; tableau de répartition des tâches (planning)", "Construction de nouveaux savoirs : étude expérimentale du transistor", "Construction de nouveaux savoirs : amplificateur opérationnel", "Construction de nouveaux savoirs : capteurs (microphones ; photorésistance et photodiode ; thermistance et couple thermoélectrique)", "Exemples de montages : dispositif de protection contre le vol ; détecteur de niveau d'eau", "Schéma normalisé du dispositif à fabriquer ; estimation du coût du projet"] },
    ],
    "Les ions en solution aqueuse": [
      { label: "Activités", items: ["1 : Chlorure de sodium : ions dans le corps pur et dans sa solution aqueuse ; rôle du solvant ; électrolyse du chlorure de sodium fondu et en solution", "2 : Solutions acides : acide chlorhydrique, ion H3O+, définition et mesure du pH", "3 : Solutions basiques : solution d'hydroxyde de sodium ; pH de différentes solutions", "4 : Réaction entre l'acide chlorhydrique et l'hydroxyde de sodium (dosage)", "5 : Tests d'identification des ions : chlorure, argent, sulfate, nitrate, fer II et fer III, cuivre II, zinc, aluminium"] },
    ],
    "Les chocs et collisions entre solides en mouvement": [
      { label: "Activités", items: ["1 : Mouvement : relativité ; vecteur vitesse d'un point mobile ; mouvement rectiligne uniforme ; mouvement circulaire uniforme", "2 : Centre d'inertie ; principe de l'inertie ; centre d'inertie d'un ensemble de solides", "3 : Vecteur quantité de mouvement d'un solide", "4 : Conservation du vecteur quantité de mouvement d'un système isolé (éclatement, chocs) ; exemples de variation"] },
    ],
    "La pollution des eaux superficielles et de la nappe phréatique": [
      { label: "Activités", items: ["Analyse des eaux pour prendre position face à l'utilisation de certains produits chimiques", "Généralités sur l'eau : usages ; approvisionnement ; obtention d'une eau potable", "Sources d'eau (océans, lacs, rivières, eaux souterraines, atmosphère) et caractéristiques (température, gaz dissous, acidité, salinité)", "Produits polluants : pesticides, acides, engrais, autres produits chimiques ; leurs effets", "Formes de lutte contre la pollution des eaux"] },
    ],
  },
  "1ère C": {
    "L'énergie mécanique au service du développement": [
      { label: "Activités", items: ["↳ 1 : Notions de cinématique", "1.1 : Vecteur espace et vecteur vitesse d'un point dans un repère donné", "1.2 : Mouvement de translation d'un solide", "1.3 : Mouvement de rotation autour d'un axe fixe : vitesse angulaire, vitesse linéaire", "1.4 : Moment d'une force par rapport à un axe ; moment d'un couple de forces", "↳ 2 : Travail et puissance d'une force", "2.1 : Force constante", "2.2 : Solide en translation : travail élémentaire et puissance instantanée ; travail du poids ; travail d'une force de frottement", "2.3 : Solide en rotation autour d'un axe fixe", "3 : Énergie cinétique : translation ; rotation, moment d'inertie ; théorème de l'énergie cinétique", "4 : Énergie potentielle de pesanteur", "5 : Énergie mécanique totale : conservation et non-conservation"] },
    ],
    "Étude de quelques composés organiques et leurs propriétés": [
      { label: "Activités", items: ["1 : Le carbone, élément essentiel des composés organiques : mise en évidence ; liaisons covalentes, tétravalence", "2 : Les alcanes : tétravalence ; nomenclature ; combustion ; halogénation", "3 : Hydrocarbures insaturés et dérivés : structure ; nomenclature ; additions (H2, HCl, H2O) sur alcènes et acétylène ; polymères", "4 : Composés aromatiques : noyau benzénique ; nomenclature ; additions (H2, Cl2) ; substitutions (halogénation, nitration)", "5 : Pétroles et gaz naturels : matière première de la chimie organique (ne figure pas dans la fiche de progression 2026-2027)", "6 : Composés organiques oxygénés : présentation ; obtention de l'éthanol et de l'éthanal ; oxydation de l'éthanol ; estérification, hydrolyse des esters"] },
    ],
    "Réalisation d'une source de tension électrique continue stabilisée": [
      { label: "Activités", items: ["1 : Le champ électrostatique : vecteur champ ; champ uniforme ; travail de la force électrostatique ; d.d.p. ; énergie potentielle électrostatique", "2 : Puissance électrique : loi de Joule ; loi d'Ohm pour générateur et récepteur ; bilan énergétique, loi de Pouillet ; circuits avec composants électroniques (ne figure pas dans la fiche de progression 2026-2027)", "3 : Les condensateurs : charge et décharge ; associations série et parallèle ; énergie emmagasinée ; montages dérivateur et intégrateur (circuits intégrés linéaires)", "4 : Réalisation d'une alimentation continue stabilisée : transformateur, pont de diodes, filtrage, diode Zener, transistor", "Schéma normalisé du dispositif à fabriquer ; estimation du coût du projet"] },
    ],
    "Explication de quelques phénomènes chimiques par les réactions conjuguées d'oxydation et de réduction": [
      { label: "Activités", items: ["↳ 1 : Réactions d'oxydoréduction en solution aqueuse", "1.1 : Action de solutions acides sur les métaux", "1.2 : Réaction entre un métal et un ion métallique", "1.3 : Couple oxydant-réducteur", "1.4 : Potentiel d'oxydoréduction", "1.5 : Généralisation du couple oxydant-réducteur ; dosages par oxydoréduction", "2 : Généralisation de l'oxydoréduction : réactions par voie sèche ; nombre d'oxydation", "3 : Applications : électrolyse en solution aqueuse ; piles électrochimiques ; corrosion des métaux (cas du fer)"] },
    ],
    "Température et chaleur": [
      { label: "Activités", items: ["1 : Conversions réciproques énergie mécanique ↔ énergie thermique", "2 : La calorimétrie", "3 : Lois des gaz parfaits : état gazeux ; compressibilité isotherme, loi de Mariotte ; dilatation ; équation d'état pV = nRT"] },
    ],
    "Vibration, propagation et interférences : trois phénomènes physiques utiles dans la technologie des ondes": [
      { label: "Activités", items: ["1 : Types d'ondes et propagation : mécaniques, acoustiques, lumineuses, hertziennes", "2 : Caractère périodique des ondes vibratoires entretenues", "3 : Propriétés des ondes : réflexion, transmission, réfraction, diffraction", "4 : Superposition des ondes : les interférences"] },
    ],
  },
  "1ère D": {
    "L'énergie mécanique au service du développement": [
      { label: "Activités", items: ["↳ 1 : Notions de cinématique", "1.1 : Vecteur espace et vecteur vitesse d'un point dans un repère donné", "1.2 : Mouvement de translation d'un solide", "1.3 : Mouvement de rotation autour d'un axe fixe : vitesse angulaire, vitesse linéaire", "1.4 : Moment d'une force par rapport à un axe ; moment d'un couple de forces", "↳ 2 : Travail et puissance d'une force", "2.1 : Force constante", "2.2 : Solide en translation : travail élémentaire et puissance instantanée ; travail du poids ; travail d'une force de frottement", "2.3 : Solide en rotation autour d'un axe fixe", "3 : Énergie cinétique : translation ; rotation, moment d'inertie ; théorème de l'énergie cinétique", "4 : Énergie potentielle de pesanteur", "5 : Énergie mécanique totale : conservation et non-conservation"] },
    ],
    "Étude de quelques composés organiques et leurs propriétés": [
      { label: "Activités", items: ["1 : Le carbone, élément essentiel des composés organiques : mise en évidence ; liaisons covalentes, tétravalence", "2 : Les alcanes : tétravalence ; nomenclature ; combustion ; halogénation", "3 : Hydrocarbures insaturés et dérivés : structure ; nomenclature ; additions (H2, HCl, H2O) sur alcènes et acétylène ; polymères", "4 : Composés aromatiques : noyau benzénique ; nomenclature ; additions (H2, Cl2) ; substitutions (halogénation, nitration)", "5 : Pétroles et gaz naturels : matière première de la chimie organique (ne figure pas dans la fiche de progression 2026-2027)", "6 : Composés organiques oxygénés : présentation ; obtention de l'éthanol et de l'éthanal ; oxydation de l'éthanol ; estérification, hydrolyse des esters"] },
    ],
    "Réalisation d'une source de tension électrique continue stabilisée": [
      { label: "Activités", items: ["1 : Le champ électrostatique : vecteur champ ; champ uniforme ; travail de la force électrostatique ; d.d.p. ; énergie potentielle électrostatique", "2 : Puissance électrique : loi de Joule ; loi d'Ohm pour générateur et récepteur ; bilan énergétique, loi de Pouillet ; circuits avec composants électroniques (ne figure pas dans la fiche de progression 2026-2027)", "3 : Les condensateurs : charge et décharge ; associations série et parallèle ; énergie emmagasinée ; montages dérivateur et intégrateur (circuits intégrés linéaires)", "4 : Réalisation d'une alimentation continue stabilisée : transformateur, pont de diodes, filtrage, diode Zener, transistor", "Schéma normalisé du dispositif à fabriquer ; estimation du coût du projet"] },
    ],
    "Explication de quelques phénomènes chimiques par les réactions conjuguées d'oxydation et de réduction": [
      { label: "Activités", items: ["↳ 1 : Réactions d'oxydoréduction en solution aqueuse", "1.1 : Action de solutions acides sur les métaux", "1.2 : Réaction entre un métal et un ion métallique", "1.3 : Couple oxydant-réducteur", "1.4 : Potentiel d'oxydoréduction", "1.5 : Généralisation du couple oxydant-réducteur ; dosages par oxydoréduction", "2 : Généralisation de l'oxydoréduction : réactions par voie sèche ; nombre d'oxydation", "3 : Applications : électrolyse en solution aqueuse ; piles électrochimiques ; corrosion des métaux (cas du fer)"] },
    ],
    "Température et chaleur": [
      { label: "Activités", items: ["1 : Conversions réciproques énergie mécanique ↔ énergie thermique", "2 : La calorimétrie", "3 : Lois des gaz parfaits : état gazeux ; compressibilité isotherme, loi de Mariotte ; dilatation ; équation d'état pV = nRT"] },
    ],
    "Vibration, propagation et interférences : trois phénomènes physiques utiles dans la technologie des ondes": [
      { label: "Activités", items: ["1 : Types d'ondes et propagation : mécaniques, acoustiques, lumineuses, hertziennes", "2 : Caractère périodique des ondes vibratoires entretenues", "3 : Propriétés des ondes : réflexion, transmission, réfraction, diffraction", "4 : Superposition des ondes : les interférences"] },
    ],
  },
  "Tle C": {
    "Champs de forces et interactions": [
      { label: "Activités", items: ["1 : Cinématique : vecteurs position, vitesse, accélération (tangentielle, normale) ; mouvements rectilignes (uniforme, uniformément varié, sinusoïdal) ; mouvement circulaire uniforme", "2 : Interaction gravitationnelle : loi de gravitation ; champ de gravitation ; champ de pesanteur", "3 : Champ électrostatique : force électrique, charge et champ ; condensateur plan", "4 : Champ magnétique : mise en évidence ; aimants et bobines ; vecteur champ ; spectres ; mesure ; champ terrestre ; champ uniforme", "5 : Lois de Newton : principe de l'inertie ; théorème du centre d'inertie ; principe d'interaction ; théorème de l'énergie cinétique", "6 : Mouvement des satellites et des planètes : satellites terrestres, géostationnaires ; lois de Kepler ; système solaire", "7 : Mouvement dans le champ de pesanteur terrestre", "8 : Particule chargée dans un champ électrique uniforme : étude dynamique, énergétique ; déflexion électrique", "9 : Particule chargée dans un champ magnétique uniforme : force magnétique, puissance, mouvement ; déflexion (téléviseur), spectrographe de masse, cyclotron", "10 : Action d'un champ magnétique sur un circuit ; loi de Laplace : rails de Laplace ; moteurs et haut-parleurs électrodynamiques", "11 : Induction et auto-induction : loi de Lenz ; f.é.m. d'induction ; auto-inductance ; énergie et puissance d'une bobine"] },
    ],
    "Chimie des solutions aqueuses et cinétique chimique": [
      { label: "Activités", items: ["↳ 1 : Acides et bases en solution aqueuse", "1.1 : L'eau : solvant ionisant ; produit ionique ; pH", "1.2 : Solutions d'acide chlorhydrique et d'hydroxyde de sodium ; pH", "1.3 : Couples acide/base : Ka, pKa, classification, domaines de prédominance ; acides et bases forts", "1.4 : Réactions acide-base : acide fort/base forte ; acide fort/base faible ; acide faible/base forte", "↳ 2 : Cinétique chimique", "2.1 : Vitesse de formation et de disparition d'un corps", "2.2 : Influence des concentrations et de la température ; applications", "2.3 : Catalyse : définition ; exemples ; applications industrielles"] },
    ],
    "Les oscillations mécaniques et électriques": [
      { label: "Activités", items: ["↳ 1 : Oscillations mécaniques", "1.1 : Oscillateur harmonique non amorti (pendule élastique) : équation différentielle, fréquence propre, énergie", "1.2 : Oscillateur amorti : régimes pseudo-périodique, apériodique, critique", "↳ 2 : Oscillations électriques", "2.1 : Circuit LC : équation différentielle, fréquence propre, énergie ; entretien des oscillations", "2.2 : Circuit RLC série en régime sinusoïdal forcé : impédance ; résonance d'intensité, bande passante, facteur de qualité ; puissance, facteur de puissance ; émission-réception radio"] },
    ],
    "Chimie organique": [
      { label: "Activités", items: ["1 : Notions de stéréochimie : conformation (éthane, cyclohexane) ; diastéréoisomérie Z/E", "2 : Les alcools : classes, nomenclature ; préparation ; réaction avec le sodium ; déshydratation ; oxydation (aldéhydes, cétones) ; polyalcools (glycol, glycérol)", "3 : Les amines : classes, nomenclature ; caractère basique ; caractère nucléophile (réaction d'Hofmann), passage aux amides", "4 : Les acides carboxyliques : estérification, hydrolyse, saponification ; anhydride d'acide, chlorure d'acyle ; amides", "5 : Les acides α-aminés : formule, nomenclature ; amphion ; liaison peptidique, protéines"] },
    ],
    "Optique géométrique et physique": [
      { label: "Activités", items: ["1 : Lentilles minces : foyers, marche des rayons ; conditions de Gauss ; formules de conjugaison (Descartes, Newton) ; constructions ; système de deux lentilles ; distance focale (objet à l'infini, Bessel, Silbermann) ; œil, appareil photo, microscope", "2 : Décomposition de la lumière : dispersion par un prisme (formules du prisme) ; diffraction par un réseau (incidence normale et quelconque)"] },
    ],
    "Physique atomique et nucléaire (« L'énergie de l'infiniment petit et la science »)": [
      { label: "Activités", items: ["Particules de grande énergie : quantité de mouvement, énergie ; cas du photon (figure dans le guide et la progression 2026-2027, pas dans le programme d'études)", "1 : Niveaux d'énergie atomiques : spectres ; niveaux ; transitions E2 − E1 = hν ; atome d'hydrogène", "2 : Noyau atomique : nucléons ; énergie de liaison, stabilité", "3 : Réactions nucléaires spontanées : α, β−, β+, γ ; loi de décroissance, demi-vie ; familles radioactives ; absorption des rayonnements", "4 : Réactions nucléaires provoquées : fission ; fusion ; applications"] },
    ],
  },
  "Tle D": {
    "Champs de forces et interactions": [
      { label: "Activités", items: ["1 : Cinématique : vecteurs position, vitesse, accélération ; mouvements rectilignes ; mouvement circulaire uniforme", "2 : Champ électrostatique : force électrique, charge et champ ; condensateur plan", "3 : Champ magnétique : mise en évidence ; aimants et bobines ; vecteur champ ; spectres ; mesure ; champ terrestre ; champ uniforme", "4 : Lois de Newton ; théorème de l'énergie cinétique", "5 : Mouvement dans le champ de pesanteur terrestre", "6 : Particule chargée dans un champ électrique uniforme : étude dynamique, énergétique ; déflexion électrique", "7 : Particule chargée dans un champ magnétique uniforme : force magnétique, puissance, mouvement ; applications", "8 : Induction et auto-induction : loi de Lenz ; f.é.m. ; auto-inductance ; énergie et puissance d'une bobine"] },
    ],
    "Chimie des solutions aqueuses et cinétique chimique": [
      { label: "Activités", items: ["↳ 1 : Acides et bases en solution aqueuse", "1.1 : L'eau : solvant ionisant ; produit ionique ; pH", "1.2 : Solutions d'acide chlorhydrique et d'hydroxyde de sodium ; pH", "1.3 : Couples acide/base : Ka, pKa, domaines de prédominance ; acides et bases forts", "1.4 : Réactions acide-base : fort/fort ; fort/faible ; faible/fort", "2 : Cinétique chimique : vitesse de formation et de disparition ; influence des concentrations et de la température ; catalyse"] },
    ],
    "Les oscillations mécaniques et électriques": [
      { label: "Activités", items: ["1 : Oscillations mécaniques : oscillateur harmonique non amorti ; oscillateur amorti (régimes)", "2 : Oscillations électriques : circuit LC ; RLC série en régime forcé ; résonance ; puissance, facteur de puissance ; émission-réception radio"] },
    ],
    "Chimie organique": [
      { label: "Activités", items: ["1 : Stéréochimie : conformation ; diastéréoisomérie Z/E ; carbone asymétrique, énantiomérie, chiralité, activité optique", "2 : Les alcools : classes ; préparation ; propriétés ; oxydation ; passage aux phosphates d'alkyle ; polyalcools", "3 : Les amines : classes ; caractère basique ; caractère nucléophile (Hofmann), amides", "4 : Les acides carboxyliques : estérification, hydrolyse, saponification ; dérivés ; amides", "5 : Les acides α-aminés : représentation de Fischer, configurations D et L, chiralité ; amphion ; liaison peptidique ; protéines, enzymes"] },
    ],
    "Optique géométrique et physique": [
      { label: "Activités", items: ["1 : Lentilles minces : foyers ; conditions de Gauss ; conjugaison ; constructions ; système de deux lentilles ; distance focale (Bessel, Silbermann) ; œil, appareil photo, microscope", "2 : Décomposition de la lumière : prisme ; réseau", "3 : Polarisation rectiligne de la lumière : nature électromagnétique ; lumière polarisée ; loi de Malus ; loi de Biot et Savart"] },
    ],
    "Physique atomique et nucléaire (« L'énergie de l'infiniment petit et la science »)": [
      { label: "Activités", items: ["1 : Niveaux d'énergie atomiques : spectres ; transitions ; atome d'hydrogène", "2 : Noyau atomique : nucléons ; énergie de liaison, stabilité", "3 : Réactions nucléaires spontanées : radioactivités ; décroissance, demi-vie ; familles radioactives ; absorption", "4 : Réactions nucléaires provoquées : fission, fusion, applications"] },
    ],
  },
};

export const SVT_NOTIONS: Record<string, string[]> = {
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

export const SVT_SA_DETAILS: Record<string, Record<string, SaGroup[]>> = {
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

export const DEFAULT_DURATIONS: Record<string, number> = {
  "6e": 90, "5e": 90, "4e": 120, "3e": 120,
  "2nde AB": 120, "2nde C": 180, "2nde D": 180,
  "1ère AB": 120, "1ère C": 180, "1ère D": 180,
  "Tle AB": 120, "Tle C": 240, "Tle D": 240,
};

export const SVT_DURATION_OVERRIDES: Record<string, number> = {
  "2nde AB": 90, "1ère AB": 90, "Tle AB": 90,
  "2nde D": 180, "1ère D": 180, "Tle D": 180,
};
