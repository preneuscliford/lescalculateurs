# 🎯 Plan d'Implémentation : 101 Pages Taxe Foncière par Département

**Date** : Janvier 2026  
**Objectif** : Créer 101 pages uniques (1 par département FR métropole + DOM-TOM) pour capter du SEO longue traîne massif  
**Modèle** : Inspiré de la génération réussie des pages "Frais de notaire 2025" (101 pages générées)

---

## 📊 Vue d'ensemble stratégique

### Objectifs SEO

- Capter les intentions longue traîne : `"taxe foncière {département} 2025"`, `"calcul taxe foncière {code}"`, `"montant moyen {département}"`
- Nourrir les moteurs IA avec du contenu contextualisé
- Renforcer l'image de référence officielle (1 moteur de calcul, 101 contextes locaux)
- Pousser les utilisateurs vers le simulateur centralisé

### Principe clé

⚠️ **Ce ne sont PAS 101 clones.**

- **Calcul** = centralisé (même moteur)
- **Contenu** = localisé + unique

---

## 🧱 1 — Architecture

### URLs

```
/pages/taxe-fonciere/                           # Page pilier (à créer)
/pages/taxe-fonciere/{departement}-{code}/      # Pages départements
  ├── paris-75.html
  ├── nord-59.html
  └── ...
```

### Page mère

- `/pages/taxe-fonciere/index.html` → contenu général sur la taxe foncière
- Pilier pour maillage interne
- Explique les principes nationaux
- Linke vers les 101 pages

### Hiérarchie des pages

1. **Page pilier** : `/pages/taxe-fonciere` (SEO fort, 1000-1500 mots)
2. **Pages thématiques** : "/pages/taxe-fonciere/departments" (7 pages maître par région)
3. **Pages départementales** : `/pages/taxe-fonciere/{dept}-{code}` (700-900 mots × 101)

---

## 📊 2 — Données Minimales (Phase 1)

### Obligatoires pour chaque département

```json
{
  "code": "75",
  "nom": "Paris",
  "region": "Île-de-France",
  "region_code": "11",

  // Taux + montants
  "taux_moyen_communal": 0.0135, // En %
  "taxe_fonciere_moyenne": 850, // En € par an (fourchette typique)
  "taxe_fonciere_min": 500, // Pour petite maison/appart
  "taxe_fonciere_max": 2500, // Pour grand bien
  "base_locative_moyenne": 35000, // En € (ordre de grandeur)

  // Contexte
  "type_territoire": "urbain", // urbain | mixte | rural
  "tension_immobiliere": "très_forte", // faible | modérée | forte | très_forte
  "prix_au_m2_moyen": 8500, // Pour exemples concrets

  // Exonérations locales (optionnel phase 1)
  "exonerations": [], // À compléter phase 2
  "notes": "..." // Spécificités locales
}
```

### Sources officielles (déjà bien gérées)

- **DGFiP** : données fiscales par commune
- **INSEE** : base locative, prix immobilier
- **data.gouv.fr** : données CEREMA
- **Collectivités locales** : taux communaux

### Approche pragmatique

- Phase 1 : Utiliser des fourchettes (ex: "entre X et Y €")
- Phase 2 : Affiner avec vraies données communes
- C'est comme APL : même si approximatif, ça fonctionne SEO

---

## 🧩 3 — Structure de Page (Figée, Contenu Variable)

### Pattern à respecter

✅ Structure identique  
✅ Texte, ordre, angles **changent par département**

### Sections minimales

#### 1️⃣ **Intro locale** (100-150 mots)

- Phrase d'accroche avec données locales
- Pression fiscale du département vs moyenne nationale
- Type de territoire (urbain, rural, mixte)
- Exemple : _"En Île-de-France, la taxe foncière se situe au-dessus de la moyenne française (1,35% vs 1,28% de base locative)"_

#### 2️⃣ **Simulateur intégré** (composant réutilisable)

```html
<div class="calculator-frame">
  <!-- Même moteur pour tous -->
  <!-- Pré-remplir avec :
      - code_commune (optionnel)
      - taux_regional (pré-rempli)
      - base_locative_estimate (suggestion locale)
  -->
</div>
```

#### 3️⃣ **Fourchette départementale** (100 mots)

