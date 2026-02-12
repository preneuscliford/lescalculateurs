# 🔍 AUDIT DES BARÈMES 2026 - RAPPORT DU 12 FÉVRIER 2026

> **Date de l'audit** : 12 février 2026  
> **Auditeur** : Kimi Code CLI  
> **Statut** : ⚠️ PLUSIEURS INCORRECTIONS CRITIQUES DÉTECTÉES

---

## 📊 SYNTHÈSE GÉNÉRALE

| Simulateur | Statut | Problèmes | Priorité |
|------------|--------|-----------|----------|
| SMIC / Salaire | 🔴 **NON CONFORME** | Montant SMIC obsolète (2024) | CRITIQUE |
| Impôt sur le revenu | 🟡 **PARTIELLEMENT CONFORME** | Seuils légèrement décalés | MOYENNE |
| RSA | 🟢 **CONFORME** | À jour | - |
| Prime d'activité | 🟡 **À VÉRIFIER** | Sources contradictoires | MOYENNE |
| APL | 🟢 **CONFORME** | Estimation réaliste | - |
| ARE | 🟡 **PARTIELLEMENT CONFORME** | Montant min ARE obsolète | MOYENNE |
| ASF | 🔴 **NON CONFORME** | Montant par enfant incorrect | CRITIQUE |
| AAH | 🟢 **CONFORME** | À jour | - |
| Frais de notaire | 🟢 **CONFORME** | À jour | - |
| Indemnités kilométriques | 🔴 **NON CONFORME** | Taux 2024 obsolètes | CRITIQUE |

---

## 🔴 ERREURS CRITIQUES (À CORRIGER IMMÉDIATEMENT)

### 1. SMIC 2026 - MONTANT OBSOLÈTE

**Fichiers concernés :**
- `src/pages/salaire-brut-net-calcul-2026.html` (lignes 140-141, 837, 942)
- `src/utils/salaireCalculEngine.ts` (commentaires)

**Valeur actuelle sur le site :**
- SMIC horaire brut : 11,88 € ❌
- SMIC mensuel brut : ~1 802 € ❌
- SMIC mensuel net : ~1 426 € ❌

**Valeur officielle 2026 (depuis le 1er janvier 2026) :**
- SMIC horaire brut : **12,02 €** ✅
- SMIC mensuel brut (35h) : **1 823,03 €** ✅
- SMIC mensuel net estimé : **1 443,11 €** ✅

**Sources officielles :**
- https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/montant-smic.html
- https://travail-emploi.gouv.fr/revalorisation-annuelle-du-smic-au-1er-janvier-2026

**Impact :** Fort - Les utilisateurs obtiennent des calculs de salaire incorrects

---

### 2. ASF (Allocation de Soutien Familial) - MONTANT INCORRECT

**Fichier concerné :**
- `src/utils/asfCalculEngine.ts` (ligne 47)

**Valeur actuelle :**
- Montant par enfant : 176,5 € ❌

**Valeur officielle 2026 :**
- Montant par enfant (cas général) : **199,19 €** ✅
- Montant majoré : **265,51 €** ✅

**Source officielle :**
- https://www.service-public.fr/particuliers/vosdroits/F815
- https://www.aide-sociale.fr/allocation-soutien-familial/

**Impact :** Fort - Sous-estimation de ~13% du montant de l'allocation

---

### 3. Indemnités Kilométriques - Barème 2024 obsolète

**Fichier concerné :**
- `src/data/baremes.ts` (lignes 27-99)

**Problème :** Le barème utilisé est celui de 2024, mais le barème 2025 (toujours en vigueur en 2026) a été revalorisé.

**Comparaison pour une voiture 5CV jusqu'à 5 000 km :**
- Site (2024) : 0,603 €/km ❌
- Officiel 2025-2026 : **0,636 €/km** ✅

**Tableau complet des écarts :**

| Puissance | Tranche | Site (obsolète) | Officiel 2025-2026 | Écart |
|-----------|---------|-----------------|-------------------|-------|
| 3 CV | 0-5 000 km | 0,502 € | **0,529 €** | -5,1% |
| 4 CV | 0-5 000 km | 0,575 € | **0,606 €** | -5,1% |
| 5 CV | 0-5 000 km | 0,603 € | **0,636 €** | -5,2% |
| 6 CV | 0-5 000 km | 0,631 € | **0,665 €** | -5,1% |
| 7 CV+ | 0-5 000 km | 0,659 € | **0,697 €** | -5,5% |

**Source officielle :**
- https://www.legisocial.fr/reperes-sociaux/bareme-kilometrique-2026.html

**Impact :** Modéré - Sous-estimation des indemnités kilométriques

---

## 🟡 ERREURS MOYENNES (À CORRIGER)

### 4. Impôt sur le revenu - Seuils légèrement décalés

**Fichier concerné :**
- `src/utils/irCalculEngine.ts` (lignes 22-28)

**Valeurs actuelles :**
```typescript
{ plafond: 11497, taux: 0 },      // OK
{ plafond: 28797, taux: 0.11 },   // Décalé
{ plafond: 82341, taux: 0.3 },    // Décalé
{ plafond: 177106, taux: 0.41 },  // Décalé
```

