## Objectif
Augmenter fortement le CTR en réécrivant les balises SEO visibles en SERP (title, meta description, Open Graph, Twitter) avec un style orienté action, rapidité et gratuité, conforme à 2025.

## Portée des fichiers (à modifier)
1. `src/pages/blog/departements/frais-notaire-56.html` (Morbihan)
2. `src/pages/blog/departements/frais-notaire-44.html` (Loire-Atlantique)
3. `src/pages/blog/departements/frais-notaire-83.html` (Var)
4. `src/pages/blog/departements/frais-notaire-75.html` (Paris)
5. `src/pages/blog/departements/frais-notaire-39.html` (Jura)
6. `src/pages/crypto-bourse.html` (crypto & bourse)
7. `src/pages/notaire.html` (général notaire)
8. `src/pages/blog/frais-notaire-departements.html` (page agrégée départements)
9. Optionnel: vérification légère de `src/pages/plusvalue.html` (déjà optimisée, ajuster légèrement la description pour cohérence de style)

## Règles de rédaction
- Inclure « calcul », « estimation », « gratuit », « 10 secondes » si pertinent
- Mettre « 2025 » explicitement
- 1 seul set cohérent de `og:title`/`og:description` et ajouter `twitter:description` manquants
- Longueur: `title` ≤ 60–65 caractères, `description` ≈ 150–160 caractères

## Modifications précises par page
### 1) Morbihan (56)
- `title`: « Frais de notaire Morbihan 2025 — Calcul immédiat (gratuit + précis) »
- `meta name="description"`: « Calculez vos frais de notaire dans le Morbihan en 10 secondes. Simulateur 100% gratuit, mis à jour 2025. Estimation automatique sans email. »
- `og:title` & `og:description`: alignés sur le `title` et la description ci-dessus
- `twitter:description`: ajouter la même description

### 2) Loire-Atlantique (44)
- `title`: « Frais de notaire Loire-Atlantique 2025 — Simulateur rapide et fiable »
- `description`: « Obtenez vos frais de notaire en Loire-Atlantique instantanément. Calcul automatique, barème 2025, estimation gratuite. »
- `og:*` et `twitter:description`: aligner et ajouter

### 3) Var (83)
- `title`: « Frais de notaire Var 2025 — Calcul gratuit + estimation détaillée »
- `description`: « Simulez vos frais de notaire dans le Var en quelques secondes. Mise à jour 2025. Estimation précise et gratuite. »
- `og:*` et `twitter:description`: aligner et ajouter

### 4) Paris (75)
- `title`: « Frais de notaire Paris 2025 — Simulateur officiel gratuit »
- `description`: « Calculez vos frais de notaire à Paris instantanément. Estimation automatique 2025. Aucun email demandé. »
- `og:*` et `twitter:description`: aligner et ajouter

### 5) Jura (39)
- `title`: « Frais de notaire Jura 2025 — Estimation gratuite en 10 secondes »
- `description`: « Simulateur frais notaire Jura : calcul rapide, barème mis à jour 2025. Estimation sans inscription. »
- `og:*` et `twitter:description`: aligner et ajouter

### 6) Crypto & Bourse (`crypto-bourse.html`)
- `title`: « Flat Tax & Plus-Value Crypto 2025 — Calcul automatique de l’impôt »
- `description`: « Calculez votre impôt crypto automatiquement : flat tax, plus-value, fiscalité 2025. Outil gratuit, simple, immédiat (2 clics). »
- `og:*` et `twitter:description`: remplacer/aligner pour couvrir les 2 requêtes (« flat tax crypto » et « plus-value crypto »)

### 7) Général Notaire (`notaire.html`)
- Nettoyage: supprimer les doublons de `og:title`/`og:description` et garder 1 set
- `title`: « Frais de Notaire 2025 — Calcul immédiat (gratuit + comparatif) »
- `description`: « Comparez les frais de notaire entre plusieurs villes en 10 secondes. Barème officiel 2025, simulateur gratuit, graphe interactif et export. »
- `twitter:description`: ajouter/aligner si nécessaire

### 8) Agrégée départements
- Ajouter `og:title`, `og:description` et `twitter:description` manquants, cohérents avec le `title` existant

### 9) Plus-value immobilière (ajustement léger)
- `description`: renforcer le style: « Calculez automatiquement l’impôt sur la plus-value immobilière 2025. Abattements, graphiques, comparaison et export PDF/PNG — gratuit et immédiat. » (si non déjà présent)

## Sécurité et conventions
- Aucun fichier nouveau créé; uniquement édition des fichiers listés
- Respect du style actuel (emoji conservés où pertinents)
- Ne pas toucher au contenu calculateur ni scripts

## Validation
- Vérifier présence et unicité des balises
- Tester longueur des snippets
- Prévisualiser Open Graph/Twitter Cards
- Suivi: observer CTR dans Search Console sur 2–4 semaines

## Déploiement par étapes
1. Appliquer aux 5 départements + notaire + crypto (priorité impressions)
2. Étendre ensuite le même modèle aux autres départements du dossier `departements/` en lot

Confirmez et j’implémente ces modifications immédiatement, avec vérification systématique.