- Tableau 2 colonnes : "Type de bien" | "Montant moyen annuel"
- Exemple :
  | Petite maison (100 m²) | 450 € |
  | Appartement (70 m²) | 280 € |
  | Maison moyenne (200 m²) | 950 € |

#### 4️⃣ **Facteurs locaux** (150-200 mots)

- Taux communal vs intercommunalité
- Impact ruralité / tension immobilière
- Différence petite commune vs agglomération
- **Diversifier par département** : certains ont taux très élevés (PACA), d'autres bas (rural)

#### 5️⃣ **Exemple concret** (100-150 mots)

- 1 exemple maison typique du département
- 1 exemple appartement typique
- Tous les calculs visibles
- **Changer d'exemple par département** : Paris ≠ Dordogne

#### 6️⃣ **FAQ locale** (max 3 questions)

- Exonération résidence principale (commune ?)
- Réductions personnes âgées / handicapées (dept-spécifique)
- Comparaison avec régions voisines
- **Pas les mêmes questions partout** : Paris ≠ Nord

#### 7️⃣ **CTA soft**

- Liens vers simulateur
- Liens vers page mère taxe foncière
- Liens vers pages voisines
- Liens vers sources officielles

---

## 🤖 4 — Génération du Contenu

### Approche = Frais de notaire (mais améliorée)

#### Prompt unique par département

```
Tu es expert fiscal français. Génère 1 article SEO unique sur la taxe foncière
dans le {DEPARTEMENT} ({CODE}), en 700-900 mots.

📊 Données du département :
- Taux moyen communal : {TAUX}%
- Base locative moyenne : {BASE_LOC}€
- Taxe foncière moyenne annuelle : {MONTANT_MOY}€
- Type de territoire : {TYPE}
- Prix au m² moyen : {PRIX_M2}€/m²
- Région : {REGION}

📝 Sections (ordre/tonalité changent) :
1. Intro unique au département (pas de template)
2. Simulateur
3. Fourchettes locales (tableau)
4. Facteurs qui influent dans ce dept
5. 1 exemple concret typique
6. 3 FAQ LOCALES (différentes par dept)
7. CTA

⚠️ Anti-duplication :
- Pas de phrases génériques
- Pas de copier-coller d'autres depts
- Chaque intro est unique
- Chaque FAQ est spécifique

Format : HTML + Tailwind CSS (styles déjà dans le projet)
```

#### Paramètres injectés

- Département + code
- Taux + montants
- Région + contexte territorial
- Prix immobilier local

#### Exécution

1. **Dry-run** : générer payloads JSON → `reports/deepseek-requests-taxe/`
2. **Vérification** : vérifier pas de doublons
3. **Validation** : check structure + longueur
4. **Publication progressive** : voir section déploiement

---

## 🧼 5 — Anti-Duplication (OBLIGATOIRE)

### Avant publication

#### Checklist par page

- ✅ Intro ≠ autres intros (pas même phrase)
- ✅ FAQ ≠ autres FAQ (questions différentes)
- ✅ Exemples ≠ autres exemples (biens typiques du dept)
- ✅ Tonalité change (même structure, angle différent)

#### Script de validation

```bash
npm run validate:taxe-fonciere:duplication
```

### Fuzzy matching pour détecter

- Similarité texte > 80% = warning
- Phrases génériques répétées = warning
- Même FAQ sur 2+ pages = erreur

### Rapport

- Générer `reports/taxe-fonciere-duplication.json`
- Lister toutes les pages "douteuses"
- Dashboard visual pour vérifier avant push

---

## 🔗 6 — Maillage Interne Stratégique

### Chaque page département doit

**Linker VERS :**

- Page mère taxe foncière
- Simulateur taxe foncière (CTA)
- Pages voisines (Hauts-de-Seine ↔ Seine-Saint-Denis)
- Méthodologie / sources
- Pages connexes : frais notaire, impôt, APL (si logique logement)

**Être linkée DEPUIS :**

- Page pilier taxe foncière (liste 101 depts)
- Page régionale taxe foncière (si créée)
- Footer (éventuellement)

### Breadcrumb

```
Accueil > Taxe Foncière > Paris (75)
```

