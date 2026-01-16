# 📋 Spécifications Techniques : 101 Pages Taxe Foncière

## 🔧 Prérequis Techniques

### Données sources obligatoires

Pour chaque département, récupérer (ou estimer) :

1. **Code département** : "75" (format 2 chiffres, Corse = 2A/2B, DOM = 3 chiffres)
2. **Nom officiel** : "Paris"
3. **Code région** : "11" (Île-de-France)
4. **Nom région** : "Île-de-France"
5. **Taux moyen communal** : 0.0135 (en décimal, ex: 1.35%)
6. **Taxe foncière moyenne annuelle** : 850€
7. **Plage min/max** : 500€ - 2500€
8. **Base locative moyenne** : 35000€
9. **Type territoire** : "urbain" | "mixte" | "rural"
10. **Tension immobilière** : "faible" | "modérée" | "forte" | "très_forte"
11. **Prix au m² moyen** : 8500€

### Structure JSON recommandée

```json
{
  "departements": {
    "75": {
      "code": "75",
      "code_3chiffres": "075", // Pour sitemap et URLs normalisées
      "nom": "Paris",
      "region_code": "11",
      "region_nom": "Île-de-France",
      "taxe_fonciere": {
        "taux_moyen_communal": 0.0135,
        "montant_moyen": 850,
        "montant_min": 500,
        "montant_max": 2500,
        "base_locative_moyenne": 35000
      },
      "territoire": {
        "type": "urbain",
        "tension": "très_forte",
        "prix_m2": 8500,
        "densité_population": "très_dense"
      },
      "sources": {
        "dgfip": "...",
        "insee": "...",
        "notes": "..."
      }
    },
    "59": {
      /* Nord */
    },
    "69": {
      /* Rhône */
    }
    // ... × 101 depts
  }
}
```

### Où récupérer les données

| Donnée             | Source                | Format    | Fréquence MAJ  |
| ------------------ | --------------------- | --------- | -------------- |
| Taux communal      | DGFiP API             | JSON/CSV  | Annuelle (jan) |
| Base locative      | Cerema / INSEE        | CSV       | Annuelle       |
| Prix immobilier    | Google Maps / Seloger | Estimé    | Actualisé      |
| Densité population | INSEE                 | JSON      | Annuelle       |
| Territoire type    | Collectivités locales | Documenté | Stable         |

---

## 📁 Structure Fichiers Détaillée

### Données

```
src/data/
├── baremes.json
│   ├── taxe_fonciere.taux_moyens_par_region { ... }   # ← Enrichir
│   └── (reste inchangé)
│
├── taxe-fonciere-departements.json                    # ← CRÉER (101 depts)
│   ├── departements
│   │   ├── "75": { ... }
│   │   ├── "59": { ... }
│   │   ├── "971": { ... }  // DOM-TOM
│   │   └── ...
│   ├── regions: { ... }
│   ├── territories: { ... }
│   └── sources_metadata: { ... }
│
└── departements-fr.json                               # ← RÉFÉRENCE (si manquant)
    └── Mapping code ↔ nom ↔ région pour tous 101
```

### Pages HTML

```
src/pages/
├── taxe.html                                          # ← Existe (calculateur principal)
│
├── taxe-fonciere/
│   ├── index.html                                     # ← CRÉER : page pilier
│   │   (1200-1500 mots, générale, SEO fort)
│   │
│   └── departements/
│       ├── paris-75.html                              # ← Générer × 101
│       ├── nord-59.html
│       ├── rhone-69.html
│       ├── ... (alphabétique par département)
│       ├── mayotte-976.html
│       └── reunion-974.html  # Dernier = DOM-TOM
│
└── blog/
    ├── departements/
    │   ├── frais-notaire-01.html                      # ← Référence (existe)
    │   └── ... × 101
    └── ... (reste)
```

### Scripts

