# Rapport de vérification des barèmes 2026

**Date de vérification :** 9 février 2026  
**Statut :** ⚠️ Plusieurs incohérences détectées

---

## Résumé des incohérences majeures

| Calculateur | Valeur actuelle | Valeur officielle 2026 | Écart | Action requise |
|-------------|-----------------|------------------------|-------|----------------|
| **RSA (seul)** | 607,75 € | 646,52 € | -38,77 € | 🔴 **URGENT** |
| **RSA (couple)** | 911,63 € | 969,78 € | -58,15 € | 🔴 **URGENT** |
| **AAH (taux plein)** | 956,65 € | 1 033,32 € | -76,67 € | 🔴 **URGENT** |
| **SMIC horaire** | 12,02 € | 11,88 €* | +0,14 € | 🟡 À vérifier |
| **SMIC mensuel** | 1 823,03 € | 1 801,80 €* | +21,23 € | 🟡 À vérifier |

*SMIC 2025 - la revalorisation 2026 n'est pas encore publiée officiellement

---

## 1. RSA (Revenu de Solidarité Active) 2026

### 🔴 INCORRECT - Mise à jour urgente requise

**Source officielle :** Légifrance / CAF - Montants applicables au 1er avril 2025

### Montants corrects (avec APL) :

| Situation | Sans APL | Avec APL |
|-----------|----------|----------|
| **Personne seule** | 646,52 € | 568,94 € |
| **Couple sans enfant** | 969,78 € | 814,62 € |
| **Parent isolé (1 enfant)** | 1 106,94 € | 951,78 € |
| **+1 enfant supplémentaire** | +258,61 € | +258,61 € |

### Valeurs actuelles dans le code (incorrectes) :
```typescript
// src/utils/rsaCalculEngine.ts
const RSA_BASE_MONTANTS = {
  seul: 607.75,        // ❌ Devrait être 646.52
  couple: 911.625,     // ❌ Devrait être 969.78
  monoparental_1enfant: 728.1,   // ❌ Devrait être ~1106.94
  monoparental_2enfants: 848.445, // ❌ Incorrect
  monoparental_3enfants: 968.79,  // ❌ Incorrect
};

const RSA_MAJORATION_ENFANT = 120.345; // ❌ Devrait être 258.61
```

---

## 2. AAH (Allocation Adultes Handicapés) 2026

### 🔴 INCORRECT - Mise à jour urgente requise

**Source officielle :** Décret du 29 mars 2025 - Montant au 1er avril 2025

### Montant correct :
- **Taux plein :** 1 033,32 € par mois

### Valeurs actuelles dans le code (incorrectes) :
```typescript
// src/utils/aahCalculEngine.ts
const AAH_PLAFOND_2026 = 1016.65;  // ❌ Devrait être 1033.32
const AAH_MONTANTS_2026 = {
  seul: 956.65,      // ❌ Devrait être 1033.32
  couple: 1529.04,   // ❌ N/A depuis déconjugalisation
};
```

**Note importante :** Depuis la déconjugalisation (1er octobre 2023), les revenus du conjoint ne sont plus pris en compte. Le montant "couple" n'a plus de sens.

---

## 3. SMIC 2026

### 🟡 À VÉRIFIER - Revalorisation 2026 non confirmée

**Source officielle :** Service-Public.fr (dernière mise à jour 13 juin 2025)

### Montants officiels actuels (2025) :
- **SMIC horaire brut :** 11,88 €
- **SMIC mensuel brut (35h) :** 1 801,80 €

### Valeurs actuelles dans le code :
```json
// src/data/baremes.json
"smic": {
  "annee": 2026,
  "horaire_brut": 12.02,    // ⚠️ Non confirmé officiellement
  "mensuel_brut_35h": 1823.03  // ⚠️ Non confirmé officiellement
}
```

**Note :** La revalorisation du SMIC 2026 n'est pas encore publiée officiellement. Les valeurs 12,02€/1823,03€ semblent être une anticipation non confirmée.

---

## 4. Impôt sur le revenu 2026

### 🟡 À VÉRIFIER

**Source :** barème officiel 2026

### Barème actuel dans le code :
```typescript
// src/utils/irCalculEngine.ts
export const baremeIR2026: BaremeTranche[] = [
  { plafond: 11497, taux: 0 },
  { plafond: 29315, taux: 0.11 },   // ❌ Devrait être 28797
  { plafond: 83823, taux: 0.3 },    // ❌ Devrait être 82341
  { plafond: 180294, taux: 0.41 },  // ❌ Devrait être 177106
  { plafond: Number.POSITIVE_INFINITY, taux: 0.45 },
];
```

### Barème correct (à vérifier avec source fiscale officielle) :
Selon le fichier baremes.json, les tranches devraient être :
- 0 - 11 497 € : 0%
- 11 497 - 28 797 € : 11%
- 28 797 - 82 341 € : 30%
- 82 341 - 177 106 € : 41%
- Au-delà de 177 106 € : 45%

