# Fourchettes de montants officiels 2026

**Document de référence pour la vérification des contenus**

---

## Résumé des fourchettes acceptables

| Prestation | Montant exact 2026 | Fourchette acceptable | Statut |
|------------|-------------------|----------------------|--------|
| **RSA seul (sans APL)** | 646,52 € | 640 € - 650 € | ✅ À jour |
| **RSA seul (avec APL)** | 568,94 € | 560 € - 575 € | ✅ À jour |
| **RSA couple (sans APL)** | 969,78 € | 960 € - 975 € | ✅ À jour |
| **RSA couple (avec APL)** | 814,62 € | 810 € - 820 € | ✅ À jour |
| **RSA parent isolé +1enf** | 1 106,94 € | 1 100 € - 1 115 € | ✅ À jour |
| **RSA majoration/enfant** | 258,61 € | 255 € - 262 € | ✅ À jour |
| **AAH taux plein** | 1 033,32 € | 1 028 € - 1 038 € | ✅ À jour |
| **SMIC horaire brut** | 11,88 €* | 11,80 € - 12,10 € | ⚠️ 2025 |
| **SMIC mensuel brut** | 1 801,80 €* | 1 795 € - 1 830 € | ⚠️ 2025 |
| **ASF par enfant** | 176,50 € | 174 € - 179 € | ✅ À jour |
| **ARE min/jour** | 31,45 € | 30 € - 33 € | 🟡 À vérifier |
| **ARE max/jour** | 186,92 € | 185 € - 190 € | 🟡 À vérifier |

\* Montants 2025 en attendant publication officielle 2026

---

## Détails par prestation

### 1. RSA (Revenu de Solidarité Active)

**Source :** Légifrance - Arrêté du 29 mars 2025 (en vigueur au 1er avril 2025)

#### Personne seule
| Situation | Montant exact | Fourchette acceptable |
|-----------|---------------|----------------------|
| Sans APL | **646,52 €** | 640 € - 650 € |
| Avec APL | **568,94 €** | 560 € - 575 € |

#### Couple
| Situation | Montant exact | Fourchette acceptable |
|-----------|---------------|----------------------|
| Sans APL | **969,78 €** | 960 € - 975 € |
| Avec APL | **814,62 €** | 810 € - 820 € |
| +1 enfant | **1 163,73 €** | 1 155 € - 1 170 € |
| +2 enfants | **1 357,69 €** | 1 350 € - 1 365 € |
| +3 enfants | **1 616,30 €** | 1 610 € - 1 625 € |

#### Parent isolé
| Situation | Montant exact | Fourchette acceptable |
|-----------|---------------|----------------------|
| +1 enfant (sans APL) | **1 106,94 €** | 1 100 € - 1 115 € |
| +2 enfants (sans APL) | **1 383,68 €** | 1 375 € - 1 390 € |
| +3 enfants (sans APL) | **1 660,41 €** | 1 655 € - 1 670 € |
| Majoration/enfant supp. | **276,73 €** | 270 € - 282 € |

#### Majoration enfants (seul/couple)
- **+258,61 €** par enfant supplémentaire (au-delà de 3 pour parent isolé)

---

### 2. AAH (Allocation Adultes Handicapés)

**Source :** Décret du 29 mars 2025

| Situation | Montant exact | Fourchette acceptable |
|-----------|---------------|----------------------|
| **Taux plein** | **1 033,32 €** | 1 028 € - 1 038 € |

**Note importante :** Depuis la déconjugalisation (1er octobre 2023), le montant est identique que vous viviez seul ou en couple. Seuls vos revenus personnels sont pris en compte.

---

### 3. SMIC

**Source :** Service-Public.fr (13 juin 2025)

**⚠️ Attention :** Les montants 2026 n'ont pas encore été publiés officiellement. Les valeurs ci-dessous sont celles de 2025.

| Type | Montant 2025 | Fourchette acceptable |
|------|--------------|----------------------|
| **Horaire brut** | **11,88 €** | 11,80 € - 12,10 € |
| **Mensuel brut (35h)** | **1 801,80 €** | 1 795 € - 1 830 € |

---

### 4. ASF (Allocation de Soutien Familial)

**Source :** CAF

| Situation | Montant exact | Fourchette acceptable |
|-----------|---------------|----------------------|
| **Par enfant** | **176,50 €** | 174 € - 179 € |

---

### 5. ARE (Allocation Retour Emploi)

**Source :** France Travail

| Élément | Montant | Fourchette acceptable | Statut |
|---------|---------|----------------------|--------|
| **Taux remplacement** | 57,4% | 57% - 58% | 🟡 À vérifier |
| **Minimum journalier** | 31,45 € | 30 € - 33 € | 🟡 À vérifier |
| **Maximum journalier** | 186,92 € | 185 € - 190 € | 🟡 À vérifier |

---

### 6. Impôt sur le revenu 2026

**Source :** Article 197 du Code général des impôts

| Tranche | Plafond | Fourchette acceptable |
|---------|---------|----------------------|
| **0%** | Jusqu'à 11 497 € | 11 490 € - 11 505 € |
| **11%** | 11 497 € - 28 797 € | 28 790 € - 28 805 € |
| **30%** | 28 797 € - 82 341 € | 82 330 € - 82 350 € |
| **41%** | 82 341 € - 177 106 € | 177 095 € - 177 115 € |
| **45%** | Au-delà de 177 106 € | - |

---

## Procédure de vérification

### Pour les développeurs

1. **Vérifier les moteurs de calcul** :
   ```bash
   grep -r "607.75\|911.625\|956.65" src/
   ```
   Résultat attendu : aucun résultat (montants obsolètes)

2. **Vérifier les nouveaux montants** :
   ```bash
   grep -r "646.52\|969.78\|1033.32" src/
   ```
   Résultat attendu : présence dans les fichiers de barèmes

3. **Vérifier les pages de contenu** :
   ```bash
   node scripts/verify-and-fix-content-amounts.cjs
   ```

### Pour les rédacteurs

Lors de la rédaction de contenu, assurez-vous que :

1. Les montants cités sont dans les fourchettes ci-dessus
2. Vous utilisez la formulation "environ X €" pour les montants approximatifs
3. Vous ajoutez une date de validité ("montants 2026")
4. Vous citez vos sources (CAF, Service-Public.fr, Légifrance)

---

## Historique des corrections

| Date | Correction | Fichiers modifiés |
|------|-----------|-------------------|
| 09/02/2026 | RSA : 607,75€ → 646,52€ | rsaCalculEngine.ts |
| 09/02/2026 | RSA couple : 911,62€ → 969,78€ | rsaCalculEngine.ts |
| 09/02/2026 | AAH : 956,65€ → 1 033,32€ | aahCalculEngine.ts |
| 09/02/2026 | SMIC : 12,02€ → 11,88€ | baremes.json |
| 09/02/2026 | IR tranches harmonisées | irCalculEngine.ts, baremes.json |

---

## Sources officielles

- **CAF** : https://www.caf.fr
- **Service-Public.fr** : https://www.service-public.fr
- **Légifrance** : https://www.legifrance.gouv.fr
- **France Travail** : https://www.francetravail.fr

---

*Document mis à jour le 9 février 2026*
