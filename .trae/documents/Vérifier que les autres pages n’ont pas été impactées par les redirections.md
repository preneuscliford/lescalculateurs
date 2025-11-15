## Objectif
- Tester un échantillon représentatif de pages (accueil, calculateurs, blog) en production pour s’assurer qu’elles retournent bien 200 et n’ont pas été affectées par la règle de redirection.

## Méthode
- Créer un petit script Node qui:
  - Interroge une liste d’URL clés sur `https://lescalculateurs.fr`.
  - Suit la chaîne de redirections (www/canonical) jusqu’à la réponse finale.
  - Rapporte status final, et signale tout KO.

## Liste d’URL testées
- `/`, `/index.html`
- `/pages/notaire.html`, `/pages/pret.html`, `/pages/plusvalue.html`, `/pages/charges.html`, `/pages/ik.html`, `/pages/ponts.html`, `/pages/taxe.html`, `/pages/financement.html`
- `/pages/blog.html`, `/pages/blog/frais-notaire-departements.html`
- `/pages/blog/departements/frais-notaire-75.html`

## Livrable
- Rapport console avec 200 attendus en final; mise en évidence de tout éventuel impact.

Si tu valides, je crée le script, je l’exécute et je te fournis le rapport immédiatement.