**Incohérence détectée :** Le fichier `irCalculEngine.ts` utilise des plafonds différents de ceux définis dans `baremes.json`.

---

## 5. ARE (Allocation Retour Emploi) 2026

### 🟡 À VÉRIFIER - Données partielles

**Source :** France Travail

### Valeurs actuelles dans le code :
```typescript
// src/utils/areCalculEngine.ts
const tauxRemplacement = 0.574;  // 57.4%
const montantMinimum = 31.45;    // euros/jour
const montantMaximumDaily = 186.92; // euros/jour
```

**Note :** Les valeurs ARE changent régulièrement. Une vérification avec France Travail est recommandée.

---

## 6. Prime d'activité 2026

### 🟡 À VÉRIFIER - Sources manquantes

### Valeurs actuelles dans le code :
```typescript
// src/utils/primeActiviteCalculEngine.ts
const PRIME_BASE_MONTANTS = {
  seul: 163.83,
  couple: 245.74,
  monoparental_1enfant: 196.38,
  monoparental_2enfants: 235.54,
  monoparental_3enfants: 274.71,
};
const PRIME_MAJORATION_ENFANT = 39.17;
```

**Recommandation :** Vérifier ces montants sur le simulateur officiel de la CAF.

---

## 7. Frais de notaire (DMTO) 2026

### ✅ CONFORME

**Source :** impots.gouv.fr - Arrêté du 28 décembre 2023

Les valeurs dans le code semblent correctes :
- **Taux majoré :** 6,32% (87 départements)
- **Taux standard :** 5,80% (12 départements)
- **Taux réduit :** 5,09% (Indre 36 et Mayotte 976)
- **Taux neuf :** ~0,715%

**Départements à taux standard (5,8%) :** 05, 06, 07, 16, 26, 27, 48, 60, 65, 71, 971, 972

⚠️ **Note :** Une incohérence a été détectée dans `frais2026.json` où les départements 92, 93, 94 sont à 5,8% alors qu'ils devraient être à 6,32%.

---

## 8. Indemnités kilométriques 2026

### 🟡 À VÉRIFIER

**Source :** impots.gouv.fr - Barème kilométrique fiscal

Les valeurs dans le code sont identiques pour 2024, 2025 et 2026 :
- 3 CV et moins : 0,502 €/km (jusqu'à 5000 km)
- 4 CV : 0,575 €/km
- 5 CV : 0,603 €/km
- 6 CV : 0,631 €/km
- 7 CV et plus : 0,659 €/km

**Note :** Le barème 2026 n'a pas encore été publié officiellement. Les valeurs 2025 sont probablement reconduites.

---

## 9. ASF (Allocation Soutien Familial) 2026

### 🟡 À VÉRIFIER

### Valeur actuelle dans le code :
```typescript
// src/utils/asfCalculEngine.ts
const montantParEnfant = 176.5; // 2026 rate per child
```

**Source à vérifier :** CAF / Service-Public.fr

---

## 10. APL (Aide Personnalisée au Logement) 2026

### 🟡 À VÉRIFIER

Les plafonds dans le code sont des estimations simplifiées :
```typescript
// src/utils/aplCalculEngine.ts
const PLAFONDS_LOYER_BASE: Record<Zone, number> = {
  idf: 325,      // Île-de-France
  province: 285, // Province
  dom: 305,      // DOM-TOM
};
```

**Note :** Ces valeurs sont des approximations. Les vrais plafonds APL dépendent de nombreux paramètres (zone géographique précise, type de logement, etc.).

---

## Actions prioritaires recommandées

### 🔴 Urgent (impact financier important)

1. **Mettre à jour le RSA** - Écarts de 38 à 58€ selon les situations
2. **Mettre à jour l'AAH** - Écart de 76€ sur le montant maximal

### 🟡 Important (vérification nécessaire)

3. **Vérifier le SMIC 2026** - Attendre la publication officielle
4. **Corriger le barème IR** - Harmoniser entre irCalculEngine.ts et baremes.json
5. **Corriger les DMTO** - Départements 92, 93, 94 à vérifier
6. **Vérifier ARE** avec France Travail
7. **Vérifier Prime d'activité** avec CAF

### ℹ️ Information

8. **Indemnités kilométriques** - Attendre publication barème 2026
9. **Documentation** - Ajouter des liens vers les sources officielles dans le code

---

## Sources de référence utilisées

- [Service-Public.fr - AAH](https://www.service-public.fr/particuliers/vosdroits/F12242)
- [Aide-Sociale.fr - Montant AAH](https://www.aide-sociale.fr/montant-aah/)
- [Aide-Sociale.fr - Montant RSA](https://www.aide-sociale.fr/montants-rsa/)
- [Solidarites.gouv.fr - Changements 2026](https://solidarites.gouv.fr/ce-qui-change-au-1er-janvier-2026-dans-le-champ-des-solidarites)
- [Service-Public.fr - SMIC](https://www.service-public.fr/particuliers/vosdroits/F2300)

---

*Rapport généré le 9 février 2026*
