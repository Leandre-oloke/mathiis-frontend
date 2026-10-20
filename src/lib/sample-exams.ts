// A real exam produced by the Mathiis model (Mathématiques, Tle D, SA1 « Configurations de l'espace »), kept verbatim:
// LaTeX between $…$ / $$…$$ and [FIGURE: …] markers are rendered by MathText and Figure3D.
import type { Step } from './exam-generator';

const r = String.raw;

export const MATHS_TLE_D: Step[] = [
  { id: 'contexte', label: 'Contexte', title: 'Contexte', lines: [
    r`À Abomey-Calavi, Zinsou fabrique des structures métalliques et des supports pour les ateliers et les marchés de la commune. Pour organiser son espace de travail, il repère quatre pièces importantes par les points $A(2;-1;3)$, $B(-1;4;0)$, $C(5;1;-2)$ et $D(0;2;4)$. Les pièces $A$, $B$, $C$ et $D$ reçoivent respectivement les coefficients $2$, $1$, $3$ et $2$ lors de l’étude de l’équilibre d’un assemblage. Zinsou regroupe ensuite les deux premières pièces autour d’un point $H$ et les deux dernières autour d’un point $K$, afin de déterminer la position du point d’équilibre général $G$. Dans son atelier, certaines surfaces de montage sont décrites par des équations telles que $2x-3y+z=5$, $x+y-z=1$, $3x+2y=6$ et $3x+2y=9$. Wassiath, qui l’aide à vérifier les installations, utilise aussi les directions des barres reliant les points $A$, $B$, $C$, $D$ et $E$ pour contrôler l’alignement, l’inclinaison et la stabilité des structures. Ainsi, les calculs permettent à Zinsou et à Wassiath de mieux positionner les pièces, les barres et les plans de fabrication dans l’atelier artisanal.`,
  ] },
  { id: 'tache', label: 'Tâche', title: 'Tâche', lines: [
    r`Tu es sollicité(e) par Zinsou pour vérifier la position d’équilibre des pièces métalliques $A$, $B$, $C$ et $D$, puis déterminer les points $H$, $K$ et $G$ nécessaires à l’assemblage. À l’aide des coordonnées fournies, tu dois aussi contrôler l’alignement des barres et identifier les surfaces de montage correspondant aux équations données afin de garantir la stabilité de la structure.`,
  ] },
  { id: 'exercice_1', label: 'Problème I', title: 'Problème I', lines: [
    r`On considère, dans l’espace rapporté au repère orthonormé $(O;\vec i,\vec j,\vec k)$, les points $A(2;-1;3)$, $B(-1;4;0)$, $C(5;1;-2)$ et $D(0;2;4)$.`,
    r`[FIGURE: type=repere3d points=A(2,-1,3),B(-1,4,0),C(5,1,-2),D(0,2,4)]`,
    r`1) Justifie qualitativement que le barycentre du système $\{(A;2),(B;1),(C;3),(D;2)\}$ est inchangé si tous les coefficients sont multipliés par un même nombre réel non nul.`,
    r`2) Pour tout point $M$ de l’espace, réduis la somme vectorielle $$2\overrightarrow{MA}+\overrightarrow{MB}-3\overrightarrow{MC}+4\overrightarrow{MD}$$ en l’exprimant à l’aide du barycentre du système $\{(A;2),(B;1),(C;-3),(D;4)\}$.`,
    r`3) Soit $H$ le barycentre du système $\{(A;2),(B;1)\}$ et $K$ celui du système $\{(C;3),(D;2)\}$. Montre que le barycentre $G$ du système $\{(A;2),(B;1),(C;3),(D;2)\}$ est aussi le barycentre du système $\{(H;3),(K;5)\}$.`,
    r`4) Détermine les coordonnées de $H$, de $K$ et de $G$ dans le repère $(O;\vec i,\vec j,\vec k)$.`,
    r`5) En utilisant les coefficients de la relation barycentrique obtenue, caractérise la position de $G$ par rapport à $H$ et $K$.`,
    r`6) Détermine le point $X$ de l’espace vérifiant $$2\overrightarrow{XA}+\overrightarrow{XB}-3\overrightarrow{XC}+4\overrightarrow{XD}=\vec 0.$$`,
    r`7) Détermine et caractérise le lieu géométrique des points $M$ de l’espace tels que $$\overrightarrow{MA}+\overrightarrow{MB}=2\overrightarrow{MC}.$$`,
  ] },
  { id: 'exercice_2', label: 'Problème II', title: 'Problème II', lines: [
    r`Dans un repère orthonormé de l'espace, on considère le plan P défini par l'équation $2x - 3y + z = 5$.`,
    r`Le plan Q est défini par l'équation $x + y - z = 1$. La droite D est l'intersection de P et Q. Le plan R est défini par l'équation $3x + 2y = 6$. Le plan S est défini par l'équation $3x + 2y = 9$.`,
    r`1) Détermine une représentation paramétrique du plan P en choisissant x et y comme paramètres.`,
    r`2) Détermine une représentation paramétrique de la droite D, intersection des plans P et Q, en choisissant y comme paramètre.`,
    r`3) Détermine la position relative des plans R et S, puis justifie-la à l'aide de leurs vecteurs normaux et de leurs équations.`,
    r`[FIGURE: type=repere3d points=A(0,0,5),B(1,0,3),C(0,1,8),D(0,0,-1),E(1,0,0),F(0,1,0),G(2,0,3),H(2.67,1,4.67),I(3.33,2,6.33),J(2,0,0),K(0,3,0),L(2,0,2),M(3,0,0),N(0,4.5,0),O(3,0,2) plans=ABC;DEF;JKL;MNO vecteurs=GH]`,
  ] },
  { id: 'exercice_3', label: 'Problème III', title: 'Problème III', lines: [
    r`Soit $O$ un point de l’espace muni du repère orthonormé direct $(O;\vec i,\vec j,\vec k)$. On considère les points $A(1;-1;2)$, $B(5;1;0)$, $C(2;4;3)$, $D(-1;2;1)$ et $E(3;0;6)$.`,
    r`On définit également le point $F$ par $\overrightarrow{AF}=\overrightarrow{AB}+\overrightarrow{AD}$.`,
    r`1) Détermine les coordonnées des vecteurs $\overrightarrow{AB}$, $\overrightarrow{AC}$, $\overrightarrow{AD}$ et $\overrightarrow{AE}$, puis calcule leurs normes.`,
    r`2) Calcule les produits scalaires $\overrightarrow{AB}\cdot\overrightarrow{AD}$ et $\overrightarrow{AC}\cdot\overrightarrow{AD}$, puis précise la relation entre les droites de vecteurs directeurs $\overrightarrow{AB}$ et $\overrightarrow{AD}$.`,
    r`3) Montre que les points $A$, $B$, $D$ et $E$ ne sont pas coplanaires en utilisant une combinaison linéaire adaptée des vecteurs $\overrightarrow{AB}$, $\overrightarrow{AD}$ et $\overrightarrow{AE}$.`,
    r`4) Détermine un vecteur normal au plan $(ABD)$, puis vérifie que le point $C$ n’appartient pas à ce plan.`,
    r`5) Déduis-en une équation cartésienne du plan $(ABD)$.`,
    r`6) Calcule l’aire du parallélogramme construit sur les vecteurs $\overrightarrow{AB}$ et $\overrightarrow{AD}$, puis interprète le résultat dans la configuration.`,
    r`7) Pour $M_t=A+t\overrightarrow{AB}+\overrightarrow{AD}$, où $t$ est un réel, étudie le cas particulier $t=0$ et détermine la distance $AM_t$ ainsi que la norme du vecteur $\overrightarrow{M_tF}$.`,
    r`[FIGURE: type=repere3d points=A(1,-1,2),B(5,1,0),C(2,4,3),D(-1,2,1),E(3,0,6),F(3,4,-1) vecteurs=AB,AD,AE planes=ABD aretes=AB,BF,FD,DA]`,
  ] },
];
