# ⚡ QUICKSTART : 101 Pages Taxe Foncière

**Lire d'abord :** [TAXE-FONCIERE-README.md](TAXE-FONCIERE-README.md) (5 min)  
**Puis :** Ce guide (10 min)

---

## 🎯 En 30 secondes

Tu veux créer **101 pages uniques** (1 par département) pour capter du SEO sur "taxe foncière {département}" + pousser vers le simulateur.

- ✅ Modèle testé : frais-notaire (101 pages générées avec succès)
- ✅ Approche : même structure, contenu unique par dept
- ✅ Timeline : 3 semaines (prépa) + 6 semaines (déploiement par vagues)
- ✅ Coût : API DeepSeek (~100-200€ pour 101 pages)
- ✅ Impact : +300-500% trafic potentiel (comparé frais-notaire)

---

## 🚀 Les 3 Commandes Principales

```bash
# 1. Tester générations (dry-run, GRATUIT)
npm run generate:taxe-fonciere:dry-run

# 2. Vérifier duplication (gratuit)
npm run validate:taxe-fonciere:duplication

# 3. Générer les 101 pages réelles (PAYANT)
npm run generate:taxe-fonciere -- --run
```

---

## 📋 Checklist d'Implémentation (Phase 1 : 2 jours)

### Jour 1 - Préparation

**[ ] Tâche 1 : Données (1h)**

```bash
# Créer : src/data/taxe-fonciere-departements.json
# Copier structure du template (TAXE-FONCIERE-TEMPLATE-EXEMPLES.md)
# Remplir 101 depts (code, nom, région, taux, montants)
# Valider : npm run validate:taxe-fonciere:data
```

**[ ] Tâche 2 : Prompt (1h)**

```bash
# Créer : scripts/deepseek-master-prompt-taxe-fonciere.txt
# Copier du prompt notaire : scripts/deepseek-master-prompt.txt
# Adapter pour taxe foncière (voir SPECIFICATIONS)
# Rajouter clause anti-duplication stricte
```

**[ ] Tâche 3 : Script génération (1.5h)**

```bash
# Copier : scripts/generate-department-pages-deepseek.cjs
#    vers : scripts/generate-taxe-fonciere-pages-deepseek.cjs
# Modifier :
#   - Chemin données : baremes.json → taxe-fonciere-departements.json
#   - Prompt : deepseek-master-prompt.txt → taxe-fonciere version
#   - Output : pages/blog/departements/ → pages/taxe-fonciere/departements/
#   - URL : /frais-notaire-{code} → /pages/taxe-fonciere/{dept}-{code}
#   - Filename : frais-notaire-{code}.html → {dept}-{code}.html
```

**[ ] Tâche 4 : Page mère (1h)**

```bash
# Créer : src/pages/taxe-fonciere/index.html
# Structure :
#   - H1 + intro générale (300 mots)
#   - Simulateur
#   - 5-6 sections thématiques
#   - Index des 101 pages (tableau)
#   - CTA simulateur
# Référence : src/pages/blog.html (blog des frais notaire)
```

**[ ] Tâche 5 : Script validation (1h)**

```bash
# Créer : scripts/validate-taxe-fonciere-duplication.cjs
# Doit :
#   - Analyser les 101 pages générées
#   - Fuzzy matching : intro, FAQ, exemples
#   - Flag pages > 80% similaires
#   - Générer JSON report
# Ref : scripts/check-duplication-fuzzy.cjs
```

**✅ Fin du jour 1 : Infrastructure prête**

---

### Jour 2 - Tests & Génération

**[ ] Tâche 6 : Dry-run (30 min)**

```bash
npm run generate:taxe-fonciere:dry-run

# Vérifier :
# ✅ Payloads générés → reports/deepseek-requests-taxe/
# ✅ 101 fichiers JSON
# ✅ Chaque payload contient données correctes
```

**[ ] Tâche 7 : Générer les 101 pages (2-4h)**

```bash
# Vérifier DeepSeek API key
echo $DEEPSEEK_API_KEY
# Doit afficher : sk-xxxxx

# Lancer génération
npm run generate:taxe-fonciere -- --run

# (Laisse tourner, ~1-2min par page)
# Si timeout : npm run generate:taxe-fonciere -- --run --resume
```

**[ ] Tâche 8 : Vérifier résultat (30 min)**

```bash
# Compter les pages générées
ls src/pages/taxe-fonciere/departements/*.html | wc -l
# Doit afficher : 101

# Vérifier une page au hasard
cat src/pages/taxe-fonciere/departements/paris-75.html | head -50
# Doit avoir : DOCTYPE, title, meta, contenu

# Lancer tests
npm run test:taxe-fonciere:html
npm run test:taxe-fonciere:structure
```

**[ ] Tâche 9 : Anti-duplication (1h)**

```bash
npm run validate:taxe-fonciere:duplication

# Ouvrir rapport
open reports/taxe-fonciere-validation.html

# Vérifier : vert = OK, orange = review, rouge = rejeter
# Si pages > 80% similaires : npm run fix:taxe-fonciere:duplicates
```

**[ ] Tâche 10 : QA manuel (1h)**

```bash
npm run dev

# Visiter dans le navigateur :
# - http://localhost:5173/pages/taxe-fonciere/
# - http://localhost:5173/pages/taxe-fonciere/paris-75
# - http://localhost:5173/pages/taxe-fonciere/nord-59
# - ... (8 autres au hasard)

# Checklist pour chaque :
# [ ] Layout OK (desktop/mobile)
# [ ] Simulateur charge
# [ ] Liens fonctionnent
# [ ] Pas d'erreurs JS
# [ ] Texte lisible
```

**✅ Fin du jour 2 : 101 pages générées et validées**

---

