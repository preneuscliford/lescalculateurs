## Diagnostic
- Le clic sur « Calculer » affiche « Erreur lors du calcul. ».
- Causes probables: module `baremes` non résolu (exports minifiés), valeurs non numériques, ou accès à `baremes.notaire.tranches` indisponible.
- Le calcul actuel ne journalise pas l’erreur et échoue silencieusement via `catch`.

## Modifications proposées (avec commentaires de fonctions)
- Renforcer `calculate(values)` dans le script inline des pages générées (dans `scripts/generate-departement-articles.js`):
  - Valider la présence de `baremes.notaire.tranches` et `baremes.notaire.tva`;
  - Normaliser les entrées numériques (coercer en nombres, vérifier NaN, bornes min/max);
  - Calcul des émoluments sécurisé (boucle sur tranches avec gestion du reste);
  - Fallback de `tva` à `0.2` si absent; fallback du `td` (droits) à `0.058`;
  - Journaliser l’erreur réelle dans `catch` et afficher un message utilisateur précis.
- Réactiver systématiquement l’état du bouton après calcul (succès/échec).
- S’assurer que la version `dist` conserve les imports robustes (`CalculatorFrame`/`formatCurrency`/`baremes`) via le script de copie.

## Étapes d’implémentation
1. Mettre à jour `generateArticleHTML()` pour injecter une version durcie de `calculate(values)` et de la gestion du bouton (success/erreur).
2. Re‑générer les 101 pages et re‑copier vers `dist` avec la réécriture des imports dynamiques.
3. Vérifier sur 2 pages:
   - 15 (Cantal): type « neuf », prix 250000, mobilier 0 → résultat sans erreur;
   - 75 (Paris): type « ancien », prix 250000 → résultat cohérent.

## Résultat attendu
- Plus d’erreur au clic; résultats calculés et affichés correctement.
- Bouton réactivé après calcul (quel que soit l’issue).

Souhaitez‑vous que j’applique ces changements immédiatement puis je vous montre les vérifications sur ces pages ?