```
scripts/
├── generate-taxe-fonciere-pages-deepseek.cjs          # ← CRÉER
│   ├── Charge taxe-fonciere-departements.json
│   ├── Lit deepseek-master-prompt-taxe-fonciere.txt
│   ├── Génère 1 payload JSON par dept
│   ├── (--dry-run) : écrit dans reports/deepseek-requests-taxe/
│   └── (--run) : appelle DeepSeek API
│
├── validate-taxe-fonciere-duplication.cjs             # ← CRÉER
│   ├── Lit toutes les 101 pages générées
│   ├── Analyse fuzzy matching (intro, FAQ, exemples)
│   ├── Flag pages > 80% similarité
│   ├── Génère reports/taxe-fonciere-duplication.json
│   └── Génère rapport HTML pour validation
│
├── publish-taxe-fonciere-waves.cjs                    # ← CRÉER
│   ├── Gère les vagues de publication (10 / 15 / 20 / etc.)
│   ├── Crée sitemap progressif
│   ├── Log publication timeline
│   └── Génère report pour Search Console
│
├── generate-taxe-fonciere-report.cjs                  # ← CRÉER (optionnel)
│   ├── KPIs post-publication
│   ├── Comparaison vs frais-notaire
│   └── Recommandations pour phase 2
│
├── deepseek-master-prompt-taxe-fonciere.txt          # ← CRÉER (prompt unique)
│   └── (Adapté du prompt notaire, mais pour taxe foncière)
│
├── generate-department-pages-deepseek.cjs             # ← Existant (notaire)
└── ... (autres scripts existants)
```

### Reports générés

```
reports/
├── deepseek-requests-taxe/
│   ├── 75-paris.json       # Payload envoyé à DeepSeek
│   ├── 59-nord.json
│   └── ... × 101
│
├── deepseek-responses-taxe/
│   ├── 75-paris-response.json
│   ├── 75-paris.html       # Page générée
│   └── ... × 101
│
├── taxe-fonciere-duplication.json
│   ├── page: "75-paris.html"
│   ├── intro_similarity: [ { page: "92-hds.html", score: 0.75 } ]
│   ├── faq_similarity: []
│   ├── examples_similarity: []
│   └── overall_risk: "low"  # "low" | "medium" | "high"
│
├── taxe-fonciere-publication-log.json
│   ├── wave_1: { pages: [75, 59, 69, ...], date_published: "2026-01-20", ... }
│   ├── wave_2: { pages: [...], date_published: "2026-01-27", ... }
│   └── ...
│
└── taxe-fonciere-validation.html  # Tableau interactif pour vérification
```

---

## 🧠 Prompt DeepSeek (Taxe Foncière)

Fichier: `scripts/deepseek-master-prompt-taxe-fonciere.txt`

