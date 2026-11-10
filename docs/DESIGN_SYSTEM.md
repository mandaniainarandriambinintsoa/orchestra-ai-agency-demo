# Direction visuelle du dashboard

## Référence validée

Le dashboard reprend la famille visuelle de l'application Meckia située dans
`D:\webApp\meckia`, à la demande du propriétaire. Meckia reste une référence en
lecture seule : aucun fichier source ou composant n'est modifié ni copié tel quel.

L'objectif est de conserver son calme visuel et sa précision opérationnelle tout
en adaptant la hiérarchie aux usages CRM, agents IA, conversations et stock.

## Principes

- Interface B2B sobre, chaleureuse et lisible.
- Fond ivoire plutôt que blanc clinique.
- Encre vert très sombre pour le texte et les actions principales.
- Accents sauge pour les sélections, statuts positifs et zones actives.
- Cartes blanches, bordures fines, ombres presque imperceptibles.
- Typographie peu grasse, avec des titres éditoriaux et compacts.
- Icônes linéaires cohérentes, sans mélange de bibliothèques.
- Densité maîtrisée : l'information opérationnelle prime sur la décoration.

## Palette initiale

| Rôle | Valeur |
| --- | --- |
| Fond application | `#f8f9f5` |
| Fond sidebar et topbar | `#fcfcf9` |
| Surface carte | `#ffffff` |
| Encre principale | `#202820` |
| Texte secondaire | `#626d60` |
| Bordure | `#e1e5dc` |
| Accent sauge clair | `#e9efe2` |
| Accent vert | `#496d43` |
| Accent vert profond | `#304b2d` |
| Alerte | teinte sémantique dédiée, utilisée avec parcimonie |

Les couleurs sémantiques d'erreur, d'attente et d'information devront conserver
un contraste WCAG AA et rester compatibles avec cette base.

## Typographie

La référence Meckia utilise une pile système. Pour le prototype, la priorité reste
la netteté, la rapidité et une apparence professionnelle :

- texte courant : sans-serif moderne et très lisible ;
- titres : même famille, graisse 500 à 600, tracking légèrement négatif ;
- chiffres : variantes tabulaires pour les métriques ;
- sourcils et groupes de navigation : capitales de 9 à 11 px avec tracking large ;
- taille des titres de page : environ 32 à 40 px sur desktop, fluide sur mobile.

La police finale sera chargée avec `next/font` si elle améliore réellement le
résultat ; aucun chargement externe bloquant ne sera ajouté.

## Structure

- Sidebar desktop : environ 248 px, fixe dans le viewport.
- Topbar : environ 72–74 px.
- Contenu : largeur maximale 1 440 px et marges fluides.
- Grille KPI : quatre colonnes desktop, deux tablette, une mobile.
- Cartes : rayon 16–18 px, bordure 1 px, ombre très légère.
- Champs : hauteur minimale 44 px, rayon 10 px.
- Boutons primaires : forme capsule réservée aux actions importantes.
- Navigation mobile : panneau accessible et scrollable, pas de sidebar comprimée.

## Iconographie

Le projet utilisera `@tabler/icons-react`, déjà employé par Meckia et adapté à son
style linéaire. Une seule taille et un seul poids optique seront définis par
contexte :

- navigation : 17–18 px ;
- actions : 16–18 px ;
- cartes d'état : 20–22 px ;
- illustrations fonctionnelles : 24 px maximum.

Les emojis et les icônes remplies décoratives ne seront pas utilisés dans
l'interface opérationnelle.

## Adaptation au produit IA

Le design ne doit pas ressembler à un tableau de bord générique « futuriste ».
Les agents et workflows seront présentés comme des composants opérationnels :

- statut vérifié, simulé ou indisponible ;
- dernière activité datée ;
- source des données visible ;
- coût ou effet externe signalé avant action ;
- erreurs et états vides traités comme des cas normaux ;
- distinction visuelle explicite entre données de démonstration et intégrations réelles.

## Règles de fidélité

1. Préserver la palette ivoire/encre/sauge et le rythme calme de Meckia.
2. Utiliser les composants du nouveau projet, sans importer le code de Meckia.
3. Ne pas reproduire la marque, le logo ni le vocabulaire flotte de Meckia.
4. Garder une navigation groupée et des intitulés courts.
5. Vérifier chaque page sur desktop et mobile dans son contexte complet.
