# 🚀 PLAN D'ACTION MULTI-SCÉNARIOS 2026

## LesCalculateurs.fr — Stratégie de croissance

---

## 📌 VISION CLAIRE

Transformer le site d'une collection de "calculateurs isolés" → **un vrai "simulateur de décisions"** avec comparateurs multi-scénarios comme ADN.

---

## 🎯 PRIORITÉS ABSOLUES (Q1 2026)

### 1️⃣ **APL – Laboratoire UX** (2-3 jours)

**Statut actuel** : 65% conforme
**Objectif** : 95% conforme + ready-to-clone

#### Tasks (PHASE 1 - 8h)

- [ ] Ajouter **presets enfants** (0, 1, 2, 3) au-dessus du formulaire
- [ ] Implémenter **boutons ±revenus** (+200€, -200€, +500€, -500€)
- [ ] Ajouter **loyer variable** comme critère de comparaison
- [ ] Passer de **max 3 → max 5 scénarios**
- [ ] Générer **insights automatiques** après chaque comparaison
  - Ex: "Vous gagnez 85€/mois en passant de Zone 2 à Zone 1"
  - Auto-analyser quelle variable crée le delta max

#### Tasks (PHASE 2 - 8h)

- [ ] Ajouter **graphique comparatif** (Chart.js ou D3)
  - Barres : APL mensuelle/annuelle par scénario
  - Toggle : Montant absolu vs Écart %
- [ ] Impl URL shareable (encode comparaison en base64 dans `?scenario=...`)
- [ ] Tests + optimisations perf

**Livrables** :

- ✅ APL "wow factor" → cas de référence
- ✅ Code réutilisable pour Notaire, Prêt, Salaire
- ✅ Documentation architecture (1 jour = 1 nouveau comparateur)

---

### 2️⃣ **Frais de Notaire – Game Changer** (3-4 jours)

**Statut actuel** : Calculateur simple (pas de comparaison)
**Objectif** : Comparateur avec "Neuf vs Ancien", "Dept A vs B", "Prix variable"

#### MVP (PHASE 1)

- [ ] Clone structure APL → `comparaisonNotaire.ts`
- [ ] Variantes obligatoires :
  - [ ] **Bien** : Neuf vs Ancien
  - [ ] **Prix** : Presets (250k, 300k, 350k, 400k) + libre entry
  - [ ] **Département** : A, B, C (dropdown)
  - [ ] **Taux** : Réduit vs Standard
- [ ] Calcul des frais pour chaque scenario
- [ ] Affichage tableau + **économies réelles** en gras rouge/vert

#### Exemple affichage clé

```
Neuf 250k IDF Réduit    | Ancien 250k IDF Standard
12,500€                 | 12,200€
                        | -300€ (économie)
```

**Impact** :

- ⭐ Concurrent n'ont pas ça
- 📊 Trafic massif (immobilier)
- 💰 Backlinks faciles ("Comparez vos frais de notaire")

---

### 3️⃣ **Prêt Immobilier – Décisions pluriannuelles** (3-4 jours)

**Statut actuel** : Calculateur mensualités
**Objectif** : Comparateur sur **durée, taux, apport**

#### MVP (PHASE 1)

- [ ] Clone structure APL → `comparaisonPret.ts`
- [ ] Variantes :
  - [ ] **Durée** : 15, 20, 25 ans (presets + libre)
  - [ ] **Taux** : Presets (3.0%, 3.5%, 4.0%) + libre
  - [ ] **Apport** : 0%, 10%, 20%
  - [ ] **Montant** : Libre entry
- [ ] Affichage clé :
  - **Coût total du crédit** (intérêts)
  - **Écart sur la durée** (ex: "20 vs 25 ans = +50k€ de coûts")
  - **Mensualité vs Coût global**

#### Exemple

```
20 ans / 3.5% / 20%   | 25 ans / 3.5% / 20%    | Différence
€380/mois              | €310/mois              | -70€/mois
Coût total: €91k       | Coût total: €93k       | +2k€ total
```

**Impact** :

- 📊 Viral (emprunteurs cherchent comparaisons)
- 💡 Utile vraiment (choix 20 vs 25 ans change tout)
- 🔗 Backlinks élevés

---

### 4️⃣ **Salaire Brut/Net – Trafic de masse** (2-3 jours)

**Statut actuel** : Calculateur seul
**Objectif** : Comparateur statut (cadre vs non-cadre), PAS, primes

#### MVP (PHASE 1)

- [ ] Clone structure APL → `comparaisonSalaire.ts`
- [ ] Variantes :
  - [ ] **Statut** : Cadre vs Non-cadre
  - [ ] **PAS** : 0%, 5%, 10% (presets)
  - [ ] **Prime** : Oui/Non (ex: 2k€/an)
  - [ ] **Temps** : 100% vs 80%
- [ ] Affichage :
  - **Net mensuel** (colonne principale)
  - **Net annuel**
  - **Impact cadre** en rouge (ex: "-80€/mois non-cadre")

#### Exemple

