# 🌍 VÉRIFICATION GLOBALE - Guide Complet

## Vue d'ensemble

Ce système centralise la vérification de **7 calculateurs** utilisant des données officielles mises à jour régulièrement.

### 📊 État actuel (30 novembre 2025)

| Calculateur | Status | Pages | Prochaine action |
|-----------|--------|-------|------------------|
| ✅ Frais de Notaire | À jour | 102 | 01/01/2026 (CSI, TVA, Droits) |
| ⚠️ Prêt Immobilier | À vérifier | 1 | 🔴 URGENT: 15/12/2025 |
| ⚠️ Plus-Value | À vérifier | 1 | 01/01/2026 |
| ⚠️ Investissement Locatif | À vérifier | 1 | 01/01/2026 |
| ⚠️ APL | À vérifier | 1 | 01/01/2026 |
| ⚠️ Frais Agence | À vérifier | 1 | 31/01/2026 |
| ⚠️ Charges Locatives | À vérifier | 1 | 01/01/2026 |

---

## 🔴 PRIORITÉ 1 - URGENT (avant 15 décembre 2025)

### 1. Calculateur de Prêt Immobilier
**Status:** 🔴 URGENT - 2 vérifications nécessaires

**Données à vérifier:**
- Taux de prêt immobilier moyens (Banque de France)
- Assurance emprunteur (AMF France)
- Frais de dossier (Service-Public)

**Checklist:**
- [ ] Localiser le fichier du calculateur
- [ ] Vérifier les taux actuels sur https://www.banque-france.fr/statistiques/taux-bancaires
- [ ] Vérifier les frais de dossier sur Service-Public
- [ ] Mettre à jour les valeurs dans le calculateur
- [ ] Tester avec 3 exemples réalistes
- [ ] Marquer comme "✅ À jour" dans global-monitoring.json
- [ ] Committer: "Update: mortgage calculator data verified (15/12/2025)"

---

## 🟡 PRIORITÉ 2 - AVANT 1er JANVIER 2026

### 2. Calculateur de Plus-Value Immobilière
**Status:** ⚠️ À vérifier

**Données à vérifier:**
- Taux impôt sur plus-value: **19%** (vérifier source)
- Prélèvement social: **17.2%** (vérifier source)
- Abattement pour durée de détention: **5% par an après 5 ans, 10% après 22 ans**

**Checklist:**
- [ ] Localiser le fichier du calculateur
- [ ] Vérifier les taux sur https://www.impots.gouv.fr
- [ ] Vérifier les règles d'abattement
- [ ] Mettre à jour si changements
- [ ] Tester calcul sur exemple: achat 200k€, vente 300k€, détention 7 ans
- [ ] Résultat attendu: vérifier alignement avec impots.gouv.fr
- [ ] Marquer comme "✅ À jour" dans global-monitoring.json
- [ ] Committer: "Update: plus-value calculator verified (01/01/2026)"

---

### 3. Calculateur d'Investissement Locatif
**Status:** ⚠️ À vérifier

**Données à vérifier:**
- Rendement locatif moyen France (SeLoger)
- Taxe foncière par région (Direction des finances)
- Statut taxe habitation 2025

**Checklist:**
- [ ] Localiser le fichier du calculateur
- [ ] Vérifier rendement moyen sur https://www.seloger.com/prix/
- [ ] Vérifier taux taxe foncière régionaux
- [ ] Vérifier statut taxe d'habitation (suppression/conservation?)
- [ ] Mettre à jour valeurs
- [ ] Tester: bien 300k€ en Paris, loyer 1500€, charges 200€
- [ ] Vérifier alignement calcul ROI
- [ ] Marquer comme "✅ À jour" dans global-monitoring.json
- [ ] Committer: "Update: rental investment calculator verified (01/01/2026)"

---

### 4. Calculateur d'APL (Aide au Logement)
**Status:** ⚠️ À vérifier

**Données à vérifier:**
- Montants APL max par zone
- Plafonds ressources APL

**Checklist:**
- [ ] Localiser le fichier du calculateur
- [ ] Vérifier montants actuels sur https://www.caf.fr/
- [ ] Vérifier plafonds ressources
- [ ] Mettre à jour zones et montants
- [ ] Tester avec cas réel (célibataire, 1500€ revenu, Paris)
- [ ] Marquer comme "✅ À jour" dans global-monitoring.json
- [ ] Committer: "Update: APL calculator verified (01/01/2026)"

---

### 5. Calculateur de Charges Locatives
**Status:** ⚠️ À vérifier

**Données à vérifier:**
- Taxe foncière (par commune)
- Charges copropriété moyennes

**Checklist:**
- [ ] Localiser le fichier du calculateur
- [ ] Vérifier taux taxe foncière
- [ ] Vérifier moyenne charges copropriété (FNAIM)
- [ ] Mettre à jour si changements
- [ ] Tester: bien 200k€, charges 300€/mois, taxe foncière Paris
- [ ] Marquer comme "✅ À jour" dans global-monitoring.json
- [ ] Committer: "Update: rental charges calculator verified (01/01/2026)"

---

## 🟡 PRIORITÉ 3 - JANVIER/FÉVRIER 2026

### 6. Calculateur de Frais Agence Immobilière
**Status:** ⚠️ À vérifier (avant 31 janvier 2026)

**Données à vérifier:**
- Commission moyenne agences: **5-7%** (vérifier par région)

**Checklist:**
- [ ] Localiser le fichier du calculateur
- [ ] Vérifier commission moyenne sur SeLoger
- [ ] Vérifier variations régionales si applicable
- [ ] Mettre à jour
- [ ] Tester: bien 300k€ avec 6% commission
- [ ] Marquer comme "✅ À jour" dans global-monitoring.json
- [ ] Committer: "Update: agency fees calculator verified (31/01/2026)"

