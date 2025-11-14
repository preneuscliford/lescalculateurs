## Objectif
Maximiser l’expérience utilisateur et la performance de la page « Frais de notaire », tout en ajoutant des fonctionnalités avancées et en harmonisant l’intégration avec les pages départementales très visitées.

## Cibles
- Page calculateur: `src/pages/notaire.html`
- Composant: `src/components/CalculatorFrame.ts`
- Utilitaires export: `src/utils/pdfExport.js`, `src/utils/autoExportInit.js`
- Données: `src/data/baremes.ts`, `src/data/departements.json`
- Pages départementales: générées via `scripts/generate-departement-articles.js`

## Améliorations UX
1. Formulaire plus fluide
- Validation instantanée, messages d’erreur contextualisés
- Aides contextuelles (infobulles) sur champs complexes (frais divers, garanties)
- Préremplissage depuis l’URL (query-string) et depuis la page départementale (code du département)
2. Résultats lisibles et actionnables
- Carte “Résumé” sticky (montant total + delta neuf/ancien + principaux postes)
- Accès rapide aux postes détaillés (accordéons: droits, émoluments, débours, TVA)
- Ancrage et sommaire interne des sections (calcul, comparaisons, export)
3. Accessibilité et réactivité
- Focus management, `aria-live` pour la zone de résultats
- Navigation clavier entièrement opérationnelle

## Fonctionnalités avancées
1. Mode Expert
- Champs additionnels: mobilier déduit, options de garanties (hypothèque/caution), terrain, remises notaire
- Afficher l’impact ligne par ligne dans la carte “Résumé”
2. Historique & Comparaison
- Historiser les calculs (localStorage), nommer les scénarios
- Comparaison side-by-side de 2–3 scénarios (composant comparatif réutilisable)
- Graphe différence par postes (utiliser conteneur `#comparaison-container` déjà présent)
3. Partage & Deep Links
- Générer un lien partage (sérialisation des valeurs dans l’URL)
- Bouton “Copier le lien” (clipboard) + prévisualisation
4. Export enrichi
- PDF: titre, date, notes, table des postes + comparaison si présente
- CSV: structuré (entêtes cohérents, montants bruts et nets)

## Intégration sur pages départementales
1. Mini-calculateur in-page
- Injecter un `div#inline-notaire-calculator` sous le CTA
- Bouton “Calculer vos frais ici” qui charge à la demande le mini-calculateur (import dynamique de `CalculatorFrame.ts`)
- Préremplir le département (code/nom) depuis la page
2. Passage vers calculateur complet
- Lien “Ouvrir le calculateur complet” → `pages/notaire.html` avec les valeurs en query-string

## SEO et contenu
- Ajouter `HowTo` JSON-LD pour “Calculer vos frais de notaire” sur `notaire.html` et sur les pages départementales (étapes: choisir type de bien, département, prix, mobilier, garanties; valider et interpréter les postes)
- Maintenir FAQ existante, enrichir si besoin

## Analytics et mesure
- Événements (GTM/GA): déclenchement calcul, export PDF/CSV, ajout comparaison, copie lien, ouverture mini-calculateur
- Dimensions personnalisées: type de bien, neuf/ancien, département

## Performance
- Décharger les modules d’export en import dynamique (uniquement après calcul)
- Lazy-load du mini-calculateur sur les pages départementales
- Optimiser le DOM des résultats (limiter reflow, utiliser fragments)

## Implémentation (points techniques)
- `src/pages/notaire.html`: étendre `notaireConfig` (Mode Expert), activer URL → valeurs; enrichir `formatResult`
- `src/components/CalculatorFrame.ts`: 
  - sérialisation/desérialisation dans l’URL
  - hooks pour historique, comparaison, events analytics
- `src/utils/pdfExport.js` / `src/utils/autoExportInit.js`: 
  - option “inclure comparaison”, extraction structurée des postes
- `scripts/generate-departement-articles.js`: 
  - ajouter placeholder et script module pour mini-calculateur (import dynamique)

## Phases
- Phase 1 (UX de base + URL state + export enrichi)
- Phase 2 (Mode Expert + Historique + Comparaison)
- Phase 3 (Mini-calculateur sur pages départementales + Analytics + HowTo)
- Phase 4 (Performance, tests, polish)

## Livrables
- Calculateur enrichi et stable
- Mini-calculateur intégré aux pages départementales
- Exports PDF/CSV robustes
- Événements analytics et schémas SEO (FAQ + HowTo)

Confirmez et je commence l’implémentation (sans interrompre le service, avec chargements à la demande et validations visibles).