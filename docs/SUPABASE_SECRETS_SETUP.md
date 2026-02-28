# Guide : Ajouter les Secrets Supabase

## Méthode 1 : Interface Web (Recommandé)

### Étape 1 : Ouvrir le Dashboard
1. Va sur : https://supabase.com/dashboard
2. Connecte-toi avec ton compte
3. Clique sur ton projet : `bwabwcfyyipfllvmomzx`

### Étape 2 : Aller dans les Secrets
```
Menu à gauche :
├── Project Settings (icône engrenage en bas)
│   └── Configuration
│       └── Secrets (ou "Environment Variables")
```

Ou directement :
https://supabase.com/dashboard/project/bwabwcfyyipfllvmomzx/settings/secrets

### Étape 3 : Ajouter IP_SALT
Clique sur : **[+ Add Secret]**

```
Name:  IP_SALT
Value: m0nS4ltS3cur1s3P0urH4sh3rLes1Ps2026!
```

⚠️ **Important** : Le salt doit être :
- Long (min 32 caractères)
- Aléatoire (lettres, chiffres, symboles)
- Gardé secret (ne pas partager)
- **Ne jamais le changer** après (sinon les hashes changent)

### Étape 4 : Ajouter RECAPTCHA_SECRET_KEY (Optionnel)
Si tu veux activer reCAPTCHA v3 :

1. D'abord, créer une clé sur Google :
   - Va sur : https://www.google.com/recaptcha/admin
   - Clique : "+ Create"
   - Type : reCAPTCHA v3
   - Domaines : `lescalculateurs.fr`, `www.lescalculateurs.fr`
   - Copie la **SECRET KEY** (pas la site key)

2. Dans Supabase :
```
Name:  RECAPTCHA_SECRET_KEY
Value: 6Lcxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (ta clé)
```

### Étape 5 : Vérifier
Tu dois voir :
```
┌──────────────────────────┬──────────────────────────────┐
│ Name                     │ Value                        │
├──────────────────────────┼──────────────────────────────┤
│ IP_SALT                  │ m0nS4ltS3cur1s3P0urH4sh3r... │
│ RECAPTCHA_SECRET_KEY     │ 6Lc... (optionnel)           │
└──────────────────────────┴──────────────────────────────┘
```

---

## Méthode 2 : Ligne de Commande (CLI)

### 1. Installer Supabase CLI
```bash
# Windows (PowerShell en admin)
npm install -g supabase

# Vérifier l'installation
supabase --version
```

### 2. Se connecter
```bash
supabase login
```
Ça ouvre un navigateur, tu cliques "Authorize".

### 3. Lier ton projet
```bash
# Se placer dans le dossier du projet
cd C:\Users\prene\OneDrive\Bureau\lesCalculateurs

# Lier le projet
supabase link --project-ref bwabwcfyyipfllvmomzx
```

### 4. Ajouter les secrets
```bash
# Générer un salt aléatoire (ou en créer un toi-même)
# Exemple : m0nS4ltS3cur1s3P0urH4sh3rLes1Ps2026!

supabase secrets set IP_SALT="m0nS4ltS3cur1s3P0urH4sh3rLes1Ps2026!"

# Optionnel : reCAPTCHA
supabase secrets set RECAPTCHA_SECRET_KEY="6Lc...ta_cle..."
```

### 5. Vérifier
```bash
supabase secrets list
```

Tu dois voir :
```
IP_SALT                    m0nS4ltS3cur1s3P0urH4sh3rLes1Ps2026!
RECAPTCHA_SECRET_KEY       6Lc...
```

---

## Générer un Salt Aléatoire

Si tu veux un salt sécurisé, utilise cette commande PowerShell :

```powershell
# Générer 32 caractères aléatoires
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
```

Exemple de sortie : `k9LmP2vX5nQ8wR4tY7uI1oP6aS3dF9gH`

Ou utilise ce site (ne stocke pas le salt généré là-bas) :
https://passwordsgenerator.net/
- Length : 32
- Cocher : Numbers, Uppercase, Lowercase
- Copier la valeur

---

## Déployer la Edge Function V2

Après avoir ajouté les secrets :

### Via CLI
```bash
# Dans le dossier du projet
supabase functions deploy validate-feedback
```

### Vérifier le déploiement
```bash
supabase functions list
```

Tu dois voir :
```
 validate-feedback    Deployed    2026-02-28T12:00:00Z
```

---

## Test Final

Une fois déployé, teste avec curl :

```bash
curl -X POST https://bwabwcfyyipfllvmomzx.supabase.co/functions/v1/validate-feedback `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer sb_publishable_fcagbgnkhDEi_HNDu9OYSw_JDk4ztBg" `
  -d '{"profile_hash":"test123","simulator_type":"rsa","obtention":"oui","controle":"non","fingerprint":"abc123","form_start_time":1700000000000}'
```

Réponse attendue :
```json
{"valid":true,"message":"Validation réussie","suspicion_score":0}
```

---

## Résumé des Commandes

```bash
# 1. Login (une seule fois)
supabase login

# 2. Lier le projet (une seule fois)
supabase link --project-ref bwabwcfyyipfllvmomzx

# 3. Ajouter les secrets
supabase secrets set IP_SALT="ton_salt_ici"

# 4. Déployer la fonction
supabase functions deploy validate-feedback

# 5. Vérifier
supabase functions list
supabase secrets list
```

---

## Problèmes Courants

| Erreur | Solution |
|--------|----------|
| "command not found" | `npm install -g supabase` |
| "not logged in" | `supabase login` |
| "project not linked" | `supabase link --project-ref bwabwcfyyipfllvmomzx` |
| "failed to deploy" | Vérifier que IP_SALT est bien ajouté |
| "Unauthorized" | Vérifier la clé API dans le header |

---

## Besoin d'Aide ?

Si tu bloques, envoie-moi :
1. Le message d'erreur exact
2. La commande que tu as tapée
3. Le contexte (CLI ou interface web)
