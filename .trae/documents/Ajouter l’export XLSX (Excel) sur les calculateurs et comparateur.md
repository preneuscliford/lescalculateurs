## Objectif
- Permettre l’export en **XLSX** (format natif Excel) pour les résultats des calculateurs et le tableau du comparateur.

## Portée
- Composant global `CalculatorFrame` (bouton CSV déjà présent) → ajouter un bouton **📊 Exporter en XLSX**.
- Comparateur notaire (`src/utils/comparaisonNotaire.ts`) → ajouter **📊 Exporter en XLSX** pour le tableau détaillé.

## Librairie et chargement
- Utiliser **SheetJS (`xlsx`)** côté client, en **import dynamique** pour ne pas alourdir le bundle initial: `const XLSX = await import("xlsx");`.
- Pas d’API externe, génération locale et sauvegarde via `XLSX.writeFile`.

## Données et feuilles
- CalculatorFrame:
  - Feuille `Résumé`: lignes clés (prix d’achat, type, département, total, %), formats: `€` et `%`.
  - Feuille `Détail`: toutes les lignes calculées (émoluments, droits, frais, TVA), timestamps et éventuelles notes.
- Comparateur:
  - Feuille `Comparaison`: tableau multi‑villes (colonnes: département, type, prix, émoluments, droits, frais, TVA, total, %), tri par total, formats.
  - Feuille `Paramètres`: options utilisées (remise variable, etc.).

## Formats et mise en forme
- Types: nombres, **formats personnalisés** (`#,##0 €`, `0.00%`).
- Lignes d’entête en gras, **freeze panes** (ligne 1), **auto‑width** basée sur longueurs.

## Intégration UI
- `CalculatorFrame`:
  - Ajouter bouton **📊 Exporter en XLSX** à côté de **📄 Exporter en CSV**.
  - Nouvelle fonction `exportXlsx()` avec **commentaires niveau fonction**.
- `comparaisonNotaire.ts`:
  - Ajouter un bouton **📊 Exporter en XLSX** sous le tableau.
  - Nouvelle fonction `telechargerBlocXLSX()` qui extrait le tableau et construit le workbook.

## Sécurité et performance
- Import **lazy** de `xlsx` seulement au clic.
- Aucun secret, aucune collecte externe.

## Vérifications
- Dev/preview: générer 2 fichiers d’exemple et ouvrir avec Excel (Windows).
- Contrôler les formats €/% et l’auto‑width, présence de toutes les lignes.

## Livrables
- Boutons XLSX ajoutés (CalculatorFrame et comparateur).
- Fonctions d’export commentées.
- Tests manuels et rapport rapide (fichiers générés, tailles, contenu).