## Problème
Erreur TS: "Cannot find name 'jsPDF'" car l’import global a été retiré, et la fonction `telechargerGraphiquePDF` utilise `jsPDF` sans import.

## Correction
- Rendre `telechargerGraphiquePDF` asynchrone
- Importer dynamiquement `jsPDF` à l’intérieur de la fonction: `const { jsPDF } = await import("jspdf")`

## Impact
- Corrige l’erreur linter/TS
- Garde le graphique visible (pas de clone), export PDF fonctionne

Confirmez et j’applique la modification immédiatement.