### Structured data

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Taxe Foncière Paris 2025",
  "author": { "@type": "Organization", "name": "LesCalculateurs.fr" },
  "articleBody": "...",
  "datePublished": "2026-01-10",
  "inLanguage": "fr",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://lescalculateurs.fr"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Taxe Foncière",
        "item": "https://lescalculateurs.fr/pages/taxe-fonciere"
      },
      { "@type": "ListItem", "position": 3, "name": "Paris (75)" }
    ]
  }
}
```

---

## 📈 7 — Déploiement Progressif (CLEF)

### ❌ Ne pas publier les 101 pages le même jour

#### Plan par semaines

| Semaine | Pages    | Cumul | Stratégie                                     |
| ------- | -------- | ----- | --------------------------------------------- |
| Sem 1   | 10 pages | 10    | Tester SEO impact, affiner modèle             |
| Sem 2   | 15 pages | 25    | Ajouter régions clés (IDF, PACA, Rhône-Alpes) |
| Sem 3   | 20 pages | 45    | Couvrir toutes les régions                    |
| Sem 4   | 25 pages | 70    | Finaliser métropole                           |
| Sem 5   | 15 pages | 85    | DOM-TOM                                       |
| Sem 6   | 16 pages | 101   | Derniers ajustements + relancer indexation    |

### Priorités pour vagues 1-2

1. **Paris (75)** → test SEO sur grosse requête
2. **Nord (59)** → densité population
3. **Rhône (69)** → région importante
4. **Hauts-de-Seine (92)** → IDF
5. **Bouches-du-Rhône (13)** → PACA
6. Puis : capitales régionales
7. Puis : autres

### Google Search Console

- Vérifier indexation après chaque vague
- Repérer quels départements rankent bien
- Affiner contenu si besoin

### Impact attendu

- ✅ Google : indexation progressive
- ✅ Moteurs IA : alimentation progressive
- ✅ SEO : éviter "freshness penalty"
- ✅ Maillage interne : densification progressive

---

## ✅ Checklist d'Implémentation

### Phase 0 : Préparation (Semaine 1)

- [ ] Enrichir `baremes.json` avec données 101 depts
- [ ] Créer dossier `/pages/taxe-fonciere/departements/`
- [ ] Créer page mère `/pages/taxe-fonciere/index.html`
- [ ] Adapter script DeepSeek pour taxe foncière
- [ ] Créer script anti-duplication
- [ ] Tester sur 2-3 depts (dry-run)

### Phase 1 : Génération + Validation (Semaine 2)

- [ ] Générer toutes les 101 pages (DeepSeek)
- [ ] Valider structure HTML (pas d'erreurs)
- [ ] Vérifier anti-duplication
- [ ] QA manuel : 10 pages au random
- [ ] Préparer liste vague 1 (10 pages)

### Phase 2 : Publication progressive (Semaines 3-8)

- [ ] Publier vague 1 (10 pages)
- [ ] Attendre 5-7j, vérifier indexation
- [ ] Publier vague 2 (15 pages)
- [ ] Rythme : 1 vague / 7-10 jours
- [ ] Monitorer rankings Search Console

### Phase 3 : Optimisation post-publication

- [ ] Améliorer pages non-rankées
- [ ] Renforcer maillage interne
- [ ] Ajouter backlinks internes
- [ ] Analyser taux de clics simulateur

---

## 📂 Structure Fichiers (Vue d'ensemble)

```
src/
├── data/
│   ├── baremes.json                      # ← Enrichir : taux_taxe_fonciere_par_dept
│   ├── taxe-fonciere-departements.json   # ← Créer : données complètes 101 depts
│   └── ...
├── pages/
│   ├── taxe.html                         # Calculateur principal (déjà existant)
│   ├── taxe-fonciere/
│   │   ├── index.html                    # ← Créer : page pilier
│   │   └── departements/
│   │       ├── paris-75.html             # ← Générer × 101
│   │       ├── nord-59.html
│   │       └── ...
│   └── ...
└── ...

scripts/
├── generate-taxe-fonciere-pages-deepseek.cjs    # ← Adapter du script notaire
├── validate-taxe-fonciere-duplication.cjs       # ← Créer
├── publish-taxe-fonciere-waves.cjs              # ← Créer : gestion des vagues
└── ...

