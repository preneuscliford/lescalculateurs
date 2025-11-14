## Cibles
- Composant `CalculatorFrame` (titres/boutons Calculer et Export CSV)
- Pages départementales générées (CTA mini‑calculateur)
- Comparateur notaire (boutons export PNG/PDF)

## Règles d’usage
- 1 emoji par titre ou bouton (sobre, cohérent)
- Thèmes: 🧮 calcul, ▶️ action, 📄 export, 🖼️ image, 🔎 voir aussi

## Modifs précises
- `src/components/CalculatorFrame.ts`:
  - Préfixer le titre rendu par `render()` avec `🧮`.
  - Bouton `Calculer` → `▶️ Calculer`.
  - Bouton `Exporter en CSV` → `📄 Exporter en CSV`.
- `scripts/generate-departement-articles.js`:
  - Bouton mini‑calculateur `Calculer vos frais ici` → `🧮 Calculer vos frais ici`.
- `src/utils/comparaisonNotaire.ts`:
  - Bouton `Télécharger en PNG` → `🖼️ Télécharger en PNG`.
  - Bouton `Télécharger en PDF` → `📄 Télécharger en PDF`.

## Vérif
- Regénérer les pages et copier en `dist`, tester 15 et 75.

Si tu valides, j’applique ces changements maintenant (sans toucher au SEO ni à l’accessibilité).