**Valeurs officielles 2026 (revenus 2025) :**
- Jusqu'à **11 497 €** : 0% ✅ (correct)
- De 11 498 € à **29 315 €** : 11% (site: 28 797 €)
- De 29 316 € à **83 823 €** : 30% (site: 82 341 €)
- De 83 824 € à **180 000 €** : 41% (site: 177 106 €)
- Au-delà : 45%

**Source officielle :**
- https://www.service-public.fr/particuliers/vosdroits/F1419

**Impact :** Faible à modéré - Légère différence sur les calculs d'impôt

---

### 5. ARE (Allocation Retour Emploi) - Montant minimum obsolète

**Fichier concerné :**
- `src/utils/areCalculEngine.ts` (ligne 76)

**Valeur actuelle :**
- Montant minimum : 31,45 €/jour ❌

**Valeur officielle 2026 :**
- Montant minimum : **32,13 €**/jour ✅ (depuis le 1er juillet 2025)

**Source officielle :**
- https://www.unedic.org/la-reglementation/fiches-thematiques/allocation-d-aide-au-retour-a-l-emploi-are
- https://www.francetravail.org/files/live/sites/peorg/files/documents/Publications/DAC%20Allocaides%20_Vdef1er%20Janvier%202026.pdf

**Impact :** Faible - Légère sous-estimation

---

## 🟢 BARÈMES CONFORMES

### ✅ RSA (Revenu de Solidarité Active)

**Fichier :** `src/utils/rsaCalculEngine.ts`

| Situation | Montant site | Montant officiel | Statut |
|-----------|--------------|------------------|--------|
| Personne seule | 646,52 € | 646,52 € | ✅ |
| Couple | 969,78 € | 969,78 € | ✅ |
| Parent isolé 1 enfant | 1 106,94 € | ~1 106 € | ✅ |
| Majoration/enfant | 258,61 € | ~259 € | ✅ |

**Source :** https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-revenu-de-solidarite-active

---

### ✅ AAH (Allocation Adulte Handicapé)

**Fichier :** `src/utils/aahCalculEngine.ts`

- Montant maximum : 1 033,32 € ✅
- Correspond à la valeur officielle de 2026

**Source :** https://www.service-public.fr/particuliers/vosdroits/F12242

---

### ✅ Frais de notaire

**Fichiers :**
- `src/data/notaire.baremes.2026.js`
- `src/utils/notaire.calc.js`

| Élément | Valeur | Statut |
|---------|--------|--------|
| DMTO majoré | 6,32% | ✅ |
| DMTO standard | 5,80% | ✅ |
| DMTO réduit | 5,09% | ✅ |
| Droits neuf | 0,715% | ✅ |
| TVA | 20% | ✅ |
| CSI | 0,10% | ✅ |

---

### ✅ APL (Aide Personnalisée au Logement)

**Fichier :** `src/utils/aplCalculEngine.ts`

Le simulateur utilise des plafonds réalistes basés sur les observations CAF :
- Participation personnelle : 30% des revenus
- Forfaits logement conformes
- Plafonds APL réalistes par profil

---

## 📋 PLAN D'ACTION RECOMMANDÉ

### Priorité 1 : Corrections immédiates (cette semaine)

1. **Mettre à jour le SMIC 2026** dans tous les fichiers
   - `src/pages/salaire-brut-net-calcul-2026.html`
   - Vérifier tous les autres fichiers mentionnant le SMIC

2. **Corriger le montant ASF**
   - `src/utils/asfCalculEngine.ts` : passer de 176,5 € à 199,19 €

3. **Mettre à jour le barème kilométrique 2025-2026**
   - `src/data/baremes.ts` : appliquer les nouveaux taux

### Priorité 2 : Corrections importantes (dans les 2 semaines)

4. **Corriger les seuils de l'impôt sur le revenu**
   - `src/utils/irCalculEngine.ts`

5. **Mettre à jour le montant minimum ARE**
   - `src/utils/areCalculEngine.ts`

### Priorité 3 : Améliorations de processus

6. **Mettre en place un système de veille** pour les mises à jour des barèmes
7. **Créer une documentation** avec les sources officielles pour chaque barème
8. **Planifier des audits trimestriels** des barèmes

---

## 📚 SOURCES OFFICIELLES CONSULTÉES

1. **URSSAF** : https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/
2. **Service-Public.fr** : https://www.service-public.fr/
3. **CAF** : https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires
4. **France Travail** : https://www.francetravail.org/
5. **Impots.gouv.fr** : https://www.impots.gouv.fr/
6. **Légifrance** : https://www.legifrance.gouv.fr/
7. **Travail-emploi.gouv.fr** : https://travail-emploi.gouv.fr/

---

## ⚠️ NOTES IMPORTANTES

- Les barèmes des indemnités kilométriques sont ceux de 2025 (applicables pour l'imposition des revenus 2025, déclarés en 2026)
- Le barème de l'impôt sur le revenu utilisé sur le site semble être celui des revenus 2024 (déclarés en 2025)
- Certaines aides (APL, Prime d'activité) ont des calculs complexes qui nécessitent des simplifications dans un simulateur

---

*Rapport généré le 12 février 2026 à 19:35*