```
Tu es un expert fiscal français avec 15 ans d'expérience.
Tu dois rédiger UN article SEO unique et complet sur la taxe foncière
dans un département français donné.

📊 DONNÉES DU DÉPARTEMENT :
{JSON_INPUT}

La JSON contient :
- code, nom, région
- taux_moyen_communal, montant_moyen, montant_min, montant_max
- base_locative_moyenne
- type_territoire (urbain/mixte/rural), tension immobilière
- prix_au_m2_moyen

📝 STRUCTURE DE L'ARTICLE (700-900 mots) :

### 1. INTRODUCTION LOCALE (100-150 mots)
- Phrase d'accroche SPÉCIFIQUE au département
- Situer la pression fiscale locale (vs moyenne nationale)
- Contexte territorial (urbain? rural? côtier? montagneux?)
- CHAQUE INTRO DOIT ÊTRE UNIQUE (pas de template)

### 2. SIMULATION INTERACTIVE
[SIMULATEUR_PLACEHOLDER]
(Sera remplacé par le composant React/JS du site)

### 3. FOURCHETTE DÉPARTEMENTALE (100-150 mots)
- Tableau HTML : "Type de bien" | "Taxe foncière moyenne annuelle"
- 3-4 exemples réalistes pour ce département
- Petite maison, appartement, grande maison
- Utiliser les chiffres fournis dans la JSON

### 4. FACTEURS LOCAUX INFLUANT (150-200 mots)
- Taux communal vs intercommunalité (EPCI)
- Impact densité population
- Variations petite commune vs agglomération
- Spécificités régionales / types de construction
- ADAPTER À LA RÉGION : pas le même facteur partout
- Exemple : Île-de-France = cher, Creuse = bon marché

### 5. EXEMPLE CONCRET (100-150 mots)
- Maison typique du département (prix, surface)
- Calcul étape par étape
- Montrant l'effet base locative + taux
- CHANGER D'EXEMPLE PAR DÉPARTEMENT
- Ne pas copier-coller d'autres articles

### 6. FAQ LOCALE (3 questions) (150-200 mots)
- Q1 : "Comment fonctionne l'exonération résidence principale dans ce département ?"
- Q2 : "Existe-t-il des réductions pour personnes âgées / handicapées ?"
- Q3 : "Comment se situe la fiscalité locale vs régions voisines ?"
- QUESTIONS DIFFÉRENTES PAR DÉPARTEMENT
- Exemple : Nord ≠ Paris ≠ Provence

### 7. CTA & LIENS
- "Simulez votre taxe foncière" (lien calculateur)
- "Voir les taux des autres départements"
- "Consulter les sources officielles"
- "Questions sur l'impôt immobilier ?"

⚠️ ANTI-DUPLICATION STRICTE :
- Pas de phrases génériques (ex: "La taxe foncière est un impôt local...")
- Pas de copie-colle d'autres articles
- Chaque intro = unique au département
- Chaque FAQ = questions locales
- Chaque exemple = bien typique du département
- Tonalité peut changer (friendly, formel, etc.) selon dept

🎨 FORMAT HTML :
- Heading H1 : "[Taxe Foncière] {Département} ({Code}) 2025"
- H2 pour chaque section
- Tableaux HTML avec Tailwind CSS (utiliser classes du site)
- Pas d'images (seront ajoutées après)
- Code HTML valide, bien structuré

📌 SOURCES :
- DGFiP pour taux officiels
- INSEE pour démographie
- Article doit être neutre, factuel, utile
- Pas de conseils juridiques (c'est informatif)

💯 QUALITÉ ATTENDUE :
- 700-900 mots exactement
- Unique et non-dupliquant
- SEO-friendly (keywords naturels)
- Prêt à publication
- Tailwind CSS pour styles

Génère MAINTENANT cet article en HTML, prêt à être intégré au site.
```

---

## 🔄 Pipeline de Génération

### Étape 1 : Préparation

```bash
# Créer données
npm run prepare:taxe-fonciere:data

# Valider JSON
npm run validate:taxe-fonciere:data

# Compter : doit être 101
npm run count:departments
# Output: "Taxe Foncière : 101 departments loaded ✅"
```

### Étape 2 : Génération (Dry-run)

```bash
# Générer sans appeler DeepSeek (test)
npm run generate:taxe-fonciere:dry-run

# Output :
# ✅ Generated 101 payloads → reports/deepseek-requests-taxe/
# ✅ Payloads ready for review
# ✅ Use --run flag to execute (requires DEEPSEEK_API_KEY)
```

### Étape 3 : Vérification pré-génération

```bash
# Checker 3-5 payloads avant de lancer --run
ls -la reports/deepseek-requests-taxe/ | head -10

# Chaque payload doit avoir :
# - "model": "deepseek-chat"
# - "messages": [system, user]
# - "temperature": 0.7
# - "max_tokens": 2000
```

### Étape 4 : Génération réelle (Coûteux !)

```bash
# ATTENTION : va coûter API credits
npm run generate:taxe-fonciere -- --run

# Optionnel : rate limiting
npm run generate:taxe-fonciere -- --run --delay 1000
# (attend 1 sec entre chaque appel)

# Output :
# ✅ Calling DeepSeek API for 101 departments...
# ✅ Dept 75 (Paris)... ✅
# ✅ Dept 59 (Nord)... ✅
# ... (affiche progression)
# ✅ Generated 101 HTML files → src/pages/taxe-fonciere/departements/
```

### Étape 5 : Validation (Anti-duplication)

```bash
# Analyser duplication
npm run validate:taxe-fonciere:duplication

# Output :
# ✅ Analyzing 101 pages...
# ⚠️  Page 75 intro is 81% similar to page 92 ← needs review
# ✅ FAQ uniqueness check : 100%
# ✅ Examples uniqueness check : 98%
# 📊 Report : reports/taxe-fonciere-duplication.json
# 📊 Visual : reports/taxe-fonciere-validation.html ← OPEN IN BROWSER

# Si problèmes détectés :
npm run fix:taxe-fonciere:duplicates -- --interactive
# (va re-générer pages problématiques)
```

