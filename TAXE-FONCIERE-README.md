# 🚀 Implementation Guide : 101 Pages Taxe Foncière

**Status** : ✅ Préparation complète - Prêt pour implémentation  
**Date** : Janvier 2026  
**Durée estimée** : 2-3 semaines

---

## 📖 Documentation Complète

Ce projet est documenté en **3 fichiers distincts** :

### 1️⃣ [TAXE-FONCIERE-PLAN-101-PAGES.md](TAXE-FONCIERE-PLAN-101-PAGES.md)

**📊 Vue stratégique et planning**

- Objectifs SEO
- Architecture générale (URLs, hiérarchie)
- Données minimales requises
- Structure de page standard
- Génération du contenu
- Anti-duplication
- Maillage interne
- Déploiement progressif (par vagues)
- Checklist d'implémentation
- KPIs à tracker

👉 **À lire en priorité** : comprendre la stratégie globale

---

### 2️⃣ [TAXE-FONCIERE-SPECIFICATIONS-TECHNIQUES.md](TAXE-FONCIERE-SPECIFICATIONS-TECHNIQUES.md)

**🔧 Spécifications techniques et exécution**

- Prérequis techniques (données sources)
- Structure fichiers détaillée
- Prompt DeepSeek (adapter du modèle notaire)
- Pipeline de génération (8 étapes)
- Tests & validation
- Monitoring post-publication
- Troubleshooting

👉 **À consulter** : pour savoir comment faire techniquement

---

### 3️⃣ [TAXE-FONCIERE-TEMPLATE-EXEMPLES.md](TAXE-FONCIERE-TEMPLATE-EXEMPLES.md)

**📐 Template HTML et exemples de contenu**

- Structure HTML standard
- Exemples JSON (5 départements : 75, 59, 69, 13, 974)
- Exemple de contenu généré par département
- Checklist anti-duplication

👉 **À consulter** : pour les templates et exemples concrets

---

## 🎯 Prochaines Actions (Phase 1 : Préparation)

### Semaine 1 - Préparation

#### ✅ Tâche 1 : Enrichir les données

```bash
# Créer src/data/taxe-fonciere-departements.json
# Compléter avec 101 départements (voir template dans doc 3)
# Vérifier : tous les 101 codes présents
# Valider : pas de duplicatas

npm run validate:taxe-fonciere:data
# Doit afficher : ✅ 101 departments loaded
```

**Données nécessaires par département :**

- Code (01-95, 971-976)
- Nom
- Région
- Taux moyen communal
- Montant moyen taxe foncière
- Base locative moyenne
- Type territoire + prix immobilier

**Où récupérer** : DGFiP, INSEE, data.gouv.fr (voir doc 2 pour sources)

---

#### ✅ Tâche 2 : Adapter script de génération

Copier et adapter `scripts/generate-department-pages-deepseek.cjs` pour taxe foncière :

```javascript
// À modifier :
// 1. Chemin source : baremes.json → taxe-fonciere-departements.json
// 2. Prompt source : deepseek-master-prompt.txt → deepseek-master-prompt-taxe-fonciere.txt
// 3. Output path : pages/blog/departements/ → pages/taxe-fonciere/departements/
// 4. URL template : /frais-notaire-{code} → /pages/taxe-fonciere/{dept}-{code}
// 5. Filename pattern : frais-notaire-{code}.html → {dept}-{code}.html

Créer: scripts / generate - taxe - fonciere - pages - deepseek.cjs;
```

**Points clés à adapter :**

- Les chemins de fichiers
- Les template URLs
- Le titre/description de page
- Les chemins relatifs (remonte 3 niveaux au lieu de 2)

---

#### ✅ Tâche 3 : Créer page mère

Créer `/src/pages/taxe-fonciere/index.html` (1200-1500 mots)

**Structure suggérée :**

1. H1 : "Taxe Foncière 2025 - Calculer et Comprendre par Département"
2. Intro générale (300 mots)
   - Qu'est-ce que la taxe foncière
   - Qui paie
   - Comment elle fonctionne