---

### 7. Calculateur de Frais de Notaire (maintenance annuelle)
**Status:** ✅ À jour (révision annuelle le 01/01/2026)

**Données à révérifier annuellement:**
- Barèmes émoluments (Conseil Supérieur du Notariat)
- Droits d'enregistrement (Direction des finances)
- CSI (50€ forfaitaire)
- TVA (20%)

**Checklist:**
- [ ] Exécuter le script de vérification spécifique
- [ ] Vérifier chaque source officielle
- [ ] Tester les 102 calculateurs
- [ ] Vérifier les 104 départements
- [ ] Marquer date de mise à jour dans monitoring-calendar.json
- [ ] Committer: "Verify: notary calculators annual maintenance (01/01/2026)"

---

## 📅 CALENDRIER DE SUIVI

```
2025-12-15 🔴 URGENT
├─ Taux de prêt immobilier
├─ Assurance emprunteur
└─ Frais de dossier

2025-12-31
└─ Frais de dossier (contrôle final)

2026-01-01 🟡 BIENTÔT (32 jours)
├─ Barèmes notariaux 2025-2026
├─ Impôt plus-value + prélèvement social
├─ CSI + TVA + Droits
├─ Taxe foncière
├─ APL montants & plafonds
└─ Charges copropriété

2026-01-15 🟡 BIENTÔT
└─ Droits d'enregistrement

2026-01-31 🟡 BIENTÔT
├─ Rendement locatif moyen
└─ Commission agences

2026-02-01
└─ Révision trimestrielle barèmes

2026-03-01
└─ Charges copropriété (révision)

2026-06-01
└─ Débours & formalités notariaux
```

---

## 🛠️ PROCÉDURE DE VÉRIFICATION

Pour chaque calculateur:

### Étape 1: Localiser les fichiers
```
Pour notaire: src/pages/blog/departements/*.ts (102 fichiers)
Pour autres: src/pages/*.ts ou src/components/*.tsx
```

### Étape 2: Identifier les sources officielles
Voir section "Sources officielles" ci-dessous.

### Étape 3: Vérifier les données
1. Consulter la source officielle
2. Comparer avec valeurs actuelles dans le code
3. Identifier changements nécessaires

### Étape 4: Mettre à jour
1. Modifier le code avec nouvelles valeurs
2. Ajouter commentaire avec date et source
3. Tester les calculs

### Étape 5: Valider
1. Exécuter 3 tests avec exemples réalistes
2. Vérifier résultats alignés avec sources
3. Documenter changements

### Étape 6: Committer
```bash
git add -A
git commit -m "Update: [Calculateur] data verified ([date])"
git push origin main
```

### Étape 7: Mettre à jour global-monitoring.json
Changer le status de "⚠️ À vérifier" à "✅ À jour"

---

## 📚 Sources Officielles

### Frais de Notaire
- **Barèmes:** https://www.notaires.fr
- **Droits enregistrement:** https://www.impots.gouv.fr
- **Débours:** Chambres notariales régionales
- **CSI:** https://www.service-public.fr
- **TVA:** https://www.impots.gouv.fr

### Prêt Immobilier
- **Taux:** https://www.banque-france.fr/statistiques/taux-bancaires
- **Assurance:** https://www.amf-france.org/
- **Frais dossier:** https://www.service-public.fr

### Plus-Value Immobilière
- **Impôt:** https://www.impots.gouv.fr
- **Prélèvement social:** https://www.impots.gouv.fr
- **Abattement:** https://www.impots.gouv.fr

### Investissement Locatif
- **Rendement:** https://www.seloger.com/prix/
- **Taxe foncière:** https://www.impots.gouv.fr
- **Taxe habitation:** https://www.impots.gouv.fr

### APL
- **Montants & plafonds:** https://www.caf.fr/

### Charges Locatives
- **Taxe foncière:** https://www.impots.gouv.fr
- **Charges copropriété:** https://www.fnaim.fr/

### Frais d'Agence
- **Commission moyenne:** https://www.seloger.com/

---

## 🚀 Commandes Utiles

Voir l'état global:
```bash
node scripts/check-global-verification.cjs
```

Voir l'état des frais de notaire:
```bash
node scripts/check-monitoring-dates.cjs
```

Committer la vérification:
```bash
git add -A
git commit -m "Verify: global maintenance - all calculators checked ([date])"
git push origin main
```

---

## 📋 Checklist Mensuelle

À exécuter le 1er de chaque mois:

- [ ] Exécuter `check-global-verification.cjs`
- [ ] Identifier les calculateurs avec 🔴 URGENT
- [ ] Consulter les sources officielles
- [ ] Mettre à jour les calculateurs nécessaires
- [ ] Lancer les tests
- [ ] Marquer comme "À jour" dans monitoring
- [ ] Committer les changements
- [ ] Documenter les mises à jour dans CHANGELOG

---

## 📞 Contacts Officiels

| Source | Téléphone | Site | Email |
|--------|-----------|------|-------|
| Conseil Supérieur du Notariat | +33 (0)1 42 65 97 90 | https://www.notaires.fr | contact@notaires.fr |
| Banque de France | +33 (0)1 42 92 42 92 | https://www.banque-france.fr | - |
| Direction des Finances | - | https://www.impots.gouv.fr | - |
| CAF | +33 (0)9 69 39 00 00 | https://www.caf.fr/ | - |
| FNAIM | +33 (0)1 44 72 80 00 | https://www.fnaim.fr/ | - |

---

**Dernière mise à jour:** 30 novembre 2025
**Prochaine mise à jour:** 15 décembre 2025 (Prêt immobilier)
**Version:** 1.0
