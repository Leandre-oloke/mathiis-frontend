# Mathiis — Frontend

Interface web (Next.js) de **Mathiis**, une plateforme de génération automatique
d'épreuves scolaires (Mathématiques, PCT, SVT) pour le système éducatif
béninois, propulsée par un modèle d'IA en arrière-plan.

Ce dépôt contient **uniquement le frontend**. Il ne contient ni le backend, ni
le moteur de génération IA (RAG, prompts, bases vectorielles), ni aucune base
de données — ce sont des services séparés, non inclus ici par choix.

## Stack technique

| Techno | Usage |
|---|---|
| Next.js 16 (App Router) | Framework React |
| TypeScript | Typage statique |
| Tailwind CSS | Styles |
| Zustand | État global (auth, quotas, épreuves) |
| React Hook Form + Zod | Formulaires et validation |
| Axios / TanStack Query | Appels API |
| lucide-react | Icônes |
| react-markdown + KaTeX | Rendu des épreuves (formules, figures) |
| Vitest + Testing Library | Tests |

## Prérequis

- Node.js 20+ et npm
- L'URL d'une instance du **backend Mathiis** déjà en ligne (voir plus bas —
  tu n'as pas besoin de le faire tourner toi-même)

## Installation

```bash
git clone https://github.com/Leandre-oloke/mathiis-frontend.git
cd mathiis-frontend
npm install
```

## Configuration

Copie le fichier d'exemple puis renseigne l'URL de l'API :

```bash
cp .env.local.example .env.local
```

```dotenv
# .env.local
NEXT_PUBLIC_API_URL=https://api.mathiis.com/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=          # optionnel, laisse vide si tu ne testes pas "Se connecter avec Google"
```

> Connecte-toi avec ton compte habituel sur la plateforme — le frontend
> local parle directement au vrai backend en ligne, aucun identifiant
> supplémentaire n'est nécessaire. Ne commite jamais `.env.local`.

## Lancer en développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement, rechargement à chaud |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm test` | Lance les tests une fois (Vitest) |
| `npm run test:watch` | Relance les tests à chaque modification |

## Tests

Les tests vivent dans `tests/`, à côté de `src/` et jamais dedans :

```
tests/
├── setup.ts                       # jest-dom, nettoyage entre les tests
├── lib/utils.test.ts              # formatage (dates, tailles de fichiers), classes
├── exam/math-and-figures.test.ts  # formules coupées pendant le flux, lecture des [FIGURE]
├── exam/exam-markdown.test.tsx    # rendu d'une épreuve : numérotation, KaTeX, figures
├── store/stores.test.ts           # stores auth et quota
├── components/sidebar.test.tsx    # barre latérale et menu du compte
└── auth/auth-forms.test.tsx       # connexion et inscription (validation, envoi)
```

L'API est remplacée par des fonctions simulées **dans les tests uniquement**
(`vi.mock("@/lib/api")`) : aucune donnée de test ni de démonstration n'est
présente dans `src/`, l'application parle toujours au vrai backend.

## Identité visuelle

Tout le site est en **noir et blanc** : encre noire sur fond blanc. Les jetons
(`--background`, `--foreground`, `--muted`…) et les classes communes
(`btn-ink`, `btn-framed`, `card-ink`) sont dans `src/app/globals.css`. Les
couleurs vives de Tailwind y sont redéfinies en gris ; seul le rouge reste,
pour les erreurs et les suppressions. Polices : Space Grotesk (titres),
IBM Plex Sans (texte), IBM Plex Mono, Libre Baskerville (épreuves).

## Structure du projet

```
src/
├── app/
│   ├── page.tsx       # Page d'accueil publique
│   ├── auth/          # Connexion, inscription, mot de passe oublié (cadre commun : layout.tsx)
│   └── dashboard/      # Espace utilisateur (générer, mes épreuves, documents...)
│       └── generate/   # Formulaire de génération d'épreuve
├── components/         # Composants réutilisables
│   ├── exam/           # ExamMarkdown (rendu d'épreuve) et Figure3D
│   ├── home/           # En-tête, pied de page et animations de l'accueil
│   └── layout/         # Barre latérale et menu du compte
├── store/               # État global Zustand (auth, quotas, épreuves)
└── lib/                 # Client API, utilitaires, streaming SSE
```

## Ce que ce dépôt n'a pas (par conception)

- Le panneau d'administration (`/admin`) — développement réservé, géré séparément
- Le code du backend (API, base de données, authentification serveur)
- Le moteur de génération IA (RAG, prompts, bases vectorielles)
- Les clés API, secrets, ou identifiants de production

Le frontend communique avec le backend **uniquement** via l'API REST
(`NEXT_PUBLIC_API_URL`). Toute question sur le comportement d'un endpoint,
son format de réponse, ou une fonctionnalité qui dépend du backend : contacte
l'équipe plutôt que de chercher le code correspondant, il n'est pas dans ce
dépôt.

## Contact

Pour toute question sur l'API, l'environnement de test, ou l'accès —
contacte **Leandre** directement.