3. Simulateur intégré
4. 5-6 H2 thématiques (100-150 mots chacun)
   - Taux nationaux
   - Variations régionales
   - Facteurs influant
   - Exonérations
   - Déductions possibles
   - Comparaisons
5. Index des 101 pages (tableau + liens)
6. CTA simulateur + sources

**Important :** Cette page doit linker vers les 101 pages + être linkée depuis elles

---

#### ✅ Tâche 4 : Créer prompt DeepSeek

Créer `scripts/deepseek-master-prompt-taxe-fonciere.txt`

Adapter du prompt notaire (voir doc 2 pour template complet)

**Points clés :**

- ⚠️ Anti-duplication stricte (bien mentionner)
- 700-900 mots
- 7 sections : intro, simulateur, fourchette, facteurs, exemple, FAQ, CTA
- HTML + Tailwind CSS
- Chaque section unique au département

---

#### ✅ Tâche 5 : Créer script anti-duplication

```bash
# Créer : scripts/validate-taxe-fonciere-duplication.cjs
```

**Ce script doit :**

- Lire toutes les 101 pages HTML générées
- Analyser similarité intro/FAQ/exemples (fuzzy matching)
- Flag pages avec > 80% similarité
- Générer JSON report + HTML visual
- Lister actions correctives

**Librairie** : `string-similarity` (npm install si absent)

---

#### ✅ Tâche 6 : Tester sur 3-5 départements

```bash
# Dry-run : générer payloads sans appeler API
npm run generate:taxe-fonciere:dry-run

# Vérifier les payloads générés
ls -la reports/deepseek-requests-taxe/ | head -10

# Vérifier structure JSON (exemple : 75)
cat reports/deepseek-requests-taxe/75-paris.json | head -50
```

**À vérifier :**

- Structure JSON correcte
- Contenu pertinent du département
- Pas d'erreur encoding

---

### Semaine 2 - Génération & Validation

#### ✅ Tâche 7 : Générer toutes les 101 pages

```bash
# ⚠️ AVANT : vérifier DeepSeek API key en .env
# DEEPSEEK_API_KEY=sk-xxxxx

# Générer (va coûter)
npm run generate:taxe-fonciere -- --run

# Optionnel : ajouter délai entre appels
npm run generate:taxe-fonciere -- --run --delay 1000
```

**Durée estimée** : 2-4h (101 pages × ~1-2min par page)

**Vérifier après :**

```bash
# Doit avoir 101 fichiers
ls -la src/pages/taxe-fonciere/departements/*.html | wc -l
# Output : 101
```

---

#### ✅ Tâche 8 : Valider HTML & structure

```bash
# Test structure HTML
npm run test:taxe-fonciere:html

# Test longueur + sections
npm run test:taxe-fonciere:structure

# Test SEO basique
npm run test:taxe-fonciere:seo

# Tous les tests doivent passer à ~100%
```

**Si problèmes** :

- Corriger manuellement les pages affectées
- Ou régénérer avec prompt affiné

---

#### ✅ Tâche 9 : Vérifier anti-duplication

```bash
# Analyser duplication
npm run validate:taxe-fonciere:duplication

# Ouvrir le rapport HTML
open reports/taxe-fonciere-validation.html

# Vérifier dans le navigateur :
# - Vert = OK (< 70% similarité)
# - Orange = À review (70-80%)
# - Rouge = Rejeter (> 80%)
```

**Si pages > 80% similaires :**

```bash
# Régénérer pages problématiques
npm run fix:taxe-fonciere:duplicates -- --interactive
# (va demander quelles pages, puis les régénère)
```

---

#### ✅ Tâche 10 : QA manuel (10 pages)

Vérifier visuellement 10 pages au hasard :

```bash
npm run dev
# http://localhost:5173/pages/taxe-fonciere/paris-75
# http://localhost:5173/pages/taxe-fonciere/nord-59
# ... (tester 8 autres au hasard)
```

