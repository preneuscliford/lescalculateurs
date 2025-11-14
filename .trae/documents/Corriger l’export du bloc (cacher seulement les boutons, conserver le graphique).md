## Objectif
Lors de l’export PNG/PDF du bloc de comparaison, cacher uniquement les boutons “Télécharger en PNG” et “Télécharger en PDF” tout en conservant le graphique et le reste du contenu visibles.

## Modifications
- Ne plus cloner le container pour la capture (le canvas cloné est vide).
- Capturer le DOM original avec `html2canvas`.
- Avant la capture, cacher temporairement les éléments:
  - `#btn-download-chart-png`
  - `#btn-download-chart-pdf`
- Réafficher immédiatement après la capture.
- Conserver “🗑️ Tout effacer” et “➕ Ajouter une autre ville” visibles et incluses (sauf si vous souhaitez aussi les exclure, mais ici on ne les touche pas).

## Implémentation
- `src/utils/comparaisonNotaire.ts`
  - Mettre à jour `telechargerBlocPNG()` et `telechargerBlocPDF()`:
    - Sélectionner le container original
    - Masquer/afficher les deux boutons via `style.visibility='hidden'` (puis restore)
    - Capturer `html2canvas(container)`
    - Télécharger PNG/PDF

## Validation
- Exporter PNG/PDF et vérifier que le graphique est présent.
- Les seuls éléments cachés dans l’export sont les deux boutons de téléchargement.

Confirmez et j’applique ces corrections immédiatement.