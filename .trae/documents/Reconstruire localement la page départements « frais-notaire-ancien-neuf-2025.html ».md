## Objectif
- Servir la page à l’URL: `/pages/blog/departements/frais-notaire-ancien-neuf-2025.html` sans 404, tout en évitant les problèmes SEO (contenu dupliqué).

## Modifications
- Supprimer dans `vercel.json` la redirection 301 qui renvoie l’URL `/departements/frais-notaire-ancien-neuf-2025.html` vers l’article global (pour autoriser la page physique).
- Étendre `scripts/copy-seo-pages.js` pour dupliquer l’article global `src/pages/blog/frais-notaire-ancien-neuf-2025.html` vers `dist/pages/blog/departements/frais-notaire-ancien-neuf-2025.html` avec:
  - Réécriture des imports: `../../main.ts` → bundle JS hashé (`dist/assets/main-*.js`).
  - Ajustement des chemins assets: `../../assets/...` → `../../../assets/...`.
  - Injection `<link rel="stylesheet" href="../../../assets/main-*.css">` si absente.
  - Conserver `<link rel="canonical" href="https://lescalculateurs.fr/pages/blog/frais-notaire-ancien-neuf-2025.html">` (évite la duplication SEO).
- Ajouter des commentaires de niveau fonction aux nouvelles fonctions (lecture fichier, duplication article, injection assets).

## Vérifications
- Générer et copier:
  - Vérifier que `dist/pages/blog/departements/frais-notaire-ancien-neuf-2025.html` existe et charge CSS/JS.
- Tests HTTP (scripts existants):
  - `scripts/test-core-pages.js`: ajouter l’URL de test et confirmer 200.
  - `scripts/test-sitemap.js`: aucune entrée nouvelle (on ne modifie pas le sitemap pour éviter la duplication), mais l’URL globale reste 200.

## Déploiement
- Commit & push (suppression de la redirection et copie étendue).
- Tester en production: les deux URLs servent le contenu, avec canonical vers l’article global.

Je procède à ces modifications et tests, puis je fournis le rapport de validation (200 attendu pour l’URL en /departements).