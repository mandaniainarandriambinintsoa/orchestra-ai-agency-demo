# Orchestra — AI Automation Agency Demo

Prototype SaaS opérationnel pour superviser une agence d’automatisation IA :
qualification de prospects, conversations, rendez-vous, relances et stock.

## Fonctionnalités

| Périmètre | Fonctionnement |
| --- | --- |
| Qualification | Formulaire → Supabase → agent IA n8n → score, intérêt, sujet, résumé et prochaine action |
| Conversation | Scénarios colis, dentiste et garagiste via le workflow n8n Manda |
| Rendez-vous | Disponibilités Google Calendar, réservation et confirmation email depuis l’agent conversationnel |
| Relances | Génération manuelle et cron quotidien, avec validation humaine avant envoi |
| Dashboard | Statistiques et journal d’activité lus depuis Supabase |
| Stock | Produits réels, ajout, modification API, archivage, entrées/sorties atomiques et seuils |

## Stack

- Next.js 16.4, React 19 et TypeScript strict
- Tailwind CSS 4 et Tabler Icons
- Supabase/PostgreSQL avec migrations, contraintes et RLS
- n8n Manda pour les agents IA
- Zod aux frontières HTTP et n8n
- Playwright pour les parcours desktop/mobile

## Démarrage local

Prérequis : Node.js 24 et pnpm 10.

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Toutes les clés Supabase et n8n sont utilisées côté serveur uniquement.

## Vérifications

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright test
```

Les tests navigateur interceptent les mutations afin de ne pas créer de données
dans l’instance Supabase distante.

## Base de données

La CLI Supabase 3.1.0 est épinglée au projet. Les opérations distantes utilisent
explicitement `--remote` :

```powershell
pnpm supabase migration list --remote
pnpm supabase db push --remote --dry-run
pnpm supabase db advisors --remote --type all
```

Les tables applicatives sont préfixées par `orchestra_` afin de rester isolées
du schéma interne n8n. Les rôles navigateur n’ont aucun droit direct ; les routes
serveur utilisent la clé secrète Supabase. Les mouvements de stock passent par
une fonction SQL atomique qui refuse les quantités négatives.

## Sécurité et limites du prototype

- validation stricte et taille de requête bornée ;
- limitation de débit applicative par instance ;
- secrets et appels n8n côté serveur ;
- RLS forcé sur toutes les tables Orchestra ;
- relances générées en `pending_approval`, sans envoi automatique ;
- archivage des produits au lieu d’une suppression de l’historique ;
- aucune authentification opérateur : avant une exploitation client réelle, il
  faut ajouter l’authentification et une limitation de débit distribuée.

## Publication

- Application : <https://orchestra-ai-agency-demo.vercel.app>
- Dépôt : <https://github.com/mandaniainarandriambinintsoa/orchestra-ai-agency-demo>
- Workflow qualification n8n : `gNn5pZQBbYUNMoiA`
- Workflow conversation Orchestra V4 : `mKyiaQylF1ieKwuM`

## Dossier de livraison

- [Architecture — PDF](docs/livrables/orchestra-architecture-livraison.pdf)
- [Architecture — source HTML](docs/livrables/orchestra-architecture-livraison.html)
