## Diagnostic
- En dev, `baremes` est exporté nominalement depuis `baremes.ts` → OK.
- En preview (build), le chunk `baremes-*.js` exporte `e as b` (minifié): il n’y a ni `default` ni `baremes`.
- Le mini-calculateur en production lit `dataMod.baremes || dataMod.default` → `undefined` en preview, donc erreur.

## Correctif
- Mettre à jour la résolution de `baremes` dans le script inline:
  - `const baremes = dataMod.baremes || dataMod.b || dataMod.default;`
- Mettre à jour le script de copie pour insérer la même logique lors de la réécriture.
- Régénérer les pages et recopier vers `dist`.

## Vérifications
- Tester en preview: `frais-notaire-15.html?type_bien=neuf&departement=15&prix_achat=250000&montant_mobilier=0` → plus d’erreur; total et % s’affichent.
- Tester au moins un autre département (75) pour confirmer la robustesse.

Je procède immédiatement et te confirme le résultat sur les deux pages.