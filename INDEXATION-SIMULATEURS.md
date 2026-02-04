# Indexation API Google - Pages Simulateurs

## 📊 Statistiques

- **Total URLs simulateurs** : 108 URLs (22 principaux + 86 satellites)
- **Limite API Google** : 200 URLs/jour pour `URL_UPDATED`
- **Status** : ✅ Prêt pour indexation

## 📁 Fichiers générés

| Fichier | Description | Nombre d'URLs |
|---------|-------------|---------------|
| `scripts/simulateurs-urls.txt` | Toutes les URLs (avec doublons) | 325 |
| `scripts/simulateurs-only-urls.txt` | Uniquement simulateurs (filtrées) | 209 |
| `scripts/simulateurs-unique-urls.txt` | **URLs finales uniques** | **108** |
| `scripts/simulateurs-final-urls.txt` | URLs finales nettoyées | **108** |

## 🚀 Commandes d'indexation

### 1. Dry-run (test sans envoi)
```bash
node scripts/publish-indexing.js --file=scripts/simulateurs-unique-urls.txt --type=URL_UPDATED --dry-run
```

### 2. Indexation réelle (toutes les URLs)
```bash
node scripts/publish-indexing.js --file=scripts/simulateurs-unique-urls.txt --type=URL_UPDATED
```

### 3. Indexation avec délai (recommandé pour éviter le rate limiting)
```bash
node scripts/publish-indexing.js --file=scripts/simulateurs-unique-urls.txt --type=URL_UPDATED --delay-ms=500
```

### 4. Indexation par lots de 50
```bash
node scripts/publish-indexing.js --file=scripts/simulateurs-unique-urls.txt --type=URL_UPDATED --limit=50
```

## 📋 Types de pages indexées

### 🏠 Immobilier & Achat (22 URLs)
- **Frais de Notaire** : Notaire principale + pages satellites
- **Prêt Immobilier** : Pret principale + 16 sous-pages (taux, capacité, PTZ, etc.)
- **Plus-Value Immobilière** : Plusvalue + 11 sous-pages (abattements, exonérations, etc.)
- **Charges de Copropriété** : Charges principale

### 🤝 Allocations & Aides Sociales (34 URLs)
- **APL** : APL principale + 6 satellites (colocation, propriétaire, refusée, etc.)
- **RSA** : RSA principale + 16 satellites (couple, jeune, chômage, auto-entrepreneur, etc.)
- **Prime d'activité** : Principale
- **AAH** : Allocation Adultes Handicapés
- **APL Étudiant** : APL étudiant + DOM-TOM + zones
- **ASF** : Allocation Soutien Familial

### 💼 Allocations Chômage (2 URLs)
- **ARE** : Allocation Retour à l'Emploi

### 💰 Finances Personnelles (20 URLs)
- **Financement Personnel** : Capacité financement
- **Impôts** : Impôt revenu + 10 sous-pages (tranches, couple/séparé, auto-entrepreneur, etc.)
- **Salaire** : Brut/net + 5 sous-pages
- **Crypto & Bourse** : Plus-value crypto
- **Travail** : Calculateur travail
- **IK** : Indemnités kilométriques

### 📑 Impôts & Taxes (29 URLs)
- **Taxe Foncière** : Taxe principale + 16 satellites (exonérations, calcul, contestation, etc.)

### 📚 Aides Diverses (12 URLs)
- Pages d'aides sociales et simulations

**Total : 22 principaux + 86 satellites = 108 URLs**

## ⚠️ Prérequis

1. **Service Account Google** configuré avec accès à l'API Indexing
2. **Fichier credentials** : `mes-sass-a09ffa66ca74.json` (ou via `GOOGLE_APPLICATION_CREDENTIALS`)
3. **Propriété Search Console** : Le site doit être vérifié dans Google Search Console

## 🔧 Configuration credentials

Si le fichier credentials est ailleurs :
```bash
node scripts/publish-indexing.js --file=scripts/simulateurs-unique-urls.txt --type=URL_UPDATED --creds=/chemin/vers/credentials.json
```

## 📊 Résultat attendu

- ✅ 108 URLs soumises à Google
- ⏱️ Durée estimée : 2-5 minutes (avec délai de 500ms entre chaque requête)
- 📈 Amélioration de l'indexation des simulateurs

## 🔄 Regénérer la liste

Si les pages sont modifiées :
```bash
node scripts/index-simulateurs.js
```

Puis refiltrer avec PowerShell :
```powershell
$simulateurs = @("apl", "rsa", "impot", "notaire", "pret", "salaire", "prime", "ik", "taxe", "charges", "plusvalue", "crypto", "are", "aah", "asf", "simulateur", "aide", "financement")
Get-Content scripts\simulateurs-urls.txt | Where-Object { $url = $_; $match = $false; foreach ($s in $simulateurs) { if ($url -match "/$s" -or $url -match "/pages/$s") { $match = $true; break } }; $match } | Sort-Object -Unique | Set-Content scripts\simulateurs-unique-urls.txt
```
