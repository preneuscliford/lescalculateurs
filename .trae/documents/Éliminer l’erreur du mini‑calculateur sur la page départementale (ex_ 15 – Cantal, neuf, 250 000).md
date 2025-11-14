## Hypothèse et diagnostic
- Le script inline du mini‑calculateur est bien injecté et les imports sont robustes.
- Le message "Erreur lors du calcul." vient du `catch` interne de `calculate(values)`.
- Causes probables côté données: valeur non numérique (NaN) envoyée au calcul, `baremes.notaire.tranches` non détecté, ou taux des droits (`td`) indéfini.

## Changements précis à appliquer
- Renforcer `calculate(values)` (dans `scripts/generate-departement-articles.js`) pour:
  - Journaliser en `console.log` les valeurs d’entrée et les intermédiaires (prix, mobilier, prix net, émoluments, td, tva, total, %) avant retour.
  - Normaliser systématiquement les entrées: `Number(...)`, vérifier `isFinite`, fournir des défauts sûrs.
  - Simplifier `td` en un taux constant par défaut (0,058) quand on n’a pas de cartographie fiable; ne pas construire un grand `map` rempli d’`undefined`.
  - Toujours réactiver le bouton après traitement (succès ou échec), déjà en place.
- Conserver les imports dynamiques robustes (déjà implémentés) et la copie vers `dist` qui réécrit les chemins vers `assets`.

## Vérifications ciblées
- Regénérer les pages et recopier vers `dist`.
- Tester sur `frais-notaire-15.html` en mode `preview` avec la même URL:
  - `type_bien=neuf&departement=15&prix_achat=250000&montant_mobilier=0`
  - Confirmer que le résultat s’affiche et qu’aucun NaN n’apparaît.
- Tester un département métropolitain (75 – Paris) avec ancien/neuf.

## Résultat attendu
- Le mini‑calculateur ne renvoie plus "Erreur lors du calcul" pour l’exemple donné.
- Le bouton et l’UI restent réactifs; les chiffres s’affichent correctement.

Je procède aux mises à jour, régénère, recopie vers `dist`, puis je te confirme avec les logs et les deux pages testées (15 et 75).