**Checklist pour chaque page :**

- [ ] Layout responsive (mobile/tablet/desktop)
- [ ] Simulateur charge et fonctionne
- [ ] Liens internes valides
- [ ] Pas d'erreurs JS (console)
- [ ] Images charge (hero)
- [ ] Tableau s'affiche bien
- [ ] Text lisible (contrast OK)
- [ ] CTA visible et cliquable

---

### Semaine 3 - Publication Progressive

#### ✅ Tâche 11 : Préparer vague 1

```bash
# Générer plan de publication
npm run plan:taxe-fonciere:waves

# Ou utiliser defaults (grandes villes d'abord)
npm run plan:taxe-fonciere:waves -- --preset default

# Affiche :
# Wave 1 (10 pages) : 75, 59, 69, 13, 92, 75, 77, 78, 91, 95
# ...
```

**Vague 1 recommandée** : 10 grandes villes/métropoles pour tester

---

#### ✅ Tâche 12 : Publier vague 1

```bash
# Build + push vague 1
npm run publish:taxe-fonciere:wave -- --wave 1

# Output :
# ✅ Wave 1 published (10 pages)
# ✅ Sitemap updated (111 → 121 URLs)
# ✅ Deploy to production
```

**Après publication :**

1. Vérifier site live : https://lescalculateurs.fr/pages/taxe-fonciere/
2. Tester 3 pages
3. Vérifier analytics
4. **Attendre 5-7 jours avant vague 2**

---

## 📊 Timeline Complète

| Semaine | Tâche                            | Durée      | Status     |
| ------- | -------------------------------- | ---------- | ---------- |
| 1       | Enrichir données                 | 1-2h       | ⏳ À faire |
| 1       | Adapter script génération        | 2-3h       | ⏳ À faire |
| 1       | Créer page mère                  | 2-3h       | ⏳ À faire |
| 1       | Créer prompt DeepSeek            | 1-2h       | ⏳ À faire |
| 1       | Script anti-duplication          | 2-3h       | ⏳ À faire |
| 1       | Tester sur 3-5 depts             | 1h         | ⏳ À faire |
| 2       | Générer 101 pages                | 2-4h       | ⏳ À faire |
| 2       | Valider HTML/structure           | 1-2h       | ⏳ À faire |
| 2       | Vérifier anti-duplication        | 2-3h       | ⏳ À faire |
| 2       | QA manuel (10 pages)             | 1-2h       | ⏳ À faire |
| 3       | Préparer vague 1                 | 30min      | ⏳ À faire |
| 3       | Publier vague 1                  | 30min      | ⏳ À faire |
| 3-8     | Publier vagues 2-6 (par semaine) | 6 semaines | ⏳ À faire |

**Total : ~3 semaines (génération) + 6 semaines (publication progressive)**

---

## 🎯 Success Criteria

### Phase de génération (Semaine 1-2)

- ✅ 101 pages générées sans erreur HTML
- ✅ < 70% similarité moyenne inter-pages
- ✅ 100% pages passent tests HTML + SEO
- ✅ Simulateur fonctionne sur 100% pages
- ✅ Maillage interne complété

### Phase de publication (Semaine 3-8)

- ✅ Vague 1 : 100% indexée en 7j
- ✅ Vague 2 : 95%+ indexée en 7j après publication
- ✅ Vagues 3-6 : 90%+ indexée
- ✅ CTR vers simulateur : > 10%
- ✅ Aucune pénalité Google (Duplicate Content)

### Post-publication (4-6 semaines)

- ✅ Ranking sur 80%+ des requêtes ciblées
- ✅ +X% trafic organique vs baseline
- ✅ Conversion vers simulateur maintenue

---

## 💡 Points Critiques

### 🔴 Risques à éviter

1. **Publication rapide** : Si tu publies les 101 pages d'un coup, Google va pénaliser pour duplication/freshness

   - ✅ Solution : Respecter déploiement par vagues (10/15/20/25/15/16)

