# Indexation API Google - Pages Simulateurs

## 📊 Statistiques

- **Total URLs simulateurs** : 109 URLs uniques
- **Limite API Google** : 200 URLs/jour pour `URL_UPDATED`
- **Status** : ✅ Prêt pour indexation

## 📁 Fichiers générés

| Fichier | Description | Nombre d'URLs |
|---------|-------------|---------------|
| `scripts/simulateurs-urls.txt` | Toutes les URLs (avec doublons) | 325 |
| `scripts/simulateurs-only-urls.txt` | Uniquement simulateurs (filtrées) | 209 |
| `scripts/simulateurs-unique-urls.txt` | **URLs finales uniques** | **109** |

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

- **APL** : APL principale + sous-pages (colocation, propriétaire, etc.)
- **RSA** : RSA principale + sous-pages (couple, jeune, chômage, etc.)
- **Impôt** : Impôt sur le revenu + sous-pages
- **Prêt** : Prêt immobilier + sous-pages
- **Salaire** : Convertisseur brut/net + sous-pages
- **Notaire** : Frais de notaire
- **Taxe** : Taxe foncière + sous-pages
- **Plus-value** : Plus-value immobilière + sous-pages
- **Aides** : Pages satellites d'aides sociales

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

- ✅ ~109 URLs soumises à Google
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
