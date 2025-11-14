## Objectif
Rendre le partage plus visible et plus utile, à la fois pour le calculateur frais de notaire et pour le comparateur multi‑villes.

## Expérience de partage
- Bouton principal mis en avant (style primaire, grand, avec icône) à proximité du résultat et en haut du comparateur
- Options de partage:
  - Copier le lien (avec confirmation visuelle/toast)
  - Partage natif (Web Share API) si disponible
  - Partage vers WhatsApp, X/Twitter, Email (avec message prérempli)
  - QR code (optionnel) pour scanner et ouvrir directement
- Lien profond:
  - Calculateur: sérialiser les champs saisis dans l’URL
  - Comparateur: inclure les scénarios (départements, type de bien, prix, pourcentages)

## Implémentation
- `src/pages/notaire.html`
  - Remplacer le bouton actuel par un bouton primaire « Partager ce calcul » + menu d’options
  - Utiliser `CalculatorFrame` pour générer l’URL de partage à partir des valeurs (déjà en place avec mise à jour de l’URL)
- `src/utils/comparaisonNotaire.ts`
  - Ajouter un bloc « Partager cette comparaison » (marqué `data-export-exclude="true"`)
  - Générer le deep‑link des calculs présents (`this.calculs`)
  - Web Share API → `navigator.share({ title, text, url })` si disponible; sinon copier lien + options WhatsApp/X/Email
  - Toast/notification (petit composant JS) pour feedback
- Sécurité et accessibilité
  - Boutons avec labels accessibles, focus clair, aria-live pour toasts
  - Aucune donnée sensible; uniquement paramètres de calcul (prix, code département, type)

## UI/Design
- Bouton primaire (gradient, icône partage) bien visible
- Menu d’actions (copie, WhatsApp, X, Email, QR) compact
- Toast discret en bas de page (« Lien copié »)

## Validation
- Partage d’un calcul unique: lien ouvre la page avec les champs préremplis
- Partage d’une comparaison: lien ouvre le comparateur et restaure les scénarios
- Test sur desktop/mobile (Web Share API) et vérification des toasts

Confirmez et j’implémente ces améliorations pour un partage fluide et puissant.