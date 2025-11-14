## Diagnostic
- Les pages de blog départementales (`src/pages/blog/departements/*.html`) sont générées avec des liens **hardcodés** vers des bundles hashés: `/<assets>/main-*.js` et `/<assets>/main-*.css` (voir `scripts/generate-departement-articles.js:1339–1342`).
- Ces fichiers n’existent pas en développement (Vite Dev), et leurs noms peuvent diverger en production après chaque build, d’où des pages **sans style**.
- Elles ne sont pas déclarées comme entrées dans `vite.config.ts` (seules `blog.html`, `blog-departements.html`, etc., sont listées), donc Vite ne réécrit pas automatiquement les assets.

## Correctifs cibles
- **Dev (Vite server)**: injecter `main.ts` en module (`<script type="module" src="../../../main.ts"></script>`) et **supprimer** le `<link rel="stylesheet">` hardcodé; `main.ts` importe `tailwind.css`, les styles seront chargés.
- **Prod (build)**: si `dist/manifest.json` est présent, **résoudre dynamiquement** les noms hashés du bundle CSS/JS et injecter `/<assets>/{js,css}` corrects dans le `<head>`. Sinon, fallback dev (`main.ts`).
- Garder les chemins **absolus** pour favicon et canonical; ne rien changer à l’HTML de contenu.

## Implémentation (avec commentaires de fonctions)
- Modifier `generateArticleHTML(dep, index)` pour déléguer l’injection d’assets à une fonction utilitaire:
  - `resolveAssetsForEnv()`
    - En dev: retourne la balise `<script type="module" src="../../../main.ts"></script>`.
    - En prod: lit `../dist/manifest.json` (ou chemin résolu à partir du repo), extrait `main.css` et `main.js` (entrée `index.html`/`main.ts`), et construit `<script type="module" crossorigin src="/assets/<hash>.js"></script>` + `<link rel="stylesheet" crossorigin href="/assets/<hash>.css">`.
    - Fallback dev si le manifest n’est pas trouvé.
- Remplacer les deux lignes hardcodées du `<head>` par la sortie de `resolveAssetsForEnv()`.
- Conserver tous les autres éléments SEO (LD+JSON, OpenGraph, favicons) **inchangés**.

## Vérifications
- **Dev**: démarrer Vite (après vérification qu’aucun serveur n’est déjà actif), ouvrir `src/pages/blog/departements/frais-notaire-75.html` et valider l’application des classes Tailwind (`bg-gray-50`, `max-w-4xl`, etc.).
- **Prod**: lancer `vite build`, confirmer la présence de `dist/assets/*` et de `dist/manifest.json`; ouvrir `dist/pages/blog/departements/frais-notaire-75.html` et vérifier le chargement du CSS/JS hashés.
- Sanity check: tester au moins 3 départements et la page `blog.html` pour cohérence visuelle.

## Points d’attention
- Compatibilité Windows: résolutions de chemins via `path.resolve` et `fileURLToPath`; pas de chemins relatifs fragiles.
- Base `"/"` conservée dans `vite.config.ts`.
- Pas d’impact sur le référencement: balises canonical/OG/LD+JSON inchangées.

## Livrables
- Mise à jour de `scripts/generate-departement-articles.js` avec **commentaires de niveau fonction**.
- Génération régénérée des 101 pages avec styles fonctionnels en dev et prod.
- Vérifications réalisées et rapport bref (pages testées, captures/observations).