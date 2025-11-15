## Objectif
- Servir directement l’URL `https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-ancien-neuf-2025.html` en 200, sans dépendre d’une redirection.
- Conserver un SEO propre via `rel=canonical` vers l’article global.

## Modifications prévues
- vercel.json:
  - Retirer la redirection 301 actuelle qui renvoie `/pages/blog/departements/frais-notaire-ancien-neuf-2025.html` → `/pages/blog/frais-notaire-ancien-neuf-2025.html`.
  - Garder les autres redirects déjà ajoutés (anciennes URLs départements → nouvelles; pivot départements → page pivot).

- scripts/copy-seo-pages.js:
  - Ajouter une routine de duplication de l’article global:
    - Source: `src/pages/blog/frais-notaire-ancien-neuf-2025.html`.
    - Destination: `dist/pages/blog/departements/frais-notaire-ancien-neuf-2025.html`.
    - Réécritures:
      - `<script type="module" src="../../main.ts">` → `<script type="module" crossorigin src="../../../assets/main-*.js">`.
      - Chemins assets `../../assets/...` → `../../../assets/...`.
      - Injection `<link rel="stylesheet" href="../../../assets/main-*.css">` si absente.
    - Conserver `<link rel="canonical" href="https://lescalculateurs.fr/pages/blog/frais-notaire-ancien-neuf-2025.html">` pour éviter la duplication SEO.
  - Ajouter des commentaires de niveau fonction sur la nouvelle routine.

- scripts/test-core-pages.js:
  - Ajouter l’URL `/pages/blog/departements/frais-notaire-ancien-neuf-2025.html` aux tests pour valider le 200.

## Vérifications
- Exécuter la copie (génère la page en `dist`).
- Lancer les tests:
  - core pages: 200 attendu sur l’URL en `/departements`.
  - sitemap: aucun ajout (on ne modifie pas le sitemap pour éviter la duplication), l’article global reste 200.

## Déploiement
- Commit & push.
- Après déploiement, revalider l’URL en production (200) et vérifier que le canonical pointe vers l’article global.

Je procède à ces modifications et à la validation locale, puis je t’envoie le rapport (statuts HTTP et chemins vérifiés).