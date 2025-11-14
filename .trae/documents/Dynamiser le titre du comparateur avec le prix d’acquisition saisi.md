## Objectif
Afficher dans le bloc de comparaison un titre enrichi indiquant le prix d’acquisition saisi par l’utilisateur, de façon dynamique.

## Comportement souhaité
- Si tous les scénarios ont le même prix d’acquisition: afficher « Comparaison des frais de notaire pour un prix d’acquisition de 250 000,00 € ».
- Si les scénarios ont des prix différents: afficher « Comparaison des frais de notaire pour des prix d’acquisition de 200 000,00 € à 300 000,00 € ».
- Format monétaire français avec 2 décimales.

## Modifications techniques
- Fichier: `src/utils/comparaisonNotaire.ts`
- Méthode: `genererHTML()`
  - Calculer `prixRef`, `minPrix`, `maxPrix`, `allSame` depuis `this.calculs`.
  - Ajouter un helper local `formatCurrency2(value)` (EUR, 2 décimales).
  - Adapter l’entête du bloc pour inclure la ligne dynamique sous le titre (ou intégrer la formulation dans le `<h3>`).

## Validation
- Ajouter un scénario et vérifier que le titre reflète le prix saisi.
- Ajouter plusieurs scénarios avec des prix différents: vérifier la plage min–max.
- Export PNG/PDF: le titre enrichi apparaît dans les téléchargements (les contrôles restent exclus).

Confirmez et j’applique la modification immédiatement.