```
Brut 3000€ Cadre 0%    | Brut 3000€ Non-cadre 0%  | ÉCART
Net: €2150              | Net: €2210               | +60€ cadre pénalisé
```

**Impact** :

- 📊 Volume énorme (tout salarié cherche)
- 💡 Simple à comprendre
- 🚀 Future monetization (boîtes de paye intégrées)

---

## 🧠 ARCHITECTURE RÉUTILISABLE

### Template générique : `ComparaisonBase.ts`

```typescript
// 1 seul pattern pour tous les comparateurs
interface Scenario {
  id: string;
  label: string;
  emoji: string;
  variables: Record<string, any>;
  result: number; // Montant principal (APL, frais, mensualité, net)
}

class ComparaisonBase {
  scenarios: Scenario[] = [];
  maxScenarios = 5;

  ajouterScenario(label, variables, resultNumber) {
    /* ... */
  }
  genererTableau() {
    /* ... */
  }
  genererGraphique() {
    /* ... */
  }
  genererInsights() {
    /* ... */
  }
  exportShareUrl() {
    /* ... */
  }
}
```

**Gain** : Une fois APL = 95% conforme, clonage = 4-6h par comparateur

---

## 📅 TIMELINE Q1 2026

| Semaine               | Task                | Effort | Status        |
| --------------------- | ------------------- | ------ | ------------- |
| **Sem 1** (Jan 13-17) | APL Phase 1         | 8h     | 📋 À démarrer |
| **Sem 1** (Jan 17-19) | APL Phase 2         | 8h     | 📋 À démarrer |
| **Sem 2** (Jan 20-24) | Notaire MVP         | 16h    | 🗓️ Planifié   |
| **Sem 3** (Jan 27-31) | Prêt MVP            | 16h    | 🗓️ Planifié   |
| **Sem 4** (Feb 3-7)   | Salaire MVP         | 12h    | 🗓️ Planifié   |
| **Sem 5** (Feb 10-14) | Optimisations + SEO | 8h     | 🗓️ Planifié   |

**Total** : ~60h de développement = **1.5 semaines full-time**

---

## 🎁 LIVRABLES PAR ÉTAPE

### ✅ Après APL (Sem 1)

- [ ] Audit PASSED (95% vs ChatGPT)
- [ ] Graphique + URL shareable
- [ ] Documentation architecture (pour clonage rapide)
- [ ] 5-10 scénarios exemples pré-cuits

### ✅ Après Notaire (Sem 2)

- [ ] Frais notaire comparateur live
- [ ] Contenu SEO "Comparez vos frais de notaire"
- [ ] 3-5 use cases viral

### ✅ Après Prêt (Sem 3)

- [ ] Prêt comparateur live
- [ ] Contenu "Comparaison 20 vs 25 ans"
- [ ] Schema.org enrichi

### ✅ Après Salaire (Sem 4)

- [ ] Salaire comparateur live
- [ ] "Cadre vs Non-cadre" viral
- [ ] Export PDF pour HR/boîtes

---

## 🎯 KPI À TRACKER

| Métrique                 | Baseline | Objectif (90j) | Impact |
| ------------------------ | -------- | -------------- | ------ |
| Temps moyen page         | 1m30s    | 3m00s          | +100%  |
| Pages/session            | 1.2      | 2.5            | +108%  |
| Taux retour              | 65%      | 40%            | -38%   |
| Backlinks (comparateurs) | 0        | 50+            | 🚀 SEO |
| Partages URL             | -        | 10+ par jour   | Viral  |
| Indexation Google        | 50 URLs  | 200+ URLs      | +300%  |

---

## 💡 QUICK WINS (Bonus)

- [ ] "Calculateur du jour" = un scenario pre-filled avec emoji
- [ ] Partage résultat sur WhatsApp/Twitter (snapshots)
- [ ] Mode "Dark" pour les graphiques
- [ ] Export PDF comparaison bruttée
- [ ] Intégration IA (ChatGPT résume recommandations)

---

## 🚨 RISQUES & MITIGATION

| Risque                       | Probabilité | Mitigation                          |
| ---------------------------- | ----------- | ----------------------------------- |
| Perf graphiques surcharge    | 🟡 Moyenne  | Lazy-load, cache résultats          |
| UX trop complexe             | 🟡 Moyenne  | Tests utilisateurs après APL        |
| Données deviennent obsolètes | 🟢 Basse    | Fetch barèmes 1x/jour via Worker    |
| Mobile responsiveness        | 🟡 Moyenne  | Stack Tailwind + tests mobile first |

---

## ✨ RÉSUMÉ POUR DÉMARRER

```
MAINTENANT (demain matin)
├─ Améliorer APL (Phase 1 = presets + ±revenus + loyer + insights)
├─ Documenter la nouvelle architecture
└─ Tests

SEMAINE 2
├─ Notaire comparateur
├─ Prêt comparateur
└─ Salaire comparateur

SEMAINE 3+
├─ Optimisations globales
├─ SEO + backlinks
└─ Monétisation
```

---

**Verdict** : 🟢 **FEUS VERTS** — Timing idéal, moyen de 60h, impact énorme 🔥