### Étape 6 : Test local

```bash
npm run dev

# Visiter manuellement:
# http://localhost:5173/pages/taxe-fonciere/
# http://localhost:5173/pages/taxe-fonciere/paris-75
# http://localhost:5173/pages/taxe-fonciere/nord-59
# Vérifier : structure, liens, simulateur, responsiveness
```

### Étape 7 : Préparation publication par vagues

```bash
# Créer plan de publication
npm run plan:taxe-fonciere:waves

# Interactive menu :
# Wave 1: 10 pages? → choisir lesquels
# Wave 2: 15 pages? → choisir lesquels
# ...
# Output : reports/taxe-fonciere-publication-plan.json

# Ou utiliser defaults :
npm run plan:taxe-fonciere:waves -- --preset default
# (suit la priorisation : grandes villes d'abord)
```

### Étape 8 : Publication vague par vague

```bash
# Publier vague 1
npm run publish:taxe-fonciere:wave -- --wave 1

# Output :
# ✅ Publishing wave 1 (10 pages)...
# ✅ Generating sitemap (11 pages + 10 new)...
# ✅ Updated public/sitemap.xml
# ✅ Wave 1 published
# ⏰ Next wave in 7 days (recommended)
# 📊 Log : reports/taxe-fonciere-publication-log.json

# Attendre 5-7 jours...

# Publier vague 2
npm run publish:taxe-fonciere:wave -- --wave 2
# etc.
```

---

## 🧪 Tests & Validation

### Test 1 : Structure HTML

```bash
npm run test:taxe-fonciere:html

# Vérifications :
# ✅ Doctype + lang="fr"
# ✅ Meta charset + viewport
# ✅ Title + description
# ✅ Canonical URL
# ✅ H1 présent et unique
# ✅ Images alt text
# ✅ Internal links valides
# ✅ Schema.org JSON-LD
# ✅ pas de script errors
```

### Test 2 : Similarité / Duplication

```bash
npm run test:taxe-fonciere:similarity

# Pour chaque page, calcule :
# - Intro similarity : vs autre pages
# - FAQ similarity : vs autre pages
# - Example similarity : vs autre pages
# Flag si > 80% similaire
# Output : JSON avec scores
```

### Test 3 : Longueur & Structure

```bash
npm run test:taxe-fonciere:structure

# Vérifications :
# ✅ 700-900 mots (accepter ±50)
# ✅ H2 > 0 (minimum 1 section)
# ✅ Tableau HTML présent
# ✅ Exemple chiffré dans le texte
# ✅ FAQ au moins 1 question
# ✅ CTA au moins 1 lien interne
# ✅ Pas de placeholder [REMAINING]
```

### Test 4 : SEO basique

```bash
npm run test:taxe-fonciere:seo

# Vérifications :
# ✅ Focus keyword dans Title
# ✅ Focus keyword dans H1
# ✅ Focus keyword dans Description
# ✅ Focus keyword 1-2 fois dans corps
# ✅ Anchor text diversifiés (liens internes)
# ✅ Internal links > 2
# ✅ Meta keywords (si utilisé)
# ✅ Open Graph tags
```

### Test 5 : URLs & Canonicals

```bash
npm run test:taxe-fonciere:urls

# Vérifications :
# ✅ URLs format: /pages/taxe-fonciere/{dept}-{code}
# ✅ Canonical URL unique et correcte
# ✅ Pas d'URL dupliquée
# ✅ Codes département valides (01-95 + 971-976)
# ✅ Sitemap contient toutes les URLs
# ✅ robots.txt allows crawl
```

---

## 📊 Monitoring Post-Publication

### Google Search Console

Vérifier pour chaque vague (5-7j après publication) :

```bash
npm run monitor:taxe-fonciere:gsc

# Cherche dans Google Search Console :
# - Pages indexées : 100% de la vague ?
# - Errors : 0 ?
# - Coverage : "Submitted and indexed" ?
# - Sitemaps : updated ?

# Affiche :
# 📊 Vague 1 : 8/10 pages indexées ✅
# 📊 Vague 2 : 14/15 pages indexées ✅ (1 en attente)
# ⚠️  Pages non indexées (recheck) : page 92, page 88
```

### Analytics

