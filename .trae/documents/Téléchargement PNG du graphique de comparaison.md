## Objectif
Permettre aux utilisateurs de télécharger le graphique Chart.js de la comparaison des frais de notaire en PNG, via une capture simple du canvas.

## Implémentation
- Ajout d’un bouton "Télécharger le graphique (PNG)" sous le graphique dans la comparaison.
- Ajout d’une méthode dans `ComparaisonNotaire` qui récupère le canvas, génère un `dataURL` PNG et déclenche un téléchargement.
- Attacher l’écouteur au bouton après la création du graphique.

## Fichiers modifiés
- `src/utils/comparaisonNotaire.ts`: générer le bouton dans `genererHTML()`, écouter dans `creerGraphique()`, ajouter `telechargerGraphique()`.

## Validation
- Tester après une comparaison: le bouton télécharge un fichier PNG net (utilise le DPR configuré pour Chart.js).