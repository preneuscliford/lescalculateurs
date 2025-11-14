## Objectif
Au moment de l’export PNG/PDF du bloc, cacher strictement “➕ Ajouter une autre ville”, le message d’aide et les boutons de téléchargement, tout en conservant le graphique et le tableau.

## Problème actuel
Le masquage via `visibility: hidden` n’est pas systématiquement respecté par html2canvas pour ces éléments.

## Modifications prévues
- Dans `src/utils/comparaisonNotaire.ts`:
  - Dans `telechargerBlocPNG()` et `telechargerBlocPDF()`:
    - Sélectionner tous les éléments marqués `data-export-exclude="true"`.
    - Avant la capture, remplacer `visibility: hidden` par `display: none` (et stocker le style initial pour restauration).
    - Après la capture, restaurer le style d’origine de chaque élément.
- Vérifier que les conteneurs des contrôles sont bien marqués `data-export-exclude="true"` (boutons de téléchargement, “Tout effacer”, “Ajouter une autre ville” + message). Ils le sont déjà; on garde ce marquage.

## Validation
- Exporter en PDF: le graphique, le titre et le tableau sont inclus; “Ajouter une autre ville” et le message n’apparaissent plus.
- Exporter en PNG: même comportement.

Confirmez et j’applique ces corrections immédiatement.