## 📈 Phase 2 : Publication (Semaines 3-8)

### Semaine 3 : Vague 1

```bash
# Publier 10 premières pages (plus grandes villes)
npm run publish:taxe-fonciere:wave -- --wave 1

# Attendre 5-7 jours
# Monitorer indexation : Search Console
```

### Semaines 4-8 : Vagues 2-6

```bash
# Publier par semaine (15 / 20 / 25 / 15 / 16 pages)
npm run publish:taxe-fonciere:wave -- --wave 2
# (attendre 7 jours)
npm run publish:taxe-fonciere:wave -- --wave 3
# (attendre 7 jours)
# etc.
```

---

## 🎯 Priorités Absolues

### ❌ À NE PAS FAIRE

1. **Ne pas publier les 101 d'un coup** ← Google va pénaliser
2. **Ne pas laisser les pages génériques** ← Besoin anti-duplication
3. **Ne pas oublier la page mère** ← Sinon pas de maillage
4. **Ne pas coper-coller des articles** ← Va cannibaliser SEO
5. **Ne pas générer sans données correctes** ← Données = qualité

### ✅ À ABSOLUMENT FAIRE

1. **Utiliser prompt anti-duplication** ← Clé du succès
2. **Valider avant publication** ← Pas d'erreurs HTML
3. **Déployer par vagues** ← Respecter délai 7-10j
4. **Monitorer indexation** ← Vérifier que pages rankent
5. **Tester manuellement** ← Au moins 10 pages

---

## 💰 Coûts

### DeepSeek API

- **Modèle** : deepseek-chat
- **Coût** : ~$0.0014 par 1K tokens en input, ~$0.0006 par 1K tokens en output
- **Estimé** : ~100-150€ pour 101 pages

### Infrastructure

- **Hosting** : Vercel (déjà utilisé)
- **Build** : ~1-2 sec par page supplémentaire
- **Coût** : 0€ (inclus plan existant)

---

## 📊 Timeline

| Phase                                       | Durée             | Qui | Quand   |
| ------------------------------------------- | ----------------- | --- | ------- |
| Préparation (données + scripts + page mère) | 2 jours           | Dev | Sem 1   |
| Tests & génération 101 pages                | 1 jour            | Dev | Sem 1   |
| Validation + QA                             | 1 jour            | Dev | Sem 2   |
| Vague 1 publication + monitoring            | 1 semaine         | Ops | Sem 3   |
| Vagues 2-6 publication                      | 5 semaines        | Ops | Sem 4-8 |
| **Total**                                   | **~8-9 semaines** |     |         |

---

## 🔗 Documentation Complète

| Document                                                                                 | Quoi                            | Quand le lire             |
| ---------------------------------------------------------------------------------------- | ------------------------------- | ------------------------- |
| [TAXE-FONCIERE-PLAN-101-PAGES.md](TAXE-FONCIERE-PLAN-101-PAGES.md)                       | Stratégie complète              | Avant de commencer        |
| [TAXE-FONCIERE-SPECIFICATIONS-TECHNIQUES.md](TAXE-FONCIERE-SPECIFICATIONS-TECHNIQUES.md) | Comment faire techniquement     | Pendant implémentation    |
| [TAXE-FONCIERE-TEMPLATE-EXEMPLES.md](TAXE-FONCIERE-TEMPLATE-EXEMPLES.md)                 | Templates HTML + exemples       | Pour écrire page mère     |
| [TAXE-FONCIERE-README.md](TAXE-FONCIERE-README.md)                                       | Guide d'implémentation détaillé | Pour les tâches précises  |
| **Ce fichier**                                                                           | Quickstart                      | Pour commencer rapidement |

---

## 🎬 Go ! (Commande d'démarrage)

```bash
# 1. Créer structure fichiers
mkdir -p src/pages/taxe-fonciere/departements
mkdir -p reports/deepseek-requests-taxe

# 2. Créer fichier données (vide, remplir après)
touch src/data/taxe-fonciere-departements.json

# 3. Créer prompt
touch scripts/deepseek-master-prompt-taxe-fonciere.txt

# 4. Copier script génération
cp scripts/generate-department-pages-deepseek.cjs scripts/generate-taxe-fonciere-pages-deepseek.cjs

# 5. Commencer à remplir données
# (Voir TAXE-FONCIERE-TEMPLATE-EXEMPLES.md pour template)
```

---

## ❓ Questions ?

- **Quelle est la stratégie générale ?** → [PLAN-101-PAGES.md](TAXE-FONCIERE-PLAN-101-PAGES.md)
- **Comment générer techniquement ?** → [SPECIFICATIONS-TECHNIQUES.md](TAXE-FONCIERE-SPECIFICATIONS-TECHNIQUES.md)
- **À quoi doit ressembler une page ?** → [TEMPLATE-EXEMPLES.md](TAXE-FONCIERE-TEMPLATE-EXEMPLES.md)
- **Quelle est la checklist précise ?** → [README.md](TAXE-FONCIERE-README.md)

---

## ✅ Checklist Final Pre-Launch

- [ ] Fichier données complété (101 depts)
- [ ] Prompt DeepSeek créé + testé
- [ ] Script génération adapté
- [ ] Page mère créée
- [ ] Dry-run passé (100 payloads générés)
- [ ] 101 pages générées sans erreurs HTML
- [ ] Anti-duplication < 70% moyenne
- [ ] QA manuel : 10 pages OK
- [ ] Maillage interne complété
- [ ] Sitemap updated
- [ ] DeepSeek API key valide
- [ ] Prêt à publier vague 1 ✅

---

**Status** : Documentation complète, prêt pour implémentation  
**Next** : Commencer jour 1 tâches  
**Success = 101 pages rankant pour leur requête cible en 6 semaines**