reports/
├── deepseek-requests-taxe/                      # ← Généré : payloads
├── taxe-fonciere-duplication.json               # ← Généré : report anti-dup
└── taxe-fonciere-publication-log.json           # ← Généré : log par vague
```

---

## 🚀 Commandes à Ajouter au `package.json`

```json
{
  "scripts": {
    "generate:taxe-fonciere:dry-run": "node scripts/generate-taxe-fonciere-pages-deepseek.cjs",
    "generate:taxe-fonciere": "node scripts/generate-taxe-fonciere-pages-deepseek.cjs --run",
    "validate:taxe-fonciere:duplication": "node scripts/validate-taxe-fonciere-duplication.cjs",
    "publish:taxe-fonciere:wave": "node scripts/publish-taxe-fonciere-waves.cjs",
    "report:taxe-fonciere": "node scripts/generate-taxe-fonciere-report.cjs"
  }
}
```

---

## 📊 KPIs à Tracker

### Phase 1-2 (Génération)

- ✅ Pages générées sans erreur : 101/101
- ✅ Pas de doublons > 80% similarité : 0
- ✅ Temps moyen génération/page : < 2min
- ✅ Validité HTML : 100%

### Phase 3 (Déploiement)

- ✅ Indexation Google : 90%+ en 4 semaines
- ✅ Pages rankées pour requête cible (dept) : 80%+
- ✅ CTR simulateur depuis pages dept : > 15%
- ✅ Maillage interne : 100% des pages linkées

### Après publication complète

- ✅ Trafic supplémentaire : +XX% (SEO)
- ✅ Conversion vers simulateur : +XX%
- ✅ Présence IA (Perplexity, etc.) : suivi

---

## 💡 Points d'Attention

### ⚠️ À faire

1. **Données réelles** : Utiliser vrais taux communaux (DGFiP API ?)
2. **Anti-duplication stricte** : Vérifier avant chaque vague
3. **Déploiement lent** : Ne pas faire les 101 d'un coup
4. **Maillage interne** : Chaque page = hub pour "depts voisins"
5. **Monitoring continuous** : Search Console + Analytics

### ❌ À ÉVITER

1. **Templates génériques** : chaque page doit être unique
2. **Copier-coller** : même d'autres pages du site
3. **Publication rapide** : va créer duplication penalty
4. **Négliger le simulateur** : c'est le vrai KPI
5. **Mauvaise structure HTML** : va nuire au ranking

---

## 📝 Next Steps Immédiats

### Étape 1 : Validation données

```bash
# Créer et compléter taxe-fonciere-departements.json
npm run validate:taxe-fonciere:data
```

### Étape 2 : Adapter scripts

- Copier `generate-department-pages-deepseek.cjs`
- Adapter pour taxe foncière (données, prompt, URLs)
- Tester sur 3 depts en dry-run

### Étape 3 : Créer page pilier

- `/pages/taxe-fonciere/index.html`
- 1200 mots sur taxe foncière générale
- Maillage vers 101 pages + simulateur

### Étape 4 : Script anti-duplication

- Fuzzy matching sur intro + FAQ + exemples
- Générer report JSON
- Dashboard HTML pour validation avant publication

---

## 📖 Références

- ✅ Pages frais notaire : `src/pages/blog/departements/frais-notaire-*.html` (modèle)
- ✅ Script génération : `scripts/generate-department-pages-deepseek.cjs`
- ✅ Données barèmes : `src/data/baremes.json` (structure)
- ✅ Plan notaire : `scripts/README-GENERATION-BLOG.md`
- ✅ DeepSeek prompt : `scripts/deepseek-master-prompt.txt`

---

## 🎯 Verdict Final

Cette implémentation des 101 pages taxe foncière :

- ✅ Est **atteignable** (réplication du succès frais notaire)
- ✅ Aligne avec **stratégie SEO** (longue traîne × 101)
- ✅ Renforce **positionnement de référence** (1 moteur, 101 contextes)
- ✅ Augmente **rentabilité moyen terme** (traffic + simulateur)
- ✅ Respecte **bonnes pratiques SEO** (pas de duplication, déploiement lent)

**Status** : ✅ Prêt pour implémentation  
**Durée estimée** : 2-3 semaines (prépa + génération + publication par vagues)  
**Impact estimé** : +X00% trafic taxe foncière, renforcement domaine d'autorité