2. **Contenus génériques** : Si le contenu est trop similaire, les pages vont cannibaliser mutuellement

   - ✅ Solution : Strict anti-duplication, prompt bien construit, prompt QA

3. **Données incomplètes/fausses** : Les données de base locative/taux vont influencer pertinence

   - ✅ Solution : Valider sources DGFiP + INSEE avant génération

4. **Simulateur qui ne fonctionne pas** : Si l'intégration du composant calculateur échoue, pages sans valeur
   - ✅ Solution : Tester sur 5-10 pages avant de générer les 101

### 🟡 Points d'attention

- Déployer avec Vercel dès vague 1 (ISR ou rebuilds progressifs)
- Soumettre sitemap à Google Search Console après chaque vague
- Monitorer taux d'indexation jour J+1, J+3, J+7 après publication

---

## 📚 Ressources

### Documents créés

- 📄 [TAXE-FONCIERE-PLAN-101-PAGES.md](TAXE-FONCIERE-PLAN-101-PAGES.md) - Stratégie
- 📄 [TAXE-FONCIERE-SPECIFICATIONS-TECHNIQUES.md](TAXE-FONCIERE-SPECIFICATIONS-TECHNIQUES.md) - Technique
- 📄 [TAXE-FONCIERE-TEMPLATE-EXEMPLES.md](TAXE-FONCIERE-TEMPLATE-EXEMPLES.md) - Templates

### Codes de référence (existants)

- 📁 `src/pages/blog/departements/` - Modèle (frais notaire)
- 📄 `scripts/generate-department-pages-deepseek.cjs` - Script de base
- 📄 `scripts/deepseek-master-prompt.txt` - Prompt de base
- 📄 `src/data/baremes.json` - Données barèmes

### Outils externes

- DeepSeek API (clef requise dans .env)
- Google Search Console (monitoring)
- Google Analytics (tracking)

---

## ✅ Avant de commencer

1. ✅ Lire [TAXE-FONCIERE-PLAN-101-PAGES.md](TAXE-FONCIERE-PLAN-101-PAGES.md) (stratégie générale)
2. ✅ Consulter [TAXE-FONCIERE-SPECIFICATIONS-TECHNIQUES.md](TAXE-FONCIERE-SPECIFICATIONS-TECHNIQUES.md) (comment faire)
3. ✅ Revoir [TAXE-FONCIERE-TEMPLATE-EXEMPLES.md](TAXE-FONCIERE-TEMPLATE-EXEMPLES.md) (exemples)
4. ✅ Vérifier DeepSeek API key (elle doit être active et financée)
5. ✅ Préparer données 101 depts (DGFiP/INSEE)

---

## 🚀 Go !

**Pour commencer immédiatement (Phase 1 - Semaine 1) :**

```bash
# 1. Créer fichiers de données
touch src/data/taxe-fonciere-departements.json
# (Remplir avec 101 depts, voir template doc 3)

# 2. Créer prompt DeepSeek
touch scripts/deepseek-master-prompt-taxe-fonciere.txt
# (Adapter du prompt notaire, voir doc 2)

# 3. Adapter script génération
cp scripts/generate-department-pages-deepseek.cjs scripts/generate-taxe-fonciere-pages-deepseek.cjs
# (Modifier chemins/URLs, voir doc 2)

# 4. Tester sur 3 depts (dry-run)
npm run generate:taxe-fonciere:dry-run

# 5. Vérifier payloads
ls -la reports/deepseek-requests-taxe/ | head -5
```

**Durée Phase 1** : ~2 jours de travail (16-20h)

---

## 📞 Questions ?

Revoir les sections correspondantes :

- ❓ Comment générer ? → Doc 2 (Pipeline)
- ❓ Comment structurer ? → Doc 3 (Templates)
- ❓ Comment déployer ? → Doc 1 (Déploiement progressif)
- ❓ Comment valider ? → Doc 2 (Tests & Validation)

---

**Status** : ✅ Documentation complète + ready to implement  
**Next** : Commencer Phase 1 (données + scripts)
