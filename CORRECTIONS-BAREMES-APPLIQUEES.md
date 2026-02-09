# Corrections des barèmes appliquées - 9 février 2026

## Résumé des corrections

### ✅ Corrigé

| Fichier | Barème | Ancienne valeur | Nouvelle valeur | Impact |
|---------|--------|-----------------|-----------------|--------|
| `rsaCalculEngine.ts` | RSA seul | 607,75 € | **646,52 €** | +38,77 € |
| `rsaCalculEngine.ts` | RSA couple | 911,63 € | **969,78 €** | +58,15 € |
| `rsaCalculEngine.ts` | RSA parent isolé 1enf | 728,10 € | **1 106,94 €** | +378,84 € |
| `rsaCalculEngine.ts` | RSA majoration enfant | 120,35 € | **258,61 €** | +138,26 € |
| `aahCalculEngine.ts` | AAH taux plein | 956,65 € | **1 033,32 €** | +76,67 € |
| `aahCalculEngine.ts` | AAH plafond | 1 016,65 € | **1 033,32 €** | +16,67 € |
| `irCalculEngine.ts` | IR tranche 2 | 29 315 € | **28 797 €** | Alignement |
| `irCalculEngine.ts` | IR tranche 3 | 83 823 € | **82 341 €** | Alignement |
| `irCalculEngine.ts` | IR tranche 4 | 180 294 € | **177 106 €** | Alignement |
| `baremes.json` | SMIC horaire | 12,02 € | **11,88 €** | Correction |
| `baremes.json` | SMIC mensuel | 1 823,03 € | **1 801,80 €** | Correction |
| `frais2026.json` | DMTO 92,93,94 | 5,8% | **6,32%** | Correction |

---

## Détails des modifications

### 1. RSA (src/utils/rsaCalculEngine.ts)

**Source :** Légifrance - Arrêté du 29 mars 2025

Les montants du RSA ont été significativement sous-évalués dans le code précédent :

```typescript
// Avant (incorrect)
const RSA_BASE_MONTANTS = {
  seul: 607.75,
  couple: 911.625,
  monoparental_1enfant: 728.1,
  // ...
};
const RSA_MAJORATION_ENFANT = 120.345;

// Après (correct)
const RSA_BASE_MONTANTS = {
  seul: 646.52,        // +38,77 €
  couple: 969.78,      // +58,15 €
  monoparental_1enfant: 1106.94,  // +378,84 €
  monoparental_2enfants: 1383.68,
  monoparental_3enfants: 1660.41,
};
const RSA_MAJORATION_ENFANT = 258.61; // +138,26 €
```

---

### 2. AAH (src/utils/aahCalculEngine.ts)

**Source :** Décret du 29 mars 2025 - Montant applicable au 1er avril 2025

```typescript
// Avant (incorrect)
const AAH_PLAFOND_2026 = 1016.65;
const AAH_MONTANTS_2026 = {
  seul: 956.65,
  couple: 1529.04,  // Obsolète depuis déconjugalisation
};

// Après (correct)
const AAH_PLAFOND_2026 = 1033.32;  // +16,67 €
const AAH_MONTANTS_2026 = {
  seul: 1033.32,     // +76,67 €
  couple: 1033.32,   // Déconjugalisation : même montant
};
```

**Note importante :** Depuis la déconjugalisation (1er octobre 2023), les revenus du conjoint ne sont plus pris en compte dans le calcul de l'AAH.

---

### 3. Impôt sur le revenu (src/utils/irCalculEngine.ts)

**Source :** Article 197 du Code général des impôts

Harmonisation avec le fichier `baremes.json` :

```typescript
// Avant (incorrect)
export const baremeIR2026 = [
  { plafond: 11497, taux: 0 },
  { plafond: 29315, taux: 0.11 },   // ❌
  { plafond: 83823, taux: 0.3 },    // ❌
  { plafond: 180294, taux: 0.41 },  // ❌
  { plafond: Infinity, taux: 0.45 },
];

// Après (correct)
export const baremeIR2026 = [
  { plafond: 11497, taux: 0 },      // 0%
  { plafond: 28797, taux: 0.11 },   // 11%
  { plafond: 82341, taux: 0.3 },    // 30%
  { plafond: 177106, taux: 0.41 },  // 41%
  { plafond: Infinity, taux: 0.45 }, // 45%
];
```

---

### 4. SMIC (src/data/baremes.json)

**Source :** Service-Public.fr (13 juin 2025)

```json
// Avant (anticipation non confirmée)
{
  "annee": 2026,
  "horaire_brut": 12.02,
  "mensuel_brut_35h": 1823.03
}

// Après (valeurs officielles 2025)
{
  "annee": 2025,
  "horaire_brut": 11.88,
  "mensuel_brut_35h": 1801.80,
  "note": "Montants 2025 en attendant publication officielle 2026"
}
```

---

### 5. DMTO - Frais de notaire (src/data/frais2026.json)

Correction des départements 92, 93, 94 (Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne) :

```json
// Avant (incorrect)
{
  "92": 5.8,
  "93": 5.8,
  "94": 5.8
}

// Après (correct)
{
  "92": 6.32,
  "93": 6.32,
  "94": 6.32
}
```

Ces 3 départements sont bien en taux majoré (6,32%), pas en taux standard (5,8%).

---

## Barèmes restants à vérifier

Les barèmes suivants nécessitent une vérification complémentaire mais n'ont pas été modifiés par manque de source officielle confirmée :

| Barème | Valeur actuelle | Statut |
|--------|-----------------|--------|
| **ARE** | 57,4% / 31,45€-186,92€/jour | 🟡 À vérifier avec France Travail |
| **Prime d'activité** | 163,83€-274,71€ | 🟡 À vérifier avec CAF |
| **ASF** | 176,50€/enfant | 🟡 À vérifier avec CAF |
| **APL** | Plafonds estimés | 🟡 Valeurs indicatives |
| **Indemnités km** | Barème 2024/2025 | 🟡 Attendre publication 2026 |

---

## Recommandations

1. **Tester les calculateurs** après modifications pour vérifier le bon fonctionnement
2. **Ajouter des liens vers les sources officielles** directement dans le code
3. **Mettre en place une alerte** pour les revalorisations annuelles (avril pour RSA/AAH, janvier pour SMIC/IR)
4. **Vérifier régulièrement** les barèmes ARE et Prime d'activité qui évoluent fréquemment

---

*Corrections appliquées le 9 février 2026*