Tracker après 2-4 semaines :

```bash
npm run monitor:taxe-fonciere:analytics

# KPIs :
# 🎯 New users from "taxe foncière {dept}" : XX
# 🎯 Sessions from dept pages : XX
# 🎯 Click-through to calculator : XX%
# 🎯 Avg time on page : XX sec
# 🎯 Bounce rate : XX%

# Comparaison vs frais-notaire pages :
# Frais notaire : +300% trafic (baseline)
# Taxe foncière : +XX% trafic (nouveau)
# Ratio CTR : XX%
```

### Rankings

Tracker après 4-6 semaines :

```bash
npm run monitor:taxe-fonciere:rankings

# Pour chaque département :
# "taxe foncière {dept}" → position? (track top 100)
# "calcul taxe foncière {code}" → position?
# "montant taxe foncière {dept}" → position?

# Output :
# 📊 Paris (75) : "taxe foncière paris" → pos #12 ✅
# 📊 Paris (75) : "calcul taxe foncière 75" → pos #3 ✅✅
# 📊 Nord (59) : "taxe foncière nord" → pos #87 (en progression)
# ...
```

---

## 🚨 Troubleshooting

### Problème : Pages générées avec erreurs HTML

**Cause** : DeepSeek a généré du HTML invalide

**Solution** :

```bash
npm run fix:taxe-fonciere:html-errors

# Vérifier rapports :
# - Balises non fermées
# - Caractères échappés mal
# - Structure brisée
# Re-générer pages problématiques
```

### Problème : 80%+ pages sont dupliquées

**Cause** : Prompt pas assez spécifique, DeepSeek a réutilisé template

**Solution** :

```bash
# Revoir le prompt (deepseek-master-prompt-taxe-fonciere.txt)
# Ajouter contraintes anti-duplication plus fortes
# Re-générer toutes les pages
npm run generate:taxe-fonciere -- --run --force
```

### Problème : Pages non indexées après 2 semaines

**Cause** : Contenu trop similaire, crawler throttling, robots.txt

**Solution** :

```bash
# 1. Vérifier robots.txt
cat public/robots.txt | grep taxe-fonciere

# 2. Vérifier sitemap
grep taxe-fonciere public/sitemap.xml | wc -l
# Doit être 101

# 3. Soumettre manuellement dans GSC
# https://search.google.com/search-console/
# → Inspection URL → "Demander indexation"

# 4. Augmenter maillage interne
npm run fix:taxe-fonciere:internal-linking
```

### Problème : DeepSeek API timeout / rate limit

**Cause** : Trop d'appels simultanés, quota atteint

**Solution** :

```bash
# Ajouter délai entre appels
npm run generate:taxe-fonciere -- --run --delay 2000 --retry 3

# Résumer génération (redémarrer d'où on s'est arrêté)
npm run generate:taxe-fonciere -- --run --resume
# Cherche reports/generation-progress.json
```

---

## 📋 Checklist pré-publication

Avant de publier la première vague :

- [ ] `baremes.json` enrichi avec taux par région
- [ ] `taxe-fonciere-departements.json` créé avec 101 depts (vérifier: 101 entries)
- [ ] Page mère `/pages/taxe-fonciere/index.html` créée
- [ ] Script generation adapté et testé (dry-run OK)
- [ ] Script validation créé et OK
- [ ] Tous les tests HTML + SEO passent (100/101 pages)
- [ ] Anti-duplication : score < 70% moyenne
- [ ] Maillage interne : chaque page linke vers ≥ 3 autres pages taxe
- [ ] Simulateur testé sur 5 pages (fonctionne)
- [ ] Canonical URLs correctes (101/101)
- [ ] Sitemap updated
- [ ] robots.txt allow crawl
- [ ] DeepSeek API key valide et testée
- [ ] Reports directory vide / prêt
- [ ] Documentation OK (ce fichier)

---

## 📞 Support / Questions

Pour questions spécifiques :

1. Vérifier `TAXE-FONCIERE-PLAN-101-PAGES.md` (stratégique)
2. Vérifier ce fichier (technique)
3. Comparer avec `scripts/README-GENERATION-BLOG.md` (frais notaire)
4. Checker `scripts/generate-department-pages-deepseek.cjs` (implémentation)
