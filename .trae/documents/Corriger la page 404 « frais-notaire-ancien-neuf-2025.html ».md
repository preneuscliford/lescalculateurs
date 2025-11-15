## Diagnostic
- Actuellement, `https://www.lescalculateurs.fr/pages/blog/frais-notaire-ancien-neuf-2025.html` redirige vers `/pages/blog/departements/frais-notaire-ancien-neuf-2025.html` qui n’existe pas → 404.
- Le sitemap référence la version sans `departements/` (article global), ce qui est correct.

## Correctif
- Ajouter une redirection permanente (301) dans `vercel.json`:
  - source: `/pages/blog/departements/frais-notaire-ancien-neuf-2025.html`
  - destination: `/pages/blog/frais-notaire-ancien-neuf-2025.html`
- Commit + push pour déclencher le déploiement Vercel.
- Revalider par script la chaîne de redirection et le statut final 200.

## Vérification
- Exécuter `scripts/test-sitemap.js` après déploiement pour confirmer 200.
- Si nécessaire, ajuster toute autre redirection conflictuelle.

Je mets en place la redirection, pousse, puis je te fournis le rapport de validation.