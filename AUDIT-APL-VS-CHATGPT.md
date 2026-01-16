# 🔥 AUDIT COMPARATEUR APL vs RECOMMANDATIONS ChatGPT

## Date

10 janvier 2026

---

## 🎯 CONFORMITÉ ACTUELLE

### ✅ POINTS FORTS (Déjà en place)

| Critère                      | Status         | Détails                                |
| ---------------------------- | -------------- | -------------------------------------- |
| **Comparaison de scénarios** | ✅ Fonctionnel | Max 3 scénarios avec sessionStorage    |
| **Situation familiale**      | ✅ Conforme    | Célibataire, Couple, Monoparental      |
| **Revenus variables**        | ✅ Présent     | Champs de saisie libre                 |
| **Type logement**            | ✅ Présent     | Location, Accession, HLM               |
| **Zones géographiques**      | ✅ Présent     | Zone 1 (IDF), Zone 2, Zone 3 (DOM-TOM) |
| **Affichage des déltas**     | ✅ Présent     | Différences % et montant affichées     |
| **Persistance data**         | ✅ Conforme    | localStorage + restoration             |
| **UX: Ajout simple**         | ✅ Conforme    | Bouton modal clair                     |
| **Visuels**                  | ✅ Présent     | Emojis + couleurs (vert max APL)       |

---

### ❌ MANQUES CRITIQUES (vs ChatGPT)

#### 1️⃣ **Scénarios incomplets** (ChatGPT : 👶 0 / 1 / 2 / 3 enfants)

- **Actuel** : `nombreEnfants` existe mais pas de variation forcée dans l'interface
- **Problème** : L'utilisateur doit manuellement changer les enfants - pas assez "présenté"
- **Fix** : Proposer des presets (0, 1, 2, 3 enfants) comme exemples

#### 2️⃣ **Revenus ±200 / ±500 €** (ChatGPT)

- **Actuel** : Libre entry, sans suggestions d'écarts
- **Problème** : Utilisateur ne sait pas quels montants tester
- **Fix** : Ajouter des boutons "+200€ / -200€ / +500€ / -500€" directement en UI

#### 3️⃣ **Loyer variables** (critère oublié !)

- **Actuel** : APL dépend fortement du loyer, pas présent en comparaison
- **Problème** : Manque de granularité pour "Location vs Accession"
- **Fix** : Ajouter loyer comme variable de comparaison explicite

#### 4️⃣ **Max 3 scénarios** (bottleneck UX)

- **Actuel** : Limité à 3
- **ChatGPT** : "Ajouter scénario = bouton clair" (illimité avec gestion d'affichage)
- **Fix** : Passer à 5-6 scénarios max avec scroll horizontal ou grille compacte

#### 5️⃣ **Texte explicatif automatique**

- **Actuel** : Conseils statiques "Ce que vous voyez" / "Comment l'utiliser"
- **Problem** : Pas d'interprétation auto des résultats (ex: "Vous gagnez 200€ en passant de...")
- **Fix** : Générer dynamiquement des insights après chaque comparaison

#### 6️⃣ **Aucun graphique**

- **Actuel** : Tableau uniquement
- **ChatGPT** : Pas explicite mais UX exige visualisation comparative
- **Fix** : Graphique en barres (APL mensuelle) ou courbes (par revenus)

#### 7️⃣ **Pas de call-to-action "pourquoi vous économisiez"**

- **Actuel** : Juste les montants
- **ChatGPT** : "Combien je perds ou gagne en changeant une seule variable"
- **Fix** : Analyser automatiquement quelle variable a le plus d'impact

#### 8️⃣ **Stockage sessionStorage seulement**

- **Actuel** : Les données disparaissent à la fermeture du navigateur
- **ChatGPT** : Implicite : permettre un snapshot partageable
- **Fix** : localStorage + URL shareable (encoded)

---

## 📊 TABLEAU SYNTHÉTIQUE : RECOMMANDATION vs IMPLÉMENTATION

```
RECOMMANDATION ChatGPT         | IMPLÉMENTATION ACTUELLE    | CONFORMITÉ
─────────────────────────────────────────────────────────────────────
Célibataire vs Couple          | ✅ Présent                 | 100%
0 / 1 / 2 / 3 enfants          | ⚠️ Libre, pas de presets   | 40%
HLM vs privé                   | ✅ Présent (accession)     | 80%
Zone 1 / 2 / 3 / DOM           | ✅ Présent                 | 100%
Revenus ±200 / ±500 €          | ❌ Absent (calcul libre)   | 0%
"Combien je gagne"             | ⚠️ Delta affiché, pas auto  | 50%
Max 2-3 comparaisons           | ⚠️ Limité à 3              | 100% BUT RIGIDE
Bouton "ajouter scénario"      | ✅ Présent                 | 100%
Diff en gras + couleur         | ✅ Présent                 | 100%
Texte explicatif automatique   | ❌ Absent                  | 0%
```

---

## 🎯 SCORE GLOBAL DE CONFORMITÉ

**Comptabilité : 65%** (6.5 / 10)

- ✅ Les fondations existent
- ⚠️ L'UX reste "basique" vs "simulateur de décisions"
- ❌ Pas assez de "guidance" pour l'utilisateur

---

## 🚀 IMPACT POTENTIEL DES FIXES

| Fix                       | Impact SEO     | Impact UX          | Effort |
| ------------------------- | -------------- | ------------------ | ------ |
| Presets enfants (0/1/2/3) | 🟢 Bon         | 🟢 Clarifie        | 1h     |
| Boutons ±revenus          | 🟢 Très bon    | 🟢🟢 Rend intuitif | 2h     |
| Loyer variable            | 🟢🟢 Excellent | 🟢 Complète        | 3h     |
| Graphique comparatif      | 🟢🟢 Excellent | 🟢🟢 Wow factor    | 4h     |
| Insights auto             | 🟢🟢 Excellent | 🟢🟢 Viral         | 5h     |
| URL shareable             | 🟢 Bon         | 🟢 Retention       | 3h     |
| Max 5-6 scénarios         | 🟡 Neutre      | 🟢 Plus flexible   | 1h     |

---

## ✅ PRIORITÉ D'ACTION

### 🥇 PHASE 1 (Immédiate) - 8h total

1. **Presets enfants** (1h)
2. **Boutons ±revenus** (2h)
3. **Loyer variable** (3h)
4. **Max 5 scénarios** (1h)
5. **Insights auto** (1h)

### 🥈 PHASE 2 (Court terme) - 8h

6. **Graphique comparatif** (4h)
7. **URL shareable** (3h)
8. **Tests & optimisations** (1h)

### 🥉 PHASE 3 (Moyen terme)

9. Cloner architecture → **Frais Notaire**
10. Cloner architecture → **Prêt Immo**
11. Cloner architecture → **Salaire Brut/Net**

---

## 📋 RÉSUMÉ POUR CHATGPT PROMPT

**"Notre comparateur APL couvre 65% des recommandations. Pour le passer à 95%, on doit :"**

1. Rendre les scénarios plus "guidés" (presets enfants, ±revenus)
2. Ajouter loyer comme paramètre de comparaison
3. Générer automatiquement des insights ("vous économisez X€ en...")
4. Visualiser en graphique
5. Rendre shareable (URL)

**Résultat attendu** : APL devient le "laboratoire UX" du site, prêt à être cloné 3x (Notaire, Prêt, Salaire)
