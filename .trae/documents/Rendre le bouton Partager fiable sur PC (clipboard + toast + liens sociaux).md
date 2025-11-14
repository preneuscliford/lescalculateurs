## Objectif
Faire fonctionner le partage de manière visible et fiable sur PC même sans Web Share API.

## Implémentation
- Utilitaire de partage (client JS) :
  - Détecter `navigator.share`; sinon fallback clipboard
  - Copier l’URL avec `navigator.clipboard.writeText` ; si indisponible, fallback `execCommand('copy')`
  - Afficher un toast de confirmation (aria-live) : « Lien copié » ou message d’erreur
  - Générer liens sociaux : WhatsApp, X/Twitter, Email avec texte prérempli
- Calculateur frais de notaire :
  - Bouton primaire « Partager ce calcul » près du résultat (icône + texte)
  - Utiliser l’URL déjà sérialisée par `CalculatorFrame` ; ouvrir menu d’options (copier, natif, WhatsApp, X, Email)
- Comparateur :
  - Bouton « Partager cette comparaison » en en-tête du bloc
  - Construire un deep-link avec scénarios (départements, type bien, prix, %) encodés
  - Même menu d’options + toast
- Exclusion à l’export :
  - Marquer les boutons/menus `data-export-exclude="true"` pour qu’ils n’apparaissent pas dans PNG/PDF

## Validation
- Desktop : clic → toast « Lien copié » ; liens sociaux s’ouvrent correctement
- Mobile : Web Share API si dispo, sinon fallback identique
- Accessibilité : focus visible ; aria-live pour le toast

Confirmez et j’implémente ces améliorations du partage sur le calculateur et le comparateur.