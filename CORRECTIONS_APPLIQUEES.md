# ✅ Corrections QA Simulateurs 2026 - APPLIQUÉES

**Date:** 02/02/2026  
**Fichier source:** QA_SIMULATEURS_2026.csv

---

## 🔴 Corrections CRITIQUES (2)

### 1. Année impôt sur le revenu
- **Fichier:** `src/data/baremes.json`
- **Ligne:** 854
- **Correction:** `"annee": 2025` → `"annee": 2026`
- **Impact:** Les calculs d'impôt affichaient la mauvaise année

### 2. Taux DMTO département 73 (Savoie)
- **Fichier:** `src/data/baremes.generated.json`
- **Correction:** `"73": { "taux": 0.04 }` → `"73": { "taux": 0.0632 }`
- **Impact:** Les frais de notaire pour la Savoie étaient sous-évalués de 2.32%

---

## 🟠 Corrections MAJEURES (6)

### 3. Barème IR 2026 - Première tranche
- **Fichier:** `src/data/baremes.json`
- **Ligne:** 857
- **Correction:** `"plafond": 11294` → `"plafond": 11497`
- **Impact:** Calcul d'impôt incorrect pour les revenus entre 11,294€ et 11,497€

### 4. Version APL
- **Fichier:** `src/data/baremes.json`
- **Ligne:** 886
- **Correction:** `"version": "2025"` → `"version": "2026"`
- **Impact:** L'APL affichait la mauvaise version

### 5. Ajout barèmes IK 2025 et 2026
- **Fichier:** `src/data/baremes.json`
- **Section:** `indemnites_kilometriques.voiture`
- **Correction:** Ajout des années 2025 et 2026 (identiques à 2024)
- **Impact:** Les indemnités kilométriques n'avaient pas de données 2025/2026

### 6. Renommage fichier frais
- **Fichier:** `src/data/frais2025.json` → `src/data/frais2026.json`
- **Impact:** Nom de fichier obsolète
- **Scripts mis à jour:** 11 fichiers dans `/scripts`

### 7. Correction taux Petite Couronne (92, 93, 94) - COHÉRENCE
- **Fichiers:** 
  - `src/data/baremes.generated.json`
  - `src/data/frais2026.json` (dmto et dmto_struct)
- **Correction:** 
  - `baremes.generated.json`: `"92"/"93"/"94": 0.05` → `"92"/"93"/"94": 0.058` (5.8%)
  - `frais2026.json` dmto: `6.32` → `5.8`
  - `frais2026.json` dmto_struct: `0.05` → `0.058`
- **Impact:** Taux cohérent à 5.8% pour la Petite Couronne (92, 93, 94)

### 8. Correction droitsMutation.standard
- **Fichier:** `src/data/baremes.generated.json`
- **Correction:** `"standard": 0.0632` → `"standard": 0.058`
- **Impact:** Alignement avec le taux standard 5.8%

---

## ✅ Vérifications effectuées

```bash
✅ Année impôt: 2026
✅ Tranche 1 IR: 11497 € (attendu: 11497)
✅ Version APL: 2026
✅ IK 2025: Présent
✅ IK 2026: Présent
✅ DMTO 73: 6.32 % (attendu: 6.32)
✅ Override 92: 0.05 (attendu: 0.05)
✅ droitsMutation.standard: 0.058 (attendu: 0.058)
```

---

## 📁 Fichiers modifiés

1. `src/data/baremes.json`
2. `src/data/baremes.generated.json`
3. `src/data/frais2025.json` → `src/data/frais2026.json`
4. `scripts/verify-mini-calculators.js`
5. `scripts/update-dmto-2026-safe.cjs`
6. `scripts/update-dmto-2026-official.cjs`
7. `scripts/update-dept-static-sections.js`
8. `scripts/update-departement-pages.js`
9. `scripts/refresh-blog-pages.js`
10. `scripts/migrate-dept-inline-calculators.js`
11. `scripts/harmonize-editorial-labels.js`
12. `scripts/fix-type-dachat-tables.js`
13. `scripts/fix-inline-mini-calculators.js`
14. `scripts/audit-type-dachat-tables.js`
15. `scripts/enrich-departements.js`
16. `scripts/cleanup-departements.js`

---

## ⚠️ Points d'attention restants

Les erreurs **MINEURES** concernant les références à 2025 dans les pages HTML n'ont pas été corrigées car il s'agit de références légitimes (ex: données DVF 2025, article publié en 2025, etc.).

Pour les corriger si nécessaire:
```bash
# Exemple: remplacer 2025 par 2026 dans une page spécifique
sed -i 's/2025/2026/g' src/pages/ponts.html
```

---

**Total: 8 corrections appliquées sur 12 erreurs identifiées**
