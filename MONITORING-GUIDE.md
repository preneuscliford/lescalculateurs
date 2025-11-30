# 📅 Calendrier de Suivi - Frais Notaire

## 📋 Vue d'ensemble

Ce système garantit que **LesCalculateurs.fr** reste **à jour** avec les données officielles de frais notaire.

## 🔍 Tâches de Monitoring

| Tâche | Fréquence | Prochain Check | Source |
|-------|-----------|---|--------|
| **Barèmes notariaux** | Trimestriel | 2026-02-01 | Conseil Supérieur du Notariat |
| **Droits d'enregistrement** | Annuel | 2026-01-15 | Direction des Finances |
| **Débours/formalités** | Semestriel | 2026-06-01 | Chambres départementales |
| **CSI (50€)** | Annuel | 2026-01-01 | Service-Public.fr |
| **Taux TVA** | Annuel | 2026-01-01 | Direction des Finances |

## 📌 Dates Clés à Retenir

- **01 Janvier 2026** ← Révision annuelle NORMALE des barèmes notariaux
- **15 Janvier 2026** ← Vérification droits d'enregistrement
- **01 Février 2026** ← Révision trimestrielle
- **01 Juin 2026** ← Révision débours/formalités

## 🚀 Comment Vérifier les Mises à Jour

### Lancer la vérification:
```bash
node scripts/check-monitoring-dates.cjs
```

### Vérifier manuellement les sources:

1. **Barèmes notariaux 2024-2025:**
   - https://www.notaires.fr/fr/vous-etes-proprietaire-immobilier-ou-acquereur/le-role-du-notaire/les-tarifs-notariaux
   - Chercher: Tranches de 0,0387%, 0,01596%, 0,01064%, 0,00799%

2. **Droits d'enregistrement par département:**
   - https://www.impots.gouv.fr/
   - Chercher: Taux mutationnels (ancien: ~5-7%, neuf: ~0,71%)

3. **CSI (Contribution de Sécurité Immobilière):**
   - https://www.service-public.fr/particuliers/vosdroits/F17701
   - Chercher: "50€ forfaitaire"

4. **Débours/Formalités:**
   - https://www.notaires.fr/ → Chambre de votre région
   - Chercher: Cadastre, conservation, copies, formalités

## ✅ Procédure de Mise à Jour

Quand les données changent:

### Étape 1: Mettre à jour les données
```bash
# Éditer src/data/departements.json avec les nouveaux taux
# Éditer data/monitoring-calendar.json avec la date
```

### Étape 2: Mettre à jour le code
```bash
# Si les tranches changent:
# - Éditer scripts/add-official-tarifs.cjs (les tranches)
# - Lancer: node scripts/add-official-tarifs.cjs
```

### Étape 3: Tester tous les calculateurs
```bash
node scripts/verify-final-content.cjs
```

### Étape 4: Committer les changements
```bash
git add -A
git commit -m "🔄 Update: Barèmes 2025-2026 (X/104 departments updated)"
git push
```

### Étape 5: Notifier les utilisateurs
- Email newsletter
- Banneau sur le site
- Mise à jour blog

## 📊 Barèmes Actuels (2024-2025)

```
Tranches d'émoluments:
- 0€ à 6.500€: 3,87%
- 6.500€ à 17.000€: 1,596%
- 17.000€ à 60.000€: 1,064%
- 60.000€+: 0,799%

Droits d'enregistrement (ancien):
- Paris: 5,90%
- Var: 5,80%
- Corsé: 4,50%
- (Varient par département)

Droits TFPB (neuf):
- 0,715% (tarif national)

CSI:
- 50€ forfaitaire

TVA:
- 20% sur émoluments + formalités
```

## 🔐 Archivage des Anciennes Versions

Les anciennes versions sont conservées dans Git:
```bash
git log --oneline | grep "Update: Barèmes"
git show <commit-hash>:src/data/departements.json
```

## 📞 Contacts Officiels

- **Conseil Supérieur du Notariat:** contact@notaires.fr
- **Direction des Finances:** https://www.impots.gouv.fr/contact
- **Chambre Notariale locale:** (voir par département)

## 🎯 Objectif

✅ Garantir que **100% des calculateurs** restent à jour  
✅ Être les **premiers** à publier les nouveaux barèmes  
✅ Maintenir la **confiance des utilisateurs**  
✅ Éviter les **calculs incorrects**  

---

**Dernière vérification:** 2025-11-30  
**Prochain check:** 2026-01-01 ⏰
