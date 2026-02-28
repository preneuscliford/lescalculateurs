# Edge Functions Supabase

## validate-feedback

Valide les soumissions de feedback côté serveur avec double sécurité.

### Déploiement

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref bwabwcfyyipfllvmomzx

# Déployer la fonction
supabase functions deploy validate-feedback

# Vérifier le déploiement
supabase functions list
```

### URL de la fonction

```
https://bwabwcfyyipfllvmomzx.supabase.co/functions/v1/validate-feedback
```

### Test

```bash
curl -X POST https://bwabwcfyyipfllvmomzx.supabase.co/functions/v1/validate-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "profile_hash": "abc123",
    "simulator_type": "rsa",
    "obtention": "oui",
    "controle": "non",
    "fingerprint": "a1b2c3d4",
    "form_start_time": 1700000000000
  }'
```

## Protections Anti-Spam Implémentées

### 1. Rate Limiting (Client + Serveur)
- **Client**: localStorage avec délai de 24h
- **Serveur**: Vérification dans la base de données
- Message utilisateur: "Réessayez dans X heures"

### 2. Honeypot
- Champ caché `website` invisible pour les humains
- Si rempli = bot détecté
- Rejet immédiat

### 3. Temps de remplissage minimum
- Minimum 5 secondes entre affichage et soumission
- Bloque les scripts ultra-rapides

### 4. Fingerprint navigateur
- Hash basé sur: User-Agent + Résolution + Langue + Timezone + Cores
- Empêche le rechargement immédiat
- Stocké en localStorage

### 5. Validation des données
- Vérification des enums (simulator_type, obtention, controle)
- Rejet des valeurs invalides

### 6. Rate Limiting Global (optionnel)
- Détection de flood (>10 soumissions/minute globalement)
- Log pour analyse

## Anonymat Préservé

Aucune donnée personnelle n'est stockée:
- Pas d'IP
- Pas de cookie de tracking
- Pas d'email
- Hash du profil uniquement (irréversible)

## Débogage

En local (localhost), un bouton "[Debug] Réinitialiser" apparaît pour tester plusieurs fois.
