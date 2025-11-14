## Objectif
- Harmoniser l’usage des emoji sur **toutes les pages** (calculateurs, comparateur, pages thématiques), pour améliorer la visibilité des titres et CTA sans nuire à l’accessibilité.

## Ligne éditoriale
- 1 emoji par titre/bouton (sobre, lisible, compatible SEO/ARIA)
- Mapping thématique proposé:
  - Frais de notaire: 🧾 / 🧮 (calcul)
  - Prêt: 🏦
  - Plus‑value: 💰
  - Charges: 📋
  - Indemnités kilométriques (IK): 🚗
  - Ponts/jours fériés: 🌉 / 📅
  - Taxes: 📜
  - Travail/durée: 🕑
  - Financement: 💶
  - Crypto‑bourse: 📈
  - FAQ: ❓, Sources: 📚, Partage: 🔗

## Pages cibles et changements
- `src/pages/*.html` (notaire, pret, plusvalue, charges, ik, ponts, taxe, travail, financement, crypto-bourse):
  - Préfixer **H1/H2** principaux avec l’emoji thématique.
  - CTA primaires: ajouter emoji (ex. ▶️ Calculer, 🔗 Partager, 📄 Exporter PDF/CSV).
  - Sections récurrentes: “FAQ” (❓), “Sources et références” (📚).
- Comparateur notaire (`src/utils/comparaisonNotaire.ts`):
  - Déjà mis à jour pour PNG/PDF (🖼️/📄); conserver et étendre si d’autres boutons.
- Composant `CalculatorFrame` (global):
  - Déjà mis à jour (🧮 titre, ▶️ Calculer, 📄 CSV) – vérifier intégration.

## Mise en œuvre
- Modifier chaque page en respectant le style actuel (classes Tailwind existantes), **sans toucher aux metas SEO**.
- Garder le texte explicite même sans emoji (accessibilité).
- Ajouter des **commentaires de niveau fonction** là où du code TS est ajusté (conformément à vos règles).

## Vérifications
- Build + preview (sans démarrer un serveur si déjà actif).
- Contrôler l’affichage sur au moins 3 pages (ex.: notaire, IK, taxe) et le comparateur.

Souhaitez‑vous que j’applique ces ajouts maintenant sur toutes les pages listées avec la ligne éditoriale ci‑dessus ?