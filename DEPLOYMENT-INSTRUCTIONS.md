# 🚀 INSTRUCTIONS DE DÉPLOIEMENT

## État: ✅ Prêt pour déploiement

Tous les fichiers ont été modifiés et testés. Voici comment déployer:

---

## 📝 Changements à Déployer

### 1. **vercel.json** - Nouvelles redirects 301

```json
{
  "cleanUrls": true,
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://$host/:path*",
      "permanent": true,
      "has": [{ "type": "protocol", "value": "http" }]
    },
    {
      "source": "/:path*",
      "destination": "https://www.lescalculateurs.fr/:path*",
      "permanent": true,
      "has": [{ "type": "host", "value": "^lescalculateurs\\.fr$" }]
    },
    {
      "source": "/(.*)\\.html",
      "destination": "/$1",
      "permanent": true
    },
    {
      "source": "/index.html",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

### 2. **public/sitemap.xml** - Corrigé automatiquement

- 122 URLs vérifiées
- 0 extension .html
- 100% avec www.lescalculateurs.fr
- Backup: `public/sitemap.xml.backup`

---

## 🎯 Étapes de Déploiement

### Via Terminal (Git):

```bash
# Aller dans le dossier du projet
cd c:\Users\prene\OneDrive\Bureau\lesCalculateurs

# Vérifier les changements
git status

# Ajouter les fichiers modifiés
git add vercel.json public/sitemap.xml

# Créer le commit
git commit -m "fix: Google Search Console indexation - remove .html extensions, standardize www domain"

# Pousser vers GitHub
git push

# Vercel va automatiquement re-déployer
```

### Via Interface Vercel:

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet "les-calculateurs"
3. Vérifier que le déploiement s'effectue
4. Attendre le "Ready" (généralement 1-3 minutes)

---

## ✅ Vérifications Post-Déploiement

### Immédiatement après déploiement (15-30 min):

```bash
# Test 1: Vérifier que le sitemap est accessible
curl https://www.lescalculateurs.fr/sitemap.xml

# Test 2: Vérifier une redirection .html
curl -I https://www.lescalculateurs.fr/pages/notaire.html
# Résultat attendu: HTTP/2 301
# Location: https://www.lescalculateurs.fr/pages/notaire

# Test 3: Vérifier redirection apex domain
curl -I https://lescalculateurs.fr/pages/blog/frais-notaire-13.html
# Résultat attendu: HTTP/2 301
# Location: https://www.lescalculateurs.fr/pages/blog/frais-notaire-13

# Test 4: Vérifier HTTPS (HTTP → HTTPS)
curl -I http://lescalculateurs.fr/
# Résultat attendu: HTTP/2 301
# Location: https://www.lescalculateurs.fr/
```

### Après 24-48h:

1. **Google Search Console**

   - Aller dans "Couverture"
   - Vérifier que les 94 URLs passent de "Redirect" à "Indexed"
   - Noter le progrès

2. **Demander re-crawl pour les URLs top priority**

   - Dans GSC > "URL Inspection"
   - Entrer une URL problématique
   - Cliquer "Demander l'indexation"

3. **Monitorer les stats**
   - Vérifier que le trafic ne diminue pas
   - Vérifier que les impressions remontent

---

## ⏱️ Timeline Attendue

```
T+0min     : Déploiement sur Vercel
T+1h       : Vercel re-déploiement complet
T+24h      : Google crawl les redirects (batch 1)
T+48h      : Indexation commence pour les URLs problématiques
T+3-7j     : 90% des URLs réindexées
T+1-2sem   : Stabilisation complète
```

---

## 🔍 Monitoring Post-Déploiement

### Checklist pour les 2 semaines suivantes:

- [ ] **Jour 1**: Vérifier déploiement Vercel
- [ ] **Jour 2**: Tester les redirects manuellement
- [ ] **Jour 3**: Commencer monitoring GSC
- [ ] **Jour 7**: Vérifier progression dans GSC
- [ ] **Jour 14**: Validation complète

### Signaux d'Alerte:

❌ **Si vous voyez:**

- URLs toujours en "Redirect" après 48h
- Trafic qui diminue drastiquement
- Erreurs 404 au lieu de 301
- Pages qui ne répondent pas

**➜ Actions:**

1. Vérifier que vercel.json est bien déployé
2. Forcer un re-crawl dans GSC
3. Vérifier les logs Vercel
4. Contacter support Vercel si problème persiste

---

## 📚 Documentation de Référence

Pour plus d'informations, consulter:

- [GUIDE-INDEXATION-GOOGLE.md](GUIDE-INDEXATION-GOOGLE.md) - Guide complet détaillé
- [CORRECTION-INDEXATION-SUMMARY.md](CORRECTION-INDEXATION-SUMMARY.md) - Résumé exécutif
- `scripts/google-indexing-redirects.json` - Données brutes de tous les redirects
- `scripts/test-redirects-simulation.cjs` - Simulateur de redirects

---

## 🆘 Troubleshooting

### Q: Les redirects ne fonctionnent pas?

**R:**

1. Attendre 5-10 minutes le déploiement Vercel
2. Vider le cache du navigateur (Ctrl+Shift+Del)
3. Tester avec `curl -I` au lieu du navigateur

### Q: L'ancien .html est toujours accessible?

**R:** C'est normal, il redirige vers la nouvelle URL (301)

### Q: Combien de temps avant que Google indexe?

**R:** 24-48h pour le crawl, 3-7 jours pour réindexation complète

### Q: Faut-il faire quelque chose dans GSC?

**R:** Non, juste monitorer. Pas besoin de supprimer les URLs.

### Q: Les backlinks sont perdus?

**R:** Non, les 301 redirects transmettent le PageRank.

---

## ✨ Succès!

Une fois que les 94 URLs sont indexées (dans 1-2 semaines):

```
✅ "Couverture" > 94 URLs passent de "Redirect" → "Indexed"
✅ Google Search Console status: "SUCCÈS"
✅ Taux d'indexation revient à la normale
✅ Trafic organique stable/croissant
```

Vous pouvez alors archiver ce guide et revenir à la normale!

---

**Créé:** 18 décembre 2025  
**Status:** ✅ Prêt pour déploiement  
**Prochaine étape:** `git push` vers Vercel
