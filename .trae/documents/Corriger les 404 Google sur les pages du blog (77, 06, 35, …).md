## Diagnostic
- Les URL signalées par Google Search Console sont du type: `https://lescalculateurs.fr/pages/blog/frais-notaire-XX.html`.
- Nos pages départementales existent sous: `https://lescalculateurs.fr/pages/blog/departements/frais-notaire-XX.html`.
- Le sitemap et/ou des liens internes pointent vers le **mauvais chemin** sans `/departements`, causant des 404.

## Correctifs à appliquer
- Sitemap: mettre à jour `public/sitemap.xml` pour lister uniquement les URL **avec** `/departements/`.
- Liens internes: corriger toutes les références dans le code qui pointent vers `/pages/blog/frais-notaire-XX.html` → `/pages/blog/departements/frais-notaire-XX.html`.
- Canonical/OG/Twitter: vérifier et homogénéiser (déjà ok en `/departements`, confirmer globalement).
- Redirects 301: ajouter une redirection **permanente** de `/pages/blog/frais-notaire-:code.html` vers `/pages/blog/departements/frais-notaire-:code.html`.
  - Si déployé sur Vercel: `vercel.json` → `redirects`.
  - Si Netlify: fichier `_redirects` dans `public/`.

## Vérifications
- Régénérer les pages et le sitemap, déployer.
- Inspecter quelques URL d’exemple (77, 06, 35, 79, 01…) pour vérifier 200 OK.
- Resoumettre le sitemap dans GSC, puis lancer “Inspecter l’URL” sur quelques cas.
- Option: exécuter `scripts/verify-links.js` pour audit automatique des liens externes et internes.

Souhaitez-vous que je fasse ces corrections (sitemap, liens, redirects), régénère et pousse, puis je vous donne les URL de test et l’état d’indexation ?