// Excerpt of an exam produced by the Mathiis model (Mathématiques, Tle D, « Configurations de l'espace »),
// kept verbatim and shown on the home page. LaTeX and [FIGURE: …] markers are rendered by ExamMarkdown.
export const SAMPLE_EXAM = {
  subject: "Mathématiques",
  level: "Tle D",
  title: "Configurations de l’espace",
  markdown: String.raw`## Contexte

À Abomey-Calavi, Zinsou fabrique des structures métalliques et des supports pour les ateliers et les marchés de la commune. Pour organiser son espace de travail, il repère quatre pièces importantes par les points $A(2;-1;3)$, $B(-1;4;0)$, $C(5;1;-2)$ et $D(0;2;4)$. Les pièces $A$, $B$, $C$ et $D$ reçoivent respectivement les coefficients $2$, $1$, $3$ et $2$ lors de l’étude de l’équilibre d’un assemblage. Zinsou regroupe ensuite les deux premières pièces autour d’un point $H$ et les deux dernières autour d’un point $K$, afin de déterminer la position du point d’équilibre général $G$.

## Tâche

Tu es sollicité(e) par Zinsou pour vérifier la position d’équilibre des pièces métalliques $A$, $B$, $C$ et $D$, puis déterminer les points $H$, $K$ et $G$ nécessaires à l’assemblage.

## Problème I

On considère, dans l’espace rapporté au repère orthonormé $(O;\vec i,\vec j,\vec k)$, les points $A(2;-1;3)$, $B(-1;4;0)$, $C(5;1;-2)$ et $D(0;2;4)$.

[FIGURE: type=repere3d points=A(2,-1,3),B(-1,4,0),C(5,1,-2),D(0,2,4)]

1. Justifie qualitativement que le barycentre du système $\{(A;2),(B;1),(C;3),(D;2)\}$ est inchangé si tous les coefficients sont multipliés par un même nombre réel non nul.
2. Pour tout point $M$ de l’espace, réduis la somme vectorielle $$2\overrightarrow{MA}+\overrightarrow{MB}-3\overrightarrow{MC}+4\overrightarrow{MD}$$ en l’exprimant à l’aide du barycentre du système $\{(A;2),(B;1),(C;-3),(D;4)\}$.
3. Soit $H$ le barycentre du système $\{(A;2),(B;1)\}$ et $K$ celui du système $\{(C;3),(D;2)\}$. Montre que le barycentre $G$ du système $\{(A;2),(B;1),(C;3),(D;2)\}$ est aussi le barycentre du système $\{(H;3),(K;5)\}$.
4. Détermine les coordonnées de $H$, de $K$ et de $G$ dans le repère $(O;\vec i,\vec j,\vec k)$.
`,
};
