# Orchestra — AI Automation Agency Demo

Prototype SaaS de supervision pour une agence d'automatisation IA : CRM,
conversations, rendez-vous, relances, agents n8n et gestion de stock.

Le projet est conçu comme un test technique professionnel. Il ne prétend pas être
une plateforme de production et indique explicitement ce qui est simulé,
configuré ou réellement vérifié.

## État actuel

| Périmètre | État |
| --- | --- |
| Dashboard responsive et navigation | Fonctionnel localement |
| Vue d'ensemble et graphiques | Données de démonstration |
| Recherche et filtres CRM | Fonctionnels sur données locales |
| Conversations, rendez-vous, relances | Interfaces de démonstration |
| Agents n8n | Audit réel, aucune exécution depuis l'app |
| Stock | Scénario et données de démonstration |
| API de qualification | Résultat local en mode démo ; adaptateur n8n préparé |
| Schéma PostgreSQL | Migration versionnée et appliquée au projet Supabase `n8n` |
| Supabase distant | 12 tables `orchestra_*`, RLS forcé, accès navigateur révoqué |
| GitHub public et Vercel | Non publiés, accord propriétaire requis |

## Stack

- Next.js 16.4, React 19 et TypeScript strict
- Tailwind CSS 4 et composants source compatibles shadcn/ui
- Tabler Icons et Recharts
- Zod pour les frontières d'entrée/sortie
- Supabase/PostgreSQL avec migrations et RLS
- n8n derrière un adaptateur serveur

## Démarrage local

Prérequis : Node.js 24 et pnpm 10.

```bash
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Ouvrir `http://localhost:3000`. Les valeurs sûres par défaut conservent le mode
démonstration et bloquent les effets externes.

## Vérifications

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
```

Le test end-to-end reconstruit l'application en mode production, puis vérifie le
dashboard desktop/mobile, le menu responsive, les filtres prospects et l'API de
qualification en mode démonstration.

La CLI Supabase 3.1.0 est épinglée au projet. Les commandes distantes doivent
toujours préciser `--remote` :

```bash
pnpm supabase migration list --remote
pnpm supabase db push --remote --dry-run
pnpm supabase db advisors --remote --type all
```

Le projet partagé contient également le schéma interne n8n. Les tables de cette
application sont donc préfixées par `orchestra_` et la migration ne modifie aucun
objet n8n existant.

## Sécurité et mode démo

- aucun secret n'est envoyé au navigateur ;
- les URLs et clés n8n restent côté serveur ;
- les relances, emails et calendriers réels sont désactivés ;
- la qualification démo est déterministe et n'appelle aucun fournisseur ;
- un jeton serveur est requis avant d'autoriser une qualification n8n hors démo ;
- les tables Supabase ont RLS activé et aucun droit client par défaut ;
- aucune donnée client réelle n'est incluse.

## Documentation

- [Audit n8n](docs/N8N_AUDIT.md)
- [Architecture technique](docs/ARCHITECTURE.md)
- [Direction visuelle](docs/DESIGN_SYSTEM.md)

## Structure

```text
src/app/                  Pages et Route Handlers
src/components/           Shell, composants UI et graphiques
src/lib/                  Types, données démo, configuration et services
supabase/migrations/      Schéma PostgreSQL versionné
docs/                     Audit, architecture et design system
```

## Publication

Le dépôt public et le déploiement Vercel seront réalisés uniquement après :

1. validation locale complète ;
2. création d'une base Supabase dédiée ;
3. revue des secrets et données ;
4. autorisation explicite du propriétaire.
