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
NEXT_PUBLIC_API_URL=<URL fournie par l'équipe>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=          # optionnel, laisse vide si tu ne testes pas "Se connecter avec Google"
```

> L'URL de l'API et les identifiants de test (email/mot de passe) te sont
> communiqués séparément, en privé — ne les commite jamais dans ce dépôt.

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

## Structure du projet

```
src/
├── app/
│   ├── auth/          # Connexion, inscription, mot de passe oublié
│   ├── dashboard/      # Espace utilisateur (générer, mes épreuves, documents...)
│   │   └── generate/   # Formulaire de génération d'épreuve
│   └── admin/          # Panneau d'administration
├── components/         # Composants réutilisables (layout, formulaires, admin)
├── store/               # État global Zustand (auth, quotas, épreuves)
└── lib/                 # Client API, utilitaires, streaming SSE
```

## Ce que ce dépôt n'a pas (par conception)

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
