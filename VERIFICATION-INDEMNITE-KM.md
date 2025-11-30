# 🚗 VÉRIFICATION INDEMNITÉ KILOMÉTRIQUE 2025

## 📊 État Actuel (30 novembre 2025)

**Status:** ⚠️ À vérifier avant 01/01/2026  
**Données actuelles:** 2024  
**Données 2025:** ⏳ Non encore publiées

---

## 🔍 Résultats de la Recherche

### Taux 2024 Actuels (En vigueur jusqu'au 31/12/2025)

| Type de Véhicule | Taux 2024 | Source |
|---|---|---|
| 🚗 Automobile | 0,676 €/km * | impots.gouv.fr |
| 🏍️ Motocyclette | 0,217 €/km * | impots.gouv.fr |
| 🛵 Cyclomoteur (<50cc) | 0,164 €/km | impots.gouv.fr |
| 🔋 Vélo électrique | 0,005 €/km ** | impots.gouv.fr |
| 🔌 Moto électrique | 0,237 €/km | impots.gouv.fr |

**\* Variantes trouvées:** Certaines sources indiquent 0,683 €/km (voiture) et 0,286 €/km (moto)  
**\*\* Variantes trouvées:** Certaines sources indiquent 0,276 €/km (vélo électrique)

---

## ⏰ CALENDRIER CRITIQUE

### 🔴 URGENT - Publication attendue: 20-31 DÉCEMBRE 2025

Les taux 2025 seront publiés très bientôt:

- **Timeline typique:**
  - Publication: 20-31 décembre 2025
  - Effective: 1er janvier 2026
  - Announcement: BOFIP (Bulletin Officiel des Finances Publiques)

- **À faire AVANT 01/01/2026:**
  - [ ] Consulter BOFIP à partir du 20 décembre
  - [ ] Récupérer les taux 2025 officiels
  - [ ] Identifier changements vs 2024
  - [ ] Mettre à jour calculateur
  - [ ] Tester avec 3 exemples
  - [ ] Publier version 2025

---

## 📚 Sources Officielles à Vérifier

### 🏛️ Source Principale: BOFIP
```
https://bofip.impots.gouv.fr/
Rechercher: "IR - Frais professionnels - Indemnité kilométrique"
```

**À consulter à partir du 20 décembre:**
1. Nouvelle documentation 2025
2. Comparaison 2024 vs 2025
3. Dates d'application
4. Types de véhicules couverts

---

### 📖 Sources Secondaires

| Source | URL | Recherche |
|---|---|---|
| **Impôts.gouv.fr** | https://www.impots.gouv.fr/documentation | "Indemnité kilométrique" |
| **Service-Public** | https://www.service-public.gouv.fr | "Déduction frais kilométriques" |
| **Notaires.fr** | https://www.notaires.fr | Frais déductibles professionnels |
| **Journal Officiel** | https://www.legifrance.gouv.fr/jorf/ | Annonces officielles |

---

## 🔧 Plan de Vérification

### ÉTAPE 1: Attendre Publication (avant 01/01/2026)

```javascript
// À partir du 20 décembre 2025:
1. Consulter BOFIP
2. Télécharger documentation 2025
3. Noter les taux par véhicule
4. Vérifier si changements vs 2024
```

### ÉTAPE 2: Mettre à jour Calculateur

```javascript
// Actions à effectuer:
1. Localiser fichier calculateur
2. Mettre à jour les constantes:
   - TAUX_AUTOMOBILE = 0,XXX (nouveau taux)
   - TAUX_MOTO = 0,XXX
   - TAUX_VELO_ELECTRIQUE = 0,XXX
   - etc.
3. Ajouter commentaire: "Updated 2025 rates from BOFIP [date]"
```

### ÉTAPE 3: Tester

```javascript
// Valider avec 3 cas réels:
Test 1: 5000 km auto = 5000 × taux = ? (résultat attendu)
Test 2: 3000 km moto = 3000 × taux = ? (résultat attendu)
Test 3: 1000 km vélo électrique = 1000 × taux = ? (résultat attendu)
```

### ÉTAPE 4: Publier

```bash
git add -A
git commit -m "Update: mileage allowance calculator 2025 rates from BOFIP (01/01/2026)"
git push origin main
```

---

## ⚠️ Écarts Détectés

Lors de la recherche, plusieurs écarts ont été identifiés entre sources:

### Automobile
- Source A: **0,676 €/km**
- Source B: **0,683 €/km**
- → À clarifier avec BOFIP officiel

### Motocyclette
- Source A: **0,217 €/km**
- Source B: **0,286 €/km**
- → À clarifier avec BOFIP officiel

### Vélo Électrique
- Source A: **0,005 €/km**
- Source B: **0,276 €/km**
- → À clarifier avec BOFIP officiel

**Action:** Utiliser uniquement taux BOFIP 2025 une fois publiés

---

## 📋 Checklist de Vérification

**À effectuer dès publication des taux 2025:**

- [ ] Consulter BOFIP (https://bofip.impots.gouv.fr/)
- [ ] Télécharger document "Indemnité kilométrique 2025"
- [ ] Noter tous les taux par type de véhicule
- [ ] Comparer avec taux 2024
- [ ] Localiser fichier calculateur: `src/pages/calcul-indemnite-kilometrique.ts` (ou similaire)
- [ ] Mettre à jour les 5-6 constantes de taux
- [ ] Ajouter date et source dans commentaire
- [ ] Tester 3 calculs de base
- [ ] Vérifier page affiche mention "Données 2025" ou "Barème 2025"
- [ ] Committer changements
- [ ] Mettre à jour `global-monitoring.json` status à "✅ À jour"
- [ ] Tester page en production

---

## 📞 Contacts Officiels

**En cas de doute sur les taux 2025:**

| Service | Contact | Lien |
|---|---|---|
| **DGFiP - Hotline** | 0809 401 401 | https://www.impots.gouv.fr/contacts |
| **BOFIP** | Documentation | https://bofip.impots.gouv.fr/ |
| **Conseil Supérieur du Notariat** | +33 (0)1 42 65 97 90 | https://www.notaires.fr |

---

## 📌 Résumé Executif

| Élément | Status | Action |
|---|---|---|
| **Calculateur existant** | ✅ Oui, basé sur 2024 | Garder comme base |
| **Taux 2025** | ⏳ Non publiés | Attendre jusqu'à 20-31 déc |
| **Publication attendue** | 20-31 décembre | Vérifier BOFIP quotidiennement |
| **Mise en vigueur** | 01 janvier 2026 | Publier mise à jour avant |
| **Urgence** | 🔴 HAUTE | Publication imminente |
| **Priorité** | P1 - URGENT | À faire avant 01/01/2026 |

---

## 🚀 Next Steps

1. **Immédiatement:** Marquer calendrier pour vérifier BOFIP le 20 décembre
2. **20-31 décembre:** Consulter https://bofip.impots.gouv.fr/ quotidiennement
3. **Dès publication:** Lancer mise à jour calculateur
4. **Avant 01/01/2026:** Publier version 2025
5. **01/01/2026:** Mettre à jour monitoring status à "✅ À jour"

---

**Document créé:** 30 novembre 2025  
**Prochaine action:** Vérifier BOFIP le 20 décembre 2025  
**Version:** 1.0 - En attente de taux 2025 officiels
